"""Locate PDF headings across line wraps; partition text at headings, not pages.

The original PDF remains authoritative. No inferred empty sections are generated:
missing outline headings fail the build for inspection instead of disappearing.
"""
import unicodedata


def folded(text):
    chars, offsets = [], []
    for pos, char in enumerate(text):
        for unit in unicodedata.normalize('NFKD', char).casefold():
            if unit.isalnum():
                chars.append(unit)
                offsets.append(pos)
    return ''.join(chars), offsets


class ReaderSections:
    def __init__(self, pdf):
        self.pages = [p.get_text() for p in pdf]
        self.offsets = []
        cursor = 0
        for page in self.pages:
            self.offsets.append(cursor)
            cursor += len(page) + 1
        self.text = '\n'.join(self.pages)
        self.normalized = [folded(p) for p in self.pages]
        self.toc = pdf.get_toc(False)
        self.lines = []
        for page, raw in zip(pdf, self.pages):
            lines, cursor = [], 0
            for block in page.get_text('dict')['blocks']:
                for line in block.get('lines', []):
                    value = ''.join(span['text'] for span in line['spans'])
                    pos = raw.find(value, cursor)
                    if pos >= 0:
                        lines.append((pos, line['bbox'][1]))
                        cursor = pos + len(value)
            self.lines.append(lines)

    def locate(self, entry, after=0):
        page = entry['page']
        title = entry.get('source_title', entry['title'])
        needle, _ = folded(title)
        haystack, mapping = self.normalized[page]
        import bisect
        start = bisect.bisect_left(mapping, max(0, after - self.offsets[page]))
        positions = []
        pos = haystack.find(needle, start) if needle else -1
        while pos >= 0:
            positions.append(pos)
            pos = haystack.find(needle, pos + len(needle))
        if positions and 'toc_index' in entry:
            destination = self.toc[entry['toc_index']][3].get('to')
            if destination is not None:
                def distance(pos):
                    candidates = [y for offset, y in self.lines[page] if offset <= mapping[pos]]
                    return abs(candidates[-1] - destination.y) if candidates else float('inf')
                positions.sort(key=distance)
        pos = positions[0] if positions else -1
        if pos < 0 and title in {
            '14. Führende Mini-Definitionen für Hover, Glossar und CodeX',
            '7. Mindestanforderungen in Codex',
        }:
            # Historical privacy redaction removed the production label from
            # the PDF body, but preserved its outline and public chapter URL.
            return self.locate({**entry, 'title': title.rsplit(' ', 1)[0], 'source_title': title.rsplit(' ', 1)[0]}, after=after)
        if pos < 0 and title.startswith('Slide ') and title[6:].isdigit():
            return self.offsets[page], self.offsets[page]
        if pos < 0 and title == 'Leitfragen' and 'aktuelle T-SROI-Einordnung v1.1' in self.pages[page]:
            # The dated WÖMS erratum renamed this heading while retaining the
            # historical outline label. Resolve its documented equivalent.
            return self.locate({**entry, 'title': 'Prüffragen'}, after=after)
        if pos < 0:
            raise ValueError(f'PDF heading not found on page {page + 1}: {title}')
        # Outline destinations point at a specific page; repeated prose elsewhere
        # in the document must never become a section boundary.
        return self.offsets[page] + mapping[pos], self.offsets[page] + mapping[pos + len(needle) - 1] + 1

    def partition(self, chapters):
        starts = [self.locate(ch) for ch in chapters]
        if any(starts[i][0] >= starts[i+1][0] for i in range(len(starts)-1)):
            raise ValueError('PDF chapter boundaries are not strictly ordered')
        for index, chapter in enumerate(chapters):
            begin = starts[index][1]
            end = starts[index + 1][0] if index + 1 < len(starts) else len(self.text)
            subs = []
            cursor = begin
            for sub in chapter['subs']:
                span = self.locate(sub, after=cursor)
                subs.append((span, sub))
                cursor = span[1]
            if any(not (begin <= span[0] < span[1] <= end) for span, _ in subs):
                raise ValueError(f'Subsection outside chapter: {chapter["title"]}')
            if any(subs[i][0][0] >= subs[i+1][0][0] for i in range(len(subs)-1)):
                raise ValueError(f'Subsections not strictly ordered: {chapter["title"]}')
            blocks = [(None, self.text[begin:subs[0][0][0] if subs else end])]
            for j, (span, sub) in enumerate(subs):
                stop = subs[j+1][0][0] if j+1 < len(subs) else end
                blocks.append((sub['title'], self.text[span[1]:stop]))
            chapter['blocks'] = blocks

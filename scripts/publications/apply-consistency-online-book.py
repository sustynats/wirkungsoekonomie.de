"""Apply reviewed, paragraph-bound book corrections without replacing the import.

The original DOCX files remain immutable. All guards are checked before any
write. Existing block IDs, routes, surrounding markup and citation links remain.
Unknown source or online text aborts the complete operation.
"""
from pathlib import Path
import argparse, hashlib, html, json, re, unicodedata

ROOT = Path(__file__).resolve().parents[2]

def plain(value):
    return html.unescape(re.sub(r'<[^>]+>', '', value))

def normalized(value):
    value = unicodedata.normalize('NFKC', plain(value)).replace('\u00ad', '')
    return re.sub(r'\s+', ' ', value).strip()

def inline_text(value, current):
    # Preserve the actual existing destination for each source chip.
    links = {}
    for m in re.finditer(r'<a\b[^>]*>.*?</a>', current, re.S):
        key = plain(m[0]).strip()
        if re.fullmatch(r'\[[^\]]+\]', key):
            if key in links and links[key] != m[0]:
                raise RuntimeError('Ambiguous citation destination: ' + key)
            links[key] = m[0]
    if value.startswith('[I-K54-4]') and '[I-K55-4]' in links:
        links['[I-K54-4]'] = links['[I-K55-4]'].replace('I-K55-4', 'I-K54-4')
    escaped = html.escape(value, quote=False)
    return re.sub(r'\[[^\]]+\]', lambda m: links.get(m[0], m[0]), escaped)

def correct_block(source, entry, check=False):
    block_id = re.escape(entry['id'])
    if 'rowIndex' in entry:
        pattern = re.compile(r'(<div\b[^>]*\bid="' + block_id + r'"[^>]*>\s*<table>)(.*?)(</table>\s*</div>)', re.S)
    else:
        pattern = re.compile(r'(<(?P<tag>p|h[1-6])\b[^>]*\bid="' + block_id + r'"[^>]*>)(.*?)(</(?P=tag)>)', re.S)
    matches = list(pattern.finditer(source))
    if len(matches) != 1:
        raise RuntimeError(f"Expected one block: {entry['path']}#{entry['id']}, found {len(matches)}")
    m = matches[0]
    if 'rowIndex' in entry:
        rows = list(re.finditer(r'<tr\b[^>]*>.*?</tr>', m[2], re.S))
        row = rows[entry['rowIndex']]
        cells = list(re.finditer(r'(<td\b[^>]*>)(.*?)(</td>)', row[0], re.S))
        cell = cells[entry['cellIndex']]
        current = cell[2]
        begin = m.start(2) + row.start() + cell.start(2)
        end = m.start(2) + row.start() + cell.end(2)
    else:
        current = m[3]
        begin, end = m.start(3), m.end(3)
    if normalized(current) == normalized(entry['afterText']):
        return source, False
    if normalized(current) != normalized(entry['beforeText']):
        raise RuntimeError(f"Online source conflict: {entry['path']}#{entry['id']}")
    if check:
        raise RuntimeError(f"Unapplied correction: {entry['path']}#{entry['id']}")
    return source[:begin] + inline_text(entry['afterText'], current) + source[end:], True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    manifest_path = ROOT / 'content/grundlagen/online-book-corrections-20261011.json'
    manifest = json.loads(manifest_path.read_text())
    if manifest['status'] != 'PREPARED_REVIEWED' or manifest['pending']:
        raise RuntimeError('Online corrections still require review')
    entries = manifest['entries']
    sources = {e['source']: e['sourceSha256'] for e in entries}
    for name, expected in sources.items():
        original = ROOT / 'source-assets/originals/books-20261001' / name
        if hashlib.sha256(original.read_bytes()).hexdigest() != expected:
            raise RuntimeError('Original manuscript changed: ' + name)
    buffers = {}
    before_hashes = {}
    applied = []
    for e in entries:
        path = Path(e['path'])
        if not path.parts or path.parts[0] != 'referenz' or '..' in path.parts or path.suffix != '.html':
            raise RuntimeError('Invalid online correction target')
        if e['path'] not in buffers:
            buffers[e['path']] = (ROOT / path).read_text()
            before_hashes[e['path']] = hashlib.sha256(buffers[e['path']].encode()).hexdigest()
        buffers[e['path']], changed = correct_block(buffers[e['path']], e, args.check)
        if changed:
            applied.append(dict(path=e['path'], id=e['id'], row=e.get('rowIndex'), cell=e.get('cellIndex')))
    if not args.check:
        for path, content in buffers.items():
            if hashlib.sha256(content.encode()).hexdigest() != before_hashes[path]:
                (ROOT / path).write_text(content)
        report = dict(status='PASS', manifestSha256=hashlib.sha256(manifest_path.read_bytes()).hexdigest(),
                      reviewedTargets=len(entries), newlyApplied=len(applied), applied=applied,
                      files=[dict(path=p, beforeSha256=before_hashes[p], afterSha256=hashlib.sha256(s.encode()).hexdigest())
                             for p, s in buffers.items()], originalSources=sources)
        out = ROOT / 'reports/consistency-20261009/online-book-corrections.json'
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(dict(status='PASS', reviewedTargets=len(entries), newlyApplied=len(applied), files=len(buffers))))

if __name__ == '__main__':
    main()

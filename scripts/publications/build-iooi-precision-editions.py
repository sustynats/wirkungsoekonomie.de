#!/usr/bin/env python3
"""Dated IOOI supplement using the existing publication typography and PDF pipeline.

The three previously published reading editions (including their September
addenda) remain intact after the new, separately paginated supplement.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, NameObject, NumberObject, TextStringObject
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, PageBreak

ROOT = Path(__file__).resolve().parents[2]
DATE = '2026-10-01'
TAG = 'woek-iooi-praezisierung-2026-10-01'
OUT = ROOT / 'output/pdf/iooi-2026-10-01'
INPUT = ROOT / 'tmp/pdfs/iooi-originals'
SOURCE = 'content/site/iooi-precision-2026-10-01.json'
MANIFEST = ROOT / 'assets/data/iooi-precision-editions-2026-10-01.json'
spec = importlib.util.spec_from_file_location('publication_layout', ROOT / 'scripts/publications/build-site-review-pdfs.py')
layout = importlib.util.module_from_spec(spec)
spec.loader.exec_module(layout)


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Woek', 7.5)
    canvas.drawString(48, 29, 'Natalie Weber | Wirkungsökonomie | Präzisierung: 01.10.2026')
    canvas.drawRightString(A4[0] - 48, 29, str(doc.page))
    canvas.restoreState()


def main():
    data = json.loads((ROOT / SOURCE).read_text())
    historical = json.loads((ROOT / 'assets/data/site-review-pdf-editions.json').read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    P = layout.P
    story = [P('FACHLICHE PRÄZISIERUNG | 01.10.2026', 'fine'),
             P(escape(data['title']), 'h1'), P('Natalie Weber', 'fine'),
             P(escape(data['summary'])),
             P('Geltungsbereich', 'h2'),
             P('Datierte Ergänzung zum Buch Die neue Ordnung des Wohlstands sowie zu WÖMM 2.0, WÖMS 2.0 und den Dossiers zu Wirkungsermittlung und Impact Controlling. Historische Werktexte werden nicht still umgeschrieben. Frühere Ergänzungen bleiben mitzulesen. Im Buch betrifft die Präzisierung insbesondere Kapitel ' + ', '.join(map(str, data['chapterNumbers'])) + '.' )]
    for section in data['sections']:
        story.append(P(escape(section['title']), 'h2'))
        story.extend(P(escape(text)) for text in section['paragraphs'])
    story.extend([PageBreak(), P('Analyse und Berechnung konkretisieren', 'h1'),
                  P(escape(data['comparison']['caption']), 'fine'),
                  layout.table([data['comparison']['columns']] + data['comparison']['rows']),
                  P(escape(data['example']['title']), 'h2'), P(escape(data['example']['notice']), 'fine'),
                  layout.table([['Bezug', 'Wert', 'Bedeutung']] + data['example']['rows']),
                  P(escape(data['example']['conclusion'])), P('Quellen und Geltungsgrenze', 'h2')])
    for source in data['sources']:
        story.extend([P(escape(source['title']), 'h3'), P(escape(source['role'])),
                      P('<a href="' + escape(source['url']) + '">' + escape(source['url']) + '</a>', 'fine')])
    story.append(P('Die externen Quellen belegen Anschlussmethoden, keinen empirisch gemessenen Qualitätsvorsprung der WÖk. Aktuelle Einordnung: https://wirkungsoekonomie.de/referenz/aktualisierung/#praezisierung-20261001', 'fine'))
    filename = 'woek-iooi-methodische-praezisierung-2026-10-01.pdf'
    SimpleDocTemplate(str(OUT / filename), pagesize=A4, leftMargin=48, rightMargin=48,
                      topMargin=48, bottomMargin=58, title=data['title'], author=data['author'],
                      subject='Datierte methodische Präzisierung zu Buch und Fachpapieren',
                      pageCompression=1, invariant=1).build(story, onFirstPage=footer, onLaterPages=footer)
    records = []

    def record(name, title, kind, **extra):
        file = OUT / name
        records.append(dict(filename=name, title=title, kind=kind, date=DATE,
                            url=f'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/{TAG}/{name}',
                            sha256=sha(file), bytes=file.stat().st_size, pages=len(PdfReader(file).pages), **extra))

    record(filename, data['title'], 'addendum')
    update = PdfReader(OUT / filename)
    count = len(update.pages)
    for previous_name in ['die-neue-ordnung-des-wohlstands-lesefassung-2026-09-05.pdf',
                          'woemm-2-0-lesefassung-2026-09-05.pdf', 'woems-2-0-lesefassung-2026-09-05.pdf']:
        previous = next(item for item in historical['files'] if item['filename'] == previous_name)
        source_file = INPUT / previous_name
        assert sha(source_file) == previous['sha256'], 'Previous release hash mismatch: ' + previous_name
        reader = PdfReader(source_file)
        writer = PdfWriter()
        writer.clone_document_from_reader(reader)
        writer.merge(0, update, import_outline=False)
        labels = ArrayObject([NumberObject(0), DictionaryObject({NameObject('/S'): NameObject('/D'), NameObject('/P'): TextStringObject('IOOI-20261001-')})])
        old_labels = reader.trailer['/Root'].get('/PageLabels')
        old_nums = old_labels.get_object().get('/Nums', []) if old_labels else []
        for index in range(0, len(old_nums), 2):
            labels.extend([NumberObject(int(old_nums[index]) + count), old_nums[index + 1].get_object().clone(writer)])
        if not old_nums:
            labels.extend([NumberObject(count), DictionaryObject({NameObject('/S'): NameObject('/D'), NameObject('/St'): NumberObject(1)})])
        writer._root_object[NameObject('/PageLabels')] = DictionaryObject({NameObject('/Nums'): labels})
        writer.add_outline_item('IOOI: Fachliche Präzisierung vom 1. Oktober 2026', 0)
        writer.add_metadata({'/Title': previous['title'], '/Author': data['author'], '/WOEKSiteRevision': DATE,
                             '/WOEKPreviousEditionSha256': previous['sha256'],
                             '/Subject': 'Lesefassung mit datierter IOOI-Ergänzung; frühere Werkseiten und Ergänzungen bleiben erhalten'})
        name = previous_name.replace('2026-09-05', DATE)
        with (OUT / name).open('wb') as stream:
            writer.write(stream)
        check = PdfReader(OUT / name)
        assert len(check.pages) == len(reader.pages) + count
        # Verify every retained page's content stream, not just sampled text.
        for index, original_page in enumerate(reader.pages):
            original = original_page.get_contents()
            retained = check.pages[index + count].get_contents()
            assert (original.get_data() if original else b'') == (retained.get_data() if retained else b''), (name, index)
        record(name, previous['title'], 'reading-edition', source=previous['source'],
               sourceSha256=previous['sourceSha256'], originalPages=previous['originalPages'],
               updatePages=previous['updatePages'] + count, supersedes=previous_name,
               previousSha256=previous['sha256'], previousPages=previous['pages'], retainedPagesVerified=len(reader.pages))
    sources = [SOURCE, 'scripts/publications/build-iooi-precision-editions.py', 'scripts/publications/build-site-review-pdfs.py']
    MANIFEST.write_text(json.dumps(dict(reviewedAt=DATE, releaseTag=TAG, files=records,
                                       sourceHashes={source: sha(ROOT / source) for source in sources}), ensure_ascii=False, indent=2) + '\n')
    (OUT / 'SHA256SUMS.txt').write_text(''.join(item['sha256'] + '  ' + item['filename'] + '\n' for item in records))
    print(json.dumps({'outputs': len(records), 'supplementPages': count, 'retainedPagesVerified': sum(item.get('retainedPagesVerified', 0) for item in records)}))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Assemble the two source-corrected, rendered and visually reviewed volumes.

No cover is added and no old page is patched. Every delivered page must have
the same pixels as its reviewed input page; printed volume numbering survives.
"""
from pathlib import Path
import argparse
import hashlib
import json
import os
import shutil
import tempfile
from datetime import date
import pymupdf
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
EDITION_DATE = date.fromisoformat(json.loads((ROOT / 'content/grundlagen/book-corrections-20261009.json').read_text())['date']).isoformat()
REVISION = f'{EDITION_DATE}-books-source-consistency'
DESTINATION = ROOT / 'assets/pdf/die-neue-ordnung-des-wohlstands.pdf'
OUT = ROOT / f'outputs/consistency-{EDITION_DATE}/pdf'
MANIFEST = ROOT / 'content/grundlagen/book-publication-current.json'
HISTORICAL_SHA = 'fdb961e70f0929b636d1847fb7862daa74770d54455c8ffa8010ff0adc829e8d'
HISTORICAL = ROOT / 'source-assets/originals/mainwork-2026-08-02/die-neue-ordnung-des-wohlstands-lesefassung.pdf'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load(path):
    return json.loads(Path(path).read_text())


def validate_current(path):
    data = load(MANIFEST)
    reader = path if isinstance(path, PdfReader) else PdfReader(path)
    reader.stream.seek(0)
    actual = hashlib.sha256(reader.stream.read()).hexdigest()
    reader.stream.seek(0)
    if data['revision'] != REVISION or actual != data['combined']['sha256']:
        raise RuntimeError('Unbekannte oder veränderte Buchausgabe; erneute Quellen- und Sichtprüfung erforderlich.')
    review = load(ROOT / data['visualReview']['path'])
    if review['status'] != 'PASS' or sha(ROOT / data['visualReview']['path']) != data['visualReview']['sha256']:
        raise RuntimeError('Buchausgabe ist nicht an die bestandene Sichtprüfung gebunden.')
    for entry in data['volumes']:
        if sha(ROOT / entry['docx']) != entry['docxSha256']:
            raise RuntimeError('Geprüfte Manuskriptquelle wurde verändert: ' + entry['docx'])
        proof = next(x for x in review['pdfs'] if x['volume'] == entry['volume'])
        if proof['pdfSha256'] != entry['sha256'] or proof['visualPageCoverage'] != entry['pages']:
            raise RuntimeError('Unvollständige oder anders gebundene Band-Sichtprüfung.')
    if sha(HISTORICAL) != HISTORICAL_SHA:
        raise RuntimeError('Historische bisherige Lesefassung wurde verändert.')
    if len(reader.pages) != data['combined']['pages'] or reader.metadata.get('/WOEKSourceRevision') != REVISION:
        raise RuntimeError('Seitenzahl oder Quellrevision der gelieferten Ausgabe stimmt nicht.')
    if reader.metadata.get('/Author') != 'Natalie Weber':
        raise RuntimeError('Autorin der Buchausgabe stimmt nicht.')
    return data


def assemble(inputs):
    review_path = ROOT / 'reports/consistency-20261009/book-pdf-visual-review.json'
    review = load(review_path)
    if review['status'] != 'PASS':
        raise RuntimeError('Sichtprüfung nicht bestanden.')
    sources = load(ROOT / 'reports/consistency-20261009/book-source-build.json')
    volumes = []
    for volume, path in zip(('I', 'II'), inputs):
        proof = next(x for x in review['pdfs'] if x['volume'] == volume)
        source = next(x for x in sources if x['volume'] == volume)
        if sha(path) != proof['pdfSha256'] or sha(ROOT / source['output']) != source['outputSha256']:
            raise RuntimeError('Band oder Manuskript stimmt nicht mit der geprüften Fassung überein.')
        volumes.append(dict(volume=volume, sha256=sha(path), pages=proof['pages'],
                            docx=source['output'], docxSha256=source['outputSha256'],
                            filename=f'die-neue-ordnung-des-wohlstands-band-{volume.lower()}-{EDITION_DATE}.pdf'))
    if not HISTORICAL.exists():
        if sha(DESTINATION) != HISTORICAL_SHA:
            raise RuntimeError('Bisherige Lesefassung hat einen unbekannten Quellstand; kein Überschreiben.')
        HISTORICAL.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(DESTINATION, HISTORICAL)
    if sha(HISTORICAL) != HISTORICAL_SHA:
        raise RuntimeError('Historische Sicherung stimmt nicht.')
    OUT.mkdir(parents=True, exist_ok=True)
    writer = PdfWriter()
    offset = 0
    for entry, path in zip(volumes, inputs):
        reader = PdfReader(path)
        if len(reader.pages) != entry['pages']:
            raise RuntimeError('Band-Seitenzahl stimmt nicht.')
        writer.append(reader, outline_item='Band ' + entry['volume'], import_outline=True)
        writer.set_page_label(offset, offset + entry['pages'] - 1, style='/D', prefix='Band ' + entry['volume'] + ' - ', start=1)
        offset += entry['pages']
        volume_target = OUT / entry['filename']
        # The publishing copies are already written to this directory by the
        # preceding metadata step. Reusing them as assembler inputs must be
        # idempotent and must not fail merely because source and target are
        # the same file.
        if Path(path).resolve() != volume_target.resolve():
            shutil.copy2(path, volume_target)
    writer.add_metadata({'/Title': 'Die neue Ordnung des Wohlstands - Band I und II',
                         '/Author': 'Natalie Weber', '/Creator': 'Institut für Wirkungsökonomie',
                         '/Producer': 'Institut für Wirkungsökonomie',
                         '/Subject': 'Bereinigte Lesefassung des Wirtschafts- und Gesellschaftsmodells; Entwurf',
                         '/WOEKSourceRevision': REVISION})
    filename = f'die-neue-ordnung-des-wohlstands-konsistenz-{EDITION_DATE}.pdf'
    combined = OUT / filename
    with tempfile.NamedTemporaryFile(dir=OUT, suffix='.pdf', delete=False) as f:
        temporary = Path(f.name)
        writer.write(f)
    try:
        result = pymupdf.open(temporary)
        page_offset = 0
        for entry, path in zip(volumes, inputs):
            source_pdf = pymupdf.open(path)
            for index, page in enumerate(source_pdf):
                before = page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
                after = result[page_offset + index].get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
                if before.width != after.width or before.height != after.height or before.samples != after.samples:
                    raise RuntimeError(f'Lieferseite verändert: Band {entry["volume"]}, Seite {index + 1}')
            source_pdf.close()
            page_offset += entry['pages']
        result.close()
        os.replace(temporary, combined)
    finally:
        temporary.unlink(missing_ok=True)
    manifest = dict(revision=REVISION, date=EDITION_DATE, status='reviewed-reading-edition-draft',
                    volumes=volumes, combined=dict(filename=filename, sha256=sha(combined), pages=offset,
                                                  bytes=combined.stat().st_size, deliveryPath=str(DESTINATION.relative_to(ROOT))),
                    visualReview=dict(path=str(review_path.relative_to(ROOT)), sha256=sha(review_path)),
                    historical=dict(path=str(HISTORICAL.relative_to(ROOT)), sha256=HISTORICAL_SHA,
                                    label='Bisherige 1.250-seitige Lesefassung mit T-SROI-Erratum vom 2. August 2026'),
                    deliveryPixelComparison=dict(status='PASS', pages=offset, dpi=72))
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    validate_current(combined)
    shutil.copy2(combined, DESTINATION)
    print(f'PASS: {offset} tatsächlich überarbeitete und geprüfte Seiten; alle Lieferseiten pixelidentisch.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--band-i', type=Path)
    parser.add_argument('--band-ii', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        validate_current(DESTINATION)
        print('PASS: aktuelle Buchausgabe an Manuskripte, Sichtprüfung, Lieferseiten und historisches Original gebunden.')
    elif args.band_i and args.band_ii:
        assemble([args.band_i, args.band_ii])
    else:
        parser.error('--band-i und --band-ii oder --check erforderlich')

#!/usr/bin/env python3
"""Dated Methodik PDF from the shared authored page, retaining its predecessor."""
from pathlib import Path
import argparse, datetime, hashlib, importlib.util, json, re, shutil, subprocess, unicodedata
from zoneinfo import ZoneInfo
from reportlab.lib.pagesizes import A4
from reportlab.platypus import Paragraph, SimpleDocTemplate
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
DATE = '2026-10-16'
RELEASE = 'woek-methodik-2026-10-16'
MANIFEST = ROOT / 'assets/data/methodik-edition-2026-10-16.json'
OUT = ROOT / 'outputs/methodik-20261016/pdf'
SOURCE = ROOT / 'source-assets/generated/methodik-20261016/pdf'
INPUTS = ['content/site/methodik.json', 'content/site/methodik.inc',
          'scripts/site/build-methodik-explainer.mjs', 'scripts/publications/build-methodik-edition.py',
          'scripts/publications/build-site-review-pdfs.py']

spec = importlib.util.spec_from_file_location('existing_publication_export', ROOT / INPUTS[-1])
export = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def norm(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text)).replace('•', '')

def paragraphs(item):
    if isinstance(item, Paragraph):
        yield item.getPlainText()
    elif hasattr(item, '_cellvalues'):
        for row in item._cellvalues:
            for cell in row:
                for value in cell if isinstance(cell, (list, tuple)) else [cell]:
                    yield from paragraphs(value)
    elif hasattr(item, '_content'):
        for value in item._content:
            yield from paragraphs(value)

def authored_story():
    html = subprocess.check_output(['node', 'scripts/site/build-methodik-explainer.mjs', '--pdf-source'], cwd=ROOT, text=True)
    # Explanatory disclosure content is expanded in print, unlike browser controls.
    html = re.sub(r'<details\b[^>]*>', '<section>', html).replace('</details>', '</section>')
    html = re.sub(r'<summary\b[^>]*>', '<h3>', html).replace('</summary>', '</h3>')
    data = json.loads((ROOT / INPUTS[0]).read_text())
    parser = export.PrintContent('https://wirkungsoekonomie.de/methodik/', data['process'])
    parser.feed(html)
    return data, parser.story

def verify_pdf(path, story):
    reader = PdfReader(path)
    text = norm(' '.join(page.extract_text() for page in reader.pages))
    expected = [s for item in story for s in paragraphs(item) if len(norm(s)) > 12]
    missing = [s for s in expected if norm(s) not in text]
    if missing:
        raise ValueError('Authored content missing from PDF: ' + repr(missing[:4]))
    metadata = reader.metadata
    assert metadata.author == 'Natalie Weber'
    assert metadata.creator == metadata.producer == 'Institut für Wirkungsökonomie'
    assert not any(re.search(r'OpenAI|ChatGPT|Codex|Claude|ReportLab|PyMuPDF|Python', str(v), re.I)
                   for v in metadata.values())
    return {'status': 'PASS', 'sha256': sha(path), 'pages': len(reader.pages),
            'authored_paragraphs_and_cells_verified': len(expected),
            'author': metadata.author, 'creator': metadata.creator, 'producer': metadata.producer,
            'expanded_explanatory_details': True}

def main():
    args = argparse.ArgumentParser()
    args.add_argument('--check', action='store_true')
    check = args.parse_args().check
    if check:
        manifest = json.loads(MANIFEST.read_text())
        data, story = authored_story()
        result = verify_pdf(ROOT / manifest['files'][0]['source'], story)
        assert result['sha256'] == manifest['files'][0]['sha256']
        for name, expected in manifest['sourceHashes'].items():
            assert sha(ROOT / name) == expected, name
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    OUT.mkdir(parents=True, exist_ok=True)
    SOURCE.mkdir(parents=True, exist_ok=True)
    data, story = authored_story()
    filename = data['pdfEdition']
    raw = OUT / ('draft-' + filename)
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(export.GREEN)
        canvas.line(48, 43, A4[0] - 48, 43)
        canvas.setFont('Woek', 7.5)
        canvas.setFillColor(export.NAVY)
        canvas.drawString(48, 29, 'Institut für Wirkungsökonomie | Methodik | 16.10.2026')
        canvas.drawRightString(A4[0] - 48, 29, str(doc.page))
        canvas.restoreState()
    intro = export.P('INSTITUT FÜR WIRKUNGSÖKONOMIE | NATALIE WEBER | 16.10.2026', 'fine')
    SimpleDocTemplate(str(raw), pagesize=A4, rightMargin=48, leftMargin=48,
                      topMargin=48, bottomMargin=58, title=data['title'], author='Natalie Weber',
                      creator='Institut für Wirkungsökonomie').build([intro, *story], onFirstPage=footer, onLaterPages=footer)
    now = datetime.datetime.now(ZoneInfo('Europe/Berlin'))
    offset = now.strftime('%z')
    stamp = now.strftime('D:%Y%m%d%H%M%S') + offset[:3] + "'" + offset[3:] + "'"
    writer = PdfWriter(clone_from=raw)
    writer.add_metadata({'/Title': data['title'], '/Author': 'Natalie Weber',
                         '/Creator': 'Institut für Wirkungsökonomie', '/Producer': 'Institut für Wirkungsökonomie',
                         '/Subject': 'Wissenschaftliche Grundlagen, Modelle, Vorgehen und menschliche Verantwortung',
                         '/CreationDate': stamp, '/ModDate': stamp})
    destination = SOURCE / filename
    writer.write(destination)
    shutil.copyfile(destination, OUT / filename)
    raw.unlink()
    # ReportLab consumes some flowable containers while paginating. Reparse for coverage.
    data, story = authored_story()
    result = verify_pdf(destination, story)
    previous = json.loads((ROOT / 'assets/data/site-review-pdf-editions.json').read_text())
    predecessor = next(item for item in previous['files'] if item['filename'] == 'woek-methodik-integration-2026-09-05.pdf')
    source_successions = {}
    for name in INPUTS[:2]:
        archive = 'source-assets/history/methodik-20261016/' + Path(name).name
        assert sha(ROOT / archive) == previous['sourceHashes'][name], name
        source_successions[name] = {'archive': archive, 'predecessorSha256': sha(ROOT / archive), 'currentSha256': sha(ROOT / name)}
    manifest = {'reviewedAt': DATE, 'releaseTag': RELEASE,
                'sourceHashes': {name: sha(ROOT / name) for name in INPUTS},
                'sourceSuccessions': source_successions,
                'visualReview': 'reports/methodik-20261016/pdf-visual-review.json',
                'sourceReview': 'reports/methodik-20261016/pdf-source-verification.json',
                'files': [{'filename': filename, 'title': data['title'], 'kind': 'explainer',
                           'source': str(destination.relative_to(ROOT)), 'sha256': result['sha256'],
                           'bytes': destination.stat().st_size, 'pages': result['pages'],
                           'supersedes': predecessor['filename'],
                           'url': 'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/' + RELEASE + '/' + filename}]}
    web_source = 'scripts/site/build-reference-update.mjs'
    web_archive = 'source-assets/history/methodik-20261016/build-reference-update.mjs'
    guide = json.loads((ROOT / 'assets/data/guide-reading-edition-2026-10-12.json').read_text())
    guide_archive = 'source-assets/history/methodik-20261016/build-reference-update-20261012.mjs'
    assert sha(ROOT / guide_archive) == guide['sources'][web_source]
    manifest['webProjection'] = {'source': web_source, 'archive': web_archive,
        'beforeSha256': sha(ROOT / web_archive), 'afterSha256': sha(ROOT / web_source),
        'guideArchive': guide_archive, 'guideSha256': sha(ROOT / guide_archive),
        'scope': 'Only the PDF access cards and their edition dates; reference prose and PDF inputs retained',
        'unchangedPdfInputs': {name: sha(ROOT / name) for name in
            ['content/site/reference-update.json', 'scripts/publications/build-guide-reference-pdf.py']}}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (OUT / 'pdf-source-verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    source_review = ROOT / manifest['sourceReview']
    source_review.parent.mkdir(parents=True, exist_ok=True)
    source_review.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()

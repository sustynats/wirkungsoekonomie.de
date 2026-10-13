"""Verify every retained source value and PDF publishing metadata.

The content report supplements, and never substitutes for, visual review.
"""
from pathlib import Path
import hashlib, importlib.util, json, re
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / 'reports/consistency-20261009/guide-reading-build.json'
SOURCE = ROOT / 'content/grundlagen/guide-public-reading-v1.8-20261012.json'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def canonical(text):
    return re.sub(r'\s+', '', text).translate(str.maketrans({
        '\u2010':'-', '\u2011':'-', '\u2013':'-', '\u2014':'-'}))

def main():
    build = json.loads(BUILD.read_text())
    source = json.loads(SOURCE.read_text())
    pdf = ROOT / build['pdf']
    if digest(SOURCE) != build['sourceSha256'] or digest(pdf) != build['pdfSha256']:
        raise RuntimeError('Reading source or PDF changed; rebuild before checking')
    if digest(ROOT / build['onlineSource']) != build['onlineSourceSha256']:
        raise RuntimeError('Online and PDF reading editions do not share the same source')
    body, outside = [], []
    with pymupdf.open(pdf) as document:
        for number, page in enumerate(document, 1):
            text = page.get_text()
            footer = 'Natalie Weber | Begriffsleitfaden v1.8 | Lesefassung 12.10.2026'
            text = text.replace(footer+'\n'+str(number)+'\n', '')
            body.append(text)
            for word in page.get_text('words'):
                if word[0] < -.1 or word[1] < -.1 or word[2] > page.rect.width+.1 or word[3] > page.rect.height+.1:
                    outside.append({'page':number, 'word':word[4]})
        pages = len(document)
    combined = canonical('\n'.join(body))
    missing, checked = [], 0
    for unit in source['units']:
        values = [value for row in unit['rows'] for value in row] if unit['type'] == 'table' else [unit['text']]
        for index, value in enumerate(values):
            checked += 1
            if canonical(value) not in combined:
                missing.append({'sourceIndex':unit['sourceIndex'], 'cell':index, 'text':value})
    metadata = load_module(ROOT/'scripts/quality/check-pdf-publishing-metadata.py', 'publishing_metadata').correct(pdf)
    hidden = load_module(ROOT/'scripts/quality/audit-pdf-hidden-production-metadata.py', 'hidden_metadata').inspect_pdf(pdf)
    marks = re.findall(r'CodeX|ChatGPT|OpenAI|\bClaude\b|Migrationsmatrix|commitgebunden|AGENTS\.md|interne KI|Redaktionsregeln|Qualitätsgate|Erstellt mit KI|KI-generiert', '\n'.join(body), re.I)
    failed = bool(missing or outside or metadata['issues'] or hidden['findings'] or marks or pages != build['pages'])
    report = dict(status='FAIL' if failed else 'PASS', pdfSha256=build['pdfSha256'],
                  sourceSha256=build['sourceSha256'], onlineSourceSha256=build['onlineSourceSha256'],
                  pages=pages, sourceValuesChecked=checked, missing=missing, outsidePage=outside,
                  metadata=metadata, hiddenMetadata=hidden, productionBodyCandidates=marks,
                  scope='Source completeness, geometry and metadata; separate visual review required')
    (ROOT/'reports/consistency-20261009/guide-reading-content-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({key:report[key] for key in ('status','pdfSha256','pages','sourceValuesChecked','missing','outsidePage','productionBodyCandidates')},ensure_ascii=False))
    if failed:
        raise SystemExit(1)

if __name__ == '__main__':
    main()

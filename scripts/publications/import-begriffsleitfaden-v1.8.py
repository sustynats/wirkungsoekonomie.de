"""Install the complete, source-bound and visually reviewed v1.8 reading edition."""
from pathlib import Path
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[2]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    build = json.loads((ROOT/'reports/consistency-20261009/guide-reading-build.json').read_text())
    review = json.loads((ROOT/'reports/consistency-20261009/guide-reading-visual-review.json').read_text())
    checked = json.loads((ROOT/'reports/consistency-20261009/guide-reading-content-check.json').read_text())
    source_path = ROOT/'content/grundlagen/guide-public-reading-v1.8-20261012.json'
    source = json.loads(source_path.read_text())
    original = ROOT/'source-assets/originals/WOeK_Begriffsleitfaden_v1.8_2026-10-01.pdf'
    online = ROOT/build['onlineSource']
    target = ROOT/'public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.8.pdf'
    pdf = ROOT/build['pdf']
    if not pdf.exists():
        pdf = target
    if build['primarySha256'] != 'f08258822e45066cc9a5870bad6056a051633b971e5f3fddb5f199360b1de75a':
        raise RuntimeError('Unknown primary guide checksum')
    # The unfiltered primary PDF remains in the private archive. Public CI
    # verifies the complete authored reading source and its reviewed PDF;
    # it does not need to publish the original production records.
    if original.exists() and digest(original) != build['primarySha256']:
        raise RuntimeError('Private primary guide changed; no overwrite')
    if source['sourceSha256'] != build['primarySha256'] or digest(source_path) != build['sourceSha256']:
        raise RuntimeError('Primary guide or reading source changed; no overwrite')
    if digest(pdf) != build['pdfSha256'] or digest(online) != build['onlineSourceSha256']:
        raise RuntimeError('PDF or online reading edition changed; no overwrite')
    for proof in (review, checked):
        if proof['status'] != 'PASS' or proof['pdfSha256'] != build['pdfSha256'] or proof['sourceSha256'] != build['sourceSha256']:
            raise RuntimeError('Current reading edition lacks its complete content and visual review')
    if review['reviewedPages'] != list(range(1,build['pages']+1)):
        raise RuntimeError('Incomplete page review')
    target.parent.mkdir(parents=True,exist_ok=True)
    if pdf.resolve() != target.resolve():
        shutil.copy2(pdf,target)
    (ROOT/'content/documents/online/woek-begriffsleitfaden-fuehrend.inc').write_bytes(online.read_bytes())
    markdown = []
    for unit in source['units']:
        if unit['type'] == 'table':
            rows = [[cell.replace('|','\\|') for cell in row] for row in unit['rows']]
            markdown.append('| '+' | '.join(rows[0])+' |')
            markdown.append('| '+' | '.join(['---']*len(rows[0]))+' |')
            markdown.extend('| '+' | '.join(row)+' |' for row in rows[1:])
        else:
            prefix = '# ' if unit['type']=='title' else '### ' if unit['type']=='heading' and unit['level']==3 else '## ' if unit['type']=='heading' else '- ' if unit['type']=='bullet' else ''
            markdown.append(prefix+unit['text'])
        markdown.append('')
    (ROOT/'source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.8.md').write_text('\n'.join(markdown))
    manifest = dict(version='1.8',primaryDate='2026-10-01',readingDate='2026-10-12',author='Natalie Weber',
                    pdf=str(target.relative_to(ROOT)),pdfSha256=build['pdfSha256'],pages=build['pages'],
                    primaryArchiveVisibility='private',primarySha256=build['primarySha256'],
                    source=str(source_path.relative_to(ROOT)),sourceSha256=build['sourceSha256'],
                    onlineSource=build['onlineSource'],onlineSourceSha256=build['onlineSourceSha256'],
                    visualReview='reports/consistency-20261009/guide-reading-visual-review.json',
                    visualReviewSha256=digest(ROOT/'reports/consistency-20261009/guide-reading-visual-review.json'))
    (ROOT/'content/grundlagen/guide-publication-current.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('Verified v1.8 reading edition installed: '+str(build['pages'])+' complete pages; primary original preserved.')

if __name__ == '__main__':
    main()

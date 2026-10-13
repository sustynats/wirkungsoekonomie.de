"""Refresh existing TOC numbers from rendered headings, without changing routes.

Run after the first complete render, then render again. Ambiguous targets stop
the update; no guessed page numbers or copied historical pagination.
"""
from pathlib import Path
import re,json,argparse,unicodedata,hashlib,io
import xml.etree.ElementTree as ET
from zipfile import ZipFile
from docx import Document
import pymupdf
parser=argparse.ArgumentParser();parser.add_argument('docx');parser.add_argument('pdf');parser.add_argument('--report',required=True);parser.add_argument('--check',action='store_true');parser.add_argument('--source-build-report');args=parser.parse_args()
before_bytes=Path(args.docx).read_bytes()
digest=lambda data:hashlib.sha256(data).hexdigest()
doc=Document(args.docx);pdf=pymupdf.open(args.pdf)
def norm(text):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',text).casefold().replace('ß','ss'))
headings=[]
for number,page in enumerate(pdf,1):
    blocks=page.get_text('dict')['blocks']
    keys=[]
    for b in blocks:
        lines=[]
        for line in b.get('lines',[]):
            spans=line['spans']
            if max((s['size'] for s in spans),default=0)>=12:
                lines.append(''.join(s['text'] for s in spans))
        if lines:keys.append(norm(' '.join(lines)))
    headings.append((number,keys))
updates=[]
for i,p in enumerate(doc.paragraphs):
    if not p.style.name.lower().startswith('toc') or '\t' not in p.text:continue
    title,old=p.text.rsplit('\t',1)
    if not old.strip().isdigit():raise RuntimeError('Non-numeric TOC entry: '+title)
    key=norm(title)
    candidates=[n for n,keys in headings if key in keys]
    if len(candidates)!=1:raise RuntimeError(f'Ambiguous rendered TOC target {title!r}: {candidates}')
    page=str(candidates[0])
    # The existing final run is a tab and page number. Preserve template styles.
    texts=p._p.xpath('.//w:t')
    if not texts or texts[-1].text!=old:raise RuntimeError('Unexpected TOC XML')
    if old!=page:texts[-1].text=page
    updates.append({'paragraphIndex':i,'title':title,'oldPage':int(old),'newPage':int(page)})
if args.check and any(e['oldPage']!=e['newPage'] for e in updates):raise RuntimeError('TOC differs from final rendered pagination')
if not updates:raise RuntimeError('No existing TOC entries found')
after_bytes=before_bytes
changed=[entry for entry in updates if entry['oldPage']!=entry['newPage']]
source_report=None;source_entry=None
if args.source_build_report:
    source_report=json.loads(Path(args.source_build_report).read_text())
    matches=[entry for entry in source_report if Path(entry['output']).resolve()==Path(args.docx).resolve()]
    if len(matches)!=1 or matches[0]['outputSha256']!=digest(before_bytes):raise RuntimeError('DOCX differs from its current source-build proof')
    source_entry=matches[0]
if not args.check and changed:
    buffer=io.BytesIO();doc.save(buffer);after_bytes=buffer.getvalue()
    with ZipFile(io.BytesIO(before_bytes)) as before,ZipFile(io.BytesIO(after_bytes)) as after:
        if set(before.namelist())!=set(after.namelist()):raise RuntimeError('TOC refresh changed DOCX members')
        if any(before.read(name)!=after.read(name) for name in before.namelist() if name!='word/document.xml'):raise RuntimeError('TOC refresh changed another DOCX member')
        roots=[ET.fromstring(archive.read('word/document.xml')) for archive in (before,after)]
        ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        for root,key in zip(roots,['oldPage','newPage']):
            paragraphs=root.find('w:body',ns).findall('w:p',ns)
            for entry in changed:
                text=paragraphs[entry['paragraphIndex']].findall('.//w:t',ns)[-1]
                if text.text!=str(entry[key]):raise RuntimeError('Unexpected TOC page-number mutation')
                text.text='VERIFIED_RENDERED_TOC_PAGE'
        if ET.tostring(roots[0])!=ET.tostring(roots[1]):raise RuntimeError('TOC refresh changed text or layout beyond verified page numbers')
    Path(args.docx).write_bytes(after_bytes)
proof={'status':'PASS','sourcePdfPages':len(pdf),'sourcePdfSha256':digest(Path(args.pdf).read_bytes()),'docxBeforeSha256':digest(before_bytes),'docxAfterSha256':digest(after_bytes),'onlyVerifiedPageNumbersChanged':True,'changedEntries':len(changed),'entries':updates}
Path(args.report).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
if source_entry is not None and not args.check:
    source_entry['outputSha256']=digest(after_bytes)
    source_entry['tocRefresh']={'proof':args.report,'proofSha256':digest(Path(args.report).read_bytes()),'beforeSha256':digest(before_bytes),'renderedPdfSha256':proof['sourcePdfSha256'],'verifiedEntries':len(updates)}
    Path(args.source_build_report).write_text(json.dumps(source_report,ensure_ascii=False,indent=2)+'\n')
print(f'{len(updates)} existing TOC entries verified against actual rendered headings.')

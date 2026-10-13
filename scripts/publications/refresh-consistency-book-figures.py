"""Refresh reviewed diagrams while retaining the actual final DOCX pagination.

Only known generated media bytes may change. Every other ZIP member, including
paragraphs, tables, TOC fields, relationships and metadata, stays byte-identical.
The original source manuscript is always verified and never edited.
"""
from pathlib import Path
from zipfile import ZipFile
import argparse,json,hashlib,os

ROOT=Path(__file__).resolve().parents[2]
def sha(data):return hashlib.sha256(data).hexdigest()
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--volume',choices=['I','II'],required=True);args=parser.parse_args()
    source_report=ROOT/'reports/consistency-20261009/book-source-build.json'
    reports=json.loads(source_report.read_text());record=next(e for e in reports if e['volume']==args.volume)
    original=ROOT/record['source'];output=ROOT/record['output']
    if sha(original.read_bytes())!=record['sourceSha256']:raise RuntimeError('Original manuscript changed')
    figures=json.loads((ROOT/'reports/consistency-20261009/book-figure-build.json').read_text())
    desired={f'word/media/{p["media"]}':e for e in figures for p in e['placements'] if p['volume']==args.volume}
    with ZipFile(output) as archive:
        members={name:archive.read(name) for name in archive.namelist()}
        entries=archive.infolist()
    replacements={};expected=record['correctedImages']
    for name,e in desired.items():
        before=sha(members[name]);data=(ROOT/e['image']).read_bytes()
        if sha(data)!=e['sha256']:raise RuntimeError('Unknown replacement diagram')
        if before not in {expected[name],e['sha256']}:raise RuntimeError('Unknown generated DOCX media: '+name)
        if before!=e['sha256']:replacements[name]=data
    before_docx=sha(output.read_bytes())
    if replacements:
        temp=output.with_suffix('.figures.tmp')
        with ZipFile(temp,'w') as archive:
            for info in entries:archive.writestr(info,replacements.get(info.filename,members[info.filename]))
        with ZipFile(temp) as archive:
            for name,data in members.items():
                if name not in replacements and archive.read(name)!=data:raise RuntimeError('Non-target DOCX content changed')
        os.replace(temp,output)
    record['outputSha256']=sha(output.read_bytes())
    record['correctedImages']={name:e['sha256'] for name,e in desired.items()}
    record['finalDiagramRefresh']=dict(beforeDocxSha256=before_docx,afterDocxSha256=record['outputSha256'],
        changedMedia=list(replacements),preservedNonTargetMembers=len(members)-len(replacements),
        paragraphTableTocAndMetadataXmlUnchanged=True)
    source_report.write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(record['finalDiagramRefresh']))
if __name__=='__main__':main()

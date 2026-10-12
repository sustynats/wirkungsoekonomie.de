"""Check delivered WÖk PDFs; correct publishing metadata without page edits."""
from pathlib import Path
import argparse,json,hashlib,re
import pymupdf
import xml.etree.ElementTree as ET

PUBLISHER='Institut für Wirkungsökonomie'
AUTHOR='Natalie Weber'
TOOL=re.compile(r'OpenAI|ChatGPT|\bCodex\b|\bClaude\b|Anthropic|(?:AI|KI)[- ](?:generated|generiert|erstellt)',re.I)
ACCEPTED={AUTHOR,PUBLISHER,PUBLISHER+' / '+AUTHOR}

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def info_fields(document):
    kind,value=document.xref_get_key(-1,'Info')
    if kind!='xref':return None,{}
    xref=int(value.split()[0])
    return xref,{key:document.xref_get_key(xref,key) for key in document.xref_get_keys(xref)}
DC_CREATOR='{http://purl.org/dc/elements/1.1/}creator'
RDF_LI='{http://www.w3.org/1999/02/22-rdf-syntax-ns#}li'
def xmp_authors(xmp):
    if not xmp:return []
    tree=ET.fromstring(xmp)
    return [element.text.strip() for creator in tree.iter(DC_CREATOR)
            for element in creator.iter(RDF_LI) if element.text and element.text.strip()]
def correct_xmp_authors(xmp):
    tree=ET.fromstring(xmp)
    for creator in tree.iter(DC_CREATOR):
        for element in creator.iter(RDF_LI):
            if element.text and element.text.strip() not in ACCEPTED:element.text=AUTHOR
    return ET.tostring(tree,encoding='unicode')
def correct(path,fix=False):
    document=pymupdf.open(path);metadata=document.metadata or {};xmp=document.get_xml_metadata()
    info_xref,raw_info=info_fields(document)
    issues=[]
    if metadata.get('author') not in ACCEPTED:issues.append('publication-author')
    polluted=[key for key,value in metadata.items() if value and TOOL.search(str(value))]
    if polluted:issues.append('production-tool-metadata')
    if TOOL.search(xmp):issues.append('production-tool-xmp')
    if any(author not in ACCEPTED for author in xmp_authors(xmp)):issues.append('publication-author-xmp')
    polluted_custom=[key for key,(kind,value) in raw_info.items() if key not in {'Title','Author','Subject','Keywords','Creator','Producer','CreationDate','ModDate','Trapped'} and kind=='string' and TOOL.search(value)]
    if polluted_custom:issues.append('production-tool-custom-info')
    record={'beforeSha256':digest(path),'pages':len(document),'author':metadata.get('author',''),'issues':issues,'corrected':False}
    if not issues or not fix:document.close();return record
    # This is an explicit publishing copy. The archived source is never edited.
    before=[hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1,1),alpha=False).samples).hexdigest() for page in document]
    metadata['author']=metadata.get('author') if metadata.get('author') in ACCEPTED else AUTHOR
    for key in polluted:
        if key!='author':metadata[key]=PUBLISHER if key in {'creator','producer'} else ''
    document.set_metadata({key:value for key,value in metadata.items() if key in {'title','author','subject','keywords','creator','producer','creationDate','modDate','trapped'}})
    for key in polluted_custom:document.xref_set_key(info_xref,key,'null')
    if 'production-tool-xmp' in issues:document.del_xml_metadata()
    elif 'publication-author-xmp' in issues:document.set_xml_metadata(correct_xmp_authors(xmp))
    target=path.with_name(path.name+'.publishing.tmp')
    document.save(target,garbage=4,deflate=True);document.close()
    checked=pymupdf.open(target)
    after=[hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1,1),alpha=False).samples).hexdigest() for page in checked]
    if before!=after:raise RuntimeError('Publishing metadata correction changed rendered pages: '+path.name)
    _,checked_info=info_fields(checked)
    if checked.metadata.get('author') not in ACCEPTED or any(author not in ACCEPTED for author in xmp_authors(checked.get_xml_metadata())) or TOOL.search(json.dumps(checked.metadata)+checked.get_xml_metadata()+json.dumps(checked_info)):raise RuntimeError('PDF metadata still contains an unresolved author or production mark')
    record.update({'corrected':True,'author':checked.metadata['author'],'renderedPagesUnchanged':True});checked.close()
    target.replace(path);record['afterSha256']=digest(path);return record

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=Path('.'));parser.add_argument('--fix',action='store_true');parser.add_argument('--report',type=Path)
    args=parser.parse_args();root=args.root.resolve()
    # Match the public artifact locations. Immutable source manuscripts remain
    # available for provenance; corrections happen in delivered publication copies.
    files=sorted({p for prefix in ['assets','public/downloads','downloads'] for p in (root/prefix).rglob('*.pdf')})
    records=[]
    for path in files:
        record=correct(path,args.fix);record['path']=path.relative_to(root).as_posix();records.append(record)
    report={'pdfsChecked':len(records),'pagesChecked':sum(r['pages'] for r in records),'issues':sum(bool(r['issues']) for r in records),'corrected':sum(r['corrected'] for r in records),'records':records}
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({key:value for key,value in report.items() if key!='records'},ensure_ascii=False))
    if any(r['issues'] and not r['corrected'] for r in records):raise SystemExit(1)
if __name__=='__main__':main()

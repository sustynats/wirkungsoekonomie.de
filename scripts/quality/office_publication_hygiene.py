"""Preserve OOXML formatting while removing publication-production residue."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
from lxml import etree
import argparse, hashlib, json, re

DASHES = '\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2e3a\u2e3b\ufe58\ufe63\uff0d'
TABLE = str.maketrans({c:'-' for c in DASHES})
AI = re.compile(r'\b(?:Claude|ChatGPT|OpenAI)\b', re.I)
PRODUCTION = re.compile(r'Claude|ChatGPT|Codex(?:-V1|-Fassung|-Inhaltsproduktion|-Erweiterung|-HANDOFF)|Quell-Dokument f[uü]r|Rohfassung fuer', re.I)
PRIVATE = re.compile(r'file:/+[^\s<>"\']+|(?<![\w/.:])/(?:Users|home|private/var|var/folders|Volumes)/[^\n<>"\']+|[A-Z]:[\\/]Users[\\/][^\n<>"\']+')
CP='http://schemas.openxmlformats.org/package/2006/metadata/core-properties'
DC='http://purl.org/dc/elements/1.1/'

def normalized(text):
    return text.translate(TABLE).replace('Shannon, Claude E.', 'Shannon, C. E.').replace('Claude Shannon', 'C. Shannon')

def scrub_office(source, target):
    source,target=Path(source),Path(target);target.parent.mkdir(parents=True,exist_ok=True)
    report=dict(removedProductionParagraphs=0,privateRelationships=0,dashes=0)
    roots={};raw={}
    with ZipFile(source) as z:
        infos=z.infolist()
        for entry in infos:
            data=z.read(entry.filename);raw[entry.filename]=data
            if entry.filename.endswith(('.xml','.rels')):
                roots[entry.filename]=etree.fromstring(data)
    old_formulas=[el.text for root in roots.values() for el in root.iter() if etree.QName(el).localname=='f']
    removed_ids=set()
    for filename,root in roots.items():
        if filename.endswith('.rels'):
            for el in list(root):
                if PRIVATE.search(el.get('Target','')):
                    removed_ids.add(el.get('Id'));root.remove(el);report['privateRelationships']+=1
        if filename.startswith('word/'):
            for el in list(root.iter()):
                if etree.QName(el).localname!='p':continue
                text=''.join(el.itertext())
                is_metadata=text.startswith('Track:') and 'Status:' in text
                if is_metadata and PRODUCTION.search(text):
                    for node in el.iter():
                        if node.text:
                            node.text=re.sub(r'Status: Studienskript V1.*?Quelle:', 'Status: Studienskript V1. Quelle:',node.text)
                            node.text=re.sub(r', Claude-CI/CD-Finalisierung offen','',node.text)
                            node.text=re.sub(r'Quelle: woek-akademie-app/.*?Wissensbasis:', 'Wissensbasis:',node.text)
                elif (PRODUCTION.search(text) and 'Shannon' not in text) or (text.startswith('Quelle:') and PRIVATE.search(text)):
                    parent=el.getparent()
                    if parent is not None:parent.remove(el);report['removedProductionParagraphs']+=1
        for el in root.iter():
            for attribute,value in list(el.attrib.items()):
                if value in removed_ids:
                    del el.attrib[attribute]
                else:
                    clean=normalized(value)
                    if AI.search(clean):clean=AI.sub('Natalie Weber' if etree.QName(el).localname.endswith('Properties') else 'Wirkungsoekonomie',clean)
                    el.set(attribute,PRIVATE.sub('',clean))
            if el.text:
                report['dashes']+=sum(el.text.count(c) for c in DASHES)
                clean=normalized(el.text)
                if PRIVATE.search(clean):clean=PRIVATE.sub('',clean)
                if AI.search(clean):raise ValueError('Unreviewed producer reference in '+filename)
                if filename.startswith('docProps/'):
                    clean=re.sub(r'\bCodex\b\s*,?\s*','',clean,flags=re.I)
                el.text=clean
            if el.tail:el.tail=normalized(el.tail)
    core=roots.get('docProps/core.xml')
    if core is None:
        core=etree.Element('{'+CP+'}coreProperties',nsmap={'cp':CP,'dc':DC})
        roots['docProps/core.xml']=core
        info=ZipInfo('docProps/core.xml',date_time=(2026,9,6,0,0,0));info.compress_type=ZIP_DEFLATED;infos.append(info)
        rels=roots['_rels/.rels'];ns=etree.QName(rels).namespace
        used={el.get('Id') for el in rels};rid='rIdPublicationProperties'
        assert rid not in used
        etree.SubElement(rels,'{'+ns+'}Relationship',Id=rid,Type='http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',Target='docProps/core.xml')
        types=roots['[Content_Types].xml'];ns=etree.QName(types).namespace
        etree.SubElement(types,'{'+ns+'}Override',PartName='/docProps/core.xml',ContentType='application/vnd.openxmlformats-package.core-properties+xml')
    for tag in ('{'+DC+'}creator','{'+CP+'}lastModifiedBy'):
        el=core.find(tag)
        if el is None:el=etree.SubElement(core,tag)
        el.text='Natalie Weber'
    new_formulas=[el.text for root in roots.values() for el in root.iter() if etree.QName(el).localname=='f']
    assert [normalized(t) if t else t for t in old_formulas]==new_formulas,'Spreadsheet formulas changed'
    with ZipFile(target,'w') as out:
        for info in infos:
            data=etree.tostring(roots[info.filename],encoding='UTF-8',xml_declaration=True,standalone=True) if info.filename in roots else raw[info.filename]
            out.writestr(info,data)
    with ZipFile(target) as z:
        assert z.testzip() is None
        for name in roots:
            text=z.read(name).decode('utf-8')
            assert not AI.search(text), 'Residual producer name'
            assert not PRIVATE.search(text),'Residual private path'
            assert not any(c in text for c in DASHES),'Residual long dash'
            etree.fromstring(z.read(name))
    return dict(beforeSha256=hashlib.sha256(source.read_bytes()).hexdigest(),afterSha256=hashlib.sha256(target.read_bytes()).hexdigest(),formulasPreserved=True,**report)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--manifest',required=True);parser.add_argument('--report',required=True);args=parser.parse_args()
    report=[]
    for item in json.loads(Path(args.manifest).read_text()):
        try:report.append(dict(path=item['path'],status='verified',**scrub_office(item['source'],item['target'])))
        except Exception as e:report.append(dict(path=item['path'],status='failed',error=str(e)))
    Path(args.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(dict(files=len(report),failed=[r for r in report if r['status']=='failed']),ensure_ascii=False))
    raise SystemExit(any(r['status']=='failed' for r in report))

if __name__=='__main__':main()

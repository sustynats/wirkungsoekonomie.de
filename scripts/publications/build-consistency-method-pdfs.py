"""Rebuild guarded text/table regions, preserving original pages and destinations.

The original checksum-bound PDF is the available source manuscript. Editable
correction content is stored separately in JSON, rather than a notice pasted
before the unchanged publication. Unknown source regions fail closed.
"""
from pathlib import Path
import argparse,json,hashlib,re
import pymupdf
ROOT=Path(__file__).resolve().parents[2]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def normalize(text):return re.sub(r'\s+',' ',text).strip()
def destinations(value):
    # Repacking may renumber PDF objects; page/URI/position destinations must
    # remain exactly the same. Object numbers are not a publication destination.
    if isinstance(value,dict):return {k:destinations(v)for k,v in value.items()if k not in {'xref','id'}}
    if isinstance(value,list):return [destinations(v)for v in value]
    return value
def build():
    reports=[]
    for edition in json.loads((ROOT/'content/grundlagen/method-corrections-20261010.json').read_text()):
        source=ROOT/edition['source']
        if sha(source)!=edition['sourceSha256']:raise RuntimeError('Unknown original method source: '+edition['id'])
        doc=pymupdf.open(source)
        if len(doc)!=edition['pages']:raise RuntimeError('Original page count changed')
        original_toc=doc.get_toc(simple=False);original_links=[pg.get_links() for pg in doc]
        changed={r['page'] for r in edition['regions']};untouched={}
        for i,pg in enumerate(doc,1):
            if i not in changed:untouched[i]=hashlib.sha256(pg.get_pixmap(alpha=False).samples).hexdigest()
        for region in edition['regions']:
            pg=doc[region['page']-1];rect=pymupdf.Rect(region['rect'])
            before=pg.get_text('text',clip=rect)
            if before!=region['beforeText']:raise RuntimeError('Unknown source paragraph/table on page '+str(region['page']))
            pg.add_redact_annot(rect,fill=tuple(region.get('background',[1,1,1])));pg.apply_redactions(images=0,graphics=0,text=0)
            css=f'''body {{ font-family: sans-serif; font-size: {region['fontPt']}pt; line-height: 1.13; color: #20252a; }} p {{ margin: 0 0 2pt; }} table {{ border-collapse: collapse; width: 100%; }} th,td {{ text-align: left; vertical-align: top; border: 0.25pt solid #c4ced4; padding: 2pt 4pt; }} th {{ background: #edf1f4; font-weight: bold; }}'''
            spare,scale=pg.insert_htmlbox(rect,region['afterHtml'],css=css,scale_low=1)
            if spare<0 or scale!=1:raise RuntimeError(f'Region does not fit without shrinking: {edition["id"]} page {region["page"]} ({region["reason"]})')
            region['layout']={'scale':scale,'spareHeightPt':round(spare,3)}
        for correction in edition.get('linkCorrections',[]):
            page_index=correction['page']-1;matches=[link for link in original_links[page_index]if link.get('uri')==correction['beforeUri']]
            if len(matches)!=1:raise RuntimeError('Ambiguous original source hyperlink')
            link=matches[0];link['uri']=correction['afterUri'];doc[page_index].update_link(link)
        metadata=doc.metadata;metadata.update({'author':'Natalie Weber','creator':'Institut für Wirkungsökonomie','producer':'Institut für Wirkungsökonomie','subject':'Konsistenzkorrektur 10.10.2026; Original Juli 2026 unverändert archiviert; Begriffsleitfaden v1.8 und T-SROI-Rechenstandard v1.1'})
        doc.set_metadata({k:v for k,v in metadata.items()if k in {'title','author','subject','keywords','creator','producer','creationDate','modDate','trapped'}})
        target=ROOT/edition['output'];target.parent.mkdir(parents=True,exist_ok=True);doc.save(target,garbage=4,deflate=True);doc.close();checked=pymupdf.open(target)
        if destinations(checked.get_toc(simple=False))!=destinations(original_toc):raise RuntimeError('Existing outline destinations changed')
        for n,checksum in untouched.items():
            if hashlib.sha256(checked[n-1].get_pixmap(alpha=False).samples).hexdigest()!=checksum:raise RuntimeError('Unchanged page pixels differ: '+str(n))
        for n,links in enumerate(original_links):
            if destinations(checked[n].get_links())!=destinations(links):raise RuntimeError('Existing link annotation changed on page '+str(n+1))
        bounds=[]
        for n in changed:
            pg=checked[n-1]
            for block in pg.get_text('dict')['blocks']:
                if not (pg.rect+(-1,-1,1,1)).contains(pymupdf.Rect(block['bbox'])):bounds.append({'page':n,'bbox':block['bbox']})
        if bounds:raise RuntimeError('Rebuilt method content outside page: '+str(bounds))
        reports.append({'id':edition['id'],'source':edition['source'],'sourceSha256':edition['sourceSha256'],'output':edition['output'],'sha256':sha(target),'pages':len(checked),'correctedPages':sorted(changed),'correctedRegions':len(edition['regions']),'unchangedPagesPixelIdentical':len(untouched),'outlinesPreserved':True,'existingLinkDestinationsPreservedExceptDeclaredCorrections':True,'linkCorrections':edition.get('linkCorrections',[]),'contentOutsidePage':bounds,'visualReview':'PENDING','regions':[{'page':r['page'],'reason':r['reason'],'layout':r['layout']}for r in edition['regions']]})
        print(edition['id'],len(checked),'pages;',len(changed),'actually corrected pages;',len(untouched),'original pages pixel-identical')
    (ROOT/'reports/consistency-20261009/method-pdf-build.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
if __name__=='__main__':build()

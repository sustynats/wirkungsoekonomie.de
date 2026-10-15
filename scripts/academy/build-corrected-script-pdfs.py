"""Rebuild seven current study PDFs from canonical reader projections.
No added foreword can substitute for the corrected content. Historical editions
remain unchanged. The shared public fonts and ReportLab supply paginated tables, links and Unicode.
"""
from pathlib import Path
import json,hashlib,re,html,zipfile
import pymupdf as fitz
import importlib.util
from reportlab.platypus import SimpleDocTemplate,Paragraph
layout_spec=importlib.util.spec_from_file_location("script_pdf_layout",Path(__file__).with_name("script-pdf-layout.py"))
layout=importlib.util.module_from_spec(layout_spec);layout_spec.loader.exec_module(layout)
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'outputs/academy-20261015';OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads((ROOT/'content/academy/v4-reader-publication.json').read_text())
records=[]
for row in manifest['readers']:
 if not row['corrected']:continue
 source=ROOT/row['source']
 if hashlib.sha256(source.read_bytes()).hexdigest()!=row['source_sha256']:raise RuntimeError('Source drift: '+row['lecture_id'])
 reader=(ROOT/row['route']/'index.html').read_text()
 article=re.search(r'<article class="section narrow">([\s\S]*?)</article>',reader).group(1)
 parser=layout.ReaderParser();parser.feed(article);parser.flush()
 story=[Paragraph(html.escape(row['title']),layout.styles['h1']),Paragraph('Natalie Weber · Institut für Wirkungsökonomie<br/>Curriculum 4.0 · Fassung 15. Oktober 2026<br/>Begriffsgrundlage: Leitfaden v1.8; T-SROI-Rechenstandard v1.1',layout.styles['fine'])]+parser.story
 target=OUT/row['pdf'];raw=OUT/(row['pdf']+'.raw.pdf')
 def footer(canvas,doc):
  canvas.setStrokeColorRGB(.75,.8,.77);canvas.line(48,40,547.276,40);canvas.setFont('WoeKText',8);canvas.setFillColorRGB(.15,.3,.25);canvas.drawString(48,25,'Institut für Wirkungsökonomie | 15.10.2026');canvas.drawRightString(547.276,25,str(doc.page))
 SimpleDocTemplate(str(raw),pagesize=(595.276,841.89),leftMargin=48,rightMargin=48,topMargin=48,bottomMargin=57,invariant=1).build(story,onFirstPage=footer,onLaterPages=footer)
 doc=fitz.open(raw)
 doc.set_metadata({'title':row['title'],'author':'Natalie Weber','creator':'Institut für Wirkungsökonomie','producer':'Institut für Wirkungsökonomie','subject':'Vorlesungsskript, Curriculum 4.0, korrigierte Fassung 15.10.2026','creationDate':'D:20261015000000Z','modDate':'D:20261015000000Z'})
 doc.save(target,garbage=4,deflate=True,no_new_id=True);doc.close();raw.unlink()
 check=fitz.open(target);bounds=[]
 for n,page in enumerate(check,1):
  for block in page.get_text('dict')['blocks']:
   if block.get('type')==0 and not (page.rect+(-1,-1,1,1)).contains(fitz.Rect(block['bbox'])):bounds.append({'page':n,'bbox':block['bbox']})
 if bounds:raise RuntimeError('Text outside page: '+str(bounds))
 text='\n'.join(p.get_text()for p in check)
 if re.search(r'Codex|Claude|ChatGPT|OpenAI|FACH_ENDCONTENT|source_version|change_reason|CorrectAnswer|correct_answer',text,re.I):raise RuntimeError('Production or protected residue: '+row['lecture_id'])
 if '�'in text or '\x00'in text:raise RuntimeError('Unreadable characters: '+row['lecture_id'])
 records.append({'lecture_id':row['lecture_id'],'source':row['source'],'source_sha256':row['source_sha256'],'file':str(target.relative_to(ROOT)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'pages':len(check),'author':check.metadata['author'],'bounds':'PASS','visual_review':'PENDING'})
 print(row['lecture_id'],len(check),'pages')
zip_path=OUT/'woek-vorlesungsskripte-v4-2026-10-15.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED)as z:
 for row in manifest['readers']:z.writestr(row['source'].removeprefix('content/studienskripte/v4/'),(ROOT/row['source']).read_bytes())
 z.writestr('PUBLIC_MASTER_MANIFEST.json',(ROOT/'content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json').read_bytes())
 z.writestr('PUBLIC_READING_MANIFEST.json',(ROOT/'content/academy/v4-reader-publication.json').read_bytes())
 z.writestr('README.txt','Vorlesungsskripte WÖk-Akademie, Curriculum 4.0. Natalie Weber / Institut für Wirkungsökonomie. Kanonische Quellen mit ausgewählten Korrekturen vom 15.10.2026. Historische Datierungen bleiben erhalten. Prüfungsantworten sind nicht enthalten. Änderungen: targeted-corrections.json. Präsentationen separat aus den zugehörigen Sprechertexten erstellen.\n')
 z.writestr('targeted-corrections.json',(ROOT/'reports/academy-20261014/targeted-corrections.json').read_bytes())
contract_files=['scripts/academy/lib/public-script.mjs', 'scripts/studienskripte/reader-renderer.mjs', 'scripts/academy/qualify-public-script-terms.py', 'tools/apply_nwi_disambiguation.py']
render_contract=[{'file':p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()}for p in contract_files]
(ROOT/'reports/academy-20261014/pdf-build.json').write_text(json.dumps({'date':'2026-10-15','render_contract':render_contract,'files':records,'source_zip':{'file':str(zip_path.relative_to(ROOT)),'sha256':hashlib.sha256(zip_path.read_bytes()).hexdigest()}},ensure_ascii=False,indent=2)+'\n')

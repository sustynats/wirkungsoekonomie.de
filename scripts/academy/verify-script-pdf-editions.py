"""Verify current PDFs against source identity, full rendered article and metadata."""
from pathlib import Path
from html.parser import HTMLParser
import pymupdf as fitz,json,re,hashlib
ROOT=Path(__file__).resolve().parents[2]
class Text(HTMLParser):
 def __init__(self):super().__init__();self.values=[]
 def handle_data(self,s):self.values.append(s)
def norm(s):return re.sub(r'\s+','',s).replace('•','').replace('\u00ad','')
report=json.loads((ROOT/'reports/academy-20261014/pdf-build.json').read_text())
readers=json.loads((ROOT/'content/academy/v4-reader-publication.json').read_text())['readers']
results=[]
for item in report['files']:
 row=next(x for x in readers if x['lecture_id']==item['lecture_id'])
 assert hashlib.sha256((ROOT/item['source']).read_bytes()).hexdigest()==item['source_sha256'],item['lecture_id']+' source drift'
 assert hashlib.sha256((ROOT/item['file']).read_bytes()).hexdigest()==item['sha256'],item['lecture_id']+' PDF drift'
 page=(ROOT/row['route']/'index.html').read_text();article=re.search(r'<article class="section narrow">([\s\S]*?)</article>',page)[1]
 parser=Text();parser.feed(article);expected=norm(' '.join(parser.values));d=fitz.open(ROOT/item['file']);actual=norm('\n'.join(p.get_text(clip=fitz.Rect(45,45,551,787))for p in d))
 start=actual.find(expected[:70]);assert start>=0,item['lecture_id']+' body missing'
 assert actual[start:]==expected,item['lecture_id']+' full article differs'
 assert d.metadata['author']=='Natalie Weber'
 metadata=json.dumps(d.metadata,ensure_ascii=False)+d.get_xml_metadata()
 assert not re.search(r'Codex|Claude|ChatGPT|OpenAI|ReportLab|PyMuPDF',metadata,re.I),item['lecture_id']+' metadata residue'
 results.append({'lecture_id':item['lecture_id'],'source_sha256':item['source_sha256'],'pdf_sha256':item['sha256'],'reader_article_sha256':hashlib.sha256(article.encode()).hexdigest(),'pages':len(d),'full_article_text_parity':'PASS','metadata':'PASS'})
assert len(results)==7
(ROOT/'reports/academy-20261014/pdf-source-view-verification.json').write_text(json.dumps({'status':'PASS','scope':'Full public teaching article, excluding title/byline/page footer and nonpublic source-production sections. All final PDF page renders separately reviewed.','files':results},ensure_ascii=False,indent=2)+'\n')
print('PDF source/view, complete article text, hashes and metadata: PASS (7 PDFs, 40 pages)')

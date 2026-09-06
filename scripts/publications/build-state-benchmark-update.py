"""Dated companion publication; shared authored data with the website."""
import json, hashlib
from pathlib import Path
from xml.sax.saxutils import escape
import reportlab
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'outputs/closeout-2026-09-06/pdf';OUT.mkdir(parents=True,exist_ok=True)
source='content/site/state-benchmark-update-2026-09-06.json';data=json.loads((ROOT/source).read_text())
for name,f in [('Base','Vera.ttf'),('Bold','VeraBd.ttf')]:pdfmetrics.registerFont(TTFont(name,str(Path(reportlab.__file__).parent/'fonts'/f)))
styles={k:ParagraphStyle(k,fontName='Bold' if k in ['h1','h2'] else 'Base',fontSize=size,leading=lead,spaceAfter=12,textColor=colors.HexColor('#215e45' if k=='h2' else '#17231b'),keepWithNext=k in ['h1','h2']) for k,size,lead in [('h1',25,31),('h2',16,22),('p',10,15),('small',8,12)]}
def P(s,k='p'):return Paragraph(escape(s).replace('–','-').replace('—','-').replace('‑','-'),styles[k])
story=[P('WIRKUNGSÖKONOMIE | FACHLICHE ERGÄNZUNG | 06.09.2026','small'),P(data['title'],'h1'),P(data['subtitle'])]
for i,s in enumerate(data['sections']):
 if i in [2,3,4]:story.append(PageBreak())
 story.append(P(s['title'],'h2'));story.extend(P(p) for p in s['paragraphs'])
 if s['sources']:story.append(P('Belege: '+', '.join(str(n+1) for n in s['sources'])+'.','small'))
story.append(P('Quellen und weiterführende Fassungen','h2'))
for i,s in enumerate(data['sources']):story.append(Paragraph(f'{i+1}. <a href="{escape(s["url"])}" color="#215e45">{escape(s["title"])}</a>',styles['small']))
story.append(P('Quellenstand: 6. September 2026. Links in dieser PDF sind anklickbar.','small'))
def footer(c,d):
 c.setFont('Base',8);c.setFillColor(colors.HexColor('#215e45'));c.drawString(48,29,'Wirkungsökonomie | Fachhinweis 06.09.2026');c.drawRightString(A4[0]-48,29,str(d.page))
name='woek-staatliche-wirkungspruefung-fachhinweis-2026-09-06.pdf';file=OUT/name
SimpleDocTemplate(str(file),pagesize=A4,topMargin=48,bottomMargin=57,leftMargin=48,rightMargin=48,title=data['title'],author='Natalie Weber',creator='Natalie Weber',invariant=1).build(story,onFirstPage=footer,onLaterPages=footer)
hash=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest={'date':data['date'],'releaseTag':'woek-fachhinweis-staatliche-pruefung-2026-09-06','sourceHashes':{s:hash(ROOT/s) for s in [source,'scripts/publications/build-state-benchmark-update.py']},'files':[{'filename':name,'title':data['title'],'kind':'addendum','url':'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-fachhinweis-staatliche-pruefung-2026-09-06/'+name,'sha256':hash(file),'bytes':file.stat().st_size,'pages':len(PdfReader(file).pages)}]}
(ROOT/'assets/data/state-benchmark-edition-2026-09-06.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(manifest['files'][0])

"""Rebuild the reference overview from the same corrected source as the website."""
from pathlib import Path
import hashlib, html, json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT/'content/site/reference-update.json'
data = json.loads(SOURCE.read_text())
font_root = Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless'
choices = list(font_root.rglob('DejaVuSans.ttf')) + list(Path('/usr/share/fonts/truetype/dejavu').glob('DejaVuSans.ttf'))
if not choices:
    raise RuntimeError('A complete Unicode font is required')
fonts = choices[0].parent
for name, filename in [('Reference','DejaVuSans.ttf'),('ReferenceBold','DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fonts/filename)))
styles = {
    'title':ParagraphStyle('title',fontName='ReferenceBold',fontSize=21,leading=27,spaceAfter=15),
    'heading':ParagraphStyle('heading',fontName='ReferenceBold',fontSize=13,leading=18,spaceBefore=14,spaceAfter=8,keepWithNext=True),
    'body':ParagraphStyle('body',fontName='Reference',fontSize=9.5,leading=14.4,spaceAfter=8),
}
story = []
values = []
def paragraph(text, kind='body'):
    values.append(text)
    story.append(Paragraph(html.escape(text),styles[kind]))
def link(label,path):
    url = 'https://wirkungsoekonomie.de'+path if path.startswith('/') else path
    values.append(label)
    story.append(Paragraph('<a href="'+html.escape(url,quote=True)+'" color="#215e45">'+html.escape(label)+'</a>',styles['body']))
paragraph(data['title'],'title')
paragraph('Natalie Weber | Stand 12. Oktober 2026')
paragraph(data['description'])
paragraph('Fachreferenzen','heading')
for item in data['references']:
    start = len(story)
    paragraph(item['title'],'heading')
    paragraph(item['status'])
    paragraph(item['text'])
    link('Fachgrundlage öffnen',item['href'])
    story[start:] = [KeepTogether(story[start:])]
paragraph('Einordnungen zum Buch','heading')
for item in data['chapterUpdates']:
    start = len(story)
    paragraph(item['title'],'heading')
    paragraph(item['text'])
    paragraph('Buchkapitel: '+', '.join(map(str,item['chapters']))+'.')
    link('Einordnung und Quellen',item['source'])
    story[start:] = [KeepTogether(story[start:])]
link('Online lesen','/referenz/aktualisierung/')
def footer(canvas,doc):
    canvas.saveState();canvas.setFont('Reference',7);canvas.setFillColor(colors.HexColor('#17231b'))
    canvas.drawString(44,27,'Natalie Weber | Grundlagen und Fachreferenzen | 12.10.2026')
    canvas.drawRightString(A4[0]-44,27,str(doc.page));canvas.restoreState()
target=ROOT/'public/downloads/originals/WOeK_Grundlagen_Fachreferenzen_2026-10-12.pdf'
SimpleDocTemplate(str(target),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=43,bottomMargin=49,
                  title='Wirkungsökonomie - Grundlagen und Fachreferenzen',author='Natalie Weber',
                  creator='Institut für Wirkungsökonomie',invariant=1).build(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(target);writer=PdfWriter();writer.clone_document_from_reader(reader)
writer.add_metadata({'/Author':'Natalie Weber','/Creator':'Institut für Wirkungsökonomie','/Producer':'Institut für Wirkungsökonomie',
                     '/CreationDate':"D:20261012000000+00'00'",'/ModDate':"D:20261012000000+00'00'"})
temporary=target.with_suffix('.prepared.pdf')
with temporary.open('wb') as stream:writer.write(stream)
temporary.replace(target)
report=dict(status='BUILT_PENDING_VISUAL_REVIEW',source=str(SOURCE.relative_to(ROOT)),
            sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),pdf=str(target.relative_to(ROOT)),
            pdfSha256=hashlib.sha256(target.read_bytes()).hexdigest(),pages=len(reader.pages),sourceValues=values)
(ROOT/'reports/consistency-20261009/guide-reference-pdf-build.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({key:report[key] for key in ['status','sourceSha256','pdfSha256','pages']}))

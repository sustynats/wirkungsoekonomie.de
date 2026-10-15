"""Print the existing reader's article with the site's public Unicode fonts."""
from html.parser import HTMLParser
from html import escape
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph,Table,TableStyle,Spacer
from reportlab.pdfbase import pdfmetrics
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'quality'))
from pdf_font_support import register_woek_fonts
register_woek_fonts()
pdfmetrics.registerFontFamily('WoeKText',normal='WoeKText',bold='WoeKBold',italic='WoeKText',boldItalic='WoeKBold')
styles={
 'p':ParagraphStyle('body',fontName='WoeKText',fontSize=10,leading=14.6,spaceAfter=8,splitLongWords=True),
 'h1':ParagraphStyle('title',fontName='WoeKBold',fontSize=21,leading=25,spaceAfter=16,keepWithNext=True),
 'h2':ParagraphStyle('heading',fontName='WoeKBold',fontSize=14,leading=18,spaceBefore=14,spaceAfter=8,keepWithNext=True,textColor=colors.HexColor('#215e45')),
 'h3':ParagraphStyle('subheading',fontName='WoeKBold',fontSize=11.5,leading=15,spaceBefore=10,spaceAfter=7,keepWithNext=True),
 'li':ParagraphStyle('list',fontName='WoeKText',fontSize=10,leading=14.6,leftIndent=12,firstLineIndent=-9,spaceAfter=6),
 'cell':ParagraphStyle('cell',fontName='WoeKText',fontSize=9.1,leading=12.6,splitLongWords=True),
 'fine':ParagraphStyle('fine',fontName='WoeKText',fontSize=9,leading=13,spaceAfter=16,textColor=colors.HexColor('#405d50'))}
class ReaderParser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.story=[];self.kind=None;self.buffer=[];self.rows=None;self.row=None;self.cell=None
 def flush(self):
  if self.kind and ''.join(self.buffer).strip():self.story.append(Paragraph(('• 'if self.kind=='li'else'')+''.join(self.buffer),styles[self.kind]))
  self.kind=None;self.buffer=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='table':self.flush();self.rows=[]
  elif tag=='tr':self.row=[]
  elif tag in ('td','th'):self.cell=[]
  elif self.rows is None and tag in ('h1','h2','h3','p','li'):self.flush();self.kind=tag
  if self.rows is not None:return
  if tag in ('b','strong'):self.buffer.append('<b>')
  elif tag in ('i','em'):self.buffer.append('<i>')
  elif tag=='a'and attrs.get('href','').startswith(('https://','http://')):self.buffer.append('<a href="'+escape(attrs['href'],quote=True)+'" color="#215e45">')
  elif tag=='br':self.buffer.append('<br/>')
 def handle_endtag(self,tag):
  if self.rows is not None:
   if tag in ('td','th')and self.cell is not None:self.row.append(Paragraph(escape(''.join(self.cell)),styles['cell']));self.cell=None
   elif tag=='tr'and self.row:self.rows.append(self.row);self.row=None
   elif tag=='table':
    if self.rows:
     n=len(self.rows[0]);assert all(len(r)==n for r in self.rows)
     table=Table(self.rows,colWidths=[499.276/n]*n,repeatRows=1,hAlign='LEFT')
     table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf2ed')),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#c7d2ca')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]));self.story.extend([table,Spacer(1,10)])
    self.rows=None
   return
  if tag in ('b','strong'):self.buffer.append('</b>')
  elif tag in ('i','em'):self.buffer.append('</i>')
  elif tag=='a' and any('<a 'in s for s in self.buffer):self.buffer.append('</a>')
  elif tag in ('h1','h2','h3','p','li'):self.flush()
 def handle_data(self,text):
  if self.cell is not None:self.cell.append(text)
  elif self.kind:self.buffer.append(escape(text))

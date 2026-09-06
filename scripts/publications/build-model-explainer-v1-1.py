#!/usr/bin/env python3
"""Dated learning PDFs from the same authored data as the public pages.
Historical editions are not rewritten. Run locally, publish to a new release.
"""
import hashlib,json
from pathlib import Path
from xml.sax.saxutils import escape
import reportlab
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,PageBreak,KeepTogether
from reportlab.graphics.shapes import Drawing,Rect,String
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'outputs/closeout-2026-09-06/pdf';OUT.mkdir(parents=True,exist_ok=True)
GREEN=colors.HexColor('#215e45');NAVY=colors.HexColor('#17231b');PALE=colors.HexColor('#eff3eb');GOLD=colors.HexColor('#756748')
fonts=Path(reportlab.__file__).parent/'fonts'
for name,file in [('Learn','Vera.ttf'),('LearnBold','VeraBd.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
pdfmetrics.registerFontFamily('Learn',normal='Learn',bold='LearnBold',italic='Learn',boldItalic='LearnBold')
styles={
'p':ParagraphStyle('p',fontName='Learn',fontSize=10,leading=15.5,spaceAfter=11,textColor=NAVY),
'h1':ParagraphStyle('h1',fontName='LearnBold',fontSize=26,leading=33,spaceAfter=20,textColor=NAVY),
'h2':ParagraphStyle('h2',fontName='LearnBold',fontSize=18,leading=24,spaceAfter=13,textColor=GREEN,keepWithNext=True),
'h3':ParagraphStyle('h3',fontName='LearnBold',fontSize=11.5,leading=16,spaceAfter=8,spaceBefore=9,textColor=NAVY,keepWithNext=True),
'fine':ParagraphStyle('fine',fontName='Learn',fontSize=8.4,leading=12,spaceAfter=10,textColor=GOLD),
'formula':ParagraphStyle('formula',fontName='LearnBold',fontSize=11,leading=17,spaceAfter=12,borderPadding=12,backColor=PALE,textColor=NAVY),
'quote':ParagraphStyle('quote',fontName='LearnBold',fontSize=15,leading=22,spaceAfter=18,textColor=GREEN)}
def norm(s):return s.replace('–','-').replace('—','-').replace('‑','-').replace('→',' > ').replace('Δ','Delta ').replace('CO₂','CO2')
def P(text,kind='p'):return Paragraph(norm(escape(text)),styles[kind])
def labeled(label,text):return Paragraph('<b>'+escape(label)+':</b> '+escape(norm(text)),styles['p'])
def link(label,url):return Paragraph('<a href="'+escape(url,{'"':'&quot;'})+'" color="#215e45">'+escape(label)+'</a>',styles['p'])
def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(colors.HexColor('#d0d9cc'));canvas.line(48,44,A4[0]-48,44);canvas.setFont('Learn',7.5);canvas.setFillColor(NAVY);canvas.drawString(48,29,'Wirkungsökonomie | Einführung v1.1 | 06.09.2026 | Modellbeispiele');canvas.drawRightString(A4[0]-48,29,str(doc.page));canvas.restoreState()
def build(filename,title,story):
 SimpleDocTemplate(str(OUT/filename),pagesize=A4,topMargin=48,leftMargin=48,rightMargin=48,bottomMargin=60,title=title,author='Wirkungsökonomie',subject='Verständlicher Lernweg mit offen ausgewiesenen Modellannahmen',invariant=1).build(story,onFirstPage=footer,onLaterPages=footer)
def chart():
 d=Drawing(490,154)
 for label,value,y,color in [('Vorher',100,114,NAVY),('Ohne Umstellung geschätzt',90,70,GOLD),('Nachher beobachtet',60,26,GREEN)]:
  d.add(String(0,y+12,label,fontName='Learn',fontSize=9,fillColor=NAVY));d.add(Rect(175,y,250*value/100,28,fillColor=color,strokeColor=None));d.add(String(184,y+9,str(value)+' kg',fontName='LearnBold',fontSize=10,fillColor=colors.white))
 return d
home=json.loads((ROOT/'content/site/home-explainer.json').read_text())
filename='woek-einfach-erklaert-2026-09-06-v1-1.pdf'
story=[P('WIRKUNGSÖKONOMIE EINFACH ERKLÄRT | V1.1 | 06.09.2026','fine'),P(home['title'],'h1'),P(home['intro']),P(home['scopeTitle'],'h2'),P(home['scope'])]
for title,text in home['scopeExamples']:story.extend([P(title,'h3'),P(text)])
story.extend([P('Die Beispiele veranschaulichen das Modell. Sie sind keine empirischen Fallstudien.','fine'),PageBreak(),P(home['exampleTitle'],'h1'),P(home['example'])])
for step,title,text in home['steps']:story.extend([P(step+': '+title,'h2'),P(text)])
story.extend([P('Was heißt hier Wirkung?','h2'),P(home['principle']),PageBreak(),P('Ein gemeinsamer Rahmen','h1'),P(home['framework']),P(home['integration']),P('Schutzgrenzen und Lernen','h2'),P('Nichtkompensation bedeutet: Harte Schutzgrenzen lassen sich nicht durch andere Vorteile aufwiegen. Reverse Merit Order lenkt die Bearbeitung zuerst auf kritische negative Wirkungen. Bewertet werden Maßnahmen und ihre Folgen, keine Menschen als Personen.'),P(home['status']),P('Transparenter Versionsstand','h2'),P('Version 1.1 erweitert die Einführung vom 6. September 2026 ausdrücklich um den Charakter als umfassendes Wirtschafts- und Gesellschaftsmodell. Sie ergänzt Beispiele aus Unternehmen, Staat und gesellschaftlichem Zusammenleben. Die erste Ausgabe bleibt historisch verfügbar. Fachliche Rechnungen des Impact-Controlling-Lernwegs werden dadurch nicht verändert.'),P('Weiterlesen und ausprobieren','h2'),link('Das vollständige Küchenbeispiel mit Formeln','https://wirkungsoekonomie.de/werkzeuge/impact-controlling/'),link('Der einfache Rechner in drei Schritten','https://wirkungsoekonomie.de/erleben/impact-controlling-rechner/'),link('Methodik und bestehende staatliche Verfahren','https://wirkungsoekonomie.de/methodik/'),link('Publikationsstände und Ergänzungen','https://wirkungsoekonomie.de/referenz/aktualisierung/'),link('Agenda 2030: die 17 SDGs','https://sdgs.un.org/goals')])
build(filename,'Wirkungsökonomie einfach erklärt: Wirtschafts- und Gesellschaftsmodell',story)
p=OUT/filename
sources=['content/site/home-explainer.json','scripts/site/build-home-explainer.mjs','scripts/publications/build-model-explainer-v1-1.py','scripts/lib/model-definition-update.mjs']
manifest={'reviewedAt':'2026-09-06','version':'1.1','releaseTag':'woek-gesamtmodell-2026-09-06-v1-1','supersedesSources':sources[:2],'sourceHashes':{s:hashlib.sha256((ROOT/s).read_bytes()).hexdigest() for s in sources},'files':[{'filename':filename,'title':'Wirkungsökonomie einfach erklärt: Wirtschafts- und Gesellschaftsmodell (v1.1)','kind':'explainer','supersedes':'woek-einfach-erklaert-2026-09-06.pdf','url':'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-gesamtmodell-2026-09-06-v1-1/'+filename,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'pages':len(PdfReader(p).pages)}]}
mp=ROOT/'assets/data/model-explainer-edition-2026-09-06-v1-1.json';mp.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');(OUT/mp.name).write_text(mp.read_text());(OUT/'MODEL-SHA256SUMS').write_text(manifest['files'][0]['sha256']+'  '+filename+'\n');print(manifest['files'])

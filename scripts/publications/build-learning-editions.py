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
OUT=ROOT/'outputs/learning-review-2026-09-06/pdf';OUT.mkdir(parents=True,exist_ok=True)
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
 canvas.saveState();canvas.setStrokeColor(colors.HexColor('#d0d9cc'));canvas.line(48,44,A4[0]-48,44);canvas.setFont('Learn',7.5);canvas.setFillColor(NAVY);canvas.drawString(48,29,'Wirkungsökonomie | Lernfassung 06.09.2026 | Modellbeispiel');canvas.drawRightString(A4[0]-48,29,str(doc.page));canvas.restoreState()
def build(filename,title,story):
 SimpleDocTemplate(str(OUT/filename),pagesize=A4,topMargin=48,leftMargin=48,rightMargin=48,bottomMargin=60,title=title,author='Wirkungsökonomie',subject='Verständlicher Lernweg mit offen ausgewiesenen Modellannahmen',invariant=1).build(story,onFirstPage=footer,onLaterPages=footer)
def chart():
 d=Drawing(490,154)
 for label,value,y,color in [('Vorher',100,114,NAVY),('Ohne Umstellung geschätzt',90,70,GOLD),('Nachher beobachtet',60,26,GREEN)]:
  d.add(String(0,y+12,label,fontName='Learn',fontSize=9,fillColor=NAVY));d.add(Rect(175,y,250*value/100,28,fillColor=color,strokeColor=None));d.add(String(184,y+9,str(value)+' kg',fontName='LearnBold',fontSize=10,fillColor=colors.white))
 return d
home=json.loads((ROOT/'content/site/home-explainer.json').read_text());course=json.loads((ROOT/'content/site/impact-controlling-course.json').read_text());c=course['case']
intro=[P('WIRKUNGSÖKONOMIE EINFACH ERKLÄRT | 06.09.2026','fine'),P(home['title'],'h1'),P(home['intro']),P(home['exampleTitle'],'h2'),P(home['example']),P('Gedankenexperiment, keine reale Fallstudie.','fine')]
for step,title,text in home['steps']:intro.extend([P(step+': '+title,'h3'),P(text)])
intro.extend([PageBreak(),P('Was heißt hier Wirkung?','h1'),P(home['principle']),P('Ein gemeinsamer Rahmen','h2'),P(home['framework']),P(home['integration']),P('Schutzgrenzen und Lernen','h2'),P('Nichtkompensation bedeutet: Harte Schutzgrenzen lassen sich nicht durch andere Vorteile aufwiegen. Reverse Merit Order lenkt die Bearbeitung zuerst auf kritische negative Wirkungen. Bewertet werden Maßnahmen und ihre Folgen, keine Menschen als Personen.'),P(home['status']),P('Weiterlesen und ausprobieren','h2'),link('Das vollständige Küchenbeispiel mit Formeln','https://wirkungsoekonomie.de/werkzeuge/impact-controlling/'),link('Der einfache Rechner in drei Schritten','https://wirkungsoekonomie.de/erleben/impact-controlling-rechner/'),link('Methodik, SDGs und bestehende staatliche Verfahren','https://wirkungsoekonomie.de/methodik/'),link('Agenda 2030: die 17 SDGs','https://sdgs.un.org/goals')])
build('woek-einfach-erklaert-2026-09-06.pdf','Wirkungsökonomie einfach erklärt',intro)
story=[P('IMPACT CONTROLLING | LERNFASSUNG 06.09.2026','fine'),P('Vom Küchenalltag zur Entscheidung','h1'),P(course['definition']),P(c['title'],'h2'),P(c['intro']),P(c['status'],'fine'),P('So liest du diesen Lernweg','h2'),P('Zuerst klären wir das Problem und den Vergleich. Danach folgt jede verwendete Kennzahl auf einer eigenen Seite: Frage, Formel, eingesetzte Werte, Bedeutung, Messung und Grenzen. Zum Schluss wird aus der Rechnung eine verantwortliche Entscheidung.'),P('Die Mengenkennzahlen sind der Einstieg. IOI, T-SROI und WÖk-Netto-Wirkungsindex sind zusätzliche Verdichtungen für spezielle Fragen. Es gibt keine universelle KII-Liste für jeden Fall.'),P('Neue Lernfassung statt stiller Änderung','h3'),P('Diese ausführliche Erklärung ersetzt den Einstieg vom 5. September 2026. Die frühere PDF bleibt als historische Ausgabe erhalten. Der T-SROI-Rechenstandard v1.1 bleibt fachlich maßgeblich.'),PageBreak(),P('1. Erst die Frage klären','h1')]
for label,key in [('Problem','problem'),('Ziel','goal'),('Alternativen','options')]:story.append(labeled(label,c[key]))
story.extend([P('Der Wirkpfad: A > M > Delta Z > R','h2')])
for step in c['mechanism']:story.append(labeled(step['symbol']+' · '+step['title'],step['text']))
story.extend([P('Die Systemgrenze','h2'),P(c['boundary']),PageBreak(),P('2. Was sagt der Vergleich?','h1'),chart(),Spacer(1,14),P('40 kg beobachteter Rückgang - 10 kg gemeinsame Entwicklung = 30 kg zusätzlicher Unterschied pro Tag.','quote'),P(c['causality']),P('Hochrechnung bleibt Hochrechnung','h2'),P('30 kg pro Öffnungstag ergeben bei 180 Tagen rechnerisch 5.400 kg pro Jahr. Die Werte stammen im Beispiel aus Messwochen. Eine Jahreswirkung ist damit noch nicht ganzjährig beobachtet. Wir nennen diese Größe daher hochgerechnetes Wirkungspotenzial.'),PageBreak(),P('Die wichtigsten Begriffe','h1')])
for i,(term,text) in enumerate(course['terms']):
 if i==7:story.extend([PageBreak(),P('Begriffe für die Rechnung','h1')])
 story.append(labeled(term,text))
for i,item in enumerate(course['indicators']):
 story.extend([PageBreak(),P(f'KENNZAHL {i+1:02d} | '+item['role'],'fine'),P(item['title'],'h1'),P(item['question']),P(item['result'],'quote'),P(item['formula'],'formula'),P(item['variables']),labeled('Eingesetzt',item['calculation']),labeled('Das bedeutet es',item['meaning']),labeled('Warum wichtig',item['importance']),labeled('So wird gemessen',item['measurement']),labeled('Grenzen',item['limit'])])
story.extend([PageBreak(),P('4. Vom Befund zur Entscheidung','h1')])
for title,text in c['orders']:story.extend([P(title,'h3'),P(text)])
story.extend([P('Reporting dokumentiert. Rückkopplung verändert die nächste Entscheidung.','quote'),P(c['decision']),P('Die Freigabe bleibt eine eigene Prüfung','h2'),P('Die Modellzahlen liefern keine Freigabe für eine reale Schule. Vergleichbarkeit und Unsicherheit, Ernährung, Zugang und Hygiene, Gruppenunterschiede, Einkaufsänderungen sowie Umwelt- und Systemfolgen brauchen eigene Belege. Fehlende Daten sind keine Nullwerte.'),PageBreak(),P('Bestehende Ansätze integrieren','h1'),P(course['integration']),P(course['publicContext']),P('Die Geldrechnung richtig anschließen','h2'),P('Die Jahresmenge von 5.400 kg ist bereits um die Entwicklung der Vergleichsküche bereinigt. Der vorbereitete Fachrechner setzt deshalb Deadweight und Verdrängung auf 0 und Attribution auf 100 % dieses bereits bereinigten Stroms. Es wird kein zweiter Gegenfaktik-Abschlag angewandt. Diese Lernannahmen sind kein Kausalnachweis. Geldwerte, Profilpunkte und Schutzprüfung bleiben getrennt.'),P('Quellen und weiterführende Onlinefassung','h2')])
for title,url in course['sources']:story.append(link(title,'https://wirkungsoekonomie.de'+url if url.startswith('/') else url))
story.extend([P('Alle Zahlen und Bewertungsannahmen der Schulküche sind erfunden. Die Quellen begründen Methoden und Referenzen, nicht die Beispieldaten.','fine'),link('Onlinefassung mit ausklappbaren Rechnungen','https://wirkungsoekonomie.de/werkzeuge/impact-controlling/'),link('Einfacher Rechner und optionale Fachrechnung','https://wirkungsoekonomie.de/erleben/impact-controlling-rechner/')])
build('woek-impact-controlling-lernweg-2026-09-06.pdf','Impact Controlling: vollständiger Lernweg',story)
manifest_path=ROOT/'assets/data/learning-editions-2026-09-06.json';manifest=json.loads(manifest_path.read_text())
sources=['content/site/home-explainer.json','content/site/impact-controlling-course.json','scripts/lib/impact-course.mjs','scripts/site/build-home-explainer.mjs','scripts/portal/build-impact-controlling.mjs','assets/js/kitchen-impact.js','assets/js/impact-controlling-rechner.js','scripts/publications/build-learning-editions.py']
manifest['sourceHashes']={s:hashlib.sha256((ROOT/s).read_bytes()).hexdigest() for s in sources}
for entry in manifest['files']:
 p=OUT/entry['filename'];entry.update(sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size,pages=len(PdfReader(p).pages))
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(OUT/'SHA256SUMS').write_text(''.join(f"{x['sha256']}  {x['filename']}\n" for x in manifest['files']))
(OUT/manifest_path.name).write_text(manifest_path.read_text())
print(json.dumps(manifest['files'],ensure_ascii=False,indent=2))

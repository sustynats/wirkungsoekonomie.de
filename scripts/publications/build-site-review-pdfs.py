#!/usr/bin/env python3
"""Publish dated reading editions without changing historical source PDFs.

New explanations and the editorial addendum use the same content sources as
HTML. Existing works are cloned with an explicit, separately paginated update
in front; original page contents, citations and internal destinations survive.
Release files are generated locally and hosted as immutable GitHub assets.
"""
from __future__ import annotations
import argparse, hashlib, json, re
from io import BytesIO
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin
from xml.sax.saxutils import escape
import reportlab
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, DictionaryObject, ArrayObject, NumberObject, TextStringObject

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'outputs/site-review-2026-09-05/pdf'
MANIFEST=ROOT/'assets/data/site-review-pdf-editions.json'
BASE='https://wirkungsoekonomie.de'
RELEASE='https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-reference-update-2026-09-05/'
DATE='2026-09-05'
NAVY=colors.HexColor('#0B1020'); GREEN=colors.HexColor('#174f38'); PAPER=colors.HexColor('#F6F1E8')
fonts=Path(reportlab.__file__).parent/'fonts'
for name,file in [('Woek','Vera.ttf'),('WoekBold','VeraBd.ttf'),('WoekItalic','VeraIt.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(fonts/file)))
pdfmetrics.registerFontFamily('Woek',normal='Woek',bold='WoekBold',italic='WoekItalic',boldItalic='WoekBold')
styles={
 'p':ParagraphStyle('body',fontName='Woek',fontSize=9.4,leading=14.5,textColor=NAVY,spaceAfter=8),
 'h1':ParagraphStyle('title',fontName='WoekBold',fontSize=24,leading=29,textColor=NAVY,spaceAfter=18),
 'h2':ParagraphStyle('heading',fontName='WoekBold',fontSize=15,leading=20,textColor=GREEN,spaceBefore=15,spaceAfter=9,keepWithNext=True),
 'h3':ParagraphStyle('subheading',fontName='WoekBold',fontSize=11,leading=16,textColor=NAVY,spaceBefore=9,spaceAfter=6,keepWithNext=True),
 'li':ParagraphStyle('list',fontName='Woek',fontSize=9.4,leading=14.5,leftIndent=12,firstLineIndent=-8,spaceAfter=8),
 'kicker':ParagraphStyle('kicker',fontName='Woek',fontSize=8,leading=12,textColor=colors.HexColor('#4a4a44'),spaceAfter=7,keepWithNext=True),
 'fine':ParagraphStyle('fine',fontName='Woek',fontSize=8,leading=12,textColor=colors.HexColor('#4a4a44'),spaceAfter=7),
 'cell':ParagraphStyle('cell',fontName='Woek',fontSize=8.3,leading=12,textColor=NAVY,spaceAfter=3),
}
def normalize(s):
    return s.replace('\u2011','-').replace('\u2013','-').replace('\u2014','-').replace('→',' > ').replace('Δ','Delta ').replace('\u00a0',' ')
def P(text,kind='p'):
    return Paragraph(normalize(text),styles[kind])
def footer(canvas,doc):
    canvas.saveState();canvas.setStrokeColor(colors.HexColor('#d8d5cf'));canvas.line(48,43,A4[0]-48,43)
    canvas.setFont('Woek',7.5);canvas.setFillColor(NAVY);canvas.drawString(48,29,'Wirkungsökonomie | Fachlicher Stand: 05.09.2026');canvas.drawRightString(A4[0]-48,29,f'{doc.page}');canvas.restoreState()
def build(path,title,story):
    SimpleDocTemplate(str(path),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=48,bottomMargin=58,title=title,author='Wirkungsökonomie',subject='Datierter fachlicher Standabgleich; historische Fassungen bleiben nachvollziehbar',pageCompression=1,invariant=1).build(story,onFirstPage=footer,onLaterPages=footer)

def table(rows):
    cells=[[P(escape(cell),'cell') for cell in row] for row in rows]
    width=(A4[0]-96)/len(rows[0]);t=Table(cells,colWidths=[width]*len(rows[0]),repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),PAPER),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#d8d5cf')),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7)]));return t

class PrintContent(HTMLParser):
    """Small structured export of the existing main; no browser UI is printed."""
    def __init__(self,url,process=None):
        super().__init__(convert_charrefs=True);self.url=url;self.process=process;self.main=False;self.skip=[];self.block=None;self.buf=[];self.story=[];self.in_table=False;self.rows=[];self.row=[];self.cell=None;self.inline_group=False
    def flush(self):
        if self.block and ''.join(self.buf).strip():
            text=re.sub(r'\s+',' ',''.join(self.buf)).strip()
            self.story.append(P(('• ' if self.block=='li' else '')+text,self.block))
        self.block=None;self.buf=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='main':self.main=True;return
        if not self.main:return
        if self.skip:
            if tag not in {'img','br','hr','input','meta','link','source'}:self.skip.append(tag)
            return
        if tag in {'script','style','nav','button','details'} or 'data-search-exclude' in a or 'data-pdf-exclude' in a or any(c in a.get('class','').split() for c in ['no-print','print-meta']):
            if tag not in {'img','br','hr','input','meta','link','source'}:self.skip=[tag]
            return
        if tag=='figure' and self.process and 'impact-process' in a.get('class',''):
            self.flush();self.story.append(diagram(self.process));self.skip=['figure'];return
        if tag=='div' and any(c in a.get('class','').split() for c in ['model-strip','portal-card-actions']):
            self.flush();self.block='fine';self.inline_group=True;return
        if tag=='table':self.flush();self.in_table=True;self.rows=[];return
        if self.in_table:
            if tag=='tr':self.row=[]
            if tag in {'th','td'}:self.cell=[]
            return
        if tag in {'h1','h2','h3','p','li','figcaption'}:
            self.flush();self.block='fine' if tag=='figcaption' else ('kicker' if tag=='p' and any(c in a.get('class','').split() for c in ['card-kicker','hero-kicker']) else tag)
        if self.block:
            if tag in {'strong','b'}:self.buf.append('<b>')
            elif tag in {'em','i'}:self.buf.append('<i>')
            elif tag=='a' and a.get('href'):
                u=urljoin(self.url,a['href'])
                self.buf.append('<a href="'+escape(u,{'"':'&quot;'})+'" color="#174f38">')
            elif tag=='br':self.buf.append('<br/>')
    def handle_endtag(self,tag):
        if tag=='main':self.flush();self.main=False;return
        if not self.main:return
        if self.skip:
            if tag in self.skip:
                self.skip=self.skip[:len(self.skip)-1-self.skip[::-1].index(tag)]
            return
        if self.in_table:
            if tag in {'th','td'} and self.cell is not None:self.row.append(' '.join(self.cell));self.cell=None
            elif tag=='tr' and self.row:self.rows.append(self.row)
            elif tag=='table':
                if self.rows and all(len(r)==len(self.rows[0]) for r in self.rows):self.story.extend([table(self.rows),Spacer(1,12)])
                self.in_table=False
            return
        if self.inline_group and tag=='div':self.flush();self.inline_group=False;return
        if self.inline_group and tag in {'a','span'}:self.buf.append(' ')
        if self.block:
            if tag in {'strong','b'}:self.buf.append('</b>')
            elif tag in {'em','i'}:self.buf.append('</i>')
            elif tag=='a':self.buf.append('</a>')
            elif tag in {'h1','h2','h3','p','li','figcaption'}:self.flush()
    def handle_data(self,text):
        if not self.main or self.skip:return
        if self.in_table:
            if self.cell is not None:self.cell.append(text.strip())
        elif self.block:self.buf.append(escape(text))


def diagram(process):
    story=[]
    for step in process['steps']:
        t=Table([[P(escape(step['symbol']),'h3'),[P(escape(step['title']),'h3'),P(escape(step['text']))]]],colWidths=[65,A4[0]-161])
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PAPER),('LINEBEFORE',(0,0),(0,-1),3,GREEN),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
        story.extend([t,Spacer(1,7)])
    story.append(P(escape(process['caption']),'fine'));return KeepTogether(story)

def export_html(source,output,title,process=None):
    url=BASE+'/'+source.replace('index.html','')
    html=(ROOT/source).read_text()
    if process:
        assert 'class="impact-process"' in html, f'{source}: expected authored explanation, found another generator output'
    parser=PrintContent(url,process);parser.feed(html)
    story=[P('AKTUALISIERTE ERLÄUTERUNG | 05.09.2026','fine')]+parser.story
    story.extend([Spacer(1,12),P('Onlinefassung mit sämtlichen Vertiefungen und Downloads: <a href="'+url+'" color="#174f38">'+url+'</a>','fine')])
    build(output,title,story)

def addendum(data,out):
    story=[P('FACHLICHE AKTUALISIERUNG | 05.09.2026','fine'),P('Buch und Fachpapiere: Was gilt heute?','h1'),P('Diese Ergänzung macht den Stand der WÖk-Grundlagen transparent. Sie präzisiert ausgewählte fachliche Entwicklungslinien. Sie ist keine vollständige Neuauflage und keine empirische Validierung aller Aussagen des Ausgangswerks.'),P('So wird diese Lesefassung verwendet','h2'),P('Bei beigefügten Werken steht diese Ergänzung vor der früheren Fassung. Deren gedruckte Seitenzahlen und Inhalte bleiben nachvollziehbar. Für aktuelle Begriffe, Register und Berechnungen gelten die hier benannten fachbezogenen Referenzen. Die PDF-Seitenanzeige kennzeichnet die Ergänzung gesondert.'),P('Original, Einordnung und heutige Anwendung','h2'),P('Historische Fassungen dokumentieren den damaligen Stand. Eine höhere Versionsnummer aus einer anderen Publikationsreihe setzt eine fachlich führende Quelle nicht außer Kraft. Gesetzesmodelle der WÖk sind Vorschläge, kein geltendes Recht. Systemischer Anspruch und wissenschaftlich nachgewiesene Überlegenheit sind zu unterscheiden.')]
    for ref in data['references']:
        story.extend([P(escape(ref['title']),'h3'),P('<b>'+escape(ref['status'])+'</b>. '+escape(ref['text'])),P('<a href="'+BASE+ref['href']+'" color="#174f38">'+BASE+ref['href']+'</a>','fine')])
    story.extend([P('Fachliche Präzisierungen','h1')])
    for update in data['chapterUpdates']:
        story.extend([P(escape(update['title']),'h2'),P(escape(update['text'])),P('Bezug im Buch: Kapitel '+', '.join(map(str,update['chapters']))+'. Die jeweilige Fachregel ist bei Anwendungen in anderen WÖk-Papieren ebenfalls zu beachten.','fine'),P('<a href="'+BASE+update['source']+'" color="#174f38">'+BASE+update['source']+'</a>','fine')])
    story.extend([P('Primärquellen und Abgrenzung','h2'),P('Agenda 2030/SDGs bleiben der globale Rahmen; SDG+ ist eine WÖk-eigene Ergänzung. Bei deutschen öffentlichen Entscheidungen wird der jeweils anwendbare staatliche Rahmen bestimmt. GGO/eNAP gilt nicht pauschal für alle Länder, Kommunen, EU- oder Unternehmensentscheidungen. Eine öffentlich nicht belegte eNAP-Datei bedeutet NOT_PUBLICLY_ESTABLISHED, nicht NOT_ASSESSED.'),P('Amtliche Grundlagen: GGO §§ 43/44, BHO § 7, VV-BHO und BMF-Rahmen zur ziel- und wirkungsorientierten Haushaltsführung. Links und Quellenfunktionen sind in der Methodik dokumentiert: <a href="'+BASE+'/methodik/#staatliche-nachhaltigkeitsarchitektur" color="#174f38">wirkungsoekonomie.de/methodik/</a>.'),P('Für die genannten Präzisierungen gilt: Beobachtung ist nicht Attribution, Zielbezug ist kein Kausalbeweis, fehlende Daten sind keine neutralen Werte. Nichtkompensation und Reverse Merit Order bleiben Bestandteil der Bewertung und Priorisierung.'),P('Änderungsübersicht und aktuelle Downloads: <a href="'+BASE+'/referenz/aktualisierung/" color="#174f38">wirkungsoekonomie.de/referenz/aktualisierung/</a>.')])
    build(out,'WÖk-Grundlagen: Fachliche Aktualisierung 2026-09-05',story)

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    args=argparse.ArgumentParser();args.add_argument('--check',action='store_true');args=args.parse_args()
    if args.check:
        m=json.loads(MANIFEST.read_text());assert m['reviewedAt']==DATE
        for entry in m['files']:
            p=OUT/entry['filename'];assert p.exists(),p;assert sha(p)==entry['sha256'],p
            r=PdfReader(p);assert len(r.pages)==entry['pages'];assert len(r.pages[0].extract_text())>100
        print('Eight dated PDF editions: hashes, counts and readable update covers verified.');return
    OUT.mkdir(parents=True,exist_ok=True)
    data=json.loads((ROOT/'content/site/reference-update.json').read_text())
    methodik=json.loads((ROOT/'content/site/methodik.json').read_text())
    records=[]
    def record(filename,title,kind,source=None,original_pages=None):
        p=OUT/filename;r=PdfReader(p);entry={'filename':filename,'title':title,'kind':kind,'url':RELEASE+filename,'sha256':sha(p),'bytes':p.stat().st_size,'pages':len(r.pages)}
        if source:entry.update({'source':source,'sourceSha256':sha(ROOT/source),'originalPages':original_pages,'updatePages':len(r.pages)-original_pages})
        records.append(entry)
    name='woek-methodik-integration-2026-09-05.pdf';export_html('methodik/index.html',OUT/name,methodik['title'],methodik['process']);record(name,'Methodik und Integration bestehender Ansätze','explainer')
    name='woek-impact-controlling-erklaerung-2026-09-05.pdf';export_html('werkzeuge/impact-controlling/index.html',OUT/name,'Impact Controlling: Wirkung prüfen und Entscheidungen verbessern',json.loads((ROOT/'content/site/impact-controlling.json').read_text())['process']);record(name,'Impact Controlling verständlich erklärt','explainer')
    add='woek-grundlagen-aktualisierung-2026-09-05.pdf';addendum(data,OUT/add);record(add,'Fachliche Aktualisierung zu Buch und Fachpapieren','addendum')
    works=[
      ('assets/pdf/die-neue-ordnung-des-wohlstands.pdf','die-neue-ordnung-des-wohlstands-lesefassung-2026-09-05.pdf','Die neue Ordnung des Wohlstands: ergänzte Lesefassung'),
      ('assets/downloads/grundlagen/woemm-2.0-referenzfassung.pdf','woemm-2-0-lesefassung-2026-09-05.pdf','WÖMM 2.0: ergänzte Lesefassung'),
      ('assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf','woems-2-0-lesefassung-2026-09-05.pdf','WÖMS 2.0: ergänzte Lesefassung'),
      ('assets/downloads/21_woek_impact_controlling_woek_ids_indikatorenarchitektur_methodenpapier_v1_0.pdf','woek-ids-indikatorenarchitektur-lesefassung-2026-09-05.pdf','WÖk-IDs und Indikatorenarchitektur: ergänzte Lesefassung'),
      ('assets/downloads/22_woek_impact_controlling_scorecards_benchmarks_nwi_methodenpapier_v1_0.pdf','scorecards-benchmarks-nwi-lesefassung-2026-09-05.pdf','Scorecards, Benchmarks und WÖk-Netto-Wirkungsindex: ergänzte Lesefassung'),
    ]
    update_reader=PdfReader(OUT/add);update_count=len(update_reader.pages)
    for source,filename,title in works:
        reader=PdfReader(ROOT/source);writer=PdfWriter();writer.clone_document_from_reader(reader)
        writer.merge(0,update_reader,import_outline=False)
        labels=DictionaryObject({NameObject('/Nums'):ArrayObject([NumberObject(0),DictionaryObject({NameObject('/S'):NameObject('/D'),NameObject('/P'):TextStringObject('Aktualisierung-')}),NumberObject(update_count),DictionaryObject({NameObject('/S'):NameObject('/D'),NameObject('/St'):NumberObject(1)})])})
        writer._root_object[NameObject('/PageLabels')]=labels
        writer.add_outline_item('Fachliche Aktualisierung: 5. September 2026',0)
        writer.add_metadata({'/Title':title,'/Subject':'Datierte Ergänzung vor unverändert nachvollziehbarer Ausgangsfassung','/WOEKSiteRevision':DATE,'/WOEKOriginalSha256':sha(ROOT/source)})
        with (OUT/filename).open('wb') as stream:writer.write(stream)
        # Preserve original text per page, including the existing T-SROI erratum.
        check=PdfReader(OUT/filename)
        for index in {0,len(reader.pages)//2,len(reader.pages)-1}:
            assert check.pages[index+update_count].extract_text()==reader.pages[index].extract_text(),(source,index)
        record(filename,title,'reading-edition',source,len(reader.pages))
        print(filename,len(check.pages),'pages')
    MANIFEST.write_text(json.dumps({'reviewedAt':DATE,'releaseTag':'woek-reference-update-2026-09-05','sources':['content/site/methodik.json','content/site/methodik.inc','content/site/reference-update.json','content/site/impact-controlling.json','scripts/portal/build-impact-controlling.mjs','scripts/publications/build-site-review-pdfs.py'],'files':records},ensure_ascii=False,indent=2)+'\n')
    metadata=json.loads(MANIFEST.read_text());metadata['sourceHashes']={source:sha(ROOT/source) for source in metadata['sources']};MANIFEST.write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
    print('Created',len(records),'PDFs; manifest:',MANIFEST.relative_to(ROOT))
if __name__=='__main__':main()

"""Render source-native SVG diagrams for checksum-bound book corrections.

No original raster is painted over. Each replacement has an editable vector
source, explicit statements and provenance; unknown image originals fail closed.
"""
from pathlib import Path
from xml.sax.saxutils import escape
import json,hashlib,math
from datetime import date
import fitz
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'content/grundlagen/book-figure-corrections-20261010.json'
edition_date=date.fromisoformat(json.loads(DATA.read_text())['date'])
months=('Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember')
edition_label=f'{edition_date.day}. {months[edition_date.month-1]} {edition_date.year}'
OUT=ROOT/'source-assets/generated/book-figures-20261010'
OUT.mkdir(parents=True,exist_ok=True)
NAVY='#102b45';GREEN='#28644e';PAPER='#fbfaf6';INK='#233648';BORDER='#b8c4c7'
WIDTH=1000;PADDING=32;BODY=26;LINE=34
FONT=fitz.Font('helv')
FONT_BOLD=fitz.Font('hebo')

def wrap(text,width,size,bold=False):
    font=FONT_BOLD if bold else FONT
    output=[]
    for paragraph in text.split('\n'):
        current=''
        for word in paragraph.split():
            candidate=(current+' '+word).strip()
            if font.text_length(candidate,fontsize=size)>width and current:
                output.append(current);current=word
            else:current=candidate
            if font.text_length(current,fontsize=size)>width:
                raise RuntimeError('Unbreakable text exceeds diagram width: '+current)
        if current:output.append(current)
    return output

report=[]
report_path=ROOT/'reports/consistency-20261009/book-figure-build.json'
previous={e['key']:e for e in json.loads(report_path.read_text())} if report_path.exists() else {}
for item in json.loads(DATA.read_text())['entries']:
    title=wrap(item['title'],WIDTH-2*PADDING,40,bold=True)
    subtitle=wrap(item['subtitle'],WIDTH-2*PADDING,26)
    header=32+len(title)*48+len(subtitle)*36+24
    note=wrap(item['note'],WIDTH-2*PADDING,24)
    bottom=32+len(note)*31+48
    cards=item.get('cards');table=item.get('table');prose=item.get('prose');layouts=[]
    if prose:
        layouts=[wrap(paragraph,WIDTH-2*PADDING,BODY) for paragraph in prose]
        content=sum(len(lines)*LINE+24 for lines in layouts)
    elif cards:
        width=(WIDTH-2*PADDING-24)/2
        row_heights=[]
        for index,(heading,body) in enumerate(cards):
            headings=wrap(heading,width-40,30,bold=True);lines=wrap(body,width-40,BODY)
            needed=34+len(headings)*36+16+len(lines)*LINE
            layouts.append((headings,lines));row=index//2
            if len(row_heights)<=row:row_heights.append(needed)
            else:row_heights[row]=max(row_heights[row],needed)
        content=sum(row_heights)+24*(len(row_heights)-1)
    else:
        columns=len(table[0]);widths=[WIDTH-2*PADDING] if columns==1 else ([290,646] if columns==2 else [280,350,306])
        assert sum(widths)==WIDTH-2*PADDING
        row_heights=[]
        for index,row in enumerate(table):
            cells=[wrap(text,widths[n]-24,26,bold=index==0) for n,text in enumerate(row)]
            layouts.append(cells);row_heights.append(22+max(map(len,cells))*34)
        content=sum(row_heights)
    height=max(round(WIDTH*item['aspect'][1]/item['aspect'][0]),math.ceil(header+content+bottom))
    shapes=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" viewBox="0 0 {WIDTH} {height}">',
            '<title>'+escape(item['title'])+'</title>',
            '<desc>'+escape(item['subtitle']+' '+item['note'])+'</desc>',
            f'<rect width="{WIDTH}" height="{height}" fill="{PAPER}"/>']
    def rect(x,y,w,h,fill,stroke=BORDER):shapes.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}"/>')
    def text(lines,x,y,size,color=INK,bold=False,line=None):
        step=line or size*1.25
        for n,value in enumerate(lines):
            shapes.append(f'<text x="{x}" y="{y+n*step}" font-family="Arial" font-size="{size}" font-weight="{"bold" if bold else "normal"}" fill="{color}">{escape(value)}</text>')
    y=32+40;text(title,PADDING,y,40,NAVY,True,line=48);y+=len(title)*48
    text(subtitle,PADDING,y,26,GREEN,line=36)
    y=header
    if prose:
        for lines in layouts:
            text(lines,PADDING,y+BODY,BODY,line=LINE)
            y+=len(lines)*LINE+24
    elif cards:
        for index,(headings,lines) in enumerate(layouts):
            row=index//2;col=index%2;x=PADDING+col*(width+24);top=y+sum(row_heights[:row])+24*row;h=row_heights[row]
            rect(x,top,width,h,'#ffffff');text(headings,x+20,top+40,30,GREEN,True,line=36)
            text(lines,x+20,top+40+len(headings)*36+12,BODY,line=LINE)
    else:
        for index,cells in enumerate(layouts):
            h=row_heights[index];x=PADDING
            for col,lines in enumerate(cells):
                rect(x,y,widths[col],h,NAVY if index==0 else '#ffffff')
                text(lines,x+12,y+34,26,'#ffffff' if index==0 else INK,index==0,line=34);x+=widths[col]
            y+=h
    note_top=height-bottom+28
    text(note,PADDING,note_top,24,line=31)
    text([f'Natalie Weber · Bereinigter Modellstand {edition_label}'],PADDING,height-22,24,GREEN)
    shapes.append('</svg>');svg='\n'.join(shapes)+'\n';svg_path=OUT/f'figure-{item["key"]}.svg';svg_path.write_text(svg)
    source=fitz.open(stream=svg.encode(),filetype='svg');pdf=fitz.open('pdf',source.convert_to_pdf());pix=pdf[0].get_pixmap(matrix=fitz.Matrix(3,3),alpha=False)
    target=OUT/f'figure-{item["key"]}.png';pix.save(target)
    # Preserve each DOCX media type as well as its relationship name.
    if any(p['media'].endswith('.jpeg') for p in item['placements']):
        target=OUT/f'figure-{item["key"]}.jpeg';Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(target,quality=96,subsampling=0)
    current_sha=hashlib.sha256(target.read_bytes()).hexdigest()
    status=previous.get(item['key'],{}).get('visualReview','PENDING') if previous.get(item['key'],{}).get('sha256')==current_sha else 'PENDING'
    row={'key':item['key'],'svg':str(svg_path.relative_to(ROOT)),
         'svgSha256':hashlib.sha256(svg_path.read_bytes()).hexdigest(),
         'sourceEntrySha256':hashlib.sha256(json.dumps(item,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
         'image':str(target.relative_to(ROOT)),'sha256':current_sha,'size':[WIDTH,height],'originalSha256':item['originalSha256'],'placements':item['placements'],'visualReview':status}
    if status=='PASS':
        prior=previous[item['key']]
        for field in ['reviewedImageSha256','visualReviewAt','reviewEvidence']:
            if field in prior:row[field]=prior[field]
    report.append(row)
    source.close();pdf.close()
    target=ROOT/'reports/consistency-20261009/book-figure-build.json';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'{len(report)} editable SVG diagrams rendered; visual review pending.')

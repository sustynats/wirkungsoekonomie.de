"""Build the actual public v1.8 reader and online source from reviewed units."""
from pathlib import Path
import hashlib, html, json, re
import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, CondPageBreak
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'content/grundlagen/guide-public-reading-v1.8-20261012.json'
data = json.loads(SOURCE.read_text())
primary = ROOT / 'source-assets/originals/WOeK_Begriffsleitfaden_v1.8_2026-10-01.pdf'
if hashlib.sha256(primary.read_bytes()).hexdigest() != data['sourceSha256']:
    raise RuntimeError('Primary guide changed; no publishing overwrite')
if data['status'] not in {'SOURCE_PREPARED_RENDER_REVIEW_PENDING', 'REVIEWED'}:
    raise RuntimeError('Unknown reading source status')

font_root = Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless'
font_candidates = list(font_root.rglob('DejaVuSans.ttf')) + list(Path('/usr/share/fonts/truetype/dejavu').glob('DejaVuSans.ttf'))
if not font_candidates:
    raise RuntimeError('The source needs a font supporting Delta and arrows')
fonts = font_candidates[0].parent
for name, filename in [('Guide', 'DejaVuSans.ttf'), ('GuideBold', 'DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(fonts / filename)))
pdfmetrics.registerFontFamily('Guide', normal='Guide', bold='GuideBold', italic='Guide', boldItalic='GuideBold')
NAVY = colors.HexColor('#17231b')
GREEN = colors.HexColor('#215e45')
styles = {
    'title': ParagraphStyle('title', fontName='GuideBold', fontSize=23, leading=29, spaceAfter=13, textColor=NAVY),
    'heading': ParagraphStyle('heading', fontName='GuideBold', fontSize=14, leading=19, spaceBefore=16, spaceAfter=8, keepWithNext=True, textColor=NAVY),
    'subheading': ParagraphStyle('subheading', fontName='GuideBold', fontSize=11, leading=15.5, spaceBefore=11, spaceAfter=7, keepWithNext=True, textColor=NAVY),
    'paragraph': ParagraphStyle('paragraph', fontName='Guide', fontSize=9.3, leading=14.2, spaceAfter=8, textColor=NAVY),
    'bullet': ParagraphStyle('bullet', fontName='Guide', fontSize=9.3, leading=14.2, leftIndent=11, firstLineIndent=-8, spaceAfter=6, textColor=NAVY),
    'cell': ParagraphStyle('cell', fontName='Guide', fontSize=8.6, leading=12.6, textColor=NAVY),
    'cellhead': ParagraphStyle('cellhead', fontName='GuideBold', fontSize=8.6, leading=12.6, textColor=NAVY),
}

def markup(text):
    parts = []
    position = 0
    for match in re.finditer(r'https?://[^\s<>]+', text):
        parts.append(html.escape(text[position:match.start()]))
        url = match[0].rstrip('.,;)')
        parts.append('<a href="'+html.escape(url, quote=True)+'" color="#215e45">'+html.escape(url)+'</a>')
        parts.append(html.escape(match[0][len(url):]))
        position = match.end()
    parts.append(html.escape(text[position:]))
    return ''.join(parts)

def widths(rows, source_index):
    count = len(rows[0])
    if source_index == 203:
        ratios = [.28, .20, .25, .27]
    elif source_index == 413:
        ratios = [.36, .27, .37]
    elif count == 2:
        ratios = [.28, .72]
    elif count == 3:
        ratios = [.25, .375, .375]
    elif count == 4:
        ratios = [.20, .25, .25, .30]
    else:
        raise RuntimeError('Unreviewed table column count')
    return [(A4[0] - 88) * ratio for ratio in ratios]

story = []
online = []
for unit_index, unit in enumerate(data['units']):
    key = 'guide-v18-object-' + str(unit['sourceObject'])
    kind = unit['type']
    if kind == 'table':
        rows = unit['rows']
        cells = [[Paragraph(markup(value), styles['cellhead' if i == 0 else 'cell']) for value in row] for i, row in enumerate(rows)]
        table = Table(cells, colWidths=widths(rows, unit['sourceIndex']), repeatRows=1, hAlign='LEFT')
        table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e7eee7')),
                                  ('GRID', (0,0), (-1,-1), .35, colors.HexColor('#d9d9d9')),
                                  ('VALIGN', (0,0), (-1,-1), 'TOP'),
                                  ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 7),
                                  ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                                  ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f7f9f6')])]))
        story.extend([table, Spacer(1, 10)])
        head = '<thead><tr>' + ''.join('<th scope="col">' + html.escape(x) + '</th>' for x in rows[0]) + '</tr></thead>'
        body = '<tbody>' + ''.join('<tr>' + ''.join('<td>' + html.escape(x) + '</td>' for x in row) + '</tr>' for row in rows[1:]) + '</tbody>'
        online.append('<div class="table-scroll" id="'+key+'"><table>'+head+body+'</table></div>')
    else:
        style = 'subheading' if kind == 'heading' and unit['level'] == 3 else kind
        text = unit['text']
        paragraph = Paragraph(('• ' if kind == 'bullet' else '') + markup(text), styles[style])
        following = data['units'][unit_index+1] if unit_index+1 < len(data['units']) else None
        if kind == 'heading' and following and following['type'] == 'table':
            # Reserve only the heading, column labels and first body row. Keeping
            # the entire table with its heading leaves large, needless gaps.
            sample = [[Paragraph(markup(v), styles['cellhead' if j == 0 else 'cell'])
                       for v in row] for j, row in enumerate(following['rows'][:2])]
            first_rows = Table(sample, colWidths=widths(following['rows'], following['sourceIndex']))
            first_rows.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
                                            ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
            height = paragraph.wrap(A4[0]-88, 9999)[1] + first_rows.wrap(A4[0]-88, 9999)[1]
            story.append(CondPageBreak(height + paragraph.getSpaceBefore() + paragraph.getSpaceAfter() + 4))
            paragraph.keepWithNext = False
        story.append(paragraph)
        tag = 'h2' if kind == 'title' else 'h3' if kind == 'heading' and unit['level'] == 3 else 'h2' if kind == 'heading' else 'p'
        online.append('<'+tag+' id="'+key+'">'+html.escape(text)+'</'+tag+'>')

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Guide', 7)
    canvas.setFillColor(NAVY)
    canvas.drawString(44, 27, 'Natalie Weber | Begriffsleitfaden v1.8 | Lesefassung 12.10.2026')
    canvas.drawRightString(A4[0]-44, 27, str(doc.page))
    canvas.restoreState()

out = ROOT / 'outputs/consistency-2026-10-12/pdf'
out.mkdir(parents=True, exist_ok=True)
target = out / 'woek-begriffsleitfaden-v1.8-lesefassung-2026-10-12.pdf'
SimpleDocTemplate(str(target), pagesize=A4, leftMargin=44, rightMargin=44, topMargin=43, bottomMargin=49,
                  title='Begriffsleitfaden der Wirkungsökonomie v1.8', author='Natalie Weber',
                  creator='Institut für Wirkungsökonomie', subject='Begriffe, Methoden und Grenzen des Wirtschafts- und Gesellschaftsmodells',
                  invariant=1).build(story, onFirstPage=footer, onLaterPages=footer)
reader = PdfReader(target)
writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.add_metadata({'/Author':'Natalie Weber', '/Creator':'Institut für Wirkungsökonomie',
                     '/Producer':'Institut für Wirkungsökonomie', '/WOEKReadingEdition':'2026-10-12', '/WOEKPrimaryVersion':'1.8',
                     '/CreationDate':"D:20261012000000+00'00'", '/ModDate':"D:20261012000000+00'00'"})
temporary = target.with_suffix('.prepared.pdf')
with temporary.open('wb') as stream:
    writer.write(stream)
temporary.replace(target)
inc = ROOT / 'source-assets/generated/guide-v18-reading.inc'
inc.write_text('\n'.join(online)+'\n')
report = dict(status='BUILT_PENDING_VISUAL_REVIEW', sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              primarySha256=data['sourceSha256'], pdf=str(target.relative_to(ROOT)),
              pdfSha256=hashlib.sha256(target.read_bytes()).hexdigest(), pages=len(reader.pages),
              units=len(data['units']), tables=sum(u['type']=='table' for u in data['units']),
              onlineSource=str(inc.relative_to(ROOT)), onlineSourceSha256=hashlib.sha256(inc.read_bytes()).hexdigest())
(ROOT/'reports/consistency-20261009/guide-reading-build.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

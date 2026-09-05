#!/usr/bin/env python3
"""Build a dated companion erratum; never rewrite its historical sources."""
import hashlib
import importlib.util
import json
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
SOURCE = 'content/site/publication-erratum-2026-09-06.json'
RENDERER = 'scripts/publications/build-site-review-pdfs.py'
MANIFEST = ROOT / 'assets/data/publication-erratum-2026-09-06.json'
OUT = ROOT / 'outputs/site-review-2026-09-05/pdf/woek-fachpapiere-erratum-2026-09-06.pdf'
TAG = 'woek-publication-erratum-2026-09-06'
spec = importlib.util.spec_from_file_location('woek_pdf_layout', ROOT / RENDERER)
layout = importlib.util.module_from_spec(spec)
spec.loader.exec_module(layout)

def sha(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(layout.colors.HexColor('#d8d5cf'))
    canvas.line(48, 43, layout.A4[0]-48, 43)
    canvas.setFont('Woek', 7.5)
    canvas.setFillColor(layout.NAVY)
    canvas.drawString(48, 29, 'Wirkungsökonomie | Erratum vom 06.09.2026')
    canvas.drawRightString(layout.A4[0]-48, 29, str(doc.page))
    canvas.restoreState()

def main():
    data = json.loads((ROOT / SOURCE).read_text())
    assets = json.loads((ROOT / 'assets/data/public-release-assets.json').read_text())['assets']
    P = layout.P
    story = [P('DATIERTE FACHLICHE ERGÄNZUNG | 6. SEPTEMBER 2026', 'kicker'), P(escape(data['title']), 'h1'), P(escape(data['intro'])), P(escape(data['scope']))]
    story += [P('Drei Präzisierungen für die heutige Anwendung', 'h2'), layout.table([
        ['Bereich', 'Heutige Einordnung'],
        ['Register', 'Kennung, Prüfgegenstand, Operationalisierung und Messwert getrennt ausweisen.'],
        ['T-SROI', 'Transformative Nutzenströme gesondert belegen. Keine freien Aufschlagsfaktoren.'],
        ['Sprache und Medien', 'Analogie, Reichweite, Wirkungspotenzial und eingetretene Veränderung unterscheiden.'],
    ]), P('So wird das Erratum mit dem Original gelesen', 'h2'), P('Die folgenden Seiten nennen jeweils das betroffene Werk und die physische PDF-Seite, gezählt ab der ersten Seite der Originaldatei. Gedruckte Seitenzahlen können abweichen. Die Präzisierung gilt für die heutige Verwendung der bezeichneten Stelle. Sie erklärt nicht das gesamte Werk für ungültig.'), P('Bei Zitaten bleiben Originalausgabe und Fundstelle erhalten; diese Ergänzung ist zusätzlich anzugeben. Die ursprünglichen PDF-Dateien werden nicht still überschrieben.'), P('<link href="https://wirkungsoekonomie.de/referenz/aktualisierung/" color="#174f38">Aktuelle Publikationsstände und ergänzte Lesefassungen</link>')]
    original_hashes = {}
    for group in data['groups']:
        story += [layout.PageBreak(), P('PRÄZISIERUNG | '+escape(group['id'].upper()), 'kicker'), P(escape(group['title']), 'h2'), P(escape(group['correction'])), P(escape(group['example'])), P('Betroffene Fundstellen', 'h3')]
        for doc in group['documents']:
            url = assets[doc['source']]
            story.append(layout.KeepTogether([
                P(escape(doc['title']), 'h3'),
                P('Physische PDF-Seite: '+escape(doc['pages'])+'. '+escape(doc['note'])),
                P('<link href="'+escape(url)+'" color="#174f38">Historische Originaldatei öffnen</link>', 'fine'),
            ]))
            for source in [doc['source'], *doc.get('aliases', [])]:
                original_hashes[source] = sha(ROOT/source)
        story.append(P('<link href="https://wirkungsoekonomie.de'+escape(group['reference'])+'" color="#174f38">'+escape(group['referenceLabel'])+'</link>', 'fine'))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    layout.SimpleDocTemplate(str(OUT), pagesize=layout.A4, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=58, title=data['title'], author='Wirkungsökonomie', subject='Datierte Präzisierungen mit Fundstellen; historische Originale bleiben nachvollziehbar', pageCompression=1, invariant=1).build(story, onFirstPage=footer, onLaterPages=footer)
    pages = len(layout.PdfReader(OUT).pages)
    sources = [SOURCE, RENDERER, 'scripts/publications/build-publication-erratum.py']
    manifest = {'reviewedAt': data['reviewedAt'], 'releaseTag': TAG, 'filename': OUT.name, 'url': 'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/'+TAG+'/'+OUT.name, 'sha256': sha(OUT), 'bytes': OUT.stat().st_size, 'pages': pages, 'sourceHashes': {source: sha(ROOT/source) for source in sources}, 'originalHashes': original_hashes}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'pdf': str(OUT), 'pages': pages, 'bytes': manifest['bytes'], 'originalFiles': len(original_hashes)}))

if __name__ == '__main__':
    main()

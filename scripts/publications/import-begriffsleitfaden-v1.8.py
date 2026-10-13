"""Import the exact v1.8 primary PDF; preserve the historical editions."""
from pathlib import Path
import hashlib,html,json,re
import pymupdf

ROOT=Path(__file__).resolve().parents[2]
PDF=ROOT/'source-assets/originals/WOeK_Begriffsleitfaden_v1.8_2026-10-01.pdf'
EXPECTED='f08258822e45066cc9a5870bad6056a051633b971e5f3fddb5f199360b1de75a'
if hashlib.sha256(PDF.read_bytes()).hexdigest()!=EXPECTED:
    raise RuntimeError('Primary guide checksum differs; review the source, do not overwrite.')
doc=pymupdf.open(PDF)
md=['# Führender Begriffsleitfaden der Wirkungsökonomie v1.8','',
    'Vollständiger Textauszug der unveränderten Original-PDF vom 1. Oktober 2026. Die PDF bleibt maßgeblich für Tabellen und Abbildungen.',
    '',f'Quellprüfsumme SHA-256: {EXPECTED}','']
parts=['<p>Vollständiger Textauszug der Originalfassung v1.8 vom 1. Oktober 2026. Für Tabellen, Abbildungen und Seitenlayout ist die unveränderte PDF maßgeblich.</p>']
for i,page in enumerate(doc,1):
    text=page.get_text().strip()
    md.extend([f'## Originalseite {i}','',text,''])
    # A page-bound transcript retains all source text without inventing table roles.
    parts.append(f'<section id="leitfaden-v18-seite-{i}"><h2>Originalseite {i}</h2><div class="source-transcript" style="white-space:pre-wrap;overflow-wrap:anywhere">{html.escape(text)}</div></section>')
(ROOT/'source-assets/generated/WOeK_Begriffsleitfaden_fuehrend_v1.8.md').write_text('\n'.join(md))
(ROOT/'content/documents/online/woek-begriffsleitfaden-fuehrend.inc').write_text('\n'.join(parts))
print(f'Exact guide imported: {len(doc)} pages; SHA-256 {EXPECTED}')

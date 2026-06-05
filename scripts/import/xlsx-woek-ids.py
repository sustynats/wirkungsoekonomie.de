#!/usr/bin/env python3
from __future__ import annotations

import json
import html
import shutil
import sys
import hashlib
from datetime import datetime, timezone
from pathlib import Path

try:
    import openpyxl
except Exception as exc:
    raise SystemExit(f"openpyxl is required: {exc}")

src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/Users/hagen/Desktop/WÖk-Konzepte etc/Kerndokumente/WOeK_Master_Items_final_v1.2.xlsx")
if not src.exists():
    raise SystemExit(f"Missing XLSX: {src}")

wb = openpyxl.load_workbook(src, data_only=True)
ws = wb.active
rows = list(ws.iter_rows(values_only=True))
headers = [str(cell or "").strip() for cell in rows[0]]
items = []
for row in rows[1:]:
    item = {headers[i] or f"column_{i+1}": row[i] for i in range(min(len(headers), len(row)))}
    if any(value not in (None, "") for value in item.values()):
        items.append(item)

out = Path("public/data/woek-ids.json")
out.parent.mkdir(parents=True, exist_ok=True)
originals = Path("public/downloads/originals")
originals.mkdir(parents=True, exist_ok=True)
original_xlsx = originals / "WOeK_Master_Items_final_v1.2.xlsx"
shutil.copy2(src, original_xlsx)

def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

source_hash = digest(original_xlsx)
payload = {
    "sourceFile": str(src),
    "originalFileUrl": "/public/downloads/originals/WOeK_Master_Items_final_v1.2.xlsx",
    "sourceHash": source_hash,
    "sourceVersion": "2026.0",
    "importVersion": "2026.1-import",
    "liveReferenceVersion": "2026.2-live-reference",
    "reviewStatus": "delta-reviewed",
    "items": items,
}
out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
Path("src/data").mkdir(parents=True, exist_ok=True)
Path("src/data/woek-ids.json").write_text(out.read_text(encoding="utf-8"), encoding="utf-8")

def esc(value: object) -> str:
    return html.escape("" if value is None else str(value), quote=True)

def cell(value: object, header: bool = False) -> str:
    tag = "th" if header else "td"
    return f"<{tag}>{esc(value)}</{tag}>"

def meta_row(label: str, value: str) -> str:
    return f"<dt>{esc(label)}</dt><dd>{esc(value)}</dd>"

visible_headers = headers
header_html = "".join(cell(header, True) for header in visible_headers)
rows_html = []
for index, item in enumerate(items, start=1):
    row_id = esc(str(item.get("WOK_ID") or item.get("WÖK_ID") or f"woek-id-{index:04d}").replace(" ", "-").lower())
    rows_html.append(
        f'<tr id="{row_id}" data-document-id="woek-master-items-final-v1-2" '
        f'data-section-id="woek-master-items-final-v1-2-register" data-paragraph-id="{row_id}" '
        f'data-version="2026.2-live-reference" data-content-hash="{hashlib.sha256(json.dumps(item, ensure_ascii=False, default=str).encode("utf-8")).hexdigest()[:16]}">'
        + "".join(cell(item.get(header)) for header in visible_headers)
        + "</tr>"
    )

table_html = (
    '<div class="table-wrap"><table class="data-table woek-id-table">'
    f"<thead><tr>{header_html}</tr></thead><tbody>{''.join(rows_html)}</tbody></table></div>"
)

page = f"""<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WÖk Master Items final v1.2 - Wirkungsökonomie Online</title>
    <meta name="description" content="Strukturiertes WÖk-ID-Register aus WOeK_Master_Items_final_v1.2.xlsx.">
    <meta name="search_title" content="WÖk Master Items final v1.2">
    <meta name="search_description" content="Strukturiertes WÖk-ID-Register mit SDG/SDG+-Zuordnung und Indikatorfamilien.">
    <meta name="search_section" content="Dokumente">
    <meta name="search_type" content="WÖk-ID-Register">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260605-wirkungsraum-stage5">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="../../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="../../index.html">Start</a>
        <a href="../../referenz/">Referenz</a>
        <a href="../../begriffe/">Begriffe</a>
        <a href="../../dokumente/">Dokumente</a>
        <a href="../../suche.html">Suche</a>
      </nav>
    </header>
    <main class="reference-work" data-pagefind-body>
      <article class="article-shell">
        <nav class="breadcrumb"><a href="../">Dokumente</a> / WÖk Master Items final v1.2</nav>
        <h1>WÖk Master Items final v1.2</h1>
        <p class="lead">Strukturierte Webfassung aus der gelieferten XLSX-Datei. Der PDF-Fallback bleibt als Original-/Archivquelle auffindbar, führend für das Register ist diese Tabelle.</p>
        <p><a class="button" href="../../public/downloads/originals/WOeK_Master_Items_final_v1.2.xlsx">Original-XLSX öffnen</a> <a class="button secondary" href="../../public/downloads/originals/WOeK_Master_Items_final_v1.2.pdf">PDF-Fallback öffnen</a></p>
        <section class="meta-box">
          <h2>Metadaten</h2>
          <dl>
            {meta_row("Dokumenttyp", "register")}
            {meta_row("Status", "führendes-referenzregister")}
            {meta_row("Source-Version", "2026.0")}
            {meta_row("Import-Version", "2026.1-import")}
            {meta_row("Live-Reference-Version", "2026.2-live-reference")}
            {meta_row("Web-Version", "2026.2-live-reference")}
            {meta_row("Reviewstatus", "delta-reviewed")}
            {meta_row("Terminologiebasis", "WOeK_Begriffsleitfaden_fuehrend_v1.0.md")}
            {meta_row("Originaldatei", "WOeK_Master_Items_final_v1.2.xlsx")}
            {meta_row("Source-Hash", source_hash)}
            {meta_row("Registerzeilen", str(len(items)))}
          </dl>
        </section>
        <section class="callout live-reference-notice">
          <h2>Live-Reference-Hinweis 2026.2</h2>
          <p>Diese Registerseite ersetzt den früheren PDF-Fließtextimport durch die strukturierte XLSX-Quelle. Die Originaldatei bleibt zitierfähig; die Webfassung dient als maschinenlesbare Online-Referenz für Suche, Manifest und WÖk-ID-Verknüpfungen.</p>
        </section>
        <section>
          <h2 id="woek-master-items-final-v1-2-register" data-document-id="woek-master-items-final-v1-2" data-section-id="woek-master-items-final-v1-2-register" data-version="2026.2-live-reference" data-content-hash="{hashlib.sha256(str(len(items)).encode("utf-8")).hexdigest()[:16]}">WÖk-ID-Register</h2>
          {table_html}
        </section>
      </article>
    </main>
  </body>
</html>
"""

doc_dir = Path("dokumente/woek-master-items-final-v1-2")
doc_dir.mkdir(parents=True, exist_ok=True)
(doc_dir / "index.html").write_text(page, encoding="utf-8")

imports_path = Path("public/data/workpaper-imports.json")
if imports_path.exists():
    data = json.loads(imports_path.read_text(encoding="utf-8"))
    for doc in data.get("documents", []):
        if doc.get("slug") == "woek-master-items-final-v1-2":
            doc["source"] = str(src)
            doc["originalName"] = "WOeK_Master_Items_final_v1.2.xlsx"
            doc["originalUrl"] = "../public/downloads/originals/WOeK_Master_Items_final_v1.2.xlsx"
            doc["status"] = "führendes-referenzregister"
            doc["reviewStatus"] = "delta-reviewed"
            doc["sourceHash"] = source_hash
            doc["blocks"] = len(items)
            doc["issues"] = []
    imports_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f"Wrote {len(items)} WÖk-ID rows and rendered structured register page.")

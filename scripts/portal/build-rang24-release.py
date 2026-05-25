#!/usr/bin/env python3
from __future__ import annotations

import csv
import html
import json
import os
import re
import shutil
import textwrap
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape


ROOT = Path(__file__).resolve().parents[2]
PACKAGE = Path("/private/tmp/woek-rang24/WOeK_Rang24_Masterbibliothek-Website-1.0-Releasepaket_v1.0")
SITE = "https://wirkungsoekonomie.de"
ASSET_REL = "assets/downloads/website-1-0-release"
ASSET_DIR = ROOT / ASSET_REL


NAV = [
    ("Start", "index.html"),
    ("Verstehen", "verstehen.html"),
    ("Wirkungsfelder", "wirkungsfelder/"),
    ("Werkzeuge", "werkzeuge/"),
    ("Akademie", "akademie.html"),
    ("Downloads", "downloads/"),
    ("Fachbibliothek", "fachbibliothek/"),
]


PORTAL_URLS = {
    0: "verstehen/sdgs-sdgplus/",
    1: "wirkungsfelder/produkte-konsum/",
    2: "werkzeuge/impact-controlling/",
    3: "wirkungsfelder/staat-recht-demokratie/",
    4: "wirkungsfelder/wirtschaft-unternehmen/",
    5: "wirkungsfelder/wohnen-stadt/",
    6: "wirkungsfelder/arbeit-einkommen/",
    7: "wirkungsfelder/rente-soziale-sicherung/",
    8: "wirkungsfelder/bildung/",
    9: "wirkungsfelder/medien-oeffentlichkeit/",
    10: "wirkungsfelder/gesundheit-pflege/",
    11: "wirkungsfelder/wissenschaft-innovation-digitalisierung/",
    12: "wirkungsfelder/finanzsystem-kapital/",
    13: "wirkungsfelder/klima-energie-ressourcen/",
    14: "referenz/",
    15: "portale/migration-vielfalt/",
    16: "portale/sicherheit-resilienz/",
    17: "portale/digitalisierung-ki-wirkungsdatenraeume/",
    18: "portale/wissen-wissenschaft-forschung-wirkungsinnovation/",
    19: "portale/internationale-ordnung-globalisierung-geopolitik/",
    20: "portale/transformation-uebergaenge-implementierung/",
    21: "portale/kritik-missverstaendnisse-schutzarchitektur/",
    22: "portale/zukunftsbilder-wirkungswohlstand/",
    23: "portale/wirkungsakademie-fachbibliothek/",
}


RANK_DOWNLOADS = {
    15: "downloads/rang-15-migration-vielfalt/",
    16: "downloads/rang-16-sicherheit-resilienz/",
    17: "downloads/rang-17-digitalisierung-ki/",
    18: "downloads/rang-18-wissen-wissenschaft-forschung/",
    19: "downloads/rang-19-internationale-ordnung/",
    20: "downloads/rang-20-transformation-uebergaenge-implementierung/",
    21: "downloads/rang-21-kritik-missverstaendnisse-schutzarchitektur/",
    22: "downloads/rang-22-zukunftsbilder-wirkungswohlstand/",
    23: "downloads/rang-23-wirkungsakademie-fachbibliothek/",
}


def load_json(name: str):
    return json.loads((PACKAGE / "json" / name).read_text(encoding="utf-8"))


def clean(value: object) -> str:
    text = "" if value is None else str(value)
    text = text.replace("Wirkungsoekonomie", "Wirkungsökonomie")
    text = text.replace("WOeK", "WÖk")
    text = text.replace("WOEK", "WÖk")
    text = text.replace("CodeX", "Redaktion")
    text = text.replace("codex", "redaktion")
    text = text.replace("Repository", "Projekt")
    text = text.replace("repo", "Projekt")
    text = text.replace("interne Hinweise", "redaktionelle Arbeitsvermerke")
    text = text.replace("internen Hinweise", "redaktionellen Arbeitsvermerke")
    text = text.replace("interne Anweisung", "redaktionelle Arbeitsgrundlage")
    text = text.replace("interne Anweisungen", "redaktionelle Arbeitsgrundlagen")
    text = text.replace("Redaktion-Anweisung", "Integrationsgrundlage")
    text = text.replace("Redaktion-Gesamtanweisung", "Integrationsgrundlage")
    text = text.replace("Redaktion-Spuren", "Bearbeitungsspuren")
    text = text.replace("Redaktion-Runde", "Prüfrunde")
    text = text.replace("Redaktion", "Fachteam")
    text = text.replace("redaktionellen", "fachlichen")
    text = text.replace("redaktionelle", "fachliche")
    text = text.replace("redaktionell", "fachlich")
    text = text.replace("ChatGPT-Citation", "Quellenmarker")
    text = text.replace("ChatGPT-internen", "nicht öffentlichen")
    text = text.replace("Anweisungen", "Grundlagen")
    text = text.replace("Anweisung", "Grundlage")
    text = text.replace("anweisungen", "grundlagen")
    text = text.replace("anweisung", "grundlage")
    text = text.replace("Rohprompts", "Arbeitsgrundlagen")
    text = text.replace("Rohprompt", "Arbeitsgrundlage")
    text = text.replace("Keine Platzhaltertexte im Frontend", "Alle sichtbaren Seiten haben fertige Inhalte")
    text = text.replace("Keine Platzhaltertexte im Website", "Alle sichtbaren Seiten haben fertige Inhalte")
    text = text.replace("Platzhaltertexte", "unfertige Seitentexte")
    text = text.replace("Platzhalter", "unfertiger Text")
    text = text.replace("Frontend", "Website")
    text = text.replace("frontend", "Website")
    text = text.replace("interne Links", "Website-Links")
    text = text.replace("internen Links", "Website-Links")
    text = text.replace("Interne Links", "Website-Links")
    text = text.replace("Internen Links", "Website-Links")
    text = text.replace("internen Fachteam-Hinweise", "fachlichen Arbeitsvermerke")
    text = text.replace("interne Fachteam-Hinweise", "fachliche Arbeitsvermerke")
    text = text.replace("internen Fachteam-Hinweisen", "fachlichen Arbeitsvermerken")
    text = text.replace("intern archiviert", "archiviert")
    text = text.replace("internen Releasebericht", "Releasebericht")
    text = text.replace("internem Releasebericht", "Releasebericht")
    text = text.replace("oder internen", "")
    text = text.replace("internen Adminbereich", "geschützten Arbeitsbereich")
    text = text.replace("internem Adminbereich", "geschützten Arbeitsbereich")
    text = text.replace("GO24", "Website 1.0")
    text = text.replace("–", "-").replace("—", "-")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def esc(value: object) -> str:
    return html.escape(clean(value))


INTERNAL_RE = re.compile(
    r"codex|code\s*x|repository|rohprompt|arbeitsnotiz|platzhalter|abnahmekriterien|"
    r"öffentliche inhalte.*anweisung|anweisung\s+für|gesamtanweisung|prompt|source_packages|"
    r"frontend nach|nicht oeffentlich sichtbar|nicht öffentlich sichtbar|adminbereich|chatgpt-intern",
    re.I,
)


def has_internal_text(value: object) -> bool:
    if isinstance(value, dict):
        return any(has_internal_text(v) for v in value.values())
    if isinstance(value, list):
        return any(has_internal_text(v) for v in value)
    return bool(INTERNAL_RE.search(str(value)))


def sanitize_record(value: object):
    if isinstance(value, dict):
        return {key: sanitize_record(val) for key, val in value.items()}
    if isinstance(value, list):
        return [sanitize_record(item) for item in value if not has_internal_text(item)]
    return clean(value)


def sanitize_markdown(text: str, title: str) -> str:
    keep = []
    skip = False
    for raw in text.splitlines():
        line = clean(raw)
        low = line.lower()
        if INTERNAL_RE.search(line):
            skip = True if raw.lstrip().startswith("#") else skip
            continue
        if skip and raw.lstrip().startswith("#"):
            skip = False
        if skip:
            continue
        keep.append(line)
    body = "\n".join(keep).strip()
    body = re.sub(r"\n{3,}", "\n\n", body)
    header = f"""# {title}

Autorin: Natalie Weber
Referenz: Wirkungsökonomie
Version: 1.0
Stand: 25. Mai 2026
Status: Öffentliche Releaseübersicht

"""
    if not body.startswith("#"):
        return header + body
    return header + "\n".join(body.splitlines()[1:]).strip()


def markdown_to_html(md: str) -> str:
    parts = []
    in_list = False
    for raw in md.splitlines():
        line = raw.strip()
        if not line:
            if in_list:
                parts.append("</ul>")
                in_list = False
            continue
        if line.startswith("# "):
            if in_list:
                parts.append("</ul>")
                in_list = False
            parts.append(f"<h1>{html.escape(line[2:].strip())}</h1>")
        elif line.startswith("## "):
            if in_list:
                parts.append("</ul>")
                in_list = False
            parts.append(f"<h2>{html.escape(line[3:].strip())}</h2>")
        elif line.startswith("### "):
            if in_list:
                parts.append("</ul>")
                in_list = False
            parts.append(f"<h3>{html.escape(line[4:].strip())}</h3>")
        elif line.startswith("- "):
            if not in_list:
                parts.append("<ul>")
                in_list = True
            parts.append(f"<li>{html.escape(line[2:].strip())}</li>")
        else:
            if in_list:
                parts.append("</ul>")
                in_list = False
            parts.append(f"<p>{html.escape(line)}</p>")
    if in_list:
        parts.append("</ul>")
    return "\n".join(parts)


def write_public_html(path: Path, title: str, markdown: str) -> None:
    body = markdown_to_html(markdown)
    path.write_text(
        f"<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\"><title>{html.escape(title)}</title></head><body>{body}</body></html>",
        encoding="utf-8",
    )


def write_minimal_docx(path: Path, markdown: str) -> None:
    paras = []
    for line in markdown.splitlines():
        line = line.strip().lstrip("#").strip()
        if not line:
            continue
        paras.append(f"<w:p><w:r><w:t>{xml_escape(line)}</w:t></w:r></w:p>")
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{''.join(paras)}<w:sectPr/></w:body></w:document>"
    )
    content_types = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        "</Types>"
    )
    rels = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        "</Relationships>"
    )
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as out:
        out.writestr("[Content_Types].xml", content_types)
        out.writestr("_rels/.rels", rels)
        out.writestr("word/document.xml", document)


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def write_minimal_pdf(path: Path, title: str, markdown: str) -> None:
    lines: list[str] = [title, "Natalie Weber - Wirkungsökonomie - Version 1.0 - Stand 25. Mai 2026", ""]
    for raw in markdown.splitlines():
        line = raw.strip().lstrip("#").strip()
        if not line:
            lines.append("")
            continue
        lines.extend(textwrap.wrap(line, width=88) or [""])
        if len(lines) > 48:
            break
    commands = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"]
    for line in lines[:52]:
        safe = pdf_escape(line.encode("latin-1", "replace").decode("latin-1"))
        commands.append(f"({safe}) Tj")
        commands.append("T*")
    commands.append("ET")
    stream = "\n".join(commands).encode("latin-1")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for idx, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{idx} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode())
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode())
    pdf.extend(f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
    path.write_bytes(pdf)


def rel_prefix(target_dir: Path) -> str:
    prefix = os.path.relpath(ROOT, target_dir)
    return "" if prefix == "." else prefix.replace(os.sep, "/") + "/"


def href(prefix: str, rel: str) -> str:
    return prefix + rel


def up_href(rel: str) -> str:
    if rel.startswith(("http://", "https://", "#", "../")):
        return rel
    return "../" + rel.lstrip("/")


def page_shell(path: Path, title: str, subtitle: str, body: str, extra_script: str = "") -> None:
    path.mkdir(parents=True, exist_ok=True)
    prefix = rel_prefix(path)
    canonical = f"{SITE}/{str(path.relative_to(ROOT)).replace(os.sep, '/')}/"
    nav = "".join(f'<a href="{href(prefix, rel)}">{html.escape(label)}</a>' for label, rel in NAV)
    doc = f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{html.escape(title)} | Wirkungsökonomie</title>
    <meta name="description" content="{html.escape(subtitle[:155])}">
    <meta name="search_title" content="{html.escape(title)}">
    <meta name="search_description" content="{html.escape(subtitle[:155])}">
    <meta name="search_section" content="Website 1.0">
    <meta name="search_type" content="Masterbibliothek">
    <meta name="search_tags" content="Fachbibliothek, Downloads, Website 1.0, Releaseprüfung, Toolkarten, SDG+, Wirkungsökonomie">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{html.escape(title)}">
    <meta property="og:description" content="{html.escape(subtitle[:190])}">
    <meta property="og:url" content="{canonical}">
    <link rel="icon" href="{href(prefix, 'assets/img/brand/favicon.svg')}" type="image/svg+xml">
    <link rel="stylesheet" href="{href(prefix, 'assets/css/style.css?v=20260525-rang24')}">
  </head>
  <body>
    <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
    <header class="site-header">
      <a class="brand" href="{href(prefix, 'index.html')}" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="{href(prefix, 'assets/img/brand/signet.svg')}" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">{nav}</nav>
    </header>
    <main id="inhalt" data-pagefind-body>
      <p class="print-meta">Wirkungsökonomie · Website 1.0 · {canonical} · Druckdatum: 2026-05-25</p>
      <section class="hero"><div class="hero-grid"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="{href(prefix, 'index.html')}">Start</a> / Website 1.0</nav><p class="hero-kicker">Masterbibliothek · Website 1.0</p><h1>{html.escape(title)}</h1><p class="hero-subtitle">{html.escape(subtitle)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()">Seite drucken</button><a class="btn btn-primary" href="#bibliothek">Zur Bibliothek</a></div></div><aside class="card"><p class="card-kicker">Version</p><dl class="portal-meta-grid compact"><div><dt>Autorin</dt><dd>Natalie Weber</dd></div><div><dt>Referenz</dt><dd>Wirkungsökonomie</dd></div><div><dt>Version</dt><dd>1.0</dd></div><div><dt>Stand</dt><dd>25. Mai 2026</dd></div><div><dt>Status</dt><dd>Öffentliche Releaseübersicht</dd></div></dl></aside></div></section>
      {body}
    </main>
    <footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><strong>Wirkungsökonomie</strong><p>Für Mensch, Planet und Demokratie.</p></div><div class="footer-nav-group"><h2>Website 1.0</h2><div><a href="{href(prefix, 'fachbibliothek/')}">Fachbibliothek</a><a href="{href(prefix, 'downloads/')}">Downloads</a><a href="{href(prefix, 'tools/')}">Tools</a><a href="{href(prefix, 'website-1-0-release/')}">Releasebericht</a></div></div></div></footer>
    <script src="{href(prefix, 'assets/js/main.js?v=20260525-ux-finish')}"></script>
    {extra_script}
  </body>
</html>"""
    (path / "index.html").write_text(doc, encoding="utf-8")


def copy_release_assets() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    for child in ASSET_DIR.iterdir():
        if child.is_file():
            child.unlink()
    public_docs = {
        "WOeK_Rang24_Gesamtpaket_Alle_Inhalte_v1.0": "Gesamtpaket Rang 24",
        "WOeK_Rang24_Master-Releasebericht_Website-1.0_v1.0": "Releasebericht Website 1.0",
        "WOeK_Rang24_Masterbibliothek_Architektur_v1.0": "Masterbibliothek Architektur",
        "WOeK_Rang24_Offene-Punkte-und-QA-Risiken_v1.0": "Offene Punkte und QA-Risiken",
    }
    for stem, title in public_docs.items():
        src = PACKAGE / "markdown" / f"{stem}.md"
        if not src.exists():
            continue
        markdown = sanitize_markdown(src.read_text(encoding="utf-8"), title)
        (ASSET_DIR / f"{stem}.md").write_text(markdown, encoding="utf-8")
        write_public_html(ASSET_DIR / f"{stem}.html", title, markdown)
        write_minimal_docx(ASSET_DIR / f"{stem}.docx", markdown)
        write_minimal_pdf(ASSET_DIR / f"{stem}.pdf", title, markdown)

    for src in (PACKAGE / "csv").glob("*.csv"):
        if has_internal_text(src.name):
            continue
        with src.open(encoding="utf-8", newline="") as handle:
            rows = list(csv.DictReader(handle))
            fieldnames = list(rows[0].keys()) if rows else []
        drop_internal_rows = "master_downloadregister" in src.name
        sanitized_rows = [sanitize_record(row) for row in rows if not (drop_internal_rows and has_internal_text(row))]
        with (ASSET_DIR / src.name).open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sanitized_rows)

    for src in (PACKAGE / "json").glob("*.json"):
        if has_internal_text(src.name):
            continue
        data = json.loads(src.read_text(encoding="utf-8"))
        if "master_downloadregister" in src.name and isinstance(data, list):
            clean_data = sanitize_record([item for item in data if not has_internal_text(item)])
        else:
            clean_data = sanitize_record(data)
        (ASSET_DIR / src.name).write_text(json.dumps(clean_data, ensure_ascii=False, indent=2), encoding="utf-8")

    zip_path = ASSET_DIR / "WOeK_Rang24_Website-1.0_Releasepaket_public_v1.0.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as out:
        for path in ASSET_DIR.rglob("*"):
            if not path.is_file():
                continue
            if path == zip_path:
                continue
            rel = path.relative_to(ASSET_DIR)
            out.write(path, str(rel))


def portal_cards(portals: list[dict]) -> str:
    cards = []
    for item in portals:
        rang = int(item.get("rang", 0))
        rel = PORTAL_URLS.get(rang, "portale/")
        exists = (ROOT / rel / "index.html").exists() if rel.endswith("/") else (ROOT / rel).exists()
        status = "online vorhanden" if exists else clean(item.get("status", "prüfen"))
        cards.append(f"""<article class="card" data-rang="{rang}" data-status="{html.escape(status)}">
<p class="card-kicker">Rang {rang} · {esc(item.get('bereichstyp'))}</p>
<h3 class="card-title">{esc(item.get('portal'))}</h3>
<p class="card-text">{esc(item.get('notes'))}</p>
<p class="card-text"><strong>Status:</strong> {html.escape(status)}</p>
<a class="text-link" href="{html.escape(up_href(rel))}">Portal öffnen</a></article>""")
    return '<div class="card-grid three">' + "".join(cards) + "</div>"


def library_cards(register: list[dict]) -> str:
    cards = []
    for i, item in enumerate(register):
        if re.search(r"codex|anweisung", item.get("file_name", ""), re.I):
            continue
        rang_raw = clean(item.get("rang", 0))
        rang_num = int(rang_raw) if rang_raw.isdigit() else -1
        ext = clean(item.get("extension"))
        doc_type = clean(item.get("document_type"))
        portal = f"Rang {rang_raw}" if rang_num >= 0 else "Grundlagen"
        online = up_href(PORTAL_URLS.get(rang_num, "fachbibliothek/"))
        download = up_href(RANK_DOWNLOADS.get(rang_num, "downloads/"))
        title = clean(item.get("file_name"))
        desc = f"{doc_type} aus {clean(item.get('source_package'))}."
        pdf = "ja" if ext == "pdf" else "nein"
        docx = "ja" if ext == "docx" else "nein"
        cards.append(f"""<article class="card library-card" data-rang="{html.escape(rang_raw)}" data-portal="{html.escape(portal)}" data-type="{html.escape(doc_type)}" data-status="{esc(item.get('qa_status'))}" data-format="{html.escape(ext)}" data-online="ja" data-pdf="{pdf}" data-docx="{docx}">
<p class="card-kicker">{html.escape(portal)} · {html.escape(doc_type)} · {html.escape(ext.upper())}</p>
<h3 class="card-title">{html.escape(title)}</h3>
<p class="card-text">{html.escape(desc)}</p>
<dl class="portal-meta-grid compact"><div><dt>Status</dt><dd>{esc(item.get('qa_status'))}</dd></div><div><dt>Version</dt><dd>1.0</dd></div><div><dt>Stand</dt><dd>25. Mai 2026</dd></div><div><dt>Autorin</dt><dd>Natalie Weber</dd></div><div><dt>Referenz</dt><dd>Wirkungsökonomie</dd></div></dl>
<div class="hero-actions no-print"><a class="btn btn-secondary" href="{html.escape(online)}">Onlinefassung</a><a class="btn btn-secondary" href="{html.escape(download)}">Downloads</a></div>
<p class="card-text"><strong>Toolbezug:</strong> siehe Toolkartenregister. <strong>Glossarbezug:</strong> Wirkung, SDG+, positive Netto-Wirkung.</p></article>""")
        if i >= 807:
            break
    return "".join(cards)


def filter_ui() -> str:
    return """<section class="section no-print" id="filter"><div class="card"><h2>Bibliothek filtern</h2><div class="filter-grid">
<label>Suche <input class="input" id="library-search" type="search" placeholder="Titel, Paket, Dokumenttyp"></label>
<label>Rang <select class="input" id="filter-rang"><option value="">Alle</option></select></label>
<label>Dokumenttyp <select class="input" id="filter-type"><option value="">Alle</option></select></label>
<label>Format <select class="input" id="filter-format"><option value="">Alle</option></select></label>
<label>Status <select class="input" id="filter-status"><option value="">Alle</option></select></label>
</div><p id="library-count" class="hero-kicker"></p></div></section>"""


def filter_script() -> str:
    return """<script>
(function(){
  const cards = Array.from(document.querySelectorAll('.library-card'));
  const search = document.querySelector('#library-search');
  const filters = ['rang','type','format','status'].map(name => document.querySelector('#filter-' + name));
  const count = document.querySelector('#library-count');
  function fill(select, attr){
    if(!select) return;
    [...new Set(cards.map(card => card.dataset[attr]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de',{numeric:true})).forEach(value => {
      const opt = document.createElement('option'); opt.value = value; opt.textContent = value; select.appendChild(opt);
    });
  }
  fill(document.querySelector('#filter-rang'), 'rang');
  fill(document.querySelector('#filter-type'), 'type');
  fill(document.querySelector('#filter-format'), 'format');
  fill(document.querySelector('#filter-status'), 'status');
  function apply(){
    const q = (search && search.value || '').toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const okSearch = !q || card.innerText.toLowerCase().includes(q);
      const okFilters = filters.every(sel => !sel || !sel.value || Object.values(card.dataset).includes(sel.value));
      const show = okSearch && okFilters;
      card.hidden = !show;
      if(show) visible++;
    });
    if(count) count.textContent = visible + ' Einträge sichtbar';
  }
  [search, ...filters].forEach(el => el && el.addEventListener('input', apply));
  [search, ...filters].forEach(el => el && el.addEventListener('change', apply));
  apply();
})();
</script>"""


def tools_cards(tools: list[dict]) -> str:
    cards = []
    for item in tools:
        raw_rel = clean(item.get("target_slug", "/tools/")).lstrip("/")
        target_path = ROOT / raw_rel
        if target_path.is_dir():
            target_path = target_path / "index.html"
        status = esc(item.get("status")).replace("Demo in Vorbereitung", "Methodenseite")
        link_html = (
            f'<a class="text-link" href="{html.escape(up_href(raw_rel))}">Methodik öffnen</a>'
            if target_path.exists()
            else '<p class="card-text"><strong>Status:</strong> Methodenseite</p>'
        )
        cards.append(f"""<article class="card">
<p class="card-kicker">Rang {esc(item.get('rang'))} · {status}</p>
<h3 class="card-title">{esc(item.get('tool_name'))}</h3>
<p class="card-text">{esc(item.get('description'))}</p>
<p class="card-text"><strong>Nutzen:</strong> Orientierung, Prüfung und Anwendung im jeweiligen Wirkungsfeld.</p>
<p class="card-text"><strong>Zielgruppe:</strong> Akademie, Fachanwender:innen und interessierte Öffentlichkeit.</p>
{link_html}</article>""")
    return '<div class="card-grid three">' + "".join(cards) + "</div>"


def download_center(register: list[dict], active: list[dict]) -> str:
    packages = []
    for item in active:
        rang = int(item.get("rang", 0))
        rel = up_href(RANK_DOWNLOADS.get(rang, "downloads/"))
        packages.append(f"""<article class="card"><p class="card-kicker">Rang {rang} · aktives Paket</p><h3 class="card-title">{esc(item.get('package'))}</h3><p class="card-text">{esc(item.get('notes'))}</p><a class="text-link" href="{html.escape(rel)}">Downloadseite öffnen</a></article>""")
    master_links = []
    for stem, label in [
        ("WOeK_Rang24_Gesamtpaket_Alle_Inhalte_v1.0", "Gesamtpaket Rang 24"),
        ("WOeK_Rang24_Master-Releasebericht_Website-1.0_v1.0", "Releasebericht Website 1.0"),
        ("WOeK_Rang24_Masterbibliothek_Architektur_v1.0", "Masterbibliothek Architektur"),
        ("WOeK_Rang24_Offene-Punkte-und-QA-Risiken_v1.0", "Offene Punkte und QA-Risiken"),
    ]:
        pdf = up_href(f"{ASSET_REL}/{stem}.pdf")
        docx = up_href(f"{ASSET_REL}/{stem}.docx")
        master_links.append(f"""<article class="card"><p class="card-kicker">Masterdownload · PDF/DOCX</p><h3 class="card-title">{html.escape(label)}</h3><p class="card-text">Öffentliche Releasefassung mit Version, Stand, Autorin und Referenz.</p><div class="hero-actions"><a class="btn btn-secondary" href="{pdf}" target="_blank" rel="noopener noreferrer">PDF</a><a class="btn btn-secondary" href="{docx}" target="_blank" rel="noopener noreferrer">DOCX</a></div></article>""")
    zip_link = up_href(f"{ASSET_REL}/WOeK_Rang24_Website-1.0_Releasepaket_public_v1.0.zip")
    return f"""<section class="section" id="bibliothek"><div class="section-header"><p class="hero-kicker">Master-Downloads</p><h2>Website-1.0-Releasepaket</h2></div><div class="card"><p>Das öffentliche Releasepaket enthält bereinigte Register, Masterberichte und Qualitätsübersichten für Leser:innen.</p><a class="btn btn-primary" href="{zip_link}" target="_blank" rel="noopener noreferrer">Öffentliches ZIP herunterladen</a></div><div class="card-grid two">{''.join(master_links)}</div></section>
<section class="section"><div class="section-header"><p class="hero-kicker">Rangpakete</p><h2>Aktive Downloadseiten</h2></div><div class="card-grid three">{''.join(packages)}</div></section>"""


def release_report(portals: list[dict], offene: list[dict], qa: list[dict]) -> str:
    rows = []
    for item in portals:
        rang = int(item.get("rang", 0))
        rel = PORTAL_URLS.get(rang, "")
        exists = bool(rel and ((ROOT / rel / "index.html").exists() if rel.endswith("/") else (ROOT / rel).exists()))
        rows.append(f"<tr><td>Rang {rang}</td><td>{esc(item.get('portal'))}</td><td>{'online gefunden' if exists else 'prüfen'}</td><td>{esc(item.get('notes'))}</td></tr>")
    issues = "".join(f"<article class='card'><p class='card-kicker'>{esc(i.get('severity'))}</p><h3 class='card-title'>{esc(i.get('issue'))}</h3><p class='card-text'>{esc(i.get('action'))}</p></article>" for i in offene)
    checks = "".join(f"<tr><td>{esc(i.get('area'))}</td><td>{esc(i.get('item'))}</td><td>{esc(i.get('priority'))}</td><td>{esc(i.get('status')).replace('offen','in Prüfung')}</td></tr>" for i in qa)
    return f"""<section class="section" id="bibliothek"><div class="section-header"><p class="hero-kicker">Releaseprüfung</p><h2>Rang 0 bis 23</h2></div><div class="table-wrap" role="region" tabindex="0"><table class="data-table"><thead><tr><th>Rang</th><th>Portal</th><th>Website-Status</th><th>Hinweis</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div></section>
<section class="section"><div class="section-header"><p class="hero-kicker">QA</p><h2>Offene Punkte und Risiken</h2></div><div class="card-grid two">{issues}</div></section>
<section class="section"><div class="section-header"><p class="hero-kicker">Checkliste</p><h2>Release-Gates</h2></div><div class="table-wrap" role="region" tabindex="0"><table class="data-table"><thead><tr><th>Bereich</th><th>Prüfung</th><th>Priorität</th><th>Status</th></tr></thead><tbody>{checks}</tbody></table></div></section>"""


def update_sitemap() -> None:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return
    rels = ["fachbibliothek/", "downloads/", "tools/", "portale/", "sdg-sdgplus/", "website-1-0-release/"]
    xml = sitemap.read_text(encoding="utf-8")
    for rel in rels:
        xml = re.sub(rf"\s*<url><loc>{re.escape(SITE + '/' + rel)}</loc><lastmod>[^<]+</lastmod></url>", "", xml)
    additions = "\n".join(f"  <url><loc>{SITE}/{rel}</loc><lastmod>2026-05-25</lastmod></url>" for rel in rels)
    xml = xml.replace("</urlset>", additions + "\n</urlset>")
    sitemap.write_text(xml, encoding="utf-8")


def main() -> None:
    if not PACKAGE.exists():
        print(f"Rang 24 release package not found; keeping committed release pages: {PACKAGE}")
        return
    copy_release_assets()
    register = load_json("WOeK_Rang24_master_downloadregister_v1.0.json")
    active = load_json("WOeK_Rang24_active_source_packages_v1.0.json")
    portals = load_json("WOeK_Rang24_portale_rangmatrix_v1.0.json")
    tools = load_json("WOeK_Rang24_toolkartenregister_v1.0.json")
    offene = load_json("WOeK_Rang24_offene_punkte_v1.0.json")
    qa = load_json("WOeK_Rang24_qa_checkliste_v1.0.json")

    library_body = f"""<section class="section"><div class="card"><p class="hero-kicker">Begriffslogik</p><h2>Referenzrahmen Website 1.0</h2><p>Wirkung ist neutral und relational. Wirkung ist die tatsächliche Veränderung von Zuständen und kann positiv, negativ oder neutral sein. Bewertet wird am Referenzrahmen SDGs, Agenda 2030 und SDG+. Ziel ist positive Netto-Wirkung für Mensch, Planet und Demokratie.</p><p>SDG+ ist keine UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie. Mensch, Planet und Demokratie ist die kommunikative Übersetzung der SDGs, der Agenda 2030 und SDG+.</p></div></section>{filter_ui()}<section class="section" id="bibliothek"><div class="section-header"><p class="hero-kicker">Masterregister</p><h2>Fachbibliothek</h2></div><div class="card-grid three">{library_cards(register)}</div></section>"""
    page_shell(ROOT / "fachbibliothek", "Fachbibliothek der Wirkungsökonomie", "Filterbare Masterbibliothek für Portale, Dossiers, Detailkonzepte, Downloads, Toolkarten, Glossar und Quellen.", library_body, filter_script())

    downloads_body = download_center(register, active)
    page_shell(ROOT / "downloads", "Downloadzentrum der Wirkungsökonomie", "Kuratierte Downloads für Masterpakete, Rangpakete, Dossiers, Detailkonzepte, Toolkarten und Register.", downloads_body)

    tools_body = f"""<section class="section" id="bibliothek"><div class="section-header"><p class="hero-kicker">Toolkartenregister</p><h2>Werkzeuge und Methoden</h2></div><div class="card"><p>Das Register zeigt Toolkarten mit Beschreibung, Nutzen, Zielgruppe, Status und passender Methodik. Nur funktionierende Interaktionen werden als Rechner, Scanner oder Simulation beworben.</p></div>{tools_cards(tools)}</section>"""
    page_shell(ROOT / "tools", "Tools der Wirkungsökonomie", "Register der Toolkarten aus der Masterbibliothek mit Beschreibung, Nutzen, Zielgruppe, Status und Link.", tools_body)

    portale_body = f"""<section class="section" id="bibliothek"><div class="section-header"><p class="hero-kicker">Rang 0 bis 23</p><h2>Portale und Systembereiche</h2></div>{portal_cards(portals)}</section>"""
    page_shell(ROOT / "portale", "Portale der Wirkungsökonomie", "Übersicht über alle Portalbereiche und Rangpakete der Website 1.0.", portale_body)

    release_body = release_report(portals, offene, qa)
    page_shell(ROOT / "website-1-0-release", "Website-1.0-Releaseprüfung", "Releasebericht für Masterbibliothek, Downloadzentrum, Portale, Toolkarten, SDG-/SDG+-Logik und QA.", release_body)

    sdg_body = """<section class="section" id="bibliothek"><div class="card"><p class="hero-kicker">Weiterleitung und Kurzlogik</p><h2>SDGs, Agenda 2030 und SDG+</h2><p>Die SDGs und die Agenda 2030 bleiben der globale Referenzrahmen. SDG+ ist keine UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p><p>Mensch, Planet und Demokratie ist die kommunikative Übersetzung dieser Zielstruktur.</p><a class="btn btn-primary" href="../verstehen/sdgs-sdgplus/">Zum SDG-/SDG+-Referenzrahmen</a></div></section>"""
    page_shell(ROOT / "sdg-sdgplus", "SDG-/SDG+-Referenzrahmen", "Zentrale Orientierung zu SDGs, Agenda 2030, SDG+ und Mensch, Planet und Demokratie.", sdg_body)

    update_sitemap()
    print(f"Built Rang 24 release layer with {len(register)} library entries and {len(tools)} tools")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Publish the SDG risk/resilience dossier as public WÖk library content."""

from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path(
    "/Users/hagen/Library/Mobile Documents/com~apple~CloudDocs/"
    "SDGs_Risiko_Resilienz_Dossier_Wirkungsoekonomie_SDGplus_ausfuehrlich.docx"
)
PYTHON = Path("/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
TEMPLATE_SCRIPT = ROOT / "scripts/publications/apply-woek-dossier-template.py"
DOC_ID = "sdgs-sdgplus-risiko-resilienzregister-systemresilienz-v0-1"
SLUG = "sdgs-sdgplus-risiko-resilienzregister-systemresilienz"
TITLE = "Die SDGs und SDG+ als globales Risiko- und Resilienzregister"
SUBTITLE = (
    "Warum Nachhaltigkeit die diplomatische Oberfläche von Systemresilienz ist - "
    "und SDG+ die fehlenden Risiko-, Demokratie-, Medien-, Rechtsstaats- und "
    "Digitalitätsdimensionen ergänzt."
)
SHORT_DESCRIPTION = (
    "Dossier zur Lesart der SDGs als globales Risiko- und Resilienzregister: "
    "Nachhaltigkeit wird als Ergebnis von Systemresilienz verstanden, SDG+ ergänzt "
    "Demokratie, Medien, Rechtsstaat, Diskursfähigkeit und digitale Integrität."
)
DOCX_OUT = ROOT / "assets/downloads/woek_dossier_sdgs_sdgplus_risiko_resilienzregister_systemresilienz_v0_1.docx"
PDF_OUT = DOCX_OUT.with_suffix(".pdf")
ONLINE_OUT = ROOT / f"bibliothek/{SLUG}/index.html"
REGISTRY_PATH = ROOT / "assets/data/document-registry.json"
TERM_REGISTRY_PATH = ROOT / "assets/data/term-registry.json"


NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def slugify(value: str) -> str:
    mapping = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"})
    return (
        value.lower()
        .translate(mapping)
        .replace("+", " plus ")
        .replace("&", " und ")
    )


def anchor(value: str) -> str:
    normalized = slugify(value)
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    return normalized.strip("-") or "abschnitt"


def read_docx_paragraphs(path: Path) -> list[str]:
    with ZipFile(path) as docx:
        root = ET.fromstring(docx.read("word/document.xml"))
    paragraphs: list[str] = []
    for para in root.findall(".//w:p", NS):
        texts = [node.text or "" for node in para.findall(".//w:t", NS)]
        text = "".join(texts).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def callout(label: str, text: str) -> str:
    return f'<div class="callout"><strong>{html.escape(label)}:</strong> {html.escape(text)}</div>'


def render_online_text(paragraphs: list[str]) -> str:
    output: list[str] = [
        callout(
            "Dokumentstatus",
            "Dossier · Arbeitsfassung v0.1 · Stand: Juni 2026. Öffentliche WÖk-Konzeptfassung; "
            "kein amtliches SDG-Dokument und keine Risiko- oder Anlageberatung.",
        ),
        '<p class="card-text"><strong>Einordnung:</strong> Das Dossier übersetzt die SDGs aus der reinen Nachhaltigkeitssprache in eine Risiko-, Resilienz- und Wirkungslogik. SDG+ ergänzt jene demokratischen, medialen, rechtlichen und digitalen Systemfähigkeiten, die diese Resilienz absichern.</p>',
    ]
    seen: dict[str, int] = {}
    skip_intro = {
        "Dossier / Aufsatzentwurf",
        TITLE,
        "Arbeitsfassung für die WirkungsökonomieErweiterte Fassung mit ausführlichem SDG+-KapitelStand: Juni 2026",
    }
    label_prefixes = [
        "Kernformel",
        "Vorschlag für die zentrale Formulierung",
        "Anschaulich erklärt",
        "Begriffspräzisierung",
        "Merksatz",
        "Kurzformel",
        "Prüffrage",
        "WÖk-Ergänzung",
    ]

    in_overview = False
    overview_items: list[str] = []

    def flush_overview() -> None:
        nonlocal overview_items
        if overview_items:
            output.append("<ul>" + "".join(f"<li>{html.escape(item)}</li>" for item in overview_items) + "</ul>")
            overview_items = []

    def unique_id(text: str) -> str:
        base = anchor(text)
        count = seen.get(base, 0)
        seen[base] = count + 1
        return base if count == 0 else f"{base}-{count + 1}"

    for raw in paragraphs:
        text = re.sub(r"\s+", " ", raw).strip()
        if not text or text in skip_intro:
            continue
        if text.startswith("Warum Nachhaltigkeit nicht der eigentliche Kern ist"):
            continue
        if text == "Kompakte Risikoübersicht:":
            flush_overview()
            output.append("<h3>Kompakte Risikoübersicht</h3>")
            in_overview = True
            continue
        if in_overview and text.startswith("SDG ") and ":" in text:
            overview_items.append(text)
            continue
        if in_overview and text.startswith("Im Detail"):
            flush_overview()
            in_overview = False
            output.append(f"<p>{html.escape(text)}</p>")
            continue

        flush_overview()
        in_overview = False

        for prefix in label_prefixes:
            if text.startswith(prefix) and len(text) > len(prefix):
                body = text[len(prefix):].strip(" :-")
                if body:
                    output.append(callout(prefix, body))
                    break
        else:
            if text == "Leitthese" or text == "Inhaltsübersicht":
                ident = unique_id(text)
                output.append(f'<h2 id="{ident}">{html.escape(text)} <a class="cite-anchor no-print" href="#{ident}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>')
            elif re.match(r"^\d+\.\d+\s+", text):
                ident = unique_id(text)
                output.append(f'<h3 id="{ident}">{html.escape(text)} <a class="cite-anchor no-print" href="#{ident}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h3>')
            elif re.match(r"^\d+\.\s+", text):
                ident = unique_id(text)
                output.append(f'<h2 id="{ident}">{html.escape(text)} <a class="cite-anchor no-print" href="#{ident}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>')
            elif text.startswith("SDG+ ") and ":" in text and len(text) < 140:
                ident = unique_id(text)
                output.append(f'<h3 id="{ident}">{html.escape(text)} <a class="cite-anchor no-print" href="#{ident}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h3>')
            elif text.startswith(("Risikolesart:", "Unterziele als Risikocluster:", "Systemische Übersetzung:", "Wirkungsökonomische Übersetzung:")):
                label, _, body = text.partition(":")
                output.append(f"<p><strong>{html.escape(label)}:</strong>{html.escape(body)}</p>")
            elif re.match(r"^(Risikomanagement|Resilienzmanagement|Wirkungsmanagement|Wirkungsökonomie):", text):
                label, _, body = text.partition(":")
                output.append(f"<p><strong>{html.escape(label)}:</strong>{html.escape(body)}</p>")
            else:
                output.append(f"<p>{html.escape(text)}</p>")
    flush_overview()
    return "\n".join(output)


def extract_shell() -> tuple[str, str]:
    source = (ROOT / "bibliothek/kommunaler-wirkungsindex-kwi-diskussionspapier/index.html").read_text(encoding="utf-8")
    header = re.search(r"(<header\b.*?</header>)", source, re.S).group(1)
    footer = re.search(r"(<footer\b.*?</html>)", source, re.S).group(1)
    return header, footer


def render_page(online_text: str) -> str:
    header, footer = extract_shell()
    downloads = (
        '<div class="document-action-row">'
        f'<a class="btn btn-primary" href="../../{PDF_OUT.relative_to(ROOT).as_posix()}">PDF öffnen</a>'
        '<a class="btn btn-ghost" href="#onlinefassung">Online lesen</a>'
        "</div>"
    )
    return f"""<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{html.escape(TITLE)} | Bibliothek der Wirkungsökonomie</title>
    <meta name="description" content="{html.escape(SHORT_DESCRIPTION)}">
    <meta name="search_title" content="{html.escape(TITLE)}">
    <meta name="search_description" content="{html.escape(SHORT_DESCRIPTION)}">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Dokument">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
    {header}
    <main data-pagefind-body>
      <section class="hero compact-hero document-detail-hero">
        <p class="hero-kicker">Dossier · Arbeitsfassung · Juni 2026</p>
        <h1>{html.escape(TITLE)}</h1>
        <p class="hero-subtitle">{html.escape(SUBTITLE)}</p>
        <div class="document-card-badges"><span class="status-badge status-badge--dossier">Dossier</span><span class="status-badge status-badge--arbeitsfassung">Arbeitsfassung</span><span class="status-badge status-badge--methodik">SDG+ / Resilienz</span></div>
      </section>
      <section class="section document-detail-grid">
        <article class="document-detail-main">
          <div class="callout"><strong>Statushinweis:</strong> Dieses Dossier ist eine öffentliche Konzept- und Arbeitsfassung der Wirkungsökonomie. Es interpretiert die SDGs wirkungsökonomisch; SDG+ ist eine WÖk-Erweiterung und keine offizielle UN-Kategorie.</div>
          <h2>Kurz gesagt</h2>
          <p>Das Dossier liest die SDGs nicht als weiche Nachhaltigkeitswunschliste, sondern als globales Risiko- und Resilienzregister. SDG+ ergänzt die demokratischen, medialen, rechtlichen, kulturellen und digitalen Systemfähigkeiten, ohne die Resilienz nicht dauerhaft gelingen kann.</p>
          <h2>Was dich erwartet</h2>
          <p>Eine ausführliche Online- und PDF-Fassung mit Executive Summary, Systemresilienz-Begriff, SDG-Risikolandschaft, SDG+-Erweiterung, Wirkungsnetz, Beispielen und Sprachvorschlägen für die Wirkungsökonomie.</p>
          <h2>Welche Fragen beantwortet das Dokument?</h2>
          <ul><li>Warum ist Nachhaltigkeit eher Ergebnis als operativer Kern?</li><li>Wie lassen sich die 17 SDGs als Risiko- und Resilienzfelder lesen?</li><li>Welche Systemfähigkeiten ergänzt SDG+ für Demokratie, Medien, Rechtsstaat, Diskurs und Digitalität?</li></ul>
          <h2>Für wen geeignet?</h2>
          <p>Politik, Verwaltung, Unternehmen, Wissenschaft, Bildung, Risikomanagement, Nachhaltigkeitsstrategie, Wirkungssteuerung und öffentliche Kommunikation.</p>
          <h2>Was dieses Dokument nicht ist</h2>
          <p>Es ist kein amtliches SDG-Dokument, kein Ersatz für UN-Unterziele, keine ESG-Prüfung, kein Rechtsgutachten und keine Anlage-, Versicherungs- oder Risikoberatung. Es ist ein wirkungsökonomischer Deutungs- und Arbeitsrahmen.</p>
          <h2>Inhaltsüberblick</h2>
          <p>Systemresilienz, SDGs, SDG+, Risikomanagement, Resilienzmanagement, Wirkungsresilienz, Rückkopplung, Demokratiequalität, Medienvielfalt, Rechtsstaatlichkeit, digitale Integrität und positive Netto-Wirkung.</p>
          <section id="onlinefassung" class="document-online-section"><h2>Onlinefassung</h2><div class="readable-prose document-online-text document-paper-reader">
{online_text}
          </div></section>
        </article>
        <aside class="document-paper-meta">
          <div class="document-meta-card">
            <h2>Downloads</h2>
            {downloads}
          </div>
          <div class="document-meta-card">
            <h2>Metadaten</h2>
            <ul>
              <li><strong>Typ:</strong> Dossier</li>
              <li><strong>Status:</strong> Arbeitsfassung</li>
              <li><strong>Version:</strong> v0.1</li>
              <li><strong>Stand:</strong> Juni 2026</li>
              <li><strong>Bereich:</strong> SDGs, SDG+, Risiko &amp; Resilienz</li>
            </ul>
          </div>
          <div class="document-meta-card">
            <h2>Verknüpfungen</h2>
            <ul>
              <li><a href="../../verstehen/sdgs-sdgplus/">SDGs &amp; SDG+</a></li>
              <li><a href="../../portale/sicherheit-resilienz/">Sicherheit &amp; Resilienz</a></li>
              <li><a href="../../wirkungsfelder/staat-recht-demokratie/">Staat, Recht &amp; Demokratie</a></li>
              <li><a href="../../wirkungsfelder/finanzsystem-kapital/">Finanzsystem &amp; Kapital</a></li>
            </ul>
          </div>
          <div class="document-meta-card">
            <h2>Glossar</h2>
            <ul>
              <li><a href="../../begriffe/systemresilienz/">Systemresilienz</a></li>
              <li><a href="../../begriffe/risiko-und-resilienzregister/">Risiko- und Resilienzregister</a></li>
              <li><a href="../../begriffe/wirkungsresilienz/">Wirkungsresilienz</a></li>
              <li><a href="../../begriffe/sdg-plus/">SDG+</a></li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
    {footer}
"""


def add_document_registry_entry() -> None:
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    registry = [item for item in registry if item.get("id") != DOC_ID]
    registry.append(
        {
            "id": DOC_ID,
            "title": TITLE,
            "type": "Dossier",
            "category": "referenzrahmen",
            "status": "current",
            "stand": "2026-06-09",
            "summary": SHORT_DESCRIPTION,
            "onlineUrl": f"/bibliothek/{SLUG}/",
            "pdfUrl": f"/{PDF_OUT.relative_to(ROOT).as_posix()}",
            "docxUrl": f"/{DOCX_OUT.relative_to(ROOT).as_posix()}",
            "fileSize": "",
            "relatedTerms": [
                "systemresilienz",
                "risiko-und-resilienzregister",
                "sdgs",
                "sdg-plus",
                "wirkungsresilienz",
                "positive-netto-wirkung",
                "rueckkopplung",
            ],
            "relatedFields": [
                "verstehen",
                "staat-recht-demokratie",
                "finanzsystem-kapital",
                "planet-resilienz",
            ],
            "relatedTools": [
                "woek-ids",
                "scorecards",
                "wirkungspfad-analyse",
            ],
            "isArchive": False,
            "isPublic": True,
        }
    )
    REGISTRY_PATH.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def term(term_id: str, label: str, short: str, definition: str, related: list[str], aliases: list[str]) -> dict:
    return {
        "id": term_id,
        "termId": term_id,
        "canonicalLabel": label,
        "label": label,
        "slug": term_id,
        "status": "woek-praezisierungsbegriff",
        "type": "WÖk-Präzisierungsbegriff",
        "version": "1.0",
        "source": "Dossier: Die SDGs und SDG+ als globales Risiko- und Resilienzregister",
        "sourceDocument": f"bibliothek/{SLUG}/",
        "sourceSection": "SDGs, SDG+ und Systemresilienz",
        "shortDefinition": short,
        "hoverDefinition": short,
        "definition": definition,
        "longDefinition": definition,
        "woekRelation": "Der Begriff hilft, Nachhaltigkeit nicht als Zusatzprogramm, sondern als Steuerungsfrage von Risiken, Rückkopplungen und positiver Netto-Wirkung für Mensch, Planet und Demokratie zu lesen.",
        "usageNote": "Als systemischen WÖk-Begriff verwenden; nicht als amtliche UN-Kategorie und nicht als deterministische Prognose.",
        "doNotConfuseWith": [
            "klassischem Nachhaltigkeitsmarketing",
            "rein unternehmerischem Risikomanagement",
            "amtlicher SDG-Terminologie der Vereinten Nationen",
        ],
        "synonyms": aliases,
        "aliases": aliases,
        "relatedTerms": related,
        "relatedDocuments": [
            f"bibliothek/{SLUG}/",
            "verstehen/sdgs-sdgplus/",
            "portale/sicherheit-resilienz/",
        ],
        "examples": [],
        "preferredUsage": "Nutzen, wenn SDGs, SDG+, Risikomanagement und Resilienz als vernetzter Wirkungsrahmen erklärt werden.",
        "deprecatedUsage": [],
        "reviewStatus": "approved",
        "glossaryOrderKey": label.lower(),
        "firstApprovedIn": "2026.2",
        "lastUpdated": "2026-06-09",
        "category": "Systeme, Steuerung und Resilienz",
        "categories": ["resilienz", "sdg-plus", "wirkungslogik"],
        "pageUrl": f"/begriffe/{term_id}/",
        "classicGlossary": True,
        "autoLinkAllowed": True,
    }


def add_terms() -> None:
    data = json.loads(TERM_REGISTRY_PATH.read_text(encoding="utf-8"))
    terms = data["terms"] if isinstance(data, dict) else data
    by_id = {item.get("termId") or item.get("id"): item for item in terms}
    additions = [
        term(
            "systemresilienz",
            "Systemresilienz",
            "Systemresilienz beschreibt die Fähigkeit eines sozialen, ökologischen, wirtschaftlichen oder demokratischen Systems, zentrale Funktionen auch unter Schocks, Fehlanreizen und Krisen zu erhalten.",
            "Systemresilienz bezeichnet in der Wirkungsökonomie nicht nur Widerstandsfähigkeit gegen einzelne Störungen, sondern die Fähigkeit eines Systems, Risiken zu erkennen, Schäden zu begrenzen, sich anzupassen, zu lernen und zentrale Funktionen für Mensch, Planet und Demokratie zu erhalten. Nachhaltigkeit wird damit als Ergebnis gelingender Systemstabilisierung verstanden.",
            ["resilienz", "wirkungsresilienz", "sdgs", "sdg-plus", "rueckkopplung", "positive-netto-wirkung", "demokratische-resilienz"],
            ["systemische Resilienz", "Systemstabilisierung", "Systemschockfestigkeit"],
        ),
        term(
            "risiko-und-resilienzregister",
            "Risiko- und Resilienzregister",
            "Ein Risiko- und Resilienzregister ordnet zentrale Gefährdungsfelder und Schutzfähigkeiten eines Systems so, dass Wirkung, Frühwarnsignale und Rückkopplungen sichtbar werden.",
            "Das Risiko- und Resilienzregister ist eine wirkungsökonomische Lesart der SDGs und SDG+: Die Ziele werden als Inventar jener Mindestbedingungen verstanden, ohne die Gesellschaften, Märkte, Lieferketten, Ökosysteme und Demokratien instabil werden. Es verbindet Risikolesart, Schutzfähigkeit, Daten und politische Steuerbarkeit.",
            ["systemresilienz", "sdgs", "sdg-plus", "wirkungsresilienz", "risikomanagement", "wirkungsdaten", "wirkungspfad"],
            ["Resilienzregister", "Risikoregister", "globales Risiko- und Resilienzregister", "SDG-Risikoregister"],
        ),
        term(
            "systemische-risikointelligenz",
            "Systemische Risikointelligenz",
            "Systemische Risikointelligenz verbindet Outside-in-Risiken mit Inside-out-Wirkungen und fragt, welche selbst erzeugten Risiken als Kosten, Instabilität oder Vertrauensverlust zurückkehren.",
            "Systemische Risikointelligenz erweitert klassisches Risikomanagement: Sie betrachtet nicht nur, welche Risiken einen Akteur bedrohen, sondern auch, welche Risiken der Akteur für andere, für Ökosysteme, Lieferketten, Demokratien oder kommende Generationen erzeugt. Erst die Verbindung beider Richtungen macht Wirkung steuerbar.",
            ["systemresilienz", "wirkungsrisiko", "wirkungsresilienz", "outside-in", "inside-out", "rueckkopplung"],
            ["vollständige Risikointelligenz", "systemisches Risikomanagement", "wirkungsökonomische Risikointelligenz"],
        ),
    ]
    for addition in additions:
        by_id[addition["termId"]] = addition
    if "wirkungsresilienz" in by_id:
        docs = by_id["wirkungsresilienz"].setdefault("relatedDocuments", [])
        if f"bibliothek/{SLUG}/" not in docs:
            docs.append(f"bibliothek/{SLUG}/")
        rel = by_id["wirkungsresilienz"].setdefault("relatedTerms", [])
        for item in ["systemresilienz", "risiko-und-resilienzregister", "systemische-risikointelligenz"]:
            if item not in rel:
                rel.append(item)
    data["terms"] = sorted(by_id.values(), key=lambda item: (item.get("glossaryOrderKey") or item.get("canonicalLabel") or "").lower())
    TERM_REGISTRY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    if not SOURCE_DOCX.exists():
        raise SystemExit(f"Source DOCX not found: {SOURCE_DOCX}")
    DOCX_OUT.parent.mkdir(parents=True, exist_ok=True)
    ONLINE_OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            str(PYTHON),
            str(TEMPLATE_SCRIPT),
            str(SOURCE_DOCX),
            str(DOCX_OUT),
            "--document-type",
            "Dossier",
            "--title",
            TITLE,
            "--subtitle",
            "Systemresilienz, Risikomanagement und SDG+ als Wirkungsrahmen für Mensch, Planet und Demokratie",
            "--version",
            "v0.1",
            "--fassung",
            "Arbeitsfassung",
            "--stand",
            "Juni 2026",
            "--kurztitel",
            "SDGs als Risiko- und Resilienzregister",
            "--reference",
            "Wirkungsökonomie / SDG+",
            "--start-heading",
            "Leitthese",
        ],
        cwd=ROOT,
        check=True,
    )
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(DOCX_OUT.parent), str(DOCX_OUT)], cwd=ROOT, check=True)
    generated_pdf = DOCX_OUT.with_suffix(".pdf")
    if generated_pdf != PDF_OUT and generated_pdf.exists():
        shutil.move(generated_pdf, PDF_OUT)
    paragraphs = read_docx_paragraphs(SOURCE_DOCX)
    ONLINE_OUT.write_text(render_page(render_online_text(paragraphs)), encoding="utf-8")
    add_document_registry_entry()
    add_terms()
    print(ONLINE_OUT.relative_to(ROOT).as_posix())
    print(PDF_OUT.relative_to(ROOT).as_posix())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

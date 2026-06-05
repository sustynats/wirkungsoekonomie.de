#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import os
import re
import shutil
import subprocess
import zipfile
from dataclasses import dataclass
from pathlib import Path
from textwrap import wrap
from xml.sax.saxutils import escape as xml_escape


ROOT = Path(__file__).resolve().parents[2]
PACKAGE = Path("/private/tmp/woek-rang22/WOeK_Rang22_Zukunftsbilder-Wirkungswohlstand-Zivilisatorische-Perspektive_Gesamtpaket_v1.0")
SITE = "https://wirkungsoekonomie.de"
PORTAL_REL = "portale/zukunftsbilder-wirkungswohlstand"
DOWNLOAD_REL = "downloads/rang-22-zukunftsbilder-wirkungswohlstand"
ASSET_REL = "assets/downloads/rang-22-zukunftsbilder-wirkungswohlstand"
ASSET_DIR = ROOT / ASSET_REL
PORTAL_DIR = ROOT / PORTAL_REL
DOWNLOAD_DIR = ROOT / DOWNLOAD_REL


NAV = [
    ("Start", "index.html"),
    ("Verstehen", "verstehen.html"),
    ("Wirkungsfelder", "wirkungsfelder/"),
    ("Werkzeuge", "werkzeuge/"),
    ("Akademie", "akademie.html"),
    ("Werkstatt", "downloads.html"),
]


SDGS = [
    ("SDG 1", "Keine Armut"),
    ("SDG 3", "Gesundheit und Wohlergehen"),
    ("SDG 4", "Hochwertige Bildung"),
    ("SDG 8", "Menschenwürdige Arbeit"),
    ("SDG 9", "Industrie, Innovation und Infrastruktur"),
    ("SDG 10", "Weniger Ungleichheiten"),
    ("SDG 11", "Nachhaltige Städte und Gemeinden"),
    ("SDG 12", "Nachhaltiger Konsum und Produktion"),
    ("SDG 13", "Maßnahmen zum Klimaschutz"),
    ("SDG 16", "Frieden, Gerechtigkeit und starke Institutionen"),
    ("SDG 17", "Partnerschaften"),
]


SDGPLUS = [
    "Demokratiequalität",
    "Medienqualität",
    "Rechtsstaatlichkeit",
    "Diskursfähigkeit",
    "institutionelles Vertrauen",
    "gesellschaftlicher Zusammenhalt",
    "digitale Selbstbestimmung",
]


RELATED = [
    ("SDG-/SDG+-Referenzrahmen", "verstehen/sdgs-sdgplus/"),
    ("Produkte & Konsum", "wirkungsfelder/produkte-konsum/"),
    ("Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/"),
    ("Impact Controlling", "werkzeuge/impact-controlling/"),
    ("Wirtschaft & Unternehmen", "wirkungsfelder/wirtschaft-unternehmen/"),
    ("Finanzsystem & Kapital", "wirkungsfelder/finanzsystem-kapital/"),
    ("Wohnen & Stadt", "wirkungsfelder/wohnen-stadt/"),
    ("Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"),
    ("Rente & soziale Sicherung", "wirkungsfelder/rente-soziale-sicherung/"),
    ("Bildung", "wirkungsfelder/bildung/"),
    ("Gesundheit & Pflege", "wirkungsfelder/gesundheit-pflege/"),
    ("Medien & Öffentlichkeit", "wirkungsfelder/medien-oeffentlichkeit/"),
    ("Migration & Vielfalt", "portale/migration-vielfalt/"),
    ("Sicherheit & Resilienz", "portale/sicherheit-resilienz/"),
    ("Digitalisierung, KI und Wirkungsdatenräume", "portale/digitalisierung-ki-wirkungsdatenraeume/"),
    ("Wissen, Wissenschaft und Wirkungsinnovation", "portale/wissen-wissenschaft-forschung-wirkungsinnovation/"),
    ("Internationale Ordnung", "portale/internationale-ordnung-globalisierung-geopolitik/"),
    ("Transformation, Übergänge und Implementierung", "portale/transformation-uebergaenge-implementierung/"),
    ("Kritik und Schutzarchitektur", "portale/kritik-missverstaendnisse-schutzarchitektur/"),
]


BOOK = [
    ("Die neue Ordnung des Wohlstands", "referenz/"),
    ("Kapitel 10 - Wirkung", "referenz/kapitel-010-wirkung/"),
    ("Kapitel 16 - Begriffssystem", "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/"),
    ("Kapitel 54 - Wirkungs-BIP", "referenz/kapitel-054-wirkungs-bip-und-neue-wohlstandsmessung/"),
    ("Kapitel 57 - Wirkungseinkommen", "referenz/kapitel-057-wirkungseinkommen/"),
    ("Kapitel 58 - Wirkungsrente", "referenz/kapitel-058-wirkungsrente/"),
    ("Kapitel 59 - Kapitalmärkte und Fonds", "referenz/kapitel-059-kapitalmaerkte-und-fonds/"),
    ("Kapitel 99 - Wirkungsökonomie im Alltag", "referenz/"),
    ("Kapitel 107 - Zukunftsbilder", "referenz/"),
    ("Kapitel 108 - Schlussbild: Die neue Ordnung des Wohlstands", "referenz/"),
    ("SDG-/SDG+-Referenzrahmen", "verstehen/sdgs-sdgplus/"),
]


TOOLS = [
    {
        "slug": "zukunftsbild-canvas-2035",
        "title": "Zukunftsbild-Canvas 2035",
        "description": "Strukturiert Alltag, Unternehmen, Staat und globale Ordnung nach Wirkungspfaden.",
        "benefit": "Macht Zukunftsbilder prüfbar, statt sie als bloße Vision stehen zu lassen.",
        "audience": "Kommunen, Akademie, Strategieprozesse.",
    },
    {
        "slug": "wirkungswohlstand-index",
        "title": "Wirkungswohlstand-Index",
        "description": "Ordnet Wohlstand nach Lebensbedingungen, Resilienz, Gesundheit, Vertrauen, Natur, Bildung und Teilgabe.",
        "benefit": "Erweitert Wohlstand über Einkommen und Wachstum hinaus um tragfähige Zustandsveränderungen.",
        "audience": "Politik, Forschung, Verwaltung.",
    },
    {
        "slug": "alltagswirkungs-check",
        "title": "Alltagswirkungs-Check",
        "description": "Hilft Bürger:innen, Wirkung im Alltag zu verstehen, ohne Menschen zu bewerten.",
        "benefit": "Übersetzt Wirkungslogik in Konsum, Wohnen, Mobilität, Energie, Bildung und Teilhabe.",
        "audience": "Bürger:innen, Bildung, Akademie.",
    },
    {
        "slug": "unternehmen-2035-radar",
        "title": "Unternehmen-2035-Radar",
        "description": "Bewertet, ob Unternehmen Wirkung in Strategie, Risiko, Kapital, Lieferkette und Produktportfolio verankern.",
        "benefit": "Zeigt, wie Unternehmensführung jenseits von Reporting in Rückkopplung übergeht.",
        "audience": "Unternehmen, Banken, Beratung.",
    },
    {
        "slug": "staat-2035-scorecard",
        "title": "Staat-2035-Scorecard",
        "description": "Prüft Wirkungshaushalt, Beschaffung, Verwaltung, Rechtsschutz, Resilienz und demokratische Lernfähigkeit.",
        "benefit": "Macht staatliche Zukunftsfähigkeit als Wirkungspraxis sichtbar.",
        "audience": "Politik, Verwaltung, Kommunen.",
    },
    {
        "slug": "globale-rueckkopplungs-matrix",
        "title": "Globale-Rueckkopplungs-Matrix",
        "description": "Ordnet globale Wirkungen in Handel, Ressourcen, Klima, Migration, Kapital und Sicherheit.",
        "benefit": "Verbindet Weltfähigkeit mit Schutz vor Weltregierung und Dominanzlogik.",
        "audience": "Internationale Kooperation, Forschung, Politik.",
    },
    {
        "slug": "verlustleistungs-radar",
        "title": "Verlustleistungs-Radar",
        "description": "Macht Tätigkeiten sichtbar, die Kapital erzeugen, aber Mensch, Planet oder Demokratie schwächen.",
        "benefit": "Hilft, Wohlstand nicht mit Schadenskompensation und Reparaturaufwand zu verwechseln.",
        "audience": "Forschung, Politik, Wirtschaft, Medien.",
    },
    {
        "slug": "zukunftskommunikations-check",
        "title": "Zukunftskommunikations-Check",
        "description": "Prüft, ob Zukunftsbilder verständlich, ehrlich, anschlussfähig und nicht manipulativ kommuniziert werden.",
        "benefit": "Stärkt Resonanz, ohne Utopie, Angst oder Heilsversprechen zu nutzen.",
        "audience": "Medien, Politik, Bildung, Akademie.",
    },
]


PAGE_MAP = {
    "portalstartseite": "",
    "konzeptpapier": "konzeptpapier",
    "gesamtdossier": "gesamtdossier",
    "detail-01-alltag-2035-und-wirkungsfaehiger-alltag": "alltag-2035",
    "detail-02-unternehmen-2035-und-wirkungsorientierte-fuehrung": "unternehmen-2035",
    "detail-03-staat-2035-wirkungshaushalt-und-lernende-verwaltung": "staat-2035",
    "detail-04-globale-ordnung-2050-und-weltfaehige-rueckkopplung": "globale-ordnung-2050",
    "detail-05-wirkungswohlstand-und-wohlstand-ohne-zerstoerung": "wirkungswohlstand",
    "detail-06-buerger-innen-als-co-autor-innen-der-wirkung": "buergerinnen-co-autorinnen",
    "detail-07-wirkungspraxis-in-konsum-arbeit-wohnen-und-mobilitaet": "wirkungspraxis",
    "detail-08-zukunftskommunikation-narrative-und-resonanzraeume": "zukunftskommunikation",
    "detail-09-wohlstandsmessung-wirkungs-bip-und-verlustleistung": "wirkungs-bip-verlustleistung",
    "detail-10-schlussbild-und-zivilisatorische-perspektive": "schlussbild",
    "wirkungsindikatoren": "wirkungsindikatoren",
    "toolkarten": "toolkarten",
    "sdg-sdgplus": "sdg-sdgplus",
    "politische-anschlussfaehigkeit": "politische-anschlussfaehigkeit",
    "quellen-und-glossarlinks": "quellen-glossar",
}


DOWNLOAD_NAMES = {
    "portalstartseite": "00_portalstartseite",
    "konzeptpapier": "01_konzeptpapier",
    "gesamtdossier": "02_gesamtdossier",
    "detail-01-alltag-2035-und-wirkungsfaehiger-alltag": "03_detail_alltag_2035",
    "detail-02-unternehmen-2035-und-wirkungsorientierte-fuehrung": "04_detail_unternehmen_2035",
    "detail-03-staat-2035-wirkungshaushalt-und-lernende-verwaltung": "05_detail_staat_2035",
    "detail-04-globale-ordnung-2050-und-weltfaehige-rueckkopplung": "06_detail_globale_ordnung_2050",
    "detail-05-wirkungswohlstand-und-wohlstand-ohne-zerstoerung": "07_detail_wirkungswohlstand",
    "detail-06-buerger-innen-als-co-autor-innen-der-wirkung": "08_detail_buergerinnen_co_autorinnen",
    "detail-07-wirkungspraxis-in-konsum-arbeit-wohnen-und-mobilitaet": "09_detail_wirkungspraxis",
    "detail-08-zukunftskommunikation-narrative-und-resonanzraeume": "10_detail_zukunftskommunikation",
    "detail-09-wohlstandsmessung-wirkungs-bip-und-verlustleistung": "11_detail_wirkungs_bip_verlustleistung",
    "detail-10-schlussbild-und-zivilisatorische-perspektive": "12_detail_schlussbild",
    "wirkungsindikatoren": "14_wirkungsindikatoren",
    "toolkarten": "15_toolkarten",
    "sdg-sdgplus": "16_sdg_sdgplus_block",
    "politische-anschlussfaehigkeit": "17_politische_anschlussfaehigkeit",
    "quellen-und-glossarlinks": "18_quellen_glossarlinks",
}


@dataclass
class Entry:
    slug: str
    title: str
    doc_type: str
    version: str
    stand: str
    md: Path
    pdf: Path
    docx: Path
    page_slug: str
    download_base: str


def rel_prefix(target_dir: Path) -> str:
    prefix = os.path.relpath(ROOT, target_dir)
    return "" if prefix == "." else prefix.replace(os.sep, "/") + "/"


def href(prefix: str, rel: str) -> str:
    return prefix + rel


def clean_text(value: str) -> str:
    value = value.replace("\ufeff", "")
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s*[–-]\s*Rang\s+\d+\b", "", value, flags=re.I)
    value = re.sub(r"\s+Rang\s+\d+\b", "", value, flags=re.I)
    value = re.sub(r"^Rang\s+\d+\s*[–:-]\s*", "", value, flags=re.I)
    replacements = {
        "CodeX": "redaktionelle",
        "Repository": "Projekt",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return value


def sanitize_markdown(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("–", "-").replace("—", "-")
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    lines = text.split("\n")
    out: list[str] = []
    skip_table_section = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("## "):
            skip_table_section = stripped.lower() in {"## tabelle", "## table"}
        if skip_table_section:
            continue
        if re.search(r"codex|repository|umsetzungsanweisung|interne anweisung|interne arbeitsanweisungen|arbeits- und abnahmeliste|website|downloadprüfung|nachlieferung:|platzhalter|abnahmekriterien|dossier-niveau|darf keine internen|muss im corporate design|pflichtangaben", stripped, re.I):
            continue
        if re.search(r"Downloadfassung muss|Pflichtangaben:|Corporate Design.*erscheinen", stripped, re.I):
            continue
        if re.match(r"^\*\*(Status|Autorin|Referenz|Version|Stand)\s*:", stripped, re.I):
            continue
        if re.match(r"^(Status|Autorin|Referenz|Version|Stand)\s*:", stripped, re.I):
            continue
        if "Downloads, Online-Volltexte" in stripped and "Anweisung" in stripped:
            stripped = "Der Bereich umfasst Downloads und Online-Volltexte."
        stripped = stripped.replace("Arbeitsfassung", "öffentliche Lesefassung")
        stripped = stripped.replace("Langfassungsentwurf", "öffentliche Lesefassung")
        stripped = stripped.replace("Entwurf für Website und Downloads", "öffentliche Lesefassung")
        stripped = stripped.replace("Abnahmeliste", "Publikationsübersicht")
        stripped = stripped.replace("interne Bezugslinien", "Bezugslinien")
        stripped = stripped.replace("Interne Bezugslinien", "Bezugslinien")
        out.append(stripped)
    result = "\n".join(out)
    result = re.sub(r"\n{3,}", "\n\n", result)
    return strip_import_scaffold(result)


def strip_import_scaffold(text: str) -> str:
    """Remove document-cover scaffolding that is already rendered by the page template."""
    lines = text.split("\n")
    toc_index = None
    for index, line in enumerate(lines):
        stripped = line.strip().strip("# ").strip()
        if stripped.lower() == "inhaltsverzeichnis":
            toc_index = index
            break
    if toc_index is not None:
        for index in range(toc_index + 1, len(lines)):
            stripped = lines[index].strip()
            if re.match(r"^#{1,4}\s+\d+[\.)]?\s+\S", stripped):
                return "\n".join(lines[index:]).strip()
    # Fallback for imports without numbered sections: remove cover/scaffold headings
    # and their short explanatory blocks before rendering the public page body.
    scaffold = re.compile(
        r"^#{1,4}\s+(?:Wirkungsökonomie|WOeK\b.*|Inhaltsverzeichnis|Dokumentlogik|Kurzfassung|Detailkonzept\b.*|Konzeptpapier\b.*)\s*$",
        re.I,
    )
    cleaned: list[str] = []
    skip_until_heading = False
    for line in lines:
        stripped = line.strip()
        if scaffold.match(stripped):
            skip_until_heading = bool(re.search(r"Inhaltsverzeichnis|Dokumentlogik|Kurzfassung", stripped, re.I))
            continue
        if skip_until_heading:
            if not stripped:
                continue
            if stripped.startswith("#"):
                skip_until_heading = False
            else:
                continue
        cleaned.append(line)
    cleaned_lines = "\n".join(cleaned).split("\n")
    for index, line in enumerate(cleaned_lines):
        if re.match(r"^#{1,4}\s+\d+[\.)]?\s+\S", line.strip()):
            return "\n".join(cleaned_lines[index:]).strip()
    return "\n".join(cleaned_lines).strip()


def slugify(value: str) -> str:
    value = value.lower()
    table = str.maketrans("äöüß", "aous")
    value = value.translate(table)
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "abschnitt"


def inline_markdown(value: str) -> str:
    escaped = html.escape(value)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)
    escaped = re.sub(r"`(.+?)`", r"<code>\1</code>", escaped)
    return escaped


def markdown_to_html(md: str) -> tuple[str, list[tuple[int, str, str]]]:
    blocks: list[str] = []
    toc: list[tuple[int, str, str]] = []
    lines = md.split("\n")
    i = 0
    used_ids: set[str] = set()

    def unique_id(title: str) -> str:
        base = slugify(title)
        candidate = base
        counter = 2
        while candidate in used_ids:
            candidate = f"{base}-{counter}"
            counter += 1
        used_ids.add(candidate)
        return candidate

    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        heading = re.match(r"^(#{1,4})\s+(.+)$", stripped)
        if heading:
            level = min(len(heading.group(1)) + 1, 4)
            title = heading.group(2).strip().strip("#").strip()
            ident = unique_id(title)
            toc.append((level, title, ident))
            blocks.append(f'<h{level} id="{ident}">{inline_markdown(title)}</h{level}>')
            i += 1
            continue
        if stripped.startswith("|") and i + 1 < len(lines) and lines[i + 1].strip().startswith("|"):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_rows.append(lines[i].strip())
                i += 1
            parsed = []
            for row in table_rows:
                cells = [cell.strip() for cell in row.strip("|").split("|")]
                if all(re.match(r"^:?-{3,}:?$", cell) for cell in cells):
                    continue
                parsed.append(cells)
            if parsed:
                head = parsed[0]
                body = parsed[1:]
                table = ['<div class="table-wrap" role="region" tabindex="0"><table class="data-table">']
                table.append("<thead><tr>" + "".join(f"<th>{inline_markdown(cell)}</th>" for cell in head) + "</tr></thead>")
                if body:
                    table.append("<tbody>")
                    for row in body:
                        table.append("<tr>" + "".join(f"<td>{inline_markdown(cell)}</td>" for cell in row) + "</tr>")
                    table.append("</tbody>")
                table.append("</table></div>")
                blocks.append("".join(table))
            continue
        if re.match(r"^[-*]\s+", stripped):
            items = []
            while i < len(lines) and re.match(r"^[-*]\s+", lines[i].strip()):
                items.append(re.sub(r"^[-*]\s+", "", lines[i].strip()))
                i += 1
            blocks.append("<ul>" + "".join(f"<li>{inline_markdown(item)}</li>" for item in items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s+", stripped):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s+", lines[i].strip()):
                items.append(re.sub(r"^\d+\.\s+", "", lines[i].strip()))
                i += 1
            blocks.append("<ol>" + "".join(f"<li>{inline_markdown(item)}</li>" for item in items) + "</ol>")
            continue
        paragraph = [stripped]
        i += 1
        while i < len(lines):
            next_line = lines[i].strip()
            if not next_line or next_line.startswith("#") or next_line.startswith("|") or re.match(r"^[-*]\s+", next_line) or re.match(r"^\d+\.\s+", next_line):
                break
            paragraph.append(next_line)
            i += 1
        blocks.append(f"<p>{inline_markdown(' '.join(paragraph))}</p>")
    return "\n".join(blocks), toc


def load_entries() -> list[Entry]:
    raw_data = json.loads((PACKAGE / "json/index.json").read_text(encoding="utf-8"))
    raw = raw_data.get("documents", [])
    entries: list[Entry] = []
    for doc_name in raw:
        if not doc_name.endswith(".docx"):
            continue
        stem = Path(doc_name).stem
        slug = stem
        slug = slug.replace("WOeK_Rang22_", "")
        slug = slug.replace("_v1.0", "")
        slug = slug.lower().replace("_", "-")
        slug = slug.replace("detailkonzept-", "detail-")
        slug = slug.replace("portalstartseite-zukunftsbilder-wirkungswohlstand", "portalstartseite")
        slug = slug.replace("konzeptpapier-zukunftsbilder-wirkungswohlstand", "konzeptpapier")
        slug = slug.replace("gesamtdossier-zukunftsbilder-wirkungswohlstand", "gesamtdossier")
        slug = slug.replace("sdg-sdgplus-block", "sdg-sdgplus")
        slug = slug.replace("politische-anschlussfaehigkeit", "politische-anschlussfaehigkeit")
        slug = slug.replace("quellen-und-glossarlinks", "quellen-und-glossarlinks")
        if slug not in PAGE_MAP:
            continue
        if "codex" in slug.lower() or "gesamtpaket" in slug.lower() or "bestands" in slug.lower():
            continue
        md_path = PACKAGE / "markdown" / f"{stem}.md"
        pdf_path = PACKAGE / "pdf" / f"{stem}.pdf"
        docx_path = PACKAGE / "docx" / f"{stem}.docx"
        if slug.startswith("detail-"):
            doc_type = "Detailkonzept"
        else:
            doc_type = {
                "portalstartseite": "Portalstartseite",
                "konzeptpapier": "Konzeptpapier",
                "gesamtdossier": "Gesamtdossier",
                "wirkungsindikatoren": "Wirkungsindikatoren",
                "toolkarten": "Toolkarten",
                "sdg-sdgplus": "SDG-/SDG+-Block",
                "politische-anschlussfaehigkeit": "Politische Anschlussfähigkeit",
                "quellen-und-glossarlinks": "Quellen und Glossarlinks",
            }.get(slug, "Onlinefassung")
        title = stem.replace("WOeK_Rang22_", "").replace("_v1.0", "").replace("_", " ").replace("-", " ")
        title = re.sub(r"\s+", " ", title).strip()
        if slug.startswith("detail-"):
            title = re.sub(r"^Detailkonzept\s+0?(\d+)\s+", r"Detailkonzept \1: ", title)
        download_base = DOWNLOAD_NAMES.get(slug, slugify(title))
        entries.append(
            Entry(
                slug=slug,
                title=clean_text(title),
                doc_type=clean_text(doc_type),
                version="1.0",
                stand="Mai 2026",
                md=md_path,
                pdf=pdf_path,
                docx=docx_path,
                page_slug=PAGE_MAP[slug],
                download_base=download_base,
            )
        )
    return entries


def copy_downloads(entries: list[Entry]) -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    for child in ASSET_DIR.iterdir():
        if child.is_file():
            child.unlink()
    for entry in entries:
        if entry.pdf.exists():
            shutil.copy2(entry.pdf, ASSET_DIR / f"{entry.download_base}.pdf")
        if entry.docx.exists():
            shutil.copy2(entry.docx, ASSET_DIR / f"{entry.download_base}.docx")


def create_public_zip() -> None:
    zip_path = ASSET_DIR / "WOeK_Rang22_Zukunftsbilder-Wirkungswohlstand_Gesamtpaket_v1.0.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as out:
        for path in PACKAGE.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(PACKAGE)
            rel_s = str(rel)
            if re.search(r"codex|anweisung|bestands|nachliefer", rel_s, re.I):
                continue
            if "Gesamtpaket_Alle_Inhalte" in rel_s:
                continue
            out.write(path, rel_s)


def make_combined_assets(entries: list[Entry]) -> None:
    sections = []
    plain_sections = []
    for entry in entries:
        if not entry.md.exists():
            continue
        md = sanitize_markdown(entry.md.read_text(encoding="utf-8"))
        html_body, _ = markdown_to_html(md)
        sections.append(f"<section><h1>{html.escape(entry.title)}</h1>{html_body}</section>")
        plain_sections.append(f"{entry.title}\n\n{markdown_to_plain(md)}")
    combined = f"""<!doctype html><html><head><meta charset="utf-8"><title>Rang 22 - Zukunftsbilder, Wirkungswohlstand und zivilisatorische Perspektive</title>
<style>body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.55;margin:48px;max-width:820px}}h1,h2,h3{{font-family:Georgia,serif}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #ddd;padding:8px;vertical-align:top}}</style></head><body>
<h1>Rang 22 - Zukunftsbilder, Wirkungswohlstand und zivilisatorische Perspektive</h1>
<p>Autorin: Natalie Weber<br>Referenz: Wirkungsökonomie<br>Version: 1.0<br>Stand: Mai 2026</p>
{''.join(sections)}</body></html>"""
    html_path = ASSET_DIR / "WOeK_Rang22_Gesamtpaket_Alle_Inhalte_v1.0.html"
    html_path.write_text(combined, encoding="utf-8")
    docx_path = ASSET_DIR / "WOeK_Rang22_Gesamtpaket_Alle_Inhalte_v1.0.docx"
    pdf_path = ASSET_DIR / "WOeK_Rang22_Gesamtpaket_Alle_Inhalte_v1.0.pdf"
    plain = (
        "Rang 22 - Zukunftsbilder, Wirkungswohlstand und zivilisatorische Perspektive\n"
        "Autorin: Natalie Weber\nReferenz: Wirkungsökonomie\nVersion: 1.0\nStand: Mai 2026\n\n"
        + "\n\n".join(plain_sections)
    )
    write_minimal_docx(docx_path, plain)
    write_minimal_pdf(pdf_path, plain)
    textutil = shutil.which("textutil")
    if textutil and not docx_path.exists():
        subprocess.run([textutil, "-convert", "docx", str(html_path), "-output", str(docx_path)], check=False)
    cupsfilter = shutil.which("cupsfilter")
    if cupsfilter and not pdf_path.exists():
        try:
            proc = subprocess.run([cupsfilter, str(html_path)], check=False, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            if proc.returncode == 0 and proc.stdout:
                pdf_path.write_bytes(proc.stdout)
        except OSError:
            pass


def markdown_to_plain(md: str) -> str:
    text = re.sub(r"^#{1,6}\s*", "", md, flags=re.M)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"`(.*?)`", r"\1", text)
    text = re.sub(r"\|", " | ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def write_minimal_docx(path: Path, text: str) -> None:
    paragraphs = []
    for raw in text.split("\n"):
        if not raw.strip():
            paragraphs.append("<w:p/>")
            continue
        paragraphs.append(f"<w:p><w:r><w:t>{xml_escape(raw.strip())}</w:t></w:r></w:p>")
    document = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>""" + "".join(paragraphs) + """<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>"""
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>""")
        docx.writestr("_rels/.rels", """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>""")
        docx.writestr("word/document.xml", document)


def pdf_safe(text: str) -> str:
    repl = {
        "–": "-",
        "—": "-",
        "„": '"',
        "“": '"',
        "”": '"',
        "’": "'",
        "…": "...",
        "·": "-",
    }
    for old, new in repl.items():
        text = text.replace(old, new)
    return text.encode("latin-1", "replace").decode("latin-1")


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def write_minimal_pdf(path: Path, text: str) -> None:
    safe = pdf_safe(text)
    lines: list[str] = []
    for raw in safe.splitlines():
        wrapped = wrap(raw, 92) or [""]
        lines.extend(wrapped)
    pages = []
    for start in range(0, len(lines), 48):
        page_lines = lines[start:start + 48]
        content = ["BT", "/F1 10 Tf", "50 790 Td", "14 TL"]
        for line in page_lines:
            content.append(f"({pdf_escape(line)}) Tj")
            content.append("T*")
        content.append("ET")
        pages.append("\n".join(content).encode("latin-1", "replace"))
    objects: list[bytes] = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    page_refs = " ".join(f"{3 + i * 2} 0 R" for i in range(len(pages))).encode("ascii")
    objects.append(b"<< /Type /Pages /Kids [" + page_refs + b"] /Count " + str(len(pages)).encode("ascii") + b" >>")
    for index, content in enumerate(pages):
        page_obj = 3 + index * 2
        stream_obj = page_obj + 1
        objects.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents {stream_obj} 0 R >>".encode("ascii"))
        objects.append(b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream")
    data = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(data))
        data.extend(f"{i} 0 obj\n".encode("ascii"))
        data.extend(obj)
        data.extend(b"\nendobj\n")
    xref = len(data)
    data.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("ascii"))
    for off in offsets[1:]:
        data.extend(f"{off:010d} 00000 n \n".encode("ascii"))
    data.extend(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode("ascii"))
    path.write_bytes(bytes(data))


def toc_html(toc: list[tuple[int, str, str]]) -> str:
    if not toc:
        return "<p>Die Seite ist in lesbare Abschnitte gegliedert.</p>"
    items = "".join(f'<li class="toc-level-{level}"><a href="#{ident}">{html.escape(title)}</a></li>' for level, title, ident in toc)
    return f"<ol>{items}</ol>"


def tool_cards(prefix: str, relative_tool_links: bool = False) -> str:
    cards = []
    for tool in TOOLS:
        target = f"toolkarten/#tool-{tool['slug']}" if relative_tool_links else f"{href(prefix, PORTAL_REL + '/toolkarten/')}#tool-{tool['slug']}"
        cards.append(
            f"""<article class="card" id="tool-{tool['slug']}"><p class="card-kicker">Demo in Vorbereitung</p>
<h3 class="card-title">{html.escape(tool['title'])}</h3>
<p class="card-text">{html.escape(tool['description'])}</p>
<p class="card-text"><strong>Nutzen:</strong> {html.escape(tool['benefit'])}</p>
<p class="card-text"><strong>Zielgruppe:</strong> {html.escape(tool['audience'])}</p>
<a class="text-link" href="{target}">Toolkarte öffnen</a></article>"""
        )
    return '<div class="card-grid three">' + "".join(cards) + "</div>"


def sdg_block(prefix: str) -> str:
    sdg = "".join(f'<a class="sdg-chip" href="{href(prefix, "verstehen/sdgs-sdgplus/")}">{a} · {html.escape(b)}</a>' for a, b in SDGS)
    plus = "".join(f'<a class="sdg-chip sdg-plus" href="{href(prefix, "verstehen/sdgs-sdgplus/#sdgplus")}">SDG+ · {html.escape(x)}</a>' for x in SDGPLUS)
    return f"""<section class="section" id="sdg-sdgplus"><div class="section-header"><p class="hero-kicker">SDG-/SDG+-Bezug</p><h2>Referenzrahmen für Wirkungswohlstand</h2></div>
<div class="card"><p>Die SDGs und die Agenda 2030 bleiben der globale Referenzrahmen. SDG+ ist keine UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie für Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlichen Zusammenhalt und digitale Selbstbestimmung.</p>
<div class="sdg-chip-grid">{sdg}{plus}</div></div></section>"""


def policy_block() -> str:
    topics = [
        ("Aufgabe der Politik", "Politik schafft Rahmenbedingungen, in denen Zukunftsbilder nicht als Versprechen, sondern als überprüfbare Orientierung für Wirkungspfade genutzt werden."),
        ("Rahmenbedingungen", "Nötig sind transparente Indikatoren, Wirkungshaushalte, Bildungszugänge, Beschaffung, Kapitalrückkopplung, Rechtsschutz und öffentliche Korrektur."),
        ("Ausgestaltungsspielraum", "Parteien behalten Spielraum bei Tempo, Instrumenten, Finanzierung, Pilotfeldern und Gewichtung von Alltag, Unternehmen, Staat und globaler Ordnung."),
        ("Zielkonflikte", "Wirkungswohlstand muss Freiheit, Kaufkraft, ökologische Grenzen, Teilhabe, Produktivität, Resilienz und demokratische Akzeptanz offen abwägen."),
        ("Rollenverteilung", "Staat, Kommunen, Unternehmen, Kapital, Wissenschaft, Medien, Bildung und Bürger:innen tragen unterschiedliche Aufgaben in einer lernenden Ordnung."),
        ("Übergang und Schutz", "Zukunftsbilder brauchen Übergangspfade, soziale Abfederung, Beteiligung, Schutz vor Überforderung und klare Grenzen gegen Personenbewertung."),
        ("Evaluation und Korrektur", "Zukunftsbilder bleiben Hypothesen. Sie müssen an tatsächlichen Zustandsveränderungen, Nebenwirkungen und demokratischer Rückmeldung geprüft werden."),
        ("Parteipolitische Anschlussfähigkeit", "Die Wirkungsökonomie beschreibt keinen fertigen Parteibeschluss. Politische Programme können den Bewertungsrahmen unterschiedlich ausgestalten."),
        ("Schutz vor Technokratie", "Wirkungsdaten informieren und begrenzen Entscheidungen. Sie ersetzen nicht öffentliche Debatte, Grundrechte, Parlamente oder Gerichte."),
    ]
    cards = "".join(f'<article class="card"><h3 class="card-title">{html.escape(t)}</h3><p class="card-text">{html.escape(p)}</p></article>' for t, p in topics)
    return f"""<section class="section" id="politische-anschlussfaehigkeit"><div class="section-header"><p class="hero-kicker">Demokratische Umsetzung</p><h2>Politische Anschlussfähigkeit und Umsetzungsoptionen</h2></div>
<div class="card"><p><strong>Leitlinie:</strong> Die Wirkungsökonomie liefert keine fertige Zukunftsregierung und kein Parteiprogramm, sondern einen Bewertungs- und Steuerungsrahmen. Parteien behalten Ausgestaltungsspielraum. Entscheidend ist die überprüfbare Wirkung auf Mensch, Planet und Demokratie.</p>
<p>Zukunftsbilder bleiben politisch gestaltbar. Wirkungsdaten machen Folgen, Risiken und Zielkonflikte sichtbar, ersetzen aber keine demokratische Entscheidung.</p></div>
<div class="card-grid two">{cards}</div></section>"""


def links_strip(prefix: str, links: list[tuple[str, str]]) -> str:
    return '<div class="model-strip">' + "".join(f'<a href="{href(prefix, rel)}">{html.escape(label)}</a>' for label, rel in links) + "</div>"


def download_rows(entries: list[Entry], prefix: str, current_page: bool = False) -> str:
    rows = []
    zip_href = href(prefix, ASSET_REL + "/WOeK_Rang22_Zukunftsbilder-Wirkungswohlstand_Gesamtpaket_v1.0.zip")
    rows.append(
        f"""<tr><th scope="row">Gesamtpaket</th><td>ZIP</td><td>Bereinigtes öffentliches Gesamtpaket mit Onlinefassungen und Downloads.</td><td>1.0</td><td>Mai 2026</td><td>Öffentliche Lesefassung</td><td>ZIP</td><td><a href="{zip_href}" target="_blank" rel="noopener noreferrer">herunterladen</a></td><td><a href="{href(prefix, PORTAL_REL + '/')}">online lesen</a></td></tr>"""
    )
    for fmt in ("pdf", "docx"):
        combined = href(prefix, ASSET_REL + f"/WOeK_Rang22_Gesamtpaket_Alle_Inhalte_v1.0.{fmt}")
        rows.append(
            f"""<tr><th scope="row">Gesamtpaket</th><td>{fmt.upper()}</td><td>Gebündelte öffentliche Lesefassung der Inhalte.</td><td>1.0</td><td>Mai 2026</td><td>Öffentliche Lesefassung</td><td>{fmt.upper()}</td><td><a href="{combined}" target="_blank" rel="noopener noreferrer">herunterladen</a></td><td><a href="{href(prefix, PORTAL_REL + '/downloads/')}">online lesen</a></td></tr>"""
        )
    for entry in entries:
        if entry.page_slug == "":
            online_rel = PORTAL_REL + "/"
        else:
            online_rel = PORTAL_REL + "/" + entry.page_slug + "/"
        links = []
        for fmt in ("pdf", "docx"):
            asset = href(prefix, ASSET_REL + f"/{entry.download_base}.{fmt}")
            links.append(f'<a href="{asset}" target="_blank" rel="noopener noreferrer">{fmt.upper()}</a>')
        rows.append(
            f"""<tr><th scope="row">{html.escape(entry.title)}</th><td>{html.escape(entry.doc_type)}</td><td>Online lesbare öffentliche Fassung.</td><td>{html.escape(entry.version)}</td><td>{html.escape(entry.stand)}</td><td>Öffentliche Lesefassung</td><td>PDF/DOCX</td><td>{' · '.join(links)}</td><td><a href="{href(prefix, online_rel)}">online lesen</a></td></tr>"""
        )
    return "".join(rows)


def download_table(entries: list[Entry], prefix: str) -> str:
    return f"""<div class="table-wrap" role="region" tabindex="0"><table class="data-table"><thead><tr><th>Titel</th><th>Typ</th><th>Kurzbeschreibung</th><th>Version</th><th>Stand</th><th>Status</th><th>Format</th><th>Download</th><th>Onlinefassung</th></tr></thead><tbody>{download_rows(entries, prefix)}</tbody></table></div>"""


def side_nav(entries: list[Entry], prefix: str) -> str:
    links = []
    for e in entries:
        rel = PORTAL_REL + "/" if e.page_slug == "" else PORTAL_REL + "/" + e.page_slug + "/"
        links.append((e.title.replace("Detailkonzept: ", ""), rel))
    links.append(("Downloads", PORTAL_REL + "/downloads/"))
    return links_strip(prefix, links)


def write_page(path: Path, title: str, subtitle: str, body: str, toc: list[tuple[int, str, str]], entries: list[Entry], entry: Entry | None = None, extra_head: str = "") -> None:
    path.mkdir(parents=True, exist_ok=True)
    prefix = rel_prefix(path)
    url_rel = str(path.relative_to(ROOT)).replace(os.sep, "/") + "/"
    canonical = SITE + "/" + url_rel
    pdf_button = ""
    docx_button = ""
    meta_bits = ""
    if entry:
        pdf_href = href(prefix, ASSET_REL + f"/{entry.download_base}.pdf")
        docx_href = href(prefix, ASSET_REL + f"/{entry.download_base}.docx")
        pdf_button = f'<a class="btn btn-secondary" href="{pdf_href}" target="_blank" rel="noopener noreferrer">PDF herunterladen</a>'
        docx_button = f'<a class="btn btn-secondary" href="{docx_href}" target="_blank" rel="noopener noreferrer">DOCX herunterladen</a>'
        meta_bits = f"""<div><dt>Version</dt><dd>{html.escape(entry.version)}</dd></div><div><dt>Stand</dt><dd>{html.escape(entry.stand)}</dd></div><div><dt>Status</dt><dd>Öffentliche Lesefassung</dd></div>"""
    else:
        meta_bits = "<div><dt>Version</dt><dd>1.0</dd></div><div><dt>Stand</dt><dd>Mai 2026</dd></div><div><dt>Status</dt><dd>Öffentliche Lesefassung</dd></div>"
    nav = "".join(f'<a href="{href(prefix, rel)}">{label}</a>' for label, rel in NAV)
    subareas = "".join(
        f"""<article class="card"><p class="card-kicker">{html.escape(e.doc_type)}</p><h3 class="card-title">{html.escape(e.title)}</h3><p class="card-text">Vollständige Onlinefassung mit Downloads und Querverweisen.</p><a class="text-link" href="{href(prefix, PORTAL_REL + '/' + (e.page_slug + '/' if e.page_slug else ''))}">Online lesen</a></article>"""
        for e in entries
        if e.page_slug
    )
    portal_sections = ""
    if entry and entry.page_slug == "":
        portal_sections = f"""<section class="section" id="unterbereiche"><div class="section-header"><p class="hero-kicker">Unterbereiche</p><h2>Onlinefassungen und Vertiefungen</h2></div><div class="card-grid three">{subareas}</div></section>
<section class="section" id="toolkarten"><div class="section-header"><p class="hero-kicker">Werkzeuge</p><h2>Toolkarten für Zukunftsbilder und Wirkungswohlstand</h2></div>{tool_cards(prefix)}</section>"""
    html_doc = f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{html.escape(title)} | Wirkungsökonomie</title>
    <meta name="description" content="{html.escape(subtitle[:155])}">
    <meta name="search_title" content="{html.escape(title)}">
    <meta name="search_description" content="{html.escape(subtitle[:155])}">
    <meta name="search_section" content="Portale">
    <meta name="search_type" content="Rang 22 - Zukunftsbilder, Wirkungswohlstand und zivilisatorische Perspektive">
    <meta name="search_tags" content="Zukunftsbilder, Wirkungswohlstand, Alltag 2035, Unternehmen 2035, Staat 2035, globale Ordnung 2050, Wirkungs-BIP, Verlustleistung, SDG+, Wirkungsökonomie">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{html.escape(title)}">
    <meta property="og:description" content="{html.escape(subtitle[:190])}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="{href(prefix, 'assets/img/brand/favicon.svg')}" type="image/svg+xml">
    <link rel="stylesheet" href="{href(prefix, 'assets/css/style.css?v=20260605-wirkungsraum-stage8')}">
    {extra_head}
  </head>
  <body>
    <a class="skip-link" href="#onlinefassung">Zum Inhalt springen</a>
    <header class="site-header">
      <a class="brand" href="{href(prefix, 'index.html')}" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="{href(prefix, 'assets/img/brand/signet.svg')}" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">{nav}</nav>
    </header>
    <main data-pagefind-body>
      <p class="print-meta">Wirkungsökonomie · Rang 22 Zukunftsbilder, Wirkungswohlstand und zivilisatorische Perspektive · {canonical} · Druckdatum: 2026-05-25</p>
      <section class="hero"><div class="hero-grid"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="{href(prefix, 'index.html')}">Start</a> / <a href="{href(prefix, PORTAL_REL + '/')}">Zukunftsbilder und Wirkungswohlstand</a></nav><p class="hero-kicker">Wirkungsökonomie</p><h1>{html.escape(title)}</h1><p class="hero-subtitle">{html.escape(subtitle)}</p><div class="hero-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()">Seite drucken</button><a class="btn btn-primary" href="#onlinefassung">Online lesen</a>{pdf_button}{docx_button}</div></div><aside class="card"><p class="card-kicker">Dokument</p><dl class="portal-meta-grid compact"><div><dt>Autorin</dt><dd>Natalie Weber</dd></div><div><dt>Referenz</dt><dd>Wirkungsökonomie</dd></div>{meta_bits}</dl><p class="card-text">Öffentliche Lesefassung. Downloads ergänzen den Onlinezugang.</p></aside></div></section>
      <section class="section"><div class="card"><p class="hero-kicker">Wirkungslogik</p><h2>Zukunftsbilder als Orientierungsräume</h2><p>Wirkung ist neutral und relational: Sie beschreibt tatsächliche Zustandsveränderungen. Bewertet wird am Referenzrahmen SDGs, Agenda 2030 und SDG+. Ziel ist positive Netto-Wirkung für Mensch, Planet und Demokratie.</p><p>Zukunftsbilder sind in der Wirkungsökonomie keine Utopien und keine Vorhersagen. Sie sind Orientierungsräume, die zeigen, wie Alltag, Unternehmen, Staat und globale Ordnung aussehen können, wenn Wirkung zur Steuerungsgröße wird.</p><p><strong>Abgrenzung:</strong> Keine fertige Zukunftsregierung, kein Parteiprogramm, keine Personenbewertung und kein Heilsversprechen.</p></div></section>
      <section class="section no-print"><div class="article-reader-stack"><details class="card toc-card reader-toc-card" open><summary>Inhaltsverzeichnis</summary>{toc_html(toc)}<div class="portal-side-links">{side_nav(entries, prefix)}</div></details><div class="reader-download-inline"><p><strong>Downloads:</strong> Downloads öffnen in einem neuen Tab.</p><div class="hero-actions">{pdf_button}{docx_button}</div></div></div></section>
      {portal_sections}
      <section class="section" id="onlinefassung"><article class="article-body prose-card portal-longform">{body}</article></section>
      {sdg_block(prefix)}
      {policy_block()}
      <section class="section" id="toolkarten-kontext"><div class="section-header"><p class="hero-kicker">Werkzeuge</p><h2>Kontextbezogene Toolkarten</h2></div>{tool_cards(prefix)}</section>
      <section class="section" id="buchanker"><div class="section-header"><p class="hero-kicker">Online-Buch</p><h2>Buchanker</h2></div>{links_strip(prefix, BOOK)}</section>
      <section class="section" id="querverweise"><div class="section-header"><p class="hero-kicker">Vernetzung</p><h2>Querverlinkungen</h2></div>{links_strip(prefix, RELATED)}</section>
      <section class="section" id="downloads"><div class="section-header"><p class="hero-kicker">Downloads</p><h2>Downloadbereich</h2></div>{download_table(entries, prefix)}</section>
    </main>
    <footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><strong>Wirkungsökonomie</strong><p>Für Mensch, Planet und Demokratie.</p></div><div class="footer-nav-group"><h2>Portal</h2><div><a href="{href(prefix, PORTAL_REL + '/')}">Zukunftsbilder</a><a href="{href(prefix, PORTAL_REL + '/downloads/')}">Downloads</a><a href="{href(prefix, PORTAL_REL + '/toolkarten/')}">Toolkarten</a></div></div><div class="footer-nav-group"><h2>Referenz</h2><div><a href="{href(prefix, 'verstehen/sdgs-sdgplus/')}">SDG-/SDG+-Referenzrahmen</a><a href="{href(prefix, 'glossar.html')}">Glossar</a><a href="{href(prefix, 'referenz/')}">Online-Buch</a></div></div></div></footer>
    <script src="{href(prefix, 'assets/js/main.js?v=20260605-wirkungsraum-stage8')}"></script>
  </body>
</html>"""
    (path / "index.html").write_text(html_doc, encoding="utf-8")


def build_download_page(entries: list[Entry], path: Path, title: str) -> None:
    prefix = rel_prefix(path)
    body = f"""<h2 id="downloadbereich">Downloadbereich</h2><p>Dieser Bereich bündelt die öffentlichen Onlinefassungen, PDF- und DOCX-Downloads sowie das bereinigte ZIP-Gesamtpaket.</p>{download_table(entries, prefix)}"""
    write_page(path, title, "Downloadstruktur mit ZIP, PDF, DOCX und Onlinefassungen.", body, [(2, "Downloadbereich", "downloadbereich")], entries)


def update_sitemap(entries: list[Entry]) -> None:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return
    urls = [PORTAL_REL + "/", PORTAL_REL + "/downloads/", DOWNLOAD_REL + "/"]
    urls.extend(PORTAL_REL + "/" + e.page_slug + "/" for e in entries if e.page_slug)
    xml = sitemap.read_text(encoding="utf-8")
    for rel in urls:
        xml = re.sub(rf"\s*<url><loc>{re.escape(SITE + '/' + rel)}</loc><lastmod>[^<]+</lastmod></url>", "", xml)
        xml = re.sub(rf"\s*<url>\s*<loc>{re.escape(SITE + '/' + rel)}</loc>\s*<lastmod>[^<]+</lastmod>\s*</url>", "", xml)
    additions = "\n".join(f"  <url><loc>{SITE}/{rel}</loc><lastmod>2026-05-25</lastmod></url>" for rel in urls)
    xml = xml.replace("</urlset>", additions + "\n</urlset>")
    sitemap.write_text(xml, encoding="utf-8")


def main() -> None:
    if not PACKAGE.exists():
        raise SystemExit(f"Package not found: {PACKAGE}")
    entries = load_entries()
    if not entries:
        raise SystemExit("No public entries found")
    copy_downloads(entries)
    make_combined_assets(entries)
    create_public_zip()
    for entry in entries:
        md = sanitize_markdown(entry.md.read_text(encoding="utf-8"))
        body, toc = markdown_to_html(md)
        page_dir = PORTAL_DIR if entry.page_slug == "" else PORTAL_DIR / entry.page_slug
        subtitle = "Zukunftsbilder, Wirkungswohlstand und zivilisatorische Perspektive als Portal für Alltag, Unternehmen, Staat, globale Ordnung, Wohlstandsmessung und Verlustleistung."
        if entry.page_slug == "":
            subtitle = "Zukunftsbilder sind keine Utopien und keine Vorhersagen. Sie sind Orientierungsräume, die zeigen, wie Alltag, Unternehmen, Staat und globale Ordnung aussehen können, wenn Wirkung zur Steuerungsgröße wird."
        write_page(page_dir, entry.title, subtitle, body, toc, entries, entry)
    build_download_page(entries, PORTAL_DIR / "downloads", "Downloads")
    build_download_page(entries, DOWNLOAD_DIR, "Downloads: Zukunftsbilder und Wirkungswohlstand")
    update_sitemap(entries)
    print(f"Built {len(entries)} public Rang 22 entries")


if __name__ == "__main__":
    main()

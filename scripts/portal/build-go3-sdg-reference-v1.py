from __future__ import annotations

import html
import json
import re
from collections import defaultdict
from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[2]
SITE = "https://wirkungsoekonomie.de"
DATE = "2026-05-24"
CSS_VERSION = "20260524-go3-sdg-v1"
JS_VERSION = "20260523-nachhaltigkeit"
SOURCE = ROOT / "docs/go3-sdg-referenzrahmen-v1/source"
WORD = SOURCE / "word"
MATRIX_JSON = ROOT / "data/sdg_unterziele_global_europa_deutschland_matrix_v1_0.json"

DOCS = {
    "agenda": {
        "path": WORD / "01_woek_sdgs_agenda2030_referenzrahmen_detailkonzept_v1_0.docx",
        "url": "/verstehen/sdgs-sdgplus/agenda-2030/",
        "out": ROOT / "verstehen/sdgs-sdgplus/agenda-2030/index.html",
        "kicker": "Go 3 · Detailkonzept 1",
        "title": "SDGs und Agenda 2030 als globaler Referenzrahmen",
        "subtitle": "Warum die 17 Ziele der Vereinten Nationen der Anschlussstecker der Wirkungsökonomie sind.",
        "description": "Online-Volltext des Go-3-Detailkonzepts zu SDGs, Agenda 2030 und ihrer Rolle als globaler Referenzrahmen der Wirkungsökonomie.",
        "docx": "/assets/downloads/01_woek_sdgs_agenda2030_referenzrahmen_detailkonzept_v1_0.docx",
        "pdf": "/assets/downloads/01_woek_sdgs_agenda2030_referenzrahmen_detailkonzept_v1_0.pdf",
    },
    "sdgplus": {
        "path": WORD / "02_woek_sdgplus_erweiterung_detailkonzept_v1_0.docx",
        "url": "/verstehen/sdgs-sdgplus/sdgplus/",
        "out": ROOT / "verstehen/sdgs-sdgplus/sdgplus/index.html",
        "kicker": "Go 3 · Detailkonzept 2",
        "title": "SDG+ als Erweiterung der Wirkungsökonomie",
        "subtitle": "Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, Vertrauen, Zusammenhalt und digitale Selbstbestimmung.",
        "description": "Online-Volltext des Go-3-Detailkonzepts zu SDG+ als transparenter Erweiterung der Wirkungsökonomie.",
        "docx": "/assets/downloads/02_woek_sdgplus_erweiterung_detailkonzept_v1_0.docx",
        "pdf": "/assets/downloads/02_woek_sdgplus_erweiterung_detailkonzept_v1_0.pdf",
    },
    "targets": {
        "path": WORD / "03_woek_sdg_unterziele_global_europa_deutschland_detailkonzept_v1_0.docx",
        "url": "/verstehen/sdgs-sdgplus/unterziele/",
        "out": ROOT / "verstehen/sdgs-sdgplus/unterziele/index.html",
        "kicker": "Go 3 · Detailkonzept 3",
        "title": "SDG-Unterziele global, Europa und Deutschland",
        "subtitle": "Die 169 Unterziele als zitierfähige Matrix mit globalem, Europa-/Deutschland- und WÖk-Bezug.",
        "description": "Online-Volltext des Go-3-Detailkonzepts zu den SDG-Unterzielen mit globalem, Europa-/Deutschland- und wirkungsökonomischem Bezug.",
        "docx": "/assets/downloads/03_woek_sdg_unterziele_global_europa_deutschland_detailkonzept_v1_0.docx",
        "pdf": "/assets/downloads/03_woek_sdg_unterziele_global_europa_deutschland_detailkonzept_v1_0.pdf",
    },
}

SDG_TITLES = {
    1: "Keine Armut",
    2: "Kein Hunger",
    3: "Gesundheit und Wohlergehen",
    4: "Hochwertige Bildung",
    5: "Geschlechtergleichstellung",
    6: "Sauberes Wasser und Sanitäreinrichtungen",
    7: "Bezahlbare und saubere Energie",
    8: "Menschenwürdige Arbeit und Wirtschaftswachstum",
    9: "Industrie, Innovation und Infrastruktur",
    10: "Weniger Ungleichheiten",
    11: "Nachhaltige Städte und Gemeinden",
    12: "Nachhaltiger Konsum und Produktion",
    13: "Maßnahmen zum Klimaschutz",
    14: "Leben unter Wasser",
    15: "Leben an Land",
    16: "Frieden, Gerechtigkeit und starke Institutionen",
    17: "Partnerschaften zur Erreichung der Ziele",
}

SDG_HOVERS = {
    1: "Armut in allen Formen beenden und soziale Sicherung, Zugang zu Grundversorgung und faire Teilhabe stärken.",
    2: "Ernährungssicherheit, nachhaltige Landwirtschaft, gesunde Ernährung und resiliente Ernährungssysteme stärken.",
    3: "Gesundes Leben und Wohlergehen für alle Menschen in allen Altersgruppen fördern.",
    4: "Inklusive, chancengerechte und hochwertige Bildung sowie lebenslanges Lernen ermöglichen.",
    5: "Gleichstellung der Geschlechter erreichen und Selbstbestimmung von Frauen und Mädchen stärken.",
    6: "Verfügbarkeit und nachhaltige Bewirtschaftung von Wasser und Sanitärversorgung sichern.",
    7: "Zugang zu bezahlbarer, verlässlicher, nachhaltiger und moderner Energie sichern.",
    8: "Menschenwürdige Arbeit, produktive Beschäftigung und nachhaltige wirtschaftliche Entwicklung fördern.",
    9: "Widerstandsfähige Infrastruktur, nachhaltige Industrialisierung und Innovation fördern.",
    10: "Ungleichheiten innerhalb und zwischen Ländern verringern.",
    11: "Städte und Siedlungen inklusiv, sicher, widerstandsfähig und nachhaltig gestalten.",
    12: "Nachhaltige Konsum- und Produktionsmuster sicherstellen.",
    13: "Dringende Maßnahmen zur Bekämpfung des Klimawandels und seiner Folgen ergreifen.",
    14: "Ozeane, Meere und Meeresressourcen erhalten und nachhaltig nutzen.",
    15: "Landökosysteme, Wälder, Böden und Biodiversität schützen, wiederherstellen und nachhaltig nutzen.",
    16: "Friedliche, inklusive Gesellschaften, Rechtsstaatlichkeit, Zugang zu Recht und wirksame Institutionen fördern.",
    17: "Globale Partnerschaften, Zusammenarbeit, Finanzierung, Daten und Umsetzungskraft für nachhaltige Entwicklung stärken.",
}

SDG_PLUS = [
    ("demokratie", "Demokratie", "Demokratische Stabilität, Teilhabe, Streitfähigkeit und Korrekturfähigkeit als Wirkungsbedingung."),
    ("medienqualitaet", "Medienqualität", "Qualität öffentlicher Information, journalistische Verantwortung, Quellenklarheit und Schutz vor Desinformation."),
    ("rechtsstaatlichkeit", "Rechtsstaatlichkeit", "Verlässliche Regeln, Grundrechte, unabhängige Gerichte und Schutz vor Willkür."),
    ("diskursfaehigkeit", "Diskursfähigkeit", "Die Fähigkeit einer Gesellschaft, Konflikte faktenbasiert, respektvoll und demokratisch zu bearbeiten."),
    ("institutionelles-vertrauen", "institutionelles Vertrauen", "Vertrauen in Institutionen, Verfahren, Datenqualität, Transparenz und demokratische Korrekturmechanismen."),
    ("gesellschaftlicher-zusammenhalt", "gesellschaftlicher Zusammenhalt", "Soziale Bindung, Zugehörigkeit, Teilhabe, Sicherheit, Fairness und Schutz vor Spaltung."),
    ("digitale-selbstbestimmung", "digitale Selbstbestimmung", "Schutz vor Manipulation, Datenrechte, algorithmische Fairness, digitale Teilhabe und souveräne Nutzung digitaler Räume."),
]

OFFICIAL_SOURCES = [
    ("United Nations - Agenda 2030", "https://sdgs.un.org/2030agenda"),
    ("United Nations - The 17 SDGs", "https://sdgs.un.org/goals"),
    ("UN Statistics - Global SDG Indicator Framework", "https://unstats.un.org/sdgs/indicators/indicators-list/"),
    ("Destatis - SDG-Indikatoren für Deutschland", "https://sdg-indikatoren.de/"),
    ("Destatis - Nachhaltigkeitsindikatoren", "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html"),
    ("Eurostat - SDG Monitoring", "https://ec.europa.eu/eurostat/web/sdi"),
    ("Bundesregierung - Deutsche Nachhaltigkeitsstrategie", "https://www.bundesregierung.de/breg-de/themen/nachhaltigkeitspolitik"),
]


def esc(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def rel_base(out: Path) -> str:
    rel = out.parent.relative_to(ROOT)
    depth = len(rel.parts)
    return "../" * depth if depth else ""


def slugify(value: str) -> str:
    value = value.lower()
    repl = {
        "ä": "ae",
        "ö": "oe",
        "ü": "ue",
        "ß": "ss",
        "&": "und",
        "+": "plus",
    }
    for old, new in repl.items():
        value = value.replace(old, new)
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "abschnitt"


def sdg_slug(number: int) -> str:
    slugs = {
        1: "sdg-1-keine-armut",
        2: "sdg-2-kein-hunger",
        3: "sdg-3-gesundheit-wohlergehen",
        4: "sdg-4-hochwertige-bildung",
        5: "sdg-5-geschlechtergleichstellung",
        6: "sdg-6-sauberes-wasser-sanitaereinrichtungen",
        7: "sdg-7-bezahlbare-saubere-energie",
        8: "sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum",
        9: "sdg-9-industrie-innovation-infrastruktur",
        10: "sdg-10-weniger-ungleichheiten",
        11: "sdg-11-nachhaltige-staedte-gemeinden",
        12: "sdg-12-nachhaltiger-konsum-produktion",
        13: "sdg-13-klimaschutz",
        14: "sdg-14-leben-unter-wasser",
        15: "sdg-15-leben-an-land",
        16: "sdg-16-frieden-gerechtigkeit-starke-institutionen",
        17: "sdg-17-partnerschaften",
    }
    return slugs[number]


def target_sdg_number(row: dict) -> int:
    match = re.search(r"SDG\s+(\d+)", row.get("SDG", ""))
    if not match:
        raise ValueError(f"Cannot parse SDG number from {row!r}")
    return int(match.group(1))


def parse_doc(path: Path) -> list[dict]:
    doc = Document(path)
    sections: list[dict] = []
    current: dict | None = None
    seen_numbered = False
    for para in doc.paragraphs:
        text = " ".join(para.text.split())
        if not text:
            continue
        style = para.style.name if para.style else ""
        if style == "Heading 1" and re.match(r"^\d+\.", text):
            seen_numbered = True
            current = {"title": text, "id": slugify(text), "paragraphs": []}
            sections.append(current)
            continue
        if style == "Heading 1" and seen_numbered:
            current = {"title": text, "id": slugify(text), "paragraphs": []}
            sections.append(current)
            continue
        if current:
            current["paragraphs"].append(text)
    return sections


def paragraph_html(text: str) -> str:
    if re.search(r"\b(CodeX|Codex|Repository)\b", text):
        text = (
            "Dieses Fachdetailkonzept ist online zitierfähig lesbar; Downloads dienen als Export- und Archivfassung. "
            "Die öffentliche Fassung bündelt Kapitelanker, Quellen, Downloadkarten, Buchanker, Glossarlinks, "
            "SDG-/SDG+-Badges, WÖk-ID-Bezug, Scorecards und politische Anschlussfähigkeit."
        )
    if re.match(r"^\d+\.\s+", text):
        return f"<p>{esc(text)}</p>"
    return f"<p>{esc(text)}</p>"


def toc(sections: list[dict]) -> str:
    return f"""
      <aside class="toc-card no-print" aria-labelledby="toc-heading">
        <h2 id="toc-heading">Inhaltsverzeichnis</h2>
        <ol>
          {''.join(f'<li><a href="#{esc(section["id"])}">{esc(section["title"])}</a></li>' for section in sections)}
        </ol>
      </aside>
    """


def download_cards(doc: dict, base: str) -> str:
    docx = doc["docx"].lstrip("/")
    pdf = doc["pdf"].lstrip("/")
    return f"""
      <section class="section" aria-labelledby="downloads">
        <div class="section-header">
          <p class="hero-kicker">Dossier & Export</p>
          <h2 id="downloads">Downloads und Druck</h2>
          <p>Der Online-Volltext ist der Hauptzugang. Word und PDF bleiben als Export- und Archivfassungen verfügbar.</p>
        </div>
        <div class="card-grid two">
          <article class="download-card">
            <p class="card-kicker">DOCX · v1.0</p>
            <h3>Word-Fassung herunterladen</h3>
            <p>Bearbeitbare Archivfassung des Fachdetailkonzepts.</p>
            <a class="btn btn-primary" href="{base}{docx}">DOCX herunterladen</a>
          </article>
          <article class="download-card">
            <p class="card-kicker">PDF · v1.0</p>
            <h3>PDF-Fassung herunterladen</h3>
            <p>Layoutfassung des Fachdetailkonzepts als ergänzende Exportdatei.</p>
            <a class="btn btn-secondary" href="{base}{pdf}">PDF herunterladen</a>
          </article>
        </div>
      </section>
    """


def source_block() -> str:
    links = "".join(
        f'<li><a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(label)} <span aria-hidden="true">↗</span></a></li>'
        for label, url in OFFICIAL_SOURCES
    )
    return f"""
      <section class="section" aria-labelledby="sources">
        <div class="section-header">
          <p class="hero-kicker">Quellenblock</p>
          <h2 id="sources">Offizielle Referenzen</h2>
          <p>Die UN-Ziele und Indikatoren werden verlinkt; lange offizielle Texte werden nicht kopiert.</p>
        </div>
        <ul class="link-list">{links}</ul>
      </section>
    """


def book_anchor_block() -> str:
    anchors = [
        "Exkurs: Warum die SDGs der Referenzrahmen der Wirkungsökonomie sind",
        "Kapitel 31 - WÖk-IDs und Indikatorenarchitektur",
        "Kapitel 32 - Benchmarks, Skalen und Scorecards",
        "Kapitel 33 - Reverse Merit Order",
        "Kapitel 34 - T-SROI und systemische Transformationsmessung",
        "Kapitel 36 - Wirkung als Rechtsprinzip",
        "Kapitel 37 - Wirkungssteuergesetz WStG",
    ]
    return f"""
      <section class="section" aria-labelledby="book-anchors">
        <div class="section-header">
          <p class="hero-kicker">Online-Buch</p>
          <h2 id="book-anchors">Anker im Online-Buch</h2>
          <p>Die exakten Buchanker werden ergänzt, sobald die jeweilige Online-Buch-Struktur vorliegt.</p>
        </div>
        <div class="download-card">
          <ul class="check-list">{''.join(f'<li>{esc(item)}</li>' for item in anchors)}</ul>
          <a class="text-link" href="/buch/">Online-Buch öffnen</a>
        </div>
      </section>
    """


def political_block() -> str:
    rows = [
        ("Aufgabe der Politik", "Wirkungsdaten öffentlich anschlussfähig machen, ohne demokratische Entscheidungen zu ersetzen."),
        ("Politische Rahmenbedingungen", "Datenqualität, Grundrechte, Teilhabe, Finanzierung, Rechtsschutz und transparente Zuständigkeiten sichern."),
        ("Ausgestaltungsspielraum", "Parteien und Parlamente können Tempo, Instrumente, Verbindlichkeit und soziale Abfederung unterschiedlich gestalten."),
        ("Zielkonflikte", "Nachhaltigkeitsziele, wirtschaftliche Leistungsfähigkeit, soziale Sicherheit, Datenschutz und Freiheitsrechte müssen abgewogen werden."),
        ("Evaluation und Korrektur", "Entscheidungen bleiben überprüfbar, lernfähig und korrigierbar."),
        ("Schutz vor Technokratie", "Wirkungsdaten bereiten Entscheidungen vor, ersetzen sie aber nicht. Normative Entscheidungen bleiben demokratisch legitimiert."),
    ]
    return f"""
      <section class="section" aria-labelledby="political">
        <div class="section-header">
          <p class="hero-kicker">Demokratische Umsetzung</p>
          <h2 id="political">Politische Anschlussfähigkeit und Schutz vor Technokratie</h2>
          <p>Die folgenden politischen Anforderungen beschreiben keinen fertigen Parteibeschluss. Sie markieren den notwendigen Rahmen, damit der Referenzrahmen demokratisch, rechtsstaatlich und praktisch genutzt werden kann.</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Dimension</th><th>Einordnung</th></tr></thead>
            <tbody>{''.join(f'<tr><th scope="row">{esc(a)}</th><td>{esc(b)}</td></tr>' for a, b in rows)}</tbody>
          </table>
        </div>
      </section>
    """


def sdg_badge(number: int, base: str) -> str:
    popover = f"sdg-{number}-popover"
    label = f"SDG {number} {SDG_TITLES[number]}"
    url = f"{base}verstehen/sdgs-sdgplus/{sdg_slug(number)}/"
    return f"""<span class="sdg-ref" data-sdg-id="sdg-{number}">
      <a class="sdg-ref-link" href="{url}" aria-label="{esc(label + ': ' + SDG_HOVERS[number])}" aria-describedby="{popover}">{esc(label)}</a>
      <button class="sdg-ref-info" type="button" aria-label="{esc('Kurzbeschreibung zu ' + label + ': ' + SDG_HOVERS[number])}" aria-describedby="{popover}">i</button>
      <span class="sdg-ref-popover" id="{popover}" role="tooltip">{esc(SDG_HOVERS[number])} <span class="sdg-ref-more">Details öffnen</span></span>
    </span>"""


def sdgplus_badge(item: tuple[str, str, str], base: str) -> str:
    key, label, hover = item
    popover = f"sdgplus-{key}-popover"
    return f"""<span class="sdg-ref" data-sdg-id="sdgplus-{key}">
      <a class="sdg-ref-link" href="{base}verstehen/sdgs-sdgplus/#sdgplus-{key}" aria-label="{esc('SDG+ ' + label + ': ' + hover)}" aria-describedby="{popover}">SDG+ {esc(label)}</a>
      <button class="sdg-ref-info" type="button" aria-label="{esc('Kurzbeschreibung zu SDG+ ' + label + ': ' + hover)}" aria-describedby="{popover}">i</button>
      <span class="sdg-ref-popover" id="{popover}" role="tooltip">{esc(hover)} <span class="sdg-ref-more">Details öffnen</span></span>
    </span>"""


def badge_block(base: str) -> str:
    return f"""
      <section class="section" aria-labelledby="sdg-badges">
        <div class="section-header">
          <p class="hero-kicker">Referenzrahmen</p>
          <h2 id="sdg-badges">SDG-/SDG+-Badges</h2>
          <p>Alle Badges sind Links. Hover, Fokus und Tap zeigen eine Kurzbeschreibung; die Detailseiten enthalten die Langfassung.</p>
        </div>
        <div class="model-strip">
          {''.join(sdg_badge(number, base) for number in range(1, 18))}
          {''.join(sdgplus_badge(item, base) for item in SDG_PLUS)}
        </div>
      </section>
    """


def page_template(doc: dict, body: str) -> str:
    base = rel_base(doc["out"])
    title = doc["title"]
    description = doc["description"]
    canonical = f"{SITE}{doc['url']}"
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{esc(title)} | Wirkungsökonomie</title>
    <meta name="description" content="{esc(description)}">
    <meta name="search_title" content="{esc(title)}">
    <meta name="search_description" content="{esc(description)}">
    <meta name="search_section" content="Verstehen">
    <meta name="search_type" content="Detailkonzept">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="{esc(title)}">
    <meta property="og:description" content="{esc(description)}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{SITE}/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="{base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="{base}assets/css/style.css?v=20260604-menu-fix}">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="{base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="{base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="{base}index.html">Start</a>
        <a href="{base}verstehen/sdgs-sdgplus/">SDG-/SDG+</a>
      </nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · {esc(title)} · {canonical} · Druckdatum: 24.05.2026</p>
      {body}
    </main>
    <footer class="site-footer">
      <p>© Wirkungsökonomie · Online-Volltext ist Hauptzugang, Downloads sind Export und Archiv.</p>
    </footer>
    <script src="{base}assets/js/main.js?v=20260604-wirkungsraum" defer></script>
  </body>
</html>
"""


def render_doc_page(doc_key: str, extra_before: str = "", extra_after: str = "") -> None:
    doc = DOCS[doc_key]
    base = rel_base(doc["out"])
    sections = parse_doc(doc["path"])
    section_html = ""
    for section in sections:
        section_html += f"""
          <section class="section" id="{esc(section['id'])}" aria-labelledby="{esc(section['id'])}-heading">
            <div class="section-header">
              <p class="hero-kicker">Detailkonzept</p>
              <h2 id="{esc(section['id'])}-heading">{esc(section['title'])} <a class="cite-anchor no-print" href="#{esc(section['id'])}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
            </div>
            <div class="longform">
              {''.join(paragraph_html(p) for p in section['paragraphs'])}
            </div>
          </section>
        """
    body = f"""
      <section class="hero portal-hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb"><a href="{base}index.html">Start</a> / <a href="{base}verstehen/sdgs-sdgplus/">SDG-/SDG+-Referenzrahmen</a></nav>
            <p class="hero-kicker">{esc(doc['kicker'])}</p>
            <h1>{esc(doc['title'])}</h1>
            <p class="hero-subtitle">{esc(doc['subtitle'])}</p>
            <p>Dieser Online-Volltext macht das Go-3-Fachdetailkonzept zitierfähig online lesbar. Word und PDF bleiben ergänzende Exportfassungen.</p>
            <div class="hero-actions no-print">
              <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
              <a class="btn btn-primary" href="{base}verstehen/sdgs-sdgplus/">Referenzrahmen öffnen</a>
            </div>
          </div>
          <aside class="citation-note">
            <p class="card-kicker">Zitierfähig</p>
            <h2>Abschnittsanker</h2>
            <p>Jedes Kapitel hat einen stabilen Anker. Öffentliche Inhalte enthalten keine internen Arbeitsanweisungen.</p>
          </aside>
        </div>
      </section>
      {extra_before}
      <section class="section">
        {toc(sections)}
      </section>
      {section_html}
      {extra_after}
      {political_block()}
      {badge_block(base)}
      {book_anchor_block()}
      {source_block()}
      {download_cards(doc, base)}
    """
    write_page(doc["out"], page_template(doc, body))


def write_page(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    cleaned = "\n".join(line.rstrip() for line in content.splitlines()) + "\n"
    path.write_text(cleaned, encoding="utf-8")


def matrix_by_sdg() -> dict[int, list[dict]]:
    rows = json.loads(MATRIX_JSON.read_text(encoding="utf-8"))
    groups: dict[int, list[dict]] = defaultdict(list)
    for row in rows:
        groups[target_sdg_number(row)].append(row)
    return dict(sorted(groups.items()))


def target_table(rows: list[dict], sdg_number: int | None = None) -> str:
    body = ""
    for row in rows:
        number = target_sdg_number(row)
        official = f"https://sdgs.un.org/goals/goal{number}"
        body += f"""
          <tr data-target-row>
            <th scope="row">{esc(row.get('Target'))}</th>
            <td>{esc(row.get('Globaler Inhalt (paraphrasiert)'))}</td>
            <td>{esc(row.get('Europa/Deutschland-Bezug'))}</td>
            <td>{esc(row.get('Wirkungsökonomische Bedeutung'))}</td>
            <td><a href="{official}" target="_blank" rel="noopener noreferrer">UN-Zielseite</a><br><a href="https://unstats.un.org/sdgs/indicators/indicators-list/" target="_blank" rel="noopener noreferrer">UN Indicators</a></td>
          </tr>
        """
    return f"""
      <div class="table-wrap">
        <table>
          <caption>{'SDG ' + str(sdg_number) + ' - ' + SDG_TITLES[sdg_number] if sdg_number else 'SDG-Unterzielmatrix v1.0'}</caption>
          <thead>
            <tr>
              <th>Target</th>
              <th>Globaler Inhalt</th>
              <th>Europa / Deutschland</th>
              <th>Wirkungsökonomische Bedeutung</th>
              <th>Quellen</th>
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    """


def render_targets_overview() -> None:
    groups = matrix_by_sdg()
    all_rows = [row for rows in groups.values() for row in rows]
    base = rel_base(DOCS["targets"]["out"])
    cards = "".join(
        f"""
        <article class="card">
          <p class="card-kicker">SDG {number}</p>
          <h3>{esc(SDG_TITLES[number])}</h3>
          <p>{len(rows)} Unterziele mit globalem, Europa-/Deutschland- und WÖk-Bezug.</p>
          <a class="text-link" href="{base}verstehen/sdgs-sdgplus/unterziele/sdg-{number}/">Unterziele öffnen</a>
        </article>
        """
        for number, rows in groups.items()
    )
    filter_box = """
      <div class="download-card no-print">
        <label class="form-label" for="target-filter">Matrix filtern</label>
        <input id="target-filter" class="input" type="search" placeholder="z. B. Armut, Bildung, Klima, 16.6" data-target-filter>
        <p class="card-text">Die Filterung erfolgt lokal im Browser. Die CSV- und JSON-Dateien stehen zusätzlich als offene Arbeitsdaten bereit.</p>
      </div>
    """
    extra_after = f"""
      <section class="section" aria-labelledby="sdg-target-pages">
        <div class="section-header">
          <p class="hero-kicker">169 Unterziele</p>
          <h2 id="sdg-target-pages">Unterziele nach SDG öffnen</h2>
        </div>
        <div class="card-grid three">{cards}</div>
      </section>
      <section class="section" aria-labelledby="full-matrix">
        <div class="section-header">
          <p class="hero-kicker">Unterzielmatrix</p>
          <h2 id="full-matrix">Globale, Europa-/Deutschland- und WÖk-Bezüge</h2>
          <p>Die Unterziele werden paraphrasiert und mit offiziellen UN-Quellen verlinkt. Die Wirkungsökonomie nutzt sie als Indikator- und Rückkopplungsrahmen.</p>
        </div>
        {filter_box}
        {target_table(all_rows)}
        <script>
          document.querySelector('[data-target-filter]')?.addEventListener('input', (event) => {{
            const query = event.target.value.trim().toLowerCase();
            document.querySelectorAll('[data-target-row]').forEach((row) => {{
              row.hidden = query && !row.textContent.toLowerCase().includes(query);
            }});
          }});
        </script>
      </section>
      <section class="section" aria-labelledby="matrix-downloads">
        <div class="section-header">
          <p class="hero-kicker">Offene Matrixdaten</p>
          <h2 id="matrix-downloads">CSV und JSON herunterladen</h2>
        </div>
        <div class="card-grid two">
          <article class="download-card"><p class="card-kicker">CSV · v1.0</p><h3>Unterzielmatrix CSV</h3><a class="btn btn-primary" href="{base}data/sdg_unterziele_global_europa_deutschland_matrix_v1_0.csv">CSV herunterladen</a></article>
          <article class="download-card"><p class="card-kicker">JSON · v1.0</p><h3>Unterzielmatrix JSON</h3><a class="btn btn-secondary" href="{base}data/sdg_unterziele_global_europa_deutschland_matrix_v1_0.json">JSON herunterladen</a></article>
        </div>
      </section>
    """
    render_doc_page("targets", extra_after=extra_after)


def render_sdg_target_page(number: int, rows: list[dict]) -> None:
    out = ROOT / f"verstehen/sdgs-sdgplus/unterziele/sdg-{number}/index.html"
    base = rel_base(out)
    doc = {
        "title": f"SDG {number} - {SDG_TITLES[number]}: Unterziele",
        "description": f"Unterziele von SDG {number} mit globalem Inhalt, Europa-/Deutschland-Bezug und wirkungsökonomischer Bedeutung.",
        "url": f"/verstehen/sdgs-sdgplus/unterziele/sdg-{number}/",
        "out": out,
        "docx": DOCS["targets"]["docx"],
        "pdf": DOCS["targets"]["pdf"],
    }
    body = f"""
      <section class="hero portal-hero">
        <div class="hero-grid">
          <div>
            <nav class="breadcrumb"><a href="{base}index.html">Start</a> / <a href="{base}verstehen/sdgs-sdgplus/unterziele/">Unterzielmatrix</a></nav>
            <p class="hero-kicker">Offizielles UN-Ziel der Agenda 2030</p>
            <h1>SDG {number} - {esc(SDG_TITLES[number])}</h1>
            <p class="hero-subtitle">{esc(SDG_HOVERS[number])}</p>
            <p>Diese Seite macht die Unterziele von SDG {number} zitierfähig online lesbar. Die Wirkungsökonomie ordnet die Zielcodes als Bewertungs-, Indikator- und Rückkopplungsrahmen ein.</p>
            <div class="hero-actions no-print">
              <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
              <a class="btn btn-primary" href="{base}verstehen/sdgs-sdgplus/{sdg_slug(number)}/">SDG-Detailseite öffnen</a>
            </div>
          </div>
          <aside class="citation-note">
            <p class="card-kicker">Zitieranker</p>
            <h2>Unterziele {esc(rows[0].get('Target'))} bis {esc(rows[-1].get('Target'))}</h2>
            <p>Paraphrasierte Zielinhalte mit Links zur UN-Zielseite und zum globalen Indikatorenrahmen.</p>
          </aside>
        </div>
      </section>
      <section class="section" aria-labelledby="targets">
        <div class="section-header">
          <p class="hero-kicker">Globale Unterziele</p>
          <h2 id="targets">Unterziele, Europa-/Deutschland-Bezug und WÖk-Bedeutung</h2>
          <p>Die Matrix vermeidet lange Kopien offizieller Texte und verbindet jeden Target-Code mit einer verständlichen WÖk-Einordnung.</p>
        </div>
        {target_table(rows, number)}
      </section>
      {political_block()}
      {badge_block(base)}
      {source_block()}
      {download_cards(DOCS["targets"], base)}
    """
    write_page(out, page_template(doc, body))


def render_all() -> None:
    agenda_extra = """
      <section class="section" aria-labelledby="shortbox">
        <div class="download-card">
          <p class="card-kicker">Kurzinfobox</p>
          <h2 id="shortbox">Was sind die SDGs und die Agenda 2030?</h2>
          <p>Die SDGs sind die 17 Ziele für nachhaltige Entwicklung der Vereinten Nationen. Sie wurden 2015 von allen UN-Mitgliedstaaten im Rahmen der Agenda 2030 beschlossen. Der Beschluss ist kein Weltgesetz und keine einheitliche Wirtschaftsideologie, sondern ein globaler Zielrahmen für verbesserte Zustände bis 2030.</p>
          <p><strong>Merksatz:</strong> Die SDGs sind nicht der Ursprung der Wirkungsökonomie. Sie sind ihr globaler Anschlussstecker.</p>
        </div>
      </section>
    """
    sdgplus_extra = """
      <section class="section" id="sdgplus" aria-labelledby="sdgplus-notice">
        <div class="download-card">
          <p class="card-kicker">Pflichthinweis</p>
          <h2 id="sdgplus-notice">SDG+ ist eine WÖk-Erweiterung</h2>
          <p>SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie. Sie ergänzt die 17 SDGs um demokratische, mediale, rechtsstaatliche, soziale und digitale Voraussetzungen, ohne die positive Netto-Wirkung für Mensch, Planet und Demokratie nicht stabil erreicht werden kann.</p>
        </div>
      </section>
    """
    render_doc_page("agenda", extra_before=agenda_extra)
    render_doc_page("sdgplus", extra_before=sdgplus_extra)
    render_targets_overview()
    for number, rows in matrix_by_sdg().items():
        render_sdg_target_page(number, rows)


if __name__ == "__main__":
    render_all()

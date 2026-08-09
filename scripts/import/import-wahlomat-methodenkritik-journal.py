#!/usr/bin/env python3
"""Importiert die überarbeitete Journalfassung zur Wahl-O-Mat-Methodenkritik.

Aufruf:
SOURCE_DOCX=/absoluter/pfad.docx TITLE_IMAGE=/absoluter/pfad.png \\
python3 scripts/import/import-wahlomat-methodenkritik-journal.py
"""
from __future__ import annotations

import html
import json
import os
import shutil
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DOCX = Path(os.environ["SOURCE_DOCX"])
TITLE_IMAGE = Path(os.environ["TITLE_IMAGE"])
SLUG = "wahl-o-mat-methodenkritik-sachsen-anhalt-2026"
TITLE = "Wenn Ja und Nein nicht dasselbe meinen"
SUBTITLE = "Was der Wahl-O-Mat tatsächlich misst, wo seine Methodik an Grenzen stößt – und warum seine Fragen selbst politische Wirkung entfalten können"
DESCRIPTION = "Eine vollumfassende wirkungsökonomische Methodenkritik am Wahl-O-Mat Sachsen-Anhalt 2026: Entscheidungsreife, Auswahl, Rechenlogik, Kompetenzebenen, Demokratiekontext und gesellschaftliche Verstärkungsdynamiken."
DATE = "9. August 2026"
DATE_ISO = "2026-08-09T09:30:00+02:00"
MODIFIED_ISO = "2026-08-09T12:30:00+02:00"
IMAGE = "2026-08-09-wahl-o-mat-methodenkritik-sachsen-anhalt-2026.png"
IMAGE_ALT = "Methodenkritik zum Wahl-O-Mat: Eine These kann unterschiedliche plausible Bedeutungen und Antworten auslösen."
ARTICLE = ROOT / "blog" / f"{SLUG}.html"
ASSETS = ROOT / "assets" / "img" / "blog"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W = "{%s}" % NS["w"]


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def text(el: ET.Element) -> str:
    return "".join(node.text or "" for node in el.findall(".//w:t", NS)).strip()


def style(el: ET.Element) -> str:
    value = el.find("w:pPr/w:pStyle", NS)
    return value.get(W + "val", "Normal") if value is not None else "Normal"


def paragraph_html(el: ET.Element) -> str:
    output = []
    for run in el.findall("w:r", NS):
        value = "".join(node.text or "" for node in run.findall(".//w:t", NS))
        if not value:
            continue
        value = esc(value)
        props = run.find("w:rPr", NS)
        if props is not None and props.find("w:b", NS) is not None:
            value = f"<strong>{value}</strong>"
        if props is not None and props.find("w:i", NS) is not None:
            value = f"<em>{value}</em>"
        output.append(value)
    rendered = "".join(output)
    # Preserve content stored in Word hyperlink/smart-content wrappers.
    return rendered if html.unescape(rendered) == text(el) else esc(text(el))


def rows(table: ET.Element) -> list[list[str]]:
    return [
        [" ".join(text(p) for p in cell.findall("w:p", NS) if text(p)).strip() for cell in row.findall("w:tc", NS)]
        for row in table.findall("w:tr", NS)
    ]


def callout_cell_html(cell: ET.Element) -> str:
    paragraph = cell.find("w:p", NS)
    if paragraph is None:
        return esc(text(cell))
    parts = ["".join(node.text or "" for node in run.findall(".//w:t", NS)) for run in paragraph.findall("w:r", NS)]
    parts = [part for part in parts if part]
    if len(parts) < 2:
        value = text(cell)
        for label in ("Die zentrale These dieses Artikels", "Methodischer Hinweis", "Die einfache Korrektur", "Wichtig", "Kurz gesagt"):
            if value.startswith(label):
                return f"<strong>{esc(label)}</strong> {esc(value[len(label):])}"
        return esc(value)
    # The Word source uses adjacent styled runs for callout labels and body text
    # without a literal whitespace run between them.
    return f"<strong>{esc(parts[0])}</strong> {esc(''.join(parts[1:]))}"


def table_html(table: ET.Element) -> str:
    values = [row for row in rows(table) if any(row)]
    if not values:
        return ""
    if len(values) == 1 and len(values[0]) == 1:
        cell = table.find(".//w:tc", NS)
        return f"          <blockquote><p>{callout_cell_html(cell) if cell is not None else esc(values[0][0])}</p></blockquote>"
    if len(values[0]) == 2:
        body = "\n".join(
            f"              <tr><th scope=\"row\">{esc(row[0])}</th><td>{esc(row[1] if len(row) > 1 else '')}</td></tr>"
            for row in values
        )
        return f'''          <div class="table-scroll"><table><tbody>
{body}
          </tbody></table></div>'''
    header, *body = values
    head = "".join(f'<th scope="col">{esc(cell)}</th>' for cell in header)
    rendered_rows = "\n".join(
        "              <tr>" + "".join(f"<td>{esc(cell)}</td>" for cell in row) + "</tr>"
        for row in body
    )
    return f'''          <div class="table-scroll"><table><thead><tr>{head}</tr></thead><tbody>
{rendered_rows}
          </tbody></table></div>'''


def copy_asset() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    target = ASSETS / IMAGE
    if TITLE_IMAGE.resolve() != target.resolve():
        shutil.copy2(TITLE_IMAGE, target)


def render_content() -> str:
    with ZipFile(SOURCE_DOCX) as doc:
        body = ET.fromstring(doc.read("word/document.xml")).find("w:body", NS)
    assert body is not None
    output: list[str] = []
    active = False
    for child in body:
        if child.tag == W + "p":
            raw, kind = text(child), style(child)
            if not active:
                if kind == "Heading1" and raw == "Executive Summary":
                    active = True
                else:
                    continue
            if not raw:
                continue
            if kind == "Heading1":
                output.append(f"          <h2>{esc(raw)}</h2>")
            elif kind == "Heading2":
                output.append(f"          <h3>{esc(raw)}</h3>")
            elif kind == "Callout":
                output.append(f"          <blockquote><p>{paragraph_html(child)}</p></blockquote>")
            elif kind == "Small":
                output.append(f"          <p class=\"small-text\">{paragraph_html(child)}</p>")
            else:
                output.append(f"          <p>{paragraph_html(child)}</p>")
        elif active and child.tag == W + "tbl":
            table_rows = rows(child)
            rendered = table_html(child)
            if rendered:
                output.append(rendered)
    return apply_editorial_revision("\n".join(output))


def replace_once(content: str, old: str, new: str) -> str:
    if old not in content:
        raise ValueError(f"Erwarteter Redaktionsabschnitt nicht gefunden: {old[:80]!r}")
    return content.replace(old, new, 1)


def replace_section(content: str, start: str, end: str, replacement: str) -> str:
    start_index = content.find(start)
    end_index = content.find(end, start_index)
    if start_index < 0 or end_index < 0:
        raise ValueError(f"Erwarteter Redaktionsabschnitt nicht gefunden: {start[:80]!r}")
    return content[:start_index] + replacement + content[end_index:]


def apply_editorial_revision(content: str) -> str:
    """Hält die nachträgliche fachliche Präzisierung beim Re-Import reproduzierbar."""
    content = replace_once(
        content,
        "          <p>Strategische Bespielbarkeit: Weil die Methodik öffentlich ist und kontroverse Positionen einen hohen Differenzierungswert besitzen, entsteht ein möglicher Anreiz für Parteien, besonders markante Konfliktforderungen zu setzen. Dass eine konkrete Partei dies gezielt für den Wahl-O-Mat tut, ist damit noch nicht bewiesen – die Systemanfälligkeit ist aber eine legitime Untersuchungsfrage.</p>",
        "          <p>Mediale Verstärkungsdynamik: Politische Programme sind nicht nur Kataloge später umsetzbarer Vorhaben, sondern auch Kommunikationsinstrumente. Polarisierende Forderungen können Aufmerksamkeit und Problemrahmen erzeugen, unabhängig davon, ob sie auf der jeweiligen politischen Ebene tatsächlich umgesetzt werden können. Anhänger verbreiten sie zustimmend, Gegner kritisieren sie, Medien berichten und Faktenchecks greifen sie auf. Der Wahl-O-Mat kann Teil dieser Verstärkungsschleife werden, wenn er solche Frames als allgemeine politische Sachfragen übernimmt und zusätzlich institutionelle Reichweite erzeugt. Das ist kein Beleg für eine gezielte Strategie gegenüber dem Wahl-O-Mat, sondern ein grundsätzliches Problem politischer Kommunikationswirkung.</p>",
    )
    content = replace_section(
        content,
        "          <p>Vom Parteiframe zur institutionell verbreiteten Wahlfrage</p>",
        "          <h2>9. Rechte Propaganda? Die präzisere Kritik ist systemisch</h2>",
        '''          <p>Vom Parteiframe zur gesellschaftlichen Verstärkungsschleife</p>
          <div class="table-scroll"><table><thead><tr><th scope="col">Schritt</th><th scope="col">Mechanismus</th><th scope="col">Mögliches Wirkungspotenzial</th></tr></thead><tbody>
              <tr><td>1</td><td>Partei setzt einen Frame</td><td>Ein Programm definiert ein Problem und koppelt es an eine Forderung.</td></tr>
              <tr><td>2</td><td>Eigene Anhänger verbreiten ihn</td><td>Zustimmung erzeugt Reichweite, Wiederholung und Anschlusskommunikation.</td></tr>
              <tr><td>3</td><td>Politische Gegner reagieren</td><td>Kritik, Widerspruch und Empörung reproduzieren zunächst ebenfalls den gesetzten Problemrahmen.</td></tr>
              <tr><td>4</td><td>Medien und Faktenchecks greifen ihn auf</td><td>Einordnung und Widerlegung sind notwendig, erhöhen aber zugleich Sichtbarkeit und Wiederholung des Ausgangsframes.</td></tr>
              <tr><td>5</td><td>Der Frame wird gesellschaftlich verfügbar</td><td>Eine ursprünglich parteipolitische Problemdefinition wird zu einem bekannten Gegenstand öffentlicher Debatte.</td></tr>
              <tr><td>6</td><td>Institutionelle Angebote übernehmen ihn</td><td>Gelangt die Forderung etwa in den Wahl-O-Mat, erscheint sie als allgemeine politische Sachfrage und erhält zusätzliche Legitimität als Wahlthema.</td></tr>
              <tr><td>7</td><td>Positionierung erzeugt weitere Rückkopplung</td><td>Millionen Menschen beschäftigen sich mit dem Frame, beantworten ihn, diskutieren ihn und tragen ihn weiter.</td></tr>
          </tbody></table></div>
          <p>Der entscheidende Punkt ist deshalb größer als der Wahl-O-Mat. Eine Partei muss ein Thema nicht eigens für eine Wahlhilfe formulieren, damit diese später zu seiner Verbreitung beiträgt. Politische Programme setzen Problemdefinitionen, Begriffe und Konfliktlinien. Sind diese kommunikativ anschlussfähig, beginnt ihre Wirkung bereits lange vor einer möglichen Umsetzung.</p>
          <p>Dabei entsteht ein besonderes Paradox demokratischer Gegenrede: Auch Widerspruch kann einen Frame verbreiten. Wer eine Forderung kritisiert, widerlegt oder journalistisch einordnet, muss sie zunächst zum Gegenstand der Kommunikation machen. Das bedeutet ausdrücklich nicht, dass Kritik unterbleiben sollte. Entscheidend ist vielmehr, ob die Gegenrede lediglich den fremden Problemrahmen wiederholt oder einen eigenen, sachlich tragfähigeren Rahmen setzt.</p>
          <p>Der Wahl-O-Mat ist damit nicht die Ursache dieser Verstärkungsschleife. Er kann jedoch in dieselbe Falle geraten wie Medien, soziale Netzwerke und politische Gegner. Übernimmt er eine programmatische Forderung als eine seiner wenigen zentralen Wahlfragen, fügt er dem bereits zirkulierenden Frame eine weitere Wirkung hinzu: institutionelle Sichtbarkeit. Aus der Forderung einer Partei wird eine scheinbar allgemeine politische Frage, zu der sich jede Nutzerin und jeder Nutzer positionieren soll.</p>
''',
    )
    content = replace_section(
        content,
        "          <h2>10. Der nächste blinde Fleck: Ist der Wahl-O-Mat strategisch bespielbar?</h2>",
        "          <h2>11. Die wirkungsökonomische Korrektur: Erst Wirkungspfad klären, dann das Kreuz setzen</h2>",
        '''          <h2>10. Die größere Verstärkungsmaschine: Wenn politische Kommunikation den Frame selbst vervielfältigt</h2>
          <p>Die entscheidende strategische Frage liegt nicht darin, ob Parteien ihre Programme eigens für den Wahl-O-Mat formulieren. Dafür gibt es keinen Beleg - und für den beschriebenen Mechanismus wäre es auch gar nicht notwendig.</p>
          <p>Parteiprogramme erfüllen neben ihrer programmatischen Funktion immer auch eine kommunikative Funktion. Sie benennen Probleme, setzen Begriffe, schaffen Gegnerbilder, formulieren Konflikte und bieten Deutungsmuster an. Eine Forderung kann deshalb kommunikativ erfolgreich sein, selbst wenn ihre tatsächliche Umsetzung unwahrscheinlich ist oder außerhalb der unmittelbaren Zuständigkeit der betreffenden politischen Ebene liegt.</p>
          <p>Gerade darin liegt ein möglicher Unterschied zwischen politischer Umsetzbarkeit und kommunikativer Wirkung. Eine Forderung kann als konkrete Landespolitik nahezu bedeutungslos sein und als gesellschaftlicher Wirkstoff dennoch erhebliches Wirkungspotenzial besitzen.</p>
          <p>Das Beispiel russischer Energieimporte macht diese Trennung sichtbar. Eine Landesregierung Sachsen-Anhalts kann nicht selbst entscheiden, Deutschland wieder mit russischem Gas zu versorgen oder europäische Sanktionen aufzuheben. Sie kann politische Initiativen unterstützen und über den Bundesrat Einfluss nehmen. Als unmittelbares Regierungsversprechen einer Landtagswahl ist der Handlungsspielraum deshalb begrenzt. Als Kommunikationsgegenstand ist die Forderung dagegen hoch anschlussfähig: Sie verbindet Energiepreise, Russlandpolitik, Sanktionen, Krieg, wirtschaftliche Unsicherheit und Kritik an der Bundesregierung in einem einzigen Frame.</p>
          <p>Der politische Effekt einer solchen Forderung muss deshalb nicht erst darin bestehen, dass sie umgesetzt wird. Ein erheblicher Teil ihrer Wirkung kann bereits entstehen, wenn über sie gesprochen wird.</p>
          <p>Anhänger greifen sie zustimmend auf. Kritiker erklären, warum sie falsch oder gefährlich sei. Medien berichten über den Konflikt. Talkshows diskutieren ihn. Faktenchecks untersuchen die Behauptungen. Beiträge in sozialen Netzwerken reagieren darauf. Jede dieser Kommunikationsformen bewertet den Inhalt anders - aber alle erhöhen zunächst seine gesellschaftliche Präsenz.</p>
          <p>Wirkungsökonomisch ist dabei wichtig, zwischen Wirkung und Wirkungspotenzial zu unterscheiden. Die bloße Wiederholung eines Frames beweist noch keine Einstellungsänderung. Sie schafft aber einen Resonanzraum: Das Thema wird verfügbar, anschlussfähig und als Gegenstand politischer Auseinandersetzung etabliert.</p>
          <p>Der Wahl-O-Mat ist in dieser Perspektive nicht der Erfinder und auch nicht zwangsläufig der wichtigste Verstärker. Er ist ein weiterer Knoten in einem viel größeren Wirkungsnetz. Seine besondere Bedeutung liegt darin, dass er dem Frame institutionelle Neutralität und enorme Reichweite verleihen kann. Die Forderung erscheint nicht mehr als Aussage einer bestimmten Partei, sondern als eine der Fragen, die offensichtlich zu dieser Wahl gehören.</p>
          <p>Damit verändert sich auch die Forschungsfrage. Sie lautet nicht primär:</p>
          <p>„Schreiben Parteien ihr Programm strategisch für den Wahl-O-Mat?“</p>
          <p>Sondern:</p>
          <p>„Wie verhindern demokratische Informationssysteme, Medien und politische Gegenrede, dass sie durch ihre notwendige Auseinandersetzung mit propagandistisch wirksamen Frames deren Agenda-Wirkung selbst unnötig verstärken?“</p>
          <p>Diese Frage betrifft nicht nur den Wahl-O-Mat und nicht nur eine einzelne Partei. Sie betrifft die gesamte demokratische Informationsordnung.</p>
          <p>Für den Wahl-O-Mat folgt daraus jedoch eine besondere Verantwortung. Gerade weil er nur eine begrenzte Zahl von Thesen auswählt, ist jede Aufnahme zugleich eine Entscheidung über Aufmerksamkeit. Eine Forderung mit geringer unmittelbarer Wahlrelevanz sollte deshalb nicht allein deshalb zur zentralen Wahlfrage werden, weil sie stark polarisiert oder Parteien besonders gut voneinander unterscheidet.</p>
          <p>Die entscheidende Robustheitsfrage lautet somit nicht, ob ein Wahl-O-Mat völlig frei von Frames sein kann. Das kann kein politisches Informationsangebot. Sie lautet vielmehr, ob seine Redaktion systematisch prüft, welche zusätzliche gesellschaftliche Relevanz sie einem Frame durch seine Auswahl verleiht - und ob diese Relevanz zur tatsächlichen Entscheidungskompetenz und Bedeutung für die konkrete Wahl passt.</p>
''',
    )
    content = replace_once(
        content,
        "              <tr><td>Robustheitstest gegen strategisches Agenda-Setting</td><td>Vor Veröffentlichung wird geprüft, ob einzelne Frames durch die Auswahl unverhältnismäßig vervielfältigt werden.</td><td>Schutz gegen strategische Bespielbarkeit.</td></tr>",
        "              <tr><td>Frame- und Relevanzprüfung</td><td>Vor Veröffentlichung wird geprüft, ob die Aufnahme einer These einem parteipolitisch gesetzten Frame unverhältnismäßige zusätzliche Aufmerksamkeit verleiht - insbesondere bei geringer unmittelbarer Zuständigkeit für die konkrete Wahl.</td><td>Weniger unbeabsichtigte Verstärkung politischer Propaganda- und Agenda-Effekte.</td></tr>",
    )
    content = replace_once(
        content,
        "          <p>Und schließlich ist der Wahl-O-Mat selbst ein politischer Kommunikationsraum. Welche Fragen er auswählt, beeinflusst, worüber Nutzer:innen nachdenken und wozu sie sich positionieren. Forschung zu VAAs zeigt, dass Statement-Auswahl und Framing den Output und Einstellungen beeinflussen können. Bei einem Instrument mit enormer Reichweite ist diese Eigenwirkung kein Nebenthema.</p>\n          <p>Die entscheidende Frage lautet deshalb nicht nur: „Normalisiert der Wahl-O-Mat bestimmte Parteien?“ Sie lautet tiefer: „Welche Problemdefinitionen, Frames und Narrative macht er durch seine eigene Auswahl institutionell sichtbar – und ist diese Architektur gegenüber strategischem Agenda-Setting robust genug?“</p>",
        "          <p>Und schließlich steht der Wahl-O-Mat nicht außerhalb der politischen Kommunikation. Parteiprogramme setzen Frames, Anhänger verbreiten sie, Gegner kritisieren sie, Medien und Faktenchecks greifen sie auf. Der Wahl-O-Mat kann Teil dieser gesellschaftlichen Verstärkungsschleife werden. Welche Forderungen er aus diesem bereits bestehenden Diskurs auswählt, beeinflusst zusätzlich, worüber Nutzer:innen nachdenken und wozu sie sich positionieren. Bei einem Instrument mit enormer Reichweite ist diese institutionelle Eigenwirkung kein Nebenthema.</p>\n          <p>Die entscheidende Frage lautet deshalb nicht nur: „Normalisiert der Wahl-O-Mat bestimmte Parteien?“ Sie lautet tiefer: „Welche Problemdefinitionen, Frames und Narrative erhält er durch seine Auswahl zusätzlich am Leben, welche verleiht er institutionelle Relevanz - und entsprechen diese Themen tatsächlich der Bedeutung und Entscheidungskompetenz der konkreten Wahl?“ Der Wahl-O-Mat ist damit nicht die Propagandamaschine selbst. Er kann aber Teil einer größeren gesellschaftlichen Verstärkungsmaschine werden.</p>",
    )
    return replace_once(
        content,
        "          <p>Die Auswertung der 38 Thesen und die Kategorien „klar“, „bedingt“ und „nicht entscheidungsreif“ sind eine eigenständige wirkungsökonomische Analyse. Aussagen zu Agenda-Setting, Framing und strategischer Bespielbarkeit sind als methodische Risiken bzw. Wirkungspotenziale formuliert. Sie sind kein Nachweis dafür, dass bei einer konkreten Nutzerin oder einem konkreten Nutzer eine bestimmte Wirkung eingetreten ist oder dass eine Partei eine bestimmte Forderung nachweislich mit dem Ziel formuliert hat, den Wahl-O-Mat zu beeinflussen.</p>",
        "          <p>Die Auswertung der 38 Thesen und die Kategorien „klar“, „bedingt“ und „nicht entscheidungsreif“ sind eine eigenständige wirkungsökonomische Analyse. Aussagen zu Agenda-Setting, Framing und gesellschaftlichen Verstärkungsdynamiken sind als methodische Risiken beziehungsweise Wirkungspotenziale formuliert. Sie sind kein Nachweis dafür, dass bei einer konkreten Nutzerin oder einem konkreten Nutzer eine bestimmte Wirkung eingetreten ist. Ebenso wird nicht behauptet, dass eine Partei einzelne Programmpunkte nachweislich mit dem Ziel formuliert hat, den Wahl-O-Mat zu beeinflussen. Untersucht wird vielmehr, wie politische Frames unabhängig von einer solchen spezifischen Absicht durch Anhänger, Gegenrede, Medien und institutionelle Informationsangebote zusätzliche Reichweite und gesellschaftliche Anschlussfähigkeit erhalten können.</p>",
    )


def shell() -> tuple[str, str]:
    source = (ROOT / "blog" / "wahl-o-mat-sachsen-anhalt-2026.html").read_text(encoding="utf-8")
    header_start = source.index('    <header class="site-header"')
    main_start = source.index("    <main", header_start)
    main_end = source.rindex("</main>")
    return source[header_start:main_start], source[main_end + len("</main>"):]


def write_article() -> None:
    header, footer = shell()
    tags = ["Wahl-O-Mat", "Sachsen-Anhalt", "politische Bildung", "Methodenkritik", "Agenda-Setting", "Framing", "Wirkungspotenzial", "Wirkpfad", "Demokratie", "Verfassung"]
    tags_html = "".join(f'<meta property="article:tag" content="{esc(tag)}">' for tag in tags)
    schema = {
        "@context": "https://schema.org", "@type": "Article", "headline": TITLE,
        "alternativeHeadline": SUBTITLE, "description": DESCRIPTION,
        "url": f"https://wirkungsoekonomie.de/blog/{SLUG}.html",
        "image": f"https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}",
        "datePublished": DATE_ISO, "dateModified": MODIFIED_ISO, "inLanguage": "de",
        "author": {"@type": "Person", "name": "Natalie Weber", "url": "https://wirkungsoekonomie.de/natalie-weber.html"},
        "publisher": {"@type": "Organization", "name": "Wirkungsökonomie", "url": "https://wirkungsoekonomie.de"},
        "articleSection": "Wirkung und Demokratie", "keywords": tags,
    }
    ARTICLE.write_text(f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITLE)} - Journal der Wirkungsökonomie</title><meta name="description" content="{esc(DESCRIPTION)}"><meta name="search_title" content="{esc(TITLE)}"><meta name="search_description" content="{esc(DESCRIPTION)}"><meta name="search_section" content="Journal"><meta name="search_type" content="Journalartikel"><meta name="search_index_kind" content="journal"><meta name="search_tags" content="{esc(', '.join(tags))}"><link rel="canonical" href="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:type" content="article"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie"><meta property="og:title" content="{esc(TITLE)}"><meta property="og:description" content="{esc(DESCRIPTION)}"><meta property="og:url" content="https://wirkungsoekonomie.de/blog/{SLUG}.html"><meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="og:image:alt" content="{esc(IMAGE_ALT)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(TITLE)}"><meta name="twitter:description" content="{esc(DESCRIPTION)}"><meta name="twitter:image" content="https://wirkungsoekonomie.de/assets/img/blog/{IMAGE}"><meta property="article:published_time" content="{DATE_ISO}"><meta property="article:modified_time" content="{MODIFIED_ISO}"><meta property="article:section" content="Wirkung und Demokratie">{tags_html}<link rel="alternate" type="application/rss+xml" title="Journal der Wirkungsökonomie" href="https://wirkungsoekonomie.de/feeds/journal.xml"><link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/style.css?v=20260612-mobile-table-fix"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
{header}    <main data-pagefind-body><article class="hero"><div class="hero-copy"><p class="hero-kicker">Wirkung und Demokratie · {DATE} · 23 Min.</p><h1 class="hero-title">{esc(TITLE)}</h1><p class="hero-subtitle">{esc(SUBTITLE)}</p><p class="journal-pdf-download-row no-print" data-search-exclude><a class="btn btn-secondary journal-pdf-download" data-journal-pdf-download href="../assets/pdf/journal/{SLUG}.pdf" download>PDF herunterladen</a></p><p class="meta">Von Natalie Weber · Begründerin der Wirkungsökonomie</p></div><figure class="hero-system-visual article-visual"><img src="../assets/img/blog/{IMAGE}" width="1672" height="941" alt="{esc(IMAGE_ALT)}" decoding="async" fetchpriority="high"></figure></article><section class="article-page"><div class="article-body"><div class="status-note"><strong>Kernbefund:</strong> Von 38 Thesen sind nach dem verwendeten Prüfraster nur 10 klar entscheidungsreif. Bei 28 müssen Nutzer:innen relevante Bedingungen ergänzen; 15 sind so offen, dass plausible Ausgestaltungen zu gegensätzlichen Bewertungen führen können. Diese Analyse ist keine Wahlempfehlung und unterstellt weder Parteien noch der Wahl-O-Mat-Redaktion eine unbelegte Absicht.</div>
{render_content()}
          <p><strong>Vollständiger Folgencheck:</strong> Die wirkungsökonomische Einordnung aller 38 Thesen findet sich im <a class="text-link" href="wahl-o-mat-sachsen-anhalt-2026.html">Wahl-O-Mat Sachsen-Anhalt 2026</a>.</p><p><strong>Weiterlesen:</strong> <a class="text-link" href="../begriffe/wirkungspotenzial/">Wirkungspotenzial</a>, <a class="text-link" href="../begriffe/wirkpfad/">Wirkpfad</a>, <a class="text-link" href="../begriffe/wirkungsrisiko/">Wirkungsrisiko</a> und <a class="text-link" href="../begriffe/positive-netto-wirkung/">positive Netto-Wirkung</a>.</p><p><a class="text-link" href="../blog.html">Zurück zum Journal</a></p></div></section></main>
{footer}''', encoding="utf-8")


if __name__ == "__main__":
    if not SOURCE_DOCX.is_file() or not TITLE_IMAGE.is_file():
        raise FileNotFoundError("SOURCE_DOCX und TITLE_IMAGE müssen auf vorhandene Dateien zeigen.")
    copy_asset()
    write_article()

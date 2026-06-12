#!/usr/bin/env python3
"""Generate the /fuer/ target-group pages from the WÖk content master v1.0."""

from __future__ import annotations

import html
from pathlib import Path

import sync_layout


ROOT = Path(__file__).resolve().parents[1]
FUER = ROOT / "fuer"
VERSION = "20260522-zielgruppen-master-v1"

COMMON_SOURCES = [
    "Führender Begriffsleitfaden der Wirkungsökonomie v1.0",
    "Natalie Weber: Die neue Ordnung des Wohlstands, aktueller Buchstand 2026",
    "Systemmodell der Wirkungsökonomie",
    "Nachhaltigkeit ist keine Strategie. Sie ist eine Systemarchitektur",
    "WStG / WUStG / technische Leitlinien",
]

SENSITIVE_TEXT = (
    "Diese Seite erklärt die aktuelle Systematik der Wirkungsökonomie. Sie ersetzt keine Rechts-, Steuer-, "
    "Anlage-, Leistungs- oder Politikberatung. Konkrete Zahlen und gesetzliche Ausgestaltungen gelten nur, "
    "wenn sie ausdrücklich als freigegebener Modellstand gekennzeichnet sind."
)

WHY_NOT_HEADINGS = {
    "unternehmen.html": "Warum ESG und Reporting nicht reichen",
    "politik.html": "Warum Reparaturpolitik und Ressortlogik nicht reichen",
    "buergerinnen.html": "Warum moralische Appelle nicht reichen",
    "mieter.html": "Warum Mietrecht, Förderung und Sanierungspflichten allein nicht reichen",
    "investoren.html": "Warum ESG-Ratings und Renditelogik nicht reichen",
    "kommunen.html": "Warum Ressortsilos und Projektförderung nicht reichen",
    "journalismus.html": "Warum Faktencheck allein nicht reicht",
    "akademie.html": "Warum Wissen allein nicht reicht",
    "wissenschaft-forschung.html": "Warum Publikationen und Drittmittel nicht reichen",
    "gesundheit.html": "Warum Reparaturmedizin allein nicht reicht",
    "rente.html": "Warum Beitragssätze, Lebensarbeitszeit und klassische Kapitaldeckung nicht reichen",
    "wirkungseinkommen.html": "Warum Erwerbsarbeit als alleinige Einkommensbasis nicht reicht",
}

WHY_NOT_COPY = {
    "unternehmen.html": [
        "ESG und Reporting liefern Daten und Anschluss an Regulierung. Sie reichen aber nicht, wenn sie nur Berichtspflichten bleiben.",
        "Wirkungsorientiertes Management verändert die Entscheidung selbst: Führung, Einkauf, Kapital, Innovation, Kultur und Lieferketten werden nach Wirkung rückgekoppelt.",
    ],
    "politik.html": [
        "Reparaturpolitik setzt spät an: bei Schäden, Krisen, Sonderregeln und Haushaltslücken. Ressortlogik zerlegt Probleme, die im Leben zusammenhängen.",
        "Die WÖk setzt früher an: Wirkung wird in Recht, Haushalt, Steuer, Beschaffung und Evaluation zurückgeführt.",
    ],
    "buergerinnen.html": [
        "Moralische Appelle überfordern Menschen, wenn Preise, Werbung, Plattformen und Politik falsche Signale senden.",
        "Die WÖk verlagert Verantwortung zurück in Systemsignale: Produkte, Preise, Daten, Medien und Politik werden verständlicher.",
    ],
    "mieter.html": [
        "Mietrecht, Förderung und Sanierungspflichten greifen jeweils nur einen Ausschnitt. Wohnen wirkt aber zugleich auf Bezahlbarkeit, Gesundheit, Energie, Quartier und Demokratie.",
        "Die WÖk macht diese Mehrfachwirkung sichtbar, damit Sanierung, Neubau, Boden, Miete und Quartier zusammen bewertet werden.",
    ],
    "investoren.html": [
        "ESG-Ratings und Renditelogik können Risiken anzeigen, ersetzen aber keine Prüfung der Richtung, die Kapital verstärkt.",
        "Die WÖk liest Kapital als Wirkungskraft: Rendite ohne Wirkung wird zum Zukunftsrisiko, Kapitalwirkung wird zur Resilienzfrage.",
    ],
    "kommunen.html": [
        "Ressortsilos und Projektförderung teilen lokale Wirklichkeit in Zuständigkeiten auf. Hitze, Wohnen, Pflege, Mobilität, Bildung und Beteiligung wirken aber zusammen.",
        "Die WÖk verbindet kommunale Daten, Haushalte und Beschaffung zu lokaler Wirkungssteuerung.",
    ],
    "journalismus.html": [
        "Faktencheck prüft, ob Aussagen stimmen. Er zeigt aber nicht automatisch, welche Frames, Resonanzräume und Wirkungspotenziale entstehen.",
        "Die WÖk ergänzt Faktenprüfung um Wirkungsanalyse: Sprache, Auswahl, Wiederholung, Reichweite und Plattformlogik werden demokratisch eingeordnet.",
    ],
    "akademie.html": [
        "Wissen allein verändert keine Steuerungslogik. Menschen brauchen Wirkungskompetenz: Begriffe, Daten, Wirkpfade, Bewertung und Rückkopplung.",
        "Die Akademie macht aus Information ein lernbares Verfahren für Entscheidungen.",
    ],
    "wissenschaft-forschung.html": [
        "Publikationen, Zitationen und Drittmittel zeigen wissenschaftliche Aktivität, aber nicht automatisch Korrekturfähigkeit, Datenqualität oder gesellschaftliche Wirkung.",
        "Die WÖk macht Wissenschaft als Wirkungsinfrastruktur sichtbar, ohne Forschungsfreiheit auf Nützlichkeit zu verkürzen.",
    ],
    "gesundheit.html": [
        "Reparaturmedizin ist unverzichtbar, wenn Menschen krank sind. Sie reicht aber nicht, wenn Wohnumfeld, Arbeit, Klima, Ernährung, Einsamkeit und Pflege Krankheit erzeugen.",
        "Die WÖk macht Gesundheit zur Systemwirkung und Prävention zur rückkoppelbaren Wirkleistung.",
    ],
    "rente.html": [
        "Beitragssätze, Lebensarbeitszeit und klassische Kapitaldeckung verschieben Stellschrauben im alten System. Sie messen weiter vor allem Erwerbseinkommen, Beitragsjahre und Kapitalertrag.",
        "Die Wirkungsrente erweitert den Maßstab: von Erwerbsbiografie zu Wirkungsbiografie, mit Basisrente, Wirkungsdividende und Wirkungsfonds als Modellbausteinen.",
    ],
    "wirkungseinkommen.html": [
        "Erwerbsarbeit bleibt wichtig. Sie reicht aber nicht mehr als alleinige Einkommensbasis, wenn KI, Robotik und Plattformen Produktivität erzeugen, ohne dass menschliche Arbeitszeit proportional steigt.",
        "Das Wirkungseinkommen koppelt Produktivität gesellschaftlich zurück: Grunddividende, Markteinkommen und Wirkungsbonus bilden eine Modellarchitektur für Teilhabe und Wirkleistung.",
    ],
}


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def paragraphs(items: list[str]) -> str:
    return "".join(f"<p>{e(item)}</p>" for item in items)


def bullet_list(items: list[str]) -> str:
    return '<ul class="content-list">' + "".join(f"<li>{e(item)}</li>" for item in items) + "</ul>"


def cards(items: list[dict[str, str]], class_name: str = "card-grid") -> str:
    return f'<div class="{class_name}">' + "".join(
        f"""<article class="card">
          <h3 class="card-title">{e(item["title"])}</h3>
          <p class="card-text">{e(item["text"])}</p>
        </article>"""
        for item in items
    ) + "</div>"


def path(items: list[str]) -> str:
    return '<ol class="scanner-path master-path">' + "".join(f"<li>{e(item)}</li>" for item in items) + "</ol>"


def buttons(items: list[tuple[str, str]]) -> str:
    return '<div class="button-row">' + "".join(
        f'<a class="btn {"btn-primary" if index == 0 else "btn-secondary"}" href="{e(href)}">{e(label)}</a>'
        for index, (label, href) in enumerate(items)
    ) + "</div>"


def source_anchor(label: str, href: str) -> str:
    return f'<a href="{e(href)}">{e(label)}</a>'


SOURCE_LINKS: dict[str, str] = {
    "Führender Begriffsleitfaden der Wirkungsökonomie v1.0": source_anchor("Führender Begriffsleitfaden der Wirkungsökonomie v1.0", "../begriffe/"),
    "Führender Begriffsleitfaden": source_anchor("Führender Begriffsleitfaden", "../begriffe/"),
    "Natalie Weber: Die neue Ordnung des Wohlstands, aktueller Buchstand 2026": source_anchor("Natalie Weber: Die neue Ordnung des Wohlstands, aktueller Buchstand 2026", "../referenz/"),
    "Systemmodell der Wirkungsökonomie": source_anchor("Systemmodell der Wirkungsökonomie", "../dokumente/systemmodell-der-wirkungsoekonomie/"),
    "Nachhaltigkeit ist keine Strategie. Sie ist eine Systemarchitektur": source_anchor("Nachhaltigkeit ist keine Strategie. Sie ist eine Systemarchitektur", "../referenz/kapitel-006-nachhaltigkeit-ist-keine-strategie/"),
    "WStG / WUStG / technische Leitlinien": f'{source_anchor("WStG", "../dokumente/wstg-oktober-2025/")} / {source_anchor("WUStG / technische Leitlinien", "../dokumente/technische-leitlinien-wustg-v2/")}',
    "Die neue Ordnung des Wohlstands, Kapitel zu Öffentlichkeit, Plattformlogik, Framing, Sprache, Desinformation, Creator-Verantwortung und Diskurskultur": source_anchor("Die neue Ordnung des Wohlstands, Kapitel zu Öffentlichkeit, Plattformlogik, Framing, Sprache, Desinformation, Creator-Verantwortung und Diskurskultur", "../referenz/teil-12-medien-kommunikation-und-oeffentlichkeit/"),
    "Leitbild Mensch, Planet und Demokratie: Medien als demokratische Infrastruktur": source_anchor("Leitbild Mensch, Planet und Demokratie: Medien als demokratische Infrastruktur", "../referenz/teil-04-mensch-planet-und-demokratie/"),
    "Die neue Ordnung des Wohlstands, Teil VII: Unternehmen, Management und Wertschöpfung": source_anchor("Die neue Ordnung des Wohlstands, Teil VII: Unternehmen, Management und Wertschöpfung", "../referenz/teil-07-unternehmen-management-und-wertschoepfung/"),
    "Kapitel Unternehmen als Wirkungssysteme, Wirkungscontrolling, Organisation/Kultur/Verantwortung, Lieferkettensteuerung und Unternehmensrisiko": "Kapitel "
    + ", ".join([
        source_anchor("Unternehmen als Wirkungssysteme", "../referenz/kapitel-042-unternehmen-als-wirkungssysteme/"),
        source_anchor("Wirkungscontrolling", "../referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"),
        source_anchor("Organisation/Kultur/Verantwortung", "../referenz/kapitel-045-organisation-kultur-und-verantwortung/"),
        source_anchor("Lieferkettensteuerung", "../referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/"),
    ])
    + " und "
    + source_anchor("Unternehmensrisiko", "../referenz/kapitel-047-unternehmensrisiko-und-transformation/"),
    "Systemmodell der WÖk: Wirtschaft als Wirkungssystem, Kapital als Wirkungskraft": source_anchor("Systemmodell der WÖk: Wirtschaft als Wirkungssystem, Kapital als Wirkungskraft", "../dokumente/systemmodell-der-wirkungsoekonomie/"),
    "Die neue Ordnung des Wohlstands, Teile VI und X: Recht, Staat, Institutionen, Wirkungshaushalt, Wirkungsrat, Politik als Wirkungsraum": f'{source_anchor("Die neue Ordnung des Wohlstands, Teil VI: Recht, Staat und Institutionen", "../referenz/teil-06-recht-staat-und-institutionen/")} / {source_anchor("Teil X: Staat, Politik und Demokratie", "../referenz/teil-10-staat-politik-und-demokratie/")}',
    "WStG": source_anchor("WStG", "../dokumente/wstg-oktober-2025/"),
    "Die neue Ordnung des Wohlstands, Kapitel zu Konsumwirkung, Verbraucherinformation, Alltag, Bürger:innenwirkung, Wirkungskompetenz und Öffentlichkeit": source_anchor("Die neue Ordnung des Wohlstands, Kapitel zu Konsumwirkung, Verbraucherinformation, Alltag, Bürger:innenwirkung, Wirkungskompetenz und Öffentlichkeit", "../referenz/kapitel-052-konsumwirkung-und-verbraucherinformation/"),
    "Produktpapier und Apfelbeispiel": f'{source_anchor("Produktpapier", "../dokumente/wp-produkte/")} und {source_anchor("Apfelbeispiel", "../dokumente/beispiel-apfel-wirkungssteuer-bonusregel/")}',
    "Die neue Ordnung des Wohlstands, Kapitel Wohnen": source_anchor("Die neue Ordnung des Wohlstands, Kapitel Wohnen", "../referenz/kapitel-070-wohnen/"),
    "Working-Paper Wohnungsmarkt": source_anchor("Working-Paper Wohnungsmarkt", "../dokumente/wp-wohnungsmarkt/"),
    "Systemmodell: lebenswerte Räume, WIX-Wohn, Sozialraumprofile, kommunale Resilienz": source_anchor("Systemmodell: lebenswerte Räume, WIX-Wohn, Sozialraumprofile, kommunale Resilienz", "../wirkungsfelder/wohnen-stadt/"),
    "Die neue Ordnung des Wohlstands, Kapitel zu Kapital als Werkzeug, Kapitalwirkung, T-SROI, Kapitalmärkte und Fonds": source_anchor("Die neue Ordnung des Wohlstands, Kapitel zu Kapital als Werkzeug, Kapitalwirkung, T-SROI, Kapitalmärkte und Fonds", "../referenz/teil-09-volkswirtschaft-arbeit-kapital-und-wohlstand/"),
    "Whitepaper T-SROI": source_anchor("Whitepaper T-SROI", "../dokumente/whitepaper-t-sroi/"),
    "Systemmodell: Kapital als Wirkungskraft": source_anchor("Systemmodell: Kapital als Wirkungskraft", "../dokumente/systemmodell-der-wirkungsoekonomie/"),
    "Die neue Ordnung des Wohlstands, Kapitel zu Kommunen, Wirkungshaushalt, Wohnen, Gesundheit, Pflege, Bildung, Resilienzstaat": source_anchor("Die neue Ordnung des Wohlstands, Kapitel zu Kommunen, Wirkungshaushalt, Wohnen, Gesundheit, Pflege, Bildung, Resilienzstaat", "../referenz/teil-10-staat-politik-und-demokratie/"),
    "Systemmodell: lebenswerte Räume, Urban Impact Planning, kommunale Wirkungsbudgets": source_anchor("Systemmodell: lebenswerte Räume, Urban Impact Planning, kommunale Wirkungsbudgets", "../wirkungsfelder/wohnen-stadt/"),
    "Die neue Ordnung des Wohlstands, Kapitel Bildung, Wirkungskompetenz, Wissenschaft, Akademie-Logik": source_anchor("Die neue Ordnung des Wohlstands, Kapitel Bildung, Wirkungskompetenz, Wissenschaft, Akademie-Logik", "../referenz/kapitel-067-bildung/"),
    "Systemmodell: Fach Zukunft, Wirkungskompetenz-Akademie, Bildungs- und Wissenskompetenz": source_anchor("Systemmodell: Fach Zukunft, Wirkungskompetenz-Akademie, Bildungs- und Wissenskompetenz", "../begriffe/wirkungskompetenz/"),
    "Die neue Ordnung des Wohlstands, Teil XIV: Wissenschaft als Wirkungsinfrastruktur": source_anchor("Die neue Ordnung des Wohlstands, Teil XIV: Wissenschaft als Wirkungsinfrastruktur", "../referenz/teil-14-wissen-wissenschaft-forschung-und-rechtsprechung/"),
    "Grundlagenpapier zu Auswirkungen auf Wissenschaft": source_anchor("Grundlagenpapier zu Auswirkungen auf Wissenschaft", "../wirkungsfelder/wissenschaft-innovation-digitalisierung/"),
    "Die neue Ordnung des Wohlstands, Kapitel Gesundheit und Pflege": f'{source_anchor("Die neue Ordnung des Wohlstands, Kapitel Gesundheit", "../referenz/kapitel-068-gesundheit/")} und {source_anchor("Pflege", "../referenz/kapitel-069-pflege/")}',
    "Systemmodell der WÖk: Gesundheit, Pflege & Leben; Prävention statt Reparatur; One Health; psychische Gesundheit; kommunale Gesundheitsräume": source_anchor("Systemmodell der WÖk: Gesundheit, Pflege & Leben; Prävention statt Reparatur; One Health; psychische Gesundheit; kommunale Gesundheitsräume", "../wirkungsfelder/gesundheit-pflege/"),
    "Die neue Ordnung des Wohlstands, Kapitel Arbeit, Automatisierung und Maschinenleistung, Wirkungseinkommen, Kapitalmärkte und Fonds": source_anchor("Die neue Ordnung des Wohlstands, Kapitel Arbeit, Automatisierung und Maschinenleistung, Wirkungseinkommen, Kapitalmärkte und Fonds", "../referenz/teil-09-volkswirtschaft-arbeit-kapital-und-wohlstand/"),
    "Arbeitspapier Wirkungseinkommensteuer": source_anchor("Arbeitspapier Wirkungseinkommensteuer", "../wirkungsfelder/arbeit-einkommen/wirkungseinkommensteuer/"),
    "Systemmodell: Wirkungsfonds, Automatisierungsdividende, Wirkungsdividende": source_anchor("Systemmodell: Wirkungsfonds, Automatisierungsdividende, Wirkungsdividende", "../wirkungsfelder/arbeit-einkommen/wirkungsfonds-dividende/"),
    "Die neue Ordnung des Wohlstands, Kapitel Wirkungsrente, Wirkungseinkommen, Kapitalmärkte und Fonds": source_anchor("Die neue Ordnung des Wohlstands, Kapitel Wirkungsrente, Wirkungseinkommen, Kapitalmärkte und Fonds", "../referenz/teil-09-volkswirtschaft-arbeit-kapital-und-wohlstand/"),
    "WP_Rente": source_anchor("WP_Rente", "../wirkungsfelder/rente-soziale-sicherung/"),
}


def source_item(item: str) -> str:
    return SOURCE_LINKS.get(item, e(item))


VISUAL_ASSIGNMENTS: dict[str, list[dict[str, str]]] = {
    "journalismus": [{
        "file": "../assets/visuals/flows/woek_journalismus_faktencheck_wirkungsanalyse.svg",
        "mobile": "../assets/visuals/flows/woek_journalismus_faktencheck_wirkungsanalyse_mobile.svg",
        "alt": "Flussgrafik Faktencheck plus Wirkungsanalyse mit Frame, Resonanzraum, Wirkungspotenzial, Vertrauen, Polarisierung und Demokratie.",
        "caption": "Journalismus gewinnt eine zweite Ebene: nicht nur Richtigkeit, sondern Wirkungspotenzial."
    }],
    "unternehmen": [{
        "file": "../assets/visuals/explainers/woek_unternehmen_wirkungssystem.svg",
        "mobile": "../assets/visuals/explainers/woek_unternehmen_wirkungssystem_mobile.svg",
        "alt": "Grafik Unternehmen als Wirkungssystem mit Führung, Kultur, Entscheidungen, Produkten, Lieferketten, Kapital, Kommunikation und Innovation.",
        "caption": "Unternehmen werden nicht als ESG-Berichtseinheiten gelesen, sondern als Wirkungssysteme."
    }],
    "politik": [{
        "file": "../assets/visuals/explainers/woek_politik_reparaturstaat_wirkungsarchitektur.svg",
        "mobile": "../assets/visuals/explainers/woek_politik_reparaturstaat_wirkungsarchitektur_mobile.svg",
        "alt": "Grafik vom Reparaturstaat zur Wirkungsarchitektur mit falschen Preisen, Schäden, Bürokratie, Wirkungsprüfung, Wirkungshaushalt, Wirkungssteuer und Rückkopplung.",
        "caption": "Die Grafik zeigt Politik als Rückkopplungsarchitektur statt als späte Reparaturmaschine."
    }],
    "buergerinnen": [{
        "file": "../assets/visuals/explainers/woek_buergerinnen_bessere_signale.svg",
        "mobile": "../assets/visuals/explainers/woek_buergerinnen_bessere_signale_mobile.svg",
        "alt": "Grafik von moralischer Überforderung zu besseren Signalen für Bürgerinnen und Bürger.",
        "caption": "Die Wirkungsökonomie entlastet Bürger:innen von moralischer Einzelüberforderung."
    }],
    "mieter": [{
        "file": "../assets/visuals/explainers/woek_wohnen_wirkungsraum.svg",
        "mobile": "../assets/visuals/explainers/woek_wohnen_wirkungsraum_mobile.svg",
        "alt": "Grafik Wohnen als Wirkungsraum mit Bezahlbarkeit, Gesundheit, Energie, Quartier, Teilhabe, Vertrauen und Demokratie.",
        "caption": "Wohnraum wird als Wirkungsraum für Mensch, Planet und Demokratie lesbar."
    }],
    "investoren": [{
        "file": "../assets/visuals/explainers/woek_kapitalwirkung_investoren.svg",
        "mobile": "../assets/visuals/explainers/woek_kapitalwirkung_investoren_mobile.svg",
        "alt": "Kapitalwirkungsgrafik für Investorinnen und Investoren mit Rendite, Risiko, Resilienz, T-SROI und positiver Netto-Wirkung.",
        "caption": "Kapital wird als Verstärker von Richtung und als Rückkopplungssystem verstanden."
    }],
    "kommunen": [{
        "file": "../assets/visuals/explainers/woek_kommunen_lokale_wirkungsraeume.svg",
        "mobile": "../assets/visuals/explainers/woek_kommunen_lokale_wirkungsraeume_mobile.svg",
        "alt": "Grafik Kommunen als lokale Wirkungsräume mit Hitze, Wasser, Wohnen, Mobilität, Bildung, Pflege, Begegnung und Wirkungshaushalt.",
        "caption": "Kommunale Entscheidungen erzeugen Mehrfachwirkung in realen Lebensräumen."
    }],
    "akademie": [{
        "file": "../assets/visuals/explainers/woek_akademie_lernpfad.svg",
        "mobile": "../assets/visuals/explainers/woek_akademie_lernpfad_mobile.svg",
        "alt": "Lernpfad der WÖk-Akademie von Verstehen über Bewerten und Zurückkoppeln bis Anwenden und Umsetzen.",
        "caption": "Die Akademie übersetzt die WÖk in einen systemischen Lernpfad."
    }],
    "wissenschaft-forschung": [{
        "file": "../assets/visuals/explainers/woek_wissenschaft_forschung.svg",
        "mobile": "../assets/visuals/explainers/woek_wissenschaft_forschung_mobile.svg",
        "alt": "Grafik Wissenschaft und Forschung als Wirkungsinfrastruktur mit Theorie, Daten, Modellen, Validierung, Anwendung und Transfer.",
        "caption": "Wissenschaft ist das methodische Rückgrat lernfähiger Wirkungssteuerung."
    }],
    "gesundheit": [{
        "file": "../assets/visuals/explainers/woek_gesundheit_wirkungssystem.svg",
        "mobile": "../assets/visuals/explainers/woek_gesundheit_wirkungssystem_mobile.svg",
        "alt": "Grafik Gesundheit als Wirkungssystem mit Prävention, Pflege, Psyche, Wohnumfeld, Ernährung, Arbeit, Klima und sozialen Beziehungen.",
        "caption": "Gesundheit wird als Systemleistung verstanden, nicht nur als Reparatur von Krankheit."
    }],
    "wirkungseinkommen": [
        {
            "file": "../assets/visuals/explainers/woek_wirkungseinkommen_drei_ebenen.svg",
            "mobile": "../assets/visuals/explainers/woek_wirkungseinkommen_drei_ebenen_mobile.svg",
            "alt": "Grafik Wirkungseinkommen mit Grunddividende, Markteinkommen und Wirkungsbonus.",
            "caption": "Das Wirkungseinkommen denkt Einkommen als Architektur aus Sockel, Markt und anerkannter Wirkleistung."
        },
        {
            "file": "../assets/visuals/explainers/woek_wirkungseinkommen_finanzierungsstack.svg",
            "mobile": "../assets/visuals/explainers/woek_wirkungseinkommen_finanzierungsstack_mobile.svg",
            "alt": "Finanzierungsstack des Wirkungseinkommens mit Wirkungsfonds, Zuflüssen und Abflüssen.",
            "caption": "Der Finanzierungsstack zeigt die Modelllogik, nicht eine beschlossene Leistung."
        },
    ],
    "rente": [{
        "file": "../assets/visuals/explainers/woek_wirkungsrente_wirkungsbiografie.svg",
        "mobile": "../assets/visuals/explainers/woek_wirkungsrente_wirkungsbiografie_mobile.svg",
        "alt": "Grafik Wirkungsrente von Erwerbsbiografie zu Wirkungsbiografie mit Basisrente, Wirkungsdividende und Wirkungsfonds.",
        "caption": "Die Wirkungsrente erweitert die Erwerbsbiografie zur Wirkungsbiografie."
    }],
}


def visual_brief(slug: str, data: dict[str, str]) -> str:
    visuals = VISUAL_ASSIGNMENTS.get(slug.removesuffix(".html"))
    if visuals:
        figures = []
        for visual in visuals:
            figures.append(f"""<figure class="woek-visual-figure">
          <div class="woek-visual-scroll">
            <picture>
              <source media="(max-width: 760px)" srcset="{e(visual["mobile"])}" type="image/svg+xml">
              <img class="woek-visual" src="{e(visual["file"])}" alt="{e(visual["alt"])}" loading="lazy" decoding="async">
            </picture>
          </div>
          <figcaption class="woek-visual-caption">{e(visual["caption"])}</figcaption>
        </figure>""")
        return f"""<section class="section">
      <div class="section-header">
        <p class="hero-kicker">Visual</p>
        <h2>{e(data["title"])}</h2>
        <p>{e(data["text"])}</p>
      </div>
      {"".join(figures)}
    </section>"""
    return f"""<section class="section">
      <div class="visual-brief">
        <p class="hero-kicker">Visual-Vorschlag</p>
        <h2>{e(data["title"])}</h2>
        <p>{e(data["text"])}</p>
      </div>
    </section>"""


def status_notice(page: dict[str, object]) -> str:
    if not page.get("sensitive"):
        return ""
    status = str(page.get("public_status", page.get("status", "Konzeptstand")))
    return f'<div class="scanner-notice" role="note"><strong>{e(status)}:</strong> {e(SENSITIVE_TEXT)}</div>'


def why_not_enough(page: dict[str, object], slug: str) -> str:
    custom = page.get("why_not_enough")
    if custom:
        return paragraphs(list(custom))
    if slug in WHY_NOT_COPY:
        return paragraphs(WHY_NOT_COPY[slug])
    return paragraphs([
        "ESG, Reporting, Nachhaltigkeitsberatung oder Reparaturpolitik können Anschlussräume sein. Sie lösen den Kernfehler aber nicht, wenn sie Wirkung nur beschreiben, nachträglich dokumentieren oder Schäden erst reparieren.",
        "Die Wirkungsökonomie setzt früher an: beim Maßstab, bei der Fehlsteuerung und bei der Rückkopplung in Preise, Kapital, Haushalte, Management, Medien und Entscheidungen.",
    ])


def source_panel(page: dict[str, object]) -> str:
    sources = list(COMMON_SOURCES) + list(page.get("sources", []))
    status = str(page.get("public_status", page.get("status", "veröffentlicht")))
    source_items = "".join(f"<li>{source_item(str(item))}</li>" for item in sources)
    return f"""<details class="source-panel" open>
      <summary>Grundlage dieser Seite</summary>
      <div>
        <p class="hero-kicker">Quellenbasis / Status</p>
        <h2>Grundlage dieser Seite</h2>
        <ul class="source-list">{source_items}</ul>
        <div class="source-meta">
          <span>{e(status)}</span>
          <span>Stand: 22. Mai 2026</span>
          <span>Primärlogik WÖk; ESG/Standards nur Anschlussräume</span>
        </div>
      </div>
    </details>"""


def calculator(kind: str) -> str:
    if kind == "wirkungseinkommen":
        return """<section class="section section-muted" id="rechner">
      <div class="section-header">
        <p class="hero-kicker">Modellrechner</p>
        <h2>Bruttovolumen und Finanzierungsstack</h2>
        <p>Alle Werte sind Eingaben oder Modellstand. Der Rechner erzeugt keine Leistungszusage.</p>
      </div>
      <div class="model-calculator" data-calculator="income">
        <div class="input-grid">
          <label>Bevölkerung <input id="income-population" type="number" min="0" step="100000" value="83000000"></label>
          <label>Grunddividende pro Monat <input id="income-dividend" type="number" min="0" step="50" value="2000"></label>
          <label>Bestehende ersetzbare Transfers / Jahr <input id="income-transfers" type="number" min="0" step="1000000000" value="0"></label>
          <label>Wirkungssteuer-Einnahmen / Jahr <input id="income-tax" type="number" min="0" step="1000000000" value="0"></label>
          <label>Automatisierungsdividende / Jahr <input id="income-auto" type="number" min="0" step="1000000000" value="0"></label>
          <label>Kapitalwirkungsbeiträge / Jahr <input id="income-capital" type="number" min="0" step="1000000000" value="0"></label>
          <label>Abbau destruktiver Subventionen / Jahr <input id="income-subsidies" type="number" min="0" step="1000000000" value="0"></label>
          <label>Vermiedene Reparaturausgaben / Jahr <input id="income-repair" type="number" min="0" step="1000000000" value="0"></label>
        </div>
        <div class="calculator-output" aria-live="polite">
          <span>Bruttovolumen pro Jahr</span><strong id="income-gross">-</strong>
          <span>Netto-Finanzierungsbedarf nach Eingaben</span><strong id="income-net">-</strong>
          <span>Formel: Bevölkerung x Grunddividende x 12 minus freigegebene Rückflüsse und Umschichtungen.</span>
        </div>
      </div>
    </section>
    <script>
      (() => {
        const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
        const ids = ['population','dividend','transfers','tax','auto','capital','subsidies','repair'];
        const el = Object.fromEntries(ids.map(id => [id, document.getElementById('income-' + id)]));
        const outGross = document.getElementById('income-gross');
        const outNet = document.getElementById('income-net');
        function value(node) { return Number(node?.value || 0); }
        function update() {
          const gross = value(el.population) * value(el.dividend) * 12;
          const offsets = value(el.transfers) + value(el.tax) + value(el.auto) + value(el.capital) + value(el.subsidies) + value(el.repair);
          outGross.textContent = euro.format(gross);
          outNet.textContent = euro.format(Math.max(0, gross - offsets));
        }
        Object.values(el).forEach(node => node && node.addEventListener('input', update));
        update();
      })();
    </script>"""
    if kind == "rente":
        return """<section class="section section-muted" id="rechner">
      <div class="section-header">
        <p class="hero-kicker">Modellrechner</p>
        <h2>Wirkungsrente als Modellrechnung</h2>
        <p>Arbeitsformel nach Master: keine Leistungszusage, keine finale gesetzliche oder fiskalische Bewertung.</p>
      </div>
      <div class="model-calculator" data-calculator="pension">
        <div class="input-grid">
          <label>Einkommen / Jahr <input id="pension-income" type="number" min="0" step="1000" value="35000"></label>
          <label>Durchschnittseinkommen / Jahr <input id="pension-average" type="number" min="1" step="1000" value="50000"></label>
          <label>Basisrente / Monat <input id="pension-base" type="number" min="0" step="50" value="1200"></label>
          <label>Wirkungsfaktor <input id="pension-factor" type="number" step="0.1" value="2.5"></label>
          <label>Wirkungsjahre <input id="pension-years" type="number" min="0" step="1" value="40"></label>
          <label>Gewichtung <input id="pension-weight" type="number" min="0" step="0.1" value="1.2"></label>
          <label>Lernfaktor <input id="pension-learning" type="number" min="0" step="0.05" value="1.1"></label>
          <label>Optionaler Fondsanteil / Monat <input id="pension-fund" type="number" min="0" step="50" value="0"></label>
        </div>
        <div class="calculator-output" aria-live="polite">
          <span>Einkommenspunkte</span><strong id="pension-income-points">-</strong>
          <span>Wirkungspunkte</span><strong id="pension-impact-points">-</strong>
          <span>Wirkungsdividende / Monat</span><strong id="pension-dividend">-</strong>
          <span>Modellrente / Monat</span><strong id="pension-total">-</strong>
        </div>
      </div>
    </section>
    <script>
      (() => {
        const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
        const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });
        const ids = ['income','average','base','factor','years','weight','learning','fund'];
        const el = Object.fromEntries(ids.map(id => [id, document.getElementById('pension-' + id)]));
        const out = {
          incomePoints: document.getElementById('pension-income-points'),
          impactPoints: document.getElementById('pension-impact-points'),
          dividend: document.getElementById('pension-dividend'),
          total: document.getElementById('pension-total')
        };
        function value(node) { return Number(node?.value || 0); }
        function update() {
          const incomePoints = value(el.income) / Math.max(1, value(el.average));
          const impactPoints = incomePoints * value(el.factor) * value(el.years) * value(el.weight) * value(el.learning);
          const dividend = value(el.base) * (impactPoints / 100);
          const total = value(el.base) + dividend + value(el.fund);
          out.incomePoints.textContent = number.format(incomePoints);
          out.impactPoints.textContent = number.format(impactPoints);
          out.dividend.textContent = euro.format(dividend);
          out.total.textContent = euro.format(total);
        }
        Object.values(el).forEach(node => node && node.addEventListener('input', update));
        update();
      })();
    </script>"""
    return ""


PAGES: dict[str, dict[str, object]] = {
    "journalismus.html": {
        "title": "Journalismus mit Wirkungsbewusstsein",
        "meta": "Faktenchecks prüfen, ob Aussagen stimmen. Die Wirkungsökonomie ergänzt eine zweite Ebene: Welche Wirkung erzeugen Sprache, Frames, Reichweite und Plattformlogik auf Vertrauen, Diskurs und Demokratie?",
        "kicker": "Für wen · Journalismus und Öffentlichkeit",
        "subtitle": "Journalismus muss nicht aktivistischer werden. Er muss wirkungsbewusster werden.",
        "status": "veröffentlicht",
        "tags": "Journalismus Wirkung, Faktencheck Folgencheck, Wirkung politischer Sprache, Resonanzraum, Desinformation, Öffentlichkeit",
        "hero": [
            "Ein Faktencheck fragt, ob eine Aussage stimmt. Eine Wirkungsanalyse fragt zusätzlich, welche Zustände durch Sprache, Bilder, Tonalität, Auswahl, Wiederholung und Reichweite verändert werden können.",
            "In einer digitalen Öffentlichkeit, in der Aufmerksamkeit nach Erregung organisiert wird, reicht Wahrheit allein nicht mehr. Wahrheit muss auch wirksam vermittelt, geschützt und rückgekoppelt werden.",
            "Die Wirkungsökonomie versteht Öffentlichkeit deshalb nicht als Marktplatz beliebiger Meinungen, sondern als demokratischen Wirkungsraum.",
        ],
        "why": [
            "Journalismus steht heute zwischen zwei Fehlsteuerungen. Auf der einen Seite wächst der Druck auf Geschwindigkeit, Reichweite, Klicks, Zuspitzung und Empörung. Auf der anderen Seite erwarten Menschen Orientierung, Einordnung, überprüfbare Quellen und demokratische Verlässlichkeit.",
            "Das alte Mediensystem misst Aufmerksamkeit. Die Wirkungsökonomie fragt, was diese Aufmerksamkeit bewirkt.",
            "Ein Artikel kann faktisch korrekt sein und trotzdem durch Titel, Bildauswahl, Reihung, Tonalität oder Kontext Misstrauen, Angst oder Polarisierung verstärken. Umgekehrt kann Journalismus Wirkung entfalten, indem er Zusammenhänge sichtbar macht, Macht prüft, Konflikte einordnet und Menschen handlungsfähig macht.",
        ],
        "faults": [
            {"title": "Reichweite statt Relevanz", "text": "Die alte Medienlogik verwechselt Reichweite mit Relevanz. Plattformen belohnen Reaktion, nicht Verantwortung."},
            {"title": "Konflikt statt Klärung", "text": "Redaktionen geraten unter Zeitdruck, Talkformate belohnen Konflikt und politische Kommunikation baut Wahrnehmungsräume."},
            {"title": "Wirkung bleibt unsichtbar", "text": "Wenn Sprache Gruppen formt, Institutionen delegitimiert oder Feindbilder verdichtet, entsteht Wirkungspotenzial, das im Faktencheck unsichtbar bleibt."},
        ],
        "shift": [
            "Die WÖk ergänzt den Faktencheck um einen Folgencheck. Sie fragt nicht nur: Ist die Aussage richtig? Sie fragt: Welche Resonanzräume öffnet sie? Welche Handlungsschwellen verschiebt sie? Welche Gruppen werden gestärkt oder abgewertet?",
            "Journalismus wird dadurch nicht zur Gesinnungsprüfung. Er wird präziser. Zwischen Fakt, Meinung, Frame, Narrativ und Wirkungspotenzial wird sauber unterschieden.",
        ],
        "gains": [
            "Bessere Einordnung politischer Sprache.",
            "Stärkere Abgrenzung von Faktencheck, Kommentar und Wirkungsanalyse.",
            "Sichtbarkeit von Resonanzräumen: Angst, Vertrauen, Spaltung, Zugehörigkeit, Verantwortung.",
            "Mehr Quellenklarheit und weniger Scheinsicherheit.",
            "Neue Werkzeuge für Wahlprogramme, politische Aussagen, Plattformdynamiken und Desinformation.",
            "Eine demokratische Rolle ohne Parteiposition.",
        ],
        "not": [
            {"title": "Keine Redaktion ersetzen", "text": "Die WÖk ersetzt keine Redaktion und keine journalistische Verantwortung."},
            {"title": "Keine Wahrheitspolizei", "text": "Sie fordert keine Zensur und schafft keine staatliche Wahrheitshoheit."},
            {"title": "Keine Personenbewertung", "text": "Sie bewertet nicht private Meinungen, sondern Wirkungspotenziale öffentlicher Kommunikation."},
        ],
        "path": ["Aussage oder Artikel", "Frame", "Resonanzraum", "Wirkungspotenzial", "Wahrnehmungsverschiebung", "mögliche Zustandsveränderung", "demokratische Wirkung", "Rückkopplung in Journalismus und Öffentlichkeit"],
        "example": "Ein Artikel über Migration kann sachlich über Zahlen berichten. Wenn er aber konsequent mit Bildern von Menschenmassen, Begriffen wie Kontrollverlust und einer Erzählung von Bedrohung arbeitet, entsteht ein anderer Resonanzraum als bei einer Analyse von Ursachen, Arbeitsmarkt, Kommunen, Integration, Recht und Versorgung. Die Fakten können teilweise gleich sein. Die Wirkungspotenziale unterscheiden sich massiv.",
        "visual": {"title": "Faktencheck plus Wirkungsanalyse", "text": "Zwei Ebenen. Links Faktencheck: Aussage -> Quelle -> Richtigkeit. Rechts Wirkungsanalyse: Aussage -> Frame -> Resonanzraum -> Wirkungspotenzial -> demokratische Wirkung. Ruhige WÖk-Liniengrafik, keine Zeitungsschnipsel, keine Parteisymbole, keine echten Screenshots."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel zu Öffentlichkeit, Plattformlogik, Framing, Sprache, Desinformation, Creator-Verantwortung und Diskurskultur", "Leitbild Mensch, Planet und Demokratie: Medien als demokratische Infrastruktur"],
        "links": [("WÖk-Scanner öffnen", "../scanner.html"), ("Wirkung politischer Sprache verstehen", "../sdg-plus/medien-demokratie/wirkung-politischer-sprache.html"), ("Glossar: Wirkungspotenzial", "../glossar.html"), ("Evidenzraum Medien & Demokratie", "../evidenz/")],
    },
    "unternehmen.html": {
        "title": "Unternehmen als Wirkungssysteme",
        "meta": "Wirkungsorientiertes Management ist mehr als ESG. Es verändert Führung, Entscheidungen, Wertschöpfung, Kultur, Kapital, Lieferketten und Lernen im Unternehmen.",
        "kicker": "Für wen · Unternehmen",
        "subtitle": "Wirkungsorientiertes Management ist keine Nachhaltigkeitsabteilung. Es ist eine neue Führungslogik.",
        "status": "veröffentlicht",
        "tags": "wirkungsorientiertes Management, Unternehmen als Wirkungssystem, Wirkungsmanagement, resiliente Wertschöpfung, Mitarbeiterführung, Cradle2Cradle",
        "hero": [
            "Unternehmen wirken immer: durch Produkte, Preise, Lieferketten, Führung, Kultur, Kapital, Kommunikation, Daten, Anreize und Entscheidungen.",
            "Die zentrale Frage lautet deshalb nicht mehr nur: Wie steigern wir Gewinn? Sondern: Welche Wirkung erzeugt unser Unternehmen - und wie koppeln wir diese Wirkung in Führung, Strategie, Kapital, Einkauf, Innovation und Organisation zurück?",
            "ESG ist dabei nicht der Kern, sondern ein mögliches Abfallprodukt guter, resilienter und wirkungsorientierter Unternehmensführung.",
        ],
        "why": [
            "Klassische Unternehmensführung misst Umsatz, Gewinn, Rendite, Wachstum, Auslastung, Effizienz und KPI-Erfüllung. Diese Größen sind nicht wertlos. Aber sie zeigen Bewegung, nicht Richtung.",
            "Ein Unternehmen kann effizient sein und zugleich Risiken in Lieferketten, Kultur, Gesundheit, Klima, Demokratie oder Zukunftsfähigkeit erzeugen.",
            "ESG und CSRD sind wichtige Anschlussräume. Sie lösen aber den Kernfehler nicht, wenn sie nur Berichtspflichten bleiben. Reporting beschreibt. Wirkungsorientiertes Management verändert Entscheidungen.",
        ],
        "faults": [
            {"title": "Isolierte Optimierung", "text": "Einkauf optimiert Kosten, Vertrieb Umsatz, Finance Rendite, HR Headcount und Nachhaltigkeit Berichtsfähigkeit. Wirkung entsteht aber im Zusammenhang."},
            {"title": "KPI-Blindheit", "text": "Hierarchische KPI-Systeme melden Zielerfüllung, fragen aber zu selten, welche Zustände durch diese Ziele verändert werden."},
            {"title": "Verdeckte Wirkungslast", "text": "Billige Lieferanten, toxische Kultur oder falsche Boni können kurzfristig Zahlen stabilisieren und langfristig Resilienz zerstören."},
        ],
        "shift": [
            "Die WÖk liest Unternehmen als Wirkungssysteme. Führung wird zur Systemsteuerung, nicht zur Kontrolle einzelner Kennzahlen. Kapital bleibt Werkzeug. Gewinn bleibt Ergebnis. Wettbewerb bleibt. Aber die Zielgröße verschiebt sich: positive Netto-Wirkung für Mensch, Planet und Demokratie.",
            "Wirkungsorientiertes Management bedeutet, dass Wirkung in normale Führungsentscheidungen eingeht: Strategie, Produktentwicklung, Einkauf, CAPEX, OPEX, Portfolio, Risiko, Vergütung, Führung, Kultur, Kommunikation und Innovation.",
            "Die alte Logik lautet: KPI -> Kontrolle -> Zielerfüllung -> Bonus. Die WÖk-Logik lautet: Wirkung -> Rückkopplung -> Lernen -> Anpassung -> Resilienz.",
            "Resiliente Wertschöpfung verbindet Lieferkettenwirkung, Datenqualität, regionale Stabilität, Kreisläufe, faire Arbeit, Energie- und Ressourcensicherheit, Redundanz und Lernfähigkeit. Das betrifft Mitarbeitende ebenso wie Ressourceneffizienz, Cradle2Cradle, Kapitalzugang und Produktlogik.",
        ],
        "gains": [
            "Früheres Erkennen von Wirkungsrisiken.",
            "Bessere Entscheidungen jenseits isolierter KPIs.",
            "Resilientere Lieferketten.",
            "Mehr Innovationsfähigkeit durch Wirkung als Richtung.",
            "Glaubwürdigkeit ohne Greenwashing.",
            "Kapitalzugang durch bessere Wirkungs- und Risikodaten.",
            "Stärkere Arbeitgeberattraktivität durch Sinn, Verantwortung und Teilhabe.",
            "Bessere Vorbereitung auf CSRD, ESRS, DPP, CSDDD und Wirkungsrückkopplung.",
        ],
        "not": [
            {"title": "Gewinn bleibt", "text": "Die WÖk schafft Gewinn nicht ab. Sie macht Gewinn zum Resultat tragfähiger Wirkung."},
            {"title": "Eigentum bleibt", "text": "Sie schafft Eigentum nicht ab. Sie bindet Eigentum an Wirkung."},
            {"title": "Keine Moralabteilung", "text": "Sie ersetzt Management nicht durch Moral, sondern blinde Steuerung durch Rückkopplung."},
        ],
        "path": ["Entscheidung", "Wirkungspotenzial", "Produkt / Kultur / Lieferkette / Kapitalwirkung", "Zustandsveränderung", "Wirkungsbewertung", "Managementrückkopplung", "neue Entscheidung", "lernende Organisation"],
        "example": "Ein Unternehmen wählt zwischen zwei Lieferanten. Der erste ist billiger, aber mit Wasserstress, unsicheren Arbeitsbedingungen und geopolitischem Risiko verbunden. Der zweite ist teurer, aber kreislauffähiger, transparenter und resilienter. In der alten Logik gewinnt der billigere Lieferant. In der WÖk-Logik wird sichtbar: Der niedrigere Preis ist ein verdecktes Risiko.",
        "visual": {"title": "Von KPI-Steuerung zu Wirkungssteuerung", "text": "Links lineare KPI-Schleife: Umsatz -> Kosten -> Gewinn -> Bonus. Rechts WÖk-Schleife: Entscheidung -> Wirkung -> Rückkopplung -> Lernen -> Resilienz -> Gewinn als Ergebnis. Zusätzlich Netzwerk-Knoten für Mitarbeitende, Lieferketten, Kapital, Kultur, Produkte und Kunden."},
        "sources": ["Die neue Ordnung des Wohlstands, Teil VII: Unternehmen, Management und Wertschöpfung", "Kapitel Unternehmen als Wirkungssysteme, Wirkungscontrolling, Organisation/Kultur/Verantwortung, Lieferkettensteuerung und Unternehmensrisiko", "Systemmodell der WÖk: Wirtschaft als Wirkungssystem, Kapital als Wirkungskraft"],
        "links": [("Wirkungsmanagement vertiefen", "../akademie.html"), ("WÖk-Scanner für Unternehmen", "../scanner.html"), ("T-SROI verstehen", "../glossar.html#begriff-t-sroi"), ("Lieferkettenwirkung ansehen", "../anwendungen.html#lieferketten")],
    },
    "politik.html": {
        "title": "Politik mit Wirkung",
        "meta": "Politik wird wirksamer, wenn sie nicht nur Gesetze, Programme und Haushalte zählt, sondern ihre tatsächliche Wirkung auf Mensch, Planet und Demokratie zurückkoppelt.",
        "kicker": "Für wen · Politik und Staat",
        "subtitle": "Alte Politik repariert Folgen. Wirkungsorientierte Politik verändert die Anreize, die Folgen erzeugen.",
        "status": "veröffentlicht",
        "sensitive": True,
        "tags": "Politik Wirkung, Wirkungshaushalt, Wirkungssteuergesetz, Wahlprogramm-Scanner, Reparaturstaat, Rückkopplungsarchitektur",
        "hero": [
            "Politik steht heute unter Druck, Klima, Wohnen, Pflege, Energie, Digitalisierung, Migration, Desinformation, Staatsfinanzen und Vertrauensverlust gleichzeitig zu bearbeiten.",
            "Viele Antworten setzen spät an: Förderprogramme, Sonderregeln, Subventionen, Verbote, Ausnahmen und Nachweispflichten.",
            "Die Wirkungsökonomie setzt früher an. Sie fragt, welche Zustände politische Entscheidungen tatsächlich verändern und wie diese Wirkung in Haushalt, Recht, Steuern, Beschaffung, Verwaltung und demokratische Kontrolle zurückfließt.",
        ],
        "why": [
            "Politik wird heute häufig daran gemessen, ob sie handelt: ein Gesetz, ein Paket, ein Kompromiss, ein Haushaltstitel. Handlung allein ist aber noch keine Wirkung.",
            "Ein Gesetz kann gut gemeint sein und Zielkonflikte verschärfen. Eine Subvention kann kurzfristig helfen und langfristig falsche Strukturen stabilisieren. Ein Haushalt kann wachsen und trotzdem wenig verbessern.",
            "Das Problem liegt nicht darin, dass Politik nichts tut. Das Problem liegt darin, dass Politik zu spät sieht, was ihr Handeln tatsächlich verändert.",
        ],
        "faults": [
            {"title": "Symbolpolitik", "text": "Symbolpolitik misst Sichtbarkeit, nicht Wirkung."},
            {"title": "Ressortlogik", "text": "Ressortlogik zerlegt Probleme, die zusammenhängen."},
            {"title": "Haushaltsblindheit", "text": "Haushalte messen Ausgaben, nicht verhinderte Schäden."},
            {"title": "Reparaturbürokratie", "text": "Bürokratie wächst, wenn Preise und Märkte Wirkungen nicht abbilden."},
            {"title": "Vertrauensverlust", "text": "Bürger:innen erleben Widersprüche: Schädliches bleibt billig, Verantwortliches wird teurer, und Politik repariert später mit immer neuen Regeln."},
        ],
        "shift": [
            "Die WÖk macht Politik zur Rückkopplungsarchitektur. Sie ersetzt demokratische Debatte nicht. Sie liefert ihr einen besseren Prüfmaßstab: Welche Wirkung erzeugt eine Maßnahme für Mensch, Planet und Demokratie?",
            "Demokratische Parteien müssen nicht dieselben Antworten geben. Aber sie können sich auf dieselbe Wirkungsfrage beziehen. Dadurch werden Zielkonflikte sichtbarer, Verteilung ehrlicher, Folgekosten früher benannt und Prävention messbar.",
        ],
        "gains": [
            "Bessere Gesetzesfolgenabschätzung.",
            "Wirkungshaushalte statt reiner Ausgabenlogik.",
            "Weniger Reparaturbürokratie durch bessere Signale.",
            "Mehr Vertrauen durch transparente Wirkpfade.",
            "Bessere Mittelverwendung nach Netto-Wirkung, Prävention und Resilienz.",
            "Gemeinsame Sprache für demokratische Parteien.",
            "Weniger Symbolpolitik, mehr überprüfbare Zustandsveränderung.",
        ],
        "not": [
            {"title": "Keine Planwirtschaft", "text": "Die WÖk ersetzt Märkte und demokratische Entscheidung nicht."},
            {"title": "Keine Expertokratie", "text": "Sie ersetzt demokratische Entscheidung nicht durch Expertokratie."},
            {"title": "Keine Personenbewertung", "text": "Sie bewertet keine Personen und erzeugt keine Wahlempfehlung."},
        ],
        "path": ["Politisches Ziel", "Maßnahme / Gesetz / Haushalt", "betroffene Wirkungsräume", "Daten und Indikatoren", "Zielkonflikte und Nebenwirkungen", "Wirkungsbewertung", "Haushalt / Recht / Steuer / Beschaffung", "Rückkopplung", "Evaluation", "Anpassung"],
        "example": "Wohnen, Klima und soziale Stabilität werden heute häufig getrennt bearbeitet: Mietrecht hier, Sanierungsförderung dort, Baukosten an anderer Stelle. Die WÖk fragt anders: Welche Wohnmodelle erzeugen positive Netto-Wirkung auf Bezahlbarkeit, Energie, Gesundheit, Quartier, Flächenverbrauch und demokratische Stabilität?",
        "visual": {"title": "Vom Reparaturstaat zur Wirkungsarchitektur", "text": "Links: Problem entsteht -> Schaden -> Sonderregel -> Bürokratie. Rechts: Daten -> Wirkungsprüfung -> Anreiz -> Prävention -> weniger Reparatur. Ruhig, keine Parteifarben."},
        "sources": ["Die neue Ordnung des Wohlstands, Teile VI und X: Recht, Staat, Institutionen, Wirkungshaushalt, Wirkungsrat, Politik als Wirkungsraum", "WStG", "Führender Begriffsleitfaden"],
        "links": [("Wirkungshaushalt verstehen", "kommunen.html"), ("Wirkungssteuergesetz ansehen", "../ordnung/"), ("Wahlprogramm-Scanner", "../scanner.html"), ("Evidenzraum", "../evidenz/")],
    },
    "buergerinnen.html": {
        "title": "Bürger:innen in der Wirkungsökonomie",
        "meta": "Die Wirkungsökonomie entlastet Bürger:innen von moralischer Überforderung. Sie macht Wirkung in Preisen, Produkten, Medien, Politik und Alltag sichtbar.",
        "kicker": "Für wen · Bürger:innen",
        "subtitle": "Nicht du sollst alles allein durchprüfen. Das System muss bessere Signale senden.",
        "status": "veröffentlicht",
        "tags": "WÖk für Bürger, Bürger:innen, moralische Überforderung, ehrliche Preise, Wirkungskompass, Konsumwirkung",
        "hero": [
            "Die heutige Ordnung überfordert Bürger:innen moralisch. Sie sagt: Kaufe richtig, wähle richtig, informiere dich richtig, lebe nachhaltig, erkenne Desinformation, spare Energie, verstehe Lieferketten, prüfe Quellen, rechne Preise, sortiere Krisen.",
            "Gleichzeitig zeigen Preise, Werbung, Plattformen und politische Sprache häufig nicht, welche Wirkung wirklich entsteht.",
            "Die Wirkungsökonomie dreht diese Überforderung um. Verantwortung wird nicht auf einzelne Menschen abgewälzt. Sie wird in Preise, Daten, Produkte, Steuern, Kapital, Medien und politische Entscheidungen zurückgeführt.",
        ],
        "why": [
            "Bürger:innen handeln heute in einem System voller falscher Signale. Ein schädliches Produkt kann billig sein. Ein verantwortliches Produkt kann teuer sein.",
            "Eine Zuspitzung kann mehr Reichweite bekommen als eine gute Erklärung. Eine politische Maßnahme kann Entlastung versprechen und Folgekosten verschieben.",
            "Dann sollen Menschen individuell richtig handeln, obwohl die Systemlogik sie in die falsche Richtung drückt.",
        ],
        "faults": [
            {"title": "Preise lügen", "text": "Preise lügen, wenn Wirkung fehlt."},
            {"title": "Konsum wird moralisiert", "text": "Konsum wird moralisiert, während Wirkung unsichtbar bleibt."},
            {"title": "Folgen werden privatisiert", "text": "Bürger:innen sollen Lieferketten, Klima, Arbeitsbedingungen, Gesundheit, Medienwirkung und Politik allein kompensieren."},
        ],
        "shift": [
            "Die WÖk schafft Orientierung. Wirkung wird sichtbar, bewertet und zurückgekoppelt. Produkte werden verständlicher. Schädliche Wirkung kann belastet oder riskanter werden. Positive Netto-Wirkung kann entlastet und leichter zugänglich werden.",
            "Politische Sprache wird nicht nur auf Wahrheit, sondern auf Wirkungspotenziale geprüft. Bürger:innen werden nicht zu Überwachungssubjekten, sondern zu handlungsfähigeren Mitwirkenden.",
        ],
        "gains": [
            "Ehrlichere Preise.",
            "Verständlichere Produktwirkung.",
            "Weniger moralische Überforderung.",
            "Bessere Orientierung bei Politik, Medien und Konsum.",
            "Mehr Transparenz über Wirkungen und Datenlücken.",
            "Schutz vor Desinformation durch Wirkungsanalyse.",
            "Mehr demokratische Selbstwirksamkeit.",
        ],
        "not": [
            {"title": "Keine Lebensstilpolizei", "text": "Die WÖk erzwingt keinen perfekten Konsum."},
            {"title": "Kein Social Credit", "text": "Sie bewertet nicht den Menschen, sondern die Wirkung von Produkten, Systemen, Entscheidungen, Kommunikation und Kapitalflüssen."},
            {"title": "Kein Freiheitsverbot", "text": "Sie schafft Orientierung, nicht Bevormundung."},
        ],
        "path": ["Systemsignal", "Alltagsentscheidung", "Wirkungspotenzial", "Produkt / Medien / Politik / Konsum", "Zustandsveränderung", "Rückkopplung", "bessere Entscheidung"],
        "example": "Ein T-Shirt kostet fünf Euro. Heute sieht der Preis aus wie ein Schnäppchen. Die Wirkung bleibt unsichtbar: Wasser, Chemie, Arbeitsbedingungen, Mikroplastik, Transport, Entsorgung. Die WÖk macht sichtbar, ob der niedrige Preis nur deshalb niedrig ist, weil Kosten ausgelagert wurden.",
        "visual": {"title": "Von Schuldgefühl zu Orientierung", "text": "Links Bürger:in vor widersprüchlichen Signalen. Rechts WÖk-Kompass mit Produktwirkung, Medienwirkung, Politik, Preise. Kein Personenscoring."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel zu Konsumwirkung, Verbraucherinformation, Alltag, Bürger:innenwirkung, Wirkungskompetenz und Öffentlichkeit", "Produktpapier und Apfelbeispiel"],
        "links": [("WÖk-Kompass öffnen", "../kompass.html"), ("Scanner ausprobieren", "../scanner.html"), ("Produkte und Preise verstehen", "../anwendungen.html#produkte"), ("Wirkung politischer Sprache ansehen", "../sdg-plus/medien-demokratie/wirkung-politischer-sprache.html")],
    },
    "mieter.html": {
        "title": "Wohnen als Wirkungsraum",
        "meta": "Wohnen ist mehr als Markt. Die Wirkungsökonomie bewertet Wohnraum nach Bezahlbarkeit, Gesundheit, Energie, Quartier, Teilhabe und demokratischer Stabilität.",
        "kicker": "Für wen · Mieter:innen und Wohnen",
        "subtitle": "Wohnen ist kein Finanzprodukt. Wohnen ist Lebensgrundlage.",
        "status": "veröffentlicht",
        "tags": "Wohnen Wirkungsraum, Mieter, Wirkungsmiete, Quartiersresilienz, Bezahlbarkeit, Wohnungsmarkt",
        "hero": [
            "Wohnen ist Lebensgrundlage, Gesundheit, Sicherheit, Zugehörigkeit, Bildung, Pflege, Quartier und Demokratie.",
            "Der heutige Wohnungsmarkt behandelt Wohnraum zu häufig als Anlageklasse. Kapitalrendite wird sichtbar. Wirkung bleibt unsichtbar: Verdrängung, Mietangst, Hitze, Schimmel, Energiearmut, Einsamkeit, Schulwege, Pflege, Nachbarschaft, Teilhabe und Vertrauen.",
            "Die Wirkungsökonomie fragt: Welche Wohnmodelle stärken Mensch, Planet und Demokratie?",
        ],
        "why": [
            "Wohnungspolitik wird häufig in getrennten Problemen diskutiert: Mieten, Neubau, Sanierung, Eigentum, Boden, Energie, Leerstand, Sozialwohnungen. In der Realität wirken diese Felder zusammen.",
            "Eine Wohnung kann bezahlbar sein und krank machen. Eine Sanierung kann Klima schützen und Menschen verdrängen. Ein Neubau kann Wohnraum schaffen und Fläche versiegeln. Eine Kapitalanlage kann Rendite erzeugen und ein Quartier destabilisieren.",
        ],
        "faults": [
            {"title": "Falscher Maßstab", "text": "Das alte System misst Immobilienwert, Rendite, Miete und Quadratmeter."},
            {"title": "Unsichtbare Lebensqualität", "text": "Es misst zu wenig Lebensqualität, Gesundheit, Energie, soziale Mischung, Quartiersstabilität, Teilhabe und ökologische Wirkung."},
            {"title": "Marktgut statt Wirkungsraum", "text": "Dadurch wird Wohnen zum Marktgut, obwohl es ein Wirkungsraum ist."},
        ],
        "shift": [
            "Die WÖk bewertet Wohnen mehrdimensional: Bezahlbarkeit, Energie, Klima, Gesundheit, Barrierefreiheit, Quartier, Infrastruktur, soziale Mischung, Naturzugang, Demokratie und langfristige Resilienz.",
            "Rendite bleibt nicht automatisch legitim, wenn sie Wirkung zerstört. Investition wird nicht nach Kapital, sondern nach Wirkung gelesen.",
        ],
        "gains": [
            "Wohnmodelle werden nach Wirkung unterscheidbar.",
            "Zielkonflikte zwischen Klimaschutz und Bezahlbarkeit werden sichtbar.",
            "Faire Vermietung und energetische Qualität werden als Beitrag zu positiver Netto-Wirkung lesbar.",
            "Luxussanierung mit Verdrängung wird anders bewertet als Sanierung mit Mieterschutz und Quartiersnutzen.",
            "Kommunale Planung kann Wirkung statt bloßer Flächenzahlen priorisieren.",
        ],
        "not": [
            {"title": "Keine automatische Mietsenkung", "text": "Die WÖk verspricht nicht, dass alle Mieten automatisch sinken."},
            {"title": "Kein Mietrecht per Knopfdruck", "text": "Sie ersetzt kein Mietrecht per Knopfdruck."},
            {"title": "Keine Renditeblindheit", "text": "Sie macht sichtbar, welche Wohnmodelle Kosten auf Mieter:innen, Kommunen, Gesundheit, Klima und Zukunft verschieben."},
        ],
        "path": ["Wohnobjekt", "Mietpreis / Energie / Lage / Zustand / Quartier", "Wirkung auf Gesundheit, Teilhabe, Klima, Sicherheit und Vertrauen", "Wirkungsbewertung", "Wohnpolitik", "Förderung / Steuerung / Beschaffung / Investition"],
        "example": "Eine energetische Sanierung mit stabiler Miete, Mieterstrom, Barrierefreiheit, guter Lüftung, Naturzugang und Quartiersnutzen erzeugt andere Wirkung als eine Luxussanierung mit Verdrängung. Beide erhöhen den Gebäudewert. Aber nur eine stärkt Bezahlbarkeit, Gesundheit, Klimaschutz und demokratische Stabilität zusammen.",
        "visual": {"title": "Wohnen wirkt auf mehr als Miete", "text": "Wohnung in der Mitte. Kreise: Bezahlbarkeit, Energie, Gesundheit, Quartier, Teilhabe, Demokratie. Unten: Kapitalrendite allein reicht nicht."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel Wohnen", "Working-Paper Wohnungsmarkt", "Systemmodell: lebenswerte Räume, WIX-Wohn, Sozialraumprofile, kommunale Resilienz"],
        "links": [("Bürger:innen-Seite", "buergerinnen.html"), ("Kommunen-Seite", "kommunen.html"), ("Wirkungshaushalt", "kommunen.html"), ("Evidenz Wohnen", "../evidenz/")],
    },
    "investoren.html": {
        "title": "Kapitalwirkung statt blinde Rendite",
        "meta": "Kapital ist in der Wirkungsökonomie kein Kompass, sondern ein Verstärker von Richtung. Investitionen werden nach Wirkung, Risiko, Resilienz und Transformationsfähigkeit gelesen.",
        "kicker": "Für wen · Investor:innen und Kapitalmarkt",
        "subtitle": "Kapital ist nicht das Problem. Das Problem beginnt, wenn Kapital zum Kompass wird.",
        "status": "veröffentlicht",
        "sensitive": True,
        "tags": "Kapitalwirkung, Investor:innen, T-SROI, Wirkungsfonds, stranded assets, Wirkungskapital, keine Anlageberatung",
        "hero": [
            "Kapital kann Transformation beschleunigen, Infrastruktur finanzieren, Innovation ermöglichen und Resilienz aufbauen.",
            "Es kann aber auch fossile Abhängigkeiten, Spekulation, soziale Spaltung, Desinformation und ökologische Schäden verstärken.",
            "Deshalb fragt die Wirkungsökonomie nicht nur: Welche Rendite entsteht? Sondern: Welche Wirkung entfaltet dieses Kapital?",
        ],
        "why": [
            "ESG-Daten zeigen Risiken, aber nicht automatisch positive Netto-Wirkung. Ein Portfolio kann ESG-kompatibel wirken und trotzdem kaum Transformation erzeugen.",
            "Rendite kann kurzfristig steigen, während Wirkungsrisiken wachsen. Stranded Assets, Lieferkettenrisiken, Klimarisiken, Demokratierisiken, Plattformmacht und soziale Instabilität sind keine weichen Werte. Sie sind harte Zukunftsrisiken.",
        ],
        "faults": [
            {"title": "Trennung von Rendite und Wirkung", "text": "Die alte Kapitalmarktlogik trennt Rendite, Risiko und Wirkung zu stark."},
            {"title": "Label statt Richtung", "text": "Wirkung erscheint als Zusatz, Reputationsfaktor oder Nachhaltigkeitslabel."},
            {"title": "Allokation ohne Netto-Wirkung", "text": "Kapital wird dort allokiert, wo erwartete Rendite entsteht, nicht zwingend dort, wo positive Netto-Wirkung und Resilienz aufgebaut werden."},
        ],
        "shift": [
            "Die WÖk liest Kapital als Wirkungskraft. Kapital ist gespeicherte Handlungsmöglichkeit. Es verstärkt, was finanziert wird.",
            "Kapitalflüsse müssen nach Wirkung, Risikowahrheit und Transformationsfähigkeit bewertet werden. T-SROI fragt nicht nur nach sozialem Zusatznutzen, sondern nach systemischer Transformationswirkung: verändert die Investition Pfade, Standards, Märkte, Resilienz oder künftige Entscheidungen?",
        ],
        "gains": [
            "Frühere Erkennung von Transformationsrisiken.",
            "Bessere Unterscheidung zwischen ESG-Theater und echter Wirkung.",
            "Resilientere Portfolios.",
            "Schutz vor stranded assets.",
            "Anschluss an CSRD, ESRS, EU-Taxonomie, DPP, T-SROI und Wirkungsdatenräume.",
            "Bessere Bewertung von langfristiger Versicherbarkeit, Kapitalzugang und Systemstabilität.",
        ],
        "not": [
            {"title": "Keine Anlageberatung", "text": "Diese Seite ist keine Anlageberatung und ersetzt keine individuelle Risikoanalyse."},
            {"title": "Keine Personenbewertung", "text": "Die WÖk bewertet keine Personen."},
            {"title": "Keine Renditeabschaffung", "text": "Sie fordert nicht, dass Rendite verschwindet. Sie ordnet Rendite als Folge tragfähiger Wirkung ein."},
        ],
        "path": ["Kapitalentscheidung", "Geschäftsmodell / Produkt / Infrastruktur", "Wirkung auf Mensch, Planet, Demokratie", "Wirkungsrisiko / Wirkungsresilienz", "T-SROI / Portfolio-Wirkung", "Kapitalrückkopplung"],
        "example": "Ein Fonds investiert in ein fossil rentables Geschäftsmodell. Kurzfristig kann die Rendite hoch sein. Wirkungsökonomisch wächst aber ein Bündel aus Klimarisiko, Regulierungsrisiko, Versicherungsrisiko, Reputationsrisiko und demokratischem Folgerisiko.",
        "visual": {"title": "Kapital als Verstärker von Richtung", "text": "Kapitalfluss teilt sich in zwei Richtungen: Extraktion / Wirkungslast und Regeneration / positive Netto-Wirkung. In der Mitte: Wirkungsprüfung und T-SROI."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel zu Kapital als Werkzeug, Kapitalwirkung, T-SROI, Kapitalmärkte und Fonds", "Whitepaper T-SROI", "Systemmodell: Kapital als Wirkungskraft"],
        "links": [("T-SROI verstehen", "../glossar.html#begriff-t-sroi"), ("Wirkungsfonds", "wirkungseinkommen.html"), ("Unternehmen als Wirkungssysteme", "unternehmen.html"), ("Evidenz Sustainable Finance", "../evidenz/")],
    },
    "kommunen.html": {
        "title": "Kommunen als Wirkungsräume",
        "meta": "Kommunen sind die Orte, an denen Wirkung sichtbar wird: Wohnen, Hitze, Wasser, Mobilität, Bildung, Pflege, Gesundheit, Teilhabe und Demokratie.",
        "kicker": "Für wen · Kommunen",
        "subtitle": "Wirkung beginnt vor Ort.",
        "status": "veröffentlicht",
        "tags": "Kommunen Wirkungshaushalt, lokale Resilienz, Prävention statt Reparatur, Stadtbaum, kommunale SDG-Portale",
        "hero": [
            "Kommunen spüren, was abstrakte Politik und Märkte erzeugen: Wohnungsdruck, Hitze, Wasserstress, Pflegeengpässe, Schulwege, Einsamkeit, Mobilität, Energie, Integration, Vereinsleben, Jugendräume, Kultur, Sicherheit und Vertrauen.",
            "Die Wirkungsökonomie macht diese Zusammenhänge steuerbar.",
            "Ein kommunaler Haushalt ist nicht nur eine Ausgabenliste. Er ist ein Wirkungsinstrument.",
        ],
        "why": [
            "Kommunen müssen immer mehr Folgen reparieren, die sie nicht allein verursacht haben.",
            "Falsche Preislogik, Wohnspekulation, Klimafolgen, soziale Spaltung, Pflegekrisen, Verkehrsprobleme und digitale Abhängigkeiten landen am Ende im Rathaus, in Schulen, Kliniken, Vereinen, Stadtwerken, Bauämtern und Sozialdiensten.",
        ],
        "faults": [
            {"title": "Silo-Steuerung", "text": "Kommunale Steuerung arbeitet häufig in Silos: Bau, Soziales, Umwelt, Mobilität, Gesundheit, Bildung, Sicherheit."},
            {"title": "Wirkung zwischen Bereichen", "text": "Ein Stadtbaum wirkt auf Hitze, Wasser, Gesundheit, Aufenthaltsqualität, Begegnung und Quartiersstabilität."},
            {"title": "Unsichtbare Mehrfachwirkung", "text": "Eine Schule wirkt auf Bildung, Ernährung, Gesundheit, Integration, Eltern, Mobilität und Demokratie."},
        ],
        "shift": [
            "Die WÖk macht kommunale Mehrfachwirkung sichtbar. Mittel werden nicht nur nach Ressort, Titel und Pflichtaufgabe betrachtet, sondern nach Netto-Wirkung, Prävention, Resilienz und sozialer Stabilität.",
            "Wirkungshaushalte zeigen, welche Investitionen mehrere Wirkungsräume gleichzeitig stärken.",
        ],
        "gains": [
            "Bessere Priorisierung knapper Mittel.",
            "Sichtbarkeit von Prävention statt nur Reparatur.",
            "Verknüpfung von Wohnen, Gesundheit, Hitze, Wasser, Bildung und Mobilität.",
            "Verständlichere Bürgerbeteiligung.",
            "Bessere Grundlage für Fördermittel, Beschaffung und kommunale Planung.",
            "Mehr Resilienz gegenüber Hitze, Extremwetter, Energiekrisen, Pflegeengpässen und Desinformation.",
        ],
        "not": [
            {"title": "Keine Bewertungsmaschine", "text": "Die WÖk macht Kommunen nicht zu Bewertungsmaschinen."},
            {"title": "Keine Ratsersetzung", "text": "Sie ersetzt keine demokratische Kommunalpolitik."},
            {"title": "Keine Projektbürokratie", "text": "Sie hilft, Wirkung sichtbar zu machen, Zielkonflikte zu benennen und öffentliche Mittel besser zu begründen."},
        ],
        "path": ["Kommunale Entscheidung", "Raumwirkung", "Mensch / Planet / Demokratie", "Prävention oder Folgekosten", "Wirkungshaushalt", "Bürgerbeteiligung", "Evaluation", "Anpassung"],
        "example": "Ein Park ist keine Dekoration. Er ist Hitzeschutz, Wasserspeicher, Bewegungsraum, Begegnungsraum, psychischer Entlastungsraum, Biodiversitätsfläche und demokratische Alltagsinfrastruktur.",
        "visual": {"title": "Die Kommune als Wirkungsraum", "text": "Stadtplanartige WÖk-Karte mit Knoten: Wohnen, Schule, Pflege, Park, Mobilität, Wasser, Energie, Kultur, Beteiligung. Linien zeigen Mehrfachwirkung."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel zu Kommunen, Wirkungshaushalt, Wohnen, Gesundheit, Pflege, Bildung, Resilienzstaat", "Systemmodell: lebenswerte Räume, Urban Impact Planning, kommunale Wirkungsbudgets", "Working-Paper Wohnungsmarkt"],
        "links": [("Wirkungshaushalt verstehen", "politik.html"), ("Wohnen als Wirkungsraum", "mieter.html"), ("Gesundheit", "gesundheit.html"), ("Evidenz kommunale SDG-Portale", "../evidenz/")],
    },
    "akademie.html": {
        "title": "Wirkungskompetenz lernen",
        "meta": "Die WÖk-Akademie vermittelt Wirkungskompetenz: Wirkung verstehen, bewerten, zurückkoppeln, anwenden und in Praxisprojekte übersetzen.",
        "kicker": "Für wen · Akademie und Wirkungskompetenz",
        "subtitle": "Wirkungskompetenz wird zur Schlüsselkompetenz komplexer Gesellschaften.",
        "status": "veröffentlicht",
        "tags": "Wirkungskompetenz, Akademie, systemisches Lernen, Wirkungspfad, Scannerkompetenz, Zielkonflikte",
        "hero": [
            "Wer die Zukunft gestalten will, muss mehr können als Fakten wiederholen oder Meinungen verteidigen.",
            "Menschen müssen lernen, Wirkung zu sehen: welche Zustände sich verändern, welche Wirkungspotenziale entstehen, welche Rückkopplungen greifen, welche Zielkonflikte bestehen und wie Entscheidungen auf Mensch, Planet und Demokratie wirken.",
            "Die WÖk-Akademie ist der Lernraum dafür.",
        ],
        "why": [
            "Unsere Bildungssysteme vermitteln Wissen, Kompetenzen und Abschlüsse. Aber sie trainieren zu wenig, Systeme in Wirkung zu lesen.",
            "Deshalb entstehen Debatten, in denen Fakten, Frames, Gefühle, Interessen, Daten, Risiken und Wirkungsebenen durcheinandergeraten.",
            "Wirkungskompetenz ist die Fähigkeit, diese Ebenen zu trennen und wieder zusammenzuführen.",
        ],
        "faults": [
            {"title": "Zu enge Bildungsmaße", "text": "Bildung misst Noten, Abschlüsse, Tests, Kompetenzen und Arbeitsmarktfähigkeit."},
            {"title": "Zu enge Medienkompetenz", "text": "Medienkompetenz bleibt zu eng, wenn sie nur Quellenprüfung meint."},
            {"title": "Zu enge Wirtschaftskompetenz", "text": "Wirtschaftskompetenz bleibt zu eng, wenn sie Kapital als Maßstab übernimmt."},
        ],
        "shift": [
            "Die Akademie organisiert Lernen entlang des WÖk-Roten-Fadens: Verstehen - Bewerten - Zurückkoppeln - Anwenden - Umsetzen.",
            "Wirkung wird nicht als Meinung gelehrt, sondern als Analyse von Zustandsveränderung, Wirkungsräumen, Daten, Bewertung, Rückkopplung und Systemgrenzen.",
        ],
        "gains": [
            "Begriffe sauber unterscheiden: Wirkung, Wirkungspotenzial, Risiko, Resonanzraum, Netto-Wirkung.",
            "Daten und Quellen einordnen.",
            "Wirkungspfade visualisieren.",
            "Produkte, Unternehmen, Politik und Medien analysieren.",
            "Zielkonflikte erkennen.",
            "Nicht-Kompensation verstehen.",
            "Wirkungskompass und Scanner sinnvoll nutzen.",
            "Praxisprojekte entwickeln.",
        ],
        "not": [
            {"title": "Keine Indoktrination", "text": "Die Akademie ist keine Indoktrination."},
            {"title": "Keine Kritikvermeidung", "text": "Sie ersetzt keine wissenschaftliche Kritik."},
            {"title": "Keine fertigen Meinungen", "text": "Sie trainiert Wirkungslogik, Systemverständnis, Quellenklarheit und demokratische Urteilsfähigkeit."},
        ],
        "path": ["Wissen", "Begriffe", "Wirkungspfad", "Bewertung", "Rückkopplung", "Praxisprojekt", "Wirkungskompetenz", "gesellschaftliche Handlungsfähigkeit"],
        "example": "Ein Lernmodul zu politischer Sprache prüft nicht, welche Partei sympathisch ist. Es analysiert, wie ein Begriff wirkt: Welche Frames entstehen? Welche Resonanzräume werden geöffnet? Welche Wirkungspotenziale entstehen? Welche SDG+-Dimensionen sind betroffen?",
        "visual": {"title": "Der Studienpfad der WÖk-Akademie", "text": "Sieben Teile als ruhiger Lernpfad: Grundverständnis, Wirkungskompetenz, Maßstab, Rückkopplung, Anwendung, Transformation, Praxisprojekt."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel Bildung, Wirkungskompetenz, Wissenschaft, Akademie-Logik", "Systemmodell: Fach Zukunft, Wirkungskompetenz-Akademie, Bildungs- und Wissenskompetenz"],
        "links": [("Akademie-Studienpfad ansehen", "../akademie.html"), ("Glossar öffnen", "../glossar.html"), ("WÖk-Kompass", "../kompass.html"), ("Praxisprojekt starten", "../mitmachen.html")],
    },
    "wissenschaft-forschung.html": {
        "title": "Wissenschaft und Forschung in der Wirkungsökonomie",
        "meta": "Die Wirkungsökonomie versteht Wissenschaft als Wirkungsinfrastruktur: Sie prüft Wirklichkeit, macht Unsicherheit sichtbar und entwickelt Modelle, Daten und Kritik für lernfähige Systeme.",
        "kicker": "Für wen · Wissenschaft und Forschung",
        "subtitle": "Wissenschaft ist nicht nur Wissensproduktion. Sie ist eine demokratische Wirkungsinfrastruktur.",
        "status": "Methodischer Hinweis",
        "sensitive": True,
        "noindex": True,
        "tags": "Wissenschaft Wirkungsinfrastruktur, Forschung, Datenqualität, Wirkungsrat, Forschung Wirkung, Unsicherheit",
        "hero": [
            "Ohne unabhängige Forschung, belastbare Daten, replizierbare Methoden, öffentliche Statistik, Kritikfähigkeit und Unsicherheitssprache verliert eine Gesellschaft ihre Korrekturfähigkeit.",
            "Die Wirkungsökonomie braucht Wissenschaft nicht als Dekoration, sondern als methodisches Rückgrat.",
        ],
        "why": [
            "Wissenschaft wird heute auf widersprüchliche Weise behandelt. Sie soll schnelle Antworten liefern, politische Legitimation schaffen, Innovation ermöglichen, Drittmittel einwerben, Rankings bedienen und öffentliche Debatten beruhigen.",
            "Gleichzeitig wird sie angegriffen, instrumentalisiert oder als Meinung neben anderen Meinungen behandelt.",
            "Die WÖk setzt anders an: Wissenschaft ist der Raum geprüfter Wirklichkeit. Sie liefert keine absolute Wahrheitshoheit, aber bessere Korrekturverfahren.",
        ],
        "faults": [
            {"title": "Leistung wird eng gemessen", "text": "Publikationen, Zitationen, Drittmittel, Rankings und Prestige zeigen nicht automatisch gesellschaftliche Wirkung oder Datenqualität."},
            {"title": "Exzellenz kann folgenlos bleiben", "text": "Forschung kann exzellent wirken und trotzdem gesellschaftlich folgenlos bleiben."},
            {"title": "Innovation kann schaden", "text": "Innovation kann neu sein und trotzdem negative Wirkung erzeugen."},
        ],
        "shift": [
            "Die WÖk fragt: Welche Forschung verändert welche Zustände? Welche Erkenntnis verbessert Entscheidungen? Welche Daten machen Risiken sichtbar? Welche Modelle helfen, Zielkonflikte zu verstehen?",
            "Wissenschaft wird dadurch nicht nützlichkeitsverkürzt. Gerade Grundlagenforschung braucht Freiheit. Aber Forschungsförderung, Innovation und Politikberatung werden transparenter nach Wirkung, Unsicherheit, Risiko, Systemhebel und öffentlicher Relevanz gelesen.",
        ],
        "gains": [
            "Stärkere Rolle als demokratische Korrekturinfrastruktur.",
            "Bessere Sprache für Unsicherheit und Nichtwissen.",
            "Interdisziplinäre Brücken zwischen Naturwissenschaft, Sozialwissenschaft, Recht, Ökonomie, Gesundheit, Medien und Technik.",
            "Neue Indikatoren für Forschungswirkung ohne reine Verwertungslogik.",
            "Schutz vor politischer Vereinnahmung und kurzfristiger Drittmittellogik.",
            "Anschluss an WÖk-IDs, Datenräume, Wirkungsberichte und den Wirkungsrat.",
        ],
        "not": [
            {"title": "Keine Dienstleisterin der Politik", "text": "Die WÖk macht Wissenschaft nicht zur Dienstleisterin der Politik."},
            {"title": "Kein Peer-Review-Ersatz", "text": "Sie ersetzt Peer Review nicht durch Wirkungspunkte."},
            {"title": "Keine Expertokratie", "text": "Wissenschaft liefert bessere Wirklichkeitsprüfung, keine Herrschaft über Werte."},
        ],
        "path": ["Forschungsfrage", "Methode", "Datenqualität", "Erkenntnis", "Unsicherheit", "Wirkungspotenzial", "Anwendung / Politik / Technologie / Bildung", "Rückkopplung", "Replikation und Korrektur"],
        "example": "Eine KI-Innovation kann Produktivität erhöhen. Wissenschaftlich reicht es nicht, Modellgenauigkeit oder Marktpotenzial zu messen. WÖk-Forschung fragt zusätzlich: Welche Arbeit verändert sich? Welche Bias-Risiken entstehen? Welche Energie- und Ressourcenwirkungen entstehen? Welche Machtverhältnisse werden verstärkt?",
        "visual": {"title": "Wissenschaft als Wirkungsinfrastruktur", "text": "Drei Ebenen: Erkenntnis, Daten, Korrektur. Dazu Rückkopplung in Politik, Unternehmen, Gesundheit, Bildung, KI und Öffentlichkeit."},
        "sources": ["Die neue Ordnung des Wohlstands, Teil XIV: Wissenschaft als Wirkungsinfrastruktur", "Grundlagenpapier zu Auswirkungen auf Wissenschaft"],
        "links": [("Evidenzraum", "../evidenz/"), ("Akademie", "../akademie.html"), ("Wirkungsrat", "../ordnung/"), ("Daten und Standards", "../methodik/daten-standards-regularien.html")],
    },
    "gesundheit.html": {
        "title": "Gesundheit als Systemwirkung",
        "meta": "Die Wirkungsökonomie denkt Gesundheit nicht als Reparatur von Krankheit, sondern als Systemleistung: Prävention, Pflege, Psyche, Wohnen, Arbeit, Klima, Ernährung und Teilhabe.",
        "kicker": "Für wen · Gesundheit, Pflege und Prävention",
        "subtitle": "Ein Gesundheitssystem wirkt nicht erst, wenn Krankheit behandelt wird.",
        "status": "Methodischer Hinweis",
        "sensitive": True,
        "noindex": True,
        "tags": "Gesundheit als Systemwirkung, Prävention statt Reparatur, Pflege, One Health, kommunale Gesundheitsräume",
        "hero": [
            "Es wirkt, wenn Menschen gesund bleiben können.",
            "Die heutige Ordnung finanziert große Teile von Krankheit: Diagnose, Behandlung, Medikamente, Operationen, Pflegefälle und Reparatur. Das ist notwendig, wenn Menschen krank sind.",
            "Aber ein System, das erst dann stark wird, wenn Gesundheit verloren ist, hat einen schlechten Wirkungsgrad. Die Wirkungsökonomie fragt: Welche Strukturen erzeugen Krankheit - und welche erzeugen Gesundheit?",
        ],
        "why": [
            "Gesundheit entsteht nicht nur in Arztpraxen und Krankenhäusern. Sie entsteht in Wohnungen, Schulen, Betrieben, Kantinen, Parks, Stadtplanung, Luftqualität, Wasser, Ernährung, Pflegebeziehungen, Arbeitsbedingungen, Einkommen, Bildung, Vertrauen, digitalen Räumen und sozialer Zugehörigkeit.",
            "Wenn diese Bedingungen schlecht sind, landet die Rechnung später im Gesundheitssystem.",
        ],
        "faults": [
            {"title": "Krankheit statt Prävention", "text": "Das alte System bezahlt Krankheit besser als verhinderte Krankheit."},
            {"title": "Pflege als Kostenblock", "text": "Pflege wird zu oft als Kostenblock gelesen, nicht als stabilisierende Wirkleistung."},
            {"title": "Gesundheitsfaktoren als Nebenthemen", "text": "Arbeitswelt, Wohnen, Stadtplanung, digitale Räume, Einsamkeit und Klima werden unterschätzt."},
        ],
        "shift": [
            "Die WÖk macht Gesundheit zur Systemwirkung. Prävention wird als Wirkleistung anerkannt. Gesundheitshaushalte, kommunale Präventionsräume, Sozialraumprofile, One-Health-Logik, psychische Gesundheit, Pflegewirkung, gesunde Arbeit und digitale Frühwarnsysteme werden Teil der Steuerung.",
            "Gesundheit wird nicht moralisiert. Niemand ist schuld, krank zu sein. Die WÖk fragt nach Bedingungen, nicht nach Perfektionsmenschen.",
        ],
        "gains": [
            "Prävention statt Reparatur als Steuerungslogik.",
            "Psychische Gesundheit gleichwertig.",
            "Pflege als stabilisierende Wirkleistung.",
            "Kommunen als Gesundheitsräume.",
            "Arbeit, Wohnen, Ernährung und Klima als Gesundheitsfaktoren.",
            "KI und Daten für Früherkennung, nicht für Überwachung.",
            "Weniger Folgekosten durch frühere Rückkopplung.",
        ],
        "not": [
            {"title": "Keine Gesundheitsmoral", "text": "Keine Schuldzuweisung an Kranke und keine Fitnesspflicht."},
            {"title": "Kein Social Credit", "text": "Gesundheit wird nicht zur Personenbewertung."},
            {"title": "Keine Verdrängung von Medizin", "text": "Die WÖk stärkt Versorgung, indem sie verhindert, dass Medizin zum Auffangbecken aller Fehlsteuerungen wird."},
        ],
        "path": ["Lebensbedingung", "Gesundheitsrisiko oder Gesundheitschance", "Prävention / Belastung", "Zustandsveränderung", "Gesundheitswirkung", "Haushalt / Pflege / Arbeit / Kommune", "Rückkopplung"],
        "example": "Eine Stadt ohne Schatten, mit schlechter Luft, wenig Bewegung, unsicheren Wegen und isolierenden Wohnformen erzeugt später Gesundheitskosten. Eine Stadt mit Grün, Begegnung, sicheren Wegen, guter Luft, sozialer Mischung und Präventionsräumen erzeugt Gesundheit. Das ist nicht Wellness. Das ist Wirkungsökonomie.",
        "visual": {"title": "Gesundheit entsteht im System", "text": "Mensch in der Mitte. Knoten: Wohnen, Arbeit, Klima, Ernährung, Pflege, Psyche, Bildung, Stadt, digitale Räume. Unten: Prävention -> weniger Reparatur."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel Gesundheit und Pflege", "Systemmodell der WÖk: Gesundheit, Pflege & Leben; Prävention statt Reparatur; One Health; psychische Gesundheit; kommunale Gesundheitsräume"],
        "links": [("Kommunen", "kommunen.html"), ("Wohnen", "mieter.html"), ("Akademie", "akademie.html"), ("Evidenz Gesundheit", "../evidenz/")],
    },
    "wirkungseinkommen.html": {
        "title": "Wirkungseinkommen",
        "meta": "Das Wirkungseinkommen verbindet Grunddividende, Markteinkommen und Wirkungsbonus. Es beantwortet die Frage, wie Einkommen in einer automatisierten Wirtschaft gesichert und an Wirkleistung zurückgekoppelt wird.",
        "kicker": "Für wen · Wirkungseinkommen",
        "subtitle": "Wenn Maschinen Produktivität erzeugen, muss Produktivität gesellschaftlich zurückgekoppelt werden.",
        "status": "Konzeptstand / Modellrechnung. Keine Leistungszusage.",
        "sensitive": True,
        "noindex": True,
        "tags": "Wirkungseinkommen, Grunddividende, Automatisierungsdividende, Wirkungsfonds, Markteinkommen, Wirkungsbonus",
        "hero": [
            "Das Wirkungseinkommen beantwortet eine zentrale Frage der automatisierten Gesellschaft: Was passiert mit Einkommen, Sicherheit und Teilhabe, wenn KI, Robotik und Automatisierung Wertschöpfung erzeugen, ohne dass Erwerbsarbeit für alle im bisherigen Umfang nötig bleibt?",
            "Die alte Ordnung koppelt Einkommen, Würde, Steuerbasis und soziale Sicherheit an Erwerbsarbeit. Die Wirkungsökonomie löst Einkommen nicht einfach von Arbeit. Sie bindet Einkommen an Wirkung zurück.",
        ],
        "why": [
            "Konzeptstand. Das Zielmodell arbeitet mit einer Grunddividende von 2.000 Euro monatlich pro Person. Einführung, Finanzierung, Rechtsform und fiskalische Prüfung sind nicht final beschlossen. Diese Seite zeigt Wirkungslogik und Modellrechnung, keine Leistungszusage.",
            "Das heutige System setzt Arbeit, Einkommen und Leistung zu eng gleich. Gleichzeitig erzeugen KI, Robotik, Plattformen und Automatisierung Produktivität, die nicht mehr proportional zu menschlicher Erwerbsarbeit ist.",
            "Care, Pflege, Bildung, Prävention, Gemeinwesen, Demokratiearbeit, Kultur, ökologische Regeneration und soziale Stabilität erzeugen reale Wirkleistung. Im alten Einkommensmodell bleiben sie zu häufig unterbezahlt oder unsichtbar.",
        ],
        "faults": [
            {"title": "Arbeit als alleinige Basis", "text": "Das System ist so gebaut, als müsse menschliche Erwerbsarbeit die alleinige Grundlage von Einkommen, Steuern und sozialer Sicherheit bleiben."},
            {"title": "Produktivität ohne Rückkopplung", "text": "Automatisierte Produktivität kann steigen, ohne automatisch Sicherheit und Teilhabe zu stabilisieren."},
            {"title": "Wirkleistung unsichtbar", "text": "Care, Pflege, Bildung, Gemeinwesen und Demokratiearbeit bleiben häufig unterbezahlt oder unsichtbar."},
        ],
        "shift": [
            "Das Wirkungseinkommen besteht aus drei Ebenen: Grunddividende, Markteinkommen und Wirkungsbonus.",
            "Die Grunddividende ist ein universeller Sockel von Geburt bis Tod. Im Zielmodell: 2.000 Euro pro Monat und Person. Markteinkommen bleibt zusätzlich möglich. Der Wirkungsbonus erkennt reale Wirkleistung an und bewertet nicht den Menschen, sondern die gesellschaftliche Wirkung anerkannter Tätigkeiten.",
            "Formel: Wirkungseinkommen = Grunddividende + Markteinkommen + Wirkungsbonus.",
            "Das Wirkungseinkommen ist nicht als ungedeckte Wunderzahlung gedacht. Produktivität, die bisher einseitig privatisiert oder als Folgekosten externalisiert wurde, wird gesellschaftlich zurückgekoppelt.",
        ],
        "gains": [
            "Sicherheit in einer automatisierten Wirtschaft.",
            "Anerkennung von Care, Pflege, Bildung, Gemeinwesen und Demokratiearbeit.",
            "Markteinkommen bleibt möglich.",
            "Wirkung wird sichtbar.",
            "Sinn und Teilhabe werden mitgedacht.",
            "Soziale Stabilität wird nicht erst repariert.",
        ],
        "not": [
            {"title": "Keine Abschaffung von Arbeit", "text": "Arbeit, Markteinkommen, Selbstständigkeit, Unternehmertum und Innovation bleiben möglich."},
            {"title": "Kein Social Credit", "text": "Der Wirkungsbonus bewertet anerkannte Wirkleistung, nicht den Menschen als Person."},
            {"title": "Keine ungedeckte Wunderzahlung", "text": "Alle Werte müssen als Eingabe, Quelle oder freigegebener Modellstand gekennzeichnet werden."},
        ],
        "path": ["Automatisierung / KI / Robotik", "Produktivität ohne proportionalen Erwerbsarbeitsbedarf", "alte Einkommensbasis wird instabil", "Produktivitätsrückführung", "Wirkungsfonds", "Grunddividende + Wirkungsbonus", "Teilhabe und Stabilität"],
        "example": "Ein Mensch leistet Care-Arbeit, unterstützt Bildung, stabilisiert ein Gemeinwesen oder übernimmt demokratische Arbeit. Im alten Modell erscheint das oft nicht als Einkommen. In der WÖk wird gefragt, wie diese reale Wirkleistung sichtbar und rückkoppelbar wird.",
        "visual": {"title": "Drei Ebenen und Wirkungsfonds", "text": "Drei Ebenen: Grunddividende + Markteinkommen + Wirkungsbonus. Zweite Grafik: Wirkungsfonds mit Zuflüssen und Auszahlungen. Dritte Grafik: Brutto vs. Netto."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel Arbeit, Automatisierung und Maschinenleistung, Wirkungseinkommen, Kapitalmärkte und Fonds", "Arbeitspapier Wirkungseinkommensteuer", "Systemmodell: Wirkungsfonds, Automatisierungsdividende, Wirkungsdividende"],
        "links": [("Wirkungsrente verstehen", "rente.html"), ("Rechner öffnen", "#rechner"), ("Wirkungsfonds", "investoren.html"), ("Bürger:innen-Seite", "buergerinnen.html")],
        "calculator": "wirkungseinkommen",
    },
    "rente.html": {
        "title": "Wirkungsrente",
        "meta": "Die Wirkungsrente erweitert die alte Erwerbsbiografie zur Wirkungsbiografie. Sie kombiniert Basisrente, Wirkungsdividende und Wirkungsfonds.",
        "kicker": "Für wen · Wirkungsrente",
        "subtitle": "Von Erwerbsbiografie zu Wirkungsbiografie.",
        "status": "Konzeptstand / Modellrechnung. Keine Leistungszusage.",
        "sensitive": True,
        "noindex": True,
        "tags": "Wirkungsrente, Wirkungsbiografie, Wirkungsfonds, Wirkungspunkte, Basisrente, Wirkungsdividende",
        "hero": [
            "Das alte Rentensystem fragt vor allem: Wie lange hast du gearbeitet und wie viel hast du verdient?",
            "Die Wirkungsrente fragt zusätzlich: Welche Wirkung hat dein Leben über die Zeit erzeugt?",
            "Sie ersetzt nicht Würde, Solidarität oder den Generationenvertrag. Sie erweitert den Maßstab: von Erwerbsbiografie zu Wirkungsbiografie.",
        ],
        "why": [
            "Konzeptstand. Diese Seite zeigt Wirkungslogik und Modellrechnung. Keine Leistungszusage, keine finale gesetzliche oder fiskalische Bewertung.",
            "Das heutige Rentensystem misst Einkommen, Beitragsjahre und Erwerbsbiografie. Es misst nicht ausreichend gesellschaftliche Wirkung.",
            "Pflege, Bildung, Care, Gemeinwesen, Prävention, Demokratiearbeit, ökologische Regeneration und Transformationsarbeit sind systemisch tragend, aber häufig niedriger bezahlt.",
            "Gleichzeitig schwächen Automatisierung, KI und neue Wertschöpfungsformen Erwerbsarbeit als alleinige Finanzierungsbasis. Produktivität steigt, aber sie fließt nicht automatisch in Beiträge und Alterssicherung.",
        ],
        "faults": [
            {"title": "Erwerbsbiografie als Engführung", "text": "Alte Logik: Erwerbsarbeit -> Einkommen -> Beiträge -> Rentenpunkte -> Rentenzahlung."},
            {"title": "Care und Gemeinwesen unsichtbar", "text": "Gesellschaftliche Stabilitätsleistungen werden nur begrenzt als Wirkung sichtbar."},
            {"title": "Kapital ohne Wirkung", "text": "Kapitaldeckung kann Zukunft stabilisieren oder Zukunftslast finanzieren."},
        ],
        "shift": [
            "Wirkungslogik: Lebenswirkung -> Erwerbsarbeit + Care + Bildung + Pflege + Gemeinwesen + Prävention + Transformation -> Wirkungsbiografie -> Basisrente + Wirkungsdividende + Wirkungsfonds -> Alterssicherung.",
            "Die drei Bausteine sind Basisrente, Wirkungsdividende und Wirkungsfonds / Impact-Fonds.",
            "Arbeitsformel: Wirkungspunkte = Einkommenspunkte x Wirkungsfaktor x Wirkungsjahre x Gewichtung x Lernfaktor. Wirkungsdividende = Basisrente x (Wirkungspunkte / 100).",
            "Wirkungsrente = Basisrente + Wirkungsdividende + Fondsanteil.",
        ],
        "gains": [
            "Erwerbsarbeit, Care, Ehrenamt, Transformationszeiten und gesellschaftliche Wirkleistungen werden begrifflich sichtbar.",
            "Kapitaldeckung wird nach Wirkung gelesen.",
            "Basisrente, Wirkungsdividende und Fondsanteil können als Modellbausteine unterschieden werden.",
            "Generationenvertrag und Automatisierung werden gemeinsam gedacht.",
        ],
        "not": [
            {"title": "Keine moralische Lebensbewertung", "text": "Keine Personenbewertung und kein Social Credit."},
            {"title": "Keine fertige Finanzarchitektur", "text": "Keine finale gesetzliche oder fiskalische Bewertung ohne Modellprüfung."},
            {"title": "Keine individuelle Leistungszusage", "text": "Alle Zahlen sind Modellrechnung, wenn sie nicht ausdrücklich freigegeben sind."},
        ],
        "path": ["Lebenswirkung", "Erwerbsarbeit + Care + Bildung + Pflege + Gemeinwesen + Prävention + Transformation", "Wirkungsbiografie", "Basisrente", "Wirkungsdividende", "Wirkungsfonds", "Alterssicherung"],
        "example": "Pflegekraft Anna: Einkommen 35.000 Euro, Durchschnittseinkommen 50.000 Euro, Einkommenspunkte 0,7, Wirkungsfaktor +2,5, Wirkungsjahre 40, Gewichtung 1,2, Lernfaktor 1,1. Wirkungspunkte = 92,4. Wirkungsdividende = 1.108,80 Euro. Modellrente = 2.308,80 Euro, gerundet ca. 2.310 Euro. Modellrechnung, keine Leistungszusage.",
        "visual": {"title": "Von Erwerbsbiografie zu Wirkungsbiografie", "text": "Drei Bausteine: Basisrente + Wirkungsdividende + Wirkungsfonds. Ergänzend eine ruhige Modellgrafik mit Beispielrechnung."},
        "sources": ["Die neue Ordnung des Wohlstands, Kapitel Wirkungsrente, Wirkungseinkommen, Kapitalmärkte und Fonds", "WP_Rente", "Arbeitspapier Wirkungseinkommensteuer"],
        "links": [("Wirkungseinkommen verstehen", "wirkungseinkommen.html"), ("Rentenrechner", "#rechner"), ("Wirkungsfonds", "investoren.html"), ("Wissenschaft & Forschung", "wissenschaft-forschung.html")],
        "calculator": "rente",
    },
}


HUB_CARDS = [
    ("journalismus.html", "Journalismus", "Aufmerksamkeit und Faktencheck reichen nicht, wenn Frames Resonanzräume erzeugen.", "Faktencheck wird um Wirkungsanalyse ergänzt.", "Mehr Quellenklarheit, demokratische Verantwortung und Wirkungskompetenz."),
    ("unternehmen.html", "Unternehmen", "KPI- und Kapitalsteuerung zeigen Bewegung, aber nicht Richtung.", "Unternehmen werden als Wirkungssysteme geführt.", "Resiliente Wertschöpfung, bessere Führung, Wirkung als Managementlogik."),
    ("politik.html", "Politik", "Beschlüsse und Haushalte zeigen Aktivität, aber nicht automatisch Wirkung.", "Politik wird zur Rückkopplungsarchitektur.", "Mehr Prävention, weniger Reparaturbürokratie, transparentere Wirkung."),
    ("buergerinnen.html", "Bürger:innen", "Menschen sollen moralisch kompensieren, was das System falsch signalisiert.", "Wirkung wird in Preisen, Produkten, Medien und Politik sichtbarer.", "Orientierung statt Schuldgefühl."),
    ("mieter.html", "Mieter:innen / Wohnen", "Wohnraum wird als Anlageklasse gelesen, obwohl er Lebensgrundlage ist.", "Wohnen wird als Wirkungsraum bewertet.", "Bezahlbarkeit, Gesundheit, Energie, Quartier und Demokratie werden zusammen sichtbar."),
    ("investoren.html", "Investor:innen", "Rendite zeigt nicht, welche Richtung Kapital verstärkt.", "Kapital wird als Wirkungskraft und Risikowahrheit gelesen.", "Resilientere Portfolios und bessere Transformationsprüfung."),
    ("kommunen.html", "Kommunen", "Projekt- und Ressortlogik verdecken lokale Mehrfachwirkung.", "Kommunen werden als reale Wirkungsräume gesteuert.", "Bessere Priorisierung knapper Mittel und sichtbare Prävention."),
    ("akademie.html", "Akademie", "Wissen allein erzeugt noch keine Wirkungskompetenz.", "Lernen folgt Wirkungspfaden, Quellen, Daten und Rückkopplung.", "Urteilskraft für komplexe Gesellschaften."),
    ("wissenschaft-forschung.html", "Wissenschaft & Forschung", "Publikationen und Drittmittel zeigen nicht automatisch gesellschaftliche Wirkung.", "Wissenschaft wird als Wirkungsinfrastruktur gelesen.", "Bessere Korrekturfähigkeit, Unsicherheitssprache und Datenqualität."),
    ("gesundheit.html", "Gesundheit", "Krankheit wird besser bezahlt als verhinderte Krankheit.", "Gesundheit wird als Systemwirkung gesteuert.", "Prävention, Pflege, Arbeit, Wohnen und Kommunen werden verbunden."),
    ("rente.html", "Rente", "Einzahlung und Erwerbsbiografie messen nicht jede gesellschaftliche Stabilitätsleistung.", "Die Wirkungsrente erweitert zur Wirkungsbiografie.", "Basisrente, Wirkungsdividende und Wirkungsfonds als Modelllogik."),
    ("wirkungseinkommen.html", "Wirkungseinkommen", "Automatisierung löst Produktivität von Erwerbsarbeit.", "Einkommen wird als Wirkungsarchitektur gedacht.", "Grunddividende, Markteinkommen und Wirkungsbonus als Konzeptmodell."),
]


def render_page(slug: str, page: dict[str, object]) -> str:
    sections = [
        f"""<section class="hero">
          <div>
            <p class="hero-kicker">{e(page["kicker"])}</p>
            <h1 class="hero-title">{e(page["title"])}</h1>
            <p class="hero-subtitle">{e(page["subtitle"])}</p>
            {paragraphs(page["hero"])}
            {status_notice(page)}
          </div>
        </section>""",
        f"""<section class="section">
          <div class="why-block">
            <p class="hero-kicker">Warum diese Perspektive wichtig ist</p>
            <h2>Zuerst die Maßstabskrise</h2>
            {paragraphs(page["why"])}
          </div>
        </section>""",
        f"""<section class="section section-muted">
          <div class="section-header"><p class="hero-kicker">Was heute falsch läuft</p><h2>Welche Fehlsteuerung das alte System produziert</h2></div>
          {cards(page["faults"])}
        </section>""",
        f"""<section class="section">
          <div class="why-block">
            <p class="hero-kicker">Warum Reparatur nicht reicht</p>
            <h2>{e(WHY_NOT_HEADINGS.get(slug, "Warum Reparatur allein nicht reicht"))}</h2>
            {why_not_enough(page, slug)}
          </div>
        </section>""",
        f"""<section class="section">
          <div class="section-header"><p class="hero-kicker">WÖk-Verschiebung</p><h2>Was die Wirkungsökonomie grundlegend verändert</h2>{paragraphs(page["shift"])}</div>
        </section>""",
        f"""<section class="section section-muted">
          <div class="section-header"><p class="hero-kicker">Konkreter Gewinn</p><h2>Was diese Perspektive gewinnt</h2></div>
          {bullet_list(page["gains"])}
        </section>""",
        f"""<section class="section">
          <div class="section-header"><p class="hero-kicker">Was nicht passiert</p><h2>Keine Ersatzmoral, keine Personenbewertung</h2></div>
          {cards(page["not"])}
        </section>""",
        f"""<section class="section section-muted">
          <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Wie Wirkung rückgekoppelt wird</h2></div>
          {path(page["path"])}
        </section>""",
        f"""<section class="section">
          <div class="example-box"><p class="hero-kicker">Konkretes Beispiel</p><h2>Die Logik im Anwendungsfall</h2><p>{e(page["example"])}</p></div>
        </section>""",
        visual_brief(slug, page["visual"]),
        calculator(str(page.get("calculator", ""))),
        f"""<section class="section section-muted">
          <div class="compass-box">
            <p class="hero-kicker">Vertiefung</p>
            <h2>Weiterdenken im WÖk-System</h2>
            <p>Die nächste Frage lautet nicht, wie diese Zielgruppe nachhaltiger wird. Sie lautet: Welche alte Steuerungslogik erzeugt das Problem, und wie verändert Wirkung die Logik selbst?</p>
            {buttons(page["links"])}
          </div>
        </section>""",
        f'<section class="section">{source_panel(page)}</section>',
    ]
    return "\n".join(section for section in sections if section)


def render_hub() -> str:
    cards_html = "".join(
        f"""<a class="card target-card" href="{e(href)}">
          <h3 class="card-title">{e(title)}</h3>
          <dl>
            <div><dt>Problem heute</dt><dd>{e(problem)}</dd></div>
            <div><dt>WÖk-Verschiebung</dt><dd>{e(shift)}</dd></div>
            <div><dt>Konkreter Nutzen</dt><dd>{e(benefit)}</dd></div>
          </dl>
        </a>"""
        for href, title, problem, shift, benefit in HUB_CARDS
    )
    return f"""<section class="hero">
      <div>
        <p class="hero-kicker">Für wen · Zielgruppen</p>
        <h1 class="hero-title">Was bedeutet die Wirkungsökonomie für mich?</h1>
        <p class="hero-subtitle">Die Wirkungsökonomie ist kein abstraktes Modell. Sie verändert, wie Unternehmen führen, wie Politik steuert, wie Bürger:innen Preise verstehen, wie Kommunen planen, wie Journalismus Wirkung analysiert und wie Kapital Risiken bewertet.</p>
        <div class="why-formula"><strong>Was läuft heute falsch?</strong><span>Und wie verändert Wirkung die Logik?</span></div>
      </div>
    </section>
    <section class="section">
      <div class="why-block">
        <p class="hero-kicker">Warum diese Perspektiven wichtig sind</p>
        <h2>Nicht Zielgruppen-Marketing, sondern systemische Übersetzung.</h2>
        <p>Jede Perspektive beginnt mit derselben Frage: Was misst das alte System falsch, welche Schäden entstehen daraus, warum reicht Reparatur nicht und welche Steuerungslogik verändert die WÖk?</p>
      </div>
    </section>
    <section class="section section-muted">
      <div class="section-header"><p class="hero-kicker">Einstiege</p><h2>Problem → WÖk-Verschiebung → Nutzen</h2></div>
      <div class="card-grid">{cards_html}</div>
    </section>"""


def shell(slug: str, title: str, description: str, tags: str, body: str, noindex: bool) -> str:
    robots = '<meta name="robots" content="noindex, nofollow">' if noindex else ""
    return f"""<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{e(title)}</title>
    <meta name="description" content="{e(description)}">
    <link rel="canonical" href="https://wirkungsoekonomie.de/fuer/{e(slug)}">
    {robots}
    <meta name="search_title" content="{e(title)}">
    <meta name="search_description" content="{e(description)}">
    <meta name="search_type" content="Zielgruppenseite">
    <meta name="search_section" content="Für wen">
    <meta name="search_tags" content="{e(tags)}">
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../assets/css/style.css">
  </head>
  <body>
{sync_layout.render(sync_layout.HEADER_TEMPLATE, "../")}
    <main data-pagefind-body>
{body}
    </main>
{sync_layout.render(sync_layout.FOOTER_TEMPLATE, "../")}
    <script src="../assets/js/main.js?v=20260612-mobile-headline-fix"></script>
  </body>
</html>"""


def write_page(slug: str, title: str, description: str, tags: str, body: str, noindex: bool) -> None:
    output = shell(slug, title, description, tags, body, noindex)
    output = "\n".join(line.rstrip() for line in output.splitlines()) + "\n"
    (FUER / slug).write_text(output, encoding="utf-8")


def main() -> None:
    write_page(
        "index.html",
        "Was bedeutet die Wirkungsökonomie für mich?",
        "Der Zielgruppenbereich übersetzt die Wirkungsökonomie systemisch: Problem, Fehlsteuerung, WÖk-Verschiebung und konkreter Nutzen.",
        "Zielgruppen, Unternehmen, Politik, Bürger:innen, Wohnen, Kapitalwirkung, Kommunen, Akademie, Wissenschaft, Gesundheit, Rente, Wirkungseinkommen",
        render_hub(),
        False,
    )
    for slug, page in PAGES.items():
        write_page(
            slug,
            str(page["title"]),
            str(page["meta"]),
            str(page["tags"]),
            render_page(slug, page),
            bool(page.get("noindex", False)),
        )


if __name__ == "__main__":
    main()

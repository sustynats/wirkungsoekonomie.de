#!/usr/bin/env python3
"""Generate controlled Sprint 1 WÖk SVG visuals and the visual registry."""

from __future__ import annotations

import json
import textwrap
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

NAVY = "#0B1B36"
IVORY = "#F7F4EC"
GREEN = "#2D7F5F"
GOLD = "#C9932E"
CORAL = "#C95749"
LINE = "#D7D0C1"
TEXT = "#2E333C"

STYLE = f"""
.bg{{fill:{IVORY}}}.navy{{fill:{NAVY}}}.green{{fill:{GREEN}}}.gold{{fill:{GOLD}}}.coral{{fill:{CORAL}}}.text{{fill:{TEXT}}}
.line{{stroke:{LINE};stroke-width:2;fill:none}}.nline{{stroke:{NAVY};stroke-width:2.3;fill:none}}.gline{{stroke:{GREEN};stroke-width:2.3;fill:none}}.oline{{stroke:{GOLD};stroke-width:2.3;fill:none}}.cline{{stroke:{CORAL};stroke-width:2.3;fill:none}}
.card{{fill:#fffdfa;stroke:{LINE};stroke-width:2}}.softn{{fill:#EEF2F7;stroke:{NAVY};stroke-width:2}}.softg{{fill:#EAF3EE;stroke:{GREEN};stroke-width:2}}.softo{{fill:#F7EEDC;stroke:{GOLD};stroke-width:2}}.softc{{fill:#F7E6E2;stroke:{CORAL};stroke-width:2}}
.title{{font-family:Georgia,'Times New Roman',serif;font-size:54px;font-weight:700;letter-spacing:3.2px}}.subtitle{{font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:.8px}}
.kicker{{font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase}}.h{{font-family:Inter,Arial,sans-serif;font-size:23px;font-weight:800}}.body{{font-family:Inter,Arial,sans-serif;font-size:17px}}.small{{font-family:Inter,Arial,sans-serif;font-size:14px}}.num{{font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700}}
"""


def lines(text: str, x: int, y: int, width: int, cls: str = "body text", line_h: int = 24, max_lines: int = 4) -> str:
    wrap = max(18, width // 9)
    return "\n".join(
        f'<text x="{x}" y="{y + i * line_h}" class="{cls}">{escape(line)}</text>'
        for i, line in enumerate(textwrap.wrap(text, width=wrap)[:max_lines])
    )


def shell(width: int, height: int, title: str, desc: str, inner: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
  <title id="title">{escape(title)}</title>
  <desc id="desc">{escape(desc)}</desc>
  <defs>
    <style>{STYLE}</style>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M2 2 L10 6 L2 10 Z" fill="{GOLD}"/></marker>
  </defs>
  <rect class="bg" width="{width}" height="{height}"/>
  <rect x="28" y="28" width="{width - 56}" height="{height - 56}" rx="18" fill="none" stroke="{LINE}" stroke-width="2"/>
  {inner}
</svg>
"""


def heading(title: str, subtitle: str, width: int = 1800) -> str:
    return f"""
  <text x="{width // 2}" y="88" class="title navy" text-anchor="middle">{escape(title)}</text>
  <text x="{width // 2}" y="128" class="subtitle gold" text-anchor="middle">{escape(subtitle)}</text>
  <line x1="150" y1="154" x2="{width - 150}" y2="154" class="line"/>
"""


def card_class(tone: str) -> str:
    return {"navy": "softn", "green": "softg", "gold": "softo", "coral": "softc"}.get(tone, "card")


def desktop_visual(item: dict[str, object]) -> str:
    title = str(item["title"])
    subtitle = str(item["subtitle"])
    nodes = list(item["nodes"])
    chunks = [heading(title, subtitle)]
    cols = 3
    card_w = 470
    card_h = 150
    gap_x = 55
    gap_y = 60
    start_x = 145
    start_y = 235
    for i, node in enumerate(nodes):
        head, body, tone = node
        row, col = divmod(i, cols)
        x = start_x + col * (card_w + gap_x)
        y = start_y + row * (card_h + gap_y)
        chunks.append(f'<rect x="{x}" y="{y}" width="{card_w}" height="{card_h}" rx="18" class="{card_class(tone)}"/>')
        chunks.append(f'<text x="{x + 26}" y="{y + 43}" class="num {tone if tone in ["green", "gold", "coral"] else "navy"}">{i + 1}</text>')
        chunks.append(f'<text x="{x + 78}" y="{y + 43}" class="h navy">{escape(str(head))}</text>')
        chunks.append(lines(str(body), x + 26, y + 82, card_w - 56, "body text", 23, 3))
        if i < len(nodes) - 1:
            if col < cols - 1:
                chunks.append(f'<line x1="{x + card_w}" y1="{y + card_h / 2:.0f}" x2="{x + card_w + gap_x - 16}" y2="{y + card_h / 2:.0f}" class="oline" marker-end="url(#arrow)"/>')
    footer_y = 900 if len(nodes) <= 9 else 1010
    chunks.append(f'<rect x="145" y="{footer_y}" width="1510" height="92" rx="18" class="card"/>')
    chunks.append(lines(str(item["footer"]), 190, footer_y + 39, 1410, "body navy", 25, 2))
    return shell(1800, footer_y + 150, title, subtitle, "\n".join(chunks))


def mobile_visual(item: dict[str, object]) -> str:
    title = str(item["title"])
    subtitle = str(item["subtitle"])
    nodes = list(item["nodes"])
    chunks = [
        f'<text x="450" y="74" class="title navy" text-anchor="middle">{escape(title)}</text>',
        f'<text x="450" y="116" class="subtitle gold" text-anchor="middle">{escape(subtitle)}</text>',
        '<line x1="70" y1="146" x2="830" y2="146" class="line"/>',
    ]
    y = 190
    for i, node in enumerate(nodes):
        head, body, tone = node
        chunks.append(f'<rect x="74" y="{y}" width="752" height="120" rx="18" class="{card_class(str(tone))}"/>')
        chunks.append(f'<text x="108" y="{y + 44}" class="num {tone if tone in ["green", "gold", "coral"] else "navy"}">{i + 1}</text>')
        chunks.append(f'<text x="160" y="{y + 44}" class="h navy">{escape(str(head))}</text>')
        chunks.append(lines(str(body), 160, y + 78, 590, "small text", 20, 2))
        y += 142
    chunks.append(f'<rect x="74" y="{y + 16}" width="752" height="102" rx="18" class="card"/>')
    chunks.append(lines(str(item["footer"]), 108, y + 58, 650, "small navy", 21, 3))
    return shell(900, y + 158, title, subtitle, "\n".join(chunks))


VISUALS: list[dict[str, object]] = [
    {
        "id": "woek_modell_auf_einen_blick_v2",
        "file": "assets/visuals/model/woek_modell_auf_einen_blick_v2.svg",
        "type": "model",
        "page": ["/", "/modell.html", "/kompass.html"],
        "title": "DIE WIRKUNGSÖKONOMIE AUF EINEN BLICK",
        "subtitle": "Wohlstand neu messen · Wirkung zurückkoppeln · Zukunft sichern",
        "nodes": [
            ("Alte Ordnung", "Kapital, Gewinn, Wachstum und Reichweite messen Bewegung, nicht Richtung.", "navy"),
            ("Neue Ordnung", "Wirkung ist die tatsächliche Veränderung von Zuständen: positiv, negativ oder neutral.", "green"),
            ("Bewertungsräume", "Mensch, Planet und Demokratie bilden die Räume der WÖk-Bewertung.", "gold"),
            ("Zielgröße", "positive Netto-Wirkung wird zur gemeinsamen Zielgröße.", "green"),
            ("Mechanik", "Daten -> WÖk-ID -> Scorecard -> Schutzregel -> Wirkungsklasse -> Rückkopplung -> Lernen.", "navy"),
            ("Rückkopplung", "Preise, Steuern, Kapital, Haushalte, Beschaffung, Management und Innovation reagieren.", "green"),
            ("Schutzregeln", "Keine Schönrechnung, keine Personenbewertung, keine Kompensation kritischer Schäden.", "coral"),
            ("Wirkungsrat", "Lernende Kontrolle hält Begriffe, Daten und Rückkopplung prüfbar.", "gold"),
        ],
        "footer": "Markt bleibt. Eigentum bleibt. Wettbewerb bleibt. Gewinn bleibt. Aber der Kompass ändert sich.",
        "alt": "Modellgrafik der Wirkungsökonomie mit Maßstabswechsel, Bewertungsräumen, Mechanik, Rückkopplung und Schutzregeln.",
        "caption": "Das Modell zeigt die Grundlogik der Wirkungsökonomie: Wirkung wird als tatsächliche Zustandsveränderung verstanden, bewertet und in Entscheidungen zurückgekoppelt.",
    },
    {
        "id": "woek_wirkungskreislauf_stufen",
        "file": "assets/visuals/model/woek_wirkungskreislauf_stufen.svg",
        "type": "model",
        "page": ["/modell.html", "/wissen/wirkung.html", "/wissen/wirkungsoekonomie-funktionsweise.html"],
        "title": "DER WIRKUNGSKREISLAUF",
        "subtitle": "Wirkung wird lernfähig",
        "nodes": [
            ("Auslöser", "Handlung, Produkt, Gesetz, Preis, Narrativ oder Kapitalfluss.", "navy"),
            ("Wirkungspotenzial", "Möglichkeit positiver, negativer oder ambivalenter Wirkung.", "gold"),
            ("Wirkmechanismus", "Wie aus Möglichkeit tatsächliche Veränderung werden kann.", "navy"),
            ("Zustandsveränderung", "Was sich bei Mensch, Planet oder Demokratie tatsächlich verändert.", "green"),
            ("Wirkungsbewertung", "Einordnung am Rahmen SDGs, Agenda 2030 und SDG+.", "navy"),
            ("Netto-Wirkung", "Positive und negative Wirkungen werden zusammen gelesen.", "gold"),
            ("Wirkungslenkung", "Bewertung wird entscheidungsrelevant.", "green"),
            ("Rückkopplung", "Preise, Steuern, Kapital, Haushalt und Management reagieren.", "green"),
            ("Lernen", "Daten, Evaluation, Wirkungsrat und Anpassung schließen den Kreis.", "navy"),
        ],
        "footer": "Wirkung ist nicht Absicht, nicht Image und nicht Output. Wirkung ist tatsächliche Zustandsveränderung.",
        "alt": "Neunstufiger Wirkungskreislauf von Auslöser bis Lernen mit Wirkung als tatsächlicher Zustandsveränderung.",
        "caption": "Der Wirkungskreislauf zeigt, wie Wirkungspotenzial, Zustandsveränderung, Bewertung, Rückkopplung und Lernen verbunden werden.",
    },
    {
        "id": "woek_wirkung_vs_wirkungspotenzial",
        "file": "assets/visuals/model/woek_wirkung_vs_wirkungspotenzial.svg",
        "type": "model",
        "page": ["/modell.html", "/glossar.html", "/kompass.html"],
        "title": "WIRKUNG ≠ WIRKUNGSPOTENZIAL",
        "subtitle": "Begriffe sauber trennen",
        "nodes": [
            ("Wirkungspotenzial", "Möglichkeit, dass positive, negative oder ambivalente Wirkung entsteht.", "gold"),
            ("Wirkmechanismus", "Der Pfad, über den Möglichkeit zu Veränderung werden kann.", "navy"),
            ("Wirkung", "Eingetretene tatsächliche Zustandsveränderung.", "green"),
            ("Wirkungsbewertung", "Einordnung am Rahmen SDGs, Agenda 2030 und SDG+.", "navy"),
            ("Netto-Wirkung", "Zusammengeführte Bewertung mit Schutzregeln.", "green"),
        ],
        "footer": "Wirkungspotenzial ist noch keine Wirkung. Bewertet wird die tatsächliche Zustandsveränderung.",
        "alt": "Grafik zur Unterscheidung von Wirkungspotenzial, Wirkung, Wirkungsbewertung und Netto-Wirkung.",
        "caption": "Die Grafik trennt Möglichkeit, eingetretene Veränderung und Bewertung im Referenzrahmen der WÖk.",
    },
    {
        "id": "woek_reverse_merit_order_schutzregel",
        "file": "assets/visuals/model/woek_reverse_merit_order_schutzregel.svg",
        "type": "model",
        "page": ["/modell.html", "/anwendungen.html", "/fuer/unternehmen.html", "/fuer/politik.html"],
        "title": "REVERSE MERIT ORDER",
        "subtitle": "Das schwächste kritische Feld entscheidet",
        "nodes": [
            ("Mensch", "Gesundheit, Arbeit, Würde und Teilhabe dürfen nicht verdeckt werden.", "green"),
            ("Planet", "Klima, Ressourcen, Biodiversität und Regeneration bleiben eigene Grenzen.", "green"),
            ("Demokratie", "Vertrauen, Rechtsstaat und Diskursfähigkeit sind Schutzräume.", "gold"),
            ("Schutzregel", "Gute Einzelwerte dürfen kritische Schäden nicht überdecken.", "coral"),
            ("Keine Kompensation", "Kritische Schäden werden nicht durch andere Pluspunkte ausgeglichen.", "coral"),
        ],
        "footer": "Die Gesamtbewertung folgt nicht dem Durchschnitt, sondern dem schwächsten kritischen Wirkungsfeld.",
        "alt": "Reverse-Merit-Order-Grafik mit Mensch, Planet, Demokratie und Schutzregel gegen Kompensation kritischer Schäden.",
        "caption": "Die Schutzregel verhindert Schönrechnung: Kritische Schäden bleiben sichtbar.",
    },
    {
        "id": "woek_unternehmen_wirkungssystem",
        "file": "assets/visuals/explainers/woek_unternehmen_wirkungssystem.svg",
        "type": "explainer",
        "page": ["/fuer/unternehmen.html"],
        "title": "UNTERNEHMEN ALS WIRKUNGSSYSTEM",
        "subtitle": "Führung · Kultur · Wertschöpfung",
        "nodes": [
            ("Führung", "Führung setzt Richtung, Sicherheit, Verantwortung und Lernfähigkeit.", "navy"),
            ("Kultur", "Kultur entscheidet, ob Risiken sichtbar werden oder verschwiegen bleiben.", "green"),
            ("Entscheidungen", "Strategie, Einkauf, CAPEX, OPEX und Vergütung erzeugen Wirkung.", "gold"),
            ("Produkte", "Produkte tragen Wirkung in Märkte, Alltag und Lieferketten.", "green"),
            ("Lieferketten", "Wasser, Arbeit, Energie, Material und Risiko werden Teil der Steuerung.", "navy"),
            ("Kapital", "Kapital bleibt Werkzeug und wird nach Wirkung zurückgekoppelt.", "gold"),
            ("Kommunikation", "Sprache, Marke und Öffentlichkeit erzeugen Resonanzräume.", "navy"),
            ("Innovation", "Innovation zählt, wenn sie Resilienz und positive Netto-Wirkung stärkt.", "green"),
        ],
        "footer": "Führung wirkt. Entscheidungen wirken. Wertschöpfung wirkt.",
        "alt": "Grafik Unternehmen als Wirkungssystem mit Führung, Kultur, Entscheidungen, Produkten, Lieferketten, Kapital, Kommunikation und Innovation.",
        "caption": "Unternehmen werden nicht als ESG-Berichtseinheiten gelesen, sondern als Wirkungssysteme.",
    },
    {
        "id": "woek_politik_reparaturstaat_wirkungsarchitektur",
        "file": "assets/visuals/explainers/woek_politik_reparaturstaat_wirkungsarchitektur.svg",
        "type": "explainer",
        "page": ["/fuer/politik.html"],
        "title": "VOM REPARATURSTAAT ZUR WIRKUNGSARCHITEKTUR",
        "subtitle": "Früher prüfen · besser rückkoppeln",
        "nodes": [
            ("Falsche Preise", "Wenn Wirkung fehlt, senden Märkte und Steuern falsche Signale.", "coral"),
            ("Schäden", "Folgekosten werden spät sichtbar: Klima, Wohnen, Gesundheit, Vertrauen.", "coral"),
            ("Bürokratie", "Förderprogramme, Sonderregeln und Nachweise reparieren verspätet.", "gold"),
            ("Wirkungsprüfung", "Maßnahmen werden vorab nach Wirkpfad und Zielkonflikt gelesen.", "green"),
            ("Wirkungshaushalt", "Ausgaben werden nach Prävention und Netto-Wirkung betrachtet.", "green"),
            ("Wirkungssteuer", "Anreize verändern sich dort, wo Schäden entstehen.", "navy"),
            ("Rückkopplung", "Recht, Haushalt, Beschaffung und Evaluation lernen gemeinsam.", "green"),
            ("Vertrauen", "Politik wird nachvollziehbarer, weil Wirkung sichtbar wird.", "gold"),
        ],
        "footer": "Alte Politik repariert Folgen. Wirkungsorientierte Politik verändert die Anreize, die Folgen erzeugen.",
        "alt": "Grafik vom Reparaturstaat zur Wirkungsarchitektur mit falschen Preisen, Schäden, Bürokratie, Wirkungsprüfung, Wirkungshaushalt, Wirkungssteuer und Rückkopplung.",
        "caption": "Die Grafik zeigt Politik als Rückkopplungsarchitektur statt als späte Reparaturmaschine.",
    },
    {
        "id": "woek_buergerinnen_bessere_signale",
        "file": "assets/visuals/explainers/woek_buergerinnen_bessere_signale.svg",
        "type": "explainer",
        "page": ["/fuer/buergerinnen.html"],
        "title": "VON ÜBERFORDERUNG ZU BESSEREN SIGNALEN",
        "subtitle": "Orientierung statt Schuldgefühl",
        "nodes": [
            ("Falsche Preise", "Schädliche Wirkung kann billig erscheinen, wenn Folgekosten fehlen.", "coral"),
            ("Unklare Wirkung", "Produkt-, Medien- und Politikwirkung bleiben oft unsichtbar.", "gold"),
            ("Moralischer Druck", "Einzelne sollen kompensieren, was das System falsch steuert.", "coral"),
            ("Sichtbare Wirkung", "Wirkung wird als Zustandsveränderung lesbar.", "green"),
            ("Ehrlichere Preise", "Rückkopplung verändert Signale statt nur Appelle.", "green"),
            ("Kompass", "Menschen erhalten Orientierung ohne Personenbewertung.", "navy"),
            ("Handlungsfähigkeit", "Bessere Signale machen Alltag und Demokratie verstehbarer.", "gold"),
        ],
        "footer": "Die WÖk bewertet nicht den Menschen, sondern die Wirkung von Produkten, Systemen, Entscheidungen und Kommunikation.",
        "alt": "Grafik von moralischer Überforderung zu besseren Signalen für Bürgerinnen und Bürger.",
        "caption": "Die Wirkungsökonomie entlastet Bürger:innen von moralischer Einzelüberforderung.",
    },
    {
        "id": "woek_wohnen_wirkungsraum",
        "file": "assets/visuals/explainers/woek_wohnen_wirkungsraum.svg",
        "type": "explainer",
        "page": ["/fuer/mieter.html"],
        "title": "WOHNEN ALS WIRKUNGSRAUM",
        "subtitle": "Mehr als Miete und Rendite",
        "nodes": [
            ("Bezahlbarkeit", "Miete, Sicherheit und Verdrängungsrisiko prägen Lebensgrundlagen.", "green"),
            ("Gesundheit", "Schimmel, Hitze, Lärm, Licht und Luft wirken auf Menschen.", "green"),
            ("Energie", "Sanierung, Verbrauch und Mieterstrom verbinden Klima und Kosten.", "gold"),
            ("Quartier", "Lage, Infrastruktur, Begegnung und Pflege erzeugen Raumwirkung.", "navy"),
            ("Teilhabe", "Wohnraum entscheidet über Bildung, Arbeit, Wege und Sicherheit.", "green"),
            ("Vertrauen", "Stabile Nachbarschaften stärken demokratische Alltagsinfrastruktur.", "gold"),
            ("Demokratie", "Wohnen wirkt auf Zugehörigkeit, Konflikt und soziale Stabilität.", "navy"),
        ],
        "footer": "Wohnen ist mehr als Anlageklasse. Wohnen ist Wirkungsraum.",
        "alt": "Grafik Wohnen als Wirkungsraum mit Bezahlbarkeit, Gesundheit, Energie, Quartier, Teilhabe, Vertrauen und Demokratie.",
        "caption": "Wohnraum wird als Wirkungsraum für Mensch, Planet und Demokratie lesbar.",
    },
    {
        "id": "woek_kapitalwirkung_investoren",
        "file": "assets/visuals/explainers/woek_kapitalwirkung_investoren.svg",
        "type": "explainer",
        "page": ["/fuer/investoren.html"],
        "title": "KAPITALWIRKUNG",
        "subtitle": "Kapital als Verstärker von Richtung",
        "nodes": [
            ("Rendite ohne Wirkung", "Kurzfristige Rendite kann langfristige Wirkungsrisiken verdecken.", "coral"),
            ("Kapitalwirkung", "Kapital verstärkt, was es finanziert.", "navy"),
            ("Resilienz", "Portfolios werden nach Zukunftsfähigkeit und Systemrisiko gelesen.", "green"),
            ("T-SROI", "Transformationswirkung ergänzt klassische Wirtschaftlichkeit.", "gold"),
            ("Positive Netto-Wirkung", "Finanzierung stärkt Mensch, Planet und Demokratie.", "green"),
            ("Hinweis", "Diese Logik ist keine Anlageberatung.", "navy"),
        ],
        "footer": "Kapital bleibt Werkzeug. Der Kompass ist Wirkung.",
        "alt": "Kapitalwirkungsgrafik für Investorinnen und Investoren mit Rendite, Risiko, Resilienz, T-SROI und positiver Netto-Wirkung.",
        "caption": "Kapital wird als Verstärker von Richtung und als Rückkopplungssystem verstanden.",
    },
    {
        "id": "woek_kommunen_lokale_wirkungsraeume",
        "file": "assets/visuals/explainers/woek_kommunen_lokale_wirkungsraeume.svg",
        "type": "explainer",
        "page": ["/fuer/kommunen.html"],
        "title": "KOMMUNEN ALS WIRKUNGSRÄUME",
        "subtitle": "Wirkung beginnt vor Ort",
        "nodes": [
            ("Hitze", "Stadtklima, Schatten und Wasser werden zu Gesundheitsfragen.", "green"),
            ("Wasser", "Speicherung, Qualität und Starkregen verbinden Umwelt und Sicherheit.", "green"),
            ("Wohnen", "Bezahlbarkeit, Energie und Quartier wirken zusammen.", "gold"),
            ("Mobilität", "Wege verändern Klima, Gesundheit, Teilhabe und lokale Wirtschaft.", "navy"),
            ("Bildung", "Schulen sind Lern-, Ernährungs-, Integrations- und Demokratieorte.", "green"),
            ("Pflege", "Pflege wirkt auf Familien, Arbeit, Kommunen und Stabilität.", "gold"),
            ("Begegnung", "Parks, Kultur und Vereine sind demokratische Infrastruktur.", "green"),
            ("Wirkungshaushalt", "Mittel werden nach Mehrfachwirkung und Prävention sichtbar.", "navy"),
        ],
        "footer": "Ein kommunaler Haushalt ist nicht nur eine Ausgabenliste. Er ist ein Wirkungsinstrument.",
        "alt": "Grafik Kommunen als lokale Wirkungsräume mit Hitze, Wasser, Wohnen, Mobilität, Bildung, Pflege, Begegnung und Wirkungshaushalt.",
        "caption": "Kommunale Entscheidungen erzeugen Mehrfachwirkung in realen Lebensräumen.",
    },
    {
        "id": "woek_journalismus_faktencheck_wirkungsanalyse",
        "file": "assets/visuals/flows/woek_journalismus_faktencheck_wirkungsanalyse.svg",
        "type": "flow",
        "page": ["/fuer/journalismus.html"],
        "title": "FAKTENCHECK PLUS WIRKUNGSANALYSE",
        "subtitle": "Wahrheit schützen · Wirkung verstehen",
        "nodes": [
            ("Faktencheck", "Ist die Aussage wahr? Welche Quelle trägt sie?", "navy"),
            ("Frame", "Welche Deutung und welches Problemverständnis werden geöffnet?", "gold"),
            ("Resonanzraum", "Entsteht Angst, Vertrauen, Wut, Verantwortung oder Zugehörigkeit?", "gold"),
            ("Wirkungspotenzial", "Welche möglichen Wahrnehmungsverschiebungen entstehen?", "green"),
            ("Vertrauen", "Welche Wirkung auf Quellenklarheit und Öffentlichkeit ist plausibel?", "green"),
            ("Polarisierung", "Welche Zuspitzung kann demokratische Gegner zu Feinden machen?", "coral"),
            ("Demokratie", "Was passiert mit Diskursfähigkeit, Rechtsstaat und Teilhabe?", "navy"),
        ],
        "footer": "Wirkungsanalyse ist keine Zensur. Sie macht Wirkungspotenziale öffentlicher Kommunikation sichtbar.",
        "alt": "Flussgrafik Faktencheck plus Wirkungsanalyse mit Frame, Resonanzraum, Wirkungspotenzial, Vertrauen, Polarisierung und Demokratie.",
        "caption": "Journalismus gewinnt eine zweite Ebene: nicht nur Richtigkeit, sondern Wirkungspotenzial.",
    },
    {
        "id": "woek_akademie_lernpfad",
        "file": "assets/visuals/explainers/woek_akademie_lernpfad.svg",
        "type": "explainer",
        "page": ["/fuer/akademie.html", "/akademie.html"],
        "title": "LERNPFAD WIRKUNGSKOMPETENZ",
        "subtitle": "Verstehen · Bewerten · Zurückkoppeln",
        "nodes": [
            ("Verstehen", "Wirkung, Wirkungspotenzial und Zustandsveränderung unterscheiden.", "navy"),
            ("Bewerten", "SDGs, Agenda 2030 und SDG+ als Referenzrahmen lesen.", "green"),
            ("Zurückkoppeln", "Bewertung in Preise, Kapital, Haushalt und Entscheidungen übersetzen.", "gold"),
            ("Anwenden", "Produkte, Unternehmen, Politik und Medien als Wirkungsräume analysieren.", "green"),
            ("Umsetzen", "Praxisprojekte entwickeln, prüfen und lernfähig machen.", "navy"),
        ],
        "footer": "Ziel ist Wirkungskompetenz: Systemverständnis, Quellenklarheit und demokratische Urteilsfähigkeit.",
        "alt": "Lernpfad der WÖk-Akademie von Verstehen über Bewerten und Zurückkoppeln bis Anwenden und Umsetzen.",
        "caption": "Die Akademie übersetzt die WÖk in einen systemischen Lernpfad.",
    },
    {
        "id": "woek_wissenschaft_forschung",
        "file": "assets/visuals/explainers/woek_wissenschaft_forschung.svg",
        "type": "explainer",
        "page": ["/fuer/wissenschaft-forschung.html"],
        "title": "WISSENSCHAFT ALS WIRKUNGSINFRASTRUKTUR",
        "subtitle": "Theorie · Daten · Kritik",
        "nodes": [
            ("Theorie", "Begriffe, Modelle und Hypothesen machen Wirkungslogik prüfbar.", "navy"),
            ("Daten", "Datenqualität entscheidet, was sichtbar und korrigierbar wird.", "green"),
            ("Modelle", "Modelle helfen, Zielkonflikte und Systemhebel zu verstehen.", "gold"),
            ("Validierung", "Methoden, Replikation und Kritik schützen vor Scheinsicherheit.", "navy"),
            ("Anwendung", "Forschung wirkt in Politik, Unternehmen, Gesundheit und Bildung.", "green"),
            ("Transfer", "Wirkung braucht Übersetzung ohne Verlust wissenschaftlicher Freiheit.", "gold"),
        ],
        "footer": "Wissenschaft liefert bessere Korrekturverfahren, keine Herrschaft über Werte.",
        "alt": "Grafik Wissenschaft und Forschung als Wirkungsinfrastruktur mit Theorie, Daten, Modellen, Validierung, Anwendung und Transfer.",
        "caption": "Wissenschaft ist das methodische Rückgrat lernfähiger Wirkungssteuerung.",
    },
    {
        "id": "woek_gesundheit_wirkungssystem",
        "file": "assets/visuals/explainers/woek_gesundheit_wirkungssystem.svg",
        "type": "explainer",
        "page": ["/fuer/gesundheit.html"],
        "title": "GESUNDHEIT ALS SYSTEMWIRKUNG",
        "subtitle": "Prävention statt Reparatur",
        "nodes": [
            ("Prävention", "Gesundheit entsteht, bevor Krankheit repariert werden muss.", "green"),
            ("Pflege", "Pflege stabilisiert Menschen, Familien, Arbeit und Kommunen.", "gold"),
            ("Psychische Gesundheit", "Belastung, Sicherheit, Sinn und Beziehungen prägen Zustände.", "green"),
            ("Wohnumfeld", "Luft, Hitze, Lärm, Schimmel und Wege wirken auf Gesundheit.", "navy"),
            ("Ernährung", "Lebensmittelumfelder beeinflussen Krankheit und Teilhabe.", "green"),
            ("Arbeit", "Führung, Taktung, Sicherheit und Sinn erzeugen Gesundheitswirkung.", "gold"),
            ("Klima", "Hitze, Wasser, Luft und Naturzugang werden Gesundheitsfaktoren.", "green"),
            ("Soziale Beziehungen", "Einsamkeit und Vertrauen wirken wie Infrastruktur.", "navy"),
        ],
        "footer": "Gesundheit wird nicht nur behandelt. Gesundheit wird erzeugt.",
        "alt": "Grafik Gesundheit als Wirkungssystem mit Prävention, Pflege, Psyche, Wohnumfeld, Ernährung, Arbeit, Klima und sozialen Beziehungen.",
        "caption": "Gesundheit wird als Systemleistung verstanden, nicht nur als Reparatur von Krankheit.",
    },
    {
        "id": "woek_wirkungseinkommen_drei_ebenen",
        "file": "assets/visuals/explainers/woek_wirkungseinkommen_drei_ebenen.svg",
        "type": "explainer",
        "page": ["/fuer/wirkungseinkommen.html"],
        "title": "WIRKUNGSEINKOMMEN",
        "subtitle": "Drei Ebenen der Teilhabe",
        "nodes": [
            ("Grunddividende", "Universeller Sockel im Konzeptmodell; keine Leistungszusage.", "navy"),
            ("Markteinkommen", "Erwerbsarbeit, Selbstständigkeit und Unternehmertum bleiben möglich.", "green"),
            ("Wirkungsbonus", "Anerkannte Wirkleistung ergänzt den Sockel.", "gold"),
            ("Automatisierung", "KI, Robotik und Plattformen erzeugen Produktivität ohne proportionale Erwerbsarbeit.", "navy"),
            ("Rückkopplung", "Produktivität wird gesellschaftlich über Wirkungsfonds zurückgeführt.", "green"),
        ],
        "footer": "Wirkungseinkommen = Grunddividende + Markteinkommen + Wirkungsbonus.",
        "alt": "Grafik Wirkungseinkommen mit Grunddividende, Markteinkommen und Wirkungsbonus.",
        "caption": "Das Wirkungseinkommen denkt Einkommen als Architektur aus Sockel, Markt und anerkannter Wirkleistung.",
    },
    {
        "id": "woek_wirkungseinkommen_finanzierungsstack",
        "file": "assets/visuals/explainers/woek_wirkungseinkommen_finanzierungsstack.svg",
        "type": "explainer",
        "page": ["/fuer/wirkungseinkommen.html"],
        "title": "WIRKUNGSFONDS",
        "subtitle": "Zuflüsse · Rückflüsse · Stabilisierung",
        "nodes": [
            ("Wirkungssteuern", "Negative Wirkung wird belastet, positive entlastet.", "green"),
            ("Automatisierungsdividende", "Produktivität aus KI, Robotik und Plattformen wird anteilig zurückgeführt.", "gold"),
            ("Kapitalwirkungsbeiträge", "Kapital beteiligt sich an gesellschaftlichen Vorleistungen.", "navy"),
            ("Subventionsabbau", "Destruktive Subventionen werden umgesteuert.", "coral"),
            ("Externe Kosten", "Klima, Gesundheit, Pflege, Sicherheit und Demokratie werden früher sichtbar.", "green"),
            ("Sinkende Reparaturausgaben", "Prävention kann Folgekosten reduzieren.", "gold"),
            ("Abflüsse", "Grunddividende, Wirkungsbonus und gesellschaftliche Stabilisierung.", "navy"),
        ],
        "footer": "Alle Werte bleiben Eingabe, offizielle Quelle oder freigegebener Modellstand.",
        "alt": "Finanzierungsstack des Wirkungseinkommens mit Wirkungsfonds, Zuflüssen und Abflüssen.",
        "caption": "Der Finanzierungsstack zeigt die Modelllogik, nicht eine beschlossene Leistung.",
    },
    {
        "id": "woek_wirkungsrente_wirkungsbiografie",
        "file": "assets/visuals/explainers/woek_wirkungsrente_wirkungsbiografie.svg",
        "type": "explainer",
        "page": ["/fuer/rente.html"],
        "title": "VON ERWERBSBIOGRAFIE ZU WIRKUNGSBIOGRAFIE",
        "subtitle": "Wirkungsrente als Modelllogik",
        "nodes": [
            ("Alte Rente", "Erwerbsarbeit -> Einkommen -> Beitragsjahre -> Rentenpunkte.", "navy"),
            ("Lebenswirkung", "Care, Pflege, Bildung, Prävention und Transformation werden sichtbar.", "green"),
            ("Wirkungsbiografie", "Gesellschaftliche Wirkleistung wird über die Lebenszeit gelesen.", "gold"),
            ("Basisrente", "Würdesichernder Sockel im Modellstand.", "navy"),
            ("Wirkungsdividende", "Bonus aus anerkannter Wirkungslogik.", "green"),
            ("Wirkungsfonds", "Kapitaldeckung nach Wirkung und Zukunftsfähigkeit.", "gold"),
        ],
        "footer": "Modellrechnung, keine Leistungszusage.",
        "alt": "Grafik Wirkungsrente von Erwerbsbiografie zu Wirkungsbiografie mit Basisrente, Wirkungsdividende und Wirkungsfonds.",
        "caption": "Die Wirkungsrente erweitert die Erwerbsbiografie zur Wirkungsbiografie.",
    },
    {
        "id": "woek_kondratieff_nachhaltigkeitstransformation",
        "file": "assets/visuals/explainers/woek_kondratieff_nachhaltigkeitstransformation.svg",
        "type": "explainer",
        "page": ["/wissen/sechster-kondratieff.html"],
        "title": "6. KONDRATIEFF: NACHHALTIGKEITSTRANSFORMATION",
        "subtitle": "Technologie ist Treiber · Agenda 2030 ist Richtung · WÖk ist Steuerung",
        "nodes": [
            ("Welle", "Nachhaltigkeitstransformation im Sinne der Agenda 2030.", "green"),
            ("Treiber", "KI, Robotik, Automatisierung, Datenräume und Kreislauftechnologien.", "navy"),
            ("Energie", "Erneuerbare Energien und biobasierte Innovationen schaffen neue Produktivität.", "gold"),
            ("Gesellschaft", "Bildung, Gesundheit und resiliente Wertschöpfung gehören zur Welle.", "green"),
            ("Rahmen", "Agenda 2030, SDGs, SDG+, Mensch, Planet und Demokratie geben Richtung.", "navy"),
            ("Steuerung", "Wirkungsökonomie übersetzt Richtung in Wirkung, WÖk-ID, Scorecard und Rückkopplung.", "green"),
            ("Ziel", "positive Netto-Wirkung für Mensch, Planet und Demokratie.", "gold"),
        ],
        "footer": "KI und Robotik treiben Wachstum. Die Agenda 2030 gibt Richtung. Die Wirkungsökonomie übersetzt diese Richtung in Steuerung.",
        "alt": "Kondratieff-Grafik zur sechsten Welle als Nachhaltigkeitstransformation mit Technologie als Treiber, Agenda 2030 als Richtung und Wirkungsökonomie als Steuerung.",
        "caption": "Die sechste Welle wird nicht als KI-Welle dargestellt, sondern als Nachhaltigkeitstransformation mit technologischen Wachstumstreibern.",
    },
]


def write_visuals() -> None:
    for item in VISUALS:
        path = ROOT / str(item["file"])
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(desktop_visual(item), encoding="utf-8")
        mobile = path.with_name(path.stem + "_mobile.svg")
        mobile.write_text(mobile_visual(item), encoding="utf-8")


def write_registry() -> None:
    registry = []
    for item in VISUALS:
        path = str(item["file"])
        registry.append(
            {
                "visual_id": item["id"],
                "title": item["title"],
                "file": path,
                "type": item["type"],
                "page": item["page"],
                "status": "approved_for_sprint_1",
                "source_basis": [
                    "WOeK_Zielgruppen_Content_Master_v1.0",
                    "WOeK_Begriffsleitfaden_fuehrend_v1.0",
                    "Die neue Ordnung des Wohlstands, aktueller Buchstand 2026",
                    "Brand Guide der Wirkungsökonomie",
                ],
                "alt_text": item["alt"],
                "caption": item["caption"],
                "mobile_variant": path.replace(".svg", "_mobile.svg"),
                "created_as": "controlled_svg_model_visual",
                "review_status": "sprint_1_controlled_visual",
            }
        )
    out = ROOT / "content/visuals/visual-registry.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    md = ROOT / "docs/visual-registry.md"
    rows = [
        "# Visual Registry",
        "",
        "Zentrale Registry der kontrollierten WÖk-Visuals. Sprint-1-Grafiken sind als SVG/Layoutgrafiken erstellt, nicht als KI-Poster.",
        "",
        "| visual-id | Titel | Typ | Seite | Status | Mobile-Version | Alt-Text | Stilprüfung |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for entry in registry:
        pages = ", ".join(entry["page"])
        rows.append(
            f"| `{entry['visual_id']}` | {entry['title']} | {entry['type']} | {pages} | {entry['status']} | `{entry['mobile_variant']}` | {entry['alt_text']} | WÖk-konform: Ivory, Navy, Green, Gold, Coral sparsam; kontrolliertes SVG. |"
        )
    md.write_text("\n".join(rows) + "\n", encoding="utf-8")


if __name__ == "__main__":
    write_visuals()
    write_registry()

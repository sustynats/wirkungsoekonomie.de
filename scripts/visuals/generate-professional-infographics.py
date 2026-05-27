#!/usr/bin/env python3
from __future__ import annotations

import math
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
NAVY = "#071126"
GREEN = "#2F7D5C"
GREEN_DARK = "#1F6048"
GOLD = "#C9972B"
RED = "#C94F43"
TEAL = "#247C7A"
PURPLE = "#6D5B8D"
INK = "#222733"
MUTED = "#5F6673"
LINE = "#D8D5CC"
PAPER = "#FBFAF6"
SOFT = "#F3F0E8"
SOFT_GREEN = "#EEF6F1"
SOFT_GOLD = "#FBF2DE"
SOFT_RED = "#FCEBE7"
SOFT_BLUE = "#EEF4F8"

def first_existing(*paths: str) -> str:
    for item in paths:
        if Path(item).exists():
            return item
    return paths[-1]


FONT_REG = first_existing(
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)
FONT_BOLD = first_existing(
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
)
FONT_SERIF_BOLD = first_existing(
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
)


def font(size: int, bold: bool = False, serif: bool = False):
    path = FONT_SERIF_BOLD if serif else (FONT_BOLD if bold else FONT_REG)
    return ImageFont.truetype(path, size)


F = {
    "title": font(64, serif=True),
    "title_m": font(44, serif=True),
    "sub": font(27),
    "sub_m": font(22),
    "h": font(25, True),
    "h_m": font(25, True),
    "label": font(17, True),
    "body": font(19),
    "body_s": font(16),
    "body_m": font(21),
    "small": font(14),
    "tiny": font(12),
}


def rect(draw, xy, fill="#FFFFFF", outline=LINE, width=2, radius=22):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def text_size(draw, text, fnt):
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def fit_lines(text, fnt, width, max_lines=None):
    words = text.replace("\n", " \n ").split()
    lines, line = [], ""
    probe_img = Image.new("RGB", (10, 10))
    probe = ImageDraw.Draw(probe_img)
    for w in words:
        if w == "\n":
            if line:
                lines.append(line)
            line = ""
            continue
        cand = (line + " " + w).strip()
        if text_size(probe, cand, fnt)[0] <= width or not line:
            line = cand
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(".,;:") + " ..."
    return lines


def draw_text(draw, xy, text, fnt, fill=INK, width=None, line_gap=7, max_lines=None):
    x, y = xy
    if width is None:
        draw.text((x, y), text, font=fnt, fill=fill)
        return y + text_size(draw, text, fnt)[1]
    for line in fit_lines(text, fnt, width, max_lines):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += text_size(draw, line, fnt)[1] + line_gap
    return y


def center_text(draw, box, text, fnt, fill=INK, line_gap=6, max_lines=3):
    x1, y1, x2, y2 = box
    lines = fit_lines(text, fnt, x2 - x1 - 24, max_lines=max_lines)
    total = sum(text_size(draw, l, fnt)[1] for l in lines) + line_gap * (len(lines) - 1)
    y = y1 + (y2 - y1 - total) / 2
    for line in lines:
        w, h = text_size(draw, line, fnt)
        draw.text((x1 + (x2 - x1 - w) / 2, y), line, font=fnt, fill=fill)
        y += h + line_gap


def arrow(draw, p1, p2, fill=GREEN, width=4):
    draw.line([p1, p2], fill=fill, width=width)
    a = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    size = 14
    pts = [
        p2,
        (p2[0] - size * math.cos(a - math.pi / 6), p2[1] - size * math.sin(a - math.pi / 6)),
        (p2[0] - size * math.cos(a + math.pi / 6), p2[1] - size * math.sin(a + math.pi / 6)),
    ]
    draw.polygon(pts, fill=fill)


def icon(draw, cx, cy, kind="target", color=GREEN, r=31):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=color, width=3, fill="#FFFFFF")
    if kind == "target":
        for rr in (18, 8):
            draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=color, width=2)
        arrow(draw, (cx - 4, cy + 10), (cx + 22, cy - 18), fill=color, width=3)
    elif kind == "leaf":
        draw.arc((cx - 20, cy - 18, cx + 22, cy + 20), 205, 35, fill=color, width=4)
        draw.line((cx - 12, cy + 12, cx + 16, cy - 14), fill=color, width=3)
    elif kind == "people":
        for dx in (-13, 13, 0):
            draw.ellipse((cx + dx - 7, cy - 17, cx + dx + 7, cy - 3), outline=color, width=2)
            draw.arc((cx + dx - 13, cy - 2, cx + dx + 13, cy + 20), 200, -20, fill=color, width=2)
    elif kind == "scale":
        draw.line((cx, cy - 20, cx, cy + 17), fill=color, width=3)
        draw.line((cx - 22, cy - 8, cx + 22, cy - 8), fill=color, width=3)
        for dx in (-17, 17):
            draw.line((cx + dx, cy - 8, cx + dx - 9, cy + 8), fill=color, width=2)
            draw.line((cx + dx, cy - 8, cx + dx + 9, cy + 8), fill=color, width=2)
            draw.arc((cx + dx - 12, cy + 4, cx + dx + 12, cy + 21), 0, 180, fill=color, width=2)
    elif kind == "chart":
        draw.line((cx - 20, cy + 18, cx + 22, cy + 18), fill=color, width=3)
        for i, h in enumerate([14, 24, 34]):
            x = cx - 18 + i * 15
            draw.rectangle((x, cy + 18 - h, x + 9, cy + 18), outline=color, width=2)
        arrow(draw, (cx - 18, cy + 8), (cx + 20, cy - 18), fill=color, width=2)
    elif kind == "data":
        for y in (cy - 14, cy, cy + 14):
            draw.ellipse((cx - 19, y - 7, cx + 19, y + 7), outline=color, width=2)
        draw.line((cx - 19, cy - 14, cx - 19, cy + 14), fill=color, width=2)
        draw.line((cx + 19, cy - 14, cx + 19, cy + 14), fill=color, width=2)
    elif kind == "book":
        draw.rounded_rectangle((cx - 22, cy - 19, cx - 1, cy + 21), radius=4, outline=color, width=2)
        draw.rounded_rectangle((cx + 1, cy - 19, cx + 22, cy + 21), radius=4, outline=color, width=2)
        draw.line((cx, cy - 17, cx, cy + 19), fill=color, width=2)
    elif kind == "shield":
        pts = [(cx, cy - 23), (cx + 20, cy - 13), (cx + 14, cy + 16), (cx, cy + 24), (cx - 14, cy + 16), (cx - 20, cy - 13)]
        draw.line(pts + [pts[0]], fill=color, width=3)
        draw.line((cx - 9, cy + 1, cx - 1, cy + 10, cx + 14, cy - 10), fill=color, width=3)
    elif kind == "home":
        draw.polygon([(cx - 23, cy - 2), (cx, cy - 23), (cx + 23, cy - 2)], outline=color)
        draw.line((cx - 18, cy - 2, cx - 18, cy + 21, cx + 18, cy + 21, cx + 18, cy - 2), fill=color, width=3)
    elif kind == "euro":
        draw.text((cx - 12, cy - 25), "€", font=font(42, True), fill=color)
    else:
        draw.text((cx - 12, cy - 22), "✓", font=font(42, True), fill=color)


def draw_mpd(draw, x, y, scale=1.0):
    p = [(x + 44 * scale, y), (x, y + 76 * scale), (x + 88 * scale, y + 76 * scale)]
    draw.line(p + [p[0]], fill=NAVY, width=max(2, int(2 * scale)))
    draw.line((x + 44 * scale, y, x + 44 * scale, y + 76 * scale), fill=LINE, width=2)
    draw.line((x, y + 76 * scale, x + 88 * scale, y + 76 * scale), fill=GREEN, width=2)
    draw.text((x + 26 * scale, y - 24 * scale), "Mensch", font=font(int(13 * scale), True), fill=NAVY)
    draw.text((x - 8 * scale, y + 82 * scale), "Planet", font=font(int(13 * scale), True), fill=GREEN)
    draw.text((x + 50 * scale, y + 82 * scale), "Demokratie", font=font(int(13 * scale), True), fill=RED)


def base_definition(name: str):
    nice = name.replace("woek_", "").replace("_", " ").replace("-", " ").title()
    return {
        "title": nice.upper(),
        "subtitle": "Wirkung sichtbar machen, bewerten und verantwortungsvoll zurückkoppeln.",
        "left_title": "Problem heute",
        "left_items": ["Einzelkennzahlen dominieren", "Folgen werden spät sichtbar", "Kosten wandern ins System", "Entscheidungen bleiben wirkungsblind"],
        "nodes": ["Mensch", "Planet", "Demokratie", "Daten", "Rückkopplung", "Lernen"],
        "right_title": "WÖk-Logik",
        "right_steps": ["Wirkungspotenziale erkennen", "Daten und Unsicherheit markieren", "Netto-Wirkung bewerten", "Entscheidungen anpassen"],
        "principles": ["transparent", "messbar", "gerecht", "resilient", "lernend", "nicht kompensieren"],
        "footer": "Kernaussage: Wirkung wird nicht behauptet, sondern nachvollziehbar gemacht.",
    }


DATA = {
    "woek_modell_auf_einen_blick_v2": {
        "title": "WIRKUNGSÖKONOMIE-MODELL",
        "subtitle": "Ein integriertes System für Mensch, Planet und Demokratie. Wirkung als Steuerungsgröße - nicht Kapital.",
        "left_title": "Leitbild",
        "left_items": ["Wirtschaft und Gesellschaft entfalten ihr Potenzial, wenn Kapital Mittel bleibt.", "Wirkung wird der gemeinsame Maßstab.", "Gewinn ist Ergebnis guter Wirkung, nicht Ersatz für Wirkung."],
        "nodes": ["Staat & Recht", "Wirtschaft", "Finanzsystem", "Gesellschaft", "Individuum", "Medien", "Gesundheit", "Wissen", "Kultur"],
        "right_title": "Wirkungsziele",
        "right_steps": ["Planetare Resilienz", "Menschliches Wohlergehen", "Demokratie & Zusammenhalt", "Lernende Rückkopplung"],
        "principles": ["Nachhaltigkeit", "Gerechtigkeit", "Transparenz", "Teilhabe", "Resilienz", "Innovation", "Verantwortung"],
        "footer": "Ziel: Eine Wirtschaft und Gesellschaft, die positive Wirkung entfaltet - heute und morgen.",
    },
    "woek_wirkungskreislauf_stufen": {
        "title": "DER WIRKUNGSKREISLAUF",
        "subtitle": "Von Auslöser und Wirkungspotenzial zu Bewertung, Steuerung, Rückkopplung und Lernen.",
        "left_title": "Ausgangspunkt",
        "left_items": ["Ein Produkt, Gesetz, Preis, Frame oder Geschäftsmodell löst Veränderung aus.", "Zuerst entsteht Wirkungspotenzial, erst später messbare Realwirkung."],
        "nodes": ["Auslöser", "Wirkstoff", "Wirkungsraum", "Empfänger", "Pfad", "Potenzial", "Bewertung", "Rückkopplung", "Lernen"],
        "right_title": "Wirkung wird Realität",
        "right_steps": ["Signale treffen auf Kontexte", "Entscheidungen verändern Verhalten", "Nebenwirkungen werden sichtbar", "Systeme lernen und passen sich an"],
        "principles": ["ex-ante prüfen", "Daten markieren", "Risiken benennen", "Schutzgrenzen", "Evaluation", "Revision"],
        "footer": "Wirkung entsteht in Kreisläufen, nicht in isolierten Punkten.",
    },
    "woek_wirkung_vs_wirkungspotenzial": {
        "title": "WIRKUNG UND WIRKUNGSPOTENZIAL",
        "subtitle": "Möglichkeit, tatsächliche Zustandsveränderung und Bewertung sauber trennen.",
        "left_title": "Nicht verwechseln",
        "left_items": ["Absicht ist noch keine Wirkung.", "Output ist noch keine Zustandsveränderung.", "Potenzial ist eine begründete Erwartung - kein Nachweis."],
        "nodes": ["Absicht", "Output", "Wirkstoff", "Potenzial", "Reale Wirkung", "Bewertung"],
        "right_title": "WÖk-Übersetzung",
        "right_steps": ["Hypothesen offenlegen", "Datenqualität prüfen", "Nebenwirkungen einordnen", "Netto-Wirkung bewerten"],
        "principles": ["klar trennen", "unsicher markieren", "beobachten", "bewerten", "lernen"],
        "footer": "Erst die beobachtete Zustandsveränderung wird Wirkung; vorher sprechen wir von Potenzial.",
    },
    "woek_reverse_merit_order_schutzregel": {
        "title": "REVERSE MERIT ORDER",
        "subtitle": "Das schwächste kritische Wirkungsfeld entscheidet. Gute Effekte dürfen schwere Schäden nicht überdecken.",
        "left_title": "Problem",
        "left_items": ["Kompensation kann Schäden unsichtbar machen.", "Ein guter Bereich darf Menschenrechts-, Klima- oder Demokratieschäden nicht schönrechnen.", "Durchschnittswerte verwischen rote Linien."],
        "nodes": ["Mensch", "Planet", "Demokratie", "Datenqualität", "Schutzgrenze", "Final-Score"],
        "right_title": "Schutzregel",
        "right_steps": ["Kritische Felder zuerst prüfen", "Datenlücken konservativ behandeln", "Nicht-Kompensation anwenden", "Transformation gezielt belohnen"],
        "principles": ["kein Ablasshandel", "rote Linien", "schwächstes Feld", "Transparenz", "Widerspruch", "Evaluation"],
        "footer": "Die Reverse Merit Order verhindert, dass positive Wirkung als Deckmantel für Schaden dient.",
    },
    "woek_funktionsweise_kreislauf": {
        "title": "SO FUNKTIONIERT DIE WIRKUNGSÖKONOMIE",
        "subtitle": "Wirkung messen, bewerten, in Preise und Entscheidungen zurückkoppeln und lernend verbessern.",
        "left_title": "Heute",
        "left_items": ["Preise zeigen oft nur Knappheit und Nachfrage.", "Folgekosten bleiben bei Umwelt, Gesundheit, Kommunen oder Demokratie.", "Politik repariert spät."],
        "nodes": ["Daten", "Wirkungsbewertung", "Netto-Wirkung", "Schutzregel", "Steuern", "Beschaffung", "Kapital", "Evaluation"],
        "right_title": "Morgen",
        "right_steps": ["Wirkung wird sichtbar", "Anreize werden ehrlicher", "Entscheidungen werden robuster", "Systeme lernen schneller"],
        "principles": ["Datenbasis", "Scorecards", "Wirkungssteuer", "Wirkungsfonds", "Rückkopplung"],
        "footer": "Wirkung wird zur Rückmeldung des Systems - nicht zur bloßen Behauptung.",
    },
    "woek_wirkung_einfach_flow": {
        "title": "WIRKUNG EINFACH ERKLÄRT",
        "subtitle": "Die Wirkungsökonomie fragt nicht zuerst, was sich rechnet, sondern was sich verändert.",
        "left_title": "Alte Logik",
        "left_items": ["Kapital, Gewinn und Wachstum werden zum Kompass.", "Schäden können ausgelagert werden.", "Positive Zukunftsleistung bleibt oft unbezahlt."],
        "nodes": ["Handlung", "Zustand", "Betroffene", "Nebenwirkung", "Bewertung", "Rückkopplung"],
        "right_title": "Neue Logik",
        "right_steps": ["Was verändert sich?", "Wer trägt Nutzen und Kosten?", "Welche Schutzgrenzen gelten?", "Welche Entscheidung folgt daraus?"],
        "principles": ["konkret", "verständlich", "beobachtbar", "verantwortlich", "lernend"],
        "footer": "Wirkung ist die tatsächliche Veränderung von Zuständen.",
    },
    "woek_unternehmen_wirkungssystem": {
        "title": "WIRKUNGSORIENTIERTE UNTERNEHMENSFÜHRUNG",
        "subtitle": "Führung, die Wirkung maximiert - für Mensch, Planet und Demokratie.",
        "left_title": "Paradigmenwechsel",
        "left_items": ["Von Gewinnmaximierung zu Wirkungsmaximierung.", "Kapital ist Mittel, Wirkung ist Ziel.", "Stakeholder Value wird als Systemwirkung gelesen."],
        "nodes": ["Strategie", "Führung", "Kultur", "Lieferkette", "Produkte", "Kapital", "Innovation", "Kommunikation"],
        "right_title": "Steuern",
        "right_steps": ["Daten erfassen", "Scorecard bewerten", "Anreize setzen", "Lernen & verbessern"],
        "principles": ["Wirkung vor Gewinn", "systemisch denken", "transparent handeln", "regenerativ", "gerecht"],
        "footer": "Unternehmen sind Wirkungssysteme, keine Maschinen zur reinen Gewinnmaximierung.",
    },
    "woek_unternehmen_wirkungsnetz": {
        "title": "UNTERNEHMEN ALS WIRKUNGSNETZ",
        "subtitle": "Geschäftsmodelle, Lieferketten, Kapital, Kultur und Kommunikation wirken zusammen.",
        "left_title": "Heute oft unsichtbar",
        "left_items": ["KPI zeigen Bewegung, aber nicht Richtung.", "Lieferkettenrisiken erscheinen spät.", "Marketing kann Wirkung überdecken."],
        "nodes": ["Geschäftsmodell", "Beschaffung", "Produkte", "Mitarbeitende", "Kapital", "Marketing", "Daten", "Governance"],
        "right_title": "WÖk-Ansatz",
        "right_steps": ["Wirkungspfade kartieren", "Scorecards nutzen", "Anreize ausrichten", "Transparenz berichten"],
        "principles": ["Resilienz", "Wirkungsdaten", "5. P = Planet", "Impact Controlling", "Lieferkettenwirkung"],
        "footer": "Ein Unternehmen wird steuerbar, wenn seine Wirkungspfade sichtbar werden.",
    },
    "woek_politik_reparaturstaat_wirkungsarchitektur": {
        "title": "VOM REPARATURSTAAT ZUR WIRKUNGSARCHITEKTUR",
        "subtitle": "Früher prüfen, besser rückkoppeln, weniger Flickwerk reparieren.",
        "left_title": "Reparaturstaat",
        "left_items": ["Falsche Preise senden falsche Signale.", "Schäden werden spät sichtbar.", "Fördertöpfe und Sonderregeln reparieren nachträglich."],
        "nodes": ["Ziel", "Gesetz", "Haushalt", "Steuer", "Beschaffung", "Daten", "Evaluation", "Anpassung"],
        "right_title": "Wirkungsarchitektur",
        "right_steps": ["Folgen vorab prüfen", "Wirkungshaushalt einführen", "Steuern nach Wirkung ausrichten", "Evaluation verbindlich machen"],
        "principles": ["rechtsstaatlich", "datenbasiert", "lernend", "verhältnismäßig", "demokratisch"],
        "footer": "Politik wird wirksamer, wenn sie Folgen früher erkennt und Anreize konsequent zurückkoppelt.",
    },
    "woek_politik_wirkungssteuerung": {
        "title": "POLITISCHE WIRKUNGSSTEUERUNG",
        "subtitle": "Von Ziel, Maßnahme und Haushalt zur nachvollziehbaren Rückkopplung.",
        "left_title": "Blindstelle",
        "left_items": ["Programme werden nach Ausgabe, Zuständigkeit oder Symbolkraft bewertet.", "Zielkonflikte bleiben in Ressorts getrennt.", "Evaluation kommt oft zu spät."],
        "nodes": ["Ziel", "Maßnahme", "Wirkungsräume", "Indikatoren", "Zielkonflikte", "Haushalt", "Recht", "Evaluation"],
        "right_title": "WÖk-Pfad",
        "right_steps": ["Leitfrage klären", "Wirkungsräume bestimmen", "Daten und Unsicherheit markieren", "Haushalt und Recht anpassen"],
        "principles": ["ex-ante", "ressortübergreifend", "schutzorientiert", "evaluierbar", "lernend"],
        "footer": "Wirkungspolitik heißt: Maßnahmen an ihren Folgen rückkoppeln, nicht an Schlagworten.",
    },
    "woek_buergerinnen_bessere_signale": {
        "title": "BÜRGER:INNEN UND BESSERE SIGNALE",
        "subtitle": "Alltag wird leichter, wenn Preise und Informationen Wirkung verständlich machen.",
        "left_title": "Problem heute",
        "left_items": ["Menschen sollen moralisch kompensieren, was das System falsch signalisiert.", "Billig wirkt oft günstig, obwohl Folgekosten ausgelagert werden.", "Informationen sind zerstreut und schwer vergleichbar."],
        "nodes": ["Preis", "Produktpass", "Score", "Wahlmöglichkeit", "Teilhabe", "Vertrauen"],
        "right_title": "Nutzen im Alltag",
        "right_steps": ["Ehrlichere Preise", "verständlichere Produktinfos", "weniger moralische Einzelüberforderung", "mehr demokratische Anschlussfähigkeit"],
        "principles": ["fair", "verständlich", "sozial abgefedert", "wahlfähig", "transparent"],
        "footer": "Nicht jede Entscheidung muss perfekt sein. Das System soll bessere Entscheidungen einfacher machen.",
    },
    "woek_buerger_alltag_wirkung": {
        "title": "ALLTAG MIT WIRKUNGSSIGNALEN",
        "subtitle": "Wie Preise, Produktinformationen und öffentliche Angebote Orientierung geben können.",
        "left_title": "Heute",
        "left_items": ["Preis sagt wenig über Klima, Gesundheit, Arbeit oder Demokratie.", "Verzicht wird individualisiert.", "Viele Labels konkurrieren ohne klare Logik."],
        "nodes": ["Einkaufen", "Wohnen", "Mobilität", "Gesundheit", "Medien", "Arbeit"],
        "right_title": "WÖk im Alltag",
        "right_steps": ["Preiswahrheit erkennen", "Produktwirkung vergleichen", "Kommunale Angebote sehen", "Folgen besser verstehen"],
        "principles": ["Orientierung", "Entlastung", "Preiswahrheit", "Kaufkraftschutz", "Teilhabe"],
        "footer": "Die WÖk soll Alltag verständlicher machen, nicht Menschen moralisch überfordern.",
    },
    "woek_wohnen_wirkungsraum": {
        "title": "WOHNEN ALS WIRKUNGSRAUM",
        "subtitle": "Miete, Energie, Gesundheit, Quartier und Teilhabe zusammen denken.",
        "left_title": "Alte Logik",
        "left_items": ["Wohnung wird zu oft als Kosten- und Renditeobjekt betrachtet.", "Energie, Gesundheit und Quartier werden getrennt gesteuert.", "Sanierung kann sozial kippen."],
        "nodes": ["Bezahlbarkeit", "Energie", "Gesundheit", "Quartier", "Teilhabe", "Boden", "Resilienz"],
        "right_title": "WÖk-Logik",
        "right_steps": ["Wirkung je Maßnahme prüfen", "Mieter:innen schützen", "Quartiersnutzen sichtbar machen", "Förderung wirkungsorientiert steuern"],
        "principles": ["warm", "bezahlbar", "klimafit", "gesund", "sozial"],
        "footer": "Gutes Wohnen ist Systemwirkung: es stabilisiert Menschen, Klima und demokratischen Alltag.",
    },
    "woek_kapitalwirkung_investoren": {
        "title": "KAPITALWIRKUNG",
        "subtitle": "Kapitalflüsse nach Risiko, Rendite und Netto-Wirkung ausrichten.",
        "left_title": "Kapital heute",
        "left_items": ["Rendite misst finanziellen Erfolg.", "Risiko erfasst oft nicht alle Systemfolgen.", "Wirkung bleibt Nebenbericht statt Steuerungsgröße."],
        "nodes": ["Kapital", "Risiko", "Rendite", "T-SROI", "Wirkungsrating", "Portfolio", "Resilienz"],
        "right_title": "WÖk-Finanzlogik",
        "right_steps": ["Kapitalwirkung messen", "Portfolios nach Netto-Wirkung prüfen", "Schädliche Risiken verteuern", "Transformative Investitionen stärken"],
        "principles": ["Sustainable Finance", "ESG nutzen", "Wirkung ergänzen", "Rückkopplung", "Transparenz"],
        "footer": "Kapital bleibt wichtig - aber Richtung und Wirkung entscheiden über Zukunftsfähigkeit.",
    },
    "woek_kommunen_lokale_wirkungsraeume": {
        "title": "KOMMUNEN ALS WIRKUNGSRÄUME",
        "subtitle": "Wohnen, Mobilität, Bildung, Gesundheit, Klima und Daseinsvorsorge gemeinsam steuern.",
        "left_title": "Kommunale Realität",
        "left_items": ["Probleme treten lokal gebündelt auf.", "Haushaltspositionen wirken über Ressortgrenzen.", "Prävention spart spätere Reparaturkosten."],
        "nodes": ["Haushalt", "SDGs", "Wohnen", "Mobilität", "Bildung", "Gesundheit", "Klima", "Teilhabe"],
        "right_title": "Lernpfad",
        "right_steps": ["Ziele im Haushalt verankern", "Indikatoren nutzen", "Wirkung je Produktbereich prüfen", "Kommunal lernen und berichten"],
        "principles": ["Daseinsvorsorge", "Prävention", "SDG-Haushalt", "Transparenz", "Beteiligung"],
        "footer": "Kommunale Wirkung wird stark, wenn Haushalt, Ziele und Alltag sichtbar verbunden werden.",
    },
    "woek_journalismus_faktencheck_wirkungsanalyse": {
        "title": "FAKTENCHECK PLUS FOLGENCHECK",
        "subtitle": "Fakten klären und Wirkungspotenziale von Sprache, Frames und Resonanzräumen einordnen.",
        "left_title": "Faktencheck fragt",
        "left_items": ["Stimmt das?", "Welche Quelle trägt die Aussage?", "Welche Datenlage ist belastbar?"],
        "nodes": ["Aussage", "Fakt", "Frame", "Resonanzraum", "Wirkstoff", "Wirkungspfad", "Demokratie"],
        "right_title": "Folgencheck fragt",
        "right_steps": ["Was kann das auslösen?", "Wer ist betroffen?", "Welche Nebenwirkungen entstehen?", "Welche Schutzgrenzen gelten?"],
        "principles": ["Quellenklarheit", "Kontext", "keine Zensur", "Wirkungspotenzial", "Verantwortung"],
        "footer": "Faktencheck und Folgencheck ersetzen einander nicht - sie ergänzen sich.",
    },
    "woek_medien_demokratie_wirkpfade": {
        "title": "MEDIENWIRKUNG UND DEMOKRATIE",
        "subtitle": "Medien sind keine neutralen Durchleiter. Sie prägen Wahrnehmung, Vertrauen und Handeln.",
        "left_title": "Direkte Wirkungen",
        "left_items": ["kognitiv: Wissen und Aufmerksamkeit", "emotional: Vertrauen, Angst oder Wut", "verhaltensbezogen: Teilen, Wählen, Konsumieren"],
        "nodes": ["Inhalt", "Verbreitung", "Wahrnehmung", "Frame", "Resonanz", "Entscheidung", "Systemwirkung"],
        "right_title": "Wirkung steuern",
        "right_steps": ["Qualität sichtbar machen", "Desinformation begrenzen", "Pluralität sichern", "Verantwortung für Reichweite einbauen"],
        "principles": ["Wahrhaftigkeit", "Vielfalt", "Transparenz", "Teilhabe", "Medienkompetenz"],
        "footer": "Medien formen nicht nur, was wir denken. Sie beeinflussen, welche Zukunft politisch möglich wird.",
    },
    "woek_akademie_lernpfad": {
        "title": "LERNPFAD WIRKUNGSKOMPETENZ",
        "subtitle": "Verstehen, bewerten, zurückkoppeln, anwenden und weiterlernen.",
        "left_title": "Kompetenzlogik",
        "left_items": ["Wirkung erkennen", "Daten und Unsicherheit lesen", "Systemzusammenhänge verstehen", "Verantwortlich entscheiden"],
        "nodes": ["Verstehen", "Begriffe", "Wirkungsfelder", "Methoden", "Tools", "Praxis", "Reflexion"],
        "right_title": "Akademiepfad",
        "right_steps": ["Grundlagen lernen", "Fälle bearbeiten", "Scorecards verstehen", "Eigene Anwendung prüfen"],
        "principles": ["offen", "kostenlos", "modular", "kritisch", "praxisnah"],
        "footer": "Wirkungskompetenz verbindet Wissen, Urteilskraft, Datenverständnis und Verantwortung.",
    },
    "woek_akademie_lernarchitektur": {
        "title": "WÖK-AKADEMIE LERNARCHITEKTUR",
        "subtitle": "Vom ersten Verständnis zur Anwendung in Tools, Wirkungsfeldern und Praxisfällen.",
        "left_title": "Einstieg",
        "left_items": ["Begriffe verstehen", "Systemmodell lesen", "Einwände einordnen", "Demos ausprobieren"],
        "nodes": ["Grundlagen", "Begriffe", "Methoden", "Wirkungsfelder", "Tools", "Use-Cases", "Zertifikat"],
        "right_title": "Anwendung",
        "right_steps": ["Kompass nutzen", "Praxisfall wählen", "Wirkungspfad erstellen", "Grenzen dokumentieren"],
        "principles": ["Lernen", "Anwenden", "Reflektieren", "Verbessern", "Teilen"],
        "footer": "Die Akademie ist Lernraum, nicht amtliche Zertifizierungsstelle.",
    },
    "woek_wissenschaft_forschung": {
        "title": "WISSENSCHAFT ALS WIRKUNGSINFRASTRUKTUR",
        "subtitle": "Daten, Modelle, Prüfung und Transfer als Grundlage lernfähiger Wirkung.",
        "left_title": "Wissenschaft leistet",
        "left_items": ["Erkenntnisse erzeugen", "Modelle prüfen", "Unsicherheit sichtbar machen", "Datenqualität sichern"],
        "nodes": ["Forschung", "Daten", "Methoden", "Peer Review", "Transfer", "Evaluation", "Politik"],
        "right_title": "WÖk braucht",
        "right_steps": ["offene Annahmen", "prüfbare Indikatoren", "interdisziplinäre Bewertung", "lernende Korrektur"],
        "principles": ["Evidenz", "Transparenz", "Methodenkritik", "Open Science", "Transfer"],
        "footer": "Ohne Wissenschaft wird Wirkung zur Behauptung; mit Prüfung wird sie lernfähig.",
    },
    "woek_gesundheit_wirkungssystem": {
        "title": "GESUNDHEIT ALS SYSTEMWIRKUNG",
        "subtitle": "Prävention, Pflege, Arbeit, Wohnen, Klima und soziale Beziehungen gemeinsam betrachten.",
        "left_title": "Alte Logik",
        "left_items": ["Gesundheit wird oft als Reparatur von Krankheit finanziert.", "Prävention und Pflege erscheinen als Kosten.", "Lebensumstände bleiben unterbelichtet."],
        "nodes": ["Prävention", "Pflege", "Psyche", "Arbeit", "Wohnen", "Ernährung", "Klima", "Teilhabe"],
        "right_title": "WÖk-Logik",
        "right_steps": ["Gesundheitswirkung früh erkennen", "Care-Arbeit sichtbar machen", "Umfeldfaktoren integrieren", "Prävention belohnen"],
        "principles": ["Lebensqualität", "Prävention", "Würde", "Resilienz", "Teilhabe"],
        "footer": "Gesundheit entsteht nicht nur im System Gesundheit, sondern in vielen Wirkungsräumen zugleich.",
    },
    "woek_wirkungseinkommen_drei_ebenen": {
        "title": "WIRKUNGSEINKOMMEN",
        "subtitle": "Sicherheit durch Grunddividende, Markteinkommen und anerkannte Wirkleistung zusammendenken.",
        "left_title": "Alte Kette",
        "left_items": ["Arbeit führt zu Lohn.", "Lohn finanziert Sicherheit.", "Automatisierung schwächt diese Kette, wenn Wertschöpfung abwandert."],
        "nodes": ["Grunddividende", "Markteinkommen", "Wirkungsbonus", "Care", "Bildung", "Prävention", "Transformation"],
        "right_title": "Neue Logik",
        "right_steps": ["Wertschöpfung rückkoppeln", "Wirkleistung sichtbar machen", "Sicherheit stabilisieren", "Transformation finanzieren"],
        "principles": ["Modell", "keine Leistungszusage", "sozial", "pilotierbar", "haushaltsklar"],
        "footer": "Wirkungseinkommen ist ein Modell für eine Wirtschaft, in der Wertschöpfung nicht nur an Erwerbsarbeit hängt.",
    },
    "woek_wirkungseinkommen_finanzierungsstack": {
        "title": "WIRKUNGSFONDS UND FINANZIERUNG",
        "subtitle": "Wie automatisierte Wertschöpfung, Wirkungssteuern und Kapitalrückkopplung soziale Stabilität stärken könnten.",
        "left_title": "Zuflüsse",
        "left_items": ["Maschinenwertschöpfungsbeitrag", "Wirkungssteuer", "Transformationsgewinne", "Kapitalrückkopplung"],
        "nodes": ["Fonds", "Sicherung", "Weiterbildung", "Care", "Innovation", "Resilienz", "Teilhabe"],
        "right_title": "Abflüsse",
        "right_steps": ["Grundsicherheit", "Wirkungsbonus", "Transformationshilfen", "Prävention und Bildung"],
        "principles": ["transparent", "haushaltsprüfbar", "pilotiert", "demokratisch", "lernend"],
        "footer": "Der Fonds zeigt eine Finanzierungslogik - keine beschlossene Leistung und keine automatische Auszahlung.",
    },
    "woek_wirkungsrente_wirkungsbiografie": {
        "title": "VON ERWERBSBIOGRAFIE ZU WIRKUNGSBIOGRAFIE",
        "subtitle": "Rente, Care, Bildung, Pflege und Gemeinwesen als lebenslange Wirkung zusammendenken.",
        "left_title": "Heute",
        "left_items": ["Rentenansprüche hängen stark an Erwerbsarbeit.", "Care, Pflege, Bildung und Engagement sind unterbewertet.", "Brüche in Biografien schwächen Sicherheit."],
        "nodes": ["Erwerbsarbeit", "Care", "Pflege", "Bildung", "Engagement", "Prävention", "Sicherheit"],
        "right_title": "Wirkungsbiografie",
        "right_steps": ["Wirkleistung dokumentieren", "Lebensphasen anerkennen", "Sicherheit breiter stützen", "Systemstabilität bewerten"],
        "principles": ["Würde", "Lebenslauf", "Anerkennung", "Teilhabe", "Gerechtigkeit"],
        "footer": "Eine Wirkungsbiografie erweitert Erwerbsbiografie, ohne Erwerbsarbeit abzuwerten.",
    },
    "woek_kondratieff_nachhaltigkeitstransformation": {
        "title": "SECHSTER KONDRATIEFF: NACHHALTIGKEITSTRANSFORMATION",
        "subtitle": "Technologie, Kapital, Regulierung und Wirkungskompetenz als neue lange Welle.",
        "left_title": "Alte Wellen",
        "left_items": ["Innovation schuf Wachstum, aber oft mit externen Kosten.", "Produktivität wurde nicht systematisch an Wirkung gekoppelt.", "Folgen wurden später repariert."],
        "nodes": ["Klima", "Energie", "KI", "Daten", "Kreislauf", "Gesundheit", "Bildung", "Kapital"],
        "right_title": "Neue Welle",
        "right_steps": ["Ressourcenproduktivität", "Wirkungskompetenz", "digitale Transparenz", "regenerative Wertschöpfung"],
        "principles": ["Innovation", "Transformation", "Resilienz", "SDG+", "Rückkopplung"],
        "footer": "Die nächste Wachstumswelle entsteht nicht durch mehr Verbrauch, sondern durch bessere Wirkung.",
    },
}


def normalize_key(stem: str):
    return stem.removesuffix("_mobile")


def item_icons(items):
    kinds = ["target", "leaf", "people", "scale", "chart", "data", "shield", "book", "home", "euro"]
    return [kinds[i % len(kinds)] for i in range(len(items))]


def draw_desktop(defn, out_path):
    W, H = 1800, 1050
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, W, 10), fill=NAVY)
    draw_text(draw, (70, 34), defn["title"], F["title"], NAVY, width=1390, line_gap=4, max_lines=2)
    draw_text(draw, (72, 116), defn["subtitle"], F["sub"], MUTED, width=1250, line_gap=5, max_lines=2)
    draw_mpd(draw, 1620, 36, 1.08)
    draw.line((70, 188, 1730, 188), fill=LINE, width=2)

    # Left panel
    lx, ly, lw, lh = 55, 218, 350, 575
    rect(draw, (lx, ly, lx + lw, ly + lh), fill="#FFFFFF")
    draw_text(draw, (lx + 26, ly + 26), defn["left_title"].upper(), F["h"], NAVY, width=lw - 52, max_lines=2)
    y = ly + 92
    colors = [GREEN, TEAL, GOLD, PURPLE, RED]
    for i, item in enumerate(defn["left_items"][:6]):
        icon(draw, lx + 45, y + 28, item_icons(defn["left_items"])[i], colors[i % len(colors)], 24)
        draw_text(draw, (lx + 84, y + 5), item, F["body_s"], INK, width=lw - 114, line_gap=4, max_lines=3)
        y += 78

    # Center panel
    cx, cy, cw, ch = 435, 218, 910, 575
    rect(draw, (cx, cy, cx + cw, cy + ch), fill="#FFFFFF")
    draw_text(draw, (cx + 30, cy + 22), "WIRKUNGSRAUM - DYNAMISCHE WECHSELWIRKUNGEN", F["h"], NAVY, width=cw - 60, max_lines=1)
    mx, my = cx + cw / 2, cy + ch / 2 + 35
    draw.ellipse((mx - 118, my - 118, mx + 118, my + 118), fill=NAVY, outline=NAVY)
    center_text(draw, (mx - 100, my - 83, mx + 100, my + 74), "WIRKUNG\nMESSBAR\nSTEUERBAR", font(27, True), fill="#FFFFFF", max_lines=4)
    nodes = defn["nodes"][:9]
    radius = 245 if len(nodes) > 6 else 225
    for i, node in enumerate(nodes):
        ang = -math.pi / 2 + i * 2 * math.pi / len(nodes)
        nx, ny = mx + radius * math.cos(ang), my + radius * math.sin(ang)
        fill = [SOFT_GREEN, SOFT_GOLD, SOFT_BLUE, "#F4EEF7"][i % 4]
        color = [GREEN, GOLD, TEAL, PURPLE][i % 4]
        draw.line((mx, my, nx, ny), fill="#C7CCC8", width=2)
        draw.ellipse((nx - 67, ny - 67, nx + 67, ny + 67), fill=fill, outline=color, width=3)
        icon(draw, nx, ny - 16, item_icons(nodes)[i], color, 20)
        center_text(draw, (nx - 58, ny + 8, nx + 58, ny + 56), node, F["label"], NAVY, max_lines=2)
    # Feedback ring
    draw.arc((mx - 320, my - 320, mx + 320, my + 320), 205, 335, fill=GREEN, width=4)
    draw.arc((mx - 320, my - 320, mx + 320, my + 320), 25, 155, fill=GOLD, width=4)
    arrow(draw, (mx + 275, my - 160), (mx + 306, my - 110), fill=GREEN, width=3)
    arrow(draw, (mx - 275, my + 160), (mx - 306, my + 110), fill=GOLD, width=3)

    # Right panel
    rx, ry, rw, rh = 1375, 218, 370, 575
    rect(draw, (rx, ry, rx + rw, ry + rh), fill="#FFFFFF")
    draw_text(draw, (rx + 28, ry + 26), defn["right_title"].upper(), F["h"], NAVY, width=rw - 56, max_lines=2)
    y = ry + 106
    for i, step in enumerate(defn["right_steps"][:5]):
        color = [GREEN, TEAL, GOLD, RED, PURPLE][i % 5]
        icon(draw, rx + 47, y + 33, item_icons(defn["right_steps"])[i], color, 25)
        draw_text(draw, (rx + 86, y + 10), step, F["body_s"], INK, width=rw - 118, line_gap=4, max_lines=3)
        if i < len(defn["right_steps"][:5]) - 1:
            arrow(draw, (rx + 47, y + 60), (rx + 47, y + 83), fill=LINE, width=2)
        y += 89

    # Principles
    py = 820
    ps = defn["principles"][:7]
    gap = 16
    pw = (W - 140 - gap * (len(ps) - 1)) / len(ps)
    for i, p in enumerate(ps):
        x = 70 + i * (pw + gap)
        rect(draw, (x, py, x + pw, py + 96), fill="#FFFFFF", radius=16)
        icon(draw, x + 35, py + 48, item_icons(ps)[i], [GREEN, TEAL, GOLD, PURPLE, RED][i % 5], 20)
        draw_text(draw, (x + 66, py + 22), p, F["body_s"], NAVY, width=pw - 82, max_lines=2)

    rect(draw, (70, 944, 1730, 1008), fill=NAVY, outline=NAVY, radius=12)
    draw_text(draw, (102, 965), defn["footer"], F["body"], "#FFFFFF", width=1540, max_lines=2)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, optimize=True, compress_level=9)


def draw_mobile(defn, out_path):
    W, H = 900, 1500
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, W, 9), fill=NAVY)
    title_font = font(40 if len(defn["title"]) < 34 else 34, serif=True)
    title_end = draw_text(draw, (42, 32), defn["title"], title_font, NAVY, width=688, line_gap=2)
    sub_end = draw_text(draw, (44, title_end + 18), defn["subtitle"], F["sub_m"], MUTED, width=770, line_gap=5, max_lines=3)
    draw_mpd(draw, 748, 34, 0.78)
    y = max(238, sub_end + 64)

    def section(title, items, fill="#FFFFFF"):
        nonlocal y
        rect(draw, (38, y, 862, y + 248), fill=fill, radius=24)
        draw_text(draw, (68, y + 24), title.upper(), F["h_m"], NAVY, width=760, max_lines=2)
        yy = y + 78
        for i, item in enumerate(items[:4]):
            color = [GREEN, TEAL, GOLD, RED][i % 4]
            icon(draw, 92, yy + 22, item_icons(items)[i], color, 21)
            draw_text(draw, (128, yy + 1), item, F["body_m"], INK, width=690, line_gap=4, max_lines=2)
            yy += 44
        y += 272

    section(defn["left_title"], defn["left_items"], "#FFFFFF")
    # Step list
    rect(draw, (38, y, 862, y + 448), fill="#FFFFFF", radius=24)
    draw_text(draw, (68, y + 24), "WIRKUNGSPFAD", F["h_m"], NAVY, width=740)
    nodes = defn["nodes"][:6]
    yy = y + 82
    for i, node in enumerate(nodes):
        color = [GREEN, TEAL, GOLD, PURPLE, RED, GREEN_DARK][i % 6]
        draw.ellipse((72, yy, 122, yy + 50), fill=[SOFT_GREEN, SOFT_BLUE, SOFT_GOLD, "#F4EEF7", SOFT_RED, SOFT_GREEN][i % 6], outline=color, width=3)
        center_text(draw, (72, yy, 122, yy + 50), str(i + 1), F["label"], color, max_lines=1)
        draw_text(draw, (148, yy + 8), node, F["body_m"], NAVY, width=620, max_lines=2)
        if i < len(nodes) - 1:
            arrow(draw, (97, yy + 54), (97, yy + 72), fill=LINE, width=2)
        yy += 56
    y += 472
    section(defn["right_title"], defn["right_steps"], SOFT_GREEN)

    rect(draw, (38, y, 862, min(y + 150, H - 38)), fill=NAVY, outline=NAVY, radius=20)
    draw_text(draw, (68, y + 28), defn["footer"], F["body_m"], "#FFFFFF", width=748, max_lines=3)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, optimize=True, compress_level=9)


def should_render(path: Path):
    rel = path.relative_to(ROOT).as_posix()
    if not rel.startswith("assets/visuals/"):
        return False
    if "/hero/" in rel or "/rejected/" in rel or "/icons/" in rel or "/diagrams/" in rel:
        return False
    return path.suffix == ".svg"


def main():
    rendered = []
    for svg in sorted((ROOT / "assets/visuals").rglob("*.svg")):
        if not should_render(svg):
            continue
        stem = svg.stem
        key = normalize_key(stem)
        defn = DATA.get(key, base_definition(key))
        out = svg.with_suffix(".png")
        if stem.endswith("_mobile"):
            draw_mobile(defn, out)
        else:
            draw_desktop(defn, out)
        rendered.append(out.relative_to(ROOT).as_posix())
    print(f"Rendered {len(rendered)} professional raster infographics")
    for item in rendered:
        print(item)


if __name__ == "__main__":
    main()

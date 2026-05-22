from __future__ import annotations

from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

NAVY = "#0b1b36"
IVORY = "#f7f4ec"
GREEN = "#2d7f5f"
GOLD = "#c9932e"
CORAL = "#c95749"
LINE = "#d7d0c1"
MUTED = "#3d4656"


STYLE = f"""
  .bg{{fill:{IVORY}}}.navy{{fill:{NAVY}}}.green{{fill:{GREEN}}}.gold{{fill:{GOLD}}}.coral{{fill:{CORAL}}}.muted{{fill:{MUTED}}}
  .line{{stroke:{LINE};stroke-width:2;fill:none}}.nline{{stroke:{NAVY};stroke-width:2.4;fill:none}}.gline{{stroke:{GREEN};stroke-width:2.4;fill:none}}.oline{{stroke:{GOLD};stroke-width:2.4;fill:none}}.cline{{stroke:{CORAL};stroke-width:2.4;fill:none}}
  .card{{fill:rgba(255,255,255,.55);stroke:{LINE};stroke-width:2}}.softn{{fill:#edf1f7;stroke:{NAVY};stroke-width:2}}.softg{{fill:#eaf3ee;stroke:{GREEN};stroke-width:2}}.softo{{fill:#f6edda;stroke:{GOLD};stroke-width:2}}.softc{{fill:#f6e5e1;stroke:{CORAL};stroke-width:2}}
  .title{{font-family:Georgia,'Times New Roman',serif;font-size:54px;font-weight:700;letter-spacing:4px}}.subtitle{{font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:1.1px}}
  .kicker{{font-family:Inter,Arial,sans-serif;font-size:16px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase}}.h{{font-family:Inter,Arial,sans-serif;font-size:23px;font-weight:800}}.body{{font-family:Inter,Arial,sans-serif;font-size:17px}}.small{{font-family:Inter,Arial,sans-serif;font-size:14px}}.num{{font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700}}
"""


def text_lines(text: str, x: int, y: int, width: int, cls: str = "body muted", line_h: int = 23) -> str:
    words = text.split()
    lines: list[str] = []
    current = ""
    max_chars = max(18, width // 9)
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) > max_chars and current:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return "\n".join(
        f'<text x="{x}" y="{y + i * line_h}" class="{cls}">{escape(line)}</text>'
        for i, line in enumerate(lines[:3])
    )


def svg_shell(width: int, height: int, title: str, desc: str, inner: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
  <title id="title">{escape(title)}</title>
  <desc id="desc">{escape(desc)}</desc>
  <defs><style>{STYLE}</style><marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M2 2 L10 6 L2 10 Z" fill="{GOLD}"/></marker></defs>
  <rect class="bg" width="{width}" height="{height}"/>
  <rect x="28" y="28" width="{width - 56}" height="{height - 56}" rx="18" fill="none" stroke="{LINE}" stroke-width="2"/>
  {inner}
</svg>
"""


def header(title: str, subtitle: str, width: int = 1800) -> str:
    return f"""
  <text x="{width // 2}" y="88" class="title navy" text-anchor="middle">{escape(title)}</text>
  <text x="{width // 2}" y="128" class="subtitle gold" text-anchor="middle">{escape(subtitle)}</text>
  <line x1="160" y1="154" x2="{width - 160}" y2="154" class="line"/>
"""


def desktop_cards(title: str, subtitle: str, nodes: list[tuple[str, str, str]], footer: str) -> str:
    positions = [(150, 238), (525, 238), (900, 238), (1275, 238), (150, 602), (525, 602), (900, 602), (1275, 602)]
    chunks = [header(title, subtitle)]
    for i, (head, body, tone) in enumerate(nodes):
        x, y = positions[i]
        cls = {"navy": "softn", "green": "softg", "gold": "softo", "coral": "softc"}.get(tone, "card")
        chunks.append(f'<rect x="{x}" y="{y}" width="320" height="178" rx="20" class="{cls}"/>')
        chunks.append(f'<text x="{x + 24}" y="{y + 45}" class="num {tone if tone in ["green","gold","coral"] else "navy"}">{i + 1}</text>')
        chunks.append(f'<text x="{x + 72}" y="{y + 45}" class="h navy">{escape(head)}</text>')
        chunks.append(text_lines(body, x + 24, y + 83, 270))
        if i < 7:
            nx, ny = positions[i + 1]
            if ny == y:
                chunks.append(f'<line x1="{x + 320}" y1="{y + 89}" x2="{nx - 18}" y2="{ny + 89}" class="oline" marker-end="url(#arrow)"/>')
    chunks.append(f'<rect x="132" y="842" width="1536" height="86" rx="18" class="card"/>{text_lines(footer, 178, 892, 1420, "body navy", 25)}')
    return svg_shell(1800, 1000, title, subtitle, "\n".join(chunks))


def mobile_cards(title: str, subtitle: str, nodes: list[tuple[str, str, str]], footer: str) -> str:
    chunks = [f'<text x="450" y="74" class="title navy" text-anchor="middle">{escape(title)}</text>',
              f'<text x="450" y="116" class="subtitle gold" text-anchor="middle">{escape(subtitle)}</text>',
              '<line x1="70" y1="145" x2="830" y2="145" class="line"/>']
    y = 190
    for i, (head, body, tone) in enumerate(nodes):
        cls = {"navy": "softn", "green": "softg", "gold": "softo", "coral": "softc"}.get(tone, "card")
        chunks.append(f'<rect x="74" y="{y}" width="752" height="112" rx="18" class="{cls}"/>')
        chunks.append(f'<text x="108" y="{y + 42}" class="num {tone if tone in ["green","gold","coral"] else "navy"}">{i + 1}</text>')
        chunks.append(f'<text x="160" y="{y + 42}" class="h navy">{escape(head)}</text>')
        chunks.append(text_lines(body, 160, y + 74, 590, "small muted", 20))
        y += 134
    chunks.append(f'<rect x="74" y="{y + 12}" width="752" height="96" rx="18" class="card"/>{text_lines(footer, 108, y + 54, 650, "small navy", 21)}')
    return svg_shell(900, y + 146, title, subtitle, "\n".join(chunks))


def hero_desktop() -> str:
    inner = header("WIRKUNG STATT KAPITAL", "Der neue Kompass für Mensch, Planet und Demokratie")
    inner += """
  <g transform="translate(284 230)">
    <rect x="0" y="0" width="360" height="320" rx="28" class="softn"/>
    <text x="42" y="70" class="h navy">Alte Logik</text>
    <text x="42" y="116" class="body muted">Kapital · Gewinn · Wachstum</text>
    <text x="42" y="146" class="body muted">messen Bewegung, nicht Richtung.</text>
    <line x1="50" y1="210" x2="300" y2="210" class="cline"/>
  </g>
  <g transform="translate(720 246)">
    <circle cx="180" cy="148" r="122" fill="none" stroke="#0b1b36" stroke-width="4"/>
    <circle cx="94" cy="184" r="92" fill="none" stroke="#2d7f5f" stroke-width="4"/>
    <circle cx="266" cy="184" r="92" fill="none" stroke="#c9932e" stroke-width="4"/>
    <text x="180" y="154" class="h navy" text-anchor="middle">positive</text>
    <text x="180" y="184" class="h navy" text-anchor="middle">Netto-Wirkung</text>
    <text x="180" y="24" class="body navy" text-anchor="middle">Mensch</text>
    <text x="62" y="300" class="body green" text-anchor="middle">Planet</text>
    <text x="298" y="300" class="body gold" text-anchor="middle">Demokratie</text>
  </g>
  <g transform="translate(1156 230)">
    <rect x="0" y="0" width="360" height="320" rx="28" class="softg"/>
    <text x="42" y="70" class="h navy">Neue Logik</text>
    <text x="42" y="116" class="body muted">Wirkung zeigt, welche Zustände</text>
    <text x="42" y="146" class="body muted">sich tatsächlich verändern.</text>
    <line x1="50" y1="210" x2="300" y2="210" class="gline"/>
  </g>
  <path d="M660 390 C700 340 722 332 748 324" class="oline" marker-end="url(#arrow)"/>
  <path d="M1052 324 C1092 332 1118 350 1146 390" class="oline" marker-end="url(#arrow)"/>
  <rect x="350" y="710" width="1100" height="92" rx="22" class="card"/>
  <text x="900" y="765" class="h navy" text-anchor="middle">Kapital bleibt Werkzeug. Wirkung wird Kompass.</text>
"""
    return svg_shell(1800, 900, "Wirkung statt Kapital", "Der neue Kompass", inner)


def hero_mobile() -> str:
    nodes = [
        ("Alte Logik", "Kapital, Gewinn und Wachstum messen Bewegung, aber nicht Richtung.", "navy"),
        ("Neuer Kompass", "Wirkung wird an Mensch, Planet und Demokratie gelesen.", "green"),
        ("Zielgröße", "positive Netto-Wirkung statt blinder Kapitalbewegung.", "gold"),
    ]
    return mobile_cards("WIRKUNG STATT KAPITAL", "Mensch · Planet · Demokratie", nodes, "Kapital bleibt Werkzeug. Wirkung wird Kompass.")


VISUALS = {
    "model/woek_funktionsweise_kreislauf": (
        "WIRKUNG WIRD STEUERBAR",
        "Bewertung · Rückkopplung · Lernen",
        [
            ("Wirkung", "tatsächliche Veränderung von Zuständen, nicht Absicht und nicht Output.", "green"),
            ("Wirkungsbewertung", "Einordnung am Rahmen SDGs, Agenda 2030 und SDG+.", "navy"),
            ("Netto-Wirkung", "positive und negative Wirkungen werden zusammen gelesen.", "gold"),
            ("Schutzregel", "negative Wirkung darf nicht durch gute Felder verdeckt werden.", "coral"),
            ("Wirkungslenkung", "Bewertung wird entscheidungsrelevant.", "gold"),
            ("Rückkopplung", "Preise, Steuern, Kapital, Beschaffung und Haushalt reagieren.", "green"),
            ("Reverse Merit Order", "das schwächste relevante Wirkungsfeld begrenzt die Gesamtbewertung.", "coral"),
            ("Lernen", "Daten, Evaluation und Wirkungsrat passen das System an.", "navy"),
        ],
        "Die Funktionsweise verbindet Wirkung, Bewertung, Schutzregel und Rückkopplung zu einem lernenden Steuerungssystem.",
    ),
    "explainers/woek_wirkung_einfach_flow": (
        "WIRKUNG EINFACH ERKLÄRT",
        "Ursache · Zustandsveränderung · SDG-Bezug",
        [
            ("Auslöser", "ein Produkt, Gesetz, Preis, Narrativ oder Kapitalfluss setzt Wirkungspotenzial frei.", "navy"),
            ("Wirkungspotenzial", "mögliche positive, negative oder ambivalente Wirkung entsteht.", "gold"),
            ("Zustand", "Klima, Vertrauen, Gesundheit, Arbeit oder Teilhabe verändern sich real.", "green"),
            ("SDG-Bezug", "die Veränderung wird am Rahmen SDGs, Agenda 2030 und SDG+ eingeordnet.", "navy"),
            ("Netto-Wirkung", "Chancen, Schäden und Zielkonflikte werden gemeinsam gelesen.", "gold"),
            ("Entscheidung", "die Einordnung verändert Preise, Kapital, Management oder Politik.", "green"),
        ],
        "Didaktische Kurzlogik: Nicht die Absicht entscheidet, sondern die nachweisbare Zustandsveränderung.",
    ),
    "flows/woek_medien_demokratie_wirkpfade": (
        "SPRACHE ALS WIRKUNGSPOTENZIAL",
        "Frames · Resonanzräume · Demokratie",
        [
            ("Begriff / Frame", "politische Sprache setzt Deutung und Aufmerksamkeit.", "navy"),
            ("Resonanzraum", "Angst, Vertrauen, Wut, Verantwortung oder Zugehörigkeit werden aktiviert.", "gold"),
            ("Wirkungspotenzial", "Aussagen können Polarisierung, Klärung oder Handlungsfähigkeit begünstigen.", "green"),
            ("Desinformation", "unklare Quellen und Wiederholung verschieben Wahrnehmung.", "coral"),
            ("Vertrauen", "nachvollziehbare Sprache stärkt demokratische Orientierung.", "green"),
            ("Demokratie", "Wirkung wird als Beitrag zu Rechtsstaat, Diskurs und Teilhabe gelesen.", "navy"),
        ],
        "Die Grafik behauptet keine automatische Einzelwirkung. Sie zeigt Wirkungspotenziale und Resonanzrisiken.",
    ),
    "flows/woek_unternehmen_wirkungsnetz": (
        "UNTERNEHMEN ALS WIRKUNGSSYSTEM",
        "Lieferketten · Kapital · T-SROI",
        [
            ("Lieferkette", "Wasser, Arbeit, Klima und Governance werden als Wirkungsräume sichtbar.", "green"),
            ("WÖk-ID", "Daten werden vergleichbar und anschlussfähig.", "navy"),
            ("Scorecard", "Wirkungsfelder werden strukturiert gelesen.", "gold"),
            ("T-SROI", "Transformationswirkung ergänzt klassische Wirtschaftlichkeit.", "green"),
            ("Kapital", "Finanzierung liest Wirkung als Risiko- und Zukunftsinformation.", "navy"),
            ("Management", "Einkauf, CAPEX, Innovation und Strategie werden rückgekoppelt.", "green"),
        ],
        "Von ESG als Berichtspflicht zu Wirkung als Steuerungslogik für resiliente Unternehmen.",
    ),
    "flows/woek_politik_wirkungssteuerung": (
        "POLITIK ALS WIRKUNGSARCHITEKTUR",
        "Wirkungsgesetz · Wirkungshaushalt · SDG-Steuerung",
        [
            ("Politisches Ziel", "eine Maßnahme beginnt mit einer Wirkungsfrage.", "navy"),
            ("Wirkungsprüfung", "Zielkonflikte und Folgekosten werden vorab sichtbar.", "gold"),
            ("Wirkungshaushalt", "öffentliche Mittel werden nach Prävention und Netto-Wirkung gelesen.", "green"),
            ("Wirkungsgesetz", "Recht übersetzt Wirkung in überprüfbare Rückkopplung.", "navy"),
            ("Beschaffung", "öffentliche Nachfrage stärkt positive Wirkung.", "green"),
            ("Evaluation", "Politik lernt aus Daten statt nur aus Streit.", "gold"),
        ],
        "Wirkungsorientierte Politik ersetzt Bürokratie nicht durch Moral, sondern durch bessere Rückkopplung.",
    ),
    "explainers/woek_buerger_alltag_wirkung": (
        "ALLTAG UND WIRKUNG",
        "Wohnen · Einkommen · Rente · Konsum",
        [
            ("Wohnen", "Bezahlbarkeit, Energie, Gesundheit und Quartier werden zusammen gelesen.", "green"),
            ("Konsum", "Preise zeigen mehr Wirkungswahrheit statt nur Knappheit.", "gold"),
            ("Wirkungseinkommen", "Sicherheit und Teilhabe werden als Konzeptarchitektur gedacht.", "navy"),
            ("Wirkungsrente", "Care, Pflege, Bildung und Generationenstabilität werden sichtbar.", "green"),
            ("Information", "Scanner und Quellenklarheit entlasten moralische Einzelprüfung.", "navy"),
            ("Handlungsspielraum", "Bürger:innen gewinnen Orientierung statt Schuldgefühl.", "gold"),
        ],
        "Die WÖk bewertet keine Personen. Sie macht Systemsignale im Alltag lesbarer.",
    ),
    "model/woek_akademie_lernarchitektur": (
        "AKADEMIE DER WIRKUNGSKOMPETENZ",
        "Lernen · Anwenden · Reflektieren",
        [
            ("Begriffe", "Wirkung, Wirkungspotenzial und Netto-Wirkung sauber unterscheiden.", "navy"),
            ("Daten lesen", "Quellen, Scorecards, Standards und Grenzen verstehen.", "gold"),
            ("Wirkungspfade", "Ursache, Resonanzraum und Zustandsveränderung verbinden.", "green"),
            ("Anwendung", "Produkte, Unternehmen, Politik und Sprache einordnen.", "navy"),
            ("Zielkonflikte", "nicht moralisch reagieren, sondern systemisch prüfen.", "coral"),
            ("Kompetenz", "Wirkung führen, erklären und weiterentwickeln.", "green"),
        ],
        "Die Akademie macht aus dem Modell eine Lernarchitektur für systemisches Denken.",
    ),
}


def kondratieff_desktop() -> str:
    inner = header("DIE KONDRATIEFF-ZYKLEN", "Von industrieller Wertschöpfung zur Wirkungsökonomie")
    xs = [160, 410, 660, 910, 1160, 1410]
    labels = [
        ("1.", "Dampf · Mechanisierung"),
        ("2.", "Eisenbahn · Stahl"),
        ("3.", "Elektrizität · Chemie"),
        ("4.", "Öl · Automobilität"),
        ("5.", "Information · Digitalisierung"),
        ("6.", "Nachhaltigkeit · Wirkung"),
    ]
    for i, x in enumerate(xs):
        color = GOLD if i == 5 else GREEN if i in (3, 4) else NAVY
        inner += f'<line x1="{x}" y1="250" x2="{x}" y2="700" class="line"/><text x="{x + 20}" y="250" class="h" fill="{color}">{labels[i][0]} Kondratieff</text><text x="{x + 20}" y="286" class="body muted">{labels[i][1]}</text>'
    path = "M120 650 C220 510 300 510 400 650 C500 420 585 420 680 650 C790 405 900 405 1010 650 C1110 470 1200 470 1300 650 C1400 430 1500 430 1600 650 C1640 610 1675 570 1710 520"
    inner += f'<path d="{path}" fill="none" stroke="{NAVY}" stroke-width="5"/><path d="M1300 650 C1400 430 1500 430 1600 650 C1640 610 1675 570 1710 520" fill="none" stroke="{GOLD}" stroke-width="6" marker-end="url(#arrow)"/>'
    inner += '<rect x="180" y="780" width="1440" height="96" rx="20" class="card"/><text x="900" y="836" class="h navy" text-anchor="middle">Kondratieff ist Deutungsfolie, nicht Naturgesetz. Die 6. Welle braucht Rückkopplung: Wirkung wird Betriebssystem der Transformation.</text>'
    return svg_shell(1800, 980, "Kondratieff-Zyklen", "6. Welle", inner)


def write(path: str, content: str) -> None:
    target = ROOT / "assets" / "visuals" / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def main() -> None:
    write("hero/woek_start_hero_architecture.svg", hero_desktop())
    write("hero/woek_start_hero_architecture_mobile.svg", hero_mobile())
    for name, (title, subtitle, nodes, footer) in VISUALS.items():
        write(f"{name}.svg", desktop_cards(title, subtitle, nodes, footer))
        write(f"{name}_mobile.svg", mobile_cards(title, subtitle, nodes, footer))
    # Kondratieff is intentionally excluded here. The public page uses the
    # approved Brand-Guide visual copied to assets/visuals/model as JPG/WebP.


if __name__ == "__main__":
    main()

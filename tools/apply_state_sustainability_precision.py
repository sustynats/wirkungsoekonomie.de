#!/usr/bin/env python3
"""Apply remaining fach-approved #253 precision corrections.

Targets only living/current pages with confirmed overclaims plus transparent addenda on the
political-impact dossier/detail concept. It is idempotent and does not mutate downloadable
historical artefacts.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "state-sustainability-precision-20260821"


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def write(rel: str, text: str) -> None:
    (ROOT / rel).write_text(text, encoding="utf-8")


def replace_once(rel: str, old: str, new: str) -> bool:
    """Replace every identical approved anchor in a page.

    Some SEO strings intentionally occur in description/OG/Twitter metadata. The Fach
    correction is the same for each occurrence, so repeated identical anchors are valid;
    absence is still fail-closed.
    """
    text = read(rel)
    if new in text and old not in text:
        return False
    n = text.count(old)
    if n == 0:
        raise RuntimeError(f"{rel}: approved anchor not found: {old[:120]!r}")
    write(rel, text.replace(old, new))
    return True


def add_before_main(rel: str, block: str, marker: str) -> bool:
    text = read(rel)
    if marker in text:
        return False
    if "</main>" not in text:
        raise RuntimeError(f"{rel}: no </main>")
    write(rel, text.replace("</main>", block + "</main>", 1))
    return True


def current_method_addendum(title: str) -> str:
    return f'''\n<!-- {MARKER}-political-impact -->
<section class="section section-muted" id="fachaddendum-2026-08-21" aria-labelledby="fachaddendum-2026-08-21-title">
  <div class="section-header">
    <p class="hero-kicker">Fachaddendum · Methodenstand 21.08.2026</p>
    <h2 id="fachaddendum-2026-08-21-title">{title}: Anschluss an GFA, Nachhaltigkeitsprüfung und eNAP</h2>
    <p>Diese Onlinefassung wird mit dem heutigen Methodenstand präzisiert. Politische Folgenprüfung beginnt in Deutschland nicht bei der WÖk: § 43 GGO verlangt in der Gesetzesbegründung unter anderem Ziel und Notwendigkeit, Sachverhalt und Erkenntnisquellen sowie andere Lösungsmöglichkeiten und die Gründe für ihre Ablehnung. § 44 GGO umfasst wesentliche beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen, Nachhaltigkeitsbezug und langfristige Wirkungen; Absatz 7 enthält Vorgaben zur späteren Überprüfung. eNAP/eGFA unterstützt die Nachhaltigkeitsprüfung digital, die DNS liefert Ziele, Indikatoren und Monitoring.</p>
    <p>Die WÖk-Erweiterung liegt deshalb in der durchgängigen objektspezifischen Kette: <strong>Problem Review → Goal Review → A→M→ΔZ→R → Wirkungen 1.–3. Ordnung/Kaskaden → Verteilung/Resilienz → Gegenfaktum/Zurechnung → ausgelassene Wirkungen, Umsetzbarkeit und Kohärenz → vergleichbare Optionen → Nichtkompensation → Reality Check und versioniertes Lernen.</strong></p>
    <p>Ein DNS-/SDG-Zielbezug oder die Bewegung eines Indikators ist kein Kausalitätsbeweis. Eine öffentliche Nachhaltigkeitsdarstellung in einer Gesetzesbegründung ist außerdem nicht automatisch ein veröffentlichter eNAP-Rohexport.</p>
    <p><a class="text-link" href="/blog/enap-woek-benchmark-fuenf-bundesvorhaben.html">Fünf reale Bundesvorhaben im GFA/eNAP × WÖk-Benchmark</a> · <a class="text-link" href="/methodik/datenbasis.html">Daten- und Quellenfunktionen</a></p>
  </div>
</section>\n'''


def main() -> int:
    changed = []

    rel = "modell.html"
    if replace_once(
        rel,
        "Das System misst Bewegung, Kapital und Output - aber nicht zuverlässig, was dadurch mit Mensch, Planet und Demokratie geschieht.",
        "Wirkungsblindheit heißt nicht, dass keinerlei Folgen geprüft oder Daten erhoben werden. Gemeint ist eine strukturelle Lücke, wenn relevante Zustandsveränderungen, Nebenwirkungen, Zurechnung oder Lernschleifen nicht zuverlässig erkannt und in Entscheidungen zurückgeführt werden.",
    ):
        changed.append(rel)

    rel = "verstehen/ausgangslage/index.html"
    if replace_once(
        rel,
        'content="Klima, Demokratie, Gesundheit, Infrastruktur, Vermögensrisiken: Die Krisen haben eine gemeinsame Ursache - wirkungsblinde Steuerung ohne Rückkopplung. Die nüchterne Diagnose als Einstieg in die Wirkungsökonomie."',
        'content="Klima, Demokratie, Gesundheit, Infrastruktur, Vermögensrisiken: Die Diagnose der Wirkungsökonomie ist eine unvollständige Rückkopplung realer Folgen - trotz bestehender Folgen-, Nachhaltigkeits- und Monitoringstrukturen. Ein nüchterner Einstieg."',
    ):
        changed.append(rel)
    if replace_once(
        rel,
        '<p class="hero-subtitle">Viele Krisen gleichzeitig - das wirkt überwältigend. Aber es sind nicht viele Probleme. Es ist ein Konstruktionsfehler: Unsere Steuerung ist wirkungsblind. Diese Seite ordnet die Lage nüchtern - als Diagnose, nicht als Alarm.</p>',
        '<p class="hero-subtitle">Viele Krisen gleichzeitig - das wirkt überwältigend. Die WÖk-Diagnose ist kein völliges Fehlen von Prüfung: Deutschland besitzt Folgen-, Nachhaltigkeits- und Monitoringstrukturen. Der Konstruktionsfehler liegt dort, wo reale Folgen, Nebenwirkungen, Zurechnung und spätere Beobachtung noch nicht durchgängig in Entscheidungen und Anreize zurückfließen. Diese Seite ordnet die Lage nüchtern - als Diagnose, nicht als Alarm.</p>',
    ):
        changed.append(rel)
    if replace_once(
        rel,
        'Preise, Gewinne und Wachstum transportieren keine Information über reale Folgen. Was ein Produkt, eine Investition oder ein Gesetz bei Menschen, Ökosystemen und demokratischen Institutionen tatsächlich anrichtet oder aufbaut, fließt nicht in die Entscheidung zurück. Es fehlt die Rückkopplung. Ein System ohne Rückkopplung driftet - nicht aus Bosheit, sondern aus Blindheit. Deshalb treten die Krisen gemeinsam auf: Sie haben dieselbe Ursache.',
        'Preise, Gewinne und Wachstum transportieren reale Folgen nicht automatisch als Entscheidungssignal. Bei Bundesgesetzen existieren zugleich bereits Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung, DNS-Monitoring und eNAP/eGFA. Die WÖk-Kritik richtet sich deshalb auf die unvollständig geschlossene Rückkopplung: Ob und wie ein Produkt, eine Investition oder ein Gesetz Zustände bei Menschen, Ökosystemen und demokratischen Institutionen verändert, muss über Wirkmechanismen, Nebenfolgen, Zurechnung und spätere Beobachtung bis in die nächste Entscheidung zurückgeführt werden.',
    ):
        changed.append(rel)
    if replace_once(
        rel,
        'Wachstum und Gewinn messen Bewegung, nicht Richtung. Kontrolle und Berichte messen Absicht, nicht Wirkung. Beides ersetzt keine Rückkopplung realer Folgen.',
        'Wachstum und Gewinn messen wirtschaftliche Größen, aber nicht automatisch Richtung und Gesamtwirkung. Kontrolle, Berichte und staatliche Folgenprüfungen liefern bereits wichtige Ziel-, Prüf- und Monitoringinformationen. Sie sind jedoch nicht identisch mit einer vollständig geschlossenen Kausal-, Zurechnungs- und Lernschleife realer Folgen.',
    ):
        changed.append(rel)
    if replace_once(
        rel,
        'Wer jede Krise einzeln bekämpft, kämpft ewig gegen Symptome. Wer die Rückkopplung repariert - Wirkung messen, bewerten, in Preise, Regeln und Kapital zurückführen -, adressiert die Ursache. Genau das ist der Vorschlag der Wirkungsökonomie: kein Appell, sondern ein Mechanismus.',
        'Wer nur einzelne Symptome betrachtet, übersieht Wechselwirkungen. Die WÖk schlägt deshalb vor, bestehende Mess-, Folgenprüfungs- und Monitoringstrukturen zu einer durchgängigen Rückkopplung zu verbinden: Problem und Ziel prüfen, Wirkmechanismen und Alternativen vergleichen, reale Folgen beobachten und Erkenntnisse in Preise, Regeln, Kapital und die nächste Entscheidung zurückführen.',
    ):
        changed.append(rel)

    # Remaining living #253 routes explicitly classified for correction in the sitewide matrix.
    rel = "wirkungsoekonomie.html"
    if replace_once(
        rel,
        '<p class="card-text">Die Wirkungsökonomie entscheidet nicht aus dem Bauch heraus, was gut oder schlecht ist. Ihr Maßstab ist das, worauf sich die Weltgemeinschaft mit der Agenda 2030 verständigt hat: die SDGs. Ergänzt werden sie durch SDG+, weil Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit und gesellschaftlicher Zusammenhalt Voraussetzungen dafür sind, dass nachhaltige Entwicklung gelingt. Positive Wirkung liegt in der WÖk vor, wenn eine Zustandsveränderung auf SDGs, Agenda 2030 und SDG+ einzahlt. Negative Wirkung liegt vor, wenn sie diesen Rahmen schwächt.</p>',
        '<p class="card-text">Die Wirkungsökonomie entscheidet nicht aus dem Bauch heraus, was gut oder schlecht ist. Die 17 SDGs und die Agenda 2030 bilden einen internationalen Zielrahmen; für Deutschland konkretisiert die Deutsche Nachhaltigkeitsstrategie (DNS) Ziele, Indikatoren, Governance und Monitoring. SDG+ ist eine WÖk-eigene Erweiterung für zusätzliche demokratische, mediale, rechtliche und digitale Wirkungsräume. Diese Referenzen helfen, relevante Ziel- und Schutzräume zu bestimmen - sie beweisen aber nicht automatisch Wirkung oder Kausalität. Eine WÖk-Wirkungsbewertung fragt deshalb zusätzlich, welche Zustände sich tatsächlich verändern, über welchen Mechanismus, gegenüber welchem Gegenfaktum und mit welchen Neben-, Verteilungs- und Systemfolgen.</p>',
    ):
        changed.append(rel)

    rel = "verstehen.html"
    if replace_once(
        rel,
        '<p class="card-text">Bewertet wird am gemeinsamen Referenzrahmen der SDGs, der Agenda 2030 und SDG+. Drei Felder entscheiden über Zukunftsfähigkeit: Mensch, Planet und Demokratie.</p>',
        '<p class="card-text">Die SDGs und die Agenda 2030 liefern einen internationalen Zielrahmen; in Deutschland kommt die Deutsche Nachhaltigkeitsstrategie mit Zielen, Indikatoren und Monitoring hinzu. SDG+ ist eine WÖk-eigene Erweiterung. Zielbezug ist dabei noch kein Wirkungs- oder Kausalitätsnachweis: Entscheidend bleibt, welche Zustände sich für Mensch, Planet und Demokratie tatsächlich verändern.</p>',
    ):
        changed.append(rel)

    rel = "workflow.html"
    if replace_once(
        rel,
        '<p>Die SDGs liefern einen weltweit anerkannten Zielrahmen. CSRD, ESRS, GRI und andere Standards liefern strukturierte Nachhaltigkeitsdaten. Digitale Produktpässe schaffen produktbezogene Daten. Finanzmärkte und Versicherungen arbeiten bereits mit Risiko- und ESG-Daten. Die Wirkungsökonomie ergänzt die Rückkopplung in wirtschaftliche Entscheidungen.</p>',
        '<p>Die SDGs liefern einen weltweit anerkannten Zielrahmen. CSRD, ESRS, GRI und andere Standards liefern strukturierte Nachhaltigkeitsdaten. Digitale Produktpässe schaffen produktbezogene Daten. Finanzmärkte und Versicherungen arbeiten bereits mit Risiko- und ESG-Daten. Für deutsche öffentliche und regulatorische Fälle kommen die DNS mit ihren Indikatoren sowie GGO/GFA, Nachhaltigkeitsprüfung und eNAP/eGFA als bestehende Ziel-, Prüf- und Monitoringquellen hinzu. Diese Quellen sind nicht automatisch Kausalitätsnachweise. Die Wirkungsökonomie ergänzt die Rückkopplung in wirtschaftliche und - wo einschlägig - öffentliche Entscheidungen.</p>',
    ):
        changed.append(rel)

    rel = "kompass.html"
    if replace_once(
        rel,
        '<p>Vom Reparaturstaat zur frühen Wirkungsprüfung und Rückkopplung.</p>',
        '<p>Frühe Folgen- und Nachhaltigkeitsprüfung existiert im Bund bereits. Die WÖk verbindet diese Basis zusätzlich mit expliziten Wirkpfaden, Gegenfaktum, Verteilung, Optionsvergleich und wiederholbarer Rückkopplung.</p>',
    ):
        changed.append(rel)
    if replace_once(
        rel,
        '<li><a class="text-link" href="fuer/politik.html">Politik</a></li>',
        '<li><a class="text-link" href="fuer/politik.html">Politik</a> · <a class="text-link" href="methodik/datenbasis.html">staatliche Prüf- und Quellenarchitektur</a></li>',
    ):
        changed.append(rel)

    for rel, title in [
        ("werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/index.html", "Politische Wirkungsprüfung"),
        ("werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/index.html", "Detailkonzept Politische Wirkungsprüfung"),
    ]:
        if add_before_main(rel, current_method_addendum(title), f"{MARKER}-political-impact"):
            changed.append(rel)

    print(f"Applied #253 precision corrections to {len(set(changed))} files")
    for rel in sorted(set(changed)):
        print(rel)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

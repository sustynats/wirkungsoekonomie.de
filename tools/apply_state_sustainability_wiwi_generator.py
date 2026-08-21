#!/usr/bin/env python3
"""Make the generated Wirkungswissenschaften family natively #253-compliant.

The hub/subpages are rebuilt during every full website build. Patching only generated HTML would
therefore be unstable. This deterministic source patch inserts the approved state-architecture
continuity block into the generator itself and removes confirmed overclaims about established
impact-assessment/evaluation practice. It does not create new WÖk judgements.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REL = "scripts/wirkungswissenschaften/build-wirkungswissenschaften-hub.mjs"
MARKER = "state-sustainability-architecture-20260821"

STATE_BLOCK = r'''      <!-- state-sustainability-architecture-20260821 -->
      <section class="section section-muted" id="staatliche-nachhaltigkeitsarchitektur" aria-labelledby="staatliche-nachhaltigkeitsarchitektur-title">
        <div class="section-header">
          <p class="hero-kicker">Bestehende Staatsarchitektur und WÖk-Ergänzung</p>
          <h2 id="staatliche-nachhaltigkeitsarchitektur-title">Deutschland prüft Folgen bereits. Die WÖk führt die Ebenen systematisch zusammen.</h2>
          <p>Für Bundesregelungsvorhaben existiert bereits eine institutionalisierte Prüfarchitektur: Deutsche Nachhaltigkeitsstrategie, GGO/Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP/eGFA sowie Monitoring. § 43 GGO umfasst unter anderem Ziel, Sachverhalt und Alternativen; § 44 beabsichtigte und unbeabsichtigte Folgen, Nachhaltigkeitsbezug und Vorgaben zur späteren Überprüfung.</p>
          <p><strong>Die Wirkungsökonomie ersetzt diese Architektur nicht.</strong> Sie ergänzt sie um eine durchgängig objektspezifische Verbindung von Problemprüfung, Zielprüfung, expliziten Wirkpfaden (A→M→ΔZ→R), Wirkungen erster bis dritter Ordnung und Kaskaden, Verteilung und Resilienz, Gegenfaktum und Zurechnung, Omissions-/Delivery-/Kohärenzprüfung, strukturiertem Optionsvergleich, Nichtkompensation und wiederholbarem Reality Check.</p>
          <p>Ein Bezug zu DNS, SDGs oder Indikatoren ist Ziel- und Referenzinformation - kein automatischer Kausalitätsnachweis. Indikator ist nicht Wirkung, Output ist nicht Outcome und Beobachtung ist nicht Zurechnung.</p>
          <p><a class="text-link" href="${base}methodik/">Zur WÖk-Methodik</a> · <a class="text-link" href="${base}methodik/datenbasis.html">Zu Daten- und Quellenfunktionen</a> · <a class="text-link" href="${base}blog/enap-woek-benchmark-fuenf-bundesvorhaben.html">Zum Fünf-Fälle-Benchmark</a></p>
        </div>
      </section>'''

REPLACEMENTS = [
    (
        '${body}\n    </main>',
        '${body}\n' + STATE_BLOCK + '\n    </main>',
    ),
    (
        'description: "Wirkungsforschung ist innerhalb der Wirkungswissenschaften die methodische Teildisziplin - von Natalie Weber von einer nachträglichen Evaluationspraxis zur voraus-, begleit- und rückkoppelnden systemischen Wirkungsforschung erweitert.",',
        'description: "Wirkungsforschung ist innerhalb der Wirkungswissenschaften die methodische Teildisziplin. Der WÖk-Rahmen verbindet etablierte ex-ante-, begleitende und ex-post-Methoden mit einer expliziten systemischen Rückkopplungslogik.",',
    ),
    (
        '"In der Weiterentwicklung durch Natalie Weber wird Wirkungsforschung von einer überwiegend nachträglichen Evaluationspraxis zu einer voraus-, begleit- und rückkoppelnden Forschungsform erweitert.",',
        '"Im WÖk-Rahmen werden etablierte ex-ante-, begleitende und ex-post-Ansätze ausdrücklich mit systemischer Wirkmodellierung, Gegenfaktum/Zurechnung und wiederholbarer Rückkopplung verbunden.",',
    ),
    (
        '{ kicker: "Vorher", title: "Klassische Wirkungsforschung", text: "Evaluation, Impact Assessment und Wirkungsmessung liefern wichtige Methoden - überwiegend als nachträgliche Bewertung einzelner Programme." },',
        '{ kicker: "Bestehender Kanon", title: "Evaluation und Impact Assessment", text: "Evaluation, Impact Assessment und Folgenabschätzung liefern wichtige ex-ante-, begleitende und ex-post-Methoden. Die WÖk baut darauf auf, statt sie als Leerstelle zu behandeln." },',
    ),
    (
        '{ kicker: "Grenze", title: "Zu punktuell, zu spät", text: "Einzelbefunde bleiben oft ohne systemischen Rahmen, ohne Rückkopplung und ohne Schutz vor Scheinkausalität und Wirkungssimulation." },',
        '{ kicker: "Integrationsfrage", title: "Wie wird aus Befunden Steuerungslernen?", text: "Der WÖk-Zusatz liegt in der durchgängigen Verbindung von Problem, Ziel, Kausalhypothese, Verteilung, Optionen, Attribution und wiederholbarer Rückkopplung - nicht in der Behauptung, Folgenprüfung habe zuvor gefehlt." },',
    ),
    (
        'description: "Die Wirkungsökonomie ist die von Natalie Weber begründete erste ausgearbeitete Steuerungs- und Ordnungsdisziplin der Wirkungswissenschaften - sie überführt Wirkung in Preise, Steuern, Kapital und Governance.",',
        'description: "Die Wirkungsökonomie ist eine von Natalie Weber ausgearbeitete Steuerungs- und Ordnungsdisziplin im Rahmen der Wirkungswissenschaften - sie untersucht die Rückkopplung von Wirkung in Preise, Steuern, Kapital und Governance.",',
    ),
    (
        'section({ kicker: "Kerndefinition", heading: "Die erste ausgearbeitete Steuerungsdisziplin",',
        'section({ kicker: "Kerndefinition", heading: "Eine ausgearbeitete Steuerungsdisziplin",',
    ),
    (
        'inner: prose(["Die Wirkungsökonomie ist die von Natalie Weber begründete erste ausgearbeitete Steuerungs- und Ordnungsdisziplin der Wirkungswissenschaften. Sie untersucht nicht nur, welche Wirkungen wirtschaftliche Aktivitäten erzeugen, sondern wie Märkte, Preise, Steuern, Kapital, Unternehmen und öffentliche Entscheidungen so gestaltet werden können, dass positive Netto-Wirkung für Mensch, Planet und Demokratie entscheidungsrelevant wird."]) }),',
        'inner: prose(["Die Wirkungsökonomie ist eine von Natalie Weber ausgearbeitete Steuerungs- und Ordnungsdisziplin im Rahmen der Wirkungswissenschaften. Sie untersucht nicht nur, welche Wirkungen wirtschaftliche Aktivitäten erzeugen, sondern wie Märkte, Preise, Steuern, Kapital, Unternehmen und öffentliche Entscheidungen so gestaltet werden können, dass positive Netto-Wirkung für Mensch, Planet und Demokratie entscheidungsrelevant wird. Bei staatlichen Entscheidungen schließt sie ausdrücklich an bestehende Folgen-, Nachhaltigkeits- und Evaluationsarchitekturen an."]) }),',
    ),
    (
        '{ kicker: "Referenzrahmen", title: "Mensch, Planet, Demokratie", text: "Positive Wirkung wird an Mensch, Planet und Demokratie sowie an SDGs und SDG+ eingeordnet - nicht an Kapitalrendite allein." },',
        '{ kicker: "Referenzrahmen", title: "Mensch, Planet, Demokratie", text: "Wirkung wird an Mensch, Planet und Demokratie sowie an relevanten Referenz- und Schutzräumen eingeordnet. Global gehören SDGs dazu, bei deutschen öffentlichen Fällen zusätzlich die DNS; SDG+ ist WÖk-eigen. Zielbezug allein ist kein Wirkungsnachweis." },',
    ),
]


def main() -> int:
    p = ROOT / REL
    text = p.read_text(encoding="utf-8")
    changed = False
    for old, new in REPLACEMENTS:
        if new in text:
            continue
        if old not in text:
            raise RuntimeError(f"{REL}: approved generator anchor not found: {old[:120]!r}")
        text = text.replace(old, new, 1)
        changed = True
    if changed:
        p.write_text(text, encoding="utf-8")
    print(f"Applied #253 Wirkungswissenschaften generator integration: {'changed' if changed else 'already current'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"use client";

import { useState } from "react";

type Scenario = "vollzug" | "zugang" | "daten";

const feedback: Record<Scenario, { title: string; changes: string; doesNotFollow: string; next: string }> = {
  vollzug: { title: "Vollzug mitdenken", changes: "Zusatznachweise können die Umsetzung verlangsamen.", doesNotFollow: "Daraus folgt nicht automatisch eine Veränderung für alle Betroffenen.", next: "Vollzugsdaten und Ausschlussrisiken prüfen." },
  zugang: { title: "Zugang mitdenken", changes: "Eine Vereinfachung kann eine Hürde senken.", doesNotFollow: "Daraus folgt nicht automatisch eine tatsächliche Nutzung.", next: "Nutzungsdaten nach Gruppen getrennt beobachten." },
  daten: { title: "Datenlücke sichtbar", changes: "Die Frage zeigt, welche Beobachtung nach der Entscheidung fehlt.", doesNotFollow: "Daraus folgt keine belastbare Wirkungsbehauptung.", next: "Indikator mit WÖk-ID, Quelle und Beobachtungszeitpunkt festlegen." }
};

export function ScenarioPanel() {
  const [selected, setSelected] = useState<Scenario>("vollzug");
  const item = feedback[selected];
  return <section id="interaktiv" className="panel interactive-panel" aria-labelledby="interactive-title">
    <p className="kicker">Interaktiv prüfen</p><h2 id="interactive-title">Eine Prüfperspektive auswählen</h2>
    <p>Diese Demonstration nutzt ausschließlich eine feste Regel-Registry. Sie erzeugt kein Votum und keine freie politische Bewertung.</p>
    <div className="scenario-controls" aria-label="Prüfperspektive">
      {(["vollzug", "zugang", "daten"] as const).map((key) => <button type="button" key={key} aria-pressed={selected === key} onClick={() => setSelected(key)}>{({ vollzug: "Vollzug", zugang: "Zugang", daten: "Datenlage" })[key]}</button>)}
    </div>
    <div className="immediate-feedback" aria-live="polite">
      <h3>{item.title}</h3>
      <dl><div><dt>Verändert unmittelbar</dt><dd>{item.changes}</dd></div><div><dt>Folgt nicht automatisch</dt><dd>{item.doesNotFollow}</dd></div><div><dt>Entscheidend als Nächstes</dt><dd>{item.next}</dd></div></dl>
    </div>
  </section>;
}

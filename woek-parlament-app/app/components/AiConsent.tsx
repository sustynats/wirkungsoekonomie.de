"use client";

import { useState } from "react";

export function AiConsent() {
  const [consent, setConsent] = useState(false);
  return <section id="ki" className="panel ai-box" aria-labelledby="ai-title">
    <p className="kicker">Mit WÖK-KI weiterdenken</p><h2 id="ai-title">Eine methodische Frage vertiefen</h2>
    <p>Die KI kann Zusammenhänge erklären. Sie erhält keine Partei-, Fraktions-, Personen- oder Vorgangsidentifikatoren und verändert das veröffentlichte Fachvotum nicht.</p>
    <label className="consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Ich möchte eine nicht-personalisierte methodische Vertiefung starten.</label>
    <button type="button" className="button button--gold" aria-disabled={!consent} disabled={!consent}>Methodische Vertiefung vorbereiten</button>
    {!consent ? <p className="button-help">Bitte zuerst die Einwilligung aktivieren. Der Dienst ist für diese lokale Demonstration nicht verbunden.</p> : <p className="button-help">EDITORIAL_REVIEW_REQUIRED: Eine echte Anfrage würde nur an den freigegebenen WÖk-KI-Dienst gehen.</p>}
  </section>;
}

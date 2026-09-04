/** Exact pre-P6 monitor copy, preserved below the concise area introduction. */
export const monitorCopy = { eyebrow: "Wirkungsmonitor", title: "Nach einer Entscheidung beobachten und lernen", lead: "Monitoring sammelt fortlaufend Daten. Eine spätere Evaluation prüft zusätzlich, warum sich etwas verändert hat und welchen Beitrag eine Entscheidung dazu geleistet hat. Eine einzelne Kennzahl ist deshalb noch kein Wirkungsnachweis.", empty: "Monitorfälle erscheinen mit Ausgangswert, Datenquelle, erwarteter Veränderung, Beobachtungszeitraum und einem Anlass für die erneute Prüfung." };

export function MonitorContext() {
  return <section className="notice"><strong>Monitoring beobachtet. Evaluation erklärt.</strong><p>Für jeden Monitorfall werden Ausgangswert, erwartete Veränderung, Umsetzungs- und Wirkungsindikator, Quelle, Zeitbezug und betroffene Gruppen sichtbar. Vorab wird außerdem festgelegt, bei welchen späteren Ergebnissen Maßnahme oder Analyse erneut geprüft werden müssen. Diese Überprüfungsschwellen heißen Korrekturtrigger.</p></section>;
}

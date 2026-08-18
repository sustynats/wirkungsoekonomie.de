export const portalMethodSourceUrls = {
  ggo: "https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm",
  dnsGovernance: "https://www.bundesregierung.de/breg-de/schwerpunkte/wirksam-regieren/steuerung-nachhaltigkeitsstrategie-419776",
  enapReview: "https://www.bundesregierung.de/resource/blob/2196306/2253682/2d019561674ad7af4f11e19d4aa4fc71/2024-01-18-sta-nhk-beschluss-vom-27-november-2023-data.pdf?download=1",
  destatisIndicators: "https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html",
  sustainabilityActionPlan: "https://www.bundesregierung.de/breg-de/aktuelles/aktionsplan-nachhaltigkeit-2392096",
} as const;

export const portalUsp = {
  lead: "Folgen prüfen reicht nicht. Entscheidend ist, welche Zustandsveränderung eine Entscheidung auslöst - und ob eine realistische Alternative voraussichtlich wirksamer wäre.",
  context: "Deutschland prüft Gesetzesfolgen und Nachhaltigkeitswirkungen bereits heute. Die WÖk setzt nicht bei null an. Sie führt diese Bausteine weiter: von der allgemeinen Folgen- und Zielprüfung zu konkreten, überprüfbaren Wirkungspfaden, einem transparenten Vergleich realistischer Handlungsoptionen und einem späteren Reality Check derselben Annahmen.",
  safeUsp: "Nach Prüfung der GGO, der DNS-Steuerungslogik und des amtlichen eNAP-Erfahrungsberichts ist die WÖk-Kombination aus objektspezifischem Wirkpfad, expliziter Datenfunktion, Gegenfaktum, Evidenztrennung, Systemkaskaden, Optionsvergleich, Nichtkompensation und versioniertem Reality Check nicht als allgemeiner staatlicher Standard in derselben durchgängigen und öffentlich nachvollziehbaren Form ausgestaltet.",
  pathFormula: "A -> M -> ΔZ -> R",
  observedChange: "ΔZ = Z(t) - Z(0)",
  causalEffect: "ΔW = Z_beobachtet - Z_gegenfaktisch",
} as const;

export const indicatorFunctions = [
  ["BASELINE", "Ausgangszustand und Vortrend"],
  ["IMPLEMENTATION", "tatsächliche Umsetzung der Maßnahme"],
  ["OUTPUT", "unmittelbar erzeugte Leistung - noch keine Wirkung"],
  ["OUTCOME", "relevante beobachtete Zustandsveränderung"],
  ["COUNTERFACTUAL", "plausible Entwicklung ohne die Maßnahme"],
  ["DISTRIBUTION", "Verteilung von Nutzen und Belastung"],
  ["BOUNDARY", "mögliche Berührung einer Schutzgrenze"],
  ["ATTRIBUTION", "Daten für die Zurechnung"],
] as const;

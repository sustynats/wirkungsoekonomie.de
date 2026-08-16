export type PortalTermKey =
  | "wirkung"
  | "wirkungspotenzial"
  | "wirkungsrisiko"
  | "wirkmechanismus"
  | "wirkpfad"
  | "materieller_wirkpfad"
  | "wirkungsbewertung"
  | "gegenfaktum"
  | "evidenzgrenze"
  | "zurechnung"
  | "wirkungsgrenze"
  | "nichtkompensation"
  | "rueckkopplung"
  | "wirkungslenkung"
  | "zusaetzlichkeit"
  | "wirkungsermittlung"
  | "wirkungsfeststellung"
  | "ambivalente_wirkung"
  | "offene_wirkungseinordnung"
  | "wirkungsradar"
  | "wirkungsprofil_radardiagramm";

export type PortalTerm = {
  label: string;
  description: string;
};

/**
 * Public mini-definitions follow the leading WÖk terminology.  Components
 * import this one registry so a term does not receive different meanings on
 * glossary, case and methodology pages.
 */
export const portalTerminology: Record<PortalTermKey, PortalTerm> = {
  wirkung: {
    label: "Wirkung",
    description: "Eine tatsächliche Veränderung eines Zustands bei jemandem oder etwas, in Raum und Zeit. Wirkung ist zunächst neutral; ihre Richtung entsteht erst durch Bewertung."
  },
  wirkungspotenzial: {
    label: "Wirkungspotenzial",
    description: "Die Möglichkeit, dass Wirkung eintreten kann. Vor einer Entscheidung ist sie noch keine eingetretene Wirkung."
  },
  wirkungsrisiko: {
    label: "Wirkungsrisiko",
    description: "Die Möglichkeit negativer, unerwünschter oder destabilisierender Wirkung. Es ist noch kein eingetretener Schaden."
  },
  wirkmechanismus: {
    label: "Wirkmechanismus",
    description: "Eine begründete Annahme, wie und unter welchen Bedingungen aus einer Entscheidung eine Veränderung entstehen kann. Sie ist noch kein Wirkungsnachweis."
  },
  wirkpfad: {
    label: "Wirkpfad",
    description: "Eine versionierte, evidenzsensible Darstellung, wie aus einem Auslöser über Mechanismen und Bedingungen mögliche oder beobachtete Veränderungen und Rückkopplungen entstehen können. Sie ist kein Kausalbeweis."
  },
  materieller_wirkpfad: {
    label: "Materieller Wirkpfad",
    description: "Ein möglicher Veränderungsweg, der für die Entscheidung inhaltlich wesentlich ist. Er beschreibt eine begründete Wirkannahme – nicht den Beweis, dass die Veränderung bereits eingetreten ist."
  },
  wirkungsbewertung: {
    label: "Wirkungsbewertung",
    description: "Die transparente Einordnung einer eingetretenen oder modellierten Wirkung am offengelegten Referenzrahmen."
  },
  gegenfaktum: {
    label: "Gegenfaktum",
    description: "Die begründete Vergleichsfrage, was ohne die Entscheidung wahrscheinlich geschehen wäre."
  },
  evidenzgrenze: {
    label: "Evidenzgrenze",
    description: "Der Punkt, an dem Daten oder Zurechnung für eine weitergehende Aussage nicht ausreichen."
  },
  zurechnung: {
    label: "Zurechnung",
    description: "Die Prüfung, welchen Beitrag eine Entscheidung zu einer beobachteten Veränderung geleistet hat. Sie wird nur so genau angegeben, wie die Datenlage es erlaubt."
  },
  wirkungsgrenze: {
    label: "Wirkungsgrenze",
    description: "Eine begründete rote Linie, an der negative Wirkung nicht mehr mit Vorteilen in anderen Bereichen verrechnet werden darf."
  },
  nichtkompensation: {
    label: "Nichtkompensation",
    description: "Zielkonflikte können abgewogen werden. Wirkungsgrenzen nicht: Erhebliche Schäden dürfen nicht schöngerechnet werden."
  },
  rueckkopplung: {
    label: "Wirkungsrückkopplung",
    description: "Erkannte und bewertete Wirkung wird in den Entscheidungsprozess zurückgeführt, damit Annahmen, Regeln oder Maßnahmen überprüft werden können."
  },
  wirkungslenkung: {
    label: "Wirkungslenkung",
    description: "Auf Grundlage der Rückkopplung werden Entscheidungen oder Anreize bewusst verändert, etwa durch Regeln, Budgets, Förderungen oder Vollzug."
  },
  zusaetzlichkeit: {
    label: "Zusätzlichkeit",
    description: "Die Frage, welcher Teil einer Veränderung ohne die Maßnahme nicht oder erst deutlich später eingetreten wäre."
  },
  wirkungsermittlung: {
    label: "Wirkungsermittlung",
    description: "Die systematische Gewinnung und Ordnung von Informationen über Umsetzung, Betroffene, Zustände, Zeit, Reichweite und mögliche Ursachen."
  },
  wirkungsfeststellung: {
    label: "Wirkungsfeststellung",
    description: "Die Aussage, dass eine Zustandsveränderung in einem definierten Zeitraum und Wirkungsraum beobachtet oder belastbar rekonstruiert wurde."
  },
  ambivalente_wirkung: {
    label: "Ambivalente Wirkung",
    description: "Eine Zustandsveränderung mit zugleich positiven und negativen Richtungen, unterschiedlichen Betroffenen oder Zeitwirkungen. Sie wird nicht vorschnell zu einem Einzelscore verdichtet."
  },
  offene_wirkungseinordnung: {
    label: "Offene Wirkungseinordnung",
    description: "Daten, Vergleichsmaßstab, Systemgrenze oder Evidenz reichen noch nicht für eine belastbare Richtungsentscheidung. Offen ist kein Nullwert."
  },
  wirkungsradar: {
    label: "Wirkungsradar",
    description: "Ein Orientierungs- und Analyseinstrument, das Wirkungsfelder, Wirkungspotenziale, Risiken, blinde Flecken, Wirkungspfade und Wissensstände sichtbar macht."
  },
  wirkungsprofil_radardiagramm: {
    label: "Wirkungsprofil im Radardiagramm",
    description: "Eine Spinnennetzgrafik für mehrere Wirkungsfelder oder Potenziale. Ein größerer Ausschlag bedeutet stärkere Ausprägung, nicht automatisch bessere Wirkung."
  }
};

export type PoliticalLevel = "BUND" | "LAND" | "EU";

export type SourceAccess =
  | "PUBLIC_API_NO_KEY"
  | "PUBLIC_STRUCTURED_EXPORT_NO_KEY"
  | "PUBLIC_DOCUMENT_PORTAL"
  | "PUBLIC_ELECTION_PORTAL"
  | "INTERFACE_RECONNAISSANCE_REQUIRED";

export type SourceSystem = {
  slug: string;
  title: string;
  institution: string;
  url: string;
  access: SourceAccess;
  use: string;
  notes: string;
};

export type ReferenceFrameworkLayer = {
  id: string;
  label: string;
  authority: "GLOBAL" | "CONSTITUTIONAL" | "STATE_STRATEGY" | "CROSS_JURISDICTION";
  stability: "ENDURING" | "VERSIONED_CURRENT" | "CASE_SPECIFIC";
  description: string;
  sourceSlug: string;
};

export type Jurisdiction = {
  id: string;
  level: PoliticalLevel;
  label: string;
  parliamentLabel: string;
  publicPath: string;
  status: "LIVE" | "ELECTION_PREPARATION" | "MONITORING_PREPARATION" | "FUTURE";
  publicSummary: string;
  election?: {
    date: string;
    label: string;
    stage: "UPCOMING" | "PAST";
  };
  governmentMonitoring?: {
    startDate: string;
    label: string;
  };
  sourceSystems: SourceSystem[];
  referenceFramework?: ReferenceFrameworkLayer[];
};

/**
 * One register for scope, source provenance and navigation. It deliberately
 * separates a public document interface from a documented API: a public search
 * page is not silently treated as a stable API.
 */
export const jurisdictions: Jurisdiction[] = [
  {
    id: "bund",
    level: "BUND",
    label: "Bundespolitik",
    parliamentLabel: "Deutscher Bundestag",
    publicPath: "/",
    status: "LIVE",
    publicSummary: "Laufende parlamentarische Entscheidungen, historische Wirkungschecks und der Umsetzungsmonitor seit Beginn der laufenden Bundesregierung.",
    governmentMonitoring: {
      startDate: "2025-05-06",
      label: "Laufende Bundesregierung"
    },
    sourceSystems: [
      {
        slug: "dip",
        title: "DIP",
        institution: "Deutscher Bundestag / Bundesrat",
        url: "https://dip.bundestag.de/",
        access: "PUBLIC_API_NO_KEY",
        use: "Vorgänge, Drucksachen, parlamentarischer Stand und Dokumentfassungen.",
        notes: "Der Zugriff erfolgt über einen gekapselten Bundesadapter."
      }
    ],
    referenceFramework: [
      {
        id: "global-sdgs",
        label: "Agenda 2030 und die 17 SDGs",
        authority: "GLOBAL",
        stability: "ENDURING",
        description: "Gemeinsamer globaler Referenzrahmen. Er wird auf Bundes- und Länderebene umgesetzt und ersetzt keine landesspezifische Zuständigkeit.",
        sourceSlug: "bund-laender-nachhaltigkeit"
      },
      {
        id: "woek-sdg-plus",
        label: "WÖk SDG+ und Schutzdimensionen",
        authority: "GLOBAL",
        stability: "ENDURING",
        description: "Ergänzt die SDGs um die für eine funktionierende Demokratie nötigen Schutzdimensionen. Rechtliche Landesanker werden davon getrennt ausgewiesen.",
        sourceSlug: "woek-reference-framework"
      }
    ]
  },
  {
    id: "sachsen-anhalt",
    level: "LAND",
    label: "Sachsen-Anhalt",
    parliamentLabel: "Landtag von Sachsen-Anhalt",
    publicPath: "/laender/sachsen-anhalt",
    status: "ELECTION_PREPARATION",
    publicSummary: "Vor der Landtagswahl werden Wahlprogramme als Primärquellen erschlossen und anhand desselben Wirkungspotenzial-Standards vergleichbar gemacht.",
    election: {
      date: "2026-09-06",
      label: "Landtagswahl Sachsen-Anhalt 2026",
      stage: "UPCOMING"
    },
    sourceSystems: [
      {
        slug: "sachsen-anhalt-landeswahlleitung",
        title: "Landeswahlleiterin Sachsen-Anhalt",
        institution: "Land Sachsen-Anhalt",
        url: "https://wahlen.sachsen-anhalt.de/",
        access: "PUBLIC_ELECTION_PORTAL",
        use: "Wahltermin, Wahlvorschläge und amtliche Wahlergebnisse.",
        notes: "Erste Quelle für den Wahlkontext; kein Ersatz für die Originalfassung eines Wahlprogramms."
      },
      {
        slug: "sachsen-anhalt-landtag",
        title: "Landtag von Sachsen-Anhalt",
        institution: "Landtag von Sachsen-Anhalt",
        url: "https://www.landtag.sachsen-anhalt.de/",
        access: "PUBLIC_DOCUMENT_PORTAL",
        use: "Künftige Drucksachen, Plenarunterlagen, Gesetzgebung und Beschlüsse nach der Wahl.",
        notes: "Der Landtagsadapter wird erst für die parlamentarische Arbeit nach der Wahl aktiviert."
      }
    ],
    referenceFramework: [
      {
        id: "sachsen-anhalt-global-sdgs",
        label: "Agenda 2030 und die 17 SDGs",
        authority: "GLOBAL",
        stability: "ENDURING",
        description: "Die SDGs bilden den gemeinsamen Referenzrahmen. Sachsen-Anhalt setzt sie in eigener Zuständigkeit und gemeinsam mit Bund und Kommunen um.",
        sourceSlug: "sachsen-anhalt-nachhaltigkeitsstrategie"
      },
      {
        id: "sachsen-anhalt-landesverfassung",
        label: "Landesverfassung Sachsen-Anhalt",
        authority: "CONSTITUTIONAL",
        stability: "ENDURING",
        description: "Die Landesverfassung ist ein eigenständiger Prüfanker. Sie beschreibt Sachsen-Anhalt als demokratischen und sozialen Rechtsstaat, der dem Schutz der natürlichen Lebensgrundlagen verpflichtet ist.",
        sourceSlug: "sachsen-anhalt-landesverfassung"
      },
      {
        id: "sachsen-anhalt-nachhaltigkeitsstrategie",
        label: "Nachhaltigkeitsstrategie Sachsen-Anhalt (2022)",
        authority: "STATE_STRATEGY",
        stability: "VERSIONED_CURRENT",
        description: "Landesspezifische Ziele und Indikatoren zur Umsetzung der 17 SDGs. Die Strategie ist eine aktuelle, versionierte öffentliche Referenz – kein unveränderliches Verfassungsrecht.",
        sourceSlug: "sachsen-anhalt-nachhaltigkeitsstrategie"
      },
      {
        id: "sachsen-anhalt-wirkungsraum",
        label: "Wirkungen über Sachsen-Anhalt hinaus",
        authority: "CROSS_JURISDICTION",
        stability: "CASE_SPECIFIC",
        description: "Jede Zusage wird zusätzlich darauf geprüft, ob sie Wirkungen auf andere Länder, den Bund, Europa oder globale öffentliche Güter auslöst, verlagert oder begrenzt.",
        sourceSlug: "bund-laender-nachhaltigkeit"
      }
    ]
  },
  {
    id: "baden-wuerttemberg",
    level: "LAND",
    label: "Baden-Württemberg",
    parliamentLabel: "Landtag von Baden-Württemberg",
    publicPath: "/laender/baden-wuerttemberg",
    status: "MONITORING_PREPARATION",
    publicSummary: "Frühes Monitoring der neuen Wahlperiode mit Fokus auf veränderbare Gesetzesvorhaben und nachvollziehbare Rückkopplung.",
    governmentMonitoring: {
      startDate: "2026-05-13",
      label: "Landesregierung der 18. Wahlperiode"
    },
    sourceSystems: [
      {
        slug: "baden-wuerttemberg-parlis",
        title: "PARLIS Baden-Württemberg",
        institution: "Landtag von Baden-Württemberg",
        url: "https://parlis.landtag-bw.de/",
        access: "PUBLIC_DOCUMENT_PORTAL",
        use: "Vorgänge, Drucksachen, Gesetzgebung, namentliche Abstimmungen und Plenarunterlagen.",
        notes: "Amtliche Dokumentation; die technische Schnittstelle wird als dokumentenorientierter Adapter, nicht als unterstellte API, angebunden."
      },
      {
        slug: "baden-wuerttemberg-landtag",
        title: "Landtag Baden-Württemberg – Dokumente",
        institution: "Landtag von Baden-Württemberg",
        url: "https://www.landtag-bw.de/de/dokumente",
        access: "PUBLIC_DOCUMENT_PORTAL",
        use: "Offizielle Drucksachen, Protokolle, Beschlüsse und Sitzungsplanung.",
        notes: "Fassungen und Beschlüsse werden je Fall archiviert und gehasht."
      }
    ]
  },
  {
    id: "rheinland-pfalz",
    level: "LAND",
    label: "Rheinland-Pfalz",
    parliamentLabel: "Landtag Rheinland-Pfalz",
    publicPath: "/laender/rheinland-pfalz",
    status: "MONITORING_PREPARATION",
    publicSummary: "Frühes Monitoring der neuen Wahlperiode auf Grundlage amtlicher parlamentarischer Dokumente und veröffentlichter Datensätze.",
    governmentMonitoring: {
      startDate: "2026-05-18",
      label: "Landesregierung der 19. Wahlperiode"
    },
    sourceSystems: [
      {
        slug: "rheinland-pfalz-landtag-dokumente",
        title: "Dokumente des Landtags Rheinland-Pfalz",
        institution: "Landtag Rheinland-Pfalz",
        url: "https://dokumente.landtag.rlp.de/",
        access: "PUBLIC_STRUCTURED_EXPORT_NO_KEY",
        use: "Drucksachen, Beschluss- und Plenarprotokolle sowie veröffentlichte XML-Bestände.",
        notes: "Strukturierte amtliche Exporte werden gegenüber einer bloßen Volltextsuche bevorzugt."
      },
      {
        slug: "rheinland-pfalz-open-data",
        title: "Open Data Rheinland-Pfalz",
        institution: "Staatskanzlei Rheinland-Pfalz",
        url: "https://open.rlp.de/",
        access: "PUBLIC_STRUCTURED_EXPORT_NO_KEY",
        use: "Regierungsunterlagen, Datensätze und spätere Monitoringdaten, sofern fallbezogen geeignet.",
        notes: "Nicht jede Veröffentlichung ist eine Entscheidungsgrundlage; Relevanz und Fassung werden pro Fall geprüft."
      }
    ]
  },
  {
    id: "hamburg",
    level: "LAND",
    label: "Hamburg",
    parliamentLabel: "Hamburgische Bürgerschaft",
    publicPath: "/laender/hamburg",
    status: "MONITORING_PREPARATION",
    publicSummary: "Monitoring der seit 2025 laufenden Wahlperiode mit denselben Trennungen von Fakt, Wirkungspotenzial und beobachteter Wirkung.",
    governmentMonitoring: {
      startDate: "2025-05-07",
      label: "Senat der 23. Wahlperiode"
    },
    sourceSystems: [
      {
        slug: "hamburg-parlamentsdatenbank",
        title: "Parlamentsdatenbank der Hamburgischen Bürgerschaft",
        institution: "Hamburgische Bürgerschaft",
        url: "https://www.hamburgische-buergerschaft.de/recherche-info/parlamentsdatenbank",
        access: "PUBLIC_DOCUMENT_PORTAL",
        use: "Drucksachen, parlamentarische Vorgänge, Protokolle und Beschlüsse.",
        notes: "Der Adapter wird nach dokumentierter technischer Prüfung der öffentlichen Schnittstelle eingerichtet."
      }
    ]
  },
  {
    id: "berlin",
    level: "LAND",
    label: "Berlin",
    parliamentLabel: "Abgeordnetenhaus von Berlin",
    publicPath: "/laender/berlin",
    status: "ELECTION_PREPARATION",
    publicSummary: "Wahlprogramm- und Quellenvorbereitung für die nächste Wahl zum Abgeordnetenhaus.",
    election: {
      date: "2026-09-20",
      label: "Abgeordnetenhauswahl Berlin 2026",
      stage: "UPCOMING"
    },
    sourceSystems: []
  },
  {
    id: "mecklenburg-vorpommern",
    level: "LAND",
    label: "Mecklenburg-Vorpommern",
    parliamentLabel: "Landtag Mecklenburg-Vorpommern",
    publicPath: "/laender/mecklenburg-vorpommern",
    status: "ELECTION_PREPARATION",
    publicSummary: "Wahlprogramm- und Quellenvorbereitung für die nächste Landtagswahl.",
    election: {
      date: "2026-09-20",
      label: "Landtagswahl Mecklenburg-Vorpommern 2026",
      stage: "UPCOMING"
    },
    sourceSystems: []
  },
  {
    id: "europaeische-union",
    level: "EU",
    label: "Europäische Union",
    parliamentLabel: "Europäisches Parlament",
    publicPath: "/europa",
    status: "FUTURE",
    publicSummary: "EU-Gesetzgebung wird als eigener Verfahrensraum angelegt, damit Parlament, Kommission und Rat nicht fälschlich zusammengezogen werden.",
    sourceSystems: [
      {
        slug: "eu-parliament-open-data",
        title: "European Parliament Open Data",
        institution: "Europäisches Parlament",
        url: "https://data.europarl.europa.eu/",
        access: "INTERFACE_RECONNAISSANCE_REQUIRED",
        use: "Künftige Verfahren, Dokumente, Termine und Abstimmungsdaten.",
        notes: "Ein EU-Fall bildet Parlament, Kommission und Rat getrennt ab."
      }
    ]
  }
];

export function jurisdictionById(id: string) {
  return jurisdictions.find((jurisdiction) => jurisdiction.id === id);
}

export function jurisdictionByPath(path: string) {
  return jurisdictions.find((jurisdiction) => jurisdiction.publicPath === path);
}

export const activeStateJurisdictions = jurisdictions.filter(
  (jurisdiction) => jurisdiction.level === "LAND" && jurisdiction.status !== "FUTURE"
);

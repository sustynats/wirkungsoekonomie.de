import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import type { PublicMaturityProjection } from "@/lib/presentation/public-maturity";
import type { CoalitionChapterReview, CoalitionCommitmentRecord, CoalitionSource } from "@/lib/states/baden-wuerttemberg-coalition";
import { readFileSync } from "node:fs";
import path from "node:path";

export const RLP_COALITION_ROUTE = "/laender/rheinland-pfalz/mandat-und-praxis";

type RheinlandPfalzCoalitionRegister = {
  schema_version: string;
  fach_status: string;
  publication_status: string;
  jurisdiction_id: string;
  document_id: string;
  document_title: string;
  source_url: string;
  provenance_status: string;
  lifecycle_status: string;
  signed_final_byte_identity: string;
  coverage_scope: string;
  declared_source_record_count: number;
  source_record_count: number;
  atomic_commitment_count: number;
  explicit_deep_split_flags_remaining: number;
  handoff_record_gap_count: number;
  missing_declared_record_ids: string[];
  source_record_semantics: string;
  competence_projection: string;
  lifecycle_chain: string[];
  chapter_counts: Array<{
    chapter: number;
    source_records: number;
    atomic_commitments: number;
    declared_atomic_commitments: number | null;
    transfer_gap: number;
  }>;
  fach_comment_ids: number[];
  high_materiality_review_comment_ids: number[];
  records: CoalitionCommitmentRecord[];
};

const commitmentRegister = JSON.parse(readFileSync(
  path.join(process.cwd(), "data/states/rheinland-pfalz-coalition-commitments.json"),
  "utf8",
)) as RheinlandPfalzCoalitionRegister;

export const rheinlandPfalzCoalitionCommitmentRegister = commitmentRegister;
export const rheinlandPfalzCoalitionCommitments = commitmentRegister.records;
export const rheinlandPfalzCoalitionAtomicCommitments = commitmentRegister.records.filter((record) => record.atomic_count);

const exAnteReality = "Ex-ante-Prüfung des Mandatsdokuments. Regierungshandlung, Umsetzung, beobachtete Zustandsänderung und Zurechnung sind noch getrennt nachzuweisen.";
const noRecommendation = "Für dieses Kapitel liegt keine fachlich freigegebene WÖk-Handlungsoption vor. Aus Wirkungsrichtungen, Zielbegriffen oder Schutzbedingungen wird keine Empfehlung technisch abgeleitet.";
const chapterEvidence = "Der Vertragstext und das Instrumentdesign sind fachlich auf hochmaterialer Kapitel- und Clusterebene geprüft. Outcome und Attribution sind ex ante noch nicht beobachtbar; Baseline, Umsetzung und Falsifikationsdaten müssen je Gegenstand nachgezogen werden.";

export const rheinlandPfalzCoalitionAssessment: OverviewAssessmentData = {
  assessmentLabel: "Mehrzielportfolio – keine belastbare einheitliche Wirkungsrichtung",
  impactCoreSummary: "Der Koalitionsvertrag verbindet neun Kapitel mit getrennten Problemen, Zielen, Zuständigkeiten und Wirkpfaden. Wirkung kann deshalb nur auf Ebene konkreter Zusagen, späterer Regierungshandlungen und beobachtbarer Zustandsänderungen belastbar geprüft werden.",
  editorialSummary: "Frühe Bildung, integrierte Versorgung, Klima- und Wasserresilienz, staatliche und kommunale Handlungsfähigkeit, Integration, Gewaltschutz und demokratische Teilhabe besitzen substanzielle positive Potenziale. Zugleich entstehen materielle Zielkonflikte bei Flächen- und Infrastrukturausbau, Überwachungs- und Datenarchitekturen, Rückführungsdesign, Finanzierung, Fachkräfteverteilung und natürlichen Schutzgrenzen. Entscheidend sind reale Engpässe, Delivery-Kapazität, Rechte, Verteilung und spätere Outcome-Daten.",
  keyFinding: "Ein Koalitionsversprechen ist weder Regierungshandlung noch Umsetzung oder Wirkung; Mittel, Stellen, Programme, digitale Produkte und Verfahrensbeschleunigung bleiben zunächst Input oder Output.",
  directionLabel: "Keine belastbare einheitliche Wirkungsrichtung",
  directionKind: "portfolio",
  evidenceSummary: "Alle neun Kapitel sind hochmaterial fachlich geprüft. 1.254 explizit ausformulierte, fundstellengebundene Zusagen aus allen neun Kapiteln sind technisch vollständig und kollisionsfrei übernommen. Die verwendete Parteiorganisations-PDF ist direkt zugänglich; ihre kryptographische Identität mit einer signierten Endfassung bleibt unbewiesen.",
  realityCheckSummary: exAnteReality,
};

export const rheinlandPfalzHitzeschutzAssessment: OverviewAssessmentData = {
  assessmentLabel: "Klares positives Gesundheits- und Resilienzpotenzial mit offenem Umsetzungsnachweis",
  impactCoreSummary: "Der übernommene Hitzeaktionspfad kann Exposition und Vulnerabilität senken, wenn ressortübergreifende Koordination zu wirksamen lokalen Warn-, Präventions-, Pflege-, Gesundheits- und Gebäudeschutzketten führt.",
  editorialSummary: "Frühwarnung, Prävention, Pflege- und Gesundheitsvorsorge, Gebäudeschutz, kommunale Koordination und zielgruppenspezifische Maßnahmen können vermeidbare gesundheitliche Schäden vor und während Hitzeperioden reduzieren. Der Rahmen kann jedoch wirkungsarm bleiben, wenn kommunale Personal-, Finanzierungs- und Datenkapazitäten, Auslöseschwellen, Zielgruppenabdeckung und Outcome-Monitoring nicht verbindlich genug sind. Plan- und Netzwerkexistenz sind Output, nicht Gesundheitswirkung.",
  keyFinding: "Der zentrale offene Punkt ist, ob der strategische Landesrahmen lokal zu messbar geringerer Exposition, Vulnerabilität, Erkrankung und hitzebedingter Sterblichkeit führt.",
  directionLabel: "Positives Gesundheits- und Resilienzpotenzial unter kommunalen Umsetzungsbedingungen",
  directionKind: "conditional",
  evidenceSummary: "Problem und Wirkmechanismus sind hoch belegt; die Umsetzung des landesweiten Koordinationspfads ist mittel belegt. Ein beobachteter Outcome speziell aus der Verstetigung der Regierung 2026 ist noch nicht bewertbar.",
  realityCheckSummary: "Zu prüfen ist, ob bei vergleichbarer Hitzeexposition vulnerable Gruppen besser erreicht, Einrichtungen früher aktiviert und hitzebedingte Morbiditäts- und Mortalitätsrisiken reduziert werden.",
};

export const rheinlandPfalzHitzeschutzSources = [
  {
    title: "Hitzeschutz ist Gesundheitsschutz",
    institution: "Land Rheinland-Pfalz",
    url: "https://www.rlp.de/service/pressemitteilungen/detail/hitzeschutz-ist-gesundheitsschutz",
    category: "GOVERNMENT_RECORD" as const,
    role: "DECISION_FACT" as const,
    documentType: "Amtliche Mitteilung zur Ministerratsbefassung",
    documentDate: "2026-06-24",
    abstract: "Die amtliche Quelle dokumentiert die erneute Befassung des Ministerrats, ressortübergreifende Zusammenarbeit und Vernetzung mit Kommunen und weiteren Akteuren. Sie belegt die aktuelle Verstetigung, nicht die ursprüngliche Schaffung des Hitzeaktionsplans und nicht dessen Gesundheitswirkung.",
  },
  {
    title: "Hitzeaktionsplan Rheinland-Pfalz",
    institution: "Land Rheinland-Pfalz",
    url: "https://hitze.rlp.de/hitzeaktionsplan",
    category: "GOVERNMENT_RECORD" as const,
    role: "CONTEXT" as const,
    documentType: "Amtliches Fachportal und Planhistorie",
    documentDate: null,
    abstract: "Das Fachportal dokumentiert Planhistorie und Handlungsrahmen seit 2023. Es trägt die Attributionstrennung zwischen übernommenem Politikpfad und dem Beitrag der aktuellen Regierung.",
  },
  {
    title: "Gesundheitsrisiken durch Hitze",
    institution: "Umweltbundesamt",
    url: "https://www.umweltbundesamt.de/daten/umweltzustand-trends/umwelt-gesundheit/gesundheitsrisiken-durch-hitze",
    category: "OFFICIAL_STATISTICS" as const,
    role: "EX_ANTE_EVIDENCE" as const,
    documentType: "Amtliche Fach- und Zustandsinformation",
    documentDate: null,
    abstract: "Die Bundesfachquelle stützt Problem und Mechanismus gesundheitlicher Hitzebelastung. Sie belegt nicht automatisch die Wirkung des rheinland-pfälzischen Maßnahmenpfads.",
  },
  {
    title: "Hitzefolgekrankheiten",
    institution: "Robert Koch-Institut",
    url: "https://www.rki.de/DE/Themen/Gesundheit-und-Gesellschaft/Gesundheitliche-Einflussfaktoren-A-Z/H/Hitze/Hitzefolgekrankheiten_inhalt.html",
    category: "SCIENTIFIC_SOURCE" as const,
    role: "EX_ANTE_EVIDENCE" as const,
    documentType: "Amtliche Gesundheitsfachinformation",
    documentDate: null,
    abstract: "Die Fachinformation stützt Morbiditäts- und Mortalitätsmechanismen von Hitze. Ein kausaler Outcome der Landespolitik folgt daraus nicht.",
  },
];

export const rheinlandPfalzCoalitionPublicMaturity: PublicMaturityProjection = {
  primary: "EX_ANTE_POTENTIAL_ONLY",
  flags: ["EX_ANTE_POTENTIAL_ONLY", "REALITY_CHECK_PENDING", "ATTRIBUTION_OPEN", "RECOMMENDATION_PENDING"],
  label: "Ex-ante-Mandatsanalyse – Wirkung noch nicht beobachtbar",
  compactHint: "Alle neun Kapitel sind hochmaterial geprüft und 1.254 explizit gelieferte Koalitionszusagen sind vollständig fundstellengebunden sichtbar.",
  assessableNow: [
    "Problem, Ziel, Wirkungspotenziale und Risiken sind für alle neun Kapitel auf hochmaterialer Ebene veröffentlicht.",
    "Delivery, Finanzierung, Verteilung, Kohärenz, Rechte, Schutzgrenzen, Robustheit und spätere Falsifikation sind dokumentweit ausgewiesen.",
    "1.254 explizit fachlich übergebene Koalitionszusagen aus allen neun Kapiteln besitzen stabile Kennung und Fundstelle.",
  ],
  openPoints: [
    "Die atomare Quellenzerlegung aller neun Kapitel ist vollständig fachlich übergeben; daraus folgt keine automatische Einzelbewertung.",
    "Tatsächliche Umsetzung, Zustandsänderung und Zurechnung sind noch nicht beobachtbar.",
    "Eine fachlich freigegebene WÖk-Handlungsoption für das Vertragsportfolio liegt nicht vor.",
  ],
  layers: [
    { id: "problem", label: "WÖk-Problemprüfung", status: "AVAILABLE", detail: "Alle neun Kapitel sind fachlich auf hochmaterialer Problem- und Clusterebene geprüft." },
    { id: "goal", label: "WÖk-Zielprüfung", status: "AVAILABLE", detail: "Mehrzielportfolio ohne künstliche Gesamtrichtung; Zwischenziele bleiben von Outcome-Zielen getrennt." },
    { id: "impact", label: "Wirkungspotenziale und Risiken", status: "AVAILABLE", detail: "Ex-ante-Kapitelreviews mit Delivery-, Verteilungs-, Rechts-, Schutz- und Falsifikationsebenen sind veröffentlicht." },
    { id: "reality", label: "Beobachtung und Reality Check", status: "OPEN", detail: "Erst nach konkreter Regierungshandlung, Umsetzung und beobachtbarer Zustandsänderung belastbar." },
    { id: "recommendation", label: "WÖk-Handlungsoption", status: "PENDING", detail: "Keine fachlich freigegebene Handlungsoption vorhanden." },
    { id: "operationalization", label: "Quellen- und Lifecycle-Operationalisierung", status: "AVAILABLE", detail: "1.254 explizite Koalitionszusagen aus allen neun Kapiteln sind mit stabiler Kennung und Fundstelle übernommen; spätere Regierungshandlung, Umsetzung und Wirkung bleiben getrennt." },
  ],
};

export const rheinlandPfalzCoalitionSources: CoalitionSource[] = [
  {
    title: "Gemeinsame Verantwortung für ein starkes Rheinland-Pfalz",
    institution: "SPD Rheinland-Pfalz, Landesorganisation",
    url: "https://www.spd-rlp.de/wp-content/uploads/sites/1649/2026/04/KoaV_2026-2031.pdf",
    documentType: "Parteiorganisations-Primärquelle (PDF)",
    documentDate: null,
    abstract: "Die direkte PDF der SPD-Landesorganisation trägt den vollständigen 101-seitigen Vertragstext. Eine kryptographisch nachgewiesene Byte-Identität mit einer signierten Endfassung liegt nicht vor; die Quelle wird deshalb nicht still als signiertes amtliches Original ausgegeben.",
    locations: ["gesamtes Dokument", "Kapitel 1 bis 9", "PDF S. 7–100"],
    usage: "DOCUMENT",
  },
  {
    title: "Koalitionsvertrag CDU–SPD Rheinland-Pfalz 2026–2031 – Referenzfassung",
    institution: "SPD-Ortsverein Bad Hönningen, parteioffiziell wiederveröffentlicht",
    url: "https://www.spd-bad-hoenningen.de/dl/Koalitionsvertrag_CDU-SPD_Rheinland-Pfalz_2026-2031.pdf",
    documentType: "Parteioffizielle Replik-/Referenzfassung (PDF)",
    documentDate: null,
    abstract: "Die frühere parteioffizielle Referenzfassung bleibt für Versions- und Provenienznachvollziehbarkeit erhalten. Sie wird nicht als kryptographisch identisch mit einer signierten Endfassung behauptet.",
    locations: ["gesamtes Dokument", "Kapitel 1 bis 9"],
    usage: "DOCUMENT",
  },
  {
    title: "Ergebnisse der Koalitionsverhandlungen zwischen CDU und SPD Rheinland-Pfalz",
    institution: "SPD Rheinland-Pfalz",
    url: "https://www.spd-bad-hoenningen.de/meldungen/die-ergebnisse-der-koalitionsverhandlungen-zwischen-cdu-und-spd-rheinland-pfalz/",
    documentType: "Parteioffizielle Begleitseite",
    documentDate: "2026-05-18",
    abstract: "Die Begleitseite stellt den Text bereit und bezeichnet ihn zugleich als Entwurf. Dieser Versionshinweis ist Teil der öffentlichen Provenienz.",
    locations: ["Dokumentlink", "Fassungsbezeichnung"],
    usage: "DOCUMENT",
  },
  {
    title: "Ministerpräsident Gordon Schnieder",
    institution: "Land Rheinland-Pfalz",
    url: "https://www.rlp.de/ministerpraesident",
    documentType: "Amtliche Lifecycle-Quelle",
    documentDate: "2026-05-18",
    abstract: "Die amtliche Seite belegt Regierungsspitze und Regierungszeitraum seit 18. Mai 2026. Der Regierungsbeginn ist keine Wirkung des Koalitionsvertrags.",
    locations: ["Amtsbeginn 18. Mai 2026"],
    usage: "DOCUMENT",
  },
  {
    title: "Erste Regierungserklärung der 19. Wahlperiode",
    institution: "Land Rheinland-Pfalz",
    url: "https://www.rlp.de/service/pressemitteilungen/detail/ministerpraesident-gordon-schnieder-vertrauen-entsteht-dort-wo-probleme-geloest-werden",
    documentType: "Amtliche Lifecycle- und Kontextquelle",
    documentDate: "2026-06-16",
    abstract: "Die Regierungserklärung belegt den politischen Lifecycle und Kontext, nicht Umsetzung oder eingetretene Wirkung einzelner Zusagen.",
    locations: ["Regierungserklärung 16. Juni 2026"],
    usage: "DOCUMENT",
  },
  {
    title: "Kommunale Finanzen und laufende KFA-Evaluation",
    institution: "Ministerium der Finanzen Rheinland-Pfalz",
    url: "https://fm.rlp.de/themen/finanzen/kommunale-finanzen",
    documentType: "Amtliche Lifecycle- und Baseline-Quelle",
    documentDate: "2026-08-21",
    abstract: "Die Quelle dokumentiert die 2026 gestartete Evaluation des Kommunalen Finanzausgleichs bis Ende 2027. Eine Wirkung der geplanten Neuregelung ist noch nicht beobachtbar.",
    locations: ["KFA-Evaluation 2026–2027"],
    usage: "DOCUMENT",
  },
  {
    title: "Erstaufnahme für Asylbegehrende",
    institution: "Ministerium des Innern und für Sport Rheinland-Pfalz",
    url: "https://mdi.rlp.de/themen/integration/humanitaere-zuwanderung-und-gefluechtete/erstaufnahme-fuer-asylbegehrende",
    documentType: "Amtliche Baseline- und Umsetzungsquelle",
    documentDate: "2026-06-01",
    abstract: "Die Quelle beschreibt Kapazität und GEAS-Umsetzungskontext der Erstaufnahme. Aufnahmeplätze und Verteilung sind keine pauschale Migrationswirkungskennzahl.",
    locations: ["fünf Einrichtungen", "Stand Juni 2026", "GEAS-Screening und Vulnerabilität"],
    usage: "DOCUMENT",
  },
  {
    title: "Staatsvertrag zur elektronischen Aufenthaltsüberwachung",
    institution: "Ministerium der Justiz Rheinland-Pfalz",
    url: "https://mjv.rlp.de/service/presse/detail/besserer-schutz-vor-haeuslicher-gewalt-rheinland-pfalz-schafft-die-grundlage-fuer-die-elektronische-fussfessel",
    documentType: "Amtliche Quelle zu einer Regierungshandlung",
    documentDate: "2026-07-28",
    abstract: "Die Zustimmung zum Staatsvertragsentwurf ist ein konkreter Lifecycle-Schritt im Gewaltschutz. Sie ist noch kein Nachweis einer realen Schutzwirkung.",
    locations: ["Ministerratsentscheidung 28. Juli 2026"],
    usage: "DOCUMENT",
  },
  {
    title: "Rheinland-Pfalz modernisiert den Staat",
    institution: "Ministerium der Finanzen Rheinland-Pfalz",
    url: "https://fm.rlp.de/service/presse/detail/rheinland-pfalz-modernisiert-den-staat-entlastungen-fuer-buergerinnen-buerger-und-wirtschaft-im-blick",
    documentType: "Amtliche Quelle zu einer Regierungshandlung",
    documentDate: "2026-08-11",
    abstract: "Die Quelle belegt konkrete Beschlüsse zur Staatsmodernisierung nach der Sommerpause. Einzelne Maßnahmen und Zustandswirkungen bleiben separat zu prüfen.",
    locations: ["Ministerratsbeschluss 11. August 2026"],
    usage: "DOCUMENT",
  },
  {
    title: "Straßenausbaubeiträge – offene Finanzierungsfragen",
    institution: "Landtag Rheinland-Pfalz",
    url: "https://dokumente.landtag.rlp.de/landtag/drucksachen/34-19.pdf",
    documentType: "Amtliche parlamentarische Prüfquelle",
    documentDate: "2026-05-27",
    abstract: "Die Drucksache dokumentiert offene Modelle, Einnahmeausfälle und kommunale Verteilung. Eine Abschaffung wird deshalb nicht als kostenlose Entlastungswirkung dargestellt.",
    locations: ["Drucksache 19/34"],
    usage: "DOCUMENT",
  },
  {
    title: "Rheinland-pfälzische Mieterschutzregelungen",
    institution: "Ministerium der Finanzen Rheinland-Pfalz",
    url: "https://mkbwk.rlp.de/themen/bauen-und-wohnen/rheinland-pfaelzische-mieterschutzregelungen",
    documentType: "Amtliche geerbte Baseline",
    documentDate: "2025-10-08",
    abstract: "Die Mietpreisbegrenzungsverordnung besteht bereits seit 2025 und ist bis Ende 2029 befristet. Sie darf nicht als neue Wirkung des Regierungszeitraums ab 2026 zugerechnet werden.",
    locations: ["Verordnung 16. September 2025", "Geltung 8. Oktober 2025 bis 31. Dezember 2029"],
    usage: "DOCUMENT",
  },
];

export const rheinlandPfalzCoalitionChapters: CoalitionChapterReview[] = [
  {
    chapter: 1,
    title: "Bildung, Wissenschaft und Kultur",
    pages: "PDF S. 7–17",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 151 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Positives Bildungspotenzial mit deutlichen Delivery- und Verteilungsbedingungen",
      impactCoreSummary: "Frühe Diagnose und individuelle Förderung, multiprofessionelle Kapazität, bessere Lehrkräfteattraktivität, berufliche Bildung und Wissenschaftsautonomie können Bildungszugang und Teilhabe verbessern.",
      editorialSummary: "Der stärkste Hebel liegt in früher Sprach- und Grundkompetenzförderung sowie zusätzlicher pädagogischer Kapazität. Wirkung hängt an Fachkräften, valider und diskriminierungsarmer Diagnostik, pädagogischer Umsetzung, Datenschutz und bedarfsgerechter Ressourcenverteilung. Geräte, Programme, Stellen oder Null-Toleranz-Regeln sind noch kein Bildungs- oder Sicherheitsoutcome.",
      keyFinding: "Diagnose ohne Förderkapazität bleibt Output; Digitalisierung ohne Didaktik, Interoperabilität und Exit-Pfad kann Belastung und Lock-in erhöhen.",
      directionLabel: "Positives Potenzial unter Delivery-, Verteilungs- und Schutzbedingungen",
      directionKind: "conditional",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Sprachliche Grundkompetenz, Bildungsbenachteiligung, Personalengpässe, digitale Zugänge und Schulsicherheit sind getrennte Zustandsprobleme. Der Vertrag liefert dafür nicht durchgehend empirische Baselines oder Gegenfakten.",
    goalReview: "Frühe individuelle Förderung und leistungsfähige Bildungsinstitutionen sind problemadäquat, sofern Unterstützung statt Selektion ausgelöst wird und Inklusion, Teilhabe, Datenschutz und Verhältnismäßigkeit gesichert bleiben.",
    findings: [
      { title: "Frühe Sprachdiagnostik und Förderung", text: "Valide frühe Diagnose kann Unterstützungsbedarf früher sichtbar machen. Mehrsprachigkeit, Entwicklungsstand, Fehlklassifikation, Stigmatisierung, Elternzugang und reale Anschlussförderung müssen getrennt geprüft werden." },
      { title: "Personal und Multiprofessionalität", text: "A13 und zusätzliche Fachkräfte können Attraktivität, Bindung und Betreuungskapazität verbessern. Entscheidend sind reale Besetzung, Vakanz, Fluktuation, Unterrichtsausfall und Sozialraumverteilung statt Stellen- oder Ausgabenzahl." },
      { title: "Digitalisierung, Geräte und KI", text: "Technik kann Lernzugang und Feedback verbessern. Didaktische Integration, Arbeitsbelastung, Datenschutz, Bias, Barrierefreiheit, Cyberresilienz, Hardwarelebenszyklus und Vendor-Lock-in bestimmen die Wirkung." },
      { title: "Handynutzung und Medienkompetenz", text: "Die funktionsbezogene Restriktion während des Unterrichts kann Ablenkung und unerlaubte Aufnahmen senken, ohne Lern- und Informationsnutzung pauschal zu verbieten. Ausnahmen, Medienkompetenz und Verlagerung außerhalb des Unterrichts bleiben relevant." },
      { title: "Sicherheit und Antidiskriminierung", text: "Schnellere Intervention und zugängliche Hilfe können Sicherheit und Zugehörigkeit stärken. Null-Toleranz darf nicht zu fehlender Verhältnismäßigkeit, Diskriminierung oder weniger Vertrauen führen." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
  {
    chapter: 2,
    title: "Wirtschaft, Energie, Digitalisierung und Medien",
    pages: "PDF S. 18–32",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 151 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Erhebliches positives Potenzial mit Delivery-, Lock-in- und Schutzbedingungen",
      impactCoreSummary: "Ansiedlung und Transfer, Erneuerbare und Systemintegration, digitale Souveränität sowie pluralistische Medien können Investitions-, Energie-, Verwaltungs- und Informationsengpässe adressieren.",
      editorialSummary: "Fläche, Megawatt, Fördervolumen, Open-Source-Beschluss oder Medienförderung sind noch kein Wohlstands-, Klima-, Resilienz- oder Demokratie-Outcome. Materielle Risiken liegen in Flächen- und Ressourcenfolgen, fehlender Additionalität, Cloud-, CCS- und Infrastruktur-Lock-ins sowie geschwächten Schutz- und Unabhängigkeitsfunktionen.",
      keyFinding: "Installierte Leistung, ausgewiesene Fläche und digitale Architektur sind Output; Wirkung entsteht erst durch reale Investition, fossile Verdrängung, Zugänglichkeit, Resilienz und unabhängige Informationsversorgung.",
      directionLabel: "Heterogene positive Potenziale unter materiellen Systembedingungen",
      directionKind: "conditional",
      evidenceSummary: "Kapitelreview und 151 explizite Source-Commitments sind veröffentlicht. Der korrigierte Source-Reaudit bestätigt diesen belastbaren Umfang; Outcome und Attribution sind offen.",
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Transformations-, Wettbewerbs-, Investitions-, Energie-, Digital-, Medien- und Fachkräftedruck sind mehrere Ursachencluster. Genehmigungsdauer oder Bürokratie sind nicht automatisch der jeweilige bindende Engpass.",
    goalReview: "Wettbewerbsfähigkeit, gute Arbeit, Versorgungssicherheit, Klimaschutz, digitale Handlungsfähigkeit und Medienpluralismus sind plausible Ziele. Ansiedlung, Wachstum, Fördervolumen oder MW bleiben Zwischenziele.",
    findings: [
      { title: "Ansiedlung und Flächen", text: "Koordination kann Such- und Verfahrenskosten senken. Zusätzliche Flächen-, Netz-, Wasser-, Infrastruktur- und kommunale Folgekosten sowie Beteiligungs- und Schutzqualität müssen räumlich getrennt geprüft werden." },
      { title: "Industrie, Wasserstoff und Carbon Management", text: "Frühe Zielpfadprüfung kann eine lernende Schleife stärken. CCS, CCU und Wasserstoff brauchen Lebenszyklus, Energiebedarf, Herkunft, Dauerhaftigkeit, Kosten, Leakage und Lock-in statt Technologieetikett." },
      { title: "Erneuerbare, Netze und Speicher", text: "Zubau kann fossile Abhängigkeit und Emissionen senken, wenn Erzeugung, Netzanschluss, Speicher, Lastprofil, Abregelung, Kosten und tatsächliche Verdrängung tragen. Netzausbau bleibt teilweise Bundes- und Betreiberabhängigkeit." },
      { title: "Digitale Souveränität", text: "Offene Standards, Portabilität und Exit-Fähigkeit können Abhängigkeit reduzieren. Migration, Legacy, Cyber, Daten, Fachkräfte und neue Anbieter-Lock-ins bestimmen die tatsächliche Resilienzwirkung." },
      { title: "Medien und Jugendmedienschutz", text: "Pluralistische Informationsinfrastruktur kann demokratische Resilienz stärken. Staatliche Förderung und Regulierung müssen Staatsferne, redaktionelle Unabhängigkeit und Wettbewerb sichern; U14-Verbot, sichere Jugendversion, Altersnachweis, Plattformhaftung und Medienkompetenz bleiben getrennte Instrumente." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
  {
    chapter: 3,
    title: "Arbeit, Sozialstaat, Gesundheit und Pflege",
    pages: "PDF S. 33–49",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 263 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Substanzielles Teilhabe-, Versorgungs- und Resilienzpotenzial",
      impactCoreSummary: "Qualifizierung, Armuts- und Wohnungslosigkeitsprävention, integrierte Gesundheitsversorgung, Public Health und quartiersnahe Pflege können frühere Zugänge, Kontinuität und Schutz stärken.",
      editorialSummary: "Der stärkste Hebel liegt bei tatsächlicher Fachkapazität, früher Prävention und lokaler integrierter Versorgung. Personal, dauerhafte Finanzierung, Bund-Land-Kassen-Kompetenzen, kommunale Delivery und Datenschutz sind bindende Bedingungen. Programme, Plätze, digitale Steuerung oder Klinikstruktur sind noch kein Versorgungsoutcome.",
      keyFinding: "Mehr Angebot zählt erst als Wirkung, wenn Übergänge, Wohnstabilität, Warte- und Wegezeiten, Versorgungsqualität sowie die Belastung von Beschäftigten und Angehörigen besser werden.",
      directionLabel: "Positives Potenzial mit Kapazitäts-, Zugangs- und Verteilungsbedingungen",
      directionKind: "conditional",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Fachkräfteknappheit, Qualifikationsmismatch, Armuts- und Wohnungsrisiko, regionale Gesundheitszugänge, Krankenhausstruktur und Pflegebelastung sind getrennte Probleme mit unterschiedlichen Engpässen.",
    goalReview: "Gute Arbeit, Prävention, Teilhabe, integrierte Versorgung und selbstbestimmtes Altern sind problemadäquat. Aktivitäts- und Kapazitätsgrößen bleiben von Zustandsoutcomes getrennt.",
    findings: [
      { title: "Arbeit und Qualifizierung", text: "Qualifizierung und sozialpartnerschaftliche Transformation können Übergänge, Jobstabilität und Arbeitsqualität verbessern. Fachkräfteprogramme dürfen Nachfrage nicht nur umverteilen und aktive internationale Rekrutierung benötigt eine Herkunftslandperspektive." },
      { title: "Soziale Prävention", text: "Wohnraumsicherung, Housing First und niedrigschwellige Beratung können Krisendynamiken früh unterbrechen. Wohnstabilität und dauerhafter Leistungszugang zählen, nicht Beratungs- oder Förderfallzahlen." },
      { title: "Gesundheitsfachkräfte und Zugang", text: "Ausbildung, Anerkennung, Teamdesign, Steuerung und Telemedizin können verfügbare Behandlungszeit erhöhen. Reale Berufseintritte, regionale Besetzung, Wartezeiten, Interoperabilität und persönliche Fallback-Zugänge sind entscheidend." },
      { title: "Krankenhaus und Notfall", text: "Spezialisierung kann Qualität erhöhen, zugleich aber Wege verlängern. Bund-Land-Rahmen, Rettung, Ambulanz, Personal, Investition und regionale Kontinuität müssen gemeinsam tragen." },
      { title: "Pflege im Quartier", text: "Aufsuchende Beratung, Pflegestützpunkte und Entlastungsangebote können Selbstbestimmung und Kontinuität stärken. Fachkräfteknappheit, kommunale Kapazität und unbezahlte Angehörigenarbeit dürfen nicht verlagert werden." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
  {
    chapter: 4,
    title: "Landwirtschaft, Weinbau, Natur, Umwelt und Klima",
    pages: "PDF S. 50–59",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 135 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Hohes Resilienz- und Transformationspotenzial mit harten Ressourcengrenzen",
      impactCoreSummary: "Klimaangepasste Landwirtschaft, Waldumbau, Flächenrecycling, Biodiversität, Wasser- und Hochwassermanagement, Erneuerbare und kommunale Anpassung können natürliche und wirtschaftliche Resilienz stärken.",
      editorialSummary: "Wirtschaftliche Nutzung, Beschleunigung, Bewässerung, Holz- und Energiepfade stehen in materiellen Zielkonflikten mit Wasser, Boden, Biodiversität, Kohlenstoffvorrat und Beteiligungsqualität. Kooperation und Akzeptanz können Delivery verbessern, ersetzen aber keine messbaren Schutz- und Erhaltungszustände.",
      keyFinding: "Technologie, Förderung, Holznutzung, installierte Leistung oder regionale Herkunft sind keine Netto-Wirkung; Lebenszyklus, Additionalität, Rebound und Nichtkompensation entscheiden.",
      directionLabel: "Positives Resilienzpotenzial unter Ressourcen- und Nichtkompensationsbedingungen",
      directionKind: "conditional",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Betriebswirtschaftlicher Druck, Klimaexposition, Wasserknappheit, Waldstress, Biodiversitätsverlust, Flächenverbrauch und Emissionen sind getrennte Zustandscluster.",
    goalReview: "Wirtschaftliche Tragfähigkeit, Natur- und Wasserschutz, Klimaneutralität und Anpassungsresilienz sind plausible parallele Ziele. Instrumente und Technologieklassen sind nicht automatisch gleichwertig.",
    findings: [
      { title: "Landwirtschaft und Weinbau", text: "Präzision, Forschung, klimaangepasste Verfahren und Marktzugänge können Ertragssicherheit und Ressourceneffizienz verbessern. Wasser, Pestizide, Boden, Biodiversität, Additionalität und Verteilung nach Betriebsstruktur bleiben maßgeblich." },
      { title: "Wald und Holz", text: "Mischwaldumbau und Prävention können Resilienz stärken. Netto-Klimawirkung von Holz hängt an Vorrat, Ernte, Regeneration, Produktlebensdauer, Substitution, Boden und Gegenfaktum; Entscheidungen wirken über Jahrzehnte." },
      { title: "Biodiversität und Flächenrecycling", text: "Kooperation, Arten-Daten und Flächenrecycling können Planung und Schutz verbessern. Akzeptanz ersetzt nicht Erhaltungszustand; Kompensation darf irreversible Schutzgrenzen nicht legitimieren." },
      { title: "Wasser und Hochwasser", text: "Einzugsgebietslogik und bessere Daten können Exposition und Versorgungsvulnerabilität senken. Bewässerung kann anpassen und zugleich Knappheit verstärken; Wasserbilanz, Mindestzustände und Rebound sind P0." },
      { title: "Klima und Energie", text: "Emissionsarme Erzeugung und Anpassung können Risiken senken. Carbon Management, Biomasse, Wasserkraft, Geothermie, Wind und Wasserstoff benötigen getrennte Lebenszyklus- und Standortprüfungen; der UNESCO-Schutz bleibt harte Grenze." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
  {
    chapter: 5,
    title: "Sicherheit, Rechtsstaat, Infrastruktur, Kommunen und Wohnen",
    pages: "PDF S. 60–75",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 246 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Erhebliches Funktions- und Resilienzpotenzial mit hoher Schutzgrenzen-Sensitivität",
      impactCoreSummary: "Kapazität in Polizei, Justiz und Katastrophenschutz, multimodale Infrastruktur, kommunale Handlungsfähigkeit und sozial gebundener Wohnraum können Sicherheit, Zugang und staatliche Funktionsfähigkeit verbessern.",
      editorialSummary: "Besonders sensibel sind KI-, Daten- und Überwachungssysteme, Straßen- und Flughafen-Lock-ins, kommunale Gegenfinanzierung sowie Beschleunigung und Standarderleichterungen beim Bauen. Personalzahlen, Kameras, Straßenkilometer, Fördervolumen oder digitale Anträge sind keine Wirkung.",
      keyFinding: "Sicherheitstechnologie und Beschleunigung müssen Wirksamkeit, Fehlerrisiken, Rechte, Vertrauen, Lebenszyklus und reale Engpässe zugleich bestehen.",
      directionLabel: "Heterogenes Potenzial mit materiellen Rechte-, Klima- und Finanzierungsrisiken",
      directionKind: "ambivalent",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Kriminalitätslage, Cyberbedrohung, Personalkapazität, Katastrophenrisiko, Infrastrukturzustand, Kommunalfinanzierung und räumlich unterschiedlicher Wohnungsdruck sind getrennte Zustände.",
    goalReview: "Gefahrenabwehr, Rechtsstaat, Resilienz, Mobilitäts- und Wohnzugang sind problemadäquat. Kapazitäts- und Output-Ziele bleiben von Outcome, Rechten und Verteilung getrennt.",
    findings: [
      { title: "Polizei und Justiz", text: "Mehr Personal und Spezialkompetenz können Reaktion und Bearbeitung verbessern. Ausbildung, Vakanz, Prozess, Fehler, Belastung, Zugänglichkeit und Rechtsstaatlichkeit sind maßgeblich." },
      { title: "Datenanalyse, KI und Video", text: "Rechtmäßige Analyse kann Prävention und Ermittlung unterstützen. Fehlpositive, Bias, Missbrauch, Chilling, Datenqualität, Mission Creep und Vendor-Lock-in machen Rechtsgrundlage, Zweckbindung, Verhältnismäßigkeit, Audit und Rechtsbehelf zu eigenständigen Grenzen." },
      { title: "Katastrophenschutz", text: "Risikobasierte Ressourcen, Warnung und Redundanz können Vulnerabilität senken. Warnreichweite, Reaktionszeit und Funktionsfähigkeit bei Kaskadenausfällen zählen; der Ahrtal-Pfad bleibt mit dem bestehenden Wirkungsfall verknüpft." },
      { title: "Mobilität und Infrastruktur", text: "ÖPNV, Bahn, Rad und Erhalt können Zugang und Resilienz verbessern. Zusätzliche Straßen- und Flughafenkapazität kann Fläche, Lärm, Emissionen und induzierte Nachfrage erhöhen; Projektprüfung statt Einheitsrichtung." },
      { title: "Kommunen und Wohnen", text: "Fördervereinfachung und Wohnraumförderung können Kapazität und Zugang verbessern. Die Abschaffung von Straßenausbaubeiträgen verschiebt Finanzierung; Mieterschutz ist teilweise geerbter Bestand von 2025; Beschleunigung muss Qualität, Barrierefreiheit und Klima erhalten." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
    relatedImpactCase: "RP-IMPACT-2026-02",
  },
  {
    chapter: 6,
    title: "Finanzen, Haushalt und Staatsmodernisierung",
    pages: "PDF S. 76–83",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 88 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Investitions- und Staatsfähigkeitspotenzial – reale Kapazität und Priorisierung entscheiden",
      impactCoreSummary: "Finanzierungsspielraum, kommunale Stabilisierung, investive Priorisierung und vereinfachte Verwaltung können Infrastruktur- und Staatsfähigkeitsengpässe adressieren.",
      editorialSummary: "Mehr Schulden und weniger Ausgaben sind weder automatisch positiv noch negativ. Entscheidend sind reale Additionalität, umsetzbare Projekte, Vermögens- und Resilienzgewinne, Folge- und Opportunitätskosten sowie die Frage, ob Effizienzreserven echte Doppelarbeit oder notwendige Kapazität treffen.",
      keyFinding: "Nominale Investitionssummen können bei Planungs- und Bauengpässen Preise statt Zustände verändern; Finanzierungsvorbehalt und Nichtumsetzung haben eigene Wirkungen.",
      directionLabel: "Positives Potenzial unter Additionalitäts-, Delivery- und Generationenbedingungen",
      directionKind: "conditional",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Fiskalischer Spielraum, reale Planungs- und Baukapazität, Infrastrukturzustand, kommunale Finanzkraft und Verwaltungsprozesse sind getrennte Engpässe.",
    goalReview: "Finanzielle Stabilität, Zukunftsinvestitionen und leistungsfähige Verwaltung sind problemadäquat. Kredit, Rücklage, Einsparung und Beteiligung sind Finanzierungsinstrumente, keine Wirkungsrichtung.",
    findings: [
      { title: "Haushalt und Generationen", text: "Kredit kann generationengerecht sein, wenn langlebige Vermögens- und Resilienznutzen entstehen; künftige Lasten steigen bei Fehlinvestition, konsumtiver Dauerbindung oder hohen Folgekosten ohne Zustandsgewinn." },
      { title: "Rheinland-Pfalz-Plan", text: "Der Vertrag konkretisiert den bestehenden Wirkungsfall RP-IMPACT-2026-01. Mittelabfluss bleibt Input; Additionalität, Engpass, Stadt-Land-Verteilung, Projektqualität und Lebenszyklus entscheiden." },
      { title: "Kommunalfinanzen", text: "Der KFA kann kommunale Handlungsfähigkeit stärken. Verteilungsschlüssel, Soziallasten, Steuerkraft und Flächenfunktionen müssen getrennt werden; die Evaluation 2026–2027 ist laufender Lifecycle, nicht Outcome." },
      { title: "Förderung und Steuerverwaltung", text: "Standardisierung und Digitalisierung können Dauer und Aufwand senken. Kontroll-, Korruptions-, Daten-, Bias-, Rechtsbehelfs- und Zugangsrisiken dürfen nicht pauschal als Bürokratie entfallen." },
      { title: "Staatsmodernisierung", text: "Aufgabenkritik, Genehmigungsfiktion und Ende-zu-Ende-Prozesse können Transaktionskosten senken. Personalbegrenzung ist nur kohärent, wenn Produktivitäts- und Aufgabenentlastung vorher oder gleichzeitig real nachgewiesen wird." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
    relatedImpactCase: "RP-IMPACT-2026-01",
  },
  {
    chapter: 7,
    title: "Migration, Integration, Familien, Frauen und Kinder",
    pages: "PDF S. 84–91",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 86 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Getrennte Schutz- und Teilhabepotenziale – keine Migrations-Gesamtrichtung",
      impactCoreSummary: "Sprache, Beratung, Arbeits- und Qualifikationszugang, Gewaltschutz, Kinderschutz und Beteiligung können Capability und Sicherheit stärken; Aufnahme-, Verteil- und Rückführungsdesign bleiben rechts-, kompetenz- und fehlerabhängig.",
      editorialSummary: "Zentralisierung und Digitalisierung können Verfahren beschleunigen und Kommunen entlasten, zugleich aber Fehlklassifikation, Beratungshürden, Datenrisiken und Schutzdefizite skalieren. Rückführungszahl ist kein Wirkungsscore; Pflichtlogik trägt nur bei zugänglichen Angeboten. Hochrisikomanagement und Überwachung benötigen Wirksamkeits- und Grundrechtsprüfung.",
      keyFinding: "Migration ist keine einzelne Kennzahl und kein einheitlicher Wirkungsgegenstand; Aufnahme, Verfahren, Rückkehr, Integration, Fachkräfte, Gleichstellung und Schutz bleiben getrennt.",
      directionLabel: "Positive Teilhabe- und Schutzpotenziale neben hochsensitiven Vollzugspfaden",
      directionKind: "ambivalent",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Aufnahmekapazität, Kommunallast, Verfahrensdauer, Schutzbedarf, Integration, Fachkräftezugang, Gewaltschutz und Kinderschutz sind verschiedene Zustände und dürfen nicht verdichtet werden.",
    goalReview: "Teilhabe, qualifikationsadäquate Arbeit, Schutz, Verfahrensqualität und kommunale Handlungsfähigkeit sind plausible Ziele. Vollzugs- und Sanktionsinstrumente bleiben an Recht, Angebot und individuelle Lage gebunden.",
    findings: [
      { title: "Aufnahme und Verteilung", text: "Klare Zuständigkeit und digitale Verteilung können Reibung senken. Bleibeperspektive-Prognosen dürfen Vulnerabilität, Rechtsstatus und Integrationszugang nicht fehlerhaft oder diskriminierend verkürzen." },
      { title: "Rückkehr und zentrale Behörde", text: "Bündelung kann Qualität und Geschwindigkeit verbessern. Beratung, Rechtsschutz, Fehler- und Aufhebungsquote, sichere Durchführung sowie Bundes- und EU-Abhängigkeiten entscheiden; Vollzugszahl allein ist kein Outcome." },
      { title: "Integration und Fachkräfte", text: "Sprache, Betreuung, Beratung, Anerkennung und psychosoziale Unterstützung können Teilhabe und qualifikationsadäquate Beschäftigung stärken. Ländlicher Zugang, Care, Behinderung und Herkunftslandeffekte bleiben Verteilungsachsen." },
      { title: "Gewalt- und Kinderschutz", text: "Netze, Schutzplätze, Intervention und Risikomanagement können Schutz erhöhen. Technik ersetzt keine Beratung, Täterarbeit, Wohnung oder Reaktionskapazität; False positives und negatives sowie Grundrechte sind zu prüfen." },
      { title: "Familie, Jugend und Vielfalt", text: "Betreuung, frühe Hilfe und Beteiligung können Teilhabe und Selbstwirksamkeit stärken. Angebote und Beiräte zählen erst bei Nutzung, Qualität und echter Rückkopplung als Wirkpfad." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
  {
    chapter: 8,
    title: "Europa, Internationales und Demokratie",
    pages: "PDF S. 92–98",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmaterialer Fachreview und 103 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Positives Kooperations- und Demokratiepotenzial mit Rechts- und Evidenzbedingungen",
      impactCoreSummary: "Grenzüberschreitender Zugang, Austausch, Ehrenamt, Begegnung, politische und Medienbildung sowie Antidiskriminierung können Mobilität, Selbstwirksamkeit, Vertrauen und demokratische Resilienz stärken.",
      editorialSummary: "Viele Aussagen bleiben Positions-, Förder- oder Relationship-Layer. Projekte, Veranstaltungen, Partnerschaften oder Gedenkstättenbesuche sind keine automatische Demokratie- oder Vertrauenswirkung. Desinformations- und Extremismusprävention muss rechtsstaatlich, phänomenunabhängig und verhältnismäßig bleiben und offene Debatte schützen.",
      keyFinding: "Demokratische Resilienz muss an Beteiligung, Kompetenz, Sicherheit, Vertrauen und Diskriminierungserfahrung geprüft werden – nicht an geförderten Aktivitäten.",
      directionLabel: "Positives Resilienzpotenzial unter Rechts-, Zugangs- und Outcome-Bedingungen",
      directionKind: "conditional",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Grenz- und Anerkennungsfriktionen, soziale Isolation, Beteiligungszugang, Desinformation, Gewalt und Diskriminierung sind getrennte Zustände. Politische Förderung oder Partnerschaft ist noch kein Zustandsgewinn.",
    goalReview: "Mobilität, Teilhabe, Schutz und demokratische Resilienz sind problemadäquat. Zivilgesellschaftliche Autonomie, Gleichbehandlung, staatliche Neutralität und offene Debatte bleiben Schutzbedingungen.",
    findings: [
      { title: "Europa und Grenzregion", text: "Kooperation und Förderzugang können reale Mobilitäts- und Verwaltungsfriktionen senken. Landesvertretung oder Bundesratsposition ist kein EU-Rechtsakt; Kohäsionsmittel sind Input." },
      { title: "Internationale Partnerschaften", text: "Partnerschaften sind zunächst strategische Beziehungen. Eigene Wirkungsfälle entstehen erst bei konkreten Programmen, Finanzierungen, Beschaffungen oder Sicherheits- und Infrastrukturhebeln." },
      { title: "Ehrenamt und Begegnung", text: "Zugängliche Infrastruktur kann Kontakte und Selbstwirksamkeit stärken. Bereits organisierte Gruppen, regionale Ungleichheit und der Erhalt von Transparenz und Rechenschaft sind Verteilungsbedingungen." },
      { title: "Bildung, Desinformation und Extremismus", text: "Politische und Medienbildung kann Einordnungs- und Diskursfähigkeit verbessern. Schutz muss an konkrete menschenrechts- und gewaltbezogene Risiken anknüpfen; keine staatliche Bewertung bloß abweichender Meinung." },
      { title: "Antidiskriminierung und Erinnerung", text: "Schutz, Rechtsvollzug und Erinnerung können Resilienz stärken. Teilnahme und Gedenkstättenbesuch sind Exposure; Sicherheits-, Diskriminierungs-, Wissens-, Haltungs- und Vertrauensdaten sind relevante Outcomes." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
  {
    chapter: 9,
    title: "Koalitionszusammenarbeit",
    pages: "PDF S. 99–100",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Governance- und Lifecycle-Review und 31 Source-Commitments veröffentlicht",
    assessment: {
      assessmentLabel: "Governance- und Lifecycle-Ebene – kein eigenständiger Wirkungsfall",
      impactCoreSummary: "Koalitionsausschuss, Abstimmungsregeln, Klausuren und Ressortzuschnitt strukturieren politische Entscheidungsprozesse. Erst konkrete Prioritäts-, Ressourcen- oder Delivery-Änderungen erzeugen eigenständige Wirkungsgegenstände.",
      editorialSummary: "Jährliche Überprüfung kann Lernen und Nachsteuerung stärken, wenn Ex-ante-Annahmen, Outcomes, Evidenz und Versionsänderungen nachvollziehbar bleiben. Konsensregeln können Stabilität erhöhen und zugleich Flexibilität oder Transparenz mindern. Die Zahl der Sitzungen ist kein Outcome.",
      keyFinding: "Governance-Regeln sind keine gesellschaftliche Wirkung; Bundesratsabstimmung, Ressortzuschnitt und Koalitionssitzung bleiben Prozess- und Lifecycle-Fakten.",
      directionLabel: "Keine eigenständige Wirkungsrichtung auf Dokumentebene",
      directionKind: "open",
      evidenceSummary: chapterEvidence,
      realityCheckSummary: "Zu prüfen sind dokumentierte Prioritäts- und Versionsänderungen, Transparenz, Delivery-Entscheidungen und konkrete Regierungshandlungen – nicht die Zahl der Koalitionssitzungen.",
    },
    problemReview: "Das Kapitel beschreibt Koordinations- und Entscheidungsprozesse, keinen eigenständigen gesellschaftlichen Problemzustand.",
    goalReview: "Stabilität, Koordination und regelmäßige Überprüfung können problemadäquate Governance-Ziele sein. Sie werden erst durch transparente Lern- und Umsetzungsschleifen wirkungsrelevant.",
    findings: [
      { title: "Jährlicher Review", text: "Ziel- und Maßnahmenprüfung kann Priorisierung und Anpassung fördern. Ohne Baseline, Outcome, Falsifikationskriterium und nachvollziehbare Revision bleibt sie Reporting." },
      { title: "Konsens und Koalitionsausschuss", text: "Konsens kann Entscheidungsstabilität erhöhen und zugleich Flexibilität oder öffentliche Nachvollziehbarkeit reduzieren. Das ist Governance-Spannung, keine Netto-Wirkung." },
      { title: "Ressorts und Bundesrat", text: "Der Ressortzuschnitt ist ein Fakt des Regierungszeitraums. Bundesratsposition und Enthaltung sind Stationen des politischen Lebenslaufs, keine Landesumsetzung oder Personenbewertung." },
      { title: "WÖk-Handlungsoption", text: noRecommendation },
    ],
  },
];

export const rheinlandPfalzCoalitionQualityLayers = [
  { title: "Materielle Auslassungen", text: "Der Vertrag enthält keine dokumentweit einheitlichen empirischen Baselines, Gegenfakten, Outcome- und Wirkungsindikatoren, Priorisierungskriterien unter Finanzierungsvorbehalt, Delivery-Transparenz oder Lebenszyklus- und Folgekostenprüfung. Das ist eine Governance-Lücke, kein Befund fehlender Wirkung." },
  { title: "Politikkohärenz", text: "Wachstum, Industrie, Verkehr und Bauen stehen in Spannung zu Klima, Natur, Fläche und Ressourcen; Beschleunigung zu Schutz, Beteiligung und Rechtsstaat; Sicherheits-, Daten- und KI-Ausbau zu Grundrechten und Vertrauen; Humanität und Integration zu Vollzugs- und Verteilungsdesign." },
  { title: "Delivery und Ressourcen", text: "Wiederkehrende Engpässe sind Fachkräfte in Bildung, Gesundheit, Verwaltung, Justiz und Planung, kommunale Kapazität, IT und Interoperabilität, Bau- und Wohnkapazität, Bundes- und EU-Abhängigkeiten sowie Haushaltspriorisierung. Mittel, Stellen und Programme bleiben Input oder Output." },
  { title: "Verteilung und Raum", text: "Stadt und Land, kommunale Finanzkraft, Einkommen, Bildung, Gesundheit, Wohnen, Migration und Schutzstatus, Geschlecht, Familie, Alter, Behinderung und künftige Generationen müssen getrennt sichtbar bleiben." },
  { title: "Internationale Verlagerung", text: "Material ist internationale Leakage insbesondere bei Klima, Energie, Import- und Rohstoffketten, Fachkräfterekrutierung, Migration und Rückführung, Luftverkehr, Verteidigung sowie grenzüberschreitenden EU-Systemen." },
  { title: "Robustheit und Lock-in", text: "Alle großen Pfade sind gegen Energie-, Zins-, Baukosten-, Klima-, Fachkräfte-, Konjunktur-, Migrations-, Cyber- und Rechtsänderungsschocks zu prüfen. Straßen, Flughafen, Fläche, Energie, Daten- und IT-Architektur sowie Dauerverpflichtungen besitzen besonders hohe Pfadabhängigkeit." },
  { title: "Falsifikation und Reality Check", text: "Jeder materielle Gegenstand braucht vor Umsetzung Baseline, Mechanismus, erwartetes Zustandsdelta, Verteilung und Schutzgrenzen, Datenquelle, Recheck-Zeitpunkt und einen Befund, der die Ex-ante-Hypothese schwächen würde. Sonst bleibt Monitoring Reporting." },
  { title: "Lifecycle, Version und Coverage", text: "Mandatstext wird nicht zu Umsetzung. Geerbte Instrumente behalten ihren historischen Urheber; die parteioffiziell wiederveröffentlichte Vertragsfassung bleibt von einer nicht nachgewiesenen byte-identischen signierten Endfassung getrennt. Kapitelreview und atomare Quellenabdeckung werden separat ausgewiesen." },
];

export const rheinlandPfalzCoalitionRelationshipModel = {
  sourceDeduplication: "Gemeinsame Kapitel, Seiten, Titel, Akteure oder Themen sind kein Identitätsbeweis. Alle 1.254 expliziten Koalitionszusagen bleiben getrennt; die früher fälschlich erwarteten IDs C02-152 bis C02-160 werden nicht erzeugt.",
  parentChild: "Koalitionszusage, Regierungshandlung, Rechtsakt, Programm, Budget, Umsetzung, Beobachtung, Reality Check und Revision sind getrennte Lebenslaufobjekte. Ein Versprechen wird nicht durch Textähnlichkeit als umgesetzt markiert.",
  competence: "Landes-, kommunale, Bundes-, EU- und gemeinsame Zuständigkeit werden auf dem späteren Maßnahmenobjekt geprüft. Ein Bundesrats- oder Positionscommitment ist keine Umsetzung des angestrebten Bundes- oder EU-Rechts.",
  budgetReservation: "Finanzierungsvorbehalt, Priorisierung und Nichtumsetzung sind selbst wirkungsrelevant. Nominale Finanzierung erzeugt keine Wirkung; reale Kapazität, Additionalität, Verteilung und Lebenszyklus entscheiden.",
  maturity: "Kapitelreviews tragen keine automatische Einzelrichtung auf Quellenzusagen. Erst fachlich freigegebene Einzelreviews oder konkrete Regierungshandlungen dürfen eine eigene Wirkungsbewertung erhalten.",
};

export const rheinlandPfalzCoalitionExistingImpactCases = [
  { id: "RP-IMPACT-2026-01", title: "Rheinland-Pfalz-Plan für Bildung, Klima und Infrastruktur" },
  { id: "RP-IMPACT-2026-02", title: "Wiederaufbau Ahrtal: vom Reparatur- zum Resilienzpfad" },
  { id: "RP-IMPACT-2026-03", title: "Besoldungs- und Versorgungsanpassung 2026–2028" },
  { id: "RP-IMPACT-2026-04", title: "Bundesratspositionen als Landesregierungshandeln" },
  { id: "RP-IMPACT-2026-05-HITZESCHUTZ", title: "Hitzeaktionsplan: geerbter Politikpfad und aktuelle Verstetigung" },
];

export const rheinlandPfalzCoalitionLifecycle = commitmentRegister.lifecycle_chain;

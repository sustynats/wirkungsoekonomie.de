import type { OverviewAssessmentData } from "@/lib/presentation/overview-assessment";
import type { PublicMaturityProjection } from "@/lib/presentation/public-maturity";
import { readFileSync } from "node:fs";
import path from "node:path";

export const BW_COALITION_ROUTE = "/laender/baden-wuerttemberg/mandat-und-praxis";

export type CoalitionSource = {
  title: string;
  institution: string;
  url: string;
  documentType: string;
  documentDate: string | null;
  abstract: string;
  locations: string[];
  usage: "DOCUMENT" | "CHAPTER_3_BASELINE";
};

export type CoalitionFinding = {
  title: string;
  text: string;
};

export type CoalitionGovernancePath = {
  title: string;
  action: string;
  mechanism: string;
  stateChange: string;
  reference: string;
  risk: string;
};

export type CoalitionChapterReview = {
  chapter: number;
  title: string;
  pages: string;
  maturity: "DEEP_REVIEW" | "HIGH_MATERIALITY_REVIEW";
  maturityLabel: string;
  assessment: OverviewAssessmentData;
  problemReview: string;
  goalReview: string;
  findings: CoalitionFinding[];
  relatedImpactCase?: string;
};

export type CoalitionCommitmentRecord = {
  commitment_id: string;
  chapter: number;
  commitment_text: string;
  source_locator: string;
  source_classification: string;
  fach_comment_id: number;
  atomic_count: boolean;
  container_children?: string[];
  parent_container_id?: string;
};

type CoalitionCommitmentRegister = {
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
  source_record_count: number;
  atomic_commitment_count: number;
  explicit_deep_split_flags_remaining: number;
  source_record_semantics: string;
  competence_projection: string;
  resource_financing_guard: { source_commitment_id: string; status: string; public_meaning: string };
  lifecycle_chain: string[];
  non_counting_parent_containers: Array<{ commitment_id: string; children: string[] }>;
  chapter_counts: Array<{ chapter: number; source_records: number; atomic_commitments: number; non_counting_containers: number }>;
  fach_comment_ids: number[];
  global_crosswalk_fach_comment_id: number;
  records: CoalitionCommitmentRecord[];
};

// Reading the approved register as data avoids turning 1,583 source records into
// a gigantic TypeScript literal union while preserving the exact canonical JSON.
const commitmentRegister = JSON.parse(readFileSync(
  path.join(process.cwd(), "data/states/baden-wuerttemberg-coalition-commitments.json"),
  "utf8",
)) as CoalitionCommitmentRegister;

export const badenWuerttembergCoalitionCommitmentRegister = commitmentRegister;
export const badenWuerttembergCoalitionCommitments = commitmentRegister.records;
export const badenWuerttembergCoalitionAtomicCommitments = badenWuerttembergCoalitionCommitments.filter((record) => record.atomic_count);
export const badenWuerttembergCoalitionChapterCounts = commitmentRegister.chapter_counts;

export const badenWuerttembergCoalitionAssessment: OverviewAssessmentData = {
  assessmentLabel: "Heterogenes Mandatsportfolio – keine künstliche Gesamtrichtung",
  impactCoreSummary: "Der Koalitionsvertrag bündelt 15 Kapitel mit unterschiedlichen Problemen, Zielen, Instrumenten, Zuständigkeiten und Wirkpfaden. Seine Wirkung kann deshalb nur auf Ebene konkreter Zusagen, späterer Regierungshandlungen und beobachtbarer Zustandsänderungen belastbar geprüft werden.",
  editorialSummary: "Im vertieft geprüften Dokumentkern besitzen Staatsmodernisierung, Wissenschaftskapazität, Innovation, Teilhabe und Medienpluralität erhebliche positive Potenziale. Gleichzeitig können Mengen-, Abbau-, Wachstums-, Sicherheits- oder Beschleunigungsziele Schutz-, Delivery-, Verteilungs- und Lock-in-Risiken erzeugen. Entscheidend sind die konkrete Ausgestaltung, reale Engpässe, Ressourcen, Rechtsgrenzen und spätere Zustandsdaten.",
  keyFinding: "Ein erfülltes Koalitionsversprechen ist weder automatisch umgesetzt noch wirkungspositiv; alle zusätzlichen finanzwirksamen Maßnahmen stehen zudem unter einem dokumentweiten Haushaltsvorbehalt.",
  directionLabel: "Keine belastbare einheitliche Wirkungsrichtung",
  directionKind: "portfolio",
  evidenceSummary: "Vertragstext, Kapitelstruktur und Instrumentdesign sind amtlich belegt. Alle 15 Kapitel sind hochmaterial geprüft; Kapitel 1 bis 3 liegen vertieft vor. Die 1.577 atomaren Zusagen sind vollständig fundstellengebunden inventarisiert. Umsetzung, Outcome und Attribution bleiben davon getrennte, künftige Prüfstufen.",
  realityCheckSummary: "Ex-ante-Mandatsanalyse. Eingetretene Wirkung ist noch nicht beobachtbar; spätere Regierungshandlungen, Umsetzung und Zustandsdaten werden getrennt verknüpft.",
};

export const badenWuerttembergCoalitionPublicMaturity: PublicMaturityProjection = {
  primary: "EX_ANTE_POTENTIAL_ONLY",
  flags: ["EX_ANTE_POTENTIAL_ONLY", "REALITY_CHECK_PENDING", "ATTRIBUTION_OPEN", "RECOMMENDATION_PENDING"],
  label: "Ex-ante-Mandatsanalyse – Wirkung noch nicht beobachtbar",
  compactHint: "Alle 15 Kapitel und 1.577 atomaren Zusagen sind fundstellengebunden erfasst; Kapitel 1 bis 3 liegen vertieft vor. Umsetzung, Zustandswirkung und Zurechnung bleiben spätere Prüfstufen.",
  assessableNow: [
    "Problem, Ziel, Wirkungspotenziale und Risiken sind auf Kapitel- und hochmaterialer Cluster-Ebene veröffentlicht.",
    "Die dokumentweiten Delivery-, Finanzierungs-, Kohärenz- und Schutzbedingungen sind fachlich ausgewiesen.",
    "1.577 atomare CoalitionCommitments sind mit stabiler Kennung und Fundstelle vollständig inventarisiert.",
  ],
  openPoints: [
    "Tatsächliche Umsetzung, Zustandsänderung und Zurechnung sind noch nicht beobachtbar.",
    "Eine fachlich freigegebene WÖk-Handlungsoption liegt für das Mandatsportfolio nicht vor.",
  ],
  layers: [
    { id: "problem", label: "WÖk-Problemprüfung", status: "AVAILABLE", detail: "Für alle Kapitel auf Kapitel- und hochmaterialer Cluster-Ebene veröffentlicht; Kapitel 1 bis 3 vertieft." },
    { id: "goal", label: "WÖk-Zielprüfung", status: "AVAILABLE", detail: "Für alle Kapitel veröffentlicht; vertiefte Zielhierarchie für Kapitel 1 bis 3." },
    { id: "impact", label: "Wirkungspotenziale und Risiken", status: "AVAILABLE", detail: "Ex-ante-Mandatsanalyse mit Querschnittsebenen veröffentlicht." },
    { id: "reality", label: "Beobachtung und Reality Check", status: "OPEN", detail: "Erst nach Regierungshandlung, Umsetzung und beobachtbarer Zustandsänderung belastbar." },
    { id: "recommendation", label: "WÖk-Handlungsoption", status: "PENDING", detail: "Keine fachlich freigegebene Handlungsoption vorhanden." },
    { id: "operationalization", label: "Quellen- und Lifecycle-Operationalisierung", status: "AVAILABLE", detail: "1.577 atomare Zusagen sind vollständig fundstellengebunden; echte Regierungshandlungen werden erst bei amtlichem Nachweis verknüpft." },
  ],
};

export const badenWuerttembergCoalitionGovernanceReview = {
  assessment: {
    assessmentLabel: "Starkes Steuerungspotenzial – kausale Evaluation und Finanzierung bleiben entscheidend",
    impactCoreSummary: "Der Vertrag will in Kabinettsvorlagen, Förderprogrammen und Haushaltsaufstellung Wirkungsziele mit Zielzustand, Zielgruppe, Zeithorizont und Monitoring verankern. Das kann öffentliche Mittel stärker an tatsächlichen Zustandsänderungen statt allein an Mittelabfluss oder Umsetzung ausrichten.",
    editorialSummary: "Die explizite Outcome-Orientierung ist ein substanzieller Steuerungshebel. Monitoring macht Veränderungen sichtbar, belegt aber ohne Baseline, Gegenfaktum oder tragfähiges Beitragsdesign noch keine Kausalität. Zugleich kann der angekündigte Verzicht auf neue Evaluationspflichten die Lernschleife schwächen; der Haushaltsvorbehalt macht Priorisierung, Sequenz und mögliche Nichtumsetzung zu eigenen wirkungsrelevanten Entscheidungen.",
    keyFinding: "Wirkungsziel und Monitoring werden erst dann zur belastbaren Wirkungssteuerung, wenn Outcome, Zurechnung, Nebenwirkungen, Schutzgrenzen und Nachsteuerung gemeinsam geprüft werden.",
    directionLabel: "Positives Steuerungspotenzial unter Kausalitäts-, Evaluations- und Delivery-Bedingungen",
    directionKind: "conditional" as const,
    evidenceSummary: "Die Steuerungsabsicht ist im amtlich verlinkten Vertrag auf den Seiten 144 bis 145 belegt; Nachhaltigkeitscheck und Evaluationsregel stehen auf Seite 16, der Haushaltsvorbehalt auf den Seiten 161 bis 162. Umsetzung, Qualität der Kennzahlen, Nachsteuerung und reale Wirkung sind noch nicht beobachtbar.",
    realityCheckSummary: "Ex ante. Zu prüfen ist später, ob Vorlagen und Programme tatsächlich Zielzustand, Zielgruppe, Zeitpunkt, Outcome-Indikator, Schutzgrenzen und nachvollziehbare Nachsteuerung ausweisen.",
  } satisfies OverviewAssessmentData,
  problemReview: "Der Vertrag benennt mehrere bindende Engpässe: langsame Verfahren, Bürokratie, schleppende Infrastruktur- und Digitalinvestitionen, demografischen Wandel, wirtschaftlichen Transformationsdruck, Klima- und Naturkrise sowie begrenzte finanzielle und kommunale Kapazität. Diese Ursachen müssen je Maßnahme getrennt geprüft werden.",
  goalReview: "Öffentliche Mittel zielgenau und outcome-orientiert einzusetzen ist problemadäquat. Output und Umsetzung bleiben vom Outcome getrennt; beobachtete Zustandsänderung ist kein automatischer Kausalitätsbeleg, und Wirkungsziele einzelner Dimensionen dürfen harte Schutzgrenzen anderer Dimensionen nicht kompensieren.",
  paths: [
    {
      title: "Outcome-orientierte Haushalts- und Fördersteuerung",
      action: "Wirkungsziele in Kabinettsvorlagen, Förderprogrammen und Haushalt; messbare Ziele und Monitoring",
      mechanism: "Ressorts müssen gewünschten Zielzustand, Zielgruppe und Zeithorizont expliziter machen; Programme können vergleichbarer und nachsteuerbarer werden",
      stateChange: "Mittel können stärker auf relevante Ergebnisse statt nur Input oder Output ausgerichtet werden",
      reference: "Staatliche Handlungsfähigkeit und Rechenschaft; Mensch und Planet abhängig vom jeweiligen Fachprogramm",
      risk: "Leicht messbare Größen können schwer messbare Outcomes verdrängen; ohne Gegenfaktum oder Beitragsdesign bleibt Zurechnung offen.",
    },
    {
      title: "Konsolidierung der Förderprogramme",
      action: "Programme reduzieren, zentralisieren und digitalisieren sowie Wirkungsziele prüfen",
      mechanism: "Such-, Antrags- und Administrationskosten können sinken; größere Programme können klarer gesteuert werden",
      stateChange: "Zugang und Verwaltungseffizienz können steigen",
      reference: "Antragstellende, Verwaltungskapazität und regionale Teilhabe",
      risk: "Kleine Zielgruppen und Innovationsnischen können in großen Programmen untergehen; standardisierte Zugänge können finanz- oder personalstarke Antragstellende begünstigen.",
    },
    {
      title: "Bessere Rechtsetzung, Digital- und Nachhaltigkeitscheck",
      action: "Digital-Check, Praxischecks, Reallabore, gestärkter Nachhaltigkeitscheck, Sunset-Klauseln und stärker automatisierter Vollzug",
      mechanism: "Vollzugsfolgen können früher sichtbar und Regeln verständlicher, reversibler oder testbarer werden",
      stateChange: "Erfüllungsaufwand kann sinken und Normqualität steigen",
      reference: "Verwaltungszugang, Rechtsstaat, Schutzfunktionen und Nachhaltigkeit",
      risk: "Sunset oder Abbau kann Schutz- und Kontrollfunktionen schwächen; weniger neue Evaluationspflichten können die institutionelle Lernschleife begrenzen.",
    },
    {
      title: "Haushaltsvorbehalt als Portfolio-Gate",
      action: "Zusätzliche finanzwirksame Maßnahmen nur bei finanziellem Spielraum und gegebenenfalls stufenweise umsetzen",
      mechanism: "Budgetrestriktionen erzwingen Auswahl, Priorisierung und Sequenz",
      stateChange: "Kurzfristige Haushaltsrisiken können begrenzt werden; zugleich kann Wirkung aus verschobener Prävention oder Investition verloren gehen",
      reference: "Fiskalische Tragfähigkeit, öffentliche Vermögenswerte, Resilienz und Generationenwirkung",
      risk: "Nichtumsetzung und Verzögerung erzeugen eigene Opportunitäts- und Folgekosten; ein Haushaltsstatus ist kein Wirkungsnachweis.",
    },
  ] satisfies CoalitionGovernancePath[],
};

export const badenWuerttembergCoalitionSources: CoalitionSource[] = [
  {
    title: "Koalitionsvertrag für Baden-Württemberg 2026–2031",
    institution: "Land Baden-Württemberg",
    url: "https://www.baden-wuerttemberg.de/de/regierung/koalitionsvertrag-fuer-baden-wuerttemberg",
    documentType: "Amtliche Regierungsseite",
    documentDate: "2026-05-06",
    abstract: "Die amtliche Regierungsseite dokumentiert Vorstellung, parteiliche Billigung, Unterzeichnung und Regierungsbeginn. Sie führt den aktuell verlinkten Vertragstext, belegt aber für sich allein weder Umsetzung noch Wirkung einzelner Zusagen.",
    locations: ["Vorstellung 6. Mai 2026", "Parteitagszustimmung 9. Mai 2026", "Unterzeichnung 11. Mai 2026", "Regierungsbeginn 13. Mai 2026"],
    usage: "DOCUMENT",
  },
  {
    title: "Aus Verantwortung fürs Land – Gemeinsam stark in stürmischen Zeiten",
    institution: "Land Baden-Württemberg",
    url: "https://www.baden-wuerttemberg.de/fileadmin/redaktion/dateien/PDF/260506_Koalitionsvertrag_GrueneBW_CDUBW_2026-2031.pdf",
    documentType: "Amtlich verlinkter Koalitionsvertrag (PDF)",
    documentDate: "2026-05-06",
    abstract: "Das PDF ist die aktuell amtlich verlinkte Vertragsgrundlage. Es enthält zugleich noch die interne Bezeichnung als Entwurf für die Parteitage am 9. Mai 2026. Deshalb bleibt die Quellenfassung transparent als amtlich verlinkter Vertragstext mit internem Entwurfsvermerk gekennzeichnet; eine byte-identische signierte Endfassung wird nicht behauptet.",
    locations: ["gesamtes Dokument", "interner Entwurfsvermerk am Dokumentanfang", "S. 16: Nachhaltigkeitscheck und Evaluationspflichten", "S. 144–145: Wirkungsziele und Outcome-Monitoring", "S. 161–162: Haushaltsvorbehalt", "Kapitel 1 bis 15"],
    usage: "DOCUMENT",
  },
  {
    title: "Hochschulfinanzierungsvereinbarung 2026–2030",
    institution: "Ministerium für Wissenschaft, Forschung und Kunst Baden-Württemberg",
    url: "https://mwk.baden-wuerttemberg.de/de/hochschulen-studium/hochschulpolitik/hochschulfinanzierung-2026-2030",
    documentType: "Amtliche Bestands- und Lifecycle-Quelle",
    documentDate: "2025-04-02",
    abstract: "Die amtliche Seite dokumentiert die bereits 2025 unterzeichnete Hochschulfinanzierungsvereinbarung III für 2026 bis 2030. Sie ist geerbter Baseline-Bestand und darf nicht rückwirkend der seit Mai 2026 amtierenden Regierung zugerechnet werden; die angekündigte HoFV IV ab 2031 bleibt ein eigener Zukunftspfad.",
    locations: ["Unterzeichnung 2. April 2025", "Laufzeit 2026 bis 2030", "Abgrenzung zur angekündigten HoFV IV ab 2031"],
    usage: "CHAPTER_3_BASELINE",
  },
];

const openRecommendation = "Für dieses Kapitel liegt noch keine fachlich freigegebene WÖk-Handlungsoption vor. Eine Empfehlung wird nicht technisch erzeugt.";
const exAnteReality = "Ex-ante-Prüfung des Mandatsdokuments; tatsächliche Zustandsänderung und Zurechnung sind noch nicht beobachtbar.";
const deepEvidence = "Vertragstext und Instrumentdesign sind hoch belegt. Outcome und Impact sind ex ante; Baselines, Umsetzung und Attribution müssen später getrennt nachgewiesen werden.";
const initialEvidence = "Hochmateriale Kapitel- und Clusterprüfung sowie die vollständige atomare Quelleninventarisierung sind veröffentlicht. Ein eigener vertiefter Wirkungsreview entsteht nur für materielle, fachlich ausdrücklich geprüfte oder später umgesetzte Einzelgegenstände.";

export const badenWuerttembergCoalitionChapters: CoalitionChapterReview[] = [
  {
    chapter: 1,
    title: "Staatsmodernisierung",
    pages: "Kapitel 1",
    maturity: "DEEP_REVIEW",
    maturityLabel: "Vertiefter Fachreview veröffentlicht",
    assessment: {
      assessmentLabel: "Erhebliches positives Modernisierungspotenzial – Mengen- und Abbauziele bleiben ambivalent",
      impactCoreSummary: "Ende-zu-Ende-Digitalisierung, Once Only, lernende Verwaltung und outcome-orientiertere Förderung können Bearbeitungszeit, Fehler und Zugangsaufwand senken. Weniger Programme, Personal, Pflichten oder Kontrollen sind dagegen noch keine Wirkung.",
      editorialSummary: "Das stärkste Potenzial liegt in Prozess- und Datenarchitektur sowie messbaren Förderzielen. Das stärkste Risiko entsteht, wenn Entlastungs- oder Personalziele Schutz- und Umsetzungskapazität abbauen, bevor Digitalisierung und Produktivitätsgewinne tragen.",
      keyFinding: "Eine um fünf Prozent kleinere Verwaltung ist kein Wirkungsziel; Servicequalität, Rechtsbehelfe, Schutzfunktionen und kommunale Belastung entscheiden über die Richtung.",
      directionLabel: "Positives Potenzial unter klaren Schutz- und Delivery-Bedingungen",
      directionKind: "conditional",
      evidenceSummary: deepEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Der Vertrag beschreibt ein Kapazitätsproblem aus detailreicher Regulierung, langsamen Verfahren, Doppelstrukturen und unzureichend digitalen Prozessen. Die Problemhypothese ist tragfähig; Ausmaß und tatsächliche Ursachenanteile müssen je Prozess empirisch getrennt werden.",
    goalReview: "Ein leistungsfähiger, bürgernaher und digitaler Staat ist problemadäquat. Vereinfachung bleibt an die Bedingung gebunden, dass Sicherheit, Umwelt- und Sozialschutz, Transparenz, Korruptionsprävention, Rechtsbehelf, Beteiligung und Gleichbehandlung nicht materiell geschwächt werden.",
    findings: [
      { title: "Ende-zu-Ende-Digitalisierung, Once Only und One Stop Shop", text: "Gemeinsame Register, Datenplattformen, Identitätslösungen und medienbruchfreie Prozesse können Mehrfacheingaben, manuelle Übergaben, Bearbeitungszeit und Fehlerraten senken. Interoperabilität, Datenschutz, Datenqualität, Barrierefreiheit, Cyberresilienz und ein analog zugänglicher Fallback sind wirkungsentscheidend." },
      { title: "Förderwesen: Zielorientierung statt bloßer Programmzahl", text: "Messbare, zeitlich definierte Ziele und digitale Zugänge besitzen hohes Steuerungspotenzial. Das Ziel, mindestens ein Drittel der Förderprogramme zu reduzieren, ist jedoch kein Wirkungsziel und darf spezialisierte wirksame Instrumente nicht allein nach Anzahl verdrängen." },
      { title: "Effizienzgesetz, Sunset und One-in-two-out", text: "Echte Doppel- und Niedrigrisikopflichten können entfallen und Kapazität freisetzen. Pauschale Ablauf- oder Mengenmechanismen können zugleich Informations-, Schutz-, Beteiligungs-, Transparenz-, Rechtsstaats- oder Kontrollfunktionen treffen; der Nutzen des bisherigen Standards muss vor dem Abbau sichtbar geprüft werden." },
      { title: "Nachhaltigkeitscheck und weniger Evaluationspflichten", text: "Eine stärkere Ex-ante-Rechtsfolgen- und Nachhaltigkeitsprüfung ist positiv anschlussfähig. Wenn zugleich Ex-post-Daten und materialitätsorientierte Evaluation fehlen, kann bei teuren, irreversiblen oder schutzgutsensiblen Regeln die Lernschleife abbrechen." },
      { title: "Personalbestand minus fünf Prozent", text: "Personalkosten können nur dann ohne Serviceverlust sinken, wenn Produktivitätsgewinne aus Prozessreform, Digitalisierung und KI vor oder parallel zum Stellenabbau realisiert werden. Bearbeitungszeiten, Backlogs, Fehler, Rechtsbehelfe, Krankenstand, Fluktuation und Nutzerzugang sind die maßgeblichen Recheck-Größen." },
      { title: "WÖk-Handlungsoption", text: openRecommendation },
    ],
    relatedImpactCase: "BW-IMPACT-2026-03",
  },
  {
    chapter: 2,
    title: "Wirtschaft, Handwerk, Arbeit und Tourismus",
    pages: "gedruckte Seiten 21–33",
    maturity: "DEEP_REVIEW",
    maturityLabel: "Vertiefter Fachreview veröffentlicht",
    assessment: {
      assessmentLabel: "Erhebliches Transformations- und Teilhabepotenzial – Wachstum ist kein Gesamtmaßstab",
      impactCoreSummary: "Technologietransfer, Green Tech, Gründungen, berufliche Bildung, internationale Fachkräfte, Arbeitsmarktintegration und Kreislaufpfade können zusätzliche produktive und resiliente Kapazität schaffen.",
      editorialSummary: "Wachstum, Investitionshöhe, Firmengründungen und Arbeitsplatzzahlen bleiben Zwischen- oder Outcomegrößen. Ihre Wirkung hängt von Additionalität, Arbeitsqualität, Verteilung, Ressourcen- und Klimaeffekten, Resilienz und langfristigen Lock-ins ab.",
      keyFinding: "Der zentrale Reality- und Delivery-Test ist die Kohärenz zwischen Wachstums- und Beschleunigungsvorrang einerseits sowie Klima, Natur, Gesundheit, Beteiligung und langfristigen Transformationskosten andererseits.",
      directionLabel: "Gegenläufige Wirkungsrichtungen in einem heterogenen Wirtschaftsportfolio",
      directionKind: "ambivalent",
      evidenceSummary: deepEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Exportabhängigkeit, technologischer Wettbewerb, Transformation, Fachkräftebedarf, Kapitalzugang, Energie- und Rohstoffresilienz sowie regulatorische Kapazität sind verschiedene Problemtypen. Vor Einzelbewertungen muss der tatsächlich bindende Engpass mit Daten getrennt werden.",
    goalReview: "Wachstum, Wertschöpfung und gute Arbeit stehen neben sozialem Aufstieg, Klima, Natur und Lebensqualität. Wirtschaftliches Wachstum ist Mittel oder Zwischenzustand und nur bei produktiver Additionalität, Teilhabe, Ressourcenverträglichkeit und Resilienz positiv einzuordnen.",
    findings: [
      { title: "High-Tech-Strategie, Transfer und Reallabore", text: "Geringere Transfer- und Skalierungsbarrieren können Innovation, Investitionen und qualifizierte Beschäftigung fördern. Politische Technologiewetten, Mitnahme, Fachkräfte-, Strom- und Flächenkonkurrenz, regionale Konzentration und Lock-in bleiben materielle Risiken." },
      { title: "Klimaneutrale Produktion und Technologieportfolio", text: "Technologieoffenheit ist kein Wirkungsnachweis. Elektrifizierung, Wasserstoff, CCS/CCU, synthetische oder biogene Kraftstoffe und weitere Technologien müssen an realer Lebenszyklus-Emissionsminderung, Energie- und Ressourcenbedarf, Kosten, Skalierbarkeit, Sicherheit, Lock-in und Opportunitätskosten geprüft werden." },
      { title: "ZukunftsFondsBW", text: "Öffentliches und privates Kapital kann Finanzierungslücken für Gründung und Skalierung reduzieren. Entscheidend sind zusätzliche Finanzierung und gesellschaftlicher Zustandsgewinn; Risikoteilung, Rendite- und Verlustverteilung, Managementkosten sowie Zugang kleiner, regionaler und von Frauen gegründeter Unternehmen bleiben sichtbar." },
      { title: "Förderlandschaft und Invest BW", text: "Standardisierung, Digitalisierung und messbare Erfolgsziele können Such- und Antragskosten senken. Eine bloße Bündelung oder Reduktion von Programmen darf spezialisierte, wirksame und zugängliche Instrumente nicht verdrängen." },
      { title: "Industrie, Automobil und Flächen", text: "Transformationsinvestitionen können Cluster, Einkommen und Exportresilienz stabilisieren. Pfadabhängigkeit, Stranded Assets, Flächen-, Biodiversitäts-, Verkehrs- und Energieeffekte sowie eine Überförderung etablierter Strukturen verlangen getrennte untergeordnete Wirkungsfälle und Rechtsprüfungen." },
      { title: "Handel, Rohstoffe und Kreislaufwirtschaft", text: "Diversifizierung und Sekundärrohstoffe können Versorgungsresilienz erhöhen. Importierte Umwelt- und Sozialschäden sowie Emissions- oder Ressourcenverlagerung dürfen dabei nicht aus der Bilanz verschwinden." },
      { title: "Fachkräfte, Ausbildung und internationale Zuwanderung", text: "Berufsorientierung, Teilzeitausbildung, Betreuung, Welcome Center und schnellere Anerkennung besitzen überwiegend positives Zugangs- und Teilhabepotenzial. Qualitäts-, Sicherheits- und Gleichbehandlungsstandards sowie Wirkungen auf Herkunftssysteme bleiben materialitätsabhängig zu prüfen." },
      { title: "Faire Arbeit und KI", text: "Produktivitätsgewinne sind nur dann ein positiver Menschen- und Wohlstandspfad, wenn sie nicht ausschließlich als Arbeitsverdichtung, Beschäftigungsverlust oder einseitige Kapitalrendite anfallen. Reale Löhne, Arbeitsqualität, Qualifizierung, Belastung und Verteilung der Gewinne sind Reality-Check-Größen." },
      { title: "WÖk-Handlungsoption", text: openRecommendation },
    ],
  },
  {
    chapter: 3,
    title: "Wissenschaft, Forschung, Kunst und Medien",
    pages: "gedruckte Seiten 34–45",
    maturity: "DEEP_REVIEW",
    maturityLabel: "Vertiefter Fachreview veröffentlicht",
    assessment: {
      assessmentLabel: "Überwiegend positives Kapazitäts- und Resilienzpotenzial mit Freiheits- und Datenschutzgrenzen",
      impactCoreSummary: "Verlässliche Wissenschaftsfinanzierung, Infrastruktur, Open Science, Zugang, Kulturteilhabe, Medienpluralität und Medienkompetenz können Wissens-, Innovations- und Demokratieresilienz stärken.",
      editorialSummary: "Transfer-, Leistungs-, Sicherheits- oder Fördersignale dürfen Wissenschaftsfreiheit, Grundlagenforschung, kulturelle und mediale Unabhängigkeit nicht verengen. Gesundheitsdaten und Open Science brauchen Datenschutz und Sicherheit; der Social-Media-Unter-16-Pfad bleibt ein eigener ambivalenter Wirkungsfall.",
      keyFinding: "Die HoFV III für 2026 bis 2030 ist geerbter Baseline-Bestand; nur der angekündigte HoFV-IV-Pfad ab 2031 gehört als neue Mandatszusage in diesen Lifecycle.",
      directionLabel: "Überwiegend positives Potenzial mit materiellen Schutzgrenzen",
      directionKind: "protection",
      evidenceSummary: deepEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Finanzierung und Infrastruktur, Zugang und Fachkräfte, Transfer, digitale Souveränität, Inklusion, Kulturzugang sowie Medienpluralität und Plattformmacht sind getrennte Problemfamilien. Der Vertrag ist keine empirische Baseline für ihre jeweiligen Ursachen.",
    goalReview: "Wissenschaftsfreiheit, Exzellenz, Transfer, Zugang, kulturelle Vielfalt und Medienpluralität sind tragfähige Zielräume. Wissenschaft, Kultur und Medien besitzen eigenständige Funktionen für Erkenntnis, Kritik, Bildung, Selbstverständigung, Pluralismus und demokratische Resilienz.",
    findings: [
      { title: "Hochschulfinanzierung IV und Infrastruktur", text: "Dynamisierte Grundfinanzierung und Modernisierung können Planbarkeit, Lehre, Forschung und Resilienz stärken. Leistungsindikatoren dürfen kurzfristige Outputs oder Drittmittel nicht gegen Grundlagenforschung und kleine Fächer verzerren; Lebenszyklus-, Energie- und Betriebskosten bleiben Teil der Prüfung." },
      { title: "Medizinstudienplätze und Landarztquote", text: "Zusätzliche Studienplätze können langfristig das Angebot erhöhen, lösen regionale Versorgung aber nicht automatisch. Verteilung, Weiterbildung, Arbeitsbedingungen, Bindung und Zeitverzug sind eigene Mechanismen." },
      { title: "Internationale Talente und Visa", text: "Weniger Kosten- und Zeitbarrieren können Zugang, Forschungskapazität und Vernetzung erhöhen. Visa bleiben Bundesabhängigkeit; Abschluss, Verbleib und Übergang in Forschung oder Arbeitsmarkt sind relevanter als Einschreibezahlen." },
      { title: "Digitale Transformation, Cyber und Barrierefreiheit", text: "Vereinheitlichte IT, Clouds und digitale Services können Zugang und Resilienz verbessern. Zentralisierung kann Fehler und Cyberrisiken skalieren; offene Standards, Interoperabilität, Datenschutz und Accessibility müssen von Beginn an mitgebaut werden." },
      { title: "Wissenschaftsfreiheit, Transfer und Dual Use", text: "Transfer und Schlüssel- oder Sicherheitsforschung können Erkenntnis, Souveränität und Problemlösung stärken. Förderprioritäten dürfen Wissenschaftsfreiheit nicht zur politischen Ergebnissteuerung verengen; Dual Use braucht projektbezogene Exportkontroll-, Ethik-, Sicherheits- und Missbrauchsprüfung." },
      { title: "Gesundheitsdaten und Universitätsklinika", text: "Vernetzte Daten und Kooperation können Forschung, Translation und Versorgung unterstützen. Mehr Datennutzung ist ein Enabler, nicht automatisch bessere Versorgung; Datenschutz, Informationssicherheit, Rechtsgrundlagen, Zweckbindung und Patientensicherheit bleiben Schutzgrenzen." },
      { title: "Open Science und IP", text: "Offene Infrastruktur und schnellere IP-Verfahren können Wissenszugang und Transfer verbessern. Offenheit muss mit Datenschutz, Sicherheits-, Dual-Use- und legitimen IP-Interessen ausbalanciert werden." },
      { title: "Kulturförderung, Teilhabe und faire Vergütung", text: "Mehrjährige Förderung, Dritte Orte und faire Vergütung können Planungssicherheit, Begegnung und regionale Kulturresilienz stärken. Kleine und neue Akteure, Kunstfreiheit, politische Unabhängigkeit sowie Stadt-Land-Verteilung brauchen transparente Zugänge und Reviews." },
      { title: "Medienvielfalt und Plattformpolitik", text: "Tragfähige private und öffentlich-rechtliche Medien, regionale Angebote und geringere Plattformabhängigkeit können Informationsresilienz stärken. Medienförderung braucht staatsferne, transparente Kriterien; Berichtspflichten dürfen nicht ohne Prüfung ihrer Rechenschaftsfunktion gestrichen werden." },
      { title: "Medienbildung und Social Media unter 16", text: "Medienbildung ist ein eigener Befähigungshebel. Der Zugangsausschluss unter 16 wird nicht damit aggregiert, sondern mit dem bestehenden Wirkungsfall zum digitalen Jugendschutz verknüpft: Schutzpotenziale treffen dort auf Teilhabe-, Datenschutz-, Umgehungs- und Kompetenzfragen." },
      { title: "WÖk-Handlungsoption", text: openRecommendation },
    ],
    relatedImpactCase: "BW-IMPACT-2026-01",
  },
  {
    chapter: 4,
    title: "Bildung, Jugend und Sport",
    pages: "gedruckte Seiten 46–56",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Plausibles Bildungs- und Teilhabepotenzial – Personal, Plätze und Qualität sind offene Bedingungen",
      impactCoreSummary: "Frühere Förderung, Sozialindex, multiprofessionelle Teams sowie Demokratie- und Medienbildung können Kompetenzen, faire Startchancen und Selbstwirksamkeit stärken.",
      editorialSummary: "Teilnahme, zusätzliche Teams oder Gremien sind Outputs. Sprach- und Entwicklungsstände, Bildungserfolg, soziale Verteilung, Beteiligungsqualität und reale Rückkopplung müssen die Wirkung tragen.",
      keyFinding: "Das kostenfreie verbindliche letzte Kindergartenjahr bleibt von Personal-, Platz-, Qualitäts-, Kinderrechts- und kommunalen Finanzierungsbedingungen abhängig.",
      directionLabel: "Positives Potenzial unter materiellen Delivery-Bedingungen",
      directionKind: "conditional",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Sprach- und Basiskompetenzen, Chancengerechtigkeit, Personal, Ganztag, Übergänge, Demokratie- und Medienbildung sowie Leistungsförderung sind getrennte Zustände mit eigenen Baselines.",
    goalReview: "Bildungserfolg, faire Startchancen, Teilhabe, Wohlbefinden und Demokratie sind tragfähige Ziele; Ressourcen, Verbindlichkeit, Freiheit und Personal müssen instrumentbezogen geprüft werden.",
    findings: [
      { title: "Letztes Kindergartenjahr", text: "Kostenfreiheit und Verbindlichkeit können Teilhabe und frühe Förderung stärken. Personal, Plätze, Qualität, besondere Bedarfe, Familien- und Kinderrechte sowie kommunale Finanzierung bleiben materielle Bedingungen." },
      { title: "Sozialindex und multiprofessionelle Teams", text: "Bedarfsorientierte Ressourcen besitzen positives Verteilungspotenzial. Bildungs- und Teilhabeoutcomes müssen nach sozialer Lage und Region beobachtet werden." },
      { title: "Demokratie-, Medienbildung und Jugendbeteiligung", text: "Beteiligungsqualität, soziale Reichweite und tatsächliche Rückkopplung in Entscheidungen sind maßgeblich; die Zahl von Gremien ist kein Demokratiewirkungsnachweis." },
    ],
  },
  {
    chapter: 5,
    title: "Umwelt, Klima und Energiewirtschaft",
    pages: "gedruckte Seiten 58–66",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Positives Klima- und Resilienzpotenzial – heterogene Technologie- und Delivery-Risiken",
      impactCoreSummary: "Klimaziel, Anpassung, Wasserresilienz, Kreislaufwirtschaft, Netze, Speicher und erneuerbare Energien können Emissionen, Vulnerabilität und Ressourcenabhängigkeit senken.",
      editorialSummary: "Inputzusagen und Zielkorridore sind noch keine Wirkung. CCS, Wasserstoff, H2-ready Kraftwerke und Infrastruktur müssen an Lebenszyklus, Verfügbarkeit, Kosten, Lock-in, Schutzgrenzen und internationalen Verlagerungen geprüft werden.",
      keyFinding: "Eine Rechen- oder Verantwortungsregel zu Mehremissionen verändert keine physische Emission; weniger Berichtspflichten dürfen Monitoring und Reality Check nicht schwächen.",
      directionLabel: "Positives Potenzial mit gegenläufigen Technologie- und Umsetzungsrisiken",
      directionKind: "ambivalent",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Klimarisiken, Biodiversitätsverlust, Wasser und Extremwetter, Ressourcen sowie Energieinfrastruktur sind materiell, aber getrennt zu baselinen.",
    goalReview: "Klimaneutralität 2040, Anpassung, sichere und bezahlbare Versorgung sowie Natur-, Wasser- und Ressourcenschutz sind tragfähige Ziele; irreversible Grenzen dürfen nicht wegsaldiert werden.",
    findings: [
      { title: "Wasserresilienz und Schwammstadt", text: "Rückhalt, Messnetze und Starkregenvorsorge besitzen positives Schutzpotenzial. Regionale Exposition, Vulnerabilität und Konflikte mit Natur und Fläche bleiben projektbezogen." },
      { title: "Kreislaufwirtschaft", text: "Sekundärrohstoffe und zirkuläres Bauen können Primärbedarf und Deponielast senken, wenn echte Substitution statt Rebound oder Importverschiebung entsteht." },
      { title: "Klimaziel und Monitoring", text: "Mehrjahreskorridore dürfen Volatilität abfedern, aber keine reale Zielverfehlung verdecken. Monitoring- und Recheck-Fähigkeit müssen trotz weniger Berichtspflichten erhalten bleiben." },
      { title: "Klimamilliarde", text: "Eine Milliarde Euro ist Input. Additionalität, reale Engpässe, kommunale Umsetzbarkeit, Lebenszyklus und Outcome entscheiden über die Wirkung." },
      { title: "CCS, Netze, Speicher und Wasserstoff", text: "Das Energieportfolio ist heterogen. Vermeidung, Netze, Speicher, CCS und Wasserstoffpfade brauchen getrennte Lebenszyklus-, Kosten-, Sicherheits-, Import-, Infrastruktur- und Lock-in-Prüfungen." },
    ],
    relatedImpactCase: "BW-IMPACT-2026-05",
  },
  {
    chapter: 6,
    title: "Inneres und Kommunen",
    pages: "gedruckte Seiten 68–78",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Schutz- und Resilienzpotenzial mit hohen Grundrechts- und Delivery-Anforderungen",
      impactCoreSummary: "Mehr Fachkapazität, Technik, Behördenkooperation, Gewaltschutz und DSA-Vollzug können Sicherheits- und Reaktionsfähigkeit stärken.",
      editorialSummary: "Sicherheitsinstrumente werden nicht aus ihrem Zielbezug positiv bewertet. Fehlklassifikation, Überwachungsintensität, Datenschutz, rechtsstaatliche Kontrolle, kommunale Selbstverwaltung und Tool-Lock-in bleiben materielle Grenzen.",
      keyFinding: "Beschaffung, Monitoringstellen oder gelöschte Inhalte sind Outputs; tatsächlicher Schutz, weniger Gewalt und institutionelle Resilienz müssen getrennt beobachtet werden.",
      directionLabel: "Schutzpotenzial mit materiellen Freiheits- und Rechtsrisiken",
      directionKind: "protection",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Cyber, Spionage, Desinformation, organisierte Kriminalität, Gewalt, Bevölkerungsschutz, kommunale Handlungsfähigkeit und subjektives Sicherheitsgefühl sind verschiedene Zustände.",
    goalReview: "Sicherheit, Freiheit, Demokratie, Opferschutz, Resilienz und kommunale Funktionsfähigkeit sind tragfähige Ziele mit Rechts- und Verhältnismäßigkeitsgrenzen.",
    findings: [
      { title: "Sicherheitsbehörden, Personal und KI", text: "Digitale Beweis- und Cyberbearbeitung können besser werden. Bias, Datenschutz, Überwachung, Fachkräfte und Vendor-Lock-in verlangen Qualitäts-, Fehler- und Rechtsschutzindikatoren." },
      { title: "Organisierte Kriminalität", text: "Mehr Expertise und Vernetzung können Vollzug stärken. Datenaustausch braucht Zweckbindung; Beobachtungsstellen sind Monitoring, keine Reduktion der Kriminalität an sich." },
      { title: "Gewaltschutz", text: "Elektronische Fußfessel und Täterarbeit können Intervention und Prävention unterstützen, wenn Risikoselektion, Reaktionsketten, Personal und Opferhilfe tragen." },
      { title: "Hasskriminalität und DSA", text: "Rechtsdurchsetzung und Betroffenenschutz sind von legitimer Meinungsäußerung zu trennen. Löschung ist kein automatischer Nachweis für weniger Einschüchterung oder Polarisierung." },
      { title: "Kommunale Notmechanismen", text: "Funktionsfähigkeit kann in echten Ausnahmen gesichert werden. Eingriffe in Selbstverwaltung und Mandate brauchen hohe Verfahrens-, Reversibilitäts- und Rechtsschutzstandards." },
    ],
  },
  {
    chapter: 7,
    title: "Justiz und Migration",
    pages: "gedruckte Seiten 80–87",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Rechtsstaats- und Teilhabepotenzial mit materiellen Kompetenz- und Verfahrensgrenzen",
      impactCoreSummary: "Digitale Justiz, Kapazität gegen Finanzkriminalität, Resozialisierung und planbarere Aufenthaltstitel können Verfahren, Sicherheit und Teilhabe verbessern.",
      editorialSummary: "Vermögensabschöpfung, verdachtsunabhängige Prüfungen und Migrationsinstrumente berühren Eigentum, Verfahrensgarantien, Mandatsfreiheit, Datenschutz und Bundeskompetenzen. Ordnung oder Begrenzung ist ohne konkreten Zustand keine Wirkungskategorie.",
      keyFinding: "E-Akte, Haftplätze, Programme oder Prüfungen sind Outputs; Verfahrensqualität, Rückfall, Teilhabe, Fehlentscheidungen und Rechtsschutz sind die Wirkungsgrößen.",
      directionLabel: "Gegenläufige Wirkungsrichtungen unter strikten Rechtsgrenzen",
      directionKind: "ambivalent",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Justizkapazität, Verfahrensdauer, Cyber- und Wirtschaftskriminalität, Vollzug, Resozialisierung sowie Migration, Integration, Aufnahme und Rückkehr bleiben getrennte Problemfamilien.",
    goalReview: "Ein leistungsfähiger Rechtsstaat und geordnete rechtskonforme Migration sind tragfähig; konkrete Instrumente müssen Kompetenz, Grundrechte und Verfahrensschutz einhalten.",
    findings: [
      { title: "Digitale Justiz", text: "E-Akte und sichere IT können Durchlaufzeit und Zugang verbessern. Altaktenmigration, Personal, Interoperabilität, Cyberresilienz und digitale Zugänglichkeit sind Delivery-Bedingungen." },
      { title: "Finanz- und Wirtschaftskriminalität", text: "Mehr Expertise kann Aufklärung und Abschöpfung stärken. Eigentum, Unschulds- und Verfahrensgarantien sowie Rechtsschutz bleiben Schutzgrenzen." },
      { title: "Resozialisierung", text: "Behandlung, Übergangsmanagement und Alternativen zur Ersatzfreiheitsstrafe besitzen plausibles Potenzial für Stabilisierung und weniger Rückfall. Kapazität und Outcome-Tracking sind zentral." },
      { title: "Aufenthaltstitel und Duldungen", text: "Längere Titel bei Beschäftigung oder Studium können Verwaltungsaufwand und Unsicherheit senken. Bundesrechtsabhängigkeit und Verteilung nach Statusgruppen bleiben sichtbar." },
      { title: "Institutioneller Schutz", text: "Verdachtsunabhängige Prüfungen berühren Mandatsfreiheit, Beschäftigtenrechte und Datenschutz und müssen auf Fehlentscheidungen, Missbrauchsresilienz und gerichtliche Kontrolle getestet werden." },
    ],
  },
  {
    chapter: 8,
    title: "Soziales, Gesundheit und Integration",
    pages: "gedruckte Seiten 88–99",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Positives Versorgungs- und Teilhabepotenzial – Kapazität und Qualität bleiben entscheidend",
      impactCoreSummary: "Neue Rollen, aufsuchende Versorgung, Pflegeinfrastruktur, Anerkennung und Sprachzugang können Versorgung, Erwerbsteilhabe und Integration verbessern.",
      editorialSummary: "Neue Berufsprofile, Programme oder regulatorische Erleichterungen erzeugen keine Kapazität oder Qualität automatisch. Rollen, Haftung, Qualifikation, Finanzierung, regionale Verteilung und Schutzstandards sind die wirkungsentscheidenden Bedingungen.",
      keyFinding: "Regulatorische Entlastung in der Pflege darf Qualitäts-, Sicherheits- oder Barrierefreiheitsfunktionen nicht pauschal als Last behandeln.",
      directionLabel: "Positives Potenzial unter Kapazitäts- und Qualitätsbedingungen",
      directionKind: "conditional",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Versorgung, Pflege, Fachkräfte, Prävention, Familie, Teilhabe, Gewaltschutz, Integration und Anerkennung sind getrennte Zustände mit eigenen Baselines.",
    goalReview: "Flächendeckende Versorgung, Teilhabe, Gesundheit, Schutz und Integration sind tragfähig, wenn Zugang, Qualität und Verteilung mitgemessen werden.",
    findings: [
      { title: "Gesundheits- und Pflegeberufe", text: "Delegation und Skill Mix können Zugang und Kapazität verbessern. Rollen, Haftung, Ausbildung, Vergütung und Schnittstellen müssen tragen." },
      { title: "Pflegebestandsschutz", text: "Erleichterungen können Kapazität erhalten. Der Nutzen bestehender Qualitäts-, Sicherheits- und Barrierefreiheitsstandards muss vor Abbau fallbezogen geprüft werden." },
      { title: "Familien- und Teilhabeförderung", text: "Zielgenaue Unterstützung kann vulnerable Haushalte entlasten. Einkommens-, Haushalts- und räumliche Wirkungen sind relevanter als Förderzahlen." },
      { title: "Anerkennung und Sprachkurse", text: "Schnellere Anerkennung und flexible Sprachangebote können Arbeit und Teilhabe stärken; berufsspezifische Qualität, digitale Zugänge und Herkunftssystemeffekte bleiben zu prüfen." },
    ],
  },
  {
    chapter: 9,
    title: "Bauen, Wohnen und Planen",
    pages: "gedruckte Seiten 100–109",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Wohnraum- und Zugangspotenzial mit Schutz-, Flächen- und Marktmechanismusrisiken",
      impactCoreSummary: "Vereinfachte Anforderungen, Bestandsaktivierung, Reallabore, Housing First und soziale Förderung können Kosten, Zeit, Wohnstabilität und Zugang verbessern.",
      editorialSummary: "Baukosten haben mehrere Ursachen. Weniger Standards sind nur positiv, wenn Gesundheit, Sicherheit, Barrierefreiheit, Klima, Lärm, Nachbarschaft und Rechtsschutz erhalten bleiben und niedrigere Kosten tatsächlich in mehr oder bezahlbareren Wohnraum übersetzt werden.",
      keyFinding: "Reallabore besitzen Lern- und Reversibilitätspotenzial; ein schrittweises Erproben und Lernen ist ohne fachlich freigegebene Handlungsoption dennoch keine WÖk-Empfehlung.",
      directionLabel: "Bedingtes Wohnraumpotenzial mit materiellen Schutzrisiken",
      directionKind: "protection",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Wohnraummangel, Kosten, Genehmigungen, Flächenkonkurrenz und Wohnungslosigkeit sind getrennte Probleme; Standards sind nur ein möglicher Kostenfaktor.",
    goalReview: "Schneller und bezahlbarer Wohnraum, Bestandsaktivierung, Housing First, Ressourcenschutz und ausgewogene Raumnutzung sind tragfähig.",
    findings: [
      { title: "BW-Standard", text: "Vereinfachung kann Kosten und Zeit senken. Wirkung braucht reale Kosten-, Durchlaufzeit-, Angebots-, Qualitäts-, Mängel- und Lebenszyklusdaten." },
      { title: "Reallabor Baurecht", text: "Lernpotenzial entsteht, wenn Erfolgskriterien, Schutzgrenzen, Vergleich und Evaluation vorab definiert sind." },
      { title: "Housing First", text: "Wohnstabilität, Gesundheit und Teilhabe können steigen, wenn Wohnraum und Begleitangebote verfügbar und finanziert sind." },
      { title: "Sozialer Wohnraum und Fläche", text: "Additionalität, Bindungsdauer, Kommunen und Zielgruppenzugang sind zentral; Wohnungs-, Gewerbe-, Verkehrs- und Energiebedarf darf Natur und Fläche nicht still wegsaldieren." },
    ],
  },
  {
    chapter: 10,
    title: "Verkehr",
    pages: "gedruckte Seiten 110–120",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Mobilitäts- und Teilhabepotenzial mit Rebound-, Flächen- und Infrastruktur-Lock-in",
      impactCoreSummary: "Multimodale Infrastruktur, zuverlässiger SPNV, Elektrifizierung, Verkehrssteuerung und autonome öffentliche Mobilität können Erreichbarkeit, Sicherheit und Teilhabe verbessern.",
      editorialSummary: "Neubau, flüssiger Verkehr, elektrifizierte Kilometer oder Bußgelder sind Outputs. Reisezeit, Zuverlässigkeit, Modal Shift, Sicherheit, Emission, Bezahlbarkeit und räumlicher Zugang tragen die Wirkung.",
      keyFinding: "Induzierter Verkehr, Verlagerung vom Umweltverbund, Flächen- und Folgekosten sowie Daten-, Cyber- und Haftungsrisiken müssen je Instrument geprüft werden.",
      directionLabel: "Gegenläufige Mobilitäts-, Klima- und Teilhabepfade",
      directionKind: "ambivalent",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Erreichbarkeit, Zuverlässigkeit, Stau, Sicherheit, Luft und Lärm, Emissionen, Resilienz und Teilhabe sind getrennte Zustände.",
    goalReview: "Einfache, barrierefreie, bezahlbare, leistungsfähige und klimafreundliche Mobilität sowie Vision Zero sind tragfähig; Verkehrsträger und Technologien sind Instrumente.",
    findings: [
      { title: "Multimodale Infrastruktur", text: "Erreichbarkeit und Resilienz können steigen. Lebenszyklus, Instandhaltung, Flächen-, Natur-, Klima- und Opportunitätskosten sowie induzierter Verkehr bleiben materiell." },
      { title: "Verkehrssteuerung und KI", text: "Zuverlässigkeit kann steigen, zugleich sind Rebound, Mehrverkehr, Datenschutz, Überwachung und Vendor-Abhängigkeit möglich." },
      { title: "Vision Zero", text: "Kontrollen können Sicherheit fördern. Unfälle, Tote und Schweregrad sind Outcome; Kontroll- und Bußgeldzahlen bleiben Output." },
      { title: "SPNV und Schiene", text: "Angebot, Anschlüsse, Pünktlichkeit und Zuverlässigkeit müssen real steigen. Bund, DB, Kommunen, Fahrzeuge, Bau und Finanzierung sind externe Delivery-Abhängigkeiten." },
      { title: "Autonome öffentliche Mobilität", text: "Letzte-Meile- und ländlicher Zugang können profitieren. Rebound, Verlagerung, Barrierefreiheit, Cyber, Haftung und wirtschaftlicher Betrieb brauchen Stress-Tests." },
    ],
  },
  {
    chapter: 11,
    title: "Landwirtschaft, ländlicher Raum, Heimat, Ernährung und Verbraucherschutz",
    pages: "gedruckte Seiten 120–133",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Räumliches und wirtschaftliches Potenzial mit Natur-, Wasser- und Flächengrenzen",
      impactCoreSummary: "Ländliche Förderung, Versorgung, Digitalisierung, regionale Wertschöpfung und bestimmte Energiepfade können Teilhabe, Einkommen und Resilienz stärken.",
      editorialSummary: "Produktions- oder Entlastungsziele dürfen Biodiversität, Tierwohl, Boden, Wasser, Klima und Verbraucherschutz nicht kompensieren. AgriPV, Biogas, Biomasse und Bürokratieabbau brauchen standort- und funktionsbezogene Prüfung.",
      keyFinding: "Fördersummen oder Energieerzeugung belegen keine räumliche Teilhabe oder positive Netto-Wirkung; regionale Delivery und Naturgrenzen bleiben entscheidend.",
      directionLabel: "Gegenläufige Wirtschafts-, Raum- und Naturwirkungen",
      directionKind: "ambivalent",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Betriebs- und Nachfolgedruck, Bürokratie, Biodiversität, Tierwohl, Ernährung, ländliche Versorgung, Klima-, Wasser- und Waldresilienz sowie Flächennutzung sind getrennte Zustände.",
    goalReview: "Tragfähige Landwirtschaft, lebendige Räume, Biodiversität, Tierwohl, Versorgung und regionale Wertschöpfung sind tragfähige Ziele mit Natur- und Gesundheitsgrenzen.",
    findings: [
      { title: "ELR, Leader und ländliche Versorgung", text: "Räumliche Teilhabe kann steigen, wenn kleine Kommunen Projekt- und Kofinanzierungskapazität besitzen und reale Erreichbarkeit besser wird." },
      { title: "AgriPV, Biogas und Biomasse", text: "Einkommen und Energie können profitieren; Boden, Biodiversität, Nahrung, Luft, Klima, Flächenanreize und Lock-in müssen je Standort und Technologie geprüft werden." },
      { title: "Bürokratieabbau", text: "Entlastung ist nur positiv, soweit Umwelt-, Tierwohl-, Verbraucher- und Förderkontrollfunktionen der entfallenden Information nicht materiell verloren gehen." },
    ],
  },
  {
    chapter: 12,
    title: "Digitalisierung",
    pages: "gedruckte Seiten 134–143",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Positives Zugangs- und Handlungsfähigkeitspotenzial mit Cyber- und Lock-in-Risiken",
      impactCoreSummary: "Einheitliche Architektur, Shared Services, Once Only, Register und bessere Netzzugänge können Doppelarbeit, Medienbrüche und räumliche Zugangslücken reduzieren.",
      editorialSummary: "Zentralisierung kann Interoperabilität und Skalierung verbessern, aber Fehler, Cyberrisiken und Anbieterabhängigkeit systemweit vergrößern. Offene Standards, Portabilität, Auditierbarkeit, Fallback und kommunale Anschlussfähigkeit sind Schutzbedingungen.",
      keyFinding: "Anschlüsse, zentrale Freigaben oder Plattformnutzung sind Outputs; Servicequalität, Bezahlbarkeit, Durchlaufzeit, Resilienz und tatsächlicher Zugang sind Wirkungsgrößen.",
      directionLabel: "Positives Digitalisierungspotenzial unter Resilienz- und Zugangsbedingungen",
      directionKind: "conditional",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Fragmentierung, langsame Verwaltungsdigitalisierung, Breitbandlücken, Cyberrisiken und fehlende digitale Handlungsfähigkeit sind Capabilities mit prozessbezogenen Baselines.",
    goalReview: "Bürgernahe digitale Verwaltung, Souveränität, Resilienz, Grundrechtsschutz und Zugang sind tragfähige Ziele.",
    findings: [
      { title: "Zentrale Steuerung und Standards", text: "Wiederverwendung und Interoperabilität können steigen. Fachdomänenbedarf, Ressortverantwortung und Single Points of Failure müssen erhalten beziehungsweise abgesichert werden." },
      { title: "BW-Stack und Register-as-a-Service", text: "Once Only kann Kommunen und Nutzende entlasten. Datenschutz, Datenqualität, Rollen, offene Standards, Portabilität und Incident-Fallback sind hochmaterial." },
      { title: "Breitband, Mobilfunk und Satellit", text: "Besonders ländlicher Zugang kann steigen. Servicequalität und Bezahlbarkeit sind maßgeblich; National Roaming bleibt ein späterer Fallbackpfad." },
    ],
  },
  {
    chapter: 13,
    title: "Finanzen",
    pages: "gedruckte Seiten 144–153",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Fiskalische Handlungsfähigkeit nur mehrdimensional belastbar bewertbar",
      impactCoreSummary: "Zielgenauer Mitteleinsatz und tragfähige Kommunalfinanzen können staatliche und lokale Delivery stärken. Schulden- oder Kürzungsregeln sind Instrumente, keine Wirkungsziele.",
      editorialSummary: "Pauschale Ausgabenkürzung kann Instandhaltung, Prävention und Kapazität schwächen und spätere Kosten erhöhen. Generationengerechtigkeit umfasst Infrastruktur, Klima, Natur, Bildung, Gesundheit, Verpflichtungen und Resilienz und darf nicht auf den Schuldenstand reduziert werden.",
      keyFinding: "Die Wirkung der Schuldenbremse und einer nicht genutzten Strukturkomponente ist szenarioabhängig; Vermögens- und Infrastrukturzustand müssen neben Defizit und Schulden beobachtet werden.",
      directionLabel: "Keine robuste Einheitsrichtung für das Finanzportfolio",
      directionKind: "portfolio",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Finanzlücken sind ein realer Planungszustand, aber Ursachen und Prognoseannahmen bleiben offenzulegen. Staatsverschuldung ist weder allein Problem noch Wirkung.",
    goalReview: "Finanzielle Handlungsfähigkeit und Nachhaltigkeit sind tragfähig; konkrete Fiskalregeln bleiben Instrumente und Generationengerechtigkeit mehrdimensional.",
    findings: [
      { title: "Ausgabendisziplin", text: "Fehlallokation kann sinken. Lebenszyklus-, Folge-, Opportunitätskosten und vermiedene Schäden müssen verhindern, dass Kürzung als Wirkungserfolg erscheint." },
      { title: "Schuldenbremse", text: "Fiskalische Risiken können sinken, zugleich können zusätzliche Investitionen in Engpass- und Resilienzbereiche blockiert werden. Rezession, Zins, Investitionsstau, Extremereignis und Demografie sind Stress-Szenarien." },
      { title: "Kommunalfinanzen und Konnexität", text: "Bessere Aufgabenausstattung kann kommunale Delivery stärken. Vollständige Aufgaben- und Folgekosten sowie kommunale Heterogenität sind zentral." },
    ],
    relatedImpactCase: "BW-IMPACT-2026-04",
  },
  {
    chapter: 14,
    title: "Europa und Internationales",
    pages: "gedruckte Seiten 154–161",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Kooperations- und Resilienzpotenzial mit internationalen Verlagerungs- und Unabhängigkeitsfragen",
      impactCoreSummary: "Europäische Kooperation, grenzüberschreitende Versorgung, Katastrophenschutz, Partnerschaften und Informationsarbeit können Resilienz und Handlungsfähigkeit stärken.",
      editorialSummary: "Deregulierungspositionen brauchen die Funktionsprüfung konkreter Standards. Fachkräfte-, Handels-, Rohstoff- und Entwicklungspfade müssen Umwelt-, Sozial- und Kapazitätswirkungen in Herkunfts- und Partnerregionen mitführen.",
      keyFinding: "Europa-Öffentlichkeitsarbeit ist eine eigene Kommunikationswirkungsachse: Reichweite und Aktivität sind nicht mit Vertrauen, Bürgernähe oder Desinformationsresilienz gleichzusetzen.",
      directionLabel: "Positives Kooperationspotenzial mit materiellen Leakage-Risiken",
      directionKind: "conditional",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Abhängigkeiten, Grenzhemmnisse, Sicherheit, Klima, Entwicklung, Wettbewerbs- und Fachkräftepfade sind verschiedene grenzüberschreitende Probleme.",
    goalReview: "Europäische Kooperation, Rechtsstaat, grenzüberschreitende Versorgung, Resilienz und Partnerschaften sind tragfähig unter Leakage- und Rechtsgrenzen.",
    findings: [
      { title: "EU-Interessenvertretung", text: "Landesspezifische Expertise kann früher einfließen. Weniger Bürokratie erhält keine automatische Wirkungsrichtung; die Schutzfunktion des Standards bleibt maßgeblich." },
      { title: "Europa-Kommunikation", text: "Botschaft, Frame, Empfänger, Reichweite, Resonanz und Outcome müssen getrennt werden. Öffentlichkeitsaktivität ist Output, Vertrauen und Resilienz sind Outcome." },
      { title: "Grenzüberschreitende Versorgung", text: "Gesundheit, Katastrophenschutz und Ausbildung können resilienter werden, wenn Recht, Daten, Leitstellen, Standards, Finanzierung, Sprache und Zuständigkeiten interoperabel sind." },
      { title: "Globale Partnerschaften", text: "Heimischer Fachkräfte- oder Wirtschaftsnutzen darf Herkunftsland-, Umwelt- und Sozialwirkungen nicht ausblenden; Additionalität und lokale Ownership bleiben relevant." },
    ],
  },
  {
    chapter: 15,
    title: "Zusammenarbeit",
    pages: "gedruckte Seiten 162 ff.",
    maturity: "HIGH_MATERIALITY_REVIEW",
    maturityLabel: "Hochmateriale Kapitelprüfung; Vertiefung offen",
    assessment: {
      assessmentLabel: "Dokumentweite Delivery-Bedingung: zusätzliche Ausgaben stehen unter Haushaltsvorbehalt",
      impactCoreSummary: "Koalitions- und Bundesratskoordination kann Positionierungs- und Handlungsfähigkeit erhöhen. Der Haushaltsvorbehalt macht Finanzierung und Sequenz für jede zusätzliche finanzwirksame Zusage zu einer vorgelagerten Wirkbedingung.",
      editorialSummary: "Eine Sachzusage ist weder finanziert noch umgesetzt, solange Haushaltstitel, Programm oder Rechtsakt und reale Mittelbindung fehlen. Koalitionsstabilität und parlamentarische Eigenständigkeit bleiben getrennte Demokratiewirkungen.",
      keyFinding: "Der Finanzierungsstatus bleibt bedingt, bis eine spätere Haushalts- oder Rechtsaktquelle die Finanzierung belegt.",
      directionLabel: "Delivery und Wirkung bleiben bis zur Finanzierung offen",
      directionKind: "open",
      evidenceSummary: initialEvidence,
      realityCheckSummary: exAnteReality,
    },
    problemReview: "Kapitel 15 regelt politische Zusammenarbeit und eine dokumentweite finanzielle Umsetzungsbedingung; es ist kein eigenständiger Wirkungsfall mit einheitlicher Richtung.",
    goalReview: "Koordinationsfähigkeit und haushaltspolitische Tragfähigkeit sind legitime Bedingungen. Sie ersetzen keine maßnahmenbezogene Wirkungs- und Parlamentsprüfung.",
    findings: [
      { title: "Bundesrat und Fraktionskoordination", text: "Koordination kann Stabilität und Positionierungsfähigkeit erhöhen. Parlamentarische Eigenständigkeit, Transparenz und demokratische Kontrolle bleiben eigenständige Wirkungsräume." },
      { title: "Haushaltsvorbehalt", text: "Jede finanzwirksame Zusage folgt dem Lifecycle Koalitionszusage, Haushaltstitel oder Programm beziehungsweise Rechtsakt, Mittelbindung, Vollzug, Outcome. Budgetstatus und Erfüllung sind keine Wirkung." },
    ],
  },
];

export const badenWuerttembergCoalitionQualityLayers: CoalitionFinding[] = [
  { title: "Materielle Auslassungen", text: "Für jedes atomare Commitment sind Problem und Baseline, Zielzustand, Mechanismus, Outcome- und Datenfunktion, Betroffene und Verteilung, Ressourcen und Delivery, Gegenfaktum und Alternative, Schutzgrenzen sowie Recheck und Falsifikation zu prüfen. Eine Auslassung ist fehlende entscheidungsrelevante Information, nicht automatisch negative Wirkung." },
  { title: "Policy-Kohärenz", text: "Release-relevant sind insbesondere Wirtschaft und Industrie gegenüber Klima, Natur, Ressourcen und Fläche; Deregulierung gegenüber Schutz- und Kontrollfunktionen; Forschung und Daten gegenüber Freiheit, Datenschutz und Cyber; Sicherheit gegenüber Grundrechten; Migration gegenüber Teilhabe; Bauen, Verkehr und Energie gegenüber Natur und Klima; Fiskalregeln gegenüber Investitions- und Deliverybedarf; Zentralisierung gegenüber Fachautonomie und kommunaler Selbstverwaltung." },
  { title: "Umsetzungs- und Delivery-Realismus", text: "Wiederkehrende Engpässe sind Personal und Fachkräfte, kommunale Verwaltung, IT und Daten, Beschaffung und Vergabe, Genehmigung und Bau, Infrastrukturbetreiber, Bundes- und EU-Recht sowie der Haushaltsvorbehalt. Diese Faktoren sind kausale Wirkbedingungen, keine bloßen Prozessmetadaten." },
  { title: "Ressourcen und Finanzierung", text: "Geld-, Personal- und Infrastrukturzusagen müssen auf Additionalität, reale Kapazität, Lebenszyklus, Betrieb, Folge- und Opportunitätskosten sowie vermiedene Schäden geprüft werden. Der Haushaltsvorbehalt aus Kapitel 15 ist eine vorgelagerte Bedingung." },
  { title: "Räumliche und betroffenenbezogene Verteilung", text: "Stadt und Land, industrielle Transformationsräume, Grenzräume, Kommunen unterschiedlicher Finanz- und Verwaltungskraft, Verkehrs- und Versorgungsräume sowie vulnerable Gruppen bleiben getrennt sichtbar. Aggregierte Landeswirkung darf divergierende regionale Wirkung nicht verdecken." },
  { title: "Internationale Spillover und Leakage", text: "Material sind insbesondere Rohstoffe, Handel, Lieferketten, Wasserstoff und Energie, Fachkräfte, Industrie- und Emissionsverlagerung, Beschaffung sowie internationale Partnerschaften. Inländischer Nutzen ist nicht automatisch globale Nettowirkung." },
  { title: "Robustheit und Stress-Test", text: "Zu prüfen sind schwaches Wachstum oder Rezession, Zinsen, Energie- und Rohstoffpreise, Fachkräftemangel, Cyber- und Infrastrukturausfall, Extremwetter, geopolitische Handels- und Sicherheitsänderungen sowie verzögerte Bundes- oder EU-Finanzierung und Gesetzgebung." },
  { title: "Reversibilität und Lock-in", text: "Besonders relevant sind IT- und Datenplattformen, Infrastruktur und Fläche, CCS-, Wasserstoff- und Energiepfade, Verkehr und Bau, langfristige Förder- und Finanzierungsstrukturen sowie Überwachungsinstrumente. Bei hoher Unsicherheit müssen Exit, Fallback und Korrekturmöglichkeiten sichtbar bleiben." },
  { title: "Falsifikation und Recheck", text: "Jeder später konkretisierte Wirkungsfall braucht mindestens eine zentrale Zustandsgröße, einen Gegen- oder Schadensindikator, einen Umsetzungs- beziehungsweise Engpassindikator, eine relevante Schutzgrenze, einen Zeitpunkt oder ein Ereignis für die erneute Prüfung sowie eine getrennte Zurechnungsprüfung." },
  { title: "Politischer Lebenslauf", text: "Wahlzusage, Koalitionszusage, Regierungshandlung, Rechtsakt, Programm oder Haushalt, Umsetzung, Zustandsbeobachtung, öffentliches Evidenzereignis, Reality Check und neue Analyseversion bleiben getrennte Stationen. Kein Koalitionssatz wird automatisch zur umgesetzten Maßnahme oder Wirkung." },
  { title: "Versionsvergleich", text: "Die aktuell amtlich verlinkte Fassung mit internem Entwurfsvermerk bleibt eine eigene Dokumentversion. Eine später nachgewiesene signierte oder abweichende Fassung wird additiv mit Datei- und Inhaltsvergleich geführt; Zusagen werden nicht still ersetzt." },
  { title: "Abdeckung und Reife", text: "Alle 15 Kapitel sind auf Dokument-, Kapitel- und hochmaterialer Cluster-Ebene geprüft. Kapitel 1 bis 3 liegen vertieft vor. Die vollständige atomare Quellenzerlegung umfasst 1.577 Zusagen; sechs Parent-Container bleiben für Provenienz und Navigation erhalten, zählen aber nicht atomar. Reale Wirkung und Reality Check sind noch nicht reif." },
];

export const badenWuerttembergCoalitionRelationshipModel = {
  sourceDeduplication: "Alle Fundstellen bleiben erhalten; identische spätere Policy-, Regierungs- oder Wirkungsobjekte werden über explizite Beziehungen statt Themenähnlichkeit zusammengeführt.",
  parentChild: "Dokumentversion → fundstellengebundene Koalitionszusage → kanonischer Politikgegenstand → Regierungshandlung oder Initiative → Rechtsakt, Förderprogramm oder Umsetzung → WÖk-Wirkungsfall → Beobachtung oder Evidenzereignis → Reality Check → Revision.",
  competence: "Zuständigkeit und notwendige externe Akteure werden nur aus dem Fach-Crosswalk übernommen. Wo die konkrete Umsetzungsroute fehlt, bleibt sie bis zur Ausgestaltung ausdrücklich offen.",
  budgetReservation: "Für zusätzliche finanzwirksame Zusagen gilt der dokumentweite Haushaltsvorbehalt. Das bedeutet weder finanziert noch blockiert; Finanzierung, Additionalität, Personal, IT, Beschaffung, Lebenszyklus- und Opportunitätskosten werden erst am konkreten Umsetzungsobjekt geprüft.",
  maturity: "Die 1.577 Zusagen sind Source- und Lifecycle-Objekte. Sie erhalten nur dort ein eigenes Wirkungsurteil, wo ein ausdrücklicher Fachreview oder ein freigegebener bestehender Wirkungsfall vorliegt.",
};

export const badenWuerttembergCoalitionLifecycle = [
  "6. Mai 2026: Vertrag vorgestellt und amtlich verlinkter Text veröffentlicht",
  "9. Mai 2026: Zustimmung der Koalitionsparteien",
  "11. Mai 2026: Unterzeichnung amtlich bestätigt",
  "13. Mai 2026: Beginn des neuen GovernmentTerm",
  "Danach je Zusage: Regierungshandlung, Rechtsakt, Programm oder Haushalt, Umsetzung, Zustandsbeobachtung und fachlich freigegebener Reality Check",
];

export const badenWuerttembergCoalitionExistingImpactCases = [
  { id: "BW-IMPACT-2026-01", title: "Social-Media-Verbot unter 16 / digitaler Jugendschutz" },
  { id: "BW-IMPACT-2026-02", title: "Private Smartphone-Nutzung an Schulen" },
  { id: "BW-IMPACT-2026-03", title: "Effizienzgesetz / Bürokratieabbau / Staatsmodernisierung" },
  { id: "BW-IMPACT-2026-04", title: "Landeshaushalt 2027 / kommunale Konjunkturkomponente" },
  { id: "BW-IMPACT-2026-05", title: "Hochwasser- / Extremwasserresilienz" },
];

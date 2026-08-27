import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { saxonyAnhaltElectionProgrammes } from "../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorial } from "../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltTerminalPartyBySourceKey, saxonyAnhaltTerminalRelease } from "../data/presentation/sachsen-anhalt-terminal-release";
import { impactVisualDescriptorSchema, type ImpactVisualScenarioRecord } from "../lib/impact-visuals/contracts";

const OUTPUT_PATH = fileURLToPath(new URL("../data/impact-visuals/sachsen-anhalt-2026-v1.json", import.meta.url));
const KNOWLEDGE_CUTOFF = "2026-08-23";
const CREATED_DATE = "2026-08-25";
const SOURCE_RELEASE_COMMIT = "fefec75f09dc70db8de7880f93b4e8c6788e4461";
const BASE_MAIN_COMMIT = "7e53b3a2d9f9a9e340e824b24b1e861439144959";
const DISCLAIMER = "Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose.";
const PROGRAMME_PUBLIC_LABEL = "Wirkungsbild · Programm" as const;
const PROGRAMME_PUBLIC_SUBTITLE = "Visualisierte Zusammenfassung zentraler freigegebener Wirkungspfade · Ex ante · keine Prognose." as const;
const CASE_PUBLIC_LABEL = "Wirkungsbild · Fallvertiefung" as const;
const CASE_PUBLIC_SUBTITLE = "Visualisiertes Wirkungsszenario eines freigegebenen Einzelpfads · Ex ante · keine Prognose." as const;
const FINAL_IMAGE_HANDOFF = {
  id: "SA-2026-WIRKUNGSBILDER-FINAL-12-OF-12",
  manifest_sha256: "ff4d217bef7dc2971a304d9eb69b0931f3aead728a40fbddbfc5effce3f8c9c3",
  archive_sha256: "c3364d149b465e1ce6b4951a005d5b6ec12c3a1d90595f76186ddbad7fafce85",
  review_date: "2026-08-27",
  final_image_signoff: "APPROVED" as const,
};
const VISUAL_HANDOFF = {
  id: FINAL_IMAGE_HANDOFF.id,
  version: "2.0",
  content_sha256: FINAL_IMAGE_HANDOFF.manifest_sha256,
  review_status: "APPROVED" as const,
};

const CASE_CANONICAL_RECORD_PATH = "data/generated/release-1/sachsen-anhalt-programme-reviews.json";
const CASE_CANONICAL_EDITORIAL_PATH = "data/presentation/sachsen-anhalt-programme-editorial-v2.ts";
const CASE_BRIEF_HANDOFF_PATH = "/WOEK/WOEK-PARLAMENT-FACHREVIEW-2026-08-26/04-sachsen-anhalt-case-visuals/CASE-VISUALS-6X-EDITORIAL-BRIEF.md";
const CASE_APPROVAL_PROVENANCE = {
  approval_basis: "DELEGATED_WOEK_EDITORIAL_REVIEW_PROTOCOL_2026-08-26" as const,
  approval_authority: "PROJECT_OWNER_DELEGATED_PROTOCOL" as const,
  review_mode: "SOURCE_BOUND_OBJECT_LEVEL" as const,
  human_individual_record_review_claimed: false as const,
};

type CanonicalSourceRef = {
  source_key: string;
  location: { page: number | string; section: string | null };
  source_text: string;
};

type CanonicalImpactPotential = {
  expected_state_change: string;
  mechanism: string;
  implementation_conditions: string[];
  evidence_status: string;
};

type CanonicalRisk = {
  risk: string;
  trigger_or_condition: string;
  affected_groups_or_goods: string[];
  evidence_status: string;
};

type CanonicalBoundary = { concern: string; rationale: string; status: string };

type CanonicalCommitment = {
  commitment_key: string;
  source_refs: CanonicalSourceRef[];
  decision_or_measure: string;
  intended_change: string;
  responsible_actors: string[];
  affected_groups: string[];
  impact_potential: CanonicalImpactPotential[];
  impact_risks: CanonicalRisk[];
  non_compensable_boundaries: CanonicalBoundary[];
  data_gaps: string[];
  impact_orders: { first_order: string; second_order: string[]; third_order: string; status: string };
  distribution_and_time: {
    short_term: string;
    medium_term: string;
    long_term: string;
    intergenerational_relevance: string;
  };
  monitoring_and_feedback: {
    baseline_required: string;
    primary_indicator: string;
    unit: string;
    counterfactual_required: string | null;
    earliest_review: string;
    correction_trigger: string;
  };
};

type CanonicalReviewFile = {
  programmes: Array<{
    source_key: string;
    review: { material_commitments: CanonicalCommitment[] };
  }>;
};

type ApprovedCaseBrief = {
  caseId: string;
  selectionRationale: string;
  visualBrief: string;
  visualAnchor: string;
  notImageFact: string;
  markerDecision: "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES" | "NULL_MARKER_APPROVED";
  markerInstruction: string;
  altText: string;
};

const approvedCaseBriefs: Record<string, ApprovedCaseBrief> = {
  "ltw-2026-st-cdu": {
    caseId: "ltw-2026-st-cdu-0018-das-institut-fuer-brand-und-katastrophenschutz-in-heyroths",
    selectionRationale: "Der Pfad ist bereits Teil der endlichen freigegebenen Editorial-v2-Kandidatenmenge und bildet einen konkreten, landesnahen Resilienzhebel ab. Der Fall eignet sich als Deep Dive, weil Instrument, institutioneller Ort und potenzielle Zustandsänderung klarer visualisierbar sind als abstrakte Sicherheits- oder bundesrechtliche Forderungen.",
    visualBrief: "Fotorealistisches, dokumentarisch-neutrales Ex-ante-Szenario einer Übungs-/Ausbildungssituation des Brand- und Katastrophenschutzes in Sachsen-Anhalt. Sichtbar sein dürfen: Übungsgelände, Einsatz-/Ausbildungsfahrzeug, Schutzkleidung, sachliche Trainingssituation, technische Übungsinfrastruktur. Keine Katastrophendramatik, keine Heldensymbolik, keine Parteifarben, keine Logos, kein Wahlkampftext.",
    visualAnchor: "institutionelle Ausbildungs-/Übungskapazität.",
    notImageFact: "tatsächliche spätere Einsatzleistung, vermiedene Todesfälle, konkrete Schadensreduktion oder einen quantifizierten Resilienzgewinn.",
    markerDecision: "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES",
    markerInstruction: "Ein Marker darf ausschließlich die sichtbare Trainings-/Übungsinfrastruktur an den ausgewählten Pfad binden. Text des Markers aus dem kanonischen Wirkpfad ableiten, nicht aus dem Bild.",
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario einer sachlichen Ausbildungs- und Übungssituation im Brand- und Katastrophenschutz in Sachsen-Anhalt mit Einsatzfahrzeug, Schutzkleidung und technischer Übungsinfrastruktur. Das Bild visualisiert den institutionellen Kapazitätshebel des freigegebenen WÖk-Wirkungsfalls und ist keine Prognose tatsächlicher Einsatz- oder Schadenswirkungen.",
  },
  "ltw-2026-st-spd": {
    caseId: "ltw-2026-st-spd-0005-repair-caf-s-werden-wir-weiterhin-finanziell-unterstuetzen",
    selectionRationale: "Der freigegebene Pfad ist alltagsnah, visuell eindeutig und ermöglicht eine leicht nachvollziehbare Wirkungskaskade von Förderinstrument → Reparaturmöglichkeit → mögliche längere Produktnutzung / Ressourceneffekt, ohne Outcome automatisch zu behaupten.",
    visualBrief: "Fotorealistisches, neutrales Repair-Café in Sachsen-Anhalt. Sichtbar sein dürfen: Reparaturtisch, defektes Haushaltsgerät oder Fahrradteil, Werkzeug, freiwillig/ehrenamtlich wirkende Personen in normaler Alltagssituation, wiederverwendbare Bauteile. Keine Werbeästhetik, keine Logos, keine Partei-/Kampagnenfarben.",
    visualAnchor: "niedrigschwellige Reparaturinfrastruktur / Reparaturhandlung.",
    notImageFact: "automatisch vermiedenen Neukauf, exakt vermiedene Abfall-/CO2-Menge, dauerhafte Verhaltensänderung oder soziale Teilhabe als gesicherten Outcome.",
    markerDecision: "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES",
    markerInstruction: "Marker nur an Reparaturhandlung/-infrastruktur. Keine quantitative Umweltbehauptung im Marker.",
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines Repair-Cafés in Sachsen-Anhalt mit Reparaturtisch, Werkzeug und der Instandsetzung eines Alltagsgegenstands. Das Bild visualisiert den freigegebenen Wirkungsfall zur Förderung niedrigschwelliger Reparaturmöglichkeiten; tatsächliche Lebensdauer-, Abfall- oder Ressourceneffekte werden damit nicht belegt.",
  },
  "ltw-2026-st-gruene": {
    caseId: "ltw-2026-st-gruene-0042-solche-strukturen-sollen-die-ausbreitung-von-feuer-kontrol",
    selectionRationale: "Der freigegebene Pfad macht präventive Resilienz anschaulich: Strukturen zur Begrenzung von Feuerausbreitung setzen vor dem Schaden an. Der Fall eignet sich für die WÖk-Logik ‚früher Schutz statt spätere Reparaturkosten‘, ohne behauptete Schadensvermeidung als bereits eingetreten darzustellen.",
    visualBrief: "Fotorealistisches, neutrales Wald-/Landschaftsszenario in Sachsen-Anhalt mit sachlich erkennbaren präventiven Brandschutzstrukturen, z. B. gepflegter Schutz-/Trennstruktur, Forstweg oder brandschutzgerechter Vegetationspflege. Kein aktiver Großbrand, keine apokalyptische Stimmung, keine politische Symbolik.",
    visualAnchor: "präventive Landschafts-/Brandschutzstruktur.",
    notImageFact: "sicher verhinderte Waldbrände, konkrete Schadenssummen, CO2-Einsparungen oder garantierte Resilienzwirkung.",
    markerDecision: "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES",
    markerInstruction: "Marker nur an die präventive Struktur. Outcome-Wörter wie ‚verhindert‘ nur verwenden, wenn der kanonische Record exakt diese Aussage mit entsprechender Unsicherheit trägt; bevorzugt ‚kann Ausbreitung begrenzen‘.",
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario einer Wald- oder Landschaftsfläche in Sachsen-Anhalt mit sachlich erkennbaren präventiven Brandschutzstrukturen. Das Bild visualisiert einen freigegebenen WÖk-Wirkungsfall zur möglichen Begrenzung von Feuerausbreitung und ist keine Prognose verhinderter Brände oder Schäden.",
  },
  "ltw-2026-st-linke": {
    caseId: "ltw-2026-st-linke-0005-dass-bei-volksinitiativen-volksbegehren-und-volksentscheid",
    selectionRationale: "Der freigegebene Pfad bildet einen klar abgrenzbaren institutionellen Hebel demokratischer Beteiligung ab. Er ist als Case geeignet, weil die unmittelbare Zustandsänderung in Zugangs-/Verfahrenshürden liegt; weitergehende Effekte auf Beteiligung, Legitimität oder Entscheidungsergebnisse müssen als Wirkungspotenzial und nicht als Bildfakt behandelt werden.",
    visualBrief: "Fotorealistisches, neutrales Szenario eines kommunalen oder landesbezogenen Beteiligungsverfahrens in Sachsen-Anhalt. Sichtbar sein dürfen: Bürgerinnen und Bürger an einem sachlichen Informations-/Eintragungsstand, neutrale Formulare/Unterlagen, öffentlich zugänglicher Verwaltungsraum. Keine Wahlkampfschilder, keine Parteisymbole, keine suggerierten Abstimmungsergebnisse.",
    visualAnchor: "Zugang zu direkter demokratischer Beteiligung / Verfahrensinfrastruktur.",
    notImageFact: "automatisch höhere Beteiligung, bessere Entscheidungen, stärkere Demokratie oder bestimmte politische Ergebnisse.",
    markerDecision: "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES",
    markerInstruction: "Marker darf nur den Verfahrens-/Zugangshebel beschreiben. Keine Outcome-Behauptung.",
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines öffentlich zugänglichen Beteiligungsverfahrens in Sachsen-Anhalt mit neutralem Informations- und Eintragungsbereich. Das Bild visualisiert den freigegebenen institutionellen Wirkungsfall zu Volksinitiative, Volksbegehren oder Volksentscheid; tatsächliche Beteiligung oder politische Ergebnisse werden damit nicht vorausgesagt.",
  },
  "ltw-2026-st-bsw": {
    caseId: "ltw-2026-st-bsw-0011-auch-auf-kommunaler-ebene-sollen-buergerbudgets-und-buerge",
    selectionRationale: "Bürgerbudgets/-beteiligung bilden einen konkreten kommunalen Entscheidungshebel ab und sind visuell verständlich, ohne den Nutzen automatisch vorwegzunehmen. Der Case erlaubt eine klare Trennung zwischen Zugang/Verfahren und späterer tatsächlicher Mittelverteilung bzw. Outcome.",
    visualBrief: "Fotorealistisches, neutrales kommunales Beteiligungsszenario in Sachsen-Anhalt: öffentlicher Saal oder Rathausbereich, Bürgerinnen und Bürger betrachten mehrere sachliche Projektvorschläge bzw. Budgettafeln; ggf. neutrale Abstimmungs-/Priorisierungsmöglichkeit. Keine Parteiästhetik, keine Logos, keine Siegerprojekte, kein suggerierter Wohlstandsgewinn.",
    visualAnchor: "kommunale Beteiligungs-/Budgetierungsstruktur.",
    notImageFact: "automatisch bessere Ausgaben, mehr Vertrauen, höhere kommunale Leistungsfähigkeit oder wirtschaftlichen Gewinn.",
    markerDecision: "ALLOWED_IF_CANONICAL_PATH_BINDING_PASSES",
    markerInstruction: "Marker nur auf Beteiligungs-/Budgetprozess; keine Outcome-Synthese.",
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines kommunalen Bürgerbudget- oder Beteiligungsprozesses in Sachsen-Anhalt mit sachlich dargestellten Projektvorschlägen und öffentlicher Priorisierung. Das Bild visualisiert den freigegebenen Verfahrenshebel; Qualität der Mittelverwendung, Vertrauen oder gesellschaftliche Wirkungen werden nicht als eingetretener Outcome dargestellt.",
  },
  "ltw-2026-st-afd": {
    caseId: "ltw-2026-st-afd-0001-gesellschaftspolitische-steuerungsinstrumente-die-nicht-nu",
    selectionRationale: "Dieser freigegebene Pfad ist materieller als die kleineren positiven Einzelbeispiele und eignet sich deshalb als Deep Dive für die Frage, was die Abschaffung/Ersetzung institutioneller Gleichstellungsfunktionen als unmittelbare Strukturänderung bedeutet. Der Case darf weder Absicht noch tatsächliche spätere Diskriminierungsoutcomes bebildern. Er zeigt nur die institutionelle Veränderungsebene; Schutzgutfolgen bleiben textlich und evidenzgebunden.",
    visualBrief: "Fotorealistisches, bewusst nüchternes Szenario in einem öffentlichen Verwaltungsgebäude in Sachsen-Anhalt. Sichtbar sein dürfen: allgemeiner Beratungs-/Servicebereich, ein Familien-/Sozialberatungssetting ohne eingebettete Textlabels, Bürgerinnen/Bürger in neutraler Beratungssituation. Keine Protestszene, keine bedrohten Personen, keine dramatischen Farben, keine Partei-/Kampagnensymbole. Der zentrale Wirkungsfall betrifft die institutionelle Funktion/Ersetzung, die sich bildlich nicht zuverlässig ohne Zusatzbehauptung darstellen lässt.",
    visualAnchor: "institutionelle Funktion/Ersetzung; bildlich nicht zuverlässig ohne Zusatzbehauptung darstellbar.",
    notImageFact: "welche Gleichstellungsfunktion organisatorisch entfällt oder welche Schutz- oder Teilhabewirkung daraus folgt.",
    markerDecision: "NULL_MARKER_APPROVED",
    markerInstruction: "Ein Verwaltungsraum kann weder die organisatorisch entfallende Funktion noch Schutz- oder Teilhabefolgen beweisen. Der freigegebene Wirkpfad wird deshalb ohne inhaltlichen Marker direkt unter dem späteren Bild textlich erklärt.",
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines nüchternen öffentlichen Beratungs- und Verwaltungsraums in Sachsen-Anhalt. Das Bild dient als visueller Anker für den freigegebenen WÖk-Fall zur Veränderung gesellschaftspolitischer Verwaltungsfunktionen; welche Aufgaben tatsächlich entfallen oder welche Gleichbehandlungs- und Teilhabewirkungen folgen, wird ausschließlich in der textlichen Wirkungsanalyse bewertet und nicht durch das Bild behauptet.",
  },
};

const canonicalReviewFile = JSON.parse(readFileSync(fileURLToPath(new URL(`../${CASE_CANONICAL_RECORD_PATH}`, import.meta.url)), "utf8")) as CanonicalReviewFile;

function canonicalCase(sourceKey: string, caseId: string) {
  const programme = canonicalReviewFile.programmes.find((candidate) => candidate.source_key === sourceKey);
  const record = programme?.review.material_commitments.find((candidate) => candidate.commitment_key === caseId);
  if (!record) throw new Error(`CASE_SELECTION_SOURCE_CONFLICT missing canonical record ${caseId}`);
  return record;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

type ApprovedVisualAsset = {
  filename: string;
  originalFilename: string;
  originalSha256: string;
  assetSha256: string;
  width: number;
  height: number;
  altText: string;
  creationProvenance: string;
  omittedMarkerCandidates: string[];
};

const PROGRAMME_CREATION_PROVENANCE = "WÖk editorial composite from reviewed generated photo anchor + canonical Editorial-v2 path text; 2026-08-27";
const CASE_CREATION_PROVENANCE = "Text-to-image generation; WÖk editorial review 2026-08-27";
const PROGRAMME_NO_MARKER = ["Die vier analytischen Pfadkarten sind im freigegebenen Composite an die kanonischen selected_impact_path_ids gebunden; aus dem Fotoanker werden keine räumlichen UI-Marker abgeleitet."];

const approvedProgrammeAssets: Record<string, ApprovedVisualAsset> = {
  "ltw-2026-st-afd": {
    filename: "afd-program-scenario-v2.webp",
    originalFilename: "sa-2026-program-afd-wirkungsbild-v2.png",
    originalSha256: "67339ed576cf74b895125d518ba3fb5aabbb8897829481b4ae782685cb216299",
    assetSha256: "eaaf7725d624a9c9357c0c9517c8f7327b2a1d610439d2638f0eb3f6dbdbc101",
    width: 1600,
    height: 1000,
    altText: "Analytisches Wirkungsbild zum AfD-Wahlprogramm Sachsen-Anhalt 2026: links ein neutraler öffentlicher Beratungsraum als visueller Anker; rechts vier freigegebene Schlüsselpfade zu reproduktiven Schutzgütern und Selbstbestimmung, unbestimmten Abschaffungsforderungen, freiwilliger Unterstützung für Schwangere und vorschulischem Vorlesen mit Richtung, Evidenz und Aussagegrenzen. Ex ante, keine Prognose.",
    creationProvenance: PROGRAMME_CREATION_PROVENANCE,
    omittedMarkerCandidates: PROGRAMME_NO_MARKER,
  },
  "ltw-2026-st-cdu": {
    filename: "cdu-program-scenario-v2.webp",
    originalFilename: "sa-2026-program-cdu-wirkungsbild-v2.png",
    originalSha256: "76adfdabfb11bc8edcf562971e371e116c8d219f2446cbede82af245130ad658",
    assetSha256: "5baf10d136d280baee4febf2733249876e0abd5e6eab620dad38a4074ef3f917",
    width: 1600,
    height: 1000,
    altText: "Analytisches Wirkungsbild zum CDU-Wahlprogramm Sachsen-Anhalt 2026: links ein sachlicher öffentlicher Infrastruktur- und Sicherheitskontext mit Feuerwehr-Ausbildungszentrum und Ordnungsbehörde; rechts vier freigegebene Schlüsselpfade zu Katastrophenschutz, Sicherheit, Wachstumszielen und Rückführungsverfahren mit Richtung, Evidenz und Aussagegrenzen. Ex ante, keine Prognose.",
    creationProvenance: PROGRAMME_CREATION_PROVENANCE,
    omittedMarkerCandidates: PROGRAMME_NO_MARKER,
  },
  "ltw-2026-st-spd": {
    filename: "spd-program-scenario-v2.webp",
    originalFilename: "sa-2026-program-spd-wirkungsbild-v2.png",
    originalSha256: "b94bfb386590e6521a771fbece49e62d4832ec09369368f6548765e8b7ae222b",
    assetSha256: "59e69c1b07353c1edd7beff95eed209461cd227778a39115c264554444dfa18f",
    width: 1600,
    height: 1000,
    altText: "Analytisches Wirkungsbild zum SPD-Wahlprogramm Sachsen-Anhalt 2026: links ein lokaler Stadt- und Nachbarschaftskontext mit Repair-Café und Bildungs-/Begegnungsangebot; rechts vier freigegebene Schlüsselpfade zu altersgerechter Arbeit, Repair-Cafés, Ausbildungszugang und regionalen Strukturprojekten mit Richtung, Evidenz und Aussagegrenzen. Ex ante, keine Prognose.",
    creationProvenance: PROGRAMME_CREATION_PROVENANCE,
    omittedMarkerCandidates: PROGRAMME_NO_MARKER,
  },
  "ltw-2026-st-gruene": {
    filename: "gruene-program-scenario-v2.webp",
    originalFilename: "sa-2026-program-gruene-wirkungsbild-v2.png",
    originalSha256: "dab5d500fabe0acfb7741faea16d5bb990c0df802da266de1ed8f88dfff5c57b",
    assetSha256: "6d2bbe6b8d7e0c64455c1e2564e24ac4c6f4144f824b9a37774595b6ffde2221",
    width: 1600,
    height: 1000,
    altText: "Analytisches Wirkungsbild zum Grünen-Wahlprogramm Sachsen-Anhalt 2026: links Landwirtschaft, Biodiversitätsstrukturen und Waldsaum mit präventivem Brandschutzkorridor; rechts vier freigegebene Schlüsselpfade zu Ökolandbau, Waldbrandvorsorge, Natur- und Artenschutz sowie Wolfsmanagement mit Richtung, Evidenz und Aussagegrenzen. Ex ante, keine Prognose.",
    creationProvenance: PROGRAMME_CREATION_PROVENANCE,
    omittedMarkerCandidates: PROGRAMME_NO_MARKER,
  },
  "ltw-2026-st-linke": {
    filename: "linke-program-scenario-v2.webp",
    originalFilename: "sa-2026-program-linke-wirkungsbild-v2.png",
    originalSha256: "761049f36e2604f9128fdcc128d0544399c25f783cc4bc6b5022145b85ee6d86",
    assetSha256: "48198176bf0b656d5cce381f21347e18090719cbcad59b9b278ba29704b66ee7",
    width: 1600,
    height: 1000,
    altText: "Analytisches Wirkungsbild zum Linke-Wahlprogramm Sachsen-Anhalt 2026: links ein Bürgerhaus mit Ehrenamt, lokaler Beteiligung und gemeinschaftlichen Aktivitäten; rechts vier freigegebene Schlüsselpfade zu Bevölkerungsbeteiligung, Ehrenamtsförderung, direkter Demokratie und einem wegen Quellenkollision nicht bewertbaren Pfad. Ex ante, keine Prognose.",
    creationProvenance: PROGRAMME_CREATION_PROVENANCE,
    omittedMarkerCandidates: PROGRAMME_NO_MARKER,
  },
  "ltw-2026-st-bsw": {
    filename: "bsw-program-scenario-v2.webp",
    originalFilename: "sa-2026-program-bsw-wirkungsbild-v2.png",
    originalSha256: "88b3e8e65c3d0896f6df8b59ea236083661d7a552cc91f740c18126cf2179277",
    assetSha256: "85c88775667537c6a32095370bfde1b148baa4aedebd1b8378ca87f370051cce",
    width: 1600,
    height: 1000,
    altText: "Analytisches Wirkungsbild zum BSW-Wahlprogramm Sachsen-Anhalt 2026: links Rathaus und öffentlicher Beteiligungsraum mit Dialog; rechts vier freigegebene Schlüsselpfade zu zivilen Wahlmöglichkeiten junger Menschen, einer unbestimmten Militarisierungsforderung, Bürgerbudgets und gesellschaftlichem Dialog mit Richtung, Evidenz und Aussagegrenzen. Ex ante, keine Prognose.",
    creationProvenance: PROGRAMME_CREATION_PROVENANCE,
    omittedMarkerCandidates: PROGRAMME_NO_MARKER,
  },
};

const approvedCaseAssets: Record<string, ApprovedVisualAsset> = {
  "ltw-2026-st-cdu": {
    filename: "cdu-case-scenario-v1.webp",
    originalFilename: "sa-2026-case-cdu-katastrophenschutz-v1.png",
    originalSha256: "cdaea35a2a0f05512bca47ab7b0ced9d718e62c017b13ccf1434746ceeded220",
    assetSha256: "563e6e442ec89f4bd54fcf11b391e524ff991bc6277781d98097284f85179bbf",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario einer sachlichen Ausbildungs- und Übungssituation im Brand- und Katastrophenschutz in Sachsen-Anhalt mit Einsatzfahrzeug, Schutzkleidung und technischer Übungsinfrastruktur. Das Bild visualisiert den institutionellen Kapazitätshebel des freigegebenen WÖk-Wirkungsfalls und ist keine Prognose tatsächlicher Einsatz- oder Schadenswirkungen.",
    creationProvenance: CASE_CREATION_PROVENANCE,
    omittedMarkerCandidates: ["Kein räumlicher UI-Marker: Das freigegebene Bild zeigt nur Trainings-/Übungsinfrastruktur; vermiedene Einsätze oder Schäden bleiben ausdrücklich nicht bebildert."],
  },
  "ltw-2026-st-spd": {
    filename: "spd-case-scenario-v1.webp",
    originalFilename: "sa-2026-case-spd-repair-cafe-v1.png",
    originalSha256: "38a6650e720c15b0cbcce8def90eb3246e2ed5fe91c3ebb0af3530f2ab6d2f88",
    assetSha256: "067739482a4a0f7f6d40baeb928ccd8cc0a45cadca4904f3c880d86540cbf1b2",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines Repair-Cafés in Sachsen-Anhalt mit Reparaturtisch, Werkzeug und der Instandsetzung von Alltagsgegenständen. Das Bild visualisiert den freigegebenen Wirkungsfall zur Förderung niedrigschwelliger Reparaturmöglichkeiten; tatsächliche Lebensdauer-, Abfall- oder Ressourceneffekte werden damit nicht belegt.",
    creationProvenance: CASE_CREATION_PROVENANCE,
    omittedMarkerCandidates: ["Kein räumlicher UI-Marker: Sichtbar ist Reparaturzugang/-handlung; Lebensdauer-, Abfall- und Ressourceneffekte bleiben textlich und evidenzgebunden."],
  },
  "ltw-2026-st-gruene": {
    filename: "gruene-case-scenario-v1.webp",
    originalFilename: "sa-2026-case-gruene-waldbrandpraevention-v1.png",
    originalSha256: "53b7ed57641a9af226bdb467012432f15d41a8702cc1ecfffd3dd9848cdf8f00",
    assetSha256: "2a273b541db5a93e0eb0dffb60c2e82cd59a8af70e497eb772689bc87bebc6b0",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario einer Wald- oder Landschaftsfläche in Sachsen-Anhalt mit sachlich erkennbaren präventiven Brandschutzstrukturen. Das Bild visualisiert einen freigegebenen WÖk-Wirkungsfall zur möglichen Begrenzung von Feuerausbreitung und ist keine Prognose verhinderter Brände oder Schäden.",
    creationProvenance: CASE_CREATION_PROVENANCE,
    omittedMarkerCandidates: ["Kein räumlicher UI-Marker: Sichtbar ist eine Präventionsstruktur; verhinderte Brände oder Schäden werden nicht als eingetretener Zustand markiert."],
  },
  "ltw-2026-st-linke": {
    filename: "linke-case-scenario-v1.webp",
    originalFilename: "sa-2026-case-linke-direkte-demokratie-v1.png",
    originalSha256: "fe8286a8e1ea5e696ee7c62ae2d21915f6fb16d22e751677e03c42b89ac517b1",
    assetSha256: "7fdc7a9b2a45d535896a43a576125a535d74ce417c0aeb4e26c586816a3088c6",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines öffentlich zugänglichen Beteiligungsverfahrens in Sachsen-Anhalt mit neutralem Informations- und Eintragungsbereich. Das Bild visualisiert den freigegebenen institutionellen Wirkungsfall zu Volksinitiative, Volksbegehren oder Volksentscheid; tatsächliche Beteiligung oder politische Ergebnisse werden damit nicht vorausgesagt.",
    creationProvenance: CASE_CREATION_PROVENANCE,
    omittedMarkerCandidates: ["Kein räumlicher UI-Marker: Sichtbar ist nur der Verfahrenszugang; Repräsentativität, Legitimität und politische Ergebnisse bleiben unbehauptet."],
  },
  "ltw-2026-st-bsw": {
    filename: "bsw-case-scenario-v1.webp",
    originalFilename: "sa-2026-case-bsw-buergerbudget-v1.png",
    originalSha256: "acc39dee9823e89361f6509f47cbd532c176a38623299d037bd86e48eee39047",
    assetSha256: "129370172f869eaa362f1467748813e6d2078f810b25c4a0965739108e6fe446",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines kommunalen Bürgerbudget- oder Beteiligungsprozesses in Sachsen-Anhalt mit sachlich dargestellten Projektvorschlägen und öffentlicher Priorisierung. Das Bild visualisiert den freigegebenen Verfahrenshebel; Qualität der Mittelverwendung, Vertrauen oder gesellschaftliche Wirkungen werden nicht als eingetretener Outcome dargestellt.",
    creationProvenance: CASE_CREATION_PROVENANCE,
    omittedMarkerCandidates: ["Kein räumlicher UI-Marker: Sichtbar ist der Beteiligungs-/Budgetprozess; bessere Mittelverwendung, Vertrauen oder gesellschaftliche Outcomes werden nicht behauptet."],
  },
  "ltw-2026-st-afd": {
    filename: "afd-case-scenario-v1.webp",
    originalFilename: "sa-2026-case-afd-gesellschaftspolitische-steuerung-v1.png",
    originalSha256: "33310cd5fc0aadf8558edf499b3ad2e3d03e6a0714191e313ef6eb448db7b46a",
    assetSha256: "1a6dc5da1bcc7f9aba49a22670687f069ba3d44d488ac4a7e33db9604ff2ce61",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines nüchternen öffentlichen Beratungs- und Verwaltungsraums in Sachsen-Anhalt. Das Bild dient als visueller Anker für den freigegebenen WÖk-Fall zur Veränderung gesellschaftspolitischer Verwaltungsfunktionen; welche Aufgaben tatsächlich entfallen oder welche Gleichbehandlungs- und Teilhabewirkungen folgen, wird ausschließlich in der textlichen Wirkungsanalyse bewertet und nicht durch das Bild behauptet.",
    creationProvenance: CASE_CREATION_PROVENANCE,
    omittedMarkerCandidates: ["NULL_MARKER_APPROVED: Der neutrale Verwaltungsanker bezeichnet weder eine konkrete abzuschaffende Funktion noch Gleichbehandlungs- oder Teilhabewirkungen."],
  },
};

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, canonical(item)]));
  }
  return value;
}

function sha256(value: unknown) {
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

function recordFor(sourceKey: string, party: string, scope: "PROGRAM_SCENARIO" | "CASE_SCENARIO"): ImpactVisualScenarioRecord {
  const editorial = saxonyAnhaltProgrammeEditorial(sourceKey);
  const terminalParty = saxonyAnhaltTerminalPartyBySourceKey.get(sourceKey);
  if (!editorial || !terminalParty) throw new Error(`Missing approved Sachsen-Anhalt source state for ${sourceKey}`);

  const approvedAnalysisRefs = Object.keys(editorial.centralAssessments);
  const isProgramme = scope === "PROGRAM_SCENARIO";
  const approvedCase = isProgramme ? null : approvedCaseBriefs[sourceKey];
  if (!isProgramme && !approvedCase) throw new Error(`Missing delegated case brief for ${sourceKey}`);
  const caseEditorial = approvedCase ? editorial.centralAssessments[approvedCase.caseId] : null;
  if (approvedCase && !caseEditorial) throw new Error(`CASE_SELECTION_SOURCE_CONFLICT ${approvedCase.caseId} is not in the approved Editorial-v2 set`);
  const caseCanonical = approvedCase ? canonicalCase(sourceKey, approvedCase.caseId) : null;
  const scopeLabel = isProgramme ? "program" : "case";
  const approvedAsset = isProgramme ? approvedProgrammeAssets[sourceKey] : approvedCaseAssets[sourceKey];
  if (!approvedAsset) throw new Error(`Missing final approved ${scope} asset for ${sourceKey}`);
  const publicAssetPath = approvedAsset ? `/visuals/impact-scenarios/sachsen-anhalt/2026/${approvedAsset.filename}` : null;
  const assetFile = approvedAsset ? fileURLToPath(new URL(`../public${publicAssetPath}`, import.meta.url)) : null;
  if (approvedAsset && assetFile) {
    const actualSha = createHash("sha256").update(readFileSync(assetFile)).digest("hex");
    if (actualSha !== approvedAsset.assetSha256) throw new Error(`Approved asset hash mismatch for ${sourceKey}`);
  }

  const caseNonVisualEffects = caseCanonical ? unique([
    ...caseCanonical.impact_risks.map((risk) => risk.risk),
    ...caseCanonical.data_gaps,
    ...caseCanonical.non_compensable_boundaries.flatMap((boundary) => [boundary.concern, boundary.rationale]),
  ]) : [];
  const caseImplementationConditions = caseCanonical
    ? unique(caseCanonical.impact_potential.flatMap((path) => path.implementation_conditions))
    : [];
  const caseVisualBrief = approvedCase ? {
    id: "CASE-VISUALS-6X-EDITORIAL-BRIEF-2026-08-26",
    version: "1.0",
    content_sha256: sha256({ handoff_path: CASE_BRIEF_HANDOFF_PATH, source_key: sourceKey, ...approvedCase }),
    review_status: "APPROVED" as const,
  } : null;
  const caseAnalysisBinding = approvedCase && caseCanonical && caseEditorial ? {
    approval_provenance: CASE_APPROVAL_PROVENANCE,
    selected_case_id: approvedCase.caseId,
    canonical_record_path: CASE_CANONICAL_RECORD_PATH,
    canonical_editorial_path: CASE_CANONICAL_EDITORIAL_PATH,
    decision_or_measure: caseCanonical.decision_or_measure,
    intended_change: caseCanonical.intended_change,
    source_statement_refs: caseCanonical.source_refs,
    affected_group_or_system: caseCanonical.affected_groups,
    mechanism: caseCanonical.impact_potential.map((path) => path.mechanism),
    potential_state_change: caseCanonical.impact_potential.map((path) => path.expected_state_change),
    key_finding: caseEditorial.keyFinding,
    impact_core_summary: caseEditorial.impactCoreSummary,
    editorial_summary: caseEditorial.editorialSummary,
    direction_rationale: caseEditorial.directionRationale,
    impact_direction: caseEditorial.direction,
    evidence_level: caseEditorial.evidence,
    competence_and_system_boundary: {
      responsible_actors: caseCanonical.responsible_actors,
      competence_note: caseEditorial.competenceNote ?? null,
      implementation_conditions: caseImplementationConditions,
    },
    material_risks: caseCanonical.impact_risks,
    impact_orders: caseCanonical.impact_orders,
    time_horizon: {
      short_term: caseCanonical.distribution_and_time.short_term,
      medium_term: caseCanonical.distribution_and_time.medium_term,
      long_term: caseCanonical.distribution_and_time.long_term,
      intergenerational_relevance: caseCanonical.distribution_and_time.intergenerational_relevance,
    },
    materiality: caseCanonical.distribution_and_time.intergenerational_relevance,
    uncertainty: caseCanonical.data_gaps,
    falsification_or_reality_check: caseCanonical.monitoring_and_feedback,
    noncompensation: caseCanonical.non_compensable_boundaries,
    marker_decision: approvedCase.markerDecision,
    editorial_input_status: {
      approved_case_selection: "APPROVED" as const,
      reviewed_visual_brief: "APPROVED" as const,
      alt_text_review: "APPROVED" as const,
      editorial_brief_signoff: "APPROVED" as const,
      image_asset: "SUPPLIED" as const,
      final_image_signoff: "APPROVED" as const,
    },
  } : null;

  return {
    id: `woek-impact-visual-st-2026-${sourceKey.replace("ltw-2026-st-", "")}-${scopeLabel}-${isProgramme ? "v2" : "v1"}`,
    object_type: isProgramme ? "PROGRAM" : "IMPACT_CASE",
    object_id: isProgramme ? sourceKey : approvedCase!.caseId,
    source_key: sourceKey,
    analysis_version: `${saxonyAnhaltTerminalRelease.manifest_id}+WOEK-WAHLPROGRAMM-BLAUPAUSE-V${editorial.version}`,
    knowledge_cutoff: KNOWLEDGE_CUTOFF,
    stage: "EX_ANTE",
    visual_scope: scope,
    public_label: isProgramme ? PROGRAMME_PUBLIC_LABEL : CASE_PUBLIC_LABEL,
    public_subtitle: isProgramme ? PROGRAMME_PUBLIC_SUBTITLE : CASE_PUBLIC_SUBTITLE,
    title: isProgramme ? `Programm-Szenario · ${party}` : `Fallvertiefung · ${party}`,
    normalized_subject: isProgramme
      ? "Landtagswahlprogramm Sachsen-Anhalt 2026 · programmweite Folgenpfade"
      : "Landtagswahlprogramm Sachsen-Anhalt 2026 · einzelne freigegebene Analyse",
    source_statement_refs: isProgramme ? approvedAnalysisRefs : [approvedCase!.caseId],
    selected_impact_path_ids: isProgramme ? approvedAnalysisRefs : [approvedCase!.caseId],
    eligible_approved_analysis_refs: approvedAnalysisRefs,
    selection_rationale: isProgramme
      ? "Die bereits fachlich kuratierte Editorial-v2-Menge der vier Schlüsselpfade wird unverändert wiederverwendet. PROGRAM_SCENARIO v2 fasst diese Pfade analytisch zusammen; der Fotoanker erzeugt keine Fachinformation und keine räumlichen Marker."
      : approvedCase!.selectionRationale,
    visible_elements: [],
    case_analysis_binding: caseAnalysisBinding,
    non_visual_effects: isProgramme ? editorial.keyFindings.map((finding) => `${finding.label}: ${finding.text}`) : caseNonVisualEffects,
    non_visual_effects_review_status: "REVIEWED_COMPLETE",
    omitted_material_effects: isProgramme ? [] : [approvedCase!.notImageFact],
    omitted_marker_candidates: approvedAsset?.omittedMarkerCandidates ?? (approvedCase?.markerDecision === "NULL_MARKER_APPROVED" ? [approvedCase.markerInstruction] : []),
    system_boundary: isProgramme ? null : (caseEditorial!.competenceNote ?? caseCanonical!.responsible_actors.join(" · ")),
    scenario_assumptions: isProgramme ? [] : caseImplementationConditions,
    evidence_summary: isProgramme
      ? "Richtung, Evidenz und Unsicherheit bleiben in den verknüpften WÖk-Analysen getrennt. Das freigegebene Bild liefert keine zusätzliche Evidenz."
      : caseEditorial!.editorialSummary,
    disclaimer: DISCLAIMER,
    asset_path: publicAssetPath,
    alt_text: approvedAsset.altText,
    visual_brief: isProgramme ? VISUAL_HANDOFF : caseVisualBrief,
    generator_metadata: null,
    asset_sha256: approvedAsset.assetSha256,
    final_image_signoff: FINAL_IMAGE_HANDOFF.final_image_signoff,
    supersedes_asset_path: isProgramme
      ? `/visuals/impact-scenarios/sachsen-anhalt/2026/${sourceKey.replace("ltw-2026-st-", "")}-program-scenario-v1.webp`
      : null,
    asset_metadata: assetFile ? {
      mime_type: "image/webp",
      width: approvedAsset.width,
      height: approvedAsset.height,
      byte_size: statSync(assetFile).size,
      original_filename: approvedAsset.originalFilename,
      original_sha256: approvedAsset.originalSha256,
      asset_handoff_id: FINAL_IMAGE_HANDOFF.id,
      asset_handoff_manifest_sha256: FINAL_IMAGE_HANDOFF.manifest_sha256,
      asset_handoff_archive_sha256: FINAL_IMAGE_HANDOFF.archive_sha256,
      creation_provenance: approvedAsset.creationProvenance,
      optimization: { format: "WEBP_LOSSY_Q90", full_composition_preserved: true, metadata_published: false },
      integrated_at: FINAL_IMAGE_HANDOFF.review_date,
    } : null,
    editorial_review_status: "APPROVED_FOR_PUBLICATION",
    source_fidelity_status: "PASS_APPROVED_ANALYSIS_ONLY",
    missing_approved_inputs: [],
    change_history: [
      {
        version: "1.0",
        date: CREATED_DATE,
        status: "FAIL_CLOSED_CREATED",
        note: "Architektur-Record ohne Bildasset angelegt; keine Fachwirkung, Auswahl oder Visualisierung synthetisiert.",
      },
      ...(isProgramme ? [{
        version: "1.1",
        date: "2026-08-26",
        status: "APPROVED" as const,
        note: "Eigentümerseitig bereitgestelltes PROGRAM_SCENARIO mit freigegebenem Visual Brief und Alt-Text integriert; nicht eindeutig bindbare Marker bewusst ausgelassen; keine Bildinformation in Fachdata zurückgeschrieben.",
      }, {
        version: "2.0",
        date: FINAL_IMAGE_HANDOFF.review_date,
        status: "CORRECTED" as const,
        note: "PROGRAM_VISUAL_SOURCE_ALIGNMENT_CORRECTION: Das bisherige PROGRAM_SCENARIO v1 ist als aktuelles Public Asset superseded. v2 bindet die unveränderten vier kanonischen Editorial-v2-Pfade als analytische Zusammenfassung, wahrt OPEN/NOT_ASSESSABLE und schreibt keine Bildinformation in Fachdata zurück.",
      }] : [{
        version: "1.1",
        date: "2026-08-26",
        status: "APPROVED" as const,
        note: "Delegierte Case-Auswahl, kanonische Analysebindung, Visual Brief, Nichtbild-Folgen, Markerentscheidung und Alt-Text vollständig übernommen. Separate Case-Bildbytes und finaler Bild-Signoff bleiben fail-closed ausstehend.",
      }, {
        version: "1.2",
        date: FINAL_IMAGE_HANDOFF.review_date,
        status: "APPROVED" as const,
        note: "Separates CASE_SCENARIO-Asset aus SA-2026-WIRKUNGSBILDER-FINAL-12-OF-12 byteverifiziert integriert; IMAGE_ASSET und FINAL_IMAGE_SIGNOFF sind APPROVED. Nichtbild-Folgen, Evidenz, Unsicherheit, Systemgrenze und Fallauswahl bleiben unverändert führend.",
      }]),
    ],
  };
}

function buildDescriptor() {
  const records = saxonyAnhaltElectionProgrammes.flatMap((programme) => [
    recordFor(programme.sourceKey, programme.party, "PROGRAM_SCENARIO"),
    recordFor(programme.sourceKey, programme.party, "CASE_SCENARIO"),
  ]);
  const withoutHash = {
    schema_version: "woek-impact-visual-scenarios-1.0" as const,
    manifest_id: "LTW-2026-ST-IMPACT-VISUAL-SCENARIOS-V2",
    base_main_commit: BASE_MAIN_COMMIT,
    source_release: {
      manifest_id: saxonyAnhaltTerminalRelease.manifest_id,
      manifest_path: "data/fachakten/source-manifests/sachsen-anhalt/ltw-2026-st-six-party-terminal-release-v1.json",
      descriptor_sha256: saxonyAnhaltTerminalRelease.release_descriptor_sha256,
      published_commit: SOURCE_RELEASE_COMMIT,
    },
    generation_policy: {
      input_mode: "APPROVED_VISUAL_BRIEF_ONLY" as const,
      raw_programme_text_allowed: false as const,
      campaign_slogan_allowed: false as const,
      party_valence_style: "PORTAL_NEUTRAL" as const,
      fachdata_backpropagation_allowed: false as const,
      automatic_generation_allowed: false as const,
    },
    public_contract: {
      label: "Wirkungsbild" as const,
      disclaimer: DISCLAIMER,
      image_is_evidence: false as const,
    },
    records,
  };
  return impactVisualDescriptorSchema.parse({ ...withoutHash, manifest_sha256: sha256(withoutHash) });
}

const output = `${JSON.stringify(buildDescriptor(), null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = readFileSync(OUTPUT_PATH, "utf8");
  if (current !== output) {
    console.error("IMPACT_VISUAL_VERSION_PROVENANCE=FAIL generated descriptor differs from committed artifact");
    process.exit(1);
  }
  console.log("IMPACT_VISUAL_VERSION_PROVENANCE=PASS deterministic descriptor matches committed artifact");
} else {
  writeFileSync(OUTPUT_PATH, output);
  const descriptor = buildDescriptor();
  const approved = descriptor.records.filter((record) => record.editorial_review_status === "APPROVED_FOR_PUBLICATION").length;
  const finalSignoffs = descriptor.records.filter((record) => record.final_image_signoff === "APPROVED").length;
  console.log(`Materialized ${descriptor.records.length} impact visual records (${approved} approved; ${finalSignoffs} final image sign-offs) at ${OUTPUT_PATH}`);
}

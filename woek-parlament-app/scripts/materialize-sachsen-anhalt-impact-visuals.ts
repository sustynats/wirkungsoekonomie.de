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
const BASE_MAIN_COMMIT = "9e8389cb8623109a87ba6f3563d5aabac3ba6cea";
const DISCLAIMER = "Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose.";
const VISUAL_HANDOFF = {
  id: "SACHSEN-ANHALT-WIRKUNGSBILDER-6-6-CODEX-HANDOFF-2026-08-26",
  version: "1.0",
  content_sha256: "3840250aa566a04044d051b191ab89c672d4116a83ce330b753cf448e5066d29",
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

const approvedProgrammeAssets: Record<string, {
  filename: string;
  originalFilename: string;
  originalSha256: string;
  assetSha256: string;
  width: number;
  height: number;
  altText: string;
  omittedMarkerCandidates: string[];
}> = {
  "ltw-2026-st-afd": {
    filename: "afd-program-scenario-v1.webp",
    originalFilename: "owner-provided-afd-program-scenario-v1.png",
    originalSha256: "accc8bd94ef8969b6f207151e761d66b7cbdc705f54f0e3a7ade7bb0e7b881f8",
    assetSha256: "ed6a73eeed917bf8501d5f351feaf01a206f75774d467be865675d8f1957b78a",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines städtischen Alltagsraums in Sachsen-Anhalt mit dichtem Autoverkehr, sichtbarer Polizei- und Überwachungsinfrastruktur, einer administrativen Zugangssituation sowie konventionell geprägter Industrie- und Energieinfrastruktur im Hintergrund. Das Bild visualisiert ausgewählte Wirkungspfade der WÖk-Analyse und ist keine Prognose.",
    omittedMarkerCandidates: ["Straßenraum, Polizei, Überwachung, Industrie und Verwaltungszugang: kein eindeutiger Bezug zu den vier ausgewählten freigegebenen Wirkpfad-IDs; daher NO_MARKER."],
  },
  "ltw-2026-st-cdu": {
    filename: "cdu-program-scenario-v1.webp",
    originalFilename: "owner-provided-cdu-program-scenario-v1.png",
    originalSha256: "e9b6f86385b18eff50aadc9c7d54ffecdbfdf6fde8c4df99e4134ba7b1448048",
    assetSha256: "37ddd1008a733172f58843f5424e6014b0f4623d140dd13f12c93781d9b5db3e",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines geordneten regionalen Verkehrsknotens in Sachsen-Anhalt mit Bus, Fahrrädern, öffentlicher Infrastruktur und Verwaltungsorientierung. Das Bild visualisiert ausgewählte Wirkungspfade zu Erreichbarkeit, Infrastruktur und öffentlicher Funktionsfähigkeit und ist keine Prognose.",
    omittedMarkerCandidates: ["Verkehrsknoten, Bus, Fahrräder und Verwaltungsorientierung: kein eindeutiger Bezug zu den vier ausgewählten freigegebenen Wirkpfad-IDs; daher NO_MARKER."],
  },
  "ltw-2026-st-spd": {
    filename: "spd-program-scenario-v1.webp",
    originalFilename: "owner-provided-spd-program-scenario-v1.png",
    originalSha256: "6190a9af3f09851d4d64e19e434470662a99ed8fe119a9ecaa8fabee8b0a9557",
    assetSha256: "03fe2d3097b9e3ddb79fbc29a917eb2f891ec86b3185d8960fb24fb1e2fd730f",
    width: 1448,
    height: 1086,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines belebten Orts- oder Stadtzentrums in Sachsen-Anhalt mit öffentlichem Busverkehr, Apotheke, wohnortnaher Versorgung und Menschen verschiedener Altersgruppen. Das Bild visualisiert ausgewählte Wirkungspfade zu Daseinsvorsorge und sozialer Teilhabe und ist keine Prognose.",
    omittedMarkerCandidates: ["Bus, Apotheke, Versorgung und generationenübergreifende Platznutzung: kein eindeutiger Bezug zu den vier ausgewählten freigegebenen Wirkpfad-IDs; daher NO_MARKER."],
  },
  "ltw-2026-st-gruene": {
    filename: "gruene-program-scenario-v1.webp",
    originalFilename: "owner-provided-gruene-program-scenario-v1.png",
    originalSha256: "ff3a1767db99f3eb7f3ddecb3018609fe1d07556fa14bcc79e82f836442e275d",
    assetSha256: "7350d33b57190788e0a4e5d0910f2d7362a625fe84710ca6349834d85cddfe8b",
    width: 1536,
    height: 1024,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines multimodalen öffentlichen Raums in Sachsen-Anhalt mit Bus, Bahn, Rad- und Fußverkehr, Begrünung sowie sichtbarer Solar- und Windenergieinfrastruktur. Das Bild visualisiert ausgewählte Wirkungspfade zu Mobilität, öffentlichem Raum und Energie und ist keine Prognose.",
    omittedMarkerCandidates: ["Mobilität, Begrünung, Solar- und Windenergie: kein eindeutiger Bezug zu den vier ausgewählten freigegebenen Wirkpfad-IDs; daher NO_MARKER."],
  },
  "ltw-2026-st-linke": {
    filename: "linke-program-scenario-v1.webp",
    originalFilename: "owner-provided-linke-program-scenario-v1.png",
    originalSha256: "459194ccf3e6801c670189fc22f537b6a35754d0a2231aa11d18e0f731f67044",
    assetSha256: "74ba1d23f7452cc58dd54fa36addfcadbdac22f5078fe04aadcfd0948fbec823",
    width: 1536,
    height: 1024,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines Wohnquartiers in Sachsen-Anhalt mit Kita, Stadtteiltreff, wohnortnaher Versorgung und generationenübergreifend genutztem öffentlichem Raum. Das Bild visualisiert ausgewählte Wirkungspfade zu Wohnen, sozialer Infrastruktur und Zugänglichkeit und ist keine Prognose.",
    omittedMarkerCandidates: ["Wohnquartier, Kita, Stadtteiltreff und Versorgung: kein eindeutiger Bezug zu den vier ausgewählten freigegebenen Wirkpfad-IDs; daher NO_MARKER."],
  },
  "ltw-2026-st-bsw": {
    filename: "bsw-program-scenario-v1.webp",
    originalFilename: "owner-provided-bsw-program-scenario-v1.png",
    originalSha256: "a01b46494dd40da8082878e9a3ec45af72834f55377d57ed4978261ce0c20b37",
    assetSha256: "2ead313d310fee8256642ddda5b8c26a8f1dfaa7ea9238c8be012fd8c70724d1",
    width: 1536,
    height: 1024,
    altText: "Fotorealistisches Ex-ante-Wirkungsszenario eines regionalen Ortszentrums in Sachsen-Anhalt mit lokaler Versorgung, öffentlichem Busverkehr, kommunaler Infrastruktur und regionalem Wirtschafts- und Industriebezug. Das Bild visualisiert ausgewählte Wirkungspfade zu Versorgung, regionaler Wirtschaft und Alltagsstabilität und ist keine Prognose.",
    omittedMarkerCandidates: ["Versorgung, Bus, Rathaus und regionale Wirtschaftsstruktur: kein eindeutiger Bezug zu den vier ausgewählten freigegebenen Wirkpfad-IDs; daher NO_MARKER."],
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

function missingInputs(scope: "PROGRAM_SCENARIO" | "CASE_SCENARIO") {
  const shared = [
    {
      code: "REVIEWED_VISUAL_BRIEF" as const,
      description: "Ein versionierter, fachlich und redaktionell freigegebener Visual Brief auf Basis ausschließlich freigegebener Analysefelder fehlt.",
      required_for: "BOTH" as const,
    },
    {
      code: "VISIBLE_ELEMENT_MAPPING" as const,
      description: "Die explizite Zuordnung jedes darstellbaren Elements zu Zustandsänderung, Wirkungsordnung, Betroffenen, Zeithorizont, Richtung, Evidenz und Unsicherheit fehlt.",
      required_for: "BOTH" as const,
    },
    {
      code: "NON_VISUAL_EFFECT_SELECTION" as const,
      description: "Die fachlich freigegebene Auswahl materieller, im Bild nicht darstellbarer Folgen und Grenzen fehlt.",
      required_for: "BOTH" as const,
    },
    {
      code: "ALT_TEXT_REVIEW" as const,
      description: "Ein szenariospezifischer, fachlich präziser Alt-Text mit Unsicherheitsgrenze fehlt.",
      required_for: "BOTH" as const,
    },
    {
      code: "EDITORIAL_VISUAL_SIGNOFF" as const,
      description: "Die abschließende Prüfung auf Source Fidelity, Frame-Schutz, Stilneutralität und Aussagegrenzen fehlt.",
      required_for: "BOTH" as const,
    },
  ];
  if (scope === "PROGRAM_SCENARIO") return shared;
  return [{
    code: "APPROVED_CASE_SELECTION" as const,
    description: "Eine einzelne freigegebene Analyse wurde noch nicht ausdrücklich und symmetrisch als Case-Deep-Dive ausgewählt.",
    required_for: "CASE_SCENARIO" as const,
  }, ...shared];
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
  const approvedAsset = isProgramme ? approvedProgrammeAssets[sourceKey] : undefined;
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
      image_asset: "NOT_YET_SUPPLIED" as const,
      final_image_signoff: "PENDING_ASSET" as const,
    },
  } : null;

  return {
    id: `woek-impact-visual-st-2026-${sourceKey.replace("ltw-2026-st-", "")}-${scopeLabel}-v1`,
    object_type: isProgramme ? "PROGRAM" : "IMPACT_CASE",
    object_id: isProgramme ? sourceKey : approvedCase!.caseId,
    source_key: sourceKey,
    analysis_version: `${saxonyAnhaltTerminalRelease.manifest_id}+WOEK-WAHLPROGRAMM-BLAUPAUSE-V${editorial.version}`,
    knowledge_cutoff: KNOWLEDGE_CUTOFF,
    stage: "EX_ANTE",
    visual_scope: scope,
    title: isProgramme ? `Programm-Szenario · ${party}` : `Fallvertiefung · ${party}`,
    normalized_subject: isProgramme
      ? "Landtagswahlprogramm Sachsen-Anhalt 2026 · programmweite Folgenpfade"
      : "Landtagswahlprogramm Sachsen-Anhalt 2026 · einzelne freigegebene Analyse",
    source_statement_refs: isProgramme ? approvedAnalysisRefs : [approvedCase!.caseId],
    selected_impact_path_ids: isProgramme ? approvedAnalysisRefs : [approvedCase!.caseId],
    eligible_approved_analysis_refs: approvedAnalysisRefs,
    selection_rationale: isProgramme
      ? "Die bereits fachlich kuratierte Editorial-v2-Menge der vier Schlüsselpfade wird unverändert wiederverwendet. Der freigegebene Visual-Handoff legt Bild, Aussagegrenzen und Alt-Text fest; mangels eindeutiger Pfadbindung werden bewusst keine Marker gesetzt."
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
    alt_text: approvedAsset?.altText ?? approvedCase?.altText ?? null,
    visual_brief: approvedAsset ? VISUAL_HANDOFF : caseVisualBrief,
    generator_metadata: null,
    asset_sha256: approvedAsset?.assetSha256 ?? null,
    asset_metadata: approvedAsset && assetFile ? {
      mime_type: "image/webp",
      width: approvedAsset.width,
      height: approvedAsset.height,
      byte_size: statSync(assetFile).size,
      original_filename: approvedAsset.originalFilename,
      original_sha256: approvedAsset.originalSha256,
      optimization: { format: "WEBP_LOSSY_Q90", full_composition_preserved: true, metadata_published: false },
      integrated_at: "2026-08-26",
    } : null,
    editorial_review_status: approvedAsset ? "APPROVED_FOR_PUBLICATION" : "PREPARED_AWAITING_ASSET",
    source_fidelity_status: approvedAsset ? "PASS_APPROVED_ANALYSIS_ONLY" : "PASS_APPROVED_ANALYSIS_ONLY_AWAITING_ASSET",
    missing_approved_inputs: approvedAsset ? [] : [
      {
        code: "IMAGE_ASSET" as const,
        description: "Eine separate CASE_SCENARIO-Bilddatei wurde noch nicht geliefert; das PROGRAM_SCENARIO-Asset darf nicht wiederverwendet werden.",
        required_for: "CASE_SCENARIO" as const,
      },
      {
        code: "FINAL_IMAGE_SIGNOFF" as const,
        description: "Der finale Source-Fidelity-, Frame-Schutz-, Marker- und Alt-Text-Smoke ist erst gegen die tatsächlichen Bildbytes möglich.",
        required_for: "CASE_SCENARIO" as const,
      },
    ],
    change_history: [
      {
        version: "1.0",
        date: CREATED_DATE,
        status: "FAIL_CLOSED_CREATED",
        note: "Architektur-Record ohne Bildasset angelegt; keine Fachwirkung, Auswahl oder Visualisierung synthetisiert.",
      },
      ...(approvedAsset ? [{
        version: "1.1",
        date: "2026-08-26",
        status: "APPROVED" as const,
        note: "Eigentümerseitig bereitgestelltes PROGRAM_SCENARIO mit freigegebenem Visual Brief und Alt-Text integriert; nicht eindeutig bindbare Marker bewusst ausgelassen; keine Bildinformation in Fachdata zurückgeschrieben.",
      }] : [{
        version: "1.1",
        date: "2026-08-26",
        status: "APPROVED" as const,
        note: "Delegierte Case-Auswahl, kanonische Analysebindung, Visual Brief, Nichtbild-Folgen, Markerentscheidung und Alt-Text vollständig übernommen. Separate Case-Bildbytes und finaler Bild-Signoff bleiben fail-closed ausstehend.",
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
    manifest_id: "LTW-2026-ST-IMPACT-VISUAL-SCENARIOS-V1",
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
  const prepared = descriptor.records.filter((record) => record.editorial_review_status === "PREPARED_AWAITING_ASSET").length;
  console.log(`Materialized ${descriptor.records.length} impact visual records (${approved} approved; ${prepared} prepared awaiting separate assets; ${descriptor.records.length - approved - prepared} fully closed) at ${OUTPUT_PATH}`);
}

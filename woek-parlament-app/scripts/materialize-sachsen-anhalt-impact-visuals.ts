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
  const scopeLabel = isProgramme ? "program" : "case";
  const approvedAsset = isProgramme ? approvedProgrammeAssets[sourceKey] : undefined;
  const publicAssetPath = approvedAsset ? `/visuals/impact-scenarios/sachsen-anhalt/2026/${approvedAsset.filename}` : null;
  const assetFile = approvedAsset ? fileURLToPath(new URL(`../public${publicAssetPath}`, import.meta.url)) : null;
  if (approvedAsset && assetFile) {
    const actualSha = createHash("sha256").update(readFileSync(assetFile)).digest("hex");
    if (actualSha !== approvedAsset.assetSha256) throw new Error(`Approved asset hash mismatch for ${sourceKey}`);
  }

  return {
    id: `woek-impact-visual-st-2026-${sourceKey.replace("ltw-2026-st-", "")}-${scopeLabel}-v1`,
    object_type: isProgramme ? "PROGRAM" : "IMPACT_CASE",
    object_id: isProgramme ? sourceKey : `${sourceKey}:case-scenario-slot`,
    source_key: sourceKey,
    analysis_version: `${saxonyAnhaltTerminalRelease.manifest_id}+WOEK-WAHLPROGRAMM-BLAUPAUSE-V${editorial.version}`,
    knowledge_cutoff: KNOWLEDGE_CUTOFF,
    stage: "EX_ANTE",
    visual_scope: scope,
    title: isProgramme ? `Programm-Szenario · ${party}` : `Fallvertiefung · ${party}`,
    normalized_subject: isProgramme
      ? "Landtagswahlprogramm Sachsen-Anhalt 2026 · programmweite Folgenpfade"
      : "Landtagswahlprogramm Sachsen-Anhalt 2026 · einzelne freigegebene Analyse",
    source_statement_refs: isProgramme ? approvedAnalysisRefs : [],
    selected_impact_path_ids: isProgramme ? approvedAnalysisRefs : [],
    eligible_approved_analysis_refs: approvedAnalysisRefs,
    selection_rationale: isProgramme
      ? "Die bereits fachlich kuratierte Editorial-v2-Menge der vier Schlüsselpfade wird unverändert wiederverwendet. Der freigegebene Visual-Handoff legt Bild, Aussagegrenzen und Alt-Text fest; mangels eindeutiger Pfadbindung werden bewusst keine Marker gesetzt."
      : "Es wird keine Einzelanalyse technisch ausgewählt. Die vorhandenen Editorial-v2-Schlüsselpfade bleiben lediglich als endliche fachlich freigegebene Kandidatenmenge dokumentiert, bis eine symmetrische Case-Auswahl freigegeben ist.",
    visible_elements: [],
    non_visual_effects: isProgramme ? editorial.keyFindings.map((finding) => `${finding.label}: ${finding.text}`) : [],
    non_visual_effects_review_status: isProgramme ? "REVIEWED_COMPLETE" : "PENDING_APPROVAL",
    omitted_material_effects: [],
    omitted_marker_candidates: approvedAsset?.omittedMarkerCandidates ?? [],
    system_boundary: null,
    scenario_assumptions: [],
    evidence_summary: isProgramme
      ? "Richtung, Evidenz und Unsicherheit bleiben in den verknüpften WÖk-Analysen getrennt. Das freigegebene Bild liefert keine zusätzliche Evidenz."
      : "Richtung, Evidenz und Unsicherheit bleiben in den verknüpften WÖk-Analysen getrennt. Das noch nicht vorhandene Bild liefert keine zusätzliche Evidenz.",
    disclaimer: DISCLAIMER,
    asset_path: publicAssetPath,
    alt_text: approvedAsset?.altText ?? null,
    visual_brief: approvedAsset ? VISUAL_HANDOFF : null,
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
    editorial_review_status: approvedAsset ? "APPROVED_FOR_PUBLICATION" : "NO_APPROVED_VISUAL_SCENARIO",
    source_fidelity_status: approvedAsset ? "PASS_APPROVED_ANALYSIS_ONLY" : "FAIL_CLOSED_NO_PUBLIC_ASSET",
    missing_approved_inputs: approvedAsset ? [] : missingInputs(scope),
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
      }] : []),
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
  console.log(`Materialized ${descriptor.records.length} impact visual records (${approved} approved; ${descriptor.records.length - approved} fail closed) at ${OUTPUT_PATH}`);
}

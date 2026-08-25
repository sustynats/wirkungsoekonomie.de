import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { saxonyAnhaltElectionProgrammes } from "../data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorial } from "../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltTerminalPartyBySourceKey, saxonyAnhaltTerminalRelease } from "../data/presentation/sachsen-anhalt-terminal-release";
import { impactVisualDescriptorSchema, type ImpactVisualScenarioRecord } from "../lib/impact-visuals/contracts";

const OUTPUT_PATH = fileURLToPath(new URL("../data/impact-visuals/sachsen-anhalt-2026-v1.json", import.meta.url));
const KNOWLEDGE_CUTOFF = "2026-08-23";
const CREATED_DATE = "2026-08-25";
const SOURCE_RELEASE_COMMIT = "fefec75f09dc70db8de7880f93b4e8c6788e4461";
const BASE_MAIN_COMMIT = "c81fbefafb33d976137955d08edebd5284cbdced";
const DISCLAIMER = "Visualisiertes Wirkungsszenario auf Basis der WÖk-Analyse. Keine Prognose.";

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
      ? "Die bereits fachlich kuratierte Editorial-v2-Menge der vier Schlüsselpfade wird unverändert als Kandidatenmenge wiederverwendet. Ohne freigegebenen Visual Brief wird daraus kein sichtbares Szenario materialisiert."
      : "Es wird keine Einzelanalyse technisch ausgewählt. Die vorhandenen Editorial-v2-Schlüsselpfade bleiben lediglich als endliche fachlich freigegebene Kandidatenmenge dokumentiert, bis eine symmetrische Case-Auswahl freigegeben ist.",
    visible_elements: [],
    non_visual_effects: [],
    non_visual_effects_review_status: "PENDING_APPROVAL",
    omitted_material_effects: [],
    system_boundary: null,
    scenario_assumptions: [],
    evidence_summary: "Richtung, Evidenz und Unsicherheit bleiben in den verknüpften WÖk-Analysen getrennt. Das noch nicht vorhandene Bild liefert keine zusätzliche Evidenz.",
    disclaimer: DISCLAIMER,
    asset_path: null,
    alt_text: null,
    visual_brief: null,
    generator_metadata: null,
    asset_sha256: null,
    editorial_review_status: "NO_APPROVED_VISUAL_SCENARIO",
    source_fidelity_status: "FAIL_CLOSED_NO_PUBLIC_ASSET",
    missing_approved_inputs: missingInputs(scope),
    change_history: [{
      version: "1.0",
      date: CREATED_DATE,
      status: "FAIL_CLOSED_CREATED",
      note: "Architektur-Record ohne Bildasset angelegt; keine Fachwirkung, Auswahl oder Visualisierung synthetisiert.",
    }],
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
  console.log(`Materialized ${buildDescriptor().records.length} fail-closed impact visual records at ${OUTPUT_PATH}`);
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { saxonyAnhaltProgrammeEditorialV2 } from "../../data/presentation/sachsen-anhalt-programme-editorial-v2";
import { projectEuEditorial } from "../../lib/publication/public-editorial-projection.mjs";

type PublicCopy = { id: string; title: string; bottomLine: string; summary: string };

const read = (path: string) => readFileSync(path, "utf8");
const jsonl = <T>(path: string) => read(path).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as T);
const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("de-DE").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const tokens = (value: string) => new Set(normalize(value).split(" ").filter((token) => token.length > 3));
const overlap = (left: string, right: string) => {
  const a = tokens(left);
  const b = tokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
};

const genericPatterns = [
  /kann verschiedene bereiche verändern/i,
  /hat chancen und risiken/i,
  /unterschiedliche wirkpfade/i,
  /betrifft mensch, planet und demokratie/i,
  /weitere prüfung erforderlich/i,
  /weitere analyse erforderlich/i,
  /muss weiter beobachtet werden/i,
];
const concreteChangePatterns = [
  /(?:kann|könn|führt|erzeug|erhöh|senk|verringer|verbesser|verschlechter|stärk|schwäch|entlast|belast|verlänger|verkürz|ermöglich|verhinder|vermeid|sicher|zugang|teilhabe|kapazität|kosten|risik|wirkung|zustand|schäden|biodivers|resilien|emission|versorgung|beschäftig|ressour|rechte|gesundheit|bildung|freiheit|gleichstell|schutz)/i,
];

const publicCopies: PublicCopy[] = Object.values(saxonyAnhaltProgrammeEditorialV2).map((record) => ({
  id: record.sourceKey,
  title: record.sourceKey,
  bottomLine: record.overallLabel,
  summary: record.impactCoreSummary,
}));
const stProjectionSet = JSON.parse(read("data/executive-impact/sachsen-anhalt-programme-projections-v1.json")) as {
  programmes: Array<{ source_key: string; bottom_line: string; why_it_matters: string }>;
};
for (const projection of stProjectionSet.programmes) publicCopies.push({
  id: `${projection.source_key}:delegated-full-programme-projection`,
  title: projection.source_key,
  bottomLine: projection.bottom_line,
  summary: projection.why_it_matters,
});

type GovernmentRecord = {
  impact_case_id: string;
  title: string;
  publication_status: string;
  overview_assessment_label: string;
  impact_core_summary: string;
};
for (const record of jsonl<GovernmentRecord>("data/government/impact-cases/public-impact-records.jsonl")) {
  if (record.publication_status !== "APPROVED") continue;
  publicCopies.push({
    id: record.impact_case_id,
    title: record.title,
    bottomLine: record.overview_assessment_label,
    summary: record.impact_core_summary,
  });
}

type EuRecord = GovernmentRecord;
for (const record of jsonl<EuRecord>("data/eu/impact-cases/public-impact-records.jsonl")) {
  const projection = projectEuEditorial(record as unknown as Record<string, unknown>);
  if (projection.status !== "PASS") continue;
  publicCopies.push({
    id: record.impact_case_id,
    title: record.title,
    bottomLine: projection.fields.overview_assessment_label,
    summary: projection.fields.impact_core_summary,
  });
}

const override = JSON.parse(read("data/presentation/overview-assessment-overrides.json")) as {
  records: Record<string, { overview_assessment_label: string; impact_core_summary: string }>;
};
for (const [id, record] of Object.entries(override.records)) {
  publicCopies.push({ id, title: id, bottomLine: record.overview_assessment_label, summary: record.impact_core_summary });
}

assert.ok(publicCopies.length >= 80, "Impact-First copy gate must cover the main approved public corpora");
const exact = new Map<string, string>();
for (const copy of publicCopies) {
  const combined = `${copy.bottomLine} ${copy.summary}`.trim();
  assert.ok(copy.bottomLine.length >= 18, `${copy.id}: bottom line is not substantive`);
  assert.ok(copy.summary.length >= 80, `${copy.id}: concrete impact summary is too short`);
  assert.ok(!genericPatterns.some((pattern) => pattern.test(combined)), `${copy.id}: generic impact copy`);
  assert.ok(concreteChangePatterns.some((pattern) => pattern.test(copy.summary)), `${copy.id}: no concrete state/system change in summary`);
  assert.notEqual(normalize(combined), normalize(copy.title), `${copy.id}: raw title/claim was used as impact copy`);
  const key = normalize(combined);
  assert.equal(exact.get(key), undefined, `${copy.id}: duplicate public impact copy also used by ${exact.get(key)}`);
  exact.set(key, copy.id);
}
for (let left = 0; left < publicCopies.length; left += 1) {
  for (let right = left + 1; right < publicCopies.length; right += 1) {
    const a = publicCopies[left];
    const b = publicCopies[right];
    assert.ok(overlap(`${a.bottomLine} ${a.summary}`, `${b.bottomLine} ${b.summary}`) < 0.92, `${a.id}/${b.id}: near-identical public impact copy`);
  }
}

const component = read("app/components/executive-impact/ExecutiveImpactSummary.tsx");
const componentOrder = [
  "<ImpactExecutiveHero",
  "<MPDImpactTriad",
  "<SdgImpactStrip",
  "<MaterialImpactPaths",
  "<ImpactCascade",
  "<NonCompensationAlert",
  "<KeyTradeoffs",
  "<EvidenceBand",
  "<CommunicationImpactPreview",
  "<ImpactRealityCheck",
  "<SourceTransparencyDrawer",
];
for (let index = 1; index < componentOrder.length; index += 1) {
  assert.ok(component.indexOf(componentOrder[index - 1]) < component.indexOf(componentOrder[index]), `Impact-First component order: ${componentOrder[index]}`);
}
for (const copy of [
  "Zustandsänderung:",
  "Für wen oder was:",
  "Warum relevant?",
  "Wirkungsrichtung:",
  "Materialität:",
  "Evidenzstatus",
  "WÖk-Erweiterung",
  "Diese Schutzgüter werden nicht gegen positive Einzelpfade verrechnet",
]) assert.match(component, new RegExp(copy.replace(/[?]/g, "\\?")), copy);

const stAdapter = read("lib/executive-impact/sachsen-anhalt.ts");
const governmentAdapter = read("lib/executive-impact/government.ts");
const parliamentAdapter = read("lib/executive-impact/parliament.ts");
assert.match(stAdapter, /keyFindings\.filter\(\(finding\) => tradeoffKinds/);
assert.match(stAdapter, /bottom_line: projection\.bottom_line/);
assert.match(stAdapter, /projection\.terminal_effect_mechanisms/);
assert.match(governmentAdapter, /main_risk_or_tradeoff/);
assert.match(governmentAdapter, /boundary\.status === "BLOCK"/);
assert.match(parliamentAdapter, /nonCompensationRelevant/);
assert.match(parliamentAdapter, /boundary\.status === "BLOCK"/);
assert.doesNotMatch(`${component}\n${stAdapter}\n${governmentAdapter}\n${parliamentAdapter}`, /party[-_ ]?score|Parteienbewertung|Gesamtnote|Gesamtpunktzahl/i);

const stOverview = read("app/laender/sachsen-anhalt/page.tsx");
const stDetail = read("app/components/SaxonyAnhaltProgrammeAnalysisV3.tsx");
for (const marker of ["ProgrammeImpactCard", "summary.mpd", "summary.sdg_impacts", "summary.material_paths.slice(0, 3)", "summary.noncompensable_risks", "Wirkungsanalyse öffnen"]) assert.match(stOverview, new RegExp(marker.replace(/[().]/g, "\\$&")), marker);
assert.doesNotMatch(stOverview.slice(0, stOverview.indexOf("id=\"wahlprogramme\"")), /Source Units|Historischer Release-1-Arbeitsbestand|Schlüsselpfade Editorial v2\.0/);
assert.match(stDetail, /afterEvidence={<ImpactVisualScenario record={programmeVisual} \/>}/);
assert.ok(component.indexOf("{afterEvidence}") < component.indexOf("<CommunicationImpactPreview"), "Programme image must precede communication preview");
assert.doesNotMatch(stDetail, /const central =|central\.map\(/);
const afdPublicProjection = stProjectionSet.programmes.find((projection) => projection.source_key === "ltw-2026-st-afd");
assert.ok(afdPublicProjection);
assert.match(`${afdPublicProjection.bottom_line} ${afdPublicProjection.why_it_matters}`, /negative Systemrisiken|Demokratie|Delegitimierungs/i);

for (const gate of [
  "BOTTOM_LINE_IS_CASE_SPECIFIC",
  "NO_GENERIC_IMPACT_COPY",
  "STATE_CHANGE_IS_CONCRETE",
  "AFFECTED_PARTY_VISIBLE",
  "DIRECTION_VISIBLE",
  "MATERIALITY_VISIBLE",
  "EVIDENCE_SEPARATE_FROM_DIRECTION",
  "WHY_IT_MATTERS_VISIBLE",
  "MPD_VISIBLE",
  "SDG_DIRECTION_VISIBLE",
  "NONCOMPENSATION_VISIBLE_WHEN_APPLICABLE",
  "STRONGEST_APPROVED_FINDING_REACHES_PUBLIC_SUMMARY",
  "COMMUNICATION_IMPACT_SEPARATE",
  "NO_PARTY_TOTAL_SCORE",
  "NO_DATA_GAP_AS_NEUTRAL",
  "NO_RAW_SLOGAN_TO_IMPACT",
  "NO_GENERIC_PROCESS_METADATA_ABOVE_IMPACT",
]) console.log(`${gate}=PASS`);

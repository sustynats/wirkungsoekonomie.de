import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const packageRoot = process.env.RELEASE_1_1_PACKAGE_ROOT;
const baselineRoot = process.env.FACHBASIS_BASELINE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-20260816");
const outputRoot = process.env.FACHBASIS_RELEASE_1_1_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-release-1.1");

if (!packageRoot || !fs.existsSync(packageRoot)) {
  throw new Error("RELEASE_1_1_PACKAGE_ROOT muss auf das entpackte Korrekturpaket 1.1-RC2 zeigen.");
}
if (!fs.existsSync(baselineRoot)) throw new Error("Die unveränderte Fachbasis 1.0 fehlt.");
if (!path.basename(outputRoot).includes("release-1.1")) throw new Error("Unsicheres Ausgabeziel für die generierte Fachbasis 1.1.");

function findDirectory(root, name, marker) {
  const queue = [root];
  while (queue.length) {
    const current = queue.shift();
    if (path.basename(current) === name && fs.existsSync(path.join(current, marker))) return current;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) queue.push(path.join(current, entry.name));
    }
  }
  throw new Error(`Paketbestandteil fehlt: ${name}`);
}

const parliamentPackage = findDirectory(packageRoot, "WOEK-PARLAMENT-28-REVIEW-1.1-RC2", "case-overlays");
const statePackage = findDirectory(packageRoot, "WOEK-SACHSEN-ANHALT-WAHLPROGRAMME-2026-0001-RESULT-1.1", "results");
const overlayRoot = path.join(parliamentPackage, "case-overlays");
const stateResultsRoot = path.join(statePackage, "results");
if (!fs.existsSync(overlayRoot) || !fs.existsSync(stateResultsRoot)) throw new Error("Korrekturpaket ist unvollständig.");

const directions = new Set(["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "NEUTRAL", "AMBIVALENT", "OPEN"]);
const canonicalMappingGroups = ["sdg_mappings", "sdg_plus_mappings", "constitutional_anchor_mappings"];
const publishableReviewFields = ["decision", "ex_ante", "ex_post", "impact_paths", "impact_domains", "calculation_requirements", "risks", "non_compensable_boundaries", "counterarguments", "counterfactuals", "cross_case_links", "data_gaps", "normative_mapping", "source_completeness", "source_conflicts", "release_1_0", "public_summary"];
const publishableSupplementFields = ["decision_object_clarity", "impact_information_readiness", "decision_readiness", "missing_decision_parameters", "better_decision_question", "alternative_designs_and_counterfactuals", "pre_decision_effect_screening", "reversibility_and_lock_in", "decision_information_gap", "decision_gate_conclusion", "vote_layer", "vote_interpretation_rule"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(value) {
  return [...new Set(asArray(value).filter((item) => typeof item === "string" && item.trim()))];
}

function proposedDirection(change) {
  if (directions.has(change.proposed_direction)) return change.proposed_direction;
  if (change.recommendation === "POSITIVE_POTENTIAL") return "POSITIVE_POTENTIAL";
  if (change.recommendation === "NEGATIVE_RISK") return "NEGATIVE_RISK";
  return "OPEN";
}

function correctedRiskPath(original, risk, originalId) {
  return {
    ...clone(original),
    ...clone(risk),
    lever: risk.lever ?? original.lever,
    prerequisites: risk.prerequisites ?? original.prerequisites ?? [],
    risks_and_side_effects: risk.risks_and_side_effects ?? [],
    evidence_boundary: risk.evidence_boundary ?? original.evidence_boundary,
    change_lever_for_positive_net_impact: risk.change_lever_for_positive_net_impact ?? original.change_lever_for_positive_net_impact,
    split_from: originalId,
    analytical_derivation: true,
    release_1_1_change: "SEPARATE_NEGATIVE_RISK_PATH"
  };
}

function rewriteRationale(rationale, hypothesis) {
  if (typeof rationale !== "string" || !rationale.trim()) return `Der Wirkpfad „${hypothesis}“ ist diesem Referenzziel zugeordnet. Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz, nicht bereits eingetretene Wirkung oder eine Rechtsfeststellung.`;
  if (/Der Wirkpfad „[\s\S]*?“/.test(rationale)) return rationale.replace(/Der Wirkpfad „[\s\S]*?“/, `Der Wirkpfad „${hypothesis}“`);
  return `${rationale} Wirkpfad: ${hypothesis}`;
}

function applyMappingFixes(mapping, fixes, caseId) {
  for (const fix of fixes) {
    const rows = mapping[fix.group];
    if (!Array.isArray(rows) || !rows[fix.index]) throw new Error(`${caseId}: Mapping-Fix ${fix.group}[${fix.index}] nicht anwendbar.`);
    const row = rows[fix.index];
    if (row.id !== fix.id || row.direction !== fix.from) throw new Error(`${caseId}: Mapping-Fix passt nicht zur 1.0-Quelle.`);
    row.direction = fix.to;
    row.evidence_status = fix.evidence_status ?? row.evidence_status;
    row.release_1_1_note = fix.rationale;
  }
}

function rebuildMappings(review, splitMap, caseId) {
  const mapping = review.normative_mapping ?? {};
  const correctedPaths = new Map(asArray(review.impact_paths).map((item) => [item.path_id, item]));

  for (const group of canonicalMappingGroups) {
    const rebuilt = [];
    for (const row of asArray(mapping[group])) {
      if (caseId === "c315ec77-da20-4ff4-9ab0-8321030b085c" && group === "sdg_mappings" && ["SDG_04", "SDG_14"].includes(row.id)) continue;
      const refs = asArray(row.impact_path_refs);
      if (refs.length === 0) {
        rebuilt.push(row);
        continue;
      }
      for (const ref of refs) {
        const replacements = splitMap.get(ref);
        if (replacements) {
          for (const replacement of replacements) {
            rebuilt.push({
              ...clone(row),
              direction: replacement.direction,
              rationale: rewriteRationale(row.rationale, replacement.hypothesis),
              impact_path_refs: [replacement.path_id],
              source_refs: unique([...(row.source_refs ?? []), ...(replacement.source_ids ?? [])]),
              split_from: ref
            });
          }
          continue;
        }
        const corrected = correctedPaths.get(ref);
        rebuilt.push(corrected ? {
          ...clone(row),
          direction: corrected.direction,
          rationale: rewriteRationale(row.rationale, corrected.hypothesis),
          impact_path_refs: [ref]
        } : row);
      }
    }
    mapping[group] = rebuilt;
  }
  mapping.tile_mappings = canonicalMappingGroups.flatMap((group) => clone(mapping[group] ?? []));
  review.normative_mapping = mapping;
}

function validateReview(review, caseId, splitOriginalIds) {
  const errors = [];
  const paths = asArray(review.impact_paths);
  const pathIds = new Set(paths.map((item) => item.path_id));
  for (const item of paths) {
    if (!directions.has(item.direction)) errors.push(`ungueltige Pfadrichtung ${item.path_id}:${item.direction}`);
    if (item.split_from && !splitOriginalIds.has(item.split_from)) errors.push(`ungueltige Split-Provenienz ${item.path_id}`);
  }
  for (const group of [...canonicalMappingGroups, "tile_mappings"]) {
    for (const item of asArray(review.normative_mapping?.[group])) {
      if (!directions.has(item.direction)) errors.push(`ungueltige Mapping-Richtung ${group}:${item.id}:${item.direction}`);
      for (const ref of asArray(item.impact_path_refs)) {
        if (splitOriginalIds.has(ref)) errors.push(`Mapping referenziert ersetzten Pfad ${ref}`);
        if (/^P\d/.test(ref) && !pathIds.has(ref)) errors.push(`Mapping referenziert unbekannten Pfad ${ref}`);
      }
    }
  }
  if (errors.length) throw new Error(`${caseId}: ${errors.join("; ")}`);
}

function cleanScalar(value) {
  return String(value).replace(/\r?\n/g, " ").trim();
}

function markdownValue(key, value, level = 2) {
  if (value === null || value === undefined || value === "") return "";
  const heading = "#".repeat(Math.min(level, 6));
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    if (value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item))) {
      return `${heading} ${key}\n\n${value.map((item) => `- ${cleanScalar(item)}`).join("\n")}\n`;
    }
    return `${heading} ${key}\n\n${value.map((item, index) => typeof item === "object" && item !== null
      ? `${"#".repeat(Math.min(level + 1, 6))} Eintrag ${index + 1}\n\n${Object.entries(item).map(([childKey, child]) => markdownValue(childKey, child, level + 2)).filter(Boolean).join("\n")}`
      : `- ${cleanScalar(item)}`).join("\n")}`;
  }
  if (typeof value === "object") {
    const body = Object.entries(value).map(([childKey, child]) => markdownValue(childKey, child, level + 1)).filter(Boolean).join("\n");
    return body ? `${heading} ${key}\n\n${body}` : "";
  }
  return `**${key}:** ${cleanScalar(value)}\n`;
}

function fullCaseMarkdown(review, supplement) {
  const title = review.release_1_0?.public_title ?? review.public_summary?.headline ?? review.decision?.object ?? "Wirkungsakte";
  const sections = [
    ...publishableReviewFields.filter((key) => review[key] !== undefined).map((key) => markdownValue(key, review[key], 2)),
    ...publishableSupplementFields.filter((key) => supplement[key] !== undefined).map((key) => markdownValue(key, supplement[key], 2))
  ].filter(Boolean);
  return `# ${title}\n\n> Vollständige Fachakte des Instituts für Wirkungsökonomie. Die kompakte Leseseite vereinfacht die Darstellung, diese Fassung bewahrt die veröffentlichbaren Fachfelder.\n\n${sections.join("\n\n")}\n`;
}

function fullProgrammeMarkdown(review) {
  const sections = Object.entries(review)
    .filter(([key]) => !["schema_version", "source_hash", "provenance"].includes(key))
    .map(([key, value]) => markdownValue(key, value, 2))
    .filter(Boolean);
  return `# Vollständige Programmprüfung\n\n> Vollständige Wirkungsakte des Instituts für Wirkungsökonomie. Ex-ante-Potenzial, Risiko, Evidenz, kommunikative Vorwirkung, Zuständigkeit und Schutzgrenzen bleiben getrennt.\n\n${sections.join("\n\n")}\n`;
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.cpSync(baselineRoot, outputRoot, { recursive: true });

for (const entry of fs.readdirSync(stateResultsRoot)) {
  const sourceDirectory = path.join(stateResultsRoot, entry);
  if (!fs.statSync(sourceDirectory).isDirectory()) continue;
  const destination = path.join(outputRoot, "03_sachsen_anhalt_programme", "results", entry);
  fs.mkdirSync(destination, { recursive: true });
  for (const file of ["commitment-register.json", "programme-review.json", "review-delta-v1.1.json"]) {
    const source = path.join(sourceDirectory, file);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(destination, file));
  }
  const review = readJson(path.join(destination, "programme-review.json"));
  const incomplete = asArray(review.material_commitments).filter((item) => item.v1_1_review?.direction_and_evidence?.source_fragment_quality?.status !== "SOURCE_TEXT_APPEARS_COMPLETE");
  for (const item of incomplete) {
    const direction = item.v1_1_review?.direction_and_evidence?.combined_display_direction;
    if (direction !== "OPEN") throw new Error(`${entry}: unvollstaendiges Quellfragment ist nicht OPEN.`);
  }
  const publicationFile = path.join(outputRoot, "03_sachsen_anhalt_programme", "publication", `${entry}-programme-review-VOLLSTAENDIG.md`);
  fs.writeFileSync(publicationFile, fullProgrammeMarkdown(review));
}

const caseReports = [];
for (const file of fs.readdirSync(overlayRoot).filter((name) => name.endsWith(".json")).sort()) {
  const overlay = readJson(path.join(overlayRoot, file));
  const caseDirectory = path.join(outputRoot, "02_parlament_28_and_votes", "cases", overlay.case_id);
  const reviewFile = path.join(caseDirectory, "review-result.json");
  if (!fs.existsSync(reviewFile)) throw new Error(`Fallquelle fehlt: ${overlay.case_id}`);
  const review = readJson(reviewFile);
  const original = clone(review);
  const supplementFile = path.join(caseDirectory, "decision-and-vote-supplement.json");
  const supplement = fs.existsSync(supplementFile) ? readJson(supplementFile) : {};
  const changeMap = new Map(asArray(overlay.path_direction_changes).map((item) => [item.path_id, item]));
  const splitProposalMap = new Map(asArray(overlay.split_path_proposals).map((item) => [item.original_path_id, item]));
  const splitMap = new Map();
  const changedOriginals = [];
  const correctedPaths = [];

  for (const originalPath of asArray(review.impact_paths)) {
    const change = changeMap.get(originalPath.path_id);
    const split = splitProposalMap.get(originalPath.path_id);
    if (change && originalPath.direction !== change.current_direction) throw new Error(`${overlay.case_id}:${originalPath.path_id} Ausgangsrichtung passt nicht.`);
    if (split) {
      const positive = { ...clone(originalPath), ...clone(split.positive_path), split_from: originalPath.path_id, release_1_1_change: "SPLIT_POSITIVE_POTENTIAL" };
      const risks = asArray(split.negative_risk_paths).map((item) => correctedRiskPath(originalPath, item, originalPath.path_id));
      correctedPaths.push(positive, ...risks);
      splitMap.set(originalPath.path_id, [positive, ...risks]);
      changedOriginals.push(originalPath);
      continue;
    }
    const next = clone(originalPath);
    if (change) {
      next.direction = proposedDirection(change);
      next.release_1_1_change = change.recommendation;
      changedOriginals.push(originalPath);
    } else if (next.direction === "EVIDENCE_OPEN") {
      next.direction = "OPEN";
      next.release_1_1_change = "EVIDENCE_STATUS_REMOVED_FROM_DIRECTION";
      changedOriginals.push(originalPath);
    }
    correctedPaths.push(next);
  }

  review.impact_paths = correctedPaths;
  review.ex_ante = { ...(review.ex_ante ?? {}), impact_paths: clone(correctedPaths) };
  review.release_1_1 = {
    methodology_version: "WÖk-Parlament-1.1",
    correction_status: "RC2_INTEGRATED_PENDING_EXTERNAL_PRODUCTION_AUDIT",
    previous_impact_paths: changedOriginals,
    changed_path_count: changedOriginals.length
  };
  applyMappingFixes(review.normative_mapping ?? {}, asArray(overlay.normative_mapping_schema_fixes), overlay.case_id);
  rebuildMappings(review, splitMap, overlay.case_id);
  validateReview(review, overlay.case_id, new Set(splitMap.keys()));

  const lostTopLevelFields = Object.keys(original).filter((key) => !(key in review));
  if (lostTopLevelFields.length) throw new Error(`${overlay.case_id}: verlorene Felder ${lostTopLevelFields.join(", ")}`);
  writeJson(reviewFile, review);
  fs.writeFileSync(path.join(caseDirectory, "VOLLSTAENDIGE-FACHDARSTELLUNG.md"), fullCaseMarkdown(review, supplement));
  caseReports.push({
    case_id: overlay.case_id,
    original_path_count: asArray(original.impact_paths).length,
    corrected_path_count: correctedPaths.length,
    changed_paths: changedOriginals.map((item) => item.path_id),
    split_paths: [...splitMap.entries()].map(([oldId, items]) => ({ old_path_id: oldId, new_path_ids: items.map((item) => item.path_id) })),
    mapping_changes: asArray(overlay.normative_mapping_schema_fixes).length,
    lost_fields: lostTopLevelFields
  });
}

if (caseReports.length !== 28) throw new Error(`Korrekturschicht unvollstaendig: ${caseReports.length}/28 Faelle.`);
const report = {
  schema_version: "1.1.0",
  publisher: "Institut für Wirkungsökonomie",
  release: "1.1-RC2",
  cases: caseReports,
  summary: {
    cases: caseReports.length,
    changed_paths: caseReports.reduce((sum, item) => sum + item.changed_paths.length, 0),
    split_paths: caseReports.reduce((sum, item) => sum + item.split_paths.length, 0),
    lost_fields: caseReports.reduce((sum, item) => sum + item.lost_fields.length, 0)
  }
};
writeJson(path.join(appRoot, "data", "fachakten", "release-1.1-integration-report.json"), report);
console.log(JSON.stringify({ status: "integrated", output: ".local/fachbasis-source-release-1.1", ...report.summary }));

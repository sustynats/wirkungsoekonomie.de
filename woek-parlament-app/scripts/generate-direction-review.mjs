import fs from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const sourceRoot = process.env.FACHBASIS_SOURCE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-20260816");
const casesRoot = path.join(sourceRoot, "02_parlament_28_and_votes", "cases");
const outputPath = path.join(appRoot, "data", "fachakten", "direction-review.json");

function list(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function mappingTargets(review, pathId) {
  const mapping = review.normative_mapping ?? {};
  const collections = [mapping.sdg_mappings, mapping.sdg_plus_mappings, mapping.constitutional_anchor_mappings];
  return [...new Set(collections.flatMap(list)
    .filter((entry) => list(entry?.impact_path_refs).includes(pathId))
    .map((entry) => text(entry?.id))
    .filter(Boolean))];
}

const rows = [];
for (const caseDirectory of fs.readdirSync(casesRoot).sort()) {
  const reviewPath = path.join(casesRoot, caseDirectory, "review-result.json");
  if (!fs.existsSync(reviewPath)) continue;
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  const title = text(review.release_1_0?.public_title) || text(review.decision?.object) || caseDirectory;
  const paths = list(review.ex_ante?.impact_paths).length ? list(review.ex_ante.impact_paths) : list(review.impact_paths);
  for (const impactPath of paths) {
    const pathId = text(impactPath.path_id);
    const hypothesis = text(impactPath.hypothesis);
    const direction = text(impactPath.direction);
    const issueFlags = [];
    if (direction === "AMBIVALENT" && /Richtung(?: und Groessenordnung| und Größenordnung)? (?:sind|ist).*offen|Richtung.*nicht.*bestimmbar/i.test(hypothesis)) {
      issueFlags.push("OPEN_HYPOTHESIS_WITH_AMBIVALENT_CODE");
    }
    if (title === "Bundeshaushalt 2027" && /^P(?:[1-9]|1[01])$/.test(pathId)) {
      issueFlags.push("DIRECTION_RATIONALE_REQUIRED");
    }
    rows.push({
      case_id: caseDirectory,
      public_title: title,
      path_id: pathId,
      hypothesis,
      current_direction: direction,
      direction_rationale: text(impactPath.direction_rationale) || null,
      risks: list(impactPath.risks_and_side_effects).map(text).filter(Boolean),
      mapping_targets: mappingTargets(review, pathId),
      proposed_issue_flags: issueFlags,
      review_status: issueFlags.length ? "METHOD_REVIEW_REQUIRED" : "NOT_FLAGGED_BY_TECHNICAL_LINT"
    });
  }
}

const counts = rows.reduce((result, row) => {
  result[row.current_direction] = (result[row.current_direction] ?? 0) + 1;
  return result;
}, {});
const result = {
  schema_version: "1.0",
  generated_from: "authoritative-release-1.0",
  rule: "Technical lint only. No direction value was changed.",
  total_paths: rows.length,
  direction_counts: counts,
  flagged_paths: rows.filter((row) => row.proposed_issue_flags.length).length,
  rows
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: "generated", totalPaths: rows.length, flaggedPaths: result.flagged_paths, directionCounts: counts }));

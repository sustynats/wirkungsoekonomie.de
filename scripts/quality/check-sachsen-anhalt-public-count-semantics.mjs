import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const landingPagePath = path.join(
  process.cwd(),
  "woek-parlament-app",
  "app",
  "laender",
  "sachsen-anhalt",
  "page.tsx",
);
const programmeRendererPath = path.join(
  process.cwd(),
  "woek-parlament-app",
  "app",
  "components",
  "SaxonyAnhaltProgrammeAnalysisV3.tsx",
);

const landingSource = fs.readFileSync(landingPagePath, "utf8");
const programmeSource = fs.readFileSync(programmeRendererPath, "utf8");
const allPublicSources = `${landingSource}\n${programmeSource}`;

const forbiddenWhileDenominatorOpen = [
  "fachlich analysierte Zusageeinheiten",
  "vollständige Quellen- und Fachdatensätze",
  "Das vollständige Register bleibt erhalten",
  "Vollständiges Zusageregister öffnen",
];

const requiredWhileDenominatorOpen = [
  "Zusageeinheiten im aktuellen Quellenregister",
  "Primärquellen-Paritätsabgleich und Editorial-v2+-Vollreaudit laufen",
  "der finale Nenner ist noch nicht eingefroren",
  "finale Source-Unit-Manifest",
];

const failures = [];

for (const phrase of forbiddenWhileDenominatorOpen) {
  if (allPublicSources.includes(phrase)) {
    failures.push(`forbidden unresolved-parity completion wording: ${phrase}`);
  }
}

for (const phrase of requiredWhileDenominatorOpen) {
  if (!allPublicSources.includes(phrase)) {
    failures.push(`missing unresolved-parity public wording: ${phrase}`);
  }
}

if (failures.length > 0) {
  console.error("Sachsen-Anhalt public count semantics gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Sachsen-Anhalt public count semantics gate PASS: working-register counts and programme source lists are not presented as final Fach/source-corpus completeness while primary-source parity/final manifest remain unresolved.",
);

// Temporary PR270 execution harness: source-role mechanics only. The normal public-count
// gate above remains unchanged. This block executes the already committed BSW convergence
// auditors on GitHub Actions so their exact finite blocker set is visible without creating
// any Fach/DNS/Recommendation semantics. Remove after convergence data are harvested.
if (process.env.GITHUB_ACTIONS === "true") {
  const tmpDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(tmpDir, { recursive: true });
  const collisionPath = path.join(tmpDir, "bsw-final-union-collision-report.json");
  const candidatePath = path.join(tmpDir, "bsw-final-union-manifest-r15.json");

  const audit = spawnSync(
    "python",
    ["tools/audit_bsw_final_union.py", "--output", collisionPath],
    { encoding: "utf8" },
  );
  process.stdout.write(audit.stdout || "");
  process.stderr.write(audit.stderr || "");
  if (audit.status !== 0) {
    console.error(`BSW_FINAL_UNION_AUDIT_EXIT=${audit.status}`);
    process.exit(audit.status ?? 1);
  }

  const collision = JSON.parse(fs.readFileSync(collisionPath, "utf8"));
  const scan = collision.pending_collision_scan ?? {};
  console.log(`BSW_COLLISION_PENDING_TOTAL=${scan.pending_total}`);
  console.log(`BSW_COLLISION_LEXICALLY_CLEAR=${scan.lexically_clear_no_candidate}`);
  console.log(`BSW_COLLISION_REVIEW_CANDIDATE_COUNT=${scan.review_candidate_count}`);
  console.log(`BSW_COLLISION_REVIEW_CANDIDATE_ORDINALS=${(scan.review_candidate_ordinals ?? []).join(",")}`);
  for (const row of scan.rows ?? []) {
    if (String(row.candidate_status ?? "").startsWith("REVIEW")) {
      console.log(`BSW_COLLISION_ROW=${JSON.stringify(row)}`);
    }
  }

  const materialize = spawnSync(
    "python",
    [
      "tools/materialize_bsw_final_union_manifest.py",
      "--collision-report", collisionPath,
      "--relations", "content/audits/sachsen-anhalt/bsw-final-union-relation-registry-r15.json",
      "--output", candidatePath,
      "--allow-default-pend-keep-atomic",
    ],
    { encoding: "utf8" },
  );
  process.stdout.write(materialize.stdout || "");
  process.stderr.write(materialize.stderr || "");
  if (fs.existsSync(candidatePath)) {
    const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
    console.log(`BSW_CANDIDATE_COUNTS=${JSON.stringify(candidate.counts ?? {})}`);
    console.log(`BSW_CANDIDATE_GRAPH=${JSON.stringify(candidate.relation_graph ?? {})}`);
    console.log(`BSW_CANDIDATE_COLLISION=${JSON.stringify(candidate.collision_scan ?? {})}`);
    console.log(`BSW_CANDIDATE_GAPS=${JSON.stringify(candidate.resolved_gap_counts ?? {})}`);
    console.log(`BSW_CANDIDATE_FACH_SET=${JSON.stringify(candidate.active_leaf_terminal_fach_set_check ?? {})}`);
    console.log(`BSW_CANDIDATE_241_SET=${JSON.stringify(candidate.active_leaf_241_layer_set_check ?? {})}`);
    console.log(`BSW_CANDIDATE_COMPLETION=${JSON.stringify(candidate.completion ?? {})}`);
  }
  // Deliberately do not fail the public semantics job on convergence blockers: they are
  // printed as an exact finite remediation list, while the PR remains draft/fail-closed.
}

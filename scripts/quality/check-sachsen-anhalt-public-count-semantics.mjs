import fs from "node:fs";
import path from "node:path";

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
const terminalReleasePath = path.join(
  process.cwd(),
  "woek-parlament-app",
  "data",
  "fachakten",
  "source-manifests",
  "sachsen-anhalt",
  "ltw-2026-st-six-party-terminal-release-v1.json",
);

const landingSource = fs.readFileSync(landingPagePath, "utf8");
const programmeSource = fs.readFileSync(programmeRendererPath, "utf8");
const allPublicSources = `${landingSource}\n${programmeSource}`;
const terminalRelease = JSON.parse(fs.readFileSync(terminalReleasePath, "utf8"));

const forbiddenStaleConvergenceWording = [
  "Zusageeinheiten im aktuellen Quellenregister",
  "Primärquellen-Paritätsabgleich und Editorial-v2+-Vollreaudit laufen",
  "der finale Nenner ist noch nicht eingefroren",
  "finale Source-Unit-Parität offen",
  "das finale Source-Unit-Manifest und der endgültige Nenner sind noch nicht eingefroren",
];

const requiredTerminalWording = [
  "Terminaler Quellen- und Fachstand · 6/6",
  "volle Primärquellen-Parität",
  "autoritative Source Units",
  "Wirkungsmechanismen",
  "Historischer Release-1-Arbeitsbestand",
  "getrennte Zähldimension",
];

const failures = [];

for (const phrase of forbiddenStaleConvergenceWording) {
  if (allPublicSources.includes(phrase)) {
    failures.push(`forbidden stale convergence wording: ${phrase}`);
  }
}

for (const phrase of requiredTerminalWording) {
  if (!allPublicSources.includes(phrase)) {
    failures.push(`missing terminal public wording: ${phrase}`);
  }
}

if (terminalRelease.status !== "TERMINAL_6_OF_6" || terminalRelease.terminal_party_count !== 6) {
  failures.push("terminal descriptor does not report exactly 6/6 programmes");
}
if (terminalRelease.historical_working_register?.count !== 2921) {
  failures.push("historical Release-1 working dimension is not exactly 2,921");
}
if (terminalRelease.authoritative_totals?.source_units !== 5403) {
  failures.push("authoritative source-unit total is not exactly 5,403");
}
if (terminalRelease.authoritative_totals?.effect_mechanisms !== 5308) {
  failures.push("authoritative effect-mechanism total is not exactly 5,308");
}
if (terminalRelease.authoritative_totals?.non_effect_source_leaves !== 95) {
  failures.push("authoritative non-effect source-leaf total is not exactly 95");
}
if (terminalRelease.publication_integrity?.unrendered_content_paths?.length !== 0) {
  failures.push("terminal descriptor contains unrendered public content paths");
}

if (failures.length > 0) {
  console.error("Sachsen-Anhalt public count semantics gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Sachsen-Anhalt public count semantics gate PASS: 6/6 terminal source/effect counts are projected while the 2,921-entry historical Release-1 working dimension remains explicit and separate.",
);

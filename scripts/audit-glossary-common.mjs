import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs");
fs.mkdirSync(docsDir, { recursive: true });

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch {
    return fallback;
  }
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function terms() {
  return (
    readJson("content/glossary/terms.json", { terms: [] }).terms ||
    readJson("public/data/glossary.terms.json", { terms: [] }).terms ||
    []
  );
}

function hoverTerms() {
  const file = path.join(root, "assets/js/glossaryTerms.js");
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/window\.WIRKUNG_GLOSSARY_TERMS\s*=\s*(\[[\s\S]*\]);?\s*$/);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function detailFileFor(route) {
  const normalized = String(route || "").replace(/^\/+/, "").replace(/\/$/, "");
  return path.join(root, normalized, "index.html");
}

function writeDoc(name, title, lines) {
  const body = [`# ${title}`, "", `Stand: ${new Date().toISOString()}`, "", ...lines, ""].join("\n");
  fs.writeFileSync(path.join(docsDir, name), body);
}

export function auditRoutes({ fail = true } = {}) {
  const data = terms();
  const missing = data.filter((term) => !fs.existsSync(detailFileFor(term.detailPath || `/begriffe/${term.slug}/`)));
  const hubAnchors = data.filter((term) => String(term.detailPath || "").includes("#"));
  const lines = [
    `- Begriffe im Modell: ${data.length}`,
    `- Fehlende Detailseiten: ${missing.length}`,
    `- Hub-/Anker-Ziele statt Detailroute: ${hubAnchors.length}`,
    "",
    "## Fehlende Detailseiten",
    ...(missing.length ? missing.slice(0, 200).map((term) => `- ${term.slug}: ${term.detailPath}`) : ["Keine."]),
    "",
    "## Anker-Ziele",
    ...(hubAnchors.length ? hubAnchors.map((term) => `- ${term.slug}: ${term.detailPath}`) : ["Keine."]),
  ];
  writeDoc("glossary-route-audit.md", "Glossary Route Audit", lines);
  if (fail && (missing.length || hubAnchors.length)) process.exitCode = 1;
  return { terms: data.length, missing: missing.length, hubAnchors: hubAnchors.length };
}

export function auditHover({ fail = true } = {}) {
  const hovers = hoverTerms();
  const missingDefinition = hovers.filter((term) => !String(term.definition || "").trim());
  const missingDetail = hovers.filter((term) => !fs.existsSync(detailFileFor(term.url)));
  const overlong = hovers.filter((term) => String(term.definition || "").length > 220);
  const lines = [
    `- Hover-Einträge: ${hovers.length}`,
    `- Ohne Definition: ${missingDefinition.length}`,
    `- Ohne Detailseite: ${missingDetail.length}`,
    `- Definitionen über 220 Zeichen: ${overlong.length}`,
    "",
    "## Ohne Detailseite",
    ...(missingDetail.length ? missingDetail.slice(0, 200).map((term) => `- ${term.key}: ${term.url}`) : ["Keine."]),
  ];
  writeDoc("glossary-hover-audit.md", "Glossary Hover Audit", lines);
  if (fail && (missingDefinition.length || missingDetail.length)) process.exitCode = 1;
  return { hovers: hovers.length, missingDefinition: missingDefinition.length, missingDetail: missingDetail.length };
}

export function auditCrosslinks() {
  const data = terms();
  const slugSet = new Set(data.map((term) => term.slug));
  const missingRelatedTerms = [];
  let relatedTermCount = 0;
  let relatedDocumentCount = 0;
  let relatedMethodCount = 0;
  let relatedDemoCount = 0;
  let relatedImpactFieldCount = 0;
  for (const term of data) {
    for (const related of term.relatedTerms || []) {
      relatedTermCount += 1;
      if (!slugSet.has(related)) missingRelatedTerms.push([term.slug, related]);
    }
    relatedDocumentCount += (term.relatedDocuments || []).length;
    relatedMethodCount += (term.relatedMethods || []).length + (term.relatedTools || []).length;
    relatedDemoCount += (term.relatedDemos || []).length;
    relatedImpactFieldCount += (term.relatedImpactFields || []).length;
  }
  writeDoc("glossary-crosslink-audit.md", "Glossary Crosslink Audit", [
    `- relatedTerms: ${relatedTermCount}`,
    `- relatedDocuments: ${relatedDocumentCount}`,
    `- relatedMethods/Tools: ${relatedMethodCount}`,
    `- relatedDemos: ${relatedDemoCount}`,
    `- relatedImpactFields: ${relatedImpactFieldCount}`,
    `- Related-Terms ohne Zielbegriff: ${missingRelatedTerms.length}`,
    "",
    "## Fehlende relatedTerms-Ziele",
    ...(missingRelatedTerms.length
      ? missingRelatedTerms.slice(0, 250).map(([source, target]) => `- ${source} -> ${target}`)
      : ["Keine."]),
  ]);
  return { relatedTermCount, relatedDocumentCount, relatedMethodCount, relatedDemoCount, relatedImpactFieldCount };
}

export function auditCoverage() {
  const htmlFiles = walk(root).filter((file) => {
    const relative = rel(file);
    return (
      file.endsWith(".html") &&
      !relative.includes("node_modules/") &&
      !relative.startsWith(".codex-backup/") &&
      !/ \d+\.html$/.test(relative)
    );
  });
  const pagesWithGlossaryLinks = [];
  const pagesWithHoverData = [];
  const brokenGlossaryLinks = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const matches = [...html.matchAll(/href=["']([^"']*\/begriffe\/[^"']*)["']/g)].map((match) => match[1]);
    if (matches.length) pagesWithGlossaryLinks.push([rel(file), matches.length]);
    if (/glossary-tooltip|data-glossary|term-chip|WIRKUNG_GLOSSARY_TERMS/.test(html)) pagesWithHoverData.push(rel(file));
    for (const href of matches) {
      if (/^https?:/.test(href)) continue;
      const noHash = href.split("#")[0].split("?")[0];
      if (!noHash) continue;
      const target = noHash.startsWith("/")
        ? path.join(root, noHash.replace(/^\/+/, ""), noHash.endsWith("/") ? "index.html" : "")
        : path.resolve(path.dirname(file), noHash.endsWith("/") ? `${noHash}index.html` : noHash);
      if (!fs.existsSync(target)) brokenGlossaryLinks.push([rel(file), href]);
    }
  }
  writeDoc("glossary-coverage-report.md", "Glossary Coverage Report", [
    `- HTML-Seiten gescannt: ${htmlFiles.length}`,
    `- Seiten mit /begriffe/-Links: ${pagesWithGlossaryLinks.length}`,
    `- Seiten mit Glossar-/Term-Markup: ${pagesWithHoverData.length}`,
    `- Tote Glossarlinks: ${brokenGlossaryLinks.length}`,
    "",
    "## Seiten mit den meisten Glossarlinks",
    ...pagesWithGlossaryLinks
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([file, count]) => `- ${file}: ${count}`),
    "",
    "## Tote Glossarlinks",
    ...(brokenGlossaryLinks.length ? brokenGlossaryLinks.slice(0, 200).map(([file, href]) => `- ${file}: ${href}`) : ["Keine."]),
  ]);
  if (brokenGlossaryLinks.length) process.exitCode = 1;
  return { htmlFiles: htmlFiles.length, pagesWithGlossaryLinks: pagesWithGlossaryLinks.length, brokenGlossaryLinks: brokenGlossaryLinks.length };
}

export function auditRegression({ fail = true } = {}) {
  const baseline = readJson("docs/glossary-graph-baseline.json", { terms: [] });
  const data = terms();
  const hovers = hoverTerms();
  const detailPages = walk(path.join(root, "begriffe")).filter((file) => file.endsWith("/index.html"));
  const baselineTerms = baseline.terms?.length || 0;
  const failures = [];
  if (data.length < baselineTerms) failures.push(`Term count ${data.length} < baseline ${baselineTerms}`);
  if (detailPages.length < baselineTerms) failures.push(`Detail pages ${detailPages.length} < baseline terms ${baselineTerms}`);
  if (hovers.length < baselineTerms) failures.push(`Hover definitions ${hovers.length} < baseline ${baselineTerms}`);
  writeDoc("glossary-regression-report.md", "Glossary Regression Report", [
    `- Baseline-Begriffe: ${baselineTerms}`,
    `- Aktuelle Begriffe: ${data.length}`,
    `- Aktuelle Detailseiten: ${detailPages.length}`,
    `- Aktuelle Hover-Einträge: ${hovers.length}`,
    `- Ergebnis: ${failures.length ? "FAIL" : "OK"}`,
    "",
    "## Fehler",
    ...(failures.length ? failures.map((item) => `- ${item}`) : ["Keine."]),
  ]);
  if (fail && failures.length) process.exitCode = 1;
  return { baselineTerms, terms: data.length, detailPages: detailPages.length, hovers: hovers.length, failures };
}

export function runAudit(mode) {
  if (mode === "routes") return auditRoutes();
  if (mode === "hover") return auditHover();
  if (mode === "crosslinks") return auditCrosslinks();
  if (mode === "coverage") return auditCoverage();
  if (mode === "regression") return auditRegression();
  throw new Error(`Unknown glossary audit mode: ${mode}`);
}

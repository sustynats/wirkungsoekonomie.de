#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const scope = process.argv.find((arg) => arg.startsWith("--scope="))?.slice("--scope=".length) ?? "repository";
const roots = scope === "release"
  ? ["public", ".next/static"]
  : ["app", "data", "lib", "scripts", "supabase", "tests", ".env.example", "package.json", "next.config.ts"];
const ignoredDirectories = new Set(["node_modules", ".git", ".next", ".local", ".temp", "tmp"]);
const ignoredExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".zip", ".docx", ".xlsx", ".pptx", ".woff", ".woff2"]);
const safetyImplementationFiles = new Set([
  "lib/review/privacy.ts",
  "scripts/quality/check-release-safety.mjs",
  // This validator must name the forbidden TODO token in its mutation rule;
  // it is executable gate code, never a public content artifact.
  "scripts/quality/check-berlin-bsw-full-programme.mjs",
  "scripts/quality/verify-public-documents.mjs",
  "scripts/import-release-1-fachbasis.mjs",
  "scripts/sync-approved-government-impact-cases.mjs",
  "scripts/sync-approved-parliament-daily.mjs"
]);
const unsafePatterns = [
  // Require a local-path boundary so an official web route such as
  // https://www.landtag.nrw.de/home/dokumente/... is not read as /home/<user>.
  { label: "local-user-path", pattern: /(?:^|["'\s])\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/i },
  { label: "local-volume-path", pattern: /\/Volumes\/[A-Za-z0-9._-]+(?:\/|$)/ },
  { label: "windows-user-path", pattern: /(?:[A-Z]:\\|\\\\[^\\]+\\)(?:Users|Dokumente|Documents)\\/i },
  { label: "local-file-uri", pattern: /file:\/\/(?!\/ROOT(?:\/|$))(?:\/|localhost)/i },
  { label: "review-provider-reference", pattern: new RegExp([["chat", "gpt"].join(""), ["cl", "aude"].join(""), ["open", "ai"].join(""), "anthropic", "copilot"].join("|"), "i") },
  { label: "ai-assistance-reference", pattern: /(?:sprachmodell|language model|large language model|generative ai|generative ki|ai-assisted|ai-generated|ki-(?:unterstützt|erzeugt|generiert|erstellt)|modellgeneriert)/i },
  { label: "internal-editorial-note", pattern: /(?:interne?[nr]?|internal)(?:\s+only)?\s+(?:redaktions?|editorial(?:e[nr]?)?)\s*(?:notiz|hinweis|kommentar)/i },
  { label: "do-not-publish-marker", pattern: /(?:nicht\s+(?:veröffentlichen|publizieren)|not\s+for\s+publication|do\s+not\s+publish)/i },
  { label: "development-placeholder", pattern: /(?:\b(?:todo|fixme|debug)\b|lorem ipsum|test(?:ing)?\s+only|placeholder\s+(?:content|text)|dummy\s+(?:content|text|data))/i }
];

function collect(target) {
  if (!fs.existsSync(target)) return [];
  const stats = fs.statSync(target);
  if (stats.isFile()) {
    const normalized = target.split(path.sep).join("/");
    if (scope !== "release" && safetyImplementationFiles.has(normalized)) return [];
    return ignoredExtensions.has(path.extname(target).toLowerCase()) ? [] : [target];
  }
  const items = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    items.push(...collect(path.join(target, entry.name)));
  }
  return items;
}

function contentForRule(file, content, ruleLabel) {
  if (ruleLabel !== "ai-assistance-reference") return content;
  const sourceFaithfulCorpus = file.startsWith(`data${path.sep}fachakten${path.sep}`)
    // These immutable ledgers quote exact election-programme objects. Political
    // source text can legitimately discuss KI-generated media; only the
    // production-method wording rule is skipped. Provider, path, placeholder
    // and every other safety rule continue to scan the files.
    || file.startsWith(`data${path.sep}state-programmes${path.sep}fach-reviews${path.sep}`)
    || [
      `data${path.sep}generated${path.sep}release-1${path.sep}commitment-registers.json`,
      `data${path.sep}generated${path.sep}release-1${path.sep}sachsen-anhalt-commitment-registers.json`,
      `data${path.sep}generated${path.sep}release-1${path.sep}sachsen-anhalt-programme-reviews.json`,
      // Exact source-bound commitments can legitimately concern AI instruments;
      // this exemption applies only to the AI-assistance wording rule. Provider,
      // path, placeholder and every other public-safety rule remain active.
      `data${path.sep}states${path.sep}baden-wuerttemberg-coalition-commitments.json`,
      `data${path.sep}states${path.sep}rheinland-pfalz-coalition-commitments.json`
    ].includes(file);
  if (sourceFaithfulCorpus) return "";

  // Public RecommendationRecords may themselves analyse a political AI instrument.
  // Only the specific, fach-approved AI-migration record is exempted from the
  // production-method wording detector. Provider names and every other safety
  // rule remain active, and all other recommendation records remain scanned.
  const recommendationFile = `data${path.sep}recommendations${path.sep}public${path.sep}recommendations.jsonl`;
  if (file === recommendationFile) {
    return content
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => {
        try {
          const record = JSON.parse(line);
          return record.impact_case_id !== "WOEK-IMPACT-BUND-KI-MIGRATION-2026";
        } catch {
          return true;
        }
      })
      .join("\n");
  }
  return content;
}

const findings = [];
for (const root of roots) {
  for (const file of collect(root)) {
    if (/^\.env(?:\.|$)/.test(path.basename(file)) && path.basename(file) !== ".env.example") {
      findings.push(`private-environment-file: ${file}`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    for (const rule of unsafePatterns) {
      const scanned = contentForRule(file, content, rule.label);
      if (scanned && rule.pattern.test(scanned)) findings.push(`${rule.label}: ${file}`);
    }
  }
}

if (findings.length) {
  console.error("Privacy release gate failed. Remove the reported value or exclude the artifact from publication:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`Privacy release gate passed for ${scope}.`);
process.exit(0);

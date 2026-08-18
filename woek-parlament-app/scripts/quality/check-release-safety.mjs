#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const scope = process.argv.find((arg) => arg.startsWith("--scope="))?.slice("--scope=".length) ?? "repository";
// Only browser-delivered assets are release artifacts. Next's server bundle is
// executed inside the hosting runtime; it is never served as a public file and
// necessarily contains build-machine paths for module resolution. Public HTML
// is covered through its source inputs in the repository gate and again by
// the post-deployment response probe.
const roots = scope === "release"
  ? ["public", ".next/static"]
  : ["app", "data", "lib", "scripts", "supabase", "tests", ".env.example", "package.json", "next.config.ts"];
// Tool state and protected working folders never form part of a release.
const ignoredDirectories = new Set(["node_modules", ".git", ".next", ".local", ".temp", "tmp"]);
const ignoredExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".zip", ".docx", ".xlsx", ".pptx", ".woff", ".woff2"]);
const safetyImplementationFiles = new Set([
  "lib/review/privacy.ts",
  "scripts/quality/check-release-safety.mjs",
  "scripts/quality/verify-public-documents.mjs",
  "scripts/import-release-1-fachbasis.mjs",
  "scripts/sync-approved-government-impact-cases.mjs",
  "scripts/sync-approved-parliament-daily.mjs"
]);
const unsafePatterns = [
  { label: "local-user-path", pattern: /\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/ },
  { label: "local-volume-path", pattern: /\/Volumes\/[A-Za-z0-9._-]+(?:\/|$)/ },
  { label: "windows-user-path", pattern: /(?:[A-Z]:\\|\\\\[^\\]+\\)(?:Users|Dokumente|Documents)\\/i },
  // Turbopack's public runtime uses the literal, non-resolving placeholder
  // `file:///ROOT/` to model chunk paths. It contains no local path or host
  // reference and cannot disclose a build-machine location. All actual file
  // URIs, including localhost, remain release blockers.
  { label: "local-file-uri", pattern: /file:\/\/(?!\/ROOT(?:\/|$))(?:\/|localhost)/i },
  { label: "review-provider-reference", pattern: new RegExp([["chat", "gpt"].join(""), ["cl", "aude"].join(""), ["open", "ai"].join(""), "anthropic", "copilot"].join("|"), "i") },
  // References to a production method are never public. Terms such as
  // "KI-gestützt" inside an original political proposal, however, describe
  // the proposal itself and must remain intact for source fidelity.
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

const findings = [];
for (const root of roots) {
  for (const file of collect(root)) {
    if (/^\.env(?:\.|$)/.test(path.basename(file)) && path.basename(file) !== ".env.example") {
      findings.push(`private-environment-file: ${file}`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    const sourceFaithfulCorpus = file.startsWith(`data${path.sep}fachakten${path.sep}`)
      || [
        `data${path.sep}generated${path.sep}release-1${path.sep}commitment-registers.json`,
        `data${path.sep}generated${path.sep}release-1${path.sep}sachsen-anhalt-commitment-registers.json`,
        `data${path.sep}generated${path.sep}release-1${path.sep}sachsen-anhalt-programme-reviews.json`
      ].includes(file);
    for (const rule of unsafePatterns) {
      // Original political source language may legitimately concern automated
      // systems. This is not a production-method disclosure; removing it
      // would falsify the authoritative source. All provider, path, secret and
      // editorial-marker checks still apply to this corpus.
      if (sourceFaithfulCorpus && rule.label === "ai-assistance-reference") continue;
      if (rule.pattern.test(content)) findings.push(`${rule.label}: ${file}`);
    }
  }
}

if (findings.length) {
  console.error("Privacy release gate failed. Remove the reported value or exclude the artifact from publication:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`Privacy release gate passed for ${scope}.`);
// The checker is entirely synchronous. Exit explicitly so inherited file
// watcher handles from local tooling can never keep a deployment gate alive.
process.exit(0);

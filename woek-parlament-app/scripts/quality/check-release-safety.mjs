#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const scope = process.argv.find((arg) => arg.startsWith("--scope="))?.slice("--scope=".length) ?? "repository";
const roots = scope === "release" ? ["public", ".next/static"] : ["app", "data", "lib", "scripts", "supabase", "tests", ".env.example", "package.json", "next.config.ts"];
const ignoredDirectories = new Set(["node_modules", ".git", ".next", ".local"]);
const ignoredExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".zip", ".woff", ".woff2"]);
const unsafePatterns = [
  { label: "local-user-path", pattern: /\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/ },
  { label: "local-volume-path", pattern: /\/Volumes\/[A-Za-z0-9._-]+(?:\/|$)/ },
  { label: "local-file-uri", pattern: /file:\/\/(?:\/|localhost)/i },
  { label: "review-provider-reference", pattern: new RegExp([["chat", "gpt"].join(""), ["cl", "aude"].join(""), ["open", "ai"].join("")].join("|"), "i") }
];

function collect(target) {
  if (!fs.existsSync(target)) return [];
  const stats = fs.statSync(target);
  if (stats.isFile()) return ignoredExtensions.has(path.extname(target).toLowerCase()) ? [] : [target];
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
    for (const rule of unsafePatterns) {
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

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const strict = process.argv.includes("--strict");
const verbose = process.argv.includes("--verbose");
const ignoredDirectories = new Set([".next", "node_modules", "coverage"]);

function collectTsx(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) collectTsx(file, files);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(file);
    }
  }
  return files;
}

function attributes(tag) {
  return new Set([...tag.matchAll(/\s([\w:-]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\}|[^\s"'=<>`]+))?/g)].map((match) => match[1].toLowerCase()));
}

function openingTags(source, names) {
  const matcher = new RegExp(`<(${names.join("|")})\\b`, "gi");
  const tags = [];
  for (const match of source.matchAll(matcher)) {
    let quote = "";
    let braces = 0;
    let end = -1;
    for (let index = match.index + match[0].length; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (character === quote && source[index - 1] !== "\\") quote = "";
        continue;
      }
      if (character === '"' || character === "'" || character === "`") quote = character;
      else if (character === "{") braces += 1;
      else if (character === "}") braces = Math.max(0, braces - 1);
      else if (character === ">" && braces === 0) {
        end = index + 1;
        break;
      }
    }
    if (end !== -1) tags.push({ tag: source.slice(match.index, end), index: match.index });
  }
  return tags;
}

function isInsideImplicitLabel(source, index) {
  const before = source.slice(0, index);
  return before.lastIndexOf("<label") > before.lastIndexOf("</label>");
}

function auditSource(file) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(ROOT, file);
  const problems = [];
  for (const match of openingTags(source, ["img"])) if (!attributes(match.tag).has("alt")) problems.push("image-without-alt");
  for (const match of openingTags(source, ["input", "select", "textarea"])) {
    const attrs = attributes(match.tag);
    if (attrs.has("hidden") || attrs.has("aria-hidden") || /\btype\s*=\s*["']hidden["']/i.test(match.tag)) continue;
    if (attrs.has("aria-label") || attrs.has("aria-labelledby") || attrs.has("id") || isInsideImplicitLabel(source, match.index)) continue;
    problems.push("form-control-without-programmatic-name");
  }
  if (/\bhref\s*=\s*(?:\{?)["']#["']/i.test(source)) problems.push("placeholder-link");
  if (/\btabIndex\s*=\s*\{?[1-9]/i.test(source)) problems.push("positive-tabindex");
  return { file: relative, problems };
}

function auditShell() {
  const layout = path.join(ROOT, "app", "layout.tsx");
  const css = path.join(ROOT, "app", "globals.css");
  const problems = [];
  if (!fs.existsSync(layout)) return { file: "app/layout.tsx", problems: ["missing-root-layout"] };
  const layoutSource = fs.readFileSync(layout, "utf8");
  if (!/<html\b[^>]*\blang\s*=/.test(layoutSource)) problems.push("missing-html-lang");
  if (!/<main\b/i.test(layoutSource)) problems.push("missing-main-landmark");
  if (!/skip-link/.test(layoutSource)) problems.push("missing-skip-link");
  if (!fs.existsSync(css)) problems.push("missing-global-stylesheet");
  else {
    const cssSource = fs.readFileSync(css, "utf8");
    if (!/:focus-visible/.test(cssSource)) problems.push("missing-visible-focus-style");
    if (!/prefers-reduced-motion/.test(cssSource)) problems.push("missing-reduced-motion-style");
  }
  return { file: "app/layout.tsx", problems };
}

const audited = [auditShell(), ...collectTsx(path.join(ROOT, "app")).filter((file) => !file.endsWith(`${path.sep}layout.tsx`)).map(auditSource)];
const failures = audited.filter((entry) => entry.problems.length > 0);
const byRule = Object.fromEntries([...new Set(failures.flatMap((entry) => entry.problems))].sort().map((rule) => [rule, failures.filter((entry) => entry.problems.includes(rule)).length]));
console.log(JSON.stringify({ standard: "WCAG 2.2 AA baseline (automated Next.js source checks only)", audited_files: audited.length, files_with_findings: failures.length, findings_by_rule: byRule, sample: failures.slice(0, 30), ...(verbose ? { findings: failures } : {}) }, null, 2));
if (strict && failures.length > 0) process.exitCode = 1;

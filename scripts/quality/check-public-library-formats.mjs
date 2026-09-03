import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOCKED_EXTENSIONS = new Set([".doc", ".docx", ".md", ".zip"]);
const REGISTRY_PATH = path.join(ROOT, "assets/data/library-version-registry.json");
const DOCUMENT_LIBRARY_PATH = path.join(ROOT, "assets/data/document-library.json");
const SKIP_PARTS = [
  `${path.sep}.git${path.sep}`,
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}outputs${path.sep}`,
  `${path.sep}.codex-backup${path.sep}`,
  `${path.sep}woek-akademie-app${path.sep}node_modules${path.sep}`,
  `${path.sep}woek-akademie-app${path.sep}.next${path.sep}`,
];

function walkHtml(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP_PARTS.some((part) => full.includes(part))) continue;
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function readJson(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
}

function extension(value = "") {
  return path.extname(String(value).split(/[?#]/)[0]).toLowerCase();
}

function blocked(value = "") {
  return BLOCKED_EXTENSIONS.has(extension(value));
}

function collectRegistryFindings() {
  const findings = [];
  const registry = readJson(REGISTRY_PATH);
  for (const doc of registry.documents || []) {
    for (const key of ["primary", "sourcePath"]) {
      const value = doc.urls?.[key] || "";
      if (blocked(value)) {
        findings.push(`${REGISTRY_PATH}: ${doc.id || doc.title} exposes ${key}=${value}`);
      }
    }
    for (const format of doc.formats || []) {
      if (BLOCKED_EXTENSIONS.has(`.${String(format).toLowerCase()}`)) {
        findings.push(`${REGISTRY_PATH}: ${doc.id || doc.title} exposes format=${format}`);
      }
    }
  }
  const publicLibrary = readJson(DOCUMENT_LIBRARY_PATH);
  for (const doc of publicLibrary.documents || []) {
    if (blocked(doc.url || "") || blocked(doc.downloadUrl || "")) {
      findings.push(`${DOCUMENT_LIBRARY_PATH}: ${doc.id || doc.title} exposes blocked document URL`);
    }
  }
  return findings;
}

function collectHtmlFindings() {
  const findings = [];
  const hrefPattern = /href=["']([^"']+\.(?:docx?|md|zip)(?:[?#][^"']*)?)["']/gi;
  const visibleFormatPattern = /(?:Umfang<\/dt><dd>[^<]*(?:DOCX|MD|ZIP)|\b(?:DOCX|MD|ZIP)\b)/g;
  for (const file of walkHtml(ROOT)) {
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, "utf8");
    for (const match of html.matchAll(hrefPattern)) {
      findings.push(`${file}: blocked public link ${match[1]}`);
    }
    if (visibleFormatPattern.test(html)) {
      findings.push(`${file}: visible public library format label includes DOCX, MD or ZIP`);
    }
  }
  return findings;
}

const findings = [...collectRegistryFindings(), ...collectHtmlFindings()];

if (findings.length) {
  console.error("Public library format gate failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Public library format gate passed: no MD, DOCX or ZIP public library entries.");

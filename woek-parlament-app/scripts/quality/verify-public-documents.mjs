#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const publisher = "Institut für Wirkungsökonomie";
// Root AGENTS: publisher and canonical document authorship are distinct.
const documentAuthor = "Natalie Weber";
const publicDirectory = path.resolve("public");
const deep = process.argv.includes("--deep");
const documentExtensions = new Set([".pdf", ".docx", ".xlsx", ".pptx", ".zip"]);
const unsafePatterns = [
  /\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/i,
  /\/Volumes\/[A-Za-z0-9._-]+(?:\/|$)/i,
  /(?:[A-Z]:\\|\\\\[^\\]+\\)(?:Users|Dokumente|Documents)\\/i,
  /file:\/\/(?:\/|localhost)/i,
  /chatgpt|claude|openai|anthropic|copilot/i,
  /(?:sprachmodell|language model|large language model|generative ai|generative ki|ai-assisted|ki-gestützt|modellgeneriert)/i,
  /(?:interne?[nr]?|internal)(?:\s+only)?\s+(?:redaktions?|editorial(?:e[nr]?)?)\s*(?:notiz|hinweis|kommentar)/i,
  /(?:nicht\s+(?:veröffentlichen|publizieren)|not\s+for\s+publication|do\s+not\s+publish)/i,
  /(?:\b(?:todo|fixme|debug)\b|lorem ipsum|test(?:ing)?\s+only|placeholder\s+(?:content|text)|dummy\s+(?:content|text|data))/i
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function sha256(file) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function publicPath(file) {
  return `/${path.relative(publicDirectory, file).split(path.sep).join("/")}`;
}

function assertClean(value, label) {
  const hit = unsafePatterns.find((pattern) => pattern.test(value));
  if (hit) throw new Error(`${label} contains a blocked publication marker.`);
}

function readPdfInfo(file) {
  try {
    return execFileSync("pdfinfo", [file], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    throw new Error(`PDF metadata could not be inspected: ${publicPath(file)}.`);
  }
}

function metadataValue(info, field) {
  return info.match(new RegExp(`^${field}:\\s*(.*)$`, "m"))?.[1]?.trim() ?? "";
}

function deepCheckPdf(file, entry) {
  const info = readPdfInfo(file);
  for (const [field, expected] of [["Author", entry.author], ["Creator", entry.creator], ["Producer", entry.producer]]) {
    const value = metadataValue(info, field);
    if (value !== expected || value !== documentAuthor) {
      throw new Error(`${publicPath(file)} has invalid ${field} metadata.`);
    }
    assertClean(value, `${publicPath(file)} ${field}`);
  }
  try {
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assertClean(text, publicPath(file));
  } catch (error) {
    if (error instanceof Error && error.message.includes("blocked publication marker")) throw error;
    throw new Error(`PDF text could not be inspected: ${publicPath(file)}.`);
  }
}

const manifestFile = path.join(publicDirectory, "publication-manifest.json");
if (!fs.existsSync(manifestFile)) throw new Error("Missing public publication manifest.");
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
if (manifest.publisher !== publisher || !Array.isArray(manifest.documents)) {
  throw new Error("Invalid public publication manifest publisher.");
}
const entries = new Map(manifest.documents.map((entry) => [entry.path, entry]));
const files = walk(publicDirectory).filter((file) => documentExtensions.has(path.extname(file).toLowerCase()));
for (const file of files) {
  const key = publicPath(file);
  const entry = entries.get(key);
  if (!entry) throw new Error(`Missing publication-manifest entry: ${key}.`);
  if (entry.author !== documentAuthor || entry.creator !== documentAuthor || entry.producer !== documentAuthor) {
    throw new Error(`Invalid publication ownership metadata: ${key}.`);
  }
  if (entry.sha256 !== sha256(file)) throw new Error(`Document hash changed without renewed safety verification: ${key}.`);
  if (deep && path.extname(file).toLowerCase() === ".pdf") deepCheckPdf(file, entry);
}
for (const key of entries.keys()) {
  const file = path.join(publicDirectory, key.replace(/^\//, ""));
  if (!fs.existsSync(file)) throw new Error(`Publication-manifest references a missing document: ${key}.`);
}
console.log(`Public document gate passed${deep ? " (deep metadata and text check)" : ""}: ${files.length} document(s).`);

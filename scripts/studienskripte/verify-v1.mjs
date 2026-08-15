#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APP = join(ROOT, "woek-akademie-app");
const INDEX_PATH = join(ROOT, "content", "studienskripte", "index.json");
const MIN_WORDS = 14500;
const REQUIRED_PATTERNS = [
  [/## Lernziele/, "Lernziele"],
  [/Einleitung.*Wirkungsfrage|Wirkungsfrage/, "Einleitung / Wirkungsfrage"],
  [/Verständnisfragen|Mini-Quiz/, "Verständnisfragen oder Mini-Quiz"],
  [/Glossar/, "Glossar"],
  [/Quellen/, "Quellen"],
  [/Rückfluss|Rueckfluss|zurück in den WÖk-Korpus/, "Rueckfluss"],
  [/## V1-Finalisierung: Vertiefung, Anwendung und Evidenz/, "V1-Finalisierung"],
];
const FINAL_MARKER = "## V1-Finalisierung: Vertiefung, Anwendung und Evidenz";

function fail(message) {
  throw new Error(message);
}

function wordCount(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[^\p{L}\p{N}_-]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function read(path) {
  if (!existsSync(path)) fail(`Missing file: ${path}`);
  return readFileSync(path, "utf8");
}

const index = JSON.parse(read(INDEX_PATH));
if (!Array.isArray(index.scripts)) fail("index.scripts missing");
if (index.scripts.length !== 56) fail(`Expected 56 scripts, got ${index.scripts.length}`);

let minWords = Number.POSITIVE_INFINITY;
let checked = 0;

for (const item of index.scripts) {
  if (item.status !== "studienskript-v1") {
    fail(`${item.slug}: expected status studienskript-v1, got ${item.status}`);
  }
  const masterPath = join(ROOT, item.masterPath);
  const appPath = join(ROOT, item.appMirrorPath);
  const wordPath = join(ROOT, item.wordRawPath);
  const poolPath = join(APP, "content", "pruefungen", "question-pools", `${item.slug}.md`);

  const master = read(masterPath);
  const appMirror = read(appPath);
  if (master !== appMirror) fail(`${item.slug}: app mirror differs from master`);

  const words = wordCount(master);
  minWords = Math.min(minWords, words);
  if (words < MIN_WORDS) fail(`${item.slug}: expected at least ${MIN_WORDS} words, got ${words}`);

  for (const [pattern, label] of REQUIRED_PATTERNS) {
    if (!pattern.test(master)) fail(`${item.slug}: missing required section marker ${label}`);
  }
  const markerMatches = master.match(new RegExp(FINAL_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? [];
  if (markerMatches.length !== 1) fail(`${item.slug}: expected exactly one V1 finalization marker, got ${markerMatches.length}`);
  const afterFinalization = master.slice(master.indexOf(FINAL_MARKER) + FINAL_MARKER.length);
  if (/^##\s+\d+\./m.test(afterFinalization)) {
    fail(`${item.slug}: numbered main section appears after V1 finalization marker`);
  }
  if (/noch nicht die finale 40[-–]50-Seiten-Tiefenfassung/.test(master)) {
    fail(`${item.slug}: still contains non-final self-description`);
  }
  if (!existsSync(wordPath)) fail(`${item.slug}: missing Word raw file`);
  if (statSync(wordPath).size < 50_000) fail(`${item.slug}: Word raw file suspiciously small`);

  const pool = read(poolPath);
  const correctAnswers = (pool.match(/CorrectAnswer:/g) ?? []).length;
  if (correctAnswers < 8) fail(`${item.slug}: expected at least 8 CorrectAnswer entries, got ${correctAnswers}`);
  checked += 1;
}

const assessments = [
  "assessment-zp1.md",
  "assessment-zp2.md",
  "assessment-zp3.md",
  "assessment-wm-final.md",
  "assessment-wc-final.md",
];
for (const name of assessments) {
  read(join(APP, "content", "pruefungen", "assessments", name));
}

console.log(JSON.stringify({ ok: true, checked, minWords, minRequiredWords: MIN_WORDS, assessments: assessments.length }, null, 2));

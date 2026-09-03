#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MASTER_ROOT = path.join(ROOT, "content/studienskripte/v4");
const MANIFEST_PATH = path.join(MASTER_ROOT, "PUBLIC_MASTER_MANIFEST.json");
const PROJECTION_PATH = path.join(ROOT, "content/academy/academy-v4-main-domain-projection.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fail(message) {
  throw new Error(`ACADEMY_V4_PUBLIC_MASTER: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safePublicPath(relativePath) {
  const absolute = path.resolve(MASTER_ROOT, relativePath);
  const prefix = `${path.resolve(MASTER_ROOT)}${path.sep}`;
  assert(absolute.startsWith(prefix), `public_path verlässt Public-Master: ${relativePath}`);
  return absolute;
}

const manifest = readJson(MANIFEST_PATH);
const projection = readJson(PROJECTION_PATH);

assert(manifest.curriculum_version === "4.0", `Curriculum ${manifest.curriculum_version} statt 4.0`);
assert(projection.curriculum_version === manifest.curriculum_version, "Projection/Public-Master Versionsdrift");
assert(manifest.source_repo === projection.public_master.source_repo, "Source-Repo-Drift");
assert(manifest.source_sha === projection.public_master.source_sha, "Source-SHA-Drift");
assert(manifest.security?.assessment_secrets_included === false, "Assessment-Secrets-Flag muss false sein");

const expectedCounts = {
  study_lectures: 120,
  base: 108,
  state_architecture: 12,
  active_offering_lectures: 58,
  active_offerings: 6,
  total_public_lectures: 178,
};
for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(manifest.counts?.[key] === expected, `${key}=${manifest.counts?.[key]} statt ${expected}`);
}
assert(Array.isArray(manifest.lectures) && manifest.lectures.length === 178, "Manifest muss 178 Lectures enthalten");

const ids = new Set();
const scopedCodes = new Set();
const forbiddenPatterns = (manifest.security.fail_closed_patterns || []).map((source) => new RegExp(source, "i"));
for (const lecture of manifest.lectures) {
  assert(lecture.lecture_id && !ids.has(lecture.lecture_id), `fehlende/doppelte lecture_id ${lecture.lecture_id}`);
  ids.add(lecture.lecture_id);
  const scopedCode = `${lecture.offering_id}:${lecture.display_code}`;
  assert(lecture.display_code && !scopedCodes.has(scopedCode), `doppelter display_code ${scopedCode}`);
  scopedCodes.add(scopedCode);
  assert(lecture.curriculum_version === "4.0", `${lecture.lecture_id}: falsche Curriculum-Version`);
  assert(String(lecture.review_status || "").startsWith("FACH_ENDCONTENT_REVIEWED"), `${lecture.lecture_id}: nicht fachgeprüft`);
  assert(lecture.source_sha === manifest.source_sha, `${lecture.lecture_id}: Source-SHA-Drift`);

  const publicFile = safePublicPath(lecture.public_path);
  assert(fs.existsSync(publicFile), `${lecture.lecture_id}: Public-Master-Datei fehlt (${lecture.public_path})`);
  const content = fs.readFileSync(publicFile, "utf8");
  assert(sha256(content) === lecture.public_sha256, `${lecture.lecture_id}: Public-Hash-Drift`);
  assert(
    content.startsWith(`<!-- WOEK_PUBLIC_MASTER source=${manifest.source_repo}@${manifest.source_sha}`),
    `${lecture.lecture_id}: Provenienzheader fehlt`,
  );
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(content), `${lecture.lecture_id}: geschütztes Assessment-Muster ${pattern}`);
  }
}

const study = manifest.lectures.filter((lecture) => lecture.offering_id === "WOEK-G");
assert(study.length === 120, `Study-Records=${study.length}`);
const studyByCode = new Map(study.map((lecture) => [lecture.display_code, lecture]));
const partCodes = projection.parts.flatMap((part) => part.modules.flatMap((module) => module.lecture_codes));
assert(projection.parts.length === 10, `Parts=${projection.parts.length}`);
assert(projection.parts.flatMap((part) => part.modules).length === 40, "Projection muss 40 Module enthalten");
assert(partCodes.length === 120 && new Set(partCodes).size === 120, "Projection muss 120 eindeutige Lecture-Codes enthalten");
for (const code of partCodes) assert(studyByCode.has(code), `Projection verweist auf fehlenden Public-Master-Code ${code}`);
for (const code of studyByCode.keys()) assert(partCodes.includes(code), `Public-Master-Code ${code} fehlt in Projection`);

assert(projection.active_offerings.length === 6, "Projection muss sechs aktive Offerings enthalten");
let offeringTotal = 0;
for (const offering of projection.active_offerings) {
  const entries = manifest.lectures.filter(
    (lecture) => lecture.offering_id === offering.offering_id && lecture.public_path.startsWith(`angebote/${offering.slug}/`),
  );
  assert(entries.length === offering.lecture_count, `${offering.slug}: ${entries.length} statt ${offering.lecture_count}`);
  assert(manifest.counts.offering_lectures_by_slug?.[offering.slug] === offering.lecture_count, `${offering.slug}: Manifest-Count-Drift`);
  offeringTotal += entries.length;
}
assert(offeringTotal === 58, `Offering-Summe=${offeringTotal}`);

assert(projection.interim_exams.length === 10, "Projection muss zehn Zwischenprüfungen enthalten");
assert(projection.final_assessments.length === 4, "Projection muss vier Abschlussleistungen enthalten");
const assessmentIds = [...projection.interim_exams, ...projection.final_assessments].map((entry) => entry.assessment_id);
assert(new Set(assessmentIds).size === 14, "Assessment-IDs müssen eindeutig sein");
const assessmentText = JSON.stringify({ interim_exams: projection.interim_exams, final_assessments: projection.final_assessments });
assert(!/correctAnswer|correct_answer|answer_key|Musterlösung|Lösungsschlüssel|instructor[_ -]?(?:answer|solution)/i.test(assessmentText), "Projection enthält geschützte Assessment-Daten");

assert(projection.terminology.authored_baseline === manifest.terminology_baseline, "authored terminology baseline drift");
assert(projection.terminology.current_release_reference === "1.7", "aktuelle Release-Terminologie muss v1.7 sein");
assert(
  fs.existsSync(path.join(ROOT, "source-assets/originals/WOeK_Begriffsleitfaden_fuehrend_v1.7-objektspezifische-pruefarchitektur.md")),
  "Begriffsleitfaden-v1.7-Referenz fehlt auf main",
);
assert(projection.historical_curriculum.version === "3.2", "historische v3.2-Referenz fehlt");
assert(projection.historical_curriculum.archive_commit === "4d93bbefc3a7249ff27fc0f2ebbcf0493354a13a", "v3.2-Archiv-SHA-Drift");

console.log("ACADEMY_SCRIPT_MASTER_MIRROR_PARITY: PASS (178/178 committed sanitized public lectures)");
console.log("PUBLIC_ACADEMY_CURRICULUM_DERIVED_FROM_CANON: PASS (10/40/120)");
console.log("ACADEMY_OFFERING_CATALOG_WEB_APP_PARITY: PASS (6 offerings / 58 lectures)");
console.log("PUBLIC_ACADEMY_ASSESSMENT_VERSION_MATCH: PASS (10 + 4 metadata-only)");
console.log("NO_ASSESSMENT_SECRET_LEAK: PASS");
console.log("PUBLIC_MASTER_SOURCE_PROVENANCE_PRESENT: PASS");

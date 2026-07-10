import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const curriculum = JSON.parse(fs.readFileSync(path.join(ROOT, "content/academy/woek-g-curriculum.json"), "utf8"));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const lectures = curriculum.lectures || [];
const codes = new Set(lectures.map((lecture) => lecture.code));
const moduleIds = new Set((curriculum.modules || []).map((module) => module.id));

assert(curriculum.curriculumId === "woek-g", "curriculumId muss woek-g sein.");
assert(curriculum.version === "2.0", "Curriculum muss Version 2.0 tragen.");
assert(lectures.length === 108, `Erwartet 108 Vorlesungen, gefunden ${lectures.length}.`);
assert(codes.size === lectures.length, "Doppelte Vorlesungscodes gefunden.");
assert(curriculum.counts?.lectures === 108, "counts.lectures ist nicht 108.");
assert(curriculum.counts?.studySections === 5, "Es müssen 5 Studienabschnitte ausgewiesen sein.");

for (let index = 1; index <= 108; index += 1) {
  const code = `V${String(index).padStart(2, "0")}`;
  assert(codes.has(code), `${code} fehlt.`);
}

for (const lecture of lectures) {
  assert(/^V\d{2,3}$/.test(lecture.code), `${lecture.code}: Codeformat ungültig.`);
  for (const field of ["titel", "lernziel", "modul", "modulTitel", "studienabschnitt", "status"]) {
    assert(Boolean(lecture[field]), `${lecture.code}: ${field} fehlt.`);
  }
  assert(moduleIds.has(lecture.modul), `${lecture.code}: unbekanntes Modul ${lecture.modul}.`);
  assert(["active", "planned"].includes(lecture.status), `${lecture.code}: Status muss active oder planned sein.`);
  assert(Array.isArray(lecture.bautAuf), `${lecture.code}: bautAuf muss ein Array sein.`);
  for (const ref of lecture.bautAuf) {
    assert(codes.has(ref), `${lecture.code}: unbekannter bautAuf-Verweis ${ref}.`);
    assert(ref !== lecture.code, `${lecture.code}: baut auf sich selbst auf.`);
  }
}

const requiredTitles = [
  "Stranded Assets, Transitionsrisiko und Refinanzierungsresilienz",
  "Das Wirkungsökonomische Managementmodell (WÖMM)",
  "Das Methodensystem im Überblick (WÖMS)",
  "Wirkungsrealisierungsarchitektur: Deliverables sind nicht Wirkung",
  "Wirkung von Worten, Narrativen und Frames",
  "Gesundheit als Wirkungsfeld",
  "Wohnen, Stadt und Daseinsvorsorge",
];
for (const title of requiredTitles) {
  assert(lectures.some((lecture) => lecture.titel === title), `Pflichtthema fehlt: ${title}`);
}

const v47 = lectures.find((lecture) => lecture.code === "V47");
assert(v47?.titel === "Stranded Assets, Transitionsrisiko und Refinanzierungsresilienz", "V47 muss Stranded Assets behandeln.");
assert(v47?.bautAuf?.includes("V46") && v47?.bautAuf?.includes("V33"), "V47 braucht bautAuf V46 und V33.");

const v98 = lectures.find((lecture) => lecture.code === "V98");
assert(/152 Methoden/.test(v98?.lernziel || ""), "V98 muss den WÖMS-Überblick mit 152 Methoden benennen.");

if (failures.length) {
  console.error(["Curriculum-Check fehlgeschlagen:", ...failures.map((failure) => `- ${failure}`)].join("\n"));
  process.exit(1);
}

console.log("Curriculum-Check bestanden: WÖk-G 2.0 mit 108 Vorlesungen und gültiger Progression.");

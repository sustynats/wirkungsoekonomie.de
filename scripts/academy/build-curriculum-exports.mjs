import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, "content/academy/woek-g-curriculum.json");
const activeTargetPath = path.join(ROOT, "public/data/woek-g-curriculum.json");
const historicalTargetPath = path.join(ROOT, "public/data/woek-g-curriculum-v3.2.json");

const curriculum = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const legacyExport = {
  schemaVersion: curriculum.schemaVersion,
  curriculumId: curriculum.curriculumId,
  title: curriculum.title,
  version: curriculum.version,
  stand: curriculum.stand,
  counts: curriculum.counts,
  tracks: curriculum.tracks,
  modules: curriculum.modules,
  lectures: curriculum.lectures.map((lecture) => ({
    code: lecture.code,
    slug: lecture.slug,
    titel: lecture.titel,
    lernziel: lecture.lernziel,
    modul: lecture.modul,
    modulTitel: lecture.modulTitel,
    studienabschnitt: lecture.studienabschnitt,
    status: lecture.status,
    bautAuf: lecture.bautAuf,
  })),
};

fs.mkdirSync(path.dirname(activeTargetPath), { recursive: true });
fs.writeFileSync(historicalTargetPath, `${JSON.stringify(legacyExport, null, 2)}\n`);
fs.writeFileSync(activeTargetPath, `${JSON.stringify(legacyExport, null, 2)}\n`);

console.log(`Historischer Curriculum-Export v${legacyExport.version} geschrieben: ${legacyExport.lectures.length} Vorlesungen.`);

// Curriculum v4.0 is the active projection. The v4 builder validates the
// exact sanitized Public-Master manifest and then overwrites only the active
// public export plus the Academy/Lernen public pages. The historical v3.2
// export above remains immutable and addressable.
await import("./build-v4-main-domain.mjs");
await import("./postprocess-v4-main-domain.mjs");

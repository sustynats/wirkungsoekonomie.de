import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, "content/academy/woek-g-curriculum.json");
const activeTargetPath = path.join(ROOT, "public/data/woek-g-curriculum.json");

const curriculum = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const historicalExport = {
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

const historicalTargetPath = path.join(ROOT, `public/data/woek-g-curriculum-v${historicalExport.version}.json`);
fs.mkdirSync(path.dirname(activeTargetPath), { recursive: true });
fs.writeFileSync(historicalTargetPath, `${JSON.stringify(historicalExport, null, 2)}\n`);

console.log(`Historischer Curriculum-Export v${historicalExport.version} geschrieben: ${historicalExport.lectures.length} Vorlesungen.`);

// The committed sanitized v4 Public-Master is the only active source. Its
// projector validates hashes, cardinality, source provenance and the public
// privacy boundary before replacing the active export and Academy/Lernen views.
await import("./build-v4-main-domain.mjs");

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const sourcePath = path.join(ROOT, "content/academy/woek-g-curriculum.json");
const targetPath = path.join(ROOT, "public/data/woek-g-curriculum.json");

const curriculum = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const publicExport = {
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

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, `${JSON.stringify(publicExport, null, 2)}\n`);

console.log(`Curriculum-Export geschrieben: ${publicExport.lectures.length} Vorlesungen.`);

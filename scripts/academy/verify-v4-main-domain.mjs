#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const release = JSON.parse(fs.readFileSync(path.join(ROOT, "content/academy/ACADEMY_V4_MAIN_DOMAIN_MANIFEST.json"), "utf8"));
const curriculum = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/woek-g-curriculum.json"), "utf8"));
const publicMaster = JSON.parse(fs.readFileSync(path.join(ROOT, "content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json"), "utf8"));
const projection = JSON.parse(fs.readFileSync(path.join(ROOT, "content/academy/academy-v4-main-domain-projection.json"), "utf8"));
const postBuild = process.argv.includes("--post-build");

function fail(message) {
  throw new Error(`ACADEMY_V4_MAIN_DOMAIN_VERIFY: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const expectedCounts = {
  parts: 10,
  modules: 40,
  studyLectures: 120,
  activeOfferings: 6,
  activeOfferingLectures: 58,
  interimExams: 10,
  finalAssessments: 4,
};
assert(curriculum.version === "4.0", `active export version=${curriculum.version}`);
for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(curriculum.counts?.[key] === expected, `${key}=${curriculum.counts?.[key]} statt ${expected}`);
}
assert(release.source_sha === publicMaster.source_sha, "release/public-master SHA drift");
assert(curriculum.source.sourceSha === publicMaster.source_sha, "curriculum/public-master SHA drift");
assert(curriculum.source.currentReleaseReference === "WÖk-Begriffsleitfaden v1.7", "v1.7 release reference missing");
assert(curriculum.parts.length === 10, "active export parts drift");
assert(curriculum.parts.flatMap((part) => part.modules).length === 40, "active export modules drift");
assert(curriculum.parts.flatMap((part) => part.modules.flatMap((module) => module.lectures)).length === 120, "active export lecture drift");
assert(curriculum.activeOfferings.length === 6, "active offering export drift");
assert(curriculum.assessments.interim.length === 10 && curriculum.assessments.final.length === 4, "assessment export drift");

const activeRoutes = release.generated_routes.filter((route) => route !== projection.historical_curriculum.public_route);
const protectedPublicPatterns = [
  /\bauto_scenario\b/i,
  /\bmixed_auto_manual\b/i,
  /\bmanual_rubric\b/i,
  /CorrectAnswer|correct_answer|answer_key|Musterlösung|Lösungsschlüssel|instructor[_ -]?(?:answer|solution)/i,
];
for (const route of release.generated_routes) {
  const file = path.join(ROOT, route);
  assert(fs.existsSync(file), `generated route missing ${route}`);
  const html = fs.readFileSync(file, "utf8");
  assert(/<main\b[^>]*data-search-content/.test(html), `${route}: searchable main missing`);
  assert(/<link rel="canonical" href="https:\/\/wirkungsoekonomie\.de\//.test(html), `${route}: canonical missing`);
  assert(/<script type="application\/ld\+json">/.test(html), `${route}: structured data missing`);
  for (const pattern of protectedPublicPatterns) assert(!pattern.test(html), `${route}: forbidden public marker ${pattern}`);
  if (activeRoutes.includes(route)) {
    assert(/data-curriculum-version="4\.0"/.test(html), `${route}: active version marker missing`);
    assert(!/9 Teile, 36 Module, 108 Vorlesungen|Curriculum-Version v3\.2|CurriculumVersion:\s*WOeK-Akademie-v3\.2/.test(html), `${route}: active v3.2 claim`);
  }
}

const structureHtml = fs.readFileSync(path.join(ROOT, "akademie/studienstruktur.html"), "utf8");
const idsInView = new Set([...structureHtml.matchAll(/data-lecture-id="([^"]+)"/g)].map((match) => match[1]));
const studyIds = publicMaster.lectures.filter((lecture) => lecture.offering_id === "WOEK-G").map((lecture) => lecture.lecture_id);
assert(idsInView.size === 120, `Source-vs-View IDs=${idsInView.size}`);
for (const id of studyIds) assert(idsInView.has(id), `Source-vs-View missing ${id}`);

const offeringHtml = fs.readFileSync(path.join(ROOT, "akademie/weiterbildung.html"), "utf8");
for (const offering of projection.active_offerings) {
  assert(offeringHtml.includes(`data-offering-id="${offering.offering_id}"`), `offering view missing ${offering.offering_id}`);
  assert(offeringHtml.includes(`https://akademie.wirkungsoekonomie.de${offering.app_path}`), `offering app link missing ${offering.slug}`);
}

const examHtml = fs.readFileSync(path.join(ROOT, "akademie/pruefungen.html"), "utf8");
for (const assessment of [...projection.interim_exams, ...projection.final_assessments]) {
  assert(examHtml.includes(`data-assessment-id="${assessment.assessment_id}"`), `assessment view missing ${assessment.assessment_id}`);
}

const historyHtml = fs.readFileSync(path.join(ROOT, projection.historical_curriculum.public_route), "utf8");
assert(historyHtml.includes(projection.historical_curriculum.archive_commit), "exact v3.2 archive commit missing from historical view");
assert(historyHtml.includes("Curriculum v3.2 bleibt nachvollziehbar"), "historical v3.2 label missing");

if (postBuild) {
  const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  assert(sitemap.includes("https://wirkungsoekonomie.de/akademie/curriculum-v3-2.html"), "historical route missing from sitemap");
  for (const route of activeRoutes) {
    const canonical = route.endsWith("index.html")
      ? `https://wirkungsoekonomie.de/${route.slice(0, -"index.html".length)}`
      : `https://wirkungsoekonomie.de/${route}`;
    assert(sitemap.includes(canonical), `sitemap missing ${canonical}`);
  }
  const search = fs.readFileSync(path.join(ROOT, "assets/search/search-index.json"), "utf8");
  assert(search.includes("akademie/curriculum-v3-2.html"), "historical route missing from search index");
  assert(search.includes("Studienstruktur v4.0"), "v4 study structure missing from search index");
}

console.log("ACADEMY_V4_SOURCE_VS_VIEW: PASS (120/120 stable lecture IDs)");
console.log("ACADEMY_V4_ROUTES_STRUCTURED_DATA_PRIVACY: PASS");
console.log("ACADEMY_V4_OFFERINGS_ASSESSMENTS_VIEW: PASS (6 / 10 + 4)");
console.log("ACADEMY_V3_2_HISTORICAL_ARCHIVE: PASS");
if (postBuild) console.log("ACADEMY_V4_SEARCH_SITEMAP: PASS");

import fs from "node:fs";

const baseUrl = (process.env.PORTAL_AUDIT_BASE_URL ?? process.argv.find((argument) => argument.startsWith("--base="))?.slice(7) ?? "https://parlament.wirkungsoekonomie.de").replace(/\/$/, "");
const projection = JSON.parse(fs.readFileSync("data/public-working-acts.json", "utf8"));
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`PRODUCTION AUDIT FAILED: ${message}`);
}

async function load(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, { redirect: "follow", headers: { "user-agent": "WOeK-Production-Integrity-Audit/1.0" } });
  const body = await response.text();
  if (!response.ok) fail(`${pathname} returned HTTP ${response.status}.`);
  if (!body.trim()) fail(`${pathname} returned an empty body.`);
  return { response, body };
}

function includesContent(body, sentinel) {
  const visibleText = body
    .replace(/<!--\s*-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ");
  return body.includes(sentinel) || visibleText.includes(sentinel);
}

const index = await load("/entscheidungen");
if (!index.body.includes("28") || !index.body.includes("Wirkungs")) fail("Decision index does not expose the complete Release-1 register.");

let decided = 0;
let pending = 0;
let voteLayers = 0;
for (const item of projection) {
  const detail = await load(`/entscheidungen/${item.slug}`);
  if (!detail.body.includes(item.plainTitle)) fail(`${item.slug} does not expose its public title.`);
  if (!detail.body.includes("Vollständige Fachakte")) fail(`${item.slug} does not visibly link its canonical full dossier.`);
  const fullPath = `/fachakten/dossiers/${item.fachakteId}.html`;
  const dossier = await load(fullPath);
  if (!dossier.body.includes('id="dossier-content"') || !dossier.body.includes("dossiers.css") || !dossier.body.includes("dossiers.js")) {
    fail(`${fullPath} is not the structured canonical full-dossier edition.`);
  }
  const integrityId = item.fachakteId.replace(/^case-/, "");
  const integrity = await load(`/fachakten/integrity/${integrityId}.json`);
  try {
    const report = JSON.parse(integrity.body);
    if (report.result !== "PASS" || report.missing_paths?.length !== 0 || report.fallback_overwrites?.length !== 0) fail(`${item.fachakteId} fails its published integrity manifest.`);
  } catch {
    fail(`${item.fachakteId} integrity manifest is not valid JSON.`);
  }
  if (item.retrospective) decided += 1;
  else pending += 1;
  if (item.publicWorkingAct?.voteLayer) {
    voteLayers += 1;
    if (!detail.body.includes("Wie wurde tatsächlich abgestimmt?")) fail(`${item.slug} omits its public vote layer.`);
  }
  for (const boundary of item.publicWorkingAct?.reviewDetail?.boundaries ?? []) {
    if (!detail.body.includes(boundary.boundary)) fail(`${item.slug} omits a concrete non-compensation boundary.`);
  }
}

if (projection.length !== 28 || decided !== 12 || pending !== 16 || voteLayers !== 12) {
  fail(`Release population mismatch: ${projection.length} cases, ${decided} decided, ${pending} pending, ${voteLayers} vote layers.`);
}

const aggregateIntegrity = await load("/fachakten/production-integrity-report.json");
try {
  const report = JSON.parse(aggregateIntegrity.body);
  if (report.result !== "PASS" || report.cases !== 28 || report.missing_paths?.length !== 0 || report.fallback_overwrites?.length !== 0) fail("Aggregate production integrity report does not pass.");
} catch {
  fail("Aggregate production integrity report is not valid JSON.");
}

for (const [pathname, sentinels] of [
  ["/mandat-und-praxis", ["1.593", "Wahlprogramme", "Koalitionsvertrag"]],
  ["/laender/sachsen-anhalt", ["2.921 Zusageeinheiten", "28 Ziele im Referenzregister", "Wahlprogramme"]],
  ["/fachanalysen/gebaeudeenergiegesetz-medienwirkung", ["Vollständige Publikationsquelle", "Quellen mit Einordnung"]],
  ["/fachanalysen/sondervermoegen-infrastruktur-klimaneutralitaet", ["Quellen mit Einordnung"]],
  ["/abgeordnete", ["Wirkungsprofile", "Menschen nicht bewerten"]],
  ["/abgeordnete/aaron-valent", ["Aaron Valent", "Dieses Profil bewertet nicht die Person", "Mensch · Planet · Demokratie"]],
  ["/fraktionen", ["Wirkungsprofile der Fraktionen", "ohne Ranking"]],
  ["/fraktionen/cdu-csu", ["CDU/CSU", "Zwölf entschiedene Fälle", "Mensch · Planet · Demokratie"]],
  ["/abstimmungen/bt21-s15-a1", ["630", "444", "133"]]
]) {
  const page = await load(pathname);
  for (const sentinel of sentinels) if (!includesContent(page.body, sentinel)) fail(`${pathname} is missing production sentinel: ${sentinel}`);
}

const fullGeg = await load("/fachakten/dossiers/gebaeudeenergiegesetz-medienwirkung.html");
for (const sentinel of ["GEG-SRC-20", "fachlich complete with causality limits", "ready for public release with evidence boundaries"]) {
  if (!fullGeg.body.toLowerCase().includes(sentinel.toLowerCase())) fail(`Complete GEG dossier is missing: ${sentinel}`);
}

if (failures.length) process.exitCode = 1;
else console.log(JSON.stringify({ result: "PASS", baseUrl, decisionPages: 28, fullDossiers: 28, decided, pending, voteLayers, missingPaths: 0, fallbackOverwrites: 0 }));

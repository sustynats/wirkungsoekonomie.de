import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://wirkungsoekonomie.de";
const failures = [];

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function hasMatch(navigation, label, token) {
  const item = (navigation.header || []).find((entry) => entry.label === label);
  return Boolean(item?.match?.includes(token));
}

const navigation = JSON.parse(read("assets/data/navigation.json"));
for (const token of ["sdg-plus/", "referenzrahmen/", "sdg-sdgplus/", "wissen/"]) {
  assert(hasMatch(navigation, "Verstehen", token), `Navigation: Verstehen is missing match ${token}`);
}
assert(hasMatch(navigation, "Praxis & Tools", "werkstatt/"), "Navigation: Praxis & Tools is missing match werkstatt/");
for (const token of ["portale/", "website-1-0-release/"]) {
  assert(hasMatch(navigation, "Bibliothek", token), `Navigation: Bibliothek is missing match ${token}`);
}

const sitemap = read("sitemap.xml");
assert(!sitemap.includes(`${site}/tools/`), "Sitemap contains the non-canonical /tools/ route.");

const search = JSON.parse(read("assets/search/search-index.json"));
const searchMeta = JSON.parse(read("public/data/woek-search-meta.json")).entries || {};
for (const entry of search) {
  assert(!/^\/(?:docs|tools)(?:\/|$)/.test(String(entry.url || "")), `Search contains non-public route ${entry.url}`);
}
for (const url of Object.keys(searchMeta)) {
  assert(!/^\/(?:docs|tools)(?:\/|$)/.test(url), `Search metadata contains non-public route ${url}`);
}

const archiveIndex = read("quellenarchiv/index.html");
assert(archiveIndex.includes(`<link rel="canonical" href="${site}/quellenarchiv/">`), "Quellenarchiv index lacks its self canonical.");
assert(archiveIndex.includes(`<meta property="og:url" content="${site}/quellenarchiv/">`), "Quellenarchiv index lacks its matching og:url.");

for (const entry of fs.readdirSync(path.join(root, "quellenarchiv"), { withFileTypes: true })) {
  if (!entry.isDirectory() || !/^wok-q-\d+$/i.test(entry.name)) continue;
  const html = read(path.join("quellenarchiv", entry.name, "index.html"));
  const canonical = `${site}/quellenarchiv/${entry.name}/`;
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `Quellenarchiv detail lacks self canonical: ${entry.name}`);
  assert(html.includes(`<meta property="og:url" content="${canonical}">`), `Quellenarchiv detail lacks matching og:url: ${entry.name}`);
}

const correctedPages = [
  "werkzeuge/sozialraum-resilienzprofil/index.html",
  "werkzeuge/kritische-infrastruktur-monitor/index.html",
  "werkzeuge/hybrid-risk-radar/index.html",
  "werkzeuge/cyberresilienz-check/index.html",
  "werkzeuge/infrastruktur-stabilitaetsindex/index.html",
  "werkzeuge/wirkungsrisiko-matrix/index.html",
  "werkzeuge/resilienz-radar-kommune/index.html",
  "downloads/rang-16-sicherheit-resilienz/index.html",
];

for (const relative of correctedPages) {
  const route = relative.replace(/\/index\.html$/, "/");
  const canonical = `${site}/${route}`;
  const html = read(relative);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `Canonical is not self-referential: ${relative}`);
  assert(html.includes(`<meta property="og:url" content="${canonical}">`), `og:url is not self-referential: ${relative}`);
  assert(!html.includes("/portale/sicherheit-resilienz/tool-root/"), `Legacy tool-root canonical remains: ${relative}`);
  assert(!html.includes("/portale/sicherheit-resilienz/download-root/"), `Legacy download-root canonical remains: ${relative}`);
}

if (failures.length) {
  console.error("Navigation and discovery check failed:");
  failures.slice(0, 40).forEach((failure) => console.error(`- ${failure}`));
  if (failures.length > 40) console.error(`... ${failures.length - 40} more`);
  process.exit(1);
}

console.log(`Navigation and discovery check passed (${search.length} search results, ${Object.keys(searchMeta).length} search metadata entries).`);

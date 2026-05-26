import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REGISTRY_PATH = "assets/data/book-reference-registry.json";
const REPORT_PATH = "docs/book-reference-audit.md";
const TARGET_ROOTS = [
  "wirkungsfelder",
  "portale",
  "werkstatt/dossiers",
  "werkstatt/arbeitsbibliothek/wirkungsfelder",
];

const registry = JSON.parse(fs.readFileSync(path.join(ROOT, REGISTRY_PATH), "utf8"));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function walk(dir, files = []) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return files;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) walk(rel, files);
    else if (entry.isFile() && entry.name === "index.html") files.push(rel);
  }
  return files;
}

function routeFor(rel) {
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"/index.html".length)}/` : `/${rel}`;
}

function hrefFrom(rel, target) {
  if (/^(https?:|mailto:|#)/i.test(target)) return target;
  const depth = path.dirname(rel).split("/").filter(Boolean).length;
  return `${"../".repeat(depth)}${target.replace(/^\/+/, "")}`;
}

function fileExistsForUrl(url) {
  if (!url.startsWith("/")) return true;
  const rel = url.replace(/^\/+/, "").replace(/\/$/, "/index.html");
  return fs.existsSync(path.join(ROOT, rel));
}

function stripTags(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function pageTitle(html, rel) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return stripTags(title[1]).replace(/\s+\|\s+.*$/, "");
  return routeFor(rel);
}

function matcherScore(rel, group) {
  const normalized = rel.replace(/\/index\.html$/, "");
  return (group.match || []).reduce((score, matcher) => {
    const cleanMatcher = matcher.replace(/^\/+/, "").replace(/\/$/, "");
    if (cleanMatcher.endsWith("/index.html")) {
      const exactValue = cleanMatcher.replace(/\/index\.html$/, "");
      return normalized === exactValue ? Math.max(score, exactValue.length + 3000) : score;
    }
    const value = cleanMatcher.replace(/\/index\.html$/, "");
    if (!value) return score;
    if (normalized === value) return Math.max(score, value.length + 2000);
    if (normalized.includes(value)) {
      const keywordBoost = value.includes("/") ? 1000 : 2500;
      return Math.max(score, value.length + keywordBoost);
    }
    return score;
  }, 0);
}

function matchingGroups(rel) {
  const groups = registry.groups
    .filter((group) => group.id !== "default")
    .map((group) => ({ group, score: matcherScore(rel, group) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.group);

  const defaultGroup = registry.groups.find((group) => group.id === "default");
  if (!groups.length && defaultGroup) groups.push(defaultGroup);
  return groups;
}

function referencesFor(rel) {
  const refs = [];
  const seen = new Set();
  const groups = matchingGroups(rel);

  for (const group of groups.slice(0, 2)) {
    for (const refId of group.refs || []) {
      if (seen.has(refId)) continue;
      const ref = registry.references[refId];
      if (!ref) continue;
      refs.push({ id: refId, ...ref, group: group.label });
      seen.add(refId);
    }
  }

  return {
    groups,
    refs: refs.filter((ref) => fileExistsForUrl(ref.url)).slice(0, 7),
  };
}

function renderBookReferenceSection(rel, refs, groups) {
  const groupLabel = groups[0]?.label || "Grundlagen";
  const cards = refs.map((ref) => {
    const kicker = ref.title.match(/^(Kapitel\s+\d+|Teil\s+\d+|Teil\s+[IVXLCDM]+)/i)?.[1] || "Buchstelle";
    return `<article class="card book-reference-card">
        <p class="card-kicker">${escapeHtml(kicker)}</p>
        <h3 class="card-title">${escapeHtml(ref.title)}</h3>
        <p class="card-text">${escapeHtml(ref.summary)}</p>
        <div class="portal-card-actions"><a class="text-link" href="${hrefFrom(rel, ref.url)}">Im Buch lesen</a></div>
      </article>`;
  }).join("");

  return `<section class="section book-reference-section" aria-labelledby="buchbezug">
      <div class="section-header">
        <p class="hero-kicker">Grundlagenwerk</p>
        <h2 id="buchbezug">Passende Stellen im Buch <a class="cite-anchor no-print" href="#buchbezug" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        <p>${escapeHtml(registry.intro)} Diese Auswahl ist dem Bereich ${escapeHtml(groupLabel)} zugeordnet.</p>
      </div>
      <div class="card-grid three">${cards}</div>
    </section>`;
}

function replaceExistingBookSection(html, section) {
  const patterns = [
    /<section\b[^>]*aria-labelledby=["']buch["'][^>]*>[\s\S]*?<\/section>/i,
    /<section\b[^>]*aria-labelledby=["']book-anchors["'][^>]*>[\s\S]*?<\/section>/i,
    /<section\b[^>]*class=["'][^"']*book-reference-section[^"']*["'][^>]*>[\s\S]*?<\/section>/i,
  ];
  for (const pattern of patterns) {
    if (pattern.test(html)) return { html: html.replace(pattern, section), mode: "replaced" };
  }
  return { html, mode: "" };
}

function insertSection(html, section) {
  const anchors = [
    /<section\b[^>]*id=["']publikationszugang["'][^>]*>/i,
    /<section\b[^>]*aria-labelledby=["']arbeitsmaterial["'][^>]*>/i,
    /<section\b[^>]*aria-labelledby=["']quellen["'][^>]*>/i,
    /<section\b[^>]*aria-labelledby=["']political-implementation["'][^>]*>/i,
  ];
  for (const anchor of anchors) {
    const match = html.match(anchor);
    if (match?.index !== undefined) {
      return { html: `${html.slice(0, match.index)}${section}${html.slice(match.index)}`, mode: "inserted-before-section" };
    }
  }
  const mainClose = html.lastIndexOf("</main>");
  if (mainClose >= 0) return { html: `${html.slice(0, mainClose)}${section}${html.slice(mainClose)}`, mode: "inserted-before-main-close" };
  return { html, mode: "skipped-no-anchor" };
}

function applyToFile(rel) {
  const abs = path.join(ROOT, rel);
  const original = fs.readFileSync(abs, "utf8");
  if (
    original.includes("dossier-reading-section") &&
    original.includes('id="dossier-weiterlesen"')
  ) {
    return {
      rel,
      title: pageTitle(original, rel),
      status: "skipped-self-contained-dossier",
      groups: [],
      count: 0,
    };
  }
  const { groups, refs } = referencesFor(rel);
  if (!refs.length) {
    return { rel, title: pageTitle(original, rel), status: "skipped-no-refs", groups: groups.map((group) => group.id), count: 0 };
  }

  const section = renderBookReferenceSection(rel, refs, groups);
  let { html, mode } = replaceExistingBookSection(original, section);
  if (!mode) ({ html, mode } = insertSection(html, section));

  if (html !== original && mode !== "skipped-no-anchor") {
    fs.writeFileSync(abs, html, "utf8");
  }

  return {
    rel,
    title: pageTitle(original, rel),
    status: html !== original ? mode : "unchanged",
    groups: groups.map((group) => group.id),
    count: refs.length,
  };
}

const targets = [...new Set(TARGET_ROOTS.flatMap((root) => walk(root)))]
  .filter((rel) => !rel.includes("/assets/"))
  .sort();

const results = targets.map(applyToFile);
const changed = results.filter((result) => result.status === "replaced" || result.status.startsWith("inserted"));
const byGroup = new Map();
for (const result of results) {
  const group = result.groups[0] || "none";
  byGroup.set(group, (byGroup.get(group) || 0) + 1);
}

const report = `# Buchbezug-Audit

Stand: 2026-05-26

## Zweck

Dieser Bericht dokumentiert, auf welchen Themen-, Unterbereichs-, Detailkonzept-, Dossier- und Themenportal-Seiten ein Buchbezug aus der zentralen Registry ergänzt oder ersetzt wurde.

## Zusammenfassung

- Zielseiten geprüft: ${results.length}
- Buchbezug vorhanden nach Lauf: ${results.filter((result) => result.count > 0).length}
- Im aktuellen Lauf ergänzt oder ersetzt: ${changed.length}
- Bereits unverändert: ${results.filter((result) => result.status === "unchanged").length}
- Ohne passende Referenz übersprungen: ${results.filter((result) => result.status === "skipped-no-refs").length}
- Ohne Einfügepunkt übersprungen: ${results.filter((result) => result.status === "skipped-no-anchor").length}

## Themenzuordnung

| Gruppe | Seiten |
| --- | ---: |
${[...byGroup.entries()].sort((a, b) => b[1] - a[1]).map(([group, count]) => `| ${group} | ${count} |`).join("\n")}

## Geänderte Seiten

| Status | Seite | Titel | Referenzen |
| --- | --- | --- | ---: |
${changed.length ? changed.map((result) => `| ${result.status} | ${routeFor(result.rel)} | ${escapeHtml(result.title)} | ${result.count} |`).join("\n") : "| keine Änderung im aktuellen Lauf | - | - | - |"}

## Geprüfte Seiten mit Buchbezug

| Status | Gruppe | Seite | Titel | Referenzen |
| --- | --- | --- | --- | ---: |
${results.map((result) => `| ${result.status} | ${escapeHtml(result.groups[0] || "none")} | ${routeFor(result.rel)} | ${escapeHtml(result.title)} | ${result.count} |`).join("\n")}
`;

fs.writeFileSync(path.join(ROOT, REPORT_PATH), report, "utf8");

console.log(`Book references verified: ${results.filter((result) => result.count > 0).length}/${results.length} pages, changed this run: ${changed.length} -> ${REPORT_PATH}`);

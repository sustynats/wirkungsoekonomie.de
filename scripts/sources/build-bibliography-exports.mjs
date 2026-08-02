import fs from "node:fs";

const REGISTRY_PATH = "content/sources/evidence-source-registry.json";
const BIBLIOGRAPHY_JSON_PATH = "content/sources/bibliography.json";
const BIBLIOGRAPHY_MD_PATH = "content/sources/bibliography.md";
const BIBLIOGRAPHY_BIB_PATH = "content/sources/bibliography.bib";
const SOURCE_PAGES = [
  "quellen/bibliografie.html",
  "quellen/grundlagen-denker.html",
  "quellen/nachhaltigkeit-sdgs-planetare-grenzen.html",
  "quellen/oekonomie-innovation.html",
  "quellen/systemtheorie-kybernetik.html",
  "quellen/vergleichsmodelle.html"
];
const CHECK_ONLY = process.argv.includes("--check");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeIfChanged(file, content) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (current === content) return false;
  if (!CHECK_ONLY) fs.writeFileSync(file, content);
  return true;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ouml;/gi, "ö")
    .replace(/&auml;/gi, "ä")
    .replace(/&uuml;/gi, "ü")
    .replace(/&szlig;/gi, "ß")
    .replace(/&#([0-9]+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
}

function textContent(html) {
  return decodeHtml(String(html).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function key(value) {
  return textContent(value)
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function bibliographyCardKey(source) {
  return key(`${source.author_or_institution} - ${source.title}`);
}

function validUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return /^https?:$/.test(url.protocol);
  } catch {
    return false;
  }
}

function archiveSlug(value) {
  return String(value || "")
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function archiveUrlFor(source) {
  const code = String(source.archive_code || "").trim();
  const url = String(source.archive_url || "").trim();
  const expected = code ? `/quellenarchiv/${archiveSlug(code)}/` : "";
  if (!code || !url || url !== expected) {
    throw new Error(`${source.id}: archive_code und archive_url müssen auf dieselbe Quellenarchiv-Detailseite zeigen.`);
  }
  return url;
}

function markdownArchiveLink(source) {
  return `[Quellensteckbrief](${archiveUrlFor(source)})`;
}

function locatorFor(source) {
  if (validUrl(source.official_url)) {
    return { kind: "original", url: source.official_url, label: "Originalquelle öffnen" };
  }
  if (validUrl(source.catalog_url)) {
    return { kind: "catalog", url: source.catalog_url, label: "Bibliografischen Katalognachweis öffnen" };
  }
  if (String(source.doi || "").trim()) {
    return { kind: "original", url: `https://doi.org/${String(source.doi).trim()}`, label: "Originalquelle öffnen" };
  }
  throw new Error(`${source.id}: Es fehlt eine Originalquelle oder ein transparenter Katalognachweis.`);
}

function markdownLocator(source) {
  const locator = locatorFor(source);
  if (locator.kind === "catalog") return `[Bibliografischer Katalognachweis (kein Volltext)](${locator.url})`;
  return `[Originalquelle](${locator.url})`;
}

function bibEscape(value) {
  return String(value || "").replace(/([{}])/g, "\\$1");
}

function bibKey(id) {
  return String(id).replace(/-/g, "_");
}

function bibType(source) {
  if (source.source_type === "book") return "book";
  if (source.source_type === "article") return "article";
  if (source.source_type === "report") return "techreport";
  return "misc";
}

function bibliographyMarkdown(sources, lastUpdated) {
  const lines = [
    "# Bibliografie der Wirkungsökonomie",
    "",
    `Stand: ${lastUpdated}`,
    "",
    "Direkte Quellenlinks führen zur Originalquelle. Ein ausdrücklich als Katalognachweis gekennzeichneter Link dient dem bibliografischen Auffinden und ist kein Volltext.",
    ""
  ];
  for (const source of sources) {
    const publisher = [source.publisher_or_issuer, source.journal_or_series].filter(Boolean).join(". ");
    lines.push(`- **${source.author_or_institution}** (${source.year}): *${source.title}*. ${publisher ? `${publisher}. ` : ""}${markdownLocator(source)} · ${markdownArchiveLink(source)}`.trim());
  }
  return `${lines.join("\n")}\n`;
}

function bibliographyBibtex(sources) {
  return `${sources.map((source) => {
    const locator = locatorFor(source);
    const notes = [
      locator.kind === "catalog" ? "Bibliografischer Katalognachweis; kein Volltext." : "",
      `Wirkungsökonomie-Quellensteckbrief: https://wirkungsoekonomie.de${archiveUrlFor(source)}`
    ].filter(Boolean).join(" ");
    const fields = [
      ["title", source.title],
      ["author", source.author_or_institution],
      ["year", source.year],
      ["publisher", source.publisher_or_issuer],
      ["journal", source.journal_or_series],
      ["doi", source.doi],
      ["isbn", source.isbn],
      ["url", locator.url],
      ["note", notes]
    ].filter((entry) => entry && String(entry[1] || "").trim());
    return `@${bibType(source)}{${bibKey(source.id)},\n${fields.map(([field, value]) => `  ${field} = {${bibEscape(value)}}`).join(",\n")}\n}`;
  }).join("\n\n")}\n`;
}

function updateBibliographyJson(registry) {
  const bibliography = readJson(BIBLIOGRAPHY_JSON_PATH);
  const registryById = new Map(registry.sources.map((source) => [source.id, source]));
  const bibliographyIds = new Set((bibliography.items || []).map((source) => source.id));
  const errors = [];

  for (const source of registry.sources) {
    if (!bibliographyIds.has(source.id)) errors.push(`${source.id}: fehlt in bibliography.json.`);
  }
  for (const source of bibliography.items || []) {
    if (!registryById.has(source.id)) errors.push(`${source.id}: fehlt im Evidenzregister.`);
  }
  if (errors.length) throw new Error(errors.join("\n"));

  const items = bibliography.items.map((source) => {
    const registrySource = registryById.get(source.id);
    const next = { ...source };
    if (registrySource.catalog_url) next.catalog_url = registrySource.catalog_url;
    else delete next.catalog_url;
    for (const field of [
      "archive_code",
      "archive_url",
      "archive_title_relation",
      "archive_locator_relation",
      "archive_locator_note"
    ]) {
      if (registrySource[field]) next[field] = registrySource[field];
      else delete next[field];
    }
    return next;
  });
  const next = {
    ...bibliography,
    metadata: { ...bibliography.metadata, last_updated: registry.metadata.last_updated },
    items
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}

function sourceCardLink(source) {
  const locator = locatorFor(source);
  const archiveUrl = archiveUrlFor(source);
  const note = locator.kind === "catalog"
    ? '<p class="source-locator-note">Bibliografischer Katalognachweis: kein Volltext; Angaben bitte an der Originalausgabe prüfen.</p>'
    : "";
  return `<a class="text-link" href="${escapeHtml(locator.url)}" target="_blank" rel="noopener noreferrer" data-source-id="${escapeHtml(source.id)}" data-source-locator="${locator.kind}">${locator.label}</a><span class="source-card-link-separator" aria-hidden="true"> · </span><a class="text-link source-card-archive-link" href="..${escapeHtml(archiveUrl)}" data-source-id="${escapeHtml(source.id)}" data-source-archive-code="${escapeHtml(source.archive_code)}">Quellensteckbrief</a>${note}`;
}

const EVIDENCE_SUPPLEMENT_START = "<!-- evidence-registry-supplement:start -->";
const EVIDENCE_SUPPLEMENT_END = "<!-- evidence-registry-supplement:end -->";

function sourceCard(source) {
  const claims = (source.supports_claims || []).filter(Boolean).join(" ");
  const limits = source.limitations || (source.does_not_support || []).filter(Boolean).join(" ");
  return `<article class="source-card">
            <p class="card-kicker">${escapeHtml(source.source_type || "Quelle")} · Qualität ${escapeHtml(source.source_quality || "")}</p>
            <h3>${escapeHtml(source.author_or_institution)} - ${escapeHtml(source.title)}</h3>
            ${source.year ? `<p><strong>Jahr:</strong> ${escapeHtml(source.year)}</p>` : ""}
            ${source.woek_relevance ? `<p><strong>WÖk-Bezug:</strong> ${escapeHtml(source.woek_relevance)}</p>` : ""}
            ${claims ? `<p><strong>Stützt:</strong> ${escapeHtml(claims)}</p>` : ""}
            ${limits ? `<p><strong>Grenze:</strong> ${escapeHtml(limits)}</p>` : ""}
            ${sourceCardLink(source)}
          </article>`;
}

function stripEvidenceSupplement(html) {
  return String(html).replace(/\s*<!-- evidence-registry-supplement:start -->[\s\S]*?<!-- evidence-registry-supplement:end -->\s*/g, "\n");
}

function sourceIdsIn(html) {
  const ids = new Set();
  for (const match of String(html).matchAll(/\bdata-source-id=(?:"([^"]+)"|'([^']+)')/g)) {
    ids.add(match[1] || match[2]);
  }
  return ids;
}

function evidenceSupplement(sources) {
  if (!sources.length) return "";
  return `${EVIDENCE_SUPPLEMENT_START}
      <section class="section" aria-labelledby="vollstaendiges-evidenzregister">
        <div class="section-header">
          <h2 id="vollstaendiges-evidenzregister">Weitere Quellen des Evidenzregisters</h2>
          <p>Diese Rechtsquellen, Standards und fachlichen Referenzen sind ebenfalls vollständig mit ihrem Quellensteckbrief verknüpft.</p>
        </div>
        <div class="source-grid">
${sources.map((source) => `          ${sourceCard(source)}`).join("\n")}
        </div>
      </section>
      ${EVIDENCE_SUPPLEMENT_END}`;
}

function withEvidenceSupplement(html, sources) {
  const supplement = evidenceSupplement(sources);
  const existingPattern = /<!-- evidence-registry-supplement:start -->[\s\S]*?<!-- evidence-registry-supplement:end -->/;
  if (!supplement) return stripEvidenceSupplement(html);
  if (existingPattern.test(html)) return html.replace(existingPattern, supplement);
  if (!html.includes("</main>")) throw new Error("quellen/bibliografie.html: </main> für Evidenzregister-Ergänzung fehlt.");
  return html.replace("</main>", `\n${supplement}\n</main>`);
}

function updateSourcePage(file, sourceByCardKey) {
  const current = fs.readFileSync(file, "utf8");
  let matches = 0;
  const next = current.replace(/<article\b[^>]*\bclass=(?:"[^"]*\bsource-card\b[^"]*"|'[^']*\bsource-card\b[^']*')[^>]*>[\s\S]*?<\/article>/gi, (card) => {
    const heading = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
    if (!heading) throw new Error(`${file}: Quellenkarte ohne h3 gefunden.`);
    const source = sourceByCardKey.get(key(heading[1]));
    if (!source) throw new Error(`${file}: Quellenkarte nicht im Evidenzregister gefunden: ${textContent(heading[1])}`);
    matches += 1;
    const replacement = sourceCardLink(source);
    const linkPattern = /<a\b[^>]*\bclass=(?:"[^"]*\btext-link\b[^"]*"|'[^']*\btext-link\b[^']*')[^>]*>(?:Originalquelle öffnen|Bibliografischen Katalognachweis öffnen)<\/a>(?:\s*<span\b[^>]*\bsource-card-link-separator\b[^>]*>[\s\S]*?<\/span>\s*<a\b[^>]*\bsource-card-archive-link\b[^>]*>Quellensteckbrief<\/a>)?(?:<p class="source-locator-note">[\s\S]*?<\/p>)?/i;
    if (!linkPattern.test(card)) throw new Error(`${file}: Quellenlink nicht aktualisierbar: ${textContent(heading[1])}`);
    return card.replace(linkPattern, replacement);
  });
  if (!matches) throw new Error(`${file}: Keine Quellenkarten gefunden.`);
  return next;
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const sources = (registry.sources || []).filter((source) => source.public_display !== false);
  const errors = [];
  const sourceByCardKey = new Map();

  for (const source of sources) {
    if (!source.id || !source.title || !source.author_or_institution) {
      errors.push("Evidenzregister enthält eine Quelle ohne ID, Titel oder Urheber.");
      continue;
    }
    try {
      locatorFor(source);
    } catch (error) {
      errors.push(error.message);
    }
    try {
      archiveUrlFor(source);
    } catch (error) {
      errors.push(error.message);
    }
    const cardKey = bibliographyCardKey(source);
    if (sourceByCardKey.has(cardKey)) errors.push(`${source.id}: doppelte Kartenkennung im Evidenzregister.`);
    sourceByCardKey.set(cardKey, source);
  }
  if (errors.length) throw new Error(errors.join("\n"));

  const pageOutputs = new Map();
  for (const page of SOURCE_PAGES) pageOutputs.set(page, updateSourcePage(page, sourceByCardKey));
  const coveredIds = new Set();
  for (const content of pageOutputs.values()) {
    for (const id of sourceIdsIn(stripEvidenceSupplement(content))) coveredIds.add(id);
  }
  const supplementarySources = sources.filter((source) => !coveredIds.has(source.id));
  pageOutputs.set("quellen/bibliografie.html", withEvidenceSupplement(pageOutputs.get("quellen/bibliografie.html"), supplementarySources));

  const outputs = [
    [BIBLIOGRAPHY_JSON_PATH, updateBibliographyJson(registry)],
    [BIBLIOGRAPHY_MD_PATH, bibliographyMarkdown(sources, registry.metadata.last_updated)],
    [BIBLIOGRAPHY_BIB_PATH, bibliographyBibtex(sources)]
  ];
  for (const page of SOURCE_PAGES) outputs.push([page, pageOutputs.get(page)]);

  const changed = outputs.filter(([file, content]) => writeIfChanged(file, content)).map(([file]) => file);
  if (CHECK_ONLY && changed.length) {
    throw new Error(`Bibliografie-Exporte sind nicht synchron: ${changed.join(", ")}`);
  }
  console.log(changed.length ? `Bibliografie-Exporte aktualisiert: ${changed.join(", ")}` : "Bibliografie-Exporte sind aktuell.");
}

main();

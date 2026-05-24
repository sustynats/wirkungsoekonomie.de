import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = path.join(
  ROOT,
  "docs/bestandsschutz-sanierung/source/bestandseinschaetzung_raenge_0_bis_14_v1_0.csv",
);
const OUT_JSON = path.join(ROOT, "data/content_quality/bestandsschutz_review_v1_0.json");
const OUT_MD = path.join(ROOT, "docs/content-quality/bestandsschutz_review_v1_0.md");
const TODAY = "2026-05-24";

const MIN_DETAIL_WORDS = 4500;
const MIN_DOSSIER_WORDS = 3000;

const forbiddenPublicTerms = [
  "CodeX",
  "Codex",
  "Repository",
  "Build",
  "Sitemap",
  "Dateien anlegen",
  "bitte prüfen",
  "Toolaufruf",
  "Prompt",
  "ChatGPT",
  "Python",
  "interne Aufgabe",
  "Abschlussbericht",
  "Umsetzungsanweisung",
];

const rankRoots = [
  {
    rang: 0,
    portal: "SDG-/SDG+-Referenzrahmen",
    roots: ["verstehen/sdgs-sdgplus"],
    baseLabel: "Referenzportal",
  },
  {
    rang: 1,
    portal: "Produkte & Konsum / Wirkungsumsatzsteuer",
    roots: ["wirkungsfelder/produkte-konsum"],
    baseLabel: "Portal-Grundkonzept",
  },
  {
    rang: 2,
    portal: "Impact Controlling / T-SROI / WÖk-IDs / Scorecards",
    roots: ["werkzeuge/impact-controlling", "werkzeuge/t-sroi", "werkzeuge/netto-wirkungs-index", "werkzeuge/scorecards", "werkzeuge/woek-ids"],
    baseLabel: "Methodenportal",
  },
  {
    rang: 3,
    portal: "Staat, Recht & Demokratie / WStG / Wirkungsrat",
    roots: ["wirkungsfelder/staat-recht-demokratie", "werkstatt/dossiers/staat-recht-demokratie", "werkstatt/gesetze/wirkungssteuergesetz"],
    baseLabel: "Rechts- und Governance-Portal",
  },
  { rang: 4, portal: "Wirtschaft & Unternehmen", roots: ["wirkungsfelder/wirtschaft-unternehmen"], baseLabel: "Portal-Grundkonzept" },
  { rang: 5, portal: "Wohnen & Stadt", roots: ["wirkungsfelder/wohnen-stadt"], baseLabel: "Portal-Grundkonzept" },
  { rang: 6, portal: "Arbeit & Einkommen / Automatisierung", roots: ["wirkungsfelder/arbeit-einkommen"], baseLabel: "Portal-Grundkonzept" },
  { rang: 7, portal: "Rente & soziale Sicherung", roots: ["wirkungsfelder/rente-soziale-sicherung"], baseLabel: "Portal-Grundkonzept" },
  { rang: 8, portal: "Bildung / Wirkungsschule", roots: ["wirkungsfelder/bildung"], baseLabel: "Portal-Grundkonzept" },
  { rang: 9, portal: "Medien, Social Media, Journalismus & Öffentlichkeit", roots: ["wirkungsfelder/medien-oeffentlichkeit"], baseLabel: "Portal-Grundkonzept" },
  { rang: 10, portal: "Gesundheit & Pflege", roots: ["wirkungsfelder/gesundheit-pflege"], baseLabel: "Portal-Grundkonzept" },
  { rang: 11, portal: "Wissenschaft, Innovation & Digitalisierung", roots: ["wirkungsfelder/wissenschaft-innovation-digitalisierung"], baseLabel: "Portal-Grundkonzept" },
  { rang: 12, portal: "Finanzsystem & Kapital", roots: ["wirkungsfelder/finanzsystem-kapital"], baseLabel: "Portal-Grundkonzept" },
  { rang: 13, portal: "Klima, Energie & Ressourcen", roots: ["wirkungsfelder/klima-energie-ressourcen"], baseLabel: "Portal-Grundkonzept" },
  { rang: 14, portal: "Kultur, Identität & Resonanz", roots: ["wirkungsfelder/kultur-identitaet-resonanz"], baseLabel: "Portal-Grundkonzept" },
];

const specialComplete = new Set([
  "verstehen/sdgs-sdgplus/detailkonzepte/sdgs-und-agenda-2030-als-globaler-referenzrahmen/index.html",
  "verstehen/sdgs-sdgplus/detailkonzepte/sdgplus-als-erweiterung-der-wirkungsoekonomie/index.html",
  "verstehen/sdgs-sdgplus/detailkonzepte/sdg-unterziele-global-europa-und-deutschland/index.html",
  "verstehen/sdgs-sdgplus/geschichte/index.html",
  "verstehen/sdgs-sdgplus/risikomanagement-finanzmarkt/index.html",
  "wirkungsfelder/wohnen-stadt/detailkonzepte/investoren-vermieter/index.html",
  "wirkungsfelder/wohnen-stadt/dossiers/investoren-vermieter/index.html",
]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((items) => items.some((item) => item.trim()));
  return body.map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ""])));
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlFilesUnder(root) {
  const base = path.join(ROOT, root);
  if (!fs.existsSync(base)) {
    return [];
  }
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile() && entry.name === "index.html") {
        files.push(path.relative(ROOT, absolute));
      }
    }
  };
  walk(base);
  return files;
}

function countMatches(html, regex) {
  return (html.match(regex) || []).length;
}

function publicUrl(rel) {
  return `/${rel.replace(/index\.html$/, "").replace(/\/+$/, "")}/`.replaceAll("//", "/");
}

function classifyPath(rel, rootConfig) {
  if (rootConfig.roots.some((root) => rel === `${root}/index.html`)) {
    return "portal_einstieg";
  }
  if (rel.includes("/detailkonzepte/")) {
    return "detailkonzept_kandidat";
  }
  if (rel.includes("/dossiers/") || rel.includes("/dossier/")) {
    return "dossier_kandidat";
  }
  if (rel.includes("/tools/") || rel.startsWith("werkzeuge/")) {
    return "methodenpapier_tool";
  }
  if (rel.includes("/gesetze/") || rel.includes("/leitlinien/")) {
    return "lawreader_rechtsgrundlage";
  }
  if (rel.includes("/arbeitsbibliothek/")) {
    return "arbeitsbibliothek";
  }
  return "unterbereich_kurzprofil";
}

function labelFor({ rel, pageKind, wordCount, downloadCount, rootConfig }) {
  if (specialComplete.has(rel)) {
    if (pageKind === "dossier_kandidat") return "Dossier veröffentlicht";
    return "Detailkonzept veröffentlicht";
  }
  if (pageKind === "portal_einstieg") return `${rootConfig.baseLabel} / Portal-Einstieg`;
  if (pageKind === "methodenpapier_tool") return "Methodenpapier / Tool-Spezifikation / Werkzeugseite";
  if (pageKind === "lawreader_rechtsgrundlage") return "Rechtsgrundlage / LawReader / Leitlinie";
  if (pageKind === "arbeitsbibliothek") return "Arbeitsbibliothek / Materialgrundlage";
  if (pageKind === "detailkonzept_kandidat") {
    if (wordCount >= MIN_DETAIL_WORDS && downloadCount > 0) return "Detailkonzept veröffentlicht";
    return "Kurzüberblick / Detailkonzept in Arbeit";
  }
  if (pageKind === "dossier_kandidat") {
    if (wordCount >= MIN_DOSSIER_WORDS && downloadCount > 0) return "Dossier veröffentlicht";
    return "Kurzüberblick / Dossier in Arbeit";
  }
  return "Kurzprofil / Unterbereich";
}

function decisionFor({ pageKind, recommendedLabel, issues }) {
  if (issues.some((issue) => issue.includes("Interne"))) return "bereinigen";
  if (recommendedLabel.includes("Kurzüberblick / Detailkonzept") || recommendedLabel.includes("Kurzüberblick / Dossier")) {
    return "umbenennen_und_vertiefen";
  }
  if (pageKind === "portal_einstieg" || pageKind === "unterbereich_kurzprofil") return "behalten_und_richtig_einordnen";
  if (pageKind === "methodenpapier_tool") return "als_methodenpapier_fuehren";
  return "behalten";
}

function statusBadgesFor({ recommendedLabel, downloadCount, issueCount }) {
  const badges = [];
  if (recommendedLabel.includes("Portal")) badges.push("Portal-Grundkonzept vorhanden");
  if (recommendedLabel.includes("Kurz")) badges.push("Kurzüberblick vorhanden");
  if (recommendedLabel.includes("Detailkonzept veröffentlicht")) badges.push("Detailkonzept veröffentlicht");
  if (recommendedLabel.includes("Dossier veröffentlicht")) badges.push("Dossier veröffentlicht");
  if (recommendedLabel.includes("Methodenpapier")) badges.push("Methodenpapier / Toolstatus");
  if (recommendedLabel.includes("in Arbeit")) badges.push("Vertiefung in Arbeit");
  badges.push(downloadCount > 0 ? "Downloads vorhanden" : "Downloads prüfen");
  badges.push(issueCount === 0 ? "öffentlicher Inhalt unauffällig" : "Qualität prüfen");
  return [...new Set(badges)];
}

const rankAssessment = fs.existsSync(SOURCE) ? parseCsv(fs.readFileSync(SOURCE, "utf8")) : [];
const pages = [];
const seen = new Set();

for (const rootConfig of rankRoots) {
  for (const root of rootConfig.roots) {
    for (const rel of htmlFilesUnder(root)) {
      if (seen.has(rel)) continue;
      seen.add(rel);
      const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const text = stripHtml(html);
      const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
      const downloadCount = countMatches(html, /href="[^"]+\.(?:docx|pdf|xlsx|csv|json|md)(?:#[^"]*)?"/gi);
      const headingCount = countMatches(html, /<h[2-3][\s>]/gi);
      const tableCount = countMatches(html, /<table[\s>]/gi);
      const pageKind = classifyPath(rel, rootConfig);
      const internalTerms = forbiddenPublicTerms.filter((term) => html.includes(term));
      const issues = [];

      if (internalTerms.length) issues.push("Interne oder technische Arbeitsbegriffe prüfen");
      if ((pageKind === "detailkonzept_kandidat" || pageKind === "dossier_kandidat") && downloadCount === 0) {
        issues.push("Downloadlink fehlt oder ist nicht eindeutig");
      }
      if (pageKind === "detailkonzept_kandidat" && wordCount < MIN_DETAIL_WORDS && !specialComplete.has(rel)) {
        issues.push("Als Detailkonzept zu kurz");
      }
      if (pageKind === "dossier_kandidat" && wordCount < MIN_DOSSIER_WORDS && !specialComplete.has(rel)) {
        issues.push("Als Dossier zu kurz");
      }
      if (tableCount > 0 && !/table-responsive|responsive-table|overflow-x|data-label/i.test(html)) {
        issues.push("Tabellen-Responsivität prüfen");
      }
      if (headingCount < 3 && (pageKind === "detailkonzept_kandidat" || pageKind === "dossier_kandidat")) {
        issues.push("Inhaltsstruktur wirkt zu flach");
      }

      const recommendedLabel = labelFor({ rel, pageKind, wordCount, downloadCount, rootConfig });
      const bestandsentscheidung = decisionFor({ pageKind, recommendedLabel, issues });
      pages.push({
        rang: rootConfig.rang,
        portal: rootConfig.portal,
        path: rel,
        url: publicUrl(rel),
        page_kind: pageKind,
        current_label_detected: /Detailkonzept/i.test(html)
          ? "Detailkonzept"
          : /Dossier/i.test(html)
            ? "Dossier"
            : /Konzept/i.test(html)
              ? "Konzept"
              : "",
        recommended_public_label: recommendedLabel,
        bestandsentscheidung,
        status_badges: statusBadgesFor({ recommendedLabel, downloadCount, issueCount: issues.length }),
        word_count: wordCount,
        download_links_count: downloadCount,
        heading_count: headingCount,
        table_count: tableCount,
        qa_no_internal_instructions: internalTerms.length === 0 ? "bestanden" : "offen",
        issues,
      });
    }
  }
}

const summary = pages.reduce(
  (acc, page) => {
    acc.total_pages += 1;
    acc.by_decision[page.bestandsentscheidung] = (acc.by_decision[page.bestandsentscheidung] || 0) + 1;
    acc.by_label[page.recommended_public_label] = (acc.by_label[page.recommended_public_label] || 0) + 1;
    if (page.issues.length) acc.pages_with_issues += 1;
    return acc;
  },
  { total_pages: 0, pages_with_issues: 0, by_decision: {}, by_label: {} },
);

const wrongLabelReview = pages
  .filter((page) => page.bestandsentscheidung !== "behalten" || page.issues.length)
  .sort((a, b) => a.rang - b.rang || a.path.localeCompare(b.path));

const payload = {
  generated_at: `${TODAY}T00:00:00+02:00`,
  source_matrix: "/docs/bestandsschutz-sanierung/source/bestandseinschaetzung_raenge_0_bis_14_v1_0.csv",
  classification_rules: {
    bestandsschutz: "Bestehende Inhalte bleiben erhalten und werden korrekt eingeordnet.",
    shallow_detail_label: "Kurzüberblick / Detailkonzept in Arbeit",
    shallow_dossier_label: "Kurzüberblick / Dossier in Arbeit",
    detailkonzept_min_words: MIN_DETAIL_WORDS,
    dossier_min_words: MIN_DOSSIER_WORDS,
  },
  rank_assessment: rankAssessment,
  summary,
  pages,
  wrong_label_review: wrongLabelReview,
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const md = [
  "# Bestandsschutz-Review v1.0",
  "",
  `Stand: ${TODAY}`,
  "",
  "Dieses Register trennt Portal-Einstieg, Kurzüberblick, Methodenpapier, Detailkonzept, Dossier und Arbeitsstand. Bestehende Inhalte werden nicht pauschal ersetzt, sondern fachlich richtig eingeordnet.",
  "",
  "## Zusammenfassung",
  "",
  `- Geprüfte Seiten: ${summary.total_pages}`,
  `- Seiten mit offenen Punkten: ${summary.pages_with_issues}`,
  "",
  "## Entscheidungen",
  "",
  ...Object.entries(summary.by_decision).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Review-Liste",
  "",
  "| Rang | Portal | URL | Empfehlung | Entscheidung | Offene Punkte |",
  "|---:|---|---|---|---|---|",
  ...wrongLabelReview.map((page) => `| ${page.rang} | ${page.portal.replaceAll("|", "/")} | ${page.url} | ${page.recommended_public_label} | ${page.bestandsentscheidung} | ${page.issues.join("<br>") || "-"} |`),
  "",
].join("\n");

fs.writeFileSync(OUT_MD, md, "utf8");

console.log(`Wrote ${path.relative(ROOT, OUT_JSON)} with ${pages.length} pages.`);
console.log(`Wrote ${path.relative(ROOT, OUT_MD)}.`);
console.log(JSON.stringify(summary, null, 2));

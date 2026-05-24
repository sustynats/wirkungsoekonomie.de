import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MATRIX = path.join(ROOT, "docs/sanierung-detaildossiers/source/sanierungsmatrix_raenge_0_bis_13_v1_0.csv");
const OUT = path.join(ROOT, "data/content_quality/detaildossier_sanierung_status.json");
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

const portalConfig = new Map([
  ["SDG-/SDG+-Referenzrahmen", { slug: "sdgs-sdgplus", kind: "verstehen", bases: ["verstehen/sdgs-sdgplus"] }],
  ["Produkte & Konsum / Wirkungsumsatzsteuer", { slug: "produkte-konsum", kind: "wirkungsfelder", bases: ["wirkungsfelder/produkte-konsum"] }],
  ["Impact Controlling / T-SROI / WÖk-IDs / Scorecards", { slug: "impact-controlling", kind: "werkzeuge", bases: ["werkzeuge/impact-controlling"] }],
  ["Staat, Recht & Demokratie / WStG / Wirkungsrat", { slug: "staat-recht-demokratie", kind: "wirkungsfelder", bases: ["wirkungsfelder/staat-recht-demokratie", "werkstatt/dossiers/staat-recht-demokratie"] }],
  ["Wirtschaft & Unternehmen", { slug: "wirtschaft-unternehmen", kind: "wirkungsfelder", bases: ["wirkungsfelder/wirtschaft-unternehmen"] }],
  ["Wohnen & Stadt", { slug: "wohnen-stadt", kind: "wirkungsfelder", bases: ["wirkungsfelder/wohnen-stadt"] }],
  ["Arbeit & Einkommen / Automatisierung", { slug: "arbeit-einkommen", kind: "wirkungsfelder", bases: ["wirkungsfelder/arbeit-einkommen"] }],
  ["Rente & soziale Sicherung", { slug: "rente-soziale-sicherung", kind: "wirkungsfelder", bases: ["wirkungsfelder/rente-soziale-sicherung"] }],
  ["Bildung / Wirkungsschule", { slug: "bildung", kind: "wirkungsfelder", bases: ["wirkungsfelder/bildung"] }],
  ["Medien, Social Media, Journalismus & Öffentlichkeit", { slug: "medien-oeffentlichkeit", kind: "wirkungsfelder", bases: ["wirkungsfelder/medien-oeffentlichkeit"] }],
  ["Gesundheit & Pflege", { slug: "gesundheit-pflege", kind: "wirkungsfelder", bases: ["wirkungsfelder/gesundheit-pflege"] }],
  ["Wissenschaft, Innovation & Digitalisierung", { slug: "wissenschaft-innovation-digitalisierung", kind: "wirkungsfelder", bases: ["wirkungsfelder/wissenschaft-innovation-digitalisierung"] }],
  ["Finanzsystem & Kapital", { slug: "finanzsystem-kapital", kind: "wirkungsfelder", bases: ["wirkungsfelder/finanzsystem-kapital"] }],
  ["Klima, Energie & Ressourcen", { slug: "klima-energie-ressourcen", kind: "wirkungsfelder", bases: ["wirkungsfelder/klima-energie-ressourcen"] }],
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

function exists(rel) {
  return Boolean(rel) && fs.existsSync(path.join(ROOT, rel));
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

function wordCountForHtml(rel) {
  if (!exists(rel)) return 0;
  const text = stripHtml(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function containsInternalInstructions(rel) {
  if (!exists(rel)) return false;
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  return forbiddenPublicTerms.some((term) => html.includes(term));
}

function slugVariants(slug) {
  const normalized = slug.replaceAll("ö", "oe").replaceAll("ä", "ae").replaceAll("ü", "ue").replaceAll("ß", "ss");
  return [...new Set([
    slug,
    normalized,
    slug.replaceAll("-", "_"),
    normalized.replaceAll("-", "_"),
    slug.replaceAll("_", "-"),
    normalized.replaceAll("_", "-"),
  ])];
}

function candidateHtml(config, slug, type) {
  const segment = type === "detail" ? "detailkonzepte" : "dossiers";
  const candidates = [];
  for (const base of config.bases) {
    for (const variant of slugVariants(slug)) {
      candidates.push(`${base}/${segment}/${variant}/index.html`);
    }
  }
  return candidates;
}

function findFirstExisting(candidates) {
  return candidates.find(exists) || "";
}

function findDownload(config, slug, type) {
  const prefix = type === "detail" ? "detailkonzept" : "dossier";
  const variants = slugVariants(slug);
  const candidates = [];
  for (const variant of variants) {
    candidates.push(`assets/downloads/woek_${config.slug}_${prefix}_${variant}_v0_4.docx`);
    candidates.push(`assets/downloads/woek_${config.slug}_${prefix}_${variant}_v0_3.docx`);
    candidates.push(`assets/downloads/woek_${config.slug}_${prefix}_${variant}_v0_2.docx`);
    candidates.push(`assets/downloads/woek_${config.slug}_${prefix}_${variant}_v0_1.docx`);
    candidates.push(`assets/downloads/woek_${prefix}_${variant}_v0_1.docx`);
  }
  const setCandidates = type === "detail"
    ? [
        `assets/downloads/woek_${config.slug}_detailkonzepte_umfangreich_v0_4.docx`,
        `assets/downloads/woek_${config.slug}_detailkonzepte_umfangreich_v0_3.docx`,
        `assets/downloads/woek_${config.slug}_detailkonzepte_umfangreich_v0_2.docx`,
        `assets/downloads/woek_${config.slug}_detailkonzepte_umfangreich_v0_1.docx`,
      ]
    : [
        `assets/downloads/woek_${config.slug}_einzeldossier_set_v0_4.docx`,
        `assets/downloads/woek_${config.slug}_einzeldossier_set_v0_3.docx`,
        `assets/downloads/woek_${config.slug}_einzeldossier_set_v0_2.docx`,
        `assets/downloads/woek_${config.slug}_einzeldossier_set_v0_1.docx`,
      ];
  return findFirstExisting([...candidates, ...setCandidates]);
}

function statusFor({ html, download, minWords }) {
  const words = wordCountForHtml(html);
  if (!html && !download) return { status: "fehlt", words };
  if (!html || !download) return { status: "in_arbeit", words };
  if (words < minWords) return { status: "kurzfassung", words };
  if (containsInternalInstructions(html)) return { status: "in_arbeit", words };
  return { status: "vollständig", words };
}

function publicPath(rel) {
  if (!rel) return "";
  return `/${rel.replace(/index\.html$/, "").replace(/\/+$/, "")}/`.replaceAll("//", "/");
}

const rows = parseCsv(fs.readFileSync(MATRIX, "utf8"));
const items = rows.map((row) => {
  const config = portalConfig.get(row.portal) || { slug: row.portal.toLowerCase().replace(/[^a-z0-9]+/g, "-"), kind: "wirkungsfelder", bases: [] };
  const slug = row.slug_vorschlag;
  const detailHtml = findFirstExisting(candidateHtml(config, slug, "detail"));
  const dossierHtml = findFirstExisting(candidateHtml(config, slug, "dossier"));
  const detailDocx = findDownload(config, slug, "detail");
  const dossierDocx = findDownload(config, slug, "dossier");
  const detail = statusFor({ html: detailHtml, download: detailDocx, minWords: MIN_DETAIL_WORDS });
  const dossier = statusFor({ html: dossierHtml, download: dossierDocx, minWords: MIN_DOSSIER_WORDS });
  const internalOk = [detailHtml, dossierHtml].filter(Boolean).every((rel) => !containsInternalInstructions(rel));

  return {
    rang: Number(row.rang),
    portal: row.portal,
    unterbereich: row.unterbereich,
    slug,
    detailkonzept_status: detail.status,
    detailkonzept_docx: detailDocx,
    detailkonzept_html: publicPath(detailHtml),
    detailkonzept_word_count: detail.words,
    dossier_status: dossier.status,
    dossier_docx: dossierDocx,
    dossier_html: publicPath(dossierHtml),
    dossier_word_count: dossier.words,
    tool_status: row.toolbezug.includes("Pflicht") ? "zu_pruefen" : "nicht_erforderlich",
    website_status: detailHtml || dossierHtml ? "vorhanden_zu_pruefen" : "fehlt",
    qa_mobile: "offen",
    qa_downloads: detailDocx && dossierDocx ? "teilweise_geprueft" : "offen",
    qa_no_internal_instructions: internalOk ? "bestanden" : "offen",
    last_reviewed: TODAY,
  };
});

const byStatus = items.reduce((acc, item) => {
  acc.detailkonzepte[item.detailkonzept_status] = (acc.detailkonzepte[item.detailkonzept_status] || 0) + 1;
  acc.dossiers[item.dossier_status] = (acc.dossiers[item.dossier_status] || 0) + 1;
  return acc;
}, { detailkonzepte: {}, dossiers: {} });

const payload = {
  generated_at: `${TODAY}T00:00:00+02:00`,
  source_matrix: "/docs/sanierung-detaildossiers/source/sanierungsmatrix_raenge_0_bis_13_v1_0.csv",
  standard_reference: "/docs/sanierung-detaildossiers/source/woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0.docx",
  rules: {
    detailkonzept_min_words: MIN_DETAIL_WORDS,
    dossier_min_words: MIN_DOSSIER_WORDS,
    complete_requires_online_html: true,
    complete_requires_download: true,
    complete_requires_no_internal_instructions: true,
  },
  summary: {
    total_items: items.length,
    ...byStatus,
  },
  items,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Wrote ${path.relative(ROOT, OUT)} with ${items.length} entries.`);
console.log(JSON.stringify(payload.summary, null, 2));

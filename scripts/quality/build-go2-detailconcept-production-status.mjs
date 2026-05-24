import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = path.join(ROOT, "docs/go2-produktionsreihenfolge/source/woek_go2_produktionsreihenfolge_122_detailkonzepte_v1_0.csv");
const PACKAGES = path.join(ROOT, "docs/go2-produktionsreihenfolge/source/woek_go2_produktionspakete_v1_0.csv");
const METHOD = path.join(ROOT, "docs/go2-produktionsreihenfolge/source/woek_go2_methodentrack_21_c_themen_v1_0.csv");
const OUT = path.join(ROOT, "data/content_quality/go2_detailkonzept_production_status.json");

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
    if (char === '"') quoted = true;
    else if (char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [headers, ...body] = rows.filter((items) => items.some((item) => item.trim()));
  return body.map((items) => Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ""])));
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function route(slug, type) {
  return `verstehen/sdgs-sdgplus/${type}/${slug}/index.html`;
}

function download(slug, type) {
  return `assets/downloads/woek_sdgs-sdgplus_${type}_${slug}_v0_4.docx`;
}

const go3PackageOne = {
  "sdgs-und-agenda-2030-als-globaler-referenzrahmen": {
    detailHtml: "verstehen/sdgs-sdgplus/agenda-2030/index.html",
    detailDocx: "assets/downloads/01_woek_sdgs_agenda2030_referenzrahmen_detailkonzept_v1_0.docx",
  },
  "sdg-als-erweiterung-der-wirkungsoekonomie": {
    detailHtml: "verstehen/sdgs-sdgplus/sdgplus/index.html",
    detailDocx: "assets/downloads/02_woek_sdgplus_erweiterung_detailkonzept_v1_0.docx",
  },
  "sdg-unterziele-global-europa-und-deutschland": {
    detailHtml: "verstehen/sdgs-sdgplus/unterziele/index.html",
    detailDocx: "assets/downloads/03_woek_sdg_unterziele_global_europa_deutschland_detailkonzept_v1_0.docx",
  },
};

const detailRows = parseCsv(fs.readFileSync(SOURCE, "utf8"));
const packageRows = parseCsv(fs.readFileSync(PACKAGES, "utf8"));
const methodRows = parseCsv(fs.readFileSync(METHOD, "utf8"));

const items = detailRows.map((row) => {
  const slug = row.Slug;
  const override = go3PackageOne[slug] || {};
  const detailHtml = override.detailHtml || route(slug, "detailkonzepte");
  const dossierHtml = route(slug, "dossiers");
  const detailDocx = override.detailDocx || download(slug, "detailkonzept");
  const dossierDocx = download(slug, "dossier");
  return {
    gesamtfolge: Number(row.Gesamtfolge),
    produktionspaket: Number(row.Produktionspaket),
    position_im_paket: Number(row["Position im Paket"]),
    phase: row.Phase,
    phasentitel: row.Phasentitel,
    rang: Number(row.Rang),
    portal_bereich: row["Portal / Bereich"],
    unterbereich: row.Unterbereich,
    dokumenttyp: row.Dokumenttyp,
    prioritaet: row.Priorität,
    komplexitaet: row.Komplexität,
    slug,
    status: exists(detailHtml) && exists(detailDocx) ? "detailkonzept_online_und_download" : "offen",
    detailkonzept_html: exists(detailHtml) ? `/${detailHtml.replace(/index\.html$/, "")}` : "",
    detailkonzept_docx: exists(detailDocx) ? `/${detailDocx}` : "",
    dossier_html: exists(dossierHtml) ? `/${dossierHtml.replace(/index\.html$/, "")}` : "",
    dossier_docx: exists(dossierDocx) ? `/${dossierDocx}` : "",
    naechster_schritt: override.detailHtml ? "Go-3-v1-Detailkonzept ist als Online-Volltext und DOCX-Download integriert; Dossier bleibt als ergänzende Arbeitsfassung verlinkt." : row["Nächster Schritt"],
  };
});

const payload = {
  generated_at: "2026-05-24T00:00:00+02:00",
  source: "/docs/go2-produktionsreihenfolge/source/woek_go2_produktionsreihenfolge_122_detailkonzepte_v1_0.csv",
  expected: {
    a_detailkonzepte: 122,
    produktionspakete: 45,
    max_detailkonzepte_pro_paket: 3,
    c_methodentrack_themen: 21,
  },
  actual: {
    a_detailkonzepte: detailRows.length,
    produktionspakete: new Set(detailRows.map((row) => row.Produktionspaket)).size,
    c_methodentrack_themen: methodRows.length,
  },
  production_packages: packageRows,
  method_track_c_topics: methodRows,
  items,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${path.relative(ROOT, OUT)} with ${items.length} A-detail concepts.`);

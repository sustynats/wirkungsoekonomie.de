import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const portals = [
  {
    rel: "wirkungsfelder/produkte-konsum/index.html",
    basePath: "wirkungsfelder/produkte-konsum",
    label: "Produkte & Konsum",
    concept: ["Produktbesteuerung online lesen", "wirkungsfelder/produkte-konsum/produktbesteuerung-durch-wirkung/"],
    dossier: ["Dossier online lesen", "wirkungsfelder/produkte-konsum/dossier/"],
    detailIndex: ["Detailkonzepte online lesen", "wirkungsfelder/produkte-konsum/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "wirkungsfelder/produkte-konsum/dossiers/"],
    detailDownload: "assets/downloads/woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_konzeptpapier_v0_1.docx"],
      ["Dossier Word", "assets/downloads/woek_produkte_konsum_wirkungsumsatzsteuer_dossier_v0_1.docx"],
    ],
  },
  {
    rel: "werkzeuge/impact-controlling/index.html",
    basePath: "werkzeuge/impact-controlling",
    label: "Impact Controlling",
    concept: ["Methodik online lesen", "werkzeuge/impact-controlling/"],
    dossier: ["Gesamtdossier online lesen", "werkzeuge/impact-controlling/dossier/"],
    detailIndex: ["Detailkonzepte online lesen", "werkzeuge/impact-controlling/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "werkzeuge/impact-controlling/dossiers/"],
    detailDownload: "assets/downloads/woek_impact_controlling_detailkonzepte_umfangreich_v0_2.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_impact_controlling_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_impact_controlling_gesamtdossier_v0_1.docx"],
    ],
  },
  {
    rel: "wirkungsfelder/staat-recht-demokratie/index.html",
    basePath: "werkstatt/dossiers/staat-recht-demokratie",
    label: "Staat, Recht & Demokratie",
    concept: ["Portal online lesen", "wirkungsfelder/staat-recht-demokratie/"],
    dossier: ["Dossierbereich online lesen", "werkstatt/dossiers/staat-recht-demokratie/"],
    detailIndex: ["Detailkonzepte online lesen", "werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "werkstatt/dossiers/staat-recht-demokratie/dossiers/"],
    detailDownload: "assets/downloads/woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_staat_recht_demokratie_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_staat_recht_demokratie_gesamtdossier_v0_1.docx"],
    ],
  },
  {
    rel: "wirkungsfelder/wirtschaft-unternehmen/index.html",
    basePath: "wirkungsfelder/wirtschaft-unternehmen",
    label: "Wirtschaft & Unternehmen",
    concept: ["Konzeptpapier online lesen", "wirkungsfelder/wirtschaft-unternehmen/konzeptpapier/"],
    dossier: ["Gesamtdossier online lesen", "werkstatt/dossiers/wirtschaft-unternehmen/"],
    detailIndex: ["Detailkonzepte online lesen", "wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "wirkungsfelder/wirtschaft-unternehmen/dossiers/"],
    detailDownload: "assets/downloads/woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_wirtschaft_unternehmen_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.docx"],
    ],
    topicAliases: {
      resiliente_wertschoepfungskette: "Beschaffung, Lieferantenentwicklung und resiliente Wertschöpfungsketten",
      impact_controlling_im_unternehmen: "Impact Controlling, Wirkungscontrolling und KII statt KPI",
      produktportfolio_produktentwicklung: "Produktentwicklung, Produktportfolio und Kreislaufwirtschaft",
      risikomanagement_wirkungsrisiko_erm: "Risikomanagement, Wirkungsrisiko und Resilienz im ERM",
      marketing_fuenftes_p_planet: "Marketing, Vertrieb und das fünfte P: Planet",
    },
    downloadAliases: {
      finanzmarktanforderungen: {
        detail: "assets/downloads/woek_wirtschaft_unternehmen_finanzmarktanforderungen_detailkonzept_v0_2.docx",
        dossier: "assets/downloads/woek_wirtschaft_unternehmen_finanzmarktanforderungen_dossier_v0_2.docx",
      },
    },
  },
  {
    rel: "wirkungsfelder/wohnen-stadt/index.html",
    basePath: "wirkungsfelder/wohnen-stadt",
    label: "Wohnen & Stadt",
    concept: ["Konzept online lesen", "wirkungsfelder/wohnen-stadt/konzept/"],
    dossier: ["Gesamtdossier online lesen", "wirkungsfelder/wohnen-stadt/dossier/"],
    detailIndex: ["Detailkonzepte online lesen", "wirkungsfelder/wohnen-stadt/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "wirkungsfelder/wohnen-stadt/dossiers/"],
    detailDownload: "assets/downloads/woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_wohnen_stadt_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_wohnen_stadt_gesamtdossier_v0_1.docx"],
    ],
  },
  {
    rel: "wirkungsfelder/arbeit-einkommen/index.html",
    basePath: "wirkungsfelder/arbeit-einkommen",
    label: "Arbeit & Einkommen",
    concept: ["Konzeptpapier online lesen", "wirkungsfelder/arbeit-einkommen/konzeptpapier/"],
    dossier: ["Gesamtdossier online lesen", "wirkungsfelder/arbeit-einkommen/gesamtdossier/"],
    detailIndex: ["Detailkonzepte online lesen", "wirkungsfelder/arbeit-einkommen/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "wirkungsfelder/arbeit-einkommen/dossiers/"],
    detailDownload: "assets/downloads/woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx",
    dossierDownload: "assets/downloads/woek_arbeit_einkommen_einzeldossier_set_v0_1.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_arbeit_einkommen_automatisierung_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_arbeit_einkommen_automatisierung_gesamtdossier_v0_1.docx"],
    ],
    keepExisting: true,
  },
  {
    rel: "wirkungsfelder/rente-soziale-sicherung/index.html",
    basePath: "wirkungsfelder/rente-soziale-sicherung",
    label: "Rente & soziale Sicherung",
    concept: ["Konzept online lesen", "wirkungsfelder/rente-soziale-sicherung/konzept/"],
    dossier: ["Gesamtdossier online lesen", "wirkungsfelder/rente-soziale-sicherung/dossier/"],
    detailIndex: ["Detailkonzepte online lesen", "wirkungsfelder/rente-soziale-sicherung/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "wirkungsfelder/rente-soziale-sicherung/dossiers/"],
    detailDownload: "assets/downloads/woek_rente_soziale_sicherung_detailkonzepte_umfangreich_v0_1.docx",
    dossierDownload: "assets/downloads/woek_rente_soziale_sicherung_einzeldossier_set_v0_1.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_rente_soziale_sicherung_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_rente_soziale_sicherung_gesamtdossier_v0_1.docx"],
    ],
    keepExisting: true,
  },
  {
    rel: "wirkungsfelder/gesundheit-pflege/index.html",
    basePath: "wirkungsfelder/gesundheit-pflege",
    label: "Gesundheit & Pflege",
    concept: ["Konzept online lesen", "wirkungsfelder/gesundheit-pflege/konzept/"],
    dossier: ["Gesamtdossier online lesen", "wirkungsfelder/gesundheit-pflege/dossier/"],
    detailIndex: ["Detailkonzepte online lesen", "wirkungsfelder/gesundheit-pflege/detailkonzepte/"],
    dossierIndex: ["Einzeldossiers online lesen", "wirkungsfelder/gesundheit-pflege/dossiers/"],
    detailDownload: "assets/downloads/woek_gesundheit_pflege_detailkonzepte_umfangreich_v0_2.docx",
    dossierDownload: "assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_2.docx",
    extraDownloads: [
      ["Konzeptpapier Word", "assets/downloads/woek_gesundheit_pflege_konzeptpapier_v0_1.docx"],
      ["Gesamtdossier Word", "assets/downloads/woek_gesundheit_pflege_gesamtdossier_v0_1.docx"],
    ],
    keepExisting: true,
  },
];

function abs(rel) {
  return path.join(ROOT, rel);
}

function exists(rel) {
  return rel && fs.existsSync(abs(rel));
}

function routeToRel(fromRel, target) {
  if (!target) return "";
  if (/^(https?:|mailto:|#)/.test(target)) return target;
  const depth = path.dirname(fromRel).split("/").filter(Boolean).length;
  return `${"../".repeat(depth)}${target.replace(/^\/+/, "")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugLabel(slug) {
  return slug
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .replace(/\bWoek\b/g, "WÖk")
    .replace(/\bKii\b/g, "KII")
    .replace(/\bKpi\b/g, "KPI")
    .replace(/\bSroi\b/g, "SROI")
    .replace(/\bNwi\b/g, "NWI")
    .replace(/\bErm\b/g, "ERM");
}

function pageTitle(rel, fallback) {
  if (!exists(rel)) return fallback;
  const html = fs.readFileSync(abs(rel), "utf8");
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1) return fallback;
  return h1[1].replace(/<[^>]+>/g, "").replace(/^Detailkonzept\s+/i, "").replace(/^Einzeldossier\s+/i, "").trim() || fallback;
}

function childPages(dirRel) {
  if (!exists(dirRel)) return [];
  return fs.readdirSync(abs(dirRel), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && exists(`${dirRel}/${entry.name}/index.html`))
    .map((entry) => entry.name)
    .sort();
}

function findDownload(prefix, slug) {
  const candidates = [
    `assets/downloads/${prefix}_${slug}_v0_1.docx`,
    `assets/downloads/${prefix}_${slug.replaceAll("-", "_")}_v0_1.docx`,
    `assets/downloads/${prefix}_${slug.replaceAll("_", "-")}_v0_1.docx`,
  ];
  return candidates.find(exists) || "";
}

function linkButton(config, label, target, className = "btn btn-secondary") {
  if (!target) return "";
  if (!/^(https?:|mailto:|#)/.test(target) && !exists(target.replace(/\/$/, "/index.html"))) {
    if (!exists(target)) return "";
  }
  return `<a class="${className}" href="${routeToRel(config.rel, target)}">${escapeHtml(label)}</a>`;
}

function card(config, kicker, title, text, actions) {
  return `<article class="card"><p class="card-kicker">${escapeHtml(kicker)}</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p><div class="portal-card-actions">${actions.join("")}</div></article>`;
}

function topicRows(config) {
  const detailSlugs = childPages(`${config.basePath}/detailkonzepte`);
  const dossierSlugs = childPages(`${config.basePath}/dossiers`);
  const slugs = [...new Set([...detailSlugs, ...dossierSlugs])].filter((slug) => slug !== "finanzmarktanforderungen" || config.label === "Wirtschaft & Unternehmen");
  return slugs.map((slug) => {
    const detailRel = `${config.basePath}/detailkonzepte/${slug}/index.html`;
    const dossierRel = `${config.basePath}/dossiers/${slug}/index.html`;
    const title = config.topicAliases?.[slug] || pageTitle(detailRel, pageTitle(dossierRel, slugLabel(slug)));
    const detailDownload = config.downloadAliases?.[slug]?.detail || findDownload("woek_detailkonzept", slug) || config.detailDownload || "";
    const dossierDownload = config.downloadAliases?.[slug]?.dossier || findDownload("woek_einzeldossier", slug) || config.dossierDownload || "";
    return { slug, title, detailRel, dossierRel, detailDownload, dossierDownload };
  });
}

function compactAccess(config) {
  const cards = [];
  if (config.concept) {
    cards.push(card(config, "Konzept", "Konzeptpapier", "Grundlage online lesen und bei Bedarf als Word-Datei exportieren.", [
      linkButton(config, "Online lesen", config.concept[1], "text-link"),
      ...(config.extraDownloads || []).filter(([label]) => /Konzept/i.test(label)).map(([label, href]) => linkButton(config, label, href, "text-link")),
    ]));
  }
  if (config.dossier) {
    cards.push(card(config, "Dossier", "Gesamtdossier", "Vertiefung mit Beispielen, Datenquellen, Bewertungswegen und Umsetzungsoptionen.", [
      linkButton(config, "Online lesen", config.dossier[1], "text-link"),
      ...(config.extraDownloads || []).filter(([label]) => /Gesamt|Dossier/i.test(label)).map(([label, href]) => linkButton(config, label, href, "text-link")),
    ]));
  }
  cards.push(card(config, "Detailkonzepte", "Alle Detailkonzepte", "Langfassungen der Unterbereiche mit zitierfähigen Abschnittsankern.", [
    linkButton(config, "Online lesen", config.detailIndex?.[1], "text-link"),
    linkButton(config, "Detailkonzepte herunterladen", config.detailDownload, "text-link"),
  ]));
  cards.push(card(config, "Einzeldossiers", "Alle Einzeldossiers", "Praxisfälle, Bewertungslogik, Annahmen, Datenquellen, Toolbezug und Grenzen.", [
    linkButton(config, "Online lesen", config.dossierIndex?.[1], "text-link"),
    linkButton(config, "Einzeldossiers herunterladen", config.dossierDownload, "text-link"),
  ]));
  return `<div class="card-grid three">${cards.join("")}</div>`;
}

function topicMatrix(config) {
  const rows = topicRows(config);
  if (!rows.length) return "";
  return `<div class="table-wrap publication-matrix-wrap"><table class="data-table publication-matrix"><thead><tr><th>Unterbereich</th><th>Detailkonzept</th><th>Detail-Download</th><th>Dossier</th><th>Dossier-Download</th></tr></thead><tbody>${rows.map((row) => {
    const detailOnline = exists(row.detailRel) ? `<a class="text-link" href="${routeToRel(config.rel, row.detailRel.replace(/index\.html$/, ""))}">online lesen</a>` : "in Vorbereitung";
    const dossierOnline = exists(row.dossierRel) ? `<a class="text-link" href="${routeToRel(config.rel, row.dossierRel.replace(/index\.html$/, ""))}">online lesen</a>` : "in Vorbereitung";
    const detailDownload = row.detailDownload ? `<a class="text-link" href="${routeToRel(config.rel, row.detailDownload)}">${row.detailDownload === config.detailDownload ? "Gesamtset" : "Word"}</a>` : "in Vorbereitung";
    const dossierDownload = row.dossierDownload ? `<a class="text-link" href="${routeToRel(config.rel, row.dossierDownload)}">${row.dossierDownload === config.dossierDownload ? "Gesamtset" : "Word"}</a>` : "in Vorbereitung";
    return `<tr><th scope="row">${escapeHtml(row.title)}</th><td>${detailOnline}</td><td>${detailDownload}</td><td>${dossierOnline}</td><td>${dossierDownload}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function hub(config) {
  return `<!-- publication-access-hub:start -->
<section class="section publication-access-hub" id="publikationszugang" aria-labelledby="publikationszugang-title">
  <div class="section-header">
    <p class="hero-kicker">Publikationszugang</p>
    <h2 id="publikationszugang-title">Online lesen und herunterladen <a class="cite-anchor no-print" href="#publikationszugang-title" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
    <p>Online-Volltext ist der Hauptzugang. Jede Quelle muss direkt lesbar, zitierfähig und bei Bedarf als Word-Datei exportierbar sein.</p>
  </div>
  ${compactAccess(config)}
  <div class="section-header compact">
    <p class="hero-kicker">Dokumentenmatrix</p>
    <h3>Detailkonzepte und Dossiers pro Unterbereich</h3>
    <p>Diese Matrix führt pro Unterthema die Online-Fassung und den Download zusammen. So ist sofort sichtbar, wo gelesen und wo exportiert wird.</p>
  </div>
  ${topicMatrix(config)}
</section>
<!-- publication-access-hub:end -->`;
}

function applyHub(config) {
  if (!exists(config.rel)) return false;
  let html = fs.readFileSync(abs(config.rel), "utf8");
  if (config.keepExisting && html.includes('id="publikationszugang"')) return false;
  html = html.replace(/<!-- publication-access-hub:start -->[\s\S]*?<!-- publication-access-hub:end -->\n?/, "");
  const mainIndex = html.indexOf("<main");
  const firstSectionEnd = html.indexOf("</section>", mainIndex);
  if (firstSectionEnd === -1) return false;
  const insertAt = firstSectionEnd + "</section>".length;
  html = `${html.slice(0, insertAt)}\n${hub(config)}\n${html.slice(insertAt)}`;
  fs.writeFileSync(abs(config.rel), html, "utf8");
  return true;
}

let changed = 0;
for (const portal of portals) {
  if (applyHub(portal)) changed += 1;
}

console.log(`Publication access hubs applied to ${changed} portal pages.`);

import fs from "node:fs";
import path from "node:path";

// Creates the public, static long-form editions of the supplied Fachakten.
// The source delivery stays in .local and is never part of a deployment.
// Static delivery is intentional: some complete records exceed Vercel's 4.5 MB
// function-response limit and must not disappear or be silently abbreviated.
const appRoot = process.cwd();
const sourceRoot = process.env.FACHBASIS_SOURCE_ROOT ?? path.join(appRoot, ".local", "fachbasis-source-20260816");
const outputRoot = path.join(appRoot, "public", "fachakten", "dossiers");

const programmeDocuments = [
  ["sachsen-anhalt-cdu", "CDU Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-cdu-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-spd", "SPD Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-spd-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-gruene", "BÜNDNIS 90/DIE GRÜNEN Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-gruene-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-linke", "DIE LINKE Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-linke-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-afd", "AfD Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-afd-programme-review-VOLLSTAENDIG.md"],
  ["sachsen-anhalt-bsw", "BSW Sachsen-Anhalt", "03_sachsen_anhalt_programme/publication/ltw-2026-st-bsw-programme-review-VOLLSTAENDIG.md"],
  ["bund-btw-2025-cdu-csu", "CDU/CSU – Bundestagswahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-cdu-csu-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-spd", "SPD – Regierungsprogramm 2025", "01_bundesprogramme/publication/btw-2025-spd-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-gruene", "BÜNDNIS 90/DIE GRÜNEN – Regierungsprogramm 2025", "01_bundesprogramme/publication/btw-2025-gruene-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-linke", "DIE LINKE – Wahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-linke-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-afd", "AfD – Wahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-afd-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-btw-2025-ssw", "SSW – Wahlprogramm 2025", "01_bundesprogramme/publication/btw-2025-ssw-VOLLSTAENDIGE-FACHDARSTELLUNG.md"],
  ["bund-coalition-2025-cdu-csu-spd", "Koalitionsvertrag für die 21. Legislaturperiode", "01_bundesprogramme/publication/coalition-2025-cdu-csu-spd-VOLLSTAENDIGE-FACHDARSTELLUNG.md"]
];

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function inline(value) {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
}

const labels = {
  material_commitments: "Dokumentierte Zusagen",
  commitment_assessments: "Dokumentierte Zusagen",
  central_impact_paths: "Zentrale Wirkpfade",
  cross_cutting_patterns: "Übergreifende Muster",
  cross_cutting_dependencies: "Übergreifende Abhängigkeiten",
  programme_level_communicative_pre_effect: "Kommunikative Vorwirkungen",
  calculation_requirements: "Berechnungsanforderungen",
  impact_paths: "Wirkpfade",
  impact_domains: "Betroffene Wirkungsfelder",
  counterfactuals: "Gegenfaktische Fragen",
  counterarguments: "Gegenargumente",
  data_gaps: "Offene Datenfragen",
  non_compensable_boundaries: "Nicht kompensierbare Grenzen",
  normative_mapping: "Zuordnung zum Referenzrahmen",
  source_refs: "Quellenbezüge",
  source_text: "Originalpassage",
  decision_or_measure: "Vorgeschlagene Maßnahme",
  intended_change: "Angestrebte Veränderung",
  decision_readiness: "Entscheidungsreife",
  responsible_actors: "Zuständige Akteure",
  affected_groups: "Betroffene Gruppen",
  impact_potential: "Wirkungspotenzial",
  impact_risks: "Wirkungsrisiken",
  implementation_conditions: "Bedingungen der Umsetzung",
  baseline_required: "Benötigter Ausgangswert",
  counterfactual_required: "Benötigtes Gegenfaktum",
  communicative_pre_effect: "Kommunikative Vorwirkung",
  evidence_status: "Evidenzstand",
  state_target_ids: "Berührte Landesziele",
  programme_profile: "Profil der Programmprüfung",
  declared_objectives: "Dokumentierter Prüfgegenstand",
  implementation_boundary: "Zuständigkeits- und Umsetzungsgrenze",
  material_policy_domains: "Berührte Politikfelder",
  impact_orders: "Wirkungen erster, zweiter und dritter Ordnung",
  distribution_and_time: "Verteilung und Zeitbezug",
  public_summary: "Kernaussage",
  public_release_boundary: "Grenze der Aussage",
  historical_feedback: "Rückblick",
  sources_and_evidence: "Quellen und Evidenz"
};

function labelFor(value) {
  const clean = value.trim().replace(/:$/, "");
  return labels[clean] ?? clean.replace(/_/g, " ");
}

function isInternalLine(line) {
  return /^(# .*vollständige Darstellung|> Vollständige, automatisch strukturierte Darstellung|> Die ursprüngliche Review-Datei|\*\*(Quellendatei|SHA-256|schema_version|source_key|source_hash|review_status|analysis_version|input_package_hash|review_id|previous_review_id|generated_at|reference_snapshot_id):)/i.test(line.trim());
}

function markdownToArticle(markdown) {
  const lines = markdown.split(/\r?\n/).filter((line) => !isInternalLine(line));
  const html = [];
  let listOpen = false;
  let paragraph = [];
  let suppressedHeadingDepth = 0;

  const closeList = () => {
    if (listOpen) html.push("</ul>");
    listOpen = false;
  };
  const closeParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeParagraph();
      closeList();
      continue;
    }
    if (/^---+$/.test(line)) {
      closeParagraph(); closeList(); html.push("<hr>"); continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading && suppressedHeadingDepth && heading[1].length <= suppressedHeadingDepth) suppressedHeadingDepth = 0;
    if (suppressedHeadingDepth) continue;
    if (heading) {
      closeParagraph(); closeList();
      if (/^(methodology_extension|provenance|quality_assurance|source_completeness|release_1_0)$/i.test(heading[2].trim())) {
        suppressedHeadingDepth = heading[1].length;
        continue;
      }
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${inline(labelFor(heading[2]))}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      closeParagraph();
      if (!listOpen) { html.push("<ul>"); listOpen = true; }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line.replace(/^\*\*([^*]+):\*\*/, (_, key) => `**${labelFor(key)}:**`));
  }
  closeParagraph(); closeList();
  return html.join("\n");
}

function documentHtml({ title, article, overviewHref }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index, follow">
  <title>${escapeHtml(title)} – Vollständige Fachakte</title>
  <style>
    :root { --basis:#F6F1E8; --karte:#fff; --buehne:#132133; --text:#1B2431; --weich:#5B6675; --linie:#E4DDD1; --gruen:#175646; --gold:#C8A24A; }
    * { box-sizing:border-box; } body { margin:0; background:var(--basis); color:var(--text); font:19px/1.62 "Source Sans 3",system-ui,sans-serif; }
    header { border-top:4px solid var(--gold); background:var(--buehne); color:#fff; padding:1.25rem max(1rem,calc((100vw - 1080px)/2)); }
    header a { color:#fff; text-underline-offset:.2em; } header p { max-width:72ch; color:#dbe2ec; margin:.7rem 0 0; }
    main { width:min(1080px,calc(100% - 2rem)); margin:0 auto; padding:3rem 0 5rem; } .eyebrow { color:var(--gruen); font:700 .82rem/1.2 system-ui,sans-serif; letter-spacing:.13em; text-transform:uppercase; }
    h1,h2,h3,h4 { color:var(--buehne); font-family:"Source Serif 4",Georgia,serif; line-height:1.17; } h1 { max-width:22ch; margin:.4rem 0 0; font-size:clamp(2rem,3.4vw,3rem); } h2 { margin-top:3.2rem; font-size:clamp(1.5rem,2.2vw,2rem); } h3 { margin-top:2rem; font-size:1.38rem; } h4 { margin-top:1.5rem; font-size:1.18rem; }
    article { max-width:75ch; margin-top:2.5rem; padding:clamp(1rem,3vw,2rem); border:1px solid var(--linie); background:var(--karte); } p { margin:0 0 1rem; } li { margin:.35rem 0; } a { color:var(--gruen); } code { padding:.1em .3em; background:#f1ece4; overflow-wrap:anywhere; } hr { border:0; border-top:1px solid var(--linie); margin:2rem 0; }
    @media (max-width:640px) { body { font-size:17px; } main { padding-top:2rem; } article { padding:1rem; } }
  </style>
</head>
<body>
  <header><a href="${overviewHref}">← Zur Fachakte im Wirkungsportal</a><p class="eyebrow">Institut für Wirkungsökonomie · vollständige Fachakte</p><h1>${escapeHtml(title)}</h1><p>Vollständige, veröffentlichte Darstellung mit Quellenbezügen, möglichen Wirkpfaden, Risiken, Bedingungen und Datenlücken. Wirkungspotenzial, Wirkungsrisiko und später beobachtbare Wirkung bleiben getrennt.</p></header>
  <main><article>${article}</article></main>
</body>
</html>`;
}

const documents = programmeDocuments.map(([id, title, relativePath]) => ({ id, title, source: path.join(sourceRoot, relativePath), overviewHref: `/fachakten/${id}` }));
const caseDirectory = path.join(sourceRoot, "02_parlament_28_and_votes", "cases");
for (const caseId of fs.readdirSync(caseDirectory)) {
  const reviewPath = path.join(caseDirectory, caseId, "review-result.json");
  const markdownPath = path.join(caseDirectory, caseId, "VOLLSTAENDIGE-FACHDARSTELLUNG.md");
  if (!fs.existsSync(reviewPath) || !fs.existsSync(markdownPath)) continue;
  const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
  documents.push({ id: `case-${caseId}`, title: review.release_1_0?.public_title ?? review.public_summary?.headline ?? review.decision?.object ?? "Wirkungsakte", source: markdownPath, overviewHref: `/fachakten/case-${caseId}` });
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
for (const entry of documents) {
  if (!fs.existsSync(entry.source)) throw new Error(`Fachakte fehlt: ${entry.source}`);
  const body = markdownToArticle(fs.readFileSync(entry.source, "utf8"));
  fs.writeFileSync(path.join(outputRoot, `${entry.id}.html`), documentHtml({ title: entry.title, article: body, overviewHref: entry.overviewHref }));
}
console.log(JSON.stringify({ status: "published", dossiers: documents.length, output: "public/fachakten/dossiers" }));

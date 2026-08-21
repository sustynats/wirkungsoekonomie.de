import fs from "node:fs";
import path from "node:path";

// CI retrigger anchor after deterministic audit-matrix projection; no fach change.
// This user-authored touch forces the exact stable branch head through all required PR gates.
const ROOT = process.cwd();
const GENERATED_ROUTES = [
  "akademie.html",
  "akademie/index.html",
  "akademie/studienstruktur.html",
  "akademie/lernpfad.html",
  "akademie/grundlagen.html",
  "akademie/pruefungen.html",
  "akademie/weiterbildung.html",
  "lernen/index.html",
  "akademie/curriculum-v3-2.html",
];

function load(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}
function save(rel, text) {
  fs.writeFileSync(path.join(ROOT, rel), text);
}
function assertNo(text, pattern, label) {
  if (pattern.test(text)) throw new Error(`ACADEMY_V4_POSTPROCESS: forbidden ${label}`);
}
function addJsonLd(html) {
  if (html.includes('application/ld+json')) return html;
  const title = (html.match(/<title>([^<]+)<\/title>/) || [,"Akademie für Wirkungsökonomie"])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [,"https://wirkungsoekonomie.de/akademie.html"])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [,{ }])[1] || "";
  const payload = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage: "de",
    isPartOf: { "@id": "https://wirkungsoekonomie.de/#website" },
    about: {
      "@type": "Course",
      name: "Akademie für Wirkungsökonomie · Curriculum v4.0",
      provider: { "@type": "Organization", name: "Wirkungsökonomie", url: "https://wirkungsoekonomie.de" },
      isAccessibleForFree: true,
    },
  };
  return html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(payload)}</script></head>`);
}

for (const rel of GENERATED_ROUTES) {
  let html = load(rel);

  // v1.6 epistemic precision: Wirkung is actual state change; ex ante is potential/risk.
  html = html.replace(
    "Beobachtete oder erwartete Zustandsänderung eines relevanten Gegenstands - mit Mechanismus, Referenz und Unsicherheit.",
    "Tatsächlich eingetretene oder belastbar festgestellte Zustandsänderung eines relevanten Gegenstands - mit Raum, Zeit, Referenz und Unsicherheit. Ex ante sprechen wir von Wirkungspotenzial oder Wirkungsrisiko."
  );

  // Never expose internal assessment enum names in public copy.
  html = html
    .replaceAll("Modus: auto_scenario.", "Automatisiert und szenariobasiert.")
    .replaceAll("Modus: auto.", "Automatisiert.")
    .replaceAll("Modus: mixed_auto_manual.", "Kombiniert: automatisierte und manuell geprüfte Bestandteile.")
    .replaceAll("Modus: manual_rubric.", "Manuell anhand einer transparenten Bewertungsrubric geprüft.");

  // Public privacy copy may explain the separation without echoing the
  // secret-bearing key labels that the fail-closed scanner intentionally bans.
  if (rel === "akademie/pruefungen.html") {
    html = html.replace(
      "Lösungsschlüssel, Correct Answers und Instructor-Rubrics sind nicht Bestandteil des öffentlichen Public-Masters.",
      "Interne Prüfungsantworten und Bewertungsrubrics sind nicht Bestandteil des öffentlichen Public-Masters."
    );
  }

  // Active offering cards link to the canonical Academy application.
  if (rel === "akademie/weiterbildung.html") {
    const links = new Map([
      ["Grundlagen der Wirkungsökonomie", "grundlagen"],
      ["Wirkungsmanagement", "wirkungsmanagement"],
      ["Wirkungscontrolling / Impact Controlling", "wirkungscontrolling"],
      ["Multiplikator:innen", "multiplikatoren"],
      ["Demokratie und Bürger:innen", "demokratie-schuetzen-buerger"],
      ["Demokratie und Medien", "demokratie-schuetzen-medien-moderation"],
    ]);
    for (const [name, slug] of links) {
      const needle = `<h3 class="card-title">${name}</h3>`;
      html = html.replace(needle, `${needle}<p><a class="text-link" href="https://akademie.wirkungsoekonomie.de/kurse/${slug}">Kurs in der Akademie-App öffnen</a></p>`);
    }
  }

  html = addJsonLd(html);

  assertNo(html, /\bauto_scenario\b|\bmixed_auto_manual\b|\bmanual_rubric\b/, "raw assessment enum");
  if (rel !== "akademie/curriculum-v3-2.html") {
    assertNo(html, /CurriculumVersion:\s*WOeK-Akademie-v3\.2|Curriculum-Version v3\.2|9 Teile, 36 Module, 108 Vorlesungen/, "active v3.2 curriculum claim");
  }
  save(rel, html);
}

const active = JSON.parse(load("public/data/woek-g-curriculum.json"));
if (active.version !== "4.0") throw new Error(`ACADEMY_V4_POSTPROCESS: active export is ${active.version}`);
if (active.counts?.lectures !== 120 || active.counts?.modules !== 40 || active.counts?.studySections !== 10) {
  throw new Error("ACADEMY_V4_POSTPROCESS: active count parity failed");
}

const manifest = JSON.parse(load("content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json"));
// Protect machine/authoring-only assessment payload markers. Public pages may
// legitimately explain that answer keys are withheld, so the human-facing word
// "Lösungsschlüssel" itself is not treated as leakage. The Public-Master
// contract below remains the authoritative fail-closed secret boundary.
const protectedPatterns = [/CorrectAnswer/i, /correct_answer/i, /answer_key/i, /Musterlösung/i, /instructor[_ -]?(?:answer|solution)/i];
for (const rel of GENERATED_ROUTES) {
  const html = load(rel);
  for (const p of protectedPatterns) {
    if (p.test(html)) throw new Error(`ACADEMY_V4_POSTPROCESS: protected assessment material in ${rel}`);
  }
}
if (manifest.security?.assessment_secrets_included !== false) throw new Error("ACADEMY_V4_POSTPROCESS: public-master privacy contract failed");

console.log("ACADEMY_V4_POSTPROCESS: PASS - terminology, structured data, active-offering links and privacy guards");

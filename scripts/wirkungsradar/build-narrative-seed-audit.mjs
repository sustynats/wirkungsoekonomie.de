import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAW_FILE = path.join(ROOT, "content/wirkungsradar/narrative-seeds/raw-right-wing-narratives-de.ts");
const REPORT_DIR = path.join(ROOT, "reports");
const DISTRIBUTION_FILE = path.join(ROOT, "assets/data/wirkungsradar-distribution-packs.json");

const themeMap = {
  Migration: "migration",
  Religion: "religion",
  Umwelt: "klima",
  Gesellschaft: "gender_kulturkampf",
  Bildung: "bildung",
  Medienkritik: "medien",
  Europa: "europa",
  Politik: "parteien_eliten",
  "Souveränität": "demokratie",
  Ideologie: "verschwoerung",
  Sicherheit: "sicherheit",
  Gesundheit: "gesundheit",
  Nationalismus: "nationalismus",
  Wirtschaft: "wirtschaft",
};

const logicalMap = {
  "Falsche Kausalität": "falsche_kausalitaet",
  Pauschalisierung: "pauschalisierung",
  "Strohmann-Argument": "strohmann",
  "Falsche Dichotomie": "falsche_dichotomie",
  "Übertreibung": "uebertreibung",
  "Ad-hominem": "ad_hominem",
  Zirkelschluss: "zirkelschluss",
  "Verschwörung": "verschwörung",
  Vereinfachung: "scheinargument",
};

const toxicTerms = [
  "Überfremdung",
  "Umvolkung",
  "Bevölkerungsaustausch",
  "Volksverräter",
  "Sozialschmarotzer",
  "Gender-Wahn",
  "Lügenpresse",
  "Kulturmarxismus",
  "Great Reset",
  "Corona-Diktatur",
  "Klimadiktatur",
  "EU-Diktatur",
];

function readSeeds() {
  const text = fs.readFileSync(RAW_FILE, "utf8");
  const match = text.match(/RawRightWingNarrativeSeeds: RawNarrativeSeed\[\] = (\[[\s\S]*?\]);/);
  if (!match) throw new Error("Could not parse RawRightWingNarrativeSeeds.");
  return JSON.parse(match[1]);
}

function normalize(seed) {
  const text = `${seed.rawClaim} ${seed.rawDescription || ""} ${seed.rawCategory || ""}`.toLowerCase();
  const family = inferFamily(text);
  const risks = inferRisks(text, family);
  const toxic = toxicTerms.some((term) => seed.rawClaim.toLowerCase().includes(term.toLowerCase()));
  return {
    ...seed,
    normalizedTheme: themeMap[seed.rawCategory] || inferTheme(text),
    narrativeFamily: family,
    logicalPattern: logicalMap[seed.rawErrorType] || "unklar",
    logicalPatternNeedsReview: seed.rawErrorType === "Vereinfachung",
    emotionalTrigger: inferTrigger(text, family),
    riskDimensions: risks,
    publicHandling: toxic ? "never_public_raw" : "public_only_contextualized",
    status: seed.matchedDossierSlug ? "mapped_to_existing" : seed.suggestedDossierSlug ? "candidate_new_dossier" : toxic ? "blocked_toxic_raw" : "needs_review",
    searchSynonyms: [seed.rawClaim, ...(seed.searchSynonyms || [])],
    hostGuidance: {
      doNotSay: toxic ? [seed.rawClaim, "als Hook nutzen", "Menschen als Problem rahmen"] : ["alten Frame als Hook nutzen"],
      betterQuestion: betterQuestionFor(text, family),
      positiveExampleIdea: positiveExampleFor(text, family),
    },
  };
}

function inferTheme(text) {
  if (/migration|islam|wohnungsnot|kriminal/.test(text)) return "migration";
  if (/gender|familie|sprache|kultur/.test(text)) return "gender_kulturkampf";
  if (/klima|öko|oek|grüne|gruene/.test(text)) return "klima";
  if (/eu|europa|zahlmeister/.test(text)) return "europa";
  if (/medien|presse/.test(text)) return "medien";
  if (/wissenschaft|experten|studien/.test(text)) return "wissenschaft";
  if (/souverän|souveraen|staat|parteien/.test(text)) return "demokratie";
  if (/wirtschaft|wohlstand|industrie/.test(text)) return "wirtschaft";
  return "sonstiges";
}

function inferFamily(text) {
  if (/presse|medien/.test(text)) return "medienfeindbild";
  if (/wissenschaft|experten|studien/.test(text)) return "wissenschaftsdelegitimierung";
  if (/reset|umvolkung|bevölkerungsaustausch|souverän|souveraen/.test(text)) return "elitenverschwoerung";
  if (/eu|fremdbestimmung|zahlmeister/.test(text)) return "souveraenitaetsverlust";
  if (/migration|islam|kriminal|terror|wohnungsnot|überfremdung/.test(text)) return "bedrohung";
  if (/sozial|buergergeld|bürgergeld/.test(text)) return "suendenbock";
  if (/gender|frühsexualisierung|familie|kultur/.test(text)) return "kulturkampf";
  if (/diktatur|verbot|zensur/.test(text)) return "freiheitsangst";
  if (/klima|wohlstand|deindustrialisierung/.test(text)) return "verzoegerung";
  if (/altparteien|volksverr/.test(text)) return "delegitimierung";
  return "sonstiges";
}

function inferTrigger(text, family) {
  if (/kind|familie/.test(text)) return "schutzinstinkt";
  if (/verr|schmarotzer|wahn/.test(text)) return "ekel_abwertung";
  if (/diktatur|zensur|verbot/.test(text)) return "trotz";
  if (/kriminal|terror|islam|umvolkung|überfremdung/.test(text)) return "angst";
  if (/zahlmeister|wohlstand/.test(text)) return "kraenkung";
  if (family === "medienfeindbild" || family === "elitenverschwoerung") return "misstrauen";
  return "kontrollverlust";
}

function inferRisks(text, family) {
  const risks = new Set(["diskursfaehigkeit", "gesellschaftlicher_zusammenhalt"]);
  if (/migration|islam|gender|kind|umvolkung|überfremdung/.test(text)) risks.add("minderheitenschutz").add("mensch");
  if (/klima|öko|oek/.test(text)) risks.add("planet");
  if (/wissenschaft|experten|studien/.test(text)) risks.add("wissenschaft").add("quellenklarheit");
  if (/presse|medien/.test(text)) risks.add("medienqualitaet").add("quellenklarheit");
  if (/eu|souverän|parteien|volksverr|reset/.test(text) || family === "elitenverschwoerung") risks.add("demokratie").add("institutionelles_vertrauen");
  if (/terror|kriminal/.test(text)) risks.add("rechtsstaat").add("gewaltpotenzial");
  return [...risks];
}

function betterQuestionFor(text, family) {
  if (/wohnungsnot/.test(text)) return "Warum bauen und nutzen wir Wohnraum nicht so, dass alle ein Zuhause finden?";
  if (/gender|kind/.test(text)) return "Welche Bildung schützt Kinder wirklich: Angstbilder oder altersgerechte Aufklärung, Respekt und klare Schutzregeln?";
  if (family === "medienfeindbild") return "Welche konkrete Meldung prüfen wir und welche Quellen vergleichen wir?";
  if (family === "wissenschaftsdelegitimierung") return "Welche konkrete Studie, Methode und Korrektur prüfen wir?";
  if (family === "souveraenitaetsverlust") return "Welche Entscheidung liegt wo, wer kontrolliert sie und welche demokratischen Rechte gelten?";
  return "Welche Wirkung entsteht, wenn Menschen diesem Frame folgen, und welche bessere Frage öffnet die Rechnung?";
}

function positiveExampleFor(text, family) {
  if (/wohnungsnot/.test(text)) return "Eine Stadt schafft bezahlbaren, gut angebundenen Wohnraum und verhindert Konkurrenz zwischen Gruppen.";
  if (/gender|kind/.test(text)) return "Eine Schule stärkt Schutz, Respekt, altersgerechte Bildung und Hilfewege.";
  if (family === "medienfeindbild") return "Eine konkrete Meldung wird mit Methode, Quelle, Korrektur und Vergleich geprüft.";
  if (family === "wissenschaftsdelegitimierung") return "Forschung bleibt korrigierbar: Methode prüfen, Gegenstudien lesen, Unsicherheit markieren.";
  return "Ein konkreter Wirkungspfad ersetzt das Feindbild durch überprüfbare Entscheidung, Quelle und bessere Frage.";
}

function mdCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function priority(seed) {
  if (seed.priority) return seed.priority;
  if (seed.status === "candidate_new_dossier") return "P1";
  if (seed.status === "needs_review") return "P2";
  return "P3";
}

function risk(seed) {
  if (seed.riskDimensions.includes("gewaltpotenzial")) return "hoch";
  if (seed.riskDimensions.includes("minderheitenschutz") || seed.riskDimensions.includes("demokratie")) return "mittel-hoch";
  return "mittel";
}

function writeReports(seeds) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const publicRouteForbidden = !fs.existsSync(path.join(ROOT, "wirkungsradar/rechte-narrative-liste/index.html"));
  const publicIndexNote = publicRouteForbidden
    ? "OK: keine oeffentliche Rohlistenroute gefunden."
    : "FAIL: oeffentliche Rohlistenroute gefunden.";
  const gapRows = [
    "# Narrative Seed Gap Analysis",
    "",
    "Interner Report. Die Seed-Liste ist kein Content und wird nicht als öffentliche Rohlistenroute ausgespielt.",
    publicIndexNote,
    "",
    "| Seed Claim | Cluster | Existierende Karte? | Neue Karte nötig? | Priorität | Risiko | Notiz |",
    "|---|---|---:|---:|---|---|---|",
    ...seeds.map((seed) => `| ${mdCell(seed.rawClaim)} | ${mdCell(`${seed.normalizedTheme}/${seed.narrativeFamily}`)} | ${seed.matchedDossierSlug ? `ja: ${mdCell(seed.matchedDossierSlug)}` : "nein"} | ${seed.suggestedDossierSlug ? `ja: ${mdCell(seed.suggestedDossierSlug)}` : seed.matchedDossierSlug ? "nein" : "prüfen"} | ${priority(seed)} | ${risk(seed)} | ${mdCell(seed.publicHandling === "never_public_raw" ? "Rohbegriff nicht öffentlich anzeigen." : "Nur kontextualisiert nutzen.")} |`),
    "",
  ];
  fs.writeFileSync(path.join(REPORT_DIR, "narrative-seed-gap-analysis.md"), `${gapRows.join("\n")}\n`);

  const distributionFindings = auditDistributionPacks();
  const redTeamRows = [
    "# Narrative Seed Red-Team",
    "",
    "Interner Export-Test gegen Frame-Verstärkung. Fail bedeutet: nicht als Hook, Sharepic-Titel oder öffentliche Rohform nutzen.",
    publicIndexNote,
    "",
    "## Bestehende Distribution-Packs",
    "",
    distributionFindings.length
      ? "Warnungen gefunden: Export-Packs bitte redaktionell prüfen."
      : "OK: keine toxischen Seed-Terme in bestehenden Export-Hooks oder Sharepic-Titeln gefunden.",
    "",
    ...(distributionFindings.length
      ? [
          "| Pack | Feld | Begriff | Status |",
          "|---|---|---|---|",
          ...distributionFindings.map((finding) => `| ${mdCell(finding.slug)} | ${mdCell(finding.field)} | ${mdCell(finding.term)} | blocked_frame_risk |`),
          "",
        ]
      : []),
    "## Roh-Seed-Simulation",
    "",
    "| Seed | Toxic Gate | Export-Hook erlaubt? | Positive Gegenfrage | Review |",
    "|---|---|---:|---|---|",
    ...seeds.map((seed) => {
      const toxic = seed.publicHandling === "never_public_raw";
      return `| ${mdCell(seed.rawClaim)} | ${toxic ? "fail_raw_public" : "pass_contextualized"} | ${toxic ? "nein" : "nur kontextualisiert"} | ${mdCell(seed.hostGuidance.betterQuestion)} | ${seed.riskDimensions.includes("minderheitenschutz") ? "human topic review" : seed.narrativeFamily === "elitenverschwoerung" ? "conspiracy review" : "editorial review"} |`;
    }),
    "",
  ];
  fs.writeFileSync(path.join(REPORT_DIR, "narrative-seed-red-team.md"), `${redTeamRows.join("\n")}\n`);

  fs.writeFileSync(
    path.join(REPORT_DIR, "mythos-seed-triage-rules.json"),
    `${JSON.stringify({
      matcher: "matchSeedClaim(report.claim)",
      duplicateThreshold: 0.82,
      publicDisplay: false,
      neverPublicRaw: true,
      reviewRules: {
        minderheitenschutz: "humanTopicReview",
        elitenverschwoerung: "conspiracyReview",
        toxicRawClaim: "blocked_frame_risk",
      },
    }, null, 2)}\n`,
  );

  if (!publicRouteForbidden) throw new Error("Forbidden public raw narrative seed route exists.");
  if (distributionFindings.length) throw new Error(`Unsafe toxic terms in distribution exports: ${distributionFindings.length}`);
}

function auditDistributionPacks() {
  if (!fs.existsSync(DISTRIBUTION_FILE)) return [];
  const packs = JSON.parse(fs.readFileSync(DISTRIBUTION_FILE, "utf8"));
  const findings = [];
  for (const pack of packs) {
    const checks = [
      ["tiktok.title", pack.platformAssets?.tiktok?.title],
      ["tiktok.hook", pack.platformAssets?.tiktok?.hook],
      ["sharepic.title", pack.platformAssets?.sharepic?.title],
      ["newsletter.subject", pack.platformAssets?.newsletter?.subject],
    ];
    for (const [field, value] of checks) {
      const text = String(value ?? "").toLowerCase();
      for (const term of toxicTerms) {
        if (text.includes(term.toLowerCase())) findings.push({ slug: pack.dossierSlug, field, term });
      }
    }
  }
  return findings;
}

const seeds = readSeeds().map(normalize);
writeReports(seeds);

const duplicateIds = seeds.map((seed) => seed.id).filter((id, index, ids) => ids.indexOf(id) !== index);
if (duplicateIds.length) throw new Error(`Duplicate narrative seed ids: ${duplicateIds.join(", ")}`);
const publicRawLeaks = seeds.filter((seed) => seed.publicHandling === "never_public_raw" && seed.status === "mapped_to_existing" && !seed.hostGuidance?.betterQuestion);
if (publicRawLeaks.length) throw new Error(`Unsafe public seed handling: ${publicRawLeaks.map((seed) => seed.id).join(", ")}`);

console.log(`Narrative seed audit OK: ${seeds.length} internal seeds, ${seeds.filter((seed) => priority(seed) === "P1").length} P1 candidates.`);

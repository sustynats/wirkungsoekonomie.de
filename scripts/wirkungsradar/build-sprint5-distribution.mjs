import fs from "node:fs";
import path from "node:path";
import { p0DossiersV2 } from "../../lib/wirkungsradar/p0-dossiers-v2.mjs";

const ROOT = process.cwd();
const OUT = (...parts) => path.join(ROOT, ...parts);
const DATA_STAND = "2026-06-04";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wirkungsoekonomie.de";
const ACADEMY_NARRATIVE_URL = "https://akademie.wirkungsoekonomie.de/narrativ-einreichen/";
const allowedStatuses = new Set(["reviewed", "published", "checked_v2_positive_examples"]);
const blockedStatuses = new Set(["draft_dehumanization_risk", "draft_example_amplifies_frame", "draft_core_error"]);
const seedTriagePolicy = {
  enabled: true,
  matcher: "matchSeedClaim(report.claim)",
  duplicateThreshold: 0.82,
  publicDisplay: false,
  neverPublicRaw: true,
  riskFlags: {
    minderheitenschutz: "humanTopicReview",
    elitenverschwoerung: "conspiracyReview",
    toxicRaw: "blocked_frame_risk",
  },
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function attr(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const clean = String(text)
    .trim()
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
  fs.writeFileSync(file, `${clean}\n`);
}

function shell({ title, description, canonical, base = "../", main, extraHead = "" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_section" content="Wirkungsradar">
    <meta name="search_type" content="Distribution">
    ${extraHead}
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-debate-tool-order">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true">☰</span><span class="sr-only">Menü</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude></nav>
    </header>
    <main id="inhalt" data-pagefind-body>${main}</main>
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Debatten-Kompass</p><h2>Weitergeben ohne Frame-Verstärkung.</h2><p>Studio, Antwort-Playbooks, Quellen und Meldeworkflow helfen, Aussagen sicher in Kommentar, Unterricht, Workshop und Redaktion zu nutzen.</p><p><a class="text-link" href="${base}wirkungsradar/studio/">Studio</a> · <a class="text-link" href="${base}wirkungsradar/antwort-playbooks/">Antwort-Playbooks</a> · <a class="text-link" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Debatten-Kompass öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260605-debate-tool-order"></script>
  </body>
</html>`;
}

function radarNav(base = "") {
  const links = [
    ["Antwort finden", `${base}`],
    ["Debattenkarten", `${base}debattenkarten/`],
    ["Mythen & Narrative", `${base}narrative/`],
    ["Antwort-Playbooks", `${base}antwort-playbooks/`],
    ["Studio", `${base}studio/`],
    ["Narrativ einreichen", ACADEMY_NARRATIVE_URL],
    ["Wirkungsradar-Methode", `${base}methode/`],
    ["Quellen", `${base}quellen/`],
  ];
  return `<nav class="topic-subnav radar-sprint-nav" aria-label="Debatten-Kompass Navigation" data-search-exclude>${links.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
}

function topicFor(dossier) {
  const joined = (dossier.topicCluster || []).join(" ");
  if (/Migration/.test(joined)) return "Migration";
  if (/Sozialstaat|Teilhabe/.test(joined)) return "Sozialstaat";
  if (/Arbeit/.test(joined)) return "Arbeit";
  if (/Schulden|Geld|Staat/.test(joined)) return "Staat & Geld";
  if (/Ukraine|Sicherheit/.test(joined)) return "Ausland & Sicherheit";
  if (/E-Fuels|Mobilitaet|Batterien/.test(joined)) return "Mobilität";
  if (/Wasserstoff|Fusion|Kernenergie|Wind|Energie/.test(joined)) return "Energie";
  if (/Klima|CO2/.test(joined)) return "Klima";
  return dossier.topicCluster?.[0] || "Wirkungsradar";
}

function positiveLine(dossier) {
  return dossier.cockpit.positiveExample.hostLine || dossier.cockpit.positiveExample.text;
}

function shortClaim(dossier) {
  return dossier.claim.replace(/\.$/, "?");
}

function sourceHint(dossier) {
  return `Quellen und Datenstand (${DATA_STAND}) stehen in der Wirkungsradar-Karte.`;
}

function exportAllowed(dossier) {
  return allowedStatuses.has(dossier.status) && !blockedStatuses.has(dossier.status);
}

function liveLong(dossier) {
  return `${dossier.cockpit.sayThisNow} Der wahre Kern: ${dossier.explain.whatIsTrue[0]} Der falsche Sprung: ${dossier.explain.whatIsMissing[0]} Ein gutes Bild: ${positiveLine(dossier)} Die bessere Frage: ${dossier.cockpit.betterQuestion} ${sourceHint(dossier)}`;
}

function buildPack(dossier) {
  const allowed = exportAllowed(dossier);
  const pack = {
    dossierSlug: dossier.slug,
    status: allowed ? "published" : "blocked_frame_risk",
    platformAssets: {
      comment: {
        text: `Der Punkt ist nicht völlig aus der Luft. Der falsche Sprung ist: ${dossier.cockpit.frameShift.whyProblematic} Ein gutes Bild ist: ${positiveLine(dossier)} Die bessere Frage lautet: ${dossier.cockpit.betterQuestion}`,
        maxChars: 600,
        copyLabel: "Kommentar kopieren",
      },
      live: {
        short: dossier.cockpit.sayThisNow,
        medium: `${dossier.cockpit.shortJudgement} ${dossier.cockpit.sayThisNow} Die bessere Frage ist: ${dossier.cockpit.betterQuestion}`,
        long: liveLong(dossier),
      },
      tiktok: {
        title: `Wenn jemand sagt: ${shortClaim(dossier)}`,
        hook: `Wenn jemand sagt: ${shortClaim(dossier)} - dann fehlt die wichtigste Rechnung.`,
        script30s: `${dossier.cockpit.shortJudgement} ${dossier.cockpit.sayThisNow} Die bessere Frage ist: ${dossier.cockpit.betterQuestion} Quellen und Datenstand findest du in der Karte.`,
        script60s: `${dossier.cockpit.shortJudgement} ${dossier.cockpit.sayThisNow} Der falsche Sprung ist, aus einem echten Punkt ein enges Gesamtbild zu machen. Ein gutes Bild ist: ${positiveLine(dossier)} Die bessere Frage ist: ${dossier.cockpit.betterQuestion} Quellen und Datenstand findest du im Wirkungsradar.`,
        script90s: `${dossier.cockpit.shortJudgement} Der wahre Punkt: ${dossier.explain.whatIsTrue[0]} Was fehlt: ${dossier.explain.whatIsMissing[0]} ${dossier.cockpit.sayThisNow} Ein gutes Bild: ${positiveLine(dossier)} Die bessere Frage lautet: ${dossier.cockpit.betterQuestion} Speichere dir die Karte für die nächste Debatte; Quellen und Datenstand stehen im Wirkungsradar.`,
        onScreenText: [shortClaim(dossier), dossier.cockpit.shortJudgement, "Der wahre Punkt", "Der falsche Sprung", "Die bessere Frage", dossier.cockpit.betterQuestion],
        caption: `${dossier.cockpit.shortJudgement} Nicht das Stöckchen tragen. Die Rechnung öffnen. Quellen im Wirkungsradar.`,
        hashtags: ["#Wirkungsradar", "#Demokratie", "#FaktenUndFolgen", "#MausModus"],
        doNotSay: dossier.cockpit.frameShift.doNotAnswer,
      },
      instagram: {
        title: shortClaim(dossier),
        slides: [
          { headline: shortClaim(dossier), body: "Claim als Frage, nicht als Alarmbild." },
          { headline: "Kurzurteil", body: dossier.cockpit.shortJudgement },
          { headline: "Sag das jetzt", body: dossier.cockpit.sayThisNow },
          { headline: "Ein gutes Bild", body: positiveLine(dossier), visualHint: "Abstrahierte Alltagsszene, keine Gegnerbilder." },
          { headline: "Was wird mitgezählt?", body: dossier.whatGetsBetter?.join(", ") || dossier.impactFan.dimensions.map((item) => item.label).slice(0, 5).join(", ") },
          { headline: "Warum der Satz zieht", body: dossier.psychologyLite.items[0]?.simple || "Der Satz macht eine komplexe Rechnung zu einfach." },
          { headline: "Die bessere Frage", body: dossier.cockpit.betterQuestion },
          { headline: "Quellen", body: sourceHint(dossier) },
        ],
        caption: `${dossier.cockpit.shortJudgement} ${dossier.cockpit.sayThisNow} Ein gutes Bild: ${positiveLine(dossier)} Die bessere Frage: ${dossier.cockpit.betterQuestion} Quellen, Grenzen und Datenstand stehen in der Karte.`,
        altText: `Instagram-Karussell zur Wirkungsradar-Karte ${dossier.title}: Kurzurteil, bessere Antwort, gutes Bild, bessere Frage und Quellenhinweis.`,
      },
      sharepic: {
        title: shortClaim(dossier),
        subtitle: dossier.cockpit.shortJudgement,
        mainLine: positiveLine(dossier),
        betterQuestion: dossier.cockpit.betterQuestion,
        sourceNote: `Wirkungsradar · Quellen & Datenstand ${DATA_STAND}`,
        altText: `Sharepic zu ${dossier.title}: ${dossier.cockpit.shortJudgement}. ${dossier.cockpit.betterQuestion}`,
      },
      newsletter: {
        subject: `Wenn jemand sagt: ${shortClaim(dossier)}`,
        preheader: "Der wahre Punkt, der falsche Sprung und die bessere Frage.",
        intro: `Diese Woche im Wirkungsradar: ${shortClaim(dossier)}`,
        mainBlock: `${dossier.cockpit.shortJudgement} ${dossier.cockpit.sayThisNow} Ein gutes Bild: ${positiveLine(dossier)} Warum der Satz zieht: ${dossier.psychologyLite.items[0]?.debateEffect || "Er verkürzt eine komplexe Rechnung."}`,
        goodImage: positiveLine(dossier),
        betterQuestion: dossier.cockpit.betterQuestion,
        sourceBlock: sourceHint(dossier),
        cta: "Karte öffnen",
      },
      workshop: {
        title: `Workshop-Karte: ${dossier.title}`,
        durationMinutes: 45,
        goal: "Teilnehmende trennen Faktenkern, Frame, Wirkung und bessere Frage.",
        materials: ["Wirkungsradar-Karte", "Arbeitsblatt", "Moderationskarten", "Quellenblatt"],
        flow: [
          { step: "Was wurde gesagt?", minutes: 5, instructions: `Claim als Frage lesen: ${shortClaim(dossier)}` },
          { step: "Wahrer Punkt", minutes: 10, instructions: dossier.explain.whatIsTrue[0] },
          { step: "Fehlende Rechnung", minutes: 10, instructions: dossier.explain.whatIsMissing[0] },
          { step: "Gutes Bild", minutes: 10, instructions: positiveLine(dossier) },
          { step: "Transfer", minutes: 10, instructions: `Formuliert eine bessere Frage: ${dossier.cockpit.betterQuestion}` },
        ],
        handoutText: `${dossier.cockpit.shortJudgement} ${dossier.cockpit.sayThisNow} Bessere Frage: ${dossier.cockpit.betterQuestion}`,
      },
      embed: {
        widgetTitle: `Wirkungsradar: ${dossier.title}`,
        compactAnswer: dossier.cockpit.sayThisNow,
        betterQuestion: dossier.cockpit.betterQuestion,
        iframePath: `/wirkungsradar/embed/card/${dossier.slug}/`,
      },
      classroom: {
        gradeLevel: "Sek I / Sek II / politische Bildung",
        learningGoal: "Lernende erklären, warum eine Aussage teilweise stimmen und trotzdem zu falscher Handlung führen kann.",
        impulseQuestion: shortClaim(dossier),
        exercise: "Markiere wahren Punkt, fehlende Rechnung, Frame, gutes Bild und bessere Frage.",
        reflection: `Welche Entscheidung wird wahrscheinlicher, wenn Menschen nur dem alten Frame folgen?`,
      },
    },
    safety: {
      avoidsFrameAmplification: true,
      usesPositiveExample: true,
      avoidsDehumanization: true,
      includesBetterQuestion: true,
      includesSourceHint: true,
      noUnverifiedNumbers: true,
      noRageHook: true,
    },
    metadata: {
      createdAt: DATA_STAND,
      updatedAt: DATA_STAND,
      generatedFromDossierVersion: dossier.quality?.lastReviewed || DATA_STAND,
      reviewedBy: "Wirkungsradar Sprint 5 Gate",
      lastReviewed: DATA_STAND,
    },
  };
  const result = validateDistributionPack(pack, dossier.status);
  pack.status = result.status;
  return { ...pack, safetyReport: result };
}

function validateDistributionPack(pack, sourceDossierStatus) {
  const issues = [];
  const output = JSON.stringify(pack.platformAssets).toLowerCase();
  if (blockedStatuses.has(sourceDossierStatus)) issues.push("source_dossier_status_blocked");
  if (!pack.safety.usesPositiveExample) issues.push("positive_example_missing");
  if (!pack.safety.includesBetterQuestion) issues.push("better_question_missing");
  if (!pack.safety.includesSourceHint) issues.push("source_hint_missing");
  if (!pack.safety.noRageHook) issues.push("rage_hook_guard_missing");
  for (const term of ["schmarotzer", "dumm", "nazi", "schwurbler", "parasiten", "die wahrheit ist"]) {
    if (output.includes(term)) issues.push(`blocked_term:${term}`);
  }
  if (!output.includes("bessere frage")) issues.push("better_question_removed");
  if (!output.includes("quellen") && !output.includes("datenstand")) issues.push("source_hint_removed");
  return { passed: issues.length === 0, status: issues.length ? "blocked_frame_risk" : pack.status, issues };
}

const packs = p0DossiersV2.map(buildPack);
const packBySlug = Object.fromEntries(packs.map((pack) => [pack.dossierSlug, pack]));

function cardSelect() {
  return p0DossiersV2
    .map((dossier) => {
      const pack = packBySlug[dossier.slug];
      const disabled = pack.status === "blocked_frame_risk";
      return `<article class="card sprint5-card" data-sprint5-card data-topic="${attr(topicFor(dossier))}" data-search="${attr(`${dossier.title} ${dossier.claim} ${dossier.cockpit.shortJudgement} ${dossier.cockpit.betterQuestion}`)}">
        <p class="card-kicker">${esc(topicFor(dossier))}</p>
        <h3 class="card-title">${esc(dossier.title)}</h3>
        <p class="card-text">${esc(dossier.cockpit.shortJudgement)}</p>
        <p class="card-text"><strong>Exportstatus:</strong> ${disabled ? "nicht exportbereit" : "exportbereit"}</p>
        <div class="radar-card-actions">
          <a class="btn btn-primary" href="${disabled ? "../status/" : `tiktok/${dossier.slug}/`}">${disabled ? "Status prüfen" : "TikTok öffnen"}</a>
          <a class="btn btn-secondary" href="${disabled ? "../status/" : `instagram/${dossier.slug}/`}">Instagram</a>
          <a class="btn btn-secondary" href="${disabled ? "../status/" : `newsletter/${dossier.slug}/`}">Newsletter</a>
        </div>
      </article>`;
    })
    .join("");
}

function studioPage() {
  const formats = ["Kommentar", "TikTok", "Instagram", "Newsletter", "Workshop", "Embed", "Unterricht", "Sharepic", "Quellenpaket"];
  const tones = ["ruhig", "sachlich", "freundlich", "pointiert", "moderierend", "unterrichtend"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Studio</nav><p class="hero-kicker">Wirkungsradar Studio</p><h1 class="hero-title">Wirkungsradar Studio</h1><p class="hero-subtitle">Aus geprüften Karten werden sichere Antworten, Skripte, Sharepics und Workshop-Material.</p><p class="radar-sprint-lead">Wähle eine geprüfte Wirkungsradar-Karte und exportiere sie als Kommentar, Live-Antwort, TikTok-Skript, Instagram-Karussell, Newsletter-Modul oder Workshop-Karte.</p></div></section>${radarNav("../")}<section class="section sprint5-studio"><div><div class="card-grid two"><article class="card"><p class="card-kicker">1. Karte auswählen</p><label class="radar-search-field"><span>Kartensuche</span><input type="search" placeholder="Migration, Wasserstoff, Arbeit, Schulden..." data-radar-search-input></label><div class="filter-chip-row">${["Klima", "Energie", "Mobilität", "Migration", "Sozialstaat", "Demokratie", "Staat & Geld", "Ausland & Sicherheit", "Arbeit", "Wohnen"].map((filter) => `<button type="button">${esc(filter)}</button>`).join("")}</div></article><article class="card"><p class="card-kicker">2-5. Ausgabe prüfen</p><div class="sprint5-pill-list">${formats.map((item) => `<span>${esc(item)}</span>`).join("")}</div><p class="card-text"><strong>Ton:</strong> ${tones.join(", ")}. Nicht erlaubt: empört, aggressiv, beschämend, alarmistisch.</p><ul class="clean-list"><li>positives Bild vorhanden</li><li>bessere Frage vorhanden</li><li>Quellenhinweis vorhanden</li><li>kein Frame-Risiko</li><li>keine Menschenabwertung</li><li>kein Rage-Hook</li></ul></article></div><div class="card-grid three sprint5-card-grid">${cardSelect()}</div></div></section>`;
  return shell({ title: "Wirkungsradar Studio", description: "Aus geprüften Karten sichere Antworten, Skripte, Sharepics und Workshop-Material erzeugen.", canonical: `${SITE_URL}/wirkungsradar/studio/`, base: "../../", main });
}

function packPage(dossier, format) {
  const pack = packBySlug[dossier.slug];
  const map = {
    tiktok: pack.platformAssets.tiktok,
    instagram: pack.platformAssets.instagram,
    sharepic: pack.platformAssets.sharepic,
    newsletter: pack.platformAssets.newsletter,
    workshop: pack.platformAssets.workshop,
    embed: pack.platformAssets.embed,
    unterricht: pack.platformAssets.classroom,
  };
  const asset = map[format];
  const title = `${formatLabel(format)} - ${dossier.title}`;
  const body = renderAsset(asset, format, dossier);
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../">Wirkungsradar</a> / <a href="../../">Studio</a> / ${esc(formatLabel(format))}</nav><p class="hero-kicker">Exportformat</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(dossier.cockpit.shortJudgement)}</p></div></section>${radarNav("../../../")}<section class="section"><div><div class="card-grid two"><article class="card sprint5-safety-card"><p class="card-kicker">Safety-Check</p><ul class="clean-list"><li>positives Beispiel sichtbar</li><li>bessere Frage sichtbar</li><li>Quellenhinweis sichtbar</li><li>keine Menschenabwertung</li><li>keine Rage-Hooks</li><li>Status: ${esc(pack.status)}</li></ul></article><article class="card"><p class="card-kicker">Export</p><div class="radar-card-actions"><button class="copy-chip" type="button" data-copy-text='${attr(JSON.stringify(asset, null, 2))}'>JSON kopieren</button><a class="btn btn-secondary" href="../../../live/${esc(dossier.slug)}/">Karte öffnen</a></div></article></div>${body}</div></section>`;
  return shell({ title, description: `Wirkungsradar Studio Export ${formatLabel(format)} für ${dossier.title}.`, canonical: `${SITE_URL}/wirkungsradar/studio/${format}/${dossier.slug}/`, base: "../../../", main });
}

function formatLabel(format) {
  return { tiktok: "TikTok-Skript", instagram: "Instagram-Karussell", sharepic: "Sharepic", newsletter: "Newsletter-Modul", workshop: "Workshop-Karte", embed: "Embed-Widget", unterricht: "Unterrichtsimpuls" }[format] || format;
}

function renderAsset(asset, format, dossier) {
  if (format === "instagram") {
    return `<div class="card-grid four">${asset.slides.map((slide, index) => `<article class="card sprint5-slide"><p class="card-kicker">Slide ${index + 1}</p><h3 class="card-title">${esc(slide.headline)}</h3><p class="card-text">${esc(slide.body)}</p>${slide.visualHint ? `<p class="card-text"><strong>Bildhinweis:</strong> ${esc(slide.visualHint)}</p>` : ""}</article>`).join("")}</div><article class="card"><p class="card-kicker">Caption</p><p>${esc(asset.caption)}</p><p><strong>Alt-Text:</strong> ${esc(asset.altText)}</p></article>`;
  }
  if (format === "tiktok") {
    return `<div class="card-grid three"><article class="card"><p class="card-kicker">30 Sekunden</p><p>${esc(asset.script30s)}</p></article><article class="card"><p class="card-kicker">60 Sekunden</p><p>${esc(asset.script60s)}</p></article><article class="card"><p class="card-kicker">90 Sekunden</p><p>${esc(asset.script90s)}</p></article></div><article class="card"><p class="card-kicker">On-Screen-Text</p><div class="sprint5-pill-list">${asset.onScreenText.map((item) => `<span>${esc(item)}</span>`).join("")}</div><p><strong>Caption:</strong> ${esc(asset.caption)}</p></article>`;
  }
  if (format === "workshop") {
    return `<article class="card"><p class="card-kicker">${esc(asset.durationMinutes)} Minuten</p><h2>${esc(asset.title)}</h2><p>${esc(asset.goal)}</p></article><div class="card-grid two">${asset.flow.map((step) => `<article class="card"><p class="card-kicker">${esc(step.minutes)} Minuten</p><h3>${esc(step.step)}</h3><p>${esc(step.instructions)}</p></article>`).join("")}</div>`;
  }
  if (format === "sharepic") {
    return `<section class="sprint5-sharepic-preview" aria-label="Sharepic Vorschau"><p class="card-kicker">${esc(asset.title)}</p><h2>${esc(asset.subtitle)}</h2><p>${esc(asset.mainLine)}</p><p><strong>Bessere Frage:</strong> ${esc(asset.betterQuestion)}</p><small>${esc(asset.sourceNote)}</small></section>`;
  }
  if (format === "embed") {
    const iframe = `<iframe src="${SITE_URL}${asset.iframePath}" title="Wirkungsradar-Karte: ${dossier.title}" loading="lazy"></iframe>`;
    return `<article class="card"><p class="card-kicker">Embed-Code</p><pre><code>${esc(iframe)}</code></pre><p>${esc(asset.compactAnswer)}</p><p><strong>Bessere Frage:</strong> ${esc(asset.betterQuestion)}</p></article>`;
  }
  return `<article class="card"><pre><code>${esc(JSON.stringify(asset, null, 2))}</code></pre></article>`;
}

function hostPlaybookPage() {
  const situations = [
    ["Jemand wirft ein Stöckchen", "Radwege in Peru!", "Ich nehme den Punkt auf. Lass uns prüfen: Ist es Zuschuss oder Kredit? Was bewirkt es? Wird es kontrolliert?"],
    ["Jemand provoziert mit Menschenabwertung", "Sozialschmarotzer", "Ich mache bei Menschenabwertung nicht mit. Die bessere Frage ist: Welche Struktur bringt Menschen in Arbeit und Teilhabe?"],
    ["Jemand nutzt Ohnmachtsframe", "Deutschland nur 2 %", "Die Zahl ist nur eine Bilanzgrenze. Die bessere Frage ist: Welche Hebel haben wir über Lieferketten, Standards und Technologie?"],
    ["Jemand behauptet Zensur", "Man darf nichts mehr sagen", "Du darfst viel sagen. Andere dürfen widersprechen. Die Frage ist: Geht es um Verbot oder um Kritik?"],
    ["Jemand delegitimiert Medien/Wissenschaft", "Alle Medien lügen", "Medienkritik ist wichtig. Pauschales Misstrauen hilft nicht. Welche konkrete Meldung prüfen wir mit welchen Quellen?"],
    ["Jemand nutzt Technik-Aufschub", "Fusion löst alles", "Fusion ist Forschung. Das Stromsystem braucht Lösungen, die heute wirken. Welche Architektur liefert rechtzeitig Strom?"],
    ["Jemand nutzt Geldverlust-Frame", "Ukraine-Hilfe frisst unser Geld", "Kontrolle ist richtig. Aber Hilfe ist nicht nur Geld weg. Was schützt sie und welche Folgekosten verhindert sie?"],
  ];
  const areas = ["Schnellstart für Hosts", "5-Schritt-Antwort", "Was du nie tun solltest", "Frame sicher verschieben", "Kommentarspalten moderieren", "Live-Stöckchen erkennen", "Mit Wut umgehen", "Mit ehrlicher Sorge umgehen", "Mit störendem Verhalten umgehen", "Mit rechtsextremen Frames umgehen", "Mit Menschen reden, nicht mit dem Frame", "Gute Fragen statt Gegenangriff", "Quellen nennen, ohne Vortrag zu halten", "Plattformformate"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Antwort-Playbooks</nav><p class="hero-kicker">Antwort-Playbooks</p><h1 class="hero-title">Antwort-Playbooks</h1><p class="hero-subtitle">Nicht das Stöckchen tragen. Die Rechnung öffnen.</p></div></section>${radarNav("../")}<section class="section"><div><article class="card sprint5-important-rule"><p class="card-kicker">Die wichtigste Regel</p><h2>Du musst nicht jeden Satz widerlegen.</h2><p>Du musst zeigen, welche Rechnung fehlt.</p><p><strong>Standardformel:</strong> Ich sehe den Punkt. Der wahre Kern ist ... Der falsche Sprung ist ... Ein gutes Bild ist ... Die bessere Frage ist ... Die Lösung ist ...</p></article><div class="card-grid two">${areas.map((area) => `<article class="card"><h3>${esc(area)}</h3><p>${esc(playbookText(area))}</p></article>`).join("")}</div></div></section><section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Debattensituationen</p><h2>Antwortmuster für schwierige Momente.</h2></div><div class="card-grid two">${situations.map(([title, example, answer]) => `<article class="card"><p class="card-kicker">${esc(example)}</p><h3>${esc(title)}</h3><p>${esc(answer)}</p></article>`).join("")}</div><p><a class="btn btn-primary" href="moderationskarten/">Moderationskarten öffnen</a></p></div></section>`;
  return shell({ title: "Antwort-Playbooks", description: "Schnellstart, Standardformel, Debattensituationen und Moderationskarten für sichere Debatten-Kompass-Kommunikation.", canonical: `${SITE_URL}/wirkungsradar/antwort-playbooks/`, base: "../../", main });
}

function playbookText(area) {
  const map = {
    "Schnellstart für Hosts": "Wahren Kern anerkennen, falschen Sprung benennen, gutes Bild setzen, bessere Frage stellen.",
    "5-Schritt-Antwort": "Ich sehe den Punkt. Was stimmt? Was fehlt? Was wäre besser? Welche Frage hilft weiter?",
    "Was du nie tun solltest": "Nicht beschämen, nicht empören, nicht den Mythos groß machen, keine unsicheren Zahlen ohne Quellenhinweis.",
    "Frame sicher verschieben": "Vom alten Bild zur fehlenden Rechnung wechseln.",
    "Kommentarspalten moderieren": "Kurze Antwort, klare Grenze, Link zur Karte, keine Endlosdebatte.",
    "Live-Stöckchen erkennen": "Wenn ein Satz nur vom Thema wegzieht, erst Zweck und Rechnung klären.",
    "Mit Wut umgehen": "Gefühl anerkennen, Person respektieren, Handlungspfad öffnen.",
    "Mit ehrlicher Sorge umgehen": "Sorge ernst nehmen, aber die falsche Schlussfolgerung trennen.",
    "Mit störendem Verhalten umgehen": "Einmal Grenze setzen, dann zur Sache zurückkehren.",
    "Mit rechtsextremen Frames umgehen": "Menschenwürde nicht verhandeln, Frame sparsam benennen, demokratische Grenze klar halten.",
    "Mit Menschen reden, nicht mit dem Frame": "Nicht die Person gewinnen wollen; die Debatte wieder prüfbar machen.",
    "Gute Fragen statt Gegenangriff": "Eine gute Frage macht die bessere Rechnung sichtbar.",
    "Quellen nennen, ohne Vortrag zu halten": "Nur knapp: Quelle, Datenstand, Grenze. Dann Karte verlinken.",
    Plattformformate: "Kommentar kurz, Live klar, TikTok bildhaft, Instagram folienlogisch, Newsletter ruhig.",
  };
  return map[area] || "Ruhig bleiben und die Wirkungsrechnung öffnen.";
}

function moderationCardsPage() {
  const cards = [
    ["Ich nehme den Punkt auf.", "deeskalieren", "Wenn ein Einwurf hektisch wird.", "Wenn Menschen abgewertet werden.", "Ich nehme den Punkt auf. Welche Rechnung fehlt?"],
    ["Welche Quelle meinst du?", "Quellenklarheit", "Wenn eine Zahl ohne Beleg kommt.", "Wenn die Quelle als Angriff genutzt wird.", "Welche Quelle meinst du und was genau belegt sie?"],
    ["Was wird mitgezählt?", "Bilanz öffnen", "Bei Kosten, Prozenten und Vergleichen.", "Wenn die Bilanzgrenze bereits klar ist.", "Zählen wir nur den Auspuff oder den Lebenszyklus?"],
    ["Was passiert danach?", "Folgencheck", "Wenn ein Satz nur Sofortkosten zeigt.", "Wenn akute Hilfe nötig ist.", "Welche Folge wird wahrscheinlicher?"],
    ["Wer wird hier verantwortlich gemacht?", "Sündenbock erkennen", "Wenn Gruppen statt Strukturen beschuldigt werden.", "Nicht als Vorwurf gegen Fragende nutzen.", "Geht es um Menschen oder um Regeln?"],
    ["Welche Lösung macht es besser?", "Raus aus Empörung", "Wenn die Debatte feststeckt.", "Wenn erst Fakten geklärt werden müssen.", "Welche Maßnahme verbessert den Zustand?"],
    ["Das ist eine berechtigte Sorge, aber...", "Sorge anerkennen", "Wenn der Kern berechtigt ist.", "Wenn eine Grenze nötig ist.", "Das ist eine berechtigte Sorge, aber die Folgerung passt nicht."],
    ["Ich mache bei Menschenabwertung nicht mit.", "Grenze setzen", "Bei abwertenden Begriffen.", "Nicht als Standardantwort auf Kritik.", "Ich mache bei Menschenabwertung nicht mit. Lass uns die Struktur prüfen."],
    ["Nicht alles ist Zensur. Widerspruch gehört dazu.", "Sagbarkeitsframe öffnen", "Wenn Kritik als Verbot erzählt wird.", "Bei realen Rechtsfragen zu pauschal.", "Geht es um Verbot oder um Widerspruch?"],
    ["Forschung ist Korrektursystem.", "Wissenschaft beantworten", "Wenn Wissenschaft pauschal delegitimiert wird.", "Wenn konkrete Studie geprüft wird.", "Welche Aussage prüfen wir mit welchem Datenstand?"],
  ];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../">Debatten-Kompass</a> / <a href="../">Antwort-Playbooks</a> / Moderationskarten</nav><p class="hero-kicker">Antwort-Playbooks</p><h1 class="hero-title">Moderationskarten</h1><p class="hero-subtitle">Sätze, die Debatten wieder prüfbar machen.</p></div></section>${radarNav("../../")}<section class="section"><div><div class="card-grid two">${cards.map(([sentence, purpose, when, notWhen, example]) => `<article class="card"><p class="card-kicker">${esc(purpose)}</p><h3>${esc(sentence)}</h3><p><strong>Wann nutzen?</strong> ${esc(when)}</p><p><strong>Nicht nutzen, wenn:</strong> ${esc(notWhen)}</p><p><strong>Beispiel:</strong> ${esc(example)}</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Moderationskarten", description: "Moderationskarten für Quellenklarheit, Bilanzgrenzen, Folgencheck und Menschenwürde.", canonical: `${SITE_URL}/wirkungsradar/antwort-playbooks/moderationskarten/`, base: "../../../", main });
}

function workshopsPage() {
  const types = [
    ["45 Minuten", "Frame erkennen", "Was macht ein Satz mit einer Debatte?"],
    ["90 Minuten", "Folgencheck statt nur Faktencheck", "Aussagen nach Faktenkern, Frame und Wirkung prüfen."],
    ["120 Minuten", "Social-Media-Debatte moderieren", "Kommentarspalten ruhig, fair und quellenklar führen."],
    ["180 Minuten", "Wirkungsradar-Labor", "Aus Claims geprüfte Karten und bessere Fragen bauen."],
    ["Tagesworkshop", "Narrative, Psychologie und demokratische Resilienz", "Mechanismen erkennen und souverän umgehen."],
  ];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Workshops</nav><p class="hero-kicker">Materialien</p><h1 class="hero-title">Workshops</h1><p class="hero-subtitle">Material für Lehrkräfte, NGOs, Kommunen, Medienbildung und politische Bildung.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${types.map(([duration, title, text]) => `<article class="card"><p class="card-kicker">${esc(duration)}</p><h3>${esc(title)}</h3><p>${esc(text)}</p><ul class="clean-list"><li>Ablaufplan</li><li>Moderationskarten</li><li>Arbeitsblatt</li><li>Fallkarten</li><li>Reflexionsfragen</li><li>Quellenblatt</li></ul></article>`).join("")}</div><article class="card"><p class="card-kicker">Pflichtregel</p><p>Keine Gruppe arbeitet mit menschenabwertenden Claims ohne Moderationshinweis. Ungeprüfte Aussagen werden nicht öffentlich ausgestellt.</p></article><p><a class="btn btn-primary" href="print/klima-energie/">Kartenset Klima & Energie drucken</a></p></div></section>`;
  return shell({ title: "Wirkungsradar Workshops", description: "Workshopformate und Materialien für Folgencheck, Frames, Social Media und demokratische Resilienz.", canonical: `${SITE_URL}/wirkungsradar/workshops/`, base: "../../", main });
}

function workshopPrintPage() {
  const slugs = ["deutschland-nur-zwei-prozent", "e-autos-schlimmer-als-verbrenner", "windraeder-voegel-wald-beton-rueckbau", "fusion-loest-das-energieproblem", "kernenergie-wieder-in-deutschland", "wasserstoff-fuer-alles"];
  const cards = slugs.map((slug) => p0DossiersV2.find((dossier) => dossier.slug === slug)).filter(Boolean);
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><p class="hero-kicker">Druckansicht</p><h1 class="hero-title">Kartenset Klima & Energie</h1><p class="hero-subtitle">Ordne Claim, Frame, Psychologie, gutes Bild, bessere Frage und Quelle zu.</p></div></section><section class="section"><div><div class="card-grid three">${cards.map((dossier) => `<article class="card sprint5-print-card"><p class="card-kicker">Claim-Karte</p><h3>${esc(shortClaim(dossier))}</h3><p><strong>Frame:</strong> ${esc(dossier.cockpit.frameShift.oldFrame)}</p><p><strong>Gutes Bild:</strong> ${esc(positiveLine(dossier))}</p><p><strong>Bessere Frage:</strong> ${esc(dossier.cockpit.betterQuestion)}</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Kartenset Klima & Energie", description: "Druckansicht für Wirkungsradar-Workshopkarten.", canonical: `${SITE_URL}/wirkungsradar/workshops/print/klima-energie/`, base: "../../../../", main });
}

function simpleMaterialPage(kind) {
  const modules = kind === "unterricht"
    ? ["Faktencheck vs. Folgencheck", "Was ist ein Frame?", "Warum Bilder stärker wirken als Zahlen", "Wie man bessere Fragen stellt", "Social Media und Desinformation", "Klima-Narrative", "Migration und Menschenwürde", "Demokratie und Quellenklarheit", "Energie und Systemdenken", "Staat, Schulden und Zukunft"]
    : ["Mythos der Woche", "Bessere Frage der Woche", "Narrativ der Woche", "Quellenklarheit", "Host-Kit", "Workshop-Impuls"];
  const title = kind === "unterricht" ? "Unterricht" : "Newsletter";
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / ${esc(title)}</nav><p class="hero-kicker">Materialien</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${kind === "unterricht" ? "Module für Sek I, Sek II, Berufsschule, politische Bildung, Medienbildung und Erwachsenenbildung." : "Serienlogik für bessere Fragen, Quellenklarheit und Host-Kits."}</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${modules.map((module) => `<article class="card"><h3>${esc(module)}</h3><p><strong>Lernziel:</strong> Menschen können erklären, warum eine Aussage teilweise stimmen und trotzdem zu falscher Handlung führen kann.</p><p><strong>Aufgabe:</strong> Was wird gesagt? Was stimmt? Was fehlt? Welches Bild entsteht? Welche bessere Frage hilft weiter?</p></article>`).join("")}</div></div></section>`;
  return shell({ title, description: `${title} für den Wirkungsradar.`, canonical: `${SITE_URL}/wirkungsradar/${kind}/`, base: "../../", main });
}

function embedIndexPage() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Embed</nav><p class="hero-kicker">Einbettungen</p><h1 class="hero-title">Wirkungsradar einbetten</h1><p class="hero-subtitle">Andere Seiten können geprüfte Karten als iframe, JSON oder kompakte Trust Card nutzen.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${p0DossiersV2.map((dossier) => `<article class="card"><h3>${esc(dossier.title)}</h3><p>${esc(dossier.cockpit.sayThisNow)}</p><pre><code>${esc(`<iframe src="${SITE_URL}/wirkungsradar/embed/card/${dossier.slug}/" title="Wirkungsradar-Karte: ${dossier.title}" loading="lazy"></iframe>`)}</code></pre></article>`).join("")}</div></div></section>`;
  return shell({ title: "Wirkungsradar Embed", description: "Geprüfte Wirkungsradar-Karten datenschutzarm einbetten.", canonical: `${SITE_URL}/wirkungsradar/embed/`, base: "../../", main });
}

function embedCardPage(dossier) {
  const main = `<article class="sprint5-embed-card"><p class="card-kicker">Wirkungsradar</p><h1>${esc(shortClaim(dossier))}</h1><p><strong>${esc(dossier.cockpit.shortJudgement)}</strong></p><p>${esc(dossier.cockpit.sayThisNow)}</p><p><strong>Gutes Bild:</strong> ${esc(positiveLine(dossier))}</p><p><strong>Bessere Frage:</strong> ${esc(dossier.cockpit.betterQuestion)}</p><p><a class="btn btn-primary" target="_blank" rel="noopener" href="../../../live/${esc(dossier.slug)}/">Karte öffnen</a></p><small>Datenstand ${DATA_STAND} · Quellen in der Karte</small></article>`;
  return shell({ title: `Embed ${dossier.title}`, description: `Kompakte Wirkungsradar-Embed-Karte für ${dossier.title}.`, canonical: `${SITE_URL}/wirkungsradar/embed/card/${dossier.slug}/`, base: "../../../../", main, extraHead: `<meta name="robots" content="noindex">` });
}

function mythReportPage() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Debatten-Kompass</a> / Narrativ einreichen</nav><p class="hero-kicker">Meldeworkflow</p><h1 class="hero-title">Narrativ einreichen</h1><p class="hero-subtitle">Hast du eine Aussage gesehen, die geprüft werden sollte?</p><p class="radar-sprint-lead">Die Einreichung läuft geschützt über die Akademie-App mit Discord-Login. Du landest dort auf einer eigenen Narrativ-Seite, nicht auf der Fragenstrecke.</p><p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Zur Akademie-App wechseln</a></p></div></section>${radarNav("../")}<section class="section"><div><article class="card"><p class="card-kicker">Sichere Redaktion</p><h2>Erst Login, dann Formular.</h2><p>Gemeldete Aussagen werden nicht automatisch veröffentlicht. Wir prüfen intern zuerst auf Dubletten, bestehende Karten, Frame-Risiken, Schutzbedarf und Aufklärungsnutzen.</p><p><a class="btn btn-primary" href="${ACADEMY_NARRATIVE_URL}">Narrativ einreichen</a></p></article><article class="card"><p class="card-kicker">Redaktion</p><ul class="clean-list"><li>Rohzitate werden nicht automatisch veröffentlicht</li><li>Dubletten werden mit bestehenden Karten zusammengeführt</li><li>Schutzbedarf und Menschenabwertung werden intern markiert</li><li>Verschwörungsframes bekommen gesonderte redaktionelle Prüfung</li></ul><p>Keine toxischen Originalzitate in öffentlicher Statistik.</p></article></div></section>`;
  return shell({ title: "Narrativ einreichen", description: "Sicherer Meldeworkflow für neue Narrative, Frames und problematische Aussagen.", canonical: `${SITE_URL}/wirkungsradar/narrativ-einreichen/`, base: "../../", main });
}

function templatesPage() {
  const templates = [
    ["Kommentarantwort kurz", "Der Punkt ist nicht völlig aus der Luft. Der falsche Sprung ist: [Denkfehler]. Ein gutes Bild ist: [positives Beispiel]. Die bessere Frage lautet: [Frage]."],
    ["Live-Antwort", "Ich nehme den Punkt auf. Was stimmt: [wahrer Kern]. Was fehlt: [fehlende Bilanz]. So sieht es besser aus: [gutes Bild]. Die bessere Frage ist: [Frage]."],
    ["Frame-Shift", "Ich würde es nicht als [alter Frame] erzählen. Ich würde fragen: [bessere Rechnung]."],
    ["Quellenhinweis", "Die Quellen und den Datenstand findest du in der Wirkungsradar-Karte."],
    ["Ruhig kontern", "Ich verstehe den Reflex. Lass uns die Rechnung öffnen: [Bilanzgrenze]."],
  ];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Templates</nav><p class="hero-kicker">Vorlagen</p><h1 class="hero-title">Template-Bibliothek</h1><p class="hero-subtitle">Vorlagen für Posts, Skripte, Workshopkarten und Antworten.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${templates.map(([title, text]) => `<article class="card"><h3>${esc(title)}</h3><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text="${attr(text)}">Vorlage kopieren</button></article>`).join("")}</div></div></section>`;
  return shell({ title: "Template-Bibliothek", description: "Wirkungsradar-Vorlagen für Kommentare, Live-Moderation, Social, Newsletter, Workshop und Quellenkarten.", canonical: `${SITE_URL}/wirkungsradar/templates/`, base: "../../", main });
}

function usagePage() {
  const rules = ["Was darf geteilt werden?", "Wie zitieren?", "Wie Quellen nennen?", "Was darf nicht verändert werden?", "Kein Herauslösen von Aussagen ohne Kontext.", "Keine Nutzung zur Menschenabwertung.", "Keine Nutzung ohne Quellenhinweis bei Zahlen.", "Keine Nutzung als Parteipropaganda.", "Hinweis auf Autorinnenschaft und wirkungsoekonomie.de."];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Nutzung</nav><p class="hero-kicker">Nutzung</p><h1 class="hero-title">Wirkungsradar nutzen und zitieren</h1><p class="hero-subtitle">Teilen ist erwünscht, aber nicht ohne Kontext, Quellenhinweis und bessere Frage.</p></div></section>${radarNav("../")}<section class="section"><div><div class="card-grid two">${rules.map((rule) => `<article class="card"><p>${esc(rule)}</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Wirkungsradar Nutzung", description: "Nutzungslogik, Zitieren und Quellenhinweise für Wirkungsradar-Inhalte.", canonical: `${SITE_URL}/wirkungsradar/nutzung/`, base: "../../", main });
}

function adminPage() {
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><p class="hero-kicker">Geschützter Bereich</p><h1 class="hero-title">Narrativ-Einreichungen</h1><p class="hero-subtitle">Die redaktionelle Bearbeitung liegt in der Akademie-App und ist nur nach Login sichtbar.</p><div class="hero-actions"><a class="btn btn-primary" href="https://akademie.wirkungsoekonomie.de/dozentin/narrative" rel="noopener noreferrer">Zur Akademie-App</a></div></div></section>`;
  return shell({ title: "Narrativ-Einreichungen", description: "Weiterleitung zur geschützten Akademie-App.", canonical: `${SITE_URL}/admin/wirkungsradar/narrativ-queue/`, base: "../../../", main, extraHead: `<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=https://akademie.wirkungsoekonomie.de/dozentin/narrative">` });
}

function analyticsPage() {
  const metrics = ["kopierte Antworten", "exportierte Skripte", "eingereichte Narrative", "neue Dossier-Kandidaten", "Feedback: Frame-Risiko", "Feedback: Quelle fehlt", "Feedback: Sprache zu kompliziert", "Workshop-Downloads", "Embed-Nutzung", "kopierte bessere Fragen", "kopierte positive Beispiele"];
  const main = `<section class="hero radar-page-hero radar-sprint-hero"><div><p class="hero-kicker">Intern</p><h1 class="hero-title">Distribution Analytics</h1><p class="hero-subtitle">Gemessen wird Bedarf nach Klarheit, nicht Empörung.</p></div></section><section class="section"><div><div class="card-grid three">${metrics.map((metric) => `<article class="card"><p class="card-kicker">Metrik</p><h3>${esc(metric)}</h3><p>Nicht nach Rage-Kommentaren, toxischer Viralität oder Gegnerbindung optimieren.</p></article>`).join("")}</div></div></section>`;
  return shell({ title: "Distribution Analytics", description: "Wirkungsorientierte Metriken für Wirkungsradar-Verbreitung.", canonical: `${SITE_URL}/admin/wirkungsradar/distribution-analytics/`, base: "../../../", main, extraHead: `<meta name="robots" content="noindex">` });
}

function writeApis() {
  const cards = p0DossiersV2.filter(exportAllowed).map((dossier) => ({
    slug: dossier.slug,
    claim: dossier.claim,
    shortJudgement: dossier.cockpit.shortJudgement,
    sayThisNow: dossier.cockpit.sayThisNow,
    positiveExample: positiveLine(dossier),
    betterQuestion: dossier.cockpit.betterQuestion,
    status: dossier.status,
    dataStand: DATA_STAND,
    sourcesSummary: "Quellen, Grenzen und Datenstand in der Karte.",
    url: `${SITE_URL}/wirkungsradar/live/${dossier.slug}/`,
  }));
  write(OUT("assets/data/wirkungsradar-distribution-packs.json"), JSON.stringify(packs, null, 2));
  write(OUT("api/wirkungsradar/cards/index.json"), JSON.stringify(cards, null, 2));
  write(OUT("api/wirkungsradar/cards/index.html"), `<pre>${esc(JSON.stringify(cards, null, 2))}</pre>`);
  for (const card of cards) {
    const pack = packBySlug[card.slug];
    write(OUT("api/wirkungsradar/cards", `${card.slug}.json`), JSON.stringify(card, null, 2));
    write(OUT("api/wirkungsradar/cards", card.slug, "index.html"), `<pre>${esc(JSON.stringify(card, null, 2))}</pre>`);
    write(OUT("api/wirkungsradar/distribution", `${card.slug}.json`), JSON.stringify(pack, null, 2));
    write(OUT("api/wirkungsradar/distribution", card.slug, "index.html"), `<pre>${esc(JSON.stringify(pack, null, 2))}</pre>`);
    write(OUT("api/wirkungsradar/embed", `${card.slug}.json`), JSON.stringify({ ...card, embed: pack.platformAssets.embed }, null, 2));
  }
  write(OUT("api/wirkungsradar/report-narrative/index.html"), `<pre>${esc(JSON.stringify({
    status: "academy_narrative_flow",
    submissionRoute: ACADEMY_NARRATIVE_URL,
    moderationArea: "narrativ_queue",
    rateLimit: "academy_discord_login",
    honeypot: "website",
    publicDisplay: false,
    seedMatching: seedTriagePolicy,
  }, null, 2))}</pre>`);
}

function mythCta(href = ACADEMY_NARRATIVE_URL) {
  return `<section class="section sprint5-myth-cta" data-sprint5-myth-cta data-search-exclude><div><article class="card"><p class="card-kicker">Fehlt ein Narrativ?</p><h2>Hast du eine Aussage gesehen, die geprüft werden sollte?</h2><p>Hast du eine Aussage, ein Narrativ, einen Frame oder eine Behauptung gesehen, die Wirkung entfaltet? Reiche sie ein. Nicht jede Einreichung wird veröffentlicht.</p><a class="btn btn-primary" href="${esc(href)}">Narrativ einreichen</a></article></div></section>`;
}

function injectCtas() {
  const targets = [
    OUT("wirkungsradar/index.html"),
    OUT("wirkungsradar/live/index.html"),
    OUT("wirkungsradar/debattenkarten/index.html"),
    OUT("wirkungsradar/narrative/index.html"),
    OUT("wirkungsradar/host-playbook/index.html"),
    OUT("wirkungsradar/antwort-playbooks/index.html"),
    ...listHtml(OUT("wirkungsradar/live")),
    ...listHtml(OUT("wirkungsradar/narrative")),
  ];
  for (const file of targets) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/<section class="section sprint5-myth-cta"[\s\S]*?<\/section>\n?/g, "");
    const href = ACADEMY_NARRATIVE_URL;
    if (html.includes("</main>")) {
      html = html.replace("</main>", `${mythCta(href)}\n</main>`);
      fs.writeFileSync(file, html);
    }
  }
}

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const index = path.join(full, "index.html");
      if (fs.existsSync(index)) result.push(index);
    }
  }
  return result;
}

function writeDocs() {
  write(OUT("docs/wirkungsradar-distribution-guidelines.md"), `# Multiplizierungsleitlinien Debatten-Kompass

1. Keine Rage-Hooks.
2. Keine Menschenabwertung.
3. Kein Mythos als grosses Titelbild.
4. Keine ungeprueften Zahlen.
5. Kein Quellenverlust beim Kuerzen.
6. Keine Beschaemung von Menschen, die Fragen stellen.
7. Positive Beispiele zuerst.
8. Bessere Frage immer mitgeben.
9. FrameShift nie entfernen.
10. Deep Dive verlinken.
11. Plattformlogik nicht blind bedienen.
12. Reichweite ist kein Erfolg, wenn sie Vertrauen zerstoert.
13. Kritik ist legitim; Zersetzung wird markiert.
14. Content muss in Kommentarspalten deeskalieren koennen.
15. Der Host soll souveraen wirken, nicht triumphierend.

Kernsatz:
"Ein gutes Debatten-Kompass-Format gewinnt nicht durch Empoerung, sondern durch Klarheit."
`);
}

writeApis();
writeDocs();
write(OUT("wirkungsradar/studio/index.html"), studioPage());
for (const dossier of p0DossiersV2) {
  for (const format of ["tiktok", "instagram", "sharepic", "newsletter", "workshop", "embed", "unterricht"]) {
    write(OUT("wirkungsradar/studio", format, dossier.slug, "index.html"), packPage(dossier, format));
  }
  write(OUT("wirkungsradar/embed/card", dossier.slug, "index.html"), embedCardPage(dossier));
  write(OUT("wirkungsradar/embed/host", dossier.slug, "index.html"), embedCardPage(dossier));
  write(OUT("wirkungsradar/embed/trust", dossier.slug, "index.html"), embedCardPage(dossier));
}
write(OUT("wirkungsradar/host-playbook/index.html"), hostPlaybookPage());
write(OUT("wirkungsradar/host-playbook/moderationskarten/index.html"), moderationCardsPage());
write(OUT("wirkungsradar/antwort-playbooks/index.html"), hostPlaybookPage());
write(OUT("wirkungsradar/antwort-playbooks/moderationskarten/index.html"), moderationCardsPage());
write(OUT("wirkungsradar/workshops/index.html"), workshopsPage());
write(OUT("wirkungsradar/workshops/print/klima-energie/index.html"), workshopPrintPage());
write(OUT("wirkungsradar/unterricht/index.html"), simpleMaterialPage("unterricht"));
write(OUT("wirkungsradar/newsletter/index.html"), simpleMaterialPage("newsletter"));
write(OUT("wirkungsradar/embed/index.html"), embedIndexPage());
write(OUT("wirkungsradar/embed/report-narrative/index.html"), mythReportPage());
write(OUT("wirkungsradar/narrativ-einreichen/index.html"), mythReportPage());
write(OUT("wirkungsradar/templates/index.html"), templatesPage());
write(OUT("wirkungsradar/nutzung/index.html"), usagePage());
write(OUT("admin/wirkungsradar/narrativ-queue/index.html"), adminPage());
write(OUT("admin/wirkungsradar/distribution-analytics/index.html"), analyticsPage());
injectCtas();

console.log(`Built Wirkungsradar Sprint 5 distribution layer for ${packs.length} dossiers.`);

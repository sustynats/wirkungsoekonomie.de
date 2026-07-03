#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const registry = JSON.parse(readFileSync(join(ROOT, "content", "studienskripte", "index.json"), "utf8"));

const byTrack = new Map();
for (const script of registry.scripts) {
  const list = byTrack.get(script.track) ?? [];
  list.push(script);
  byTrack.set(script.track, list);
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status) {
  if (status === "pilot-arbeitsfassung") return "Pilot-Arbeitsfassung";
  if (status === "rohfassung-v0") return "Rohfassung V0";
  if (status === "studienskript-v1-rohfassung") return "V1-Rohfassung";
  return status;
}

const sections = Array.from(byTrack.entries()).map(([track, scripts]) => `
      <section class="section">
        <div class="section-header">
          <h2>${esc(track)}</h2>
          <p>${scripts.length} Rohfassungen im Masterverzeichnis. Die finale CI/CD-Fassung erfolgt nach Claude-QS.</p>
        </div>
        <div class="knowledge-library-grid">
          ${scripts.map((script) => `
          <article class="knowledge-library-card">
            <div class="document-card-badges">
              <span class="status-badge">Studienskript</span>
              <span class="status-badge">${esc(statusLabel(script.status))}</span>
            </div>
            <h3>${esc(script.code)}: ${esc(script.title)}</h3>
            <p>Markdown-Master, Word-Rohfassung und App-Zuordnung sind angelegt. Der nächste Produktionsschritt ist die fachliche Tiefenfassung und CI/CD-Finalisierung.</p>
            <dl class="document-card-meta">
              <dt>Master</dt><dd>${esc(script.masterPath)}</dd>
              <dt>Word</dt><dd>${esc(script.wordRawPath)}</dd>
              <dt>App</dt><dd>${esc(script.appMirrorPath)}</dd>
            </dl>
          </article>`).join("\n")}
        </div>
      </section>`).join("\n");

const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Studienskripte | Bibliothek der Wirkungsökonomie</title>
    <meta name="description" content="Öffentlich lesbare Studienskripte der WÖk-Akademie: wissenschaftlich anschlussfähig, verständlich erklärt, mit Quellen, Tabellen, Bildern, Formeln und Glossar.">
    <meta name="search_title" content="Studienskripte | Bibliothek der Wirkungsökonomie">
    <meta name="search_description" content="Öffentlich lesbare Studienskripte der WÖk-Akademie mit Quellen, Tabellen, Bildern, Formeln, Glossar und Mini-Quiz.">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Studienskript">
    <link rel="stylesheet" href="../../assets/css/style.css?v=20260612-mobile-table-fix">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="../../index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="../../assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <nav class="site-nav" aria-label="Hauptnavigation">
        <a href="../../verstehen/">Verstehen</a>
        <a href="../../lernen/">Lernen</a>
        <a href="../">Bibliothek</a>
      </nav>
    </header>
    <main data-pagefind-body>
      <section class="hero compact-hero document-library-hero">
        <p class="hero-kicker">Bibliothek · Studienskripte</p>
        <h1>Studienskripte der WÖk-Akademie</h1>
        <p class="hero-subtitle">Die ausführlichen Vorlesungsskripte sind öffentliche Wissensdokumente. Der Lernraum der Akademie nutzt sie für Reader, Notizen, PDF und Fortschritt; die Bibliothek macht sie frei lesbar und zitierbar.</p>
      </section>
      <section class="section section-muted">
        <div class="section-header">
          <h2>Produktionsstand</h2>
          <p>${registry.scripts.length} Vorlesungen liegen als Rohfassungs-Artefakte vor: Markdown-Master, Word-Rohfassung und App-Zuordnung. Rohfassung bedeutet: strukturiert und übergabefähig, aber noch nicht finaler 40-50-Seiten-Tiefenstandard.</p>
        </div>
      </section>
${sections}
      <section class="section section-muted">
        <div class="section-header">
          <h2>Grenze zu Prüfungen</h2>
          <p>Mini-Quiz und Verständnisfragen können im Skript öffentlich stehen. Zertifikatsprüfungen, Antwortlogik, CorrectAnswer-Felder, Scoring-Regeln und Fallrubrics bleiben geschützt in der Akademie-App.</p>
        </div>
      </section>
    </main>
    <script src="../../assets/js/main.js" defer></script>
  </body>
</html>
`;

writeFileSync(join(ROOT, "bibliothek", "studienskripte", "index.html"), html, "utf8");

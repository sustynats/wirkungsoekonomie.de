#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const packageId = "WOEK-PORTAL-TEXTREDAKTION-2026-08-15";
const output = path.join(os.homedir(), "Downloads", `${packageId}.zip`);

const copySources = [
  { route: "Alle Seiten · Kopf und Fuß", file: "app/layout.tsx" },
  { route: "Hauptnavigation", file: "app/components/PortalNav.tsx" },
  { route: "Startseite · allgemein und Parlament-Modus", file: "app/page.tsx" },
  { route: "Bereichsseiten · Radar, Historie, Methodik, Vertrauen, Monitor", file: "app/[section]/page.tsx" },
  { route: "Länderübersicht", file: "app/laender/page.tsx" },
  { route: "Sachsen-Anhalt · Wahlbereich", file: "app/laender/sachsen-anhalt/page.tsx" },
  { route: "Sachsen-Anhalt · Quellen", file: "app/laender/sachsen-anhalt/quellen/page.tsx" },
  { route: "Mandat und Praxis", file: "app/mandat-und-praxis/page.tsx" },
  { route: "Quellenarchiv", file: "app/quellen/page.tsx" },
  { route: "Quellendetailansicht", file: "app/quellen/[slug]/page.tsx" },
  { route: "Suche", file: "app/suche/page.tsx" },
  { route: "Suche · Filter und Hinweise", file: "app/suche/ParliamentSearch.tsx" },
  { route: "Fachanalysen · Übersicht", file: "app/fachanalysen/page.tsx" },
  { route: "Fachanalysen · Detailansicht", file: "app/fachanalysen/[slug]/page.tsx" },
  { route: "Abstimmungsbilanz · Übersicht", file: "app/abgeordnete/page.tsx" },
  { route: "Abstimmungsbilanz · Detailansicht", file: "app/abgeordnete/[slug]/page.tsx" },
  { route: "Abstimmungsbilanz · Quellen", file: "app/abgeordnete/[slug]/quelle/page.tsx" },
  { route: "Abstimmung · Detailansicht", file: "app/abstimmungen/[voteId]/page.tsx" },
  { route: "Wirkungsakte · Detailansicht", file: "app/entscheidungen/[slug]/page.tsx" },
  { route: "Begriffe", file: "app/begriffe/page.tsx" },
  { route: "E-Mail-Updates", file: "app/wirkungsradar-updates/page.tsx" },
  { route: "E-Mail-Updates · Bestätigung und Abmeldung", file: "app/wirkungsradar-updates/bestaetigen/page.tsx" },
  { route: "E-Mail-Updates · Bestätigung und Abmeldung", file: "app/wirkungsradar-updates/abmelden/page.tsx" },
  { route: "E-Mail-Updates · Formular", file: "app/components/WirkungsradarQuickSignup.tsx" },
  { route: "E-Mail-Updates · Formular", file: "app/wirkungsradar-updates/WirkungsradarSignup.tsx" },
  { route: "E-Mail-Updates · ältere Routen", file: "app/woek-newsletter/bestaetigen/page.tsx" },
  { route: "E-Mail-Updates · ältere Routen", file: "app/woek-newsletter/abmelden/page.tsx" },
  { route: "Wirkungsraum und Zielgruppenmodus", file: "app/components/WirkungsraumLink.tsx" },
  { route: "Wirkungsraum und Zielgruppenmodus", file: "app/components/AudienceModeSwitch.tsx" },
  { route: "Fallkarten und Merken", file: "app/components/CaseCard.tsx" },
  { route: "Fallkarten und Merken", file: "app/components/BookmarkLink.tsx" },
  { route: "Wirkungsakte · erklärende Bausteine", file: "app/components/WorkingActExplainer.tsx" },
  { route: "Wirkungsakte · Wirkungsnetz", file: "app/components/ImpactReviewMap.tsx" },
  { route: "Wirkungscheck · erklärende Bausteine", file: "app/components/AssessmentExplainer.tsx" },
  { route: "Wirkungscheck · normative Kacheln", file: "app/components/NormativeImpactTiles.tsx" },
  { route: "Glossar-Kurzbox", file: "app/components/GlossaryBasics.tsx" }
];

const briefing = `# Textredaktion Wirkungsportal Parlament

## Aufgabe

Überarbeite die beiliegenden statischen Interface- und Vertrauens-Texte für
das Wirkungsportal Parlament. Es geht ausdrücklich nicht um die inhaltliche
Bewertung einzelner Entscheidungen, Programme, Personen oder Parteien.

Ziel ist eine Start- und Vertrauensebene, die Menschen ohne Vorkenntnisse
sofort beantwortet:

1. Was ist dieses Portal?
2. Was bringt es mir?
3. Was bedeutet Wirkungsökonomie in einfacher Sprache?
4. Wie werden Entscheidungen vor einer Abstimmung und im Rückblick geprüft?
5. Wer steht dahinter, worauf beruht die Einordnung und warum ist sie
   nachvollziehbar?

## Ton und Verständlichkeit

- Klar, freundlich, präzise; kurze Sätze und konkrete Verben.
- Fachlich korrekt, ohne vorauszusetzende Begriffe wie „Radar“, „Wirkpfad“,
  „Referenzrahmen“ oder „Nichtkompensation“. Wenn sie nötig sind, beim ersten
  Auftreten kurz erklären.
- Keine Werbesprache, keine Übertreibung und keine Behauptung wissenschaftlicher
  Sicherheit, wenn der Text nur einen Prüfprozess beschreibt.
- Leseransprache innerhalb einer Seite einheitlich halten.
- Jede wichtige Aussage soll auch beim Überfliegen verständlich bleiben.

## Fachliche Leitplanken

- Wirkung ist eine tatsächliche Zustandsveränderung.
- Wirkungspotenzial ist eine erwartbare Veränderung unter Annahmen; es ist
  noch keine eingetretene Wirkung.
- Wirkungsrisiko bleibt getrennt sichtbar.
- SDGs und Agenda 2030 sind der gemeinsame, offengelegte Referenzrahmen.
  SDG+, Rechtsrahmen, Staatsziele und landesspezifische Nachhaltigkeitsziele
  ergänzen ihn als getrennte Ebenen.
- Parteiunabhängigkeit bedeutet nicht, einen Maßstab zu verbergen. Partei,
  Fraktion, Person oder Mehrheitsprognose sind keine Eingaben der fachlichen
  Einordnung.
- Das Portal bewertet keine Menschen, Gesinnungen oder politische Profile.
- Eine Einordnung ersetzt weder demokratische Entscheidung noch
  Rechtsberatung.
- Quellen, Annahmen, Rechenweg und Unsicherheit sollen verständlich
  angekündigt werden; fehlende Daten bleiben offen.

## Was nicht verändern

- Keine neuen Tatsachen, Zahlen, Rechtsbehauptungen, Quellen, Funktionen oder
  Veröffentlichungszusagen erfinden.
- Keine konkreten Fallinhalte umschreiben; solche Inhalte sind nicht Teil
  dieses Pakets.
- Keine internen Prozesshinweise, technischen Hinweise oder Platzhalter in
  den vorgeschlagenen öffentlichen Text aufnehmen.
- Routen, Links, Datenfelder, Schaltflächenfunktionen und Barrierefreiheit
  nicht umdeuten.

## Rückgabe

Liefere:

1. COPY_REVIEW.md: je Block-ID eine verbesserte Fassung mit einer knappen
   Begründung nur bei substanzieller Änderung.
2. copy-revision.json: die gleichen Änderungen maschinenlesbar nach der
   beiliegenden Vorlage.
3. editorial-notes.md: maximal eine Seite mit übergreifenden Empfehlungen
   zu Ton, Reihenfolge und Dopplungen.

Nicht geänderte Blöcke müssen nicht erneut ausgegeben werden. Jede Änderung
referenziert die unveränderte Block-ID aus copy-blocks.json.
`;

const revisionTemplate = {
  schema_version: "1.0.0",
  publisher: "Institut für Wirkungsökonomie",
  revisions: [{
    block_id: "route-001",
    proposed_text: "…",
    change_type: "REWRITE | SHORTEN | CLARIFY | REMOVE_DUPLICATION",
    rationale: "…"
  }]
};

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isRelevantAttribute(node) {
  return ts.isJsxAttribute(node.parent)
    && ["aria-label", "title", "placeholder", "alt"].includes(node.parent.name.text);
}

function looksLikeCopy(value, node) {
  const text = normalize(value);
  if (text.length < 2 || text.length > 2_400) return false;
  if (ts.isJsxAttribute(node.parent) && !isRelevantAttribute(node)) return false;
  if (/^(?:@\/|\.\/|\.\.\/|\/|https?:|mailto:|[a-z0-9-]+$)/i.test(text)) return isRelevantAttribute(node);
  if (/^[a-z][a-z0-9-]*(?:\s+[a-z][a-z0-9-]*)+$/.test(text)) return false;
  if (/^[A-Z0-9_]+$/.test(text)) return false;
  if (/^(?:className|href|id|key|role|type|method|status)$/i.test(text)) return false;
  if (!/[A-Za-zÄÖÜäöüß]/.test(text)) return false;
  if (/^(?:nodejs|force-dynamic|de-DE|Europe\/Berlin|_blank|noopener)$/i.test(text)) return false;
  return /[\s.,:;!?„““”–—]|[A-ZÄÖÜ]/.test(text) || isRelevantAttribute(node);
}

function extractBlocks(sourceText, filename, route) {
  const source = ts.createSourceFile(filename, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const blocks = [];
  const add = (node, raw) => {
    const text = normalize(raw);
    if (!looksLikeCopy(text, node)) return;
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    blocks.push({ route, source: filename, line, current: text });
  };
  const visit = (node) => {
    if (ts.isJsxText(node)) add(node, node.getText(source));
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) add(node, node.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return blocks;
}

async function main() {
  const stage = await mkdtemp(path.join(os.tmpdir(), `${packageId}-`));
  try {
    const blocks = [];
    for (const source of copySources) {
      const raw = await readFile(source.file, "utf8");
      blocks.push(...extractBlocks(raw, source.file, source.route));
    }
    const numbered = blocks.map((block, index) => ({ id: `copy-${String(index + 1).padStart(4, "0")}`, ...block }));
    const grouped = new Map();
    for (const block of numbered) {
      const group = grouped.get(block.route) ?? [];
      group.push(block);
      grouped.set(block.route, group);
    }
    const copyMarkdown = [
      "# Aktueller Portaltext",
      "",
      "Dieses Inventar enthält ausschließlich statische Interface-, Vertrauens- und Erklärungstexte der nächsten Portalversion. Konkrete Fallinhalte, Personendaten und dynamisch aus Datenbeständen geladene Texte sind nicht enthalten.",
      "",
      ...[...grouped.entries()].flatMap(([route, group]) => [
        `## ${route}`,
        "",
        ...group.map((block) => `- **${block.id}** · ${block.current}`),
        ""
      ])
    ].join("\n");
    const inventory = {
      package_id: packageId,
      publisher: "Institut für Wirkungsökonomie",
      scope: "Statische öffentliche Portaltexte ohne Fallinhalte",
      block_count: numbered.length,
      blocks: numbered
    };
    await writeFile(path.join(stage, "BRIEFING.md"), briefing, "utf8");
    await writeFile(path.join(stage, "CURRENT_PORTAL_COPY.md"), copyMarkdown, "utf8");
    await writeFile(path.join(stage, "copy-blocks.json"), `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
    await writeFile(path.join(stage, "copy-revision.template.json"), `${JSON.stringify(revisionTemplate, null, 2)}\n`, "utf8");
    await writeFile(path.join(stage, "README.md"), "# Textredaktion Wirkungsportal Parlament\n\nDieses Paket ist eine redaktionelle Arbeitsgrundlage. Es enthält keine Entscheidungsakten und keine zu veröffentlichenden Fachanalysen.\n", "utf8");
    execFileSync("zip", ["-q", "-r", output, "."], { cwd: stage });
    execFileSync("unzip", ["-t", output], { stdio: "ignore" });
    console.log(JSON.stringify({ package: output, copy_blocks: numbered.length }, null, 2));
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not export portal copy review package.");
  process.exit(1);
});

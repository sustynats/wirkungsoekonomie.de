import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildSourcePages } from "../../scripts/news/source-pages.mjs";

const read = (file) => fs.readFileSync(file, "utf8");
const pages = ["wirkungsticker/index.html", "wirkungsticker/quellen/index.html", "methodik/index.html", "so-wirkt-wirkungsoekonomie/index.html", "verstehen/index.html", "verstehen/woek-auf-einer-seite/index.html", "modell.html", "wirkungswissenschaften/index.html"];

test("Erklärungsebenen: unverändertes Ticker-Versprechen und kompakte Leselogik", () => {
  const html = read(pages[0]);
  for (const text of ["Wichtige Nachrichten. Fakten, Folgen, Zusammenhänge.", "Politik, Wirtschaft, Gesellschaft, Umwelt und Technik", "was belegt ist", "welche Folgen möglich sind", "wie über Ereignisse gesprochen wird", "So liest du den Ticker", "Wirkungsakte", "Lageakte", "WÖk-Analyse", "Relevanz, nicht gut oder schlecht.", "Festgestellte Zustandsveränderung", 'id="methodik"']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /WÖK-Analyse/);
  assert.ok(html.includes("Automatisch aktualisierte Nachrichten, quellengebunden geprüft"));
});

test("Erklärungsebenen: sechs Methodikfragen vor bestehender fachlicher Vertiefung", () => {
  const html = read("methodik/index.html");
  for (const text of ["Vorwirkung", "Wirkung ermitteln", "Evidenz &amp; Zurechnung", "Bewertung", "Schutz &amp; Systemprüfung", "Rückkopplung &amp; Lernen", "Fachlich vertieft", "staatliche-nachhaltigkeitsarchitektur", "materialitaet-statt-rechtsform"]) assert.ok(html.includes(text), text);
  assert.ok(html.indexOf("Sechs Fragen") < html.indexOf("Fachlich vertieft"));
  assert.doesNotMatch(html, /Wirkung neutral bestimmen/);
});

test("Erklärungsebenen: optionale IOOI-Methode, offene Evidenz und versioniertes Methodensystem", () => {
  const intro = read("so-wirkt-wirkungsoekonomie/index.html");
  assert.ok(intro.includes("IOOI steht für Input, Output, Outcome und Impact"));
  assert.ok(intro.includes("Sechs Fragen"));
  assert.ok(intro.includes("ambivalent"));
  assert.ok(intro.includes("bleibt die Einordnung offen"));
  assert.doesNotMatch(intro, /Die WÖk ergänzt Evidenz|Input, Aktivität, Output/);
  const portal = read("verstehen/index.html");
  assert.equal(portal.split("Der Apfel ist nicht nur ein Apfel.").length - 1, 1);
  assert.ok(portal.includes("keine offizielle UN-Kategorie"));
  assert.ok(portal.includes("Methodensystem &amp; Canvas"));
  assert.doesNotMatch(portal, /152 Methoden|56 Canvas|20 Workshop-Journeys|Input, Aktivität, Output/);
});

test("Erklärungsebenen: Daten, Schutzprinzip und vorgeschlagene Institutionen", () => {
  const model = read("modell.html");
  for (const text of ["kein Wirkungsnachweis", "dokumentiertes Netto-Wirkungsprofil", "Nichtkompensation ist das Schutzprinzip", "Nicht jedes schwache Detailfeld blockiert automatisch", "Vorgeschlagene Zielarchitektur", "kein derzeit geltendes Steuer- oder Institutionensystem"]) assert.ok(model.includes(text), text);
  assert.doesNotMatch(model, /Das schlechteste Wirkungsfeld zählt|unter dem Strich Nutzen oder Schaden|übersetzt vorhandene Daten in Wirkung/);
  const overview = read("verstehen/woek-auf-einer-seite/index.html");
  assert.ok(overview.includes("ambivalent"));
  assert.ok(overview.includes("keine automatische Steuerentscheidung"));
  const science = read("wirkungswissenschaften/index.html");
  assert.ok(science.includes("vorgeschlagener inter- und transdisziplinärer Bezugsrahmen"));
  assert.ok(science.includes("Der WÖk-eigene Beitrag"));
  assert.doesNotMatch(science, /Die erste Steuerungsdisziplin|Neu ist jedoch der systemische Rahmen/);
});

test("Quellenstatus: deutsche öffentliche Labels und sicherer Fallback bei unbekanntem Code", () => {
  for (const [status, label] of [["restricted", "Eingeschränkt nutzbar"], ["public", "Öffentlich zugänglich"], ["future_internal_status", "Status noch nicht geklärt"]]) {
    const output = new Map();
    buildSourcePages({ updated_at: "2026-09-05T12:00:00Z", sources: [{ source_id: "fixture", name: "Beispielquelle", url: "https://example.org", role: "C", enabled: false, access: { status } }] }, {}, {
      pageShell: ({ body }) => body, write: (file, body) => output.set(file, body), escapeHtml: (text) => String(text), root: "/virtual", site: "https://example.org", formatDate: String,
    });
    const html = output.get("/virtual/wirkungsticker/quellen/index.html");
    assert.ok(html.includes(label), label);
    assert.ok(html.includes("Breit recherchiert, Quellen klar eingeordnet."));
    assert.ok(html.includes("Agentur-/Provenienzhinweis"));
    assert.ok(!html.includes(`>${status}<`));
  }
});

test("Erklärungsebenen: eindeutige IDs, JSON-LD und erreichbare neue Lesepfade", () => {
  for (const file of pages) {
    const html = read(file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size, `Doppelte IDs: ${file}`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.doesNotThrow(() => JSON.parse(match[1]), file);
  }
  const root = "wirkungsticker/analyse";
  for (const dir of fs.readdirSync(root)) {
    const file = path.join(root, dir, "index.html");
    if (!fs.existsSync(file)) continue;
    const html = read(file);
    if (!html.includes('data-news-reader="analysis"')) continue;
    for (const href of ["../../../so-wirkt-wirkungsoekonomie/", "../../../methodik/", "../../#methodik"]) {
      assert.ok(html.includes(`href="${href}"`), `${file}: ${href}`);
      const target = path.resolve(path.dirname(file), href.split("#")[0], "index.html");
      assert.ok(fs.existsSync(target), target);
      if (href.includes("#")) assert.ok(read(target).includes('id="methodik"'));
    }
    assert.ok(html.includes('aria-label="Relevanz für Mensch:'));
  }
});

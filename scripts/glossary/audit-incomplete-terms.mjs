import fs from "node:fs";
import path from "node:path";

const today = new Date().toISOString().slice(0, 10);
const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8"));
const terms = glossary.terms || [];
const termSlugs = new Set(terms.map((term) => term.slug));
const detailDirs = fs.readdirSync("begriffe", { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join("begriffe", entry.name, "index.html")))
  .map((entry) => entry.name)
  .sort(new Intl.Collator("de", { sensitivity: "base" }).compare);
const legacyOnly = detailDirs.filter((slug) => !termSlugs.has(slug));

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function relationCount(term) {
  return [
    "relatedMethods",
    "relatedTools",
    "relatedDocuments",
    "relatedDemos",
    "relatedImpactFields",
    "relatedAcademyModules",
    "relatedDataRegisters",
  ].reduce((total, key) => total + asList(term[key]).length, 0);
}

function isShallow(term) {
  const shortDefinition = String(term.shortDefinition || "").trim();
  const longDefinition = String(term.longDefinition || term.definition || "").trim();
  return Boolean(shortDefinition)
    && shortDefinition === longDefinition
    && relationCount(term) === 0
    && !term.mythos
    && !(term.woekKlaerung || term.woek_klaerung)
    && !(term.blindSpot || term.blind_spot)
    && !asList(term.examples).length;
}

const shallowTerms = terms.filter(isShallow);
const emptyCrosslinks = terms.filter((term) => relationCount(term) === 0);
const pigou = terms.find((term) => term.slug === "pigou-steuer");
const pigouChecks = {
  detailRoute: fs.existsSync("begriffe/pigou-steuer/index.html"),
  hasLongDefinition: Boolean(pigou?.longDefinition && pigou.longDefinition !== pigou.shortDefinition),
  hasMethods: asList(pigou?.relatedMethods).length > 0,
  hasDocuments: asList(pigou?.relatedDocuments).length > 0,
  hasDemos: asList(pigou?.relatedDemos).length > 0,
  hasDataRegister: asList(pigou?.relatedDataRegisters).includes("woek-id-register"),
};

const topShallow = shallowTerms.slice(0, 80).map((term) => (
  `| ${term.slug} | ${term.canonicalLabel || term.label || term.slug} | ${term.category || "ohne Kategorie"} |`
)).join("\n");

const doc = `# Catch-up-Audit: unvollständige Glossar- und Content-Umsetzungen

Stand: ${today}

Dieses Audit schützt gegen stillen Wissensverlust. Es unterscheidet zwischen verlorenen Routen, erhaltenen Bestandsseiten, source-backed Glossarbegriffen und fachlich noch flachen Einträgen. Flache Einträge werden nicht als fertig behauptet.

## Aktueller Schutzstand

| Bereich | Anzahl / Status |
| --- | ---: |
| Begriffsdetailseiten unter \`/begriffe/*/\` | ${detailDirs.length} |
| Source-backed Glossarbegriffe im Register | ${terms.length} |
| Erhaltene Detailseiten, die zusätzlich im Hub indexiert werden | ${legacyOnly.length} |
| Source-backed Begriffe ohne zusätzliche Methoden-/Dokument-/Demo-/Feld-Gruppen außerhalb verwandter Begriffe | ${emptyCrosslinks.length} |
| Source-backed Begriffe mit kurzer Definition = Langdefinition und ohne weitere Vertiefung | ${shallowTerms.length} |

## Sofort nachgezogen

- \`/begriffe/pigou-steuer/\` wurde vertieft: Definition, WÖk-Abgrenzung, Mythos/Klärung, Quellen, verwandte Begriffe, Methoden, Demos, Dokumente, Wirkungsfelder, Akademie und WÖk-ID-Register.
- Der Glossar-Hub indexiert wieder alle vorhandenen ${detailDirs.length} Begriffsdetailseiten. Die ${legacyOnly.length} Bestandsseiten werden nicht überschrieben, sondern als erhaltene Detailseiten eingebunden.
- Der Glossar-Generator rendert vorhandene Crosslink-Felder für Methoden, Werkzeuge, Demos, Wirkungsfelder, Dokumente, Akademie und Datenregister sichtbar auf Detailseiten.
- Das Relationship-Manifest enthält diese Crosslink-Felder nun ebenfalls und verliert sie nicht mehr beim Build.

## Pigou-Steuer-Prüfung

| Check | Status |
| --- | --- |
| Detailroute existiert | ${pigouChecks.detailRoute ? "ok" : "fehlt"} |
| Langdefinition ist vertieft | ${pigouChecks.hasLongDefinition ? "ok" : "fehlt"} |
| Methoden verknüpft | ${pigouChecks.hasMethods ? "ok" : "fehlt"} |
| Dokumente verknüpft | ${pigouChecks.hasDocuments ? "ok" : "fehlt"} |
| Demos verknüpft | ${pigouChecks.hasDemos ? "ok" : "fehlt"} |
| WÖk-ID-Register verknüpft | ${pigouChecks.hasDataRegister ? "ok" : "fehlt"} |

## Weiterer fachlicher Nachholbedarf

Die folgenden Einträge sind source-backed, aber noch fachlich flach. Sie bleiben erreichbar; sie müssen in weiteren Content-Catch-up-Runden vertieft werden, statt automatisch als fertig zu gelten.

| Slug | Begriff | Kategorie |
| --- | --- | --- |
${topShallow || "| - | Keine flachen Einträge gefunden | - |"}

## Regel für die nächsten Nachholrunden

1. Keine Detailseite löschen oder durch Hub-Eintrag ersetzen.
2. Shallow-Begriffe zuerst in ihrer Quelle vertiefen, dann Generator laufen lassen.
3. Nach jeder Runde: Glossar-Hub zählen, Detailrouten zählen, Crosslinks prüfen, Build ausführen.
4. Begriffe ohne fachliche Vertiefung bleiben sichtbar, aber werden nicht als fertig ausgegeben.
`;

fs.writeFileSync("docs/incomplete-implementation-catchup.md", doc);
console.log(`Wrote docs/incomplete-implementation-catchup.md with ${detailDirs.length} detail routes and ${shallowTerms.length} shallow terms.`);

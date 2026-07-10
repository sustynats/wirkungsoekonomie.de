import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://wirkungsoekonomie.de";
const generatedAt = new Date().toISOString();

const endpointDefinitions = [
  {
    id: "core-index",
    url: "/api/v1/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "Versionierter Einstieg in die statischen WÖk-Kern-Endpunkte.",
  },
  {
    id: "capabilities",
    url: "/api/v1/capabilities/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "Maschinenlesbarer Überblick über Datenbereiche, Grenzen und Nutzungsregeln.",
  },
  {
    id: "glossary",
    url: "/api/v1/glossary/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "Glossar-Snapshot aus dem versionierten Wissenskern.",
  },
  {
    id: "methods",
    url: "/api/v1/methods/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "Schlanker WÖMS-Snapshot der 84 kanonischen Kernmethoden.",
  },
  {
    id: "canvases",
    url: "/api/v1/canvases/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "Feldgenaue WÖMS-Canvas-Spezifikationen und verbindlicher Mindeststandard.",
  },
  {
    id: "search",
    url: "/api/v1/search/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal"],
    description: "Suchindex-Metadaten und Verweise auf die produktive statische Suche.",
  },
  {
    id: "sdg-plus",
    url: "/api/v1/sdg-plus/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "SDG/SDG+-Referenzrahmen als maschinenlesbarer Snapshot.",
  },
  {
    id: "wirkungsradar",
    url: "/api/v1/wirkungsradar/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal", "partners"],
    description: "Wirkungsradar-Karten, Resonanzkarten und bestehende Embed-/Distribution-Endpunkte.",
  },
  {
    id: "production",
    url: "/api/v1/production/",
    method: "GET",
    lifecycle: "stable",
    audience: ["internal"],
    description: "Produktionsprozess-, Build-, Gate- und Workflow-Manifest.",
  },
];

const corePrinciples = [
  "Ein modularer WÖk-Kern stellt Daten und Funktionen bereit; Frontends bleiben dünne Oberflächen.",
  "GitHub bleibt der versionierte Wissenskern für öffentliche, read-only Inhalte.",
  "Supabase wird für Auth, personenbezogene, schreibende und transaktionale Daten genutzt.",
  "Statische Endpunkte sind read-only, cachebar und reproduzierbar.",
  "Wirkung, Wirkungspotenzial, Wirkungsrisiko und positive Netto-Wirkung werden nicht vermischt.",
  "Keine Personenbewertung, keine moralische Rangliste und keine Social-Credit-Logik.",
];

const sharedCoreFunctions = [
  {
    id: "mein-wirkungsraum",
    label: "Mein Wirkungsraum",
    canonicalOwner: "Supabase + WÖk-Kern-API",
    dataClass: "personal-write",
    consumers: ["Website", "Akademie", "Institut", "App"],
    rule: "Personalisierte Daten liegen nicht in statischen Website-Dateien, sondern im Datenkern mit Auth/RLS.",
  },
  {
    id: "woek-ki",
    label: "WÖk-KI",
    canonicalOwner: "WÖk-Kern-API",
    dataClass: "dynamic-logic",
    consumers: ["Website", "Akademie", "Institut", "App"],
    rule: "Retrieval, Prompt-Verträge und LLM-Aufrufe werden nicht pro Frontend dupliziert.",
  },
  {
    id: "wirkungscheck-narrative",
    label: "Wirkungscheck und Narrative",
    canonicalOwner: "WÖk-Kern-API + Wirkungsradar-Daten",
    dataClass: "public-read-with-dynamic-evaluation",
    consumers: ["Website", "Akademie", "Institut", "Redaktion", "Community-Workflows"],
    rule: "Narrative werden als Wirkungspotenzial, Resonanzraum und Wirkpfad behandelt; Reichweite ist keine Wirkung.",
  },
  {
    id: "glossary",
    label: "Glossar",
    canonicalOwner: "GitHub-Wissenskern",
    dataClass: "public-read",
    consumers: ["Website", "Akademie", "Institut", "App", "KI-Retrieval", "Suche"],
    rule: "Begriffe, Aliaslisten und Definitionen werden aus einer Quelle generiert.",
  },
  {
    id: "bibliothek",
    label: "Bibliothek",
    canonicalOwner: "GitHub-Wissenskern",
    dataClass: "public-read",
    consumers: ["Website", "Akademie", "Institut", "App", "KI-Retrieval", "Suche"],
    rule: "Bibliotheksmetadaten und Veröffentlichungen werden versioniert, nicht in Frontends nachgebaut.",
  },
  {
    id: "search",
    label: "Suche",
    canonicalOwner: "GitHub-Wissenskern + WÖk-Kern-API",
    dataClass: "public-read",
    consumers: ["Website", "Akademie", "Institut", "App", "KI-Retrieval"],
    rule: "Indexaufbau ist zentral; Frontends dürfen höchstens Darstellung, Filter und Proxy enthalten.",
  },
  {
    id: "woek-id-register",
    label: "WÖk-ID-Register",
    canonicalOwner: "GitHub-Wissenskern",
    dataClass: "public-read",
    consumers: ["Website", "Akademie", "Institut", "App", "Zertifikate", "KI-Retrieval"],
    rule: "Stabile IDs sind Verträge; Umbenennungen brauchen Redirects und Aliasführung.",
  },
];

const dataPlacementRules = [
  {
    class: "public-read",
    canonicalPlace: "GitHub repository, generated static JSON, pages and feeds",
    examples: ["Glossar", "Bibliothek", "Suchindex", "SDG+-Referenz", "Wirkungsradar-Karten"],
    antiPattern: "dieselben Daten in mehreren Frontend-Repos manuell pflegen",
  },
  {
    class: "personal-write",
    canonicalPlace: "Supabase with Auth, RLS and API mediation",
    examples: ["Mein Wirkungsraum", "Profile", "Saved Items", "Notizen", "Fortschritt"],
    antiPattern: "personenbezogene Daten in statische Assets oder öffentliche JSON-Dateien schreiben",
  },
  {
    class: "dynamic-logic",
    canonicalPlace: "WÖk-Kern-API behind stable base URL",
    examples: ["KI", "Wirkungscheck", "KWI", "serverseitige Retrieval- und Bewertungslogik"],
    antiPattern: "fachliche Logik in Website, Akademie und Institut getrennt implementieren",
  },
  {
    class: "large-media",
    canonicalPlace: "release/object storage with referenced metadata",
    examples: ["Podcast-Audio", "Videos", "große PDFs"],
    antiPattern: "große Medien direkt ins Repo oder ins Deploy-Artefakt kopieren",
  },
];

const contaminationControls = [
  {
    id: "single-source",
    risk: "Daten werden in mehreren Oberflächen auseinanderentwickelt.",
    control: "Jedes Datenprodukt hat einen canonicalOwner und einen canonicalPlace.",
    gate: "production-workflow-manifest.dataProducts",
  },
  {
    id: "no-frontend-logic-duplication",
    risk: "Website, Akademie und Institut implementieren dieselbe Fachlogik getrennt.",
    control: "Fachlogik wird als sharedCoreFunction markiert und über Kern-API oder generierte Daten konsumiert.",
    gate: "architecture review before new frontend features",
  },
  {
    id: "artifact-drift",
    risk: "Generierte HTML-, JSON- oder _site-Artefakte driften von Quellen weg.",
    control: "Build-Skripte erzeugen Manifeste reproduzierbar; deployt wird das Artefakt aus CI.",
    gate: "npm run build:artifact + npm run check:size",
  },
  {
    id: "parallel-agent-overwrite",
    risk: "Claude/Codex/Hintergrundprozesse schreiben gleichzeitig in dieselben Bereiche.",
    control: "Arbeitsbereiche werden über Owner, Datenklasse und eng gefasste Build-Schritte getrennt.",
    gate: "git status before edits; no unrelated reverts; generated manifests expose changed surfaces",
  },
  {
    id: "public-private-mixing",
    risk: "Personalisierte oder transaktionale Daten landen in öffentlichen statischen Dateien.",
    control: "Datenklassen erzwingen GitHub für public-read, Supabase für personal-write.",
    gate: "dataPlacementRules",
  },
  {
    id: "language-and-concept-drift",
    risk: "Wirkung, Wirkungspotenzial, Risiko, Reporting und Reichweite werden vermischt.",
    control: "Capabilities und Kernprinzipien codieren die begrifflichen Grenzen.",
    gate: "npm run lint + content review",
  },
];

function readJson(relativePath, fallback = null) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ensureDirFor(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeJson(relativePath, data) {
  ensureDirFor(relativePath);
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function writeEndpoint(directory, data) {
  const jsonPath = `${directory.replace(/\/$/, "")}/index.json`;
  const htmlPath = `${directory.replace(/\/$/, "")}/index.html`;
  writeJson(jsonPath, data);
  writeJson(`${directory.replace(/\/$/, "")}.json`, data);
  ensureDirFor(htmlPath);
  fs.writeFileSync(
    path.join(root, htmlPath),
    `<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>WÖk API · ${htmlEscape(data.title ?? data.registryId ?? "Daten")}</title>\n</head>\n<body>\n<pre>${htmlEscape(JSON.stringify(data, null, 2))}</pre>\n</body>\n</html>\n`,
  );
}

function absoluteUrl(route) {
  return new URL(route, site).href;
}

function firstItems(items, limit, mapper) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, limit).map(mapper);
}

function classifyBuildCommand(command) {
  const value = command.toLowerCase();
  if (value.includes("glossary")) return "knowledge-glossary";
  if (value.includes("search")) return "knowledge-search";
  if (value.includes("wirkungsradar")) return "public-impact-room";
  if (value.includes("portal")) return "portal-generation";
  if (value.includes("podcast") || value.includes("feed")) return "media-feeds";
  if (value.includes("quality") || value.includes("check") || value.includes("audit")) return "quality-gate";
  if (value.includes("artifact") || value.includes("_site")) return "deploy-artifact";
  if (value.includes("academy") || value.includes("certificates")) return "academy-certificates";
  if (value.includes("import")) return "content-import";
  if (value.includes("site")) return "site-pages";
  return "build-step";
}

function scriptSteps(scriptValue = "") {
  return scriptValue
    .split(/\s+&&\s+/)
    .map((command, index) => ({
      order: index + 1,
      command,
      phase: classifyBuildCommand(command),
    }));
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
}

const packageJson = readJson("package.json", { scripts: {} });
const glossary = readJson("assets/data/glossary-lookup.json", { terms: [] });
const glossaryReference = readJson("assets/data/glossary-reference-index.json", { count: 0, letters: [] });
const searchIndex = readJson("assets/search/search-index.json", []);
const sdgReference = readJson("assets/data/sdg-reference.json", []);
const radarCards = readJson("api/wirkungsradar/cards/index.json", []);
const resonanceCards = readJson("assets/data/wirkungsradar-resonance-cards.json", []);
const navigation = readJson("assets/data/navigation.json", {});
const documentRegistry = readJson("assets/data/document-registry.json", {});
const toolRegistry = readJson("assets/data/tool-registry.json", []);
const woekIds = readJson("assets/data/woek-id-register.json", []);
const woemsMethods = readJson("public/data/woems-methoden.json", { methods: [], counts: {} });
const woemsCanvases = readJson("public/data/woems-canvas.json", { canvases: [], counts: {} });

const routeGroups = Object.entries(navigation)
  .filter(([, value]) => Array.isArray(value))
  .map(([id, items]) => ({
    id,
    count: items.length,
    entries: firstItems(items, 12, (item) => ({
      label: item.label,
      href: item.href,
    })),
  }));

const searchSections = uniqueSorted(searchIndex.map((entry) => entry.section));
const searchTypes = uniqueSorted(searchIndex.map((entry) => entry.type));
const searchFormats = uniqueSorted(searchIndex.map((entry) => entry.format));

const apiIndex = {
  id: "woek-core-static-api",
  name: "WÖk Core Static API",
  version: "v1",
  generatedAt,
  baseUrl: `${site}/api/v1/`,
  status: "read-only-static",
  contract: {
    format: "JSON",
    cacheable: true,
    canonicalSource: "Website-Repo build outputs",
    dynamicCoreBaseUrlEnv: "WOEK_KERN_API_URL",
  },
  endpoints: endpointDefinitions.map((endpoint) => ({
    ...endpoint,
    absoluteUrl: absoluteUrl(endpoint.url),
  })),
};

const capabilities = {
  generatedAt,
  version: "v1",
  principles: corePrinciples,
  sharedCoreFunctions,
  dataPlacementRules,
  contaminationControls,
  domains: [
    {
      id: "knowledge",
      label: "Wissenskern",
      sources: [
        "assets/data/glossary-lookup.json",
        "assets/search/search-index.json",
        "assets/data/woek-id-register.json",
        "public/data/woems-methoden.json",
        "public/data/woems-canvas.json",
      ],
      capabilities: ["Glossar", "Suche", "WÖk-ID-Register", "WÖMS-Methoden", "Canvas-Spezifikationen", "öffentliche Wissensnavigation"],
    },
    {
      id: "impact-reference",
      label: "Wirkungsreferenz",
      sources: ["assets/data/sdg-reference.json", "assets/data/wirkungsradar-resonance-cards.json"],
      capabilities: ["SDG/SDG+-Einordnung", "Wirkungsradar", "Debatten- und Resonanzlogik"],
    },
    {
      id: "production",
      label: "Produktion und Workflows",
      sources: ["package.json", "scripts/", ".github/workflows/deploy.yml"],
      capabilities: ["Build-Phasen", "Qualitätsgates", "Deployment-Artefakt", "Workflow-Inventar"],
    },
  ],
  boundaries: {
    allowed: [
      "read-only Zugriff auf veröffentlichte Inhalte",
      "interne Wiederverwendung in Website, Akademie, Institut und App",
      "partnerfähige Glossar-, SDG+- und Wirkungsradar-Snapshots nach Freigabe",
    ],
    notAllowed: [
      "Personenbewertung",
      "Social-Credit-Logik",
      "automatisierte moralische Ranglisten",
      "Vermischung von Reichweite, Reporting und tatsächlicher Wirkung",
    ],
  },
};

const glossaryEndpoint = {
  generatedAt,
  version: "v1",
  source: "assets/data/glossary-lookup.json",
  count: glossary.count || glossary.terms.length,
  referenceIndex: {
    source: "assets/data/glossary-reference-index.json",
    letters: glossaryReference.letters || [],
    count: glossaryReference.count || 0,
  },
  terms: (glossary.terms || []).map((term) => ({
    id: term.id,
    label: term.label,
    canonicalLabel: term.canonicalLabel,
    slug: term.slug,
    url: term.url,
    aliases: term.aliases || [],
    shortDefinition: term.shortDefinition || "",
    definition: term.definition || "",
  })),
};

const searchEndpoint = {
  generatedAt,
  version: "v1",
  source: "assets/search/search-index.json",
  publicIndexUrl: "/assets/search/search-index.json",
  count: searchIndex.length,
  sections: searchSections,
  types: searchTypes,
  formats: searchFormats,
  sample: firstItems(searchIndex, 20, (entry) => ({
    id: entry.id,
    title: entry.title,
    url: entry.url,
    section: entry.section,
    type: entry.type,
    format: entry.format,
    tags: entry.tags || [],
  })),
};

const methodsEndpoint = {
  generatedAt,
  version: "v1",
  canonicalSource: "content/methods/woems-methoden.json",
  publicExport: "public/data/woems-methoden.json",
  ...woemsMethods,
};

const canvasesEndpoint = {
  generatedAt,
  version: "v1",
  canonicalSource: "content/methods/woems-canvas.json",
  publicExport: "public/data/woems-canvas.json",
  ...woemsCanvases,
};

const sdgPlusEndpoint = {
  generatedAt,
  version: "v1",
  source: "assets/data/sdg-reference.json",
  count: sdgReference.length,
  referenceFrame: "SDGs, Agenda 2030 und SDG+ als Orientierungsrahmen für positive Netto-Wirkung.",
  items: sdgReference.map((item) => ({
    id: item.id,
    type: item.type,
    number: item.number,
    title: item.title,
    shortTitle: item.shortTitle,
    slug: item.slug,
    url: item.url,
    isOfficialUNGoal: Boolean(item.isOfficialUNGoal),
    woekMeaning: item.woekMeaning || "",
    relatedSdgs: item.relatedSdgs || [],
  })),
};

const wirkungsradarEndpoint = {
  generatedAt,
  version: "v1",
  cards: {
    source: "api/wirkungsradar/cards/index.json",
    count: radarCards.length,
    indexUrl: "/api/wirkungsradar/cards/index.json",
    items: radarCards.map((card) => ({
      slug: card.slug,
      claim: card.claim,
      shortJudgement: card.shortJudgement,
      betterQuestion: card.betterQuestion,
      status: card.status,
      dataStand: card.dataStand,
      url: card.url,
    })),
  },
  resonance: {
    source: "assets/data/wirkungsradar-resonance-cards.json",
    count: resonanceCards.length,
    items: resonanceCards.map((card) => ({
      slug: card.slug,
      title: card.title,
      subtitle: card.subtitle,
      cluster: card.cluster,
      attention: card.attention,
      impact: card.impact,
      relation: card.relation,
    })),
  },
  existingStaticEndpoints: [
    "/api/wirkungsradar/cards/",
    "/api/wirkungsradar/embed/{slug}.json",
    "/api/wirkungsradar/distribution/{slug}.json",
  ],
};

const buildSteps = scriptSteps(packageJson.scripts?.build || "");
const workflowManifest = {
  generatedAt,
  version: "v1",
  operatingModel: {
    architecture: "modularer Kern, statisch-first Website, dünne Frontends",
    canonicalBuildCommand: "npm run build",
    deployArtifactCommand: "npm run build:artifact",
    deployTarget: "GitHub Pages",
    deployWorkflow: ".github/workflows/deploy.yml",
  },
  sharedCoreFunctions,
  dataPlacementRules,
  contaminationControls,
  build: {
    totalSteps: buildSteps.length,
    phases: uniqueSorted(buildSteps.map((step) => step.phase)),
    steps: buildSteps,
  },
  scripts: Object.entries(packageJson.scripts || {}).map(([name, command]) => ({
    name,
    command,
    stepCount: scriptSteps(command).length,
    phases: uniqueSorted(scriptSteps(command).map((step) => step.phase)),
  })),
  dataProducts: [
    {
      id: "glossary",
      path: "assets/data/glossary-lookup.json",
      count: glossary.count || glossary.terms.length,
      owner: "Wissenskern",
    },
    {
      id: "search-index",
      path: "assets/search/search-index.json",
      count: searchIndex.length,
      owner: "Wissenskern",
    },
    {
      id: "woems-methods",
      path: "content/methods/woems-methoden.json",
      count: woemsMethods.methods?.length || 0,
      owner: "Wissenskern",
    },
    {
      id: "woems-canvases",
      path: "content/methods/woems-canvas.json",
      count: woemsCanvases.canvases?.length || 0,
      owner: "Wissenskern",
    },
    {
      id: "sdg-reference",
      path: "assets/data/sdg-reference.json",
      count: sdgReference.length,
      owner: "Wirkungsreferenz",
    },
    {
      id: "wirkungsradar-cards",
      path: "api/wirkungsradar/cards/index.json",
      count: radarCards.length,
      owner: "Öffentlicher Wirkungsraum",
    },
    {
      id: "documents",
      path: "assets/data/document-registry.json",
      count: Array.isArray(documentRegistry) ? documentRegistry.length : documentRegistry.count || documentRegistry.documents?.length || 0,
      owner: "Bibliothek",
    },
    {
      id: "tools",
      path: "assets/data/tool-registry.json",
      count: Array.isArray(toolRegistry) ? toolRegistry.length : toolRegistry.tools?.length || 0,
      owner: "Werkzeuge",
    },
    {
      id: "woek-ids",
      path: "assets/data/woek-id-register.json",
      count: Array.isArray(woekIds) ? woekIds.length : woekIds.count || woekIds.items?.length || 0,
      owner: "WÖk-ID-Register",
    },
  ],
  workflowGates: [
    {
      id: "language",
      command: "npm run lint",
      purpose: "Öffentliche Sprache prüfen.",
    },
    {
      id: "typecheck",
      command: "npm run typecheck",
      purpose: "JavaScript-/Modul-Syntax und Kernskripte prüfen.",
    },
    {
      id: "search",
      command: "npm run check:search",
      purpose: "Suchintegration prüfen.",
    },
    {
      id: "artifact",
      command: "npm run build:artifact",
      purpose: "Deploybares _site-Artefakt erzeugen.",
    },
    {
      id: "size",
      command: "npm run check:size",
      purpose: "Pages-Artefaktgröße kontrollieren.",
    },
  ],
  routeGroups,
};

const productionEndpoint = {
  generatedAt,
  version: "v1",
  summary: {
    totalBuildSteps: workflowManifest.build.totalSteps,
    dataProducts: workflowManifest.dataProducts.length,
    workflowGates: workflowManifest.workflowGates.length,
    scripts: workflowManifest.scripts.length,
  },
  ...workflowManifest,
};

writeEndpoint("api", {
  generatedAt,
  message: "Use /api/v1/ for the versioned WÖk Core Static API.",
  versions: [{ version: "v1", url: "/api/v1/" }],
});
writeEndpoint("api/v1", apiIndex);
writeEndpoint("api/v1/capabilities", capabilities);
writeEndpoint("api/v1/glossary", glossaryEndpoint);
writeEndpoint("api/v1/methods", methodsEndpoint);
writeEndpoint("api/v1/canvases", canvasesEndpoint);
writeEndpoint("api/v1/search", searchEndpoint);
writeEndpoint("api/v1/sdg-plus", sdgPlusEndpoint);
writeEndpoint("api/v1/wirkungsradar", wirkungsradarEndpoint);
writeEndpoint("api/v1/production", productionEndpoint);

writeJson("assets/data/woek-core-api-manifest.json", apiIndex);
writeJson("assets/data/production-workflow-manifest.json", workflowManifest);

console.log(`Wrote WÖk Core API manifest with ${endpointDefinitions.length} endpoints.`);
console.log(`Wrote production workflow manifest with ${buildSteps.length} canonical build steps.`);

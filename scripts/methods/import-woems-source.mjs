import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE = process.env.WOEMS_TEXT;
const PAGE_MAP_SOURCE = process.env.WOEMS_PAGE_MAP;
const METHOD_OUT = path.join(ROOT, "content/methods/woems-methoden.json");
const CANVAS_OUT = path.join(ROOT, "content/methods/woems-canvas.json");

if (!SOURCE || !fs.existsSync(SOURCE)) {
  throw new Error("WOEMS_TEXT muss auf den mit textutil extrahierten WÖMS-Quelltext zeigen.");
}
if (!PAGE_MAP_SOURCE || !fs.existsSync(PAGE_MAP_SOURCE)) {
  throw new Error("WOEMS_PAGE_MAP muss auf die aus dem gerenderten PDF extrahierte Methoden-Seitenkarte zeigen.");
}

const sourceText = fs.readFileSync(SOURCE, "utf8");
const normalizeText = (value) => String(value)
  .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
  .replace(/[\u2028\u2029]/g, "\n");
const raw = normalizeText(sourceText).replace(/\f/g, "\n");
const lines = raw.split(/\r?\n/).map((line) => line.trim());
const sourcePageMap = JSON.parse(fs.readFileSync(PAGE_MAP_SOURCE, "utf8"));

const categories = {
  A: "Orientierung, Mandat und Schutzrahmen",
  B: "Systemdiagnose und Wirkungszusammenhänge",
  C: "Wirkungsmodellierung und Zukunftslogik",
  D: "Messung, Bewertung und Evidenz",
  E: "Strategie, Portfolio und Governance",
  F: "Innovation, Angebote und Geschäftsmodelle",
  G: "Organisation, Führung und Kultur",
  H: "Umsetzung, Monitoring, Lernen und Assurance",
  I: "Strategische Vorausschau und Entscheidungsintelligenz",
  J: "Business Architecture, Capabilities und Zielarchitektur",
  K: "Wirkungswertströme, Prozesse, Services und Flow",
  L: "Product Operating Model, Teams, Plattformen und Ökosysteme",
  M: "Change, Adoption, Workforce, Skills und Wissen",
  N: "Portfolio, Programme, Delivery und Impact & Benefits Realization",
  O: "Daten, Technologie, KI und agentische Systeme",
  P: "Qualität, operative Resilienz, Kontrollen und integrierte Assurance"
};

const categorySizes = {
  A: 8, B: 12, C: 10, D: 12, E: 12, F: 14, G: 8, H: 8,
  I: 8, J: 8, K: 8, L: 8, M: 10, N: 8, O: 8, P: 10
};

const requiredCanvasFields = [
  "Evidenzstatus",
  "Unsicherheit",
  "negative Wirkung",
  "Wirkungsgrenzen",
  "offene Fragen"
];

const variantMethodMap = {
  "Unternehmens-Wirkungsarchitektur-Canvas": "G01",
  "Produktwirkungs-Canvas": "F10",
  "Lieferketten-Wirkungsnetz": "F11",
  "Geschäftsmodell-Transformations-Canvas": "E11",
  "Wirkungs-Investment-These": "E07",
  "Kredit-Wirkungsprüfung": "E07",
  "Versicherbarkeits- und Resilienz-Canvas": "B12",
  "Portfolio-Kapitalwirkungs-Canvas": "E04",
  "Politik-Wirkungs-Canvas": "E10",
  "Gesetzes-Wirkungsfolgenabschätzung": "D12",
  "Wirkungshaushalts-Canvas": "E06",
  "Kommunale Wirkungssystemkarte": "B04",
  "Sozialraum-Wirkungs-Canvas": "B01",
  "Kohäsions- und Vertrauenslandkarte": "B06",
  "Inklusions- und Zugangs-Canvas": "A04",
  "Gesellschaftliche Resilienzkarte": "B12",
  "Medienwirkungs-Canvas": "C02",
  "Narrativ-Wirkungspfad": "C01",
  "Algorithmische Plattform-Wirkungsprüfung": "F12",
  "Community- und Host-Wirkungs-Canvas": "G04",
  "Forschungswirkungs-Canvas": "D12",
  "Wissenschaftliche Integritäts-Canvas": "H08",
  "Bildungswirkungs-Canvas": "D12",
  "Wissensdiffusions-Canvas": "F14",
  "Persönliche Wirkungslandkarte": "B01",
  "Lebensentscheidungs-Wirkungscheck": "A07",
  "Selbstwirksamkeits-Canvas": "G02",
  "Rollen- und Resonanzraum-Canvas": "G05",
  "Wirkungspartnerschafts-Mandat": "A01",
  "Ecosystem-Wirkungsmodell": "C03",
  "Geteilte Daten- und Evidenzarchitektur": "D05",
  "Konflikt-, Nutzen- und Lastenteilungs-Canvas": "G05",
  "Annahmen- und Unsicherheits-Canvas": "I01",
  "Horizon-Scanning-Radar": "I02",
  "Szenario- und Wirkungsstresstest-Canvas": "I05",
  "Adaptive-Pfade-Canvas": "I06",
  "Wirkungs-Capability-Canvas": "J01",
  "Capability-to-Impact-Heatmap": "J02",
  "Wirkungswertstrom-Canvas": "K01",
  "Target-Operating-Model-Canvas": "J07",
  "Wirkungs-Product-Operating-Model-Canvas": "L01",
  "Wirkungs-Teamtopologie-Canvas": "L04",
  "Plattform-als-Wirkungsinfrastruktur-Canvas": "L06",
  "Produktfinanzierungs-Canvas": "L07",
  "Change-Impact-Canvas": "M02",
  "Sponsor- und Change-Netzwerk-Canvas": "M05",
  "Adoptions- und Verhaltens-Canvas": "M08",
  "Skills- und Wissensarchitektur-Canvas": "M09",
  "Wirkungstransformations-Portfolio": "N01",
  "Programm- und Abhängigkeits-Canvas": "N02",
  "Impact-and-Benefits-Realization-Canvas": "N06",
  "Handover-in-den-Regelbetrieb-Canvas": "N07",
  "Wirkungsdaten- und Lineage-Canvas": "O02",
  "KI-/Agenten-Wirkungsgovernance-Canvas": "O05",
  "Kritische-Wirkungsservice- und BIA-Canvas": "P04",
  "Integrierte-Assurance-Canvas": "P09"
};

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextValue(segment, label) {
  const index = segment.indexOf(label);
  if (index < 0) return "";
  return segment.slice(index + 1).find(Boolean) || "";
}

function between(segment, startLabel, endLabels) {
  const start = segment.indexOf(startLabel);
  if (start < 0) return [];
  const tail = segment.slice(start + 1);
  const end = tail.findIndex((line) => endLabels.includes(line));
  return (end < 0 ? tail : tail.slice(0, end)).filter(Boolean);
}

function stripListMarker(value) {
  return value.replace(/^[•\-]\s*/, "").replace(/^\d+\.\s*/, "").trim();
}

function splitItems(value) {
  return String(value)
    .split(/\s*[·;,]\s*/)
    .map(stripListMarker)
    .filter(Boolean);
}

function expandRange(start, end) {
  const prefix = start[0];
  if (prefix !== end[0]) return [start, end];
  const a = Number(start.slice(1));
  const b = Number(end.slice(1));
  const values = [];
  for (let value = Math.min(a, b); value <= Math.max(a, b); value += 1) {
    values.push(`${prefix}${String(value).padStart(2, "0")}`);
  }
  return values;
}

function expandMethodRefs(value) {
  const normalized = String(value).replace(/[–—]/g, "-");
  const ids = [];
  for (const match of normalized.matchAll(/\b([A-P])\/([A-P])\b/g)) {
    for (const category of [match[1], match[2]]) {
      ids.push(...expandRange(`${category}01`, `${category}${String(categorySizes[category]).padStart(2, "0")}`));
    }
  }
  for (const match of normalized.matchAll(/\b([A-P])\s*-\s*([A-P])\b/g)) {
    const start = match[1].charCodeAt(0);
    const end = match[2].charCodeAt(0);
    for (let code = Math.min(start, end); code <= Math.max(start, end); code += 1) {
      const category = String.fromCharCode(code);
      ids.push(...expandRange(`${category}01`, `${category}${String(categorySizes[category]).padStart(2, "0")}`));
    }
  }
  for (const match of normalized.matchAll(/([A-P]\d{2})\s*-\s*([A-P]\d{2})|([A-P]\d{2})/g)) {
    if (match[1] && match[2]) ids.push(...expandRange(match[1], match[2]));
    else if (match[3]) ids.push(match[3]);
  }
  return [...new Set(ids)];
}

function parseInterfaces(value) {
  const predecessor = String(value).match(/Vorgänger:\s*([^.]*)/i)?.[1] || "";
  const successor = String(value).match(/Nachfolger:\s*([^.]*)/i)?.[1] || "";
  return {
    bautAuf: expandMethodRefs(predecessor),
    fuehrtZu: expandMethodRefs(successor)
  };
}

function canvasFields(canvasSpec, steps) {
  const colon = canvasSpec.indexOf(":");
  if (colon >= 0) {
    const candidate = canvasSpec
      .slice(colon + 1)
      .split(/\.\s/)[0]
      .split(/\s*[,;·]\s*/)
      .map((item) => item.replace(/^(und|sowie)\s+/i, "").replace(/[.]$/, "").trim())
      .filter((item) => item.length > 1 && item.length < 90);
    if (candidate.length >= 3) {
      return candidate.map((label) => ({
        key: slug(label),
        label,
        leitfrage: `Was ist zu „${label}“ im konkreten Fall festzuhalten?`
      }));
    }
  }
  return steps.map((step, index) => {
    const label = stripListMarker(step).replace(/[.?]$/, "");
    return {
      key: slug(label).slice(0, 72) || `feld-${index + 1}`,
      label,
      leitfrage: `Wie wird „${label}“ für den konkreten Fall nachvollziehbar bearbeitet?`
    };
  });
}

const methodStarts = [];
const methodSectionEnd = lines.findLastIndex((line) => line.startsWith("Teil V – Vierzehn Anwendungs- und Realisierungsmodule"));
for (let index = 0; index < methodSectionEnd; index += 1) {
  const match = lines[index].match(/^([A-P]\d{2}) · ([^\t]+)$/);
  if (match && !/Fortsetzung/.test(match[2])) methodStarts.push({ index, id: match[1], name: match[2] });
}

const uniqueStarts = methodStarts.filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
if (uniqueStarts.length !== 152) throw new Error(`152 Kernmethoden erwartet, ${uniqueStarts.length} gefunden.`);

const methods = uniqueStarts.map((start, index) => {
  const end = uniqueStarts[index + 1]?.index ?? lines.findIndex((line, lineIndex) => lineIndex > start.index && line.startsWith("Teil V"));
  const segment = lines.slice(start.index, end > start.index ? end : undefined);
  const versionIndex = segment.findIndex((line) => /^Version \d+\.\d+/.test(line));
  const purpose = versionIndex >= 0 ? segment.slice(versionIndex + 1).find(Boolean) || "" : "";
  const output = nextValue(segment, "Verbindlicher Output");
  const inputs = splitItems(nextValue(segment, "Benötigte Inputs"));
  const interfaceText = nextValue(segment, "Schnittstellen");
  const steps = between(segment, "Vorgehen", ["Leitfragen"])
    .filter((line) => /^\d+\.\s/.test(line))
    .map(stripListMarker);
  const quality = between(segment, "Qualitätskriterien", ["Typische Fehlanwendungen und Schutzmaßnahmen"])
    .map(stripListMarker);
  const protection = between(segment, "Typische Fehlanwendungen und Schutzmaßnahmen", ["Varianten", "Quellen- und Herkunftslinie"])
    .map(stripListMarker);
  const canvasSpec = nextValue(segment, "Visualisierungs- und Canvas-Spezifikation");
  const canvasId = `canvas-${start.id}`;
  return {
    id: start.id,
    kategorie: start.id[0],
    kategorieName: categories[start.id[0]],
    name: start.name,
    docxSeite: sourcePageMap[start.id] || null,
    zweck: purpose,
    inputs,
    schritte: steps,
    outputs: output ? [output] : [],
    qualitaetsregeln: quality,
    schutzregeln: protection,
    schnittstellen: parseInterfaces(interfaceText),
    canvasRef: canvasId,
    _canvasSpezifikation: canvasSpec
  };
});

const methodCanvases = methods.map((method) => ({
  id: method.canvasRef,
  methodId: method.id,
  name: method.name,
  felder: canvasFields(method._canvasSpezifikation, method.schritte),
  pflichtfelder: requiredCanvasFields
}));

const partStart = lines.findLastIndex((line) => line.startsWith("Teil V – Vierzehn Anwendungs- und Realisierungsmodule"));
const partEnd = lines.findIndex((line, index) => index > partStart && line.startsWith("Teil VI – Zwanzig"));
const variantLines = lines.slice(partStart, partEnd);
let domain = "";
let recommended = [];
const variantCanvases = [];
for (let index = 0; index < variantLines.length; index += 1) {
  const line = variantLines[index];
  if (/^(?:[1-9]|1[0-4])\.\s/.test(line)) {
    domain = line.replace(/^\d+\.\s*/, "");
    recommended = [];
    continue;
  }
  if (line.startsWith("Empfohlenes Kernmethodenset:")) {
    recommended = expandMethodRefs(line);
    continue;
  }
  const fieldsLine = variantLines[index + 1] || "";
  if (!fieldsLine.startsWith("Arbeitsfelder:")) continue;
  const methodId = variantMethodMap[line];
  if (!methodId) throw new Error(`Kein methodId-Mapping für Canvas-Variante „${line}“.`);
  const fields = fieldsLine
    .replace(/^Arbeitsfelder:\s*/, "")
    .split(/\s*·\s*/)
    .filter(Boolean)
    .map((label) => ({
      key: slug(label),
      label,
      leitfrage: `Was ist zu „${label}“ für diesen Wirkungsraum zu dokumentieren?`
    }));
  variantCanvases.push({
    id: `canvas-${slug(line)}`,
    methodId,
    name: line,
    felder: fields,
    pflichtfelder: requiredCanvasFields,
    relatedMethodIds: recommended,
    anwendungsmodul: domain
  });
}

if (variantCanvases.length !== 56) throw new Error(`56 Canvas-Varianten erwartet, ${variantCanvases.length} gefunden.`);

const sourceHash = crypto.createHash("sha256").update(sourceText).digest("hex");
const methodRegistry = {
  schemaVersion: "1.0.0",
  registryId: "woems-methoden-registry",
  title: "Wirkungsökonomisches Methodensystem (WÖMS) – Methoden-Registry",
  version: "2.0",
  stand: "2026-07-10",
  source: "Wirkungsoekonomisches_Methodensystem_WOEMS_2.0.docx",
  sourceSha256: sourceHash,
  counts: { categories: 16, methods: methods.length },
  kategorien: Object.entries(categories).map(([id, name]) => ({ id, name })),
  methods: methods.map(({ _canvasSpezifikation, ...method }) => method)
};

const canvasRegistry = {
  schemaVersion: "1.0.0",
  registryId: "woems-canvas-registry",
  title: "WÖMS Canvas-Spezifikationen",
  version: "2.0",
  stand: "2026-07-10",
  source: "Wirkungsoekonomisches_Methodensystem_WOEMS_2.0.docx",
  counts: { methodCanvases: methodCanvases.length, variants: variantCanvases.length, total: methodCanvases.length + variantCanvases.length },
  mindeststandard: {
    metadaten: ["canvasId", "methodId", "version", "datum", "fall", "verantwortlicheModeration"],
    pflichtfelder: requiredCanvasFields,
    semantik: {
      farbeNieAllein: true,
      zusaetzlicheCodierung: ["Text", "Symbol"],
      erlaubtePfeilbeziehungen: ["kausal", "zeitlich", "informationell", "finanziell", "organisatorisch"]
    },
    nichtkompensation: {
      harteRegel: true,
      regel: "Eine verletzte Wirkungsgrenze erzwingt Stop oder Redesign und darf nicht durch positive Werte verrechnet werden.",
      entscheidungBeiGrenzverletzung: "stop_or_redesign"
    }
  },
  canvases: [...methodCanvases, ...variantCanvases]
};

for (const file of [METHOD_OUT, CANVAS_OUT]) fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(METHOD_OUT, `${JSON.stringify(methodRegistry, null, 2)}\n`);
fs.writeFileSync(CANVAS_OUT, `${JSON.stringify(canvasRegistry, null, 2)}\n`);
console.log(`WÖMS importiert: ${methods.length} Methoden, ${methodCanvases.length} Methoden-Canvas, ${variantCanvases.length} Varianten.`);

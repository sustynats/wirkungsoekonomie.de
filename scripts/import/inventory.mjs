import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourceRoots = [
  path.join(root, "source-assets/originals"),
  path.join(root, "public/downloads/originals"),
  path.join(root, "assets/pdf"),
].concat(process.env.WOEK_SOURCE_ROOT ? [process.env.WOEK_SOURCE_ROOT] : []);

const expected = [
  "Natalie-Weber_Die neue Ordnung des Wohlstands.docx",
  "Natalie-Weber_Die neue Ordnung des Wohlstands_small.pdf",
  "Grundlagenpapier-Wirkungsökonomie WÖk.pdf",
  "Die neue Ordnung des Wohlstands_2.pdf",
  "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
  "WOeK_Master_Items_final_v1.2.xlsx",
  "WOeK_Master_Items_final_v1.2.pdf",
  "WStG_Oktober2025.pdf",
  "Technische_Leitlinien_WUStG_Vollversion_Extended_v2.pdf",
  "Beispiel_Apfel_Wirkungssteuer_Bonusregel.pdf",
  "Wirkungsrat_Konzept.pdf",
  "Whitepaper-T-SROI.pdf",
  "Wirkungsökonomie in der Lieferkette.pdf",
  "WP_Produkte.pdf",
  "WP_Rente.pdf",
  "WP_Einkommen.pdf",
  "WP_Wohnungsmarkt_.pdf",
  "Wenn Maschinen arbeiten.pdf",
  "Systemmodell-der-Wirkungsökonomie.pdf",
  "Nachhaltigkeit-Systemarchitektur.pdf",
  "Leitbild für Mensch Planet und Demokratie.pdf",
  "Whitepaper20.pdf",
  "Minifest_Wirkungsoekonomie.pdf",
  "WÖk-Manifest.pdf",
  "WÖK-Partei.pdf",
  "NATS_WÖk@allgemein.pdf",
  "Beispiel-Konzern.pdf",
  "FAZ-Beitrag.docx",
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("~$")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (![".git", "node_modules", ".cache"].includes(entry.name)) walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ö/g, "oe")
    .replace(/ä/g, "ae")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sha256(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

function publicPath(file) {
  const rel = path.relative(root, file);
  if (!rel.startsWith("..")) return rel;
  return path.basename(file);
}

function publicAssetName(value) {
  return String(value || "").replace(/\b(?:ChatGPT|OpenAI)-(?:Bild|Image)\s*/gi, "Bilddatei ");
}

const allFiles = sourceRoots.flatMap((dir) => walk(dir));
const inventory = allFiles
  .filter((file) => /\.(pdf|docx|docm|md|xlsx|png|jpe?g|pptx)$/i.test(file))
  .map((file) => {
    const stat = fs.statSync(file);
    return {
      name: publicAssetName(path.basename(file)),
      path: publicAssetName(publicPath(file)),
      sizeBytes: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      extension: path.extname(file).slice(1).toLowerCase(),
      sha256: stat.size <= 150 * 1024 * 1024 ? sha256(file) : null,
    };
  });

const missing = [];
const matched = [];
for (const name of expected) {
  const exact = inventory.find((file) => file.name === name);
  const fuzzy = inventory.find((file) => normalizeName(file.name) === normalizeName(name));
  if (exact || fuzzy) {
    matched.push({ expected: name, found: exact || fuzzy });
  } else {
    missing.push(name);
  }
}

const canonicalCandidates = inventory.filter((file) =>
  normalizeName(file.name).includes("die neue ordnung des wohlstands")
);

const result = {
  generatedAt: new Date().toISOString(),
  sourceRoots: sourceRoots.map(publicPath),
  expected,
  matched,
  missing,
  canonicalMainWork: {
    expected: "Natalie-Weber_Die neue Ordnung des Wohlstands.docx + Natalie-Weber_Die neue Ordnung des Wohlstands_small.pdf",
    found: {
      docx: matched.find((item) => item.expected === "Natalie-Weber_Die neue Ordnung des Wohlstands.docx")?.found || null,
      pdf: matched.find((item) => item.expected === "Natalie-Weber_Die neue Ordnung des Wohlstands_small.pdf")?.found || null,
      repositoryPdf: inventory.find((file) => file.path === "assets/pdf/die-neue-ordnung-des-wohlstands.pdf") || null,
    },
    candidates: canonicalCandidates,
    needsHumanDecision: false,
  },
  inventory,
};

fs.mkdirSync("public/data", { recursive: true });
fs.writeFileSync("public/data/asset-inventory.json", `${JSON.stringify(result, null, 2)}\n`);

const markdown = `# Missing Assets

Stand: ${new Date().toISOString()}

## Kanonisches Hauptwerk

- Erwartet: \`Natalie-Weber_Die neue Ordnung des Wohlstands.docx\` plus \`Natalie-Weber_Die neue Ordnung des Wohlstands_small.pdf\`
- DOCX: ${result.canonicalMainWork.found.docx ? `\`${result.canonicalMainWork.found.docx.path}\`` : "nicht gefunden"}
- PDF: ${result.canonicalMainWork.found.pdf ? `\`${result.canonicalMainWork.found.pdf.path}\`` : "nicht gefunden"}
- Repository-PDF: ${result.canonicalMainWork.found.repositoryPdf ? `\`${result.canonicalMainWork.found.repositoryPdf.path}\`` : "nicht gefunden"}
- Entscheidung nötig: nein

## Fehlende erwartete Dateien

${missing.length ? missing.map((item) => `- ${item}`).join("\n") : "Keine."}

## Mögliche Hauptwerkskandidaten

${canonicalCandidates.map((file) => `- \`${file.path}\` (${Math.round(file.sizeBytes / 1024 / 1024)} MB)`).join("\n") || "Keine."}
`;

fs.writeFileSync("docs/MISSING_ASSETS.md", markdown);
console.log(`Wrote inventory with ${inventory.length} files, ${missing.length} missing expected assets.`);

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const methods = JSON.parse(fs.readFileSync(path.join(ROOT, "content/methods/woems-methoden.json"), "utf8"));
const canvases = JSON.parse(fs.readFileSync(path.join(ROOT, "content/methods/woems-canvas.json"), "utf8"));

const methodExport = {
  schemaVersion: methods.schemaVersion,
  registryId: methods.registryId,
  version: methods.version,
  stand: methods.stand,
  sourceSha256: methods.sourceSha256,
  counts: methods.counts,
  kategorien: methods.kategorien,
  methods: methods.methods.map(({ id, kategorie, kategorieName, name, docxSeite, zweck, schnittstellen, canvasRef }) => ({
    id,
    kategorie,
    kategorieName,
    name,
    docxSeite,
    zweck,
    schnittstellen,
    canvasRef
  }))
};

const canvasExport = {
  schemaVersion: canvases.schemaVersion,
  registryId: canvases.registryId,
  version: canvases.version,
  stand: canvases.stand,
  counts: canvases.counts,
  mindeststandard: canvases.mindeststandard,
  canvases: canvases.canvases.map(({ id, methodId, relatedMethodIds, anwendungsmodul, name, felder, pflichtfelder }) => ({
    id,
    methodId,
    ...(relatedMethodIds ? { relatedMethodIds } : {}),
    ...(anwendungsmodul ? { anwendungsmodul } : {}),
    name,
    felder,
    pflichtfelder
  }))
};

for (const [relative, value] of [
  ["public/data/woems-methoden.json", methodExport],
  ["public/data/woems-canvas.json", canvasExport]
]) {
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

console.log(`WÖMS-Exporte geschrieben: ${methodExport.methods.length} Methoden, ${canvasExport.canvases.length} Canvas.`);

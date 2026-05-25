import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs/mobile-ux-check.md");
const cssPath = path.join(ROOT, "assets/css/style.css");
const headerPath = path.join(ROOT, "templates/header.html");
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";
const header = fs.existsSync(headerPath) ? fs.readFileSync(headerPath, "utf8") : "";

const checks = [
  {
    name: "Header-Template hat separaten Menübutton",
    ok: /class=["']nav-toggle/.test(header),
    note: "Mobile Navigation braucht eigenen Button.",
  },
  {
    name: "Marke besteht aus Signet und Text",
    ok: /brand-mark/.test(header) && /brand-name/.test(header),
    note: "Logo kann mobil gekürzt werden, ohne das Signet zu verlieren.",
  },
  {
    name: "Druckelemente werden im Print-/Mobile-Kontext steuerbar markiert",
    ok: /\.no-print/.test(css) || /no-print/.test(header),
    note: "Druckbuttons sollen mobil nicht dominant sein.",
  },
  {
    name: "Mobile Media Query vorhanden",
    ok: /@media\s*\([^)]*max-width/i.test(css),
    note: "Mobile Layout-Regeln müssen zentral vorhanden sein.",
  },
  {
    name: "Horizontales Überlaufen wird begrenzt",
    ok: /overflow-x:\s*(hidden|auto)/i.test(css),
    note: "Tabellen und Karten dürfen Mobile nicht sprengen.",
  },
];

const lines = [
  "# Mobile UX Check",
  "",
  `Stand: ${new Date().toISOString()}`,
  "",
  "| Check | Status | Hinweis |",
  "| --- | --- | --- |",
  ...checks.map((check) => `| ${check.name} | ${check.ok ? "ok" : "prüfen"} | ${check.note} |`),
  "",
];
fs.writeFileSync(OUT, `${lines.join("\n")}\n`);
const failed = checks.filter((check) => !check.ok).length;
console.log(`Mobile critical check: ${failed} findings -> docs/mobile-ux-check.md`);

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "public/data/tool-examples.json");

const fallbackTools = [
  {
    title: "Unternehmens-Wirkungsprofil Beta",
    text: "UWP-100 Beta bereitet Wirkungsprofile für Unternehmen vor, ohne echte Scores ohne belegte Daten zu erfinden.",
    href: "../erleben/unternehmens-wirkungsprofil/",
    cluster: "H",
    status: "Beta",
    type: "Beta-Tool",
    method: "Wirkungsprofil",
    demo: true,
  },
];

let tools = fallbackTools;
if (fs.existsSync(out)) {
  const existing = JSON.parse(fs.readFileSync(out, "utf8"));
  if (Array.isArray(existing.tools) && existing.tools.length > 0) {
    tools = existing.tools;
    const hasUwp = tools.some((tool) => String(tool.href || "").includes("unternehmens-wirkungsprofil"));
    if (!hasUwp) tools = [...tools, ...fallbackTools];
  }
}

const normalized = {
  generatedAt: new Date().toISOString(),
  count: tools.length,
  tools,
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Wrote ${tools.length} tool examples.`);

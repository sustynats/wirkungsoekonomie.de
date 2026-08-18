import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const archive = process.argv[2];
if (!archive) throw new Error("Usage: node scripts/import-fachanalyse-full-text.mjs <result-archive.zip>");

const resolvedArchive = resolve(archive);
const entries = execFileSync("unzip", ["-Z1", resolvedArchive], { encoding: "utf8" })
  .split("\n").map((entry) => entry.trim()).filter(Boolean);
const entry = entries.find((candidate) => candidate.endsWith("gebaeudeenergiegesetz-medienwirkung-fachanalyse.md"));
if (!entry) throw new Error("The supplied archive does not contain the released GEG full-analysis Markdown.");

const markdown = execFileSync("unzip", ["-p", resolvedArchive, entry], { encoding: "utf8", maxBuffer: 4_000_000 }).replace(/\r\n/g, "\n").trim();
if (!markdown.startsWith("# ")) throw new Error("The source analysis must begin with exactly one document title.");

// Public source texts are rejected, not silently changed, if they contain a
// production trace that must never appear on the website.
const forbidden = [
  /(?:^|\s)(?:file:|\/Users\/|\/private\/|C:\\Users\\)/i,
  /(?:redaktioneller\s+hinweis|internal\s+only|do\s+not\s+publish)/i
];
for (const pattern of forbidden) {
  if (pattern.test(markdown)) throw new Error(`The released source analysis contains a prohibited public trace: ${pattern}`);
}

const sourceHash = execFileSync("shasum", ["-a", "256"], { input: markdown, encoding: "utf8" }).trim().split(/\s+/)[0];
const output = resolve("data/fachanalysen-full.ts");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `/** Generated from a released specialist-analysis source. Do not hand-edit. */\nexport type FullAnalysisSource = { title: string; releasedAt: string; sourceHash: string; markdown: string };\n\nexport const fullAnalysisBySlug: Record<string, FullAnalysisSource> = ${JSON.stringify({
  "gebaeudeenergiegesetz-medienwirkung": {
    title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? "Gebäudeenergiegesetz 2023: Medienwirkung und Umsetzung",
    releasedAt: "2026-08-15",
    sourceHash,
    markdown
  }
}, null, 2)};\n`, "utf8");

console.log(JSON.stringify({ output: "data/fachanalysen-full.ts", sourceHash, sourceBytes: Buffer.byteLength(markdown) }));

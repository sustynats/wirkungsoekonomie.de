import fs from "node:fs";
import path from "node:path";

const glossary = JSON.parse(fs.readFileSync("public/data/glossary.terms.json", "utf8")).terms;
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(md|mdx|html)$/i.test(entry.name)) files.push(full);
  }
}
["src/content/docs", "referenz", "dokumente", "blog", "glossar.html", "verstehen.html", "modell.html"].forEach((item) => {
  if (fs.existsSync(item) && fs.statSync(item).isDirectory()) walk(item);
  else if (fs.existsSync(item)) files.push(item);
});

const issues = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (/\bWirkstoff\b/.test(text) && !/Analogie|analogie/.test(text.slice(Math.max(0, text.indexOf("Wirkstoff") - 300), text.indexOf("Wirkstoff") + 500))) {
    issues.push({
      sourceFile: file,
      term: "Wirkstoff",
      issueType: "missing-analogy-framing",
      severity: "high",
      status: "needs-human-review",
      reason: "Wirkstoff muss als Analogie gerahmt werden.",
    });
  }
  if (/SDG\+/.test(text) && /offizielle UN|UN-Kategorie/.test(text) && !/keine offizielle/.test(text)) {
    issues.push({
      sourceFile: file,
      term: "SDG+",
      issueType: "possible-official-un-category",
      severity: "high",
      status: "needs-human-review",
      reason: "SDG+ darf nicht als offizielle UN-Kategorie erscheinen.",
    });
  }
}

fs.mkdirSync("public/data/reviews", { recursive: true });
fs.writeFileSync("public/data/terminology-review.json", `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  terminologyBase: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md",
  reviewedFiles: files.length,
  glossaryTerms: glossary.length,
  findings: issues,
}, null, 2)}\n`);
console.log(`Terminology review completed with ${issues.length} findings across ${files.length} files.`);


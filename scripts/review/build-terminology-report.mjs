import fs from "node:fs";

const review = fs.existsSync("public/data/terminology-review.json")
  ? JSON.parse(fs.readFileSync("public/data/terminology-review.json", "utf8"))
  : { findings: [] };

const md = `# Terminologie-Review-Bericht

Stand: ${new Date().toISOString()}

- Geprüfte Dateien: ${review.reviewedFiles || 0}
- Befunde: ${review.findings?.length || 0}
- Begriffsquelle: ${review.terminologyBase || "WOeK_Begriffsleitfaden_fuehrend_v1.0.md"}

## Befunde

${(review.findings || []).map((item) => `- **${item.term}** in \`${item.sourceFile}\`: ${item.reason} (${item.status})`).join("\n") || "Keine Befunde."}
`;

fs.writeFileSync("docs/IMPORT_REVIEW_NOTES.md", md);
console.log("Updated docs/IMPORT_REVIEW_NOTES.md.");


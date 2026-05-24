import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STATUS = path.join(ROOT, "data/content_quality/detaildossier_sanierung_status.json");

if (!fs.existsSync(STATUS)) {
  console.error("Missing data/content_quality/detaildossier_sanierung_status.json. Run npm run sanierung:status first.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(STATUS, "utf8"));
const minimumDetailWords = data.rules?.detailkonzept_min_words ?? 4500;
const minimumDossierWords = data.rules?.dossier_min_words ?? 3000;

const invalid = [];
for (const item of data.items || []) {
  if (["vollständig", "geprüft"].includes(item.detailkonzept_status)) {
    if (!item.detailkonzept_docx || !item.detailkonzept_html || item.detailkonzept_word_count < minimumDetailWords || item.qa_no_internal_instructions !== "bestanden") {
      invalid.push(`${item.portal} / ${item.unterbereich}: Detailkonzept ist zu hoch eingestuft.`);
    }
  }
  if (["vollständig", "geprüft"].includes(item.dossier_status)) {
    if (!item.dossier_docx || !item.dossier_html || item.dossier_word_count < minimumDossierWords || item.qa_no_internal_instructions !== "bestanden") {
      invalid.push(`${item.portal} / ${item.unterbereich}: Dossier ist zu hoch eingestuft.`);
    }
  }
}

if (invalid.length) {
  console.error("Detaildossier-Sanierungsstatus ist inkonsistent:");
  for (const line of invalid.slice(0, 40)) console.error(`- ${line}`);
  if (invalid.length > 40) console.error(`... ${invalid.length - 40} weitere Treffer`);
  process.exit(1);
}

console.log(`Detaildossier-Sanierungsstatus plausibel: ${data.items?.length ?? 0} Einträge geprüft.`);

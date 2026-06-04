import { p0DossiersV2, p0SlugsV2 } from "../lib/wirkungsradar/p0-dossiers-v2.mjs";
import { P0_BLOCKING_STATUSES, validateDossierV2 } from "../lib/wirkungsradar/validateDossierV2.mjs";

const errors = [];
const statuses = new Map();

for (const dossier of p0DossiersV2) {
  const result = validateDossierV2(dossier);
  statuses.set(dossier.slug, result.status);
  if (P0_BLOCKING_STATUSES.has(result.status)) {
    errors.push(`${dossier.slug}: ${result.status} (${result.errors.join("; ")})`);
  }
  if (result.status !== "checked_v2_positive_examples") {
    errors.push(`${dossier.slug}: nicht v2-geprueft (${result.status})`);
  }
}

for (const slug of p0SlugsV2) {
  if (!statuses.has(slug)) errors.push(`${slug}: fehlt im P0-v2-Datensatz`);
}

if (errors.length) {
  console.error("Wirkungsradar v2 validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Wirkungsradar v2 validation OK: ${p0DossiersV2.length} P0-Dossiers checked_v2_positive_examples.`);

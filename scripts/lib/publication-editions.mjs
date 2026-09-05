import fs from 'node:fs';
import {escapeHtml} from './explainer-components.mjs';

export function currentPdfEditions() {
  return JSON.parse(fs.readFileSync('assets/data/site-review-pdf-editions.json', 'utf8')).files;
}
export function editionFor(filename) {
  const edition=currentPdfEditions().find(item => item.filename===filename);
  if (!edition) throw new Error(`Unknown publication edition: ${filename}`);
  return edition;
}
export function editionLink(filename,label='Aktualisierte PDF-Lesefassung') {
  const item=editionFor(filename);
  return `<a class="text-link" href="${escapeHtml(item.url)}">${escapeHtml(label)}</a> <span class="meta-line">(PDF, ${item.pages} Seiten, ${(item.bytes/1024/1024).toLocaleString('de-DE',{maximumFractionDigits:1})} MB)</span>`;
}

import fs from 'node:fs';
import {escapeHtml} from './explainer-components.mjs';

function allPdfEditions() {
  const historical = JSON.parse(fs.readFileSync('assets/data/site-review-pdf-editions.json', 'utf8')).files;
  const learning = JSON.parse(fs.readFileSync('assets/data/learning-editions-2026-09-06.json', 'utf8')).files;
  const state=JSON.parse(fs.readFileSync('assets/data/state-benchmark-edition-2026-09-06.json','utf8')).files;
  const modelV11=JSON.parse(fs.readFileSync('assets/data/model-explainer-edition-2026-09-06-v1-1.json','utf8')).files;
  const modelV12=JSON.parse(fs.readFileSync('assets/data/model-explainer-edition-2026-09-06-v1-2.json','utf8')).files;
  return [...historical, ...learning, ...state, ...modelV11, ...modelV12];
}
export function currentPdfEditions() {
  const all = allPdfEditions();
  const superseded = new Set(all.map(item => item.supersedes).filter(Boolean));
  return all.filter(item => !superseded.has(item.filename));
}
export function editionFor(filename) {
  const edition=allPdfEditions().find(item => item.filename===filename);
  if (!edition) throw new Error(`Unknown publication edition: ${filename}`);
  return edition;
}
export function editionLink(filename,label='Aktualisierte PDF-Lesefassung') {
  const item=editionFor(filename);
  const size=item.bytes<1024*1024?`${Math.ceil(item.bytes/1024).toLocaleString('de-DE')} KB`:`${(item.bytes/1024/1024).toLocaleString('de-DE',{maximumFractionDigits:1})} MB`;
  return `<a class="text-link" href="${escapeHtml(item.url)}">${escapeHtml(label)}</a> <span class="meta-line">(PDF, ${item.pages} Seiten, ${size})</span>`;
}

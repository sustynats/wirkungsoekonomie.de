import fs from 'node:fs';
import {createHash} from 'node:crypto';

export const diagramLayouts = JSON.parse(fs.readFileSync(new URL('../../content/news/editorial-diagram-layouts.json',import.meta.url),'utf8'));
export const diagramBodyHash = body => createHash('sha256').update(body).digest('hex');
export function editorialDiagramLayout(article) {
  const entry = diagramLayouts.entries.find(e=>e.slug===article.slug);
  // A new approved edition must not accidentally inherit an old interpretive
  // layout. Fall back to the intact manuscript; the audit reports the mismatch.
  if (!entry || entry.body_sha256!==diagramBodyHash(article.body_markdown || '')) return {};
  return entry;
}

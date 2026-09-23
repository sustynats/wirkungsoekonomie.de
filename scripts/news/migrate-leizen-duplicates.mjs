import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentKey } from './living-files.mjs';

// Three already published reports describe the same 22 September evacuation
// in Leizen. Keep every original article and analysis as a historical stand;
// this one-time migration changes only listing and consolidation metadata.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const file = path.join(root, 'data/news/stories.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const byId = new Map(data.stories.map((story) => [story.story_id, story]));
const canonical = byId.get('wt-1d3fd4e1a02fe3e4');
const duplicates = ['wt-7699cc5cf04f6af2', 'wt-9bfe2b84b6ed7d1e'].map((id) => byId.get(id));
if (!canonical?.published || duplicates.some((story) => !story?.published)) throw new Error('LEIZEN_PUBLICATIONS_MISSING');
const sourceKeys = new Set(canonical.sources.map((source) => documentKey(source.url)));
if (!duplicates.every((story) => story.sources.some((source) => sourceKeys.has(documentKey(source.url))))) {
  throw new Error('LEIZEN_SOURCE_IDENTITY_NOT_CONFIRMED');
}

const at = new Date().toISOString();
let changed = false;
for (const duplicate of duplicates) {
  if (duplicate.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE') {
    if (duplicate.retirement.canonical_story_ids?.[0] !== canonical.story_id) throw new Error('LEIZEN_RETIREMENT_CONFLICT');
    continue;
  }
  if (duplicate.retirement || duplicate.listed === false) throw new Error('LEIZEN_STORY_ALREADY_RETIRED');
  canonical.living_file ||= {};
  canonical.living_file.merged_story_ids = [...new Set([...(canonical.living_file.merged_story_ids || []), duplicate.story_id])];
  canonical.living_file.consolidations = [
    ...(canonical.living_file.consolidations || []),
    { at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
      reason: 'Quellenbelegt derselbe DHL-Gefahrstoffeinsatz in Leizen am 22. September 2026' },
  ];
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = {
    at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese Meldung beschreibt denselben Einsatz im DHL-Zentrum Leizen. Der veröffentlichte historische Stand und seine Quellen bleiben erhalten; die fortgeführte Wirkungsakte ist verlinkt.',
  };
  duplicate.analysis_status = 'mit fortgeführter Wirkungsakte zusammengeführt';
  changed = true;
}
if (changed) fs.writeFileSync(file, `${JSON.stringify(data)}\n`);
console.log(changed ? 'Leizen: zwei historische Doppelmeldungen transparent zugeordnet.' : 'Leizen-Zuordnung bereits angewendet.');

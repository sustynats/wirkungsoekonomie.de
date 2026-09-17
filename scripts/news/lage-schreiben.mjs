#!/usr/bin/env node
// Schreibt eine Lage in data/news/lagen.json. Kein Modellaufruf, keine Kosten:
// die Lage ist eine Ableitung aus den bereits veroeffentlichten Wirkungsakten.
// Derselbe Lauf zweimal ergibt dieselbe Lage (upsertLage), ein abgebrochener
// Lauf kann also einfach wiederholt werden.
//
// Aufruf:  node scripts/news/lage-schreiben.mjs [--slot mittagslage] [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLage, upsertLage, dueLage, lageDefinition } from './lage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STORIES_FILE = path.join(ROOT, 'data/news/stories.json');
const LAGEN_FILE = path.join(ROOT, 'data/news/lagen.json');

export function schreibeLage({ slot, now = new Date().toISOString(), root = ROOT, dryRun = false } = {}) {
  const storiesFile = path.join(root, 'data/news/stories.json');
  const lagenFile = path.join(root, 'data/news/lagen.json');
  const gewaehlt = slot || dueLage(now);
  if (!gewaehlt) return { status: 'keine_lage_faellig', now };
  if (!lageDefinition(gewaehlt)) return { status: 'slot_unbekannt', slot: gewaehlt };
  const stories = (JSON.parse(fs.readFileSync(storiesFile, 'utf8')).stories || [])
    .filter((story) => story.published && story.analysis && story.listed !== false);
  const lage = buildLage({ slot: gewaehlt, now, stories });
  if (!lage) return { status: 'fenster_unlesbar', slot: gewaehlt, now };
  const vorher = fs.existsSync(lagenFile) ? JSON.parse(fs.readFileSync(lagenFile, 'utf8')) : { lagen: [] };
  const store = upsertLage(vorher, lage, { now });
  if (!dryRun) fs.writeFileSync(lagenFile, `${JSON.stringify(store, null, 2)}\n`);
  return { status: 'ok', lage_id: lage.lage_id, slot: lage.slot, counts: lage.counts,
    headline: lage.headline, window: { from: lage.window_from, to: lage.window_to },
    gespeichert: !dryRun, lagen_in_ablage: store.lagen.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const slotArg = process.argv.indexOf('--slot');
  const ergebnis = schreibeLage({
    slot: slotArg > -1 ? process.argv[slotArg + 1] : undefined,
    dryRun: process.argv.includes('--dry-run'),
  });
  console.log(JSON.stringify(ergebnis, null, 2));
  if (!['ok', 'keine_lage_faellig'].includes(ergebnis.status)) process.exit(1);
}

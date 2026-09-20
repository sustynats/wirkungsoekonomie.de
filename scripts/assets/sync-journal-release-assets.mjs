#!/usr/bin/env node
// Haelt die Journal-PDFs in der Release-Liste aktuell.
//
// Natalie am 20.09.2026, als die Seite 12 MB unter dem Auslieferungslimit von
// GitHub Pages stand: „Vielleicht kann man Dinge auch verschieben." Die 156
// Journal-PDFs lagen als einzige oeffentliche Mediengruppe bewusst auf der
// Domain (46 MB). Sie liegen jetzt wie alle anderen im Release; die Seite
// verlinkt sie nur noch.
//
// Anders als die uebrigen Release-Dateien traegt ein Journal-PDF seinen
// Inhalt im Namen: eine korrigierte Fassung eines Artikels erzeugt dieselbe
// Datei neu. Ohne Inhaltskennung muesste die Auslieferung entweder eine
// unveraenderliche Release-Datei ueberschreiben (das lehnt sie zu Recht ab)
// oder abbrechen. Mit Kennung entsteht einfach eine neue Datei, und alte
// Verweise bleiben gueltig.
//
//   node scripts/assets/sync-journal-release-assets.mjs           (schreiben)
//   node scripts/assets/sync-journal-release-assets.mjs --check   (pruefen)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const JOURNAL_PREFIX = 'assets/pdf/journal/';
// Eigenes Release: ein Release fasst hoechstens 1000 Dateien, und
// woek-public-assets-v2 ist mit 930 fast voll (20.09.2026 beim ersten
// Hochladen aufgefallen). Die 156 Journal-PDFs bekommen deshalb ihr eigenes.
export const JOURNAL_TAG = 'woek-journal-pdfs-v1';
const RELEASE_BASE = 'https://github.com/sustynats/wirkungsoekonomie.de/releases/download/';

export function journalAssetName(relative, bytes) {
  const digest = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  return `${relative.replace(/\.pdf$/i, '').replace(/\//g, '__')}__${digest}.pdf`;
}

export function journalPdfs(root) {
  const base = path.join(root, JOURNAL_PREFIX);
  if (!fs.existsSync(base)) return [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.isFile() && /\.pdf$/i.test(entry.name) ? [full] : [];
  });
  return walk(base).map((file) => path.relative(root, file).split(path.sep).join('/')).sort();
}

export function journalReleaseEntries(root, tag = JOURNAL_TAG) {
  return journalPdfs(root).map((relative) => [relative,
    `${RELEASE_BASE}${tag}/${journalAssetName(relative, fs.readFileSync(path.join(root, relative)))}`]);
}

// Die bestehende Reihenfolge bleibt, damit der Unterschied lesbar bleibt:
// erst alle uebrigen Eintraege wie gehabt, dann der Journal-Block sortiert.
export function syncedManifest(manifest, entries) {
  const rest = Object.entries(manifest.assets || {}).filter(([key]) => !key.startsWith(JOURNAL_PREFIX));
  return { ...manifest, assets: Object.fromEntries([...rest, ...entries]) };
}

export function syncJournalReleaseAssets(root, { check = false } = {}) {
  const file = path.join(root, 'assets/data/public-release-assets.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = journalReleaseEntries(root);
  const next = `${JSON.stringify(syncedManifest(manifest, entries), null, 2)}\n`;
  const current = fs.readFileSync(file, 'utf8');
  if (current === next) return { status: 'aktuell', journal: entries.length };
  if (check) throw new Error('JOURNAL_RELEASE_LISTE_VERALTET');
  fs.writeFileSync(file, next);
  return { status: 'geschrieben', journal: entries.length };
}

// Dieselbe Quelle speist die Verweise der Seite und die Auslieferung ins
// Release: Pfad und Release-Dateiname, je Zeile, durch einen Tabulator getrennt.
export function releaseListe(root) {
  return journalReleaseEntries(root).map(([relative, url]) => `${relative}\t${url.slice(url.lastIndexOf('/') + 1)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes('--release-liste')) console.log(releaseListe(process.cwd()).join('\n'));
    else console.log(JSON.stringify(syncJournalReleaseAssets(process.cwd(), { check: process.argv.includes('--check') })));
  } catch (error) {
    console.error(error.message === 'JOURNAL_RELEASE_LISTE_VERALTET'
      ? 'Die Journal-PDFs stimmen nicht mit assets/data/public-release-assets.json ueberein.\nBitte "node scripts/assets/sync-journal-release-assets.mjs" ausfuehren und das Ergebnis mit einchecken.'
      : error.message);
    process.exitCode = 1;
  }
}

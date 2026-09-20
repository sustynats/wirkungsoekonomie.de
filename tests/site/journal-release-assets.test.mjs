import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { journalAssetName, journalPdfs, journalReleaseEntries, releaseListe, syncJournalReleaseAssets, JOURNAL_PREFIX, JOURNAL_TAG } from '../../scripts/assets/sync-journal-release-assets.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));

function fixture(dateien) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'journal-release-'));
  fs.mkdirSync(path.join(root, 'assets/data'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/data/public-release-assets.json'),
    `${JSON.stringify({ tag: 'woek-public-assets-v2', assets: { 'assets/audio/a.mp3': 'https://github.com/x/releases/download/woek-public-assets-v2/assets__audio__a.mp3' } }, null, 2)}\n`);
  for (const [name, inhalt] of Object.entries(dateien)) {
    const datei = path.join(root, JOURNAL_PREFIX, name);
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    fs.writeFileSync(datei, inhalt);
  }
  return root;
}

test('eine korrigierte Lesefassung bekommt einen neuen Release-Namen statt eines Konflikts', () => {
  const alt = journalAssetName('assets/pdf/journal/beispiel.pdf', Buffer.from('erste Fassung'));
  const neu = journalAssetName('assets/pdf/journal/beispiel.pdf', Buffer.from('korrigierte Fassung'));
  assert.notEqual(alt, neu, 'sonst muesste die Auslieferung eine unveraenderliche Datei ueberschreiben');
  assert.match(alt, /^assets__pdf__journal__beispiel__[a-f0-9]{8}\.pdf$/);
  assert.equal(journalAssetName('assets/pdf/journal/a/index.pdf', Buffer.from('x')).startsWith('assets__pdf__journal__a__index__'), true);
});

test('die Liste traegt jedes Journal-PDF und bleibt bei unveraenderten Dateien gleich', () => {
  const root = fixture({ 'zwei.pdf': 'B', 'eins/index.pdf': 'A' });
  try {
    assert.deepEqual(journalPdfs(root), ['assets/pdf/journal/eins/index.pdf', 'assets/pdf/journal/zwei.pdf']);
    assert.equal(syncJournalReleaseAssets(root).status, 'geschrieben');
    assert.equal(syncJournalReleaseAssets(root).status, 'aktuell');
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/public-release-assets.json'), 'utf8'));
    assert.equal(Object.keys(manifest.assets).length, 3, 'bestehende Eintraege bleiben erhalten');
    for (const [relative, url] of journalReleaseEntries(root)) {
      assert.equal(manifest.assets[relative], url);
      // Eigenes Release: woek-public-assets-v2 fasst nur 1000 Dateien und ist fast voll.
      assert.equal(url.startsWith(`https://github.com/sustynats/wirkungsoekonomie.de/releases/download/${JOURNAL_TAG}/`), true);
      assert.notEqual(JOURNAL_TAG, manifest.tag);
    }
  } finally { fs.rmSync(root, { recursive: true }); }
});

test('eine geaenderte Datei laesst die Pruefung fehlschlagen, nicht die Auslieferung stillschweigend abweichen', () => {
  const root = fixture({ 'eins.pdf': 'A' });
  try {
    syncJournalReleaseAssets(root);
    fs.writeFileSync(path.join(root, JOURNAL_PREFIX, 'eins.pdf'), 'A korrigiert');
    assert.throws(() => syncJournalReleaseAssets(root, { check: true }), /JOURNAL_RELEASE_LISTE_VERALTET/);
    assert.equal(syncJournalReleaseAssets(root).status, 'geschrieben');
  } finally { fs.rmSync(root, { recursive: true }); }
});

test('Verweisliste und Auslieferungsliste stammen aus derselben Quelle', () => {
  const root = fixture({ 'eins.pdf': 'A', 'zwei/index.pdf': 'B' });
  try {
    syncJournalReleaseAssets(root);
    assert.deepEqual(releaseListe(root), journalReleaseEntries(root)
      .map(([relative, url]) => `${relative}\t${url.slice(url.lastIndexOf('/') + 1)}`));
  } finally { fs.rmSync(root, { recursive: true }); }
});

test('das Arbeitsverzeichnis ist geschlossen: Liste gepflegt, Ausnahme entfallen, Auslieferung verdrahtet', () => {
  assert.equal(syncJournalReleaseAssets(repo, { check: true }).journal, journalPdfs(repo).length);
  const gate = fs.readFileSync(path.join(repo, 'scripts/assets/check-release-assets.mjs'), 'utf8');
  assert.equal(gate.includes('bundledJournalPdfPrefix'), false, 'Journal-PDFs sind keine Ausnahme mehr');
  const workflow = fs.readFileSync(path.join(repo, '.github/workflows/deploy.yml'), 'utf8');
  assert.match(workflow, /sync-journal-release-assets\.mjs --release-liste/);
  assert.ok(workflow.includes(JOURNAL_TAG), 'die Auslieferung muss das eigene Journal-Release benennen');
  assert.match(workflow, /cp "\$source_path" "\$RUNNER_TEMP\/\$asset_name"\n\s*publish_immutable_asset "\$RUNNER_TEMP\/\$asset_name" "\$asset_name"/,
    "gh release upload benennt die Datei nach ihrem Dateinamen, nicht nach der Beschriftung");
  const paket = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
  assert.match(paket.scripts.postbuild, /sync-journal-release-assets\.mjs --check/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { journalAssetName, journalPdfs, journalReleaseEntries, releaseListe, syncJournalReleaseAssets, JOURNAL_PREFIX, JOURNAL_TAG } from '../../scripts/assets/sync-journal-release-assets.mjs';
import {publicReleaseImageUrl, verifyPublicReleaseImages} from '../../scripts/assets/public-release-images.mjs';
import vm from 'node:vm';

const repo = fileURLToPath(new URL('../../', import.meta.url));

test('explicit public PNG release entries are immutable, content-bound and opt-in', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'public-release-image-'));
  const relative = 'assets/img/blog/example.png', original = Buffer.from('unchanged public PNG bytes');
  try {
    fs.mkdirSync(path.join(root, 'assets/img/blog'), {recursive:true});
    fs.writeFileSync(path.join(root, relative), original);
    const url = publicReleaseImageUrl(relative, original);
    assert.match(url, /__example__[a-f0-9]{64}\.png$/);
    assert.equal(verifyPublicReleaseImages(root, new Map([[relative, url]])), 1);
    assert.equal(verifyPublicReleaseImages(root, new Map()), 0);
    assert.throws(() => publicReleaseImageUrl('../private.png', original), /PATH_INVALID/);
    assert.throws(() => publicReleaseImageUrl('assets/img/blog/../private.png', original), /PATH_INVALID/);
    assert.throws(() => verifyPublicReleaseImages(root, new Map([['assets/img/blog/../../private.png', url]])), /PATH_INVALID/);
    fs.writeFileSync(path.join(root, relative), 'changed bytes');
    assert.throws(() => verifyPublicReleaseImages(root, new Map([[relative, url]])), /BYTES_MISMATCH/);
    assert.deepEqual(fs.readFileSync(path.join(root, relative)), Buffer.from('changed bytes'));
  } finally {fs.rmSync(root, {recursive:true, force:true});}
});

test('actual artifact rewrite maps only opted-in images, retaining suffixes and prior release formats', () => {
  const source = fs.readFileSync(path.join(repo, 'scripts/quality/build-public-artifact.mjs'), 'utf8');
  const start = source.indexOf('function releaseAssetReferenceVariants(');
  const end = source.indexOf('function shouldCopyRootFile(', start);
  assert.ok(start > 0 && end > start);
  const relative = 'assets/img/blog/example.png';
  const imageUrl = publicReleaseImageUrl(relative, Buffer.from('unchanged public bytes'));
  const pdf = 'assets/pdf/example.pdf', pdfUrl = 'https://github.com/example/releases/download/v1/example.pdf';
  const context = {publicReleaseAssets: new Map([[relative,imageUrl],[pdf,pdfUrl]])};
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  for (const prefix of ['', '/', '../', '../../', 'https://wirkungsoekonomie.de/']) {
    const before = '<img src="' + prefix + relative + '?v=1#image">';
    const after = '<img src="' + imageUrl + '?v=1#image">';
    assert.equal(context.rewritePublicReleaseAssetReferences(before), after);
    assert.equal(context.rewritePublicReleaseAssetReferences(after), after);
  }
  assert.equal(context.rewritePublicReleaseAssetReferences('{"image":"/' + relative + '"}'), '{"image":"' + imageUrl + '"}');
  const untouched = '<img src="/assets/img/blog/not-opted-in.png"><p>Unchanged reader text.</p>';
  assert.equal(context.rewritePublicReleaseAssetReferences(untouched), untouched);
  assert.equal(context.rewritePublicReleaseAssetReferences('<a href="/' + pdf + '">PDF</a>'), '<a href="' + pdfUrl + '">PDF</a>');
});

test('the real image release registry matches the complete unchanged local originals', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repo, 'assets/data/public-release-assets.json')));
  const optedIn = [
    'assets/img/blog/2026-08-03-wohlstandsverlust-preise-klimakrise.png',
    'assets/img/blog/2026-08-20-deutschlands-nachhaltigkeitsarchitektur-wirkungssteuerung.png',
    'assets/img/blog/2026-08-21-enap-woek-benchmark-fuenf-bundesvorhaben.png',
    'assets/img/blog/2026-08-05-das-bessere-spiel.png',
    'assets/img/blog/2026-05-21-wirkung-ist-nicht-wirkungsmanagement.png',
    'assets/img/blog/2026-08-03-atomkraft-wetterabhaengigkeit-hinter-beton.png',
    'assets/img/blog/kostenwahrheit-eu-vorschriften-wirkungsoekonomie.png',
    'assets/img/blog/2026-08-15-wie-wirksam-ist-das-sondervermoegen-wirklich.png',
    'assets/img/blog/2026-06-02-sprache-spaltet-oder-verbindet.png',
  ];
  assert.deepEqual(Object.keys(manifest.assets).filter(key => key.startsWith('assets/img/')).sort(), optedIn.sort());
  assert.equal(verifyPublicReleaseImages(repo, new Map(Object.entries(manifest.assets))), optedIn.length);
});

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

// Am 20.09.2026 brach die erste Auslieferung nach der Umstellung ab: die
// Funktion fragte die Dateiliste des Releases je Datei erneut ab, bei 159
// Dateien kam eine Antwort leer zurueck, und der Lauf wollte eine vorhandene
// Datei neu hochladen. Seitdem: Liste einmal je Release, und "existiert
// bereits" ist kein Abbruch, sondern eine Pruefung auf Byte-Gleichheit.
test('die Auslieferung fragt die Release-Liste einmal je Release und stolpert nicht ueber vorhandene Dateien', () => {
  const workflow = fs.readFileSync(path.join(repo, '.github/workflows/deploy.yml'), 'utf8');
  const schritt = workflow.slice(workflow.indexOf("release_tag='woek-public-assets-v2'"), workflow.indexOf('\n  deploy:'));
  assert.equal((schritt.match(/gh release view "\$release_tag" --json assets/g) || []).length, 1,
    'die Liste wird an genau einer Stelle gelesen');
  assert.equal((schritt.match(/^\s*lies_asset_liste$/gm) || []).length, 2, 'einmal je Release');
  assert.match(schritt, /grep -q 'already exists'[\s\S]{0,400}verify_immutable_asset/);
  assert.match(schritt, /cmp --silent "\$source_path"/, 'Byte-Gleichheit bleibt Pflicht');
});


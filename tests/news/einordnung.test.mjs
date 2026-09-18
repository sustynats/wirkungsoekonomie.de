import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { einordnungErsetzen, pruefeEinordnung, offeneEinordnungen, uebernehmeEinordnung, runEinordnung, EINORDNUNG_TITEL } from '../../scripts/news/einordnung.mjs';

const basis = `## Kurzbefund\n\nDas Urteil betrifft 12 Plattformen und 3 laufende Verfahren.\n\n${EINORDNUNG_TITEL}\n\nAlter Text, der ersetzt wird.\n\n## Quellen und weiterführende Einordnung\n\n- Ein Beleg\n`;
const gut = 'Wer Reichweite organisiert, trägt die Folgen mit: das ist der Kern dieses Urteils. Für Verbraucherinnen und Verbraucher zählt nicht die Ankündigung, sondern die geprüfte Schutzpraxis, und die steht noch aus. Nichtkompensation heißt hier, dass ein verbesserter Beschwerdeweg einen fortbestehenden Schaden nicht aufwiegt.';

test('ersetzt wird ausschliesslich der Abschnitt Meine Einordnung', () => {
  const neu = einordnungErsetzen(basis, gut);
  assert.ok(neu.includes('## Kurzbefund'), 'der Befund bleibt');
  assert.ok(neu.includes('Das Urteil betrifft 12 Plattformen'), 'die Fakten bleiben');
  assert.ok(neu.includes('## Quellen und weiterführende Einordnung'), 'die Quellen bleiben');
  assert.ok(neu.includes(gut), 'die neue Einordnung steht drin');
  assert.equal(neu.includes('Alter Text'), false, 'die alte Einordnung ist weg');
  assert.throws(() => einordnungErsetzen('## Nur ein Befund\n\nText.', gut), /EINORDNUNG_ABSCHNITT_FEHLT/);
});

// Eine Einordnung gewichtet Belegtes. Sie darf nichts Neues belegen wollen -
// deshalb keine neuen Zahlen, keine Adressen, keine eigenen Abschnitte.
test('die Einordnung darf keine neuen Tatsachen mitbringen', () => {
  assert.throws(() => pruefeEinordnung(`${gut} Betroffen sind 4711 Konten.`, basis), /EINORDNUNG_NEUE_ZAHL/);
  assert.throws(() => pruefeEinordnung(`${gut} Siehe https://example.org/beleg`, basis), /EINORDNUNG_QUELLE_IM_TEXT/);
  assert.throws(() => pruefeEinordnung(`## Zwischentitel\n\n${gut}`, basis), /EINORDNUNG_UEBERSCHRIFT_IM_TEXT/);
  assert.throws(() => pruefeEinordnung('Zu kurz.', basis), /EINORDNUNG_ZU_KURZ/);
  assert.throws(() => pruefeEinordnung(`${gut}${'x'.repeat(2600)}`, basis), /EINORDNUNG_ZU_LANG/);
  // Zahlen aus dem Beitrag darf sie aufgreifen.
  assert.ok(pruefeEinordnung(`${gut} Die 12 Plattformen tragen dieselbe Pflicht.`, basis).includes('12 Plattformen'));
});

test('ein Verfahrensvermerk kommt auch auf diesem Weg nicht durch', () => {
  assert.throws(() => pruefeEinordnung(`${gut} Bitte festlegen, ob der Schutz betont wird.`, basis), /EDITORIAL_PROCESS_NOTE_IN_TEXT/);
  assert.throws(() => pruefeEinordnung(`${gut} Vorschlag zur Bestätigung durch Natalie.`, basis), /EDITORIAL_PROCESS_NOTE_IN_TEXT/);
});

test('uebernommen wird als Korrekturfassung ohne bezahlten Aufruf', async () => {
  const wurzel = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'einordnung-'));
  const ausgabe = JSON.parse(fs.readFileSync(new URL('./fixtures/approved-personal-edition.json', import.meta.url), 'utf8'));
  ausgabe.body_markdown = basis;
  ausgabe.content_hash = (await import('../../scripts/news/personal-editorial.mjs')).personalContentHash({ ...ausgabe, content_hash: undefined });
  fs.mkdirSync(path.join(wurzel, 'data/news'), { recursive: true });
  fs.writeFileSync(path.join(wurzel, 'data/news/personal-editorials.json'), JSON.stringify({ schema_version: '1.0', editions: [ausgabe] }));
  // Die Ablage verlangt das vorhandene Portraetbild - der Pruefstand braucht es
  // deshalb auch, sonst faellt loadPersonalEditorials mit PORTRAIT_ASSET_MISSING.
  const { personalPortrait } = await import('../../scripts/news/personal-editorial.mjs');
  const bild = path.join(wurzel, personalPortrait(ausgabe.subtype));
  fs.mkdirSync(path.dirname(bild), { recursive: true });
  fs.writeFileSync(bild, 'x');
  const geschrieben = new Map(); const aufrufe = [];
  const session = { store: { get: async () => null, all: async () => [], put: async (job) => aufrufe.push(['put', job.input.job_type]), observe: async (key, wert) => aufrufe.push(['observe', wert.provider_called, wert.cost_usd]) },
    transport: { metadata: async () => null, writeAtomic: async (pfad, wert) => geschrieben.set(pfad, wert), read: async (pfad) => JSON.stringify(geschrieben.get(pfad)) } };
  const ergebnis = await uebernehmeEinordnung({ session, slug: ausgabe.slug, text: gut, owner: '123456789012345678', root: wurzel, now: () => '2026-09-18T06:00:00.000Z' });
  assert.equal(ergebnis.status, 'output_delivered');
  assert.equal(ergebnis.cost_usd, 0, 'kein bezahlter Aufruf');
  assert.deepEqual(aufrufe.find(([art]) => art === 'observe'), ['observe', false, 0]);
  const ausgeliefert = [...geschrieben].find(([pfad]) => pfad.includes('20_OUTPUT_READY'))[1];
  assert.ok(ausgeliefert.preview.markdown.includes(gut), 'der Text liegt in der Freigabefassung');
  assert.equal(ausgeliefert.preview.markdown.includes('Alter Text'), false);
});

test('ohne Oracle-Zugang bleibt der Lauf ohne Wirkung', async () => {
  assert.deepEqual(await runEinordnung({ env: { WOEK_EINORDNUNG_SLUG: 'x', WOEK_EINORDNUNG_TEXT: 'y' } }),
    { status: 'skipped', reason: 'BRIDGE_REMOTE_CONFIG_REQUIRED' });
  await assert.rejects(() => runEinordnung({ env: {} }), /EINORDNUNG_EINGABE_UNVOLLSTAENDIG/);
});

// Natalie am 18.09.2026 zum Meta-Urteil: "und die aktuellen haben ja auch
// bloedsinn drin". Es geht also nicht um die fehlenden Einordnungen, sondern um
// alle, die noch nicht ueberarbeitet sind - eine Korrektur aus einem anderen
// Grund (hoehere revision) macht die Einordnung nicht neu.
test('die Arbeitsliste nennt jeden Beitrag ohne uebernommene Einordnung', async () => {
  const { EINORDNUNG_NOTIZ, uebernommeneEinordnungen } = await import('../../scripts/news/einordnung.mjs');
  const ausgaben = [
    { slug: 'alt', title: 'Alt', subtype: 'watched', published_at: '2026-09-16T10:00:00Z', revision: 1 },
    { slug: 'neu', title: 'Neu', subtype: 'opinion_analysis', published_at: '2026-09-17T10:00:00Z', revision: 1 },
    { slug: 'anders-korrigiert', title: 'Anders korrigiert', subtype: 'listened', published_at: '2026-09-17T11:00:00Z', revision: 3 },
    { slug: 'fertig', title: 'Einordnung übernommen', subtype: 'listened', published_at: '2026-09-17T12:00:00Z', revision: 2 },
  ];
  const revisionen = [
    { target: { slug: 'anders-korrigiert' }, patch: { correction_note: 'Eine Zahl wurde berichtigt.' } },
    { target: { slug: 'fertig' }, patch: { correction_note: EINORDNUNG_NOTIZ } },
  ];
  assert.deepEqual([...uebernommeneEinordnungen(revisionen)], ['fertig']);
  const liste = offeneEinordnungen(ausgaben, { revisionen });
  assert.deepEqual(liste.map((eintrag) => eintrag.slug), ['anders-korrigiert', 'neu', 'alt'], 'neueste zuerst, nur die offenen');
  assert.equal(liste[0].url, 'https://wirkungsoekonomie.de/wirkungsticker/analyse/anders-korrigiert/');
});

test('der Uebernahme-Lauf hat seinen vollstaendigen Abhaengigkeitsbaum im sparse checkout', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/einordnung-uebernehmen.yml'), 'utf8');
  const checkout = workflow.split('sparse-checkout: |')[1].split('sparse-checkout-cone-mode:')[0].trim().split('\n').map((zeile) => zeile.trim());
  const besucht = new Set();
  const besuche = (datei) => {
    if (besucht.has(datei)) return;
    besucht.add(datei);
    assert.ok(checkout.includes(datei), `Der Checkout vermisst ${datei}`);
    for (const treffer of fs.readFileSync(path.join(root, datei), 'utf8').matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+\.mjs)['"]/g)) {
      besuche(path.posix.normalize(path.posix.join(path.posix.dirname(datei), treffer[1])));
    }
  };
  besuche('scripts/news/einordnung.mjs');
  // Code-Importe reichen nicht: am 18.09.2026 brach der Lauf beim Laden ab,
  // weil show-identity.mjs eine Datendatei liest, die der Checkout nicht hatte.
  // Mitgeprueft werden deshalb Dateilesungen relativ zum Modul, Daten-Literale
  // und die Portraitbilder, deren Existenz die Ablage beim Laden verlangt.
  const daten = new Set();
  for (const datei of besucht) {
    const code = fs.readFileSync(path.join(root, datei), 'utf8');
    for (const treffer of code.matchAll(/new URL\(['"](\.\.?\/[^'"]+\.(?:json|jpe?g|png|svg))['"],\s*import\.meta\.url\)/g)) {
      daten.add(path.posix.normalize(path.posix.join(path.posix.dirname(datei), treffer[1])));
    }
    for (const treffer of code.matchAll(/['"](data\/[A-Za-z0-9_./-]+\.json)['"]/g)) daten.add(treffer[1]);
    for (const treffer of code.matchAll(/['"]\/?(assets\/img\/people\/[A-Za-z0-9_.-]+)['"]/g)) daten.add(treffer[1]);
  }
  assert.ok(daten.size >= 5, `zu wenige Datendateien erkannt: ${[...daten].join(', ')}`);
  for (const datei of daten) assert.ok(checkout.includes(datei), `Der Checkout vermisst die Datendatei ${datei}`);
});

// Stuendliche Laeufe treffen denselben Beitrag wieder, solange Natalie noch
// nicht freigegeben hat. Dann darf keine zweite Fassung in ihre Liste kommen.
test('eine wartende Korrekturfassung sperrt den Beitrag', async () => {
  const { uebernehmeEinordnung: uebernehmen } = await import('../../scripts/news/einordnung.mjs');
  const wurzel = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'einordnung2-'));
  const { personalContentHash, personalPortrait } = await import('../../scripts/news/personal-editorial.mjs');
  const ausgabe = JSON.parse(fs.readFileSync(new URL('./fixtures/approved-personal-edition.json', import.meta.url), 'utf8'));
  ausgabe.body_markdown = basis;
  ausgabe.content_hash = personalContentHash({ ...ausgabe, content_hash: undefined });
  fs.mkdirSync(path.join(wurzel, 'data/news'), { recursive: true });
  fs.writeFileSync(path.join(wurzel, 'data/news/personal-editorials.json'), JSON.stringify({ schema_version: '1.0', editions: [ausgabe] }));
  const bild = path.join(wurzel, personalPortrait(ausgabe.subtype));
  fs.mkdirSync(path.dirname(bild), { recursive: true }); fs.writeFileSync(bild, 'x');
  const wartend = { input: { job_id: 'wt_20260918T060000Z_' + 'a'.repeat(24) }, status: 'queued',
    intake: { trigger_type: 'correction_version', revision_target: { slug: ausgabe.slug } } };
  const geschrieben = []; const ablage = new Map();
  const session = { store: { get: async () => null, all: async () => [wartend], put: async () => geschrieben.push('put'), observe: async () => geschrieben.push('observe') },
    transport: { metadata: async () => null, writeAtomic: async (pfad, wert) => { geschrieben.push('write'); ablage.set(pfad, wert); },
      read: async (pfad) => JSON.stringify(ablage.get(pfad)) } };
  const ergebnis = await uebernehmen({ session, slug: ausgabe.slug, text: gut, owner: '123456789012345678', root: wurzel, now: () => '2026-09-18T07:00:00.000Z' });
  assert.deepEqual(ergebnis, { status: 'already_pending', slug: ausgabe.slug, job_id: wartend.input.job_id });
  assert.deepEqual(geschrieben, [], 'nichts geschrieben, nichts eingereiht');
  // Quittierte Fassungen sperren nicht: nach der Freigabe darf wieder gearbeitet werden.
  const quittiert = { ...wartend, ack: { status: 'imported' } };
  const zweite = { store: { ...session.store, all: async () => [quittiert] }, transport: session.transport };
  assert.equal((await uebernehmen({ session: zweite, slug: ausgabe.slug, text: gut, owner: '123456789012345678', root: wurzel, now: () => '2026-09-18T07:00:00.000Z' })).status, 'output_delivered');
});

// Direktbetrieb: Von Natalie in der privaten Redaktion (Oracle) freigegebene
// Fassungen (Nachgehört, Nachgesehen, Buch & Wirkung, freigegebene Nachrichten,
// freigegebene Revisionen) werden weiterhin in die Website übernommen. Der
// Nachrichtenlauf braucht dafür keine Bridge-Phase mehr: Diese Übernahme läuft
// als eigener Schritt über die vorhandene authentifizierte Oracle-Schnittstelle.
//   --claim     vor Build und Commit: freigegebene Fassungen abholen und lokal schreiben
//   --finalize  nach erfolgreichem Push: Übernahme gegenüber Oracle quittieren
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bridgeSession } from './bridge/remote.mjs';
import { importApprovedEditorials } from './bridge/personal-publication.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SKIP = new Set(['BRIDGE_RUN_LOCKED', 'BRIDGE_SLOT_ALREADY_COMPLETED', 'BRIDGE_REMOTE_CONFIG_REQUIRED']);

export async function claimApprovedEditorials({ session = null, root = ROOT, now = new Date().toISOString(), env = process.env } = {}) {
  let store;
  try { store = (session || bridgeSession(env)).store; }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message, changed: false }; throw error; }
  let acquired = false;
  try {
    await store.acquire(now, 'import', { manualRunId: `${env.GITHUB_RUN_ID || '0'}:${env.GITHUB_RUN_ATTEMPT || '1'}` });
    acquired = true;
  } catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message, changed: false }; throw error; }
  try {
    const result = await importApprovedEditorials(store, root);
    return { status: 'ok', changed: Boolean(result.changed), failed: result.failed || [] };
  } finally {
    if (acquired) await store.release(true).catch(() => {});
  }
}

export async function finalizeApprovedEditorials({ session = null, env = process.env } = {}) {
  let store;
  try { store = (session || bridgeSession(env)).store; }
  catch (error) { if (SKIP.has(error.message)) return { status: 'skipped', reason: error.message }; throw error; }
  if (typeof store.editorialFinalize !== 'function') return { status: 'skipped', reason: 'EDITORIAL_FINALIZE_UNAVAILABLE' };
  await store.editorialFinalize();
  return { status: 'ok' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv.includes('--finalize') ? 'finalize' : 'claim';
  try {
    const result = mode === 'finalize' ? await finalizeApprovedEditorials() : await claimApprovedEditorials();
    console.log(JSON.stringify({ mode, ...result }));
    if (process.env.GITHUB_OUTPUT && mode === 'claim') (await import('node:fs')).appendFileSync(process.env.GITHUB_OUTPUT, `changed=${Boolean(result.changed)}\n`);
  } catch (error) {
    // Eine gestörte private Redaktion darf den Nachrichtenlauf nie anhalten.
    console.error(JSON.stringify({ mode, status: 'failed', error: /^[A-Z_0-9:.-]+$/.test(error?.message || '') ? error.message : 'EDITORIAL_IMPORT_FAILED' }));
    process.exitCode = 0;
  }
}

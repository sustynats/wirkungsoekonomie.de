import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

// A failed refresh must leave the last validated source file available to the
// offline build. Validate the complete merge before atomically replacing it.
export async function loadSourceSnapshot({snapshotPath, apiUrl, refresh = false,
  validate, fetchImpl = fetch, logger = console}) {
  if (refresh) {
    let temporary;
    try {
      const response = await fetchImpl(apiUrl, {
        headers: {accept: 'application/json'}, signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const source = await response.json();
      if (!Array.isArray(source?.sources) || !source.sources.length) throw new Error('leere Antwort');
      const validated = await validate(source);
      fs.mkdirSync(path.dirname(snapshotPath), {recursive: true});
      temporary = `${snapshotPath}.${process.pid}-${randomUUID()}.tmp`;
      fs.writeFileSync(temporary, `${JSON.stringify(source, null, 2)}\n`, {flag: 'wx'});
      fs.renameSync(temporary, snapshotPath);
      logger.log(`[quellenarchiv] Geprüfter Snapshot aus API aktualisiert: ${source.sources.length} Quellen`);
      return validated;
    } catch (error) {
      logger.warn(`[quellenarchiv] API-Refresh fehlgeschlagen (${error.message}); nutze unveränderten Snapshot.`);
    } finally {
      if (temporary && fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }
  // The fallback must pass the same checks. Missing or invalid local data is a
  // real build failure, never permission to produce an empty source archive.
  return validate(JSON.parse(fs.readFileSync(snapshotPath, 'utf8')));
}

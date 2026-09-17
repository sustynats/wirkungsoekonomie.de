import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { reportFromRunLog, recoverUsageReport } from '../../scripts/news/recover-failed-usage.mjs';

const report = { schema_version:'1.2', started_at:'2026-09-06T17:21:35.447Z', completed_at:'2026-09-06T17:22:35.081Z', ai_calls:4, input_tokens:35899, output_tokens:4653, estimated_cost_usd:0.03473, published_stories:1, token_source:'provider_reported_usage' };
const workflow = { id:123, conclusion:'failure', created_at:'2026-09-06T17:20:30Z', updated_at:'2026-09-06T17:24:00Z',html_url:'https://github.com/example/actions/runs/123' };
test('failure checkpoint retains routing and editorial decisions alongside stories and usage', () => {
  const yaml=fs.readFileSync(new URL('../../.github/workflows/wirkungsticker.yml',import.meta.url),'utf8');
  const checkpoint=yaml.slice(yaml.indexOf('- name: Preserve failed-run work'));
  for(const file of ['stories.json','state.json','newsroom.json','usage.json','editorial-analyses.json']) assert.ok(checkpoint.includes(`data/news/${file}`));
  assert.ok(checkpoint.includes('retention-days: 3'));
  assert.ok(!checkpoint.includes('.env'));
});
test('failed run report is parsed as data; no unpublished article counts as live', () => {
  const log = JSON.stringify(report,null,2).split('\n').map(line => `update\tImport, analyze and build\t2026-09-06T17:22:36Z ${line}`).join('\n');
  assert.deepEqual(reportFromRunLog(log),report);
  const usage = { runs:[] };
  assert.equal(recoverUsageReport(usage,report,workflow,'2026-09-06T18:00:00Z'),true);
  assert.equal(usage.runs[0].counts.published_stories,0);
  assert.equal(usage.runs[0].ai.estimated_cost_usd,0.03473);
  assert.equal(recoverUsageReport(usage,report,workflow,'2026-09-06T18:01:00Z'),false);
  assert.equal(usage.runs.length,1);
  assert.equal(reportFromRunLog('job failed before analysis'),null);
});
test('already committed usage and a report from a different runner cannot be charged twice', () => {
  assert.equal(recoverUsageReport({runs:[{started_at:report.started_at}]},report,workflow,'now'),false);
  assert.throws(() => recoverUsageReport({runs:[]},report,{...workflow,created_at:'2026-09-07T00:00:00Z'},'now'),/BINDING_INVALID/);
  assert.throws(() => recoverUsageReport({runs:[]},report,{...workflow,conclusion:'success'},'now'),/BINDING_INVALID/);
});

// Natalie am 17.09.2026: „wir hatten gesagt, dass es Prozess ist, nur 1x die
// API bis hin zur Veröffentlichung hin zu benutzen." Gemessen waren es 263
// Aufrufe auf 171 Meldungen (1,54 je Meldung) - aber die Nutzungsakte hielt nur
// die Summe fest, sodass die Ursache nicht zu erkennen war. Ein zusaetzlicher
// Aufruf hat drei moegliche Gruende, und nur einer davon ist die verbotene
// Nachbesserung. Deshalb werden sie getrennt gebucht und dauerhaft aufbewahrt.
test('die Nutzungsakte trennt Anfrageversuch, Nachbesserung und gescheiterten Aufruf', () => {
  const quelle = fs.readFileSync('scripts/news/run.mjs', 'utf8');

  // In der Nutzungsakte, nicht nur im fluechtigen Lauf-Bericht.
  for (const feld of ['ai_request_attempts: Number(report.ai_request_attempts || 0)',
    'ai_repair_calls: Number(report.ai_repair_calls || 0)',
    'ai_failed_calls: Number(report.ai_failed_calls || 0)']) {
    assert.ok(quelle.includes(feld), `fehlt in der Nutzungsakte: ${feld}`);
  }

  // Getrennt gezaehlt: der Anfrageversuch erhoeht nicht den Nachbesserungszaehler.
  assert.match(quelle, /report\.ai_request_attempts = Number\(report\.ai_request_attempts \|\| 0\) \+ Number\(aiResult\.request_attempts \|\| 1\)/);
  assert.match(quelle, /report\.ai_repair_calls = Number\(report\.ai_repair_calls \|\| 0\) \+ Number\(aiResult\.repair_calls \|\| 0\)/);
  assert.match(quelle, /report\.ai_failed_calls = Number\(report\.ai_failed_calls \|\| 0\)/);

  // Die Summe bleibt die Summe: das Stundenkontingent zaehlt weiter alles Bezahlte.
  assert.match(quelle, /report\.ai_calls \+= Number\(aiResult\.request_attempts \|\| 1\) \+ Number\(aiResult\.repair_calls \|\| 0\)/);
});

// Das Kontingent darf eine schlechte Ausbeute nicht mit mehr bezahlten Aufrufen
// ausgleichen - das war die Begruendung fuer den Wert 6 und widerspricht der Regel.
test('das Stundenkontingent begruendet sich nicht mit der Ausbeute', () => {
  const quelle = fs.readFileSync('scripts/news/stundenkontingent.mjs', 'utf8');
  assert.ok(!/brauchen rund sechs Aufrufe/.test(quelle), 'die alte Begruendung ist entfernt');
  assert.match(quelle, /nur 1x die API/); // Natalies Regel steht als Begruendung im Modul
  assert.match(quelle, /Eine schlechte Ausbeute darf nicht mit mehr/);
});

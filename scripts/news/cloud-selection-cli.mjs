// Free snapshot export / free return validation through the existing runner.
// No articles, publication, LLM calls or activation from this entry point.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { runWirkungsticker } from './run.mjs';

process.env.WOEK_NEWS_AI_ENABLED = 'false';
process.env.WIRKUNGSTICKER_PROCESSING_MODE = 'api';
process.env.VISUAL_GENERATION_PROVIDER = 'higgsfield';
const [command, snapshotFile, resultFile] = process.argv.slice(2);
if (!['export', 'check'].includes(command) || !snapshotFile || command === 'check' && !resultFile)
  throw new Error('USAGE_cloud-selection-cli_export_snapshot_OR_check_snapshot_result');
const file = path.resolve(snapshotFile);
if (command === 'export' && fs.existsSync(file)) throw new Error('CLOUD_SNAPSHOT_ALREADY_EXISTS');
const snapshot = command === 'check' ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
const result = command === 'check' ? JSON.parse(fs.readFileSync(path.resolve(resultFile), 'utf8')) : null;
const previous = command === 'export' && resultFile ? JSON.parse(fs.readFileSync(path.resolve(resultFile), 'utf8')) : null;
let unchanged = false;
const report = await runWirkungsticker({
  dryRun: true, selectionOnly: command === 'export',
  selectionRunId: snapshot?.run_id || `selection-${randomUUID()}`,
  ...(snapshot ? { cloudSelection: { snapshot, result } } : {}),
  captureSelectionBaseline: value => !unchanged && fs.writeFileSync(file + '.baseline.json',
    JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 }),
  captureSelectionSnapshot: value => {
    // Clock/run changes alone must never create another model review.
    if (previous?.content_hash === value.content_hash) { unchanged = true; return; }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    // A private bounded data package, not a source archive or public content.
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  },
});
if (report.ai_calls || report.published_stories || report.updated_stories)
  throw new Error('CLOUD_TEST_MUST_BE_FREE_AND_UNPUBLISHED');
console.log(JSON.stringify(unchanged ? { ...report, status: 'unchanged_input_no_new_review',
  previous_snapshot: path.resolve(resultFile), note: 'Reuse only while fresh; expired selections are never paid fallback input.' } : report, null, 2));

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { publicScriptBody } from './lib/public-script.mjs';
const argument = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const app = argument('app-dir');
if (!app) throw new Error('Explicit --app-dir=<checked app checkout> required; a public hash alone cannot prove mirror parity.');
const master = path.resolve('content/studienskripte/v4');
const manifest = JSON.parse(fs.readFileSync(path.join(master, 'PUBLIC_MASTER_MANIFEST.json')));
const hash = s => createHash('sha256').update(s).digest('hex');
const records = [];
for (const record of manifest.lectures) {
  const publicSource = fs.readFileSync(path.join(master, record.public_path), 'utf8');
  const appSource = fs.readFileSync(path.join(app, record.source_path), 'utf8');
  if (hash(publicSource) !== record.public_sha256) throw new Error(`Public source hash drift: ${record.lecture_id}`);
  const publicBody = publicScriptBody(publicSource), appBody = publicScriptBody(appSource);
  if (appBody !== publicBody) throw new Error(`App/public text drift: ${record.lecture_id}`);
  records.push({ lecture_id: record.lecture_id, public_path: record.public_path, app_path: record.source_path, public_sha256: hash(publicSource), app_sha256: hash(appSource), public_body_sha256: hash(publicBody) });
}
const report = { date: '2026-10-15', status: 'PASS', scope: 'Exact normalized public-body equality; protected assessment sections intentionally excluded, not a full runtime or production approval.', count: records.length, records };
if (argument('report')) fs.writeFileSync(argument('report'), JSON.stringify(report, null, 2) + '\n');
console.log(`ACADEMY_ACTUAL_APP_MIRROR_PARITY=PASS (${records.length}/178 public bodies)`);

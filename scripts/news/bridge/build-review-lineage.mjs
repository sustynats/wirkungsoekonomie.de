import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { EditorialApiService } from './api-service.mjs';
import { legacyReviewLineage } from './legacy-review-lineage.mjs';

export async function buildReviewLineage(directory, database) {
  if (![directory,database].every(path.isAbsolute)) throw Error('API_EDITORIAL_LINEAGE_ABSOLUTE_PATH_REQUIRED');
  // GET-only use; no constructor/provider configuration and no execution path.
  const journal = Object.assign(Object.create(EditorialApiService.prototype),{directory,active:new Set()});
  const records = [];
  for (const file of await fs.readdir(directory)) {
    if (!/^[a-f0-9]{64}\.json$/.test(file)) continue;
    const {key,job_id,input_hash,kind,provider_called,pre_execution_rejected,parent_job_id} = await journal.get(file.slice(0,-5));
    records.push({key,job_id,input_hash,kind,provider_called,pre_execution_rejected,parent_job_id});
  }
  const db = new DatabaseSync(database,{readOnly:true});
  try {
    const select = db.prepare("SELECT json_extract(body,'$.input') AS input FROM jobs WHERE id=?");
    return legacyReviewLineage(records,id=>JSON.parse(select.get(id)?.input || 'null'));
  } finally { db.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), value = name => args.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
  const directory = value('--journal-directory'), database = value('--bridge-database');
  const result = await buildReviewLineage(directory,database);
  // Default is an audit. Write only a complete new index, never replace an
  // existing index or any journal. Rollout must stop the processor first.
  if (args.includes('--write') && result.unresolved.length === 0) {
    await fs.writeFile(path.join(directory,'review-lineage.json'),JSON.stringify(result)+'\n',{flag:'wx',mode:0o600});
  }
  console.log(JSON.stringify({status:result.unresolved.length ? 'UNRESOLVED' : 'READY',
    bound:Object.keys(result.bindings).length,unresolved:result.unresolved,written:args.includes('--write') && !result.unresolved.length}));
  if (result.unresolved.length) process.exitCode = 1;
}

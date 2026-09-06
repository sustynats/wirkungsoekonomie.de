// Prepare a NEW restored database; never replace the live database automatically.
// Must run with the service stopped. Keep the current database as the withdrawal
// authority, even if restoring an older backup. No identifiers are printed.
import { existsSync, statSync, copyFileSync, constants, chmodSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PollStore } from './store.mjs';

export function prepareRestore({backup,current,output,pepper,now=()=>Date.now()}) {
  const paths=[backup,current,output];
  if(paths.some(p=>typeof p!=='string'||!path.isAbsolute(p))||new Set(paths.map(p=>path.resolve(p))).size!==3)throw new Error('Three distinct absolute database paths are required.');
  if(existsSync(output))throw new Error('Restore output must not exist.');
  if(!existsSync(backup)||!existsSync(current))throw new Error('Backup and current withdrawal authority are required.');
  if(now()-statSync(backup).mtimeMs>8*86400000)throw new Error('Backup exceeds the retention window. Do not restore expired sensitive data.');
  let live,restored;
  try {
    live=new PollStore({path:current,pepper,now});
    const withdrawals=live.db.prepare('SELECT vote_id,withdrawn_at FROM vote_withdrawals').all();
    const retired=live.db.prepare('SELECT slug,retired_at FROM retired_slugs').all();
    copyFileSync(backup,output,constants.COPYFILE_EXCL);chmodSync(output,0o600);
    restored=new PollStore({path:output,pepper,now});
    restored.transaction(()=>{
      for(const row of retired){
        restored.db.prepare('DELETE FROM polls WHERE slug=?').run(row.slug);
        restored.db.prepare('INSERT OR IGNORE INTO retired_slugs VALUES (?,?)').run(row.slug,row.retired_at);
      }
      for(const row of withdrawals){
        restored.db.prepare('DELETE FROM votes WHERE id=?').run(row.vote_id);
        restored.db.prepare('INSERT OR IGNORE INTO vote_withdrawals VALUES (?,?)').run(row.vote_id,row.withdrawn_at);
      }
    });
    const expired=restored.purgeSensitiveData();
    if(restored.db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||restored.db.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Restore validation failed; do not promote output.');
    restored.db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    return {prepared:true,withdrawalsApplied:withdrawals.length,expired};
  } finally { restored?.close();live?.close(); }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [backup,output]=process.argv.slice(2);
  const result=prepareRestore({backup,output,current:process.env.POLLS_DATABASE_PATH,pepper:process.env.POLLS_TOKEN_PEPPER});
  console.log(JSON.stringify(result));
}

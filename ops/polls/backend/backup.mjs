import { mkdirSync,readdirSync,statSync,unlinkSync } from 'node:fs';
import path from 'node:path';
import { PollStore } from './store.mjs';

const directory=process.env.POLLS_BACKUP_DIRECTORY;
if(!directory||!path.isAbsolute(directory)||['/','/opt','/home','/tmp'].includes(directory))throw new Error('A dedicated absolute POLLS_BACKUP_DIRECTORY is required.');
mkdirSync(directory,{recursive:true,mode:0o700});
const store=new PollStore({path:process.env.POLLS_DATABASE_PATH||'./data/polls/polls.sqlite',pepper:process.env.POLLS_TOKEN_PEPPER});
try {
  store.purgeSensitiveData();
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  store.backup(path.join(directory,`polls-${stamp}.sqlite`));
  // Rotate only our own precisely named backup files, never another database.
  const cutoff=Date.now()-7*24*60*60*1000;
  let removed=0;
  for(const name of readdirSync(directory)){
    if(!/^polls-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.sqlite$/.test(name))continue;
    const file=path.join(directory,name),entry=statSync(file);
    if(entry.isFile()&&entry.mtimeMs<cutoff){unlinkSync(file);removed++;}
  }
  console.log(`Consistent poll backup created; ${removed} expired poll backups removed (7-day retention).`);
} finally {store.close();}

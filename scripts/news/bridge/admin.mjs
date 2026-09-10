import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
const exec = promisify(execFile), repo = 'sustynats/wirkungsoekonomie.de';
const action = process.argv[2];
if (!['DISCOVERY_NOW','IMPORT_NOW','SERVER_CYCLE_NOW'].includes(action)) throw Error('BRIDGE_ADMIN_ACTION_INVALID');
async function gh(args) { return (await exec('gh', args, { timeout: 60000, maxBuffer: 1000000 })).stdout.trim(); }
if (!process.argv.includes('--execute')) {
  await gh(['auth','status']);
  await gh(['workflow','run','wirkungsticker-bridge-manual.yml','--repo',repo,'--ref','main','-f',`action=${action}`]);
  console.log(`${action} submitted. https://github.com/${repo}/actions/workflows/wirkungsticker-bridge-manual.yml`);
} else {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.WIRKUNGSTICKER_PROCESSING_MODE !== 'dropbox_chatgpt_bridge') throw Error('BRIDGE_ADMIN_WORKFLOW_REQUIRED');
  async function phase(workflow) {
    const runs = JSON.parse(await gh(['run','list','--repo',repo,'--workflow',workflow,'--limit','30','--json','databaseId,status,url']));
    const active = runs.find(r => ['queued','in_progress','waiting','pending'].includes(r.status));
    if (active) throw Error(`409 RUN_ALREADY_ACTIVE ${active.url}`);
    const request = `bridge-${action.toLowerCase()}-${randomUUID()}`;
    await gh(['workflow','run',workflow,'--repo',repo,'--ref','main','-f',`request_id=${request}`]);
    let run;
    for (let attempt=0;attempt<24&&!run;attempt++) {
      if(attempt) await new Promise(resolve=>setTimeout(resolve,5000));
      run=JSON.parse(await gh(['run','list','--repo',repo,'--workflow',workflow,'--limit','30','--json','databaseId,displayTitle,url'])).find(r=>r.displayTitle===request);
    }
    if(!run) throw Error(`BRIDGE_DISPATCH_LOOKUP_PENDING:${request}`);
    console.log(run.url);
    const { stdout }=await exec('gh',['run','watch',String(run.databaseId),'--repo',repo,'--exit-status'],{timeout:3000000,maxBuffer:2000000});
    console.log(stdout.slice(-2000));
  }
  if(action!=='IMPORT_NOW')await phase('wirkungsticker-discovery.yml');
  if(action!=='DISCOVERY_NOW')await phase('wirkungsticker.yml');
}

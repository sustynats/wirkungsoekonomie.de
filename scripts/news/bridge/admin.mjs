import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { runAdminAction } from './admin-actions.mjs';
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
  await runAdminAction(action, {gh, repo, watch:async (id, repository) => {
    const {stdout}=await exec('gh',['run','watch',String(id),'--repo',repository,'--exit-status'],{timeout:3000000,maxBuffer:2000000});
    console.log(stdout.slice(-2000));
  }});
}

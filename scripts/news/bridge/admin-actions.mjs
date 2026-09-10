import { randomUUID } from 'node:crypto';

export async function runAdminAction(action, {gh, watch, log = console.log, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), repo = 'sustynats/wirkungsoekonomie.de'}) {
  if (!['DISCOVERY_NOW','IMPORT_NOW','SERVER_CYCLE_NOW'].includes(action)) throw Error('BRIDGE_ADMIN_ACTION_INVALID');
  const workflows = action === 'DISCOVERY_NOW' ? ['wirkungsticker-discovery.yml'] : action === 'IMPORT_NOW' ? ['wirkungsticker.yml'] : ['wirkungsticker-discovery.yml','wirkungsticker.yml'];
  for (const workflow of workflows) {
    const runs = JSON.parse(await gh(['run','list','--repo',repo,'--workflow',workflow,'--limit','30','--json','databaseId,status,url']));
    const active = runs.find(r => ['queued','in_progress','waiting','pending','requested'].includes(r.status));
    if (active) {
      const result = {status:'RUN_ALREADY_ACTIVE',action,workflow,url:active.url};
      log(JSON.stringify(result));
      return result; // Expected contention: no second writer and no failure mail.
    }
    const request = `bridge-${action.toLowerCase()}-${randomUUID()}`;
    await gh(['workflow','run',workflow,'--repo',repo,'--ref','main','-f',`request_id=${request}`]);
    let run;
    for (let attempt=0;attempt<24&&!run;attempt++) {
      if (attempt) await sleep(5000);
      run = JSON.parse(await gh(['run','list','--repo',repo,'--workflow',workflow,'--limit','30','--json','databaseId,displayTitle,url'])).find(r=>r.displayTitle===request);
    }
    if (!run) throw Error(`BRIDGE_DISPATCH_LOOKUP_PENDING:${request}`);
    log(run.url);
    await watch(run.databaseId, repo); // Actual worker failures remain failures.
  }
  return {status:'COMPLETED',action};
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('intake dedupe stays within a 64 MiB heap with 100 MiB of unrelated private manuscripts',()=>{
 const moduleUrl=new URL('../../scripts/news/bridge/intake-news.mjs',import.meta.url).href;
 const script=`
 import {DatabaseSync} from 'node:sqlite';
 import {existingIntakeNewsJob} from ${JSON.stringify(moduleUrl)};
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE jobs (id TEXT PRIMARY KEY, body TEXT NOT NULL)');
 const insert=db.prepare('INSERT INTO jobs VALUES (?,?)');
 const large='x'.repeat(1024*1024);
 for(let i=0;i<100;i++)insert.run('old-'+i,JSON.stringify({input:{job_type:'new_story'},candidate:{event_id:'old-'+i,sources:[]},staging:{manuscript:large}}));
 insert.run('private',JSON.stringify({input:{job_type:'new_story'},intake_news_parent:'parent',candidate:{event_id:'target',sources:[]}}));
 insert.run('correct',JSON.stringify({input:{job_type:'new_story'},candidate:{event_id:'target',sources:[]}}));
 if(existingIntakeNewsJob({db},{event_id:'target',sources:[]})!=='correct')process.exit(2);
 if(existingIntakeNewsJob({db},{event_id:'missing',sources:[]})!==null)process.exit(3);
 db.close();console.log('PASS');
 `;
 const result=spawnSync(process.execPath,['--max-old-space-size=64','--input-type=module','-e',script],{encoding:'utf8',timeout:30000,maxBuffer:100000});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/PASS/);
});

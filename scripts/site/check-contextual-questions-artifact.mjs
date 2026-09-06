import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadExperience} from '../polls/visual.mjs';
import {assertPollScriptPolicy} from '../polls/privacy.mjs';
const source='assets/js/contextual-questions.js';
assert.equal(fs.readFileSync(`_site/${source}`,'utf8'),fs.readFileSync(source,'utf8'),'Fragenmodul muss vollständig und aktuell im öffentlichen Artefakt liegen.');
const main=fs.readFileSync('_site/assets/js/main.js','utf8');
assert.ok(main.includes('contextual-questions.js'));
assert.ok(!main.includes('Passende Fragen zum Begriff'));
const catalog=JSON.parse(fs.readFileSync('content/polls/public-catalog.json','utf8'));
const index=fs.readFileSync('_site/umfragen/index.html','utf8');
assert.match(index,/assets\/js\/main\.js\?v=[a-f0-9]{12}/);
for(const poll of catalog.polls){
  const html=fs.readFileSync(`_site/umfragen/${poll.slug}/index.html`,'utf8');
  const experience=loadExperience(process.cwd(),poll.slug);
  if(experience)assert.ok(poll.consent_required,'Sensitive visual poll must require explicit consent.');
  assertPollScriptPolicy(html,{sensitive:Boolean(experience)});
  assert.match(html,/data-poll-results-visibility=/);
}
console.log('Seitenfragen: Modul, Integration und Cache-Schlüssel im öffentlichen Artefakt geprüft.');

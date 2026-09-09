import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { dimensionTendencies, renderDimensionMeters, renderTendency, DIMENSION_TENDENCY_RULE } from '../../scripts/news/visuals.mjs';
import { renderStoryVisual } from '../../scripts/news/story-visual.mjs';
import { buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { storyCard, storyPage } from '../../scripts/news/build.mjs';
import { sanitizeAnalysisVisuals } from '../../scripts/news/run.mjs';
import { dimensionAssessment } from '../../scripts/news/direction-assessment.mjs';

const mpd = () => Object.fromEntries(['human','planet','democracy'].map(key=>[key,{relevance:'hoch',rationale:'Der konkrete Wirkmechanismus bleibt zu prüfen.'}]));
const statuses = html => [...html.matchAll(/class="(?:wt-tendency [^"]+|wt-dim__separate-label)" data-direction="([^"]+)"/g)].map(match=>match[1]);
const mixedPaths = () => ({ positive_path: { mechanism: 'Zusätzliche Beratung erleichtert den Zugang zu Hilfe.', source_ids: ['test'] }, negative_path: { mechanism: 'Gleichzeitiger Mittelentzug verkürzt die Öffnungszeiten.', source_ids: ['test'] } });

test('all four directions are legible text and distinct icons, not bar colors or a hover-only hint',()=>{
  for (const [value,direction,label,icon] of [
    ['chance','positive','Positiv','tendenz-chance'],['risiko','negative','Negativ','tendenz-risiko'],
    ['gemischt','mixed','Gegenläufige Wirkpfade','tendenz-gemischt'],['offen','open','Wirkungsrichtung unklar','offen'],
  ]) {
    const html=renderTendency(value);
    assert.match(html,new RegExp(`data-direction="${direction}"`));
    assert.match(html,new RegExp(`<strong>${label}</strong>`));
    assert.ok(html.includes(`#wt-i-${icon}`));
  }
  assert.match(renderTendency('chance'),/Potenzial/);
  assert.match(renderTendency('risiko'),/Risiko/);
});

test('historical tendencies are reused, never guessed from relevance, headlines, or risk words',()=>{
  const analysis={...mpd(),analysis_type:'ex_ante',visuals:{tendency:{human:'chance',planet:'risiko',democracy:'gemischt'}}};
  const before=JSON.stringify(analysis);
  assert.deepEqual(dimensionTendencies(analysis),{human:'chance',planet:'risiko',democracy:'gemischt'});
  assert.deepEqual(statuses(renderDimensionMeters(analysis)),['not_aggregated','not_aggregated','open']);
  assert.match(renderDimensionMeters(analysis), /Keine belastbare Gesamtbilanz/);
  assert.equal(JSON.stringify(analysis),before);
  delete analysis.visuals;
  analysis.human.rationale='Negativ bewertetes Ereignis, ohne eigenen Tendenzbefund.';
  assert.deepEqual(dimensionTendencies(analysis),{human:'offen',planet:'offen',democracy:'offen'});
  assert.deepEqual(statuses(renderDimensionMeters(analysis)),['open','open','open']);
});

test('current base assessments take precedence over legacy visuals, including an explicit open result',()=>{
  const analysis={...mpd(),analysis_type:'ex_ante',visuals:{tendency:{human:'chance',planet:'chance',democracy:'chance'}}};
  analysis.human.tendency='offen';analysis.planet.tendency='risiko';analysis.democracy.tendency='gemischt';
  Object.assign(analysis.democracy, mixedPaths());
  assert.deepEqual(statuses(renderDimensionMeters(analysis,{tendency:analysis.visuals.tendency})),['open','not_aggregated','not_aggregated']);
  analysis.visuals=null;
  assert.deepEqual(statuses(renderDimensionMeters(analysis)),['open','not_aggregated','not_aggregated']);
});

test('invalid directions stay open and cannot inject content or inherit object prototypes',()=>{
  for(const value of ['__proto__','constructor','<script>alert(1)</script>',null,5,{},'neutral']) {
    const analysis={...mpd(),human:{...mpd().human,tendency:value}};
    assert.equal(dimensionTendencies(analysis).human,'offen');
    const html=renderDimensionMeters(analysis);
    assert.deepEqual(statuses(html),['open','open','open']);
    assert.doesNotMatch(html,/<script>|data-direction="neutral"/);
  }
});

test('new prompts always include base tendencies, even when optional visuals are deferred',()=>{
  for (const includeVisuals of [true,false]) {
    const prompt=buildAnalysisPrompt([{story_id:'wt-test',title:'Eine neue Entscheidung',sources:[],claims:[]}],{includeVisuals});
    assert.ok(prompt.includes(DIMENSION_TENDENCY_RULE));
    assert.equal((prompt.match(/"tendency":/g)||[]).length,1, 'one shared MPD schema avoids three paid copies');
    assert.equal((prompt.match(/"\$ref":"#\/\$defs\/mpd"/g)||[]).length,3);
    if(!includeVisuals) assert.ok(prompt.includes('"visuals":null'));
  }
});

test('the publishing sanitizer preserves base directions without optional visuals',()=>{
  const analysis={...mpd(),visuals:null};
  analysis.human.tendency='chance';analysis.planet.tendency='risiko';analysis.democracy.tendency='gemischt';
  const sanitized=sanitizeAnalysisVisuals(analysis,{story_id:'wt-test',sources:[],claims:[]});
  assert.equal(sanitized.visuals,null);
  assert.deepEqual(dimensionTendencies(sanitized),{human:'chance',planet:'risiko',democracy:'gemischt'});
});

test('retroactive rendering covers every published story without rewriting stored judgments or versions',()=>{
  const store=JSON.parse(fs.readFileSync(new URL('../../data/news/stories.json',import.meta.url)));
  for(const story of store.stories.filter(story=>story.published&&story.listed!==false)) {
    const before=JSON.stringify(story);
    for(const detail of [false,true]) {
      const html=renderStoryVisual(story,{detail});
      assert.equal(statuses(html).length,3,story.slug);
      assert.deepEqual(statuses(html),['human','planet','democracy'].map(key=>story.analysis[key]?.tendency === 'gemischt' || dimensionAssessment(story.analysis,key).status === 'unscoped' ? 'not_aggregated' : ({chance:'positive',risiko:'negative',gemischt:'mixed',offen:'open'}[dimensionAssessment(story.analysis,key).tendency])));
      assert.match(html,/Relevanz &amp; Wirkungspotenzial/);
      assert.match(html,/Potenzial ist noch keine eingetretene Wirkung/);
    }
    assert.equal(JSON.stringify(story),before,story.slug);
  }
});

test('list and both detail MPD sections show the same available finding without changing the article',()=>{
  const stories=JSON.parse(fs.readFileSync(new URL('../../data/news/stories.json',import.meta.url))).stories;
  const story=structuredClone(stories.find(story=>story.published&&story.listed!==false));
  // The rendering shell may come from a real article, the judgment fixture may
  // not: a new live article must not silently change this test's assumptions.
  story.analysis.direction_assessment_version='1.1';
  story.analysis.assessment_frame={subject:'Geprüfte Änderungen der Beratungsversorgung.',baseline:'Unveränderte Versorgung ohne diese beiden Maßnahmen.'};
  for (const key of ['human','planet','democracy']) story.analysis[key]={...mpd()[key],direction_basis:'assessed',positive_path:null,negative_path:null};
  for(const [key,tendency] of Object.entries({human:'chance',planet:'risiko',democracy:'gemischt'})) story.analysis[key].tendency=tendency;
  Object.assign(story.analysis.democracy, mixedPaths());
  for (const path of [story.analysis.democracy.positive_path,story.analysis.democracy.negative_path]) Object.assign(path,{effect_type:'independent_change',reference:'assessment_baseline'});
  const before=JSON.stringify(story);
  assert.deepEqual(statuses(storyCard(story,0)),['positive','negative','not_aggregated']);
  assert.deepEqual(statuses(storyPage(story)),['positive','negative','not_aggregated','positive','negative','not_aggregated']);
  assert.equal(JSON.stringify(story),before);
});

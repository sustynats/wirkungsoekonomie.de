import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateNeukoellnDuplicates, retainedNeukoellnPaidInput } from '../../scripts/news/consolidate-neukoelln-duplicates.mjs';
import { clusterItems } from '../../scripts/news/lib.mjs';
import { duplicateGroups, subjectConflict } from '../../scripts/news/living-files.mjs';
import { renderConsolidations, retiredStoryPage, storyPage } from '../../scripts/news/build.mjs';
import { runWirkungsticker } from '../../scripts/news/run.mjs';

// Public source identity only. All manuscript, assessment and receipt values
// below are synthetic; no private/paid manuscript is a fixture.
const bindings = [
  {
    "id": "wt-d9a097da62f6699b",
    "event": "event-0493619e207611e60822",
    "slug": "messerangriff-vor-einer-bar-in-berlin-neukolln-zwei-verletzte-in-der-pannierstrasse-tate-f6699b",
    "at": "2026-10-24T10:36:55.302Z",
    "content": "a8569f8d24bd77195f9b054fa971ad58ce24345fd8ebfc9de36db08d407ac8b4",
    "sources": [
      [
        "https://www.tagesspiegel.de/berlin/dpa-zwei-verletzte-in-der-pannierstrasse--tater-geflohen-16197031.html",
        "f0e7c2b6d04d1613933cfaf43704c286858bec765ef255b5586c32f9ea20aefa"
      ],
      [
        "https://www.tagesspiegel.de/berlin/dpa-drei-verletzte-in-der-pannierstrasse--polizei-sucht-tater-16197031.html",
        "f28075d2cbe169b3ddbaca7a8ea4208c7cc0b1ff5959a8875e7f71497539a5e3"
      ]
    ]
  },
  {
    "id": "wt-80497942dbedf5d8",
    "event": "event-625ad1a6b2aa1ff958d4",
    "slug": "angriff-vor-bar-messerangriff-in-neukollner-pannierstrasse-zwei-verletzte-edf5d8",
    "at": "2026-10-24T10:38:00.025Z",
    "content": "e7609b59820021497aa83bb5f2fd9ae0ed16f30f7788b42c12e1665a20905510",
    "sources": [
      [
        "https://www.stern.de/gesellschaft/regional/berlin-brandenburg/angriff-vor-bar--messerangriff-in-neukoellner-pannierstrasse---zwei-verletzte-38445606.html",
        "47a6bfe1394cab737369b3bd09bfe820162cc03b6eb35e4dbf2f131b2aeb55e6"
      ],
      [
        "https://www.tagesspiegel.de/berlin/dpa-angriff-vor-bar-messerangriff-in-neukollner-pannierstrasse-zwei-verletzte-16197031.html",
        "b034c194e5eb2dac6c8d6464027651358e0d1907bf5597ba6e5356e1c5af0ef3"
      ],
      [
        "https://www.tagesspiegel.de/berlin/dpa-drei-verletzte-in-der-pannierstrasse--polizei-sucht-tater-16197031.html",
        "f28075d2cbe169b3ddbaca7a8ea4208c7cc0b1ff5959a8875e7f71497539a5e3"
      ]
    ]
  }
];
const at = '2026-10-24T11:00:00.000Z';
const [canonicalId, duplicateId] = bindings.map(b => b.id);
function fixture() {
  return bindings.map((b, i) => {
    const place = i ? 'Neukölln' : 'Berlin-Neukölln';
    return { story_id: b.id, event_id: b.event, slug: b.slug, published_at: b.at,
      updated_at: b.at, last_updated: b.at, first_seen: b.at, content_hash: b.content,
      title: `Messerangriff vor einer Bar in ${place}`, topic: ['Test'],
      published: true, listed: true, current_version: 1,
      sources: b.sources.map(([url, content_hash], index) => ({
        source_id: url.includes('stern.de') ? 'stern-schlagzeilen' : 'tagesspiegel-home',
        publisher: 'Synthetic publisher', url, content_hash,
        title: index === b.sources.length - 1 ? 'Messerangriff vor einer Bar' : `Messerangriff vor einer Bar in ${place}`,
        summary: 'Synthetischer Quellauszug ohne neue Tatsachen.',
        published_at: '2026-10-24T09:29:14.000Z',
        source_published_at: '2026-10-24T09:29:14.000Z',
        source_role: 'journalistic_report',
      })),
      source_summary: `Synthetischer Beleg in ${place}.`,
      analysis: { summary: 'Synthetic retained analysis.', why_relevant: 'Synthetic relevance.',
        analysis_type: 'ex_ante', status: 'laufende Entwicklung', importance: 'gering',
        human: {relevance:'gering', rationale:'Synthetic.'},
        planet: {relevance:'gering', rationale:'Synthetic.'},
        democracy: {relevance:'gering', rationale:'Synthetic.'},
        mechanisms:[], first_order:[], second_order:[], third_order:[], impact_risks:[],
        side_effects:[], uncertainties:[], reference_frameworks:[], watch_next:[] },
      claims: [], versions: [{version:1, analyzed_at:b.at}],
      original_potential_assessment: {marker:'original'},
      current_potential_assessment: {marker:'current'}, observed_effects:[{marker:'observed'}],
      publication_history:[{at:b.at}], ai_retry:{fingerprint:'paid-receipt'},
      ai_retry_history:[{fingerprint:'older-receipt'}], title_image:{marker:'retained-image'},
      unknown_retained_field:{marker:'preserve'},
    };
  });
}
const candidateFor = pair => ({story_id:canonicalId, existing_story:pair[0],
  sources:[...new Map(pair.flatMap(s => s.sources).map(s => [s.url,structuredClone(s)])).values()]});

test('the source-bound pair does not weaken the general conflicting-place guard', () => {
  const pair = fixture();
  assert.equal(subjectConflict(...pair), true);
  assert.deepEqual(duplicateGroups(pair), []);
  const unrelated = fixture(); unrelated[1].story_id = 'unrelated-neukoelln';
  assert.equal(consolidateNeukoellnDuplicates(unrelated,at).status,'not_present');
  assert.equal(subjectConflict(...unrelated),true);
});

test('only exact editions route once and every previous field except listed survives unchanged', () => {
  for (const reverse of [false,true]) {
    const pair=fixture(), before=structuredClone(pair);
    assert.equal(consolidateNeukoellnDuplicates(reverse?[...pair].reverse():pair,at).status,'applied');
    assert.equal(pair.filter(s=>s.listed!==false).length,1);
    for (const [i,s] of pair.entries()) for (const key of Object.keys(before[i])) {
      if (key!=='listed') assert.deepEqual(s[key],before[i][key],key);
    }
    assert.equal(pair[0].pending_update,undefined);
    const applied=structuredClone(pair);
    assert.equal(consolidateNeukoellnDuplicates(pair,'2026-10-24T11:10:00Z').status,'already_applied');
    assert.deepEqual(pair,applied);
  }
});

for (const change of [
  p=>{p[0].content_hash='changed';}, p=>{p[1].event_id='changed';},
  p=>{p[0].current_version=2;}, p=>{p[1].slug+='-changed';},
  p=>{p[0].published_at=at;}, p=>{p[1].updated_at=at;},
  p=>{p[0].sources[0].content_hash='changed';}, p=>{p[1].sources[0].url='https://example.org/new';},
  p=>{p[0].sources.push({url:'https://example.org/new'});}, p=>{p[1].sources=[null];},
  p=>{p[0].published=false;}, p=>{p[1].manual_only=true;},
  p=>{p[0].editorial_approval_hash='personal-edition';}, p=>{p[1].listed=false;},
  p=>{p[0].pending_update={reason:'AI_HOURLY_CALL_LIMIT'};},
  p=>{p[1].pending_update={reason:'QUALITY_GATE_FAILED'};},
  p=>{p[0].living_file={merged_story_ids:['unreviewed']};},
  p=>{p[1].retirement={reason_code:'OTHER'};},
]) test('changed editions, personal approval, pending work and unknown routes hold atomically',()=>{
  const pair=fixture(); change(pair); const before=structuredClone(pair);
  assert.equal(consolidateNeukoellnDuplicates(pair,at).status,'held');
  assert.deepEqual(pair,before);
});

test('missing/ambiguous IDs and invalid/premature times cannot mutate data',()=>{
  for(const pair of [[],[fixture()[0]]]) assert.equal(consolidateNeukoellnDuplicates(pair,at).status,'not_present');
  const pair=fixture(); pair.push(structuredClone(pair[1])); const before=structuredClone(pair);
  assert.equal(consolidateNeukoellnDuplicates(pair,at).reason,'STORY_ID_AMBIGUOUS');
  assert.deepEqual(pair,before);
  assert.throws(()=>consolidateNeukoellnDuplicates(fixture(),'invalid'),/INVALID_CONSOLIDATION_TIME/);
  assert.equal(consolidateNeukoellnDuplicates(fixture(),'2026-10-24T10:37:00Z').status,'held');
});

test('all retained publisher URLs route to the earlier file without buying a replacement',()=>{
  const pair=fixture(); consolidateNeukoellnDuplicates(pair,at);
  for(const source of pair.flatMap(s=>s.sources)) {
    const [candidate]=clusterItems([source],pair,at);
    assert.equal(candidate.story_id,canonicalId,source.url);
  }
  const candidate=candidateFor(pair);
  assert.equal(retainedNeukoellnPaidInput(candidate,pair),true);
  for(const source of candidate.sources) {source.published_at=at;source.source_published_at=at;}
  assert.equal(retainedNeukoellnPaidInput(candidate,pair),true,'a feed timestamp is not new evidence');
  assert.ok(renderConsolidations(pair[0],new Set(pair.map(s=>s.slug))).includes(pair[1].slug));
});

for(const change of [
  c=>{c.sources[0].content_hash='changed';}, c=>{c.sources[0].summary+=' changed';},
  c=>{c.sources[0].title+=' changed';}, c=>{c.sources[0].provenance={origin:'changed'};},
  c=>{c.sources[0].article_excerpt='new evidence';}, c=>{c.sources[0].evidence_segments=['new'];},
  c=>{c.sources.push({url:'https://example.org/new'});},
  c=>{c.reassessment=true;}, c=>{c.impact_reassessment=true;}, c=>{c.followup_due=true;},
  c=>{c.deepening_due=true;}, c=>{c.consolidation=true;},
  c=>{c.existing_story.pending_update={reason:'OPEN_REVIEW',untouched:true};},
]) test('new evidence and explicit/pending reviews keep their ordinary gates',()=>{
  const pair=fixture(); consolidateNeukoellnDuplicates(pair,at);
  const candidate=candidateFor(pair); change(candidate); const before=structuredClone(pair);
  assert.equal(retainedNeukoellnPaidInput(candidate,pair),false);
  assert.deepEqual(pair,before);
});

test('the archived reader retains its whole original main plus a transparent notice',()=>{
  const pair=fixture(), before=storyPage(pair[1]);
  assert.equal(consolidateNeukoellnDuplicates(pair,at).status,'applied');
  const preserved=structuredClone(pair[1]), after=retiredStoryPage(pair[1]);
  const main=html=>html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(main(after).replace(/<aside\b[^>]*data-merged-publication-notice[\s\S]*?<\/aside>/,''),main(before));
  assert.match(after,/name="robots" content="noindex,follow"/);
  assert.ok(after.includes(`href="../${pair[0].slug}/"`));
  assert.deepEqual(pair[1],preserved);
});

test('the normal serial runner routes idempotently with no provider or replacement edition',async()=>{
  let captured,calls=0;
  const initial=fixture();
  const options={dryRun:true,now:at,registry:{schema_version:'1.0',sources:[],policy:{}},
    state:{source_status:{},seen_items:{},pending_story_ids:[],relevance_filter_version:'4.0'},
    storyStore:{stories:initial},usage:{runs:[]},
    newsroom:{source_items:{},events:{},event_sources:[],discovery_candidates:[]},
    budgetFx:{rate_date:'2026-10-24',rate_usd_per_eur:1.16},
    callAiImpl:async()=>{calls++;throw Error('No paid replacement');},
    fetchArticleImpl:async()=>{throw Error('No live source fetch');},captureState:v=>{captured=v;}};
  const first=await runWirkungsticker(options);
  assert.equal(first.neukoelln_duplicate_consolidation.status,'applied');
  assert.equal(first.retired_stories,1);assert.equal(first.public_changed,true);
  assert.equal(first.published_stories,0);assert.equal(first.updated_stories,0);
  assert.equal(calls,0);assert.deepEqual(options.storyStore.stories,initial);
  const second=await runWirkungsticker({...options,...captured});
  assert.equal(second.neukoelln_duplicate_consolidation.status,'already_applied');
  assert.equal(second.retired_stories,0);assert.equal(second.public_changed,false);assert.equal(calls,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { preAnalyzeStory, clusterItems, claimLedgerFor, parseFeed, buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { evidenceGroups, eventCompatibility } from '../../scripts/news/newsroom.mjs';
import { scoreEvent, balanceEventQueue, updateEventLifecycle, EVENT_RELEVANCE_VERSION, EVENT_EDITORIAL_POLICY_VERSION, needsEventPolicyReview } from '../../scripts/news/event-relevance.mjs';
import { coverageAudit, observedMajorEvents, missedNewsRechecks } from '../../scripts/news/coverage-audit.mjs';
import { agendaSignal, extractDiscoveryMetadata, runActiveDiscovery, DISCOVERY_LIMITS } from '../../scripts/news/active-discovery.mjs';
import { normalizeNewsRegistry, registryErrors } from '../../scripts/news/registry.mjs';
import { runWirkungsticker, partitionAiQueue, unchangedRankingBackfill } from '../../scripts/news/run.mjs';
import { auditDay, auditMarkdown } from '../../scripts/news/audit-events.mjs';
import { duplicateGroups, mergeLivingFiles, isMerged, mergedStoryTargetValid } from '../../scripts/news/living-files.mjs';
import { structuredEventIdentity } from '../../scripts/news/event-identity.mjs';

const now = '2026-09-09T15:00:00.000Z';
const borderSources = () => [
  {title:'A861 bei Rheinfelden: Grenzübergang zur Schweiz wegen Sprengstoffverdachts gesperrt',summary:'In Rheinfelden an der Grenze zur Schweiz findet ein Polizeieinsatz statt. Autofahrer können die Landesgrenze derzeit nicht überqueren.'},
  {title:'Notfälle: Grenze zur Schweiz dicht: Polizei prüft Auto auf Sprengstoff',summary:'Die Autobahn 861 an der Schweizer Grenze ist bei Rheinfelden aktuell gesperrt. Die Polizei untersucht am Grenzübergang ein Auto auf Sprengstoff.'},
  {title:'Wohl zwei Männer nach Sprengstofffund an Schweizer Grenze festgenommen - Autobahnen bei Rheinfelden gesperrt',summary:'Der Grenzübergang zur Schweiz in Rheinfelden ist aktuell in beide Richtungen gesperrt, die Bundespolizei ist im Einsatz. Bei einer Kontrolle schlugen Sprengstoff-Suchhunde an.'},
].map((source,i)=>({...source,source_id:`border-source-${i}`,item_id:`border-item-${i}`,published_at:'2026-09-09T14:00:00Z',url:`https://example.org/border-${i}`}));

test('actual border reports share a place-event-day identity; country, topic and word overlap alone do not',()=>{
  const sources=borderSources();
  assert.equal(new Set(sources.map(source=>structuredEventIdentity(source)?.key)).size,1);
  assert.equal(clusterItems(sources,[],now).length,1);
  const a=sources[0], b=sources[1];
  for(const wrong of [
    {...b,summary:b.summary.replace('Rheinfelden','Konstanz')},
    {...b,summary:b.summary.replace('861','862')},
    {...b,published_at:'2026-09-10T14:00:00Z'},
    {...b,published_at:'2026-09-09T21:00:00Z'},
    {...b,title:`Rückblick: ${b.title}`},
    {...b,title:`Zweiter Vorfall: ${b.title}`},
    {...b,summary:'Am Grenzübergang ist alles gesperrt. Ein Auto wird auf Sprengstoff geprüft.'},
    {...b,summary:`${b.summary} Auch in Konstanz gab es einen Einsatz.`},
  ]) assert.equal(eventCompatibility(a,wrong).same_event,false,JSON.stringify(wrong));
  const elsewhere=sources.map(source=>({...source,title:source.title.replaceAll('Rheinfelden','Kehl'),summary:source.summary.replaceAll('Rheinfelden','Kehl')}));
  assert.equal(clusterItems(elsewhere,[],now).length,1,'generic place extraction, no city whitelist');
});

test('existing unpublished fragments consolidate before paid selection, preserving all original records',()=>{
  const drafts=borderSources().map((source,i)=>({story_id:`draft-${i}`,title:source.title,sources:[source],published:false,first_seen:source.published_at,last_updated:source.published_at,versions:[]}));
  const original=structuredClone(drafts);
  const groups=duplicateGroups(drafts);
  assert.equal(groups.length,1);assert.equal(groups[0].duplicate_ids.length,2);
  assert.equal(mergeLivingFiles(drafts,groups,now).length,2);
  const canonical=drafts.find(draft=>!isMerged(draft));
  assert.equal(canonical.pending_update.sources.length,3);assert.equal(canonical.published,false);
  const byId=new Map(drafts.map(draft=>[draft.story_id,draft]));
  const alias=drafts.find(isMerged);
  assert.equal(mergedStoryTargetValid(alias,byId),true);
  assert.equal(mergedStoryTargetValid({...alias,published:true},byId),false,'public pages cannot point to drafts');
  assert.equal(mergedStoryTargetValid({...alias,retirement:{...alias.retirement,unpublished_queue:undefined}},byId),false);
  assert.equal(mergedStoryTargetValid(alias,new Map()),false,'no dangling alias');
  assert.equal(mergedStoryTargetValid({...alias,retirement:{...alias.retirement,canonical_story_ids:[alias.story_id]}},byId),false,'no cycle');
  for(const draft of drafts) assert.deepEqual(draft.sources,original.find(old=>old.story_id===draft.story_id).sources);
  assert.equal(clusterItems(borderSources(),drafts,now).length,1);
  assert.equal(mergeLivingFiles(drafts,duplicateGroups(drafts),now).length,0,'idempotent');
  const stale=structuredClone(original);stale[1].published=true;
  assert.equal(mergeLivingFiles(stale,groups,now).some(change=>change.story_id==='draft-1'),false,'stale draft-only plan cannot retire a publication');
});
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/event-relevance-20260909.json', import.meta.url)));
const source = { source_id:'test', publisher_id:'test', name:'Test', url:'https://example.org/', feed_url:'https://example.org/rss', source_type:'official_rss', primary_source:true, enabled:true, access:{status:'public', article:'bounded_public_text', cost_usd:0} };
const item = (fields={}) => ({ source_id:'test', publisher_id:'test', url:'https://example.org/item', published_at:'2026-09-09T14:30:00Z', first_seen_at:'2026-09-09T12:00:00Z', primary_source:true, title:'Generaldebatte im Bundestag', summary:'Der Kanzler diskutiert Haushaltsprioritäten mit der Opposition.', ...fields });
const story = sources => ({story_id:'wt-test',title:sources[0].title,sources});
const candidate = (id,priority,category,score=60) => ({story_id:id,preanalysis:{internal_relevance_score:score,event_score:{priority,category}}});

test('September 9: all twelve event types reach review, not automatic publication', () => {
  for (const row of fixture.cases) {
    const result = preAnalyzeStory(story([item({...row, primary_source:false})]),now);
    assert.ok(result.internal_relevance_score >= 30, `${row.id}: ${result.internal_relevance_score}`);
    assert.ok(result.event_score.signals.length, row.id);
    assert.equal(result.event_score.score_scope,'editorial_review_priority_not_truth_or_MPD_direction');
  }
  for (const title of ['Kaufberatung: die besten Smartphones', 'Horoskop für heute', 'Minister eröffnet Fest mit Grußwort']) {
    assert.ok(preAnalyzeStory(story([item({title,summary:'',primary_source:false})]),now).internal_relevance_score < 30,title);
  }
});
test('fifteen differently titled reports of one institution/proceeding/day form one candidate', () => {
  const reports=Array.from({length:15},(_,i)=>item({url:`https://example.org/${i}`,title:`Generaldebatte im Bundestag: Debattenbeitrag Nummer ${i}`}));
  assert.equal(clusterItems(reports,[],now).length,1);
  const tomorrow=item({published_at:'2026-09-10T14:30:00Z'});
  assert.equal(eventCompatibility(reports[0],tomorrow).same_event,false);
  const audit=item({title:'Studie über politische Debattenkultur',summary:'Meta-Analyse verschiedener Sitzungen im Bundestag.'});
  assert.equal(eventCompatibility(reports[0],audit).same_event,false);
});
test('publisher/agency ownership, not fifteen document URLs, determines possible origins',()=>{
  const same=Array.from({length:15},(_,i)=>item({source_id:`edition-${i}`,publisher_id:`paper-${i}`,publisher_group_id:'reviewed-owner',title:`Beitrag ${i}`,summary:'',url:`https://example.org/${i}`}));
  assert.equal(evidenceGroups(same).possible_independent_origins,1);
  const agency=same.map(({publisher_group_id,...s})=>({...s,provenance:{origin:'agency:dpa'}}));
  assert.equal(evidenceGroups(agency).possible_independent_origins,1);
  assert.equal(scoreEvent(story(same),now).independence_verified,false);
});
test('acute local safety and border disruption can be TOP with one primary source',()=>{
  for(const title of ['Polizei bestätigt Messerangriff im Supermarkt: Verletzte', 'Sprengstoffverdacht: Grenzübergang durch Polizei gesperrt']){
    const score=scoreEvent(story([item({title,summary:''})]),now);
    assert.equal(score.priority,'TOP');assert.equal(score.breaking_status,'breaking');assert.equal(score.independent_source_count,1);
    assert.equal(score.confidence_score,70);
  }
});
test('new articles about old crimes or commentary do not gain a false breaking boost',()=>{
  const court=scoreEvent(story([item({title:'Messerattacke auf Vater: Angeklagter gesteht vor Gericht',summary:'Der Prozess beginnt nach dem tödlichen Angriff.'})]),now);
  assert.notEqual(court.breaking_status,'breaking');assert.notEqual(court.priority,'TOP');
  const opinion=preAnalyzeStory(story([item({title:'Kommentar zur Generaldebatte im Bundestag',summary:'Meine Meinung zum Auftritt der Opposition.'})]),now);
  assert.ok(opinion.internal_relevance_score<30);
});
test('party/name/outlet swaps do not alter relevance or create MPD judgments',()=>{
  const values=['Alpha','Beta','Gamma'].map(name=>scoreEvent(story([item({title:`Ministerpräsident ${name} lehnt Parteiverbot ab`,summary:'Er will eine andere Strategie zum Verbotsverfahren.',publisher_id:name})]),now));
  assert.equal(new Set(values.map(value=>value.total_relevance_score)).size,1);
  assert.ok(values.every(value=>!value.human && !value.democracy));
});
test('soft balancing helps economy but never displaces TOP, including older-work reserve',()=>{
  const candidates=[candidate('politics','HIGH','politics_de',62),candidate('economy','HIGH','economy',60),candidate('top','TOP','politics_de',75)];
  assert.deepEqual(balanceEventQueue(candidates,{politics_de:15,economy:0}).map(c=>c.story_id),['top','economy','politics']);
  const tops=Array.from({length:4},(_,i)=>candidate(`top-${i}`,'TOP','politics_de',80));
  const old={...candidate('old','NORMAL','economy',50),existing_story:{first_seen:'2026-09-08T00:00:00Z'},first_seen:'2026-09-08T00:00:00Z'};
  assert.ok(partitionAiQueue([...tops,old],{stage:0,threshold:30},4,now).selected.every(c=>c.preanalysis.event_score.priority==='TOP'));
  assert.equal(partitionAiQueue(tops,{stage:3,threshold:30},4,now).selected.length,0);
});
test('missed event audit separates filter rejection, backlog and published evidence',()=>{
  const observed=observedMajorEvents([item()],now);
  const event=observed[0];assert.ok(event);
  const rejected={at:now,event_id:event.event_id,decision:'local_relevance_below_threshold'};
  const audit=coverageAudit({items:[item()],observed,stories:[],decisions:[rejected],now});
  assert.equal(audit.potential_missed_news[0].failure_class,'D');
  assert.ok(audit.alerts.some(a=>a.code==='CATEGORY_COVERAGE_GAP'));
  const published={...event,published:true,listed:true,slug:'test',last_updated:now,published_at:now};
  assert.equal(coverageAudit({items:[item()],observed,stories:[published],now}).potential_missed_news.length,0);
  const held={...event,published:false,pending_reason:'AI_BUDGET_OR_BATCH_LIMIT'};
  assert.equal(coverageAudit({items:[item()],observed,stories:[held],now}).potential_missed_news[0].failure_class,'E');
  const olderFilter=coverageAudit({items:[item()],observed,stories:[held],decisions:[rejected],now}).potential_missed_news[0];
  assert.equal(olderFilter.selection_status,'deferred');assert.equal(olderFilter.failure_class,'E','current capacity state must not be labelled a local rejection');
});

test('audit ranking uses final recorded scores and priority, not the old fragment order',()=>{
  const base=observedMajorEvents([item()],now)[0];
  const observed=Array.from({length:3},(_,i)=>({...base,story_id:`rank-${i}`,event_id:`event-rank-${i}`,sources:[item({url:`https://example.org/rank-${i}`})]}));
  const stories=observed.map(event=>({...event,published:false,pending_reason:'AI_BUDGET_OR_BATCH_LIMIT'}));
  const decisions=stories.map((story,i)=>({at:now,story_id:story.story_id,event_id:story.event_id,decision:'selected_for_verification',score:{...base.preanalysis.event_score,total_relevance_score:[50,70,65][i],priority:['HIGH','HIGH','TOP'][i]}}));
  const audit=coverageAudit({items:observed.flatMap(e=>e.sources),observed,stories,decisions,now});
  assert.deepEqual(audit.top_events.map(e=>e.cluster_id),['rank-2','rank-1','rank-0']);
});
test('missed checks have a hard four-event cap and unchanged hashes do not loop',()=>{
  const observed=Array.from({length:8},(_,i)=>({...observedMajorEvents([item()],now)[0],event_id:`event-${i}`,input_hash:`hash-${i}`,sources:[item({url:`https://example.org/${i}`})]}));
  const state={};
  assert.equal(missedNewsRechecks({observed,stories:[],state,now,maxEvents:100}).events.length,4);
  assert.equal(missedNewsRechecks({observed:observed.slice(0,4),stories:[],state,now:'2026-09-10T15:00:00Z'}).events.length,0);
  observed[0].input_hash='changed';
  assert.equal(missedNewsRechecks({observed:observed.slice(0,4),stories:[],state,now:'2026-09-09T17:00:00Z'}).events.length,1);
});
test('event-policy change revisits only recent unpublished materiality rejections once',()=>{
  const old={...story([item()]),published:false,rejection:{quality_errors:['AI_MATERIALITY_TOO_LOW']}};
  assert.equal(needsEventPolicyReview(old,now),true);
  assert.equal(needsEventPolicyReview({...old,published:true},now),false);
  assert.equal(needsEventPolicyReview({...old,rejection:{quality_errors:['AI_EVIDENCE_INSUFFICIENT']}},now),false);
  assert.equal(needsEventPolicyReview({...old,rejection:{...old.rejection,editorial_policy_version:EVENT_EDITORIAL_POLICY_VERSION}},now),false);
  assert.equal(needsEventPolicyReview(old,'2026-09-12T15:00:00Z'),false);
});
test('identical published evidence in ranking backfill settles locally, not a changed source or due followup',()=>{
  const old={...story([item()]),published:true,content_hash:'same'};
  const current={...old,existing_story:old,reassessment:true};
  assert.equal(unchangedRankingBackfill(current),true);
  assert.equal(unchangedRankingBackfill({...current,followup_due:true}),false);
  assert.equal(unchangedRankingBackfill({...current,deepening_due:true}),false);
  assert.equal(unchangedRankingBackfill({...current,sources:[item({summary:'Eine neue, anders belegte Aussage.'})]}),false);
});
test('coverage resolves old raw fragments to one story and shows its recorded selection score',()=>{
  const observed=observedMajorEvents([item()],now);
  const original=observed[0];const extra={...original,event_id:'old-event',story_id:'old-story',sources:[item({url:'https://example.org/second'})]};
  const stored={...story([...original.sources,...extra.sources]),published:false};
  const decisions=[{story_id:stored.story_id,event_id:original.event_id,at:now,decision:'selected_for_verification',score:{...original.preanalysis.event_score,total_relevance_score:80,priority:'TOP'}}];
  const audit=coverageAudit({observed:[original,extra],stories:[stored],decisions,selectedIds:new Set([stored.story_id]),now});
  assert.equal(audit.top_events.length,1);assert.equal(audit.counts.selected,1);
  assert.equal(audit.top_events[0].total_relevance_score,80);assert.equal(audit.top_events[0].score_basis,'recorded_selection');
  assert.equal(audit.top_events[0].sources.length,2);
});
test('publication instructions require new information, not a new decision or measured effects',()=>{
  const s=story([item()]);s.claims=claimLedgerFor(s.sources,s.story_id,now);s.preanalysis=preAnalyzeStory(s,now);
  const prompt=buildAnalysisPrompt([s]);
  assert.match(prompt,/Kein Beschlusszwang/);assert.match(prompt,/allein rechtfertigt kein not_material/);
  assert.match(prompt,/tragfähige Evidenz/);assert.match(prompt,/Umsetzung nicht erfinden/);
});
test('active index search is bounded, rotates, excludes disabled sources and never bypasses robots errors',async()=>{
  const endpoints=Array.from({length:4},(_,i)=>({id:`index-${i}`,source_id:'test',url:`https://example.org/index-${i}`,type:'official_rss',enabled:true,access_reviewed_at:'2026-09-09',evidence_url:'https://example.org/terms',scope:'metadata'}));
  const registry=normalizeNewsRegistry({sources:[source],policy:{active_discovery:{endpoints}}});
  assert.deepEqual(registryErrors(registry),[]);
  let calls=0;const state={};
  const fetchIndex=async s=>{calls++;return{body:`<rss><channel>${Array.from({length:40},(_,i)=>`<item><title>Bundestag Generaldebatte ${i}</title><link>https://example.org/${s.feed_url.split('/').at(-1)}/${i}</link><pubDate>Wed, 09 Sep 2026 14:00:00 GMT</pubDate></item>`).join('')}</channel></rss>`}};
  const result=await runActiveDiscovery({registry,state,stories:[],now,fetchIndex});
  assert.equal(calls,2);assert.ok(result.items.length<=12);
  await runActiveDiscovery({registry,state,stories:[],now,fetchIndex});assert.equal(calls,4);
  await runActiveDiscovery({registry,state,stories:[],now,fetchIndex});assert.equal(calls,4);
  registry.sources[0].enabled=false;
  await runActiveDiscovery({registry,state,stories:[],now:'2026-09-10T15:00:00Z',fetchIndex});assert.equal(calls,4);
  registry.sources[0].enabled=true;
  const blocked=await runActiveDiscovery({registry,state,stories:[],now:'2026-09-10T15:00:00Z',fetchIndex:async()=>{throw new Error('ROBOTS_DISALLOWED')}});
  assert.equal(blocked.items.length,0);assert.ok(blocked.errors.every(e=>e.error==='ROBOTS_DISALLOWED'));
});
test('generic sitemap metadata calls are limited and lastmod is never publication time',async()=>{
  const registry={sources:[source],policy:{active_discovery:{endpoints:[{id:'sitemap',source_id:'test',url:'https://example.org/map',type:'news_sitemap',enabled:true,access_reviewed_at:'2026-09-09'}]}}};
  let calls=0;
  const result=await runActiveDiscovery({registry,state:{},stories:[],now,fetchIndex:async()=>({body:`<urlset>${Array.from({length:20},(_,i)=>`<url><loc>https://example.org/${i}</loc><lastmod>${now}</lastmod></url>`).join('')}</urlset>`}),fetchMetadata:async()=>{calls++;return{body:'<meta property="og:title" content="Generaldebatte im Bundestag"><meta property="article:modified_time" content="2026-09-09T14:00:00Z">'}}});
  assert.equal(calls,DISCOVERY_LIMITS.metadata_per_run);assert.equal(result.items.length,0);
  assert.equal(extractDiscoveryMetadata('<script type="application/ld+json">{"@type":"Article","headline":"Wrong article","url":"https://example.org/other","datePublished":"2026-09-09"}</script>','https://example.org/a',source),null);
});
test('namespace-prefixed official news sitemap yields its real headline and publication time',()=>{
  const xml=`<urlset xmlns:n="http://www.google.com/schemas/sitemap-news/0.9"><url><loc>https://example.org/a</loc><lastmod>2030-01-01</lastmod><n:news><n:title>Generaldebatte im Bundestag</n:title><n:publication_date>${now}</n:publication_date></n:news></url></urlset>`;
  const rows=parseFeed(xml,{...source,source_type:'news_sitemap'});assert.equal(rows.length,1);assert.equal(rows[0].published_at,now);
});
test('agenda hints do not fabricate a scheduled day or a released product',()=>{
  assert.equal(agendaSignal(item({title:'Keynote: erstes Falttelefon wird erwartet',summary:''})).scheduled_date,null);
  assert.equal(agendaSignal(item({title:'Generaldebatte am 9. September 2026',summary:''})).scheduled_date,'2026-09-09');
});
test('lifecycle confirmation/resolution cannot be inferred from popularity or silence',()=>{
  let event=updateEventLifecycle({},null,{breaking_status:'breaking'},now);assert.equal(event.lifecycle.status,'breaking');
  event=updateEventLifecycle(event,{published:true,current_version:1,analysis:{news_status:'preliminary'}},{},now);assert.equal(event.lifecycle.status,'developing');
  event=updateEventLifecycle(event,{published:true,current_version:1,analysis:{news_status:'confirmed'}},{},now);assert.equal(event.lifecycle.status,'confirmed');
  event=updateEventLifecycle(event,{published:true,current_version:2,analysis:{news_status:'updated'}},{},now);assert.equal(event.lifecycle.status,'major_update');
  assert.notEqual(updateEventLifecycle({},null,{},'2026-09-20T00:00:00Z').lifecycle.status,'resolved');
});
test('audit CLI core is read-only; missing current input remains absent, not invented',()=>{
  const data={date:'2026-09-09',now,newsroom:{source_items:{one:item()},decisions:[]},stories:[],report:{completed_at:now},registry:{sources:[source]}};
  const before=structuredClone(data);const audit=auditDay(data);
  assert.equal(audit.model_calls,0);assert.equal(audit.top_events.length,1);assert.match(auditMarkdown(audit),/Generaldebatte/);assert.deepEqual(data,before);
});
test('the real runner excludes disabled raw sources from rechecks and performs zero paid calls for duplicate input',async()=>{
  const rss=`<rss><channel><item><title>${item().title}</title><link>${item().url}</link><description>${item().summary}</description><pubDate>Wed, 09 Sep 2026 14:30:00 GMT</pubDate></item></channel></rss>`;
  const parsed=parseFeed(rss,source)[0];let calls=0,captured;
  for (const relevanceVersion of [EVENT_RELEVANCE_VERSION, 'previous-ranking-version']) {
  const report=await runWirkungsticker({dryRun:true,now,registry:{sources:[source],policy:{event_relevance:{enabled:true}}},
    state:{source_status:{},seen_items:{[parsed.item_id]:{content_hash:parsed.content_hash,url:parsed.url,source_id:'test',published_at:parsed.published_at,last_seen:now}},pending_story_ids:[],relevance_filter_version:relevanceVersion,
      missed_news_rechecks:{}},storyStore:{stories:[{...story([parsed]),published:true,listed:true,slug:'test',analysis:{},published_at:now,last_updated:now}]},usage:{runs:[]},
    newsroom:{source_items:{foreign:item({source_id:'disabled',url:'https://foreign.example/a'})},events:{},event_sources:[],decisions:[],discovery_candidates:[]},budgetFx:{rate_date:'2026-09-09',rate_usd_per_eur:1.16},
    fetchFeedImpl:async()=>({body:rss,final_url:source.feed_url}),callAiImpl:async()=>{calls++;throw Error('Must not call')},captureState:value=>captured=value});
  assert.equal(calls,0);assert.equal(report.ai_calls,0);assert.equal(report.estimated_cost_usd,0);
  assert.ok(report.event_coverage.top_events.every(row=>row.sources.every(s=>s.source_id==='test')));
  assert.ok(captured.newsroom.source_items.foreign,'Historical record is retained, not silently deleted');
  }
});
test('fifteen newly discovered reports use one existing verification slot, not fifteen',async()=>{
  const rss=`<rss><channel>${Array.from({length:15},(_,i)=>`<item><title>Generaldebatte im Bundestag: Beitrag ${i}</title><link>https://example.org/debate-${i}</link><description>Der Kanzler und die Opposition diskutieren die Haushaltsprioritäten.</description><pubDate>Wed, 09 Sep 2026 14:30:00 GMT</pubDate></item>`).join('')}</channel></rss>`;
  let calls=0;
  const report=await runWirkungsticker({dryRun:true,now,registry:{sources:[source],policy:{event_relevance:{enabled:true}}},state:{source_status:{},seen_items:{},pending_story_ids:[],relevance_filter_version:EVENT_RELEVANCE_VERSION},storyStore:{stories:[]},usage:{runs:[]},newsroom:{source_items:{},events:{},event_sources:[],decisions:[],discovery_candidates:[]},budgetFx:{rate_date:'2026-09-09',rate_usd_per_eur:1.16},fetchFeedImpl:async()=>({body:rss,final_url:source.feed_url}),fetchArticleImpl:async()=>({excerpt:''}),
    callAiImpl:async candidates=>{calls++;assert.equal(candidates.length,1);assert.equal(candidates[0].sources.length,15);assert.ok(buildAnalysisPrompt(candidates).length<=39000);return{analyses:[{story_id:candidates[0].story_id,publication_recommendation:false,rejection:{code:'insufficient_evidence',reason:'Die Testquelle enthält noch keine ausreichenden Einzelbelege zur Debatte.'}}],model:'gpt-5.4-mini',reported_usage:{input_tokens:100,output_tokens:50}}}});
  assert.equal(calls,1);assert.equal(report.ai_stories,1);assert.equal(report.published_stories,0);assert.equal(report.ai_calls,1);
});

test('the real worker combines already queued border reports into one paid review',async()=>{
  const sources=borderSources().map(item=>({...item,source_id:'test',publisher:'Test',primary_source:true}));
  const drafts=sources.map((item,i)=>({story_id:`queued-${i}`,title:item.title,sources:[item],published:false,pending_reason:'AI_BUDGET_OR_BATCH_LIMIT',first_seen:item.published_at,last_updated:item.published_at,versions:[]}));
  const rss=`<rss><channel>${sources.map(item=>`<item><title>${item.title}</title><link>${item.url}</link><description>${item.summary}</description><pubDate>Wed, 09 Sep 2026 14:00:00 GMT</pubDate></item>`).join('')}</channel></rss>`;
  let calls=0;
  const report=await runWirkungsticker({dryRun:true,now,registry:{sources:[source],policy:{event_relevance:{enabled:true}}},state:{source_status:{},seen_items:{},pending_story_ids:[],relevance_filter_version:EVENT_RELEVANCE_VERSION},storyStore:{stories:drafts},usage:{runs:[]},newsroom:{source_items:{},events:{},event_sources:[],decisions:[],discovery_candidates:[]},budgetFx:{rate_date:'2026-09-09',rate_usd_per_eur:1.16},fetchFeedImpl:async()=>({body:rss,final_url:source.feed_url}),fetchArticleImpl:async()=>({excerpt:''}),
    callAiImpl:async candidates=>{calls++;assert.equal(candidates.length,1);assert.equal(candidates[0].sources.length,3);return{analyses:[{story_id:candidates[0].story_id,publication_recommendation:false,rejection:{code:'insufficient_evidence',reason:'Die Testbelege bestätigen den Sprengstoffverdacht noch nicht unabhängig.'}}],model:'gpt-5.4-mini',reported_usage:{input_tokens:100,output_tokens:50}}}});
  assert.equal(calls,1);assert.equal(report.living_file_merges.length,2);assert.equal(report.published_stories,0);
});

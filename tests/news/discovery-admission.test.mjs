import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryAdmission, currentEvidence, latestEvidenceTime } from '../../scripts/news/discovery-admission.mjs';
import { eventSignals } from '../../scripts/news/event-relevance.mjs';
import { protectedCurrentCandidate } from '../../scripts/news/bridge/processor.mjs';
const now='2026-09-12T06:00:00Z';
const source=(title,summary='',url='https://example.org/politik/meldung')=>({title,summary,url,source_topic:'Politik',published_at:'2026-09-12T05:45:00Z'});

for(const [title,summary] of [
  ['Hubig will Verstöße gegen Mietpreisbremse mit Bußgeldern bestrafen','Schutzlücken im Mietrecht schließen.'],
  ['Saudi-Arabien schaltet wichtige Pipeline ab','Nach Drohnen-Angriffen wird die Versorgung unterbrochen.'],
  ['Facharzttermine','Gesundheitsreform: Kassenärzte-Chef hält schnellere Vergaben für möglich.'],
  ['Bundeszwang als letztes Mittel','Fraktionschef hält Maßnahmen gegen eine Landesregierung für möglich.'],
  ['VW beziffert Stellenabbau','Werksschließungen und 60.000 Arbeitsplätze betroffen.'],
  ['Bank Sepah unter Aufsicht','Die Aufsicht leitet Insolvenz ein.'],
  ['Bahn-Bau verzögert sich','Infrastruktur und Pendler betroffen.'],
  ['KI-Anbieter übernehmen Cloud-Kapazitäten','Neue Abhängigkeiten für Softwareunternehmen.'],
]) test(`review admission: ${title}`,()=>assert.equal(discoveryAdmission([source(title,summary)]).review,true));

test('an unknown event pattern may enter review without changing event score',()=>{
  const item=source('Mietpreisbremse','Ministerin will Schutzlücken mit Bußgeldern schließen.');
  assert.equal(eventSignals(item).signals.length,0);assert.equal(discoveryAdmission([item]).review,true);
});
for(const title of ['iPhone-Hülle im Produkttest','Kaufberatung für die neue Cloud','Lotto: Millionengewinn wächst','Firmware-Update Patchnotes','Kommentar: Regierung will handeln','Historischer Liveticker 9/11','Fußball-Bundesliga: Verein schließt Saison ab'])
  test(`no automatic review promotion: ${title}`,()=>assert.equal(discoveryAdmission([source(title)]).review,false));
test('source freshness protects new normal news from a full backlog, never a reimport date',()=>{
  const fresh={sources:[source('Neue Regel wird eingeführt')]};
  assert.equal(currentEvidence(fresh,now,1),true);assert.equal(protectedCurrentCandidate(fresh,now),true);
  const old={...fresh,created_at:now,sources:[{...fresh.sources[0],source_published_at:'2026-09-05T12:00:00Z'}]};
  assert.equal(currentEvidence(old,now),false);assert.equal(protectedCurrentCandidate(old,now),false);
  assert.equal(protectedCurrentCandidate({...fresh,backfill:true},now),false);
  assert.equal(latestEvidenceTime({sources:[{published_at:'2026-09-13T12:00:00Z'}]},now),0);
});

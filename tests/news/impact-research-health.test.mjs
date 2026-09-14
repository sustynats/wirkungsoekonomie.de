import test from 'node:test';
import assert from 'node:assert/strict';
import {impactResearchHealth} from '../../scripts/news/impact-research-health.mjs';
import {POTENTIAL_RESEARCH_RULE} from '../../scripts/news/impact-potential.mjs';
import {IMPACT_RULE,IMPACT_PROMPT_RULE} from '../../scripts/news/impact-assessment.mjs';
const checked=result=>({research_check:{status:'completed',searches:[{question:'Welcher Mechanismus ist belegt?',result}]}});
test('unfinished research cannot be reported as completed',()=>{
  assert.deepEqual(impactResearchHealth(checked('Eine gezielte Suche konnte im verfügbaren Zugriff nicht erfolgreich abgeschlossen werden.')),['IMPACT_RESEARCH_OPERATION_INCOMPLETE']);
  assert.deepEqual(impactResearchHealth(checked('Die notwendige Recherche wurde nicht durchgeführt.')),['IMPACT_RESEARCH_OPERATION_INCOMPLETE']);
});
test('a completed search with no relevant result remains a legitimate evidence gap',()=>{
  assert.deepEqual(impactResearchHealth(checked('Die geprüften Quellen benennen keine betroffene Anlage; ein abgegrenzter Wirkungsraum bleibt unbekannt.')),[]);
  assert.deepEqual(impactResearchHealth(checked('Die Suche fand keinen zusätzlichen Beleg. Die Ergebnisliste wurde geprüft.')),[]);
});
test('a failed endpoint may be recovered by a documented successful source',()=>{
  const a=checked('Recherche: ARTICLE_FETCH_FAILED');
  a.research_check.searches.push({question:'Alternative Primärquelle?',result:'Amtlichen Bericht gelesen und Mechanismus geprüft.',source_ids:['official-report']});
  assert.deepEqual(impactResearchHealth(a),[]);
});
test('canonical and compact author contracts distinguish potential from observed effects',()=>{
  assert.ok(IMPACT_RULE.includes(POTENTIAL_RESEARCH_RULE));
  assert.match(IMPACT_PROMPT_RULE,/Unsicherer Eintritt≠offene Richtung/);
  assert.match(IMPACT_PROMPT_RULE,/Politische Forderung: Maßnahme bewerten/);
});

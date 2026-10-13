import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {hasPersonalRelease,renderEditorialAuthorship} from '../../scripts/news/editorial-authorship.mjs';
import {editorialCard} from '../../scripts/news/build.mjs';

test('öffentliche Analysen enthalten keine internen Kuration- oder Produktionshinweise', () => {
  for (const subtype of ['opinion_analysis','listened','watched','book_review']) {
    const a={format:'approved_editorial',subtype,status:'published',manual_only:true,content_hash:'a'.repeat(64)};
    const html=renderEditorialAuthorship(a);
    assert.equal(html, '');
    assert.doesNotMatch(html,/Persönlich kuratiert|redaktionelle Verantwortung|KI-Werkzeuge|nicht automatisch veröffentlicht/iu);
    assert.equal(hasPersonalRelease({...a,status:'draft'}),false);
  }
});

test('historische und beauftragte Analysen erhalten keine erfundene Einzelfreigabe', () => {
  for(const a of [{},{status:'published',editorial_mode:'commissioned_review'}, {format:'approved_editorial',status:'published',manual_only:true}]) {
    assert.equal(hasPersonalRelease(a),false);
    assert.doesNotMatch(renderEditorialAuthorship(a),/Diese Fassung wurde/);
    assert.equal(renderEditorialAuthorship(a), '');
  }
  assert.equal(hasPersonalRelease({status:'published',format:'book_and_impact',editorial_mode:'manual_manuscript',manuscript_sha256:'b'.repeat(64)}),true);
  assert.equal(hasPersonalRelease({status:'published',approved_editorial_revision:{content_hash:'c'.repeat(64),at:'2026-09-24'}}),true);
});

test('gemeinsame Karten und beide Detailrenderer bleiben frei von internen Produktionshinweisen', () => {
  const a={format:'approved_editorial',subtype:'watched',analysis_id:'test',slug:'test',title:'Titel',subtitle:'Untertitel',published_at:'2026-09-24',source_media:{show:'Europa im Gespräch',episode_title:'Europa',original_release_date:'2026-09-22'}};
  const html=editorialCard(a,null,0);
  assert.doesNotMatch(html,/news-editorial-card__curation|Persönlich kuratiert/iu);
  assert.match(html,/Nachgesehen/);
  assert.match(html,/news-show-identity--text/);
  const build=fs.readFileSync(new URL('../../scripts/news/build.mjs',import.meta.url),'utf8');
  assert.ok(build.includes('renderEditorialAuthorship(analysis)'));
  assert.ok(build.includes('renderEditorialAuthorship(a)'));
});

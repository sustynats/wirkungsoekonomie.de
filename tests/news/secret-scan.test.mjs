import test from 'node:test';
import assert from 'node:assert/strict';
import * as secretScan from '../../scripts/news/secret-scan.mjs';
const {hasSecretPattern, newsroomSecretScanText} = secretScan;

const slug = 'sk-hynix-chipriese-sagt-borsengang-seiner-chip-sparte-in-den-usa-ab-eeafc4';
const url = 'https://www.manager-magazin.de/unternehmen/tech/sk-hynix-chipriese-sagt-boersengang-seiner-chip-sparte-in-den-usa-ab-a-657a2c87-be9b-4612-9171-b2d1b7a74b2f';
const fixture = () => ({stories: [{story_id: 'wt-4d25b6e225eeafc4', slug,
  sources: [{source_id: 'manager-magazin-news', url}], source_summary: 'A public company headline, not a credential.'}]});

test('the exact SK Hynix source identifiers do not block unrelated paid news publication', () => {
  const store = fixture(), before = structuredClone(store);
  assert.equal(hasSecretPattern(JSON.stringify(store)), true, 'reproduces the old whole-store false positive');
  assert.equal(hasSecretPattern(newsroomSecretScanText(store)), false);
  assert.deepEqual(store, before, 'the scanner must never change source or publication bytes');
});

test('all existing secret pattern families remain blocked, including hyphenated keys', () => {
  const key = 'sk-' + 'A0_b-Cd'.repeat(9);
  for (const value of [key, 'sk-proj-' + 'Ab_9-Xy'.repeat(9), 'sk-svcacct-' + 'Aa-0_Bb'.repeat(9),
    '-----BEGIN PRIVATE KEY-----', '-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN EC PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----', 'AKIA' + 'A1'.repeat(8)]) {
    assert.equal(hasSecretPattern(value), true);
    const store = fixture(); store.stories[0].provider_error = value;
    assert.equal(hasSecretPattern(newsroomSecretScanText(store)), true);
  }
});

test('the exception is not a domain, company-prefix, arbitrary-field or query allowlist', () => {
  for (const change of [
    s => { s.stories[0].slug += '-changed'; },
    s => { s.stories[0].story_id = 'wt-0000000000000000'; },
    s => { s.stories[0].sources[0].source_id = 'untrusted'; },
    s => { s.stories[0].sources[0].url += '?token=' + 'sk-' + 'Ab0'.repeat(15); },
    s => { s.stories[0].sources[0].url += '#sk-' + 'Ab0'.repeat(15); },
    s => { s.stories[0].source_summary = slug; },
    s => { s.stories[0].sources[0].url = url.replace('sk-hynix-', 'sk-' + 'Ab0'.repeat(15) + '-'); },
  ]) { const store = fixture(); change(store); assert.equal(hasSecretPattern(newsroomSecretScanText(store)), true); }
  assert.equal(hasSecretPattern(url), true, 'raw strings still use the unchanged guard');
});

const seenKey = 'dde74846bf7ac1435ddba77ebdc73a45075ce34e8cc777451e556fec2524b4e5';
const stateFixture = () => ({seen_items: {[seenKey]: {source_id: 'manager-magazin-news', url}}});

test('the same verified public URL in its exact seen-item record is not a secret', () => {
  const state = stateFixture(), before = structuredClone(state);
  assert.equal(hasSecretPattern(JSON.stringify(state)), true, 'reproduces serial run 39948979901 after the story scan passed');
  assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), false);
  assert.deepEqual(state, before, 'never alter the source URL, deduplication key or retained state');
});

test('the state exception is bound to the seen key, source, field and entire URL', () => {
  for (const change of [
    s => { s.seen_items.other = s.seen_items[seenKey]; delete s.seen_items[seenKey]; },
    s => { s.seen_items[seenKey].source_id = 'untrusted'; },
    s => { s.seen_items[seenKey].url += '?token=' + 'sk-' + 'Ab0'.repeat(15); },
    s => { s.seen_items[seenKey].url += '#sk-' + 'Ab0'.repeat(15); },
    s => { s.seen_items[seenKey].other_field = url; },
    s => { s.other_section = {source_id: 'manager-magazin-news', url}; },
  ]) {
    const state = stateFixture(); change(state);
    assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), true);
  }
  for (const value of ['sk-' + 'Ab_0-X'.repeat(8), '-----BEGIN PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN EC PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----', 'AKIA' + 'A1'.repeat(8)]) {
    const state = stateFixture(); state.seen_items[seenKey].provider_error = value;
    assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), true);
  }
});

const earningsSlug = 'ki-boom-sudkoreas-chipproduzent-sk-hynix-erzielt-erneut-rekordgewinn-c1c7eb';
const earningsSources = [
  {source_id: 'stern-schlagzeilen', seen_key: 'd4eca2891eb94ae8bc3a0920b8bd1ba877d1c69060513f851711c839e5174247',
    url: 'https://www.stern.de/wirtschaft/news/ki-boom--suedkoreas-chipproduzent-sk-hynix-erzielt-erneut-rekordgewinn-38461416.html'},
  {source_id: 'tagesspiegel-home', seen_key: 'aa83375b04fa5886e289f99fbb747d67316f68fd4c16ff576273621c445e82f1',
    url: 'https://www.tagesspiegel.de/wirtschaft/dpa-ki-boom-sudkoreas-chipproduzent-sk-hynix-erzielt-erneut-rekordgewinn-16208091.html'},
];
const earningsFixture = () => ({stories: [{story_id: 'wt-22212d0a64c1c7eb', slug: earningsSlug,
  sources: earningsSources.map(({source_id, url}) => ({source_id, url}))}]});
const earningsState = () => ({seen_items: Object.fromEntries(earningsSources.map(({seen_key, ...source}) => [seen_key, source]))});

test('the exact second SK Hynix story and both seen-item records pass without mutating data', () => {
  const store = earningsFixture(), state = earningsState();
  const before = structuredClone({store, state});
  assert.equal(hasSecretPattern(JSON.stringify(store)), true);
  assert.equal(hasSecretPattern(JSON.stringify(state)), true);
  assert.equal(hasSecretPattern(newsroomSecretScanText(store)), false);
  assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), false);
  assert.deepEqual({store, state}, before);
});

test('the second story exemption remains bound to its story, slug, source, field and complete URL', () => {
  for (const change of [
    s => { s.stories[0].story_id = 'wt-4d25b6e225eeafc4'; },
    s => { s.stories[0].slug += '-changed'; },
    s => { s.stories[0].slug = slug; },
    s => { s.stories[0].sources = []; },
    s => { s.stories[0].sources[0].source_id = 'tagesspiegel-home'; },
    s => { s.stories[0].sources[0].url += '?token=' + 'sk-' + 'Ab0'.repeat(15); },
    s => { s.stories[0].sources[1].url += '#sk-' + 'Ab0'.repeat(15); },
    s => { s.stories[0].source_summary = earningsSlug; },
    s => { s.stories[0].sources[0].other_field = earningsSources[0].url; },
    s => { s.stories.push({...s.stories[0], story_id: 'wt-0000000000000000'}); },
  ]) {
    const store = earningsFixture(); change(store);
    assert.equal(hasSecretPattern(newsroomSecretScanText(store)), true);
  }
});

test('both new seen-item exemptions reject changed bindings and secret-bearing extra fields', () => {
  for (const {seen_key, url} of earningsSources) {
    for (const change of [
      s => { s.seen_items.other = s.seen_items[seen_key]; delete s.seen_items[seen_key]; },
      s => { s.seen_items[seen_key].source_id = 'untrusted'; },
      s => { s.seen_items[seen_key].url += '?token=' + 'sk-' + 'Ab0'.repeat(15); },
      s => { s.seen_items[seen_key].url += '#sk-' + 'Ab0'.repeat(15); },
      s => { s.seen_items[seen_key].other_field = url; },
      s => { s.other_section = {url}; },
    ]) {
      const state = earningsState(); change(state);
      assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), true);
    }
  }
  for (const value of ['sk-' + 'Ab_0-X'.repeat(8), 'sk-proj-' + 'Ab_0-X'.repeat(8),
    'sk-svcacct-' + 'Ab_0-X'.repeat(8), '-----BEGIN PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN EC PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----', 'AKIA' + 'A1'.repeat(8)]) {
    const store = earningsFixture(), state = earningsState();
    store.stories[0].sources[0].provider_error = value;
    state.seen_items[earningsSources[0].seen_key].provider_error = value;
    assert.equal(hasSecretPattern(newsroomSecretScanText(store)), true);
    assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), true);
  }
});

const thirdSeenKey = 'ed3f30127d2175830133a4f201903278da58dda23618303bf4ed5461e32227da';
const thirdUrl = 'https://www.stern.de/news/suedkoreas-chip-hersteller-sk-hynix-verbucht-erneuten-umsatz--und-gewinnrekord-38462334.html';
const thirdSeenState = () => ({seen_items: {[thirdSeenKey]: {source_id: 'stern-schlagzeilen', url: thirdUrl}}});

test('the third public RSS identifier is exempt only in its exact retained seen row', () => {
  const state = thirdSeenState(), before = structuredClone(state);
  assert.equal(hasSecretPattern(JSON.stringify(state)), true);
  assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), false);
  assert.deepEqual(state, before);
  assert.equal(hasSecretPattern(newsroomSecretScanText({stories: [{story_id: 'unreviewed', slug: 'unreviewed', sources: [state.seen_items[thirdSeenKey]]}]})), true,
    'a seen-only identifier does not exempt a new story');
});

test('the seen-only identifier cannot exempt another key, source, field, URL or credentials', () => {
  for (const change of [
    s => { s.seen_items.other = s.seen_items[thirdSeenKey]; delete s.seen_items[thirdSeenKey]; },
    s => { s.seen_items[thirdSeenKey].source_id = 'untrusted'; },
    s => { s.seen_items[thirdSeenKey].url += '?token=' + 'sk-' + 'Ab0'.repeat(15); },
    s => { s.seen_items[thirdSeenKey].url += '#sk-' + 'Ab0'.repeat(15); },
    s => { s.seen_items[thirdSeenKey].other_field = thirdUrl; },
    s => { s.other_section = {url: thirdUrl}; },
  ]) {
    const state = thirdSeenState(); change(state);
    assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), true);
  }
  for (const value of ['sk-' + 'Ab_0-X'.repeat(8), 'sk-proj-' + 'Ab_0-X'.repeat(8),
    'sk-svcacct-' + 'Ab_0-X'.repeat(8), '-----BEGIN PRIVATE KEY-----',
    '-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN EC PRIVATE KEY-----',
    '-----BEGIN OPENSSH PRIVATE KEY-----', 'AKIA' + 'A1'.repeat(8)]) {
    const state = thirdSeenState(); state.seen_items[thirdSeenKey].provider_error = value;
    assert.equal(hasSecretPattern(secretScan.stateSecretScanText(state)), true);
  }
});

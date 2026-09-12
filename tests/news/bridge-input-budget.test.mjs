import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnalysisPrompt, BRIDGE_ANALYSIS_PROMPT_MAX_CHARS } from '../../scripts/news/lib.mjs';
import { bridgeInput } from '../../scripts/news/bridge/adapter.mjs';
import { inputSchema, parsePacket } from '../../scripts/news/bridge/contract.mjs';

const now = '2026-09-12T00:00:00Z';
const candidate = (count = 24) => ({
  story_id: 'wt-fixture', event_id: 'fixture', content_hash: 'a'.repeat(64),
  title: 'Bund beschließt neue Regeln zur Energieversorgung', first_seen: now, claims: [],
  sources: Array.from({ length: count }, (_, i) => ({
    source_id: 'test', publisher: 'Test', title: 'Bund beschließt neue Regeln zur Energieversorgung',
    url: `https://example.org/document/${i}/${'x'.repeat(1100)}`,
    summary: 'Die Regeln betreffen Investitionen in Energie und Infrastruktur. Eine Wirkung ist damit noch nicht belegt.',
    published_at: now,
  })),
});

test('a source catalog over the API budget remains intact in a bounded native bridge packet', () => {
  const value = candidate(), before = structuredClone(value);
  assert.throws(() => buildAnalysisPrompt([value]), /AI_INPUT_TOO_LARGE/);
  const prompt = buildAnalysisPrompt([value], { transport: 'dropbox_chatgpt_bridge' });
  assert.ok(prompt.length > 44000 && prompt.length <= BRIDGE_ANALYSIS_PROMPT_MAX_CHARS);
  for (const source of value.sources) assert.ok(prompt.includes(source.url));
  assert.ok(prompt.includes('requires_corroboration'));
  assert.ok(prompt.includes('UNTRUSTED_SOURCE_DATA_BEGIN'));
  assert.ok(prompt.includes('impact_assessment'));
  const packet = bridgeInput(value, now);
  assert.deepEqual(parsePacket(JSON.stringify(packet), inputSchema), packet);
  assert.deepEqual(packet.sources.map(s => s.url), value.sources.map(s => s.url));
  assert.deepEqual(packet.sources.map(s => s.excerpt), value.sources.map(s => s.summary));
  assert.deepEqual(value, before);
  // A bridge assembly must never enlarge later paid API requests.
  assert.throws(() => buildAnalysisPrompt([value]), /AI_INPUT_TOO_LARGE/);
});

test('bridge input is still bounded; malformed transport, secret URLs and manual content stay blocked', () => {
  assert.throws(() => bridgeInput(candidate(80), now), /AI_INPUT_TOO_LARGE/);
  assert.throws(() => buildAnalysisPrompt([candidate()], { transport: 'typo' }), /ANALYSIS_PROMPT_TRANSPORT_INVALID/);
  const unsafe = candidate(1); unsafe.sources[0].url = 'https://example.org/?api_key=private';
  assert.throws(() => bridgeInput(unsafe, now), /BRIDGE_SOURCE_URL_INVALID/);
  const personal = candidate(1); personal.manual_only = true;
  assert.throws(() => bridgeInput(personal, now));
});

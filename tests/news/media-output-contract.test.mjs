import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnalysisPrompt } from '../../scripts/news/lib.mjs';
import { mediaImpactValidationErrors } from '../../scripts/news/media-impact.mjs';
import { analysisValidationDiagnostics, mediaInputDiagnostics, sanitizeAnalysisMediaImpact } from '../../scripts/news/run.mjs';

const candidate = () => ({
  story_id: 'wt-media-contract',
  title: 'Minister warnt vor einer Bedrohung',
  sources: [],
  claims: [],
  media_trigger: { relevant: true, level: 'high', reasons: ['threat_or_fear_frame'], fingerprint: 'test', comparable_source_count: 0 },
});

test('prompt requires an explicit media verdict for triggered accepted stories in both visual modes', () => {
  for (const includeVisuals of [true, false]) {
    const prompt = buildAnalysisPrompt([candidate()], { includeVisuals });
    const instructions = prompt.slice(0, prompt.indexOf('UNTRUSTED_SOURCE_DATA_BEGIN'));
    assert.ok(/Bei true und Publikation: media_impact als Pflichtobjekt, nie null\/fehlend/.test(instructions), 'triggered accepted stories require an object');
    assert.ok(/\{relevant:false,reason:.*?\}/.test(instructions), 'a negative verdict remains possible');
    assert.ok(/Ablehnung bleibt knapp/.test(instructions), 'editorial rejections remain short');
    assert.ok(prompt.length <= 39000);
  }
});

test('a triggered media check still rejects missing or null output but permits a negative verdict', () => {
  for (const output of [{}, { media_impact: null }]) {
    const item = candidate();
    sanitizeAnalysisMediaImpact(output, item, {}, '2026-09-08T03:00:00Z');
    assert.deepEqual(mediaImpactValidationErrors(output, item), ['MEDIA_IMPACT_REQUIRED']);
  }
  const item = candidate();
  const output = { media_impact: { relevant: false, reason: 'Die Wortwahl beschreibt den belegten Vorgang; ein weiterer relevanter Vermittlungsbefund liegt nicht vor.' } };
  sanitizeAnalysisMediaImpact(output, item, {}, '2026-09-08T03:00:00Z');
  assert.equal(output.media_impact.relevant, false);
  assert.deepEqual(mediaImpactValidationErrors(output, item), []);
});

test('media diagnostics distinguish missing, null and malformed input without retaining text', () => {
  for (const [value, shape, relevant] of [
    [undefined, 'missing', null], [null, 'null', null], [[], 'array', null],
    ['UNTRUSTED PRIVATE TEXT', 'string', null], [false, 'boolean', null], [17, 'number', null],
    [{ relevant: 'false', private_text: 'UNTRUSTED PRIVATE TEXT' }, 'object', null],
    [{ relevant: false, reason: 'UNTRUSTED PRIVATE TEXT' }, 'object', false],
    [{ relevant: true, public_explanation: 'UNTRUSTED PRIVATE TEXT' }, 'object', true],
  ]) {
    const snapshot = mediaInputDiagnostics(value);
    assert.deepEqual(snapshot, { shape, relevant });
    const diagnostics = analysisValidationDiagnostics({}, '', {}, snapshot);
    assert.equal(diagnostics.media_input_shape, shape);
    assert.equal(diagnostics.media_input_relevant, relevant);
    assert.ok(!JSON.stringify(diagnostics).includes('UNTRUSTED PRIVATE TEXT'));
  }
  assert.equal(analysisValidationDiagnostics({}).media_input_shape, undefined, 'historical missing telemetry is unknown');
});

test('input diagnostics survive normalization and do not turn an omitted check into a verdict', () => {
  const output = { media_impact: 'not an object' };
  const snapshot = mediaInputDiagnostics(output.media_impact);
  const item = candidate();
  sanitizeAnalysisMediaImpact(output, item, {}, '2026-09-08T03:00:00Z');
  assert.equal(output.media_impact, null);
  assert.equal(analysisValidationDiagnostics(output, '', item, snapshot).media_input_shape, 'string');
  assert.deepEqual(mediaImpactValidationErrors(output, item), ['MEDIA_IMPACT_REQUIRED']);
});

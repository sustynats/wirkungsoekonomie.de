import assert from 'node:assert/strict';
import test from 'node:test';
import {normalizePublicationTypography,hasNonstandardDash} from '../../scripts/lib/public-typography.mjs';
test('normalizes visible, encoded and typographic hyphens without changing numbers or markup',()=>{
  const input='<p title="Wirkung\u2014Beispiel">10\u201320 kg &ndash; A &mdash; B &#8212; C &#x2011; D: 50 \u2212 10 = 40</p>';
  const result='<p title="Wirkung-Beispiel">10-20 kg - A - B - C - D: 50 - 10 = 40</p>';
  assert.equal(normalizePublicationTypography(input),result);
  assert.equal(normalizePublicationTypography(result),result);
  assert.equal(hasNonstandardDash(result),false);
});

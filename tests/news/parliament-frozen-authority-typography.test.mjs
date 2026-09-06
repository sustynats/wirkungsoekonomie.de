import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { isFrozenPublicationSource } from '../../scripts/lib/public-typography.mjs';

test('Publication formatting must preserve the entire hash-bound Parliament authority archive', () => {
  const archive = JSON.parse(fs.readFileSync('woek-parlament-app/data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-p1-p54-authority-index-v1.json'));
  for (const comment of archive.comments) {
    assert.equal(isFrozenPublicationSource(comment.path), true);
    assert.equal(createHash('sha256').update(fs.readFileSync(comment.path)).digest('hex'), comment.file_sha256);
  }
  for (const file of ['mv-spd-p1-p54-reference-inventory-2026-09-04.json', 'mv-spd-p53-handoff-5474946653.md', 'mv-spd-p53-binding-delta-5543580667.md']) assert.equal(isFrozenPublicationSource('docs/parlament/audits/' + file), true);
  for (const file of ['fach-reviews/berlin-2026-spd-p26-authoritative-handoff.md', 'fach-reviews/berlin-2026-bsw-p57-authoritative-handoff.md', 'fach-content-residuals/berlin-2026-v3.json']) assert.equal(isFrozenPublicationSource('woek-parlament-app/data/state-programmes/' + file), true);
});

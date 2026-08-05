import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contentPath = path.join(root, "content/wirkungswahl-kompass/real-content.json");
const data = JSON.parse(fs.readFileSync(contentPath, "utf8"));

const expected = {
  questions: 36,
  fields: 9,
  parties: 7,
  dimensions: 8,
  programs: 7,
  evidence: 28,
  globalRedLines: 9,
};

for (const [key, count] of Object.entries(expected)) {
  assert.equal(data[key].length, count, `${key} must contain exactly ${count} records`);
}

const partyIds = new Set(data.parties.map((party) => party.id));
const programIds = new Set(data.programs.map((program) => program.id));
const evidenceIds = new Set(data.evidence.map((evidence) => evidence.id));
const validStatuses = new Set([
  "clear_support",
  "leaning_support",
  "mixed",
  "not_evidenced",
  "leaning_opposition",
  "clear_opposition",
]);

for (const source of [...data.programs, ...data.evidence]) {
  assert.match(source.url, /^https:\/\//, `${source.id} must have an HTTPS URL`);
  assert.ok(source.checked_at, `${source.id} must record a check date`);
}

for (const question of data.questions) {
  assert.equal(question.party_positions.length, expected.parties, `${question.id} must have seven party positions`);
  assert.deepEqual(
    new Set(question.party_positions.map((position) => position.party_id)),
    partyIds,
    `${question.id} must reference each party exactly once`,
  );

  for (const position of question.party_positions) {
    assert.ok(validStatuses.has(position.position_status), `${question.id}/${position.party_id} has a known status`);
    if (position.position_status === "not_evidenced") {
      assert.equal(position.stance, null, `${question.id}/${position.party_id} must not turn missing evidence into 0`);
    } else {
      assert.ok(Number.isInteger(position.stance) && position.stance >= -2 && position.stance <= 2,
        `${question.id}/${position.party_id} must use a valid stance`);
    }
    if (position.source_id != null) assert.ok(programIds.has(position.source_id), `${question.id}/${position.party_id} has a known program source`);
  }

  for (const evidenceId of question.impact_assessment.evidence_ids || []) {
    assert.ok(evidenceIds.has(evidenceId), `${question.id} has a known evidence source`);
  }
}

const forbidden = new Set(data.forbiddenFields || []);
for (const forbiddenField of forbidden) {
  assert.equal(Object.hasOwn(data, forbiddenField), false, `${forbiddenField} must not be derived in the dataset`);
}

console.log(`Content checks passed: ${data.questions.length} questions × ${data.parties.length} parties; ${data.programs.length} programs; ${data.evidence.length} evidence records.`);

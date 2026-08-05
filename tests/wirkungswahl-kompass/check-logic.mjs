import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const logicSource = fs.readFileSync(path.join(root, "components/wirkungswahl-kompass/logic.js"), "utf8");
const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(`${logicSource}\nglobalThis.__wwkLogic = WWKLogic;`, sandbox, { filename: "logic.js" });

const { isAnswered, proximity, priorityProfile } = sandbox.__wwkLogic;

assert.equal(isAnswered({ value: 0 }), true, "0 is a valid answer");
assert.equal(isAnswered({ value: "unsure" }), false, "unsure is excluded");
assert.equal(isAnswered({ value: "skip" }), false, "skip is excluded");
assert.equal(isAnswered({}), false, "missing answers are excluded");
assert.deepEqual(JSON.parse(JSON.stringify(proximity(0, null))), { key: "keine", label: "keine Position" }, "null never creates proximity");
assert.equal(proximity(0, 0).key, "hoch", "identical positions are high proximity");
assert.equal(proximity(-2, 2).key, "gegen", "opposing positions remain opposite");

const dimensions = [{ id: "social" }, { id: "climate" }];
const questions = [
  { id: "Q1", dimensions: ["social"] },
  { id: "Q2", dimensions: ["social", "climate"] },
  { id: "Q3", dimensions: ["climate"] },
];
const answers = {
  Q1: { value: 0, importance: 3 },
  Q2: { value: "unsure", importance: 0 },
  Q3: { value: 1 },
};

assert.deepEqual(
  JSON.parse(JSON.stringify(priorityProfile(dimensions, questions, answers))),
  [
    { id: "social", value: 3, includedQuestions: 1 },
    { id: "climate", value: 0, includedQuestions: 0 },
  ],
  "the profile uses only numeric answers with an explicit importance",
);

const changed = { ...answers, Q2: { value: -1, importance: 1 }, Q3: { value: 1, importance: 0 } };
const firstPass = JSON.parse(JSON.stringify(priorityProfile(dimensions, questions, changed)));
const secondPass = JSON.parse(JSON.stringify(priorityProfile(dimensions, questions, changed)));
assert.deepEqual(firstPass, secondPass, "an answer change updates local derivations deterministically");

console.log("Logic checks passed: valid zero, exclusion rules, null positions, explicit importance, deterministic updates.");

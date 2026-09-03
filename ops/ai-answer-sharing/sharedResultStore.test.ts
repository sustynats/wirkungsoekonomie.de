import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SharedResultStore, type SharedResultInput } from "../src/services/sharedResultStore.js";
import { parseSharedResultRequest } from "../src/http/apiServer.js";

const input: SharedResultInput = { target: "woek-ai", title: "Test", question: "Was ist Wirkung?", answer: "Antwort ".repeat(2000), sources: [], sections: [] };
async function fixture() {
  const dir = await mkdtemp(join(tmpdir(), "woek-share-test-"));
  return { file: join(dir, "results.json"), maxItems: 1, maxAgeMs: -1 };
}
describe("durable public AI snapshots", () => {
  it("survives age/count pruning and restart without truncating answers", async () => {
    const options = await fixture();
    const store = new SharedResultStore(options);
    const first = await store.create(input);
    await store.create(input);
    expect((await store.get(first.id))?.answer).toBe(input.answer);
    const restarted = new SharedResultStore(options);
    expect((await restarted.get(first.id))?.answer).toBe(input.answer);
    expect((await readdir(`${options.file}.permanent`)).length).toBe(2);
  });
  it("preserves legacy AI shares before pruning without changing the old file", async () => {
    const options = await fixture();
    const legacy = { ...input, id: "sr-11111111-1111-4111-8111-111111111111", createdAt: "2020-01-01T00:00:00Z" };
    const raw = JSON.stringify({ version: 1, results: [legacy] });
    await writeFile(options.file, raw);
    expect(await new SharedResultStore(options).get(legacy.id)).toEqual(legacy);
    expect(await readFile(options.file, "utf8")).toBe(raw);
  });
  it("rejects path traversal and retains old expiry for other checks", async () => {
    const store = new SharedResultStore(await fixture());
    expect(await store.get("../../private")).toBeUndefined();
    const old = await store.create({ ...input, target: "factcheck" });
    expect(await store.get(old.id)).toBeUndefined();
  });
  it("does not silently clip shared answers; rejects oversize input", () => {
    expect(parseSharedResultRequest(input).answer).toBe(input.answer.trim());
    expect(() => parseSharedResultRequest({ ...input, answer: "x".repeat(80001) })).toThrow();
    expect(parseSharedResultRequest({ ...input, sources: [{ url: "javascript:alert(1)" }] }).sources).toEqual([]);
  });
  it("does not report success if the permanent directory cannot be written", async () => {
    const options = await fixture();
    await writeFile(`${options.file}.permanent`, "not a directory");
    await expect(new SharedResultStore(options).create(input)).rejects.toThrow();
  });
});

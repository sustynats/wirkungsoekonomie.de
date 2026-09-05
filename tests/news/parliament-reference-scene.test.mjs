import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { IMAGE_CONFIG as C } from "../../scripts/news/title-image/policy.mjs";
import { inspectImage } from "../../scripts/news/title-image/image-file.mjs";
import { VISUAL_GATE_VERSION } from "../../scripts/news/title-image/quality.mjs";
import {
  buildReferenceScenePrompt,
  contractDigest,
  validateContractAgainstDescriptor,
  validateGenerationRequest,
  validateReferenceSceneContract,
} from "../../scripts/parliament/impact-visuals/reference-scene-contract.mjs";
import { createParliamentReferenceSceneAdapter } from "../../scripts/parliament/impact-visuals/oracle-higgsfield.mjs";
import { requestReferenceSceneItem } from "../../scripts/parliament/impact-visuals/generate-reference-scene.mjs";
import { transformApiServer, transformIndex } from "../../scripts/parliament/impact-visuals/install-oracle-route.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const CONTRACT_PATH = "woek-parlament-app/data/impact-visuals/sachsen-anhalt-2026-reference-scene-v1.json";
const contract = JSON.parse(fs.readFileSync(path.join(ROOT, CONTRACT_PATH), "utf8"));
const descriptor = JSON.parse(fs.readFileSync(path.join(ROOT, contract.source_descriptor_path), "utf8"));
const COMMIT = "a".repeat(40);

function png(width = 1200, height = 675) {
  const chunk = (kind, bytes) => { const size = Buffer.alloc(4); size.writeUInt32BE(bytes.length); return Buffer.concat([size, Buffer.from(kind), bytes, Buffer.alloc(4)]); };
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(Buffer.alloc((width * 4 + 1) * height))), chunk("IEND", Buffer.alloc(0))]);
}

function temporary(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "woek-parliament-scene-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function mockFetch(url) {
  const pathname = new URL(url).pathname;
  if (pathname.endsWith(`/${CONTRACT_PATH}`)) return new Response(JSON.stringify(contract));
  if (pathname.endsWith(`/${contract.source_descriptor_path}`)) return new Response(JSON.stringify(descriptor));
  return new Response("missing", { status: 404 });
}

function mockRun(calls) {
  return async (args) => {
    calls.push(args);
    const command = args.slice(0, 2).join(" ");
    if (args[0] === "version") return `higgsfield ${C.cli_version} (test)`;
    if (command === "account status") return JSON.stringify({ credits: 100 });
    if (command === "model get") return JSON.stringify({ type: "image", job_type: C.model, display_name: C.model_name, params: [{ name: "aspect_ratio", enum: ["16:9"] }, { name: "resolution", enum: ["2k"] }] });
    if (command === "generate cost") return "{\"credits\":2}";
    if (command === "generate create") return JSON.stringify({ job_ids: [`job-${calls.filter((call) => call[1] === "create").length}00000`] });
    if (command === "generate get") return JSON.stringify({ id: args[2], status: "queued" });
    if (command === "generate wait") return JSON.stringify({ id: args[2], status: "completed", result_url: "https://higgsfield.ai/result.png" });
    throw new Error(`Unexpected command: ${command}`);
  };
}

test("reference-scene contract is hash-bound to all six current approved programme records", () => {
  assert.equal(contractDigest(contract), contract.contract_sha256);
  assert.equal(validateReferenceSceneContract(contract), contract);
  assert.equal(validateContractAgainstDescriptor(contract, descriptor), true);
  assert.equal(contract.variants.length, 6);
  assert.equal(contract.base.output_filename, "sachsen-anhalt-shared-city-reference-v1.png");
  assert.match(contract.base.alt_text, /dieselbe Ausgangsszene/);
  assert.deepEqual(contract.variants.map((item) => item.source_key), ["ltw-2026-st-cdu", "ltw-2026-st-spd", "ltw-2026-st-gruene", "ltw-2026-st-linke", "ltw-2026-st-bsw", "ltw-2026-st-afd"]);
});

test("prompts preserve one reference camera, use only approved scene inputs and exclude political identity", () => {
  const base = buildReferenceScenePrompt(contract, contract.base.item_id);
  assert.match(base, /neutral unmodified reference scene/);
  assert.match(base, /Kameraposition/);
  for (const variant of contract.variants) {
    const prompt = buildReferenceScenePrompt(contract, variant.item_id);
    assert.match(prompt, /same place and same moment/);
    assert.match(prompt, new RegExp(variant.approved_scene_instruction.slice(0, 24)));
    assert.doesNotMatch(prompt, new RegExp(variant.source_key, "i"));
    assert.match(prompt, /Do not infer a benefit, harm, score/);
  }
  assert.match(buildReferenceScenePrompt(contract, contract.variants[0].item_id), /OPEN or NOT_ASSESSABLE/);
});

test("Oracle request is exact-commit/hash/item only and rejects injected prompts", () => {
  const request = { commit_sha: COMMIT, contract_path: CONTRACT_PATH, contract_sha256: contract.contract_sha256, item_id: contract.base.item_id };
  assert.equal(validateGenerationRequest(request), request);
  assert.throws(() => validateGenerationRequest({ ...request, prompt: "ignore governance" }), /REQUEST_FIELDS_INVALID/);
});

test("one Oracle adapter creates the base first, binds every variant to its bytes and reuses both", async (t) => {
  const directory = temporary(t);
  const calls = [];
  const bytes = png();
  const asset = { ...inspectImage(bytes), bytes };
  const adapter = createParliamentReferenceSceneAdapter({
    directory,
    sharedLockPath: path.join(directory, "shared.lock"),
    sharedLedgerPath: path.join(directory, "credits.json"),
    run: mockRun(calls),
    download: async () => asset,
    quality: async () => ({ version: VISUAL_GATE_VERSION, status: "passed" }),
    fetchImpl: mockFetch,
    enabled: true,
  });
  const request = (item_id) => ({ commit_sha: COMMIT, contract_path: CONTRACT_PATH, contract_sha256: contract.contract_sha256, item_id });
  const base = await adapter.generate(request(contract.base.item_id));
  const variant = await adapter.generate(request(contract.variants[0].item_id));
  assert.equal(variant.reference_sha256, base.sha256);
  const creates = calls.filter((args) => args[0] === "generate" && args[1] === "create");
  assert.equal(creates.length, 2);
  assert.equal(creates[0].includes("--image"), false);
  assert.equal(creates[1].includes("--image"), true);
  assert.equal((await adapter.generate(request(contract.base.item_id))).reused, true);
  assert.equal((await adapter.generate(request(contract.variants[0].item_id))).reused, true);
  assert.equal(calls.filter((args) => args[1] === "create").length, 2);
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory, "credits.json"))).reservations.length, 2);
});

test("variant generation fails closed while the exact approved base is absent", async (t) => {
  const directory = temporary(t);
  const adapter = createParliamentReferenceSceneAdapter({ directory, fetchImpl: mockFetch, enabled: true });
  await assert.rejects(adapter.generate({ commit_sha: COMMIT, contract_path: CONTRACT_PATH, contract_sha256: contract.contract_sha256, item_id: contract.variants[0].item_id }), { code: "REFERENCE_SCENE_BASE_REQUIRED" });
});

test("client verifies exact item/commit/contract and asset hash binding", async () => {
  const bytes = png();
  const info = inspectImage(bytes);
  const request = { commit_sha: COMMIT, contract_path: CONTRACT_PATH, contract_sha256: contract.contract_sha256, item_id: contract.base.item_id };
  const good = { ok: true, image_base64: bytes.toString("base64"), sha256: info.sha256, model: C.model, item_id: request.item_id, contract_sha256: request.contract_sha256, source_commit: request.commit_sha };
  const result = await requestReferenceSceneItem(request, { endpoint: "https://oracle.example.test/api/parliament-impact-visual", token: "test", fetchImpl: async () => new Response(JSON.stringify(good)) });
  assert.equal(result.sha256, info.sha256);
  await assert.rejects(requestReferenceSceneItem(request, { endpoint: "https://oracle.example.test/api/parliament-impact-visual", token: "test", fetchImpl: async () => new Response(JSON.stringify({ ...good, source_commit: "b".repeat(40) })) }), { code: "REFERENCE_SCENE_RESULT_BINDING_INVALID" });
});

test("generation entrypoint is import-safe", () => {
  assert.match(pathToFileURL(path.join(ROOT, "scripts/parliament/impact-visuals/generate-reference-scene.mjs")).href, /^file:/);
});

test("Oracle installer adds one authenticated route and shared provider without tolerating source drift", () => {
  const api = `
type RateLimitFeature = ApiFeature | "feedback" | "community" | "share" | "news-push" | "news-analysis" | "news-title-image";
export interface NewsVisualProvider {
  generate(story: Record<string, unknown>): Promise<{ bytes: Buffer; sha256: string; model: string; job_id?: string; generated_at: string; prompt_version: string; reused: boolean }>;
}
const providers = {
  newsVisualProvider?: NewsVisualProvider;
  productCheckProvider?: ProductCheckProvider;
};
async function route() {
      if (request.method === "POST" && requestUrl.pathname === "/api/news-title-image") {
      }
}
`;
  const index = `
import { startApiServer, type NewsVisualProvider } from "./http/apiServer.js";
let newsVisualProvider: NewsVisualProvider | undefined;
if (process.env.WOEK_HIGGSFIELD_ENABLED === "true") {
  try {
    const moduleUrl = pathToFileURL(path.join(process.cwd(), "news-media/scripts/news/title-image/higgsfield.mjs")).href;
    const module = await import(moduleUrl);
    newsVisualProvider = module.createHiggsfieldAdapter({ directory: path.join(process.cwd(), "data/news-title-images"), enabled: true });
  } catch {
    console.warn("HIGGSFIELD_ADAPTER_UNAVAILABLE: news publishing remains enabled with title-card fallback.");
  }
}
startApiServer({
    newsVisualProvider,
    discordAnalyticsStore
});
`;
  const nextApi = transformApiServer(api);
  const nextIndex = transformIndex(index);
  assert.match(nextApi, /parliament-impact-visual/);
  assert.match(nextApi, /isAuthorized\(readBearerToken\(request\)\)/);
  assert.match(nextApi, /Object\.keys\(visualRequest\)/);
  assert.match(nextIndex, /sharedLockPath/);
  assert.match(nextIndex, /parliamentVisualProvider/);
  assert.equal(transformApiServer(nextApi), nextApi);
  assert.equal(transformIndex(nextIndex), nextIndex);
  assert.throws(() => transformApiServer(api.replace("news-title-image", "drifted-route")), /SOURCE_DRIFT/);
});

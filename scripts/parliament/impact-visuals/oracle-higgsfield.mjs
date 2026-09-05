// Oracle-side adapter for a shared Parliament reference scene and six controlled
// programme variants. It uses the same pinned Higgsfield CLI, quality gate and
// cost policy as the Wirkungsticker; no second provider process is created.
import fs from "node:fs";
import path from "node:path";
import {
  checkHiggsfieldAvailability,
  generationResult,
  parseCliJson,
  recoverSubmittedJob,
  runHiggsfield,
} from "../../news/title-image/higgsfield.mjs";
import { downloadImage, inspectImage } from "../../news/title-image/image-file.mjs";
import { checkEditorialAsset, VISUAL_GATE_VERSION } from "../../news/title-image/quality.mjs";
import { IMAGE_CONFIG as C, digest, imageError, safeImageFailure } from "../../news/title-image/policy.mjs";
import {
  buildReferenceScenePrompt,
  referenceSceneItem,
  validateContractAgainstDescriptor,
  validateGenerationRequest,
  validateReferenceSceneContract,
} from "./reference-scene-contract.mjs";

const REPO = "sustynats/wirkungsoekonomie.de";
const RETRY_DELAY_MS = 60_000;

function atomicJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(data), { mode: 0o600 });
  fs.renameSync(temporary, file);
}

function safeCode(error) {
  const code = safeImageFailure(error);
  return code === "TITLE_IMAGE_UNAVAILABLE" && /^[A-Z][A-Z0-9_]{2,90}$/.test(error?.message || "") ? error.message : code;
}

async function fetchPinnedJson(commit, file, { fetchImpl = fetch } = {}) {
  const url = new URL(`https://raw.githubusercontent.com/${REPO}/${commit}/${file}`);
  const response = await fetchImpl(url, { redirect: "error", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw imageError("REFERENCE_SCENE_PINNED_INPUT_UNAVAILABLE");
  const text = await response.text();
  if (Buffer.byteLength(text) > 256 * 1024) throw imageError("REFERENCE_SCENE_PINNED_INPUT_TOO_LARGE");
  try { return JSON.parse(text); }
  catch { throw imageError("REFERENCE_SCENE_PINNED_INPUT_INVALID"); }
}

function qualityFailure(error) {
  const reason = safeCode(error);
  return { version: VISUAL_GATE_VERSION, status: reason === "IMAGE_CONTAINS_TEXT" ? "rejected" : "pending", reason };
}

function readVerifiedRecord(folder, record) {
  if (!record?.file || !/^source-[a-f0-9]{64}\.(?:png|jpg|webp)$/.test(record.file)) return null;
  const file = path.join(folder, record.file);
  if (!fs.existsSync(file)) return null;
  const bytes = fs.readFileSync(file);
  const info = inspectImage(bytes);
  return info.sha256 === record.sha256 ? { file, bytes, info } : null;
}

function takeLock(lockPath) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true, mode: 0o700 });
  try {
    const descriptor = fs.openSync(lockPath, "wx", 0o600);
    fs.writeFileSync(descriptor, String(process.pid));
    return descriptor;
  } catch {
    let stale = false;
    try {
      const owner = Number(fs.readFileSync(lockPath, "utf8"));
      if (Number.isInteger(owner) && owner > 1) {
        try { process.kill(owner, 0); }
        catch (error) { stale = error.code === "ESRCH"; }
      }
    } catch { /* fail closed */ }
    if (!stale) throw imageError("HIGGSFIELD_LOCKED");
    fs.unlinkSync(lockPath);
    const descriptor = fs.openSync(lockPath, "wx", 0o600);
    fs.writeFileSync(descriptor, String(process.pid));
    return descriptor;
  }
}

export function createParliamentReferenceSceneAdapter({
  directory,
  sharedLockPath = path.join(path.dirname(directory || "."), "higgsfield-generation.lock"),
  sharedLedgerPath = path.join(path.dirname(directory || "."), "higgsfield-credits.json"),
  run = runHiggsfield,
  download = downloadImage,
  quality = checkEditorialAsset,
  fetchImpl = fetch,
  now = () => new Date().toISOString(),
  enabled = process.env.WOEK_HIGGSFIELD_ENABLED === "true",
} = {}) {
  if (!directory) throw imageError("HIGGSFIELD_PERSISTENCE_REQUIRED");
  let active = false;
  let unavailableUntil = 0;

  async function loadInput(request) {
    validateGenerationRequest(request);
    const contract = await fetchPinnedJson(request.commit_sha, request.contract_path, { fetchImpl });
    validateReferenceSceneContract(contract);
    if (contract.contract_sha256 !== request.contract_sha256) throw imageError("REFERENCE_SCENE_REQUEST_CONTRACT_MISMATCH");
    const descriptor = await fetchPinnedJson(request.commit_sha, contract.source_descriptor_path, { fetchImpl });
    validateContractAgainstDescriptor(contract, descriptor);
    return { contract, item: referenceSceneItem(contract, request.item_id) };
  }

  async function generate(request) {
    const { contract, item } = await loadInput(request);
    const prompt = buildReferenceScenePrompt(contract, request.item_id);
    const promptSha256 = digest(prompt);
    const folder = path.join(directory, contract.set_id, item.item_id);
    const journal = path.join(folder, "source-visual.json");
    let reference = null;
    if (item.kind === "PROGRAMME_VARIANT") {
      const baseFolder = path.join(directory, contract.set_id, contract.base.item_id);
      const baseJournal = path.join(baseFolder, "source-visual.json");
      if (!fs.existsSync(baseJournal)) throw imageError("REFERENCE_SCENE_BASE_REQUIRED");
      const baseRecord = JSON.parse(fs.readFileSync(baseJournal, "utf8"));
      const verified = readVerifiedRecord(baseFolder, baseRecord);
      if (!verified || baseRecord.quality_gate?.version !== VISUAL_GATE_VERSION || baseRecord.quality_gate.status !== "passed") throw imageError("REFERENCE_SCENE_BASE_NOT_APPROVED");
      reference = { file: verified.file, sha256: verified.info.sha256 };
    }
    let record = fs.existsSync(journal) ? JSON.parse(fs.readFileSync(journal, "utf8")) : null;
    if (record && (record.prompt_sha256 !== promptSha256 || record.contract_sha256 !== contract.contract_sha256 || (record.reference_sha256 || null) !== (reference?.sha256 || null))) throw imageError("REFERENCE_SCENE_IMMUTABLE_REVISION_CONFLICT");
    if (record?.quality_gate?.version === VISUAL_GATE_VERSION && record.quality_gate.status === "rejected") throw imageError(record.quality_gate.reason);
    const saved = readVerifiedRecord(folder, record);
    if (saved) {
      if (record.quality_gate?.version !== VISUAL_GATE_VERSION || record.quality_gate.status !== "passed") {
        try { record.quality_gate = await quality(saved.file); }
        catch (error) { record.quality_gate = qualityFailure(error); atomicJson(journal, record); throw error; }
        atomicJson(journal, record);
      }
      return { ...record, ...saved.info, bytes: saved.bytes, reused: true };
    }
    if (!enabled) throw imageError("HIGGSFIELD_DISABLED");
    if (active) throw imageError("HIGGSFIELD_BUSY");
    if (Date.now() < unavailableUntil) throw imageError("HIGGSFIELD_CIRCUIT_OPEN");
    const lock = takeLock(sharedLockPath);
    active = true;
    try {
      const fail = (status) => {
        record = { ...record, status, failed_at: record?.failed_at || now() };
        atomicJson(journal, record);
        const attempts = record.previous_attempts || [];
        if (status === "cancelled") throw imageError("HIGGSFIELD_PREVIOUS_JOB_FAILED");
        if (attempts.length >= 1) throw imageError("HIGGSFIELD_RETRY_EXHAUSTED");
        throw imageError("HIGGSFIELD_JOB_RETRY_WAIT");
      };
      if (record?.status === "submitted_unknown") {
        const recovered = await recoverSubmittedJob(run, record);
        record.job_id = recovered.id;
        record.status = recovered.status;
        atomicJson(journal, record);
      }
      if (["failed", "error", "cancelled"].includes(record?.status)) {
        if (record.status === "cancelled" || (record.previous_attempts || []).length >= 1) fail(record.status);
        if (!record.failed_at || Date.parse(now()) - Date.parse(record.failed_at) < RETRY_DELAY_MS) fail(record.status);
        const { previous_attempts = [], ...failed } = record;
        record = {
          status: "retry_ready",
          provider: "higgsfield",
          model: C.model,
          cli_version: C.cli_version,
          prompt_version: item.prompt_version,
          prompt_sha256: promptSha256,
          contract_sha256: contract.contract_sha256,
          source_commit: request.commit_sha,
          reference_sha256: reference?.sha256 || null,
          previous_attempts: [...previous_attempts, failed],
        };
        atomicJson(journal, record);
      }
      const args = [C.model, "--prompt", prompt, "--aspect_ratio", C.aspect_ratio, "--resolution", C.resolution];
      if (reference) args.push("--image", reference.file);
      if (!record?.job_id) {
        await checkHiggsfieldAvailability({ run });
        const cost = parseCliJson(await run(["generate", "cost", ...args, "--json"]));
        if (!Number.isFinite(cost.credits) || cost.credits <= 0 || cost.credits > contract.generation.max_credits_per_image) throw imageError("HIGGSFIELD_COST_CHANGED");
        record = {
          status: "submitted_unknown",
          provider: "higgsfield",
          model: C.model,
          cli_version: C.cli_version,
          prompt_version: item.prompt_version,
          prompt_sha256: promptSha256,
          contract_sha256: contract.contract_sha256,
          source_commit: request.commit_sha,
          reference_sha256: reference?.sha256 || null,
          generated_at: now(),
          reserved_credits: cost.credits,
          previous_attempts: record?.previous_attempts || [],
        };
        atomicJson(journal, record);
        const ledger = fs.existsSync(sharedLedgerPath) ? JSON.parse(fs.readFileSync(sharedLedgerPath, "utf8")) : { reservations: [] };
        ledger.reservations.push({ workload: "parliament-reference-scene", set_id: contract.set_id, item_id: item.item_id, at: now(), credits: cost.credits });
        atomicJson(sharedLedgerPath, ledger);
        let submitted = generationResult(parseCliJson(await run(["generate", "create", ...args, "--json"], { timeout: 30_000 })));
        if (!submitted.id) submitted = await recoverSubmittedJob(run, record);
        if (!submitted.id || !/^[a-zA-Z0-9_-]{6,100}$/.test(submitted.id)) throw imageError("HIGGSFIELD_JOB_ID_MISSING");
        record.job_id = submitted.id;
        record.status = submitted.status;
        atomicJson(journal, record);
      }
      let result = generationResult(parseCliJson(await run(["generate", "get", record.job_id, "--json"])));
      if (["failed", "error", "cancelled"].includes(result.status)) fail(result.status);
      for (let attempt = 0; !(result.status === "completed" && result.url) && attempt < 2; attempt += 1) {
        try { result = generationResult(parseCliJson(await run(["generate", "wait", record.job_id, "--timeout", "55s", "--interval", "5s", "--quiet", "--json"], { timeout: 60_000 }))); }
        catch (error) { if (error.code !== "HIGGSFIELD_TIMEOUT" || attempt === 1) throw error; }
        if (["failed", "error", "cancelled"].includes(result.status)) fail(result.status);
      }
      if (!(result.status === "completed" && result.url)) throw imageError("HIGGSFIELD_TIMEOUT");
      const asset = await download(result.url);
      fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
      const filename = `source-${asset.sha256}.${asset.extension}`;
      const output = path.join(folder, filename);
      fs.writeFileSync(output, asset.bytes, { mode: 0o600 });
      record = { ...record, status: "generated", file: filename, sha256: asset.sha256, width: asset.width, height: asset.height, mime: asset.mime };
      atomicJson(journal, record);
      try { record.quality_gate = await quality(output); }
      catch (error) { record.quality_gate = qualityFailure(error); atomicJson(journal, record); throw error; }
      atomicJson(journal, record);
      return { ...record, ...asset, reused: false };
    } catch (error) {
      if (["HIGGSFIELD_AUTH_UNAVAILABLE", "HIGGSFIELD_REQUEST_FAILED", "HIGGSFIELD_CREDITS_UNAVAILABLE"].includes(safeCode(error))) unavailableUntil = Date.now() + 15 * 60_000;
      throw error;
    } finally {
      active = false;
      fs.closeSync(lock);
      fs.unlinkSync(sharedLockPath);
    }
  }

  return { health: () => checkHiggsfieldAvailability({ run }), generate };
}

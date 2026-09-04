// Official CLI only. This adapter also runs on Oracle with persistent OAuth
// configuration and a private job journal. No website cookies or private API.
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { IMAGE_CONFIG as C, buildEditorialImagePrompt, validateStoryId, digest, imageError, safeImageFailure } from "./policy.mjs";
import { downloadImage, inspectImage } from "./image-file.mjs";
import { checkEditorialAsset, VISUAL_GATE_VERSION } from "./quality.mjs";

const exec = promisify(execFile);
export function parseCliJson(text) {
  try { return JSON.parse(text); } catch { throw imageError("HIGGSFIELD_INVALID_JSON"); }
}
export function cliFailure(error) {
  const message = `${error?.stderr || ""} ${error?.message || ""}`;
  if (error?.killed || /timed?\s*out/i.test(message)) return imageError("HIGGSFIELD_TIMEOUT");
  if (error?.code === "ENOENT") return imageError("HIGGSFIELD_CLI_MISSING");
  if (/auth|login|token|unauthorized|forbidden|workspace/i.test(message)) return imageError("HIGGSFIELD_AUTH_UNAVAILABLE");
  return imageError("HIGGSFIELD_REQUEST_FAILED");
}
export async function runHiggsfield(args, { binary = process.env.WOEK_HIGGSFIELD_BIN || "higgsfield", timeout = 15000 } = {}) {
  try { return (await exec(binary, args, { timeout, maxBuffer: 2 * 1024 * 1024, env: { ...process.env, NO_COLOR: "1" } })).stdout; }
  catch (error) { throw cliFailure(error); }
}
export async function checkHiggsfieldAvailability({ run = runHiggsfield } = {}) {
  const version = await run(["version"]);
  if (!version.startsWith(`higgsfield ${C.cli_version} `)) throw imageError("HIGGSFIELD_VERSION_MISMATCH");
  const account = parseCliJson(await run(["account", "status", "--json"]));
  if (!Number.isFinite(account.credits) || account.credits < C.max_credits_per_image) throw imageError("HIGGSFIELD_CREDITS_UNAVAILABLE");
  const model = parseCliJson(await run(["model", "get", C.model, "--json"]));
  if (model.type !== "image" || model.job_type !== C.model || model.display_name !== C.model_name) throw imageError("HIGGSFIELD_MODEL_MISMATCH");
  for (const [name, value] of [["aspect_ratio", C.aspect_ratio], ["resolution", C.resolution]]) {
    if (!model.params?.find((p) => p.name === name)?.enum?.includes(value)) throw imageError("HIGGSFIELD_PARAMETERS_CHANGED");
  }
  return { available: true, version: C.cli_version, model: C.model, credits: account.credits };
}

// Accommodate documented list/job-set and single-job responses; never scan an
// arbitrary string for a URL or mistake an input/reference image for output.
export function generationResult(value) {
  const jobs = Array.isArray(value) ? value : value?.jobs || value?.data?.jobs || value?.job_set?.jobs || (Array.isArray(value?.data) ? value.data : [value?.data || value]);
  for (const job of jobs) {
    const id = job?.id || job?.job_id || job?.request_id;
    const status = String(job?.status || "").toLowerCase();
    const url = job?.result_url || job?.results?.raw?.url || job?.result?.url || job?.results?.[0]?.url;
    if (typeof url === "string" && /^https:\/\//.test(url) && !["failed","error","cancelled"].includes(status)) return { id, status: "completed", url };
  }
  const job = jobs[0] || {};
  return { id: job.id || job.job_id || job.request_id || value?.job_ids?.[0] || value?.ids?.[0], status: String(job.status || "pending").toLowerCase() };
}
export async function recoverSubmittedJob(run, record) {
  const recent = parseCliJson(await run(["generate", "list", "--image", "--size", "20", "--json"]));
  const jobs = Array.isArray(recent) ? recent : recent.jobs || recent.data || [];
  const matches = jobs.filter((job) => job.job_type === C.model && digest(String(job.params?.prompt || "")) === record.prompt_sha256 && Date.parse(job.created_at) >= Date.parse(record.generated_at) - 15000);
  if (matches.length !== 1 || !/^[a-zA-Z0-9_-]{6,100}$/.test(matches[0].id)) throw imageError("HIGGSFIELD_SUBMISSION_UNCERTAIN");
  return { id: matches[0].id, status: matches[0].status };
}
function atomicJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data), { mode: 0o600 });
  fs.renameSync(tmp, file);
}
function qualityFailure(error) {
  const reason = safeImageFailure(error);
  return { version: VISUAL_GATE_VERSION, status: reason === "IMAGE_CONTAINS_TEXT" ? "rejected" : "pending", reason };
}

export function createHiggsfieldAdapter({ directory, run = runHiggsfield, download = downloadImage, quality = checkEditorialAsset, now = () => new Date().toISOString(), enabled = process.env.WOEK_HIGGSFIELD_ENABLED === "true" } = {}) {
  if (!directory) throw imageError("HIGGSFIELD_PERSISTENCE_REQUIRED");
  let active = false, unavailableUntil = 0, health = null;
  return {
    health: () => checkHiggsfieldAvailability({ run }),
    async generate(story) {
      const id = validateStoryId(story.story_id);
      const prompt = buildEditorialImagePrompt(story);
      if (!prompt) throw imageError("NO_SAFE_SYMBOLIC_MOTIF");
      const folder = path.join(directory, id);
      // Only an explicitly queued, current prompt revision may replace a motif.
      // Its independent durable journal retains even an ambiguous paid submit;
      // the last good original remains available to ordinary callers meanwhile.
      const refresh = story.refresh_prompt_version;
      if (refresh && refresh !== C.prompt_version) throw imageError("HIGGSFIELD_REFRESH_VERSION_INVALID");
      const currentJournal = path.join(folder, "source-visual.json");
      const journal = refresh ? path.join(folder, `source-visual-${digest(refresh).slice(0, 16)}.json`) : currentJournal;
      const promote = (record) => {
        if (!refresh) return;
        if (fs.existsSync(currentJournal)) {
          const old = JSON.parse(fs.readFileSync(currentJournal, "utf8"));
          atomicJson(path.join(folder, `source-visual-history-${digest(JSON.stringify(old)).slice(0, 16)}.json`), old);
        }
        atomicJson(currentJournal, record);
      };
      let record = fs.existsSync(journal) ? JSON.parse(fs.readFileSync(journal, "utf8")) : null;
      if (!record && refresh && fs.existsSync(currentJournal)) {
        const current = JSON.parse(fs.readFileSync(currentJournal, "utf8"));
        if (current.prompt_version === refresh) record = current;
      }
      if (record?.quality_gate?.version === VISUAL_GATE_VERSION && record.quality_gate.status === "rejected") throw imageError(record.quality_gate.reason);
      if (record?.file && /^source-[a-f0-9]{64}\.(png|jpg|webp)$/.test(record.file)) {
        const file = path.join(folder, record.file);
        if (fs.existsSync(file)) {
          const bytes = fs.readFileSync(file); const info = inspectImage(bytes);
          if (info.sha256 === record.sha256) {
            if (record.quality_gate?.version !== VISUAL_GATE_VERSION || record.quality_gate.status !== "passed") {
              try { record.quality_gate = await quality(file); }
              catch (error) { record.quality_gate = qualityFailure(error); atomicJson(journal, record); throw error; }
              atomicJson(journal, record);
            }
            promote(record);
            return { ...record, ...info, bytes, reused: true };
          }
        }
      }
      if (!enabled) throw imageError("HIGGSFIELD_DISABLED");
      if (active) throw imageError("HIGGSFIELD_BUSY");
      if (Date.now() < unavailableUntil) throw imageError("HIGGSFIELD_CIRCUIT_OPEN");
      // Cross-process lock plus durable intent: a crash/ambiguous submit MUST NOT
      // spend again. A known job can be polled; an unknown job requires admin audit.
      fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
      const lockPath = path.join(directory, "generation.lock");
      let lock;
      try { lock = fs.openSync(lockPath, "wx", 0o600); }
      catch {
        let stale = false;
        try { const owner = Number(fs.readFileSync(lockPath, "utf8")); if (Number.isInteger(owner) && owner > 1) { try { process.kill(owner, 0); } catch (error) { stale = error.code === "ESRCH"; } } } catch { /* fail closed */ }
        if (!stale) throw imageError("HIGGSFIELD_LOCKED");
        fs.unlinkSync(lockPath);
        try { lock = fs.openSync(lockPath, "wx", 0o600); } catch { throw imageError("HIGGSFIELD_LOCKED"); }
      }
      fs.writeFileSync(lock, String(process.pid));
      active = true;
      try {
        health ||= await checkHiggsfieldAvailability({ run });
        if (record?.status === "submitted_unknown") {
          const recovered = await recoverSubmittedJob(run, record);
          record.job_id = recovered.id; record.status = recovered.status;
          atomicJson(journal, record);
        }
        if (["failed", "cancelled", "error"].includes(record?.status)) throw imageError("HIGGSFIELD_PREVIOUS_JOB_FAILED");
        const ledgerPath = path.join(directory, "credits.json");
        const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, "utf8")) : { reservations: [] };
        if (!record?.job_id) {
          const today = now().slice(0,10), month = today.slice(0,7);
          const daily = ledger.reservations.filter((r) => r.at.startsWith(today)).length;
          const monthly = ledger.reservations.filter((r) => r.at.startsWith(month)).reduce((n,r) => n + r.credits, 0);
          if (daily >= C.max_generations_per_day || monthly + C.max_credits_per_image > C.max_credits_per_month) throw imageError("HIGGSFIELD_CREDIT_LIMIT");
          const args = [C.model, "--prompt", prompt, "--aspect_ratio", C.aspect_ratio, "--resolution", C.resolution];
          const cost = parseCliJson(await run(["generate", "cost", ...args, "--json"]));
          if (!Number.isFinite(cost.credits) || cost.credits <= 0 || cost.credits > C.max_credits_per_image) throw imageError("HIGGSFIELD_COST_CHANGED");
          record = { status: "submitted_unknown", provider: "higgsfield", model: C.model, cli_version: C.cli_version, prompt_version: C.prompt_version, prompt_sha256: digest(prompt), generated_at: now(), reserved_credits: cost.credits };
          atomicJson(journal, record);
          ledger.reservations.push({ story_id: id, at: now(), credits: cost.credits });
          atomicJson(ledgerPath, ledger);
          // Persist job ID before waiting. Retrying a create after a timeout could
          // double-charge; only idempotent job-status/download reads are retried.
          let submitted = generationResult(parseCliJson(await run(["generate", "create", ...args, "--json"], { timeout: 30000 })));
          if (!submitted.id) submitted = await recoverSubmittedJob(run, record);
          if (!submitted.id || !/^[a-zA-Z0-9_-]{6,100}$/.test(submitted.id)) throw imageError("HIGGSFIELD_JOB_ID_MISSING");
          record.job_id = submitted.id; record.status = submitted.status;
          atomicJson(journal, record);
        }
        let result;
        // The CLI wait command can itself time out even for a failed job. Read
        // the terminal state first so such jobs do not remain queued forever.
        const current = generationResult(parseCliJson(await run(["generate", "get", record.job_id, "--json"])));
        if (["failed", "error", "cancelled"].includes(current.status)) {
          record.status = current.status; atomicJson(journal, record);
          throw imageError("HIGGSFIELD_PREVIOUS_JOB_FAILED");
        }
        if (current.status === "completed" && current.url) result = current;
        for (let attempt = 0; attempt < 2; attempt++) {
          if (result?.url) break;
          try {
            result = generationResult(parseCliJson(await run(["generate", "wait", record.job_id, "--timeout", "55s", "--interval", "5s", "--quiet", "--json"], { timeout: 60000 })));
            if (result.status === "completed" && result.url) break;
            if (["failed","error","cancelled"].includes(result.status)) { record.status = result.status; atomicJson(journal, record); throw imageError("HIGGSFIELD_GENERATION_FAILED"); }
          } catch (error) {
            if (error.code !== "HIGGSFIELD_TIMEOUT" || attempt === 1) throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt + Math.floor(Math.random() * 200)));
        }
        if (!result?.url) throw imageError("HIGGSFIELD_TIMEOUT");
        let asset;
        for (let attempt = 0; attempt < 2; attempt++) {
          try { asset = await download(result.url); break; }
          catch (error) { if (attempt || error.code !== "IMAGE_DOWNLOAD_FAILED") throw error; }
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
        const filename = `source-${asset.sha256}.${asset.extension}`;
        fs.writeFileSync(path.join(folder, filename), asset.bytes, { mode: 0o600 });
        record = { ...record, status: "generated", file: filename, sha256: asset.sha256, width: asset.width, height: asset.height, mime: asset.mime };
        atomicJson(journal, record);
        try { record.quality_gate = await quality(path.join(folder, filename)); }
        catch (error) { record.quality_gate = qualityFailure(error); atomicJson(journal, record); throw error; }
        atomicJson(journal, record);
        promote(record);
        return { ...record, bytes: asset.bytes, reused: false };
      } catch (error) {
        if (["HIGGSFIELD_AUTH_UNAVAILABLE","HIGGSFIELD_REQUEST_FAILED","HIGGSFIELD_CREDITS_UNAVAILABLE"].includes(safeImageFailure(error))) { unavailableUntil = Date.now() + 15 * 60000; health = null; }
        throw error;
      } finally {
        active = false;
        fs.closeSync(lock);
        fs.unlinkSync(lockPath);
      }
    },
  };
}

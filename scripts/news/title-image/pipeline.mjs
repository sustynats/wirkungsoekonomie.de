import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { IMAGE_CONFIG as C, chooseTitleImageMode, buildEditorialImagePrompt, digest, validateStoryId, imageError, safeImageFailure } from "./policy.mjs";
import { inspectImage, downloadImage } from "./image-file.mjs";
import { renderTitleImageFromStory, storyToTitleInput, SIZES } from "./index.mjs";
import { rasterize } from "./rasterize.mjs";

const exec = promisify(execFile);
const REPO = "sustynats/wirkungsoekonomie.de";
const ROOT = path.resolve(import.meta.dirname, "../../..");
const FALLBACK = "/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png";
const assetUrl = (tag, name) => `https://github.com/${REPO}/releases/download/${tag}/${name}`;
const TERMINAL = new Set(["HIGGSFIELD_DISABLED", "NO_SAFE_SYMBOLIC_MOTIF", "HIGGSFIELD_PREVIOUS_JOB_FAILED", "HIGGSFIELD_RETRY_EXHAUSTED", "HIGGSFIELD_SUBMISSION_UNCERTAIN", "IMAGE_CONTAINS_TEXT"]);
function retryFields(reason, now) {
  if (!reason || TERMINAL.has(reason)) return {};
  return { retry_after: new Date(Date.parse(now()) + (reason === "HIGGSFIELD_CREDIT_LIMIT" ? 360 : 15) * 60000).toISOString() };
}
export function publicTitleImage(value) {
  if (!value) return null;
  const result = { mode: value.mode, label: value.mode === "editorial" ? "KI-generiertes Symbolbild" : "Wirkungskarte · WÖk-Einordnung" };
  for (const key of ["og", "wide", "square"]) {
    const file = value[key];
    if (file && typeof file.url === "string" && (file.url === FALLBACK || /^https:\/\/github\.com\/sustynats\/wirkungsoekonomie\.de\/releases\/download\/wirkungsticker-media-\d{4}-\d{2}\/wt-[a-f0-9]{16}-[a-f0-9]{16}-(?:og|wide|square)\.png$/.test(file.url))) result[key] = { url: file.url, width: SIZES[key].width, height: SIZES[key].height };
  }
  return ["og", "wide", "square"].some(key => result[key]) ? result : null;
}
export function titleFingerprint(story, mode, sourceHash = null) {
  const input = storyToTitleInput(story, { mode, image: null });
  return digest(JSON.stringify({ input, sourceHash, template: C.template_version }));
}
export async function generateEditorialVisual(story, { endpoint = process.env.WOEK_NEWS_VISUAL_API_URL, token = process.env.WOEK_NEWS_ANALYSIS_TOKEN, fetchImpl = fetch } = {}) {
  if (!endpoint || !token) throw imageError("HIGGSFIELD_NOT_CONFIGURED");
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || url.username || url.password) throw imageError("HIGGSFIELD_ENDPOINT_INVALID");
  const response = await fetchImpl(url, { method: "POST", redirect: "error", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(C.generation_timeout_ms + 60000), body: JSON.stringify({ story_id: story.story_id, title: story.title, source_summary: story.source_summary, topic: story.topic, claims: (story.claims || []).slice(0,10).map((c) => ({ claim: c.claim })), ...(story.refresh_prompt_version ? { refresh_prompt_version: story.refresh_prompt_version } : {}) }) });
  if (!response.ok) throw imageError(response.status === 403 ? "HIGGSFIELD_AUTH_UNAVAILABLE" : "HIGGSFIELD_PROVIDER_UNAVAILABLE");
  const chunks = []; let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > C.max_image_bytes * 1.4) throw imageError("IMAGE_SIZE_INVALID");
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  let result; try { result = JSON.parse(text); } catch { throw imageError("HIGGSFIELD_INVALID_JSON"); }
  if (!result.ok || typeof result.image_base64 !== "string") throw imageError(/^[A-Z_]{3,70}$/.test(result.reason || "") ? result.reason : "HIGGSFIELD_GENERATION_FAILED");
  const bytes = Buffer.from(result.image_base64, "base64");
  const info = inspectImage(bytes);
  if (info.sha256 !== result.sha256 || result.model !== C.model) throw imageError("HIGGSFIELD_ASSET_MISMATCH");
  return { ...info, bytes, model: result.model, job_id: result.job_id, generated_at: result.generated_at, reused: Boolean(result.reused), prompt_version: result.prompt_version };
}

export function createReleaseStore({ run = async (args) => (await exec("gh", args, { timeout: 90000, maxBuffer: 1024 * 1024 })).stdout, download = downloadImage } = {}) {
  const knownTags = new Set();
  return async function publish(files, { tag }) {
    if (!/^wirkungsticker-media-\d{4}-\d{2}$/.test(tag)) throw imageError("IMAGE_RELEASE_INVALID");
    if (!knownTags.has(tag)) {
      try { await run(["release", "view", tag, "--repo", REPO, "--json", "tagName"]); }
      catch {
        await run(["release", "create", tag, "--repo", REPO, "--target", "main", "--title", `Wirkungsticker-Medien ${tag.slice(-7)}`, "--notes", "Unveränderliche Originalmotive und gerenderte Titelbilder des Wirkungstickers. KI-Motive sind Symbolbilder, keine Ereignisfotografien.", "--latest=false"]);
      }
      knownTags.add(tag);
    }
    const release = JSON.parse(await run(["release", "view", tag, "--repo", REPO, "--json", "assets"]));
    const existing = new Map(release.assets.map((a) => [a.name, a]));
    for (const file of files) {
      if (!/^[a-z0-9.-]+$/.test(path.basename(file))) throw imageError("IMAGE_ASSET_NAME_INVALID");
      const old = existing.get(path.basename(file));
      if (old) {
        const expected = digest(fs.readFileSync(file));
        if (old.size !== fs.statSync(file).size) throw imageError("IMAGE_IMMUTABLE_ASSET_CONFLICT");
        const actual = old.digest?.replace(/^sha256:/, "") || (await download(assetUrl(tag, path.basename(file)), { minWidth: 1080 })).sha256;
        if (actual !== expected) throw imageError("IMAGE_IMMUTABLE_ASSET_CONFLICT");
        continue;
      }
      await run(["release", "upload", tag, file, "--repo", REPO]); // never --clobber
    }
    return Object.fromEntries(files.map((file) => [path.basename(file), assetUrl(tag, path.basename(file))]));
  };
}

export function createTitleImagePipeline({ root = ROOT, generate = generateEditorialVisual, render = renderTitleImageFromStory, raster = rasterize, publish = createReleaseStore(), download = downloadImage, now = () => new Date().toISOString(), allowGeneration = true, maxGenerations = C.max_generations_per_run } = {}) {
  let generations = 0, circuitOpen = false;
  return async function prepare(story, { dryRun = false, cardsOnly = false } = {}) {
    const decision = chooseTitleImageMode(story);
    const refresh = story.title_image?.refresh_prompt_version;
    if (refresh) {
      const { refresh_prompt_version: _revision, retry_after: _retry, refresh_failure: _failure, ...previous } = story.title_image;
      if (refresh !== C.prompt_version || decision.mode !== "editorial" || cardsOnly) {
        return { title_image: previous, report: { story_id: story.story_id, status: "preserved", reason: "EDITORIAL_REFRESH_NOT_ALLOWED" } };
      }
      if (previous.source_visual?.prompt_version === refresh) return prepare({ ...story, title_image: previous }, { dryRun, cardsOnly });
      if (dryRun) return { story_id: story.story_id, ...decision, would_generate: allowGeneration, refresh_prompt_version: refresh };
      if (!allowGeneration) return { title_image: story.title_image, report: { story_id: story.story_id, status: "preserved", reason: "EDITORIAL_REFRESH_REQUIRES_GENERATION" } };
      const result = await prepare({ ...story, title_image: undefined, refresh_prompt_version: refresh });
      if (result.title_image?.mode === "editorial" && result.title_image.source_visual?.prompt_version === refresh && ["og", "wide", "square"].every(key => publicTitleImage(result.title_image)?.[key])) return result;
      const reason = result.title_image?.fallback_reason || "EDITORIAL_REFRESH_NOT_READY";
      const retry = retryFields(reason, now);
      // A failed paid motif must not block a successfully rendered free card
      // upgrade. Existing editorial pictures are still preserved unchanged.
      const fallback = previous.mode === "impact_card" && result.title_image?.mode === "impact_card"
        && result.title_image.template_version === C.template_version
        && ["og", "wide", "square"].every(key => publicTitleImage(result.title_image)?.[key]) ? result.title_image : previous;
      return { title_image: { ...fallback, refresh_failure: reason, ...(retry.retry_after ? { refresh_prompt_version: refresh, ...retry } : {}) }, report: { ...result.report, status: "preserved", reason } };
    }
    if (dryRun) return { story_id: story.story_id, ...decision, prompt: buildEditorialImagePrompt(story), asset_directory: `source-assets/wirkungsticker/${story.story_id}/`, would_generate: decision.mode === "editorial" && !story.title_image?.source_visual };
    const started = Date.now();
    const log = { story_id: story.story_id, requested_mode: decision.mode, reason: decision.reason, higgsfield_called: false, source_reused: false, title_reused: false };
    const previous = story.title_image;
    let mode = cardsOnly ? "impact_card" : decision.mode, source = previous?.source_visual || null, original = null, fallbackReason = null;
    try {
      const id = validateStoryId(story.story_id);
      const directory = path.join(root, "source-assets/wirkungsticker", id);
      fs.mkdirSync(directory, { recursive: true });
      if (previous?.mode === mode && previous.fingerprint === titleFingerprint(story, mode, mode === "editorial" ? source?.sha256 : null) && ["og","wide","square"].every((key) => publicTitleImage(previous)?.[key]?.url?.startsWith("https://github.com/"))) {
        return { title_image: previous, report: { ...log, mode, status: "reused", source_reused: Boolean(source), title_reused: true, duration_ms: Date.now() - started } };
      }
      if (mode === "editorial") {
        if (source?.url && /^[a-f0-9]{64}$/.test(source.sha256)) {
          try {
            original = await download(source.url);
            if (original.sha256 !== source.sha256) { original = null; throw imageError("SOURCE_VISUAL_HASH_MISMATCH"); }
            log.source_reused = true;
          } catch (error) { fallbackReason = safeImageFailure(error); }
        } else if (previous?.fallback_reason && TERMINAL.has(previous.fallback_reason)) {
          fallbackReason = previous.fallback_reason;
        } else if (!cardsOnly && allowGeneration && !circuitOpen && generations < maxGenerations) {
          generations += 1; log.higgsfield_called = true;
          try { original = await generate(story); log.source_reused = Boolean(original.reused); }
          catch (error) { fallbackReason = safeImageFailure(error); circuitOpen = ["HIGGSFIELD_AUTH_UNAVAILABLE","HIGGSFIELD_PROVIDER_UNAVAILABLE","HIGGSFIELD_NOT_CONFIGURED","HIGGSFIELD_CIRCUIT_OPEN"].includes(fallbackReason); }
        } else fallbackReason = cardsOnly || !allowGeneration ? "HIGGSFIELD_DISABLED" : circuitOpen ? "HIGGSFIELD_CIRCUIT_OPEN" : "HIGGSFIELD_RUN_LIMIT";
        if (!original) mode = "impact_card";
      }
      const fingerprint = titleFingerprint(story, mode, original?.sha256);
      if (previous?.fingerprint === fingerprint && ["og","wide","square"].every((key) => publicTitleImage(previous)?.[key]?.url?.startsWith("https://github.com/"))) {
        log.title_reused = true;
        const { retry_after: _oldRetry, ...stable } = previous;
        return { title_image: { ...stable, ...(fallbackReason ? { fallback_reason: fallbackReason } : {}), ...retryFields(fallbackReason, now) }, report: { ...log, mode, status: "reused", ...(fallbackReason ? { fallback_reason: fallbackReason } : {}), duration_ms: Date.now() - started } };
      }
      const tag = `wirkungsticker-media-${now().slice(0,7)}`;
      const files = [];
      if (original && !source?.url) {
        const info = inspectImage(original.bytes);
        const file = path.join(directory, `${id}-${info.sha256.slice(0,16)}-source.${info.extension}`);
        fs.writeFileSync(file, original.bytes); files.push(file);
        await publish([file], { tag });
        source = { url: assetUrl(tag, path.basename(file)), sha256: info.sha256, width: info.width, height: info.height, mime: info.mime, provider: "higgsfield", model: C.model, prompt_version: original.prompt_version || C.prompt_version, generated_at: original.generated_at || now() };
      }
      const image = original ? { src: `data:${original.mime};base64,${original.bytes.toString("base64")}`, focus: "right" } : null;
      const outputs = {};
      for (const [size, dimensions] of Object.entries(SIZES)) {
        // On-site wide images accompany a real, selectable HTML heading. OG and
        // square remain complete posters with headline for independent sharing.
        let rendered = render(story, { mode, image, size, headlineVisible: size !== "wide" });
        let png;
        try { png = await raster(rendered.svg, { ...dimensions, prefer: "chrome" }); }
        catch (error) {
          if (mode !== "editorial") throw error;
          mode = "impact_card"; fallbackReason = "EDITORIAL_RENDER_FAILED";
          // Restart all sizes coherently, rather than mixing modes/labels.
          return await prepare({ ...story, title_image: { ...previous, source_visual: source } }, { cardsOnly: true });
        }
        const info = inspectImage(png.png, { minWidth: dimensions.width });
        if (info.width !== dimensions.width || info.height !== dimensions.height) throw imageError("RASTER_DIMENSIONS_INVALID");
        // Renderers can produce different bytes for the same semantic input.
        // Address the immutable publication by its actual bytes, not the input.
        const file = path.join(directory, `${id}-${info.sha256.slice(0,16)}-${size}.png`);
        fs.writeFileSync(file, png.png); files.push(file);
        outputs[size] = { url: assetUrl(tag, path.basename(file)), width: dimensions.width, height: dimensions.height, sha256: digest(png.png) };
      }
      await publish(files, { tag }); // durable BEFORE adding URLs to canonical data
      const retryable = fallbackReason && !TERMINAL.has(fallbackReason);
      return { title_image: { mode, ...outputs, source_visual: source, fingerprint, template_version: C.template_version, prompt_version: source?.prompt_version || C.prompt_version, generated_at: now(), status: fallbackReason ? "fallback" : "generated", ...(fallbackReason ? { fallback_reason: fallbackReason } : {}), ...(retryable ? { retry_after: new Date(Date.parse(now()) + 15 * 60000).toISOString() } : {}) }, report: { ...log, mode, status: fallbackReason ? "fallback" : "generated", ...(fallbackReason ? { fallback_reason: fallbackReason } : {}), duration_ms: Date.now() - started } };
    } catch (error) {
      const reason = safeImageFailure(error);
      return { title_image: { mode: "impact_card", source_visual: source, og: { url: FALLBACK, ...SIZES.og }, status: "fallback", fallback_reason: reason, ...retryFields(reason, now) }, report: { ...log, mode: "impact_card", status: "fallback", fallback_reason: reason, duration_ms: Date.now() - started } };
    }
  };
}

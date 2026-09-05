#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const API_ROUTE_MARKER = 'requestUrl.pathname === "/api/parliament-impact-visual"';
const INDEX_PROVIDER_MARKER = "let parliamentVisualProvider: ParliamentVisualProvider | undefined;";

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`ORACLE_ROUTE_${label}_${count === 0 ? "SOURCE_DRIFT" : "AMBIGUOUS"}`);
  return source.replace(before, after);
}

export function transformApiServer(source) {
  if (source.includes(API_ROUTE_MARKER)) return source;
  let output = replaceOnce(
    source,
    'type RateLimitFeature = ApiFeature | "feedback" | "community" | "share" | "news-push" | "news-analysis" | "news-title-image";',
    'type RateLimitFeature = ApiFeature | "feedback" | "community" | "share" | "news-push" | "news-analysis" | "news-title-image" | "parliament-impact-visual";',
    "RATE_LIMIT",
  );
  output = replaceOnce(
    output,
    `export interface NewsVisualProvider {
  generate(story: Record<string, unknown>): Promise<{ bytes: Buffer; sha256: string; model: string; job_id?: string; generated_at: string; prompt_version: string; reused: boolean }>;
}
`,
    `export interface NewsVisualProvider {
  generate(story: Record<string, unknown>): Promise<{ bytes: Buffer; sha256: string; model: string; job_id?: string; generated_at: string; prompt_version: string; reused: boolean }>;
}

export interface ParliamentVisualProvider {
  health(): Promise<{ available: boolean; version: string; model: string }>;
  generate(request: Record<string, unknown>): Promise<{ bytes: Buffer; sha256: string; provider: string; model: string; job_id?: string; generated_at: string; prompt_version: string; reused: boolean; reference_sha256?: string | null; contract_sha256: string; source_commit: string }>;
}
`,
    "PROVIDER_INTERFACE",
  );
  output = replaceOnce(
    output,
    `  newsVisualProvider?: NewsVisualProvider;
  productCheckProvider?: ProductCheckProvider;`,
    `  newsVisualProvider?: NewsVisualProvider;
  parliamentVisualProvider?: ParliamentVisualProvider;
  productCheckProvider?: ProductCheckProvider;`,
    "PROVIDER_REGISTRY",
  );
  output = replaceOnce(
    output,
    `      if (request.method === "POST" && requestUrl.pathname === "/api/news-title-image") {`,
    `      if ((request.method === "GET" || request.method === "POST") && requestUrl.pathname === "/api/parliament-impact-visual") {
        if (!providers.newsPushService?.isAuthorized(readBearerToken(request))) {
          sendJson(response, 403, { ok: false, reason: "NOT_AUTHORIZED" });
          return;
        }
        enforceRateLimit(request, rateLimit, "parliament-impact-visual", 60);
        if (!providers.parliamentVisualProvider) {
          sendJson(response, 200, { ok: false, reason: "HIGGSFIELD_NOT_CONFIGURED" });
          return;
        }
        if (request.method === "GET") {
          try {
            const health = await providers.parliamentVisualProvider.health();
            sendJson(response, 200, { ok: health.available === true, service: "parliament-impact-visual", provider: "higgsfield", model: health.model, cli_version: health.version });
          } catch (error) {
            const code = (error as { code?: string })?.code || "";
            sendJson(response, 200, { ok: false, reason: /^[A-Z][A-Z0-9_]{2,90}$/.test(code) ? code : "HIGGSFIELD_UNAVAILABLE" });
          }
          return;
        }
        const body = await readJsonBody(request, 5000);
        const visualRequest = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
        const allowed = new Set(["commit_sha", "contract_path", "contract_sha256", "item_id"]);
        if (Object.keys(visualRequest).some((key) => !allowed.has(key)) || typeof visualRequest.commit_sha !== "string" || !/^[a-f0-9]{40}$/.test(visualRequest.commit_sha) || typeof visualRequest.contract_path !== "string" || !/^woek-parlament-app\\/data\\/impact-visuals\\/[a-z0-9-]+\\.json$/.test(visualRequest.contract_path) || typeof visualRequest.contract_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(visualRequest.contract_sha256) || typeof visualRequest.item_id !== "string" || !/^[a-z0-9-]{10,120}$/.test(visualRequest.item_id)) {
          sendJson(response, 400, { ok: false, reason: "REFERENCE_SCENE_REQUEST_INVALID" });
          return;
        }
        try {
          const result = await providers.parliamentVisualProvider.generate(visualRequest);
          sendJson(response, 200, { ok: true, image_base64: result.bytes.toString("base64"), sha256: result.sha256, provider: result.provider, model: result.model, job_id: result.job_id, generated_at: result.generated_at, prompt_version: result.prompt_version, reused: result.reused, reference_sha256: result.reference_sha256 || null, item_id: visualRequest.item_id, contract_sha256: result.contract_sha256, source_commit: result.source_commit });
        } catch (error) {
          const code = (error as { code?: string; message?: string })?.code || (error as { message?: string })?.message || "";
          sendJson(response, 200, { ok: false, reason: /^[A-Z][A-Z0-9_]{2,90}$/.test(code) ? code : "REFERENCE_SCENE_UNAVAILABLE" });
        }
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/news-title-image") {`,
    "HTTP_ROUTE",
  );
  if (!output.includes(API_ROUTE_MARKER)) throw new Error("ORACLE_ROUTE_API_VALIDATION_FAILED");
  return output;
}

export function transformIndex(source) {
  if (source.includes(INDEX_PROVIDER_MARKER)) return source;
  let output = replaceOnce(
    source,
    'import { startApiServer, type NewsVisualProvider } from "./http/apiServer.js";',
    'import { startApiServer, type NewsVisualProvider, type ParliamentVisualProvider } from "./http/apiServer.js";',
    "INDEX_IMPORT",
  );
  output = replaceOnce(
    output,
    `let newsVisualProvider: NewsVisualProvider | undefined;
if (process.env.WOEK_HIGGSFIELD_ENABLED === "true") {
  try {
    const moduleUrl = pathToFileURL(path.join(process.cwd(), "news-media/scripts/news/title-image/higgsfield.mjs")).href;
    const module = await import(moduleUrl);
    newsVisualProvider = module.createHiggsfieldAdapter({ directory: path.join(process.cwd(), "data/news-title-images"), enabled: true });
  } catch {
    console.warn("HIGGSFIELD_ADAPTER_UNAVAILABLE: news publishing remains enabled with title-card fallback.");
  }
}`,
    `let newsVisualProvider: NewsVisualProvider | undefined;
let parliamentVisualProvider: ParliamentVisualProvider | undefined;
if (process.env.WOEK_HIGGSFIELD_ENABLED === "true") {
  const dataDirectory = path.join(process.cwd(), "data");
  const sharedLockPath = path.join(dataDirectory, "news-title-images/generation.lock");
  const sharedLedgerPath = path.join(dataDirectory, "news-title-images/credits.json");
  try {
    const moduleUrl = pathToFileURL(path.join(process.cwd(), "news-media/scripts/news/title-image/higgsfield.mjs")).href;
    const module = await import(moduleUrl);
    newsVisualProvider = module.createHiggsfieldAdapter({ directory: path.join(dataDirectory, "news-title-images"), sharedLockPath, sharedLedgerPath, enabled: true });
  } catch {
    newsVisualProvider = undefined;
    console.warn("HIGGSFIELD_ADAPTER_UNAVAILABLE: news publishing remains enabled with title-card fallback.");
  }
  try {
    const moduleUrl = pathToFileURL(path.join(process.cwd(), "news-media/scripts/parliament/impact-visuals/oracle-higgsfield.mjs")).href;
    const module = await import(moduleUrl);
    parliamentVisualProvider = module.createParliamentReferenceSceneAdapter({ directory: path.join(dataDirectory, "parliament-impact-visuals"), sharedLockPath, sharedLedgerPath, enabled: true });
  } catch {
    parliamentVisualProvider = undefined;
    console.warn("PARLIAMENT_HIGGSFIELD_ADAPTER_UNAVAILABLE: Parliament generation remains fail-closed.");
  }
}`,
    "INDEX_PROVIDER_SETUP",
  );
  output = replaceOnce(
    output,
    `    newsVisualProvider,
    discordAnalyticsStore`,
    `    newsVisualProvider,
    parliamentVisualProvider,
    discordAnalyticsStore`,
    "INDEX_PROVIDER_REGISTRATION",
  );
  if (!output.includes(INDEX_PROVIDER_MARKER)) throw new Error("ORACLE_ROUTE_INDEX_VALIDATION_FAILED");
  return output;
}

export function transformOracleSource({ sourceDirectory, apply = false, backupDirectory } = {}) {
  if (!sourceDirectory) throw new Error("ORACLE_ROUTE_SOURCE_DIRECTORY_REQUIRED");
  const apiFile = path.join(sourceDirectory, "src/http/apiServer.ts");
  const indexFile = path.join(sourceDirectory, "src/index.ts");
  const currentApi = fs.readFileSync(apiFile, "utf8");
  const currentIndex = fs.readFileSync(indexFile, "utf8");
  const nextApi = transformApiServer(currentApi);
  const nextIndex = transformIndex(currentIndex);
  const changed = currentApi !== nextApi || currentIndex !== nextIndex;
  if (apply && changed) {
    if (!backupDirectory) throw new Error("ORACLE_ROUTE_BACKUP_DIRECTORY_REQUIRED");
    fs.mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });
    const backupApi = path.join(backupDirectory, "apiServer.ts");
    const backupIndex = path.join(backupDirectory, "index.ts");
    if (fs.existsSync(backupApi) || fs.existsSync(backupIndex)) throw new Error("ORACLE_ROUTE_BACKUP_ALREADY_EXISTS");
    fs.copyFileSync(apiFile, backupApi, fs.constants.COPYFILE_EXCL);
    fs.copyFileSync(indexFile, backupIndex, fs.constants.COPYFILE_EXCL);
    const write = (file, content) => {
      const temporary = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(temporary, content, { mode: fs.statSync(file).mode });
      fs.renameSync(temporary, file);
    };
    write(apiFile, nextApi);
    write(indexFile, nextIndex);
  }
  return { changed, applied: Boolean(apply && changed), apiFile, indexFile };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const value = (name) => {
    const index = process.argv.indexOf(`--${name}`);
    return index >= 0 ? process.argv[index + 1] : null;
  };
  const result = transformOracleSource({
    sourceDirectory: value("source") || "/opt/faktencheck-bot",
    apply: process.argv.includes("--apply"),
    backupDirectory: value("backup"),
  });
  console.log(JSON.stringify(result, null, 2));
}

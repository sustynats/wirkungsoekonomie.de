import JSZip from "jszip";
import { importReviewResult } from "@/lib/editorial/review-results";
import { materializeReviewFollowUpTasks } from "@/lib/editorial/review-follow-up-tasks";

const dropboxApi = "https://api.dropboxapi.com/2";
const dropboxContentApi = "https://content.dropboxapi.com/2";
const maximumResultArchiveBytes = 20 * 1024 * 1024;

type DropboxEntry = {
  ".tag": "file" | "folder" | "deleted";
  name: string;
  path_lower?: string;
  path_display?: string;
};

type DropboxListResponse = {
  entries: DropboxEntry[];
  cursor: string;
  has_more: boolean;
};

type ImportedFile = {
  filename: string;
  importedResults: number;
  reviewIds: string[];
};

function configuration() {
  return {
    appKey: process.env.DROPBOX_APP_KEY,
    appSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    inboxPath: process.env.DROPBOX_REVIEW_RESULTS_PATH,
    previewHook: process.env.REVIEW_PREVIEW_DEPLOY_HOOK,
  };
}

export function dropboxReviewInboxReady() {
  const config = configuration();
  return Boolean(config.appKey && config.appSecret && config.refreshToken && config.inboxPath);
}

export function isReviewResultZipName(name: string) {
  return name.toLowerCase().endsWith(".zip") && /(?:^|[-_])(?:review[-_])?results?(?:[-_.]|$)/i.test(name);
}

function normalizedDropboxPath(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("/") || trimmed.includes("..")) {
    throw new Error("Dropbox review path must be an absolute, normalized Dropbox path.");
  }
  return trimmed;
}

async function accessToken() {
  const config = configuration();
  if (!config.appKey || !config.appSecret || !config.refreshToken) throw new Error("Dropbox review inbox is not configured.");
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: config.refreshToken });
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${config.appKey}:${config.appSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Dropbox access token refresh failed (${response.status}).`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Dropbox returned no access token.");
  return payload.access_token;
}

async function dropboxJson<T>(token: string, endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${dropboxApi}/${endpoint}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Dropbox ${endpoint} failed (${response.status}).`);
  return response.json() as Promise<T>;
}

async function listInbox(token: string, inboxPath: string) {
  const files: DropboxEntry[] = [];
  let page = await dropboxJson<DropboxListResponse>(token, "files/list_folder", {
    path: inboxPath,
    recursive: false,
    include_deleted: false,
    include_non_downloadable_files: false,
  });
  files.push(...page.entries);
  while (page.has_more) {
    page = await dropboxJson<DropboxListResponse>(token, "files/list_folder/continue", { cursor: page.cursor });
    files.push(...page.entries);
  }
  return files.filter((entry) => entry[".tag"] === "file" && isReviewResultZipName(entry.name));
}

async function downloadFile(token: string, path: string) {
  const response = await fetch(`${dropboxContentApi}/files/download`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "dropbox-api-arg": JSON.stringify({ path }),
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Dropbox result download failed (${response.status}).`);
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > maximumResultArchiveBytes) throw new Error("Dropbox result ZIP exceeds the permitted size.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > maximumResultArchiveBytes) {
    throw new Error("Dropbox result ZIP has an invalid size.");
  }
  return bytes;
}

async function importResultArchive(bytes: Uint8Array) {
  const zip = await JSZip.loadAsync(bytes);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir && /(^|\/)review-result\.json$/.test(entry.name));
  if (entries.length === 0 || entries.length > 15) throw new Error("Result ZIP must contain between one and fifteen review-result.json files.");
  if (Object.keys(zip.files).some((name) => name.split("/").includes(".."))) throw new Error("Result ZIP contains an unsafe path.");
  const results = [];
  for (const entry of entries) results.push(await importReviewResult(JSON.parse(await entry.async("string"))));
  return results;
}

async function ensureProcessedFolder(token: string, path: string) {
  const response = await fetch(`${dropboxApi}/files/create_folder_v2`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ path, autorename: false }),
    signal: AbortSignal.timeout(10_000),
  });
  if (response.ok || response.status === 409) return;
  throw new Error(`Dropbox processed folder could not be created (${response.status}).`);
}

async function moveProcessedFile(token: string, fromPath: string, processedPath: string, filename: string) {
  await dropboxJson(token, "files/move_v2", {
    from_path: fromPath,
    to_path: `${processedPath}/${filename}`,
    autorename: true,
    allow_shared_folder: true,
  });
}

async function requestPreview(hook: string | undefined) {
  if (!hook) return "NOT_CONFIGURED" as const;
  const response = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Review preview deployment hook failed (${response.status}).`);
  return "REQUESTED" as const;
}

export async function processDropboxReviewInbox() {
  if (!dropboxReviewInboxReady()) {
    return { status: "NOT_CONFIGURED" as const, examined: 0, imported: [] as ImportedFile[], preview: "NOT_CONFIGURED" as const };
  }
  const config = configuration();
  const inboxPath = normalizedDropboxPath(config.inboxPath!);
  const processedPath = `${inboxPath}/processed`;
  const token = await accessToken();
  const candidates = await listInbox(token, inboxPath);
  const imported: ImportedFile[] = [];
  await ensureProcessedFolder(token, processedPath);
  for (const candidate of candidates) {
    const sourcePath = candidate.path_lower ?? candidate.path_display;
    if (!sourcePath) continue;
    const results = await importResultArchive(await downloadFile(token, sourcePath));
    imported.push({
      filename: candidate.name,
      importedResults: results.length,
      reviewIds: results.map((result) => result.reviewId),
    });
    await moveProcessedFile(token, sourcePath, processedPath, candidate.name);
  }
  const followUp = imported.length ? await materializeReviewFollowUpTasks() : { created: 0, existing: 0, byReadiness: {} };
  const preview = imported.length ? await requestPreview(config.previewHook) : "NOT_REQUIRED" as const;
  return { status: "COMPLETED" as const, examined: candidates.length, imported, followUp, preview };
}

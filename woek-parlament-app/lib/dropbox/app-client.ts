const dropboxApi = "https://api.dropboxapi.com/2";
const dropboxAuthApi = "https://api.dropboxapi.com";
const dropboxContentApi = "https://content.dropboxapi.com/2";
let lastGrantedScopes = "not reported";

export type DropboxFileEntry = {
  ".tag": "file";
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  client_modified?: string;
  server_modified?: string;
  size?: number;
};

type DropboxEntry = DropboxFileEntry | {
  ".tag": "folder" | "deleted";
  id?: string;
  name: string;
  path_lower?: string;
  path_display?: string;
};

type DropboxListResponse = {
  entries: DropboxEntry[];
  cursor: string;
  has_more: boolean;
};

function credentials() {
  return {
    appKey: process.env.DROPBOX_APP_KEY,
    appSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
  };
}

export function dropboxAppReady() {
  const value = credentials();
  return Boolean(value.appKey && value.appSecret && value.refreshToken);
}

export function normalizeDropboxPath(value: string) {
  const normalized = value.trim().replace(/\/+$/, "");
  if (!normalized.startsWith("/") || normalized.includes("..") || normalized.includes("//")) {
    throw new Error("Dropbox path must be absolute and normalized.");
  }
  return normalized;
}

async function accessToken() {
  const value = credentials();
  if (!value.appKey || !value.appSecret || !value.refreshToken) {
    throw new Error("Dropbox application credentials are not configured.");
  }
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: value.refreshToken });
  const response = await fetch(`${dropboxAuthApi}/oauth2/token`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${value.appKey}:${value.appSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Dropbox token refresh failed (${response.status}).`);
  const result = await response.json() as { access_token?: string; scope?: string };
  if (!result.access_token) throw new Error("Dropbox returned no access token.");
  lastGrantedScopes = result.scope?.trim() || "not reported";
  return result.access_token;
}

async function dropboxJson<T>(token: string, endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${dropboxApi}/${endpoint}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Dropbox ${endpoint} failed (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function listDropboxFiles(folderPath: string) {
  const token = await accessToken();
  const path = normalizeDropboxPath(folderPath);
  const entries: DropboxFileEntry[] = [];
  let page = await dropboxJson<DropboxListResponse>(token, "files/list_folder", {
    path,
    recursive: false,
    include_deleted: false,
    include_non_downloadable_files: false,
  });
  entries.push(...page.entries.filter((entry): entry is DropboxFileEntry => entry[".tag"] === "file"));
  while (page.has_more) {
    page = await dropboxJson<DropboxListResponse>(token, "files/list_folder/continue", { cursor: page.cursor });
    entries.push(...page.entries.filter((entry): entry is DropboxFileEntry => entry[".tag"] === "file"));
  }
  return entries;
}

export async function downloadDropboxText(filePath: string, maximumBytes = 5 * 1024 * 1024) {
  const token = await accessToken();
  const path = normalizeDropboxPath(filePath);
  const response = await fetch(`${dropboxContentApi}/files/download`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path }) },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Dropbox file download failed (${response.status}).`);
  const declaredLength = Number(response.headers.get("content-length") ?? "0");
  if (declaredLength > maximumBytes) throw new Error("Dropbox input exceeds the permitted size.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maximumBytes) throw new Error("Dropbox input exceeds the permitted size.");
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function downloadDropboxTextIfPresent(filePath: string, maximumBytes = 20 * 1024 * 1024) {
  try {
    return await downloadDropboxText(filePath, maximumBytes);
  } catch (error) {
    if (error instanceof Error && /\(409\)/.test(error.message)) return null;
    throw error;
  }
}

async function ensureDropboxFolder(token: string, folderPath: string) {
  const segments = normalizeDropboxPath(folderPath).split("/").filter(Boolean);
  let current = "";
  for (const segment of segments) {
    current += `/${segment}`;
    const response = await fetch(`${dropboxApi}/files/create_folder_v2`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ path: current, autorename: false }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok && response.status !== 409) {
      throw new Error(`Dropbox state folder could not be created (${response.status}).`);
    }
  }
}

/** Creates an explicit Dropbox folder tree without placing placeholder files
 * in it. Existing folders are accepted, but malformed paths fail closed. */
export async function ensureDropboxFolders(folderPaths: string[]) {
  const token = await accessToken();
  for (const folderPath of folderPaths) await ensureDropboxFolder(token, folderPath);
}

export async function uploadDropboxText(filePath: string, content: string) {
  const token = await accessToken();
  const path = normalizeDropboxPath(filePath);
  await ensureDropboxFolder(token, path.slice(0, path.lastIndexOf("/")));
  const response = await fetch(`${dropboxContentApi}/files/upload`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/octet-stream",
      "dropbox-api-arg": JSON.stringify({ path, mode: "overwrite", autorename: false, mute: true, strict_conflict: false }),
    },
    body: content,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500).replace(/\s+/g, " ").trim();
    throw new Error(
      `Dropbox state upload failed (${response.status})${detail ? `: ${detail}` : "."} Granted scopes: ${lastGrantedScopes}.`,
    );
  }
  return response.json() as Promise<{ id: string; path_display: string; rev: string }>;
}

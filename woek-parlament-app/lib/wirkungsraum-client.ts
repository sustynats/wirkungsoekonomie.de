"use client";

const PORTAL_ORIGIN = "https://parlament.wirkungsoekonomie.de";
const WORKSPACE_ORIGIN = "https://wirkungsoekonomie.de";
const storageKey = "woek-parliament-bookmarks-v1";

export type ParliamentBookmark = {
  id: string;
  title: string;
  url: string;
  itemType: "link" | "document" | "source";
};

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function validBookmark(value: unknown): value is ParliamentBookmark {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ParliamentBookmark>;
  if (typeof item.id !== "string" || typeof item.title !== "string" || typeof item.url !== "string") return false;
  if (item.itemType !== "link" && item.itemType !== "document" && item.itemType !== "source") return false;
  try {
    const url = new URL(item.url);
    return url.protocol === "https:" && url.hostname === "parlament.wirkungsoekonomie.de";
  } catch {
    return false;
  }
}

export function parliamentBookmark({ title, path, itemType }: Omit<ParliamentBookmark, "id" | "url"> & { path: string }): ParliamentBookmark {
  const target = new URL(path, PORTAL_ORIGIN);
  if (target.origin !== PORTAL_ORIGIN || !path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Bookmarks must point to a public portal page.");
  }
  const normalizedTitle = title.replace(/\s+/g, " ").trim().slice(0, 240);
  return {
    id: `parlament-${target.pathname.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase()}`,
    title: normalizedTitle,
    url: target.toString(),
    itemType
  };
}

export function pendingParliamentBookmarks(): ParliamentBookmark[] {
  const raw = storage()?.getItem(storageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(validBookmark).slice(0, 20) : [];
  } catch {
    return [];
  }
}

function write(items: ParliamentBookmark[]) {
  storage()?.setItem(storageKey, JSON.stringify(items.slice(0, 20)));
}

export function isPendingParliamentBookmark(id: string): boolean {
  return pendingParliamentBookmarks().some((item) => item.id === id);
}

export function toggleParliamentBookmark(item: ParliamentBookmark): boolean {
  const existing = pendingParliamentBookmarks();
  const saved = existing.some((candidate) => candidate.id === item.id);
  write(saved ? existing.filter((candidate) => candidate.id !== item.id) : [item, ...existing.filter((candidate) => candidate.id !== item.id)]);
  return !saved;
}

function base64(value: string): string {
  return btoa(Array.from(new TextEncoder().encode(value), (byte) => String.fromCharCode(byte)).join(""));
}

export function wirkungsraumHandoffUrl(returnTo: string): string {
  const handoff = new URL("/mein-wirkungsraum/", WORKSPACE_ORIGIN);
  const returnUrl = new URL(returnTo, PORTAL_ORIGIN);
  // The selection is intentionally transferred in the URL fragment. Fragments
  // are not sent in the HTTP request and are removed by the destination after
  // the local import, so a personal reading list does not enter server logs.
  const handoffState = new URLSearchParams();
  if (returnUrl.origin === PORTAL_ORIGIN) handoffState.set("returnTo", returnUrl.toString());
  const items = pendingParliamentBookmarks();
  if (items.length) handoffState.set("parliamentBookmarks", base64(JSON.stringify(items)));
  handoff.hash = handoffState.toString();
  return handoff.toString();
}

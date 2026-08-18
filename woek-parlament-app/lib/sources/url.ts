import { createHash } from "node:crypto";

export function isSafePublicSourceUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sourceSlugForCanonicalUrl(value: string) {
  const safeUrl = isSafePublicSourceUrl(value);
  if (!safeUrl) return null;
  return `quelle-${createHash("sha256").update(safeUrl).digest("hex").slice(0, 16)}`;
}

export function sourceDetailHrefForUrl(value: string) {
  const slug = sourceSlugForCanonicalUrl(value);
  return slug ? `/quellen/${slug}` : "/quellen";
}

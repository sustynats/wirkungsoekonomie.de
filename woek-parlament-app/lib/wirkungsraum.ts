const PORTAL_ORIGIN = "https://parlament.wirkungsoekonomie.de";
const WORKSPACE_ORIGIN = "https://wirkungsoekonomie.de";

export type WirkungsraumItemType = "link" | "document" | "source";

/**
 * Sends a public-page bookmark to the existing personal workspace on the
 * main domain. It remains local to that browser, as documented there.
 */
export function wirkungsraumBookmarkUrl({
  title,
  path,
  itemType = "document"
}: {
  title: string;
  path: string;
  itemType?: WirkungsraumItemType;
}): string {
  const target = new URL(normalizePortalPath(path), PORTAL_ORIGIN);
  const handoff = new URL("/mein-wirkungsraum/", WORKSPACE_ORIGIN);
  handoff.searchParams.set("save", "1");
  handoff.searchParams.set("title", title.trim().slice(0, 240));
  handoff.searchParams.set("url", target.toString());
  handoff.searchParams.set("itemType", itemType);
  handoff.searchParams.set("source", "Wirkungsportal Parlament");
  handoff.searchParams.set("returnTo", target.toString());
  return handoff.toString();
}

export function wirkungsraumUrl(): string {
  return `${WORKSPACE_ORIGIN}/mein-wirkungsraum/`;
}

function normalizePortalPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("A Wirkungsraum bookmark must use a portal-relative path.");
  }
  return path;
}

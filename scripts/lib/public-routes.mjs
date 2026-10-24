import fs from "node:fs";
import path from "node:path";

export const SITE_ORIGIN = "https://wirkungsoekonomie.de";
export const DEFAULT_MANIFEST = "assets/data/public-routes.json";

const INTERNAL_ROUTE_SEGMENTS = new Set([
  "_debug",
  "admin",
  "api",
  "assets",
  "intern",
]);

function normalizedRelative(file, root) {
  return path.relative(root, file).split(path.sep).join("/");
}

function encodePathSegment(segment) {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

export function routeFromFile(relative) {
  const parts = String(relative).replaceAll("\\", "/").split("/").filter(Boolean);
  if (!parts.length || parts.at(-1)?.toLowerCase() !== "index.html") {
    return `/${parts.map(encodePathSegment).join("/")}`;
  }
  parts.pop();
  return parts.length ? `/${parts.map(encodePathSegment).join("/")}/` : "/";
}

function walkHtmlFiles(root, directory = root, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, "de"))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(root, file, files);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(file);
  }
  return files;
}

function attribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : "";
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) || [];
}

function decodeEntitiesOnce(value) {
  const named = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["nbsp", " "],
    ["quot", '"'],
  ]);
  return String(value || "")
    .replace(/&#(\d+);/g, (_match, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&#x([a-f\d]+);/gi, (_match, hexadecimal) => String.fromCodePoint(Number.parseInt(hexadecimal, 16)))
    .replace(/&([a-z]+);/gi, (match, entity) => named.get(entity.toLowerCase()) ?? match);
}

export function decodeHtmlText(value) {
  let decoded = String(value || "");
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decodeEntitiesOnce(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  return decoded.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function metadata(html, route) {
  const htmlTag = tags(html, "html")[0] || "";
  const language = (attribute(htmlTag, "lang") || "de").split("-")[0].toLowerCase();
  let noindex = false;
  let redirect = false;
  for (const tag of tags(html, "meta")) {
    const name = attribute(tag, "name").toLowerCase();
    const content = attribute(tag, "content");
    if (["robots", "googlebot"].includes(name) && /(?:^|[,\s])noindex(?:[,\s]|$)/i.test(content)) noindex = true;
    if (attribute(tag, "http-equiv").toLowerCase() === "refresh") redirect = true;
  }
  let canonical = "";
  for (const tag of tags(html, "link")) {
    if (attribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")) {
      canonical = attribute(tag, "href");
      break;
    }
  }
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return { route, language, noindex, redirect, canonical, title: decodeHtmlText(titleMatch?.[1] || "") };
}

function canonicalRoute(value, route) {
  if (!value) return { route, external: false };
  try {
    const resolved = new URL(value, new URL(route, SITE_ORIGIN));
    if (!["wirkungsoekonomie.de", "www.wirkungsoekonomie.de"].includes(resolved.hostname.toLowerCase())) {
      return { route: resolved.href, external: true };
    }
    return { route: resolved.pathname, external: false };
  } catch {
    return { route: value, external: true };
  }
}

function exclusionReason(relative, meta) {
  const firstSegment = decodeURIComponent(meta.route).split("/").filter(Boolean)[0]?.toLowerCase() || "";
  if (relative === "404.html") return "notFound";
  if (meta.redirect) return "redirect";
  if (meta.noindex) return "noindex";
  if (firstSegment === "en") return "inactiveLocale";
  if (firstSegment.startsWith(".") || firstSegment.startsWith("_") || INTERNAL_ROUTE_SEGMENTS.has(firstSegment)) return "internal";
  const canonical = canonicalRoute(meta.canonical, meta.route);
  if (canonical.external || canonical.route !== meta.route) return "alternateCanonical";
  return "";
}

function areaFor(route) {
  const segments = decodeURIComponent(route).split("/").filter(Boolean);
  if (!segments.length || (segments.length === 1 && !route.endsWith("/"))) return "start";
  return segments[0];
}

export function collectPublicRoutes(root) {
  const absoluteRoot = path.resolve(root);
  const excluded = {};
  const routes = [];

  for (const file of walkHtmlFiles(absoluteRoot)) {
    const relative = normalizedRelative(file, absoluteRoot);
    const route = routeFromFile(relative);
    const html = fs.readFileSync(file, "utf8");
    const meta = metadata(html, route);
    const reason = exclusionReason(relative, meta);
    if (reason) {
      excluded[reason] = (excluded[reason] || 0) + 1;
      continue;
    }
    routes.push({
      url: route,
      file: relative,
      area: areaFor(route),
      language: meta.language,
      title: meta.title,
      bytes: Buffer.byteLength(html),
    });
  }

  routes.sort((left, right) => left.url.localeCompare(right.url, "de"));
  const seen = new Set();
  for (const item of routes) {
    if (seen.has(item.url)) throw new Error(`Public route occurs more than once: ${item.url}`);
    seen.add(item.url);
  }

  const byArea = {};
  for (const item of routes) byArea[item.area] = (byArea[item.area] || 0) + 1;
  const orderedExcluded = Object.fromEntries(Object.entries(excluded).sort(([left], [right]) => left.localeCompare(right)));
  const orderedAreas = Object.fromEntries(Object.entries(byArea).sort(([left], [right]) => left.localeCompare(right, "de")));
  const htmlFiles = routes.length + Object.values(orderedExcluded).reduce((total, count) => total + count, 0);

  return {
    schemaVersion: 1,
    origin: SITE_ORIGIN,
    policy: {
      indexableOnly: true,
      canonicalOnly: true,
      inactiveRoutePrefixes: ["/en/"],
      internalRoutePrefixes: [...INTERNAL_ROUTE_SEGMENTS].sort().map((segment) => `/${segment}/`),
    },
    counts: { htmlFiles, routes: routes.length, excluded: orderedExcluded, byArea: orderedAreas },
    routes,
  };
}

export function writePublicRoutes(root, output = path.join(root, DEFAULT_MANIFEST), { check = false } = {}) {
  const manifest = collectPublicRoutes(root);
  // This generated lookup is not a manuscript or an immutable source snapshot.
  // Keep its values and the exact regeneration gate, without shipping indentation.
  const serialized = `${JSON.stringify(manifest)}\n`;
  const absoluteOutput = path.resolve(output);
  if (check) {
    if (!fs.existsSync(absoluteOutput) || fs.readFileSync(absoluteOutput, "utf8") !== serialized) {
      throw new Error(`Public route manifest is missing or stale: ${absoluteOutput}`);
    }
  } else {
    fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
    fs.writeFileSync(absoluteOutput, serialized, "utf8");
  }
  return manifest;
}

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const artifactDir = path.join(root, "_site");
const publicReleaseAssetsFile = path.join(root, "assets", "data", "public-release-assets.json");

const excludedTopLevelDirs = new Set([
  ".git",
  ".github",
  ".claude",
  ".next",
  ".codex-backup",
  "_internal",
  "_site",
  "components",
  "content",
  "data",
  "docs",
  "export",
  "lib",
  "manifest",
  "node_modules",
  "outputs",
  "public",
  "reports",
  "scripts",
  "source-assets",
  "src",
  "templates",
  "tiktok_archive",
  "tiktok_library",
  "tools",
  "woek-akademie-app",
  "woek-institut-app",
]);

const excludedTopLevelFiles = new Set([
  ".git",
  ".gitignore",
  "AGENTS.md",
  "BLOG-WORKFLOW.md",
  "BRAND-GUIDE.md",
  "README.md",
  "SITE-INVENTORY.md",
  "begruenderin-integration-audit.md",
  "blog-audit.md",
  "glossar-integration-audit.md",
  "linkedin-co2-preis-warum-wir-ihn-ohnehin-zahlen-entwurf.md",
  "linkedin-warum-billig-oft-teuer-ist-entwurf.md",
  "package.json",
  "performance-audit.md",
  "qa-report.md",
  "redirect-map.md",
  "sprach-audit.md",
]);

const allowedRootFileExtensions = new Set([
  ".html",
  ".txt",
  ".xml",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".webmanifest",
]);

const allowedRootFiles = new Set([
  "CNAME",
  "sw.js",
]);

const legacyRedirectFiles = [
  "docs/wirtschaft-unternehmen/source-html/detail_impact_controlling_im_unternehmen.html",
];

function removeArtifact() {
  fs.rmSync(artifactDir, { recursive: true, force: true });
  fs.mkdirSync(artifactDir, { recursive: true });
}

function loadPublicReleaseAssets() {
  if (!fs.existsSync(publicReleaseAssetsFile)) return new Map();
  const data = JSON.parse(fs.readFileSync(publicReleaseAssetsFile, "utf8"));
  return new Map(Object.entries(data.assets || {}));
}

const publicReleaseAssets = loadPublicReleaseAssets();

function releaseAssetReferenceVariants(relative) {
  const variants = new Set([
    relative,
    `/${relative}`,
    `https://wirkungsoekonomie.de/${relative}`,
  ]);
  const encoded = relative
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  variants.add(encoded);
  variants.add(`/${encoded}`);
  variants.add(`https://wirkungsoekonomie.de/${encoded}`);
  for (let depth = 1; depth <= 8; depth += 1) {
    variants.add(`${"../".repeat(depth)}${relative}`);
    variants.add(`${"../".repeat(depth)}${encoded}`);
  }
  return [...variants].sort((a, b) => b.length - a.length);
}

const publicReleaseAssetRewrites = [...publicReleaseAssets.entries()].flatMap(([relative, url]) =>
  releaseAssetReferenceVariants(relative).map((variant) => [variant, url]),
);
const publicReleaseAssetRewriteMap = new Map(publicReleaseAssetRewrites);
const publicReleaseAssetPattern = /(?:https:\/\/wirkungsoekonomie\.de\/|\/|(?:\.\.\/){1,8})?(?:assets\/audio|assets\/video|assets\/pdf|assets\/downloads|content\/governance|public\/downloads|docs)\/[^"'<>\\]+?\.(?:docx|mp3|mp4|pdf|xlsx|zip)(?=[?#"'<>\\\s]|$)/gi;

function rewritePublicReleaseAssetReferences(content) {
  if (!publicReleaseAssets.size) return content;
  if (
    !content.includes("assets/") &&
    !content.includes("content/governance/") &&
    !content.includes("public/downloads/") &&
    !content.includes("docs/") &&
    !content.includes("wirkungsoekonomie.de/")
  ) {
    return content;
  }

  return content.replace(publicReleaseAssetPattern, (match) => {
    const direct = publicReleaseAssetRewriteMap.get(match);
    if (direct) return direct;

    const normalized = match
      .replace(/^https:\/\/wirkungsoekonomie\.de\//, "")
      .replace(/^\/+/, "")
      .replace(/^(?:\.\.\/)+/, "");
    const normalizedUrl = publicReleaseAssets.get(normalized);
    if (normalizedUrl) return normalizedUrl;

    try {
      const decoded = decodeURI(normalized);
      return publicReleaseAssets.get(decoded) || match;
    } catch {
      return match;
    }
  });
}

function shouldCopyRootFile(name) {
  if (excludedTopLevelFiles.has(name)) return false;
  if (allowedRootFiles.has(name)) return true;
  return allowedRootFileExtensions.has(path.extname(name).toLowerCase());
}

function copyEntry(entry) {
  const source = path.join(root, entry.name);
  const destination = path.join(artifactDir, entry.name);

  if (entry.isDirectory()) {
    if (excludedTopLevelDirs.has(entry.name)) return false;
    fs.cpSync(source, destination, { recursive: true, preserveTimestamps: true });
    return true;
  }

  if (entry.isFile() && shouldCopyRootFile(entry.name)) {
    fs.copyFileSync(source, destination);
    return true;
  }

  return false;
}

function collectSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += collectSize(full);
    else if (entry.isFile()) total += fs.statSync(full).size;
  }
  return total;
}

function walkFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, files);
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function toPosixRelative(file) {
  return path.relative(artifactDir, file).split(path.sep).join("/");
}

function removeFile(file, reason) {
  fs.rmSync(file, { force: true });
  console.log(`Pruned ${toPosixRelative(file)} (${reason}).`);
}

function decodeReference(value) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function addPublicDocumentDownloadReferences(references) {
  const manifestPath = path.join(root, "content/documents/documents.json");
  if (!fs.existsSync(manifestPath)) return;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return;
  }

  const publicVisibilities = new Set(["public", "expert_public", "archive"]);
  for (const document of manifest.documents || []) {
    const filePath = String(document.filePath || "");
    if (!document.downloadAllowed) continue;
    if (!publicVisibilities.has(String(document.visibility || ""))) continue;
    if (!filePath.startsWith("public/downloads/")) continue;
    references.add(filePath);
  }
}

function collectArtifactReferences() {
  const searchableExtensions = new Set([
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".txt",
    ".xml",
  ]);
  const references = new Set();
  for (const file of walkFiles(artifactDir)) {
    if (!searchableExtensions.has(path.extname(file).toLowerCase())) continue;
    const relative = toPosixRelative(file);
    if (
      relative.startsWith("assets/search/") ||
      relative === "assets/data/term-registry.json"
    ) {
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(/(?:href|src|contentUrl|url)=(?:"|')([^"']+)(?:"|')|https?:\/\/wirkungsoekonomie\.de\/([^"'\s<>]+)|(?:\.\.\/|\.\/)?(?:assets|data|downloads|dokumente|public)\/[^\s"'<>),]+/g)) {
      const raw = match[1] || match[2] || match[0];
      const withoutOrigin = raw.replace(/^https?:\/\/wirkungsoekonomie\.de\//, "");
      const withoutQuery = withoutOrigin.split("#")[0].split("?")[0];
      if (!withoutQuery || withoutQuery.startsWith("http")) continue;
      const normalized = withoutQuery.replace(/^\.?\//, "").replace(/^(\.\.\/)+/, "");
      references.add(decodeReference(normalized));
    }
  }
  addPublicDocumentDownloadReferences(references);
  return references;
}

function copyReferencedPublicFiles() {
  const references = collectArtifactReferences();
  const copyableExtensions = new Set([
    ".avif",
    ".csv",
    ".gif",
    ".jpeg",
    ".jpg",
    ".json",
    ".mp3",
    ".pdf",
    ".png",
    ".svg",
    ".webp",
    ".xlsx",
  ]);
  let copied = 0;

  for (const relative of references) {
    const ext = path.extname(relative).toLowerCase();
    if (!copyableExtensions.has(ext)) continue;

    const source = path.join(root, relative);
    const destination = path.join(artifactDir, relative);
    if (!fs.existsSync(source) || fs.existsSync(destination)) continue;

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied += 1;
  }

  if (copied) console.log(`Copied ${copied} referenced public support files.`);
}

function copySnapshotManifestFiles() {
  const manifestPath = path.join(artifactDir, "data/wirkungskompass/snapshot-manifest.json");
  if (!fs.existsSync(manifestPath)) return;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return;
  }

  let copied = 0;
  for (const snapshot of manifest.snapshots || []) {
    if (!snapshot.path || typeof snapshot.path !== "string") continue;
    const normalized = snapshot.path.replace(/^\/+/, "");
    if (!normalized.startsWith("data/wirkungskompass/snapshots/")) continue;
    const source = path.join(root, normalized);
    const destination = path.join(artifactDir, normalized);
    if (!fs.existsSync(source) || fs.existsSync(destination)) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied += 1;
  }

  if (copied) console.log(`Copied ${copied} Wirkungskompass snapshot files from manifest.`);
}

function copyPublicRuntimeContentData() {
  const publicJsonFiles = [
    ...["compass-answer-templates.json", "compass-questions.json", "compass-topics.json", "impact-paths.json"]
      .map((fileName) => path.join("content/kompass", fileName)),
    path.join("content/wissen", "wissenskarten.json"),
    path.join("public/data", "en-document-translation-manifest.json"),
  ];

  let copied = 0;

  for (const relative of publicJsonFiles) {
    const source = path.join(root, relative);
    const destination = path.join(artifactDir, relative);
    if (!fs.existsSync(source)) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied += 1;
  }

  if (copied) console.log(`Copied ${copied} public runtime content data files.`);
}

function copyLegacyRedirectFiles() {
  let copied = 0;
  for (const relative of legacyRedirectFiles) {
    const source = path.join(root, relative);
    const destination = path.join(artifactDir, relative);
    if (!fs.existsSync(source)) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied += 1;
  }
  if (copied) console.log(`Copied ${copied} legacy redirect files.`);
}

function sanitizePublicDataString(value) {
  return String(value || "")
    .replace(/https?:\/\/[^"'\s<>]+\.(?:md|docx?|rtf)(?:[?#][^"'\s<>]*)?/gi, "")
    .replace(/\/(?:assets|downloads|docs|content|public)\/[^"'\s<>]+\.(?:md|docx?|rtf)(?:[?#][^"'\s<>]*)?/gi, "")
    .replace(/\b[\wÄÖÜäöüß.+() -]+\.(?:md|docx?|rtf)\b/giu, "")
    .replace(/\b(?:Source-Hash|Source-Version|Import-Version|Live-Reference-Version|partially-delta-reviewed)\b/gi, "")
    .replace(/technischer Volltextimport|Abschnitts- und Absatz-IDs sind vorbereitet/gi, "")
    .replace(/Originaldatei\s*:/gi, "Ausgangsdokument:")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizePublicJsonValue(value) {
  if (typeof value === "string") return sanitizePublicDataString(value);
  if (Array.isArray(value)) return value.map(sanitizePublicJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizePublicJsonValue(item)]),
    );
  }
  return value;
}

function normalizePublicArtifactLinksAndText() {
  const textExtensions = new Set([
    ".csv",
    ".html",
    ".htm",
    ".js",
    ".json",
    ".md",
    ".txt",
    ".xml",
  ]);
  let changed = 0;

  for (const file of walkFiles(artifactDir)) {
    const ext = path.extname(file).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    let content = fs.readFileSync(file, "utf8");
    const before = content;
    const relative = toPosixRelative(file);
    const preserveMainworkFulltext = relative === "referenz/volltext/index.html";

    content = rewritePublicReleaseAssetReferences(content)
      .replace(/([?&])utm_source=chatgpt\.com(?:&amp;|&)?/gi, (match, separator) => {
        if (match.endsWith("&amp;") || match.endsWith("&")) return separator;
        return "";
      })
      .replace(/\?(&amp;|&)/g, "?")
      .replace(/(?:\?|&(?:amp;)+|&)utm_source=chatgpt\.com/gi, "")
      .replaceAll(
        "docs/go2-produktionsreihenfolge/source/woek_go2_produktionsreihenfolge_detailkonzepte_v1_0.xlsx",
        "assets/downloads/go2-produktionsreihenfolge/woek_go2_produktionsreihenfolge_detailkonzepte_v1_0.xlsx",
      );

    if (ext === ".json") {
      try {
        content = `${JSON.stringify(sanitizePublicJsonValue(JSON.parse(content)), null, 2)}\n`;
      } catch {
        content = sanitizePublicDataString(content);
      }
      if (content !== before) {
        fs.writeFileSync(file, content, "utf8");
        changed += 1;
      }
      continue;
    }

    if (ext === ".js") {
      content = content
        .replace(/(["'])([^"']*\.(?:md|docx?|rtf)(?:[^"']*)?)\1/gi, (match, quote, value) => {
          if (!/(?:^|\/|\\)(?:assets|downloads|docs|public|content|src|rang\d+|woek_|WOeK_|WÖk_|README|[0-9]{2}_)/.test(value)) return match;
          return `${quote}${quote}`;
        })
        .replace(/\b([\w-]*(?:Download|Url|File|Document|Target|path|file_name)\w*)\s*:\s*(["'])[^"']*\.(?:md|docx?|rtf)(?:[^"']*)?\2/gi, "$1: \"\"");
      if (content !== before) {
        fs.writeFileSync(file, content, "utf8");
        changed += 1;
      }
      continue;
    }

    if (!preserveMainworkFulltext) {
      content = content
        .replace(/<section class="meta-box">\s*<h2>Metadaten<\/h2>[\s\S]*?<\/section>/gi, "")
        .replace(/<section class="callout live-reference-notice">[\s\S]*?<\/section>/gi, "")
        .replace(/<section class="callout">\s*<h2>Importstatus<\/h2>[\s\S]*?<\/section>/gi, "")
        .replace(/<dt>(?:Source-Hash|Source-Version|Import-Version|Live-Reference-Version|Web-Version|Reviewstatus|Originaldatei|Absätze\/Textblöcke)<\/dt><dd>[\s\S]*?<\/dd>/gi, "")
        .replace(/Webfassung und Originaldatei:/gi, "Öffentliche Webfassung:")
        .replace(/Webfassung eines Arbeitspapiers der Wirkungsökonomie mit Originaldatei\./gi, "Öffentliche Webfassung eines Arbeitspapiers der Wirkungsökonomie.")
        .replace(/Webfassung aus der gelieferten Originaldatei\.[^<]*/gi, "Öffentliche Webfassung.")
        .replace(/Originaldatei/gi, "Ausgangsdokument")
        .replace(/href=(["'])[^"']*\.(?:md|docx?|rtf)(?:[^"']*)\1/gi, 'href="#" data-public-link-removed="true"')
        .replace(/(["'])([^"']*\.(?:md|docx?|rtf)(?:[^"']*)?)\1/gi, (match, quote, value) => {
          if (!/(?:^|\/|\\)(?:assets|downloads|docs|public|content|src|rang\d+|woek_|WOeK_|WÖk_|README|[0-9]{2}_)/.test(value)) return match;
          return `${quote}${quote}`;
        })
        .replace(/\b([\w-]*(?:Download|Url|File|Document|Target|path|file_name)\w*)\s*:\s*(["'])[^"']*\.(?:md|docx?|rtf)(?:[^"']*)?\2/gi, "$1: \"\"")
        .replace(/"((?:docxUrl|detailDownload|dossierDownload|downloadUrl|sourceDocument|online_target|path|file_name|source|expected|originalName|name))"\s*:\s*"[^"]*\.(?:md|docx?|rtf)(?:[^"]*)?"/gi, '"$1": ""');
    }

    if (ext !== ".js" && !preserveMainworkFulltext) {
      content = content.replace(/(?:^|[\s"'>(])[\p{L}\p{N}_ .+()/-]+\.(?:md|docx?|rtf)/giu, (match) => {
        const prefix = /^[\s"'>(]/u.test(match) ? match[0] : "";
        return `${prefix}Arbeitsdatei entfernt`;
      });
    }

    if (/^portale\/migration-vielfalt\/[^/]+\/index\.html$/.test(relative)) {
      content = content.replaceAll(
        "../../assets/downloads/rang-15-migration-vielfalt/",
        "../../../assets/downloads/rang-15-migration-vielfalt/",
      );
    }

    if (content !== before) {
      fs.writeFileSync(file, content, "utf8");
      changed += 1;
    }
  }

  if (changed) console.log(`Normalized public artifact links/text in ${changed} files.`);
}

function validateNoCorruptedHtmlAttributes() {
  const corruptAttributePatterns = [
    /data-version="<[^"]*/g,
    /data-content-hash="<[^"]*/g,
    /data-section-id="<[^"]*/g,
    /data-document-id="<[^"]*/g,
    /data-paragraph-id="<[^"]*/g,
  ];
  const failures = [];

  for (const file of walkFiles(artifactDir)) {
    if (path.extname(file).toLowerCase() !== ".html") continue;
    const content = fs.readFileSync(file, "utf8");
    const relative = toPosixRelative(file);
    const matches = corruptAttributePatterns.flatMap((pattern) => [...content.matchAll(pattern)]);
    if (matches.length) failures.push(`${relative}: ${matches.length} corrupted data attribute(s)`);
  }

  if (failures.length) {
    throw new Error(`Public HTML artifact validation failed:\n\n${failures.join("\n")}`);
  }

  console.log("Public HTML data-attribute validation passed.");
}

function validateNoTemplatePlaceholders() {
  const failures = [];

  for (const file of walkFiles(artifactDir)) {
    const ext = path.extname(file).toLowerCase();
    if (![".html", ".js", ".json", ".xml", ".txt"].includes(ext)) continue;
    const content = fs.readFileSync(file, "utf8");
    const matches = [...content.matchAll(/\{\{[A-Z][A-Z0-9_]*\}\}/g)];
    if (matches.length) failures.push(`${toPosixRelative(file)}: ${matches.length} unresolved template placeholder(s)`);
  }

  if (failures.length) {
    throw new Error(`Public artifact contains unresolved template placeholders:\n\n${failures.join("\n")}`);
  }

  console.log("Public template placeholder validation passed.");
}

function validateMainworkFulltextArtifact() {
  const file = path.join(artifactDir, "referenz/volltext/index.html");
  if (!fs.existsSync(file)) {
    throw new Error("Reference fulltext artifact is missing: referenz/volltext/index.html");
  }

  const content = fs.readFileSync(file, "utf8");
  const chapterLinks = [...content.matchAll(/href="#woek-main-2026-k\d{3}"/g)].length;
  const chapterAnchors = [...content.matchAll(/id="woek-main-2026-k\d{3}"/g)].length;
  const failures = [];

  if (content.includes('data-version="<')) failures.push('corrupted data-version attributes');
  if (!content.includes("Abstract / Meta-These")) failures.push("missing opening fulltext content");
  if (!content.includes("Die neue Ordnung des Wohlstands beginnt dort")) failures.push("missing readable paragraph text");
  if (!content.includes('id="fulltext-chapter-map"')) failures.push("missing chapter anchor map");
  if (chapterAnchors < 100) failures.push(`too few chapter anchors (${chapterAnchors})`);
  if (chapterLinks < 100) failures.push(`too few chapter jump links (${chapterLinks})`);

  if (failures.length) {
    throw new Error(`Reference fulltext artifact validation failed: ${failures.join(", ")}`);
  }

  console.log(`Reference fulltext artifact passed (${chapterAnchors} chapter anchors, ${chapterLinks} jump links).`);
}

function validatePublicScripts() {
  const failures = [];
  for (const file of walkFiles(artifactDir)) {
    if (path.extname(file).toLowerCase() !== ".js") continue;
    const check = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (check.status !== 0) {
      failures.push(`${toPosixRelative(file)}\n${check.stderr || check.stdout}`.trim());
    }
  }

  if (failures.length) {
    throw new Error(`Public JavaScript syntax check failed:\n\n${failures.join("\n\n")}`);
  }
  console.log("Public JavaScript syntax check passed.");
}

function validatePublicJson() {
  const failures = [];
  for (const file of walkFiles(artifactDir)) {
    if (path.extname(file).toLowerCase() !== ".json") continue;
    try {
      JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      failures.push(`${toPosixRelative(file)}: ${error.message}`);
    }
  }

  if (failures.length) {
    throw new Error(`Public JSON validation failed:\n\n${failures.join("\n")}`);
  }
  console.log("Public JSON validation passed.");
}

function prunePublicArtifact() {
  const references = collectArtifactReferences();
  const prunableAssetPrefixes = [
    "assets/audio/",
    "assets/downloads/",
    "assets/img/",
    "assets/pdf/",
    "public/assets/",
    "public/downloads/",
  ];
  const prunableAssetExtensions = new Set([
    ".avif",
    ".csv",
    ".gif",
    ".jpeg",
    ".jpg",
    ".json",
    ".mp3",
    ".mp4",
    ".pdf",
    ".png",
    ".svg",
    ".webp",
    ".xlsx",
    ".zip",
  ]);
  let pruned = 0;

  for (const file of walkFiles(artifactDir)) {
    const ext = path.extname(file).toLowerCase();
    const relative = toPosixRelative(file);

    if (publicReleaseAssets.has(relative)) {
      removeFile(file, "large public asset is served from GitHub Releases");
      pruned += 1;
      continue;
    }

    if (ext === ".wav") {
      removeFile(file, "source audio is kept locally; public pages use mp3");
      pruned += 1;
      continue;
    }

    if (
      prunableAssetExtensions.has(ext) &&
      prunableAssetPrefixes.some((prefix) => relative.startsWith(prefix)) &&
      !references.has(relative)
    ) {
      removeFile(file, "unreferenced public asset");
      pruned += 1;
      continue;
    }

    if (
      relative.startsWith("public/data/") &&
      ![
        "public/data/relationship-manifest.json",
        "public/data/en-document-translation-manifest.json",
      ].includes(relative)
    ) {
      removeFile(file, "internal data export is not public");
      pruned += 1;
      continue;
    }

    if (relative === "assets/data/term-registry.json") {
      removeFile(file, "internal term registry is not loaded by public pages");
      pruned += 1;
      continue;
    }

    if ([".md", ".doc", ".docx", ".rtf"].includes(ext)) {
      removeFile(file, "editorial/source file is not public");
      pruned += 1;
      continue;
    }

    if (ext === ".zip" && !references.has(relative)) {
      removeFile(file, "unreferenced editorial/source download");
      pruned += 1;
    }
  }

  if (pruned) console.log(`Pruned ${pruned} non-public artifact files.`);
}

removeArtifact();

let copied = 0;
for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
  if (copyEntry(entry)) copied += 1;
}

normalizePublicArtifactLinksAndText();
copyReferencedPublicFiles();
copySnapshotManifestFiles();
copyPublicRuntimeContentData();
copyLegacyRedirectFiles();
prunePublicArtifact();
validateNoCorruptedHtmlAttributes();
validateNoTemplatePlaceholders();
validateMainworkFulltextArtifact();
validatePublicScripts();
validatePublicJson();

const mb = collectSize(artifactDir) / 1024 / 1024;
console.log(`Built _site with ${copied} top-level entries (${mb.toFixed(1)} MB).`);

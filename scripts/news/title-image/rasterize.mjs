// Rasterizer-Adapter: SVG → PNG ohne feste npm-Abhängigkeit.
//
// Reihenfolge: 1. @resvg/resvg-js, falls installiert (empfohlen für CI; braucht
// TTF/OTF-Fonts, siehe Doku). 2. rsvg-convert (librsvg, nutzt Systemfonts).
// 3. Chrome/Chromium headless (rendert die eingebetteten WOFF2-Fonts exakt).
// Alle Wege schlagen sauber fehl; der Aufrufer entscheidet über den Fallback.

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { chromeRender } from "./chrome-render.mjs";

const CHROME_CANDIDATES = [
  process.env.WT_CHROME_BIN,
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
].filter(Boolean);

function onPath(binary) {
  const result = spawnSync("which", [binary], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

export function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    if (candidate.includes("/") ? fs.existsSync(candidate) : onPath(candidate)) return candidate.includes("/") ? candidate : onPath(candidate);
  }
  return null;
}

export function availableRasterizers() {
  const list = [];
  try {
    import.meta.resolve("@resvg/resvg-js");
    list.push("resvg");
  } catch {
    // nicht installiert
  }
  if (onPath("rsvg-convert")) list.push("rsvg-convert");
  if (findChrome()) list.push("chrome");
  return list;
}

async function withResvg(svg, { width, scale, fontDirs }) {
  const { Resvg } = await import("@resvg/resvg-js");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: Math.round(width * scale) },
    font: { loadSystemFonts: true, fontDirs: fontDirs || [], defaultFontFamily: "Inter" },
  });
  return resvg.render().asPng();
}

function withRsvg(svg, { width, height, scale }) {
  return execFileSync("rsvg-convert", ["-w", String(Math.round(width * scale)), "-h", String(Math.round(height * scale)), "-f", "png"], { input: svg, maxBuffer: 64 * 1024 * 1024 });
}


export async function rasterize(svg, { width, height, scale = 1, outFile = null, prefer = null, fontDirs = null } = {}) {
  const order = prefer ? [prefer, ...availableRasterizers().filter((name) => name !== prefer)] : availableRasterizers();
  const errors = [];
  for (const name of order) {
    try {
      let png;
      if (name === "resvg") png = await withResvg(svg, { width, scale, fontDirs });
      else if (name === "rsvg-convert") png = withRsvg(svg, { width, height, scale });
      else if (name === "chrome") png = await chromeRender(svg, { width, height, scale, chrome: findChrome() });
      else continue;
      if (outFile) {
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, png);
      }
      return { png, rasterizer: name, outFile };
    } catch (error) {
      errors.push(`${name}: ${error?.message || error}`);
    }
  }
  const failure = new Error(`NO_RASTERIZER${errors.length ? `: ${errors.join(" | ")}` : ""}`);
  failure.code = "NO_RASTERIZER";
  throw failure;
}

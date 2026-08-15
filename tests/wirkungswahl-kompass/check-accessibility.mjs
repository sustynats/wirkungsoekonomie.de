import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const template = fs.readFileSync(path.join(root, "components/wirkungswahl-kompass/template.html"), "utf8");
const app = fs.readFileSync(path.join(root, "components/wirkungswahl-kompass/app.js"), "utf8");

function luminance(hex) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrast(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}

for (const [foreground, background, mode] of [
  ["#775000", "#f6f3ec", "light"],
  ["#775000", "#fffdf8", "light card"],
  ["#f0c971", "#0b1220", "dark"],
  ["#f0c971", "#111c30", "dark card"],
]) {
  assert.ok(contrast(foreground, background) >= 4.5, `${mode} link text must meet AA contrast`);
}

for (const expected of [
  'meta name="robots" content="noindex, nofollow"',
  'meta name="content_status" content="needs_editorial_review"',
  "default-src 'self'",
  "base-uri 'none'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  'aria-modal="true"',
  'aria-controls="sheet"',
  "min-width:48px;min-height:48px",
  "min-height:44px",
  "prefers-reduced-motion",
]) {
  assert.ok(template.includes(expected), `template must include ${expected}`);
}

for (const expected of [
  "app.inert=true",
  "e.key==='Escape'",
  "lastFocus.focus()",
  "role=\"status\"",
  "safeHttpsUrl",
]) {
  assert.ok(app.includes(expected), `app must include ${expected}`);
}

console.log("Accessibility static checks passed: contrast, status visibility, CSP directives, touch targets, dialog and reduced motion.");

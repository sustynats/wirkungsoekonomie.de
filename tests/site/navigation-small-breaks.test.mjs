import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  }).split("\0").filter(Boolean);
}

test("Finder duplicate routes remain small noindex redirects to existing canonical siblings", () => {
  const duplicates = trackedFiles().filter((file) => / \d+\.html$/.test(file));
  assert.equal(duplicates.length, 18, "The known URL-preserved duplicate inventory changed without review.");

  for (const file of duplicates) {
    const canonical = file.replace(/ \d+\.html$/, ".html");
    const html = read(file);
    assert.ok(fs.existsSync(path.join(root, canonical)), `${file} has no canonical sibling.`);
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/i, `${file} is indexable.`);
    assert.match(html, /<meta http-equiv="refresh" content="0; url=[^"]+">/i, `${file} is not a redirect.`);
    assert.match(html, /<link rel="canonical" href="[^"]+">/i, `${file} has no canonical target.`);
    assert.ok(Buffer.byteLength(html) < 1_500, `${file} contains projected page content instead of a small redirect.`);
  }
});

test("public experience pages link to published HTML instead of source Markdown", () => {
  const files = trackedFiles().filter((file) => file === "erleben.html" || /^erleben\/.*\.html$/.test(file));
  const rawLinks = [];
  for (const file of files) {
    const html = read(file);
    for (const match of html.matchAll(/href\s*=\s*(["'])([^"']+\.md(?:[?#][^"']*)?)\1/gi)) {
      rawLinks.push(`${file}: ${match[2]}`);
    }
  }
  assert.deepEqual(rawLinks, []);
  assert.match(
    read("scripts/portal/apply-demo-governance-stage8.mjs"),
    /href: "bibliothek\/woek-begriffsleitfaden-fuehrend\/"/,
  );
});

test("Wirkungswahl-Kompass exposes its real landing heading before JavaScript runs", () => {
  const html = read("werkzeuge/wirkungswahl-kompass/index.html");
  const claim = "Wo du stehst. Was Parteien vorschlagen. Was daraus folgen kann.";
  assert.match(
    html,
    new RegExp(`<main id="main"><div class="wrap" id="view"[^>]*>[\\s\\S]*?<h1>${claim.replaceAll(".", "\\.")}<\\/h1>`),
  );
  assert.doesNotMatch(html, /<h1>\$\{esc\(DATA\.meta\.claim\)\}<\/h1>/);
});

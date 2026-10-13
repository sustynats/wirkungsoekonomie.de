import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildPublicSitemaps, readPublicSitemapRoutes } from "../../scripts/lib/public-sitemaps.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-public-sitemaps-"));
  const manifest = {
    routes: [
      { url: "/", area: "start" },
      { url: "/kontakt.html", area: "start" },
      { url: "/begriffe/wirkung/", area: "begriffe" },
      { url: "/quellen/wirkung%26wirtschaft/", area: "quellen" },
    ],
  };
  const file = path.join(root, "assets/data/public-routes.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(manifest));
  return root;
}

test("area sitemaps cover the route manifest exactly once", () => {
  const root = fixture();
  try {
    const result = buildPublicSitemaps(root);
    assert.equal(result.routes, 4);
    assert.equal(result.areas, 3);
    assert.deepEqual(result.files, ["begriffe.xml", "quellen.xml", "start.xml"]);
    assert.deepEqual(readPublicSitemapRoutes(root), [
      "/begriffe/wirkung/",
      "/quellen/wirkung%26wirtschaft/",
      "/",
      "/kontakt.html",
    ]);
    assert.match(fs.readFileSync(path.join(root, "sitemaps/quellen.xml"), "utf8"), /wirkung%26wirtschaft/);
    assert.doesNotThrow(() => buildPublicSitemaps(root, { check: true }));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the check rejects stale sitemap files", () => {
  const root = fixture();
  try {
    buildPublicSitemaps(root);
    fs.writeFileSync(path.join(root, "sitemaps/legacy.xml"), "<urlset/>");
    assert.throws(() => buildPublicSitemaps(root, { check: true }), /missing or stale/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("invalid area names fail closed instead of producing ambiguous files", () => {
  const root = fixture();
  try {
    const file = path.join(root, "assets/data/public-routes.json");
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    manifest.routes[0].area = "öffentlicher raum";
    fs.writeFileSync(file, JSON.stringify(manifest));
    assert.throws(() => buildPublicSitemaps(root), /cannot be used as a sitemap filename/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

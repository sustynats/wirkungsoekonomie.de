import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { collectPublicRoutes, routeFromFile, writePublicRoutes } from "../../scripts/lib/public-routes.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-public-routes-"));
  const put = (relative, html) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  };
  put("index.html", '<html lang="de"><title>Wirkung &amp;amp; Wirtschaft</title><main>Start</main></html>');
  put("verstehen/index.html", '<html lang="de"><link rel="canonical" href="https://wirkungsoekonomie.de/verstehen/"><title>Verstehen</title></html>');
  put("verstehen/entwurf/index.html", '<meta name="robots" content="noindex,follow"><title>Entwurf</title>');
  put("verstehen.html", '<link rel="canonical" href="/verstehen/"><title>Alias</title>');
  put("alt/index.html", '<meta http-equiv="refresh" content="0; url=/verstehen/"><title>Alt</title>');
  put("admin/index.html", "<title>Intern</title>");
  put("en/index.html", '<html lang="en"><title>Offline English</title></html>');
  put("404.html", "<title>Nicht gefunden</title>");
  return root;
}

test("route paths retain the public URL shape", () => {
  assert.equal(routeFromFile("index.html"), "/");
  assert.equal(routeFromFile("bereich/index.html"), "/bereich/");
  assert.equal(routeFromFile("bereich/detail.html"), "/bereich/detail.html");
  assert.equal(routeFromFile("bereich/ä ö.html"), "/bereich/%C3%A4%20%C3%B6.html");
});

test("the manifest contains every and only public canonical indexable German page", () => {
  const root = fixture();
  try {
    const manifest = collectPublicRoutes(root);
    assert.deepEqual(manifest.routes.map((entry) => entry.url), ["/", "/verstehen/"]);
    assert.equal(manifest.routes[0].title, "Wirkung & Wirtschaft");
    assert.deepEqual(manifest.counts.excluded, {
      alternateCanonical: 1,
      inactiveLocale: 1,
      internal: 1,
      noindex: 1,
      notFound: 1,
      redirect: 1,
    });
    assert.deepEqual(manifest.counts.byArea, { start: 1, verstehen: 1 });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the checked build artifact is deterministic and stale manifests fail", () => {
  const root = fixture();
  try {
    const output = path.join(root, "assets/data/public-routes.json");
    writePublicRoutes(root, output);
    assert.doesNotThrow(() => writePublicRoutes(root, output, { check: true }));
    fs.appendFileSync(path.join(root, "verstehen/index.html"), "\n<p>Neue Ausgabe</p>");
    assert.throws(() => writePublicRoutes(root, output, { check: true }), /missing or stale/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

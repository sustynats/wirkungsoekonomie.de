import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildPublicAreaDirectories } from "../../scripts/quality/build-public-area-directories.mjs";

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-public-directories-"));
  fs.mkdirSync(path.join(root, "assets/data"), { recursive: true });
  fs.mkdirSync(path.join(root, "assets/css"), { recursive: true });
  fs.writeFileSync(path.join(root, "assets/css/style.css"), "body{color:#222}");
  const shell = (title, body = "") => `<!doctype html><html lang="de"><head><title>${title}</title><link rel="canonical" href="https://wirkungsoekonomie.de/${title === "Start" ? "" : "unused"}"></head><body><main id="main-content"><section class="hero"><h1>${title}</h1><p>Einführung bleibt erhalten.</p></section>${body}</main></body></html>`;
  fs.writeFileSync(path.join(root, "index.html"), shell("Start"));
  fs.writeFileSync(path.join(root, "suche.html"), shell("Suche"));
  fs.writeFileSync(path.join(root, "mehr.html"), shell("Mehr"));
  fs.writeFileSync(path.join(root, "blog.html"), shell("Journal", '<article class="blog-card"><a href="blog/beitrag/">Beitrag lesen</a></article>'));
  fs.mkdirSync(path.join(root, "blog/beitrag"), { recursive: true });
  fs.writeFileSync(path.join(root, "blog/beitrag/index.html"), shell("Beitrag"));
  fs.mkdirSync(path.join(root, "begriffe"), { recursive: true });
  const cards = Array.from({ length: 61 }, (_, index) => (
    `<article class="info-card glossary-result-card"><h2>Karte ${index + 1}</h2><a href="eintrag-${index + 1}/">Öffnen</a></article>`
  )).join("\n");
  fs.writeFileSync(path.join(root, "begriffe/index.html"), shell("Begriffe", `<div class="card-grid">${cards}</div>`));
  const routes = [
    { url: "/", file: "index.html", area: "start", title: "Start" },
    { url: "/suche.html", file: "suche.html", area: "start", title: "Suche" },
    { url: "/mehr.html", file: "mehr.html", area: "start", title: "Mehr" },
    { url: "/blog.html", file: "blog.html", area: "start", title: "Journal" },
    { url: "/blog/beitrag/", file: "blog/beitrag/index.html", area: "blog", title: "Beitrag" },
    { url: "/begriffe/", file: "begriffe/index.html", area: "begriffe", title: "Begriffe" },
  ];
  for (let index = 1; index <= 61; index += 1) {
    const directory = path.join(root, `begriffe/eintrag-${index}`);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "index.html"), shell(`Eintrag ${index}`));
    routes.push({
      url: `/begriffe/eintrag-${index}/`,
      file: `begriffe/eintrag-${index}/index.html`,
      area: "begriffe",
      title: `Eintrag ${index}`,
    });
  }
  fs.writeFileSync(path.join(root, "assets/data/public-routes.json"), JSON.stringify({ counts: { routes: routes.length }, routes }));
  return root;
}

test("area directories paginate routes and existing cards without changing child pages", () => {
  const root = fixture();
  try {
    const child = path.join(root, "begriffe/eintrag-61/index.html");
    const before = fs.readFileSync(child, "utf8");
    const manifest = buildPublicAreaDirectories(root);
    const area = manifest.areas.find((item) => item.area === "begriffe");
    assert.equal(area.routes, 61);
    assert.equal(area.cards, 61);
    assert.equal(area.pages, 4);
    assert.equal(fs.readFileSync(child, "utf8"), before);

    const hub = fs.readFileSync(path.join(root, "begriffe/index.html"), "utf8");
    const page2 = fs.readFileSync(path.join(root, "begriffe/seite/2/index.html"), "utf8");
    const page4 = fs.readFileSync(path.join(root, "begriffe/seite/4/index.html"), "utf8");
    assert.match(hub, /href="\/begriffe\/eintrag-50\/"/);
    assert.match(page2, /href="\/begriffe\/eintrag-51\/"/);
    assert.match(page4, /Karte 61/);
    assert.match(page4, /href="\/begriffe\/eintrag-61\/"/);
    assert.ok(fs.statSync(path.join(root, "begriffe/index.html")).size < 300000);
    assert.ok(fs.statSync(path.join(root, "begriffe/seite/4/index.html")).size < 300000);

    const all = [hub, page2, fs.readFileSync(path.join(root, "begriffe/seite/3/index.html"), "utf8"), page4].join("\n");
    assert.equal((all.match(/class="info-card glossary-result-card"/g) || []).length, 61);
    assert.match(fs.readFileSync(path.join(root, "suche.html"), "utf8"), /href="\/mehr\.html"/);
    const blog = fs.readFileSync(path.join(root, "blog.html"), "utf8");
    assert.match(blog, /href="\/blog\/beitrag\/"/);
    assert.doesNotMatch(blog, /href="\/blog\/blog\/beitrag\/"/);

    const repeated = buildPublicAreaDirectories(root);
    const repeatedArea = repeated.areas.find((item) => item.area === "begriffe");
    const repeatedPages = [
      fs.readFileSync(path.join(root, "begriffe/index.html"), "utf8"),
      ...[2, 3, 4].map((page) => fs.readFileSync(path.join(root, `begriffe/seite/${page}/index.html`), "utf8")),
    ].join("\n");
    assert.equal(repeatedArea.cards, 61);
    assert.equal((repeatedPages.match(/class="info-card glossary-result-card"/g) || []).length, 61);
    assert.equal((repeatedPages.match(/data-public-area-directory="true"/g) || []).length, 4);
    assert.equal(fs.readFileSync(path.join(root, "begriffe/index.html"), "utf8"), hub);
    assert.equal(fs.readFileSync(path.join(root, "blog.html"), "utf8"), blog);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

import assert from "node:assert/strict";
import test from "node:test";
import { isSafePublicSourceUrl, sourceDetailHrefForUrl } from "@/lib/sources/url";

test("the public source archive rejects local, credentialed and non-HTTPS source URLs", () => {
  assert.equal(isSafePublicSourceUrl("https://dip.bundestag.de/vorgang/123"), "https://dip.bundestag.de/vorgang/123");
  assert.equal(isSafePublicSourceUrl("http://example.org/source"), null);
  assert.equal(isSafePublicSourceUrl("https://user:pass@example.org/source"), null);
  assert.equal(isSafePublicSourceUrl("https://localhost:3000/source"), null);
  const localFileUrl = ["file:", "", "/private/source.pdf"].join("/");
  assert.equal(isSafePublicSourceUrl(localFileUrl), null);
});

test("a public source is always represented by an internal detail URL first", () => {
  const detailUrl = sourceDetailHrefForUrl("https://dip.bundestag.de/vorgang/123");
  assert.match(detailUrl, /^\/quellen\/quelle-[a-f0-9]{16}$/);
  const localFileUrl = ["file:", "", "/private/source.pdf"].join("/");
  assert.equal(sourceDetailHrefForUrl(localFileUrl), "/quellen");
});

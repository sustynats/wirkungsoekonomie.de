import test from "node:test";
import assert from "node:assert/strict";
import { renderClaimEvidenceLinks } from "../../scripts/news/build.mjs";

test("several passages from one article produce one named link without changing evidence", () => {
  const url = "https://example.org/article";
  const claim = { evidence: [{ url, excerpt_hash: "a" }, { url: `${url}?utm_source=rss#text`, excerpt_hash: "b" }, { url, excerpt_hash: "a" }] };
  const before = structuredClone(claim);
  const html = renderClaimEvidenceLinks(claim, [{ url, publisher: "Deutscher Bundestag", title: "Antwort" }]);
  assert.equal((html.match(/<a /g) || []).length, 1);
  assert.match(html, /Deutscher Bundestag · 2 Textstellen/);
  assert.deepEqual(claim, before);
});

test("different articles stay separate, unsafe links are dropped and names escaped", () => {
  const claim = { evidence: [{ url: "https://example.org/a", excerpt_hash: "a" }, { url: "https://example.org/b", excerpt_hash: "b" }, { url: "javascript:alert(1)" }] };
  const html = renderClaimEvidenceLinks(claim, [{ url: "https://example.org/a", publisher: "A & B <Test>" }]);
  assert.equal((html.match(/<a /g) || []).length, 2);
  assert.match(html, /A &amp; B &lt;Test&gt; · 1 Textstelle/);
  assert.match(html, /example.org · 1 Textstelle/);
  assert.doesNotMatch(html, /javascript:|unabhängig/);
  assert.equal(renderClaimEvidenceLinks({}), "");
});

import test from "node:test";
import assert from "node:assert/strict";
import { assertDirectNewsUrl, assertPublicArticle, sourceAccess, robotsDecision, respectRobots } from "../../scripts/news/access-policy.mjs";

test("only free direct sources, never paywall-removal or excluded publishers", () => {
  for (const host of ["removepaywall.com", "www.removepaywall.com", "12ft.io", "apollo-news.net", "www.nius.de"]) assert.throws(() => assertDirectNewsUrl(`https://${host}/search?url=https://example.org`));
  assert.doesNotThrow(() => assertDirectNewsUrl("https://example.org/news"));
  for (const access of [{ cost_usd: 1 }, { requires_payment: true }, { requires_login: true }, { status: "pending" }]) assert.equal(sourceAccess({ url: "https://example.org", access }).allowed, false);
  assert.equal(sourceAccess({ url: "https://example.org" }, "article").allowed, false);
  assert.equal(sourceAccess({ url: "https://example.org", access: { status: "public", cost_usd: 0, article: "bounded_public_text" } }, "article").allowed, true);
});

test("restricted markup is not mined for hidden full text", () => {
  assert.throws(() => assertPublicArticle('<script type="application/ld+json">{"isAccessibleForFree": false,"articleBody":"hidden"}</script>'), /ARTICLE_ACCESS_RESTRICTED/);
  assert.throws(() => assertPublicArticle('<meta itemprop="isAccessibleForFree" content="false">'), /ARTICLE_ACCESS_RESTRICTED/);
  assert.doesNotThrow(() => assertPublicArticle('{"isAccessibleForFree":true}'));
});

test("robots uses specific agents, longest paths and allow on ties", () => {
  const raw = "User-agent: *\nDisallow: /\nUser-agent: WOek-Wirkungsticker\nDisallow: /private\nAllow: /private/open\nCrawl-delay: 2";
  assert.equal(robotsDecision(raw, "https://example.org/news").allowed, true);
  assert.equal(robotsDecision(raw, "https://example.org/private/a").allowed, false);
  assert.equal(robotsDecision(raw, "https://example.org/private/open").allowed, true);
  assert.equal(robotsDecision(raw, "https://example.org/news").crawl_delay_seconds, 2);
  assert.equal(robotsDecision("User-agent: *\nDisallow: /*?pay*\n", "https://example.org/a?pay=true").allowed, false);
});

test("robots follows bounded same-origin redirects but rejects cross-origin redirects", async () => {
  const urls = [];
  const result = await respectRobots("https://redirect.example/news", {}, async (url) => {
    urls.push(url);
    return urls.length === 1 ? new Response(null, { status: 308, headers: {location: "/en/robots.txt"} }) : new Response("User-agent: *\nDisallow: /private");
  }, async () => {}, ["redirect.example"]);
  assert.equal(result.allowed, true);
  assert.deepEqual(urls, ["https://redirect.example/robots.txt", "https://redirect.example/en/robots.txt"]);
  await assert.rejects(respectRobots("https://external.example/news", {}, async () => new Response(null, {status:302,headers:{location:"https://untrusted.example/robots.txt"}}), async()=>{}, ["external.example"]), /ROBOTS_CROSS_ORIGIN_REDIRECT/);
});

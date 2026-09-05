// No credentials, paid news, proxy readers or paywall removal in the newsroom.
// A public URL alone is not an editorial or reuse permission.
export const BLOCKED_NEWS_HOSTS = Object.freeze([
  "apollo-news.net", "nius.de", "removepaywall.com", "12ft.io", "12ft.org",
]);

export function assertDirectNewsUrl(raw) {
  const url = new URL(raw);
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) throw new Error("NEWS_DIRECT_HTTPS_REQUIRED");
  if (BLOCKED_NEWS_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) throw new Error("NEWS_SOURCE_EXCLUDED");
  return url;
}

export function sourceAccess(source, purpose = "feed") {
  if (!source || source.enabled === false) return { allowed: false, reason: "SOURCE_DISABLED" };
  if (purpose === "feed" && source.role && source.role !== "A") return { allowed: false, reason: "SOURCE_NOT_AUTOMATED_ROLE" };
  if (source.access?.cost_usd > 0 || source.access?.requires_payment || source.access?.requires_login) return { allowed: false, reason: "FREE_PUBLIC_SOURCES_ONLY" };
  if (source.access?.status && source.access.status !== "public") return { allowed: false, reason: "SOURCE_ACCESS_NOT_CLEARED" };
  if (purpose === "article" && source.access?.article !== "bounded_public_text") return { allowed: false, reason: "SOURCE_METADATA_ONLY" };
  try {
    assertDirectNewsUrl(source.url);
    if (source.feed_url) assertDirectNewsUrl(source.feed_url);
  } catch (error) {
    return { allowed: false, reason: error.message };
  }
  return { allowed: true, reason: "FREE_PUBLIC_ACCESS" };
}

export function assertPublicArticle(html) {
  const text = String(html);
  // Refuse restricted full text even if it happens to be present in page markup.
  if (/"isAccessibleForFree"\s*:\s*(?:false|"false")/i.test(text)
    || /itemprop=["']isAccessibleForFree["'][^>]*content=["']false["']/i.test(text)
    || /(?:HTTP\/\S+\s+402|paywall_required|subscription_required)/i.test(text)) throw new Error("ARTICLE_ACCESS_RESTRICTED");
}

export function robotsDecision(raw, url, agent = "WOek-Wirkungsticker") {
  const groups = [];
  let current = { agents: [], rules: [], delay: 0 };
  let rulesStarted = false;
  for (const line of String(raw).split(/\r?\n/)) {
    const match = line.replace(/#.*$/, "").trim().match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].toLowerCase().trim();
    const value = match[2].trim();
    if (key === "user-agent") {
      if (rulesStarted) { groups.push(current); current = { agents: [], rules: [], delay: 0 }; rulesStarted = false; }
      current.agents.push(value.toLowerCase());
    } else if (current.agents.length && ["allow", "disallow", "crawl-delay"].includes(key)) {
      rulesStarted = true;
      if (key === "crawl-delay") current.delay = Math.max(0, Number(value) || 0);
      else if (value) current.rules.push({ allow: key === "allow", path: value });
    }
  }
  groups.push(current);
  const ranked = groups.map((group) => ({ ...group, specificity: Math.max(-1, ...group.agents.map((name) => name === "*" ? 0 : agent.toLowerCase().includes(name) ? name.length : -1)) }));
  const specificity = Math.max(-1, ...ranked.map((group) => group.specificity));
  const applicable = ranked.filter((group) => group.specificity === specificity && specificity >= 0);
  const target = new URL(url);
  const targetPath = target.pathname + target.search;
  const matching = applicable.flatMap((group) => group.rules).filter((rule) => {
    const pattern = rule.path.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\$(?!$)/g, "\\$");
    return new RegExp(`^${pattern}`).test(targetPath);
  }).sort((a, b) => b.path.replace(/\*/g, "").length - a.path.replace(/\*/g, "").length || Number(b.allow) - Number(a.allow));
  return { allowed: matching[0]?.allow ?? true, crawl_delay_seconds: Math.max(0, ...applicable.map((group) => group.delay)) };
}

const robotsCache = new Map();
const rslCache = new Map();
const nextRequests = new Map();
export async function respectRobots(rawUrl, policy, fetchImpl, assertSafeUrl, allowedHosts) {
  const url = assertDirectNewsUrl(rawUrl);
  const key = `${url.origin}:${policy.user_agent || "WOek-Wirkungsticker"}`;
  let cached = robotsCache.get(key);
  if (!cached || cached.expires < Date.now()) {
    let robotsUrl = `${url.origin}/robots.txt`;
    const signal = AbortSignal.timeout(Number(policy.request_timeout_ms || 18000));
    let response;
    for (let redirects = 0; redirects <= 3; redirects++) {
      await assertSafeUrl(robotsUrl, allowedHosts, { resolveDns: policy.resolve_dns !== false });
      response = await fetchImpl(robotsUrl, { redirect: "manual", signal, headers: { "User-Agent": policy.user_agent || "WOek-Wirkungsticker", Accept: "text/plain" } });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirects === 3) throw new Error("ROBOTS_REDIRECT_LIMIT");
      const next = assertDirectNewsUrl(new URL(location, robotsUrl).href);
      if (next.origin !== url.origin) throw new Error("ROBOTS_CROSS_ORIGIN_REDIRECT");
      robotsUrl = next.href;
    }
    if (![200, 404, 410].includes(response.status)) throw new Error(`ROBOTS_UNAVAILABLE_${response.status}`);
    const body = response.status === 200 ? await response.text() : "";
    if (body.length > 512000) throw new Error("ROBOTS_TOO_LARGE");
    cached = { body, expires: Date.now() + 3600000 };
    robotsCache.set(key, cached);
  }
  const decision = robotsDecision(cached.body, url, policy.user_agent || "WOek-Wirkungsticker");
  if (!decision.allowed) throw new Error("ROBOTS_DISALLOWED");
  const wait = Math.max(0, (nextRequests.get(url.origin) || 0) - Date.now());
  if (wait > 15000) throw new Error("ROBOTS_CRAWL_DELAY_DEFERRED");
  nextRequests.set(url.origin, Date.now() + wait + decision.crawl_delay_seconds * 1000);
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  return decision;
}

export function rslDecision(raw) {
  const text = String(raw || "");
  if (!/<rsl\b[^>]*xmlns=["']https:\/\/rslstandard\.org\/rsl["']/i.test(text)) return { allowed: false, status: "open", reason: "RSL_STATUS_OPEN" };
  if (!/<content\b[^>]*url=["']\/["']/i.test(text)) return { allowed: false, status: "open", reason: "RSL_STATUS_OPEN" };
  const prohibited = [...text.matchAll(/<prohibits\b[^>]*type=["']usage["'][^>]*>([\s\S]*?)<\/prohibits>/gi)].some((match) => /\b(?:ai-input|ai-all)\b/i.test(match[1]));
  if (prohibited) return { allowed: false, status: "prohibited", reason: "RSL_AI_INPUT_DISALLOWED" };
  const prohibitedUser = [...text.matchAll(/<prohibits\b[^>]*type=["']user["'][^>]*>([\s\S]*?)<\/prohibits>/gi)].some((match) => /\bnon-commercial\b/i.test(match[1]));
  if (prohibitedUser) return { allowed: false, status: "prohibited", reason: "RSL_AI_INPUT_DISALLOWED" };
  const permitted = [...text.matchAll(/<permits\b[^>]*type=["']usage["'][^>]*>([\s\S]*?)<\/permits>/gi)].some((match) => /\b(?:ai-input|ai-all)\b/i.test(match[1]));
  const userPermits = [...text.matchAll(/<permits\b[^>]*type=["']user["'][^>]*>([\s\S]*?)<\/permits>/gi)].map((match) => match[1]);
  const unsupportedUserRestriction = userPermits.length && !userPermits.some((value) => /\bnon-commercial\b/i.test(value));
  const externalConditions = unsupportedUserRestriction || /<(?:server|reporting|custom|standard)\b/i.test(text) || /<payment\b[^>]*type=["'](?:purchase|subscription|training|crawl|use|contribution)["']/i.test(text);
  if (!permitted || externalConditions) return { allowed: false, status: "open", reason: "RSL_STATUS_OPEN" };
  return { allowed: true, status: "permitted", reason: "RSL_AI_INPUT_PERMITTED" };
}

export async function respectRsl(source, policy, fetchImpl, assertSafeUrl, allowedHosts) {
  if (!source?.rsl_url) return { allowed: true, status: "not_declared", reason: "RSL_NOT_DECLARED" };
  const initial = assertDirectNewsUrl(source.rsl_url);
  const key = initial.href;
  let cached = rslCache.get(key);
  if (!cached || cached.expires < Date.now()) {
    let current = initial.href;
    let response;
    for (let redirects = 0; redirects <= 3; redirects += 1) {
      await assertSafeUrl(current, allowedHosts, { resolveDns: policy.resolve_dns !== false });
      response = await fetchImpl(current, { redirect: "manual", signal: AbortSignal.timeout(Number(policy.request_timeout_ms || 18000)), headers: { "User-Agent": policy.user_agent || "WOek-Wirkungsticker", Accept: "application/rsl+xml, application/xml, text/xml;q=0.9" } });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirects === 3) throw new Error("RSL_REDIRECT_LIMIT");
      const next = assertDirectNewsUrl(new URL(location, current).href);
      if (next.origin !== initial.origin) throw new Error("RSL_CROSS_ORIGIN_REDIRECT");
      current = next.href;
    }
    if ([404, 410].includes(response.status)) {
      await response.body?.cancel();
      cached = { decision: { allowed: true, status: "not_found", reason: "RSL_NOT_FOUND" }, expires: Date.now() + 86400000 };
    }
    else {
      if (response.status !== 200) throw new Error(`RSL_UNAVAILABLE_${response.status}`);
      const body = await response.text();
      if (body.length > 512000) throw new Error("RSL_TOO_LARGE");
      cached = { decision: rslDecision(body), expires: Date.now() + 86400000 };
    }
    rslCache.set(key, cached);
  }
  if (!cached.decision.allowed) throw new Error(cached.decision.reason);
  return cached.decision;
}

export function mustRespectRobots(source, current, policy) {
  const host = new URL(current).hostname;
  const ownPublication = source.source_type?.startsWith("woek_") && ["wirkungsoekonomie.de", "parlament.wirkungsoekonomie.de"].includes(host);
  // The owner explicitly authorized this worker to read these own public APIs.
  // Never transfer this exception to another origin or a third-party source.
  return Boolean(policy.respect_robots) && !ownPublication;
}

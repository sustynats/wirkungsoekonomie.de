const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const mainScriptUrl =
  document.currentScript?.src || document.querySelector('script[src*="assets/js/main.js"]')?.src || "";
const siteAnalyticsEndpoint = "https://akademie.wirkungsoekonomie.de/api/site-event";
const siteAnalyticsSessionKey = "wirkungsoekonomie-site-session";
const siteAnalyticsVisitorKey = "wirkungsoekonomie-site-visitor";

const mainElement = document.querySelector("main");

function relativeSiteUrl(path) {
  const scriptUrl = mainScriptUrl || `${window.location.origin}/assets/js/main.js`;
  return new URL(`../../${String(path).replace(/^\/+/, "")}`, scriptUrl).href;
}

if (mainElement) {
  mainElement.id = mainElement.id || "main-content";
  mainElement.setAttribute("tabindex", "-1");
}

if (mainElement && !document.querySelector(".skip-link")) {
  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = "#main-content";
  skipLink.textContent = "Zum Inhalt springen";
  document.body.prepend(skipLink);
}

document.querySelectorAll(".article-status-note").forEach((note) => note.remove());

if (navToggle && siteNav) {
  let navReturnFocus = null;
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "summary",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const closeNavigation = () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Menü öffnen");
    document.body.classList.remove("nav-is-open");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    document.body.classList.toggle("nav-is-open", isOpen);
    navReturnFocus = isOpen && document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (isOpen) {
      window.requestAnimationFrame(() => siteNav.querySelector("a")?.focus());
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node) || !siteNav.classList.contains("open")) {
      return;
    }

    if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) {
      closeNavigation();
    }
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!siteNav.classList.contains("open")) {
      return;
    }

    if (event.key === "Escape") {
      closeNavigation();
      (navReturnFocus || navToggle).focus();
      return;
    }

    if (event.key === "Tab") {
      const focusable = Array.from(siteNav.querySelectorAll(focusableSelector)).filter(
        (element) => element instanceof HTMLElement && !element.hasAttribute("hidden"),
      );
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

if (siteNav && !document.querySelector(".site-search-shortcut") && !Array.from(document.querySelectorAll(".site-header a")).some((link) => /suche\.html/.test(link.getAttribute("href") || ""))) {
  const searchLink = document.createElement("a");
  searchLink.href = relativeSiteUrl("suche.html");
  searchLink.className = "site-search-shortcut";
  searchLink.textContent = "Suche";
  searchLink.setAttribute("aria-label", "Website-Suche öffnen");
  searchLink.setAttribute("title", "Suche");
  if (window.location.pathname.endsWith("/suche.html")) {
    searchLink.classList.add("active");
    searchLink.setAttribute("aria-current", "page");
  }
  siteNav.after(searchLink);
}

document.querySelectorAll(".site-nav a, .site-utility-nav a, .site-nav-utility a").forEach((link) => {
  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }

  const normalizedPath = window.location.pathname.replace(/^\/+/, "") || "index.html";
  const matchTokens = (link.dataset.navMatch || "").split("|").filter(Boolean);
  const linkPath = link.pathname.replace(/^\/+/, "") || "index.html";
  const isCurrent = matchTokens.length
    ? matchTokens.some((token) => normalizedPath === token || normalizedPath.startsWith(token))
    : normalizedPath === linkPath || normalizedPath.endsWith(`/${linkPath}`);

  link.classList.toggle("active", isCurrent);
  if (isCurrent) {
    link.setAttribute("aria-current", "page");
    const more = link.closest(".nav-more");
    if (more instanceof HTMLDetailsElement) {
      more.classList.add("active");
    }
  } else {
    link.removeAttribute("aria-current");
  }
});

document.querySelectorAll(".site-nav .nav-more[data-nav-match]").forEach((details) => {
  if (!(details instanceof HTMLDetailsElement)) {
    return;
  }

  const normalizedPath = window.location.pathname.replace(/^\/+/, "") || "index.html";
  const matchTokens = (details.dataset.navMatch || "").split("|").filter(Boolean);
  const isCurrent = matchTokens.some((token) => normalizedPath === token || normalizedPath.startsWith(token));
  details.classList.toggle("active", isCurrent || details.classList.contains("active"));
});

document.querySelectorAll(".footer-nav a, .footer-legal-nav a").forEach((link) => {
  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }
  const normalizedPath = window.location.pathname.replace(/^\/+/, "") || "index.html";
  const matchTokens = (link.dataset.navMatch || "").split("|").filter(Boolean);
  const isCurrent = matchTokens.some((token) => normalizedPath === token || normalizedPath.startsWith(token));
  link.classList.toggle("active", isCurrent);
  if (isCurrent) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

function relatedQuestionLink(href, label, tag = "Frage") {
  return { href: relativeSiteUrl(href), label, tag };
}

function isDebugPath(path = window.location.pathname) {
  return /^\/?_debug(\/|$)/.test(path);
}

function getQuestionSubmissionContext() {
  const path = window.location.pathname.replace(/^\/+/, "") || "index.html";
  const title = document.querySelector("h1")?.textContent?.trim() || document.title || "Website";

  if (/^blog\//.test(path)) {
    return { context: "Journal", topic: "journal", pageType: "journal" };
  }
  if (/^begriffe\/[^/]+\/?$/.test(path) && !path.endsWith("begriffe/")) {
    return { context: `Glossar: ${title}`, topic: "glossar", pageType: "glossar" };
  }
  if (/^wirkungsfelder\//.test(path)) {
    return { context: `Wirkungsfeld: ${title}`, topic: "wirkungsfeld", pageType: "wirkungsfeld" };
  }
  if (/^(werkzeuge|woek-id-register|register|methodik|tools)\//.test(path)) {
    return { context: `Methode/Werkzeug: ${title}`, topic: "werkzeuge", pageType: "werkzeug" };
  }
  if (/^(erleben|ausprobieren)\//.test(path) || /rechner|demo|scanner|generator/.test(path)) {
    return { context: `Demo: ${title}`, topic: "demo", pageType: "demo" };
  }
  if (/^(bibliothek|dokumente|referenz|buch|downloads|werkstatt)\//.test(path) || /^(buch|downloads)\.html$/.test(path)) {
    return { context: `Bibliothek: ${title}`, topic: "bibliothek", pageType: "bibliothek" };
  }
  if (/^akademie/.test(path)) {
    return { context: `Akademie: ${title}`, topic: "akademie", pageType: "akademie" };
  }
  if (/^(fuer|mitmachen)\//.test(path) || /^(mitmachen)\.html$/.test(path)) {
    return { context: `Mitmachen/Zielgruppe: ${title}`, topic: "mitmachen", pageType: "zielgruppe" };
  }
  return { context: title, topic: "website", pageType: "seite" };
}

function questionSubmissionUrl() {
  const context = getQuestionSubmissionContext();
  const title = document.querySelector("h1")?.textContent?.trim() || document.title || "";
  const params = new URLSearchParams({
    context: context.context,
    url: window.location.href,
    title,
    topic: context.topic,
    pageType: context.pageType,
  });
  return `https://akademie.wirkungsoekonomie.de/fragen/einreichen?${params.toString()}`;
}

function questionActionsHtml() {
  const submissionHref = questionSubmissionUrl().replace(/&/g, "&amp;");
  return `<p class="related-question-actions"><a class="text-link" href="${relativeSiteUrl("fragen/")}">Alle Fragen und Einwände lesen</a> · <a class="text-link" href="${submissionHref}" data-question-submit-link>Frage zu diesem Thema einreichen</a></p>`;
}

function getContextualQuestions() {
  const path = window.location.pathname.replace(/^\/+/, "") || "index.html";
  const pageText = `${document.title} ${mainElement?.textContent || ""}`.toLowerCase();

  if (/^blog\/.+\.html$/.test(path)) {
    if (/social taxonomy|eu-taxonomie|taxonomie|sustainable finance/.test(pageText)) {
      return [
        relatedQuestionLink("fragen/#esg", "Ist das nur ESG mit neuem Namen?", "Abgrenzung"),
        relatedQuestionLink("fragen/#social-credit", "Ist das Social Credit?", "Schutzfrage"),
        relatedQuestionLink("fragen/#fehlende-daten", "Was passiert bei fehlenden Daten?", "Daten"),
      ];
    }
    if (/bildung|schule|wirkungskompetenz|idg/.test(pageText)) {
      return [
        relatedQuestionLink("fragen/#messbarkeit", "Kann man Wirkung überhaupt messen?", "Verständnis"),
        relatedQuestionLink("fragen/#social-credit", "Werden Menschen bewertet?", "Schutzfrage"),
      ];
    }
    return [
      relatedQuestionLink("fragen/#planwirtschaft", "Ist die Wirkungsökonomie Planwirtschaft?", "Einwand"),
      relatedQuestionLink("fragen/#amtlich", "Ist das schon ein amtlicher Standard?", "Status"),
    ];
  }

  if (/^begriffe\/[^/]+\/?$/.test(path) && !path.endsWith("begriffe/")) {
    if (/folgencheck|faktencheck|wirkstoff|wirkungspfad|wirkungsraum/.test(path)) {
      return [
        relatedQuestionLink("fragen/#faktencheck-folgencheck", "Faktencheck vs. Folgencheck?", "Abgrenzung"),
        relatedQuestionLink("fragen/#zensur", "Ist Folgencheck Zensur?", "Schutzfrage"),
        relatedQuestionLink("fragen/#wirkstoff", "Was ist ein Wirkstoff?", "Begriff"),
      ];
    }
    if (/wirkungseinkommen|wirkungsfonds|wirkungsrente/.test(path)) {
      return [
        relatedQuestionLink("fragen/#geld", "Woher kommt das Geld?", "Finanzierung"),
        relatedQuestionLink("fragen/#bge", "Ist Wirkungseinkommen BGE?", "Abgrenzung"),
      ];
    }
    if (/eu-taxonomie|social-taxonomy|csrd|esrs|esg|green-deal/.test(path)) {
      return [
        relatedQuestionLink("fragen/#esg", "Ist das nur ESG mit neuem Namen?", "Abgrenzung"),
        relatedQuestionLink("fragen/#fehlende-daten", "Was passiert bei fehlenden Daten?", "Daten"),
      ];
    }
    return [
      relatedQuestionLink("fragen/#messbarkeit", "Kann man Wirkung überhaupt messen?", "Verständnis"),
      relatedQuestionLink("fragen/#amtlich", "Ist das schon ein amtlicher Standard?", "Status"),
    ];
  }

  if (/^wirkungsfelder\//.test(path)) {
    return [
      relatedQuestionLink("fragen/#messbarkeit", "Kann man Wirkung in diesem Feld überhaupt messen?", "Verständnis"),
      relatedQuestionLink("fragen/#fehlende-daten", "Was passiert bei fehlenden Daten?", "Daten"),
      relatedQuestionLink("fragen/#social-credit", "Werden Menschen bewertet?", "Schutzfrage"),
    ];
  }

  if (/^(werkzeuge|woek-id-register|register|methodik|tools)\//.test(path)) {
    return [
      relatedQuestionLink("fragen/#amtlich", "Ist das schon ein amtlicher Standard?", "Status"),
      relatedQuestionLink("fragen/#fehlende-daten", "Was passiert bei fehlenden Daten?", "Daten"),
      relatedQuestionLink("fragen/#steuerklasse", "Wer entscheidet die Steuerklasse?", "Governance"),
    ];
  }

  if (/^(erleben|ausprobieren)\//.test(path) || /rechner|demo|scanner|generator/.test(path)) {
    return [
      relatedQuestionLink("fragen/#amtlich", "Ist die Demo amtlich?", "Status"),
      relatedQuestionLink("fragen/#social-credit", "Bewertet die Demo Personen?", "Schutzfrage"),
      relatedQuestionLink("fragen/#fehlende-daten", "Wie werden Datenlücken behandelt?", "Daten"),
    ];
  }

  if (/^(bibliothek|dokumente|referenz|buch|downloads|werkstatt)\//.test(path) || /^(buch|downloads)\.html$/.test(path)) {
    return [
      relatedQuestionLink("fragen/#amtlich", "Ist das ein finaler Standard?", "Status"),
      relatedQuestionLink("fragen/#messbarkeit", "Wie wird Wirkung fachlich begründet?", "Methodik"),
      relatedQuestionLink("fragen/#esg", "Was ist der Unterschied zu ESG?", "Abgrenzung"),
    ];
  }

  if (/^akademie/.test(path)) {
    return [
      relatedQuestionLink("fragen/#messbarkeit", "Kann man Wirkung überhaupt lernen und messen?", "Verständnis"),
      relatedQuestionLink("fragen/#amtlich", "Ist das staatlich anerkannt?", "Status"),
      relatedQuestionLink("fragen/#social-credit", "Geht es um Personenbewertung?", "Schutzfrage"),
    ];
  }

  return [
    relatedQuestionLink("fragen/#planwirtschaft", "Ist die Wirkungsökonomie Planwirtschaft?", "Einwand"),
    relatedQuestionLink("fragen/#social-credit", "Ist das Social Credit?", "Schutzfrage"),
    relatedQuestionLink("fragen/#messbarkeit", "Kann man Wirkung überhaupt messen?", "Verständnis"),
  ];
}

function injectContextualQuestions() {
  if (isDebugPath() || !mainElement || document.querySelector(".related-questions-block")) {
    return;
  }
  const questions = getContextualQuestions().slice(0, 4);
  if (!questions.length) {
    return;
  }
  const section = document.createElement("aside");
  section.className = "section related-questions-block";
  section.setAttribute("aria-labelledby", "contextual-related-questions-title");
  section.innerHTML = `
    <div class="section-header">
      <p class="hero-kicker">Passende Fragen</p>
      <h2 id="contextual-related-questions-title">Passende Fragen zum Begriff</h2>
    </div>
    <div class="related-question-grid">
      ${questions
        .map(
          (item) => `<article class="related-question-card"><span>${item.tag}</span><strong>${item.label}</strong><a class="text-link" href="${item.href}">Antwort lesen</a></article>`,
        )
        .join("")}
    </div>
    ${questionActionsHtml()}
  `;
  mainElement.append(section);
}

function enhanceRelatedQuestionBlocks() {
  if (isDebugPath()) {
    return;
  }
  document.querySelectorAll(".related-questions-block").forEach((block) => {
    if (!(block instanceof HTMLElement) || block.querySelector("[data-question-submit-link]")) {
      return;
    }
    block.insertAdjacentHTML("beforeend", questionActionsHtml());
  });
}

injectContextualQuestions();
enhanceRelatedQuestionBlocks();

function shouldSkipSiteAnalytics() {
  return navigator.doNotTrack === "1" || window.doNotTrack === "1";
}

function getSiteAnalyticsSessionId() {
  try {
    const existing = sessionStorage.getItem(siteAnalyticsSessionKey);
    if (existing) {
      return existing;
    }

    const sessionId =
      window.crypto && "randomUUID" in window.crypto
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(siteAnalyticsSessionKey, sessionId);
    return sessionId;
  } catch (error) {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function getSiteAnalyticsVisitorId() {
  try {
    const existing = localStorage.getItem(siteAnalyticsVisitorKey);
    if (existing) {
      return existing;
    }

    const visitorId =
      window.crypto && "randomUUID" in window.crypto
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(siteAnalyticsVisitorKey, visitorId);
    return visitorId;
  } catch (error) {
    return null;
  }
}

function clientAnalyticsDeviceInfo() {
  const width = Math.max(window.innerWidth || 0, document.documentElement?.clientWidth || 0);
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  const touchPoints = Number(navigator.maxTouchPoints || 0);
  const deviceType =
    /ipad|tablet/i.test(navigator.userAgent || "") || (coarsePointer && width >= 720)
      ? "tablet"
      : /mobi|android|iphone|ipod/i.test(navigator.userAgent || "") || (coarsePointer && width < 720)
        ? "mobile"
        : "desktop";

  return {
    deviceType,
    viewportWidth: width || null,
    viewportHeight: Math.max(window.innerHeight || 0, document.documentElement?.clientHeight || 0) || null,
    screenWidth: window.screen?.width || null,
    screenHeight: window.screen?.height || null,
    language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
  };
}

function analyticsDetails(details = {}) {
  const safe = {};
  Object.entries(details || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || typeof value === "function") return;
    if (typeof value === "string") {
      safe[key] = value.slice(0, key === "metadata" ? 2000 : 500);
      return;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
      return;
    }
    if (Array.isArray(value)) {
      safe[key] = value.slice(0, 12).map((item) => String(item).slice(0, 120));
      return;
    }
    if (typeof value === "object") {
      safe[key] = Object.fromEntries(
        Object.entries(value)
          .slice(0, 24)
          .map(([nestedKey, nestedValue]) => [nestedKey, String(nestedValue ?? "").slice(0, 240)])
      );
    }
  });
  return safe;
}

function sendSiteAnalyticsEvent(eventType, details = {}) {
  if (shouldSkipSiteAnalytics()) {
    return;
  }

  const safeDetails = analyticsDetails(details);
  const payload = JSON.stringify({
    eventType,
    path: `${window.location.pathname}${window.location.search}`,
    title: safeDetails.title || document.title,
    referrer: document.referrer,
    sessionId: getSiteAnalyticsSessionId(),
    visitorId: getSiteAnalyticsVisitorId(),
    device: clientAnalyticsDeviceInfo(),
    ...safeDetails
  });

  fetch(siteAnalyticsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(siteAnalyticsEndpoint, new Blob([payload], { type: "text/plain;charset=UTF-8" }));
    }
  });
}

sendSiteAnalyticsEvent("page_view");
window.setInterval(() => sendSiteAnalyticsEvent("heartbeat"), 60000);

document.querySelectorAll("[data-analytics-event='academy_app_cta']").forEach((link) => {
  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }

  link.addEventListener("click", () => {
    const label = link.dataset.analyticsLabel || link.textContent?.trim() || "academy-app";
    sendSiteAnalyticsEvent("outbound_click", {
      title: `Akademie-App CTA: ${label}`,
    });
  });
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("[data-analytics-event]") : null;
  if (!(target instanceof HTMLAnchorElement) || target.dataset.analyticsEvent === "academy_app_cta") {
    return;
  }

  sendSiteAnalyticsEvent(target.dataset.analyticsEvent || "site_interaction", {
    href: target.href,
    title: target.textContent?.trim().slice(0, 140) || "",
  });
});

let blogCards = Array.from(document.querySelectorAll(".blog-card[data-category]"));
const blogFilterLinks = Array.from(document.querySelectorAll("[data-blog-filter]"));
const blogTagLinks = Array.from(document.querySelectorAll("[data-blog-tag]"));
const blogTypeLinks = Array.from(document.querySelectorAll("[data-blog-type-filter]"));
const blogFilterStatus = document.querySelector(".blog-filter-status");
const blogLoadMoreButton = document.querySelector("[data-blog-load-more]");
const blogSearchInput = document.querySelector("[data-blog-search]");
const blogResetButton = document.querySelector("[data-blog-reset]");
const blogInitialLimit = Number.POSITIVE_INFINITY;
const blogLoadStep = 12;
const blogFilterState = {
  category: "all",
  tag: "all",
  type: "all",
  query: "",
  limit: blogInitialLimit,
};

function setPressedState(links, activeValue, dataKey) {
  links.forEach((link) => {
    const value = link.dataset[dataKey] || "all";
    const isActive = value === activeValue;
    link.classList.toggle("active", isActive);
    link.setAttribute("role", "button");
    link.setAttribute("aria-pressed", String(isActive));
  });
}

function getBlogCardTypes(card) {
  return Array.from(card.querySelectorAll(".blog-origin-badge")).map((badge) =>
    badge.textContent.trim().toLowerCase().replace(/\s+/g, "-"),
  );
}

function setActiveBlogLinks() {
  setPressedState(blogFilterLinks, blogFilterState.category, "blogFilter");
  setPressedState(blogTagLinks, blogFilterState.tag, "blogTag");
  setPressedState(blogTypeLinks, blogFilterState.type, "blogTypeFilter");
}

function getBlogFilterSummary(matchedCount, visibleCount) {
  const activeParts = [];

  if (blogFilterState.category !== "all") {
    activeParts.push(`Kategorie: ${blogFilterState.category.replaceAll("-", " ")}`);
  }
  if (blogFilterState.tag !== "all") {
    activeParts.push(`Tag: ${blogFilterState.tag}`);
  }
  if (blogFilterState.type !== "all") {
    activeParts.push(`Texttyp: ${blogFilterState.type.replaceAll("-", " ")}`);
  }
  if (blogFilterState.query.length >= 2) {
    activeParts.push(`Suche: „${blogFilterState.query}“`);
  }

  const visibleText =
    matchedCount > visibleCount
      ? `${visibleCount} von ${matchedCount} Beiträgen werden angezeigt.`
      : `${visibleCount} Beiträge gefunden.`;

  return activeParts.length ? `${visibleText} Aktive Filter: ${activeParts.join(" · ")}.` : visibleText;
}

function applyBlogFilter({ scroll = false, hash = "" } = {}) {
  blogCards = Array.from(document.querySelectorAll(".blog-card[data-category]"));

  if (!blogCards.length) {
    return;
  }

  let visibleCount = 0;
  let matchedCount = 0;
  const hasSearch = blogFilterState.query.length >= 2;

  blogCards.forEach((card) => {
    const tags = (card.dataset.tags || "").split(" ").filter(Boolean);
    const types = getBlogCardTypes(card);
    const categoryMatch = blogFilterState.category === "all" || card.dataset.category === blogFilterState.category;
    const tagMatch = blogFilterState.tag === "all" || tags.includes(blogFilterState.tag);
    const typeMatch = blogFilterState.type === "all" || types.includes(blogFilterState.type);
    const haystack = [
      card.textContent,
      card.dataset.category,
      card.dataset.tags,
    ]
      .join(" ")
      .toLowerCase();
    const searchMatch = !hasSearch || haystack.includes(blogFilterState.query);
    const isMatch = categoryMatch && tagMatch && typeMatch && searchMatch;
    const isCollapsed = isMatch && matchedCount >= blogFilterState.limit;

    if (isMatch) {
      matchedCount += 1;
    }

    card.hidden = !isMatch || isCollapsed;
    if (isMatch && !isCollapsed) {
      visibleCount += 1;
    }
  });

  if (blogLoadMoreButton) {
    blogLoadMoreButton.hidden = matchedCount <= blogFilterState.limit;
  }

  if (blogFilterStatus) {
    blogFilterStatus.textContent = getBlogFilterSummary(matchedCount, visibleCount);
  }

  setActiveBlogLinks();

  if (scroll) {
    moveToBlogList(hash || "#beitraege");
  }
}

function resetBlogFilters() {
  blogFilterState.category = "all";
  blogFilterState.tag = "all";
  blogFilterState.type = "all";
  blogFilterState.query = "";
  blogFilterState.limit = blogInitialLimit;

  if (blogSearchInput) {
    blogSearchInput.value = "";
  }

  applyBlogFilter();
}

function moveToBlogList(hash) {
  if (hash) {
    history.replaceState(null, "", hash);
  }

  document.querySelector("#beitraege")?.scrollIntoView({ block: "start" });
}

blogFilterLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const value = link.dataset.blogFilter;
    blogFilterState.category = value || "all";
    blogFilterState.limit = blogInitialLimit;
    applyBlogFilter({ scroll: true, hash: value === "all" ? "#beitraege" : `#thema-${value}` });
  });
});

blogTagLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const value = link.dataset.blogTag;
    blogFilterState.tag = blogFilterState.tag === value ? "all" : value || "all";
    blogFilterState.limit = blogInitialLimit;
    applyBlogFilter({ scroll: true, hash: blogFilterState.tag === "all" ? "#beitraege" : `#tag-${value}` });
  });
});

blogTypeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    blogFilterState.type = link.dataset.blogTypeFilter || "all";
    blogFilterState.limit = blogInitialLimit;
    applyBlogFilter({ scroll: true, hash: blogFilterState.type === "all" ? "#beitraege" : `#typ-${blogFilterState.type}` });
  });
});

document.addEventListener("click", (event) => {
  if (event.defaultPrevented) {
    return;
  }

  const link = event.target instanceof Element ? event.target.closest("[data-blog-filter], [data-blog-tag]") : null;
  if (!link || !link.closest("[data-journal-list]")) {
    return;
  }

  event.preventDefault();

  if (link.dataset.blogFilter) {
    blogFilterState.category = link.dataset.blogFilter || "all";
    blogFilterState.limit = blogInitialLimit;
    applyBlogFilter({ scroll: true, hash: blogFilterState.category === "all" ? "#beitraege" : `#thema-${blogFilterState.category}` });
    return;
  }

  const value = link.dataset.blogTag;
  blogFilterState.tag = blogFilterState.tag === value ? "all" : value || "all";
  blogFilterState.limit = blogInitialLimit;
  applyBlogFilter({ scroll: true, hash: blogFilterState.tag === "all" ? "#beitraege" : `#tag-${value}` });
});

if (blogLoadMoreButton) {
  blogLoadMoreButton.addEventListener("click", () => {
    blogFilterState.limit += blogLoadStep;
    applyBlogFilter();
  });
}

if (blogSearchInput) {
  blogSearchInput.addEventListener("input", () => {
    blogFilterState.query = blogSearchInput.value.trim().toLowerCase();
    blogFilterState.limit = blogInitialLimit;
    applyBlogFilter();
  });
}

if (blogResetButton) {
  blogResetButton.addEventListener("click", () => {
    resetBlogFilters();
    moveToBlogList("#beitraege");
  });
}

if (blogCards.length) {
  const hash = decodeURIComponent(window.location.hash || "");
  const categoryMatch = hash.match(/^#thema-(.+)$/);
  const tagMatch = hash.match(/^#tag-(.+)$/);
  const typeMatch = hash.match(/^#typ-(.+)$/);

  if (categoryMatch) {
    blogFilterState.category = categoryMatch[1];
  } else if (tagMatch) {
    blogFilterState.tag = tagMatch[1];
  } else if (typeMatch) {
    blogFilterState.type = typeMatch[1];
  }

  applyBlogFilter();
}

document.addEventListener("journal:rendered", () => {
  applyBlogFilter();
});

function initOnlineDocumentSearch() {
  const input = document.querySelector("[data-online-document-search]");
  const status = document.querySelector("[data-online-document-status]");
  const list = document.querySelector("[data-online-document-list]");
  if (!input || !list) {
    return;
  }

  const cards = Array.from(list.querySelectorAll(".info-card, .document-card, article"));
  const apply = () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const haystack = `${card.getAttribute("data-search") || ""} ${card.textContent || ""}`.toLowerCase();
      const visible = !query || haystack.includes(query);
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });
    if (status) {
      status.textContent = `${visibleCount} Dokumente gefunden.`;
    }
  };

  input.addEventListener("input", apply);
  apply();
}

initOnlineDocumentSearch();

const downloadCards = Array.from(document.querySelectorAll("[data-download-card]"));
const downloadFilterButtons = Array.from(document.querySelectorAll("[data-download-filter]"));
const downloadSearchInput = document.querySelector("[data-download-search]");
const downloadFilterStatus = document.querySelector(".download-filter-status");
const downloadFilterState = {
  category: "all",
  query: "",
};

function applyDownloadFilter() {
  if (!downloadCards.length) {
    return;
  }

  let visibleCount = 0;
  const hasSearch = downloadFilterState.query.length >= 2;

  downloadCards.forEach((card) => {
    const categories = (card.dataset.downloadCategory || "").split(" ").filter(Boolean);
    const categoryMatch = downloadFilterState.category === "all" || categories.includes(downloadFilterState.category);
    const haystack = [
      card.dataset.downloadTitle,
      card.dataset.downloadDescription,
      card.textContent,
    ].join(" ").toLowerCase();
    const searchMatch = !hasSearch || haystack.includes(downloadFilterState.query);
    const isVisible = categoryMatch && searchMatch;

    card.hidden = !isVisible;
    if (isVisible) {
      visibleCount += 1;
    }
  });

  downloadFilterButtons.forEach((button) => {
    const isActive = button.dataset.downloadFilter === downloadFilterState.category;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (downloadFilterStatus) {
    const labels = {
      all: "alle Kategorien",
      grundlagen: "Grundlagen",
      methodik: "Methodik",
      "steuern-recht": "Steuern und Recht",
      anwendungen: "Anwendungen",
      zielgruppen: "Zielgruppen",
      akademie: "Akademie",
      "medien-demokratie": "Medien und Demokratie",
      "daten-indikatoren": "Daten und Indikatoren",
      archiv: "Archiv / ältere Arbeitsstände",
    };
    const categoryLabel = labels[downloadFilterState.category] || downloadFilterState.category;
    const queryLabel = hasSearch ? ` · Suche: „${downloadFilterState.query}“` : "";
    downloadFilterStatus.textContent = `${visibleCount} Veröffentlichungen gefunden · ${categoryLabel}${queryLabel}`;
  }
}

downloadFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    downloadFilterState.category = button.dataset.downloadFilter || "all";
    applyDownloadFilter();
  });
});

if (downloadSearchInput) {
  downloadSearchInput.addEventListener("input", () => {
    downloadFilterState.query = downloadSearchInput.value.trim().toLowerCase();
    applyDownloadFilter();
  });
}

applyDownloadFilter();

function initRadarSearch() {
  const root = document.querySelector("[data-radar-search]");
  if (!root) {
    return;
  }

  const input = root.querySelector("[data-radar-search-input]");
  const resultsNode = root.querySelector("[data-radar-search-results]");
  const statusNode = root.querySelector("[data-radar-search-status]");
  if (!input || !resultsNode || !statusNode) {
    return;
  }

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss");

  const searchableText = (entry) =>
    normalize(
      [
        entry.title,
        entry.description,
        entry.section,
        entry.type,
        entry.format,
        ...(entry.tags || []),
        ...(entry.aliases || []),
        ...(entry.semanticTerms || []),
      ].join(" "),
    );

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const renderCommunityNoResults = () => `<section class="community-submission-section community-submission-section--noResults" data-community-submission-block data-community-submission-variant="noResults" data-search-exclude>
    <div>
      <article class="card community-submission-block">
        <div class="community-submission-copy">
          <p class="card-kicker">Nichts gefunden?</p>
          <h2>Soll dieses Narrativ in den Debatten-Kompass aufgenommen werden?</h2>
          <p>Wenn du eine Aussage, einen Frame oder ein Debattenmuster gesucht hast, reiche es ein. Wir prüfen, ob daraus eine neue Einordnung entstehen sollte.</p>
        </div>
        <div class="community-submission-actions">
          <a class="btn btn-primary" href="https://akademie.wirkungsoekonomie.de/narrativ-einreichen/">Narrativ einreichen</a>
          <a class="btn btn-secondary" href="${relativeSiteUrl("wirkungsradar/pruefprozess/")}">Prüfprozess verstehen</a>
        </div>
      </article>
    </div>
  </section>`;

  const tagStopwords = new Set([
    "aber",
    "alle",
    "alles",
    "als",
    "auch",
    "auf",
    "aus",
    "bei",
    "das",
    "da",
    "der",
    "die",
    "ein",
    "eine",
    "einer",
    "eines",
    "einem",
    "für",
    "fuer",
    "hat",
    "immer",
    "index",
    "ist",
    "live",
    "mit",
    "nicht",
    "nur",
    "oder",
    "oben",
    "schon",
    "sich",
    "sind",
    "themen",
    "und",
    "von",
    "was",
    "werden",
    "wird",
    "wirkungsradar",
  ]);

  const cleanTitle = (value) =>
    String(value || "")
      .replace(/\s+[-–]\s+Wirkungsradar\s+Live\s*$/i, "")
      .replace(/\s+\|\s+Wirkungsradar\s+Live\s*$/i, "")
      .replace(/\s+[-–]\s+Wirkungsradar\s+Detail\s*$/i, "")
      .replace(/\s+\|\s+Wirkungsradar\s+Detail\s*$/i, "")
      .replace(/\s+[-–]\s+Wirkungsradar\s*$/i, "")
      .replace(/\s+\|\s+Psychologie\s+im\s+Wirkungsradar\s*$/i, "")
      .replace(/^Psychologie\s+im\s+Wirkungsradar\s+[-–]\s+/i, "")
      .replace(/^Wirkungsradar$/i, "Folgencheck für öffentliche Aussagen")
      .trim();

  const radarPathInfo = (entry) => {
    const url = String(entry?.url || "");
    const match = url.match(/^\/wirkungsradar\/([^/]+)\/([^/]+)\//);
    if (!match) {
      return { group: url, kind: "other", rank: 6 };
    }
    const [, section, slug] = match;
    const ranks = {
      live: 1,
      detail: 2,
      themen: 3,
      narrative: 4,
      psychologie: 5,
    };
    if (section === "live" || section === "detail") {
      return { group: `claim:${slug}`, kind: section, rank: ranks[section] };
    }
    return { group: `${section}:${slug}`, kind: section, rank: ranks[section] || 6 };
  };

  const canonicalizeRadarEntries = (entries) => {
    const byGroup = new Map();
    entries.forEach((entry) => {
      const info = radarPathInfo(entry);
      const next = { ...entry, radarKind: info.kind, radarRank: info.rank };
      const existing = byGroup.get(info.group);
      if (
        !existing ||
        next.radarRank < existing.radarRank ||
        (next.radarRank === existing.radarRank && (next.priority || 9999) < (existing.priority || 9999))
      ) {
        byGroup.set(info.group, next);
      }
    });
    return [...byGroup.values()];
  };

  const normalizeTag = (value) =>
    normalize(value)
      .replace(/[^a-z0-9+]+/g, " ")
      .trim();

  const displayTag = (value) => {
    const tag = String(value || "").trim();
    const normalized = normalizeTag(tag);
    if (!tag || normalized.length < 3 || tagStopwords.has(normalized)) return "";
    if (normalized === "co2") return "CO₂";
    if (normalized === "sdg" || normalized === "sdg+") return tag.toUpperCase();
    if (normalized === "lkw") return "Lkw";
    return tag.replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const render = (items, query = "") => {
    const trimmed = query.trim();
    const visibleItems = items.slice(0, 10);
    statusNode.textContent = trimmed
      ? `${items.length} Treffer im Wirkungsradar`
      : `${items.length} Radar-Seiten bereit`;

    if (!visibleItems.length) {
      resultsNode.innerHTML = renderCommunityNoResults();
      return;
    }

    resultsNode.innerHTML = visibleItems
      .map((entry) => {
        const actionLabel =
          entry.radarKind === "live" ? "Antwort öffnen" : entry.radarKind === "detail" ? "Analyse öffnen" : "Seite öffnen";
        const tags = [entry.radarKind === "live" ? "Live" : "", entry.section === "Wirkungsradar" ? "" : entry.section, ...(entry.tags || [])]
          .map(displayTag)
          .filter(Boolean)
          .filter((tag, index, list) => list.findIndex((item) => normalize(item) === normalize(tag)) === index)
          .slice(0, 3)
          .map((tag) => `<span>${escapeHtml(tag)}</span>`)
          .join("");
        return `<a class="radar-search-result" href="${escapeHtml(entry.url)}">
          <span class="radar-search-result-meta">${tags}</span>
          <strong>${escapeHtml(cleanTitle(entry.title))}</strong>
          <em>${escapeHtml(entry.description || "Wirkungsradar-Inhalt öffnen.")}</em>
          <span class="radar-search-result-actions"><span>${escapeHtml(actionLabel)}</span></span>
        </a>`;
      })
      .join("");
  };

  Promise.all([
    fetch(relativeSiteUrl("assets/search/search-index.json")).then((response) => (response.ok ? response.json() : Promise.reject(new Error("search-index")))),
    fetch(relativeSiteUrl("assets/data/wirkungsradar-synonyms.json")).then((response) => (response.ok ? response.json() : {})).catch(() => ({})),
    fetch(relativeSiteUrl("assets/data/wirkungsradar-canonical-map.json")).then((response) => (response.ok ? response.json() : {})).catch(() => ({})),
  ])
    .then(([entries, synonymMap, canonicalMap]) => {
      const canonicalUrl = (url) => {
        const value = String(url || "");
        const aliases = canonicalMap?.aliases || {};
        if (aliases[value]) return aliases[value];
        const detail = value.match(/^\/wirkungsradar\/detail\/([^/]+)\//)?.[1];
        if (detail) return `/wirkungsradar/live/${detail}/`;
        return value;
      };

      const canonicalSlug = (entry) =>
        canonicalUrl(entry?.url).match(/^\/wirkungsradar\/live\/([^/]+)\//)?.[1] ||
        String(entry?.url || "").match(/^\/wirkungsradar\/(?:live|detail)\/([^/]+)\//)?.[1] ||
        "";

      const synonymsFor = (entry) => {
        const slug = canonicalSlug(entry);
        const legacy = Array.isArray(synonymMap?.[slug]) ? synonymMap[slug] : [];
        const canonical = Array.isArray(canonicalMap?.synonyms?.[slug]) ? canonicalMap.synonyms[slug] : [];
        return [...legacy, ...canonical];
      };
      const radarEntries = canonicalizeRadarEntries(
        (Array.isArray(entries) ? entries : [])
          .filter((entry) => entry?.url?.startsWith("/wirkungsradar/"))
          .map((entry) => ({ ...entry, url: canonicalUrl(entry.url) })),
      )
        .map((entry) => ({ ...entry, aliases: [...(entry.aliases || []), ...synonymsFor(entry)], searchText: searchableText({ ...entry, aliases: [...(entry.aliases || []), ...synonymsFor(entry)] }) }))
        .sort((a, b) => (a.priority || 9999) - (b.priority || 9999) || a.title.localeCompare(b.title, "de"));

      const update = () => {
        const tokens = normalize(input.value).split(/\s+/).filter(Boolean);
        const matches = tokens.length
          ? radarEntries.filter((entry) => tokens.every((token) => entry.searchText.includes(token)))
          : radarEntries;
        render(matches, input.value);
      };

      input.addEventListener("input", update);
      render(radarEntries);
    })
    .catch(() => {
      statusNode.textContent = "Radar-Suche konnte nicht geladen werden.";
      resultsNode.innerHTML = '<p class="radar-search-empty">Bitte nutze die Schlagwörter oder die Hauptsuche.</p>';
    });
}

initRadarSearch();

function initWirkungsradarLiveFilter() {
  const root = document.querySelector("[data-radar-live-filter]");
  const main = document.querySelector("main");
  if (!root || !main) return;

  const input = root.querySelector("[data-live-query]");
  const topicButtons = Array.from(root.querySelectorAll("[data-live-filter]"));
  const statusButtons = Array.from(root.querySelectorAll("[data-live-status]"));
  const count = root.querySelector("[data-live-count]");
  const cards = Array.from(main.querySelectorAll("[data-radar-card]"));
  const noResults = document.createElement("div");
  noResults.className = "radar-live-no-results";
  noResults.hidden = true;
  noResults.innerHTML = `<section class="community-submission-section community-submission-section--noResults" data-community-submission-block data-community-submission-variant="noResults" data-search-exclude>
    <div>
      <article class="card community-submission-block">
        <div class="community-submission-copy">
          <p class="card-kicker">Nichts gefunden?</p>
          <h2>Soll dieses Narrativ in den Debatten-Kompass aufgenommen werden?</h2>
          <p>Wenn du eine Aussage, einen Frame oder ein Debattenmuster gesucht hast, reiche es ein. Wir prüfen, ob daraus eine neue Einordnung entstehen sollte.</p>
        </div>
        <div class="community-submission-actions">
          <a class="btn btn-primary" href="https://akademie.wirkungsoekonomie.de/narrativ-einreichen/">Narrativ einreichen</a>
          <a class="btn btn-secondary" href="${relativeSiteUrl("wirkungsradar/pruefprozess/")}">Prüfprozess verstehen</a>
        </div>
      </article>
    </div>
  </section>`;
  root.after(noResults);
  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss");
  const state = { topic: "all", status: "all", query: "" };

  const setPressed = (buttons, key, value) => {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset[key] === value)));
  };

  const topicMatches = (card, topic) => topic === "all" || normalize(card.dataset.topic).includes(normalize(topic));
  const statusMatches = (card, status) => {
    if (status === "all") return true;
    if (status === "checked_v2_positive_examples") return card.dataset.status === "checked_v2_positive_examples";
    if (status === "sources") return normalize(card.dataset.source).includes("quelle");
    if (status === "drafts") return normalize(card.dataset.status).includes("draft");
    return false;
  };

  topicButtons.forEach((button) => {
    const topic = button.dataset.liveFilter || "all";
    const hasCards = cards.some((card) => topicMatches(card, topic));
    if (topic !== "all" && !hasCards) {
      button.hidden = true;
      button.disabled = true;
    }
  });

  statusButtons.forEach((button) => {
    const status = button.dataset.liveStatus || "all";
    const hasCards = cards.some((card) => statusMatches(card, status));
    if (status !== "all" && !hasCards) {
      button.hidden = true;
      button.disabled = true;
    }
  });

  const apply = () => {
    const tokens = normalize(state.query).split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach((card) => {
      const topicOk = topicMatches(card, state.topic);
      const statusOk = statusMatches(card, state.status);
      const searchOk = !tokens.length || tokens.every((token) => normalize(card.dataset.search).includes(token));
      const show = topicOk && statusOk && searchOk;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (count) {
      const label = count.dataset.liveCountLabel || "Karten";
      count.textContent = `${visible} ${label} gefunden`;
    }
    noResults.hidden = visible !== 0;
  };

  input?.addEventListener("input", () => {
    state.query = input.value;
    apply();
  });
  topicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.topic = button.dataset.liveFilter || "all";
      setPressed(topicButtons, "liveFilter", state.topic);
      apply();
    });
  });
  statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.status = button.dataset.liveStatus || "all";
      setPressed(statusButtons, "liveStatus", state.status);
      apply();
    });
  });
  apply();
}

initWirkungsradarLiveFilter();

function initCopyChips() {
  document.querySelectorAll("[data-copy-text]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy-text") || "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const old = button.textContent;
        button.textContent = "Kopiert";
        window.setTimeout(() => {
          button.textContent = old;
        }, 1600);
      } catch {
        button.textContent = "Text markieren";
      }
    });
  });
}

initCopyChips();

function initGlobalWirkungsradarBridge() {
  return;
}
initGlobalWirkungsradarBridge();

function initRadarPsychologyPanel() {
  if (
    !mainElement ||
    document.querySelector("[data-radar-psychology-panel]") ||
    document.querySelector(".debate-psychology-accordion, [data-v3-psychology-check], .debate-psychology-secondary")
  ) {
    return;
  }

  const path = window.location.pathname;
  const isRadarPage = path.includes("/wirkungsradar/");
  const isNarrativeDetail = path.includes("/wirkungsradar/narrative/") && !path.endsWith("/narrative/");
  const isDebateCardsOverview = /\/wirkungsradar\/(?:live|debattenkarten)\/?$/.test(path);
  const isDistributionToolPage = [
    "/wirkungsradar/studio/",
    "/wirkungsradar/templates/",
    "/wirkungsradar/workshops/",
    "/wirkungsradar/unterricht/",
    "/wirkungsradar/embed/",
    "/wirkungsradar/narrativ-einreichen/",
    "/wirkungsradar/newsletter/",
    "/wirkungsradar/nutzung/",
    "/wirkungsradar/host-playbook/",
  ].some((prefix) => path.includes(prefix));
  if (!isRadarPage || isNarrativeDetail || isDebateCardsOverview || isDistributionToolPage) {
    return;
  }

  const pageText = `${document.title} ${mainElement.textContent || ""}`.toLowerCase();
  const profiles = [
    {
      match: ["ohnmacht", "bringt nichts", "2 %", "2 prozent", "china"],
      effects: [["Erlernte Hilflosigkeit", "Handeln wirkt sinnlos."], ["Verantwortungsdiffusion", "Zuständigkeit wird nach außen verlagert."], ["Kognitive Entlastung", "Nichtstun fühlt sich kurzfristig leichter an."]],
      game: "Aus begrenzter Wirkung wird Wirkungslosigkeit gemacht.",
      counter: "Hebel sichtbar machen: Was können wir konkret beeinflussen, mit welcher Wirkung und welche Folgen hätte Unterlassen?",
    },
    {
      match: ["zensur", "nichts mehr sagen", "social credit", "ökodiktatur", "oekodiktatur", "verbot"],
      effects: [["Reaktanz", "Widerspruch oder Regeln fühlen sich wie Freiheitsverlust an."], ["Verlustaversion", "Möglicher Verlust wird stärker gewichtet als Schutzwirkung."], ["Identitätsschutz", "Sachfragen werden als Angriff auf Lebensweise oder Status erlebt."]],
      game: "Kritik, Moderation oder Steuerung wird als Unterdrückung gerahmt.",
      counter: "Freiheit und Widerspruch trennen: Was ist verboten, was wird nur kritisiert, und welche Wirkung soll eine Regel verhindern?",
    },
    {
      match: ["weltregierung", "alles gesteuert", "eliten", "agenda 2030", "sdgs"],
      effects: [["Kontrollillusion", "Ein geheimer Plan fühlt sich einfacher an als komplexe Kooperation."], ["Mustererkennung unter Unsicherheit", "Unverbundene Ereignisse werden zu Absicht verbunden."], ["Misstrauensspirale", "Gegenbelege gelten schnell als Teil des Plans."]],
      game: "Kooperation wird als Herrschaft, Komplexität als geheime Steuerung gedeutet.",
      counter: "Zuständigkeiten konkretisieren: Wer entscheidet demokratisch, wer kontrolliert, welche Rechtswirkung hat der Rahmen tatsächlich?",
    },
    {
      match: ["wissenschaft", "gekauft", "studie", "experten", "mainstreammedien", "medien"],
      effects: [["Bestätigungsfehler", "Quellen werden nach Weltbild statt Methode bewertet."], ["Hostile-Media-Effekt", "Widersprechende Berichte wirken automatisch parteiisch."], ["Motivated Reasoning", "Daten werden so gelesen, dass die gewünschte Schlussfolgerung bleibt."]],
      game: "Einzelne Fehler werden zur pauschalen Delegitimierung von Wissenschaft oder Medien gemacht.",
      counter: "Auf Verfahren zurückführen: Welche Quelle, welche Methode, welcher Fehler, welche Korrektur und welcher Interessenkonflikt sind konkret gemeint?",
    },
    {
      match: ["co₂", "co2", "preis", "abzocke", "systemkosten", "teurer"],
      effects: [["Verlustaversion", "Sichtbare Mehrkosten wirken stärker als vermiedene Schäden."], ["Salienz-Bias", "Der Preis auf der Rechnung ist sichtbarer als verteilte Folgekosten."], ["Fairness-Heuristik", "Belastung wirkt illegitim, wenn Rückverteilung fehlt."]],
      game: "Nur neue Kosten werden gezeigt, alte ausgelagerte Kosten verschwinden.",
      counter: "Kostenbild vervollständigen: Welche Kosten sind sichtbar, welche wurden bisher externalisiert, wer zahlt sie und wie wird sozial rückverteilt?",
    },
    {
      match: ["technik", "fusion", "batterie", "batterien", "e-auto", "wind", "erneuerbare"],
      effects: [["Optimismus- oder Negativitätsbias", "Technik wird entweder als Erlösung oder als Totalproblem erzählt."], ["Verfügbarkeitsheuristik", "Einzelbilder oder Einzelfälle ersetzen die Systembilanz."], ["Ambiguitätsaversion", "Unsicherheit wird genutzt, um den alten Pfad fortzusetzen."]],
      game: "Potenzial, Einzelfall oder Risiko wird mit der Gesamtwirkung verwechselt.",
      counter: "Pfad gegen Pfad vergleichen: Was wirkt bis wann, in welcher Größenordnung, mit welchen Kosten, Nebenwirkungen und Alternativen?",
    },
  ];

  const selected = profiles.find((profile) => profile.match.some((token) => pageText.includes(token))) || {
    effects: [["Kognitive Dissonanz", "Unbequeme Fakten werden abgewehrt, wenn sie Identität oder bisherige Entscheidungen bedrohen."], ["Bestätigungsfehler", "Passende Informationen werden bevorzugt, widersprechende abgewertet."], ["Verfügbarkeitsheuristik", "Einprägsame Beispiele wirken größer als die Datenlage."]],
    game: "Ein wahrer Kern wird emotional verstärkt und in eine zu große Schlussfolgerung geschoben.",
    counter: "Frame stoppen, wahren Kern anerkennen, Denkfehler benennen und zur konkreten Wirkungsfrage zurückkehren.",
  };

  const panel = document.createElement("section");
  panel.className = "section radar-psychology-panel debate-psychology-secondary";
  panel.dataset.radarPsychologyPanel = "true";
  panel.innerHTML = `
    <div>
      <details class="debate-psychology-accordion">
        <summary><span>Warum zieht dieses Narrativ?</span><span>Ergänzende Mechanik</span></summary>
        <p class="card-text">Viele Narrative wirken nicht, weil sie wahr sind, sondern weil sie Angst, Kontrollverlust oder Zugehörigkeit ansprechen. Wer den Mechanismus erkennt, kann die Debatte auf den Wirkpfad zurückholen.</p>
        <div class="debate-psychology-list">
          ${selected.effects
            .slice(0, 3)
            .map(
              ([label, text]) => `<article class="card debate-psychology-item">
            <p class="v2-badge">Mechanismus</p>
            <h3 class="card-title">${label}</h3>
            <p class="card-text">${text}</p>
          </article>`,
            )
            .join("")}
        </div>
        <div class="card-grid two radar-psychology-practice">
          <article class="card">
            <p class="card-kicker">Debattenverschiebung</p>
            <h3 class="card-title">So kommt die Debatte zurück zum Wirkpfad</h3>
            <p class="card-text">${selected.game}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Reaktion</p>
            <h3 class="card-title">So umgehst du den Trigger</h3>
            <p class="card-text">${selected.counter}</p>
            <p class="card-text"><strong>Merksatz:</strong> Wahren Kern retten, Denkfehler trennen, Wirkungspfad zurückholen.</p>
          </article>
        </div>
      </details>
    </div>
  `;

  const anchor =
    mainElement.querySelector("#warum-belastbar, #faktenlage, #quellen, #host-antworten") ||
    mainElement.querySelector(".radar-summary-section, .topic-subnav, .section");
  if (anchor?.nextElementSibling) {
    anchor.after(panel);
  } else {
    mainElement.append(panel);
  }
}

initRadarPsychologyPanel();

function slugifyHeading(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function getArticleReadMinutes() {
  const kicker = document.querySelector(".hero-kicker")?.textContent || "";
  const match = kicker.match(/(\d+)\s*Min\./i);
  return match ? Number(match[1]) : 0;
}

function enhanceLongArticleToc() {
  const articleBody = document.querySelector(".article-body");
  const existingExplicitToc = document.querySelector(
    ".article-toc, .toc-card[aria-label='Inhaltsverzeichnis'], [data-debate-toc]"
  );

  if (!articleBody || existingExplicitToc) {
    return;
  }

  const headings = Array.from(articleBody.querySelectorAll("h2")).filter((heading) => heading.textContent.trim());
  const readMinutes = getArticleReadMinutes();
  const shouldAddToc = readMinutes >= 20 || headings.length >= 8;

  if (!shouldAddToc || headings.length < 3) {
    return;
  }

  const usedIds = new Set(Array.from(document.querySelectorAll("[id]")).map((element) => element.id));

  headings.forEach((heading, index) => {
    if (heading.id) {
      return;
    }

    const base = slugifyHeading(heading.textContent) || `abschnitt-${index + 1}`;
    let id = base;
    let counter = 2;

    while (usedIds.has(id)) {
      id = `${base}-${counter}`;
      counter += 1;
    }

    heading.id = id;
    usedIds.add(id);
  });

  const toc = document.createElement("nav");
  toc.className = "article-toc";
  toc.setAttribute("aria-label", "Inhaltsverzeichnis");
  toc.innerHTML = `
    <p class="article-toc-title">Inhaltsverzeichnis</p>
    <ol>
      ${headings
        .map((heading) => `<li><a href="#${heading.id}">${heading.textContent.trim()}</a></li>`)
        .join("")}
    </ol>
  `;

  articleBody.before(toc);
}

enhanceLongArticleToc();

function getGlossaryContext() {
  const path = window.location.pathname;
  const filename = path.split("/").filter(Boolean).pop() || "index.html";

  if (path.includes("/wirkungsradar/") || path.endsWith("/wirkungsradar")) {
    return "method";
  }
  if (path === "/" || filename === "index.html") {
    return "home";
  }
  if (path.includes("/blog/") || filename === "blog.html") {
    return "blog";
  }
  if (filename === "akademie.html") {
    return "academy";
  }
  if (filename === "glossar.html") {
    return "glossary";
  }
  if (path.includes("/referenz/") || path.includes("/begriffe/")) {
    return "reference";
  }
  if (
    [
      "modell.html",
      "anwendungen.html",
      "erleben.html",
      "downloads.html",
      "buch.html",
      "simulator.html",
      "scorecard-dashboard.html",
    ].includes(filename)
  ) {
    return "method";
  }

  return "page";
}

function loadGlossaryTermsAndInit() {
  if (isDebugPath()) {
    return;
  }
  if (window.__wirkungGlossaryInitialized) {
    return;
  }

  if (Array.isArray(window.WIRKUNG_GLOSSARY_TERMS)) {
    initGlossarySystem(window.WIRKUNG_GLOSSARY_TERMS);
    return;
  }

  const script = document.createElement("script");
  const baseUrl = mainScriptUrl || `${window.location.origin}/assets/js/main.js`;
  script.src = new URL("glossaryTerms.js?v=20260523-nachhaltigkeit", baseUrl).href;
  script.defer = true;
  script.onload = () => initGlossarySystem(window.WIRKUNG_GLOSSARY_TERMS || []);
  document.head.append(script);
}

function initGlossarySystem(terms) {
  if (window.__wirkungGlossaryInitialized || !mainElement || !Array.isArray(terms) || !terms.length) {
    return;
  }

  window.__wirkungGlossaryInitialized = true;

  const context = getGlossaryContext();
  const eligibleTerms = terms
    .filter((term) => term.url && term.definition && term.autoLinkAllowed !== false && term.allowedContexts?.includes(context))
    .map((term) => ({
      ...term,
      variants: Array.from(new Set([term.label, ...(term.aliases || [])])).sort((a, b) => b.length - a.length),
    }))
    .sort((a, b) => a.priority - b.priority || b.label.length - a.label.length);

  if (!eligibleTerms.length) {
    return;
  }

  const limits = {
    home: { perBlock: 1, global: 6 },
    glossary: { perBlock: 1, global: 8 },
    blog: { perBlock: 2, global: 26 },
    academy: { perBlock: 2, global: 22 },
    method: { perBlock: 2, global: 18 },
    reference: { perBlock: 1, global: 8 },
    page: { perBlock: 2, global: 16 },
  }[context] || { perBlock: 2, global: 16 };

  const termsByKey = new Map(eligibleTerms.map((term) => [term.key, term]));

  const excludedSelector = [
    "a",
    "button",
    "nav",
    "footer",
    "header",
    "form",
    "label",
    "input",
    "textarea",
    "select",
    "option",
    "script",
    "style",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    ".btn",
    ".button",
    ".site-nav",
    ".site-footer",
    ".footer",
    ".hero-actions",
    ".tag-list",
    ".blog-filter-panel",
    ".download-filter-panel",
    ".glossary-keynav",
    ".alphabet-nav",
    ".article-toc",
    ".cookie-banner",
    ".privacy-settings-root",
    ".term-list",
    ".glossary-card",
    ".glossary-sheet",
    "[data-no-glossary]",
  ].join(",");
  const sectionTerms = new WeakMap();
  const termCounts = new Map();
  let globalCount = 0;

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findMatch(text, section) {
    const alreadyInSection = sectionTerms.get(section) || new Set();

    let best = null;
    eligibleTerms.forEach((term) => {
      if (Number.isFinite(term.maxAutoLinksPerPage) && (termCounts.get(term.key) || 0) >= term.maxAutoLinksPerPage) {
        return;
      }

      if (alreadyInSection.has(term.key)) {
        return;
      }

      term.variants.forEach((variant) => {
        const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_-])(${escapeRegex(variant)})(?![\\p{L}\\p{N}_-])`, "u");
        const match = text.match(pattern);

        if (!match || match.index === undefined) {
          return;
        }

        const start = match.index + match[1].length;
        const candidate = { term, start, text: match[2] };

        if (
          !best ||
          candidate.start < best.start ||
          (candidate.start === best.start && candidate.term.priority < best.term.priority) ||
          (candidate.start === best.start && candidate.text.length > best.text.length)
        ) {
          best = candidate;
        }
      });
    });

    return best;
  }

  function createGlossaryLink(term, text) {
    const link = document.createElement("a");
    link.href = term.url;
    link.className = "glossary-term";
    link.dataset.glossaryKey = term.key;
    link.dataset.glossaryLabel = term.label;
    link.dataset.glossaryDefinition = term.definition;
    link.dataset.glossaryUrl = term.url;
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-label", `${term.label}: ${term.definition} Mehr im Glossar`);
    link.textContent = text;
    return link;
  }

  function enhanceManualGlossaryLinks() {
    mainElement.querySelectorAll("[data-glossary-key]").forEach((element) => {
      if (!(element instanceof HTMLAnchorElement)) {
        return;
      }

      const term = termsByKey.get(element.dataset.glossaryKey || "");
      if (!term) {
        return;
      }

      element.href = element.getAttribute("href") || term.url;
      element.classList.add("glossary-term");
      element.dataset.glossaryLabel = element.dataset.glossaryLabel || term.label;
      element.dataset.glossaryDefinition = element.dataset.glossaryDefinition || term.definition;
      element.dataset.glossaryUrl = element.dataset.glossaryUrl || term.url;
      element.setAttribute("aria-haspopup", "dialog");
      element.setAttribute("aria-label", `${term.label}: ${term.definition} Mehr im Glossar`);
    });
  }

  function markTermInNode(node, block, section) {
    const text = node.nodeValue || "";
    const match = findMatch(text, section);

    if (!match) {
      return false;
    }

    const fragment = document.createDocumentFragment();
    const before = text.slice(0, match.start);
    const after = text.slice(match.start + match.text.length);

    if (before) {
      fragment.append(document.createTextNode(before));
    }
    fragment.append(createGlossaryLink(match.term, match.text));
    if (after) {
      fragment.append(document.createTextNode(after));
    }

    node.parentNode?.replaceChild(fragment, node);

    const usedTerms = sectionTerms.get(section) || new Set();
    usedTerms.add(match.term.key);
    sectionTerms.set(section, usedTerms);
    termCounts.set(match.term.key, (termCounts.get(match.term.key) || 0) + 1);
    block.dataset.glossaryMarked = String(Number(block.dataset.glossaryMarked || "0") + 1);
    globalCount += 1;
    return true;
  }

  function markBlock(block) {
    if (!(block instanceof HTMLElement) || block.closest(excludedSelector)) {
      return;
    }

    const section = block.closest("section, article, main") || mainElement;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest(excludedSelector) || !node.nodeValue?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (const node of textNodes) {
      if (globalCount >= limits.global || Number(block.dataset.glossaryMarked || "0") >= limits.perBlock) {
        break;
      }
      markTermInNode(node, block, section);
    }
  }

  enhanceManualGlossaryLinks();
  Array.from(mainElement.querySelectorAll("p, li, dd, blockquote")).forEach(markBlock);
  initGlossaryCards();
}

function initGlossaryCards() {
  const card = document.createElement("aside");
  card.id = "glossary-card";
  card.className = "glossary-card";
  card.setAttribute("role", "tooltip");
  card.hidden = true;
  card.innerHTML = `
    <p class="glossary-card-title"></p>
    <p class="glossary-card-definition"></p>
    <a class="glossary-card-link" href="/glossar.html">Mehr im Glossar</a>
  `;

  const sheetBackdrop = document.createElement("div");
  sheetBackdrop.className = "glossary-sheet-backdrop";
  sheetBackdrop.hidden = true;
  sheetBackdrop.innerHTML = `
    <section class="glossary-sheet" role="dialog" aria-modal="true" aria-labelledby="glossary-sheet-title">
      <button class="glossary-sheet-close" type="button" aria-label="Glossarhinweis schließen">×</button>
      <p class="glossary-sheet-title" id="glossary-sheet-title"></p>
      <p class="glossary-sheet-definition"></p>
      <a class="glossary-sheet-link" href="/glossar.html">Mehr im Glossar</a>
    </section>
  `;

  document.body.append(card, sheetBackdrop);

  const mediaQuery = window.matchMedia("(max-width: 720px)");
  let activeTrigger = null;
  let hideTimer = 0;

  function getGlossaryData(trigger) {
    return {
      label: trigger.dataset.glossaryLabel || trigger.textContent.trim(),
      definition: trigger.dataset.glossaryDefinition || "",
      url: trigger.dataset.glossaryUrl || trigger.href,
    };
  }

  function positionCard(trigger) {
    const rect = trigger.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const margin = 14;
    let left = rect.left;
    let top = rect.bottom + 10;

    if (left + cardRect.width + margin > window.innerWidth) {
      left = window.innerWidth - cardRect.width - margin;
    }
    if (top + cardRect.height + margin > window.innerHeight) {
      top = rect.top - cardRect.height - 10;
    }

    card.style.left = `${Math.max(margin, left)}px`;
    card.style.top = `${Math.max(margin, top)}px`;
  }

  function showCard(trigger) {
    if (mediaQuery.matches) {
      return;
    }

    window.clearTimeout(hideTimer);
    const data = getGlossaryData(trigger);
    card.querySelector(".glossary-card-title").textContent = data.label;
    card.querySelector(".glossary-card-definition").textContent = data.definition;
    card.querySelector(".glossary-card-link").href = data.url;
    card.hidden = false;
    activeTrigger?.removeAttribute("aria-describedby");
    activeTrigger = trigger;
    activeTrigger.setAttribute("aria-describedby", card.id);
    positionCard(trigger);
  }

  function hideCard({ immediate = false } = {}) {
    const close = () => {
      card.hidden = true;
      activeTrigger?.removeAttribute("aria-describedby");
      activeTrigger = null;
    };

    window.clearTimeout(hideTimer);
    if (immediate) {
      close();
    } else {
      hideTimer = window.setTimeout(close, 120);
    }
  }

  function openSheet(trigger) {
    const data = getGlossaryData(trigger);
    sheetBackdrop.querySelector(".glossary-sheet-title").textContent = data.label;
    sheetBackdrop.querySelector(".glossary-sheet-definition").textContent = data.definition;
    sheetBackdrop.querySelector(".glossary-sheet-link").href = data.url;
    activeTrigger = trigger;
    sheetBackdrop.hidden = false;
    document.body.classList.add("glossary-sheet-open");
    sheetBackdrop.querySelector(".glossary-sheet-close").focus();
  }

  function closeSheet({ restoreFocus = true } = {}) {
    if (sheetBackdrop.hidden) {
      return;
    }
    sheetBackdrop.hidden = true;
    document.body.classList.remove("glossary-sheet-open");
    if (restoreFocus && activeTrigger) {
      activeTrigger.focus();
    }
    activeTrigger = null;
  }

  function handleTermEnter(event) {
    const trigger = event.target instanceof Element ? event.target.closest(".glossary-term") : null;
    if (trigger instanceof HTMLAnchorElement) {
      showCard(trigger);
    }
  }

  function handleTermLeave(event) {
    if (event.target instanceof Element && event.target.closest(".glossary-term")) {
      hideCard();
    }
  }

  document.addEventListener("pointerover", handleTermEnter);
  document.addEventListener("mouseover", handleTermEnter);
  document.addEventListener("pointerout", handleTermLeave);
  document.addEventListener("mouseout", handleTermLeave);

  card.addEventListener("pointerover", () => {
    window.clearTimeout(hideTimer);
  });

  card.addEventListener("pointerout", () => {
    hideCard();
  });

  document.addEventListener("focusin", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest(".glossary-term") : null;
    if (trigger instanceof HTMLAnchorElement) {
      showCard(trigger);
    }
  });

  document.addEventListener("focusout", (event) => {
    if (event.target instanceof Element && event.target.closest(".glossary-term")) {
      hideCard();
    }
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest(".glossary-term") : null;

    if (trigger instanceof HTMLAnchorElement && mediaQuery.matches) {
      event.preventDefault();
      openSheet(trigger);
      return;
    }

    if (!card.hidden && !(event.target instanceof Node && card.contains(event.target))) {
      hideCard({ immediate: true });
    }
  });

  sheetBackdrop.addEventListener("click", (event) => {
    if (event.target === sheetBackdrop || event.target instanceof Element && event.target.closest(".glossary-sheet-close")) {
      closeSheet();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    hideCard({ immediate: true });
    closeSheet();
  });

  window.addEventListener("scroll", () => hideCard({ immediate: true }), { passive: true });
  window.addEventListener("resize", () => hideCard({ immediate: true }));
}

loadGlossaryTermsAndInit();

function loadBlogJournal() {
  if (window.__wirkungBlogJournalScriptLoaded || document.querySelector('script[src*="blog-journal.js"]')) {
    window.__wirkungBlogJournalScriptLoaded = true;
    return;
  }

  window.__wirkungBlogJournalScriptLoaded = true;
  const baseUrl = mainScriptUrl || `${window.location.origin}/assets/js/main.js`;
  const script = document.createElement("script");
  script.src = new URL("blog-journal.js?v=20260610-related-no-images", baseUrl).href;
  script.defer = true;
  document.body.append(script);
}

loadBlogJournal();

function initPublicationAccessFallback() {
  if (document.getElementById("publikationszugang")) {
    return;
  }

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  const areas = [
    {
      prefixes: ["/wirkungsfelder/produkte-konsum/"],
      detail: "/wirkungsfelder/produkte-konsum/detailkonzepte/",
      dossier: "/wirkungsfelder/produkte-konsum/dossiers/",
      detailDownload: "/assets/downloads/woek_produkte_konsum_detailkonzepte_umfangreich_v0_2.docx",
    },
    {
      prefixes: ["/werkzeuge/impact-controlling/"],
      detail: "/werkzeuge/impact-controlling/detailkonzepte/",
      dossier: "/werkzeuge/impact-controlling/dossiers/",
      detailDownload: "/assets/downloads/woek_impact_controlling_detailkonzepte_umfangreich_v0_2.docx",
    },
    {
      prefixes: ["/wirkungsfelder/staat-recht-demokratie/", "/werkstatt/dossiers/staat-recht-demokratie/"],
      detail: "/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/",
      dossier: "/werkstatt/dossiers/staat-recht-demokratie/dossiers/",
      detailDownload: "/assets/downloads/woek_staat_recht_demokratie_detailkonzepte_umfangreich_v0_2.docx",
      dossierDownload: "/assets/downloads/woek_staat_recht_demokratie_gesamtdossier_v0_1.docx",
    },
    {
      prefixes: ["/wirkungsfelder/wirtschaft-unternehmen/", "/werkstatt/dossiers/wirtschaft-unternehmen/"],
      detail: "/wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/",
      dossier: "/wirkungsfelder/wirtschaft-unternehmen/dossiers/",
      detailDownload: "/assets/downloads/woek_wirtschaft_unternehmen_detailkonzepte_umfangreich_v0_2.docx",
      dossierDownload: "/assets/downloads/woek_wirtschaft_unternehmen_gesamtdossier_v0_1.docx",
    },
    {
      prefixes: ["/wirkungsfelder/wohnen-stadt/"],
      detail: "/wirkungsfelder/wohnen-stadt/detailkonzepte/",
      dossier: "/wirkungsfelder/wohnen-stadt/dossiers/",
      detailDownload: "/assets/downloads/woek_wohnen_stadt_detailkonzepte_umfangreich_v0_2.docx",
      dossierDownload: "/assets/downloads/woek_wohnen_stadt_gesamtdossier_v0_1.docx",
    },
    {
      prefixes: ["/wirkungsfelder/arbeit-einkommen/"],
      detail: "#detailkonzept",
      dossier: "#dossier",
      detailDownload: "/assets/downloads/woek_arbeit_einkommen_detailkonzepte_umfangreich_v0_1.docx",
      dossierDownload: "/assets/downloads/woek_arbeit_einkommen_einzeldossier_set_v0_1.docx",
      fallbackDetail: "/werkstatt/arbeitsbibliothek/wirkungsfelder/arbeit-einkommen/",
      fallbackDossier: "/werkstatt/arbeitsbibliothek/wirkungsfelder/arbeit-einkommen/",
    },
    {
      prefixes: ["/wirkungsfelder/rente-soziale-sicherung/"],
      detail: "/wirkungsfelder/rente-soziale-sicherung/detailkonzepte/",
      dossier: "/wirkungsfelder/rente-soziale-sicherung/dossiers/",
      detailDownload: "/assets/downloads/woek_rente_soziale_sicherung_detailkonzepte_umfangreich_v0_1.docx",
      dossierDownload: "/assets/downloads/woek_rente_soziale_sicherung_einzeldossier_set_v0_1.docx",
    },
  ];

  const config = areas.find((area) => area.prefixes.some((prefix) => path.startsWith(prefix)));
  if (!config) {
    return;
  }

  const hasLocalDetail = Boolean(document.getElementById("detailkonzept"));
  const hasLocalDossier = Boolean(document.getElementById("dossier"));
  const detailHref = config.detail === "#detailkonzept" && !hasLocalDetail ? config.fallbackDetail : config.detail;
  const dossierHref = config.dossier === "#dossier" && !hasLocalDossier ? config.fallbackDossier : config.dossier;
  const normalizePath = (value) => {
    if (!value || value.startsWith("#") || value.startsWith("http") || value.startsWith("mailto:")) return value;
    try {
      return new URL(value, window.location.origin).pathname.replace(/\/+$/, "") || "/";
    } catch {
      return value.replace(/\/+$/, "") || "/";
    }
  };
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const cards = [
    ["Onlinefassung", "Detailkonzepte", "Fachliche Einordnung, Quellen, Beispiele und weiterführende Materialien.", detailHref, "Detailkonzept lesen"],
    ["Praxisfassung", "Dossiers", "Anwendung, Annahmen, Bewertungslogik, Datenquellen und Beispiele.", dossierHref, "Dossier lesen"],
    ["Download", "Konzept-Download", "Ergänzende Word-Datei für Weiterarbeit und Druck.", config.detailDownload, "Herunterladen"],
    ["Download", "Dossier-Download", "Ergänzende Word-Datei für Weiterarbeit und Druck.", config.dossierDownload, "Herunterladen"],
  ].filter((card) => card[3]);

  if (!cards.length) {
    return;
  }

  const section = document.createElement("section");
  section.className = "section";
  section.id = "publikationszugang";
  section.setAttribute("aria-labelledby", "publikationszugang-title");
  section.innerHTML = `
    <div class="section-header">
      <p class="hero-kicker">Vertiefung</p>
      <h2 id="publikationszugang-title">Vertiefung und Arbeitsmaterial <a class="cite-anchor no-print" href="#publikationszugang" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
      <p>Die Seite führt zuerst in das Thema ein. Detailkonzepte, Dossiers und Downloads sind hier als weiterführende Materialien gebündelt.</p>
    </div>
    <div class="card-grid three">${cards.map(([kicker, title, text, link, label]) => `
      <article class="card">
        <p class="card-kicker">${kicker}</p>
        <h3 class="card-title">${title}</h3>
        <p class="card-text">${text}</p>
        <div class="portal-card-actions">${normalizePath(link) === currentPath ? `<span class="text-note is-current" aria-current="page">Du bist auf dieser Seite.</span>` : `<a class="text-link" href="${link}">${label}</a>`}</div>
      </article>
    `).join("")}</div>
  `;

  const citationSection = document.querySelector(".citation-note")?.closest(".section");
  const heroSection = document.querySelector(".portal-hero")?.closest(".section");
  const anchor = citationSection || heroSection;
  if (anchor?.parentNode) {
    anchor.insertAdjacentElement("afterend", section);
  }
}

initPublicationAccessFallback();

function initGo5WirtschaftDetailkonzepte() {
  if (!mainElement || document.querySelector(".go5-wirtschaft-detailkonzepte")) {
    return;
  }

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  if (path !== "/wirkungsfelder/wirtschaft-unternehmen/") {
    return;
  }
  if (document.querySelector("#why-business, #business-logic, #subareas")) {
    return;
  }

  const detailPages = [
    [
      "Fachvertiefung",
      "Unternehmen als Wirkungssysteme",
      "Zweck, Geschäftsmodell, Wertschöpfung, WÖk-IDs, Steuerung und Rückkopplung als echtes Online-Detailkonzept.",
      "/wirkungsfelder/wirtschaft-unternehmen/unternehmen-als-wirkungssysteme/",
    ],
    [
      "Fachvertiefung",
      "Wirkungsorientierte Unternehmensführung inkl. Mitarbeiterführung",
      "Führung, Mitarbeiterführung, Governance, Kultur und Anreizsysteme im wirkungsökonomischen Unternehmensmodell.",
      "/wirkungsfelder/wirtschaft-unternehmen/wirkungsorientierte-unternehmensfuehrung/",
    ],
    [
      "Fachvertiefung",
      "Risikomanagement, Resilienz und Finanzmarkt",
      "ESG-Risiken, EBA-Anforderungen, Versicherbarkeit und Finanzmarktlogik als Wirkungsrisiko-Steuerung.",
      "/wirkungsfelder/wirtschaft-unternehmen/risikomanagement-resilienz-finanzmarkt/",
    ],
    [
      "Fachvertiefung",
      "Resiliente Wertschöpfungsketten und Einkauf",
      "Lieferketten, Einkauf, Supplier Scorecards, Sourcing-Szenarien und Resilienz als Unternehmenswirkung steuern.",
      "/wirkungsfelder/wirtschaft-unternehmen/wertschoepfungsketten-einkauf/",
    ],
    [
      "Fachvertiefung",
      "Wirkungscontrolling im Unternehmen",
      "KII, NWI, T-SROI, Scorecards, CapEx-Prüfung und Assurance als Steuerungskreislauf im Unternehmen.",
      "/wirkungsfelder/wirtschaft-unternehmen/wirkungscontrolling/",
    ],
    [
      "Fachvertiefung",
      "Produktentwicklung, Produktscorecards und DPP",
      "Produktwirkung in Entwicklung, Scorecards, digitalen Produktpässen und Verbraucherinformation rückkoppeln.",
      "/wirkungsfelder/wirtschaft-unternehmen/produktentwicklung-produktscorecards-produktpaesse/",
    ],
    [
      "Fachvertiefung",
      "Marketing, Vertrieb und das fünfte P: Planet",
      "Marketing, Vertrieb, Produktkommunikation, Green Claims und Resonanzrisiken an Wirkung ausrichten.",
      "/wirkungsfelder/wirtschaft-unternehmen/marketing-vertrieb-fuenftes-p-planet/",
    ],
    [
      "Fachvertiefung",
      "Bilanz, Finanzierung und Finanzkommunikation",
      "CapEx, Finanzierung, Kapitalzugang, Stranded Assets und Finanzkommunikation nach Wirkung ordnen.",
      "/wirkungsfelder/wirtschaft-unternehmen/bilanz-finanzierung-finanzkommunikation/",
    ],
    [
      "Fachvertiefung",
      "Transformation, KMU-Tauglichkeit und Übergangspfade",
      "Unternehmenswandel, KMU-Schutz, Übergangspfade, Pilotierung und Datenanforderungen praxistauglich gestalten.",
      "/wirkungsfelder/wirtschaft-unternehmen/transformation-kmu-uebergangspfade/",
    ],
  ];

  const toolCards = [
    ["Werkzeugseite vorhanden", "Unternehmens-Wirkungscheck", "Standortbestimmung für Zweck, Geschäftsmodell, Governance, Risiko und Wirkung.", "/werkzeuge/unternehmens-wirkungscheck/"],
    ["Methodenseite vorhanden", "T-SROI-Rechner", "Transformationswirkung im Verhältnis zum Ressourceneinsatz bewerten.", "/werkzeuge/impact-controlling/t-sroi/"],
    ["Werkzeugseite vorhanden", "Produktpass-/Produktscorecard-Demo", "Produktwirkung, Datenräume und Verbraucherinformation verbinden.", "/werkzeuge/produktscorecards/"],
    ["Werkzeugseite vorhanden", "WÖk-IDs", "Indikatoren, Quellen und Datenlogik für Unternehmenswirkung strukturieren.", "/werkzeuge/woek-ids/"],
    ["Werkzeugseite vorhanden", "Reverse Merit Order", "Schlechtere Wirkung systematisch zurücksortieren und bessere Wirkung bevorzugen.", "/werkzeuge/reverse-merit-order/"],
    ["Methodik", "KII-Dashboard", "Kernwirkungsindikatoren statt nur klassische KPI im Management sichtbar machen.", ""],
    ["Methodik", "Lieferketten-Wirkungscheck", "Lieferkettenwirkung, Risiken, Datenqualität und Lieferantenentwicklung prüfen.", ""],
    ["Demo vorhanden", "Produktwirkungsrechner", "Produktbeispiele, FinalScore und Wirkungsumsatzsteuer modellhaft ausprobieren.", "/erleben/produktwirkungsrechner/"],
    ["Methodik", "Green-Claims-Check", "Wirkungsversprechen in Marketing und Vertrieb auf Datenbasis und Risiko prüfen.", ""],
    ["Methodik", "CapEx-Wirkungscheck", "Investitionen nach Zukunftsfähigkeit, Wirkung, Risiko und Resilienz bewerten.", ""],
    ["Methodik", "Übergangspfad-Generator", "Transformationspfade für KMU und Unternehmen vergleichbar strukturieren.", ""],
    ["Methodik", "Wirkungsrisiko-Check", "Wirkungsrisiken in Enterprise Risk Management und Strategie integrieren.", ""],
    ["Methodik", "EBA-Kreditdaten-Check", "Bankfähige ESG- und Transformationsdaten für Kreditgespräche vorbereiten.", ""],
  ];

  const section = document.createElement("section");
  section.className = "section go5-wirtschaft-detailkonzepte";
  section.id = "echte-detailkonzepte";
  section.setAttribute("aria-labelledby", "echte-detailkonzepte-title");
  section.innerHTML = `
    <div class="section-header">
      <p class="hero-kicker">Vertiefung</p>
      <h2 id="echte-detailkonzepte-title">Fachvertiefungen online lesen <a class="cite-anchor no-print" href="#echte-detailkonzepte" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
      <p>Die folgenden Seiten vertiefen zentrale Unternehmensfragen mit Online-Volltext, Quellen, Werkzeugbezug und ergänzenden Downloads.</p>
    </div>
    <div class="card-grid three">
      ${detailPages.map(([kicker, title, text, href]) => `
        <article class="card">
          <p class="card-kicker">${kicker}</p>
          <h3 class="card-title">${title}</h3>
          <p class="card-text">${text}</p>
          <div class="portal-card-actions"><a class="text-link" href="${href}">Online lesen</a></div>
        </article>
      `).join("")}
    </div>
    <div class="section-header">
      <p class="hero-kicker">Werkzeuge</p>
      <h2>Werkzeuge in diesem Bereich</h2>
      <p>Interaktive Werkzeuge sind direkt verlinkt. Statische Karten führen als Methodik weiter und versprechen keine Bedienoberfläche.</p>
    </div>
    <div class="card-grid three">
      ${toolCards.map(([kicker, title, text, href]) => `
        <article class="card">
          <p class="card-kicker">${kicker}</p>
          <h3 class="card-title">${title}</h3>
          <p class="card-text">${text}</p>
          <div class="portal-card-actions">${href ? `<a class="text-link" href="${href}">Öffnen</a>` : `<span class="prototype-badge">Methodik</span>`}</div>
        </article>
      `).join("")}
    </div>
  `;

  const heroSection = document.querySelector(".portal-hero") || document.querySelector(".hero");
  const anchor = heroSection;
  if (anchor?.parentNode) {
    anchor.insertAdjacentElement("afterend", section);
  } else {
    mainElement.prepend(section);
  }
}

initGo5WirtschaftDetailkonzepte();

const ToolExplanationLayer = (() => {
  const defaults = {
    purpose: "Dieses Werkzeug macht eine Wirkungsfrage anschaulich, die im Alltag oft unsichtbar bleibt.",
    question: "Welche Folgen entstehen - und wie würden sie sichtbar, wenn Wirkung in Entscheidungen zurückfließt?",
    blindSpot: "Das heutige System betrachtet häufig Preis, Kosten, Reichweite oder Output. Folgekosten, Risiken und demokratische Nebenwirkungen bleiben leicht außerhalb der Entscheidung.",
    difference: "Die Wirkungsökonomie bewertet nicht nur Aktivität, sondern Zustandsveränderungen: positiv, negativ oder neutral. Ziel ist positive Netto-Wirkung für Mensch, Planet und Demokratie.",
    steps: ["Wähle ein Beispiel oder gib eigene Werte ein.", "Verändere die Regler oder Textfelder.", "Lies Ergebnis, Erklärung und Grenzen zusammen."],
    values: "Die Werte sind Orientierungshilfen. Sie zeigen Richtung, Größenordnung, schwächstes Feld oder mögliche Rückkopplung.",
    interpretation: "Das Ergebnis ist ein Startpunkt für bessere Fragen: Welche Wirkung ist sichtbar, welche Daten fehlen und welche Entscheidung müsste überprüft werden?",
    behindScenes: "Im Hintergrund werden Eingaben, Beispielannahmen, Datenqualität und Wirkungsdimensionen zu einer modellhaften Einordnung verbunden.",
    consequence: "Im WÖk-System würden gute Wirkung, Risiken und Folgekosten nicht nur beschrieben, sondern in Preise, Prioritäten, Finanzierung oder Korrekturwege zurückgeführt.",
    funding: "",
    limits: "Die Demo ist keine amtliche Bewertung, keine Beratung, kein Audit und keine Personenbewertung. Sie ersetzt keine geprüften Daten und keine demokratische Entscheidung.",
    special: "Heute bleiben viele Folgen hinter Preis, Reichweite, Kosten oder Reporting verborgen. Die WÖk-Logik macht sichtbar, welche Zustände sich verändern und wie diese Wirkung in bessere Entscheidungen zurückfließen könnte.",
    links: [
      ["Wirkung verstehen", "/wirkungsoekonomie.html"],
      ["SDG-/SDG+-Referenz", "/verstehen/sdgs-sdgplus/"],
      ["Glossar", "/glossar.html"]
    ]
  };

  const tools = {
    automation: {
      selector: "body",
      pagePath: "/erleben/automatisierungs-wirkungseinkommensrechner/",
      beforeTarget: "#rechner",
      afterTarget: "#rechner",
      title: "Warum dieser Rechner?",
      purpose: "Der Rechner zeigt, warum Automatisierung nicht nur eine Produktivitätsfrage ist. Wenn Arbeit verschwindet, geraten Einkommen, Sozialbeiträge und Teilhabe unter Druck.",
      question: "Wie groß kann die Beitragslücke werden - und wie könnte automatisierte Wertschöpfung wirkungsökonomisch rückgekoppelt werden?",
      blindSpot: "Das heutige System misst oft Effizienzgewinn und Personalkostenersparnis. Es sieht seltener, wer die wegfallenden Sozialbeiträge, Weiterbildungskosten und Übergangsrisiken trägt.",
      difference: "Die Wirkungsökonomie fragt, ob Automatisierung Menschen entlastet, verdrängt oder extraktiv wirkt. Der Beitrag sinkt modellhaft, wenn Weiterbildung, Versetzung, Teilhabe und regionale Stabilisierung sichtbar werden.",
      steps: ["Gib Beschäftigung, Lohnsumme und Automatisierungsquote ein.", "Ergänze automatisierte Wertschöpfung, Rückkopplungsquote und Wirkungsfaktor.", "Prüfe, wie Transformationsbonus und Wirkungseinkommen das Ergebnis verändern."],
      values: "Beitragslücke zeigt die mögliche Lücke in Sozialbeiträgen. Maschinenwertschöpfungsbeitrag zeigt eine modellhafte Rückkopplung. Transformationsbonus zeigt, ob Übergänge entlastend gestaltet werden.",
      interpretation: "Das Ergebnis bedeutet nicht, dass automatisch Geld fließt. Es zeigt, wo die alte Finanzierungslogik brüchig wird und wo Rückkopplung politisch geprüft werden müsste.",
      consequence: "Im WÖk-System würde Automatisierung nicht pauschal bestraft. Entscheidend wäre, ob Produktivitätsgewinne Beschäftigte, Sozialversicherung, Weiterbildung, regionale Stabilität und positive Netto-Wirkung mittragen.",
      funding: "Aus der Wertschöpfung, die durch Automatisierung entsteht. Wenn Maschinen Arbeit ersetzen, verschwindet nicht automatisch der wirtschaftliche Nutzen. Er verschiebt sich nur: weg von Lohnarbeit hin zu Kapital- und Produktivitätsgewinnen. Die Wirkungsökonomie fragt, welcher Teil dieser Gewinne in soziale Sicherung, Weiterbildung, Transformation und Wirkungseinkommen zurückgeführt werden müsste. Das ist eine Steuer-, Beitrags-, Bonus- oder Fondsrückkopplung im Modell, keine fertige Finanzierungszusage.",
      special: "Heute hängt Einkommen stark an Erwerbsarbeit. Das Tool zeigt, wie Einkommen und soziale Sicherung auch dann gedacht werden können, wenn Maschinen Wertschöpfung übernehmen.",
      links: [
        ["Arbeit & Einkommen", "/wirkungsfelder/arbeit-einkommen/"],
        ["Rente & soziale Sicherung", "/wirkungsfelder/rente-soziale-sicherung/"],
        ["Finanzsystem & Kapital", "/wirkungsfelder/finanzsystem-kapital/"]
      ]
    },
    scanner: {
      selector: "body",
      pagePath: "/anwendungen/scanner.html",
      beforeTarget: "[data-scanner-mvp-root]",
      afterTarget: "[data-scanner-mvp-root]",
      title: "Warum dieser Scanner?",
      purpose: "Der Scanner hilft, Texte, Produkte, Unternehmen oder Maßnahmen als Wirkungsfrage zu lesen. Er sortiert Hinweise, Risiken und Datenlücken, statt sofort eine finale Bewertung zu behaupten.",
      question: "Welche Wirkungspotenziale, Datenlücken und Gegenfragen werden sichtbar?",
      blindSpot: "Klassische Suche oder Analyse findet Wörter, Themen oder Quellen. Sie erklärt aber selten, welche Systemfolgen, demokratischen Risiken oder Datenlücken damit verbunden sind.",
      difference: "Die Wirkungsökonomie trennt Wirkungspotenzial, Datenqualität und Bewertung. Der Scanner zeigt deshalb Hinweise und Gegenfragen, keine Wahrheitseinstufung und kein Personen-Scoring.",
      steps: ["Wähle den passenden Analysemodus.", "Füge Text, URL-Hinweis, Produkt- oder Unternehmensbeschreibung ein.", "Starte die Ersteinschätzung und lies Ergebnis, Datenlücken und Grenzen zusammen."],
      values: "Frames, Datenqualitätsstufen, Scores und Risikohinweise sind Lesespuren. Ein Score ist eine Modellzahl für Orientierung - kein endgültiges Urteil.",
      interpretation: "Das Ergebnis ist eine strukturierte Ersteinschätzung. Es zeigt, worüber man genauer sprechen und welche Daten man nachprüfen müsste.",
      consequence: "Im WÖk-System würde aus einer unklaren Aussage oder einem Produktversprechen eine prüfbare Wirkungsfrage: Welche Daten fehlen, wer ist betroffen, welche Rückkopplung wäre angemessen?",
      special: "Heute werden Texte, Produkte oder Unternehmen oft isoliert betrachtet. Der Scanner zeigt, welche Wirkungspfade, Datenlücken und Zielkonflikte geprüft werden müssten, bevor eine belastbare Bewertung möglich ist.",
      links: [
        ["Wirkung", "/begriffe/wirkung/"],
        ["Wirkungsbewertung", "/begriffe/wirkungsbewertung/"],
        ["SDG+", "/begriffe/sdg-plus/"]
      ]
    },
    impactControlling: {
      selector: "body",
      pagePath: "/werkzeuge/impact-controlling/",
      beforeTarget: "main > .section",
      afterTarget: "main > .section",
      title: "Warum dieser Methodenbereich?",
      purpose: "Impact Controlling erklärt, wie Wirkung von einer Beschreibung zu einer steuerungsrelevanten Größe wird.",
      question: "Welche Daten, Bewertungslogiken und Rückkopplungen braucht eine Entscheidung, damit sie positive Netto-Wirkung berücksichtigen kann?",
      blindSpot: "Klassisches Controlling sieht häufig Kosten, Umsatz, Output und Berichtspflichten. Es sieht seltener, ob Zustände für Mensch, Planet und Demokratie besser oder schlechter werden.",
      difference: "Die Wirkungsökonomie verbindet WÖk-IDs, Scorecards, NWI, T-SROI, Datenqualität und Assurance zu einer prüfbaren Wirkungssprache.",
      steps: ["Starte mit der Überblickslogik.", "Öffne danach passende Dossiers oder Methodenseiten.", "Nutze interaktive Rechner nur dort, wo eine echte Bedienoberfläche vorhanden ist."],
      values: "Kennzahlen sind nur aussagekräftig, wenn Quelle, Einheit, Schwelle, Unsicherheit und Datenqualität sichtbar bleiben.",
      interpretation: "Das Ergebnis ist keine Steuerungsautomatik. Es macht sichtbar, welche Kennzahl welche Frage beantwortet und welche Entscheidung dadurch besser vorbereitet wird.",
      consequence: "Im WÖk-System würde Controlling nicht nur berichten, sondern Budgets, Investitionen, Produktentscheidungen und Korrekturzyklen beeinflussen.",
      limits: "Diese Seite ist ein Methodenbereich. Sie ersetzt kein Audit, keine Unternehmensbewertung, keine Anlageberatung und keine amtliche Prüfung.",
      links: [
        ["WÖk-IDs", "/werkzeuge/woek-ids/"],
        ["Scorecards", "/werkzeuge/scorecards/"],
        ["T-SROI", "/werkzeuge/impact-controlling/t-sroi/"]
      ]
    },
    wirkungsfonds: {
      selector: "body",
      pagePath: "/werkzeuge/wirkungsfonds/",
      beforeTarget: "main > .section",
      afterTarget: "main > .section",
      title: "Warum diese Methodik?",
      purpose: "Die Wirkungsfonds-Methodik zeigt, wie Rückflüsse aus Automatisierung, Kapitalwirkung oder Steuerlogik in öffentliche Zukunftsaufgaben gelenkt werden könnten.",
      question: "Wie kann Wertschöpfung, die heute privat oder sektoral anfällt, in Bildung, Gesundheit, Wohnen, Rente und demokratische Resilienz zurückfließen?",
      blindSpot: "Das heutige System trennt Gewinn, Steuer, Sozialversicherung und Folgekosten oft voneinander. Dadurch fehlen stabile Brücken zwischen Produktivität und Gemeinwohl.",
      difference: "Die Wirkungsökonomie denkt Fonds als Rückkopplungsarchitektur: Mittel sollen dort wirken, wo sie positive Netto-Wirkung stärken und Folgekosten senken.",
      steps: ["Lies zuerst die Fondslogik.", "Öffne bei Bedarf den Automatisierungsrechner.", "Prüfe politische Ausgestaltung, Schutzregeln und Grenzen getrennt."],
      values: "Diese Seite berechnet keine Fondsquote. Sie erklärt, welche Wirkungsfragen vor einer echten Ausgestaltung geklärt werden müssten.",
      interpretation: "Das Ergebnis ist eine Methodeneinordnung: Fonds werden als Rückkopplung zwischen Wertschöpfung, Wirkung und öffentlicher Aufgabe verstanden.",
      consequence: "Im WÖk-System würden Fonds nicht als abstrakte Geldtöpfe erscheinen, sondern als lernfähige Brücke zwischen Wertschöpfung, Wirkung und sozialem Übergangsschutz.",
      funding: "Angenommen wird ein Fondsmechanismus: bestehende Wertschöpfung, Kapitalerträge, Wirkungssteuern, Beiträge oder Rückflüsse aus vermiedenen Folgekosten könnten in einen Wirkungsfonds gelenkt werden. Negative Wirkung würde tendenziell höher belastet, positive Wirkung könnte entlastet oder gefördert werden. Die konkrete Finanzierung wäre eine demokratische Steuer-, Beitrags-, Bonus- oder Kapitalentscheidung, keine Zusage dieser Methodenseite.",
      limits: "Keine Rechts-, Steuer-, Anlage- oder Sozialberatung. Die konkrete Ausgestaltung bleibt demokratische Aufgabe."
    },
    machineContribution: {
      selector: "body",
      pagePath: "/werkzeuge/maschinenwertschoepfungsbeitrag/",
      beforeTarget: "main > .section",
      afterTarget: "main > .section",
      title: "Warum diese Methodik?",
      purpose: "Die Methodik zeigt, warum automatisierte Wertschöpfung eine Rückkopplungsfrage ist, sobald Sozialbeiträge und Einkommen weiter an menschlicher Arbeit hängen.",
      question: "Wie könnte Maschinenwertschöpfung sichtbar werden, ohne Innovation pauschal zu bestrafen?",
      blindSpot: "Heute sieht Automatisierung oft wie reine Effizienz aus. Unsichtbar bleiben Beitragslücken, Übergangskosten, regionale Stabilität und Verdrängungsrisiken.",
      difference: "Die Wirkungsökonomie unterscheidet entlastende, neutrale, verdrängende und extraktive Automatisierung.",
      steps: ["Lies die Logik des Beitrags.", "Nutze den Rechner für eine modellhafte Beispielrechnung.", "Trenne Beispielwerte, politische Entscheidung und rechtliche Ausgestaltung."],
      values: "Methodische Faktoren zeigen Richtung und Wirkungsprofil, keine amtliche Beitragshöhe.",
      interpretation: "Das Ergebnis zeigt, ob Automatisierung eher entlastend oder belastend rückgekoppelt würde. Es ist keine Festsetzung.",
      consequence: "Im WÖk-System könnten Automatisierungsgewinne dort rückgekoppelt werden, wo sie Sozialbeiträge, Weiterbildung, Teilhabe und Resilienz stützen.",
      funding: "Das Geld käme aus automatisierter Wertschöpfung, also aus Produktivitätsgewinnen, die heute häufig als Kapital- oder Unternehmensgewinn erscheinen. Der Maschinenwertschöpfungsbeitrag wäre eine modellhafte Beitrags- oder Steuerrückkopplung. Positive Übergangsgestaltung könnte entlasten, verdrängende oder extraktive Wirkung stärker belasten. Das ist keine Steuerfestsetzung und keine Finanzierungszusage.",
      limits: "Keine Steuer- oder Rechtsberatung, keine Unternehmensbewertung und keine Personenbewertung."
    },
    automationDividend: {
      selector: "body",
      pagePath: "/werkzeuge/automatisierungsdividende/",
      beforeTarget: "main > .section",
      afterTarget: "main > .section",
      title: "Warum diese Methodik?",
      purpose: "Die Automatisierungsdividende fragt, wie Produktivitätsgewinne gesellschaftlich anschlussfähig verteilt werden können.",
      question: "Wer profitiert, wenn Maschinen, Software und KI Wertschöpfung erhöhen - und wie bleibt der Übergang sozial stabil?",
      blindSpot: "Klassische Produktivitätslogik betrachtet häufig Gewinn, Effizienz und Skalierung. Weniger sichtbar sind Kaufkraft, Lebensleistung, Care-Arbeit und demokratisches Vertrauen.",
      difference: "Die Wirkungsökonomie koppelt Produktivität an positive Netto-Wirkung und Schutz vor Verdrängung.",
      steps: ["Lies die Verteilungslogik.", "Vergleiche sie mit Wirkungseinkommen und Wirkungsfonds.", "Nutze Rechner nur als modellhafte Orientierung."],
      values: "Dividenden- und Fondslogiken sind Szenarien. Sie zeigen mögliche Rückkopplungen, keine garantierten Ansprüche.",
      interpretation: "Das Ergebnis zeigt eine mögliche Verteilungslogik. Ob daraus ein Anspruch, Fonds oder Beitrag wird, bleibt demokratische Ausgestaltung.",
      consequence: "Im WÖk-System könnte Automatisierung stärker als Quelle gemeinsamer Zukunftsfähigkeit sichtbar werden.",
      funding: "Die Dividende würde nicht aus dem Nichts entstehen. Sie setzt voraus, dass ein Teil automatisierter Produktivitätsgewinne, Kapitalerträge oder wirkungsbezogener Rückflüsse in einen Fonds oder Verteilmechanismus gelenkt wird. Negative Wirkung könnte höhere Rückkopplung auslösen, positive Wirkung Entlastung oder Boni. Die Demo beschreibt eine mögliche Architektur, keine Auszahlungsgarantie.",
      limits: "Keine Sozial-, Rechts-, Steuer- oder Finanzberatung. Keine automatische Entscheidung über Menschen."
    },
    product: {
      selector: "#simulator",
      beforeTarget: ".experience-tool",
      afterTarget: ".component-list",
      title: "Warum diese Produktdemo?",
      purpose: "Die Demo zeigt, warum ein billiges Produkt im Laden teuer für Umwelt, Arbeit, Gesundheit oder Vertrauen sein kann.",
      question: "Wie verändert sich ein Produktpreis, wenn Lieferkette, schwächstes Wirkungsfeld und Bonus/Malus sichtbar werden?",
      blindSpot: "Der heutige Preis zeigt Einkauf, Marge und Steuer. Er zeigt oft nicht Wasserverbrauch, Arbeitsbedingungen, Chemikalien, Reparierbarkeit oder Lieferkettenrisiken.",
      difference: "Die Wirkungsökonomie koppelt Wirkung zurück: Schlechte Wirkung wird teurer, bessere Wirkung kann entlastet werden. Das schwächste Feld kann nicht durch gute Durchschnittswerte verdeckt werden.",
      steps: ["Wähle ein Produkt.", "Wähle Lieferanten oder nutze eine Schnellauswahl.", "Vergleiche Score, schwächstes Feld, Steuerklasse und Gesamtpreis."],
      values: "Score und Steuerklasse zeigen keine amtliche Einstufung. Sie zeigen modellhaft, wie die schlechteste relevante Wirkung den Gesamtpreis beeinflussen könnte.",
      interpretation: "Das Ergebnis zeigt nicht, ob ein Produkt moralisch gut oder schlecht ist. Es zeigt, welches Wirkungsfeld die Bewertung begrenzt.",
      consequence: "Im WÖk-System hätten Unternehmen einen wirtschaftlichen Grund, bessere Lieferanten, Materialien und Prozesse zu wählen, weil Wirkung im Preis sichtbar wird.",
      special: "Heute zeigt der Preis meist nur Kosten, Marge und Steuer. Das Tool zeigt, welche sozialen, ökologischen und gesundheitlichen Wirkungen im Preis unsichtbar bleiben."
    },
    media: {
      selector: "#medienwirkung",
      beforeTarget: ".media-lab-grid",
      afterTarget: ".media-lab-grid",
      title: "Warum dieser Mediencheck?",
      purpose: "Der Mediencheck zeigt, dass Öffentlichkeit nicht nur Reichweite ist. Inhalte können Orientierung, Vertrauen und Diskursfähigkeit stärken oder beschädigen.",
      question: "Welche Wirkungspotenziale hat ein Beitrag auf Quellenklarheit, Framing, Erregung und demokratische Stabilität?",
      blindSpot: "Plattformen messen Klicks, Shares und Verweildauer. Gesellschaftliche Folgen wie Polarisierung, Quellenverwirrung oder Vertrauensverlust werden seltener sichtbar.",
      difference: "Die Wirkungsökonomie bewertet nicht, ob eine Meinung erlaubt ist. Sie fragt, welche Zustandsveränderungen ein Beitrag im öffentlichen Raum wahrscheinlicher macht.",
      steps: ["Wähle ein Beispiel oder gib eigenen Text ein.", "Schalte zwischen Beispiel und eigenem Text um.", "Lies Score, Ampel, schwächstes Feld und Erklärung gemeinsam."],
      values: "Score und Ampel sind Wirkungspotenziale. Sie sind keine Faktenprüfung, keine Zensurentscheidung und kein Urteil über eine Person.",
      interpretation: "Das Ergebnis zeigt, wo ein Beitrag demokratisch stabilisieren oder polarisieren könnte. Es ist kein Wahrheitsurteil.",
      consequence: "Im WÖk-System würden Medienqualität, Quellenklarheit und Diskursfähigkeit als demokratische Infrastruktur sichtbar und überprüfbar.",
      special: "Heute zählt vor allem Reichweite. Das Tool zeigt, dass Sprache, Frames, Emotionalisierung und Quellenklarheit Wirkungspotenziale für Vertrauen, Polarisierung und Demokratie erzeugen können."
    },
    platform: {
      selector: "#plattformwirkung",
      beforeTarget: ".platform-grid",
      afterTarget: ".platform-grid",
      title: "Warum diese Plattform-Simulation?",
      purpose: "Die Simulation macht sichtbar, dass ein Inhalt anders wirkt, wenn ein Algorithmus ihn verstärkt.",
      question: "Wie verändern Erregung, Wiederholung und Netzwerkverstärkung die demokratische Wirkung eines Inhalts?",
      blindSpot: "Das heutige System sieht häufig Engagement und Reichweite. Es sieht weniger, ob Verstärkung Vertrauen, Respekt und Orientierung fördert oder Polarisierung skaliert.",
      difference: "Die Wirkungsökonomie betrachtet nicht nur den Inhalt, sondern den Wirkungspfad: Wer sieht ihn, wie oft, in welchem Resonanzraum und mit welcher Folge?",
      steps: ["Wähle ein Szenario.", "Verändere Erregung, Konflikt, Gruppenzugehörigkeit, Kommentare und Netzwerkverstärkung.", "Vergleiche Verstärkungsfaktor und Demokratiewirkung."],
      values: "Der Verstärkungsfaktor zeigt modellhaft, wie Plattformlogik Wirkung skaliert. Er ist kein reales Plattform-Audit.",
      interpretation: "Das Ergebnis zeigt, dass Wirkung nicht nur vom Inhalt abhängt, sondern auch davon, wie stark und in welchem Umfeld er verstärkt wird.",
      consequence: "Im WÖk-System müssten Plattformen nicht Inhalte zentral bewerten, sondern Verstärkungslogiken, Transparenz, Beschwerdewege und Systemrisiken offenlegen."
    },
    risk: {
      selector: "#risikolabor",
      beforeTarget: ".risk-lab-grid",
      afterTarget: ".risk-lab-grid",
      title: "Warum diese Risiko-Simulation?",
      purpose: "Die Simulation zeigt, dass Nachhaltigkeit längst ein Risiko- und Resilienzthema ist.",
      question: "Wie verändern Klima, Energie, Geopolitik, Arbeit, Transparenz und Timing den Handlungsspielraum?",
      blindSpot: "Das heutige System erkennt Risiken oft erst, wenn Preise, Lieferfähigkeit, Versicherungen oder Finanzierung bereits reagieren.",
      difference: "Die Wirkungsökonomie macht Risiken früher sichtbar und verbindet sie mit Daten, Prioritäten und Rückkopplungen.",
      steps: ["Wähle eine Branche oder Lage.", "Verändere die Stressfaktoren.", "Lies Score, schwächstes Feld, Finanzierungswirkung und Resilienz zusammen."],
      values: "Die Werte zeigen keine Prognose. Sie zeigen, wie Stressfaktoren zusammenspielen und wo der Engpass liegt.",
      interpretation: "Das Ergebnis zeigt eine Verwundbarkeit, keine Vorhersage. Entscheidend ist, welcher Engpass zuerst handlungsrelevant wird.",
      consequence: "Im WÖk-System würden frühe Resilienzmaßnahmen günstiger und plausibler als spätere Notlösungen.",
      special: "Heute wird Nachhaltigkeit oft als Berichtspflicht verstanden. Das Tool zeigt, dass Wirkung auch Risikomanagement ist: Lieferketten, Klima, Energie und Geopolitik beeinflussen Kosten, Kapitalzugang und Zukunftsfähigkeit."
    },
    calculators: {
      selector: "#scanner",
      beforeTarget: ".tool-lab",
      afterTarget: ".tool-lab",
      title: "Warum diese Rechner?",
      purpose: "Die Rechner zeigen, wie unterschiedliche Wirkungslogiken in Zahlen übersetzt werden können, ohne sie als endgültige Wahrheit auszugeben.",
      question: "Wie unterscheiden sich Wirkungsscore, Wohlfahrtsbilanz und gesellschaftlicher Nutzen pro investiertem Euro?",
      blindSpot: "Klassische Kennzahlen messen oft Output, Kosten oder BIP. Sie zeigen selten Verteilung, Folgekosten, Care-Arbeit, Datenqualität und langfristige Wirkung.",
      difference: "Die Wirkungsökonomie macht sichtbar, welche Annahmen in einer Bewertung stecken und wo Datenqualität die Aussage begrenzt.",
      steps: ["Verändere die Eingaben im gewünschten Rechner.", "Beobachte, wie sich Ergebnis und Interpretation ändern.", "Nutze die Zahl als Gesprächsanlass, nicht als finale Entscheidung."],
      values: "KPI, NWI und T-SROI zeigen unterschiedliche Perspektiven: Wirkungsscore, Wohlfahrtsbilanz und Nutzen-Verhältnis.",
      interpretation: "Das Ergebnis zeigt, welche Logik hinter einer Zahl steht. Dieselbe Maßnahme kann je nach Kennzahl anders lesbar werden.",
      consequence: "Im WÖk-System würden Kennzahlen nicht allein berichten. Sie würden Prioritäten, Budgetlogik, Wirkungshaushalte und Investitionsentscheidungen mitprägen."
    },
    learning: {
      selector: "#lernmodule",
      beforeTarget: ".quiz-lab-grid",
      afterTarget: ".quiz-lab-grid",
      title: "Warum diese Lernmodule?",
      purpose: "Die Lernmodule trainieren den Unterschied zwischen Preis, Reichweite, Gewinn und Wirkung.",
      question: "Kannst du erkennen, was nur Aktivität ist - und was echte Zustandsveränderung beschreibt?",
      blindSpot: "Im Alltag wird Wirkung oft mit guter Absicht, Leistung, Lautstärke oder Wachstum verwechselt.",
      difference: "Die Wirkungsökonomie fragt nach tatsächlichen Folgen für Mensch, Planet und Demokratie.",
      steps: ["Wähle eine Antwort.", "Lies die Rückmeldung.", "Übertrage die Logik auf Produkte, Medien, Politik oder Kapital."],
      values: "Feedback ist didaktisch. Es zeigt Denkfehler und bessere Fragen, keine Zertifizierung.",
      interpretation: "Das Ergebnis hilft beim Lernen: Es zeigt, warum eine Antwort wirkungsökonomisch stärker oder schwächer ist.",
      consequence: "Im WÖk-System ist Wirkungskompetenz eine Grundfähigkeit: Menschen sollen Zahlen, Versprechen und Folgen besser unterscheiden können."
    },
    miniTools: {
      selector: "#werkzeuge",
      beforeTarget: ".tool-lab",
      afterTarget: ".tool-lab",
      title: "Warum diese Mini-Werkzeuge?",
      purpose: "Die Mini-Werkzeuge übersetzen abstrakte Wirkungsökonomie in kurze Alltagserfahrungen.",
      question: "Welche Frage verändert sich, wenn nicht Preis, Reichweite oder kurzfristiger Nutzen im Mittelpunkt stehen?",
      blindSpot: "Viele Entscheidungen wirken klein, erzeugen aber Folgekosten, Anreize und Nebenwirkungen an anderer Stelle.",
      difference: "Die Wirkungsökonomie macht diese Rückkopplungen sichtbar und fragt nach positiven Netto-Folgen.",
      steps: ["Wähle Thema, Aussage oder Handlung.", "Lass die Demo eine Wirkungsperspektive anzeigen.", "Lies die Grenzen und weiterführenden Fragen."],
      values: "Die Ergebnisse sind Lernsignale. Sie ersetzen keine Prüfung und keine politische oder wirtschaftliche Entscheidung.",
      interpretation: "Das Ergebnis zeigt eine Perspektive auf Wirkung. Es ist ein Anlass zum Weiterdenken, nicht das Ende der Bewertung.",
      consequence: "Im WÖk-System würden solche Fragen früher gestellt: vor Beschaffung, Kommunikation, Regulierung, Finanzierung oder Produktdesign."
    }
  };

  function absoluteHref(href) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    const depth = window.location.pathname.split("/").filter(Boolean).length;
    const prefix = depth ? "../".repeat(depth) : "";
    return href.startsWith("/") ? `${prefix}${href.slice(1)}` : href;
  }

  function card(title, text, extraClass = "") {
    const className = extraClass ? `tool-explanation-card ${extraClass}` : "tool-explanation-card";
    return `<article class="${className}"><h3>${title}</h3><p>${text}</p></article>`;
  }

  function ToolPurposeBox(config) {
    return `
      <section class="tool-purpose-box" aria-label="Problem verstehen">
        <p class="hero-kicker">1. Problem verstehen</p>
        <h2>${config.title || "Warum dieses Tool?"}</h2>
        <p>${config.purpose || defaults.purpose}</p>
      </section>
    `;
  }

  function TodayVsWoekBox(config) {
    return `
      <div class="tool-explanation-grid tool-journey-grid">
        ${card("2. Was sieht das heutige System nicht?", config.blindSpot || defaults.blindSpot)}
        ${card("3. Was macht die Wirkungsökonomie anders?", config.difference || defaults.difference)}
      </div>
    `;
  }

  function HowToUseSteps(config) {
    const steps = (config.steps || defaults.steps).slice(0, 3).map((step) => `<li>${step}</li>`).join("");
    return `
      <article class="tool-explanation-card how-to-use-steps">
        <h3>4. So nutzt du das Tool</h3>
        <ol>${steps}</ol>
      </article>
    `;
  }

  function WhatHappensBehindTheScenes(config) {
    return card("Was passiert im Hintergrund?", config.behindScenes || defaults.behindScenes);
  }

  function WhyItMattersBox(config) {
    return `
      <article class="tool-special-box why-it-matters-box" aria-label="Warum ist das besonders?">
        <p class="hero-kicker">WÖk-Unterschied</p>
        <h2>Warum ist das besonders?</h2>
        <p>${config.special || defaults.special}</p>
      </article>
    `;
  }

  function ResultInterpretationCard(config) {
    return card("6. Was bedeuten die Ergebniswerte?", config.values || defaults.values, "tool-result-interpretation");
  }

  function MeaningCard(config) {
    return card("Was bedeutet das?", config.interpretation || defaults.interpretation);
  }

  function LimitsOfDemoBox(config) {
    return card("8. Was diese Demo nicht leistet", config.limits || defaults.limits);
  }

  function FundingSourceBox(config) {
    const text = config.funding || defaults.funding;
    if (!text) return "";
    return `
      <article class="funding-source-box" aria-label="Woher kommt das Geld?">
        <p class="hero-kicker">Finanzierungslogik</p>
        <h3>Woher kommt das Geld?</h3>
        <p>${text}</p>
      </article>
    `;
  }

  function RelatedLearningPath(config) {
    const links = (config.links || defaults.links).map(([label, href]) => `<a class="text-link" href="${absoluteHref(href)}">${label}</a>`).join("");
    return `
      <article class="tool-explanation-card related-learning-path">
        <h3>9. Passende Vertiefungen</h3>
        <div class="tool-explanation-links">${links}</div>
      </article>
    `;
  }

  function renderBefore(config) {
    return `
      <aside class="tool-explanation-layer tool-explanation-before" aria-label="Werkzeugerklaerung">
        ${ToolPurposeBox(config)}
        ${TodayVsWoekBox(config)}
        <div class="tool-explanation-grid tool-journey-grid">
          ${card("Welche Frage beantwortet das Tool?", config.question || defaults.question)}
          ${HowToUseSteps(config)}
          ${WhatHappensBehindTheScenes(config)}
        </div>
        ${WhyItMattersBox(config)}
      </aside>
    `;
  }

  function renderAfter(config) {
    return `
      <aside class="tool-explanation-layer tool-explanation-after" aria-label="Ergebnis einordnen">
        <div class="tool-explanation-grid">
          ${ResultInterpretationCard(config)}
          ${MeaningCard(config)}
          ${card("7. Was würde daraus folgen?", config.consequence || defaults.consequence)}
          ${FundingSourceBox(config)}
          ${LimitsOfDemoBox(config)}
          ${RelatedLearningPath(config)}
        </div>
      </aside>
    `;
  }

  function matchesPage(config) {
    if (!config.pagePath) return true;
    return window.location.pathname.replace(/\/$/, "") === config.pagePath.replace(/\/$/, "");
  }

  function insert(config) {
    if (!matchesPage(config)) return;
    if (config.skipIf && document.querySelector(config.skipIf)) return;
    const root = document.querySelector(config.selector || "body");
    if (!root || root.dataset.toolExplanationReady === "true") return;
    const beforeTarget = document.querySelector(config.beforeTarget);
    const afterTarget = document.querySelector(config.afterTarget);
    if (!beforeTarget && !afterTarget) return;
    if (beforeTarget) beforeTarget.insertAdjacentHTML("beforebegin", renderBefore({ ...defaults, ...config }));
    if (afterTarget) afterTarget.insertAdjacentHTML("afterend", renderAfter({ ...defaults, ...config }));
    root.dataset.toolExplanationReady = "true";
  }

  function init() {
    Object.values(tools).forEach(insert);
  }

  return { init, renderBefore, renderAfter };
})();

const ResultInterpretationLayer = (() => {
  const fallback = {
    meaning: "Dieser Wert ist eine modellhafte Orientierung innerhalb der Demo.",
    relevance: "Er macht sichtbar, welche Wirkungsfrage hinter einer Zahl, einem Score oder einer Ampel steht.",
    change: "Im WÖk-System würde der Wert nicht allein berichtet, sondern mit Datenqualität, Rückkopplung und Korrekturwegen verbunden.",
    limit: "Der Wert ist eine Demo-Aussage, keine amtliche Bewertung, keine Beratung und keine Personenbewertung."
  };

  const rules = [
    {
      match: ["finalscore", "final score"],
      meaning: "Der FinalScore zeigt das schwächste relevante Wirkungsfeld und verhindert, dass negative Wirkung durch positive Einzelwerte verdeckt wird.",
      relevance: "So wird sichtbar, wo Produkt-, Projekt- oder Organisationswirkung zuerst verbessert werden müsste.",
      change: "Im WÖk-System könnte der FinalScore Preise, Prioritäten, Förderfähigkeit oder Korrekturpfade beeinflussen.",
      limit: "Der Score ist modellhaft und hängt von Datenqualität, Schwellen, Quellen und politischer Ausgestaltung ab."
    },
    {
      match: ["modell-steuersatz", "steuersatz", "taxrate", "steuerklasse"],
      meaning: "Der Wert zeigt modellhaft, wie eine Wirkungseinstufung in einen Preis- oder Steuerimpuls übersetzt werden könnte.",
      relevance: "Damit wird Wirkung nicht nur beschrieben, sondern als Anreiz sichtbar.",
      change: "Bessere Wirkung könnte entlasten, schädliche Wirkung könnte teurer werden oder Korrekturpflichten auslösen.",
      limit: "Das ist keine amtliche Steuerklasse und keine Steuerberatung."
    },
    {
      match: ["bruttopreis", "grossprice"],
      meaning: "Der Preis zeigt, wie ein Wirkungsaufschlag oder eine Entlastung im Endpreis sichtbar werden könnte.",
      relevance: "Heute bleiben Folgekosten oft außerhalb des Preises; die Demo macht diese Rückkopplung anschaulich.",
      change: "Im WÖk-System könnten Kaufentscheidungen, Produktentwicklung und Lieferketten stärker an Wirkung gekoppelt werden.",
      limit: "Der Betrag ist eine Modellrechnung, kein realer Marktpreis und keine amtliche Abgabe."
    },
    {
      match: ["nettopreis", "netprice"],
      meaning: "Der Nettopreis ist der Ausgangswert vor modellhafter Wirkungsrückkopplung.",
      relevance: "Er trennt den heutigen Preis von der Frage, welche externen Wirkungen noch nicht eingepreist sind.",
      change: "Im WÖk-System würde dieser Ausgangswert mit Wirkung, Datenqualität und Rückkopplung zusammengedacht.",
      limit: "Der Wert sagt allein noch nichts über tatsächliche Produktwirkung aus."
    },
    {
      match: ["nwi", "netto-wirkungs-index"],
      meaning: "Der NWI verdichtet positive und negative Wirkung modellhaft zu einer Netto-Sicht.",
      relevance: "So wird sichtbar, ob eine Maßnahme unterm Strich stärkt, neutral bleibt oder Folgekosten erzeugt.",
      change: "Im WÖk-System könnten Budgets, Investitionen oder Korrekturen stärker an positiver Netto-Wirkung ausgerichtet werden.",
      limit: "Der NWI ist nur so belastbar wie Daten, Gewichtung und Bewertungsrahmen."
    },
    {
      match: ["t-sroi", "tsroi"],
      meaning: "T-SROI zeigt modellhaft, welcher Wirkungswert einem eingesetzten Euro gegenübersteht.",
      relevance: "Er macht Prävention, vermiedene Folgekosten und Transformationsnutzen vergleichbarer.",
      change: "Im WÖk-System könnten Förderungen und Investitionen stärker auf nachweisbare Transformationswirkung ausgerichtet werden.",
      limit: "Die Quote ist eine Annahme, kein geprüfter Finanz- oder Sozialertrag."
    },
    {
      match: ["wirkungswert", "totalvalue"],
      meaning: "Der Wert zeigt modellhaft die Summe angenommener positiver Wirkungen über den betrachteten Zeitraum.",
      relevance: "Er hilft, Folgekostenvermeidung und gesellschaftlichen Nutzen sichtbar zu machen.",
      change: "Im WÖk-System könnte dieser Wert in Budget-, Fonds- oder Priorisierungsentscheidungen zurückfließen.",
      limit: "Der Betrag ist eine Plausibilisierung, keine Bilanz und kein Zahlungsanspruch."
    },
    {
      match: ["betroffene vollzeitstellen", "vollzeitstellen", "affectedfte"],
      meaning: "Der Wert zeigt, wie viele Beschäftigte, umgerechnet auf Vollzeitstellen, im Modell von Automatisierung betroffen wären.",
      relevance: "Er macht sichtbar, dass Automatisierung nicht nur Kosten senkt, sondern Übergänge, Einkommen und Sicherungssysteme berührt.",
      change: "Im WÖk-System würde daraus ein Bedarf für Qualifizierung, Versetzung, Beteiligung oder Rückkopplung entstehen.",
      limit: "Die Zahl ist eine Modellannahme und keine Aussage über einzelne Beschäftigte."
    },
    {
      match: ["wegfallende lohnsumme", "lostpayroll"],
      meaning: "Dieser Wert zeigt, welche Lohnsumme im alten System als Beitrags- und Einkommensbasis gefährdet wäre.",
      relevance: "Automatisierung kann Wertschöpfung erhalten oder steigern, während Lohnarbeit als Finanzierungsbasis sinkt.",
      change: "Im WÖk-System müsste ein Teil der neuen Wertschöpfung in Sicherung, Weiterbildung oder Wirkungseinkommen zurückfließen.",
      limit: "Der Betrag ist eine Modellrechnung, keine Prognose und keine Unternehmensbewertung."
    },
    {
      match: ["beitragslücke", "potenzielle beitragslücke", "contributiongap"],
      meaning: "Im alten System wäre dieser Betrag gefährdet, weil Sozialbeiträge an Lohnarbeit hängen.",
      relevance: "Automatisierung kann Wertschöpfung erhalten oder steigern, aber die klassische Beitragsbasis schwächen.",
      change: "Ein Teil der automatisierten Wertschöpfung könnte über Rückkopplungsmechanismen in soziale Sicherung, Weiterbildung oder Wirkungseinkommen fließen.",
      limit: "Dieser Wert ist eine Modellannahme, keine amtliche Berechnung."
    },
    {
      match: ["maschinenwertschöpfungsbeitrag", "beitrag", "machinecontribution"],
      meaning: "Der Betrag zeigt modellhaft, welcher Anteil automatisierter Wertschöpfung gesellschaftlich rückgekoppelt werden könnte.",
      relevance: "So wird Produktivitätsgewinn als Finanzierungsfrage sichtbar, nicht nur als Kapitalrendite.",
      change: "Im WÖk-System könnte der Beitrag Sicherungssysteme, Wirkungsfonds, Weiterbildung oder Übergangsschutz stabilisieren.",
      limit: "Der Betrag ist keine Steuerfestsetzung und keine Rechts- oder Sozialberatung."
    },
    {
      match: ["wirkungsfaktor", "faktor", "impactfactor"],
      meaning: "Der Faktor zeigt, ob eine Wirkung im Modell entlastend, neutral oder belastend berücksichtigt wird.",
      relevance: "Nicht jede Automatisierung wirkt gleich: Entscheidend ist, ob sie stärkt, beteiligt, verdrängt oder extraktiv ist.",
      change: "Im WÖk-System könnte ein positiver Faktor entlasten und ein negativer Faktor stärkere Rückkopplung auslösen.",
      limit: "Der Faktor ist eine Demo-Skala, keine amtliche Einstufung."
    },
    {
      match: ["transformationsbonus", "bonus"],
      meaning: "Der Bonus zeigt, wie stark soziale Abfederung und faire Übergänge den Beitrag modellhaft senken.",
      relevance: "Er macht sichtbar, dass Weiterbildung, Versetzung, Arbeitszeitmodelle und Beteiligung reale Wirkungsunterschiede erzeugen.",
      change: "Im WÖk-System würden entlastende Transformationspfade wirtschaftlich belohnt oder weniger stark belastet.",
      limit: "Der Bonus ist eine Modellannahme und kein Anspruch."
    },
    {
      match: ["reduzierter beitrag", "reducedcontribution"],
      meaning: "Der Wert zeigt den Beitrag nach Berücksichtigung des Transformationsbonus.",
      relevance: "So wird sichtbar, dass gleiche Automatisierungsgewinne unterschiedlich wirken können.",
      change: "Im WÖk-System würde gute Übergangsgestaltung die Rückkopplung verändern.",
      limit: "Der Wert ist keine verbindliche Beitragsberechnung."
    },
    {
      match: ["wirkungsprofil", "profile", "ampel", "risikoampel"],
      meaning: "Das Profil ordnet die Richtung der Wirkung ein: entlastend, neutral, verdrängend, extraktiv oder risikobehaftet.",
      relevance: "Eine Ampel oder Kategorie hilft, Handlungsbedarf schnell zu erkennen.",
      change: "Im WÖk-System würde daraus eine Korrektur-, Prüf- oder Förderlogik entstehen.",
      limit: "Die Einordnung ist eine Demo-Heuristik und ersetzt keine Prüfung."
    },
    {
      match: ["gesamteinkommen", "totalincome"],
      meaning: "Der Wert zeigt ein mögliches Einkommen aus mehreren Quellen statt nur aus Erwerbsarbeit.",
      relevance: "Er macht sichtbar, wie Teilhabe stabilisiert werden könnte, wenn Arbeit und Wertschöpfung auseinanderfallen.",
      change: "Im WÖk-System könnten Grundsicherheit, Markteinkommen, Wirkungsbonus und Fondsanteil zusammen gedacht werden.",
      limit: "Der Wert ist kein Anspruch, kein Sozialbescheid und keine persönliche Bewertung."
    },
    {
      match: ["grundsicherheit", "baseshare"],
      meaning: "Der Anteil zeigt, welcher Teil des Modells aus stabiler Grundsicherung stammt.",
      relevance: "Grundsicherheit kann Übergänge abfedern und Teilhabe sichern.",
      change: "Im WÖk-System wäre Grundsicherheit Teil einer breiteren Einkommensarchitektur.",
      limit: "Der Anteil ist eine Modellgröße, keine politische Festlegung."
    },
    {
      match: ["markt", "marketshare"],
      meaning: "Der Anteil zeigt, welcher Teil weiterhin aus Markteinkommen stammt.",
      relevance: "Die Demo trennt Markteinkommen von Grundsicherheit, Wirkung und Fondsrückflüssen.",
      change: "Im WÖk-System bleibt Marktleistung relevant, wird aber nicht zum einzigen Maßstab.",
      limit: "Der Anteil ist eine Szenarioannahme."
    },
    {
      match: ["wirkung/fonds", "impactshare", "fondsanteil"],
      meaning: "Der Anteil zeigt, welcher Teil aus Wirkungsbonus oder Fondsrückfluss stammen könnte.",
      relevance: "Damit wird gesellschaftliche Rückkopplung als Einkommensquelle sichtbar.",
      change: "Im WÖk-System könnten Wirkungsfonds und Boni Teilhabe und Transformation finanzieren.",
      limit: "Der Anteil ist kein garantierter Anspruch."
    },
    {
      match: ["datenqualität", "dataquality"],
      meaning: "Die Datenqualität zeigt, wie belastbar eine Ersteinschätzung ist.",
      relevance: "Ohne Quellen, Prüfstatus und Datenstand kann ein Score Scheinsicherheit erzeugen.",
      change: "Im WÖk-System würde niedrige Datenqualität Nachweispflichten, Vorsicht oder weitere Prüfung auslösen.",
      limit: "Die Stufe bewertet die Datenlage, nicht automatisch die Sache selbst."
    },
    {
      match: ["score"],
      meaning: "Der Score ordnet eine Wirkung modellhaft auf einer Skala ein.",
      relevance: "Scores machen unterschiedliche Wirkungsfelder vergleichbarer, ohne sie zu endgültigen Wahrheiten zu machen.",
      change: "Im WÖk-System könnten Scores Anreize, Prüfbedarf oder Korrekturpfade auslösen.",
      limit: "Der Score ist abhängig von Methode, Datenqualität und Bewertungsrahmen."
    }
  ];

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}+/%-]+/gu, " ").trim();
  }

  function findRule(key, label) {
    const haystack = normalize(`${key || ""} ${label || ""}`);
    return rules.find((rule) => rule.match.some((needle) => haystack.includes(normalize(needle)))) || fallback;
  }

  function render(rule) {
    return `
      <div class="result-interpretation" data-result-interpretation>
        <p><strong>Bedeutung:</strong> ${rule.meaning}</p>
        <p><strong>Warum relevant?</strong> ${rule.relevance}</p>
        <p><strong>Was würde sich ändern?</strong> ${rule.change}</p>
        <p><strong>Grenze der Aussage:</strong> ${rule.limit}</p>
      </div>
    `;
  }

  function labelForDataElement(el) {
    const parent = el.closest("div, article, li, p") || el.parentElement;
    const dt = parent?.querySelector("dt");
    const span = parent?.querySelector("span");
    const heading = el.closest("article")?.querySelector("h2, h3, h4");
    return dt?.textContent || span?.textContent || heading?.textContent || el.getAttribute("data-result") || el.getAttribute("data-auto-result") || "";
  }

  function applyToDataResults(scope) {
    scope.querySelectorAll("[data-result], [data-auto-result]").forEach((el) => {
      if (el.matches("p[data-result], p[data-auto-result]")) return;
      const host = el.closest("dl > div, .impact-kpi") || el.parentElement;
      if (!host || host.querySelector(":scope > [data-result-interpretation]")) return;
      const key = el.getAttribute("data-result") || el.getAttribute("data-auto-result") || "";
      host.insertAdjacentHTML("beforeend", render(findRule(key, labelForDataElement(el))));
    });
  }

  function applyToImpactKpis(scope) {
    scope.querySelectorAll(".impact-kpi").forEach((host) => {
      if (host.closest("[data-scorecard-dashboard]")) return;
      if (host.querySelector(":scope > [data-result-interpretation]")) return;
      const valueEl = host.querySelector("strong");
      if (!valueEl) return;
      const key = Array.from(valueEl.attributes || [])
        .filter((attr) => attr.name.startsWith("data-"))
        .map((attr) => attr.name.replace(/^data-/, ""))
        .join(" ");
      host.insertAdjacentHTML("beforeend", render(findRule(key, labelForDataElement(valueEl))));
    });
  }

  function applyToScanner(scope) {
    scope.querySelectorAll(".scanner-quality-card").forEach((cardEl) => {
      if (cardEl.querySelector("[data-result-interpretation]")) return;
      cardEl.insertAdjacentHTML("beforeend", render(findRule("datenqualität", "Datenqualität")));
    });
  }

  function apply(scope = document) {
    applyToDataResults(scope);
    applyToImpactKpis(scope);
    applyToScanner(scope);
  }

  function init() {
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return { init, apply };
})();

const ToolSpecialBoxLayer = (() => {
  const boxes = [
    {
      pagePath: "/erleben/produktwirkungsrechner/",
      target: ".product-calculator-section",
      text: "Heute zeigt der Preis meist nur Kosten, Marge und Steuer. Das Tool zeigt, welche sozialen, ökologischen und gesundheitlichen Wirkungen im Preis unsichtbar bleiben."
    },
    {
      pagePath: "/erleben/impact-controlling-rechner/",
      target: ".product-calculator-section",
      text: "Heute wird Wirkung oft nachträglich berichtet. Das Tool zeigt, wie Scorecard, Netto-Wirkungs-Index und T-SROI Entscheidungen früher strukturieren können: vor Budget, Investition oder Korrektur."
    },
    {
      pagePath: "/erleben/medienwirkungscheck/",
      target: "main section.section",
      text: "Heute zählt vor allem Reichweite. Das Tool zeigt, dass Sprache, Frames, Emotionalisierung und Quellenklarheit Wirkungspotenziale für Vertrauen, Polarisierung und Demokratie erzeugen können."
    },
    {
      pagePath: "/erleben/unternehmens-wirkungscheck/",
      target: "main section.section",
      text: "Heute werden Unternehmen oft über Umsatz, Kosten, Risiko oder Compliance gelesen. Das Tool zeigt, wie Wertschöpfung, Lieferketten, Beschäftigung, Governance und Datenqualität als Wirkungssystem zusammenhängen."
    },
    {
      pagePath: "/erleben/wirkungsrenten-rechner/",
      target: "main section.section",
      text: "Heute hängt soziale Sicherung stark an Erwerbsbiografien und Beitragsjahren. Das Tool zeigt, wie Care, Bildung, Engagement, Fondsanteile und automatisierte Wertschöpfung als ergänzende Sicherungslogik denkbar werden."
    },
    {
      pagePath: "/erleben/wohnwirkungsrechner/",
      target: "main section.section",
      text: "Heute wird Wohnen oft über Miete, Quadratmeter und Rendite betrachtet. Das Tool zeigt, dass Wohnkosten, Energie, Gesundheit, Verdrängung, Quartier und Resilienz gemeinsam über Wohnwirkung entscheiden."
    },
    {
      pagePath: "/erleben/wirkungsschule-check/",
      target: "main section.section",
      text: "Heute wird Bildung häufig über Noten, Abschlüsse und Output gemessen. Das Tool zeigt, wie Lernräume, Teilhabe, Förderung, Demokratiepraxis und Datenethik als Wirkungsbedingungen sichtbar werden - ohne Kinder zu bewerten."
    },
    {
      pagePath: "/erleben/wirkungsportfolio-generator/",
      target: "main section.section",
      text: "Heute dokumentieren Portfolios oft Leistungen nachträglich. Das Tool zeigt, wie Lernwege, Feedback, Reflexion und Wirkungskompetenz als Entwicklungspfad sichtbar werden, ohne daraus ein Personenranking zu machen."
    },
    {
      pagePath: "/erleben/fach-zukunft-generator/",
      target: "main section.section",
      text: "Heute werden Fächer oft getrennt geplant. Das Tool zeigt, wie lokale Fragen, SDGs, Demokratiebezug und Ergebnisformate zu Lernfeldern verbunden werden können."
    },
    {
      pagePath: "/erleben/wirkungsfoerderungs-check/",
      target: "main section.section",
      text: "Heute setzt Förderung häufig erst ein, wenn Defizite sichtbar werden. Das Tool zeigt, wie Prävention, Potenzialförderung, Mentoring und Teilhabe früher und würdiger strukturiert werden können."
    },
    {
      pagePath: "/scorecard-dashboard.html",
      target: "#dashboard",
      text: "Heute bleiben Produktpässe, Scorecards und Lieferkettendaten oft getrennte Informationsinseln. Das Dashboard zeigt, wie Preis, Wirkung, Datenqualität und Rückkopplung als zusammenhängende Entscheidungsarchitektur lesbar werden."
    }
  ];

  function matchesPage(config) {
    if (!config.pagePath) return true;
    return window.location.pathname.replace(/\/$/, "") === config.pagePath.replace(/\/$/, "");
  }

  function render(text) {
    return ToolExplanationLayer.renderBefore({ special: text });
  }

  function init() {
    boxes.forEach((config) => {
      if (!matchesPage(config)) return;
      const target = document.querySelector(config.target);
      if (!target || target.dataset.specialBoxReady === "true") return;
      target.insertAdjacentHTML("beforebegin", render(config.text));
      target.insertAdjacentHTML("afterend", ToolExplanationLayer.renderAfter(config));
      target.dataset.specialBoxReady = "true";
    });
  }

  return { init };
})();

const GenericToolPageExplanationLayer = (() => {
  function isToolLikePath() {
    const path = window.location.pathname;
    if (path === "/werkzeuge/" || path === "/erleben/" || path === "/anwendungen/") return false;
    return path.includes("/werkzeuge/") || path.includes("/erleben/") || path.includes("/anwendungen/");
  }

  function pageTitle() {
    return document.querySelector("main h1")?.textContent?.trim() || document.title.split("|")[0].trim() || "Dieses Werkzeug";
  }

  function configForPage() {
    const title = pageTitle();
    const lowerPath = decodeURIComponent(window.location.pathname.toLowerCase());
    const isMethod = lowerPath.includes("/dossier") || lowerPath.includes("/detailkonzepte") || lowerPath.includes("/methodenpapiere");

    return {
      title: `Warum gibt es ${title}?`,
      purpose: isMethod
        ? "Diese Methodenseite ordnet ein Werkzeug oder Bewertungsmodell ein, damit es nicht als Blackbox erscheint."
        : "Dieses Werkzeug existiert, damit eine Wirkungsfrage verständlich, prüfbar und begrenzt auswertbar wird.",
      question: "Welche Wirkung, welche Datenlücken oder welche Rückkopplung werden sichtbar - und was darf daraus noch nicht abgeleitet werden?",
      blindSpot: "Das heutige System betrachtet oft Kosten, Output, Berichtspflichten, Reichweite oder Einzelkennzahlen. Die Wirkung dahinter bleibt leicht unklar.",
      difference: "Die Wirkungsökonomie fragt nach tatsächlichen Zustandsveränderungen, Datenqualität, Zielkonflikten und positiver Netto-Wirkung für Mensch, Planet und Demokratie.",
      steps: isMethod
        ? ["Lies zuerst Zweck und Grenze der Methodik.", "Prüfe, welche Daten und Annahmen genannt werden.", "Nutze die Seite als Orientierung, nicht als automatische Entscheidung."]
        : ["Gib wenige Werte ein oder wähle ein Beispiel.", "Vergleiche Ergebnis, Erklärung und Datenqualität.", "Lies Grenzen und Vertiefungen, bevor du Schlüsse ziehst."],
      values: "Ergebniswerte, Scores oder Ampeln sind Orientierung. Sie brauchen immer Kontext, Datenqualität, Bedeutung und Grenze.",
      interpretation: "Das Ergebnis zeigt, welche Frage als Nächstes geprüft werden sollte. Es ist keine abschließende Bewertung.",
      behindScenes: "Im Hintergrund werden Annahmen, Eingaben, Wirkungsfelder und Datenqualität zu einer modellhaften Einordnung verbunden.",
      consequence: "Im WÖk-System würden solche Ergebnisse Entscheidungen vorbereiten: durch bessere Daten, Anreize, Korrekturwege oder vertiefte Prüfung.",
      limits: "Diese Seite leistet keine amtliche Bewertung, keine Beratung, kein Audit, keine Zertifizierung und keine Personenbewertung.",
      links: [
        ["Werkzeuge im Überblick", "/werkzeuge/"],
        ["Glossar", "/glossar.html"],
        ["SDG-/SDG+-Referenz", "/verstehen/sdgs-sdgplus/"]
      ]
    };
  }

  function init() {
    if (!isToolLikePath() || !mainElement || document.querySelector(".tool-explanation-before")) return;
    const target = mainElement.querySelector("[data-scanner-mvp-root], [data-tool-root], .product-calculator-section, .tool-lab, .section");
    if (!target || target.dataset.genericToolExplanationReady === "true") return;
    const config = configForPage();
    target.insertAdjacentHTML("beforebegin", ToolExplanationLayer.renderBefore(config));
    target.insertAdjacentHTML("afterend", ToolExplanationLayer.renderAfter(config));
    target.dataset.genericToolExplanationReady = "true";
  }

  return { init };
})();

const FundingSourceLayer = (() => {
  const defaultText = "Die Wirkungsökonomie nimmt kein Geld aus dem Nichts an. Finanzierungslogiken entstehen durch Rückkopplung bestehender Wertschöpfung: negative Wirkung kann höher belastet werden, positive Wirkung kann entlastet oder als Bonus sichtbar werden, und Fondsmechanismen können Mittel für soziale Sicherung, Transformation, Weiterbildung oder Wirkungseinkommen bündeln. Ob daraus Steuer, Beitrag, Bonus, Fonds oder Kapitalrückfluss wird, bleibt politische und rechtliche Ausgestaltung. Diese Demo ist keine fertige Finanzierungszusage.";
  const automationText = "Aus der Wertschöpfung, die durch Automatisierung entsteht. Wenn Maschinen Arbeit ersetzen, verschwindet nicht automatisch der wirtschaftliche Nutzen. Er verschiebt sich nur: weg von Lohnarbeit hin zu Kapital- und Produktivitätsgewinnen. Die Wirkungsökonomie fragt, welcher Teil dieser Gewinne in soziale Sicherung, Weiterbildung, Transformation und Wirkungseinkommen zurückgeführt werden müsste.";

  const entries = [
    {
      patterns: ["automatisierungs-wirkungseinkommensrechner", "automatisierung", "maschinenwertschoepfung", "maschinenwertschöpfung"],
      text: `${automationText} Je nach Ausgestaltung könnte das als Steuer-, Beitrags-, Bonus- oder Fondsrückkopplung modelliert werden. Die Demo berechnet keine amtliche Zahlung und keine Finanzierungszusage.`
    },
    {
      patterns: ["wirkungsfonds", "fonds"],
      text: "Angenommen wird ein Fondsmechanismus: bestehende Wertschöpfung, Kapitalerträge, Wirkungssteuern, Beiträge oder Rückflüsse aus vermiedenen Folgekosten könnten gebündelt werden. Negative Wirkung kann höhere Rückkopplung auslösen, positive Wirkung kann entlastet oder gefördert werden. Die konkrete Fondsfinanzierung ist eine politische, rechtliche und demokratische Entscheidung, keine Zusage dieser Seite."
    },
    {
      patterns: ["rente", "wirkungsrente", "soziale-sicherung", "sozialabgaben", "sozialstaat"],
      text: "Im Renten- und Sozialstaatskontext kommt Geld nicht aus einer neuen Versprechensquelle, sondern aus einer anderen Rückkopplung von Beiträgen, Steuern, Fondsanteilen, Kapitalerträgen und Wirkungserträgen. Die WÖk-Frage lautet, welche Wertschöpfung soziale Sicherung trägt, wenn Erwerbsbiografien, Care-Arbeit, Automatisierung und Kapitalwirkung auseinanderfallen. Die Demo ist keine Rentenauskunft, keine Beitragsberechnung und keine Finanzierungszusage."
    },
    {
      patterns: ["wirkungseinkommen", "arbeit-einkommen", "einkommen", "automatisierungsdividende"],
      text: "Für Wirkungseinkommen wird angenommen, dass bestehende und neue Wertschöpfung anders rückgekoppelt wird: über Steuer-, Beitrags-, Bonus-, Fonds- oder Kapitalmechanismen. Negative Wirkung könnte stärker belastet werden, positive Wirkung entlastet oder vergütet. Das Modell beschreibt eine Finanzierungslogik, aber keine garantierte Auszahlung und keine fertige Sozialleistung."
    }
  ];

  function pathText() {
    const path = decodeURIComponent(window.location.pathname.toLowerCase());
    const match = entries.find((entry) => entry.patterns.some((pattern) => path.includes(pattern)));
    return match?.text || "";
  }

  function render(text) {
    return `
      <aside class="funding-source-box section" aria-label="Woher kommt das Geld?">
        <p class="hero-kicker">Finanzierungslogik</p>
        <h2>Woher kommt das Geld?</h2>
        <p>${text}</p>
      </aside>
    `;
  }

  function init() {
    if (document.querySelector(".funding-source-box")) return;
    const text = pathText();
    if (!text) return;
    const target = document.querySelector(".tool-explanation-after") || document.querySelector(".citation-note") || document.querySelector("main > .section:nth-of-type(2)") || document.querySelector("main > .section");
    if (!target) return;
    target.insertAdjacentHTML(target.classList.contains("tool-explanation-after") ? "beforebegin" : "afterend", render(text));
  }

  return { init };
})();

const ToolTermInlineLayer = (() => {
  const terms = [
    {
      key: "beitragsluecke",
      label: "Beitragslücke",
      aliases: ["Beitragslücke"],
      definition: "Eine modellhafte Lücke, die entsteht, wenn Lohnarbeit wegfällt und dadurch Sozialbeiträge oder Ansprüche schwächer werden.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "automatisierte-wertschoepfung",
      label: "automatisierte Wertschöpfung",
      aliases: ["automatisierte Wertschöpfung", "Automatisierte Wertschöpfung"],
      definition: "Wirtschaftlicher Wert, der durch Maschinen, Software oder KI entsteht, statt direkt durch menschliche Arbeitszeit.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "maschinenwertschoepfungsbeitrag",
      label: "Maschinenwertschöpfungsbeitrag",
      aliases: ["Maschinenwertschöpfungsbeitrag"],
      definition: "Ein modellhafter Beitrag aus automatisierter Wertschöpfung, der soziale Sicherung, Weiterbildung oder Fonds stützen könnte.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "rueckkopplungsquote",
      label: "Rückkopplungsquote",
      aliases: ["Rückkopplungsquote"],
      definition: "Der angenommene Anteil einer Wertschöpfung, der wieder in Sicherung, Fonds, Korrektur oder Transformation zurückfließt.",
      url: "/begriffe/wirkungsrueckkopplung/"
    },
    {
      key: "wirkungsfaktor",
      label: "Wirkungsfaktor",
      aliases: ["Wirkungsfaktor"],
      definition: "Ein Zu- oder Abschlag im Modell: Er zeigt, ob eine Wirkung eher belastet, neutral bleibt oder entlastet.",
      url: "/begriffe/wirkungsbewertung/"
    },
    {
      key: "transformationsbonus",
      label: "Transformationsbonus",
      aliases: ["Transformationsbonus"],
      definition: "Eine modellhafte Entlastung, wenn ein Übergang fair gestaltet wird, etwa durch Weiterbildung, Versetzung oder Beteiligung.",
      url: "/begriffe/transformationswirkung/"
    },
    {
      key: "wirkungseinkommen",
      label: "Wirkungseinkommen",
      aliases: ["Wirkungseinkommen"],
      definition: "Ein Einkommensmodell, das Grundsicherheit, Markteinkommen, Wirkungsbonus und Fondsanteile zusammendenkt.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "grunddividende",
      label: "Grunddividende",
      aliases: ["Grunddividende"],
      definition: "Ein modellhafter Grundanteil am Einkommen, der Teilhabe absichern soll. Er ist keine zugesagte Auszahlung.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "wirkungsbonus",
      label: "Wirkungsbonus",
      aliases: ["Wirkungsbonus"],
      definition: "Ein möglicher Bonus, wenn eine Tätigkeit, ein Produkt oder ein Übergang positive Wirkung sichtbar stärkt.",
      url: "/begriffe/positive-netto-wirkung/"
    },
    {
      key: "fondsanteil",
      label: "Fondsanteil",
      aliases: ["Fondsanteil"],
      definition: "Ein modellhafter Anteil aus einem Fonds. Er zeigt eine Rückflusslogik, aber keinen garantierten Anspruch.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "wirkungsfonds",
      label: "Wirkungsfonds",
      aliases: ["Wirkungsfonds"],
      definition: "Ein Fonds, der Mittel für positive Wirkung, Übergänge oder soziale Sicherung bündeln könnte.",
      url: "/begriffe/wirkungseinkommen/"
    },
    {
      key: "score",
      label: "Score",
      aliases: ["Score", "Scores"],
      definition: "Eine Modellzahl, die eine Einschätzung verdichtet. Sie ist eine Orientierung, keine endgültige Wahrheit.",
      url: "/begriffe/scorecard/"
    },
    {
      key: "ampel",
      label: "Ampel",
      aliases: ["Ampel"],
      definition: "Eine einfache Farblogik für Orientierung: grün, gelb oder rot. Sie ersetzt keine genaue Prüfung.",
      url: "/begriffe/wirkungsbewertung/"
    },
    {
      key: "schwaechstes-feld",
      label: "schwächstes Feld",
      aliases: ["schwächstes Feld", "schwächste Feld"],
      definition: "Das Wirkungsfeld mit dem größten Risiko oder der niedrigsten Bewertung. Es kann die Gesamtbewertung begrenzen.",
      url: "/begriffe/reverse-merit-order/"
    },
    {
      key: "reverse-merit-order",
      label: "Reverse Merit Order",
      aliases: ["Reverse Merit Order"],
      definition: "Das schwächste relevante Wirkungsfeld begrenzt die Gesamtbewertung. Gute Werte verdecken schwere Risiken nicht.",
      url: "/begriffe/reverse-merit-order/"
    },
    {
      key: "wirkungspotenzial",
      label: "Wirkungspotenzial",
      aliases: ["Wirkungspotenzial"],
      definition: "Die mögliche Wirkung einer Handlung, bevor sicher ist, was tatsächlich passiert.",
      url: "/begriffe/wirkungspotenzial/"
    },
    {
      key: "datenqualitaet",
      label: "Datenqualität",
      aliases: ["Datenqualität"],
      definition: "Sie zeigt, wie belastbar die verwendeten Daten sind: geprüft, berichtet, geschätzt oder lückenhaft.",
      url: "/begriffe/wirkungsdaten/"
    },
    {
      key: "ersteinschaetzung",
      label: "Ersteinschätzung",
      aliases: ["Ersteinschätzung"],
      definition: "Eine schnelle Orientierung auf Basis weniger Angaben. Sie ist keine amtliche Bewertung und keine Beratung.",
      url: "/begriffe/wirkungsbewertung/"
    }
  ];

  const allowedPathParts = ["/erleben/", "/werkzeuge/", "/anwendungen/", "/wirkungsfelder/"];
  const excludedSelector = [
    "a",
    "button",
    "nav",
    "footer",
    "header",
    "form",
    "input",
    "textarea",
    "select",
    "option",
    "script",
    "style",
    "code",
    "pre",
    ".glossary-term",
    ".inline-help",
    ".glossary-card",
    ".glossary-sheet",
    "[data-no-glossary]",
    "[data-no-tooltips]"
  ].join(",");

  function shouldRun() {
    const path = window.location.pathname;
    if (isDebugPath(path)) return false;
    return allowedPathParts.some((part) => path.includes(part)) || path.endsWith("/scorecard-dashboard.html");
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function absoluteHref(href) {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    const depth = window.location.pathname.split("/").filter(Boolean).length;
    const prefix = depth ? "../".repeat(depth) : "";
    return href.startsWith("/") ? `${prefix}${href.slice(1)}` : href;
  }

  function createTermLink(term, text) {
    const link = document.createElement("a");
    link.href = absoluteHref(term.url || "/glossar.html");
    link.className = "glossary-term tool-term-tooltip";
    link.dataset.glossaryKey = term.key;
    link.dataset.glossaryLabel = term.label;
    link.dataset.glossaryDefinition = term.definition.slice(0, 280);
    link.dataset.glossaryUrl = link.href;
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-label", `${term.label}: ${link.dataset.glossaryDefinition} Mehr im Glossar`);
    link.textContent = text;
    return link;
  }

  function findMatch(text, used) {
    let best = null;
    terms.forEach((term) => {
      if (used.has(term.key)) return;
      term.aliases.forEach((alias) => {
        const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_-])(${escapeRegex(alias)})(?![\\p{L}\\p{N}_-])`, "u");
        const match = text.match(pattern);
        if (!match || match.index === undefined) return;
        const start = match.index + match[1].length;
        const candidate = { term, start, text: match[2] };
        if (!best || candidate.start < best.start || (candidate.start === best.start && candidate.text.length > best.text.length)) {
          best = candidate;
        }
      });
    });
    return best;
  }

  function markNode(node, used) {
    const text = node.nodeValue || "";
    const match = findMatch(text, used);
    if (!match) return false;

    const fragment = document.createDocumentFragment();
    const before = text.slice(0, match.start);
    const after = text.slice(match.start + match.text.length);
    if (before) fragment.append(document.createTextNode(before));
    fragment.append(createTermLink(match.term, match.text));
    if (after) fragment.append(document.createTextNode(after));
    node.parentNode?.replaceChild(fragment, node);
    used.add(match.term.key);
    return true;
  }

  function appendLabelHints(used) {
    mainElement.querySelectorAll("label, dt, th, .impact-kpi span").forEach((element) => {
      if (!(element instanceof HTMLElement) || element.closest(".glossary-term, .inline-help, [data-no-tooltips]")) return;
      const text = element.textContent || "";
      const term = terms.find((candidate) => !used.has(candidate.key) && candidate.aliases.some((alias) => text.includes(alias)));
      if (!term) return;

      const hint = document.createElement("span");
      hint.className = "inline-help tool-label-help";
      hint.tabIndex = 0;
      hint.dataset.help = term.definition.slice(0, 280);
      hint.setAttribute("aria-label", `${term.label}: ${hint.dataset.help}`);
      hint.textContent = "?";
      element.append(document.createTextNode(" "), hint);
      used.add(term.key);
    });
  }

  function init() {
    if (!shouldRun() || !mainElement || mainElement.dataset.toolTermsReady === "true") return;
    const used = new Set();
    const blocks = Array.from(mainElement.querySelectorAll("p, li, dd, span, small"));
    for (const block of blocks) {
      if (!(block instanceof HTMLElement) || block.closest(excludedSelector)) continue;
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || parent.closest(excludedSelector) || !node.nodeValue?.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        markNode(node, used);
        if (used.size >= terms.length) break;
      }
      if (used.size >= terms.length) break;
    }
    appendLabelHints(used);
    mainElement.dataset.toolTermsReady = "true";
  }

  return { init };
})();

const MethodToolFilterLayer = (() => {
  function initPanel(panel) {
    if (!(panel instanceof HTMLElement) || panel.dataset.ready === "true") return;
    const cards = Array.from(document.querySelectorAll("[data-method-card]"));
    if (!cards.length) return;

    const controls = {
      search: panel.querySelector("[data-tool-filter-search]"),
      cluster: panel.querySelector("[data-tool-filter-cluster]"),
      type: panel.querySelector("[data-tool-filter-type]"),
      status: panel.querySelector("[data-tool-filter-status]"),
      method: panel.querySelector("[data-tool-filter-method]"),
      demo: panel.querySelector("[data-tool-filter-demo]"),
      prepared: panel.querySelector("[data-tool-filter-prepared]")
    };

    const valueOf = (control) => (control instanceof HTMLInputElement || control instanceof HTMLSelectElement ? control.value.trim().toLowerCase() : "");
    const checked = (control) => control instanceof HTMLInputElement && control.checked;

    function applyFilters() {
      const search = valueOf(controls.search);
      const cluster = valueOf(controls.cluster);
      const type = valueOf(controls.type);
      const status = valueOf(controls.status);
      const method = valueOf(controls.method);
      const demoOnly = checked(controls.demo);
      const preparedOnly = checked(controls.prepared);

      cards.forEach((card) => {
        if (!(card instanceof HTMLElement)) return;
        const text = (card.dataset.search || card.textContent || "").toLowerCase();
        const matches =
          (!search || text.includes(search)) &&
          (!cluster || (card.dataset.cluster || "").toLowerCase() === cluster) &&
          (!type || (card.dataset.type || "").toLowerCase().includes(type)) &&
          (!status || (card.dataset.status || "").toLowerCase() === status) &&
          (!method || (card.dataset.method || "").toLowerCase() === method) &&
          (!demoOnly || card.dataset.demo === "ja") &&
          (!preparedOnly || card.dataset.prepared === "ja");
        card.hidden = !matches;
      });
    }

    Object.values(controls).forEach((control) => control?.addEventListener("input", applyFilters));
    Object.values(controls).forEach((control) => control?.addEventListener("change", applyFilters));
    panel.dataset.ready = "true";
  }

  function init() {
    document.querySelectorAll("[data-tool-filter]").forEach(initPanel);
  }

  return { init };
})();

const CopyAnswerLayer = (() => {
  function init() {
    document.addEventListener("click", async (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest("[data-copy-text]") : null;
      if (!(button instanceof HTMLButtonElement)) return;

      const text = button.dataset.copyText || "";
      if (!text) return;

      const originalLabel = button.textContent || "Kopieren";
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Kopiert";
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.inset = "-1000px auto auto -1000px";
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        button.textContent = "Kopiert";
      }

      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1600);
    });
  }

  return { init };
})();

const WoekUserSpace = (() => {
  const namespace = "woek_user_space";
  const schemaVersion = 2;
  const exportVersion = 2;
  const recoveryLinkVersion = 1;
  const recoveryHashKey = "wrl";
  const conflictStrategy = "latest_updated_at_wins";
  const recoveryObjectNames = ["saved_items", "reading_progress", "collections", "learning_items", "notes"];
  const objectDefinitions = {
    saved_items: { version: 1, kind: "list" },
    reading_progress: { version: 1, kind: "map" },
    collections: { version: 1, kind: "list" },
    learning_items: { version: 1, kind: "list" },
    notes: { version: 1, kind: "list" },
    visit_history: { version: 1, kind: "list" },
    user_settings: { version: 1, kind: "settings" }
  };
  const legacyKeys = {
    saved_items: "saved_items",
    reading_progress: "woek_reading_progress",
    collections: "woek_collections",
    last_wirkungsraum_visit: "woek_wirkungsraum_last_visit"
  };
  let memoryStore = null;
  let legacyMigrationChecked = false;

  function timestamp() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function deviceId() {
    try {
      if (typeof crypto !== "undefined" && crypto.randomUUID) return `local-${crypto.randomUUID()}`;
    } catch {
      // Fall through to a timestamp based local identifier.
    }
    return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function syncDefaults(sync = {}) {
    return {
      prepared: true,
      enabled: false,
      login_enabled: false,
      server_storage_enabled: false,
      user_id: Object.prototype.hasOwnProperty.call(sync, "user_id") ? sync.user_id : null,
      auth_provider: Object.prototype.hasOwnProperty.call(sync, "auth_provider") ? sync.auth_provider : null,
      device_id: sync.device_id || deviceId(),
      synced_at: Object.prototype.hasOwnProperty.call(sync, "synced_at") ? sync.synced_at : null,
      status: sync.status || "local_only",
      conflict_strategy: sync.conflict_strategy || conflictStrategy,
      conflict_log: Array.isArray(sync.conflict_log) ? sync.conflict_log.slice(-100) : []
    };
  }

  function emptyObject(name) {
    const definition = objectDefinitions[name];
    const base = {
      version: definition.version,
      updated_at: null,
      user_id: null,
      device_id: null,
      synced_at: null,
      sync_status: "local",
      conflicts: []
    };
    if (definition.kind === "map") return { ...base, items: {} };
    if (definition.kind === "settings") return { ...base, data: {} };
    return { ...base, items: [] };
  }

  function emptyStore() {
    const created = timestamp();
    return {
      namespace,
      schema_version: schemaVersion,
      created_at: created,
      updated_at: created,
      local_only: true,
      sync_ready: true,
      server_storage_enabled: false,
      sync: syncDefaults(),
      objects: Object.fromEntries(Object.keys(objectDefinitions).map((name) => [name, emptyObject(name)])),
      export_import: {
        export_version: exportVersion,
        supported_modes: ["replace", "merge"],
        prepared_for_accounts: true,
        login_enabled: false,
        server_storage_enabled: false,
        sync_fields: ["user_id", "auth_provider", "device_id", "synced_at"]
      }
    };
  }

  function parseJson(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function localStorageSafe() {
    try {
      if (typeof window === "undefined" || !window.localStorage) return null;
      const probe = "__woek_user_space_probe__";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch {
      return null;
    }
  }

  function readRawStore() {
    const storage = localStorageSafe();
    if (!storage) return memoryStore || emptyStore();
    return parseJson(storage.getItem(namespace), emptyStore());
  }

  function saveRawStore(store) {
    store.updated_at = timestamp();
    const normalized = normalizeStore(store);
    const storage = localStorageSafe();
    if (!storage) {
      memoryStore = normalized;
      return normalized;
    }
    try {
      storage.setItem(namespace, JSON.stringify(normalized));
    } catch {
      memoryStore = normalized;
    }
    return normalized;
  }

  function normalizeStore(value) {
    const base = value && typeof value === "object" && value.namespace === namespace ? value : emptyStore();
    base.schema_version = Math.max(Number(base.schema_version || 0), schemaVersion);
    base.local_only = true;
    base.sync_ready = true;
    base.server_storage_enabled = false;
    base.sync = syncDefaults(base.sync || {});
    base.objects = base.objects && typeof base.objects === "object" ? base.objects : {};
    for (const [name, definition] of Object.entries(objectDefinitions)) {
      const current = base.objects[name] && typeof base.objects[name] === "object" ? base.objects[name] : {};
      const shell = emptyObject(name);
      current.version = Number(current.version || definition.version);
      current.updated_at = current.updated_at || null;
      current.user_id = Object.prototype.hasOwnProperty.call(current, "user_id") ? current.user_id : base.sync.user_id;
      current.device_id = current.device_id || base.sync.device_id;
      current.synced_at = Object.prototype.hasOwnProperty.call(current, "synced_at") ? current.synced_at : null;
      current.sync_status = current.sync_status || "local";
      current.conflicts = Array.isArray(current.conflicts) ? current.conflicts.slice(-50) : [];
      if (definition.kind === "map") {
        current.items = current.items && !Array.isArray(current.items) && typeof current.items === "object" ? current.items : {};
        current.items = Object.fromEntries(
          Object.entries(current.items).map(([id, item]) => [id, normalizeSyncRecord({ id, ...(item || {}) }, base.sync)])
        );
      } else if (definition.kind === "settings") {
        current.data = current.data && !Array.isArray(current.data) && typeof current.data === "object" ? current.data : {};
      } else {
        current.items = Array.isArray(current.items) ? current.items : [];
        current.items = current.items
          .filter((item) => item && typeof item === "object" && !Array.isArray(item))
          .map((item) => normalizeSyncRecord(item, base.sync));
      }
      base.objects[name] = { ...shell, ...current };
    }
    base.export_import = {
      export_version: exportVersion,
      supported_modes: ["replace", "merge"],
      prepared_for_accounts: true,
      login_enabled: false,
      server_storage_enabled: false,
      sync_fields: ["user_id", "auth_provider", "device_id", "synced_at"],
      ...(base.export_import || {})
    };
    base.export_import.export_version = exportVersion;
    base.export_import.prepared_for_accounts = true;
    base.export_import.login_enabled = false;
    base.export_import.server_storage_enabled = false;
    base.export_import.sync_fields = ["user_id", "auth_provider", "device_id", "synced_at"];
    return base;
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
        .join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function checksumString(value) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function withChecksum(packageData) {
    const unsigned = { ...packageData };
    delete unsigned.checksum;
    return { ...packageData, checksum: checksumString(stableStringify(unsigned)) };
  }

  function verifyChecksum(packageData) {
    if (!packageData || typeof packageData !== "object" || !packageData.checksum) return false;
    return withChecksum(packageData).checksum === packageData.checksum;
  }

  function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeBase64Url(value) {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return new TextDecoder().decode(bytes);
  }

  function normalizeSyncRecord(record, sync = syncDefaults()) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return record;
    return {
      ...record,
      user_id: Object.prototype.hasOwnProperty.call(record, "user_id") ? record.user_id : sync.user_id,
      device_id: record.device_id || sync.device_id || null,
      synced_at: Object.prototype.hasOwnProperty.call(record, "synced_at") ? record.synced_at : null,
      sync_status: record.sync_status || "local"
    };
  }

  function hasEntries(objectName, store) {
    const definition = objectDefinitions[objectName];
    const object = store.objects[objectName];
    if (definition.kind === "settings") return Object.keys(object.data || {}).length > 0;
    if (definition.kind === "map") return Object.keys(object.items || {}).length > 0;
    return Array.isArray(object.items) && object.items.length > 0;
  }

  function readLegacyJson(key, fallback) {
    const storage = localStorageSafe();
    if (!storage) return fallback;
    return parseJson(storage.getItem(key), fallback);
  }

  function migrateLegacyInto(store) {
    if (legacyMigrationChecked || store.legacy_migration_completed) {
      legacyMigrationChecked = true;
      return false;
    }
    legacyMigrationChecked = true;
    const migrated = [];
    const saved = readLegacyJson(legacyKeys.saved_items, []);
    if (!hasEntries("saved_items", store) && Array.isArray(saved) && saved.length) {
      store.objects.saved_items.items = saved;
      store.objects.saved_items.updated_at = timestamp();
      migrated.push(legacyKeys.saved_items);
    }
    const progress = readLegacyJson(legacyKeys.reading_progress, {});
    if (!hasEntries("reading_progress", store) && progress && typeof progress === "object" && !Array.isArray(progress) && Object.keys(progress).length) {
      store.objects.reading_progress.items = progress;
      store.objects.reading_progress.updated_at = timestamp();
      migrated.push(legacyKeys.reading_progress);
    }
    const collections = readLegacyJson(legacyKeys.collections, []);
    if (!hasEntries("collections", store) && Array.isArray(collections) && collections.length) {
      store.objects.collections.items = collections;
      store.objects.collections.updated_at = timestamp();
      migrated.push(legacyKeys.collections);
    }
    const storage = localStorageSafe();
    const lastVisit = storage?.getItem(legacyKeys.last_wirkungsraum_visit);
    if (lastVisit && !store.objects.user_settings.data.last_wirkungsraum_visit) {
      store.objects.user_settings.data.last_wirkungsraum_visit = lastVisit;
      store.objects.user_settings.updated_at = timestamp();
      migrated.push(legacyKeys.last_wirkungsraum_visit);
    }
    if (migrated.length) {
      store.migrated_from = Array.from(new Set([...(store.migrated_from || []), ...migrated]));
    }
    store.legacy_migration_completed = true;
    store.legacy_migration_checked_at = timestamp();
    return true;
  }

  function loadStore() {
    const store = normalizeStore(readRawStore());
    if (migrateLegacyInto(store)) return saveRawStore(store);
    return store;
  }

  function updateStore(mutator) {
    const store = loadStore();
    const result = mutator(store);
    saveRawStore(store);
    return result;
  }

  function touchObject(store, objectName, now = timestamp()) {
    store.objects[objectName].updated_at = now;
    store.objects[objectName].user_id = store.sync.user_id;
    store.objects[objectName].device_id = store.sync.device_id;
    store.objects[objectName].synced_at = null;
    store.objects[objectName].sync_status = "local_changed";
    store.sync.synced_at = null;
    store.sync.status = "local_only";
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 96);
  }

  function getItems(objectName) {
    const object = loadStore().objects[objectName];
    return clone(Array.isArray(object?.items) ? object.items : []);
  }

  function getRecordItems(objectName) {
    const object = loadStore().objects[objectName];
    return clone(object?.items && typeof object.items === "object" && !Array.isArray(object.items) ? object.items : {});
  }

  function getSettings() {
    return clone(loadStore().objects.user_settings.data || {});
  }

  function upsertItem(objectName, item, options = {}) {
    const definition = objectDefinitions[objectName];
    if (!definition || definition.kind === "map" || definition.kind === "settings") return null;
    return updateStore((store) => {
      const object = store.objects[objectName];
      const now = timestamp();
      const id = item.id || normalizeId(item.url || item.title || `${objectName}-${now}`);
      const timestampField = options.timestampField || "updated_at";
      const nextItem = normalizeSyncRecord(
        { ...item, id, [timestampField]: item[timestampField] || now, updated_at: now, synced_at: null, sync_status: "local_changed" },
        store.sync
      );
      object.items = [nextItem, ...object.items.filter((existing) => existing.id !== id)];
      if (options.limit) object.items = object.items.slice(0, options.limit);
      touchObject(store, objectName, now);
      return clone(nextItem);
    });
  }

  function removeItem(objectName, id) {
    return updateStore((store) => {
      const object = store.objects[objectName];
      if (!Array.isArray(object?.items)) return false;
      const before = object.items.length;
      object.items = object.items.filter((item) => item.id !== id);
      if (object.items.length !== before) touchObject(store, objectName);
      return object.items.length !== before;
    });
  }

  function upsertRecord(objectName, id, value) {
    const definition = objectDefinitions[objectName];
    if (!definition || definition.kind !== "map") return null;
    return updateStore((store) => {
      const object = store.objects[objectName];
      const key = String(id || "").trim();
      if (!key) return null;
      const now = timestamp();
      object.items[key] = normalizeSyncRecord({ ...value, id: value.id || key, updated_at: now, synced_at: null, sync_status: "local_changed" }, store.sync);
      touchObject(store, objectName, now);
      return clone(object.items[key]);
    });
  }

  function setSetting(key, value) {
    return updateStore((store) => {
      store.objects.user_settings.data[key] = value;
      store.objects.user_settings.synced_at = null;
      store.objects.user_settings.sync_status = "local_changed";
      touchObject(store, "user_settings");
      return clone(value);
    });
  }

  function getSetting(key, fallback = null) {
    const settings = getSettings();
    return Object.prototype.hasOwnProperty.call(settings, key) ? settings[key] : fallback;
  }

  function addNote(note) {
    return upsertItem(
      "notes",
      {
        ...note,
        id: note.id || normalizeId(`${note.target_url || note.target_id || "note"}-${Date.now()}`),
        created_at: note.created_at || timestamp()
      },
      { limit: 1000 }
    );
  }

  function recordVisit(item) {
    return upsertItem(
      "visit_history",
      {
        ...item,
        id: item.id || normalizeId(item.url || item.title),
        visited_at: timestamp()
      },
      { limit: 500, timestampField: "visited_at" }
    );
  }

  function resetObject(objectName) {
    if (!objectDefinitions[objectName]) return false;
    return updateStore((store) => {
      store.objects[objectName] = {
        ...emptyObject(objectName),
        user_id: store.sync.user_id,
        device_id: store.sync.device_id,
        sync_status: "local_changed"
      };
      touchObject(store, objectName);
      return true;
    });
  }

  function resetAll() {
    const store = emptyStore();
    store.legacy_migration_completed = true;
    store.legacy_migration_checked_at = timestamp();
    saveRawStore(store);
    return true;
  }

  function recordTime(value) {
    if (!value || typeof value !== "object") return 0;
    const candidates = [value.updated_at, value.saved_at, value.visited_at, value.created_at, value.synced_at];
    for (const candidate of candidates) {
      const parsed = Date.parse(candidate || "");
      if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
  }

  function comparableRecord(value) {
    if (!value || typeof value !== "object") return value;
    const copy = { ...value };
    delete copy.sync_status;
    delete copy.synced_at;
    return copy;
  }

  function recordsDiffer(left, right) {
    return JSON.stringify(comparableRecord(left)) !== JSON.stringify(comparableRecord(right));
  }

  function resolveRecordConflict(objectName, id, existing, incoming, store, conflicts) {
    const normalizedIncoming = normalizeSyncRecord({ ...incoming, id: incoming.id || id }, store.sync);
    if (!existing) return normalizedIncoming;
    const normalizedExisting = normalizeSyncRecord(existing, store.sync);
    if (!recordsDiffer(normalizedExisting, normalizedIncoming)) {
      return { ...normalizedExisting, ...normalizedIncoming, sync_status: normalizedExisting.sync_status || "local" };
    }
    const localTime = recordTime(normalizedExisting);
    const incomingTime = recordTime(normalizedIncoming);
    const incomingWins = incomingTime > localTime;
    const winner = incomingWins ? normalizedIncoming : normalizedExisting;
    conflicts.push({
      object: objectName,
      id,
      strategy: conflictStrategy,
      kept: incomingWins ? "import" : "local",
      local_updated_at: normalizedExisting.updated_at || null,
      import_updated_at: normalizedIncoming.updated_at || null,
      detected_at: timestamp()
    });
    if (objectName === "collections") {
      const itemIds = Array.from(new Set([...(normalizedExisting.item_ids || []), ...(normalizedIncoming.item_ids || [])].filter(Boolean)));
      return { ...winner, item_ids: itemIds, sync_status: "conflict_resolved", synced_at: winner.synced_at || null };
    }
    return { ...winner, sync_status: "conflict_resolved", synced_at: winner.synced_at || null };
  }

  function expiryFromOption(expiry = "30") {
    if (expiry === "none") return { expiry: "none", expires_at: null };
    const days = expiry === "7" ? 7 : 30;
    return {
      expiry: String(days),
      expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  function createRecoveryPackage(options = {}) {
    const store = loadStore();
    const now = timestamp();
    const includeNotes = options.includeNotes === true;
    const expiry = expiryFromOption(String(options.expiry || "30"));
    const packageData = {
      format: "woek_user_space_recovery_link",
      namespace,
      version: recoveryLinkVersion,
      created_at: now,
      expires_at: expiry.expires_at,
      expiry: expiry.expiry,
      includes_notes: includeNotes,
      saved_items: clone(store.objects.saved_items.items),
      reading_progress: clone(store.objects.reading_progress.items),
      collections: clone(store.objects.collections.items),
      learning_items: clone(store.objects.learning_items.items)
    };
    if (includeNotes) packageData.notes = clone(store.objects.notes.items);
    return withChecksum(packageData);
  }

  function recoveryPackageToImportPayload(packageData, options = {}) {
    const validation = validateRecoveryPackage(packageData);
    if (!validation.ok) return { ok: false, error: validation.error };
    const objects = {};
    for (const name of recoveryObjectNames) {
      if (packageData[name]) {
        const source = packageData[name];
        if (source && typeof source === "object" && !Array.isArray(source) && (source.items || source.data)) {
          objects[name] = source;
        } else if (objectDefinitions[name]?.kind === "map") {
          objects[name] = { ...emptyObject(name), items: source && typeof source === "object" && !Array.isArray(source) ? source : {} };
        } else {
          objects[name] = { ...emptyObject(name), items: Array.isArray(source) ? source : [] };
        }
      } else if (options.mode === "replace" && name === "notes") {
        objects[name] = emptyObject(name);
      }
    }
    return {
      ok: true,
      payload: {
        format: "woek_user_space_export",
        namespace,
        schema_version: schemaVersion,
        export_version: exportVersion,
        imported_from_recovery_link: true,
        objects
      }
    };
  }

  function validateRecoveryPackage(packageData) {
    if (!packageData || typeof packageData !== "object") return { ok: false, error: "Der Wiederherstellungslink ist ungültig." };
    if (packageData.format !== "woek_user_space_recovery_link" || packageData.namespace !== namespace) {
      return { ok: false, error: "Der Wiederherstellungslink gehört nicht zu Mein Wirkungsraum." };
    }
    if (!verifyChecksum(packageData)) return { ok: false, error: "Der Wiederherstellungslink ist beschädigt." };
    if (packageData.expires_at) {
      const expiry = Date.parse(packageData.expires_at);
      if (Number.isFinite(expiry) && Date.now() > expiry) return { ok: false, error: "Dieser Wiederherstellungslink ist abgelaufen." };
    }
    return { ok: true };
  }

  function encodeRecoveryPackage(packageData) {
    return encodeBase64Url(JSON.stringify(packageData));
  }

  function decodeRecoveryPackage(value) {
    try {
      const packageData = JSON.parse(decodeBase64Url(value));
      const validation = validateRecoveryPackage(packageData);
      if (!validation.ok) return { ok: false, error: validation.error };
      return { ok: true, package: packageData };
    } catch {
      return { ok: false, error: "Der Wiederherstellungslink kann nicht gelesen werden." };
    }
  }

  function recoveryPackageFromHash(hashValue) {
    const hash = String(hashValue || "").replace(/^#/, "");
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const encoded = params.get(recoveryHashKey) || params.get("wirkungsraum-link");
    return encoded ? decodeRecoveryPackage(encoded) : null;
  }

  function exportData() {
    const store = loadStore();
    return {
      format: "woek_user_space_export",
      export_version: exportVersion,
      namespace,
      schema_version: store.schema_version,
      exported_at: timestamp(),
      local_only: true,
      sync_ready: true,
      server_storage_enabled: false,
      sync: clone(store.sync),
      objects: clone(store.objects)
    };
  }

  function importData(payload, options = {}) {
    const mode = options.mode === "replace" ? "replace" : "merge";
    let normalizedPayload = payload;
    if (payload?.format === "woek_user_space_recovery_link") {
      const recovery = recoveryPackageToImportPayload(payload, { mode });
      if (!recovery.ok) return { ok: false, imported: [], error: recovery.error };
      normalizedPayload = recovery.payload;
    }
    const incoming = normalizedPayload?.objects ? normalizedPayload.objects : normalizedPayload?.data?.objects ? normalizedPayload.data.objects : null;
    if (!incoming || typeof incoming !== "object") {
      return { ok: false, imported: [], error: "Ungültige Importstruktur." };
    }
    const imported = [];
    const conflicts = [];
    updateStore((store) => {
      for (const [name, definition] of Object.entries(objectDefinitions)) {
        if (!incoming[name]) continue;
        const source = incoming[name];
        if (mode === "replace") {
          store.objects[name] = normalizeStore({ namespace, sync: store.sync, objects: { [name]: source } }).objects[name];
          touchObject(store, name);
          imported.push(name);
          continue;
        }
        if (definition.kind === "map") {
          const sourceItems = source.items && typeof source.items === "object" && !Array.isArray(source.items) ? source.items : {};
          for (const [id, item] of Object.entries(sourceItems)) {
            store.objects[name].items[id] = resolveRecordConflict(name, id, store.objects[name].items[id], item, store, conflicts);
          }
        } else if (definition.kind === "settings") {
          const sourceData = source.data && typeof source.data === "object" && !Array.isArray(source.data) ? source.data : {};
          for (const [key, value] of Object.entries(sourceData)) {
            if (
              Object.prototype.hasOwnProperty.call(store.objects[name].data, key) &&
              JSON.stringify(store.objects[name].data[key]) !== JSON.stringify(value)
            ) {
              conflicts.push({
                object: name,
                id: key,
                strategy: "import_setting_overwrites_local",
                kept: "import",
                detected_at: timestamp()
              });
            }
            store.objects[name].data[key] = value;
          }
        } else {
          const byId = new Map(store.objects[name].items.map((item) => [item.id, item]));
          for (const item of Array.isArray(source.items) ? source.items : []) {
            const id = item.id || normalizeId(item.url || item.title);
            byId.set(id, resolveRecordConflict(name, id, byId.get(id), item, store, conflicts));
          }
          store.objects[name].items = Array.from(byId.values());
        }
        touchObject(store, name);
        imported.push(name);
      }
      store.last_import_at = timestamp();
      if (conflicts.length) {
        store.sync.conflict_log = [...(store.sync.conflict_log || []), ...conflicts].slice(-100);
      }
    });
    return { ok: true, mode, imported, conflicts };
  }

  function syncInfo() {
    return clone(loadStore().sync);
  }

  function prepareSyncPayload() {
    const payload = exportData();
    return {
      ...payload,
      sync_transport_enabled: false,
      login_enabled: false,
      message: "Dieses Paket ist serverfähig strukturiert, wird aber ohne Login nicht an einen Server übertragen."
    };
  }

  function snapshot() {
    return clone(loadStore());
  }

  const api = {
    namespace,
    schemaVersion,
    objectDefinitions: clone(objectDefinitions),
    snapshot,
    exportData,
    importData,
    syncInfo,
    prepareSyncPayload,
    createRecoveryPackage,
    encodeRecoveryPackage,
    decodeRecoveryPackage,
    recoveryPackageFromHash,
    validateRecoveryPackage,
    getItems,
    getRecordItems,
    getSettings,
    getSetting,
    setSetting,
    upsertItem,
    removeItem,
    upsertRecord,
    addNote,
    recordVisit,
    resetObject,
    resetAll
  };

  window.WoekUserSpace = api;
  return api;
})();

const WirkungsraumLayer = (() => {
  const relevantPathPattern =
    /\/(begriffe|glossar|referenz|buch|bibliothek|wirkungsradar|oeffentlicher-wirkungsraum|downloads|dokumente|werkzeuge|tools|akademie|wirkungsfelder|wirkungssteuerung|blog|journal|portale|werkstatt|wissen|evidenz|fuer|erleben|so-wirkt-wirkungsoekonomie|ordnung|verstehen|sdg-plus|vergleichen|modell)\b|\/(akademie|buch|downloads|glossar|kompass|verstehen|modell|wirkungsoekonomie|anwendungen|erleben|blog|mehr|ueber|natalie-weber)\.html$/;
  const progressScopePattern =
    /\/(referenz|buch|dokumente|downloads|bibliothek|akademie|portale|oeffentlicher-wirkungsraum)\b|\/(buch|akademie|downloads)\.html$/;
  const excludedPathPattern = /\/(datenschutz|impressum|mein-wirkungsraum|admin|api|_internal|_debug)\b|\/(datenschutz|impressum)\.html$/;
  const noteScopePattern =
    /\/(begriffe|glossar|referenz|buch|bibliothek|wirkungsradar|oeffentlicher-wirkungsraum|downloads|dokumente|werkzeuge|tools|akademie|wirkungsfelder|wirkungssteuerung|blog|journal|portale|werkstatt|wissen|fuer|erleben|so-wirkt-wirkungsoekonomie|ordnung|verstehen|sdg-plus|vergleichen|modell)\b|\/(akademie|buch|downloads|glossar|kompass|verstehen|modell|wirkungsoekonomie|anwendungen|erleben|blog|mehr|ueber|natalie-weber)\.html$/;

  function canonicalPath() {
    return window.location.pathname.replace(/\/index\.html$/, "/");
  }

  function pageTitle() {
    const h1 = document.querySelector("h1");
    const raw = h1?.textContent || document.title || "Wirkungsökonomie";
    return raw.replace(/\s+/g, " ").replace(/\s+\|\s+.*$/, "").trim();
  }

  function pageType(path = window.location.pathname) {
    if (path.includes("/wirkungsradar/")) return "Debatte";
    if (path.includes("/begriffe/") || path.includes("/glossar")) return "Begriff";
    if (path.includes("/referenz/") || path.includes("/buch")) return "Kapitel";
    if (path.includes("/oeffentlicher-wirkungsraum/")) return "Dossier";
    if (path.includes("/dossiers/") || path.includes("/portale/")) return "Dossier";
    if (path.includes("/bibliothek/") || path.includes("/downloads") || path.includes("/dokumente") || path.includes("/werkstatt/") || path.includes("/wissen/")) return "Dokument";
    if (path.includes("/werkzeuge/") || path.includes("/tools/")) return "Werkzeug";
    if (path.includes("/akademie")) return "Akademie";
    if (path.includes("/wirkungsfelder/")) return "Wirkungsfeld";
    if (path.includes("/wirkungssteuerung/")) return "Wirkungssteuerung";
    if (path.includes("/blog") || path.includes("/journal")) return "Journal";
    return "Inhalt";
  }

  function hasPublicContentSurface() {
    const main = document.querySelector("main");
    if (!main || main.closest("[data-search-exclude]")) return false;
    if (document.body?.dataset?.wirkungsraumExclude === "true") return false;
    return Boolean(main.querySelector("h1"));
  }

  function isContentPath(path = window.location.pathname) {
    if (excludedPathPattern.test(path)) return false;
    if (relevantPathPattern.test(path)) return true;
    if (!hasPublicContentSurface()) return false;
    const normalized = path.replace(/\/index\.html$/, "/");
    if (normalized === "/") return true;
    return normalized.endsWith("/") || normalized.endsWith(".html");
  }

  function pageTags() {
    const tags = new Set();
    document.querySelectorAll(".hero-kicker, .card-kicker, .chip, [data-tag]").forEach((node) => {
      const text = (node.textContent || node.getAttribute("data-tag") || "").replace(/\s+/g, " ").trim();
      if (text && text.length <= 42) tags.add(text);
    });
    return Array.from(tags).slice(0, 8);
  }

  function isProgressPath(path) {
    return (
      progressScopePattern.test(path) ||
      /\/dossiers?\//.test(path) ||
      /\/werkstatt\/arbeitsbibliothek\//.test(path) ||
      /\/wissen\/working-papers\//.test(path)
    );
  }

  function normalizedProgress(value) {
    const progress = Number(value);
    if (!Number.isFinite(progress)) return 0;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  function readingStatus(progress) {
    const percent = normalizedProgress(progress);
    if (percent >= 85) return "gelesen";
    if (percent > 0) return "begonnen";
    return "ungelesen";
  }

  function statusSymbol(status) {
    if (status === "gelesen") return "●";
    if (status === "begonnen") return "◐";
    return "○";
  }

  function statusLabel(status) {
    if (status === "gelesen") return "gelesen";
    if (status === "begonnen") return "begonnen";
    return "ungelesen";
  }

  function itemStatus(item) {
    if (["ungelesen", "begonnen", "gelesen"].includes(item?.status)) return item.status;
    return readingStatus(item?.progress);
  }

  function currentItem() {
    const url = canonicalPath();
    return {
      id: url.replace(/^\/+/, "") || "start",
      type: pageType(),
      title: pageTitle(),
      url,
      saved_at: new Date().toISOString(),
      tags: pageTags(),
      category: document.querySelector(".breadcrumb a:last-of-type, .hero-kicker")?.textContent?.trim() || pageType()
    };
  }

  function actionTarget() {
    const actions = document.querySelector(".hero-actions");
    if (actions) return { container: actions, panelAfter: actions };

    const termActions = document.querySelector(".glossary-detail .term-detail-hero .term-action-row");
    if (termActions) return { container: termActions, panelAfter: termActions };

    let row = document.querySelector("[data-wirkungsraum-actions-row]");
    if (row) return { container: row, panelAfter: row };

    row = document.createElement("p");
    row.className = "wirkungsraum-save-row";
    row.dataset.wirkungsraumActionsRow = "true";

    const heroCopy = document.querySelector(
      ".hero-copy, .radar-hero-copy, .radar-page-hero > div, .term-hero__copy, .document-detail-hero, .portal-hero__copy, .hero-content, .section-header"
    );
    if (heroCopy) {
      heroCopy.append(row);
      return { container: row, panelAfter: row };
    }

    const hero = document.querySelector(".hero, .radar-hero, .page-hero, .term-hero, .compact-hero, .document-detail-hero, .portal-hero");
    if (hero) {
      hero.append(row);
      return { container: row, panelAfter: row };
    }

    const main = document.querySelector("main");
    if (main) {
      const firstSection = main.querySelector(".section, .content-band, article");
      main.insertBefore(row, firstSection || main.firstChild);
      return { container: row, panelAfter: row };
    }

    return null;
  }

  function progressRecord(path = window.location.pathname) {
    const url = canonicalPath();
    const progress = progressPercent();
    const status = readingStatus(progress);
    const now = new Date().toISOString();
    return {
      id: url.replace(/^\/+/, "") || "start",
      title: pageTitle(),
      type: pageType(path),
      url,
      category: document.querySelector(".breadcrumb a:last-of-type, .hero-kicker")?.textContent?.trim() || pageType(path),
      tags: pageTags(),
      scroll_position: Math.round(window.scrollY),
      progress,
      status,
      status_symbol: statusSymbol(status),
      last_read_at: now,
      updated_at: now
    };
  }

  function savedItems() {
    const items = WoekUserSpace.getItems("saved_items");
    return Array.isArray(items) ? items : [];
  }

  const knowledgeGraphConfig = {
    nodeTypes: ["Begriff", "Kapitel", "Dokument", "Werkzeug", "Debatte", "Akademie-Modul"],
    relationTypes: ["erklärt", "vertieft", "verwendet", "gehört zu", "baut auf", "widerspricht", "ergänzt"],
    searchIndexUrl: "/assets/search/search-index.json",
    relationshipManifestUrl: "/public/data/relationship-manifest.json",
    maxSources: 24,
    maxRelatedCards: 12
  };

  const graphStopWords = new Set([
    "und",
    "oder",
    "der",
    "die",
    "das",
    "ein",
    "eine",
    "einer",
    "eines",
    "mit",
    "fuer",
    "für",
    "von",
    "zur",
    "zum",
    "auf",
    "als",
    "wie",
    "was",
    "warum",
    "wird",
    "sind",
    "ist",
    "seite",
    "inhalt",
    "online",
    "wirkungsradar",
    "wirkungsoekonomie",
    "wirkungsökonomie",
    "woek",
    "wök"
  ]);

  let knowledgeCatalogPromise = null;
  let recentContentPromise = null;
  let relatedRenderRun = 0;

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || typeof value === "undefined") return [];
    return [value];
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function uniqueStrings(values, limit = 24) {
    const seen = new Set();
    const result = [];
    values.flatMap(toArray).forEach((value) => {
      const text = cleanText(typeof value === "object" ? value?.label || value?.title || value?.name || value?.id || value?.slug || "" : value);
      if (!text) return;
      const key = text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      result.push(text);
    });
    return result.slice(0, limit);
  }

  function graphSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " und ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function graphPath(value) {
    try {
      const raw = String(value || "").trim();
      if (!raw) return "";
      const url = new URL(raw, window.location.origin);
      if (url.origin !== window.location.origin) return "";
      const path = url.pathname.replace(/\/index\.html$/, "/");
      return path.length > 1 ? path.replace(/\/$/, "") : path;
    } catch {
      return "";
    }
  }

  function isKnowledgeHubPath(path) {
    const normalized = graphPath(path);
    return [
      "/",
      "/akademie",
      "/begriffe",
      "/bibliothek",
      "/mein-wirkungsraum",
      "/referenz",
      "/suche",
      "/werkzeuge",
      "/wirkungsradar",
      "/wirkungsradar/detail",
      "/wirkungsradar/live",
      "/wirkungsradar/narrative",
      "/wirkungsradar/themen"
    ].includes(normalized);
  }

  function graphTokens(values, limit = 36) {
    const tokens = new Set();
    values.flatMap(toArray).forEach((value) => {
      cleanText(typeof value === "object" ? value?.label || value?.title || value?.name || value?.id || value?.slug || "" : value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9äöüß]+/i)
        .map((part) => part.trim())
        .filter((part) => part.length >= 3 && !graphStopWords.has(part))
        .forEach((part) => tokens.add(part));
    });
    return Array.from(tokens).slice(0, limit);
  }

  function nodeTypeFromEntry(entry = {}) {
    const text = [entry.type, entry.section, entry.url, entry.format].join(" ").toLowerCase();
    if (text.includes("begriff") || text.includes("glossar")) return "Begriff";
    if (text.includes("referenz") || text.includes("kapitel") || text.includes("/buch")) return "Kapitel";
    if (text.includes("werkzeug") || text.includes("tool") || text.includes("scanner") || text.includes("rechner")) return "Werkzeug";
    if (text.includes("wirkungsradar") || text.includes("debatten-kompass") || text.includes("/wirkungsradar/")) return "Debatte";
    if (text.includes("akademie")) return "Akademie-Modul";
    return "Dokument";
  }

  function knowledgeNodeFromEntry(entry = {}) {
    const url = graphPath(entry.url);
    if (!url || !entry.title || isKnowledgeHubPath(url)) return null;
    const type = nodeTypeFromEntry(entry);
    const tags = uniqueStrings([entry.tags, entry.aliases, entry.standards, entry.instruments, entry.impactSpaces, entry.section], 18);
    const id = entry.id || url.replace(/^\/+/, "") || graphSlug(entry.title);
    return {
      id,
      type,
      title: cleanText(entry.title),
      url,
      category: cleanText(entry.section || entry.category || type),
      description: cleanText(entry.description || "").slice(0, 220),
      tags,
      priority: Number(entry.priority || 0),
      slug: graphSlug(url.split("/").filter(Boolean).pop() || entry.title),
      titleSlug: graphSlug(entry.title),
      tokens: graphTokens([entry.title, entry.description, tags, entry.type, entry.section, entry.format], 42)
    };
  }

  function knowledgeNodeFromUserItem(item = {}) {
    const url = graphPath(item.url || "/");
    const type = knowledgeGraphConfig.nodeTypes.includes(item.type) ? item.type : nodeTypeFromEntry(item);
    const tags = uniqueStrings([item.tags, item.category, item.type], 18);
    return {
      id: item.id || url.replace(/^\/+/, "") || graphSlug(item.title),
      type,
      title: cleanText(item.title || "Gemerkter Inhalt"),
      url,
      category: cleanText(item.category || type),
      description: cleanText(item.description || ""),
      tags,
      priority: 0,
      slug: graphSlug((url || "").split("/").filter(Boolean).pop() || item.title),
      titleSlug: graphSlug(item.title),
      tokens: graphTokens([item.title, item.category, item.type, tags], 42)
    };
  }

  async function fetchJson(path, fallback) {
    try {
      const response = await fetch(new URL(path, window.location.origin).href, { credentials: "same-origin" });
      if (!response.ok) return fallback;
      return await response.json();
    } catch {
      return fallback;
    }
  }

  async function knowledgeCatalog() {
    if (!knowledgeCatalogPromise) {
      knowledgeCatalogPromise = Promise.all([
        fetchJson(knowledgeGraphConfig.searchIndexUrl, []),
        fetchJson(knowledgeGraphConfig.relationshipManifestUrl, { relationships: {} })
      ]).then(([searchIndex, relationshipManifest]) => {
        const nodes = Array.isArray(searchIndex) ? searchIndex.map(knowledgeNodeFromEntry).filter(Boolean) : [];
        const byPath = new Map();
        const byId = new Map();
        const bySlug = new Map();
        const tokenIndex = new Map();
        nodes.forEach((node) => {
          if (!byPath.has(node.url)) byPath.set(node.url, node);
          if (node.id && !byId.has(node.id)) byId.set(node.id, node);
          [node.slug, node.titleSlug, graphSlug(node.id)].filter(Boolean).forEach((slug) => {
            if (!bySlug.has(slug)) bySlug.set(slug, node);
          });
          node.tokens.slice(0, 32).forEach((token) => {
            const bucket = tokenIndex.get(token) || [];
            if (bucket.length < 80) bucket.push(node);
            tokenIndex.set(token, bucket);
          });
        });
        return {
          generatedAt: new Date().toISOString(),
          nodeTypes: knowledgeGraphConfig.nodeTypes,
          relationTypes: knowledgeGraphConfig.relationTypes,
          nodes,
          byPath,
          byId,
          bySlug,
          tokenIndex,
          relationships: relationshipManifest?.relationships || {}
        };
      });
    }
    return knowledgeCatalogPromise;
  }

  function relationTargetLabel(value) {
    const label = value && typeof value === "object" ? cleanText(value.label || value.title || value.name || value.id || value.slug || value.href) : cleanText(value);
    return label === "[object Object]" ? "" : label;
  }

  function relationTargetHref(value) {
    if (value && typeof value === "object") return value.href || value.url || "";
    const text = cleanText(value);
    if (text.startsWith("/") || text.startsWith("http")) return text;
    return "";
  }

  function resolveKnowledgeTarget(catalog, value, fallbackType = "Dokument") {
    const href = relationTargetHref(value);
    const label = relationTargetLabel(value);
    const hrefPath = graphPath(href);
    if (!hrefPath && !label) return null;
    if (hrefPath && isKnowledgeHubPath(hrefPath)) return null;
    if (hrefPath && catalog.byPath.has(hrefPath)) return catalog.byPath.get(hrefPath);
    const slug = graphSlug(label);
    const direct = catalog.byId.get(label) || catalog.bySlug.get(slug);
    if (direct) return direct;
    if (hrefPath) {
      return {
        id: hrefPath.replace(/^\/+/, ""),
        type: fallbackType,
        title: label || hrefPath.split("/").filter(Boolean).pop(),
        url: hrefPath,
        category: fallbackType,
        description: "",
        tags: [],
        priority: 0,
        slug: graphSlug(hrefPath.split("/").filter(Boolean).pop() || label),
        titleSlug: graphSlug(label),
        tokens: graphTokens([label, fallbackType])
      };
    }
    if (fallbackType === "Begriff" && slug) {
      return catalog.byPath.get(`/begriffe/${slug}`) || {
        id: `begriff-${slug}`,
        type: "Begriff",
        title: label,
        url: `/begriffe/${slug}/`,
        category: "Begriffe",
        description: "",
        tags: [],
        priority: 0,
        slug,
        titleSlug: slug,
        tokens: graphTokens([label, "Begriff"])
      };
    }
    return null;
  }

  function relationForTarget(source, target, preferred = "") {
    if (knowledgeGraphConfig.relationTypes.includes(preferred)) return preferred;
    if (target.type === "Begriff") return "erklärt";
    if (target.type === "Kapitel" || target.type === "Dokument") return "vertieft";
    if (target.type === "Werkzeug") return "verwendet";
    if (target.type === "Akademie-Modul") return "baut auf";
    if (source.category && target.category && source.category === target.category) return "gehört zu";
    const text = `${target.title} ${target.category}`.toLowerCase();
    if (/(gegen|kritik|widerspruch|problem|risiko)/.test(text)) return "widerspricht";
    return "ergänzt";
  }

  function addKnowledgeCandidate(map, source, target, relation, score, reason) {
    if (!target?.url || source.url === target.url) return;
    const key = target.url;
    const existing = map.get(key);
    const nextScore = Number(score || 0);
    if (existing && existing.score >= nextScore) return;
    map.set(key, {
      ...target,
      relation: relationForTarget(source, target, relation),
      sourceTitle: source.title,
      sourceType: source.type,
      score: nextScore,
      reason: cleanText(reason)
    });
  }

  function relationshipSlugsForSource(source) {
    return uniqueStrings([source.slug, source.titleSlug, source.tags.map(graphSlug), source.tokens], 18)
      .map(graphSlug)
      .filter(Boolean);
  }

  function addExplicitKnowledgeCandidates(catalog, source, candidates) {
    relationshipSlugsForSource(source).forEach((slug) => {
      const relations = catalog.relationships[slug];
      if (!relations) return;
      toArray(relations.terms)
        .slice(0, 10)
        .forEach((target) => {
          const node = resolveKnowledgeTarget(catalog, target, "Begriff");
          addKnowledgeCandidate(candidates, source, node, "erklärt", 90, "Begriff aus dem Wissensnetz");
        });
      toArray(relations.documents)
        .slice(0, 8)
        .forEach((target) => {
          const node = resolveKnowledgeTarget(catalog, target, "Dokument");
          addKnowledgeCandidate(candidates, source, node, "vertieft", 82, "Dokument vertieft das gemerkte Thema");
        });
      toArray(relations.tools)
        .slice(0, 6)
        .forEach((target) => {
          const node = resolveKnowledgeTarget(catalog, target, "Werkzeug");
          addKnowledgeCandidate(candidates, source, node, "verwendet", 78, "Werkzeug wendet das Thema an");
        });
      toArray(relations.methods)
        .slice(0, 6)
        .forEach((target) => {
          const node = resolveKnowledgeTarget(catalog, target, "Werkzeug");
          addKnowledgeCandidate(candidates, source, node, "verwendet", 74, "Methode passt zum gemerkten Thema");
        });
      toArray(relations.academyModules)
        .slice(0, 4)
        .forEach((target) => {
          const node = resolveKnowledgeTarget(catalog, target, "Akademie-Modul");
          addKnowledgeCandidate(candidates, source, node, "baut auf", 72, "Lernmodul baut auf dem Thema auf");
        });
      toArray(relations.impactFields)
        .slice(0, 6)
        .forEach((target) => {
          const node = resolveKnowledgeTarget(catalog, target, "Dokument");
          addKnowledgeCandidate(candidates, source, node, "gehört zu", 68, "Gehört zum selben Wirkungsfeld");
        });
    });
  }

  function addTokenKnowledgeCandidates(catalog, source, candidates, savedPaths) {
    const touched = new Set();
    source.tokens.slice(0, 18).forEach((token) => {
      (catalog.tokenIndex.get(token) || []).forEach((node) => {
        if (touched.has(node.url) || savedPaths.has(node.url)) return;
        touched.add(node.url);
        const shared = node.tokens.filter((candidateToken) => source.tokens.includes(candidateToken)).slice(0, 5);
        if (!shared.length) return;
        const categoryBoost = source.category && node.category && source.category === node.category ? 10 : 0;
        const typeBoost = source.type !== node.type ? 6 : 0;
        const score = 28 + shared.length * 7 + categoryBoost + typeBoost + Math.min(12, node.priority / 12);
        const reason = shared.length ? `Gemeinsame Begriffe: ${shared.slice(0, 3).join(", ")}` : "Thematische Nähe";
        addKnowledgeCandidate(candidates, source, node, "", score, reason);
      });
    });
  }

  async function relatedKnowledgeForSaved(saved) {
    const catalog = await knowledgeCatalog();
    const savedPaths = new Set(saved.map((item) => graphPath(item.url)).filter(Boolean));
    const sources = saved.slice(0, knowledgeGraphConfig.maxSources).map(knowledgeNodeFromUserItem);
    const candidates = new Map();
    sources.forEach((source) => {
      addExplicitKnowledgeCandidates(catalog, source, candidates);
      addTokenKnowledgeCandidates(catalog, source, candidates, savedPaths);
    });
    const sorted = Array.from(candidates.values())
      .filter((item) => !savedPaths.has(item.url))
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"));
    const balanced = [];
    const typeCounts = new Map();
    sorted.forEach((item) => {
      if (balanced.length >= knowledgeGraphConfig.maxRelatedCards) return;
      const count = typeCounts.get(item.type) || 0;
      if (count >= 4 && sorted.length > knowledgeGraphConfig.maxRelatedCards) return;
      balanced.push(item);
      typeCounts.set(item.type, count + 1);
    });
    return {
      graph: {
        nodeTypes: knowledgeGraphConfig.nodeTypes,
        relationTypes: knowledgeGraphConfig.relationTypes,
        nodes: [...sources, ...balanced],
        edges: balanced.map((target) => ({
          from: graphSlug(target.sourceTitle),
          to: target.id,
          relation: target.relation
        }))
      },
      related: balanced
    };
  }

  function notes() {
    const items = WoekUserSpace.getItems("notes");
    return Array.isArray(items)
      ? items
          .filter((item) => item && typeof item === "object" && String(item.content || "").trim())
          .map((item) => ({
            ...item,
            content: String(item.content || "").trim(),
            tags: Array.isArray(item.tags) ? item.tags : [],
            updated_at: item.updated_at || item.created_at || null,
            created_at: item.created_at || item.updated_at || null
          }))
          .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
      : [];
  }

  function noteIdForItem(item) {
    return `note-${String(item?.id || item?.url || "inhalt").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "inhalt"}`;
  }

  function noteForItem(item = currentItem()) {
    const id = noteIdForItem(item);
    return notes().find((note) => note.id === id || note.target_id === item.id || note.target_url === item.url) || null;
  }

  function noteRecord(item, content) {
    const existing = noteForItem(item);
    const now = new Date().toISOString();
    return {
      id: noteIdForItem(item),
      target_id: item.id,
      target_url: item.url,
      target_title: item.title,
      target_type: item.type,
      target_category: item.category,
      tags: Array.isArray(item.tags) ? item.tags : [],
      content: String(content || "").trim(),
      local_only: true,
      created_at: existing?.created_at || now,
      updated_at: now
    };
  }

  function saveNoteForItem(item, content) {
    const note = noteRecord(item, content);
    if (!note.content) return null;
    const stored = WoekUserSpace.upsertItem("notes", note, { limit: 1000, timestampField: "updated_at" });
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
    return stored;
  }

  function removeNote(id) {
    WoekUserSpace.removeItem("notes", id);
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  const learningStatuses = {
    offen: "offen",
    in_arbeit: "in Arbeit",
    verstanden: "verstanden",
    wiederholen: "wiederholen"
  };

  const learningStatusScores = {
    offen: 0,
    in_arbeit: 50,
    wiederholen: 70,
    verstanden: 100
  };

  const academyParts = [
    { id: "teil-1", label: "Teil I", title: "Grundverständnis", href: "/akademie.html#studienstruktur", keywords: ["teil 1", "teil i", "g1.", "zp1", "grundverständnis", "grundverstaendnis"] },
    { id: "teil-2", label: "Teil II", title: "Wirkungskompetenz", href: "/akademie.html#studienstruktur", keywords: ["teil 2", "teil ii", "g2.", "zp2", "wirkungskompetenz"] },
    { id: "teil-3", label: "Teil III", title: "Maßstab und Bewertung", href: "/akademie.html#studienstruktur", keywords: ["teil 3", "teil iii", "g3.", "zp3", "maßstab", "massstab", "bewertung"] },
    { id: "teil-4", label: "Teil IV", title: "Steuerung und Rückkopplung", href: "/akademie.html#studienstruktur", keywords: ["teil 4", "teil iv", "g4.", "zp4", "steuerung", "rückkopplung", "rueckkopplung"] },
    { id: "teil-5", label: "Teil V", title: "Anwendung", href: "/akademie.html#studienstruktur", keywords: ["teil 5", "teil v", "g5.", "zp5", "anwendung"] },
    { id: "teil-6", label: "Teil VI", title: "Transformation und Systemdesign", href: "/akademie.html#studienstruktur", keywords: ["teil 6", "teil vi", "g6.", "zp6", "transformation", "systemdesign"] },
    { id: "teil-7", label: "Teil VII", title: "Praxisprojekt und Abschluss", href: "/akademie.html#studienstruktur", keywords: ["teil 7", "teil vii", "g7.", "zp7", "praxisprojekt", "abschluss"] }
  ];

  function normalizeLearningStatus(status) {
    return Object.prototype.hasOwnProperty.call(learningStatuses, status) ? status : "offen";
  }

  function learningStatusLabel(status) {
    return learningStatuses[normalizeLearningStatus(status)];
  }

  function learningItems() {
    const items = WoekUserSpace.getItems("learning_items");
    return Array.isArray(items)
      ? items
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            ...item,
            learning_status: normalizeLearningStatus(item.learning_status),
            tags: Array.isArray(item.tags) ? item.tags : [],
            added_at: item.added_at || item.created_at || item.updated_at || new Date().toISOString(),
            updated_at: item.updated_at || item.added_at || null
          }))
          .sort((a, b) => new Date(b.updated_at || b.added_at || 0) - new Date(a.updated_at || a.added_at || 0))
      : [];
  }

  function learningItemById(id) {
    return learningItems().find((item) => item.id === id) || null;
  }

  function isLearningItem(id) {
    return Boolean(learningItemById(id));
  }

  function inferAcademyPart(item) {
    if (item?.part_id) return academyParts.find((part) => part.id === item.part_id) || null;
    const text = [item?.title, item?.url, item?.category, ...(Array.isArray(item?.tags) ? item.tags : [])]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return academyParts.find((part) => part.keywords.some((keyword) => text.includes(keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) || null;
  }

  function learningItemFromPage(status = "offen") {
    const item = currentItem();
    const part = inferAcademyPart(item);
    return {
      ...item,
      learning_status: normalizeLearningStatus(status),
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      part_id: part?.id || "",
      part_label: part?.label || ""
    };
  }

  function upsertLearningItem(item, notify = true) {
    if (!item?.id) return null;
    const existing = learningItemById(item.id);
    const normalizedStatus = normalizeLearningStatus(item.learning_status || existing?.learning_status);
    const part = inferAcademyPart(item) || inferAcademyPart(existing);
    const next = {
      ...existing,
      ...item,
      learning_status: normalizedStatus,
      added_at: existing?.added_at || item.added_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      part_id: item.part_id || existing?.part_id || part?.id || "",
      part_label: item.part_label || existing?.part_label || part?.label || ""
    };
    const stored = WoekUserSpace.upsertItem("learning_items", next, { limit: 300, timestampField: "updated_at" });
    if (notify) document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
    return stored;
  }

  function removeLearningItem(id) {
    WoekUserSpace.removeItem("learning_items", id);
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function updateLearningStatus(id, status) {
    const item = learningItemById(id);
    if (!item) return null;
    return upsertLearningItem({ ...item, learning_status: normalizeLearningStatus(status) });
  }

  function learningButtonLabel(button, active) {
    button.textContent = active ? "✓ In Lernliste" : "Zur Lernliste hinzufügen";
    button.setAttribute("aria-pressed", String(active));
  }

  function collectionSlug(value) {
    const slug = String(value || "sammlung")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
    return slug || "sammlung";
  }

  function collectionId(title) {
    return `collection-${Date.now()}-${collectionSlug(title)}`;
  }

  function normalizedCollection(collection) {
    if (!collection || typeof collection !== "object") return null;
    const title = String(collection.title || "").replace(/\s+/g, " ").trim() || "Unbenannte Sammlung";
    const now = new Date().toISOString();
    const itemIds = Array.from(
      new Set(Array.isArray(collection.item_ids) ? collection.item_ids.filter(Boolean).map((id) => String(id)) : [])
    );
    return {
      id: collection.id || collectionId(title),
      title,
      description: String(collection.description || "").replace(/\s+/g, " ").trim(),
      created_at: collection.created_at || collection.updated_at || now,
      updated_at: collection.updated_at || collection.created_at || now,
      item_ids: itemIds
    };
  }

  function collections() {
    const items = WoekUserSpace.getItems("collections");
    return Array.isArray(items)
      ? items
          .map(normalizedCollection)
          .filter(Boolean)
          .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))
      : [];
  }

  function findCollection(id) {
    return collections().find((collection) => collection.id === id) || null;
  }

  function upsertCollection(collection, notify = true) {
    const normalized = normalizedCollection({ ...collection, updated_at: collection.updated_at || new Date().toISOString() });
    if (!normalized) return null;
    WoekUserSpace.upsertItem("collections", normalized, { limit: 80, timestampField: "updated_at" });
    if (notify) document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
    return normalized;
  }

  function createCollection(title, description = "", notify = true) {
    const trimmedTitle = String(title || "").replace(/\s+/g, " ").trim();
    if (!trimmedTitle) return null;
    const existing = collections().find((collection) => collection.title.toLowerCase() === trimmedTitle.toLowerCase());
    if (existing) {
      const trimmedDescription = String(description || "").replace(/\s+/g, " ").trim();
      if (trimmedDescription && !existing.description) return updateCollection(existing.id, { description: trimmedDescription }, notify);
      return existing;
    }
    const now = new Date().toISOString();
    return upsertCollection(
      {
        id: collectionId(trimmedTitle),
        title: trimmedTitle,
        description: String(description || "").replace(/\s+/g, " ").trim(),
        created_at: now,
        updated_at: now,
        item_ids: []
      },
      notify
    );
  }

  function updateCollection(id, patch = {}, notify = true) {
    const collection = findCollection(id);
    if (!collection) return null;
    const title = Object.prototype.hasOwnProperty.call(patch, "title")
      ? String(patch.title || "").replace(/\s+/g, " ").trim()
      : collection.title;
    if (!title) return null;
    const itemIds = Object.prototype.hasOwnProperty.call(patch, "item_ids")
      ? Array.from(new Set((Array.isArray(patch.item_ids) ? patch.item_ids : []).filter(Boolean).map((itemId) => String(itemId))))
      : collection.item_ids;
    return upsertCollection(
      {
        ...collection,
        ...patch,
        title,
        description: Object.prototype.hasOwnProperty.call(patch, "description")
          ? String(patch.description || "").replace(/\s+/g, " ").trim()
          : collection.description,
        item_ids: itemIds,
        updated_at: new Date().toISOString()
      },
      notify
    );
  }

  function deleteCollection(id) {
    WoekUserSpace.removeItem("collections", id);
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function savedItemById(id) {
    return savedItems().find((item) => item.id === id) || null;
  }

  function addItemToCollection(collectionIdValue, item = currentItem()) {
    const collection = findCollection(collectionIdValue);
    if (!collection || !item?.id) return null;
    const storedItem = savedItemById(item.id) || item;
    WoekUserSpace.upsertItem("saved_items", storedItem, { limit: 300, timestampField: "saved_at" });
    const itemIds = Array.from(new Set([item.id, ...collection.item_ids]));
    const updated = updateCollection(collection.id, { item_ids: itemIds }, true);
    trackWirkungsraumEvent("collection_item_add", storedItem, {
      collection_id: collection.id,
      collection_title: collection.title
    });
    return updated;
  }

  function removeItemFromCollection(collectionIdValue, itemId) {
    const collection = findCollection(collectionIdValue);
    if (!collection || !itemId) return null;
    const storedItem = savedItemById(itemId);
    const updated = updateCollection(
      collection.id,
      { item_ids: collection.item_ids.filter((existingId) => existingId !== itemId) },
      true
    );
    if (storedItem) {
      trackWirkungsraumEvent("collection_item_remove", storedItem, {
        collection_id: collection.id,
        collection_title: collection.title
      });
    }
    return updated;
  }

  function removeItemFromAllCollections(itemId) {
    collections().forEach((collection) => {
      if (!collection.item_ids.includes(itemId)) return;
      updateCollection(
        collection.id,
        { item_ids: collection.item_ids.filter((existingId) => existingId !== itemId) },
        false
      );
    });
  }

  function clearCollectionItemIds() {
    collections().forEach((collection) => {
      if (!collection.item_ids.length) return;
      updateCollection(collection.id, { item_ids: [] }, false);
    });
  }

  function trackWirkungsraumEvent(eventType, item = currentItem(), extra = {}) {
    if (typeof sendSiteAnalyticsEvent !== "function" || !item?.id) return;
    sendSiteAnalyticsEvent(eventType, {
      title: `Merkzettel: ${eventType}: ${item.title}`,
      entityType: item.type || "Inhalt",
      entityId: item.id,
      entityTitle: item.title,
      entityUrl: item.url,
      entityCategory: item.category,
      tags: Array.isArray(item.tags) ? item.tags.slice(0, 8) : [],
      metadata: extra
    });
  }

  function saveItem(item) {
    const stored = WoekUserSpace.upsertItem("saved_items", item, { limit: 300, timestampField: "saved_at" });
    trackWirkungsraumEvent("saved_item_add", stored || item);
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function removeItem(id) {
    const existing = savedItemById(id);
    WoekUserSpace.removeItem("saved_items", id);
    removeItemFromAllCollections(id);
    if (existing) trackWirkungsraumEvent("saved_item_remove", existing);
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function isSaved(id) {
    return savedItems().some((item) => item.id === id);
  }

  function buttonLabel(button, saved, item = currentItem()) {
    button.textContent = saved ? "Nicht mehr merken" : "☆ Merken";
    button.setAttribute("aria-pressed", String(saved));
    button.setAttribute("aria-label", saved ? `${item.title} aus der Merkliste entfernen` : `${item.title} merken`);
    button.classList.toggle("is-saved", saved);
  }

  function injectSaveButton() {
    const path = window.location.pathname;
    if (!isContentPath(path)) return;
    if (document.querySelector("[data-wirkungsraum-save]")) return;

    const item = currentItem();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary wirkungsraum-save-button";
    button.dataset.wirkungsraumSave = item.id;
    buttonLabel(button, isSaved(item.id), item);
    button.addEventListener("click", () => {
      if (isSaved(item.id)) {
        removeItem(item.id);
        buttonLabel(button, false, item);
        return;
      }
      saveItem(currentItem());
      buttonLabel(button, true, currentItem());
    });

    actionTarget()?.container.append(button);
  }

  function renderCollectionPanel(panel, item) {
    const currentCollections = collections();
    const options = currentCollections.length
      ? currentCollections
          .map((collection) => {
            const checked = collection.item_ids.includes(item.id);
            return `
              <label class="wirkungsraum-collection-option">
                <input type="checkbox" value="${escapeAttribute(collection.id)}" data-collection-toggle ${checked ? "checked" : ""}>
                <span>
                  <strong>${escapeHtml(collection.title)}</strong>
                  <small>${collection.item_ids.length} Inhalt${collection.item_ids.length === 1 ? "" : "e"}</small>
                </span>
              </label>
            `;
          })
          .join("")
      : `<p class="card-text">Noch keine Sammlung. Lege unten die erste an und speichere diese Seite direkt darin.</p>`;

    panel.innerHTML = `
      <div class="wirkungsraum-collection-panel-header">
        <p class="card-kicker">Sammlungen</p>
        <strong>In Sammlung ablegen</strong>
      </div>
      <div class="wirkungsraum-collection-options">${options}</div>
      <form class="wirkungsraum-collection-inline-form" data-collection-inline-create>
        <label>
          <span>Neue Sammlung</span>
          <input type="text" name="collection-title" placeholder="z. B. Debatten-Kompass" required>
        </label>
        <label>
          <span>Beschreibung</span>
          <input type="text" name="collection-description" placeholder="optional">
        </label>
        <button class="btn btn-primary" type="submit">Erstellen und hinzufügen</button>
      </form>
    `;
  }

  function collectionPanelOpen(panel, button, open) {
    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    if (open) renderCollectionPanel(panel, currentItem());
  }

  function injectCollectionButton() {
    const path = window.location.pathname;
    if (!isContentPath(path)) return;
    if (document.querySelector("[data-wirkungsraum-collection-button]")) return;

    const item = currentItem();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary wirkungsraum-collection-button";
    button.dataset.wirkungsraumCollectionButton = item.id;
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Zu Sammlung hinzufügen";

    const panel = document.createElement("div");
    panel.className = "wirkungsraum-collection-panel";
    panel.dataset.wirkungsraumCollectionPanel = item.id;
    panel.hidden = true;

    button.addEventListener("click", () => {
      collectionPanelOpen(panel, button, panel.hidden);
    });

    panel.addEventListener("change", (event) => {
      const toggle = event.target instanceof HTMLElement ? event.target.closest("[data-collection-toggle]") : null;
      if (!(toggle instanceof HTMLInputElement)) return;
      const current = currentItem();
      if (toggle.checked) addItemToCollection(toggle.value, current);
      else removeItemFromCollection(toggle.value, current.id);
      renderCollectionPanel(panel, current);
    });

    panel.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.matches("[data-collection-inline-create]")) return;
      event.preventDefault();
      const title = form.querySelector("[name='collection-title']")?.value || "";
      const description = form.querySelector("[name='collection-description']")?.value || "";
      const collection = createCollection(title, description, false);
      if (!collection) return;
      addItemToCollection(collection.id, currentItem());
      form.reset();
      renderCollectionPanel(panel, currentItem());
    });

    document.addEventListener("wirkungsraum:changed", () => {
      if (!panel.hidden) renderCollectionPanel(panel, currentItem());
    });

    const target = actionTarget();
    if (!target) return;
    target.container.append(button);
    target.panelAfter.insertAdjacentElement("afterend", panel);
  }

  function injectLearningButton() {
    const path = window.location.pathname;
    if (!isContentPath(path)) return;
    if (document.querySelector("[data-wirkungsraum-learning-button]")) return;

    const item = currentItem();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary wirkungsraum-learning-button";
    button.dataset.wirkungsraumLearningButton = item.id;
    learningButtonLabel(button, isLearningItem(item.id));
    button.addEventListener("click", () => {
      if (isLearningItem(item.id)) {
        removeLearningItem(item.id);
        learningButtonLabel(button, false);
        return;
      }
      upsertLearningItem(learningItemFromPage("offen"));
      learningButtonLabel(button, true);
    });

    actionTarget()?.container.append(button);
  }

  function isNotePath(path = window.location.pathname) {
    return !excludedPathPattern.test(path) && (noteScopePattern.test(path) || isContentPath(path));
  }

  function injectNotePanel() {
    const path = window.location.pathname;
    if (!isNotePath(path) || document.querySelector("[data-wirkungsraum-note-panel]")) return;

    const item = currentItem();
    const existing = noteForItem(item);
    const hasExistingNote = Boolean(existing?.content?.trim());
    const panel = document.createElement("details");
    panel.className = "wirkungsraum-note-panel";
    panel.dataset.wirkungsraumNotePanel = item.id;
    panel.dataset.hasNote = String(hasExistingNote);
    panel.dataset.searchExclude = "true";
    panel.innerHTML = `
      <summary class="wirkungsraum-note-summary">
        <span class="wirkungsraum-note-summary-copy">
          <span class="card-kicker">Persönliche Notiz</span>
          <span class="wirkungsraum-note-title">Eigene Gedanken zu dieser Seite</span>
          <span class="wirkungsraum-note-hint">Diese Notiz wird nur in deinem Browser gespeichert.</span>
        </span>
        <span class="wirkungsraum-note-state" data-wirkungsraum-note-state ${hasExistingNote ? "" : "hidden"}>
          <span aria-hidden="true">✎</span> Notiz vorhanden
        </span>
      </summary>
      <form class="wirkungsraum-note-form" data-wirkungsraum-note-form>
        <label>
          <span class="sr-only">Notiztext</span>
          <textarea data-wirkungsraum-note-text rows="5" placeholder="Was willst du dir zu diesem Inhalt merken?">${escapeHtml(existing?.content || "")}</textarea>
        </label>
        <p class="wirkungsraum-note-actions">
          <button class="btn btn-primary" type="submit">${existing ? "Notiz aktualisieren" : "Notiz speichern"}</button>
          <button class="btn btn-secondary" type="button" data-delete-note="${escapeAttribute(noteIdForItem(item))}" ${existing ? "" : "disabled"}>Notiz löschen</button>
        </p>
        <p class="wirkungsraum-note-status" data-wirkungsraum-note-status>${existing?.updated_at ? `Gespeichert: ${escapeHtml(formatDateTime(existing.updated_at))}` : ""}</p>
      </form>
    `;

    const textarea = panel.querySelector("[data-wirkungsraum-note-text]");
    const status = panel.querySelector("[data-wirkungsraum-note-status]");
    const deleteButton = panel.querySelector("[data-delete-note]");
    const submitButton = panel.querySelector("button[type='submit']");
    const noteState = panel.querySelector("[data-wirkungsraum-note-state]");

    const setNoteState = (hasNote) => {
      panel.dataset.hasNote = String(hasNote);
      if (noteState instanceof HTMLElement) noteState.hidden = !hasNote;
    };

    panel.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !(textarea instanceof HTMLTextAreaElement)) return;
      event.preventDefault();
      const content = textarea.value.trim();
      if (!content) {
        if (status) status.textContent = "Schreibe zuerst eine Notiz.";
        textarea.focus();
        return;
      }
      const stored = saveNoteForItem(item, content);
      if (deleteButton instanceof HTMLButtonElement) deleteButton.disabled = false;
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Notiz aktualisieren";
      if (status) status.textContent = stored?.updated_at ? `Gespeichert: ${formatDateTime(stored.updated_at)}` : "Gespeichert.";
      setNoteState(Boolean(stored?.content?.trim()));
    });

    deleteButton?.addEventListener("click", () => {
      if (!(deleteButton instanceof HTMLButtonElement) || deleteButton.disabled) return;
      if (!window.confirm("Diese lokale Notiz löschen?")) return;
      removeNote(noteIdForItem(item));
      if (textarea instanceof HTMLTextAreaElement) textarea.value = "";
      deleteButton.disabled = true;
      if (submitButton instanceof HTMLButtonElement) submitButton.textContent = "Notiz speichern";
      if (status) status.textContent = "Notiz gelöscht.";
      setNoteState(false);
    });

    const isDebateCompassPage = /^\/wirkungsradar\/live\/[^/]+\/?/.test(path);
    if (isDebateCompassPage) {
      const lateAnchor = document.querySelector("[data-community-submission-block], #verwandte-inhalte, #warum-der-satz-zieht, #quellen");
      if (lateAnchor) {
        lateAnchor.insertAdjacentElement("afterend", panel);
        return;
      }
    }

    const hero = document.querySelector(".hero, .radar-hero, .page-hero, .term-hero, .compact-hero, .document-detail-hero, .portal-hero, .wirkungsraum-hero");
    if (hero) {
      hero.insertAdjacentElement("afterend", panel);
      return;
    }
    const main = document.querySelector("main");
    const firstSection = main?.querySelector(".section, .content-band, article");
    if (main) main.insertBefore(panel, firstSection || main.firstChild);
  }

  function progressPercent() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(100, Math.round((window.scrollY / scrollable) * 100)));
  }

  function trackReadingProgress() {
    const path = window.location.pathname;
    if (excludedPathPattern.test(path) || !isProgressPath(path)) return;

    let timeout;
    const persistNow = () => {
      const url = canonicalPath();
      WoekUserSpace.upsertRecord("reading_progress", url, progressRecord(path));
    };
    const persist = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(persistNow, 250);
    };
    window.addEventListener("scroll", persist, { passive: true });
    window.addEventListener("beforeunload", () => {
      window.clearTimeout(timeout);
      persistNow();
    });
    persistNow();
  }

  function restoreReadingPosition() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("weiterlesen") && !params.has("continue")) return;
    const path = window.location.pathname;
    if (excludedPathPattern.test(path) || !isProgressPath(path)) return;
    const url = canonicalPath();
    const records = WoekUserSpace.getRecordItems("reading_progress");
    const item = records[url] || records[`${url}/`];
    const position = Number(item?.scroll_position || 0);
    if (!Number.isFinite(position) || position < 40) return;
    window.setTimeout(() => {
      window.scrollTo({ top: position, behavior: "auto" });
    }, 120);
  }

  function readingProgressItems() {
    const records = WoekUserSpace.getRecordItems("reading_progress");
    return Object.values(records)
      .filter((item) => item && item.url && item.title)
      .map((item) => {
        const progress = normalizedProgress(item.progress);
        const status = itemStatus({ ...item, progress });
        return {
          ...item,
          progress,
          status,
          status_symbol: statusSymbol(status),
          last_read_at: item.last_read_at || item.updated_at || null
        };
      })
      .sort((a, b) => new Date(b.last_read_at || b.updated_at || 0) - new Date(a.last_read_at || a.updated_at || 0));
  }

  function continueUrl(url) {
    const target = new URL(url || "/", window.location.origin);
    target.searchParams.set("weiterlesen", "1");
    return `${target.pathname}${target.search}${target.hash}`;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("de-DE", { dateStyle: "medium" });
  }

  function itemCard(item, options = {}) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-item";
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 4) : [];
    const hasProgress = Number.isFinite(Number(item.progress));
    const progressValue = hasProgress ? normalizedProgress(item.progress) : null;
    const status = hasProgress ? itemStatus({ ...item, progress: progressValue }) : null;
    const statusText = status ? `${statusSymbol(status)} ${statusLabel(status)}${progressValue !== null ? ` · ${progressValue}%` : ""}` : "";
    const progress = hasProgress
      ? `<p class="wirkungsraum-progress" aria-label="Lesefortschritt ${progressValue}%"><span style="width:${Math.max(3, progressValue)}%"></span></p>`
      : "";
    const lastRead = options.showLastRead && item.last_read_at ? `<p class="wirkungsraum-meta">Zuletzt gelesen: ${escapeHtml(formatDateTime(item.last_read_at))}</p>` : "";
    const href = typeof options.href === "function" ? options.href(item) : item.url || "#";
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(item.type || "Inhalt")}</p>
      <h3 class="card-title">${escapeHtml(item.title || "Ohne Titel")}</h3>
      ${options.showStatus && statusText ? `<p class="wirkungsraum-reading-status">${escapeHtml(statusText)}</p>` : ""}
      ${progress}
      ${lastRead}
      ${tags.length ? `<div class="chip-row">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <p class="wirkungsraum-item-actions">
        <a class="btn btn-primary" href="${escapeAttribute(href)}">${options.readLabel || "Öffnen"}</a>
        ${options.removable ? `<button class="btn btn-secondary" type="button" data-remove-saved="${escapeAttribute(item.id || "")}">Entfernen</button>` : ""}
      </p>
    `;
    return article;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function renderList(container, items, emptyText, options = {}) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("article");
      empty.className = "card";
      empty.innerHTML = `<p class="card-text">${escapeHtml(emptyText)}</p>`;
      container.append(empty);
      return;
    }
    items.forEach((item) => container.append(itemCard(item, options)));
  }

  function exportFileName() {
    return `woek-user-space-${new Date().toISOString().slice(0, 10)}.json`;
  }

  function downloadJsonFile(filename, payload) {
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function dataStatus(root, text, tone = "neutral") {
    const status = root.querySelector("[data-wirkungsraum-data-status]");
    if (!status) return;
    status.textContent = text;
    status.dataset.statusTone = tone;
  }

  let currentRecoveryPackage = null;
  let currentRecoveryLink = "";
  let pendingRecoveryPackage = null;

  function recoveryFileName() {
    return `woek-wiederherstellungslink-${new Date().toISOString().slice(0, 10)}.json`;
  }

  function activeDashboardUrl() {
    const base = new URL("/mein-wirkungsraum/", window.location.origin);
    return base.toString();
  }

  function recoveryLink(packageData) {
    return `${activeDashboardUrl()}#wrl=${WoekUserSpace.encodeRecoveryPackage(packageData)}`;
  }

  function countObjectEntries(object) {
    if (!object) return 0;
    if (Array.isArray(object)) return object.length;
    if (Array.isArray(object.items)) return object.items.length;
    if (object.items && typeof object.items === "object") return Object.keys(object.items).length;
    if (object.data && typeof object.data === "object") return Object.keys(object.data).length;
    if (typeof object === "object") return Object.keys(object).length;
    return 0;
  }

  function localDataSummary() {
    const snapshot = WoekUserSpace.snapshot();
    return [
      `Merkliste: ${countObjectEntries(snapshot.objects.saved_items)}`,
      `Fortschritt: ${countObjectEntries(snapshot.objects.reading_progress)}`,
      `Sammlungen: ${countObjectEntries(snapshot.objects.collections)}`,
      `Lernliste: ${countObjectEntries(snapshot.objects.learning_items)}`,
      `Notizen: ${countObjectEntries(snapshot.objects.notes)}`
    ].join(" · ");
  }

  function recoverySummary(packageData) {
    const parts = [
      `${countObjectEntries(packageData.saved_items)} gemerkte Inhalte`,
      `${countObjectEntries(packageData.reading_progress)} Lesestände`,
      `${countObjectEntries(packageData.collections)} Sammlungen`,
      `${countObjectEntries(packageData.learning_items)} Lernlisteneinträge`
    ];
    parts.push(packageData.includes_notes ? `${countObjectEntries(packageData.notes)} Notizen` : "ohne persönliche Notizen");
    if (packageData.expires_at) parts.push(`gültig bis ${new Date(packageData.expires_at).toLocaleDateString("de-DE")}`);
    else parts.push("ohne Ablaufdatum");
    return parts.join(" · ");
  }

  function setRecoveryOutput(root, packageData, link) {
    currentRecoveryPackage = packageData;
    currentRecoveryLink = link;
    const result = root.querySelector("[data-recovery-result]");
    const output = root.querySelector("[data-recovery-link-output]");
    const email = root.querySelector("[data-recovery-email]");
    const qrPanel = root.querySelector("[data-recovery-qr-panel]");
    const qrHost = root.querySelector("[data-recovery-qr]");
    if (result instanceof HTMLElement) result.hidden = false;
    if (output instanceof HTMLInputElement) {
      output.value = link;
      output.focus();
      output.select();
    }
    if (email instanceof HTMLAnchorElement) {
      const subject = encodeURIComponent("Mein Wirkungsraum Wiederherstellungslink");
      const body = encodeURIComponent(`Hier ist mein privater Wiederherstellungslink für Mein Wirkungsraum:\n\n${link}\n\nWer den Link hat, kann die enthaltenen gespeicherten Inhalte laden.`);
      email.href = `mailto:?subject=${subject}&body=${body}`;
    }
    if (qrPanel instanceof HTMLElement) qrPanel.hidden = true;
    if (qrHost instanceof HTMLElement) qrHost.innerHTML = "";
    dataStatus(root, `Privater Wiederherstellungslink erstellt: ${recoverySummary(packageData)}.`, "success");
  }

  function renderRecoveryQr(root) {
    const qrPanel = root.querySelector("[data-recovery-qr-panel]");
    const qrHost = root.querySelector("[data-recovery-qr]");
    if (!(qrPanel instanceof HTMLElement) || !(qrHost instanceof HTMLElement)) return;
    qrPanel.hidden = false;
    qrHost.innerHTML = "";
    try {
      if (typeof window.qrcode !== "function") throw new Error("QR-Code-Erzeugung nicht verfügbar.");
      const qr = window.qrcode(0, "M");
      qr.addData(currentRecoveryLink);
      qr.make();
      qrHost.innerHTML = qr.createSvgTag({
        cellSize: 4,
        margin: 4,
        scalable: true,
        title: "Privater Wiederherstellungslink",
        alt: "QR-Code für den privaten Wiederherstellungslink"
      });
      dataStatus(root, "QR-Code lokal erzeugt. Bei sehr langen Links ist Kopieren oder Datei-Export oft zuverlässiger.", "success");
    } catch {
      qrHost.innerHTML = '<p class="card-text">Der Link ist für einen QR-Code zu lang. Nutze „Link kopieren“, „per E-Mail öffnen“ oder „als Datei exportieren“.</p>';
      dataStatus(root, "Der Link ist für einen QR-Code zu lang. Nutze Kopieren, E-Mail oder Datei-Export.", "error");
    }
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return Promise.reject(new Error("Zwischenablage nicht verfügbar."));
  }

  function cleanRecoveryHash() {
    if (window.location.hash.includes("wrl=") || window.location.hash.includes("wirkungsraum-link=")) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#datenkontrolle`);
    }
  }

  function showRecoveryImportPanel(root, packageData) {
    pendingRecoveryPackage = packageData;
    const panel = root.querySelector("[data-recovery-import-panel]");
    const summary = root.querySelector("[data-recovery-import-summary]");
    if (summary instanceof HTMLElement) {
      summary.textContent = `Ein Wiederherstellungslink wurde erkannt: ${recoverySummary(packageData)}. Entscheide selbst, ob du ihn mit deinen lokalen Daten zusammenführst oder deine lokalen Daten ersetzt.`;
    }
    if (panel instanceof HTMLElement) {
      panel.hidden = false;
      panel.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    dataStatus(root, "Privater Wiederherstellungslink erkannt. Es wurde noch nichts übernommen.", "success");
  }

  function handleRecoveryHash(root) {
    const decoded = WoekUserSpace.recoveryPackageFromHash(window.location.hash);
    if (!decoded) return;
    if (!decoded.ok) {
      dataStatus(root, decoded.error || "Der Wiederherstellungslink kann nicht gelesen werden.", "error");
      cleanRecoveryHash();
      return;
    }
    showRecoveryImportPanel(root, decoded.package);
  }

  function refreshDashboardPanels(root, lastVisit = WoekUserSpace.getSetting("last_wirkungsraum_visit", null)) {
    drawSavedDashboard(root);
    drawReadingDashboard(root);
    drawRelatedDashboard(root);
    drawCollectionsDashboard(root);
    drawLearningDashboard(root);
    drawNotesDashboard(root);
    drawNewContentDashboard(root, lastVisit);
    drawNextStepsDashboard(root);
  }

  const resetObjectLabels = {
    saved_items: "Merkliste",
    reading_progress: "Fortschritt",
    collections: "Sammlungen",
    notes: "Notizen"
  };

  function parseContentDate(value) {
    if (!value || value === "Invalid Date") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function normalizeContentUrl(value) {
    const path = graphPath(value);
    return path || cleanText(value || "#");
  }

  function canonicalContentId(entry) {
    return normalizeContentUrl(entry?.url) || entry?.id || graphSlug(entry?.title || "");
  }

  function explicitPublicationDate(entry) {
    return parseContentDate(entry?.date || entry?.published_at || entry?.publishedAt || entry?.datePublished || entry?.publication_date || entry?.publicationDate);
  }

  function normalizeRecentContentEntry(entry, defaults = {}) {
    const date = explicitPublicationDate(entry);
    const now = new Date();
    if (!date || date > now) return null;
    const url = normalizeContentUrl(entry.url);
    const title = cleanText(entry.title);
    if (!title || !url) return null;
    return {
      id: canonicalContentId(entry),
      type: cleanText(entry.type || defaults.type || "Inhalt"),
      title,
      url,
      category: cleanText(entry.category || entry.documentType || defaults.category || ""),
      description: cleanText(entry.excerpt || entry.description || entry.summaryShort || entry.summary || "").slice(0, 220),
      tags: uniqueStrings(entry.tags || entry.topics || [], 4),
      date,
      dateLabel: formatDate(date)
    };
  }

  async function recentContentItems() {
    if (!recentContentPromise) {
      recentContentPromise = Promise.all([
        fetchJson("/assets/data/blog-index.json", []),
        fetchJson("/assets/data/document-library.json", {})
      ]).then(([blogEntries, documentLibrary]) => {
        const documentEntries = Array.isArray(documentLibrary)
          ? documentLibrary
          : (Array.isArray(documentLibrary.documents) ? documentLibrary.documents : []);
        const journalItems = (Array.isArray(blogEntries) ? blogEntries : [])
          .filter((entry) => !entry.status || entry.status === "published")
          .map((entry) => normalizeRecentContentEntry(entry, { type: "Journalartikel", category: "Journal" }));
        const documentItems = documentEntries
          .filter((entry) => entry.visibility === "public" && (!entry.status || entry.status === "aktuell" || entry.status === "published"))
          .map((entry) => normalizeRecentContentEntry(entry, { type: "Veröffentlichung", category: "Bibliothek" }));
        const byId = new Map();
        [...journalItems, ...documentItems]
          .filter((entry) => entry?.title && entry.url)
          .forEach((entry) => {
            if (!byId.has(entry.id)) byId.set(entry.id, entry);
          });
        return [...byId.values()]
          .sort((a, b) => b.date - a.date || a.title.localeCompare(b.title, "de"));
      });
    }
    return recentContentPromise;
  }

  function newContentCard(item) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-update-card";
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(item.type || "Inhalt")}${item.dateLabel ? ` · ${escapeHtml(item.dateLabel)}` : ""}</p>
      <h3 class="card-title">${escapeHtml(item.title || "Ohne Titel")}</h3>
      ${item.description ? `<p class="card-text">${escapeHtml(item.description)}</p>` : ""}
      ${item.category || item.tags.length ? `<div class="chip-row">${[item.category, ...item.tags].filter(Boolean).slice(0, 4).map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <p class="wirkungsraum-item-actions">
        <a class="btn btn-primary" href="${escapeAttribute(item.url || "#")}">Inhalt öffnen</a>
      </p>
    `;
    return article;
  }

  function renderNewContentList(container, items, emptyText) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("article");
      empty.className = "card";
      empty.innerHTML = `<p class="card-text">${escapeHtml(emptyText)}</p><p class="wirkungsraum-item-actions"><a class="btn btn-secondary" href="/blog.html">Journal öffnen</a></p>`;
      container.append(empty);
      return;
    }
    items.forEach((item) => container.append(newContentCard(item)));
  }

  function drawNewContentDashboard(root, lastVisit) {
    const container = root.querySelector("[data-new-content-list]");
    if (!container) return;
    container.innerHTML = `<article class="card"><p class="card-text">Neue Inhalte werden geladen.</p></article>`;
    recentContentItems()
      .then((items) => {
        const since = parseContentDate(lastVisit);
        const knownIds = new Set(WoekUserSpace.getSetting("known_published_content_ids", []));
        const visible = since
          ? items.filter((item) => item.date > since && !knownIds.has(item.id)).slice(0, 6)
          : [];
        const emptyText = since
          ? "Seit deinem letzten Besuch wurden keine neuen, erstmals veröffentlichten Inhalte gefunden."
          : "Ab jetzt merkt sich dein Wirkungsraum den aktuellen Veröffentlichungsstand. Beim nächsten Besuch erscheinen hier nur wirklich neue Inhalte.";
        renderNewContentList(container, visible, emptyText);
        WoekUserSpace.setSetting("known_published_content_ids", items.map((item) => item.id));
      })
      .catch(() => {
        renderNewContentList(container, [], "Neue Inhalte konnten gerade nicht geladen werden.");
      });
  }

  function nextStepCard(step) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-step-card";
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(step.kicker || "Nächster Schritt")}</p>
      <h3 class="card-title">${escapeHtml(step.title || "Weiterarbeiten")}</h3>
      <p class="card-text">${escapeHtml(step.text || "")}</p>
      <p class="wirkungsraum-item-actions">
        <a class="btn ${step.primary ? "btn-primary" : "btn-secondary"}" href="${escapeAttribute(step.href || "#")}">${escapeHtml(step.label || "Öffnen")}</a>
      </p>
    `;
    return article;
  }

  function drawNextStepsDashboard(root) {
    const container = root.querySelector("[data-next-steps]");
    if (!container) return;
    const saved = savedItems();
    const reading = readingProgressItems();
    const learning = learningItems();
    const currentCollections = collections();
    const currentNotes = notes();
    const activeReading = reading.find((item) => itemStatus(item) === "begonnen") || reading.find((item) => itemStatus(item) !== "gelesen") || reading[0];
    const activeLearning = learning.find((item) => normalizeLearningStatus(item.learning_status) !== "verstanden");
    const steps = [];

    if (activeReading) {
      steps.push({
        kicker: "Weiterlesen",
        title: activeReading.title || "Zuletzt gelesenen Inhalt fortsetzen",
        text: "Dort weitermachen, wo du zuletzt aufgehört hast.",
        href: continueUrl(activeReading.url),
        label: "Weiterlesen",
        primary: true
      });
    } else {
      steps.push({
        kicker: "Start",
        title: "Einen Grundlagentext beginnen",
        text: "Ein Referenzkapitel oder Dokument öffnen und den Lesefortschritt starten.",
        href: "/referenz/",
        label: "Referenz öffnen",
        primary: true
      });
    }

    if (saved.length) {
      steps.push({
        kicker: "Anschlüsse",
        title: "Verwandte Inhalte prüfen",
        text: "Zu deinen gemerkten Themen passende Begriffe, Werkzeuge, Dokumente und Debatten ansehen.",
        href: "#verwandte-inhalte",
        label: "Verwandte öffnen"
      });
    } else {
      steps.push({
        kicker: "Merken",
        title: "Erste Inhalte speichern",
        text: "Suche einen Begriff, ein Kapitel, ein Werkzeug oder eine Debattenkarte und lege sie in deinem Wirkungsraum ab.",
        href: "/suche.html",
        label: "Suche öffnen"
      });
    }

    if (saved.length && !currentCollections.length) {
      steps.push({
        kicker: "Sammeln",
        title: "Eine Sammlung anlegen",
        text: "Gemerkte Inhalte thematisch bündeln, damit sie später leichter wiederzufinden sind.",
        href: "#sammlungen",
        label: "Sammlungen öffnen"
      });
    } else if (currentCollections.length) {
      steps.push({
        kicker: "Sammeln",
        title: "Sammlungen prüfen",
        text: "Bestehende Materialbündel öffnen, ergänzen oder bereinigen.",
        href: "#sammlungen",
        label: "Sammlungen öffnen"
      });
    }

    if (activeLearning) {
      steps.push({
        kicker: "Lernen",
        title: activeLearning.title || "Lernliste fortsetzen",
        text: "Den nächsten offenen Lerninhalt bearbeiten oder seinen Status aktualisieren.",
        href: activeLearning.url || "#lernliste",
        label: "Weiterlernen"
      });
    } else {
      steps.push({
        kicker: "Lernen",
        title: "Akademie-Lernpfad aufnehmen",
        text: "Ein Modul zur Lernliste hinzufügen und den eigenen Fortschritt sichtbar machen.",
        href: "#akademie-fortschritt",
        label: "Akademie öffnen"
      });
    }

    if ((saved.length || reading.length || learning.length) && !currentNotes.length) {
      steps.push({
        kicker: "Notizen",
        title: "Eine eigene Notiz ergänzen",
        text: "Auf einer Inhaltsseite festhalten, was du dir merken oder prüfen willst.",
        href: (activeReading || saved[0] || learning[0])?.url || "#notizen",
        label: "Inhalt öffnen"
      });
    }

    container.innerHTML = "";
    steps.slice(0, 6).forEach((step) => container.append(nextStepCard(step)));
  }

  const savedFilterGroups = {
    all: null,
    begriffe: ["Begriff", "Glossar"],
    kapitel: ["Kapitel", "Buchkapitel", "Referenzkapitel"],
    dokumente: ["Dokument", "Dossier"],
    debatten: ["Debatte", "Debatten-Kompass"],
    werkzeuge: ["Werkzeug"],
    akademie: ["Akademie", "Akademie-Modul"]
  };

  function matchesSavedFilter(item, filterKey) {
    const allowed = savedFilterGroups[filterKey] || null;
    if (!allowed) return true;
    return allowed.includes(item.type);
  }

  function savedSearchText(item) {
    return [item.title, item.type, item.category, ...(Array.isArray(item.tags) ? item.tags : [])].join(" ").toLowerCase();
  }

  function activeSavedFilter(root) {
    return root.dataset.savedTypeFilter || "all";
  }

  function updateFilterButtons(root) {
    const active = activeSavedFilter(root);
    root.querySelectorAll("[data-saved-type-filter]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      const pressed = (button.dataset.savedTypeFilter || "all") === active;
      button.classList.toggle("active", pressed);
      button.setAttribute("aria-pressed", String(pressed));
    });
  }

  function drawSavedDashboard(root) {
    const saved = savedItems();
    const savedList = root.querySelector("[data-saved-list]");
    const searchInput = root.querySelector("[data-saved-search], [data-saved-filter]");
    const query = searchInput instanceof HTMLInputElement ? searchInput.value.trim().toLowerCase() : "";
    const filterKey = activeSavedFilter(root);
    const filtered = saved.filter((item) => matchesSavedFilter(item, filterKey) && (!query || savedSearchText(item).includes(query)));

    renderList(savedList, filtered, "Noch nichts gemerkt. Auf Inhaltsseiten erscheint automatisch „⭐ Merken“.", { removable: true });
    const statSaved = root.querySelector("[data-stat-saved]");
    if (statSaved) statSaved.textContent = String(saved.length);
    const statVisible = root.querySelector("[data-stat-visible]");
    if (statVisible) statVisible.textContent = String(filtered.length);
    updateFilterButtons(root);
  }

  function relatedKnowledgeCard(item) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-related-card";
    const tags = uniqueStrings([item.category, item.tags], 4);
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(item.type || "Inhalt")} · ${escapeHtml(item.relation || "ergänzt")}</p>
      <h3 class="card-title">${escapeHtml(item.title || "Ohne Titel")}</h3>
      ${item.description ? `<p class="card-text">${escapeHtml(item.description)}</p>` : ""}
      <p class="wirkungsraum-knowledge-path">
        <span>${escapeHtml(item.sourceTitle || "Gemerkter Inhalt")}</span>
        <span>${escapeHtml(item.relation || "ergänzt")}</span>
        <span>${escapeHtml(item.title || "Inhalt")}</span>
      </p>
      ${item.reason ? `<p class="wirkungsraum-meta">${escapeHtml(item.reason)}</p>` : ""}
      ${tags.length ? `<div class="chip-row">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <p class="wirkungsraum-item-actions">
        <a class="btn btn-primary" href="${escapeAttribute(item.url || "#")}">Inhalt öffnen</a>
      </p>
    `;
    return article;
  }

  function renderRelatedKnowledgeList(container, items, emptyText) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("article");
      empty.className = "card";
      empty.innerHTML = `<p class="card-text">${escapeHtml(emptyText)}</p>`;
      container.append(empty);
      return;
    }
    items.forEach((item) => container.append(relatedKnowledgeCard(item)));
  }

  function drawRelatedDashboard(root) {
    const container = root.querySelector("[data-related-content-list]");
    if (!container) return;
    const saved = savedItems();
    if (!saved.length) {
      renderRelatedKnowledgeList(container, [], "Merke zuerst Begriffe, Kapitel, Dokumente, Werkzeuge oder Debatten. Danach zeigt dir das Wissensnetz passende Anschlüsse.");
      root.dataset.knowledgeGraphNodes = "0";
      root.dataset.knowledgeGraphEdges = "0";
      return;
    }
    const run = ++relatedRenderRun;
    container.innerHTML = `<article class="card"><p class="card-text">Wissensnetz wird aus deinen gemerkten Inhalten aufgebaut.</p></article>`;
    relatedKnowledgeForSaved(saved)
      .then(({ graph, related }) => {
        if (run !== relatedRenderRun) return;
        root.dataset.knowledgeGraphNodes = String(graph.nodes.length);
        root.dataset.knowledgeGraphEdges = String(graph.edges.length);
        renderRelatedKnowledgeList(container, related, "Noch keine belastbaren Verknüpfungen gefunden. Merke weitere Inhalte aus Glossar, Referenz, Werkzeugen oder Debatten.");
      })
      .catch(() => {
        if (run !== relatedRenderRun) return;
        renderRelatedKnowledgeList(container, [], "Das Wissensnetz konnte gerade nicht geladen werden. Deine gemerkten Inhalte bleiben unverändert lokal gespeichert.");
      });
  }

  function drawReadingDashboard(root) {
    const reading = readingProgressItems();
    const readingList = root.querySelector("[data-reading-list]");
    renderList(readingList, reading.slice(0, 12), "Noch kein Lesefortschritt. Öffne ein Referenzkapitel, Buchkapitel, Dokument, Dossier oder Akademie-Modul.", {
      readLabel: "Weiterlesen",
      showStatus: true,
      showLastRead: true,
      href: (item) => continueUrl(item.url)
    });
    const statProgress = root.querySelector("[data-stat-progress]");
    if (statProgress) statProgress.textContent = String(reading.length);
    const statRead = root.querySelector("[data-stat-read]");
    if (statRead) statRead.textContent = String(reading.filter((item) => itemStatus(item) === "gelesen").length);
  }

  function noteCard(note) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-note-card";
    article.dataset.noteId = note.id;
    const tags = Array.isArray(note.tags) ? note.tags.slice(0, 4) : [];
    const updated = note.updated_at ? `<p class="wirkungsraum-meta">Aktualisiert: ${escapeHtml(formatDateTime(note.updated_at))}</p>` : "";
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(note.target_type || "Notiz")}</p>
      <h3 class="card-title">${escapeHtml(note.target_title || "Ohne Titel")}</h3>
      <p class="wirkungsraum-note-text">${escapeHtml(note.content || "")}</p>
      ${updated}
      ${tags.length ? `<div class="chip-row">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <p class="wirkungsraum-item-actions">
        <a class="btn btn-primary" href="${escapeAttribute(note.target_url || "#")}">Seite öffnen</a>
        <button class="btn btn-secondary" type="button" data-remove-note="${escapeAttribute(note.id || "")}">Notiz löschen</button>
      </p>
    `;
    return article;
  }

  function renderNotesList(container, items) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("article");
      empty.className = "card";
      empty.innerHTML = `<p class="card-text">Noch keine Notizen. Auf Inhaltsseiten erscheint ein lokales Notizfeld.</p>`;
      container.append(empty);
      return;
    }
    items.forEach((item) => container.append(noteCard(item)));
  }

  function drawNotesDashboard(root) {
    const currentNotes = notes();
    renderNotesList(root.querySelector("[data-notes-list]"), currentNotes);
    const statNotes = root.querySelector("[data-stat-notes]");
    if (statNotes) statNotes.textContent = String(currentNotes.length);
  }

  function learningCard(item) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-learning-card";
    article.dataset.learningId = item.id;
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 4) : [];
    const part = item.part_label ? `<span class="chip">${escapeHtml(item.part_label)}</span>` : "";
    const statusOptions = Object.entries(learningStatuses)
      .map(([value, label]) => `<option value="${escapeAttribute(value)}" ${normalizeLearningStatus(item.learning_status) === value ? "selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
    article.innerHTML = `
      <p class="card-kicker">${escapeHtml(item.type || "Lerninhalt")}</p>
      <h3 class="card-title">${escapeHtml(item.title || "Ohne Titel")}</h3>
      <p class="wirkungsraum-meta">Lernstatus: ${escapeHtml(learningStatusLabel(item.learning_status))}</p>
      <label class="wirkungsraum-status-select">
        <span>Status ändern</span>
        <select data-learning-status="${escapeAttribute(item.id)}">${statusOptions}</select>
      </label>
      ${(part || tags.length) ? `<div class="chip-row">${part}${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      <p class="wirkungsraum-item-actions">
        <a class="btn btn-primary" href="${escapeAttribute(item.url || "#")}">Öffnen</a>
        <button class="btn btn-secondary" type="button" data-remove-learning="${escapeAttribute(item.id || "")}">Entfernen</button>
      </p>
    `;
    return article;
  }

  function renderLearningList(container, items) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("article");
      empty.className = "card";
      empty.innerHTML = `<p class="card-text">Noch keine Lernliste. Auf Inhaltsseiten erscheint automatisch „Zur Lernliste hinzufügen“.</p>`;
      container.append(empty);
      return;
    }
    items.forEach((item) => container.append(learningCard(item)));
  }

  function academyItemFromPart(part) {
    return {
      id: `akademie-${part.id}`,
      type: "Akademie",
      title: `${part.label}: ${part.title}`,
      url: part.href,
      category: "Akademie-Grundstudium",
      tags: ["Akademie", "Lernpfad", part.label],
      learning_status: "offen",
      part_id: part.id,
      part_label: part.label,
      added_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  function academyProgressRows() {
    const learning = learningItems();
    const reading = readingProgressItems();
    return academyParts.map((part) => {
      const partLearning = learning.filter((item) => item.part_id === part.id || inferAcademyPart(item)?.id === part.id);
      const partReading = reading.filter((item) => inferAcademyPart(item)?.id === part.id);
      const statusScore = partLearning.length
        ? Math.round(partLearning.reduce((sum, item) => sum + learningStatusScores[normalizeLearningStatus(item.learning_status)], 0) / partLearning.length)
        : 0;
      const readingScore = partReading.length ? Math.max(...partReading.map((item) => normalizedProgress(item.progress))) : 0;
      const progress = Math.max(statusScore, readingScore);
      const understood = partLearning.filter((item) => normalizeLearningStatus(item.learning_status) === "verstanden").length;
      const repeat = partLearning.filter((item) => normalizeLearningStatus(item.learning_status) === "wiederholen").length;
      const inWork = partLearning.filter((item) => normalizeLearningStatus(item.learning_status) === "in_arbeit").length;
      return { part, partLearning, progress, understood, repeat, inWork };
    });
  }

  function drawAcademyProgress(root) {
    const container = root.querySelector("[data-academy-progress]");
    const moduleList = root.querySelector("[data-academy-module-list]");
    const statAcademy = root.querySelector("[data-stat-academy]");
    const rows = academyProgressRows();
    const academyLearning = learningItems().filter((item) => item.type === "Akademie" || /\/akademie/.test(item.url || ""));
    const academyReading = readingProgressItems().filter((item) => item.type === "Akademie" || /\/akademie/.test(item.url || ""));
    if (statAcademy) statAcademy.textContent = String(academyLearning.length || academyReading.length);

    if (container) {
      container.innerHTML = rows
        .map(({ part, partLearning, progress, understood, repeat, inWork }) => `
          <article class="card wirkungsraum-part-progress" data-academy-part="${escapeAttribute(part.id)}">
            <div>
              <p class="card-kicker">${escapeHtml(part.label)}</p>
              <h3 class="card-title">${escapeHtml(part.title)}</h3>
              <p class="wirkungsraum-meta">${partLearning.length} Lerninhalt${partLearning.length === 1 ? "" : "e"} · ${progress}%</p>
            </div>
            <p class="wirkungsraum-progress" aria-label="${escapeAttribute(part.label)} Fortschritt ${progress}%"><span style="width:${Math.max(3, progress)}%"></span></p>
            <p class="wirkungsraum-part-meta">verstanden: ${understood} · in Arbeit: ${inWork} · wiederholen: ${repeat}</p>
          </article>
        `)
        .join("");
    }

    if (moduleList) {
      const modulesById = new Map();
      academyLearning.forEach((item) => {
        const status = normalizeLearningStatus(item.learning_status);
        modulesById.set(item.id || item.url, {
          ...item,
          progress: learningStatusScores[status],
          status: status === "verstanden" ? "gelesen" : status === "offen" ? "ungelesen" : "begonnen",
          last_read_at: item.updated_at || item.added_at || null
        });
      });
      academyReading.forEach((item) => {
        const key = item.id || item.url;
        const existing = modulesById.get(key);
        modulesById.set(key, existing ? { ...existing, ...item, progress: Math.max(normalizedProgress(existing.progress), normalizedProgress(item.progress)) } : item);
      });
      const academyModules = [...modulesById.values()].sort((a, b) => new Date(b.last_read_at || b.updated_at || b.added_at || 0) - new Date(a.last_read_at || a.updated_at || a.added_at || 0));
      renderList(moduleList, academyModules.slice(0, 6), "Noch kein Akademie-Lesefortschritt. Öffne Akademie-Seiten oder füge Teile zur Lernliste hinzu.", {
        readLabel: "Weiterlernen",
        showStatus: true,
        showLastRead: true,
        href: (item) => continueUrl(item.url)
      });
    }
  }

  function drawLearningRecommendations(root) {
    const container = root.querySelector("[data-learning-recommendations]");
    if (!container) return;
    const rows = academyProgressRows();
    const nextRows = rows.filter((row) => row.progress < 100).slice(0, 3);
    const fallbackRows = rows.slice(0, 3);
    const visibleRows = nextRows.length ? nextRows : fallbackRows;
    container.innerHTML = visibleRows
      .map(({ part, progress }) => {
        const already = Boolean(learningItemById(`akademie-${part.id}`));
        return `
          <article class="card text-link-card">
            <p class="card-kicker">${escapeHtml(part.label)} · ${progress}%</p>
            <h3 class="card-title">${escapeHtml(part.title)}</h3>
            <p class="card-text">Nächster sinnvoller Lernschritt im Grundstudium.</p>
            <p class="wirkungsraum-item-actions">
              <a class="btn btn-secondary" href="${escapeAttribute(part.href)}">Modul öffnen</a>
              <button class="btn btn-primary" type="button" data-add-learning-suggestion="${escapeAttribute(part.id)}">${already ? "In Lernliste" : "Zur Lernliste hinzufügen"}</button>
            </p>
          </article>
        `;
      })
      .join("");
  }

  function drawLearningDashboard(root) {
    const learningList = root.querySelector("[data-learning-list]");
    const learning = learningItems();
    renderLearningList(learningList, learning);
    const statLearning = root.querySelector("[data-stat-learning]");
    if (statLearning) statLearning.textContent = String(learning.length);
    drawAcademyProgress(root);
    drawLearningRecommendations(root);
  }

  function collectionItemMarkup(collection, savedById) {
    if (!collection.item_ids.length) return `<p class="card-text">Noch keine Inhalte in dieser Sammlung.</p>`;
    return `
      <div class="wirkungsraum-collection-items">
        ${collection.item_ids
          .map((itemId) => {
            const item = savedById.get(itemId);
            if (!item) {
              return `
                <span class="wirkungsraum-collection-item muted">
                  <span>Nicht mehr gemerkt</span>
                  <button type="button" data-remove-collection-item data-collection-id="${escapeAttribute(collection.id)}" data-item-id="${escapeAttribute(itemId)}">Entfernen</button>
                </span>
              `;
            }
            return `
              <span class="wirkungsraum-collection-item">
                <a href="${escapeAttribute(item.url || "#")}">${escapeHtml(item.title || "Ohne Titel")}</a>
                <button type="button" data-remove-collection-item data-collection-id="${escapeAttribute(collection.id)}" data-item-id="${escapeAttribute(itemId)}">Entfernen</button>
              </span>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function collectionCard(collection, savedById) {
    const article = document.createElement("article");
    article.className = "card wirkungsraum-collection-card";
    article.dataset.collectionId = collection.id;
    const updated = collection.updated_at ? `<p class="wirkungsraum-meta">Aktualisiert: ${escapeHtml(formatDateTime(collection.updated_at))}</p>` : "";
    article.innerHTML = `
      <div data-collection-view>
        <p class="card-kicker">Sammlung</p>
        <h3 class="card-title">${escapeHtml(collection.title)}</h3>
        ${collection.description ? `<p class="card-text">${escapeHtml(collection.description)}</p>` : ""}
        <p class="wirkungsraum-meta">${collection.item_ids.length} Inhalt${collection.item_ids.length === 1 ? "" : "e"}</p>
        ${updated}
        ${collectionItemMarkup(collection, savedById)}
        <p class="wirkungsraum-collection-actions">
          <button class="btn btn-secondary" type="button" data-edit-collection="${escapeAttribute(collection.id)}">Umbenennen</button>
          <button class="btn btn-secondary" type="button" data-delete-collection="${escapeAttribute(collection.id)}">Löschen</button>
        </p>
      </div>
      <form class="wirkungsraum-collection-edit-form" data-collection-edit-form hidden>
        <label>
          <span>Titel</span>
          <input type="text" name="collection-title" value="${escapeAttribute(collection.title)}" required>
        </label>
        <label>
          <span>Beschreibung</span>
          <input type="text" name="collection-description" value="${escapeAttribute(collection.description || "")}">
        </label>
        <p class="wirkungsraum-collection-actions">
          <button class="btn btn-primary" type="submit">Speichern</button>
          <button class="btn btn-secondary" type="button" data-cancel-collection-edit>Abbrechen</button>
        </p>
      </form>
    `;
    return article;
  }

  function drawCollectionsDashboard(root) {
    const collectionList = root.querySelector("[data-collection-list]");
    const statCollections = root.querySelector("[data-stat-collections]");
    const currentCollections = collections();
    if (statCollections) statCollections.textContent = String(currentCollections.length);
    if (!collectionList) return;
    collectionList.innerHTML = "";
    if (!currentCollections.length) {
      const empty = document.createElement("article");
      empty.className = "card";
      empty.innerHTML = `<p class="card-text">Noch keine Sammlung. Erstelle eine Sammlung oder füge eine Inhaltsseite mit „Zu Sammlung hinzufügen“ hinzu.</p>`;
      collectionList.append(empty);
      return;
    }
    const savedById = new Map(savedItems().map((item) => [item.id, item]));
    currentCollections.forEach((collection) => collectionList.append(collectionCard(collection, savedById)));
  }

  function renderDashboard() {
    const root = document.querySelector("[data-wirkungsraum-dashboard]");
    if (!root) return;

    const lastVisit = WoekUserSpace.getSetting("last_wirkungsraum_visit", null);
    const validLastVisit = parseContentDate(lastVisit);
    const note = root.querySelector("[data-last-visit-note]");
    if (note) {
      note.textContent = validLastVisit
        ? `Letzter Besuch deines Wirkungsraums: ${validLastVisit.toLocaleString("de-DE")}.`
        : "Dies ist dein erster gültiger Dashboard-Besuch in diesem Browser. Ab jetzt erscheinen hier nur wirklich neue Veröffentlichungen.";
    }
    WoekUserSpace.setSetting("last_wirkungsraum_visit", new Date().toISOString());

    if (root.dataset.wirkungsraumDashboardBound !== "true") {
      root.dataset.wirkungsraumDashboardBound = "true";
      root.addEventListener("input", (event) => {
        if (event.target instanceof HTMLInputElement && (event.target.matches("[data-saved-search]") || event.target.matches("[data-saved-filter]"))) {
          drawSavedDashboard(root);
        }
      });
      root.addEventListener("change", (event) => {
        const statusSelect = event.target instanceof HTMLElement ? event.target.closest("[data-learning-status]") : null;
        if (statusSelect instanceof HTMLSelectElement) {
          updateLearningStatus(statusSelect.dataset.learningStatus || "", statusSelect.value);
          drawLearningDashboard(root);
          drawNextStepsDashboard(root);
        }
        const importInput = event.target instanceof HTMLElement ? event.target.closest("[data-import-wirkungsraum-file]") : null;
        if (importInput instanceof HTMLInputElement && importInput.files?.[0]) {
          const file = importInput.files[0];
          const modeSelect = root.querySelector("[data-import-wirkungsraum-mode]");
          const mode = modeSelect instanceof HTMLSelectElement && modeSelect.value === "replace" ? "replace" : "merge";
          file
            .text()
            .then((text) => {
              const payload = JSON.parse(text);
              const result = WoekUserSpace.importData(payload, { mode });
              if (!result.ok) {
                dataStatus(root, result.error || "Import fehlgeschlagen.", "error");
                return;
              }
              refreshDashboardPanels(root);
              const conflictNote = result.conflicts?.length
                ? ` ${result.conflicts.length} mögliche Konflikte wurden lokal nach Zeitstempel aufgelöst.`
                : "";
              dataStatus(
                root,
                `Import abgeschlossen: ${result.imported.length} Kategorien ${mode === "replace" ? "ersetzt" : "zusammengeführt"}.${conflictNote}`,
                "success"
              );
            })
            .catch(() => dataStatus(root, "Import fehlgeschlagen: Die Datei ist keine gültige Wirkungsraum-JSON-Datei.", "error"))
            .finally(() => {
              importInput.value = "";
            });
        }
      });
      root.addEventListener("submit", (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        if (form.matches("[data-collection-create-form]")) {
          event.preventDefault();
          const title = form.querySelector("[name='collection-title']")?.value || "";
          const description = form.querySelector("[name='collection-description']")?.value || "";
          if (createCollection(title, description)) form.reset();
          drawCollectionsDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        if (form.matches("[data-collection-edit-form]")) {
          event.preventDefault();
          const card = form.closest("[data-collection-id]");
          if (!(card instanceof HTMLElement)) return;
          const title = form.querySelector("[name='collection-title']")?.value || "";
          const description = form.querySelector("[name='collection-description']")?.value || "";
          updateCollection(card.dataset.collectionId || "", { title, description });
          drawCollectionsDashboard(root);
          drawNextStepsDashboard(root);
        }
      });
      root.addEventListener("click", (event) => {
        const filterButton = event.target instanceof HTMLElement ? event.target.closest("[data-saved-type-filter]") : null;
        if (filterButton instanceof HTMLButtonElement) {
          root.dataset.savedTypeFilter = filterButton.dataset.savedTypeFilter || "all";
          drawSavedDashboard(root);
          return;
        }
        const remove = event.target instanceof HTMLElement ? event.target.closest("[data-remove-saved]") : null;
        if (remove instanceof HTMLButtonElement) {
          removeItem(remove.dataset.removeSaved || "");
          drawSavedDashboard(root);
          drawCollectionsDashboard(root);
          drawRelatedDashboard(root);
          drawNextStepsDashboard(root);
          dataStatus(root, "Merkliste gelöscht. Sammlungen wurden von Verweisen auf gelöschte Inhalte bereinigt.", "success");
          return;
        }
        const showLocalData = event.target instanceof HTMLElement ? event.target.closest("[data-show-local-data]") : null;
        if (showLocalData instanceof HTMLButtonElement) {
          dataStatus(root, `Nur in deinem Browser gespeichert: ${localDataSummary()}.`, "success");
          return;
        }
        const createRecovery = event.target instanceof HTMLElement ? event.target.closest("[data-create-recovery-link]") : null;
        if (createRecovery instanceof HTMLButtonElement) {
          const includeNotes = root.querySelector("[data-recovery-include-notes]") instanceof HTMLInputElement
            ? root.querySelector("[data-recovery-include-notes]").checked
            : false;
          const expirySelect = root.querySelector("[data-recovery-expiry]");
          const expiry = expirySelect instanceof HTMLSelectElement ? expirySelect.value : "30";
          const packageData = WoekUserSpace.createRecoveryPackage({ includeNotes, expiry });
          const link = recoveryLink(packageData);
          setRecoveryOutput(root, packageData, link);
          createRecovery.textContent = "Link erstellt";
          window.setTimeout(() => (createRecovery.textContent = "Privaten Wiederherstellungslink erstellen"), 1400);
          return;
        }
        const copyRecovery = event.target instanceof HTMLElement ? event.target.closest("[data-copy-recovery-link]") : null;
        if (copyRecovery instanceof HTMLButtonElement) {
          if (!currentRecoveryLink) {
            dataStatus(root, "Erstelle zuerst einen privaten Wiederherstellungslink.", "error");
            return;
          }
          copyText(currentRecoveryLink)
            .then(() => dataStatus(root, "Privater Wiederherstellungslink kopiert.", "success"))
            .catch(() => dataStatus(root, "Kopieren ist in diesem Browser nicht verfügbar. Markiere den Link im Feld und kopiere ihn manuell.", "error"));
          return;
        }
        const toggleQr = event.target instanceof HTMLElement ? event.target.closest("[data-toggle-recovery-qr]") : null;
        if (toggleQr instanceof HTMLButtonElement) {
          if (!currentRecoveryLink) {
            dataStatus(root, "Erstelle zuerst einen privaten Wiederherstellungslink.", "error");
            return;
          }
          renderRecoveryQr(root);
          return;
        }
        const exportRecovery = event.target instanceof HTMLElement ? event.target.closest("[data-export-recovery-file]") : null;
        if (exportRecovery instanceof HTMLButtonElement) {
          if (!currentRecoveryPackage || !currentRecoveryLink) {
            dataStatus(root, "Erstelle zuerst einen privaten Wiederherstellungslink.", "error");
            return;
          }
          downloadJsonFile(recoveryFileName(), JSON.stringify({ ...currentRecoveryPackage, recovery_link: currentRecoveryLink }, null, 2));
          dataStatus(root, "Wiederherstellungslink als Datei exportiert.", "success");
          return;
        }
        const recoveryImport = event.target instanceof HTMLElement ? event.target.closest("[data-recovery-import-mode]") : null;
        if (recoveryImport instanceof HTMLButtonElement) {
          if (!pendingRecoveryPackage) {
            dataStatus(root, "Kein Wiederherstellungslink geladen.", "error");
            return;
          }
          const mode = recoveryImport.dataset.recoveryImportMode === "replace" ? "replace" : "merge";
          const result = WoekUserSpace.importData(pendingRecoveryPackage, { mode });
          if (!result.ok) {
            dataStatus(root, result.error || "Wiederherstellung fehlgeschlagen.", "error");
            return;
          }
          pendingRecoveryPackage = null;
          const panel = root.querySelector("[data-recovery-import-panel]");
          if (panel instanceof HTMLElement) panel.hidden = true;
          cleanRecoveryHash();
          refreshDashboardPanels(root);
          const conflictNote = result.conflicts?.length ? ` ${result.conflicts.length} mögliche Konflikte wurden nach Zeitstempel aufgelöst.` : "";
          dataStatus(root, `Wirkungsraum ${mode === "replace" ? "ersetzt" : "zusammengeführt"}.${conflictNote}`, "success");
          return;
        }
        const cancelRecoveryImport = event.target instanceof HTMLElement ? event.target.closest("[data-recovery-import-cancel]") : null;
        if (cancelRecoveryImport instanceof HTMLButtonElement) {
          pendingRecoveryPackage = null;
          const panel = root.querySelector("[data-recovery-import-panel]");
          if (panel instanceof HTMLElement) panel.hidden = true;
          cleanRecoveryHash();
          dataStatus(root, "Wiederherstellung abgebrochen. Lokale Daten bleiben unverändert.", "success");
          return;
        }
        const resetObject = event.target instanceof HTMLElement ? event.target.closest("[data-reset-wirkungsraum-object]") : null;
        if (resetObject instanceof HTMLButtonElement) {
          const objectName = resetObject.dataset.resetWirkungsraumObject || "";
          const label = resetObjectLabels[objectName] || "Kategorie";
          if (!window.confirm(`${label} lokal aus diesem Browser löschen?`)) return;
          WoekUserSpace.resetObject(objectName);
          if (objectName === "saved_items") clearCollectionItemIds();
          refreshDashboardPanels(root);
          dataStatus(root, `${label} gelöscht.`, "success");
          return;
        }
        const resetAll = event.target instanceof HTMLElement ? event.target.closest("[data-reset-wirkungsraum-all]") : null;
        if (resetAll instanceof HTMLButtonElement) {
          if (!window.confirm("Alle lokalen Wirkungsraum-Daten in diesem Browser löschen? Dies betrifft Merkliste, Fortschritt, Sammlungen, Lernliste, Notizen, Besuchshistorie und Einstellungen.")) return;
          WoekUserSpace.resetAll();
          WoekUserSpace.setSetting("last_wirkungsraum_visit", new Date().toISOString());
          refreshDashboardPanels(root, null);
          dataStatus(root, "Alle lokalen Wirkungsraum-Daten wurden gelöscht.", "success");
          return;
        }
        const importTrigger = event.target instanceof HTMLElement ? event.target.closest("[data-import-wirkungsraum-trigger]") : null;
        if (importTrigger instanceof HTMLButtonElement) {
          const importInput = root.querySelector("[data-import-wirkungsraum-file]");
          if (importInput instanceof HTMLInputElement) importInput.click();
          return;
        }
        const removeLearning = event.target instanceof HTMLElement ? event.target.closest("[data-remove-learning]") : null;
        if (removeLearning instanceof HTMLButtonElement) {
          removeLearningItem(removeLearning.dataset.removeLearning || "");
          drawLearningDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        const removeNoteButton = event.target instanceof HTMLElement ? event.target.closest("[data-remove-note]") : null;
        if (removeNoteButton instanceof HTMLButtonElement && window.confirm("Diese lokale Notiz löschen?")) {
          removeNote(removeNoteButton.dataset.removeNote || "");
          drawNotesDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        const learningSuggestion = event.target instanceof HTMLElement ? event.target.closest("[data-add-learning-suggestion]") : null;
        if (learningSuggestion instanceof HTMLButtonElement) {
          const part = academyParts.find((entry) => entry.id === learningSuggestion.dataset.addLearningSuggestion);
          if (part) {
            upsertLearningItem(academyItemFromPart(part));
            drawLearningDashboard(root);
            drawNextStepsDashboard(root);
          }
          return;
        }
        const clear = event.target instanceof HTMLElement ? event.target.closest("[data-clear-wirkungsraum]") : null;
        if (clear instanceof HTMLButtonElement && window.confirm("Alle lokal gemerkten Inhalte aus diesem Browser löschen?")) {
          WoekUserSpace.resetObject("saved_items");
          clearCollectionItemIds();
          drawSavedDashboard(root);
          drawCollectionsDashboard(root);
          drawRelatedDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        const templateButton = event.target instanceof HTMLElement ? event.target.closest("[data-collection-template]") : null;
        if (templateButton instanceof HTMLButtonElement) {
          createCollection(templateButton.dataset.collectionTemplate || templateButton.textContent || "", templateButton.dataset.collectionDescription || "");
          drawCollectionsDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        const editButton = event.target instanceof HTMLElement ? event.target.closest("[data-edit-collection]") : null;
        if (editButton instanceof HTMLButtonElement) {
          const card = editButton.closest("[data-collection-id]");
          if (card instanceof HTMLElement) {
            const view = card.querySelector("[data-collection-view]");
            const form = card.querySelector("[data-collection-edit-form]");
            if (view instanceof HTMLElement && form instanceof HTMLElement) {
              view.hidden = true;
              form.hidden = false;
              form.querySelector("input")?.focus();
            }
          }
          return;
        }
        const cancelEdit = event.target instanceof HTMLElement ? event.target.closest("[data-cancel-collection-edit]") : null;
        if (cancelEdit instanceof HTMLButtonElement) {
          drawCollectionsDashboard(root);
          return;
        }
        const deleteButton = event.target instanceof HTMLElement ? event.target.closest("[data-delete-collection]") : null;
        if (deleteButton instanceof HTMLButtonElement && window.confirm("Diese Sammlung löschen? Die gemerkten Inhalte bleiben erhalten.")) {
          deleteCollection(deleteButton.dataset.deleteCollection || "");
          drawCollectionsDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        const removeCollectionItem = event.target instanceof HTMLElement ? event.target.closest("[data-remove-collection-item]") : null;
        if (removeCollectionItem instanceof HTMLButtonElement) {
          removeItemFromCollection(removeCollectionItem.dataset.collectionId || "", removeCollectionItem.dataset.itemId || "");
          drawCollectionsDashboard(root);
          drawNextStepsDashboard(root);
          return;
        }
        const exportButton = event.target instanceof HTMLElement ? event.target.closest("[data-export-wirkungsraum]") : null;
        if (exportButton instanceof HTMLButtonElement) {
          const payload = JSON.stringify(WoekUserSpace.exportData(), null, 2);
          downloadJsonFile(exportFileName(), payload);
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(payload).catch(() => {});
          }
          dataStatus(root, "JSON-Export wurde erstellt. Eine Kopie liegt zusätzlich in der Zwischenablage, falls der Browser das erlaubt.", "success");
          exportButton.textContent = "JSON exportiert";
          window.setTimeout(() => (exportButton.textContent = "JSON exportieren"), 1400);
        }
      });
      window.addEventListener("hashchange", () => handleRecoveryHash(root));
    }

    refreshDashboardPanels(root, validLastVisit ? validLastVisit.toISOString() : null);
    handleRecoveryHash(root);
  }

  function comparablePath(value) {
    try {
      const url = new URL(value || "/", window.location.origin);
      if (url.origin !== window.location.origin) return "";
      const path = url.pathname.replace(/\/index\.html$/, "/");
      return path.length > 1 ? path.replace(/\/$/, "") : path;
    } catch {
      return "";
    }
  }

  function savedPathSet() {
    const paths = new Set();
    savedItems().forEach((item) => {
      [item.url, item.href].forEach((value) => {
        const path = comparablePath(value);
        if (path) paths.add(path);
      });
    });
    return paths;
  }

  function hubFilterConfig(path = window.location.pathname) {
    const normalized = path.replace(/\/index\.html$/, "/");
    if (normalized === "/begriffe/" || normalized === "/glossar/" || normalized === "/glossar.html") {
      return {
        kind: "glossar",
        label: "Nur gemerkte Begriffe anzeigen",
        countLabel: "gemerkte Begriffe",
        empty: "In diesem Browser sind noch keine Begriffe gemerkt."
      };
    }
    if (normalized === "/suche/" || normalized === "/suche.html") {
      return {
        kind: "suche",
        label: "Nur meine gemerkten Inhalte",
        countLabel: "gemerkte Treffer",
        empty: "Zu dieser Suche sind keine gemerkten Inhalte sichtbar."
      };
    }
    if (
      normalized === "/bibliothek/" ||
      normalized === "/downloads/" ||
      normalized === "/downloads.html" ||
      normalized === "/werkstatt/arbeitsbibliothek/"
    ) {
      return { kind: "bibliothek", label: "Nur gemerkt", countLabel: "gemerkte Inhalte", empty: "In diesem Verzeichnis ist noch nichts gemerkt." };
    }
    if (normalized === "/referenz/" || normalized === "/buch/" || normalized === "/buch.html") {
      return {
        kind: "referenz",
        label: "Merkliste",
        countLabel: "gemerkt",
        empty: "Noch keine Kapitel in deiner Merkliste.",
        emptyHelp: "Tippe bei einem Kapitel auf „Merken“, dann erscheint es hier.",
        allLabel: "Alle Kapitel",
        savedLabel: "Merkliste"
      };
    }
    if (
      normalized === "/wirkungsradar/" ||
      normalized === "/wirkungsradar/live/" ||
      normalized === "/wirkungsradar/debattenkarten/" ||
      normalized === "/wirkungsradar/antwort-playbooks/" ||
      normalized === "/wirkungsradar/narrative/" ||
      normalized === "/wirkungsradar/themen/"
    ) {
      return { kind: "debatten", label: "Nur gemerkt", countLabel: "gemerkte Debatten", empty: "Im Debatten-Kompass ist noch keine Seite gemerkt." };
    }
    if (normalized === "/werkzeuge/" || normalized === "/tools/" || normalized === "/methoden/" || normalized === "/methodik/") {
      return { kind: "werkzeuge", label: "Nur gemerkt", countLabel: "gemerkte Werkzeuge", empty: "In Methoden & Werkzeugen ist noch nichts gemerkt." };
    }
    if (normalized === "/akademie/" || normalized === "/akademie.html") {
      return { kind: "akademie", label: "Nur gemerkt", countLabel: "gemerkte Akademie-Inhalte", empty: "In der Akademie ist noch nichts gemerkt." };
    }
    return null;
  }

  const hubCandidateSelector = [
    "[data-radar-card]",
    "[data-glossary-card]",
    "[data-document-card]",
    "[data-tool-card]",
    "[data-wirkungsraum-card]",
    "[data-search-results] .search-result-card",
    ".card-grid > article",
    ".card-grid > a",
    ".document-card-grid > article",
    ".document-card-grid > a",
    ".reference-card-grid > article",
    ".reference-card-grid > a",
    ".chapter-card-grid > article",
    ".chapter-card-grid > a",
    "article.glossary-result-card",
    "article.card",
    "a.card"
  ].join(",");

  function localContentLinks(element) {
    const links = [];
    if (element instanceof HTMLAnchorElement) links.push(element);
    element.querySelectorAll("a[href]").forEach((link) => {
      if (link instanceof HTMLAnchorElement) links.push(link);
    });
    return links.filter((link, index, list) => {
      if (list.indexOf(link) !== index) return false;
      if (link.closest("[data-search-exclude], .breadcrumb, .site-nav, .footer, .footer-nav, .footer-legal-nav, .glossary-card, .glossary-sheet, .glossary-term, .tool-term-tooltip")) return false;
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return false;
      return Boolean(comparablePath(link.href));
    });
  }

  function referenceChapterCards(root) {
    return Array.from(root.querySelectorAll(".chapter-card-grid[data-chapter-grid] > .chapter-card")).filter((element) => element instanceof HTMLElement);
  }

  function hubCandidates(root, config = null) {
    if (config?.kind === "referenz") return referenceChapterCards(root);
    const candidates = Array.from(root.querySelectorAll(hubCandidateSelector)).filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      if (element.closest("[data-wirkungsraum-hub-filter], [data-search-exclude], header, footer, nav, .breadcrumb")) return false;
      return localContentLinks(element).length > 0;
    });
    return Array.from(new Set(candidates));
  }

  function candidateIsSaved(element, savedPaths) {
    return localContentLinks(element).some((link) => savedPaths.has(comparablePath(link.href)));
  }

  function uniqueCompactStrings(values, limit = 12) {
    const seen = new Set();
    const result = [];
    values.forEach((value) => {
      const text = String(value || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const key = text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      result.push(text);
    });
    return result.slice(0, limit);
  }

  function referenceChapterItem(card) {
    if (!(card instanceof HTMLElement)) return null;
    const link = card.querySelector(".chapter-card-main[href]");
    if (!(link instanceof HTMLAnchorElement)) return null;
    const path = new URL(link.href, window.location.origin).pathname.replace(/\/index\.html$/, "/");
    const title = (card.querySelector("h3")?.textContent || link.textContent || "Referenzkapitel").replace(/\s+/g, " ").trim();
    const number = (card.querySelector(".chapter-number")?.textContent || "").replace(/\s+/g, " ").trim();
    const meta = Array.from(card.querySelectorAll(".chapter-card-meta span")).map((node) => node.textContent || "");
    const pills = Array.from(card.querySelectorAll(".reference-pill-list li")).map((node) => node.textContent || "");
    const tags = uniqueCompactStrings([...meta, ...pills], 10);
    return {
      id: path.replace(/^\/+/, "") || "referenz/",
      type: "Kapitel",
      title: number ? `${number}: ${title}` : title,
      url: path,
      saved_at: new Date().toISOString(),
      tags,
      category: meta[0] || "Online-Referenz"
    };
  }

  function itemSavedByPath(item, savedPaths = savedPathSet()) {
    return Boolean(item?.id && (isSaved(item.id) || savedPaths.has(comparablePath(item.url))));
  }

  function removeItemByPath(item) {
    const targetPath = comparablePath(item?.url);
    const ids = savedItems()
      .filter((saved) => saved.id === item?.id || comparablePath(saved.url) === targetPath || comparablePath(saved.href) === targetPath)
      .map((saved) => saved.id)
      .filter(Boolean);
    if (!ids.length && item?.id) {
      removeItem(item.id);
      return;
    }
    Array.from(new Set(ids)).forEach((id) => removeItem(id));
  }

  function renderReferenceChapterBookmark(card, savedPaths = savedPathSet()) {
    const item = referenceChapterItem(card);
    if (!item) return;
    let row = card.querySelector("[data-reference-bookmark-row]");
    if (!row) {
      row = document.createElement("div");
      row.className = "reference-bookmark-row";
      row.dataset.referenceBookmarkRow = "true";
      row.innerHTML = `
        <span class="reference-bookmark-status" data-reference-bookmark-status hidden>★ Gemerkt</span>
        <button class="reference-bookmark-button" type="button" data-reference-bookmark-button></button>
      `;
      const meta = card.querySelector(".chapter-card-meta");
      if (meta) meta.insertAdjacentElement("afterend", row);
      else card.append(row);
    }

    const saved = itemSavedByPath(item, savedPaths);
    const status = row.querySelector("[data-reference-bookmark-status]");
    const button = row.querySelector("[data-reference-bookmark-button]");
    if (status instanceof HTMLElement) status.hidden = !saved;
    if (button instanceof HTMLButtonElement) {
      button.textContent = saved ? "Nicht mehr merken" : "☆ Merken";
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-pressed", String(saved));
      button.setAttribute("aria-label", saved ? `${item.title} aus der Merkliste entfernen` : `${item.title} merken`);
      if (!button.dataset.referenceBookmarkBound) {
        button.dataset.referenceBookmarkBound = "true";
        button.addEventListener("click", () => {
          const nextItem = referenceChapterItem(card);
          if (!nextItem) return;
          if (itemSavedByPath(nextItem)) removeItemByPath(nextItem);
          else saveItem({ ...nextItem, saved_at: new Date().toISOString() });
          renderReferenceChapterBookmark(card);
        });
      }
    }
  }

  function renderReferenceChapterBookmarks(root) {
    const paths = savedPathSet();
    referenceChapterCards(root).forEach((card) => renderReferenceChapterBookmark(card, paths));
  }

  function insertHubFilter(root, config, control) {
    if (config.kind === "referenz") {
      const filterbar = root.querySelector("#kapitel [data-reference-filterbar]");
      if (filterbar) {
        filterbar.insertAdjacentElement("beforebegin", control);
        return;
      }
    }
    if (config.kind === "suche") {
      const target = root.querySelector(".search-quick-filter-panel") || root.querySelector(".search-box");
      if (target) {
        target.insertAdjacentElement("afterend", control);
        return;
      }
    }
    const hero = root.querySelector(".hero, .radar-hero, .page-hero, .wirkungsraum-hero");
    if (hero) {
      hero.insertAdjacentElement("afterend", control);
      return;
    }
    const firstSection = root.querySelector(".section, .content-band, .search-shell");
    root.insertBefore(control, firstSection || root.firstChild);
  }

  function initReferenceSavedFilter(root, config) {
    const control = document.createElement("section");
    control.className = "wirkungsraum-hub-filter wirkungsraum-reference-filter";
    control.dataset.wirkungsraumHubFilter = config.kind;
    control.dataset.searchExclude = "true";
    control.innerHTML = `
      <div class="wirkungsraum-reference-filter-copy">
        <p class="card-kicker">Merkliste</p>
        <strong>Kapitelansicht</strong>
      </div>
      <div class="wirkungsraum-segmented-control" role="group" aria-label="Kapitelansicht wählen">
        <button type="button" aria-pressed="true" data-reference-view="all">${escapeHtml(config.allLabel)}</button>
        <button type="button" aria-pressed="false" data-reference-view="saved">${escapeHtml(config.savedLabel)}</button>
      </div>
      <span class="wirkungsraum-hub-filter-count" data-wirkungsraum-hub-filter-count aria-live="polite"></span>
      <div class="wirkungsraum-hub-empty wirkungsraum-reference-empty" data-wirkungsraum-hub-empty hidden>
        <strong>${escapeHtml(config.empty)}</strong>
        <span>${escapeHtml(config.emptyHelp)}</span>
        <button class="text-link" type="button" data-reference-show-all>Alle Kapitel anzeigen</button>
      </div>
    `;
    insertHubFilter(root, config, control);

    const allButton = control.querySelector("[data-reference-view='all']");
    const savedButton = control.querySelector("[data-reference-view='saved']");
    const count = control.querySelector("[data-wirkungsraum-hub-filter-count]");
    const empty = control.querySelector("[data-wirkungsraum-hub-empty]");
    let mode = "all";

    const setMode = (nextMode) => {
      mode = nextMode === "saved" ? "saved" : "all";
      [allButton, savedButton].forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) return;
        const active = button.dataset.referenceView === mode;
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("active", active);
      });
      apply();
    };

    const apply = () => {
      renderReferenceChapterBookmarks(root);
      const cards = referenceChapterCards(root);
      const paths = savedPathSet();
      let savedCount = 0;

      cards.forEach((card) => {
        const item = referenceChapterItem(card);
        const saved = itemSavedByPath(item, paths);
        if (saved) savedCount += 1;
        if (mode === "saved" && !saved) card.dataset.wirkungsraumFilterHidden = "true";
        else delete card.dataset.wirkungsraumFilterHidden;
      });

      if (count) {
        count.textContent = mode === "saved"
          ? `${savedCount} gemerkt · ${cards.length} Kapitel gesamt`
          : `${savedCount} gemerkt · ${cards.length} Kapitel gesamt`;
      }
      if (empty instanceof HTMLElement) empty.hidden = !(mode === "saved" && savedCount === 0);
    };

    if (allButton instanceof HTMLButtonElement) allButton.addEventListener("click", () => setMode("all"));
    if (savedButton instanceof HTMLButtonElement) savedButton.addEventListener("click", () => setMode("saved"));
    control.querySelector("[data-reference-show-all]")?.addEventListener("click", () => setMode("all"));

    let pending = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(apply, 80);
    });
    observer.observe(root, { childList: true, subtree: true });
    document.addEventListener("wirkungsraum:changed", apply);
    apply();
    window.setTimeout(apply, 250);
  }

  function initSavedOnlyHubFilters() {
    const config = hubFilterConfig();
    if (!config) return;
    const root = document.querySelector("main");
    if (!root || document.querySelector("[data-wirkungsraum-hub-filter]")) return;
    if (config.kind === "referenz") {
      initReferenceSavedFilter(root, config);
      return;
    }

    const control = document.createElement("section");
    control.className = `wirkungsraum-hub-filter wirkungsraum-hub-filter-${config.kind}`;
    control.dataset.wirkungsraumHubFilter = config.kind;
    control.dataset.searchExclude = "true";
    control.innerHTML = `
      <button class="filter-chip" type="button" aria-pressed="false" data-wirkungsraum-saved-only>${escapeHtml(config.label)}</button>
      <span class="wirkungsraum-hub-filter-count" data-wirkungsraum-hub-filter-count></span>
      <p class="wirkungsraum-hub-empty" data-wirkungsraum-hub-empty hidden>${escapeHtml(config.empty)}</p>
    `;
    insertHubFilter(root, config, control);

    const button = control.querySelector("[data-wirkungsraum-saved-only]");
    const count = control.querySelector("[data-wirkungsraum-hub-filter-count]");
    const empty = control.querySelector("[data-wirkungsraum-hub-empty]");
    if (!(button instanceof HTMLButtonElement)) return;

    const apply = () => {
      const active = button.getAttribute("aria-pressed") === "true";
      const paths = savedPathSet();
      const candidates = hubCandidates(root, config);
      let savedCount = 0;

      candidates.forEach((candidate) => {
        const saved = candidateIsSaved(candidate, paths);
        if (saved) savedCount += 1;
        if (active && !saved) candidate.dataset.wirkungsraumFilterHidden = "true";
        else delete candidate.dataset.wirkungsraumFilterHidden;
      });

      button.classList.toggle("active", active);
      if (count) {
        count.textContent = active
          ? `${savedCount} von ${candidates.length} sichtbar`
          : `${savedCount} ${config.countLabel}`;
      }
      if (empty instanceof HTMLElement) empty.hidden = !(active && savedCount === 0);
    };

    button.addEventListener("click", () => {
      const active = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(active));
      apply();
    });

    let pending = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(apply, 80);
    });
    observer.observe(root, { childList: true, subtree: true });
    document.addEventListener("wirkungsraum:changed", apply);
    window.setTimeout(apply, 50);
    window.setTimeout(apply, 500);
  }

  function initGlossaryLearningFilter() {
    const path = window.location.pathname;
    if (!/\/begriffe\/|\/glossar/.test(path)) return;
    const main = document.querySelector("main");
    if (!main || document.querySelector("[data-glossary-saved-filter]")) return;

    const panel = document.createElement("section");
    panel.className = "section section-soft glossary-saved-filter";
    panel.dataset.glossarySavedFilter = "true";
    panel.innerHTML = `
      <div>
        <div class="section-header compact">
          <p class="hero-kicker">Lernmodus</p>
          <h2>Gemerkte Begriffe üben</h2>
          <p>Schalte auf „nur gemerkte Begriffe“, wenn du dein persönliches Glossar wiederholen willst.</p>
          <button class="btn btn-secondary" type="button" data-show-saved-terms>Nur gemerkte Begriffe</button>
        </div>
      </div>
    `;
    const firstSection = main.querySelector(".section");
    main.insertBefore(panel, firstSection || main.firstChild);

    panel.querySelector("[data-show-saved-terms]")?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      if (!(button instanceof HTMLButtonElement)) return;
      const onlySaved = button.dataset.active !== "true";
      button.dataset.active = String(onlySaved);
      button.textContent = onlySaved ? "Alle Begriffe zeigen" : "Nur gemerkte Begriffe";
      const savedUrls = new Set(savedItems().filter((item) => item.type === "Begriff" || item.type === "Glossar").map((item) => item.url.replace(/\/$/, "")));
      document.querySelectorAll("a[href*='/begriffe/']").forEach((link) => {
        const href = link.getAttribute("href") || "";
        const normalized = new URL(href, window.location.origin).pathname.replace(/\/$/, "");
        const holder = link.closest("article, li, .card") || link;
        if (holder instanceof HTMLElement) holder.hidden = onlySaved && !savedUrls.has(normalized);
      });
    });
  }

  function decorateProgressLinks() {
    const progress = WoekUserSpace.getRecordItems("reading_progress");
    document.querySelectorAll("a[href]").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement) || link.dataset.progressDecorated) return;
      const path = new URL(link.href, window.location.origin).pathname.replace(/\/index\.html$/, "/");
      const item = progress[path] || progress[`${path}/`];
      if (!item) return;
      const marker = document.createElement("span");
      marker.className = "wirkungsraum-progress-dot";
      const status = itemStatus(item);
      marker.textContent = statusSymbol(status);
      marker.title = `Lesestatus: ${statusLabel(status)}, ${normalizedProgress(item.progress)}%`;
      link.prepend(marker, " ");
      link.dataset.progressDecorated = "true";
    });
  }

  function trackVisit() {
    const path = window.location.pathname;
    if (!isContentPath(path)) return;
    WoekUserSpace.recordVisit(currentItem());
  }

  function init() {
    trackVisit();
    injectSaveButton();
    injectCollectionButton();
    injectLearningButton();
    injectNotePanel();
    restoreReadingPosition();
    trackReadingProgress();
    renderDashboard();
    initSavedOnlyHubFilters();
    decorateProgressLinks();
    document.addEventListener("wirkungsraum:changed", () => {
      renderDashboard();
      decorateProgressLinks();
    });
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  ToolExplanationLayer.init();
  ToolSpecialBoxLayer.init();
  GenericToolPageExplanationLayer.init();
  FundingSourceLayer.init();
  ResultInterpretationLayer.init();
  ToolTermInlineLayer.init();
  MethodToolFilterLayer.init();
  CopyAnswerLayer.init();
  WirkungsraumLayer.init();
});

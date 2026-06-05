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

if (siteNav && !document.querySelector(".site-search-shortcut") && !Array.from(siteNav.querySelectorAll("a")).some((link) => /suche\.html/.test(link.getAttribute("href") || ""))) {
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

document.querySelectorAll(".site-nav a").forEach((link) => {
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
      <h2 id="contextual-related-questions-title">Kontext einordnen</h2>
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

function sendSiteAnalyticsEvent(eventType, details = {}) {
  if (shouldSkipSiteAnalytics()) {
    return;
  }

  const payload = JSON.stringify({
    eventType,
    path: `${window.location.pathname}${window.location.search}`,
    title: details.title || document.title,
    referrer: document.referrer,
    sessionId: getSiteAnalyticsSessionId(),
    visitorId: getSiteAnalyticsVisitorId(),
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
    if (count) count.textContent = `${visible} Karten gefunden`;
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
  if (!mainElement) {
    return;
  }

  const path = window.location.pathname;
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  const isRadarPage = normalizedPath.includes("/wirkungsradar/");

  if (isRadarPage || document.querySelector("[data-global-radar-bridge]") || document.querySelector(".document-paper-reader")) {
    return;
  }

  const configs = [
    {
      test: () => path === "/" || /\/index\.html$/.test(path),
      kicker: "Wirkungsradar",
      title: "Öffentliche Aussagen im Folgencheck",
      text:
        "Nicht jede Debatte scheitert an fehlenden Fakten. Viele scheitern an Narrativen, Frames, psychologischen Triggern und falschen Schlussfolgerungen. Der Wirkungsradar zeigt, was stimmt, was fehlt, welches Narrativ wirkt und welche Antwort Mensch, Planet und Demokratie stärkt.",
      ctas: [
        ["Wirkungsradar öffnen", "wirkungsradar/"],
        ["Live-Antworten ansehen", "wirkungsradar/live/"],
        ["Narrative verstehen", "wirkungsradar/narrative/"],
      ],
      cards: [
        ["Deutschland nur 2 %?", "Verantwortung ohne Zahlenverkürzung verstehen.", "wirkungsradar/live/deutschland-nur-zwei-prozent/"],
        ["CO₂-Preis oder fossile Systemkosten?", "Kosten sichtbar machen, statt Ursachen zu verdecken.", "wirkungsradar/live/co2-preis-oder-fossile-systemkosten/"],
        ["Man darf ja nichts mehr sagen", "Meinungsfreiheit, Widerspruch und Opferumkehr trennen.", "wirkungsradar/live/man-darf-ja-nichts-mehr-sagen/"],
      ],
    },
    {
      test: () => /\/(verstehen|wirkungsoekonomie|modell|ordnung|kompass|begriffe|glossar)/.test(normalizedPath),
      kicker: "Vom Begriff zur Debatte",
      title: "Wie diese Logik in öffentlichen Debatten wirkt.",
      text:
        "Die Wirkungsökonomie erklärt, wie Wirkung entsteht und bewertet wird. Der Wirkungsradar zeigt diese Logik praktisch: bei Mythen, Narrativen, Stöckchen, Desinformation und falschen Schlussfolgerungen.",
      ctas: [["Zum Wirkungsradar", "wirkungsradar/"], ["Methode ansehen", "wirkungsradar/methode/"]],
      cards: [
        ["Wirkungspfad anwenden", "Vom Satz zum möglichen gesellschaftlichen Wirkungspfad.", "wirkungsradar/methode/"],
        ["Narrative erkennen", "Ohnmacht, Verzögerung, Opferumkehr und Feindbilder einordnen.", "wirkungsradar/narrative/"],
        ["Live-Karten nutzen", "Kurze Antworten für Debatten, Hosts und Kommentarspalten.", "wirkungsradar/live/"],
      ],
    },
    {
      test: () => /\/wirkungsfelder\//.test(normalizedPath),
      kicker: "Typische Narrative in diesem Wirkungsfeld",
      title: "Sachfragen und Debattenframes gemeinsam prüfen.",
      text:
        "In Wirkungsfeldern entstehen nicht nur Sachfragen, sondern wiederkehrende Narrative. Der Wirkungsradar prüft, welche Aussagen Fakten verkürzen, welche psychologischen Hebel sie nutzen und welche Wirkung sie auf Mensch, Planet und Demokratie haben.",
      ctas: [["Alle Narrative ansehen", "wirkungsradar/narrative/"], ["Themencluster öffnen", "wirkungsradar/themen/"]],
      cards: [
        ["Klima & Energie", "2-Prozent-Argument, Windräder, CO₂-Preis und Transformationsframes.", "wirkungsradar/themen/klima-energie/"],
        ["Demokratie & Öffentlichkeit", "Meinungsfreiheit, Medienvertrauen, SDGs und Desinformation.", "wirkungsradar/themen/demokratie-oeffentlichkeit/"],
        ["Wirkungsrisiken", "Welche Folgen entstehen, wenn Frames politische Handlung blockieren?", "wirkungsradar/methode/"],
      ],
    },
    {
      test: () => /\/(werkzeuge|tools|methodik|scanner)/.test(normalizedPath),
      kicker: "Methoden & Werkzeuge",
      title: "Der Wirkungsradar ist Wirkungslogik für öffentliche Kommunikation.",
      text:
        "Als Werkzeug verbindet der Wirkungsradar Faktenlage, Narrativanalyse, psychologischen Wirkungscheck, Wirkungspfad, Folgenanalyse und wirkungsökonomische Antwort.",
      ctas: [["Wirkungsradar öffnen", "wirkungsradar/"], ["Live-Antworten öffnen", "wirkungsradar/live/"]],
      cards: [
        ["Folgencheck", "Nicht nur prüfen, ob etwas stimmt, sondern was daraus folgt.", "wirkungsradar/methode/"],
        ["SDG+ in Debatten", "Mensch, Planet und Demokratie als Maßstab für öffentliche Aussagen.", "wirkungsradar/themen/"],
        ["Quellenstand", "Dossiers mit Faktenlage, Quellen und Datenstand verbinden.", "wirkungsradar/detail/"],
      ],
    },
    {
      test: () => /\/erleben\//.test(normalizedPath),
      kicker: "Interaktive Anwendung",
      title: "Wirkungsradar-Demo ausprobieren.",
      text:
        "Gib eine Aussage ein und übe, wahren Kern, Denkfehler, Narrativ, psychologische Trigger, Wirkungspfad und bessere Antwort zu trennen. Die Demo ersetzt keine redaktionelle Prüfung.",
      ctas: [["Demo öffnen", "erleben/wirkungsradar-demo/"], ["Methode verstehen", "wirkungsradar/methode/"]],
      cards: [
        ["Claim eingeben", "Aussage, Thema und vermutetes Narrativ sammeln.", "erleben/wirkungsradar-demo/"],
        ["Antwort üben", "10-Sekunden-, 30-Sekunden- und 2-Minuten-Antworten vorbereiten.", "wirkungsradar/live/"],
        ["Medienwirkung prüfen", "Mit dem Medienwirkungscheck verbinden.", "erleben/medienwirkungscheck/"],
      ],
    },
    {
      test: () => /\/akademie/.test(normalizedPath),
      kicker: "Wirkungsradar lernen",
      title: "Fakten prüfen, Narrative erkennen, souverän antworten.",
      text:
        "Der Lernpfad verbindet Faktencheck, Folgencheck, Narrativanalyse, psychologische Trigger, Stöckchen-Erkennung und Live-Antworten für Bürger:innen, Hosts, Creator:innen, Journalismus und politische Bildung.",
      ctas: [["Lernpfad öffnen", "akademie/wirkungsradar/"], ["Dossier öffnen", "wirkungsradar/detail/"]],
      cards: [
        ["Faktencheck vs. Folgencheck", "Wahrheit und Wirkung gemeinsam lesen.", "akademie/wirkungsradar/"],
        ["Narrative und Frames", "Wiederkehrende Muster öffentlicher Aussagen erkennen.", "wirkungsradar/narrative/"],
        ["Live-Antworten", "Ruhig antworten, ohne ins Stöckchen zu springen.", "wirkungsradar/live/"],
      ],
    },
    {
      test: () => /\/(bibliothek|downloads|dokumente|referenz|werkstatt|fachbibliothek|buch)/.test(normalizedPath),
      kicker: "Wirkungsradar-Dossiers",
      title: "Dossiers zu Mythen, Narrativen und öffentlichen Aussagen.",
      text:
        "Die Bibliothek bündelt Wirkungsradar-Dossiers mit Faktenlage, psychologischem Wirkungscheck, Wirkungspfad, Folgenanalyse, Quellenstand und wirkungsökonomischer Antwort.",
      ctas: [["Dossier-Index öffnen", "bibliothek/wirkungsradar-dossiers/"], ["Detailanalysen ansehen", "wirkungsradar/detail/"]],
      cards: [
        ["Sprache als Wirkstoff", "Wie öffentliche Sprache Resonanzräume öffnet.", "wirkungsradar/narrative/sprachmuster-und-emotionalisierung/"],
        ["CO₂-Systemkosten", "Vom Preisframe zur Folgekostenanalyse.", "wirkungsradar/detail/co2-preis-oder-fossile-systemkosten/"],
        ["Demokratie & Öffentlichkeit", "Medien, Wissenschaft, Meinungsfreiheit und Vertrauen.", "wirkungsradar/themen/demokratie-oeffentlichkeit/"],
      ],
    },
    {
      test: () => /\/(fuer|mitmachen)/.test(normalizedPath),
      kicker: "Wirkungsradar für Zielgruppen",
      title: "Mythen, Narrative und Stöckchen ruhig einordnen.",
      text:
        "Der Wirkungsradar hilft Bürger:innen, Politik, Unternehmen, Kommunen, Medien, Bildung und Hosts, öffentliche Aussagen faktenbasiert und lösungsorientiert zu beantworten.",
      ctas: [["Wirkungsradar öffnen", "wirkungsradar/"], ["Live-Antworten nutzen", "wirkungsradar/live/"]],
      cards: [
        ["Für Bürger:innen", "Mythen erkennen und ruhig reagieren.", "wirkungsradar/live/"],
        ["Für Journalismus", "Frames, Trigger und Quellenlage sichtbar machen.", "wirkungsradar/methode/"],
        ["Für Hosts", "Kurze Antworten für Panels und Kommentarspalten.", "wirkungsradar/live/"],
      ],
    },
    {
      test: () => /\/(blog|journal|w-est-g-journal)/.test(normalizedPath),
      kicker: "Im Wirkungsradar vertiefen",
      title: "Schnelle Antwort und vertiefende Wirkungsanalyse.",
      text:
        "Der Wirkungsradar ergänzt Journal-Beiträge um Faktenlage, Narrativanalyse, psychologischen Wirkungscheck, Wirkungspfad und Live-Antworten.",
      ctas: [["Wirkungsradar öffnen", "wirkungsradar/"], ["Narrative verstehen", "wirkungsradar/narrative/"]],
      cards: [
        ["Sprache & Narrative", "Warum Fakten allein oft nicht wirken.", "wirkungsradar/narrative/"],
        ["Social Credit?", "Ein typisches Missverständnis im Folgencheck.", "wirkungsradar/live/wirkungsoekonomie-social-credit/"],
        ["Klimamythen", "Debatten zu Klima, Energie und Transformation prüfen.", "wirkungsradar/themen/klima-energie/"],
      ],
    },
  ];

  const config = configs.find((item) => item.test());
  if (!config) {
    return;
  }

  const bridge = document.createElement("section");
  bridge.className = "section global-radar-bridge";
  bridge.dataset.globalRadarBridge = "true";
  bridge.dataset.searchExclude = "true";
  bridge.innerHTML = `
    <div>
      <div class="section-header">
        <p class="hero-kicker">${config.kicker}</p>
        <h2>${config.title}</h2>
        <p>${config.text}</p>
      </div>
      <div class="hero-actions">
        ${config.ctas
          .map(([label, href], index) => `<a class="btn ${index === 0 ? "btn-primary" : "btn-secondary"}" href="${relativeSiteUrl(href)}" data-analytics-event="wirkungsradar_open">${label}</a>`)
          .join("")}
      </div>
      <div class="card-grid three global-radar-card-grid">
        ${config.cards
          .map(
            ([title, text, href]) => `<a class="card text-link-card global-radar-card" href="${relativeSiteUrl(href)}" data-analytics-event="related_dossier_click">
              <p class="card-kicker">Wirkungsradar</p>
              <h3 class="card-title">${title}</h3>
              <p class="card-text">${text}</p>
            </a>`,
          )
          .join("")}
      </div>
    </div>
  `;

  const hero = mainElement.querySelector(".hero");
  if (hero?.nextElementSibling) {
    hero.after(bridge);
    return;
  }

  mainElement.prepend(bridge);
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
  if (!articleBody || document.querySelector(".article-toc")) {
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
  script.src = new URL("blog-journal.js?v=20260602-journal-index-v2", baseUrl).href;
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
  const schemaVersion = 1;
  const exportVersion = 1;
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

  function emptyObject(name) {
    const definition = objectDefinitions[name];
    const base = {
      version: definition.version,
      updated_at: null
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
      objects: Object.fromEntries(Object.keys(objectDefinitions).map((name) => [name, emptyObject(name)])),
      export_import: {
        export_version: exportVersion,
        supported_modes: ["replace", "merge"],
        prepared_for_accounts: false
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
    base.schema_version = Number(base.schema_version || schemaVersion);
    base.local_only = true;
    base.objects = base.objects && typeof base.objects === "object" ? base.objects : {};
    for (const [name, definition] of Object.entries(objectDefinitions)) {
      const current = base.objects[name] && typeof base.objects[name] === "object" ? base.objects[name] : {};
      const shell = emptyObject(name);
      current.version = Number(current.version || definition.version);
      current.updated_at = current.updated_at || null;
      if (definition.kind === "map") {
        current.items = current.items && !Array.isArray(current.items) && typeof current.items === "object" ? current.items : {};
      } else if (definition.kind === "settings") {
        current.data = current.data && !Array.isArray(current.data) && typeof current.data === "object" ? current.data : {};
      } else {
        current.items = Array.isArray(current.items) ? current.items : [];
      }
      base.objects[name] = { ...shell, ...current };
    }
    base.export_import = {
      export_version: exportVersion,
      supported_modes: ["replace", "merge"],
      prepared_for_accounts: false,
      ...(base.export_import || {})
    };
    return base;
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

  function touchObject(store, objectName) {
    store.objects[objectName].updated_at = timestamp();
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
      const nextItem = { ...item, id, [timestampField]: item[timestampField] || now, updated_at: now };
      object.items = [nextItem, ...object.items.filter((existing) => existing.id !== id)];
      if (options.limit) object.items = object.items.slice(0, options.limit);
      touchObject(store, objectName);
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
      object.items[key] = { ...value, id: value.id || key, updated_at: timestamp() };
      touchObject(store, objectName);
      return clone(object.items[key]);
    });
  }

  function setSetting(key, value) {
    return updateStore((store) => {
      store.objects.user_settings.data[key] = value;
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
      store.objects[objectName] = emptyObject(objectName);
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

  function exportData() {
    const store = loadStore();
    return {
      format: "woek_user_space_export",
      export_version: exportVersion,
      namespace,
      schema_version: store.schema_version,
      exported_at: timestamp(),
      local_only: true,
      objects: clone(store.objects)
    };
  }

  function importData(payload, options = {}) {
    const incoming = payload?.objects ? payload.objects : payload?.data?.objects ? payload.data.objects : null;
    if (!incoming || typeof incoming !== "object") {
      return { ok: false, imported: [], error: "Ungültige Importstruktur." };
    }
    const mode = options.mode === "replace" ? "replace" : "merge";
    const imported = [];
    updateStore((store) => {
      for (const [name, definition] of Object.entries(objectDefinitions)) {
        if (!incoming[name]) continue;
        const source = incoming[name];
        if (mode === "replace") {
          store.objects[name] = normalizeStore({ namespace, objects: { [name]: source } }).objects[name];
          touchObject(store, name);
          imported.push(name);
          continue;
        }
        if (definition.kind === "map") {
          store.objects[name].items = { ...store.objects[name].items, ...(source.items || {}) };
        } else if (definition.kind === "settings") {
          store.objects[name].data = { ...store.objects[name].data, ...(source.data || {}) };
        } else {
          const byId = new Map(store.objects[name].items.map((item) => [item.id, item]));
          for (const item of Array.isArray(source.items) ? source.items : []) {
            byId.set(item.id || normalizeId(item.url || item.title), item);
          }
          store.objects[name].items = Array.from(byId.values());
        }
        touchObject(store, name);
        imported.push(name);
      }
      store.last_import_at = timestamp();
    });
    return { ok: true, mode, imported };
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
    /\/(begriffe|glossar|referenz|buch|wirkungsradar|downloads|dokumente|werkzeuge|tools|akademie|wirkungsfelder|blog|journal|portale|werkstatt|wissen|evidenz)\b|\/(akademie|buch|downloads|glossar|kompass)\.html$/;
  const progressScopePattern =
    /\/(referenz|buch|dokumente|downloads|bibliothek|akademie|portale)\b|\/(buch|akademie|downloads)\.html$/;
  const excludedPathPattern = /\/(datenschutz|impressum|mein-wirkungsraum|admin|api|_internal|_debug)\b|\/(datenschutz|impressum)\.html$/;

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
    if (path.includes("/dossiers/") || path.includes("/portale/")) return "Dossier";
    if (path.includes("/downloads") || path.includes("/dokumente") || path.includes("/werkstatt/") || path.includes("/wissen/")) return "Dokument";
    if (path.includes("/werkzeuge/") || path.includes("/tools/")) return "Werkzeug";
    if (path.includes("/akademie")) return "Akademie";
    if (path.includes("/wirkungsfelder/")) return "Wirkungsfeld";
    if (path.includes("/blog") || path.includes("/journal")) return "Journal";
    return "Inhalt";
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
    return updateCollection(collection.id, { item_ids: itemIds }, true);
  }

  function removeItemFromCollection(collectionIdValue, itemId) {
    const collection = findCollection(collectionIdValue);
    if (!collection || !itemId) return null;
    return updateCollection(
      collection.id,
      { item_ids: collection.item_ids.filter((existingId) => existingId !== itemId) },
      true
    );
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

  function saveItem(item) {
    WoekUserSpace.upsertItem("saved_items", item, { limit: 300, timestampField: "saved_at" });
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function removeItem(id) {
    WoekUserSpace.removeItem("saved_items", id);
    removeItemFromAllCollections(id);
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function isSaved(id) {
    return savedItems().some((item) => item.id === id);
  }

  function buttonLabel(button, saved) {
    button.textContent = saved ? "★ Gemerkt" : "⭐ Merken";
    button.setAttribute("aria-pressed", String(saved));
  }

  function injectSaveButton() {
    const path = window.location.pathname;
    if (excludedPathPattern.test(path) || !relevantPathPattern.test(path)) return;
    if (document.querySelector("[data-wirkungsraum-save]")) return;

    const item = currentItem();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary wirkungsraum-save-button";
    button.dataset.wirkungsraumSave = item.id;
    buttonLabel(button, isSaved(item.id));
    button.addEventListener("click", () => {
      if (isSaved(item.id)) {
        removeItem(item.id);
        buttonLabel(button, false);
        return;
      }
      saveItem(currentItem());
      buttonLabel(button, true);
    });

    const actions = document.querySelector(".hero-actions");
    if (actions) {
      actions.append(button);
      return;
    }
    const heroCopy = document.querySelector(".hero-copy, .radar-hero-copy, .section-header");
    if (heroCopy) {
      const wrap = document.createElement("p");
      wrap.className = "wirkungsraum-save-row";
      wrap.append(button);
      heroCopy.append(wrap);
    }
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
    if (excludedPathPattern.test(path) || !relevantPathPattern.test(path)) return;
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

    const actions = document.querySelector(".hero-actions");
    if (actions) {
      actions.append(button);
      actions.insertAdjacentElement("afterend", panel);
      return;
    }

    const existingRow = document.querySelector(".wirkungsraum-save-row");
    if (existingRow) {
      existingRow.append(button);
      existingRow.insertAdjacentElement("afterend", panel);
      return;
    }

    const heroCopy = document.querySelector(".hero-copy, .radar-hero-copy, .section-header");
    if (heroCopy) {
      const wrap = document.createElement("p");
      wrap.className = "wirkungsraum-save-row";
      wrap.append(button);
      heroCopy.append(wrap);
      wrap.insertAdjacentElement("afterend", panel);
    }
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
    const note = root.querySelector("[data-last-visit-note]");
    if (note && lastVisit) {
      note.textContent = `Letzter Besuch deines Wirkungsraums: ${new Date(lastVisit).toLocaleString("de-DE")}.`;
    }
    WoekUserSpace.setSetting("last_wirkungsraum_visit", new Date().toISOString());

    if (root.dataset.wirkungsraumDashboardBound !== "true") {
      root.dataset.wirkungsraumDashboardBound = "true";
      root.addEventListener("input", (event) => {
        if (event.target instanceof HTMLInputElement && (event.target.matches("[data-saved-search]") || event.target.matches("[data-saved-filter]"))) {
          drawSavedDashboard(root);
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
          return;
        }
        const clear = event.target instanceof HTMLElement ? event.target.closest("[data-clear-wirkungsraum]") : null;
        if (clear instanceof HTMLButtonElement && window.confirm("Alle lokal gemerkten Inhalte aus diesem Browser löschen?")) {
          WoekUserSpace.resetObject("saved_items");
          clearCollectionItemIds();
          drawSavedDashboard(root);
          drawCollectionsDashboard(root);
          return;
        }
        const templateButton = event.target instanceof HTMLElement ? event.target.closest("[data-collection-template]") : null;
        if (templateButton instanceof HTMLButtonElement) {
          createCollection(templateButton.dataset.collectionTemplate || templateButton.textContent || "", templateButton.dataset.collectionDescription || "");
          drawCollectionsDashboard(root);
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
          return;
        }
        const removeCollectionItem = event.target instanceof HTMLElement ? event.target.closest("[data-remove-collection-item]") : null;
        if (removeCollectionItem instanceof HTMLButtonElement) {
          removeItemFromCollection(removeCollectionItem.dataset.collectionId || "", removeCollectionItem.dataset.itemId || "");
          drawCollectionsDashboard(root);
          return;
        }
        const exportButton = event.target instanceof HTMLElement ? event.target.closest("[data-export-wirkungsraum]") : null;
        if (exportButton instanceof HTMLButtonElement) {
          const payload = JSON.stringify(WoekUserSpace.exportData(), null, 2);
          navigator.clipboard?.writeText(payload);
          exportButton.textContent = "Export kopiert";
          window.setTimeout(() => (exportButton.textContent = "Exportieren"), 1400);
        }
      });
    }

    drawSavedDashboard(root);
    drawReadingDashboard(root);
    drawCollectionsDashboard(root);
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
      return { kind: "referenz", label: "Nur gemerkt", countLabel: "gemerkte Kapitel", empty: "In diesem Referenzverzeichnis ist noch nichts gemerkt." };
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

  function hubCandidates(root) {
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

  function insertHubFilter(root, config, control) {
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

  function initSavedOnlyHubFilters() {
    const config = hubFilterConfig();
    if (!config) return;
    const root = document.querySelector("main");
    if (!root || document.querySelector("[data-wirkungsraum-hub-filter]")) return;

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
      const candidates = hubCandidates(root);
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
    if (excludedPathPattern.test(path) || !relevantPathPattern.test(path)) return;
    WoekUserSpace.recordVisit(currentItem());
  }

  function init() {
    trackVisit();
    injectSaveButton();
    injectCollectionButton();
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

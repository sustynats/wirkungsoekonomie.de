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

if (siteNav) {
  const navItems = [
    ["Start", "index.html", "index.html"],
    ["Verstehen", "verstehen.html", "verstehen.html|wirkungsoekonomie.html|wirkungsoekonomie/|verstehen/|modell.html|modell/|kompass.html|begriffe/|glossar.html"],
    ["Wirkungsfelder", "wirkungsfelder/", "wirkungsfelder/"],
    ["Methoden & Werkzeuge", "werkzeuge/", "werkzeuge/|tools/|methodik/|workflow.html|scanner.html|anwendungen/scanner.html|scorecard-dashboard.html"],
    ["Erleben", "erleben/", "erleben.html|erleben/|ausprobieren/"],
    ["Akademie", "akademie.html", "akademie.html|akademie/"],
    ["Bibliothek", "bibliothek/", "bibliothek/|werkstatt/|downloads.html|downloads/|dokumente/|referenz/|buch.html|buch/|evidenz/|quellen/|fachbibliothek/"],
    ["Mitmachen", "mitmachen.html", "mitmachen.html|mitmachen/|fuer/"],
    ["Suche", "suche.html", "suche.html"],
  ];
  siteNav.innerHTML = navItems
    .map(([label, url, match]) => `<a href="${relativeSiteUrl(url)}" data-nav-match="${match}">${label}</a>`)
    .join("");
}

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
  if (!mainElement || document.querySelector(".related-questions-block")) {
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

const blogCards = Array.from(document.querySelectorAll(".blog-card[data-category]"));
const blogFilterLinks = Array.from(document.querySelectorAll("[data-blog-filter]"));
const blogTagLinks = Array.from(document.querySelectorAll("[data-blog-tag]"));
const blogTypeLinks = Array.from(document.querySelectorAll("[data-blog-type-filter]"));
const blogFilterStatus = document.querySelector(".blog-filter-status");
const blogLoadMoreButton = document.querySelector("[data-blog-load-more]");
const blogSearchInput = document.querySelector("[data-blog-search]");
const blogResetButton = document.querySelector("[data-blog-reset]");
const blogInitialLimit = 12;
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
    .filter((term) => term.url && term.definition && term.allowedContexts?.includes(context))
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
  let globalCount = 0;

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function findMatch(text, section) {
    const alreadyInSection = sectionTerms.get(section) || new Set();

    let best = null;
    eligibleTerms.forEach((term) => {
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
  if (window.__wirkungBlogJournalScriptLoaded) {
    return;
  }

  window.__wirkungBlogJournalScriptLoaded = true;
  const baseUrl = mainScriptUrl || `${window.location.origin}/assets/js/main.js`;
  const script = document.createElement("script");
  script.src = new URL("blog-journal.js?v=20260522-journal-hotfix", baseUrl).href;
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

document.addEventListener("DOMContentLoaded", () => {
  ToolExplanationLayer.init();
  ToolSpecialBoxLayer.init();
  GenericToolPageExplanationLayer.init();
  FundingSourceLayer.init();
  ResultInterpretationLayer.init();
  ToolTermInlineLayer.init();
});

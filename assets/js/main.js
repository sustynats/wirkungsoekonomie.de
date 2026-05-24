const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const mainScriptUrl =
  document.currentScript?.src || document.querySelector('script[src*="assets/js/main.js"]')?.src || "";
const siteAnalyticsEndpoint = "https://akademie.wirkungsoekonomie.de/api/site-event";
const siteAnalyticsSessionKey = "wirkungsoekonomie-site-session";
const siteAnalyticsVisitorKey = "wirkungsoekonomie-site-visitor";

const mainElement = document.querySelector("main");

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

document.querySelectorAll(".article-page .article-body").forEach((articleBody) => {
  if (articleBody.querySelector(".article-status-note")) {
    return;
  }

  const note = document.createElement("div");
  note.className = "scanner-notice article-status-note";
  note.setAttribute("role", "note");
  note.textContent =
    "Artikelstatus: Blog- und Archivbeitrag. Führend für Begriffe, Modellstand, Zahlen und rechtliche Einordnung sind Begriffsleitfaden, aktuelle Website-Seiten, Evidenz und ausdrücklich freigegebene Modellstände.";
  articleBody.prepend(note);
});

if (navToggle && siteNav) {
  const closeNavigation = () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Menü öffnen");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
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
    if (event.key === "Escape" && siteNav.classList.contains("open")) {
      closeNavigation();
      navToggle.focus();
    }
  });
}

if (siteNav && !siteNav.querySelector("[data-search-nav]") && !siteNav.querySelector('a[href$="suche.html"]')) {
  const baseUrl = mainScriptUrl || `${window.location.origin}/assets/js/main.js`;
  const searchLink = document.createElement("a");
  searchLink.href = new URL("../../suche.html", baseUrl).href;
  searchLink.dataset.searchNav = "true";
  searchLink.textContent = "Suche";
  if (window.location.pathname.endsWith("/suche.html")) {
    searchLink.classList.add("active");
    searchLink.setAttribute("aria-current", "page");
  }
  siteNav.append(searchLink);
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

function sendSiteAnalyticsEvent(eventType) {
  if (shouldSkipSiteAnalytics()) {
    return;
  }

  const payload = JSON.stringify({
    eventType,
    path: `${window.location.pathname}${window.location.search}`,
    title: document.title,
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
  const cards = [
    ["Langfassung", "Detailkonzept online lesen", "Die fachliche Langfassung ist online lesbar und zitierfähig.", detailHref, "Online lesen"],
    ["Dossier", "Dossier online lesen", "Anwendung, Annahmen, Bewertungslogik, Datenquellen und Grenzen.", dossierHref, "Online lesen"],
    ["Download", "Detailkonzept Word", "Exportfassung der langen Detailkonzepte.", config.detailDownload, "Herunterladen"],
    ["Download", "Dossier Word", "Exportfassung des Dossiers oder Einzeldossier-Sets.", config.dossierDownload, "Herunterladen"],
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
      <p class="hero-kicker">Online lesen und herunterladen</p>
      <h2 id="publikationszugang-title">Detailkonzepte und Dossiers <a class="cite-anchor no-print" href="#publikationszugang" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
      <p>Die langen Fassungen sind direkt online lesbar und zitierfähig. Word-Dateien bleiben ergänzende Export- und Archivfassungen.</p>
    </div>
    <div class="card-grid three">${cards.map(([kicker, title, text, link, label]) => `
      <article class="card">
        <p class="card-kicker">${kicker}</p>
        <h3 class="card-title">${title}</h3>
        <p class="card-text">${text}</p>
        <div class="portal-card-actions"><a class="text-link" href="${link}">${label}</a></div>
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

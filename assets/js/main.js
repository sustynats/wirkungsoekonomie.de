const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const mainScriptUrl =
  document.currentScript?.src || document.querySelector('script[src*="assets/js/main.js"]')?.src || "";
const siteAnalyticsEndpoint = "https://akademie.wirkungsoekonomie.de/api/site-event";
const siteAnalyticsSessionKey = "wirkungsoekonomie-site-session";

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

document.querySelectorAll(".site-nav a").forEach((link) => {
  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }

  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const currentSection = pathParts[0] || "index.html";
  const currentPath = pathParts[pathParts.length - 1] || "index.html";
  const linkPath = link.pathname.split("/").pop() || "index.html";
  const isBlogSection = currentSection === "blog" && linkPath === "blog.html";
  const isCurrent = currentPath === linkPath || isBlogSection;

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
  });

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(siteAnalyticsEndpoint, new Blob([payload], { type: "application/json" }));
    if (sent) {
      return;
    }
  }

  fetch(siteAnalyticsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

sendSiteAnalyticsEvent("page_view");
window.setInterval(() => sendSiteAnalyticsEvent("heartbeat"), 60000);

const blogCards = Array.from(document.querySelectorAll(".blog-card[data-category]"));
const blogFilterLinks = Array.from(document.querySelectorAll("[data-blog-filter]"));
const blogTagLinks = Array.from(document.querySelectorAll("[data-blog-tag]"));
const blogOriginLinks = Array.from(document.querySelectorAll("[data-blog-origin-filter]"));
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
  origin: "all",
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
  setPressedState(blogOriginLinks, blogFilterState.origin, "blogOriginFilter");
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
  if (blogFilterState.origin !== "all") {
    activeParts.push(blogFilterState.origin === "redaktion" ? "Originale" : "LinkedIn-Archiv");
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
    const originMatch = blogFilterState.origin === "all" || card.dataset.origin === blogFilterState.origin;
    const typeMatch = blogFilterState.type === "all" || types.includes(blogFilterState.type);
    const haystack = [
      card.textContent,
      card.dataset.category,
      card.dataset.origin,
      card.dataset.tags,
    ]
      .join(" ")
      .toLowerCase();
    const searchMatch = !hasSearch || haystack.includes(blogFilterState.query);
    const isMatch = categoryMatch && tagMatch && originMatch && typeMatch && searchMatch;
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
  blogFilterState.origin = "all";
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

blogOriginLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    blogFilterState.origin = link.dataset.blogOriginFilter || "all";
    blogFilterState.limit = blogInitialLimit;
    applyBlogFilter({
      scroll: true,
      hash: blogFilterState.origin === "all" ? "#beitraege" : `#${blogFilterState.origin}-beitraege`,
    });
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
      "steuern-recht": "Steuern und Recht",
      anwendungen: "Anwendungen",
      "medien-demokratie": "Medien und Demokratie",
      "daten-indikatoren": "Daten und Indikatoren",
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
  script.src = new URL("glossaryTerms.js?v=20260520-sdg-framework", baseUrl).href;
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

  document.addEventListener("pointerover", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest(".glossary-term") : null;
    if (trigger instanceof HTMLAnchorElement) {
      showCard(trigger);
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target instanceof Element && event.target.closest(".glossary-term")) {
      hideCard();
    }
  });

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

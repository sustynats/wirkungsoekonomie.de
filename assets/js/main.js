const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const analyticsMeasurementId = "G-KBSME2T45Y";
const analyticsConsentKey = "wirkungsoekonomie-analytics-consent";

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

function loadAnalytics() {
  if (window.__wirkungAnalyticsLoaded) {
    return;
  }

  window.__wirkungAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", analyticsMeasurementId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsMeasurementId}`;
  document.head.append(script);
}

function createAnalyticsBanner() {
  if (document.querySelector(".cookie-banner")) {
    return;
  }

  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Analytics-Einstellungen");
  banner.innerHTML = `
    <p class="cookie-banner-title">Analytics erlauben?</p>
    <p>Wir nutzen Google Analytics, um zu verstehen, welche Inhalte gelesen werden. Die Messung startet erst nach Zustimmung.</p>
    <div class="cookie-banner-actions">
      <button class="btn btn-primary btn-small" type="button" data-analytics-consent="granted">Akzeptieren</button>
      <button class="btn btn-secondary btn-small" type="button" data-analytics-consent="denied">Ablehnen</button>
    </div>
  `;

  banner.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest("[data-analytics-consent]");
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const consent = button.dataset.analyticsConsent;
    localStorage.setItem(analyticsConsentKey, consent);
    banner.remove();

    if (consent === "granted") {
      loadAnalytics();
    }
  });

  document.body.append(banner);
}

try {
  const analyticsConsent = localStorage.getItem(analyticsConsentKey);

  if (analyticsConsent === "granted") {
    loadAnalytics();
  } else if (analyticsConsent !== "denied") {
    createAnalyticsBanner();
  }
} catch (error) {
  createAnalyticsBanner();
}

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

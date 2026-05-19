const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const analyticsMeasurementId = "G-KBSME2T45Y";
const analyticsConsentKey = "wirkungsoekonomie-analytics-consent";

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
const blogFilterStatus = document.querySelector(".blog-filter-status");
const blogLoadMoreButton = document.querySelector("[data-blog-load-more]");
const blogInitialLimit = 12;
let blogExpanded = false;

function setActiveBlogLinks(type, value) {
  blogFilterLinks.forEach((link) => {
    const isActive = type === "category" && link.dataset.blogFilter === value;
    const isAll = type === "all" && link.dataset.blogFilter === "all";
    link.classList.toggle("active", isActive || isAll);
  });

  blogTagLinks.forEach((link) => {
    link.classList.toggle("active", type === "tag" && link.dataset.blogTag === value);
  });

  blogOriginLinks.forEach((link) => {
    link.classList.toggle("active", type === "origin" && link.dataset.blogOriginFilter === value);
  });
}

function applyBlogFilter(type, value, label) {
  if (!blogCards.length) {
    return;
  }

  let visibleCount = 0;
  let matchedCount = 0;

  blogCards.forEach((card) => {
    const tags = (card.dataset.tags || "").split(" ").filter(Boolean);
    const isMatch =
      type === "all" ||
      (type === "category" && card.dataset.category === value) ||
      (type === "tag" && tags.includes(value)) ||
      (type === "origin" && card.dataset.origin === value);
    const isCollapsed = type === "all" && !blogExpanded && matchedCount >= blogInitialLimit;

    if (isMatch) {
      matchedCount += 1;
    }

    card.hidden = !isMatch || isCollapsed;
    if (isMatch && !isCollapsed) {
      visibleCount += 1;
    }
  });

  if (blogLoadMoreButton) {
    blogLoadMoreButton.hidden = !(type === "all" && !blogExpanded && matchedCount > blogInitialLimit);
  }

  if (blogFilterStatus) {
    if (type === "all" && matchedCount > visibleCount) {
      blogFilterStatus.textContent = `${visibleCount} von ${matchedCount} Beiträgen werden angezeigt.`;
    } else {
      blogFilterStatus.textContent =
        type === "all" ? `${visibleCount} Beiträge werden angezeigt.` : `${visibleCount} Beiträge zu „${label}“.`;
    }
  }

  setActiveBlogLinks(type, value);
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
    const label = link.textContent.trim();

    if (value === "all") {
      blogExpanded = false;
      applyBlogFilter("all", "all", label);
      moveToBlogList("#beitraege");
    } else {
      blogExpanded = true;
      applyBlogFilter("category", value, label);
      moveToBlogList(`#thema-${value}`);
    }
  });
});

blogTagLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    blogExpanded = true;
    applyBlogFilter("tag", link.dataset.blogTag, link.textContent.trim());
    moveToBlogList(`#tag-${link.dataset.blogTag}`);
  });
});

blogOriginLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    blogExpanded = true;
    applyBlogFilter("origin", link.dataset.blogOriginFilter, link.textContent.trim());
    moveToBlogList(`#${link.dataset.blogOriginFilter}-beitraege`);
  });
});

if (blogLoadMoreButton) {
  blogLoadMoreButton.addEventListener("click", () => {
    blogExpanded = true;
    applyBlogFilter("all", "all", "Alle Beiträge");
  });
}

if (blogCards.length) {
  const hash = decodeURIComponent(window.location.hash || "");
  const categoryMatch = hash.match(/^#thema-(.+)$/);
  const tagMatch = hash.match(/^#tag-(.+)$/);

  if (categoryMatch) {
    const link = document.querySelector(`[data-blog-filter="${categoryMatch[1]}"]`);
    blogExpanded = true;
    applyBlogFilter("category", categoryMatch[1], link?.textContent.trim() || categoryMatch[1]);
  } else if (tagMatch) {
    const link = document.querySelector(`[data-blog-tag="${tagMatch[1]}"]`);
    blogExpanded = true;
    applyBlogFilter("tag", tagMatch[1], link?.textContent.trim() || tagMatch[1]);
  } else {
    applyBlogFilter("all", "all", "Alle Beiträge");
  }
}

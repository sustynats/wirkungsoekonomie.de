const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const analyticsMeasurementId = "G-KBSME2T45Y";
const analyticsConsentKey = "wirkungsoekonomie-analytics-consent";

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Menü öffnen");
    }
  });
}

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
const blogFilterStatus = document.querySelector(".blog-filter-status");

function setActiveBlogLinks(type, value) {
  blogFilterLinks.forEach((link) => {
    const isActive = type === "category" && link.dataset.blogFilter === value;
    const isAll = type === "all" && link.dataset.blogFilter === "all";
    link.classList.toggle("active", isActive || isAll);
  });

  blogTagLinks.forEach((link) => {
    link.classList.toggle("active", type === "tag" && link.dataset.blogTag === value);
  });
}

function applyBlogFilter(type, value, label) {
  if (!blogCards.length) {
    return;
  }

  let visibleCount = 0;

  blogCards.forEach((card) => {
    const tags = (card.dataset.tags || "").split(" ").filter(Boolean);
    const isVisible =
      type === "all" ||
      (type === "category" && card.dataset.category === value) ||
      (type === "tag" && tags.includes(value));

    card.hidden = !isVisible;
    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (blogFilterStatus) {
    blogFilterStatus.textContent =
      type === "all" ? `${visibleCount} Beiträge werden angezeigt.` : `${visibleCount} Beiträge zu „${label}“.`;
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
      applyBlogFilter("all", "all", label);
      moveToBlogList("#beitraege");
    } else {
      applyBlogFilter("category", value, label);
      moveToBlogList(`#thema-${value}`);
    }
  });
});

blogTagLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    applyBlogFilter("tag", link.dataset.blogTag, link.textContent.trim());
    moveToBlogList(`#tag-${link.dataset.blogTag}`);
  });
});

if (blogCards.length) {
  const hash = decodeURIComponent(window.location.hash || "");
  const categoryMatch = hash.match(/^#thema-(.+)$/);
  const tagMatch = hash.match(/^#tag-(.+)$/);

  if (categoryMatch) {
    const link = document.querySelector(`[data-blog-filter="${categoryMatch[1]}"]`);
    applyBlogFilter("category", categoryMatch[1], link?.textContent.trim() || categoryMatch[1]);
  } else if (tagMatch) {
    const link = document.querySelector(`[data-blog-tag="${tagMatch[1]}"]`);
    applyBlogFilter("tag", tagMatch[1], link?.textContent.trim() || tagMatch[1]);
  } else {
    applyBlogFilter("all", "all", "Alle Beiträge");
  }
}

(() => {
  if (window.__woekSiteNavigationReady) return;
  window.__woekSiteNavigationReady = true;

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const primaryUtilityNav = document.querySelector(".site-utility-nav");
  const mainElement = document.querySelector("main");
  const scriptUrl = document.currentScript?.src
    || document.querySelector('script[src*="assets/js/site-navigation.js"]')?.src
    || `${window.location.origin}/assets/js/site-navigation.js`;
  const siteLocale = document.documentElement.lang === "en" ? "en" : "de";
  const text = {
    skip: siteLocale === "en" ? "Skip to content" : "Zum Inhalt springen",
    open: siteLocale === "en" ? "Open menu" : "Menü öffnen",
    close: siteLocale === "en" ? "Close menu" : "Menü schließen",
  };
  const relativeSiteUrl = (route) => new URL(`../../${String(route).replace(/^\/+/, "")}`, scriptUrl).href;

  if (mainElement) {
    mainElement.id = mainElement.id || "main-content";
    mainElement.setAttribute("tabindex", "-1");
    const skipLink = document.querySelector(".skip-link") || document.createElement("a");
    skipLink.classList.add("skip-link");
    skipLink.href = `#${mainElement.id}`;
    if (!skipLink.textContent?.trim()) skipLink.textContent = text.skip;
    if (!skipLink.isConnected) document.body.prepend(skipLink);
  }

  document.querySelectorAll(".breadcrumb").forEach((breadcrumb) => {
    let landmark = breadcrumb;
    if (breadcrumb instanceof HTMLParagraphElement) {
      landmark = document.createElement("nav");
      Array.from(breadcrumb.attributes).forEach((attribute) => landmark.setAttribute(attribute.name, attribute.value));
      landmark.append(...breadcrumb.childNodes);
      breadcrumb.replaceWith(landmark);
    }
    if (landmark instanceof HTMLElement) {
      landmark.setAttribute("aria-label", siteLocale === "en" ? "Breadcrumb" : "Brotkrumen");
    }
  });

  function setQuickLinkAccessibility(menuOpen) {
    if (primaryUtilityNav instanceof HTMLElement) {
      primaryUtilityNav.toggleAttribute("inert", menuOpen);
      primaryUtilityNav.setAttribute("aria-hidden", String(menuOpen));
    }
    document.querySelectorAll(".site-nav-utility").forEach((utilityLinks) => {
      utilityLinks.toggleAttribute("inert", !menuOpen);
      utilityLinks.setAttribute("aria-hidden", String(!menuOpen));
    });
  }

  function normalizeNavigationRoute(value) {
    let route = String(value || "").replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/, 1)[0];
    try { route = decodeURIComponent(route); } catch {}
    route = route.replace(/^\/+/, "").replace(/\/index\.html$/i, "/");
    return route || "index.html";
  }

  function navigationMatchScore(link, currentRoute) {
    return (link.dataset.navMatch || "")
      .split("|")
      .map(normalizeNavigationRoute)
      .filter((token) => currentRoute === token || currentRoute.startsWith(token))
      .reduce((longest, token) => Math.max(longest, token.length), 0);
  }

  function applyNavigationState() {
    const currentRoute = normalizeNavigationRoute(window.location.pathname);
    const links = Array.from(document.querySelectorAll(
      ".site-nav a, .site-utility-nav a, .site-search-shortcut, .footer-nav a, .footer-legal-nav a",
    )).filter((link) => link instanceof HTMLAnchorElement && !link.closest("[inert]"));
    const mainLinks = links.filter((link) => link.closest(".site-nav") && !link.closest(".site-nav-utility"));

    links.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });
    document.querySelectorAll(".site-nav .nav-more").forEach((details) => details.classList.remove("active"));
    const existingPageMarker = document.querySelector('[aria-current="page"]');

    const exactPageLink = links.find((link) => normalizeNavigationRoute(link.pathname) === currentRoute);
    if (exactPageLink) {
      exactPageLink.classList.add("active");
      exactPageLink.setAttribute("aria-current", existingPageMarker ? "true" : "page");
    }

    const activeArea = mainLinks
      .map((link) => ({ link, score: navigationMatchScore(link, currentRoute) }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)[0]?.link;
    if (activeArea) {
      activeArea.classList.add("active");
      if (activeArea !== exactPageLink) activeArea.setAttribute("aria-current", "true");
      const more = activeArea.closest(".nav-more");
      if (more instanceof HTMLDetailsElement) more.classList.add("active");
    }
  }

  function ensureFooterDiscoveryLinks() {
    if (siteLocale !== "de") return;
    const group = Array.from(document.querySelectorAll(".footer-nav-group")).find(
      (item) => item.querySelector("h3")?.textContent?.trim().toLowerCase() === "mitmachen",
    );
    const links = group?.querySelector(".footer-nav-links");
    if (!links) return;
    [
      ["Presse", "w/natalie-weber/presse/"],
      ["FAQ", "w/natalie-weber/faq/"],
    ].forEach(([label, route]) => {
      if (Array.from(links.querySelectorAll("a")).some((link) => link.textContent?.trim() === label)) return;
      const link = document.createElement("a");
      link.href = relativeSiteUrl(route);
      link.dataset.navMatch = route;
      link.dataset.footerDiscoveryLink = "true";
      link.textContent = label;
      const legalLink = Array.from(links.querySelectorAll("a")).find((item) => item.textContent?.trim() === "Impressum");
      links.insertBefore(link, legalLink || null);
    });
  }

  if (siteNav && !document.querySelector(".site-search-shortcut")
    && !Array.from(document.querySelectorAll(".site-header a")).some((link) => /suche\.html/.test(link.getAttribute("href") || ""))) {
    const searchLink = document.createElement("a");
    searchLink.href = siteLocale === "en" ? relativeSiteUrl("en/search/") : relativeSiteUrl("suche.html");
    searchLink.className = "site-search-shortcut";
    searchLink.textContent = siteLocale === "en" ? "Search" : "Suche";
    searchLink.setAttribute("aria-label", siteLocale === "en" ? "Open search section" : "Website-Suche öffnen");
    searchLink.setAttribute("title", siteLocale === "en" ? "Search" : "Suche");
    siteNav.after(searchLink);
  }

  setQuickLinkAccessibility(false);
  ensureFooterDiscoveryLinks();
  applyNavigationState();

  if (!navToggle || !siteNav) return;
  let navReturnFocus = null;
  const focusableSelector = [
    "a[href]", "button:not([disabled])", "summary", "input:not([disabled])",
    "select:not([disabled])", "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const closeNavigation = () => {
    siteNav.classList.remove("open");
    siteNav.removeAttribute("role");
    siteNav.removeAttribute("aria-modal");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", text.open);
    document.body.classList.remove("nav-is-open");
    setQuickLinkAccessibility(false);
    applyNavigationState();
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? text.close : text.open);
    document.body.classList.toggle("nav-is-open", isOpen);
    navReturnFocus = isOpen && document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!isOpen) {
      closeNavigation();
      return;
    }
    siteNav.setAttribute("role", "dialog");
    siteNav.setAttribute("aria-modal", "true");
    setQuickLinkAccessibility(true);
    applyNavigationState();
    window.requestAnimationFrame(() => siteNav.querySelector("a")?.focus());
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node) || !siteNav.classList.contains("open")) return;
    if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) closeNavigation();
  });
  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeNavigation();
  });
  document.addEventListener("keydown", (event) => {
    if (!siteNav.classList.contains("open")) return;
    if (event.key === "Escape") {
      closeNavigation();
      (navReturnFocus || navToggle).focus();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(siteNav.querySelectorAll(focusableSelector)).filter(
      (element) => element instanceof HTMLElement && !element.hasAttribute("hidden") && !element.closest("[inert]"),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

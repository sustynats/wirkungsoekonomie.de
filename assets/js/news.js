(function () {
  const controls = Array.from(document.querySelectorAll("[data-news-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-news-card]"));
  const empty = document.querySelector("[data-news-filter-empty]");
  const searchInput = document.querySelector("[data-news-search-input]");
  const siteSearchLink = document.querySelector("[data-news-site-search-link]");
  const status = document.querySelector("[data-news-results-status]");
  const loadMore = document.querySelector("[data-news-load-more]");
  const loadMoreWrap = document.querySelector("[data-news-load-more-wrap]");
  const filterBar = document.querySelector(".news-filter-bar");
  const header = document.querySelector(".site-header");
  const pageSize = 10;
  const listStateKey = "woek:wirkungsticker:list-state:v1";
  let activeFilter = "all";
  let visibleLimit = pageSize;

  function saveListState(card) {
    const state = {
      pathname: window.location.pathname,
      activeFilter,
      query: searchInput?.value || "",
      visibleLimit,
      scrollY: Math.max(0, Math.round(window.scrollY)),
      storyId: card?.id || window.history.state?.newsList?.storyId || "",
      savedAt: Date.now(),
    };
    try {
      window.history.replaceState({ ...window.history.state, newsList: state }, "");
      window.sessionStorage.setItem(listStateKey, JSON.stringify(state));
    } catch (_error) {
      // Private browsing or locked-down webviews may disable sessionStorage.
    }
  }

  function readListState(targetId) {
    const returning = window.performance?.getEntriesByType("navigation")[0]?.type === "back_forward";
    if (!targetId && !returning) return null;
    try {
      const state = returning ? window.history.state?.newsList : JSON.parse(window.sessionStorage.getItem(listStateKey) || "null");
      if (!state || state.pathname !== window.location.pathname || Date.now() - Number(state.savedAt || 0) > 24 * 60 * 60 * 1000) return null;
      return state;
    } catch (_error) {
      return null;
    }
  }

  // Die Filterleiste klebt unterhalb des ebenfalls klebenden Site-Headers.
  function syncHeaderOffset() {
    if (!filterBar) return;
    const offset = header ? Math.round(header.getBoundingClientRect().height) : 0;
    filterBar.style.setProperty("--wt-header-offset", `${offset}px`);
  }
  syncHeaderOffset();
  window.addEventListener("resize", syncHeaderOffset);
  if ("ResizeObserver" in window && header) new ResizeObserver(syncHeaderOffset).observe(header);

  // Ganze Karte klickbar, ohne verschachtelte Links: Klicks auf Text öffnen die Akte.
  cards.forEach((card) => {
    const href = card.dataset.newsHref;
    if (!href) return;
    card.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      saveListState(card);
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.target.closest("a, button, summary, input, details")) return;
      if (String(window.getSelection?.() || "").length) return;
      window.location.href = href;
    });
  });

  if (!controls.length || !cards.length) return;
  window.addEventListener("pagehide", () => saveListState());

  function matches(card, filter) {
    if (filter === "all") return true;
    if (filter === "high") return card.dataset.highImpact === "true";
    const values = `${card.dataset.topic || ""} ${card.dataset.dimensions || ""}`.toLowerCase();
    return values.split(/\s+/).includes(filter);
  }

  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase("de-DE");
  }

  function render({ updateUrl = true } = {}) {
    const query = normalize(searchInput?.value);
    const matchingCards = cards.filter((card) => matches(card, activeFilter)
      && (!query || normalize(card.dataset.newsSearch).includes(query)));
    const visibleCards = new Set(matchingCards.slice(0, visibleLimit));
    cards.forEach((card) => { card.hidden = !visibleCards.has(card); });
    controls.forEach((control) => {
      control.setAttribute("aria-pressed", String(control.dataset.newsFilter === activeFilter));
      const count = control.querySelector("[data-news-filter-count]");
      if (count && query) {
        const filterMatches = cards.filter((card) => matches(card, control.dataset.newsFilter) && normalize(card.dataset.newsSearch).includes(query)).length;
        count.textContent = String(filterMatches);
      } else if (count && count.dataset.total !== undefined) {
        count.textContent = count.dataset.total;
      }
    });
    if (empty) empty.hidden = matchingCards.length !== 0;

    const shown = Math.min(visibleLimit, matchingCards.length);
    if (status) {
      const suffix = matchingCards.length === 1 ? "Wirkungsnachricht" : "Wirkungsnachrichten";
      status.textContent = matchingCards.length > pageSize
        ? `${shown} von ${matchingCards.length} belastbaren ${suffix} angezeigt.`
        : `${matchingCards.length} belastbare ${suffix}. Neue Informationen aktualisieren bestehende Akten.`;
    }
    const remaining = Math.max(0, matchingCards.length - shown);
    if (loadMoreWrap) loadMoreWrap.hidden = remaining === 0;
    if (loadMore) {
      loadMore.textContent = remaining > pageSize ? `${pageSize} weitere Meldungen laden` : `${remaining} weitere ${remaining === 1 ? "Meldung" : "Meldungen"} laden`;
      loadMore.setAttribute("aria-expanded", String(remaining === 0));
    }

    const url = new URL(window.location.href);
    if (activeFilter === "all") url.searchParams.delete("thema");
    else url.searchParams.set("thema", activeFilter);
    if (query) url.searchParams.set("q", searchInput.value.trim());
    else url.searchParams.delete("q");
    if (siteSearchLink) {
      const siteSearchUrl = new URL(siteSearchLink.href);
      if (query) siteSearchUrl.searchParams.set("q", searchInput.value.trim());
      else siteSearchUrl.searchParams.delete("q");
      siteSearchLink.href = siteSearchUrl;
    }
    if (updateUrl) window.history.replaceState({ ...window.history.state }, "", url);
  }

  controls.forEach((control) => control.addEventListener("click", () => {
    activeFilter = control.dataset.newsFilter || "all";
    visibleLimit = pageSize;
    render();
  }));
  searchInput?.addEventListener("input", () => {
    visibleLimit = pageSize;
    render();
  });
  searchInput?.addEventListener("search", () => {
    visibleLimit = pageSize;
    render();
  });
  loadMore?.addEventListener("click", () => {
    visibleLimit += pageSize;
    render({ updateUrl: false });
  });

  const returnTargetId = window.location.hash.slice(1);
  const returnCard = returnTargetId.startsWith("story-") ? cards.find((card) => card.id === returnTargetId) : null;
  const savedState = readListState(returnTargetId);
  if (savedState) {
    const returnUrl = new URL(window.location.href);
    returnUrl.hash = "";
    window.history.replaceState({ ...window.history.state }, "", returnUrl);
  }
  const parameters = new URL(window.location.href).searchParams;
  const initialFilter = savedState?.activeFilter || parameters.get("thema") || "all";
  activeFilter = controls.some((control) => control.dataset.newsFilter === initialFilter) ? initialFilter : "all";
  if (searchInput) searchInput.value = savedState?.query ?? parameters.get("q") ?? "";
  visibleLimit = Math.max(pageSize, Number(savedState?.visibleLimit || pageSize));
  if (returnCard && !savedState) {
    const cardPosition = cards.indexOf(returnCard) + 1;
    visibleLimit = Math.max(visibleLimit, Math.ceil(cardPosition / pageSize) * pageSize);
  }
  render({ updateUrl: Boolean(savedState) });
  if (returnCard || savedState) {
    const savedCard = savedState ? cards.find((card) => card.id === savedState.storyId) : null;
    savedCard?.classList.add("is-return-point");
    const restorePosition = () => {
      if (savedState && Number.isFinite(Number(savedState.scrollY))) window.scrollTo({ top: Number(savedState.scrollY), behavior: "auto" });
      else returnCard.scrollIntoView({ block: "center" });
    };
    window.requestAnimationFrame(() => window.requestAnimationFrame(restorePosition));
    window.addEventListener("load", restorePosition, { once: true });
    window.setTimeout(restorePosition, 120);
  }
})();

(function () {
  const controls = Array.from(document.querySelectorAll("[data-news-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-news-card]"));
  const empty = document.querySelector("[data-news-filter-empty]");
  const searchInput = document.querySelector("[data-news-search-input]");
  const siteSearchLink = document.querySelector("[data-news-site-search-link]");
  const status = document.querySelector("[data-news-results-status]");
  const loadMore = document.querySelector("[data-news-load-more]");
  const loadMoreWrap = document.querySelector("[data-news-load-more-wrap]");
  const pageSize = 10;
  let activeFilter = "all";
  let visibleLimit = pageSize;
  if (!controls.length || !cards.length) return;

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
    controls.forEach((control) => control.setAttribute("aria-pressed", String(control.dataset.newsFilter === activeFilter)));
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
    if (updateUrl) window.history.replaceState({}, "", url);
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

  const parameters = new URL(window.location.href).searchParams;
  const initialFilter = parameters.get("thema") || "all";
  activeFilter = controls.some((control) => control.dataset.newsFilter === initialFilter) ? initialFilter : "all";
  if (searchInput) searchInput.value = parameters.get("q") || "";
  render({ updateUrl: false });
})();

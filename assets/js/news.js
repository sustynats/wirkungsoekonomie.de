(function () {
  const controls = Array.from(document.querySelectorAll("[data-news-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-news-card]"));
  const empty = document.querySelector("[data-news-filter-empty]");
  if (!controls.length || !cards.length) return;

  function matches(card, filter) {
    if (filter === "all") return true;
    if (filter === "high") return card.dataset.highImpact === "true";
    const values = `${card.dataset.topic || ""} ${card.dataset.dimensions || ""}`.toLowerCase();
    return values.split(/\s+/).includes(filter);
  }

  function apply(filter) {
    let visible = 0;
    cards.forEach((card) => {
      const show = matches(card, filter);
      card.hidden = !show;
      if (show) visible += 1;
    });
    controls.forEach((control) => control.setAttribute("aria-pressed", String(control.dataset.newsFilter === filter)));
    if (empty) empty.hidden = visible !== 0;
    const url = new URL(window.location.href);
    if (filter === "all") url.searchParams.delete("thema");
    else url.searchParams.set("thema", filter);
    window.history.replaceState({}, "", url);
  }

  controls.forEach((control) => control.addEventListener("click", () => apply(control.dataset.newsFilter || "all")));
  const initial = new URL(window.location.href).searchParams.get("thema") || "all";
  apply(controls.some((control) => control.dataset.newsFilter === initial) ? initial : "all");
})();

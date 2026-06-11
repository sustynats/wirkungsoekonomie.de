(function () {
  const results = document.querySelector("[data-library-results]");
  const cards = Array.from((results || document).querySelectorAll("[data-library-card]"));
  const search = document.querySelector("[data-library-search]");
  const filters = Array.from(document.querySelectorAll("[data-library-filter]"));
  const count = document.querySelector("[data-library-count]");

  function matches(card) {
    const query = (search?.value || "").trim().toLowerCase();
    if (query && !card.dataset.query?.includes(query)) return false;
    return filters.every((filter) => {
      const value = filter.value;
      if (!value) return true;
      const key = filter.dataset.libraryFilter;
      return card.dataset[key] === value;
    });
  }

  function update() {
    let visible = 0;
    for (const card of cards) {
      const show = matches(card);
      card.hidden = !show;
      if (show) visible += 1;
    }
    if (count) count.textContent = `${visible} Einträge sichtbar`;
  }

  search?.addEventListener("input", update);
  filters.forEach((filter) => filter.addEventListener("change", update));
  update();
})();

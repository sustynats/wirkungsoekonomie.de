(function () {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("#site-search-input");
  const status = document.querySelector("[data-search-status]");
  const resultsList = document.querySelector("[data-search-results]");
  const emptyState = document.querySelector("[data-search-empty]");
  const recommendedPanel = document.querySelector("[data-search-recommended]");
  const relatedPanel = document.querySelector("[data-search-related]");
  const filterControls = Array.from(document.querySelectorAll("[data-search-filter]"));
  const resetButton = document.querySelector("[data-search-reset]");
  const suggestionButtons = Array.from(document.querySelectorAll("[data-search-suggestion]"));
  const searchScriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="assets/js/search.js"]')?.src || "";

  if (!form || !(input instanceof HTMLInputElement) || !status || !resultsList) {
    return;
  }

  const state = {
    index: [],
    dictionary: { terms: [], typos: {} },
    associations: {},
    entrypoints: [],
    ready: false,
    timer: null,
  };

  const dataUrl = (fileName) => new URL(`../search/${fileName}`, searchScriptUrl).href;

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9+#\s/-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  function asArray(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function getEntryHaystack(entry) {
    return normalize([
      entry.title,
      entry.description,
      entry.section,
      entry.type,
      entry.format,
      ...asArray(entry.tags),
      ...asArray(entry.aliases),
      ...asArray(entry.standards),
      ...asArray(entry.instruments),
      ...asArray(entry.impactSpaces),
      entry.body,
    ].join(" "));
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const tmp = row[j];
        row[j] = Math.min(
          row[j] + 1,
          row[j - 1] + 1,
          previous + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        previous = tmp;
      }
    }
    return row[b.length];
  }

  function fuzzyTokenMatch(token, haystack) {
    if (token.length < 4) {
      return false;
    }
    return haystack.split(" ").some((word) => {
      if (Math.abs(word.length - token.length) > 2) return false;
      const limit = token.length > 7 ? 2 : 1;
      return levenshtein(token, word) <= limit;
    });
  }

  function expandQuery(rawQuery) {
    const normalizedQuery = normalize(rawQuery);
    const baseTokens = normalizedQuery.split(" ").filter((token) => token.length > 1);
    const expanded = new Set([normalizedQuery, ...baseTokens]);
    const typoMap = state.dictionary.typos || {};

    Object.entries(typoMap).forEach(([wrong, correct]) => {
      if (normalizedQuery.includes(normalize(wrong))) {
        expanded.add(normalize(correct));
      }
    });

    state.dictionary.terms.forEach((term) => {
      const aliases = [term.label, term.key, ...asArray(term.aliases)];
      const normalizedAliases = aliases.map(normalize);
      if (normalizedAliases.some((alias) => alias && (normalizedQuery.includes(alias) || alias.includes(normalizedQuery)))) {
        aliases.forEach((alias) => expanded.add(normalize(alias)));
        asArray(term.related).forEach((related) => expanded.add(normalize(related)));
      }
    });

    return unique(Array.from(expanded).flatMap((term) => term.split(" "))).filter((token) => token.length > 1);
  }

  function fieldContains(entry, field, selected) {
    if (!selected) return true;
    const needle = normalize(selected);
    const value = entry[field];
    if (Array.isArray(value)) {
      return value.some((item) => normalize(item).includes(needle) || needle.includes(normalize(item)));
    }
    return normalize(value).includes(needle) || needle.includes(normalize(value));
  }

  function passesFilters(entry) {
    return filterControls.every((control) => {
      if (!(control instanceof HTMLSelectElement) || !control.value) {
        return true;
      }
      if (control.dataset.searchFilter === "format") {
        return fieldContains(entry, "format", control.value) || fieldContains(entry, "type", control.value);
      }
      return fieldContains(entry, control.dataset.searchFilter, control.value);
    });
  }

  function scoreEntry(entry, rawQuery, tokens) {
    const query = normalize(rawQuery);
    const title = normalize(entry.title);
    const description = normalize(entry.description);
    const aliases = normalize(asArray(entry.aliases).join(" "));
    const tags = normalize(asArray(entry.tags).join(" "));
    const standards = normalize(asArray(entry.standards).join(" "));
    const instruments = normalize(asArray(entry.instruments).join(" "));
    const haystack = entry._haystack || getEntryHaystack(entry);
    let score = Number(entry.priority || 0);

    if (title.includes(query)) score += 120;
    if (aliases.includes(query)) score += 90;
    if (description.includes(query)) score += 55;
    if (tags.includes(query)) score += 40;
    if (standards.includes(query) || instruments.includes(query)) score += 42;
    if (haystack.includes(query)) score += 28;

    tokens.forEach((token) => {
      if (title.includes(token)) score += 30;
      if (aliases.includes(token)) score += 24;
      if (description.includes(token)) score += 14;
      if (tags.includes(token) || standards.includes(token) || instruments.includes(token)) score += 12;
      if (haystack.includes(token)) score += 4;
      else if (fuzzyTokenMatch(token, haystack)) score += 3;
    });

    return score;
  }

  function findRecommended(rawQuery) {
    const query = normalize(rawQuery);
    if (!query) return null;
    return state.entrypoints.find((entrypoint) =>
      asArray(entrypoint.match).some((match) => {
        const normalizedMatch = normalize(match);
        return query.includes(normalizedMatch) || normalizedMatch.includes(query);
      })
    );
  }

  function findRelated(rawQuery, tokens) {
    const query = normalize(rawQuery);
    const topics = [];
    Object.entries(state.associations).forEach(([key, values]) => {
      const normalizedKey = normalize(key);
      if (query.includes(normalizedKey) || tokens.includes(normalizedKey)) {
        topics.push(...asArray(values));
      }
    });
    state.dictionary.terms.forEach((term) => {
      const aliases = [term.label, term.key, ...asArray(term.aliases)].map(normalize);
      if (aliases.some((alias) => query.includes(alias) || tokens.includes(alias))) {
        topics.push(...asArray(term.related));
      }
    });
    return unique(topics).slice(0, 10);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlight(text, rawQuery, tokens) {
    let output = escapeHtml(text);
    const words = unique([rawQuery, ...tokens].filter((word) => String(word).trim().length > 2));
    words
      .sort((a, b) => b.length - a.length)
      .slice(0, 6)
      .forEach((word) => {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        output = output.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
      });
    return output;
  }

  function renderRecommended(entrypoint) {
    if (!recommendedPanel) return;
    if (!entrypoint) {
      recommendedPanel.hidden = true;
      recommendedPanel.innerHTML = "";
      return;
    }
    recommendedPanel.hidden = false;
    recommendedPanel.innerHTML = `
      <p class="hero-kicker">Empfohlener Einstieg</p>
      <h2>${escapeHtml(entrypoint.title)}</h2>
      <p>${escapeHtml(entrypoint.description)}</p>
      <ul class="search-tag-list">${asArray(entrypoint.tags).map((tag) => `<li><span>${escapeHtml(tag)}</span></li>`).join("")}</ul>
      <p><a href="${escapeHtml(entrypoint.url)}">Einstieg öffnen</a></p>
    `;
  }

  function renderRelated(topics) {
    if (!relatedPanel) return;
    if (!topics.length) {
      relatedPanel.hidden = true;
      relatedPanel.innerHTML = "";
      return;
    }
    relatedPanel.hidden = false;
    relatedPanel.innerHTML = `
      <h2>Verwandte Themen</h2>
      <ul class="search-topic-list">
        ${topics.map((topic) => `<li><a href="suche.html?q=${encodeURIComponent(topic)}">${escapeHtml(topic)}</a></li>`).join("")}
      </ul>
    `;
  }

  function renderResults(results, rawQuery, tokens) {
    resultsList.innerHTML = results
      .map(({ entry }) => {
        const tags = unique([...asArray(entry.tags), ...asArray(entry.instruments), ...asArray(entry.standards)]).slice(0, 6);
        const snippet = entry.description || entry.body || "";
        return `
          <li class="search-result-card">
            <article>
              <div class="search-result-meta">
                <span class="search-result-badge">${escapeHtml(entry.section || entry.type || "Seite")}</span>
                <span class="search-result-path">${escapeHtml(entry.url)}</span>
              </div>
              <h2><a href="${escapeHtml(entry.url)}">${highlight(entry.title, rawQuery, tokens)}</a></h2>
              <p>${highlight(snippet, rawQuery, tokens)}</p>
              <ul class="search-tag-list">${tags.map((tag) => `<li><span>${escapeHtml(tag)}</span></li>`).join("")}</ul>
            </article>
          </li>
        `;
      })
      .join("");
  }

  function getFiltersFromControls() {
    return Object.fromEntries(
      filterControls
        .filter((control) => control instanceof HTMLSelectElement && control.value)
        .map((control) => [control.dataset.searchFilter, control.value])
    );
  }

  function updateUrl(rawQuery) {
    const params = new URLSearchParams();
    if (rawQuery.trim()) params.set("q", rawQuery.trim());
    Object.entries(getFiltersFromControls()).forEach(([key, value]) => {
      const paramNames = {
        section: "bereich",
        impactSpaces: "wirkungsraum",
        standards: "standard",
        instruments: "instrument",
        tags: "thema",
      };
      const paramName = paramNames[key] || key;
      params.set(paramName, value);
    });
    const nextUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }

  function runSearch() {
    const rawQuery = input.value.trim();
    const tokens = expandQuery(rawQuery);
    const queryLength = normalize(rawQuery).length;
    const filtersActive = filterControls.some((control) => control instanceof HTMLSelectElement && control.value);

    if (!state.ready) {
      status.textContent = "Suche wird geladen.";
      return;
    }

    if (queryLength < 2 && !filtersActive) {
      resultsList.innerHTML = "";
      emptyState.hidden = false;
      renderRecommended(null);
      renderRelated([]);
      status.textContent = "Gib einen Suchbegriff ein.";
      updateUrl("");
      return;
    }

    emptyState.hidden = true;
    const scored = state.index
      .filter(passesFilters)
      .map((entry) => ({ entry, score: queryLength >= 2 ? scoreEntry(entry, rawQuery, tokens) : Number(entry.priority || 0) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || String(a.entry.title).localeCompare(String(b.entry.title), "de"))
      .slice(0, 40);

    renderRecommended(queryLength >= 2 ? findRecommended(rawQuery) : null);
    renderRelated(queryLength >= 2 ? findRelated(rawQuery, tokens) : []);
    renderResults(scored, rawQuery, tokens);

    const label = rawQuery ? ` für „${rawQuery}“` : "";
    status.textContent = `${scored.length} Treffer${label}`;
    if (!scored.length) {
      resultsList.innerHTML = `<li class="search-result-card"><h2>Keine Treffer gefunden</h2><p>Versuche einen einfacheren Begriff, eine Abkürzung oder einen verwandten Einstieg wie Wirkung, Steuer, SDG, Demokratie oder Reporting.</p></li>`;
    }
    updateUrl(rawQuery);
  }

  function scheduleSearch() {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(runSearch, 200);
  }

  function applyParams() {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    const map = {
      bereich: "section",
      section: "section",
      format: "format",
      wirkungsraum: "impactSpaces",
      standard: "standards",
      standards: "standards",
      instrument: "instruments",
      instruments: "instruments",
      thema: "tags",
      tags: "tags",
    };
    Object.entries(map).forEach(([param, field]) => {
      const value = params.get(param);
      if (!value) return;
      const control = filterControls.find((item) => item.dataset.searchFilter === field);
      if (control instanceof HTMLSelectElement) {
        control.value = value;
      }
    });
  }

  function bindEvents() {
    input.addEventListener("input", scheduleSearch);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      runSearch();
    });
    filterControls.forEach((control) => control.addEventListener("change", runSearch));
    resetButton?.addEventListener("click", () => {
      filterControls.forEach((control) => {
        if (control instanceof HTMLSelectElement) {
          control.value = "";
        }
      });
      runSearch();
    });
    suggestionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.searchSuggestion || "";
        input.focus();
        runSearch();
      });
    });
  }

  async function loadSearchData() {
    try {
      const [index, dictionary, associations, entrypoints] = await Promise.all([
        fetch(dataUrl("search-index.json")).then((response) => response.json()),
        fetch(dataUrl("search-dictionary.json")).then((response) => response.json()),
        fetch(dataUrl("search-associations.json")).then((response) => response.json()),
        fetch(dataUrl("search-curated-entrypoints.json")).then((response) => response.json()),
      ]);
      state.index = index.map((entry) => ({ ...entry, _haystack: getEntryHaystack(entry) }));
      state.dictionary = dictionary;
      state.associations = associations;
      state.entrypoints = entrypoints;
      state.ready = true;
      runSearch();
    } catch (error) {
      status.textContent = "Die Suche konnte nicht geladen werden.";
    }
  }

  applyParams();
  bindEvents();
  loadSearchData();
})();

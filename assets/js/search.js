(function () {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("#site-search-input");
  const status = document.querySelector("[data-search-status]");
  const resultsList = document.querySelector("[data-search-results]");
  const emptyState = document.querySelector("[data-search-empty]");
  const recommendedPanel = document.querySelector("[data-search-recommended]");
  const relatedPanel = document.querySelector("[data-search-related]");
  const suggestionsPanel = document.querySelector("[data-search-suggestions]");
  const filtersDetails = document.querySelector(".search-filters details");
  const filterControls = Array.from(document.querySelectorAll("[data-search-filter]"));
  const resetButton = document.querySelector("[data-search-reset]");
  const suggestionButtons = Array.from(document.querySelectorAll("[data-search-suggestion]"));
  const searchScriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="assets/js/search.js"]')?.src || "";
  const searchDataVersion = "20260525-ux-finish-knowledge-search";
  const MAX_HAYSTACK_CHARS = 1800;
  const MAX_SEARCH_SCAN = 700;
  const MAX_VISIBLE_RESULTS = 24;
  const SEARCH_GROUPS = [
    { id: "begriffe", label: "Begriffe", max: 5 },
    { id: "grundlagen", label: "Grundlagen", max: 4 },
    { id: "wirkungsfelder", label: "Wirkungsfelder", max: 5 },
    { id: "werkzeuge", label: "Werkzeuge", max: 5 },
    { id: "methoden", label: "Veröffentlichungen", max: 5 },
    { id: "akademie", label: "Akademie", max: 3 },
    { id: "downloads", label: "Downloads", max: 3 },
    { id: "journal", label: "Journal", max: 3 },
    { id: "beispiele", label: "Beispiele & Fallstudien", max: 3 },
    { id: "weitere", label: "Weitere Treffer", max: 4 },
  ];
  const GROUP_SCORE_BONUS = {
    begriffe: 260,
    grundlagen: 135,
    wirkungsfelder: 105,
    methoden: 88,
    werkzeuge: 72,
    akademie: 58,
    beispiele: 46,
    journal: 26,
    downloads: 14,
    weitere: 0,
  };
  const CURATED_QUERY_ROUTES = {
    wirkung: ["/begriffe/wirkung/", "/modell.html", "/kompass.html", "/wirkungsoekonomie.html"],
    "netto wirkung": ["/begriffe/positive-netto-wirkung/", "/modell.html", "/kompass.html"],
    "positive netto wirkung": ["/begriffe/positive-netto-wirkung/", "/modell.html", "/kompass.html"],
    wirkungseinkommen: ["/begriffe/wirkungseinkommen/", "/erleben/automatisierungs-wirkungseinkommensrechner/", "/wirkungsfelder/arbeit-einkommen/"],
    bildung: ["/wirkungsfelder/bildung/", "/begriffe/wirkungskompetenz/"],
  };

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
    searchRun: 0,
  };

  const dataUrl = (fileName) => {
    const url = new URL(`../search/${fileName}`, searchScriptUrl);
    url.searchParams.set("v", searchDataVersion);
    return url.href;
  };

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
    ].join(" ")).slice(0, MAX_HAYSTACK_CHARS);
  }

  function getEntryKeywordHaystack(entry) {
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
    ].join(" ")).slice(0, MAX_HAYSTACK_CHARS);
  }

  function classifyEntry(entry) {
    const url = normalize(entry.url);
    const title = normalize(entry.title);
    const section = normalize(entry.section);
    const type = normalize(entry.type);
    const format = normalize(entry.format);
    const tags = normalize(asArray(entry.tags).join(" "));

    if (type.includes("begriff") || format.includes("glossar") || section.includes("begriffe") || url.startsWith("/begriffe/") || url.includes("glossar")) {
      return "begriffe";
    }
    if (url.startsWith("/werkzeuge/") || url.startsWith("/erleben") || url.startsWith("/anwendungen") || type.includes("tool") || format.includes("tool") || tags.includes("demo")) {
      return "werkzeuge";
    }
    if (url.startsWith("/wirkungsfelder/") || section.includes("wirkungsfelder")) {
      return "wirkungsfelder";
    }
    if (url.startsWith("/akademie") || section.includes("akademie") || format.includes("akademie")) {
      return "akademie";
    }
    if (url.startsWith("/downloads") || url.includes("/assets/downloads/") || format.includes("download") || format.includes("paper")) {
      return "downloads";
    }
    if (url.startsWith("/blog") || section.includes("journal") || section.includes("blog") || format.includes("blog")) {
      return "journal";
    }
    if (tags.includes("fallbeispiel") || tags.includes("beispiel") || format.includes("fallbeispiel") || title.includes("beispiel")) {
      return "beispiele";
    }
    if (
      type.includes("detailkonzept") ||
      type.includes("methoden") ||
      type.includes("gesetz") ||
      format.includes("online volltext") ||
      tags.includes("whitepaper") ||
      tags.includes("wstg") ||
      tags.includes("wustg")
    ) {
      return "methoden";
    }
    if (
      url.startsWith("/verstehen") ||
      url.startsWith("/modell") ||
      url.startsWith("/wirkungsoekonomie") ||
      url.startsWith("/kompass") ||
      url.startsWith("/referenz") ||
      section.includes("verstehen")
    ) {
      return "grundlagen";
    }
    return "weitere";
  }

  function normalizeRoute(url) {
    return String(url || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
  }

  function isLowValueSearchEntry(entry) {
    const route = normalizeRoute(entry.url);
    const title = normalize(entry.title);
    const section = normalize(entry.section);
    if (/\/(impressum|datenschutz|ueber|mitmachen)(\.html|\/)?$/i.test(route)) return true;
    if (title.includes("footer") || title.includes("navigation") || title.includes("kontakt")) return true;
    if (section.includes("footer") || section.includes("navigation")) return true;
    return false;
  }

  function curatedRouteBoost(entry, rawQuery) {
    const query = normalize(rawQuery);
    const route = normalizeRoute(entry.url);
    const routes = CURATED_QUERY_ROUTES[query] || [];
    const index = routes.indexOf(route);
    return index >= 0 ? 360 - index * 45 : 0;
  }

  function getGroupLabel(groupId) {
    return SEARCH_GROUPS.find((group) => group.id === groupId)?.label || "Weitere Treffer";
  }

  function getDisplayBadge(entry, groupId) {
    if (groupId === "begriffe") return "Begriff";
    if (groupId === "grundlagen") return "Grundlage";
    if (groupId === "wirkungsfelder") return "Wirkungsfeld";
    if (groupId === "werkzeuge") return "Werkzeug";
    if (groupId === "methoden") return entry.type || "Methode";
    if (groupId === "akademie") return "Akademie";
    if (groupId === "downloads") return "Download";
    if (groupId === "journal") return "Journal";
    if (groupId === "beispiele") return "Beispiel";
    return entry.section || entry.type || "Treffer";
  }

  function getDisplayPath(entry, groupId) {
    const url = String(entry.url || "");
    if (!url) return "";
    if (groupId === "downloads" || url.includes("/assets/downloads/")) {
      return "Download / Archiv";
    }
    if (url.length > 86) {
      return `${url.slice(0, 82)}...`;
    }
    return url;
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
    if (token.length < 5) {
      return false;
    }
    return haystack.split(" ").some((word) => {
      if (Math.abs(word.length - token.length) > 2) return false;
      const limit = token.length > 7 ? 2 : 1;
      return levenshtein(token, word) <= limit;
    });
  }

  function containsToken(value, token) {
    const words = normalize(value).split(" ").filter(Boolean);
    return words.some((word) => word === token || (token.length >= 4 && word.startsWith(token)));
  }

  function containsQuery(value, query) {
    return query.includes(" ") ? normalize(value).includes(query) : containsToken(value, query);
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

  function getQueryTokens(rawQuery) {
    return normalize(rawQuery).split(" ").filter((token) => token.length > 1);
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
      if (control.dataset.searchFilter === "section") {
        const selected = control.value;
        const section = normalize(entry.section);
        const type = normalize(entry.type || entry.format);
        const tags = normalize(asArray(entry.tags).join(" "));
        if (selected === "Seiten") return type.includes("seite");
        if (selected === "Wissenskarten") return section.includes("wissenskarten") || type.includes("wissenskarte");
        if (selected === "Anwendungen") return ["anwendungen", "scanner", "erleben"].some((item) => section.includes(item)) || type.includes("tool");
        if (selected === "Zielgruppen") return section.includes("fuer") || section.includes("für wen") || String(entry.url || "").startsWith("/fuer/");
        if (selected === "Audio") return section.includes("audio") || type.includes("audio") || tags.includes("audio");
        return fieldContains(entry, "section", selected);
      }
      if (control.dataset.searchFilter === "format") {
        return fieldContains(entry, "format", control.value) || fieldContains(entry, "type", control.value);
      }
      return fieldContains(entry, control.dataset.searchFilter, control.value);
    });
  }

  function entryMatchesQuery(entry, rawQuery) {
    const query = normalize(rawQuery);
    const queryTokens = getQueryTokens(rawQuery);
    const haystack = entry._haystack || getEntryHaystack(entry);
    const keywordHaystack = entry._keywordHaystack || getEntryKeywordHaystack(entry);

    if (!query) return true;
    if (containsQuery(haystack, query)) return true;
    if (queryTokens.length >= 3 && queryTokens.some((token) => /\d/.test(token))) {
      return false;
    }
    if (queryTokens.length <= 1) {
      const token = queryTokens[0] || query;
      return containsToken(haystack, token) || fuzzyTokenMatch(token, keywordHaystack);
    }
    return queryTokens.every((token) => containsToken(haystack, token) || fuzzyTokenMatch(token, keywordHaystack));
  }

  function scoreEntry(entry, rawQuery, tokens) {
    if (!entryMatchesQuery(entry, rawQuery)) {
      return 0;
    }

    const query = normalize(rawQuery);
    const title = normalize(entry.title);
    const description = normalize(entry.description);
    const aliases = normalize(asArray(entry.aliases).join(" "));
    const tags = normalize(asArray(entry.tags).join(" "));
    const standards = normalize(asArray(entry.standards).join(" "));
    const instruments = normalize(asArray(entry.instruments).join(" "));
    const haystack = entry._haystack || getEntryHaystack(entry);
    const keywordHaystack = entry._keywordHaystack || getEntryKeywordHaystack(entry);
    const groupId = entry._group || classifyEntry(entry);
    let score = Number(entry.priority || 0) + Number(GROUP_SCORE_BONUS[groupId] || 0);
    if (isLowValueSearchEntry(entry)) score -= 500;
    score += curatedRouteBoost(entry, rawQuery);

    if (containsQuery(title, query)) score += 120;
    if (containsQuery(aliases, query)) score += 90;
    if (containsQuery(description, query)) score += 55;
    if (containsQuery(tags, query)) score += 40;
    if (containsQuery(standards, query) || containsQuery(instruments, query)) score += 42;
    if (containsQuery(haystack, query)) score += 80;

    tokens.forEach((token) => {
      if (containsToken(title, token)) score += 30;
      if (containsToken(aliases, token)) score += 24;
      if (containsToken(description, token)) score += 14;
      if (containsToken(tags, token) || containsToken(standards, token) || containsToken(instruments, token)) score += 12;
      if (containsToken(haystack, token)) score += 4;
      else if (fuzzyTokenMatch(token, keywordHaystack)) score += 3;
    });

    return score;
  }

  function dedupeResults(results) {
    const seen = new Set();
    return results.filter(({ entry }) => {
      const key = normalize(entry.url || entry.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function groupResults(results) {
    const groups = SEARCH_GROUPS.map((group) => ({ ...group, results: [] }));
    const byId = new Map(groups.map((group) => [group.id, group]));
    let visibleCount = 0;

    dedupeResults(results).forEach((item) => {
      const groupId = item.entry._group || classifyEntry(item.entry);
      const group = byId.get(groupId) || byId.get("weitere");
      if (!group || group.results.length >= group.max || visibleCount >= MAX_VISIBLE_RESULTS) return;
      group.results.push(item);
      visibleCount += 1;
    });

    return groups.filter((group) => group.results.length);
  }

  function makeSnippet(entry, rawQuery) {
    const fallback = entry.description || entry.body || "";
    const body = String(entry.body || fallback);
    const query = normalize(rawQuery);
    if (!query || !body) return fallback;

    const normalizedBody = normalize(body);
    let index = normalizedBody.indexOf(query);
    if (index < 0) {
      const firstToken = getQueryTokens(rawQuery).find((token) => normalizedBody.includes(token));
      index = firstToken ? normalizedBody.indexOf(firstToken) : -1;
    }
    if (index < 0) return fallback;

    const start = Math.max(0, index - 140);
    const end = Math.min(body.length, index + query.length + 220);
    return `${start > 0 ? "..." : ""}${body.slice(start, end)}${end < body.length ? "..." : ""}`;
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

  function getDefaultTopics() {
    return [
      "Wirkung",
      "Wirkungspotenzial",
      "positive Netto-Wirkung",
      "SDG+",
      "Wirkungsrückkopplung",
      "Wirkung politischer Sprache",
      "Wirkungseinkommen",
      "Wirkungsrente",
    ];
  }

  function getDefaultResults() {
    const preferred = [
      "/begriffe/wirkung/",
      "/kompass.html",
      "/modell.html",
      "/wirkungsoekonomie.html",
      "/wirkungsfelder/",
      "/erleben.html",
      "/anwendungen/scanner.html",
      "/begriffe/positive-netto-wirkung/",
    ];
    const byUrl = new Map(state.index.map((entry) => [String(entry.url || ""), entry]));
    const seeded = preferred.map((url) => byUrl.get(url)).filter(Boolean);
    const fallback = state.index
      .filter((entry) => !isLowValueSearchEntry(entry))
      .slice()
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
      .filter((entry) => !seeded.includes(entry))
      .slice(0, Math.max(0, 8 - seeded.length));
    return [...seeded, ...fallback].slice(0, 8).map((entry) => ({ entry, score: Number(entry.priority || 0) }));
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

  function renderSuggestions(rawQuery, tokens) {
    if (!suggestionsPanel) return;
    const query = normalize(rawQuery);
    if (query.length < 2) {
      suggestionsPanel.hidden = true;
      suggestionsPanel.innerHTML = "";
      return;
    }
    const dictionaryMatches = state.dictionary.terms
      .filter((term) => {
        const aliases = [term.label, term.key, ...asArray(term.aliases)].map(normalize);
        return aliases.some((alias) => alias.includes(query) || query.includes(alias) || tokens.some((token) => alias.includes(token)));
      })
      .slice(0, 6)
      .map((term) => ({ label: term.label, type: "Begriff", q: term.label }));
    const entryMatches = state.index
      .filter((entry) => {
        const groupId = entry._group || classifyEntry(entry);
        const title = String(entry.title || "");
        if (/:\s*seite\s+\d+/i.test(title)) return false;
        if (["downloads", "journal", "weitere"].includes(groupId)) return false;
        return containsQuery(entry._keywordHaystack || getEntryKeywordHaystack(entry), query);
      })
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))
      .slice(0, 6)
      .map((entry) => {
        const groupId = entry._group || classifyEntry(entry);
        return { label: entry.title, type: getGroupLabel(groupId), q: entry.title };
      });
    const suggestions = unique([...dictionaryMatches, ...entryMatches].map((item) => `${item.type}::${item.label}::${item.q}`))
      .slice(0, 8)
      .map((item) => {
        const [type, label, q] = item.split("::");
        return { type, label, q };
      });
    if (!suggestions.length) {
      suggestionsPanel.hidden = true;
      suggestionsPanel.innerHTML = "";
      return;
    }
    suggestionsPanel.hidden = false;
    suggestionsPanel.innerHTML = `
      <p class="hero-kicker">Vorschläge</p>
      <div class="search-suggestion-list">
        ${suggestions.map((item) => `<button type="button" data-suggest-query="${escapeHtml(item.q)}"><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.type)}</small></button>`).join("")}
      </div>
    `;
    suggestionsPanel.querySelectorAll("[data-suggest-query]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.suggestQuery || "";
        input.focus();
        runSearch();
      });
    });
  }

  function renderResultCard(entry, rawQuery, tokens) {
    const groupId = entry._group || classifyEntry(entry);
    const tags = unique([...asArray(entry.tags), ...asArray(entry.instruments), ...asArray(entry.standards)]).slice(0, 6);
    const snippet = makeSnippet(entry, rawQuery);
    return `
      <li class="search-result-card">
        <article>
          <div class="search-result-meta">
            <span class="search-result-badge">${escapeHtml(getDisplayBadge(entry, groupId))}</span>
            <span class="search-result-path">${escapeHtml(getDisplayPath(entry, groupId))}</span>
          </div>
          <h3><a href="${escapeHtml(entry.url)}">${highlight(entry.title, rawQuery, tokens)}</a></h3>
          <p>${highlight(snippet, rawQuery, tokens)}</p>
          <ul class="search-tag-list">${tags.map((tag) => `<li><span>${escapeHtml(tag)}</span></li>`).join("")}</ul>
        </article>
      </li>
    `;
  }

  function renderResults(results, rawQuery, tokens) {
    const groupedResults = groupResults(results);
    resultsList.innerHTML = groupedResults
      .map((group) => {
        const renderedCards = group.results.map(({ entry }) => renderResultCard(entry, rawQuery, tokens)).join("");
        return `
          <li class="search-result-group" data-search-group="${escapeHtml(group.id)}">
            <h2>${escapeHtml(group.label)}</h2>
            <ol class="search-result-group-list">
              ${renderedCards}
            </ol>
          </li>
        `;
      })
      .join("");
  }

  function renderFlatResults(results, rawQuery, tokens) {
    resultsList.innerHTML = results
      .map(({ entry }) => {
        const tags = unique([...asArray(entry.tags), ...asArray(entry.instruments), ...asArray(entry.standards)]).slice(0, 6);
        const snippet = makeSnippet(entry, rawQuery);
        return `
          <li class="search-result-card">
            <article>
              <div class="search-result-meta">
                <span class="search-result-badge">${escapeHtml(getDisplayBadge(entry, entry._group || classifyEntry(entry)))}</span>
                <span class="search-result-path">${escapeHtml(getDisplayPath(entry, entry._group || classifyEntry(entry)))}</span>
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
      emptyState.hidden = false;
      renderFlatResults(getDefaultResults(), "", []);
      renderRecommended(null);
      renderRelated(getDefaultTopics());
      renderSuggestions("", []);
      status.textContent = "Empfohlene Einstiege";
      updateUrl("");
      return;
    }

    emptyState.hidden = true;
    const runId = ++state.searchRun;
    const filtered = state.index.filter(passesFilters);
    const scored = [];
    let cursor = 0;

    status.textContent = "Suche läuft ...";

    const finishSearch = () => {
      if (runId !== state.searchRun) return;
      const matchingResults = scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || String(a.entry.title).localeCompare(String(b.entry.title), "de"));
      const totalResults = matchingResults.length;
      const groupedResults = groupResults(matchingResults);
      const finalResults = groupedResults.flatMap((group) => group.results);

      renderRecommended(queryLength >= 2 ? findRecommended(rawQuery) : null);
      renderRelated(queryLength >= 2 ? findRelated(rawQuery, tokens) : []);
      renderSuggestions(rawQuery, tokens);
      renderResults(matchingResults, rawQuery, tokens);

      const label = rawQuery ? ` für „${rawQuery}“` : "";
      const resultWord = finalResults.length === 1 ? "kuratierter Treffer" : "kuratierte Treffer";
      const groupNote = groupedResults.length ? ` in ${groupedResults.length} Wissensbereichen` : "";
      const rawNote = totalResults > finalResults.length ? " aus dem Wissensindex gebündelt" : "";
      status.textContent = `${finalResults.length} ${resultWord}${groupNote}${label}${rawNote}`;
      if (!finalResults.length) {
        resultsList.innerHTML = `<li class="search-result-card"><h2>Keine Treffer gefunden</h2><p>Versuche einen einfacheren Begriff, eine Abkürzung oder einen verwandten Einstieg wie Wirkung, Steuer, SDG, Demokratie oder Reporting.</p></li>`;
      }
      updateUrl(rawQuery);
    };

    const processChunk = () => {
      if (runId !== state.searchRun) return;
      const end = Math.min(cursor + MAX_SEARCH_SCAN, filtered.length);
      for (; cursor < end; cursor += 1) {
        const entry = filtered[cursor];
        const score = queryLength >= 2 ? scoreEntry(entry, rawQuery, tokens) : Number(entry.priority || 0);
        if (score > 0) scored.push({ entry, score });
      }
      if (cursor < filtered.length) {
        window.setTimeout(processChunk, 0);
      } else {
        finishSearch();
      }
    };

    processChunk();
  }

  function scheduleSearch() {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(runSearch, 300);
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
        if (filtersDetails instanceof HTMLDetailsElement) {
          filtersDetails.open = true;
        }
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
    filtersDetails?.addEventListener("toggle", () => {
      const summary = filtersDetails.querySelector("summary");
      if (summary) {
        summary.textContent = filtersDetails.open ? "Filter ausblenden" : "Filter anzeigen";
      }
    });
    if (filtersDetails instanceof HTMLDetailsElement && filtersDetails.open) {
      const summary = filtersDetails.querySelector("summary");
      if (summary) summary.textContent = "Filter ausblenden";
    }
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
      state.index = index.map((entry) => ({
        ...entry,
        body: String(entry.body || "").slice(0, MAX_HAYSTACK_CHARS),
        _group: classifyEntry(entry),
        _haystack: getEntryHaystack(entry),
        _keywordHaystack: getEntryKeywordHaystack(entry),
      }));
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

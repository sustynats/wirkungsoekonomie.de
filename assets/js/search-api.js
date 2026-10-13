import { loadBrowserSearchIndex, loadSearchSuggestions } from "./search-index-loader.js";

const PAGE_SIZE = 20;
const DEFAULT_BASE = new URL("../search/", import.meta.url).href;

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("de-DE")
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

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function valuesFor(entry, field) {
  if (field === "thema") return asArray(entry.thema || entry.tags);
  if (field === "rolle") return asArray(entry.rolle);
  return asArray(entry[field]);
}

function matchesFilter(entry, field, selected) {
  const needle = normalize(selected);
  if (!needle) return true;
  return valuesFor(entry, field).some((value) => normalize(value) === needle);
}

function haystack(entry) {
  return normalize([
    entry.title,
    entry.description,
    entry.body,
    entry.raum,
    entry.typ,
    ...asArray(entry.aliases),
    ...asArray(entry.thema || entry.tags),
    ...asArray(entry.rolle),
    ...asArray(entry.semanticTerms),
    ...asArray(entry.standards),
    ...asArray(entry.instruments),
    ...asArray(entry.impactSpaces),
  ].join(" "));
}

function expandedTerms(rawQuery, dictionary, associations) {
  const query = normalize(rawQuery);
  const terms = new Set([query, ...query.split(" ")].filter((term) => term.length > 1));
  for (const [key, values] of Object.entries(dictionary?.typos || {})) {
    if (query.includes(normalize(key))) terms.add(normalize(values));
  }
  for (const term of dictionary?.terms || []) {
    const aliases = [term.key, term.label, ...asArray(term.aliases)].map(normalize).filter(Boolean);
    if (aliases.some((alias) => query.includes(alias) || alias.includes(query))) {
      for (const alias of aliases) terms.add(alias);
      for (const related of asArray(term.related).map(normalize)) terms.add(related);
    }
  }
  for (const [key, related] of Object.entries(associations || {})) {
    const normalizedKey = normalize(key);
    if (query.includes(normalizedKey) || terms.has(normalizedKey)) {
      for (const value of asArray(related).map(normalize)) terms.add(value);
    }
  }
  return [...terms].filter((term) => term.length > 1).slice(0, 36);
}

function score(entry, rawQuery, terms) {
  const query = normalize(rawQuery);
  if (!query) return Number(entry.priority || 0);
  const title = normalize(entry.title);
  const aliases = normalize(asArray(entry.aliases).join(" "));
  const description = normalize(entry.description);
  const text = haystack(entry);
  const direct = text.includes(query);
  const tokenMatches = query.split(" ").filter(Boolean).every((token) => text.includes(token));
  const semanticMatches = terms.filter((term) => term.length > 2 && text.includes(term));
  if (!direct && !tokenMatches && !semanticMatches.length) return 0;
  let value = Number(entry.priority || 0);
  if (title === query) value += 500;
  else if (title.startsWith(query)) value += 260;
  else if (title.includes(query)) value += 180;
  if (aliases.includes(query)) value += 120;
  if (description.includes(query)) value += 70;
  if (direct) value += 55;
  value += Math.min(semanticMatches.length * 8, 80);
  return value;
}

function facet(entries, field) {
  const counts = new Map();
  for (const entry of entries) {
    for (const value of new Set(valuesFor(entry, field).filter(Boolean))) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value, "de"));
}

function result(entry) {
  return {
    title: entry.title,
    url: entry.url,
    type: entry.typ,
    raum: entry.raum,
    snippet: entry.description || entry.body || "",
  };
}

export function createSearchClient({ baseUrl = DEFAULT_BASE } = {}) {
  let semanticData;
  const loadSemantics = () => {
    if (!semanticData) {
      semanticData = Promise.all([
        fetch(new URL("search-dictionary.json", baseUrl)).then((response) => {
          if (!response.ok) throw new Error(`Search dictionary: HTTP ${response.status}`);
          return response.json();
        }),
        fetch(new URL("search-associations.json", baseUrl)).then((response) => {
          if (!response.ok) throw new Error(`Search associations: HTTP ${response.status}`);
          return response.json();
        }),
      ]);
    }
    return semanticData;
  };

  return {
    async suggest(prefix, { limit = 8 } = {}) {
      const query = normalize(prefix);
      if (query.length < 2) return [];
      const entries = await loadSearchSuggestions(baseUrl);
      return entries
        .map((entry) => {
          const title = normalize(entry.title);
          const aliases = asArray(entry.aliases).map(normalize);
          const exact = title === query || aliases.includes(query);
          const starts = title.startsWith(query) || aliases.some((alias) => alias.startsWith(query));
          const includes = title.includes(query) || aliases.some((alias) => alias.includes(query));
          return { entry, score: exact ? 3 : starts ? 2 : includes ? 1 : 0 };
        })
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title, "de"))
        .slice(0, Math.max(1, Math.min(Number(limit) || 8, 20)))
        .map(({ entry }) => ({
          title: entry.title,
          url: entry.url,
          type: entry.type,
          raum: entry.raum,
          snippet: entry.snippet,
        }));
    },

    async search(query, { raum = "", typ = "", thema = "", rolle = "", page = 1 } = {}) {
      const [entries, [dictionary, associations]] = await Promise.all([
        loadBrowserSearchIndex(baseUrl),
        loadSemantics(),
      ]);
      const terms = expandedTerms(query, dictionary, associations);
      const filtered = entries
        .filter((entry) => matchesFilter(entry, "raum", raum)
          && matchesFilter(entry, "typ", typ)
          && matchesFilter(entry, "thema", thema)
          && matchesFilter(entry, "rolle", rolle))
        .map((entry) => ({ entry, score: score(entry, query, terms) }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score
          || left.entry.title.localeCompare(right.entry.title, "de")
          || left.entry.url.localeCompare(right.entry.url, "de"));
      const matches = filtered.map((item) => item.entry);
      const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
      const start = (currentPage - 1) * PAGE_SIZE;
      return {
        total: matches.length,
        results: matches.slice(start, start + PAGE_SIZE).map(result),
        groups: facet(matches, "typ"),
        facets: {
          raum: facet(matches, "raum"),
          typ: facet(matches, "typ"),
          thema: facet(matches, "thema"),
          rolle: facet(matches, "rolle"),
        },
      };
    },
  };
}

const defaultClient = createSearchClient();

export const suggest = (...args) => defaultClient.suggest(...args);
export const search = (...args) => defaultClient.search(...args);

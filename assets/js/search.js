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
  const quickFilterButtons = Array.from(document.querySelectorAll("[data-search-quick-filter]"));
  const resetButton = document.querySelector("[data-search-reset]");
  const suggestionButtons = Array.from(document.querySelectorAll("[data-search-suggestion]"));
  const searchScriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="assets/js/search.js"]')?.src || "";
  const siteLocale = document.documentElement.lang === "en" ? "en" : "de";
  const i18n = (deText, enText) => (siteLocale === "en" ? enText : deText);
  const searchPageHref = siteLocale === "en" ? "/en/search/" : "/suche.html";
  const searchDataVersion = "20260827-live-index";
  const MAX_HAYSTACK_CHARS = 1800;
  const MAX_SEARCH_SCAN = 2500;
  const MAX_VISIBLE_RESULTS = 24;
  const SEARCH_RESULT_CACHE_LIMIT = 40;
  const SEARCH_GROUPS = [
    { id: "fragen", label: i18n("Fragen & Einwände", "Questions & objections"), max: 4 },
    { id: "begriffe", label: i18n("Begriffe", "Terms"), max: 5 },
    { id: "grundlagen", label: i18n("Grundlagen", "Foundations"), max: 4 },
    { id: "wirkungsfelder", label: i18n("Wirkungsfelder", "Impact fields"), max: 5 },
    { id: "werkzeuge", label: i18n("Werkzeuge", "Tools"), max: 5 },
    { id: "methoden", label: i18n("Veröffentlichungen", "Publications"), max: 5 },
    { id: "akademie", label: i18n("Akademie", "Academy"), max: 3 },
    { id: "downloads", label: "Downloads", max: 3 },
    { id: "journal", label: "Journal", max: 3 },
    { id: "beispiele", label: i18n("Beispiele & Fallstudien", "Examples & case studies"), max: 3 },
    { id: "weitere", label: i18n("Weitere Treffer", "More results"), max: 4 },
  ];
  const GROUP_SCORE_BONUS = {
    fragen: 340,
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
    folgencheck: ["/begriffe/folgencheck/", "/werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/", "/anwendungen/scanner.html"],
    faktencheck: ["/begriffe/faktencheck/", "/werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/", "/anwendungen/scanner.html"],
    wirkstoff: ["/begriffe/wirkstoff/", "/begriffe/folgencheck/", "/anwendungen/scanner.html"],
    wirkungsraum: ["/begriffe/wirkungsraum/", "/begriffe/folgencheck/", "/anwendungen/scanner.html"],
    wirkungspfad: ["/begriffe/wirkungspfad/", "/begriffe/folgencheck/", "/anwendungen/scanner.html"],
    wirkungspotenzial: ["/begriffe/wirkungspotenzial/", "/begriffe/folgencheck/", "/anwendungen/scanner.html"],
    wirkungskompetenz: ["/begriffe/wirkungskompetenz/", "/begriffe/idgs/", "/verstehen/sdgs-sdgplus/"],
    idg: ["/begriffe/idgs/", "/begriffe/wirkungskompetenz/", "/verstehen/sdgs-sdgplus/"],
    idgs: ["/begriffe/idgs/", "/begriffe/wirkungskompetenz/", "/verstehen/sdgs-sdgplus/"],
    "inner development goals": ["/begriffe/idgs/", "/begriffe/wirkungskompetenz/", "/verstehen/sdgs-sdgplus/"],
    wirkungseinkommen: ["/begriffe/wirkungseinkommen/", "/erleben/automatisierungs-wirkungseinkommensrechner/", "/wirkungsfelder/arbeit-einkommen/"],
    wirkungsfinanzpolitik: ["/begriffe/wirkungsfinanzpolitik/", "/wirkungsfelder/wirkungsfinanzpolitik/", "/dokumente/wirkungsfinanzpolitik/"],
    planwirtschaft: ["/fragen/", "/portale/kritik-missverstaendnisse-schutzarchitektur/faq-missverstaendnisse/", "/modell.html"],
    "social credit": ["/fragen/", "/begriffe/social-credit/", "/portale/kritik-missverstaendnisse-schutzarchitektur/faq-missverstaendnisse/"],
    "social-credit": ["/fragen/", "/begriffe/social-credit/", "/portale/kritik-missverstaendnisse-schutzarchitektur/faq-missverstaendnisse/"],
    esg: ["/fragen/", "/begriffe/esg/", "/wirkungsfelder/wirtschaft-unternehmen/"],
    "green deal": ["/begriffe/european-green-deal/", "/methodik/daten-standards-regularien.html", "/begriffe/eu-taxonomie/"],
    "european green deal": ["/begriffe/european-green-deal/", "/methodik/daten-standards-regularien.html", "/begriffe/eu-taxonomie/"],
    "eu taxonomie": ["/begriffe/eu-taxonomie/", "/methodik/daten-standards-regularien.html", "/wirkungsfelder/finanzsystem-kapital/"],
    "eu-taxonomie": ["/begriffe/eu-taxonomie/", "/methodik/daten-standards-regularien.html", "/wirkungsfelder/finanzsystem-kapital/"],
    "social taxonomy": ["/begriffe/social-taxonomy/", "/blog/social-taxonomy-soziale-wirkung-nachhaltige-maerkte.html", "/begriffe/eu-taxonomie/"],
    "social-taxonomy": ["/begriffe/social-taxonomy/", "/blog/social-taxonomy-soziale-wirkung-nachhaltige-maerkte.html", "/begriffe/eu-taxonomie/"],
    "reverse merit order": ["/begriffe/reverse-merit-order/", "/werkzeuge/reverse-merit-order/", "/wirkungsfelder/produkte-konsum/"],
    nwi: ["/begriffe/nwi/", "/werkzeuge/netto-wirkungs-index/", "/werkzeuge/impact-controlling/"],
    "t-sroi": ["/begriffe/t-sroi/", "/werkzeuge/impact-controlling/t-sroi/", "/werkzeuge/impact-controlling/"],
    "wök-id": ["/begriffe/woek-id/", "/werkzeuge/woek-ids/", "/verstehen/sdgs-sdgplus/"],
    "woek-id": ["/begriffe/woek-id/", "/werkzeuge/woek-ids/", "/verstehen/sdgs-sdgplus/"],
    "5 p": ["/wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/marketing_fuenftes_p_planet/", "/wirkungsfelder/wirtschaft-unternehmen/"],
    planet: ["/wirkungsfelder/wirtschaft-unternehmen/detailkonzepte/marketing_fuenftes_p_planet/", "/begriffe/mensch-planet-demokratie/"],
    produktwirkung: ["/wirkungsfelder/produkte-konsum/", "/erleben/produktwirkungsrechner/", "/begriffe/wirkung/"],
    automatisierung: ["/erleben/automatisierungs-wirkungseinkommensrechner/", "/wirkungsfelder/arbeit-einkommen/automatisierung-maschinenleistung/", "/begriffe/maschinenwertschoepfungsbeitrag/"],
    bildung: ["/wirkungsfelder/bildung/", "/begriffe/wirkungskompetenz/"],
    gesundheit: ["/wirkungsfelder/gesundheit-pflege/", "/wirkungsfelder/"],
    westdeutsche: ["/wirkungsradar/live/westdeutsche-keine-deutschen/", "/blog/der-versoehner-und-die-wellen/index.html"],
    ostdeutschland: ["/wirkungsradar/live/westdeutsche-keine-deutschen/", "/blog/der-versoehner-und-die-wellen/index.html"],
    "ostdeutschland deutsche": ["/wirkungsradar/live/westdeutsche-keine-deutschen/", "/blog/der-versoehner-und-die-wellen/index.html"],
    "deutsche wohnen": ["/wirkungsradar/live/westdeutsche-keine-deutschen/", "/blog/der-versoehner-und-die-wellen/index.html"],
    "nur in ostdeutschland": ["/wirkungsradar/live/westdeutsche-keine-deutschen/", "/blog/der-versoehner-und-die-wellen/index.html"],
  };
  const RECOMMENDED_QUERY_ENTRYPOINTS = {
    wirkung: {
      title: "Begriff: Wirkung",
      description: "Die zentrale Leitgröße der Wirkungsökonomie: Was verändert eine Entscheidung für Mensch, Planet und Demokratie?",
      url: "/begriffe/wirkung/",
      tags: ["Begriff", "Modell", "Kompass"],
    },
    planwirtschaft: {
      title: "Ist die Wirkungsökonomie Planwirtschaft?",
      description: "Die ausführliche Antwort erklärt, warum die WÖk mit Markt, Demokratie, Korrektur und Rückkopplung arbeitet.",
      url: "/fragen/#planwirtschaft",
      tags: ["Einwand", "Markt", "Freiheit"],
    },
    "social credit": {
      title: "Ist das Social Credit?",
      description: "Die Antwort grenzt Wirkungsdaten von personenbezogener Bewertung, Überwachung und Sanktionierung ab.",
      url: "/fragen/#social-credit",
      tags: ["Einwand", "Datenschutz", "Schutzgrenzen"],
    },
    "social-credit": {
      title: "Ist das Social Credit?",
      description: "Die Antwort grenzt Wirkungsdaten von personenbezogener Bewertung, Überwachung und Sanktionierung ab.",
      url: "/fragen/#social-credit",
      tags: ["Einwand", "Datenschutz", "Schutzgrenzen"],
    },
    wirkungseinkommen: {
      title: "Begriff: Wirkungseinkommen",
      description: "Der Begriff erklärt den Vorschlag und führt zum Automatisierungs- und Wirkungseinkommensrechner.",
      url: "/begriffe/wirkungseinkommen/",
      tags: ["Begriff", "Automatisierung", "Soziale Sicherung"],
    },
    wirkungsfinanzpolitik: {
      title: "Begriff: Wirkungsfinanzpolitik",
      description: "Der Begriff führt direkt zur Bereichsseite, zum Arbeitspapier und zu den Anschlussbegriffen rund um MMT, Public Purpose und Wirkungshaushalt.",
      url: "/begriffe/wirkungsfinanzpolitik/",
      tags: ["Begriff", "Staat", "Öffentliche Finanzen"],
    },
    folgencheck: {
      title: "Begriff: Folgencheck",
      description: "Der Begriff führt von Wirkstoff, Wirkungspotenzial und Wirkungsraum zur modellhaften Prüfung möglicher Folgen.",
      url: "/begriffe/folgencheck/",
      tags: ["Begriff", "Scanner", "Medienwirkung"],
    },
    "green deal": {
      title: "Begriff: European Green Deal",
      description: "Der Daten- und Standardsbegriff ordnet den Green Deal als Anschlussrahmen für Wirkung, Taxonomie und Transformation ein.",
      url: "/begriffe/european-green-deal/",
      tags: ["Daten & Standards", "EU", "Taxonomie"],
    },
    "eu taxonomie": {
      title: "Begriff: EU-Taxonomie",
      description: "Der Begriff macht die EU-Taxonomie als bestehenden Klassifikations- und Datenrahmen auffindbar.",
      url: "/begriffe/eu-taxonomie/",
      tags: ["Daten & Standards", "EU"],
    },
    "eu-taxonomie": {
      title: "Begriff: EU-Taxonomie",
      description: "Der Begriff macht die EU-Taxonomie als bestehenden Klassifikations- und Datenrahmen auffindbar.",
      url: "/begriffe/eu-taxonomie/",
      tags: ["Daten & Standards", "EU"],
    },
    "social taxonomy": {
      title: "Begriff: Social Taxonomy",
      description: "Der Begriff ordnet soziale Wirkung in nachhaltige Märkte, Standards und Anschlusslogiken ein.",
      url: "/begriffe/social-taxonomy/",
      tags: ["Daten & Standards", "Soziale Wirkung"],
    },
    "social-taxonomy": {
      title: "Begriff: Social Taxonomy",
      description: "Der Begriff ordnet soziale Wirkung in nachhaltige Märkte, Standards und Anschlusslogiken ein.",
      url: "/begriffe/social-taxonomy/",
      tags: ["Daten & Standards", "Soziale Wirkung"],
    },
    "t sroi": {
      title: "Begriff: T-SROI",
      description: "Der Begriff erklärt den transformierten Social Return on Investment als Wirkungs- und Transformationsmaß.",
      url: "/begriffe/t-sroi/",
      tags: ["Begriff", "Impact Controlling"],
    },
    "t-sroi": {
      title: "Begriff: T-SROI",
      description: "Der Begriff erklärt den transformierten Social Return on Investment als Wirkungs- und Transformationsmaß.",
      url: "/begriffe/t-sroi/",
      tags: ["Begriff", "Impact Controlling"],
    },
  };
  const QUESTION_QUERY_TERMS = [
    "planwirtschaft",
    "social credit",
    "social-credit",
    "esg",
    "buerokratie",
    "messbarkeit",
    "amtlich",
    "zensur",
    "faktencheck vs folgencheck",
    "bge",
    "geld",
    "finanzierung",
    "teurer",
    "steuerklasse",
    "fehlende daten",
    "wer entscheidet",
  ].map(normalize);
  const DEFAULT_SEARCH_ENTRYPOINTS = [
    {
      title: "Was ist Wirkungsökonomie?",
      description: "Die Grundidee: Wirkung für Mensch, Planet und Demokratie wird entscheidungsrelevant.",
      url: "/wirkungsoekonomie.html",
      section: "Grundlagen",
      type: "Einstieg",
      tags: ["Grundidee", "Wirkung"],
    },
    {
      title: "In 5 Minuten verstehen",
      description: "Der schnelle Pfad von Problem, Idee und Methode bis zu einem konkreten Beispiel.",
      url: "/index.html#in-5-minuten",
      section: "Grundlagen",
      type: "Einstieg",
      tags: ["5 Minuten", "Einstieg"],
    },
    {
      title: "Fragen & Einwände",
      description: "Antworten auf Planwirtschaft, Social Credit, ESG, Bürokratie, Finanzierung und Grenzen der Demos.",
      url: "/fragen/",
      section: "Fragen & Einwände",
      type: "FAQ",
      tags: ["Planwirtschaft", "Social Credit"],
    },
    {
      title: "Begriffe",
      description: "Das Begriffssystem der Wirkungsökonomie mit führenden Begriffen und Anschlussstandards.",
      url: "/begriffe/",
      section: "Begriffe",
      type: "Glossar",
      tags: ["Glossar", "Begriffe"],
    },
    {
      title: "Wirkungsfelder",
      description: "Anwendungsfelder von Produkten und Unternehmen bis Staat, Arbeit, Wohnen, Bildung und Medien.",
      url: "/wirkungsfelder/",
      section: "Wirkungsfelder",
      type: "Übersicht",
      tags: ["Wirkungsfelder"],
    },
    {
      title: "Produktwirkung ausprobieren",
      description: "Modellhaft testen, wie Scorecard, schwächstes Feld, Wirkungssteuer und Preis zusammenwirken.",
      url: "/erleben.html#simulator",
      section: "Werkzeuge",
      type: "Demo",
      tags: ["Produktwirkung", "Demo"],
    },
    {
      title: "Bibliothek",
      description: "Onlinefassungen, Dossiers, Whitepaper, Referenzwerk und Materialien öffnen.",
      url: "/downloads.html",
      section: "Bibliothek",
      type: "Materialien",
      tags: ["Downloads", "Onlinefassung"],
    },
  ];

  if (!form || !(input instanceof HTMLInputElement) || !status || !resultsList) {
    return;
  }

  const state = {
    index: [],
    dictionary: { terms: [], typos: {} },
    associations: {},
    entrypoints: [],
    ready: false,
    loading: null,
    hasSubmittedSearch: false,
    historyTimer: null,
    historyForceNext: false,
    lastHistoryKey: "",
    searchRun: 0,
    resultCache: new Map(),
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

  function getEntrySemanticHaystack(entry) {
    return normalize([
      ...asArray(entry.semanticTerms),
      entry.semanticText,
      ...asArray(entry.tags),
      ...asArray(entry.aliases),
      ...asArray(entry.standards),
      ...asArray(entry.instruments),
    ].join(" ")).slice(0, MAX_HAYSTACK_CHARS);
  }

  function classifyEntry(entry) {
    const url = normalize(entry.url);
    const title = normalize(entry.title);
    const section = normalize(entry.section);
    const type = normalize(entry.type);
    const format = normalize(entry.format);
    const tags = normalize(asArray(entry.tags).join(" "));

    if (url.startsWith("/fragen") || section.includes("fragen") || section.includes("einwaende") || section.includes("einwande")) {
      return "fragen";
    }
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
      section.includes("verstehen") ||
      section.includes("grundlagen")
    ) {
      return "grundlagen";
    }
    return "weitere";
  }

  function normalizeRoute(url) {
    return String(url || "").replace(/#.*$/, "").replace(/\/index\.html$/, "/");
  }

  function canonicalResultRoute(url) {
    return normalizeRoute(url).replace(/^\/wirkungsradar\/detail\//, "/wirkungsradar/live/");
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
    const route = canonicalResultRoute(entry.url);
    const routes = CURATED_QUERY_ROUTES[query] || [];
    const index = routes.indexOf(route);
    return index >= 0 ? 2000 - index * 120 : 0;
  }

  function getGroupLabel(groupId) {
    return SEARCH_GROUPS.find((group) => group.id === groupId)?.label || i18n("Weitere Treffer", "More results");
  }

  function getDisplayBadge(entry, groupId) {
    if (groupId === "fragen") return "Frage";
    if (groupId === "begriffe") return "Begriff";
    if (groupId === "grundlagen") return "Grundlage";
    if (groupId === "wirkungsfelder") return "Wirkungsfeld";
    if (groupId === "werkzeuge") return "Werkzeug";
    if (groupId === "methoden") return entry.type || "Methode";
    if (groupId === "akademie") return "Akademie";
    if (groupId === "downloads") return "Download";
    if (groupId === "journal") return "Journal";
    if (groupId === "beispiele") return "Beispiel";
    return entry.section || entry.type || i18n("Treffer", "Result");
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

  function isQuestionQuery(query, tokens) {
    return QUESTION_QUERY_TERMS.some((term) => query.includes(term) || tokens.includes(term));
  }

  function semanticConceptsForQuery(rawQuery, tokens) {
    const query = normalize(rawQuery);
    const concepts = new Set([query, ...tokens].filter((item) => item.length > 2));

    Object.entries(state.associations || {}).forEach(([key, values]) => {
      const normalizedKey = normalize(key);
      if (query.includes(normalizedKey) || tokens.includes(normalizedKey)) {
        asArray(values).map(normalize).filter((item) => item.length > 2).forEach((item) => concepts.add(item));
      }
    });

    state.dictionary.terms.forEach((term) => {
      const aliases = [term.label, term.key, ...asArray(term.aliases)].map(normalize).filter(Boolean);
      if (aliases.some((alias) => query.includes(alias) || alias.includes(query) || tokens.includes(alias))) {
        aliases.forEach((alias) => concepts.add(alias));
        asArray(term.related).map(normalize).filter((item) => item.length > 2).forEach((item) => concepts.add(item));
      }
    });

    return Array.from(concepts).slice(0, 32);
  }

  function semanticEntryMatches(entry, rawQuery, tokens, concepts = semanticConceptsForQuery(rawQuery, tokens)) {
    const semanticHaystack = entry._semanticHaystack || getEntrySemanticHaystack(entry);
    if (!semanticHaystack) return false;
    return concepts.some((concept) => concept.length > 3 && containsQuery(semanticHaystack, concept));
  }

  function semanticScoreEntry(entry, rawQuery, tokens, concepts = semanticConceptsForQuery(rawQuery, tokens)) {
    const semanticHaystack = entry._semanticHaystack || getEntrySemanticHaystack(entry);
    if (!semanticHaystack) return 0;
    let score = 0;
    concepts.forEach((concept) => {
      if (concept.length < 4) return;
      if (containsQuery(semanticHaystack, concept)) score += concept.includes(" ") ? 22 : 14;
      else if (fuzzyTokenMatch(concept, semanticHaystack)) score += 5;
    });
    if (score > 0 && containsQuery(getEntryKeywordHaystack(entry), normalize(rawQuery))) score += 18;
    return Math.min(score, 130);
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
        const format = normalize(entry.format);
        const tags = normalize(asArray(entry.tags).join(" "));
        const url = normalize(entry.url);
        if (selected === "Seiten") return type.includes("seite");
        if (selected === "Begriff") return classifyEntry(entry) === "begriffe";
        if (selected === "Werkzeug") return classifyEntry(entry) === "werkzeuge" || url.startsWith("/werkzeuge/");
        if (selected === "Wirkungsfeld") return classifyEntry(entry) === "wirkungsfelder";
        if (selected === "Dokument") return classifyEntry(entry) === "downloads" || classifyEntry(entry) === "methoden" || format.includes("paper") || format.includes("download");
        if (selected === "Demo") return url.startsWith("/erleben") || tags.includes("demo") || format.includes("demo");
        if (selected === "Einwand") return classifyEntry(entry) === "fragen" || url.startsWith("/einwaende") || url.startsWith("/fragen");
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

  function entryMatchesQuery(entry, rawQuery, semanticConcepts = null) {
    const query = normalize(rawQuery);
    const queryTokens = getQueryTokens(rawQuery);
    const haystack = entry._haystack || getEntryHaystack(entry);
    const keywordHaystack = entry._keywordHaystack || getEntryKeywordHaystack(entry);

    if (!query) return true;
    if (containsQuery(haystack, query)) return true;
    if (semanticEntryMatches(entry, rawQuery, queryTokens, semanticConcepts || semanticConceptsForQuery(rawQuery, queryTokens))) return true;
    if (queryTokens.length >= 3 && queryTokens.some((token) => /\d/.test(token))) {
      return false;
    }
    if (queryTokens.length <= 1) {
      const token = queryTokens[0] || query;
      return containsToken(haystack, token) || fuzzyTokenMatch(token, keywordHaystack);
    }
    return queryTokens.every((token) => containsToken(haystack, token) || fuzzyTokenMatch(token, keywordHaystack));
  }

  function scoreEntry(entry, rawQuery, tokens, semanticConcepts = null) {
    if (!entryMatchesQuery(entry, rawQuery, semanticConcepts)) {
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
    const route = normalizeRoute(entry.url);
    if (groupId === "fragen" && !isQuestionQuery(query, getQueryTokens(rawQuery))) return 0;
    let score = Number(entry.priority || 0) + Number(GROUP_SCORE_BONUS[groupId] || 0);
    if (isLowValueSearchEntry(entry)) score -= 500;
    score += curatedRouteBoost(entry, rawQuery);
    if (route === "/glossar.html" && asArray(CURATED_QUERY_ROUTES[query]).some((item) => item.startsWith("/begriffe/"))) {
      score -= 1500;
    }

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

    score += semanticScoreEntry(entry, rawQuery, tokens, semanticConcepts || semanticConceptsForQuery(rawQuery, tokens));

    return score;
  }

  function dedupeResults(results) {
    const seen = new Set();
    return results.filter(({ entry }) => {
      const key = canonicalResultRoute(entry.url) || normalize(entry.title);
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
    if (RECOMMENDED_QUERY_ENTRYPOINTS[query]) return RECOMMENDED_QUERY_ENTRYPOINTS[query];
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
    const byUrl = new Map(state.index.map((entry) => [canonicalResultRoute(entry.url), entry]));
    return DEFAULT_SEARCH_ENTRYPOINTS.map((item, index) => {
      const route = canonicalResultRoute(item.url);
      const existing = byUrl.get(route) || byUrl.get(item.url);
      const entry = {
        ...(existing || {}),
        ...item,
        body: item.description,
        priority: 120 - index,
        _group: classifyEntry(item),
      };
      return { entry, score: entry.priority };
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTagList(tags) {
    const list = unique(asArray(tags).map((tag) => String(tag || "").trim()).filter(Boolean)).slice(0, 6);
    if (!list.length) return "";
    return `<ul class="search-tag-list">${list
      .map((tag) => `<li><a href="${searchPageHref}?q=${encodeURIComponent(tag)}" aria-label="${escapeHtml(i18n(`Nach ${tag} suchen`, `Search for ${tag}`))}">${escapeHtml(tag)}</a></li>`)
      .join("")}</ul>`;
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
      <p class="hero-kicker">${i18n("Empfohlener Einstieg", "Recommended starting point")}</p>
      <h2>${escapeHtml(entrypoint.title)}</h2>
      <p>${escapeHtml(entrypoint.description)}</p>
      ${renderTagList(entrypoint.tags)}
      <p><a href="${escapeHtml(entrypoint.url)}">${i18n("Einstieg öffnen", "Open starting point")}</a></p>
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
      <h2>${i18n("Verwandte Themen", "Related topics")}</h2>
      <ul class="search-topic-list">
        ${topics.map((topic) => `<li><a href="${searchPageHref}?q=${encodeURIComponent(topic)}">${escapeHtml(topic)}</a></li>`).join("")}
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
      .map((term) => ({ label: term.label, type: i18n("Begriff", "Term"), q: term.label }));
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
      <p class="hero-kicker">${i18n("Vorschläge", "Suggestions")}</p>
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
          ${renderTagList(tags)}
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
              ${renderTagList(tags)}
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

  function compactSearchResults(results) {
    return (Array.isArray(results) ? results : [])
      .map(({ entry }) => ({
        title: entry.title || "",
        url: entry.url || "",
        type: getDisplayBadge(entry, entry._group || classifyEntry(entry)),
        excerpt: makeSnippet(entry, input.value.trim()) || entry.description || ""
      }))
      .filter((item) => item.title || item.url)
      .slice(0, 12);
  }

  function searchHistoryKey(rawQuery, filters) {
    return `${normalize(rawQuery)}::${JSON.stringify(filters || {})}`;
  }

  function searchResultCacheKey(rawQuery, filters) {
    return searchHistoryKey(rawQuery, filters);
  }

  function readSearchResultCache(key) {
    const cached = state.resultCache.get(key);
    if (!cached) return null;
    state.resultCache.delete(key);
    state.resultCache.set(key, cached);
    return cached;
  }

  function writeSearchResultCache(key, value) {
    state.resultCache.delete(key);
    state.resultCache.set(key, value);
    if (state.resultCache.size <= SEARCH_RESULT_CACHE_LIMIT) return;
    const oldestKey = state.resultCache.keys().next().value;
    if (oldestKey) state.resultCache.delete(oldestKey);
  }

  function recordSearchHistory(rawQuery, finalResults, totalResults) {
    const query = rawQuery.trim();
    const filters = getFiltersFromControls();
    if (normalize(query).length < 2 && !Object.keys(filters).length) return;
    if (!window.WoekUserSpace?.recordSearchQuery) return;
    const key = searchHistoryKey(query, filters);
    if (key === state.lastHistoryKey && !state.historyForceNext) return;
    state.lastHistoryKey = key;
    window.WoekUserSpace.recordSearchQuery({
      query,
      filters,
      result_count: Array.isArray(finalResults) ? finalResults.length : 0,
      total_result_count: Number.isFinite(Number(totalResults)) ? Number(totalResults) : null,
      results: compactSearchResults(finalResults)
    });
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
  }

  function queueSearchHistory(rawQuery, finalResults, totalResults) {
    window.clearTimeout(state.historyTimer);
    const delay = state.historyForceNext ? 0 : 1200;
    const forceWasSet = state.historyForceNext;
    state.historyTimer = window.setTimeout(() => {
      recordSearchHistory(rawQuery, finalResults, totalResults);
      if (forceWasSet) state.historyForceNext = false;
    }, delay);
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
    const semanticConcepts = queryLength >= 2 ? semanticConceptsForQuery(rawQuery, tokens) : [];
    const filtersActive = filterControls.some((control) => control instanceof HTMLSelectElement && control.value);
    const runId = ++state.searchRun;

    if (queryLength < 2 && !filtersActive) {
      emptyState.hidden = false;
      renderFlatResults(getDefaultResults(), "", []);
      renderRecommended(null);
      renderRelated(getDefaultTopics());
      renderSuggestions("", []);
      status.textContent = i18n("Empfohlene Einstiege", "Recommended starting points");
      updateUrl("");
      return;
    }

    emptyState.hidden = true;
    const filters = getFiltersFromControls();
    const cacheKey = searchResultCacheKey(rawQuery, filters);
    const cachedSearch = readSearchResultCache(cacheKey);
    if (cachedSearch) {
      const matchingResults = cachedSearch.matchingResults;
      const totalResults = matchingResults.length;
      const groupedResults = groupResults(matchingResults);
      const finalResults = groupedResults.flatMap((group) => group.results);

      renderRecommended(queryLength >= 2 ? findRecommended(rawQuery) : null);
      renderRelated(queryLength >= 2 ? findRelated(rawQuery, tokens) : []);
      renderSuggestions(rawQuery, tokens);
      renderResults(matchingResults, rawQuery, tokens);

      const label = rawQuery ? i18n(` für „${rawQuery}“`, ` for "${rawQuery}"`) : "";
      const resultWord = finalResults.length === 1 ? i18n("kuratierter Treffer", "curated result") : i18n("kuratierte Treffer", "curated results");
      const groupNote = groupedResults.length ? i18n(` in ${groupedResults.length} Wissensbereichen`, ` in ${groupedResults.length} knowledge areas`) : "";
      const rawNote = totalResults > finalResults.length ? i18n(" aus dem Wissensindex gebündelt", " bundled from the knowledge index") : "";
      status.textContent = `${finalResults.length} ${resultWord}${groupNote}${label}${rawNote}`;
      if (!finalResults.length) {
        resultsList.innerHTML = `<li class="search-result-card"><h2>${i18n("Keine Treffer gefunden", "No results found")}</h2><p>${i18n("Versuche einen einfacheren Begriff, eine Abkürzung oder einen verwandten Einstieg wie Wirkung, Steuer, SDG, Demokratie oder Reporting.", "Try a simpler term, an abbreviation or a related entry point such as impact, tax, SDG, democracy or reporting.")}</p></li>`;
      }
      updateUrl(rawQuery);
      queueSearchHistory(rawQuery, finalResults, totalResults);
      return;
    }

    const filtered = state.index.filter(passesFilters);
    const scored = [];
    let cursor = 0;

    status.textContent = i18n("Suche läuft ...", "Searching ...");

    const finishSearch = () => {
      if (runId !== state.searchRun) return;
      const matchingResults = scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || String(a.entry.title).localeCompare(String(b.entry.title), "de"));
      const totalResults = matchingResults.length;
      const groupedResults = groupResults(matchingResults);
      const finalResults = groupedResults.flatMap((group) => group.results);

      writeSearchResultCache(cacheKey, { matchingResults });
      renderRecommended(queryLength >= 2 ? findRecommended(rawQuery) : null);
      renderRelated(queryLength >= 2 ? findRelated(rawQuery, tokens) : []);
      renderSuggestions(rawQuery, tokens);
      renderResults(matchingResults, rawQuery, tokens);

      const label = rawQuery ? i18n(` für „${rawQuery}“`, ` for "${rawQuery}"`) : "";
      const resultWord = finalResults.length === 1 ? i18n("kuratierter Treffer", "curated result") : i18n("kuratierte Treffer", "curated results");
      const groupNote = groupedResults.length ? i18n(` in ${groupedResults.length} Wissensbereichen`, ` in ${groupedResults.length} knowledge areas`) : "";
      const rawNote = totalResults > finalResults.length ? i18n(" aus dem Wissensindex gebündelt", " bundled from the knowledge index") : "";
      status.textContent = `${finalResults.length} ${resultWord}${groupNote}${label}${rawNote}`;
      if (!finalResults.length) {
        resultsList.innerHTML = `<li class="search-result-card"><h2>${i18n("Keine Treffer gefunden", "No results found")}</h2><p>${i18n("Versuche einen einfacheren Begriff, eine Abkürzung oder einen verwandten Einstieg wie Wirkung, Steuer, SDG, Demokratie oder Reporting.", "Try a simpler term, an abbreviation or a related entry point such as impact, tax, SDG, democracy or reporting.")}</p></li>`;
      }
      updateUrl(rawQuery);
      queueSearchHistory(rawQuery, finalResults, totalResults);
    };

    const processChunk = () => {
      if (runId !== state.searchRun) return;
      const end = Math.min(cursor + MAX_SEARCH_SCAN, filtered.length);
      for (; cursor < end; cursor += 1) {
        const entry = filtered[cursor];
        const score = queryLength >= 2 ? scoreEntry(entry, rawQuery, tokens, semanticConcepts) : Number(entry.priority || 0);
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

  function showInitialResults() {
    emptyState.hidden = false;
    renderFlatResults(getDefaultResults(), "", []);
    renderRecommended(null);
    renderRelated(getDefaultTopics());
    renderSuggestions("", []);
    status.textContent = i18n("Gib einen Suchbegriff ein und starte die Suche.", "Enter a search term and start the search.");
  }

  function requestSearch() {
    state.hasSubmittedSearch = true;
    state.historyForceNext = true;
    if (state.ready) {
      runSearch();
      return;
    }
    status.textContent = i18n("Suchindex wird geladen ...", "Loading search index ...");
    loadSearchData().then(() => {
      if (state.ready) runSearch();
    });
  }

  function handleInput() {
    if (!state.hasSubmittedSearch) return;
    state.searchRun += 1;
    status.textContent = i18n("Eingabe geändert. Drücke Suchen, um die Treffer zu aktualisieren.", "Input changed. Press Search to refresh the results.");
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
    function syncQuickFilters() {
      quickFilterButtons.forEach((button) => {
        const control = filterControls.find((item) => item.dataset.searchFilter === button.dataset.searchQuickFilter);
        button.classList.toggle("active", control instanceof HTMLSelectElement && control.value === button.dataset.searchValue);
      });
    }
    input.addEventListener("input", handleInput);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      requestSearch();
    });
    filterControls.forEach((control) => control.addEventListener("change", () => {
      syncQuickFilters();
      if (state.hasSubmittedSearch) requestSearch();
    }));
    filtersDetails?.addEventListener("toggle", () => {
      const summary = filtersDetails.querySelector("summary");
      if (summary) {
        summary.textContent = filtersDetails.open ? i18n("Erweiterte Filter ausblenden", "Hide advanced filters") : i18n("Erweiterte Filter anzeigen", "Show advanced filters");
      }
    });
    if (filtersDetails instanceof HTMLDetailsElement && filtersDetails.open) {
      const summary = filtersDetails.querySelector("summary");
      if (summary) summary.textContent = i18n("Erweiterte Filter ausblenden", "Hide advanced filters");
    }
    quickFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const field = button.dataset.searchQuickFilter;
        const value = button.dataset.searchValue || "";
        const control = filterControls.find((item) => item.dataset.searchFilter === field);
        if (control instanceof HTMLSelectElement) {
          control.value = control.value === value ? "" : value;
        }
        syncQuickFilters();
        requestSearch();
      });
    });
    resetButton?.addEventListener("click", () => {
      filterControls.forEach((control) => {
        if (control instanceof HTMLSelectElement) {
          control.value = "";
        }
      });
      quickFilterButtons.forEach((button) => button.classList.remove("active"));
      if (state.hasSubmittedSearch) requestSearch();
      else showInitialResults();
    });
    suggestionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.searchSuggestion || "";
        input.focus();
        requestSearch();
      });
    });
    syncQuickFilters();
  }

  async function loadSearchData() {
    if (state.ready) return;
    if (state.loading) return state.loading;
    state.loading = (async () => {
      const [index, dictionary, associations, entrypoints] = await Promise.all([
        fetch(dataUrl("search-index.json"), { cache: "no-store" }).then((response) => response.json()),
        fetch(dataUrl("search-dictionary.json"), { cache: "no-store" }).then((response) => response.json()),
        fetch(dataUrl("search-associations.json"), { cache: "no-store" }).then((response) => response.json()),
        fetch(dataUrl("search-curated-entrypoints.json"), { cache: "no-store" }).then((response) => response.json()),
      ]);
      state.index = index.map((entry) => ({
        ...entry,
        body: String(entry.body || "").slice(0, MAX_HAYSTACK_CHARS),
        _group: classifyEntry(entry),
        _haystack: getEntryHaystack(entry),
        _keywordHaystack: getEntryKeywordHaystack(entry),
        _semanticHaystack: getEntrySemanticHaystack(entry),
      }));
      state.dictionary = dictionary;
      state.associations = associations;
      state.entrypoints = entrypoints;
      state.ready = true;
    })().catch(() => {
      status.textContent = i18n("Die Suche konnte nicht geladen werden.", "Search could not be loaded.");
    }).finally(() => {
      state.loading = null;
    });
    return state.loading;
  }

  applyParams();
  bindEvents();
  const hasQueryInUrl = input.value.trim().length >= 2;
  const hasActiveFilters = filterControls.some((control) => control instanceof HTMLSelectElement && control.value);
  if (hasQueryInUrl || hasActiveFilters) requestSearch();
  else showInitialResults();
})();

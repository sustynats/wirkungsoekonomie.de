(function () {
  const statusLabels = new Map([
    ["live", "Live"],
    ["demo", "Demo"],
    ["methodik", "Methodik"],
    ["arbeitsfassung", "Arbeitsfassung"],
    ["in-vorbereitung", "In Vorbereitung"],
    ["nicht-amtlich", "Nicht amtlich"],
    ["keine-beratung", "Keine Beratung"],
  ]);

  const protectionItems = [
    "Keine Personenbewertung.",
    "Keine automatische Entscheidung.",
    "Datenqualität sichtbar machen.",
    "Rote Linien nicht kompensieren.",
    "Verantwortung bleibt menschlich, institutionell und demokratisch legitimiert.",
  ];

  function normalizeStatus(status) {
    return String(status || "")
      .trim()
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function statusBadge(status, options = {}) {
    const key = normalizeStatus(status);
    const label = options.label || statusLabels.get(key) || String(status || "Status");
    const badge = document.createElement("span");
    badge.className = `status-badge status-badge--${key || "custom"}`;
    badge.title = options.title || `Status: ${label}`;
    badge.textContent = label;
    return badge;
  }

  function protectionNotice(options = {}) {
    const id = options.id || "protection-notice-title";
    const aside = document.createElement("aside");
    aside.className = "protection-notice";
    aside.setAttribute("role", "note");
    aside.setAttribute("aria-labelledby", id);
    const intro =
      options.intro ||
      "Diese Einordnung ist eine modellhafte Orientierung der Wirkungsökonomie. Sie ersetzt keine amtliche Bewertung und keine Beratung.";
    const items = options.items || protectionItems;
    const kicker = document.createElement("p");
    kicker.className = "card-kicker";
    kicker.textContent = "Governance";
    const title = document.createElement("h2");
    title.id = id;
    title.className = "card-title";
    title.textContent = options.title || "Schutzlinien";
    const text = document.createElement("p");
    text.className = "card-text";
    text.textContent = intro;
    const list = document.createElement("ul");
    list.className = "protection-notice-list";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    aside.append(kicker, title, text, list);
    return aside;
  }

  window.WOEKGovernance = {
    normalizeStatus,
    statusBadge,
    protectionNotice,
    statuses: Array.from(statusLabels, ([key, label]) => ({ key, label })),
    protectionItems: [...protectionItems],
  };
})();

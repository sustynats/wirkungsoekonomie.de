(() => {
  "use strict";

  const article = document.getElementById("dossier-content");
  const search = document.getElementById("dossier-search");
  const status = document.getElementById("dossier-search-status");
  const toc = document.getElementById("dossier-toc-list");
  if (!article || !(search instanceof HTMLInputElement) || !status || !toc) return;

  const slug = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "abschnitt";

  const usedIds = new Set();
  article.querySelectorAll(":scope > h2").forEach((heading) => {
    let id = slug(heading.textContent || "Abschnitt");
    let suffix = 2;
    while (usedIds.has(id)) id = `${slug(heading.textContent || "Abschnitt")}-${suffix++}`;
    usedIds.add(id);
    heading.id = id;
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = heading.textContent || "Abschnitt";
    item.append(link);
    toc.append(item);
  });

  const entryHeadings = [...article.querySelectorAll(":scope > h3")]
    .filter((heading) => /^Eintrag\s+\d+$/i.test((heading.textContent || "").trim()));

  entryHeadings.forEach((heading) => {
    const details = document.createElement("details");
    details.className = "dossier-record";
    const summary = document.createElement("summary");
    const body = document.createElement("div");
    body.className = "dossier-record-body";
    heading.before(details);
    details.append(summary, body);

    let next = heading.nextSibling;
    while (next && !(next instanceof HTMLHeadingElement && (next.tagName === "H2" || next.tagName === "H3"))) {
      const following = next.nextSibling;
      body.append(next);
      next = following;
    }

    const descriptiveParagraph = [...body.querySelectorAll("p")].find((paragraph) => {
      const key = paragraph.querySelector("strong")?.textContent || "";
      return /Vorgeschlagene Maßnahme|Originalpassage|Kernaussage|Zu prüfende Zustandsveränderung/i.test(key);
    });
    const description = descriptiveParagraph?.textContent?.replace(/^[^:]+:\s*/, "").trim();
    const shortDescription = description && description.length > 155 ? `${description.slice(0, 152).trim()}…` : description;
    summary.textContent = shortDescription ? `${heading.textContent}: ${shortDescription}` : (heading.textContent || "Prüfeintrag");
    heading.remove();
  });

  const records = [...article.querySelectorAll("details.dossier-record")];
  const updateStatus = (visible, query) => {
    status.textContent = query
      ? `${visible} von ${records.length} Einträgen enthalten den Suchbegriff.`
      : `${records.length} detaillierte Prüfeinträge. Öffne nur die Vertiefung, die du brauchst.`;
  };

  let timer;
  search.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const query = search.value.trim().toLocaleLowerCase("de-DE");
      let visible = 0;
      records.forEach((record) => {
        const matches = !query || (record.textContent || "").toLocaleLowerCase("de-DE").includes(query);
        record.classList.toggle("search-hidden", !matches);
        if (matches) {
          visible += 1;
          if (query) record.open = true;
        }
      });
      updateStatus(visible, query);
    }, 120);
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const open = button.getAttribute("data-action") === "expand";
      records.forEach((record) => {
        if (!record.classList.contains("search-hidden")) record.open = open;
      });
    });
  });

  updateStatus(records.length, "");
})();

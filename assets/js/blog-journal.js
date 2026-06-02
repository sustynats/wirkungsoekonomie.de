(function () {
  const scriptUrl =
    document.currentScript?.src || document.querySelector('script[src*="blog-journal.js"]')?.src || "";
  const dataUrl = scriptUrl
    ? new URL("../data/blog-index.json", scriptUrl).href
    : "/assets/data/blog-index.json";

  const relatedPaths = new Set([
    "/verstehen.html",
    "/modell.html",
    "/ordnung/",
    "/ordnung.html",
    "/ordnung/index.html",
    "/ordnung/demokratische-anschlussfaehigkeit.html",
    "/fuer/politik.html",
    "/fuer/unternehmen.html",
    "/fuer/buergerinnen.html",
    "/fuer/investoren.html",
    "/fuer/mieter.html",
    "/fuer/kommunen.html",
    "/fuer/akademie.html",
    "/fuer/journalismus.html",
    "/fuer/wissenschaft-forschung.html",
    "/fuer/rente.html",
    "/fuer/wirkungseinkommen.html",
    "/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html",
    "/anwendungen/scanner.html",
    "/akademie.html",
    "/evidenz/",
    "/evidenz/index.html"
  ]);

  const homeTarget = document.querySelector("[data-journal-home]");
  const archiveTarget = document.querySelector("[data-journal-list]");
  const currentPath = normalizePath(window.location.pathname);
  const shouldRenderRelated = relatedPaths.has(currentPath);

  if (!homeTarget && !archiveTarget && !shouldRenderRelated) {
    return;
  }

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Blog-Metadaten konnten nicht geladen werden.");
      }
      return response.json();
    })
    .then((posts) => {
      const publishedPosts = posts
        .filter((post) => post.status === "published")
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (homeTarget) {
        renderHomeJournal(homeTarget, publishedPosts);
      }

      if (archiveTarget) {
        renderJournalArchive(archiveTarget, publishedPosts);
      }

      if (shouldRenderRelated) {
        renderRelatedPosts(publishedPosts);
      }
    })
    .catch(() => {
      if (homeTarget) {
        homeTarget.innerHTML =
          '<p class="card-text">Aktuelle Einordnungen findest du im <a class="text-link" href="/blog.html">Journal</a>.</p>';
      }
      if (archiveTarget) {
        archiveTarget.insertAdjacentHTML(
          "afterbegin",
          '<p class="card-text">Die indexbasierte Journalübersicht konnte gerade nicht geladen werden. Die statische Fassung bleibt darunter sichtbar.</p>'
        );
      }
    });

  function normalizePath(pathname) {
    if (!pathname || pathname === "/index.html") {
      return "/";
    }

    if (pathname.endsWith("/index.html")) {
      return pathname.replace(/index\.html$/, "");
    }

    return pathname;
  }

  function renderHomeJournal(target, posts) {
    const latest = posts[0];
    if (!latest) {
      return;
    }

    const secondary = posts.slice(1, 3);

    target.innerHTML = `
      <div class="journal-home-grid">
        ${renderArticleCard(latest, { featured: true })}
        <div class="journal-side-list">
          ${secondary.map((post) => renderArticleCard(post)).join("")}
        </div>
      </div>
      <div class="hero-actions journal-actions">
        <a class="btn btn-secondary" href="/blog.html">Alle Einordnungen ansehen</a>
      </div>
    `;
  }

  function renderJournalArchive(target, posts) {
    if (!posts.length) {
      return;
    }

    target.innerHTML = posts.map((post) => renderJournalArchiveCard(post)).join("");
    document.dispatchEvent(
      new CustomEvent("journal:rendered", {
        detail: {
          target,
          count: posts.length
        }
      })
    );
  }

  function renderRelatedPosts(posts) {
    const related = getRelatedPosts(posts, currentPath, 3);
    const main = document.querySelector("main");
    if (!main || related.length === 0 || main.querySelector("[data-related-posts]")) {
      return;
    }

    const section = document.createElement("section");
    section.className = "section journal-related-section";
    section.setAttribute("aria-labelledby", "related-journal-title");
    section.dataset.noGlossary = "true";
    section.dataset.relatedPosts = "true";
    section.innerHTML = `
      <div>
        <div class="section-header compact">
          <p class="hero-kicker">Journal</p>
          <h2 id="related-journal-title">Passende Einordnungen</h2>
          <p>Diese Beiträge vertiefen die Frage aus aktueller Perspektive.</p>
        </div>
        <div class="journal-related-grid">
          ${related.map((post) => renderArticleCard(post)).join("")}
        </div>
      </div>
    `;

    main.append(section);
  }

  function getRelatedPosts(posts, path, count) {
    return posts
      .filter((post) => post.url !== path)
      .map((post) => ({
        post,
        directMatch: (post.relatedPages || []).some((relatedPath) => normalizePath(relatedPath) === path),
        fallbackScore: fallbackScore(post, path)
      }))
      .filter((entry) => entry.directMatch || entry.fallbackScore > 0)
      .sort((a, b) => {
        if (a.directMatch !== b.directMatch) {
          return a.directMatch ? -1 : 1;
        }
        if (a.fallbackScore !== b.fallbackScore) {
          return b.fallbackScore - a.fallbackScore;
        }
        if (a.post.featured !== b.post.featured) {
          return a.post.featured ? -1 : 1;
        }
        return new Date(b.post.date) - new Date(a.post.date);
      })
      .slice(0, count)
      .map((entry) => entry.post);
  }

  function fallbackScore(post, path) {
    const pathTokens = path
      .toLowerCase()
      .replace(/\.html$/, "")
      .split(/[/-]+/)
      .filter(Boolean);
    const terms = [...(post.tags || []), ...(post.relatedTerms || [])].map((term) => term.toLowerCase());
    return pathTokens.reduce((score, token) => {
      return terms.some((term) => term.includes(token) || token.includes(term)) ? score + 1 : score;
    }, 0);
  }

  function renderArticleCard(post, { featured = false } = {}) {
    const tagChips = (post.tags || [])
      .slice(0, 3)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join("");
    const cardClass = featured ? "journal-card journal-feature-card" : "journal-card";
    const titleLevel = featured ? "h3" : "h3";

    return `
      <article class="${cardClass}">
        <p class="journal-meta">
          <span>${escapeHtml(post.category)}</span>
          <span aria-hidden="true">·</span>
          <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>${escapeHtml(post.readingTime)}</span>
        </p>
        <${titleLevel} class="card-title">${escapeHtml(post.title)}</${titleLevel}>
        <p class="card-text">${escapeHtml(post.excerpt)}</p>
        ${tagChips ? `<div class="journal-chip-list" aria-label="Themen">${tagChips}</div>` : ""}
        <a class="text-link" href="${escapeHtml(post.url)}">${featured ? "Artikel lesen" : "Lesen"}</a>
      </article>
    `;
  }

  function renderJournalArchiveCard(post) {
    const tags = (post.tags || []).slice(0, 6);
    const tagSlugs = tags.map(slugify).filter(Boolean);
    const categorySlug = canonicalCategorySlug(post, tagSlugs);
    const dataTags = Array.from(
      new Set([categorySlug, slugify(post.category), ...tagSlugs, ...(post.relatedTerms || []).map(slugify)])
    )
      .filter(Boolean)
      .join(" ");
    const badges = normalizeBadges(post);
    const origin = post.url?.includes("/linkedin/") ? "linkedin" : "redaktion";
    const cardClass = origin === "linkedin" ? "blog-card linkedin-archive-card" : "blog-card";
    const image = normalizeImagePath(post.image);

    return `
      <article class="${cardClass}" data-origin="${escapeHtml(origin)}" data-category="${escapeHtml(categorySlug)}" data-tags="${escapeHtml(dataTags)}">
        ${image ? `<div class="blog-image"><img src="${escapeHtml(image)}" alt="${escapeHtml(post.imageAlt || post.title)}" decoding="async" loading="lazy"></div>` : ""}
        <div class="blog-badge-row">${badges.map((badge) => `<span class="blog-origin-badge">${escapeHtml(badge)}</span>`).join("")}</div>
        <p class="card-kicker"><a class="category-link" href="#thema-${escapeHtml(categorySlug)}" data-blog-filter="${escapeHtml(categorySlug)}">${escapeHtml(post.category || "Journal")}</a> · <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>${post.readingTime ? ` · ${escapeHtml(post.readingTime)}` : ""}</p>
        <h3 class="card-title">${escapeHtml(post.title)}</h3>
        <p class="card-text">${escapeHtml(post.excerpt || "")}</p>
        <a class="text-link" href="${escapeHtml(post.url)}">Beitrag lesen</a>
        ${tags.length ? `<div class="tag-list" aria-label="Schlagworte">${tags.map((tag) => `<a href="#tag-${escapeHtml(slugify(tag))}" data-blog-tag="${escapeHtml(slugify(tag))}">${escapeHtml(tag)}</a>`).join("")}</div>` : ""}
      </article>
    `;
  }

  function normalizeBadges(post) {
    const type = post.type === "Journalartikel" ? "Journalartikel" : post.type || "Journalartikel";
    return Array.from(new Set([type, post.featured ? "Leitartikel" : "", post.category].filter(Boolean)));
  }

  function canonicalCategorySlug(post, tagSlugs) {
    const raw = slugify(post.category);
    const terms = new Set([raw, ...tagSlugs]);
    if (terms.has("bildung") || raw.includes("bildung")) return "bildung";
    if (terms.has("politik") || raw.includes("politik")) return "politik";
    if (terms.has("wirtschaft") || terms.has("unternehmen") || raw.includes("wirtschaft")) return "wirtschaft";
    if (terms.has("demokratie") || raw.includes("demokratie")) return "demokratie";
    if (terms.has("medien") || raw.includes("medien")) return "medien";
    if (terms.has("ki") || terms.has("digitalisierung") || raw.includes("ki") || raw.includes("digitalisierung")) return "ki-und-digitalisierung";
    if (terms.has("preise") || terms.has("steuern") || raw.includes("preise")) return "produkte-und-preise";
    if (terms.has("wohnen") || raw.includes("wohnen")) return "wohnen";
    if (terms.has("arbeit") || raw.includes("arbeit")) return "arbeit-und-soziales";
    if (terms.has("energie") || terms.has("klima") || raw.includes("energie") || raw.includes("klima")) return "energie-und-klima";
    if (terms.has("europa") || terms.has("geopolitik") || raw.includes("europa")) return "europa-und-welt";
    return raw || "grundsatz";
  }

  function normalizeImagePath(value) {
    if (!value) return "";
    return String(value).replace(/^https?:\/\/wirkungsoekonomie\.de\//, "/").replace(/^\//, "");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();

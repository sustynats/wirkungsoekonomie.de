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
  const currentPath = normalizePath(window.location.pathname);
  const shouldRenderRelated = relatedPaths.has(currentPath);

  if (!homeTarget && !shouldRenderRelated) {
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

      if (shouldRenderRelated) {
        renderRelatedPosts(publishedPosts);
      }
    })
    .catch(() => {
      if (homeTarget) {
        homeTarget.innerHTML =
          '<p class="card-text">Aktuelle Einordnungen findest du im <a class="text-link" href="/blog.html">Journal</a>.</p>';
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

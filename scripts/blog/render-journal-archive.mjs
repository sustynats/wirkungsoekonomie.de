// Static counterpart of the browser archive; parity is checked in journal-freshness.test.mjs.
export function renderJournalArchiveCard(post) {
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
    const path = String(value).replace(/^https?:\/\/wirkungsoekonomie\.de\//, "/");
    if (/^https?:\/\//.test(path) || path.startsWith("/")) {
      return path;
    }
    return `/${path.replace(/^\/+/, "")}`;
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
    const value = String(dateString || "");
    const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
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

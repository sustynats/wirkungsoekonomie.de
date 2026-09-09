const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));

// Explicit links are resolved in both directions without rewriting a historical
// article's text, assessment, publication date or version.
export function relatedEditorialAnalyses(analysis, published) {
  return published.filter(other => other.status === "published" && other.slug !== analysis.slug
    && ((analysis.related_analysis_slugs || []).includes(other.slug)
      || (other.related_analysis_slugs || []).includes(analysis.slug)));
}

export function renderRelatedEditorialAnalyses(related) {
  if (!related.length) return "";
  return `<aside class="news-editorial-origin news-editorial-related" aria-label="Weiterführende Analysen"><strong>Zusammenhänge vertiefen</strong>${related.map(other => `<a class="text-link" href="/wirkungsticker/analyse/${escape(other.slug)}/">${escape(other.title)}</a>`).join("")}</aside>`;
}

export function renderEditorialParagraphs(section, sources) {
  const refs = new Map((section.paragraph_refs || []).map(ref => [ref.index, ref.source_ids]));
  const numbers = new Map([...sources.keys()].map((id, index) => [id, index + 1]));
  return section.paragraphs.map((paragraph, index) => {
    const citations = (refs.get(index) || []).map(id => sources.get(id)).filter(Boolean).map(source => `<a class="news-inline-citation" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer" aria-label="Quelle ${numbers.get(source.source_id)}: ${escape(source.publisher)} - ${escape(source.title)}">[${numbers.get(source.source_id)}]</a>`).join(" ");
    return `<p${section.callout_indices?.includes(index) ? ' class="news-editorial-paragraph-callout"' : ""}>${escape(paragraph)}${citations ? ` <span class="news-inline-citations">${citations}</span>` : ""}</p>`;
  }).join("");
}

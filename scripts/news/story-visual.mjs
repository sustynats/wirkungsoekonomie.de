import { publicTitleImage } from "./title-image/pipeline.mjs";
import { renderDimensionMeters, renderStatusChip, renderAnalysisTypeChip } from "./visuals.mjs";

const escape = (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Responsive HTML composition reuses the already generated original. No image
// editing, rasterized headline, new provider call or hidden duplicate heading.
export function renderStoryVisual(story, { href = "", detail = false, loading = "lazy", sourceLabel = "" } = {}) {
  const image = publicTitleImage(story.title_image);
  if (!image?.wide) return "";
  const heading = detail ? "h1" : "h2";
  const label = image.background ? "KI-generiertes Symbolbild" : "Wirkungskarte · WÖk-Einordnung";
  return `<div class="news-story-visual" data-news-story-visual>
    <figure class="news-story-visual__frame">
      ${image.background ? `<img class="news-story-visual__background" src="${escape(image.background.url)}" alt="" width="1200" height="675" loading="${loading}" decoding="async">` : ""}
      <p class="news-story-visual__brand" aria-hidden="true">Wirkungsökonomie <span>· Wirkungsticker</span></p>
      <div class="news-story-visual__content">
        <${heading} class="news-story-visual__headline">${href ? `<a href="${escape(href)}">${escape(story.title)}</a>` : escape(story.title)}</${heading}>
        <div class="news-story-visual__panel"><p class="news-story-visual__kicker">Relevanz für</p>${renderDimensionMeters(story.analysis, { compact: true })}<div class="news-story-visual__chips">${renderStatusChip(story.analysis.status)}${renderAnalysisTypeChip(story.analysis.analysis_type, { note: false })}</div></div>
      </div>
      <figcaption class="news-story-visual__caption"><span>${escape(sourceLabel)}</span><span>${escape(label)}</span><span class="sr-only">Darstellung, kein Beleg des Ereignisses. Balken zeigen Relevanz, nicht positive oder negative Wirkung.</span></figcaption>
    </figure>
  </div>`;
}

export function renderEditorialClaimMap(analysis) {
  const ledger = (analysis.claim_ledger || []).filter(claim => claim.claim && claim.claim.length <= 360);
  const groups = [
    { label: "Quellenstand", types: ["fact", "observation"] },
    { label: "Mögliches Potenzial", types: ["impact_potential"] },
    { label: "Mögliches Risiko", types: ["impact_risk"] },
  ].map(group => ({ ...group, claim: ledger.find(claim => group.types.includes(claim.type)
    && (group.label !== "Quellenstand" || claim.source_ids?.length)) })).filter(group => group.claim);
  if (groups.length < 2) return "";
  const sources = new Map((analysis.source_snapshot || []).map(source => [source.source_id, source]));
  return `<figure class="news-editorial-claim-map"><figcaption><strong>Die Einordnung auf einen Blick</strong><p>Quellenstand, Potenzial und Risiko sind unterschiedliche Aussagen – kein automatischer Ursache-Wirkungs-Nachweis.</p></figcaption><dl>${groups.map(group => {
    const source = (group.claim.source_ids || []).map(id => sources.get(id)).find(Boolean);
    return `<div><dt>${group.label}</dt><dd><p>${escape(group.claim.claim)}</p>${source ? `<a class="text-link" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)}</a>` : '<small>Analytische Einordnung; keine belegte Zustandsveränderung.</small>'}</dd></div>`;
  }).join("")}</dl></figure>`;
}

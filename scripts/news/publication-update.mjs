import { hasEditorialResidue } from "./reader-copy.mjs";

// Presentation-only receipts. A fetch, queue attempt, regrouping or image
// rebuild is not a new public content version and must not refresh the banner.
const time = value => typeof value === "string" ? Date.parse(value) : NaN;

export function publishedContentRevision(story) {
  if (!story?.published || story.listed === false) return null;
  const first = time(story.published_at);
  if (!Number.isFinite(first)) return null;
  const current = Number(story.current_version || 1);
  const valid = (version, at) => Number.isSafeInteger(current) && current >= 1
    && Number(version) === current && Number.isFinite(time(at)) && time(at) >= first;
  const receipt = (story.publication_history || []).filter(entry => valid(entry.version, entry.published_at))
    .sort((a, b) => time(b.published_at) - time(a.published_at))[0];
  const snapshot = (story.versions || []).filter(entry => valid(entry.version, entry.analyzed_at))
    .sort((a, b) => time(b.analyzed_at) - time(a.analyzed_at))[0];
  const at = receipt?.published_at || snapshot?.analyzed_at || story.published_at;
  const version = receipt || snapshot ? current : 1;
  return { at: new Date(at).toISOString(), is_update: version > 1 && time(at) > first };
}

export function caseContentUpdatedAt(members) {
  const unique = [...new Map(members.filter(story => story.story_id).map(story => [story.story_id, story])).values()];
  const published = unique.map(story => ({ first: time(story.published_at), revision: publishedContentRevision(story) })).filter(item => item.revision);
  if (published.length < 2) return null;
  const first = Math.min(...published.map(item => item.first));
  const latest = Math.max(...published.map(item => time(item.revision.at)));
  return latest > first ? new Date(latest).toISOString() : null;
}

export function storyUpdateNotice(story, caseFile = story?.case_file) {
  const revision = publishedContentRevision(story);
  if (!revision) return null;
  if (caseFile && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(caseFile.representative_slug || "") && Number.isFinite(time(caseFile.content_updated_at))) {
    return { at: new Date(caseFile.content_updated_at).toISOString(), scope: "case", slug: caseFile.representative_slug };
  }
  return revision.is_update ? { at: revision.at, scope: "story", slug: story.slug } : null;
}

const normalized = value => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
// Only already published reader copy is eligible. Never surface queue notes,
// model reasons, raw source text or internal review metadata as an update.
const readerText = value => typeof value === "string" && value.trim() && !hasEditorialResidue(value) ? value.trim() : "";
const paragraph = (value, previous = "") => {
  const old = new Set(String(previous).split(/\n\s*\n/).map(normalized));
  return String(value).split(/\n\s*\n/).find(part => readerText(part) && !old.has(normalized(part)))?.trim() || "";
};

export function storyUpdateDetails(story) {
  const revision = publishedContentRevision(story);
  if (!revision?.is_update) return null;
  const current = Number(story.current_version);
  const previous = (story.versions || []).filter(item => Number.isSafeInteger(Number(item.version))
    && Number(item.version) >= 1 && Number(item.version) < current
    && Number.isFinite(time(item.analyzed_at)) && time(item.analyzed_at) <= time(revision.at))
    .sort((a, b) => Number(b.version) - Number(a.version))[0];
  const base = { at: revision.at, title: readerText(story.title), slug: story.slug };
  const currentSummary = readerText(story.analysis?.summary) || paragraph(story.source_summary);
  if (!previous) return currentSummary ? { ...base, kind: "current", label: "Aktualisierter Stand", text: currentSummary, previous: null } : null;
  const previousReceipt = (story.publication_history || []).find(item => Number(item.version) === Number(previous.version)
    && Number.isFinite(time(item.published_at)) && time(item.published_at) <= time(revision.at));
  const prior = value => readerText(value) ? { text: value.trim(), at: previousReceipt?.published_at || previous.analyzed_at, version: Number(previous.version) } : null;
  const changed = (now, before) => readerText(now) && normalized(now) !== normalized(before);
  if ((typeof previous.source_summary === "string" && changed(story.source_summary, previous.source_summary))
    || (typeof previous.analysis?.summary === "string" && changed(story.analysis?.summary, previous.analysis.summary))) {
    const summaryChanged = typeof previous.analysis?.summary === "string" && changed(story.analysis?.summary, previous.analysis.summary);
    const newParagraph = paragraph(story.source_summary, previous.source_summary);
    return { ...base, kind: "news", label: summaryChanged || newParagraph ? "Das ist neu in dieser Fassung" : "Meldung überarbeitet",
      text: summaryChanged ? readerText(story.analysis.summary) : newParagraph || currentSummary,
      previous: prior(summaryChanged ? previous.analysis?.summary : paragraph(previous.source_summary, story.source_summary)) };
  }
  const currentSnapshot = (story.versions || []).find(item => Number(item.version) === current);
  if (changed(story.title, currentSnapshot?.previous_title) && readerText(currentSnapshot?.previous_title)) {
    return { ...base, kind: "title", label: "Überschrift präzisiert", text: story.title, previous: prior(currentSnapshot.previous_title) };
  }
  for (const [key, label] of [["detail_summary", "Einordnung aktualisiert"], ["why_relevant", "Relevanz neu eingeordnet"],
    ["attribution", "Quellenlage neu eingeordnet"], ["resilience", "Resilienzcheck aktualisiert"]]) {
    if (changed(story.analysis?.[key], previous.analysis?.[key])) return { ...base, kind: "analysis", label,
      text: paragraph(story.analysis[key], previous.analysis?.[key]), previous: prior(paragraph(previous.analysis?.[key] || "", story.analysis[key])) };
  }
  const media = story.analysis?.media_impact;
  if (media?.relevant && changed(media.public_explanation, previous.analysis?.media_impact?.public_explanation)) {
    return { ...base, kind: "media", label: previous.analysis?.media_impact?.relevant ? "Medien- und Diskurscheck aktualisiert" : "Medien- und Diskurscheck ergänzt",
      text: readerText(media.public_explanation), previous: prior(previous.analysis?.media_impact?.public_explanation) };
  }
  for (const [key, label] of [["first_order", "Direkte Folgen neu eingeordnet"], ["second_order", "Nachgelagerte Folgen neu eingeordnet"],
    ["third_order", "Systemische Folgen neu eingeordnet"], ["uncertainties", "Offene Fragen aktualisiert"], ["watch_next", "Beobachtungspunkte ergänzt"]]) {
    const currentItems = Array.isArray(story.analysis?.[key]) ? story.analysis[key] : [];
    const oldItems = Array.isArray(previous.analysis?.[key]) ? previous.analysis[key] : [];
    const text = currentItems.find(value => readerText(value) && !oldItems.some(old => normalized(old) === normalized(value)));
    if (text) return { ...base, kind: "analysis", label, text, previous: null };
  }
  // Technical bookkeeping alone has no reader-facing content delta.
  return null;
}

export function caseUpdateDetails(members) {
  const at = caseContentUpdatedAt(members);
  if (!at) return [];
  return [...new Map(members.map(story => [story.story_id, story])).values()]
    .filter(story => publishedContentRevision(story)?.at === at)
    .sort((a, b) => a.story_id.localeCompare(b.story_id))
    .map(story => {
      const details = storyUpdateDetails(story);
      if (details) return details;
      if (publishedContentRevision(story)?.is_update) return null;
      const text = readerText(story.analysis?.summary) || paragraph(story.source_summary);
      return text ? { at, slug: story.slug, title: readerText(story.title), kind: "development", label: "Neue Entwicklung in der Lageakte", text, previous: null } : null;
    }).filter(Boolean);
}

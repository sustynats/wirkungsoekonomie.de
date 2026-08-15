const STATUS_LABELS = new Map([
  ["live", "Live"],
  ["demo", "Demo"],
  ["methodik", "Methodik"],
  ["arbeitsfassung", "Arbeitsfassung"],
  ["in-vorbereitung", "In Vorbereitung"],
  ["nicht-amtlich", "Nicht amtlich"],
  ["keine-beratung", "Keine Beratung"],
]);

const PROTECTION_ITEMS = [
  "Keine Personenbewertung.",
  "Keine automatische Entscheidung.",
  "Datenqualität sichtbar machen.",
  "Rote Linien nicht kompensieren.",
  "Verantwortung bleibt menschlich, institutionell und demokratisch legitimiert.",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StatusBadge(status, options = {}) {
  const key = normalizeStatus(status);
  const label = options.label || STATUS_LABELS.get(key) || String(status || "Status");
  const title = options.title || `Status: ${label}`;
  return `<span class="status-badge status-badge--${escapeHtml(key || "custom")}" title="${escapeHtml(title)}">${escapeHtml(label)}</span>`;
}

export function StatusBadgeGroup(statuses = []) {
  const items = Array.isArray(statuses) ? statuses : [statuses];
  const badges = items.filter(Boolean).map((status) => StatusBadge(status)).join("");
  return `<div class="status-badge-group" aria-label="Seitenstatus">${badges}</div>`;
}

export function ProtectionNotice(options = {}) {
  const title = options.title || "Schutzlinien";
  const intro =
    options.intro ||
    "Diese Einordnung ist eine modellhafte Orientierung der Wirkungsökonomie. Sie ersetzt keine amtliche Bewertung und keine Beratung.";
  const items = options.items || PROTECTION_ITEMS;
  return `<aside class="protection-notice" role="note" aria-labelledby="${escapeHtml(options.id || "protection-notice-title")}">
  <p class="card-kicker">Governance</p>
  <h2 id="${escapeHtml(options.id || "protection-notice-title")}" class="card-title">${escapeHtml(title)}</h2>
  <p class="card-text">${escapeHtml(intro)}</p>
  <ul class="protection-notice-list">
    ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n    ")}
  </ul>
</aside>`;
}

export const WOEK_GOVERNANCE_STATUSES = [...STATUS_LABELS.entries()].map(([key, label]) => ({
  key,
  label,
}));
export const WOEK_PROTECTION_ITEMS = [...PROTECTION_ITEMS];

export const WOECK_GOVERNANCE_STATUSES = WOEK_GOVERNANCE_STATUSES;
export const WOECK_PROTECTION_ITEMS = WOEK_PROTECTION_ITEMS;

const DEFAULT_COPY = {
  default: {
    kicker: "Fehlt ein Narrativ?",
    headline: "Hast du eine Aussage gesehen, die geprüft werden sollte?",
    text: "Hast du eine Aussage, ein Narrativ, einen Frame oder eine Behauptung gesehen, die Wirkung entfaltet? Reiche sie ein. Nicht jede Einreichung wird veröffentlicht. Wir prüfen zuerst, ob eine Veröffentlichung zur Aufklärung beiträgt oder das Narrativ unnötig verstärken würde.",
  },
  compact: {
    kicker: "Hast du ein ähnliches Narrativ gesehen?",
    headline: "Reiche eine Aussage zur Prüfung ein.",
    text: "Wenn eine Aussage Wirkung entfaltet, prüfen wir Faktenkern, Wirkpfad, Verbreitung, Schaden und Aufklärungsnutzen. Nichts wird automatisch veröffentlicht.",
  },
  noResults: {
    kicker: "Nichts gefunden?",
    headline: "Soll dieses Narrativ in den Debatten-Kompass aufgenommen werden?",
    text: "Wenn du eine Aussage, einen Frame oder ein Debattenmuster gesucht hast, reiche es ein. Wir prüfen, ob daraus eine neue Einordnung entstehen sollte.",
  },
  method: {
    kicker: "Hast du ein Debattenmuster entdeckt?",
    headline: "Schlage eine Aussage für den Folgencheck vor.",
    text: "Der Debatten-Kompass sammelt wirkungsrelevante Aussagen, Frames und Behauptungen. Geprüft wird nicht nur Wahrheit, sondern der Wirkpfad für Mensch, Planet und Demokratie.",
  },
  playbook: {
    kicker: "Fehlt eine Aussage aus deiner Debatte?",
    headline: "Hast du eine Aussage gesehen, die geprüft werden sollte?",
    text: "Hast du eine Aussage, ein Narrativ, einen Frame oder eine Behauptung gesehen, die Wirkung entfaltet? Reiche sie ein. Nicht jede Einreichung wird veröffentlicht. Wir prüfen zuerst, ob eine Veröffentlichung zur Aufklärung beiträgt oder das Narrativ unnötig verstärken würde.",
  },
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function communitySubmissionBlock({
  variant = "default",
  formHref = "narrativ-einreichen/",
  processHref = "pruefprozess/",
  methodHref = "methode/",
  compassHref = "./",
  includeProcessLink = true,
} = {}) {
  const copy = DEFAULT_COPY[variant] || DEFAULT_COPY.default;
  const modifier = variant === "default" ? "" : ` community-submission-section--${variant}`;
  const secondary = includeProcessLink
    ? `<a class="btn btn-secondary" href="${escapeHtml(processHref)}">Prüfprozess verstehen</a>`
    : "";
  return `<section class="section community-submission-section${modifier}" data-community-submission-block data-community-submission-variant="${escapeHtml(variant)}" data-search-exclude>
  <div>
    <article class="card community-submission-block">
      <div class="community-submission-copy">
        <p class="card-kicker">${escapeHtml(copy.kicker)}</p>
        <h2>${escapeHtml(copy.headline)}</h2>
        <p>${escapeHtml(copy.text)}</p>
        <ul class="community-submission-rules">
          <li>Aussagen haben Wirkungspotenzial, aber sind nicht automatisch eingetretene Wirkung.</li>
          <li>Geprüft wird Faktenkern, Wirkpfad, Verbreitung, Schaden und Aufklärungsnutzen.</li>
          <li>Bewertet wird nach Mensch, Planet und Demokratie, ohne problematische Frames unnötig zu verstärken.</li>
        </ul>
      </div>
      <div class="community-submission-actions">
        <a class="btn btn-primary" href="${escapeHtml(formHref)}">Narrativ einreichen</a>
        ${secondary}
        <a class="text-link" href="${escapeHtml(methodHref)}">Methode ansehen</a>
        <a class="text-link" href="${escapeHtml(compassHref)}">Debatten-Kompass öffnen</a>
      </div>
    </article>
  </div>
</section>`;
}

export function communitySubmissionNoResults({ formHref = "narrativ-einreichen/", processHref = "pruefprozess/" } = {}) {
  return communitySubmissionBlock({
    variant: "noResults",
    formHref,
    processHref,
    includeProcessLink: true,
  });
}

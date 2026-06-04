function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function copy(value) {
  return esc(value).replace(/'/g, "&#039;");
}

function chips(items = []) {
  return `<div class="chip-row">${items.map((item) => `<span class="chip">${esc(item)}</span>`).join("")}</div>`;
}

export function ShortJudgementCard({ text }) {
  return `<article class="v2-cockpit-card v2-card-strong"><p class="v2-badge">Kurzurteil</p><h3>${esc(text)}</h3></article>`;
}

export function SayThisNowCard({ text }) {
  return `<article class="v2-cockpit-card"><p class="v2-badge">Sag das jetzt</p><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(text)}'>Antwort kopieren</button></article>`;
}

export function PositiveExampleCard({ example }) {
  return `<article class="v2-cockpit-card"><p class="v2-badge">Ein gutes Bild</p><h3>${esc(example.title)}</h3><p>${esc(example.text)}</p>${chips(example.whatGetsBetter)}<p><strong>Host-Satz:</strong> ${esc(example.hostLine)}</p><button class="copy-chip" type="button" data-copy-text='${copy(example.hostLine)}'>Bild kopieren</button></article>`;
}

export function BetterQuestionCard({ question }) {
  return `<article class="v2-cockpit-card"><p class="v2-badge">Die bessere Frage</p><p>${esc(question)}</p><button class="copy-chip" type="button" data-copy-text='${copy(question)}'>Frage kopieren</button></article>`;
}

export function FrameShiftCard({ frameShift }) {
  return `<div class="v2-frame-card" id="frame-nicht-uebernehmen"><p class="v2-badge">Frame nicht übernehmen</p><div><strong>Alter Frame:</strong> ${esc(frameShift.oldFrame)}</div><div><strong>Warum problematisch:</strong> ${esc(frameShift.whyProblematic)}</div><div><strong>Nicht so antworten:</strong> ${esc((frameShift.doNotAnswer || []).join(" "))}</div><div><strong>Besser so:</strong> ${esc(frameShift.betterAnswer)}</div><div><strong>Warum besser:</strong> ${esc(frameShift.whyBetter)}</div></div>`;
}

export function ImpactFan({ impactFan }) {
  return `<section class="section v2-impact-fan" id="was-wird-mitgezaehlt" data-v2-impact-fan><div><div class="section-header"><p class="hero-kicker">Was wird mitgezählt?</p><h2>Die ganze Rechnung öffnen.</h2></div><div class="v2-impact-grid">${impactFan.dimensions.slice(0, 10).map((item) => `<article class="v2-impact-card"><p class="v2-badge">${esc(item.icon || "Wirkung")}</p><h3>${esc(item.label)}</h3><p>${esc(item.sentence)}</p>${item.example ? `<small>${esc(item.example)}</small>` : ""}</article>`).join("")}</div></div></section>`;
}

export function PsychologyLiteCard({ psychologyLite }) {
  return `<section class="section v2-psychology-lite" id="warum-der-satz-zieht"><div><div class="section-header"><p class="hero-kicker">Warum der Satz zieht</p><h2>Einfacher psychologischer Check.</h2></div><div class="card-grid three">${psychologyLite.items.slice(0, 3).map((item) => `<article class="card"><p class="v2-badge">${esc(item.technical || "Effekt")}</p><h3 class="card-title">${esc(item.simple)}</h3><p class="card-text">${esc(item.debateEffect)}</p><p class="card-text"><strong>So kommst du raus:</strong> ${esc(item.howToBypass)}</p></article>`).join("")}</div></div></section>`;
}

export function ConsequenceStack({ consequenceStack }) {
  const items = [consequenceStack.order1, consequenceStack.order2, consequenceStack.order3];
  return `<section class="section section-soft v2-consequence-stack" id="was-passiert-danach"><div><div class="section-header"><p class="hero-kicker">Was passiert, wenn man danach handelt?</p><h2>Folgen in drei Stufen.</h2></div><div class="card-grid three">${items.map((item) => `<article class="card"><p class="v2-badge">${esc(item.label)}</p><p class="card-text">${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
}

export function SolutionCard({ solution }) {
  return `<section class="section" id="was-macht-es-besser"><div><div class="section-header"><p class="hero-kicker">Was macht es besser?</p><h2>${esc(solution.plainLanguage)}</h2></div><div class="card-grid">${solution.measures.map((item) => `<article class="card"><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
}

export function SourceDrawer({ sources }) {
  return `<details class="v2-source-drawer"><summary>Quellen anzeigen</summary><div class="v2-source-grid">${sources.map((source) => `<a href="${esc(source.url)}"><strong>${esc(source.label)}</strong><span>Belegt: ${esc(source.useFor.join(", "))}</span>${source.warning ? `<span>Grenze: ${esc(source.warning)}</span>` : ""}</a>`).join("")}</div></details>`;
}

export function TrustBlock({ trustBlock, sources }) {
  return `<section class="section v2-trust-block" id="warum-belastbar"><div class="card"><p class="hero-kicker">Warum diese Einordnung belastbar ist</p><div class="v2-trust-grid"><div><strong>Datenstand</strong><span>${esc(trustBlock.dataStand)}</span></div><div><strong>Sicher</strong><span>${esc(trustBlock.sicher.join(" "))}</span></div><div><strong>Unsicher</strong><span>${esc(trustBlock.unsicherOderPruefpflichtig.join(" "))}</span></div><div><strong>Bilanzgrenze</strong><span>${esc(trustBlock.bilanzgrenze)}</span></div></div>${SourceDrawer({ sources })}</div></section>`;
}

export function LinkHub({ internalLinks = {} }) {
  const linkLabel = (href) => href.replace(/\/$/, "").split("/").pop()?.replace(/-/g, " ") || href;
  const groups = [
    ["Glossar", internalLinks.glossary || []],
    ["Narrative", internalLinks.narratives || []],
    ["Ähnliche Live-Karten", internalLinks.relatedDossiers || []],
    ["WÖk-Lösungsbausteine", internalLinks.woek || []],
  ];
  return `<section class="section" id="linkhub"><div><div class="section-header"><p class="hero-kicker">Weiter prüfen</p><h2>Links in die Tiefe.</h2></div><div class="card-grid four">${groups.map(([label, links]) => `<article class="card"><p class="card-kicker">${esc(label)}</p>${links.length ? links.map((href) => `<p><a class="text-link" href="${esc(href)}">${esc(linkLabel(href))}</a></p>`).join("") : `<p class="card-text">Noch nicht verknüpft.</p>`}</article>`).join("")}</div></div></section>`;
}

export function HostCockpitV2({ dossier }) {
  return `<section class="section v2-host-cockpit" id="host-cockpit" data-v2-host-cockpit><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Host-Cockpit</p><h2>Was wurde gesagt?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(dossier.claim)}</strong></p></div><div class="v2-cockpit-grid">${ShortJudgementCard({ text: dossier.cockpit.shortJudgement })}${SayThisNowCard({ text: dossier.cockpit.sayThisNow })}${PositiveExampleCard({ example: dossier.cockpit.positiveExample })}${BetterQuestionCard({ question: dossier.cockpit.betterQuestion })}</div>${FrameShiftCard({ frameShift: dossier.cockpit.frameShift })}</div></section>`;
}

export function renderDossierV2Sections(dossier) {
  return [
    HostCockpitV2({ dossier }),
    ImpactFan({ impactFan: dossier.impactFan }),
    PsychologyLiteCard({ psychologyLite: dossier.psychologyLite }),
    ConsequenceStack({ consequenceStack: dossier.consequenceStack }),
    SolutionCard({ solution: dossier.solution }),
    TrustBlock({ trustBlock: dossier.trustBlock, sources: dossier.sources }),
    LinkHub({ internalLinks: dossier.internalLinks }),
  ].join("\n");
}

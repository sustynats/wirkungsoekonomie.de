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

function uniqueSentences(...parts) {
  const seen = new Set();
  return parts
    .flatMap((part) => String(part ?? "").split(/(?<=[.!?])\s+/))
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");
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

export function V3PageNav() {
  const items = [
    ["Klartext", "#host-cockpit"],
    ["Antworten", "#host-antworten"],
    ["Fakten", "#faktenlage"],
    ["Folgen", "#folgencheck"],
    ["System", "#systemische-wirkungen"],
    ["Frame", "#narrativ-psychologie"],
    ["Psychologie", "#warum-der-satz-zieht"],
    ["Lösung", "#loesungspfad"],
    ["Quellen", "#warum-belastbar"],
    ["Deep Dive", "#warum-der-radar-so-prueft"],
  ];
  return `<nav class="dossier-tab-nav v3-radar-nav" aria-label="Wirkungsradar Seitenbereiche" data-search-exclude>${items.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
}

export function FactsLayer({ factsLayer }) {
  if (!factsLayer?.coreFacts?.length) return "";
  const facts = factsLayer.coreFacts.map((fact) => `<article class="card v3-fact-card"><p class="v2-badge">Fakt · ${esc(fact.confidence || "mittel")}</p><h3 class="card-title">${esc(fact.title)}</h3><p class="card-text">${esc(fact.statement)}</p><p class="card-text"><strong>Beweist:</strong> ${esc(fact.whatItProves)}</p><p class="card-text"><strong>Beweist nicht:</strong> ${esc(fact.whatItDoesNotProve)}</p>${fact.sourceRefs?.length ? `<p class="card-text"><strong>Quellen:</strong> ${esc(fact.sourceRefs.join(", "))}</p>` : ""}</article>`).join("");
  const boundaries = factsLayer.accountingBoundaries?.length
    ? `<div class="card-grid three">${factsLayer.accountingBoundaries.map((item) => `<article class="card"><p class="card-kicker">Bilanzgrenze</p><h3 class="card-title">${esc(item.label)}</h3><p class="card-text">${esc(item.explanation)}</p><p class="card-text"><strong>Warum wichtig:</strong> ${esc(item.whyItMatters)}</p></article>`).join("")}</div>`
    : "";
  const misuse = factsLayer.commonMisuse?.length
    ? `<div class="card-grid three">${factsLayer.commonMisuse.map((item) => `<article class="card"><p class="card-kicker">Faktenmissbrauch vermeiden</p><h3 class="card-title">${esc(item.misuse)}</h3><p class="card-text">${esc(item.correction)}</p></article>`).join("")}</div>`
    : "";
  return `<section class="section v3-layer v3-layer-facts" id="faktenlage" data-v3-facts-layer><div><div class="section-header"><p class="hero-kicker">Faktenlage</p><h2>Was ist konkret prüfbar?</h2><p>Jeder Fakt sagt hier ausdrücklich, was er belegt - und was daraus nicht folgt.</p></div><div class="card-grid three">${facts}</div>${boundaries}${misuse}</div></section>`;
}

export function ConsequenceCheck({ consequenceCheck }) {
  if (!consequenceCheck?.ifNarrativeWins?.length || !consequenceCheck?.ifCorrectlyHandled?.length) return "";
  const rows = (items) => items.map((item) => `<article class="card"><p class="v2-badge">${esc(item.level)}</p><p class="card-text">${esc(item.text)}</p>${item.affectedSystems?.length ? chips(item.affectedSystems) : ""}</article>`).join("");
  return `<section class="section section-soft v3-layer v3-layer-consequences" id="folgencheck" data-v3-consequence-check><div><div class="section-header"><p class="hero-kicker">Folgencheck</p><h2>Was passiert, wenn Menschen danach handeln?</h2><p>Der Wirkungsradar prüft nicht nur, ob ein Satz stimmt. Er prüft, welche Entscheidungen wahrscheinlicher werden.</p></div><div class="card-grid two"><article class="card v3-check-column"><p class="card-kicker">Wenn das Narrativ gewinnt</p><div class="card-grid">${rows(consequenceCheck.ifNarrativeWins)}</div></article><article class="card v3-check-column"><p class="card-kicker">Wenn wir richtig reagieren</p><div class="card-grid">${rows(consequenceCheck.ifCorrectlyHandled)}</div></article></div><div class="card-grid three"><article class="card"><p class="card-kicker">Kosten des Nicht-Handelns</p><p>${esc(consequenceCheck.nonActionCost)}</p></article>${consequenceCheck.lockInRisk ? `<article class="card"><p class="card-kicker">Lock-in-Risiko</p><p>${esc(consequenceCheck.lockInRisk)}</p></article>` : ""}${consequenceCheck.feedbackLoop ? `<article class="card"><p class="card-kicker">Rückkopplung</p><p>${esc(consequenceCheck.feedbackLoop)}</p></article>` : ""}</div></div></section>`;
}

export function ImpactMatrix({ impactMatrix }) {
  if (!impactMatrix?.length) return "";
  return `<section class="section v3-layer v3-layer-system" id="systemische-wirkungen" data-v3-impact-matrix><div><div class="section-header"><p class="hero-kicker">Systemische Wirkungen</p><h2>Nicht nur ein Faktor. Die ganze Wirkungskette.</h2></div><div class="card-grid three">${impactMatrix.map((item) => `<article class="card v3-impact-matrix-card"><p class="v2-badge">System</p><h3 class="card-title">${esc(item.dimension)}</h3><p class="card-text"><strong>Direkt:</strong> ${esc(item.directEffect)}</p><p class="card-text"><strong>Indirekt:</strong> ${esc(item.indirectEffect)}</p><p class="card-text"><strong>Langfristig:</strong> ${esc(item.longTermEffect)}</p>${item.hiddenCost ? `<p class="card-text"><strong>Verdeckte Kosten:</strong> ${esc(item.hiddenCost)}</p>` : ""}${item.solutionLever ? `<p class="card-text"><strong>Hebel:</strong> ${esc(item.solutionLever)}</p>` : ""}</article>`).join("")}</div></div></section>`;
}

export function NarrativeMechanism({ narrativeMechanism }) {
  if (!narrativeMechanism?.story) return "";
  return `<section class="section section-soft v3-layer v3-layer-frame" id="narrativ-psychologie" data-v3-narrative-mechanism><div><div class="section-header"><p class="hero-kicker">Welche Geschichte wird erzählt?</p><h2>Narrativanalyse.</h2></div><div class="card-grid two"><article class="card"><p class="card-kicker">Geschichte</p><h3 class="card-title">${esc(narrativeMechanism.story)}</h3><p class="card-text"><strong>Verdeckte Annahme:</strong> ${esc(narrativeMechanism.hiddenAssumption)}</p>${narrativeMechanism.targetEmotion?.length ? `<p class="card-text"><strong>Aktiviert:</strong> ${esc(narrativeMechanism.targetEmotion.join(", "))}</p>` : ""}${narrativeMechanism.whoBenefitsFromFrame?.length ? `<p class="card-text"><strong>Nützt dem Frame von:</strong> ${esc(narrativeMechanism.whoBenefitsFromFrame.join(", "))}</p>` : ""}</article><article class="card"><p class="card-kicker">Was verschwindet?</p><ul class="clean-list">${(narrativeMechanism.whatGetsHidden || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article></div>${narrativeMechanism.chainNarrative?.length ? `<article class="card"><p class="card-kicker">Narrativkette</p><ol class="clean-list">${narrativeMechanism.chainNarrative.map((item) => `<li>${esc(item)}</li>`).join("")}</ol></article>` : ""}${narrativeMechanism.narrativeFamily?.length ? chips(narrativeMechanism.narrativeFamily) : ""}</div></section>`;
}

export function PsychologicalEffectCheck({ psychologicalEffectCheck }) {
  if (!psychologicalEffectCheck?.length) return "";
  return `<section class="section v3-layer v3-layer-psychology" id="warum-der-satz-zieht" data-v3-psychology-check><div><div class="section-header"><p class="hero-kicker">Warum der Satz zieht</p><h2>Psychologischer Wirkungscheck.</h2><p>Oben stehen maximal drei Mechanismen, die in der Debatte wirklich tragen.</p></div><div class="card-grid three">${psychologicalEffectCheck.slice(0, 3).map((item) => `<article class="card"><p class="v2-badge">${esc(item.technicalName)}</p><h3 class="card-title">${esc(item.simpleName)}</h3><p class="card-text"><strong>So fühlt es sich an:</strong> ${esc(item.howItFeels)}</p><p class="card-text"><strong>So wirkt es:</strong> ${esc(item.howItWorks)}</p><p class="card-text"><strong>Debatteneffekt:</strong> ${esc(item.debateEffect)}</p><p class="card-text"><strong>Rauskommen:</strong> ${esc(item.howToBypass)}</p><p class="card-text"><strong>Host-Move:</strong> ${esc(item.hostMove)}</p></article>`).join("")}</div></div></section>`;
}

export function FrameShiftPlaybook({ frameShiftPlaybook }) {
  if (!frameShiftPlaybook?.oldFrame) return "";
  const formats = frameShiftPlaybook.answerFormats || {};
  const answerItems = [
    ["10 Sekunden", "Kurzantwort", formats.short10s || formats.comment],
    ["30 Sekunden", "Einordnung", formats.medium30s || formats.live30s],
    ["2 Minuten", "Langantwort", formats.long2min || formats.panel2min],
    ["Ruhig kontern", "Gespräch", formats.calmConversation],
  ].filter(([, , text]) => text);
  return `<section class="section v3-layer v3-layer-answer" id="host-antworten" data-v3-frame-shift><span id="reaktion" class="sr-only">Antworten</span><div><div class="section-header"><p class="hero-kicker">Host-Antworten</p><h2>Kurz, mittellang und vertieft antworten.</h2><p>Erst den wahren Kern anerkennen, dann die fehlende Bilanzgrenze öffnen und zur besseren Wirkungsfrage führen.</p></div><div class="radar-answer-accordion host-answer-tabs">${answerItems.map(([label, purpose, text], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(label)}</span><span class="radar-answer-label">${esc(purpose)}</span></summary><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(text)}'>Antwort kopieren</button></details>`).join("")}</div><div class="card-grid two v3-frame-control-grid"><article class="card"><p class="card-kicker">Alter Frame</p><h3 class="card-title">${esc(frameShiftPlaybook.oldFrame)}</h3><p class="card-text"><strong>Warum er andockt:</strong> ${esc(frameShiftPlaybook.whyItHooks)}</p><p class="card-text"><strong>Gefahr beim Wiederholen:</strong> ${esc(frameShiftPlaybook.dangerIfRepeated)}</p><p class="card-text"><strong>Brückensatz:</strong> ${esc(frameShiftPlaybook.bridgeSentence)}</p><p class="card-text"><strong>Bessere Frage:</strong> ${esc(frameShiftPlaybook.betterQuestion)}</p></article><article class="card"><p class="card-kicker">Nicht so / besser so</p><h3 class="card-title">Frame kontrollieren.</h3><p class="card-text"><strong>Nicht sagen:</strong></p><ul class="clean-list">${(frameShiftPlaybook.doNotSay || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul><p class="card-text"><strong>Stattdessen:</strong></p><ul class="clean-list">${(frameShiftPlaybook.sayInstead || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article></div></div></section>`;
}

export function SolutionPath({ solutionPath }) {
  if (!solutionPath?.levers?.length) return "";
  return `<section class="section v3-layer v3-layer-solution" id="loesungspfad" data-v3-solution-path><div><div class="section-header"><p class="hero-kicker">Was macht den Zustand besser?</p><h2>${esc(solutionPath.plainLanguageSummary)}</h2></div><div class="card-grid three">${solutionPath.levers.map((item) => `<article class="card"><p class="v2-badge">Hebel</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text"><strong>Was tun:</strong> ${esc(item.whatToDo)}</p><p class="card-text"><strong>Warum wirkt es:</strong> ${esc(item.whyItWorks)}</p><p class="card-text"><strong>Systemwirkung:</strong> ${esc(item.systemEffect)}</p>${item.indicators?.length ? `<p class="card-text"><strong>Indikatoren:</strong> ${esc(item.indicators.join(", "))}</p>` : ""}</article>`).join("")}</div>${solutionPath.woekConnection ? `<article class="card"><p class="card-kicker">WÖk-Bezug</p><h3 class="card-title">${esc(solutionPath.woekConnection.principle)}</h3><p class="card-text">${esc(solutionPath.woekConnection.explanation)}</p>${solutionPath.woekConnection.internalLinks?.length ? `<p>${solutionPath.woekConnection.internalLinks.map((href) => `<a class="text-link" href="${esc(href)}">${esc(href.replace(/\/$/, "").split("/").pop()?.replace(/-/g, " ") || href)}</a>`).join(" · ")}</p>` : ""}</article>` : ""}</div></section>`;
}

export function MethodologyDeepDive({ dossier }) {
  return `<section class="section section-soft v3-layer v3-layer-method" id="warum-der-radar-so-prueft"><div><div class="section-header"><p class="hero-kicker">Warum der Wirkungsradar so prüft</p><h2>Faktencheck ist Grundlage. Folgencheck ist Zweck.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item"><summary><span class="radar-answer-time">Wirkung</span><span class="radar-answer-label">Zustandsveränderung</span></summary><p>Wirkung ist nicht Absicht, Reichweite oder Image. Wirkung ist die tatsächliche Veränderung von Zuständen und wird erst am Referenzrahmen bewertet.</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Fakten</span><span class="radar-answer-label">Warum Faktencheck allein nicht reicht</span></summary><p>Eine Aussage kann einen wahren Teil enthalten und trotzdem schlechte Entscheidungen wahrscheinlicher machen. Deshalb trennt der Radar Faktenlage, Bilanzgrenze, Frame und Folgen.</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Folgen</span><span class="radar-answer-label">Erste, zweite und dritte Ordnung</span></summary><p>Geprüft wird, was sofort passiert, was danach plausibler wird und welche Systempfade sich auf Dauer verfestigen.</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Quellen</span><span class="radar-answer-label">Grenzen statt Autoritätsersatz</span></summary><p>Quellen zeigen, was belegt ist. Sie zeigen auch, was offen bleibt. Genau deshalb nennt die Faktenlage, was ein Fakt beweist und was nicht.</p></details></div><p><a class="btn btn-secondary" href="../../detail/${esc(dossier.slug)}/">Fachlich vertiefen</a></p></div></section>`;
}

export function UnderstandSection({ explain }) {
  const trueItems = explain.whatIsTrue || [];
  const missingItems = explain.whatIsMissing || [];
  return `<section class="section v2-understand" id="verstehen"><div><div class="section-header"><p class="hero-kicker">Verstehen</p><h2>Was stimmt - und was fehlt?</h2><p>${esc(explain.simpleMechanism)}</p></div><div class="card-grid two"><article class="card"><p class="card-kicker">Was stimmt?</p><ul class="clean-list">${trueItems.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article><article class="card"><p class="card-kicker">Was fehlt?</p><ul class="clean-list">${missingItems.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article></div></div></section>`;
}

export function SolutionCard({ solution }) {
  return `<section class="section v2-solution" id="was-macht-es-besser"><div><div class="section-header"><p class="hero-kicker">Was macht es besser?</p><h2>${esc(solution.plainLanguage)}</h2></div><div class="card-grid">${solution.measures.map((item) => `<article class="card"><h3 class="card-title">${esc(item.title)}</h3><p class="card-text">${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
}

export function ResponseFormats({ dossier }) {
  const comment = dossier.responses?.short10s?.text || dossier.responses?.comment?.text || dossier.cockpit.sayThisNow;
  const live = dossier.responses?.medium30s?.text || dossier.responses?.live?.text || uniqueSentences(dossier.cockpit.sayThisNow, dossier.cockpit.positiveExample.hostLine);
  const panel = dossier.responses?.long2min?.text || dossier.responses?.panel?.text || uniqueSentences(dossier.cockpit.sayThisNow, dossier.cockpit.frameShift.betterAnswer, dossier.cockpit.positiveExample.hostLine);
  const calmCounter = dossier.responses?.calmCounter?.text || uniqueSentences(dossier.cockpit.frameShift.betterAnswer, dossier.cockpit.betterQuestion);
  const items = [
    ["10 Sekunden", "Kurzantwort", comment, "Antwort kopieren"],
    ["30 Sekunden", "Einordnung", live, "Antwort kopieren"],
    ["2 Minuten", "Langantwort", panel, "Antwort kopieren"],
    ["Ruhig kontern", "Gespräch", calmCounter, "Antwort kopieren"],
  ];
  return `<section class="section v2-answer-tabs" id="host-antworten"><span id="antwortformate-v2" class="sr-only">Antwortformate</span><div><div class="section-header"><p class="hero-kicker">Host-Antworten</p><h2>Kurz, mittellang und vertieft antworten.</h2><p>Den wahren Kern anerkennen, die Bilanzgrenze öffnen und zur besseren Wirkungsfrage führen.</p></div><div class="radar-answer-accordion host-answer-tabs">${items.map(([label, purpose, text, button], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(label)}</span><span class="radar-answer-label">${esc(purpose)}</span></summary><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(text)}'>${esc(button)}</button></details>`).join("")}</div></div></section>`;
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
    ["Lösungsbausteine", internalLinks.woek || []],
  ];
  return `<section class="section v2-linkhub" id="linkhub"><div><div class="section-header"><p class="hero-kicker">Weiter prüfen</p><h2>Links in die Tiefe.</h2></div><div class="card-grid four">${groups.map(([label, links]) => `<article class="card"><p class="card-kicker">${esc(label)}</p>${links.length ? links.map((href) => `<p><a class="text-link" href="${esc(href)}">${esc(linkLabel(href))}</a></p>`).join("") : `<p class="card-text">Noch nicht verknüpft.</p>`}</article>`).join("")}</div></div></section>`;
}

export function HostCockpitV2({ dossier }) {
  return `<section class="section v2-host-cockpit" id="host-cockpit" data-v2-host-cockpit><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Host-Cockpit</p><h2>Was wurde gesagt?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(dossier.claim)}</strong></p></div><div class="v2-cockpit-grid">${ShortJudgementCard({ text: dossier.cockpit.shortJudgement })}${SayThisNowCard({ text: dossier.cockpit.sayThisNow })}${PositiveExampleCard({ example: dossier.cockpit.positiveExample })}${BetterQuestionCard({ question: dossier.cockpit.betterQuestion })}</div>${FrameShiftCard({ frameShift: dossier.cockpit.frameShift })}</div></section>`;
}

export function renderDossierV2Sections(dossier) {
  if (dossier.v3) {
    return [
      HostCockpitV2({ dossier }),
      FrameShiftPlaybook({ frameShiftPlaybook: dossier.v3.frameShiftPlaybook }),
      V3PageNav(),
      FactsLayer({ factsLayer: dossier.v3.factsLayer }),
      ConsequenceCheck({ consequenceCheck: dossier.v3.consequenceCheck }),
      ImpactMatrix({ impactMatrix: dossier.v3.impactMatrix }),
      NarrativeMechanism({ narrativeMechanism: dossier.v3.narrativeMechanism }),
      PsychologicalEffectCheck({ psychologicalEffectCheck: dossier.v3.psychologicalEffectCheck }),
      SolutionPath({ solutionPath: dossier.v3.solutionPath }),
      TrustBlock({ trustBlock: dossier.trustBlock, sources: dossier.sources }),
      LinkHub({ internalLinks: dossier.internalLinks }),
      MethodologyDeepDive({ dossier }),
    ].join("\n");
  }
  return [
    HostCockpitV2({ dossier }),
    ResponseFormats({ dossier }),
    UnderstandSection({ explain: dossier.explain }),
    ImpactFan({ impactFan: dossier.impactFan }),
    PsychologyLiteCard({ psychologyLite: dossier.psychologyLite }),
    ConsequenceStack({ consequenceStack: dossier.consequenceStack }),
    SolutionCard({ solution: dossier.solution }),
    TrustBlock({ trustBlock: dossier.trustBlock, sources: dossier.sources }),
    LinkHub({ internalLinks: dossier.internalLinks }),
  ].join("\n");
}

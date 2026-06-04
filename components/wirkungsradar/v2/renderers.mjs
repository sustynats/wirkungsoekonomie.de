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
  return `<article class="v2-cockpit-card v2-card-strong"><p class="v2-badge">Kurzantwort - 10 Sekunden</p><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(text)}'>Antwort kopieren</button></article>`;
}

export function PositiveExampleCard({ example }) {
  return `<article class="v2-cockpit-card"><p class="v2-badge">Ein gutes Bild</p><h3>${esc(example.title)}</h3><p>${esc(example.text)}</p>${chips(example.whatGetsBetter)}<p><strong>Host-Satz:</strong> ${esc(example.hostLine)}</p><button class="copy-chip" type="button" data-copy-text='${copy(example.hostLine)}'>Bild kopieren</button></article>`;
}

export function BetterQuestionCard({ question }) {
  return `<article class="v2-cockpit-card"><p class="v2-badge">Die bessere Frage</p><p>${esc(question)}</p><button class="copy-chip" type="button" data-copy-text='${copy(question)}'>Frage kopieren</button></article>`;
}

export function FrameShiftCard({ frameShift }) {
  return `<div class="v2-frame-card" id="frame-nicht-uebernehmen"><p class="v2-badge">So verschiebst du den Frame</p><div><strong>Nicht so antworten:</strong> ${esc((frameShift.doNotAnswer || []).join(" "))}</div><div><strong>Besser so antworten:</strong> ${esc(frameShift.betterAnswer)}</div><div><strong>Brückensatz:</strong> ${esc(frameShift.bridgeSentence || frameShift.whyBetter)}</div><div><strong>Die bessere Frage:</strong> ${esc(frameShift.betterQuestion || "")}</div></div>`;
}

export function BehindNarrativeCard({ dossier }) {
  const frame = dossier.v3?.frameShiftPlaybook;
  const narrative = dossier.v3?.narrativeMechanism;
  const items = [
    frame?.whyItHooks,
    ...(narrative?.whatGetsHidden || []),
    narrative?.hiddenAssumption,
  ].filter(Boolean).slice(0, 5);
  if (!items.length) return "";
  return `<article class="v2-cockpit-card"><p class="v2-badge">Was steckt dahinter?</p><ul class="clean-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>`;
}

export function TriggeredEffectsCard({ dossier }) {
  const effectNames = [
    ...(dossier.v3?.narrativeMechanism?.targetEmotion || []),
    ...(dossier.v3?.psychologicalEffectCheck || []).map((item) => item.simpleName || item.technicalName),
    ...(dossier.psychologyLite?.items || []).map((item) => item.simple || item.technical),
  ].filter(Boolean);
  const unique = [...new Set(effectNames)].slice(0, 8);
  if (!unique.length) return "";
  return `<article class="v2-cockpit-card"><p class="v2-badge">Was soll es auslösen?</p>${chips(unique)}</article>`;
}

export function ImpactFan({ impactFan }) {
  return `<section class="section v2-impact-fan" id="was-wird-mitgezaehlt" data-v2-impact-fan><div><div class="section-header"><p class="hero-kicker">Was wird mitgezählt?</p><h2>Die ganze Rechnung öffnen.</h2></div><div class="v2-impact-grid">${impactFan.dimensions.slice(0, 10).map((item) => `<article class="v2-impact-card"><p class="v2-badge">${esc(item.icon || "Wirkung")}</p><h3>${esc(item.label)}</h3><p>${esc(item.sentence)}</p>${item.example ? `<small>${esc(item.example)}</small>` : ""}</article>`).join("")}</div></div></section>`;
}

export function PsychologyLiteCard({ psychologyLite }) {
  if (!psychologyLite?.items?.length) return "";
  return `<section class="section v2-psychology-lite debate-psychology-secondary" id="warum-der-satz-zieht"><div><details class="debate-psychology-accordion"><summary><span>Warum zieht dieses Narrativ?</span><span>Ergänzende Mechanik</span></summary><p class="card-text">Viele Narrative wirken nicht, weil sie wahr sind, sondern weil sie Angst, Kontrollverlust oder Zugehörigkeit ansprechen. Wer den Mechanismus erkennt, kann die Debatte auf den Wirkpfad zurückholen.</p><div class="debate-psychology-list">${psychologyLite.items.slice(0, 3).map((item) => `<article class="card debate-psychology-item"><p class="v2-badge">${esc(item.technical || "Mechanismus")}</p><h3 class="card-title">${esc(item.simple)}</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> ${esc(item.debateEffect)}</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> ${esc(item.howToBypass)}</p></article>`).join("")}</div></details></div></section>`;
}

export function ConsequenceStack({ consequenceStack }) {
  const items = [consequenceStack.order1, consequenceStack.order2, consequenceStack.order3];
  return `<section class="section section-soft v2-consequence-stack v3-layer-consequences" id="folgencheck"><span id="was-passiert-danach" class="sr-only">Folgencheck</span><div><div class="section-header"><p class="hero-kicker">Wirkung statt bloßer Faktenprüfung</p><h2>Folgencheck: Was dieses Narrativ bewirkt</h2><p>Der Debatten-Kompass prüft, was sich verändert, wenn Menschen der Behauptung folgen.</p></div><div class="card-grid three v3-consequence-orders">${items.map((item, index) => `<article class="card v3-order-card"><p class="v2-badge">Wirkung ${index + 1}. Ordnung</p><h3 class="card-title">${esc(item.label)}</h3><p class="card-text">${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
}

export function V3PageNav() {
  const items = [
    ["Behauptung", "#host-cockpit"],
    ["Folgencheck", "#folgencheck"],
    ["Wirkpfad", "#systemische-wirkungen"],
    ["Reaktion", "#host-antworten"],
    ["Faktenlage", "#faktenlage"],
    ["Quellen", "#warum-belastbar"],
    ["Warum verfängt es?", "#warum-der-satz-zieht"],
    ["Methode", "#warum-der-radar-so-prueft"],
  ];
  return `<nav class="dossier-tab-nav v3-radar-nav" aria-label="Debattenkarte Seitenbereiche" data-search-exclude>${items.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join("")}</nav>`;
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
  const orderLabels = ["Wirkung 1. Ordnung", "Wirkung 2. Ordnung", "Wirkung 3. Ordnung"];
  const narrativeRows = consequenceCheck.ifNarrativeWins.slice(0, 3).map((item, index) => `<article class="card v3-order-card"><p class="v2-badge">${esc(orderLabels[index] || item.level)}</p><h3 class="card-title">${esc(item.level)}</h3><p class="card-text">${esc(item.text)}</p>${item.affectedSystems?.length ? chips(item.affectedSystems) : ""}</article>`).join("");
  const responseRows = consequenceCheck.ifCorrectlyHandled.slice(0, 3).map((item) => `<article class="card v3-response-card"><p class="v2-badge">${esc(item.level)}</p><p class="card-text">${esc(item.text)}</p>${item.affectedSystems?.length ? chips(item.affectedSystems) : ""}</article>`).join("");
  const affected = [...new Set(consequenceCheck.ifNarrativeWins.flatMap((item) => item.affectedSystems || []))];
  const mpd = [
    ["Mensch", affected.find((item) => /mensch|sozial|arbeit|gesund|sicherheit|teilhabe/i.test(item)) || "Risiken für Teilhabe, Sicherheit, Alltag oder Vertrauen werden sichtbar gemacht."],
    ["Planet", affected.find((item) => /planet|klima|energie|natur|ressource|infrastruktur/i.test(item)) || "Ökologische Folgekosten und bessere Alternativen dürfen nicht aus der Rechnung fallen."],
    ["Demokratie", affected.find((item) => /demokratie|vertrauen|politik|institution|medien|recht/i.test(item)) || "Demokratische Entscheidung braucht klare Zuständigkeit, Quellen und Bilanzgrenzen."],
  ];
  return `<section class="section section-soft v3-layer v3-layer-consequences" id="folgencheck" data-v3-consequence-check><div><div class="section-header"><p class="hero-kicker">Wirkung statt bloßer Faktenprüfung</p><h2>Folgencheck: Was dieses Narrativ bewirkt</h2><p>Der Debatten-Kompass prüft, was sich verändert, wenn Menschen der Behauptung folgen: Wahrnehmung, Verhalten, Entscheidungen und Systempfade.</p></div><div class="card-grid three v3-consequence-orders">${narrativeRows}</div><div class="card v3-mpd-risk-card"><p class="card-kicker">Risiken nach Mensch, Planet und Demokratie</p><div class="v3-mpd-risk-grid">${mpd.map(([label, text]) => `<div><strong>${esc(label)}</strong><span>${esc(text)}</span></div>`).join("")}</div></div><div class="card-grid two"><article class="card v3-check-column"><p class="card-kicker">Rote Linie / Unterlassungskosten</p><p>${esc(consequenceCheck.nonActionCost)}</p>${consequenceCheck.lockInRisk ? `<p><strong>Lock-in:</strong> ${esc(consequenceCheck.lockInRisk)}</p>` : ""}${consequenceCheck.feedbackLoop ? `<p><strong>Rückkopplung:</strong> ${esc(consequenceCheck.feedbackLoop)}</p>` : ""}</article><article class="card v3-check-column"><p class="card-kicker">Wirkungsökonomische Einordnung</p><p>Die Frage ist nicht nur, ob ein Satz einen wahren Kern hat. Entscheidend ist, welche Entscheidung wahrscheinlicher wird und welcher Zustand dadurch für Mensch, Planet und Demokratie entsteht.</p><div class="card-grid">${responseRows}</div></article></div></div></section>`;
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
  return `<section class="section v3-layer v3-layer-psychology debate-psychology-secondary" id="warum-der-satz-zieht" data-v3-psychology-check><div><details class="debate-psychology-accordion"><summary><span>Warum zieht dieses Narrativ?</span><span>Ergänzende Mechanik</span></summary><p class="card-text">Nicht jede falsche Behauptung wirkt wegen Fakten. Viele Narrative wirken nicht, weil sie wahr sind, sondern weil sie Angst, Kontrollverlust oder Zugehörigkeit ansprechen.</p><div class="debate-psychology-list">${psychologicalEffectCheck.slice(0, 3).map((item) => `<article class="card debate-psychology-item"><p class="v2-badge">${esc(item.technicalName)}</p><h3 class="card-title">${esc(item.simpleName)}</h3><p class="card-text"><strong>Wie er hier wirkt:</strong> ${esc(item.howItWorks || item.debateEffect || item.howItFeels)}</p><p class="card-text"><strong>Wie du ihn entschärfst:</strong> ${esc(item.howToBypass || item.hostMove)}</p>${item.hostMove ? `<p class="card-text"><strong>Host-Move:</strong> ${esc(item.hostMove)}</p>` : ""}</article>`).join("")}</div></details></div></section>`;
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
  return `<section class="section v3-layer v3-layer-answer" id="host-antworten" data-v3-frame-shift><span id="reaktion" class="sr-only">Antworten</span><div><div class="section-header"><p class="hero-kicker">Direkt nutzbare Antworten</p><h2>Kurz, mittellang und vertieft antworten.</h2><p>Erst den wahren Kern anerkennen, dann die fehlende Bilanzgrenze öffnen und zur besseren Frage führen.</p></div><div class="radar-answer-accordion host-answer-tabs">${answerItems.map(([label, purpose, text], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(label)}</span><span class="radar-answer-label">${esc(purpose)}</span></summary><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(text)}'>Antwort kopieren</button></details>`).join("")}</div></div></section>`;
}

export function SolutionPath({ solutionPath }) {
  if (!solutionPath?.levers?.length) return "";
  const steps = ["Auslöser", "Wirkungspotenzial", "Wirkmechanismus", "Zustandsveränderung", "Rückkopplung", "Gegensteuerung"];
  const levers = solutionPath.levers.slice(0, 6);
  return `<section class="section v3-layer v3-layer-solution" id="loesungspfad" data-v3-solution-path><div><div class="section-header"><p class="hero-kicker">Wirkpfad</p><h2>${esc(solutionPath.plainLanguageSummary)}</h2><p>Der Wirkpfad zeigt kompakt, wie aus einer Behauptung Wirkung entsteht - und wo Gegensteuerung möglich wird.</p></div><div class="impact-path-stepper">${steps.map((label, index) => {
    const lever = levers[index % Math.max(1, levers.length)];
    const text = index < 3 ? lever?.whatToDo : index === 3 ? lever?.systemEffect : index === 4 ? lever?.whyItWorks : lever?.title;
    return `<article class="impact-path-step"><p class="v2-badge">${esc(label)}</p><p>${esc(text || solutionPath.plainLanguageSummary)}</p></article>`;
  }).join("")}</div><div class="card-grid three">${levers.map((item) => `<article class="card"><p class="v2-badge">Gegensteuerung</p><h3 class="card-title">${esc(item.title)}</h3><p class="card-text"><strong>Was tun:</strong> ${esc(item.whatToDo)}</p><p class="card-text"><strong>Warum wirkt es:</strong> ${esc(item.whyItWorks)}</p><p class="card-text"><strong>Systemwirkung:</strong> ${esc(item.systemEffect)}</p>${item.indicators?.length ? `<p class="card-text"><strong>Indikatoren:</strong> ${esc(item.indicators.join(", "))}</p>` : ""}</article>`).join("")}</div>${solutionPath.woekConnection ? `<article class="card"><p class="card-kicker">WÖk-Bezug</p><h3 class="card-title">${esc(solutionPath.woekConnection.principle)}</h3><p class="card-text">${esc(solutionPath.woekConnection.explanation)}</p>${solutionPath.woekConnection.internalLinks?.length ? `<p>${solutionPath.woekConnection.internalLinks.map((href) => `<a class="text-link" href="${esc(href)}">${esc(href.replace(/\/$/, "").split("/").pop()?.replace(/-/g, " ") || href)}</a>`).join(" · ")}</p>` : ""}</article>` : ""}</div></section>`;
}

export function MethodologyDeepDive({ dossier }) {
  return `<section class="section section-soft v3-layer v3-layer-method" id="warum-der-radar-so-prueft"><div><div class="section-header"><p class="hero-kicker">Wirkungsradar-Methode</p><h2>Warum der Debatten-Kompass mehr macht als einen Faktencheck.</h2></div><div class="radar-answer-accordion host-answer-tabs"><details class="radar-answer-item"><summary><span class="radar-answer-time">Faktenlage</span><span class="radar-answer-label">Was ist belegt?</span></summary><p>Eine Aussage kann einen wahren Teil enthalten und trotzdem schlechte Entscheidungen wahrscheinlicher machen. Deshalb trennt die Wirkungsradar-Methode Faktenlage, Bilanzgrenze, Frame und Folgen.</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Folgencheck</span><span class="radar-answer-label">Was löst der Satz aus?</span></summary><p>Geprüft wird, was sofort passiert, was danach plausibler wird und welche Systempfade sich auf Dauer verfestigen.</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">Unsicherheit</span><span class="radar-answer-label">Grenzen statt Autoritätsersatz</span></summary><p>Quellen zeigen, was belegt ist. Sie zeigen auch, was offen bleibt. Genau deshalb nennt die Faktenlage, was ein Fakt beweist und was nicht.</p></details></div><p><a class="btn btn-secondary" href="../../detail/${esc(dossier.slug)}/">Fachlich vertiefen</a></p></div></section>`;
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
  return `<section class="section v2-answer-tabs" id="host-antworten"><span id="antwortformate-v2" class="sr-only">Antwortformate</span><div><div class="section-header"><p class="hero-kicker">Direkt nutzbare Antworten</p><h2>Kurz, mittellang und vertieft antworten.</h2><p>Den wahren Kern anerkennen, die Bilanzgrenze öffnen und zur besseren Frage führen.</p></div><div class="radar-answer-accordion host-answer-tabs">${items.map(([label, purpose, text, button], index) => `<details class="radar-answer-item"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(label)}</span><span class="radar-answer-label">${esc(purpose)}</span></summary><p>${esc(text)}</p><button class="copy-chip" type="button" data-copy-text='${copy(text)}'>${esc(button)}</button></details>`).join("")}</div></div></section>`;
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
    ["Ähnliche Debattenkarten", internalLinks.relatedDossiers || []],
    ["Lösungsbausteine", internalLinks.woek || []],
  ];
  return `<section class="section v2-linkhub" id="linkhub"><div><div class="section-header"><p class="hero-kicker">Weiter prüfen</p><h2>Links in die Tiefe.</h2></div><div class="card-grid four">${groups.map(([label, links]) => `<article class="card"><p class="card-kicker">${esc(label)}</p>${links.length ? links.map((href) => `<p><a class="text-link" href="${esc(href)}">${esc(linkLabel(href))}</a></p>`).join("") : `<p class="card-text">Noch nicht verknüpft.</p>`}</article>`).join("")}</div></div></section>`;
}

export function HostCockpitV2({ dossier }) {
  const frameShift = {
    ...dossier.cockpit.frameShift,
    bridgeSentence: dossier.v3?.frameShiftPlaybook?.bridgeSentence,
    betterQuestion: dossier.v3?.frameShiftPlaybook?.betterQuestion || dossier.cockpit.betterQuestion,
  };
  return `<section class="section v2-host-cockpit" id="host-cockpit" data-v2-host-cockpit><div class="v2-cockpit-shell"><div class="v2-cockpit-head"><p class="hero-kicker">Schnellantwort</p><h2>Was wird behauptet?</h2><p class="v2-claim-line">Jemand sagt: <strong>${esc(dossier.claim)}</strong></p>${dossier.claimVariants?.length ? `<p class="card-text"><strong>Varianten:</strong> ${esc(dossier.claimVariants.slice(0, 3).join(" · "))}</p>` : ""}</div><div class="v2-cockpit-grid">${SayThisNowCard({ text: dossier.cockpit.sayThisNow })}${ShortJudgementCard({ text: dossier.cockpit.shortJudgement })}${BehindNarrativeCard({ dossier })}${TriggeredEffectsCard({ dossier })}</div>${FrameShiftCard({ frameShift })}<div class="v2-cockpit-grid">${PositiveExampleCard({ example: dossier.cockpit.positiveExample })}${BetterQuestionCard({ question: dossier.cockpit.betterQuestion })}</div></div></section>`;
}

export function renderDossierV2Sections(dossier) {
  if (dossier.v3) {
    return [
      HostCockpitV2({ dossier }),
      V3PageNav(),
      ConsequenceCheck({ consequenceCheck: dossier.v3.consequenceCheck }),
      ImpactMatrix({ impactMatrix: dossier.v3.impactMatrix }),
      SolutionPath({ solutionPath: dossier.v3.solutionPath }),
      FrameShiftPlaybook({ frameShiftPlaybook: dossier.v3.frameShiftPlaybook }),
      FactsLayer({ factsLayer: dossier.v3.factsLayer }),
      NarrativeMechanism({ narrativeMechanism: dossier.v3.narrativeMechanism }),
      TrustBlock({ trustBlock: dossier.trustBlock, sources: dossier.sources }),
      PsychologicalEffectCheck({ psychologicalEffectCheck: dossier.v3.psychologicalEffectCheck }),
      LinkHub({ internalLinks: dossier.internalLinks }),
      MethodologyDeepDive({ dossier }),
    ].join("\n");
  }
  return [
    HostCockpitV2({ dossier }),
    ConsequenceStack({ consequenceStack: dossier.consequenceStack }),
    ImpactFan({ impactFan: dossier.impactFan }),
    SolutionCard({ solution: dossier.solution }),
    ResponseFormats({ dossier }),
    UnderstandSection({ explain: dossier.explain }),
    TrustBlock({ trustBlock: dossier.trustBlock, sources: dossier.sources }),
    PsychologyLiteCard({ psychologyLite: dossier.psychologyLite }),
    LinkHub({ internalLinks: dossier.internalLinks }),
  ].join("\n");
}

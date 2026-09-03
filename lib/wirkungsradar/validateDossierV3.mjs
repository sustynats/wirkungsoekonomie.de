function textOf(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function count(value) {
  return Array.isArray(value) ? value.length : 0;
}

function publicContent(html) {
  return html
    .replace(/<[^>]+data-search-exclude[^>]*>[\s\S]*?<\/(?:header|nav|footer|section)>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ");
}

function firstV3Status(errors) {
  if (errors.some((error) => error.includes("legacy"))) return "draft_legacy_structure";
  if (errors.some((error) => error.includes("facts"))) return "draft_facts_too_shallow";
  if (errors.some((error) => error.includes("consequence"))) return "draft_consequence_check_too_shallow";
  if (errors.length) return "draft_v3_incomplete";
  return "checked_v4_debattenkompass";
}

export function validateDossierV3(dossier, html = "") {
  const errors = [];
  const warnings = [];
  const v3 = dossier.v3 || {};
  const facts = v3.factsLayer?.coreFacts || [];
  const consequence = v3.consequenceCheck || {};
  const impact = v3.impactMatrix || [];
  const narrative = v3.narrativeMechanism || {};
  const psychology = v3.psychologicalEffectCheck || [];
  const frame = v3.frameShiftPlaybook || {};
  const solution = v3.solutionPath || {};

  if (!v3.factsLayer) errors.push("factsLayer fehlt");
  if (count(facts) < 3) errors.push("factsLayer hat weniger als 3 konkrete Fakten");
  for (const [index, fact] of facts.entries()) {
    if (!textOf(fact.whatItProves)) errors.push(`factsLayer Fakt ${index + 1} ohne whatItProves`);
    if (!textOf(fact.whatItDoesNotProve)) errors.push(`factsLayer Fakt ${index + 1} ohne whatItDoesNotProve`);
  }

  if (!v3.consequenceCheck) errors.push("consequenceCheck fehlt");
  if (!count(consequence.ifNarrativeWins)) errors.push("consequenceCheck ohne ifNarrativeWins");
  if (!count(consequence.ifCorrectlyHandled)) errors.push("consequenceCheck ohne ifCorrectlyHandled");
  if (!textOf(consequence.nonActionCost)) errors.push("consequenceCheck ohne nonActionCost");
  if (!textOf(consequence.lockInRisk) && !textOf(consequence.feedbackLoop)) errors.push("consequenceCheck ohne Lock-in oder Rueckkopplung");

  if (count(impact) < 5) errors.push("impactMatrix weniger als 5 Dimensionen");
  if (!textOf(narrative.story)) errors.push("narrativeMechanism fehlt");
  if (count(psychology) < 2) errors.push("psychologicalEffectCheck weniger als 2 Effekte");
  if (!textOf(frame.oldFrame)) errors.push("frameShiftPlaybook fehlt");
  if (!textOf(solution.plainLanguageSummary) || !count(solution.levers)) errors.push("solutionPath fehlt");

  if (!textOf(dossier.cockpit?.sayThisNow)) errors.push("quickAnswer fehlt");
  if (!textOf(frame.answerFormats?.short10s || frame.answerFormats?.comment)) errors.push("responseBlock Kurzantwort fehlt");
  if (!textOf(frame.answerFormats?.medium30s || frame.answerFormats?.live30s)) errors.push("responseBlock 30 Sekunden fehlt");
  if (!textOf(frame.answerFormats?.long2min || frame.answerFormats?.panel2min)) errors.push("responseBlock 2 Minuten fehlt");
  if (!textOf(dossier.cockpit?.positiveExample?.text)) errors.push("positiveExample fehlt");
  if (!textOf(dossier.cockpit?.betterQuestion).endsWith("?")) errors.push("bessere Frage keine Frage");
  if (/^Abstract:/i.test(textOf(dossier.cockpit?.positiveExample?.text))) errors.push("Beispiel beginnt mit Abstract");

  if (html) {
    const order = [
      ["inhaltsverzeichnis", html.indexOf('id="inhaltsverzeichnis"')],
      ["host-cockpit", html.indexOf('id="host-cockpit"')],
      ["relevanz", html.indexOf('id="relevanz"')],
      ["folgencheck", html.indexOf('id="folgencheck"')],
      ["loesungspfad", html.indexOf('id="loesungspfad"')],
      ["host-antworten", html.indexOf('id="host-antworten"')],
      ["kritische-fragen", html.indexOf('id="kritische-fragen"')],
      ["faktenlage", html.indexOf('id="faktenlage"')],
      ["quellen", html.indexOf('id="quellen"')],
    ];
    if (order.some(([, position]) => position < 0)) errors.push("v3 Pflichtanker fehlen im HTML");
    for (let index = 1; index < order.length; index += 1) {
      if (order[index - 1][1] >= 0 && order[index][1] >= 0 && order[index][1] < order[index - 1][1]) {
        errors.push(`Nutzenreihenfolge verletzt: ${order[index][0]} steht vor ${order[index - 1][0]}`);
      }
    }
    const newAnchors = ["behauptung", "relevanz", "folgencheck", "wirkpfad", "reaktion", "faktenlage"];
    if (!newAnchors.every((id) => html.includes(`id="${id}"`))) errors.push("DC-17 Pflichtanker fehlen im HTML");
    if (!html.includes('id="host-antworten"')) errors.push("Antwortblock fehlt im HTML");
    if (!/Kurzantwort - 10 Sekunden/.test(html) && !/<span class="radar-answer-time">10 Sekunden<\/span>/.test(html)) errors.push("Kurzantwort - 10 Sekunden fehlt oben");
    if (!/So antwortest du|Sofortantwort/.test(html)) errors.push("Antwortblock fehlt oder steht nicht sichtbar");
    if (/Live-Karten|Wirkungsradar-Live|Gute R(?:ü|ue)ckfrage|Host-Cockpit|v3 Antwortformat|Psychologischer Wirkungscheck/.test(html)) errors.push("legacy public label noch sichtbar");
    const contentHtml = publicContent(html);
    const beforeConsequences = contentHtml.slice(0, Math.max(0, contentHtml.indexOf('id="folgencheck"')));
    if (/Psychologischer Wirkungscheck|Warum zieht dieses Narrativ\?/.test(beforeConsequences)) errors.push("Psychologie steht vor Folgencheck");
    const legacyPatterns = [
      /<p class="radar-summary-label">(?:Kurzurteil|Wahrer Kern|Problem|Narrativ|Wirkungsrisiko|Live-Antwort)<\/p>/,
      /v3 Antwortformat/,
      /Kommentarspalten/,
      /<p class="hero-kicker">Wirkungspfad<\/p>/,
      /<p class="card-kicker">Wirkstoff<\/p>/,
      /<p class="hero-kicker">WÖk-Lösung<\/p>/,
    ];
    if (legacyPatterns.some((pattern) => pattern.test(html))) errors.push("legacy duplicate block noch sichtbar");
  }

  const status = firstV3Status(errors);
  if (status !== "checked_v4_debattenkompass") {
    warnings.push(`V3-Status: ${status}`);
  }
  return { status, errors, warnings };
}

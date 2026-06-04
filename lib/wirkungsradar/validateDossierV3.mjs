function textOf(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function count(value) {
  return Array.isArray(value) ? value.length : 0;
}

function firstV3Status(errors) {
  if (errors.some((error) => error.includes("legacy"))) return "draft_legacy_structure";
  if (errors.some((error) => error.includes("facts"))) return "draft_facts_too_shallow";
  if (errors.some((error) => error.includes("consequence"))) return "draft_consequence_check_too_shallow";
  if (errors.length) return "draft_v3_incomplete";
  return "checked_v3_facts_consequences_frame_solution";
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

  if (!textOf(dossier.cockpit?.positiveExample?.text)) errors.push("Host-Cockpit kein positives Bild");
  if (!textOf(dossier.cockpit?.betterQuestion).endsWith("?")) errors.push("bessere Frage keine Frage");
  if (/^Abstract:/i.test(textOf(dossier.cockpit?.positiveExample?.text))) errors.push("Beispiel beginnt mit Abstract");

  if (html) {
    const order = [
      ["faktenlage", html.indexOf('id="faktenlage"')],
      ["folgencheck", html.indexOf('id="folgencheck"')],
      ["warum-der-radar-so-prueft", html.indexOf('id="warum-der-radar-so-prueft"')],
    ];
    if (order.some(([, position]) => position < 0)) errors.push("v3 Pflichtanker fehlen im HTML");
    if (order[2][1] >= 0 && order[0][1] >= 0 && order[2][1] < order[0][1]) errors.push("Theorie steht vor Faktenlage");
    const legacyPatterns = [
      /<p class="radar-summary-label">(?:Kurzurteil|Wahrer Kern|Problem|Narrativ|Wirkungsrisiko|Live-Antwort)<\/p>/,
      /Host-Antworten[\s\S]*10 Sekunden[\s\S]*30 Sekunden[\s\S]*2 Minuten/,
      /<p class="hero-kicker">Wirkungspfad<\/p>/,
      /<p class="card-kicker">Wirkstoff<\/p>/,
      /<p class="hero-kicker">WÖk-Lösung<\/p>/,
    ];
    if (legacyPatterns.some((pattern) => pattern.test(html))) errors.push("legacy duplicate block noch sichtbar");
  }

  const status = firstV3Status(errors);
  if (status !== "checked_v3_facts_consequences_frame_solution") {
    warnings.push(`V3-Status: ${status}`);
  }
  return { status, errors, warnings };
}

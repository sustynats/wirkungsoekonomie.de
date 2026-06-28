(function () {
  const root = document.querySelector("[data-faktencheck-bot-root]");
  if (!root) return;

  const form = root.querySelector("[data-faktencheck-form]");
  const claimInput = root.querySelector("[data-faktencheck-claim]");
  const contextInput = root.querySelector("[data-faktencheck-context]");
  const typeSelect = root.querySelector("[data-faktencheck-type]");
  const output = root.querySelector("[data-faktencheck-output]");
  const samples = Array.from(root.querySelectorAll("[data-faktencheck-sample]"));

  const domainPlans = {
    general: {
      label: "Allgemeine öffentliche Aussage",
      sourceTypes: [
        "Originalaussage oder Primärkontext",
        "amtliche Daten oder Primärdokumente",
        "wissenschaftliche oder methodisch transparente Sekundärquellen",
        "mindestens eine unabhängige Kontextquelle",
      ],
      impactFocus: ["Mensch", "Planet", "Demokratie"],
      betterQuestion: "Welche Behauptung ist prüfbar, welche Folgerung wird daraus gezogen und was fehlt im Bild?",
    },
    climate: {
      label: "Klima, Energie, Ressourcen",
      sourceTypes: [
        "Umweltbundesamt, Destatis, Eurostat, IEA, IPCC oder Fachbehörde",
        "Originaldaten zum genannten Zeitraum und Ort",
        "Studie mit Bilanzgrenze, Annahmen und Datenstand",
        "Wirkungsradar-Karte, wenn bereits vorhanden",
      ],
      impactFocus: ["Planet", "Gesundheit", "Versorgung", "Kosten", "Demokratievertrauen"],
      betterQuestion: "Welche Bilanzgrenze wird gewählt: nur ein sichtbarer Teil oder der ganze Wirkpfad mit Folgekosten?",
    },
    social: {
      label: "Sozialstaat, Arbeit, Migration",
      sourceTypes: [
        "Destatis, IAB, BAMF, BMAS, Bundesagentur für Arbeit oder kommunale Daten",
        "Originalregelung oder offizieller Bericht",
        "Studien mit Zeitraum, Vergleichsgruppe und Definitionen",
        "Quellen zur Integrations-, Arbeitsmarkt- oder Verteilungswirkung",
      ],
      impactFocus: ["Teilhabe", "Arbeit", "Kommunen", "Vertrauen", "Zusammenhalt"],
      betterQuestion: "Wer wird sichtbar gemacht, wer verschwindet aus der Rechnung und welche Infrastruktur entscheidet über die Wirkung?",
    },
    democracy: {
      label: "Demokratie, Medien, Öffentlichkeit",
      sourceTypes: [
        "Originalpost, Transkript oder Primärzitat",
        "DSA-/EMFA-/Plattform- oder Transparenzdaten, wenn relevant",
        "Faktencheck-Organisation oder redaktionelle Korrekturquelle",
        "Fachliteratur zu Desinformation, Frame oder Diskursrisiko",
      ],
      impactFocus: ["Diskursfähigkeit", "Korrekturfähigkeit", "Vertrauen", "Rechtsstaatlichkeit"],
      betterQuestion: "Welche Orientierung gewinnt das Publikum, und welche Korrekturwege werden gestärkt oder geschwächt?",
    },
    highstakes: {
      label: "Recht, Medizin, Finanzen oder Sicherheit",
      sourceTypes: [
        "zuständige Behörde, Gesetzestext, Leitlinie oder Primärdokument",
        "aktuelle Fachquelle mit Datum",
        "qualifizierte Expert:innenprüfung vor Veröffentlichung",
        "klare Abgrenzung: keine Beratung, keine Einzelfallentscheidung",
      ],
      impactFocus: ["Schutz", "Fehlentscheidungsrisiko", "Vertrauen", "Rechts- oder Gesundheitssicherheit"],
      betterQuestion: "Welche fachliche Quelle ist zuständig, und welche Grenze hat eine öffentliche Kurzanalyse?",
      forceHumanReview: true,
    },
    breaking: {
      label: "Aktuelles Ereignis / Breaking News",
      sourceTypes: [
        "Originalmeldung und Uhrzeit",
        "mindestens zwei voneinander unabhängige aktuelle Quellen",
        "Update-Historie und Korrekturpfad",
        "klare Vorläufigkeitsmarkierung",
      ],
      impactFocus: ["Orientierung", "Fehlinformation", "Panikrisiko", "Korrekturgeschwindigkeit"],
      betterQuestion: "Was ist bestätigt, was ist unklar und welche Aussage wäre zum jetzigen Zeitpunkt zu stark?",
      forcePreliminary: true,
    },
  };

  const sampleClaims = {
    climate: "Deutschland verursacht nur zwei Prozent, also bringt Klimaschutz hier gar nichts.",
    social: "Migration kostet nur und belastet den Sozialstaat.",
    democracy: "Faktenchecker sind Zensur und wollen freie Meinung unterdrücken.",
    highstakes: "Dieses Mittel heilt die Krankheit sicher und man braucht keine Ärzt:innen mehr.",
    breaking: "Gerade wurde bewiesen, dass die Regierung alles vertuscht hat.",
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function unique(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function splitAtomicClaims(text) {
    const normalized = text
      .replace(/\s+/g, " ")
      .replace(/\b(weil|denn|dass|also|deshalb|darum|folglich)\b/gi, ". $1 ")
      .trim();
    return unique(
      normalized
        .split(/[.!?;:]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 8)
        .slice(0, 5),
    );
  }

  function detectFlags(text, type) {
    const lower = text.toLowerCase();
    const flags = [];
    if (text.trim().length < 24) flags.push("zu wenig Kontext");
    if (/\b(alle|immer|nie|jeder|keiner|nur|gar nichts|komplett)\b/i.test(text)) flags.push("starke Verallgemeinerung");
    if (/\b(lügen|gekauft|gesteuert|zensur|vertuscht|diktatur|verräter)\b/i.test(lower)) flags.push("Vertrauens- oder Delegitimierungsframe möglich");
    if (/\b(beweis|bewiesen|sicher|garantiert|eindeutig)\b/i.test(lower)) flags.push("hoher Gewissheitsanspruch");
    if (/\b(ausländer|migration|flüchtlinge|religion|queer|gender|juden|muslime)\b/i.test(lower)) flags.push("Minderheitenschutz prüfen");
    if (domainPlans[type]?.forceHumanReview) flags.push("Human Review Pflicht");
    if (domainPlans[type]?.forcePreliminary) flags.push("nur vorläufig einordnen");
    return unique(flags);
  }

  function frameHints(text) {
    const lower = text.toLowerCase();
    const hints = [];
    if (/\b(nur|gar nichts|bringt nichts|sinnlos)\b/i.test(lower)) hints.push("Ohnmachts- oder Aufschubframe");
    if (/\b(kostet|belastet|abzocke|steuergeld)\b/i.test(lower)) hints.push("Kosten- oder Verlustframe");
    if (/\b(lügen|gekauft|zensur|vertuscht|gesteuert)\b/i.test(lower)) hints.push("Misstrauens- oder Kontrollverlustframe");
    if (/\b(alle|immer|nie|jeder|keiner)\b/i.test(lower)) hints.push("Totalisierungsframe");
    return hints.length ? hints : ["Frame offen; Kontext und Verbreitungsraum prüfen"];
  }

  function reviewStatus(flags, type) {
    if (domainPlans[type]?.forceHumanReview || flags.includes("Minderheitenschutz prüfen")) return "Human Review Pflicht";
    if (domainPlans[type]?.forcePreliminary || flags.includes("zu wenig Kontext")) return "vorläufig / Prüfauftrag";
    return "Prüfauftrag mit normaler Redaktion";
  }

  function buildChecklist(text, context, type) {
    const plan = domainPlans[type] || domainPlans.general;
    const atomicClaims = splitAtomicClaims(text);
    const flags = detectFlags(text, type);
    const frames = frameHints(text);
    const status = reviewStatus(flags, type);
    const sourceTypes = plan.sourceTypes;
    const contextLine = context.trim() || "Kontext fehlt: Wo wurde die Aussage gemacht, von wem, wann und mit welchem Link?";

    return {
      claim: text.trim(),
      context: contextLine,
      domain: plan.label,
      status,
      atomicClaims,
      flags,
      frames,
      sourceTypes,
      impactFocus: plan.impactFocus,
      betterQuestion: plan.betterQuestion,
      discordPreview: [
        "**Status:** Prüfauftrag, noch kein Urteil.",
        `**Aussage:** ${text.trim()}`,
        `**Prüfbar zuerst:** ${(atomicClaims[0] || "Aussage in Einzelbehauptungen zerlegen.").replace(/\.$/, "")}.`,
        `**Quellenbedarf:** ${sourceTypes.slice(0, 2).join("; ")}.`,
        `**Frame-Hinweis:** ${frames[0]} (zu prüfen, keine Absichtsunterstellung).`,
        `**Bessere Frage:** ${plan.betterQuestion}`,
      ].join("\n"),
    };
  }

  function renderList(items) {
    return `<ul class="content-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function renderResult(result) {
    const json = JSON.stringify(
      {
        claim: result.claim,
        context: result.context,
        domain: result.domain,
        reviewStatus: result.status,
        atomicClaims: result.atomicClaims,
        riskFlags: result.flags,
        frameHints: result.frames,
        requiredSourceTypes: result.sourceTypes,
        impactFocus: result.impactFocus,
        betterQuestion: result.betterQuestion,
      },
      null,
      2,
    );

    output.innerHTML = `
      <article class="card factcheck-result-card">
        <p class="card-kicker">Ergebnis der Demo</p>
        <h3 class="card-title">${escapeHtml(result.status)}</h3>
        <p class="card-text">Diese Oberfläche erzeugt keinen fertigen Faktencheck. Sie zeigt, was der Bot vor einem belastbaren Urteil prüfen muss.</p>
        <div class="factcheck-status-row">
          <span>${escapeHtml(result.domain)}</span>
          <span>${result.flags.length ? `${result.flags.length} Prüfhinweise` : "keine Zusatzflagge"}</span>
        </div>
      </article>
      <div class="card-grid two factcheck-output-grid">
        <article class="card">
          <p class="card-kicker">1 · Prüfen</p>
          <h3 class="card-title">Prüfbare Einzelbehauptungen</h3>
          ${result.atomicClaims.length ? renderList(result.atomicClaims) : "<p class=\"card-text\">Die Eingabe ist noch zu kurz. Der Bot müsste zuerst nach Kontext fragen.</p>"}
        </article>
        <article class="card">
          <p class="card-kicker">2 · Quellen</p>
          <h3 class="card-title">Quellenplan</h3>
          ${renderList(result.sourceTypes)}
        </article>
        <article class="card">
          <p class="card-kicker">3 · Frame</p>
          <h3 class="card-title">Wahrscheinliche Rahmung</h3>
          ${renderList(result.frames.map((item) => `${item} - zu prüfen, ohne Absicht zu unterstellen`))}
        </article>
        <article class="card">
          <p class="card-kicker">4 · WÖk-Einordnung</p>
          <h3 class="card-title">Wirkungspotenzial statt Scheinsicherheit</h3>
          ${renderList(result.impactFocus.map((item) => `Wirkungsraum: ${item}`))}
          <p class="card-text"><strong>Bessere Frage:</strong> ${escapeHtml(result.betterQuestion)}</p>
        </article>
      </div>
      <article class="card factcheck-discord-card">
        <p class="card-kicker">Discord-Vorschau</p>
        <h3 class="card-title">Was der Bot sofort antworten dürfte</h3>
        <pre>${escapeHtml(result.discordPreview)}</pre>
        <button class="btn btn-secondary" type="button" data-copy-faktencheck="${escapeHtml(result.discordPreview)}">Discord-Text kopieren</button>
      </article>
      <details class="source-panel">
        <summary>Prüfauftrag als JSON</summary>
        <pre>${escapeHtml(json)}</pre>
      </details>
    `;

    output.querySelector("[data-copy-faktencheck]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (!(button instanceof HTMLButtonElement)) return;
      const text = button.getAttribute("data-copy-faktencheck") || "";
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Kopiert";
      } catch (_error) {
        button.textContent = "Kopieren nicht möglich";
      }
    });
  }

  samples.forEach((button) => {
    button.addEventListener("click", () => {
      const sample = button.getAttribute("data-faktencheck-sample") || "general";
      if (sampleClaims[sample]) {
        typeSelect.value = sample;
        claimInput.value = sampleClaims[sample];
        contextInput.value = "Demo-Eingabe ohne reale Quelle. Für ein Urteil wären Link, Datum und Originalkontext nötig.";
        claimInput.focus();
      }
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const claim = claimInput.value.trim();
    if (!claim) {
      output.innerHTML = '<article class="card"><p class="card-kicker">Eingabe fehlt</p><h3 class="card-title">Bitte zuerst eine Aussage einfügen.</h3></article>';
      return;
    }
    renderResult(buildChecklist(claim, contextInput.value || "", typeSelect.value || "general"));
  });
})();

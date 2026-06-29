(() => {
  const form = document.querySelector("[data-factcheck-form]");
  const result = document.querySelector("[data-factcheck-result]");
  if (!form || !result) return;

  const apiUrl = window.WOEK_FACTCHECK_API_URL || "https://130.162.217.58.sslip.io/api/factcheck";
  const apiBase = apiUrl.replace(/\/api\/factcheck\/?$/i, "");
  const unavailableMessage = "Der WÖk-Wirkungscheck ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.";
  const submitButton = form.querySelector('button[type="submit"]');
  let shareContext = null;
  let currentShareUrl = "";
  let progressTimer = null;
  let progressStartedAt = 0;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const claim = String(data.get("claim") || "").trim();
    const context = String(data.get("context") || "").trim();
    const domain = String(data.get("domain") || "").trim();

    if (!claim) {
      renderMessage("Aussage fehlt", "Bitte gib zuerst eine prüfbare Aussage ein.");
      return;
    }

    setBusy(true);
    renderLoading();
    startProgress();

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...communityAuthHeaders() },
        body: JSON.stringify({
          claim,
          context: context || undefined,
          domain: domain || undefined
        })
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || unavailableMessage);
      }

      renderFactcheck(payload.result, { claim }, "/api/factcheck");
    } catch (error) {
      renderMessage("Wirkungscheck gerade nicht möglich", error?.message || unavailableMessage);
    } finally {
      stopProgress();
      setBusy(false);
    }
  });

  function setBusy(isBusy) {
    if (!submitButton) return;
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Prüfung läuft..." : "Wirkungscheck starten";
  }

  function startProgress() {
    stopProgress();
    progressStartedAt = Date.now();
    updateProgress();
    progressTimer = window.setInterval(updateProgress, 1000);
  }

  function stopProgress() {
    if (progressTimer) {
      window.clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function updateProgress() {
    const progress = result.querySelector("[data-woek-progress]");
    if (!progress) return;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - progressStartedAt) / 1000));
    const plan = progressPlan();
    const checkpoints = [0, 6, 18, 38, 62];
    const activeIndex = checkpoints.reduce((current, checkpoint, index) => (elapsedSeconds >= checkpoint ? index : current), 0);
    const percent = Math.min(92, 12 + elapsedSeconds * 1.12);
    const fill = progress.querySelector("[data-progress-fill]");
    const time = progress.querySelector("[data-progress-time]");
    const label = progress.querySelector("[data-progress-label]");
    const bar = progress.querySelector("[role='progressbar']");

    if (fill) fill.style.width = `${percent}%`;
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(percent)));
    if (time) time.textContent = `läuft seit ${formatElapsed(elapsedSeconds)}`;
    if (label) label.textContent = plan[activeIndex] || "Prüfung läuft";

    progress.querySelectorAll("[data-progress-step]").forEach((item) => {
      const index = Number(item.getAttribute("data-progress-step") || "0");
      item.classList.toggle("is-done", index < activeIndex);
      item.classList.toggle("is-active", index === activeIndex);
    });
  }

  function renderLoading() {
    shareContext = null;
    currentShareUrl = "";
    replaceResult([
      node("p", "hero-kicker", "Prüfung läuft"),
      node("h3", "", "Die Antwort wird vorbereitet."),
      node("p", "", "Das kann einen Moment dauern, weil Quellenlage, Wahrheitsgehalt, Frame und Wirkungspfad gemeinsam geprüft werden."),
      progressPanel()
    ]);
  }

  function renderMessage(title, message) {
    shareContext = null;
    currentShareUrl = "";
    replaceResult([node("p", "hero-kicker", "Hinweis"), node("h3", "", title), node("p", "", message)]);
  }

  function renderFactcheck(item, request, route) {
    if (!item) {
      renderMessage("Keine Antwort", "Der Dienst hat keine verwertbare Antwort geliefert.");
      return;
    }

    const answer = item.directAnswer || item.rebuttal || item.summary || "";
    const sections = shareSections([
      ["Reframing", item.reframing || "Die bessere Rahmung ist: Welche konkrete Behauptung wird durch welche Quelle getragen?"],
      ["Kurzurteil", `${verdictLabel(item.verdict)}. ${item.summary || ""}`.trim()],
      ["Wahrheitsgehalt & Datenstand", [
        truthText(item.truthCheck),
        item.dataStatus ? `Datenstand: ${item.dataStatus}` : ""
      ].filter(Boolean).join("\n")],
      ["Sprache, Rhetorik & Frame", [
        languageText(item.languageAnalysis),
        rhetoricText(item.rhetoricAnalysis),
        frameText(item.frame)
      ].filter(Boolean).join("\n\n")],
      ["Quellen", listText(item.sources, (source) => `${source.title || source.url || "Quelle"} - ${source.note || source.supports || source.url || ""}`)],
      ["Prüfbare Einzelbehauptungen", listText(item.atomicClaims, (claim) => `${claim.claim || "Einzelbehauptung offen"}: ${verdictLabel(claim.verdict)} (${claim.confidence || "niedrig"}). ${claim.explanation || ""}`)],
      ["WÖk-Einordnung", listText(item.impactNotes, (impact) => `${impact.label || "Wirkungspotenzial"}: ${impact.explanation || ""}`)],
      ["Bessere Frage", item.betterQuestion],
      ["Grenzen", listText(item.limits, (value) => value)]
    ]);
    setShareContext({
      target: "factcheck",
      title: "WÖk-Wirkungscheck",
      question: request?.claim || "",
      answer,
      sections,
      sources: normalizeShareSources(item.sources),
      route
    });

    replaceResult([
      node("p", "hero-kicker", statusLabel(item.status)),
      node("h3", "", "Antwort"),
      node("p", "factcheck-result-summary", answer),
      block("Reframing", item.reframing || "Die bessere Rahmung ist: Welche konkrete Behauptung wird durch welche Quelle getragen?"),
      block("Kurzurteil", `${verdictLabel(item.verdict)}. ${item.summary || ""}`.trim()),
      detailBlock("Wahrheitsgehalt & Datenstand", [
        truthSection(item.truthCheck),
        metaLine("Datenstand", item.dataStatus)
      ]),
      detailBlock("Sprache, Rhetorik & Frame", [
        languageSection(item.languageAnalysis),
        rhetoricSection(item.rhetoricAnalysis),
        frameSection(item.frame)
      ]),
      detailBlock("Quellen & Einzelbehauptungen", [
        section("Quellen", item.sources, renderSource),
        section("Prüfbare Einzelbehauptungen", item.atomicClaims, renderAtomicClaim)
      ]),
      detailBlock("WÖk-Einordnung & Grenzen", [
        section("Wirkungsökonomische Einordnung", item.impactNotes, renderImpact),
        block("Bessere Frage", item.betterQuestion),
        section("Grenzen", item.limits, (value) => node("li", "", value))
      ])
    ]);
  }

  function frameSection(frame) {
    if (!frame) return null;
    const wrapper = node("div", "factcheck-result-section");
    wrapper.append(node("h4", "", "Frame-Hinweis"));
    wrapper.append(node("p", "", `${frame.label}: ${frame.explanation}`));
    wrapper.append(metaLine("Warum er wirkt", frame.whyItWorks));
    wrapper.append(metaLine("Wirkungspotenzial", frame.impact));
    wrapper.append(metaLine("Mögliche Funktion", frame.likelyFunction));
    wrapper.append(metaLine("Antwortstrategie", frame.responseStrategy));
    wrapper.append(metaLine("Grenze", frame.caution));
    return wrapper;
  }

  function languageSection(language) {
    if (!language) return null;
    const wrapper = node("div", "factcheck-result-section");
    wrapper.append(node("h4", "", "Sprache & Narrativ"));
    wrapper.append(metaLine("Sprachwahl", language.wording));
    wrapper.append(metaLine("Narrativ", language.narrative));
    wrapper.append(metaLine("Sprachbild", language.metaphor));
    wrapper.append(metaLine("Entmenschlichungsrisiko", language.dehumanizationRisk));
    wrapper.append(metaLine("Nahegelegte Handlung", language.impliedAction));
    wrapper.append(metaLine("Wirkungspotenzial", language.impactPotential));
    wrapper.append(metaLine("Bessere Sprache", language.counterLanguage));
    return wrapper;
  }

  function rhetoricSection(rhetoric) {
    if (!rhetoric) return null;
    const wrapper = node("div", "factcheck-result-section");
    wrapper.append(node("h4", "", "Rhetorik & Psychologie"));
    wrapper.append(node("p", "", rhetoric.summary || "Rhetorische und psychologische Muster im Originalkontext prüfen."));
    const list = node("ol", "factcheck-result-list");
    (Array.isArray(rhetoric.moves) ? rhetoric.moves : []).forEach((move) => {
      const li = node("li", "");
      li.append(node("strong", "", move.label || "Muster offen"));
      li.append(metaLine("Mechanismus", move.mechanism));
      li.append(metaLine("Wirkungspotenzial", move.effectPotential));
      li.append(metaLine("Antwort", move.response));
      list.append(li);
    });
    if (list.children.length) wrapper.append(list);
    wrapper.append(metaLine("Antwortstrategie", rhetoric.responseStrategy));
    wrapper.append(metaLine("Grenze", rhetoric.caution));
    return wrapper;
  }

  function truthSection(truthCheck) {
    if (!truthCheck) return null;
    return block(
      "Wahrheitsgehalt",
      `${verdictLabel(truthCheck.verdict)} (${truthCheck.confidence || "niedrig"}). ${truthCheck.explanation || "Die Beleglage ist offen."}`
    );
  }

  function detailBlock(title, children) {
    const nodes = children.filter(Boolean);
    if (!nodes.length) return null;
    const wrapper = node("details", "factcheck-result-section factcheck-result-details");
    wrapper.append(node("summary", "", title), ...nodes);
    return wrapper;
  }

  function progressPanel() {
    const plan = progressPlan();
    const wrapper = node("section", "woek-progress");
    wrapper.setAttribute("data-woek-progress", "");

    const meta = node("div", "woek-progress__meta");
    const label = node("span", "", plan[0]);
    const time = node("span", "", "läuft seit 0:00");
    label.setAttribute("data-progress-label", "");
    time.setAttribute("data-progress-time", "");
    meta.append(label, time);

    const bar = node("div", "woek-progress__bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", "Arbeitsfortschritt");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", "12");
    const fill = node("div", "woek-progress__fill");
    fill.setAttribute("data-progress-fill", "");
    bar.append(fill);

    const steps = node("ol", "woek-progress__steps");
    plan.forEach((step, index) => {
      const item = node("li", index === 0 ? "is-active" : "", step);
      item.setAttribute("data-progress-step", String(index));
      steps.append(item);
    });

    wrapper.append(meta, bar, steps, node("p", "woek-progress__hint", "Orientierungsbalken: Die genaue Dauer hängt von Quellenlage, Kontext und KI-Dienst ab."));
    return wrapper;
  }

  function progressPlan() {
    return ["Eingabe sichern", "WÖk-Wissensbasis abgleichen", "Quellenlage und Wahrheitsgehalt prüfen", "Sprache, Frame und Wirkungspfad analysieren", "Antwort und Grenzen formulieren"];
  }

  function formatElapsed(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  function section(title, items, renderItem) {
    const wrapper = node("div", "factcheck-result-section");
    wrapper.append(node("h4", "", title));
    const list = node("ol", "factcheck-result-list");
    (Array.isArray(items) ? items : []).forEach((item) => list.append(renderItem(item)));
    if (!list.children.length) list.append(node("li", "", "Keine belastbare Angabe."));
    wrapper.append(list);
    return wrapper;
  }

  function block(title, text) {
    const wrapper = node("div", "factcheck-result-section");
    wrapper.append(node("h4", "", title));
    wrapper.append(node("p", "", text || "Keine belastbare Angabe."));
    return wrapper;
  }

  function renderAtomicClaim(item) {
    const li = node("li", "");
    li.append(node("strong", "", item.claim || "Einzelbehauptung offen"));
    li.append(node("span", "", `Urteil: ${verdictLabel(item.verdict)} (${item.confidence || "niedrig"})`));
    li.append(node("p", "", item.explanation || "Die Beleglage ist offen."));
    return li;
  }

  function renderSource(item) {
    const li = node("li", "");
    const link = node("a", "", item.title || item.url || "Quelle");
    link.href = item.url || "#";
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    li.append(link);
    li.append(node("span", "", item.publisher || "Quelle"));
    li.append(node("p", "", item.note || item.supports || "Belegfunktion offen."));
    return li;
  }

  function renderImpact(item) {
    const li = node("li", "");
    li.append(node("strong", "", item.label || "Wirkungspotenzial"));
    li.append(node("p", "", item.explanation || "Wirkungspotenzial, Wirkungsrisiko und belegte Wirkung getrennt betrachten."));
    return li;
  }

  function metaLine(label, value) {
    const p = node("p", "factcheck-result-meta");
    p.append(node("strong", "", `${label}: `));
    p.append(document.createTextNode(value || "offen"));
    return p;
  }

  function resultActionsSection() {
    const wrapper = node("section", "woek-result-actions");
    if (!shareContext) {
      wrapper.hidden = true;
      return wrapper;
    }

    const actions = node("div", "woek-result-actions__buttons");
    const statusText = node("small", "woek-result-actions__status", "");
    const link = node("button", "", "Link erstellen");
    const copy = node("button", "", "Antwort kopieren");
    const pdf = node("button", "", "PDF exportieren");

    [link, copy, pdf].forEach((button) => {
      button.type = "button";
    });
    link.addEventListener("click", () => createShareLink(statusText, link));
    copy.addEventListener("click", () => copyShareMarkdown(statusText, copy));
    pdf.addEventListener("click", () => exportSharePdf(statusText));

    actions.append(link, copy, pdf);
    wrapper.append(node("p", "hero-kicker", "Teilen"), actions, statusText);
    return wrapper;
  }

  async function createShareLink(statusText, button) {
    if (!shareContext) return;
    button.disabled = true;
    statusText.textContent = currentShareUrl ? "Link wird kopiert..." : "Link wird erstellt...";

    try {
      if (!currentShareUrl) {
        const response = await fetch(`${apiBase}/api/share-result`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...communityAuthHeaders() },
          body: JSON.stringify(shareContext)
        });
        const payload = await response.json().catch(() => undefined);
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "Der Link konnte gerade nicht erstellt werden.");
        }
        currentShareUrl = payload.url || shareableUrl(payload.id);
      }
      await copyText(currentShareUrl);
      statusText.textContent = "Link erstellt und kopiert.";
    } catch (error) {
      statusText.textContent = error?.message || "Der Link konnte gerade nicht erstellt werden.";
    } finally {
      button.disabled = false;
    }
  }

  async function copyShareMarkdown(statusText, button) {
    if (!shareContext) return;
    button.disabled = true;
    statusText.textContent = "Antwort wird kopiert...";
    try {
      await copyText(buildShareMarkdown(shareContext, currentShareUrl));
      statusText.textContent = "Antwort als Markdown kopiert.";
    } catch {
      statusText.textContent = "Kopieren ist in diesem Browser gerade nicht möglich.";
    } finally {
      button.disabled = false;
    }
  }

  function exportSharePdf(statusText) {
    if (!shareContext) return;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      statusText.textContent = "PDF-Fenster konnte nicht geöffnet werden.";
      return;
    }
    popup.document.write(sharePdfHtml(shareContext, currentShareUrl));
    popup.document.close();
    popup.focus();
    statusText.textContent = "PDF-Ansicht geöffnet.";
    window.setTimeout(() => popup.print(), 250);
  }

  function setShareContext(context) {
    const sections = shareSections((context.sections || []).map((entry) => [entry.title, entry.body]));
    const normalized = {
      target: context.target || "factcheck",
      title: String(context.title || "WÖk-Wirkungscheck").trim(),
      question: String(context.question || "").trim(),
      answer: String(context.answer || "").trim(),
      sections,
      sources: normalizeShareSources(context.sources),
      route: String(context.route || "").trim()
    };
    shareContext = normalized.question && (normalized.answer || normalized.sections.length) ? normalized : null;
    currentShareUrl = "";
  }

  function normalizeShareSources(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 8).map((item) => ({
      title: String(item?.title || item?.url || "Quelle").trim(),
      url: String(item?.url || "").trim(),
      excerpt: String(item?.excerpt || item?.note || item?.supports || item?.publisher || "").trim()
    })).filter((item) => item.url);
  }

  function shareSections(entries) {
    return entries
      .map(([title, body]) => ({ title: String(title || "").trim(), body: String(body || "").trim() }))
      .filter((entry) => entry.title && entry.body)
      .slice(0, 12);
  }

  function listText(items, render) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map((item, index) => `${index + 1}. ${render(item)}`).join("\n");
  }

  function truthText(truthCheck) {
    if (!truthCheck) return "";
    return `Wahrheitsgehalt: ${verdictLabel(truthCheck.verdict)} (${truthCheck.confidence || "niedrig"}). ${truthCheck.explanation || "Die Beleglage ist offen."}`;
  }

  function languageText(language) {
    if (!language) return "";
    return [
      `Sprache: ${language.wording || "offen"}`,
      `Narrativ: ${language.narrative || "offen"}`,
      `Sprachbild: ${language.metaphor || "offen"}`,
      `Entmenschlichungsrisiko: ${language.dehumanizationRisk || "offen"}`,
      `Nahegelegte Handlung: ${language.impliedAction || "offen"}`,
      `Wirkungspotenzial: ${language.impactPotential || "offen"}`,
      `Bessere Sprache: ${language.counterLanguage || "offen"}`
    ].join("\n");
  }

  function rhetoricText(rhetoric) {
    if (!rhetoric) return "";
    const moves = Array.isArray(rhetoric.moves) && rhetoric.moves.length
      ? rhetoric.moves.map((move, index) => `${index + 1}. ${move.label || "Muster offen"}: ${move.mechanism || "Mechanismus offen"} Wirkungspotenzial: ${move.effectPotential || "offen"} Antwort: ${move.response || "offen"}`).join("\n")
      : "";
    return [
      rhetoric.summary || "Rhetorische und psychologische Muster im Originalkontext prüfen.",
      moves,
      rhetoric.responseStrategy ? `Antwortstrategie: ${rhetoric.responseStrategy}` : "",
      rhetoric.caution ? `Grenze: ${rhetoric.caution}` : ""
    ].filter(Boolean).join("\n");
  }

  function frameText(frame) {
    if (!frame) return "";
    return [
      `${frame.label || "Frame"}: ${frame.explanation || "Einordnung offen"}`,
      frame.whyItWorks ? `Warum er wirkt: ${frame.whyItWorks}` : "",
      frame.impact ? `Wirkungspotenzial: ${frame.impact}` : "",
      frame.likelyFunction ? `Mögliche Funktion: ${frame.likelyFunction}` : "",
      frame.responseStrategy ? `Antwortstrategie: ${frame.responseStrategy}` : "",
      frame.caution ? `Grenze: ${frame.caution}` : ""
    ].filter(Boolean).join("\n");
  }

  function buildShareMarkdown(context, url = "") {
    const lines = [`# ${context.title || "WÖk-Ergebnis"}`];
    if (context.question) lines.push("", `**Ausgangsfrage:** ${context.question}`);
    if (context.answer) lines.push("", "## Antwort", context.answer);
    context.sections.forEach((entry) => {
      lines.push("", `## ${entry.title}`, entry.body);
    });
    if (context.sources.length) {
      lines.push("", "## Quellen");
      context.sources.forEach((source) => {
        lines.push(`- [${source.title || source.url}](${source.url})${source.excerpt ? ` - ${source.excerpt}` : ""}`);
      });
    }
    if (url) lines.push("", `Link: ${url}`);
    return lines.join("\n");
  }

  function sharePdfHtml(context, url = "") {
    const sourceItems = context.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title || source.url)}</a>${source.excerpt ? `<p>${escapeHtml(source.excerpt)}</p>` : ""}</li>`).join("");
    const sectionItems = context.sections.map((entry) => `<section><h2>${escapeHtml(entry.title)}</h2><p>${textToHtml(entry.body)}</p></section>`).join("");
    return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(context.title || "WÖk-Ergebnis")}</title>
  <style>
    body { color: #070b1b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.55; margin: 36px; }
    h1, h2 { font-family: Georgia, "Times New Roman", serif; line-height: 1.1; }
    h1 { font-size: 34px; margin-bottom: 18px; }
    h2 { border-top: 1px solid #ddd8cc; font-size: 22px; margin-top: 24px; padding-top: 16px; }
    p, li { font-size: 14px; }
    .question { background: #f7f3eb; border: 1px solid #ddd8cc; padding: 14px; }
    a { color: #0f5d43; }
    @page { margin: 18mm; }
  </style>
</head>
<body>
  <h1>${escapeHtml(context.title || "WÖk-Ergebnis")}</h1>
  ${context.question ? `<p class="question"><strong>Ausgangsfrage:</strong><br>${textToHtml(context.question)}</p>` : ""}
  ${context.answer ? `<section><h2>Antwort</h2><p>${textToHtml(context.answer)}</p></section>` : ""}
  ${sectionItems}
  ${sourceItems ? `<section><h2>Quellen</h2><ol>${sourceItems}</ol></section>` : ""}
  ${url ? `<p><strong>Link:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` : ""}
</body>
</html>`;
  }

  function shareableUrl(id) {
    const value = String(id || "").trim();
    if (!value) return "";
    return `${window.location.origin}/app/?share=${encodeURIComponent(value)}`;
  }

  async function copyText(text) {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(text);
  }

  function textToHtml(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function escapeHtml(text) {
    return String(text || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function replaceResult(children) {
    result.replaceChildren(...children.filter(Boolean), resultActionsSection());
  }

  function node(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function verdictLabel(value) {
    return (
      {
        kein_urteil: "kein Urteil",
        zutreffend: "zutreffend",
        falsch: "falsch",
        irrefuehrend: "irrefuehrend",
        unbelegt: "unbelegt",
        gemischt: "gemischt"
      }[value] || "kein Urteil"
    );
  }

  function statusLabel(value) {
    return (
      {
        geprueft: "geprüft",
        vorlaeufig: "vorlaeufig",
        review_noetig: "Review nötig",
        nicht_pruefbar: "nicht prüfbar"
      }[value] || "Ergebnis"
    );
  }

  function communityAuthHeaders() {
    return window.WoekCommunityAuth?.authHeaders?.() || {};
  }
})();

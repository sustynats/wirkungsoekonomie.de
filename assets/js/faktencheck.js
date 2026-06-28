(() => {
  const form = document.querySelector("[data-factcheck-form]");
  const result = document.querySelector("[data-factcheck-result]");
  if (!form || !result) return;

  const apiUrl = window.WOEK_FACTCHECK_API_URL || "https://130.162.217.58.sslip.io/api/factcheck";
  const unavailableMessage = "Der Faktencheck-Dienst ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.";
  const submitButton = form.querySelector('button[type="submit"]');

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

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim,
          context: context || undefined,
          domain: domain || undefined
        })
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok) {
        throw new Error(unavailableMessage);
      }

      renderFactcheck(payload.result);
    } catch (error) {
      renderMessage("Faktencheck gerade nicht möglich", unavailableMessage);
    } finally {
      setBusy(false);
    }
  });

  function setBusy(isBusy) {
    if (!submitButton) return;
    submitButton.disabled = isBusy;
    submitButton.textContent = isBusy ? "Prüfung läuft..." : "Faktencheck starten";
  }

  function renderLoading() {
    replaceResult([
      node("p", "hero-kicker", "Prüfung"),
      node("h3", "", "Erst entsteht die Antwort, dann die Begründung."),
      node("p", "", "Das kann einen Moment dauern, weil der Dienst Quellenlage, Wahrheitsgehalt, Frame und Wirkungspfad gemeinsam prüft.")
    ]);
  }

  function renderMessage(title, message) {
    replaceResult([node("p", "hero-kicker", "Hinweis"), node("h3", "", title), node("p", "", message)]);
  }

  function renderFactcheck(item) {
    if (!item) {
      renderMessage("Keine Antwort", "Der Dienst hat keine verwertbare Antwort geliefert.");
      return;
    }

    replaceResult([
      node("p", "hero-kicker", statusLabel(item.status)),
      node("h3", "", "Antwort"),
      node("p", "factcheck-result-summary", item.directAnswer || item.rebuttal || item.summary),
      block("Reframing", item.reframing || "Die bessere Rahmung ist: Welche konkrete Behauptung wird durch welche Quelle getragen?"),
      block("Kurzurteil", `${verdictLabel(item.verdict)}. ${item.summary || ""}`.trim()),
      truthSection(item.truthCheck),
      metaLine("Datenstand", item.dataStatus),
      frameSection(item.frame),
      section("Wirkungsökonomische Einordnung", item.impactNotes, renderImpact),
      section("Quellen", item.sources, renderSource),
      section("Prüfbare Einzelbehauptungen", item.atomicClaims, renderAtomicClaim),
      block("Bessere Frage", item.betterQuestion),
      section("Grenzen", item.limits, (value) => node("li", "", value))
    ]);
  }

  function frameSection(frame) {
    if (!frame) return document.createDocumentFragment();
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

  function truthSection(truthCheck) {
    if (!truthCheck) return document.createDocumentFragment();
    return block(
      "Wahrheitsgehalt",
      `${verdictLabel(truthCheck.verdict)} (${truthCheck.confidence || "niedrig"}). ${truthCheck.explanation || "Die Beleglage ist offen."}`
    );
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

  function replaceResult(children) {
    result.replaceChildren(...children.filter(Boolean));
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
})();

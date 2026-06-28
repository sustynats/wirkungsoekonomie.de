(() => {
  const root = document.querySelector("[data-woek-app]");
  if (!root) return;

  const apiBase = window.WOEK_API_BASE || "https://130.162.217.58.sslip.io";
  const unavailableMessage = "Der KI-Dienst ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.";
  const feedbackUnavailableMessage = "Feedback konnte gerade nicht gespeichert werden.";
  const clientId = getClientId();
  const installDismissKey = "woek_app_install_dismissed";
  const tabs = Array.from(root.querySelectorAll("[data-app-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-app-panel]"));
  const result = root.querySelector("[data-app-result]");
  const status = root.querySelector("[data-app-status]");
  const pwaStatus = root.querySelector("[data-pwa-status]");
  const installPanel = root.querySelector("[data-pwa-install]");
  const installCopy = root.querySelector("[data-pwa-install-copy]");
  const installButton = root.querySelector("[data-pwa-install-button]");
  const installDismiss = root.querySelector("[data-pwa-install-dismiss]");
  let deferredInstallPrompt = null;
  let feedbackContext = null;

  initPwa();

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.appTab || "factcheck"));
  });

  root.querySelector("[data-factcheck-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitFactcheck(event.currentTarget);
  });

  root.querySelector("[data-woek-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitWoek(event.currentTarget);
  });

  root.querySelector("[data-product-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitProduct(event.currentTarget);
  });

  root.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => {
      const label = input.closest(".woek-app-file")?.querySelector("[data-file-name]");
      if (label) label.textContent = input.files?.[0]?.name || "Kein Bild ausgewählt";
    });
  });

  const initialMode = new URLSearchParams(window.location.search).get("mode");
  setMode(["factcheck", "woek", "product"].includes(initialMode) ? initialMode : "factcheck");

  function initPwa() {
    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);

    installDismiss?.addEventListener("click", () => {
      window.localStorage.setItem(installDismissKey, "1");
      hideInstallPanel();
    });

    installButton?.addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        window.localStorage.setItem(installDismissKey, "1");
        hideInstallPanel();
        return;
      }

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => undefined);
      deferredInstallPrompt = null;
      hideInstallPanel();
    });

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      showInstallPanel("Lege die WÖk-App auf Startbildschirm oder Dock. Sie startet dann ohne Browserrahmen.", "Installieren");
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      window.localStorage.setItem(installDismissKey, "1");
      hideInstallPanel();
      updatePwaStatus("Installiert");
    });

    if (isStandaloneDisplay()) {
      updatePwaStatus(navigator.onLine ? "App · online" : "App · offline");
    } else if (isManualInstallBrowser()) {
      showInstallPanel(
        "macOS Safari: Ablage > Zum Dock hinzufügen. iPhone/iPad: Teilen > Zum Home-Bildschirm. Chrome/Edge zeigen hier sonst einen Install-Button.",
        "Verstanden",
        true
      );
    }

    registerServiceWorker();
  }

  async function registerServiceWorker() {
    const canRegister = "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost");
    if (!canRegister) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            showInstallPanel("Eine neue Version ist bereit. Aktualisiere die App, um sie zu laden.", "Aktualisieren", false, true);
            deferredInstallPrompt = {
              prompt: () => worker.postMessage({ type: "SKIP_WAITING" }),
              userChoice: Promise.resolve()
            };
          }
        });
      });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!window.__woekAppReloading) {
          window.__woekAppReloading = true;
          window.location.reload();
        }
      });
    } catch {
      updatePwaStatus(navigator.onLine ? "Online" : "Offline");
    }
  }

  async function submitFactcheck(form) {
    const data = new FormData(form);
    const claim = read(data, "claim");
    if (!claim) {
      renderNotice("Aussage fehlt", "Bitte gib eine prüfbare Aussage ein.");
      return;
    }

    await submitJson("/api/factcheck", {
      claim,
      context: read(data, "context") || undefined,
      domain: read(data, "domain") || undefined,
      evidenceUrl: read(data, "evidenceUrl") || undefined,
      evidenceText: read(data, "evidenceText") || undefined,
      ...(await imagePayload(form))
    }, renderFactcheck);
  }

  async function submitWoek(form) {
    const data = new FormData(form);
    const question = read(data, "question");
    if (!question) {
      renderNotice("Frage fehlt", "Bitte gib eine Frage ein.");
      return;
    }

    await submitJson("/api/woek-ai", {
      question,
      context: read(data, "context") || undefined
    }, renderWoek);
  }

  async function submitProduct(form) {
    const data = new FormData(form);
    const product = read(data, "product");
    if (!product) {
      renderNotice("Produkt fehlt", "Bitte gib ein Produkt oder einen Link ein.");
      return;
    }

    await submitJson("/api/product-check", {
      product,
      claim: read(data, "claim") || undefined,
      url: read(data, "url") || undefined,
      context: read(data, "context") || undefined,
      evidenceUrl: read(data, "url") || undefined,
      evidenceText: read(data, "evidenceText") || undefined,
      ...(await imagePayload(form))
    }, renderProduct);
  }

  async function submitJson(path, body, render) {
    if (!navigator.onLine) {
      renderNotice("Offline", "Die Prüfung braucht eine Internetverbindung.");
      return;
    }

    setBusy(true);
    renderLoading();

    try {
      const response = await fetch(`${apiBase}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WOEK-Client-ID": clientId
        },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok) {
        throw new Error(unavailableMessage);
      }
      render(payload, body, path);
    } catch (error) {
      renderNotice("Prüfung gerade nicht möglich", unavailableMessage);
    } finally {
      setBusy(false);
    }
  }

  function renderFactcheck(payload, request, route) {
    const item = payload.result;
    feedbackContext = {
      target: "factcheck",
      question: request?.claim || "",
      answer: item?.directAnswer || item?.rebuttal || item?.summary || "",
      sources: item?.sources || [],
      route,
      model: item?.model || payload.model || ""
    };
    replaceResult([
      kicker(statusLabel(item?.status)),
      heading("Antwort"),
      paragraph(item?.directAnswer || item?.rebuttal || item?.summary),
      section("Reframing", item?.reframing),
      section("Wahrheitsgehalt", item?.truthCheck ? `${verdictLabel(item.truthCheck.verdict)} (${item.truthCheck.confidence}). ${item.truthCheck.explanation}` : ""),
      section("Frame", frameText(item?.frame)),
      listSection("WÖk-Einordnung", item?.impactNotes, (note) => `${note.label}: ${note.explanation}`),
      sourceSection(item?.sources),
      listSection("Grenzen", item?.limits, (value) => value)
    ]);
  }

  function renderWoek(payload, request, route) {
    feedbackContext = {
      target: "woek-ai",
      question: request?.question || "",
      answer: payload.answer || "",
      sources: payload.sources || [],
      route,
      model: payload.model || ""
    };
    replaceResult([
      kicker(statusLabel(payload.status)),
      heading("Antwort"),
      paragraph(payload.answer),
      section("Warum das trägt", payload.explanation),
      section("WÖk-Einordnung", payload.woekLens),
      sourceSection(payload.sources),
      listSection("Grenzen", payload.limits, (value) => value)
    ]);
  }

  function renderProduct(payload, request, route) {
    const item = payload.result;
    feedbackContext = {
      target: "product-check",
      question: request?.product || request?.claim || "",
      answer: item?.directAnswer || item?.summary || "",
      sources: item?.sources || [],
      route,
      model: item?.model || payload.model || ""
    };
    replaceResult([
      kicker(statusLabel(item?.status)),
      heading("Antwort"),
      paragraph(item?.directAnswer || item?.summary),
      section("Produktversprechen", item?.productPromise),
      section("Wahrheitsgehalt", item?.truthCheck ? `${verdictLabel(item.truthCheck.verdict)} (${item.truthCheck.confidence}). ${item.truthCheck.explanation}` : ""),
      section("Wirkungsscore", impactScoreText(item?.impactScore)),
      listSection("Wirkungsdimensionen", item?.dimensions, dimensionText),
      section("Reverse Merit Order", rmoText(item?.reverseMeritOrder)),
      listSection("Unternehmen: gut sichtbar", item?.companyAssessment?.strengths, companySignalText),
      listSection("Unternehmen: schwach oder offen", item?.companyAssessment?.weaknesses, companySignalText),
      listSection("Offene Unternehmensfragen", item?.companyAssessment?.openQuestions, (value) => value),
      listSection("SDG-Bezug", item?.sdgAssessment?.sdgs, sdgText),
      listSection("SDG+-Bezug", item?.sdgAssessment?.sdgPlus, sdgText),
      listSection("SDG-Zielkonflikte", item?.sdgAssessment?.conflicts, (value) => value),
      section("Datenqualität", dataQualityText(item?.dataQuality)),
      section("Frame", frameText(item?.frame)),
      listSection("WÖk-Einordnung", item?.impactNotes, (note) => `${note.label}: ${note.explanation}`),
      section("Reframing", item?.reframing),
      sourceSection(item?.sources),
      listSection("Grenzen", item?.limits, (value) => value)
    ]);
  }

  function renderLoading() {
    feedbackContext = null;
    replaceResult([
      kicker("Prüfung"),
      heading("Antwort wird vorbereitet."),
      paragraph("Quellen, Frame und WÖk-Einordnung werden gemeinsam geprüft.")
    ]);
  }

  function renderNotice(title, text) {
    feedbackContext = null;
    replaceResult([kicker("Hinweis"), heading(title), paragraph(text)]);
  }

  async function imagePayload(form) {
    const file = form.querySelector('input[type="file"]')?.files?.[0];
    if (!file) return {};
    if (!file.type.startsWith("image/")) {
      throw new Error("Der Beleg muss ein Bild sein.");
    }
    if (file.size > 8_000_000) {
      throw new Error("Das Bild ist zu groß. Bitte Screenshot oder Foto kleiner zuschneiden.");
    }

    const image = await compressImage(file);
    return {
      imageData: image.base64,
      imageMime: image.mime,
      imageDetail: "low"
    };
  }

  async function compressImage(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Das Bild konnte nicht vorbereitet werden.");
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
      if (!blob) throw new Error("Das Bild konnte nicht komprimiert werden.");
      const dataUrl = await blobToDataUrl(blob);
      return { base64: dataUrl.replace(/^data:image\/jpeg;base64,/, ""), mime: "image/jpeg" };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Das Bildformat konnte nicht gelesen werden. Bitte Text kopieren oder JPEG/PNG nutzen."));
      image.src = url;
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Das Bild konnte nicht gelesen werden."));
      reader.readAsDataURL(blob);
    });
  }

  function setMode(mode) {
    tabs.forEach((tab) => {
      const active = tab.dataset.appTab === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.appPanel !== mode;
    });
    renderNotice("Bereit", mode === "woek" ? "Stelle eine Frage zur Wirkungsökonomie." : "Gib Text, Link oder Bildbeleg ein.");
  }

  function setBusy(isBusy) {
    root.querySelectorAll('button[type="submit"]').forEach((button) => {
      button.disabled = isBusy;
      button.textContent = isBusy ? "Prüfung läuft..." : button.dataset.label || "Prüfen";
    });
    if (status) status.textContent = isBusy ? "Prüfung läuft" : "Bereit";
  }

  function showInstallPanel(copy, buttonLabel, manual = false, force = false) {
    if (!installPanel || (!force && window.localStorage.getItem(installDismissKey) === "1") || isStandaloneDisplay()) return;
    if (installCopy) installCopy.textContent = copy;
    if (installButton) {
      installButton.textContent = buttonLabel;
      installButton.dataset.manualInstall = manual ? "true" : "false";
    }
    installPanel.hidden = false;
  }

  function hideInstallPanel() {
    if (installPanel) installPanel.hidden = true;
  }

  function updateConnectivity() {
    const online = navigator.onLine;
    updatePwaStatus(isStandaloneDisplay() ? `App · ${online ? "online" : "offline"}` : online ? "Online" : "Offline");
  }

  function updatePwaStatus(text) {
    if (pwaStatus) pwaStatus.textContent = text;
  }

  function isStandaloneDisplay() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function isManualInstallBrowser() {
    const ua = navigator.userAgent;
    const isAppleEngine = /Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR|Firefox/i.test(ua);
    return isAppleEngine;
  }

  function replaceResult(nodes) {
    if (!result) return;
    result.replaceChildren(...nodes.filter(Boolean), feedbackSection());
  }

  function feedbackSection() {
    const wrapper = node("section", "woek-app-feedback");
    if (!feedbackContext) {
      wrapper.hidden = true;
      return wrapper;
    }

    const label = node("p", "", "War diese Antwort hilfreich?");
    const actions = node("div", "woek-app-feedback-actions");
    const statusText = node("small", "", "");
    const up = node("button", "", "Hilfreich");
    const down = node("button", "", "Nicht hilfreich");

    up.type = "button";
    down.type = "button";
    up.setAttribute("aria-label", "Antwort als hilfreich bewerten");
    down.setAttribute("aria-label", "Antwort als nicht hilfreich bewerten");
    up.addEventListener("click", () => sendFeedback("up", statusText, [up, down]));
    down.addEventListener("click", () => sendFeedback("down", statusText, [up, down]));
    actions.append(up, down);
    wrapper.append(label, actions, statusText);
    return wrapper;
  }

  async function sendFeedback(rating, statusText, buttons) {
    if (!feedbackContext) return;
    buttons.forEach((button) => { button.disabled = true; });
    statusText.textContent = "Wird gespeichert...";

    try {
      const response = await fetch(`${apiBase}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WOEK-Client-ID": clientId
        },
        body: JSON.stringify({
          ...feedbackContext,
          rating,
          sources: normalizeFeedbackSources(feedbackContext.sources)
        })
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok) {
        throw new Error(feedbackUnavailableMessage);
      }
      statusText.textContent = rating === "down" ? "Danke. Diese Antwort landet im Review." : "Danke. Bewertung gespeichert.";
    } catch (error) {
      buttons.forEach((button) => { button.disabled = false; });
      statusText.textContent = feedbackUnavailableMessage;
    }
  }

  function normalizeFeedbackSources(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 8).map((item) => ({
      title: item.title || item.url || "Quelle",
      url: item.url || "",
      excerpt: item.excerpt || item.note || item.supports || ""
    })).filter((item) => item.url);
  }

  function section(title, text) {
    const value = String(text || "").trim();
    if (!value) return null;
    const wrapper = node("section", "woek-app-result-section");
    wrapper.append(node("h3", "", title), paragraph(value));
    return wrapper;
  }

  function listSection(title, items, map) {
    if (!Array.isArray(items) || !items.length) return null;
    const wrapper = node("section", "woek-app-result-section");
    const list = node("ol", "woek-app-result-list");
    items.forEach((item) => list.append(node("li", "", map(item))));
    wrapper.append(node("h3", "", title), list);
    return wrapper;
  }

  function sourceSection(items) {
    if (!Array.isArray(items) || !items.length) return null;
    const wrapper = node("section", "woek-app-result-section");
    const list = node("ol", "woek-app-result-list");
    items.forEach((item) => {
      const li = node("li", "");
      const link = node("a", "", item.title || item.url || "Quelle");
      link.href = item.url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      li.append(link, node("p", "", item.note || item.excerpt || item.supports || "Belegfunktion offen."));
      list.append(li);
    });
    wrapper.append(node("h3", "", "Quellen"), list);
    return wrapper;
  }

  function frameText(frame) {
    if (!frame) return "";
    return [
      `${frame.label}: ${frame.explanation}`,
      frame.whyItWorks ? `Warum er wirkt: ${frame.whyItWorks}` : "",
      frame.impact ? `Wirkungspotenzial: ${frame.impact}` : "",
      frame.responseStrategy ? `Antwortstrategie: ${frame.responseStrategy}` : ""
    ].filter(Boolean).join("\n");
  }

  function impactScoreText(score) {
    if (!score) return "";
    return `${score.score}/5 - ${score.label} (${score.confidence}). ${score.explanation}`;
  }

  function dimensionText(dimension) {
    const rmo = dimension?.rmoRelevant ? " [Reverse-Merit-Order-relevant]" : "";
    return `${dimension?.label || "Wirkungsdimension"}: ${dimension?.score ?? 0}/5${rmo}. Beleg: ${dimension?.evidence || "offen"}. Risiko: ${dimension?.risk || "offen"}`;
  }

  function rmoText(rmo) {
    if (!rmo) return "";
    return [
      `Status: ${rmo.triggered ? "ausgelöst" : "nicht hart ausgelöst / vorläufig"}`,
      `Engpass: ${rmo.limitingDimension}`,
      `Warum: ${rmo.reason}`,
      `Folge: ${rmo.consequence}`,
      `Besserungspfad: ${rmo.improvementPath}`
    ].filter(Boolean).join("\n");
  }

  function companySignalText(signal) {
    return `${signal?.label || "Signal"}: ${signal?.interpretation || "Einordnung offen"} (${signal?.evidence || "Beleglage offen"})`;
  }

  function sdgText(item) {
    return `${item?.id || "SDG"} ${item?.title || ""}: ${item?.direction || "unclear"}. ${item?.relation || "Bezug offen"}`;
  }

  function dataQualityText(dataQuality) {
    if (!dataQuality) return "";
    const missing = Array.isArray(dataQuality.missingData) ? dataQuality.missingData.join(", ") : "offen";
    return `Klasse ${dataQuality.level}: ${dataQuality.explanation}\nFehlt: ${missing}`;
  }

  function kicker(text) {
    return node("p", "hero-kicker", text || "Ergebnis");
  }

  function heading(text) {
    return node("h2", "", text || "Antwort");
  }

  function paragraph(text) {
    return node("p", "", text || "Keine belastbare Angabe.");
  }

  function node(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function read(formData, name) {
    return String(formData.get(name) || "").trim();
  }

  function verdictLabel(value) {
    return ({
      kein_urteil: "kein Urteil",
      zutreffend: "zutreffend",
      falsch: "falsch",
      irrefuehrend: "irreführend",
      unbelegt: "unbelegt",
      gemischt: "gemischt"
    })[value] || "kein Urteil";
  }

  function statusLabel(value) {
    return ({
      geprueft: "geprüft",
      vorlaeufig: "vorläufig",
      checked: "geprüft",
      answered: "beantwortet",
      partial: "vorläufig",
      review_noetig: "Review nötig",
      needs_review: "Review nötig",
      nicht_pruefbar: "nicht prüfbar",
      not_checkable: "nicht prüfbar",
      not_answerable: "nicht beantwortbar"
    })[value] || "Ergebnis";
  }

  function getClientId() {
    const key = "woek_app_client_id";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const value = `woek-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
    window.localStorage.setItem(key, value);
    return value;
  }
})();

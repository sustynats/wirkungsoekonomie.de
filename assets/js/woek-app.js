(() => {
  const root = document.querySelector("[data-woek-app]");
  if (!root) return;

  const siteLocale = document.documentElement.lang === "en" ? "en" : "de";
  const i18n = (deText, enText) => (siteLocale === "en" ? enText : deText);
  const apiBase = window.WOEK_API_BASE || "https://130.162.217.58.sslip.io";
  const unavailableMessage = i18n("Der KI-Dienst ist vorübergehend nicht verfügbar. Bitte versuche es später erneut.", "The AI service is temporarily unavailable. Please try again later.");
  const feedbackUnavailableMessage = i18n("Feedback konnte gerade nicht gespeichert werden.", "Feedback could not be saved right now.");
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
  let shareContext = null;
  let currentShareUrl = "";
  let progressTimer = null;
  let progressStartedAt = 0;
  let progressPath = "/api/factcheck";

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
      if (label) label.textContent = input.files?.[0]?.name || i18n("Kein Bild ausgewählt", "No image selected");
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get("mode");
  setMode(["factcheck", "woek", "product"].includes(initialMode) ? initialMode : "factcheck");
  const sharedResultId = urlParams.get("share");
  if (sharedResultId) void loadSharedResult(sharedResultId);

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
      showInstallPanel(i18n("Lege die WÖk-App auf Startbildschirm oder Dock. Sie startet dann ohne Browserrahmen.", "Add the WÖk App to your home screen or dock. It will then start without the browser frame."), i18n("Installieren", "Install"));
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      window.localStorage.setItem(installDismissKey, "1");
      hideInstallPanel();
      updatePwaStatus(i18n("Installiert", "Installed"));
    });

    if (isStandaloneDisplay()) {
      updatePwaStatus(navigator.onLine ? "App · online" : "App · offline");
    } else if (isManualInstallBrowser()) {
      showInstallPanel(
        i18n("macOS Safari: Ablage > Zum Dock hinzufügen. iPhone/iPad: Teilen > Zum Home-Bildschirm. Chrome/Edge zeigen hier sonst einen Install-Button.", "macOS Safari: File > Add to Dock. iPhone/iPad: Share > Add to Home Screen. Chrome/Edge usually show an install button here."),
        i18n("Verstanden", "Understood"),
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
            showInstallPanel(i18n("Eine neue Version ist bereit. Aktualisiere die App, um sie zu laden.", "A new version is ready. Refresh the app to load it."), i18n("Aktualisieren", "Refresh"), false, true);
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
      renderNotice(i18n("Aussage fehlt", "Statement missing"), i18n("Bitte gib eine prüfbare Aussage ein.", "Please enter a checkable statement."));
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
      renderNotice(i18n("Frage fehlt", "Question missing"), i18n("Bitte gib eine Frage ein.", "Please enter a question."));
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
      renderNotice(i18n("Produkt fehlt", "Product missing"), i18n("Bitte gib ein Produkt oder einen Link ein.", "Please enter a product or product link."));
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
      renderNotice("Offline", i18n("Die Prüfung braucht eine Internetverbindung.", "The check needs an internet connection."));
      return;
    }

    setBusy(true);
    renderLoading(path);
    startProgress(path);

    try {
      const response = await fetch(`${apiBase}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WOEK-Client-ID": clientId,
          ...communityAuthHeaders()
        },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || unavailableMessage);
      }
      render(payload, body, path);
    } catch (error) {
      renderNotice(i18n("Prüfung gerade nicht möglich", "Check currently unavailable"), error?.message || unavailableMessage);
    } finally {
      stopProgress();
      setBusy(false);
    }
  }

  function renderFactcheck(payload, request, route) {
    const item = payload.result;
    const answer = item?.directAnswer || item?.rebuttal || item?.summary || "";
    const sections = shareSections([
      ["Reframing", item?.reframing],
      ["Kurzurteil", item?.summary],
      ["Wahrheitsgehalt", item?.truthCheck ? `${verdictLabel(item.truthCheck.verdict)} (${item.truthCheck.confidence}). ${item.truthCheck.explanation}` : ""],
      ["Sprache & Narrativ", languageText(item?.languageAnalysis)],
      ["Rhetorik & Psychologie", rhetoricText(item?.rhetoricAnalysis)],
      ["Frame", frameText(item?.frame)],
      ["WÖk-Einordnung", listText(item?.impactNotes, (note) => `${note.label}: ${note.explanation}`)],
      ["Bessere Frage", item?.betterQuestion],
      ["Grenzen", listText(item?.limits, (value) => value)]
    ]);
    feedbackContext = {
      target: "factcheck",
      question: request?.claim || "",
      answer,
      sources: item?.sources || [],
      route,
      model: item?.model || payload.model || ""
    };
    setShareContext({
      target: "factcheck",
      title: i18n("WÖk-Wirkungscheck", "WÖk Impact Check"),
      question: request?.claim || "",
      answer,
      sections,
      sources: normalizeShareSources(item?.sources),
      route
    });
    replaceResult([
      kicker(statusLabel(item?.status)),
      heading(i18n("Antwort", "Answer")),
      paragraph(answer),
      section("Reframing", item?.reframing),
      section("Kurzurteil", item?.summary),
      detailsSection(i18n("Prüfdetails öffnen", "Open check details"), [
        section("Wahrheitsgehalt", item?.truthCheck ? `${verdictLabel(item.truthCheck.verdict)} (${item.truthCheck.confidence}). ${item.truthCheck.explanation}` : ""),
        section("Sprache & Narrativ", languageText(item?.languageAnalysis)),
        section("Rhetorik & Psychologie", rhetoricText(item?.rhetoricAnalysis)),
        section("Frame", frameText(item?.frame)),
        listSection("WÖk-Einordnung", item?.impactNotes, (note) => `${note.label}: ${note.explanation}`),
        section("Bessere Frage", item?.betterQuestion),
        sourceSection(item?.sources),
        listSection("Grenzen", item?.limits, (value) => value)
      ])
    ]);
  }

  function renderWoek(payload, request, route) {
    const sections = shareSections([
      ["Warum das trägt", payload.explanation],
      ["WÖk-Einordnung", payload.woekLens],
      ["Grenzen", listText(payload.limits, (value) => value)]
    ]);
    feedbackContext = {
      target: "woek-ai",
      question: request?.question || "",
      answer: payload.answer || "",
      sources: payload.sources || [],
      route,
      model: payload.model || ""
    };
    setShareContext({
      target: "woek-ai",
      title: i18n("Frag die WÖk", "Ask WÖk"),
      question: request?.question || "",
      answer: payload.answer || "",
      sections,
      sources: normalizeShareSources(payload.sources),
      route
    });
    replaceResult([
      kicker(statusLabel(payload.status)),
      heading(i18n("Antwort", "Answer")),
      paragraph(payload.answer),
      section("Warum das trägt", payload.explanation),
      section("WÖk-Einordnung", payload.woekLens),
      sourceSection(payload.sources),
      listSection("Grenzen", payload.limits, (value) => value)
    ]);
  }

  function renderProduct(payload, request, route) {
    const item = payload.result;
    const answer = item?.directAnswer || item?.summary || "";
    const sections = shareSections([
      ["Produktversprechen", item?.productPromise],
      ["Wahrheitsgehalt", item?.truthCheck ? `${verdictLabel(item.truthCheck.verdict)} (${item.truthCheck.confidence}). ${item.truthCheck.explanation}` : ""],
      ["Wirkungsscore", impactScoreText(item?.impactScore)],
      ["Wirkungsdimensionen", listText(item?.dimensions, dimensionText)],
      ["Reverse Merit Order", rmoText(item?.reverseMeritOrder)],
      ["Unternehmen: gut sichtbar", listText(item?.companyAssessment?.strengths, companySignalText)],
      ["Unternehmen: schwach oder offen", listText(item?.companyAssessment?.weaknesses, companySignalText)],
      ["Offene Unternehmensfragen", listText(item?.companyAssessment?.openQuestions, (value) => value)],
      ["SDG-Bezug", listText(item?.sdgAssessment?.sdgs, sdgText)],
      ["SDG+-Bezug", listText(item?.sdgAssessment?.sdgPlus, sdgText)],
      ["SDG-Zielkonflikte", listText(item?.sdgAssessment?.conflicts, (value) => value)],
      ["Datenqualität", dataQualityText(item?.dataQuality)],
      ["Frame", frameText(item?.frame)],
      ["WÖk-Einordnung", listText(item?.impactNotes, (note) => `${note.label}: ${note.explanation}`)],
      ["Reframing", item?.reframing],
      ["Grenzen", listText(item?.limits, (value) => value)]
    ]);
    feedbackContext = {
      target: "product-check",
      question: request?.product || request?.claim || "",
      answer,
      sources: item?.sources || [],
      route,
      model: item?.model || payload.model || ""
    };
    setShareContext({
      target: "product-check",
      title: i18n("Produktcheck", "Product check"),
      question: request?.product || request?.claim || "",
      answer,
      sections,
      sources: normalizeShareSources(item?.sources),
      route
    });
    replaceResult([
      kicker(statusLabel(item?.status)),
      heading(i18n("Antwort", "Answer")),
      paragraph(answer),
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

  function languageText(language) {
    if (!language) return "";
    return [
      `Sprachwahl: ${language.wording || "offen"}`,
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
      ? rhetoric.moves
          .map(
            (move, index) =>
              `${index + 1}. ${move.label || "Muster offen"}: ${move.mechanism || "Mechanismus offen"} Wirkungspotenzial: ${move.effectPotential || "offen"} Antwort: ${move.response || "offen"}`
          )
          .join("\n")
      : "Keine belastbar benennbaren Muster ohne Originalkontext.";
    return [
      rhetoric.summary || "Rhetorische und psychologische Muster im Originalkontext prüfen.",
      moves,
      `Antwortstrategie: ${rhetoric.responseStrategy || "offen"}`,
      `Grenze: ${rhetoric.caution || "Musteranalyse ist keine Personenbewertung."}`
    ].join("\n");
  }

  function renderLoading(path) {
    feedbackContext = null;
    shareContext = null;
    currentShareUrl = "";
    replaceResult([
      kicker(i18n("Prüfung läuft", "Check running")),
      heading(i18n("Antwort wird vorbereitet.", "Preparing answer.")),
      paragraph(i18n("Quellen, Frame und WÖk-Einordnung werden gemeinsam geprüft.", "Sources, framing and WÖk context are being checked together.")),
      progressPanel(path)
    ]);
  }

  function renderNotice(title, text) {
    feedbackContext = null;
    shareContext = null;
    currentShareUrl = "";
    replaceResult([kicker(i18n("Hinweis", "Notice")), heading(title), paragraph(text)]);
  }

  async function imagePayload(form) {
    const file = form.querySelector('input[type="file"]')?.files?.[0];
    if (!file) return {};
    if (!file.type.startsWith("image/")) {
      throw new Error(i18n("Der Beleg muss ein Bild sein.", "The evidence file must be an image."));
    }
    if (file.size > 8_000_000) {
      throw new Error(i18n("Das Bild ist zu groß. Bitte Screenshot oder Foto kleiner zuschneiden.", "The image is too large. Please crop the screenshot or photo."));
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
      if (!context) throw new Error(i18n("Das Bild konnte nicht vorbereitet werden.", "The image could not be prepared."));
      context.drawImage(image, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
      if (!blob) throw new Error(i18n("Das Bild konnte nicht komprimiert werden.", "The image could not be compressed."));
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
      image.onerror = () => reject(new Error(i18n("Das Bildformat konnte nicht gelesen werden. Bitte Text kopieren oder JPEG/PNG nutzen.", "The image format could not be read. Please copy text or use JPEG/PNG.")));
      image.src = url;
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error(i18n("Das Bild konnte nicht gelesen werden.", "The image could not be read.")));
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
    renderNotice(i18n("Bereit", "Ready"), mode === "woek" ? i18n("Stelle eine Frage zur Wirkungsökonomie.", "Ask a question about Wirkungsökonomie.") : i18n("Gib Text, Link oder Bildbeleg ein.", "Enter text, a link or image evidence."));
  }

  function setBusy(isBusy) {
    root.querySelectorAll('button[type="submit"]').forEach((button) => {
      button.disabled = isBusy;
      button.textContent = isBusy ? i18n("Prüfung läuft...", "Check running...") : button.dataset.label || i18n("Prüfen", "Check");
    });
    if (status) status.textContent = isBusy ? i18n("Prüfung läuft", "Check running") : i18n("Bereit", "Ready");
  }

  function startProgress(path) {
    stopProgress();
    progressPath = path;
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
    const progress = result?.querySelector("[data-woek-progress]");
    if (!progress) return;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - progressStartedAt) / 1000));
    const plan = progressPlanFor(progressPath);
    const checkpoints = progressCheckpoints(plan.length);
    const activeIndex = checkpoints.reduce((current, checkpoint, index) => (elapsedSeconds >= checkpoint ? index : current), 0);
    const percent = Math.min(92, 12 + elapsedSeconds * 1.12);
    const fill = progress.querySelector("[data-progress-fill]");
    const time = progress.querySelector("[data-progress-time]");
    const label = progress.querySelector("[data-progress-label]");
    const bar = progress.querySelector("[role='progressbar']");

    if (fill) fill.style.width = `${percent}%`;
    if (bar) bar.setAttribute("aria-valuenow", String(Math.round(percent)));
    if (time) time.textContent = `${i18n("läuft seit", "running for")} ${formatElapsed(elapsedSeconds)}`;
    if (label) label.textContent = plan[activeIndex] || i18n("Prüfung läuft", "Check running");
    if (status) status.textContent = `${i18n("Prüfung läuft", "Check running")} · ${formatElapsed(elapsedSeconds)}`;

    progress.querySelectorAll("[data-progress-step]").forEach((item) => {
      const index = Number(item.getAttribute("data-progress-step") || "0");
      item.classList.toggle("is-done", index < activeIndex);
      item.classList.toggle("is-active", index === activeIndex);
    });
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
    result.replaceChildren(...nodes.filter(Boolean), resultActionsSection(), feedbackSection());
  }

  function resultActionsSection() {
    const wrapper = node("section", "woek-result-actions");
    if (!shareContext) {
      wrapper.hidden = true;
      return wrapper;
    }

    const actions = node("div", "woek-result-actions__buttons");
    const statusText = node("small", "woek-result-actions__status", "");
    const link = node("button", "", i18n("Link erstellen", "Create link"));
    const copy = node("button", "", i18n("Antwort kopieren", "Copy answer"));
    const pdf = node("button", "", i18n("PDF exportieren", "Export PDF"));

    [link, copy, pdf].forEach((button) => {
      button.type = "button";
    });
    link.addEventListener("click", () => createShareLink(statusText, link));
    copy.addEventListener("click", () => copyShareMarkdown(statusText, copy));
    pdf.addEventListener("click", () => exportSharePdf(statusText));

    actions.append(link, copy, pdf);
    wrapper.append(node("p", "hero-kicker", i18n("Teilen", "Share")), actions, statusText);
    return wrapper;
  }

  async function createShareLink(statusText, button) {
    if (!shareContext) return;
    button.disabled = true;
    statusText.textContent = currentShareUrl ? i18n("Link wird kopiert...", "Copying link...") : i18n("Link wird erstellt...", "Creating link...");

    try {
      if (!currentShareUrl) {
        const response = await fetch(`${apiBase}/api/share-result`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-WOEK-Client-ID": clientId,
            ...communityAuthHeaders()
          },
          body: JSON.stringify(shareContext)
        });
        const payload = await response.json().catch(() => undefined);
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || i18n("Der Link konnte gerade nicht erstellt werden.", "The link could not be created right now."));
        }
        currentShareUrl = payload.url || shareableUrl(payload.id);
      }
      await copyText(currentShareUrl);
      statusText.textContent = i18n("Link erstellt und kopiert.", "Link created and copied.");
    } catch (error) {
      statusText.textContent = error?.message || i18n("Der Link konnte gerade nicht erstellt werden.", "The link could not be created right now.");
    } finally {
      button.disabled = false;
    }
  }

  async function copyShareMarkdown(statusText, button) {
    if (!shareContext) return;
    button.disabled = true;
    statusText.textContent = i18n("Antwort wird kopiert...", "Copying answer...");
    try {
      await copyText(buildShareMarkdown(shareContext, currentShareUrl));
      statusText.textContent = i18n("Antwort als Markdown kopiert.", "Answer copied as Markdown.");
    } catch {
      statusText.textContent = i18n("Kopieren ist in diesem Browser gerade nicht möglich.", "Copying is not available in this browser right now.");
    } finally {
      button.disabled = false;
    }
  }

  function exportSharePdf(statusText) {
    if (!shareContext) return;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      statusText.textContent = i18n("PDF-Fenster konnte nicht geöffnet werden.", "PDF window could not be opened.");
      return;
    }
    popup.document.write(sharePdfHtml(shareContext, currentShareUrl));
    popup.document.close();
    popup.focus();
    statusText.textContent = i18n("PDF-Ansicht geöffnet.", "PDF view opened.");
    window.setTimeout(() => popup.print(), 250);
  }

  async function loadSharedResult(id) {
    const value = String(id || "").trim();
    if (!/^sr-[0-9a-f-]{36}$/i.test(value)) {
      renderNotice(i18n("Geteiltes Ergebnis nicht gefunden", "Shared result not found"), i18n("Der Link ist unvollständig oder abgelaufen.", "The link is incomplete or expired."));
      return;
    }

    if (status) status.textContent = i18n("Geteiltes Ergebnis wird geladen", "Loading shared result");
    feedbackContext = null;
    shareContext = null;
    currentShareUrl = "";
    replaceResult([kicker(i18n("Geteiltes Ergebnis", "Shared result")), heading(i18n("Wird geladen.", "Loading.")), paragraph(i18n("Das gespeicherte Ergebnis wird geholt.", "The saved result is being loaded."))]);

    try {
      const response = await fetch(`${apiBase}/api/share-result/${encodeURIComponent(value)}`, {
        headers: {
          "X-WOEK-Client-ID": clientId,
          ...communityAuthHeaders()
        }
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok || !payload.result) {
        throw new Error(payload?.error || i18n("Dieses geteilte Ergebnis wurde nicht gefunden oder ist abgelaufen.", "This shared result was not found or has expired."));
      }
      renderSharedResult(payload.result);
      if (status) status.textContent = i18n("Geteiltes Ergebnis", "Shared result");
    } catch (error) {
      renderNotice(i18n("Geteiltes Ergebnis nicht verfügbar", "Shared result unavailable"), error?.message || i18n("Dieses Ergebnis kann gerade nicht geladen werden.", "This result cannot be loaded right now."));
    }
  }

  function renderSharedResult(item) {
    const sections = shareSections((Array.isArray(item?.sections) ? item.sections : []).map((entry) => [entry.title, entry.body]));
    setShareContext({
      target: item?.target || "factcheck",
      title: item?.title || i18n("WÖk-Ergebnis", "WÖk result"),
      question: item?.question || "",
      answer: item?.answer || "",
      sections,
      sources: normalizeShareSources(item?.sources),
      route: item?.route || ""
    });
    currentShareUrl = shareableUrl(item?.id);
    feedbackContext = null;
    replaceResult([
      kicker(i18n("Geteiltes Ergebnis", "Shared result")),
      heading(item?.title || i18n("WÖk-Ergebnis", "WÖk result")),
      section(i18n("Ausgangsfrage", "Initial question"), item?.question),
      paragraph(item?.answer || ""),
      ...sections.map((entry) => section(entry.title, entry.body)),
      sourceSection(item?.sources)
    ]);
  }

  function feedbackSection() {
    const wrapper = node("section", "woek-app-feedback");
    if (!feedbackContext) {
      wrapper.hidden = true;
      return wrapper;
    }

    const label = node("p", "", i18n("War diese Antwort hilfreich?", "Was this answer helpful?"));
    const actions = node("div", "woek-app-feedback-actions");
    const statusText = node("small", "", "");
    const up = node("button", "", i18n("Hilfreich", "Helpful"));
    const down = node("button", "", i18n("Nicht hilfreich", "Not helpful"));

    up.type = "button";
    down.type = "button";
    up.setAttribute("aria-label", i18n("Antwort als hilfreich bewerten", "Rate answer as helpful"));
    down.setAttribute("aria-label", i18n("Antwort als nicht hilfreich bewerten", "Rate answer as not helpful"));
    up.addEventListener("click", () => sendFeedback("up", statusText, [up, down]));
    down.addEventListener("click", () => sendFeedback("down", statusText, [up, down]));
    actions.append(up, down);
    wrapper.append(label, actions, statusText);
    return wrapper;
  }

  async function sendFeedback(rating, statusText, buttons) {
    if (!feedbackContext) return;
    buttons.forEach((button) => { button.disabled = true; });
    statusText.textContent = i18n("Wird gespeichert...", "Saving...");

    try {
      const response = await fetch(`${apiBase}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WOEK-Client-ID": clientId,
          ...communityAuthHeaders()
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
      statusText.textContent = rating === "down" ? i18n("Danke. Diese Antwort landet im Review.", "Thanks. This answer will go into review.") : i18n("Danke. Bewertung gespeichert.", "Thanks. Rating saved.");
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

  function normalizeShareSources(items) {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 8).map((item) => ({
      title: String(item?.title || item?.url || "Quelle").trim(),
      url: String(item?.url || "").trim(),
      excerpt: String(item?.excerpt || item?.note || item?.supports || item?.publisher || "").trim()
    })).filter((item) => item.url);
  }

  function setShareContext(context) {
    const sections = shareSections((context.sections || []).map((entry) => [entry.title, entry.body]));
    const normalized = {
      target: context.target || "factcheck",
      title: String(context.title || "WÖk-Ergebnis").trim(),
      question: String(context.question || "").trim(),
      answer: String(context.answer || "").trim(),
      sections,
      sources: normalizeShareSources(context.sources),
      route: String(context.route || "").trim()
    };
    shareContext = normalized.question && (normalized.answer || normalized.sections.length) ? normalized : null;
    currentShareUrl = "";
  }

  function shareSections(entries) {
    return entries
      .map(([title, body]) => ({ title: String(title || "").trim(), body: String(body || "").trim() }))
      .filter((entry) => entry.title && entry.body)
      .slice(0, 12);
  }

  function listText(items, map) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map((item, index) => `${index + 1}. ${map(item)}`).join("\n");
  }

  function buildShareMarkdown(context, url = "") {
    const lines = [`# ${context.title || i18n("WÖk-Ergebnis", "WÖk result")}`];
    if (context.question) lines.push("", `**${i18n("Ausgangsfrage", "Initial question")}:** ${context.question}`);
    if (context.answer) lines.push("", `## ${i18n("Antwort", "Answer")}`, context.answer);
    context.sections.forEach((entry) => {
      lines.push("", `## ${entry.title}`, entry.body);
    });
    if (context.sources.length) {
      lines.push("", `## ${i18n("Quellen", "Sources")}`);
      context.sources.forEach((source) => {
        lines.push(`- [${source.title || source.url}](${source.url})${source.excerpt ? ` - ${source.excerpt}` : ""}`);
      });
    }
    if (url) lines.push("", `${i18n("Link", "Link")}: ${url}`);
    return lines.join("\n");
  }

  function sharePdfHtml(context, url = "") {
    const sourceItems = context.sources.map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title || source.url)}</a>${source.excerpt ? `<p>${escapeHtml(source.excerpt)}</p>` : ""}</li>`).join("");
    const sectionItems = context.sections.map((entry) => `<section><h2>${escapeHtml(entry.title)}</h2><p>${textToHtml(entry.body)}</p></section>`).join("");
    return `<!doctype html>
<html lang="${siteLocale}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(context.title || i18n("WÖk-Ergebnis", "WÖk result"))}</title>
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
  <h1>${escapeHtml(context.title || i18n("WÖk-Ergebnis", "WÖk result"))}</h1>
  ${context.question ? `<p class="question"><strong>${i18n("Ausgangsfrage", "Initial question")}:</strong><br>${textToHtml(context.question)}</p>` : ""}
  ${context.answer ? `<section><h2>${i18n("Antwort", "Answer")}</h2><p>${textToHtml(context.answer)}</p></section>` : ""}
  ${sectionItems}
  ${sourceItems ? `<section><h2>${i18n("Quellen", "Sources")}</h2><ol>${sourceItems}</ol></section>` : ""}
  ${url ? `<p><strong>${i18n("Link", "Link")}:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` : ""}
</body>
</html>`;
  }

  function shareableUrl(id) {
    const value = String(id || "").trim();
    if (!value) return "";
    const url = new URL(window.location.href);
    url.pathname = "/app/";
    url.search = `?share=${encodeURIComponent(value)}`;
    url.hash = "";
    return url.toString();
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
      const link = node("a", "", item.title || item.url || i18n("Quelle", "Source"));
      link.href = item.url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      li.append(link, node("p", "", item.note || item.excerpt || item.supports || i18n("Belegfunktion offen.", "Evidence function open.")));
      list.append(li);
    });
    wrapper.append(node("h3", "", i18n("Quellen", "Sources")), list);
    return wrapper;
  }

  function detailsSection(title, items) {
    const nodes = items.filter(Boolean);
    if (!nodes.length) return null;
    const wrapper = node("details", "woek-app-result-section woek-app-result-details");
    wrapper.append(node("summary", "", title), ...nodes);
    return wrapper;
  }

  function progressPanel(path) {
    const plan = progressPlanFor(path);
    const wrapper = node("section", "woek-progress");
    wrapper.setAttribute("data-woek-progress", "");

    const meta = node("div", "woek-progress__meta");
    const label = node("span", "", plan[0] || i18n("Prüfung läuft", "Check running"));
    const time = node("span", "", `${i18n("läuft seit", "running for")} 0:00`);
    label.setAttribute("data-progress-label", "");
    time.setAttribute("data-progress-time", "");
    meta.append(label, time);

    const bar = node("div", "woek-progress__bar");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", i18n("Arbeitsfortschritt", "Work progress"));
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

    wrapper.append(meta, bar, steps, node("p", "woek-progress__hint", i18n("Orientierungsbalken: Die genaue Dauer hängt von Quellenlage, Bild/Textbeleg und KI-Dienst ab.", "Orientation bar: the exact duration depends on source situation, image/text evidence and AI service.")));
    return wrapper;
  }

  function progressPlanFor(path) {
    if (path === "/api/woek-ai") {
      return siteLocale === "en" ? ["Read question", "Compare WÖk knowledge base", "Bundle matching sources", "Formulate answer in plain language", "Check limits"] : ["Frage lesen", "WÖk-Wissensbasis abgleichen", "Passende Quellen bündeln", "Antwort in einfacher Sprache formulieren", "Grenzen prüfen"];
    }
    if (path === "/api/product-check") {
      return siteLocale === "en" ? ["Capture product data", "Check public evidence", "Assess impact dimensions", "Classify reverse merit order", "Formulate answer and limits"] : ["Produktdaten sichern", "Öffentliche Hinweise prüfen", "Wirkungsdimensionen bewerten", "Reverse-Merit-Order einordnen", "Antwort und Grenzen formulieren"];
    }
    return siteLocale === "en" ? ["Capture input", "Compare WÖk knowledge base", "Check source situation and truth status", "Analyze language, framing and impact pathway", "Formulate answer and limits"] : ["Eingabe sichern", "WÖk-Wissensbasis abgleichen", "Quellenlage und Wahrheitsgehalt prüfen", "Sprache, Frame und Wirkungspfad analysieren", "Antwort und Grenzen formulieren"];
  }

  function progressCheckpoints(length) {
    return [0, 6, 18, 38, 62].slice(0, Math.max(1, length));
  }

  function formatElapsed(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
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

  function communityAuthHeaders() {
    return window.WoekCommunityAuth?.authHeaders?.() || {};
  }
})();

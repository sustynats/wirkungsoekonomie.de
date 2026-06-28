(() => {
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  const root = document.querySelector("[data-woek-app]");
  if (!root) return;

  const apiBase = window.WOEK_API_BASE || "https://130.162.217.58.sslip.io";
  const clientId = getClientId();
  const tabs = Array.from(root.querySelectorAll("[data-app-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-app-panel]"));
  const result = root.querySelector("[data-app-result]");
  const status = root.querySelector("[data-app-status]");

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
        throw new Error(payload?.error || "Der Dienst ist gerade nicht erreichbar.");
      }
      render(payload);
    } catch (error) {
      renderNotice(
        "Prüfung gerade nicht möglich",
        error instanceof Error ? error.message : "Der Dienst ist gerade nicht erreichbar."
      );
    } finally {
      setBusy(false);
    }
  }

  function renderFactcheck(payload) {
    const item = payload.result;
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

  function renderWoek(payload) {
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

  function renderProduct(payload) {
    const item = payload.result;
    replaceResult([
      kicker(statusLabel(item?.status)),
      heading("Antwort"),
      paragraph(item?.directAnswer || item?.summary),
      section("Produktversprechen", item?.productPromise),
      section("Wahrheitsgehalt", item?.truthCheck ? `${verdictLabel(item.truthCheck.verdict)} (${item.truthCheck.confidence}). ${item.truthCheck.explanation}` : ""),
      section("Frame", frameText(item?.frame)),
      listSection("WÖk-Einordnung", item?.impactNotes, (note) => `${note.label}: ${note.explanation}`),
      section("Reframing", item?.reframing),
      sourceSection(item?.sources),
      listSection("Grenzen", item?.limits, (value) => value)
    ]);
  }

  function renderLoading() {
    replaceResult([
      kicker("Prüfung"),
      heading("Antwort wird vorbereitet."),
      paragraph("Quellen, Frame und WÖk-Einordnung werden gemeinsam geprüft.")
    ]);
  }

  function renderNotice(title, text) {
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

  function replaceResult(nodes) {
    if (!result) return;
    result.replaceChildren(...nodes.filter(Boolean));
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

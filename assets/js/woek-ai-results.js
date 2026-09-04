/* Shared answer snapshots for the German and English AI pages. No account/history upload. */
(function (root) {
  "use strict";
  const SHARE_ID = /^sr-[0-9a-f-]{36}$/i;
  function safeSources(items) {
    return (Array.isArray(items) ? items : []).flatMap((item) => {
      try {
        if (!item || typeof item.url !== "string" || !item.url.trim()) return [];
        const url = new URL(item.url, "https://wirkungsoekonomie.de");
        if (!/^https?:$/.test(url.protocol) || url.username || url.password) return [];
        return [{ ...item, url: url.href }];
      } catch { return []; }
    });
  }
  function sharePayload(item) {
    return {
      target: "woek-ai", title: "WÖk-KI · Geteilte Antwort", question: item.question,
      answer: item.answer, sections: [], sources: safeSources(item.sources), route: "/woek-ki/"
    };
  }
  function attach({ apiBase, render }) {
    const en = document.documentElement.lang.startsWith("en");
    const t = (de, english) => en ? english : de;
    const pagePath = en ? "/en/woek-ai/" : "/woek-ki/";
    const spacePath = en ? "/en/my-impact-space/#ai-history" : "/mein-wirkungsraum/#ki-anfragen";
    let current = null;
    let generation = null;
    let revision = 0;
    let shareUrl = "";
    const node = (tag, text, className) => {
      const element = document.createElement(tag);
      if (text) element.textContent = text;
      if (className) element.className = className;
      return element;
    };
    const button = (text, handler) => {
      const element = node("button", text, "btn btn-secondary");
      element.type = "button";
      element.addEventListener("click", handler);
      return element;
    };
    const panel = node("section", "", "woek-ai-answer-actions");
    panel.hidden = true;
    panel.setAttribute("aria-label", t("Antwort aufbewahren und teilen", "Save and share answer"));
    panel.setAttribute("data-search-exclude", "");
    const row = node("div", "", "woek-ai-actions");
    const snapshotInfo = node("p", "", "card-text");
    const save = button(t("In Mein Wirkungsraum speichern", "Save to My Impact Space"), () => saveCurrent(false));
    const share = button(t("Antwort teilen", "Share answer"), () => {
      consent.hidden = false;
      share.setAttribute("aria-expanded", "true");
      if (shareUrl) revealLink();
      publish.focus();
    });
    share.setAttribute("aria-controls", "woek-ai-share-consent");
    share.setAttribute("aria-expanded", "false");
    const space = node("a", t("Mein Wirkungsraum öffnen", "Open My Impact Space"), "text-link");
    space.href = spacePath;
    row.append(save, share, space);
    const status = node("p", "", "card-text");
    status.id = "woek-ai-save-status";
    status.setAttribute("role", "status");
    const consent = node("div", "", "woek-ai-share-consent");
    consent.id = "woek-ai-share-consent";
    consent.hidden = true;
    const notice = node("p", t(
      "Du veröffentlichst nur diese Frage, die angezeigte Antwort und ihre Quellen. Alle mit dem Link können sie ohne Anmeldung lesen und weitergeben. Dein übriger Wirkungsraum bleibt privat. Prüfe den Text auf persönliche oder vertrauliche Angaben. Der Link bleibt ohne automatische Ablauffrist erreichbar; fremde Kopien lassen sich nicht zurückholen.",
      "You publish only this question, the displayed answer and its sources. Anyone with the link can read and forward it without signing in. The rest of your Impact Space stays private. Check for personal or confidential information first. The link has no automatic expiry; copies made by others cannot be recalled."
    ));
    const publish = button(t("Öffentlichen Link erstellen", "Create public link"), createShare);
    const cancel = button(t("Abbrechen", "Cancel"), () => {
      consent.hidden = true;
      share.setAttribute("aria-expanded", "false");
      share.focus();
    });
    const publishRow = node("div", "", "woek-ai-actions");
    publishRow.append(publish, cancel);
    const sharedStatus = node("p", "", "card-text");
    sharedStatus.setAttribute("role", "status");
    const linkRow = node("div", "", "woek-ai-shared-link");
    linkRow.hidden = true;
    const label = node("label", t("Öffentlicher Link", "Public link"));
    label.htmlFor = "woek-ai-share-url";
    const input = node("input");
    input.id = "woek-ai-share-url";
    input.type = "url";
    input.readOnly = true;
    const copy = button(t("Link kopieren", "Copy link"), async () => {
      const value = input.value;
      try {
        await navigator.clipboard.writeText(value);
        if (input.value === value) sharedStatus.textContent = t("Link kopiert.", "Link copied.");
      } catch {
        input.focus(); input.select();
        sharedStatus.textContent = t("Bitte den markierten Link manuell kopieren.", "Please copy the selected link manually.");
      }
    });
    const open = node("a", t("Geteilte Antwort öffnen", "Open shared answer"), "text-link");
    open.target = "_blank"; open.rel = "noopener noreferrer";
    linkRow.append(label, input, copy, open);
    consent.append(notice, publishRow, sharedStatus, linkRow);
    panel.append(snapshotInfo, row, status, consent);
    document.querySelector("#woek-ai-answer").after(panel);

    function clear() {
      revision += 1;
      current = null; generation = null; shareUrl = "";
      panel.hidden = true; consent.hidden = true; linkRow.hidden = true;
      input.value = ""; open.removeAttribute("href"); status.textContent = ""; sharedStatus.textContent = "";
      publish.disabled = false; share.setAttribute("aria-expanded", "false");
    }
    function begin() {
      clear();
      generation = { id: `ki-${crypto.randomUUID()}`, asked_at: new Date().toISOString() };
      const url = new URL(location.href);
      url.searchParams.delete("share"); url.searchParams.delete("antwort");
      history.replaceState(null, "", url);
    }
    function show(item) {
      current = { ...item, sources: safeSources(item.sources) };
      const date = new Date(item.asked_at || item.createdAt || "");
      snapshotInfo.textContent = t("Gespeicherte Frage: ", "Saved question: ") + item.question
        + (Number.isFinite(date.getTime()) ? t(" · Stand: ", " · As of: ") + date.toLocaleString(en ? "en-GB" : "de-DE") : "");
      panel.hidden = false;
    }
    function capture(item) {
      if (!generation) generation = { id: `ki-${crypto.randomUUID()}`, asked_at: new Date().toISOString() };
      show({ ...item, ...generation });
      saveCurrent(true);
    }
    function saveCurrent(automatic) {
      if (!current) return;
      try {
        const saved = root.WoekUserSpace?.recordAiQuery(current);
        if (!saved) throw new Error("Storage unavailable");
        current = { ...current, id: saved.id };
        status.textContent = automatic
          ? t("Automatisch in Mein Wirkungsraum gespeichert – lokal in diesem Browser.", "Automatically saved to My Impact Space - locally in this browser.")
          : t("In Mein Wirkungsraum gespeichert. Antwort und Quellen sind in diesem Browser wieder abrufbar.", "Saved to My Impact Space. This answer and its sources can be reopened in this browser.");
        document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
      } catch {
        status.textContent = t("Nicht gespeichert: Der Browser-Speicher ist voll oder gesperrt. Bitte im Wirkungsraum eine Sicherung exportieren und Speicher freigeben. Die Antwort bleibt hier vorerst sichtbar.", "Not saved: browser storage is full or blocked. Export a backup in My Impact Space and free storage. The answer remains visible here for now.");
      }
    }
    function revealLink() {
      input.value = shareUrl; open.href = shareUrl; linkRow.hidden = false;
      sharedStatus.textContent = t("Öffentlicher Link bereit. Du kannst ihn jetzt kopieren und weitergeben.", "Public link ready. You can now copy and share it.");
    }
    async function createShare() {
      if (!current || publish.disabled) return;
      if (shareUrl) { revealLink(); return; }
      const item = current;
      const token = revision;
      publish.disabled = true;
      sharedStatus.textContent = t("Link wird erstellt …", "Creating link …");
      try {
        const response = await fetch(`${apiBase}/api/share-result`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sharePayload(item)), signal: AbortSignal.timeout(25000)
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok || !SHARE_ID.test(payload.id)) throw new Error("Sharing failed");
        if (token !== revision) return;
        shareUrl = `https://wirkungsoekonomie.de${pagePath}?share=${encodeURIComponent(payload.id)}`;
        revealLink();
      } catch {
        if (token === revision) sharedStatus.textContent = t("Der Link konnte nicht erstellt werden. Deine lokale Antwort bleibt erhalten. Bitte später erneut versuchen.", "The link could not be created. Your local answer is unchanged. Please try again later.");
      } finally {
        if (token === revision) publish.disabled = false;
      }
    }
    async function restore() {
      const params = new URLSearchParams(location.search);
      const sharedId = params.get("share");
      const localId = params.get("antwort");
      if (!sharedId && !localId) return;
      // Result URLs never become search-index entries and carry no question in the URL.
      const robots = document.querySelector('meta[name="robots"]') || node("meta");
      robots.name = "robots"; robots.content = "noindex, nofollow"; document.head.append(robots);
      const token = revision;
      let item;
      try {
        if (sharedId) {
          if (!SHARE_ID.test(sharedId)) throw new Error("Invalid share id");
          const response = await fetch(`${apiBase}/api/share-result/${encodeURIComponent(sharedId)}`, { signal: AbortSignal.timeout(15000) });
          const payload = await response.json();
          if (!response.ok || !payload.ok || payload.result?.target !== "woek-ai") throw new Error("Not found");
          item = { ...payload.result, asked_at: payload.result.createdAt };
        } else {
          item = root.WoekUserSpace?.getItems("ai_query_history").find((entry) => entry.id === localId);
        }
        if (!item || typeof item.answer !== "string" || !item.answer || typeof item.question !== "string") throw new Error("Not found");
        if (token !== revision) return;
        show(item);
        render(current, Boolean(sharedId));
        if (sharedId) shareUrl = `https://wirkungsoekonomie.de${pagePath}?share=${encodeURIComponent(sharedId)}`;
        status.textContent = sharedId
          ? t("Öffentlich geteilter Antwort-Snapshot. Nicht automatisch in Deinem Wirkungsraum gespeichert. KI-Antworten können Fehler enthalten; Quellen und Stand prüfen.", "Public answer snapshot. Not automatically saved to your Impact Space. AI answers can contain errors; check sources and date.")
          : t("Gespeicherte Antwort geöffnet – keine neue KI-Abfrage.", "Saved answer opened - no new AI request.");
      } catch {
        if (token !== revision) return;
        const warning = document.querySelector("#woek-ai-warning");
        warning.hidden = false;
        warning.textContent = sharedId
          ? t("Diese geteilte Antwort ist nicht erreichbar. Bitte prüfe den Link oder versuche es später erneut.", "This shared answer is unavailable. Check the link or try again later.")
          : t("Diese Antwort wurde in diesem Browser nicht gefunden. Öffne sie im ursprünglichen Browser oder importiere dort Deine Wirkungsraum-Sicherung.", "This answer was not found in this browser. Use the original browser or import your Impact Space backup here.");
      }
    }
    return { begin, capture, clear, restore };
  }
  const api = { attach, safeSources, sharePayload };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WoekAiResults = api;
})(typeof window === "undefined" ? globalThis : window);

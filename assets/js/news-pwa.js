(function () {
  const canRegisterServiceWorker = "serviceWorker" in navigator
    && (window.location.protocol === "https:" || window.location.hostname === "localhost");
  const registrationPromise = canRegisterServiceWorker
    ? navigator.serviceWorker.register("/wirkungsticker/sw.js", { scope: "/wirkungsticker/" }).catch(() => null)
    : Promise.resolve(null);

  const tools = document.querySelector("[data-news-app-tools]");
  if (!tools) return;

  const notificationToggle = tools.querySelector("[data-news-notification-toggle]");
  const notificationStatus = tools.querySelector("[data-news-notification-status]");
  const refreshButtons = Array.from(document.querySelectorAll("[data-news-refresh-button]"));
  const refreshStatuses = Array.from(document.querySelectorAll("[data-news-refresh-status]"));
  const refreshButton = { set disabled(value) { refreshButtons.forEach((button) => { button.disabled = value; }); } };
  const refreshStatus = { set textContent(value) { refreshStatuses.forEach((node) => { node.textContent = value; }); } };
  const markReadButton = tools.querySelector("[data-news-mark-read]");
  const cards = Array.from(document.querySelectorAll("[data-news-card]"));
  const notificationKey = "woek_ticker_notifications";
  const lastSeenKey = "woek_ticker_last_seen";
  const lastNotifiedKey = "woek_ticker_last_notified";
  const notificationTag = "woek-wirkungsticker-updates";
  const pushApiBase = "https://130.162.217.58.sslip.io/api/news-push";
  const autoReloadKey = "woek_ticker_last_auto_reload";
  const mobile = navigator.userAgentData?.mobile === true
    || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || window.matchMedia("(max-width: 760px)").matches;
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
  let newsCheckInterval = null;
  let latestFeedTimestamp = 0;

  tools.hidden = !(mobile || standalone);
  initializeNewsState();
  initializeNotifications();
  initializeFreshnessChecks();

  function newestCardTimestamp() {
    return cards.reduce((latest, card) => {
      const timestamp = Date.parse(card.dataset.newsUpdatedAt || 0);
      return timestamp > latest ? timestamp : latest;
    }, 0);
  }

  function initializeNewsState() {
    const newest = newestCardTimestamp();
    const stored = Date.parse(window.localStorage.getItem(lastSeenKey) || 0);
    if (!stored && newest) {
      window.localStorage.setItem(lastSeenKey, new Date(newest).toISOString());
      return;
    }
    const newCards = cards.filter((card) => Date.parse(card.dataset.newsUpdatedAt || 0) > stored);
    newCards.forEach((card) => {
      const badge = card.querySelector("[data-news-new-badge]");
      if (badge) badge.hidden = false;
    });
    updateAppBadge(newCards.length);
    if (markReadButton) markReadButton.hidden = newCards.length === 0;
  }

  async function initializeNotifications() {
    const enabled = window.localStorage.getItem(notificationKey) === "enabled"
      && "Notification" in window
      && Notification.permission === "granted";
    renderNotificationState(enabled);
    notificationToggle?.addEventListener("click", () => void toggleNotifications());
    markReadButton?.addEventListener("click", () => void markNewsAsSeen());
    initializePushOffer();
    if (!enabled) return;
    try {
      await configureBackgroundChecks(true);
      startForegroundChecks();
    } catch {
      renderNotificationState(false, "Push konnte gerade nicht verbunden werden. Beim nächsten Öffnen versucht die App es erneut.");
    }
  }

  function initializePushOffer() {
    const offerKey = "woek_ticker_push_offer_seen_v1";
    if (!standalone || !canRegisterServiceWorker || window.top !== window.self
      || !("Notification" in window) || !("PushManager" in window)
      || !("HTMLDialogElement" in window) || Notification.permission !== "default") return;
    try {
      // An explicit opt-out and a previous dismissal both take precedence.
      if (window.localStorage.getItem(notificationKey) || window.localStorage.getItem(offerKey)) return;
    } catch { return; }

    registrationPromise.then((registration) => {
      if (!registration?.pushManager) return;
      const showOffer = () => {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", showOffer);
        try {
          if (window.localStorage.getItem(notificationKey) || window.localStorage.getItem(offerKey)
            || Notification.permission !== "default") return;
          window.localStorage.setItem(offerKey, "seen");
        } catch { return; }
        const dialog = document.createElement("dialog");
        dialog.className = "news-push-offer";
        dialog.setAttribute("aria-labelledby", "news-push-offer-title");
        dialog.setAttribute("aria-describedby", "news-push-offer-description");
        dialog.innerHTML = `<p class="hero-kicker">Wirkungsticker</p>
          <h2 id="news-push-offer-title">Bei neuen Nachrichten Bescheid wissen?</h2>
          <p id="news-push-offer-description">Erhalte eine Push-Benachrichtigung bei neuen oder wesentlich aktualisierten Meldungen. Du kannst Push jederzeit unter „Aktualisierung und Push“ wieder deaktivieren.</p>
          <p>Erst nach deiner Zustimmung wird ein technisches Push-Abonnement auf unserem Server gespeichert. <a href="/datenschutz.html#wirkungsticker-push">Datenschutzhinweise</a></p>
          <div class="news-app-tools__actions"><button class="btn btn-primary" type="button" data-push-offer-accept>Benachrichtigungen aktivieren</button><button class="btn btn-secondary" type="button" data-push-offer-dismiss autofocus>Nicht jetzt</button></div>
          <p class="news-app-status" data-push-offer-status role="status"></p>`;
        document.body.append(dialog);
        const accept = dialog.querySelector("[data-push-offer-accept]");
        dialog.querySelector("[data-push-offer-dismiss]").addEventListener("click", () => dialog.close());
        dialog.addEventListener("close", () => dialog.remove(), { once: true });
        accept.addEventListener("click", () => {
          accept.disabled = true;
          // Keep requestPermission in this user gesture, never on page load.
          void toggleNotifications().then(() => {
            if (window.localStorage.getItem(notificationKey) === "enabled") dialog.close();
            else dialog.querySelector("[data-push-offer-status]").textContent = notificationStatus?.textContent || "Push wurde nicht aktiviert. Du kannst es später in den Einstellungen versuchen.";
          }).catch(() => {
            dialog.querySelector("[data-push-offer-status]").textContent = "Push konnte gerade nicht aktiviert werden. Bitte später erneut versuchen.";
          }).finally(() => { accept.disabled = false; });
        });
        dialog.showModal();
      };
      document.addEventListener("visibilitychange", showOffer);
      showOffer();
    });
  }

  async function toggleNotifications() {
    const enabled = window.localStorage.getItem(notificationKey) === "enabled";
    if (enabled) {
      window.localStorage.setItem(notificationKey, "disabled");
      await configureBackgroundChecks(false).catch(() => undefined);
      await updateAppBadge(0);
      renderNotificationState(false, "Für den Wirkungsticker deaktiviert. Die allgemeine Browserberechtigung lässt sich zusätzlich in den Geräteeinstellungen ändern.");
      return;
    }

    if (!("Notification" in window)) {
      renderNotificationState(false, "Dieses Gerät unterstützt Web-Benachrichtigungen hier nicht.");
      return;
    }
    if (ios && !standalone) {
      renderNotificationState(false, "Auf iPhone oder iPad zuerst zum Home-Bildschirm hinzufügen und die installierte App öffnen.");
      return;
    }
    const permission = Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
    if (permission !== "granted") {
      renderNotificationState(false, permission === "denied"
        ? "Benachrichtigungen sind im Browser blockiert und können dort wieder freigegeben werden."
        : "Benachrichtigungen wurden nicht aktiviert.");
      return;
    }

    try {
      await configureBackgroundChecks(true);
    } catch {
      window.localStorage.setItem(notificationKey, "disabled");
      renderNotificationState(false, "Push konnte gerade nicht aktiviert werden. Bitte später erneut versuchen.");
      return;
    }
    window.localStorage.setItem(notificationKey, "enabled");
    startForegroundChecks();
    renderNotificationState(true);
    await checkForNews();
  }

  function startForegroundChecks() {
    if (newsCheckInterval) return;
    newsCheckInterval = window.setInterval(() => {
      void checkForNews();
    }, 5 * 60 * 1000);
  }

  function initializeFreshnessChecks() {
    startForegroundChecks();
    refreshButtons.forEach((button) => button.addEventListener("click", () => void refreshNow()));
    window.addEventListener("focus", () => void handleForeground());
    window.addEventListener("pageshow", () => void handleForeground());
    window.addEventListener("online", () => void handleForeground());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void handleForeground();
    });
    registrationPromise.then((registration) => registration?.update().catch(() => undefined));
    // Erst nach dem ersten sichtbaren Rendern quittieren: Die Karten behalten in
    // dieser Sitzung ihr „Neu“-Label, das App-Icon springt beim Öffnen aber auf 0.
    window.setTimeout(() => void handleForeground(), 750);
  }

  async function handleForeground() {
    if (document.visibilityState !== "visible") return;
    const reloaded = await checkForNews();
    if (reloaded !== true) await acknowledgeVisibleNews();
  }

  async function refreshNow() {
    if (refreshButton) refreshButton.disabled = true;
    if (refreshStatus) refreshStatus.textContent = "Neue Inhalte werden geprüft …";
    const reloaded = await checkForNews({ manual: true });
    if (reloaded === false && refreshStatus) {
      refreshStatus.textContent = `Auf dem neuesten Stand · geprüft ${new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
    }
    if (refreshButton) refreshButton.disabled = false;
  }

  function renderNotificationState(enabled, message = "") {
    if (notificationToggle) {
      notificationToggle.setAttribute("aria-pressed", String(enabled));
      notificationToggle.textContent = enabled ? "Push deaktivieren" : "Push aktivieren";
    }
    if (notificationStatus) {
      notificationStatus.textContent = message || (enabled
        ? "Aktiv. Neue oder wesentlich aktualisierte Meldungen werden automatisch zugestellt; die Zahl zeigt ungelesene Meldungen."
        : "Push-Benachrichtigungen sind aus.");
    }
  }

  async function configureBackgroundChecks(enabled) {
    const initialRegistration = await registrationPromise;
    const registration = initialRegistration && "ready" in navigator.serviceWorker
      ? await navigator.serviceWorker.ready
      : initialRegistration;
    if (!registration) {
      if (enabled) throw new Error("SERVICE_WORKER_NOT_READY");
      return;
    }
    const latest = window.localStorage.getItem(lastSeenKey) || (newestCardTimestamp() ? new Date(newestCardTimestamp()).toISOString() : null);
    if (enabled) await subscribeToServerPush(registration);
    registration.active?.postMessage({
      type: enabled ? "NEWS_NOTIFICATIONS_ENABLE" : "NEWS_NOTIFICATIONS_DISABLE",
      latest,
    });
    if (!enabled) await unsubscribeFromServerPush(registration);
    if (!("periodicSync" in registration)) return;
    try {
      if (enabled) await registration.periodicSync.register(notificationTag, { minInterval: 4 * 60 * 60 * 1000 });
      else await registration.periodicSync.unregister(notificationTag);
    } catch {
      // Echtes Web Push ist bereits verbunden; Periodic Sync ist nur ein Zusatz.
    }
  }

  async function subscribeToServerPush(registration) {
    if (!("PushManager" in window) || !registration.pushManager) {
      throw new Error("PUSH_NOT_SUPPORTED");
    }
    const configResponse = await fetch(`${pushApiBase}/config`, {
      cache: "no-store",
    });
    const config = await configResponse.json().catch(() => null);
    if (!configResponse.ok || !config?.enabled || !config.publicKey) throw new Error("PUSH_NOT_CONFIGURED");
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(config.publicKey),
      });
    }
    const response = await fetch(`${pushApiBase}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });
    if (!response.ok) throw new Error("PUSH_SUBSCRIPTION_FAILED");
  }

  async function unsubscribeFromServerPush(registration) {
    const subscription = await registration.pushManager?.getSubscription?.();
    if (!subscription) return;
    await fetch(`${pushApiBase}/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe().catch(() => undefined);
  }

  function base64UrlToBytes(value) {
    const padding = "=".repeat((4 - (value.length % 4)) % 4);
    const binary = window.atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  }

  async function checkForNews({ manual = false } = {}) {
    try {
      if (manual) {
        const registration = await registrationPromise;
        await registration?.update().catch(() => undefined);
      }
      const response = await fetch(`/wirkungsticker/feed.json?check=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("NEWS_FEED_UNAVAILABLE");
      const feed = await response.json();
      const feedLatest = (feed.items || []).reduce((value, item) => Math.max(value, Date.parse(item.date_modified || item.date_published || 0)), 0);
      latestFeedTimestamp = feedLatest;
      const pageLatest = newestCardTimestamp();
      // An explicit refresh also picks up image/template-only releases whose
      // editorial publication timestamps intentionally remain unchanged.
      if (cards.length && (manual || feedLatest > pageLatest) && document.visibilityState === "visible") {
        const lastReload = Number(window.sessionStorage.getItem(autoReloadKey) || 0);
        if (manual || Date.now() - lastReload > 60 * 1000) {
          window.sessionStorage.setItem(autoReloadKey, String(Date.now()));
          window.location.reload();
          return true;
        }
      }
      const lastSeen = Date.parse(window.localStorage.getItem(lastSeenKey) || 0);
      const lastNotified = Date.parse(window.localStorage.getItem(lastNotifiedKey) || 0);
      const updates = (feed.items || []).filter((item) => Date.parse(item.date_modified || item.date_published || 0) > lastSeen);
      const latest = updates.reduce((value, item) => Math.max(value, Date.parse(item.date_modified || item.date_published || 0)), 0);
      await updateAppBadge(updates.length);
      if (!updates.length || latest <= lastNotified || document.visibilityState === "visible") return false;
      const registration = await registrationPromise;
      await registration?.showNotification("Neue Wirkungsnachrichten", {
        body: `${updates.length} ${updates.length === 1 ? "neue Wirkungsnachricht ist" : "neue Wirkungsnachrichten sind"} verfügbar.`,
        icon: "/assets/img/brand/app-icon-192.png",
        badge: "/assets/img/brand/app-icon-192.png",
        tag: notificationTag,
        data: { url: "/wirkungsticker/?source=notification" },
      });
      window.localStorage.setItem(lastNotifiedKey, new Date(latest).toISOString());
      return false;
    } catch {
      // Offline ist ein erwartbarer App-Zustand; die nächste Prüfung versucht es erneut.
      if (manual && refreshStatus) refreshStatus.textContent = "Gerade offline oder nicht erreichbar. Der letzte Stand bleibt verfügbar.";
      return null;
    }
  }

  async function markNewsAsSeen() {
    await acknowledgeVisibleNews({ hideMarkers: true });
  }

  async function acknowledgeVisibleNews({ hideMarkers = false } = {}) {
    const newest = Math.max(newestCardTimestamp(), latestFeedTimestamp);
    if (newest) {
      const value = new Date(newest).toISOString();
      window.localStorage.setItem(lastSeenKey, value);
      window.localStorage.setItem(lastNotifiedKey, value);
      const registration = await registrationPromise;
      registration?.active?.postMessage({ type: "NEWS_MARK_SEEN", latest: value });
    }
    if (hideMarkers) {
      cards.forEach((card) => {
        const badge = card.querySelector("[data-news-new-badge]");
        if (badge) badge.hidden = true;
      });
    }
    if (markReadButton) markReadButton.hidden = true;
    await updateAppBadge(0);
  }

  async function updateAppBadge(count) {
    try {
      if (count > 0 && "setAppBadge" in navigator) await navigator.setAppBadge(count);
      else if ("clearAppBadge" in navigator) await navigator.clearAppBadge();
    } catch {
      // Badges sind eine progressive Verbesserung und nicht auf jedem Gerät verfügbar.
    }
  }
})();

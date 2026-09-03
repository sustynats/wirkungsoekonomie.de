(function () {
  const canRegisterServiceWorker = "serviceWorker" in navigator
    && (window.location.protocol === "https:" || window.location.hostname === "localhost");
  const registrationPromise = canRegisterServiceWorker
    ? navigator.serviceWorker.register("/wirkungsticker/sw.js", { scope: "/wirkungsticker/" }).catch(() => null)
    : Promise.resolve(null);

  const tools = document.querySelector("[data-news-app-tools]");
  if (!tools) return;

  const installCopy = tools.querySelector("[data-news-install-copy]");
  const installActions = tools.querySelector("[data-news-install-actions]");
  const installButton = tools.querySelector("[data-news-install-button]");
  const installDismiss = tools.querySelector("[data-news-install-dismiss]");
  const notificationToggle = tools.querySelector("[data-news-notification-toggle]");
  const notificationStatus = tools.querySelector("[data-news-notification-status]");
  const refreshButton = tools.querySelector("[data-news-refresh-button]");
  const refreshStatus = tools.querySelector("[data-news-refresh-status]");
  const markReadButton = tools.querySelector("[data-news-mark-read]");
  const cards = Array.from(document.querySelectorAll("[data-news-card]"));
  const installDismissKey = "woek_ticker_install_dismissed_at";
  const notificationKey = "woek_ticker_notifications";
  const lastSeenKey = "woek_ticker_last_seen";
  const lastNotifiedKey = "woek_ticker_last_notified";
  const notificationTag = "woek-wirkungsticker-updates";
  const autoReloadKey = "woek_ticker_last_auto_reload";
  const mobile = navigator.userAgentData?.mobile === true
    || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || window.matchMedia("(max-width: 760px)").matches;
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;
  let deferredInstallPrompt = null;
  let newsCheckInterval = null;

  tools.hidden = !(mobile || standalone);
  initializeInstallOffer();
  initializeNewsState();
  initializeNotifications();
  initializeFreshnessChecks();

  function initializeInstallOffer() {
    if (standalone) {
      if (installCopy) installCopy.textContent = "Der Wirkungsticker ist als Web-App installiert.";
      if (installActions) installActions.hidden = true;
      return;
    }

    const dismissedAt = Number(window.localStorage.getItem(installDismissKey) || 0);
    const dismissalExpired = Date.now() - dismissedAt > 30 * 24 * 60 * 60 * 1000;
    if (!dismissalExpired && installActions) installActions.hidden = true;

    if (ios && installCopy) {
      installCopy.textContent = "Auf iPhone oder iPad: Teilen öffnen und „Zum Home-Bildschirm“ wählen. Danach startet der Wirkungsticker wie eine eigene App.";
      if (installButton) installButton.textContent = "Anleitung anzeigen";
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      if (installActions && dismissalExpired) installActions.hidden = false;
      if (installButton) installButton.textContent = "Installieren";
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      window.localStorage.removeItem(installDismissKey);
      if (installCopy) installCopy.textContent = "Der Wirkungsticker ist als Web-App installiert.";
      if (installActions) installActions.hidden = true;
    });

    installDismiss?.addEventListener("click", () => {
      window.localStorage.setItem(installDismissKey, String(Date.now()));
      if (installActions) installActions.hidden = true;
      if (installCopy) installCopy.textContent = "Du kannst den Wirkungsticker später jederzeit über das Browsermenü zum Startbildschirm hinzufügen.";
    });

    installButton?.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice.catch(() => null);
        if (choice?.outcome === "accepted") window.localStorage.removeItem(installDismissKey);
        deferredInstallPrompt = null;
        return;
      }
      if (installCopy) {
        installCopy.textContent = ios
          ? "Tippe in Safari auf Teilen und anschließend auf „Zum Home-Bildschirm“ und „Hinzufügen“."
          : "Öffne das Browsermenü und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.";
      }
    });
  }

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
    if (!enabled) return;
    await configureBackgroundChecks(true);
    startForegroundChecks();
  }

  async function toggleNotifications() {
    const enabled = window.localStorage.getItem(notificationKey) === "enabled";
    if (enabled) {
      window.localStorage.setItem(notificationKey, "disabled");
      await configureBackgroundChecks(false);
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

    window.localStorage.setItem(notificationKey, "enabled");
    await configureBackgroundChecks(true);
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
    if (!cards.length) return;
    startForegroundChecks();
    refreshButton?.addEventListener("click", () => void refreshNow());
    window.addEventListener("focus", () => void checkForNews());
    window.addEventListener("pageshow", () => void checkForNews());
    window.addEventListener("online", () => void checkForNews());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void checkForNews();
    });
    registrationPromise.then((registration) => registration?.update().catch(() => undefined));
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
        ? "Aktiv. Unterstützte Smartphones prüfen im Hintergrund; sonst erfolgt die Prüfung beim Öffnen der App."
        : "Push-Benachrichtigungen sind aus.");
    }
  }

  async function configureBackgroundChecks(enabled) {
    const registration = await registrationPromise;
    if (!registration) return;
    const latest = window.localStorage.getItem(lastSeenKey) || (newestCardTimestamp() ? new Date(newestCardTimestamp()).toISOString() : null);
    registration.active?.postMessage({
      type: enabled ? "NEWS_NOTIFICATIONS_ENABLE" : "NEWS_NOTIFICATIONS_DISABLE",
      latest,
    });
    if (!("periodicSync" in registration)) return;
    try {
      if (enabled) await registration.periodicSync.register(notificationTag, { minInterval: 4 * 60 * 60 * 1000 });
      else await registration.periodicSync.unregister(notificationTag);
    } catch {
      if (enabled && notificationStatus) notificationStatus.textContent = "Aktiv. Dieses Gerät prüft neue Meldungen beim Öffnen der App.";
    }
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
      const pageLatest = newestCardTimestamp();
      if (cards.length && feedLatest > pageLatest && document.visibilityState === "visible") {
        const lastReload = Number(window.sessionStorage.getItem(autoReloadKey) || 0);
        if (Date.now() - lastReload > 60 * 1000) {
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
    const newest = newestCardTimestamp();
    if (newest) {
      const value = new Date(newest).toISOString();
      window.localStorage.setItem(lastSeenKey, value);
      window.localStorage.setItem(lastNotifiedKey, value);
      const registration = await registrationPromise;
      registration?.active?.postMessage({ type: "NEWS_MARK_SEEN", latest: value });
    }
    cards.forEach((card) => {
      const badge = card.querySelector("[data-news-new-badge]");
      if (badge) badge.hidden = true;
    });
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

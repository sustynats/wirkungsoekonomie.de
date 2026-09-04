(function () {
  const promo = document.querySelector("[data-news-install-promo]");
  const buttons = Array.from(document.querySelectorAll("[data-news-install-button]"));
  if (!buttons.length) return;
  const copies = Array.from(document.querySelectorAll("[data-news-install-copy]"));
  const actions = Array.from(document.querySelectorAll("[data-news-install-actions]"));
  const displayMode = window.matchMedia("(display-mode: standalone)");
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const dismissKey = "woek_ticker_install_dismissed_at";
  const installedKey = "woek_ticker_install_seen_at";
  const month = 30 * 24 * 60 * 60 * 1000;
  let deferredPrompt = null;
  let installing = false;
  let dismissed = false;
  let installedHere = false;
  const read = (key) => { try { return Number(window.localStorage.getItem(key) || 0); } catch { return 0; } };
  const write = (key) => { try { window.localStorage.setItem(key, String(Date.now())); } catch { /* Optional local preference. */ } };
  const recent = (key) => { const age = Date.now() - read(key); return age >= 0 && age < month; };
  const standalone = () => displayMode.matches || navigator.standalone === true;
  const copy = (text) => copies.forEach((node) => { node.textContent = text; });

  function render() {
    if (standalone()) write(installedKey);
    const installed = standalone() || installedHere;
    // Browsers cannot reliably observe uninstalls. Remember a known install only
    // for 30 days; the permanent manual instructions below remain accessible.
    if (promo) promo.hidden = installed || recent(installedKey) || dismissed || recent(dismissKey) || window.top !== window.self;
    actions.forEach((node) => { node.hidden = installed; });
    buttons.forEach((button) => {
      button.disabled = installing;
      button.textContent = deferredPrompt ? "Web-App installieren" : ios ? "Zum Home-Bildschirm hinzufügen" : "Web-App hinzufügen";
    });
    if (installed) copy("Der Wirkungsticker ist als Web-App geöffnet oder wurde gerade installiert.");
    else if (ios) copy("Auf iPhone und iPad: in Safari „Teilen“ öffnen und „Zum Home-Bildschirm“ wählen. Push kannst du danach in der installierten App freiwillig aktivieren.");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    render();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installedHere = true;
    write(installedKey);
    render();
  });
  displayMode.addEventListener?.("change", render);
  window.addEventListener("pageshow", render);
  window.addEventListener("storage", (event) => { if ([dismissKey, installedKey].includes(event.key)) render(); });

  document.querySelectorAll("[data-news-install-dismiss]").forEach((button) => button.addEventListener("click", () => {
    dismissed = true;
    write(dismissKey);
    render();
  }));
  buttons.forEach((button) => button.addEventListener("click", async () => {
    if (installing) return;
    if (!deferredPrompt) {
      copy(ios
        ? "So geht’s: Öffne diese Seite in Safari, tippe auf „Teilen“, dann auf „Zum Home-Bildschirm“ und „Hinzufügen“. Falls angeboten, „Als Web-App öffnen“ aktivieren."
        : "Öffne das Browsermenü und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“. Wenn dein Browser das nicht anbietet, kannst du den Wirkungsticker weiterhin ganz normal hier lesen.");
      return;
    }
    const prompt = deferredPrompt;
    deferredPrompt = null;
    installing = true;
    render();
    try {
      await prompt.prompt(); // Only inside the explicit button click.
      const choice = await prompt.userChoice;
      if (choice?.outcome === "accepted") copy("Die Installation wurde angefordert. Öffne den Wirkungsticker anschließend über sein App-Symbol.");
      else copy("Nicht installiert. Du kannst die Web-App später über das Browsermenü hinzufügen.");
    } catch {
      copy("Die Installation konnte nicht geöffnet werden. Bitte nutze „App installieren“ im Browsermenü.");
    } finally {
      installing = false;
      buttons.forEach((node) => { node.disabled = false; });
    }
  }));
  render();
})();

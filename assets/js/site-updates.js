(() => {
  const root = document.querySelector("[data-site-updates]");
  if (!(root instanceof HTMLElement)) return;

  const cards = Array.from(root.querySelectorAll("[data-update-card]"));
  const groups = Array.from(root.querySelectorAll("[data-update-group]"));
  const filters = Array.from(document.querySelectorAll("[data-update-filter]"));
  const search = document.querySelector("[data-update-search]");
  const empty = document.querySelector("[data-update-empty]");
  const more = document.querySelector("[data-update-more]");
  const pageSize = 10;
  let activeFilter = "alle";
  let visibleLimit = pageSize;

  function searchable(value) {
    return String(value || "").toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-");
  }

  function matches(card) {
    const filterMatch = activeFilter === "alle" || card.dataset.updateArea === activeFilter || card.dataset.updateKind === activeFilter;
    const query = search instanceof HTMLInputElement ? searchable(search.value.trim()) : "";
    const searchMatch = !query || (card.dataset.updateSearch || "").includes(query);
    return filterMatch && searchMatch;
  }

  function render() {
    let matched = 0;
    let shown = 0;
    cards.forEach((card) => {
      const match = matches(card);
      if (match) matched += 1;
      const show = match && shown < visibleLimit;
      card.hidden = !show;
      if (show) shown += 1;
    });
    groups.forEach((group) => {
      group.hidden = !Array.from(group.querySelectorAll("[data-update-card]")).some((card) => !card.hidden);
    });
    if (empty instanceof HTMLElement) empty.hidden = matched !== 0;
    if (more instanceof HTMLButtonElement) {
      more.hidden = matched <= shown;
      more.textContent = `Weitere Neuigkeiten anzeigen (${matched - shown})`;
    }
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.updateFilter || "alle";
      visibleLimit = pageSize;
      filters.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
      render();
    });
  });
  if (search instanceof HTMLInputElement) search.addEventListener("input", () => {
    visibleLimit = pageSize;
    render();
  });
  if (more instanceof HTMLButtonElement) more.addEventListener("click", () => {
    visibleLimit += pageSize;
    render();
  });
  render();

  const appOffer = document.querySelector("[data-news-app-offer]");
  const installButton = document.querySelector("[data-news-app-install]");
  const installHelp = document.querySelector("[data-news-app-help]");
  let deferredInstallPrompt = null;

  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const smartphone = window.matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) <= 820);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function showAppOffer() {
    if (appOffer instanceof HTMLElement && smartphone && !standalone) appOffer.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showAppOffer();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/news/sw.js", { scope: "/news/" }).catch(() => undefined);
  }

  if (installButton instanceof HTMLButtonElement) {
    installButton.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        if (choice.outcome === "accepted" && appOffer instanceof HTMLElement) appOffer.hidden = true;
        return;
      }
      if (installHelp instanceof HTMLElement) {
        installHelp.hidden = false;
        installHelp.textContent = ios
          ? "Tippe in Safari auf Teilen und dann auf ‚Zum Home-Bildschirm‘."
          : "Öffne das Browser-Menü und wähle ‚App installieren‘ oder ‚Zum Startbildschirm hinzufügen‘.";
        installHelp.focus();
      }
    });
  }

  window.addEventListener("appinstalled", () => {
    if (appOffer instanceof HTMLElement) appOffer.hidden = true;
  });
  showAppOffer();
})();

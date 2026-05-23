(() => {
  const main = document.querySelector("[data-reference-reader], .reference-portal");
  if (!main) return;

  function setReaderMode(mode) {
    document.body.dataset.readerMode = mode;
    try {
      localStorage.setItem("woek-reference-reader-mode", mode);
    } catch {
      // Local storage is optional.
    }
    document.querySelectorAll("[data-reader-mode]").forEach((button) => {
      const active = button.dataset.readerMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (mode === "print") window.print();
  }

  const storedMode = (() => {
    try {
      return localStorage.getItem("woek-reference-reader-mode") || "lesen";
    } catch {
      return "lesen";
    }
  })();
  setReaderMode(storedMode);

  document.addEventListener("click", (event) => {
    const modeButton = event.target instanceof Element ? event.target.closest("[data-reader-mode]") : null;
    if (modeButton instanceof HTMLButtonElement) {
      setReaderMode(modeButton.dataset.readerMode || "lesen");
    }

    const printButton = event.target instanceof Element ? event.target.closest("[data-print-page]") : null;
    if (printButton) window.print();

    const copyUrlButton = event.target instanceof Element ? event.target.closest("[data-copy-current-url]") : null;
    if (copyUrlButton) {
      const target = location.hash || document.querySelector("[data-section-id]")?.id || "";
      navigator.clipboard?.writeText(`${location.origin}${location.pathname}${target ? `#${target.replace(/^#/, "")}` : ""}`);
      copyUrlButton.textContent = "Link kopiert";
      window.setTimeout(() => {
        copyUrlButton.textContent = "Diese Stelle zitieren";
      }, 1600);
    }

    const copyAnchor = event.target instanceof Element ? event.target.closest("[data-copy-anchor]") : null;
    if (copyAnchor instanceof HTMLButtonElement) {
      const id = copyAnchor.dataset.copyAnchor || "";
      navigator.clipboard?.writeText(`${location.origin}${location.pathname}#${id}`);
      copyAnchor.textContent = "kopiert";
      window.setTimeout(() => {
        copyAnchor.textContent = "#";
      }, 1400);
    }

    const topLink = event.target instanceof Element ? event.target.closest("[data-scroll-top]") : null;
    if (topLink) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  const progress = document.querySelector(".reading-progress span");
  if (progress) {
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const percent = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      progress.style.inlineSize = `${percent}%`;
    };
    updateProgress();
    document.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  document.querySelectorAll(".article-shell h2[id], .article-shell h3[id], .article-shell h4[id]").forEach((heading) => {
    if (heading.querySelector("[data-copy-anchor]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "anchor-copy-button";
    button.dataset.copyAnchor = heading.id;
    button.textContent = "#";
    button.setAttribute("aria-label", `Link zu ${heading.textContent.trim()} kopieren`);
    heading.append(button);
  });

  const filterbar = document.querySelector("[data-reference-filterbar]");
  if (filterbar) {
    const buttons = Array.from(filterbar.querySelectorAll("[data-chapter-filter]"));
    const query = filterbar.querySelector("[data-chapter-query]");
    const cards = Array.from(document.querySelectorAll(".chapter-card[data-cluster]"));
    const status = filterbar.querySelector("[data-chapter-filter-status]");
    let active = "all";

    function applyFilter() {
      const q = query instanceof HTMLInputElement ? query.value.trim().toLowerCase() : "";
      let visible = 0;
      cards.forEach((card) => {
        const clusterMatch = active === "all" || card.dataset.cluster === active;
        const textMatch = !q || (card.dataset.title || card.textContent || "").toLowerCase().includes(q);
        const show = clusterMatch && textMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (status) status.textContent = `${visible} Kapitel sichtbar`;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        active = button.dataset.chapterFilter || "all";
        buttons.forEach((item) => item.classList.toggle("active", item === button));
        applyFilter();
      });
    });
    query?.addEventListener("input", applyFilter);
    applyFilter();
  }

  const sourcePopover = document.createElement("aside");
  sourcePopover.className = "source-popover";
  sourcePopover.hidden = true;
  document.body.append(sourcePopover);
  let activeSource = null;

  function hideSourcePopover() {
    sourcePopover.hidden = true;
    activeSource = null;
  }

  function showSourcePopover(trigger) {
    const id = trigger.dataset.sourceId || trigger.textContent.trim();
    sourcePopover.innerHTML = `<strong>${id}</strong><p>Quelle im Referenzregister öffnen.</p><a href="${trigger.href}">Zur Quellenkarte</a>`;
    const rect = trigger.getBoundingClientRect();
    sourcePopover.hidden = false;
    const width = sourcePopover.offsetWidth || 260;
    sourcePopover.style.left = `${Math.min(window.innerWidth - width - 16, Math.max(16, rect.left))}px`;
    sourcePopover.style.top = `${Math.max(16, rect.bottom + 10)}px`;
    activeSource = trigger;
  }

  document.addEventListener("pointerover", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest(".source-chip") : null;
    if (trigger instanceof HTMLAnchorElement) showSourcePopover(trigger);
  });
  document.addEventListener("pointerout", (event) => {
    if (event.target instanceof Element && event.target.closest(".source-chip")) hideSourcePopover();
  });
  document.addEventListener("focusin", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest(".source-chip") : null;
    if (trigger instanceof HTMLAnchorElement) showSourcePopover(trigger);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideSourcePopover();
  });
  document.addEventListener("click", (event) => {
    if (!activeSource) return;
    if (!(event.target instanceof Node) || (!sourcePopover.contains(event.target) && event.target !== activeSource)) {
      hideSourcePopover();
    }
  });

  const lightbox = document.createElement("div");
  lightbox.className = "figure-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = '<button type="button" aria-label="Abbildung schließen">×</button><img alt=""><p></p>';
  document.body.append(lightbox);

  document.addEventListener("click", (event) => {
    const image = event.target instanceof Element ? event.target.closest(".reference-figure img") : null;
    if (image instanceof HTMLImageElement) {
      const caption = image.closest("figure")?.querySelector("figcaption")?.textContent || image.alt;
      lightbox.querySelector("img").src = image.src;
      lightbox.querySelector("img").alt = image.alt;
      lightbox.querySelector("p").textContent = caption;
      lightbox.hidden = false;
      lightbox.querySelector("button").focus();
    }
    if (event.target === lightbox || event.target instanceof Element && event.target.closest(".figure-lightbox button")) {
      lightbox.hidden = true;
    }
  });
})();

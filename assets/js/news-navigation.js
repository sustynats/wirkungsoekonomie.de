(function () {
  "use strict";

  const main = document.querySelector("main[data-news-reader]");
  if (!main) return;
  const isDetail = ["detail", "analysis"].includes(main.dataset.newsReader);
  const pendingKey = "woek:wirkungsticker:navigation:v1";
  const entryKey = "newsReader";
  const excluded = "a, button, input, textarea, select, label, summary, details, [contenteditable], [role='slider'], [role='button'], [data-no-swipe], nav, video, audio, iframe";
  let navigating = false;
  let gesture = null;

  function readerUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      if (url.origin !== window.location.origin
        || !/^\/wirkungsticker\/(?:analyse\/[a-z0-9-]+\/|[a-z0-9-]+\/)?$/.test(url.pathname)
        || url.pathname === "/wirkungsticker/quellen/") return null;
      return url;
    } catch { return null; }
  }

  function rememberDeparture(value) {
    const target = readerUrl(value);
    if (!target || target.pathname === window.location.pathname) return;
    try {
      window.sessionStorage.setItem(pendingKey, JSON.stringify({
        from: window.location.href, to: target.href, at: Date.now(),
      }));
    } catch { /* Without storage, a deep link safely falls back to the overview. */ }
  }

  // Mark only a real same-tab reader navigation, never history.length alone:
  // an externally opened article must not swipe back out of the app.
  try {
    const pending = JSON.parse(window.sessionStorage.getItem(pendingKey) || "null");
    window.sessionStorage.removeItem(pendingKey);
    const navigationType = window.performance?.getEntriesByType("navigation")[0]?.type;
    const back = pending && readerUrl(pending.from);
    const target = pending && readerUrl(pending.to);
    if (!window.history.state?.[entryKey] && navigationType !== "reload" && navigationType !== "back_forward"
      && back && target?.pathname === window.location.pathname && Date.now() - pending.at >= 0 && Date.now() - pending.at < 60000) {
      window.history.replaceState({ ...window.history.state, [entryKey]: { back: back.href } }, "");
    }
  } catch { /* Storage/history may be disabled in embedded browsers. */ }

  function goBack() {
    if (navigating) return;
    navigating = true;
    if (readerUrl(window.history.state?.[entryKey]?.back) && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign(document.querySelector("[data-news-return-to-list]")?.href || "/wirkungsticker/");
    }
  }

  function goNext() {
    const next = document.querySelector(".news-story-pagination__link--next");
    if (!next || navigating || !readerUrl(next.href)) return;
    navigating = true;
    rememberDeparture(next.href);
    window.location.assign(next.href);
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (link) {
      if (link.target && link.target !== "_self" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      // Section links do not create phantom pages in the reading history.
      if (isDetail && main.contains(link) && url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (target) {
          event.preventDefault();
          window.history.replaceState({ ...window.history.state }, "", url);
          target.scrollIntoView({ block: "start" });
        }
        return;
      }
      rememberDeparture(link.href);
    } else if (!event.target.closest(excluded) && !String(window.getSelection?.() || "")) {
      const card = event.target.closest("[data-news-card]");
      if (card) rememberDeparture(card.dataset.newsHref);
    }
  });

  window.addEventListener("pageshow", () => { navigating = false; gesture = null; });
  if (!isDetail) return;
  document.querySelectorAll("[data-news-reader-back]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", goBack);
  });
  const hint = document.querySelector("[data-news-swipe-hint]");
  if (hint) hint.hidden = false;

  function blockedTarget(target) {
    const visibleModal = Array.from(document.querySelectorAll("dialog[open], [aria-modal='true'], .site-nav.is-open"))
      .some((node) => node.getClientRects().length > 0 && window.getComputedStyle(node).visibility !== "hidden");
    if (target.closest(excluded) || visibleModal || String(window.getSelection?.() || "")) return true;
    for (let node = target; node && node !== main; node = node.parentElement) {
      if (node.scrollWidth > node.clientWidth + 4 && /auto|scroll/.test(window.getComputedStyle(node).overflowX)) return true;
    }
    return false;
  }

  main.addEventListener("touchstart", (event) => {
    gesture = null;
    if (event.touches.length !== 1 || blockedTarget(event.target) || window.visualViewport?.scale > 1) return;
    const touch = event.touches[0];
    // Both screen edges remain exclusively available to native browser gestures.
    if (touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
    gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, at: Date.now(), horizontal: false };
  }, { passive: true });

  main.addEventListener("touchmove", (event) => {
    if (!gesture) return;
    if (event.touches.length !== 1) { gesture = null; return; }
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - gesture.x);
    const dy = Math.abs(touch.clientY - gesture.y);
    if (!gesture.horizontal && dy > 12 && dy * 1.5 >= dx) { gesture = null; return; }
    if (dx > 20 && dx > dy * 2) gesture.horizontal = true;
    if (gesture.horizontal && event.cancelable) event.preventDefault();
  }, { passive: false });

  main.addEventListener("touchend", (event) => {
    const start = gesture;
    gesture = null;
    if (!start || event.touches.length || blockedTarget(event.target)) return;
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === start.id);
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Date.now() - start.at > 1000 || Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 2) return;
    if (event.cancelable) event.preventDefault();
    if (dx > 0) goBack();
    else goNext();
  }, { passive: false });
  main.addEventListener("touchcancel", () => { gesture = null; }, { passive: true });
})();

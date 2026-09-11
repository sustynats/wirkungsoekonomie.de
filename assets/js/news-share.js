(function () {
  "use strict";

  if (window.woekNewsShareBound) return;
  window.woekNewsShareBound = true;
  var bound = new WeakSet();

  function legacyCopy(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_error) {
      copied = false;
    }

    field.remove();
    return copied;
  }

  async function copyLink(url) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch (_error) {
        // Some browsers expose Clipboard but reject it. Try the local fallback.
      }
    }
    return legacyCopy(url);
  }

  function bindShares() {
  document.querySelectorAll("[data-news-share-button]").forEach(function (button) {
    if (bound.has(button)) return;
    bound.add(button);
    var container = button.closest("[data-news-share]");
    var status = container ? container.querySelector("[data-news-share-status]") : null;

    function announce(message) {
      if (status) status.textContent = message;
    }

    button.addEventListener("click", async function () {
      var url = button.getAttribute("data-share-url") || window.location.href;
      var payload = {
        title: button.getAttribute("data-share-title") || document.title,
        text: button.getAttribute("data-share-text") || "Wirkungsnachricht aus dem Wirkungsticker",
        url: url,
      };

      announce("");

      if (typeof navigator.share === "function") {
        try {
          await navigator.share(payload);
          announce("Nachricht geteilt.");
          return;
        } catch (error) {
          if (error && error.name === "AbortError") return;
        }
      }

      var copied = await copyLink(url);
      announce(copied ? "Link zur Nachricht kopiert." : "Bitte kopiere diesen Nachrichtenlink: " + url);
    });
  });
  }
  bindShares();
  document.addEventListener("wirkungsraum:content-added", bindShares);
})();

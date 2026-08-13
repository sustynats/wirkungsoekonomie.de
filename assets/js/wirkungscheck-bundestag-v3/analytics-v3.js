/* Anonyme Nutzungsereignisse, ohne Antwortwerte. Ohne konfigurierte URL wird
 * nichts übertragen; ein integrator kann den DOM-Event datensparsam abgreifen. */
(function () {
  "use strict";
  function track(name) {
    var detail = { name: name, version: "3.0.0", at: new Date().toISOString() };
    window.dispatchEvent(new CustomEvent("wc-v3-analytics", { detail: detail }));
  }
  window.WC_V3_ANALYTICS = { track: track };
})();

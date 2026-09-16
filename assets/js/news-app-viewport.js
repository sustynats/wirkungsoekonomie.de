(function () {
  'use strict';
  const nav = document.querySelector('.ticker-app-nav');
  if (!nav) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  const viewport = window.visualViewport;
  let lift = 0, frame = null;

  function apply(next) {
    if (next === lift) return;
    lift = next;
    // Ohne Korrektur bleibt die Eigenschaft ungesetzt: dann ist die Leiste ein
    // gewöhnliches position:fixed mit bottom:0, und der Browser hält sie selbst
    // am unteren Rand - zuverlässiger als jede Rechnung von uns.
    if (lift) nav.style.setProperty('--ticker-nav-lift', `${lift}px`);
    else nav.style.removeProperty('--ticker-nav-lift');
  }

  // Verschoben wird über bottom, nicht über transform: ein transformiertes
  // position:fixed hängt in WebKit am Dokument statt am Viewport und wandert
  // beim Scrollen mit (16.09.: die Leiste stand mitten in der Seite, über dem
  // Kartentext). Und gerechnet wird ausschließlich aus der Viewport-Geometrie,
  // nicht aus der gemessenen Kante der Leiste: eine Korrektur, die ihre eigene
  // Wirkung mitmisst, schleppt jeden Messfehler in den nächsten Schritt.
  function align() {
    frame = null;
    if (!mobile.matches || (viewport?.scale || 1) > 1.01 || !viewport) return apply(0);
    const height = viewport.height, top = Math.max(0, viewport.offsetTop || 0);
    if (!Number.isFinite(height) || height <= 0 || !Number.isFinite(window.innerHeight)) return;
    // Der sichtbare Rand gegen den Rand des Layout-Viewports, an dem bottom:0
    // klebt. Die Tastatur verkleinert den sichtbaren Bereich (Leiste hoch), eine
    // eingeklappte Browserleiste vergrößert ihn (Leiste runter).
    const visibleBottom = height + top;
    const distance = window.innerHeight - visibleBottom;
    apply(Math.round(Math.max(-window.innerHeight, Math.min(window.innerHeight, distance)) * 100) / 100);
  }
  function schedule() {
    if (frame === null) frame = window.requestAnimationFrame(align);
  }
  for (const event of ['scroll', 'resize', 'pageshow', 'orientationchange', 'touchend']) {
    window.addEventListener(event, schedule, { passive: true });
  }
  viewport?.addEventListener('resize', schedule, { passive: true });
  viewport?.addEventListener('scroll', schedule, { passive: true });
  mobile.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  schedule();
})();

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
  // 18.09.2026, Natalies Screenshot: In der eingebetteten Browseransicht
  // (Link aus einer anderen App, oben "X", unten Teilen/Neu laden) fahren die
  // Browserleisten beim Scrollen ein und aus. Der sichtbare Bereich wird dabei
  // kleiner, ohne dass eine Tastatur offen ist - und die Leiste stand ein
  // Drittel des Bildschirms hoch mitten in der Tabelle. Angehoben wird deshalb
  // nur noch, wenn wirklich eingetippt wird; sonst haelt der Browser sie selbst.
  function editing() {
    const element = document.activeElement;
    if (!element || element === document.body) return false;
    if (element.isContentEditable) return true;
    const tag = String(element.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'select') return true;
    return tag === 'input' && !/^(?:button|checkbox|radio|range|submit|reset|file|image|color|hidden)$/i.test(element.type || 'text');
  }

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
    // Hochschieben nur bei offener Tastatur (siehe editing). Das
    // Herunterziehen an den echten Rand bei eingeklappter Browserleiste bleibt.
    if (distance > 0 && !editing()) return apply(0);
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
  // Tastatur auf und zu: Fokus rein und raus loest die Rechnung neu aus.
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  schedule();
})();

(function () {
  'use strict';
  const nav = document.querySelector('.ticker-app-nav');
  if (!nav) return;
  const mobile = window.matchMedia('(max-width: 760px)');
  const viewport = window.visualViewport;
  let offset = 0, frame = null;

  function align() {
    frame = null;
    if (!mobile.matches || (viewport?.scale || 1) > 1.01) {
      if (offset) nav.style.removeProperty('--ticker-nav-offset');
      offset = 0;
      return;
    }
    const height = viewport?.height || window.innerHeight;
    // WebKit can retain a keyboard offset after its viewport has expanded again.
    const top = height < window.innerHeight - 1 ? Math.max(0, viewport?.offsetTop || 0) : 0;
    const bottom = height + top;
    const rect = nav.getBoundingClientRect();
    if (!Number.isFinite(bottom) || bottom <= 0 || !rect.height) return;
    // Normally fixed positioning needs no correction. Compare actual geometry
    // after iOS viewport/keyboard changes; document scrollY is not a screen offset.
    const delta = bottom - rect.bottom;
    if (Math.abs(delta) < 1) return;
    offset = Math.round((offset + delta) * 100) / 100;
    nav.style.setProperty('--ticker-nav-offset', `${offset}px`);
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

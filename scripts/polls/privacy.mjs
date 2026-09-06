// Kept in the existing template pipeline: sensitive polls must not acquire
// cross-page identity/analytics through a later header/footer normalization.
export function assertPollScriptPolicy(html, { sensitive = false } = {}) {
  if (sensitive) {
    if (!html.includes('name="woek-private-interaction"') || !html.includes('content="no-referrer"') || !/<script\b[^>]*type="module"[^>]*src="\/assets\/js\/poll-visual\.js"/.test(html)) throw new Error('Sensitive poll requires its private interaction markers and visual runtime.');
    if (/<script\b[^>]*src="[^" ]*assets\/js\/(?:main|newsletter)\.js/.test(html)) throw new Error('Sensitive poll must not load cross-page analytics scripts.');
  } else if (!/<script\b[^>]*src="[^" ]*assets\/js\/main\.js\?v=[a-f0-9]{12}"/.test(html)) {
    throw new Error('Ordinary poll requires the versioned contextual-question integration.');
  }
}

export function minimiseSensitivePollHtml(html) {
  if(!html.includes('name="woek-private-interaction"'))return html;
  return html
    .replace(/<script\b[^>]*src="[^" ]*assets\/js\/(?:main|newsletter)\.js[^" ]*"[^>]*><\/script>/g,'')
    .replace(/<form\b[^>]*class="footer-newsletter-form"[\s\S]*?<\/form>/g,'<p><a class="btn btn-secondary" href="/wirkungsradar/newsletter/">Zum Wirkungsbrief anmelden</a></p>')
    .replace(/<div class="footer-newsletter-welcome"[\s\S]*?<\/div>/g,'');
}

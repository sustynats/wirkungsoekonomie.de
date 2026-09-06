// Kept in the existing template pipeline: sensitive polls must not acquire
// cross-page identity/analytics through a later header/footer normalization.
export function minimiseSensitivePollHtml(html) {
  if(!html.includes('name="woek-private-interaction"'))return html;
  return html
    .replace(/<script\b[^>]*src="[^" ]*assets\/js\/(?:main|newsletter)\.js[^" ]*"[^>]*><\/script>/g,'')
    .replace(/<form\b[^>]*class="footer-newsletter-form"[\s\S]*?<\/form>/g,'<p><a class="btn btn-secondary" href="/wirkungsradar/newsletter/">Zum Wirkungsbrief anmelden</a></p>')
    .replace(/<div class="footer-newsletter-welcome"[\s\S]*?<\/div>/g,'');
}

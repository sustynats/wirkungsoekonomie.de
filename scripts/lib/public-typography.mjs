// Publication text uses the ordinary ASCII hyphen consistently.
export function normalizePublicationTypography(text) {
  return String(text)
    .replace(/[\u2010-\u2015\u2212\u2e3a\u2e3b\ufe58\ufe63\uff0d]/g, '-')
    .replace(/&(?:ndash|mdash|hyphen|minus);/gi, '-')
    .replace(/&#(?:x0*(?:201[0-5]|2212|2e3[ab]|fe58|fe63|ff0d)|0*(?:820[8-9]|821[0-3]|8722|1183[4-5]|65112|65123|65293));/gi, '-');
}

export function hasNonstandardDash(text) {
  return normalizePublicationTypography(text) !== String(text);
}

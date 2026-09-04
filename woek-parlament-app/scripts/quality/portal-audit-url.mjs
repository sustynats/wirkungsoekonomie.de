import { canonicalPortalHref } from "../../lib/navigation.ts";

/** Audit the canonical response, not the body of a permanent redirect.
 * Redirect status/location are separately asserted by the P1 HTTP matrix.
 */
export function canonicalAuditUrl(value) {
  const url = new URL(value);
  return new URL(canonicalPortalHref(url.pathname + url.search + url.hash), url.origin).href;
}

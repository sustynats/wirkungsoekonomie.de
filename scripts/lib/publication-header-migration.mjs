import crypto from 'node:crypto';

const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const headerPattern = /<header\s+class="site-header"(?:\s+[a-z-]+(?:="[^"]*")?)*\s*>[\s\S]*?<\/header>/g;
const sharedImport = "import {renderSiteHeader} from '../lib/site-shell.mjs';\n";

// A byte-comparison proof of this one source extraction, not an exclusion from
// the publication gate. A changed number, formula, paragraph or other import
// fails even if somebody updates the after hash in the migration manifest.
export function verifyPublicationHeaderMigration(before, after, record) {
  if (hash(before) !== record.beforeSha256 || hash(after) !== record.afterSha256) return false;
  const headers = before.match(headerPattern) || [];
  if (headers.length !== 1) return false;
  const expected = sharedImport + before.replace(headerPattern, "${renderSiteHeader(base, 'de')}");
  return after === expected;
}

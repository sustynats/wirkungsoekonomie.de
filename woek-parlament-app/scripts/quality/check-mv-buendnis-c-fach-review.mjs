#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'buendnis-c', party: 'Bündnis C', artifactId: 'MV-LTW-2026-BUENDNIS-C-WAHLPROGRAMM', artifactUrl: 'https://mecklenburg-vorpommern.buendnis-c.de/wp-content/uploads/sites/3/2026/08/BC-M-V-LTW-2026-WAHLPROGRAMM.pdf', artifactSha256: '52465aa4ba287c0687a45138d7eff75272a5bf85c18b8e846e3cbe118db32443', artifactBytes: 473925, pageCount: 22 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

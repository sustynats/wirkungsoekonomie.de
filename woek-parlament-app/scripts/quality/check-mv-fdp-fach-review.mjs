#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'fdp', party: 'FDP', artifactId: 'MV-LTW-2026-FDP-WAHLPROGRAMM', artifactUrl: 'https://www.fdp-mv.de/sites/default/files/2026-06/Landtagswahlprogramm_2026_0.pdf', registerUrl: 'https://www.fdp-mv.de/programm', artifactSha256: '91699d395bd4af26ffb7c9f824fd892a4aca0e29737f856a5d3b189f7bf16b31', artifactBytes: 2583137, pageCount: 152 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

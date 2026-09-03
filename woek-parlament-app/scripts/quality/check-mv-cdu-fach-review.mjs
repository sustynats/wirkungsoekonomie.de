#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'cdu', party: 'CDU', artifactId: 'MV-LTW-2026-CDU-WAHLPROGRAMM', artifactUrl: 'https://cdu-mv.de/wp-content/uploads/2026/06/Wahlprogramm-CDU-MV-2026.pdf', registerUrl: 'https://cdu-mv.de/programme/', artifactSha256: 'a33653bbe873666bf337522c51778e7b32a768e75d716b0e3483781d27a6c72e', artifactBytes: 1197976, pageCount: 139 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

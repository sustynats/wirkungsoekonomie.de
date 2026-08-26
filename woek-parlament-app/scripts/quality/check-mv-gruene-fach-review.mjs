#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'gruene', party: 'BÜNDNIS 90/DIE GRÜNEN', artifactId: 'MV-LTW-2026-GRUENE-WAHLPROGRAMM', artifactUrl: 'https://gruene-mv.de/?wpdmdl=33772', registerUrl: 'https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-1/', artifactSha256: 'a3ddd454f4612460ace9deb2c4789e161a37f62f0abfa9e5c12d7f9878377ee3', artifactBytes: 15989661, pageCount: 112 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

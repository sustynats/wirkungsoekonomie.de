#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'pdf', party: 'PdF', artifactId: 'MV-LTW-2026-PDF-WAHLPROGRAMM', artifactUrl: 'https://partei-des-fortschritts.de/wp-content/uploads/2026/06/2026-05_wahlprogramm_MV.pdf', artifactSha256: '418ccadca7e8f63ae3f9b5f2ca436b2045d41e803fa44eddbbb93947b74e543b', artifactBytes: 163254, pageCount: 53 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'piraten', party: 'PIRATEN', artifactId: 'MV-LTW-2026-PIRATEN-WAHLPROGRAMM', artifactUrl: 'https://piratenpartei-mv.de/wp-content/uploads/2026/04/finalwp2026_lek.pdf', artifactSha256: '033643c4deabd8ac5c414ba2276ca25906418e0349143bff1dc0fb1d3c4d13a1', artifactBytes: 145496, pageCount: 5, tocPages: [1], tocBlockRefs: { 2: [1] } };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'linke', party: 'Die Linke', artifactId: 'MV-LTW-2026-LINKE-LANGWAHLPROGRAMM', artifactUrl: 'https://wahlprogramm26.die-linke-mv.de/wp-content/uploads/sites/77/2026/08/LINKE-MV_LTW26_Langwahlprogramm_A4_web.pdf', registerUrl: 'https://wahlprogramm26.die-linke-mv.de/', artifactSha256: 'c26d2be501a05e820ed6761d75d0b2468ffbeb06859b967e3b8836129779fb6e', artifactBytes: 918713, pageCount: 30 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

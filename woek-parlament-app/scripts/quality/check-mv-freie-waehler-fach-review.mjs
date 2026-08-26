#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'freie-waehler', party: 'FREIE WÄHLER', artifactId: 'MV-LTW-2026-FREIE-WAEHLER-WAHLPROGRAMM', artifactUrl: 'https://freie-waehler-mv.eu/wp-content/uploads/2026/06/LTW_2026_Wahlprogramm_FW-M-V_A5_interaktiv.pdf', artifactSha256: '9e6295ac5a691cf4b4483736e1cf87a5b95192e122f43bbb8ca5a3cb9b67554c', artifactBytes: 3451433, pageCount: 34 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

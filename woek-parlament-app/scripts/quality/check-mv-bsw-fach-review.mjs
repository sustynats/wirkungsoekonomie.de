#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'bsw', party: 'BSW', artifactId: 'MV-LTW-2026-BSW-LANDESWAHLPROGRAMM', artifactUrl: 'https://mv.bsw-vg.de/wp-content/uploads/2026/04/Landeswahlprogramm-2026.pdf', registerUrl: 'https://mv.bsw-vg.de/landtagswahl-2026/', artifactSha256: '062b284d3e91919c673a2746c53c9d4e14ef8b1ab4b82699782789ec483c7968', artifactBytes: 1184670, pageCount: 94 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

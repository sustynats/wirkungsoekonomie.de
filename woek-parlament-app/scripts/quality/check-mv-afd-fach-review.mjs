#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'afd', party: 'AfD', artifactId: 'MV-LTW-2026-AFD-REGIERUNGSPROGRAMM', artifactUrl: 'https://afd-mv.de/wp-content/uploads/2026/06/AfD-Regierungsprogramm-Mecklenburg-Vorpommern-2026.pdf', registerUrl: 'https://afd-mv.de/blaue-wende-2026/', artifactSha256: '44087592fed7d8943d44019722def861947cf72acd203bf3b802deb6873ec8b0', artifactBytes: 1580871, pageCount: 93 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

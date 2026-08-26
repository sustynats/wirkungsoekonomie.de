#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'volt', party: 'Volt', artifactId: 'MV-LTW-2026-VOLT-WAHLPROGRAMM', artifactUrl: 'https://voltdeutschland.org/storage/assets-mv/pdf/haltungzeigen_wahlprogramm_voltmv_ltw26.pdf', artifactSha256: 'a992f71adf0b37a633c60d9ac1e8923680e8a7e01ac428bf2e86036294e57663', artifactBytes: 1725660, pageCount: 67 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

#!/usr/bin/env node
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { loadMvReviewBundle, validateMvReviewBundle } from './check-mv-full-programme-review.mjs';
export const PROFILE = { slug: 'spd', party: 'SPD', artifactId: 'MV-LTW-2026-SPD-REGIERUNGSPROGRAMM', artifactUrl: 'https://spd-mv.de/uploads/bilderpool/2-Mecklenburg-Vorpommern/Wahlen-und-Kandidaturen/2026-Landtagswahlen/SPD_MV_Programm_2026.pdf', registerUrl: 'https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031', artifactSha256: 'b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc', artifactBytes: 1072223, pageCount: 95 };
export const load = () => loadMvReviewBundle(PROFILE); export const validate = (bundle, options) => validateMvReviewBundle(bundle, PROFILE, options);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.stdout.write(`${JSON.stringify(validate(load()), null, 2)}\n`);

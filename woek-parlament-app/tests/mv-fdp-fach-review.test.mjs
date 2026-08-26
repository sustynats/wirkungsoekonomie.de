import { load, validate } from '../scripts/quality/check-mv-fdp-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'FDP', load, validate });

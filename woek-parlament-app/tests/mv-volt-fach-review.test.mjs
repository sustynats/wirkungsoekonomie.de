import { load, validate } from '../scripts/quality/check-mv-volt-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'Volt', load, validate });

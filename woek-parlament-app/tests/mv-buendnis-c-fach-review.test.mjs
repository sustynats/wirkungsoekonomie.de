import { load, validate } from '../scripts/quality/check-mv-buendnis-c-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'Bündnis C', load, validate });

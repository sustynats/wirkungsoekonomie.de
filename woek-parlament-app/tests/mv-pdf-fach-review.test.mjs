import { load, validate } from '../scripts/quality/check-mv-pdf-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'PdF', load, validate });

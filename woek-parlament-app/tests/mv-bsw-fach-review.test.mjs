import { load, validate } from '../scripts/quality/check-mv-bsw-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'BSW', load, validate });

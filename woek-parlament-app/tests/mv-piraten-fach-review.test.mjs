import { load, validate } from '../scripts/quality/check-mv-piraten-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'PIRATEN', load, validate });

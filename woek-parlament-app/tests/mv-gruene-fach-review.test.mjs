import { load, validate } from '../scripts/quality/check-mv-gruene-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'BÜNDNIS 90/DIE GRÜNEN', load, validate });

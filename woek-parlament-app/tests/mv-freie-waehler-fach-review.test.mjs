import { load, validate } from '../scripts/quality/check-mv-freie-waehler-fach-review.mjs';
import { registerMvFullProgrammeReviewTests } from './mv-full-programme-review-contract.mjs';
registerMvFullProgrammeReviewTests({ party: 'FREIE WÄHLER', load, validate });

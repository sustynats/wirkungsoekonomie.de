import {applyIooiPrecisionNotices} from '../lib/iooi-precision.mjs';
console.log(`IOOI precision: ${applyIooiPrecisionNotices(process.argv[2] || '.').length} publication surfaces updated.`);

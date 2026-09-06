import {applyStateBenchmarkUpdate} from '../lib/state-benchmark-update.mjs';
console.log(`State benchmark update: ${applyStateBenchmarkUpdate(process.argv[2]||'.')} publication surfaces.`);

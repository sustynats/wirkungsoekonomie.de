#!/usr/bin/env node

// Compatibility entrypoint retained for callers that have not yet renamed the
// old Combined-v2 checker. The rejected 12/12 matrix is historical evidence;
// every current gate validates the fail-closed Berlin Fach-truth v3 matrix.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadBerlinFachTruthResidual,
  validateBerlinFachTruthResidual,
} from './check-berlin-fach-truth-residual.mjs';

export const loadBerlinCombinedTerminalMatrix = loadBerlinFachTruthResidual;
export const validateBerlinCombinedTerminalMatrix = validateBerlinFachTruthResidual;

function main() {
  process.stdout.write(`${JSON.stringify(
    validateBerlinCombinedTerminalMatrix(loadBerlinCombinedTerminalMatrix()),
    null,
    2,
  )}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

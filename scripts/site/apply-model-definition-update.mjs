import {applyModelDefinitionUpdate} from '../lib/model-definition-update.mjs';
console.log(`Model definition: ${applyModelDefinitionUpdate(process.argv[2]||'.')} central publication surfaces.`);

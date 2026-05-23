import { applyLiveReferenceLayer } from "./live-reference-core.mjs";

const changes = applyLiveReferenceLayer();
console.log(`Built live-reference delta layer with ${changes.length} changelog entries.`);

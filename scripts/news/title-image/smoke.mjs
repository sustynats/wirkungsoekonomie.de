// Real, credential-free renderer check on the same Linux/Chrome as publication.
import assert from "node:assert/strict";
import { renderTitleImageFromStory, SIZES } from "./index.mjs";
import { rasterize } from "./rasterize.mjs";
import { inspectImage } from "./image-file.mjs";

const story = { story_id: "wt-1234567890abcdef", title: "Neue Regeln für die Stromnetze", source_summary: "Eine Testvorlage für eine neutrale Nachricht über die Planung der Stromnetze.", topic: ["Energie"], analysis: { status: "Entwurf", analysis_type: "ex_ante", human: { relevance: "mittel" } } };
const failures = [];
let original;
for (let iteration = 0; iteration < 4; iteration++) {
  for (const [size, dimensions] of Object.entries(SIZES)) {
    try {
      const editorial = iteration % 2 === 1 && original;
      const { svg } = renderTitleImageFromStory(story, { mode: editorial ? "editorial" : "impact_card", image: editorial ? {src:`data:image/png;base64,${original.toString("base64")}`} : null, size, headlineVisible: size !== "wide" });
      const result = await rasterize(svg, { ...dimensions, prefer: "chrome" });
      const info = inspectImage(result.png, { minWidth: dimensions.width });
      assert.equal(info.width, dimensions.width); assert.equal(info.height, dimensions.height);
      original ||= result.png;
      console.log(`TITLE_RASTER_OK ${iteration} ${size} ${result.png.length}`);
    } catch (error) {
      failures.push(`${iteration}/${size}: ${error.message}`);
      console.error(failures.at(-1));
    }
  }
}
assert.deepEqual(failures, [], "Every production-size image must rasterize reliably");

/** Structure contract §3.7: CIEDE2000, not RGB distance.
 * Known color-vision / gold-contrast limitations are NOT relabelled as safe.
 * https://colorjs.io/docs/color-difference
 * https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Color from "colorjs.io";

const palette = (process.argv[2] ?? "#1f6f5c,#a54537,#c8a24a,#7a8798").split(",");
assert.equal(process.argv.includes("--mode") ? process.argv[process.argv.indexOf("--mode") + 1] : "light", "light");
assert.deepEqual(palette, ["#1f6f5c", "#a54537", "#c8a24a", "#7a8798"]);
const colors = palette.map((value) => new Color(value));
const pairs = colors.flatMap((left, i) => colors.slice(i + 1).map((right, offset) => ({
  pair: [palette[i], palette[i + offset + 1]], deltaE2000: left.deltaE(right, "2000"),
})));
assert.ok(pairs.every((pair) => pair.deltaE2000 >= 15), "normal-vision status pairs require ΔE2000 >= 15");
const component = readFileSync(new URL("../app/components/ImpactSignature.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/impact-signature.css", import.meta.url), "utf8");
assert.match(component, /directionSymbols\[direction.kind\]/);
assert.match(component, /<span>\{direction.label\}<\/span>/);
assert.doesNotMatch(component, /\btitle=/);
assert.match(css, /signature-mark--ambivalent\s*\{[^}]*linear-gradient\(90deg, var\(--farbe-status-negativ\) 50%, var\(--farbe-status-positiv\) 50%\)/);
assert.doesNotMatch(css, /--farbe-status-ambivalent/);
assert.ok(new Color("#1b2431").contrast(new Color("#ffffff"), "WCAG21") >= 4.5);
console.log(JSON.stringify({
  status: "PASS_WITH_REQUIRED_REDUNDANT_ENCODING", algorithm: "CIEDE2000", pairs,
  gold_on_white_contrast: colors[2].contrast(new Color("#ffffff"), "WCAG21"),
  limitations: ["Color-only discrimination is not approved; red/green deficiency remains.", "Gold is not normal text on white. Symbols and visible labels use high-contrast ink."],
  required_browser_gate: "every direction has symbol + visible wording; three named axes; forced-colors preserves meaning",
}, null, 2));

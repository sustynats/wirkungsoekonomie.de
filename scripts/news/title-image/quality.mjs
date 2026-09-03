import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { imageError } from "./policy.mjs";
const exec = promisify(execFile);
export const VISUAL_GATE_VERSION = "text-free-2";
export function detectedWords(tsv, minimumConfidence = 60) {
  return String(tsv).split(/\r?\n/).slice(1).flatMap((row) => {
    const columns = row.split("\t"), word = columns.slice(11).join(" ").trim();
    return Number(columns[10]) >= minimumConfidence && /[\p{L}\p{N}]{3,}/u.test(word) ? [word] : [];
  });
}
export async function checkEditorialAsset(file, { run = exec } = {}) {
  async function read(segmentation) {
    let stdout;
    try { ({ stdout } = await run("tesseract", [file, "stdout", "-l", "eng", "--psm", segmentation, "tsv"], { timeout: 12000, maxBuffer: 1024 * 1024 })); }
    catch { throw imageError("IMAGE_QUALITY_CHECK_UNAVAILABLE"); }
    if (!String(stdout).startsWith("level\t")) throw imageError("IMAGE_QUALITY_CHECK_INVALID");
    return stdout;
  }
  const sparse = await read("11");
  if (detectedWords(sparse, 90).length) throw imageError("IMAGE_CONTAINS_TEXT");
  const candidates = detectedWords(sparse);
  if (candidates.length) {
    // Sparse OCR can hallucinate short words in abstract wiring or geometry.
    // Ambiguous detections must recur under independent block segmentation;
    // strong detections still fail immediately. A missing checker never passes.
    const normalize = (word) => word.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    const block = await read("6");
    const confirmed = new Set(detectedWords(block).map(normalize));
    if (detectedWords(block, 90).length || candidates.some((word) => confirmed.has(normalize(word)))) throw imageError("IMAGE_CONTAINS_TEXT");
  }
  return { version: VISUAL_GATE_VERSION, status: "passed", method: "tesseract-sparse-with-block-confirmation", note: "Automated text detection, not a guarantee of all visual properties." };
}

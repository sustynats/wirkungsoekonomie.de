import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { imageError } from "./policy.mjs";
const exec = promisify(execFile);
export const VISUAL_GATE_VERSION = "text-free-1";
export function detectedWords(tsv) {
  return String(tsv).split(/\r?\n/).slice(1).flatMap((row) => {
    const columns = row.split("\t"), word = columns.slice(11).join(" ").trim();
    return Number(columns[10]) >= 60 && /[\p{L}\p{N}]{3,}/u.test(word) ? [word] : [];
  });
}
export async function checkEditorialAsset(file, { run = exec } = {}) {
  let stdout;
  try { ({ stdout } = await run("tesseract", [file, "stdout", "-l", "eng", "--psm", "11", "tsv"], { timeout: 25000, maxBuffer: 1024 * 1024 })); }
  catch { throw imageError("IMAGE_QUALITY_CHECK_UNAVAILABLE"); }
  if (!String(stdout).startsWith("level\t")) throw imageError("IMAGE_QUALITY_CHECK_INVALID");
  if (detectedWords(stdout).length) throw imageError("IMAGE_CONTAINS_TEXT");
  return { version: VISUAL_GATE_VERSION, status: "passed", method: "tesseract-english-sparse-text", note: "Automated text detection, not a guarantee of all visual properties." };
}

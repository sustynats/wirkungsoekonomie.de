import fs from "node:fs";

// Reuse the website's SDG catalogue; never infer a goal from a news topic.
const catalogue = JSON.parse(fs.readFileSync(new URL("../../assets/data/sdg-reference.json", import.meta.url), "utf8"));
const goalNames = new Map(catalogue.filter((goal) => goal.type === "sdg" && goal.isOfficialUNGoal)
  .map((goal) => [goal.number, goal.title.replace(/^SDG\s+\d+\s*[-–—]\s*/u, "")]));
const goalNumber = "(?:1[0-7]|[1-9])(?![\\p{L}\\d]|\\.[\\p{L}\\d])";
const goalChain = new RegExp(`\\bSDGs?\\s+${goalNumber}(?:(?:\\s*,\\s*|\\s+(?:und|oder)\\s+)(?:SDG\\s+)?${goalNumber})*`, "giu");
const goalToken = new RegExp(`\\bSDG\\s+(${goalNumber})`, "giu");

export function formatReferenceFramework(value = "") {
  // Expand only explicit numbered lists, including "SDG 7, 9 und 13".
  // Years, indicator/target IDs (e.g. 7.1), SDG+ and other frameworks stay intact.
  const text = String(value).replace(goalChain, (chain) => chain
    .replace(/\bSDGs?\s+/giu, "")
    .replace(/\d+/gu, (number) => `SDG ${number}`));
  return text.replace(goalToken, (token, number, offset) => {
    const name = goalNames.get(Number(number));
    if (!name) return token;
    const following = text.slice(offset + token.length).replace(/^\s*[-–—:(]?\s*/u, "");
    // Keep already named references unchanged, also when rendered again.
    if (following.toLocaleLowerCase("de").startsWith(name.toLocaleLowerCase("de"))) return token;
    return `SDG ${number} – ${name}`;
  });
}

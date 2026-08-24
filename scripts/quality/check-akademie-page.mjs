import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../../akademie.html", import.meta.url), "utf8");
const structureHtml = await readFile(new URL("../../akademie/studienstruktur.html", import.meta.url), "utf8");
const examHtml = await readFile(new URL("../../akademie/pruefungen.html", import.meta.url), "utf8");

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const lectureIds = new Set([...structureHtml.matchAll(/data-lecture-id="([^"]+)"/g)].map((match) => match[1]));
const sectionMatches = structureHtml.match(/<summary><span>Teil \d+<\/span>/g) ?? [];
const publicHtml = `${html}\n${structureHtml}\n${examHtml}`;
const headingsByPage = [html, structureHtml, examHtml].map((pageHtml) => [...pageHtml.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((match) => ({
  level: Number(match[1]),
  text: stripTags(match[2])
})));
const unlabeledButtons = [...publicHtml.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter(([, attrs, body]) => {
  return !stripTags(body) && !/aria-label="[^"]+"/.test(attrs);
});
const unlabeledLinks = [...publicHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].filter(([, attrs, body]) => {
  return !stripTags(body) && !/aria-label="[^"]+"/.test(attrs);
});

assert(html.includes("https://akademie.wirkungsoekonomie.de/"), "Akademie-App-Link fehlt.");
assert(sectionMatches.length === 10, `Erwartet 10 Studienabschnitte, gefunden: ${sectionMatches.length}.`);
assert(lectureIds.size === 120, `Erwartet 120 eindeutige Vorlesungs-IDs, gefunden: ${lectureIds.size}.`);
assert(/(?:nicht staatlich anerkannt|kein staatlich anerkannter akademischer oder beruflicher Abschluss)/.test(publicHtml), "Zertifikatshinweis zur fehlenden staatlichen Anerkennung fehlt.");
assert(/id="faq"/.test(examHtml) && /faq-accordion/.test(examHtml), "FAQ-Bereich fehlt.");
assert(examHtml.includes("Ph.WÖk ist die interne Meisterstufe der Akademie für Wirkungsökonomie. Die Bezeichnung dient der internen Vertiefung, Lehrbefähigung und Weiterentwicklung der Denkschule. Sie ist kein akademischer Grad."), "Ph.WÖk-Hinweis fehlt.");
assert(!/Ph\.WÖk\s+(?:ist|als|=)\s+(?:ein\s+)?akademischer Grad/.test(publicHtml), "Ph.WÖk darf nicht als akademischer Grad erscheinen.");
assert(!/Zertifikat[^.]{0,120}ist staatlich anerkannt/.test(publicHtml), "Zertifikat darf nicht als staatlich anerkannt erscheinen.");
assert(unlabeledButtons.length === 0, `Buttons ohne verständliches Label gefunden: ${unlabeledButtons.length}.`);
assert(unlabeledLinks.length === 0, `Links ohne verständliches Label gefunden: ${unlabeledLinks.length}.`);
assert(/<details[\s\S]*?<summary>/.test(structureHtml), "Accordion mit details/summary fehlt.");
assert(/class="btn btn-primary academy-primary-cta"/.test(html), "Prominenter CTA mit erwarteter Klasse fehlt.");
assert((html.match(/data-analytics-event="academy_app_cta"/g) ?? []).length >= 3, "Akademie-App-CTA-Analytics fehlen.");

for (const headings of headingsByPage) {
  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];
    if (current.level > previous.level + 1) {
      failures.push(`Überschriftenhierarchie springt von H${previous.level} zu H${current.level}: ${current.text}`);
    }
  }
}

if (failures.length) {
  console.error(["Akademie-Hauptseitencheck fehlgeschlagen:", ...failures.map((item) => `- ${item}`)].join("\n"));
  process.exit(1);
}

console.log("Akademie-Hauptseitencheck bestanden.");

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const appRoot = join(process.cwd(), "app");
const failures = [];

function source(path) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function tsxFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.isFile() && entry.name.endsWith(".tsx") ? [path] : [];
  });
}

function gate(name, condition, detail) {
  if (!condition) failures.push(`${name}: ${detail}`);
}

const contract = source("app/components/SamePageNavigation.tsx");
const decision = source("app/entscheidungen/[slug]/page.tsx");
const audience = source("app/components/AudienceModeSwitch.tsx");
const sourcesPage = source("app/quellen/page.tsx");
const governmentFilter = source("app/regierung/akte/page.tsx");
const caseCard = source("app/components/CaseCard.tsx");
const layout = source("app/layout.tsx");

gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", /<Link \{\.\.\.props\} scroll=\{false\} \/>/.test(contract), "shared state Link must force Next.js scroll preservation");
gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", /router\.push\(target, \{ scroll: false \}\)/.test(contract), "shared GET form must preserve viewport");
gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", /visibleDecisionViews\.map\(\(view\) => <SamePageStateLink/.test(decision) && /\?ansicht=\$\{view\.id\}/.test(decision), "all decision pills must use the shared contract");
gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", (audience.match(/<SamePageStateLink\b/g) ?? []).length === 2, "both audience modes must use the shared contract");
gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", /<SamePageQueryForm className="source-archive-search"/.test(sourcesPage), "source query form must use the shared contract");
gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", /<SamePageQueryForm className="government-filter"/.test(governmentFilter), "government filters must use the shared contract");

gate("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED", !/SamePageStateLink|scroll=\{false\}/.test(caseCard), "case-card cross-page links must keep framework default scrolling");
gate("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED", !/SamePageStateLink|scroll=\{false\}/.test(layout), "global cross-page navigation must keep framework default scrolling");
gate("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED", /function CrossPageQueryLink[\s\S]*?<Link \{\.\.\.props\} scroll=\{true\}/.test(contract), "prefiltered cross-page destinations must retain normal page scrolling");
gate("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED", /<Link href=\{`\/quellen\?\$\{new URLSearchParams/.test(sourcesPage), "result pagination must remain normal page navigation");
gate("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED", /<html lang="de" data-scroll-behavior="smooth">/.test(layout), "Next.js must be told about the intentional global smooth-scroll CSS");

for (const file of tsxFiles(appRoot)) {
  const contents = readFileSync(file, "utf8");
  const name = relative(process.cwd(), file);
  gate("NO_HASH_PLACEHOLDER_SCROLL_TRAPS", !/href\s*=\s*(?:["']#["']|\{["']#["']\})/.test(contents), `${name} contains an empty hash target`);
  for (const match of contents.matchAll(/<button\b([^>]*)>/gs)) {
    gate("NON_SUBMIT_UI_BUTTONS_EXPLICIT_TYPE", /\btype\s*=/.test(match[1]), `${name} contains a button without explicit type`);
  }
  for (const match of contents.matchAll(/<(Link|SamePageStateLink|CrossPageQueryLink)\b[\s\S]*?>/g)) {
    const [tag, component] = match;
    const hasQueryTarget = /href\s*=\s*(?:["'][^"']*\?|\{`[^`]*\?)/.test(tag);
    if (!hasQueryTarget || component === "SamePageStateLink") continue;
    if (component === "CrossPageQueryLink") {
      // These institutional pages navigate TO the register; they do not filter themselves.
      gate("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED", name.startsWith("app/ebenen/") && /href="\/wirkungsakten\?/.test(tag), `${name} misclassifies a same-page state change`);
      continue;
    }
    const isResultPagination = name === "app/quellen/page.tsx" && /\/quellen\?/.test(tag);
    gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", isResultPagination, `${name} contains an unclassified query Link outside the shared contract`);
  }
  const ownsSharedQueryForm = name === "app/components/SamePageNavigation.tsx";
  gate("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL", ownsSharedQueryForm || !/<form\b[^>]*\bmethod=["']get["']/i.test(contents), `${name} contains a native GET form outside the shared contract`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("SAME_PAGE_QUERY_NAV_PRESERVES_SCROLL=PASS");
console.log("CROSS_PAGE_NAV_DEFAULT_SCROLL_UNCHANGED=PASS");
console.log("NO_HASH_PLACEHOLDER_SCROLL_TRAPS=PASS");
console.log("NON_SUBMIT_UI_BUTTONS_EXPLICIT_TYPE=PASS");

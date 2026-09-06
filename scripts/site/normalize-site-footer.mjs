import fs from "node:fs";
import { minimiseSensitivePollHtml } from '../polls/privacy.mjs';
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const navigation = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/navigation.json"), "utf8"));
const footerTemplate = fs.readFileSync(path.join(ROOT, "templates/footer.html"), "utf8");

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[char]);
}

function navMatch(item) {
  return (item.match || [item.href]).join("|");
}

function prefixFor(filePath) {
  const relative = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const dir = path.dirname(relative);
  return dir === "." ? "" : dir.split("/").map(() => "../").join("");
}

function toPosixRelative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function navLink(item, base) {
  return `<a href="${base}${escapeHtml(item.href)}" data-nav-match="${escapeHtml(navMatch(item))}">${escapeHtml(item.label)}</a>`;
}

function footerGroup(group, base) {
  return `<div class="footer-nav-group">
      <h3>${escapeHtml(group.title)}</h3>
      <div class="footer-nav-links">
${group.items.map((item) => `          ${navLink(item, base)}`).join("\n")}
      </div>
    </div>`;
}

function renderFooter(base) {
  const footerNav = (navigation.footerGroups || [])
    .map((group) => footerGroup(group, base))
    .join("\n    ");
  const footerLegal = (navigation.footerLegal || [])
    .map((item) => navLink(item, base))
    .join("\n");

  return footerTemplate
    .replaceAll("{{BASE}}", base)
    .replace("{{FOOTER_NAV}}", footerNav)
    .replace("{{FOOTER_LEGAL_NAV}}", footerLegal);
}

function footerFiles() {
  const output = execFileSync("git", ["ls-files", "*.html"], {
    cwd: ROOT,
    encoding: "utf8", maxBuffer: 512 * 1024 * 1024,
  }).trim();

  if (!output) return [];

  return output
    .split("\n")
    .map((file) => path.join(ROOT, file))
    .filter((file) => {
      const relative = toPosixRelative(file);
      if (relative.startsWith("templates/")) return false;
      if (relative.startsWith("en/")) return false;
      if (relative === "methodenraum.html" || relative.startsWith("methodenraum/")) return false;
      return fs.existsSync(file);
    })
    .filter((file) => fs.readFileSync(file, "utf8").includes('<footer class="footer"'));
}

let changed = 0;

for (const filePath of footerFiles()) {
  const before = fs.readFileSync(filePath, "utf8");
  const after = minimiseSensitivePollHtml(before.replace(
    /<footer class="footer"[\s\S]*?<\/footer>(?:\s*>?\s*<script defer src="[^"]*assets\/js\/newsletter\.js[^"]*"><\/script>)*\n*/,
    `${renderFooter(prefixFor(filePath)).trimEnd()}\n`,
  ));

  if (after !== before) {
    fs.writeFileSync(filePath, after);
    changed += 1;
  }
}

console.log(`normalized site footers: ${changed}`);

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "../..");
const mainSiteRoot = path.resolve(appRoot, "..");

function fail(message) {
  console.error(`Privacy governance check failed: ${message}`);
  process.exitCode = 1;
}

const [registerRaw, noticeSource, privacyPage] = await Promise.all([
  readFile(path.join(appRoot, "data/privacy-release-register.json"), "utf8"),
  readFile(path.join(appRoot, "lib/privacy-notice.ts"), "utf8"),
  readFile(path.join(mainSiteRoot, "datenschutz.html"), "utf8")
]);

let register;
try {
  register = JSON.parse(registerRaw);
} catch {
  fail("data/privacy-release-register.json is not valid JSON.");
  process.exit();
}

if (!/^\d{4}-\d{2}-\d{2}\.\d+$/.test(register.privacy_notice_version ?? "")) {
  fail("the privacy notice version is missing or invalid.");
}
if (!noticeSource.includes(`version: \"${register.privacy_notice_version}\"`)) {
  fail("the consent code and the privacy release register use different versions.");
}
if (!Array.isArray(register.review_scope) || register.review_scope.length === 0) {
  fail("the release register has no documented review scope.");
}
for (const [key, expected] of Object.entries({ advertising_networks: false, google_analytics: false, mailchimp: false, email_open_tracking: false, email_click_tracking: false })) {
  if (register.tracking?.[key] !== expected) fail(`tracking policy ${key} must be explicitly ${expected}.`);
}
for (const requiredText of ["Wirkungsradar", "Double Opt-in", "Vercel", "Supabase", "IONOS", "Google Analytics", "Mailchimp"]) {
  if (!privacyPage.includes(requiredText)) fail(`the public privacy notice is missing: ${requiredText}.`);
}

if (!process.exitCode) console.log("Privacy governance check passed.");

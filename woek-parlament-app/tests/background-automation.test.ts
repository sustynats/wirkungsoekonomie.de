import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const text = (file: string) => readFileSync(file, "utf8");

test("political updates and the end-of-day digest are scheduled on Vercel", () => {
  const vercel = JSON.parse(text("vercel.json"));
  assert.equal(vercel.crons.some((cron: { path: string; schedule: string }) => cron.path === "/api/cron/political-autopilot" && cron.schedule === "0 4,5,14,15 * * *"), true);
  assert.equal(vercel.crons.some((cron: { path: string; schedule: string }) => cron.path === "/api/cron/political-daily-digest" && cron.schedule === "0 20,21,22 * * *"), true);
  for (const route of ["app/api/cron/political-autopilot/route.ts", "app/api/cron/political-daily-digest/route.ts"]) {
    const source = text(route);
    assert.match(source, /runtime = "nodejs"/);
    assert.match(source, /CRON_SECRET/);
    assert.match(source, /Bearer/);
  }
});

test("scheduled runtime uses remote Dropbox OAuth and never a local Dropbox mount", () => {
  const client = text("lib/dropbox/app-client.ts");
  assert.match(client, /https:\/\/api\.dropboxapi\.com\/2/);
  assert.match(client, /\$\{dropboxApi\}\/oauth2\/token/);
  assert.match(client, /https:\/\/content\.dropboxapi\.com\/2/);
  assert.match(client, /DROPBOX_REFRESH_TOKEN/);
  const runtime = [
    "lib/autopilot/runner.ts",
    "lib/government/daily-impact-ingest.ts",
    "lib/parliament/daily-ingest.ts",
    "lib/autopilot/daily-digest-runner.ts",
  ].map(text).join("\n");
  assert.equal(/\/Users\//.test(runtime), false);
  assert.equal(/Dropbox\//.test(runtime), false);
});

test("the server-side digest includes verified government and parliament deployments", () => {
  const source = text("lib/autopilot/daily-digest-runner.ts");
  assert.match(source, /pendingParliamentDigestChanges/);
  assert.match(source, /pendingGovernmentDigestChanges/);
  assert.match(source, /sourceDeploymentIds/);
  assert.match(source, /markGovernmentDigestDeployments/);
  assert.match(source, /markParliamentDigestDeployments/);
});

test("newsletter delivery is server-side, consent-based and legally complete", () => {
  const digest = text("lib/wirkungsradar/daily-digest.ts");
  assert.match(digest, /status=eq\.ACTIVE/);
  assert.match(digest, /createIonosTransport/);
  assert.match(digest, /List-Unsubscribe/);
  assert.match(digest, /List-Unsubscribe-Post/);
  assert.match(digest, /privacyUrl/);
  assert.match(digest, /imprintUrl/);
  assert.match(digest, /recurringUnsubscribeToken/);
  assert.match(text("lib/wirkungsradar/email-templates.ts"), /Abmelden|abbestellen/i);
});

test("all background credentials are server environment variables", () => {
  const env = text(".env.example");
  for (const key of [
    "CRON_SECRET", "DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN",
    "GOVERNMENT_DAILY_PRODUCTION_DEPLOY_HOOK", "PARLIAMENT_DAILY_PRODUCTION_DEPLOY_HOOK",
    "WIRKUNGSRADAR_DAILY_DIGEST_ENABLED", "WIRKUNGSRADAR_SMTP_HOST", "WIRKUNGSRADAR_SMTP_USER", "WIRKUNGSRADAR_SMTP_PASSWORD",
  ]) assert.match(env, new RegExp(`^${key}=`, "m"), key);
});

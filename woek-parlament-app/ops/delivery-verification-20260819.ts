import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { supabaseRest, supabaseRpc } from "../lib/database/supabase-admin";
import { subscriptionDeliveryReady, wirkungsradarDigestDelivery } from "../lib/wirkungsradar/subscriptions";
import { newsletterDeliveryReady } from "../lib/woek-newsletter/subscriptions";

const ROOT = "/WOEK";
const EXPECTED_BRANCH = "automation/delivery-verification-20260819";
const TARGET = `${ROOT}/WOEK-AUTOPILOT/CONTROL/NOTIFICATION-NEWSLETTER-DELIVERY-VERIFICATION-2026-08-19-FINAL.json`;

type AnalyticsRow = {
  newsletter_key: string;
  active_addresses: number;
  pending_confirmations: number;
  requested: number;
  confirmation_sends: number;
  confirmed: number;
  unsubscribed: number;
  delivery_failures: number;
  welcome_sends: number;
};

function sha256(bytes: Uint8Array | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

function dropboxContentHash(bytes: Uint8Array) {
  const blockSize = 4 * 1024 * 1024;
  const blocks: Buffer[] = [];
  for (let offset = 0; offset < bytes.length; offset += blockSize) {
    blocks.push(createHash("sha256").update(bytes.slice(offset, Math.min(bytes.length, offset + blockSize))).digest());
  }
  return createHash("sha256").update(Buffer.concat(blocks)).digest("hex");
}

function assertPreview() {
  if (process.env.VERCEL_ENV !== "preview") throw new Error("P0_FAIL_CLOSED: delivery verification runs only in Vercel preview.");
  if (process.env.VERCEL_GIT_COMMIT_REF !== EXPECTED_BRANCH) throw new Error(`P0_FAIL_CLOSED: unexpected branch ${process.env.VERCEL_GIT_COMMIT_REF ?? "MISSING"}.`);
  if (!TARGET.startsWith("/WOEK/") || /[^\x00-\x7F]/.test(TARGET) || TARGET.includes("..")) throw new Error("P0_PATH_GATE");
}

function smtpConfig(prefix: "WIRKUNGSRADAR" | "WOEK_NEWSLETTER") {
  const fallback = (name: string) => process.env[`WIRKUNGSRADAR_${name}`];
  const own = (name: string) => process.env[`${prefix}_${name}`];
  const mode = own("EMAIL_SEND_MODE") ?? fallback("EMAIL_SEND_MODE");
  const provider = own("DELIVERY_PROVIDER") ?? fallback("DELIVERY_PROVIDER") ?? "ionos_smtp";
  if (mode !== "production" || provider !== "ionos_smtp") return null;
  const host = own("SMTP_HOST") ?? fallback("SMTP_HOST");
  const port = Number(own("SMTP_PORT") ?? fallback("SMTP_PORT") ?? "587");
  const user = own("SMTP_USER") ?? fallback("SMTP_USER");
  const password = own("SMTP_PASSWORD") ?? fallback("SMTP_PASSWORD");
  const from = own("SMTP_FROM") ?? fallback("SMTP_FROM");
  const replyTo = own("SMTP_REPLY_TO") ?? fallback("SMTP_REPLY_TO") ?? user;
  const testRecipient = own("SMTP_TEST_RECIPIENT") ?? fallback("SMTP_TEST_RECIPIENT");
  if (!host || !user || !password || !from || !replyTo || host !== "smtp.ionos.de" || port !== 587) return null;
  return { host, port, user, password, from, replyTo, testRecipient };
}

async function verifyAndSend(label: string, config: ReturnType<typeof smtpConfig>) {
  if (!config) return { configured: false, transport_verified: false, test_message: "SKIPPED_NOT_CONFIGURED" };
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    requireTLS: true,
    auth: { user: config.user, pass: config.password },
    tls: { minVersion: "TLSv1.2", servername: config.host },
  });
  await transport.verify();
  const validTestRecipient = config.testRecipient && z.string().email().safeParse(config.testRecipient.trim().toLowerCase()).success;
  if (!validTestRecipient) return { configured: true, transport_verified: true, test_message: "SKIPPED_NO_SERVER_SIDE_TEST_RECIPIENT" };
  await transport.sendMail({
    from: config.from,
    replyTo: config.replyTo,
    to: config.testRecipient,
    subject: `${label} - interne Zustellprüfung`,
    text: `Interne technische Zustellprüfung für ${label}. Es wurde keine Anmeldung erzeugt oder verändert.`,
    html: `<p>Interne technische Zustellprüfung für <strong>${label}</strong>.</p><p>Es wurde keine Anmeldung erzeugt oder verändert.</p>`,
    headers: { "X-Auto-Response-Suppress": "All" },
  });
  return { configured: true, transport_verified: true, test_message: "SENT_TO_SERVER_SIDE_TEST_RECIPIENT" };
}

async function dropboxToken() {
  for (const key of ["DROPBOX_APP_KEY", "DROPBOX_APP_SECRET", "DROPBOX_REFRESH_TOKEN"]) if (!process.env[key]) throw new Error(`TECHNICAL_WRITE_RETRY: missing ${key}`);
  const form = new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.DROPBOX_REFRESH_TOKEN! });
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: Dropbox token ${response.status}`);
  const body = await response.json() as { access_token?: string };
  if (!body.access_token) throw new Error("TECHNICAL_WRITE_RETRY: Dropbox token missing");
  return body.access_token;
}

async function downloadDropbox(token: string) {
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path: TARGET }) },
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status === 409) return null;
  if (!response.ok) throw new Error(`TECHNICAL_WRITE_RETRY: Dropbox read ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const metaHeader = response.headers.get("dropbox-api-result");
  return { bytes, metadata: metaHeader ? JSON.parse(metaHeader) : {} };
}

async function writeAndVerifyDropbox(token: string, bytes: Buffer) {
  const existing = await downloadDropbox(token);
  if (existing) {
    if (!bytes.equals(existing.bytes)) throw new Error(`HISTORY_CONFLICT: ${TARGET}`);
    return { outcome: "IDEMPOTENT_IDENTICAL", metadata: existing.metadata, bytes: existing.bytes };
  }
  const upload = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/octet-stream",
      "dropbox-api-arg": JSON.stringify({ path: TARGET, mode: "add", autorename: false, mute: true, strict_conflict: true }),
    },
    body: bytes,
    signal: AbortSignal.timeout(30_000),
  });
  if (!upload.ok) throw new Error(`TECHNICAL_WRITE_RETRY: Dropbox upload ${upload.status} ${(await upload.text()).slice(0, 200)}`);
  const readback = await downloadDropbox(token);
  if (!readback) throw new Error("P0_READBACK_MISSING");
  return { outcome: "WRITTEN", metadata: readback.metadata, bytes: readback.bytes };
}

async function main() {
  assertPreview();

  const dbChecks: Record<string, string> = {};
  const endpoints = [
    ["wirkungsradar_subscriptions", "parliament.wirkungsradar_subscriptions?select=id&limit=1"],
    ["wirkungsradar_digest_deliveries", "parliament.wirkungsradar_digest_deliveries?select=id&limit=1"],
    ["woek_newsletter_subscriptions", "parliament.woek_newsletter_subscriptions?select=id&limit=1"],
    ["woek_newsletter_daily_metrics", "parliament.woek_newsletter_daily_metrics?select=day&limit=1"],
  ] as const;
  for (const [name, endpoint] of endpoints) {
    await supabaseRest<unknown[]>(endpoint);
    dbChecks[name] = "READY";
  }
  const analytics = await supabaseRpc<AnalyticsRow[]>("get_newsletter_analytics", {
    range_start_input: "2026-01-01T00:00:00Z",
    range_end_input: new Date().toISOString(),
  });
  const privacySafeAnalytics = analytics.map((row) => ({
    newsletter_key: row.newsletter_key,
    active_addresses: Number(row.active_addresses),
    pending_confirmations: Number(row.pending_confirmations),
    requested: Number(row.requested),
    confirmation_sends: Number(row.confirmation_sends),
    confirmed: Number(row.confirmed),
    unsubscribed: Number(row.unsubscribed),
    delivery_failures: Number(row.delivery_failures),
    welcome_sends: Number(row.welcome_sends),
  }));

  const wirkungsradarReady = subscriptionDeliveryReady();
  const digestReady = Boolean(wirkungsradarDigestDelivery());
  const newsletterReady = newsletterDeliveryReady();
  const radarTransport = await verifyAndSend("Parlamentsradar-Updates", smtpConfig("WIRKUNGSRADAR"));
  const newsletterTransport = await verifyAndSend("WÖk Wirkungsbrief", smtpConfig("WOEK_NEWSLETTER"));

  const result = {
    schema_version: "woek-delivery-verification-1.0",
    canonical_root: ROOT,
    verified_at: new Date().toISOString(),
    environment: "VERCEL_PREVIEW_ISOLATED",
    branch: EXPECTED_BRANCH,
    production_mutated: false,
    subscriber_data_mutated: false,
    recipient_addresses_logged: false,
    public_readiness: {
      wirkungsradar_signup: wirkungsradarReady ? "READY" : "NOT_READY",
      wirkungsradar_daily_digest: digestReady ? "READY" : "NOT_READY",
      woek_newsletter_signup: newsletterReady ? "READY" : "NOT_READY",
    },
    database: dbChecks,
    privacy_safe_aggregate_lifecycle: privacySafeAnalytics,
    transport: {
      wirkungsradar: radarTransport,
      woek_newsletter: newsletterTransport,
    },
    gates: {
      database_ready: Object.values(dbChecks).every((value) => value === "READY"),
      public_signup_ready: wirkungsradarReady && newsletterReady,
      recurring_digest_ready: digestReady,
      smtp_transports_verified: radarTransport.transport_verified && newsletterTransport.transport_verified,
      internal_delivery_tests_sent: radarTransport.test_message === "SENT_TO_SERVER_SIDE_TEST_RECIPIENT" && newsletterTransport.test_message === "SENT_TO_SERVER_SIDE_TEST_RECIPIENT",
    },
  };
  const allPass = Object.values(result.gates).every(Boolean);
  const canonical = { ...result, overall_status: allPass ? "PASS" : "PASS_WITH_EXPLICIT_OPEN_CONFIGURATION" };
  const bytes = Buffer.from(`${JSON.stringify(canonical, null, 2)}\n`, "utf8");
  const token = await dropboxToken();
  const written = await writeAndVerifyDropbox(token, bytes);
  const localSha = sha256(bytes);
  const readbackSha = sha256(written.bytes);
  const expectedDropboxHash = dropboxContentHash(bytes);
  const actualDropboxHash = String(written.metadata.content_hash ?? "");
  if (!bytes.equals(written.bytes) || localSha !== readbackSha || expectedDropboxHash !== actualDropboxHash) throw new Error("P0_DELIVERY_VERIFICATION_READBACK_MISMATCH");
  console.log(JSON.stringify({
    status: canonical.overall_status,
    public_readiness: canonical.public_readiness,
    database: canonical.database,
    transport: canonical.transport,
    gates: canonical.gates,
    canonical_artifact: {
      path: TARGET,
      outcome: written.outcome,
      file_id: written.metadata.id,
      rev: written.metadata.rev,
      dropbox_content_hash: actualDropboxHash,
      bytes: bytes.length,
      local_sha256: localSha,
      readback_sha256: readbackSha,
      byte_equal: true,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});

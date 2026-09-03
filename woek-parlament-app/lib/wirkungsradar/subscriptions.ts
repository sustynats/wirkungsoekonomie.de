import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { doubleOptInEmail, welcomeEmail } from "@/lib/wirkungsradar/email-templates";
import { consentVersion, privacyNoticeVersion } from "@/lib/privacy-notice";

const confirmationLifetimeHours = 72;
const unconfirmedRetentionDays = 30;

const topics = [
  "ALL_UPDATES",
  "UPCOMING_DECISIONS",
  "PUBLISHED_CHECKS",
  "CORRECTIONS",
  "HEALTH_CARE",
  "HOUSING",
  "WORK_AND_SKILLS",
  "CLIMATE_AND_ENERGY",
  "DEMOCRACY_AND_DIGITAL"
] as const;

export const subscriptionRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  recipient_type: z.enum(["PUBLIC", "PARLIAMENTARY_OFFICE"]),
  topics: z.array(z.enum(topics)).min(1).max(9),
  consent: z.literal(true),
  consent_source: z.enum([
    "parlament.wirkungsoekonomie.de/",
    "parlament.wirkungsoekonomie.de/wirkungsradar-updates"
  ]).optional(),
  website: z.string().max(120).optional().default("")
});

type SubscriptionRequest = z.infer<typeof subscriptionRequestSchema>;
type SubscriptionStatus = "AWAITING_CONFIRMATION_DELIVERY" | "PENDING_CONFIRMATION" | "ACTIVE" | "UNSUBSCRIBED" | "BLOCKED";

type SubscriptionRow = {
  id: string;
  email: string;
  email_hash: string;
  recipient_type: SubscriptionRequest["recipient_type"];
  requested_topics: string[];
  status: SubscriptionStatus;
  confirmation_token_hash: string | null;
  confirmation_sent_at: string | null;
  confirmation_expires_at: string | null;
  unsubscribe_token_hash: string;
};

type GatewayPayload = {
  type: "WIRKUNGSRADAR_DOUBLE_OPT_IN";
  subscription_id: string;
  email: string;
  recipient_type: SubscriptionRequest["recipient_type"];
  topics: string[];
  confirmation_url: string;
  unsubscribe_url: string;
  consent_version: string;
  privacy_notice_version: string;
};

type GatewayDelivery = {
  type: "gateway";
  url: string;
  secret: string;
};

export type WirkungsradarSmtpDelivery = {
  type: "ionos_smtp";
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  replyTo: string;
};

type DeliveryConfiguration = GatewayDelivery | WirkungsradarSmtpDelivery;
type DeliveryChannel = DeliveryConfiguration["type"];

export class SubscriptionDeliveryConfigurationError extends Error {}
export class SubscriptionConfirmationError extends Error {}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function token() {
  return randomBytes(32).toString("base64url");
}

function digestSigningSecret() {
  const secret = process.env.WIRKUNGSRADAR_UNSUBSCRIBE_SIGNING_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

export function recurringUnsubscribeToken(subscriptionId: string) {
  const secret = digestSigningSecret();
  if (!secret) throw new SubscriptionDeliveryConfigurationError("The recurring unsubscribe signing secret is not configured.");
  const signature = createHmac("sha256", secret).update(`wirkungsradar:${subscriptionId}:unsubscribe:v1`).digest("base64url");
  return `v1.${signature}`;
}

export function validRecurringUnsubscribeToken(subscriptionId: string, tokenValue: string) {
  const secret = digestSigningSecret();
  if (!secret || !tokenValue.startsWith("v1.")) return false;
  const expected = createHmac("sha256", secret).update(`wirkungsradar:${subscriptionId}:unsubscribe:v1`).digest("base64url");
  const supplied = tokenValue.slice(3);
  if (expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

function portalUrl() {
  const configured = process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de";
  const parsed = new URL(configured);
  if (parsed.protocol !== "https:") throw new SubscriptionDeliveryConfigurationError("The public portal URL must use HTTPS.");
  return parsed.toString().replace(/\/$/, "");
}

function configuredDelivery(): DeliveryConfiguration | null {
  const mode = process.env.WIRKUNGSRADAR_EMAIL_SEND_MODE ?? "disabled";
  if (mode !== "production") return null;

  const provider = process.env.WIRKUNGSRADAR_DELIVERY_PROVIDER ?? "gateway";
  if (provider === "ionos_smtp") {
    const host = process.env.WIRKUNGSRADAR_SMTP_HOST;
    const port = Number(process.env.WIRKUNGSRADAR_SMTP_PORT ?? "587");
    const user = process.env.WIRKUNGSRADAR_SMTP_USER;
    const password = process.env.WIRKUNGSRADAR_SMTP_PASSWORD;
    const from = process.env.WIRKUNGSRADAR_SMTP_FROM;
    const replyTo = process.env.WIRKUNGSRADAR_SMTP_REPLY_TO ?? user;
    if (!host || !user || !password || !from || !replyTo || !Number.isInteger(port) || port < 1 || port > 65535) {
      throw new SubscriptionDeliveryConfigurationError("The SMTP delivery configuration is incomplete.");
    }
    if (host !== "smtp.ionos.de" || port !== 587 || !user.includes("@") || !replyTo.includes("@")) {
      throw new SubscriptionDeliveryConfigurationError("The IONOS SMTP configuration does not meet the required transport settings.");
    }
    return { type: "ionos_smtp", host, port, user, password, from, replyTo };
  }

  if (provider !== "gateway") throw new SubscriptionDeliveryConfigurationError("The selected delivery provider is not supported.");
  const url = process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_URL;
  const secret = process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_TOKEN;
  if (!url || !secret) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname === "localhost" || parsed.hostname.endsWith(".local")) {
    throw new SubscriptionDeliveryConfigurationError("The opt-in delivery gateway must be a public HTTPS endpoint.");
  }
  return { type: "gateway", url: parsed.toString(), secret };
}

export function subscriptionDeliveryReady() {
  try {
    return Boolean(configuredDelivery()) && process.env.WIRKUNGSRADAR_PUBLIC_SIGNUP_ENABLED === "true";
  } catch {
    return false;
  }
}

async function addEvent(subscriptionId: string, eventType: "REQUESTED" | "CONFIRMATION_QUEUED" | "CONFIRMED" | "UNSUBSCRIBED" | "BLOCKED", metadata: Record<string, unknown> = {}) {
  await supabaseRest("parliament.wirkungsradar_subscription_events", {
    method: "POST",
    body: JSON.stringify({ subscription_id: subscriptionId, event_type: eventType, metadata })
  });
}

function templateLinks(portalUrl: string, unsubscribeUrl: string) {
  return {
    portalUrl,
    unsubscribeUrl,
    privacyUrl: "https://wirkungsoekonomie.de/datenschutz.html",
    imprintUrl: "https://wirkungsoekonomie.de/impressum.html"
  };
}

export function createIonosTransport(delivery: WirkungsradarSmtpDelivery) {
  return nodemailer.createTransport({
    host: delivery.host,
    port: delivery.port,
    secure: false,
    requireTLS: true,
    auth: { user: delivery.user, pass: delivery.password },
    tls: { minVersion: "TLSv1.2", servername: delivery.host }
  });
}

export function wirkungsradarDigestDelivery() {
  if (process.env.WIRKUNGSRADAR_DAILY_DIGEST_ENABLED !== "true") return null;
  const delivery = configuredDelivery();
  if (!delivery || delivery.type !== "ionos_smtp" || !digestSigningSecret()) return null;
  return delivery;
}

export async function sendConfiguredDeliveryTest() {
  const delivery = configuredDelivery();
  if (!delivery || delivery.type !== "ionos_smtp") {
    throw new SubscriptionDeliveryConfigurationError("A direct IONOS SMTP delivery configuration is required for the delivery test.");
  }
  const recipient = process.env.WIRKUNGSRADAR_SMTP_TEST_RECIPIENT?.trim().toLowerCase();
  if (!recipient || !z.string().email().safeParse(recipient).success) {
    throw new SubscriptionDeliveryConfigurationError("A valid server-side test recipient is required for the delivery test.");
  }
  await createIonosTransport(delivery).sendMail({
    from: delivery.from,
    replyTo: delivery.replyTo,
    to: recipient,
    subject: "Test des Wirkungsportal-E-Mail-Versands",
    text: "Dies ist eine interne Testnachricht des Wirkungsportals Parlament. Sie bestätigt ausschließlich die technische Zustellbarkeit. Es wurde keine Anmeldung aktiviert.",
    html: "<p>Dies ist eine <strong>interne Testnachricht</strong> des Wirkungsportals Parlament.</p><p>Sie bestätigt ausschließlich die technische Zustellbarkeit. Es wurde keine Anmeldung aktiviert.</p>",
    headers: { "X-Auto-Response-Suppress": "All" }
  });
  return { outcome: "sent" as const };
}

async function sendDoubleOptIn(subscription: SubscriptionRow, confirmationToken: string, unsubscribeToken: string): Promise<DeliveryChannel | false> {
  const delivery = configuredDelivery();
  if (!delivery) return false;
  const baseUrl = portalUrl();
  const confirmationUrl = `${baseUrl}/wirkungsradar-updates/bestaetigen?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(confirmationToken)}&unsubscribe_token=${encodeURIComponent(unsubscribeToken)}`;
  const unsubscribeUrl = `${baseUrl}/wirkungsradar-updates/abmelden?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
  if (delivery.type === "ionos_smtp") {
    const message = doubleOptInEmail({ ...templateLinks(baseUrl, unsubscribeUrl), confirmationUrl });
    await createIonosTransport(delivery).sendMail({
      from: delivery.from,
      replyTo: delivery.replyTo,
      to: subscription.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
      headers: { "X-Auto-Response-Suppress": "All" }
    });
    return delivery.type;
  }

  const payload: GatewayPayload = {
    type: "WIRKUNGSRADAR_DOUBLE_OPT_IN",
    subscription_id: subscription.id,
    email: subscription.email,
    recipient_type: subscription.recipient_type,
    topics: subscription.requested_topics,
    confirmation_url: confirmationUrl,
    unsubscribe_url: unsubscribeUrl,
    consent_version: consentVersion,
    privacy_notice_version: privacyNoticeVersion
  };
  const response = await fetch(delivery.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${delivery.secret}`
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000)
  });
  if (!response.ok) throw new SubscriptionDeliveryConfigurationError("The opt-in delivery gateway did not accept the confirmation request.");
  return delivery.type;
}

async function sendWelcome(subscription: SubscriptionRow, unsubscribeToken: string): Promise<DeliveryChannel | false> {
  const delivery = configuredDelivery();
  if (!delivery || delivery.type !== "ionos_smtp") return false;
  const baseUrl = portalUrl();
  const unsubscribeUrl = `${baseUrl}/wirkungsradar-updates/abmelden?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
  const message = welcomeEmail(templateLinks(baseUrl, unsubscribeUrl));
  await createIonosTransport(delivery).sendMail({
    from: delivery.from,
    replyTo: delivery.replyTo,
    to: subscription.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
    headers: { "X-Auto-Response-Suppress": "All" }
  });
  return delivery.type;
}

async function findByEmailHash(emailHash: string) {
  const rows = await supabaseRest<SubscriptionRow[]>(
    `parliament.wirkungsradar_subscriptions?email_hash=eq.${encodeURIComponent(emailHash)}&select=id,email,email_hash,recipient_type,requested_topics,status,confirmation_token_hash,confirmation_sent_at,confirmation_expires_at,unsubscribe_token_hash&limit=1`
  );
  return rows[0] ?? null;
}

export async function requestSubscription(input: SubscriptionRequest) {
  if (input.website.trim()) return { outcome: "accepted" as const, delivery: "not_sent" as const };
  const email = normalizedEmail(input.email);
  const emailHash = sha256(email);
  const existing = await findByEmailHash(emailHash);
  if (existing) {
    // A previous opt-out or suppression must never be silently reversed by a
    // web form. A human can handle an explicit request separately.
    if (existing.status === "UNSUBSCRIBED" || existing.status === "BLOCKED") return { outcome: "contact_required" as const, delivery: "not_sent" as const };
    if (existing.status === "ACTIVE") return { outcome: "already_active" as const, delivery: "not_sent" as const };
    return { outcome: "already_pending" as const, delivery: existing.confirmation_sent_at ? "sent" as const : "not_sent" as const };
  }

  const confirmationToken = token();
  const unsubscribeToken = token();
  const now = new Date();
  const confirmationExpires = new Date(now.getTime() + confirmationLifetimeHours * 60 * 60 * 1000);
  const retentionUntil = new Date(now.getTime() + unconfirmedRetentionDays * 24 * 60 * 60 * 1000);
  const rows = await supabaseRest<SubscriptionRow[]>("parliament.wirkungsradar_subscriptions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      email,
      email_hash: emailHash,
      recipient_type: input.recipient_type,
      requested_topics: [...new Set(input.topics)],
      status: "AWAITING_CONFIRMATION_DELIVERY",
      consent_version: consentVersion,
      consent_source: input.consent_source ?? "parlament.wirkungsoekonomie.de/wirkungsradar-updates",
      privacy_notice_version: privacyNoticeVersion,
      confirmation_token_hash: sha256(confirmationToken),
      confirmation_expires_at: confirmationExpires.toISOString(),
      unsubscribe_token_hash: sha256(unsubscribeToken),
      retention_until: retentionUntil.toISOString()
    })
  });
  const subscription = rows[0];
  if (!subscription) throw new Error("The subscription request could not be stored.");
  await addEvent(subscription.id, "REQUESTED", { consent_version: consentVersion, recipient_type: input.recipient_type });

  try {
    const channel = await sendDoubleOptIn(subscription, confirmationToken, unsubscribeToken);
    if (channel) {
      await supabaseRest(`parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscription.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PENDING_CONFIRMATION", confirmation_sent_at: now.toISOString(), updated_at: now.toISOString() })
      });
      await addEvent(subscription.id, "CONFIRMATION_QUEUED", { channel });
      return { outcome: "accepted" as const, delivery: "sent" as const };
    }
    return { outcome: "accepted" as const, delivery: "not_sent" as const };
  } catch (error) {
    // The consent remains inactive. No recurring mail is sent if delivery is
    // unavailable, and the public error contains no infrastructure details.
    console.error("Wirkungsradar double opt-in delivery failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    return { outcome: "accepted" as const, delivery: "not_sent" as const };
  }
}

async function findByToken(subscriptionId: string, tokenValue: string) {
  const rows = await supabaseRest<SubscriptionRow[]>(
    `parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}&select=id,email,email_hash,recipient_type,requested_topics,status,confirmation_token_hash,confirmation_sent_at,confirmation_expires_at,unsubscribe_token_hash&limit=1`
  );
  const subscription = rows[0];
  if (!subscription) return null;
  return {
    subscription,
    matchesConfirmation: subscription.confirmation_token_hash === sha256(tokenValue),
    matchesUnsubscribe: subscription.unsubscribe_token_hash === sha256(tokenValue) || validRecurringUnsubscribeToken(subscriptionId, tokenValue)
  };
}

export async function confirmSubscription(subscriptionId: string, tokenValue: string, unsubscribeToken?: string) {
  const match = await findByToken(subscriptionId, tokenValue);
  if (!match?.matchesConfirmation || !match.subscription.confirmation_expires_at || new Date(match.subscription.confirmation_expires_at).getTime() < Date.now()) {
    throw new SubscriptionConfirmationError("This confirmation link is invalid or has expired.");
  }
  if (match.subscription.status === "ACTIVE") return { outcome: "already_active" as const };
  if (match.subscription.status !== "PENDING_CONFIRMATION") throw new SubscriptionConfirmationError("This confirmation cannot be completed yet.");
  const now = new Date().toISOString();
  await supabaseRest(`parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "ACTIVE", confirmed_at: now, retention_until: null, updated_at: now })
  });
  let welcomeDelivery: "sent" | "not_sent" | "failed" = "not_sent";
  if (unsubscribeToken && match.subscription.unsubscribe_token_hash === sha256(unsubscribeToken)) {
    try {
      welcomeDelivery = await sendWelcome(match.subscription, unsubscribeToken) ? "sent" : "not_sent";
    } catch (error) {
      welcomeDelivery = "failed";
      console.error("Wirkungsradar welcome delivery failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    }
  }
  await addEvent(subscriptionId, "CONFIRMED", { consent_version: consentVersion, welcome_delivery: welcomeDelivery });
  return { outcome: "confirmed" as const };
}

export async function unsubscribe(subscriptionId: string, tokenValue: string) {
  const match = await findByToken(subscriptionId, tokenValue);
  if (!match?.matchesUnsubscribe) throw new SubscriptionConfirmationError("This unsubscribe link is invalid.");
  // Deleting the subscription also deletes its event trail through the database
  // foreign-key cascade. This keeps the promise on the public unsubscribe page:
  // no address or delivery history remains in this recipient list.
  await supabaseRest(`parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}`, {
    method: "DELETE"
  });
  return { outcome: "unsubscribed" as const };
}

export async function queueExistingConfirmation(subscriptionId: string) {
  const rows = await supabaseRest<SubscriptionRow[]>(
    `parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}&select=id,email,email_hash,recipient_type,requested_topics,status,confirmation_token_hash,confirmation_sent_at,confirmation_expires_at,unsubscribe_token_hash&limit=1`
  );
  const subscription = rows[0];
  if (!subscription || subscription.status !== "AWAITING_CONFIRMATION_DELIVERY") {
    throw new SubscriptionConfirmationError("Only inactive, explicitly requested subscriptions can be queued for confirmation.");
  }
  const confirmationToken = token();
  const unsubscribeToken = token();
  const now = new Date();
  const expires = new Date(now.getTime() + confirmationLifetimeHours * 60 * 60 * 1000).toISOString();
  const prepared: SubscriptionRow = {
    ...subscription,
    confirmation_token_hash: sha256(confirmationToken),
    unsubscribe_token_hash: sha256(unsubscribeToken),
    confirmation_expires_at: expires
  };
  await supabaseRest(`parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscription.id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      confirmation_token_hash: prepared.confirmation_token_hash,
      unsubscribe_token_hash: prepared.unsubscribe_token_hash,
      confirmation_expires_at: expires,
      updated_at: now.toISOString()
    })
  });
  const channel = await sendDoubleOptIn(prepared, confirmationToken, unsubscribeToken);
  if (!channel) throw new SubscriptionDeliveryConfigurationError("The double opt-in delivery service is not enabled.");
  await supabaseRest(`parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(subscription.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "PENDING_CONFIRMATION", confirmation_sent_at: now.toISOString(), updated_at: now.toISOString() })
  });
  await addEvent(subscription.id, "CONFIRMATION_QUEUED", { channel, delayed: true });
  return { outcome: "queued" as const };
}

export async function purgeUnconfirmedSubscriptions() {
  const cutoff = new Date().toISOString();
  const rows = await supabaseRest<Array<{ id: string }>>(
    `parliament.wirkungsradar_subscriptions?status=in.(AWAITING_CONFIRMATION_DELIVERY,PENDING_CONFIRMATION)&retention_until=lt.${encodeURIComponent(cutoff)}&select=id`
  );
  if (rows.length === 0) return 0;
  const ids = rows.map((row) => row.id).join(",");
  await supabaseRest(`parliament.wirkungsradar_subscriptions?id=in.(${ids})`, { method: "DELETE" });
  return rows.length;
}

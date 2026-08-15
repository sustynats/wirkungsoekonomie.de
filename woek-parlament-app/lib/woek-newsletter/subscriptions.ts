import { createHash, randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { supabaseRest, supabaseRpc } from "@/lib/database/supabase-admin";
import { newsletterDoubleOptInEmail, newsletterUnsubscribeConfirmedEmail, newsletterWelcomeEmail } from "@/lib/woek-newsletter/email-templates";

const consentVersion = "2026-08-15.1";
const privacyNoticeVersion = "2026-08-15.1";
const confirmationLifetimeHours = 72;
const unconfirmedRetentionDays = 30;

export const newsletterRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
  consent_source: z.literal("wirkungsoekonomie.de/").optional(),
  website: z.string().max(120).optional().default("")
});

type NewsletterRequest = z.infer<typeof newsletterRequestSchema>;
type SubscriptionStatus = "AWAITING_CONFIRMATION_DELIVERY" | "PENDING_CONFIRMATION" | "ACTIVE" | "UNSUBSCRIBED" | "BLOCKED";

type SubscriptionRow = {
  id: string;
  email: string;
  email_hash: string;
  status: SubscriptionStatus;
  confirmation_token_hash: string | null;
  confirmation_sent_at: string | null;
  confirmation_expires_at: string | null;
  unsubscribe_token_hash: string;
  recognition_token_hash: string | null;
};

type GatewayDelivery = { type: "gateway"; url: string; secret: string };
type SmtpDelivery = { type: "ionos_smtp"; host: string; port: number; user: string; password: string; from: string; replyTo: string };
type DeliveryConfiguration = GatewayDelivery | SmtpDelivery;
type DeliveryChannel = DeliveryConfiguration["type"];
type NewsletterMetricKey =
  | "REQUESTED"
  | "CONFIRMATION_SENT"
  | "CONFIRMED"
  | "UNSUBSCRIBED"
  | "CONFIRMATION_DELIVERY_FAILED"
  | "WELCOME_SENT";

export class NewsletterDeliveryConfigurationError extends Error {}
export class NewsletterConfirmationError extends Error {}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function token() {
  return randomBytes(32).toString("base64url");
}

function websiteUrl() {
  const configured = process.env.NEXT_PUBLIC_WOEK_WEBSITE_URL ?? "https://wirkungsoekonomie.de";
  const parsed = new URL(configured);
  if (parsed.protocol !== "https:") throw new NewsletterDeliveryConfigurationError("The public website URL must use HTTPS.");
  return parsed.toString().replace(/\/$/, "");
}

function configuredDelivery(): DeliveryConfiguration | null {
  // The recipient data is a separate newsletter tenant. The established
  // sending mailbox and SMTP transport are intentionally shared.
  if ((process.env.WOEK_NEWSLETTER_EMAIL_SEND_MODE ?? process.env.WIRKUNGSRADAR_EMAIL_SEND_MODE) !== "production") return null;
  const provider = process.env.WOEK_NEWSLETTER_DELIVERY_PROVIDER ?? process.env.WIRKUNGSRADAR_DELIVERY_PROVIDER ?? "ionos_smtp";
  if (provider === "ionos_smtp") {
    const host = process.env.WOEK_NEWSLETTER_SMTP_HOST ?? process.env.WIRKUNGSRADAR_SMTP_HOST;
    const port = Number(process.env.WOEK_NEWSLETTER_SMTP_PORT ?? process.env.WIRKUNGSRADAR_SMTP_PORT ?? "587");
    const user = process.env.WOEK_NEWSLETTER_SMTP_USER ?? process.env.WIRKUNGSRADAR_SMTP_USER;
    const password = process.env.WOEK_NEWSLETTER_SMTP_PASSWORD ?? process.env.WIRKUNGSRADAR_SMTP_PASSWORD;
    const from = process.env.WOEK_NEWSLETTER_SMTP_FROM ?? process.env.WIRKUNGSRADAR_SMTP_FROM;
    const replyTo = process.env.WOEK_NEWSLETTER_SMTP_REPLY_TO ?? process.env.WIRKUNGSRADAR_SMTP_REPLY_TO ?? user;
    if (!host || !user || !password || !from || !replyTo || !Number.isInteger(port) || port < 1 || port > 65535) {
      throw new NewsletterDeliveryConfigurationError("The newsletter SMTP configuration is incomplete.");
    }
    if (host !== "smtp.ionos.de" || port !== 587 || !user.includes("@") || !replyTo.includes("@")) {
      throw new NewsletterDeliveryConfigurationError("The newsletter SMTP configuration does not meet the required transport settings.");
    }
    return { type: "ionos_smtp", host, port, user, password, from, replyTo };
  }
  if (provider !== "gateway") throw new NewsletterDeliveryConfigurationError("The selected newsletter delivery provider is not supported.");
  const url = process.env.WOEK_NEWSLETTER_OPTIN_GATEWAY_URL ?? process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_URL;
  const secret = process.env.WOEK_NEWSLETTER_OPTIN_GATEWAY_TOKEN ?? process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_TOKEN;
  if (!url || !secret) return null;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname === "localhost" || parsed.hostname.endsWith(".local")) {
    throw new NewsletterDeliveryConfigurationError("The newsletter opt-in delivery gateway must be a public HTTPS endpoint.");
  }
  return { type: "gateway", url: parsed.toString(), secret };
}

export function newsletterDeliveryReady() {
  try {
    return Boolean(configuredDelivery()) && (process.env.WOEK_NEWSLETTER_PUBLIC_SIGNUP_ENABLED ?? process.env.WIRKUNGSRADAR_PUBLIC_SIGNUP_ENABLED) === "true";
  } catch {
    return false;
  }
}

function createIonosTransport(delivery: SmtpDelivery) {
  return nodemailer.createTransport({
    host: delivery.host,
    port: delivery.port,
    secure: false,
    requireTLS: true,
    auth: { user: delivery.user, pass: delivery.password },
    tls: { minVersion: "TLSv1.2", servername: delivery.host }
  });
}

function senderAddress(value: string) {
  return value.match(/<([^>]+)>/)?.[1] ?? value.trim();
}

/**
 * Used by the authenticated campaign endpoint as well as the DOI lifecycle.
 * The transport remains the established shared sender mailbox; only the
 * recipient tenant differs between Wirkungsradar and Wirkungsbrief.
 */
export async function sendNewsletterMail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  fromName?: string;
  listUnsubscribeUrl?: string;
}) {
  const delivery = configuredDelivery();
  if (!delivery || delivery.type !== "ionos_smtp") {
    throw new NewsletterDeliveryConfigurationError("Campaign delivery requires the configured SMTP transport.");
  }
  const headers: Record<string, string> = { "X-Auto-Response-Suppress": "All" };
  if (input.listUnsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${input.listUnsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  await createIonosTransport(delivery).sendMail({
    from: input.fromName ? `${input.fromName} <${senderAddress(delivery.from)}>` : delivery.from,
    replyTo: delivery.replyTo,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    headers
  });
}

function links(unsubscribeUrl: string, confirmationUrl: string, replyTo: string) {
  const website = websiteUrl();
  return {
    websiteUrl: website,
    confirmationUrl,
    unsubscribeUrl,
    privacyUrl: `${website}/datenschutz.html`,
    imprintUrl: `${website}/impressum.html`,
    replyTo,
    startUrl: `${website}/#in-5-minuten`,
    glossaryUrl: `${website}/begriffe/`,
    toolsUrl: `${website}/werkzeuge/`
  };
}

async function addEvent(subscriptionId: string, eventType: "REQUESTED" | "CONFIRMATION_QUEUED" | "CONFIRMED" | "UNSUBSCRIBED" | "BLOCKED", metadata: Record<string, unknown> = {}) {
  await supabaseRest("parliament.woek_newsletter_subscription_events", {
    method: "POST",
    body: JSON.stringify({ subscription_id: subscriptionId, event_type: eventType, metadata })
  });
}

async function recordMetric(metricKey: NewsletterMetricKey) {
  try {
    await supabaseRpc<void>("record_woek_newsletter_metric", { metric_key_input: metricKey });
  } catch (error) {
    // Aggregate reporting must never prevent a legally valid subscription,
    // confirmation, or opt-out from being processed.
    console.error("Wirkungsökonomie newsletter metric storage failed", {
      metricKey,
      message: error instanceof Error ? error.message : "Unknown failure"
    });
  }
}

async function sendDoubleOptIn(subscription: SubscriptionRow, confirmationToken: string, unsubscribeToken: string): Promise<DeliveryChannel | false> {
  const delivery = configuredDelivery();
  if (!delivery) return false;
  const baseUrl = websiteUrl();
  const confirmationUrl = `${baseUrl}/newsletter/bestaetigen.html?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(confirmationToken)}&unsubscribe_token=${encodeURIComponent(unsubscribeToken)}`;
  const unsubscribeUrl = `${baseUrl}/newsletter/abmelden.html?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
  if (delivery.type === "ionos_smtp") {
    const message = newsletterDoubleOptInEmail(links(unsubscribeUrl, confirmationUrl, delivery.replyTo));
    await sendNewsletterMail({ to: subscription.email, ...message, fromName: "Institut für Wirkungsökonomie" });
    return delivery.type;
  }
  const response = await fetch(delivery.url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${delivery.secret}` },
    body: JSON.stringify({
      type: "WOEK_NEWSLETTER_DOUBLE_OPT_IN",
      subscription_id: subscription.id,
      email: subscription.email,
      confirmation_url: confirmationUrl,
      unsubscribe_url: unsubscribeUrl,
      consent_version: consentVersion,
      privacy_notice_version: privacyNoticeVersion
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000)
  });
  if (!response.ok) throw new NewsletterDeliveryConfigurationError("The newsletter opt-in delivery gateway did not accept the confirmation request.");
  return delivery.type;
}

async function sendWelcome(subscription: SubscriptionRow, unsubscribeToken: string) {
  const delivery = configuredDelivery();
  if (!delivery || delivery.type !== "ionos_smtp") return false;
  const unsubscribeUrl = `${websiteUrl()}/newsletter/abmelden.html?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
  const message = newsletterWelcomeEmail(links(unsubscribeUrl, "", delivery.replyTo));
  await sendNewsletterMail({ to: subscription.email, ...message, fromName: "Institut für Wirkungsökonomie" });
  return true;
}

async function sendUnsubscribeConfirmation(subscription: SubscriptionRow) {
  const delivery = configuredDelivery();
  if (!delivery || delivery.type !== "ionos_smtp") return false;
  const message = newsletterUnsubscribeConfirmedEmail(links("", "", delivery.replyTo));
  await sendNewsletterMail({ to: subscription.email, ...message, fromName: "Institut für Wirkungsökonomie" });
  return true;
}

async function findByEmailHash(emailHash: string) {
  const rows = await supabaseRest<SubscriptionRow[]>(
    `parliament.woek_newsletter_subscriptions?email_hash=eq.${encodeURIComponent(emailHash)}&select=id,email,email_hash,status,confirmation_token_hash,confirmation_sent_at,confirmation_expires_at,unsubscribe_token_hash,recognition_token_hash&limit=1`
  );
  return rows[0] ?? null;
}

async function createPendingSubscription(input: NewsletterRequest, existing: SubscriptionRow | null) {
  const email = normalizedEmail(input.email);
  const confirmationToken = token();
  const unsubscribeToken = token();
  const now = new Date();
  const confirmationExpires = new Date(now.getTime() + confirmationLifetimeHours * 60 * 60 * 1000).toISOString();
  const retentionUntil = new Date(now.getTime() + unconfirmedRetentionDays * 24 * 60 * 60 * 1000).toISOString();
  const values = {
    email,
    email_hash: sha256(email),
    status: "AWAITING_CONFIRMATION_DELIVERY",
    consent_version: consentVersion,
    consent_source: input.consent_source ?? "wirkungsoekonomie.de/",
    consent_captured_at: now.toISOString(),
    privacy_notice_version: privacyNoticeVersion,
    confirmation_token_hash: sha256(confirmationToken),
    confirmation_sent_at: null,
    confirmation_expires_at: confirmationExpires,
    unsubscribe_token_hash: sha256(unsubscribeToken),
    recognition_token_hash: null,
    confirmed_at: null,
    suppression_reason: null,
    retention_until: retentionUntil,
    updated_at: now.toISOString()
  };
  if (existing) {
    await supabaseRest(`parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(existing.id)}`, { method: "PATCH", body: JSON.stringify(values) });
    return { subscription: { ...existing, ...values } as SubscriptionRow, confirmationToken, unsubscribeToken, renewed: true };
  }
  const rows = await supabaseRest<SubscriptionRow[]>("parliament.woek_newsletter_subscriptions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values)
  });
  const subscription = rows[0];
  if (!subscription) throw new Error("The newsletter subscription request could not be stored.");
  return { subscription, confirmationToken, unsubscribeToken, renewed: false };
}

export async function requestNewsletterSubscription(input: NewsletterRequest) {
  if (input.website.trim()) return { outcome: "accepted" as const, delivery: "not_sent" as const };
  const existing = await findByEmailHash(sha256(normalizedEmail(input.email)));
  if (existing?.status === "BLOCKED") return { outcome: "contact_required" as const, delivery: "not_sent" as const };
  if (existing?.status === "ACTIVE") return { outcome: "already_active" as const, delivery: "not_sent" as const };
  if (existing?.status === "PENDING_CONFIRMATION" && existing.confirmation_sent_at) return { outcome: "already_pending" as const, delivery: "sent" as const };
  const prepared = await createPendingSubscription(input, existing);
  await addEvent(prepared.subscription.id, "REQUESTED", { consent_version: consentVersion, renewed_after_unsubscribe: prepared.renewed });
  await recordMetric("REQUESTED");
  try {
    const channel = await sendDoubleOptIn(prepared.subscription, prepared.confirmationToken, prepared.unsubscribeToken);
    if (!channel) {
      await recordMetric("CONFIRMATION_DELIVERY_FAILED");
      return { outcome: "accepted" as const, delivery: "not_sent" as const };
    }
    const now = new Date().toISOString();
    await supabaseRest(`parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(prepared.subscription.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "PENDING_CONFIRMATION", confirmation_sent_at: now, updated_at: now })
    });
    await addEvent(prepared.subscription.id, "CONFIRMATION_QUEUED", { channel });
    await recordMetric("CONFIRMATION_SENT");
    return { outcome: "accepted" as const, delivery: "sent" as const };
  } catch (error) {
    console.error("Wirkungsökonomie newsletter double opt-in delivery failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    await recordMetric("CONFIRMATION_DELIVERY_FAILED");
    return { outcome: "accepted" as const, delivery: "not_sent" as const };
  }
}

async function findByToken(subscriptionId: string, tokenValue: string) {
  const rows = await supabaseRest<SubscriptionRow[]>(
    `parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}&select=id,email,email_hash,status,confirmation_token_hash,confirmation_sent_at,confirmation_expires_at,unsubscribe_token_hash,recognition_token_hash&limit=1`
  );
  const subscription = rows[0];
  if (!subscription) return null;
  return { subscription, matchesConfirmation: subscription.confirmation_token_hash === sha256(tokenValue), matchesUnsubscribe: subscription.unsubscribe_token_hash === sha256(tokenValue) };
}

export async function confirmNewsletterSubscription(subscriptionId: string, tokenValue: string, unsubscribeToken?: string) {
  const match = await findByToken(subscriptionId, tokenValue);
  if (!match?.matchesConfirmation || !match.subscription.confirmation_expires_at || new Date(match.subscription.confirmation_expires_at).getTime() < Date.now()) {
    throw new NewsletterConfirmationError("Dieser Bestätigungslink ist ungültig oder abgelaufen.");
  }
  if (match.subscription.status !== "PENDING_CONFIRMATION" && match.subscription.status !== "ACTIVE") {
    throw new NewsletterConfirmationError("Diese Anmeldung kann noch nicht bestätigt werden.");
  }
  const recognitionToken = token();
  const now = new Date().toISOString();
  await supabaseRest(`parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "ACTIVE", confirmed_at: now, retention_until: null, recognition_token_hash: sha256(recognitionToken), updated_at: now })
  });
  if (match.subscription.status !== "ACTIVE") {
    let welcomeDelivery: "sent" | "not_sent" | "failed" = "not_sent";
    if (unsubscribeToken && match.subscription.unsubscribe_token_hash === sha256(unsubscribeToken)) {
      try {
        welcomeDelivery = await sendWelcome(match.subscription, unsubscribeToken) ? "sent" : "not_sent";
      } catch (error) {
        welcomeDelivery = "failed";
        console.error("Wirkungsökonomie newsletter welcome delivery failed", { message: error instanceof Error ? error.message : "Unknown failure" });
      }
    }
    await addEvent(subscriptionId, "CONFIRMED", { consent_version: consentVersion, welcome_delivery: welcomeDelivery });
    await recordMetric("CONFIRMED");
    if (welcomeDelivery === "sent") await recordMetric("WELCOME_SENT");
  }
  return { outcome: match.subscription.status === "ACTIVE" ? "already_active" as const : "confirmed" as const, session: { subscriptionId, recognitionToken } };
}

export async function unsubscribeNewsletter(subscriptionId: string, tokenValue: string) {
  const match = await findByToken(subscriptionId, tokenValue);
  if (!match?.matchesUnsubscribe) throw new NewsletterConfirmationError("Dieser Abmeldelink ist ungültig.");
  // This tenant follows the supplied template: unsubscribe removes the
  // address from this newsletter. A later subscription starts a new DOI.
  await recordMetric("UNSUBSCRIBED");
  await supabaseRest(`parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(subscriptionId)}`, { method: "DELETE" });
  try {
    await sendUnsubscribeConfirmation(match.subscription);
  } catch (error) {
    console.error("Wirkungsökonomie newsletter unsubscribe confirmation delivery failed", { message: error instanceof Error ? error.message : "Unknown failure" });
  }
  return { outcome: "unsubscribed" as const };
}

export async function newsletterSessionStatus(session: { subscriptionId: string; recognitionToken: string } | null) {
  if (!session) return "unknown" as const;
  const rows = await supabaseRest<Pick<SubscriptionRow, "status" | "recognition_token_hash">[]>(
    `parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(session.subscriptionId)}&select=status,recognition_token_hash&limit=1`
  );
  const subscription = rows[0];
  if (!subscription || subscription.recognition_token_hash !== sha256(session.recognitionToken)) return "unknown" as const;
  return subscription.status === "ACTIVE" ? "active" as const : "unsubscribed" as const;
}

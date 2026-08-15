import { createHash, randomBytes } from "node:crypto";
import { supabaseRest, supabaseRpc } from "@/lib/database/supabase-admin";

export type NewsletterKey = "wirkungsradar" | "wirkungsbrief";

type DeliveryRow = {
  id: string;
  tracking_token_hash: string;
  newsletter_key: NewsletterKey;
  subscription_id: string;
};

type LinkRow = {
  target_url: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function baseUrl() {
  const configured = process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de";
  const parsed = new URL(configured);
  if (parsed.protocol !== "https:") throw new Error("Newsletter tracking must use HTTPS.");
  return parsed.toString().replace(/\/$/, "");
}

function trackerToken() {
  return randomBytes(32).toString("base64url");
}

function linkCode() {
  return randomBytes(9).toString("base64url");
}

export function transparentGif() {
  return Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");
}

export async function createTrackedDelivery(input: {
  campaignId: string;
  newsletterKey: NewsletterKey;
  subscriptionId: string;
  recipientHash: string;
}) {
  const trackingToken = trackerToken();
  const rows = await supabaseRest<DeliveryRow[]>("parliament.newsletter_campaign_deliveries", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      campaign_id: input.campaignId,
      newsletter_key: input.newsletterKey,
      subscription_id: input.subscriptionId,
      recipient_hash: input.recipientHash,
      tracking_token_hash: sha256(trackingToken)
    })
  });
  const delivery = rows[0];
  if (!delivery) throw new Error("Newsletter delivery could not be prepared.");
  return { deliveryId: delivery.id, trackingToken };
}

export async function markDeliverySent(deliveryId: string) {
  const now = new Date().toISOString();
  await supabaseRest(`parliament.newsletter_campaign_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, {
    method: "PATCH",
    body: JSON.stringify({ sent_at: now })
  });
}

export async function markDeliveryFailed(deliveryId: string, message: string) {
  await supabaseRest(`parliament.newsletter_campaign_deliveries?id=eq.${encodeURIComponent(deliveryId)}`, {
    method: "PATCH",
    body: JSON.stringify({ delivery_error: message.slice(0, 280) })
  });
}

async function matchingDelivery(deliveryId: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(deliveryId) || !/^[A-Za-z0-9_-]{32,}$/.test(token)) return null;
  const rows = await supabaseRest<DeliveryRow[]>(
    `parliament.newsletter_campaign_deliveries?id=eq.${encodeURIComponent(deliveryId)}&select=id,tracking_token_hash,newsletter_key,subscription_id&limit=1`
  );
  const delivery = rows[0];
  return delivery?.tracking_token_hash === sha256(token) ? delivery : null;
}

export async function recordNewsletterOpen(deliveryId: string, token: string) {
  const delivery = await matchingDelivery(deliveryId, token);
  if (!delivery) return false;
  await supabaseRest(`parliament.newsletter_campaign_deliveries?id=eq.${encodeURIComponent(delivery.id)}&opened_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ opened_at: new Date().toISOString() })
  });
  return true;
}

export async function recordNewsletterClick(deliveryId: string, token: string, code: string) {
  if (!/^[A-Za-z0-9_-]{8,24}$/.test(code)) return null;
  const delivery = await matchingDelivery(deliveryId, token);
  if (!delivery) return null;
  const links = await supabaseRest<LinkRow[]>(
    `parliament.newsletter_campaign_links?delivery_id=eq.${encodeURIComponent(delivery.id)}&link_code=eq.${encodeURIComponent(code)}&select=target_url&limit=1`
  );
  const targetUrl = links[0]?.target_url;
  if (!targetUrl) return null;
  await supabaseRest(`parliament.newsletter_campaign_deliveries?id=eq.${encodeURIComponent(delivery.id)}&clicked_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ clicked_at: new Date().toISOString() })
  });
  return targetUrl;
}

export async function unsubscribeNewsletterDelivery(deliveryId: string, token: string) {
  const delivery = await matchingDelivery(deliveryId, token);
  if (!delivery) return false;
  const now = new Date().toISOString();
  if (delivery.newsletter_key === "wirkungsbrief") {
    await supabaseRest(`parliament.woek_newsletter_subscriptions?id=eq.${encodeURIComponent(delivery.subscription_id)}`, { method: "DELETE" });
    await supabaseRpc<void>("record_woek_newsletter_metric", { metric_key_input: "UNSUBSCRIBED" });
  } else {
    await supabaseRest(`parliament.wirkungsradar_subscriptions?id=eq.${encodeURIComponent(delivery.subscription_id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "UNSUBSCRIBED", unsubscribed_at: now, updated_at: now })
    });
    await supabaseRest("parliament.wirkungsradar_subscription_events", {
      method: "POST",
      body: JSON.stringify({ subscription_id: delivery.subscription_id, event_type: "UNSUBSCRIBED", metadata: { source: "campaign" } })
    });
  }
  await supabaseRest(`parliament.newsletter_campaign_deliveries?id=eq.${encodeURIComponent(delivery.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ unsubscribed_at: now })
  });
  return true;
}

function validTrackedUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function renderTrackedCampaignHtml(input: {
  html: string;
  deliveryId: string;
  trackingToken: string;
  unsubscribeUrl: string;
  webViewUrl: string;
}) {
  const links = new Map<string, string>();
  const html = input.html
    .replaceAll("{{unsubscribe_url}}", input.unsubscribeUrl)
    .replaceAll("{{web_view_url}}", input.webViewUrl)
    .replace(/href\s*=\s*(["'])(.*?)\1/gi, (full, quote: string, href: string) => {
      if (!validTrackedUrl(href)) return full;
      let code = links.get(href);
      if (!code) {
        code = linkCode();
        links.set(href, code);
      }
      const tracked = `${baseUrl()}/api/newsletter-tracking/click?d=${encodeURIComponent(input.deliveryId)}&t=${encodeURIComponent(input.trackingToken)}&l=${encodeURIComponent(code)}`;
      return `href=${quote}${tracked}${quote}`;
    });

  if (links.size) {
    await supabaseRest("parliament.newsletter_campaign_links", {
      method: "POST",
      body: JSON.stringify([...links.entries()].map(([target_url, link_code]) => ({ delivery_id: input.deliveryId, link_code, target_url })))
    });
  }

  const pixel = `<img src="${baseUrl()}/api/newsletter-tracking/open?d=${encodeURIComponent(input.deliveryId)}&t=${encodeURIComponent(input.trackingToken)}" width="1" height="1" alt="" style="display:block;border:0;outline:none;text-decoration:none;">`;
  return html.includes("</body>") ? html.replace("</body>", `${pixel}</body>`) : `${html}${pixel}`;
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { createTrackedDelivery, markDeliveryFailed, markDeliverySent, renderTrackedCampaignHtml, type NewsletterKey } from "@/lib/newsletter-engagement";
import { sendNewsletterMail } from "@/lib/woek-newsletter/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const campaignSchema = z.object({
  newsletter_key: z.enum(["wirkungsradar", "wirkungsbrief"]),
  subject: z.string().trim().min(3).max(140),
  html: z.string().min(100).max(250_000),
  text: z.string().min(20).max(100_000),
  web_view_url: z.string().url().refine((value) => new URL(value).protocol === "https:")
});

type Recipient = { id: string; email: string; email_hash: string };
type Campaign = { id: string };

function authorized(request: NextRequest) {
  const expected = process.env.NEWSLETTER_CAMPAIGN_TOKEN?.trim();
  return Boolean(expected && request.headers.get("authorization") === `Bearer ${expected}`);
}

function portalUrl() {
  return (process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de").replace(/\/$/, "");
}

function websiteUrl() {
  return (process.env.NEXT_PUBLIC_WOEK_WEBSITE_URL ?? "https://wirkungsoekonomie.de").replace(/\/$/, "");
}

function recipientPath(newsletterKey: NewsletterKey, offset: number) {
  const table = newsletterKey === "wirkungsbrief" ? "woek_newsletter_subscriptions" : "wirkungsradar_subscriptions";
  return `parliament.${table}?status=eq.ACTIVE&select=id,email,email_hash&order=id.asc&limit=1000&offset=${offset}`;
}

async function activeRecipients(newsletterKey: NewsletterKey) {
  const recipients: Recipient[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await supabaseRest<Recipient[]>(recipientPath(newsletterKey, offset));
    recipients.push(...page);
    if (page.length < 1000) return recipients;
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });

  let input: z.infer<typeof campaignSchema>;
  try {
    input = campaignSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-campaign" }, { status: 400 });
  }

  try {
    const campaigns = await supabaseRest<Campaign[]>("parliament.newsletter_campaigns", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ newsletter_key: input.newsletter_key, subject: input.subject, status: "SENDING" })
    });
    const campaign = campaigns[0];
    if (!campaign) throw new Error("Campaign could not be stored.");

    const recipients = await activeRecipients(input.newsletter_key);
    let sent = 0;
    let failed = 0;
    for (const recipient of recipients) {
      const tracked = await createTrackedDelivery({
        campaignId: campaign.id,
        newsletterKey: input.newsletter_key,
        subscriptionId: recipient.id,
        recipientHash: recipient.email_hash
      });
      const unsubscribeUrl = input.newsletter_key === "wirkungsbrief"
        ? `${websiteUrl()}/newsletter/abmelden.html?delivery=${encodeURIComponent(tracked.deliveryId)}&token=${encodeURIComponent(tracked.trackingToken)}`
        : `${portalUrl()}/woek-newsletter/abmelden?delivery=${encodeURIComponent(tracked.deliveryId)}&token=${encodeURIComponent(tracked.trackingToken)}`;
      try {
        const html = await renderTrackedCampaignHtml({
          html: input.html,
          deliveryId: tracked.deliveryId,
          trackingToken: tracked.trackingToken,
          unsubscribeUrl,
          webViewUrl: input.web_view_url
        });
        const text = input.text
          .replaceAll("{{unsubscribe_url}}", unsubscribeUrl)
          .replaceAll("{{web_view_url}}", input.web_view_url);
        await sendNewsletterMail({
          to: recipient.email,
          subject: input.subject,
          html,
          text,
          fromName: input.newsletter_key === "wirkungsbrief" ? "Institut für Wirkungsökonomie" : undefined
        });
        await markDeliverySent(tracked.deliveryId);
        sent += 1;
      } catch (error) {
        failed += 1;
        await markDeliveryFailed(tracked.deliveryId, error instanceof Error ? error.message : "Unknown campaign delivery error");
      }
    }

    const completedAt = new Date().toISOString();
    await supabaseRest(`parliament.newsletter_campaigns?id=eq.${encodeURIComponent(campaign.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: failed === 0 ? "SENT" : sent > 0 ? "PARTIALLY_SENT" : "FAILED",
        sent_at: sent > 0 ? completedAt : null,
        completed_at: completedAt
      })
    });
    return NextResponse.json({ ok: true, campaign_id: campaign.id, recipient_count: recipients.length, sent, failed });
  } catch (error) {
    console.error("Newsletter campaign dispatch failed", { message: error instanceof Error ? error.message : "Unknown failure" });
    return NextResponse.json({ ok: false, reason: "campaign-unavailable" }, { status: 503 });
  }
}

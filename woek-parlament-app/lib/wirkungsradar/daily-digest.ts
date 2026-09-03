import "server-only";

import { createHash } from "node:crypto";
import { z } from "zod";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { dailyDigestEmail, type DailyDigestItem } from "@/lib/wirkungsradar/email-templates";
import {
  createIonosTransport,
  recurringUnsubscribeToken,
  wirkungsradarDigestDelivery,
} from "@/lib/wirkungsradar/subscriptions";

const topicSchema = z.enum([
  "ALL_UPDATES",
  "UPCOMING_DECISIONS",
  "PUBLISHED_CHECKS",
  "CORRECTIONS",
  "HEALTH_CARE",
  "HOUSING",
  "WORK_AND_SKILLS",
  "CLIMATE_AND_ENERGY",
  "DEMOCRACY_AND_DIGITAL",
]);

const itemSchema = z.object({
  title: z.string().trim().min(1).max(240),
  summary: z.string().trim().min(1).max(1200),
  url: z.string().url().refine((value) => new URL(value).protocol === "https:", "Nur HTTPS-Links sind zulässig."),
  section: z.enum(["WIRKUNGSANALYSE", "REALITY_CHECK", "ABSTIMMUNG", "LEBENSZYKLUS", "KORREKTUR"]),
  topics: z.array(topicSchema).min(1),
});

export type DailyDigestPublicItem = DailyDigestItem & { topics: Array<z.infer<typeof topicSchema>> };

type ActiveSubscription = {
  id: string;
  email: string;
  requested_topics: string[];
  status: "ACTIVE";
};

type DigestRun = {
  digest_id: string;
  status: "PREPARED" | "SENDING" | "PARTIAL" | "SENT" | "NO_RECIPIENTS" | "FAILED";
  content_hash: string;
};

type DigestDelivery = {
  subscription_id: string;
  status: "QUEUED" | "SENT" | "FAILED";
};

function portalUrl() {
  const value = process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de";
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") throw new Error("Die öffentliche Portal-URL muss HTTPS verwenden.");
  return parsed.toString().replace(/\/$/, "");
}

function contentHash(items: DailyDigestPublicItem[], sourceDeploymentIds: string[]) {
  return createHash("sha256").update(JSON.stringify({ items, sourceDeploymentIds: [...sourceDeploymentIds].sort() })).digest("hex");
}

function matchingItems(subscription: ActiveSubscription, items: DailyDigestPublicItem[]) {
  const requested = new Set(subscription.requested_topics);
  return items.filter((item) => requested.has("ALL_UPDATES") || item.topics.some((topic) => requested.has(topic)));
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(`${date}T12:00:00+02:00`));
}

export async function sendWirkungsradarDailyDigest(input: {
  date: string;
  sourceDeploymentIds: string[];
  items: DailyDigestPublicItem[];
}) {
  const delivery = wirkungsradarDigestDelivery();
  if (!delivery) return { status: "NOT_CONFIGURED" as const, sent: 0, failed: 0 };
  const items = input.items.map((item) => itemSchema.parse(item));
  if (!items.length || !input.sourceDeploymentIds.length) return { status: "NO_CHANGES" as const, sent: 0, failed: 0 };
  const digestId = `political-impact-${input.date}`;
  const hash = contentHash(items, input.sourceDeploymentIds);
  const existingRuns = await supabaseRest<DigestRun[]>(
    `parliament.wirkungsradar_digest_runs?digest_id=eq.${encodeURIComponent(digestId)}&select=digest_id,status,content_hash&limit=1`
  );
  const existingRun = existingRuns[0];
  if (existingRun?.content_hash !== undefined && existingRun.content_hash !== hash) {
    return { status: "CONTENT_CHANGED_AFTER_HANDOFF" as const, sent: 0, failed: 0 };
  }
  if (existingRun?.status === "SENT" || existingRun?.status === "NO_RECIPIENTS") {
    return { status: "ALREADY_SENT" as const, sent: 0, failed: 0 };
  }
  if (!existingRun) {
    await supabaseRest("parliament.wirkungsradar_digest_runs", {
      method: "POST",
      body: JSON.stringify({
        digest_id: digestId,
        publication_date: input.date,
        content_hash: hash,
        source_deployment_ids: input.sourceDeploymentIds,
        item_count: items.length,
        status: "PREPARED",
      }),
    });
  }
  const subscriptions = await supabaseRest<ActiveSubscription[]>(
    "parliament.wirkungsradar_subscriptions?status=eq.ACTIVE&select=id,email,requested_topics,status&order=created_at.asc&limit=10000"
  );
  const candidates = subscriptions.filter((subscription) => matchingItems(subscription, items).length > 0);
  if (!candidates.length) {
    await supabaseRest(`parliament.wirkungsradar_digest_runs?digest_id=eq.${encodeURIComponent(digestId)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "NO_RECIPIENTS", recipient_count: 0, sent_count: 0, failed_count: 0, completed_at: new Date().toISOString() }),
    });
    return { status: "NO_RECIPIENTS" as const, sent: 0, failed: 0 };
  }
  const previous = await supabaseRest<DigestDelivery[]>(
    `parliament.wirkungsradar_digest_deliveries?digest_id=eq.${encodeURIComponent(digestId)}&select=subscription_id,status&limit=10000`
  );
  const alreadySent = new Set(previous.filter((entry) => entry.status === "SENT").map((entry) => entry.subscription_id));
  const batchSize = Math.min(200, Math.max(1, Number(process.env.WIRKUNGSRADAR_DAILY_DIGEST_BATCH_SIZE ?? "50") || 50));
  const pending = candidates.filter((subscription) => !alreadySent.has(subscription.id)).slice(0, batchSize);
  await supabaseRest(`parliament.wirkungsradar_digest_runs?digest_id=eq.${encodeURIComponent(digestId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "SENDING", recipient_count: candidates.length }),
  });
  const transport = createIonosTransport(delivery);
  let sent = 0;
  let failed = 0;
  for (const subscription of pending) {
    const selected = matchingItems(subscription, items);
    const unsubscribeToken = recurringUnsubscribeToken(subscription.id);
    const baseUrl = portalUrl();
    const unsubscribeUrl = `${baseUrl}/wirkungsradar-updates/abmelden?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
    const oneClickUrl = `${baseUrl}/api/wirkungsradar-updates/abmelden?subscription=${encodeURIComponent(subscription.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
    const message = dailyDigestEmail({
      dateLabel: dateLabel(input.date),
      items: selected,
      portalUrl: baseUrl,
      unsubscribeUrl,
      privacyUrl: "https://wirkungsoekonomie.de/datenschutz.html",
      imprintUrl: "https://wirkungsoekonomie.de/impressum.html",
    });
    try {
      await supabaseRest("parliament.wirkungsradar_digest_deliveries?on_conflict=digest_id,subscription_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ digest_id: digestId, subscription_id: subscription.id, status: "QUEUED", item_count: selected.length, error_code: null }),
      });
      await transport.sendMail({
        from: delivery.from,
        replyTo: delivery.replyTo,
        to: subscription.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
        headers: {
          "List-Unsubscribe": `<${oneClickUrl}>, <mailto:${delivery.replyTo}?subject=Abmeldung%20Wirkungsportal>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Auto-Response-Suppress": "All",
        },
      });
      sent += 1;
      await supabaseRest(`parliament.wirkungsradar_digest_deliveries?digest_id=eq.${encodeURIComponent(digestId)}&subscription_id=eq.${encodeURIComponent(subscription.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "SENT", sent_at: new Date().toISOString(), error_code: null }),
      });
    } catch {
      failed += 1;
      await supabaseRest(`parliament.wirkungsradar_digest_deliveries?digest_id=eq.${encodeURIComponent(digestId)}&subscription_id=eq.${encodeURIComponent(subscription.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "FAILED", error_code: "DELIVERY_FAILED" }),
      }).catch(() => undefined);
    }
  }
  const totalSent = alreadySent.size + sent;
  const complete = totalSent >= candidates.length;
  await supabaseRest(`parliament.wirkungsradar_digest_runs?digest_id=eq.${encodeURIComponent(digestId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: complete ? "SENT" : failed > 0 ? "PARTIAL" : "SENDING",
      recipient_count: candidates.length,
      sent_count: totalSent,
      failed_count: failed,
      completed_at: complete ? new Date().toISOString() : null,
    }),
  });
  return { status: complete ? "SENT" as const : "PARTIAL" as const, sent, failed, remaining: Math.max(0, candidates.length - totalSent) };
}

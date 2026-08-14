import { assertExternalReviewSafe } from "@/lib/review/privacy";

export type ReviewNotification = {
  batchCode: string;
  caseCount: number;
  reviewType: "FULL_REVIEW" | "INCREMENTAL_REVIEW" | "EXCEPTION_REVIEW";
  attachment: { bytes: Uint8Array; filename: string };
};

export async function notifyReviewPackageReady(notification: ReviewNotification) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return { status: "SKIPPED" as const, reason: "DISCORD_WEBHOOK_URL is not configured" };
  if (process.env.DISCORD_REVIEW_CHANNEL_PRIVATE !== "true") {
    return { status: "SKIPPED" as const, reason: "Discord review channel privacy has not been confirmed." };
  }

  const safeNotification = assertExternalReviewSafe({
    batchCode: notification.batchCode,
    caseCount: notification.caseCount,
    reviewType: notification.reviewType,
    filename: notification.attachment.filename
  }, "notification");
  const formData = new FormData();
  formData.append("payload_json", JSON.stringify({
    content: [
      "🟠 **Wirkungsreview erforderlich**",
      `Batch ${safeNotification.batchCode} · ${safeNotification.caseCount} ${safeNotification.caseCount === 1 ? "Fall" : "Fälle"}`,
      "Der amtliche Stand und die automatisierbaren Prüfschritte sind vorbereitet.",
      "Das Review-Paket ist dieser Nachricht als geschützte Arbeitsdatei beigefügt."
    ].join("\n")
  }));
  formData.append("files[0]", new Blob([notification.attachment.bytes], { type: "application/zip" }), notification.attachment.filename);
  const response = await fetch(webhook, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) throw new Error(`Discord notification failed with ${response.status}.`);
  return { status: "DELIVERED" as const };
}

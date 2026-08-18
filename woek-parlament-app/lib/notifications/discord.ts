import { assertExternalReviewSafe } from "@/lib/review/privacy";

export type ReviewNotification = {
  batchCode: string;
  caseCount: number;
  reviewType: "FULL_REVIEW" | "INCREMENTAL_REVIEW" | "EXCEPTION_REVIEW";
  attachment: { bytes: Uint8Array; filename: string };
};

type GovernmentDailyReport = {
  DATE: string;
  FILES_NEW: number;
  NEW_IMPACT_CASES: number;
  UPDATED_IMPACT_CASES: number;
  REALITY_CHECK_UPDATES: number;
  OPEN_DATA_ISSUES: number;
  OPEN_FACH_REVIEWS: number;
  blockers: string[];
};

type ParliamentDailyNotification = {
  deliveryId: string;
  deliveryPath: string;
  report: {
    NEW_PARLIAMENTARY_CASES: number;
    UPDATED_CASES: number;
    UPCOMING_ITEMS: number;
    NEW_VOTE_EVENTS: number;
    NEW_INDIVIDUAL_VOTES: number;
    EFFECT_BEARING_CANDIDATES: number;
    OPEN_DATA_ISSUES: number;
    blockers: string[];
  };
};

export function reviewNotificationDeliveryReady() {
  return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_REVIEW_RECIPIENT_USER_ID);
}

export async function notifyReviewPackageReady(notification: ReviewNotification) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const recipientUserId = process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
  if (!botToken || !recipientUserId) {
    return { status: "SKIPPED" as const, reason: "Discord bot direct-message delivery is not configured." };
  }
  if (!reviewNotificationDeliveryReady()) {
    return { status: "SKIPPED" as const, reason: "Discord bot direct-message delivery is not ready." };
  }

  const safeNotification = assertExternalReviewSafe({
    batchCode: notification.batchCode,
    caseCount: notification.caseCount,
    reviewType: notification.reviewType,
    filename: notification.attachment.filename
  }, "notification");

  const directMessageResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      authorization: `Bot ${botToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ recipient_id: recipientUserId }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!directMessageResponse.ok) {
    throw new Error(`Discord direct-message channel could not be opened (${directMessageResponse.status}).`);
  }
  const directMessageChannel = await directMessageResponse.json() as { id?: string };
  if (!directMessageChannel.id) throw new Error("Discord direct-message channel returned no channel ID.");

  const reviewPrompt = [
    `Analysiere den angehängten WÖk-Review-Batch ${safeNotification.batchCode} vollständig.`,
    "Nutze ausschließlich die mitgelieferten und eindeutig referenzierten Quellen.",
    "Trenne den damaligen Wissensstand, Wirkungspotenziale und Risiken strikt von späterer Beobachtung und Zurechnung.",
    "Erfinde keine Werte. Fehlende Angaben bleiben als DATA_GAP sichtbar.",
    "Gib ausschließlich das im Paket verlangte strukturierte Ergebnis-ZIP mit validen Case- und Quellenreferenzen zurück."
  ].join("\n");

  const formData = new FormData();
  formData.append("payload_json", JSON.stringify({
    content: [
      "🟠 **Wirkungsreview erforderlich**",
      `Batch ${safeNotification.batchCode} · ${safeNotification.caseCount} ${safeNotification.caseCount === 1 ? "Fall" : "Fälle"}`,
      "Der amtliche Stand und die automatisierbaren Prüfschritte sind vorbereitet.",
      "**Prompt zum Kopieren:**",
      "```",
      reviewPrompt,
      "```",
      "Das vollständige Review-Paket und der Prompt als Textdatei sind beigefügt."
    ].join("\n"),
    attachments: [
      { id: 0, filename: safeNotification.filename },
      { id: 1, filename: `${safeNotification.batchCode}-REVIEW-PROMPT.md` }
    ]
  }));
  formData.append("files[0]", new Blob([notification.attachment.bytes], { type: "application/zip" }), notification.attachment.filename);
  formData.append("files[1]", new Blob([`${reviewPrompt}\n`], { type: "text/markdown;charset=utf-8" }), `${safeNotification.batchCode}-REVIEW-PROMPT.md`);
  const response = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(directMessageChannel.id)}/messages`, {
    method: "POST",
    headers: { authorization: `Bot ${botToken}` },
    body: formData,
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) throw new Error(`Discord direct message failed (${response.status}).`);
  return { status: "DELIVERED" as const };
}

async function openDirectMessageChannel(botToken: string, recipientUserId: string) {
  const response = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: { authorization: `Bot ${botToken}`, "content-type": "application/json" },
    body: JSON.stringify({ recipient_id: recipientUserId }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Discord direct-message channel could not be opened (${response.status}).`);
  const channel = await response.json() as { id?: string };
  if (!channel.id) throw new Error("Discord direct-message channel returned no channel ID.");
  return channel.id;
}

export async function notifyGovernmentDailyIngest(input: { reports: GovernmentDailyReport[]; deploymentRequested: boolean }) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const recipientUserId = process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
  if (!botToken || !recipientUserId) return { status: "SKIPPED" as const, reason: "Discord DM is not configured." };
  const channelId = await openDirectMessageChannel(botToken, recipientUserId);
  const blockers = input.reports.flatMap((report) => report.blockers.map((value) => `${report.DATE}: ${value}`));
  const content = [
    blockers.length ? "🟠 **Regierungs-Wirkungsanalyse: Prüfung erforderlich**" : "🟢 **Regierungs-Wirkungsanalyse verarbeitet**",
    ...input.reports.map((report) => [
      `**${report.DATE}**`,
      `${report.NEW_IMPACT_CASES} neu · ${report.UPDATED_IMPACT_CASES} aktualisiert · ${report.REALITY_CHECK_UPDATES} Reality-Checks`,
      `${report.OPEN_DATA_ISSUES} offene Datenfragen · ${report.OPEN_FACH_REVIEWS} offene Fachprüfungen`,
    ].join("\n")),
    input.deploymentRequested ? "Production-Deployment wurde nach grünen Gates angefordert." : "Kein Production-Deployment angefordert.",
    ...(blockers.length ? ["**Blocker:**", ...blockers.slice(0, 8).map((value) => `- ${value}`)] : []),
  ].join("\n").slice(0, 1900);
  const response = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`, {
    method: "POST",
    headers: { authorization: `Bot ${botToken}`, "content-type": "application/json" },
    body: JSON.stringify({ content }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Discord government ingest direct message failed (${response.status}).`);
  return { status: "DELIVERED" as const };
}

export async function notifyParliamentDailyReady(input: ParliamentDailyNotification) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const recipientUserId = process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
  if (!botToken || !recipientUserId) return { status: "SKIPPED" as const, reason: "Discord DM is not configured." };
  const channelId = await openDirectMessageChannel(botToken, recipientUserId);
  const prompt = [
    `Prüfe die vollständige READY-Lieferung ${input.deliveryId} unter ${input.deliveryPath}.`,
    "Nutze ausschließlich die enthaltenen amtlichen Quellen für parlamentarische Fakten.",
    "Erzeuge oder aktualisiere WÖkImpactCases nur für eigenständige materielle Wirkungsgegenstände.",
    "Trenne Wirkungspotenzial, Wirkungsrisiko, Evidenz, Rechtsbezug, MPD, SDG/SDG+ und Reality Check.",
    "Rekonstruiere niemals eine Individualstimme aus einer Fraktionsposition.",
    "Gib bei Freigabe die dateigleichen PARLAMENT-IMPACT-, PARLAMENT-VOTES- und PARLAMENT-SOURCES-Dateien sowie DEPLOY-APPROVED zurück; andernfalls DEPLOY-BLOCKED.",
  ].join("\n");
  const content = [
    "🟠 **Neue Parlamentslieferung zur WÖk-Fachprüfung**",
    `**${input.deliveryId}**`,
    `${input.report.NEW_PARLIAMENTARY_CASES} neue · ${input.report.UPDATED_CASES} aktualisierte Vorgänge · ${input.report.UPCOMING_ITEMS} bevorstehende Punkte`,
    `${input.report.NEW_VOTE_EVENTS} Abstimmungen · ${input.report.NEW_INDIVIDUAL_VOTES} amtliche Einzelstimmen`,
    `${input.report.EFFECT_BEARING_CANDIDATES} mögliche Wirkungsgegenstände · ${input.report.OPEN_DATA_ISSUES} offene Datenfragen`,
    `Dropbox: ${input.deliveryPath}`,
    "**Prompt zum Kopieren:**",
    "```",
    prompt,
    "```",
    ...(input.report.blockers.length ? ["**Technische Hinweise:**", ...input.report.blockers.slice(0, 5).map((value) => `- ${value}`)] : []),
  ].join("\n").slice(0, 1900);
  const response = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`, {
    method: "POST",
    headers: { authorization: `Bot ${botToken}`, "content-type": "application/json" },
    body: JSON.stringify({ content }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Discord parliament daily direct message failed (${response.status}).`);
  return { status: "DELIVERED" as const };
}

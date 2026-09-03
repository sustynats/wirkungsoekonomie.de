import nodemailer from "nodemailer";
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

type NotificationEmailConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  replyTo: string;
  recipient: string;
};

function first(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean);
}

function notificationEmailConfig(): NotificationEmailConfig | null {
  const host = first(process.env.REVIEW_NOTIFICATION_SMTP_HOST, process.env.WIRKUNGSRADAR_SMTP_HOST, process.env.WOEK_NEWSLETTER_SMTP_HOST);
  const port = Number(first(process.env.REVIEW_NOTIFICATION_SMTP_PORT, process.env.WIRKUNGSRADAR_SMTP_PORT, process.env.WOEK_NEWSLETTER_SMTP_PORT) ?? "587");
  const user = first(process.env.REVIEW_NOTIFICATION_SMTP_USER, process.env.WIRKUNGSRADAR_SMTP_USER, process.env.WOEK_NEWSLETTER_SMTP_USER);
  const password = first(process.env.REVIEW_NOTIFICATION_SMTP_PASSWORD, process.env.WIRKUNGSRADAR_SMTP_PASSWORD, process.env.WOEK_NEWSLETTER_SMTP_PASSWORD);
  const from = first(process.env.REVIEW_NOTIFICATION_SMTP_FROM, process.env.WIRKUNGSRADAR_SMTP_FROM, process.env.WOEK_NEWSLETTER_SMTP_FROM);
  const replyTo = first(process.env.REVIEW_NOTIFICATION_SMTP_REPLY_TO, process.env.WIRKUNGSRADAR_SMTP_REPLY_TO, process.env.WOEK_NEWSLETTER_SMTP_REPLY_TO, user);
  const recipient = first(process.env.REVIEW_NOTIFICATION_EMAIL, process.env.WIRKUNGSRADAR_SMTP_TEST_RECIPIENT, process.env.WOEK_NEWSLETTER_SMTP_TEST_RECIPIENT, replyTo, user);
  if (!host || !user || !password || !from || !replyTo || !recipient || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  if (host !== "smtp.ionos.de" || port !== 587 || !user.includes("@") || !replyTo.includes("@") || !recipient.includes("@")) return null;
  return { host, port, user, password, from, replyTo, recipient };
}

function emailTransport(config: NotificationEmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    requireTLS: true,
    auth: { user: config.user, pass: config.password },
    tls: { minVersion: "TLSv1.2", servername: config.host }
  });
}

function discordReady() {
  return Boolean(process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_REVIEW_RECIPIENT_USER_ID);
}

export function reviewNotificationDeliveryReady() {
  return discordReady() || Boolean(notificationEmailConfig());
}

export function reviewNotificationDeliveryChannel() {
  if (discordReady()) return "discord_dm" as const;
  if (notificationEmailConfig()) return "email" as const;
  return "disabled" as const;
}

async function sendInternalEmail(input: { subject: string; text: string; html?: string; attachments?: Array<{ filename: string; content: Buffer; contentType: string }> }) {
  const config = notificationEmailConfig();
  if (!config) return { status: "SKIPPED" as const, reason: "Internal review notification delivery is not configured." };
  await emailTransport(config).sendMail({
    from: config.from,
    replyTo: config.replyTo,
    to: config.recipient,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
    headers: { "X-Auto-Response-Suppress": "All" }
  });
  return { status: "DELIVERED" as const, channel: "email" as const };
}

function reviewPrompt(batchCode: string) {
  return [
    `Analysiere den angehängten WÖk-Review-Batch ${batchCode} vollständig.`,
    "Nutze ausschließlich die mitgelieferten und eindeutig referenzierten Quellen.",
    "Trenne den damaligen Wissensstand, Wirkungspotenziale und Risiken strikt von späterer Beobachtung und Zurechnung.",
    "Erfinde keine Werte. Fehlende Angaben bleiben als DATA_GAP sichtbar.",
    "Gib ausschließlich das im Paket verlangte strukturierte Ergebnis-ZIP mit validen Case- und Quellenreferenzen zurück."
  ].join("\n");
}

export async function notifyReviewPackageReady(notification: ReviewNotification) {
  const safeNotification = assertExternalReviewSafe({
    batchCode: notification.batchCode,
    caseCount: notification.caseCount,
    reviewType: notification.reviewType,
    filename: notification.attachment.filename
  }, "notification");
  const prompt = reviewPrompt(safeNotification.batchCode);

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const recipientUserId = process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
  if (!botToken || !recipientUserId) {
    const text = [
      "Wirkungsreview erforderlich",
      `Batch ${safeNotification.batchCode} · ${safeNotification.caseCount} ${safeNotification.caseCount === 1 ? "Fall" : "Fälle"}`,
      "Der amtliche Stand und die automatisierbaren Prüfschritte sind vorbereitet.",
      "",
      "Prompt:",
      prompt
    ].join("\n");
    return sendInternalEmail({
      subject: `WÖk Wirkungsreview erforderlich - ${safeNotification.batchCode}`,
      text,
      html: `<h2>Wirkungsreview erforderlich</h2><p>Batch <strong>${safeNotification.batchCode}</strong> · ${safeNotification.caseCount} ${safeNotification.caseCount === 1 ? "Fall" : "Fälle"}</p><pre>${prompt.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>`,
      attachments: [
        { filename: safeNotification.filename, content: Buffer.from(notification.attachment.bytes), contentType: "application/zip" },
        { filename: `${safeNotification.batchCode}-REVIEW-PROMPT.md`, content: Buffer.from(`${prompt}\n`, "utf8"), contentType: "text/markdown; charset=utf-8" }
      ]
    });
  }

  const directMessageResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: { authorization: `Bot ${botToken}`, "content-type": "application/json" },
    body: JSON.stringify({ recipient_id: recipientUserId }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!directMessageResponse.ok) throw new Error(`Discord direct-message channel could not be opened (${directMessageResponse.status}).`);
  const directMessageChannel = await directMessageResponse.json() as { id?: string };
  if (!directMessageChannel.id) throw new Error("Discord direct-message channel returned no channel ID.");

  const formData = new FormData();
  formData.append("payload_json", JSON.stringify({
    content: [
      "🟠 **Wirkungsreview erforderlich**",
      `Batch ${safeNotification.batchCode} · ${safeNotification.caseCount} ${safeNotification.caseCount === 1 ? "Fall" : "Fälle"}`,
      "Der amtliche Stand und die automatisierbaren Prüfschritte sind vorbereitet.",
      "**Prompt zum Kopieren:**",
      "```",
      prompt,
      "```",
      "Das vollständige Review-Paket und der Prompt als Textdatei sind beigefügt."
    ].join("\n"),
    attachments: [
      { id: 0, filename: safeNotification.filename },
      { id: 1, filename: `${safeNotification.batchCode}-REVIEW-PROMPT.md` }
    ]
  }));
  formData.append("files[0]", new Blob([notification.attachment.bytes], { type: "application/zip" }), notification.attachment.filename);
  formData.append("files[1]", new Blob([`${prompt}\n`], { type: "text/markdown;charset=utf-8" }), `${safeNotification.batchCode}-REVIEW-PROMPT.md`);
  const response = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(directMessageChannel.id)}/messages`, {
    method: "POST",
    headers: { authorization: `Bot ${botToken}` },
    body: formData,
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`Discord direct message failed (${response.status}).`);
  return { status: "DELIVERED" as const, channel: "discord_dm" as const };
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

async function sendDiscordText(content: string, failureMessage: string) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const recipientUserId = process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
  if (!botToken || !recipientUserId) return null;
  const channelId = await openDirectMessageChannel(botToken, recipientUserId);
  const response = await fetch(`https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`, {
    method: "POST",
    headers: { authorization: `Bot ${botToken}`, "content-type": "application/json" },
    body: JSON.stringify({ content: content.slice(0, 1900) }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${failureMessage} (${response.status}).`);
  return { status: "DELIVERED" as const, channel: "discord_dm" as const };
}

export async function notifyGovernmentDailyIngest(input: { reports: GovernmentDailyReport[]; deploymentRequested: boolean }) {
  const blockers = input.reports.flatMap((report) => report.blockers.map((value) => `${report.DATE}: ${value}`));
  const content = [
    blockers.length ? "Regierungs-Wirkungsanalyse: Prüfung erforderlich" : "Regierungs-Wirkungsanalyse verarbeitet",
    ...input.reports.map((report) => [
      `${report.DATE}`,
      `${report.NEW_IMPACT_CASES} neu · ${report.UPDATED_IMPACT_CASES} aktualisiert · ${report.REALITY_CHECK_UPDATES} Reality-Checks`,
      `${report.OPEN_DATA_ISSUES} offene Datenfragen · ${report.OPEN_FACH_REVIEWS} offene Fachprüfungen`,
    ].join("\n")),
    input.deploymentRequested ? "Production-Deployment wurde nach grünen Gates angefordert." : "Kein Production-Deployment angefordert.",
    ...(blockers.length ? ["Blocker:", ...blockers.slice(0, 8).map((value) => `- ${value}`)] : []),
  ].join("\n");
  const discord = await sendDiscordText(content, "Discord government ingest direct message failed");
  if (discord) return discord;
  return sendInternalEmail({
    subject: blockers.length ? "WÖk Regierungs-Wirkungsanalyse - Prüfung erforderlich" : "WÖk Regierungs-Wirkungsanalyse verarbeitet",
    text: content,
    html: `<pre>${content.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>`
  });
}

export async function notifyParliamentDailyReady(input: ParliamentDailyNotification) {
  const prompt = [
    `Prüfe die vollständige READY-Lieferung ${input.deliveryId} unter ${input.deliveryPath}.`,
    "Nutze ausschließlich die enthaltenen amtlichen Quellen für parlamentarische Fakten.",
    "Erzeuge oder aktualisiere WÖkImpactCases nur für eigenständige materielle Wirkungsgegenstände.",
    "Trenne Wirkungspotenzial, Wirkungsrisiko, Evidenz, Rechtsbezug, MPD, SDG/SDG+ und Reality Check.",
    "Rekonstruiere niemals eine Individualstimme aus einer Fraktionsposition.",
    "Gib bei Freigabe die dateigleichen PARLAMENT-IMPACT-, PARLAMENT-VOTES- und PARLAMENT-SOURCES-Dateien sowie DEPLOY-APPROVED zurück; andernfalls DEPLOY-BLOCKED.",
  ].join("\n");
  const content = [
    "Neue Parlamentslieferung zur WÖk-Fachprüfung",
    input.deliveryId,
    `${input.report.NEW_PARLIAMENTARY_CASES} neue · ${input.report.UPDATED_CASES} aktualisierte Vorgänge · ${input.report.UPCOMING_ITEMS} bevorstehende Punkte`,
    `${input.report.NEW_VOTE_EVENTS} Abstimmungen · ${input.report.NEW_INDIVIDUAL_VOTES} amtliche Einzelstimmen`,
    `${input.report.EFFECT_BEARING_CANDIDATES} mögliche Wirkungsgegenstände · ${input.report.OPEN_DATA_ISSUES} offene Datenfragen`,
    `Dropbox: ${input.deliveryPath}`,
    "Prompt:",
    prompt,
    ...(input.report.blockers.length ? ["Technische Hinweise:", ...input.report.blockers.slice(0, 5).map((value) => `- ${value}`)] : []),
  ].join("\n");
  const discord = await sendDiscordText(content, "Discord parliament daily direct message failed");
  if (discord) return discord;
  return sendInternalEmail({
    subject: `WÖk Parlamentslieferung zur Fachprüfung - ${input.deliveryId}`,
    text: content,
    html: `<pre>${content.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>`
  });
}

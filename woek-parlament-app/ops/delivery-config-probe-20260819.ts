const result = {
  branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
  vercel_env: process.env.VERCEL_ENV ?? null,
  wirkungsradar_daily_digest_enabled: process.env.WIRKUNGSRADAR_DAILY_DIGEST_ENABLED === "true",
  wirkungsradar_unsubscribe_signing_secret_present: Boolean(process.env.WIRKUNGSRADAR_UNSUBSCRIBE_SIGNING_SECRET),
  cron_secret_present: Boolean(process.env.CRON_SECRET),
  autopilot_runtime_normal: process.env.WOEK_AUTOPILOT_RUNTIME_MODE === "NORMAL_SCHEDULED_OPERATION",
  autopilot_runtime_mode_present: Boolean(process.env.WOEK_AUTOPILOT_RUNTIME_MODE),
  newsletter_admin_token_present: Boolean(process.env.NEWSLETTER_ADMIN_TOKEN),
  discord_webhook_present: Boolean(process.env.DISCORD_WEBHOOK_URL || process.env.WOEK_DISCORD_WEBHOOK_URL),
  review_notification_email_present: Boolean(process.env.REVIEW_NOTIFICATION_EMAIL),
};
console.log(`WOEK_DELIVERY_CONFIG_PROBE ${JSON.stringify(result)}`);

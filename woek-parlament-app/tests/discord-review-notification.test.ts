import assert from "node:assert/strict";
import test from "node:test";
import { reviewNotificationDeliveryReady } from "@/lib/notifications/discord";

test("review delivery requires the institute bot and a direct-message recipient", () => {
  const previousToken = process.env.DISCORD_BOT_TOKEN;
  const previousRecipient = process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
  const previousWebhook = process.env.DISCORD_WEBHOOK_URL;
  try {
    delete process.env.DISCORD_BOT_TOKEN;
    delete process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
    process.env.DISCORD_WEBHOOK_URL = "https://example.invalid/webhook";
    assert.equal(reviewNotificationDeliveryReady(), false);

    process.env.DISCORD_BOT_TOKEN = "test-bot-token";
    process.env.DISCORD_REVIEW_RECIPIENT_USER_ID = "123456789012345678";
    assert.equal(reviewNotificationDeliveryReady(), true);
  } finally {
    if (previousToken === undefined) delete process.env.DISCORD_BOT_TOKEN;
    else process.env.DISCORD_BOT_TOKEN = previousToken;
    if (previousRecipient === undefined) delete process.env.DISCORD_REVIEW_RECIPIENT_USER_ID;
    else process.env.DISCORD_REVIEW_RECIPIENT_USER_ID = previousRecipient;
    if (previousWebhook === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = previousWebhook;
  }
});

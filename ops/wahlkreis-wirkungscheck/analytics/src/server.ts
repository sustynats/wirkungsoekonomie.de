import Fastify from "fastify";
import { readConfig } from "./config.js";
import { createPool, recordEvent, recordSecurityAlert } from "./db.js";
import { isValidAnalyticsNonce, validateAnalyticsEvent } from "./event-registry.js";

const config = readConfig();
const pool = createPool(config);
const app = Fastify({ logger: false, bodyLimit: 8_192 });

function corsHeaders(origin: string | undefined) {
  if (!origin || !config.allowedOrigins.has(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    vary: "Origin",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, X-Analytics-Session-Nonce",
    "access-control-max-age": "86400"
  };
}

app.options("/api/analytics/events", async (request, reply) => {
  reply.code(204).headers(corsHeaders(request.headers.origin)).send();
});

app.get("/healthz", async () => {
  await pool.query("select 1");
  return { ok: true };
});

app.post("/api/analytics/events", async (request, reply) => {
  const headers = corsHeaders(request.headers.origin);
  const nonce = request.headers["x-analytics-session-nonce"];
  const nonceValue = Array.isArray(nonce) ? nonce[0] : nonce;

  if (!isValidAnalyticsNonce(nonceValue)) {
    await recordSecurityAlert(pool, "invalid_analytics_nonce").catch(() => undefined);
    return reply.code(400).headers(headers).send({ ok: false, error: "invalid_event" });
  }

  const validation = validateAnalyticsEvent(request.body);
  if (!validation.ok) {
    await recordSecurityAlert(pool, validation.reason).catch(() => undefined);
    return reply.code(400).headers(headers).send({ ok: false, error: "invalid_event" });
  }

  try {
    const result = await recordEvent(pool, config, nonceValue, validation.event);
    return reply.code(202).headers(headers).send({ ok: true, accepted: result.inserted });
  } catch {
    // Fehler enthalten weder Request-Details noch gelangen sie in Security- oder Analytics-Logs.
    return reply.code(503).headers(headers).send({ ok: false, error: "temporarily_unavailable" });
  }
});

async function close() {
  await app.close();
  await pool.end();
}

process.on("SIGINT", () => void close().finally(() => process.exit(0)));
process.on("SIGTERM", () => void close().finally(() => process.exit(0)));

await app.listen({ host: "0.0.0.0", port: config.PORT });

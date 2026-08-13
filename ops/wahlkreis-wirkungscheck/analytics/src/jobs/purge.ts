import { readConfig } from "../config.js";
import { createPool, purgeExpiredAnalyticsEvents } from "../db.js";

const config = readConfig();
const pool = createPool(config);

try {
  await purgeExpiredAnalyticsEvents(pool, config.ANALYTICS_RAW_TTL_HOURS);
} finally {
  await pool.end();
}

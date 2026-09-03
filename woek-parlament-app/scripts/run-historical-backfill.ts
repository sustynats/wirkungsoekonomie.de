import { historicalWoeKBackfillStart } from "@/lib/dip-backfill";
import { runHistoricalDipBackfill } from "@/lib/editorial/historical-backfill";

function dateValue(value: string | undefined, fallback: string) {
  const selected = value?.trim() || fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(selected)) throw new Error("Backfill dates must use YYYY-MM-DD.");
  return selected;
}

const startDate = dateValue(process.env.HISTORICAL_WOEK_BACKFILL_START, historicalWoeKBackfillStart);
const endDate = process.env.HISTORICAL_WOEK_BACKFILL_END ? dateValue(process.env.HISTORICAL_WOEK_BACKFILL_END, startDate) : undefined;

const result = await runHistoricalDipBackfill({ startDate, endDate });
console.log(JSON.stringify({ status: "completed", ...result }, null, 2));

import { berlinDateSlot } from "@/lib/parliament/daily-ingest-core";

export function politicalDigestWindow(now = new Date()) {
  const berlin = berlinDateSlot(now);
  return { ...berlin, due: berlin.hour === 22 || berlin.hour === 23 };
}

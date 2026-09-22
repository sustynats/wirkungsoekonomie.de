import { processPoliticalDailyDigest } from "@/lib/autopilot/daily-digest-runner";
import { bootstrapDisabledResponse, recurringWritersEnabled } from "@/lib/autopilot/runtime-mode";

async function main() {
  if (!recurringWritersEnabled()) {
    console.log(JSON.stringify(bootstrapDisabledResponse()));
    return;
  }

  const result = await processPoliticalDailyDigest();
  const status = "status" in result ? result.status : result.result.status;
  console.log(JSON.stringify({ status, date: "date" in result ? result.date : null }));

  if (status === "FAILED" || status === "NOT_CONFIGURED") process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Political daily digest failed.");
  process.exitCode = 1;
});

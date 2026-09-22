import { bootstrapDisabledResponse, recurringWritersEnabled } from "@/lib/autopilot/runtime-mode";
import { processPoliticalAutopilot } from "@/lib/autopilot/runner";

async function main() {
  if (!recurringWritersEnabled()) {
    console.log(JSON.stringify(bootstrapDisabledResponse()));
    return;
  }

  const forced = process.env.WOEK_AUTOPILOT_FORCE_SLOT;
  const forceSlot = forced === "AM" || forced === "PM" ? forced : null;
  const result = await processPoliticalAutopilot(new Date(), forceSlot);
  console.log(JSON.stringify({ status: result.status, run_id: "run_id" in result ? result.run_id : null }));

  if (result.status === "BLOCKED") process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Political autopilot failed.");
  process.exitCode = 1;
});

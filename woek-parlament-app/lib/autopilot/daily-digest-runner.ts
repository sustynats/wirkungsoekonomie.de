import "server-only";

import { dropboxAppReady, uploadDropboxText } from "@/lib/dropbox/app-client";
import {
  markParliamentDigestDeployments,
  pendingParliamentDigestChanges,
} from "@/lib/parliament/daily-ingest";
import {
  markGovernmentDigestDeployments,
  pendingGovernmentDigestChanges,
} from "@/lib/government/daily-impact-ingest";
import { politicalDigestWindow } from "@/lib/autopilot/digest-window";
import { sendWirkungsradarDailyDigest } from "@/lib/wirkungsradar/daily-digest";

const reportRoot = "/WOEK/WOEK-AUTOPILOT/LEDGERS";

export async function processPoliticalDailyDigest(now = new Date()) {
  const berlin = politicalDigestWindow(now);
  if (!berlin.due) return { status: "SKIPPED_OUTSIDE_DIGEST_WINDOW" as const, berlin_hour: berlin.hour };
  if (!dropboxAppReady()) return { status: "NOT_CONFIGURED" as const, reason: "Dropbox ist nicht konfiguriert." };

  const [parliament, government] = await Promise.all([
    pendingParliamentDigestChanges(),
    pendingGovernmentDigestChanges(),
  ]);
  const parliamentDeployments = parliament.status === "READY" ? parliament.deploymentIds : [];
  const governmentDeployments = government.status === "READY" ? government.deploymentIds : [];
  const sourceDeploymentIds = [...parliamentDeployments, ...governmentDeployments];
  const items = [
    ...(parliament.status === "READY" ? parliament.items : []),
    ...(government.status === "READY" ? government.items : []),
  ];

  let result: Awaited<ReturnType<typeof sendWirkungsradarDailyDigest>> | { status: "FAILED"; reason: string };
  try {
    result = await sendWirkungsradarDailyDigest({
      date: berlin.date,
      sourceDeploymentIds,
      items,
    });
    if (["SENT", "ALREADY_SENT", "NO_RECIPIENTS"].includes(result.status)) {
      await Promise.all([
        markParliamentDigestDeployments(parliamentDeployments, "SENT"),
        markGovernmentDigestDeployments(governmentDeployments, "SENT"),
      ]);
    } else if (result.status === "CONTENT_CHANGED_AFTER_HANDOFF") {
      await Promise.all([
        markParliamentDigestDeployments(parliamentDeployments, "FAILED"),
        markGovernmentDigestDeployments(governmentDeployments, "FAILED"),
      ]);
    }
  } catch (error) {
    result = { status: "FAILED", reason: error instanceof Error ? error.message : "Unbekannter Versandfehler" };
    await Promise.all([
      markParliamentDigestDeployments(parliamentDeployments, "FAILED"),
      markGovernmentDigestDeployments(governmentDeployments, "FAILED"),
    ]);
  }

  const report = {
    date: berlin.date,
    generated_at: now.toISOString(),
    sources: {
      parliament: { verified_deployments: parliamentDeployments.length, public_items: parliament.status === "READY" ? parliament.items.length : 0 },
      federal_government: { verified_deployments: governmentDeployments.length, public_items: government.status === "READY" ? government.items.length : 0 },
      states: { verified_deployments: 0, public_items: 0, status: "NO_VERIFIED_FEED_CONNECTED" },
      eu: { verified_deployments: 0, public_items: 0, status: "NO_VERIFIED_FEED_CONNECTED" },
    },
    result,
  };
  await uploadDropboxText(`${reportRoot}/DAILY-DIGEST-${berlin.date}.json`, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

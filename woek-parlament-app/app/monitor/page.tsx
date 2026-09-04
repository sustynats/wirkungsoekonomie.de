import Link from "next/link";
import { HomeMonitorContext } from "@/app/components/HomeContentSections";
import { PortalLanding } from "@/app/components/PortalLanding";
import { MonitorAreaOverview } from "@/app/components/PortalAreaOverview";
import { monitorCopy, MonitorContext } from "@/app/components/MonitorContext";
import { portalNavigation } from "@/lib/navigation";
import { getPublicRegister } from "@/lib/register";
import { portalStand } from "@/lib/portal-stand";
export const metadata = { title: "Wirkungsmonitor" };
export default function Page() {
  const branch = portalNavigation[2];
  const stand = portalStand(getPublicRegister(), []);
  return <><PortalLanding title={branch.label} lead="Monitoring sammelt fortlaufend Daten." items={branch.children ?? []} visual={<MonitorAreaOverview stand={stand} />}>
    <details className="portal-context" id="monitor-einordnung"><summary>Monitoring und Evaluation unterscheiden</summary>
      <p className="eyebrow">{monitorCopy.eyebrow}</p><h2>{monitorCopy.title}</h2><p>{monitorCopy.lead}</p><MonitorContext />
    </details>
    <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
  </PortalLanding><HomeMonitorContext /></>;
}

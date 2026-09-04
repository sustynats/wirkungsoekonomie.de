import { PortalLanding } from "@/app/components/PortalLanding";
import { portalNavigation } from "@/lib/navigation";
import { CurrentAreaOverview } from "@/app/components/PortalAreaOverview";
import { listPublishedCases } from "@/lib/cases";
import { getPublicRegister } from "@/lib/register";
import { portalStand } from "@/lib/portal-stand";
const branch = portalNavigation[0];
export const metadata = { title: branch.label };
export default function Page() {
  const stand = portalStand(getPublicRegister(), listPublishedCases().filter(item => item.kind === "RADAR").map(item => item.slug));
  return <PortalLanding title={branch.label} lead="Bevorstehende Entscheidungen, laufende Verfahren und neue Veröffentlichungen." items={branch.children ?? []} visual={<CurrentAreaOverview stand={stand} />} />;
}

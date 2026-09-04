import { PortalLanding } from "@/app/components/PortalLanding";
import { portalNavigation } from "@/lib/navigation";
const branch = portalNavigation[0];
export const metadata = { title: branch.label };
export default function Page() { return <PortalLanding title={branch.label} lead="Bevorstehende Entscheidungen, laufende Verfahren und neue Veröffentlichungen." items={branch.children ?? []} />; }

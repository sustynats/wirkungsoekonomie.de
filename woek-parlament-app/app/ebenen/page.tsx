import { PortalLanding } from "@/app/components/PortalLanding";
import { portalNavigation } from "@/lib/navigation";
import { StateCartogram } from "@/app/components/StateCartogram";
const branch = portalNavigation[3];
export const metadata = { title: branch.label };
export default function Page() { return <PortalLanding title={branch.label} lead="Wirkungsgegenstände nach ihrer zuständigen staatlichen Ebene erschließen." items={branch.children ?? []} visual={<section aria-labelledby="area-states-title"><h2 id="area-states-title">Fachstand in den Ländern</h2><StateCartogram /></section>} />; }

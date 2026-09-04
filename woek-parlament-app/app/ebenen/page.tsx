import { PortalLanding } from "@/app/components/PortalLanding";
import { portalNavigation } from "@/lib/navigation";
const branch = portalNavigation[3];
export const metadata = { title: branch.label };
export default function Page() { return <PortalLanding title={branch.label} lead="Wirkungsgegenstände nach ihrer zuständigen staatlichen Ebene erschließen." items={branch.children ?? []} />; }

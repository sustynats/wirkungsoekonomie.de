import { PortalLanding } from "@/app/components/PortalLanding";
import { portalNavigation } from "@/lib/navigation";
const branch = portalNavigation[4];
export const metadata = { title: branch.label };
export default function Page() { return <PortalLanding title={branch.label} lead="Methodik, Referenzrahmen, Quellen und Grenzen der unabhängigen WÖk-Prüfung." items={branch.children ?? []} />; }

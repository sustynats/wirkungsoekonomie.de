// P1: render the existing content; do not duplicate or reinterpret its data.
import GovernmentLandingPage from "@/app/regierung/page";
import { CrossPageQueryLink } from "@/app/components/SamePageNavigation";
export default function Page() { return <><p className="shell"><CrossPageQueryLink href="/wirkungsakten?ebene=bund&organ=bundesregierung">Regierungsanalysen im gemeinsamen Register</CrossPageQueryLink></p><GovernmentLandingPage /></>; }
export const metadata = { title: "Wirkungsportal" };

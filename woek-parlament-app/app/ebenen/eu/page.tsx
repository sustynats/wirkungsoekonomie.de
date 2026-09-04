// P1: render the existing content; do not duplicate or reinterpret its data.
import EuropeanUnionPage from "@/app/eu/page";
import { CrossPageQueryLink } from "@/app/components/SamePageNavigation";
export { metadata } from "@/app/eu/page";
export default function Page() { return <><p className="shell"><CrossPageQueryLink href="/wirkungsakten?ebene=eu&organ=eu">EU-Wirkungsfälle im gemeinsamen Register</CrossPageQueryLink></p><EuropeanUnionPage /></>; }

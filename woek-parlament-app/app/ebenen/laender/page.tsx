// P1: render the existing content; do not duplicate or reinterpret its data.
import StatesPage from "@/app/laender/page";
import { CrossPageQueryLink } from "@/app/components/SamePageNavigation";
export { metadata } from "@/app/laender/page";
export default function Page() { return <><p className="shell"><CrossPageQueryLink href="/wirkungsakten?ebene=land">Landesbezogene Akten im gemeinsamen Register</CrossPageQueryLink></p><StatesPage /></>; }

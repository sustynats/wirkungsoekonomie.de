import SectionPage from "@/app/[section]/page";
import { CrossPageQueryLink } from "@/app/components/SamePageNavigation";
export const metadata = { title: "Bundestag" };
export default function Page() { return <><p className="shell"><CrossPageQueryLink href="/wirkungsakten?ebene=bund&organ=bundestag">Bundestagsakten im gemeinsamen Register</CrossPageQueryLink></p><SectionPage params={Promise.resolve({ section: "bundestag" })} /></>; }

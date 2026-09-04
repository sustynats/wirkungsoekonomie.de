import SectionPage from "@/app/[section]/page";
import { HomeTrust } from "@/app/components/HomeContentSections";
import { PortalStandExplanation } from "@/app/components/PortalStandExplanation";
export const metadata = { title: "Über uns & Grenzen" };
export default function Page() { return <><SectionPage params={Promise.resolve({ section: "transparenz" })} /><HomeTrust /><PortalStandExplanation /></>; }

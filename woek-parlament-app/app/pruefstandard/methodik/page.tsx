import SectionPage from "@/app/[section]/page";
import { HomeMethodology } from "@/app/components/HomeContentSections";
export const metadata = { title: "So prüfen wir" };
export default function Page() { return <><SectionPage params={Promise.resolve({ section: "methodik" })} /><HomeMethodology /></>; }

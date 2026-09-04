import SectionPage from "@/app/[section]/page";
import { HomeRadarScope } from "@/app/components/HomeContentSections";
export const metadata = { title: "Parlamentsradar" };
export default function Page() { return <><SectionPage params={Promise.resolve({ section: "bevorstehend" })} /><HomeRadarScope /></>; }

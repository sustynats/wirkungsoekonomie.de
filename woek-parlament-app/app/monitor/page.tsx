import SectionPage from "@/app/[section]/page";
import { HomeMonitorContext } from "@/app/components/HomeContentSections";
export const metadata = { title: "Wirkungsmonitor" };
export default function Page() { return <><SectionPage params={Promise.resolve({ section: "monitor" })} /><HomeMonitorContext /></>; }

import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Wirkungsmonitor" };
export default function Page() { return <SectionPage params={Promise.resolve({ section: "monitor" })} />; }

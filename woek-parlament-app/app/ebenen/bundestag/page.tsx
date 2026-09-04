import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Bundestag" };
export default function Page() { return <SectionPage params={Promise.resolve({ section: "bundestag" })} />; }

import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Wirkungsgedächtnis" };
export default function Page() { return <SectionPage params={Promise.resolve({ section: "historie" })} />; }

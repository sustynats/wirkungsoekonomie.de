import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Über uns & Grenzen" };
export default function Page() { return <SectionPage params={Promise.resolve({ section: "transparenz" })} />; }

import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Parlamentsradar" };
export default function Page() { return <SectionPage params={Promise.resolve({ section: "bevorstehend" })} />; }

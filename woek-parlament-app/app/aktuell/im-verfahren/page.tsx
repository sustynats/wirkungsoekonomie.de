import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Im Verfahren" };
export default function Page() { return <SectionPage params={Promise.resolve({ section: "im-verfahren" })} />; }

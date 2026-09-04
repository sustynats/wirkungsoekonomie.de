import SectionPage from "@/app/[section]/page";
export const metadata = { title: "Referenzrahmen" };
/** Preserve the complete explanation, including the long-standing fragment. */
export default function Page() { return <SectionPage params={Promise.resolve({ section: "transparenz" })} />; }

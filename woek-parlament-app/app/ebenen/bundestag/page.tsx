import SectionPage from "@/app/[section]/page";
import { InstitutionRegisterLink } from "@/app/components/InstitutionRegisterLink";
export const metadata = { title: "Bundestag" };
export default function Page() { return <><p className="shell"><InstitutionRegisterLink level="bund" organ="bundestag">Bundestagsakten im gemeinsamen Register</InstitutionRegisterLink></p><SectionPage params={Promise.resolve({ section: "bundestag" })} /></>; }

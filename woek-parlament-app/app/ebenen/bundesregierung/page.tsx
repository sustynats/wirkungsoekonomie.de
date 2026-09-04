// P1: render the existing content; do not duplicate or reinterpret its data.
import GovernmentLandingPage from "@/app/regierung/page";
import { InstitutionRegisterLink } from "@/app/components/InstitutionRegisterLink";
export default function Page() { return <><p className="shell"><InstitutionRegisterLink level="bund" organ="bundesregierung">Regierungsanalysen im gemeinsamen Register</InstitutionRegisterLink></p><GovernmentLandingPage /></>; }
export const metadata = { title: "Wirkungsportal" };

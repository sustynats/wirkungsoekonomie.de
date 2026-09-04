// P1: render the existing content; do not duplicate or reinterpret its data.
import GovernmentLandingPage from "@/app/regierung/page";
import { InstitutionRegisterLink } from "@/app/components/InstitutionRegisterLink";
import { HomeGovernmentContext } from "@/app/components/HomeContentSections";
export default function Page() { return <><p className="shell"><InstitutionRegisterLink level="bund" organ="bundesregierung">Regierungsanalysen im gemeinsamen Register</InstitutionRegisterLink></p><GovernmentLandingPage /><HomeGovernmentContext /></>; }
export const metadata = { title: "Wirkungsportal" };

// P1: render the existing content; do not duplicate or reinterpret its data.
import EuropeanUnionPage from "@/app/eu/page";
import { InstitutionRegisterLink } from "@/app/components/InstitutionRegisterLink";
export { metadata } from "@/app/eu/page";
export default function Page() { return <><p className="shell"><InstitutionRegisterLink level="eu" organ="eu">EU-Wirkungsfälle im gemeinsamen Register</InstitutionRegisterLink></p><EuropeanUnionPage /></>; }

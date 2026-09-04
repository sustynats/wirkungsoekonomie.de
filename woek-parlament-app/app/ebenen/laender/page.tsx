// P1: render the existing content; do not duplicate or reinterpret its data.
import StatesPage from "@/app/laender/page";
import { InstitutionRegisterLink } from "@/app/components/InstitutionRegisterLink";
export { metadata } from "@/app/laender/page";
export default function Page() { return <><p className="shell"><InstitutionRegisterLink level="land">Landesbezogene Akten im gemeinsamen Register</InstitutionRegisterLink></p><StatesPage /></>; }

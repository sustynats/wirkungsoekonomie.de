// P1: render the existing content; do not duplicate or reinterpret its data.
import StatesPage from "@/app/laender/page";
import { HomeStatesContext } from "@/app/components/HomeContentSections";
export { metadata } from "@/app/laender/page";
export default function Page() { return <><StatesPage /><HomeStatesContext /></>; }

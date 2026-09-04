import { RealityCheckCandidates } from "@/app/components/RealityCheckCandidates";
export const metadata = { title: "Reality-Checks" };
export default function Page() { return <div className="shell content-page"><header className="page-intro"><h1>Reality-Checks</h1><p className="lead">Fachlich freigegebene Prüfanlässe aus dem Observatorium – keine automatisch festgestellte Wirkung.</p></header><RealityCheckCandidates /></div>; }

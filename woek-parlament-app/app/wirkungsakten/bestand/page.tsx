import SectionPage from "@/app/[section]/page";
import ImpactCasesPage from "@/app/wirkungsfaelle/page";
import FachanalysenPage from "@/app/fachanalysen/page";
import GovernmentImpactCasesPage from "@/app/regierung/wirkungsanalysen/page";
import GovernmentLayout from "@/app/regierung/layout";
import EuImpactCasesPage from "@/app/eu/wirkungsfaelle/page";
import { Suspense } from "react";
import { RegisterContextClient, RegisterContextFrame, type RegisterContextView } from "@/app/components/RegisterContextClient";

export const metadata = { title: "Bestandskontext der Wirkungsakten", robots: { index: false, follow: true } };

/** Every earlier collection explanation and full preview remains reachable here. */
export default function RegisterContextPage() {
  const views: RegisterContextView[] = [
    { key: "wirkungsfaelle", content: <ImpactCasesPage /> },
    { key: "entscheidungen", content: <SectionPage params={Promise.resolve({ section: "entscheidungen" })} /> },
    { key: "fachanalysen", content: <FachanalysenPage /> },
    { key: "regierung", content: <GovernmentLayout><GovernmentImpactCasesPage /></GovernmentLayout> },
    { key: "eu", content: <EuImpactCasesPage /> },
  ];
  return <Suspense fallback={<RegisterContextFrame selected="wirkungsfaelle" views={views} />}>
    <RegisterContextClient views={views} />
  </Suspense>;
}

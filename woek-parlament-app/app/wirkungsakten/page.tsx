import Link from "next/link";
import { Suspense } from "react";
import { ImpactRegisterClient, ImpactRegisterView } from "@/app/components/ImpactRegisterClient";
import { getPublicRegister } from "@/lib/register";
import { governmentPublicationGatesPass } from "@/lib/government/publication-gates";
import { PortalSectionHeader } from "@/app/components/PortalLanding";

export const metadata = { title: "Wirkungsakten", description: "Gemeinsames Register veröffentlichter Vorgänge und Analysen. Ebene, Organ, Wirkungsfeld, Richtung, Evidenz und Reifegrad getrennt filtern." };

export default function RegisterPage() {
  const objects = getPublicRegister();
  const governmentPublicationOpen = governmentPublicationGatesPass();
  return <div className="shell content-page impact-register">
    <PortalSectionHeader eyebrow="Ein Register · getrennte Aussagen" title="Wirkungsakten" lead="Veröffentlichte Vorgänge, Wirkungsfälle, Fach- und Missionsakten gemeinsam finden – mit ihren jeweiligen Quellen, Aussagegrenzen und offenen Fragen." />
    <Suspense fallback={<ImpactRegisterView objects={objects} governmentPublicationOpen={governmentPublicationOpen} filters={{}} />}>
      <ImpactRegisterClient objects={objects} governmentPublicationOpen={governmentPublicationOpen} />
    </Suspense>
    <p><Link href="/wirkungsakten/bestand">Vollständige Erläuterungen und Kurzfassungen der bisherigen Bestände öffnen</Link></p>
  </div>;
}

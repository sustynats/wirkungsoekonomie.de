import Link from "next/link";
import { PortalSectionHeader } from "@/app/components/PortalLanding";

export function PendingGovernmentArea({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="section shell government-pending-page"><PortalSectionHeader eyebrow={eyebrow} title={title} lead={children} /><div className="open-state"><span aria-hidden="true">?</span><strong>Datenaufbau transparent</strong></div><p>Dieser Bereich zeigt keinen leeren grünen Score und keine vermeintliche Nullwirkung. Fehlende Daten bleiben als Datenlücke sichtbar.</p><div className="government-link-row"><Link className="button button-primary" href="/regierung/transparenz">Datenabdeckung prüfen</Link><Link className="button button-secondary" href="/regierung/akte">Faktenakten ansehen</Link></div></section>;
}

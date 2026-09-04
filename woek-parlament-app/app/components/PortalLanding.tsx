import Link from "next/link";
import type { ReactNode } from "react";
import { canonicalPortalHref, type NavigationItem } from "@/lib/navigation";

export function PortalSectionHeader({ title, lead, eyebrow }: { title: ReactNode; lead: ReactNode; eyebrow?: string }) {
  return <header className="page-intro" data-portal-section-header>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="lead">{lead}</p></header>;
}

/** One server-rendered structure. Wayfinding is supplied once by RootLayout;
 * the visual slot accepts only existing, explicitly sourced projections. */
export function PortalLanding({ title, lead, items, visual, children }: { title: string; lead: string; items: NavigationItem[]; visual?: ReactNode; children?: ReactNode }) {
  return <div className="shell content-page portal-landing" data-portal-landing>
    <PortalSectionHeader title={title} lead={lead} />
    {visual && <div className="portal-area-visual" data-portal-area-visual>{visual}</div>}
    <ul className="portal-entry-list">{items.map((item) => <li key={item.href}><Link href={canonicalPortalHref(item.href)}>{item.label} <span aria-hidden="true">→</span></Link></li>)}</ul>
    {children}
  </div>;
}

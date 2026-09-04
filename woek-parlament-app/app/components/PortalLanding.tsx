import Link from "next/link";
import { canonicalPortalHref, type NavigationItem } from "@/lib/navigation";

/** Structural entry point; data visualisation and short content follow in P4/P6. */
export function PortalLanding({ title, lead, items }: { title: string; lead: string; items: NavigationItem[] }) {
  return <div className="shell content-page">
    <header className="page-intro"><h1>{title}</h1><p className="lead">{lead}</p></header>
    <ul className="portal-entry-list">{items.map((item) => <li key={item.href}><Link href={canonicalPortalHref(item.href)}>{item.label} <span aria-hidden="true">→</span></Link></li>)}</ul>
  </div>;
}

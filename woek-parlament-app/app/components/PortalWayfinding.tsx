"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canonicalPortalHref, portalBreadcrumbs, sectionNavigation } from "@/lib/navigation";

export function PortalWayfinding() {
  const pathname = usePathname();
  const crumbs = portalBreadcrumbs(pathname);
  const links = sectionNavigation(pathname);
  return <div className="shell portal-wayfinding">
    <nav aria-label="Brotkrumen"><ol className="portal-breadcrumbs">
      {crumbs.map((item, index) => <li key={item.href}>{index > 0 && <span aria-hidden="true">›</span>}{index === crumbs.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={canonicalPortalHref(item.href)}>{item.label}</Link>}</li>)}
    </ol></nav>
    {links.length > 0 && <nav className="portal-subnav" aria-label="Bereichsnavigation">{links.map((item) => <Link key={item.href} href={canonicalPortalHref(item.href)} aria-current={pathname === item.href ? "page" : pathname.startsWith(`${item.href}/`) ? "location" : undefined}>{item.label}</Link>)}</nav>}
  </div>;
}

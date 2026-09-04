"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { activePortalBranch, portalNavigation } from "@/lib/navigation";

export function PortalNav() {
  const pathname = usePathname();
  const active = activePortalBranch(pathname);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  function close() { dialog.current?.close(); }
  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'));
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  return <>
    <nav className="portal-primary portal-primary--desktop" aria-label="Hauptnavigation">
      {portalNavigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : active?.href === item.href ? "location" : undefined}>{item.label}</Link>)}
    </nav>
    <div className="portal-mobile">
      <button type="button" className="portal-menu-button" aria-expanded={open} aria-controls="portal-menu" aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); setOpen(true); }}>Bereiche öffnen <span aria-hidden="true">☰</span></button>
      <dialog ref={dialog} id="portal-menu" className="portal-drawer" aria-labelledby="portal-menu-title" onClose={() => setOpen(false)} onKeyDown={containFocus}>
        <div className="portal-drawer-content">
          <div className="portal-drawer-heading"><h2 id="portal-menu-title">Bereiche</h2><button type="button" onClick={close} aria-label="Menü schließen">Schließen <span aria-hidden="true">×</span></button></div>
          <nav aria-label="Hauptnavigation mobil">
            {portalNavigation.map((item) => <div key={item.href} className="portal-drawer-group">
              <Link href={item.href} onClick={close} aria-current={pathname === item.href ? "page" : active?.href === item.href ? "location" : undefined}>{item.label}</Link>
              {item.children && <ul>{item.children.map((child) => <li key={child.href}><Link href={child.href} onClick={close} aria-current={pathname === child.href ? "page" : undefined}>{child.label}</Link></li>)}</ul>}
            </div>)}
          </nav>
        </div>
      </dialog>
    </div>
  </>;
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  ["Anstehend", "/bevorstehend"],
  ["Entscheidungen", "/entscheidungen"],
  ["Historie", "/historie"],
  ["Mandat", "/mandat-und-umsetzung"],
  ["Monitor", "/monitor"],
  ["Dialog", "/dialog"],
  ["Methodik & Transparenz", "/methodik"]
] as const;

export function PortalNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const mode = params.get("modus") === "parlament" ? "parlament" : "alle";
  const modeHref = mode === "alle" ? `${pathname}?modus=parlament` : pathname;
  return <>
    <nav className="portal-nav" aria-label="Hauptnavigation">
      {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href || (href === "/entscheidungen" && pathname.startsWith("/entscheidungen/")) ? "page" : undefined}>{label}</Link>)}
    </nav>
    <Link className="mode-switch" href={modeHref} aria-pressed={mode === "parlament"}>
      <span aria-hidden="true">{mode === "parlament" ? "Für Parlament" : "Für alle"}</span><span className="sr-only">Darstellung wechseln, aktuell {mode === "parlament" ? "für Parlament" : "für alle"}</span>
    </Link>
  </>;
}

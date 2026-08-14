import Link from "next/link";

const links = [
  ["Radar", "/bevorstehend"],
  ["Wirkungschecks", "/entscheidungen"],
  ["Monitor", "/monitor"],
  ["Dialog", "/dialog"],
  ["Methodik", "/methodik"]
] as const;

export function PortalNav() {
  return <nav className="portal-nav" aria-label="Hauptnavigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>;
}

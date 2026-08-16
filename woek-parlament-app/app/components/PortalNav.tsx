import Link from "next/link";

const links = [
  ["Parlamentsradar", "/bevorstehend"],
  ["Entscheidungen", "/entscheidungen"],
  ["Historie", "/historie"],
  ["Monitor", "/monitor"],
  ["Länder", "/laender"],
  ["Mandat & Praxis", "/mandat-und-praxis"],
  ["Fachanalysen", "/fachanalysen"],
  ["Abstimmungsbilanz", "/abgeordnete"],
  ["Quellen", "/quellen"],
  ["Über das Portal", "/transparenz"],
  ["Methodik", "/methodik"]
] as const;

export function PortalNav() {
  return <>
    <nav className="portal-nav portal-nav--desktop" aria-label="Hauptnavigation">
      {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
    <nav className="portal-nav--mobile" aria-label="Hauptnavigation mobil">
      <details>
        <summary>Bereiche öffnen</summary>
        <div>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      </details>
    </nav>
  </>;
}

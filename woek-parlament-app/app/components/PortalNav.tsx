import Link from "next/link";

const links = [
  ["Übersicht", "/"],
  ["Wirkungsfälle", "/wirkungsfaelle"],
  ["Bundesregierung", "/regierung"],
  ["Bundestag", "/entscheidungen"],
  ["Bundesländer", "/laender"],
  ["Europäische Union", "/eu"],
  ["Methodik", "/methodik"],
  ["Transparenz", "/transparenz"]
] as const;

const moreLinks = [
  ["Wirkungsobservatorium", "/wirkungsobservatorium"],
  ["Länder", "/laender"],
  ["Mandat & Praxis", "/mandat-und-praxis"],
  ["Fachanalysen", "/fachanalysen"],
  ["Abstimmungsbilanz", "/abgeordnete"],
  ["Quellenarchiv", "/quellen"]
] as const;

export function PortalNav() {
  const allLinks = [...links, ...moreLinks];
  return <>
    <nav className="portal-nav portal-nav--desktop" aria-label="Hauptnavigation">
      {allLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
    <nav className="portal-nav--mobile" aria-label="Hauptnavigation mobil">
      <details>
        <summary>Bereiche öffnen</summary>
        <div>{allLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      </details>
    </nav>
  </>;
}

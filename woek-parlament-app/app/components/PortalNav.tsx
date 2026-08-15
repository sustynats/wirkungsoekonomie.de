import Link from "next/link";

const links = [
  ["Bevorstehend", "/bevorstehend"],
  ["Entscheidungen", "/entscheidungen"],
  ["Historie", "/historie"],
  ["Monitor", "/monitor"],
  ["Über das Portal", "/transparenz"],
  ["Methodik", "/methodik"]
] as const;

const moreLinks = [
  ["Länder", "/laender"],
  ["Mandat & Praxis", "/mandat-und-praxis"],
  ["Fachanalysen", "/fachanalysen"],
  ["Abstimmungsbilanz", "/abgeordnete"],
  ["Quellenarchiv", "/quellen"]
] as const;

export function PortalNav() {
  return <>
    <nav className="portal-nav portal-nav--desktop" aria-label="Hauptnavigation">
      {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      <details className="portal-more-menu">
        <summary>Mehr<span className="sr-only"> Bereiche öffnen</span></summary>
        <div>{moreLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      </details>
    </nav>
    <nav className="portal-nav--mobile" aria-label="Hauptnavigation mobil">
      <details>
        <summary>Bereiche öffnen</summary>
        <div>{[...links, ...moreLinks].map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      </details>
    </nav>
  </>;
}

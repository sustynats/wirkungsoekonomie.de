import Link from "next/link";

const links = [
  ["Überblick", "/regierung"],
  ["Regierungsakte", "/regierung/akte"],
  ["Wirkungsanalysen", "/regierung/wirkungsanalysen"],
  ["Kabinett", "/regierung/kabinett"],
  ["Ministerien", "/regierung/ministerien"],
  ["Mandat & Praxis", "/regierung/mandat-und-praxis"],
  ["Methodik", "/regierung/methodik"],
  ["Transparenz", "/regierung/transparenz"],
] as const;

export function GovernmentSubnav() {
  return (
    <nav className="government-subnav" aria-label="Regierungshandeln und Wirkung">
      {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
  );
}

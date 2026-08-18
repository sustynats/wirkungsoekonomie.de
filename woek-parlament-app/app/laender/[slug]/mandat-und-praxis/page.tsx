import { notFound } from "next/navigation";
import { stateJurisdictionBySlug } from "@/lib/autopilot/registry";

export default async function StateMandatePage({ params }: { params: Promise<{ slug: string }> }) {
  const state = stateJurisdictionBySlug((await params).slug);
  if (!state) notFound();
  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Zusatzperspektive</p><h1>Vom Wahlprogramm zur politischen Praxis.</h1><p className="lead">Diese Seite verbindet Wahlprogramm, Regierungs- oder Koalitionsvereinbarung, Regierungshandlung und Umsetzung. Umsetzungstreue ist dabei keine Wirkung und wird nicht als Erfolgsquote ausgegeben.</p></header><div className="notice"><strong>Noch keine freigegebene Mandatskette.</strong><p>Offene Beziehungen bleiben offen. Ähnliche Formulierungen werden nicht automatisch als erfülltes Versprechen zusammengeführt.</p></div></main>;
}

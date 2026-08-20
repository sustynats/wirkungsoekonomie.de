import { notFound } from "next/navigation";
import { stateJurisdictionBySlug } from "@/lib/autopilot/registry";

export default async function StateGovernmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const state = stateJurisdictionBySlug((await params).slug);
  if (!state) notFound();
  return <div className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Landesregierung</p><h1>Regierungshandeln und mögliche Zustandsveränderungen.</h1><p className="lead">Ministerratsbeschlüsse, Ressorthandeln, Programme, Förderung, Haushalt, Vollzug und Evaluation werden als getrennte amtliche Stationen erfasst und nur bei fachlicher Kohärenz mit einem WÖk-Wirkungsfall verbunden.</p></header><div className="open-state"><span aria-hidden="true">!</span><div><strong>Quellenanbindung: {state.source_status}</strong><p>Solange der definierte amtliche Quellenraum nicht vollständig und reproduzierbar erschlossen ist, wird keine Vollständigkeit behauptet.</p></div></div></div>;
}

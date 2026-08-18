import { notFound } from "next/navigation";
import { lifecycleLabel, stateJurisdictionBySlug } from "@/lib/autopilot/registry";

export default async function StateElectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const state = stateJurisdictionBySlug((await params).slug);
  if (!state) notFound();
  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Wahlzyklus</p><h1>Programme, Zuständigkeiten und Wirkungspotenziale.</h1><p className="lead">Originalprogramme werden versioniert archiviert. CodeX extrahiert Sachverhalte und Zuständigkeitshinweise, aber keine Wirkungsrichtung und keine Parteigesamtnote.</p></header><div className="notice"><strong>{lifecycleLabel(state.lifecycle_state)}</strong><p>{state.next_election_date ? `Amtlicher Wahltermin: ${new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${state.next_election_date}T12:00:00`))}.` : "Ein amtlicher Wahltermin ist im aktuellen Register noch nicht bestätigt."}</p></div></main>;
}

import { notFound } from "next/navigation";
import { formatElectionDate, lifecycleLabel, stateJurisdictionBySlug } from "@/lib/autopilot/registry";

export default async function StateElectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const state = stateJurisdictionBySlug((await params).slug);
  if (!state) notFound();
  const electionDate = formatElectionDate(state.next_election_date);
  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">{state.name} · Wahlzyklus</p><h1>Programme, Zuständigkeiten und Wirkungspotenziale.</h1><p className="lead">Originalprogramme werden versioniert archiviert. CodeX extrahiert Sachverhalte und Zuständigkeitshinweise, aber keine Wirkungsrichtung und keine Parteigesamtnote.</p></header><div className="notice"><strong>{lifecycleLabel(state.election_cycle_state)}</strong><p>{electionDate ? `${state.date_precision === "SEASON_ONLY" ? "Amtliches Wahlzeitfenster" : "Amtlicher Wahltermin"}: ${electionDate}.` : "Ein amtlicher Wahltermin ist im aktuellen Register noch nicht bestätigt."}</p></div></main>;
}

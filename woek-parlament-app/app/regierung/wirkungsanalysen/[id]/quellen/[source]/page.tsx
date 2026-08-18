import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { impactCaseById } from "@/lib/government/impact-cases";

const roleLabels = {
  official: { title: "Amtliche Faktenquelle", purpose: "Diese Quelle belegt den amtlichen Gegenstand, seinen Stand oder eine dokumentierte Entscheidung. Sie ist nicht automatisch ein Nachweis der Wirkung." },
  mechanism: { title: "Quelle zum Wirkmechanismus", purpose: "Diese Quelle trägt die fachliche Herleitung eines möglichen Wirkmechanismus. Sie ersetzt weder die amtliche Faktenquelle noch eine spätere Kausalprüfung." },
  "post-decision": { title: "Quelle nach der Entscheidung", purpose: "Diese Quelle dokumentiert eine spätere Beobachtung. Beobachtung und kausale Zurechnung bleiben getrennt." },
} as const;

function resolveSource(caseId: string, token: string) {
  const record = impactCaseById(caseId);
  if (!record) return null;
  const match = token.match(/^(official|mechanism|post-decision)-(\d+)$/);
  if (!match) return null;
  const role = match[1] as keyof typeof roleLabels;
  const index = Number(match[2]);
  const sources = role === "official" ? record.official_fact_sources : role === "mechanism" ? record.mechanism_sources : record.post_decision_sources;
  const url = sources[index];
  if (!url) return null;
  return { record, role, url, ...roleLabels[role] };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; source: string }> }): Promise<Metadata> {
  const { id, source } = await params;
  const resolved = resolveSource(decodeURIComponent(id), source);
  return { title: resolved ? `${resolved.title}: ${resolved.record.title}` : "Quelle nicht gefunden" };
}

export default async function GovernmentImpactSourcePage({ params }: { params: Promise<{ id: string; source: string }> }) {
  const { id, source } = await params;
  const resolved = resolveSource(decodeURIComponent(id), source);
  if (!resolved) notFound();
  let host = "Amtliche oder fachliche Quelle";
  try { host = new URL(resolved.url).hostname.replace(/^www\./, ""); } catch { /* URL was schema-validated before publication. */ }
  return <main className="shell content-page source-detail-page">
    <header className="source-detail-header"><div><p className="eyebrow">Quellensteckbrief · Regierungs-Wirkungsanalyse</p><h1>{resolved.title}</h1><p className="lead">{resolved.record.title}</p></div></header>
    <div className="source-detail-grid">
      <section><h2>Welche Funktion hat diese Quelle?</h2><p>{resolved.purpose}</p><dl><div><dt>Herausgebende Stelle oder Domain</dt><dd>{host}</dd></div><div><dt>Quellenfunktion</dt><dd>{resolved.title}</dd></div><div><dt>Stand der Analyse</dt><dd>{resolved.record.analysis_as_of}</dd></div></dl></section>
      <aside className="notice"><strong>Originalquelle</strong><p>Der externe Link öffnet die bei der Fachprüfung dokumentierte Fassung. Änderungen am Quellort werden durch die Versionshistorie der Analyse nicht still überschrieben.</p><a className="button button-secondary" href={resolved.url} rel="noreferrer">Originalquelle öffnen</a></aside>
    </div>
    <p className="page-return"><Link href={`/regierung/wirkungsanalysen/${encodeURIComponent(resolved.record.impact_case_id)}`}>← Zur Wirkungsanalyse</Link></p>
  </main>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GovernmentImpactCase } from "@/app/components/government/GovernmentImpactCase";
import { historyClassificationLabels, impactCaseById, impactCaseVersions } from "@/lib/government/impact-cases";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const record = impactCaseById(decodeURIComponent(id));
  return { title: record?.title ?? "Regierungs-Wirkungsanalyse" };
}

export default async function GovernmentImpactCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = impactCaseById(decodeURIComponent(id));
  if (!record) notFound();
  const versions = impactCaseVersions(record.impact_case_id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AnalysisNewsArticle",
    headline: record.title,
    author: { "@type": "Organization", name: "Institut für Wirkungsökonomie" },
    dateModified: record.analysis_as_of,
    isAccessibleForFree: true,
  };
  return (
    <main className="section shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <GovernmentImpactCase record={record} />
      <section className="government-version-history" aria-labelledby="version-history-title">
        <h2 id="version-history-title">Versions- und Prüfverlauf</h2>
        <p>Frühere Ex-ante-Analysen bleiben erhalten. Spätere Beobachtungen überschreiben sie nicht.</p>
        {versions.length ? <ol>{versions.map((version) => <li key={`${version.analysis_version}-${version.source_hash}`}><strong>Fassung {version.analysis_version}</strong><span>{historyClassificationLabels[version.classification] ?? "fachlich dokumentierte Änderung"} · übernommen {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.ingested_at))}</span></li>)}</ol> : <p><strong>Fassung {record.analysis_version}</strong> · Fachrelease {record.source_release.markdown_file} · Analysestand {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${record.analysis_as_of}T12:00:00Z`))}</p>}
      </section>
    </main>
  );
}

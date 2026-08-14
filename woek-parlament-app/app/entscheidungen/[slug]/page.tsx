import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssessmentExplainer } from "@/app/components/AssessmentExplainer";
import { getCase, formatDate, materialityLabel } from "@/lib/cases";

export function generateStaticParams() {
  return ["musterfall-fassungswechsel", "radar-befuellung-ausstehend", "historie-redaktioneller-auftakt"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  return item ? { title: item.title, description: item.summary } : {};
}

export default async function DecisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) notFound();
  return (
    <div className="shell decision-page">
      <nav className="breadcrumb" aria-label="Pfad"><Link href="/entscheidungen">Wirkungschecks</Link><span aria-hidden="true">/</span><span>{item.kind.replaceAll("_", " ")}</span></nav>
      <header className="decision-header">
        <div><p className="eyebrow">{item.editorialStatus === "DEMONSTRATOR" ? "Synthetischer Demonstrator" : "Redaktionelle Befüllung erforderlich"}</p><h1>{item.title}</h1><p className="lead">{item.summary}</p></div>
        <aside className="decision-status"><p>Aktueller Stand</p><strong>{item.parliamentaryStatus}</strong><dl><div><dt>Wirkungsrelevanz</dt><dd>{materialityLabel(item.materiality)}</dd></div><div><dt>Letzte Aktualisierung</dt><dd>{formatDate(item.lastUpdated)}</dd></div></dl></aside>
      </header>

      <section className="sixty-second" aria-labelledby="sixty-second-title"><div><p className="eyebrow">60 Sekunden</p><h2 id="sixty-second-title">Worum geht es?</h2></div><dl><div><dt>Was wird entschieden?</dt><dd>{item.whatIsDecided}</dd></div><div><dt>Was ist der Analyse-Status?</dt><dd>{item.analysisStatus}</dd></div><div><dt>Was soll erreicht werden?</dt><dd>{item.intendedGoal}</dd></div></dl></section>

      {item.publicAssessment ? <AssessmentExplainer assessment={item.publicAssessment} /> : <section className="decision-section assessment-pending"><p className="eyebrow">WÖk-Einordnung</p><h2>Noch keine fachliche Bewertung veröffentlicht</h2><p>Eine reale Einordnung erscheint erst, wenn Entscheidungsfassung, Quellen, Wirkpfade, Berechnungen und Unsicherheiten geprüft sind. Das Portal unterscheidet dann sichtbar zwischen Ergebnis, Begründung und dem vollständigen Rechenweg.</p></section>}

      <div className="decision-grid">
        <section className="decision-section"><p className="eyebrow">Wirkpfad</p><h2>Welche Veränderungen wären zu prüfen?</h2><ol className="impact-path">{item.impactPath.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section>
        <aside className="decision-section side-card"><p className="eyebrow">Betroffene</p><h2>Wer ist im Blick?</h2>{item.affectedGroups.length ? <ul>{item.affectedGroups.map((group) => <li key={group}>{group}</li>)}</ul> : <p>CONTENT_REQUIRED – erst nach einem Fall- und Quellenreview ergänzen.</p>}</aside>
      </div>

      <section className="decision-section question-section"><p className="eyebrow">Prüffragen</p><h2>Was muss vor einer Bewertung geklärt werden?</h2><ol>{item.questions.map((question) => <li key={question}>{question}</li>)}</ol></section>

      <section className="decision-section"><p className="eyebrow">Fassung und Änderung</p><h2>Welche Version wurde betrachtet?</h2><p>{item.versionNote}</p><div className="notice"><strong>Kein stiller Versionswechsel.</strong> Ein echter Dokumentvergleich speichert Originalquelle, Hash, Abrufzeit und den redaktionell geprüften Einfluss auf die Wirkungsanalyse.</div></section>

      <section className="decision-section"><p className="eyebrow">Quellen und Grenzen</p><h2>Worauf stützt sich diese Seite?</h2><div className="source-list">{item.sources.map((source) => <article key={source.url}><h3><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></h3><p>{source.publisher} · abgerufen {formatDate(source.retrievedAt)}</p><p>{source.note}</p></article>)}</div></section>

      <section className="decision-section recommendation-block"><p className="eyebrow">WÖk-Fachvotum</p><h2>Noch nicht freigegeben</h2><p>Ein Fachvotum wird nur nach Fallprüfung, Evidenzreview, Gegenanalyse und Vier-Augen-Freigabe veröffentlicht. Diese Seite ersetzt kein Rechtsgutachten und keine parlamentarische Entscheidung.</p></section>
      <p className="page-return"><Link href="/entscheidungen">← Alle Wirkungschecks</Link></p>
    </div>
  );
}

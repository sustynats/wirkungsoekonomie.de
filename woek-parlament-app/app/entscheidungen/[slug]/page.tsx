import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssessmentExplainer } from "@/app/components/AssessmentExplainer";
import { BookmarkLink } from "@/app/components/BookmarkLink";
import { GlossaryBasics } from "@/app/components/GlossaryBasics";
import { NormativeImpactTiles } from "@/app/components/NormativeImpactTiles";
import { WorkingActExplainer } from "@/app/components/WorkingActExplainer";
import { CaseTypeMark } from "@/app/components/CaseTypeMark";
import { FullReviewRecord } from "@/app/components/FullReviewRecord";
import { DecisionReadinessGate } from "@/app/components/DecisionReadinessGate";
import { getCase, formatDate, materialityLabel } from "@/lib/cases";
import { caseKindLabel, humanizeSystemValue, verificationLabel } from "@/lib/presentation/labels";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  return item ? { title: item.plainTitle, description: item.summary } : {};
}

type DecisionView = "ueberblick" | "wirkprofil" | "wirkpfade" | "berechnungen" | "normen" | "fachakte" | "quellen";

const decisionViews: Array<{ id: DecisionView; label: string }> = [
  { id: "ueberblick", label: "Überblick" },
  { id: "wirkprofil", label: "Wirkprofil" },
  { id: "wirkpfade", label: "Wirkpfade" },
  { id: "berechnungen", label: "Rechenweg" },
  { id: "normen", label: "SDG & Schutzgüter" },
  { id: "fachakte", label: "Vollständige Fachakte" },
  { id: "quellen", label: "Quellen" }
];

function decisionFocus(item: NonNullable<ReturnType<typeof getCase>>) {
  const firstPath = item.publicWorkingAct?.reviewDetail?.impactPaths[0]?.hypothesis ?? item.impactPath[0];
  return firstPath || item.intendedGoal;
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function firstStatus(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const found = value.find((entry) => typeof entry === "string" && entry.trim());
    if (typeof found === "string") return found;
  }
  return fallback;
}

function reviewStatuses(item: NonNullable<ReturnType<typeof getCase>>) {
  const result = item.publicWorkingAct?.fullReview?.result;
  const exAnte = record(record(result).ex_ante);
  const exPost = record(record(result).ex_post);
  const sourceCompleteness = record(record(result).source_completeness);
  return {
    maturity: humanizeSystemValue(item.publicWorkingAct?.maturity ?? item.analysisStatus),
    decisionBasis: firstStatus(record(sourceCompleteness.decision_basis).status, "OPEN"),
    evidence: firstStatus(exAnte.evidence_status ?? exAnte.evidence_boundary ?? sourceCompleteness.status, "Evidenzgrenze in Fachakte ausgewiesen"),
    attribution: firstStatus(exPost.attribution_status ?? exPost.causal_evidence_status ?? exPost.attribution, "Keine kausale Aussage ohne Gegenfaktum")
  };
}

export default async function DecisionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ansicht?: string }> }) {
  const { slug } = await params;
  const { ansicht } = await searchParams;
  const item = getCase(slug);
  if (!item) notFound();
  const activeView: DecisionView = decisionViews.some((view) => view.id === ansicht) ? ansicht as DecisionView : "ueberblick";
  const workingActView = activeView === "wirkprofil" || activeView === "wirkpfade" || activeView === "berechnungen" ? activeView : "ueberblick";
  const normativeMapping = item.publicAssessment?.normativeMapping ?? item.publicWorkingAct?.normativeMapping;
  const statuses = reviewStatuses(item);
  return (
    <div className="shell decision-page">
      <nav className="breadcrumb" aria-label="Pfad"><Link href="/entscheidungen">Wirkungschecks</Link><span aria-hidden="true">/</span><span>{caseKindLabel(item.kind)}</span></nav>
      <header className="decision-header">
        <div><CaseTypeMark kind={item.kind} maturity={item.publicWorkingAct?.maturity} /><h1>{item.plainTitle}</h1>{item.title !== item.plainTitle && <p className="official-title"><strong>Amtlicher Titel:</strong> {item.title}</p>}<p className="lead">{item.summary}</p><BookmarkLink title={item.plainTitle} path={`/entscheidungen/${item.slug}`} /></div>
        <aside className="decision-status"><p>Status dieser Wirkungsakte</p><strong>{humanizeSystemValue(item.parliamentaryStatus)}</strong><dl><div><dt>WÖk-Reifestufe</dt><dd>{statuses.maturity}</dd></div><div><dt>Evidenzstatus</dt><dd>{statuses.evidence}</dd></div><div><dt>Attributionsstatus</dt><dd>{statuses.attribution}</dd></div><div><dt>Prüfrelevanz</dt><dd>{materialityLabel(item.materiality)}</dd></div><div><dt>Quellenstatus</dt><dd>{verificationLabel(item.statusVerification)}</dd></div><div><dt>Letzte Aktualisierung</dt><dd>{formatDate(item.lastUpdated)}</dd></div></dl></aside>
      </header>

      <section className="sixty-second" aria-labelledby="sixty-second-title"><div><p className="eyebrow">60 Sekunden</p><h2 id="sixty-second-title">Worum geht es?</h2></div><dl><div className="sixty-second-summary"><dt>Kurz erklärt</dt><dd>{item.summary}</dd></div><div><dt>Was wird entschieden?</dt><dd>{humanizeSystemValue(item.whatIsDecided)}</dd></div><div><dt>Welche Veränderung steht im Mittelpunkt?</dt><dd>{decisionFocus(item)}</dd></div><div><dt>Stand der WÖk-Analyse</dt><dd>{humanizeSystemValue(item.analysisStatus)}</dd></div></dl></section>

      {activeView === "ueberblick" && <DecisionReadinessGate decisionBasis={statuses.decisionBasis} />}

      <nav className="decision-view-nav" aria-label="Ansichten dieser Wirkungsakte">
        <p><strong>Wirkungsakte</strong><span>60 Sekunden zuerst, Details gezielt öffnen.</span></p>
        <div>{decisionViews.map((view) => <Link key={view.id} href={view.id === "ueberblick" ? `/entscheidungen/${item.slug}` : `/entscheidungen/${item.slug}?ansicht=${view.id}`} aria-current={activeView === view.id ? "page" : undefined}>{view.label}</Link>)}</div>
      </nav>

      {activeView === "normen" && normativeMapping && <NormativeImpactTiles mapping={normativeMapping} />}

      {activeView === "fachakte" && item.publicWorkingAct?.fullReview && <FullReviewRecord review={item.publicWorkingAct.fullReview} />}

      {item.publicAssessment && activeView === "ueberblick" ? <AssessmentExplainer assessment={item.publicAssessment} /> : item.publicWorkingAct && activeView !== "normen" && activeView !== "quellen" && activeView !== "fachakte" ? <WorkingActExplainer workingAct={item.publicWorkingAct} view={workingActView} /> : !item.publicWorkingAct && activeView === "ueberblick" ? <section className="decision-section assessment-pending"><p className="eyebrow">WÖk-Einordnung</p><h2>Noch keine fachliche Bewertung veröffentlicht</h2><p>Eine reale Einordnung erscheint erst, wenn Entscheidungsfassung, Quellen, Wirkpfade, Berechnungen und Unsicherheiten geprüft sind. Das Portal unterscheidet dann sichtbar zwischen Ergebnis, Begründung und dem vollständigen Rechenweg.</p></section> : null}

      {activeView === "ueberblick" && <GlossaryBasics termKeys={item.publicAssessment ? ["wirkung", "wirkungsbewertung", "gegenfaktum", "evidenzgrenze", "zurechnung", "nichtkompensation"] : ["wirkungspotenzial", "wirkungsrisiko", "wirkmechanismus", "wirkpfad", "rueckkopplung"]} />}

      {!item.publicWorkingAct && <div className="decision-grid">
        <section className="decision-section"><p className="eyebrow">Möglicher Weg zur Veränderung</p><h2>Wie könnte aus der Entscheidung eine Veränderung entstehen?</h2><p className="section-intro">Die folgende Darstellung beschreibt mögliche Schritte von der Entscheidung über ihre Umsetzung bis zu einer Veränderung. Fachlich heißt diese begründete Annahme Wirkmechanismus; die Abfolge wird als Wirkpfad dargestellt. Sie ist noch kein Wirkungsnachweis.</p><ol className="impact-path">{item.impactPath.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section>
        <aside className="decision-section side-card"><p className="eyebrow">Betroffene</p><h2>Wer oder was kann betroffen sein?</h2>{item.affectedGroups.length ? <ul>{item.affectedGroups.map((group) => <li key={group}>{group}</li>)}</ul> : <p>Die fachliche Befüllung folgt nach Fall- und Quellenprüfung.</p>}</aside>
      </div>}

      {!item.publicWorkingAct && <section className="decision-section question-section"><p className="eyebrow">Prüffragen</p><h2>Was muss vor einer Bewertung geklärt werden?</h2><ol>{item.questions.map((question) => <li key={question}>{question}</li>)}</ol></section>}

      {activeView === "quellen" && <section className="decision-section"><p className="eyebrow">Fassung und Änderung</p><h2>Welche Version wurde betrachtet?</h2><p>{item.versionNote}</p><details className="notice"><summary><strong>Technische Nachvollziehbarkeit der Fassung</strong></summary><p>Ein Dokumentvergleich hält Originalquelle, Abrufzeit und die nachvollziehbaren Folgen für die WÖk-Analyse fest.</p></details></section>}

      {activeView === "quellen" && <section id="quellen" className="decision-section"><p className="eyebrow">Quellen und Grenzen</p><h2>Worauf stützt sich diese Seite?</h2><p className="section-intro">Jede Quelle wird zuerst im Quellenarchiv eingeordnet – mit Herausgeber, Fassung, zeitlicher Rolle und ihrer Verwendung in diesem Check.</p><div className="source-list">{item.sources.map((source) => <article key={source.url}><h3><Link href={sourceDetailHrefForUrl(source.url)}>{source.title}</Link></h3><p>{source.publisher} · abgerufen {formatDate(source.retrievedAt)}</p><p>{source.note}</p><Link className="text-link" href={sourceDetailHrefForUrl(source.url)}>Quellendetail ansehen →</Link></article>)}</div></section>}

      {!item.publicWorkingAct && <section className="decision-section recommendation-block"><p className="eyebrow">WÖk-Facheinordnung</p><h2>Noch nicht veröffentlicht</h2><p>Eine WÖk-Facheinordnung folgt nur aus einer dokumentierten Fallprüfung, Evidenz, Gegenargumenten und nachvollziehbaren Grenzen. Diese Seite ersetzt kein Rechtsgutachten und keine parlamentarische Entscheidung.</p></section>}
      <p className="page-return"><Link href="/entscheidungen">← Alle Wirkungschecks</Link></p>
    </div>
  );
}

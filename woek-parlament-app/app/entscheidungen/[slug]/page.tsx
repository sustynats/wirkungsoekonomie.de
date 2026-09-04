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
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import { DecisionReadinessGate } from "@/app/components/DecisionReadinessGate";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { ImpactSignature } from "@/app/components/ImpactSignature";
import { projectImpactSignature, findingExcerpt } from "@/lib/presentation/impact-signature";
import { decisionViews, resolveDecisionView, decisionReaderTitles, decisionReaderParagraphs } from "@/lib/presentation/decision-depth";
import { DecisionReader, DecisionFragmentAccess } from "@/app/components/DecisionReader";
import { ImpactChain } from "@/app/components/ImpactChain";
import { ReferenceChips, QuestionRing, ProcedureStepper } from "@/app/components/DecisionEvidenceVisuals";
import { ExecutiveImpactSummaryView } from "@/app/components/executive-impact/ExecutiveImpactSummary";
import { PublicMaturity } from "@/app/components/PublicMaturity";
import { SamePageStateLink } from "@/app/components/SamePageNavigation";
import { CommonTargetsComparison, ProblemGoalReview } from "@/app/components/DecisionMethodLayers";
import { RecommendationSection } from "@/app/components/recommendations/RecommendationSection";
import { getCase, formatDate, materialityLabel } from "@/lib/cases";
import { caseKindLabel, humanizeSystemValue, verificationLabel } from "@/lib/presentation/labels";
import { parliamentaryOverviewAssessment } from "@/lib/presentation/overview-assessment";
import { parliamentPublicMaturity } from "@/lib/presentation/public-maturity";
import { decisionReviewForImpactCase } from "@/lib/decision-method";
import { recommendationForImpactCase } from "@/lib/recommendations";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { getCasePublicationSource } from "@/lib/publication/fachakten";
import { publicParliamentSummary } from "@/lib/public-api";
import { parliamentExecutiveImpactSummary } from "@/lib/executive-impact/parliament";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  if (!item) return {};
  const assessment = parliamentaryOverviewAssessment(item);
  return {
    title: item.plainTitle,
    description: publicParliamentSummary(item),
  };
}

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
    evidence: humanizeSystemValue(firstStatus(exAnte.evidence_status ?? exAnte.evidence_boundary ?? sourceCompleteness.status, "Evidenzgrenze in Fachakte ausgewiesen")),
    attribution: humanizeSystemValue(firstStatus(exPost.attribution_status ?? exPost.causal_evidence_status ?? exPost.attribution, "Keine kausale Aussage ohne Gegenfaktum"))
  };
}

export default async function DecisionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ansicht?: string }> }) {
  const { slug } = await params;
  const { ansicht } = await searchParams;
  const item = getCase(slug);
  if (!item) notFound();
  const normativeMapping = item.publicAssessment?.normativeMapping ?? item.publicWorkingAct?.normativeMapping;
  const statuses = reviewStatuses(item);
  const overviewAssessment = parliamentaryOverviewAssessment(item);
  const executiveSummary = overviewAssessment && item.publicWorkingAct ? parliamentExecutiveImpactSummary(item, overviewAssessment) : null;
  const editoriallyPublished = Boolean(overviewAssessment);
  const activeView = resolveDecisionView(ansicht);
  const visibleDecisionViews = decisionViews;
  const readerTitles = decisionReaderTitles(item);
  const readerParagraphs = editoriallyPublished ? decisionReaderParagraphs(item) : null;
  const publicationCaseId = typeof item.publicWorkingAct?.fullReview?.result.case_id === "string" ? item.publicWorkingAct.fullReview.result.case_id : "";
  const methodCaseId = publicationCaseId || item.slug;
  const decisionReview = decisionReviewForImpactCase(methodCaseId) ?? decisionReviewForImpactCase(item.slug);
  const reviewCaseId = decisionReview?.impact_case_id ?? methodCaseId;
  const publicMaturity = parliamentPublicMaturity(item, overviewAssessment, {
    problemReviewAvailable: Boolean(decisionReview?.problem_review),
    goalReviewAvailable: Boolean(decisionReview?.goal_review),
    recommendationAvailable: Boolean(recommendationForImpactCase(methodCaseId)),
  });
  const completePublication = publicationCaseId ? await getCasePublicationSource(publicationCaseId) : null;
  const signature = projectImpactSignature(overviewAssessment, publicMaturity);
  return (
    <div className="shell decision-page decision-page--depths">
      <DecisionFragmentAccess viewKey={ansicht ?? ""} />
      <DecisionReader>
        <section className="decision-tier-one" aria-label="Wirkungsakte auf einen Blick">
          <p className="record-context"><Link href="/wirkungsakten">Wirkungschecks</Link><span aria-hidden="true">/</span><span>{caseKindLabel(item.kind)}</span><span className="chip">{materialityLabel(item.materiality)}</span></p>
          <header className="decision-header">
            <div><h1><span className="reader-understandable">{readerTitles.verstaendlich}</span><span className="reader-specialist">{readerTitles.fachlich}</span></h1></div>
          </header>
          <ImpactSignature signature={signature} concise />
          {overviewAssessment && <div className="decision-key-finding"><p className="eyebrow">Key Finding · Auszug</p><p>{findingExcerpt(overviewAssessment.keyFinding)}</p><SamePageStateLink href={`/entscheidungen/${item.slug}?ansicht=wirkungsanalyse`}>Vollständigen Befund lesen</SamePageStateLink></div>}
          <p className="decision-short-intro">{humanizeSystemValue(item.whatIsDecided)}</p>
          {readerParagraphs && <div className="decision-reader-intro"><p className="reader-understandable">{readerParagraphs.verstaendlich}</p><p className="reader-specialist">{readerParagraphs.fachlich}</p></div>}
          <ImpactChain />
          <ReferenceChips mapping={normativeMapping} slug={item.slug} />
          {/* The existing strings in item.questions are NOT reviewed answer states.
              Likewise lastUpdated is NOT an official parliamentary event date.
              No metric is rendered until a source-bound typed record is supplied. */}
          <QuestionRing />
          <ProcedureStepper />
        </section>
        <div className="decision-depth-layout">
          <div className="decision-depth-main">
            <nav className="decision-view-nav" aria-label="Ansichten dieser Wirkungsakte">
              <p><strong>Wirkungsakte</strong><span>60 Sekunden zuerst, Details gezielt öffnen.</span></p>
              <div>{visibleDecisionViews.map((view) => <SamePageStateLink key={view.id} href={view.id === "sachverhalt" ? `/entscheidungen/${item.slug}` : `/entscheidungen/${item.slug}?ansicht=${view.id}`} aria-current={activeView === view.id ? "page" : undefined}>{view.label}</SamePageStateLink>)}</div>
            </nav>

            <section data-decision-panel="sachverhalt" hidden={activeView !== "sachverhalt"} aria-label="Sachverhalt">
              {item.title !== item.plainTitle && <p className="official-title"><strong>Amtlicher Titel:</strong> {item.title}</p>}
              <section className="sixty-second" aria-labelledby="sixty-second-title" data-woek-substantive-impact={editoriallyPublished ? "published" : undefined}><div><p className="eyebrow">60 Sekunden</p><h2 id="sixty-second-title">Worum geht es?</h2></div><dl><div><dt>Was wird entschieden?</dt><dd>{humanizeSystemValue(item.whatIsDecided)}</dd></div><div><dt>Welche Veränderung steht im Mittelpunkt?</dt><dd>{editoriallyPublished ? decisionFocus(item) : "WÖk-Analyse noch nicht redaktionell veröffentlicht."}</dd></div></dl></section>
              {editoriallyPublished && <DecisionReadinessGate decisionBasis={statuses.decisionBasis} />}
              {decisionReview && <ProblemGoalReview impactCaseId={reviewCaseId} />}
              {editoriallyPublished && <GlossaryBasics termKeys={item.publicAssessment ? ["wirkung", "wirkungsbewertung", "gegenfaktum", "evidenzgrenze", "zurechnung", "nichtkompensation"] : ["wirkungspotenzial", "wirkungsrisiko", "wirkmechanismus", "wirkpfad", "rueckkopplung"]} />}
            </section>

            <section data-decision-panel="wirkungsanalyse" hidden={activeView !== "wirkungsanalyse"} aria-label="Wirkungsanalyse">
              <ImpactSignature signature={signature} />
              {executiveSummary ? <ExecutiveImpactSummaryView summary={executiveSummary} /> : overviewAssessment ? <OverviewAssessment assessment={overviewAssessment} /> : null}
              <PublicMaturity maturity={publicMaturity} />
              <div data-woek-method-layer={editoriallyPublished || decisionReview ? "impact" : undefined}>{editoriallyPublished && item.publicAssessment ? <AssessmentExplainer assessment={item.publicAssessment} /> : editoriallyPublished && item.publicWorkingAct && overviewAssessment ? <WorkingActExplainer workingAct={item.publicWorkingAct} view="ueberblick" publicEvidenceSummary={overviewAssessment.evidenceSummary} /> : decisionReview ? <section className="decision-section assessment-pending"><p className="eyebrow">3 · Wirkungsanalyse</p><h2>WÖk-Wirkungsanalyse noch nicht redaktionell veröffentlicht</h2><p>Die Problem- und Zielprüfung ist fachlich dokumentiert. Eine Wirkungsrichtung, Neutralität oder Wirkungslosigkeit wird daraus nicht abgeleitet.</p></section> : !item.publicWorkingAct ? <section className="decision-section assessment-pending"><p className="eyebrow">WÖk-Einordnung</p><h2>Noch keine fachliche Bewertung veröffentlicht</h2><p>Eine reale Einordnung erscheint erst, wenn Entscheidungsfassung, Quellen, Wirkpfade, Berechnungen und Unsicherheiten geprüft sind. Das Portal unterscheidet dann sichtbar zwischen Ergebnis, Begründung und dem vollständigen Rechenweg.</p></section> : null}</div>
              {editoriallyPublished && item.publicWorkingAct && overviewAssessment && <><span id="review-deep-dive-title" /><WorkingActExplainer workingAct={item.publicWorkingAct} view="wirkprofil" publicEvidenceSummary={overviewAssessment.evidenceSummary} /><WorkingActExplainer workingAct={item.publicWorkingAct} view="wirkpfade" publicEvidenceSummary={overviewAssessment.evidenceSummary} /></>}
              {editoriallyPublished && normativeMapping && <NormativeImpactTiles mapping={normativeMapping} />}
              {editoriallyPublished && <><RecommendationSection impactCaseId={methodCaseId} /><CommonTargetsComparison impactCaseId={methodCaseId} /></>}
              {!item.publicWorkingAct && <div className="decision-grid">
                <section className="decision-section"><p className="eyebrow">Möglicher Weg zur Veränderung</p><h2>Wie könnte aus der Entscheidung eine Veränderung entstehen?</h2><p className="section-intro">Die folgende Darstellung beschreibt mögliche Schritte von der Entscheidung über ihre Umsetzung bis zu einer Veränderung. Fachlich heißt diese begründete Annahme Wirkmechanismus; die Abfolge wird als Wirkpfad dargestellt. Sie ist noch kein Wirkungsnachweis.</p><ol className="impact-path">{item.impactPath.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol></section>
                <aside className="decision-section side-card"><p className="eyebrow">Betroffene</p><h2>Wer oder was kann betroffen sein?</h2>{item.affectedGroups.length ? <ul>{item.affectedGroups.map((group) => <li key={group}>{group}</li>)}</ul> : <p>Die fachliche Befüllung folgt nach Fall- und Quellenprüfung.</p>}</aside>
              </div>}
              {!item.publicWorkingAct && <section className="decision-section recommendation-block"><p className="eyebrow">WÖk-Facheinordnung</p><h2>Noch nicht veröffentlicht</h2><p>Eine WÖk-Facheinordnung folgt nur aus einer dokumentierten Fallprüfung, Evidenz, Gegenargumenten und nachvollziehbaren Grenzen. Diese Seite ersetzt kein Rechtsgutachten und keine parlamentarische Entscheidung.</p></section>}
            </section>

            <section data-decision-panel="evidenz" hidden={activeView !== "evidenz"} aria-label="Evidenz und Grenzen">
              {editoriallyPublished && item.publicWorkingAct && overviewAssessment && <WorkingActExplainer workingAct={item.publicWorkingAct} view="berechnungen" publicEvidenceSummary={overviewAssessment.evidenceSummary} />}
              {!item.publicWorkingAct && <section className="decision-section question-section"><p className="eyebrow">Prüffragen</p><h2>Was muss vor einer Bewertung geklärt werden?</h2><ol>{item.questions.map((question) => <li key={question}>{question}</li>)}</ol></section>}
              {editoriallyPublished && <p><a href="#decision-transparency">Transparenzansicht öffnen</a></p>}
              {!editoriallyPublished && <p>Die fallbezogene Evidenzprüfung ist noch nicht redaktionell veröffentlicht. Fehlende Evidenz bedeutet nicht Neutralität.</p>}
            </section>

            <section data-decision-panel="quellen" hidden={activeView !== "quellen"} aria-label="Quellen">
              <section id="quellen" className="decision-section" data-woek-source-layer="published"><p className="eyebrow">Quellen und Grenzen</p><h2>Worauf stützt sich diese Seite?</h2><p className="section-intro">Jede Quelle wird zuerst im Quellenarchiv eingeordnet – mit Herausgeber, Fassung, zeitlicher Rolle und ihrer Verwendung in diesem Check.</p><div className="source-list">{item.sources.map((source) => <article key={source.url}><h3><Link href={sourceDetailHrefForUrl(source.url)}>{source.title}</Link></h3><p>{source.publisher} · abgerufen {formatDate(source.retrievedAt)}</p><p>{source.note}</p><Link className="text-link" href={sourceDetailHrefForUrl(source.url)}>Quellendetail ansehen →</Link></article>)}</div></section>
            </section>

            <section data-decision-panel="verlauf" hidden={activeView !== "verlauf"} aria-label="Verlauf">
              <section className="decision-section"><p className="eyebrow">Fassung und Änderung</p><h2>Welche Version wurde betrachtet?</h2><p>{item.versionNote}</p><details className="notice"><summary><strong>Technische Nachvollziehbarkeit der Fassung</strong></summary><p>Ein Dokumentvergleich hält Originalquelle, Abrufzeit und die nachvollziehbaren Folgen für die WÖk-Analyse fest.</p></details></section>
              {editoriallyPublished && <section data-woek-method-layer="reality"><p className="eyebrow">6 · Reality Check</p><h2>Was hat sich tatsächlich verändert?</h2><p>{item.publicWorkingAct?.reviewDetail?.feedback?.interpretation || "Noch keine fachlich freigegebene ex-post Wirkungsbeobachtung veröffentlicht. Aus dem parlamentarischen Status wird keine Wirkung abgeleitet."}</p></section>}
            </section>

            {editoriallyPublished && <details id="decision-transparency" className="decision-transparency" open={ansicht === "fachakte"}>
              <summary>Rechenweg, Annahmen und Versionsstand öffnen</summary>
              {completePublication ? <CompletePublicationSource source={completePublication} idPrefix="vollstaendige-fachakte" /> : item.publicWorkingAct?.fullReview ? <FullReviewRecord review={item.publicWorkingAct.fullReview} /> : <p>Keine zusätzliche Transparenzakte veröffentlicht. Die vollständigen vorhandenen Angaben stehen in den fünf Ansichten.</p>}
            </details>}
          </div>

          <aside className="decision-rail">
            <section className="decision-process-meta" aria-label="Politischer Prozess und Prüfstatus" data-woek-process-metadata>
              <div><CaseTypeMark kind={item.kind} maturity={item.publicWorkingAct?.maturity} /><p>Prozess- und Prüfinformationen</p></div>
              <div className="decision-status"><p>Status dieser Wirkungsakte</p><strong>{humanizeSystemValue(item.parliamentaryStatus)}</strong><dl><div><dt>Stand der WÖk-Analyse</dt><dd>{humanizeSystemValue(item.analysisStatus)}</dd></div><div><dt>Bisherige WÖk-Prozessstufe</dt><dd>{statuses.maturity}</dd></div><div><dt>Evidenzstatus</dt><dd>{statuses.evidence}</dd></div><div><dt>Attributionsstatus</dt><dd>{statuses.attribution}</dd></div><div><dt>Prüfrelevanz</dt><dd>{materialityLabel(item.materiality)}</dd></div><div><dt>Quellenstatus</dt><dd>{verificationLabel(item.statusVerification)}</dd></div><div><dt>Letzte Aktualisierung</dt><dd>{formatDate(item.lastUpdated)}</dd></div></dl></div>
            </section>
            <section className="decision-rail-actions"><h2>Diese Akte verfolgen</h2><BookmarkLink title={item.plainTitle} path={`/entscheidungen/${item.slug}`} /><Link href="/aktuell/radar-abo">Bei Änderung benachrichtigen</Link><p>Über das bestehende Themen-Radar; kein Abonnement nur dieser Einzelakte.</p><a href={`mailto:wirkungscheck@wirkungsoekonomie.de?subject=${encodeURIComponent("Korrektur: " + item.plainTitle)}`}>Korrektur melden</a></section>
          </aside>
        </div>
      </DecisionReader>
      <p className="page-return"><Link href="/wirkungsakten">← Alle Wirkungschecks</Link></p>
    </div>
  );
}

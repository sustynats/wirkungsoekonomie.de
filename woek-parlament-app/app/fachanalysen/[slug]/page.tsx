import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalculationIcon, EvidenceIcon, HistoryIcon, MonitorIcon, PathIcon, SourceIcon } from "@/app/components/icons";
import { ImpactReviewMap } from "@/app/components/ImpactReviewMap";
import { GlossaryBasics } from "@/app/components/GlossaryBasics";
import { ReferenceFieldTiles } from "@/app/components/ReferenceFieldTiles";
import { FullAnalysisText } from "@/app/components/FullAnalysisText";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import type { FachanalyseSource } from "@/data/fachanalysen";
import { fullAnalysisBySlug } from "@/data/fachanalysen-full";
import { getFachanalyse } from "@/lib/fachanalysen";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { getSpecialistPublicationSource } from "@/lib/publication/fachakten";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? value : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(parsed);
}

function humanize(value: string | undefined) {
  if (!value) return "nicht ausgewiesen";
  return value.replaceAll("_", " ").toLocaleLowerCase("de-DE");
}

function SourceLinks({ sources }: { sources: FachanalyseSource[] }) {
  if (sources.length === 0) return null;
  return <ul className="inline-source-links" aria-label="Quellen">
    {sources.map((source) => <li key={source.slug}><SourceIcon aria-hidden="true" /><Link href={sourceDetailHrefForUrl(source.canonicalUrl)}>{source.institution}: {source.title}</Link></li>)}
  </ul>;
}

function EvidenceMap({ map }: { map: Record<string, string[]> }) {
  const label: Record<string, string> = { BELEGT: "Belegt", BEGRENZT: "Begrenzt", OFFEN: "Offen" };
  return <div className="evidence-map-grid">
    {Object.entries(map).map(([key, entries]) => <article key={key} className={`evidence-map-card evidence-map-card--${key.toLowerCase()}`}>
      <p className="eyebrow">{label[key] ?? humanize(key)}</p>
      <ul>{entries.map((entry) => <li key={entry}>{entry}</li>)}</ul>
    </article>)}
  </div>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const analysis = getFachanalyse(slug);
  return analysis ? { title: analysis.title, description: analysis.subtitle } : { title: "Fachanalyse nicht gefunden" };
}

export default async function FachanalyseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const analysis = getFachanalyse(slug);
  if (!analysis) notFound();
  const fullSource = fullAnalysisBySlug[slug];
  const completePublication = slug === "gebaeudeenergiegesetz-medienwirkung"
    ? await getSpecialistPublicationSource("fachanalyse:gebaeudeenergiegesetz-medienwirkung")
    : null;
  const detailed = Boolean(analysis.timeline?.length);
  return (
    <div className="shell content-page fachanalyse-detail">
      <nav className="breadcrumb" aria-label="Pfad"><Link href="/">Startseite</Link><span aria-hidden="true">/</span><Link href="/fachanalysen">Fachanalysen</Link></nav>
      <header className="page-intro fachanalyse-intro">
        <p className="eyebrow">{detailed ? "Fachanalyse · Rückblick & Umsetzung" : "Fachliche Dokumentation"}</p>
        <h1>{analysis.title}</h1>
        <p className="lead">{analysis.subtitle}</p>
        <p>{analysis.summary}</p>
      </header>

      {analysis.decision ? <section className="analysis-facts" aria-label="Entscheidungsdaten">
        <div><span>Beschluss</span><strong>{formatDate(analysis.decision.date)}</strong></div>
        <div><span>Verkündung</span><strong>{analysis.decision.promulgation}</strong></div>
        <div><span>In Kraft</span><strong>{formatDate(analysis.decision.inForce)}</strong></div>
        <div><span>Analyse-Stand</span><strong>{formatDate(analysis.analysisDate)}</strong></div>
      </section> : null}

      {analysis.publicationBoundary ? <section className="publication-boundary" aria-label="Aussagegrenze">
        <EvidenceIcon aria-hidden="true" />
        <div><strong>Was diese Analyse sagt – und was nicht</strong><p>{analysis.publicationBoundary}</p></div>
      </section> : null}

      {detailed ? <>
        <section className="two-perspective-grid" aria-label="Damals und heute">
          <article><p className="eyebrow">Zum Beschlusszeitpunkt</p><h2>Wirkungspotenzial</h2><p>{analysis.exAnte?.summary}</p><p className="small-meta">Wissensstand: {analysis.exAnte?.cutoff ? formatDate(analysis.exAnte.cutoff) : "nicht ausgewiesen"}</p><SourceLinks sources={analysis.exAnte?.sources ?? []} /></article>
          <article><p className="eyebrow">Heute beobachtbar</p><h2>Entwicklung, nicht vorschnell Wirkung</h2><p>{analysis.exPost?.summary}</p><p className="small-meta">Beobachtungsstand: {analysis.exPost?.cutoff ? formatDate(analysis.exPost.cutoff) : "nicht ausgewiesen"}</p><SourceLinks sources={analysis.exPost?.sources ?? []} /></article>
        </section>

        <ImpactReviewMap
          title="Die vier Prüfräume dieser Fachanalyse"
          dimensions={[
            { id: "fassung", label: "Gesetzesfassung", status: "belegt", detail: "Die zeitliche Abfolge und die materiellen Änderungen zwischen Entwurf und Beschluss sind dokumentiert." },
            { id: "umsetzung", label: "Umsetzung", status: "teilweise beobachtbar", detail: "Rechtsvollzug und einzelne Markt- und Neubauwerte sind sichtbar. Eine vollständige Bestandswirkung ist nicht belegt." },
            { id: "resonanz", label: "Resonanzraum", status: "kausal begrenzt", detail: "Frames sind in abgegrenzten Quellen nachweisbar. Eine nationale Verhaltens- oder Medienkausalität wird nicht behauptet." },
            { id: "rueckkopplung", label: "Rückkopplung", status: "weiter zu messen", detail: "Für Emissionen, Verteilung, Bestand und Vertrauen braucht es belastbare Gegenfakta und fortlaufende Daten." }
          ]}
        />

        {analysis.referenceFields ? <ReferenceFieldTiles mpd={analysis.referenceFields.mpd} sdgAndPlus={analysis.referenceFields.sdgAndPlus} /> : null}

        <section className="decision-section" aria-labelledby="observations-title">
          <p className="eyebrow">Was ist beobachtbar?</p><h2 id="observations-title">Fünf Befunde mit ihren Grenzen</h2>
          <div className="observation-grid">
            {analysis.observedOutcomes?.map((outcome) => <article key={outcome.outcome_id}>
              <p>{outcome.observation}</p>
              {outcome.value_series?.length ? <dl>{outcome.value_series.map((item) => <div key={`${item.year}-${item.value}`}><dt>{item.year}</dt><dd>{String(item.value).replace(".", ",")} {item.unit}</dd></div>)}</dl> : null}
              <p className="causality-limit"><strong>Grenze:</strong> {outcome.causal_limit}</p>
              <SourceLinks sources={outcome.sources} />
            </article>)}
          </div>
        </section>

        {analysis.evidenceMap ? <section className="decision-section" aria-labelledby="evidence-title"><p className="eyebrow">Evidenzkarte</p><h2 id="evidence-title">Was die Daten tragen</h2><EvidenceMap map={analysis.evidenceMap} /></section> : null}

        <section className="decision-section" aria-labelledby="version-title">
          <p className="eyebrow">Vom Entwurf zum Beschluss</p><h2 id="version-title">Die entscheidenden Änderungen</h2>
          <div className="version-comparison-table" role="region" aria-label="Vergleich von Regierungsentwurf und beschlossener Fassung" tabIndex={0}>
            <table><thead><tr><th>Prüffeld</th><th>Regierungsentwurf</th><th>Beschlossene Fassung</th></tr></thead><tbody>{analysis.comparison?.map((item) => <tr key={item.dimension}><th scope="row">{item.dimension}<SourceLinks sources={item.sources} /></th><td>{item.draft}</td><td>{item.final}</td></tr>)}</tbody></table>
          </div>
        </section>

        <section className="decision-section" aria-labelledby="timeline-title"><p className="eyebrow">Zeitachse</p><h2 id="timeline-title">Was wann geschah</h2>
          <ol className="analysis-timeline">{analysis.timeline?.map((entry) => <li key={`${entry.date}-${entry.label}`}><time dateTime={entry.date}>{formatDate(entry.date)}</time><div><h3>{humanize(entry.label)}</h3><p>{entry.summary}</p><details><summary>Änderung und Wirkungspotenzial einordnen</summary><p><strong>Änderung:</strong> {entry.change}</p><p><strong>Wirkungspotenzial:</strong> {entry.potential}</p><SourceLinks sources={entry.sources} /></details></div></li>)}</ol>
        </section>

        <section className="decision-section" aria-labelledby="paths-title"><p className="eyebrow">Wirkungslogik</p><h2 id="paths-title">Was hätte sich verändern können?</h2>
          <div className="analysis-detail-list">{analysis.impactPaths?.map((path) => <details key={path.lever}><summary><PathIcon aria-hidden="true" /><span>{path.lever}</span><small>{humanize(path.evidenceStatus)}</small></summary><p>{path.hypothesis}</p><div className="two-column-list"><div><strong>Voraussetzungen</strong><ul>{path.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>Risiken</strong><ul>{path.risks.map((item) => <li key={item}>{item}</li>)}</ul></div></div><SourceLinks sources={path.sources} /></details>)}</div>
        </section>

        <section className="decision-section" aria-labelledby="media-title"><p className="eyebrow">Medien und Wahrnehmung</p><h2 id="media-title">Dokumentierte Frames, keine Motiverzählung</h2><p>Die Analyse beschreibt mögliche Resonanzräume. Sie schreibt keine individuellen Motive zu und leitet aus einem Frame keine nationale Verhaltenswirkung ab.</p>
          <div className="analysis-detail-list">{analysis.mediaPatterns?.map((pattern) => <details key={pattern.label}><summary><HistoryIcon aria-hidden="true" /><span>{pattern.label}</span><small>{pattern.period}</small></summary><p><strong>Möglicher Wirkpfad:</strong> {pattern.potentialPath}</p><p><strong>Stärkste Alternativerklärung:</strong> {pattern.alternativeExplanation}</p><p><strong>Evidenz:</strong> {humanize(pattern.evidenceStatus)} · <strong>Kausalität:</strong> {humanize(pattern.causalStatus)}</p><p><strong>Betroffene Gruppen:</strong> {pattern.affectedGroups.join(" · ")}</p><SourceLinks sources={pattern.sources} /></details>)}</div>
        </section>

        <section className="decision-section" aria-labelledby="calculation-title"><p className="eyebrow">Wirkungsbuchhaltung</p><h2 id="calculation-title">Was noch berechnet werden müsste</h2><p>Wo eine belastbare Zahl fehlt, setzt das Dossier keine Schätzung. Es legt offen, welche Daten, Gegenfakta und Zurechnung dafür erforderlich wären.</p>
          <div className="analysis-detail-list">{analysis.calculationRequirements?.map((calculation) => <details key={calculation.calculation_id}><summary><CalculationIcon aria-hidden="true" /><span>{calculation.question}</span><small>{calculation.unit}</small></summary><dl className="calculation-requirements"><div><dt>Ausgangslage</dt><dd>{calculation.baseline}</dd></div><div><dt>Beobachtung</dt><dd>{calculation.observation}</dd></div><div><dt>Gegenfaktum</dt><dd>{calculation.counterfactual}</dd></div><div><dt>Zurechnung</dt><dd>{calculation.attribution_basis}</dd></div><div><dt>Unsicherheit</dt><dd>{calculation.uncertainty}</dd></div><div><dt>Rechenqualität</dt><dd>Daten: {humanize(calculation.data_quality)} · Kausalität: {humanize(calculation.causal_quality)} · Modell: {humanize(calculation.model_quality)}</dd></div></dl></details>)}</div>
        </section>

        <section className="two-perspective-grid" aria-label="Gegenfakta und Grenzen">
          <article><p className="eyebrow">Alternative Entwicklungen</p><h2>Gegenfakta bleiben Modelle</h2><div className="compact-detail-list">{analysis.counterfactuals?.map((item) => <details key={item.scenario_id}><summary>{humanize(item.scenario_id)} · {humanize(item.status)}</summary><p>{item.description}</p><p><strong>Benötigt:</strong> {item.required_inputs?.join(" · ")}</p><p><strong>Nicht direkt beobachtbar, weil:</strong> {item.not_observed_reason}</p></details>)}</div></article>
          <article><p className="eyebrow">Risiken & Schutzgrenzen</p><h2>Was nicht aufgerechnet werden darf</h2><ul className="risk-boundary-list">{analysis.risksAndBoundaries?.map((item) => <li key={item.risk}><strong>{item.risk}</strong><span>{item.boundary}</span></li>)}</ul></article>
        </section>

        <section className="decision-section" aria-labelledby="learning-title"><p className="eyebrow">Lernschleife</p><h2 id="learning-title">Was sich für ähnliche Entscheidungen ableiten lässt</h2><div className="learning-points">{analysis.learningPoints?.map((point, index) => <article key={point}><span>{String(index + 1).padStart(2, "0")}</span><p>{point}</p></article>)}</div></section>

        <section className="decision-section" aria-labelledby="gaps-title"><p className="eyebrow">Offene Daten</p><h2 id="gaps-title">Was für eine belastbarere Einordnung fehlt</h2><ul className="data-gap-list">{analysis.dataGaps?.map((gap, index) => <li key={typeof gap === "string" ? gap : index}>{typeof gap === "string" ? gap : JSON.stringify(gap)}</li>)}</ul></section>

        <GlossaryBasics title="Begriffe in diesem Dossier" termKeys={["wirkung", "wirkungspotenzial", "wirkungsrisiko", "wirkpfad", "wirkungsgrenze", "rueckkopplung"]} />
      </> : <>
        <ImpactReviewMap
          title="Die Prüfräume dieser Dokumentation"
          dimensions={[
            { id: "pfade", label: "Wirkpfade", status: "strukturiert", detail: "Welche Zustandsveränderungen Investitionen plausibel auslösen könnten und welche Voraussetzungen dafür erfüllt sein müssen." },
            { id: "grenzen", label: "Schutzgrenzen", status: "getrennt", detail: "Welche Risiken nicht durch andere positive Effekte aufgerechnet werden dürfen." },
            { id: "monitor", label: "Rückkopplung", status: "festzulegen", detail: "Welche Messgrößen, Zeiträume und Korrekturpunkte aus der Dokumentation folgen." }
          ]}
        />
        <GlossaryBasics title="Grundbegriffe dieser Dokumentation" termKeys={["wirkungspotenzial", "wirkungsrisiko", "zusaetzlichkeit", "nichtkompensation", "rueckkopplung"]} />
      </>}

      {analysis.publicDownload ? <section className="decision-section download-section" aria-labelledby="download-title"><p className="eyebrow">Dokumentation</p><h2 id="download-title">Dossier als PDF</h2><p>{analysis.publicDownload.description}</p><a className="button button-primary" href={analysis.publicDownload.href} download>{analysis.publicDownload.label}</a></section> : null}
      {completePublication ? <CompletePublicationSource source={completePublication} idPrefix="vollstaendige-fachakte" /> : fullSource ? <FullAnalysisText source={fullSource} /> : null}
      <section className="decision-section source-overview" aria-labelledby="sources-title"><p className="eyebrow">Quellenarchiv</p><h2 id="sources-title">{analysis.sources.length} Quellen mit Einordnung</h2><p>Jede Quelle führt zuerst auf ihre Detailseite: Herausgeber, zeitliche Einordnung, Fundstelle und Aussagegrenze bleiben dort sichtbar.</p><div className="source-overview-links"><SourceLinks sources={analysis.sources} /></div></section>
      <p className="page-return"><Link href="/fachanalysen">← Alle Fachanalysen</Link></p>
    </div>
  );
}

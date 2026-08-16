import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalculationIcon, EvidenceIcon, HistoryIcon, MonitorIcon, PathIcon, SourceIcon } from "@/app/components/icons";
import { ImpactReviewMap } from "@/app/components/ImpactReviewMap";
import { GlossaryBasics } from "@/app/components/GlossaryBasics";
import { ReferenceFieldTiles } from "@/app/components/ReferenceFieldTiles";
import type { FachanalyseSource } from "@/data/fachanalysen";
import { getFachanalyse } from "@/lib/fachanalysen";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(parsed.valueOf()) ? value : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(parsed);
}

function humanize(value: string | undefined) {
  if (!value) return "nicht ausgewiesen";
  const normalized = value.trim().toUpperCase().replaceAll("_", " ");
  const labels: Record<string, string> = {
    "EX ANTE CAUSAL HYPOTHESIS WITH MODEL INPUTS": "Ex-ante-Wirkungshypothese · modellgestützt",
    "EX ANTE DESIGN POTENTIAL": "Ex-ante-Designpotenzial",
    "MECHANISM PARTLY TESTED EFFECT LIMITED IN ONE STUDY": "Mechanismus teilweise untersucht · Wirkung nur begrenzt belegt",
    "FRAME EXISTENCE SUPPORTED CAUSAL BEHAVIOUR UNRESOLVED": "Frame belegt · Verhaltenswirkung kausal offen",
    "IMPACT POTENTIAL WITH DOCUMENTED MEDIA FRAME": "Wirkungspotenzial mit dokumentiertem Medienframe",
    "IMPACT POTENTIAL WITH DOCUMENTED FRAME": "Wirkungspotenzial mit dokumentiertem Frame",
    "DOCUMENTED COMPLEXITY AND LIMITED KNOWLEDGE": "Komplexität dokumentiert · Wissensstand begrenzt",
    "POLICY DESIGN AND MODELLED PATH": "Politikdesign · modellierter Wirkpfad",
    "OFFICIAL OBJECTIVE AND MODELLED POTENTIAL": "Amtliches Ziel · modelliertes Wirkungspotenzial",
    "NOT CAUSALLY ATTRIBUTED": "nicht kausal zugerechnet",
    "PARTIAL MECHANISM SUPPORTED NO BEHAVIOURAL ATTRIBUTION": "Teilmechanismus gestützt · keine Verhaltenszurechnung",
    "UNRESOLVED": "offen",
    "MODELLED": "modelliertes Szenario",
    "STATUS QUO": "Fortführung ohne die beschlossene Änderung",
    "ALTERNATIVE GESTALTUNG": "alternative Ausgestaltung",
    "COMMUNICATION IMPLEMENTATION": "Kommunikation und Umsetzung",
    "OFFICIAL INSTALLATION DATA REQUIRED": "amtliche Installationsdaten erforderlich",
    "OFFICIAL ENERGY AND BUILDING DATA REQUIRED": "amtliche Energie- und Gebäudedaten erforderlich",
    "MICRODATA REQUIRED": "Mikrodaten erforderlich",
    "REPRESENTATIVE PANEL AND EXPOSURE DATA REQUIRED": "repräsentative Panel- und Expositionsdaten erforderlich",
    "METHOD REVIEW REQUIRED": "Methodenprüfung erforderlich",
    "MODEL REQUIRED": "Modell erforderlich",
    "DISTRIBUTION MODEL REQUIRED": "Verteilungsmodell erforderlich",
    "NO NATIONAL CAUSAL MODEL": "kein nationales Kausalmodell vorhanden",
    "PARTIAL ONLY": "nur teilweise bestimmbar",
    "FIRST PUBLIC HEARING": "erste öffentliche Anhörung",
    "SECOND PUBLIC HEARING": "zweite öffentliche Anhörung",
    "BUNDESTAG DECISION": "Beschluss des Bundestages",
    "PROMULGATED LAW": "Verkündung des Gesetzes",
    "IMPLEMENTATION START": "Beginn der gestuften Umsetzung",
    "OFFICIAL VERSION AVAILABLE": "amtliche Fassung verfügbar",
    "GOVERNMENT DRAFT": "Regierungsentwurf",
    "PARLIAMENTARY GOVERNMENT DRAFT": "Regierungsentwurf im parlamentarischen Verfahren",
    "DELIBERATION": "parlamentarische Beratung",
    "DELIBERATION ON CHANGED DESIGN": "Beratung der geänderten Ausgestaltung",
    "COMMITTEE FINAL PARLIAMENTARY VERSION": "abschließende Ausschussfassung",
    "DECIDED": "beschlossen",
    "BUNDESRAT PROCEEDING COMPLETED": "Bundesratsverfahren abgeschlossen",
    "PROMULGATED": "verkündet",
    "IN FORCE": "in Kraft",
    "GESETZ IN FORCE AND STAGED IMPLEMENTATION": "Gesetz in Kraft, Umsetzung erfolgt gestuft",
    "PARTIAL AND MIXED": "teilweise beobachtbar und gegenläufig",
    "NOT ROBUSTLY ESTABLISHED": "nicht belastbar kausal belegt",
    "NOT YET ASSESSABLE": "noch nicht belastbar bewertbar"
  };
  if (labels[normalized]) return labels[normalized];
  const plain = value.replaceAll("_", " ").trim();
  return plain.charAt(0).toLocaleUpperCase("de-DE") + plain.slice(1).toLocaleLowerCase("de-DE");
}

function directionLabel(value: string | undefined) {
  return ({
    POSITIVE_POTENTIAL: "möglicherweise positiv",
    NEGATIVE_RISK: "möglicherweise negativ",
    AMBIVALENT: "gegenläufige Potenziale und Risiken",
    NEUTRAL: "neutral",
    OPEN: "Richtung noch offen"
  } as Record<string, string>)[value ?? "OPEN"] ?? "Richtung noch offen";
}

function SourceLinks({ sources }: { sources: FachanalyseSource[] }) {
  if (sources.length === 0) return null;
  return <ul className="inline-source-links" aria-label="Quellen">
    {sources.map((source) => <li key={source.slug}><SourceIcon aria-hidden="true" /><Link href={`/quellen/${source.slug}`}>{source.institution}: {source.title}</Link></li>)}
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

      {analysis.referenceStatus?.startsWith("PROPOSED_PENDING") ? <section className="publication-boundary publication-boundary--pending" aria-label="Status des Referenzabgleichs">
        <EvidenceIcon aria-hidden="true" />
        <div><strong>{analysis.referenceStatusLabel ?? "Vorgeschlagener Prüfbezug – Referenzabgleich ausstehend"}</strong><p>Die Zuordnung zeigt nachvollziehbare mögliche Bezüge. Sie ist noch kein kanonisch freigegebener Referenzsatz und wird bis zum abgeschlossenen Abgleich nicht als endgültige WÖk-Zuordnung ausgegeben.</p></div>
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

        {analysis.referenceFields ? <ReferenceFieldTiles mpd={analysis.referenceFields.mpd} sdgAndPlus={analysis.referenceFields.sdgAndPlus} overallAssessment={analysis.retrospective ? `Beobachtete Entwicklung: ${humanize(analysis.retrospective.observed_state_change)}. Kausale Zurechnung: ${humanize(analysis.retrospective.causal_attribution)}. Netto-Wirkung: ${humanize(analysis.retrospective.net_impact)}.` : undefined} assessments={analysis.referenceFields.assessments} /> : null}

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
          <ol className="analysis-timeline">{analysis.timeline?.map((entry) => <li key={`${entry.date}-${entry.label}`}><time dateTime={entry.date}>{formatDate(entry.date)}</time><div><h3>{humanize(entry.label)}</h3><p>{entry.summary}</p><details><summary>Änderung und Wirkungspotenzial einordnen</summary><p><strong>Änderung:</strong> {entry.change}</p><p><strong>Richtung:</strong> <span className={`direction-label direction-label--${(entry.direction ?? "OPEN").toLocaleLowerCase("en-US").replaceAll("_", "-")}`}>{directionLabel(entry.direction)}</span></p><p><strong>Ausführliche Begründung:</strong> {entry.potential}</p>{entry.evidenceBoundary && <p><strong>Was diese Einordnung noch nicht belegt:</strong> {entry.evidenceBoundary}</p>}<SourceLinks sources={entry.sources} /></details></div></li>)}</ol>
        </section>

        <section className="decision-section" aria-labelledby="paths-title"><p className="eyebrow">Wirkungslogik</p><h2 id="paths-title">Was hätte sich verändern können?</h2>
          <div className="analysis-detail-list">{analysis.impactPaths?.map((path) => <details key={path.lever}><summary><PathIcon aria-hidden="true" /><span>{path.lever}</span><small>{directionLabel(path.direction)} · {humanize(path.evidenceStatus)}</small></summary><p><strong>Richtung:</strong> <span className={`direction-label direction-label--${(path.direction ?? "OPEN").toLocaleLowerCase("en-US").replaceAll("_", "-")}`}>{directionLabel(path.direction)}</span></p><p><strong>Ausführliche Begründung des Wirkmechanismus:</strong> {path.hypothesis}</p><div className="two-column-list"><div><strong>Voraussetzungen für dieses Potenzial</strong><ul>{path.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></div><div><strong>Risiken und mögliche Gegenwirkungen</strong><ul>{path.risks.map((item) => <li key={item}>{item}</li>)}</ul></div></div>{path.evidenceBoundary && <p><strong>Evidenzgrenze:</strong> {path.evidenceBoundary}</p>}<SourceLinks sources={path.sources} /></details>)}</div>
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

      {analysis.fullPublicationSource ? <section className="decision-section full-dossier-link" aria-labelledby="full-source-title"><p className="eyebrow">Vollständige Publikationsquelle</p><h2 id="full-source-title">Alle Befunde und Quellenbezüge nachlesen</h2><p>{analysis.fullPublicationSource.description}</p><a className="button button-secondary" href={analysis.fullPublicationSource.href}>{analysis.fullPublicationSource.label}</a></section> : null}
      {analysis.publicDownload ? <section className="decision-section download-section" aria-labelledby="download-title"><p className="eyebrow">Dokumentation</p><h2 id="download-title">Dossier als PDF</h2><p>{analysis.publicDownload.description}</p><a className="button button-primary" href={analysis.publicDownload.href} download>{analysis.publicDownload.label}</a></section> : null}
      <section className="decision-section source-overview" aria-labelledby="sources-title"><p className="eyebrow">Quellenarchiv</p><h2 id="sources-title">{analysis.sources.length} Quellen mit Einordnung</h2><p>Jede Quelle führt zuerst auf ihre Detailseite: Herausgeber, zeitliche Einordnung, Fundstelle und Aussagegrenze bleiben dort sichtbar.</p><div className="source-overview-links"><SourceLinks sources={analysis.sources} /></div></section>
      <p className="page-return"><Link href="/fachanalysen">← Alle Fachanalysen</Link></p>
    </div>
  );
}

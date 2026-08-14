import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AiConsent } from "@/app/components/AiConsent";
import { ScenarioPanel } from "@/app/components/ScenarioPanel";
import type { EvidenceClass } from "@/data/cases";
import { getCase, formatDate, materialityLabel } from "@/lib/cases";
import { getPublishedPortalCase, type PublishedPortalCaseDetail } from "@/lib/published-cases";

const steps = ["Einordnung", "Beratung", "Entscheidung", "Umsetzung", "Monitor"];

function evidenceLabel(value: EvidenceClass) {
  return { HIGH: "hoch belegt", MEDIUM: "mittel belegt", LIMITED: "begrenzt belegt", MODEL_ASSUMPTION: "Modellannahme", DATA_GAP: "Datenlücke" }[value];
}

export function generateStaticParams() {
  return ["musterfall-fassungswechsel", "radar-befuellung-ausstehend", "historie-redaktioneller-auftakt"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCase(slug);
  if (item) return { title: item.plainTitle, description: item.summary, openGraph: { title: item.plainTitle, description: item.summary, images: [] }, twitter: { title: item.plainTitle, description: item.summary, images: [] } };
  const published = await getPublishedPortalCase(slug);
  return published ? { title: published.title, description: "Veröffentlichter, quellengebundener Wirkungscheck des Instituts für Wirkungsökonomie.", openGraph: { title: published.title, images: [] } } : {};
}

function recommendationLabel(value: string) {
  return {
    IMPACT_LOGIC_ROBUST: "Wirkungslogik robust",
    IMPACT_LOGIC_CONDITIONAL: "Wirkungslogik bedingt tragfähig",
    PILOT_RECOMMENDED: "Erprobung empfohlen",
    REWORK_BEFORE_DECISION: "Vor Entscheidung nacharbeiten",
    CURRENTLY_NOT_ROBUST: "Derzeit nicht robust",
    NO_ROBUST_RECOMMENDATION: "Keine belastbare Empfehlung"
  }[value] ?? value.replaceAll("_", " ");
}

function readableAssessmentSummary(summary: Record<string, unknown>) {
  const candidates = [summary.public_summary, summary.summary, summary.explanation];
  return candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? null;
}

function PublishedDecisionPage({ item }: { item: PublishedPortalCaseDetail }) {
  const assessmentSummary = item.assessment ? readableAssessmentSummary(item.assessment.summary) : null;
  return <div className="container decision-page">
    <nav className="breadcrumb" aria-label="Pfad"><Link href="/entscheidungen">Entscheidungen</Link><span aria-hidden="true">/</span><span>{item.title}</span></nav>
    <header className="decision-header"><div><p className="kicker">Veröffentlichter Wirkungscheck</p><h1>{item.title}</h1>{item.originalTitle ? <p className="original-title">{item.originalTitle}</p> : null}<p className="lead">Diese Veröffentlichung trennt amtliche Fakten, Wirkungsanalyse, normative Einordnung und verbleibende Unsicherheit.</p></div><aside className="decision-status"><span className="chip chip--verified">VERÖFFENTLICHT</span><dl><div><dt>Entscheidung</dt><dd>{item.decisionDate ? formatDate(item.decisionDate) : "Datum in der amtlichen Quelle"}</dd></div><div><dt>Aktualisiert</dt><dd>{formatDate(item.lastUpdated)}</dd></div><div><dt>Fassung</dt><dd>{item.source?.isFinalVotingVersion ? "finale Abstimmungsfassung" : "analysierte Fassung"}</dd></div><div><dt>Methodik</dt><dd>{item.assessment?.methodVersion ?? "im Manifest ausgewiesen"}</dd></div></dl></aside></header>
    <section id="60-sekunden" className="sixty-second" aria-labelledby="published-sixty-title"><div className="sixty-heading"><p className="kicker">60 Sekunden</p><h2 id="published-sixty-title">Die geprüfte Einordnung</h2></div><dl className="sixty-grid"><div><dt>Was wurde entschieden?</dt><dd>{item.factPackage?.decisionObject ?? "Der freigegebene Entscheidungsgegenstand ist im Fachdossier dokumentiert."}</dd></div><div><dt>Parlamentarischer Stand</dt><dd>{item.factPackage?.parliamentaryStatus ?? "Amtliche Fassung liegt dem Check zugrunde."}</dd></div><div><dt>Offizielles Ziel</dt><dd>{item.factPackage?.officialObjective ?? "Im geprüften Faktpaket nicht als eigenständiges Ziel ausgewiesen."}</dd></div><div><dt>Fachliche Einordnung</dt><dd>{assessmentSummary ?? "Die methodische Herleitung und die offenen Punkte sind im Fachdossier ausgewiesen."}</dd></div><div className="sixty-recommendation"><dt>Empfehlungskategorie</dt><dd>{item.recommendation ? recommendationLabel(item.recommendation.category) : "Keine Empfehlungskategorie veröffentlicht."}</dd></div></dl></section>
    <section id="dossier" className="panel dossier"><p className="kicker">Fachdossier</p><h2>Quellen, Methode und Grenzen</h2><article className="dossier-level level--fact"><p>Sachverhalt</p><h3>Amtliche Grundlage</h3><span>{item.source ? <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.publisher}: {item.source.versionLabel} vom {formatDate(item.source.publishedOn)}</a> : "Die Quellenreferenz wird mit der Veröffentlichung mitgeführt."}</span></article><article className="dossier-level level--analysis"><p>Wirkungsanalyse</p><h3>Versionierte Herleitung</h3><span>{item.assessment ? `Methode ${item.assessment.methodVersion} · Regelwerk ${item.assessment.rulesetVersion} · Herleitung: ${item.assessment.provenance}.` : "Kein unversionierter Kurzschluss: Die Analyse wird nur mit ausgewiesenem Method- und Referenzstand veröffentlicht."}</span></article><article className="dossier-level level--assessment"><p>WÖk-Bewertung</p><h3>Grenzen bleiben sichtbar</h3><span>{item.recommendation ? `Evidenzstatus: ${item.recommendation.evidenceStatus.replaceAll("_", " ")} · Grenzstatus: ${item.recommendation.boundaryStatus.replaceAll("_", " ")}.` : "Keine Empfehlung wird aus einer bloßen Import- oder KI-Information erzeugt."}</span></article></section>
    <section className="panel"><p className="kicker">Prüfbarkeit</p><h2>Was dieses Ergebnis verändern könnte</h2><p>Quellenstand, Methodenversion, Wirkpfade, Rechenannahmen und offene Evidenz werden versioniert. Eine neue Fassung oder substanzielle neue Evidenz löst eine erneute fachliche Prüfung aus; frühere Veröffentlichungen werden nicht still überschrieben.</p></section>
  </div>;
}

export default async function DecisionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ modus?: string }> }) {
  const { slug } = await params;
  const { modus } = await searchParams;
  const item = getCase(slug);
  if (!item) {
    const published = await getPublishedPortalCase(slug);
    if (!published) notFound();
    return <PublishedDecisionPage item={published} />;
  }
  const parliamentMode = modus === "parlament";
  return <div className="container decision-page">
    <nav className="breadcrumb" aria-label="Pfad"><Link href="/entscheidungen">Entscheidungen</Link><span aria-hidden="true">/</span><span>{item.plainTitle}</span></nav>
    <header className="decision-header"><div><p className="kicker">{item.editorialStatus === "DEMONSTRATOR" ? "Synthetischer Demonstrator" : "Redaktionelle Befüllung erforderlich"}</p><div className="mode-label" aria-label={`Ansicht: ${parliamentMode ? "Für Parlament" : "Für alle"}`}>{parliamentMode ? "Für Parlament" : "Für alle"}</div><h1>{item.plainTitle}</h1><p className="original-title">{item.title}</p><p className="lead">{item.summary}</p></div><aside className="decision-status"><span className={`chip chip--${item.statusVerification.toLowerCase()}`}>{item.statusVerification}</span><dl><div><dt>Phase</dt><dd>{item.phaseLabel}</dd></div><div><dt>Termin</dt><dd>{item.termLabel}</dd></div><div><dt>Wirkungsrelevanz</dt><dd>{materialityLabel(item.materiality)}</dd></div><div><dt>Analysierte Fassung</dt><dd>{item.versionNote}</dd></div></dl>{item.changedSinceLastAnalysis ? <p className="changed-marker">Seit letzter Analyse geändert</p> : null}</aside></header>
    <nav className="stepper" aria-label="Verfahrensstand">{steps.map((step, index) => <div key={step} aria-current={step === item.phaseLabel ? "step" : undefined}><span>{index + 1}</span><strong>{step}</strong><small>{step === item.phaseLabel ? "Aktueller Stand" : index === 0 ? "Abgeschlossen oder nicht anwendbar" : "Noch nicht verifiziert"}</small></div>)}</nav>
    <p className="final-version">Finale Abstimmungsfassung: <strong>{item.finalVotingVersionVerified === true ? "verifiziert" : item.finalVotingVersionVerified === false ? "nicht verifiziert" : "nicht anwendbar / ausstehend"}</strong></p>

    <section id="60-sekunden" className="sixty-second" aria-labelledby="sixty-title"><div className="sixty-heading"><p className="kicker">60 Sekunden</p><h2 id="sixty-title">Die kurze Einordnung</h2></div><dl className="sixty-grid">
      <div><dt>Was wird entschieden?</dt><dd>{item.whatIsDecided}</dd></div><div><dt>Wann?</dt><dd>{item.termLabel}</dd></div><div><dt>Stand</dt><dd>{item.parliamentaryStatus}</dd></div><div><dt>Was ändert sich unmittelbar?</dt><dd>{item.immediateChange}</dd></div><div><dt>Welches Ziel?</dt><dd>{item.intendedGoal}</dd></div><div><dt>Wirkpfad in Kürze</dt><dd>{item.impactPath.slice(0, 2).map((station) => station.station).join(" → ")}</dd></div><div><dt>Größte Chance</dt><dd>{item.biggestChance}</dd></div><div><dt>Größtes Risiko</dt><dd>{item.biggestRisk}</dd></div><div><dt>Wichtigste Unsicherheit</dt><dd>{item.mainUncertainty}</dd></div><div className="sixty-recommendation"><dt>Empfehlung</dt><dd>Keine belastbare Empfehlung veröffentlicht. Die vier Pflichtfelder für eine Empfehlung sind nicht vollständig freigegeben.</dd></div>
    </dl></section>

    <section id="wirkpfad" className="panel"><p className="kicker">Wirkpfad</p><h2>Welche Veränderungen wären zu prüfen?</h2><div className="impact-scroll"><ol className="impact-path">{item.impactPath.slice(0, 5).map((station, index) => <li key={station.station}><span className="station-number">{index + 1}</span><p>{station.station}</p><span className={`evidence evidence--${station.evidenceClass.toLowerCase()}`}>{evidenceLabel(station.evidenceClass)}</span>{station.possibleBreak ? <strong className="possible-break">Mögliche Bruchstelle: {station.possibleBreak}</strong> : null}</li>)}</ol></div><details className="linear-alternative"><summary>Lineare Textalternative zum Wirkpfad</summary><ol>{item.impactPath.map((station) => <li key={station.station}>{station.station} ({evidenceLabel(station.evidenceClass)})</li>)}</ol></details></section>
    <ScenarioPanel />
    <section id="dossier" className="panel dossier"><p className="kicker">Fachdossier</p><h2>Prüfen, erklären, begrenzen</h2><article className="dossier-level level--fact"><p>Sachverhalt</p><h3>Was steht in der betrachteten Fassung?</h3><span>{item.whatIsDecided}</span></article><article className="dossier-level level--analysis"><p>Wirkungsanalyse</p><h3>Welche Veränderung ist plausibel?</h3><span>{item.impactPath[1]?.station ?? "CONTENT_REQUIRED"}</span></article><article className="dossier-level level--assessment"><p>WÖk-Bewertung</p><h3>Was kann heute fachlich gesagt werden?</h3><span>Ohne verifizierten Fall, vollständige Evidenz und Gegenprüfung wird kein Fachvotum veröffentlicht.</span></article>
      <div className="claim-list"><h3>Behauptungen und Belege</h3>{item.sources.map((source) => <article className="claim" key={source.id}><p><strong>{source.id}</strong> {source.note}</p><details><summary>Quelle ansehen</summary><dl><div><dt>Quelle</dt><dd><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></dd></div><div><dt>Institution</dt><dd>{source.publisher}</dd></div><div><dt>Datum</dt><dd>{formatDate(source.sourceDate)}</dd></div><div><dt>Passage</dt><dd>{source.excerpt}</dd></div><div><dt>Evidenzklasse</dt><dd>{evidenceLabel(source.evidenceClass)}</dd></div><div><dt>Gegenquelle</dt><dd>CONTENT_REQUIRED – erst nach fachlicher Gegenprüfung ergänzen.</dd></div></dl></details></article>)}</div>
    </section>
    <section id="gegenprobe" className="rote-linie"><p className="kicker">Nichtkompensation</p><h2>Rote Linien werden nicht verrechnet.</h2><span className="chip">BOUNDARY_REVIEW_REQUIRED</span><p>Ein möglicher Vorteil auf einer Ebene kompensiert keine schwerwiegende Schädigung auf einer anderen. Ob eine rote Linie berührt wird, ist in diesem Demonstrator nicht bewertet.</p></section>
    <section className="recommendation"><p className="kicker">WÖk-Fachvotum</p><h2>Keine belastbare Empfehlung</h2><p>Für die Veröffentlichung fehlen mindestens vier Pflichtfelder: begründende Punkte, Änderungskriterium, stärkstes Gegenargument und der verbleibende politische Spielraum.</p><dl><div><dt>Warum?</dt><dd>CONTENT_REQUIRED</dd></div><div><dt>Was würde sie ändern?</dt><dd>CONTENT_REQUIRED</dd></div><div><dt>Stärkstes Gegenargument</dt><dd>CONTENT_REQUIRED</dd></div><div><dt>Was bleibt politisch?</dt><dd>CONTENT_REQUIRED</dd></div></dl></section>
    <section id="region" className="panel regional"><p className="kicker">Regionale Rückkopplung</p><h2>Keine passende Kennzahl freigegeben</h2><p><span className="chip">DATA_GAP</span> Solange keine belastbare territoriale Zuordnung und Kennzahl existiert, zeigt das Portal keine vermeintlich lokale Wirkung.</p><dl><div><dt>Quelle</dt><dd>ausstehend</dd></div><div><dt>Beobachtungszeitpunkt</dt><dd>ausstehend</dd></div><div><dt>Territorialebene</dt><dd>ausstehend</dd></div><div><dt>Genauigkeit</dt><dd>is_exact / is_proxy: ausstehend</dd></div></dl></section>
    <section id="werkzeuge" className="panel tools"><p className="kicker">Kontextueller Werkzeugkasten</p><h2>Bestehende WÖk-Werkzeuge</h2><p>Je nach Falltyp werden vorhandene Instrumente verlinkt, nicht nachgebaut.</p><div><a href="https://wirkungsoekonomie.de/anwendungen/produktwirkungsrechner/">Produktwirkungsrechner</a><a href="https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/">SDG-/SDG+-Referenzrahmen</a><a href="https://wirkungsoekonomie.de/bibliothek/">WÖk-Bibliothek</a></div></section>
    <AiConsent />
    <section id="versionen" className="panel versions"><p className="kicker">Fassungshistorie</p><h2>Kein stiller Versionswechsel</h2><ol><li><span className="version-dot version-dot--material" /><div><strong>{formatDate(item.lastUpdated)}</strong><p>{item.versionNote}</p><span className="chip">MATERIAL</span> <Link href={`/entscheidungen/${item.slug}/fassung/demonstrator-v1`}>Warum diese Fassung?</Link></div></li></ol></section>
    <aside className="trust-card"><p className="kicker">Prüfbar bleiben</p><h2>Analyse- und Vertrauensdaten</h2><dl><div><dt>Analysierte Fassung</dt><dd>{item.versionNote}</dd></div><div><dt>Stand</dt><dd>{formatDate(item.lastUpdated)}</dd></div><div><dt>Methodenversion</dt><dd>WÖk-Referenzstand: führende Quellen gemäß Statusregister</dd></div><div><dt>Quellenstand</dt><dd>{item.sources.length} technische Ausgangsquelle(n); fallbezogene Quellen: ausstehend</dd></div><div><dt>Redaktion / Gegenprüfung</dt><dd>CONTENT_REQUIRED</dd></div><div><dt>Korrekturen</dt><dd>Keine veröffentlichten Korrekturen.</dd></div></dl><Link href="/transparenz">Wie dieser Wirkungscheck entsteht</Link></aside>
  </div>;
}

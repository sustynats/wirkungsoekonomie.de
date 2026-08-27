import Link from "next/link";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import { ImpactVisualScenario } from "@/app/components/impact-visuals/ImpactVisualScenario";
import { ExecutiveImpactSummaryView } from "@/app/components/executive-impact/ExecutiveImpactSummary";
import type { SaxonyAnhaltElectionProgramme } from "@/data/sachsen-anhalt-election-programmes";
import {
  saxonyAnhaltCommitmentEditorial,
  saxonyAnhaltProgrammeEditorial,
  type CommitmentEditorialAssessment,
  type ProgrammeDirection,
  type ProgrammeEvidence,
} from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltTerminalPartyBySourceKey, saxonyAnhaltTerminalRelease } from "@/data/presentation/sachsen-anhalt-terminal-release";
import type { CompletePublicationSource as PublicationSource } from "@/lib/publication/fachakten";
import {
  buildSaxonyAnhaltProgrammeModel,
  publicProgrammeStatus,
  summarizeStatuses,
  type ProgrammeCommitment,
} from "@/lib/presentation/sachsen-anhalt-programme-model";
import { getCommunicationMediaImpact, type CommunicationMediaImpactRecord, type CommunicationPattern } from "@/lib/state-programmes/communication-media-impact";
import { saxonyAnhaltImpactVisualRecord } from "@/lib/impact-visuals/records";
import { saxonyAnhaltExecutiveImpactSummary } from "@/lib/executive-impact/sachsen-anhalt";
import { sourceDetailHrefForUrl } from "@/lib/sources/url";
import styles from "./ProgrammeAnalysisBlueprint.module.css";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(date);
}

function compact(value: string | null | undefined, max = 230) {
  const text = value?.replace(/\s+/g, " ").trim() ?? "";
  if (text.length <= max) return text;
  const candidate = text.slice(0, max - 1);
  const cut = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, cut > max * .65 ? cut : candidate.length)}…`;
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function List({ values }: { values: string[] }) {
  if (!values.length) return <p>Keine zusätzliche fachlich freigegebene Angabe.</p>;
  return <ul className={styles.list}>{values.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}</ul>;
}

function directionLabel(direction: ProgrammeDirection) {
  return {
    POSITIVE: "Positives Wirkungspotenzial",
    NEGATIVE: "Negatives Wirkungspotenzial",
    AMBIVALENT: "Ambivalentes Wirkungspotenzial",
    OPEN: "Wirkungsrichtung offen",
  }[direction];
}

function evidenceLabel(evidence: ProgrammeEvidence) {
  return {
    HIGH: "hohe Evidenz",
    MEDIUM: "mittlere Evidenz",
    LOW: "geringe Evidenz",
    NOT_ASSESSABLE: "für die Richtungsbewertung nicht belastbar",
  }[evidence];
}

function CommunicationIcon() {
  return <span className={styles.communicationIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6.5h16v10H9l-5 4v-14Z" /><path d="M8 10h8M8 13h5" /></svg></span>;
}

function OptionalFinding({ label, value }: { label: string; value?: string }) {
  return value ? <p><strong>{label}:</strong> {value}</p> : null;
}

function CommunicationPatternDetail({ pattern }: { pattern: CommunicationPattern }) {
  return <details className={styles.communicationPattern} data-woek-communication-pattern={pattern.pattern_id}>
    <summary>
      <span><strong>{pattern.title}</strong><span className={styles.summaryTeaser}>{pattern.source_locator}</span></span>
    </summary>
    <div className={styles.communicationPatternBody}>
      <blockquote className={styles.quote}><strong>Geprüfte Fundstelle:</strong> {pattern.source_locator}</blockquote>
      <div className={styles.detailGrid}>
        <article className={styles.detailCard}><h4>Kommunikationseinheit</h4><p>{pattern.communication_unit}</p></article>
        <article className={styles.detailCard}><h4>Adressierter Gegenstand</h4><p>{pattern.target_or_referent}</p></article>
      </div>
      <OptionalFinding label="Problemdeutung und Ursachenzuschreibung" value={pattern.problem_definition_and_causal_attribution} />
      <OptionalFinding label="Ingroup/Outgroup" value={pattern.ingroup_outgroup_structure} />
      <OptionalFinding label="Aufmerksamkeit und Agenda" value={pattern.attention_or_agenda_effect} />
      <OptionalFinding label="Emotionale Aktivierung" value={pattern.emotional_activation} />
      <OptionalFinding label="Interpretationswirkung" value={pattern.interpretation_effect} />
      <OptionalFinding label="Resonanz und Verstärkung" value={pattern.resonance_or_amplification} />
      <OptionalFinding label="Normalisierung und Sagbarkeit" value={pattern.normalization_or_sayability_shift} />
      <OptionalFinding label="Stigmatisierungs-/Entmenschlichungsprüfung" value={pattern.stigmatization_or_dehumanization_review} />
      <div className={styles.orderFlow} aria-label="Mögliche Kommunikationswirkungen erster bis dritter Ordnung">
        <article><span>1</span><h4>Erste Ordnung</h4><p>{pattern.first_order}</p></article>
        <article><span>2</span><h4>Zweite Ordnung</h4><p>{pattern.second_order}</p></article>
        <article><span>3</span><h4>Dritte Ordnung</h4><p>{pattern.third_order}</p></article>
      </div>
      <p><strong>Bezug zur demokratischen Resilienz:</strong> {pattern.democratic_resilience_effect}</p>
      <p><strong>Betroffene Schutz- und Resilienzräume:</strong></p><List values={pattern.protected_interests} />
      <OptionalFinding label="Gegenfaktum" value={pattern.counterfactual} />
      <p><strong>Falsifikations-/Reality-Check-Trigger:</strong> {pattern.falsification_recheck_trigger}</p>
      <p><Link href={sourceDetailHrefForUrl(pattern.source_url)}>Quellensteckbrief und Verwendungen ansehen →</Link></p>
    </div>
  </details>;
}

function CommunicationImpactSection({ record }: { record: CommunicationMediaImpactRecord }) {
  return <section id="kommunikationswirkung" aria-labelledby="kommunikationswirkung-title" data-woek-analysis-layer="COMMUNICATION_MEDIA_IMPACT">
    <div className={styles.sectionHeader}>
      <p className={styles.eyebrow}>Eigenständige Analyseachse</p>
      <h2 id="kommunikationswirkung-title">Kommunikationswirkung – Wirkungspotenzial</h2>
      <p className={styles.lead}>Was kann die Sprache des Programms mit Aufmerksamkeit, Deutung, Zugehörigkeit und demokratischer Resilienz machen?</p>
    </div>
    <article className={styles.communicationOverview}>
      <div className={styles.communicationAssessment}>
        <CommunicationIcon />
        <div>
          <p className={styles.eyebrow}>WÖk-Kurzbefund Kommunikationswirkung</p>
          <h3>{record.overview_assessment_label}</h3>
          <p>{record.public_summary}</p>
        </div>
      </div>
      <div className={styles.communicationAxes}>
        <article><p className={styles.eyebrow}>Positive Potenziale</p><List values={record.positive_potentials} /></article>
        <article><p className={styles.eyebrow}>Materielle Risiken</p><List values={record.material_risks} /></article>
      </div>
      <div className={styles.noncompensation}><strong>Nichtkompensation:</strong> {record.noncompensation}</div>
      <p className={styles.axisBoundary}><strong>Zwei getrennte Achsen:</strong> Dieser Befund betrifft die Wirkung politischer Kommunikation. Er bewertet nicht automatisch die Wirkung der vorgeschlagenen Maßnahmen und wird weder mit der Maßnahmenanalyse noch mit einer Parteigesamtnote verrechnet.</p>
    </article>

    <div className={styles.evidenceGrid} aria-label="Evidenzprofil der Kommunikationswirkungsanalyse">
      <article><span aria-hidden="true">Aa</span><h3>Text-Evidenz</h3><p>{record.evidence.text}</p></article>
      <article><span aria-hidden="true">↝</span><h3>Mechanismus</h3><p>{record.evidence.mechanism}</p></article>
      <article><span aria-hidden="true">◌</span><h3>Reichweite / Resonanz</h3><p>{record.evidence.reach_resonance}</p></article>
      <article><span aria-hidden="true">◎</span><h3>Beobachtete Wirkung</h3><p>{record.evidence.observed_outcome}</p></article>
      <article><span aria-hidden="true">≠</span><h3>Zurechnung</h3><p>{record.evidence.attribution}</p></article>
    </div>

    <div className={styles.communicationMeta}>
      <div><strong>Geprüfter Umfang:</strong><p>{record.coverage_scope}</p></div>
      <div><strong>Reifegrad:</strong><p>{record.assessment_maturity}</p></div>
      <div><strong>Offene Prüfungen:</strong><List values={record.open_points} /></div>
    </div>

    <div className={styles.sectionHeader}>
      <p className={styles.eyebrow}>Passagegebundener Deep Dive</p>
      <h3>Vom Wortlaut über den Mechanismus zur prüfbaren Wirkungskaskade.</h3>
      <p>{record.cascade_summary}</p>
    </div>
    <div className={styles.communicationPatternList}>{record.patterns.map((pattern) => <CommunicationPatternDetail key={pattern.pattern_id} pattern={pattern} />)}</div>

    <details className={styles.proof}>
      <summary>Quellen, Fachversion und vollständige Transparenz <span className={styles.summaryTeaser}>{record.source_refs.length} dokumentierte Quellen</span></summary>
      <div className={styles.proofBody}>
        <dl className={styles.metaGrid}>
          <div><dt>Fachversion</dt><dd>{record.communication_review_version}</dd></div>
          <div><dt>Fachstatus</dt><dd>{record.assessment_maturity}</dd></div>
          <div><dt>Coverage</dt><dd>{record.coverage_scope}</dd></div>
          <div><dt>Restore-Status</dt><dd>{record.restore_classification === "HISTORICAL_APPROVED_RESTORE_REQUIRED" ? "Historisch freigegebener Bestand wiederhergestellt" : "Erster materialitätsorientierter Review; Vollscan offen"}</dd></div>
        </dl>
        <ul className={styles.sourceList}>{record.source_refs.map((source) => <li key={`${source.url}-${source.locator}`}><Link href={sourceDetailHrefForUrl(source.url)}>{source.title}</Link><span>{source.locator}</span></li>)}</ul>
        <p><Link href={sourceDetailHrefForUrl(record.fach_source.url)}>Fachhandoff, Quellensteckbrief und Verwendungen ansehen →</Link></p>
      </div>
    </details>
  </section>;
}

function evidenceFromLegacy(commitment: ProgrammeCommitment) {
  return unique(commitment.impactPotentials.map((item) => item.evidence)).map((item) => publicProgrammeStatus(item)).join(" · ") || "keine belastbare Richtungs-Evidenz";
}

function sourceCollisionLikely(commitment: ProgrammeCommitment) {
  const text = commitment.sourceText.replace(/\s+/g, " ");
  return text.length > 700 || /(?:Politische Bildung ausbauen|Inhaltsverzeichnis|\bSeite\s+\d+\b.*\bSeite\s+\d+\b)/i.test(text);
}

function fallbackAssessment(commitment: ProgrammeCommitment): CommitmentEditorialAssessment {
  const collision = sourceCollisionLikely(commitment);
  if (collision) {
    return {
      direction: "OPEN",
      evidence: "NOT_ASSESSABLE",
      keyFinding: "QUELLENTRENNUNG ERFORDERLICH",
      impactCoreSummary: "Der vorliegende Alt-Datensatz enthält Hinweise auf eine zusammengezogene oder überlange Analyseeinheit. Bis die Originalpassage erneut sauber getrennt ist, wird keine positive oder negative Wirkungsrichtung veröffentlicht.",
      editorialSummary: "Die Originalfundstelle bleibt sichtbar, damit der Befund reproduzierbar ist. Der generische Release-1-Wirkpfad wird nicht als aktuelle WÖk-Kurzbewertung verwendet, weil eine fehlerhafte Analyseeinheit auch eine fehlerhafte Wirkungsaussage erzeugen würde.",
      directionRationale: "Die fachliche Einheit ist vor einer Wirkungsbewertung zu validieren.",
      sourceQuality: "SOURCE_COLLISION",
    };
  }
  return {
    direction: "OPEN",
    evidence: "NOT_ASSESSABLE",
    keyFinding: "RICHTUNG NOCH NICHT REDAKTIONELL VERIFIZIERT",
    impactCoreSummary: "Für diese einzelne Zusage liegt im Release-1-Bestand noch keine objektspezifische, redaktionell verifizierte Richtungsbewertung vor. Deshalb wird weder ein positiver noch ein negativer Effekt aus generischen Politikfeld-Templates abgeleitet.",
    editorialSummary: "Originalaussage, Risiken, Datenbedarf und der historische technische Prüpfad bleiben einsehbar. Die aktuelle Lesefassung ist bewusst fail-closed: Erst eine gegenstandsspezifische Nachprüfung darf hier eine Wirkungsrichtung und einen Wirkungskern freigeben.",
    directionRationale: "Fehlende redaktionelle Spezifität ist keine neutrale Wirkung, sondern ein offener Fachstatus.",
    sourceQuality: "REVIEW_REQUIRED",
  };
}

function assessmentFor(sourceKey: string, commitment: ProgrammeCommitment) {
  return saxonyAnhaltCommitmentEditorial(sourceKey, commitment.key) ?? fallbackAssessment(commitment);
}

function CommitmentDetail({ sourceKey, commitment }: { sourceKey: string; commitment: ProgrammeCommitment }) {
  const assessment = assessmentFor(sourceKey, commitment);
  const sourceLocation = [commitment.page ? `Seite ${commitment.page}` : null, commitment.section].filter(Boolean).join(" · ");
  const risk = commitment.impactRisks.find((item) => item.risk)?.risk ?? commitment.boundaryConcerns[0] ?? "Kein einzelnes materielles Risiko aus dem Altbestand belastbar hervorgehoben.";
  const boundary = commitment.boundaryStatus ? publicProgrammeStatus(commitment.boundaryStatus) : commitment.boundaryConcerns.length ? "Schutzprüfung erforderlich" : "keine eigenständige Grenzbewertung veröffentlicht";
  const reviewed = Boolean(saxonyAnhaltCommitmentEditorial(sourceKey, commitment.key));

  return <details className={styles.commitment} data-woek-programme-commitment={commitment.key}>
    <summary>
      <span className={styles.commitmentSummary}>
        <span className={styles.index}>{commitment.index}</span>
        <span>
          <span className={styles.commitmentTitle}>{commitment.title}</span>
          <span className={styles.badgeRow}>
            <span className={styles.badge} data-direction={assessment.direction}>{directionLabel(assessment.direction)}</span>
            <span className={styles.metaChip}>{evidenceLabel(assessment.evidence)}</span>
            {reviewed ? <span className={styles.metaChip}>Editorial v2.0 geprüft</span> : <span className={styles.qualityChip}>Nachprüfung offen</span>}
          </span>
          <span className={styles.summaryTeaser}>{assessment.impactCoreSummary}</span>
        </span>
      </span>
    </summary>
    <div className={styles.commitmentBody}>
      <div className={styles.detailGrid} aria-label="Zusammenfassende WÖk-Bewertung">
        <article className={styles.detailCard}><h4>Wirkungsrichtung</h4><p><strong>{directionLabel(assessment.direction)}</strong></p></article>
        <article className={styles.detailCard}><h4>Evidenz</h4><p>{evidenceLabel(assessment.evidence)}</p></article>
        <article className={styles.detailCard}><h4>Key Finding</h4><p>{assessment.keyFinding}</p></article>
        <article className={styles.detailCard}><h4>Entscheidungsreife</h4><p>{commitment.readinessLabel}</p></article>
      </div>
      <p className={styles.editorialSummary}><strong>WÖk-Einordnung:</strong> {assessment.editorialSummary}</p>
      <p><strong>Warum diese Richtung?</strong> {assessment.directionRationale}</p>
      {assessment.competenceNote && <p><strong>Zuständigkeit:</strong> {assessment.competenceNote}</p>}
      <blockquote className={styles.quote}><strong>Originalaussage:</strong> {commitment.sourceText}</blockquote>

      {!reviewed && <div className={styles.legacyWarning}><strong>Qualitätshinweis:</strong> Der alte automatisch strukturierte Wirkpfad wird nicht mehr als aktuelle Kurzbewertung verwendet. Er bleibt unten ausschließlich als historischer/technischer Prüfnachweis einsehbar. Die aktuelle Wirkungseinordnung bleibt bis zur objektspezifischen Nachprüfung offen.</div>}

      <div className={styles.nestedList}>
        <details className={styles.nested}>
          <summary>Risiken und Schutzgrenzen <span className={styles.summaryTeaser}>{compact(risk)}</span></summary>
          <div className={styles.nestedBody}>
            {commitment.impactRisks.length ? commitment.impactRisks.map((item, index) => <article key={`${commitment.key}-risk-${index}`}>
              {item.risk && <p><strong>Risiko:</strong> {item.risk}</p>}
              {item.trigger && <p><strong>Wann relevant:</strong> {item.trigger}</p>}
              {item.affected.length > 0 && <List values={item.affected} />}
            </article>) : <p>Kein einzelnes Risiko ist im Altbestand spezifisch genug ausgewiesen.</p>}
            <p><strong>Schutzgrenzen-Status:</strong> {boundary}</p>
            {commitment.boundaryConcerns.length > 0 && <List values={commitment.boundaryConcerns} />}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>Betroffene, Verteilung und Zeit <span className={styles.summaryTeaser}>{compact(commitment.affectedGroups[0] ?? commitment.distributionNote, 180)}</span></summary>
          <div className={styles.nestedBody}>
            {commitment.affectedGroups.length > 0 && <><p><strong>Betroffene:</strong></p><List values={commitment.affectedGroups} /></>}
            {commitment.distributionNote && <p><strong>Verteilung:</strong> {commitment.distributionNote}</p>}
            {commitment.shortTerm && <p><strong>Kurzfristig:</strong> {commitment.shortTerm}</p>}
            {commitment.mediumTerm && <p><strong>Mittelfristig:</strong> {commitment.mediumTerm}</p>}
            {commitment.longTerm && <p><strong>Langfristig:</strong> {commitment.longTerm}</p>}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>Zuständigkeit, Umsetzung und Daten <span className={styles.summaryTeaser}>{compact(assessment.competenceNote ?? commitment.missingParameters[0] ?? commitment.primaryIndicator, 180)}</span></summary>
          <div className={styles.nestedBody}>
            <dl className={styles.facts}>
              <div><dt>Umsetzungsebene</dt><dd>{commitment.implementationLevel ?? "im Einzelfall zu prüfen"}</dd></div>
              <div><dt>Vollzugskapazität</dt><dd>{publicProgrammeStatus(commitment.capacityStatus, "noch nicht belastbar beurteilt")}</dd></div>
              <div><dt>Reversibilität</dt><dd>{publicProgrammeStatus(commitment.reversibility, "im konkreten Design zu prüfen")}</dd></div>
              <div><dt>Legacy-Evidenz</dt><dd>{evidenceFromLegacy(commitment)}</dd></div>
            </dl>
            {commitment.responsibleActors.length > 0 && <><p><strong>Zuständige Akteure:</strong></p><List values={commitment.responsibleActors} /></>}
            {commitment.missingParameters.length > 0 && <><p><strong>Offene Ausgestaltung:</strong></p><List values={commitment.missingParameters} /></>}
            {commitment.dataGaps.length > 0 && <><p><strong>Datenlücken:</strong></p><List values={commitment.dataGaps} /></>}
            {commitment.primaryIndicator && <p><strong>Leitindikator:</strong> {commitment.primaryIndicator}</p>}
            {commitment.earliestReview && <p><strong>Frühester Reality Check:</strong> {commitment.earliestReview}</p>}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>Mensch, Planet, Demokratie und Referenzrahmen</summary>
          <div className={styles.nestedBody}>
            {commitment.human.length > 0 && <><p><strong>Mensch:</strong></p><List values={commitment.human} /></>}
            {commitment.planet.length > 0 && <><p><strong>Planet:</strong></p><List values={commitment.planet} /></>}
            {commitment.democracy.length > 0 && <><p><strong>Demokratie:</strong></p><List values={commitment.democracy} /></>}
            {commitment.sdgs.length > 0 && <><p><strong>SDGs:</strong></p><List values={commitment.sdgs} /></>}
            {commitment.sdgPlus.length > 0 && <><p><strong>WÖk-SDG+:</strong></p><List values={commitment.sdgPlus} /></>}
          </div>
        </details>

        <details className={styles.nested} data-woek-technical-proof="legacy-programme-path">
          <summary>Historischer Release-1-Prüfpfad <span className={styles.summaryTeaser}>Für Reproduzierbarkeit - nicht als aktuelle Kurzbewertung.</span></summary>
          <div className={styles.nestedBody}>
            {commitment.impactPotentials.map((potential, index) => <article key={`${commitment.key}-legacy-${index}`}>
              {potential.stateChange && <p><strong>Altbestand - mögliche Zustandsänderung:</strong> {potential.stateChange}</p>}
              {potential.mechanism && <p><strong>Altbestand - Mechanismus:</strong> {potential.mechanism}</p>}
              {potential.evidence && <p><strong>Altbestand - Evidenz:</strong> {publicProgrammeStatus(potential.evidence)}</p>}
            </article>)}
            {commitment.firstOrder && <p><strong>Altbestand - erste Ordnung:</strong> {commitment.firstOrder}</p>}
            {commitment.secondOrder.length > 0 && <List values={commitment.secondOrder} />}
            {commitment.thirdOrder && <p><strong>Altbestand - dritte Ordnung:</strong> {commitment.thirdOrder}</p>}
          </div>
        </details>
      </div>
    </div>
  </details>;
}

export function SaxonyAnhaltProgrammeAnalysisV3({ programme, review, commitments }: {
  programme: SaxonyAnhaltElectionProgramme;
  review: PublicationSource;
  commitments: PublicationSource;
}) {
  const model = buildSaxonyAnhaltProgrammeModel(review.markdown, commitments.markdown);
  const editorial = saxonyAnhaltProgrammeEditorial(programme.sourceKey);
  if (!editorial) throw new Error(`Missing Sachsen-Anhalt programme editorial v2 for ${programme.sourceKey}`);
  const terminalParty = saxonyAnhaltTerminalPartyBySourceKey.get(programme.sourceKey);
  if (!terminalParty) throw new Error(`Missing terminal Sachsen-Anhalt release record for ${programme.sourceKey}`);
  const communicationImpact = getCommunicationMediaImpact(programme.sourceKey);
  if (!communicationImpact) throw new Error(`Missing Sachsen-Anhalt communication-media impact for ${programme.sourceKey}`);
  const programmeVisual = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "PROGRAM_SCENARIO");
  const caseVisual = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "CASE_SCENARIO");
  if (!programmeVisual || !caseVisual) throw new Error(`Missing Sachsen-Anhalt impact visual contract for ${programme.sourceKey}`);
  const counts = summarizeStatuses(model.commitments);
  const decisionDate = formatDate(programme.decisionDate);
  const groups = new Map<string, ProgrammeCommitment[]>();
  for (const commitment of model.commitments) {
    const domain = commitment.policyDomain ?? "Weitere Themen / Zuordnung offen";
    groups.set(domain, [...(groups.get(domain) ?? []), commitment]);
  }
  const grouped = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "de"));
  const reviewedCount = Object.keys(editorial.centralAssessments).length;
  const executiveSummary = saxonyAnhaltExecutiveImpactSummary({ sourceKey: programme.sourceKey, model, editorial, communication: communicationImpact });

  return <div className={styles.page} data-woek-sachsen-anhalt-public="programme-blueprint-v3">
    <section className={styles.hero}>
      <div className={styles.heroMain}>
        <p className={styles.eyebrow}>Landtagswahl Sachsen-Anhalt 2026 · WÖk-Wahlprogrammanalyse</p>
        <h1>{programme.party}</h1>
        <p className={styles.lead}>{programme.title}</p>
      </div>
    </section>

    <ExecutiveImpactSummaryView summary={executiveSummary} afterEvidence={<ImpactVisualScenario record={programmeVisual} />} />

    <nav className={styles.jumpNav} aria-label="Sprungnavigation der Wahlprogrammanalyse">
      <a href="#gesamtbefund">Gesamtzusammenfassung</a>
      <a href="#wirkungsbild">Wirkungsbild</a>
      <a href="#schluesselpfade">Key Findings</a>
      <a href="#wirkungsbild-fallvertiefung">Fallvertiefung</a>
      <a href="#kommunikationswirkung">Kommunikationswirkung</a>
      <a href="#vollstaendige-wirkungsakte">Alle Einzelanalysen</a>
      <a href="#vollstaendiges-zusageregister">Originalzusagen</a>
      <a href="#quellenstatus">Quellen & Fachstand</a>
    </nav>

    <ImpactVisualScenario record={caseVisual} />

    <CommunicationImpactSection record={communicationImpact} />

    <section id="woek-kurzbewertung" aria-labelledby="kurzstatus-title">
      <div className={styles.sectionHeader}><p className={styles.eyebrow}>Analyseumfang</p><h2 id="kurzstatus-title">Was ist geprüft - und was bleibt offen?</h2></div>
      <div className={styles.detailGrid}>
        <article className={styles.detailCard}><h4>Terminale Quellenbasis</h4><p><strong>{terminalParty.authoritative_source_unit_count.toLocaleString("de-DE")}</strong> autoritative Source Units · volle Primärquellen-Parität</p></article>
        <article className={styles.detailCard}><h4>Wirkungsmechanismen</h4><p><strong>{terminalParty.authoritative_effect_mechanism_count.toLocaleString("de-DE")}</strong> effekttragende Blätter · {terminalParty.non_effect_source_leaf_count.toLocaleString("de-DE")} nicht-wirkungstragende Source Leaves</p></article>
        <article className={styles.detailCard}><h4>Entscheidungsreife</h4><p>{counts.readiness.slice(0, 2).map(([status, count]) => `${count} ${publicProgrammeStatus(status)}`).join(" · ") || "offen"}</p></article>
        <article className={styles.detailCard}><h4>Schutzgrenzen</h4><p><strong>{counts.boundaries.toLocaleString("de-DE")}</strong> Zusagen mit ausgewiesener Schutzprüfung im Altbestand</p></article>
        <article className={styles.detailCard}><h4>Executive-Auswahl</h4><p><strong>{executiveSummary.material_paths.length}</strong> materielle Pfade aus dem terminalen Vollbestand ausgewählt; nicht nach Reihenfolge und nicht als Parteipunktzahl</p></article>
        <article className={styles.detailCard}><h4>Objektdetail Editorial v2.0</h4><p><strong>{reviewedCount}</strong> historische Einzelpfade besitzen zusätzlich eine objektspezifische Detailredaktion; daraus wird keine Vollprogramm-Repräsentativität abgeleitet</p></article>
      </div>
      <aside className={styles.heroAside} aria-label="Prozess- und Versionsnachweis">
        <p className={styles.eyebrow}>Prozessdaten nach dem Wirkungsbefund</p>
        <dl>
          <div><dt>Autoritative Source Units</dt><dd>{terminalParty.authoritative_source_unit_count.toLocaleString("de-DE")}</dd></div>
          <div><dt>Quellengebundene Wirkungsmechanismen</dt><dd>{terminalParty.authoritative_effect_mechanism_count.toLocaleString("de-DE")}</dd></div>
          <div><dt>Historischer Release-1-Arbeitsbestand</dt><dd>{model.commitmentCount.toLocaleString("de-DE")} · getrennte Zähldimension</dd></div>
          <div><dt>Analyseperspektive</dt><dd>Ex ante – Wirkungspotenzial, keine behauptete Ist-Wirkung</dd></div>
          {decisionDate && <div><dt>Programmbeschluss</dt><dd>{decisionDate}</dd></div>}
        </dl>
      </aside>
      {model.implementationBoundary && <p className={styles.editorialSummary}><strong>Zuständigkeit:</strong> {model.implementationBoundary}</p>}
      <div className={styles.chips}>{model.policyDomains.map((domain) => <span className={styles.metaChip} key={domain}>{domain}</span>)}</div>
    </section>

    <section id="vollstaendige-wirkungsakte" aria-labelledby="einzel-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Einzelanalysen</p>
        <h2 id="einzel-title">Vom schnellen Befund in die Tiefe.</h2>
        <p className={styles.lead}>Jede Zusage beginnt mit Wirkungsrichtung, Evidenz, Key Finding und Entscheidungsreife. Nicht verifizierte Alt-Templates werden nicht mehr als Kurzbewertung ausgegeben.</p>
      </div>
      <div className={styles.auditNotice}><strong>Themenzuordnung im Re-Audit</strong><p>Die Gruppierung übernimmt vorläufig die technische Themenzuordnung des Release-1-Registers. Wo Originaltext und Zuordnung kollidieren, hat der Originaltext Vorrang; die Zuordnung ist kein fachliches Urteil.</p></div>
      <div className={styles.domainList}>
        {grouped.map(([domain, entries]) => <details className={styles.domain} key={domain}>
          <summary>{domain} · {entries.length.toLocaleString("de-DE")} Zusagen <span className={styles.summaryTeaser}>Öffnen für Einzelbefunde</span></summary>
          <div className={styles.domainBody}><div className={styles.commitmentList}>{entries.map((commitment) => <div id={`commitment-${commitment.index}`} key={commitment.key}><CommitmentDetail sourceKey={programme.sourceKey} commitment={commitment} /></div>)}</div></div>
        </details>)}
      </div>
    </section>

    <section id="vollstaendiges-zusageregister" aria-labelledby="register-title">
      <div className={styles.sectionHeader}><p className={styles.eyebrow}>Historisches Zusageregister</p><h2 id="register-title">Quelle vor Interpretation.</h2><p>Der versionierte Release-1-Arbeitsbestand bleibt vollständig nachvollziehbar erhalten. Er umfasst {model.commitments.length.toLocaleString("de-DE")} historische Einträge und wird nicht mit dem terminalen Nenner von {terminalParty.authoritative_source_unit_count.toLocaleString("de-DE")} autoritativen Source Units verrechnet.</p></div>
      <details className={styles.proof}><summary>Historisches Arbeitsregister öffnen <span className={styles.summaryTeaser}>{model.commitments.length.toLocaleString("de-DE")} unveränderte Release-1-Einträge</span></summary><div className={styles.proofBody}>
        {model.commitments.map((commitment) => <p key={`register-${commitment.key}`}><strong>{commitment.index}.</strong> {commitment.sourceText}{commitment.page ? ` · Seite ${commitment.page}` : ""}</p>)}
      </div></details>
    </section>

    <section id="quellenstatus" aria-labelledby="quellenstatus-title">
      <div className={styles.sectionHeader}><p className={styles.eyebrow}>Quelle, Version und Transparenz</p><h2 id="quellenstatus-title">Altbestand bleibt reproduzierbar - aktuelle Lesefassung bleibt qualitätsgesichert.</h2></div>
      <dl className={styles.metaGrid}>
        <div><dt>Dokumentstatus</dt><dd>{programme.documentStatus === "BESCHLOSSEN" ? "Beschlossenes Wahlprogramm" : "Veröffentlichte Webfassung"}</dd></div>
        <div><dt>Quellenformat</dt><dd>{programme.sourceFormat}</dd></div>
        <div><dt>Release-1-Fachstand</dt><dd>{formatDate(review.verifiedAt) ?? review.verifiedAt}</dd></div>
        <div><dt>Aktuelle Editorial-Schicht</dt><dd>WÖk Wahlprogramm-Blaupause v{editorial.version}</dd></div>
        <div><dt>Terminaler Quellenstatus</dt><dd>6/6 · volle Primärquellen-Parität</dd></div>
        <div><dt>Manifest-Nachweis</dt><dd>{terminalParty.manifest_content_sha256}</dd></div>
      </dl>
      <p><small>Landesweiter Terminal-Release: {saxonyAnhaltTerminalRelease.release_descriptor_sha256}</small></p>
      <p><Link href="/laender/sachsen-anhalt/quellen">Originalquellen und Programmnachweise öffnen →</Link></p>
    </section>

    <details className={styles.proof}>
      <summary>Fachlicher Vollnachweis und technische Prüfinformationen <span className={styles.summaryTeaser}>Historische Fachquelle vollständig erhalten.</span></summary>
      <div className={styles.proofBody} data-woek-technical-proof="programme-full-source">
        <p>Die neue Lesefassung überschreibt keine historische Analyse. Für Reproduzierbarkeit bleiben die autorisierten Release-1-Fachquellen unverändert abrufbar.</p>
        <CompletePublicationSource source={review} idPrefix="fachlicher-vollnachweis-wirkungsakte" />
        <CompletePublicationSource source={commitments} idPrefix="fachlicher-vollnachweis-zusageregister" />
      </div>
    </details>

    <p><Link href="/laender/sachsen-anhalt">← Zurück zur Übersicht Sachsen-Anhalt</Link></p>
  </div>;
}

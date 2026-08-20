import Link from "next/link";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import type { SaxonyAnhaltElectionProgramme } from "@/data/sachsen-anhalt-election-programmes";
import {
  saxonyAnhaltCommitmentEditorial,
  saxonyAnhaltProgrammeEditorial,
  type CommitmentEditorialAssessment,
  type ProgrammeDirection,
  type ProgrammeEvidence,
  type ProgrammeFindingKind,
} from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import type { CompletePublicationSource as PublicationSource } from "@/lib/publication/fachakten";
import {
  buildSaxonyAnhaltProgrammeModel,
  publicProgrammeStatus,
  summarizeStatuses,
  type ProgrammeCommitment,
} from "@/lib/presentation/sachsen-anhalt-programme-model";
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

function DirectionIcon({ direction }: { direction: ProgrammeDirection }) {
  const path = direction === "POSITIVE"
    ? "M5 17 17 5M9 5h8v8"
    : direction === "NEGATIVE"
      ? "M5 7 17 19M9 19h8v-8"
      : direction === "AMBIVALENT"
        ? "M5 12h5m0 0 5-5m-5 5 5 5m0-10h4m-4 10h4"
        : "M9.4 8.5a3.1 3.1 0 1 1 4.9 2.5c-1.4 1-2.3 1.5-2.3 3M12 18h.01";
  return <span className={styles.directionIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg></span>;
}

function FindingIcon({ kind }: { kind: ProgrammeFindingKind }) {
  const path = kind === "positive"
    ? "m6 12 4 4 8-9"
    : kind === "risk"
      ? "M12 3 3.5 19h17L12 3Zm0 5v5m0 3h.01"
      : kind === "tradeoff"
        ? "M4 8h6l4 8h6M4 16h6l4-8h6"
        : "M9.4 8.5a3.1 3.1 0 1 1 4.9 2.5c-1.4 1-2.3 1.5-2.3 3M12 18h.01";
  return <span className={styles.signalIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg></span>;
}

function DirectionBadge({ direction }: { direction: ProgrammeDirection }) {
  return <span className={styles.badge} data-direction={direction}><DirectionIcon direction={direction} />{directionLabel(direction)}</span>;
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

function SummaryProfile({ assessments }: { assessments: CommitmentEditorialAssessment[] }) {
  const directions: ProgrammeDirection[] = ["POSITIVE", "NEGATIVE", "AMBIVALENT", "OPEN"];
  const counts = Object.fromEntries(directions.map((direction) => [direction, assessments.filter((item) => item.direction === direction).length])) as Record<ProgrammeDirection, number>;
  const total = Math.max(1, assessments.length);
  return <aside className={styles.profilePanel} aria-label="Richtungsprofil der redaktionell geprüften Schlüsselpfade">
    <p className={styles.eyebrow}>Richtungsprofil</p>
    <h3>Nur die nachgeprüften Schlüsselpfade</h3>
    <p>Das Diagramm ist kein Parteiscore. Es zeigt ausschließlich die Richtungen der hier redaktionell nachgeprüften Schlüsselpfade.</p>
    <div className={styles.barList}>
      {directions.map((direction) => <div className={styles.barRow} key={direction}>
        <span>{directionLabel(direction)}</span>
        <progress className={styles.barTrack} aria-hidden="true" value={counts[direction]} max={total} />
        <strong>{counts[direction]}</strong>
      </div>)}
    </div>
  </aside>;
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
  const counts = summarizeStatuses(model.commitments);
  const decisionDate = formatDate(programme.decisionDate);
  const centralAssessments = Object.values(editorial.centralAssessments);
  const byKey = new Map(model.commitments.map((commitment) => [commitment.key, commitment]));
  const central = Object.keys(editorial.centralAssessments).map((key) => byKey.get(key)).filter((item): item is ProgrammeCommitment => Boolean(item));
  const groups = new Map<string, ProgrammeCommitment[]>();
  for (const commitment of model.commitments) {
    const domain = commitment.policyDomain ?? "Weitere Themen / Zuordnung offen";
    groups.set(domain, [...(groups.get(domain) ?? []), commitment]);
  }
  const grouped = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "de"));
  const reviewedCount = Object.keys(editorial.centralAssessments).length;

  return <div className={styles.page} data-woek-sachsen-anhalt-public="programme-blueprint-v3">
    <section className={styles.hero}>
      <div className={styles.heroMain}>
        <p className={styles.eyebrow}>Landtagswahl Sachsen-Anhalt 2026 · WÖk-Wahlprogrammanalyse</p>
        <h1>{programme.party}</h1>
        <p className={styles.lead}>{programme.title}</p>
        <p>{editorial.impactCoreSummary}</p>
        <div className={styles.heroActions}>
          <a href="#gesamtbefund">Gesamtbefund</a>
          <a href="#schluesselpfade">Schlüsselpfade</a>
          <a href="#vollstaendige-wirkungsakte">Einzelprüfungen</a>
        </div>
      </div>
      <aside className={styles.heroAside} aria-label="Analyse auf einen Blick">
        <p className={styles.eyebrow}>Auf einen Blick</p>
        <h2>Keine Wahlempfehlung. Keine Partei-Gesamtnote.</h2>
        <p>Bewertet werden konkrete Vorschläge, Wirkpfade, Risiken und Schutzgrenzen. Breite Programme haben regelmäßig mehrere Richtungen zugleich.</p>
        <dl>
          <div><dt>Quellengebundene Zusagen</dt><dd>{model.commitmentCount.toLocaleString("de-DE")}</dd></div>
          <div><dt>Redaktionell nachgeprüfte Schlüsselpfade</dt><dd>{reviewedCount}</dd></div>
          <div><dt>Analyseperspektive</dt><dd>Ex ante - Wirkungspotenzial, keine behauptete Ist-Wirkung</dd></div>
          {decisionDate && <div><dt>Programmbeschluss</dt><dd>{decisionDate}</dd></div>}
        </dl>
      </aside>
    </section>

    <nav className={styles.jumpNav} aria-label="Sprungnavigation der Wahlprogrammanalyse">
      <a href="#gesamtbefund">Gesamtzusammenfassung</a>
      <a href="#schluesselpfade">Key Findings</a>
      <a href="#vollstaendige-wirkungsakte">Alle Einzelanalysen</a>
      <a href="#vollstaendiges-zusageregister">Originalzusagen</a>
      <a href="#quellenstatus">Quellen & Fachstand</a>
    </nav>

    <section id="gesamtbefund" aria-labelledby="gesamtbefund-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>WÖk-Gesamtzusammenfassung</p>
        <h2 id="gesamtbefund-title">Was prägt dieses Wahlprogramm wirkungsökonomisch?</h2>
        <p className={styles.lead}>Die Gesamtzusammenfassung verdichtet Muster, ohne positive und negative Einzelwirkungen zu einer künstlichen Punktzahl zu verrechnen.</p>
      </div>
      <div className={styles.overallGrid}>
        <article className={styles.overallPanel} data-woek-preview-assessment="published">
          <p className={styles.eyebrow}>Gesamtbefund</p>
          <h3>{editorial.overallLabel}</h3>
          <p>{editorial.editorialSummary}</p>
          <p><strong>Leseregel:</strong> {editorial.readingGuide}</p>
        </article>
        <SummaryProfile assessments={centralAssessments} />
      </div>
      <div className={styles.signalGrid}>
        {editorial.keyFindings.map((finding) => <article className={styles.signalCard} key={finding.label}>
          <FindingIcon kind={finding.kind} />
          <div><p className={styles.eyebrow}>Key Finding</p><h3>{finding.label}</h3><p>{finding.text}</p></div>
        </article>)}
      </div>
      <div className={styles.auditNotice}><strong>Qualitätsstatus der Altanalyse</strong><p>Der Release-1-Bestand enthält an mehreren Stellen generische Politikfeld-Templates und einzelne erkennbare Fehlzuordnungen oder Quellkollisionen. Diese Felder werden in der neuen Blaupause nicht mehr als fertige Kurzbewertung ausgegeben. Wo noch keine objektspezifische Nachprüfung vorliegt, bleibt die Richtung ausdrücklich offen.</p></div>
    </section>

    <section id="schluesselpfade" aria-labelledby="schluesselpfade-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Redaktionell nachgeprüfte Schlüsselpfade</p>
        <h2 id="schluesselpfade-title">Richtung, Begründung und Evidenz sofort sichtbar.</h2>
        <p>Diese Karten beantworten zuerst die Nutzerfrage: In welche Richtung könnte sich der relevante Zustand verändern - und wie belastbar ist diese Einschätzung?</p>
      </div>
      <div className={styles.centralGrid}>
        {central.map((commitment) => {
          const assessment = editorial.centralAssessments[commitment.key];
          return <article className={styles.centralCard} key={commitment.key} data-woek-preview-card="published">
            <div className={styles.badgeRow}><DirectionBadge direction={assessment.direction} /><span className={styles.metaChip}>{evidenceLabel(assessment.evidence)}</span></div>
            <p className={styles.eyebrow}>Zusage {commitment.index} · {assessment.keyFinding}</p>
            <h3>{commitment.title}</h3>
            <p>{assessment.impactCoreSummary}</p>
            <p><strong>Warum:</strong> {assessment.directionRationale}</p>
            <a href={`#commitment-${commitment.index}`}>Zur Einzelprüfung →</a>
          </article>;
        })}
      </div>
    </section>

    <section id="woek-kurzbewertung" aria-labelledby="kurzstatus-title">
      <div className={styles.sectionHeader}><p className={styles.eyebrow}>Analyseumfang</p><h2 id="kurzstatus-title">Was ist geprüft - und was bleibt offen?</h2></div>
      <div className={styles.detailGrid}>
        <article className={styles.detailCard}><h4>Zusagen</h4><p><strong>{model.commitmentCount.toLocaleString("de-DE")}</strong> quellengebundene Einheiten</p></article>
        <article className={styles.detailCard}><h4>Entscheidungsreife</h4><p>{counts.readiness.slice(0, 2).map(([status, count]) => `${count} ${publicProgrammeStatus(status)}`).join(" · ") || "offen"}</p></article>
        <article className={styles.detailCard}><h4>Schutzgrenzen</h4><p><strong>{counts.boundaries.toLocaleString("de-DE")}</strong> Zusagen mit ausgewiesener Schutzprüfung im Altbestand</p></article>
        <article className={styles.detailCard}><h4>Editorial v2.0</h4><p><strong>{reviewedCount}</strong> Schlüsselpfade objektspezifisch nachgeprüft; übrige Richtungen fail-closed</p></article>
      </div>
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
      <div className={styles.sectionHeader}><p className={styles.eyebrow}>Originalzusagen</p><h2 id="register-title">Quelle vor Interpretation.</h2><p>Das vollständige Register bleibt erhalten. Es trennt den Wortlaut des Programms von der WÖk-Einordnung.</p></div>
      <details className={styles.proof}><summary>Vollständiges Zusageregister öffnen <span className={styles.summaryTeaser}>{model.commitments.length.toLocaleString("de-DE")} Einträge</span></summary><div className={styles.proofBody}>
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
      </dl>
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

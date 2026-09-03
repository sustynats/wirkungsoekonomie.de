import Link from "next/link";
import { CompletePublicationSource } from "@/app/components/CompletePublicationSource";
import type { SaxonyAnhaltElectionProgramme } from "@/data/sachsen-anhalt-election-programmes";
import type { CompletePublicationSource as PublicationSource } from "@/lib/publication/fachakten";
import {
  buildSaxonyAnhaltProgrammeModel,
  publicProgrammeStatus,
  summarizeStatuses,
  type ProgrammeCommitment,
} from "@/lib/presentation/sachsen-anhalt-programme-model";
import styles from "./SaxonyAnhaltProgrammeAnalysis.module.css";

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(date);
}

function countSummary(rows: [string, number][]) {
  if (!rows.length) return "fachlich offen";
  return rows
    .slice(0, 3)
    .map(([status, count]) => `${count.toLocaleString("de-DE")} ${publicProgrammeStatus(status)}`)
    .join(" · ");
}

function compactText(value: string | null | undefined, fallback: string) {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  if (text.length <= 210) return text;
  return `${text.slice(0, 207).replace(/\s+\S*$/, "")}…`;
}

function firstPotential(commitment: ProgrammeCommitment) {
  return commitment.impactPotentials.find((item) => item.stateChange)?.stateChange
    ?? commitment.firstOrder
    ?? commitment.intendedChange
    ?? "Die konkrete Zustandsveränderung bleibt bis zur näheren Ausgestaltung fachlich offen.";
}

function firstRisk(commitment: ProgrammeCommitment) {
  return commitment.impactRisks.find((item) => item.risk)?.risk
    ?? commitment.boundaryConcerns[0]
    ?? "Kein einzelnes Hauptrisiko ist aus der Programmaussage allein belastbar abzuleiten.";
}

function unique(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function BulletList({ values }: { values: string[] }) {
  if (!values.length) return <p>Für diesen Prüfpunkt ist keine zusätzliche fachlich freigegebene Angabe hinterlegt.</p>;
  return <ul>{values.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}</ul>;
}

function CommitmentDetail({ commitment }: { commitment: ProgrammeCommitment }) {
  const evidence = unique(commitment.impactPotentials.map((item) => item.evidence)).map((value) => publicProgrammeStatus(value)).join(" · ");
  const boundary = commitment.boundaryStatus ? publicProgrammeStatus(commitment.boundaryStatus) : commitment.boundaryConcerns.length ? "Schutzprüfung erforderlich" : "keine eigene Grenzbewertung veröffentlicht";
  const sourceLocation = [commitment.page ? `Seite ${commitment.page}` : null, commitment.section].filter(Boolean).join(" · ");

  return <details className={styles.commitment} data-woek-programme-commitment={commitment.key}>
    <summary>
      <span className={styles.commitmentSummary}>
        <span className={styles.index}>{commitment.index}</span>
        <span>
          <span className={styles.commitmentTitle}>{commitment.title}</span>
          <span className={styles.commitmentMeta}>
            {commitment.policyDomain && <span className={styles.metaChip}>{commitment.policyDomain}</span>}
            {sourceLocation && <span className={styles.metaChip}>{sourceLocation}</span>}
            <span className={styles.statusChip}>{commitment.readinessLabel}</span>
          </span>
          <span className={styles.summaryTeaser}>{compactText(firstPotential(commitment), "Wirkungspfad fachlich offen.")}</span>
        </span>
      </span>
    </summary>
    <div className={styles.commitmentBody}>
      <div className={styles.quickAssessment} aria-label="Zusammenfassende WÖk-Bewertung">
        <article className={styles.assessmentCard}>
          <h4>Mögliche Wirkung</h4>
          <p>{firstPotential(commitment)}</p>
        </article>
        <article className={styles.assessmentCard}>
          <h4>Wesentliches Risiko</h4>
          <p>{firstRisk(commitment)}</p>
        </article>
        <article className={styles.assessmentCard}>
          <h4>Entscheidungsreife und Evidenz</h4>
          <p><strong>{commitment.readinessLabel}</strong>{evidence ? ` · ${evidence}` : " · Evidenzlage offen"}</p>
        </article>
        <article className={styles.assessmentCard}>
          <h4>Schutzgrenzen</h4>
          <p>{boundary}</p>
        </article>
      </div>

      <blockquote className={styles.quote}><strong>Originalaussage:</strong> {commitment.sourceText}</blockquote>

      <div className={styles.nestedList}>
        <details className={styles.nested}>
          <summary>
            Wirkungspotenziale und Wirkmechanismen
            <span className={styles.summaryTeaser}>{compactText(firstPotential(commitment), "Wirkungspfad fachlich offen.")}</span>
          </summary>
          <div className={styles.nestedBody}>
            {commitment.impactPotentials.length ? commitment.impactPotentials.map((potential, index) => <article key={`${commitment.key}-potential-${index}`}>
              {potential.stateChange && <p><strong>Mögliche Zustandsveränderung:</strong> {potential.stateChange}</p>}
              {potential.mechanism && <p><strong>Wirkmechanismus:</strong> {potential.mechanism}</p>}
              {potential.evidence && <p><strong>Evidenz:</strong> {publicProgrammeStatus(potential.evidence)}</p>}
              {potential.indicators.length > 0 && <><p><strong>Mögliche Beobachtungsindikatoren:</strong></p><BulletList values={potential.indicators} /></>}
            </article>) : <p>Für diese Programmaussage ist kein eigenständiger Wirkungspfad über den veröffentlichten Kurzbefund hinaus strukturiert.</p>}
            {(commitment.firstOrder || commitment.secondOrder.length || commitment.thirdOrder) && <>
              <h4>Wirkungskaskade</h4>
              {commitment.firstOrder && <p><strong>Erste Ordnung:</strong> {commitment.firstOrder}</p>}
              {commitment.secondOrder.length > 0 && <><p><strong>Zweite Ordnung:</strong></p><BulletList values={commitment.secondOrder} /></>}
              {commitment.thirdOrder && <p><strong>Dritte Ordnung:</strong> {commitment.thirdOrder}</p>}
            </>}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>
            Risiken und nicht kompensierbare Schutzgrenzen
            <span className={styles.summaryTeaser}>{compactText(firstRisk(commitment), "Schutzprüfung offen.")}</span>
          </summary>
          <div className={styles.nestedBody}>
            {commitment.impactRisks.length ? commitment.impactRisks.map((risk, index) => <article key={`${commitment.key}-risk-${index}`}>
              {risk.risk && <p><strong>Risiko:</strong> {risk.risk}</p>}
              {risk.trigger && <p><strong>Wann es relevant wird:</strong> {risk.trigger}</p>}
              {risk.affected.length > 0 && <><p><strong>Betroffene Gruppen oder Schutzgüter:</strong></p><BulletList values={risk.affected} /></>}
              {risk.evidence && <p><strong>Evidenz:</strong> {publicProgrammeStatus(risk.evidence)}</p>}
            </article>) : <p>Kein einzelnes materielles Risiko ist aus dieser Programmaussage allein als belastbar eingetretene Wirkung feststellbar.</p>}
            {commitment.boundaryConcerns.length > 0 && <><h4>Schutzgrenzen</h4><BulletList values={commitment.boundaryConcerns} /></>}
            {commitment.boundaryRationales.length > 0 && <BulletList values={commitment.boundaryRationales} />}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>
            Betroffene, Verteilung und Generationen
            <span className={styles.summaryTeaser}>{compactText(commitment.distributionNote ?? commitment.affectedGroups[0], "Verteilungswirkung im Einzelfall zu prüfen.")}</span>
          </summary>
          <div className={styles.nestedBody}>
            {commitment.affectedGroups.length > 0 && <><p><strong>Betroffene Gruppen und Systeme:</strong></p><BulletList values={commitment.affectedGroups} /></>}
            {commitment.distributionNote && <p><strong>Verteilungsprüfung:</strong> {commitment.distributionNote}</p>}
            {commitment.shortTerm && <p><strong>Kurzfristig:</strong> {commitment.shortTerm}</p>}
            {commitment.mediumTerm && <p><strong>Mittelfristig:</strong> {commitment.mediumTerm}</p>}
            {commitment.longTerm && <p><strong>Langfristig:</strong> {commitment.longTerm}</p>}
            {commitment.intergenerationalRelevance && <p><strong>Generationengerechtigkeit:</strong> {publicProgrammeStatus(commitment.intergenerationalRelevance)}</p>}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>
            Zuständigkeit, Umsetzung und Entscheidungsreife
            <span className={styles.summaryTeaser}>{compactText(commitment.missingParameters[0] ?? commitment.capacityNote ?? commitment.readinessLabel, commitment.readinessLabel)}</span>
          </summary>
          <div className={styles.nestedBody}>
            <dl className={styles.facts}>
              <div><dt>Entscheidungsreife</dt><dd>{commitment.readinessLabel}</dd></div>
              <div><dt>Umsetzungsebene</dt><dd>{commitment.implementationLevel ?? "im konkreten Fall zu prüfen"}</dd></div>
              <div><dt>Vollzugskapazität</dt><dd>{publicProgrammeStatus(commitment.capacityStatus, "noch nicht belastbar beurteilt")}</dd></div>
              <div><dt>Reversibilität</dt><dd>{publicProgrammeStatus(commitment.reversibility, "im konkreten Design zu prüfen")}</dd></div>
            </dl>
            {commitment.responsibleActors.length > 0 && <><p><strong>Zuständige Akteure:</strong></p><BulletList values={commitment.responsibleActors} /></>}
            {commitment.missingParameters.length > 0 && <><p><strong>Noch offene Ausgestaltungsfragen:</strong></p><BulletList values={commitment.missingParameters} /></>}
            {commitment.implementationRequirements.length > 0 && <><p><strong>Voraussetzungen für die Umsetzung:</strong></p><BulletList values={commitment.implementationRequirements} /></>}
            {commitment.capacityNote && <p>{commitment.capacityNote}</p>}
            {commitment.reversibilityRationale && <p><strong>Reversibilität/Lock-in:</strong> {commitment.reversibilityRationale}</p>}
            {commitment.requiredBeforeDecision.length > 0 && <><p><strong>Vor einer bindenden Entscheidung zusätzlich erforderlich:</strong></p><BulletList values={commitment.requiredBeforeDecision} /></>}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>
            Mensch, Planet, Demokratie und gemeinsame Ziele
            <span className={styles.summaryTeaser}>Referenzrahmen getrennt von der eigentlichen Wirkungsfeststellung.</span>
          </summary>
          <div className={styles.nestedBody}>
            {commitment.human.length > 0 && <><p><strong>Mensch:</strong></p><BulletList values={commitment.human} /></>}
            {commitment.planet.length > 0 && <><p><strong>Planet:</strong></p><BulletList values={commitment.planet} /></>}
            {commitment.democracy.length > 0 && <><p><strong>Demokratie:</strong></p><BulletList values={commitment.democracy} /></>}
            {commitment.sdgs.length > 0 && <><p><strong>UN-Nachhaltigkeitsziele:</strong></p><BulletList values={commitment.sdgs} /></>}
            {commitment.sdgPlus.length > 0 && <><p><strong>WÖk-SDG+:</strong></p><BulletList values={commitment.sdgPlus} /></>}
            {commitment.stateTargets.length > 0 && <><p><strong>Landesziele Sachsen-Anhalt:</strong></p><BulletList values={commitment.stateTargets} /></>}
          </div>
        </details>

        <details className={styles.nested}>
          <summary>
            Datenbedarf, Monitoring und Reality Check
            <span className={styles.summaryTeaser}>{compactText(commitment.primaryIndicator ?? commitment.earliestReview, "Beobachtung nach einer realen Umsetzung erforderlich.")}</span>
          </summary>
          <div className={styles.nestedBody}>
            {commitment.dataGaps.length > 0 && <><p><strong>Offene Daten- und Evidenzfragen:</strong></p><BulletList values={commitment.dataGaps} /></>}
            {commitment.primaryIndicator && <p><strong>Leitindikator:</strong> {commitment.primaryIndicator}</p>}
            {commitment.earliestReview && <p><strong>Frühester sinnvoller Reality Check:</strong> {commitment.earliestReview}</p>}
            {commitment.correctionTrigger && <p><strong>Korrekturtrigger:</strong> {commitment.correctionTrigger}</p>}
          </div>
        </details>

        {(commitment.communicativeStatus || commitment.communicativeBoundary) && <details className={styles.nested}>
          <summary>
            Kommunikative Vorwirkung
            <span className={styles.summaryTeaser}>{publicProgrammeStatus(commitment.communicativeStatus, "fachlich offen")}</span>
          </summary>
          <div className={styles.nestedBody}>
            <p><strong>Einordnung:</strong> {publicProgrammeStatus(commitment.communicativeStatus, "fachlich offen")}</p>
            {commitment.communicativeBoundary && <p><strong>Grenze der Aussagekraft:</strong> {commitment.communicativeBoundary}</p>}
          </div>
        </details>}

        <details className={styles.nested}>
          <summary>Originalfundstelle</summary>
          <div className={styles.nestedBody}>
            <dl className={styles.facts}>
              <div><dt>Seite</dt><dd>{commitment.page ?? "nicht angegeben"}</dd></div>
              <div><dt>Abschnitt</dt><dd>{commitment.section ?? "nicht angegeben"}</dd></div>
              <div><dt>Politikfeld</dt><dd>{commitment.policyDomain ?? "nicht gesondert zugeordnet"}</dd></div>
              <div><dt>Umsetzungsebene</dt><dd>{commitment.implementationLevel ?? "im Einzelfall zu prüfen"}</dd></div>
            </dl>
            <blockquote className={styles.quote}>{commitment.sourceText}</blockquote>
          </div>
        </details>
      </div>
    </div>
  </details>;
}

export function SaxonyAnhaltProgrammeAnalysis({
  programme,
  review,
  commitments,
}: {
  programme: SaxonyAnhaltElectionProgramme;
  review: PublicationSource;
  commitments: PublicationSource;
}) {
  const model = buildSaxonyAnhaltProgrammeModel(review.markdown, commitments.markdown);
  const counts = summarizeStatuses(model.commitments);
  const decisionDate = formatDate(programme.decisionDate);
  const byKey = new Map(model.commitments.map((commitment) => [commitment.key, commitment]));
  const central = model.centralImpactCommitmentKeys
    .map((key) => byKey.get(key))
    .filter((entry): entry is ProgrammeCommitment => Boolean(entry));
  const domainGroups = new Map<string, ProgrammeCommitment[]>();
  for (const commitment of model.commitments) {
    const domain = commitment.policyDomain ?? "Weitere Politikfelder";
    domainGroups.set(domain, [...(domainGroups.get(domain) ?? []), commitment]);
  }
  const grouped = [...domainGroups.entries()].sort((a, b) => a[0].localeCompare(b[0], "de"));

  return <div className={styles.page} data-woek-sachsen-anhalt-public="structured-accordion-v2">
    <section className={styles.hero}>
      <div className={styles.heroMain}>
        <p className={styles.eyebrow}>Landtagswahl Sachsen-Anhalt 2026 · WÖk-Wirkungsanalyse</p>
        <h1>{programme.party}</h1>
        <p className={styles.lead}>{programme.title}</p>
        <p>{model.summary}</p>
        <div className={styles.heroActions}>
          <a href="#woek-kurzbewertung">WÖk-Kurzbewertung</a>
          <a href="#vollstaendige-wirkungsakte">Einzelprüfungen öffnen</a>
        </div>
      </div>
      <aside className={styles.heroAside} aria-label="Auf einen Blick">
        <p className={styles.eyebrow}>Auf einen Blick</p>
        <h2>Was wird hier bewertet?</h2>
        <p>Nicht die Partei und nicht Personen. Geprüft werden die dokumentierten Vorschläge und ihre möglichen Wirkpfade - einschließlich Risiken, Bedingungen, Schutzgrenzen und offener Evidenz.</p>
        <dl>
          <div><dt>Zusageeinheiten</dt><dd>{model.commitmentCount.toLocaleString("de-DE")}</dd></div>
          <div><dt>Perspektive</dt><dd>Ex ante - vor einer möglichen Umsetzung</dd></div>
          <div><dt>Ergebnis</dt><dd>Wirkungspotenziale und Risiken, keine Wahlempfehlung</dd></div>
          {decisionDate && <div><dt>Programmbeschluss</dt><dd>{decisionDate}</dd></div>}
        </dl>
      </aside>
    </section>

    <section id="woek-kurzbewertung" aria-labelledby="woek-kurzbewertung-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>WÖk-Kurzbewertung</p>
        <h2 id="woek-kurzbewertung-title">Die wichtigsten Befunde zuerst.</h2>
        <p className={styles.lead}>Die Übersicht fasst die Einzelprüfungen zusammen, ohne daraus eine künstliche Gesamtnote zu erzeugen. Richtung und Evidenz bleiben getrennt.</p>
      </div>
      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.statusNumber}>{model.commitmentCount.toLocaleString("de-DE")}</span>
          <strong>quellengebundene Zusagen</strong>
          <span>{model.objective ?? "Die Programmaussagen werden einzeln mit Originalfundstelle geprüft."}</span>
        </article>
        <article className={styles.summaryCard}>
          <strong>Entscheidungsreife</strong>
          <span>{countSummary(counts.readiness)}</span>
        </article>
        <article className={styles.summaryCard}>
          <strong>Evidenzlage</strong>
          <span>{countSummary(counts.evidence)}</span>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.statusNumber}>{counts.boundaries.toLocaleString("de-DE")}</span>
          <strong>Zusagen mit Schutzgrenzen-Prüfung</strong>
          <span>Schwere Schäden und Grundrechts- oder Schutzgrenzen werden nicht gegen andere Vorteile verrechnet.</span>
        </article>
      </div>
      {model.implementationBoundary && <p className={styles.quote}><strong>Zuständigkeit:</strong> {model.implementationBoundary}</p>}
      <div className={styles.chips}>{model.policyDomains.map((domain) => <span className={styles.chip} key={domain}>{domain}</span>)}</div>
    </section>

    <section aria-labelledby="programme-ebene-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Programmebene</p>
        <h2 id="programme-ebene-title">Zentrale Wirkpfade und Querschnittsmuster.</h2>
        <p>Diese Ebene zeigt, welche Muster sich über viele Einzelzusagen ziehen. Sie ersetzt nicht die Prüfung der einzelnen Maßnahme.</p>
      </div>
      <div className={styles.accordionList}>
        <details className={styles.sectionAccordion} open>
          <summary>
            Zentrale Wirkpfade
            <span className={styles.summaryTeaser}>{central.length ? `${central.length} vom Fachbestand als zentral markierte Wirkpfade` : "Keine gesonderte Auswahl veröffentlicht."}</span>
          </summary>
          <div className={styles.sectionBody}>
            {central.length ? <div className={styles.centralGrid}>{central.map((commitment) => <article className={styles.centralCard} key={commitment.key}>
              <p className={styles.eyebrow}>Zusage {commitment.index}</p>
              <h3>{commitment.title}</h3>
              <p>{compactText(firstPotential(commitment), "Wirkungspfad fachlich offen.")}</p>
              <a href={`#commitment-${commitment.index}`}>Zur Einzelprüfung</a>
            </article>)}</div> : <p>Der Fachbestand weist keine eigenständige Liste zentraler Wirkpfade aus.</p>}
          </div>
        </details>

        <details className={styles.sectionAccordion}>
          <summary>
            Querschnittsmuster
            <span className={styles.summaryTeaser}>{model.crossCuttingPatterns.length ? `${model.crossCuttingPatterns.length} programmweite Muster` : "Keine zusätzlichen Muster veröffentlicht."}</span>
          </summary>
          <div className={styles.sectionBody}>
            <div className={styles.patternGrid}>{model.crossCuttingPatterns.map((pattern) => <article className={styles.patternCard} key={pattern.title}>
              <h3>{pattern.title}</h3>
              {pattern.rationale && <p>{pattern.rationale}</p>}
              <p><strong>Betroffene Einzelzusagen:</strong> {pattern.affectedKeys.length.toLocaleString("de-DE")}</p>
            </article>)}</div>
          </div>
        </details>

        <details className={styles.sectionAccordion}>
          <summary>
            Kommunikative Vorwirkung
            <span className={styles.summaryTeaser}>{publicProgrammeStatus(model.communicationStatus, "fachlich offen")}</span>
          </summary>
          <div className={styles.sectionBody}>
            <p><strong>Programmebene:</strong> {publicProgrammeStatus(model.communicationStatus, "fachlich offen")}</p>
            {model.communicationEvidence.length > 0 && <><p><strong>Erforderliche Evidenz:</strong></p><BulletList values={model.communicationEvidence} /></>}
            {model.communicationMeasurement.length > 0 && <><p><strong>Messbedarf:</strong></p><BulletList values={model.communicationMeasurement} /></>}
            {model.communicationBoundary && <p><strong>Grenze der Aussagekraft:</strong> {model.communicationBoundary}</p>}
          </div>
        </details>
      </div>
    </section>

    <section id="vollstaendige-wirkungsakte" aria-labelledby="einzelpruefungen-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Vollständige Wirkungsakte</p>
        <h2 id="einzelpruefungen-title">Jede Zusage einzeln - verständlich, aufklappbar und quellengebunden.</h2>
        <p className={styles.lead}>Jeder Punkt beginnt mit einer kurzen WÖk-Einordnung. Erst beim Öffnen folgen Wirkmechanismen, Risiken, Schutzgrenzen, Verteilung, Zuständigkeit, Referenzrahmen und Reality-Check-Anforderungen.</p>
      </div>
      <div className={styles.domainList}>
        {grouped.map(([domain, entries]) => {
          const domainCounts = summarizeStatuses(entries);
          return <details className={styles.domainAccordion} key={domain}>
            <summary>
              <span className={styles.domainSummary}>
                <strong>{domain} · {entries.length.toLocaleString("de-DE")} Zusagen</strong>
                <span className={styles.summaryTeaser}>{countSummary(domainCounts.readiness)} · {domainCounts.boundaries.toLocaleString("de-DE")} mit Schutzgrenzen-Prüfung</span>
              </span>
            </summary>
            <div className={styles.domainBody}>
              <div className={styles.commitmentList}>
                {entries.map((commitment) => <div id={`commitment-${commitment.index}`} key={commitment.key}><CommitmentDetail commitment={commitment} /></div>)}
              </div>
            </div>
          </details>;
        })}
      </div>
    </section>

    <section id="vollstaendiges-zusageregister" aria-labelledby="zusageregister-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Zusageregister</p>
        <h2 id="zusageregister-title">Alle Programmaussagen mit Fundstelle.</h2>
        <p>Das Register trennt den Originalwortlaut von der Wirkungsanalyse. Es ist kein Parteienranking und keine Umsetzungskontrolle.</p>
      </div>
      <details className={styles.sectionAccordion}>
        <summary>
          Vollständiges Zusageregister öffnen
          <span className={styles.summaryTeaser}>{model.commitments.length.toLocaleString("de-DE")} quellengebundene Einträge</span>
        </summary>
        <div className={styles.sectionBody}>
          {model.commitments.map((commitment) => <div className={styles.registerRow} key={`register-${commitment.key}`}>
            <span className={styles.index}>{commitment.index}</span>
            <div>
              <strong>{commitment.sourceText}</strong>
              <p>{[commitment.policyDomain, commitment.page ? `Seite ${commitment.page}` : null, commitment.section].filter(Boolean).join(" · ")}</p>
            </div>
          </div>)}
        </div>
      </details>
    </section>

    <section aria-labelledby="quellenstatus-title">
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Quelle und Einordnung</p>
        <h2 id="quellenstatus-title">Programm, Analyse und spätere Wirkung bleiben getrennt.</h2>
      </div>
      <dl className={styles.facts}>
        <div><dt>Dokumentstatus</dt><dd>{programme.documentStatus === "BESCHLOSSEN" ? "Beschlossenes Wahlprogramm" : "Veröffentlichte Webfassung"}</dd></div>
        <div><dt>Quellenformat</dt><dd>{programme.sourceFormat}</dd></div>
        <div><dt>Fachstand</dt><dd>{formatDate(review.verifiedAt) ?? review.verifiedAt}</dd></div>
        <div><dt>Referenzstand</dt><dd>WÖk-Begriffsleitfaden v{review.terminologyVersion}</dd></div>
      </dl>
      <p><Link href="/laender/sachsen-anhalt/quellen">Originalquellen und Programmnachweise öffnen →</Link></p>
    </section>

    <details className={styles.proof}>
      <summary>
        Fachlicher Vollnachweis und technische Prüfinformationen
        <span className={styles.summaryTeaser}>Nur für Reproduzierbarkeit und Source-Fidelity - standardmäßig geschlossen.</span>
      </summary>
      <div className={styles.proofBody}>
        <p>Die öffentliche Lesefassung oben ordnet die freigegebenen Inhalte für Menschen. Für Audit, Reproduzierbarkeit und vollständige Source-Fidelity bleiben die autorisierten Fachquellen zusätzlich unverändert abrufbar.</p>
        <CompletePublicationSource source={review} idPrefix="fachlicher-vollnachweis-wirkungsakte" />
        <CompletePublicationSource source={commitments} idPrefix="fachlicher-vollnachweis-zusageregister" />
      </div>
    </details>

    <p><Link href="/laender/sachsen-anhalt">← Zurück zur Übersicht Sachsen-Anhalt</Link></p>
  </div>;
}

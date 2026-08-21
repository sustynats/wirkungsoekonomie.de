import Link from "next/link";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { StateCoalitionCommitmentInventory } from "@/app/components/states/StateCoalitionCommitmentInventory";
import {
  rheinlandPfalzCoalitionAssessment,
  rheinlandPfalzCoalitionChapters,
  rheinlandPfalzCoalitionCommitmentRegister,
  rheinlandPfalzCoalitionCommitments,
  rheinlandPfalzCoalitionExistingImpactCases,
  rheinlandPfalzCoalitionLifecycle,
  rheinlandPfalzCoalitionQualityLayers,
  rheinlandPfalzCoalitionRelationshipModel,
  rheinlandPfalzCoalitionSources,
} from "@/lib/states/rheinland-pfalz-coalition";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

function ChapterReview({ chapter }: { chapter: (typeof rheinlandPfalzCoalitionChapters)[number] }) {
  const relatedImpactCase = chapter.relatedImpactCase
    ? rheinlandPfalzCoalitionExistingImpactCases.find((impactCase) => impactCase.id === chapter.relatedImpactCase)
    : null;
  return <details className="government-full-record" id={`kapitel-${chapter.chapter}`}>
    <summary>
      <span>Kapitel {chapter.chapter}</span> · {chapter.title}
      <small>{chapter.maturityLabel} · {chapter.pages}</small>
    </summary>
    <div className="coalition-chapter-review">
      <OverviewAssessment assessment={chapter.assessment} compact />
      <div className="government-impact-grid">
        <article><p className="eyebrow">Problemprüfung</p><h3>Welches Problem wird adressiert?</h3><p>{chapter.problemReview}</p></article>
        <article><p className="eyebrow">Zielprüfung</p><h3>Ist das Ziel problemadäquat?</h3><p>{chapter.goalReview}</p></article>
      </div>
      <section aria-labelledby={`kapitel-${chapter.chapter}-pfade`}>
        <p className="eyebrow">Wirkpfade, Risiken und Bedingungen</p>
        <h3 id={`kapitel-${chapter.chapter}-pfade`}>Hochmateriale Befunde</h3>
        <div className="strategy-quality-layers">
          {chapter.findings.map((finding) => <details key={finding.title}><summary>{finding.title}</summary><p>{finding.text}</p></details>)}
        </div>
      </section>
      {relatedImpactCase ? <p className="notice"><strong>Bestehenden Wirkungsfall wiederverwenden:</strong> {relatedImpactCase.title}. Der freigegebene Fachfall wird verknüpft und nicht aus dem Koalitionstext dupliziert.</p> : null}
    </div>
  </details>;
}

export function RheinlandPfalzCoalitionReview() {
  return <article className="government-impact-case strategy-detail coalition-review" aria-labelledby="rlp-coalition-title">
    <header>
      <p className="eyebrow">Rheinland-Pfalz · Mandatsanalyse 2026–2031</p>
      <h1 id="rlp-coalition-title">Gemeinsame Verantwortung für ein starkes Rheinland-Pfalz</h1>
      <p className="lead">Die WÖk-Prüfung veröffentlicht die fachlich abgeschlossenen Reviews aller neun Kapitel und trennt politische Zusage, Problem und Ziel, Wirkungspotenzial, spätere Regierungshandlung, Umsetzung und beobachtete Wirkung.</p>
      <div className="open-state" role="note">
        <span aria-hidden="true">i</span>
        <div>
          <strong>Alle Kapitel fachlich geprüft – atomare Quellenebene noch nicht vollständig</strong>
          <p>Alle neun Kapitel besitzen eine hochmateriale WÖk-Prüfung. Aus den fachlichen Handoffs sind 302 explizite Zusagen aus Kapitel 1 und 2 fundstellengebunden übernommen. Neun dort deklarierte Einzel-IDs fehlen als ausformulierter Datensatz; Kapitel 3 bis 9 sind noch nicht atomar übergeben. Beides bleibt sichtbar offen und wird nicht technisch ergänzt.</p>
        </div>
      </div>
    </header>

    <section aria-labelledby="rlp-source-version">
      <p className="eyebrow">Quelle und Fassung</p>
      <h2 id="rlp-source-version">Parteioffiziell wiederveröffentlichter Vertragstext mit offenem Signaturstatus</h2>
      <p>Der öffentlich zugängliche 101-seitige Text trägt die gemeinsame Mandatsgrundlage. Die Begleitseite bezeichnet die Fassung zugleich als Entwurf; eine byte-identische signierte Endfassung ist nicht nachgewiesen. Der GovernmentTerm seit 18. Mai 2026 ist amtlich belegt, ersetzt aber keinen belastbaren Versionsnachweis des Dokuments.</p>
      <div className="jurisdiction-facts">
        <div><span>Regierungsbeginn</span><strong>18. Mai 2026</strong></div>
        <div><span>Kapitelreview</span><strong>9 von 9</strong></div>
        <div><span>Explizite Source-Commitments</span><strong>{rheinlandPfalzCoalitionCommitmentRegister.source_record_count.toLocaleString("de-DE")}</strong></div>
        <div><span>Offene deklarierte Records</span><strong>{rheinlandPfalzCoalitionCommitmentRegister.handoff_record_gap_count}</strong></div>
      </div>
    </section>

    <section aria-labelledby="rlp-problem-goal">
      <p className="eyebrow">Executive Overview</p>
      <h2 id="rlp-problem-goal">Mehrere Probleme und Ziele – kein Einheitsfall</h2>
      <div className="government-impact-grid">
        <article><h3>Problemportfolio</h3><p>Wirtschaft und Transformation, Bildung, Arbeit, Gesundheit und Pflege, Klima und Natur, Sicherheit, Infrastruktur und Wohnen, fiskalische und kommunale Kapazität, Migration und Integration sowie Demokratie benötigen getrennte Baselines und Gegenfakten. Der Koalitionsvertrag beweist diese Probleme nicht durch seine Formulierungen.</p></article>
        <article><h3>Zielportfolio</h3><p>Wirtschaftliche Stärke, soziale Gerechtigkeit, Bildung, Sicherheit, Gesundheit, kommunale Handlungsfähigkeit, Integration, Klima- und Naturschutz sowie demokratisches Vertrauen sind parallele Zielräume. Zwischenziele und Inputs dürfen nicht als positive Netto-Wirkung ausgegeben werden.</p></article>
      </div>
      <div className="notice"><strong>Umsetzung ist nicht Wirkung.</strong><p>Koalitionszusage, Regierungshandlung, Rechtsakt, Budget, Vollzug, Zustandsbeobachtung und Reality Check bleiben getrennte Stufen. Eine Erfüllungsquote wird nicht als Regierungswirkungsnote verwendet.</p></div>
    </section>

    <section aria-labelledby="rlp-impact-overview">
      <p className="eyebrow">WÖk-Wirkungsprüfung des Mandatsportfolios</p>
      <h2 id="rlp-impact-overview">Wirkungspotenziale, Risiken und entscheidende Bedingungen</h2>
      <OverviewAssessment assessment={rheinlandPfalzCoalitionAssessment} />
    </section>

    <section aria-labelledby="rlp-coverage">
      <p className="eyebrow">Coverage und Reife</p>
      <h2 id="rlp-coverage">Was fachlich geprüft ist – und was fail-closed offen bleibt</h2>
      <dl className="government-impact-summary">
        <div><dt>Kapitelreviews</dt><dd>9 von 9 auf hochmaterialer Kapitel- und Clusterebene</dd></div>
        <div><dt>Explizit übergebene atomare Zusagen</dt><dd>{rheinlandPfalzCoalitionCommitmentRegister.atomic_commitment_count.toLocaleString("de-DE")} aus Kapitel 1 und 2</dd></div>
        <div><dt>Strukturelle Handoff-Lücke</dt><dd>Die neun deklarierten IDs 152 bis 160 aus Kapitel 2 fehlen als ausformulierte Fachrecords und werden nicht rekonstruiert</dd></div>
        <div><dt>Kapitel 3 bis 9</dt><dd>Hochmaterial geprüft; atomare Source-Zerlegung noch nicht fachlich übergeben</dd></div>
        <div><dt>WÖk-Handlungsoption</dt><dd>Keine Kapitel- oder Dokumentempfehlung fachlich freigegeben</dd></div>
        <div><dt>Reality Check</dt><dd>Noch nicht reif; Ex-ante-Mandat bleibt historisch erhalten</dd></div>
      </dl>
      <nav className="coalition-chapter-nav" aria-label="Kapitel der Koalitionsvertragsanalyse">
        {rheinlandPfalzCoalitionChapters.map((chapter) => <a key={chapter.chapter} href={`#kapitel-${chapter.chapter}`}>{chapter.chapter}. {chapter.title}</a>)}
      </nav>
    </section>

    <section aria-labelledby="rlp-triple-assessment">
      <p className="eyebrow">Drei getrennte Bewertungsebenen</p>
      <h2 id="rlp-triple-assessment">Wirkungsprüfung, Zielreferenz und WÖk-Handlungsoption nicht vermischen</h2>
      <div className="government-impact-grid">
        <article><h3>Tatsächliche WÖk-Wirkungsprüfung</h3><p>Die Kapitelreviews prüfen Problemadäquanz, Mechanismen, Potenziale, Risiken, Delivery, Verteilung, Rechte, Schutzgrenzen und spätere Falsifikation. Source-Commitments erben daraus keine automatische Einzelrichtung.</p></article>
        <article><h3>DNS und gemeinsame Ziele</h3><p>Relevante Zielräume sind fachlich benannt, aber der objektspezifische Crosswalk auf exakte DNS-Indikatoren ist nicht freigegeben. Thematische Nähe ist weder Richtungs- noch Kausalitätsnachweis.</p></article>
        <article><h3>Bessere WÖk-Handlungsoption</h3><p>Für das Koalitionsportfolio liegt keine fachlich freigegebene Recommendation vor. Schutz-, Monitoring- und Designbedingungen werden nicht technisch zu einer Empfehlung zusammengesetzt.</p></article>
      </div>
    </section>

    <section aria-labelledby="rlp-chapter-reviews">
      <p className="eyebrow">Deep Dive</p>
      <h2 id="rlp-chapter-reviews">Wirkungspotenziale, Risiken und Bedingungen nach Kapitel</h2>
      <p>Jedes Kapitel behält seine eigene Bewertung. Die neun Reviews werden weder zu einer Koalitionsnote noch zu einer Ampel oder einem Durchschnitt verrechnet.</p>
      <div className="coalition-chapter-list">
        {rheinlandPfalzCoalitionChapters.map((chapter) => <ChapterReview key={chapter.chapter} chapter={chapter} />)}
      </div>
    </section>

    <section aria-labelledby="rlp-system-layers">
      <p className="eyebrow">System-, Delivery- und Reifeprüfung</p>
      <h2 id="rlp-system-layers">Dokumentweite Prüfmatrix</h2>
      <div className="strategy-quality-layers">
        {rheinlandPfalzCoalitionQualityLayers.map((layer) => <details key={layer.title}><summary>{layer.title}</summary><p>{layer.text}</p></details>)}
      </div>
    </section>

    <section aria-labelledby="rlp-relationship-model">
      <p className="eyebrow">De-Dupe, Kompetenz und Lifecycle</p>
      <h2 id="rlp-relationship-model">Quellen erhalten, politische Objekte nicht doppelt zählen</h2>
      <div className="strategy-quality-layers">
        <details><summary>Quellen- und De-Dupe-Regel</summary><p>{rheinlandPfalzCoalitionRelationshipModel.sourceDeduplication}</p></details>
        <details><summary>Parent-Child-Lifecycle</summary><p>{rheinlandPfalzCoalitionRelationshipModel.parentChild}</p></details>
        <details><summary>Zuständigkeit und externe Akteure</summary><p>{rheinlandPfalzCoalitionRelationshipModel.competence}</p></details>
        <details><summary>Finanzierung und Ressourcen</summary><p>{rheinlandPfalzCoalitionRelationshipModel.budgetReservation}</p></details>
        <details><summary>Reife der Einzelobjekte</summary><p>{rheinlandPfalzCoalitionRelationshipModel.maturity}</p></details>
      </div>
    </section>

    <section aria-labelledby="rlp-existing-cases">
      <p className="eyebrow">Bereits vorhandene Wirkungsfälle</p>
      <h2 id="rlp-existing-cases">Vorhandenen Fachbestand verknüpfen statt duplizieren</h2>
      <p>Die vier freigegebenen Regierungswirkungsfälle bleiben eigenständige Fachfälle. Gemeinsame Themen oder Formulierungen sind kein Identitätsbeweis.</p>
      <div className="government-impact-grid">
        {rheinlandPfalzCoalitionExistingImpactCases.map((impactCase) => <article key={impactCase.id}><p className="eyebrow">Bestehende Wirkungsanalyse</p><h3>{impactCase.title}</h3><Link className="text-link" href="/laender/rheinland-pfalz/regierung">Freigegebenen Regierungs-Fachstand öffnen</Link></article>)}
      </div>
    </section>

    <StateCoalitionCommitmentInventory
      records={rheinlandPfalzCoalitionCommitments.map((record) => ({
        commitment_id: record.commitment_id,
        chapter: record.chapter,
        commitment_text: record.commitment_text,
        source_locator: record.source_locator,
        atomic_count: record.atomic_count,
        container_children: record.container_children,
        parent_container_id: record.parent_container_id,
      }))}
      chapters={rheinlandPfalzCoalitionChapters.map((chapter) => ({
        chapter: chapter.chapter,
        title: chapter.title,
        atomicCommitments: rheinlandPfalzCoalitionCommitmentRegister.chapter_counts.find((count) => count.chapter === chapter.chapter)?.atomic_commitments ?? 0,
      }))}
      copy={{
        title: "302 explizit übergebene Zusagen aus Kapitel 1 und 2",
        intro: "Jeder Eintrag übernimmt genau den fachlich ausformulierten Quellenanker mit stabiler Kennung und Fundstelle. Neun nur deklarierte, aber nicht ausformulierte IDs sowie die noch nicht atomar übergebenen Kapitel 3 bis 9 werden nicht rekonstruiert. Eine Koalitionszusage ist noch keine Regierungshandlung, Umsetzung oder Wirkung.",
        allChaptersLabel: "Alle Kapitel mit expliziten Einzelrecords",
      }}
    />

    <section aria-labelledby="rlp-option">
      <p className="eyebrow">WÖk-Handlungsoption</p>
      <h2 id="rlp-option">Keine fachlich freigegebene Gesamtportfolio-Empfehlung</h2>
      <p>Die ausgewiesenen Wirkbedingungen, Zielkonflikte, Grenzen und Monitoringanforderungen sind Analysebefunde. Sie werden nicht automatisch zu einer Recommendation zusammengesetzt.</p>
    </section>

    <section aria-labelledby="rlp-lifecycle">
      <p className="eyebrow">Politischer Lebenslauf</p>
      <h2 id="rlp-lifecycle">Vom Mandat zum späteren Reality Check</h2>
      <ol className="impact-path">{rheinlandPfalzCoalitionLifecycle.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
    </section>

    <section aria-labelledby="rlp-sources">
      <p className="eyebrow">Vollakte · Originalquellen</p>
      <h2 id="rlp-sources">Welche Quellen tragen diese Einordnung?</h2>
      <div className="government-source-groups">
        {rheinlandPfalzCoalitionSources.map((source) => <article key={source.url}><h3>{source.title}</h3><p>{source.abstract}</p><p><strong>Fundstellen:</strong> {source.locations.join("; ")}</p><Link className="text-link" href={sourceDetailHrefForUrl(source.url)}>Quellenakte mit Original öffnen</Link></article>)}
      </div>
    </section>

    <section className="government-process-meta" data-woek-process-metadata aria-label="Technische Transparenz">
      <h2>Technische Transparenz</h2>
      <p><strong>Fachstand:</strong> Kapitelreviews und atomare Handoffs aus Issue 240, 20.–21. August 2026 · <strong>Analyseart:</strong> Ex-ante-Mandatsportfolio mit getrennten Wirkungs- und Lifecycle-Objekten</p>
      <p><strong>Fassungsregel:</strong> Parteioffiziell wiederveröffentlichter Vertragstext; keine stille Gleichsetzung mit einer nicht nachgewiesenen byte-identischen signierten Endfassung.</p>
    </section>
  </article>;
}

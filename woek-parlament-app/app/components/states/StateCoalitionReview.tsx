import Link from "next/link";
import { OverviewAssessment } from "@/app/components/OverviewAssessment";
import { ExecutiveImpactSummaryView } from "@/app/components/executive-impact/ExecutiveImpactSummary";
import { StateCoalitionCommitmentInventory } from "@/app/components/states/StateCoalitionCommitmentInventory";
import {
  badenWuerttembergCoalitionAssessment,
  badenWuerttembergCoalitionCommitmentRegister,
  badenWuerttembergCoalitionCommitments,
  badenWuerttembergCoalitionChapters,
  badenWuerttembergCoalitionExistingImpactCases,
  badenWuerttembergCoalitionGovernanceReview,
  badenWuerttembergCoalitionLifecycle,
  badenWuerttembergCoalitionQualityLayers,
  badenWuerttembergCoalitionRelationshipModel,
  badenWuerttembergCoalitionSources,
} from "@/lib/states/baden-wuerttemberg-coalition";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { executiveImpactFromOverview } from "@/lib/executive-impact/from-overview";

function ChapterReview({ chapter }: { chapter: (typeof badenWuerttembergCoalitionChapters)[number] }) {
  const relatedImpactCase = chapter.relatedImpactCase
    ? badenWuerttembergCoalitionExistingImpactCases.find((impactCase) => impactCase.id === chapter.relatedImpactCase)
    : null;
  return <details className="government-full-record" id={`kapitel-${chapter.chapter}`}>
    <summary>
      <span>Kapitel {chapter.chapter}</span> · {chapter.title}
      <small>{chapter.maturityLabel} · {chapter.pages}</small>
    </summary>
    <div className="coalition-chapter-review">
      <OverviewAssessment assessment={chapter.assessment} compact />
      <div className="government-impact-grid">
        <article>
          <p className="eyebrow">Problemprüfung</p>
          <h3>Welches Problem wird adressiert?</h3>
          <p>{chapter.problemReview}</p>
        </article>
        <article>
          <p className="eyebrow">Zielprüfung</p>
          <h3>Ist das Ziel problemadäquat?</h3>
          <p>{chapter.goalReview}</p>
        </article>
      </div>
      <section aria-labelledby={`kapitel-${chapter.chapter}-pfade`}>
        <p className="eyebrow">Wirkpfade, Risiken und Bedingungen</p>
        <h3 id={`kapitel-${chapter.chapter}-pfade`}>Hochmateriale Befunde</h3>
        <div className="strategy-quality-layers">
          {chapter.findings.map((finding) => <details key={finding.title}>
            <summary>{finding.title}</summary>
            <p>{finding.text}</p>
          </details>)}
        </div>
      </section>
      {relatedImpactCase ? <p className="notice"><strong>Bestehenden Wirkungsfall wiederverwenden:</strong> {relatedImpactCase.title}. Der vorhandene Fachfall wird verknüpft und nicht als neuer Koalitionsfall dupliziert.</p> : null}
    </div>
  </details>;
}

export function BadenWuerttembergCoalitionReview() {
  const deepReviews = badenWuerttembergCoalitionChapters.filter((chapter) => chapter.maturity === "DEEP_REVIEW");
  const highMaterialityReviews = badenWuerttembergCoalitionChapters.filter((chapter) => chapter.maturity === "HIGH_MATERIALITY_REVIEW");
  const executiveSummary = executiveImpactFromOverview({
    id: "baden-wuerttemberg-coalition-2026-2031",
    objectType: "COALITION_AGREEMENT",
    assessment: badenWuerttembergCoalitionAssessment,
    analysisVersion: "BW-KOALITION-FACH-GAP-CLOSURE-2026-08",
    knowledgeCutoff: "2026-08-21",
    systemBoundary: "Ex-ante-Mandatsportfolio des Koalitionsvertrags; Koalitionszusage, Regierungshandlung, Vollzug, beobachtete Zustandsänderung und Attribution bleiben getrennte Objekte.",
    sourceRefs: badenWuerttembergCoalitionSources.map((source, index) => ({ id: `bw-coalition-source-${index + 1}`, label: source.title, href: sourceDetailHrefForUrl(source.url) })),
  });
  return <article className="government-impact-case strategy-detail coalition-review" aria-labelledby="bw-coalition-title">
    <header>
      <p className="eyebrow">Baden-Württemberg · Mandatsanalyse 2026–2031</p>
      <h1 id="bw-coalition-title">Aus Verantwortung fürs Land – Gemeinsam stark in stürmischen Zeiten</h1>
      <p className="lead">Der Vertrag ist vollständig als fundstellengebundenes Mandatsinventar erschlossen. Die WÖk-Prüfung trennt politische Zusage, Problem und Ziel, Wirkungspotenzial, spätere Regierungshandlung, Umsetzung und beobachtete Wirkung.</p>
      <div className="open-state" role="note">
        <span aria-hidden="true">i</span>
        <div>
          <strong>Fach-Gap-Closure vollständig – Wirkung bleibt ex ante</strong>
          <p>Alle 15 Kapitel sind hochmaterial geprüft und 1.577 atomare Zusagen vollständig mit Fundstellen erfasst. Kapitel 1 bis 3 liegen vertieft vor. Die Vollständigkeit des Quelleninventars ist keine Behauptung, dass jede Zusage bereits umgesetzt oder als eigener Wirkungsfall bewertet wurde.</p>
        </div>
      </div>
    </header>

    <section aria-labelledby="bw-source-version">
      <p className="eyebrow">Quelle und Fassung</p>
      <h2 id="bw-source-version">Amtlich verlinkter Vertragstext mit transparentem Entwurfsvermerk</h2>
      <p>Die Regierungsseite bestätigt Vorstellung, parteiliche Zustimmung, Unterzeichnung und Regierungsbeginn. Das dort aktuell verlinkte PDF bezeichnet sich im Dokumentinneren weiterhin als Entwurf für die Parteitage am 9. Mai 2026. Deshalb wird keine byte-identische signierte Endfassung behauptet. Eine spätere amtliche Fassung würde als eigene Version mit nachvollziehbarem Delta hinzukommen.</p>
      <div className="jurisdiction-facts">
        <div><span>Vorgestellt</span><strong>6. Mai 2026</strong></div>
        <div><span>Parteien zugestimmt</span><strong>9. Mai 2026</strong></div>
        <div><span>Unterzeichnung bestätigt</span><strong>11. Mai 2026</strong></div>
        <div><span>Regierungsbeginn</span><strong>13. Mai 2026</strong></div>
      </div>
    </section>

    <section aria-labelledby="bw-problem-goal">
      <p className="eyebrow">Executive Overview</p>
      <h2 id="bw-problem-goal">Mehrere Probleme und Ziele – kein Einheitsfall</h2>
      <div className="government-impact-grid">
        <article>
          <h3>Problemportfolio</h3>
          <p>Handel und Wettbewerbsfähigkeit, Energiepreise, Industrie- und Technologiewandel, Bürokratie und staatliche Kapazität, Demografie, Demokratie und Rechtsstaat sowie Klima und Artensterben bleiben empirisch getrennte Problemtypen. Der Vertrag liefert dafür überwiegend keine gemeinsame Baseline oder ein belastbares Gegenfaktum.</p>
        </article>
        <article>
          <h3>Zielportfolio</h3>
          <p>Wohlstand, Arbeit, Bildung, digitaler Staat, Sicherheit, Kommunen, Würde und Teilhabe, Migration und Integration sowie Klima und Natur sind parallele Zielräume. Wachstum ist ein Zwischenziel; Grundrechte, Rechtsstaat und irreversible Schutzgrenzen dürfen nicht durch wirtschaftliche Mehrwirkung kompensiert werden.</p>
        </article>
      </div>
      <div className="notice"><strong>Umsetzung ist nicht Wirkung.</strong><p>Koalitionszusage, Regierungshandlung, Rechtsakt, Budget, Vollzug, Zustandsbeobachtung und Reality Check bleiben getrennte Stufen. Eine Erfüllungsquote wird nicht als Regierungswirkungsnote verwendet.</p></div>
    </section>

    <section aria-labelledby="bw-impact-overview">
      <p className="eyebrow">WÖk-Wirkungsprüfung des Mandatsportfolios</p>
      <h2 id="bw-impact-overview">Wirkungspotenziale, Risiken und entscheidende Bedingungen</h2>
      <ExecutiveImpactSummaryView summary={executiveSummary} />
    </section>

    <section aria-labelledby="bw-governance-review">
      <p className="eyebrow">Dokumentweite Wirkungssteuerung</p>
      <h2 id="bw-governance-review">Vom Mitteleinsatz zum beobachtbaren Zielzustand</h2>
      <OverviewAssessment assessment={badenWuerttembergCoalitionGovernanceReview.assessment} compact />
      <div className="government-impact-grid">
        <article><h3>Problemprüfung</h3><p>{badenWuerttembergCoalitionGovernanceReview.problemReview}</p></article>
        <article><h3>Zielprüfung</h3><p>{badenWuerttembergCoalitionGovernanceReview.goalReview}</p></article>
      </div>
      <div className="strategy-path-grid">
        {badenWuerttembergCoalitionGovernanceReview.paths.map((path) => <article className="strategy-impact-path" key={path.title}>
          <h3>{path.title}</h3>
          <dl>
            <div><dt>Instrument oder Aktion</dt><dd>{path.action}</dd></div>
            <div><dt>Wirkmechanismus</dt><dd>{path.mechanism}</dd></div>
            <div><dt>Mögliche Zustandsänderung</dt><dd>{path.stateChange}</dd></div>
            <div><dt>Wirkungsraum</dt><dd>{path.reference}</dd></div>
            <div><dt>Materielles Risiko</dt><dd>{path.risk}</dd></div>
          </dl>
        </article>)}
      </div>
    </section>

    <section aria-labelledby="bw-coverage">
      <p className="eyebrow">Coverage und Reife</p>
      <h2 id="bw-coverage">Was bereits geprüft ist – und was offen bleibt</h2>
      <dl className="government-impact-summary">
        <div><dt>Kapitel erfasst</dt><dd>15 von 15 auf hochmaterialer Kapitel- und Clusterebene</dd></div>
        <div><dt>Vertiefte Kapitelreviews</dt><dd>{deepReviews.length} von 15: Staatsmodernisierung, Wirtschaft sowie Wissenschaft, Kultur und Medien</dd></div>
        <div><dt>Weitere Kapitelprüfungen</dt><dd>{highMaterialityReviews.length} von 15 auf hochmaterialer Ebene</dd></div>
        <div><dt>Atomare Quellenabdeckung</dt><dd>{badenWuerttembergCoalitionCommitmentRegister.atomic_commitment_count.toLocaleString("de-DE")} Zusagen vollständig fundstellengebunden; sechs Parent-Container zählen nicht atomar</dd></div>
        <div><dt>Abdeckung der Handlungsoptionen</dt><dd>Keine neue Kapitel- oder Dokumentempfehlung freigegeben</dd></div>
        <div><dt>Reality Check</dt><dd>Noch nicht reif; Ex-ante-Mandat bleibt historisch erhalten</dd></div>
        <div><dt>Finanzierung</dt><dd>Zusätzliche finanzwirksame Zusagen stehen unter Haushaltsvorbehalt</dd></div>
      </dl>
      <nav className="coalition-chapter-nav" aria-label="Kapitel der Koalitionsvertragsanalyse">
        {badenWuerttembergCoalitionChapters.map((chapter) => <a key={chapter.chapter} href={`#kapitel-${chapter.chapter}`}>{chapter.chapter}. {chapter.title}</a>)}
      </nav>
    </section>

    <section aria-labelledby="bw-triple-assessment">
      <p className="eyebrow">Drei getrennte Bewertungsebenen</p>
      <h2 id="bw-triple-assessment">Wirkungsprüfung, Zielreferenz und WÖk-Handlungsoption nicht vermischen</h2>
      <div className="government-impact-grid">
        <article><h3>Tatsächliche WÖk-Wirkungsprüfung</h3><p>Die Kapitelreviews prüfen die dokumentierten Instrumente und Zusagen auf Problemadäquanz, Mechanismen, Wirkungspotenziale, Risiken, Delivery, Verteilung, Schutzgrenzen und spätere Falsifikation. Atomare Quellenobjekte erben daraus nicht automatisch ein eigenes Wirkungsurteil.</p></article>
        <article><h3>DNS und gemeinsame Ziele</h3><p>Für das Vertragsportfolio liegt kein vollständiger, fachlich freigegebener Crosswalk aller 1.577 Zusagen auf konkrete DNS-Indikatoren vor. Ziel- und Datenreferenzen bleiben deshalb getrennt und offen; eine thematische Nähe wäre weder Richtungs- noch Kausalitätsnachweis.</p></article>
        <article><h3>Bessere WÖk-Handlungsoption</h3><p>Für den Koalitionsvertrag als Gesamtportfolio liegt keine fachlich freigegebene Handlungsoption vor. Bedingungen und Zielkonflikte werden nicht technisch zu einer Recommendation zusammengesetzt.</p></article>
      </div>
    </section>

    <section aria-labelledby="bw-chapter-reviews">
      <p className="eyebrow">Deep Dive</p>
      <h2 id="bw-chapter-reviews">Wirkungspotenziale, Risiken und Bedingungen nach Kapitel</h2>
      <p>Jedes Kapitel behält seine eigene Bewertung und Reife. Die drei vertieften Reviews und die zwölf hochmaterialen Kapitelprüfungen werden nicht zu einem Durchschnitt, einer Ampel oder einer Koalitionsnote verrechnet.</p>
      <div className="coalition-chapter-list">
        {badenWuerttembergCoalitionChapters.map((chapter) => <ChapterReview key={chapter.chapter} chapter={chapter} />)}
      </div>
    </section>

    <section aria-labelledby="bw-system-layers">
      <p className="eyebrow">System-, Delivery- und Reifeprüfung</p>
      <h2 id="bw-system-layers">Dokumentweite Prüfmatrix</h2>
      <p>Diese Ebenen bestimmen, ob aus politischen Zusagen plausible, umsetzbare und später überprüfbare Wirkpfade werden. Sie werden für jeden später konkretisierten Wirkungsfall weiter präzisiert.</p>
      <div className="strategy-quality-layers">
        {badenWuerttembergCoalitionQualityLayers.map((layer) => <details key={layer.title}>
          <summary>{layer.title}</summary>
          <p>{layer.text}</p>
        </details>)}
      </div>
    </section>

    <section aria-labelledby="bw-relationship-model">
      <p className="eyebrow">De-Dupe, Kompetenz und Lifecycle</p>
      <h2 id="bw-relationship-model">Quellen vollständig erhalten, politische Objekte nicht doppelt zählen</h2>
      <div className="strategy-quality-layers">
        <details><summary>Quellen- und De-Dupe-Regel</summary><p>{badenWuerttembergCoalitionRelationshipModel.sourceDeduplication}</p></details>
        <details><summary>Parent-Child-Lifecycle</summary><p>{badenWuerttembergCoalitionRelationshipModel.parentChild}</p></details>
        <details><summary>Zuständigkeit und externe Akteure</summary><p>{badenWuerttembergCoalitionRelationshipModel.competence}</p></details>
        <details><summary>Haushaltsvorbehalt und Ressourcen</summary><p>{badenWuerttembergCoalitionRelationshipModel.budgetReservation}</p></details>
        <details><summary>Reife der Einzelobjekte</summary><p>{badenWuerttembergCoalitionRelationshipModel.maturity}</p></details>
      </div>
    </section>

    <section aria-labelledby="bw-existing-cases">
      <p className="eyebrow">Bereits vorhandene Wirkungsfälle</p>
      <h2 id="bw-existing-cases">Vorhandenen Fachbestand verknüpfen statt duplizieren</h2>
      <p>Die fünf freigegebenen Regierungswirkungsfälle bleiben eigenständige Wirkungsfälle. Wo der Koalitionsvertrag denselben Wirkungsgegenstand berührt, wird der politische Lebenslauf verknüpft; gemeinsame Themen oder Formulierungen sind kein Identitätsbeweis.</p>
      <div className="government-impact-grid">
        {badenWuerttembergCoalitionExistingImpactCases.map((impactCase) => <article key={impactCase.id}>
          <p className="eyebrow">Bestehende Wirkungsanalyse</p>
          <h3>{impactCase.title}</h3>
          <Link className="text-link" href="/laender/baden-wuerttemberg/regierung">Freigegebenen Regierungs-Fachstand öffnen</Link>
        </article>)}
      </div>
    </section>

    <StateCoalitionCommitmentInventory
      records={badenWuerttembergCoalitionCommitments.map((record) => ({
        commitment_id: record.commitment_id,
        chapter: record.chapter,
        commitment_text: record.commitment_text,
        source_locator: record.source_locator,
        atomic_count: record.atomic_count,
        container_children: record.container_children,
        parent_container_id: record.parent_container_id,
      }))}
      chapters={badenWuerttembergCoalitionChapters.map((chapter) => ({
        chapter: chapter.chapter,
        title: chapter.title,
        atomicCommitments: badenWuerttembergCoalitionCommitmentRegister.chapter_counts.find((count) => count.chapter === chapter.chapter)?.atomic_commitments ?? 0,
      }))}
    />

    <section aria-labelledby="bw-option">
      <p className="eyebrow">WÖk-Handlungsoption</p>
      <h2 id="bw-option">Keine fachlich freigegebene Gesamtportfolio-Empfehlung</h2>
      <p>Für die Kapitel- und Dokumentebene liegt noch keine fachlich freigegebene WÖk-Handlungsoption vor. Die ausgewiesenen Wirkbedingungen, Zielkonflikte und Prüfgrenzen werden nicht automatisch zu einer Empfehlung zusammengesetzt.</p>
    </section>

    <section aria-labelledby="bw-lifecycle">
      <p className="eyebrow">Politischer Lebenslauf</p>
      <h2 id="bw-lifecycle">Vom Mandat zum späteren Reality Check</h2>
      <ol className="impact-path">{badenWuerttembergCoalitionLifecycle.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
    </section>

    <section aria-labelledby="bw-sources">
      <p className="eyebrow">Vollakte · Originalquellen</p>
      <h2 id="bw-sources">Welche Quellen tragen diese Einordnung?</h2>
      <div className="government-source-groups">
        {badenWuerttembergCoalitionSources.map((source) => <article key={source.url}>
          <h3>{source.title}</h3>
          <p>{source.abstract}</p>
          <p><strong>Fundstellen:</strong> {source.locations.join("; ")}</p>
          <Link className="text-link" href={sourceDetailHrefForUrl(source.url)}>Quellenakte mit Original öffnen</Link>
        </article>)}
      </div>
    </section>

    <section className="government-process-meta" data-woek-process-metadata aria-label="Technische Transparenz">
      <h2>Technische Transparenz</h2>
      <p><strong>Fachstand:</strong> Wiederherstellungsprüfung und Fachreviews zu Baden-Württemberg · <strong>Analyseart:</strong> Ex-ante-Mandatsportfolio mit getrennten Kapitel- und untergeordneten Wirkungsfällen</p>
      <p><strong>Fassungsregel:</strong> Amtlich aktuell verlinkter Vertragstext mit internem Entwurfsvermerk; keine stille Ersetzung durch eine behauptete signierte Byte-Fassung.</p>
    </section>
  </article>;
}

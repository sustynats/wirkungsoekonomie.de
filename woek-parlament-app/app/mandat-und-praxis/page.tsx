import type { Metadata } from "next";
import Link from "next/link";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";
import { allPublicationSourceRecords } from "@/lib/publication/fachakten";

export const metadata: Metadata = {
  title: "Wahlprogramme & Koalitionsvertrag 2025",
  description: "Bundestagswahlprogramme 2025, Koalitionsvertrag und ihre quellengebundenen WÖk-Fachakten - von der Zusage bis zur parlamentarischen Praxis."
};

const comparisonSteps = [
  ["01", "Problem und Ausgangslage", "Welcher Zustand soll sich verändern - und welche Baseline, Zielgruppe und Schutzgüter sind betroffen?"],
  ["02", "Zusage oder Option", "Eine konkrete Passage aus Wahlprogramm oder Koalitionsvertrag mit Fundstelle, Fassung und Bedingungen."],
  ["03", "Folgencheck vor der Entscheidung", "Ist der Gegenstand klar genug? Wer entscheidet? Über welchen Mechanismus könnte sich etwas verändern und welche Alternative wird verdrängt?"],
  ["04", "Beschluss und Umsetzung", "Die tatsächlich beschlossene Fassung, ihr Status und der Vollzug - nicht bloß eine Ankündigung."],
  ["05", "Beobachtung, Zurechnung und Rückkopplung", "Was sich später verändert, was davon belastbar zurechenbar ist und was eine künftige Entscheidung robuster machen würde."]
] as const;

export default function MandatUndPraxisPage() {
  const electionPrograms = politicalSourceCatalog.filter((source) => source.sourceType === "ELECTION_PROGRAM");
  const coalitionAgreement = politicalSourceCatalog.find((source) => source.sourceType === "COALITION_AGREEMENT");
  const commitmentCount = politicalSourceCatalog.reduce((total, source) => total + source.commitmentCount, 0);
  const publicationRecords = allPublicationSourceRecords();
  const fullAnalysisKeys = new Set(publicationRecords
    .filter((record) => ["FEDERAL_ELECTION_PROGRAMME", "COALITION_AGREEMENT"].includes(record.kind))
    .map((record) => record.sourceKey)
    .filter((key): key is string => Boolean(key)));

  return (
    <div className="shell content-page mandate-page">
      <header className="page-intro mandate-intro">
        <p className="eyebrow">Bundestagswahl 2025 · Koalitionsvertrag 2025</p>
        <h1>Wahlprogramme und Koalitionsvertrag im Wirkungscheck</h1>
        <p className="lead">Hier liegen die vollständigen quellengebundenen Fachbestände zu den Bundestagswahlprogrammen und zum Koalitionsvertrag. Sie waren nicht verschwunden - die Navigation und der Reifehinweis hatten sie zuletzt wie reine Faktenakten erscheinen lassen. Das wird getrennt korrigiert: Quellen- und Ex-ante-Fachakten bleiben vollständig zugänglich; eine aktuelle redaktionelle Richtungsbewertung wird nur dort als fertige WÖk-Kurzbewertung gezeigt, wo sie den neuen Spezifitäts- und Qualitätsstandard erfüllt.</p>
      </header>

      <section className="notice notice-neutral" aria-label="Qualitätsstatus der Bundes-Wahlprogrammanalysen">
        <strong>Vollständige Fachakten vorhanden - aktuelle Kurzbewertung im Qualitäts-Re-Audit.</strong>
        <p>Alle sechs Wahlprogramme und der Koalitionsvertrag besitzen im freigegebenen Release-1-Bestand vollständige Ex-ante-Fachakten. Der Re-Audit prüft zusätzlich, ob Kurztexte, Wirkungsrichtungen und Extraktionen objektspezifisch genug sind. Generische Politikfeld-Templates oder zusammengezogene Quellenfragmente werden nicht als fertige Wirkungsaussage ausgegeben.</p>
      </section>

      <section className="mandate-overview" aria-labelledby="mandate-overview-title">
        <div><p className="eyebrow">Quelle → Vereinbarung → Praxis</p><h2 id="mandate-overview-title">{commitmentCount.toLocaleString("de-DE")} Zusagen aus sieben Primärquellen sind strukturiert erschlossen.</h2><p>Die Verbindung zwischen Wahlprogramm, Koalitionsvertrag und parlamentarischer Praxis bleibt ein Quellenabgleich. Ob ein Vorhaben ein positives, negatives, ambivalentes oder offenes Wirkungspotenzial besitzt, ist eine davon getrennte Fachfrage.</p></div>
        <dl>
          <div><dt>Wahlprogramme</dt><dd>{electionPrograms.length}</dd><small>{electionPrograms.reduce((total, source) => total + source.commitmentCount, 0).toLocaleString("de-DE")} strukturierte Zusagen</small></div>
          <div><dt>Koalitionsvertrag</dt><dd>{coalitionAgreement?.commitmentCount.toLocaleString("de-DE") ?? "-"}</dd><small>strukturierte Zusagen</small></div>
          <div><dt>Vollständige Fachakten</dt><dd>{fullAnalysisKeys.size}</dd><small>Release-1-Ex-ante-Fachbestände</small></div>
          <div><dt>Bewertungsregel</dt><dd>4</dd><small>positiv · negativ · ambivalent · offen - Evidenz separat</small></div>
        </dl>
      </section>

      <section className="mandate-reference" aria-labelledby="mandate-reference-title">
        <div>
          <p className="eyebrow">Übergeordneter Maßstab</p>
          <h2 id="mandate-reference-title">Ein Wahlprogramm setzt nicht den Maßstab. Es schlägt einen Weg vor.</h2>
          <p>Geprüft wird zuerst, welches Problem tatsächlich vorliegt und welcher Zielzustand erreicht werden soll. Danach folgt der Wirkpfad: Was verändert ein konkretes Instrument für Menschen, natürliche Lebensgrundlagen und demokratische Funktionsfähigkeit - und welche Schutzgrenzen dürfen nicht verrechnet werden?</p>
        </div>
        <ol>
          <li><strong>Problem:</strong><span>Welcher reale Zustand soll sich verändern?</span></li>
          <li><strong>Option:</strong><span>Welcher konkrete politische Hebel wird vorgeschlagen?</span></li>
          <li><strong>Wirkung:</strong><span>Welche Zustandsänderung ist plausibel, mit welcher Evidenz und welchen Gegenwirkungen?</span></li>
        </ol>
        <Link className="text-link" href="/methodik">Methodik vollständig erklärt <span aria-hidden="true">→</span></Link>
      </section>

      <section className="section section-compact comparison-status" aria-labelledby="status-title">
        <div className="section-heading"><div><p className="eyebrow">So lesen Sie den Bestand</p><h2 id="status-title">Vier Ebenen, die nicht miteinander verwechselt werden.</h2></div></div>
        <div className="mandate-status-flow" aria-label="Prüfablauf Wahlprogramme und Koalitionsvertrag">
          <article><span>01</span><h3>Originalquelle</h3><p>Wortlaut, Fundstelle, Dokumentfassung und Quellenfingerabdruck.</p></article>
          <article><span>02</span><h3>Ex-ante-Fachakte</h3><p>Wirkpfade, Risiken, Schutzgrenzen, Gegenfaktum und Datenbedarf - ohne behauptete Ist-Wirkung.</p></article>
          <article><span>03</span><h3>Redaktionelle Kurzbewertung</h3><p>Nur objektspezifische Richtung, Begründung, Key Finding und Evidenz. Generische Templates fallen durch.</p></article>
          <article><span>04</span><h3>Praxis & Reality Check</h3><p>Später: Beschluss, Vollzug, beobachtete Zustandsänderung und belastbare Zurechnung.</p></article>
        </div>
      </section>

      <section className="section section-compact" aria-labelledby="programmes-title">
        <div className="section-heading"><div><p className="eyebrow">Bundestagswahl 2025</p><h2 id="programmes-title">Wahlprogramme</h2><p>Die vollständigen Ex-ante-Fachakten bleiben auf den jeweiligen Dokumentseiten erreichbar. Der neue Sachsen-Anhalt-Aufbau dient als Blaupause für die redaktionelle Neudarstellung auf Bundesebene.</p></div></div>
        <div className="source-register">
          {electionPrograms.map((source) => {
            const hasFullAnalysis = fullAnalysisKeys.has(source.sourceKey);
            return <article key={source.sourceKey}>
              <p className="source-register-label">{source.actor}</p>
              <h3>{source.title}</h3>
              <section className="notice notice-neutral" aria-label={`Fachstatus ${source.actor}`}>
                <strong>{hasFullAnalysis ? "Vollständige Ex-ante-Fachakte vorhanden" : "Quellenregister vorhanden"}</strong>
                <p>{hasFullAnalysis ? "Der Release-1-Fachbestand ist vollständig abrufbar. Die aktuelle Richtungs- und Kurzbewertung wird nach dem neuen Editorial-Gate neu geprüft." : "Eine fertige Wirkungsanalyse wird nicht behauptet."}</p>
              </section>
              <p className="commitment-count"><strong>{source.commitmentCount.toLocaleString("de-DE")} strukturierte Zusagen</strong> · mit Fundstellen und Quellenfingerabdruck</p>
              <Link className="text-link" href={`/mandat-und-praxis/${source.sourceKey}`}>Fachakte und Zusagen öffnen <span aria-hidden="true">→</span></Link>
            </article>;
          })}
        </div>
      </section>

      {coalitionAgreement && <section className="section section-compact coalition-source" aria-labelledby="coalition-title">
        <div className="section-heading"><div><p className="eyebrow">Regierungsmandat 2025</p><h2 id="coalition-title">Koalitionsvertrag</h2></div></div>
        <article>
          <p className="source-register-label">{coalitionAgreement.actor}</p>
          <h3>{coalitionAgreement.title}</h3>
          <section className="notice notice-neutral"><strong>Vollständige Ex-ante-Fachakte vorhanden</strong><p>Der Vertrag ist weder Gesetz noch Wirkungsnachweis. Seine Zusagen werden getrennt mit parlamentarischen Entscheidungen und späterem Vollzug verknüpft.</p></section>
          <p className="commitment-count"><strong>{coalitionAgreement.commitmentCount.toLocaleString("de-DE")} strukturierte Zusagen</strong> · mit Quellenfingerabdruck dokumentiert</p>
          <Link className="text-link" href={`/mandat-und-praxis/${coalitionAgreement.sourceKey}`}>Koalitionsvertragsakte öffnen <span aria-hidden="true">→</span></Link>
        </article>
      </section>}

      <section className="section section-compact" aria-labelledby="chain-title">
        <div className="section-heading"><div><p className="eyebrow">Vom Versprechen zur Realität</p><h2 id="chain-title">Die Wirkungskette bleibt nachvollziehbar.</h2></div></div>
        <ol className="comparison-chain">
          {comparisonSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
        </ol>
      </section>

      <section className="notice mandate-next"><strong>Keine automatische Erfüllungs- oder Parteiwertung</strong><p>Eine dokumentierte Übernahme, Änderung oder Nichtübernahme belegt nur die Beziehung zwischen Texten und Entscheidungen. Wirkung wird getrennt anhand von Problem, Zielzustand, Wirkpfad, Gegenfaktum, Evidenz, Schutzgrenzen und Reality Check geprüft.</p><Link className="text-link" href="/entscheidungen">Zu den parlamentarischen Wirkungsakten <span aria-hidden="true">→</span></Link></section>
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}

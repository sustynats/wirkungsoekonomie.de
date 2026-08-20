import Link from "next/link";
import { jurisdictionById } from "@/lib/parliament/jurisdictions";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorial, type ProgrammeDirection } from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import { allPublicationSourceRecords } from "@/lib/publication/fachakten";

const saxonyAnhalt = jurisdictionById("sachsen-anhalt");

export const metadata = {
  title: "Landtagswahl Sachsen-Anhalt 2026 · WÖk-Wahlprogrammanalysen",
  description: "Sechs Wahlprogramme mit Gesamtzusammenfassung, Key Findings, redaktionell nachgeprüften Schlüsselpfaden, Quellen und vollständigem Zusageregister."
};

function directionLabel(direction: ProgrammeDirection) {
  return { POSITIVE: "positiv", NEGATIVE: "negativ", AMBIVALENT: "ambivalent", OPEN: "offen" }[direction];
}

export default function SaxonyAnhaltPage() {
  if (!saxonyAnhalt?.election) return null;
  const electionDate = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${saxonyAnhalt.election.date}T12:00:00`));
  const reviewBySource = new Map(allPublicationSourceRecords()
    .filter((record) => record.kind === "SAXONY_ANHALT_ELECTION_PROGRAMME_REVIEW" && record.sourceKey)
    .map((record) => [record.sourceKey as string, record]));
  const reviewedKeyPaths = saxonyAnhaltElectionProgrammes.reduce((sum, programme) => sum + Object.keys(saxonyAnhaltProgrammeEditorial(programme.sourceKey)?.centralAssessments ?? {}).length, 0);

  return (
    <main>
      <section className="shell state-hero-shell">
        <div className="state-hero">
          <div>
            <p className="eyebrow">Wirkungsportal Länder · Sachsen-Anhalt</p>
            <h1>Was würden die Wahlprogramme tatsächlich verändern?</h1>
            <p className="lead">Zur Landtagswahl am {electionDate} verbindet das Portal Originalprogramme mit einer wirkungsökonomischen Gesamtzusammenfassung, Key Findings und Einzelprüfungen. Die wichtigste Neuerung: Wirkungsrichtung und Evidenz stehen bereits im Überblick - und bleiben offen, wenn die alte Fachquelle noch nicht objektspezifisch genug ist.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="#wahlprogramme">6 Wahlprogrammanalysen</Link>
              <Link className="button button-secondary" href="/laender/sachsen-anhalt/quellen">Originalquellen</Link>
            </div>
          </div>
          <aside className="state-hero-fact" aria-label="Fachstatus des Wahlbereichs">
            <p className="eyebrow">Blaupause für Wahlprogrammanalysen</p>
            <h2>Gesamtbild zuerst. Dann die einzelne Zusage.</h2>
            <p>Jede Programmseite beginnt mit Gesamtbefund, Key Findings und einem Richtungsprofil der redaktionell nachgeprüften Schlüsselpfade. Erst danach folgen die Detailakten.</p>
            <dl>
              <div><dt>Wahltag</dt><dd>{electionDate}</dd></div>
              <div><dt>Programme</dt><dd>6 quellengebunden erschlossen</dd></div>
              <div><dt>Schlüsselpfade Editorial v2.0</dt><dd>{reviewedKeyPaths} objektspezifisch nachgeprüft</dd></div>
              <div><dt>Altbestand</dt><dd>vollständig erhalten, generische Templates nicht mehr als Kurzurteil</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="shell section state-purpose" id="so-funktioniert-es" aria-labelledby="state-purpose-title">
        <div className="section-heading"><div><p className="eyebrow">So lesen Sie die Analyse</p><h2 id="state-purpose-title">Vier Fragen statt einer Parteipunktzahl.</h2></div></div>
        <div className="state-purpose-grid">
          <article><span aria-hidden="true">A</span><h3>Was ist das Problem?</h3><p>Welcher reale Ausgangszustand soll sich ändern - und ist die Programmaussage dafür überhaupt ein konkretes Instrument?</p></article>
          <article><span aria-hidden="true">B</span><h3>In welche Richtung?</h3><p>Positives, negatives, ambivalentes oder offenes Wirkungspotenzial wird sichtbar begründet. Ein politisches Ziel allein ist noch keine positive Wirkung.</p></article>
          <article><span aria-hidden="true">C</span><h3>Wie belastbar?</h3><p>Evidenz wird getrennt von der Richtung ausgewiesen. Niedrige Evidenz macht eine Richtung nicht automatisch neutral.</p></article>
          <article><span aria-hidden="true">D</span><h3>Wo sind Grenzen?</h3><p>Zuständigkeit, Grundrechte, nicht kompensierbare Schutzgüter, Verteilung und spätere Reality Checks bleiben eigene Prüfebenen.</p></article>
        </div>
      </section>

      <section className="shell section section-surface state-publication-status" aria-labelledby="state-status-title">
        <div><p className="eyebrow">Qualitäts-Re-Audit</p><h2 id="state-status-title">Die alte Fachbasis bleibt erhalten - die öffentliche Bewertung wird strenger.</h2><p className="lead">Der Release-1-Bestand enthält vollständige Quellen- und Fachdatensätze, aber auch generische Politikfeld-Templates und einzelne Fehlzuordnungen oder Quellkollisionen. Die neue Lesefassung übernimmt solche Felder nicht mehr ungeprüft in die Kurzbewertung.</p></div>
        <ul>
          <li><strong>1. Gesamtzusammenfassung</strong><span>Jedes Programm erhält einen objektspezifischen Gesamtbefund und Key Findings statt einer bloßen Zusagenstatistik.</span></li>
          <li><strong>2. Richtung + Evidenz</strong><span>Redaktionell nachgeprüfte Schlüsselpfade zeigen Richtung, Begründung und Evidenz getrennt. Nicht nachgeprüfte Details bleiben ausdrücklich offen.</span></li>
          <li><strong>3. Source Fidelity</strong><span>Historische Fachquellen und Originaltexte werden nicht überschrieben. Korrekturen liegen als neue Editorial-Schicht darüber.</span></li>
        </ul>
      </section>

      <section className="shell section" id="wahlprogramme" aria-labelledby="state-programmes-title">
        <div className="section-heading"><div><p className="eyebrow">Wahlprogramme im Wirkungscheck</p><h2 id="state-programmes-title">Sechs Programme - sechs unterschiedliche Wirkungsprofile.</h2><p className="lead">Die Karten zeigen den programmweiten WÖk-Befund und ausgewählte Key Findings. Sie sind keine Wahlempfehlung und kein Ranking.</p></div></div>
        <div className="source-register state-programme-register">
          {saxonyAnhaltElectionProgrammes.map((programme) => {
            const review = reviewBySource.get(programme.sourceKey);
            const overview = review?.overview && typeof review.overview === "object" && !Array.isArray(review.overview) ? review.overview as Record<string, unknown> : {};
            const count = typeof overview.commitment_count === "number" ? overview.commitment_count : null;
            const editorial = saxonyAnhaltProgrammeEditorial(programme.sourceKey);
            const directionCounts: Record<ProgrammeDirection, number> = { POSITIVE: 0, NEGATIVE: 0, AMBIVALENT: 0, OPEN: 0 };
            for (const assessment of Object.values(editorial?.centralAssessments ?? {})) directionCounts[assessment.direction] += 1;
            return <article key={programme.sourceKey} data-woek-preview-card={editorial ? "published" : "fact-only"}>
              <p className="source-register-label">{programme.party} · WÖk-Wahlprogrammanalyse</p>
              <h3>{programme.title}</h3>
              {editorial ? <div data-woek-preview-assessment="published">
                <p className="status-pill">{editorial.overallLabel}</p>
                <p>{editorial.impactCoreSummary}</p>
                <ul>
                  {editorial.keyFindings.slice(0, 2).map((finding) => <li key={finding.label}><strong>{finding.label}:</strong> {finding.text}</li>)}
                </ul>
                <p><strong>Nachgeprüfte Schlüsselpfade:</strong> {(Object.keys(editorial.centralAssessments).length).toLocaleString("de-DE")} · {(["POSITIVE", "NEGATIVE", "AMBIVALENT", "OPEN"] as ProgrammeDirection[]).filter((direction) => directionCounts[direction] > 0).map((direction) => `${directionCounts[direction]} ${directionLabel(direction)}`).join(" · ")}</p>
              </div> : <p><strong>Redaktionelle Gesamtbewertung noch nicht freigegeben.</strong></p>}
              <div data-woek-process-metadata>
                <p className="commitment-count"><strong>{count?.toLocaleString("de-DE") ?? "-"} quellengebundene Zusageeinheiten</strong> · vollständiger historischer Fachbestand bleibt abrufbar</p>
              </div>
              {review ? <Link className="text-link" href={`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}`}>Gesamtbefund &amp; Einzelanalysen öffnen <span aria-hidden="true">→</span></Link> : <p><strong>Fachakte derzeit nicht verfügbar.</strong></p>}
            </article>;
          })}
        </div>
      </section>

      <section className="shell section state-reference-framework" aria-labelledby="state-reference-title">
        <div className="section-heading"><div><p className="eyebrow">Referenzrahmen</p><h2 id="state-reference-title">Woran wird eine Veränderung bewertet?</h2></div><Link className="text-link" href="/laender/sachsen-anhalt/quellen#referenzrahmen">Grundlagen und Quellen <span aria-hidden="true">→</span></Link></div>
        <p className="lead">Der bestehende Referenzmix aus SDGs, SDG+, Mensch – Planet – Demokratie, Recht und Landeszielen bleibt unverändert. Die Nachhaltigkeitsstrategie Sachsen-Anhalts bildet dabei die landesspezifische Zielebene. Diese Prüfanker werden getrennt betrachtet und nicht zu einer verdeckten Gesamtpunktzahl verrechnet.</p>
        <div className="state-reference-grid">
          {saxonyAnhalt.referenceFramework?.map((reference) => <article key={reference.id}>
            <p className="reference-kind">{reference.id.includes("sdg-plus") ? "WÖk-Erweiterung" : reference.id.endsWith("-mpd") ? "Systemische Wirkungsordnung" : reference.authority === "GLOBAL" ? "Gemeinsamer Referenzrahmen" : reference.authority === "CONSTITUTIONAL" ? "Landesrechtlicher Prüfanker" : reference.authority === "STATE_STRATEGY" ? "Landesspezifische Ziele" : "Wirkungsraum"}</p>
            <h3>{reference.label}</h3><p>{reference.description}</p>
            <span className="reference-stability">{reference.stability === "ENDURING" ? "dauerhaft geltender Rahmen" : reference.stability === "VERSIONED_CURRENT" ? "aktuelle, versionierte Referenz" : "je Fall konkret prüfen"}</span>
          </article>)}
        </div>
        <aside className="state-cross-border-note"><strong>Wirkung endet nicht an der Landesgrenze.</strong> Bundes-, EU- und kommunale Zuständigkeiten sowie grenzüberschreitende Folgen werden als eigene Pfade sichtbar gemacht und nicht stillschweigend dem Land zugerechnet.</aside>
      </section>

      <section className="shell section state-next" aria-labelledby="state-next-title">
        <div><p className="eyebrow">Nach der Wahl</p><h2 id="state-next-title">Vom Programm zur überprüfbaren politischen Praxis.</h2></div>
        <ol>
          <li><span>01</span><div><h3>Programm</h3><p>Ex-ante-Hypothesen und Risiken bleiben historisch erhalten.</p></div></li>
          <li><span>02</span><div><h3>Koalitionsvereinbarung</h3><p>Welche Zusagen werden übernommen, verändert oder verworfen?</p></div></li>
          <li><span>03</span><div><h3>Entscheidung und Vollzug</h3><p>Was wird tatsächlich beschlossen und praktisch umgesetzt?</p></div></li>
          <li><span>04</span><div><h3>Reality Check</h3><p>Was verändert sich real, was ist zurechenbar und was muss korrigiert werden?</p></div></li>
        </ol>
      </section>
    </main>
  );
}

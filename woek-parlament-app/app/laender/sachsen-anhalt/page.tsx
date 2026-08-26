import Link from "next/link";
import { ImpactVisualOverview } from "@/app/components/impact-visuals/ImpactVisualOverview";
import { jurisdictionById } from "@/lib/parliament/jurisdictions";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import { saxonyAnhaltProgrammeEditorial } from "@/data/presentation/sachsen-anhalt-programme-editorial-v2";
import { saxonyAnhaltTerminalRelease } from "@/data/presentation/sachsen-anhalt-terminal-release";
import { getSaxonyAnhaltPublicationSources } from "@/lib/publication/fachakten";
import { buildSaxonyAnhaltProgrammeModel } from "@/lib/presentation/sachsen-anhalt-programme-model";
import { getCommunicationMediaImpact } from "@/lib/state-programmes/communication-media-impact";
import { saxonyAnhaltExecutiveImpactSummary } from "@/lib/executive-impact/sachsen-anhalt";
import type { ExecutiveImpactSummary, ImpactDirection } from "@/lib/executive-impact/contracts";
import styles from "./page.module.css";

const saxonyAnhalt = jurisdictionById("sachsen-anhalt");

export const metadata = {
  title: "Landtagswahl Sachsen-Anhalt 2026 · WÖk-Wahlprogrammanalysen",
  description: "Sechs vollständige, quellengebundene Wahlprogrammanalysen mit konkreter Zustandsänderung, MPD, SDG, Materialität, Evidenz und Nichtkompensation."
};

const direction: Record<ImpactDirection, { icon: string; label: string }> = {
  POSITIVE: { icon: "↑", label: "positiv" },
  NEGATIVE: { icon: "↓", label: "negativ" },
  NEUTRAL: { icon: "—", label: "ohne materielle Richtung" },
  AMBIVALENT: { icon: "↕", label: "ambivalent" },
  OPEN: { icon: "○", label: "offen" },
};

const materiality = {
  LOW: "gering",
  MEDIUM: "mittel",
  HIGH: "hoch",
  CRITICAL: "kritisch",
  OPEN: "offen",
} as const;

function compact(value: string, max = 185) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const candidate = normalized.slice(0, max - 1);
  const cut = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, cut > max * .65 ? cut : candidate.length)}…`;
}

function DirectionSignal({ value }: { value: ImpactDirection }) {
  const signal = direction[value];
  return <span className={styles.direction} data-direction={value.toLowerCase()}><span aria-hidden="true">{signal.icon}</span>{signal.label}</span>;
}

function ProgrammeImpactCard({ party, title, href, summary }: { party: string; title: string; href: string; summary: ExecutiveImpactSummary }) {
  return <article className={styles.programmeCard} data-woek-programme-impact-card={summary.object_id} data-materiality={summary.overall_materiality.toLowerCase()}>
    <header>
      <p>{party} · Ex-ante-Wirkungsanalyse</p>
      <h3>{summary.bottom_line}</h3>
      <span className={styles.programmeTitle}>{title}</span>
    </header>
    <p className={styles.why}>{compact(summary.why_it_matters, 250)}</p>
    <div className={styles.mpd} aria-label="Mensch, Planet, Demokratie">
      {(["human", "planet", "democracy"] as const).map((key) => {
        const item = summary.mpd[key];
        return <div key={key}><span>{key === "human" ? "Mensch" : key === "planet" ? "Planet" : "Demokratie"}</span><DirectionSignal value={item.direction} /><small>{materiality[item.materiality]}</small></div>;
      })}
    </div>
    <div className={styles.sdgStrip} aria-label="Freigegebene SDG- und SDG+-Richtungen">
      {summary.sdg_impacts.slice(0, 4).map((item) => <span key={`${item.framework}:${item.sdg_id}`} title={item.label}><strong>{item.sdg_id}</strong><DirectionSignal value={item.direction} /></span>)}
    </div>
    <ol className={styles.paths} aria-label="Materielle Wirkpfade">
      {summary.material_paths.slice(0, 3).map((path) => <li key={path.id}><DirectionSignal value={path.direction} /><span>{compact(path.title, 92)}</span><small>{materiality[path.materiality]}</small></li>)}
    </ol>
    {summary.noncompensable_risks.length ? <p className={styles.noncompensation}><strong>Nichtkompensation:</strong> {compact(summary.noncompensable_risks[0].protected_interest, 105)}</p> : null}
    <p className={styles.evidence}><strong>Evidenz:</strong> {compact(summary.evidence_summary, 150)}</p>
    <Link className={styles.cta} href={href}>Wirkungsanalyse öffnen <span aria-hidden="true">→</span></Link>
  </article>;
}

export default async function SaxonyAnhaltPage() {
  if (!saxonyAnhalt?.election) return null;
  const electionDate = new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${saxonyAnhalt.election.date}T12:00:00`));
  const cards = await Promise.all(saxonyAnhaltElectionProgrammes.map(async (programme) => {
    const [review, register] = await getSaxonyAnhaltPublicationSources(programme.sourceKey);
    const editorial = saxonyAnhaltProgrammeEditorial(programme.sourceKey);
    const communication = getCommunicationMediaImpact(programme.sourceKey);
    if (!review || !register || !editorial || !communication) throw new Error(`Incomplete approved Sachsen-Anhalt publication binding for ${programme.sourceKey}`);
    const model = buildSaxonyAnhaltProgrammeModel(review.markdown, register.markdown);
    return { programme, summary: saxonyAnhaltExecutiveImpactSummary({ sourceKey: programme.sourceKey, model, editorial, communication }) };
  }));

  return <div>
    <section className={`shell ${styles.hero}`}>
      <div>
        <p className="eyebrow">Wirkungsportal Länder · Sachsen-Anhalt</p>
        <h1>Was bewirken die sechs Wahlprogramme?</h1>
        <p className="lead">Für die Landtagswahl am {electionDate} stehen die konkreten möglichen Zustandsänderungen zuerst: für wen, in welche Richtung, mit welcher Materialität und Evidenz – ohne Parteipunktzahl und ohne Wahlempfehlung.</p>
        <div className="hero-actions"><Link className="button button-primary" href="#wahlprogramme">Sechs Wirkungsprofile</Link><Link className="button button-secondary" href="/laender/sachsen-anhalt/quellen">Originalquellen</Link></div>
      </div>
    </section>

    <section className={`shell section ${styles.programmes}`} id="wahlprogramme" aria-labelledby="state-programmes-title">
      <div className="section-heading"><div><p className="eyebrow">Wahlprogramme im Wirkungscheck</p><h2 id="state-programmes-title">Sechs Programme – sechs materielle Wirkungsprofile.</h2><p className="lead">Jede Karte zeigt den stärksten freigegebenen Gesamtbefund, MPD, SDG/SDG+, bis zu drei materielle Pfade, Evidenz und Schutzgrenzen. Positive Einzelpfade kompensieren keine kritischen Risiken.</p></div></div>
      <div className={styles.cardGrid}>{cards.map(({ programme, summary }) => <ProgrammeImpactCard key={programme.sourceKey} party={programme.party} title={programme.title} href={`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}`} summary={summary} />)}</div>
    </section>

    <div className="shell section"><ImpactVisualOverview /></div>

    <section className="shell section state-purpose" id="so-funktioniert-es" aria-labelledby="state-purpose-title">
      <div className="section-heading"><div><p className="eyebrow">So lesen Sie die Analyse</p><h2 id="state-purpose-title">Wirkung ist Zustandsänderung – nicht Programmtext, Reichweite oder Punktzahl.</h2></div></div>
      <div className="state-purpose-grid">
        <article><span aria-hidden="true">A</span><h3>Was verändert sich?</h3><p>Betroffene, Mechanismus, Richtung, Materialität und Zeithorizont werden getrennt sichtbar.</p></article>
        <article><span aria-hidden="true">B</span><h3>Wie belastbar?</h3><p>Evidenz wird nie aus der Richtung abgeleitet; fehlende Evidenz ist keine neutrale Wirkung.</p></article>
        <article><span aria-hidden="true">C</span><h3>Wo sind Grenzen?</h3><p>Grundrechte, Demokratie und irreversible Naturfunktionen werden nicht gegen Vorteile verrechnet.</p></article>
        <article><span aria-hidden="true">D</span><h3>Was wäre real?</h3><p>Programme sind Ex-ante-Hypothesen. Erst messbare Zustandsänderungen bestehen den späteren Reality Check.</p></article>
      </div>
    </section>

    <section className={`shell section ${styles.audit}`} aria-labelledby="state-status-title">
      <div><p className="eyebrow">Terminaler Fachstand 6/6</p><h2 id="state-status-title">Vollbestand erhalten, öffentliche Projektion source-bound.</h2><p>Alle sechs finalen Manifeste schließen Quellenlücken und Kollisionen. Prozess-, Versions- und Registerdaten bleiben in den Detailakten nachvollziehbar, stehen aber nach dem Wirkungsbefund. Der historische Release-1-Arbeitsbestand bleibt als getrennte Zähldimension erhalten.</p></div>
      <dl><div><dt>Source Units</dt><dd>{saxonyAnhaltTerminalRelease.authoritative_totals.source_units.toLocaleString("de-DE")}</dd></div><div><dt>Wirkungsmechanismen</dt><dd>{saxonyAnhaltTerminalRelease.authoritative_totals.effect_mechanisms.toLocaleString("de-DE")}</dd></div><div><dt>Programme</dt><dd>6/6 terminal</dd></div><div><dt>Programmbilder</dt><dd>6/6 freigegeben</dd></div></dl>
    </section>

    <section className="shell section state-reference-framework" aria-labelledby="state-reference-title">
      <div className="section-heading"><div><p className="eyebrow">Referenzrahmen</p><h2 id="state-reference-title">Woran wird Veränderung bewertet?</h2></div><Link className="text-link" href="/laender/sachsen-anhalt/quellen#referenzrahmen">Grundlagen und Quellen <span aria-hidden="true">→</span></Link></div>
      <p className="lead">Der bestehende Referenzmix aus SDGs, SDG+, Mensch – Planet – Demokratie, Recht und Landeszielen bleibt in getrennten Prüfachsen erhalten und wird nicht zu einer verdeckten Gesamtpunktzahl verrechnet. Die Nachhaltigkeitsstrategie Sachsen-Anhalts bildet dabei die landesspezifische Zielebene.</p>
      <div className="state-reference-grid">{saxonyAnhalt.referenceFramework?.map((reference) => <article key={reference.id}><p className="reference-kind">{reference.id.includes("sdg-plus") ? "WÖk-Erweiterung" : reference.id.endsWith("-mpd") ? "Systemische Wirkungsordnung" : "Referenzrahmen"}</p><h3>{reference.label}</h3><p>{reference.description}</p></article>)}</div>
    </section>
  </div>;
}

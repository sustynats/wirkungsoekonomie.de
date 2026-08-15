import type { Metadata } from "next";
import Link from "next/link";
import { CaseTypeMark } from "@/app/components/CaseTypeMark";
import { listFachanalysen } from "@/lib/fachanalysen";

export const metadata: Metadata = {
  title: "WÖk-Fachanalysen",
  description: "Vertiefende wirkungsökonomische Analysen von Gesetzen, Portfolios und Politikfeldern."
};

const typeLabels = {
  PORTFOLIO_ANALYSIS: "Portfolioanalyse",
  SYSTEM_ANALYSIS: "Systemanalyse",
  POLICY_FIELD_ANALYSIS: "Politikfeldanalyse"
} as const;

export default function FachanalysenPage() {
  const analyses = listFachanalysen();
  return (
    <div className="shell content-page">
      <header className="page-intro">
        <p className="eyebrow">Vertiefende Dossiers</p>
        <h1>Zusammenhänge verstehen, ohne sie zu vereinfachen</h1>
        <p className="lead">Ein Wirkungscheck begleitet eine konkrete Entscheidung. Eine Fachanalyse zeigt den größeren Zusammenhang: Welche Fassung galt? Was war damals plausibel? Was ist inzwischen beobachtbar? Und an welcher Stelle endet die belastbare Aussage?</p>
      </header>
      <section className="plain-language-callout" aria-label="Was Fachanalysen leisten">
        <div>
          <p className="eyebrow">Kurz erklärt</p>
          <h2>Kein Gesamturteil aus einer Zahl</h2>
        </div>
        <p>Die Dossiers trennen Sachverhalt, Wirkungspotenzial, beobachtete Entwicklung, Rechenbedarf und offene Evidenz. So bleibt sichtbar, was eine Maßnahme wahrscheinlich verändert – und was noch nicht belegt ist.</p>
      </section>
      <div className="fachanalyse-list">
        {analyses.map((analysis) => (
          <article className="fachanalyse-card" key={analysis.slug}>
            <div className="case-card-topline"><CaseTypeMark kind="FACHANALYSE" compact /><span className="materiality">{typeLabels[analysis.type]}</span></div>
            <h2><Link href={`/fachanalysen/${analysis.slug}`}>{analysis.title}</Link></h2>
            <p className="fachanalyse-subtitle">{analysis.subtitle}</p>
            <p>{analysis.summary}</p>
            <dl className="fachanalyse-meta"><div><dt>Gegenstand</dt><dd>{analysis.scope}</dd></div><div><dt>Analyse-Stand</dt><dd>{new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date(`${analysis.analysisDate}T12:00:00Z`))}</dd></div></dl>
            <Link className="text-link" href={`/fachanalysen/${analysis.slug}`}>Dossier ansehen <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
      <p className="page-return"><Link href="/entscheidungen">← Zu den Entscheidungen</Link></p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { stateTargetRegisterForJurisdiction } from "@/data/state-target-registers";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

export const metadata: Metadata = {
  title: "Nachhaltigkeitsziele Sachsen-Anhalt",
  description: "Die 28 dokumentierten Nachhaltigkeitsziele Sachsen-Anhalts mit Originalwortlaut, Fundstellen, SDG-Bezug, Indikatoren und Wirkungsräumen."
};

export default function SaxonyAnhaltTargetsPage() {
  const register = stateTargetRegisterForJurisdiction("sachsen-anhalt");
  if (!register) return null;
  return <div className="shell content-page state-targets-page">
    <p className="record-context"><Link href="/laender">Länder</Link><span aria-hidden="true">/</span><Link href="/laender/sachsen-anhalt">Sachsen-Anhalt</Link><span aria-hidden="true">/</span><span>Landesziele</span></p>
    <header className="page-intro"><p className="eyebrow">Sachsen-Anhalt · Referenzrahmen</p><h1>28 landeseigene Nachhaltigkeitsziele – vollständig nachvollziehbar.</h1><p className="lead">Die Landesziele ergänzen die globalen SDGs. Sie bilden keinen Ersatz für eine Einzelfallanalyse und keine verdeckte Punktzahl: Zu jeder Entscheidung wird zusätzlich geprüft, was das Land entscheiden kann und welche Folgen über Sachsen-Anhalt hinaus reichen.</p><p>{register.notes}</p><p><Link className="text-link" href={sourceDetailHrefForUrl(register.sourceUrl)}>Quellensteckbrief zur Nachhaltigkeitsstrategie <span aria-hidden="true">→</span></Link></p></header>
    <section className="state-targets-overview"><div><span>{register.declaredTargetCount}</span><strong>dokumentierte Ziele</strong></div><div><span>{register.sourcePublishedAt}</span><strong>Fassung der Strategie</strong></div><div><span>{register.sourceRange}</span><strong>Quellenbereich</strong></div></section>
    <section className="state-target-list" aria-labelledby="target-list-title"><p className="eyebrow">Originalwortlaut, Bezug und Wirkungsraum</p><h2 id="target-list-title">Alle Ziele aus der Landesstrategie</h2>{register.targets.map((target, index) => <article id={target.id} key={target.id}><p className="source-register-label">Ziel {String(index + 1).padStart(2, "0")} · {target.sdgCodes.join(" · ")}</p><h3>{target.label}</h3><blockquote>{target.sourceQuote}</blockquote><dl><div><dt>Fundstelle</dt><dd>Seite {target.sourceLocation.page} · {target.sourceLocation.section}</dd></div><div><dt>Indikatorbezug</dt><dd>{target.indicatorRefs.join(" · ") || "nicht ausgewiesen"}</dd></div>{target.targetValue && <div><dt>Zielwert</dt><dd>{String(target.targetValue.value)} {target.targetValue.unit}{target.targetValue.targetDate ? ` · bis ${target.targetValue.targetDate}` : ""}</dd></div>}<div><dt>Messgrenze</dt><dd>{target.measurementBoundary}</dd></div></dl><details><summary>Wirkungsräume und Zuständigkeitsgrenzen anzeigen</summary><dl><div><dt>Sachsen-Anhalt</dt><dd>{target.effectSpace.sachsenAnhalt}</dd></div><div><dt>Andere Länder und Bund</dt><dd>{target.effectSpace.otherStatesOrFederal}</dd></div><div><dt>Europa und global</dt><dd>{target.effectSpace.europeOrGlobal}</dd></div></dl></details></article>)}</section>
    <p className="page-return"><Link href="/laender/sachsen-anhalt">← Zur Wahl in Sachsen-Anhalt</Link></p>
  </div>;
}

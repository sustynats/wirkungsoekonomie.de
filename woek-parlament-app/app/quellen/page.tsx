import Link from "next/link";
import { Suspense } from "react";
import { SourceArchiveList } from "@/app/components/SourceArchiveList";
import { listPublicSources } from "@/lib/sources/public-registry";

export const dynamic = "force-static";

export default async function SourcesPage() {
  const allSources = await listPublicSources();
  return (
    <div className="shell content-page source-archive-page">
      <header className="page-intro">
        <p className="eyebrow">Quellenarchiv</p>
        <h1>Jede Quelle mit Herkunft, Rolle und Fundstelle</h1>
        <p className="lead">Das Quellenarchiv zeigt nicht nur einen Link: Es dokumentiert Fassung, herausgebende Stelle, zeitliche Einordnung und die veröffentlichten Wirkungschecks, in denen eine Quelle entscheidungstragend verwendet wird.</p>
      </header>
      <section className="source-archive-principles" aria-label="Grundsätze des Quellenarchivs">
        <article><strong>Parlamentarische Originalquellen</strong><span>Drucksachen, Beschlussempfehlungen, Plenarprotokolle und Abstimmungsergebnisse belegen den parlamentarischen Sachverhalt.</span></article>
        <article><strong>Staatliche Datenquellen</strong><span>Statistik, Behörden, Haushaltsdaten und Evaluationen können Ausgangslage, Umsetzung und beobachtete Veränderungen belegen.</span></article>
        <article><strong>Wissenschaftliche Evidenz</strong><span>Studien, Reviews, Metaanalysen, Forschungsberichte und anerkannte Datensätze können Wirkmechanismen und Grenzen stützen.</span></article>
        <article><strong>Politische Originalquellen</strong><span>Wahlprogramme, Koalitionsverträge und Parteibeschlüsse belegen Aussagen und Zusagen der jeweiligen politischen Akteure – keine amtlichen Tatsachen.</span></article>
        <article><strong>Interessen- und Praxisevidenz</strong><span>Beiträge von Verbänden, Gewerkschaften, Unternehmen, NGOs und Betroffenenorganisationen zeigen Perspektiven und Erfahrungen. Diese Rolle wird sichtbar gekennzeichnet.</span></article>
        <article><strong>WÖk-Referenzen</strong><span>Begriffsleitfaden, Bewertungsregeln und Indikatoren erläutern Methode und Wertmaßstab. Sie ersetzen keine Tatsachenquelle.</span></article>
      </section>
      <Suspense fallback={<p className="notice notice-neutral">Quellenarchiv wird geladen.</p>}>
        <SourceArchiveList allSources={allSources} />
      </Suspense>
      <p className="page-return"><Link href="/transparenz">← Zu Transparenz und Grenzen</Link></p>
    </div>
  );
}

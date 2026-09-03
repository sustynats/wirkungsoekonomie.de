import type { Metadata } from "next";
import Link from "next/link";
import { dnsRegistryMeta, listDnsIndicators } from "@/lib/indicators";

export const metadata: Metadata = { title: "Wirkindikatoren und Deutsche Nachhaltigkeitsstrategie", description: "Die 82 amtlichen DNS-Indikatoren als getrennte Messontologie – ohne automatisch erzeugte WÖk-Wirkungsrichtung." };

export default function IndicatorRegistryPage() {
  const records = listDnsIndicators();
  return (
    <div className="shell content-page">
      <header className="page-intro">
        <p className="eyebrow">WÖk-Wirkindikatorenregister</p>
        <h1>82 amtliche DNS-Indikatoren – messbar, getrennt und ohne Scheinscore</h1>
        <p className="lead">Das Register dokumentiert Definition, politisches Ziel, Datenstand und Vergleichbarkeitsgrenzen der Deutschen Nachhaltigkeitsstrategie. Ein Indikator misst einen Zustand; er beweist weder Wirkung noch Zurechnung und erzeugt keine Empfehlung.</p>
      </header>
      <section className="notice notice-neutral">
        <strong>Amtliche Messontologie, keine WÖk-Bewertung</strong>
        <p>{dnsRegistryMeta.recordCount} eindeutige Indikatoren · amtlicher Quellstand {dnsRegistryMeta.commit.slice(0, 12)} · fachliche WÖk-Zuordnungen werden nur nach eigenständigem Review veröffentlicht.</p>
      </section>
      <section className="notice notice-neutral">
        <strong>Verbindung zum Masterregister und Reality Check</strong>
        <p>Die verbindliche Kette lautet: MasterItem → StateVariable → Indicator → Observation → Analysis / Reality Check. Der DNS-Indikator kann je nach Fall als Baseline, Target, Outcome, Distribution, Boundary, Context oder Reality-Check-Datum dienen. Beobachtung bleibt von Gegenfaktum und Attribution getrennt.</p>
        <p><a href="https://wirkungsoekonomie.de/woek-id-register/">WÖk-Masterregister v1.5 öffnen</a></p>
      </section>
      <div className="commitment-list">
        {records.map((item) => (
          <article key={item.indicator_id}>
            <p className="eyebrow">{item.indicator_id} · SDG {item.sdg_number}</p>
            <h2><Link href={`/methodik/wirkindikatoren/${item.indicator_id}`}>{item.official_name_2025}</Link></h2>
            <p>{item.official_definition || "Die amtliche Quelle weist keine eigenständige Definition aus."}</p>
            <p><strong>Datenstand:</strong> {item.official_data_state || "in der amtlichen Quelle nicht ausgewiesen"}</p>
          </article>
        ))}
      </div>
      <p className="page-return"><Link href="/methodik">← Zur Methodik</Link></p>
    </div>
  );
}

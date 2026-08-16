import type { Metadata } from "next";
import Link from "next/link";
import { MasterRegisterViewer } from "@/app/components/methodology/MasterRegisterViewer";
import { getMasterRegister } from "@/lib/master-register";

export const metadata: Metadata = {
  title: "WÖk-Masterregister v1.4",
  description: "Öffentlicher Viewer für WÖk-IDs, Indikatoren, Regeln, Quellen, Benchmarks und Kalibrierungsstatus."
};

export default async function MasterRegisterPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const data = getMasterRegister();
  const { query = "" } = await searchParams;
  return <div className="shell page-shell register-page">
    <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/methodik">Methodik</Link><span aria-hidden="true">/</span><span>WÖk-Masterregister</span></nav>
    <header className="register-hero">
      <div><p className="eyebrow">Technische Grundlage · Version {data.register_version}</p><h1>Das WÖk-Masterregister</h1><p className="lead">Hier lässt sich prüfen, welche Wirkungsaspekte gemessen werden, welche Regeln und Quellen gelten und wo Kalibrierungen, Benchmarks oder Fachprüfungen noch offen sind.</p></div>
      <dl><div><dt>WÖk-IDs</dt><dd>{data.statistics.woek_ids}</dd></div><div><dt>Indikatorfamilien</dt><dd>{data.statistics.indicator_families}</dd></div><div><dt>Regeltypen</dt><dd>{data.statistics.scoring_rules}</dd></div><div><dt>SDG+-Zuordnungen</dt><dd>{data.statistics.sdg_plus_assignments}</dd></div></dl>
    </header>

    <section className="register-explainer">
      <div><p className="eyebrow">Drei Ebenen der Prüfbarkeit</p><h2>Methodik, Fachakte und Register beantworten verschiedene Fragen.</h2></div>
      <ol><li><span>1</span><div><strong>Methodik</strong><p>Wie funktioniert das Verfahren?</p></div></li><li><span>2</span><div><strong>Fachakte</strong><p>Wie wurde es auf einen konkreten Fall angewendet?</p></div></li><li><span>3</span><div><strong>Masterregister</strong><p>Welche Indikatoren, Regeln, Quellen und Kalibrierungen liegen zugrunde?</p></div></li></ol>
      <p className="method-key-distinction">{data.interpretation_boundary}</p>
    </section>

    <MasterRegisterViewer items={data.items} initialQuery={query} />

    <section className="register-downloads" aria-labelledby="register-downloads-title">
      <div><p className="eyebrow">Daten und Regeln herunterladen</p><h2 id="register-downloads-title">Dieselbe Quelle, drei öffentliche Formate.</h2><p>Viewer und Downloads werden aus der kanonischen Registerdatei erzeugt. Die XLSX-Metadaten nennen das Institut für Wirkungsökonomie als Urheber.</p></div>
      <div><a className="button" href="/downloads/woek-masterregister/v1.4/WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx">XLSX herunterladen</a><a className="button button-secondary" href="/downloads/woek-masterregister/v1.4/register-v1.4.csv">CSV herunterladen</a><a className="button button-secondary" href="/downloads/woek-masterregister/v1.4/register-v1.4.json">JSON herunterladen</a><a className="text-link" href="/downloads/woek-masterregister/v1.4/manifest.json">Dateiprüfsummen und Manifest</a></div>
    </section>
  </div>;
}

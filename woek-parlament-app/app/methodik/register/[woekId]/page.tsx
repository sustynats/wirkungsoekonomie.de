import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMasterRegister, getMasterRegisterItem, isOpenRegisterStatus, polarityLabel, validityLabel } from "@/lib/master-register";

export function generateStaticParams() {
  return getMasterRegister().items.map((item) => ({ woekId: item.WOK_ID }));
}

export async function generateMetadata({ params }: { params: Promise<{ woekId: string }> }): Promise<Metadata> {
  const item = getMasterRegisterItem((await params).woekId);
  return item ? { title: `${item.WOK_ID}: ${item.Item}`, description: item.Definition } : {};
}

function Fact({ label, value }: { label: string; value?: string }) {
  return <div><dt>{label}</dt><dd>{value || "Nicht dokumentiert"}</dd></div>;
}

export default async function MasterRegisterDetailPage({ params }: { params: Promise<{ woekId: string }> }) {
  const item = getMasterRegisterItem((await params).woekId);
  if (!item) notFound();
  const isOpen = isOpenRegisterStatus(item);
  return <div className="shell page-shell register-detail-page">
    <nav className="breadcrumbs" aria-label="Brotkrumen"><Link href="/methodik">Methodik</Link><span aria-hidden="true">/</span><Link href="/methodik/register">Masterregister</Link><span aria-hidden="true">/</span><span>{item.WOK_ID}</span></nav>
    <header className="register-detail-hero"><p className="eyebrow">WÖk-Masterregister · {item.Version}</p><h1>{item.Item}</h1><p className="register-detail-id">{item.WOK_ID}</p><p className="lead">{item.Definition}</p><div className={`register-status-banner ${isOpen ? "is-open" : "is-usable"}`}><strong>{isOpen ? "Fachliche Validierung oder Quelle noch offen" : "Strukturell nutzbarer Registereintrag"}</strong><span>{item.Fachlogik_Status}</span></div></header>

    <section className="register-detail-summary"><article><p className="eyebrow">Was wird gemessen?</p><h2>{item.Indikatorfamilie}</h2><dl><Fact label="Messgröße" value={item.Definition} /><Fact label="Einheit" value={item.Einheit} /><Fact label="Technische Messrichtung" value={polarityLabel(item.Polarity)} /><Fact label="Systemgrenze" value={item.Systemgrenze} /></dl></article><article><p className="eyebrow">Woran wird es eingeordnet?</p><h2>{item.SDG_or_SDGplus}</h2><dl><Fact label="Unterziel oder Referenzbereich" value={item.Target} /><Fact label="Gültigkeitsstatus" value={validityLabel(item)} /><Fact label="Registerversion" value={item.Version} /></dl><p className="register-sdg-plus-note">SDG+ bezeichnet ausdrücklich eine Erweiterung der Wirkungsökonomie und keine zusätzliche UN-Kategorie.</p></article></section>

    <section className="register-detail-section"><div className="method-section-heading"><p className="eyebrow">Bewertungsregel und Schwellen</p><h2>Wie würde ein Messwert technisch eingeordnet?</h2><p>Die Messregel ist von der politischen Ex-ante-Richtungsbewertung getrennt. Eine offene Kalibrierung wird nicht als extern validierte Schwelle ausgegeben.</p></div><dl className="register-detail-grid"><Fact label="Scoring-Regel" value={item.Rule_ID} /><Fact label="Schwellen" value={item.Schwellen} /><Fact label="Schwellenkategorie" value={item.Schwellenkategorie} /><Fact label="Schwellenstatus" value={item.Schwellenstatus} /><Fact label="Grenzwertbasis" value={item.Grenzwertbasis} /><Fact label="Benchmark erforderlich?" value={item.Benchmarkbedarf} /><Fact label="Berechnungslogik" value={item.Berechnungslogik} /></dl></section>

    <section className="register-detail-section"><div className="method-section-heading"><p className="eyebrow">Quellenfunktion und Belegstatus</p><h2>Was belegt die Quelle - und was nicht?</h2></div><dl className="register-detail-grid"><Fact label="Fach- oder Messquellen" value={item.Quelle_detail} /><Fact label="Funktion dieser Quellen" value={item.Quellenfunktion} /><Fact label="Quellenstatus" value={item.Quellenstatus} /></dl><p className="method-key-distinction"><strong>Eine Mess- oder Berichtsquelle ist nicht automatisch eine Schwellenquelle.</strong> Sie kann bestimmen, was gemessen wird, ohne zu begründen, ab welchem Wert eine WÖk-Klasse gilt.</p></section>

    <section className="register-detail-section"><div className="method-section-heading"><p className="eyebrow">Datenqualität und Prüfung</p><h2>Welche Voraussetzungen gelten?</h2></div><dl className="register-detail-grid"><Fact label="Datenqualitätsanforderung" value={item.Datenqualitätsanforderung} /><Fact label="Erforderliche Prüftiefe" value={item.Assurance_Anforderung} /><Fact label="Fachlogikstatus" value={item.Fachlogik_Status} /><Fact label="Prüfpriorität" value={item.Prüfpriorität} /><Fact label="Offener Prüfhinweis" value={item.Prüfhinweis} /></dl><p className="register-no-data"><strong>Keine Daten sind kein Nullwert.</strong> Fehlt ein belastbarer Messwert, bleibt der Eintrag für diesen Anwendungsfall unbewertet.</p></section>

    <details className="register-technical-details"><summary>Technische Klassifikationsangaben öffnen</summary><dl><Fact label="Quellenkatalog-Verweise" value={item.Source_IDs} /><Fact label="Historische NACE-Beispiele" value={item.NACE_Legacy} /><Fact label="NACE-Version" value={item.NACE_Version} /><Fact label="NACE Rev. 2.1" value={item["NACE_Rev2.1"]} /><Fact label="NACE-Prüfstatus" value={item.NACE_Status} /></dl></details>

    <div className="register-detail-actions"><Link className="button" href="/methodik">Wie funktioniert die Wirkungsbewertung?</Link><Link className="button button-secondary" href="/methodik/register">Zurück zum Register</Link><a className="text-link" href="/downloads/woek-masterregister/v1.4/register-v1.4.json">Maschinenlesbare Gesamtdaten</a></div>
  </div>;
}

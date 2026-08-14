import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseCard } from "@/app/components/CaseCard";
import { listPublishedCases } from "@/lib/cases";

const sectionCopy: Record<string, { eyebrow: string; title: string; lead: string; empty: string }> = {
  bundestag: { eyebrow: "Deutscher Bundestag", title: "Bundestagsübersicht", lead: "Das MVP beginnt beim Deutschen Bundestag und bleibt datenmodellseitig für weitere parlamentarische Ebenen offen.", empty: "Aktuelle amtliche Fälle werden nach Prüfung ergänzt." },
  bevorstehend: { eyebrow: "Wirkungsradar", title: "Bevorstehende relevante Entscheidungen", lead: "Der Radar zeigt nur amtlich bestätigte Verfahrensstände. Fehlt eine belastbare Quelle, steht dort STATUS_UNVERIFIED.", empty: "Noch keine amtlich geprüften Termine veröffentlicht." },
  "im-verfahren": { eyebrow: "Wirkungsradar", title: "Laufende parlamentarische Verfahren", lead: "Ein parlamentarischer Vorgang folgt nicht zwangsläufig einer starren Pipeline. Jede Stufe braucht einen amtlichen Nachweis.", empty: "Noch keine amtlich geprüften Verfahren veröffentlicht." },
  entscheidungen: { eyebrow: "Wirkungschecks", title: "Analysierte Vorgänge", lead: "Eine Entscheidungsseite bewahrt Sachverhalt, Fassung, Wirkpfad, Quellen, Annahmen und spätere Änderungen zusammen auf.", empty: "Noch keine freigegebenen realen Wirkungschecks veröffentlicht." },
  historie: { eyebrow: "Historische Wirkungschecks", title: "Was damals bekannt war – und was wir heute zusätzlich wissen", lead: "Retrospektiven vermeiden Rückschaufehler: Spätere Daten werden nicht als damaliges Wissen ausgegeben.", empty: "Der erste historische Fall wird mit dokumentierter damaliger Quellenlage kuratiert." },
  monitor: { eyebrow: "Wirkungsmonitor", title: "Nach einer Entscheidung beobachten", lead: "Monitoring verbindet Baseline, Messplan, Evidenzgrenze und Korrekturtrigger. Eine Kennzahl allein ist keine Wirkung.", empty: "Noch keine freigegebene Monitoring-Beobachtung veröffentlicht." },
  dialog: { eyebrow: "Wirkungsdialog", title: "Rückkopplung ohne Personen-Score", lead: "Der spätere Dialog trennt Kontakt, Antwort und aggregierte Auswertung technisch. Das Portal bewertet weder Personen noch Parteien.", empty: "Dialogformate werden erst nach Datenschutz- und Methodenfreigabe aktiviert." },
  werkzeuge: { eyebrow: "Werkzeugkasten", title: "WÖk-Werkzeuge für die parlamentarische Prüfung", lead: "Das Portal verlinkt auf bestehende Methoden und zeigt ihren Reifegrad. Eine Demo ist keine automatische Fachentscheidung.", empty: "Die verbindliche Zuordnung zum führenden WÖMS 2.0 wird kontrolliert importiert." },
  methodik: { eyebrow: "Entscheidungsstandard", title: "Wirkungen prüfen, ohne Politik zu ersetzen", lead: "Die Analyse trennt Fakten, Annahmen, Wirkungspotenzial, Risiken, normative Einordnung und spätere Beobachtung.", empty: "Methodik wird aus den führenden Referenzen kontrolliert übernommen." },
  transparenz: { eyebrow: "Transparenz", title: "Quellen, Versionen, Redaktion und Grenzen", lead: "Jede Veröffentlichung soll zeigen, welche Fassung analysiert wurde, worauf sich Aussagen stützen und was nicht bekannt ist.", empty: "Der öffentliche Korrektur- und Finanzierungsnachweis wird vor dem produktiven Launch ergänzt." }
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sectionCopy[section];
  if (!content) notFound();
  const cases = listPublishedCases().filter((item) => {
    if (section === "bevorstehend" || section === "im-verfahren") return item.kind === "RADAR";
    if (section === "historie") return item.retrospective;
    if (section === "entscheidungen" || section === "bundestag") return true;
    return false;
  });
  return (
    <div className="shell content-page">
      <header className="page-intro"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="lead">{content.lead}</p></header>
      {section === "methodik" && <Methodology />}
      {section === "transparenz" && <Transparency />}
      {section === "werkzeuge" && <Toolbox />}
      {section === "dialog" && <Dialog />}
      {section === "monitor" && <Monitor />}
      {cases.length > 0 ? <div className="card-grid">{cases.map((item) => <CaseCard item={item} key={item.slug} />)}</div> : <div className="notice"><strong>{content.empty}</strong><p>Die technische Struktur ist vorhanden; Inhalte werden erst nach Quellen- und Redaktionsprüfung veröffentlicht.</p></div>}
      <p className="page-return"><Link href="/">← Zur Portalstartseite</Link></p>
    </div>
  );
}

function Methodology() {
  return <section className="method-grid"><article><span>01</span><h2>Sachverhalt</h2><p>Was soll entschieden werden, welche Fassung liegt vor und was gilt heute?</p></article><article><span>02</span><h2>Wirkungsanalyse</h2><p>Welche Wirkpfade, Potenziale, Risiken, Annahmen und Evidenzgrenzen sind plausibel?</p></article><article><span>03</span><h2>Normative Einordnung</h2><p>Wie wird dies transparent an SDGs, Agenda 2030 und SDG+ für Mensch, Planet und Demokratie eingeordnet?</p></article><article><span>04</span><h2>Rückkopplung</h2><p>Woran erkennen wir später, was eingetreten ist und wann eine Neubewertung nötig wird?</p></article><p className="notice">Führende Grundlagen: WÖMM 2.0, WÖMS 2.0, Begriffsleitfaden v1.3, Master Items v1.3 und T-SROI v1.1. Ihre kontrollierte lokale Übernahme steht noch aus.</p></section>;
}

function Transparency() {
  return <section className="transparency-list"><article><h2>Quellen</h2><p>Amtliche Quellen, externe Evidenz, WÖk-Interpretation und normative Bewertung bleiben sichtbar getrennt.</p></article><article><h2>Versionen</h2><p>Jede relevante Dokumentfassung erhält Quelle, Hash, Abrufdatum und eine redaktionell geprüfte Wirkungsänderung.</p></article><article><h2>Redaktion</h2><p>Kein Import und keine KI-Ausgabe veröffentlicht automatisch. Fachvoten brauchen Vier-Augen-Freigabe.</p></article><article><h2>Grenzen</h2><p>Das Portal ist keine Wahlhilfe, kein Parteiranking und kein Rechtsgutachtenservice.</p></article></section>;
}

function Toolbox() {
  return <section className="notice"><strong>Bestehenden WÖk-Werkzeugkasten nutzen.</strong><p>Der vollständige Katalog bleibt auf <a href="https://wirkungsoekonomie.de/werkzeuge/">wirkungsoekonomie.de/werkzeuge</a>. Der parlamentarische Kontext übernimmt nur klar gekennzeichnete Methoden und keine unbestätigten Tool-Backends.</p></section>;
}

function Dialog() {
  return <section className="notice"><strong>Geplant, noch nicht aktiv.</strong><p>CiviCRM, LimeSurvey und Analytics werden getrennt betrieben. Eine Teilnahme wird niemals zu einem Personen-, Fraktions- oder Gesinnungsscore.</p></section>;
}

function Monitor() {
  return <section className="notice"><strong>Messung folgt einer Entscheidung.</strong><p>Für jeden Monitorfall werden Baseline, erwartete Veränderung, Indikator, Quelle, Zeitbezug und Korrekturtrigger veröffentlicht. Ohne sie wäre eine spätere Wirkungsaussage nicht belastbar.</p></section>;
}

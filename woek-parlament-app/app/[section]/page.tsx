import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseCard } from "@/app/components/CaseCard";
import { dialogueQuestions, monitorRows, parliamentaryCases } from "@/data/cases";

const pageCopy: Record<string, { kicker: string; title: string; lead: string }> = {
  bundestag: { kicker: "Parlament", title: "Deutscher Bundestag", lead: "Der MVP ist von Beginn an für mehrere Parlamente modelliert. Sichtbar ist zunächst nur dieser eindeutige Zuständigkeitsrahmen." },
  bevorstehend: { kicker: "Wirkungsradar", title: "Bevorstehende Beratungen und Entscheidungen", lead: "Der Radar zeigt nur amtlich belegte und redaktionell freigegebene Vorgänge. Derzeit ist die Anbindung als transparenter Leerzustand vorbereitet." },
  entscheidungen: { kicker: "Archiv", title: "Analysierte Entscheidungen", lead: "Eine Dauerseite pro Vorgang verbindet Fassung, Analyse, spätere Beobachtung und Korrekturhistorie." },
  "im-verfahren": { kicker: "Verfahren", title: "Laufende Verfahren", lead: "Vorgangsphasen werden aus Daten abgeleitet, nicht in der Oberfläche festgeschrieben." },
  werkzeuge: { kicker: "Kontextuell", title: "WÖk-Werkzeugkasten", lead: "Hier werden bestehende WÖk-Werkzeuge nach Falltyp verlinkt. Neue Instrumente werden nicht für das Portal dupliziert." },
  methodik: { kicker: "Offenlegung", title: "Entscheidungsstandard und Methodik", lead: "Wirkung ist neutral und relational. Für eine Zielgröße sprechen wir von positiver Netto-Wirkung auf Mensch, Planet und Demokratie." },
  transparenz: { kicker: "Trust Center", title: "Transparenz und Unabhängigkeit", lead: "Quellen, Fassungen, Methodik, Korrekturen und Herausgeberschaft bleiben an jeder Analyse prüfbar." }
};

function Monitor() {
  return <><header className="page-intro"><p className="kicker">Wirkungsmonitor</p><h1>Beobachtung ist keine Kausalitätsbehauptung.</h1><p>Aus einer Zeitreihe allein folgt keine Kausalität. Erwartung, Indikator, Beobachtung und Einordnung werden daher getrennt veröffentlicht.</p></header><section className="monitor-table" aria-label="Wirkungsmonitor Demonstrator"><div className="monitor-head"><span>Erwartung (ex ante)</span><span>Indikator</span><span>Beobachtung</span><span>Einordnung</span></div>{monitorRows.map((row) => <div className="monitor-row" key={row.indikator}><div data-label="Erwartung (ex ante)">{row.erwartung}</div><div data-label="Indikator"><strong>{row.indikator}</strong><small>WÖk-ID: {row.woekId}</small></div><div data-label="Beobachtung">{row.beobachtung}<small>{row.datum}</small></div><div data-label="Einordnung"><span className={`mstatus mstatus--${row.status.toLowerCase()}`}>{row.status}</span></div></div>)}</section><section className="correction-trigger"><p className="kicker">Korrekturtrigger</p><h2>Kein automatisches Update eines Votums</h2><dl><div><dt>Ausgelöste Annahme</dt><dd>CONTENT_REQUIRED – keine kritische Annahme für einen realen Fall freigegeben.</dd></div><div><dt>Trigger</dt><dd>Abweichung erst nach belegter Beobachtung und redaktioneller Prüfung.</dd></div><div><dt>Folge</dt><dd><span className="chip">VERDICT_REVIEW_REQUIRED</span></dd></div></dl><p>Der Prozess ist redaktionell, nicht automatisch.</p></section></>;
}

function History() {
  return <><header className="page-intro"><p className="kicker">Historische Wirkungschecks</p><h1>Damals und heute bleiben getrennt.</h1><p>Eine Rückschau darf späteres Wissen nicht als damalige Entscheidungsgrundlage ausgeben. Diese Grenze wird im Datenmodell erzwungen.</p></header><section className="damals-heute" aria-label="Wissensstände im Vergleich"><article><p className="kicker">Damals</p><h2>Wissensstand zum Entscheidungszeitpunkt</h2><p><strong>CONTENT_REQUIRED.</strong> Für einen echten retrospektiven Fall werden hier nur Quellen mit Datum am oder vor dem Entscheidungsdatum angezeigt.</p><span className="chip">EVIDENZSTAND: ausstehend</span></article><article><p className="kicker">Heute</p><h2>Spätere Beobachtungen</h2><p><strong>CONTENT_REQUIRED.</strong> Hier erscheinen ausschließlich nachträgliche Quellen, beobachtete Entwicklung und begrenzte Zurechenbarkeit.</p><span className="chip">EVIDENZSTAND: ausstehend</span></article></section><section className="hindsight"><p className="kicker">Lernpunkt</p><h2>Erkenntnisse verbessern den Maßstab, nicht rückwirkend das damalige Wissen.</h2><p>feeds_into: <code>materiality_standard</code>. Erst eine freigegebene Retrospektive darf den Wirkungsrelevanz-Standard des Radars präzisieren.</p></section></>;
}

function Dialog() {
  return <><header className="page-intro"><p className="kicker">Wirkungsdialog</p><h1>Rückkopplung ist kein Fachvotum.</h1><p>Dialogformate können Perspektiven sichtbar machen. Sie bewerten keine Personen und entscheiden keine parlamentarische Abstimmung.</p></header><section className="trennung"><h2>Was Umfragen dürfen und was nicht dürfen</h2><div><p><strong>Sie dürfen:</strong> Hinweise, Wissenslücken und nachvollziehbare Fragen in den Radar einbringen.</p><p><strong>Sie dürfen nicht:</strong> eine Wirkungsanalyse ersetzen, ein Fachvotum verändern oder Menschen und Parteien bewerten.</p></div></section><section className="dialog-results"><h2>Ergebnisse nur mit vergleichbaren Fragen und Mindestkohorte</h2>{dialogueQuestions.map((item) => <article key={item.question}><h3>{item.question}</h3>{item.comparable ? <><div className="balken" aria-label="Keine veröffentlichten Umfrageergebnisse"><div><span>Parlament</span><i style={{ width: `${item.parliament}%` }} /><b>{item.parliament}%</b></div><div><span>Öffentlichkeit</span><i style={{ width: `${item.public}%` }} /><b>{item.public}%</b></div></div><p className="survey-meta">{item.meta} · Zeitraum: ausstehend · Auswahlverfahren: ausstehend · Repräsentativität: nicht behauptet.</p></> : <p className="notice">{item.meta} Parlament und Öffentlichkeit würden getrennt, nicht als Vergleich, veröffentlicht.</p>}</article>)}</section><section><div className="process-chain">{["Eingang: anonymisiert; keine Verknüpfung Person ↔ Antwort ↔ Analyse.", "Redaktionelle Prüfung gegen Wirkungsrelevanz-Standard.", "Aufnahme in den Radar mit ausgewiesener Herkunft.", "Grenze: Das Votum bleibt analysebasiert."].map((text, index) => <article key={text}><span>{index + 1}</span><p>{text}</p></article>)}</div></section></>;
}

function MethodOrTransparency({ section }: { section: string }) {
  const copy = pageCopy[section];
  return <><header className="page-intro"><p className="kicker">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.lead}</p></header><section className="editorial-grid">{section === "methodik" ? <><article><h2>Wirkung messen, nicht versprechen</h2><p>Wirkung ist tatsächliche Veränderung von Zuständen. Reichweite und Reporting sind keine Wirkung; Wirkungspotenzial und Wirkungsrisiko bleiben getrennt.</p></article><article><h2>Nichtkompensation</h2><p>Rote Linien werden nicht durch Vorteile an anderer Stelle verrechnet. Die Reverse Merit Order macht Engpässe sichtbar.</p></article><article><h2>Normativer Rahmen</h2><p>Positive Wirkung wird am SDG-/SDG+-Referenzrahmen bewertet. SDG+ ist eine WÖk-Erweiterung, keine UN-Kategorie.</p></article></> : <><article><h2>Institutionelle Herausgeberschaft</h2><p>Das Institut für Wirkungsökonomie verantwortet Quellen- und Korrekturpraxis. Die konkrete Finanzierung und Firewall werden vor Launch vollständig belegt.</p></article><article><h2>Keine Personen- oder Parteibewertung</h2><p>Die Prüfung bezieht sich auf nachvollziehbare Maßnahmen, Fassungen und Wirkpfade. Sie erstellt keine moralische Rangliste.</p></article><article><h2>Fassungssicherheit</h2><p>Eine Analyse nennt ihre Fassung, Quellenstand und Methodenversion. Materielle Änderungen lösen eine fachliche Überprüfung aus.</p></article></>}</section></>;
}

function Listing({ section }: { section: string }) {
  const copy = pageCopy[section];
  return <><header className="page-intro"><p className="kicker">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.lead}</p></header><div className="notice"><strong>Status vor Inhalt.</strong><p>Filter und reale Dokumentdaten werden erst mit der amtlichen, versionierten DIP-Importstrecke aktiviert.</p></div><section className="card-grid">{parliamentaryCases.filter((item) => section === "bevorstehend" ? item.kind === "RADAR" : true).map((item) => <CaseCard key={item.slug} item={item} />)}</section></>;
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "monitor") return <div className="container page-shell"><Monitor /></div>;
  if (section === "historie") return <div className="container page-shell"><History /></div>;
  if (section === "dialog") return <div className="container page-shell"><Dialog /></div>;
  if (section === "bevorstehend" || section === "entscheidungen" || section === "im-verfahren") return <div className="container page-shell"><Listing section={section} /></div>;
  if (section === "bundestag" || section === "werkzeuge" || section === "methodik" || section === "transparenz") return <div className="container page-shell"><MethodOrTransparency section={section} /></div>;
  notFound();
}

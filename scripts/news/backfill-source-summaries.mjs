import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const STORIES_FILE = path.join(ROOT, "data/news/stories.json");

// Einmaliger, quellengebundener Backfill für die beim Schemawechsel bereits
// veröffentlichten Akten. Künftige Fassungen kommen aus der geprüften
// source_summary-Ausgabe der regulären Analysepipeline.
const SOURCE_SUMMARIES = {
  "wt-98ff7e403362fdf9": `Die Bundesregierung berichtet, dass das KRITIS-Dachgesetz seit März 2026 in Kraft ist und erstmals mehrere Bereiche kritischer Infrastruktur in einem gemeinsamen Rahmen zusammenführt. Genannt werden Energie, Verkehr, Finanz- und Versicherungswesen, Gesundheit, Trink- und Abwasser, Abfallentsorgung, Informationstechnik, Telekommunikation, Ernährung, Weltraum und öffentliche Verwaltung. Als kritische Anlage gilt nach der Darstellung eine Einrichtung, die für die Gesamtversorgung wesentlich ist und mehr als 500.000 Menschen versorgt.

Für Betreiber sieht das Gesetz sektorübergreifende Mindeststandards für den physischen Schutz vor, darunter Notfallteams, Objektschutz, Ausfallsicherheit und Meldepflichten. Staatliche Stellen sollen Risikoanalysen bereitstellen. Die Länder können weitere Anlagen in ihrer Zuständigkeit bestimmen; Kriterien und Verfahren sollen per zustimmungspflichtiger Rechtsverordnung festgelegt werden. Eine Evaluierung ist nach zwei Jahren vorgesehen. Teile von Paragraf 14 treten laut Quelle erst am 1. Januar 2030 in Kraft.`,
  "wt-4b5d0962d323432a": `Die Europäische Kommission hat einen deutschen Kapazitätsmechanismus nach den EU-Beihilfevorschriften genehmigt. Er soll ab 2031 Kapazitäten für Stromerzeugung, Speicherung und flexiblen Verbrauch verfügbar machen; die Kommission beziffert die erwarteten Kosten auf 15,6 bis 35,2 Milliarden Euro. Die Bundesregierung berichtet ergänzend, dass Bundestag und Bundesrat das Strom-Versorgungssicherheits- und Kapazitätengesetz verabschiedet haben.

Nach der Regierungsdarstellung sollen in den nächsten zwölf Monaten elf Gigawatt steuerbare Kapazität ausgeschrieben werden; weitere Ausschreibungen sind für 2027 und 2029 vorgesehen. Anbieter sollen bereits für die Bereithaltung von Leistung vergütet werden und müssen zugesagte Kapazität zu relevanten Zeitpunkten nachweisen. Für erste Langzeitkapazitäten ist ein Resilienzkriterium zur Fertigung wesentlicher Bauteile im Europäischen Wirtschaftsraum genannt. Der Mechanismus soll Dunkelflauten bei wachsendem Anteil erneuerbarer Energien absichern.`,
  "wt-acae834e3431b203": `Die Bundesregierung kündigt den Baubeginn für ein Denkmal an, das an die polnischen Opfer des Zweiten Weltkriegs und der deutschen Besatzung Polens von 1939 bis 1945 erinnern soll. Der Deutsche Bundestag hat das Vorhaben beschlossen. Als Standort ist das Gelände der früheren Kroll-Oper im Zentrum Berlins vorgesehen, in der Nähe von Bundeskanzleramt und Bundestag.

Nach Angaben der Quelle läuft derzeit ein Gestaltungswettbewerb. Ein Preisgericht soll im Dezember 2026 über den Siegerentwurf beraten; die Errichtung soll 2027 beginnen. Kulturstaatsminister Wolfram Weimer äußerte sich anlässlich des Jahrestags des deutschen Überfalls auf Polen zu dem Vorhaben. Am vorgesehenen Ort besteht bereits seit Juni 2025 ein temporärer Gedenkort, der auf Initiative des Deutschen Polen-Instituts eingerichtet und der Öffentlichkeit übergeben wurde. Weitere Angaben zur endgültigen Gestaltung oder zu den Baukosten nennt die Meldung nicht.`,
  "wt-63b6c057c20a2143": `Die Bundesregierung meldet die Eröffnung des AI Safety and Security Institute Deutschland, kurz AISI Deutschland. Das nationale Kompetenz- und Evaluierungsinstitut wurde vom Nationalen Sicherheitsrat beschlossen und wird gemeinsam vom Bundesdigitalministerium und vom Bundesinnenministerium aufgebaut und geleitet. Es ist nach der Darstellung keine Regulierungsbehörde, sondern ein analytisch-operatives Kompetenzzentrum.

AISI Deutschland soll moderne KI-Modelle, Cybersicherheit und mögliche technische Risiken untersuchen, vorhandene Analysekapazitäten bündeln und Lösungen für den sicheren Umgang mit KI-Systemen entwickeln. Vorgesehen ist Beratung für Bundesregierung, Verwaltung, Wirtschaft und Zivilgesellschaft. Außerdem soll das Institut mit vergleichbaren Einrichtungen im Ausland Informationen austauschen und auf gemeinsame internationale Standards hinwirken. Zur Eröffnung betonten die Minister Karsten Wildberger und Alexander Dobrindt die schnelle technische Bewertung von KI-Systemen und die internationale Zusammenarbeit. Konkrete Angaben zu Personal, Budget oder einem Zeitplan nennt der Artikel nicht.`,
  "wt-b2161abe6d0a2603": `Der Beauftragte der Bundesregierung für Kultur und Medien hat ein neues Förderprogramm für Gedenkstätten und Erinnerungsorte zur NS-Terrorherrschaft und zur SED-Diktatur gestartet. Dafür sind im Regierungsentwurf des Bundeshaushalts 2027 insgesamt zehn Millionen Euro vorgesehen. Anträge können seit Veröffentlichung der Meldung eingereicht werden; die Bewerbungsfrist endet am 1. Oktober 2026. Über die Auswahl soll eine unabhängige Jury beraten, der frühestmögliche Projektbeginn ist der 1. Juli 2027.

Gefördert werden Vorhaben in drei Bereichen: Erhalt historischer Orte, Digitalisierung und digitale Lebenswelten sowie Vermittlung und anwendungsbezogene Forschung. Das Programm setzt die im November 2025 beschlossene neue Gedenkstättenkonzeption um. Kulturstaatsminister Wolfram Weimer erklärte zum Start, historische Orte, digitale Zugänge und zeitgemäße Bildungsangebote sollten unterstützt werden. Die Meldung führt außerdem aus, dass die bisherige Projektförderung verdoppelt werde.`,
  "wt-3c8762489a80692b": `Die Bundesregierung schlägt vor, das beim Umweltbundesamt geführte Regionalnachweisregister einzustellen. Das Register dokumentiert Nachweise, mit denen Stromlieferanten gegenüber Endverbrauchern die regionale Herkunft verbrauchten Stroms aus erneuerbaren Energien bestätigen können. Nach Darstellung der Verordnung wurde das Instrument in der Praxis wenig genutzt und erreichte das beabsichtigte Ziel, die Akzeptanz für zusätzliche Anlagen erneuerbarer Energien zu fördern, nicht.

Als weiteren Grund nennt die Vorlage den administrativen Aufwand der Registerführung und die Meldepflichten für Anlagenbetreiber und Energieversorgungsunternehmen. Diese stünden laut Bundesregierung nicht in einem angemessenen Verhältnis zum Nutzen. Eine europarechtliche Pflicht für Regionalnachweise bestehe nicht. Das gesonderte Herkunftsnachweisregister für Strom aus erneuerbaren Energien soll dagegen weitergeführt werden. Für die Verordnungsänderung ist nach der Bundestagsmeldung die Zustimmung des Deutschen Bundestages erforderlich; ein Abschluss dieses Verfahrens wird noch nicht berichtet.`,
  "wt-a48a6799c362009d": `Die Fraktion Bündnis 90/Die Grünen hat im Deutschen Bundestag eine Kleine Anfrage zur Erkennung und Behandlung von Sepsis in Deutschland gestellt. In der Anfrage wird Sepsis als lebensbedrohliche Fehlregulation der Immunantwort auf eine Infektion beschrieben, die unbehandelt zu Organversagen und Tod führen kann.

Die Abgeordneten fragen die Bundesregierung, ob sie Verbesserungsmöglichkeiten bei Erkennung und Versorgung von Sepsis sieht. Außerdem verlangen sie Auskunft über Forschungsmittel, die in den vergangenen zehn Jahren für die Sepsisforschung bereitgestellt wurden. Weitere Fragen betreffen Erkenntnisse zu Behandlungsfehlern und deren Nutzung für konkrete Maßnahmen zur Patientensicherheit. Die Bundestagsmeldung gibt den Inhalt der Anfrage wieder; eine Antwort der Bundesregierung, neue Versorgungsdaten oder bereits beschlossene Maßnahmen enthält sie noch nicht.`,
  "wt-293fa4edfc2b5a5d": `Bundesbankpräsident Joachim Nagel äußert sich in einem Interview mit Le Monde zur Inflation, zu möglichen Zinsschritten und zur europäischen Wirtschaft. Er verweist für Juli und August auf Inflationsraten im Euroraum von 2,9 beziehungsweise 3,3 Prozent und auf das mittelfristige Ziel von 2 Prozent. Für die EZB-Ratssitzung am 10. September hält er eine Zinserhöhung für wahrscheinlich, legt sich für spätere Sitzungen wegen schwankender Energiepreise, volatiler Finanzmärkte und großer Unsicherheit aber nicht fest.

Nagel begründet seine Haltung mit dem Risiko, dass länger erhöhte Inflation in Lohnverhandlungen einfließt. Zugleich beschreibt er den Euroraum als widerstandsfähig und nennt für Deutschland ein stärker als erwartetes zweites Quartal, robuste Ausfuhren und eine zufriedenstellende Auftragslage im verarbeitenden Gewerbe. Auf Basis der ersten beiden Quartale erwartet er für Deutschland im laufenden Jahr rund ein Prozent Wachstum.`,
  "wt-0e1ab5081b9f4045": `Die Veröffentlichung der Deutschen Bundesbank verweist auf die MFI-Zinsstatistik der Europäischen Zentralbank für Juli 2026. Im verfügbaren Kurztext werden zwei gewichtete Indikatoren für neue Kreditgeschäfte im Euroraum genannt. Der Indikator der Finanzierungskosten für neue Unternehmenskredite lag bei 3,80 Prozent. Für neue Wohnungsbaukredite an private Haushalte weist die Meldung einen entsprechenden Wert von 3,54 Prozent aus.

Beide Werte waren nach Angaben der Quelle gegenüber dem vorherigen Stand weitgehend unverändert. Die Meldung beschreibt damit die Kosten neuer Bankkredite in den beiden genannten Segmenten, nicht den gesamten Bestand bereits laufender Darlehen. Weitere Einzelheiten stehen in einer verlinkten EZB-Veröffentlichung als PDF. Der auf der Bundesbank-Seite verfügbare Kurztext nennt keine Ursachen für die Entwicklung und enthält dort auch keine weitergehende Bewertung des längerfristigen Trends.`,
  "wt-9e4c93f4907aaa42": `Das Bundeskabinett hat einen Gesetzentwurf zur Änderung des Windenergie-auf-See-Gesetzes beschlossen. Die bisherigen Ausbauziele für Offshore-Windenergie sollen bestehen bleiben, während Ausschreibungen, Netzanbindung und Finanzierung verändert werden. Die Bundesregierung nennt Bezahlbarkeit, Kosteneffizienz, Versorgungssicherheit und die tatsächliche Realisierung vergebener Projekte als Ziele des Entwurfs.

Vorgesehen ist, Netzanbindungen zu optimieren und die Regellaufzeit von Offshore-Anlagen von 25 auf 35 Jahre zu verlängern. Außerdem sollen Differenzverträge eingeführt werden: Betreiber erhalten einen abgesicherten Mindeststrompreis; darüber hinausgehende Erlöse werden abgeschöpft. Im Zuge des europäischen Net-Zero Industry Acts sollen zusätzliche Kriterien unter anderem für Cybersicherheit und Widerstandsfähigkeit gelten. Der Meeresnaturschutz bleibt laut Quelle Bestandteil der Genehmigungsverfahren. Bundeswirtschaftsministerin Katherina Reiche erklärte, die Reform solle Investitionssicherheit, realistischere Auktionen und eine bessere Nutzung der Leitungen schaffen.`,
  "wt-ab0d79d228a04a51": `Der Bundesrat führt unter der Nummer 504/26 einen Beratungsvorgang mit dem Titel „Verordnung zur Beschleunigung der Anerkennungsverfahren ausländischer Berufsqualifikationen in Heilberufen“. Der Eintrag ist auf den 3. September 2026 datiert. Als federführend ist der Ausschuss mit dem Kürzel G genannt; zusätzlich weist die Seite die Kürzel AIS, Fz und K für weitere beteiligte Ausschüsse aus.

Die Originalseite kündigt an, dass die Drucksachen zu diesem Vorgang noch nicht vorliegen und in Kürze veröffentlicht werden sollen. Damit dokumentiert sie bislang den Eingang und die Ausschusszuweisung der Verordnung, aber noch keine Beratungsergebnisse oder Entscheidung des Bundesrates. Auch konkrete Änderungen an Anerkennungsverfahren, betroffene Heilberufe, Fristen und Zuständigkeiten lassen sich dem derzeit veröffentlichten Eintrag noch nicht entnehmen. Diese Punkte bleiben bis zur Bereitstellung der angekündigten Drucksachen offen.`,
  "wt-c15cb7a9f3b72c35": `Die Bundesregierung hat den Entwurf eines Einkommensteuerreformgesetzes 2027 beschlossen. Vorgesehen sind höhere Beträge beim Kindergeld, beim Grund- und Kinderfreibetrag sowie beim Arbeitnehmer-Pauschbetrag. Der Einkommensteuertarif soll im Bereich zwischen 17.800 und 70.600 Euro abgeflacht werden. Die Maßnahmen sollen 2027 beginnen und ab 2028 vollständig gelten; das genannte Entlastungsvolumen liegt bei rund zehn Milliarden Euro pro Jahr.

Das Kindergeld soll je Kind und Monat von 259 Euro auf 267 Euro im Jahr 2027 und 272 Euro im Jahr 2028 steigen. Genannt werden außerdem höhere Kinder- und Grundfreibeträge sowie ein Arbeitnehmer-Pauschbetrag von 1.430 Euro. Zur Gegenfinanzierung nennt die Quelle Änderungen am Reichensteuersatz und den Abbau einzelner Vergünstigungen. Unter anderem sollen die Absetzbarkeit von Handwerkerleistungen sinken und der Pauschsteuersatz für Minijobs steigen. Ein Rechenbeispiel beschreibt für eine Familie mit zwei Kindern ab 2028 eine jährliche Entlastung von mehr als 600 Euro.`,
  "wt-b891f102e908a573": `Die Bundesregierung plant, die Strom-Netzentgelte auch von 2027 bis 2029 mit einem Bundeszuschuss zu dämpfen. Für jedes dieser Jahre sollen 5,525 Milliarden Euro aus dem Klima- und Transformationsfonds an die Übertragungsnetzbetreiber fließen. Das Kabinett hat dafür Änderungen am Energiewirtschaftsgesetz beschlossen. Die Netzbetreiber sollen den Zuschuss in ihre Entgeltkalkulation einbeziehen; über die Stromlieferanten soll die Kostendämpfung Haushalte und Unternehmen erreichen.

Für 2026 nennt die Quelle einen Zuschuss von 6,5 Milliarden Euro. Ein Haushalt mit 3.500 Kilowattstunden Jahresverbrauch könne dadurch rechnerisch etwa 100 Euro sparen, wobei der tatsächliche Betrag unter anderem von Netzgebiet, Verbrauch und Wohnsituation abhängt. Für 2027 liegen laut Artikel noch keine konkreten Entgeltdaten vor. Die Übertragungs- und Verteilnetzbetreiber sollen transparent machen, wie der Zuschuss die Netzentgelte verändert. Die Meldung ordnet den Zuschuss in weitere Maßnahmen wie die abgeschaffte Gasspeicherumlage und einen geplanten Industriestrompreis ein.`,
};

function wordCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

const store = JSON.parse(fs.readFileSync(STORIES_FILE, "utf8"));
let updated = 0;
for (const story of store.stories) {
  if (!story.published || story.listed === false) continue;
  const fallback = SOURCE_SUMMARIES[story.story_id];
  if (!story.source_summary && !fallback) throw new Error(`SOURCE_SUMMARY_BACKFILL_MISSING:${story.story_id}`);
  if (!story.source_summary) {
    story.source_summary = fallback.trim();
    updated += 1;
  }
  const words = wordCount(story.source_summary);
  if (words < 100 || words > 180) throw new Error(`SOURCE_SUMMARY_BACKFILL_LENGTH:${story.story_id}:${words}`);
  const paragraphs = story.source_summary.split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).length;
  if (paragraphs < 2 || paragraphs > 3) throw new Error(`SOURCE_SUMMARY_BACKFILL_PARAGRAPHS:${story.story_id}:${paragraphs}`);
  const currentVersion = (story.versions || []).find((version) => Number(version.version) === Number(story.current_version));
  if (currentVersion && !currentVersion.source_summary) currentVersion.source_summary = story.source_summary;
}
store.schema_version = "1.1";

if (process.argv.includes("--check")) {
  if (updated) throw new Error(`SOURCE_SUMMARY_BACKFILL_REQUIRED:${updated}`);
  console.log("Quellenzusammenfassungen vollständig und gültig.");
} else {
  const temporaryFile = `${STORIES_FILE}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryFile, STORIES_FILE);
  console.log(`Quellenzusammenfassungen ergänzt: ${updated}.`);
}

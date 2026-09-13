# Begrenzter API-Redaktionsprozess auf Oracle

Stand 13.09.2026. Die API bereitet native Bridge-Ausgaben vor. Discovery, Import,
Quellen-/Fakten-/MPD-Gates, unabhängiger semantischer Zweitpass und ACK bleiben
unverändert. Eine gelieferte Ausgabe ist noch keine Veröffentlichung.

## Betrieb

- Bestehender Faktencheck-API-Prozess, bestehender Schlüssel und beide vorhandenen
  Kostenjournale. Kein weiterer Provider, kein Vercel, keine Mac-Abhängigkeit.
- Private authentifizierte Route `/api/news-analysis/editorial-jobs`; Browser-Origin
  wird abgewiesen. Aktivierung nur über `NEWS_BRIDGE_API_ENABLED=true`.
- Oracle-Worker mit `api-processor-config.json` im bestehenden privaten
  Bridge-Verzeichnis: version 1, enabled, max_jobs_per_run 1..10,
  max_news_age_hours 1..24, news_only, excluded_job_ids. Pilot: news_only=true,
  zunächst ein frischer Auftrag je manuell ausgelöstem Lauf. `--dry-run` erzeugt weder Claims noch API-Aufrufe.
- Gesonderter API-Read-/Write-Preflight, atomarer Dropbox-Claim, unveränderliche
  Ausgaben. Fremde Claims, ACKs und vorhandene Ausgaben bleiben unangetastet.
- SQLite-Prozesslock verhindert parallele Worker. Timer alle zehn Minuten, erst
  nach vollständigem Pilot aktivieren. Bei Fehlern vorhandenen Import und
  Discovery weiterführen; keine Sperren gewaltsam entfernen.
- Originales Nachrichtendatum bleibt erhalten; standardmäßig maximal sechs
  Stunden alte Ereignisse, jüngste zuerst innerhalb der bestehenden Prioritäten.
- Aktuelle Korrekturen und unabhängige Zweitprüfungen werden vor neuen Entwürfen
  abgeschlossen. Die bestehende Artikelprüfung läuft bereits vor der Übergabe
  und nochmals im Import. Dadurch geht konkretes Fehlerfeedback direkt in den
  begrenzten Korrekturlauf, ohne zusätzliche GitHub-Runde.
- Ein einziges natives News-Ausgabeformat; die Software ergänzt den Transport.
  Fertige Antworten bleiben nach der reinen Transportkorrektur des Wissensprofils
  wiederverwendbar, ausschließlich bei identischem Quellen-/Methodenmanifest.
  Originaler Request-Key, Usage und Rohantwort bleiben erhalten. Keine neue
  fachliche Bewertung durch bloßes Umbenennen oder automatische Score-Ergänzung.
- Versionierte fachliche Regeln und Quellenmanifest statt angenommener
  ChatGPT-Erinnerungen. Der Entwurf verwendet mitgelieferte Quellenauszüge.
  Der unabhängige Fachpass verwendet einen bis maximal zwei Web-Suchzugriffe für fehlende Belege; maximal zwei Zusatzquellen werden durch die vorhandene Zugangs-/Zitat-
  Prüfung verifiziert. Fehlende Recherche bleibt HOLD; keine Quellenlektüre erfinden.
- Modell gpt-5.6-luna, reasoning medium, maximal 48.000 Ausgabetokens und
  300.000 UTF-8-Bytes Eingang; keine automatischen Provider-Retries, Bild- oder
  Schreibtools. Entwurf reserviert USD .25, Fachpass mit maximal zwei Suchzugriffen
  USD .50. Das ist eine vorherige Kostenreservierung innerhalb derselben
  Monatsgrenzen, keine Budgeterhöhung. Auch die Suchgebühr (USD .01 je Aufruf)
  wird in beiden Journalen verbucht. Tatsächliche Usage wird auch
  bei unbrauchbarem Ergebnis verbucht; Rohantwort bleibt privat gesichert.
- Dauerhafte Request-Keys ermöglichen GET-Wiederaufnahme ohne erneute Erstellung.
  Ungewisse Providerantworten sperren auch weitere Keys dieses Jobs. Insgesamt
  höchstens drei Provider-Aufrufe je Job, einschließlich aller Korrekturpfade.
- 5 EUR/Tag ist ein Effizienzziel, kein neuer Tagesstopp. Bestehende verbindliche
  Monatsfreigaben bleiben bestehen. Keine stillen Budgeterhöhungen.
- Personalisierte Formate nur über `editorial_request` und bestehende finale
  Freigabe. Der alte direkt publizierende `editorial_analysis`-Pfad ist gesperrt.

## Kostenabgleich und Rollback

Historische unbekannte Reservierungen dürfen nur mit einem verifizierten,
privaten Gesamtkostenexport abgeglichen werden. Der Abgleich erhält ursprüngliche
Einträge und Zähler, protokolliert eine separate aggregierte Korrektur und hält
mindestens die gemessenen Gesamtkosten einschließlich bestehender Steuer-/FX-
Reserve zurück. Keine angebliche Einzelabruf-Abrechnung und keine Löschung von
Kostenhistorie. Kein Abgleich bei nicht abgeschlossener Batch-/neuer Aktivität.
Beide Journale vor Änderung sichern; API kurz anhalten; beide Ergebnisse atomar
ersetzen; bei Fehler beide Originale wiederherstellen. Rechnung bleibt privat.

Vor Runtime-Wechsel Source-/Build-Hash prüfen, bisherige Runtime, Konfiguration
und Journale privat sichern. Nur getestetes, commitgebundenes Artefakt installieren.
Rollback: Worker-Timer anhalten, bisherigen Runtime-Build und Konfiguration
wiederherstellen. Nach bereits bezahlten Aufrufen niemals ein altes Kostenjournal
zurückspielen. Ergebnisse/Claims bleiben für sichere Wiederaufnahme gespeichert.

## Erfolgsnachweis

Nicht nur Dienststatus oder Output zählen: frischer Auftrag -> native Prüfung ->
getrennter Fachpass -> Import -> ACK -> tatsächlich abrufbare öffentliche URL.
`api-processor-health` ist ergänzende Betriebsinformation, kein Ersatz für
Publication Health. Ein einzelner Pilot belegt noch keinen stabilen Tagesbetrieb.

Pilotbefunde: Die erste API-Einstellung verbrauchte ihr Ausgabelimit vollständig
für internes Reasoning. Ein begrenztes Low-Profil liefert vollständige Antworten.
Konkurrierende Ausgabeformate verursachten anschließend Verschachtelungsfehler;
der Native-Vertrag und die frühe Artikelprüfung beheben diese Transportursache.
Ein generischer Validatorfehler verwechselte ausdrücklich gespeicherte
Pfadannahmen mit beobachteten Wirkungen. Er wurde separat mit Regressionstest
korrigiert; Aussagen im Artikel, in Begründungen und Outcomes bleiben geprüft.
HOLD, gelieferter Entwurf, unabhängige Prüfung und öffentliche Meldung werden
weiterhin getrennt gezählt. Nicht abgeschlossene Pilotfälle sind kein PASS.

Weitere Transportkorrektur: Vollständig beendete Werte dürfen ausschließlich um
fehlende äußere JSON-Klammern ergänzt werden; keine Wörter, Zahlen oder Felder.
Unvollständige Providerantworten bleiben gesperrt. Bereits explizit gelieferte
Ziffernstrings 0..5 werden nur in Magnitude-/Faktorfeldern numerisch typisiert.
Rohantwort und Kostenjournal bleiben unverändert; alle fachlichen Gates greifen.

Tarifnachweis, geprüft 13.09.2026: https://developers.openai.com/api/docs/models/gpt-5.6-luna
Input/Cache/Output USD 0.20/0.02/1.20 je Million Tokens. Alte Mini-Antworten
behalten ihren ursprünglichen Tarif. Die Reserven USD .25/.50 bleiben bestehen.
Der Modellwechsel ist ein gezielter Pilot; kein automatischer Modell-Fallback.

Der begrenzte Korrekturauftrag darf Quellenpaket und vorherige Ausgabe vollständig
enthalten (maximal 300 KB vor Transport-Escaping). Kurze konkrete Empfänger-,
Raum- und Zeitangaben werden nicht an einer Zwölf-Zeichen-Grenze verworfen;
Mechanismen und Begründungen bleiben inhaltlich und formal erforderlich.
Neue Recherche erhält die Ausschlüsse aus demselben Quellenregister wie die
nachgelagerte Prüfung. Dies erweitert keine Zugangsrechte.

Optionaler Wiederanlauf-Stichtag `news_not_before` bezieht sich auf das belegte
Quelldatum. Er stellt den älteren Nachrichtenstapel zurück, ohne ihn zu löschen.
Der normale Sechs-Stunden-Rahmen bleibt: Ein frisch ausgewählter Artikel darf
seinen unabhängigen Fachpass auch nach Ablauf der ersten Stunde noch abschließen.
Persönliche Aufträge unterliegen diesem Nachrichtenstichtag nicht.

Formatprüfung im laufenden Pilot: Der Web-Recherchepass liefert wiederholt
syntaktisch ungültige Freitext-JSON-Antworten. Die nächste begrenzte Pilotfassung
verwendet deshalb eine JSON-Schema-Ausgabehülle; die vollständigen fachlichen
Validatoren bleiben verpflichtend. `ready` bezeichnet auch die geprüft korrekte
Darstellung einer ausdrücklich vorläufig zugeschriebenen Nachricht, nicht deren
Umwandlung in eine unabhängig bestätigte Tatsachenbehauptung.
Die Web-Recherche erhält die bereits im Register für begrenzte Artikelprüfung
zugelassenen Hosts. Eigene WÖk-Seiten dienen dabei nicht als Ereignisbeleg;
Robots-, RSL-, Zitat- und Quellenprüfungen bleiben unverändert.

Der echte Recherchepilot bestätigt gültige Schema-Antworten mit Web-Suche.
Oracle benötigt für zugelassene PDF-Belege `poppler-utils` (`pdftotext`). Fehlende
Werkzeuge und vorübergehende Quellen-/Netzfehler stoppen nur die Validierung;
die fertige Antwort wird bei Wiederaufnahme erneut geprüft, ohne dafür einen
weiteren Text zu generieren. Ein fachlicher Prüffehler bleibt davon getrennt.

Für neue unabhängige Fachprüfungen wird GPT-5.4 Mini mit reasoning medium
gezielt geprüft, statt denselben günstigen Entwurfstyp erneut einzusetzen.
Der bisherige Forschungs-Pilot lieferte formal gültige Antworten, übernahm
aber widersprüchliche Haupt-/Nebenpfade. Die festen Reserven und Monatsgrenzen
bleiben erhalten, ebenso der Höchstwert von drei Aufrufen pro Auftrag.
Vorhandene Ergebnisse behalten Modell, Tarif und Request-Key. Kein Modell-
Fallback bei erschöpften Aufträgen. Entwurf: weiterhin GPT-5.6 Luna.
Tarifnachweis: https://developers.openai.com/api/docs/models/gpt-5.4-mini
(Input/Cache/Output USD 0.75/0.075/4.50 je Million Tokens).

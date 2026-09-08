# Wirkungsticker: Audio-Kurzfassungen und Oracle-Anlageversuch

Stand: 9. September 2026, Europe/Berlin. Ergaenzt um die anschliessende
ausdrueckliche 0-EUR-Vorgabe der Projektinhaberin.

## Ergebnis

Noch kein produktiver Audiodienst. Die Anlage der freigegebenen separaten
Always-Free-Instanz wurde in allen drei Frankfurter Verfuegbarkeitszonen
angefordert und jeweils mit fehlender A1-Hostkapazitaet abgelehnt. Es wurde
weder auf einen bezahlten Tarif gewechselt noch eine andere kostenpflichtige
Shape gewaehlt. Das bestehende Nachrichten-Backend bleibt unveraendert.

## Verbindlicher Produktumfang

Die vollstaendige redaktionelle Regel steht in Root-AGENTS.md unter
"Audio-Kurzfassungen des Wirkungstickers".

- Zunaechst eigenstaendige Beitraege "Meinung & Analyse".
- 60 bis 120 Sekunden tatsaechliche Audiodauer, einschliesslich Fazit.
- Kernbefund, konkrete/systemische Folgen und anschliessend Natalie Webers
  persoenliches Fazit. Die letzte Ebene wird mit "Meine Einordnung" hoerbar.
- Natuerlich, menschlich, locker, konkrete Beispiele, schrittweise Erklaerung;
  keine Imitation einer anderen Person. Natalie spricht ueber ihr autorisiertes
  eigenes Stimmprofil.
- Die Sprechfassung verdichtet den bestehenden Beitrag und dessen vorhandene
  Autorinnenperspektive. Sie fuehrt keine neuen Tatsachen, Erlebnisse oder
  persoenlichen Positionen ein. Bedingungen und Wissensgrenzen bleiben erhalten.
- Routinelauf ohne eingeschalteten Mac und ohne manuelle Einzelfreigabe.
- Audioauftraege bleiben von der Nachrichtenveroeffentlichung entkoppelt.

## Verbindlicher Nachtrag: absolut keine TTS-Zusatzkosten

Die Projektinhaberin hat nach dem Vergleich kostenloser Hostingalternativen
ausdruecklich festgelegt: "es muss absolut kostenlos bleiben".

- Budget fuer Einrichtung, Tests und Routine: 0 EUR zusaetzlich. Nicht nur
  die GPU, sondern auch Sprechfassung, Qualitaetspruefung, CPU, Speicherung,
  Datentransfer und weitere beteiligte Dienste sind einzubeziehen.
- Kein kostenpflichtiger Test, Tarifwechsel, Fallback, Guthabenkauf oder
  automatische Ueberziehung. Ein freies Kontingent ist keine Erlaubnis fuer
  anschliessende Zahlungen. Eine Budgetwarnung ist keine Kostensperre.
- Vor Aktivierung ist eine tatsaechlich durchgesetzte anbieterseitige
  Begrenzung auf 0 EUR Zusatzkosten fuer den gesamten Audio-Pfad zu pruefen.
  Das Verhalten bei Kontingentende, Probezeitende und Nebenleistungen muss
  geklaert sein. Ungeklaerte Abrechnung bedeutet: nicht aktivieren.
- Nach Ausschoepfung des kostenlosen Kontingents warten nur neue Audiojobs.
  Nachrichtentexte werden weiterhin unabhaengig veroeffentlicht. Vorhandene,
  zur Beitragsversion passende Audios bleiben nutzbar. Bestehende Budgets
  und Dienste der Textverarbeitung werden durch diese TTS-Regel nicht geaendert.
- Ein Vergleich von AWS, Azure, Google Cloud, Hugging Face und Modal war
  lediglich Recherche. Es wurde bei keinem dieser Anbieter ein neuer
  Audiodienst eingerichtet. Insbesondere ist ein monatliches Rechenguthaben
  bei Modal noch kein Nachweis eines eingerichteten 0-EUR-Ausgabenstopps.

Dies ist eine verbindliche Projektregel, noch keine implementierte oder
getestete technische Kostensperre. Solange die Voraussetzungen fehlen, kann
weder ein kostenloser produktiver Audiodienst noch sofortige Audioverfuegbarkeit
zugesagt werden.

## Oracle-Pruefung und tatsaechliche Versuche

Gepruefter Bestand vor dem Anlageversuch: ein Always-Free-Server der Shape
VM.Standard.E2.1.Micro mit 1 GB RAM, ein Boot-Volume mit rund 47 GB, keine
zusaetzlichen Block-Volumes im verwendeten Root-Compartment. Dieser Server
beherbergt das laufende Backend und ist kein geeigneter Ort fuer das grosse
Sprachmodell.

Freigegebene neue Konfiguration:

- Name: woek-audio-worker
- Region: eu-frankfurt-1, vorhandenes Root-Compartment
- VM.Standard.A1.Flex, 2 OCPUs, 12 GB RAM, normale On-Demand-Kapazitaet
- Canonical Ubuntu 24.04 Minimal aarch64, Image 2026.08.25-0
- Default-Boot-Volume 46,6 GB; keine weiteren Volumes
- Vorhandenes regionales Netzwerk/Subnet und vorhandener oeffentlicher
  SSH-Schluessel; keine neuen Firewallregeln, API-Schluessel oder IAM-Policies
- In-Transit-Verschluesselung aktiv, IMDS-Autorisierungsheader aktiv
- Keine vorgegebene Fault Domain

| Versuch | Ergebnis |
| --- | --- |
| AD-3, 2 OCPUs / 12 GB | `Out of capacity for shape VM.Standard.A1.Flex` |
| AD-1, 2 OCPUs / 12 GB | `Out of capacity for shape VM.Standard.A1.Flex` |
| AD-2, 2 OCPUs / 12 GB | Zunaechst `Too many requests for the user` |
| AD-2 nach mehreren Minuten Pause, unveraenderte Konfiguration | `Out of capacity for shape VM.Standard.A1.Flex` |

Die alte Fehlermeldung wurde vor dem Wechsel der Zone geschlossen und der
Create-Vorgang jeweils erneut ausgefuehrt. Ein bloss umgeschriebenes
Zonenlabel in einer vorhandenen Fehlermeldung wurde nicht als neuer Versuch
gezaehlt. Kein automatischer Wiederholungsloop und kein Umgehen der Drosselung.

Nachkontrolle der Instanz- und Boot-Volume-Listen: weiterhin nur der bestehende
Micro-Server, Status Running, und sein bisheriges Boot-Volume mit 47 GB.
Keine neue Instanz und kein zusaetzliches Boot-Volume aus den fehlgeschlagenen
Anlageversuchen. Ein HTTP-Aufruf von `/healthz` beantwortete die Anfrage mit
Status 200 und `ok: true`. Das ist ein Backend-Smoke-Test, kein Nachweis fuer
die Vollstaendigkeit saemtlicher Nachrichtenauftraege.

## Zusaetzlicher Qualitaetsbefund zur eigenen Stimme

Der zuletzt ausgefuehrte Akademie-Vergleich ist noch keine serienreife
Stimmkonfiguration. Ein rund 40 Sekunden langer Vergleichsclip wurde als
nicht eigene Stimme beanstandet, die Gegenprobe als passend beurteilt.
Beide bestanden die Text- und Signalpruefung. Der bisherige minimale
Aehnlichkeitsscore ist beim beanstandeten Clip sogar hoeher als bei der
akzeptierten Gegenprobe. Ein hoeherer einzelner Mindestscore ist deshalb
keine validierte Reparatur.

Die kuerzere Zieldauer des Tickers beseitigt diesen Befund nicht von selbst.
Ebenso wenig beweist der Wechsel von GPU auf CPU eine bessere Stimme. Die
private Stimmreferenz und die vorhandenen, unveraenderten Vergleichsdateien
muessen Bestandteil des Regressionstests bleiben. Keine private Aufnahme,
kein Sprecherembedding und kein Zugangstoken wurde ins Website-Repository
oder einen oeffentlichen Speicher uebernommen.

## Nächste technische Schritte nach verfuegbarer Kapazitaet

1. Exakte neue Instanz auflisten und SSH-Hostidentitaet pruefen. Betriebssystem
   aktualisieren; den Worker als eigenen Dienst mit begrenzten Ressourcen
   einrichten. Keine Aenderung am Nachrichtenserver.
2. Das vorhandene Qwen-Modell samt Tokenizer und Konfiguration an einen
   unveraenderlichen Snapshot binden. Eigene Referenz privat uebertragen.
3. Einen begrenzten CPU-Test mit einer 60- bis 120-sekuendigen Sprechfassung
   aus einer bereits veroeffentlichten Analyse durchfuehren. Laufzeit,
   Spitzenspeicher, Vollstaendigkeit und Stimmqualitaet messen; keine
   Produktionstauglichkeit aus Wortzahl oder technischer Decodierbarkeit ableiten.
4. Dauerhafte Auftragsverwaltung mit Versions-/Text-/Stimmprofilbindung,
   Wiederaufnahme, begrenzten Wiederholungen und getrennten Fehlerzustaenden
   anbinden. Keine neue kostenpflichtige KI-Runde pro Wiederholungsversuch.
5. Freigabe erst mit tragfaehiger automatischer Pruefung, einschliesslich der
   bekannten negativen Stimmbeispiele. Keine unbekannte Pruefqualitaet als
   bestandenen Gate ausgeben.
6. Nur fertige passende Audios als unveraenderliche Publikationsartefakte
   veroeffentlichen; Player in Liste und Detailseite ohne Autoplay und mit
   Transkript. Alte Audios duerfen aktualisierten Artikeln nicht falsch
   zugeordnet werden.

Die Punkte 1 bis 6 sind offen, nicht implementiert oder live und unterliegen
der vorgeschalteten 0-EUR-Pruefung. Ein kostenpflichtiger Hostingweg ist nach
dem ausdruecklichen Nachtrag nicht freigegeben. Fuer einen
erneuten Always-Free-Versuch ist zuerst die Instanz-/Volume-Liste zu pruefen,
damit ein zwischenzeitlich erfolgreicher anderer Versuch keine Dublette erzeugt.

## Quellen zur Plattform

- [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Google Colab FAQ](https://research.google.com/colaboratory/faq.html)
- [Qwen3-TTS: offizielles Repository](https://github.com/QwenLM/Qwen3-TTS)

Ein freies Kontingent ist kein Nachweis vorhandener Hostkapazitaet. Ein
interaktives Colab-Notebook ist keine dauerhafte Betriebsarchitektur.

## Repository-Pruefung

Dieses Aenderungspaket ergaenzt ausschliesslich Projektregeln und diesen
Betriebsbefund. `git diff --check` ist fehlerfrei. Es wurde kein Audio- oder
Website-Code geaendert, kein Website-Build ausgefuehrt und keine produktive
Audiofunktion als getestet oder veroeffentlicht ausgegeben.

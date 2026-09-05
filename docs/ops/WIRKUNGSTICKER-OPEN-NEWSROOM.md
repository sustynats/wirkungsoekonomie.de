# Wirkungsticker: offene Recherchebasis und Betriebsstand

Stand: 5. September 2026. Diese Datei dokumentiert das Erweiterungspaket, nicht eine Garantie lückenloser Nachrichtenabdeckung.

## Kosten und Grenzen

- Freigabe: höchstens **25 EUR monatlich für die Nachrichten-KI**. Das separate Vercel-Bruttobudget von 25 EUR bleibt unverändert. Kein Vercel-Build für dieses Paket; statische Veröffentlichung über GitHub Pages.
- Nachrichten-Abos und bezahlte Nachrichten-/Agentur-APIs: **0 EUR**. Keine Login-/Paywall-Umgehung, keine Removepaywall-Anbindung. Öffentliche RSS-Metadaten sind keine Volltextlizenz.
- `budget.mjs`: täglicher ECB-Kurs, höchstens sieben Tage alt; konservative USD-Grenze mit 19 % Steuer- und 10 % FX-Reserve, derzeit höchstens 18,90 USD. Ohne hinreichend frischen Kurs bleibt die KI zurückgestellt, Recherche läuft weiter.
- Oracle: eigener authentifizierter `/api/news-analysis`-Zugang, `gpt-5.4-mini`, serielle Einzelanfragen, rollend höchstens 48 Anfragen in 60 Minuten, maximal 40.000 Zeichen Eingabe und 6.500 Ausgabetoken. Öffentliche KI-Ratenlimits werden nicht angehoben.
- Nachrichtenmodus mit Reasoning `low` und eigenem JSON-Auftrag; kein angehängter allgemeiner Chat-Auftrag und keine sachfremden Website-Suchtreffer als Nachrichtenbeleg.
- Dauerhaftes privates Oracle-Kostenjournal reserviert 0,25 USD vor einer Anfrage; fehlgeschlagene/unterbrochene Aufrufe behalten die Reserve. Erfolgreiche Aufrufe ohne technische Wiederholung werden mit gemeldeten Tokenzahlen abgerechnet. September-Altkosten wurden mit 3 USD einschließlich Sicherheitsreserve übernommen. Der übergeordnete bestehende API-Kostenschutz bleibt wirksam.
- Ein festes Budget begrenzt die Zahl bearbeitbarer Kandidaten. 48 Anfragen in 60 Minuten sind technische Spitzenkapazität, keine Zusage dauerhafter Vollauslastung oder vollständiger Berichterstattung.

## Umsetzung A–N

| Bereich | Implementiert | Grenze / offener Ausbau |
| --- | --- | --- |
| A Recherchebasis | Institutionen, überregionale/regionale Medien, ÖR, internationale Quellen, Fachmedien, NGOs, eigene WÖk-Publikationen | Nicht die gesamte Medienlandschaft; tatsächliche Zugänge stehen in der Registry und im Laufbericht. |
| B Quellenzugang | Kostenlose direkte RSS/Atom/JSON-Zugänge, expliziter öffentlicher HTML-Adapter, Robots-Prüfung, Sperren und Backoff | Kostenpflichtige/ungeklärte Zugänge bleiben deaktiviert; Rechtefreigaben werden nicht behauptet. |
| C Datenmodell | Herausgeber, Quelldokumente, Ereignis-Fingerprints, Quellenzuordnung, versionierte Wirkungsakten | Clustering nutzt deterministische Merkmale, keine umfassende sprachübergreifende semantische Ereigniserkennung. |
| D Relevanz | Neuigkeit + Materialität + Evidenz, keine Markenpunkte, Interviews möglich, englische Relevanzsignale, protokollierte Ablehnungen | Regelvorfilter und KI bleiben fehlbar; kein perfekter Filter. |
| E Verifikation | Claim-Status, exakte Belegausschnitte, Zahlenabgleich, Abhängigkeiten nach Herausgeber/Agentur/Textübernahme | Keine vollständige maschinelle Entailment- oder Weltwahrheitsprüfung. Unbekannte gemeinsame Ursprünge können unerkannt bleiben. |
| F Journalismus | Eigene Nachricht vor WÖk-Analyse, Wahrheit zuerst, keine Teaser-Rekonstruktion gesperrter Texte | Metadaten können zu knapp sein; dann Zurückstellung, nicht Ausschmücken. |
| G Studien | Offene Europe-PMC-Suche nach Datum/Themen, DOI, Publikationstyp, Abstract und Prüfgrenze | Keine universelle Volltext-/Methodenprüfung aller Studien. Forschungsindex ist nicht Studienurheber. |
| H Früh veröffentlichen | `publication_depth=initial` mit gesichertem Kern; ausführliche Version separat; keine Tageszeit-Publikationssperre | Frühe Meldung muss trotzdem Neuigkeit, Materialität und Evidenz erfüllen. |
| I Aktualisieren | Bestehende URLs/Akten, Versionshistorie, neue Quellen und Belege; sichtbarer Nachrichtenstatus | Ähnlichkeitsverfahren kann Zuordnungen übersehen; keine Zusage perfekter Zusammenführung. |
| J Folgen prüfen | Konkrete Zusage, Quelle, Indikator, belegte Frist oder offener Termin; tatsächliche Wiedervorlage | Folgeprüfung vergleicht die eingerichteten aktuellen Quellen und zulässige Originaltexte, keine vollständige Websuche. |
| K Aktualität | Quellzeit, Erkennung, Prüf-/Publikationszeit, Rückstand und Warnungen; Quellcursor statt globalem Cursor | Fehlende Quelldaten werden nicht erfunden. Infrastruktur-/Actions-Verzögerungen sind möglich. |
| L Betrieb | 15-Minuten-Scheduler plus unabhängiger Oracle-Taktgeber, quellabhängige Intervalle, Wiederholungen, ETag/304, Fehler- und Budgetbericht | Keine 100%-Verfügbarkeitsgarantie; technische Störungen bleiben sichtbar. |
| M Transparenz | `/wirkungsticker/quellen/`, Herausgeberprofile, Relevanz, Perspektive, Zugang und letzter nachgewiesener Abruf | Abrufstatus ist eine Momentaufnahme, kein Gütesiegel. Nicht mit Literaturarchiv vermischen. |
| N Discovery/Abdeckung | Quellen-/Sprach-/Raumstatistik, möglicher Aufmerksamkeits-Relevanz-Abstand, neue Domains in Quarantäne | Eine allgemeine automatische Quellensuche/-freischaltung und vollständige politische/geografische Ausgewogenheitsprüfung sind nicht umgesetzt. |

## Recherche- und Zugangsentscheidungen

`content/news/source-registry.json` bleibt die bestehende Basis. `media-registry.json` ergänzt Herausgeber und kontrollierte Überschreibungen; `registry.mjs` führt beides zusammen.

- Reuters und dpa: keine gebuchten Direktdienste. Zugeschriebene Agenturmeldungen in anderen frei verfügbaren Quellen werden als gemeinsamer Ursprung behandelt, soweit erkennbar.
- tagesschau: Der offizielle Feed ist laut Anbieter nur für private, nichtkommerzielle Nutzung bestimmt. Das öffentliche Projekt ist nicht privat; deshalb Rolle E und kein automatischer Abruf. ZEIT und Süddeutsche bleiben wegen ungeklärter automatisierter Nutzung fallbezogen bzw. inaktiv. Andere öffentlich-rechtliche und überregionale Angebote sind separat eingerichtet.
- Bundesrat, BMAS und WTO: Robots-Sperre wird eingehalten, nicht mit anderem User-Agent umgangen.
- UN News: Nach der sicheren Weiterleitung von `/robots.txt` nach `/en/robots.txt` ist der Feed von `*/news/` erfasst. Zugang deshalb deaktiviert; keine Übernahme der ausdrücklich nur für Google Feedfetcher geltenden Ausnahme.
- Greenpeace: Atom-Pfad durch robots.txt gesperrt; erlaubte öffentliche Presseübersicht mit eigenem begrenztem HTML-Metadatenadapter und fünf Sekunden Crawl-Delay. Keine Bilder.
- WELT/BILD: kritische Beobachtung vorgesehen, Direktzugang noch nicht freigeschaltet. Apollo News und NIUS: redaktionell ausgeschlossen, Host-Sperre im Abrufschutz.
- Heise Wirtschaft, Netzpolitik und Security: öffentliche RSS-/Atom-Metadaten sind im gemessenen Probebetrieb aktiviert. Ein lokales Technikprofil verwirft Kaufberatung, Deals, Produkttests und routinemäßige Updates vor der KI, lässt aber Cyberrisiken, kritische Infrastruktur, digitale Grundrechte, Plattformregulierung, Arbeitsmarkt- und Lieferkettenfolgen passieren. Telepolis bleibt Rolle C und wird nicht dauerhaft gepollt; Kommentar, Analyse und Nachricht werden getrennt.

Quellen für technische Zugangsentscheidungen: [SPIEGEL-Syndication](https://gruppe.spiegel.de/syndication/haeufige-fragen), [DLF-RSS](https://www.deutschlandfunk.de/rss-angebot-102.html), [Heise-RSS](https://www.heise.de/news-extern/news.html), [tagesschau-RSS](https://www.tagesschau.de/infoservices/rssfeeds), [ZEIT-Impressum](https://www.zeit.de/impressum/index), [SZ-RSS](https://www.sueddeutsche.de/updates-rss), [Europe PMC API](https://europepmc.org/RestfulWebService), [Greenpeace-Presseübersicht](https://presseportal.greenpeace.de/releases/).

## Betrieb und Prüfung

```sh
npm run news:test
npm run news:build
npm run news:validate
npm run build:search
npm run news:health
npm run news:source-integrity:audit -- --strict
npm run news:source-portfolio:audit -- --strict
```

`reports/wirkungsticker-latest-run.json` enthält Source Health, Laufzahlen, Qualitätsstopps, Kostengrenze, Herkunfts-/Abdeckungsstatistik, Aktualitätswarnungen, fällige Folgeprüfungen, getrennte Betriebs-/Redaktions-/Queue-Zustände und einen Quellen-Funnel je Quelle. `data/news/newsroom.json` protokolliert Quelldokumente, Ereignisse, Zuordnungen und Entscheidungen. Diese internen Verzeichnisse werden vom öffentlichen Website-Artefakt ausgeschlossen.

Öffentlich bleiben eigene Nachrichten, Quellenlinks, Belegrollen und begrenzte Statusangaben. Fremde Artikeltexte sind nur flüchtige Prüfgrundlage; der dauerhafte Belegnachweis enthält Hashes statt kopierter Zitate.

Mobile Karten: Balken in kompakten Karten liegen ebenfalls unter dem Label. Eine `auto`-Grid-Spalte ließ prozentbreite Balken zuvor auf null schrumpfen. Browserprüfung bei 390 px: alle neun geprüften Balken 176 px breit, je vier Segmente, kein horizontaler Überlauf. Cacheversion wird mit ausgeliefert.

Titelbild-/Higgsfield-Automatisierung bleibt wie beauftragt ein späterer separater Schritt. Bestehende Renderer und UX-Komponenten werden nicht zurückgebaut.

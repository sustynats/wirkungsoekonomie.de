# Wirkung messen und nachweisen - Umsetzungs- und Prüfbericht

Stand: 20. Oktober 2026. Ausgangscommit: `95da13435fe1925c65915e9589bc445133a8b419`.
Arbeitszweig: `codex/wirkung-messen-20261020`. Vor Umsetzung mit `main` auf `483e5d1df725c74f0fca602003784f1c5495cde9` abgeglichen; zwischenzeitliche Änderungen erhalten.

## Umsetzung und Platzierung

Titel: **Wie lässt sich Wirkung messen und nachweisen?**
Unterzeile: Von der guten Absicht zu überprüfbaren Veränderungen für Mensch, Planet und Demokratie.
Kanonische Route: `/verstehen/wirkung-messen/`.

Die Bestandsprüfung fand den allgemeinen Methodik-Prüfablauf, das ausführliche Schulküchen-Beispiel, Fachpapiere, Buchkapitel und Begriffsdefinitionen. Keine davon übernimmt den allgemeinen Einstieg zu Messvorschrift, Nachweis, mehrjährigem Vergleich und korrigierbarer Entscheidung. Die neue Seite ergänzt diese Inhalte und verlinkt sie.

Enthalten sind sieben operationalisierte Messkarten, ein lokaler Steckbrief mit 19 Feldern, die ausdrücklich erfundene Mobilitätsrechnung 14/10 gegenüber 14/13, ein Kommunikations-Untersuchungsdesign ohne erfundene Publikumseffekte, ein mehrjähriger Messplan und vier konkrete Regeln für verantwortliche Korrektur. Ein semantischer Prüfablauf und die zwei Gruppen mit Zahlen und Textalternative erklären die Rechnung. Keine neuen T-SROI-, Steuer- oder Bewertungsregeln.

Der Rechner arbeitet deterministisch im Browser mit vier Eingaben und Reset. Kein Backend, kein Speicher und keine Datenübermittlung im Rechenpfad. Ein ausgefülltes Beispiel und eine leere Vorlage stehen jeweils als JSON und Markdown bereit. Alle vier Dateien werden aus derselben Content-Quelle erzeugt. Unbekanntes bleibt null; der lokale Schlüssel ist kein Registereintrag. Für diesen Auftrag sind keine neuen PDFs oder Word-Dateien erforderlich.

## Führende Quellen und Grenzen

- `content/grundlagen/WOEK_KERNREFERENZ.md`, v1.1: Wegweiser zur jeweiligen Originalquelle.
- Führender Begriffsleitfaden v1.8 vom 1.10.2026: Wirkung, Potenzial/Risiko, Messung, Nachweis/Zurechnung, KII, Nichtkompensation und Ebenenmodell.
- Masterregister v1.5 und getrennte Operationalisierungsarchitektur: MasterItem, Zustandsgröße, Indikator, Beobachtung und Analyse sind unterschiedliche Ebenen. Keine Zahl von Registereinträgen als Validierungsnachweis.
- Grundlagenwerk Kapitel 30-35 und 44; ergänzend 64/65, 68, 74/76/79 zu Beteiligung, Resilienz, Gesundheit, Öffentlichkeit und Kommunikation. Neuere Präzisierungen gehen älteren Begriffs- und Rechenstellen vor.
- T-SROI-Rechenstandard v1.1: `docs/impact-controlling/go10-methodenpapiere/t-sroi-rechenstandard-v1_1.md`. Keine Geldumrechnung der Mobilitätsentlastung und keine neue T-SROI-Formel.
- WÖMS 2.0: A01-A04, D03/D04, D06, D12, H07; WÖMM 2.0: Messung/Controlling, Verantwortung und Wirkungsrealisierungsplan. Aktuelle korrigierte Quellen vom 10.10.2026 sowie Methoden- und Canvas-Register berücksichtigt.
- Primärquellen: World Bank/IDB (Impact Evaluation in Practice, 2016), Eurostat (verfügbares Einkommen, ohne behauptetes Publikationsjahr), UN-Habitat (SDG 11.2.1), GHG Protocol Product Standard, FAO/UN (SDG 6.4.2), OECD (Beteiligungsverfahren), UNDRR (Resilienz-Scorecard). Quellenfunktion und Aussagegrenze stehen auf der Seite und im bestehenden Quellenarchiv. Sechs fehlende Primärquellen wurden nach dessen vorhandenem Schema ergänzt; die vorhandene GHG-Quelle WÖK-Q-0942 wird wiederverwendet.

Offengelegte Konflikte: Die ältere Datenbasisseite verwendet illustrative Kennungen und eine vereinfachte Vertrauensrichtung. Ein datierter Zusatz erläutert die heutigen Grenzen, ohne ihren Text still umzuschreiben. Ältere Buchstellen zu Ersatzwerten und ältere Leitfaden-Verweise wurden nicht als heutige Freigabe oder Messregel übernommen. Historische Fassungen und PDFs bleiben außerhalb dieser Änderung.

Für die Mobilitätsquote wurde kein passend bestätigtes MasterItem behauptet. Reale Region, Stichprobengröße, Zielwert, Zugangs- und Schutzkriterien sowie konkrete Personen sind vor einer tatsächlichen Erhebung fachlich festzulegen. Die Erklärung selbst behauptet keine Erhebung, validierten Gesamtansatz oder rechtliche Verbindlichkeit.

## Autoritative Quellen und Generatoren

- `content/site/wirkung-messen.json` und `.inc`; `scripts/site/build-measurement-explainer.mjs`.
- Vorhandene `ImpactProcess`, `ComparisonTable`, `ExampleCards`, `FeedbackLoop` und `writeContentPage`; letzterer nutzt den gemeinsamen Header und Footer und unterstützt optionale versionierte Seitenassets.
- `assets/js/measurement-learning.js`, `assets/css/measurement-learning.css`.
- `content/site/related-reading.json` und `scripts/site/apply-related-reading.mjs`: wiederholbare Projektion mit bestehenden Referenzbausteinen. Rückwärtsvergleich sichert den übrigen Bestandstext. Einstieg direkt nach dem Hero auf Verstehen; Querverweise in Methodik, kommunalem Einstieg und Lexikon-Methodik. Die ältere Datenübersicht erhält eine datierte Einordnung.
- Impact-Controlling-Einstieg: allgemeiner Web-Verweis aus `related-reading.json` vor dem bestehenden Küchen-Lernweg. Der an die Lern-PDF gebundene Originalgenerator bleibt unverändert.
- `content/site/core-questions.json`: vier fachliche FAQ, auch auf der neuen Seite verwendet. Keine Autorinnen-FAQ verändert.
- `content/glossary/imports/wirkung-messen-links.json` und Supplement-Liste des Glossargenerators: acht ermittelte bestehende Begriffe, ausschließlich zusätzliche Methodenverweise.
- `assets/data/navigation.json`: zusätzlicher Verstehen-Footerlink; keine neue Top-Level-Kategorie. `assets/js/search.js`: fünf passende Suchbegriffe, bestehende Definitionen bleiben auffindbar. `searchAliases` in der Seitenquelle werden über die optionale `search_aliases`-Metadatenübergabe des Seitentemplates in den Suchindex übernommen. Die P1.3-Schnittstelle gewichtet vollständige Suchaliase vor bloßen Teilaliasen; genaue Begriffstitel behalten ihren stärkeren Rang. Ein Regressionstest prüft die erste Ergebnisseite für alle fünf beauftragten Anfragen am tatsächlichen Artefakt.
- `assets/js/contextual-questions.js`: vorhandene Opt-out-Konfiguration verhindert eine zusätzliche automatische Sprungliste neben dem Inhaltsverzeichnis und der fachlichen FAQ.
- Vorhandenes Evidenzregister, Bibliografie und Quellenarchiv-Supplemente: Quellen und Rückverweise.
- `scripts/lib/public-learning-downloads.mjs`: exakt vier öffentliche, erzeugte Arbeitsblätter. Downloadschutz und Bibliotheksformat-Normalisierung wurden nur um diese ausdrücklich beauftragten Dateien ergänzt; beliebige JSON-Dateien, Verzeichnisse und private Dateipfade bleiben unzulässig. Negativtests prüfen diese Grenze.
- `package.json`: Seite vor Suche/Taxonomie; Querverweise zusätzlich nach Installation des freigegebenen Lexikon-Artefakts. Die gebundenen Methodik-PDF-Quellen und Lexikon-Fachdatensätze werden nicht verändert.

## Tests und Sichtprüfung

Die abschließende Wiederholung bestand: `WOEK_PDF_BUILD_MODE=verify SOURCE_DATE_EPOCH=1787270400 npm run build` und `SOURCE_DATE_EPOCH=1787270400 npm run build:artifact`, jeweils Exit 0, einschließlich Pre-/Postbuild und sämtlicher unverändert aktiver Schutzprüfungen. `npm run measurement:test` besteht mit 20/20, einschließlich des tatsächlichen ausgelieferten Suchindex. Einzelheiten und Prüfsummen stehen in `wirkung-messen-pruefergebnisse-2026-10-20.json`.

Tatsächlich bestanden:

- `npm run news:test`: 2.082/2.082. Die isolierte Instituts-Generator-Testumgebung kopiert nun auch die vom gemeinsamen Seitentemplate benötigten Footer-Bausteine. Der Test prüft weiterhin unveränderte Quellen, Nachrichten und wiederholbare Ausgabe.
- `python3 -m unittest discover -s tests/navigation -v`: 7/7.
- `node --test tests/site/search-api.test.mjs tests/site/browser-search.test.mjs`: 5/5, einschließlich vollständiger gegenüber teilweiser Aliasübereinstimmung und unverändertem P1.3-Datenvertrag.
- Release-Audit: 31/31 Prüfungen zur staatlichen Nachhaltigkeitsarchitektur und 6/6 ergänzende Bereichsprüfungen.
- Finale Artefaktfassung: alle 18.881 indexierbaren Routen in Suche und Sitemap sowie über HTML-Linkpfade erreichbar; 0 defekte interne HTML-Links. Ein wiederholter Artefaktbuild erhielt 13 auftragsbezogene Dateien bytegleich. Die anschließende Suchkorrektur änderte davon ausschließlich den versteckten Alias-Metadateneintrag der neuen Seite; das gerenderte HTML ist ohne diesen Eintrag bytegleich. Der aktuelle Seiten-/Downloadgenerator wird zusätzlich zweimal bytegleich geprüft; alle sechs Querverweis-Projektionen sind idempotent.

Zwei konkrete Integrationsfehler wurden behoben: Nachgelagerte Produktionsfilter entfernten die ausdrücklich beauftragten Markdown-Downloads; die Ausnahme ist jetzt auf exakt vier erzeugte Arbeitsblätter beschränkt und durch Positiv- und Negativtests gesichert. Der Linkprüfer behandelte Pfade oberhalb des URL-Wurzelverzeichnisses als Dateisystempfade. Er löst sie jetzt wie der Browser am Web-Ursprung auf; ein tatsächlich fehlendes Ziel stoppt ihn weiterhin.

Das Größen-Gate blieb unverändert bei 950 MB. Zunächst war die Auslieferung 951,5 MB groß. Ausschließlich unbedeutende JSON-Leerzeichen der erzeugten Ticker-Laufzeitdatei werden entfernt. Zeichenketten und sämtliche Zahlenliterale bleiben erhalten; ein Datenvergleich bestätigte identische Werte. Gebundene Lexikon-Dateien, Arbeitsblätter und historische Quellen werden nicht kompaktiert. Einsparung: 14.573.543 Bytes. Die finale fertige Auslieferung erreicht 937,5 MB. `check:size` besteht mit der unverändert sichtbaren Warnung ab 850 MB; das harte Limit von 950 MB ist eingehalten. `check:privacy` und `check:url-baseline` bestehen, ohne entfernte Baseline-URLs. Die bestehende Warnschwelle von 850 MB bleibt sichtbar.

Bereits im Chrome-Browser geprüft: 1393 und 1512 Pixel Desktop, 390 und 320 Pixel Mobil; aufgeklappte Messkarte; Vergleichsgrafik; Rechnerfälle 3/0/-3; Werte über 100; leere Eingabe mit Fehleransage und ausgeblendetem Ergebnis; Reset per Enter und Fokus auf erstes Feld; Tab zum zweiten Feld. Kein horizontaler Seitenüberlauf in den geprüften Ansichten. Bei über Content-Security-Policy blockiertem JavaScript bleiben das vollständige Rechenbeispiel und die Arbeitsblätter lesbar. Ein Inhaltsverzeichnis, keine zusätzliche automatisch erzeugte Sprungliste.

Im fertigen Artefakt wurden Titel/Einstieg und Lernvergleich bei 1.512 Pixeln visuell geprüft; die 320-Pixel-Einstiegsansicht zeigte ebenfalls keinen horizontalen Überlauf. Rechnerfälle 3/0/-3, leere Eingabe, Reset per Enter und Fokuswechsel wurden dort nochmals bedient. Alle vier Downloads lieferten HTTP 200 und exakt die erzeugten Bytes.

Die Oberfläche zeigte die neue Seite für „Wirkung messen“, „Wirkungsnachweis“, „KII“ und „Wirkungspotenzial“. Beim letzten Durchgang mit der vollständigen Frage sowie der weiteren Mobilkontrolle meldete die Computersteuerung einen gesperrten Mac. Diese letzten Sichtprüfungen sind offen. Die Blockade ist damit nicht zuverlässig der Website zuzurechnen; aus ihr wurde keine Änderung der Suchverarbeitung abgeleitet. Die zusätzliche automatisierte Prüfung der echten P1.3-Schnittstelle besteht für alle fünf Anfragen. Ein gesonderter HTTP-Test der ausgelieferten Indexdateien findet die Seite auf der ersten Ergebnisseite; Rangfolge und Trefferzahlen sind im Prüfbericht dokumentiert. Das ersetzt nicht die noch offene letzte Oberflächenkontrolle.

Der rohe Linkbericht führt auch ausgeschlossene/noindex-Dateien und Titelgruppen auf. Seine 3.115 Dateien ohne eingehenden Verweis und 1.169 Titelgruppen sind keine Aussage, dass indexierbare Seiten nicht erreichbar wären. Der separate Navigationsbericht prüft die öffentliche Routenliste. Der globale Bestand wurde in diesem eng begrenzten Auftrag nicht pauschal redaktionell umgebaut.

Die acht vorgegebenen öffentlichen Anknüpfungspunkte wurden erneut per HTTP geprüft: alle 200, Canonical jeweils identisch zur angegebenen URL. Dies belegt den Bestand, nicht die Veröffentlichung der neuen Seite.

## Fachlicher Freigabestand und Veröffentlichung

Die technische und quellenbezogene Prüfung durch Codex ist keine menschliche Fach- oder Redaktionsabnahme. Eine solche Abnahme ist für die konkrete neue Fassung noch nicht belegt. Deshalb wird keine Freigabe eingetragen oder Veröffentlichung behauptet. Die fassungsgebundene Freigabevorlage liegt daneben; sie ist nach der realen menschlichen Prüfung auszufüllen.

Zulässiger anschließender Weg: geprüften PR nach tatsächlicher Fach- und Redaktionsabnahme über den bestehenden Prozess übernehmen; vorhandener GitHub-Deployment-Workflow baut und prüft das statische Artefakt. Kein neuer Hostingdienst, kein Vercel-Build, keine Änderung der Hosting-Workflows oder Budgets. Danach Live-Inhalt, Einstiegskarte, Querverweise, fünf Suchanfragen und die vier ausgelieferten Downloads tatsächlich prüfen.


## Vorschau, Arbeitsblätter und nächster Schritt

Lokale Vorschau des tatsächlichen öffentlichen Artefakts: `http://127.0.0.1:8784/verstehen/wirkung-messen/`.

- `assets/downloads/wirkung-messen/kii-arbeitsvorlage.md`
- `assets/downloads/wirkung-messen/kii-arbeitsvorlage.json`
- `assets/downloads/wirkung-messen/kii-mobilitaetskosten-lernbeispiel.md`
- `assets/downloads/wirkung-messen/kii-mobilitaetskosten-lernbeispiel.json`

Die Freigabevorlage bindet Quellen und Artefakte per SHA-256. Unterschrift, Datum und Entscheidung bleiben bis zur tatsächlichen menschlichen Fach- und Redaktionsabnahme leer. Nach Entsperren des Macs die verbleibende Browserkontrolle abschließen. Danach benötigt diese konkrete Fassung Natalies fachliche und redaktionelle Abnahme. Erst anschließend über den vorhandenen PR-/GitHub-Pages-Prozess veröffentlichen und die ausgelieferten Seiten, Navigation, Suche und Arbeitsblätter live kontrollieren. Für diese Fassung wurde kein Release und kein Production-Deployment ausgelöst.

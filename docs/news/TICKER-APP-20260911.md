# Wirkungsticker App-Ausspielung – 11. September 2026

## Änderung

Start bietet kuratierte Nachrichten, Erklärungen, Analysen, Bücher und Medienbesprechungen. Der chronologische Newsfeed liegt unter `/wirkungsticker/news/`. Analysen, Merkzettel, Mehr und Suche haben eigene URLs. Die bestehenden Story- und Analyse-URLs bleiben erhalten.

Die fünf Hauptbereiche sind mobil über eine feste Navigation erreichbar. Suche bleibt im kompakten Kopf, die jeweiligen Filter bleiben darunter sichtbar. Die vorhandene Darstellung lässt sich zwischen kompakt und ausführlich umschalten. Ring, Tragweite, Richtungslabel und Wirkpfad werden weiterhin aus der zentralen Wirkungsdarstellung übernommen; fehlende Altbewertungen werden durch diese Darstellung nicht erfunden.

## Daten und Funktionen

Der bestehende Generator erstellt ausschließlich aus veröffentlichbaren Geschichten und freigegebenen Analysen öffentliche Pakete mit höchstens 20 Beiträgen. `data/app/manifest.json` enthält einen kleinen Identitäts-/Typ-/URL-Katalog. Titel, Texte und Karten kommen erst mit dem jeweiligen Paket. Eine Inhaltsrevision verhindert das Vermischen unterschiedlicher Feedstände.

Die kostenlose statische Suche verwendet beim Build erzeugte, auf 128 Dateien verteilte Wortpräfix-Postings. Eine Abfrage lädt nur betroffene Wortpartitionen und die jeweils sichtbaren Treffer. Es wird weder der vollständige Artikeldatenbestand noch der große globale Suchindex in den Browser geladen. Das ist eine statische Indexabfrage, keine neu eingeführte Datenbank- oder Suchplattform.

Der Merkzettel nutzt unverändert `WoekUserSpace/saved_items`, stabile Inhaltsadressen sowie bestehende Kontosynchronisierung und Löschlogik. Nachgeladene Karten binden dieselben Speichern-/Teilenfunktionen ein. Filter und Suche stehen in der URL. Browser-Back, gespeicherte Feedansicht und begrenzter Sitzungscache erhalten den Lesekontext. Installations- und Push-Einstellungen bleiben unter Mehr verfügbar.

Discovery, Import, Freigabe, Bridge, Quellenprüfung und MPD-Berechnung werden durch dieses Paket nicht verändert.

## Show-Identitäten

21 Shows sind in `data/news/show-visual-identities.json` konfiguriert. Deutschlandradio hat das Original-Systemfragen-Logo am 11. September 2026 honorarfrei zur angefragten redaktionellen Nutzung bereitgestellt. Verwendet wird die mitgelieferte quadratische Variante mit Schriftzug, proportional verkleinert. Die Korrespondenz und Originaldateien sind im privaten Rechtearchiv abgelegt.

Die öffentliche Website verwendet das konkrete geprüfte Asset mit Credit. Die Dateiprüfsumme bindet die Freigabe an diese Datei. Ungeklärte Rechte, abgelaufene Rechte, andere Dateien und nicht freigegebene Verwendungsarten fallen auf eine eigene typografische Show-Karte zurück. Sharecards und Social sind für dieses Asset weiterhin nicht separat freigeschaltet. Persönliche Artikeltexte und Freigabehashes bleiben unverändert.

## Prüfung

Automatisierte Prüfungen decken vollständige, duplikatfreie Pagination, getrennte Inhaltstypen, deutsche Suchpräfixe, Auffindbarkeit aller Formate, Routennavigation sowie Datei-/Verwendungs-/Ablaufgrenzen der Bildrechte ab. Browserprüfung: Mobile 390 × 844 und Desktop 1280 × 900, Filter, Suche, Merkzettel, Nachladen, Sticky-Leisten, Detail- und Rücknavigation. Bestehende Nachrichtentests, News-Validator, Sprachprüfung, Syntaxprüfung und Such-/Taxonomiebuild bleiben verpflichtend.

## Grenzen

Die neue Ausspielung ersetzt keine redaktionelle Neubewertung und veröffentlicht keine ungeprüfte persönliche Fassung. Neue Nachrichten erscheinen erst nach erfolgreicher Verarbeitung und Publikationsprüfung. Eine macOS-unabhängige Verarbeitung wird im gesonderten Betriebspaket geprüft und repariert.

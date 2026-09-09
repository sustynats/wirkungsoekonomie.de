# Sicherheitsanalyse Sachsen-Anhalt: Redaktion und Release-Pruefung

Stand: 9. September 2026.

## Beitrag und Quellen

- Neue eigenstaendige Meinung und Analyse Natalie Webers: `/wirkungsticker/analyse/sachsen-anhalt-wenn-die-regierung-zum-sicherheitsrisiko-wird/`.
- Redaktionspaket: `content/news/reviews/2026-09-09-sachsen-anhalt-sicherheitsrisiko.json`. Bestehender Publisher und Analysenspeicher; 15 Abschnitte, beide Manuskripttabellen, persoenliche Einordnung, 24 Quellen und 13 Minuten berechnete Lesezeit. Keine gekuerzte Nachricht anstelle des Manuskripts.
- Primaerquellen umfassen Regierungsprogramm, aktuelle Einstufung und Organisation des Landesverfassungsschutzes, Bundesregierung, Landtag, GG/GVG/BVerfSchG, Richterbund und IWH. Die relevanten Seiten der Landtagsdrucksache, IWH-Kalkulation und Richterbund-Personalmitteilung wurden auch am PDF visuell geprueft. Die abschliessende Linkpruefung aller 24 Quellen ergab jeweils HTTP 200; beide veroeffentlichten Vorschaugrafiken sind erreichbar.
- Zentrale Praezisierungen: Regierungsbildung und Informationssperre nicht als vollzogen dargestellt; gesetzliche Informationspflichten bleiben bestehen. Kulturfoerderantrag 8/7118 am 25. Juni abgelehnt, keine geltende Foerderregel. Wegfall einer kommunalen Bestellungspflicht nicht gleich Abschaffung saemtlicher Gleichstellungsstellen. Hausunterrichtskontrollen erwaehnt. Nachwuchsjuristenbefragung nicht repraesentativ und kein Abwanderungsnachweis. IWH-Finanzierungsluecke ist eine Programmkalkulation, kein eingetretenes Defizit.
- Informationsweitergabe an Russland, rechtswidrige Einzelweisungen und eine bereits eingetretene systemische Schaedigungswirkung werden nicht behauptet. Beispiele bleiben Veranschaulichungen, juristische Kommentare keine Gerichtsurteile.
- Mensch und Demokratie: sehr hohe Relevanz; Planet: hohe Relevanz ueber den konkreten Energie-/Klimapfad. Negative Risikorichtung separat von offenem Eintritt und offener Groessenordnung. SDGs/DNS nur sachlich anwendbarer Referenzrahmen, SDG+ eigene Erweiterung, kein Kausalitaetsbeweis.

## Bestehende Architektur erweitert

- `reference_table`: validierte Tabellen mit 2 bis 4 Spalten, semantischen Zeilen-/Spaltenkoepfen und vorhandener mobiler Kartenansicht. Keine erzwungenen Scores oder Schein-Wirkungsrichtungen in blossen Zeittabellen.
- Optionale absatzgenaue Quellenverweise und Callouts; unbekannte Quellen, ungueltige Indizes und ungueltige Tabellen werden im Gate abgewiesen. Textausgabe bleibt HTML-escaped.
- `related_analysis_slugs`: explizite wechselseitige Verweise, auf veroeffentlichte Analysen beschraenkt. Die bestehende Staatsmacht-Analyse erhaelt dadurch einen Hinweis, aber keine stillen Text-, Bewertungs- oder Versionsaenderungen.
- Bestehende Systemgrafik, Kaskade, MPD-Bilanz, Autorenperspektive, sechs gruppierte Navigationsbereiche und neun offene Beobachtungspunkte wiederverwendet.
- Eigene OG-/Wide-Karte mit Titel und getrennter negativer Risikokennzeichnung, lokal gerendert. Vorschau in der Uebersicht, Open Graph/Twitter und Article-JSON-LD. Keine Bilderzeugungs-, LLM- oder TTS-Provideraufrufe fuer diesen Beitrag.

## Medienarchiv: 1.000-Dateien-Grenze

Das vorhandene September-Release `wirkungsticker-media-2026-09` war mit 1.000 Dateien voll und wies neue Uploads zurueck. Der bestehende Release-Store nutzt nun begrenzte monatliche Folgearchive (`-part-2` bis `-part-32`). Zwei neue Titelkarten liegen in `wirkungsticker-media-2026-09-part-2`.

Alte Dateien/URLs bleiben unveraendert. Kein `--clobber`, keine Loeschung. Bestehende gleichnamige Dateien werden auf Groesse und Hash geprueft. Die oeffentliche URL-Allowlist bleibt auf das bisherige Repository und unveraenderliche Bildnamen beschraenkt. Kapazitaetsrennen werden begrenzt abgefangen; andere Fehler bleiben sichtbar. Der Publisher liefert die tatsaechlichen Speicher-URLs zurueck; die Pipeline behaelt auch bei einem spaeteren Render-/Uploadfehler die richtige Adresse eines bereits gespeicherten Originals.

## Qualitaetssicherung und Betriebsschutz

- 715 Nachrichten-/Betriebstests einschliesslich neuer Inhalts-, Tabellen-, Verlinkungs-, Quellen-, Bild- und Archivkapazitaets-Regressionen bestanden. Umfragetests (41), Typecheck, Modulsyntax und Lint bestanden; 25 bestehende Sprachhinweise bleiben unveraendert.
- Vollstaendiger bestehender Pages-Artefaktbuild bestanden: keine defekten internen Links, Publikations-/Methoden-/Umfragenpruefungen, Privacy-Gate und Groessengate. Suchindex, Taxonomie, Feeds und Sitemap entstehen aus dem vorhandenen System.
- Browserpruefung am Artefakt: 1440, 390 und 320 Pixel, Titel/Autorinnenbild, echte Kaskade, zwei Tabellen, MPD-Richtung und persoenliche Einordnung. Kein horizontaler Ueberlauf, keine Browserfehler; Uebersicht zur Analyse, sechs Makronavigationsbereiche und beide Analyse-Verweise geprueft. Die Hambacher-Forst-Standardanalyse bleibt ohne neue Sondertabellen erreichbar.
- Automatische Nachrichtencommits werden vor dem Release integriert. Keine Ueberschreibung von Quellenregistry, Nachrichten-, Kosten- oder Jobbestand. Die neue Analyse wird ueber ihr Redaktionspaket in den jeweils aktuellen kanonischen Speicher uebernommen.
- Deployment ausschliesslich ueber die vorhandene serielle, commitgebundene GitHub-Pages-Pipeline. Keine Vercel-/Oracle-Konfiguration, Budgeterhoehung, neue Automation oder zusaetzliche kostenpflichtige Infrastruktur.

Die Beobachtungspunkte sind eine transparente Pruefliste, keine Behauptung, dass alle genannten Vorhaben bereits umgesetzt wurden. Der Abschluss dieses Beitrags belegt nicht, dass saemtliche unabhaengigen Nachrichten-/Analysequeues leer sind.

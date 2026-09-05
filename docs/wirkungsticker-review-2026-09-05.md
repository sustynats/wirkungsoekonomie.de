# Wirkungsticker: Erklärungsebenen, UX und Vorprüfung

Stand: 5. September 2026. Code- und Browserprüfung; keine kostenpflichtigen KI-Aufrufe. Kein vollständiges Barrierefreiheitszertifikat oder Langzeitnachweis störungsfreien Betriebs.

## In diesem Release

- Kompakte Leselogik auf der Übersicht: Wirkungsakte, Lageakte, WÖk-Analyse; Relevanz ist keine Gut-/Schlecht-Note.
- Gestufte Links von Analysen zur einfachen Erklärung, zur Methodik und zur tickerbezogenen Arbeitsweise.
- Sechs verständliche Methodikfragen vor der fachlichen Vertiefung. IOOI korrekt als Input, Output, Outcome, Impact und als eine mögliche Methode eingeordnet.
- Wirkung, Potenzial, Risiko, offene Evidenz und ambivalente Befunde getrennt. SDG+ als WÖk-eigene Erweiterung, nicht als UN-Kategorie. Schutzprinzip, mögliche Operationalisierung und vorgeschlagene institutionelle Zielarchitektur unterschieden.
- Quellenrollen verständlicher, technische Statuscodes übersetzt. Keine historische Publikation und kein individueller Artikeltext redaktionell umgeschrieben.

## Zwei bestätigte und freigegebene Fehlerkorrekturen

### Nicht vergleichbares Balkendiagramm

Live bestätigt bei `/wirkungsticker/wertvolle-ressourcen-studie-milliardenwerte-in-europas-elektroschrott-ungenutzt-a2d23b/`: Rohstoffwert 65, Smartphones 700 und Elektroschrott 13 auf derselben Skala mit der Einheit „Einheit“.

Ursache: `scripts/news/visuals.mjs` prüfte Zahlenvorkommen in sämtlichen Story-Quellen, aber keine gemeinsame Messgröße, Einheit oder eindeutige Zuordnung zur Kategorie. Sogar eine Jahreszahl konnte als Geldbetrag durchgehen; ein bisheriger Test akzeptierte dies.

Jetzt: Eine gemeinsame Messgröße und konkrete Einheit sind Pflicht. Jeder Punkt braucht eine vorhandene `claim_id` und einen kurzen wörtlichen `evidence_quote` aus diesem Claim oder dessen zugeordnetem Quellenauszug. Kategorie, Messgröße und Betrag samt Einheit müssen darin stehen. Verschiedene Größenordnungen, Sammelzitate ohne eindeutige Zuordnung, unbekannte Claims und generische Einheiten werden abgewiesen. Es gibt keine stillen Umrechnungen. Fällt ein Punkt durch, entfällt das gesamte Diagramm; Artikel und übrige Anker bleiben erhalten. Gültige Bindungen bleiben bei erneutem Sanitizing erhalten.

Die Prüfung ist bewusst konservativ und keine vollständige semantische Wahrheitsprüfung. Ältere Diagramme ohne erforderliche Bindungen entfallen beim nächsten Build; keine teure Neuanalyse und keine Änderung der gespeicherten Artikelhistorie. Quellenprüfung und Claim-Qualitätsgate bleiben zusätzlich erforderlich.

### Medienrelevanz im Deep-Dive-Trigger

Ursache: `media_impact.relevance_level` liefert `low/medium/high/very_high`; der Trigger verwendete eine ausschließlich deutsche Wertetabelle. Im untersuchten Bestand hatten zehn aktive Stories einen Medienbefund, aber einen Diskursfaktor von null.

Jetzt: Explizite Normalisierung der englischen und früheren deutschen Werte; Faktor 2/4/6/8. Fehlende, unbekannte oder ausdrücklich irrelevante Befunde ergeben null. Analysegewinn und Evidenzgate bleiben verbindlich. Die Analyseversion wird nicht pauschal erhöht; bestehende Beiträge werden nicht allein wegen dieser Korrektur kostenpflichtig neu erzeugt.

## Wie visuelle Elemente bisher entstehen

1. Themen-Icons, Relevanzbalken, Verfahrensstand und Wirkungspfade werden lokal aus dem vorhandenen Modell gerendert, ohne zusätzlichen KI-Aufruf.
2. Die reguläre Analyse kann freiwillige Kennzahlen, Termine, Betroffenengruppen und ein Balkendiagramm liefern. Anschließend prüft `sanitizeVisuals` die Ausgabe; derselbe Filter läuft beim Seitenbau.
3. Lange WÖk-Analysen nutzen derzeit überwiegend Anker der Ursprungsgeschichte. Das ist noch keine abschnittsspezifische Visualisierung der eigenständigen Analyse.

Bestandsstichprobe vor Aktualisierung: 89 aktive Stories; 53 mit Kennzahlen, 15 mit Zeitleiste, eine mit Diagramm. Diese Zahlen beschreiben vorhandene Daten, keine Qualitätsquote.

## Erweiterte Freigabe: weitere umgesetzte Prüf- und UX-Verbesserungen

### Hohe Priorität: fachliche Auswahl und technische Sicherheit

- `editorialAnalysisAssessment` trennt redaktionelle Priorität und MPD-Relevanz nun von den eigenständigen Faktoren Potenzial und Risiko. Fehlende Schweregrade bleiben ausdrücklich offen. Das Wort „veröffentlicht“ zählt nicht mehr als beobachtete Wirkung; ein quellengebundener, entsprechend typisierter und nicht offener Claim ist erforderlich. Textlänge erzeugt keine Punkte für Effekte dritter Ordnung, Transformation oder Resilienz. Der Score bleibt eine operative Auswahlheuristik, kein Wirkungsnachweis.
- Das Deep-Dive-Evidenzgate verlangt jetzt explizit `verified`. Vor jeder Auswahl prüft der bestehende Source-Integrity-Mechanismus den endgültigen, gegebenenfalls ergänzten Quellenbestand lokal erneut. Bestandsprüfung: 89 von 89 aktiven Stories verifiziert, ohne API-Aufruf.
- Auch Kennzahlen und Zeitleisten werden jetzt an konkrete aktuelle Claims gebunden. Zahl und Einheit bzw. Datum und Ereignis müssen zusammenpassen. Eine veraltete Kennzahl-Claim-ID wird nur bei genau einem belegten Treffer neu gebunden. Keine ersatzweise Beschriftung mit der ersten Primärquelle. Bewusst konservativ: im eingefrorenen Bestand bleiben 19 Stories mit prüfbaren Kennzahlen und 10 mit Zeitleisten; das vermischte Diagramm entfällt. Unklar gebundene Visuals werden nicht als Beleg ausgegeben, Artikel bleiben erhalten.
- Vollbuild absichern: `scripts/quality/check-no-em-dash.mjs --fix` durchsucht auch Programmcode und ersetzt U+2014 blind. Reproduzierter Effekt: In `scripts/news/reference-frameworks.mjs` wird ein gültiger Regex zu einer ungültigen Zeichenklasse. Der Build selbst meldet Erfolg, nachgelagerte News-Tests schlagen fehl. Der Normalisierer wurde korrigiert: ausführbarer Code, Daten, HTML-Attribute, Skript-/Style-Blöcke und Codebeispiele bleiben unverändert. Eigene Regressionen prüfen den Fix; der echte Regex blieb beim erneuten `--fix` unverändert. Der unbeabsichtigte breite Build-Drift wurde nicht übernommen.

### Hohe Priorität: besser erklären

- Die Headline steht genau einmal in der neuen responsiven Bildkomposition. Wiederholte Bildunterschriften und Relevanzbalken direkt unter derselben Karte entfallen. Ein redundanter Erklärungssatz vor dem Nachrichtentext wurde entfernt; identischer Untertitel/Teaser wird nicht doppelt gezeigt. Artikeltexte bleiben erhalten.
- Vier Hauptsprünge sind umgesetzt: Nachricht, Belege, Folgen, Vertiefung. Lange Analysen haben ein kompaktes aufklappbares Inhaltsverzeichnis; vorhandene Abschnitts-IDs bleiben erhalten.
- Visuelle Auswahl nach Erklärgewinn: vergleichbare Mengen als Balken, Entwicklungen als Zeitreihe, Ereignisabfolge als Zeitleiste, Mechanismen als Ablauf-/Beziehungsbild. Vermutete Pfade sichtbar von beobachteten Zustandsänderungen trennen. Keine Grafikquote und keine erfundenen Zahlen.
- Nach dem Systemabschnitt entsteht bei mindestens zwei geeigneten Claim-Kategorien eine lokale Gegenüberstellung aus dem eigenen Analyse-Ledger: Quellenstand, mögliches Potenzial, mögliches Risiko. Keine erfundenen Zahlen oder Kausalpfeile. Lange ungeeignete Claims werden nicht verkürzt. Die zusätzliche Visualisierung der Ursprungsgeschichte bleibt als aufklappbare Vertiefung erhalten.
- Für Wirkungskarten und Symbolbilder ist das Headline-Overlay umgesetzt: warmes Hellgrau, echter HTML-Text, auf großen Karten links neben dem halbtransparenten MPD-Panel, auf schmalen Karten untereinander. Bereits vorhandene Originalbilder werden wiederverwendet; keine Neugenerierung. Die Bildkennzeichnung steht genau einmal innerhalb der Komposition und ist screenreaderzugänglich.

### Kosten und Vorfilter: Bestand und nächste messbasierte Schritte

- Bereits vorhanden: lokale Materialitätsfilter, Dubletten-/Clusterprüfung, Quellenintegrität, Größenbegrenzungen, Wiederverwendung und begrenzte Wiederholungsversuche. Diese Mechanismen nicht durch neue parallele KI-Stufen ersetzen.
- Den Anteil wirklich neuer Fakten als gesonderten Update-Grund auswerten. Eine weitere Quelle oder sprachliche Variation allein rechtfertigt keine Vollanalyse.
- Die vorhandene Kennzahl `items_short_ai_checked` belegt für sich keine tatsächlich implementierte Kurzklassifikation. Nur für nachweisliche Grenzfälle erproben und Mehrkosten gegen vermiedene Vollanalysen messen.
- Bei rein formalen Ausgabefehlern gezielte Feldkorrekturen statt kompletter Neugenerierung prüfen.
- Auch Fehlverwerfungen überwachen: Stichproben lokal aussortierter relevanter Ereignisse, falsch vereinigte Ereignisse, Agenturkopien als vermeintlich unabhängige Belege. Niedrige Kosten allein sind kein Vollständigkeitsnachweis.

## Prüfung und Grenzen

- 317 automatisierte News-Tests einschließlich neuer Diagramm- und Medienenum-Regressionen bestanden.
- Ticker-Build und Datenvalidierung bestanden. Vollbuild technisch mit Exit 0 abgeschlossen; die oben beschriebene nachträgliche Codemutation separat identifiziert und nicht übernommen.
- Mobile Browserstichproben: Übersicht, Quellen, normale Story, WÖk-Analyse und Methodenpfade. Bei 320 und 390 CSS-Pixeln kein horizontaler Überlauf in diesen Stichproben; Analyseheadline hell lesbar; Links und neue Leselogik funktionieren. Keine Aussage über sämtliche Geräte oder vollständige WCAG-Konformität.
- SVG-Diagramme haben weiterhin eine zugängliche Datentabelle. Für komplexe Grafiken zusätzlich deren Kernaussage und Zusammenhänge textlich erklären, entsprechend [W3C WAI: Complex Images](https://www.w3.org/WAI/tutorials/images/complex/). Reflow auch bei Vergrößerung und 320 CSS-Pixeln systematisch testen, siehe [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Veröffentlichungsartefakt geprüft: keine gebrochenen internen Links, Datenschutzgate und Größengate bestanden (769,6 MB). Allgemeine Bestandswarnungen des Linkreports: 4.014 verwaiste Seiten und 830 doppelte Seitentitel, kein neu behaupteter SEO-Vollständigkeitsnachweis.
- Lokaler Kandidatenscan nach den Korrekturen: neun Kandidaten, davon zwei recherchebereit, sechs mit fehlender Recherchebasis, einer bereits unverändert veröffentlicht. Kein Ausführungsmodus und kein API-Aufruf; die Relevanzprüfung bleibt funktionsfähig.
- Kein bezahlter KI-Aufruf, keine neue Bildgenerierung, keine Quellenerweiterung und kein Vercel-Build für diese Arbeit.

## Zentrale geänderte Quellen

`scripts/news/{build,source-pages,visuals,story-visual,editorial-analysis,run-editorial-analyses,validate}.mjs`, `scripts/news/title-image/pipeline.mjs`, `scripts/quality/{check-no-em-dash,public-punctuation}.mjs`, `assets/css/news.css`, `scripts/site/{build-so-wirkt-wirkungsoekonomie,build-iooi-wirkungsarchitektur,apply-sdg-resilience-copydeck,apply-word-audit-redaction,apply-website-architecture-v21}.mjs`, `scripts/wirkungswissenschaften/build-wirkungswissenschaften-hub.mjs`; die kanonischen Seiten `methodik/index.html`, `modell.html`, `verstehen/index.html`, `verstehen/woek-auf-einer-seite/index.html`; Tests `tests/news/{explanation-layers,visuals,editorial-analysis,reading-order,release-safety,wirkungsticker}.test.mjs`. Zugehörige öffentliche Seiten und Suchmetadaten werden aus diesen Quellen gebaut.

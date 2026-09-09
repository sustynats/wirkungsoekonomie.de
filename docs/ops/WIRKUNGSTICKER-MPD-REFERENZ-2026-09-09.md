# MPD: gleicher Gegenstand, gleicher Vergleich, getrennte Wirkungsevidenz

## Anlass und Befund

In `wt-127329d8756c5ba5` wurden verschiedene Bezugszustände vermischt. Die erste Planet-Einordnung stellte mehr Windkraftausbau einem bloß ausbleibenden Zusatznutzen gegenüber. Das ist kein belegter gegenläufiger Pfad. Die Demokratie-Einordnung leitete einen positiven Befund aus möglichen parlamentarischen Korrekturen ab. Sie belegte keine entsprechende Zustandsverbesserung.

Das Originalinterview wurde vollständig gelesen. Goldschmidt hält den abgeschwächten Redispatch-Vorbehalt weiterhin für schädlich. Die Kabinettsdarstellung wurde zusätzlich geprüft: Sie beschreibt den teilweisen Entschädigungsentfall für neue Anlagen an betroffenen Standorten und gesonderte Windkraftausschreibungen. Letztere sind ein eigener positiver Ausbaupfad, kein nachgewiesener Ausgleich der Investitionshemmnisse.

- Interview: https://klimareporter.de/strom/die-wirtschaftsministerin-stoesst-die-erneuerbaren-ueber-die-klippe
- Primärquelle der Bundesregierung: https://www.bundesregierung.de/breg-de/aktuelles/kabinett-eeg-novelle-netzpaket-strom-2448636

Die Korrektur bewertet ausdrücklich die verbleibenden Investitionshemmnisse gegenüber Projektbedingungen ohne diese Hemmnisse. Negatives Risiko bedeutet nicht gemessener Schaden und nicht eine behauptete Nettobilanz aller Instrumente. Der eigenständige positive Ausbaupfad bleibt im Text und im Folgencheck sichtbar. Die Prozentgrenze wurde präzisiert: Abregelungskriterium im Netzgebiet, kein pauschaler entschädigungsloser Anteil jeder Anlage. Ursprung, URL und alte Version bleiben erhalten. Die ältere Kabinettsdarstellung ist eine Hintergrundquelle; sie ersetzt weder die aktuelle Ausgangsmeldung noch deren Datum auf der Karte.

## Allgemeine Verarbeitung

`direction_assessment_version: 1.1` ergänzt:

- `assessment_frame.subject` und `.baseline`: sichtbarer Gegenstand und Vergleich auf Listen- und Detailkarten.
- Positive und negative Pfade benötigen Quellenbezug, `effect_type` und `reference`.
- Ein bilanziertes Plus/Minus benötigt `independent_change` und `assessment_baseline`. Bloße Risikominderung gegenüber anderem Entwurf, ausbleibender Nutzen und formale Verfahrensmöglichkeiten zählen nicht als unabhängige Gegenwirkungen.
- Ist eine Risikominderung selbst der Nachrichtengegenstand, muss ihr eigener Vergleich ausdrücklich benannt werden; eine echte Verbesserung darf weiter positiv bewertet werden.
- `ex_post` braucht eine konkrete `observed_outcome` mit Quelle und getrennter Ursachenzurechnung. Ein Beschluss oder ein veröffentlichtes Datenblatt genügt nicht als Beleg seiner Folgewirkungen. Ex-ante-Risiken sind auch nach Beschluss und Inkrafttreten möglich.
- Die neue Referenzregel gilt im Redaktionsprompt auch für Meinung & Analyse. Langzeitmessungen sind keine Voraussetzung für die Veröffentlichung plausibler Potenziale/Risiken.

Dies sind Struktur- und Konsistenzprüfungen, kein automatischer Beweis semantischer Richtigkeit. Richtungen werden niemals nach Partei, Thema, Quelle oder Relevanzbalken vergeben. Alte 1.0-Verträge bleiben für bestehende Inhalte gültig; neue Nachrichtenantworten müssen 1.1 erfüllen. Zeitunkritische bestehende Batch-Medienaufträge und historische Datensätze werden nicht pauschal ungültig. Keine zusätzlichen KI-Aufrufe, Budgets oder Quellenauswahlen.

Das MPD-Ausgabeschema wird einmal unter `$defs` beschrieben und für alle drei Dimensionen referenziert; die Antwort muss vollständige Objekte enthalten. Kürzere gleichwertige Vorgaben halten den bestehenden 39.000-Zeichen-Rahmen. Die reale 21-Quellen-Regression inklusive Vergleichshistorie und Laufzeitkontext bleibt vollständig enthalten, nicht gekürzt oder übersprungen.

## Bestandsprüfung und Grenzen

Geprüfter Bestand vor Korrektur: 207 aktive, gelistete Meldungen. 171 ex ante, 31 Monitoring, 5 ex post. Drei Ex-post-Zuordnungen waren für ihre beschriebenen Folgewirkungen nicht gerechtfertigt:

- `wt-ed407d0353f699da`: Strafurteil, aber mögliche Abschreckungs-/Vertrauensfolgen nicht gemessen.
- `wt-33931768eeae3386`: gerichtliches Übernahmeverbot, aber Wettbewerbs-/Preisfolgen nicht gemessen.
- `wt-688b36d040bfbf87`: Wahlprofil, aber Kommunikations-/Strategiefolgen nicht nachgewiesen.

Diese drei erhalten ausschließlich eine versionierte Phasenkorrektur auf Monitoring samt öffentlichem Hinweis. Quellen, Claims, MPD-Richtungen und ursprüngliche Veröffentlichungsdaten werden nicht umgeschrieben. Zwei weitere Ex-post-Meldungen berichten tödliche Schäden; diese werden nicht rückwirkend zu bloßem Potenzial erklärt.

26 Autorenanalysen wurden auf ihre Kontextkennzeichnung geprüft. Zwei `observed`-Beiträge betreffen berichtete unmittelbare Angriffsschäden; ihre weitergehenden demokratischen Pfade sind separat plausibel, nicht beobachtet eingestuft. Keine pauschale Herabstufung realer Schäden.

Die strukturelle Richtungsinventur fand 86 gemischte Achsen, davon 43 unter Vertrag 1.0. Diese Zahlen sind Prüfkandidaten, keine Zahl nachgewiesener Fehler. Stichproben enthalten weitere mögliche Bezugswechsel. Keine pauschale historische Umpolung oder bezahlte Massenneuanalyse; weitere substantielle Korrekturen brauchen eine eigene Quellenprüfung. Diese Arbeit ist keine vollständige Neuverifikation jeder Tatsachenbehauptung in sämtlichen historischen Artikeln.

## Prüfung und Veröffentlichung

Gezielte Regressionen: identischer Vergleichsmaßstab, Mitigation/ausbleibender Nutzen/formaler Verfahrenspfad, negatives Ex-ante-Risiko nach Beschluss, Quellenpflicht für beobachtete Veränderungen, öffentliche Referenzdarstellung, Korrektur-Idempotenz und Schutz vor veralteten Eingaben. 722 News-/Betriebsmonitor-Tests und 41 Umfrage-Tests bestanden. Nachrichten- und Suchbuild, vollständiger statischer Artefaktbuild, Datenschutz-, Größen- und Linkintegritätsprüfung bestanden. Der Browsercheck prüft Desktop sowie 390 und 320 Pixel breite Ansichten auf Referenz, Richtung, Quelldatum und horizontalen Überlauf. Das Veröffentlichungsartefakt wird anschließend durch den bestehenden commitgebundenen GitHub-Pages-Workflow nochmals gebaut und geprüft. Keine Vercel-Erweiterung und keine kostenpflichtige Inhalts-/Bildgenerierung.

# Wirkungsticker 2.1 - Potenzialrevision 1

Stand: 10.09.2026. Verbindlicher neuer Vertrag: `impact-assessment-contract-2.1-potential-1.json`. Ältere Verträge, Inputs, Outputs, ACKs und persönliche Texte werden nicht rückwirkend verändert. Diese Revision ersetzt die früheren Abschlusszustände `not_material` und `insufficient_basis` für reguläre Tickermeldungen.

## Produktinvariante

Jede reguläre Wirkungsticker-Meldung wird als Auslöser eines Wirkungspotenzials betrachtet. Für Mensch, Planet und Demokratie wird jeweils ein Wirkungspfad modelliert. Die Frage lautet nicht, ob Wirkungspotenzial vorhanden ist, sondern welche Richtung, Stärke, Wahrscheinlichkeit, Zeitwirkung und Evidenz es besitzt.

Historischer Zwischenstand vom 14.09.2026 (durch die spätere direkte Nutzerentscheidung am Ende dieses Dokuments für neue Freigaben abgelöst): Jede Dimension bleibt sichtbar, aber nicht jede ist ausreichend bewertbar. Ein begründeter Potenzialpfad erhält eine numerische Tragweite 0 bis 5. `path_status` ist `modelled`. 0 bedeutet eine begründete praktisch vernachlässigbare Zustandsveränderung im betrachteten Referenzraum und Zeitraum. Der Pfad bleibt dokumentiert. Bei unzureichender Grundlage ist `insufficient_basis` mit `direction=open`, `magnitude=null`, `evidence=not_assessable`, `data_status=missing`, `likelihood=unknown`, `dominance=none`, `temporal_status=ex_ante` und leeren Pfadlisten ein valider Befund. Pflicht sind eine konkrete Begründung, `research_pass=second_pass`, `research_result` und tatsächlich geprüfte `reviewed_source_ids`. Die Anzeige lautet offen / nicht ausreichend bewertbar, niemals null/5 oder neutral. Diese Präzisierung ersetzt die frühere Pflicht zu drei numerischen Pfaden; historische Bewertungen werden nicht automatisch umgerechnet.

## Erkenntnisgrenzen

Die Prüfungspflicht ist kein Wirkungsnachweis und keine Pflicht zu erfundenen Pfaden. Ein Pfad braucht Auslöser, Empfänger, Mechanismus, Vergleich, Raum, Zeitraum und Bedingungen. `path_quality` unterscheidet direct, indirect, weak, systemic und high_uncertainty. Es gibt keine automatische Richtung nach Partei, Ressort oder Schlagwort.

`source_support` legt offen, was die Quelle tatsächlich belegt. `epistemic_basis=model_hypothesis` weist eine hypothetische kausale Erweiterung aus und darf nur geringe/nicht bewertbare Evidenz tragen. `assumptions` und `limitations` bleiben sichtbar. Der Beleg eines Ereignisses ist kein Beleg sämtlicher Folgen. Wissenschaftliche, rechtliche oder institutionelle Mechanismusquellen zusätzlich recherchieren, wo erforderlich. Keine Quellen, Wirkungen, Genauigkeit oder Kaskaden erfinden.

Bei geringer Evidenz oder hoher Unsicherheit ist eine gezielte zweite Recherche mit gespeichertem Ergebnis erforderlich. Danach wird eine begründete konservative Bandbreite angegeben. `magnitude_range` ist eine plausible ordinale Spanne, kein statistisches Konfidenzintervall. Der Punktwert wird durch sechs begründete Faktoren bestimmt; kein automatisches Setzen auf 0, 1 oder 3 bei fehlenden Daten. Eine unerledigte Recherche bleibt intern offen und geht wieder in den Prozess.

## Getrennte Größen

Systemische Relevanz der Meldung, Richtung, Tragweite, Eintrittsplausibilität und Evidenz sind unabhängig. `open` kann die Richtung oder die unzureichende Bewertbarkeit kennzeichnen; ein bekannter Pfad mit offener Richtung kann weiterhin eine begründete Stärke besitzen. `neutral` ist ein begründeter Richtungsbefund, keine Datenlücke.

Pro Pfad sechs Faktoren 0 bis 5: Reichweite R, Intensität I, Dauer D, Unumkehrbarkeit U, Verteilung/Vulnerabilität V, Systemtiefe S. Grundwert `(R+I+D+U+V+S)/6`. Grenzen: 0 wird 0; größer 0 bis unter 1,5 wird 1; unter 2,5 wird 2; unter 3,5 wird 3; unter 4,5 wird 4; ab 4,5 wird 5. Stufe 0 braucht eine explizite Begründung der vernachlässigbaren Veränderung in Raum und Zeit.

Eine dokumentierte maßgebliche schwere Schutzgrenze bewirkt mindestens Stufe 4. Ex ante nur, wenn genau diese Grenzverletzung bedingt modelliert ist. Nichtkompensation und Reverse Merit Order verhindern Verrechnung mit Vorteilen in anderen Dimensionen. Nebenrisiken werden nicht zu gleichwertigen Hauptpfaden aufgewertet. Bei tatsächlich gegenläufigen Hauptpfaden: höchste Tragweite je Richtung vergleichen; Differenz höchstens 1 ergibt balanced, ab 2 dominant_positive/negative. Eine maßgebliche negative Schutzgrenze begrenzt zuerst.

## Potenzial, Beobachtung und Status-Ring

Potenzialpfade bleiben erhalten, auch wenn erste Folgen eingetreten sind. `observed_effects` ist eine zusätzliche Liste belegter Zustandsveränderungen mit eigener Richtung, Tragweite, sechs Faktoren, Empfängern, Zeitraum, Evidenz und Ursachenattribution. Ein belegter Waldbrand oder Hitzetote sind beobachtete Folgen. Welchen Anteil der Klimawandel an einem konkreten Ereignis hatte, benötigt eigene Attributionsbelege. Offene Attribution macht einen belegten Schaden nicht ungeschehen.

Ring = Status; Balken = Stärke; Text = Richtung und Status. Drei Kategorien: potential (Kontur), emerging (festes Segment), observed (gefüllt). Kein Prozentwert, keine Wahrscheinlichkeit, kein Fortschrittsmaß. Der Status wird zentral aus dem Zeitstatus abgeleitet. Emerging benötigt erste tatsächliche Signale, observed einen belegten Zustand. Ein Beschluss allein ist keine beobachtete Folge.

Wird eine Beobachtung in der Hauptzeile gezeigt, stehen deren eigener Balken und Wirkpfad daneben. Die Tragweite eines Zukunftspfads darf nie mit einem Beobachtungsring kombiniert werden. Das weitere Potenzial bleibt zusätzlich sichtbar. Alle drei MPD-Zeilen haben Ring, Balken, Text und Kurzpfad, auch auf dem Smartphone und in barrierefreier Darstellung.

## Lernschleife und Migration

Der Server speichert `original_potential_assessment` unveränderlich, `current_potential_assessment` als aktuellen Stand und `observed_effects` als versionierte Beobachtungen. Ein nachträglicher Backfill wird als `retrospective_reassessment` datiert, niemals als damalige Vorhersage ausgegeben. Unveränderte Beobachtungen werden nicht doppelt gespeichert.

Alt-Relevanz ist keine Magnitude. Die technische Migration markiert ungeklärte Altmetadaten intern als `needs_reassessment`; sie erfindet keine vollständigen neuen Bewertungen. Zur Veröffentlichung müssen alle aktiven regulären Meldungen tatsächlich bewertet sein. Bestehende journalistische Texte, Fakten, manuelle Ausnahmen und Quellen bleiben erhalten. Atomare Freigabe mit vollständigem Coverage-Bericht; keine erneute teilweise migrierte Oberfläche.

## Qualität und Betrieb

Die vorhandene Dropbox-Bridge, Claim-/ACK-Lifecycle, Idempotenz und Publication Gates bleiben bestehen. Keine kostenpflichtigen Textanbieter oder versteckten API-Fallbacks. Neue aktuelle Nachrichten haben Vorrang vor Altbestand. Review-Identitäten binden redaktionellen Inhalt, nicht veränderliche Abrufzeitstempel. Ein unabhängiger Fachpass prüft die vorgeschlagenen Metadaten und Quellen erneut.

Prüfen: drei sichtbare Dimensionsbefunde, je ein begründeter Pfad oder dokumentierte offene Recherche; nachvollziehbare Faktoren; Quellenfunktionen; Modellannahmen; Raum/Zeit; getrennte Beobachtung/Attribution; Gegenpfade; Nichtkompensation; Ring unabhängig von Stärke; originale Bewertung unverändert; keine öffentlichen Debugtexte oder fehlenden MPD-Zeilen. Build, Tests, Lint, Typecheck und Mobile/Desktop-Preview vor Release.


## Reparatur der Potenzialprüfung – 14.09.2026

Eine fehlende Outcome-Messung oder noch offene Umsetzung ist kein Grund, einen begründbaren bedingten Wirkpfad zu verwerfen. Zuerst den berichteten Sachverhalt bzw. die Maßnahme bewerten; die Warnung oder Berichterstattung selbst ist nur bei einem Kommunikationsgegenstand das Bewertungsobjekt. Die ordinale Tragweite ist eine begründete Schätzung am abgegrenzten Pfad und keine Behauptung, die Quelle habe diese Zahl gemessen.

Die zweite Recherche umfasst Mechanismus, gekoppelte MPD-Folgen und Referenzraum. Die bekannten Discovery-Quellen sind keine abschließende Liste möglicher Forschungsquellen. Quellenrechte, Zugriff und Originalauszüge werden unverändert geprüft. Ein fehlgeschlagener Suchzugriff bleibt eine technische Rechercheaufgabe. Er darf nicht als abgeschlossener fachlicher Befund veröffentlicht werden.

Die Balkenskala bleibt bei offenen Werten mit fünf gestrichelten Segmenten sichtbar. Sie kennzeichnet dann eine noch nicht bestimmte Tragweite und ausdrücklich nicht Stufe 0. Der Ring bleibt ausschließlich das Zeitstadium.


## Präzisierung für neue Veröffentlichungen am 14.09.2026

Die spätere direkte Nutzerentscheidung hebt die frühere heutige Null-Ausnahme für neue Freigaben auf: Mensch, Planet und Demokratie benötigen jeweils einen begründeten modellierten Pfad mit Tragweite 0 bis 5. Fehlende Messwerte oder unbekannter Eintritt verhindern keine quellengebundene bedingte Modellierung. Bei einer tatsächlich nicht vertretbar modellierbaren Dimension bleibt der neue Beitrag im Recherche-/Prüfstatus; niemals Faktoren erfinden. Historische insufficient_basis/null-Daten bleiben lesbar und unverändert. Die versionierte Abgrenzungsprüfung und der ausdrückliche HOLD-Zweig sind in [IMPACT-SCOPE-REVIEW.md](IMPACT-SCOPE-REVIEW.md) dokumentiert. Dies löst keine bezahlte Bestandsneubewertung aus.

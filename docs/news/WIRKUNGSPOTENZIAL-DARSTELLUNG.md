# Wirkungspotenzial: historisches Bewertungsmodell 1.2

Historischer Stand vom 10. September 2026. **Abgelöst durch [Wirkungssemantik 2.0](IMPACT-SEMANTICS-2.md).** Die nachstehende Dokumentation bleibt zur Nachvollziehbarkeit früherer Daten erhalten. Für neue Verarbeitung, Migration und Darstellung gilt ausschließlich Version 2.0: Balken zeigen Tragweite; Meldungsrelevanz, Pfadstatus, Richtung, Eintrittsplausibilität, Evidenz und Zeitstatus bleiben getrennt. Frühere Relevanzwerte sind keine Tragweitenwerte.

## Fehlerursache

Die bisherige Prüfung konnte zwei ausführliche Pfadtexte mit Quellen-IDs als `gemischt` akzeptieren, obwohl ein Text eine mögliche Maßnahmenfolge und der andere lediglich eine mögliche politische Reaktion beschrieb. Quellen-IDs belegen den Ausgangspunkt, nicht die behauptete Kausalität. Die kompakte Übersicht blendete außerdem die Pfade und die Begründung aus. Dadurch wirkte ein abstraktes Sammellabel wie ein ausgewogenes Gesamturteil.

## Gemeinsamer Vertrag

- Relevanz ist die Bedeutung des Gegenstands für einen Schutz-/Funktionsbereich, nicht Wirkungsstärke, Richtung oder Eintrittswahrscheinlichkeit.
- `assessment_frame.subject`, `baseline` und `object_kind` benennen Gegenstand, Vergleich und Ebene: geplante Maßnahme, umgesetzte Maßnahme, Ereignis oder Kommunikation.
- `state_change` benennt die konkrete Veränderung einer Lebens-, Schutz- oder Funktionsbedingung; `condition` den notwendigen Umsetzungsschritt; `mechanism` erklärt die Verbindung.
- `effect_role` trennt `substantive_change` von `political_reaction`, `intention_only`, `procedural_step` und `mitigation`.
- Nur ein eigenständiger substanzieller Pfad relativ zu derselben Referenz trägt das Richtungsurteil. Zwei solche Pfade können getrennt gezeigt werden; sie erzeugen keinen neutralen Saldo. Gegenwind, Streit oder Polarisierung allein belegen keinen demokratischen Schaden.
- Risikominderung kann selbst ein legitimer Bewertungsgegenstand sein. Dann braucht sie ihren eigenen Vergleich und einen konkreten Schutzgewinn; bloße Verfahrensmöglichkeit genügt nicht.
- Absicht ist nicht Wirkung. Eine Forderung ist kein Beschluss, ein Beschluss keine Umsetzung und Umsetzung kein Nachweis aller behaupteten Folgen. Ein begründetes negatives Potenzial bleibt negativ, auch wenn Eintritt und Ausmaß offen sind.
- Ein Bericht über Wählerdaten erhält nicht deshalb ein positives Demokratieurteil, weil Information generell nützlich ist. Bewertet wird der ausdrücklich benannte Gegenstand, nicht der Nutzen unserer Berichterstattung.
- Nichtkompensation: schwere Eingriffe in Grundrechte und natürliche Lebensgrundlagen werden nicht durch andere Vorteile verrechnet. Keine Richtung aus Parteinamen, Schlagworten oder Relevanzbalken ableiten.

## Sichtbar für Leserinnen und Leser

Die gemeinsame Komponente `renderDimensionMeters` wird auf der Übersicht, im Artikelkopf und im Folgencheck verwendet. Sie zeigt den konkreten Folgesatz auch in kompakter Darstellung. Erläuterungen und Vergleich sind weiter zugänglich, nicht nur per Hover. Positives und negatives Potenzial stehen in getrennten, textlich bezeichneten Blöcken. Die Artikelkarte nutzt HTML/CSS; kein neuer Bildgenerierungsauftrag und kein zusätzlicher API-Aufruf.

In Meinung & Analyse bleibt die MPD-Begründung auch in der Executive-Kurzfassung sichtbar. Die neue redaktionelle Regel wird dort im bestehenden Begründungs-/Claim-Ledger-System angewandt, ohne ein zweites Nachrichtenschema einzubauen.

## Bestand und Sicherheit

Versionen 1.0 und 1.1 bleiben lesbar. Alte Mischbewertungen werden nicht automatisch in positive oder negative Urteile umgeschrieben. Die Darstellung kennzeichnet die ungeprüfte Trennung der Pfadrollen, zeigt die ursprünglichen Nutzen-/Risikoannahmen getrennt und vergibt keinen aggregierten Richtungssaldo. Das ist ausdrücklich keine bereits erfolgte inhaltliche Neubewertung. Eine spätere Neubewertung braucht die normale Quellenprüfung und einen transparenten Versions-/Korrektureintrag.

Auch einseitige ältere Urteile ohne ausdrücklich dokumentierten Gegenstand und Vergleich erscheinen nur als Teilannahme, nicht als farbige Gesamtbewertung der Überschrift. Die vorhandene Begründung bleibt sichtbar. Diese Sicherung gilt für positive und negative Urteile gleichermaßen; weder Partei noch Thema entscheiden über das Ergebnis.

Version 1.2 ist der Vertrag für neue automatische Nachrichtenprüfungen und neu recherchierte vollständige manuelle Reviews. Fehlende Bedingungen, Zustandsänderungen oder unzulässige Gegenpfadrollen werden durch die bestehenden Qualitätsgates abgewiesen, nicht redaktionell erfunden. Bewährte Wiederholungs-, Publikations- und Budgetgrenzen bleiben bestehen. Alte quellengebundene manuelle Review-Pakete mit dokumentiertem Recherchestand vor dem 10. September 2026 (Europe/Berlin) bleiben unter ihrem ursprünglichen gültigen Vertrag reproduzierbar; neue Reviews und der Worker verlangen die aktuelle Version.

Die technische Validierung ersetzt kein Fachurteil: Sie kann Struktur, Referenzen und deklarierte Pfadrollen prüfen, nicht die Wahrheit jedes formulierten Kausalmechanismus beweisen. Nachrichtenzusammenfassungen, Originalfassungen, Quellen, Versionsverläufe und manuelle Buchtexte werden durch diesen Darstellungswechsel nicht verändert.

## Betrieb und Kosten

Der vorhandene GitHub-Worker lädt bei jedem Lauf `main`; Oracle weckt weiterhin diesen Worker. Kein neuer Dienst, kein Vercel-Build, kein automatischer Vollbestands-KI-Backfill. Der bestehende Schutz von 39.000 Eingabezeichen bleibt unverändert. Gemeinsame Pfadschemata werden einmal per `$defs/path` übertragen; große reale Quellenpakete bleiben Regressionstests.

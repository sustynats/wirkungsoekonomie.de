# Mandats- und Umsetzungsmonitor

## Zweck

Der Monitor dokumentiert drei unterschiedliche Textebenen mit Quellen und Versionen:

```text
Wahlprogramm → Koalitionsvertrag → finale parlamentarische Entscheidung
                                     ↓
                             eigenständiger WÖk-Wirkungscheck
```

Er ist weder Parteienranking noch Treuewert noch Personenprofil. Partei, Fraktion, Regierungsstatus und Popularität sind Anzeige- bzw. Quellenmetadaten; sie sind keine Eingabe der Wirkungsbewertung.

## Datenmodell

- `MandateSource`: `source_id`, Typ, Titel, kanonische URL, Veröffentlichungsdatum, Inhalts-Hash, Fundstellen, Status.
- `PoliticalCommitment`: atomare, zitierfähige Aussage; Quelle, genaue Fundstelle, zeitlicher und sachlicher Geltungsbereich.
- `CommitmentComparison`: Quellen auf beiden Seiten, geprüfte Relation, Begründung, Fundstellen, Freigabestatus.
- `DecisionUnit`: ausschließlich die amtlich dokumentierte finale Beschluss-/Ablehnungsfassung.
- `ImpactAssessment`: bleibt eigenständig und verweist nur mit `woek_assessment_id` auf die Vergleichszeile.

Kein Feld für Parteienscore, Umsetzungsquote, Ideologieprofil oder Personenwertung.

## Zulässige Vergleichsrelationen

- `EXPLICITLY_ADDRESSED`
- `PARTIALLY_ADDRESSED`
- `MATERIALLY_CHANGED`
- `NO_DOCUMENTED_DECISION_YET`
- `NO_CLEAR_MAPPING`

Diese Relation beschreibt die Text- und Beschlussbeziehung; sie ist kein Urteil über politische Qualität oder Wirkung.

## Veröffentlichungsregeln

1. Nur Originalquelle oder eindeutig kanonische, versionsgesicherte Quelle.
2. Jede Aussage hat Fundstelle, Inhalts-Hash und Abruf-/Veröffentlichungsdatum.
3. Der Vergleich wird redaktionell als `APPROVED` freigegeben; Sprachmodellvorschläge sind nie veröffentlichungsfähig.
4. Der WÖk-Check verwendet weder Partei- noch Koalitionsmetadaten als Bewertungsparameter.
5. Kein Schluss aus fehlender Zuordnung: Status ist `NO_CLEAR_MAPPING` oder `NO_DOCUMENTED_DECISION_YET`.
6. Eine veröffentlichte Relation kann mit neuer Fassung oder nachgewiesenem Fehler nur versioniert korrigiert werden.

## Importreihenfolge

1. Amtliche/primäre Wahlprogrammquellen der im Bundestag vertretenen Parteien als `MandateSource` erfassen.
2. Führende Fassung des Koalitionsvertrags samt Hash und Fundstellen erfassen.
3. `PoliticalCommitment` nur für atomare, belegte Textpassagen anlegen.
4. Finale `DecisionUnit` aus dem DIP-Backfill verknüpfen.
5. Vergleichsrelation und WÖk-Check getrennt freigeben.

Die Veröffentlichung startet erst nach vollständiger Quellensicherung; bis dahin zeigt die öffentliche Route nur den transparenten Importstatus.

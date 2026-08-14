# Historical Backfill — laufende Regierungszeit

Der historische WÖk-Backfill beginnt verbindlich am **6. Mai 2025**:

```text
legislative_term_start         = 2025-03-25
government_term_start          = 2025-05-06
historical_woek_backfill_start = 2025-05-06
```

Der erste Wert beschreibt die konstituierende Sitzung der 21. Wahlperiode; die
beiden anderen begrenzen die Wirkungsbilanz der laufenden Bundesregierung. Sie
sind getrennte Datenfelder in `government_terms`, nicht austauschbare Labels.

`HISTORICAL_WOEK_BACKFILL_START` steuert ausschließlich den einmaligen
`BOOTSTRAP`-Import. Der tägliche Standardimport bleibt ein 7–14-Tage-Radar und
zieht nicht jedes Mal die gesamte Regierungszeit erneut.

## Vollständiger, fortsetzbarer Import

Der Backfill verarbeitet DIP nicht bis zu einer stillen Seitenobergrenze.
`parliament_import_jobs` speichert für jedes Fenster den DIP-Cursor,
verarbeitete Seiten, Zähler und den Zustand. Eine Invocation bearbeitet nur
`DIP_IMPORT_PAGES_PER_INVOCATION` Seiten (Standard: drei) und antwortet dann
mit `PARTIAL`, solange ein Cursor vorhanden ist. Der nächste Aufruf desselben
Scopes nimmt exakt dort wieder auf. Erst `SUCCEEDED` bedeutet, dass DIP für das
festgehaltene Zeitfenster keine weitere Seite geliefert hat.

Jede DIP-Vorgangsposition ist eine eigene technische DecisionUnit. So gehen
mehrere Beschlüsse innerhalb desselben parlamentarischen Vorgangs nicht durch
eine Deduplikation auf Vorgangsebene verloren.

Das anfängliche Screening ist bewusst konservativ: nur eindeutig erkennbare
Personal-, Geschäftsordnungs- oder Verfahrensereignisse erhalten
`NOT_MATERIAL`; alle übrigen Beschlüsse bleiben `POTENTIAL_MATERIAL` und
`PENDING_SCREEN`. Das ist keine Wirkungsbewertung und verwendet weder
Einbringer noch Partei, Regierungsstatus oder politisches Interesse.

## Zwei Ebenen

1. **Decision Registry:** Jede seit Stichtag deterministisch erfasste materielle
   Entscheidung erhält einen Registry-Eintrag, ihre Quellen- und
   Materialitätsentscheidung.
2. **Full Historical Impact Assessment:** Nur ein Fall mit dokumentierter
   Materialität erhält den vollständigen WÖk-Rückblick. Routine-, Personal- und
   Verfahrensfälle bleiben mit `NOT_SELECTED_FOR_FULL_IMPACT_REVIEW` und
   begründetem Auswahlgrund im Register.

Der Backfill filtert nie nach Einbringer, Partei, Regierungsstatus oder
politischem Interesse. Er lädt amtliche Vorgänge, dedupliziert, bildet
DecisionUnits, wendet den gleichen Wirkungsrelevanzstandard an und erzeugt
erst danach begrenzte Aufgaben/Microtasks. Importe veröffentlichen nichts.

## Übergabe an den strukturierten WÖk-Review

Nach einem vollständigen Register erzeugt die Redaktion aus Quellendaten
kleine Review-Batches, nicht einen Gesamtprompt für alle Entscheidungen. Das
Backend prüft jedes Detailpaket vor dem Export und lässt keine unvollständige
primäre Entscheidungsgrundlage in eine substantielle Prüfung. Details:
[`HISTORICAL_REVIEW_PIPELINE.md`](HISTORICAL_REVIEW_PIPELINE.md).

Ein externer Review kann Wirkpfade, Variablen, Datenbedarf, Gegenfaktum,
WÖk-/SDG-/SDG+-Kandidaten und Risiken strukturiert vorbereiten. Die
Calculation Engine rechnet anschließend ausschließlich mit dokumentierten,
typisierten und freigegebenen Eingaben. Fehlende Werte bleiben `DATA_GAP`.

Die öffentliche Überschrift lautet **„Wirkungsbilanz der laufenden
Regierungszeit – seit 6. Mai 2025“**. Sie aggregiert keine Regierungspunktzahl;
zulässig sind nur nachvollziehbare Muster über freigegebene Einzelfälle, etwa
beobachtbare Wirkpfade oder Vollzugsengpässe.

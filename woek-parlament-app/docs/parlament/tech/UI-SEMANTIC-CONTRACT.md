# Semantischer UI-Vertrag

Dieser Vertrag verhindert, dass Gestaltung eine fachliche Aussage erzeugt, die in den Daten nicht belegt ist.

## Richtungsstatus

| Status | Bedeutung | Zulaessige Darstellung |
|---|---|---|
| `POSITIVE_POTENTIAL` | modelliertes positives Wirkungspotenzial | Gruen und aufwaerts gerichteter Pfeil zulaessig; immer als Potenzial kennzeichnen |
| `NEGATIVE_RISK` | modelliertes negatives Wirkungsrisiko | Warn-/Risikofarbe und abwaerts gerichteter Pfeil zulaessig; nicht als eingetretene Wirkung darstellen |
| `NEUTRAL` | fachlich richtungsneutral | neutrale Farbe, kein Richtungspfeil |
| `AMBIVALENT` | derselbe unteilbare Pfad enthaelt gegenlaeufige Richtungen | gemischte Markierung, kein positiver Einzelpfeil |
| `OPEN` | Richtung nicht belastbar bestimmbar | neutrale offene Markierung, kein Richtungspfeil |

`EVIDENCE_OPEN` ist kein Richtungsstatus. Evidenz, Wirkungsrichtung, Risiko, Materialitaet und Wissenszeitpunkt werden separat angezeigt.

## Allgemeines Wirkungspotenzial

Die Ueberschrift „Erkennbares Wirkungspotenzial“ ist richtungsneutral. Eine gruene Kachel oder ein Pfeil nach rechts oben ist dort verboten, solange nicht explizit `POSITIVE_POTENTIAL` vorliegt.

## Vollstaendige Fachakte

Jede vereinfachte Fallseite verlinkt sichtbar auf die kanonische vollstaendige Fachakte. Die Vollakte bewahrt alle zur Veroeffentlichung bestimmten Source-Felder und darf nicht durch eine Kurzfassung ersetzt werden.

## Abnahme

- keine positive Semantik fuer `OPEN`, `AMBIVALENT`, `MATERIAL` oder geringe Evidenz;
- keine Richtung `EVIDENCE_OPEN`;
- jedes Pfadsplitting traegt `split_from`;
- jede der 28 Fallseiten verlinkt ihre erreichbare Vollakte;
- `missing_paths = 0`, `fallback_overwrites = 0`, verlorene Felder = 0.

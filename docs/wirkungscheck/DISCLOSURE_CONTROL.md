# Disclosure Control

Status: implementierte Kernlogik; noch nicht an eine Research-API angebunden

## Mindestschwelle

Jede Research-Aggregation wird serverseitig mit

```text
MIN_ANALYTICS_COHORT_SIZE=10
```

geprüft. Zellen mit `n < 10` werden nicht nur in der Oberfläche verborgen, sondern weder über
die Dashboard-API noch in CSV- oder PDF-Export ausgeliefert.

## Sekundärunterdrückung

Nach der primären Unterdrückung prüft der Server jede Total-/Teilgruppenbeziehung. Ist eine
unterdrückte Zelle aus angezeigtem Total minus angezeigten Teilzellen berechenbar, unterdrückt der
Algorithmus zusätzliche, möglichst kleine sichtbare Zellen, bis keine eindeutige Rückrechnung
mehr möglich ist. Das Ergebnis markiert den Unterdrückungsgrund, liefert aber keinen Wert.

Der Algorithmus ist als versionierte, reine Serverlogik in
`ops/wahlkreis-wirkungscheck/analytics/src/disclosure-control.ts` implementiert. Dashboard und
Export müssen genau diese Funktion aufrufen, bevor sie Research-Ergebnisse ausliefern. Tests
enthalten unter anderem eine Tabelle mit einer primär unterdrückten Zelle, die erst durch eine
sekundäre Unterdrückung nicht mehr rückrechenbar ist. Eine Research-API oder ein Export existieren
noch nicht; deshalb kann diese Schutzlogik derzeit noch keine Daten freigeben.

## Weitere Grenzen

- Maximal drei gruppierende Dimensionen pro Abfrage.
- Keine Person, E-Mail, Einladung, einzelne Antwort oder exakter Wahlkreis als Dimension.
- Kein Caching von Rohzeilen an der UI.
- Abfrage- und Export-Audit protokollieren nur Vorgang, Rolle, Zeitraum und Ergebnisstatus;
  sensible Ergebniswerte stehen nicht unnötig im Audittext.

# Gerichtsberichte vor erneuter KI-Verarbeitung zuordnen

Stand: 9. September 2026. Lokale Routingkorrektur, keine neue KI-Stufe,
keine Budgeterhöhung und keine Abschaltung von Nachrichten oder Aufträgen.

## Nachgewiesener Fehler

Zwei veröffentlichte Quellenberichte beschreiben dieselbe Entscheidung zur
Übernahme von eTraveli durch Booking. Der erste Feed nennt das Aktenzeichen
`T-1139/23`; der zweite enthält den vollständigen kompakten Bezeichner
`t113923` in seiner Artikeladresse, aber nicht im Feed-Kurztext.

Die bisherige Erkennung lieferte trotz des gemeinsamen Verfahrens nur
`entity_time_text_overlap`, `same_event=false` und einen Zuordnungswert von
0,573 unter der Schwelle 0,64. Später las der Ortsabgleich außerdem
"bei Online-Hotelbuchungen" aus unserer eigenen Analyse als Ortsangabe.

Betroffene Akten:

- `wt-3c1a41d7234d7f44`: erstmals veröffentlicht 09.09.2026, 08:55 UTC.
- `wt-33931768eeae3386`: erstmals veröffentlicht 09.09.2026, 11:14 UTC.

Quellenveröffentlichung und Ticker-Veröffentlichung bleiben getrennte Zeiten.
Kein Bericht erhält durch die Korrektur einen erfundenen neuen Ereigniszeitpunkt.

## Enge Identitätsregel

- Vollständige typisierte EU-Gerichtsaktenzeichen mit Präfix und vorhandenem
  Verfahrenszusatz vergleichen, nicht bloße Zahlen wie `1139/23`.
- Ein vollständiger Bezeichner aus Titel/Kurztext darf durch genau denselben
  kompakten Pfadbestandteil einer zweiten beobachteten Quellen-URL ergänzt
  werden. Keine URL wird erfunden; Query, Fragment, Teiltreffer und beliebige
  Zahlenfolgen begründen keine Identität.
- Automatische Zuordnung zu demselben Ereignis nur bei derselben erkannten
  Ereignisart `judgment`, gültigen Datierungen und demselben Quellentag.
  Spätere Verfahrensschritte bleiben zunächst Kontext, nicht automatische Dubletten.
- Unterschiedliche vollständige Aktenzeichen und mehrdeutige Mehrfachbezüge
  dürfen nicht über ihre gemeinsamen Zahlen zusammengeführt werden. Ein bereits
  bekanntes Dokument mit mehreren Zitaten darf weiterhin sich selbst aktualisieren.
- Nur bei separat festgestelltem gemeinsamen Verfahren verwendet der Ortsabgleich
  die führende Originalquelle anstelle einer Formulierung unserer Analyse.
  Andere Orts-, Landes-, Wahl-, Themen- und Quellenintegritätsprüfungen bleiben
  erhalten. Keine pauschale Lockerung des Ähnlichkeitsschwellwerts.

Dies ist ein zusätzlicher strukturierter Identitätsanker, keine vollständige
semantische Ereigniserkennung. Berichte ohne einen solchen belastbaren Anker
fallen weiterhin unter die bestehenden konservativen Regeln.

## Rückwirkende Korrektur ohne Verlust

`duplicateGroups` und der bereits vorhandene reguläre Nachrichtenlauf erkennen
das passende Paar vor weiteren KI-Aufrufen. `mergeLivingFiles` behält beide
geprüften Texte, Quellen, Versionsverläufe und URLs. Die doppelte Listenkarte
wird zur historischen Fassung mit Verweis auf die fortgeführte Akte.

Zusätzliche Quellen gelangen als wartendes Update in die normale Qualitäts-
und Evidenzprüfung. Die Zuordnung behauptet weder unabhängige Bestätigung noch
eine bereits geprüfte gemeinsame Analyse. Explizite Themen- und Autorenaufträge
bleiben auf ihren bisherigen Wegen möglich.

## Prüfung

Die neuen Regressionen wurden zunächst gegen den alten Stand ausgeführt:
Identitätszuordnung, Ortsabgleich, Trennung verschiedener Gerichte und
retrospektive Zusammenführung scheiterten reproduzierbar. Geprüft werden nun
auch verschiedene Präfixe und Zusätze, längere Zahlen, fehlende Datierungen,
andere Tage/Verfahrensarten, mehrdeutige Aktenzeichen, andere Parteien/Quellen,
Originaldaten-Erhalt und idempotente Zusammenführung.

Der Bestandsvergleich identifizierte genau das Booking/eTraveli-Paar als neue
Konsolidierung, keine weiteren automatischen Zusammenführungen. Alle 703 Tests
der News-/Monitor-Testsuite, Syntax-/Typecheck, News-Build, Bestandsvalidierung
und Hosting-Kostengate bestanden vor dem Push. Der Sprachlint behält seine
bereits bestehenden 25 Findings; keine redaktionellen Texte wurden geändert.

Der schlanke Checkout des bestehenden Betriebsmonitors enthält das neue lokale
Modul ebenfalls. Auslieferung erfolgt über die vorhandenen GitHub-/Pages-Läufe.
Kein Vercel-Build, kein zusätzlicher bezahlter Testlauf. Rückfall betrifft nur
diese Codeänderung, niemals eine ältere Kopie der inzwischen fortgeschriebenen
Artikel-, Quellen-, Auftrags- oder Kostenjournale.

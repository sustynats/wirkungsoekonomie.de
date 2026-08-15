# Vorbereitung bevorstehender Entscheidungen

## Ziel

Das Wirkungsportal unterstützt parlamentarische Beratung vor einer noch
veränderbaren Entscheidung. Der historische Bereich dient dagegen der
Rückkopplung und dem Lernen. Beides wird weder in Daten noch in Sprache
vermischt.

## Dauerregel

1. Amtlichen Vorgang und aktuelle Beratungsfassung sichern.
2. Materialität deterministisch vorsortieren; unklare Fälle bleiben sichtbar.
3. Für jeden materiellen, noch offenen Fall ein Ex-ante-Faktenpaket erstellen.
4. Regelwerk und vorhandene freigegebene Muster zuerst nutzen.
5. Nur die verbleibenden Fragen in ein begrenztes Review-Paket geben.
6. Je materiellem Punkt sichtbar machen:
   - parlamentarische Stellschraube;
   - Wirkungspotenzial und Wirkungsrisiko;
   - betroffene Gruppen und notwendige Voraussetzungen;
   - Evidenzgrenze und Datenbedarf;
   - soweit möglich eine konkret veränderbare Stelle für robustere positive
     Netto-Wirkung.
7. Eine neue Fassung löst nur eine diff-bezogene Nachprüfung der abhängigen
   Punkte aus.
8. Öffentliche Veröffentlichung erst nach Quellen-, Methoden- und
   Redaktionsfreigabe.

## Zeitlogik

Ein bestätigter Sitzungstermin erhöht die Priorität. Fehlt ein Termin, bleibt
der Fall als `PENDING_PARLIAMENTARY_DECISION` in der geschützten Vorbereitung;
das Portal behauptet keinen Abstimmungstermin. Der amtliche
Sitzungskalender und die veröffentlichten Tagesordnungen ergänzen diese
Priorisierung, sobald der konkrete Tagesordnungspunkt vorliegt.

## Zustände

- `NOT_READY`: amtlicher Import vorhanden, Vorbereitung noch nicht erfolgt.
- `REVIEW_PACKAGE_READY`: überprüfbares Ex-ante-Paket liegt vor.
- `EXTERNAL_REVIEW_PENDING`: begrenzter Fachreview angefordert.
- `DATA_GAP`: eine notwendige amtliche Fassung oder Quelle fehlt.
- `READY_FOR_APPROVAL`: fachliche und redaktionelle Gates erfüllt.

## Zustellung

Ist ein privater Benachrichtigungskanal ausdrücklich konfiguriert, wird ein
ZIP-Paket mit den amtlichen Texten und einem klaren Prüfauftrag zugestellt.
Andernfalls bleibt der Batch `READY` und kann ausschließlich über den
geschützten Export abgerufen werden. Es gibt keine öffentliche Ablage
ungeprüfter Arbeitsdateien.

# Quellenarchiv: gültigen Snapshot vor fehlerhaften Aktualisierungen schützen

Der branchschreibende Nachhaltigkeits-Audit hat während der Prüfung 696 fachfremde
generierte Dateien an diesen Transport-Fix angehängt. Diese Änderungen werden
zurückgenommen. Snapshot-Lader und Quellenarchiv-Builder lösen diesen zusätzlichen
Schreiber künftig nicht aus; die vollständigen PR-Builds, Quellenarchiv- und
öffentlichen Semantikprüfungen bleiben bestehen. Die Regeln für Änderungen an
inhaltlichen Quellenbeständen bleiben unverändert.

Der Lauf `34827758337` vom 14.09.2026 scheiterte beim Abgleich mit der
Institut-API. Deren Antwort enthielt 1000 Einträge, davon 15 ohne Quellen-ID.
Der Generator überschrieb zunächst den gespeicherten Snapshot und prüfte danach
IDs, Supplements und Evidenzregister. Beim Fehler las der vorgesehene Rückfall
deshalb dieselbe ungültige Datei erneut.

`loadSourceSnapshot` prüft jetzt die gesamte Zusammenführung einschließlich
Evidenz-Metadaten vor dem Schreiben. Erst eine erfolgreiche Prüfung ersetzt die
Datei atomar. Bei Fehlern bleibt der vorhandene Datenstand bytegleich erhalten
und wird mit denselben Regeln geprüft. Ein fehlender oder ungültiger lokaler
Datenstand bleibt ein harter Buildfehler. Der Netzwerkzugriff hat eine Frist von
30 Sekunden; es gibt keinen zusätzlichen Wiederholungsaufruf.

Prüfung mit der tatsächlich fehlerhaften API-Antwort: Build erfolgreich,
unveränderter Snapshot mit 1025 Basisquellen; 1333 daraus und aus den bestehenden
Supplements erzeugte Detailseiten bestanden die Quellenarchiv-Qualitätsprüfung.
Vier automatisierte Tests decken fehlende/doppelte IDs, den erfolgreichen
atomaren Austausch, Fehler bei der Anreicherung und fehlende/ungültige
Rückfalldaten ab. Typecheck und Lint erfolgreich; die 25 bekannten Sprachhinweise
bleiben bestehen.

Die 15 ungültigen Einträge in der Institut-API sind damit noch nicht korrigiert.
Sie werden nicht durch erfundene IDs ersetzt und nicht in den öffentlichen
Snapshot übernommen. Die Warnung zum fehlgeschlagenen Refresh bleibt im
Laufprotokoll sichtbar. Es handelt sich um den Quellenarchiv-Sync, nicht um den
Nachrichtenimport; dieser läuft unabhängig weiter.

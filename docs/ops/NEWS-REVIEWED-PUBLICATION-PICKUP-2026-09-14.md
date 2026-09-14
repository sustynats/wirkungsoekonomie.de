# Bereits geprüfte Nachrichten im begrenzten Import

Stand: 14.09.2026

## Ursache

Der Import verwendet dieselbe Priorisierung wie die redaktionelle Verarbeitung.
Aktuelle neue Entwürfe konnten daher die sechs Importversuche eines Laufs
verbrauchen, indem sie jeweils erst eine unabhängige Prüfung anforderten.
Elternaufträge mit inzwischen erfolgreich abgeschlossener Prüfung warteten
weiter hinten. Ein `reviewed`-ACK bestätigt nur diese Prüfung, keine Publikation.

## Korrektur

Nur bei der Veröffentlichung erhalten bereits fachlich geprüfte reguläre
Nachrichten Vorrang vor noch ungeprüften Entwürfen. Dasselbe gilt für die
Wiederaufnahme bereits akzeptierter öffentlicher Datensätze nach einem
unterbrochenen Import. Dringende und manuelle Aufträge bleiben vorrangig;
historischer Backfill bleibt nachgeordnet. Innerhalb derselben Stufe bleibt
die vorhandene LIFO-Reihenfolge anhand des ursprünglichen Quellenstands erhalten.

Die Auswahl erfolgt nach dem Einlesen der unabhängigen Prüfergebnisse, sodass
ein gerade abgeschlossener Prüfpass noch im selben Lauf publiziert werden kann.
Die gesamte Zahl der Importversuche bleibt unverändert begrenzt. Es entstehen
keine zusätzlichen KI-Aufrufe, Worker oder parallelen Schreibzugriffe.

Der Vorrang ist keine Freigabe: Quellenbindung, aktuelle Assessment-Version,
unabhängige Einzelprüfungen, native Validierung, Bildprüfung und persönlicher
Freigabeprozess bleiben erhalten. Originalausgaben und Quelldaten bleiben
unverändert. Veröffentlichungs-ACKs folgen weiterhin erst dem dauerhaften Commit.

## Nachweis

Ein Integrationstest stellt bei einem Importlimit von eins zwei neuere Entwürfe
und einen älteren Auftrag mit soeben eingelesener unabhängiger Prüfung nach.
Bei erfolgreicher Prüfung wird der ältere fertige Auftrag zuerst angenommen.
Bei negativem Prüfergebnis bleibt er zurückgestellt, während der neueste andere
Auftrag weiterläuft. Der Test kontrolliert außerdem unveränderte Originalausgaben,
fehlende voreilige Publikations-ACKs und das unveränderte Versuchslimit.

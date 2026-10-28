# Unbezahlte Erfassungsdatensätze aus dem Fehlbestand vom 28. Oktober

Der abgeschlossene, fehlgeschlagene Lauf 40624975084 hatte zusätzliche
RSS-Kandidaten bereits lokal erfasst, aber nicht nach Main geschrieben.
Nach #1143 wurden fünf davon regulär wiedergefunden. Die übrigen fünf fehlten
weiterhin nach ID, Original-URL, normaler Ereigniszuordnung und im Seen-/Pending-
Bestand. Drei standen ursprünglich am Kapazitätsgate, zwei unter der lokalen
Relevanzschwelle. Keine dieser fünf Akten besitzt eine Analyse oder Bezahlquittung.

Die Originale stammen aus Recovery-Artefakt 12789018818, SHA-256
`ee3eb4318b1215bf6a742717111b422a82026805da79ece307c6394db3f172c3`.
Manifestteile, Byteanzahl, SHA-Prüfung, ZIP-CRC und der unveränderte Datensatz
wurden bei der Sicherung geprüft. Die kleine eingecheckte Datei enthält nur
diese öffentlichen Quellenmetadaten und die ursprünglichen unbezahlten
Pending-Datensätze. Sie enthält keine Modellantwort oder privaten Manuskripte.

Der normale serielle Worker übernimmt diese eng gebundene Kohorte einmalig in
seinen vorhandenen Bestand. Er erhält Originaldaten, Haltegründe und Seen-Bindungen.
Ein Importbeleg in der bestehenden `publication_recovery` verhindert Wiederanlage
nach späterer Entfernung. Neuere Akten, Bezahlquittungen, private Formate,
Seen-Datensätze, bestehende Ereignisse und Quellen-Zugriffssperren werden geschützt.

Die Rückführung ist keine Freigabe und kein fertiger Artikel. Die vorhandene
Queue prüft anschließend Ereigniszuschnitt, LIFO, Priorität, Quellen, vollständiges
Eingabepaket, Bezahlquittungen, Kontingente und Inhaltsgates. Es gibt keinen
zusätzlichen Anbieterpfad, keine neue Queue und keine Änderung an Budgets,
Modellen, Locks oder Oracle. Die zwei bezahlten fachlichen HOLDs bleiben getrennt.

Prüfung: `node --test tests/news/retained-discovery-inputs.test.mjs` und die
bestehenden Nachrichten-/Betriebs- und Release-Gates. Nach Merge erst im normalen
Folgelauf Rückführung, anschließende Gate-Entscheidung und gegebenenfalls reale
Auslieferung nachweisen. Eine wiederhergestellte Pending-Akte ist keine Lieferung.

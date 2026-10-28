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

Der vollständige PR-Build auf `da63e0bc` erreichte am 28. Oktober 950,1 MiB
und scheiterte deshalb am unveränderten 950-MiB-Größengate. Ein bereits
veröffentlichtes, unverändertes Blogbild wird über die vorhandene explizite
Bild-Release-Zuordnung ausgeliefert: `2026-08-03-wohlstandsverlust-preise-klimakrise.png`,
2.423.940 Bytes, SHA-256
`bd8a884519ac6141f1bfaa8b5d7412d60a0ff7f86246a04c13052c9409bb8c7e`.
Git-Original, gesicherte Kopie, bisherige Live-Datei und neu gelesene Release-Datei
sind bytegleich. Die unveränderliche Datei liegt im bestehenden Release
`woek-public-images-v1` (Asset 684060702); keine Datei wurde überschrieben.
Die bestehende Artefakt-Erzeugung ersetzt die Bildverweise und lässt allein
diese ausgelagerte Bildkopie aus dem Pages-Artefakt weg. Lesertext, Bildinhalt,
Metadaten und Git-Original bleiben erhalten. Das bestehende SHA-Gate prüft
auch dieses explizit ergänzte Bild. Rückfall: Zuordnung zurücknehmen und das
Artefakt regulär aus dem erhaltenen Original neu bauen. Die rund 2,3 MiB sind
begrenzter Platzgewinn, keine dauerhafte Wachstumskapazität. Größenlimit,
Quoten, historische Inhaltsgates und übrige Veröffentlichungen bleiben erhalten.

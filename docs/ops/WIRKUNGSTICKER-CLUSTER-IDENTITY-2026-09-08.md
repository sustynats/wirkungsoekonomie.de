# Artikelidentität und Erhalt veröffentlichter Fassungen

Stand: 8. September 2026.

## Nachgewiesener Fehler

Die Pisa-Story `wt-4c0a09f9ce090af7` war in Commit
`54dc6a6ea419e031bc6439937a47830392613216` mit Version 1 und
Veröffentlichungszeit `2026-09-08T08:23:27.568Z` vorhanden und öffentlich
ausgeliefert. Im Folgelauf wurde sie unbeabsichtigt durch einen Entwurf ohne
Veröffentlichungshistorie ersetzt. Es gab keine entsprechende Rücknahmeentscheidung.

Zwei Fehler wirkten zusammen:

1. Die konservative Ortsprüfung erkannte die Formulierung `in Mathematik`
   in der geprüften Zusammenfassung als Ortsnamen. Die neue Feed-Fassung mit
   `in Deutschland` wurde deshalb trotz identischer Artikel-URL nicht zugeordnet.
2. Für den unzugeordneten Kandidaten entstand aus Titelbegriffen und Tagesdatum
   dieselbe Story-ID. Ein solcher Hash-Treffer durfte bislang einen vorhandenen
   Datensatz ersetzen, obwohl gerade kein bestehendes Ereignis zugeordnet war.

## Generische Korrektur

- Unterrichtsfächer sind keine Ortsbelege. Die bestehenden Orts- und
  Ereigniskonflikte bleiben wirksam.
- Bei frischen Clustern liefert die führende Quelle den noch fehlenden Lead.
  Kontextquellen werden nicht zu alternativen Ortsankern. Dadurch bleiben zwei
  gleich betitelte Berichte über verschiedene Orte auch im selben Feedlauf getrennt.
- Eine vorhandene ID wird ausschließlich nach erfolgreicher Ereigniszuordnung
  wiederverwendet. Alle bestehenden IDs, einschließlich archivierter IDs, sowie
  neu vergebene IDs desselben Laufs sind belegt. Bei einer Kollision erhält ein
  tatsächlich unzugeordneter Kandidat eine deterministisch abgeleitete eigene ID.
- Bestehende Veröffentlichungen werden durch diese Routingänderung weder
  neu analysiert noch inhaltlich umgeschrieben.

## Regressionen

Die beiden Ursachen wurden zuerst mit fehlschlagenden Tests reproduziert.
Die ergänzten Prüfungen decken ab:

- Mathematik, Lesen und Naturwissenschaften sind keine widersprüchlichen Orte.
- Ein echtes Update bleibt mit der veröffentlichten Story verbunden.
- Gleicher Titel und gleiches Datum bei verschiedenen Orten erzeugen getrennte
  IDs, ohne einen bestehenden Datensatz zu verändern.
- Dasselbe gilt für zwei neue, noch nicht analysierte Ereignisse in einem Lauf.
- Ein frisches Studien-Update mit fehlerhafter KI-Antwort erhält Artikeltext,
  Versionsverlauf und ursprüngliches Veröffentlichungsdatum. Nur das ungeprüfte
  Update geht in den bestehenden Wiederholungsprozess.

629 News-/Monitor-Tests bestehen. Die Tests verwenden lokale Daten und
simulierte Antworten; keine kostenpflichtigen Anbieteraufrufe.

## Historischer Datensatz

Die zuvor veröffentlichte Fassung ist über den genannten Git-Commit vollständig
gesichert. Eine Wiederherstellung muss den inzwischen aktuellen Bot-Stand
berücksichtigen, den zurückgestellten Updateversuch samt Fehlern erhalten und
darf keine abweichende neue geprüfte Fassung überschreiben. Kostenjournale bleiben
unverändert; eine technische Wiederherstellung zählt nicht als Erstveröffentlichung.

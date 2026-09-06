# Wirkungskarte ohne Bilddatei

Anlass: Die Sachsen-Anhalt-Akte `wt-7ebecf5b3f91d490` erschien ohne die neue visuelle Überschriftenfläche. Ihr Datensatz enthielt kein `title_image`. Der Darstellungszweig in Übersicht und Detailansicht setzte jedoch eine gültige `wide`-Bildreferenz voraus. Die Bildwarteschlange bearbeitet hauptsächlich veränderte Akten beziehungsweise explizite Wiederholungen; eine unveränderte Altakte ohne Bildstatus musste deshalb nicht nachträglich ein Bild erhalten.

Die responsive Wirkungskarte besteht bereits aus HTML und CSS. Ihr Titel und ihre Relevanzanzeige benötigen keine Bilddatei. Der gemeinsame Renderer erzeugt sie nun auch ohne, mit wartenden oder mit ungültigen Bildmetadaten. Nur ein tatsächlich freigegebenes Symbolbild ergänzt den Hintergrund und dessen Kennzeichnung. Sonst lautet die Beschriftung innerhalb der Fläche „Wirkungskarte · WÖk-Einordnung“.

Übersicht und Detailseite verwenden denselben Renderer. Keine doppelte Überschrift, keine duplizierten Kartenbalken; „offen“ bleibt offen. Ein neuer öffentlicher Versionsmarker macht die aktualisierte Darstellung für die Web-App erkennbar. Die Regel greift beim normalen Seitenbuild rückwirkend und für neue Akten, ohne zusätzliche KI-Aufrufe, Bildgenerierung oder Eingriff in Nachrichteninhalt, Bewertungswerte, Versionen und Quellen.

Vier Regressionstests ergänzen die bestehenden Bild-/Overlaytests: fehlende Metadaten, wartende Verarbeitung, ungültige Bild-URLs sowie fehlende Analyse. Sie prüfen echte Überschriften auf beiden Oberflächen und unveränderte Eingangsdaten.

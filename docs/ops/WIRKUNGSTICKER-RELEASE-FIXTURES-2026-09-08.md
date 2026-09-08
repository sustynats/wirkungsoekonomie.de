# Stabile Darstellungstests ohne Abhängigkeit von laufenden Nachrichten

Stand: 8. September 2026. Reparatur eines nachgewiesenen Testfehlers,
keine Änderung journalistischer Entscheidungen oder öffentlicher Texte.

## Ursache und Auswirkungen

Nachrichtenlauf `34205357646` speicherte eine geprüfte Erstveröffentlichung.
Ihre Wirkungskarte hatte einen zulässigen OpenGraph-Fallback, aber keine
`title_image.wide`-Datei. Die HTML/CSS-Darstellung unterstützt diesen Zustand.

`tests/news/release-safety.test.mjs` verwendete jedoch die jeweils erste echte
Story mit `mode: impact_card` als Testgrundlage und griff ungeprüft auf
`story.title_image.wide.url` zu. Die neue Story änderte damit die Testvoraussetzung.
Der Test brach mit `Cannot read properties of undefined (reading 'url')` ab.

Pages-Deployment `34206102071` sowie die Nachrichtenläufe ab `34206687941`
scheiterten am selben Test. Auch `34212213549` vom 8. September, 09:50 UTC,
bestätigt diesen Fehler. Die nachfolgenden Nachrichtenläufe brachen vor dem
Collector und vor neuen kostenpflichtigen Analyseaufrufen ab. Der zuletzt
ausgelieferte Feed blieb beim Stand 08:25:31 UTC; ein grüner vorheriger Import
war deshalb noch kein Nachweis der Live-Auslieferung seiner neuen Meldung.

## Korrektur

- Alle veränderlichen Story-Abhängigkeiten in diesem Darstellungstest werden
  durch feste, synthetische Testdaten ersetzt. Auch ein bisher fest verwendeter
  realer Artikel-Slug ist keine Testvoraussetzung mehr.
- Der reguläre Bildtest prüft weiterhin vorhandene, zulässige Rastermetadaten,
  einen einmaligen HTML-Titel, eine Kennzeichnung, den erlaubten Symbolhintergrund
  und den Ausschluss eines zweiten bereits beschrifteten Rasterbildes.
- Zwei zusätzliche Regressionen prüfen Karten ohne Rasterbilder sowie den
  konkreten Fehlerfall mit ausschließlich OpenGraph-Fallback.
- Listenkarte und Detailseite müssen weiterhin genau eine passende Überschrift,
  offene Relevanzwerte ohne erfundene Bewertung und den aktuellen Kartenaufbau
  liefern. Unsichere Bild-URLs dürfen nicht erscheinen; Eingabedaten bleiben gleich.

Die synthetischen GitHub-Asset-URLs sind ausschließlich Format-Testwerte.
Die Tests rufen sie nicht ab und erzeugen keine Bilder. Keine Quellen-, Zahlen-,
Materialitäts-, Evidenz- oder Medienprüfung wurde entfernt oder abgeschwächt.
Kein Nutzungsjournal und keine Story wurden geändert oder gelöscht.

## Prüfung und Auslieferung

- Vorher: Fehler lokal mit dem unveränderten Test reproduziert (9/10 bestanden).
- Nachher: 12/12 Darstellungstests, 626/626 News-/Monitor-Tests, 41/41 Polls-Tests.
- Syntaxprüfung, Nachrichten-Build und News-Validierung erfolgreich.
- Öffentliche Sprachprüfung erfolgreich ausgeführt; bestehende 25 Befunde
  unverändert, keine fachlichen Textänderungen in diesem Release.
- Hosting-Kostengate bestanden. Kein Vercel-Build und keine neue Infrastruktur.
- Auslieferung über den bestehenden `[wirkungsticker]`-GitHub-Pages-Releaseweg.
  Der reguläre Nachrichtentakt verwendet danach die korrigierten Tests.

Die Reparatur beseitigt einen gemeinsamen technischen Blocker. Sie erklärt
weder die gesonderten Qualitäts-/Quellen-Holds für erledigt noch das Vier-Cent-Ziel
für erreicht. Release-Erfolg ist zusätzlich am öffentlichen Feed und an der
zuvor nicht ausgelieferten Detailseite zu kontrollieren.

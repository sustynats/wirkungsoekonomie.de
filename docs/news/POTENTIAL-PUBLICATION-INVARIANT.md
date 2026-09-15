# Wirkungsticker: unverlierbare Wirkungspotenzial-Publikationsregel

Stand: 15.09.2026

## Fachliche Invariante

Wirkung und Wirkungspotenzial sind getrennt. Eine reguläre neue oder fachlich neu freigegebene Wirkungsticker-Meldung bewertet ex ante das **Wirkungspotenzial**. Fehlende Outcome-Messung ist kein Grund, die Potenzialanzeige leer zu lassen.

Für Mensch, Planet und Demokratie gilt bei einer Veröffentlichung nach Impact-Semantik 2.1:

- genau ein fachlich abgegrenzter Bewertungsgegenstand und Vergleichszustand,
- mindestens ein begründeter modellierter Hauptpfad je Dimension,
- ordinale Tragweite 0 bis 5 je Dimension,
- Richtung getrennt von Tragweite; eine Richtung darf offen sein, obwohl eine Tragweite begründet ist,
- Wahrscheinlichkeit, Evidenz, Raum, Zeit, Empfänger, Annahmen und Grenzen getrennt ausweisen,
- unabhängige, quellengebundene Abschlussprüfung.

`insufficient_basis` mit `magnitude: null` bleibt für historische Daten lesbar. Es ist **kein zulässiger Endzustand für eine neue Veröffentlichung**. Wenn eine Dimension auch nach Recherche nicht vertretbar modelliert werden kann, bleibt der Beitrag im Recherche-/Prüfstatus. Es werden keine Faktoren erfunden.

## Technische Invariante

Die Regel muss zentral gelten und darf nicht davon abhängen, dass jeder einzelne Aufrufer ein optionales Flag erinnert.

1. `derivePublicationStatus()` verlangt bei Version 2.1 standardmäßig drei modellierte numerische MPD-Dimensionen.
2. Manuelle/redaktionelle Veröffentlichung verlangt dieselbe Invariante; kein Sonderweg.
3. Bestands-Promotion darf nur quellengebundene, bereits unabhängig geprüfte Wirkungsmetadaten übernehmen und darf keinen neueren Artikelstand überschreiben.
4. Ein vollständiges öffentliches Profil darf durch einen späteren Import nie zu einem Null-/`insufficient_basis`-Profil zurückgestuft werden. Eine inhaltlich neue Fassung bleibt bis zur vollständigen Potenzialprüfung unveröffentlicht; die letzte vollständige öffentliche Fassung bleibt erhalten.
5. Artikel, News-App-Feed und Merkzettelkarte werden aus demselben kanonischen Profil neu erzeugt und gemeinsam geprüft.
6. Ein Release gilt erst nach erfolgreichem Deployment **und Live-Readback** als behoben. Vorher ist er nur getestet, nicht live.

## Reparatur ohne zusätzlichen Provider-/LLM-API-Lauf

Wenn für einen bereits veröffentlichten Beitrag eine quellengebundene und unabhängig geprüfte Korrektur vorhanden ist, wird sie wiederverwendet. Für diese Wiederherstellung wird **kein neuer Textanbieter-/LLM-API-Aufruf** ausgelöst.

Zulässig sind:

- vorhandene geprüfte Assessment-Daten wieder einbinden,
- konfliktfreien Dreiwegeabgleich mit dem aktuellen Hauptzweig durchführen,
- Historie und `original_potential_assessment` unverändert erhalten,
- Seiten, App-Feeds und Such-/Taxonomieprojektionen deterministisch neu bauen,
- bestehende Tests, Qualitätsgates und Live-Readback ausführen.

Nicht zulässig sind:

- fehlende Tragweiten automatisch aus Schlagwörtern ableiten,
- offene Werte als null/neutral behandeln,
- einen älteren `stories.json`-Stand pauschal über neuere Nachrichten kopieren,
- einen vorhandenen unabhängigen Review durch Selbstfreigabe ersetzen,
- zur bloßen Wiederherstellung bereits geprüfter Werte einen neuen bezahlten API-Lauf starten.

## Release-Gates

Ein Potenzial-Release muss mindestens nachweisen:

1. kanonische Daten: drei modellierte MPD-Dimensionen, jeweils Magnitude 0..5;
2. unabhängige Review-Bindung und unveränderte Quellen-/Inhaltsbasis;
3. keine gelöschte Historie und keine veränderte ursprüngliche Potenzialbewertung;
4. `news:test` und `news:validate` erfolgreich;
5. erzeugte Artikelseite enthält drei numerische Balken;
6. jedes betroffene News-Feedfragment enthält dieselben drei Balken;
7. Merkzettel-/Item-HTML enthält dieselben drei Balken;
8. keine betroffene öffentliche Oberfläche enthält `data-path-status="insufficient_basis"`;
9. Deployment ist commitgebunden;
10. Live-Readback bestätigt die ausgelieferten Balken auf der Produktionsdomain.

## Fehlerregel

Ein grüner Teiltest ist kein Live-Nachweis. Wenn ein nachgelagertes Gate fehlschlägt, wird nicht behauptet, der Fehler sei behoben. Die Ursache wird behoben, der identische Kandidat erneut geprüft und erst nach Deployment plus Live-Readback als erledigt markiert.

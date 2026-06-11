# Post-Launch-Monitoring

Stand: 31. Mai 2026

## Ziel

Diese Post-Launch-Lernschleife beschreibt, wie die Website nach dem Launch beobachtet, ausgewertet und verbessert wird. Sie folgt der WÖk-Logik: messen, prüfen, korrigieren, lernen.

Das Monitoring dient nicht der personenbezogenen Analyse. Es soll sichtbar machen, wo Inhalte fehlen, Begriffe unklar sind, Demos missverstanden werden oder Nutzer:innen in der Customer Journey stecken bleiben.

## Datenschutzgrundsatz

Alle Kennzahlen werden nur aggregiert, datensparsam und zweckgebunden betrachtet.

- Keine Personenbewertung.
- Keine personenbezogenen Profile.
- Keine Zusammenführung öffentlicher Website-Sessions mit Akademie-Accounts.
- Keine werbliche Attribution.
- Keine Heatmaps oder Session-Replays.
- Keine Auswertung einzelner Besucher:innen.
- Keine neuen Analytics-Tools ohne fachliche, technische und datenschutzrechtliche Prüfung.

Vorhandene Analytics-Hinweise bleiben maßgeblich, insbesondere `docs/analytics-konzept.md` und `docs/analytics-besucherzaehlung-fix.md`. Die öffentliche Website nutzt bereits ein datensparsames First-Party-Konzept für Seitenaufrufe und wenige Ereignisse. Diese Datei ergänzt nur die fachliche Lernschleife.

## Kennzahlen

| Kennzahl | Zweck | Datenschutzgrenze | Review-Frage |
| --- | --- | --- | --- |
| 404-Fehler | Alte Links, Tippfehler und fehlende Redirects erkennen | Nur aggregierte Pfade, keine Nutzerprofile | Welche alten URLs brauchen Redirect, Alias oder Archivhinweis? |
| Meistbesuchte Seiten | Einstiege und stark genutzte Inhalte erkennen | Nur Seitenrang und Zeitraum | Verstehen Nutzer:innen sofort, was die WÖk ist und was der nächste Schritt ist? |
| Meistgenutzte Suchbegriffe | Informationsbedarf sichtbar machen | Nur aggregierte Suchbegriffe | Welche Begriffe, Methoden oder Dokumente werden aktiv gesucht? |
| Suchbegriffe ohne Treffer | Content-Lücken und Synonymprobleme finden | Nur aggregierte Suchbegriffe ohne Sessionbezug | Brauchen Glossar, Suche oder Navigation neue Synonyme oder Querverweise? |
| Meistgeklickte Journey-Karten | Customer-Journey testen | Nur aggregierte Klickzahlen pro Karte | Funktionieren Verstehen, Erleben, Vertiefen, Anwenden und Mitgestalten als Einstiege? |
| Demo-Aufrufe | Interesse an modellhaften Anwendungen sehen | Nur aggregierte Demo-Seitenaufrufe | Sind Schutzlinien, Modellannahmen und nächste Schritte klar genug? |
| Download-Aufrufe | Relevanz von Dokumenten erkennen, falls datenschutzkonform verfügbar | Nur aggregierte Datei- oder Dokumentaufrufe | Welche Dokumente sind führend, veraltet, missverständlich oder schwer auffindbar? |
| Abbruchstellen | Journey-Brüche erkennen, falls datenschutzkonform verfügbar | Nur aggregierte Seiten- oder Schritt-Ebene, keine Einzelsitzungen | Wo endet Nutzung auffällig oft ohne passenden nächsten Schritt? |

## Minimaler Review-Rhythmus

Monatlich wird ein kurzer Review durchgeführt. Er sollte maximal eine Stunde dauern und mit einer kleinen Entscheidungsliste enden.

1. Datenzeitraum festlegen: letzter voller Kalendermonat.
2. Kennzahlen aggregiert prüfen.
3. Auffälligkeiten in Content, Navigation, Suche, Demos und Downloads notieren.
4. Änderungen nach Risiko priorisieren.
5. Kleine Korrekturen direkt als Issue, Task oder Branch planen.
6. Größere inhaltliche Änderungen erst inventarisieren und nicht-destruktiv vorbereiten.
7. Nach Umsetzung Build, Linkcheck und kurze Dokumentation prüfen.

## Monatliche Review-Checkliste

| Bereich | Prüffrage | Ergebnis |
| --- | --- | --- |
| Content-Lücken | Welche häufigen Suchbegriffe oder 404-Pfade zeigen fehlende Inhalte? | offen |
| Begriffsprobleme | Welche Begriffe werden gesucht, aber nicht gefunden oder uneinheitlich verwendet? | offen |
| Tool-Probleme | Welche Demos oder Werkzeuge werden oft aufgerufen, aber führen nicht zu passenden nächsten Schritten? | offen |
| Neue Einwände | Welche Suchbegriffe, Rückmeldungen oder Absprungmuster deuten auf neue Missverständnisse hin? | offen |
| Neue Pilotanfragen | Welche Journey-Karten, Pilotseiten oder Kontaktpfade zeigen konkrete Anwendungsinteressen? | offen |
| Veraltete Dokumente | Welche Downloads oder Bibliotheksseiten brauchen Status-, Versions- oder Ersatzhinweise? | offen |
| Schutzlinien | Gibt es Demo-, Tool- oder Pilotseiten, auf denen "nicht amtlich", "keine Beratung" oder "keine Personenbewertung" unklar sind? | offen |
| Weiterleitungen | Welche 404-Pfade sollten in die Redirect-Matrix aufgenommen werden? | offen |

## Entscheidungslogik

Änderungen werden nach Wirkung und Risiko sortiert:

| Priorität | Auslöser | Reaktion |
| --- | --- | --- |
| Hoch | Wiederkehrende 404-Fehler auf Kernrouten, Demo-Missverständnisse, fehlende Schutzlinien | Sofort prüfen, Redirect oder Hinweis vorbereiten, Build und Linkcheck ausführen |
| Mittel | Häufige Suchbegriffe ohne Treffer, unklare Begriffe, schwache Journey-Klicks | Glossar, Suche, Querverlinkung oder Einstiegsseiten verbessern |
| Niedrig | Seltene Spezialpfade, ältere Archivdokumente, kosmetische Navigationsfragen | Sammeln und im nächsten Struktur-Review bündeln |

## WÖk-Lernschleife

Die monatliche Auswertung folgt diesem Ablauf:

1. Messen: Aggregierte Nutzungssignale sammeln.
2. Prüfen: Signale fachlich einordnen, nicht automatisch bewerten.
3. Korrigieren: Kleine, nachvollziehbare Verbesserungen nicht-destruktiv umsetzen.
4. Lernen: Dokumentieren, welche Annahme sich bestätigt oder verändert hat.

Diese Schleife ersetzt keine Nutzerforschung und keine Beratung. Sie ist ein einfaches Qualitätsinstrument, damit die Website aus realer Nutzung lernt, ohne Besucher:innen zu überwachen.

## Offene Implementierungsfragen

- Journey-Karten-Klicks sollten nur erfasst werden, wenn das bestehende First-Party-Analytics-Konzept dafür erweitert und datenschutzkonform geprüft ist.
- Suchbegriffe ohne Treffer dürfen nur aggregiert gespeichert werden. Freitext kann personenbezogene Angaben enthalten und muss deshalb besonders vorsichtig behandelt oder vor Auswertung bereinigt werden.
- Download-Aufrufe und Abbruchstellen sind optional. Sie werden nur genutzt, wenn die vorhandene Infrastruktur sie datenschutzkonform und ohne personenbezogene Profile bereitstellen kann.
- Für 404-Auswertung ist zu klären, ob Hosting-Logs, Search Console oder ein eigener datensparsamer Endpunkt genutzt werden. Bis dahin bleibt die technische Quelle offen.

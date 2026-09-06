# Interaktiver Stadtvergleich – Bundestagswahl 2025

Stand: 6. September 2026. Implementiert und lokal geprüft. Das produktive
Backend ist aktualisiert; die Umfrage bleibt bis zur Website-Abnahme pausiert.
Keine Vercel-Ressourcen oder -Builds.

## Architektur und Inhalt

Die bestehende statische Poll-Seite wird durch eine optionale, wiederverwendbare
Experience ergänzt. Daten: `content/polls/experiences/<slug>.json`;
Renderer: `scripts/polls/visual.mjs`; Browser: `assets/js/poll-visual.js`;
Layout: `assets/css/poll-visual.css`. Ohne Experience bleibt die bisherige
Wirkungsticker-Umfrage unverändert.

Die sieben Szenarien behandeln dieselben fünf Bereiche. Jedes unterscheidet
Programmrichtung, bildliche Übersetzung, möglichen Wirkpfad und Unsicherheit.
Die Originalprogramme und PDF-Seiten stehen in den Experience-Daten. Die
Bildpräferenz ist keine Parteipräferenz, Prognose oder Wahlempfehlung. Nicht
abgebildete Politikfelder und weitere Parteien werden im Methodikabschnitt
offengelegt. Kein Ranking durch einen verrechneten Gesamtscore.

Seed-Vorlage: `ops/polls/backend/city-poll.json`, bewusst **Entwurf**, ohne Stimmen.
Die Label-Zuordnung `Szenario A` bis `Szenario G` muss stabil bleiben. Option 8
erlaubt, keines der Bilder auszuwählen. Bilder und erläuternde Texte bleiben
auch ohne Teilnahme zugänglich. Freitext ist für diese sensible Umfrage aus.

## Bilder und Zoom

Originale: `outputs/wirkstadt-originale/` (lokal, nicht öffentliches Stimmsystem).
Optimierte WebP-Dateien: `assets/img/polls/wirkstadt/`, zusammen etwa 3,9 MB.
Bildmodus: eingebauter Bildgenerator, Bearbeitung desselben Ausgangsbildes.
Promptprotokoll: `docs/wirkstadt-bildprompts.json`. Tatsächliche Bildauflösung
1672 × 941 Pixel; kein behauptetes 4K und keine zusätzlichen Details durch Zoom.

Der Fokus wird als relative x/y-Koordinate mit Zoomfaktor gespeichert. Vorher,
nachher, Wischvergleich und Zweiervergleich verwenden dieselbe Transformation.
Sie bleibt beim Szenariowechsel erhalten. Auf kleinen Bildschirmen werden
Vergleichsbilder untereinander statt zu schmal nebeneinander angezeigt.
Markierungen sind mindestens 44 Pixel groß; Dropdown, Buttons und Slider sind
tastaturbedienbar. „Gesamtansicht“ setzt den Fokus zurück. Die natürliche
Browser-Vergrößerung wird nicht gesperrt.

### Energieversorgung: Präzisierung vor Erstveröffentlichung

Auf Nutzerhinweis wurden am 6. September die Energiepassagen der sieben
Originalprogramme erneut abgeglichen. Eine leere Erzeugungsfläche darf nicht
als automatisch saubere oder gesicherte Versorgung verstanden werden.
`stadtvergleich-energie.json` ergänzt deshalb für jedes Szenario dieselben
vier Felder: erneuerbare Erzeugung, Kohle/Gas/regelbare Kraftwerke, Kernenergie
und Netze/Speicher/Wärme. Im Zweiervergleich erscheinen beide Profile. Das
Ausgangsbild erklärt ausdrücklich den Unterschied zwischen Umspannwerk und
Erzeugung; ein regionales Verbundnetz wird in allen Szenarien vorausgesetzt.

Szenario D verwendet jetzt `d-energy-v2.webp`: ein sichtbarer Kohle-/Gas-Komplex
anstelle des unzureichenden kleinen Betriebsgebäudes. Das ursprüngliche Bild
bleibt erhalten. Prompt und Herkunft: `docs/wirkstadt-energie-korrektur.json`.
Es werden keine garantierten Kernkraftwerksneubauten aus bedingten
Programmoptionen konstruiert. Auch erneuerbare Szenarien erläutern Reserven,
regelbare Kraftwerke beziehungsweise Speicherbedarf und offene Kapazitäten.
Keine Mengen-/Preis-/Versorgungssicherheitsprognose wird vorgetäuscht.

Zusätzlich geprüft: alle sieben gleichartigen Energieprofile, fehlende Daten
als Validierungsfehler, 390-Pixel-Ansicht ohne horizontalen Überlauf, gleiche
Zoomtransformation in beiden Vergleichsbildern, bewusste Quellenaufdeckung
und fehlerfreie Browserkonsole.
Die Energieansicht hat zwei gemeinsame Zoomziele: das nördliche Umland und
den südöstlichen Energie-/Wärmestandort. So bleiben auch die in F und G rechts
unten gezeichneten konventionellen Anlagen direkt auffindbar. Beide Ziele
verwenden beim Vergleich unverändert dieselben Koordinaten.

Die Artefaktprüfung erkennt den gesonderten
Einstieg `poll-visual.js`; sie kontrolliert weiterhin sämtliche Bilder und die
unveränderten eingebetteten Szenariodaten.

## Datenschutz-Erweiterung (Schema 3)

Da aus der Auswahl politische Ansichten hervorgehen könnten, gibt es ein
explizites, nicht vorausgewähltes Einwilligungsfeld. Referenz sind insbesondere
Art. 6, 7 und 9 der [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679).
Dies ist die dokumentierte technische Umsetzung, keine pauschale rechtliche
Zertifizierung. Verantwortlichkeit, Betroffenenrechte und Infrastrukturhinweise
bleiben mit der bestehenden Datenschutzerklärung verknüpft.

- `polls.consent_required`: für bestehende Umfragen standardmäßig 0.
- `votes.consent_version`: `sensitive-choice-v1` bei der neuen Umfrage.
- Fehlende/falsche Einwilligung: `CONSENT_REQUIRED`, keine Stimme gespeichert.
- Der bestehende, pro Umfrage abgeleitete HMAC-Identifier bleibt bestehen.
- `DELETE /api/polls/<slug>/vote` entfernt nur die eigene Stimme, einschließlich
  gegebenenfalls verknüpften Feedbacks. Gleicher Token-Header, Origin-Prüfung,
  JSON-Validierung, Bestätigung `EIGENE STIMME LÖSCHEN` und eigenes Rate-Limit.
- Keine neue Konto-, Newsletter-, Analytics- oder Wirkungsraum-Verknüpfung.
  Auf Experience-Seiten werden `main.js` und das Newsletter-Formular nicht
  eingebunden. Auch spätere Footer-Normalisierung respektiert die Markierung.
- Die bewusste Parteiaufdeckung wird nicht zusätzlich gespeichert. Die
  Buchstaben sind ausdrücklich keine technisch sichere Verblindung.
- Sensible Stimmen werden nach 365 Tagen im täglichen Backup-/Bereinigungslauf
  gelöscht; planmäßige maximale Verzögerung: ein weiteres Tagesintervall.
- Sicherungen rotieren nach sieben Tagen zuzüglich des täglichen Intervalls.
- `vote_withdrawals` speichert nur zufällige Vote-UUID und Löschzeit, weder
  Option noch Token. Aufbewahrung acht Tage zuzüglich Bereinigungsintervall.
  Dieses Protokoll verhindert die Wiederbelebung widerrufener Stimmen.
- Backup-Timer und Rotation müssen überwacht werden. Bei ausgefallenem Timer
  darf die Löschfrist nicht als erfolgreich eingehalten gemeldet werden.

## Backup-first Deployment und Restore

Bestehenden Ablauf in `docs/umfragen.md` verwenden. Zuerst Serverinventar,
konsistente Datenbank- und Modul-Sicherung, dann additive Schema-3-Migration.
Keine fremden API-Dateien oder `.env` überschreiben; keine neuen Secrets nötig.
Die neue `restore.mjs` gehört ebenso wie `api.mjs`/`store.mjs`/`backup.mjs` in
das versionierte Poll-Modul. Der bestehende Hook und Discord-Admin bleiben.

Ein Restore darf nie einfach eine alte Datei produktiv überschreiben:

1. Dienst stoppen; aktuellen Datenbestand samt WAL/SHM privat sichern und als
   Quelle des aktuellen Löschprotokolls behalten.
2. Mit `POLLS_DATABASE_PATH` auf diesen aktuellen Bestand und dem bestehenden
   Pepper `node --env-file=.env polls/restore.mjs <absolutes-backup> <neue-datei>`
   ausführen. Der Zielpfad muss neu sein. Das Skript verändert die Backup-Datei
   nicht, wendet Widerrufe und archivierte Lösch-URLs an, entfernt abgelaufene
   sensible Stimmen und prüft Integrität/Fremdschlüssel.
3. Nur die so vorbereitete Datei nach Prüfung an den produktiven Pfad bringen.
   Besitzer, Rechte 0600 und unveränderten Pepper beachten. Alte WAL/SHM dürfen
   nicht versehentlich mit der neuen Datei kombiniert werden.
4. Bei fehlendem aktuellen Löschprotokoll **nicht** einfach sensible Stimmen
   wiederherstellen: Betreiberin einbeziehen und betroffene Daten verwerfen.
5. Sicherungs-/Zwischenkopien spätestens innerhalb des dokumentierten
   Rotationsfensters gezielt löschen. Keine privaten Daten nach GitHub.

Erst nach Backend-Prüfung neue Umfrage als veröffentlicht/geplant mit fernem
Start oder pausiert bereitstellen, Metadaten synchronisieren, vollständige
Website-Pipeline prüfen und über GitHub Pages veröffentlichen. Danach aktivieren,
öffentliche URL und 0 echte Startstimmen bestätigen. Nie eine unsichere
Schema-2-Abstimmung für diese politische Experience freigeben.

## Bisherige Prüfungen

- `npm run polls:test`: 34 Tests bestanden, einschließlich Schema-1→3 mit
  bestehenden Stimmen, Consent, Isolation, Datenschutz, Restore, Rate-Limits,
  Ergebnis-Sichtbarkeit und Zoomgrenzen.
- Lokaler Browser: 390-Pixel-Mobilansicht, identischer Ausschnitt bei
  Szenariowechsel, Wisch-/Zweiervergleich, Markierungen, schriftliche Details,
  Menü und Fehlerkonsole geprüft.
- Lokale echte UI-Abstimmung: ohne Consent blockiert, mit Consent gespeichert,
  Ergebnisse und Quellen aufgedeckt; nach Reload weiter dieselbe Stimme;
  anschließend eigene Stimme gelöscht und Ergebnis wieder verborgen.
- Produktive Umfragen wurden für diese Tests nicht verändert.

## Produktiver Backend-Prüfstand

Am 6. September 2026: bestehendes Schema 2 konsistent gesichert, Poll-Modul
separat unter `deploy-backups/wirkstadt-20260906/` aufbewahrt und Schema 3
additiv migriert. 21 Store-/HTTP-/Feedback-Tests unter Node 22.23.1 sowie
47 bestehende Backend-Tests, TypeScript-Lint und Build bestanden. Ein
abgestimmter Dienstneustart; öffentlicher Health-Endpunkt und bestehende
Feedback-Umfrage antworten mit HTTP 200, unauthentifizierter Adminzugriff mit
403. Anzahl und Prüfsumme der vorhandenen echten Stimme blieben unverändert.
Backup-Timer erfolgreich; zusätzliche konsistente Sicherung nach Migration.
SSH-Regel, andere Anwendungen, Caddy und ENV blieben unverändert.

Neue Poll-ID: `7f0dc2a0-05bb-4376-8b93-0e02febc2fb2`, stabiler Slug
`stadtvergleich-bundestagswahl-2025`, Einwilligung erforderlich, keine
Test-/Startstimmen, bis zur Frontend-Abnahme pausiert.

Noch ausstehend: vollständiger Website-/Artefakt-Build, GitHub-Pages-Deployment,
Aktivierung und Live-Abnahme. Der lokale Testserver ist **kein**
Veröffentlichungsnachweis.

### Alltag, Verkehrsflächen und Stadtgrün (Erweiterung vor Erstveröffentlichung)

`stadtvergleich-alltag.json` ergänzt sechs gleiche Vergleichsachsen mit 42
quellenbezogenen Einordnungen: Emissionen, Radwege, Straßen/Parken/Auto,
ÖPNV, Parks/Stadtgrün und Erholung. Die Auswahl koppelt Textvergleich und
identischen Bildausschnitt; sie löst niemals eine Abstimmung aus. Zusätzliche
Zoomziele zeigen Bahnhof und öffentlichen Freiraum. Programme werden nicht
künstlich gegensätzlich gemacht: Auch CDU/CSU und BSW fordern Radwege; SPD,
Grüne und Linke benennen Stadtgrün und Entsiegelung ausdrücklich. Fehlende
ausgewertete Festlegungen sind kein Nachweis einer Ablehnung.

Fünf nichtdestruktiv gespeicherte Bildrevisionen `*-alltag-v2.webp` verdeutlichen
Radverbindungen, öffentlichen Verkehr, Bildungsorte und die Umwidmung von
Parkraum zu Grün- und Aufenthaltsraum. Im BSW-Bild liegt das Gaswerk nun am
nördlichen Umspannwerk; die Abwasserinfrastruktur bleibt erhalten. Das bestehende
G-Bild wird beibehalten, weil der Korrekturentwurf die Erhaltungsbedingungen
nicht vollständig erfüllte. Promptprotokoll: `wirkstadt-alltag-bildprompts.json`.
Verwendet wurde der eingebaute Bildgenerator, kein kostenpflichtiger API-Fallback.

Emissionen werden qualitativ nach Quellen und Mechanismen eingeordnet,
nicht als erfundene Tonnenzahl, Rauchstärke oder manipulierte Wetterstimmung.
Die neue Artefakt-Skriptprüfung verlangt bei sensiblen Umfragen den separaten
Einstieg und Datenschutzmarker; allgemeine Seiten benötigen weiterhin ihr
versioniertes Hauptskript. Analytics werden auch später nicht nachgerüstet.

Lokaler Teststart:

```sh
POLLS_VISUAL_FIXTURE=true node scripts/polls/dev.mjs
```

Dabei entsteht immer eine separate temporäre SQLite-Datenbank in `outputs/`.
Die echte Feedback-Umfrage und deren Stimmen bleiben unangetastet.

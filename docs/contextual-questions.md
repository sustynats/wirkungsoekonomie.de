# Seitenbezogene Fragen

Stand: 4. September 2026.

`assets/js/main.js` lädt den kleinen gemeinsamen Baustein
`assets/js/contextual-questions.js`. Er verwendet vorhandene Website-Karten,
Typografie und Links; keine KI-Abfrage, kein Tracking und kein externer Dienst.

## Auswahl

1. Bereits redaktionell gestaltete `.related-questions-block` bleiben erhalten.
2. Eine explizite Fragenliste auf der Seite hat Vorrang.
3. Funktionsseiten haben konkrete eigene Fragen: beispielsweise Ergebnisanzeige,
   internes Feedback und Repräsentativität bei Umfragen, Mitwirkung beim Institut
   oder Lesereihenfolge beim Buch. Umfragen verwenden ihre echte Konfiguration.
4. Bereits formulierte Fragen in den Inhaltsüberschriften verlinken direkt auf
   die Antwort derselben Seite. Bei Glossarbegriffen werden vorhandene Definition
   und Abgrenzung mit dem konkreten Begriff verlinkt.
5. Für weitere fachliche Vertiefungen werden Titel und URL mit redaktionellen
   Themenprofilen abgeglichen. Inhaltsüberschriften helfen nur bei der Gewichtung;
   Navigations-/Footertexte und beiläufige Wörter im Artikeltext zählen nicht.
6. Ohne tragfähige Zuordnung erscheint kein Ersatzblock mit allgemeinen
   Grundsatzfragen. Es werden keine Fragen zufällig rotiert oder nur umformuliert.

Maximal drei Fragen; keine doppelten Ziele und keine Links zurück auf dieselbe
Seite ohne konkreten Abschnitt. Admin-, Weiterleitungs-, FAQ-, englische und
`noindex`-Seiten erhalten keinen automatisch angehängten Block. Englische Fragen
brauchen eine eigene redaktionelle Übersetzung, keinen deutschen Fallback.

Die Überschrift benennt den Seitentyp: Umfrage, Beitrag, Nachricht,
Veröffentlichung, Werkzeug oder Seite. Nur im Glossar heißt es „Begriff“.
Der Fragenheader wird nicht als Ablageplatz für persönliche Seiten-Merkbuttons
verwendet. Leser:innen können Fragen weiterhin über den bestehenden Weg einreichen.

## Redaktionelle Pflege

Konkrete dauerhafte Seitenzuordnungen: `PAGE_QUESTIONS` im Modul.
Fachliche Verweise: `QUESTION_TOPICS`, jeweils mit geprüften Antwortzielen.
Neue Links müssen auf wirklich passende Inhalte zeigen, nicht auf irgendeine FAQ.

Für einzelne Seiten kann deren führende Content-Quelle/Generator alternativ
folgendes JSON im `<main>` ausgeben (Text und JSON korrekt escapen):

```html
<script type="application/json" data-page-questions>
[
  {"label":"Welche Daten liegen dieser Analyse zugrunde?", "href":"#quellen", "tag":"Quellen"},
  {"label":"Was bleibt offen?", "answer":"Eine konkrete, redaktionell geprüfte Antwort.", "tag":"Grenzen"}
]
</script>
```

`[]` unterdrückt den automatischen Block auf dieser Seite. Inhalte werden als Text,
nicht als HTML ausgegeben. Linkziele müssen lokale Website-Pfade oder Fragmente
sein. Vorhandene aufklappbare Antworten werden beim Anspringen geöffnet.

## Prüfung und Veröffentlichung

`npm run questions:test` prüft Auswahl, Ausschlüsse, Headlines, echte Linkziele
einschließlich Fragmenten, XSS-Linkschutz und die Umfragevarianten. Die Prüfung
ist Teil von `build:artifact`, auch bei schnellen Ticker-Releases. Der gemeinsame
Cache-Schlüssel berücksichtigt das Fragenmodul, damit auch redaktionelle Änderungen
an den Fragen nach dem Deployment geladen werden.

Stichproben im Browser: Umfrage, Glossar, Journal, Institut, Buch, Verwaltung;
auf Mobilbreite keine horizontalen Überläufe. Ohne passende Zuordnung darf kein
leerer Block stehen. Bestehende Umfragen und Kommentare werden nicht verändert.

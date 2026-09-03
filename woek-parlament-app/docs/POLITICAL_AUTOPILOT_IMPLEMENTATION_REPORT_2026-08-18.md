# Technischer Abschlussstand: politischer Wirkungs-Autopilot

Stand: 18. August 2026

## Ergebnis

Die gemeinsame technische Zielarchitektur für Bundesregierung, Bundestag,
alle 16 Länder, die Europäische Union und das WÖk-Wirkungsobservatorium ist im
Portal umgesetzt und baut fehlerfrei. Nicht fachlich freigegebene Inhalte
werden nicht veröffentlicht. Der Bundeszweig ist produktiv; Länder- und
EU-Quellen werden weiterhin adapterweise und ohne falsche Vollständigkeit
freigeschaltet.

## Umgesetzt

- gemeinsames Jurisdiktionsregister für Bund, 16 Länder und EU;
- getrennte PoliticalTerms für Bund, Länder, EU-Kommission und EU-Parlament;
- strenge Wahl-Lifecycle-State-Machine;
- Verträge für Wahlunterlagen, Zusagen, Mandatszusagen, politische Aktionen
  und `BASELINE-READY`;
- zentrale Routen `/wirkungsfaelle`, `/regierung`, `/laender`, Länder-Unterseiten
  und `/eu` mit Kommission, Gesetzgebung und Mandat;
- geschützter Status unter `/autopilot/status`;
- zwei tägliche Autopilot-Zeitfenster mit Berlin-Zeitprüfung;
- Dropbox-Ordner- und Handoff-Struktur für Bund, Parlament, Länder und EU;
- hashbasierte Idempotenz und Fail-closed-Verhalten;
- Government-ImpactCase-Ingest gegen Schema 2.0.1;
- Parlament-Daily-Ingest einschließlich namentlicher Abstimmungen ohne
  Ableitung individueller Stimmen aus Fraktionsverhalten;
- getrennte Darstellung von amtlichem Sachverhalt, WÖk-Analyse, Evidenz und
  Bewertung;
- separater Tagesendlauf für eine responsive E-Mail-Zusammenfassung;
- Versand nur bei verifizierten öffentlichen Neuerungen, mit Double-Opt-in,
  Ein-Klick-Abmeldung, Impressum, Datenschutz, Verantwortlichkeit und ohne
  Öffnungs- oder Klicktracking;
- Design-Token-, Privacy-, Accessibility-, Source-vs-View- und
  Publication-Gates.
- zwei unabhängige Achsen für laufende Landesregierung und nächsten Wahlzyklus;
- tägliche, amtliche Wahlterminerkennung über die Bundeswahlleiterin;
- versionierte Wahlprogramm- und Kompetenzverträge ohne automatisches
  Wirkungsurteil;
- WÖk-Wirkungsobservatorium mit StateObservation, EvidenceEvent,
  ExternalShock, OutcomeSeries, RealityCheckCandidate und versionierten
  AnalysisUpdates;
- cloudbasierte Release-Monitore für 15 amtliche Datenquellenfamilien;
- öffentlich nachvollziehbare EvidenceEvent- und Versionsvergleichsbereiche,
  sobald freigegebene Fachupdates vorliegen.

## Geprüft

- 96 automatisierte Tests: bestanden;
- TypeScript: bestanden;
- ESLint: bestanden;
- automatisierte WCAG-2.2-AA-Quellbaseline: 82 Dateien, 0 Befunde;
- Design-Token-Prüfung: bestanden;
- Positionierungsprüfung: bestanden;
- Privacy-Governance: bestanden;
- Repository- und Release-Safety: bestanden;
- Public-Document-Gate: bestanden;
- Inhaltsvollständigkeitsprüfung des bestehenden Portals: 28 Arbeitsakten,
  1 Fachanalyse und 48 vollständige Publikationsquellen;
- Next.js-Produktions-Build: bestanden.

## Bewusst blockiert

### Bundesregierung

Government Data 1.1 wurde nicht veröffentlicht. Data 1.2 trennt die bekannten
Overmerges, hält unklare Objekte im Review Store und veröffentlicht nur den
objektweise geprüften Public Store. Die dokumentierten P0-Regressionsfälle und
der systemweite Cluster-Guard bestehen.

### Länder

Die Architektur, alle 16 Registry-Einträge, zwei unabhängige Lifecycle-Achsen,
Wahlzyklen und Verträge sind vorhanden. Amtliche präzise Wahltermine werden
automatisch erkannt. Die vollständige Programmextraktion und die
Landesregierungsadapter werden quellenweise freigeschaltet; nicht automatisierte
Quellen bleiben im Health-Status `DEGRADED`.

### Europäische Union

Kommission, EUR-Lex und OEIL sind als offizielle Quellenräume registriert.
Die Adapter befinden sich in `RECONNAISSANCE`, nicht in `ACTIVE`. Ein
vollständiger EU-Backfill wird daher nicht behauptet und der Health-Status
bleibt `DEGRADED`.

### Fachanalysen

Länder- und EU-ImpactCases werden erst nach einer schema-validen
`DEPLOY-APPROVED`-Übergabe von ChatGPT / Institut veröffentlicht. CodeX hat
keine Richtungen, Scores oder fachlichen Ersatztexte erzeugt.

### Tagesnewsletter

Der Versand läuft serverseitig und computerunabhängig. Er versendet nur bei
verifizierten öffentlichen Änderungen an aktive Double-Opt-in-Abonnements und
enthält Absender, Verantwortlichkeit, Impressum, Datenschutz und signierte
Ein-Klick-Abmeldung. Ohne Neuerungen wird keine leere Mail erzeugt.

## Deploymentstatus

Der freigegebene Government-Data-1.2-Public-Store und die 63 fachlich
übergebenen ImpactCases sind produktiv unter
`https://parlament.wirkungsoekonomie.de/regierung` veröffentlicht. Gesperrte
oder ungeprüfte Objekte bleiben unsichtbar beziehungsweise im Review Store.

## Nächste Freigabeschritte

1. Amtliche Länderprogramm- und Regierungsadapter einzeln fertigstellen und
   Coverage-Nenner belegen.
2. EU-Adapter gegen amtliche Dokumentation implementieren und Backfill auditieren.
3. Fachlich freigegebene Länder-, EU- und Observatorium-Handoffs integrieren.
4. Discord-Direktnachrichten aktivieren, sobald Bot-Token und Empfänger-ID im
   Vercel-Projekt gesetzt sind.
5. Manuelle Browser-/Screenreader-QA ergänzend zur automatisierten Baseline
   durchführen.

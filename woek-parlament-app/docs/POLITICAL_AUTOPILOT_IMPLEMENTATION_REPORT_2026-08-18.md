# Technischer Abschlussstand: politischer Wirkungs-Autopilot

Stand: 18. August 2026

## Ergebnis

Die gemeinsame technische Zielarchitektur für Bundesregierung, Bundestag,
alle 16 Länder und die Europäische Union ist im Portal umgesetzt und baut
fehlerfrei. Nicht fachlich freigegebene Inhalte werden nicht veröffentlicht.
Der Stand ist deshalb technisch vorbereitet, aber bewusst noch kein
vollständiger produktiver Länder-/EU-Autopilot.

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

## Geprüft

- 74 automatisierte Tests: bestanden;
- TypeScript: bestanden;
- ESLint: bestanden;
- automatisierte WCAG-2.2-AA-Quellbaseline: 79 Dateien, 0 Befunde;
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

Government Data 1.1 ist nicht produktionsfreigegeben. Bestätigte
P0-Overmerges betreffen mindestens:

- `govaction:dip:321575`
- `govaction:dip:328503`
- `govaction:dip:325255`
- `govaction:dip:328937`
- `govaction:dip:333505`
- `govaction:breg-cabinet:2445448:top:4`

Alle sieben Government-Gates stehen auf `FAIL`. Der Build bewahrt deshalb den
letzten freigegebenen Snapshot und veröffentlicht Data 1.1 nicht. Erforderlich
sind Government Data 1.2, bestandene Canonicalization-Regressionen und ein
erneuter externer Audit.

### Länder

Die Architektur, alle 16 Registry-Einträge, Wahlzyklen und Verträge sind
vorhanden. Die amtlichen Wahlquellen für Berlin, Mecklenburg-Vorpommern und
Sachsen-Anhalt sind definiert, aber noch nicht automatisiert. Es existiert
noch kein produktiv freigegebener allgemeiner Landesregierungsadapter. Der
Health-Status bleibt daher `DEGRADED`.

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

Der Versand bleibt bis zur ausgeführten Datenbankmigration, produktiv
verifizierter SMTP-Absenderkonfiguration und mindestens einer bestätigten
Double-Opt-in-Anmeldung geschlossen. Government-, Länder- und EU-Neuerungen
werden erst in den Digest aufgenommen, wenn ihr jeweiliger verifizierter
Deployment-Feed angeschlossen ist. Bis dahin weist der technische Bericht
`NO_VERIFIED_FEED_CONNECTED` aus.

## Deploymentstatus

Es wurde kein Production-Deployment fachlich ungeprüfter ImpactCases
durchgeführt. Die technische Architektur kann erst nach dem vorgesehenen
technischen Review veröffentlicht werden; gesperrte Datenobjekte bleiben auch
dann unsichtbar.

## Nächste Freigabeschritte

1. Government Data 1.2 und externen Re-Audit abwarten.
2. Amtliche Länderadapter einzeln implementieren und Coverage-Nenner belegen.
3. EU-Adapter gegen amtliche Dokumentation implementieren und Backfill auditieren.
4. Fachlich freigegebene `WÖkImpactCase`-Übergaben integrieren.
5. SMTP-Absender, Migration und Double-Opt-in-Ende-zu-Ende testen.
6. Staging Source-vs-View und responsive Browser-QA wiederholen.
7. Nur die grün geprüften technischen und fachlichen Objekte deployen.


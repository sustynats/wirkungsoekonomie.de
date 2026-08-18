# Gemeinsame politische Wirkungsarchitektur

Stand: 18. August 2026

Das Wirkungsportal verwendet für Bund, Bundestag, alle 16 Länder und die
Europäische Union ein gemeinsames technisches Modell. Es entstehen keine
getrennten Fachwelten. Die zentrale fachliche Einheit ist der
`WÖkImpactCase`, also ein kausal kohärenter Wirkungsgegenstand.

## Ebenen

```text
Jurisdiction
  -> PoliticalTerm
  -> MandateDocument und MandateCommitment
  -> GovernmentAction / ParliamentaryCase / LegalAct / ImplementationObject
  -> WÖkImpactCase
  -> versionierte WÖk-Analyse
  -> Reality Check
```

Die Lifecycle-Objekte dokumentieren, was politisch, parlamentarisch,
rechtlich und administrativ geschieht. Sie sind nicht selbst die
Wirkungsanalyse. Ein Ressortentwurf, Kabinettsbeschluss, DIP-Vorgang,
Rechtsakt und Vollzugsereignis können denselben ImpactCase referenzieren.
Ein Omnibusgesetz kann umgekehrt mehrere eigenständige ImpactCases enthalten.

Ein ImpactCase darf mehrere Jurisdiktionen verbinden, zum Beispiel:

```text
EU-Richtlinie -> Bundesgesetz -> Landesvollzug
```

Die einzelnen Lifecycle-Objekte bleiben erhalten und werden über explizite
Relationen wie `IMPLEMENTS`, `TRANSPOSES`, `EXECUTES`, `SPECIFIES` oder
`DEPENDS_ON` verbunden. Gemeinsame Dokumente, Sitzungen, Titelähnlichkeit oder
semantische Ähnlichkeit sind allein kein Identitätsbeweis.

## Institutionelle Rollen

| Jurisdiktion | Hauptgegenstand | Abhängigkeitsschicht |
| --- | --- | --- |
| Bund | Bundesregierung und konkrete Wirkungsgegenstände | Deutscher Bundestag, Bundesrat und Recht |
| Land | Landesregierung und konkrete Wirkungsgegenstände | Landtag, Bundesrat und Landesrecht |
| EU | Europäische Kommission und konkrete Wirkungsgegenstände | Parlament, Rat, Europäischer Rat und EU-Recht |

Landtage werden nicht als 16 Kopien des Bundestagsportals aufgebaut. Sie
werden dort angebunden, wo sie den Lebenslauf eines relevanten
Regierungsvorhabens verändern oder amtliche Abstimmungsdaten liefern.

Die EU besitzt getrennte institutionelle Zeitachsen. Die zehnte Wahlperiode
des Europäischen Parlaments beginnt am 16. Juli 2024; die Kommission
2024-2029 am 1. Dezember 2024. Geerbte Verfahren werden nicht rückwirkend der
neuen Kommission zugeschrieben.

## Fachliche Arbeitsteilung

ChatGPT / Institut für Wirkungsökonomie liefert und verantwortet die
freigegebenen ImpactCases, Wirkpfade, Richtungen, Evidenz, Rechts- und
Schutzprüfung sowie Reality Checks. CodeX beschafft und strukturiert amtliche
Fakten, prüft Verträge und Relationen, stellt die freigegebenen Analysen dar
und betreibt Tests und Deployment.

Technische Daten erzeugen niemals automatisch eine fachliche Richtung. Es
gilt insbesondere:

- `OPEN` ist nicht neutral und nicht null.
- Ex ante ist keine bereits eingetretene Wirkung.
- Pfade werden nicht gezählt oder gemittelt.
- Schutzgrenzen sind nicht kompensierbar.
- Abstimmungen erzeugen keine Personen- oder Parteiennote.

## Öffentliche Routen

- `/wirkungsfaelle`: fachlicher, jurisdiktionsübergreifender Einstieg
- `/regierung`: Bundesregierung
- `/laender`: Übersicht aller 16 Länder
- `/laender/<slug>`: Land, Wahl, Regierung und Mandat & Praxis
- `/eu`: EU-Hub
- `/eu/kommission`, `/eu/gesetzgebung`, `/eu/mandat`
- `/autopilot/status`: geschützter Betriebsstatus

Die Grundreihenfolge einer ImpactCase-Seite ist Wirkung zuerst und Prozess
danach: Gegenstand, Wirkungskern, Potenziale, Risiken, Mechanismen,
Betroffene, Wirkungsordnungen, MPD, SDG/SDG+, Recht, Evidenz, Bedingungen,
Gegenmechanismen, Schutzgrenzen, Datenbedarf, Reality Check und erst danach
politischer Lebenslauf, Abstimmungen, Mandat und Quellen.

## Wahl- und Term-Lifecycle

Länder werden über eine strenge Zustandsmaschine geführt:

```text
DORMANT
-> PRE_ELECTION_WATCH
-> PROGRAMME_ANALYSIS
-> ELECTION_RESULT
-> COALITION_FORMATION
-> GOVERNMENT_FORMED
-> GOVERNMENT_MONITORING
-> TRANSITION_TO_NEXT_TERM
```

Ein Übergang benötigt ein dokumentiertes amtliches Ereignis. Originale
Programme und Mandatsdokumente werden versioniert und nicht still
überschrieben. Forderungen bleiben zunächst Quellenextraktionen; CodeX leitet
daraus keine Wirkung ab.

## Betriebsmodus

Der technische Autopilot wird zweimal täglich aufgerufen. Innerhalb des
Berlin-Zeitfensters verarbeitet er zuerst freigegebene Fachübergaben,
validiert und testet sie und erzeugt danach neue amtliche Deltas. `READY` wird
immer zuletzt geschrieben. Freigegeben wird ausschließlich über
`DEPLOY-APPROVED`; gleicher Dateiname mit verändertem Hash stoppt den Lauf.

Der Tagesnewsletter ist ein eigener Lauf am Tagesende. Er enthält nur
fachlich freigegebene, technisch geprüfte und auf der öffentlichen Website
verifizierte Änderungen. Ohne solche Änderungen wird keine E-Mail versandt.

## Aktueller Anschlussstatus

| Bereich | Status |
| --- | --- |
| Bundestag DIP und namentliche Abstimmungen | aktive amtliche Adapter |
| Bundesregierung | Datenbestand vorhanden, Produktion wegen bestätigter Overmerges gesperrt |
| Länder | Registry und Verträge vorhanden; amtliche Wahladapter noch nicht automatisiert |
| EU | Registry, Terms und Verträge vorhanden; Quellenadapter in Reconnaissance |

`DEGRADED` und `BLOCKED` sind gewollte, sichtbare Zustände. Ein noch nicht
angeschlossener Adapter wird nicht durch eine Ersatzquelle oder scheinbare
Vollständigkeit kaschiert.

## Veröffentlichungsgates

Ein Objekt wird nur veröffentlicht, wenn technische Validierung, Identität,
Quellenprovenienz, fachliche Freigabe und Source-vs-View bestanden sind.
Teilfreigaben sind zulässig; ein fehlerhaftes Objekt blockiert nicht zwingend
andere saubere Objekte. Das fehlerhafte Objekt selbst bleibt jedoch geschlossen.


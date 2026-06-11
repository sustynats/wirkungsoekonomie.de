# Tool-Spezifikation: Staat, Recht & Demokratie

Version: v0.1
Autorin: Natalie Weber
Referenz: Wirkungsökonomie

## Ziel

Für den Portalbereich Staat, Recht & Demokratie werden mehrere Tools und Komponenten benötigt: LawReader, LawReference, Politische Wirkungsprüfung, Wirkungshaushalt-Demo und Wirkungsrat-Schema.

## 1. LawReader

### Funktion
Gesetzestexte online lesbar machen: Paragraf, Kurzfassung, Gesetzestext, Kommentar, Begründung, Verweise, Druck und Download.

### Datenfelder
- lawId
- title
- subtitle
- version
- status
- date
- author
- paragraphs[]
  - paragraphId
  - label
  - title
  - shortSummary
  - legalText
  - commentary
  - rationale
  - relatedTools
  - relatedBookAnchors
  - relatedPortalPages

### Mindestseiten
- /werkstatt/gesetze/wirkungssteuergesetz/
- optional /werkstatt/gesetze/wirkungsumsatzsteuergesetz/
- optional /werkstatt/gesetze/wirkungseinkommensteuergesetz/

## 2. LawReference

### Funktion
Inline-Verweise im Text: § 1 WStG, § 5 WUStG, § 8 WUStG usw. mit Hover/Fokus/Tap-Erklärung und Link zum Paragrafenanker.

### Anforderungen
- nicht nur Hover
- Tastaturfokus
- mobil nutzbar
- aria-label
- Link bleibt sichtbar
- keine leeren Links

## 3. Politische Wirkungsprüfung

### Funktion
Programme, Gesetze und Haushalte als Wirkungspotenziale prüfen, ohne Parteien moralisch zu sortieren.

### Eingaben
- Wirkungsfeld
- Maßnahme / Programmpunkt
- Zielzustand
- betroffene Gruppen
- erwartete Erstwirkung
- erwartete Zweit- und Drittwirkungen
- SDG-/SDG+-Bezug
- Datenlage
- Kosten / Haushalt
- Umsetzungsrisiko
- Übergangsschutz
- Korrekturmechanismus

### Ausgabe
- Wirkungsprofil
- Zielkonflikte
- offene Fragen
- politische Optionen
- Datenbedarf
- Hinweis auf demokratische Entscheidungsspielräume

## 4. Wirkungshaushalt-Demo

### Funktion
Öffentliche Ausgaben nach erwarteter Netto-Wirkung, Präventionswert, Resilienzbeitrag und Umsetzungsrisiko einordnen.

### Beispielmatrix
NWI-Spanne, T-SROI-Relevanz, Zielgruppenwirkung, Resilienz, Kosten, Umsetzungsrisiko, Rechtsschutzbedarf, Korrekturfähigkeit.

## 5. Wirkungsrat-Schema

### Funktion
Interaktive Darstellung von Zusammensetzung, Aufgaben, Schutzmechanismen und Konsultationsprozess des Wirkungsrats.

### Darstellungsfelder
- Wissenschaft
- Zivilgesellschaft
- Wirtschaft
- Politik/Verwaltung
- Bürger:innen per Losverfahren
- Transparenz
- Cooling-off
- Evaluation
- Wirkungsberichte
- öffentliche Konsultation

## Wichtiger Disclaimer

Alle Tools sind Modell- und Lerninstrumente. Sie ersetzen keine Rechtsberatung, Steuerberatung oder demokratische Entscheidung. Sie zeigen Wirkungslogiken und Umsetzungsoptionen.

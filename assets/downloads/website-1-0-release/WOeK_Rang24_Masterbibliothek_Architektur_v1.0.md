# Masterbibliothek Architektur

Autorin: Natalie Weber
Referenz: Wirkungsökonomie
Version: 1.0
Stand: 25. Mai 2026
Status: Öffentliche Releaseübersicht

Autorin: Natalie Weber
Referenz: Wirkungsökonomie
Version: 1.0
Status: Website-1.0-Releasepaket - Entwurf fuer finale Integration und QA
Stand: 25. Mai 2026

## Ziel

Die Masterbibliothek ist das oeffentliche Wissensarchiv der Wirkungsökonomie. Sie fuehrt Website, Buch, Akademie, Dossiers, Portale, Konzeptpapiere, Toolkarten, Downloads, Glossar und Quellen in einer konsistenten Struktur zusammen.

## Leitprinzipien

1. Jede Datei braucht eine Onlinefassung.
2. Jede Onlinefassung braucht PDF- und PDF-Download.
3. Jede Downloadkarte braucht Status, Version, Stand, Autorin und Referenz.
4. Keine kurzen Grobtexte duerfen als Konzeptpapier erscheinen.
5. Jedes Fachportal braucht SDG-/SDG+-Block und politische Anschlussfaehigkeit.
6. Jedes Tool braucht Beschreibung, Nutzen, Zielgruppe, Status und Link.
7. Jedes Dokument muss suchbar und filterbar sein.
8. Aeltere oder ueberholte Versionen muessen als superseded markiert werden.

## Datenmodell

Die Bibliothek verwendet drei Hauptebenen.

### Ebene 1 - Portal

Ein Portal ist ein thematischer Wirkungsraum, zum Beispiel Wohnen, Arbeit, Gesundheit, Migration oder Digitalisierung. Ein Portal besitzt Startseite, Konzeptpapier, Gesamtdossier, Konzeptpapiere, Downloads, Toolkarten, SDG-/SDG+-Block, politische Anschlussfaehigkeit, Buchanker und Glossarlinks.

### Ebene 2 - Dokument

Ein Dokument ist ein einzelner Inhalt mit klarer Fassung. Dokumenttypen sind: Portalstartseite, Konzeptpapier, Gesamtdossier, Konzeptpapier, Toolkarte, SDG-/SDG+-Block, politische Anschlussfaehigkeit, Quellen, Glossar, Integrationsgrundlage, Releasebericht.

### Ebene 3 - Format

Ein Dokument kann mehrere Formate besitzen: Onlinefassung, PDF, PDF, HTML, Markdown, JSON, XLSX oder ZIP. Fuer Website 1.0 sind Onlinefassung, PDF Pflicht, sofern es sich um oeffentliche Fachtexte handelt.

## Versionierung

Versionierung ist kein Formalismus. Sie verhindert, dass alte, kurze oder fehlerhafte Fassungen parallel zur gueltigen Fassung auftauchen. Jede Fassung erhaelt:

- Version
- Stand
- Status
- Autorin
- Referenz
- aktive Version ja/nein
- superseded durch
- QA-Status

## Aktive und superseded Fassungen

Wenn mehrere Pakete desselben Rangs existieren, muss Fachteam nur die im Masterregister als aktiv markierte Fassung oeffentlich prominent verlinken. Aeltere Pakete koennen archiviert oder als superseded markiert werden, duerfen aber nicht als gleichwertige aktuelle Fassung erscheinen.

## Such- und Filterlogik

Die Fachbibliothek braucht Filter nach Rang, Thema, Dokumenttyp, Format, Status, SDG, SDG+, Zielgruppe, Toolbezug, Buchanker und Version. Die Suche muss Titel, Kurzbeschreibung, Glossarbegriffe, Portalnamen und Dokumenttypen durchsuchen.

## Downloadzentrum

Das Downloadzentrum ist keine Dateiliste. Es ist eine kuratierte Bibliothek. Jede Downloadkarte muss erklaeren, was die Datei ist, wofuer sie gedacht ist, welcher Status gilt und welche Onlinefassung dazu gehoert.

## Onlinefassungen

Onlinefassungen sind Pflicht. Eine Website, die nur PDF-Downloads anbietet, ist fuer Version 1.0 nicht ausreichend. Lange Konzepte muessen online lesbar sein, mit Inhaltsverzeichnis, Ankerlinks, Druckfunktion, Querverlinkungen und mobil sauberer Darstellung.

## Toolkarten-Governance

Toolkarten duerfen nicht nur Namen enthalten. Jede Toolkarte braucht:

- Beschreibung
- Nutzen
- Zielgruppe
- Status
- Demo oder Link
- Datenbedarf
- SDG-/SDG+-Bezug
- Schutzlogik gegen Missbrauch

## Glossar-Governance

Der Begriffsleitfaden vom 21. Mai 2026 ist fuehrend. Aeltere Begriffsverwendungen muessen gegen ihn geprueft werden. Besonders kritisch sind Wirkung, positive Wirkung, Netto-Wirkung, SDG+, Mensch, Planet und Demokratie, Wirkungsbewertung, Wirkungspotenzial, Wirkungsrisiko, Wirkungssimulation, Wirkungswahrheit und Wirkungsarchitektur.

## Quellen-Governance

Quellen muessen in oeffentlichen Dokumenten als normale Quellen lesbar sein. Keine nicht öffentlichen Zitationsmarker, keine Bearbeitungsspuren, keine rohen Toolreferenzen. Externe Quellen muessen mit Titel, Institution, Jahr, URL und Abrufhinweis oder Stand angegeben werden.

## Abschluss

Die Masterbibliothek ist der Ort, an dem aus einzelnen Rangpaketen eine nutzbare Website 1.0 wird. Sie sorgt fuer Wiederauffindbarkeit, Versionstreue, Quellenklarheit, Downloadfaehigkeit und fachliche Kontrolle.
# Nachrichtenveroeffentlichung: Glossarblocker vom 1. Oktober 2026

Die Nachrichtenverarbeitung speicherte neue Artikel und Lagen. Der nachgelagerte
Website-Release scheiterte jedoch an `NWI_ACRONYM_DISAMBIGUATED`: In der
Glossaruebersicht stand im Eintrag Wirkungscontrolling noch die historische
WÖk-Kurzbezeichnung `NWI`. Der Pruefer meldete den sichtbaren Text in
`begriffe/index.html`, Offset 733550. Ein erfolgreicher Verarbeitungslauf war
damit kein Nachweis einer erfolgreichen Veroeffentlichung.

Die fuehrende Quelle `assets/data/term-registry.json` verwendet fuer diesen
Eintrag jetzt durchgaengig `WÖk-Netto-Wirkungsindex`. Die bestehenden
Glossargeneratoren erzeugen Definition, Hovertext und Datenprojektionen daraus.
Interne IDs, Beziehungen, URLs, Formeln und Freigaben bleiben unveraendert.
Der externe Nationale Wohlfahrtsindex behaelt seine etablierte Kurzform NWI.
Historische Buch-/Manuskriptfassungen werden nicht veraendert.

`tests/site/glossary-nwi-release.test.mjs` prueft Quelle, oeffentliche Projektion,
Glossaruebersicht und die Unterscheidung beider Kennzahlen. Der bestehende
Release-Audit fuehrt diese Regression vor dem unveraenderten Gesamtgate aus.
Kein Qualitaetsgate wird deaktiviert oder abgeschwaecht.

Der bestehende serialisierte GitHub-Pages-Release veroeffentlicht bereits
gespeicherte Nachrichten. Keine neue Artikelgenerierung, Budgetaenderung,
manuelle Analysefreigabe oder zusaetzliche Hostingplattform ist erforderlich.
Ein Release gilt erst nach erfolgreichem Deployment und Abruf der oeffentlichen
Lagen-/Artikelseiten als live. Der getrennte Timeout des Redaktionsworkers wird
durch diese Glossarkorrektur nicht behoben.

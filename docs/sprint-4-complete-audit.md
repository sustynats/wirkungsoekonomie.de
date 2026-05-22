# Sprint 4 Complete Audit

Stand: 2026-05-22.

## 1. Kompass MVP

Abnahmefähig als MVP. Der Kompass bietet Einstiegskacheln, kuratierte Startfragen, statische Antwortkarten, Tiefenebenen, Quellenpanel, Wissenskarten und Audiozugang. Kein LLM, kein Chatbot.

## 2. Scanner MVP

Abnahmefähig als MVP. `/anwendungen/scanner.html` ist als Anwendungs-URL angelegt. `/scanner.html` bleibt erhalten. Acht Modi, strukturierte Eingabe und Demo-Ergebnisse sind umgesetzt.

## 3. Wirkungseinkommen-Rechner

Abnahmefähig als Modellrechner. Bruttovolumen, Finanzierungsstack, Datenstatus und Netto-Finanzierungsbedarf werden clientseitig berechnet. Hinweise auf Modellwert und fehlende Leistungszusage sind gesetzt.

## 4. Wirkungsrente-Rechner

Abnahmefähig als Arbeitspapier-Modellrechnung. Eingaben, Wirkungspunkte, Wirkungsdividende und Modellrente werden berechnet. Hinweise auf fehlende Rechtsgrundlage, keine Personenbewertung und keine Social-Credit-Logik sind gesetzt.

## 5. Wissenskarten-System

Abnahmefähig als Daten-MVP. 15 Wissenskarten wurden in `/content/wissen/wissenskarten.json` angelegt und in Kompass und Suche eingebunden.

## 6. Suche

Verbessert: Vorschläge während Eingabe, Filter für Wissenskarten/Zielgruppen/Audio, Synonyme und Suchindex-Einbindung der Wissenskarten.

## 7. Audio

Audios bleiben erhalten. Startseite hatte Audio bereits; Verstehen und Kompass wurden ergänzt. Fehlende Transkripte bleiben dokumentierter Verbesserungsbedarf.

## 8. Status und Haftung

Alle neuen MVP-Werkzeuge enthalten Hinweise gegen falsche Sicherheit:

- Scanner: wirkungsökonomische Ersteinschätzung.
- Wirkungseinkommen: Modellrechnung / keine Leistungszusage.
- Rente: Arbeitspapier-Modellrechnung / keine Leistungszusage.
- Produkte: keine finale Steuerklasse.
- Unternehmen: keine finale Unternehmensbewertung.

## 9. Offene Punkte für Sprint 5

- Externe Datenanbindung: Open Food Facts, EPREL, Unternehmensberichte, URL-Analyse, Wahlprogramme und DPP.
- Scanner-Regelwerk versionieren.
- Wissenskarten um eigene Detailseiten oder Glossaranker erweitern.
- Volltranskripte ergänzen.
- Suchranking und Vorschlagslogik weiter verfeinern.

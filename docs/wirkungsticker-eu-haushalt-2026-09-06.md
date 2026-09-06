# EU-Haushaltsanalyse – redaktionelle Prüfung

Stand: 6. September 2026. Ursprung: `wt-995822cc0b71a7f8`.

## Ergebnis und Umfang

Eigenständige WÖk-Analyse mit rund 1.650 Wörtern, 13 Abschnitten und 13 typisierten Claims. Sie behandelt den MFR 2028–2034 als offenen Verhandlungsgegenstand, nicht als beschlossenes Budget. Regierungserklärung, Kommissionsentwurf, parlamentarische Gegenposition, Verfahren, Klimarisiken und normative SDG-Bezüge sind getrennt.

Die zusätzliche Recherche wurde in diesem beauftragten Codex-Arbeitsgang vorgenommen und der Beitrag in das bestehende redaktionelle Datenmodell eingepflegt. Kein weiterer Nachrichten-API-Aufruf und keine fingierte Provider-Nutzung; der Arbeitsgang selbst ist damit nicht als insgesamt kostenlos ausgewiesen. `editorial_review.news_api_calls = 0` dokumentiert diese Abgrenzung. Der reguläre Nachrichtenbetrieb und seine Budgets wurden nicht verändert.

## Quellenprüfung

Die acht URLs, Originaltitel, Urheber und relevanten Textstellen wurden mit öffentlich zugänglichen Originalseiten geprüft:

- Gemeinsame Erklärung der sechs Staaten, Bundesregierung, 27.08.2026: konkrete Ausgangsposition.
- Kommissionsvorschlag, 16.07.2025: eigener Vorschlag.
- Kommission/Klimapolitik, Dokumentstand 09.10.2025: 35 % für Klima **und Umwelt**; ältere Quote anders abgegrenzt.
- Rat der EU, Dokumentstand 15.07.2026: Verfahren und laufende Preise, keine finale Einigung.
- Europäisches Parlament, 28.04.2026: eigenständige Gegenposition und Kontrollfragen.
- Europäische Umweltagentur, 11.03.2024: veröffentlichte Zusammenfassung der europäischen Klimarisikobewertung, keine Kürzungsfolgenberechnung.
- Europäischer Rechnungshof, Sonderbericht 09/2022, 30.05.2022: historische Kritik an Klimaausgaben-Erfassung; keine Übertragung des Befunds auf 2028–2034.
- UN, Agenda 2030, 25.09.2015: Zielreferenz, kein UN-Urteil über den MFR.

Zwei Kommissionsdokumente zählen als ein Ursprung; insgesamt sieben institutionelle Urheber der Analysebasis. Das sind nicht sieben unabhängige Bestätigungen einer Wirkung. Dokumentstände bleiben erhalten. Keine Paywallumgehung, keine gespiegelten Fremdbilder oder Volltexte, keine neue automatisch überwachte Quelle. Ein weiterer EP-Thinktank-Link war nicht ausreichend zugänglich und wurde nicht als Beleg verwendet.

## Fachliche Grenzen

- Keine Gleichsetzung von Ausgaben, Quote, Projektoutput und tatsächlicher Zustandsveränderung.
- Keine fiktive Verteilung konkreter Kürzungen auf Klima- oder Sozialprogramme.
- Keine Prozentgrafik aus inkompatiblen Zeiträumen oder Budgetdefinitionen.
- Konkrete SDG-Unterziele; keine pauschale Verlängerung ihrer Fristen auf 2034.
- Bundes-GGO/eNAP nicht auf EU-Verfahren übertragen; vorhandene EU-Prüfarchitektur anerkannt.
- Systemische Pfade, Kaskaden und drei Szenarien sind ausdrücklich bedingt. Keine robuste Gesamtrangfolge oder angeblich gemessene Schäden.
- Nichtkompensation und Reverse Merit Order sind als WÖk-Logik und nicht als amtliche Haushaltsregeln erklärt.
- Der vorhandene visuelle Claim-Vergleich zeigt Quellenstand, mögliches Potenzial und mögliches Risiko; kein dekoratives Zahlenchart.

## Technische Absicherung

Bestehende Templates, Validatoren, Claim Ledger, SEO/RSS, Autorinnenportrait, Methodenverlinkung und gegenseitige Story-Links werden wiederverwendet. Geprüfte Recherche bleibt im Quellen-Snapshot der Analyse und wird bei späteren Versionen erneut in das bestehende Analysepaket aufgenommen. Sie wird nicht in die Meldung oder eine Lageakte hineinvermengt. Zusätzlich sind Quellenlinks pro Abschnitt möglich.

Die Tests prüfen Dokumentbindung, Publisher/URL, Datum, geänderte Kurzfassung, offenes Ereignisgate, Herkunftsabhängigkeit, Prompt-Isolation, systemische Grundregel, Abschnittslinks und kostenfreie Idempotenz des regulären Workers. Die neue Regel ist in Root-AGENTS.md dauerhaft verankert; historische Publikationen wurden in diesem Arbeitsgang nicht massenhaft neu analysiert.

## Prüfung vor Veröffentlichung

- 409 automatisierte Wirkungsticker-Tests erfolgreich, einschließlich neun neuer Recherche-/Systemik-Regressionsfälle.
- `news:build`, `build:search`, `taxonomy:build` und `news:validate` erfolgreich.
- Source-Integrity-Audit mit `--strict`: 93 bestehende aktive Stories und 186 Quellen geprüft, kein offenes Gate. Source-Portfolio-Audit ebenfalls erfolgreich; das bestehende Quellenportfolio wurde nicht erweitert.
- Lokaler Browsercheck auf Desktop und bei 390 Pixel Breite: lesbare helle Headline, Autorenportrait geladen, kein horizontaler Überlauf, keine JavaScript-Seitenfehler.
- Sichtbarer Analyse-Link in der Übersicht, gegenseitige Verlinkung mit der Ursprungsgeschichte, Inhaltsverzeichnis mit vollständigen Sprungzielen und Methodenlink tatsächlich geöffnet. SDG-Abschnitt mobil visuell geprüft.
- Produktionsprüfung folgt nach dem regulären GitHub-Pages-Deployment; die vorstehenden Angaben bezeichnen keine bereits abgeschlossene Live-Prüfung.

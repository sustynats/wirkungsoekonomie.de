# WÖk-Fachreview Mecklenburg-Vorpommern 2026 - Initiale Wahlprogramm- und Wirkungsanalyse

**Stand:** 18.08.2026  
**Jurisdiktion:** DE-MV  
**ElectionCycle:** Landtagswahl 20.09.2026  
**Status:** PROGRAMME_ANALYSIS / INITIAL_MATERIALITY_REVIEW  
**Maßstab:** WÖk-Begriffsleitfaden v1.5 / Root-AGENTS.md / WOEK-POLITICAL-IMPACT-2.0 / Kompetenz- und Höherrangiges-Recht-Gate 2.0

## 1. Verifizierte Programmbasis

Offizielle/parteioffizielle Programme bzw. Programmbereiche sind zum Stand dieses Reviews verifiziert für:

- SPD MV - Regierungsprogramm 2026-2031: https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031
- CDU MV - Wahlprogramm/Programmseite und Parteitagsbeschluss 2026: https://cdu-mv.de/programme/ und https://cdu-mv.de/2026/daniel-peters-wir-zeigen-mit-diesem-programm-mecklenburg-vorpommern-kann-mehr-besser-nur-mit-uns/
- Die Linke MV - „Sozial. Gerecht. Antifaschistisch.“: https://wahlprogramm26.die-linke-mv.de/
- Bündnis 90/Die Grünen MV - „Klare Kante GRÜN - Für Mensch und Natur in MV“: https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-1/
- FDP MV - Programmseite mit Wahlprogramm 2026: https://www.fdp-mv.de/programm
- AfD MV - Regierungsprogramm über offizielle Kampagnen-/Landesverbandsseite: https://afd-mv.de/blaue-wende-2026/ und https://afd-mv.de/

Weitere amtlich zugelassene Parteien/Programme werden automatisiert ergänzt. Originalprogramme müssen durch CodeX als finale Dokumente gesichert, gehasht und versioniert werden.

---

# MV-IMPACT-2026-01 - Energiepfad: Erneuerbare, lokale Strompreise, Windstopp, Nord Stream, Kernenergie

## Programmatische Spannbreite

SPD will u. a. erneuerbare Energieproduktion stärker für günstige Energie im Land nutzen. Grüne wollen Wind/Solar beschleunigen, regionale Beteiligung stärken und Klimaanpassung ausbauen. CDU betont Technologieoffenheit und mehr Entscheidungsfreiheit bei Heizungen. AfD stellt Windkraftausbau, Nord Stream und Kernenergie in den Mittelpunkt eines Gegenpfads.

Quellen:
- SPD: https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031
- Grüne: https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-1/
- CDU: https://cdu-mv.de/2026/daniel-peters-neue-energie-fuer-mecklenburg-vorpommern/
- AfD: https://afd-mv.de/blaue-wende-2026/

## Kompetenz-Gate

Trennen:

- `LAND_FULL/LAND_PARTIAL_SHARED`: Landesplanung, Genehmigung, Flächen, Beteiligungs-/Fördermodelle, Landesunternehmen, Wärme-/Kommunalunterstützung im gesetzlichen Rahmen.
- `FEDERAL/EU`: wesentliche Teile des Energiewirtschaftsrechts, Strommarkt-/Netzentgeltlogik, Kernenergierecht, internationale Pipeline-/Sanktions-/Außenwirtschaftsfragen.
- `OTHER/INTERNATIONAL`: Betrieb und Nutzung internationaler Pipelineinfrastruktur hängt zusätzlich von Unternehmen, Partnerstaaten, EU-/Sanktions-/Genehmigungsregimen ab.

Eine Forderung „Nord Stream wieder öffnen“ ist kein unmittelbar durch die Landesregierung umsetzbares Landesinstrument.

## Wirkungskern

Die Wirkung ist nicht „pro/contra Energiewende“, sondern betrifft:
- Energiepreise und Preisverteilung;
- Versorgungssicherheit;
- Netzausbau und Flexibilität;
- Emissionspfad;
- Investitions-/Technologie-Lock-ins;
- regionale Wertschöpfung;
- Natur-/Flächenwirkungen;
- geopolitische Abhängigkeiten;
- langfristige Generationen-/Resilienzwirkung.

Ex ante müssen Infrastrukturlebensdauer und Pfadabhängigkeiten besonders gewichtet werden.

---

# MV-IMPACT-2026-02 - AfD-Forderung Landes-Grenz-/Rückführungspolizei und Migrationsvollzug

## Programmpolitischer Gegenstand

Das AfD-Regierungsprogramm 2026 kündigt u. a. eine eigene Grenz- und Rückführungspolizei bzw. eine stärkere Rückführungsinfrastruktur an.

Offizielle Programmbasis:
- https://afd-mv.de/blaue-wende-2026/

## Kompetenz-/Rechtsprüfung P0

`competence_scope = FEDERAL / LAND_PARTIAL_SHARED`

Wesentliche Einwanderungs-/Auswanderungs- und Aufenthaltsmaterien sind bundesrechtlich geprägt; Art. 73 GG weist dem Bund ausschließliche Zuständigkeiten in zentralen migrations-/grenzbezogenen Materien zu. Länder besitzen hingegen reale Vollzugs-, Ausländerbehörden-, Polizei-/Gefahrenabwehr-, Unterbringungs- und Rückführungsaufgaben im bundes-/europarechtlichen Rahmen.

Die konkrete Forderung „eigene Grenzpolizei“ darf daher nicht als frei verfügbare Landeskompetenz veröffentlicht werden.

`legal_feasibility_status = LIKELY_NOT_IMPLEMENTABLE_AS_STATED / REQUIRES_FEDERAL_FRAMEWORK`

bis eine konkrete gesetzliche Konstruktion eine abweichende tragfähige Einordnung erlaubt.

## Wirkungskern

Zu trennen:

- rechtmäßiger und schnellerer Vollzug;
- Verwaltungs-/Polizeikapazität;
- Grund-/Menschenrechte und Rechtsschutz;
- tatsächliche Rückführungszahlen und Vollzugshindernisse;
- Grenz-/Binnenraumkompetenz;
- fiskalische und personelle Kosten;
- Auswirkungen auf institutionelles Vertrauen und Rechtsstaatlichkeit.

Keine einfache Aussage „mehr Abschiebungen = positive/negative Wirkung“ ohne Rechts-, Empfänger-, Sicherheits- und Verteilungsprüfung.

---

# MV-IMPACT-2026-03 - Bildung/Kita: Betreuungsschlüssel, Investitionen, Unterrichtsversorgung

## Programmatische Beispiele

SPD garantiert beitragsfreie Kitas und kündigt schrittweise kleinere Gruppen/Betreuungsschlüssel sowie große Schul-/Berufsschulinvestitionen an. Grüne wollen Betreuungsschlüssel verbessern und Bildung nicht als Sparfeld behandeln. Linke setzt u. a. auf ein umfangreiches Bildungspaket. CDU priorisiert verlässlichen Unterricht/Unterrichtsqualität.

Quellen:
- SPD: https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031
- Grüne: https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-2/
- Linke: https://wahlprogramm26.die-linke-mv.de/
- CDU: https://cdu-mv.de/2026/daniel-peters-verlaesslicher-unterricht-hohe-unterrichtsqualitaet-und-gezielte-foerderung-wir-machen-bildung-wieder-zur-prioritaet/

## Kompetenz

`LAND_FULL/LAND_PARTIAL_SHARED/MUNICIPAL_DEPENDENCY`

Schule und Bildungsverwaltung sind starke Länderhebel; Kita-/Schulträger, Kommunalfinanzierung, Arbeitsmarkt/Fachkräfte und bundesfinanzierte Programme erzeugen Abhängigkeiten.

## Wirkungskern

Nicht Plätze/Stellen/Budget als Wirkung werten. Outcome-Indikatoren:
- reale Fachkraft-Kind-Relation;
- Unterrichtsausfall;
- Schulabschlüsse/Kompetenzentwicklung;
- soziale Bildungsunterschiede;
- Fachkräftebindung;
- psychische/soziale Belastung;
- Erreichbarkeit im ländlichen Raum;
- langfristiges Humankapital und Generationengerechtigkeit.

Risiko: ambitionierte Personalschlüssel ohne verfügbare Fachkräfte können zu Nichtumsetzung, Kosten-/Verdrängungseffekten oder Angebotsknappheit führen.

---

# MV-IMPACT-2026-04 - Investitionsprogramme, Infrastruktur und öffentliche Vermögensbildung

SPD nennt einen MV-Investitionsplan 2035 mit zusätzlichen Infrastrukturinvestitionen; andere Parteien setzen eigene Investitions-/Haushaltsprioritäten.

Quelle SPD:
- https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031

## Wirkungskern

Generationengerechtigkeit wird nicht als „mehr/weniger Schulden“ bewertet. Entscheidend:
- zusätzlicher öffentlicher Vermögenswert;
- Erhalt vs. Neubau;
- Nutzungsdauer;
- Klimarisiko/Anpassungsqualität;
- Betriebskosten;
- kommunale Verteilung;
- Additionalität;
- Engpässe bei Planung/Bau/Fachkräften.

Status: `PORTFOLIO_CASE / KEINE PAUSCHALE RICHTUNG`.

---

# MV-IMPACT-2026-05 - Tariftreue, Mindestlohn, öffentliche Vergabe

SPD will Tariftreue-/Vergaberegeln fortführen; andere Programme setzen teils stärker auf Deregulierung/Entlastung.

Quelle:
- https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031

## Kompetenz

`LAND_FULL/LAND_PARTIAL_SHARED/EU_DEPENDENCY`

Landesvergaberecht und eigene Beschaffung sind reale Hebel; Arbeits-/Mindestlohn- und EU-Vergaberecht setzen Grenzen.

## Wirkpfade

Positiv möglich:
- höhere Löhne/Arbeitsstandards;
- geringerer Lohndumping-Wettbewerb;
- Attraktivität von Beschäftigung.

Risiken:
- höhere Beschaffungskosten;
- geringere Bieterzahl;
- administrative Belastung;
- Verdrängung kleiner Anbieter.

Reality Check: Lohnentwicklung, Bieterzahl, Beschaffungskosten, KMU-Beteiligung, Vertragsqualität.

---

# MV-IMPACT-2026-06 - Sozialstaatliche Forderungen mit Bundeskompetenz: Kindergrundsicherung, Rente, Vermögensteuer

Mehrere Programme enthalten sozial-/steuerpolitische Forderungen, deren unmittelbarer Hebel nicht beim Land liegt. Beispielsweise fordert Die Linke u. a. eine Kindergrundsicherung bzw. bundespolitische Umverteilungsinstrumente; die SPD adressiert stabile Renten auf Bundesebene.

Quellen:
- Linke: https://wahlprogramm26.die-linke-mv.de/
- SPD: https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031

## Kompetenz-Gate

Je Forderung regelmäßig:
- `FEDERAL` oder `LAND_PARTIAL_SHARED`;
- möglicher Landeshebel: Bundesratsinitiative, eigene Familien-/Bildungs-/Wohn-/Sozialleistungen, Verwaltung/Vollzug.

Öffentlich muss sichtbar sein, ob eine Partei ein **Landesinstrument** oder eine **bundespolitische Forderung aus dem Landeswahlprogramm** beschreibt.

---

# MV-IMPACT-2026-07 - Demokratie, direkte Beteiligung und Verfassungs-/Institutionsfragen

Grüne wollen u. a. direkte Demokratie vereinfachen und Bürger-/Jugendbeteiligung stärken. SPD kündigt eine qualifizierte Volksbefragung an. Linke legt starken Fokus auf Antifaschismus und demokratische Sicherung. AfD fordert ebenfalls institutionelle Veränderungen, die einzeln auf Rechts-/Verfassungskompetenz zu prüfen sind.

Quellen:
- Grüne: https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-3/
- SPD: https://spd-mv.de/wahlen/landtagswahl-2026/regierungsprogramm-2026-2031
- Linke: https://wahlprogramm26.die-linke-mv.de/
- AfD: https://afd-mv.de/blaue-wende-2026/

## Wirkungskern

Mehr Beteiligung ist erst dann positive Wirkung, wenn Repräsentation, Responsivität, Transparenz und tatsächlicher Einfluss steigen. Institutionelle Reformen können zugleich Minderheiten-/Grundrechtsschutz, Entscheidungsfähigkeit oder Machtkontrolle verändern.

`BOUNDARY_REVIEW = WATCH`, insbesondere bei Änderungen an Verfassung, Medienordnung, Rechtsstaatlichkeit oder institutionellen Schutzmechanismen.

---

# MV-IMPACT-2026-08 - Klima-, Wasser-, Ostsee- und Naturresilienz

Grüne legen starke Schwerpunkte auf Feuchtgebiete, Schwammlandschaften, kommunale Klimaanpassung, Ostsee-/Nährstoffschutz und erneuerbare Energien. Andere Programme setzen unterschiedliche Prioritäten.

Quelle:
- https://gruene-mv.de/landtagswahl-2026/wahlprogramm-2026-1/

## Wirkungskern

Relevant sind reale Zustände:
- Wasserretention/Bodenfeuchte;
- Hitze-/Starkregenvulnerabilität;
- Ostsee-Nährstoffbelastung;
- Biodiversität;
- landwirtschaftliche Produktivität;
- Tourismus-/Fischerei-/Gesundheitsfolgen;
- Emissions- und Resilienzpfade.

Mit WÖk-Wirkungsobservatorium koppeln. Extremereignis = `EvidenceEvent`, nicht automatisch Regierungswirkung.

---

## 2. Offene Vollständigkeit

CodeX muss alle amtlich zugelassenen Wahlvorschläge mit finalen Programmen abgleichen und Originaldokumente sichern/hash/versionieren. Fehlende Programme transparent als `SOURCE_NOT_YET_AVAILABLE` bzw. `NO_PROGRAMME_FOUND` führen.

## 3. Publication Gate

Mecklenburg-Vorpommern kann als `PROGRAMME_ANALYSIS_IN_PROGRESS` öffentlich starten, sobald:
- finale Programme als Originalquellen gesichert sind;
- öffentliche Commitments Source-Locator besitzen;
- Kompetenz-/Höherrangiges-Recht-Gate je materialitätsstarkem Commitment geprüft oder offen markiert ist;
- keine Partei-Gesamtnote entsteht;
- Wirkungspotenzial und eingetretene Wirkung sprachlich getrennt bleiben;
- programmatische Bundes-/EU-Forderungen nicht als Landesumsetzung erscheinen.

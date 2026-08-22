## WÖk CDU Primary-Source-Parity + Editorial-v2+ — final official PDF pp. 29–32 vollständig semantisch reconciled

Fortsetzung der document-wide CDU-Primary-Source-Lane nach `ST_CDU_PRIMARY_PARITY_P25_P28 = PASS_SEGMENT`. Vor diesem Write wurden #234, #241 und PR #257 erneut gelesen. **Historische 344 Release-1-Units bleiben ausschließlich Working-/History-Baseline; kein finaler Nenner wird hier eingefroren.**

### Source / Scope

- finale parteioffizielle Primärquelle: `https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf` — Regierungsprogramm zur Landtagswahl 06.09.2026, beschlossen 13.06.2026
- hier vollständig visuell + textuell geprüft: **PDF S. 29–32**, Kapitel `Soziale Gerechtigkeit und Familie`
- historische Working-Baseline: `woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md`, Blob `6e8c53392d76e984630ea06ee00e1c01cf3fe46aa` **nicht verwenden** — korrekt bleibt der bereits dokumentierte CDU-Blob `6e8c53392d76e9847ee3028d241a988c12b3d2fb`
- relevante historische IDs: `0100–0116`; deren Source-Text/IDs werden **nicht** mutiert
- aktueller Rechts-/Additionality-Recheck: Bundesagentur für Arbeit, Grundsicherungsgeld seit **01.07.2026** inkl. Pflicht zur Annahme tatsächlich verfügbarer zumutbarer Arbeit und möglicher Leistungsminderung; GG Art. 105 Abs. 2a (Länder bestimmen bei der Grunderwerbsteuer den **Steuersatz**, nicht eigenständig neue bundesrechtliche Befreiungstatbestände); geltender §3 GrEStG; SGB VIII §§11/8a; SGB IX; Gewalthilfegesetz 2025, insb. §§1/8 und stufenweises Inkrafttreten bis 2032.

### 1. Primary-Source-Diff pp. 29–32

| Legacy | Parity | Behandlung |
|---|---|---|
| `0100` | `CONTEXT_ONLY` | Kapitel-/Werte-/Themenframe erhalten; kein eigener Effektmechanismus |
| `0101` | `CONTEXT_ONLY` | gesellschaftlicher Ziel-/Werteframe, kein eigenständiges Instrument |
| `0102` | `SAME` | Familien-/Berufsvereinbarkeit als bestehende Unit erhalten; vorheriger terminaler Fachstatus bleibt |
| `0103` | `CONTEXT_ONLY` | Zusammenhalts-/Kommunikationsframe; trailing `Wir werden` ist Abschnittsmarker, kein zusätzlicher Mechanismus |
| `null` | `ABSENT` | `ST-CDU-PRIMARY-GAP-P29-LAND-LABOUR-PROGRAM-PARTICIPATION` additiv |
| `null` | `ABSENT` | `ST-CDU-PRIMARY-GAP-P30-JOBCENTER-BINDING-WORK-OFFER` additiv |
| `0104` | `SAME` | eigenständiger Bundespfad Bürgerarbeit/gemeinnützige Arbeit; bestehender terminaler A07-Fachstatus bleibt |
| `0105` | `OVERMERGED` | Parent behalten; Kinderbetreuung und Kinderwunschförderung als getrennte Mechanismen; allgemeiner Familienframe/0102-Crosswalk nicht doppelt zählen |
| `0106` | `OVERMERGED` | Bundes-Steuerpfad und Landes-Unterstützungs-/Zugangspfad trennen |
| `0107` | `SAME` | Grunderwerbsteuerbefreiungsforderung bleibt eigene Unit; Kompetenz-Crosswalk korrigieren |
| `0108` | `TRUNCATED` | Parent endet in Release-1 nach `durch`; vollständige Primärpassage versioniert auflösen |
| `0109` | `SAME` | Kinderschutzzentren/-ambulanzen |
| `0110` | `OVERMERGED` | Kinder-/Jugendbeauftragter und spezialisierte Fachberatung trennen |
| `0111` | `OVERMERGED` | dauerhafte Jugendarbeitsförderung, Jugendbildungsstätten-Masterplan und Jugendpauschale trennen |
| `0112` | `OVERMERGED` | Begegnung/Einsamkeit, alternative Wohnformen, Seniorenmitwirkung, Altersdiskriminierung, digital+analog getrennt |
| `0113` | `OVERMERGED` | Barrierefreiheit, WfbM, Inklusionsbetriebe, Behindertenbeiräte, Gesundheitszugang, Eingliederungshilfe-Reform, kommunale Beauftragte getrennt; Sensibilisierung = Kontext |
| `0114` | `OVERMERGED` | STEM/Führung, Entgelt/Aufstieg, Sorgearbeit, Gewaltschutz, Schutz-/Beratungsinfrastruktur getrennt; Sprachregelungsposition = `CONTEXT_ONLY/COMMUNICATION` ohne behauptete Maßnahmenwirkung |
| `0115` | `OVERMERGED` | niedrigschwellige Hilfe, Armutsziel, Beratungslandschaft getrennt; Selbsthilfe-Partnerschaft als Delivery-Kontext |
| `0116` | `OVERMERGED` | Ausbildungsinfrastruktur, Weiterbildung, sozialer Arbeitsmarkt getrennt; Ansiedlungs-/Dual-Ausbildungsframe zu bestehenden Pfaden crosswalken, Nicht-Konkurrenz als Designbedingung |

Damit sind **alle effect-bearing Passagen der PDF-S. 29–32** entweder bestehender Unit eindeutig zugeordnet, als Kontext markiert oder in finale versionierte Mechanism-Children zerlegt. Keine Passage dieses Segments bleibt `ABSENT/TRUNCATED/OVERMERGED` ohne terminale Behandlung.

### 2. Neue / gesplittete canonical Mechanism-Units — 36/36 terminal

#### Bürgerarbeit / Arbeitsmarkt

1. `ST-CDU-PRIMARY-GAP-P29-LAND-LABOUR-PROGRAM-PARTICIPATION` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · LOW**. Teilnahme an Landesprogrammen nicht mehr generell freiwillig. **Problem Review:** Langzeitleistungsbezug/Übergangshemmnisse müssen nach fehlenden Stellen, Qualifikation, Gesundheit, Care, Mobilität und individuellem Verhalten getrennt werden. **Goal:** tragfähige Beschäftigungsübergänge, nicht Teilnahmequote. Aktivierung kann Struktur/Zugang schaffen; Zwang kann Fehladressierung, Abbruch, gesundheitliche Belastung und Verwaltungsaufwand erhöhen. **Delivery/Boundary:** Land/Jobcenter-/Kommunal-Kooperation innerhalb Bundesrechts; Zumutbarkeit, Existenzsicherung, Verhältnismäßigkeit, Rechtsschutz. **Recheck:** zusätzliche ungeförderte Jobs, Dauer/Qualität, Sanktionen/Abbruch, Fehlklassifikation, Kosten, Substitution.

2. `ST-CDU-PRIMARY-GAP-P30-JOBCENTER-BINDING-WORK-OFFER` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · LOW**. Kommunen + BA sollen Personen, die Beschäftigung verweigern, ein verbindliches Arbeitsangebot machen. **Current Additionality:** Seit 01.07.2026 verlangt das Grundsicherungsgeld bereits die Annahme einer tatsächlich verfügbaren zumutbaren Arbeit; bei willentlicher Ablehnung sind Leistungsminderungen möglich. Der zusätzliche Landespfad liegt daher nur in **zusätzlich geschaffenen/organisierten Beschäftigungsgelegenheiten und deren Qualität**, nicht in der bloßen Pflicht zur Annahme existierender zumutbarer Arbeit. Risiken: künstliche Beschäftigung, Verdrängung regulärer Stellen, Lock-in in Maßnahmen statt Übergang. Recheck wie oben plus Netto-Additionalität der Stellen.

#### Familie / Alleinerziehende

3. `ST-CDU-PRIMARY-SPLIT-0105-CHILDCARE-QUALITY-AFFORDABILITY` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Flächendeckende qualitativ gute und bezahlbare Kinderbetreuung kann Erwerbs-/Zeitoptionen, frühe Förderung und Teilhabe verbessern. **P/G:** Engpass ist nicht Platzanzahl allein, sondern Erreichbarkeit, Öffnungszeiten, Personal/Qualität und Kosten. Risiken: Personalverdichtung, regionale Unterversorgung, quantitative Expansion ohne Qualität. Recheck: reale Plätze/Öffnungszeiten/Ausfälle, Fachkraftquote, Kostenbelastung, Nutzung nach Einkommen/Region, Eltern-Erwerb, kindbezogene Qualitätsindikatoren.

4. `ST-CDU-PRIMARY-SPLIT-0105-FERTILITY-TREATMENT-SUPPORT` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Finanzielle Unterstützung kann Zugang zu medizinisch indizierter Kinderwunschbehandlung verbreitern. Ziel ist fairer Zugang, nicht eine politische Geburtenquote. Risiken: Förderkriterien, Eigenanteile, regionale Versorgung, Opportunitätskosten, medizinische/psychische Belastung. Recheck: Inanspruchnahme nach Einkommen/Region, Eigenanteile, Wartezeit, Abbruch; Behandlungserfolg nie als sicherer Politikeffekt ausgeben.

5. `ST-CDU-PRIMARY-SPLIT-0106-FEDERAL-SINGLE-PARENT-TAX-RELIEF` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · LOW**. Steuerentlastung kann verfügbare Einkommen erhöhen, erreicht aber Haushalte je nach Steuerpflicht/Einkommen unterschiedlich stark. **Competence:** Bundessteuerrecht/Advocacy. **Distribution:** geringe Einkommen, Teilzeit, Kinderzahl gesondert; nicht mit Landesberatung saldieren. Recheck Nettoentlastung nach Einkommensgruppen, Erwerbsanreize, Armutsrisiko, fiskalische Kosten.

6. `ST-CDU-PRIMARY-SPLIT-0106-STATE-SINGLE-PARENT-SUPPORT-ACCESS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Ausbau von Beratung, Unterstützung, Vernetzung und vereinfachtem Hilfenzugang kann Informations-, Zeit- und Koordinationshürden senken. **Goal:** reale Alltags-/Teilhabeentlastung und Erwerbszugang. Risiken: Angebotsdoppelung, Öffnungszeiten/Erreichbarkeit, Beratung ohne verfügbare Leistung/Betreuung. Recheck Nutzung, Wartezeit, First-time-right/Weitervermittlung, Betreuungs-/Erwerbszugang, regionale/soziale Reichweite.

#### Kinder / Jugend

7. `ST-CDU-PRIMARY-SPLIT-0108-YOUTH-PARTICIPATION-JUGENDHILFE` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Altersgerechte Beteiligungsformate + verlässliche Jugendhilfe können Selbstwirksamkeit, Bedarfspassung und Schutz/Teilhabe stärken. §11 SGB VIII verankert Mitbestimmung/Mitgestaltung als bestehende Baseline; Additionalität liegt in tatsächlicher Reichweite/Qualität. Risiken: Scheinbeteiligung, sozial selektive Beteiligung, fehlende Rückkopplung. Recheck Beteiligung nach Alter/Region/Behinderung, dokumentierte Response/Umsetzung, Zugänglichkeit, Jugendhilfe-Warte-/Versorgungsdaten.

8. `ST-CDU-PRIMARY-SPLIT-0108-SEXUAL-VIOLENCE-PROTECTION-GOAL` — **`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · NOT_ASSESSABLE**. Schutz vor Gewalt/sexualisierter Gewalt ist ein tragfähiger Schutz-/Zielraum, die isolierte Passage benennt aber keinen eigenen Mechanismus. Konkrete Children sind u.a. 0109/0110. Kein zusätzlicher Wirkungswert aus dem Zielsatz. Recheck erst an Prävention, Fachberatung, Kinderschutzstrukturen, Melde-/Interventionswegen und Outcomes.

9. `ST-CDU-PRIMARY-SPLIT-0110-CHILD-YOUTH-COMMISSIONER` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Ein gestärktes Amt kann Interessenvertretung, Beschwerde-/Monitoring- und Koordinationsfunktion verbessern, wenn Mandat, Unabhängigkeit, Ressourcen und Zugänge klar sind. Output Amt/Ressource ≠ Schutzoutcome. Recheck Fall-/Beteiligungszugang, Empfehlungen/Follow-up, Reaktionszeiten, Ressourcen, Kinder-/Jugendzugänglichkeit.

10. `ST-CDU-PRIMARY-SPLIT-0110-SPECIALIST-CHILD-PROTECTION-COUNSELLING` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Spezialisierte Fachberatung kann frühere Erkennung, fachgerechte Unterstützung und Schnittstellenqualität verbessern. SGB VIII §8a bleibt gesetzliche Schutzbaseline. Risiken: Personalengpass, regionale Lücken, Schnittstellen-/Datenschutzprobleme. Recheck Wartezeit, Fachkräfte, Fälle/Weiterleitung, Wiederholungs-/Gefährdungsverläufe, regionale Abdeckung.

11. `ST-CDU-PRIMARY-SPLIT-0111-YOUTH-WORK-STABLE-SUPPORT` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Verlässliche Finanzierung von Jugendverbänden/offener Jugendarbeit kann Angebotskontinuität, Selbstbestimmung und soziale Teilhabe stützen; §11 SGB VIII ist Baseline. Risiken: inputorientierte Förderung ohne Reichweite/Qualität, regionale Ungleichheit. Recheck Öffnungszeiten/Angebote, Teilnahme nach Gruppen/Region, Fachkräfte, Jugendfeedback, Kostenkontinuität.

12. `ST-CDU-PRIMARY-SPLIT-0111-YOUTH-EDUCATION-SITES-MASTERPLAN` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · LOW**. Ein Masterplan kann Bedarf, Sanierung, Erreichbarkeit und Investitionen koordinieren; Planerstellung allein ist kein Outcome. Risiken: Fehldimensionierung, Infrastruktur-Lock-in, regionale Fehlverteilung. Recheck Auslastung/Erreichbarkeit, Gebäudezustand, Investitionspriorisierung, Energie-/Klimarisiken, tatsächliche Nutzung.

13. `ST-CDU-PRIMARY-SPLIT-0111-YOUTH-ALLOWANCE` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Weiterentwicklung der Jugendpauschale kann kommunale/Träger-Angebotsfähigkeit stabilisieren, sofern Mittel bedarfs- und zugangsorientiert ankommen. Risiken: pauschale Verteilung ohne Bedarf/Outcome, Mitnahme, Haushaltsvolatilität. Recheck Mittel pro Zielgruppe/Region, Additionalität, Angebotsstunden/Reichweite, Qualität.

#### Ältere Menschen

14. `ST-CDU-PRIMARY-SPLIT-0112-MEETING-PLACES-ANTI-LONELINESS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Mehrgenerationenhäuser/Seniorentreffs können soziale Kontakte und Zugang zu Unterstützung stärken; Einsamkeit ist aber nicht allein ein Infrastrukturproblem. Recheck Erreichbarkeit, Nutzung auch schwer erreichbarer Gruppen, soziale Kontakte/Wohlbefinden, Mobilität, Kosten.

15. `ST-CDU-PRIMARY-SPLIT-0112-ALTERNATIVE-SENIOR-HOUSING` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · LOW**. Alternative Wohnformen können Selbstständigkeit, soziale Einbindung und passende Unterstützung verbessern; Wirkung hängt an Bezahlbarkeit, Barrierefreiheit, Pflege-/Mobilitätsanbindung und freiwilliger Wahl. Risiken: Angebotssegregation, Kosten/Flächen, Fehlbedarf. Recheck Nachfrage, Kosten, Barrierefreiheit, Verbleib/Umzüge, Versorgungszugang.

16. `ST-CDU-PRIMARY-SPLIT-0112-SENIOR-PARTICIPATION-INTERGENERATIONAL` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Seniorenmitwirkung und generationenverbindende Projekte können Repräsentation/soziale Einbindung erhöhen, wenn Beteiligung reale Rückkopplung hat. Recheck Repräsentativität, Zugänglichkeit, Follow-up politischer/kommunaler Entscheidungen, Reichweite.

17. `ST-CDU-PRIMARY-SPLIT-0112-AGE-DISCRIMINATION-PREVENTION` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Aufklärung, altersfreundliche Arbeitsmodelle und wirksame Antidiskriminierungsregeln können Zugangs-/Benachteiligungsrisiken senken. Bundes-AGG ist bestehende Rechtsbaseline; Landeseffekt liegt in eigenen Arbeitgeber-/Förder-/Informations-/Vollzugspfaden. Recheck Beschwerden/Fälle, Beschäftigungs-/Weiterbildungszugang nach Alter, Rechtsdurchsetzung, Arbeitgeberpraxis.

18. `ST-CDU-PRIMARY-SPLIT-0112-DIGITAL-AND-ANALOG-ACCESS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Altersgerechte digitale Angebote plus **beibehaltene analoge Kontaktwege** reduzieren Exklusionsrisiken bei Digitalisierung. Schutzbedingung: kein Digital-only-Zwang bei wesentlicher Daseinsvorsorge. Recheck Abschluss-/Abbruchraten nach Alter, Barrierefreiheit, Supportbedarf, Wartezeit digital/analog, regionale Erreichbarkeit.

#### Menschen mit Behinderung

19. `ST-CDU-PRIMARY-SPLIT-0113-ACCESSIBILITY` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Bauliche, sprachliche und digitale Barrierefreiheit kann selbstbestimmte Teilhabe unmittelbar erhöhen. **Problem/Goal:** reale Barrieren/Assistenzbedarfe statt abstrakter Inklusionsquote. Delivery über Land/Kommunen/Leistungsträger je Objekt. Recheck Accessibility-Audits, Nutzbarkeit/Abbrüche, Beschwerden, Erreichbarkeit, Beteiligung Betroffener.

20. `ST-CDU-PRIMARY-SPLIT-0113-WFBM-STRENGTHEN` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · MEDIUM**. Werkstätten können Beschäftigung, Förderung und Schutz bieten; ein pauschales „Stärken“ kann aber Übergänge auf den allgemeinen Arbeitsmarkt und Wahlfreiheit verfestigen, wenn Erfolg an Plätzen statt individueller Teilhabe gemessen wird. SGB IX verpflichtet Werkstätten auch zur Förderung geeigneter Übergänge. Recheck Wahlmöglichkeiten, Entgelt, Qualifizierung, Übergänge, Rückkehrrecht, Zufriedenheit/Teilhabe.

21. `ST-CDU-PRIMARY-SPLIT-0113-INCLUSION-ENTERPRISES` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Inklusionsbetriebe sind nach SGB IX Unternehmen des allgemeinen Arbeitsmarkts für Menschen mit besonderen Beschäftigungshürden; Förderung kann inklusive Erwerbsarbeit und Einkommen stärken. Risiken: begrenzte Skalierung, Mitnahme, Segmentierung. Recheck stabile Beschäftigung, Lohn/Arbeitsbedingungen, Übergänge, Additionalität, Branchen/Regionen.

22. `ST-CDU-PRIMARY-SPLIT-0113-MUNICIPAL-DISABILITY-COUNCILS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Behindertenbeiräte können Betroffenenwissen früher in kommunale Entscheidungen bringen; Wirkung hängt an Zugangsrechten, Repräsentativität und tatsächlicher Berücksichtigung. Recheck Abdeckung, Beteiligungszeitpunkt, Empfehlungen/Übernahme, barrierefreie Teilnahme.

23. `ST-CDU-PRIMARY-SPLIT-0113-DISABILITY-HEALTHCARE-REVIEW` — **`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · NOT_ASSESSABLE**. `gesundheitliche Versorgung ... in den Blick nehmen` benennt Problem-/Prüfauftrag, kein Instrument. Erst konkrete Barriere-, Vergütungs-, Versorgungs- oder Qualifikationsmaßnahme bewertbar. Recheck Zugangs-/Wartezeiten, barrierefreie Praxen, Kommunikation/Assistenz, Outcomes.

24. `ST-CDU-PRIMARY-SPLIT-0113-EINGLIEDERUNGSHILFE-REFORM` — **`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · NOT_ASSESSABLE**. `Strukturen ... überarbeiten` lässt Richtung, Zuständigkeit, Leistungs-/Verfahrensdesign offen. Tragfähiges Ziel ist personenzentrierte wirksame Teilhabe bei geringer Verfahrenslast; kein Urteil ohne konkretes Delta. Recheck erst mit Reformoption: Leistungszugang, Bearbeitungszeit, Wahl-/Teilhabeoutcomes, Kosten/Personal.

25. `ST-CDU-PRIMARY-SPLIT-0113-MUNICIPAL-DISABILITY-OFFICERS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Stellen bei Kreisen/kreisfreien Städten können Interessenvertretung, Barrierehinweise und Koordination stärken. Risiken: symbolische Stellen ohne Mandat/Ressourcen. Recheck Besetzung, Kompetenzen, Eingaben/Follow-up, Beteiligung, regionale Abdeckung.

#### Chancengleichheit / Gewaltschutz

26. `ST-CDU-PRIMARY-SPLIT-0114-WOMEN-STEM-LEADERSHIP-ROLE-MODELS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Gezielte Förderung, Mentoring/Role-Model-Visibility kann Informations-, Netzwerk- und Zugangsbarrieren in STEM/Führung senken; Wirkung hängt an konkretem Instrument und Ausgangslücke. Risiken: Symbolik ohne strukturellen Zugang, selektive Reichweite. Recheck Bewerbungen/Einstellungen/Beförderungen/Verbleib nach Geschlecht und Fach, Teilnahme, Pay/Role-Level.

27. `ST-CDU-PRIMARY-SPLIT-0114-EQUAL-PAY-ADVANCEMENT` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Gleiche Bezahlung und faire Aufstiegschancen sind problemadäquate Zielräume; Land kann insbesondere als Arbeitgeber, Förderer/Beschaffer und über Beratung/Monitoring wirken, bundes-/EU-arbeitsrechtliche Pfade bleiben getrennt. Recheck bereinigte/unbereinigte Entgeltlücken, Beförderungen, Arbeitszeit/Branche, Beschwerden/Durchsetzung; Zielwort ≠ Outcome.

28. `ST-CDU-PRIMARY-SPLIT-0114-CARE-WORK-MEN` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Unterstützung von Männern bei Erziehungs-/Pflegeverantwortung kann Sorgearbeit breiter verteilen und Erwerbs-/Zeitoptionen von Partnerinnen verbessern. Wirkung hängt an Zeitrechten, Arbeitgeberpraxis, Betreuung/Pflegeangebot und finanziellen Anreizen. Recheck Care-Zeit, Erwerbs-/Teilzeitmuster, Nutzung von Freistellungen/Angeboten, Einkommenswirkung.

29. `ST-CDU-PRIMARY-SPLIT-0114-VIOLENCE-PREVENTION-ISTANBUL` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Prävention, Schutz und Beratung gegen Gewalt an Frauen haben klaren Schutzmechanismus. **Current baseline:** Gewalthilfegesetz ist seit 28.02.2025 in Kraft; es verlangt u.a. bedarfsgerechte Schutz-/Beratungsinfrastruktur und Länder-Bedarfs-/Entwicklungsplanung, zentrale Anspruchsteile greifen ab 2032. Additionalität ist deshalb an Ausbau/Qualität/Erreichbarkeit gegenüber dieser Baseline zu messen. Recheck Gewalt-/Wiederholungsrisiko, Zugangs-/Abweisungsdaten, Beratungswartezeit, regionale Barrierefreiheit, Präventionsreichweite.

30. `ST-CDU-PRIMARY-SPLIT-0114-WOMENS-SHELTERS-STATE-WOMENS-COUNCIL` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · MEDIUM**. Weiterentwicklung der Förderung kann Kapazität, Verlässlichkeit und Beratung stabilisieren, sofern bedarfs-/zugangsorientiert. GewHG §8 verlangt Länderanalyse zu Bestand, Bedarf, Geografie und Finanzierung — diese Baseline muss das Förderdesign steuern. Recheck Plätze/Abweisungen, Erreichbarkeit, Barrierefreiheit/Sprachzugang, Finanzierungssicherheit, Übergänge/Schutzoutcomes.

`0114`-Passage gegen ein Genderverständnis über Sprachregelungen: **`CONTEXT_ONLY / COMMUNICATION_MEDIA_IMPACT = AMBIVALENT_POTENTIAL`**, kein eigenständiger effect-bearing Policy-Mechanismus in dieser Passage. Keine Maßnahmenrichtung aus der Position ableiten; erst konkrete Sprach-/Verwaltungsregel wäre eine eigene Unit.

#### Sozialpolitik / Arbeit / Ausbildung

31. `ST-CDU-PRIMARY-SPLIT-0115-LOW-BUREAUCRACY-BENEFIT-ACCESS` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Unkomplizierter, verständlicher Hilfenzugang kann Nichtinanspruchnahme, Fehler-/Zeitkosten und Belastung reduzieren, wenn Leistungsansprüche unverändert korrekt geprüft werden. Risiken: Vereinfachung ohne Schutz-/Missbrauchs-/Fehlerkontrolle, Digitalexklusion. Recheck Antrag→Leistung, Bearbeitungszeit, Fehler/Widerspruch, Nichtinanspruchnahme, Nutzergruppen, analog/digital.

32. `ST-CDU-PRIMARY-SPLIT-0115-CHILD-OLD-AGE-POVERTY-GOAL` — **`REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · NOT_ASSESSABLE**. Kinder-/Altersarmut aktiv bekämpfen ist ein materieller Zielraum, aber die Passage benennt hierfür keinen isolierten Wirkhebel. Armutsdefinition, Ursachen und Instrumente müssen getrennt werden; keine Richtung aus Zielworten.

33. `ST-CDU-PRIMARY-SPLIT-0115-COUNSELLING-LANDSCAPE` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Qualifizierung und bedarfsgerechte Ausrichtung einer Beratungslandschaft kann Zugang und Falllösung verbessern; Beratung ersetzt fehlende materielle Leistungen nicht. Selbsthilfeorganisationen/-gruppen sind Delivery-/Betroffenenwissen, kein separat gezählter Wirkhebel. Recheck Erreichbarkeit/Wartezeit, Weitervermittlung/Falllösung, Nutzerfeedback, regionale/soziale Abdeckung, Kosten.

34. `ST-CDU-PRIMARY-SPLIT-0116-VOCATIONAL-CENTRES-SCHOOLS-FUNDING` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Gezielte Förderung von Ausbildungszentren und berufsbildenden Schulen kann Kapazität/Qualität stabilisieren, wenn sie reale Engpässe trifft. Risiken: Fehldimensionierung bei Demografie/Fachverschiebung, Gebäude-/Ausstattungs-Lock-in, reine Inputmessung. Recheck Auslastung, Ausstattungs-/Personalengpass, Abschlüsse/Übergänge, Wege, Lifecycle-Kosten.

35. `ST-CDU-PRIMARY-SPLIT-0116-CONTINUING-EDUCATION` — **`EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · LOW**. Berufliche Weiterbildung kann Anpassungs-/Beschäftigungsfähigkeit erhöhen, wenn sie arbeitsmarkt-/personengerecht ist. Risiken: Teilnahme statt Kompetenz/Joboutcome, Mitnahme, Zugangsungleichheit. Recheck Teilnahme nach Gruppen, Abschluss/Kompetenz, Beschäftigung/Lohn/Verbleib, Arbeitgebernachfrage, Kosten.

36. `ST-CDU-PRIMARY-SPLIT-0116-SOCIAL-LABOUR-MARKET` — **`EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · MEDIUM**. Geförderte Beschäftigung kann Teilhabe, Tagesstruktur, Einkommen und Übergangschancen für arbeitsmarktferne Menschen erhöhen. Risiken: Lock-in, Creaming/Parking, Verdrängung regulärer Beschäftigung und Dauersubvention ohne Übergang. Die Passage nennt selbst Nicht-Konkurrenz zu bestehenden Unternehmen als Schutzbedingung. Recheck Additionalität, Übergänge in ungeförderte Arbeit, Jobqualität/Lohn, Dauer, Substitution, Zielgruppenverteilung.

### 3. Batchweite #241-Systemprüfung pp. 29–32

- `PROBLEM_REVIEW`: Erwerbs-/Integrationshemmnisse, Vereinbarkeit, Armut, Jugend-/Kinderschutz, Einsamkeit/Altersdiskriminierung, Teilhabebarrieren, Geschlechterungleichheit/Gewalt und Qualifizierungsengpässe getrennt. Reziprozitäts-, Familien-, Zusammenhalts- oder Gleichheitsframes sind **keine empirischen Problembefunde**.
- `GOAL_REVIEW`: nachhaltige Erwerbsteilhabe; familien-/kindgerechte Wahlmöglichkeiten; Schutz/Partizipation; selbstbestimmte Teilhabe; Gewaltfreiheit; Gleichstellung; zugängliche soziale Dienste. `Bürgerarbeit`, Steuerbefreiung, Beratungsstelle, Beirat, Werkstatt oder Masterplan sind Instrument-/Zwischenachsen, keine Endziele.
- `DNS_REFERENCE = EXACT_REGISTRY_CROSSWALK_PENDING`; keine Keyword-Zuordnung, kein Alignment als Kausalitätsbeweis.
- `MATERIAL_OMISSIONS`: tatsächliche Ursachen von Nichtbeschäftigung; vorhandenes zumutbares Jobangebot; Betreuungs-/Jugendhilfe-/Beratungs-/Schutzkapazitäten; Regionalität/Barrierefreiheit; Einkommen/Steuerinzidenz; Teilhabe-/Übergänge WfbM→allgemeiner Arbeitsmarkt; Gewalt-/Schutzbedarfe; Fachkräfte-/Finanzierung; Demografie.
- `POLICY_COHERENCE`: Grundsicherungsgeld/SGB-II-Bundespfad vs Landprogramme; Familien-/Kita-/Jugendhilfe; GrEStG; SGB VIII; SGB IX; GewHG/Istanbul-Konvention; Landes-/Kommunalzuständigkeiten. Advocacy/Plan/Förderung nie als bereits eingetretene Wirkung.
- `DELIVERY_FEASIBILITY`: Jobcenter/BA/Kommunen, Kita-/Jugendhilfe-/Beratungspersonal, kommunale Beteiligungs-/Beauftragtenstrukturen, Eingliederungshilfe, Gewaltschutzkapazität, Bildungs-/Weiterbildungsanbieter und Haushaltsmittel.
- `RESOURCE_FINANCING`: Steuerentlastung, Kinderwunsch/Kita/Jugend-/Sozial-/Gewaltschutzförderung, Ausbildungsinfrastruktur jeweils mit Additionalität, OPEX, Verteilung und Opportunitätskosten; Mittelabfluss ≠ Outcome.
- `SPATIAL_DISTRIBUTION`: ländlich/städtisch; Alleinerziehende; Einkommen/Steuerpflicht; Kinder/Jugendliche; ältere Menschen; Menschen mit Behinderungen; Frauen; Care-Verantwortliche; arbeitsmarktferne Menschen. Nicht nur Durchschnittswerte.
- `INTERNATIONAL_LEAKAGE`: überwiegend `NOT_APPLICABLE`; bei Arbeits-/Produktionsverdrängung als interregionale Substitution prüfen, nicht pauschal internationalisieren.
- `ROBUSTNESS_STRESS_TEST`: Jobmangel/Konjunktur; Fachkräfteengpass; Haushaltskürzung; demografische Verschiebung; digitale Ausfälle; geringe Angebotsaufnahme; hohe regionale Streuung; Schutzkapazitätsengpass.
- `REVERSIBILITY_LOCKIN`: dauerhafte Infrastruktur/Steuer-/Leistungs-/Sanktionsdesigns und institutionelle Sonderstrukturen stärker pfadbindend; Beratung/Piloten/temporäre Förderung leichter adaptierbar.
- `FALSIFICATION_TRIGGERS`: ungeförderte Beschäftigungsübergänge/Jobqualität/Sanktionen/Substitution; Kita-/Jugend-/Beratungsreichweite/Qualität; Steuer-/Armutsinzidenz; Beteiligungs- und Beschwerde-Follow-up; Barrierefreiheit/Teilhabe/Arbeitsmarktübergänge; Gewaltschutz-Zugang/Abweisungen; Weiterbildung→Kompetenz/Job.
- `LIFECYCLE_TRACEABILITY`: Wahlprogramm → Mandat → Landesprogramm/-haushalt/-recht bzw. Bundesinitiative → konkrete Implementierung → Nutzung/Capability → Outcome → Reality Check. Aktuelles Bundesrecht als inherited baseline, nicht als künftige Landesleistung.
- `VERSION_DELTA`: `0100/0101/0103` Kontext statt Sammelwirkung; `0105/0106/0108/0110–0116` versionierte Splits; `0107` Kompetenzcrosswalk Bund/Land; historische IDs/Text immutable.
- `COMMUNICATION_MEDIA_IMPACT`: material und getrennt bei Bürgerarbeits-Reziprozitätsframe sowie Gender-/Sprachposition; keine Kommunikationswirkung mit Maßnahmenwirkung saldieren.
- `RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL`; keine WÖk-Option ohne exact APPROVED RecommendationRecord.
- `STATE_GFA_ENAP_BENCHMARK = NOT_APPLICABLE` für Wahlprogramm-Source-Units.
- `COVERAGE_SCOPE = ST_CDU_PRIMARY_SOURCE_P29_P32_FULL_SEMANTIC_RECONCILIATION`.

### 4. Amtliche aktuelle Recheck-Quellen

- Bundesagentur für Arbeit — Grundsicherungsgeld seit 01.07.2026 / Arbeitspflichten: `https://www.arbeitsagentur.de/grundsicherung-loest-buergergeld-ab` und `https://www.arbeitsagentur.de/grundsicherung/pflichten-verstehen-und-beachten/rechte-pflichten-minderungen`
- GG Art. 105: `https://www.gesetze-im-internet.de/gg/art_105.html`
- GrEStG §3: `https://www.gesetze-im-internet.de/grestg_1983/__3.html`
- SGB VIII §11 Jugendarbeit: `https://www.gesetze-im-internet.de/sgb_8/__11.html`
- SGB VIII §8a Schutzauftrag: `https://www.gesetze-im-internet.de/sgb_8/__8a.html`
- SGB IX, u.a. Werkstätten/Inklusionsbetriebe: `https://www.gesetze-im-internet.de/sgb_9_2018/`
- Gewalthilfegesetz: `https://www.gesetze-im-internet.de/gewhg/` ; §8 Länder-Bedarfs-/Entwicklungsplanung: `https://www.gesetze-im-internet.de/gewhg/__8.html`

### 5. Checkpoint

`ST_CDU_PRIMARY_PARITY_P29_P32 = PASS_SEGMENT`

`ST_CDU_P29_P32_NEW_OR_SPLIT_TERMINAL = PASS_36`

`ST_CDU_P29_P32_UNRESOLVED_SOURCE_GAPS = 0`

`ST_CDU_PRIMARY_SOURCE_PARITY = NOT_YET_FULL_PROGRAMME`

`authoritative_source_unit_count = null`

`authoritative_effect_mechanism_count = null`

`denominator_status = NOT_FROZEN_PENDING_FULL_PRIMARY_SOURCE_PARITY`

**Keine** Hochrechnung `344 + shards`, keine öffentliche Count-Mutation, kein `ST_CDU_*_FACH_COMPLETE`. Die 36 sind versionierte Mechanism-Children/Additions dieses Segments und erst die vollständige Full-Programme-Segmentierungsregel entscheidet deren finalen Nennerbeitrag.

**Nächster source-bound Parity-Shard: finale offizielle PDF S. 33–36 (`Medien mit Vertrauen`)**, mit expliziter Trennung von institutioneller Rundfunk-/Medienpolitik, Jugendmedienschutz/Plattformpflichten, Pressefreiheit, Medienkompetenz, KI/Urheberrecht und bloßen politischen Frames.

## WÖk CDU Primary-Source-Parity/Fachreview — final PDF pp.25–28 (Gesundheit & Pflege)

Fortsetzung der document-wide CDU-Primary-Source-Parity nach pp.23–24. Maßstab bleibt **die finale parteioffizielle PDF**, nicht das historische 344er Release-1-Register. Historische IDs/Text bleiben unverändert; `authoritative_source_unit_count` und `authoritative_effect_mechanism_count` bleiben bis zum vollständigen 91-Seiten-Diff `null`.

**Primärquelle:** https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf — final beschlossen 13.06.2026, hier gedruckte PDF-S. 25–28.

**Working baseline:** `woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-cdu-zusagen.md`, hier `0081–0099`.

**Aktuelle amtliche Additionality-/Delivery-Baselines (nur zur Einordnung, nicht als Partei-Quelle):**
- Landarzt-/Amtsarzt-/Landzahnarztquoten bestehen bereits; 2026 laufen Auswahlverfahren weiter: https://ms.sachsen-anhalt.de/themen/gesundheit/gesundheitswesen/medizinische-versorgung/landarztquote-und-amtsarztquote-sachsen-anhalt
- Der Landtag hat 2026 Telenotarzt und Gemeindenotfallsanitäter gesetzlich im Rettungsdienst verankert; die Programmforderung ist daher heute teilweise `INHERITED_CURRENT_BASELINE`, nicht automatisch neuer Output: https://www.landtag.sachsen-anhalt.de/51-sitzungsperiode
- Das Landes-Krankenhausgesetz wurde am 24.06.2026 für leistungsgruppen-/qualitätsorientierte Krankenhausplanung fortentwickelt; dies ist spätere/current evidence, keine rückwirkende Programmevidenz: https://ms.sachsen-anhalt.de/aktuelles/news-detail/landtag-beschliesst-neues-krankenhausgesetz

### 1. Semantic primary-source diff pp.25–28

| Legacy / Primary | Parity | Versioned treatment |
|---|---|---|
| `0081` „Gesundheit und Pflege neu denken“ | `CONTEXT_ONLY` | Ziel-/Übergangsframe, kein eigenständiger Wirkmechanismus |
| `0082` „Darauf bauen wir auf …“ | `CONTEXT_ONLY` | Rückblick/Transition; historische Outputs nicht als neue Wirkung zählen |
| `0083` „Vorreiter … Gesundheits- und Pflegeversorgung“ | `CONTEXT_ONLY` | Zielzustand, kein Instrument |
| `0084` wohnortnah/digital/vernetzt + attraktive Arbeitsbedingungen | `PARTIAL_PARENT` | Summary-Ziel; konkrete Hebel folgen in `0088+`, keine Doppelzählung |
| `0085` Krankenhausprofile/ambulante Kooperation | `PARTIAL_PARENT` | Summary-Ziel; konkrete Mechanismen in `0090/0091` |
| `0086` bezahlbare Pflege/Angehörigenentlastung | `PARTIAL_PARENT` | Summary-Ziel; konkrete Mechanismen in `0095/0096` |
| `0087` Prävention … „Wir werden“ | `TRUNCATED` + `PARTIAL_PARENT` | Goal-Parent erhalten; konkreter finaler Bullet „Prävention als Lebensprinzip“ fehlt als eigener Release-1-Mechanismus |
| `0088` Versorgung/Fachkräfte/Studienplätze/Standort/Apotheke | `OVERMERGED` | in getrennte Effect-Mechanisms splitten |
| `0089` Niederlassung | `OVERMERGED` | Förderung, Administrative Relief, Mentoring/Qualifizierung, Kooperations-/Teilzeitmodelle trennen |
| `0090` Krankenhausknoten | `TRUNCATED` + `OVERMERGED` | finalen Trägervielfaltssatz restaurieren; Profile/Spezialisierung, Grund-/Notfallnähe, sektorale Verzahnung, Trägerpluralität trennen |
| `0091` Sektorengrenzen | `OVERMERGED` | Zentren, Planung, Länderkooperation, Leistungsbündelung, Primärversorgung getrennt |
| `0092` Versorgungszentren | `OVERMERGED` | MVZ/Campus, Trägermodelle, Landarztquote, regionales Zulassungskriterium getrennt |
| `0093` Rettung/Notfall | `OVERMERGED` | Masterplan, Telenotarzt, Gemeindenotfallsanitäter, Leitstellen, digitale Systeme, Drohnen, Mobilität, Erste Hilfe getrennt |
| Primary p.27 „Prävention als Lebensprinzip“ | `ABSENT` | additive versionierte Source-Unit(s); nicht aus `0087`-Template ableiten |
| `0094` Pflege neu aufstellen | `OVERMERGED` | Versorgungsmix/Wohnformen und erweiterte Pflegekompetenzen getrennt |
| `0095` Angehörige/Pflegeversicherung | `TRUNCATED` + `OVERMERGED` | Landes-/Versorgungsentlastung und Bundes-Pflegeversicherungsreform trennen |
| `0096` §43c SGB XI | `SAME` | Federal-advocacy unit erhalten; Wirkung nur nach konkretem Rechtsdesign |
| Primary p.28 4+1 / freiwillige Pflegeeinrichtungs-Kooperation | `ABSENT` | additive versionierte Unit; fachlicher Child-/Crosswalk zum allgemeinen 4+1-Praxislernmechanismus, keine Doppelzählung desselben Outputs |
| `0097` Medi-Bus | `OVERMERGED` | Hausarzt-Rollpraxis und spätere fachärztliche Pilot-Ausweitung trennen |
| `0098` Digitalisierung | `OVERMERGED` | Telemedizin, digitale Pflegeanwendungen, Dokumentation, Infrastruktur/Data-Governance trennen |
| `0099` Forschung/Innovation/Produktion | `OVERMERGED` | Uniklinik-Netzwerk, digitale Modellregion, Arznei-/Medizinproduktproduktion trennen |
| Primary p.28 „Versorgung vorwärts denken“ | `CONTEXT_ONLY` | Abschluss-/Zielrahmen, keine zusätzliche Effect-Unit |

### 2. Neue/splittende canonical Fachunits — terminal source-bound

Die folgenden IDs sind additive Versionierungs-IDs für das Manifest; alle `counts_toward_authoritative_denominator = PENDING_FINAL_SEGMENTATION_RULE`.

#### `0088` Versorgung/Fachkräfte
1. `ST-CDU-PRIMARY-SPLIT-0088-STUDY-PLACES` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Zusätzliche Human-/Zahnmedizin-/Pharmazieplätze können den langfristigen Fachkräftepool erhöhen; Engpass sind Lehr-/Klinikkapazität, Abschluss und spätere Bindung, nicht Studienplatzzahl allein. **Problem/Goal:** regionale Fachkräftelücke plausibel / Versorgungskapazität. **Delivery:** Land/Hochschulen, langer Lead time. **Recheck:** zusätzliche Plätze, Besetzung, Abschluss, Berufseintritt/Region, Lehrkapazität, Kosten. **Boundary:** Ausbildungsqualität, fairer Zugang.
2. `ST-CDU-PRIMARY-SPLIT-0088-RURAL-WORK-ATTRACTIVENESS` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. „Attraktiver Lebens- und Arbeitsort“ bündelt Wohn-/Familien-/Arbeitsbedingungen ohne konkretes Instrument. **Goal:** Fachkräftebindung. **Recheck:** exact Maßnahmen, Fluktuation/Verbleib, regionale Vakanz, Arbeitsbelastung.
3. `ST-CDU-PRIMARY-SPLIT-0088-LOCAL-PHARMACY-FEDERAL` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. „Apotheke vor Ort stärken“ + „gute Rahmenbedingungen“ nennt keinen Preis-, Vergütungs-, Niederlassungs- oder Versorgungshebel; wesentliche Regelung Bundesebene. **Goal:** Arzneimittelzugang. **Recheck:** exact Bundesinitiative, Erreichbarkeit/Notdienst, Schließungen, Versorgungslücken.

#### `0089` Niederlassung
4. `ST-CDU-PRIMARY-SPLIT-0089-PRACTICE-GRANTS` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Bedarfsgebundene Gründungs-/Übernahmeförderung kann Kapitalbarrieren senken; ohne Additionality drohen Mitnahme/Standortverlagerung. **Delivery:** Förderdesign, KV-/Regionenbezug. **Recheck:** zusätzliche Niederlassungen/Übernahmen, Verbleib, Versorgung, Mitnahme, Kosten.
5. `ST-CDU-PRIMARY-SPLIT-0089-ADMIN-RELIEF` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. „Bürokratische Hürden abbauen“ ist ohne benannte Pflichten/Schutzfunktion kein bewertbares Instrument. **Goal:** weniger vermeidbare Praxisfriktion bei erhaltener Patientensicherheit/Datenqualität. **Recheck:** konkrete Pflichten, Zeitkosten, Fehler-/Schutzwirkung.
6. `ST-CDU-PRIMARY-SPLIT-0089-NETWORK-MENTORING-BIZ` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Mentoring/Netzwerke/betriebswirtschaftliche Qualifizierung können Informations- und Gründungshürden reduzieren; Teilnahme ist Output. **Recheck:** Gründungs-/Übernahmequote, Verbleib, regionale Wirkung, Teilnahme-/Selektionsbias.
7. `ST-CDU-PRIMARY-SPLIT-0089-COOP-PARTTIME` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Kooperative Praxis- und Teilzeitmodelle können Einstieg, Vereinbarkeit und Standortstabilität verbessern; Wirkung hängt an Vergütung, Zulassungs-/Teamdesign und realer Versorgungskapazität. **Distribution:** junge Ärzt:innen, Familien, ländliche Patienten. **Recheck:** FTE-Versorgung, Öffnungszeiten, Verbleib, Wartezeit.

#### `0090` Krankenhausknoten
8. `ST-CDU-PRIMARY-SPLIT-0090-REGIONAL-PROFILES` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`. Spezialisierung/Profilierung kann Qualität und Ressourcennutzung erhöhen, kann aber Wege/Resilienz verschlechtern, wenn regionale Grundversorgung falsch dimensioniert wird. **Current baseline:** Leistungsgruppen-/Planungsreform 2026 separat versionieren. **Recheck:** Qualität/Fallzahlen, Wegezeiten, Auslastung, Personal, Notfallabdeckung.
9. `ST-CDU-PRIMARY-SPLIT-0090-BASIC-EMERGENCY-NEARBY` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Wohnortnahe Grund-/Notfallversorgung reduziert Zugangs-/Zeitrisiken, ist aber Ziel/Planungsanforderung ohne Standort-/Leistungsdesign. **Recheck:** Hilfs-/Fahrzeiten, Abdeckung, Qualität, Personal, Ausfallresilienz.
10. `ST-CDU-PRIMARY-SPLIT-0090-AMBULATORY-STATIONARY` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Verzahnung kann Doppeluntersuchungen, Übergabeverluste und vermeidbare stationäre Nutzung senken; Schnittstellen-/Vergütungs-/Datenregeln sind Delivery-Gate. **Recheck:** Übergaben, Wiederaufnahme, Doppelungen, Wartezeit, Outcomes, Datenschutz.
11. `ST-CDU-PRIMARY-SPLIT-0090-PROVIDER-PLURALITY` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. Öffentlich-rechtlich/frei-gemeinnützig/privatwirtschaftlich ist Eigentums-/Trägerstruktur, keine Wirkungsrichtung. **Goal:** Qualität, Zugang, Resilienz, Wirtschaftlichkeit. **Recheck:** Qualitäts-/Personal-/Entnahme-/Investitions-/Zugangsdaten statt Eigentumslabel.

#### `0091` sektorübergreifende Versorgung
12. `ST-CDU-PRIMARY-SPLIT-0091-INTEGRATED-CENTERS` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Integrierte Zentren können Koordination und Zugang verbessern, wenn Leistungen wirklich zusammenarbeiten statt nur ko-lokalisiert zu sein. **Recheck:** Überleitung, Wartezeit, Doppelungen, Patientenerfahrung, Outcomes.
13. `ST-CDU-PRIMARY-SPLIT-0091-CROSS-SECTOR-PLANNING` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Gemeinsame Bedarfsplanung kann Fehl-/Doppelkapazitäten reduzieren; benötigt interoperable Daten und klare Zuständigkeiten. **Recheck:** Bedarfsdeckung, Kapazitäts-/Personalallokation, regionale Verteilung.
14. `ST-CDU-PRIMARY-SPLIT-0091-CROSS-BORDER-COOP` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Länderübergreifende Kooperation kann Grenzregionen besser versorgen; Verträge, Kostenträger, Daten- und Rettungsschnittstellen sind Bedingungen. **Recheck:** reale Nutzung, Zeit/Wege, Kostenteilung, Kontinuität.
15. `ST-CDU-PRIMARY-SPLIT-0091-COMPLEX-SERVICE-BUNDLING` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`. Komplexe Leistungen zu bündeln kann Expertise/Qualität erhöhen; Konzentration verlängert Wege und schafft kritische Knoten. **Boundary/robustness:** Notfallzugang, Redundanz, Transportfähigkeit. **Recheck:** risikoadjustierte Qualität, Wege, Transfers, Ausfälle.
16. `ST-CDU-PRIMARY-SPLIT-0091-PRIMARY-CARE-MODEL` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. „Zukunftsfähiges Primärversorgungsmodell“ ist ohne Gatekeeping-, Team-, Vergütungs-/Zugangsdesign nicht richtungsfest. **Goal:** frühzeitiger, koordinierter Erstzugang. **Recheck:** exact Modell, Zugang, Kontinuität, Überweisungen, Notaufnahme, Verteilung.

#### `0092` Versorgungszentren / Quoten
17. `ST-CDU-PRIMARY-SPLIT-0092-MVZ-HEALTH-CAMPUS` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Multiprofessionelle MVZ/Campusmodelle können Wege/Koordination verbessern; Personalrekrutierung, Governance und Finanzierung entscheiden über reale zusätzliche Versorgung. **Recheck:** Fachmix, Öffnungszeiten, Wartezeit, Überleitung, Versorgungslücken.
18. `ST-CDU-PRIMARY-SPLIT-0092-PROVIDER-MODELS` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. Gleichförderung kommunaler/genossenschaftlicher/privat-gemeinnütziger Träger nennt kein Förderkriterium; Rechts-/Beihilfe-/Bedarfs- und Qualitätsdesign fehlt. **Goal:** bedarfsgerechte stabile Versorgung. **Recheck:** Kriterien, Additionality, Qualität, Fiskal-/Marktwirkung.
19. `ST-CDU-PRIMARY-SPLIT-0092-LANDARZTQUOTE-REVIEW` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `MEDIUM`. Die bestehende Quote kann Bedarfsregionen Personal zuführen; Weiterentwicklung muss Bindungswirkung, Auswahlfairness, lange Zeitverzögerung und mögliche Verdrängung regulärer Studienplätze prüfen. `INHERITED_CURRENT_BASELINE = QUOTE_ALREADY_ACTIVE`. **Recheck:** Auswahl/Abschluss, 10-Jahres-Bindung, tatsächliche Bedarfsregion, Abbruch/Strafzahlungen, Nettoadditionalität.
20. `ST-CDU-PRIMARY-SPLIT-0092-REGIONAL-ADMISSION-PREFERENCE` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. Stärkere Berücksichtigung eines „Bezugs zu Sachsen-Anhalt“ ist ohne Definition/Gewichtung/Rechtsgrundlage kein belastbar bewertbares Auswahlkriterium. **Boundary:** chancengleicher Hochschulzugang, Verhältnismäßigkeit. **Recheck:** Kriterium, Gewicht, Prognosevalidität für späteren Verbleib, Verteilungs-/Rechtsfolgen.

#### `0093` Rettung / Notfall
21. `ST-CDU-PRIMARY-SPLIT-0093-RESCUE-MASTERPLAN` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Gemeinsame Boden-/Luftrettungsplanung kann Standort-/Ressourcenallokation verbessern, wenn Hilfsfristen, Bedarf und Ausfallresilienz datenbasiert optimiert werden. **Recheck:** Hilfsfrist, Abdeckung, Übergaben, Luft-/Bodenauslastung, Kosten/Resilienz.
22. `ST-CDU-PRIMARY-SPLIT-0093-TELENOTARZT` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`. Telenotärztliche Unterstützung kann knappe Notarztressourcen schneller verfügbar machen; 2026 bereits gesetzlich verankert, daher `INHERITED_CURRENT_BASELINE`, Wirkung hängt am Rollout. **Recheck:** Verfügbarkeit, Fallmix, Therapiezeit, Eskalation, Outcomes, Systemausfall.
23. `ST-CDU-PRIMARY-SPLIT-0093-GEMEINDENOTFALLSANITAETER` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`. Geeignete Akutfälle können vor Ort versorgt/triagiert und Rettungs-/Notaufnahmewege entlastet werden; ebenfalls 2026 gesetzlich verankerte Baseline. **Recheck:** Fallselektion, vermiedene Transporte, Recontacts, Sicherheit, regionale Abdeckung.
24. `ST-CDU-PRIMARY-SPLIT-0093-DISPATCH-TECH` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Moderne Leitstellentechnik kann Disposition/Information verbessern; Technik ist Output, Nutzen hängt an Interoperabilität, Datenqualität, Personal und Ausfallkonzept. **Recheck:** Dispositionszeit, Fehlsteuerung, Uptime, Übergaben, Cyber-/Fallback.
25. `ST-CDU-PRIMARY-SPLIT-0093-DIGITAL-SYSTEMS` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. „Digitale Systeme“ ohne Use Case/Entscheidungsrolle ist zu unspezifisch; keine automatische Effizienz-/Sicherheitswirkung. **Recheck:** exact Funktion, Human oversight, Fehler-/Bias-/Cyberprofil.
26. `ST-CDU-PRIMARY-SPLIT-0093-RESCUE-DRONES` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`. Drohnen können Lageerkundung/Materialtransport beschleunigen; Wetter, Luftraum, Zuverlässigkeit, Datenschutz und reale Zeitersparnis sind Bedingungen. **Recheck:** Missionserfolg, Zeitgewinn, Abbruch-/Fehlerrate, Kosten, Datenschutz/Sicherheit.
27. `ST-CDU-PRIMARY-SPLIT-0093-NEW-MOBILITY-PILOTS` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. „Neue Mobilitätslösungen“ bleibt ohne Fahrzeug-/Einsatz-/Versorgungsdesign offen. **Recheck:** exact Pilot, Einsatzindikator, Alternativen, Skalierungs-/Abbruchkriterien.
28. `ST-CDU-PRIMARY-SPLIT-0093-SCHOOL-FIRST-AID-CPR` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`. Wiederholte praktische Erste-Hilfe-/Reanimationsbildung kann Handlungskompetenz und Laienhilfe erhöhen; Unterrichtseinheit ist Output. **Delivery:** Curriculum, Lehrkräfte/Partner, Wiederholung. **Recheck:** Kompetenz/Retention, Trainingsabdeckung, tatsächliche Ersthelferhandlungen.

#### Primärquelle p.27: fehlender Präventionsbullet
29. `ST-CDU-PRIMARY-GAP-P27-PREVENTION-MULTISETTING` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Lebensphasenübergreifende Bewegungs-/Ernährungs-/psychische-Gesundheits-/Suchtprävention mit Kommunen, Schulen, Vereinen, Kassen kann Risikofaktoren früher adressieren; heterogenes Portfolio, keine gemeinsame Outcome-Behauptung. **Problem/Goal:** vermeidbare Gesundheitsrisiken, Gesundheitskompetenz. **Distribution:** Alter, soziale Lage, Region. **Recheck:** konkrete Programme, Reichweite, Teilnahmegerechtigkeit, verhaltens-/gesundheitsbezogene Outcomes, Verdrängung/Additionality.
30. `ST-CDU-PRIMARY-GAP-P27-SUICIDE-MENTAL-HEALTH-PRIORITY` — `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON` · `OPEN` · `NOT_ASSESSABLE`. Höherer Stellenwert für Suizidprävention/mentale Gesundheit ist tragfähiger Schutz-/Zielraum, aber ohne Versorgungs-/Krisen-/Präventionsinstrument keine eigenständige Wirkungsrichtung. **Boundary:** Leben, psychische Gesundheit, Stigma/Datenschutz. **Recheck:** exact Maßnahmen, Krisenzugang, Wartezeit, Reichweite, qualitätsgesicherte Outcome-Indikatoren.

#### `0094` Pflege neu aufstellen
31. `ST-CDU-PRIMARY-SPLIT-0094-CARE-MIX` — `SOURCE_UNIT_RECLASSIFIED_VERSIONED` · `OPEN` · `NOT_ASSESSABLE`. Professionelle Pflege, Alltagsunterstützung, Tagesangebote und betreute gemeinschaftliche Wohnformen sind unterschiedliche Versorgungsklassen; kein Parent-Score. **Goal:** wohnortnahe selbstbestimmte stabile Pflege. **Recheck:** je Child Bedarf, Personal, Qualität, Kosten, Erreichbarkeit, Angehörigenlast, Institutionalisierung. **Boundary:** Selbstbestimmung, Qualität, Schutz vulnerabler Personen.
32. `ST-CDU-PRIMARY-SPLIT-0094-NURSE-SCOPE` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`. Sinnvoll erweiterte Pflegekompetenzen können Fachkräfte besser nutzen, Kontinuität beschleunigen und ärztliche Engpässe entlasten; Qualifikation, Haftung, Vergütung und Schnittstellen müssen passen. **Recheck:** Aufgabenverschiebung, Warte-/Prozesszeit, Qualität/Sicherheit, Arbeitsbelastung, Fluktuation.

#### `0095/0096` Angehörige / Pflegefinanzierung
33. `ST-CDU-PRIMARY-SPLIT-0095-CAREGIVER-RELIEF` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`. Beratung, Kurzzeit-/Verhinderungspflege und flexible Entlastung können Care-Belastung und Versorgungsausfälle reduzieren, wenn Kapazität tatsächlich verfügbar ist. **Distribution:** pflegende Angehörige, besonders hohe Care-Zeit/geringe Einkommen/ländliche Räume. **Recheck:** verfügbare Plätze/Leistungen, Wartezeit, Nutzung, Belastung, Erwerbsteilhabe, Krisen-/Heimeintritt.
34. `ST-CDU-PRIMARY-SPLIT-0095-FEDERAL-CARE-REFORM` — `SOURCE_UNIT_RECLASSIFIED_VERSIONED` · `OPEN` · `NOT_ASSESSABLE`. Gedeckelte Eigenanteile, „faire Finanzierung“ und Schutz selbstgenutzten Wohneigentums sind ein bundesrechtliches Finanzierungsportfolio mit Verteilungs-/Beitrags-/Steuer-/Fiskalpfaden; ohne Finanzierungsdesign kein Gesamturteil. **Competence:** Bundesgesetzgebung/Bundesratsadvocacy. **Recheck:** Belastung nach Einkommen/Pflegegrad, Gegenfinanzierung, Beitrag/Steuer, Sozialhilfe, Wohneigentum, Pflegekapazität.
35. Legacy `0096` bleibt `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`: Vereinfachung §43c-Abrechnung kann Verwaltungsfriktion/Rechtsunsicherheit senken, darf aber Anspruchshöhe/Transparenz/Kontrolle nicht verschlechtern. **Competence:** Bund; Land = Advocacy. **Recheck:** exact Normänderung, Bearbeitungsaufwand, Fehler/Streitfälle, korrekte Zuschläge, Anspruchs-/Fiskalwirkung.

#### Primary p.28: 4+1 Pflege-Kooperation fehlt im Release-1-Register
36. `ST-CDU-PRIMARY-GAP-P28-CARE-41-COOP` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Freiwillige Schul-Pflegeeinrichtungs-Kooperation kann Berufsorientierung und soziale Kompetenzen stärken, wenn Plätze qualitätsgesichert sind und kein unbezahlter Arbeitsersatz entsteht. **Relation:** fachlicher Implementation-Child/Crosswalk zum bereits versionierten allgemeinen `4+1`-Praxislernmechanismus; Source-Passage dennoch eigenständig erhalten, aber Outcome nicht doppelt zählen. **Recheck:** Teilnahme/Qualität, Berufswahl-/Ausbildungsübergang, soziale Kompetenz, Pflegeeinrichtungsbelastung, Arbeitsschutz/Freiwilligkeit.

#### `0097` Medi-Bus
37. `ST-CDU-PRIMARY-SPLIT-0097-MEDIBUS-GP` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Eine fahrplanmäßige mobile Hausarztpraxis kann reale räumliche Zugangslücken schließen, wenn sie knappes Personal netto ergänzt statt stationäre Praxen nur umzulenken. **Spatial/Delivery:** Zielregionen, Fahrplan, Personal, Labor/Überweisung/Dokumentation. **Recheck:** zusätzliche behandelte Patienten, Wege-/Wartezeit, Kontinuität, Kosten, Personaladditionalität.
38. `ST-CDU-PRIMARY-SPLIT-0097-MEDIBUS-SPECIALIST-PILOT` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`. Fachärztliche Ausweitung nach erfolgreicher Erprobung ist adaptiv/reversibel, aber nur bei passendem Fallmix und Anschlussversorgung sinnvoll. **Recheck/Scale gate:** Pilotkriterien, Nachfrage, Diagnose-/Follow-up-Qualität, Kosten, Fachkräfteverdrängung.

#### `0098` Digitalisierung
39. `ST-CDU-PRIMARY-SPLIT-0098-TELEMEDICINE` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `MEDIUM`. Telemedizin kann Wege und Spezialzugang verbessern, wenn Indikation, technische Qualität und Präsenz-Fallback stimmen. **Boundary:** Datenschutz, Nicht-Digital-Ausschluss, klinische Sicherheit. **Recheck:** Zugang/Wartezeit, Abbruch, Präsenzeskalation, Outcome, regionale/soziale Nutzung.
40. `ST-CDU-PRIMARY-SPLIT-0098-DIGITAL-CARE-APPS` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`. Digitale Pflegeanwendungen können Selbstmanagement/Koordination unterstützen; Nutzen ist an Evidenz, Usability, Integration und Nichtverlagerung von Care-Arbeit gebunden. **Recheck:** Nutzung/Abbruch, Pflege-/Angehörigenlast, Outcome, Datenschutz, digitale Ungleichheit.
41. `ST-CDU-PRIMARY-SPLIT-0098-NETWORKED-DOCUMENTATION` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Interoperable Dokumentation kann Doppelerfassung/Informationsverlust reduzieren; schlechte Interoperabilität kann Arbeitslast sogar erhöhen. **Recheck:** doppelte Eingaben, Übergabefehler, Dokumentationszeit, Datenqualität, Zugriffs-/Datenschutzvorfälle.
42. `ST-CDU-PRIMARY-SPLIT-0098-DIGITAL-INFRA-DATA-GOV` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`. Leistungsfähige Infrastruktur ist Enabler, kein Outcome; „Daten sicher und sinnvoll nutzen“ braucht Zweckbindung, Rollen, Cyberresilienz und analoge/klinische Fallbacks. **Recheck:** Verfügbarkeit, Interoperabilität, Ausfälle/Cyber, Nutzerzugang, Prozesszeit, Datenschutz.

#### `0099` Forschung / Produktion
43. `ST-CDU-PRIMARY-SPLIT-0099-UNIVERSITY-CLINIC-INNOVATION-NETWORK` — `EDITORIAL_V2_PLUS_APPROVED` · `POSITIVE` · `LOW`. Stärkere Uniklinik-Regionalversorger-Netze können Translation, Weiterbildung und Versorgungstransfer verbessern; Kooperation ist Output, nicht Patientenoutcome. **Recheck:** gemeinsame Projekte/Überleitungen, Transferzeit, regionale Nutzung, Versorgungs-/Qualitätsindikatoren.
44. `ST-CDU-PRIMARY-SPLIT-0099-DIGITAL-MEDICINE-MODEL-REGION` — `SOURCE_UNIT_RECLASSIFIED_VERSIONED` · `OPEN` · `NOT_ASSESSABLE`. Digitale Medizin, Telemonitoring und vernetzte Notfallstrukturen sind unterschiedliche Mechanismen; „Modellregion“ ist kein Wirkungsmaß. **Recheck:** je Child Use Case, Vergleichsbaseline, klinische/Prozessoutcomes, Skalierbarkeit, Cyber/Datenschutz.
45. `ST-CDU-PRIMARY-SPLIT-0099-MEDICAL-PRODUCTION` — `EDITORIAL_V2_PLUS_APPROVED` · `AMBIVALENT` · `LOW`. Mehr regionale Arznei-/Medizinproduktproduktion kann bei kritischen Gütern Lieferkettenresilienz erhöhen; ohne Produkt-/Engpass-/Kosten-/Beschaffungsdesign kann lokale Produktion teuer, nicht zusätzlich oder selbst abhängig sein. **Recheck:** kritische Produkte, Import-/Vorleistungsabhängigkeit, verfügbare Kapazität, Vollkosten, Lieferfähigkeit bei Schock, Qualitäts-/Umweltauflagen.

### 3. #241-Systemprüfung für diesen Shard

- `PROBLEM_REVIEW`: Demografie ist kein eigenständiger Fehlerzustand; getrennt prüfen: räumlicher Zugang, Fachkräfte, Krankenhaus-/Sektorfriktion, Rettungszeiten, Präventions-/psychische Gesundheitsrisiken, Pflegekapazität/-bezahlbarkeit, Angehörigenlast, Lieferkettenresilienz.
- `GOAL_REVIEW`: Gesundheit/Zugang/Qualität/Selbstbestimmung/Bezahlbarkeit/Resilienz sind Zielräume. Krankenhausprofil, MVZ, Quote, Medi-Bus, Digitalisierung oder „Modellregion“ sind Instrument-/Zwischenachsen.
- `DNS_REFERENCE = REVIEWED_PENDING_EXACT_REGISTRY_MAPPING`; keine Keyword-Zuordnung, kein Zielbezug als Kausalitätsnachweis. `STATE_GFA_ENAP_BENCHMARK = NOT_APPLICABLE`.
- `MATERIAL_OMISSIONS`: Bedarfs-/Warte-/Wege-/Personalbaselines, Finanzierungs-/Kapazitätsadditionalität, Risiko-/Qualitätsadjustierung, digitale Zugangs-/Datenschutz-/Cyberpfade, Pflegeverteilung, konkrete Präventionsprogramme, kritische Produktdefinition.
- `POLICY_COHERENCE`: Krankenhauskonzentration ↔ wohnortnahe Versorgung; Studium/Quote/Niederlassungsförderung ↔ reale Arbeitsbedingungen; Care-Mix ↔ Personal; Digitalisierung ↔ Interoperabilität/Fallback; lokale Produktion ↔ Beschaffung/EU-Markt.
- `DELIVERY_FEASIBILITY`: Hochschul-/Lehrkapazität, KV/KZV, Krankenhäuser, Kommunen, Kassen, Pflege-/Rettungspersonal, Leitstellen, IT/Cyber, Förder-/Planungsverwaltung.
- `RESOURCE_FINANCING`: Investition, Betrieb, Personal, Wartung, Schulung, Folgekosten und Opportunitätskosten getrennt; Mittel/Studienplatz/Portal/Technik ≠ Outcome.
- `SPATIAL_DISTRIBUTION`: ländliche Räume zentral; zugleich Konzentrations-, Wege- und digitale Ungleichheit prüfen.
- `INTERNATIONAL_LEAKAGE`: bei Arznei-/Medizinproduktproduktion relevant (Vorleistungen, Rohstoffe, regulatorische Lieferkette); sonst überwiegend gering.
- `ROBUSTNESS_STRESS_TEST`: Personalmangel, hohe Falllast, Cyber-/Netzausfall, Extremwetter/Transport, Lieferkettenstörung, Krankenhaus-/Praxis-Ausfall, Haushaltsdruck.
- `REVERSIBILITY_LOCKIN`: Krankenhaus-/Digital-/Produktionsinfrastruktur hoch; Quoten mittel-langfristig; Pilot/Medi-Bus relativ reversibel.
- `FALSIFICATION_TRIGGERS`: Wege-/Warte-/Hilfszeiten, Personal/FTE/Fluktuation, Qualitäts-/Sicherheitsoutcomes, Angehörigenlast, finanzielle Eigenbelastung, Notaufnahme/Transfers, Digitalausfälle/Abbruch, Lieferfähigkeit, regionale Verteilung.
- `LIFECYCLE_TRACEABILITY`: Wahlprogramm → Land/Bund/Planung/Haushalt/Vertrag/Förderung → Umsetzung → Nutzung/Capability → Gesundheits-/Pflegeoutcome → Reality Check. Current-law-Baselines nie als zukünftige Programmeleistung zählen.
- `VERSION_DELTA`: finale PDF ergänzt gegenüber Release-1 mindestens den eigenständigen Präventionsbullet, die vollständigen Trägervielfalt-/Pflegeversicherungsfortsetzungen und die 4+1-Pflegekooperation; Overmerges `0088–0095`, `0097–0099` nur additiv splitten.
- `COMMUNICATION_MEDIA_IMPACT`: „Vorreiter/Modellregion“, „Eigenverantwortung“, „Pflegende Angehörige sind das Rückgrat“ sind Frames, getrennt von Maßnahmenwirkung; keine Gruppen-/Outcome-Zurechnung aus Sprache allein.
- `RECOMMENDATION = NOT_AVAILABLE_AT_SOURCE_UNIT_LEVEL` ohne exact APPROVED RecommendationRecord.
- `COVERAGE_SCOPE = ST_CDU_PRIMARY_PDF_P25_P28_SEMANTIC_RECONCILIATION_COMPLETE`.

### 4. Segmentstatus / Completion Guard

`ST_CDU_PRIMARY_PARITY_P25_P28 = PASS_SEGMENT`

`ST_CDU_P25_P28_NEW_OR_SPLIT_TERMINAL = PASS_45`

`ST_CDU_P25_P28_SOURCE_RESTORE_GAPS = 0`

`ST_CDU_PRIMARY_SOURCE_PARITY = NOT_YET_FULL_PROGRAMME`

`authoritative_source_unit_count = null`

`authoritative_effect_mechanism_count = null`

`ST_CDU_344_FACH_COMPLETE` bleibt ausdrücklich **kein** Completion-Trigger.

**Nächster CDU-Parity-Shard:** finale offizielle PDF ab p.29 (`Soziale Gerechtigkeit und Familie`, Legacy `0100+`), idempotent gegen bereits fachlich terminale Release-1-Parents und alle versionierten Manifest-Shards. PR #257 darf dieses Ergebnis erst nach source-bound Dokumentation (dieser Kommentar) additiv materialisieren; Denominator bleibt ungefroren.

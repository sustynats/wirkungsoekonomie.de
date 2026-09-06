<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v88-wirkungsdatenraeume-register.md curriculum=4.0 sanitized=true -->
# V88 · Wirkungsdatenräume und Register: Interoperabilität statt Zentraldatenbank

**lecture_id:** `WOEK-G-BASE-088`  
**display_code:** `V88`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 hatte nur den geplanten Titel. v4.0 trennt semantische Register, Datenquellen und Datenaustausch-Infrastruktur; WÖk braucht keine zentrale Datensammelstelle, sondern IDs, Provenienz, Zugriffsregeln, Datenfunktionen und interoperable Verknüpfung bestehender Quellen.

## 20-Sekunden-Einstieg

Ein Wirkungsdatenraum muss nicht bedeuten: Alle Daten wandern in eine gigantische WÖk-Datenbank. Viel robuster ist ein **föderiertes Modell**. Daten bleiben möglichst bei vertrauenswürdigen Quellen, während gemeinsame IDs, Definitionen, Metadaten und Zugriffsregeln sie verknüpfbar machen. Das Masterregister sagt, *was* wir betrachten; das Wirkindikatorenregister sagt, *womit* wir beobachten; ein Datenraum regelt, *wie* unterschiedliche Quellen sicher zusammenarbeiten.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Register, Datenkatalog, Datenraum und Datenbank unterscheiden.
2. erklären, warum WÖk-Datenarchitektur föderiert statt zentral sein kann.
3. MasterItems, StateVariables, Indicators, Observations und Source IDs technisch/semantisch verknüpfen.
4. Provenienz, Versionierung, Zugriffsrechte und Datenminimierung als Kernanforderungen formulieren.
5. bestehende Datenräume/DPP/amtliche Statistiken anbinden, ohne Doppelhaltung zu erzwingen.
6. Datenqualität und Datenzugang von fachlichem Wirkungsurteil trennen.

## 1. Vier Dinge, die oft verwechselt werden

### Register

Verwaltet definierte Objekte/IDs/Versionen.

### Datenkatalog

Beschreibt, welche Datensätze existieren und wie sie gefunden werden.

### Datenraum

Regelt vertrauensvollen, standardisierten Datenaustausch zwischen mehreren Akteuren.

### Datenbank

Speichert konkrete Daten technisch.

WÖk braucht alle Funktionen teilweise – aber nicht zwingend in einem einzigen System.

## 2. Föderation statt Datenmonopol

Ein föderiertes Modell bedeutet:

- Destatis-Daten bleiben bei Destatis,
- Produktpassdaten bleiben in ihrer vorgesehenen DPP-Infrastruktur,
- Unternehmensdaten bleiben in autorisierten Quellen,
- Forschungsdaten bleiben in Repositorien,
- WÖk referenziert/normalisiert Metadaten und Datenfunktionen.

Vorteile:

- weniger redundante Speicherung,
- klarere Verantwortlichkeit,
- bessere Aktualität,
- Datenschutz/Datensouveränität,
- geringeres Single-Point-of-Failure-Risiko.

## 3. Semantische Kette

Die WÖk-Kernverknüpfung:

`MasterItem -> StateVariable -> Indicator -> Observation -> Source -> Version`

Zusätzliche Metadaten:

- Einheit,
- Population/Systemrand,
- Geografie,
- Zeit,
- Methodik,
- Unsicherheit,
- Datenfunktion,
- Lizenz/Zugriff,
- Provenienz.

Ohne diese Semantik sind Daten zwar verfügbar, aber nicht zuverlässig vergleichbar.

## 4. IDs sind Infrastruktur

Stabile IDs verhindern, dass Begriffe bei Umbenennung/Übersetzung zerfallen.

Beispiel:

- Displayname: „Versorgungssicherheit“
- stabile ID: `WOEK-MI-ENERGY-RESILIENCE-...`

Wenn der Name später präzisiert wird, bleibt die Referenz erhalten.

IDs brauchen Governance:

- nie still wiederverwenden,
- Deprecation statt Löschen,
- Redirect/Alias,
- Versionshistorie.

## 5. Datenfunktion gehört zum Fall

Ein Datensatz hat nicht universell dieselbe Rolle.

Destatis-Indikator X kann:

- in Fall A Baseline sein,
- in Fall B Outcome,
- in Fall C nur Kontext,
- in Fall D Reality-Check-Datenquelle.

Darum wird Datenfunktion **am Wirkungsfall** gespeichert, nicht pauschal am Indikator.

## 6. Datenräume existieren bereits

EU-/Brancheninitiativen arbeiten an gemeinsamen europäischen Datenräumen in Bereichen wie Gesundheit, Mobilität, Energie, Industrie oder öffentlicher Verwaltung.

Dazu kommen Dateninfrastrukturen wie:

- DPP,
- amtliche Statistik,
- Forschungsrepositorien,
- Unternehmensberichte.

WÖk sollte Interoperabilität suchen, nicht Konkurrenzdatenräume ohne Additionalität bauen.

## 7. Zugriff nach Zweck/Risiko

Nicht alle Wirkungsdaten sollen öffentlich sein.

Mögliche Klassen:

- öffentlich,
- aggregiert öffentlich,
- Forschungszugang,
- behördlich beschränkt,
- unternehmensvertraulich,
- personenbezogen besonders geschützt.

Prinzipien:

- Zweckbindung,
- Datenminimierung,
- Rollen/Rechte,
- Logging,
- Lösch-/Aufbewahrungsregeln,
- sichere Aggregation.

## 8. Beispiel: Produktwirkung

Für ein Gerät könnten verbunden werden:

- DPP: Produktidentität/Material-/Reparaturdaten,
- Unternehmensbericht: Lieferketten-/Emissionsdaten,
- amtliche Statistik: Energiemix/Region,
- Fachliteratur: Gesundheits-/Umweltparameter,
- WÖk-Register: MasterItems/StateVariables/Indicators.

Keine Quelle muss komplett kopiert werden.

Die WÖk-Wirkungsakte speichert Referenzen, verwendete Werte/Versionen und Analyseprovenienz.

## 9. Source-vs-View auch im Datenraum

Wenn Quelle aktualisiert wird, darf eine öffentliche WÖk-Seite nicht still einen neuen Wert zeigen, ohne Analyseversion zu prüfen.

Darum:

- Source snapshot/hash,
- Analysis version,
- recheck trigger,
- kontrollierte Neu-Berechnung.

`LIVE_DATA != AUTOMATIC_NEW_JUDGMENT`.

## 10. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Register | verwaltet definierte Objekte/IDs/Versionen |
| Datenraum | Governance-/Technikrahmen für Datenaustausch mehrerer Akteure |
| Föderation | Daten bleiben verteilt, werden über Standards/Referenzen verknüpft |
| Provenienz | Herkunft/Transformationshistorie von Daten |
| Semantic Interoperability | gleiche Bedeutung/Definition über Systeme hinweg |
| Data Function | Rolle eines Datums im konkreten Wirkungsfall |
| Source Snapshot | referenzierter Stand einer Quelle für reproduzierbare Analyse |

## 11. Typische Fehlinterpretationen

### „Wirkungsdatenraum = zentrale Bürger-/Unternehmensdatenbank.“
Falsch.

### „Je mehr Daten zentral, desto besser.“
Falsch.

### „Live-Daten dürfen automatisch Fachurteile ändern.“
Falsch.

### „IDs sind nur technische Details.“
Falsch; sie sichern fachliche Kontinuität.

### „Öffentliche Wirkung braucht öffentliche personenbezogene Rohdaten.“
Falsch.

## 12. WÖk-Abgrenzung

Datenräume, Register und Interoperabilitätsstandards existieren unabhängig von WÖk. WÖk-spezifisch ist der semantische Crosswalk zu Wirkungsobjekten, Datenfunktionen, Analysen, Recommendations und Reality Checks.

## 13. Quellen

- Europäische Kommission, Common European Data Spaces: https://digital-strategy.ec.europa.eu/en/policies/data-spaces
- EU Data Act: https://digital-strategy.ec.europa.eu/en/policies/data-act
- Digital Product Passport: https://single-market-economy.ec.europa.eu/single-market/goods/european-standards/harmonised-standards/digital-product-passport-dpp_en
- Destatis: https://www.destatis.de/
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 14. Transferaufgabe

Entwirf einen föderierten Datenfluss für eine Produkt- oder Policyanalyse.

Definiere:

- fünf externe Quellen,
- stabile IDs,
- Datenfunktionen,
- Zugriffslevel,
- Version/Snapshot,
- Recheck-Trigger,
- welche Daten **nicht** zentral kopiert werden sollen.

## 16. Prüfungsrelevanz

- Register/Katalog/Datenraum/Datenbank,
- föderiertes Modell,
- semantische Kette,
- stabile IDs,
- Datenfunktion,
- Zugriff/Datenschutz,
- Source snapshot/recheck.

## 17. Sprechertext

Wenn man „Wirkungsdatenraum“ sagt, klingt es schnell nach einer gigantischen Datenbank, in der alles über alle gespeichert wird.

Das wäre weder nötig noch besonders klug.

Destatis kann seine Daten besser pflegen als wir. Produktpassdaten haben ihre eigene Infrastruktur. Forschungsdaten liegen in Repositorien.

Die WÖk braucht deshalb vor allem Verbindungen.

Was ist der Wirkungsgegenstand? Welche State Variable? Welcher Indikator? Welche Observation? Welche Quelle und Version?

Das ist die semantische Kette.

Und dafür brauchen wir stabile IDs.

Ein Name kann sich ändern. Eine Definition kann präzisiert werden. Die ID hält die Geschichte zusammen.

Auch Datenschutz wird einfacher, wenn wir nicht alles kopieren.

Manche Daten sind öffentlich. Manche nur aggregiert. Manche dürfen nur Forschende oder Behörden sehen.

Und noch eine wichtige Regel: Wenn eine Live-Datenquelle morgen einen neuen Wert liefert, darf unser Urteil nicht automatisch umspringen.

Erst prüfen wir, ob sich dadurch die Analyse wirklich ändert.

Der Merksatz lautet:

**Wirkungsdaten brauchen keine zentrale Datenmacht. Sie brauchen gemeinsame Bedeutung, sichere Verknüpfung und saubere Provenienz.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

### Aktualisierung zu CSRD und Sorgfaltspflichten · 6. September 2026

Ältere Reichweiten- und Terminangaben sind am Änderungsrecht zu prüfen: Der Rat hat am 24. Februar 2026 die Omnibus-I-Vereinfachung von CSRD und CS3D endgültig gebilligt. Sie verändert unter anderem die erfassten Unternehmen und Übergänge. Für ein konkretes Unternehmen sind die veröffentlichte Änderungsrichtlinie, ihre nationale Umsetzung und das Geschäftsjahr maßgeblich; die ursprüngliche CSRD-Zeitplanung darf nicht ungeprüft fortgeschrieben werden. Unabhängig von einer Berichtspflicht bleibt der Unterschied zwischen berichteter Kennzahl, Zustandsveränderung und kausaler Zurechnung bestehen.

Quelle: [Rat der EU, Beschluss und Anschlussdokumente vom 24. Februar 2026](https://www.consilium.europa.eu/en/press/press-releases/2026/02/24/council-signs-off-simplification-of-sustainability-reporting-and-due-diligence-requirements-to-boost-eu-competitiveness/).

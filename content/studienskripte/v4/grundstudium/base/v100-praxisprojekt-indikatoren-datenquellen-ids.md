<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ee7fec6b8a738b78bda9b989eba252963a325daf path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v100-praxisprojekt-indikatoren-datenquellen-ids.md curriculum=4.0 sanitized=true -->
# V100 · Praxisprojekt: Indikatoren, Datenquellen und WÖk-IDs auswählen

**lecture_id:** `WOEK-G-BASE-100`  
**display_code:** `V100`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 macht die Zwei-Ebenen-Registerlogik im Praxisprojekt verbindlich und verlangt für jeden Indikator Quelle, Definition, Datenfunktion, Baseline, Unsicherheit und Version statt bloßer Kennzahlenliste.

## 20-Sekunden-Einstieg

Du hast jetzt Problem, Ziel und Wirkpfad. Jetzt musst du entscheiden, **womit du die relevanten Zustände beobachtest**. Dabei gilt: MasterItem ist nicht Indikator. State Variable ist nicht Observation. Ein DNS-Indikator kann sehr nützlich sein - aber nur, wenn Definition, Population und Datenfunktion zum Fall passen. Die Kernkette lautet: `MasterItem -> StateVariable -> Indicator -> Observation -> Analysis/RealityCheck`.

## Lernziele

Nach dieser Vorlesung kannst du:

1. aus einem Wirkpfad relevante State Variables ableiten.
2. geeignete Indikatoren und Datenquellen auswählen.
3. externe Quellen wie Destatis/DNS, ESRS, DPP oder Fachstatistik korrekt anbinden.
4. Datenfunktionen je Wirkungsfall festlegen.
5. Proxy-, Datenlücken- und Versionsrisiken dokumentieren.
6. einen reproduzierbaren Indicator Register Extract für dein Projekt erstellen.

## 1. Vom Wirkpfad zur State Variable

Nicht bei verfügbaren Daten anfangen.

Zuerst:

> Welcher relevante Zustand soll sich laut Wirkpfad verändern?

Beispiel kostenloser ÖPNV:

- Pkw-Fahrleistung,
- ÖPNV-Nutzung,
- Mobilitätszugang einkommensarmer Haushalte,
- Reisezeit,
- Emissionen,
- Betriebskapazität.

Das sind State Variables bzw. Kandidaten dafür.

## 2. Indikator-Fit

Für jeden Kandidaten prüfen:

- misst er die State Variable direkt oder nur als Proxy?
- gleiche Population?
- gleicher Raum?
- gleicher Zeitraum?
- gleiche Definition?
- ausreichende Frequenz?
- historische Baseline?
- spätere Reality-Check-Nutzung möglich?

Ein leicht verfügbarer Indikator ist nicht automatisch der richtige.

## 3. Datenfunktion festlegen

Im Projekt erhält jede Observation eine Funktion:

- `SOURCE_FACT`
- `BASELINE`
- `TARGET`
- `IMPLEMENTATION`
- `OUTPUT`
- `OUTCOME`
- `DISTRIBUTION`
- `BOUNDARY`
- `CONTEXT`
- `COUNTERFACTUAL_INPUT`
- `REALITY_CHECK`

Derselbe Indikator kann je Fall andere Funktion haben.

## 4. DNS-Indikatoren

Bei Bundes-/Deutschlandfällen prüfst du, ob relevante DNS-Indikatoren existieren.

Sie können:

- nationale Baseline liefern,
- Zielrichtung/Zielwert liefern,
- Trend/Context zeigen,
- später Reality Check unterstützen.

Aber:

`DNS_INDICATOR != POLICY_ATTRIBUTION`.

## 5. WÖk-IDs

Verwende stabile IDs für:

- MasterItem,
- StateVariable,
- Indicator,
- Source,
- Analysis Version.

Wenn noch keine kanonische ID existiert:

- Candidate ID anlegen,
- Definition dokumentieren,
- nicht still vorhandene IDs umdeuten.

## 6. Datenqualität

Mindestens erfassen:

- Herausgeber,
- URL/Identifier,
- Stand,
- Einheit,
- Definition,
- Geografie,
- Population,
- Messmethode,
- Aktualität,
- Unsicherheit,
- mögliche Bias/Abdeckung.

## 7. Proxy-Regel

Ein Proxy ist zulässig, wenn direkte Messung fehlt.

Aber er braucht:

- Begründung,
- erwartete Beziehung zur State Variable,
- bekannte Grenzen,
- Recheck, sobald bessere Daten verfügbar sind.

`PROXY != DIRECT_OBSERVATION`.

## 8. Datenlücke ist Ergebnis

Wenn ein materieller Zustand nicht beobachtbar ist:

`DATA_GAP`.

Dann kann die Recommendation lauten:

- Daten erheben,
- Pilotieren,
- Forschungsbedarf,
- Entscheidung unter Unsicherheit mit Schutzmaßnahmen.

Nicht: Wert = 0.

## 9. Beispiel: Hitzeschutz

State Variables:

- Hitzebelastung,
- hitzebedingte Morbidität/Mortalität,
- Grün-/Verschattungszugang,
- vulnerable Exposition.

Indikatoren:

- Temperatur-/Heat-Index,
- Gesundheitsdaten,
- Flächen-/Baumdaten,
- sozioökonomische Verteilung.

Datenfunktionen:

- Baseline,
- Distribution,
- Outcome,
- Reality Check.

## 10. Pflichtartefakt

Das Praxisprojekt erzeugt `INDICATOR_REGISTER_EXTRACT` mit:

- stable/candidate ID,
- Definition,
- State Variable,
- Source ID,
- Datenfunktion,
- Baseline/Target soweit vorhanden,
- Version,
- Unsicherheit,
- Coverage.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Indicator Register Extract | projektspezifische Auswahl/Metadaten der verwendeten Indikatoren |
| Candidate ID | vorläufige neue ID bis Governance-Review |
| Data Function | Rolle einer Observation im Wirkungsfall |
| Proxy | Ersatzmessgröße |
| Coverage | Abdeckung nach Raum, Zeit, Population und Scope |
| Data Gap | relevante, nicht ausreichend beobachtbare Information |

## 12. Typische Fehlinterpretationen

### „Viele Indikatoren = gute Analyse.“
Falsch.

### „DNS-Indikator beweist Policywirkung.“
Falsch.

### „Proxy ist direkte Messung.“
Falsch.

### „Keine Daten = null.“
Falsch.

### „IDs dürfen nachträglich ihre Bedeutung wechseln.“
Falsch.

## 13. Quellen

- Destatis DNS-Indikatoren: https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- EFRAG Knowledge Hub: https://knowledgehub.efrag.org/
- Digital Product Passport: https://single-market-economy.ec.europa.eu/single-market/goods/european-standards/harmonised-standards/digital-product-passport-dpp_en

## 14. Transferaufgabe

Erstelle für dein Projekt mindestens acht State Variables und jeweils geeignete Indikatoren.

Für jeden:

- Source,
- Data Function,
- Baseline,
- Version,
- Unsicherheit,
- Proxy-Status,
- Reality-Check-Tauglichkeit.

## 16. Prüfungsrelevanz

- Registerkette,
- Datenfunktionen,
- Indikator-Fit,
- DNS-Funktion,
- Proxy/Data Gap,
- IDs/Versionierung,
- Pflichtartefakt.

## 17. Sprechertext

Jetzt kommen die Daten.

Und hier ist die wichtigste Regel: Wir suchen nicht zuerst nach Zahlen und überlegen danach, was sie bedeuten könnten.

Wir beginnen beim Wirkpfad.

Welcher Zustand soll sich verändern?

Das ist unsere State Variable.

Dann suchen wir einen passenden Indikator.

Und erst dann die konkrete Observation.

Bei einem politischen Fall kann ein DNS-Indikator perfekt passen. Aber er beweist trotzdem nicht, dass unser Gesetz die Veränderung verursacht.

Er kann Baseline, Target oder Reality-Check-Datum sein.

Und wenn kein guter Indikator existiert, markieren wir Data Gap.

Wir erfinden keine Null.

Vielleicht nutzen wir einen Proxy - aber dann sagen wir offen, dass er nur Ersatz ist.

Der Merksatz lautet:

**Nimm nicht die Zahl, die verfügbar ist. Nimm die Messgröße, die wirklich zu deinem Wirkpfad passt - und dokumentiere, was sie leisten kann und was nicht.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

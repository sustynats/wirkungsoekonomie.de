<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v65-lieferkettenresilienz-abhaengigkeitsrisiken.md curriculum=4.0 sanitized=true -->
# V65 · Lieferkettenresilienz und Abhängigkeitsrisiken

**lecture_id:** `WOEK-G-BASE-065`  
**display_code:** `V65`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED_VERSION_SENSITIVE`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 trennt Effizienz, Konzentration, Abhängigkeit, Verwundbarkeit und Resilienz. Lieferkettenresilienz ist kein Autarkiegebot; Diversifikation, Lager, Dual Sourcing, Substitution, Recycling und strategische Partnerschaften werden als Optionen mit Kosten-/Wirkungsprofilen geprüft.

## 20-Sekunden-Einstieg

Eine Lieferkette ist nicht resilient, nur weil sie lang oder kurz ist. Entscheidend ist: **Welche kritische Funktion hängt von welchem Engpass ab – und welche Alternativen existieren, wenn dieser Engpass ausfällt?** Ein einziger Lieferant kann hochriskant sein, muss es aber nicht; zehn Lieferanten aus derselben Region können trotzdem gemeinsam ausfallen. Resilienz bedeutet also nicht Autarkie, sondern robuste, diversifizierte und anpassungsfähige Versorgung.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Konzentration, Abhängigkeit und Verwundbarkeit unterscheiden.
2. kritische Lieferkettenfunktionen und Single Points of Failure identifizieren.
3. Diversifikation, Lagerhaltung, Substitution, Recycling und Dual Sourcing vergleichen.
4. Kosten-/Effizienz-/Umwelt-/Sozialtrade-offs von Resilienzmaßnahmen prüfen.
5. geografische/technologische Korrelation und versteckte gemeinsame Abhängigkeiten erkennen.
6. Lieferketten-Stresstests und Recheck-Trigger entwerfen.

## 1. Abhängigkeit ist funktional

Frage:

> Welche Funktion fällt aus, wenn Input X nicht verfügbar ist?

Nicht jede Importabhängigkeit ist kritisch.

Kritikalität steigt z. B. bei:

- hoher Substitutionsschwierigkeit,
- langer Wiederbeschaffungszeit,
- geringer Lagerfähigkeit,
- hoher Konzentration,
- systemrelevanter Nutzung.

## 2. Konzentration

Mögliche Ebenen:

- Lieferant,
- Land/Region,
- Rohstoff,
- Technologie,
- Transportkorridor,
- Hafen,
- Cloud-/Softwareprovider.

Ein Konzentrationsindikator ist Kontext – keine vollständige Resilienzmessung.

## 3. Gemeinsame Ausfallursachen

Mehrere Lieferanten können abhängig sein von:

- derselben Mine,
- demselben Hafen,
- derselben Energiequelle,
- demselben Vorprodukt,
- derselben Cloud.

Deshalb zählt `COMMON_MODE_FAILURE`.

## 4. Resilienzoptionen

- Dual/Multi Sourcing,
- geografische Diversifikation,
- Sicherheitslager,
- technische Substitution,
- Designflexibilität,
- Recycling/Urban Mining,
- langfristige Partnerschaften,
- regionale Kapazität,
- Notfallverträge.

Jede Option kostet und wirkt unterschiedlich.

## 5. Just-in-time vs. Puffer

Just-in-time kann Lagerkosten senken.

Puffer können Unterbrechungsrisiko senken.

Die optimale Balance hängt an:

- Störwahrscheinlichkeit,
- Schadenshöhe,
- Lagerkosten,
- Verderb/Obsoleszenz,
- Recovery Time.

## 6. Reshoring ist nicht automatisch resilient

Produktion im Inland kann manche geopolitische Risiken reduzieren und andere erhöhen:

- lokale Energie-/Naturgefahren,
- Fachkräfteengpass,
- Kosten,
- gemeinsame Infrastrukturabhängigkeit.

`LOCAL != RESILIENT`.

## 7. Nachhaltigkeits-/Menschenrechtswirkung

Diversifikation darf nicht bedeuten, Standards zu umgehen.

Resilienzmaßnahme kann soziale/ökologische Wirkung verändern:

- neue Minen/Standorte,
- Transportwege,
- Arbeitsbedingungen,
- Flächen-/Wasserbedarf.

MPD-/Boundary-Check bleibt.

## 8. Beispiel kritischer Rohstoff

Input X ist für Batteriespeicher relevant.

Prüfen:

- Herkunftskonzentration,
- Verarbeitungsstandorte,
- Substitution,
- Recyclingpotenzial,
- Lagerfähigkeit,
- Nachfragepfad,
- Umwelt-/Sozialfolgen alternativer Quellen.

Robuste Strategie kann Portfolio sein statt „alles zurückholen“.

## 9. Stress Test

Szenarien:

- Lieferant fällt 6 Monate aus,
- Transportkorridor blockiert,
- Preis verdreifacht,
- Exportbeschränkung,
- Naturkatastrophe,
- Nachfrage +50 %.

Messe:

- Ausfallzeit,
- Service-/Produktionsverlust,
- Ersatzkosten,
- Recovery,
- Verteilung.

## 10. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Abhängigkeit | Funktion ist auf Input/Akteur angewiesen |
| Kritikalität | Bedeutung eines Inputs für wesentliche Funktion bei begrenzter Substitution |
| Common Mode Failure | mehrere scheinbar unabhängige Quellen fallen aus gemeinsamer Ursache aus |
| Dual Sourcing | zwei getrennte Bezugsquellen |
| Sicherheitslager | Reservebestand für Unterbrechungen |
| Substitution | Ersatz eines Inputs/Technologiepfads |
| Reshoring | Rückverlagerung von Produktion ins Inland |

## 11. Typische Fehlinterpretationen

### „Importabhängigkeit = schlecht.“
Falsch.

### „Mehr Lieferanten = automatisch diversifiziert.“
Falsch.

### „Reshoring = automatisch resilient.“
Falsch.

### „Lagerhaltung ist immer Verschwendung.“
Falsch.

### „Resilienz rechtfertigt Standardsenkung.“
Falsch.

## 12. WÖk-Abgrenzung

Supply-Chain-Resilience und strategische Abhängigkeitsanalyse sind etablierte Felder. WÖk ergänzt MPD-/Verteilungs-/Boundary- und Reality-Check-Logik über die Lieferkettenoptionen.

## 13. Quellen

- OECD Supply Chain Resilience: https://www.oecd.org/trade/topics/global-value-chains-and-resilience/
- EU Critical Raw Materials: https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials_en
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 14. Transferaufgabe

Wähle einen kritischen Input. Baue Dependency Map, Common-Mode-Analyse und drei Stressszenarien. Vergleiche Lager, Diversifikation, Substitution und Recycling nach Kosten, Resilienz und MPD.

## 16. Prüfungsrelevanz

- Abhängigkeit/Kritikalität,
- Konzentration/Common Mode,
- Optionen,
- JIT/Puffer,
- Reshoring,
- Stress Test,
- MPD.

## 17. Sprechertext

Eine Lieferkette ist nicht automatisch riskant, weil sie global ist.

Und nicht automatisch sicher, weil sie lokal ist.

Wir fragen funktional: Was passiert, wenn dieser Input ausfällt?

Gibt es Ersatz? Wie schnell? Kommen unsere drei Lieferanten vielleicht trotzdem alle aus derselben Mine?

Dann vergleichen wir Optionen.

Mehr Lager. Zweiter Lieferant. Andere Technologie. Recycling. Regionale Kapazität.

Und wir prüfen die Nebenwirkungen.

Denn eine neue Rohstoffquelle kann Versorgung sicherer machen und gleichzeitig Wasser- oder Menschenrechtsprobleme erzeugen.

Der Merksatz lautet:

**Lieferkettenresilienz bedeutet nicht, alles selbst zu machen. Sie bedeutet, kritische Funktionen so zu bauen, dass ein einzelner Schock nicht das ganze System stoppt.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

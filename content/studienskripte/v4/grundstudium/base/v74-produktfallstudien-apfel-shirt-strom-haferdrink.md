<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v74-produktfallstudien-apfel-shirt-strom-haferdrink.md curriculum=4.0 sanitized=true -->
# V74 · Produktfallstudien: Apfel, T-Shirt, Strom und Haferdrink

**lecture_id:** `WOEK-G-BASE-074`  
**display_code:** `V74`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 macht aus vier Lehrbeispielen keine fertigen Rankings, sondern methodische Fallwerkstätten. Region, Saison, Produktionsverfahren, Strommix, Rezeptur, Nutzung und Datenstand können Ergebnisse verändern.

## 20-Sekunden-Einstieg

„Apfel oder Banane? Baumwollshirt oder Polyester? Strom A oder B? Milch oder Hafer?“ Solche Vergleiche wirken simpel, sind es aber selten. **Die richtige Antwort hängt am Scope.** Ein regionaler Lagerapfel im Frühjahr kann anders abschneiden als ein frischer Apfel im Herbst. Strom hat je nach Erzeugungsmix andere Profile. Haferdrink und Milch unterscheiden sich je nach Rezeptur, Landwirtschaft, Ernährungskontext und funktionaler Einheit. V74 zeigt, wie man Produktvergleiche sauber baut - nicht welches Produkt immer gewinnt.

## Lernziele

Nach dieser Vorlesung kannst du:

1. vier Produktfälle mit funktionaler Einheit und Scope strukturieren.
2. Daten-/Saison-/Region-/Nutzungssensitivität erkennen.
3. Klima-, Ressourcen-, Arbeit/Fairness- und Gesundheit/Sicherheitsfelder getrennt prüfen.
4. Durchschnittsdaten von konkreten Produktdaten unterscheiden.
5. keine universellen Rankings aus Fallbeispielen ableiten.
6. Sensitivität und Data Gaps im Produktvergleich dokumentieren.

## 1. Fall A: Apfel

Mögliche Variablen:

- Anbauverfahren,
- Bewässerung,
- Pflanzenschutz,
- Biodiversität,
- Ertrag,
- Kühl-/Lagerdauer,
- Transport,
- Food Waste,
- Arbeitsbedingungen.

Ein „regionaler“ Apfel kann nach langer Kühlung andere Klima-/Energieeffekte haben als saisonal frisch importierte Ware. Das ist eine empirische, keine Herkunftsfrage.

## 2. Fall B: T-Shirt

Scope:

- Fasererzeugung,
- Spinnen/Weben,
- Färben/Ausrüsten,
- Konfektion,
- Transport,
- Nutzung/Waschen,
- Lebensdauer,
- End-of-Life.

Wirkungen:

- Wasser/Fläche,
- Chemikalien,
- Energie/Emissionen,
- Arbeitssicherheit/Lohn,
- Mikrofasern je Material,
- Haltbarkeit.

Ein T-Shirt, das doppelt so lange getragen wird, verändert die funktionale Einheit.

## 3. Fall C: Strom

Strom ist physikalisch am Verbrauchspunkt homogen, aber Erzeugungssysteme unterscheiden sich.

Prüfen:

- Lebenszyklus-Emissionen,
- Flächen-/Materialbedarf,
- Luftschadstoffe,
- System-/Netzwirkung,
- Flexibilität,
- Versorgungssicherheit,
- Kosten/Verteilung.

Wichtig:

`GENERATION_TECHNOLOGY != WHOLE_POWER_SYSTEM`.

Eine kWh-Technologieanalyse ersetzt keine Systemanalyse von Netz, Speicher, Flexibilität und Kapazität.

## 4. Fall D: Haferdrink vs. Milch

Funktionale Einheit kann sein:

- Liter Getränk,
- Proteinmenge,
- Nährstofffunktion,
- Nutzung im konkreten Ernährungsmuster.

Wirkungen:

- Treibhausgase,
- Land/Wasser,
- Tierwohl,
- Nährwert/Fortifizierung,
- Preis/Zugang,
- landwirtschaftliche Regionalwirkung.

Ein reiner Litervergleich beantwortet nicht jede Ernährungsfrage.

## 5. Durchschnitt vs. konkretes Produkt

Durchschnittsdaten sind sinnvoll für Screening.

Aber konkrete Anbieter können abweichen durch:

- Energie,
- Rezeptur,
- Lieferkette,
- Lebensdauer,
- Zertifizierung/Arbeitsbedingungen,
- Verpackung.

Daher:

`AVERAGE_ARCHETYPE -> SCREENING`,
`PRODUCT_SPECIFIC_DATA -> DECISION_UPGRADE`.

## 6. Sensitivität

Für jeden Fall mindestens drei Szenarien ändern.

Beispiel Apfel:

- Saison,
- Lagerdauer,
- Transport.

T-Shirt:

- Tragedauer,
- Waschtemperatur,
- Material.

Strom:

- Systemgrenze,
- Standort,
- Integrationskontext.

Haferdrink:

- funktionale Einheit,
- Fortifizierung,
- Landwirtschaft.

## 7. Nichtkompensation

Ein sehr gutes Klimaprofil kann eine belegte harte Sicherheits-/Rechtsverletzung nicht aufheben.

Produktprofile bleiben dimensionsbezogen.

## 8. Data Gap

Bei Arbeit/Fairness oder Lieferketten fehlen häufig produktspezifische Daten.

Dann:

- offen markieren,
- Branchen-/Länderkontext nur als Kontext,
- keine Herkunfts-/Markenvermutung,
- bessere Nachweise benennen.

## 9. Beispielhafte Ergebnisform

Nicht:

> „Haferdrink 8,7 - Milch 3,1.“

Besser:

> „Für die untersuchte funktionale Einheit zeigt der Fall in Klima/Land ein robustes positives Potenzial für Option A; Nährwertbezug hängt an Fortifizierung/Ernährungskontext; Arbeitsdaten beider Lieferketten sind nur teilweise produktspezifisch.“

## 10. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Archetyp | typischer, vereinfachter Referenzfall |
| Produktspezifische Daten | Daten für konkrete Produkt-/Lieferkettenausprägung |
| Saison-/Regionssensitivität | Ergebnis hängt an Zeitpunkt/Ort |
| Functional Unit | gemeinsame Leistung/Nutzenbasis |
| Screening | erste grobe Bewertung mit begrenzter Datentiefe |
| Decision Upgrade | Verbesserung durch konkrete Daten vor realer Entscheidung |

## 11. Typische Fehlinterpretationen

### „Regional ist immer besser.“
Falsch.

### „Baumwolle ist immer nachhaltiger als Polyester.“
Falsch.

### „kWh-LCA erklärt das ganze Stromsystem.“
Falsch.

### „Liter Milch vs. Liter Hafer beantwortet alle Ernährungsfragen.“
Falsch.

### „Archetypdaten sind Produktbeweis.“
Falsch.

## 12. WÖk-Abgrenzung

LCA, Ernährungs-/Textil-/Energiesystemforschung liefern die Fachbasis. WÖk nutzt Beispiele, um Scope, funktionale Einheit, MPD-Felder, Datenqualität, Boundaries und Sensitivität gemeinsam zu lehren.

## 13. Quellen

- Umweltbundesamt: https://www.umweltbundesamt.de/
- IPCC: https://www.ipcc.ch/
- Our World in Data Food/Environment als Sekundärvisualisierung, Primärstudien für Fachurteile prüfen: https://ourworldindata.org/environmental-impacts-of-food
- EU ESPR/DPP: https://environment.ec.europa.eu/topics/circular-economy/ecodesign-sustainable-products-regulation_en

## 14. Transferaufgabe

Wähle einen der vier Fälle. Definiere funktionale Einheit, Archetypdaten, zwei produktspezifische Upgrades, drei Sensitivitäten, einen Data Gap und eine Boundary.

## 16. Prüfungsrelevanz

- vier Falllogiken,
- funktionale Einheit,
- Archetyp vs. Produktdaten,
- Sensitivität,
- Data Gap,
- kein Universalranking.

## 17. Sprechertext

Diese vier Beispiele sind perfekt, weil sie zeigen, wie schnell einfache Nachhaltigkeitsfragen kompliziert werden.

Ist der regionale Apfel besser? Vielleicht - aber was ist mit Lagerung und Saison?

Ist Baumwolle besser als Polyester? Hängt an Wasser, Chemikalien, Lebensdauer und Nutzung.

Ist eine Kilowattstunde erneuerbar besser? Für viele Wirkungen oft ja - aber ein Stromsystem braucht zusätzlich Netz, Flexibilität und Versorgungssicherheit.

Und Milch gegen Haferdrink? Klima und Land sind nur ein Teil; Nährstofffunktion und Rezeptur können für bestimmte Fragen wichtig sein.

Der Merksatz lautet:

**Fallbeispiele sind keine ewigen Rankings. Sie zeigen, wie man Scope, Daten und Wirkpfade so sauber baut, dass das Ergebnis für genau diesen Fall belastbar ist.**

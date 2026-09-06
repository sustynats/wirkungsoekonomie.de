<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ee7fec6b8a738b78bda9b989eba252963a325daf path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v42-lieferketten-importwirkung-und-grenzausgleich.md curriculum=4.0 sanitized=true -->
# V42 · Lieferketten, Vorleistungen und Importwirkung - Datenweitergabe statt Herkunftspauschale

**lecture_id:** `WOEK-G-BASE-042`  
**display_code:** `V42`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 / frühere Vorsteuer-/Importwirkungsmodelle @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED_VERSION_SENSITIVE`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 trennt geltende Umsatz-/Einfuhrumsatzsteuer, EU-CBAM, DPP/Produktdaten und WÖk-eigene Importwirkungs-/Vorsteuerideen. Herkunft ist kein Wirkungsproxy. Wirkung muss möglichst produkt-/prozess-/lieferkettenbezogen, interoperabel und handel-/EU-rechtskonform erfasst werden.

## 20-Sekunden-Einstieg

Wenn negative Wirkung einfach ins Ausland verlagert wird, ist eine nationale Wirkungssteuer unvollständig. Aber die Lösung darf nicht heißen: „Import aus Land X = schlechte Wirkung“. **Herkunft ist kein Wirkungsbeweis.** v4.0 denkt deshalb in produkt- und prozessbezogenen Daten entlang der Wertschöpfungskette. Reale Vorbilder sind etwa EU-CBAM für eingebettete CO₂-Emissionen und der Digital Product Passport für bestimmte Produktinformationen. Eine allgemeine WÖk-Importwirkungslogik bleibt ein Policy-Modell und muss Handels-, EU-, Daten- und Administrationsrecht bestehen.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Vorleistungs-/Lieferkettenwirkung von territorialer Herkunft unterscheiden.
2. Umsatz-/Einfuhrumsatzsteuer, CBAM, DPP und WÖk-Importwirkungsmodell funktional trennen.
3. erklären, wie Wirkungsdaten entlang einer Rechnung/Wertschöpfungskette weitergegeben werden könnten.
4. Leakage, Doppelzählung und Herkunftsdiskriminierung erkennen.
5. Datenfallbacks und Default-Werte kritisch prüfen.
6. Import-/Vorleistungslogik an konkrete Produkt-/Prozessdaten statt pauschale Länderwerte binden.

## 1. Warum Lieferketten zählen

Ein Produkt kann in Deutschland verkauft werden, während große Teile seiner Wirkung entstehen durch:

- Rohstoffgewinnung,
- Vorprodukte,
- Energie,
- Transport,
- Arbeitsbedingungen,
- Entsorgung.

Eine rein territoriale Bewertung würde diese Effekte teilweise ausblenden.

## 2. Umsatzsteuer ist keine Wirkungssteuer

Die deutsche Umsatzsteuer und Einfuhrumsatzsteuer sind bestehende steuerliche Systeme.

Sie erfassen steuerbare Umsätze/Importe nach gesetzlichen Regeln.

Die WÖk darf daraus nicht ableiten:

> „Weil Einfuhrumsatzsteuer existiert, werden Importe automatisch nach europäischen Nachhaltigkeitsstandards produziert.“

Das stimmt nicht.

Steuerrecht, Produktrecht, Umwelt-/Sozialrecht und Wirkungsdaten sind getrennte Ebenen.

## 3. Vorsteuerlogik als Analogie - nicht fertige Rechtslösung

Das Umsatzsteuersystem gibt Steuerinformationen entlang von Leistungsbeziehungen weiter.

WÖk hat daraus die Idee entwickelt, **Wirkungsmetadaten an Vorleistungen/Rechnungen/Produktpässe zu koppeln**.

Das ist eine Analogie/Policy-Hypothese:

`Vorleistung -> Wirkungsdaten/Provenienz -> Produktaggregation -> Endproduktprofil`.

Nicht:

`Vorsteuer = Wirkung`.

## 4. CBAM: realer CO₂-Grenzausgleich

Der EU Carbon Border Adjustment Mechanism adressiert Carbon Leakage bei bestimmten emissionsintensiven Importwaren.

Seit 1. Januar 2026 läuft die definitive Phase.

CBAM zeigt:

- eingebettete Emissionen können importbezogen regulatorisch relevant sein,
- Prozess-/Emissionsdaten und Defaultwerte sind praktisch notwendig,
- Grenzausgleich ist administrativ/rechtlich komplex.

CBAM zeigt **nicht**, dass ein allgemeiner MPD-Wirkungsgrenzausgleich bereits existiert.

## 5. DPP als Dateninfrastruktur

Der Digital Product Passport unter der ESPR-Architektur soll für betroffene Produktgruppen strukturierte Produktinformationen interoperabel zugänglich machen.

Je Produktregulierung können Daten zu Materialien, Reparierbarkeit, Umweltmerkmalen oder anderen Anforderungen vorgesehen werden.

WÖk kann solche Daten nutzen.

Aber DPP ist kein vollständiger WÖk-Wirkungspass und keine Steuerbemessung.

## 6. Herkunft ist kein Wirkungsproxy

Zwei Fabriken im selben Land können sehr unterschiedliche Wirkungen haben.

Zwei identische Prozesse in verschiedenen Ländern können ähnlich sein.

Darum:

`COUNTRY_OF_ORIGIN != IMPACT_SCORE`.

Länder-/Sektordaten dürfen höchstens als Context/Default dienen, wenn produktspezifische Daten fehlen und rechtlich/methodisch vertretbar.

## 7. Defaultwerte

Bei fehlenden Primärdaten können Defaultwerte nötig sein.

Risiken:

- schlechte Unternehmen profitieren von Durchschnitt,
- gute Unternehmen werden benachteiligt,
- Länder-/Sektorstereotype,
- Gaming durch Klassifikation.

Robuster Ansatz:

- konservative, transparente Defaultmethodik,
- Möglichkeit besserer verifizierter Primärdaten,
- regelmäßige Updates,
- Appeal/Review,
- keine willkürlichen Länderstrafwerte.

## 8. Doppelzählung

Wenn Wirkung bereits über:

- CO₂-Preis,
- CBAM,
- Produktstandard,
- nationale Steuer,
- Lieferkettenzuschlag

adressiert wird, darf dieselbe externe Wirkung nicht blind mehrfach belastet werden.

`POLICY_COHERENCE + DOUBLE_COUNTING_CHECK`.

## 9. Leakage

Ein schlechtes Wirkungsdesign kann Aktivitäten verlagern statt verbessern.

Beispiele:

- Produktion in unregulierte Jurisdiktion,
- Import halbfertiger statt fertiger Güter,
- Klassifikationswechsel,
- Umgehung über Drittländer.

Darum gehören Lieferketten-/Handelsreaktionen in die Ex-ante-Analyse.

## 10. Beispiel: Stahlprodukt

Mögliche Daten:

- Produktionsroute,
- eingebettete Emissionen,
- Strommix,
- Recyclinganteil,
- Herkunft/Prozess der Rohstoffe,
- Arbeits-/Sicherheitsnachweise soweit relevant.

CBAM adressiert derzeit den CO₂-Teil für relevante Waren.

Ein WÖk-Modell müsste prüfen, welche **zusätzlichen** Wirkungsparameter steuerlich überhaupt sinnvoll, messbar und handelspolitisch zulässig sind.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Vorleistung | eingekauftes Gut/Dienstleistung als Input weiterer Wertschöpfung |
| Importwirkung | relevante Wirkung entlang importierter Produkt-/Prozess-/Lieferkette |
| CBAM | EU-Grenzausgleich für eingebettete CO₂-Emissionen bestimmter Waren |
| DPP | Digital Product Passport unter EU-Produktregulierung |
| Defaultwert | Ersatzwert bei fehlenden Primärdaten |
| Carbon/Impact Leakage | Verlagerung negativer Wirkung statt realer Verbesserung |
| Doppelzählung | gleiche Wirkung wird mehrfach in Belastung/Bewertung erfasst |

## 12. Typische Fehlinterpretationen

### „Einfuhrumsatzsteuer garantiert EU-Nachhaltigkeitsstandard.“
Falsch.

### „Import aus Land X ist automatisch negativ.“
Falsch.

### „CBAM ist allgemeiner Wirkungsgrenzausgleich.“
Falsch.

### „DPP enthält automatisch alle WÖk-Daten.“
Falsch.

### „Defaultwerte sind neutral.“
Nicht automatisch.

## 13. WÖk-Abgrenzung

WÖk nutzt reale Daten-/Grenzausgleichsarchitekturen als Benchmarks. Der Zusatz wäre eine breitere produktbezogene Wirkungsmetadaten- und Anreizlogik. Deren Machbarkeit muss empirisch, rechtlich und administrativ getestet werden.

## 14. Quellen

- UStG: https://www.gesetze-im-internet.de/ustg_1980/
- EU CBAM: https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en
- EU ESPR: https://environment.ec.europa.eu/topics/circular-economy/ecodesign-sustainable-products-regulation_en
- Digital Product Passport: https://single-market-economy.ec.europa.eu/single-market/goods/european-standards/harmonised-standards/digital-product-passport-dpp_en
- WTO: https://www.wto.org/
- WÖk Wirkungssteuer: https://wirkungsoekonomie.de/fuer/wirkungssteuer.html

## 15. Transferaufgabe

Nimm ein importiertes Produkt mit mindestens drei Vorleistungsstufen.

Erstelle:

- Datenfluss,
- Wirkungsparameter,
- vorhandene Regulierung,
- Defaultbedarf,
- Doppelzählungsrisiken,
- Leakage-/Gamingwege,
- Primärdaten-Upgradepfad.

## 17. Prüfungsrelevanz

- Import/Vorleistung/Herkunft,
- USt/EUSt vs. Wirkung,
- CBAM/DPP,
- Defaultwerte,
- Leakage,
- Doppelzählung,
- WÖk-Modellstatus.

## 18. Sprechertext

Wenn wir Wirkung entlang von Produkten messen, landen wir schnell an der Grenze.

Was ist mit importierten Vorleistungen?

Die schlechteste Lösung wäre: Land X bekommt pauschal einen schlechten Score.

Denn Herkunft ist kein Wirkungsbeweis.

Wir brauchen möglichst produkt- und prozessbezogene Daten.

Dafür gibt es reale Vorbilder.

CBAM erfasst eingebettete CO₂-Emissionen bestimmter Importwaren. Produktpässe schaffen neue Datenstrukturen.

Die WÖk kann daran anschließen.

Aber wir müssen sauber trennen: Einfuhrumsatzsteuer ist keine Nachhaltigkeitsprüfung. CBAM ist kein allgemeiner MPD-Grenzausgleich. Und ein DPP enthält nicht automatisch alle Wirkungsdaten.

Unsere Vorsteueridee ist deshalb eine Analogie: Könnten Wirkungsmetadaten entlang von Vorleistungen weitergegeben werden - ähnlich wie andere Rechnungsinformationen?

Das müssen wir testen.

Mit Daten, Recht, Handelsregeln, Gaming und Doppelzählung.

Der Merksatz lautet:

**Bewerte die Wirkung des Prozesses und Produkts - nicht den Pass des Herkunftslandes.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

### Aktualisierung zu CBAM · 6. September 2026

Die Übergangsphase 2023-2025 ist beendet: Seit 1. Januar 2026 gilt das definitive CBAM-Regime. Konkrete Einfuhrpflichten sind nach Ware, Schwellen, Ausnahmen und dem geltenden Durchführungsrecht zu prüfen. CBAM adressiert eingebettete CO₂-Emissionen und Carbon Leakage; der WÖk-Modellvorschlag für breitere Importwirkungen darf damit weder gleichgesetzt noch als bereits geltendes Recht dargestellt werden.

Quelle: [Europäische Kommission, CBAM und definitives Regime](https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en).

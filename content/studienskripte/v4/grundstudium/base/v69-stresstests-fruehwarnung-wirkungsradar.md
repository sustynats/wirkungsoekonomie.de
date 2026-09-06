<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v69-stresstests-fruehwarnung-wirkungsradar.md curriculum=4.0 sanitized=true -->
# V69 · Stresstests, Frühwarnung und Wirkungsradar

**lecture_id:** `WOEK-G-BASE-069`  
**display_code:** `V69`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 hatte nur den geplanten Titel. v4.0 verankert Stresstests und Frühwarnung in bereits etablierten Risikodisziplinen und definiert den WÖk-Wirkungsradar als Querschnitts-/Signalarchitektur, nicht als Ersatz für Fachaufsicht oder als Prognosemaschine.

## 20-Sekunden-Einstieg

Ein Reality Check kommt nach einer Entscheidung. Ein **Stresstest** fragt vorher: Was passiert, wenn zentrale Annahmen schlechter ausfallen? Banken, Energiesysteme, Cybersecurity und Katastrophenschutz arbeiten längst mit solchen Logiken. Der WÖk-Wirkungsradar soll diese Denkweise auf Wirkungsrisiken übertragen: Signale sammeln, Schwellen beobachten, Szenarien testen und früh neu prüfen. Er ersetzt keine Fachaufsicht – er verbindet Wirkungsfelder und macht Recheck-Auslöser sichtbar.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Stresstest, Szenarioanalyse, Frühwarnindikator und Prognose unterscheiden.
2. bestehende Stress-/Frühwarnsysteme als methodische Vorbilder einordnen.
3. einen WÖk-Stresstest aus kritischen Annahmen und Schwellen aufbauen.
4. Leading und Lagging Indicators unterscheiden.
5. Recheck-/Falsifikations-Trigger definieren.
6. Cross-Domain-Signale in einem Wirkungsradar verbinden, ohne fachliche Spezialsysteme zu ersetzen.

## 1. Stresstest ist keine Vorhersage

Ein Stresstest sagt nicht:

> Genau dieses schlechte Szenario wird eintreten.

Er fragt:

> Wenn dieses plausible Belastungsszenario eintritt – hält unser System oder unsere Entscheidung?

Das Ziel ist **Robustheit**, nicht Wahrsagerei.

## 2. Bestehende Vorbilder

Stresstests existieren lange, zum Beispiel in:

- Bankenaufsicht,
- Finanzstabilität,
- Energieversorgung/Adequacy,
- Cybersecurity,
- Katastrophenschutz,
- Infrastrukturplanung,
- Klimarisikoanalyse.

WÖk erfindet Stresstests nicht. Es übernimmt die Logik für Wirkungsentscheidungen und verbindet verschiedene Wirkungsfelder.

## 3. Ein WÖk-Stresstest in sechs Schritten

### 3.1 Kritische Annahme auswählen

Welche Annahme trägt das Wirkungsurteil besonders stark?

Beispiel:

> Wasserstoff wird ab 2035 ausreichend verfügbar und bezahlbar sein.

### 3.2 Belastungsszenarien definieren

- Preis doppelt so hoch,
- Verfügbarkeit halb so hoch,
- Infrastruktur verspätet,
- Nachfrage höher als geplant.

### 3.3 Wirkpfad neu rechnen/bewerten

Welche Mechanismen kippen?

### 3.4 Schutzgrenzen prüfen

Entstehen bei Stress neue Rechts-, Sicherheits- oder ökologische Boundary-Risiken?

### 3.5 Delivery prüfen

Personal, Finanzierung, Infrastruktur, Lieferketten.

### 3.6 Entscheidung/Plan anpassen

- Reserve,
- Fallback,
- Diversifizierung,
- Trigger für Recheck.

## 4. Leading vs. Lagging Indicators

### Leading Indicator

Signal, das eine mögliche zukünftige Zustandsänderung früh anzeigt.

Beispiel:

- sinkende Ausbildungszahlen vor späterem Fachkräftemangel,
- steigende Kreditrisikoprämien vor Finanzierungskrise,
- sinkende Bodenfeuchte vor Ernteausfällen.

### Lagging Indicator

zeigt eine bereits eingetretene Folge.

Beispiel:

- Insolvenzen,
- tatsächlicher Stromausfall,
- Hospitalisierungen.

Ein Frühwarnsystem braucht oft beides.

## 5. Schwellen und Trigger

Ein Radar ist nur nützlich, wenn Signale zu einer Reaktion führen.

Darum definiert WÖk:

`RECHECK_TRIGGER`

Beispiel:

- Gasimportabhängigkeit > X,
- Wartezeit > Y,
- Grundwasserstand unter Schwelle Z,
- Kostensteigerung > 20 %,
- Evaluation zeigt kein Outcome trotz hohem Output.

Ein Trigger ist kein automatisches politisches Urteil.

Er bedeutet:

> Analyse erneut öffnen.

## 6. Cross-Domain-Signale

Viele Krisen beginnen in einem Wirkungsfeld und springen in andere.

Beispiel Dürre:

`Wasser -> Landwirtschaft -> Lebensmittelpreise -> Einkommen -> Gesundheit -> soziale Spannungen -> Haushalt/Fiskalrisiko`.

Ein WÖk-Wirkungsradar soll solche Kaskaden sichtbar machen.

Dazu braucht es:

- klare Source IDs,
- State Variables,
- Zeitbezug,
- Schwellen,
- betroffene Systeme,
- plausible Kaskaden.

## 7. Kein Alarmismus-Score

Ein Radar kann missbraucht werden, wenn jedes Signal dramatisiert wird.

Darum gelten:

- Signalstärke getrennt von Schadenspotenzial,
- Evidenz getrennt von Risikorichtung,
- keine automatische Eskalation aus einzelnen Ausreißern,
- Baseline/Trend/Saisonalität berücksichtigen,
- false positives dokumentieren,
- Recheck statt vorschnelles Urteil.

## 8. Beispiel: Pflege-Frühwarnung

Leading Indicators:

- Ausbildungsabbrüche,
- offene Stellen,
- Krankenstand,
- Teilzeitquote,
- Fluktuation,
- regionale Altersstruktur der Beschäftigten.

Lagging Indicators:

- Bettensperrungen,
- Versorgungslücken,
- Wartezeiten,
- Qualitätsereignisse.

Stresstest:

> Was passiert bei 15 % mehr Pflegebedarf und gleichzeitig 10 % weniger verfügbarem Personal?

Dann werden Fallbacks und politische Optionen sichtbar.

## 9. Beispiel: Energieversorgung

Bestehende Energiesystemanalysen prüfen Versorgungssicherheit unter Wetter-, Last-, Kraftwerks- und Netzszenarien.

WÖk ergänzt in einem Policy-Vergleich:

- Verteilungswirkung von Preis-/Kapazitätsmaßnahmen,
- Klima-/Lock-in-Risiko,
- Rohstoff-/Importabhängigkeit,
- soziale Schutzmechanismen,
- Trigger für Korrektur.

Nicht als Ersatz für Fachmodelle, sondern als **Wirkungs-Crosswalk**.

## 10. Reality Check vs. Frühwarnung

Frühwarnung:

> Ein Risiko könnte material werden.

Reality Check:

> Was ist tatsächlich passiert und wie passt es zur ursprünglichen Wirkannahme?

Beides gehört in die Lernschleife:

`Ex ante -> Stress -> Early Warning -> Action -> Reality Check -> Revision`.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Stresstest | Prüfung eines Systems/einer Entscheidung unter belastenden plausiblen Szenarien |
| Szenario | konsistente mögliche Zukunftsannahme; keine Prognose |
| Leading Indicator | früh vorlaufendes Signal |
| Lagging Indicator | nachlaufende Beobachtung eingetretener Folgen |
| Recheck Trigger | definierter Anlass zur erneuten Analyse |
| Frühwarnung | Erkennen zunehmender Risiken vor voller Materialisierung |
| Wirkungsradar | WÖk-Querschnittsarchitektur für Signale, Kaskaden und Recheck; kein Ersatz für Fachaufsicht |

## 12. Typische Fehlinterpretationen

### „Stresstest sagt die Zukunft voraus.“
Falsch.

### „Wirkungsradar ersetzt Banken-/Energie-/Cyberaufsicht.“
Falsch.

### „Ein Alarmindikator beweist Schaden.“
Falsch.

### „Mehr Warnungen = besseres Radar.“
Falsch; false positives und Signalqualität zählen.

### „Reality Check und Frühwarnung sind dasselbe.“
Falsch.

## 13. WÖk-Abgrenzung

WÖk nutzt etablierte Stresstest-/Foresight-Prinzipien und ergänzt:

- Wirkungsfeldübergreifende Kaskaden,
- MPD/Schutzgrenzen,
- Distribution,
- Policy-Coherence,
- gekoppelte Recheck-/Reality-Check-Logik.

## 14. Quellen

- OECD Strategic Foresight: https://www.oecd.org/strategic-foresight/
- UNDRR – Risk/Resilience: https://www.undrr.org/
- European Banking Authority – EU-wide stress testing: https://www.eba.europa.eu/risk-and-data-analysis/risk-analysis/eu-wide-stress-testing
- ENTSO-E – European Resource Adequacy Assessment: https://www.entsoe.eu/outlooks/eraa/
- BSI – Lageberichte zur IT-Sicherheit: https://www.bsi.bund.de/DE/Service-Navi/Publikationen/Lagebericht/lagebericht_node.html
- WÖk Wirkungsradar: https://wirkungsoekonomie.de/wirkungsradar/

## 15. Transferaufgabe

Wähle einen politischen Plan.

Definiere:

- drei kritische Annahmen,
- je zwei Stressszenarien,
- fünf Leading Indicators,
- drei Lagging Indicators,
- zwei Recheck Trigger,
- einen Fallback,
- eine mögliche Cross-Domain-Kaskade.

## 17. Prüfungsrelevanz

- Stress vs. Prognose,
- Leading/Lagging,
- Recheck Trigger,
- Cross-Domain-Kaskaden,
- false positives,
- Fachmodelle vs. WÖk-Crosswalk,
- Frühwarnung vs. Reality Check.

## 18. Sprechertext

Ein Stresstest ist keine Kristallkugel.

Er sagt nicht: So wird die Zukunft.

Er fragt: Was passiert, wenn eine wichtige Annahme schiefgeht?

Banken machen das. Energiesysteme machen das. Cybersecurity macht das.

Die WÖk übernimmt diese Idee für Wirkungsentscheidungen.

Nehmen wir eine Strategie, die stark auf günstigen Wasserstoff setzt.

Dann fragen wir: Was, wenn Wasserstoff doppelt so teuer ist? Was, wenn Infrastruktur fünf Jahre später kommt? Kippt dann nur der Preis – oder auch Klima, Versorgungssicherheit und Verteilung?

Und dann brauchen wir Frühwarnsignale.

Manche Indikatoren laufen voraus. Ausbildungsabbrüche können zum Beispiel späteren Fachkräftemangel ankündigen.

Andere zeigen Folgen erst, wenn sie da sind – etwa Bettensperrungen im Krankenhaus.

Ein Wirkungsradar verbindet solche Signale über Wirkungsfelder hinweg.

Aber es ersetzt nicht die Fachmodelle.

Wir wollen nicht besser Stromnetze rechnen als Netzbetreiber oder Bankbilanzen als Aufseher.

Wir wollen sehen, wie Risiken zwischen Systemen springen und wann wir eine Wirkungsannahme neu prüfen müssen.

Darum ist der wichtigste Output eines Radars oft kein Alarm.

Es ist ein Recheck Trigger.

**Ab hier bitte Analyse erneut öffnen.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

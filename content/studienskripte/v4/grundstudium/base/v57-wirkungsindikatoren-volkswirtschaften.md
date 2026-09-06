<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ee7fec6b8a738b78bda9b989eba252963a325daf path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v57-wirkungsindikatoren-volkswirtschaften.md curriculum=4.0 sanitized=true -->
# V57 · Wirkungsindikatoren für Volkswirtschaften: BIP, DNS, SDGs, Wohlfahrt und Resilienz

**lecture_id:** `WOEK-G-BASE-057`  
**display_code:** `V57`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**source_version:** `2026-08-21.2`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 integriert bestehende Makroindikatorenarchitekturen und beseitigt die Abkürzungskollision `NWI`: In öffentlicher Lehre bezeichnet `NWI` den etablierten **Nationalen Wohlfahrtsindex**. Der WÖk-interne Begriff „Netto-Wirkungs-Index“ wird nicht mit der nackten Abkürzung `NWI` bezeichnet.

## 20-Sekunden-Einstieg

Eine Volkswirtschaft braucht mehr als eine Kennzahl. Das BIP misst wirtschaftliche Aktivität. Die DNS beobachtet mit aktuell 82 Indikatoren nationale Nachhaltigkeitsziele. Eurostat verfolgt EU-SDG-Fortschritt. Der **Nationale Wohlfahrtsindex (NWI)** versucht Wohlfahrtsentwicklung jenseits des BIP abzubilden. WÖk ersetzt diese Systeme nicht, sondern ordnet sie als Daten- und Referenzquellen in ein mehrdimensionales Wirkungsdashboard ein.

## Lernziele

Nach dieser Vorlesung kannst du:

1. BIP/VGR, DNS-, SDG-, Wohlfahrts- und Resilienzindikatoren unterscheiden.
2. nationale, europäische und globale Monitoringebenen funktional trennen.
3. erklären, warum kein einzelner Makroindikator „die Wirkung einer Volkswirtschaft“ vollständig misst.
4. State Variables und Datenfunktionen für ein Makrodashboard definieren.
5. Verteilung, Bestände, Resilienz und ökologische Grenzen neben Flussgrößen berücksichtigen.
6. den **Nationalen Wohlfahrtsindex (NWI)** eindeutig vom WÖk-internen Aggregationskonzept „Netto-Wirkungs-Index“ unterscheiden.

## 1. Warum Makrosteuerung ein Dashboard braucht

Eine Volkswirtschaft ist gleichzeitig Produktions-, Einkommens-, Infrastruktur-, Ressourcen-, Gesundheits-, Bildungs- und Institutionensystem. Eine Zahl kann diese Zustände nicht vollständig abbilden.

Darum gilt:

> **Makro-Wirkung braucht ein mehrdimensionales Dashboard – nicht die Suche nach einer einzigen magischen Kennzahl.**

## 2. BIP / VGR: wichtige Aktivitätsmessung

BIP und Volkswirtschaftliche Gesamtrechnungen informieren über Produktion, Einkommen, Konsum, Investitionen, Staatsaktivität und Außenwirtschaft.

Sie sagen aber nicht automatisch:

- wie Einkommen verteilt sind,
- ob Naturkapital sinkt,
- ob Gesundheit besser wird,
- ob Infrastruktur resilient ist,
- ob Aktivität nur Schäden repariert.

BIP ist deshalb wichtig – aber nicht hinreichend als Wohlstands- oder Wirkungsmaß.

## 3. DNS-Indikatoren

Deutschland verfügt über ein nationales Nachhaltigkeitsmonitoring. Destatis weist aktuell **82 Indikatoren der Deutschen Nachhaltigkeitsstrategie** aus.

Fallbezogen können sie in WÖk dienen als:

- `BASELINE`
- `TARGET`
- `OUTCOME`
- `CONTEXT`
- `DISTRIBUTION`
- `BOUNDARY`
- `REALITY_CHECK`
- `COUNTERFACTUAL_INPUT`

Aber:

`INDICATOR != IMPACT`

und

`TARGET ALIGNMENT != CAUSALITY`.

Ein positiver nationaler Trend beweist nicht den Beitrag einer konkreten Regierung oder Maßnahme.

## 4. EU- und UN-SDG-Monitoring

Eurostat und die UN führen eigene SDG-Monitoringarchitekturen. Sie sind nützlich für Vergleichbarkeit, Trends und internationalen Kontext.

Für konkrete Wirkungsfragen muss aber geprüft werden, ob Definition, Datenjahr, räumliche Ebene und Systemgrenze passen.

## 5. Nationaler Wohlfahrtsindex (NWI)

Der **Nationale Wohlfahrtsindex (NWI)** ist ein in Deutschland etablierter Beyond-GDP-Ansatz, der mehrere Komponenten von Wohlfahrt bzw. Wohlfahrtsverlusten zusammenführt, unter anderem Konsum, Einkommensverteilung, unbezahlte Arbeit sowie Umwelt- und Sozialkosten.

Wichtig für die WÖk-Terminologie:

> **`NWI` bedeutet in öffentlicher Lehre und Kommunikation: Nationaler Wohlfahrtsindex.**

Das WÖk-interne Konzept, das historisch ebenfalls als „Netto-Wirkungs-Index“ bezeichnet wurde, darf **nicht** mit derselben nackten Abkürzung `NWI` auftreten. Wenn dieses WÖk-Konzept benötigt wird, ist der Begriff auszuschreiben oder eine eindeutig WÖk-spezifische Kennung zu verwenden.

Damit gilt:

`NWI = Nationaler Wohlfahrtsindex`

und nicht:

`NWI = Netto-Wirkungs-Index`.

Diese Disambiguierung verhindert, dass ein etablierter externer Index mit einem WÖk-eigenen Aggregationsmodell verwechselt wird.

## 6. Andere Wohlfahrts-/Well-being-Rahmen

Auch OECD- und andere Beyond-GDP-Frameworks betrachten mehrere Dimensionen. Das zeigt: Mehrdimensionale Wohlstandsmessung existiert bereits außerhalb der WÖk.

WÖk-Zusatz kann darin liegen, vorhandene Zustands- und Wohlstandsindikatoren mit Problem Review, Goal Review, Kausalpfaden, Verteilung, Schutzgrenzen, Optionsvergleich und Reality Check zu verbinden.

## 7. Resilienz und Bestände

Viele kritische Zustände sind keine jährlichen Flussgrößen:

- Netzreserven,
- Wasserverfügbarkeit,
- Bodenfruchtbarkeit,
- Krankenhauskapazität,
- strategische Abhängigkeiten,
- Kompetenzbestände,
- Vertrauen und institutionelle Korrekturfähigkeit.

Diese **Bestände/Kapazitäten** müssen neben Flussgrößen beobachtet werden.

## 8. Verteilung

Durchschnittswerte können Belastungen einzelner Gruppen verdecken. Ein Makrodashboard braucht deshalb Verteilungsinformation, etwa nach Einkommen/Vermögen, Region, Alter/Generation, Zugang zu Daseinsvorsorge und Risikoexposition.

`GOOD_AVERAGE != GOOD_DISTRIBUTION`.

## 9. Beispiel eines WÖk-Makrodashboards

Ein Dashboard kann unter anderem State Variables aus folgenden Bereichen enthalten:

### Wirtschaft
Produktivität, Investitionen, reale Einkommen, Beschäftigung.

### Mensch
Gesundheit, Bildung, Sicherheit, Teilhabe, Verteilung.

### Planet
Klima, Ressourcen, Biodiversität, Schadstoffe.

### Demokratie/Institutionen
Rechtsstaatlichkeit, Teilhabe, Informations- und Korrekturfähigkeit.

### Resilienz
Versorgungs-, Infrastruktur-, Finanz- und Anpassungskapazität.

Dabei muss Doppelzählung vermieden werden. Dasselbe Phänomen darf nicht mehrfach addiert werden, nur weil es in mehreren Dimensionen relevant ist.

## 10. Datenfunktionen statt Kennzahlenmagie

Beispiel Arbeitslosigkeit:

- `CONTEXT` für Konjunkturlage,
- `OUTCOME` einer arbeitsmarktpolitischen Reform,
- `DISTRIBUTION` nach Region/Alter,
- `COUNTERFACTUAL_INPUT` für Evaluation.

Die gleiche Kennzahl kann je Fall eine andere Rolle haben. Funktion und Kausalstatus müssen explizit sein.

## 11. Keine allgemeine Länder-Gesamtnote ohne Zweck

Eine Weltrangliste „beste Volkswirtschaft“ setzt normative Gewichte, Datenentscheidungen und Systemgrenzen voraus. Ohne konkreten Entscheidungszweck kann sie mehr Scheingenauigkeit als Erkenntnis erzeugen.

WÖk bevorzugt deshalb Profile, Teilindikatoren, Grenzen, Unsicherheit und ggf. entscheidungsbezogene Optionsvergleiche statt pauschaler Landes-Endnoten.

## 12. Beispiel Energiekrise

BIP allein zeigt nur einen Ausschnitt. Ein Wirkungsprofil könnte zusätzlich beobachten:

- Energiepreise,
- Versorgungssicherheit,
- Haushaltsbelastung nach Einkommen,
- Industrieproduktion,
- Importabhängigkeit,
- Emissionen,
- Investitionen in Effizienz/Erneuerbare,
- Speicher-/Reservebestände.

So wird sichtbar, ob kurzfristige Krisenreaktion langfristige Resilienz erhöht oder neue Lock-ins erzeugt.

## 13. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| BIP/VGR | gesamtwirtschaftliche Aktivitäts- und Rechnungsgrößen |
| Makroindikator | Kennzahl für einen gesamtwirtschaftlichen/gesellschaftlichen Zustand |
| Dashboard | mehrdimensionale Zusammenstellung von State Variables/Indikatoren |
| Flussgröße | Aktivität innerhalb eines Zeitraums |
| Bestandsgröße | vorhandener Zustand/Kapazität |
| Nationaler Wohlfahrtsindex (NWI) | etablierter deutscher Beyond-GDP-Index |
| „Netto-Wirkungs-Index“ | WÖk-internes Aggregationskonzept; öffentlich nicht mit `NWI` abkürzen |
| Resilienzindikator | Beobachtungsgröße für Robustheit/Anpassungs-/Erholungsfähigkeit |
| Distribution | Verteilung von Nutzen, Belastung oder Zustand über Gruppen/Räume |

## 14. Typische Fehlinterpretationen

**„Das BIP muss abgeschafft werden.“** – Falsch. Es bleibt eine wichtige Aktivitätskennzahl.

**„82 DNS-Indikatoren sind 82 politische Wirkungen.“** – Falsch.

**„Ein Dashboard braucht am Ende eine Gesamtnote.“** – Nein.

**„NWI ist in der WÖk der Netto-Wirkungs-Index.“** – Für öffentliche v4-Lehre falsch. `NWI` ist der Nationale Wohlfahrtsindex.

**„Ein positiver Makrotrend beweist Regierungserfolg.“** – Falsch; Attribution fehlt.

## 15. WÖk-Abgrenzung

WÖk kann bestehende Makro-, Nachhaltigkeits-, Wohlfahrts- und Resilienzindikatoren in eine gemeinsame Daten-/Wirkungsontologie einordnen und mit Problem-, Ziel-, Policy-Coherence-, Options- und Reality-Check-Fragen verbinden. Sie soll bestehende Statistiksysteme nicht duplizieren oder umbenennen.

## 16. Primär-/Referenzquellen

- Destatis DNS-Indikatoren: https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html
- Umweltbundesamt, Nationaler Wohlfahrtsindex: https://www.umweltbundesamt.de/daten/umweltindikatoren/indikator-nationaler-wohlfahrtsindex
- OECD Well-being and Beyond GDP: https://www.oecd.org/en/topics/well-being-and-beyond-gdp.html
- Eurostat SDG Monitoring: https://ec.europa.eu/eurostat/web/sdi
- UN SDG indicators: https://unstats.un.org/sdgs/indicators/indicators-list/

**Freshness:** Indikatorenzahlen, Methodenstände und internationale Monitoringsysteme vor Prüfung/Veröffentlichung versioniert revalidieren.

## 17. Transferaufgabe

Baue ein Makrodashboard mit höchstens 20 State Variables aus Wirtschaft, Mensch, Planet, Demokratie/Institutionen und Resilienz. Markiere für jeden Indikator:

- Datenquelle,
- Datenfunktion,
- räumliche Ebene,
- Verteilungsebene,
- Aktualität,
- Kausalstatus,
- mögliche Doppelzählung.

## 19. Prüfungsrelevanz

Prüfungsfähig sind BIP-vs.-Wohlstand, DNS-/SDG-Monitoring, Nationaler Wohlfahrtsindex, `NWI`-Disambiguierung, Dashboardlogik, Fluss-vs.-Bestand, Datenfunktionen, Verteilung und Attribution.

## 20. Sprechertext

Wenn wir über Wohlstand sprechen, suchen wir gern nach einer Zahl. Das BIP ist dafür sehr bekannt. Es misst wirtschaftliche Aktivität – und das ist wichtig. Aber eine Volkswirtschaft kann gleichzeitig wachsen und trotzdem Bodenfruchtbarkeit verlieren, Menschen ungleich belasten oder kritische Infrastruktur fragiler machen.

Darum schauen wir auf mehrere Ebenen: DNS-Indikatoren, europäische und globale SDG-Daten, Wohlfahrtsmaße, Verteilung und Resilienz.

Und hier gibt es eine wichtige sprachliche Falle. `NWI` steht in Deutschland bereits für den **Nationalen Wohlfahrtsindex**. Die WÖk hat historisch ebenfalls mit dem Ausdruck „Netto-Wirkungs-Index“ gearbeitet. In v4.0 benutzen wir dafür nicht dieselbe nackte Abkürzung. Sonst würden wir einen etablierten externen Index mit einem WÖk-Modell vermischen.

Der eigentliche Punkt ist aber größer: Wir brauchen kein Duell der Kennzahlen. Wir brauchen ein gutes Dashboard, in dem jede Größe eine klare Funktion hat. Was ist Baseline? Was ist Target? Was ist Outcome? Was ist nur Kontext? Wo ist Verteilung? Wo liegt eine Schutzgrenze? Und was wissen wir über Ursache?

So wird aus vielen Zahlen kein Zahlensalat, sondern eine belastbare Steuerungsgrundlage.

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

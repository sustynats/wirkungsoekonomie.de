<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/gov-06-dns-indikatoren-und-monitoring.md curriculum=4.0 sanitized=true -->
# GOV-06 · DNS-Indikatoren und Monitoring: Zielwert ist nicht Wirkung

**lecture_id:** `WOEK-G-GOV-IND-01`  
**display_code:** `GOV-06`  
**curriculum_version:** `4.0`  
**part:** 4 · Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur  
**module:** G4.2 · DNS-Governance und Monitoring  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**source_version:** `2026-08-21.2`  
**reviewed_at:** 2026-08-21  
**change_reason:** DNS-Indikatoren werden als staatliche Beobachtungs- und Monitoringarchitektur gelehrt. v4.0 trennt Zustand, Beobachtung, Outcome, Wirkungspotenzial, Kausalität und Attribution strikt und korrigiert die frühere Gleichsetzung von Baseline und Gegenfaktum.

## 20-Sekunden-Einstieg

Destatis weist aktuell **82 Indikatoren der Deutschen Nachhaltigkeitsstrategie** aus. Sie zeigen, wie sich ausgewählte Zustände entwickeln und ob Deutschland politischen Zielwerten näherkommt. Das ist wertvoll – aber ein Indikator ist keine Wirkung und ein Trend ist kein Beweis für die Wirkung einer konkreten Maßnahme. WÖk ordnet amtliche Indikatoren deshalb mit einer expliziten Datenfunktion in eine Kausal- und Lernarchitektur ein.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Ziel, Indikator, Observation, Output, Outcome, Wirkung, Wirkungspotenzial und Attribution unterscheiden.
2. DNS-Indikatoren in `MasterItem -> StateVariable -> Indicator -> Observation -> Analysis/RealityCheck` einordnen.
3. Baseline und Gegenfaktum sauber trennen.
4. einem Indikator fallbezogen Datenfunktionen zuweisen.
5. erklären, warum `Indicator != Impact`, `Output != Outcome`, `Observation != Attribution` und `Target Alignment != Causality` harte Regeln sind.

## 1. Die sechs Ebenen

### Ziel / Target
Ein politisch oder fachlich gewünschter Zustand.

### Indikator
Eine Beobachtungsgröße, mit der ein Zustand oder Trend operationalisiert wird.

### Observation
Der konkrete Messwert eines Indikators zu einem Zeitpunkt oder Zeitraum.

### Output
Eine unmittelbar erbrachte Aktivität oder Leistung, zum Beispiel Zahl geförderter Anlagen oder durchgeführter Beratungen.

### Outcome
Eine tatsächlich beobachtete Zustandsänderung bei relevanten Menschen, Systemen, Institutionen oder Ökosystemen.

### Wirkung / Impact
Im WÖk-Sinn die fachlich relevante Zustandsänderung einschließlich ihrer Richtung, Reichweite, Verteilung und Systemfolgen. **Eine Kausalbehauptung darüber, dass eine konkrete Maßnahme diese Zustandsänderung verursacht hat, benötigt zusätzlich Gegenfaktum und Attribution.**

`Wirkungspotenzial` ist davon getrennt: Es ist eine **ex-ante** begründete Erwartung darüber, welche Zustandsänderungen unter bestimmten Mechanismen und Bedingungen eintreten könnten. Potenzial ist nicht eingetretene Wirkung.

## 2. DNS-Indikatoren als staatliche Monitoringarchitektur

Das Statistische Bundesamt weist aktuell **82 DNS-Indikatoren** aus. Die Bundesregierung legt Ziele und Indikatorensystem politisch fest; Destatis unterstützt fachlich unabhängig die statistische Messung, koordiniert Daten und veröffentlicht Indikatorenberichte.

Damit entsteht eine starke staatliche Monitoringfunktion. Aber auch hochwertige amtliche Statistik ist nicht automatisch Kausalitätsnachweis.

## 3. Baseline ist nicht Gegenfaktum

Diese Begriffe werden häufig verwechselt.

**Baseline** = beobachteter Ausgangszustand bzw. Referenzmessung vor oder zu Beginn einer Intervention.

**Gegenfaktum / Counterfactual** = begründete Schätzung, wie sich der relevante Zustand **ohne** die betrachtete Intervention entwickelt hätte.

Eine Baseline kann ein Input für das Gegenfaktum sein. Sie ist aber nicht automatisch das Gegenfaktum, weil Trends, andere Maßnahmen, Konjunktur, Technik, Wetter, Demografie oder externe Schocks den Zustand auch ohne die Intervention verändert hätten.

## 4. Registerarchitektur

Die WÖk trennt Wirkungsontologie und Beobachtungsontologie:

`MasterItem -> StateVariable -> Indicator -> Observation -> Analysis / RealityCheck`

- `MasterItem`: Was betrachten wir?
- `StateVariable`: Welcher fachlich relevante Zustand soll beobachtet werden?
- `Indicator`: Womit operationalisieren wir ihn?
- `Observation`: Was wurde tatsächlich gemessen?
- `Analysis/RealityCheck`: Wie wird die Beobachtung in den Wirkungsfall eingeordnet und später überprüft?

Ein DNS-Indikator kann ein sehr guter externer Indikator sein. Er wird allein dadurch weder zur WÖk-Bewertung noch zum Kausalitätsbeweis.

## 5. Datenfunktionen

Ein Indikator kann fallbezogen eine oder mehrere Funktionen haben:

- `BASELINE`
- `TARGET`
- `OUTCOME`
- `DISTRIBUTION`
- `BOUNDARY`
- `CONTEXT`
- `IMPLEMENTATION`
- `OUTPUT`
- `REALITY_CHECK`
- `COUNTERFACTUAL_INPUT`

Die Funktion muss explizit und begründet sein. `COUNTERFACTUAL_INPUT` bedeutet nur: Die Daten helfen bei der Konstruktion eines Gegenfaktums. Sie **sind** noch nicht das Gegenfaktum.

## 6. Beispiel: Anteil erneuerbarer Energien

Angenommen, ein Indikator misst den Anteil erneuerbarer Energien am Stromverbrauch.

- Vor einer Reform kann er `BASELINE` sein.
- Ein politischer Zielwert kann `TARGET` sein.
- Eine spätere Messung kann `OUTCOME` bzw. Teil eines `REALITY_CHECK` sein.

Steigt der Anteil, ist das eine beobachtete Zustandsänderung. Für die Frage, welchen Anteil **diese eine Reform** verursacht hat, müssen aber andere Einflüsse berücksichtigt werden, etwa Preise, Netzausbau, Wetter, Nachfrage, andere Gesetze, europäische Stromflüsse oder technischer Fortschritt.

Darum:

`OBSERVATION -> keine automatische ATTRIBUTION`

## 7. Der vollständige WÖk-Pfad

Für politische Wirkungsfälle gilt nicht die verkürzte Kette „Problem -> Baseline -> Ziel -> Maßnahme -> Indikator -> Wirkung“.

Die saubere Reihenfolge lautet:

`Fact/Source`
`-> Problem Review`
`-> Baseline`
`-> Goal Review`
`-> Intervention / Option`
`-> Mechanismus`
`-> StateVariable`
`-> Indicator`
`-> Observation / Outcome`
`-> Counterfactual comparison`
`-> Attribution analysis`
`-> Reality Check`
`-> Revision`

Dazu kommen Wirkungen 1.–3. Ordnung, Kaskaden, Verteilung, Resilienz, Rebound, Spillover, Delivery, Policy Coherence und Schutzgrenzen.

## 8. Trendbewertung ist nicht Maßnahmenbewertung

Ein Indikatorenbericht kann zeigen, ob sich Deutschland einem Ziel nähert. Das ist eine **Trend- und Zielerreichungsbewertung**.

Eine Maßnahmenbewertung fragt zusätzlich:

- Hat Maßnahme X den Trend verändert?
- Wie groß war ihr Beitrag?
- Welche Nebenwirkungen entstanden?
- Welche Gruppen profitierten oder wurden belastet?
- Welche Alternative wäre robuster gewesen?
- Welche Beobachtung würde unsere ursprüngliche Annahme widerlegen?

Beide Ebenen sind wichtig. Sie dürfen nicht vermischt werden.

## 9. Datenqualität und Grenzen

Auch amtliche Indikatoren können Grenzen haben:

- zeitliche Verzögerung,
- Aggregation,
- fehlende Verteilungsinformation,
- Proxy-Charakter,
- Definitionswechsel,
- methodische Brüche,
- unvollständige räumliche oder gruppenbezogene Abdeckung.

Deshalb dokumentiert WÖk Definition, Einheit, Quelle, Aktualität, Zeitreihe, räumliche Ebene, Population, methodische Brüche und Unsicherheit.

## 10. Begriffsbox

| Begriff | Präzise Bedeutung |
|---|---|
| Target | gewünschter Zielzustand oder Zielwert |
| Indicator | Beobachtungsgröße |
| Observation | konkreter Messwert |
| Output | unmittelbar erbrachte Aktivität/Leistung |
| Outcome | tatsächlich beobachtete Zustandsänderung |
| Wirkung / Impact | fachlich relevante Zustandsänderung; Kausalzurechnung zu einer Maßnahme separat nachweisen |
| Wirkungspotenzial | ex-ante begründete Erwartung möglicher Wirkungen unter Bedingungen |
| Attribution | begründete Zurechnung einer beobachteten Veränderung zu Ursache/Maßnahme |
| Baseline | beobachteter Ausgangszustand / Referenzmessung |
| Counterfactual | geschätzter Verlauf ohne die betrachtete Intervention |
| StateVariable | fachlich definierter Zustand, der beobachtet werden soll |
| Reality Check | spätere Prüfung von Erwartung, Beobachtung, Attribution und Lernbedarf |

## 11. Typische Fehlinterpretationen

**„82 DNS-Indikatoren bedeuten 82 Wirkungen.“** – Falsch. Es sind Beobachtungsgrößen.

**„Ein positiver Trend beweist Regierungserfolg.“** – Falsch. Ein Trend ist noch keine Attribution.

**„Baseline = Counterfactual.“** – Falsch. Das Gegenfaktum ist eine Schätzung des Verlaufs ohne Intervention.

**„Output = Outcome.“** – Falsch. Aktivität ist nicht automatisch Zustandsänderung.

**„Wenn ein Indikator im DNS-Set steht, passt er automatisch zu jedem WÖk-Fall.“** – Falsch. Relevanz hängt von StateVariable, Mechanismus und Datenfunktion ab.

## 12. WÖk-Abgrenzung

WÖk ersetzt amtliche Statistik nicht. Der Zusatz ist die Einordnung vorhandener Daten in eine explizite Problem-, Ziel-, Kausal-, Options-, Attributions- und Lernarchitektur. Amtliche DNS-Daten können dabei sehr wertvoll sein – aber ihre Funktion muss für jeden Fall benannt werden.

## 13. Primärquellen und Provenienz

1. **Statistisches Bundesamt – Nachhaltigkeitsindikatoren**  
   https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html
2. **Statistisches Bundesamt – Deutsche Nachhaltigkeitsstrategie / Monitoring**  
   https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/Deutsche-Nachhaltigkeit/_inhalt.html
3. **Bundesregierung – Steuerung der Deutschen Nachhaltigkeitsstrategie**  
   https://www.bundesregierung.de/breg-de/schwerpunkte/wirksam-regieren/steuerung-nachhaltigkeitsstrategie-419776

**Quellenfunktion:** Destatis = `PRIMARY_STATISTICAL_SOURCE`; Bundesregierung = `GOVERNANCE/TARGET_CONTEXT`. Keine Quelle erhält automatisch `ATTRIBUTION_PROOF`.

**Freshness-Regel:** Die Zahl der DNS-Indikatoren ist `VERSION_SENSITIVE` und vor Prüfung/Veröffentlichung gegen den aktuellen Destatis-Stand zu revalidieren.

## 14. Transferaufgabe

Wähle einen DNS-Indikator und fülle aus:

| Element | Einordnung |
|---|---|
| MasterItem | Was betrachten wir? |
| StateVariable | Welcher Zustand? |
| Indicator | Welche Beobachtungsgröße? |
| Baseline | Welcher beobachtete Ausgangswert? |
| Target | Welcher Zielwert? |
| Outcome Observation | Welche spätere Messung? |
| Counterfactual Input | Welche Daten helfen bei „ohne Maßnahme“? |
| Attribution Gap | Was fehlt für die Kausalbehauptung? |
| Reality Check | Wann und woran wird revidiert? |

## 16. Prüfungsrelevanz

Prüfungsfähig sind die Ebenentrennung, Registerkette, Datenfunktionen, Baseline-vs.-Counterfactual, Output-vs.-Outcome, Indicator-vs.-Impact, Wirkung-vs.-Wirkungspotenzial und Observation-vs.-Attribution.

## 17. Sprechertext

82 Indikatoren. Das klingt erst einmal nach 82 Wirkungen. Aber genau das wäre die falsche Schlussfolgerung. Ein Indikator ist zunächst nur eine Beobachtungsgröße. Er kann zeigen, ob sich ein Zustand verändert und ob ein politischer Zielwert näher rückt. Er sagt noch nicht, welche Maßnahme diese Veränderung verursacht hat. Und er ist auch nicht automatisch der richtige Indikator für jeden Wirkungsfall.

Deshalb trennen wir in der WÖk sehr sauber: Was betrachten wir? Welcher Zustand ist relevant? Welcher Indikator beobachtet ihn? Was wurde tatsächlich gemessen? Wie hätte sich der Zustand ohne die Maßnahme entwickelt? Und welchen Anteil können wir der Maßnahme plausibel zurechnen?

Ein weiterer häufiger Fehler ist Baseline gleich Gegenfaktum. Die Baseline ist der beobachtete Ausgangspunkt. Das Gegenfaktum ist die geschätzte Entwicklung ohne Intervention. Wenn sich ein Trend ohnehin verändert hätte, reicht der Vorher-Wert nicht.

Genau hier ist die DNS sehr wertvoll. Sie liefert Ziele, Indikatoren und amtliches Monitoring. Die WÖk ersetzt das nicht. Sie ergänzt die Frage: Welche Datenfunktion hat dieser Indikator im konkreten Fall – Baseline, Target, Outcome, Kontext, Verteilung, Reality Check oder Input für das Gegenfaktum? Und was fehlt noch, bevor wir eine Kausalbehauptung machen dürfen?

So wird aus einer Zahl keine vorschnelle Wirkungsgeschichte, sondern eine überprüfbare Lernarchitektur.

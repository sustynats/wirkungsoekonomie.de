<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ee7fec6b8a738b78bda9b989eba252963a325daf path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v29-masterregister-wirkindikatorenregister.md curriculum=4.0 sanitized=true -->
# V29 · WÖk-Masterregister, Wirkindikatorenregister, Benchmarks und Archetypen

**lecture_id:** `WOEK-G-BASE-029`  
**display_code:** `V29`  
**curriculum_version:** `4.0`  
**legacy_source:** `content/lehrgaenge/woek-g-v29.md` @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 trennt die WÖk-Wirkungsontologie (Masterregister) von der Beobachtungsontologie (Wirkindikatorenregister), ergänzt State Variables und Datenfunktionen und verhindert, dass Indikator, Benchmark oder Archetyp als Wirkung/Score missverstanden werden.

## 20-Sekunden-Einstieg

Das WÖk-Masterregister beantwortet **„Was betrachten wir?“** Das Wirkindikatorenregister beantwortet **„Womit beobachten wir diesen Zustand?“** Dazwischen liegt die State Variable – der konkret relevante Zustand. Ein Benchmark hilft beim Vergleich, ein Archetyp beim Wiederverwenden typischer Wirkmechanismen. Keines dieser Dinge ist automatisch ein Score oder eine Wirkung. Die Kernkette lautet: `MasterItem -> StateVariable -> Indicator -> Observation -> Analysis / RealityCheck`.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Masterregister und Wirkindikatorenregister funktional trennen.
2. MasterItem, StateVariable, Indicator und Observation unterscheiden.
3. Benchmarks korrekt als Vergleichsreferenzen statt normative Wahrheit nutzen.
4. Archetypen als wiederverwendbare Wirkmechanismus-/Fallmuster einsetzen, ohne Fallspezifik zu verlieren.
5. externe Indikatoren wie DNS/ESRS/DPP-Daten sauber in das WÖk-Registermodell anbinden.
6. erkennen, wann ein fehlender Indikator eine echte Datenlücke und wann nur eine Modelllücke ist.

## 1. Warum zwei Register nötig sind

Wenn wir „Wirkungsindikatoren“ direkt in eine einzige große Liste schreiben, vermischen wir zwei Fragen:

1. Welcher Zustand ist überhaupt fachlich relevant?
2. Welche konkrete Messgröße kann diesen Zustand beobachten?

Darum trennt v4.0:

### Masterregister

Eine Wirkungsontologie.

`MasterItem = Was ist ein relevanter Wirkungsgegenstand?`

Beispiele:

- Patientensicherheit,
- Bodenfruchtbarkeit,
- Versorgungssicherheit,
- Diskursstabilität,
- Lieferkettenresilienz.

### Wirkindikatorenregister

Eine Beobachtungsontologie.

`Indicator = Welche Messgröße beobachtet eine definierte State Variable?`

Beispiele:

- vermeidbare Komplikationsrate,
- Humusgehalt,
- gesicherte Leistung,
- Medienpluralitätsindikator,
- Lieferzeit-/Konzentrationsmaß.

## 2. Die fehlende Mitte: State Variable

Ein MasterItem kann zu breit sein, um direkt gemessen zu werden.

Beispiel:

`MasterItem: Versorgungssicherheit`

Mögliche State Variables:

- verfügbare gesicherte Leistung,
- Ausfallwahrscheinlichkeit,
- Wiederherstellungszeit,
- Importabhängigkeit,
- Flexibilitätsreserve.

Erst danach wählt man Indikatoren.

Darum ist die vollständige Kette:

`MasterItem -> StateVariable -> Indicator -> Observation -> Analysis/RealityCheck`.

## 3. Indicator vs. Observation

Ein Indicator ist die **Definition** der Messgröße.

Eine Observation ist der **konkrete Messwert** zu Zeit/Ort/Population.

Beispiel:

Indicator: durchschnittliche Wartezeit bis zur ambulanten Facharztversorgung.

Observation: 31 Tage im Jahr X für Region Y nach definierter Messmethode.

Diese Trennung ist für Versionierung und Datenqualität entscheidend.

## 4. Ein externer Indikator kann mehrfach genutzt werden

Ein DNS-Indikator, ESRS-Metric oder amtlicher Statistikwert muss nicht „WÖk-eigen“ sein, um nützlich zu sein.

WÖk sollte bestehende gute Indikatoren wiederverwenden.

Die Frage lautet:

- passt die Definition zur State Variable?
- passt Raum/Zeit/Population?
- welche Datenfunktion erfüllt der Wert?
- wie aktuell/verlässlich ist er?

Mögliche Datenfunktionen:

- `BASELINE`,
- `TARGET`,
- `OUTCOME`,
- `DISTRIBUTION`,
- `BOUNDARY`,
- `CONTEXT`,
- `IMPLEMENTATION`,
- `OUTPUT`,
- `REALITY_CHECK`,
- `COUNTERFACTUAL_INPUT`.

## 5. Benchmarks: Vergleich, nicht Wahrheit

Ein Benchmark kann zeigen:

- typische Branchenwerte,
- technische Bestwerte,
- gesetzliche Mindestanforderungen,
- wissenschaftliche Schwellen,
- historische Entwicklung,
- Peer-Gruppen.

Aber Benchmarks haben Voraussetzungen:

- vergleichbare Definition,
- vergleichbarer Systemrand,
- gleiche Einheit,
- vergleichbarer Zeitraum,
- transparente Quelle.

Ein Branchenmittelwert ist kein moralischer Grenzwert.

Und ein Bestwert ist nicht automatisch überall erreichbar.

## 6. Archetypen: Wiederverwendung ohne Template-Falle

Wirkungsfälle ähneln sich.

Beispiel „Effizienztechnologie“:

Typische Mechanismen:

- weniger Ressource je Nutzung,
- mögliche Kostensenkung,
- Rebound,
- Skaleneffekte,
- Verlagerung in Lieferketten.

Ein Archetyp kann diese typischen Pfade als Prüfhilfe bereitstellen.

Aber:

`ARCHETYPE != CASE JUDGMENT`.

Der konkrete Fall braucht eigene:

- Quelle,
- Problem Review,
- Goal Review,
- Mechanismusprüfung,
- Daten,
- Evidenz,
- Verteilung,
- Unsicherheit.

## 7. Beispiel: Pflegepersonal

### MasterItem

Versorgungsqualität und Zugang.

### State Variables

- verfügbare qualifizierte Pflegezeit,
- Versorgungskontinuität,
- vermeidbare Komplikationen,
- regionale Erreichbarkeit.

### Indikatoren

- Vollzeitäquivalente je Pflegebedarf,
- Fluktuationsrate,
- ungeplante Wiedereinweisungen,
- regionale Weg-/Wartezeiten.

### Observations

Konkrete Messwerte nach Region, Zeit und Einrichtungstyp.

### Analyse

Erst hier wird geprüft, welche Veränderung auf eine konkrete Reform plausibel zurückgeht.

## 8. Wenn kein guter Indikator existiert

Nicht jede Wirkung hat sofort einen brauchbaren Indikator.

Dann gibt es drei Möglichkeiten:

1. vorhandenen Proxy verwenden – klar als Proxy markieren,
2. neue Messgröße definieren,
3. Bereich als `DATA_GAP/NOT_ASSESSABLE` offen lassen.

Was nicht zulässig ist:

- einen unpassenden Indikator nur verwenden, weil er verfügbar ist,
- fehlende Daten als Nullwirkung behandeln,
- qualitative Evidenz systematisch ignorieren.

## 9. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| MasterItem | fachlich relevanter Wirkungsgegenstand |
| StateVariable | konkret relevanter Zustand, der sich verändern kann |
| Indicator | definierte Beobachtungsgröße für eine State Variable |
| Observation | konkreter Messwert |
| Benchmark | Vergleichsreferenz mit definiertem Systemrand |
| Archetyp | wiederverwendbares typisches Wirkmechanismus-/Fallmuster |
| Proxy | Ersatzindikator, wenn direkte Messung fehlt |
| Data Gap | relevante Information ist nicht ausreichend verfügbar |

## 10. Typische Fehlinterpretationen

### „MasterItem und Indikator sind dasselbe.“
Falsch.

### „Jeder Indikator braucht eine neue WÖk-Messung.“
Falsch. Amtliche/externe Daten sollen wiederverwendet werden, wenn sie passen.

### „Benchmark über Durchschnitt = positive Wirkung.“
Falsch. Benchmark und normative Bewertung sind verschiedene Ebenen.

### „Archetyp kann automatisch Fallurteile erzeugen.“
Falsch. Er ist eine Prüfhilfe.

### „Keine Daten = keine Wirkung.“
Falsch. Es kann eine Evidenz-/Messlücke vorliegen.

## WÖk-Abgrenzung · Register sind kein amtlicher Standard

Das WÖk-Masterregister und das WÖk-Wirkindikatorenregister sind **WÖk-eigene Ordnungs- und Governance-Artefakte**. Sie ersetzen weder amtliche Statistik noch DNS-, ESRS-, GRI- oder Fachregister. Ihr Zusatznutzen liegt darin, Wirkungsgegenstände, State Variables, Indikatoren, Beobachtungen, Quellen und Versionen reproduzierbar zu verbinden. Eine WÖk-ID macht eine Aussage nicht wahr; Evidenz und Datenprovenienz bleiben eigenständige Prüfungen.

## 11. Quellen

- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- WÖk Referenz: https://wirkungsoekonomie.de/referenz/
- Destatis DNS-Indikatoren: https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Nachhaltigkeitsindikatoren/_inhalt.html
- EFRAG ESRS Knowledge Hub: https://knowledgehub.efrag.org/

## 12. Transferaufgabe

Wähle das MasterItem „Hitzeschutz“.

Definiere:

- drei State Variables,
- je zwei mögliche Indikatoren,
- Datenquellen,
- Datenfunktionen,
- einen Benchmark,
- ein mögliches Archetypmuster,
- eine offene Datenlücke.

## 14. Prüfungsrelevanz

- Zwei-Ebenen-Registerarchitektur,
- StateVariable,
- Indicator vs. Observation,
- Datenfunktionen,
- Benchmarks,
- Archetypen,
- Data Gap/Proxy.

## 15. Sprechertext

Stell dir vor, wir bauen ein riesiges Wirkungsregister.

Dann könnte man einfach anfangen, tausende Kennzahlen hineinzuschreiben.

CO₂. Wartezeiten. Löhne. Artenzahl. Unfallrate. Vertrauen.

Und irgendwann haben wir sehr viele Zahlen – aber noch keine Ordnung.

Darum trennt die WÖk zwei Ebenen.

Das Masterregister fragt: Was wollen wir überhaupt betrachten?

Zum Beispiel Patientensicherheit oder Versorgungssicherheit.

Das Wirkindikatorenregister fragt: Womit beobachten wir einen konkreten Zustand?

Dazwischen liegt die State Variable.

Versorgungssicherheit ist nämlich noch nicht direkt messbar. Ich kann aber zum Beispiel verfügbare gesicherte Leistung, Ausfallwahrscheinlichkeit oder Wiederherstellungszeit beobachten.

Dann kommt der Indikator.

Und dann erst die konkrete Observation: Welcher Wert wurde wann, wo und nach welcher Methode gemessen?

Das klingt nach Datenbankdesign.

Ist aber eigentlich Wirkungslogik.

Denn wenn wir diese Ebenen nicht trennen, wird aus jeder verfügbaren Kennzahl plötzlich ein Wirkungsurteil.

Auch Benchmarks sind nur Vergleiche. Ein Branchendurchschnitt ist nicht automatisch gut. Und ein Archetyp ist nur eine Prüfhilfe – keine Maschine, die Fallurteile produziert.

Der Merksatz lautet:

**Erst entscheiden, welchen Zustand wir verstehen wollen. Dann auswählen, womit wir ihn beobachten. Und erst danach analysieren, was die Beobachtung für die Wirkung bedeutet.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

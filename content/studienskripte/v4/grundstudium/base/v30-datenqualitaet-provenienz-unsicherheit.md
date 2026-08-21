<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v30-datenqualitaet-provenienz-unsicherheit.md curriculum=4.0 sanitized=true -->
# V30 · Datenqualität, Provenienz, Audit und Unsicherheit

**lecture_id:** `WOEK-G-BASE-030`  
**display_code:** `V30`  
**curriculum_version:** `4.0`  
**legacy_source:** `content/lehrgaenge/woek-g-v30.md` @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 macht Source Provenance, Versionierung, Unsicherheitsklassen, Reproduzierbarkeit und den Unterschied zwischen fehlender Evidenz, Nullwirkung und Nicht-Bewertbarkeit zu harten Qualitätsregeln.

## 20-Sekunden-Einstieg

Eine präzise Zahl kann falsch sein. Eine amtliche Quelle kann veraltet sein. Eine Studie kann für eine andere Population gelten. Und wenn Daten fehlen, bedeutet das nicht „keine Wirkung“. WÖk dokumentiert deshalb nicht nur **den Wert**, sondern auch Quelle, Version, Definition, Messmethode, Systemrand, Unsicherheit und Datenfunktion. Der wichtigste Satz lautet: **Evidenzqualität und Wirkungsrichtung sind zwei verschiedene Achsen.**

## Lernziele

Nach dieser Vorlesung kannst du:

1. Datenqualität mehrdimensional prüfen.
2. Provenienz und Versionsstand dokumentieren.
3. Primärquelle, Sekundärquelle und abgeleitete Analyse unterscheiden.
4. Evidenzgrad und Wirkungsrichtung getrennt behandeln.
5. `OPEN`, `NOT_ASSESSABLE`, `NO_EVIDENCE_OF_EFFECT` und `NEUTRAL` unterscheiden.
6. Reproduzierbarkeit, Source-vs-View und semantische Versionierung erklären.
7. einen Audit-Trail für eine Wirkungsanalyse aufbauen.

## 1. Gute Daten sind mehr als „seriöse Quelle“

Datenqualität hat mehrere Dimensionen:

- **Relevanz:** misst die Quelle wirklich die benötigte State Variable?
- **Validität:** misst das Verfahren, was es behauptet zu messen?
- **Reliabilität:** wäre die Messung wiederholbar?
- **Aktualität:** passt der Stand zum analysierten Zeitpunkt?
- **Abdeckung:** fehlen Gruppen, Regionen oder Zeiträume?
- **Vergleichbarkeit:** sind Definitionen über Zeit/Quellen konsistent?
- **Unabhängigkeit:** welche Interessen/Institutionen stehen hinter der Quelle?
- **Transparenz:** sind Methode, Definition und Datenzugang nachvollziehbar?

„Amtlich“, „peer reviewed“ oder „Unternehmensbericht“ sind wichtige Eigenschaften – aber keine automatische Qualitätsgarantie für jede konkrete Fragestellung.

## 2. Provenienz: Woher kommt diese Aussage?

Für jede materielle Tatsachen- oder Datenbehauptung muss nachvollziehbar sein:

- Quelle,
- URL/Identifier,
- Dokumenttitel,
- Herausgeber,
- Datum,
- Version,
- Fundstelle,
- Extraktions-/Transformationsschritt,
- verwendete Analyseversion.

Das verhindert einen häufigen Fehler:

Eine Zahl wird über mehrere Berichte weiterzitiert, bis niemand mehr weiß, wie sie ursprünglich gemessen wurde.

## 3. Primärquelle vor Sekundärquelle – aber nicht dogmatisch

Für Rechts-/Institutionenfragen gilt meist:

> Primärquelle zuerst.

Beispiele:

- Gesetzestext statt Zeitungszusammenfassung,
- amtliche DNS-Fassung statt Blog,
- Bundestagsdrucksache statt Social-Media-Post.

Für wissenschaftliche Kausalfragen kann dagegen eine hochwertige systematische Übersichtsarbeit stärker sein als ein einzelner Primärdatensatz.

Darum lautet die Regel nicht „Primärquelle ist immer besser“, sondern:

> **Quelle passend zur Behauptungsart wählen.**

## 4. Versionierung ist Fachlogik

Ein Gesetzentwurf kann mehrere Fassungen haben.

Ein Standard kann geändert werden.

Ein Indikator kann neu definiert werden.

Ein Datenportal kann Werte revidieren.

Darum speichert WÖk mindestens:

- `source_version`,
- `valid_from`,
- `valid_to` soweit relevant,
- `retrieved_at`,
- `analysis_version`,
- `method_version`.

Bei Änderungen wird `VERSION_DELTA` dokumentiert:

> Was hat sich fachlich geändert und welche früheren Bewertungen sind dadurch betroffen?

## 5. Evidenzgrad ist nicht Wirkungsrichtung

Stell dir zwei Aussagen vor:

### Fall A

> Wirkung wahrscheinlich positiv, Evidenz niedrig.

### Fall B

> Wirkung ambivalent, Evidenz hoch.

Beides ist möglich.

Darum braucht jede Analyse mindestens zwei getrennte Achsen:

- `impact_direction`,
- `evidence_level`.

Ein niedriger Evidenzgrad darf nicht als neutrale Wirkung codiert werden.

## 6. Vier Zustände, die nicht verwechselt werden dürfen

### NEUTRAL

Es gibt ausreichende Grundlage für die Einschätzung, dass die betrachtete Zustandsänderung im relevanten Bereich praktisch neutral ist.

### OPEN

Die Richtung ist fachlich offen oder noch nicht entschieden.

### NOT_ASSESSABLE

Mit den verfügbaren Informationen ist eine seriöse Bewertung nicht möglich.

### NO_EVIDENCE_OF_EFFECT

Es wurde nach Evidenz gesucht, aber kein belastbarer Effekt nachgewiesen.

Auch `NO_EVIDENCE_OF_EFFECT` ist nicht automatisch Beweis für `NO_EFFECT`.

## 7. Unsicherheit explizit machen

Unsicherheit kann entstehen aus:

- Messfehlern,
- Modellannahmen,
- fehlenden Daten,
- Übertragbarkeit von Studien,
- Zukunftsszenarien,
- Verhaltenseffekten,
- Policy-Delivery,
- Kausalidentifikation.

WÖk sollte Unsicherheit möglichst dort verankern, wo sie entsteht.

Nicht nur am Ende ein pauschales „mittel“ vergeben.

Beispiel:

- Mechanismus gut belegt,
- Umsetzung unklar,
- Verteilungsdaten lückenhaft,
- Langzeitwirkung modellbasiert.

Das ist informativer als ein einzelner Unsicherheitsscore.

## 8. Source-vs-View: Daten dürfen im Renderer nicht verschwinden

Provenienz endet nicht bei der Datenbank.

Wenn eine Analyse öffentlich dargestellt wird, muss geprüft werden:

- Sind alle fachlich freigegebenen Quellen sichtbar?
- Wurde ein Wirkungsbefund durch UI/Schema verkürzt?
- Sind Richtung und Evidenz getrennt dargestellt?
- Sind offene Punkte noch sichtbar?
- Wurde aus `OPEN` versehentlich `0`?
- Ist die richtige Version gerendert?

Das ist `SOURCE_VS_VIEW`.

Ein technisch schönes Frontend kann fachlich falsch sein, wenn es die Quelle nicht verlustfrei projiziert.

## 9. Beispiel: eine Klimastudie von 2018

Du findest eine Studie, die eine Technologie bewertet.

Prüfe:

- Welche Technikgeneration wurde untersucht?
- Welcher Strommix?
- Welche Region?
- Welche Nutzungsdauer?
- Welche Systemgrenzen?
- Wie haben sich seit 2018 Kosten/Technik/Regulierung verändert?

Die Studie kann methodisch hochwertig und für 2026 trotzdem nur bedingt übertragbar sein.

`HIGH_INTERNAL_QUALITY != HIGH_CURRENT_APPLICABILITY`.

## 10. Audit-Trail

Ein reproduzierbarer Wirkungsbefund braucht mindestens:

1. Gegenstand/Version,
2. Quellenliste,
3. Faktenextraktion,
4. Problem Review,
5. Goal Review,
6. Wirkpfade/Annahmen,
7. Daten-/Indikatorzuordnung,
8. Evidenzeinordnung,
9. Unsicherheit/Open Points,
10. Bewertung/Recommendation-Version,
11. spätere Reality-Check-Daten.

So kann ein Dritter nachvollziehen, wie ein Urteil entstanden ist – und es später korrigieren.

## 11. KI und Provenienz

KI kann bei Suche, Extraktion, Strukturierung und Hypothesengenerierung helfen.

Aber:

- KI-Ausgabe ist keine Primärquelle,
- Zitate/Fundstellen müssen zur echten Quelle führen,
- Unsicherheit darf nicht durch flüssige Sprache verdeckt werden,
- bei Fachurteilen muss sichtbar bleiben, welche Evidenz sie trägt,
- technische Generierung darf keine unfreigegebenen WÖk-Empfehlungen erzeugen.

Der Audit-Trail muss deshalb auch maschinelle Transformationsschritte dokumentieren, soweit sie für den Inhalt relevant sind.

## 12. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Provenienz | nachvollziehbare Herkunft und Transformationsgeschichte einer Information |
| Source Locator | konkrete Fundstelle in einer Quelle |
| Evidence Level | Belastbarkeit der Evidenz, getrennt von Wirkungsrichtung |
| OPEN | Richtung/Urteil fachlich offen |
| NOT_ASSESSABLE | seriöse Bewertung mit verfügbarem Material nicht möglich |
| Version Delta | fachliche Änderung zwischen Fassungen |
| Source-vs-View | Prüfung, ob öffentliche Darstellung den freigegebenen Fachbestand vollständig/korrekt wiedergibt |
| Reproduzierbarkeit | Möglichkeit, Analyseweg und Ergebnis anhand dokumentierter Quellen/Regeln nachzuvollziehen |

## 13. Typische Fehlinterpretationen

### „Amtliche Quelle = Kausalitätsbeweis.“
Falsch. Amtliche Quellen sind für amtliche Fakten sehr stark; Kausalität braucht passendes Design.

### „Peer reviewed = aktuell.“
Falsch.

### „Keine Daten = neutral.“
Falsch.

### „Niedrige Evidenz = negative Wirkung.“
Falsch. Evidenz und Richtung sind getrennt.

### „Wenn Daten korrekt gespeichert sind, ist das öffentliche Portal automatisch korrekt.“
Falsch. Renderer/Schema können Inhalt verlieren; Source-vs-View ist eigener Gate.

## 14. Quellen

- WÖk Methodik: https://wirkungsoekonomie.de/methodik/
- WÖk Wirkungswissenschaften: https://wirkungsoekonomie.de/wirkungswissenschaften/
- Destatis Qualitätsgrundsätze / amtliche Statistik: https://www.destatis.de/DE/Methoden/Qualitaet/qualitaet.html
- OECD Data Quality / statistical methodology context: https://www.oecd.org/sdd/

Konkrete Qualitätskriterien sind je Fachdomäne zu ergänzen.

## 15. Transferaufgabe

Nimm eine Zahl aus einem politischen oder Unternehmensbericht.

Dokumentiere:

- Originalquelle,
- Fundstelle,
- Definition,
- Einheit,
- Jahr,
- Systemrand,
- Datenfunktion,
- mögliche Unsicherheit,
- alternative Quelle,
- ob und wie die Zahl im späteren Reality Check verwendet werden kann.

## 17. Prüfungsrelevanz

- Datenqualitätsdimensionen,
- Provenienz/Versionierung,
- Source passend zur Behauptungsart,
- Richtung vs. Evidenz,
- OPEN/NOT_ASSESSABLE/NO_EVIDENCE/NEUTRAL,
- Source-vs-View,
- KI-Ausgabe ≠ Primärquelle.

## 18. Sprechertext

Eine Zahl mit drei Nachkommastellen sieht wissenschaftlich aus.

Das heißt leider gar nichts.

Vielleicht ist die Zahl fünf Jahre alt. Vielleicht misst sie etwas anderes als wir denken. Vielleicht stammt sie aus einer anderen Region. Vielleicht wurde ihre Definition geändert.

Darum beginnt Datenqualität nicht bei der Zahl.

Sie beginnt bei der Frage: Woher kommt sie?

Was wurde gemessen? Wie? Wann? Für wen? In welchem Systemrand? Welche Version?

Das nennen wir Provenienz.

Und dann kommt eine zweite wichtige Trennung.

Wie stark ist die Evidenz – und in welche Richtung zeigt die Wirkung?

Das sind zwei Achsen.

Eine Wirkung kann wahrscheinlich positiv sein und trotzdem nur schwach belegt.

Oder sehr gut belegt und trotzdem ambivalent.

Und wenn wir gar nicht genug wissen, schreiben wir nicht einfach null hin.

OPEN ist nicht neutral.

NOT_ASSESSABLE ist nicht keine Wirkung.

Das klingt wie Wortklauberei. Ist aber ein ziemlich großer Unterschied, wenn später politische oder wirtschaftliche Entscheidungen daran hängen.

Und Provenienz geht bis ins Frontend.

Wenn unsere Datenbank sagt „ambivalent, Evidenz niedrig, drei offene Punkte“ und die Webseite zeigt nur einen grünen Punkt, dann ist die Analyse technisch kaputt – auch wenn die Daten intern richtig sind.

Darum gibt es Source-vs-View.

Die wichtigste Idee für heute ist simpel:

**Nicht nur fragen: Stimmt die Zahl? Sondern: Woher kommt sie, wofür taugt sie, welche Version gilt – und was darf ich daraus wirklich schließen?**

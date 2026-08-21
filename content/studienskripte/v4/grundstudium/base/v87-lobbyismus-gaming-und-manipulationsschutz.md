<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v87-lobbyismus-gaming-und-manipulationsschutz.md curriculum=4.0 sanitized=true -->
# V87 · Schutz vor Lobbyismus, Score-Gaming und Wirkungsmanipulation

**lecture_id:** `WOEK-G-BASE-087`  
**display_code:** `V87`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 hatte nur den geplanten Titel. v4.0 behandelt Manipulationsrisiken als Governance-/Incentive-Problem: Indikatoren, Benchmarks, Datenzugang und Scores können strategisch beeinflusst werden. Schutz erfolgt durch Transparenz, unabhängige Daten, Versionierung, Anti-Gaming-Tests und Trennung von Messung und Entscheidung.

## 20-Sekunden-Einstieg

Sobald ein Score Geld, Reputation oder Regulierung beeinflusst, lernen Menschen, den Score zu optimieren. Das ist nicht automatisch Betrug – es ist ein normaler Anreizeffekt. Problematisch wird es, wenn **die Kennzahl besser wird, ohne dass der reale Zustand besser wird**. WÖk muss deshalb Goodhart-Risiken, Lobbyeinfluss, selektive Daten, Benchmark-Manipulation und Modell-Gaming von Anfang an mitdenken.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Goodhart-/Gaming-Risiken in Wirkungssteuerung erklären.
2. legitime Interessenvertretung von intransparenter/manipulativer Einflussnahme unterscheiden.
3. Daten-, Indikator-, Benchmark-, Modell- und Prozessgaming unterscheiden.
4. Anti-Gaming- und Integritätskontrollen entwerfen.
5. Interessenkonflikte und Governance-Rollen trennen.
6. erkennen, wann ein Anreizsystem reale Wirkung durch Kennzahlenoptimierung verdrängt.

## 1. Wenn die Kennzahl zum Ziel wird

Eine bekannte Steuerungsfalle lautet sinngemäß:

> Wird eine Messgröße selbst zum Ziel, kann sie ihre Qualität als Messgröße verlieren.

Beispiel Schule:

Wenn ausschließlich Testergebnisse belohnt werden, kann Unterricht auf Testoptimierung statt Lernen ausgerichtet werden.

Beispiel Klima:

Wenn nur direkte Scope-1-Emissionen zählen, kann Produktion ausgelagert werden, ohne globale Emissionen zu senken.

Das ist `METRIC_GAMING`.

## 2. Fünf Gaming-Ebenen

### Daten-Gaming

- selektive Meldung,
- günstige Systemgrenzen,
- verspätete Daten,
- Auslassung problematischer Einheiten.

### Indikator-Gaming

- Kennzahl verbessern, ohne relevanten Zustand zu verbessern.

### Benchmark-Gaming

- Vergleichsgruppe so wählen, dass Ergebnis günstig aussieht.

### Modell-Gaming

- Gewichte/Parameter/Annahmen strategisch wählen.

### Prozess-Gaming

- Prüfung zeitlich/organisatorisch so gestalten, dass kritische Informationen fehlen.

## 3. Lobbyismus ist nicht automatisch Manipulation

Interessenvertretung ist Teil pluralistischer Demokratie.

Unternehmen, Gewerkschaften, NGOs, Verbände und Bürger:innen dürfen politische Interessen vertreten.

Wirkungsrelevant problematisch können sein:

- verdeckte Finanzierung,
- falsche/selektive Evidenz,
- undisclosed conflicts,
- privilegierter Datenzugang,
- regulatorische Capture-Risiken,
- manipulative Astroturfing-Strukturen.

WÖk bewertet nicht „Lobby = schlecht“, sondern Transparenz, Evidenzqualität, Asymmetrien und Mechanismen.

## 4. Datenquelle und Anreiz trennen

Wenn der Akteur, der von einem guten Score profitiert, allein die Daten liefert, ist das ein Integritätsrisiko.

Mögliche Gegenmittel:

- unabhängige/amtliche Daten,
- Audits,
- Stichproben,
- Kreuzvalidierung,
- offene Methoden,
- Sanktionen für Falschmeldungen,
- Datenprovenienz,
- Whistleblower-/Beschwerdekanäle.

Nicht jede Selbstauskunft ist wertlos – aber ihre Anreizlage muss bekannt sein.

## 5. Benchmark-Governance

Benchmarks können große wirtschaftliche Effekte haben.

Darum braucht ihre Pflege:

- klare Vergleichsgruppe,
- öffentlich dokumentierte Änderungen,
- Versionierung,
- Mindestdatenqualität,
- Interessenkonfliktregeln,
- Review-/Appealprozess.

Eine stille Benchmarkänderung kann Unternehmen oder Technologien massiv anders einstufen.

## 6. Anti-Gaming durch mehrere Indikatoren

Ein einzelner Indikator ist leichter zu optimieren.

Mehrere komplementäre State Variables können Gaming erschweren.

Beispiel Beschäftigungsprogramm:

Nicht nur:

- Anzahl vermittelter Personen.

Sondern zusätzlich:

- Beschäftigungsdauer,
- Einkommen,
- Rückkehr in Arbeitslosigkeit,
- Verteilung nach Gruppen,
- Mitnahme-/Verdrängungseffekte.

Aber auch zu viele Kennzahlen können Bürokratie/Gaming erhöhen. Balance ist nötig.

## 7. Audit-Trail und Version Delta

Jede materielle Änderung an:

- Scorelogik,
- Gewicht,
- Benchmark,
- Indicator Definition,
- Datenquelle,
- Boundary

braucht `VERSION_DELTA`.

Fragen:

- Was änderte sich?
- Warum?
- Wer entschied?
- Welche bisherigen Bewertungen sind betroffen?

Das schützt vor stiller Regelanpassung.

## 8. Red Team / Adversarial Review

Vor Einführung eines WÖk-Anreizsystems sollte ein Red-Team-Test fragen:

> Wie würde ich dieses System optimieren, ohne echte Wirkung zu verbessern?

Beispiele:

- Verlagerung in Lieferkette,
- Produktdefinition ändern,
- Datenperiode wählen,
- Nutzersegment ausschließen,
- temporäre Verbesserung vor Audit,
- Label-/Zertifikatsshopping.

Die gefundenen Angriffe fließen in Kontrollen und Reality Checks ein.

## 9. Beispiel: wirkungsabhängige Steuer

Wenn ein Steuersatz von einem Produktprofil abhängt, entstehen starke Anreize.

Risiken:

- Datenmanipulation,
- Klassifikationsarbitrage,
- Verlagerung von Aktivitäten,
- Lobbydruck auf Benchmarks,
- schnelle technische Veränderungen bei langsamer Regelpflege.

Darum braucht das System:

- klare Rechtsgrundlage,
- unabhängige Daten/Prüfung,
- zeitnahe Benchmark-Updates,
- Anti-Avoidance,
- Appeal,
- Reality Check auf echte Outcomes.

## 10. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Gaming | strategische Optimierung der Mess-/Regellogik statt des eigentlichen Zielzustands |
| Goodhart-Risiko | Kennzahl verliert Aussagekraft, wenn sie selbst zum Steuerungsziel wird |
| Regulatory Capture | Regulierungsprozess wird übermäßig von regulierten Interessen geprägt |
| Astroturfing | künstlich erzeugter Eindruck unabhängiger Graswurzelunterstützung |
| Red Team | gezielter Versuch, Schwächen/Manipulationswege eines Systems zu finden |
| Version Delta | dokumentierte Änderung einer Methode/Definition/Regel |

## 11. Typische Fehlinterpretationen

### „Jede Optimierung eines Scores ist Betrug.“
Falsch; Anreize sollen Verhalten verändern. Entscheidend ist, ob realer Zustand mitverbessert wird.

### „Lobbyismus ist per se illegitim.“
Falsch.

### „Mehr Kennzahlen lösen jedes Gaming.“
Falsch.

### „Audit einmal reicht.“
Falsch; Regeln/Technologien/Anreize ändern sich.

### „Open Source verhindert Manipulation vollständig.“
Falsch; Daten-/Governance-/Anreizprobleme bleiben.

## 12. WÖk-Abgrenzung

Anti-Gaming, Audit und Interessenkonfliktmanagement existieren in Regulierung, Finanzwesen, Qualitätssystemen und Wissenschaft. WÖk übernimmt diese Prinzipien als feste Governance-Schicht, weil wirkungsabhängige Anreize ohne Manipulationsschutz schnell selbst Fehlwirkung erzeugen.

## 13. Quellen

- Lobbyregister Deutscher Bundestag: https://www.lobbyregister.bundestag.de/
- OECD, lobbying/influence transparency: https://www.oecd.org/gov/ethics/lobbying.htm
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 14. Transferaufgabe

Nimm einen hypothetischen wirkungsabhängigen Bonus oder Steuersatz.

Finde mindestens zehn Gaming-Wege.

Ordne sie Daten/Indikator/Benchmark/Modell/Prozess zu und definiere je einen Gegenmechanismus.

## 16. Prüfungsrelevanz

- Gamingtypen,
- Goodhart,
- Lobby vs. Manipulation,
- Datenunabhängigkeit,
- Benchmark-Governance,
- Red Team,
- Version Delta.

## 17. Sprechertext

Sobald wir einen Score wichtig machen, passiert etwas völlig Normales.

Menschen optimieren ihn.

Wenn der Score einen Bonus, eine Steuer oder einen Auftrag beeinflusst, wäre alles andere sogar überraschend.

Das Problem ist nicht Optimierung.

Das Problem entsteht, wenn die Kennzahl besser wird und die Realität nicht.

Eine Firma kann zum Beispiel direkte Emissionen senken, indem sie Produktion auslagert. Der Score wird grün, die globale Wirkung vielleicht nicht.

Darum denken wir Gaming von Anfang an mit.

Welche Daten kann man auswählen? Welche Benchmarkgruppe schönrechnen? Welche Systemgrenze verschieben?

Und auch Lobbyismus müssen wir differenziert sehen.

Interessenvertretung ist demokratisch normal. Kritisch wird es bei verdeckter Finanzierung, falscher Evidenz oder regulatorischer Vereinnahmung.

Eine gute Methode braucht deshalb Red Teams.

Wir versuchen selbst, das System zu knacken.

Nicht weil wir allen misstrauen.

Sondern weil gute Anreize erst dann robust sind, wenn sie auch unter strategischem Verhalten noch echte Wirkung belohnen.

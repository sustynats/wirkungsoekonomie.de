# Audit: WÖk-Kompass MVP

Status: draft  
Stand: 2026-05-22

## 1. Welche Route wurde erstellt?

Erstellt wurde `/kompass.html` als zentrale Vollseiten-Oberfläche.

Der Kompass ist nicht als Chatbot, Widget oder kleines Fenster unten rechts umgesetzt, sondern als strukturierter Wirkungsnavigator.

## 2. Welche UI-Komponenten wurden erstellt?

Im MVP sind folgende Komponenten als HTML/CSS/JS-Struktur umgesetzt:

- `WoekCompassHub`
- `CompassTopicGrid`
- `CompassQuestionInput`
- `CompassModeSelector`
- `CompassAnswerPanel`
- `ShortAnswerBox`
- `OneSentenceBox`
- `ImpactPathVisualizer`
- `SDGRelationPanel`
- `MPDPanel`
- `GlossaryTrail`
- `SourcePanel`
- `RelatedKnowledgeCards`
- `DeepDiveToggle`
- `ScannerModePanel`
- `ConfidenceNotice`
- `DraftExclusionGuard`

## 3. Welche Themenkacheln wurden angelegt?

Angelegt in `content/kompass/compass-topics.json`:

- Produkte & Preise
- Wirtschaft & Kapital
- Politik & Demokratie
- Wirkung & SDGs
- Medien & Sprache
- Wirkungssteuer
- Alltag & Konsum
- Unternehmen & Lieferketten
- Akademie & Lernen

## 4. Welche Demo-Fragen wurden angelegt?

Angelegt in `content/kompass/compass-questions.json`, unter anderem:

- Warum wäre ein Bio-Apfel in der WÖk günstiger?
- Wie wirkt Desinformation?
- Was unterscheidet WÖk von ESG?
- Was bedeutet Wirkung?
- Was ist positive Netto-Wirkung?
- Was bedeutet Wirkungsrückkopplung?
- Was ist eine WÖk-ID?
- Wie wird aus einer Scorecard eine Steuerklasse?
- WÖk vs. Gemeinwohlökonomie
- WÖk vs. Donut-Ökonomie
- WÖk-Scanner als MVP vorbereitet

## 5. Welche Antworttemplates wurden erstellt?

Angelegt in `content/kompass/compass-answer-templates.json`.

Jedes Template enthält:

- Status
- Kurzantwort
- Ein-Satz-Formel
- drei Tiefen: einfach, fachlich, systemisch
- MPD-Bezug
- SDG-/SDG+-Bezug
- Glossarbegriffe
- verwandte Inhalte
- Quellenpanel
- Transparenzhinweis

## 6. Wie werden Wirkungspfade dargestellt?

Wirkungspfade liegen in `content/kompass/impact-paths.json`.

Der `ImpactPathVisualizer` stellt sie als geordnete Prozesskette dar. Für Vergleiche kann er zwei Lanes anzeigen, etwa ESG und WÖk.

## 7. Wie werden Quellen angezeigt?

Jede Antwort enthält ein Panel `Grundlage dieser Antwort`.

Quellen werden nicht nur als Link angezeigt, sondern mit kurzer Begründung:

- warum die Quelle relevant ist
- ob sie Begriffsgrundlage, Glossar, Website-Seite, Beispiel, Methodik oder externe Quelle ist

## 8. Wie werden Glossarbegriffe verknüpft?

Die `GlossaryTrail`-Komponente zeigt zentrale Begriffe als klickbare Chips zur Glossarseite. Eine spätere Version kann auf konkrete Anker pro Begriff mappen.

## 9. Wie wird verhindert, dass Drafts genutzt werden?

Der `DraftExclusionGuard` ist im Frontend umgesetzt:

```js
const publishedOnly = (item) => item.status === "published" || item.status === "explicitly_approved_for_compass";
```

Alle geladenen Themen, Fragen, Antworten und Wirkungspfade werden dadurch gefiltert.

## 10. Wie funktioniert Mobile?

Mobile wird als Vollseiten-Ansicht umgesetzt:

- keine Chatbox
- Kacheln zuerst
- großes Eingabefeld
- Antwort als Kartenstapel
- Wirkungspfad vertikal
- Quellen als `details`
- Tiefe-Ebenen als Segmented Control
- große Touchflächen

## 11. Welche Funktionen sind MVP?

MVP kann:

- Themenkacheln anzeigen
- kuratierte Fragen anzeigen
- Such-/Eingabefeld mit Vorschlägen
- strukturierte Antwortkarten anzeigen
- Wirkungspfad anzeigen
- Begriffe verlinken
- Quellenpanel anzeigen
- drei Tiefe-Ebenen anbieten
- verwandte Inhalte anzeigen
- Scanner-Modus als eigene MVP-Oberfläche `scanner.html` verlinken

## 12. Welche Funktionen sind für später vorbereitet?

Vorbereitet:

- RAG-/LLM-Modus
- Vektorindex nur für freigegebene Inhalte
- Quellenpflicht
- Scanner für Produkte, Unternehmen, Aussagen, Websites, Wahlprogramme, Lieferketten, Investitionen und Medienbeiträge
- Datenbedarf und Zielkonflikt-Ausgabe
- genauere Glossaranker
- echte Produkt- und Steuerklassenberechnung

## 13. Welche offenen Punkte bleiben?

- echte Wissenskarten aus geprüften Inhalten ergänzen
- Antworttemplates erweitern
- Glossaranker pro Begriff präzisieren
- Quellenpanel mit Register-IDs verbinden
- Scanner-Modus fachlich und technisch ausbauen
- RAG-Backend erst nach Freigabe der Wissensbasis planen
- visuelle SDG-Badges bei Bedarf ergänzen

## Leitsatz

Der WÖk-Kompass ist kein Chatbot.

Er ist die sichtbare Denkstruktur der Wirkungsökonomie.

Normale KI sagt: Hier ist eine Antwort.

Der WÖk-Kompass zeigt: Hier ist die Wirkungslogik.

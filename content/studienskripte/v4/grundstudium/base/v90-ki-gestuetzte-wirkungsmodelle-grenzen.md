<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v90-ki-gestuetzte-wirkungsmodelle-grenzen.md curriculum=4.0 sanitized=true -->
# V90 · KI-gestützte Wirkungsmodelle und ihre Grenzen

**lecture_id:** `WOEK-G-BASE-090`  
**display_code:** `V90`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED_VERSION_SENSITIVE`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 hatte nur den geplanten Titel. v4.0 behandelt KI als Werkzeug für Suche, Extraktion, Strukturierung, Simulation und Hypothesengenerierung – nicht als autonome Quelle fachlicher Wahrheit. Aktuelle AI-Act-/Governancepflichten werden versionssensitiv behandelt.

## 20-Sekunden-Einstieg

KI kann tausende Seiten durchsuchen, Quellen strukturieren, Wirkpfade vorschlagen und Szenarien simulieren. Das macht sie für Wirkungsanalyse extrem nützlich. Aber ein Sprachmodell kann überzeugend falsch liegen, Quellen verwechseln oder Unsicherheit verstecken. Deshalb gilt in v4.0: **KI darf Wirkungsanalyse beschleunigen – sie darf Primärquellen, fachliche Evidenz, rechtliche Prüfung und verantwortete WÖk-Urteile nicht ersetzen.**

## Lernziele

Nach dieser Vorlesung kannst du:

1. geeignete und ungeeignete KI-Aufgaben in der Wirkungsanalyse unterscheiden.
2. Retrieval, Extraktion, Klassifikation, Simulation und generative Synthese funktional trennen.
3. Halluzination, Source Drift, Automation Bias und Training-/Data-Bias erklären.
4. Human-/Expert Review dort einbauen, wo fachliche oder rechtliche Verantwortung erforderlich ist.
5. KI-Ergebnisse mit Provenienz, Version, Modellstand und Unsicherheit dokumentieren.
6. aktuelle regulatorische AI-Act-Anforderungen als externe Governance-Schicht berücksichtigen.

## 1. KI ist Werkzeug – kein Beweis

Eine KI-Ausgabe kann enthalten:

- plausible Zusammenfassung,
- gute Hypothese,
- korrekte Quelle,
- falsche Quelle,
- erfundene Fundstelle,
- veraltete Information,
- überzogene Kausalität.

Darum gilt:

`AI_OUTPUT != PRIMARY_SOURCE`.

Und:

`AI_CONFIDENCE_STYLE != EVIDENCE_LEVEL`.

Flüssige Sprache ist kein Qualitätsmaß.

## 2. Fünf sinnvolle KI-Funktionen

### 2.1 Retrieval / Suche

Dokumente/Passagen finden.

### 2.2 Extraktion

Fakten, Zusagen, Indikatoren, Fundstellen strukturiert aus Dokumenten ziehen.

### 2.3 Klassifikation

Beispielsweise Gegenstände einem Policy-Domain- oder MasterItem-Kandidaten zuordnen.

### 2.4 Hypothesengenerierung

Mögliche Wirkmechanismen, Nebenwirkungen oder Datenlücken vorschlagen.

### 2.5 Simulation / Szenarien

Unter expliziten Annahmen alternative Entwicklungen untersuchen.

Jede Funktion braucht andere Validierung.

## 3. Was KI nicht autonom tun soll

In WÖk darf technische KI nicht allein:

- Primärquelle ersetzen,
- Rechtslage endgültig entscheiden,
- politische Zielkonflikte normativ gewichten,
- harte Schutzgrenzen erfinden,
- Recommendations erzeugen und automatisch veröffentlichen,
- Menschen/Parteien aus Keywords bewerten,
- `OPEN` als neutral umdeuten,
- aus Zielbezug Kausalität ableiten.

`CODEX/AI_MAY_NOT_SYNTHESISE_FACH_JUDGMENT_WITHOUT_APPROVED_RECORD`.

## 4. Halluzination und Source Drift

### Halluzination

Modell erzeugt nicht belegte Information.

### Source Drift

Eine korrekte Ausgangsquelle wird in späteren Zusammenfassungen so verändert, dass Aussage, Kontext oder Einschränkung nicht mehr stimmen.

Schutz:

- Source IDs,
- konkrete Fundstellen,
- Zitate nur kurz/prüfbar,
- Source-vs-View,
- semantische Diffs,
- Primärquellen vor Veröffentlichung erneut prüfen.

## 5. Automation Bias

Menschen neigen dazu, automatisierten Ergebnissen zu vertrauen, besonders wenn sie präzise aussehen.

Ein KI-System kann deshalb Macht gewinnen, obwohl es nur eine Assistenzfunktion haben sollte.

Gegenmaßnahmen:

- Unsicherheit sichtbar,
- Alternative Hypothesen,
- Gegenbelege suchen,
- Reviewrollen,
- stichprobenartige Blindprüfung,
- keine „AI score says so“-Begründung.

## 6. Daten-/Modellbias

Bias kann entstehen aus:

- Trainingsdaten,
- Auswahl der Quellen,
- ungleichen Datenmengen zwischen Gruppen,
- historischen Verzerrungen,
- Labels/Benchmarks,
- Prompt-/Systemdesign.

WÖk muss deshalb nicht nur Modelloutput, sondern auch **Datenabdeckung und Label-Governance** prüfen.

## 7. KI und Kausalität

Sprachmodelle können plausible Kausalgeschichten erzeugen.

Das ist Hypothesengenerierung.

Kausalität braucht zusätzliche Evidenz:

- Fachliteratur,
- Experimente/quasi-experimentelle Designs,
- Zeitreihen/Modelle,
- Mechanismusdaten,
- Gegenfaktum.

KI darf Vorschläge liefern wie:

> „Möglicher Mechanismus M1.“

Nicht:

> „Kausal bewiesen.“

## 8. KI in der staatlichen Wirkungsarchitektur

Wenn KI künftig GFA/eNAP, Verwaltung oder Evaluation unterstützt, gelten zusätzlich:

- Verwaltungs-/Verfassungsrecht,
- Datenschutz,
- aktuelle EU-AI-Regulierung,
- Transparenz-/Dokumentationsanforderungen,
- menschliche Verantwortlichkeit.

Der EU AI Act bildet einen risikobasierten Rechtsrahmen. Sein Anwendungs-/Pflichtenstand verändert sich phasenweise und muss für konkrete 2026/2027-Anwendungen frisch geprüft werden.

Diese Vorlesung ist deshalb `VERSION_SENSITIVE`.

## 9. Model Versioning

Eine Wirkungsanalyse mit KI ist nur reproduzierbar, wenn dokumentiert wird:

- Modell/Familie,
- relevante Version/Datum,
- System-/Methodenprompt soweit fachlich relevant,
- Inputquellen,
- Tool-/Retrievalstand,
- Transformationsschritte,
- menschliche Reviewentscheidungen.

Ein späteres Modell kann denselben Fall anders strukturieren.

Das ist ein `MODEL_VERSION_DELTA`.

## 10. Beispiel: 1.500 Programmzusagen

KI kann helfen:

- Aussagen atomisieren,
- Fundstellen zuordnen,
- potenzielle Policy-Domains vorschlagen,
- Dubletten markieren,
- fehlende Quellen erkennen.

Aber:

- jede öffentlich als analysiert geführte Zusage braucht objektspezifisches Fachreview,
- generische Templates dürfen nicht als aktuelle Bewertung erscheinen,
- keine Partei-Gesamtnote aus automatischer Aggregation,
- technische Projektion darf Fachlayer nicht verlieren.

Das ist genau der Unterschied zwischen **Scale** und **Verantwortung**.

## 11. KI als Red Team

KI kann auch nützlich sein, um:

- Gegenargumente zu generieren,
- alternative Mechanismen vorzuschlagen,
- fehlende Stakeholder zu suchen,
- potenzielle Gaming-Wege zu finden,
- Falsifikationskriterien vorzuschlagen.

Auch hier gilt:

Vorschlag → menschlich/fachlich prüfen → erst dann Analysebestand.

## 12. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Halluzination | generierte, nicht belegte/falsche Information |
| Source Drift | Bedeutungsverschiebung zwischen Originalquelle und späterer Darstellung |
| Automation Bias | übermäßiges Vertrauen in automatisierte Entscheidungen |
| Model Version Delta | fachlich relevante Änderung durch andere Modell-/Toolversion |
| Retrieval | gezieltes Finden relevanter Quellen/Passagen |
| Hypothesengenerierung | Erzeugen möglicher Erklärungen/Wirkpfade, noch kein Beweis |
| Human/Expert Review | verantwortete Prüfung durch geeignete Personen/Fachrollen |

## 13. Typische Fehlinterpretationen

### „KI kann Fachreview ersetzen, wenn sie groß genug ist.“
Falsch.

### „Quellenzitat im KI-Text beweist, dass die Quelle die Aussage trägt.“
Falsch; Fundstelle prüfen.

### „KI-Simulation ist Prognose.“
Falsch.

### „Human in the loop bedeutet, dass jede technische Aktion manuell freigegeben werden muss.“
Falsch. Automatisierung kann technisch autonom sein; fachliche/normative Verantwortung bleibt dort, wo sie nötig ist.

### „AI Act ist WÖk-Methodik.“
Falsch; externer Rechtsrahmen.

## 14. WÖk-Abgrenzung

KI ist Enabler der WÖk, nicht ihr Erkenntnistheorie-Ersatz.

WÖk-spezifisch ist die Governance:

- Source-first,
- Fachurteil getrennt von technischer Generierung,
- versionierte Records,
- Evidenz-/Richtungstrennung,
- automatische Gates gegen verlorene/erfundene Inhalte,
- Reality Check auch für KI-gestützte Annahmen.

## 15. Quellen

- EU AI Act / Commission overview: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- EU AI Office: https://digital-strategy.ec.europa.eu/en/policies/ai-office
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 16. Transferaufgabe

Nimm einen Wirkungsfall mit zehn Quellen.

Definiere, welche Aufgaben KI autonom vorbereiten darf und welche einen Fachreview benötigen.

Baue einen Audit-Trail mit:

- Source IDs,
- Modellversion,
- extrahierten Fakten,
- KI-Hypothesen,
- abgelehnten Hypothesen,
- finalem Fachurteil,
- Recheck-Trigger.

## 18. Prüfungsrelevanz

- KI-Funktionen,
- Halluzination/Source Drift/Automation Bias,
- KI ≠ Fachurteil,
- Kausalität,
- Model Versioning,
- AI Act als externe versionierte Governance,
- Red Team.

## 19. Sprechertext

KI ist für die Wirkungsökonomie wahrscheinlich ein riesiger Beschleuniger.

Stell dir 1.500 politische Zusagen vor.

Eine KI kann sie sortieren, Quellen finden, Dubletten markieren und mögliche Wirkpfade vorschlagen.

Das spart unglaublich viel Arbeit.

Aber genau da liegt die Falle.

Eine KI kann sehr überzeugend falsch liegen.

Sie kann eine Quelle zitieren, die etwas anderes sagt. Sie kann aus einem Zielbezug eine Kausalität machen. Und sie klingt dabei genauso sicher wie bei einer richtigen Antwort.

Darum ist die Grundregel simpel:

KI darf vorbereiten. Quellen und Fachurteile bleiben prüfbar.

Das heißt nicht, dass jeder Klick von Menschen bestätigt werden muss.

Technische Arbeit kann stark automatisiert laufen.

Aber wenn aus einem Modell eine politische Bewertung, eine rechtliche Grenze oder eine Recommendation wird, braucht es verantwortete fachliche Grundlage.

Und wir versionieren auch das Modell.

Denn ein anderes Modell kann morgen denselben Fall anders analysieren.

Der Merksatz lautet:

**KI skaliert Wirkungsanalyse. Verantwortung skaliert nicht automatisch mit. Deshalb brauchen wir Provenienz, Review und harte fachliche Gates.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

### Aktualisierung zum AI Act · 6. September 2026

Der AI Act ist seit 2. August 2026 grundsätzlich anwendbar, mit gestaffelten Ausnahmen. Verbote und KI-Kompetenzpflichten gelten bereits seit Februar 2025, GPAI-Regeln seit August 2025. Nach der aktualisierten Kommissionsübersicht und dem im Juli 2026 in Kraft getretenen AI Omnibus gelten verlängerte Fristen für bestimmte Hochrisikobereiche bis 2. Dezember 2027 und produktintegrierte Hochrisikosysteme bis 2. August 2028. Für den Einzelfall sind Rolle, Systemkategorie und konkrete Vorschrift zu bestimmen. KI-Ergebnisse bleiben überprüfungsbedürftig; Transparenz und menschliche Verantwortung ersetzen keinen Kausalitätsnachweis.

Quelle: [Europäische Kommission, AI Act, aktualisiert am 3. August 2026, mit finalem Omnibus-Rechtstext](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai).

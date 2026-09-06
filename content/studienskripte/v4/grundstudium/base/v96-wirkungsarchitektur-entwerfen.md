<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v96-wirkungsarchitektur-entwerfen.md curriculum=4.0 sanitized=true -->
# V96 · Wirkungsarchitektur entwerfen: Systemhebel, Rückkopplung und adaptive Governance

**lecture_id:** `WOEK-G-BASE-096`  
**display_code:** `V96`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v3.2 hatte nur den geplanten Titel. v4.0 macht aus „Systemhebel und Rückkopplungen“ einen vollständigen Designprozess: Problem-/Goal-Review, Systemgrenzen, Optionen, Delivery, Anreiz-/Informationsfeedback, Schutzgrenzen, Monitoring, Falsifikation und Revision.

## 20-Sekunden-Einstieg

Eine gute Wirkungsarchitektur ist mehr als ein Dashboard. Sie verbindet **Problem, Ziel, Maßnahme, Daten, Anreize, Verantwortlichkeit und spätere Korrektur**. Der wichtigste Designfehler ist, nur einen Hebel zu optimieren und das restliche System zu vergessen. v4.0 baut deshalb adaptive Governance: mehrere plausible Optionen, klare Schutzgrenzen, robuste Delivery, messbare State Variables, Recheck-Trigger und eine echte Revisionsschleife.

## Lernziele

Nach dieser Vorlesung kannst du:

1. ein komplexes Wirkungsproblem in Systemgrenzen, Akteure, Zustände und Rückkopplungen zerlegen.
2. Hebel von Symptombekämpfung unterscheiden.
3. Policy-/Business-Optionen als Portfolios statt Einzelmaßnahmen designen.
4. Anreiz-, Informations-, Kapazitäts- und Rechtshebel kombinieren.
5. adaptive Trigger und Revision in Governance einbauen.
6. vermeiden, dass ein Wirkungsmodell selbst Lock-in, Gaming oder neue blinde Flecken erzeugt.

## 1. Architektur statt Einzelmaßnahme

Komplexe Probleme haben selten nur einen Hebel.

Beispiel Wohnungsmarkt:

- Boden,
- Baukosten,
- Zinsen,
- Genehmigungen,
- Infrastruktur,
- Einkommen,
- Leerstand,
- regionale Nachfrage,
- Mietrecht,
- kommunale Planung.

Eine einzelne Subvention kann deshalb Wirkung erzeugen und gleichzeitig neue Engpässe verschärfen.

Wirkungsarchitektur fragt nach dem **Systemdesign**.

## 2. Der Designprozess

### Schritt 1 - Problem Review

Was ist der belegte Zustand? Wo liegt der Engpass?

### Schritt 2 - Goal Review

Welcher Zustand soll sich ändern? Welche Schutzbedingungen?

### Schritt 3 - Systemgrenze

Welche Akteure, Räume, Zeithorizonte und Märkte müssen berücksichtigt werden?

### Schritt 4 - Mechanismen

Welche Hebel beeinflussen Verhalten/Zustände?

### Schritt 5 - Optionen/Portfolios

Welche Kombinationen sind realistisch?

### Schritt 6 - Delivery

Wer setzt was mit welchen Ressourcen um?

### Schritt 7 - Daten/Monitoring

Welche State Variables zeigen Fortschritt/Fehlentwicklung?

### Schritt 8 - Trigger/Revision

Wann wird nachgesteuert oder gestoppt?

## 3. Vier Hebeltypen

### Anreizhebel

Preise, Steuern, Förderung, Verträge, Boni.

### Informationshebel

Transparenz, Labels, Daten, Beratung, Feedback.

### Kapazitätshebel

Personal, Infrastruktur, Kompetenzen, Finanzierung, IT.

### Regel-/Rechtshebel

Standards, Pflichten, Rechte, Zuständigkeiten, Verfahren.

Oft braucht Wirkung eine Kombination.

## 4. Information ohne Handlungsmöglichkeit wirkt schwach

Ein Dashboard kann zeigen, dass etwas schlecht läuft.

Wenn niemand:

- zuständig ist,
- Ressourcen hat,
- Regeln ändern darf,
- Anreize verändern kann,

dann bleibt Feedback folgenlos.

Darum ist der WÖk-Regelkreis:

`Observe -> Interpret -> Decide -> Act -> Re-observe`.

Nicht nur `Measure -> Report`.

## 5. Systemhebel vs. moralischer Appell

Ein moralischer Appell kann Wirkung haben.

Aber wenn Anreize systematisch in die Gegenrichtung laufen, bleibt er oft schwach.

Beispiel:

Ein Unternehmen soll Ressourcen sparen, verdient aber mehr, je mehr Einwegprodukte es verkauft.

Mögliche Systemhebel:

- Produktdesign,
- Rücknahmesystem,
- Preissignal,
- Beschaffung,
- Reparaturrecht,
- Geschäftsmodell.

WÖk sucht **funktionale** Hebel statt Schuldzuweisung.

## 6. Feedback kann selbst Fehlanreize erzeugen

Wenn ein KPI belohnt wird, wird er optimiert.

Darum muss jede Architektur fragen:

- Wie kann das System gegamed werden?
- Welche Daten können manipuliert werden?
- Welche Wirkungen werden ausgelagert?
- Welche Gruppen verlieren Sichtbarkeit?

Das ist `SECOND_ORDER_GOVERNANCE`:

Die Steuerungsarchitektur selbst wird zum Wirkungsobjekt.

## 7. Adaptive Governance

Adaptive Governance bedeutet:

- Ziele bleiben stabil genug für Orientierung,
- Instrumente können bei neuer Evidenz angepasst werden,
- Trigger sind vorher definiert,
- Versionen bleiben nachvollziehbar,
- Änderungen werden begründet.

Beispiel:

Fördersatz passt sich an, wenn:

- Technologiepreise sinken,
- Mitnahmeeffekt steigt,
- Lieferkette knapp wird,
- alternative Option bessere Wirkung zeigt.

## 8. Policy Coherence

Eine gute Einzelmaßnahme kann durch eine andere Politik neutralisiert werden.

Beispiel:

- Förderung klimaarmer Mobilität,
- gleichzeitig Subventionen für hohen fossilen Verbrauch.

WÖk prüft deshalb:

`POLICY_COHERENCE`.

Fragen:

- ziehen Instrumente in dieselbe Zielrichtung?
- gibt es gegenläufige Anreize?
- unterschiedliche Ressorts/Politikebenen?
- zeitliche Inkonsistenz?

## 9. Robustheit statt Optimallösung

Eine Option kann unter einem Szenario optimal und unter leicht anderer Zukunft schlecht sein.

WÖk bevorzugt deshalb oft robuste Designs:

- mehrere Szenarien,
- modulare Strukturen,
- Reversibilität,
- Fallbacks,
- geringe Lock-ins.

Das ist besonders wichtig bei hoher Unsicherheit.

## 10. Beispiel: kommunale Wärmeplanung

Architektur kann verbinden:

- Gebäudedaten,
- Netz-/Erzeugungskapazität,
- Sanierung,
- Preis-/Förderlogik,
- soziale Schutzmechanismen,
- Fachkräfte,
- Zeitplan,
- Monitoring.

Ein einzelnes Technologiegebot würde diese Systemebenen nicht abdecken.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Wirkungsarchitektur | integriertes Design von Problem, Ziel, Hebeln, Daten, Governance und Rückkopplung |
| Systemhebel | Intervention mit Einfluss auf zentrale Mechanismen/Engpässe |
| Adaptive Governance | regelgebundene Anpassung von Instrumenten an neue Evidenz |
| Policy Coherence | Konsistenz mehrerer Maßnahmen/Politikebenen gegen gemeinsame Ziele |
| Second-order Governance | Wirkung der Steuerungsarchitektur selbst |
| Robust Design | unter mehreren plausiblen Szenarien tragfähige Option |

## 12. Typische Fehlinterpretationen

### „Wirkungsarchitektur = Dashboard.“
Falsch.

### „Ein Hebel reicht immer.“
Falsch.

### „Adaptive Governance = Regeln jederzeit beliebig ändern.“
Falsch; Trigger/Version/Begründung sind zentral.

### „Mehr Daten lösen fehlende Zuständigkeit.“
Falsch.

### „Optimallösung unter Basisszenario ist automatisch robust.“
Falsch.

## 13. WÖk-Abgrenzung

Systems Thinking, adaptive governance, policy design und feedback control existieren lange. WÖk integriert diese Logiken mit MPD/SDG/DNS/Recht, Nichtkompensation, standardisierten Wirkpfaden und Reality Checks.

## 14. Quellen

- OECD Strategic Foresight: https://www.oecd.org/strategic-foresight/
- OECD Regulatory Policy: https://www.oecd.org/gov/regulatory-policy/
- EU Better Regulation: https://commission.europa.eu/law/law-making-process/planning-and-proposing-law/better-regulation/better-regulation-guidelines-and-toolbox_en
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 15. Transferaufgabe

Wähle ein komplexes Systemproblem.

Erstelle:

- Problem-/Goal Review,
- Systemgrenze,
- Akteurskarte,
- vier Hebeltypen,
- drei Optionsportfolios,
- Delivery-Risiken,
- Policy-Coherence-Check,
- fünf State Variables,
- zwei Recheck Trigger,
- einen Fallback.

## 17. Prüfungsrelevanz

- Designprozess,
- Hebeltypen,
- Feedback vs. Reporting,
- Second-order Governance,
- Policy Coherence,
- Adaptive Governance,
- Robustheit/Fallback.

## 18. Sprechertext

Eine Wirkungsarchitektur ist kein schönes Dashboard.

Das Dashboard ist höchstens das Armaturenbrett.

Die eigentliche Frage ist: Was passiert, wenn die Warnlampe angeht?

Wer kann handeln? Welche Regel ändert sich? Gibt es Geld? Personal? Einen Fallback?

Komplexe Probleme brauchen meistens mehrere Hebel.

Information. Anreize. Kapazität. Regeln.

Und diese Hebel müssen zusammenpassen.

Wenn wir klimafreundliche Mobilität fördern und gleichzeitig fossile Nutzung billig halten, haben wir ein Kohärenzproblem.

Wenn wir einen KPI belohnen, wird er optimiert. Also müssen wir auch die Wirkung unserer Steuerungsarchitektur selbst beobachten.

Und weil die Zukunft unsicher ist, bauen wir adaptive Regeln.

Nicht beliebig.

Mit Triggern, Versionen und Begründungen.

Der Merksatz lautet:

**Wirkung entsteht nicht dadurch, dass wir sie messen. Wirkung entsteht, wenn Messung, Entscheidung, Handlung und Lernen zu einem funktionierenden Regelkreis verbunden sind.**

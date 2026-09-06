<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24 path=content/lehrgaenge/akademie/curriculum-v4/lectures/gov-12-enap-woek-benchmarklabor.md curriculum=4.0 sanitized=true -->
# GOV-12 · Staatliche GFA/eNAP vs. WÖk: Benchmarklabor mit realen Bundesfällen

**lecture_id:** `WOEK-G-GOV-COMPARE-01`  
**display_code:** `GOV-12`  
**curriculum_version:** `4.0`  
**part:** 4 · Staatliche Nachhaltigkeits- und Folgenprüfungsarchitektur  
**module:** G4.4 · Parlament, Aktionsplan und Vergleichslabor  
**status:** `FACH_ENDCONTENT_REVIEWED_CASESET_V2`  
**source_version:** `2026-08-21.2`  
**reviewed_at:** 2026-08-21  
**change_reason:** Der Benchmark trennt nun öffentlich sichtbare GFA-/Nachhaltigkeitsdarstellung, öffentlich sichtbare eNAP-Zusammenfassung und objektbezogen nachgewiesene eNAP-Nutzung. Fehlende öffentliche eNAP-Dokumentation wird niemals als fehlende Prüfung interpretiert.

## 20-Sekunden-Einstieg

Die faire Frage ist nicht „eNAP oder WÖk - wer gewinnt?“. Sie lautet: **Was dokumentiert die staatliche Folgen- und Nachhaltigkeitsprüfung bereits, und was ergänzt die WÖk?** Fünf reale Bundesvorhaben zeigen häufig Konvergenz bei der Grundrichtung. Der WÖk-Zusatz liegt vor allem in expliziten Kausalpfaden, Bedingungen, Gegenfaktum, Verteilung, Delivery, Rebound, Lock-in und späterem Reality Check. Ein Benchmark darf ausdrücklich zum Ergebnis kommen: **Die staatliche Prüfung war an dieser Stelle bereits gut.**

## Lernziele

Nach dieser Vorlesung kannst du:

1. den Layer `STATE_GFA_ENAP_BENCHMARK` korrekt aufbauen.
2. öffentliche GFA-/Nachhaltigkeitsdarstellung, öffentliche eNAP-Zusammenfassung und eNAP-Nutzungsstatus unterscheiden.
3. staatliche Ex-ante-Einschätzung und unabhängiges WÖk-Urteil strikt trennen.
4. Konvergenz, Zusatzbefund und echten Widerspruch unterschiedlich behandeln.
5. erklären, warum gemeinsame Eingangsdaten noch keine unabhängige Validierung erzeugen.
6. aus Benchmarks methodische Verbesserungen und spätere Reality Checks ableiten.

## 1. Der zentrale Dokumentationsfehler

Bei Bundesregelungsvorhaben kann öffentlich eine Nachhaltigkeitsdarstellung in Entwurf oder Begründung vorliegen, ohne dass ein separater öffentlicher eNAP-Auszug auffindbar ist.

Daraus darf **nicht** geschlossen werden:

> „eNAP wurde nicht genutzt.“

Korrekt ist nur:

> „Eine öffentliche eNAP-Zusammenfassung ist für dieses Objekt nicht nachgewiesen.“

Deshalb trennt v4.0 vier Fragen:

- Ist eine öffentliche GFA-/Nachhaltigkeitsdarstellung verfügbar?
- Ist eine öffentliche eNAP-Zusammenfassung verfügbar?
- Ist die eNAP-Nutzung für dieses konkrete Objekt durch eine Quelle bestätigt?
- Welchen allgemeinen Verfahrensstatus hat die Nachhaltigkeitsprüfung/eNAP im Bund?

## 2. Verbindliches Datenmodell

Für geeignete Bundesregelungsvorhaben gilt mindestens:

```text
STATE_GFA_ENAP_BENCHMARK

public_gfa_sustainability_section_available: true | false | open
public_enap_summary_available: true | false | open

enap_use_status:
  CONFIRMED_BY_SOURCE
  | PROCEDURALLY_EXPECTED_NOT_OBJECT_PROVEN
  | EXCEPTION_DOCUMENTED
  | OPEN

public_documentation_status:
  GFA_SUSTAINABILITY_PUBLIC_ENAP_PUBLIC
  | GFA_SUSTAINABILITY_PUBLIC_ENAP_NOT_PUBLICLY_ESTABLISHED
  | PARTIAL_PUBLIC_DOCUMENTATION
  | NOT_PUBLICLY_ESTABLISHED
  | OPEN

gfa_scope
sustainability_assessment_scope
dns_targets_indicators
sdg_targets
positive_effects_identified_by_state
negative_effects_identified_by_state
target_conflicts_identified_by_state
long_term_effects
third_country_spillovers
woek_convergence
woek_additional_findings
woek_disagreement
evidence_grade
source_refs
```

**Harte Regel:** `public_enap_summary_available = false` bedeutet nur **keine öffentliche Zusammenfassung nachgewiesen**. Es bedeutet weder `NOT_ASSESSED` noch automatisch `eNAP not used`.

## 3. Was verglichen wird - und was nicht

Die staatliche Einschätzung bleibt ein eigenes Quellobjekt. WÖk kopiert sie nicht in das eigene Urteil.

Drei legitime Ergebnisse:

### Konvergenz
Staatliche Prüfung und WÖk sehen dieselbe Wirkungsrichtung.

### Zusatzbefund
Grundrichtung gleich, aber WÖk macht weitere Mechanismen, Bedingungen, Verteilung, Gegenfaktum, Delivery oder Evidenzlücken sichtbar.

### Echter Widerspruch
Bei derselben abgegrenzten Frage ergeben sich unterschiedliche Ergebnisse. Dann müssen Annahmen und Evidenz explizit gegenübergestellt werden.

**Widerspruch ist kein Qualitätsmerkmal an sich.** Künstliche Differenz würde den Benchmark entwerten.

## 4. Methodischer Lesepfad für jeden Fall

1. Primärquelle / Regelungstext / Begründung sichern.
2. Öffentliche GFA-/Nachhaltigkeitsdarstellung identifizieren.
3. Separate öffentliche eNAP-Dokumentation suchen.
4. Dokumentationsstatus und eNAP-Nutzungsstatus getrennt codieren.
5. Staatliche Problem-, Ziel- und Wirkungsaussagen extrahieren.
6. DNS-/SDG-Bezüge als Ziel-/Referenzbezug behandeln - nicht als Kausalitätsbeweis.
7. WÖk unabhängig durchführen:
   `Problem Review -> Goal Review -> A→M→ΔZ→R -> 1.-3. Ordnung/Kaskaden -> Verteilung/Resilienz -> Gegenfaktum/Attribution -> Omissions/Delivery/Policy Coherence -> Optionsvergleich -> Reality Check`.
8. Konvergenz, Zusatzbefund und Widerspruch getrennt dokumentieren.

## 5. Fall 1 - StromVKG, BT-Drs 21/6279

**Öffentliche staatliche Dokumentation:** Regierungsentwurf/Begründung mit Nachhaltigkeitsdarstellung ist öffentlich.  
**Öffentliche eNAP-Zusammenfassung:** sofern nicht separat als objektbezogene Primärquelle nachgewiesen, `NOT_PUBLICLY_ESTABLISHED`.  
**eNAP-Nutzungsstatus:** ohne objektbezogenen Beleg `PROCEDURALLY_EXPECTED_NOT_OBJECT_PROVEN`.

### Staatlicher Befund
Der Entwurf adressiert gesicherte Leistung und Investitionsanreize für Versorgungssicherheit. Die Nachhaltigkeitsdarstellung verknüpft Versorgungssicherheit, wirtschaftliche Leistungsfähigkeit, Investitionen und Klimaschutz; neue Kraftwerke sollen wasserstofffähig und perspektivisch klimaneutral sein.

### WÖk-Konvergenz
Ein geeigneter Kapazitätsmechanismus kann Investitionsanreize für gesicherte Leistung verbessern.

### WÖk-Zusatz
- `H2-ready != tatsächliche Dekarbonisierung`
- Brennstoffverfügbarkeit und -preis
- fossiler Lock-in
- Speicher-/Flexibilitätsalternativen
- Umlage/Verteilung
- Delivery-Zeitpfade
- Gegenfaktum zu ohnehin stattfindenden Investitionen

**Lernpunkt:** Versorgungssicherheitslogik kann konvergieren; Klimawirkung bleibt konditional und falsifizierbar.

## 6. Fall 2 - IVSG, BT-Drs 21/2999

**Öffentliche staatliche Dokumentation:** öffentliches Regelungsvorhaben mit Nachhaltigkeitsdarstellung.  
**Öffentliche eNAP-Zusammenfassung:** nur `true`, wenn separat objektbezogen belegt; sonst `NOT_PUBLICLY_ESTABLISHED`.  
**eNAP-Nutzungsstatus:** ohne Objektbeleg `PROCEDURALLY_EXPECTED_NOT_OBJECT_PROVEN`.

### Staatlicher Befund
Datenbereitstellung, Interoperabilität und digitale Verkehrsdienste sollen Verkehrssteuerung und nachhaltige Mobilität verbessern.

### WÖk-Konvergenz
Bessere Daten können Verkehrssteuerung und multimodale Dienste verbessern.

### WÖk-Zusatz
- führt Nutzung tatsächlich zu Modal Shift?
- optimiert sie nur Autoverkehr?
- Rebound / induzierter Verkehr?
- Zugänglichkeit nach Gruppen/Regionen?
- welche Daten zeigen tatsächliche Verhaltens- und Emissionsänderung?

**Lernpunkt:** staatlicher Wirkpfad kann bereits kausal formuliert sein; WÖk zerlegt Bedingungen und Zwischenschritte.

## 7. Fall 3 - BRUBEG, BT-Drs 21/3058

**Öffentliche staatliche Dokumentation:** öffentlich; europarechtlicher Umsetzungskontext und Nachhaltigkeitsdarstellung sind Teil der Primärunterlagen.  
**Öffentliche eNAP-Zusammenfassung:** separat prüfen; ohne Beleg `NOT_PUBLICLY_ESTABLISHED`.  
**eNAP-Nutzungsstatus:** ohne Objektbeleg `PROCEDURALLY_EXPECTED_NOT_OBJECT_PROVEN`.

### Staatlicher Befund
Finanzstabilität, ESG-Risikomanagement und langfristige Finanzierung werden als relevante Wirkungen/Bezüge beschrieben; nationaler Gestaltungsspielraum ist wegen EU-Recht teilweise begrenzt.

### WÖk-Konvergenz
Besseres Risikomanagement und Aufsicht können die Resilienz des Finanzsystems stärken.

### WÖk-Zusatz
Lange Ketten wie `Bankenresilienz -> Finanzierung -> Wachstum -> Armutsminderung` werden nicht als ein gesicherter Effekt behandelt. Zwischenmechanismen, Alternativerklärungen und Attribution werden getrennt. Begrenzter nationaler Spielraum wird als `COMPETENCE/OPTION_SPACE` geführt.

## 8. Fall 4 - Pflege, BT-Drs 21/1511

**Öffentliche staatliche Dokumentation:** öffentlich.  
**Öffentliche eNAP-Zusammenfassung:** separat prüfen; ohne Beleg `NOT_PUBLICLY_ESTABLISHED`.  
**eNAP-Nutzungsstatus:** ohne Objektbeleg `PROCEDURALLY_EXPECTED_NOT_OBJECT_PROVEN`.

### Staatlicher Befund
Demografischer Druck, Pflegebedarf und Fachkräfteengpässe werden adressiert; Kompetenzen von Pflegefachpersonen, Prävention, Digitalisierung und regionale Versorgung sollen gestärkt werden.

### WÖk-Konvergenz
Hohe plausible Konvergenz bei besserer Kompetenznutzung, Prävention und weniger unnötigen Schnittstellen.

### WÖk-Zusatz
- Personalverfügbarkeit
- Aufgabenentlastung vs. Aufgabenverdichtung
- regionale Verteilung
- Finanzierung/Delivery
- Auswirkungen auf andere Berufsgruppen
- Outcome-Indikatoren für Versorgungsqualität

**Lernpunkt:** Zusatznutzen kann in Systemtiefe und Monitoring liegen, auch wenn die staatliche Richtung überzeugt.

## 9. Fall 5 - UWG, BT-Drs 21/1855

**Öffentliche staatliche Dokumentation:** öffentlich.  
**Öffentliche eNAP-Zusammenfassung:** separat prüfen; ohne Beleg `NOT_PUBLICLY_ESTABLISHED`.  
**eNAP-Nutzungsstatus:** ohne Objektbeleg `PROCEDURALLY_EXPECTED_NOT_OBJECT_PROVEN`.

### Staatlicher Befund
Regeln gegen irreführende Umwelt-/Nachhaltigkeitsaussagen stärken Informations- und Verbraucherschutz und sollen nachhaltigere Konsumentscheidungen unterstützen.

### WÖk-Konvergenz
Die unmittelbare Informations-/Rechtswirkung ist plausibel positiv.

### WÖk-Zusatz
Die längere Kette wird getrennt:

`bessere Information -> andere Kaufentscheidung -> Nachfrage -> Angebot -> Umweltzustand`

Zu prüfen sind Durchsetzung, Umgehungsstrategien, Informationsüberlastung, Verhaltenseffekte, Marktreaktion und spätere Umwelt-Outcomes.

## 10. Vergleichsmatrix

| Fall | staatliche Kernrichtung | WÖk-Konvergenz | typischer Zusatz |
|---|---|---|---|
| StromVKG | Versorgungssicherheit + Klimabeitrag | Versorgungssicherheit hoch | H2-/Lock-in-Bedingungen, Alternativen, Umlage, Gegenfaktum |
| IVSG | Daten/Digitalisierung -> Mobilitätsnutzen | Daten-/Steuerungsnutzen hoch | Modal Shift, Rebound, induzierter Verkehr, Verteilung |
| BRUBEG | Resilienz/ESG -> Finanzsystem | Resilienz hoch | lange Kausalketten, Kompetenz, Attribution |
| Pflege | Versorgung/Kompetenz/Prävention | hoch | Delivery, Personal, Region, Outcome-Design |
| UWG | Information/Recht -> nachhaltigerer Konsum | unmittelbare Wirkung hoch | Downstream-Verhalten, Marktreaktion, Umweltattribution |

## 11. Was der Benchmark über staatliche Prüfung lehrt

Die staatliche GFA ist breiter als nur der Abschnitt „Nachhaltigkeitsaspekte“. Kosten, Erfüllungsaufwand, Alternativen, Vollzug, Evaluation, EU-Kompetenz und andere Folgen können an anderen Stellen stehen. Deshalb darf WÖk niemals nur den Nachhaltigkeitsabschnitt lesen und daraus die gesamte staatliche Folgenprüfung rekonstruieren.

Außerdem gilt:

- eNAP ist das Prüfwerkzeug, nicht die Rechtsgrundlage der Nachhaltigkeitsprüfung.
- §44 GGO und weitere GGO-Vorgaben bilden die Verfahrens-/Folgenprüfungsarchitektur.
- DNS-/SDG-Zielbezug ist kein Kausalitätsbeweis.
- öffentlich nicht dokumentiert ist nicht gleich nicht geprüft.

## 12. Was der Benchmark über WÖk lehrt

WÖk ist am stärksten, wenn sie nicht behauptet, Folgenprüfung erfunden zu haben, sondern vorhandene staatliche Prüfung ergänzt durch:

- Problem Review
- Goal Review
- explizite Mechanismen
- Wirkungen 1.-3. Ordnung/Kaskaden
- Verteilung/Resilienz
- Gegenfaktum/Attribution
- Omissions/Delivery/Policy Coherence
- fairen Optionsvergleich
- Reality Check/Falsifikationskriterien
- Nichtkompensation harter Schutzgrenzen

Wenn ein staatliches Verfahren diese Funktionen im Einzelfall bereits gut erfüllt, ist **Konvergenz** der richtige Befund.

## 13. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| GFA | staatliche Gesetzesfolgenabschätzung; mehrere Folgen-/Prüfaspekte, nicht nur Nachhaltigkeit |
| Nachhaltigkeitsprüfung | Prüfung nachhaltigkeitsrelevanter Wirkungen im Rahmen der GFA |
| eNAP | elektronisches Prüfwerkzeug zur Nachhaltigkeitsprüfung; nicht die Rechtsgrundlage selbst |
| öffentliche GFA-/Nachhaltigkeitsdarstellung | öffentlich sichtbare Angaben in Regelungsunterlagen |
| öffentliche eNAP-Zusammenfassung | separat öffentlich zugänglicher, objektbezogener eNAP-Auszug/Output |
| Konvergenz | staatliche und WÖk-Einschätzung kommen bei derselben Frage in dieselbe Richtung |
| Zusatzbefund | WÖk ergänzt Tiefe/Bedingungen/Verteilung/Evidenz ohne Grundwiderspruch |
| Widerspruch | unterschiedliche Ergebnisse bei derselben abgegrenzten Frage |

## 14. Typische Fehlinterpretationen

**„Kein öffentliches eNAP-PDF = keine Nachhaltigkeitsprüfung.“** - Falsch.

**„GFA und eNAP sind dasselbe.“** - Falsch. eNAP ist ein Werkzeug innerhalb der Nachhaltigkeitsprüfung/GFA-Architektur.

**„Wenn DNS/SDGs passen, ist die Wirkung bewiesen.“** - Falsch. `Target Alignment != Causality`.

**„WÖk muss im Benchmark anders urteilen.“** - Falsch. Konvergenz ist ein valides Ergebnis.

**„Nur der Nachhaltigkeitsabschnitt ist staatliche Folgenprüfung.“** - Falsch. Die GFA umfasst weitere Folgen- und Prüffelder.

## 15. Primärquellen / Fallquellen

- GGO §§43-44: https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_21072009_O11313012.htm
- BMJV - Nachhaltige Gesetzgebung: https://www.bmj.de/DE/ministerium/nachhaltigkeit/gesetzgebung/gesetzgebung_artikel.html
- E-Gesetzgebung/eGFA/eNAP: https://plattform.egesetzgebung.bund.de/cockpit/#/egfa
- Bundestag Drucksache 21/6279 - StromVKG
- Bundestag Drucksache 21/2999 - IVSG
- Bundestag Drucksache 21/3058 - BRUBEG
- Bundestag Drucksache 21/1511 - Pflege
- Bundestag Drucksache 21/1855 - UWG

**Freshness/Provenienz:** Für jede Fallmatrix müssen die konkrete Drucksache, der öffentliche Dokumentationsstatus und ein objektbezogener eNAP-Nutzungsbeleg separat versioniert werden. Keine Verfahrensvermutung darf als Objektbeweis erscheinen.

## 16. Transferaufgabe

Nimm einen aktuellen Bundesgesetzentwurf und erstelle zunächst nur die vier Statusfelder:

1. `public_gfa_sustainability_section_available`
2. `public_enap_summary_available`
3. `enap_use_status`
4. `public_documentation_status`

Begründe jedes Feld mit einer konkreten Primärquelle oder markiere es `OPEN/NOT_PUBLICLY_ESTABLISHED`. Erst danach vergleichst du staatliche Aussagen mit der WÖk.

## 18. Prüfungsrelevanz

Prüfungsfähig sind die vier Dokumentations-/Nutzungsstatusfelder, State-vs.-WÖk-Trennung, Konvergenz/Zusatz/Widerspruch, `Target Alignment != Causality` und die Regel `NOT_PUBLICLY_ESTABLISHED != NOT_ASSESSED`.

## 19. Sprechertext

Ein fairer Vergleich beginnt mit einer überraschend einfachen Regel: Wir dürfen nur vergleichen, was wir wirklich öffentlich belegen können. Ein Gesetzentwurf kann eine ausführliche Nachhaltigkeitsdarstellung enthalten, ohne dass daneben ein separates öffentliches eNAP-Dokument liegt. Dann sagen wir nicht: „eNAP wurde nicht genutzt.“ Wir sagen: „Eine öffentliche eNAP-Zusammenfassung ist für dieses Vorhaben nicht nachgewiesen.“

Erst danach beginnt der interessante Teil. Was erkennt die staatliche Prüfung bereits? Welche Wirkungsrichtung, Zielkonflikte oder Langfristfolgen nennt sie? Und was ergänzt die WÖk durch Problemprüfung, Zielprüfung, explizite Mechanismen, Gegenfaktum, Verteilung, Delivery oder Reality Check?

Bei unseren fünf Bundesfällen sehen wir etwas Wichtiges: Oft ist die Grundrichtung gar nicht strittig. Bei Pflege, intelligenter Mobilität oder Verbraucherschutz gibt es viel Konvergenz. Das ist kein Problem für die WÖk - im Gegenteil. Es zwingt uns, ihren Zusatznutzen präzise zu benennen, statt den Staat künstlich kleinzureden.

Der Benchmark ist deshalb nicht nur eine Prüfung staatlicher Verfahren. Er ist eine Selbstprüfung der Wirkungsökonomie. Und genau so sollte Wissenschaft funktionieren.

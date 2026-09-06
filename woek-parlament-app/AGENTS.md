# AGENTS.md - Wirkungsportal Parlament

**Version:** 1.0  
**Stand:** 16. August 2026  
**Geltung:** gesamtes Projekt `parlament.wirkungsoekonomie.de`, einschließlich Frontend, Backend, Inhalte, Datenmodelle, Imports, Fachakten, Wahlprogramme, Koalitionsverträge, parlamentarische Fälle, Abstimmungsdaten, Abgeordneten-/Wahlkreisansichten, Sachsen-Anhalt, Quellenregister, Downloads, Feeds, Tests, Build- und Release-Prozesse.

**Erbt verbindlich:** die nächsthöhere/root `AGENTS.md` der Wirkungsökonomie.  
**Führende Terminologie:** Führender Begriffsleitfaden der Wirkungsökonomie, aktuell v1.5 vom 15.08.2026.  
**Portalvertrag:** `PUBLICATION_CONTRACT.md` in seiner jeweils freigegebenen Fassung.  
**Grundsatz:** Untergeordnete technische Regeln dürfen diese fachlichen Anforderungen ergänzen, niemals abschwächen.

> **Portalmission**  
> Politische Entscheidungen sollen nicht getroffen werden, ohne vorher systematisch sichtbar zu machen, was sie bewirken können. Nach der Entscheidung wird geprüft, was tatsächlich umgesetzt wurde, welche Zustände sich verändert haben, was sich zurechnen lässt und was daraus für die nächste Entscheidung folgt.

> **Arbeitsformel**  
> Problem → Entscheidungsgegenstand → Entscheidungsreife → Folgencheck → Entscheidung → Umsetzung → Beobachtung → Gegenfaktum/Zurechnung → Wirkungsbewertung → Rückkopplung.

---

# 0. Zweck dieser Projekt-AGENTS.md

Diese Datei ist die fachliche und operative Betriebsanweisung für Agents und Code, die am Wirkungsportal Parlament arbeiten.

Sie soll insbesondere verhindern, dass

- Fachanalysen beim Rendering gekürzt werden,
- amtliche Fakten und WÖk-Bewertungen vermischt werden,
- Wirkungspotenzial als eingetretene Wirkung formuliert wird,
- politische Programme mit Umsetzung gleichgesetzt werden,
- Fraktionspositionen als Individualstimmen ausgegeben werden,
- Personen oder Parteien mit scheinobjektiven Gesamtscores bewertet werden,
- kommunikative Wirkungspfade ohne Evidenz zu Kausalbehauptungen werden,
- offene Datenlagen als neutral oder `0` behandelt werden,
- historische Wissensstände mit späterer Evidenz vermischt werden,
- UI-Vereinfachung Fachsubstanz entfernt.

Wenn eine Aufgabe technisch möglich, aber fachlich nicht freigegeben ist, hat die fachliche Grenze Vorrang.

---

# 1. Vorrangordnung

Bei Konflikten gilt in dieser Reihenfolge:

1. Root-`AGENTS.md` der Wirkungsökonomie.
2. Führender Begriffsleitfaden, aktuell v1.5.
3. Dieser projektbezogene `AGENTS.md`.
4. Freigegebener `PUBLICATION_CONTRACT.md`.
5. Freigegebene Fachquelle/Fachakte und deren Datenmodell.
6. Release-QA, Schemas, Content-Integrity-Manifest und Tests.
7. UI-/Design-/Komponentenregeln.
8. Convenience, Kürze, Performance oder redaktionelle Präferenz.

Zusätzlich gilt:

> **Aktuelle Fachquelle vor älterer Fassung - tatsächliche Zustandsveränderung vor Absicht/Output - offene Unsicherheit vor Scheingenauigkeit - Wirkungsgrenze vor Durchschnittsscore - Source Fidelity vor redaktioneller Eleganz.**

Wenn zwei Fachquellen widersprechen, nicht stillschweigend „harmonisieren“. Konflikt markieren, zuständige Quelle bestimmen oder neue Version anlegen.

---

# 2. Was das Portal ist - und was nicht

Das Portal ist:

- Folgencheck vor politischen Entscheidungen,
- quellengebundene Fachanalyse,
- Transparenz über Entscheidungsgegenstand und Entscheidungsreife,
- Verbindung von Programmen, Koalitionsvereinbarungen, Parlament, Umsetzung und späterer Wirkung,
- Monitoring- und Lerninfrastruktur,
- öffentlicher Zugang zu vollständigen Fachakten,
- bei namentlichen Abstimmungen Transparenz über dokumentiertes individuelles Abstimmungsverhalten.

Das Portal ist nicht:

- Wahlwerbung,
- Parteienranking,
- Abgeordnetenranking,
- Gesinnungsprüfung,
- Prognosemaschine,
- amtliches Angebot des Bundestages oder eines Landtages,
- Ersatz für parlamentarische Entscheidung,
- Faktencheck allein,
- Wahl-O-Mat-Ersatz,
- Kurzfassungsmaschine für lange Fachanalysen.

---

# 3. Source Fidelity - wichtigste technische Publikationsregel

## 3.1 SOURCE_FIDELITY = 100 %

Eine freigegebene Fachanalyse ist selbst das zu veröffentlichende Produkt.

Die Website ist:

- Struktur,
- Navigation,
- Darstellung,
- Visualisierung,
- Such- und Filterebene.

Die Website ist **kein redaktioneller Filter**.

Agents dürfen freigegebene Fachinhalte niemals eigenmächtig:

- kürzen,
- zusammenfassen,
- paraphrasieren,
- umformulieren,
- semantisch deduplizieren,
- Wirkpfade verschmelzen,
- Gegenargumente entfernen,
- Datenlücken entfernen,
- Unsicherheiten entfernen,
- Quellen einsparen,
- Berechnungslogik vereinfachen,
- Schlussfolgerungen verstärken oder abschwächen,
- Fachtext durch Karten/Grafiken/PDFs ersetzen.

## 3.2 Zulässige Transformation

Erlaubt sind nur bedeutungserhaltende Darstellungsänderungen:

- Überschriftenhierarchie,
- Inhaltsverzeichnis,
- Deep Links,
- Akkordeons,
- Tabs,
- visuelle Gruppierung,
- Listen-/Tabellenformatierung,
- Verlinkung,
- maschinenlesbare Quellen- und Versionsmetadaten,
- offensichtliche Tippfehlerkorrektur, wenn keine fachliche Aussage verändert wird.

Bei möglichem fachlichem Fehler: nicht still korrigieren. `SOURCE_CONFLICT` oder `EDITORIAL_REVIEW_REQUIRED` setzen.

## 3.3 PDF-Regel

PDF ist Zusatzformat.

Wenn die Fachquelle inline publizierbar ist, darf die öffentliche Seite nicht aus kurzem Teaser plus PDF-Download bestehen.

## 3.4 Inhaltsintegrität

Für jede Fachquelle ein Manifest führen:

```text
source
source_version
source_sha256
rendered_route
required_content_paths
rendered_content_paths
exact_duplicate_mappings
unrendered_content_paths
terminology_version
verified_at
```

Release-Gate:

```text
unrendered_content_paths = []
```

Exakte Dubletten dürfen nach nachgewiesener Gleichheit einmal angezeigt werden. Ähnliche, aber nicht identische Inhalte dürfen niemals zusammengeführt werden.

---

# 4. Epistemische Aussageklassen

Jeder tragende Satz muss intern einer Aussageklasse zuordenbar sein.

## 4.1 FAKT

Amtlicher, rechtlicher, dokumentarischer oder anderweitig belastbar belegbarer Sachverhalt.

Beispiele:

- Vorlage X wurde am Datum Y eingebracht.
- Abgeordnete A stimmte in einer amtlichen namentlichen Abstimmung mit Ja.

## 4.2 BEOBACHTUNG / MESSWERT

Dokumentierter Zustand oder Datenpunkt.

Beobachtung ist noch keine Kausalität.

## 4.3 WÖk-DEFINITION / WÖk-MODELLSATZ

Festlegung innerhalb der Wirkungsökonomie.

Als WÖk-eigene Definition/Architektur erkennbar halten.

## 4.4 ANALYTISCHE INFERENZ

Begründete Schlussfolgerung aus Fakten und Beobachtungen.

Nicht als Fakt tarnen.

## 4.5 WIRKUNGSPOTENZIAL

Mögliche Zustandsveränderung unter Bedingungen.

Ex ante.

## 4.6 WIRKUNGSRISIKO

Mögliche negative oder destabilisierende Zustandsveränderung.

Risiko ist noch kein Schaden.

## 4.7 EINGETRETENE ZUSTANDSVERÄNDERUNG / WIRKUNGSFESTSTELLUNG

Tatsächlich beobachtete oder belastbar rekonstruierte Veränderung.

## 4.8 ZURECHNUNG / CONTRIBUTION

Frage, welchen kausalen Anteil oder Beitrag ein Auslöser an der Veränderung hatte.

Keine künstliche Prozentgenauigkeit.

Zulässige öffentliche Stufen:

- direkte Zurechnung,
- plausibler Beitrag,
- systemische Mitwirkung,
- derzeit unklar.

## 4.9 NORMATIVE WIRKUNGSBEWERTUNG

Einordnung am offengelegten Referenzrahmen.

Fakt, Wirkung und Norm nie in einem Satz verschmelzen, wenn dadurch der Status unklar wird.

---

# 5. Kernbegriffe

Verbindlich nach v1.5:

- **Wirkung:** tatsächliche Zustandsveränderung; zunächst neutral.
- **Wirkungspotenzial:** Möglichkeit einer Veränderung; keine eingetretene Wirkung.
- **Wirkungsrisiko:** Möglichkeit negativer Veränderung; kein Schaden.
- **Wirkmechanismus:** begründete Kausalhypothese; kein Beweis.
- **Wirkungsfeststellung:** Feststellung einer eingetretenen Zustandsveränderung.
- **Wirkungsnachweis:** Prüfung der Belastbarkeit dieser Feststellung.
- **Attribution:** kausale/beitragsbezogene Zuordnung.
- **Contribution:** plausibler Beitrag bei komplexer Kausalität.
- **Wirkungsbewertung:** Einordnung am Referenzrahmen.
- **Neutral:** inhaltlich neutral, nicht datenlos.
- **Ambivalent:** gegenläufige Wirkungsrichtungen.
- **Offen:** unzureichende Daten/Evidenz; kein Nullwert.
- **Nichtkompensation:** schwere Schäden dürfen nicht beliebig verrechnet werden.
- **Reverse Merit Order:** mögliche Operationalisierung der Schutzlogik.
- **Transformationswirkung:** strukturelle Veränderung; nicht automatisch positiv.
- **Rückkopplung:** Erkenntnis verändert nächste Entscheidung.

IOOI ist externe optionale Teilmethode. Die WÖk ist nicht „IOOI plus Bewertung“.

`Wirkungsradar` ist Portal-/Analyseinstrument, nicht Spinnennetzgrafik. Spinnennetzgrafik = **Wirkungsprofil im Radardiagramm**.

---

# 6. Der politische Wirkungsregelkreis

Das Portal organisiert Inhalte grundsätzlich entlang folgender Kette:

```text
Problem / Ausgangszustand
→ politische Handlungsoptionen
→ Entscheidungsgegenstand bestimmen
→ Entscheidungsreife prüfen
→ WÖk-Folgencheck
→ parlamentarische/politische Entscheidung
→ Umsetzung
→ Monitoring
→ beobachtete Zustandsveränderung
→ Gegenfaktum
→ Attribution / Contribution
→ Wirkungsbewertung
→ Rückkopplung / Korrektur
```

Kein Schritt darf durch einen späteren Schritt rückwirkend ersetzt werden.

---

# 7. Entscheidungsreife-Gate

Vor jedem Folgencheck einer noch veränderbaren Vorlage prüfen:

1. Was wird konkret entschieden?
2. Welche Fassung ist maßgeblich?
3. Welche Entscheidungselemente sind offen?
4. Wer ist zuständig?
5. Sind Zielgruppe, Umfang, Schwellenwerte, Finanzierung, Ausnahmen und Vollzug bestimmt?
6. Sind Schutzmechanismen und Rechtsrahmen ausreichend bestimmt?
7. Ist ein plausibler Wirkmechanismus formulierbar?
8. Gibt es einen sinnvollen Gegenfaktums- oder Alternativenvergleich?
9. Welche Information fehlt vor der Entscheidung?

Datenfeld:

```text
decision_readiness:
  status: CLEAR | CONDITIONAL | NOT_DECISION_READY
  rationale:
  missing_decision_parameters:
  better_decision_question:
```

`NOT_DECISION_READY` ist kein politischer Tadel. Es ist ein fachlicher Informationsbefund.

---

# 8. Fünf Statusdimensionen getrennt halten

Jede Fallakte besitzt unabhängig voneinander:

## A. Amtlicher Status

z. B.:

```text
ANNOUNCED
DRAFT
CABINET_DRAFT
INTRODUCED
COMMITTEE
ADOPTED
BUNDESRAT
PROMULGATED
IN_FORCE
IMPLEMENTING
```

## B. WÖk-Reifestufe

z. B.:

```text
PRE_REVIEW
METHOD_REVIEW
EVIDENCE_REVIEW
MONITORING
EX_POST_EVALUATION
```

## C. Evidenzstatus

z. B.:

```text
OFFICIAL_FACT
EMPIRICALLY_SUPPORTED
PLAUSIBLE_PATH
MODEL_ASSUMPTION
OPEN
```

## D. Zurechnungsstatus

```text
DIRECT
PLAUSIBLE_CONTRIBUTION
SYSTEMIC_CONTRIBUTION
UNCLEAR
```

## E. Entscheidungsreife

```text
CLEAR
CONDITIONAL
NOT_DECISION_READY
```

Keine gemeinsame Ampel erzeugen.

---

# 9. Vollständiger Folgencheck vor der Entscheidung

Eine fachlich tiefe Ex-ante-Akte prüft mindestens:

- Baseline und Problem,
- Zielzustand,
- Instrument,
- Zuständigkeit,
- Wirkmechanismus,
- Wirkungspotenziale,
- Wirkungsrisiken,
- Wirkungsempfänger,
- Wirkungsräume,
- Wirkungen erster, zweiter und dritter Ordnung,
- Verteilung,
- Zeit und Generationen,
- Umsetzungskapazität,
- Finanzierung und Realressourcen,
- Gegenfaktum,
- Alternativdesigns,
- Nebenwirkungen,
- Rebound,
- Spillover,
- Leakage,
- Lock-in,
- Pfadabhängigkeit,
- Reversibilität,
- Resilienz,
- Transformationswirkung,
- Wirkungsgrenzen,
- Nichtkompensation,
- Datenbedarf,
- Monitoringindikatoren,
- Korrekturtrigger.

Wenn ein Punkt nicht materiell ist, `NOT_MATERIAL` mit kurzer Begründung statt stiller Auslassung.

---

# 10. Nach der Entscheidung: Wirkung nicht vorschnell behaupten

Nach einem Beschluss getrennt erfassen:

1. Beschluss.
2. rechtliches Inkrafttreten.
3. administrative Umsetzung.
4. Output.
5. beobachtete Zustandsveränderung.
6. Baseline und Zeitverlauf.
7. Gegenfaktum.
8. alternative Erklärungen.
9. Zurechnung/Contribution.
10. Wirkungsbewertung.
11. Rückkopplung.

`IMPLEMENTED = true` ist niemals gleichbedeutend mit `POSITIVE_EFFECT = true`.

Monitoring allein erklärt keine Ursachen.

---

# 11. Wahlprogramme und Koalitionsverträge - Bund

## 11.1 Dokumentebenen

Getrennt halten:

```text
Wahlprogramm
→ einzelne Zusage/Forderung
→ Koalitionsvertrag
→ parlamentarischer Vorgang
→ Entscheidung
→ Umsetzung
→ Zustandsveränderung
→ Zurechnung
→ Bewertung
```

## 11.2 Zusageregister

Jede materielle Zusage bleibt als eigener Datensatz erhalten.

Erforderliche Metadaten, soweit in der Quelle vorhanden:

- commitment_id,
- source_document,
- Partei/Herausgeber,
- Originalwortlaut,
- Fundstelle,
- Politikfeld,
- Typ,
- Bedingung,
- Zielgruppe,
- Zeithorizont,
- Zuständigkeit,
- Provenienz.

Thematische Bündelungen nur zusätzlich.

## 11.3 Programm → Koalition → Parlament

Nur source-verifizierte Beziehungen veröffentlichen.

Nicht ausreichend:

- Titelähnlichkeit,
- Wortähnlichkeit,
- Parteizugehörigkeit,
- Regierungsstatus,
- politische Plausibilität.

Mehrdeutigkeit bleibt `OPEN` bzw. entsprechendem vorhandenen Status.

## 11.4 Keine Parteigesamtnote

Keine:

- Durchschnittswirkung einer Partei,
- Rangliste,
- Wahlentscheidungsempfehlung,
- Aggregation heterogener Zusagen zu einem „Parteiwirkungswert“.

Analyseeinheit bleibt Zusage, Instrument, Wirkpfad und Entscheidung.

---

# 12. Sachsen-Anhalt

Sachsen-Anhalt ist ein eigener Wirkungsraum und kein Unterpunkt des Bundesportals.

Die Architektur umfasst:

```text
Landesziele
+
Landtagswahlprogramme 2026
+
Wahl-O-Mat 2026 als zusätzliche Frageschicht
+
Regierungs-/Koalitionsbildung
+
Landtagsentscheidungen
+
Umsetzung
+
Monitoring
+
Ex-post-Wirkung
```

## 12.1 Wahlprogramme

Vollständige Primärprogramme inventarisieren und als eigene Programmakten führen.

Wahl-O-Mat-Antworten ersetzen niemals Wahlprogramme.

## 12.2 Landesziele

Landesziele getrennt von SDGs führen.

Ein Bezug zu einem Landesziel bedeutet nicht, dass Wirkung eingetreten ist.

## 12.3 Kompetenzebene

Für jede Forderung sichtbar machen:

- LANDTAG,
- LANDESREGIERUNG,
- BUNDESRAT_EINFLUSS,
- BUND,
- EU/INTERNATIONAL,
- ggf. KOMMUNE.

Entscheidungszuständigkeit und politischer Einflussweg nicht verwechseln.

---

# 13. Wahl-O-Mat Sachsen-Anhalt 2026

Der Wahl-O-Mat ist:

- Informationsinstrument,
- Auswahl von Konfliktfragen,
- zusätzliche Frageschicht,
- methodischer Demonstrator für Entscheidungsreife.

Er ist nicht:

- vollständiges Wahlprogramm,
- vollständige Parteianalyse,
- Ersatz für Folgencheck,
- gesetzgeberisch bestimmter Entscheidungsgegenstand.

Für jede These die vollständige vorhandene WÖk-Analyse erhalten.

Zentrale Kategorien:

```text
KLAR
BEDINGT
NICHT_ENTSCHEIDUNGSREIF
```

Echte Zielkonflikte und fehlende Entscheidungsparameter getrennt halten.

Methodische Leitfrage:

> Kann eine Ja/Nein/Neutral-Position sinnvoll sein, wenn wirkungsentscheidende Ausgestaltung fehlt?

---

# 14. Politische Kommunikation als Vorwirkung

## 14.1 Materiality Screening

Für Programme, Gesetzesankündigungen, Kampagnen und andere politisch relevante Texte prüfen:

```text
pre_effect_screening:
  status: MATERIAL | NOT_MATERIAL_IDENTIFIED | EVIDENCE_OPEN
```

## 14.2 Mögliche kommunikative Wirkungspfade

Prüfen, soweit materiell:

- Frame/Narrativ,
- Tatsachenbasis,
- emotionale und identitäre Aktivierung,
- In-/Outgroup-Struktur,
- Wiederholungsfähigkeit,
- Anschluss an bestehende Narrative,
- parteieigene Verbreitung,
- Weiterverbreitung in Unterstützeröffentlichkeiten,
- Widerspruch/Zitat/Faktencheck in Gegenöffentlichkeiten,
- journalistische Aufnahme,
- Plattform-/Algorithmusverstärkung,
- Cross-Bubble-Verbreitung,
- Familiarity-/Illusory-Truth-Risiko,
- Agenda-Setting-Potenzial,
- Normalisierungs-/Overton-Potenzial,
- Vertrauens- und Polarisierungsrisiken,
- Gegenrede-/Korrektureffekte.

## 14.3 Evidenzgrenze

Nicht automatisch ableiten:

```text
Frame vorhanden
≠ breite Exposition
≠ Familiaritätseffekt nachgewiesen
≠ Einstellungsänderung
≠ Verhaltensänderung
≠ Wahlwirkung
```

Jede Stufe braucht eigene Evidenz.

Keine Absichtszuschreibung ohne Beleg.

## 14.4 Propagandistische Frames nicht unnötig vervielfachen

Mit belegtem Sachverhalt/Gegenframe beginnen.

Problematischen Wortlaut nur wiederholen, wenn er selbst Gegenstand der Analyse ist.

---

# 15. Parlamentarische Abstimmungen und Entscheidungsprofile

## 15.1 Grundsatz

Das Portal kann ein **parlamentarisches Entscheidungsprofil** einer Abgeordneten/eines Abgeordneten zeigen.

Es bewertet nicht die Person.

## 15.2 Individualstimme nur amtlich

Nur aus amtlicher namentlicher Abstimmung:

```text
YES
NO
ABSTAIN
NOT_VOTED
```

Nie aus Fraktionsposition ableiten.

Wenn keine Individualdaten:

```text
INDIVIDUAL_VOTE_NOT_DOCUMENTED
```

## 15.3 Keine Motivdeutung

Aus einer Stimme nicht ableiten:

- Motivation,
- Zielpräferenz,
- moralische Haltung,
- Zustimmung/Ablehnung zu jedem Teil des Pakets.

Eine Nein-Stimme gegen ein Gesetz kann ein Ziel unterstützen und nur das Instrument ablehnen.

## 15.4 Historische Metadaten

Person, Fraktion, Mandat und Wahlperiode zum Abstimmungszeitpunkt führen.

Spätere Partei-/Fraktionswechsel dürfen alte Abstimmungen nicht umdeuten.

## 15.5 Keine Personen-Scores

Verboten:

- Wirkungswert einer Person,
- Ranking,
- Durchschnitt aus Abstimmungen,
- „wirkungsvollste Abgeordnete“,
- Gesinnungsnote.

Zulässig:

> „X stimmte am Datum Y in der amtlichen namentlichen Abstimmung mit Ja. Die verknüpfte WÖk-Fachakte identifizierte zum damaligen Wissensstand folgende Potenziale, Risiken und offenen Fragen.“

---

# 16. Historische Fälle und Hindsight Bias

Bei historischen Entscheidungen strikt trennen:

```text
AVAILABLE_AT_DECISION_TIME
PUBLISHED_AFTER_DECISION
```

Fragen:

- Was war damals bekannt?
- Was hätte damals geprüft werden können?
- Welche Daten kamen erst später?
- Welche Zustandsveränderungen wurden später beobachtet?
- Welche Zurechnung ist heute möglich?

Spätere Erkenntnisse nie so schreiben, als hätten sie am Entscheidungstag vorgelegen.

---

# 17. Quellenregeln

## 17.1 Primärquellen zuerst

Für amtliche Vorgänge bevorzugen:

- Bundestag/Landtag,
- Bundesrat,
- Bundesgesetzblatt,
- Bundesregierung/Ministerien,
- amtliche Statistik,
- Gerichte,
- EU-Primärquellen.

## 17.2 Quellenmetadaten

Tragende Quelle mindestens:

```text
title
institution
canonical_url
document_date
retrieved_at
precise_location
source_function
temporal_class
supports
does_not_support
causality_limit
```

## 17.3 Quellenfunktion

Unterscheiden:

- Rechtsquelle,
- amtlicher Verfahrensstatus,
- Primärprogramm,
- Datensatz,
- Messstandard,
- Mechanismusbeleg,
- Evaluationsbeleg,
- Gegenargument,
- WÖk-interne Referenz,
- normative Referenz.

Eine Quelle nicht für eine Funktion verwenden, die sie nicht trägt.

## 17.4 Kandidatenquellen

Neu recherchierte Quellen bleiben bis zur Prüfung `CANDIDATE_ONLY`, wenn das Datenmodell diesen Status vorsieht.

## 17.5 Kein Quellenlink ohne Kontext

Der Nutzer muss erkennen können:

- was die Quelle ist,
- wofür sie verwendet wird,
- welches Datum gilt,
- wo die relevante Fundstelle liegt.

---

# 18. Berechnungen

Quantitative Outputs nur mit:

```text
baseline
counterfactual
observed_or_modelled_value
unit
scope
attribution_basis
source
formula
uncertainty
data_quality
causal_quality
model_quality
version
```

Nicht gewählte Optionen:

```text
MODELLED
ESTIMATED
UNRESOLVED
```

Keine Pseudopräzision.

Keine Gesamtsumme aus inkommensurablen Wirkungsfeldern.

---

# 19. Referenzrahmen

Vier Ebenen getrennt:

## SDGs

Internationaler politischer Bezugsrahmen.

## SDG+

WÖk-Erweiterung, keine offizielle UN-Kategorie.

## Mensch - Planet - Demokratie

Gekoppelter WÖk-Bezugsraum.

## Recht und Kontextnormen

Grundrechte, Verfassungsrecht, Fachrecht, Staatsziele, technische Standards.

Eine Zuordnung zu SDG/SDG+/MPD ist noch keine Wirkungsbewertung.

---

# 20. Nichtkompensation und Schutzgates

Bei materialitätsstarken Fällen sichtbar prüfen:

- Menschenwürde,
- Grundrechte,
- schwere Gesundheitsschäden,
- Rechtsstaatlichkeit,
- demokratische Korrekturfähigkeit,
- irreversible Umwelt- und Ökosystemschäden,
- andere definierte Wirkungsgrenzen.

Gute Wirkungen in einem Feld dürfen schwere Grenzverletzungen nicht überdecken.

Reverse Merit Order ist eine mögliche Bewertungslogik, nicht identisch mit dem Schutzprinzip selbst.

---

# 21. GEG als spezieller Integritätsfall

Für die GEG-Fachanalyse gilt besonders:

- alte Markdown-Fassung nicht als „vollständig“ ausgeben, wenn strukturierte Quellen zusätzliche Analysefelder enthalten;
- alle zusätzlichen Felder der freigegebenen strukturierten Fachquelle rendern;
- Medien-/Wahrnehmungsebene vollständig erhalten;
- Gesetzesversionen sauber trennen;
- keine Aussage „Medien waren schuld“ ohne kausale Evidenz;
- Kommunikation → Wahrnehmung/Erwartung → mögliche Entscheidung/Verhalten als Wirkpfad, nicht als automatisch nachgewiesene Wirkung;
- Gegenfaktum „gleiche gesetzliche Entscheidung, andere Kommunikation/Umsetzung“ als Modellstatus ausweisen.

---

# 22. Bundeshaushalt und Sondervermögen

## Bundeshaushalt

Mittelansatz ist Input, nicht Wirkung.

Mindestens prüfen:

```text
Haushalt
→ Einzelplan
→ Programm/Titel
→ Wirkungsziel
→ Baseline
→ Mittel
→ Output
→ Zustand/Outcome
→ Zurechnung
→ Netto-Wirkung
→ Rückkopplung
```

## Sondervermögen

Keine Analyse auf „500 Mrd. = Wirkung“ reduzieren.

Trennen:

- Rechtsgrundlage,
- Errichtung,
- Wirtschafts-/Haushaltsplan,
- Mittelbindung,
- Zusätzlichkeit,
- konkrete Projekte,
- Umsetzungskapazität,
- Lebenszyklus,
- beobachtete Infrastrukturzustände,
- Attribution.

Vollständige Analyse inline; PDF nur zusätzlich.

---

# 23. UI und lange Fachanalysen

Komplexität navigierbar machen, nicht entfernen.

Erlaubt/erwünscht:

- Sticky TOC,
- Deep Links,
- Kapitelanker,
- Tabs,
- Akkordeons,
- Filter,
- Timeline,
- Wirkungsnetze,
- Quellennavigation,
- Druckansicht.

Anforderungen:

- Fachinhalt bleibt im DOM bzw. technisch vollständig zugänglich,
- per Tastatur erreichbar,
- suchbar,
- druckbar,
- barrierefrei,
- direkt verlinkbar.

Ein Akkordeon darf Inhalt einklappen. Es darf ihn nicht löschen.

---

# 24. Visualisierungen

Visuals ergänzen Fachtext.

Jede Visualisierung braucht:

- Datenquelle/Provenienz,
- Datenstand,
- Textalternative,
- Evidenzstatus,
- Modellstatus.

Nicht:

- Grafik ersetzt Wirkpfadtext,
- Diagramm ersetzt Datenlücken,
- „Wirkungsradar“ als Name eines Spinnennetzdiagramms.

Spinnennetz = `Wirkungsprofil im Radardiagramm`.

Termin-/Kalenderportal = `Parlamentsradar` oder `Entscheidungsradar`.

---

# 25. Unabhängigkeit und Vertrauensschutz

Öffentlich deutlich machen:

- unabhängiges Angebot,
- kein Angebot des Bundestages/Landtages,
- keine Partei-/Fraktions-/Regierungsseite,
- WÖk-eigene Modelle als solche,
- Unsicherheiten und Korrekturen sichtbar,
- Quellen prüfbar.

Keine Formulierung verwenden, die einen amtlichen, gesetzlichen oder institutionellen Status des Wirkungsinstituts suggeriert, der nicht tatsächlich besteht.

---

# 26. Keine Personen- und Parteienbewertung

## Verboten

- Personenscore,
- Parteien-Endscore,
- Rangliste,
- automatisierte Wahlempfehlung,
- politische Gesinnungsklassifikation,
- Social-Credit-Logik.

## Zulässig

- Analyse einer konkreten Forderung,
- Analyse einer konkreten Entscheidung,
- Dokumentation einer amtlichen Stimme,
- Analyse eines öffentlichen Frames oder Kommunikationsmusters,
- quellengebundene Darstellung von Programm → Koalition → Parlament.

---

# 27. Arbeitsverhalten von Codex/Agents

## 27.1 Kein neues Fachwissen erfinden

Wenn eine freigegebene Analyse vorliegt:

> rendern, nicht neu schreiben.

Wenn fachlicher Inhalt fehlt:

```text
CONTENT_GAP
```

setzen und benennen.

Nicht aus allgemeinem Wissen einen fehlenden Fachabschnitt erzeugen, sofern der Auftrag nicht ausdrücklich neue Fachanalyse verlangt.

## 27.2 Keine stille Konfliktkorrektur

Bei Widerspruch:

```text
SOURCE_CONFLICT
METHODOLOGY_CONFLICT
TERMINOLOGY_MIGRATION_REQUIRED
```

oder vorhandenen Projektstatus verwenden.

## 27.3 Keine automatische Zusammenfassung

Für freigegebene Fachquellen deaktivieren:

- summarization,
- shortening,
- semantic deduplication,
- automatic rewrite.

## 27.4 Orientierung darf zusätzlich erzeugt werden

Eine 60-Sekunden-Orientierung darf aus der Fachakte erzeugt werden, sofern:

- sie als Orientierung erkennbar ist,
- keine neue Schlussfolgerung enthält,
- die vollständige Fachakte nicht verdrängt,
- Evidenz- und Unsicherheitsstatus erhalten bleiben.

---

# 28. Technische Release-Gates

Vor Deploy mindestens automatisiert oder manuell prüfen:

## Terminologie

Suche nach:

```text
WÖk erweitert IOOI
IOOI als Grundmodell
Wirkungsradar = Spinnennetz
keine Daten = neutral
Umsetzung = Wirkung
Output = Wirkung
```

## Content Integrity

```text
unrendered_content_paths = []
```

## Quellen

- keine defekten Primärquellen,
- amtlicher Status aktuell,
- Fundstellen vorhanden,
- Quellenfunktion plausibel.

## Fachstatus

- Ex ante/Ex post getrennt,
- Entscheidungsreife vorhanden, soweit erforderlich,
- Evidenzstatus vorhanden,
- Zurechnung getrennt,
- Datenlücken sichtbar,
- Schutzprüfung vorhanden, soweit materiell.

## Personen

- keine aus Fraktion abgeleitete Individualstimme,
- keine Personen-/Parteien-Scores.

## UI

- vollständiger Fachinhalt erreichbar,
- Druckansicht,
- Tastaturnavigation,
- Textalternativen,
- keine PDF-only-Fachanalyse.

P0 oder P1 blockiert Release.

---

# 29. Release-1.0-Coverage als versionierter Prüfstand

Die folgenden Zahlen sind **Release-Gates für den Stand 1.0**, keine zeitlosen Definitionen und dürfen nicht hart als unveränderliche Portalwahrheit codiert werden.

Zu prüfen gegen den jeweils freigegebenen Release-Datensatz:

- Bundesprogramme/Koalitionsvertrag: vollständige Primärdokumente und vollständiges Zusageregister;
- alle freigegebenen Programm→Koalition→Parlament-Relationen, offene Beziehungen offen belassen;
- 28/28 parlamentarische Fachfälle;
- aktuelle und historische Fälle getrennt;
- GEG vollständige Fachquelle einschließlich strukturierter Zusatzfelder;
- Bundeshaushalt 2027 vollständig;
- Sondervermögen vollständig inline;
- Sachsen-Anhalt: vollständiges Programm-Inventar des freigegebenen Prüfpakets;
- 28/28 Landesziele;
- 38/38 Wahl-O-Mat-Thesen einschließlich vollständiger WÖk-Analysen;
- Abstimmungsprüfung für alle 28 Fälle; Individualstimmen nur bei amtlicher namentlicher Abstimmung;
- Content-Integrity-Manifeste ohne ungerenderte Pflichtpfade.

Zahlen immer aus dem Release-Manifest lesen, nicht dupliziert im UI hardcoden.

---

# 30. Definition „fertig“

Eine Fachseite ist nicht fertig, weil sie schön aussieht.

Sie ist fertig, wenn:

- Gegenstand und Fassung stimmen,
- Status korrekt ist,
- alle freigegebenen Fachinhalte vorhanden sind,
- nichts verdichtet wurde,
- Potenzial/Risiko/Wirkung/Zurechnung getrennt sind,
- Entscheidungsreife geprüft ist, soweit erforderlich,
- Quellen und Fundstellen vollständig sind,
- Datenlücken sichtbar sind,
- Gegenargumente erhalten sind,
- Schutzgrenzen erhalten sind,
- Berechnungslogik erhalten ist,
- kommunikativer Vorwirkpfad geprüft ist, wenn materiell,
- Individualstimmen amtlich belegt sind,
- Referenzrahmen sauber getrennt ist,
- Content Integrity `0` fehlende Pfade zeigt,
- P0/P1 = 0.

> **Endformel**  
> Das Wirkungsportal Parlament bewertet nicht, wer „gut“ oder „schlecht“ ist. Es macht sichtbar, was politisch entschieden werden soll, welche Folgen vorher erkennbar sind, wie tatsächlich entschieden wurde, was umgesetzt wurde, was sich später verändert hat und was daraus für die nächste demokratische Entscheidung gelernt werden muss.

---

# 31. Regierungshandeln & Wirkung - verbindliche Zusatzregeln

Dieser Abschnitt gilt für den Bereich `/regierung` und alle GovernmentAction-Daten, Analysen, APIs und UI-Komponenten. Er ergänzt die Root- und Portal-Governance und schwächt deren Mindeststandards nicht ab.

## G1 - Gewaltenteilung technisch und sprachlich erhalten

Regierungshandeln und Parlamentshandeln sind verschiedene Gegenstände.

MUST:

- GovernmentAction separat von ParliamentaryCase führen.
- Regierungsentwurf kann mit DIP-Vorgang verknüpft werden, wird aber nicht dadurch zum Parlamentsakt.
- Abstimmung bleibt Parlamentsfakt.
- Kabinettsentscheidung bleibt Exekutivfakt.

MUST NOT:

- identische Objekte für Regierung und Parlament erzeugen,
- Regierungsentscheidung als Bundestagsentscheidung darstellen,
- parlamentarische Zustimmung als Wirkung der Regierung ausgeben.

## G2 - Regierung ist mehr als Kabinett und 16 Ministerien

Die Erfassungsarchitektur umfasst mindestens:

- Bundeskabinett,
- 16 Bundesministerien,
- Bundeskanzleramt als eigene Executive Institution,
- Bundesminister/in für besondere Aufgaben / Chef/in Bundeskanzleramt als effective-dated Rolle,
- materielle Kabinettsausschüsse wie den Nationalen Sicherheitsrat, soweit amtlich dokumentiert,
- spätere Vollzugs-/Förder-/Budget-/Beschaffungsquellen.

Die Formulierung `alle Ministerien erfasst` darf nicht in `gesamtes Regierungshandeln vollständig erfasst` übersetzt werden.

## G3 - Amtsträgerzuordnung ist zeitabhängig

Personen sind nur Funktionsträgerzuordnungen.

MUST:

```text
Institution -> Rolle -> Amtsträger(valid_from, valid_to)
```

GovernmentActions werden institutionell bewertet. Keine Person erhält einen Gesamt-Wirkungswert.

Bei Ressortumbildung müssen historische und aktuelle Zuordnungen parallel korrekt bleiben.

## G4 - SourceEvent ist nicht GovernmentAction

Eine Pressemitteilung, Rede, FAQ, Sitemap-Seite oder Dokumentveröffentlichung ist zunächst SourceEvent.

Eine GovernmentAction entsteht nur bei quellengetragenem staatlichen Handlungsgegenstand.

Beispiele:

- Referentenentwurf vorgelegt -> GovernmentAction möglich.
- Förderrichtlinie erlassen -> GovernmentAction.
- internationale Vereinbarung unterzeichnet -> GovernmentAction.
- Rede über ein Ziel -> normalerweise Communication SourceEvent.
- Pressemitteilung über bereits bekannte Kabinettsentscheidung -> SourceEvent zur bestehenden GovernmentAction.

## G5 - Public Store ist nicht Canonical Store

Kein öffentliches UI liest ungefiltert `canonical/government-actions.jsonl`.

Öffentlich nur:

- fachlich bestätigte GovernmentActions,
- belegtes Datum,
- belegte Institution,
- tragende Primärquelle,
- keine unresolved HIGH duplicates,
- kein Source Integrity Block,
- gültiger Publication Status.

Unreviewed Kandidaten bleiben intern.

## G6 - Quellenabdeckung nicht aufblasen

Coverage ist quellenbezogen.

MUST unterscheiden:

- `COMPLETE_ENUMERATED_SOURCE`
- `BEST_EFFORT_DEFINED_SOURCE_SCOPE`
- `PARTIAL`
- `SOURCE_UNAVAILABLE`
- `UNKNOWN`

MUST NOT:

- 0 Treffer bei fehlerhaftem Adapter als vollständige Null-Aktivität interpretieren,
- best-effort Ressortcrawl als Vollständigkeit des Ressorthandels ausgeben,
- Suchmaschinenindizes als amtliche Primärquelle verwenden.

## G7 - Primärquellenfunktion bleibt erhalten

Beispiele:

- Kabinettergebnis -> OFFICIAL_DECISION
- DIP -> PROCEDURAL_STATUS
- Bundesgesetzblatt -> LEGAL_TEXT / PROMULGATION
- Gesetze im Internet -> CONSOLIDATED_LAW
- Ministeriumsentwurf -> MINISTRY_DRAFT
- Förderrichtlinie -> FUNDING_RULE
- Statistik -> MONITORING_DATA
- Pressemitteilung -> COMMUNICATION, sofern sie nicht selbst tragender amtlicher Handlungsbeleg ist

Keine Quelle darf still eine andere Beweisfunktion erhalten.

## G8 - Wirkung erst nach Faktenprüfung

GovernmentAction-Faktenschicht und WÖk-Analyse sind getrennte Datensätze/Module.

Reihenfolge:

```text
Fakt
-> Umsetzung
-> Potenzial/Risiko
-> Beobachtung
-> Evidenz/Zurechnung
-> normative WÖk-Bewertung
-> Schutz/Systemprüfung
-> Rückkopplung
```

Ex ante nie eingetretene Wirkung behaupten.

## G9 - Output, Budget und Vollzug sind noch keine Wirkung

Nicht zulässig:

- `100 Mio. Euro ausgegeben = hohe Wirkung`
- `Programm gestartet = Ziel erreicht`
- `Gesetz in Kraft = positiver Outcome`

Zulässig:

- Budget/Vollzug als Umsetzungsschritt,
- Output als Output,
- spätere Zustandsveränderung separat.

## G10 - Richtung, Evidenz, Risiko und Status orthogonal

UI und Datenmodell müssen separat führen:

- Wirkungsrichtung,
- Evidenzsicherheit,
- Datenstatus,
- Zurechnung,
- Verfahrensstatus,
- Analysephase.

Keine grüne Farbe für bloß `vorhandenes Wirkungspotenzial`.

## G11 - Unterlassen nicht automatisch erzeugen

Omission Review nur nach Prüfung von:

- Handlungsmöglichkeit,
- Zuständigkeit,
- Erwartbarkeit/Verantwortung,
- Bekanntheit des Problems,
- plausibler Entwicklung ohne Handlung,
- möglicher Zustandsveränderung durch Nicht-Handeln.

## G12 - ExternalActorEvent trennen

Unternehmens-, Verbands- oder Partnerhandlungen sind keine GovernmentActions.

Beispiel Gas/LNG:

- staatliche Strategie/Vereinbarung/Garantie -> GovernmentAction,
- Vertrag eines Energieunternehmens -> ExternalActorEvent,
- Relation nur so stark formulieren wie belegt.

`FACILITATES` ist keine automatische Kausalitätsbehauptung.

## G13 - Kommunikation separat behandeln

Regierungskommunikation kann Wirkungspotenziale und Resonanzrisiken erzeugen.

MUST:

- Frame/Narrativ/Resonanzraum als Potenzialanalyse behandeln,
- keine Absicht zuschreiben ohne Beleg,
- keine Reichweite mit gesellschaftlicher Wirkung gleichsetzen.

## G14 - Mandat & Praxis nicht aus Ähnlichkeit ableiten

Koalitionszusage -> GovernmentAction nur bei bestätigter Relation.

Titelähnlichkeit erzeugt höchstens einen Kandidaten.

Keine automatische `erfüllt`-Markierung.

## G15 - Duplicate Review als Cluster

Semantische Paarrelationen dürfen nicht zu kombinatorischen Reviewlisten führen.

MUST:

- amtliche IDs zuerst,
- explizite Querverweise zweitens,
- Titel/Datum/Institution/Typ danach,
- semantische Ähnlichkeit nur Kandidat,
- Cluster statt vollständigem Paargraphen,
- Merge-Historie versionieren.

## G16 - Aktualität ist Release-Gate

Vor jedem Release:

- aktuelles Kabinett/Ressortregister amtlich prüfen,
- aktuelle Institutionen/Ressortumbildungen prüfen,
- source adapters auf HTTP/Access Challenges prüfen,
- Datenstand öffentlich angeben.

Ein Paket mit `as_of`-Datum und faktisch älterem Roster besteht Gate G16 nicht.

## G17 - Materialitätsgate steuert Prüftiefe, nicht Erfassung

Amtliche GovernmentActions werden nicht gelöscht, weil sie wenig materiell erscheinen.

Materialität entscheidet:

- REGISTER_ONLY,
- STANDARD_CHECK,
- FULL_WOEK_CHECK,
- URGENT_BOUNDARY_REVIEW.

Rechte/rote Linien können immer eskalieren.

## G18 - Wirkungsexport braucht WÖk-ID-Provenienz

Wenn WÖk-IDs benutzt werden:

- ID-Version,
- Indikatorname,
- Einheit,
- Datenquelle,
- Benchmarkstatus,
- Schwellenstatus,
- Datenqualität,
- Gültigkeitszeitraum.

Missing bleibt missing.

## G19 - Produktionsintegrität

Build Integrity ist nicht Live Integrity.

Vor Production:

1. Staging bauen,
2. Source-vs-View automatisiert testen,
3. fachlichen externen Audit durchführen,
4. erst danach freigeben.

Nach Production erneut extern prüfen:

- Live-Seiten vorhanden,
- richtige Datenversion,
- Quellenlinks,
- UI-Semantik,
- keine Feldverluste,
- keine Fallbacktexte, die spezifische Schutzgrenzen ersetzen.

## G20 - Veröffentlichungssperren

Public Release BLOCKED, wenn:

- aktuelle Regierungsbesetzung falsch,
- tragende Primärquelle fehlt,
- Source Access Block auf tragendem Beleg,
- HIGH Duplicate unresolved,
- Institution/Datum unklar,
- offene fachliche Reviewpflicht,
- WÖk-Richtung ohne dokumentierte Herleitung,
- offene Evidenz als neutral dargestellt,
- Production nicht Source-vs-View geprüft.

> Regierungshandeln ist ein institutioneller Lebenslauf aus amtlichen Handlungen, Umsetzung und späteren Zustandsveränderungen. Erst den Fakt bestätigen, dann Wirkungspotenzial modellieren, dann Umsetzung beobachten, dann Wirkung und Zurechnung prüfen. Offene Quellen bleiben offen. Menschen werden nicht bewertet.

---
title: "T-SROI-Rechenstandard"
subtitle: "Kausale, diskontierte Netto-Nutzenrechnung für Transformationsinvestitionen"
version: "v1.1"
stand: "2. August 2026"
canonical_url: "https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/"
---

## Kurz gesagt

T-SROI ist ein modellhaftes Euro-zu-Euro-Verhältnis. Es setzt den diskontierten, kausal zugerechneten direkten und transformativ belegten Netto-Nutzen ins Verhältnis zu den diskontierten Ressourcen. Er ersetzt weder eine Scorecard noch eine politische, rechtliche oder fachliche Entscheidung.

Der Wert ist nur dann ausweisbar, wenn die Schutzprüfung offen ist. Eine rote Linie, ein negatives Kernprofil, eine unzureichende Datengrundlage, eine offene Systemgrenze oder eine nicht positive konservative Szenario-Untergrenze blockieren die positive Kennzahl. Diese Untergrenze ist ein dokumentierter konservativer Szenarioabschlag, keine statistische Konfidenzgrenze.

> Dieses Dokument ist die aktuelle Rechenfassung für T-SROI. Frühere Darstellungen mit frei gesetzten Transformations-, Resilienz- oder Datenqualitätsmultiplikatoren sind keine aktuelle T-SROI-Rechnung. Transformation wird als eigener belegter Nutzenstrom erfasst; Datenqualität ist eine Prüfbedingung, kein Aufschlagsfaktor.

## Was vorher feststehen muss

- Bewertungsgegenstand, Vergleichsfall und Entscheidung festlegen: Investition, Programm, Infrastruktur oder Portfolio - keine Person.
- Zielzustand, Zeitraum, Preisbasis, Systemgrenze und betroffene Gruppen dokumentieren.
- Direkte Nutzen, transformative Nutzen, Schäden, Investition und inkrementelle Kosten getrennt erfassen. Alle Geldwerte müssen dieselbe Preisbasis haben.
- Wirkpfad und Gegenhypothese beschreiben. Attribution, Counterfactual/Deadweight und Verdrängung dürfen nicht geraten werden.
- Scorecard, Datenqualität, rote Linien und Reverse Merit Order vor der Geldrechnung prüfen.

## Schutz-Gate

Das Schutz-Gate G ist keine Rechenverzierung. Es entscheidet, ob ein positiver Quotient überhaupt berichtet werden darf.

G = 1 nur, wenn alle folgenden Bedingungen erfüllt sind: keine rote Linie, kein negatives Kernprofil nach Reverse Merit Order, ausreichende dokumentierte Datenqualität, definierte Systemgrenze, nachvollziehbare kausale Zurechnung, positive diskontierte Ressourcenbasis und positive konservative Szenario-Untergrenze des diskontierten Nettonutzens. Die Szenario-Untergrenze ist kein statistischer Vertrauensbereich.

G = 0 bedeutet: "blockiert / nicht bewertbar". Ein rechnerisch hoher Quotient darf dann weder als positiver T-SROI noch als Priorisierungssignal ausgegeben werden. Erst die Ursache der Blockade wird bearbeitet.

## Rechenformel

Die Grundrechnung besteht aus vier Schritten: Nutzen kausal begrenzen, Schäden getrennt abziehen, die konservative Szenario-Untergrenze bilden, dann durch diskontierte Ressourcen teilen. Der Zeitraum ist eine ganze Zahl von Jahren: T ∈ ℕ und T ≥ 1. In der öffentlichen Demo gilt zusätzlich T ≤ 100; das ist eine technische Sicherheitsgrenze, keine Aussage über die fachlich zulässige Wirkungsdauer.

$$PV_N = Summe_t=1..T [(((B_direkt,t + B_transformativ,t) * a_t * (1 - d_t) * (1 - v_t)) - S_t) / (1 + r)^t]$$

$$PV_N^L = Summe_t=1..T [(((B_direkt,t + B_transformativ,t) * a_t * (1 - d_t) * (1 - v_t) * (1 - u_t)) - S_t) / (1 + r)^t]$$

$$PV_R = Summe_t=0..T [(I_t + K_t) / (1 + r_K)^t]$$

$$T-SROI = PV_N / PV_R, nur wenn G = 1$$

| Zeichen | Bedeutung | Behandlung |
| --- | --- | --- |
| B_direkt,t | direkter Nutzen im Jahr t | in EUR, gleicher Preisstand |
| B_transformativ,t | separat belegter Nutzen aus veränderten Regeln, Infrastruktur, Standards oder Handlungsmöglichkeiten | in EUR, mit Wirkpfad, Zeitraum und Gegenhypothese |
| S_t | Schaden im Jahr t innerhalb der Bilanzgrenze | in EUR; wird konservativ nicht pauschal mit dem Nutzen-Kausalfaktor reduziert |
| u_t | dokumentierter konservativer Szenarioabschlag auf den beanspruchten Nutzen | 0 bis 1; reduziert B_direkt und B_transformativ nach der Kausalbegrenzung, aber niemals S_t |
| a_t | Attribution | Anteil des Nutzens, der der Maßnahme zugerechnet werden kann |
| d_t | Counterfactual / Deadweight | Anteil des Nutzens, der auch ohne Maßnahme eingetreten wäre |
| v_t | Verdrängung | Anteil des Nutzens, der an anderer Stelle entfällt oder verlagert wird |
| I_t, K_t | Investition und inkrementelle Kosten | in EUR; K umfasst zusätzliche, klar abgegrenzte Folgekosten |
| r, r_K | Diskontsätze | begründen, Preisbasis und Sensitivitäten offenlegen |

Die öffentliche Demo verwendet zur Vereinfachung r = r_K. In einer Prüfung dürfen Nutzen- und Ressourcendiskontsätze getrennt angesetzt werden, wenn beide sachlich begründet, zur Preisbasis passend und in der Sensitivitätsanalyse ausgewiesen sind.

Die Kausalfaktoren begrenzen die beanspruchten Nutzen. S_t wird im Grundmodell nicht mit dem Nutzen-Kausalfaktor reduziert, weil es als bereits innerhalb der Bilanzgrenze angesetzter Schaden behandelt wird. Eine Reduktion eines Schadens ist nur zulässig, wenn für diesen Schaden eine eigene Gegenfaktik und Zurechnung belegt sind.

Die konservative Szenario-Untergrenze PV_N^L ist ebenfalls genau bestimmt: Der Abschlag u_t wird pro Jahr nur auf den bereits kausal begrenzten Nutzen angewandt, vor der Abzinsung. Schäden bleiben unverändert im Abzug. Ein kleines Rechenbild: Bei 100 EUR beanspruchtem Nutzen, 60 EUR Schaden und u = 20 % lautet die Untergrenze 100 × 0,8 − 60 = 20 EUR; sie lautet ausdrücklich nicht (100 − 60) × 0,8 = 32 EUR. So wird nicht versehentlich auch ein Schaden kleiner gerechnet. PV_N^L ist eine dokumentierte Szenarioannahme, keine Konfidenzgrenze und kein Ersatz für eine Sensitivitätsanalyse mit mehreren plausiblen Parametern.

## Keine freie Multiplikatorlogik

Skalierung, Diffusion, Lernkurven, neue Standards, Dateninfrastruktur und Resilienz sind Gründe für eine Transformationsprüfung. Sie sind noch kein Faktor, mit dem ein vorhandener Nutzen hochgerechnet werden darf.

Ein transformativer Zusatznutzen darf nur dann als B_transformativ,t eingehen, wenn für ihn ein eigener Wirkpfad, Empfängerkreis, Zeitraum, Preisbasis, Gegenhypothese, Zurechnungsanteil und Unsicherheitsanalyse dokumentiert sind. Nicht monetarisierbare Transformation bleibt als Profil, Risiko- oder Resilienzbefund sichtbar. Sie wird nicht in eine Eurozahl gezwungen.

Datenqualität bleibt ein eigenes Prüfmerkmal. Sie kann eine Ausweisung blockieren und muss zusammen mit Annahmen, Quellen, Version, Unsicherheit und Assurance sichtbar sein. Sie darf weder positive Nutzen aufwerten noch Schäden abschwächen.

## Beispielrechnung, Schritt für Schritt

Eine Kommune prüft eine Investition in eine Energie- und Wärmeinfrastruktur. Die nachfolgenden Werte sind reine Modellwerte in realen EUR derselben Preisbasis. Investition und Nutzen liegen in derselben Systemgrenze; es gibt keine zusätzlichen inkrementellen Kosten.

| t | B_dir. | B_trans. | Kausalanteil c | S | Netto | PV (5 %) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 0 | - | 0 | -1.000.000 Ressourcen | -1.000.000 |
| 1 | 800.000 | 100.000 | 0,8 * 0,9 * 0,95 = 0,684 | 90.000 | (900.000 * 0,684) - 90.000 = 525.600 | 500.571 |
| 2 | 900.000 | 300.000 | 0,8 * 0,9 * 0,95 = 0,684 | 110.000 | (1.200.000 * 0,684) - 110.000 = 710.800 | 644.717 |

PV_N = 500.571 EUR + 644.717 EUR = 1.145.288 EUR. PV_R = 1.000.000 EUR. Bei offenem Schutz-Gate ergibt sich T-SROI = 1.145.288 / 1.000.000 = 1,15 : 1.

Die Zahl sagt nicht: "Das Vorhaben ist automatisch richtig." Sie sagt nur: Unter diesen Annahmen übersteigt der diskontierte, kausal begrenzte Netto-Nutzen den Ressourceneinsatz. Eine Sensitivitätsrechnung muss zeigen, ob die konservative Szenario-Untergrenze PV_N^L positiv bleibt; sie ist kein statistischer Vertrauensbereich. Wird etwa eine rote Linie in der Lieferkette festgestellt, lautet das Ergebnis trotz des Quotienten "blockiert / nicht bewertbar".

## Ergebnisdarstellung

Ein belastbarer Ergebnisdatensatz enthält mindestens:

- T-SROI-Wert oder den Status "blockiert / nicht bewertbar".
- PV_N, PV_N^L und PV_R getrennt, inklusive direktem und transformativem Nutzen sowie Schäden.
- Systemgrenze, Zeitraum, Preisbasis, Diskontsätze, Datenstand und Version.
- Attribution, Counterfactual/Deadweight, Verdrängung, Quellen und Unsicherheits- oder Sensitivitätsanalyse.
- Scorecard, Datenqualität, Gate-Entscheidung, rote Linien und die daraus folgende Rückkopplung in die Entscheidung.

NWI, IOI und T-SROI bleiben getrennt: Der NWI ist eine skalierte operative Netto-Wirkungskennzahl, nicht ein Euro-Wert. IOI bezieht sich auf direkte monetarisierte positive Netto-Wirkung je Ressourceneuro. T-SROI erweitert die Geldstromrechnung nur um separat belegte transformative Nutzenströme. Keiner der Werte darf Menschen bewerten oder demokratische Abwägung ersetzen.

## Grenzen und Angriffspunkte

- Monetarisierung kann Werte verzerren. Nicht monetarisierbare Rechte, Würde, Verteilung und demokratische Folgen bleiben sichtbar und werden nicht als Null behandelt.
- Doppelzählung ist möglich, wenn direkter und transformativer Nutzen dieselbe Zustandsveränderung abbilden. Jede Nutzenposition braucht eine eindeutige WÖk-ID, Einheit, Zeitraum und Abgrenzung.
- Verschobene Schäden, Rebound-Effekte und Lieferkettenfolgen müssen in der Systemgrenze erfasst werden. Fehlen sie, ist die Rechnung zu begrenzen oder zu blockieren.
- Ein Diskontsatz ist keine Naturkonstante. Er muss zur Preisbasis und zum Entscheidungskontext passen; Sensitivitäten sind auszuweisen.
- Korrelation ersetzt keine Kausalität. Wenn Attribution oder Counterfactual nicht belastbar sind, wird konservativ gerechnet oder nicht monetarisiert.
- Eine Kennzahl ist kein Autopilot. Der T-SROI bereitet Entscheidungen vor; Ziele, Schutzrechte und Prioritäten bleiben demokratisch und fachlich zu entscheiden.

## Quellen und Anschluss

- Wirkungsökonomie: [T-SROI-Rechenstandard](https://wirkungsoekonomie.de/werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/) und [Quellenarchiv WÖK-Q-1024](https://wirkungsoekonomie.de/quellenarchiv/wok-q-1024/)
- OECD / European Union (2024): [Measure, Manage and Maximise Your Impact: A Guide for the Social Economy](https://doi.org/10.1787/2238c1f1-en)
- Social Value International: [Principle 5 - Do not overclaim](https://www.socialvalueint.org/principle-5-do-not-overclaim)
- HM Treasury (2026): [The Green Book](https://www.gov.uk/government/publications/the-green-book-appraisal-and-evaluation-in-central-government/the-green-book-2026)

Diese Quellen begründen einzelne Prinzipien wie Wirkpfad, Zurechnung, Gegenfaktik, Vermeidung von Überzuschreibung, Diskontierung und Sensitivität. Sie standardisieren nicht den hier beschriebenen WÖk-T-SROI; dieser bleibt ein transparent gekennzeichnetes Modell der Wirkungsökonomie.

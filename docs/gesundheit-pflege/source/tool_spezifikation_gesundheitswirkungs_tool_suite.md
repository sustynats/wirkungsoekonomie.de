# Tool-Spezifikation: Gesundheitswirkungs-Tool-Suite

**Autorin:** Natalie Weber
**Referenz:** Wirkungsökonomie
**Version:** v0.1
**Stand:** 24. Mai 2026

## Zweck

Die Tool-Suite macht Gesundheitswirkung auf Ebene von Programmen, Räumen, Institutionen und politischen Maßnahmen sichtbar. Sie ist keine medizinische Diagnostik, kein Personen-Scoring und keine Therapieempfehlung.

## Module

1. Gesundheitswirkungscheck
2. Präventionswirkungsrechner
3. Pflegewirkungscheck
4. Kommunaler Gesundheitsraum-Check
5. Mental-Health-Reflexionstool (nicht-diagnostisch)
6. One-Health-Score
7. Gesundheitsdatenraum-/Privacy-by-Design-Check

## Zwei Darstellungen statt eines Mischwerts

Euro gehören zu Euro. Gesundheit, Autonomie, Teilhabe und Resilienz haben eigene Einheiten. Beides ist wichtig, darf aber nicht zu einer scheinbar exakten Gesamtsumme vermischt werden.

### Monetäre Bilanz bei Präventionsmaßnahmen

Für jedes Jahr t werden zunächst die gegenüber dem Vergleichsfall erwartbar vermiedenen Ereignisse bestimmt: A_t = n_t × p_0,t × q_t. Dabei ist n_t die betroffene Population, p_0,t das Risiko ohne Maßnahme und q_t die belegte, der Maßnahme zurechenbare relative Risikoreduktion. Nur wenn diese Größen zur gleichen Population, zum gleichen Zeitraum und zum gleichen Vergleichsfall passen, gilt der Rechenweg.

Der monetäre Barwert lautet: B_EUR = Summe_t [(A_t × Kosten je Ereignis_t + weitere dokumentiert monetarisierte Nutzen_t - Programm- und Folgekosten_t - monetarisierte Nebenwirkungs- und Verlagerungskosten_t) / (1 + r)^t]. Alle Terme sind Euro desselben Preisjahrs; r ist der offengelegte Diskontsatz. Fehlt für einen Nutzen oder Schaden eine belastbare Geldbewertung, bleibt er aus B_EUR heraus.

### Nichtmonetäres Wirkungsprofil

Für Gesundheitszustand, Autonomie, Teilhabe, Resilienz, Gerechtigkeit und mögliche Schäden wird je Indikator die Veränderung gegenüber dem Vergleichsfall berichtet: Δx_k = x_k,mit Maßnahme - x_k,ohne Maßnahme. Jede Angabe braucht Einheit, Zeitraum, Quelle, Vergleichsfall, Attribution und Unsicherheit. Ein Prozentpunkt, ein gewonnener selbstständiger Tag und ein Euro werden nicht addiert und nicht zu einem Durchschnitt verrechnet.

### Entscheidungs-Gate

Eine positive monetäre Bilanz ist kein Freifahrtschein. Eine positive Netto-Wirkung wird nur ausgewiesen, wenn Wirkungsgrenze und Vergleichsfall offenliegen, keine rote Linie verletzt ist und das Wirkungsprofil keine schwere Verschlechterung verdeckt. Datenqualität begrenzt die Aussagekraft; sie erhöht nicht rechnerisch die Wirkung.

## Eingaben

- Zielgruppe / Wirkungsraum
- Baseline-Risiko
- Maßnahme
- Kosten
- erwartete Risikoreduktion
- Datenqualität
- Zeithorizont
- SDG-/SDG+-Bezug
- Nebenwirkungen und Schutzmaßnahmen

## Ergebnisdarstellung

- monetäre Bilanz in EUR mit Preisbasis, Zeitraum, Diskontsatz und Unsicherheitsband
- nichtmonetäres Wirkungsprofil mit Indikatoren, Einheiten und Vergleichsfall
- dokumentierte Wirkungsgrenze, Attribution und Datenqualität
- rote Linien / Nicht-Kompensation als Gate, nicht als verrechenbarer Malus
- politische Anschlussoptionen

## Datenschutz und Schutzgrenzen

Keine personenbezogene Bewertung. Keine Diagnose. Keine Sanktionierung von Krankheit. Keine Versicherungsausgrenzung. Keine Gesundheitsdaten ohne Einwilligung oder klare Rechtsgrundlage. Aggregierte Daten bevorzugen. Privacy by Design verpflichtend.

## Verlinkungen

- /wirkungsfelder/gesundheit-pflege/
- /werkzeuge/impact-controlling/t-sroi/
- /werkzeuge/woek-ids/
- /werkzeuge/wirkungshaushalt/
- /wirkungsfelder/wohnen-stadt/
- /wirkungsfelder/arbeit-einkommen/
- /wirkungsfelder/bildung/
- /wirkungsfelder/medien-oeffentlichkeit/
- /wirkungsfelder/finanzsystem-kapital/

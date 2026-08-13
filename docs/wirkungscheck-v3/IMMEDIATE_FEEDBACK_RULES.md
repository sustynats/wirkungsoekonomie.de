# Wirkungscheck Bundestag V3 – Registry für Sofortreaktionen

**Status:** Redaktionelle Registry. Sichtbare Texte werden daraus gerendert;
keine Sofortreaktion darf im Frontend als freie Textlogik hinterlegt werden.

## Datenform

```js
{
  id: "housing.funding.process",
  version: "1.0.0",
  topic: "housing",
  phase: "approach_bottleneck",
  approach: "funding",
  bottleneck: "process",
  title: "Was bedeutet diese Kombination?",
  directEffect: "Mehr Geld verändert den von Ihnen genannten Engpass zunächst nicht unmittelbar.",
  openCondition: "Wenn Genehmigung und Umsetzung begrenzen, kann zusätzliche Finanzierung wirkungslos bleiben oder die Nachfrage nach knapper Umsetzungskapazität erhöhen.",
  nextQuestionReason: "Im Report werden deshalb Finanzierung und Vollzug als getrennte Prüfpunkte betrachtet.",
  evidenceClass: "conditional",
  version: "1.0.0"
}
```

`evidenceClass` kann `direct`, `partial`, `conditional`, `not_direct` oder
`data_gap` sein. Die Kennzeichnung ist eine interne Regel, nicht eine
Qualitätsnote für die Antwort.

## Allgemeine Regeln

### Ziel gewählt

**Titel:** Damit ist das Ziel klar.
**Text:** Nicht die Zahl der Maßnahmen entscheidet über Erfolg, sondern ob sich
dieser Zustand tatsächlich verändert.
**Weiter:** Welchen politischen Ansatz würden Sie zunächst prüfen?

### Ansatz gewählt

Die Regel stammt aus dem jeweiligen Themenmodul und verwendet immer:

1. die direkte Veränderung;
2. die offene Bedingung;
3. die Überleitung zur Engpassfrage.

### Rote Linie gewählt

**Titel:** Diese Grenze behandeln wir getrennt vom gewünschten Nutzen.
**Text:** Ein Fortschritt an anderer Stelle gleicht eine deutliche
Verschlechterung dieser Grenze nicht aus. Im Report bleibt sie deshalb als
eigene Prüffrage sichtbar.
**Weiter:** Woran müsste bundesweit erkennbar sein, dass der Ansatz
tatsächlich funktioniert?

### Erfolgssignale gewählt

**Titel:** Was zeigen diese Daten – und was nicht?
**Text:** Ein Wert kann zeigen, was getan wurde. Für die Wirkung ist
entscheidend, ob sich der gewünschte Zustand bei den betroffenen Menschen
tatsächlich verändert.
**Weiter:** Woran würde sich das in Praxis oder Wahlkreis zeigen?

## Pilotregeln Wohnen

| ID | Auslöser | Reaktion |
| --- | --- | --- |
| housing.build | Ansatz: zusätzlichen Wohnraum leichter schaffen | Erleichterter Neubau verändert zunächst die Bedingungen für zusätzliches Wohnungsangebot. Daraus folgt noch nicht automatisch bezahlbarer oder für die gewünschte Zielgruppe geeigneter Wohnraum. Dafür werden unter anderem Kosten, Lage, Zugang und tatsächlicher Bedarf relevant. |
| housing.use_existing | Ansatz: bestehenden Wohnraum besser nutzen | Der Ansatz kann Leerstand, Unterauslastung, Umnutzung, Teilung oder freiwilligen Tausch besser nutzbar machen. Daraus folgt noch nicht automatisch, dass Wohnraum tatsächlich verfügbar wird oder Menschen ohne Druck umziehen können. |
| housing.funding | Ansatz: Förderung und Finanzierung verändern | Der Ansatz kann Investitionen, Modernisierung oder Zugang wirtschaftlich anders möglich machen. Daraus folgt noch nicht automatisch, dass zusätzliche Mittel zusätzliche Wirkung erzeugen. |
| housing.tax | Ansatz: steuerliche Anreize verändern | Der Ansatz verändert Kosten und Anreize für bestimmte Entscheidungen. Daraus folgt noch nicht automatisch, dass der Anreiz die adressierten Haushalte erreicht oder Mitnahmeeffekte ausbleiben. |
| housing.protection | Ansatz: Schutz- und Mietregeln verändern | Der Ansatz verändert Rechte, Pflichten und Verhandlungsspielräume im Wohnungsmarkt. Daraus folgt noch nicht automatisch passender Wohnraum oder tragbare Gesamtwohnkosten. |
| housing.municipal | Ansatz: kommunalen Handlungsspielraum stärken | Kommunen können vor Ort anders planen, steuern, fördern oder Flächen aktivieren. Daraus folgt noch nicht automatisch, dass Mittel, Personal, Rechtsklarheit und Zusammenarbeit vorhanden sind. |
| housing.funding.finance | Förderung + Finanzierung | Finanzierung passt unmittelbar zum benannten Engpass. Zu prüfen bleibt, ob zusätzliche Mittel zusätzliche Wirkung erzeugen oder überwiegend bereits geplante Aktivitäten finanzieren. |
| housing.funding.delivery | Förderung + Personal, Verfahren oder Zusammenarbeit | Mehr Geld verändert den genannten Engpass zunächst nicht unmittelbar. Es kann sogar die Nachfrage nach knapper Umsetzungskapazität erhöhen. |
| housing.any.data | Jeder Ansatz + Daten | Der Ansatz kann wirken. Ohne passende Beobachtung bleibt jedoch offen, ob sich Zugang, Bezahlbarkeit oder Verdrängung tatsächlich verändern. |

## Pilotregeln Gesundheit und Pflege

| ID | Auslöser | Reaktion |
| --- | --- | --- |
| care.access | Ansatz: Zugang zu Versorgung verbessern | Zugangswege, Erreichbarkeit oder Anspruchsvoraussetzungen können sich verändern. Daraus folgt noch nicht automatisch, dass Menschen rechtzeitig Hilfe erhalten und Übergänge verlässlich funktionieren. |
| care.finance | Ansatz: Vergütung, Finanzierung oder Förderung verändern | Der Ansatz kann Anreize und Ressourcen verändern. Daraus folgt noch nicht automatisch, dass Mittel bei Betroffenen ankommen oder Personal und Kapazitäten verfügbar sind. |
| care.workforce | Ansatz: Personal und Qualifizierung stärken | Zeit, Fähigkeiten und Aufgabenverteilung können sich verändern. Daraus folgt noch nicht automatisch, dass Versorgungsbrüche oder Zugangshürden abnehmen. |
| care.coordination | Ansatz: Übergänge und Zusammenarbeit verbessern | Zuständigkeiten, Übergaben und Informationswege können besser verbunden werden. Daraus folgt noch nicht automatisch, dass die Abstimmung im Alltag funktioniert oder Fachkräfte entlastet werden. |
| care.prevention | Ansatz: Prävention und frühe Unterstützung stärken | Frühzeitige Beratung, Erkennung und Unterstützung können leichter möglich werden. Daraus folgt noch nicht automatisch, dass Krisen seltener werden oder Menschen rechtzeitig erreicht werden. |
| care.digital | Ansatz: sichere digitale Infrastruktur verbessern | Information, Kommunikation und Abläufe können zuverlässiger werden. Daraus folgt noch nicht automatisch, dass Systeme zusammenpassen, Fachkräfte entlastet werden und Gesundheitsdaten geschützt bleiben. |
| care.finance.delivery | Finanzierung + Personal, Verfahren oder Zusammenarbeit | Mehr Mittel lösen den genannten Engpass zunächst nicht unmittelbar. Sie können die Nachfrage nach knapper Kapazität sogar erhöhen. |
| care.any.rules | Jeder Ansatz + Regeln | Der Ansatz kann an Grenzen stoßen, wenn Leistungs-, Berufs-, Zulassungs- oder Datenschutzregeln den Versorgungsweg unterbrechen. |

## Fallback

Wenn es keine freigegebene spezifische Kombination gibt:

> Aus Ihrer Auswahl folgt zunächst: Der gewählte Ansatz adressiert den
> genannten Engpass nur teilweise. Im Report werden beide Punkte daher als
> getrennte Prüffragen sichtbar.

Der Fallback darf nicht behaupten, der Ansatz sei falsch oder unwirksam.

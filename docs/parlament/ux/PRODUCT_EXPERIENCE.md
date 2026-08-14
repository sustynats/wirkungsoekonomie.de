# Wirkungsportal Parlament — Product Experience

Stand: 2026-08-14 · Positionierung: **Parteiunabhängige Wirkungsinfrastruktur für politische Entscheidungen**, herausgegeben vom Institut für Wirkungsökonomie (fachliche Leitung: Natalie Weber). Nie „Meta-Partei" öffentlich.

## Die eine Sache, die das Produkt kann

> Vorher verstehen. Entscheidung prüfen. Nachher messen. Aus Wirkung lernen.

Für jede relevante Bundestagsentscheidung beantwortet dieselbe Seite über ihren ganzen Lebenszyklus: Was wird entschieden? Was soll sich ändern? Über welchen Wirkpfad? Was wissen wir (nicht)? Wie ist es am veröffentlichten Referenzrahmen (SDGs/Agenda 2030/SDG+, Mensch–Planet–Demokratie) einzuordnen? Und später: Was ist tatsächlich eingetreten?

## Drei Nutzer:innen, drei Versprechen

1. **MdB/Büro** („Ich habe 4 Minuten zwischen zwei Terminen"): 60-Sekunden-Block mobil zuerst; Parlament-Modus mit Drucksachen, Prüffragen, kopierbarem Kurzbrief. Versprechen: *Bevor ich 70 Seiten Begründung lese, sehe ich die kritischen Wirkpfade und offenen Fragen.*
2. **Bürger:in** („Was wird da eigentlich beschlossen?"): Alltagssprache zuerst, Fachbegriffe per Hover, „Was bedeutet Ja/Nein?", keine Vorkenntnisse nötig. Versprechen: *Ich verstehe, was beschlossen wird und warum die Folgen nicht so einfach sind wie die Schlagzeile.*
3. **Journalist:in/Fachwelt**: Claim-genaue Quellen, Methodik offen, Fassungs- und Korrekturhistorie, zitierfähige Anker. Versprechen: *Ich kann jede zentrale Aussage prüfen und nachrechnen, statt glauben zu müssen.*

## Fünf Säulen als eine Lernschleife (nicht fünf Silos)

Radar (was kommt) → Wirkungscheck (was könnte es bewirken) → Dialog (was halten Parlament/Öffentlichkeit für wichtig — Präferenz, nie Wirkungsnachweis) → Historie (was wurde früher entschieden) → Monitor (was ist eingetreten) → zurück ins Radar. Die UI erzählt diese Schleife auf dem Portalstart und verlinkt sie auf jeder Entscheidungsseite („Diese Entscheidung im Lebenszyklus").

## Vertrauensarchitektur = Produktkern (nicht Footer)

Sichtbar auf jeder Analyse: Herausgeberzeile, analysierte Fassung + Stand, Methodenversion, „Warum prüfen wir dieses Vorhaben?", Empfehlungsbegründung mit Falsifizierbarkeit („Was würde das Votum ändern?"), stärkstes Gegenargument, Korrekturhistorie, Trust-Card mit Weg ins Trust-Center. Startseiten-Erklärung (Basis §25-Text): „Parteiunabhängig. Methodisch offen. Quellenbasiert. Wir bewerten keine Parteien oder Abgeordneten …" — SDG+-Disclosure inklusive.

## Harte Produktgrenzen (UI erzwingt sie)

Keine Rechtsgutachten (Formulierung immer „Aus Wirkungsperspektive müsste eine Ausgestaltung sicherstellen, dass …"); keine Personen-/Partei-/Fraktionsbewertung, keine Rankings; Umfragen ändern nie das Fachvotum; die WÖK-KI ist räumlich getrennte Opt-in-Vertiefung mit Banner „verändert das veröffentlichte Fachvotum nicht"; Empfehlungen kommen aus regelbasierter Analyse + redaktioneller Freigabe, nie aus dem LLM; ex ante sprechen wir über Potenziale/Risiken, nie über eingetretene Zukunft; „Keine relevante Wirkung erkennbar" und „Keine belastbare Empfehlung möglich" sind vollwertige, gestaltete Ergebnisse; Datenlücken werden ausgewiesen, nicht überbrückt.

## Empfehlungssprache (feste Wortmarken, §24)

Wirkungslogik tragfähig · unter Bedingungen tragfähig · Begrenzte Erprobung sinnvoll · Vor Entscheidung nacharbeiten · Aus Wirkungsperspektive derzeit nicht tragfähig · Keine belastbare Empfehlung möglich. Bei verifizierter Ja/Nein-Abstimmung zusätzlich die Übersetzungszeile („spricht die derzeitige Analyse eher für …"). Chips immer Text+Farbe, nie Farbe allein.

## Erfolgskriterien (Definition of Done §75 als UX-Testfragen)

Ein kritischer Erstnutzer kann ohne Hilfe die 20 Fragen beantworten (Was steht zur Entscheidung? Welche Fassung? Fakten vs. Annahmen? Warum diese Empfehlung? Was würde sie ändern? …). Jede Frage hat einen festen Ort im Layout — das Review prüft Frage für Frage gegen den Prototyp.

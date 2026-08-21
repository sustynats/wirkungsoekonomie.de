# AGENTS.md

Diese Datei ist die dauerhafte Arbeitsanweisung fuer Codex-Aufgaben in diesem Repository.

## Grundsaetze fuer Website-Aufgaben

- Lies zuerst die vorhandene Projektstruktur und verwende das bestehende Content-System.
- Wenn Inhalte aus Markdown, MDX, JSON, YAML, einem Headless CMS oder Content Collections generiert werden, lege neue Inhalte dort an.
- Wenn die Website statisch aus HTML, Templates und Build-Skripten besteht, nutze diese Templates und Generatoren statt hart codierter Sonderseiten.
- Verwende vorhandene Frontmatter-Strukturen, Navigation, Sidebar-Logik, SEO-Metadaten, Komponenten, CSS-Tokens und Build-Skripte.
- Ergaenze Navigation, Footer, interne Links, Suchmetadaten und Suchindex, wenn eine neue oeffentliche Seite entsteht.
- Halte neue Komponenten klein, wiederverwendbar und generisch genug fuer spaetere Seiten.
- Fuehre vor Abschluss Build- und Qualitaetspruefungen aus und stelle beauftragte Website-Aenderungen live.
- Pruefe nach dem Deployment die Live-URL und relevante Such-/Navigationspfade.

## Inhaltliche Leitlinie Wirkungsökonomie

- Wirkung ist neutral und relational.
- Wirkung bedeutet tatsächliche Veränderung von Zuständen.
- Wirkung, Wirkungspotenzial und Wirkungsrisiko werden klar unterschieden.
- Positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet.
- Wenn eine Zielgroesse gemeint ist, verwende positive Netto-Wirkung.
- Wirkung, Wirkungspotenzial, Wirkungsrisiko, Netto-Wirkung, Transformationswirkung, Wirkungslenkung und Wirkungsarchitektur duerfen nicht vermischt werden.
- Wirkstoff darf nur als Analogie verwendet werden.
- Bei Sprache und Medien vorsichtig von Wirkungspotenzial, Resonanzraum und Wirkpfad sprechen.
- Reichweite ist nicht Wirkung.
- Reporting ist von Rueckkopplung zu unterscheiden.
- Nichtkompensation und Reverse Merit Order sind zu nennen, wenn Steuerungslogik, Bewertung oder Priorisierung beschrieben werden.
- Die WÖk ist keine Planwirtschaft, keine Sprachpolizei und kein Social-Credit-System.
- Keine Personenbewertung, keine moralische Rangliste von Menschen, kein Social Credit.
- Modellhafte Inhalte bleiben als Modell, Demo, Entwurf oder Arbeitspapier gekennzeichnet.
- Seiten sollen auch fuer Menschen verstaendlich sein, die die Wirkungsökonomie noch nie gehoert haben.

## Staatliche Nachhaltigkeits- und Gesetzesfolgenarchitektur

- Deutschland besitzt bereits eine institutionalisierte Gesetzesfolgen- und Nachhaltigkeitspruefungsarchitektur. Die WÖk ersetzt sie nicht und darf nicht behaupten, Folgen- oder Nachhaltigkeitspruefung erstmals einzufuehren.
- Fuer Bundesregelungsvorhaben sind insbesondere die Deutsche Nachhaltigkeitsstrategie (DNS), die Gesetzesfolgenabschaetzung nach GGO, die Nachhaltigkeitspruefung, eNAP/eGFA/E-Gesetzgebung und das DNS-Indikatoren-Monitoring als bestehende staatliche Referenzarchitektur anzuerkennen, soweit sachlich anwendbar.
- § 43 GGO umfasst bereits Ziel/Notwendigkeit, Sachverhalt und alternative Loesungen. § 44 GGO umfasst beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen und Nachhaltigkeitsbezug; § 44 Abs. 7 sieht auch Angaben zur spaeteren Ueberpruefung vor. WÖk darf daher weder Alternativenpruefung noch Ex-post-Ueberpruefung als eigene Erfindung darstellen.
- WÖk-Zusatznutzen ist additiv und objektspezifisch zu beschreiben: Problem Review -> Goal Review -> A→M→ΔZ→R -> Wirkungen 1.–3. Ordnung/Kaskaden -> Verteilung/Resilienz -> Gegenfaktum/Attribution -> Material Omissions/Delivery/Policy Coherence -> Optionsvergleich -> Reality Check/Lernschleife -> Nichtkompensation harter Schutzgrenzen.
- DNS-/SDG-Zielbezug ist kein Kausalitaetsbeweis. Indikator ist nicht Wirkung. Output ist nicht Outcome. Beobachtung ist nicht Attribution.
- Eine veroeffentlichte Nachhaltigkeitsdarstellung/GFA ist nicht automatisch ein veroeffentlichter eNAP-Rohexport. Fehlt eine oeffentlich auffindbare eNAP-Dokumentation, lautet der Status `NOT_PUBLICLY_ESTABLISHED`, niemals automatisch `NOT_ASSESSED`.
- Bei geeigneten Bundesregelungsvorhaben ist der Layer `STATE_GFA_ENAP_BENCHMARK` getrennt vom unabhaengigen WÖk-Urteil zu fuehren. Konvergenz zwischen staatlicher Pruefung und WÖk ist ein valides Ergebnis; WÖk muss nicht kuenstlich anders urteilen.
- Historische Publikationen werden bei spaeteren fachlichen Praezisierungen nicht still umgeschrieben. Stattdessen Addendum, Erratum oder transparenter Standhinweis verwenden.

## Umsetzung neuer Erklaerseiten

Wenn keine geeigneten Komponenten vorhanden sind, koennen kleine wiederverwendbare Bausteine angelegt werden:

- ImpactProcess
- ExampleCards
- MythRealityGrid
- DefinitionCard
- FeedbackLoop

Diese Bausteine sollen generisch bleiben und nur die Inhalte der jeweiligen Seite als Daten erhalten.

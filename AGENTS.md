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

## Hosting- und Kostenschutz

- Das verbindliche Bruttobudget fuer Vercel betraegt hoechstens 25 EUR pro Monat. Eine Erhoehung braucht eine ausdrueckliche Entscheidung der Projektinhaberin.
- Automatische Vercel-Deployments aus Git-Pushes und Pull Requests bleiben deaktiviert. Vercel-Production wird nur manuell aus einem geprueften, commitgebundenen Release-Artefakt aktualisiert.
- Oeffentliche grosse Dateien und unveraenderliche Publikationsartefakte gehoeren in GitHub Releases. Vercel ist weder primaerer Artefaktspeicher noch kanonischer Datenbestand.
- Private Nutzerdaten werden nicht neu in Vercel-Speicher geschrieben. Der Zielbestand liegt in Oracle/OCI; bestehende Altsysteme werden nur backup-first und ohne stillen Datenverlust migriert.
- Vercel-Builds verwenden die Standardmaschine, feste Auswahl, keine elastische Parallelitaet und eine serielle Queue. Preview-Builds werden nicht fuer normale Fach-, Daten- oder Bot-Commits erzeugt.
- Vor Aenderungen an `vercel.json`, Vercel-Projekteinstellungen oder Deployment-Workflows sind `npm run check:hosting-cost` und bei bestehender Vercel-Anmeldung `npm run check:hosting-cost:vercel` auszufuehren. Die ausfuehrliche Regel steht in `docs/ops/HOSTING-COST-GUARD.md`.
- Vor jedem manuellen Vercel-Build ist zusaetzlich `npm run check:vercel-release-budget` verpflichtend und anschliessend mit `npm run reserve:vercel-build -- --project=<name> --commit=<sha> --release=<id>` genau ein Build-Slot zu reservieren. Ein rotes Kostengate verbietet den Build; es darf nicht durch einen direkten CLI-Aufruf umgangen werden.
- Ueber alle Projekte zusammen sind hoechstens vier Vercel-Builds je Abrechnungszeitraum zulaessig. Pro Aenderungspaket wird genau ein Release Candidate gebaut; Production promotet dieses bereits gepruefte Artefakt ohne Rebuild.
- Vercel Spend Management wird zum Beginn des naechsten Abrechnungszeitraums auf 0 USD zusaetzlichen Verbrauch gesetzt, soweit Vercel 0 USD akzeptiert, sonst maximal 1 USD, jeweils mit der harten Aktion `Pause all projects`.

## Inhaltliche Leitlinie Wirkungsökonomie

- Wirkung ist neutral und relational.
- Wirkung bedeutet tatsächliche Veränderung von Zuständen.
- Wirkung, Wirkungspotenzial und Wirkungsrisiko werden klar unterschieden.
- Positive oder negative Wirkung wird aus der begründeten Zustandsveränderung, Wirkmechanismus, Evidenz/Unsicherheit und den jeweils relevanten Referenz- und Schutzräumen hergeleitet. Global gehören dazu Agenda 2030/SDGs; bei deutschen öffentlichen und regulatorischen Fällen zusätzlich die Deutsche Nachhaltigkeitsstrategie (DNS). SDG+ ist eine WÖk-eigene Erweiterung. Ziel- oder Indikatorbezug allein ist weder Wirkung noch Kausalitätsnachweis.
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

### Verbindlicher Kern: systemische statt isolierter Betrachtung

- Jede Wirkungsanalyse betrachtet den Gegenstand im gekoppelten System: relevante Abhaengigkeiten, Wechselwirkungen, Rueckkopplungen, Kaskaden sowie Wirkungsordnungen 1 bis 3 gehoeren zum Pruefkern, nicht zu einem optionalen Zusatz.
- Das gilt fuer neue Analysen, Folgenchecks, Medien-/Diskurschecks, WÖk-Analysen und rueckwirkende Neupruefungen. Kommunikations- und Ereigniswirkung bleiben dabei getrennt; thematische Verwandtschaft allein rechtfertigt keine gemeinsame Lageakte.
- Systemgrenze, Betroffene, Zeitverzug, Verteilung, Resilienz, Lock-ins und moegliche raeumliche, soziale oder zeitliche Schadensverlagerungen explizit pruefen. Nur materielle Zusammenhaenge darstellen; fehlende Belege als offen kennzeichnen, keine Kaskaden erfinden.
- Plausible Wirkpfade sind keine eingetretene Wirkung und kein Kausalitaetsnachweis. Erstmeldungen duerfen knapp bleiben, wenn die systemischen Fragen und Wissensgrenzen sichtbar sind; die Regel erzwingt weder lange Texte noch zusaetzliche kostenpflichtige Analysen.
- Historische Inhalte nicht still umschreiben. Bei erneuter Pruefung die Regel anwenden und materielle Ergaenzungen versionieren.

## Staatliche Nachhaltigkeits- und Gesetzesfolgenarchitektur

- Deutschland besitzt bereits eine institutionalisierte Gesetzesfolgen- und Nachhaltigkeitspruefungsarchitektur. Die WÖk ersetzt sie nicht und darf nicht behaupten, Folgen- oder Nachhaltigkeitspruefung erstmals einzufuehren.
- Fuer Bundesregelungsvorhaben sind insbesondere die Deutsche Nachhaltigkeitsstrategie (DNS), die Gesetzesfolgenabschaetzung nach GGO, die Nachhaltigkeitspruefung, eNAP/eGFA/E-Gesetzgebung und das DNS-Indikatoren-Monitoring als bestehende staatliche Referenzarchitektur anzuerkennen, soweit sachlich anwendbar.
- § 43 GGO umfasst bereits Ziel/Notwendigkeit, Sachverhalt und alternative Loesungen. § 44 GGO umfasst beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen und Nachhaltigkeitsbezug; § 44 Abs. 7 sieht auch Angaben zur spaeteren Ueberpruefung vor. WÖk darf daher weder Alternativenpruefung noch Ex-post-Ueberpruefung als eigene Erfindung darstellen.
- WÖk-Zusatznutzen ist additiv und objektspezifisch zu beschreiben: Problem Review -> Goal Review -> A→M→ΔZ→R -> Wirkungen 1.–3. Ordnung/Kaskaden -> Verteilung/Resilienz -> Gegenfaktum/Attribution -> Material Omissions/Delivery/Policy Coherence -> Optionsvergleich -> Reality Check/Lernschleife -> Nichtkompensation harter Schutzgrenzen.
- DNS-/SDG-Zielbezug ist kein Kausalitaetsbeweis. Indikator ist nicht Wirkung. Output ist nicht Outcome. Beobachtung ist nicht Attribution.
- Eine veroeffentlichte Nachhaltigkeitsdarstellung/GFA ist nicht automatisch ein veroeffentlichter eNAP-Rohexport. Fehlt eine oeffentlich auffindbare eNAP-Dokumentation, lautet der Status `NOT_PUBLICLY_ESTABLISHED`, niemals automatisch `NOT_ASSESSED`.
- Bei geeigneten Bundesregelungsvorhaben ist der Layer `STATE_GFA_ENAP_BENCHMARK` getrennt vom unabhaengigen WÖk-Urteil zu fuehren. Konvergenz zwischen staatlicher Pruefung und WÖk ist ein valides Ergebnis; WÖk muss nicht kuenstlich anders urteilen.
- Historische Publikationen werden bei spaeteren fachlichen Praezisierungen nicht still umgeschrieben. Stattdessen Addendum, Erratum oder transparenter Standhinweis verwenden.
- Der WÖk-Pruefumfang folgt der materiellen Wirkungsrelevanz, nicht allein der Rechtsform. Gesetze, Verordnungen, Strategien, Programme, Foerderungen, Garantien, Investitionen, Beschaffung, Infrastruktur- und Verwaltungsentscheidungen koennen deshalb pruefrelevant sein.
- Staatliche Pruefrahmen sind objektspezifisch zu bestimmen. Bundes-GGO und eNAP duerfen nicht pauschal auf andere Handlungsformen, Laender, Kommunen oder die EU uebertragen werden; fehlende Universalitaet ist keine staatliche Pruefleere.
- Fuer finanzwirksame Massnahmen sind § 7 BHO und die VV-BHO zu Wirtschaftlichkeitsuntersuchung und Erfolgskontrolle als bestehender staatlicher Rahmen zu pruefen. Je nach Gegenstand koennen weitere Fachrahmen hinzutreten.
- Oeffentliches Eigentum allein belegt keine Regierungsentscheidung. Eigentumsrolle, konkreter Steuerungseinfluss, oeffentliches Mandat und politische Flankierung sind getrennt nachzuweisen; Attribution bleibt ohne tragfaehige Quelle offen.

## Umsetzung neuer Erklaerseiten

Wenn keine geeigneten Komponenten vorhanden sind, koennen kleine wiederverwendbare Bausteine angelegt werden:

- ImpactProcess
- ExampleCards
- MythRealityGrid
- DefinitionCard
- FeedbackLoop

Diese Bausteine sollen generisch bleiben und nur die Inhalte der jeweiligen Seite als Daten erhalten.

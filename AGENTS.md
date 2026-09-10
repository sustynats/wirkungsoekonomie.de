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

- Vercel ist keine Standardplattform, sondern ausschliesslich die letzte, technisch zwingende und unumgaengliche Ausnahme. Bestehendes Hosting oder bequemere Umsetzung allein begruenden keine Notwendigkeit.
- Vor neuem oder erweitertem Vercel-Einsatz sind vorhandene GitHub-/Oracle-/OCI-Loesungen auf Eignung, Kosten und Kapazitaet zu pruefen. Builds und Tests laufen lokal oder in GitHub Actions; Hintergrunddienste und persistente Daten bevorzugt auf der vorhandenen Oracle-/OCI-Infrastruktur. Technische Unvermeidbarkeit muss konkret dokumentiert sein.
- Ziel sind 0 EUR Vercel-Kosten. Der kostenlose Tarif hat bei nachgewiesener technischer Unvermeidbarkeit Vorrang, sofern Nutzungsbedingungen und Limits passen. Kein automatischer Tarifwechsel, keine Tarifumgehung und keine kostenpflichtige Erweiterung. Neue kostenpflichtige Ausnahmen brauchen ausdrueckliche Freigabe.
- Das verbindliche Bruttobudget fuer Vercel betraegt hoechstens 25 EUR pro Monat ueber alle Projekte zusammen. Dies ist eine absolute Obergrenze, kein Zielbudget und keine pauschale Ausgabenerlaubnis. Eine Erhoehung braucht eine ausdrueckliche Entscheidung der Projektinhaberin.
- Bestehende produktive Dienste nicht allein wegen dieser Regel abschalten oder ungeprueft migrieren. Migrationen sind backup-first, mit gepruefter Wiederherstellung, Funktionsgleichheit, Zugriffspruefung, Kapazitaetsnachweis und Rueckfallplan. Kein Tarif-Downgrade vor geprueften Abhaengigkeiten und Kontingenten. Betriebsunterlagen, Rechnungen, Zugangswerte und Nutzerdaten bleiben privat.
- Automatische Vercel-Deployments aus Git-Pushes und Pull Requests bleiben deaktiviert. Vercel-Production wird nur manuell aus einem geprueften, commitgebundenen Release-Artefakt aktualisiert.
- Oeffentliche grosse Dateien und unveraenderliche Publikationsartefakte gehoeren in GitHub Releases. Vercel ist weder primaerer Artefaktspeicher noch kanonischer Datenbestand.
- Private Nutzerdaten werden nicht neu in Vercel-Speicher geschrieben. Der Zielbestand liegt in Oracle/OCI; bestehende Altsysteme werden nur backup-first und ohne stillen Datenverlust migriert.
- Vercel-Builds verwenden die Standardmaschine, feste Auswahl, keine elastische Parallelitaet und eine serielle Queue. Preview-Builds werden nicht fuer normale Fach-, Daten- oder Bot-Commits erzeugt.
- Vor Aenderungen an `vercel.json`, Vercel-Projekteinstellungen oder Deployment-Workflows sind `npm run check:hosting-cost` und bei bestehender Vercel-Anmeldung `npm run check:hosting-cost:vercel` auszufuehren. Die ausfuehrliche Regel steht in `docs/ops/HOSTING-COST-GUARD.md`.
- Vor jedem manuellen Vercel-Build ist zusaetzlich `npm run check:vercel-release-budget` verpflichtend und anschliessend mit `npm run reserve:vercel-build -- --project=<name> --commit=<sha> --release=<id>` genau ein Build-Slot zu reservieren. Ein rotes Kostengate verbietet den Build; es darf nicht durch einen direkten CLI-Aufruf umgangen werden.
- Ueber alle Projekte zusammen sind hoechstens vier Vercel-Builds je Abrechnungszeitraum zulaessig. Pro Aenderungspaket wird genau ein Release Candidate gebaut; Production promotet dieses bereits gepruefte Artefakt ohne Rebuild.
- Vercel Spend Management wird zum Beginn des naechsten Abrechnungszeitraums auf 0 USD zusaetzlichen Verbrauch gesetzt, soweit Vercel 0 USD akzeptiert, sonst maximal 1 USD, jeweils mit der harten Aktion `Pause all projects`.

## Veröffentlichungsqualität

- Für die ausschließlich manuelle Rubrik „Buch & Wirkung“ gilt docs/news/BUCH-UND-WIRKUNG.md.
- Die freigegebenen Manuskripte dieser Rubrik bleiben einschließlich Zeichensetzung unverändert (spezifische Ausnahme von der allgemeinen Typografie-Regel).
- Nats ist der Spitzname der Autorin Natalie Weber. In dieser Rubrik ist ihr festes Dropbox-Portrait MIT ihrem eigenen Buch „Die neue Ordnung des Wohlstands“ verbindlich; das rezensierte Verlagscover bleibt separat. Keine Montage, keine Generierung, kein Buchtausch im Portrait.

- Veröffentlichte Texte, Downloads und Metadaten verwenden ausschließlich kurze ASCII-Bindestriche.
- Dokument-Erstellerin und Autorin der eigenen WÖk-Publikationen ist Natalie Weber.
- Interne Produktionsnotizen und lokale Dateipfade gehören nicht in veröffentlichte Inhalte oder Metadaten.
- Vor Veröffentlichung sind Texte, PDF-Inhalte, Office-Dateien, Metadaten und Download-Fassungen zu prüfen. Technische Bereinigungen historischer Publikationen werden mit Datum und Prüfsummen dokumentiert; Originale bleiben im privaten Archiv erhalten.

## Inhaltliche Leitlinie Wirkungsökonomie

- Die Wirkungsökonomie ist ein umfassendes Wirtschafts- und Gesellschaftsmodell. Wirtschaft, Staat, Institutionen und gesellschaftliches Zusammenleben gehören zu ihrem Gegenstandsbereich; einzelne Instrumente bilden nur Ausschnitte ab.

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
- Systemgrenze, Betroffene, Zeitverzug, Verteilung, Resilienz, Lock-ins und moegliche raeumliche, soziale oder zeitliche Schadensverlagerungen explizit pruefen. Auch schwache indirekte Potenzialpfade mit definiertem Raum und Zeitraum dokumentieren; Modellhypothesen und Wissensgrenzen kenntlich machen, keine Kaskaden oder Belege erfinden.
- Plausible Wirkpfade sind keine eingetretene Wirkung und kein Kausalitaetsnachweis. Erstmeldungen duerfen knapp bleiben, wenn die systemischen Fragen und Wissensgrenzen sichtbar sind; die Regel erzwingt weder lange Texte noch zusaetzliche kostenpflichtige Analysen.
- Historische Inhalte nicht still umschreiben. Bei erneuter Pruefung die Regel anwenden und materielle Ergaenzungen versionieren.
- Konkrete Folgen vor Zielnummern: Handlung/Unterlassung -> betroffene Funktion -> Zustandsveraenderung -> Folgen fuer Menschen und Systeme -> Bedingungen, Zeithorizont und Unsicherheit -> passender SDG-/SDG+-/Rechtsbezug. Ein blosser Zielkonflikt ersetzt keine Erklaerung und ist kein festgestellter Rechtsverstoss. Bei materieller Relevanz Sicherheit von Kindern und Frauen, Gewaltschutz, Gleichberechtigung, Barrierefreiheit und erreichbare Hilfe ausdruecklich pruefen; keine Betroffenheit oder Kausalitaet erfinden.

### Globale redaktionelle Regel: anschaulich erklaeren, begruendet urteilen

- Fuer das zentrale MPD-Bewertungs- und Darstellungsmodell gilt docs/news/IMPACT-SEMANTICS-2.1.md; 2.0 ist historisch. docs/news/WIRKUNGSPOTENZIAL-DARSTELLUNG.md dokumentiert nur den abgeloesten Stand 1.2. Konkrete moegliche Zustandsaenderung und Bedingung auch in der Uebersicht zeigen. Massnahmenfolge, erklaerte Absicht, Verfahrensschritt, Risikobegrenzung und politische Reaktion getrennt fuehren; keine gemittelte Richtungsampel. Historische Mischurteile ohne gepruefte Pfadrollen sind keine belastbare Gesamtbewertung, nicht automatisch positiv oder negativ umzuschreiben.

- Die sichtbare Beitragsart der eigenständigen Ticker-Analysen heißt „Meinung & Analyse“. Bestehende `/wirkungsticker/analyse/`-URLs, Inhaltshistorie und interne Analyse-IDs bleiben unverändert. Recherchierte Fakten, wirkungswissenschaftliche/wirkungsökonomische Analyse und persönliche Meinung Natalie Webers sind drei getrennte Ebenen. Der Transparenzhinweis steht bei Autorin/Metadaten. Historischen Beiträgen keine persönliche Haltung erfinden.
- Für diese Autorenbeiträge: konkretes Beispiel -> Mechanismus -> Systemwirkung; verständlich, erzählerisch, persönlich und bei begründeter Relevanz emotional. Keine Hysterie, KI-Floskeln, unnötige Wiederholung gegnerischer Frames, pauschale Wählerabwertung oder Ferndiagnosen. Zuhören ist nicht Hinterherlaufen. Persönliche Wertungen sind als solche erkennbar; faktische Aussagen bleiben überall belegpflichtig.
- Fuer grundsaetzlich alle Lesertexte gilt das Armin-Maiwald-Prinzip: konkrete Lebenslage oder belegtes Beispiel zuerst, Zusammenhang Schritt fuer Schritt erklaeren, Fachbegriff danach. Lebendig, warm, aktive Verben, kurze bis mittlere Saetze. Keine erfundenen Erlebnisse, Beispielfaelle als solche kenntlich; weder Kindersprache noch Dramatisierung. Dies ist keine Pflicht zu laengeren Texten.
- Fakten korrekt, fair und quellengebunden ermitteln. Die methodische Schlussfolgerung darf klar und asymmetrisch sein, wenn die Evidenz es ist. Keine False Balance und kein Einerseits/Andererseits aus Stilgruenden. Positive Gegenpfade nur aus konkret untersuchten, angekuendigten oder vorgesehenen Massnahmen mit nachvollziehbarem Mechanismus; keine abstrakten Vorteile als Gegengewicht erfinden.
- Massnahmenstatus, Eintrittswahrscheinlichkeit, Wirkungsrichtung, Wirkungsstaerke und Evidenzsicherheit getrennt zeigen. Offen ist nicht neutral. Schutzplanken begrenzen Macht oder Risiken; sie sind keine positive Gegenwirkung. Fakten, Programm, bedingte Analyse und Szenario auseinanderhalten.
- Grundsaetzlich in allen Ticker-Artikeln und Analysen: Jeder neu bewertete Wirkpfad zeigt Richtung, betroffene MPD-Dimension(en), konkrete Zustandsveraenderung, Bedingung und Evidenzstatus; reine Wirkungsfeld-, Zustaendigkeits- oder Bezugsuebersichten als solche benennen. Keine Richtung aus Thema, SDG-Zuordnung oder Relevanzbalken ableiten. Fehlende Richtungseinschaetzung als noch nicht eingeordnet kennzeichnen, nicht als neutrales oder offenes Richtungsurteil. Historischen Pfaden keine Richtung erfinden; bei redaktioneller Neupruefung versioniert ergaenzen.
- Produktinvariante Wirkungsticker: Jede regulaere Wirkungsticker-Meldung wird als Ausloeser eines Wirkungspotenzials betrachtet. Fuer Mensch, Planet und Demokratie wird jeweils ein Wirkungspfad modelliert. Die Frage lautet nicht, ob Wirkungspotenzial vorhanden ist, sondern welche Richtung, Staerke, Wahrscheinlichkeit, Zeitwirkung und Evidenz es besitzt. Jede Dimension hat eine begruendete numerische Tragweite 0 bis 5, Empfaenger, Referenzraum, Zeithorizont und einen dokumentierten Mechanismus. 0 bedeutet praktisch vernachlaessigbare Zustandsveraenderung im betrachteten Raum und Zeitraum, niemals fehlenden Pfad. not_material, insufficient_basis, fehlende MPD-Dimensionen und technische null-Werte sind keine oeffentlichen Endergebnisse. Datenluecken loesen gezielte Recherche und einen zweiten Pass aus; danach sind begruendete konservative Bandbreiten mit offengelegten Modellannahmen zulaessig. Keine Fakten, Quellen oder Scheingenauigkeit erfinden. Unsicherheit betrifft Richtung, Eintritt und Evidenz getrennt. Relevanz steuert niemals den MPD-Balken.
- Beobachtete Folgen bleiben neben Potenzialen sichtbar: belegte Tote, Verletzungen, Waldbrandflaechen oder andere eingetretene Zustandsveraenderungen nicht als blosses Zukunftsrisiko bezeichnen. Ereignisbeleg und Ursachenattribution getrennt nachweisen; ein Schaden allein beweist nicht seinen Klimawandelanteil. Prognose, erste Signale und beobachtete Wirkung getrennt speichern. original_potential_assessment bleibt unveraendert; current_potential_assessment und observed_effects ermoeglichen die spaetere Lernschleife. Rueckwirkende Rekonstruktionen niemals als damalige Vorhersage ausgeben.
- Zentrale Semantik: scripts/news/impact-assessment.mjs und docs/news/IMPACT-SEMANTICS-2.1.md. Diese Produktinvariante gilt fuer Datenquelle, Pipeline, Migration, alle Ausgaben und Release-Pruefung. Keine spaetere technische Regel darf sie ausser Kraft setzen. Listen, Details und Sharecards verwenden dieselbe Ableitung. Wirkungspotenzial ist weder eingetretene Wirkung noch gesicherte Kausalitaet. Nichtkompensation und Reverse Merit Order bleiben verbindlich.
- Jede neue MPD-Bewertung nennt Gegenstand und Vergleichszustand. Verbesserungen gegenueber einem schlechteren Entwurf duerfen nicht als Verbesserung gegenueber dem Zustand ohne Eingriff gelten. Ausbleibender Nutzen, blosse Umsetzungsoffenheit und das Vorhandensein parlamentarischer Verfahren sind keine eigenstaendigen Gegenwirkungen. Restschaden und Risikominderung getrennt begruenden; eigenstaendige Vorteile anderer Massnahmen sichtbar lassen, aber nicht als unbelegten Ausgleich behandeln. Dies gilt ebenso fuer Meinung & Analyse. Keine automatische historische Umpolung und keine Richtungsregel nach Partei, Quelle oder Thema.
- WÖk-Analysen duerfen menschlich, persoenlich und zugewandt klingen: eine erkennbare journalistische Stimme, konkrete Lebenslagen und natuerliche Uebergaenge statt Behoerdenstil. Die Ich-Form dient der gekennzeichneten persoenlichen Gewichtung, nicht erfundenen Gefuehlen, Erlebnissen oder einer vorgetaeuschten manuellen Autorenschaft.
- Neue WÖk-Analysen erhalten einen verstaendlichen Kurzbefund, eine echte erklaerende Wirkungsvisualisierung, getrennte MPD-Tragweite/Richtung/Evidenz und eine gesonderte persoenliche journalistische Schlusssektion der Autorin. Diese darf klar gewichten, aber keine neuen unbelegten Tatsachen oder erfundenen persoenlichen Erlebnisse einfuehren. Generierte Einordnungen duerfen keine manuelle Einzelpruefung behaupten.
- `author_perspective` bleibt von Fakten und methodischer Analyse getrennt. Historischen Analysen keine Haltung nachtraeglich erfinden; erst bei einer beauftragten redaktionellen Aktualisierung versioniert ergaenzen. Bestehende Daten bleiben rueckwaertskompatibel.
- Qualitaetsgate: False Balance, konkrete Grundlage positiver Pfade, getrennte Unsicherheitsdimensionen, Schutzplanken als Begrenzung, klares Urteil, 90-Sekunden-Verstaendlichkeit, funktionale Icons/Visualisierung, MPD-Richtung und getrennte Autorinnenperspektive pruefen. Formale Labels ersetzen keine inhaltliche Evidenzpruefung.

## Audio-Kurzfassungen des Wirkungstickers

- Verbindliches TTS-Zusatzbudget: 0 EUR, auch fuer Einrichtung und Tests. Das umfasst Sprechfassung, Sprach-/Pruefmodelle, CPU/GPU, Speicher, Datentransfer und weitere Audio-Dienstkosten. Bestehende Budgets fuer die unabhaengige Nachrichtenverarbeitung werden dadurch weder erhoeht noch abgeschaltet.
- Kein kostenpflichtiger Tarif, kein automatisches Upgrade, kein Nachladen von Guthaben und keine kostenpflichtige Ueberziehung. Ein Gratisguthaben, eine Kostenprognose oder eine Budgetwarnung ist keine harte Kostensperre. Vor dem ersten ressourcenerzeugenden oder abrechenbaren Aufruf muss fuer den vollstaendigen Audio-Pfad eine wirksame anbieterseitige Begrenzung auf 0 EUR Zusatzkosten einschliesslich Nebenleistungen und Verhalten bei Kontingent-/Probezeitende nachgewiesen sein. Ist das nicht moeglich, wird der Dienst nicht aktiviert. Keine Umgehung von Anbieterlimits.
- Bei erschoepfter kostenloser Kapazitaet duerfen nur neue Audioauftraege warten. Textveroeffentlichung, bestehende Nachrichtenlaeufe und bereits verfuegbare passende Audios bleiben davon unabhaengig. Es gibt keinen kostenpflichtigen Fallback und keine Garantie sofortiger Audioverfuegbarkeit bei 0-EUR-Budget.
- Zunaechst fuer die eigenstaendigen Beitraege "Meinung & Analyse", nicht automatisch fuer jede Nachricht. Ziel sind 60 bis 120 Sekunden tatsaechlich gemessene Audiodauer einschliesslich des persoenlichen Fazits, keine vollstaendige Vorlesefassung.
- Sprechfassung: greifbarer Einstieg -> Kernbefund -> wichtigste konkrete/systemische Folgen -> hoerbar getrenntes persoenliches Fazit Natalie Webers mit "Meine Einordnung". Natuerlich, locker, menschlich und auf Augenhoehe; kurze Saetze, Zusammenhaenge Schritt fuer Schritt, Fachbegriffe erst danach. Keine Imitation einer fremden Stimme oder individuellen Ausdrucksweise.
- Das Fazit wird aus der im Beitrag vorhandenen Autorinnenperspektive verdichtet. Keine neue Haltung, Erfahrung oder Tatsachenbehauptung erfinden. Fehlt eine solche Perspektive, entsteht nicht automatisch ein persoenliches Audiofazit. Bedingungen, Unsicherheit und die Trennung von Befund, Wirkpfad und Meinung bleiben auch in der Kurzfassung erhalten.
- Stimme: ausschliesslich das autorisierte eigene Stimmprofil. Private Referenzaufnahmen und Sprecherembeddings bleiben privat. Ein bekannter fremd klingender Testclip darf nicht aufgrund bestandener Textpruefung oder eines unkalibrierten Aehnlichkeitsscores als eigene Stimme freigegeben werden.
- Routine serverseitig ohne Mac, Browser oder manuelle Einzelfreigabe betreiben. Dauerhafte Auftraege, Wiederaufnahme und Versionsbindung vorsehen; einmal erzeugte und gepruefte Audios wiederverwenden. Weder Audio-Erzeugung noch eine gescheiterte Audiopruefung darf Nachrichten oder Textanalysen blockieren.
- Player nur fuer ein vollstaendiges, geprueftes und zur aktuellen Beitragsfassung gehoerendes Audio anzeigen. Keine automatische Wiedergabe und keine Behauptung einer persoenlich eingesprochenen Aufnahme. Ein technischer Test ist noch kein produktiver Audiodienst.

## Regionale Nachrichtenabdeckung

- Ziel sind dauerhaft regelmaessig ueberwachte regionale Quellen fuer alle 16 Bundeslaender. Die Laenderzuordnung steht explizit in der bestehenden Source Registry; eine pauschale DE-Zuordnung zaehlt nicht als regionale Vollabdeckung.
- Fehlende, deaktivierte, ueberfaellige und noch nicht erfolgreich abgerufene Zugaenge getrennt ausweisen. Amtliche Pressequellen koennen eine Grundabdeckung liefern, ersetzen aber keine unabhaengige Regionalberichterstattung. Regierungsangaben bleiben attribuiert.
- Zugang, Robots/RSL und Nutzungsrahmen vor Aktivierung pruefen; Abdeckungsziele duerfen keine Sperren oder Rechtspruefung umgehen. Regionale Routine, Termine, Sport und Eigenwerbung vor der KI filtern; materielle neue Entwicklungen weiter zulassen.

## Staatliche Nachhaltigkeits- und Gesetzesfolgenarchitektur

- Deutschland besitzt bereits eine institutionalisierte Gesetzesfolgen- und Nachhaltigkeitspruefungsarchitektur. Die WÖk ersetzt sie nicht und darf nicht behaupten, Folgen- oder Nachhaltigkeitspruefung erstmals einzufuehren.
- Fuer Bundesregelungsvorhaben sind insbesondere die Deutsche Nachhaltigkeitsstrategie (DNS), die Gesetzesfolgenabschaetzung nach GGO, die Nachhaltigkeitspruefung, eNAP/eGFA/E-Gesetzgebung und das DNS-Indikatoren-Monitoring als bestehende staatliche Referenzarchitektur anzuerkennen, soweit sachlich anwendbar.
- § 43 GGO umfasst bereits Ziel/Notwendigkeit, Sachverhalt und alternative Loesungen. § 44 GGO umfasst beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen und Nachhaltigkeitsbezug; § 44 Abs. 7 sieht auch Angaben zur spaeteren Ueberpruefung vor. WÖk darf daher weder Alternativenpruefung noch Ex-post-Ueberpruefung als eigene Erfindung darstellen.
- WÖk-Zusatznutzen ist additiv und objektspezifisch zu beschreiben: Problem Review -> Goal Review -> A→M→ΔZ→R -> Wirkungen 1.-3. Ordnung/Kaskaden -> Verteilung/Resilienz -> Gegenfaktum/Attribution -> Material Omissions/Delivery/Policy Coherence -> Optionsvergleich -> Reality Check/Lernschleife -> Nichtkompensation harter Schutzgrenzen.
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

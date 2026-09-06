# 2.0-Dokumentquellen Extrakt

## Wirkungsoekonomie_Webseitenanalyse_Codex_Report_2026-06-04.docx

Pfad: `Wirkungsoekonomie_Webseitenanalyse_Codex_Report_2026-06-04.docx`  
Vorhanden: True  
Zeichen: 30084

Webseitenanalysewirkungsoekonomie.de
Styleguide-, Struktur-, Inhalts- und DokumentenprüfungCodex-taugliches Korrekturreporting
Stand der Prüfung: 04.06.2026Prüfobjekt: https://wirkungsoekonomie.de/ und verlinkte Seitentypen
Kurzfazit: Die neue Website hat einen deutlich tragfähigeren Kern als die alten Seiten. Die Grundlogik „Wirkung statt Kapital“, „Mensch, Planet und Demokratie“ und die begriffliche Präzisierung sind auf den Hauptseiten erkennbar. Vor einer final stabilen Veröffentlichung müssen jedoch mehrere P0-Themen korrigiert werden: einheitliche Navigation/Site-Shell, Altseiten, Online-Dokument-Inhaltsverzeichnisse, Kapitelanker, Encoding/Umlaute, Generierungsartefakte und Dubletten.
1. Prüfrahmen und Bewertungsmaßstab
Ziel der Analyse. Die Website wurde als publizistisches, fachliches und methodisches Eingangstor der Wirkungsökonomie geprüft. Der Bericht ist so formuliert, dass Codex daraus direkte Korrekturaufträge, Akzeptanztests und Prioritäten ableiten kann.
Prüfgrundlage. Geprüft wurde gegen den sichtbaren Online-Standard der neuen Seite, gegen allgemeine Web- und Content-Qualitätskriterien sowie gegen die führende WÖk-Begriffslogik: Wirkung ist neutral und relational; positive Wirkung ist am Rahmen SDGs/Agenda 2030/SDG+ zu bewerten; Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie; Wirkungspotenzial darf nicht als eingetretene Wirkung formuliert werden; Rückkopplung muss von Reporting getrennt bleiben.
Wichtige Einschränkung. Die Analyse erfolgte über Live-Webseitenaufrufe und auslesbaren gerenderten Text/Struktur. Sie ersetzt keine pixelgenaue Browser-/Breakpoint-Prüfung mit Playwright, Lighthouse oder Percy. Genau diese technische CSS-QA ist deshalb als Codex-Abnahmeschritt enthalten.
Bewertungsstufen: P0 = Veröffentlichung blockierend oder gravierender Vertrauens-/Navigationsfehler; P1 = vor finalem Launch korrigieren; P2 = Qualitäts- und Konsistenzverbesserung.
2. Executive Summary
Die Hauptseiten Start, Verstehen und So wirkt WÖk transportieren die Grundphilosophie überzeugend: Kapital bleibt Werkzeug, Wirkung wird Steuerungsmaßstab, positive Netto-Wirkung ist Zielgröße.
Die Seitenstruktur ist grundsätzlich sinnvoll: Start → Verstehen → Funktionsweise → Wirkungsfelder → Werkzeuge → Erleben → Akademie → Bibliothek → Mitmachen. Sie ist aber noch nicht überall technisch konsistent umgesetzt.
Die größten Risiken liegen nicht im Grundnarrativ, sondern in Generierungs- und Migrationsproblemen: alte Seiten sind weiter erreichbar, einzelne Seitentypen verwenden andere Navigation, Dokumente haben page-only oder fehlerhafte Inhaltsverzeichnisse, sichtbare Labels enthalten ASCII-Umlaute, und einige Textblöcke/Listen wirken zusammengezogen.
Für die Bibliothek und Onlinefassungen muss ein harter Standard gelten: jedes relevante Dokument braucht eine eindeutige Detailseite, eine Onlinefassung oder klaren Status „Onlinefassung in Vorbereitung“, eine semantische Inhaltsstruktur, Kapitel-/Abschnittsanker und konsistente Metadaten.
Inhaltlich ist der Kern überwiegend tief genug. Kritisch sind vor allem Seiten, auf denen umfangreiche generierte Detailkonzepte oder Dossiers mit wiederholten Mustern erscheinen. Diese müssen dedupliziert, redaktionell verdichtet und mit echten, unterscheidbaren Wirkpfaden statt Schablonentexten versehen werden.
3. P0-Blocker vor finaler Freigabe
P0-01 · P0 · Einheitliche Site-Shell und Navigation fehlen
Befund / Beleg: Die neue Hauptnavigation ist auf der Startseite vollständig. Die Bibliothek und Referenz-/Kapitel-Seiten verwenden abweichende Menüs; die alte WÖK-Journal-Seite ist mit alter Navigation, altem Cookie-/Trackingtext und alter Struktur noch erreichbar.
Codex-Auftrag: Eine einzige Header-/Footer-Komponente für alle Routen einsetzen. Alle statischen HTML-Seiten, Referenzseiten, Dokumentdetailseiten, Blog/Journalseiten und Redirect-Stubs müssen dieselbe Navigation verwenden. Alte Seiten 301-redirecten oder noindex setzen.
Abnahmekriterien: Snapshot-Test: Header-Linkliste ist auf allen geprüften Routengruppen identisch bis auf aktiven Zustand. Keine Seite zeigt altes Menü, alte IONOS-/Cookie-Texte oder alte „Startseite/Funktionsweise/Über die WÖk“-Navigation.
P0-02 · P0 · Online-Dokumente haben page-only oder fehlerhafte Inhaltsverzeichnisse
Befund / Beleg: Mehrere Onlinefassungen zeigen nur „Seite 1, Seite 2 …“ statt semantischer Kapitel/Abschnitte. Beim WStG ist dies besonders kritisch: Die Bibliothek nennt 146 Seiten, die Onlinefassung zeigt oben nur Seite 1-12. Dokumente wie Grundlagenpapier, Technische Leitlinien, Lieferkette und Systemmodell bieten aktuell nur PDF ohne Onlinefassung.
Codex-Auftrag: Dokumentenrenderer umbauen: Überschriften, §§, Kapitel, Unterkapitel und Tabellen semantisch erkennen und eigene Anker erzeugen. PDF-Seitenanker dürfen nur sekundär als „PDF-Seitenmapping“ erscheinen. Bei fehlender Onlinefassung klar „Onlinefassung in Vorbereitung“ anzeigen.
Abnahmekriterien: Für jedes aktuelle Dokument existiert entweder Onlinefassung+PDF oder ein sichtbarer Status. TOC enthält semantische Überschriften, nicht nur Seiten. Alle H2/H3/§ besitzen stabile IDs und sind per Link erreichbar.
P0-03 · P0 · Encoding-, Umlaut- und Extraktionsfehler in sichtbarem Text
Befund / Beleg: Sichtbare Labels wie „fachoeffentlich“ erscheinen in Bibliothek/Systemmodell/Technische Leitlinien. In Onlinefassungen treten Extraktionsfehler wie „E`ekte“, „scha`en“ oder fehlerhafte Ligaturen auf. Das ist besonders problematisch, weil die Website begriffliche Präzision und sprachliche Sorgfalt ausstrahlen muss.
Codex-Auftrag: Display-Label-Layer strikt von Slugs/Dateinamen trennen. Slugs dürfen ASCII bleiben, sichtbare Labels müssen echte deutsche Umlaute verwenden. PDF-Import normalisieren (Unicode NFKC), Ligaturen und Ersatzzeichen bereinigen, Backtick-Fehler aus PDF-Texten korrigieren.
Abnahmekriterien: Automatischer Texttest läuft über alle Seiten: keine sichtbaren „fachoeffentlich“, „wirkungsoekonomisch“, „Pruef“, „scha`“, „E`ekt“, „Oeffentlichkeit“ außerhalb von URLs/Dateinamen/Quellpfaden.
P0-04 · P0 · Zusammengezogene Filter, Tags, Links und Markup-Reste
Befund / Beleg: In der Bibliothek sind Filter/Chips und Kategorien in der Textstruktur zusammengezogen. Auf der Werkzeugseite erscheint ein gerenderter HTML-/Markup-Rest mit `">`. Mehrfach fehlen Abstände zwischen Linktext und nachfolgendem Text oder Zitier-/Linkelementen.
Codex-Auftrag: Alle Chip-/Tag-/Filter-Komponenten müssen durch Layout-Komponenten mit gap/wrap gerendert werden; keine String-Konkatenation. HTML/Markdown-Sanitizer für Kartentexte und Linklisten. Jede Inline-Liste braucht Separatoren oder eigene Zeilen.
Abnahmekriterien: Automatisierter DOM-Test: kein sichtbarer Text enthält `">`, `</`, zusammengezogene Linktexte ohne Trennzeichen oder Chip-Ketten ohne Leerzeichen. Filter sind mobil als Drawer/Accordion nutzbar.
P0-05 · P0 · Aktive Altseiten und Dubletten gefährden Vertrauen und SEO
Befund / Beleg: Alte WÖK-Journal-Seite und Redirect-Stubs sind auffindbar. Suchergebnisse zeigen außerdem Detailseiten mit offenbar wiederholten Templateblöcken, z. B. Gesundheits-/Pflege-Detailkonzepte, Finanzsystem-Dossiers und Robotik-/Mitbestimmungsseiten.
Codex-Auftrag: Legacy-Inventar erzeugen, kanonische Zielseiten definieren, 301/noindex setzen und alle alten Navigations-/Cookie-/Theme-Artefakte entfernen. Dedupe-Prüfung für Textblöcke auf Seitentypen mit generierten Konzepten ausführen.
Abnahmekriterien: Sitemap enthält nur kanonische Seiten. `site:`-Suche findet keine alte Navigation. Dedupe-Test markiert keine Seite mit wiederholten Abschnittsblöcken über definierter Ähnlichkeitsschwelle.
4. Websiteweite Styleguide- und UX-Befunde
Spalten und Kartenraster: Die neue Kartensprache ist grundsätzlich gut. Kritisch sind dichte Filterleisten, lange Inline-Listen und Seitentypen mit vielen Karten. Vorgabe: Desktop maximal 3 Karten pro Zeile, Tablet 2, Mobil 1; Filter nie als ungebrochene Chip-Kette; große Listen in Accordion/TOC/Section-Jumps auflösen.
Abstände und Lesefluss: Hauptseiten sind gut lesbar, aber Bibliothek, Akademie, Werkzeuge und Referenznavigation wirken an mehreren Stellen zu verdichtet. Vorgabe: klare Section-Spacings, keine doppelten Überschriften direkt hintereinander, Linklisten mit Zeilenumbruch oder Semikolon/Divider.
Navigation: Die IA ist plausibel, aber Komponenten sind noch uneinheitlich. Vorgabe: identische Header-/Footer-Shell, identische Begriffe: „Methoden & Werkzeuge“, „Erleben“, „Bibliothek“, „Mitmachen“, keine alten Alternativbegriffe wie „Ausprobieren“ oder „Für wen?“ in Hauptnavigation, sofern nicht bewusst als Sekundärnavigation geführt.
Print-Metadaten: „Druckdatum“ erscheint auf normalen Webansichten. Vorgabe: nur per Print-CSS sichtbar oder im Drucklayout, nicht in der normalen UI.
Buttons und CTAs: Viele Karten verwenden generische CTAs wie „Mehr erfahren“. Vorgabe: eindeutige Beschriftungen oder aria-labels, z. B. „Werkzeug NWI öffnen“, „Onlinefassung WStG lesen“.
Schutzlinien: Die Schutzlinien gegen Personenbewertung, Rechts-/Steuerberatung und amtliche Wirkung sind ein wichtiges Qualitätsmerkmal. Sie sollten in allen Simulatoren, Dokumenten und Methoden sichtbar bleiben, aber interne Komponentennamen dürfen nicht erscheinen.
Footer: Der Footer ist vollständig, aber sehr lang. Vorgabe: gruppierte Footer-Navigation mit konsistenten Spalten und genügend Abstand; keine Linkketten ohne Trennung.
5. Seitenanalyse nach Seitentyp
5.1 Startseite /
Kurzurteil: Stark und grundsätzlich launchfähig, mit kleinen UX- und CTA-Korrekturen.
Befunde:
Hero und Kernformel „Wirkung statt Kapital“ sind klar; die Differenzierung „Kapital bleibt Werkzeug“ ist anschlussfähig und nicht antikapitalistisch verkürzt.
Einstiegswege, Methodik-Teaser und FAQ bilden eine sinnvolle Customer Journey vom einfachen Einstieg zur Vertiefung.
Footer und Kartenbereiche sind umfangreich; bei kleinen Breakpoints sollte geprüft werden, ob zu viele Karten oder Footerlinks zu dicht stehen.
Korrektur / Umsetzung:
CTA-Texte pro Karte eindeutig machen und aria-labels ergänzen.
Playwright-Screenshot auf 1440/1024/768/390 px: keine 4-Spalten-Überladung, keine horizontalen Überläufe, Kartenabstände konsistent.
Footer in logisch gruppierte Spalten mit ausreichendem Abstand bringen.
5.2 Verstehen
Kurzurteil: Inhaltlich sehr sauber und begrifflich passend zum führenden Leitfaden.
Befunde:
Definition von Wirkung als tatsächliche Zustandsveränderung ist korrekt und klar.
Positive/negative/neutrale Wirkung sowie SDG+/positive Netto-Wirkung sind verständlich erklärt.
Die vier Einstiegsfragen und die Beispiele helfen gegen oberflächliches „Geschwurbel“.
Korrektur / Umsetzung:
Abschnittsanker für Kernbegriffe ergänzen: #wirkung, #positive-netto-wirkung, #wirkungspotenzial, #rueckkopplung.
Glossar-Hover/Tooltip nur mit den führenden Kurzdefinitionen verwenden.
Seite als Referenz für alle anderen Begriffserklärungen nutzen.
5.3 So wirkt WÖk
Kurzurteil: Starker methodischer Kern; als Funktionsseite tragfähig.
Befunde:
Ursache → Wirkpfad → Zustandsänderung → Bewertung → Rückkopplung wird gut erklärt.
Die Abgrenzung „nicht Personenbewertung, nicht Planwirtschaft, nicht Sprachpolizei“ ist wichtig und sollte erhalten bleiben.
Der Begriff „Wirkstoff“ wird didaktisch eingesetzt; dabei muss der Analogiehinweis überall erhalten bleiben.
Korrektur / Umsetzung:
Alle Mini-Glossar-Begriffe mit stabilen Ankern versehen.
Interne Links zu Werkzeuge, Glossar, Folgencheck und Referenzkapiteln ergänzen.
Prüfen, dass kein Satz Wirkung deterministisch behauptet, wo nur Wirkungspotenzial gemeint ist.
5.4 Wirkungsfelder
Kurzurteil: Gute Systemlandkarte, aber Druck-/Metadaten und Kartenfülle prüfen.
Befunde:
Die fünf Cluster und die Aussage „kein Wirkungsfeld wurde entfernt“ geben Orientierung.
Druckdatum ist im normalen Webtext sichtbar und sollte print-only sein.


…


## Journalbeitrag_Oeffentlicher_Wirkungsraum_Debatten_Resonanz_Kompass.docx

Pfad: `Journalbeitrag_Oeffentlicher_Wirkungsraum_Debatten_Resonanz_Kompass.docx`  
Vorhanden: True  
Zeichen: 24478

Journal-Beitrag | Wirkungsökonomie | Entwurf zur Veröffentlichung
Nicht jedem Stöckchen hinterher
Warum Transformation einen öffentlichen Wirkungsraum braucht - und wie Debatten-Kompass, Resonanz-Kompass, Agenda-Radar, Ursachen-Navigator und Resilienz-Prinzipien zusammenwirken
Vorschlag Autorinnenzeile: Natalie Weber | Wirkungsökonomie
Kurzfassung für die Journal-Übersicht
Viele Debatten scheitern nicht erst an falschen Fakten. Sie kippen früher: durch Frames, Empörung, falsche Gewichtung und öffentliche Aufmerksamkeit, die sich an Lautstärke statt an Wirkung orientiert. Der Debatten-Kompass hilft, wenn ein Narrativ bereits im Raum steht. Der neue Resonanz-Kompass setzt davor an: Er fragt, warum genau dieses Thema so viel Raum bekommt, was dadurch verdrängt wird und welche Systemfrage eigentlich gestellt werden müsste. Zusammen entsteht der Öffentliche Wirkungsraum der Wirkungsökonomie: Debatten verstehen, Aufmerksamkeit gewichten und demokratische Resilienz stärken.
1. Das Problem beginnt früher, als wir antworten
Manchmal reicht ein einziger Satz, und der ganze Raum kippt.
„Deutschland rettet doch nicht allein das Klima.“
„Migration kostet uns nur Geld.“
„Die Ukraine-Hilfe fehlt dann hier.“
„Die da oben wollen uns alles verbieten.“
Auf den ersten Blick sind das politische Aussagen. Man kann ihnen zustimmen, widersprechen, Zahlen danebenlegen, Studien suchen, Gegenargumente formulieren. Aber genau darin liegt schon die Falle. Denn solche Sätze sind selten nur Sachbehauptungen. Sie sind kleine Bühnen. Sie legen fest, wer auftritt, wer schuld ist, was als Problem gilt und welche Lösung plötzlich naheliegt.
Sie verkürzen Ursache und Wirkung. Sie machen aus einer Systemfrage ein Bauchgefühl. Und sie schieben die Debatte in einen Rahmen, in dem die Verteidigung bereits wie ein Eingeständnis wirkt.
Dann passiert, was heute oft passiert: Wir reagieren mit Fakten auf Angst. Mit Studien auf Kränkung. Mit Zahlen auf Empörung. Mit Differenzierung auf eine Erzählung, die gar nicht differenzieren will. Fakten sind unverzichtbar. Aber sie kommen oft zu spät, wenn die Aufmerksamkeit schon gebunden ist und der Frame sitzt.
Das ist der Punkt, an dem klassische Faktenchecks an ihre Grenze kommen. Sie prüfen, ob etwas stimmt. Das ist wichtig. Aber viele öffentliche Narrative wirken nicht, weil sie vollständig richtig sind. Sie wirken, weil sie eine Deutung anbieten, bevor die Prüfung beginnt.
Deshalb braucht Transformation nicht nur bessere Daten, bessere Technologien und bessere Gesetze. Sie braucht einen öffentlichen Raum, der noch unterscheiden kann: Was ist wichtig? Was ist nur laut? Was ist berechtigte Sorge? Was ist manipulative Schlussfolgerung? Was ist Symptom? Was ist Ursache? Und was müssten wir eigentlich fragen, damit die Debatte wieder auf Wirkung zielt?
Der entscheidende Fehler ist nicht, dass wir auf falsche Aussagen antworten. Der Fehler ist, dass wir oft erst antworten, nachdem der fremde Rahmen schon die Debatte sortiert hat.
2. Das Stöckchen und der Wald
In vielen Debatten liegt ein Stöckchen auf dem Boden. Es sieht aus wie ein Argument. In Wahrheit ist es ein Resonanzangebot.
Ein Stöckchen soll nicht nur informieren. Es soll auslösen. Es soll Aufmerksamkeit binden, Zugehörigkeit markieren, Abwehr aktivieren, Empörung erzeugen oder Misstrauen verstärken. Der öffentliche Raum reagiert dann nicht mehr auf die wichtigste Wirkungsfrage, sondern auf den stärksten Reiz.
Das Bild vom Stöckchen ist deshalb so hilfreich, weil es den Mechanismus offenlegt: Jemand wirft etwas hin. Viele springen. Medien greifen es auf. Plattformen verstärken es. Gegner:innen widersprechen. Anhänger:innen fühlen sich bestätigt. Und am Ende reden alle über das Stöckchen - nicht über den Wald.
Der Wald sind die Ursachen: falsche Preise, fehlende Infrastruktur, schlechte Integrationsarchitektur, fossile Folgekosten, soziale Überforderung, algorithmische Erregung, Vertrauensverlust, bürokratische Reparatursysteme, demokratische Erschöpfung.
Die Frage ist also nicht: Dürfen solche Themen diskutiert werden? Natürlich dürfen sie das. Eine demokratische Öffentlichkeit braucht Streit. Aber sie braucht auch die Fähigkeit zu prüfen, ob ein Thema die Aufmerksamkeit bekommt, die seinem tatsächlichen Wirkungsgewicht entspricht.
Nicht jedes laute Thema ist wichtig. Und nicht jedes wichtige Thema ist laut.
3. Vom Debatten-Kompass zum Öffentlichen Wirkungsraum
Der Debatten-Kompass war der erste Schritt. Er hilft, wenn ein Narrativ bereits im Raum steht. Er fragt nicht nur: „Stimmt das?“ Sondern: „Worauf antworte ich eigentlich?“
Was wird behauptet? Welche implizite Botschaft steckt dahinter? Welche Schlussfolgerung soll ich übernehmen? Wo liegt ein wahrer Kern? Wo kippt die Aussage? Welche Folgen hätte es, wenn wir dieser Logik folgen? Und welche bessere Systemfrage müssten wir stellen?
Damit geht der Debatten-Kompass deutlich über einen Faktencheck hinaus. Er prüft nicht nur Fakten, sondern auch Frame, Wirkpfad, Folgen und Antwortqualität.
Aber der entscheidende Hinweis war: Das bleibt reaktiv. Es hilft, wenn das Stöckchen schon liegt. Die noch größere Frage lautet: Wie verhindern wir, dass Stöckchen überhaupt den öffentlichen Raum steuern?
Die Antwort ist nicht, Stöckchen zu verbieten. Das wäre falsch und demokratietheoretisch gefährlich. Die Antwort ist, ihre Funktion sichtbar zu machen. Genau dafür braucht es eine vorgelagerte Ebene: den Öffentlichen Wirkungsraum.
Die Dachlogik
Der Öffentliche Wirkungsraum ist die neue Dacharchitektur der Wirkungsökonomie für Debatten, Medien, Öffentlichkeit und demokratische Resilienz.
Seine Leitformel lautet:
Öffentlicher Wirkungsraum
Debatten verstehen. Aufmerksamkeit gewichten. Demokratische Resilienz stärken.
1. Debatten-Kompass: Richtig antworten, wenn ein Narrativ schon wirkt.
2. Resonanz-Kompass: Erkennen, wann Aufmerksamkeit selbst zum Problem wird.
3. Agenda-Radar: Sichtbar machen, welche wichtigen Wirkungsfragen zu wenig Raum bekommen.
4. Ursachen-Navigator: Vom Stöckchen zur Systemfrage: Welche Ursache liegt darunter?
5. Resilienz-Prinzipien: Wie Öffentlichkeit widerstandsfähiger gegen Empörung, Ablenkung und Manipulation wird.
4. Die fünf Bausteine
4.1 Debatten-Kompass: Antwortqualität
Der Debatten-Kompass ist das Werkzeug für die konkrete Aussage. Er kommt zum Einsatz, wenn ein Satz bereits im Raum steht und Menschen eine saubere, faire, aber nicht naive Antwort brauchen.
Er beginnt bewusst nicht mit der Antwort, sondern mit Orientierung: Was wird behauptet? Welche Botschaft steckt dahinter? Warum ist diese Debatte relevant? Erst danach folgen die 10-Sekunden-, 30-Sekunden- und 2-Minuten-Antworten. Diese Reihenfolge ist entscheidend. Wer sofort antwortet, ohne den Frame zu erkennen, antwortet oft im falschen Raum.
Die Stärke des Debatten-Kompasses liegt darin, den wahren Kern einer Aussage nicht zu leugnen, aber die verkürzte Schlussfolgerung sichtbar zu machen. Er moralisiert nicht. Er sortiert.
4.2 Resonanz-Kompass: Aufmerksamkeitsqualität
Der Resonanz-Kompass setzt eine Ebene früher an. Er fragt nicht: „Wie antworte ich auf diesen Satz?“ Er fragt: „Warum bekommt genau dieses Thema gerade so viel Aufmerksamkeit - und was wird dadurch verdrängt?“
Das ist der Schritt von der Symptombehandlung zur Ursachenprävention. Ein Thema kann real sein und trotzdem überhitzt. Eine Sorge kann berechtigt sein und trotzdem von falschen Schlussfolgerungen gekapert werden. Eine Debatte kann laut sein und trotzdem eine wichtigere Ursache verdecken.
Der Resonanz-Kompass prüft deshalb das Verhältnis von Aufmerksamkeitsgewicht und Wirkungsgewicht.
4.3 Agenda-Radar: Prioritätenqualität
Der Agenda-Radar zeigt, welche Wirkungsfragen zu wenig öffentlichen Raum bekommen. Er ist der Gegenpol zur Empörungslogik. Während Debatten oft durch Reiz, Konflikt und Sichtbarkeit sortiert werden, fragt der Agenda-Radar: Welche Themen haben hohes Wirkungsgewicht, bleiben aber leise?
Dazu können zum Beispiel Medienqualität, psychische Gesundheit, kommunale Überforderung, Pflegeinfrastruktur, Bodenzustand, Prävention, algorithmische Verstärkung oder demokratische Korrekturfähigkeit gehören. Der Punkt ist nicht, eine endgültige Rangliste zu behaupten. Der Punkt ist, die blinden Flecken der Aufmerksamkeit sichtbar zu machen.
4.4 Ursachen-Navigator: Ursachentiefe
Der Ursachen-Navigator führt vom Aufreger zur Systemfrage. Er fragt: Welches strukturelle Problem liegt unter der sichtbaren Debatte? Warum taucht dieses Thema immer wieder auf? Welche Hebel würden tatsächlich etwas verändern?
Aus „Die da oben wollen uns alles verbieten“ wird dann nicht sofort eine Debatte über einzelne Verbote. Es wird eine Frage nach Transformationsdesign: Warum erleben Menschen Veränderung als Zumutung? Welche Infrastruktur fehlt? Welche Kosten werden falsch verteilt? Welche Alternativen sind praktisch nicht verfügbar? Welche Vertrauensbrüche liegen darunter?
4.5 Resilienz-Prinzipien: Korrekturfähigkeit
Die Resilienz-Prinzipien beschreiben das gemeinsame Ziel: eine Öffentlichkeit, die unter Druck nicht zerfällt. Demokratische Resilienz bedeutet nicht, Konflikte zu vermeiden. Sie bedeutet, trotz Konflikten prüffähig, lernfähig und korrigierbar zu bleiben.
Eine resiliente Öffentlichkeit kann laut und leise unterscheiden. Sie erkennt Frames, ohne jede Emotion abzuwerten. Sie nimmt berechtigte Sorgen ernst, lässt sich aber nicht von manipulativen Schlussfolgerungen steuern. Sie springt nicht jedem Stöckchen hinterher. Sie fragt nach Ursache, Wirkung und Hebel.
Die einfache Merkhilfe
Baustein
Leitfrage
Qualität, die gestärkt wird
Debatten-Kompass
Worauf antworte ich eigentlich?
Antwortqualität
Resonanz-Kompass
Warum bekommt dieses Thema so viel Raum?
Aufmerksamkeitsqualität
Agenda-Radar
Was bleibt zu leise, obwohl es wichtig ist?
Prioritätenqualität
Ursachen-Navigator
Welche Ursache liegt unter dem Aufreger?
Ursachentiefe
Resilienz-Prinzipien
Wie bleibt Öffentlichkeit prüf- und lernfähig?
demokratische Korrekturfähigkeit
5. Die neue Kernprüfung: Aufmerksamkeit gegen Wirkung
Der Resonanz-Kompass arbeitet mit einer einfachen, aber weitreichenden Unterscheidung: Aufmerksamkeitsgewicht ist nicht dasselbe wie Wirkungsgewicht.


…


## Wirkungsoekonomie_Audio_Erklaerungen_Seitenliste_Sprechertexte.docx

Pfad: `Wirkungsoekonomie_Audio_Erklaerungen_Seitenliste_Sprechertexte.docx`  
Vorhanden: True  
Zeichen: 53587

Audio-Erklärungen für wirkungsoekonomie.de
Seitenliste, Priorisierung und 1:1 ablesbare Sprechertexte
Stand: 04.06.2026
1. Kurzbefund
Die Website ist inzwischen groß genug, dass Audio nicht mehr nur ein Zusatz ist, sondern Orientierung, Vertrauen und niedrigschwelligen Einstieg schafft.
Priorität haben Seiten, auf denen Nutzer:innen entweder ein komplexes Modell verstehen müssen, ein Missverständnis wahrscheinlich ist oder deine persönliche Einordnung besonders vertrauensbildend wirkt.
Nicht jede einzelne Detailseite braucht eine eigene Aufnahme. Für dynamische oder sehr viele Einzelseiten reichen zunächst Hub-Audios und ggf. spätere Vorlesefunktionen. Persönliche Audio-Erklärungen sollten gezielt dort stehen, wo sie Mehrwert schaffen.
2. Bereits vorhandene Audio-Abdeckung
Seite
URL
Einordnung
Startseite
https://wirkungsoekonomie.de/
Bereits Audio vorhanden: Grundidee und persönlicher Einstieg; kein neues Standardaudio nötig, nur bei späterem Relaunch prüfen.
Verstehen
https://wirkungsoekonomie.de/verstehen.html
Bereits Audio vorhanden: Wirkungsökonomie kurz erklärt.
Buch-Landingpage
https://wirkungsoekonomie.de/buch.html
Bereits Audio vorhanden: persönlicher Weg zur Wirkungsökonomie; zusätzlich kann später ein eigenes Audio zur freien Zugänglichkeit ergänzt werden.
3. Seiten, die eine neue Audio-Erklärung brauchen
Die folgende Liste ist nach Umsetzungspriorität sortiert. P0 sollte zuerst aufgenommen werden. P1 folgt nach den Kernseiten. P2 ist sinnvoll, aber nicht zwingend vor dem nächsten Website-Release.
Priorität
URL
Audio-Titel
Warum Audio?
P0
https://wirkungsoekonomie.de/so-wirkt-wirkungsoekonomie/
Anhören: Wie Wirkung wirklich entsteht
Zentrale Modellseite; erklärt Wirkung, Wirkungspotenzial, Wirkpfad und Rückkopplung. Braucht persönliche Orientierung, damit das Modell nicht technisch wirkt.
P0
https://wirkungsoekonomie.de/wirkungsfelder/
Anhören: Warum es Wirkungsfelder gibt
Hub mit vielen Bereichen; Audio erklärt, warum Bildung, Wohnen, Medien, Kapital usw. nicht getrennt gedacht werden.
P0
https://wirkungsoekonomie.de/fuer/
Anhören: Deine Perspektive auf Wirkung
Übersetzt das Modell für Zielgruppen; persönlicher Ton erhöht Orientierung und senkt Einstiegshürde.
P0
https://wirkungsoekonomie.de/werkzeuge/
Anhören: Werkzeuge sind keine Wirkungsfelder
Methoden-Hub ist fachlich dicht; Audio grenzt Werkzeuge, Wirkungsfelder und Demos sauber ab.
P0
https://wirkungsoekonomie.de/erleben/
Anhören: Was eine Demo zeigt - und was nicht
Schutzlinien sind kritisch: keine amtliche Bewertung, keine Beratung, keine Personenbewertung.
P0
https://wirkungsoekonomie.de/akademie.html
Anhören: Warum Wirkungskompetenz gelernt werden muss
Akademie braucht persönlichen Lernrahmen: nicht Zertifikatslogik, sondern Kompetenzaufbau.
P0
https://wirkungsoekonomie.de/downloads.html
Anhören: Wie du die Bibliothek nutzt
Viele Dokumenttypen, Reifegrade und Status; Audio verhindert Überforderung.
P0
https://wirkungsoekonomie.de/mitmachen.html
Anhören: Wie du sinnvoll mitmachen kannst
Persönliche Einladung; sollte aber Erwartungen klären und vor beliebiger Beteiligung schützen.
P0
https://wirkungsoekonomie.de/begriffe/
Anhören: Warum Begriffe hier so wichtig sind
Begriffspräzision ist Fundament der WÖk; Audio erklärt, warum Glossar nicht Beiwerk ist.
P0
https://wirkungsoekonomie.de/referenz/
Anhören: Wie du das Grundlagenwerk online liest
Online-Referenz ist groß und zitierfähig; Audio erklärt Navigation und Zweck.
P0
https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/
Anhören: Warum die WÖk SDG+ ergänzt
SDG+ kann missverstanden werden; braucht klare transparente Abgrenzung.
P0
https://wirkungsoekonomie.de/wirkungsradar/
Anhören: Warum wir nicht nur Fakten prüfen
Kritischer Bereich; Audio erklärt Unterschied Faktencheck/Folgencheck und vermeidet Zensur-Missverständnis.
P0
https://wirkungsoekonomie.de/wirkungsradar/antwort-playbooks/
Anhören: Wie du ruhig und wirksam antwortest
Nutzer:innen wollen konkrete Gesprächshilfe; Audio setzt Tonalität: nicht beschämen, nicht eskalieren.
P0
https://wirkungsoekonomie.de/werkzeuge/impact-controlling/t-sroi/


…


## Wirkungsoekonomie_Debattenkompass_Quellen_Link_Korrektur_Codex.docx

Pfad: `Wirkungsoekonomie_Debattenkompass_Quellen_Link_Korrektur_Codex.docx`  
Vorhanden: True  
Zeichen: 36093

Wirkungsökonomie.deDebatten-Kompass 2.0
Allumfassende Korrektur der Quellen-, Deeplink- und Verlinkungslogik für bestehende Debatten-Seiten
Verbindlicher Auftrag an CodeX
Alle bestehenden Debatten-Kompass-Seiten müssen quellenfähig, linkfähig und öffentlich professionell werden. Quellen dürfen nicht nur textuell genannt werden. Jede interne und externe Quelle braucht einen klickbaren, passenden, aktuellen Deeplink. .md-Dateien dürfen grundsätzlich nicht öffentlich verlinkt werden. Interne Quellen werden als Online-Kapitel oder als PDF verlinkt. Platzhalter, interne Arbeitslabels und unprofessionelle Build-Reste dürfen nicht live sichtbar bleiben.
Version: CodeX-Umsetzungsbriefing | Status: verbindlich für Debatten-Kompass und Wirkungsradar
Inhaltsübersicht
1. Zielbild und Definition of Done
2. Befund auf der bestehenden Website
3. Verbindliche Link-Regeln
4. Quellenkomponente und Datenmodell
5. Interne Quellen: Online-Kapitel und PDF-Routing
6. Externe Quellen: Master-Registry und Deeplink-Regeln
7. Kartenmatrix für alle 89 Debattenkarten
8. Glossar- und Hover-Linking
9. QA, Tests und Deployment
10. CodeX-Ausführungsanweisung
1. Zielbild und Definition of Done
Kurzformel
Der Debatten-Kompass darf nicht wie eine Textsammlung mit Quellenliste wirken. Er muss wie ein sauber redaktionell gepflegtes, quellengebundenes Analysewerkzeug wirken: jede Aussage nachvollziehbar, jede Quelle klickbar, jede Grenze der Quelle sichtbar, jede interne WÖk-Begrifflichkeit als Online-Kapitel oder PDF erreichbar.
1.1 Ziel
Alle 89 bestehenden Debattenkarten werden auf Quellen- und Linkqualität geprüft und korrigiert.
Jede Quelle im Abschnitt „Quellen“ wird klickbar. Textuelle Nennung ohne Link ist nicht zulässig.
Interne Quellen verweisen auf Online-Kapitel der Website oder auf PDF-Downloads. .md-Dateien werden nie öffentlich verlinkt.
Externe Quellen verweisen auf exakt relevante Primär-, Behörden-, Forschungs- oder Fachseiten. Homepage-Links sind nur erlaubt, wenn die Quelle selbst eine Index-/Datendrehscheibe ist und der konkrete Datenstand zusätzlich angegeben wird.
Jede Quelle erhält eine knappe Aussage: Was belegt diese Quelle? Was belegt sie nicht?
Alle alten internen Arbeitsreste wie „Masterquelle“, „P0 gerettet“, „aus Masterquelle integriert“ oder „### keine“ werden entfernt.
1.2 Definition of Done
0 öffentliche Links mit Endung .md, .docx oder .xlsx.
0 Quellenkarten ohne href, außer bewusst gekennzeichnete interne Hinweise ohne Quellenfunktion; diese dürfen aber nicht im Quellenblock als Quelle erscheinen.
0 sichtbare Platzhalter wie „keine“, „noch prüfen“, „Masterquelle“, „P0 gerettet“, „ausstehend“ auf öffentlichen Live-Karten.
100 % der Debattenkarten haben einen Quellenblock mit verlinkten internen und externen Quellen, sofern externe Faktenquellen verwendet werden.
Jede externe Zahl oder Tatsachenbehauptung hat mindestens einen externen Deeplink auf die konkrete Quelle.
Jede WÖk-interne Methodikbehauptung hat einen internen Link auf Online-Kapitel oder PDF.
Alle Links werden im Staging und nach Deployment automatisch geprüft: 200/3xx erlaubt; 404/500/Timeout sind Release-Blocker.
Die Quellenlogik unterstützt Datenstand und letzte Prüfung je Quelle.
2. Befund auf der bestehenden Website
Audit-Ergebnis
Die Debatten-Seiten sind inhaltlich weitgehend angelegt, aber die Quellenlogik ist nicht live-reif. Es gibt textuelle Quellenlisten ohne klickbare Links, .md-Dateinamen als öffentliche Quellenlabels, teils funktionierende P0-Quellen neben unverbundenen Standardquellen und einzelne Platzhalter wie „keine“. Zusätzlich sind in Listenansichten noch interne Arbeitsmarker sichtbar.
Befund
Korrekturauftrag
Debattenkarten-Bestand
/wirkungsradar/live/ zeigt 89 Debattenkarten aus der redaktionellen Masterquelle. Dieser Bestand ist der Migrationsumfang.
Übersichtsstatus
Die Übersicht spricht von geprüften Debattenkarten, während Kartenlabels teilweise „redaktionell geprüft: ausstehend“ zeigen. Statuslogik und Quellenstatus müssen zusammengeführt werden.
Interne Arbeitsreste
In der Kartenliste erscheinen Formulierungen wie „Migration aus Masterquelle integriert · P0 gerettet“. Solche Marker gehören nicht in die öffentliche Website.
Unverlinkte Quellen
Auf Detailseiten wie „Deutschland nur 2 Prozent?“ werden interne Dateien und externe Quellen textuell aufgelistet, aber nicht als Links geführt.
Gemischter Zustand
Auf „Migration kostet nur?“ existieren P0-Quellen mit „Quelle öffnen“, aber die allgemeinen internen und externen Quellen davor sind weiterhin nicht verlinkt.
Ungültige Platzhalter
Auf WÖk-Erklärkarten erscheinen externe Quellen wie „keine“ oder „### keine“. Das ist kein professioneller Quellenblock.
Methodenanspruch
Die Methodenseite verlangt Quellen, Unsicherheiten und Grenzen der Aussagen. Die technische Umsetzung muss diesen Anspruch auf jeder Karte erfüllen.
3. Verbindliche Link-Regeln
3.1 Harte Verbote
Keine öffentlichen hrefs auf Dateien mit Endung .md, .docx, .xlsx, .csv oder lokale Build-Pfade.
Keine sichtbaren Dateinamen als Quellenlabel, wenn sie wie interne Arbeitsdateien wirken. Beispiel: „WOeK_Begriffsleitfaden_fuehrend_v1.0.md“ wird öffentlich zu „Führender Begriffsleitfaden der Wirkungsökonomie“.
Keine Quellenkarte mit „keine“, „### keine“, „noch prüfen“, „redaktionell zu prüfen“, „Masterquelle“ oder ähnlichen Platzhaltern.
Keine Links auf allgemeine Homepages, wenn es eine konkrete Studie, Datenseite oder Presseinformation gibt.
Keine juristische, medizinische, statistische oder tagesaktuelle Aussage ohne externe Quelle, sofern sie nicht ausschließlich eine WÖk-Modellabgrenzung ist.
3.2 Zulässige interne Linkziele
Online-Kapitel: /referenz/... oder /verstehen/... mit stabilen Ankern wie #wirkungspotenzial, #wirkpfad, #sdg-plus.
Glossar-/Hover-Ziele: /verstehen/glossar/<begriff>/ oder ein zentrales Glossar mit Anchors.
PDF-Downloads: ausschließlich stabil veröffentlichte PDF-Dateien unter /downloads/ oder /bibliothek/ mit sauberem Titel und Metadaten.
Bibliothekseinträge: Eine Publikationsseite mit Abstract, Status, Stand, Download-PDF und Zitierhinweis ist besser als ein direkter PDF-Link.
3.3 Zulässige externe Linkziele
Offizielle Institutionen: UN, IPCC, EU, UBA, Destatis, BA, IAB, OECD, IEA, WHO, FAO, Bundesverfassungsgericht, Bundesbank, BMZ, BFV.
Forschungseinrichtungen und Fachquellen: Fraunhofer, ICCT, Global Carbon Project, JRC/EDGAR.
Direkte Studie, Bericht, Datensatz, Presseinformation oder offizielles Thema. Externe Links müssen die relevante Aussage tatsächlich tragen.
Bei Datendrehscheiben wie Global Carbon Budget oder EDGAR: aktueller Bericht, Datenstand und Versionshinweis sichtbar machen.
4. Quellenkomponente und Datenmodell
Komponenten-Contract
CodeX soll eine einheitliche DebattenSourceCard-Komponente bauen und alle bisherigen Quellenlisten ersetzen. Die Komponente muss maschinenprüfbar sein und darf keine freien Text-Platzhalter akzeptieren.
4.1 Public UI der Quellenkarte
Titel der Quelle als klickbarer Link.
Badge: Interne WÖk-Quelle, Online-Kapitel, PDF, externe Primärquelle, externe Fachquelle, Datensatz.
Kurzsatz „Belegt hier:“ - was diese Quelle für diese Karte konkret trägt.
Kurzsatz „Grenze:“ - was aus dieser Quelle nicht folgt.
Datenstand / Veröffentlichungsstand / letzte Prüfung.


…


## Wirkungsoekonomie_Debattenkompass_Textmaster_Codex_v2.docx

Pfad: `Wirkungsoekonomie_Debattenkompass_Textmaster_Codex_v2.docx`  
Vorhanden: True  
Zeichen: 561874

WirkungsökonomieDebatten-Kompass 2.0
Finaler Textmaster, Quellen- und Codex-Briefingfür die Professionalisierung aller Debatten-Seiten
Stand: 05.06.2026 · Umfang: 89 Debattenkarten · Zielversion Website 2.0
Nicht verhandelbarer Seiten-Contract für jede Debattenkarte:Hero → Was wird behauptet? → Sofortantwort → Folgencheck → Wirkpfad → Kritische Fragen → Faktenlage → Quellen → Warum zieht das Narrativ? → Methodik → Verwandte Inhalte → Narrativ einreichen.Der Block „Was wird behauptet?“ steht immer vor der Sofortantwort.
1. Auftrag an Codex
Ziel: Alle bestehenden Debattenseiten werden inhaltlich professionalisiert, nicht reduziert. Bestehende Inhalte, Quellen, URLs, Glossarbegriffe und Verlinkungen bleiben erhalten, sofern sie nicht nachweislich falsch oder doppelt sind.
Ersetzungslogik: Die generischen Standardphrasen der bisherigen Karten werden durch die folgenden finalen Textbausteine ersetzt oder ergänzt. Vorhandene Detailinformationen bleiben erhalten und werden in die neue Reihenfolge migriert.
Prüfpflicht: Alle tagesaktuellen Zahlen werden vor Live-Deployment gegen die Quellenbibliothek revalidiert. Politische und juristische Bewertungen dürfen nur mit Primärquelle erscheinen.
Stilziel: Professionell, informell verständlich, systemisch, wirkungsökonomisch. Nicht belehrend, nicht moralisch, nicht weichgespült, nicht künstlich ausgewogen, wenn die Faktenlage klar ist.
2. Verbotene alte Muster
Nicht mehr verwenden: „Der Satz ist als Debatteneinstieg stark, aber als Diagnose zu grob.“
Nicht mehr verwenden: „Entscheidend ist nicht die Empörung über den Einzelframe …“
Nicht jede Karte mit „Ja, der Punkt hat einen wahren Kern …“ beginnen. Der wahre Kern wird anerkannt, aber sprachlich variiert und konkretisiert.
Keine Wirkung behaupten, wenn nur Wirkungspotenzial, Wirkpfad oder Wirkungsrisiko gemeint ist.
Keine juristischen oder parteipolitischen Etiketten ohne direkte Quelle.
Keine Quellenblöcke mit „noch prüfen“ live zeigen. Wenn Quellen fehlen, ist der Status der Karte Entwurf, nicht geprüft.
3. Globale Begriffs- und Hoverlink-Map
Hover-Begriff
Kurztext für Tooltip/Glossar
Wirkung
Tatsächliche Veränderung von Zuständen; neutral, relational, nicht automatisch positiv.
Wirkungspotenzial
Möglichkeit, dass Wirkung eintreten kann; besonders wichtig bei Sprache, Bildern, Frames und politischen Narrativen.
Wirkungsrisiko
Möglichkeit negativer oder systemisch destabilisierender Wirkung; noch kein eingetretener Schaden.
Wirkpfad
Plausibler Weg, wie aus Aussage, Handlung, Produkt, Regel oder Kapitalfluss Wirkung entstehen kann.
Folgencheck
Prüft, welche direkten, indirekten und systemischen Folgen ein Narrativ oder eine Maßnahme auslösen kann.
Positive Netto-Wirkung
Zielgröße der WÖk: positive Wirkung unter Berücksichtigung negativer, indirekter und nicht-kompensierbarer Wirkungen für Mensch, Planet und Demokratie.
Reverse Merit Order
Nicht der freundliche Durchschnitt zählt; das schwächste kritische Wirkungsfeld begrenzt die Gesamtbewertung.
SDG+
Transparente WÖk-Erweiterung um Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen und digitale Selbstbestimmung.
Wirkungsrückkopplung
Daten bleiben nicht im Bericht, sondern verändern Preise, Steuern, Kapitalzugang, Förderung, Beschaffung oder Entscheidungen.
4. Quellenbibliothek
Verwendung: Die Karten nennen Quellen-IDs. Codex soll diese IDs in echte Quellenmodule, Fußnoten, Hover-Quellen oder Quellenkarten übersetzen. Externe Quellen sind vor Deployment auf Aktualität zu prüfen.
I-BEG - WOeK_Begriffsleitfaden_fuehrend_v1.0.md: Führender Begriffsrahmen: Wirkung, Wirkungspotenzial, Wirkungsrisiko, Wirkpfad, positive Netto-Wirkung, politische Sprache/Medien.
I-WOHL - Natalie-Weber_Die neue Ordnung des Wohlstands_2026.pdf: Grundmodell der Wirkungsökonomie, Mensch-Planet-Demokratie, Wirkungsrad, Rückkopplung, Medien- und Demokratiekapitel.
I-SYS - Systemmodell-der-Wirkungsoekonomie.pdf: Systemische Ordnungskarte Mensch-Planet-Demokratie; Staat, Wirtschaft, Medien, Gesundheit, Kultur, Wissen als gekoppelte Wirkungsräume.
I-NACH - Nachhaltigkeit-Systemarchitektur.pdf: Nachhaltigkeit als interdependente Systemarchitektur statt additiver Strategie; Nichtlinearität, Rückkopplung, Systemhebel.
I-WSTG - WStG_Oktober2025.pdf: Wirkungssteuergesetz als Rahmenlogik für steuerliche Rückkopplung nach Wirkung auf Mensch, Planet und Demokratie.
I-WUSTG - Technische_Leitlinien_WUStG_Vollversion_Extended_v2.pdf: Technische Logik: WÖk-IDs, Archetypen, Benchmarks, Scorecards, Assurance, Reverse Merit Order.
I-PROD - WP_Produkte.pdf: Produktwirkung, Preiswahrheit, digitale Produktpässe, Produktbesteuerung durch Wirkung.
I-LIEFER - Wirkungsoekonomie in der Lieferkette.pdf: Lieferkettenwirkung, Vorsteuerlogik, T-Shirt-Beispiel, Scorecards, Nichtkompensation.
I-RAT - Wirkungsrat_Konzept.pdf: Wirkungsrat, unabhängige Prüfung, Evaluation, Missbrauchsschutz, Transparenz.
I-TSROI - Whitepaper-T-SROI.pdf: Transformational Social Return on Investment; Netto-Wirkung und Transformationswirkung.
I-WOHN - WP_Wohnungsmarkt_.pdf: Wohnen als Wirkungsfeld, soziale/ökologische/demokratische Wohnwirkung, Verdrängung als nicht kompensierbares Feld.
I-RENTE - WP_Rente.pdf: Wirkungsrente, demografische Schieflage, Lebensleistung statt bloßer Erwerbsbiografie.
I-WESTG - WP_Einkommen.pdf: Wirkungseinkommensteuer, Einkommen als Wirkungskette, Tätigkeitswirkung.
E-SDG - UN Sustainable Development Goals / Agenda 2030: Globaler Referenzrahmen der SDGs und Agenda 2030.
E-IPCC - IPCC AR6 Synthesis Report: Klimawissenschaftlicher Referenzrahmen: Erwärmung, Ursachen, Emissionspfade, Risiken.
E-GCP - Global Carbon Budget / Global Carbon Project: Aktuelle globale CO₂-Emissionsdaten.
E-EDGAR - JRC EDGAR GHG Emissions Reports: Emissionsdaten und Länder-/EU-Vergleiche.
E-UBA - Umweltbundesamt: Deutschlanddaten zu Treibhausgasen, Verkehr, Gebäuden, Energie, Landwirtschaft, Tempolimit, Ökobilanzen.
E-IEA - International Energy Agency: Energiepfade, Erneuerbare, Wasserstoff, Stromsysteme, Elektromobilität.
E-FRAUNHOFER - Fraunhofer ISE Energy Charts / Jahresberichte: Stromerzeugung Deutschland, Anteil erneuerbarer Energien, Kohlestromentwicklung.
E-ICCT - International Council on Clean Transportation: Lebenszyklusanalysen E-Auto/Verbrenner.
E-IAB - Institut für Arbeitsmarkt- und Berufsforschung: Beschäftigung, Migration, Geflüchtete, Fachkräftemangel, Bürgergeld-/Arbeitsmarktforschung.
E-DEST - Statistisches Bundesamt: Demografie, Wohnen, Einkommen, Sozialdaten, Bevölkerung.
E-BA - Bundesagentur für Arbeit: Arbeitsmarkt, Migration und Beschäftigungsstatistik.
E-BUNDESBANK - Deutsche Bundesbank / EU-Haushaltsanalysen: EU-Nettozahlungen und ökonomischer Kontext des Binnenmarkts.
E-BMZ - Bundesministerium für wirtschaftliche Zusammenarbeit und Entwicklung: Entwicklungszusammenarbeit, Faktenchecks, Projektlogiken, ODA.
E-OECD - OECD: Gesundheit, Bildung, Entwicklung, Sozialstaat, Governance, internationale Vergleiche.
E-WHO - World Health Organization: Prävention, Gesundheitsförderung, One Health.
E-FAO - Food and Agriculture Organization: Ernährungssysteme, versteckte Kosten, Landwirtschaft, Food Waste.
E-EMFA - European Media Freedom Act: Medienfreiheit, Pluralismus und Schutz öffentlicher Information in der EU.
E-DSA - EU Digital Services Act: Plattformverantwortung, Risikominimierung, Grundrechtsschutz im digitalen Raum.
E-UNESCO - UNESCO Journalism, Disinformation, AI & Education resources: Medienkompetenz, Desinformation, KI in Bildung, Pressefreiheit.
E-IMF - IMF AI and Future of Work: Auswirkungen von KI auf Beschäftigung und Einkommensverteilung.
E-ILO - ILO Generative AI and Jobs: Arbeitsmarktwirkungen von generativer KI, Augmentation statt reine Verdrängung.
E-BVERFG - Bundesverfassungsgericht: Demokratische Grundordnung, Parteiverbotsmaßstäbe, Grundrechtslogik.
E-BFV - Bundesamt für Verfassungsschutz: freiheitliche demokratische Grundordnung und Beobachtung extremistischer Bestrebungen.
E-UN-CHARTER - UN Charter Art. 2(4) / UN General Assembly resolutions on Ukraine: Souveränität, Gewaltverbot, Aggression und internationale Ordnung.
5. Kartenindex
01. Migration kostet nur? - Migration
02. Deutschland nur 2 Prozent? - Klima & Energie
03. Windräder zerstören Natur? - Klima & Energie


…


## Wirkungsoekonomie_Oeffentlicher_Wirkungsraum_Final_Codex_Briefing.docx

Pfad: `Wirkungsoekonomie_Oeffentlicher_Wirkungsraum_Final_Codex_Briefing.docx`  
Vorhanden: True  
Zeichen: 84368

Öffentlicher Wirkungsraum
Finales Codex-Briefing für Agenda-Radar, Ursachen-Navigator, Resilienz-Prinzipien und Gesamtintegration
Debatten verstehen. Aufmerksamkeit gewichten. Demokratische Resilienz stärken.
Version: 1.0 - Arbeitsbriefing für finale Umsetzung der Website 2.0
Ziel: Alles, was nach Debatten-Kompass und Resonanz-Kompass noch fehlt, so bündeln, dass Codex die finale öffentliche Architektur umsetzen kann.
Wichtig: Dieses Dokument baut auf den bereits erstellten Briefings zu Debatten-Kompass, Resonanz-Kompass, Quellen-/Linkkorrektur, Website-Härtung und Glossar-Korrektur auf. Es ersetzt sie nicht, sondern schließt die Lücken für Agenda-Radar, Ursachen-Navigator, Resilienz-Prinzipien und die Endintegration.
Inhaltsverzeichnis
1. Wo stehen wir jetzt?
2. Zielbild: Öffentlicher Wirkungsraum
3. Verbindliche Codex-Leitentscheidung
4. Informationsarchitektur, Routen und Navigation
5. Dachseite: finale öffentliche Texte
6. Agenda-Radar: vollständiges Konzept und Inhalte
7. Ursachen-Navigator: vollständiges Konzept und Inhalte
8. Resilienz-Prinzipien: vollständige Seite und Inhalte
9. Gesamtverknüpfung mit Debatten- und Resonanz-Kompass
10. Datenmodell, Filterlogik und Komponenten
11. Quellen-, Glossar- und Linklogik
12. Redaktioneller Standard: Armin-Maiwald-Prinzip ohne KI-Anstrich
13. QA, Tests, Deployment und Abschlussbericht
14. Direkt kopierbare Codex-Anweisung
Anhang A: Startbestand Agenda-Radar
Anhang B: Startbestand Ursachen-Navigator
Anhang C: Resilienz-Prinzipien im Detail
1. Wo stehen wir jetzt?
Kurzurteil
Debatten-Kompass und Resonanz-Kompass sind konzipiert. Für die finale Umsetzung des Öffentlichen Wirkungsraums fehlen jetzt vor allem drei Dinge: der Agenda-Radar als Gewichtungs- und Überblicksebene, der Ursachen-Navigator als Systemebene unter den Stöckchen und die Resilienz-Prinzipien als normativer und praktischer Schutzrahmen. Zusätzlich fehlt die saubere Gesamtintegration: Routen, Crosslinks, Filter, Quellenlogik, Glossar-Hover, QA und eine klare öffentliche Dachseite.
Baustein
Status
Was existiert / was fehlt
Codex-Aufgabe
Debatten-Kompass
Vorhanden
Textmaster für konkrete Narrative ist erstellt. Reihenfolge bleibt verbindlich: Hero, Was wird behauptet?, Sofortantwort, Folgencheck, Wirkpfad, Kritische Fragen, Faktenlage, Quellen, Warum zieht das Narrativ?, Methodik, Verwandte Inhalte, Narrativ einreichen.
Nicht neu ordnen. Nur verlinken, Quellen korrigieren und in die Dacharchitektur einhängen.
Resonanz-Kompass
Vorhanden / zu implementieren
Meta-Prüfung von Aufmerksamkeit, Überhitzung, Verdrängung, Ursache und besserer Systemfrage ist konzipiert. Initiale Resonanzkarten liegen als Konzept vor.
Implementieren, mit Agenda-Radar und Ursachen-Navigator vernetzen. Keine neue visuelle Welt bauen.
Agenda-Radar
Fehlt als finaler Baustein
Der Radar macht sichtbar, welche Wirkungsfragen zu viel, zu wenig oder verzerrte Aufmerksamkeit bekommen.
Dieses Dokument liefert finale Struktur, Texte, Datenfelder, Startbestand und QA.
Ursachen-Navigator
Fehlt als finaler Baustein
Der Navigator führt von Aufregern, Symptomen und Stöckchen zu Systemursachen, Wirkpfaden und besseren Hebeln.
Dieses Dokument liefert finale Struktur, Texte, Startbestand und Crosslinks.
Resilienz-Prinzipien
Fehlt als finaler Baustein
Diese Seite erklärt, wie Öffentlichkeit widerstandsfähiger gegen Empörung, Ablenkung, Manipulation und falsche Frames wird.
Dieses Dokument liefert die vollständigen Prinzipien, Beispiele und Umsetzungstexte.
Dachseite Öffentlicher Wirkungsraum
Muss final zusammenführen
Die Nutzer:innen brauchen einen sofort verständlichen Einstieg: konkrete Aussage, überhitztes Thema, blinder Fleck, Ursache, Resilienz.
Dieses Dokument liefert finale Copy und Navigationslogik.
2. Zielbild: Öffentlicher Wirkungsraum
Der Öffentliche Wirkungsraum ist die Dacharchitektur für alles, was öffentliche Debatten, Narrative, Aufmerksamkeit, Ursachen und demokratische Resilienz betrifft. Er ist keine zusätzliche Kampagnenseite, sondern eine neue Ordnungsebene innerhalb der bestehenden Website.
Leitsatz
Der Debatten-Kompass hilft, wenn ein Narrativ schon im Raum steht. Der Resonanz-Kompass hilft, bevor ein Narrativ den Raum übernimmt. Der Agenda-Radar zeigt, welche wichtigen Wirkungsfragen zu wenig Raum bekommen. Der Ursachen-Navigator führt vom Stöckchen zur Systemfrage. Die Resilienz-Prinzipien erklären, wie Öffentlichkeit prüffähig, lernfähig und handlungsfähig bleibt.
Baustein
Funktion
Öffentlicher Kurztext
Konkreter Nutzen
Öffentlicher Wirkungsraum
Dach / Meta-Ebene
Debatten verstehen. Aufmerksamkeit gewichten. Demokratische Resilienz stärken.
Alle fünf Module sichtbar machen und sofort nutzbar erklären.
Debatten-Kompass
Antwortqualität
Richtig antworten, wenn ein Narrativ schon wirkt.
Konkrete Aussagen, Frames, Fakten, Folgencheck, Antwortbausteine.
Resonanz-Kompass
Aufmerksamkeitsqualität
Erkennen, wann Aufmerksamkeit selbst zum Problem wird.
Überhitzung, Verdrängung, Resonanzrisiko, bessere Systemfrage.
Agenda-Radar
Prioritätsqualität
Sichtbar machen, welche wichtigen Wirkungsfragen zu wenig Raum bekommen.
Überhitzte Debatten, blinde Flecken, Systemhebel, Warnsignale.
Ursachen-Navigator


…


## Wirkungsoekonomie_Resonanzkompass_Debattenkompass_Codex_Briefing.docx

Pfad: `Wirkungsoekonomie_Resonanzkompass_Debattenkompass_Codex_Briefing.docx`  
Vorhanden: True  
Zeichen: 91894

CODEX-BRIEFING · WIRKUNGSÖKONOMIE · ÖFFENTLICHER WIRKUNGSRAUM
Resonanz-Kompass und Debatten-Kompass 2.0
Vollständige Architektur, Inhalte, UX-Reihenfolge, Denkfehlerbibliothek, Quellenlogik und CodeX-Anweisung
Kernentscheidung
Die Meta-Ebene heißt öffentlich: „Öffentlicher Wirkungsraum“. Das neue Key-Feature heißt: „Resonanz-Kompass“. Der Debatten-Kompass bleibt das Antwortwerkzeug für konkrete Aussagen. Der Resonanz-Kompass wird das vorgelagerte Orientierungswerkzeug für Aufmerksamkeit, Gewichtung, verdrängte Ursachen und bessere Systemfragen.
Nicht verhandelbar für CodeX
Kein neues Layout bauen. Der bestehende Online-Styleguide und die vorhandenen Komponenten der Website werden weiterverwendet. Es geht um inhaltliche, funktionale und redaktionelle Erweiterung, nicht um ein neues Designsystem. Alle Texte müssen redaktionell wie professionelle Autorenarbeit wirken: konkret, logisch, wirkungsorientiert, ohne KI-Floskeln.
Stand: 05. Juni 2026 · Erstellt als umsetzbares Word-Briefing für CodeX
Inhaltsverzeichnis
1. CodeX-Auftrag in Kurzform
2. Name, Rolle und Gesamtlogik
3. Warum der Resonanz-Kompass nötig ist
4. Gesamtarchitektur mit Debatten-Kompass
5. Routen, Navigation und Einbindung
6. UX-Reihenfolgen aus Nutzerperspektive
7. Redaktionsstandard und Armin-Maiwald-Prinzip
8. Vollständige Seiten- und Copy-Vorlagen
9. Datenmodell und technische Umsetzung
10. Bewertungslogik: Aufmerksamkeit, Wirkungsgewicht, Verhältnis
11. Denkfehlerbibliothek
12. Themencluster und Resonanzkarten
13. Quellen-, Link- und Glossarlogik
14. QA, Tests, Deployment und Abnahme
1. CodeX-Auftrag in Kurzform
Bitte den bestehenden Debatten-Kompass nicht ersetzen, sondern um eine vorgelagerte Meta-Ebene erweitern. Diese Meta-Ebene macht sichtbar, welche Themen den öffentlichen Raum besetzen, welche wichtigen Wirkungsfragen verdrängt werden und welche Ursachen hinter wiederkehrenden Aufregerthemen liegen.
Umsetzungsziel
Aus dem bisherigen reaktiven Antwortsystem entsteht eine vollständige Architektur für öffentliche Orientierung: Debatten-Kompass = konkrete Aussage beantworten. Resonanz-Kompass = Aufmerksamkeit und Gewichtung prüfen. Agenda-Radar = überhitzte und unterbelichtete Themen sichtbar machen. Ursachen-Navigator = vom Aufreger zur Systemursache führen.
Kein Inhalt darf verloren gehen: bestehende Debattenkarten, Narrative, Playbooks, Quellen, Glossar-Hover und internen Verlinkungen bleiben erhalten und werden nur erweitert.
Keine neue Layoutwelt: bestehende Hero-, Karten-, Pill-, Quellen-, Status- und Detailseiten-Komponenten nutzen.
Praktischer Nutzen zuerst: Nutzer:innen müssen sofort verstehen, ob sie auf eine Debatte reagieren, sie umlenken oder vertiefen sollten.
Theorie nachgeordnet: Methodik, Herleitung und WÖk-Begründung kommen nach der praktischen Orientierung, nicht davor.
Quellenpflicht: Jede Karte bekommt deeplinkfähige interne Online-Kapitel oder PDFs und externe Primär-/Fachquellen. Keine .md- oder Word-Links öffentlich.
Anti-KI-Pflicht: keine Standardformulierungen, keine generischen Absätze, keine falsche Ausgewogenheit, keine mechanisch wiederholten Textmuster.
2. Name, Rolle und Gesamtlogik
2.1 Wie heißt die Meta-Ebene?
Die Meta-Ebene soll öffentlich „Öffentlicher Wirkungsraum“ heißen. Das ist nicht nur ein Name, sondern die richtige systemische Einordnung: Öffentlichkeit ist in der Wirkungsökonomie kein neutraler Marktplatz der Aufmerksamkeit, sondern ein Raum, in dem Sprache, Medien, Plattformen, Bilder, Vertrauen, Angst, Fakten und Institutionen Wirkungspotenzial erzeugen.
Begriff
Rolle
Öffentliche Erklärung
Öffentlicher Wirkungsraum
Dach / Meta-Ebene
Hier werden Debatten nicht nur beantwortet, sondern als Wirkungsraum gelesen.
Debatten-Kompass
Reaktives Antwortwerkzeug
Was antworte ich auf eine konkrete Aussage, ohne in den falschen Frame zu fallen?
Resonanz-Kompass
Proaktives Meta-Werkzeug
Warum bekommt dieses Thema Aufmerksamkeit, was verdrängt es, und passt die Aufmerksamkeit zum Wirkungsgewicht?
Agenda-Radar
Übersichtsmodul
Welche Themen sind überhitzt, unterbelichtet, passend gewichtet oder verzerrt?
Ursachen-Navigator
Tiefenmodul
Welche Systemursache liegt hinter wiederkehrenden Aufregerthemen?
Aufmerksamkeitsfallen
Musterbibliothek
Welche Denkfehler und Stöckchen-Mechaniken ziehen öffentliche Debatten aus der Wirkungsebene?
2.2 Warum nicht nur „Agenda-Kompass“?
„Agenda-Kompass“ beschreibt zwar die Frage nach öffentlicher Gewichtung, klingt aber schnell nach politischer Agenda-Setzung. „Resonanz-Kompass“ ist präziser, weil es nicht nur um Themenliste, sondern um Wirkung im öffentlichen Raum geht: Welche Aussage findet Anschluss? Welche Emotion wird aktiviert? Welche Debatte wird größer, als ihr Wirkungsgewicht nahelegt? Welche Ursache wird kleiner gemacht, obwohl sie das System prägt?
Die öffentliche Dachlogik lautet deshalb: Öffentlicher Wirkungsraum. Das Tool heißt: Resonanz-Kompass. Das Dashboard heißt: Agenda-Radar.
2.3 Öffentliche Kurzdefinitionen
Begriff
Definition
Öffentlicher Wirkungsraum
Der Raum, in dem Gesellschaft klärt, was wahr, wichtig, dringlich und lösbar erscheint.
Debatten-Kompass
Hilft, konkrete Aussagen zu verstehen, ihren Frame offenzulegen und besser zu antworten.
Resonanz-Kompass
Prüft, ob die Aufmerksamkeit einer Debatte zu ihrer tatsächlichen Wirkung passt.
Agenda-Radar
Zeigt, welche Debatten überhitzt sind, welche wichtigen Themen unterbelichtet bleiben und welche Systemfragen fehlen.
Ursachen-Navigator
Führt von wiederkehrenden Aufregerthemen zu den tieferen Wirkungsursachen.
3. Warum der Resonanz-Kompass nötig ist
Der Debatten-Kompass ist stark, sobald eine Aussage im Raum steht. Er zeigt: Was wird behauptet? Welche Botschaft steckt dahinter? Welche Antwort hilft? Aber die entscheidende Frage liegt oft davor: Warum sprechen gerade alle über dieses Thema? Wer oder was hat es groß gemacht? Was wird dadurch aus dem Raum gedrängt?
Viele öffentliche Debatten sind nicht deshalb problematisch, weil das Thema völlig unwichtig wäre. Sie sind problematisch, weil Aufmerksamkeit und Wirkungsgewicht auseinanderfallen. Dann entsteht eine Verzerrung: Ein Symbolthema blockiert eine Systemfrage. Ein Einzelfall verdeckt eine Ursache. Eine Empörung verdrängt einen Hebel. Eine richtige Teilbeobachtung wird zum falschen Gesamtbild.
Leitsatz für die neue Ebene
Der Debatten-Kompass zeigt, was ein Satz macht. Der Resonanz-Kompass zeigt, was seine Aufmerksamkeit verdrängt.
3.1 Wirkungsökonomische Herleitung
In der Wirkungsökonomie ist Wirkung nicht Absicht, Image oder Lautstärke. Wirkung ist die tatsächliche Veränderung von Zuständen. Bei öffentlicher Kommunikation muss zunächst häufig von Wirkungspotenzial gesprochen werden: Sprache, Bilder, Frames und Wiederholung verändern Resonanzräume, Erwartungen und Handlungsschwellen, bevor tatsächliche Zustandsveränderungen messbar werden.


…


## Wirkungsoekonomie_Tool_Landschaft_2_0_Codex_Briefing.docx

Pfad: `Wirkungsoekonomie_Tool_Landschaft_2_0_Codex_Briefing.docx`  
Vorhanden: True  
Zeichen: 42643

Wirkungsökonomie Website 2.0
Überarbeitungs- und Perfektionierungsanweisung für die Tool-Landschaft
Optik · Funktion · Inhalt · Verständlichkeit · Qualitätssicherung
CodeX-Briefing / Version 2.0
KernauftragDie bestehende Tool-Landschaft der Website wird nicht reduziert, sondern verständlicher, schöner, eindeutiger, nutzbarer und vertrauenswürdiger gemacht. Inhalte bleiben erhalten. Was unklar, doppelt oder zu abstrakt ist, wird besser einsortiert, erklärt, markiert oder zusammengeführt - nicht gelöscht.
Leitgedanke: Erst Alltag, dann Begriff. Erst Nutzerfrage, dann Methode. Erst verstehen, dann ausprobieren. Erst Wirkungspfad, dann Score.
Stand: 05.06.2026 · Für Umsetzung durch CodeX
Inhalt
1. Vorschalt-Anweisung an CodeX
2. Zielbild: Was die Tool-Landschaft 2.0 leisten muss
3. Nicht verhandelbare Grundsätze
4. Begrifflicher und methodischer Contract der WÖk
5. Diagnose der aktuellen Tool-Landschaft
6. Neue Informationsarchitektur
7. Öffentlichkeitslogik: Welche Tools nach vorne gehören
8. Tool-Gruppen, Zusammenführungen und Umbenennungen
9. Fehlende Tools und neue UX-Bausteine
10. Einheitliches Tool-Seitentemplate
11. Armin-Maiwald-Erklärstandard
12. Designsystem und UI-Komponenten
13. Funktionale Anforderungen und Datenmodell
14. Quellen-, Status-, Glossar- und Hoverlogik
15. Inhaltliche Qualitätsregeln gegen KI-Standard-Sprech
16. Konkrete Umsetzungsanweisungen je Tool-Familie
17. Tests, QA, Accessibility und Content-Erhalt
18. Deployment und Abschlussbericht
Anhänge: Migration, Microcopy, DoD, Code-Komponenten
1. Vorschalt-Anweisung an CodeX
Diese Anweisung zuerst lesenDieses Dokument ist als verbindliches Umsetzungsbriefing für die Perfektionierung aller Tool-, Methoden-, Rechner-, Demo-, Register- und Governance-Seiten der Website wirkungsoekonomie.de zu verwenden. Es ergänzt das Website-2.0-Relaunch-Briefing und den Debatten-Kompass-Textmaster. Bei Konflikten gilt: Begriffsleitfaden > Content-Erhalt > Nutzerverständnis > Designsystem > technische Convenience.
1.1 Copy-Paste-Auftrag für CodeX
AUFTRAG AN CODEX: TOOL-LANDSCHAFT DER WIRKUNGSÖKONOMIE AUF VERSION 2.0 BRINGENBitte setze dieses Word-Dokument als verbindliche Überarbeitungs- und Perfektionierungsanweisung für alle Tool-, Methoden-, Rechner-, Demo-, Register-, Kompass-, Wirkungsradar-, Scanner- und Governance-Seiten der Website www.wirkungsoekonomie.de um.Ziel ist NICHT die Reduktion von Inhalten. Ziel ist bessere Verständlichkeit, klare UX, einheitliches Design, korrekte Wirkungslogik, nachvollziehbare Quellen, klare Statuskennzeichnung und bessere Antwortqualität.Kein bestehender Inhalt darf verloren gehen. Wenn etwas redundant, unfertig, zu abstrakt oder falsch einsortiert ist, dann: inventarisieren, verschieben, zusammenführen, als Labor/Werkstatt markieren, intern verlinken oder archivieren - aber nicht löschen.Alle Erklärungen für nichtwissenschaftliche Zielgruppen folgen dem Armin-Maiwald-Prinzip: erst Alltag, dann Problem, dann Beobachtung, dann Begriff, dann Methode, dann Wirkungspfad, dann Grenzen. Verständlich, konkret, logisch, nicht kindlich.Die Tool-Landschaft muss künftig unterscheiden zwischen:1. Orientierung & Einstieg,2. öffentlichen Demos und Rechnern,3. Methoden- und Bewertungsbausteinen,4. Governance, Datenqualität und Prüfung,5. Labor/Werkstatt/Forschungsmodellen,6. Referenz/Archiv.Jede Tool-Seite erhält ein einheitliches Template:Hero, Nutzerfrage, Was ist das?, Was ist die heutige Blindstelle?, Was gibst du ein?, Was bekommst du heraus?, Was verändert sich dadurch?, Wirkpfad, Folgencheck, Datenqualität/Status, Grenzen/Schutzlinien, Quellen, Glossar, verwandte Inhalte und nächster Schritt.Vor Live-Deployment sind Content-Inventar, Migrationsmatrix, Linkcheck, Snapshot-Tests, Statusprüfung, Glossarprüfung, Barrierefreiheitscheck und Smoke-Test durchzuführen. Version 1.5 wird erst nach erfolgreicher QA koordiniert durch Version 2.0 ersetzt.
2. Zielbild: Was die Tool-Landschaft 2.0 leisten muss
ZielbildDie Tool-Landschaft soll nicht mehr wie eine Liste sehr unterschiedlicher Dinge wirken, sondern wie ein nutzerzentriertes Wirkungssystem: Ich habe eine Frage. Ich finde den richtigen Zugang. Ich verstehe, was das Tool tut. Ich sehe, welche Wirkung sichtbar wird. Ich erkenne Grenzen, Quellen und Status. Ich kann tiefer einsteigen, ohne von Begriffen erschlagen zu werden.
2.1 Ergebnis aus Nutzer:innensicht
Neue Besucher:innen verstehen in maximal 90 Sekunden, dass nicht jedes Element ein interaktiver Rechner ist.
Fachnutzer:innen finden Scorecards, NWI, T-SROI, WÖk-IDs, Register, Governance und Quellen sauber geordnet.
CodeX/Entwicklung erhält ein einheitliches Komponentenmodell, wiederverwendbare Layouts und Tests gegen Strukturdrift.
Redaktion bekommt ein Seitentemplate und Sprachregeln, damit keine KI-Standardtexte oder Begriffslawinen entstehen.
Öffentlichkeit erkennt zuverlässig: Demo ist Demo, Methode ist Methode, Register ist Register, Rechtsmodell ist Modell, keine Personenbewertung.
2.2 Die neue Grundfrage jeder Tool-Seite
Was hilft mir dieses Werkzeug zu verstehen oder besser zu entscheiden - und welche reale Veränderung würde daraus folgen?
2.3 Wirkungsökonomischer Anspruch
Jedes Tool muss Wirkung nicht nur als Ergebniswert zeigen, sondern als Pfad: Auslöser -> Wirkungspotenzial -> Zustandsveränderung -> Bewertung -> Rückkopplung -> neue Entscheidung.
Jedes Tool muss Nebenwirkungen, Zielkonflikte, Datenqualität und Schutzlinien sichtbar machen.
Jedes Tool muss erklären, was sich in Preisen, Kapital, Beschaffung, Management, Öffentlichkeit, Haushalt, Förderung oder Verhalten verändern würde.
Jedes Tool muss klären, ob es eine Demo, Methode, Kennzahl, Registerlogik, Governance-Instanz, Kompass oder Forschungsmodell ist.
3. Nicht verhandelbare Grundsätze
3.1 Kein Content-Verlust
Harter ContractKeine Glossar-Begriffe, Veröffentlichungen, Journal-Beiträge, Bibliothekseinträge, Debattenkarten, Demos, PDFs, Methodenseiten, Registereinträge oder alten relevanten URLs dürfen ersatzlos gelöscht werden. Optimierung bedeutet Strukturierung, nicht Ausdünnung.
Bei Unklarheit wird ein Inhalt in Referenz, Archiv, Labor/Werkstatt oder Methodik verschoben.
Bei Dopplung wird eine kanonische Seite bestimmt und die andere Seite weitergeleitet oder als vertiefender Kontext verlinkt.
Bei veralteten Aussagen wird ein Status ergänzt: Altstand, Arbeitsfassung, ersetzt durch, in Prüfung, Archiv.
Bei fehlenden Quellen wird nicht gelöscht, sondern der Status transparent gemacht: Quellenprüfung offen.
Alte URLs bekommen Redirects oder Canonical-Hinweise. Keine 404 für relevante Inhalte.
3.2 Keine Personenbewertung, kein Social Credit, keine automatische Entscheidung
Alle Demos, Rechner und Checks zeigen modellhafte Wirkungslogik, keine amtliche Bewertung.
Kein Tool darf einzelne Bürger:innen, Kinder, Lehrkräfte, Migrant:innen, Medienakteur:innen oder politische Personen bewerten oder ranken.
Tools dürfen Entscheidungen vorbereiten, aber nicht ersetzen.
Wo individuelle Daten genutzt würden, muss die Seite klar sagen: In der Demo keine personenbezogene Auswertung.
3.3 Verständlichkeit ohne Verflachung
Öffentliche Seiten: Armin-Maiwald-Prinzip, kurze Einstiege, Beispiele, Alltagssprache, klare Bilder.
Fachseiten: Tiefe erhalten, aber mit Einstiegskasten, Glossar-Hovern, Wirkpfad und Zusammenfassung ergänzen.
Wissenschaftliche Publikationen, Bücher und Whitepaper bleiben vollständig. Sie bekommen Orientierung, nicht Kürzung.
Juristische und steuerliche Modelle werden als Modell-/Arbeitsfassung markiert, nicht als geltendes Recht behauptet.
4. Begrifflicher und methodischer Contract der WÖk
Führender BegriffsrahmenFür alle Tool-Seiten gilt der führende Begriffsleitfaden der Wirkungsökonomie. Wirkung ist neutral und relational. Wirkung bedeutet tatsächliche Veränderung von Zuständen. Bewertet wird am Referenzrahmen SDGs, Agenda 2030 und SDG+. Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.
4.1 Schreibweise und Präzision
Ungenau / vermeiden
Präzise / verwenden
Warum
Wirkung ist gut.
Positive Wirkung zahlt auf SDGs, Agenda 2030 und SDG+ ein.
Wirkung ist neutral; die Bewertung gibt Richtung.
Wir maximieren Wirkung.
Wir richten auf positive Netto-Wirkung für Mensch, Planet und Demokratie aus.
Sonst klingt Wirkung automatisch positiv und beliebig.
Das Narrativ wirkt demokratiefeindlich.
Das Narrativ öffnet Resonanzräume, die Vertrauen, Diskursfähigkeit und demokratische Stabilität schwächen können.
Bei Sprache meist Wirkungspotenzial, nicht eingetretene Wirkung.
Das Tool entscheidet.


…


## Wirkungsoekonomie_Website_Relaunch_Codex_Briefing.docx

Pfad: `Wirkungsoekonomie_Website_Relaunch_Codex_Briefing.docx`  
Vorhanden: True  
Zeichen: 46974

WIRKUNGSOEKONOMIE.DE
Website-Relaunch Wirkungsoekonomie.de
Designsystem, Inhaltsueberarbeitung und Codex-Umsetzungsauftrag
Version 1.0 - Umsetzungsbriefing fuer einen koordinierten Relaunch
5. Juni 2026
Leitentscheidung
Dieses Dokument ist als umsetzbares Gesamtbriefing fuer Codex gedacht. Ziel ist ein zusammenhaengender Relaunch mit einheitlichem Designsystem, klarer Informationsarchitektur, konsistenter Sprache und einer fest verdrahteten Reihenfolge fuer Debatten-Seiten. Keine weiteren vielen kleinen Deployments ohne Gesamt-Review.
Nicht verhandelbar
Bei den Debatten-Seiten gilt die hier festgelegte Reihenfolge. Sie beginnt nach dem Hero mit 'Was wird behauptet?' und erst danach kommt die Sofortantwort. Diese Logik darf nicht wieder in die alte Reihenfolge zurueckfallen.
Inhalt
1. Zielbild und Arbeitsmodus
2. Verbindliche Leitplanken fuer Sprache und Inhalt
3. Designsystem: Layout, Schrift, Farben, Komponenten
4. Informationsarchitektur und Navigation
5. Seiten-Templates und inhaltliche Ueberarbeitung
6. Debatten-Kompass: neue verbindliche Seitenlogik
7. Redaktionelle Stilregeln gegen KI-Standard-Sprech
8. Codex-Umsetzungsauftrag: Architektur, Datenmodell, Tests
9. Deployment- und QA-Plan fuer einen koordinierten Relaunch
10. Abnahmechecklisten
Anhang A-C: Beispiele, CSS-Tokens, Quellenbasis
1. Zielbild und Arbeitsmodus
Die Website soll nicht nur schoener werden. Sie soll als oeffentliche Wirkungsarchitektur funktionieren: schnell verstaendlich fuer Erstbesucher:innen, belastbar fuer Fachleute, sauber getrennt zwischen oeffentlicher Darstellung und Werkstatt, und technisch so stabil, dass Codex nicht in kleinteiligen, widerspruechlichen Deployments arbeitet.
Bereich
Vorgabe / Entscheidung
Primäres Ziel
Ein zusammenhaengender Relaunch, der Design, Layout, Navigation, Textlogik, Debatten-Kompass, Statuslogik, Quellenlogik und QA gleichzeitig ordnet.
Arbeitsmodus
Eine Feature-Branch / ein Preview-Raum / ein Review-Paket / ein Produktions-Deployment. Kleinere Nachbesserungen erst nach Relaunch-Freeze.
Inhaltlicher Kern
Wirkung statt Kapital: nicht als Parole, sondern als rueckgekoppelte Steuerungslogik aus Daten, Bewertung, Anreizen und Lernen.
Oeffentliche Wirkung
Souveraen, klar, anschlussfaehig, nicht dogmatisch. Alltag vor Fachbegriff. Wahrer Kern vor Gegenargument. Systemfrage statt Lagerreflex.
Debatten-Kompass
Nicht nur Faktencheck, sondern Orientierung: Was wird behauptet? Welcher Frame steckt dahinter? Welche Schlussfolgerung soll uebernommen werden? Danach erst die Antwort.
1.1 Relaunch-Prinzip: ein Paket statt Deployment-Chaos
Content-Freeze: Alle oeffentlich sichtbaren Texte und Statuswerte werden vor Umsetzung in einem Datenstand gesammelt.
Design-Freeze: Tokens, Komponenten und Layoutregeln werden zuerst gebaut, dann Seiten migriert.
Debatten-Freeze: Alle Debattenkarten werden in das neue Schema ueberfuehrt, aber nur quellengepruefte Karten werden prominent oeffentlich gefuehrt.
Preview-Review: Vollstaendige Vorschau mit Linkcheck, visueller Pruefung, Accessibility, mobilen Breakpoints und redaktioneller Stichprobe.
Atomic Deploy: Produktion erst, wenn Design, Inhalt, Datenmodell, Redirects und Statuslogik gemeinsam abgenommen sind.
1.2 Ergebnis, das Codex liefern soll
Einheitliches Designsystem: globale CSS-Variablen, Typografie, Abstaende, Farben, Karten, Statuschips, Callouts, Buttons, Tabellen, Quellenmodule.
Einheitliche Layouts: wiederverwendbare Templates fuer Startseite, Verstehen-Seiten, Wirkungsfelder, Werkzeuge/Labor, Bibliothek, Journal und Debattenkarten.
Ein konsistentes Inhaltsmodell: Datenstruktur fuer Debattenkarten, Quellen, Review-Status, Versionsstand und verwandte Inhalte.
Ein redaktionelles System: Schreibregeln, No-Go-Formulierungen, Quellenanforderungen und Review-Prozess.
Ein QA-System: automatisierte Tests fuer Reihenfolge, Statuslogik, externe Links, Barrierefreiheit, Meta-Daten, Canonicals und Legacy-Weiterleitungen.
2. Verbindliche Leitplanken fuer Sprache und Inhalt
Die fuehrende Sprachlogik kommt aus dem Begriffsleitfaden: Wirkung ist neutral und relational. Positive Wirkung ist keine Privatmoral, sondern wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet. Zielgroesse ist positive Netto-Wirkung fuer Mensch, Planet und Demokratie.
Redaktioneller Grundsatz
Keine Begriffsflut. Wenige praezise Begriffe konsequent nutzen: Wirkungsblindheit, Wirkungswahrheit, Wirkungsrueckkopplung, Wirkungspfad, Wirkungsraum, positive Netto-Wirkung, Reverse Merit Order, Wirkungsarchitektur.
2.1 Begriffliche Muss-Regeln
Regel
Umsetzung auf der Website
Codex-Pruefung
Wirkung neutral verwenden
Nicht schreiben: 'Wirkung' meint automatisch gut. Schreiben: Wirkung kann positiv, negativ oder neutral sein.
Glossar-Scan und Textsuche nach unklaren Pauschalverwendungen.
Positive Netto-Wirkung als Zielgroesse
Wenn Ziel, Kompass oder Erfolg gemeint ist, 'positive Netto-Wirkung fuer Mensch, Planet und Demokratie' verwenden.
Redaktioneller Lint: 'Wirkung' in Zielsaetzen markieren.
Wirkungspotenzial bei Sprache/Narrativen
Bei Debatten, Medien, Frames und Sprache nicht so tun, als sei jede Wirkung nachgewiesen. Erst Wirkungspotenzial, Resonanzraum, Wirkpfad, Risiko.
Debattenkarten muessen Feld 'wirkungspfad' und optional 'resonanzrisiko' haben.
SDG+ transparent
SDG+ immer als Erweiterung der Wirkungsökonomie bezeichnen, nicht als offizielle UN-Kategorie.
Glossar und SDG+-Seite pruefen.
Nichtkompensation beachten
Schwere negative Wirkung nicht durch gute Einzelwerte schoenrechnen. Reverse Merit Order erklaeren.
Produkt-, Steuer- und Lieferkettenseiten muessen RMO-Hinweis haben.
Modellstatus sichtbar
Demos, Rechner und Simulationen als Modell/Labor kennzeichnen; keine amtliche Bewertung, keine Beratung.
Jede Laborseite braucht sichtbares Statusmodul oberhalb des Fold oder unmittelbar nach Hero.
2.2 Die drei oeffentlichen Kernsaetze
Kernsaetze
Problem: Wirkungsblindheit - wir messen Kapital, Wachstum, Output und Reichweite, aber nicht konsequent die Folgen. Anspruch: Wirkungswahrheit - Preise, Berichte, politische Aussagen und Kapitalfluesse sollen ihre Folgen sichtbar machen. Mechanismus: Wirkungsrueckkopplung - bewertete Wirkung veraendert Preise, Steuern, Kapitalzugang, Foerderung, Beschaffung und Entscheidungen.
2.3 Tonalitaet
Klar, konkret, erwachsen. Keine akademische Ueberladung im Erstkontakt.
Nicht missionarisch. Die WÖk ist ein Kompass und eine Rueckkopplungsarchitektur, keine fertige Wahrheit und keine Weltrettungsmaschine.
Nicht technokratisch. Daten sind Grundlage fuer Rueckkopplung, aber demokratische Kontrolle, Unsicherheit und Lernfaehigkeit muessen sichtbar bleiben.


…


## Wirkungsradar_Redaktionelle_Ueberarbeitung_17_Seiten_Codex.docx

Pfad: `Wirkungsradar_Redaktionelle_Ueberarbeitung_17_Seiten_Codex.docx`  
Vorhanden: True  
Zeichen: 89746

Wirkungsradar / Debatten-KompassRedaktionelle Komplettüberarbeitung von 17 Live-Seiten
Codex-Dokument zur professionellen Neufassung, Quellenlogik und Seitenstruktur
Stand: 04.06.2026
Zweck dieses Dokuments
Dieses Dokument enthält redaktionelle Ersatzfassungen für 17 qualitativ schwache Wirkungsradar-Live-Seiten. Ziel ist nicht nur sprachliche Glättung, sondern ein systematischer Umbau: weg von generischen Generator-Blöcken und pseudoquellenhaften Angaben, hin zu narrativspezifischen Folgenchecks, klaren Wirkpfaden, handhabbaren Antwortbausteinen und sauberer Quellenlogik am Ende jeder Seite.
Verbindliche Seitenlogik für alle hier überarbeiteten Seiten
Hero mit präzisem Titel, Untertitel und Nutzenversprechen.
Was wird behauptet? mit Narrativ, impliziter Botschaft und emotionaler Stoßrichtung.
Kurzantwort: maximal ein kurzer Absatz, der wahren Kern und Denkfehler trennt.
Faktenkern: wenige konkrete Fakten, keine generischen Karten.
Folgencheck: Wirkung 1., 2. und 3. Ordnung plus Mensch, Planet und Demokratie.
Wirkpfad: Auslöser -> Wirkungspotenzial -> Wirkmechanismus -> Zustandsveränderung -> Rückkopplung -> Gegensteuerung.
So antwortest du: nicht so, bessere Frage, Kurzantwort, längere Antwort.
Was berechtigt kritisch gefragt werden darf.
Faktenlage & Quellen am Ende: Jede Quelle muss sagen, welchen Fakt sie belegt. Keine Linklisten ohne Funktion.
Psychologie nur optional als eingeklapptes Accordion, maximal drei konkrete Mechanismen.
Globale Codex-Regeln
Alle Karten „Klima / Energie / Gesundheit / Abhängigkeit / Vertrauen / Demokratie / Geld“ entfernen, wenn sie nicht explizit aus dem jeweiligen Narrativ abgeleitet werden.
impact@wirkungsoekonomie.org darf nie als Quelle erscheinen. Es ist höchstens Kontaktadresse.
Quellen bleiben am Ende. Vorher steht immer eine verständliche Faktenlage.
Jede Seite muss mit dem Begriffssystem der WÖk arbeiten: Wirkung ist tatsächliche Zustandsveränderung; Wirkungspotenzial ist der Möglichkeitsraum vor eingetretener Wirkung; Wirkungsrisiko ist ein plausibler Pfad zu möglichem Schaden.
Keine Seite soll länger werden, nur weil ein Template es erlaubt. Wenige starke Wirkpfade sind besser als viele generische Karten.
1. Batterien sind nicht recyclebar? - Kreislauffrage statt Rohstoffangst
URL: https://wirkungsoekonomie.de/wirkungsradar/live/batterien-sind-nicht-recyclebar/
Warum Recycling, Batteriechemie, Rücknahme, Second Life und Design getrennt betrachtet werden müssen.
Codex-Auftrag für diese URL
Bestehende Seite inhaltlich durch die folgende Struktur ersetzen. Alle generischen Folgenkarten, Pseudoquellen, Platzhalter, mehrfachen Antwortformate und nicht narrativspezifischen Psychologieblöcke entfernen.
Was wird behauptet?
Elektroautos und Speicher seien ökologisch sinnlos, weil ihre Batterien angeblich gar nicht oder kaum recyclebar seien.
Kurzantwort
Die Aussage ist als Pauschalurteil falsch. Richtig ist: Batterierecycling ist technisch, ökonomisch und organisatorisch anspruchsvoll. Entscheidend sind Batteriechemie, Sammelquote, Demontage, Verfahren, Energiequelle, Rückgewinnungsquote, Second-Life-Nutzung und Regulierung. Aus Aufwand folgt keine Unmöglichkeit.
Faktenkern
Batterierecycling ist kein Ja/Nein-Thema. Es gibt unterschiedliche Chemien, Wertstoffprofile und Verfahren. Kobalt-, Nickel- oder Kupferanteile sind anders zu bewerten als LFP-Batterien oder Natrium-Ionen-Pfade.
Die EU-Batterieverordnung setzt Pflichten zu CO2-Fußabdruck, Sorgfaltspflichten, Sammlung, Recyclingeffizienz, Materialrückgewinnung, Rezyklatanteilen und Batteriepass.
Recycling ersetzt keine Rohstoffpolitik. Es reduziert Abhängigkeiten nur, wenn Design, Rücknahme und industrieller Hochlauf funktionieren.
Second Life kann die Nutzungsdauer verlängern, ist aber kein Freifahrtschein: Sicherheit, Restkapazität, Haftung und Datenqualität bleiben entscheidend.
Der richtige Vergleich ist nicht Batterie gegen perfekte Welt, sondern Batteriepfade gegenüber fossilen Pfaden einschließlich Ölgewinnung, Raffinerie, Transport, Luftschadstoffen und Klimakosten.
Folgencheck: Was bewirkt dieses Narrativ?
Wirkung 1. Ordnung: Menschen überschätzen das Entsorgungsproblem und unterschätzen den technischen Wandel in Rücknahme, Demontage und Recycling.
Wirkung 2. Ordnung: Akzeptanz für E-Mobilität, Speicher und Kreislaufwirtschaft sinkt; Investitionen in europäische Recyclingkompetenz wirken weniger dringlich.
Wirkung 3. Ordnung: Der Verkehrs- und Stromsystemumbau wird verzögert, während fossile Abhängigkeiten länger bestehen bleiben.
Mensch: Luftqualität, Lärmreduktion und geringere Abhängigkeit von fossiler Mobilität werden später erreicht.
Planet: Dekarbonisierung und Rohstoffkreisläufe werden ausgebremst; gleichzeitig bleiben fossile Emissionen länger wirksam.
Demokratie: Technikdebatten kippen in Pauschalverdacht statt in überprüfbare Industrie-, Design- und Lieferkettenpolitik.
Wirkpfad
Auslöser: Eine Batterie wird als Sondermüllbild inszeniert.
Wirkungspotenzial: Rohstoffangst und Misstrauen gegenüber Elektrifizierung.
Wirkmechanismus: Technische Herausforderungen werden als grundsätzliche Unmöglichkeit gerahmt.
Zustandsveränderung: Kreislaufstrategien wirken sinnlos.
Rückkopplung: Politischer Druck auf Recycling-, Rücknahme- und Designstandards sinkt.
Gegensteuerung: Chemie, Verfahren, Rücknahme, Rückgewinnungsquote, Second Life und Batteriepass konkret benennen.
So antwortest du
Nicht so: Nicht behaupten, Batterierecycling löse alle Rohstoffprobleme. Nicht so antworten, als seien alle Batteriepfade gleich.
Bessere Frage: Welche Batteriechemie und welches Recyclingverfahren meinst du konkret?
Kurzantwort: Batterien sind nicht einfach „nicht recyclebar“. Die richtige Frage ist: Welche Chemie, welche Rücknahme, welches Verfahren, welche Rückgewinnungsquote und welcher Prozessstrom?
Längere Antwort: Der wahre Kern ist: Batterien haben Rohstoff-, Energie-, Sicherheits- und Recyclingfragen. Der Denkfehler ist, daraus ein pauschales Unmöglichkeitsargument zu machen. Moderne Batteriepolitik bewertet den ganzen Lebenszyklus: Rohstoffherkunft, Zellchemie, Reparierbarkeit, Second Life, Rücknahme, Demontage, Recyclingeffizienz, Rezyklatanteile und Batteriepass. Wirkungsökonomisch ist die richtige Antwort nicht „Akku gut“ oder „Akku böse“, sondern: Welche Netto-Wirkung entsteht im Vergleich zu fossilen Alternativen und wie werden die kritischen Engpässe zurückgekoppelt?
Was berechtigt kritisch gefragt werden darf
Welche Rohstoffe werden pro Chemie benötigt?
Welche Rückgewinnungsquoten werden real erreicht?
Wie hoch ist der Energieeinsatz im Recycling?
Wie werden Lieferketten, Arbeitsschutz und Umweltfolgen geprüft?
Wie werden kleinere, langlebigere und reparierbare Batterien bevorzugt?
Wirkungsökonomische Einordnung
Die Seite soll nicht nur Fakten korrigieren, sondern zeigen, welche Zustandsveränderung durch das Narrativ wahrscheinlicher wird. Entscheidend ist der Schritt vom Schlagwort zum Wirkpfad: Welche Wahrnehmung wird verändert, welche Entscheidung wird dadurch plausibler und welche Rückkopplung entsteht?
Faktenlage & Quellen am Ende
Quellen nicht vor den Folgencheck ziehen. Jede Quelle muss mit einem klaren Belegzweck erscheinen: Quelle -> welchen Fakt belegt sie?
Fraunhofer ISI Batterie-Faktencheck: Belegt technische Einordnung, Recycling, Rohstoff- und Handlungsbedarf. https://www.isi.fraunhofer.de/content/dam/isi/dokumente/policy-briefs/2025-05_policy_brief_batteries_electric_cars_update_fact_check_action.pdf
EU-Kommission Batterien: Belegt EU-Batterieverordnung, Kreislauf- und Batteriepasslogik. https://environment.ec.europa.eu/topics/waste-and-recycling/batteries_en
2. CO2 ist nur ein Spurengas? - Konzentration ist nicht Wirkung
URL: https://wirkungsoekonomie.de/wirkungsradar/live/co2-ist-nur-ein-spurengas/
Warum ein kleiner Anteil in der Atmosphäre trotzdem große Strahlungswirkung haben kann.
Codex-Auftrag für diese URL
Bestehende Seite inhaltlich durch die folgende Struktur ersetzen. Alle generischen Folgenkarten, Pseudoquellen, Platzhalter, mehrfachen Antwortformate und nicht narrativspezifischen Psychologieblöcke entfernen.
Was wird behauptet?
Weil CO2 nur einen sehr kleinen Anteil der Atmosphäre ausmacht, könne es das Klima nicht relevant beeinflussen.
Kurzantwort
Die Aussage verwechselt Menge mit Wirkung. Viele Stoffe wirken in geringen Konzentrationen stark. CO2 ist physikalisch relevant, weil es infrarote Wärmestrahlung absorbiert und die Energiebilanz der Erde verändert. Entscheidend ist nicht der prozentuale Anteil, sondern die Strahlungswirkung und die zusätzliche Menge seit der Industrialisierung.
Faktenkern
CO2 ist mengenmäßig klein, aber klimawirksam, weil es im Infrarotbereich absorbiert.
Der natürliche Treibhauseffekt macht die Erde bewohnbar; zusätzliche Treibhausgase verschieben die Energiebilanz.


…


## Wirkungsoekonomie_Glossar_Korrektur_Codex.docx

Pfad: `Wirkungsoekonomie_Glossar_Korrektur_Codex.docx`  
Vorhanden: True  
Zeichen: 29400

WIRKUNGSÖKONOMIE
Glossar 2.0: öffentliche Härtung, Quellenlogik und Template-Korrektur
Umfassende Korrektur- und Umsetzungsanweisung für CodeX
Stand: 5. Juni 2026 · Ziel: professionelle öffentliche Glossarseiten ohne interne Artefakte
Nicht verhandelbares Ziel
Alle Glossarbegriffe bleiben erhalten. Korrigiert werden Template, Metadaten, Quellenbezug, Linklogik, leere Blöcke, Tonalität und redaktionelle Qualität. Kein Begriff darf gelöscht werden, nur weil er noch nicht perfekt eingeordnet ist.
Dieses Dokument ist eine interne CodeX-Anweisung und darf nicht öffentlich auf der Website verlinkt werden.
Inhaltsübersicht
1. Auftrag und Zielbild
2. Live-Befund: Fehlerklassen auf Glossar-Seiten
3. Harte öffentliche Regeln für alle Glossar-Einträge
4. Neuer Template-Contract für Glossar-Seiten
5. Feld- und Datenmodell: Was öffentlich sichtbar sein darf
6. Korrekte Bezug-Logik statt raw enums wie defined
7. Quellen- und Link-Hygiene
8. Spezifische Musterkorrektur: /begriffe/staat/
9. Redaktioneller Standard: Armin-Maiwald-Erklärung ohne KI-Anstrich
10. Batch-Umsetzung für alle Glossarbegriffe
11. Automatisierte QA- und Build-Gates
12. Abschlussbericht und Deployment-Regel
1. Auftrag und Zielbild
CodeX soll alle öffentlichen Glossar-Einträge unter /begriffe/ prüfen, korrigieren und in ein professionelles, einheitliches, redaktionell tragfähiges Glossar-Template überführen. Der aktuelle Fehler ist nicht der Inhalt der Begriffe an sich, sondern die Vermischung aus öffentlichem Glossar, interner Content-Architektur, unfertigen Datenfeldern, Roh-Metadaten und teilweise generischen Textbausteinen.
Das Glossar soll künftig wie ein sauber redigiertes öffentliches Wissenssystem wirken: klar, lesbar, fachlich belastbar, quellenfähig, nutzerfreundlich und ohne sichtbare interne Arbeitslogik.
Leitprinzip
Nicht weniger Inhalt, sondern bessere öffentliche Form: Begriffe bleiben erhalten; falsche Template-Blöcke, leere Felder, interne Status, Rohdatenlabels, ungeprüfte Quellen und generische Wiederholungstexte verschwinden aus der öffentlichen Ausgabe.
1.1 Was nach der Korrektur verstanden werden muss
Was bedeutet der Begriff in einfacher, präziser Sprache?
Warum ist der Begriff im Kontext der Wirkungsökonomie relevant - falls er wirklich relevant ist?
Womit darf der Begriff nicht verwechselt werden?
Wie wird der Begriff in WÖk-Texten, Debatten, Methoden, Werkzeugen oder Online-Kapiteln verwendet?
Welche Quellen definieren, vertiefen, kontextualisieren oder nur erwähnen den Begriff?
Welche Links führen auf öffentliche Online-Kapitel oder geprüfte PDF-Dokumente mit Mehrwert?
Welche Informationen sind intern und dürfen nicht öffentlich sichtbar sein?
1.2 Verbindlicher Begriffsrahmen
Alle WÖk-Kernbegriffe müssen auf den führenden Begriffsleitfaden ausgerichtet werden: Wirkung ist neutral und relational; Wirkung beschreibt tatsächliche Zustandsveränderung; positive oder negative Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet; Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.
Wichtig: Diese begriffliche Präzision gilt für öffentliche Glossarseiten. Ältere interne Dateien können frühere, ungenauere Begriffsverwendungen enthalten und dürfen nicht ungeprüft als öffentliche Glossarlogik durchgereicht werden.
2. Live-Befund: Fehlerklassen auf Glossar-Seiten
Das Beispiel https://wirkungsoekonomie.de/begriffe/staat/ zeigt mehrere grundsätzliche Template- und Datenfehler, die vermutlich nicht nur diesen Begriff betreffen. CodeX muss deshalb nicht nur die Seite „Staat“, sondern alle Glossar-Detailseiten und die Glossar-Indexlogik prüfen.
2.1 Kritische Fehler am Beispiel „Staat“
Fehlerklasse
Korrekturanweisung
Öffentlich sichtbarer Publikationsstatus
Im Hero bzw. Metabereich erscheint „published“. Das ist ein internes Statusfeld und darf öffentlich nicht sichtbar sein.
Unpassender Debattenblock
Der oberste Block „Vom Begriff zur Debatte - Wie diese Logik in öffentlichen Debatten wirkt“ hat auf normalen Glossarbegriffen nichts verloren. Er gehört nicht in das Standard-Glossar-Template.
Generischer WÖk-Text ohne Begriffsbezug
Der Block „Warum ist das wichtig?“ enthält beim Begriff „Staat“ offenbar Text zu Wirkung, Wirkungspotenzial, Wirkungsrisiko usw. Das erklärt nicht den Begriff Staat und wirkt wie ein falscher Template-Fill.
Generischer Verwendungsblock
„So wird der Begriff genutzt“ wiederholt denselben generischen Text. Verwendung muss konkret erklären, wie genau dieser Begriff auf der Website genutzt wird.
Leerer Abgrenzungsblock
„Nicht verwechseln mit: Keine Einträge“ darf nie öffentlich gerendert werden. Leere Datenfelder werden ausgeblendet.
Raw-Bezug „defined“
„Bezug: defined“ ist ein interner Enum-Wert. Öffentlich muss ein verständlicher Bezug erscheinen, z. B. „definiert den Begriff“, „systematisch verwendet“, „direkte Vertiefung“ oder „Kontext“.
Unpassende Quellen
Beim Begriff „Staat“ erscheinen Quellen zu Faschismus / faschistoid / Autokratie. Diese können bei „Faschismus“, „Autoritarismus“ oder „Staatsdelegitimierung“ sinnvoll sein, aber nicht als Quellenbasis für „Staat“.
Unvollständige Kapitelzuordnung
„Für diesen Begriff ist noch kein konkretes Kapitel zugeordnet“ ist ein interner Unvollständigkeitshinweis und darf öffentlich nicht erscheinen. Wenn kein Kapitel zugeordnet ist, wird der Block ausgeblendet.
Interne Arbeitsquellen sichtbar
Bezeichnungen wie „Glossar-Architektur Wirkmechanismen“, „redaktionelle Glossarquelle“, „interne Arbeitsgrundlage“ gehören nicht in öffentliche Quellenkarten.
Grundsatz
Keine Glossarseite darf roh aus der Datenbank wirken. Das öffentliche Glossar ist redaktionelle Oberfläche, nicht Daten-Dump.
3. Harte öffentliche Regeln für alle Glossar-Einträge
1. „published“, „draft“, „professionalisiert“, „redaktionell zu prüfen“, „No-Delete“, „Aktualisiert durch: codex“, „Glossar-Pack“, „Source-Hash“, „Import-Version“, „Reviewstatus“ und ähnliche interne Felder dürfen öffentlich nicht sichtbar sein.
2. „Keine Einträge“, „keine“, „null“, „undefined“, „defined“, „n/a“, „TBD“, „kommt noch“, „in Vorbereitung“, „zu prüfen“ oder Platzhaltertexte dürfen nie als sichtbarer Seiteninhalt gerendert werden.
3. Ein Block wird nur gerendert, wenn er echte, begriffsspezifische Inhalte enthält. Empty states sind im Admin erlaubt, nicht auf öffentlichen Seiten.
4. Kein .md-Link, kein Word-Link, kein RTF-, TXT-, CSV- oder Rohdatenlink auf öffentlichen Glossarseiten. Öffentliche Verlinkung erfolgt auf Online-Kapitel, öffentliche Website-Seiten oder geprüfte PDFs mit Mehrwert.
5. Interne Quellen dürfen nicht als „interne Quelle“ sichtbar werden. Wenn der Inhalt öffentlich ist, Link auf Online-Kapitel oder PDF; wenn nicht öffentlich, nicht verlinken und nicht nennen.
6. Quellenkarten müssen immer einen klickbaren Link haben, wenn sie öffentlich angezeigt werden. Reine Textquellen ohne Link sind nur bei klassischen Buchquellen erlaubt und dann sauber bibliografisch zu formulieren.
7. Jeder Begriff braucht eine eigene, konkrete Erklärung. Kein generischer Wiederholungsblock darf für mehrere Begriffe unverändert ausgespielt werden.
8. Jeder Begriff muss erklären, was genau gemeint ist und was nicht gemeint ist. Aber Abgrenzungsblöcke dürfen nur erscheinen, wenn echte Abgrenzungen vorliegen.
9. Der Debattenbezug ist optional und kein Standardblock. Er erscheint nur, wenn der Begriff tatsächlich ein Debattenbegriff, Narrativbegriff, Framingbegriff oder politisch missbrauchbarer Anschlussbegriff ist.
10. Sensiblen Begriffen wie Staat, Regierung, Demokratie, Faschismus, Migration, Rassismus, Antisemitismus, Rechtsstaat, Nation, Freiheit, Eigentum, Markt usw. ist besondere Quellen- und Tonalitätsprüfung zu geben.
4. Neuer Template-Contract für Glossar-Seiten
CodeX muss das Glossar-Template so umbauen, dass öffentliche Seiten nicht länger Datenbankfelder abbilden, sondern eine fachlich redigierte Begriffserklärung ausgeben. Die Reihenfolge ist verbindlich.
Block
Öffentliche Funktion
Hero
Breadcrumb, Themenwelt/Kategorie, Begriffstitel, Kurzdefinition. Optional: Version oder Stand. Kein published-Status.
Auf einen Blick
Maximal drei bis fünf bullets oder ein kurzer Absatz: Was muss man sofort verstehen?


…


## Wirkungsoekonomie_Website_Professionalitaets_Link_Download_Haertung_Codex.docx

Pfad: `Wirkungsoekonomie_Website_Professionalitaets_Link_Download_Haertung_Codex.docx`  
Vorhanden: True  
Zeichen: 38857

CodeX-Briefing
Wirkungsoekonomie.de
Professionalitäts-, Link- und Download-Härtung der gesamten Website
Interne Artefakte entfernen · KI-Anstrich beseitigen · öffentliche Redaktion stärken · PDFs und Quellen sauber führen
Nicht verhandelbarer Auftrag
Alle öffentlich erreichbaren Seiten, Komponenten, Downloads, PDFs, Suchindizes, Sitemaps, Feed-Ausgaben und Metadaten werden so bereinigt, dass sie wie eine professionelle redaktionelle Website wirken.
Es darf öffentlich nichts erscheinen, was nach interner Arbeitsnotiz, Importpipeline, CodeX-/KI-Anweisung, Promptrest, provisorischem Deployment, technischer Quelle, unfertiger Platzhalterseite oder unredigiertem Rohimport aussieht.
Inhalte werden nicht gelöscht, sondern sauber eingeordnet: öffentliche Lesefassung, Referenz, Labor/Werkstatt, Archiv oder nicht öffentliches internes Material.
Stand: 05. Juni 2026 · Ziel: Website 2.0 öffentlich belastbar machen
Inhaltsübersicht
1. Executive Summary für CodeX
2. Ausgangsbefunde und Risikoklassen
3. Nicht verhandelbare Public-Quality-Regeln
4. Vollständiger Audit-Scope
5. Öffentlichkeitsrollen und neue Content-Klassifikation
6. Harte Entfernen-/Ersetzen-Regeln
7. Link- und Download-Härtung
8. PDF- und Dateihygiene
9. Redaktionelle Anti-KI-Qualität
10. Armin-Maiwald-Erklärstandard
11. Wirkungsökonomischer Mindeststandard je Seite
12. Template-Korrekturen nach Seitentyp
13. Debatten-Kompass: Quellen, Ton und Wirkungslogik
14. Konkrete Korrekturbeispiele aus der Live-Struktur
15. Automatisierte Tests und Build-Gates
16. Umsetzungsvorgehen
17. Abnahmebericht und Deployment-Gate
1. Executive Summary für CodeX
Zielbild
Die Website soll nach guter redaktioneller Arbeit aussehen: ruhig, präzise, menschlich, quellenklar, nachvollziehbar, ohne technische Nähte und ohne generische KI-Anmutung.
Jede Seite muss eine echte Funktion erfüllen: Orientierung, Erklärung, Referenz, Debatte, Demo, Download oder Mitmachpfad. Alles andere wird intern verschoben, redaktionell eingeordnet oder verborgen.
Kein Inhalt darf verschwinden. Unfertige, technische oder interne Inhalte werden nicht gelöscht, sondern in passende öffentliche oder interne Rollen überführt.
Keine öffentlichen Rohimporte. Importstatus, Source-Hashes, Dateinamen, technische Versionen, Absatzzählungen und Pipeline-Hinweise gehören nicht auf öffentliche Leseseiten.
Keine KI-Spuren. Promptreste, Antwortaufforderungen, Chat-/KI-Metakommentare, generische KI-Sprache und standardisierte, wiederholte Textmuster werden entfernt oder professionell neu formuliert.
Keine Platzhalter. Seiten, Karten oder Komponenten mit „kommt noch“, „in Vorbereitung“, „Phase 2“, „ausstehend“ ohne Mehrwert oder ähnlichen Signalen werden nicht öffentlich angezeigt.
Keine öffentlichen .md- oder Word-Links. Öffentliche Links führen auf Online-Kapitel oder PDFs mit Mehrwert. .md, .doc, .docx, .rtf und interne Dateinamen sind öffentlich verboten.
Alle PDFs werden bereinigt. PDFs dürfen keine KI-Anweisungen, Promptreste, internen Kommentare, Track-Changes, Rohfassungsnotizen oder unprofessionelle Metadaten enthalten.
Armin-Maiwald-Prinzip. Für alle nicht-wissenschaftlichen Seiten gilt: erst Alltag, dann Begriff; erst Beispiel, dann Systemlogik; erst Nutzerfrage, dann Methode.
Leitender Begriffsrahmen: Wirkung wird auf der Website neutral und relational verwendet. Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie; positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ eingeordnet. Dieser Rahmen ist auf allen Seiten, in Hover-Definitionen und Quellenboxen konsistent umzusetzen.
2. Ausgangsbefunde und Risikoklassen
Die folgenden Befunde sind keine vollständige URL-Liste, sondern bestätigte Risikotypen. CodeX muss die gesamte Website automatisch und manuell gegen diese Klassen prüfen.
Risikoklasse
Live-Indiz / Beispiel
Warum kritisch
Zielzustand
Interne Quellen-/Dateinamen sichtbar
Begriffsseiten zeigen Quelle: WOeK_Begriffsleitfaden_fuehrend_v1.0 und redaktionelle Arbeitsgrundlage.
Für externe Leser:innen wirkt das wie ein Blick in die Werkstatt und nicht wie eine kuratierte Quelle. Außerdem dürfen .md-Dateien grundsätzlich nicht öffentlich verlinkt werden.
Öffentlich: „Führender Begriffsleitfaden der Wirkungsökonomie, Version 1.0, Onlinefassung / PDF“. Keine .md-Endung, keine interne Dateibezeichnung.
Technische Importmetadaten öffentlich
Dokumentseiten zeigen Source-Version, Import-Version, Live-Reference-Version, Reviewstatus, Terminologiebasis, Source-Hash, Absätze/Textblöcke.
Das wirkt wie ein nicht fertig gebautes Content-System. Technisch korrekt, aber redaktionell unprofessionell.
Öffentlich nur: Titel, Kurzbeschreibung, Autorin, Stand, Status, zitierfähige PDF-Fassung, Onlinefassung, Quellen. Technische Metadaten nur intern oder hinter Admin-/Detailschalter.
Rohimport-Hinweise öffentlich
„Diese Webfassung ist ein technischer Volltextimport...“, „Diskurs ... Phase 2“, „Abschnitts- und Absatz-IDs sind vorbereitet“.
Das ist interne Produktionssprache und schwächt Vertrauen in die Seite.
Ersetzen durch professionelle Einordnung: „Öffentliche Onlinefassung. Das PDF bleibt die zitierfähige Fassung.“ Nur wenn nötig mit kurzer Fußnote.
Word-Downloads öffentlich
Einzelne Detailkonzepte verweisen auf PDF und DOCX.
Öffentliche Word-Dateien wirken unfertig und können Kommentare, Metadaten, Promptreste oder interne Bearbeitungsspuren enthalten.
Öffentlich nur PDF. DOCX höchstens intern, passwortgeschützt oder im Redaktionsbereich.
KI-/Promptreste in Dateien
PDFs können Sätze wie „Möchtest du, dass ich jetzt Abschnitt ... schreibe?“ enthalten.
Das ist ein harter Vertrauensbruch: Es zeigt KI-/Arbeitsprozess statt Autorinnenschaft und redaktioneller Prüfung.
PDFs neu generieren, Text extrahieren, Prompt-/Chatreste entfernen, Metadaten säubern, neu verlinken.
Platzhalter und unfertige Module
„kommt noch“, „in Vorbereitung“, „Phase 2“, „redaktionell ausstehend“, „wird geladen“ ohne Mehrwert.
Öffentlich wirkt das wie Baustelle. Ein Tool oder Inhalt soll erst sichtbar sein, wenn er eine klare Funktion hat.
Nicht anzeigen, wenn kein Mehrwert. Alternativ: Werkstatt-/Preview-Bereich mit transparenter, fertiger Einordnung und ohne peinliche Platzhalter.
Unredigierte Präsentationsfragmente
Folienimporte zeigen Stichwortsammlungen, harte politische Formulierungen, Quell-URLs mitten im Text oder Folienreste.
Als Archiv ggf. okay, als öffentliche Seite nicht. Das wirkt unkuratiert und kann unnötig angreifbar sein.
Präsentationen nur als PDF-Archiv plus redaktionelle Zusammenfassung. Rohtext nur intern oder als klar markierter Archivimport mit geringerer Sichtbarkeit.
KI-Standard-Sprech
Wiederholte Formeln wie „komplexe Herausforderungen“, „in einer Welt“, „Transformation gestalten“, „zukunftsfähig“, ohne konkrete Wirklogik.
Der Inhalt verliert Eigenständigkeit und klingt austauschbar.
Konkrete Beobachtung, Beispiel, Wirkpfad, Folgencheck, Schutzgrenze, Quellen. Keine generischen Einstiegssätze.
3. Nicht verhandelbare Public-Quality-Regeln
Öffentlich sichtbarer Text ist immer redaktioneller Text, nie Produktionslog, Importnotiz, Promptrest, Arbeitsanweisung oder Debug-Metadatum.
Jede öffentliche Seite beantwortet klar: Für wen ist diese Seite? Was soll sie erklären? Was verändert sich durch die Wirkungsökonomie? Welche Grenzen gelten?


…


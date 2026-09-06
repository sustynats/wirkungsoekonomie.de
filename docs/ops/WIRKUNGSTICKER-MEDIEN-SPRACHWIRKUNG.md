# Wirkungsticker: Medien- & Sprachwirkung

## Zweck

Der Wirkungsticker prüft bei sprachlich oder medial relevanten Meldungen zusätzlich, wie Wortwahl, Frames, Überschriften, Zitate, Attribution und Wiederholung den öffentlichen Resonanzraum beeinflussen können. Kommunikatives Wirkungspotenzial, Wirkungsrisiko und empirisch beobachtete Wirkung bleiben getrennt. Die Prüfung bewertet weder Personen noch politische Lager oder Medienhäuser.

## Architektur

Die Erweiterung nutzt die bestehende Pipeline und den bestehenden Story-Speicher:

1. `detectMediaImpactTrigger()` in `scripts/news/media-impact.mjs` prüft vor dem KI-Aufruf lokale Signale. Der geprüfte Triggerstand wird zusammen mit einem Inhaltsfingerabdruck gespeichert, damit ein Befund aus einem nur flüchtig abgerufenen öffentlichen Artikeltext nach dessen absichtlicher Nicht-Speicherung reproduzierbar validiert werden kann.
2. `buildAnalysisPrompt()` übergibt das Triggerergebnis und verlangt bei einem Treffer den strukturierten `media_impact`-Block im normalen Story-Aufruf. Es gibt keinen zweiten regulären KI-Aufruf.
3. `sanitizeAnalysisMediaImpact()` läuft in `run.mjs` vor `validateAnalysis()`. Unbelegte Herkunftsbelege, Ein-Quellen-Vergleiche und unbekannte Werte werden entfernt. Ein lokaler Nichttreffer darf nur durch einen vollständigen, evidenzgetrennten KI-Befund hochgestuft werden; eine bloße Behauptung oder ein Teilobjekt reicht nicht.
4. `mediaImpactValidationErrors()` prüft die fachliche Trennung und die Eigenformulierungen.
5. `build.mjs` zeigt den Bereich nur bei `media_impact.relevant === true` an.
6. `backfill-media-impact.mjs` ergänzt ausschließlich bereits veröffentlichte Trigger-Treffer und versioniert sie im vorhandenen Story-Modell.

## Trigger

Der lokale Trigger ist ein Recherche- und Kostengate, kein abschließendes Urteil. Er berücksichtigt unter anderem:

- politisch aufgeladene oder kampagnenartige Bezeichnungen;
- Bedrohungs-, Feindbild-, Moral-, Generalisierungs- und Katastrophisierungsframes;
- Täter-, Motiv- oder Schuldzuschreibungen bei zugleich offener Faktenlage;
- prominente Akteursaussagen und Zitate;
- fehlende Attribution in der Überschrift;
- einen erkennbaren Unterschied zwischen Überschrift und geliefertem Kurztext.
- seit Version 2.1 nahe Merkmals-/Schadensverknüpfungen in derselben Überschrift, etwa elektrische oder verbrennungsbasierte Technik neben einem Brand oder Unfall;
- bestimmte Kausalbehauptungen in einer Quellenüberschrift bei zugleich qualifizierter oder offener Angabe im zugehörigen Quellentext.

Neutrale Technikmerkmale erhöhen nicht zusätzlich die Warnstufe für politische Kampfbegriffe. Verschiedene Überschriften und Sätze werden für Assoziationssignale nicht zusammengeschoben; Brandschutz-/Feuerwehrbegriffe sind allein kein Schadensereignis. Auch nach einer sachlicheren Ticker-Überschrift bleibt die Originalüberschrift Prüfgrundlage. Der Trigger stellt weder Unwahrheit noch Manipulation noch tatsächlich aktivierte Vorstellungen fest.

Die Regeln enthalten keine ideologische Blacklist. Links, rechts, Regierung, Opposition, Wirtschaft, Verbände, NGOs, Gewerkschaften, Behörden und Medien werden mit derselben Signallogik behandelt. Ein Treffer aktiviert die Prüfung; die vertiefte Analyse darf anschließend `relevant:false` feststellen. Umgekehrt darf ein konkreter, vollständig ausgefüllter und anschließend durch alle Qualitätsregeln geprüfter Befund einen zu engen lokalen Nichttreffer ergänzen. Diese Eskalation wird als `analysis_finding` protokolliert und verändert weder Fakten- noch Ereigniswirkung.

## Datenmodell

Die vorhandene `analysis`-Struktur wird ergänzt um:

- `media_impact`: Sachverhaltskern, Akteursaussage, Framing, Attribution, Resonanz, Wirkpfad, Evidenztrennung, redaktionelle Einordnung, sachliche Alternativfassung und optionaler Quellenvergleich;
- `media_analysis_version`;
- `media_checked_at`;
- `media_trigger_fingerprint`.
- `media_trigger`: serverseitig normalisierter Triggerstand mit Begründungen, Prüfgrundlage und Inhaltsfingerabdruck; nicht Teil der öffentlichen Lesertexte.

Ereigniswirkung bleibt in den bestehenden Wirkungsfeldern. Kommunikationswirkung bleibt im neuen Block. Ein Bezug zur Demokratiedimension muss in der Analyse nachvollziehbar begründet werden; es gibt keine automatische Score-Übernahme.

Seit `media_analysis_version: 2.0` bildet der kanonische Block den Frame- und Diskurscheck vollständig ab: `epistemic_status`, `attribution`, `frame_analysis`, `political_context`, `discourse_effect`, `impact_path`, getrennte Evidenzlisten, `observed_impact`, `public_explanation`, `fact_first_alternative` und `self_frame_check`. Die vier Ebenen Sachverhalt, Akteursaussage, mediale Vermittlung und WÖk-Analyse bleiben maschinenlesbar getrennt. Eine beobachtete Kommunikationswirkung wird nur mit mehreren gelieferten, belastbaren Evidenzreferenzen zugelassen; andernfalls stuft der Sanitizer sie auf Potenzial oder Risiko zurück.

## Faktencheck, Folgencheck und Mediencheck

- Faktencheck: Ist eine Ereignisbehauptung belegt, strittig oder offen?
- Folgencheck: Welche möglichen Folgen ergeben sich aus dem Ereignis?
- Medien- & Sprachwirkung: Welches Wirkungspotenzial oder Risiko entsteht möglicherweise aus der konkreten Vermittlung?

Ein korrekt wiedergegebenes Zitat kann kommunikatives Wirkungspotenzial besitzen, ohne dadurch redaktionelle Eigenposition zu werden. Fehlende Informationen gelten nur dann als Befund, wenn sie für den Status oder den Deutungsraum materiell sind.

## Evidenzregeln

Fakt, Akteursaussage, Medienhandlung, Inferenz, Wirkungspotenzial, Wirkungsrisiko und eingetretene Wirkung werden getrennt ausgewiesen. Politische Begriffsgeschichte darf nur erscheinen, wenn eine Referenz auf eine tatsächlich gelieferte Quelle besteht. Andernfalls wird lediglich von einer politisch aufgeladenen oder umkämpften Bezeichnung gesprochen. Absichten werden nicht unterstellt.

### Implizite Assoziationen, Narrative und Wiederholung

Die Prüfung ist nicht auf politische Schlagwörter begrenzt. Sie unterscheidet:

1. Beobachtbare Hervorhebung: Welches Merkmal steht neben welchem Ereignis? Ist die Angabe sachlich erforderlich und klar attribuiert?
2. Analytische Hypothese: An welche Vorstellungen könnte die Darstellung anschließen? Wird möglicherweise vom konkreten Objekt auf eine ganze Technik oder Gruppe übertragen? Ein Einzelfall belegt keine vergleichende Häufigkeit oder allgemeine Gefährlichkeit.
3. Narrativanschluss: Ist ein wiederkehrendes Deutungsmuster tatsächlich belegt oder nur eine plausible Rezeptionshypothese? Kein erfundener Mythos, keine politische Herkunft aus Modellgedächtnis.
4. Wiederholung: Welche Aussage wird wo wiederholt? Feed, Cache und Artikel derselben Quelle sowie Agenturabdrucke sind keine unabhängigen Bestätigungen. Bloße Wortnähe ist noch keine Wiederholungsserie.
5. Illusory Truth: Ein mögliches verändertes Wahrheitsurteil durch Vertrautheit/Wiederholung ist nicht mit einer spontanen Assoziation gleichzusetzen. Ohne fallbezogene Basis bleibt `repetition_risk:open`; eine Publikumswirkung wird nicht behauptet.

Die bestehende Struktur reicht dafür aus: `frame_analysis`, `evidence.observations/inferences/limitations`, `discourse_effect`, `resonance.repetition_effect` und `impact_path`. Keine zweite Analyse oder zusätzliche Datenbank. Die Darstellung nennt Wiederholungsrisiken nicht automatisch Illusory-Truth-Befunde und zeigt verfügbare Erläuterungen statt bloßer Stufen. Das Gate weist unbelegte Behauptungen eines eingetretenen Illusory-Truth-Effekts zurück. Ein widersprüchliches `impact_status:observed` ohne Beobachtungsbeleg wird normalisiert.

Methodischer Forschungshinweis: [Fazio et al. (2015), Knowledge does not protect against illusory truth](https://pubmed.ncbi.nlm.nih.gov/26301795/) untersucht Wahrheitsurteile zu wiederholten Aussagen. Das ist keine Evidenz für die Wirkung einer konkreten Ticker-Meldung und wird nicht als Ereignisquelle angefügt.

## Self-Frame-Check

Titel, Kurzfassung, Detailfassung und daraus abgeleitete SEO-, OpenGraph-, Feed-, Share- und Push-Texte folgen dem Prinzip „Sachverhalt vor Frame“. Eine unsichere Eigenformulierung kann nur durch eine im selben quellengebundenen Output gelieferte sachliche Alternativfassung ersetzt werden. Der Originaltitel bleibt in der Quellenakte sichtbar. Problematische Begriffe werden nach der ersten analytisch notwendigen Nennung nicht unnötig wiederholt.

## Kosten und Logging

Neue Storys erhalten den Mediencheck innerhalb des bestehenden Analyseaufrufs. Ohne Trigger entsteht kein vertiefter Output. Das Nutzungsprotokoll enthält:

- `media_checks_triggered`;
- `media_checks_skipped`;
- `media_checks_ai_promoted`;
- `media_check_tokens`;
- `media_check_cost_usd`;
- `media_quality_retries`;
- `media_checks_cleaned`;
- `media_checks_normalized`;
- `self_frame_rewrites`.

Der Medienkostenanteil eines regulären kombinierten Aufrufs ist eine konservative Marginalschätzung und wird nicht zusätzlich zum Gesamtpreis verbucht. Beim reinen Backfill entspricht die protokollierte Summe allen tatsächlich beantworteten Backfill-Aufrufen, einschließlich einer gegebenenfalls nötigen Qualitätskorrektur.

## Backfill

`npm run news:media-impact:backfill` ist standardmäßig ein Dry Run. Eine kontrollierte Ausführung verwendet `--execute --limit=N`. Der Prozess:

1. scannt veröffentlichte Akten lokal;
2. wählt nur Trigger-Treffer ohne aktuelle Fingerprint-Version;
3. analysiert ausschließlich Medien- und Sprachwirkung;
4. bewahrt Quellen, Claims, Quellenzusammenfassung und bestehende Fakten;
5. hängt eine neue Version an;
6. stoppt am bestehenden Monatsbudget;
7. gliedert eine inhaltlich vollständige Ersatzfassung bei Bedarf deterministisch an einer Satzgrenze in zwei Absätze, fordert bei anderen formalen Mängeln höchstens eine gezielte Qualitätskorrektur an und hält den Fall danach weiterhin zurück;
8. leitet objektiv erkennbare Angaben wie die Verwendung eines Frame-Begriffs in der Überschrift deterministisch aus den gespeicherten Feldern ab und normalisiert widersprüchliche Altangaben ohne KI-Aufruf;
9. entfernt automatisch einen früher sichtbaren Mediencheck, wenn eine verschärfte lokale Triggerregel ihn nicht mehr als relevant einstuft und kein zum unveränderten Quellenstand gespeicherter, qualitätsgeprüfter Triggerbefund vorliegt;
10. ist bei unverändertem Quellenstand idempotent.

Der GitHub-Workflow bietet dafür die manuellen Eingaben `media_impact_backfill` und `media_impact_limit`. Nach einer Methodenversion wird der Vollbestand lokal neu gescannt; nur tatsächliche Trigger-Treffer werden KI-gestützt ergänzt. Der Prozess ist idempotent und verändert keine Fakten- oder Quellenakte.

Für eine bereits redaktionell geprüfte Ergänzung unterstützt der vorhandene Intake `publish-reviewed.mjs` auch `review_type:media_impact`. Er prüft Quellenfingerabdruck, Source Integrity und die Publikationsgates, bewahrt Quellen, Claims, Ereignis-ID, URL, Erstpublikation, Scores und historische Versionen und ergänzt eine Version mit öffentlichem Korrekturhinweis. Der Review-Fingerabdruck verhindert Doppelanwendung. Das ist keine erneute KI-API-Analyse; es wird keine fiktive Tokenabrechnung erzeugt.

Regression Seelze, 6. September 2026: Originalüberschrift und bereits geprüfte Ereignisangaben bleiben erhalten; eigener Titel sachverhaltszentriert. Technische Relevanz bleibt ausdrücklich möglich. Keine Gleichsetzung Rollstuhl/Elektroauto, keine vergleichende Brandstatistik, keine behauptete Manipulation oder beobachtete Rezeption. Der lokale Vergleich am Bestand mit 98 veröffentlichten, gelisteten Akten ergibt 8 → 9 Trigger-Treffer, also einen zusätzlichen Prüffall. Kein kostenpflichtiger Gesamtbackfill.

## Testabdeckung

`tests/news/media-impact.test.mjs` prüft neutrale Meldungen einschließlich technischer Alarme, Attribution, direkte und indirekte Zitate, offene Ermittlungen, Headline-Text-Abweichung, politisch symmetrische Frame-Beispiele, Herkunftsevidenz, Medienvergleich, Self-Frame-Rewrite, Absichtszuschreibung, Wirkungsüberbehauptung, Outlet-Scores, Prompt-Injection-Grenze, Backfill-Idempotenz, automatische Trigger-Bereinigung, begrenzte Qualitätskorrektur, Versionierung und Kostenlogging.

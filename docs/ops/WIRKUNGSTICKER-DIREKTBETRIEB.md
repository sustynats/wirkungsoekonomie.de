# Wirkungsticker: Direktbetrieb (seit 15.09.2026)

Verbindliche Betriebsarchitektur des Wirkungstickers. Sie ersetzt die Dropbox-ChatGPT-Bridge
(10.-15.09.2026) und die frühere Oracle-Proxy-Lane. Entscheidung: Natalie, 15.09.2026.

## Betriebsschalter und Wiederanlauf (23.09.2026)

### Quellengebundene Ereigniszuordnung Musk/Starlink (25.10.2026)

Zwei registrierte Stern-Quellenfassungen wurden als getrennte Erstmeldungen
angelegt: `wt-a083782d5fd928e5` und `wt-bb275c9f8adec8d7`. Beide beschreiben
denselben zugeschriebenen Musk-Vorwurf zur ukrainischen Starlink-Nutzung fuer
Drohnenangriffe. Die zweite Fassung ergaenzt seine Aussage zu einer angeblich
geschlossenen Luecke; das ist keine unabhaengige Bestaetigung oder ein zweites
Ereignis. Die Quellenbindung umfasst die URLs mit den Dokumentkennungen
`38447346` und `38447638` samt ihren gespeicherten Inhalts-Hashes.

`consolidate-starlink-duplicates.mjs` ordnet ausschliesslich diese beiden
unveraenderten V1-Fassungen im normalen seriellen Lauf zu. Die aeltere Akte
bleibt gelistet, die zweite vollstaendig und mit sichtbarem Archivhinweis
lesbar. Texte, ergaenzende Angaben, Quellen, Bewertungen, Publikationsdaten,
Versionshistorie und bezahlte Antworten bleiben unveraendert erhalten. Es
entsteht weder eine neue Bewertung noch eine neue Quellenaussage.

Geaenderte Quellen oder Fassungen, offene Nachpruefungen, unbekannte
Anbieteranfragen, persoenliche Freigaben und abweichende Routingmarker sperren
die Erstzuordnung atomar. Die blosse Vereinigung der beiden bereits bezahlten
Quellenpakete kauft keine Ersatzantwort; echte neue Evidenz und ausdrueckliche
Nachpruefungen behalten saemtliche bisherigen Gates. Kein allgemeiner
Starlink-/Musk-/Ukraine-Matcher, keine Budget-, Modell- oder Kontingentaenderung.
Die Ruecknahme erfordert eine gepruefte Routingkorrektur; historische Texte
oder bezahlte Antworten duerfen dabei nicht geloescht werden.

### Unklarer Ausgang eines gestarteten Nachrichtenaufrufs (24.10.2026)

Ein Timeout, Verbindungsabbruch oder 5xx ohne bestaetigte rohe Antwort beweist
nicht, dass der Anbieter keine Generierung begonnen hat. Der normale Worker
behaelt deshalb seine Kostenreservierung und einen dauerhaften
`provider_request_hold` mit Status `AI_PROVIDER_OUTCOME_UNKNOWN`. Die Akte
wartet auf belegte Klaerung, nicht auf einen automatischen weiteren Aufruf.
Ein neuer Zeitabschnitt, neue Quellen, Neubewertung oder Zusammenfuehrung
duerfen diese unbekannte Schreibwirkung nicht als erledigt behandeln.
Explizit nachgewiesene lokale bzw. Nicht-Ausfuehrungs-Ablehnungen bleiben
getrennt; weder Budget, Modell, Kontingent noch bezahlte Antwort wird geaendert.

Der erste Altfall ist durch Run `40092521984`, Report an
`dc50ae574025c2f6fe60519f02d9b9e3929d8a40` und dessen SHA-256
`3118e1eb2c0b553951d4016c1a0fc666c5ffd8c98245c5abf73ddae97fae6f71`
belegt: `wt-a2be1b69b19102aa`, Anbieterfehler 520. Seine Sperre rekonstruiert
keine unbekannte Anbieterantwort und veraendert keinen veroeffentlichten Text.
Eine Aufhebung erfordert bestaetigte Ausfuehrungs-/Rohantwortbelege und eine
gesondert gepruefte Fortsetzung; keine automatische Entsperrung.

### Ergaenzung vom 01.10.2026: jede neue beobachtete Folge als privater Entwurf

Fuer alle aktiv konfigurierten Sendungen und Podcasts ist kein neuer Einzelauftrag
noetig. `scripts/news/sendungs-kandidaten.mjs` uebergibt neue Folgen in die bestehende
private Redaktionsspur. Die fruehere Nur-Metadaten-Ausnahme fuer Machtwechsel und
ihr zusaetzlicher Themenfilter entfallen. Unbearbeitete technische Beobachtungs-HOLDs
werden ohne zweite Job-ID uebernommen; bereits bearbeitete oder freigegebene
Fassungen bleiben geschuetzt. Ausstehende Episodenmetadaten bleiben im vorhandenen
Beobachtungsspeicher erhalten, auch wenn das Tageskontingent voll ist oder die Folge
spaeter aus dem Feedfenster faellt. Quellen-/Wortlautpruefung, Zugriffsschutz,
Dublettenpruefung und unveraenderte Lauf-, Tages- und Transkriptionslimits gelten
weiter. Keine automatische Veroeffentlichung: `single_final_approval` bleibt
verbindlich. Details und Ruecknahme: `docs/news/PRIVATE-EDITORIAL.md`.

### Korrektur vom 25.09.2026: unabhängige Redaktionsspur

Natalie hat die Kopplung von Nachrichten und Nachbesprechungen/Analysen ausdrücklich
aufgehoben. Die nachstehenden historischen Hinweise auf ein gemeinsames Kontingent
sind damit überholt. Die Redaktion zählt nur eigene Entwürfe (standardmäßig zwei je
Stunde, `WOEK_EDITORIAL_MAX_JOBS_PER_HOUR`); ihr vorhandener Tagesdeckel, Quellenprüfung,
Einmalverarbeitung und `single_final_approval` bleiben erhalten. Die Nachrichtenspur
zieht weder Redaktionsentwürfe noch Reservierungen ab. Nachrichten-Monatsbudget und
Tag-/Nachtprofil werden nicht verändert. Unabhängigkeit bedeutet nicht Kostenfreiheit:
Redaktions- und Transkriptionskosten werden weiterhin separat protokolliert.

Die Sendungszuordnung berücksichtigt den ursprünglichen Zeitstempel der Auftrags-ID,
nicht allein das durch Nachrecherche veränderte `created_at`. Vergleichssendungen und
Nachrecherche-Vermerke bestimmen nicht den Gegenstand. Damit sperrt ein alter
Hart-aber-fair-Auftrag keine neuen Lanz-/Illner-Ausgaben. Keine historischen Aufträge
werden gelöscht, keine Zustimmung wird erzeugt und keine alte Folge neu veröffentlicht.

Ein gesperrtes YouTube-Video blockiert nicht mehr die gesamte Sendungsreihe. Ist eine
offizielle Podcastfassung konfiguriert, darf ausschließlich eine eindeutig nach Titel
und Veröffentlichungszeit zugeordnete Langfassung als **Nachgehört** weiterlaufen;
deren Wortlaut muss weiterhin vorliegen. Daraus werden keine visuellen Beobachtungen
abgeleitet. Ohne sichere Zuordnung bleibt die Folge mit sichtbarem Fehler zurück.

Ergaenzung vom 12.10.2026: Fehlt bereits der YouTube-Kanalfeed (HTTP 404/410),
darf die ausdruecklich konfigurierte offizielle Podcastreihe direkt beobachtet
werden. Nur zeitlich passende Langfassungen mit belegter Dauer, Episodenseite
und Audioquelle werden als Nachgehoert weitergegeben. RSS-GUID, Originaldatum,
Wortlautquellen und der sichtbare Kanalfeedfehler bleiben erhalten. Das ist
keine Behauptung eines gesehenen Videos. Bei 401/403, Ratenbegrenzung oder
anderen Zugriffsfehlern greift diese Wiederaufnahme nicht. Fehlender Wortlaut,
Dubletten, Kosten-/Mengengrenzen und Natalies Schlussfreigabe bleiben bindend.

Ergaenzung vom 12.10.2026: Bei wachsenden Nachrichtenakten werden auch faellige
Nachverfolgungen (`currentness.followups_due`) in der vorhandenen verlustfreien
`cells-v2`-Tabellenverpackung uebertragen. Reihenfolge, Kennungen, Wortlaut,
Quellen, Termine, Status sowie ausdrueckliche Nullwerte bleiben rekonstruierbar;
einstimmig vorhandene identische Skalarfelder werden einmal als
`currentness.followup_defaults` gespeichert und je Zeile wieder ergaenzt.
Fehlende und nullbelegte Felder bleiben verschieden. Kein historischer Eintrag
wird entfernt oder als erledigt markiert. Alte Pakete
bleiben lesbar. Die Eingabegroessen-, Quellen-, Kosten- und Publikationsgates
gelten unveraendert; ein technisch zu grosses Paket loest keinen Anbieteraufruf aus.

Der Worker prüft die letzte persönliche Hauptsektion bereits vor der Übergabe an die
Redaktionsapp. Archivierte, abgewiesene Antworten können ohne neuen Modellaufruf erneut
übergeben werden, wenn ausschließlich bestehende technische Normalisierungen genügen
(etwa „Quellen und Werkmetadaten“ → „Quellen“). Originalhash, aktuelle Auftragsbindung
und sämtliche Inhaltsgates werden geprüft; das Original bleibt im Fehlerarchiv. Keine
fehlende Einordnung wird ergänzt, keine Freigabe erteilt, keine Ausgabe überschrieben.

Natalie hat am 23.09. ausdrücklich den Wiederanlauf angeordnet. Eine veraltete lokale
Überwachungsanweisung hatte die Pause des früheren Oracle-Processors vom 14.09. erneut
auf die inzwischen aktiven GitHub-Routen übertragen. Diese zusätzliche Sperre ist
aufzuheben, nicht die heutigen Budget-, Quellen-, Qualitäts- oder Freigabegates.

- Nachrichten: `WOEK_NEWS_AI_ENABLED` als Repository-Variable, standardmäßig `true`;
  ein ausdrücklich gesetztes `false` pausiert die Analyse, nicht den Import.
- Redaktion: `WOEK_EDITORIAL_PAID_ENABLED=true` erlaubt die Entwurfserstellung;
  `false` pausiert sie ausdrücklich. Veröffentlichung bleibt an die finale Freigabe gebunden.
- Transkription: `WOEK_EPISODE_TRANSCRIBE`, standardmäßig `true`, erst nach dem bestehenden
  Untertitel-Wartefenster und innerhalb des bisherigen Tagesdeckels.
- Der historische Oracle-Processor bleibt deaktiviert, damit kein paralleler Verarbeitungspfad
  entsteht. Sein Status ist kein Auftrag, aktive GitHub-Workflows zu sperren.

Überwachung muss den aktuellen Auftrag und diese Architektur berücksichtigen; historische
Handover-Pausen dürfen nicht still als neue Bedienanweisung wirken. Ein grüner Lauf mit
übersprungener Entwurfserstellung belegt keine Verarbeitung. Nach Wiederanlauf die tatsächlich
ausgeführten Schritte und Ergebnisse prüfen. Budgets, Modelle und Mengenlimits bleiben unverändert.

## Warum

Die Bridge hatte fünf Übergabepunkte (GitHub → Oracle-SQLite → Dropbox → ChatGPT-Worker →
Dropbox → Oracle → GitHub) und zusätzlich eine zweite ChatGPT-Prüfung je Meldung. Jeder Punkt
konnte hängen; am 15.09. lagen 801 Meldungen bis zu acht Tage in der Warteschlange, 276
Aufträge waren „geclaimt“ und nie geliefert, und die Worker lieferten für Planet und
Demokratie meist `insufficient_basis` statt eines modellierten Wirkungspotenzials. Über 30
Patches in zwei Tagen behandelten Symptome dieser Kette.

## Die gerade Linie

Ein einziger Workflow `.github/workflows/wirkungsticker.yml`, alle 15 Minuten. Zeitgeber sind der
GitHub-Cron auf versetzten Minuten (:04/:19/:34/:49) **und** der Oracle-Takt (systemd-Timer,
leerer Commit mit aktuellem main-Baum auf `codex/wirkungsticker-clock`); am 15.09.2026 feuerte der
GitHub-Cron für dieses Repository nur alle vier bis fünf Stunden. Die Workflow-Concurrency verhindert
Doppelläufe.

1. **Einsammeln** (kostenlos): amtliche Feeds aus `content/news/source-registry.json` plus die
   aktive Discovery über freigegebene Indizes (`scripts/news/active-discovery.mjs`).
2. **Lokal bewerten** (kostenlos, deterministisch): Dedupe, Ereignis-Clustering, Relevanz-
   und Ereignisbewertung (`preAnalyzeStory`, `event-relevance.mjs`). Reihenfolge LIFO:
   frische Meldungen zuerst, beauftragte Potenzial-Neubewertungen dahinter, kein Altbestand.
3. **Genau ein OpenAI-Aufruf je Meldung** (`scripts/news/openai-transport.mjs`): Responses API,
   JSON-Modus, Systemanweisung „ein Durchgang, veröffentlichungsreif, alle drei Dimensionen
   modelliert, zweiter Recherchepass im selben Durchgang“. Der Aufruf liefert das komplette
   Paket: Quellenzusammenfassung, WÖk-Einordnung, Claim-Ledger, Publikationsgate und
   `impact_assessment` 2.1 (Mensch, Planet, Demokratie mit sechs Faktoren je Pfad).
4. **Deterministische Ableitung**: Tragweite, Richtung und Dominanz werden aus den sechs
   Faktoren des Modells nachgerechnet (`deriveAssessmentCalculations`); die Spanne wird nur
   auf den nachgerechneten Punktwert eingeschnappt. Nichts Redaktionelles wird erfunden.
5. **Deterministisches Gate** (`scripts/news/impact-gate.mjs`): `validateAnalysis`,
   `impactAssessmentErrors`, `semanticIssues`, `modelledPublicationIssues`. Nur ein
   vollständiges, quellengebundenes Profil mit drei modellierten Dimensionen wird als
   `publication_status: ready` freigegeben und mit `impact_semantic_review` (Modus
   `deterministic-gate-2`; seit 16.09.: der gezielte zweite Recherchepass gilt als
   abgeschlossen, wenn `research_check` completed ist und jeder Hauptpfad jeder Dimension `research_pass`
   second_pass mit geschriebenem `research_result` trägt; erst dann darf eine zentrale Dimension bei hoher
   Systemrelevanz ausdrücklich offen bleiben) versehen. Erst dann rendern Ring und Balken öffentlich.
6. **Build → Commit → Pages** wie bisher (`build.mjs`, `publish-git.mjs`, `deploy.yml`
   ticker-only), anschließend `news:health`.

## Kostenregeln

- **Oktober-Freigabe vom 01.10.2026:** Natalie hat die zuletzt vorgeschlagene interne
  Ausgabengrenze von 110 EUR freigegeben (`NEWS_AI_BUDGET_OCTOBER_EXTENSION`). Sie gilt
  ab 01.10.2026, 04:15:56 UTC, bis 01.11.2026, 00:00 UTC, entsprechend dem
  Monatswechsel des Kostenjournals. Keine rueckwirkende Aenderung der September-
  oder frueheren Oktober-Freigaben. Dies ist eine Obergrenze, kein Ausgabenziel,
  kein Guthabenkauf und keine Aenderung des bei OpenAI eingerichteten automatischen
  Aufladens. Steuer-/Wechselkursreserven, Budgetstufen, Durchsatzgrenzen, gespeicherte
  Kosten, Qualitaetsgates und persoenliche Freigaben bleiben unveraendert.
- **Höchstens zwei bezahlte Versuche je Eingabestand.** `WOEK_NEWS_MAX_PAID_ATTEMPTS_PER_INPUT=2`:
  Scheitert das Gate an einem strukturellen Fehler (fehlende Felder, Faktoren, Formate), folgt nach
  15 Minuten Backoff genau ein zweiter Versuch mit denselben Quellen (mit luna rund 1 Cent).
  Inhaltliche Ablehnungen (nicht materiell, Dublette, Evidenz unzureichend) werden nie erneut
  bezahlt. Danach bleibt die Meldung als `AI_ATTEMPT_LIMIT_REACHED` sichtbar liegen; erst neue
  Evidenz (anderer Fingerprint) löst erneut aus. Es gibt keine Zweitprüfung und keinen Review-Kindjob.
- Transportfehler ohne Modellantwort (Timeout, 5xx, 429) sind kein bezahlter Versuch; höchstens
  ein zweiter Transportversuch, nie ein dritter. 401/403 bricht sofort ab.
- Einzige Ausnahme von der Ein-Versuch-Regel: eine formal unbrauchbare Anbieterantwort
  (`AI_OUTPUT_INVALID`, kein gültiges JSON) darf nach Backoff genau einmal wiederholt werden.
  Inhaltliche Gate-Ablehnungen werden nie wiederholt.
- LIFO-Horizont `WOEK_NEWS_MAX_SOURCE_AGE_HOURS` (Standard 24; 0 schaltet ab, nur für Tests).
- Kapazität: `WOEK_NEWS_MAX_AI_STORIES_PER_RUN` (Standard 4 je Viertelstunde),
  `WOEK_NEWS_MAX_AI_CALLS_PER_HOUR` (Standard 12). Monatsbudget und Stufen unverändert in
  `scripts/news/budget.mjs` (70 % / 85 % / 95 %).
- Reasoning-Aufwand über `WOEK_NEWS_REASONING_EFFORT` (Standard seit 15.09. abends `medium`:
  `gpt-5.6-luna` entgleiste bei `low` in zwei von vier Antworten im hinteren Teil, Planet und
  Demokratie kamen als Fragmente; bei `gpt-5.4-mini` hatte `medium` nur die Ausgabe-Token
  verdoppelt). Jede bezahlte Antwort wird als privates Laufartefakt `ai-raw-output-<run>`
  (3 Tage) gesichert, damit Gate-Fehler erklärbar sind.
- Ausgabebudget je Aufruf `WOEK_NEWS_MAX_OUTPUT_TOKENS` (Standard 32 000 seit 16.09.; bei mittlerem
  Denkaufwand zählen Reasoning-Token mit, zwei Antworten der Nacht brachen bei 24 000 ab).
- Der Transport ergänzt nie Inhalte. Er wandelt Typen (Zahlen-Strings → Zahlen, Boolean-Strings
  → Booleans), rechnet die Tragweite aus den gelieferten Faktoren nach und repariert seit
  15.09. abends deterministisch drei Etikettfehler, die sonst ganze Bindungsketten kippten
  (Lauf 7: „rbb24“ statt `rbb24-nachrichten` ließ alle Faktoren als fehlend erscheinen):
  Quellenkennungen werden auf die gelieferten `source_id` abgebildet (exakt, normalisiert,
  eindeutiges Präfix, eindeutiger Verlagsname; nicht Zuordenbares wird verworfen, nie
  ergänzt), Nebenpfade (`side_effect`, `side_risk`) wandern aus `primary_paths` nach
  `secondary_paths`, `data_status: missing` einer modellierten Dimension wird `modelled`,
  Textfragmente an Pfadstellen werden verworfen, Nebenpfade ohne vollständige sechs Faktoren
  ebenso (ein halb geschriebener Nebenpfad hatte sonst die ganze Dimension blockiert), und
  `protection_boundary.decisive` auf einem nicht negativen Pfad wird zurückgesetzt (Schutzgrenze
  ist nur für negative Pfade eine Untergrenze). Jede Reparatur steht im Analyseobjekt unter
  `transport_repairs`. Ein unvollständiger Hauptpfad bleibt unvollständig und fällt im Gate durch.
- **Der erste Aufruf ist schemagebunden (seit 16.09., nach der Inventur):** Über 37 Läufe
  scheiterten 58 von 72 Meldungen im Gate, davon vier von fünf an fehlenden oder falsch
  getypten Feldern und an Textlängen, nicht an fehlender Substanz. `scripts/news/analysis-json-schema.mjs`
  erzwingt deshalb die vollständige Antwort: jeder Schlüssel Pflicht, jede Aufzählung festgelegt,
  keine Zusatzfelder, `impact_assessment` eingebettet (42 KB, 583 Eigenschaften, Verschachtelung 10,
  innerhalb der Anbietergrenzen). Die Analyse ist die Wurzel der Antwort, weil ein Aufruf genau eine
  Meldung trägt; der Transport verpackt sie wieder in `analyses`. Die Aufzählungen stammen aus den
  Prüfmodulen, damit Schema und Gate nicht auseinanderlaufen. `visuals` und `media_impact` bleiben in
  diesem Aufruf leer (der Prompt verzichtet dann auch auf die Bildregeln); bei lokal erkanntem
  Medienanlass (`media_trigger.relevant`) läuft der Aufruf weiterhin ohne Schemazwang, weil
  `media_impact` dort ein offenes Objekt ist. Lehnt der Anbieter das Schema ab (HTTP 400), läuft
  derselbe Versuch ohne Schema weiter; das ist kein bezahlter Versuch. Abschaltbar mit
  `WOEK_NEWS_ANALYSIS_SCHEMA=false`.
- **Eine gezielte Nachlieferung je Meldung (seit 16.09.):** Das Modell liefert in rund der Hälfte
  der Antworten die Lesertexte vollständig und lässt dann `impact_assessment` weg oder halb
  geschrieben (gemessen bei `low` und `medium`). Ein zweiter voller Versuch im nächsten Lauf
  wiederholt das nur. Deshalb prüft der Transport direkt nach der Antwort die deterministischen
  Gate-Befunde des Bewertungsobjekts (`assessmentIssues`) und macht bei Befund **genau einen**
  Folgeaufruf im selben Lauf, der mit denselben Quellen und den konkreten Befunden ausschließlich
  `impact_assessment` nachliefert (16k Ausgabe-Token, Rohkopie `…-nachlieferung.json`). Texte
  und Quellen bleiben, wie geantwortet; Ablehnungen (`publication_recommendation: false`) werden
  nie nachgefordert. Token beider Aufrufe fließen in denselben Kostenbeleg, der Folgeaufruf zählt
  im Stundendeckel (`repair_calls`). Abschaltbar mit `WOEK_NEWS_ASSESSMENT_REPAIR=false`. Das ist
  die bewusste Ausnahme von „ein Aufruf je Meldung“: höchstens zwei, der zweite klein und nur bei
  strukturellem Befund. **Der Folgeaufruf ist seit 16.09. schemagebunden** (`scripts/news/impact-json-schema.mjs`,
  `text.format` = `json_schema` mit `strict: true`, Enums aus den Vertragsmodulen, damit Schema und Gate nicht
  auseinanderlaufen): eine schemagebundene Antwort kann keinen Schlüssel weglassen, das Gate beurteilt nur noch
  den Inhalt. Lehnt der Anbieter das Schema ab (HTTP 400), folgt genau ein weiterer Versuch im einfachen
  JSON-Modus; abschaltbar mit `WOEK_NEWS_REPAIR_SCHEMA=false`.
- Betriebsmodell seit 15.09.2026 abends: `gpt-5.6-luna` (Variable `WOEK_NEWS_MODEL`, Entscheidung
  Natalie); September-Freigabe auf 100 EUR angehoben (`NEWS_AI_BUDGET_DIRECT_OPERATION`).
- Modell über Repository-Variable `WOEK_NEWS_MODEL` (Code-Standard `gpt-5.4-mini`; zugelassen
  `gpt-5.5`, `gpt-5.6-luna`, technisch auch `gpt-6-astra`). Richtwerte je Meldung bei rund 11k Eingabe- und 4k Ausgabe-Token:
  `gpt-5.6-luna` ≈ 0,7 Cent, `gpt-5.4-mini` ≈ 2,6 Cent, `gpt-5.5` ≈ 18 Cent.
- Seit 21.09.2026 ist Astra **nicht** das globale Nachrichtenmodell. Der
  Redaktionsworker routet ausschließlich manuell beauftragte Ausgaben von
  `opinion_analysis` über `WOEK_EDITORIAL_ANALYSIS_MODEL=gpt-6-astra`; seine
  übrigen Formate verwenden `WOEK_EDITORIAL_MODEL=gpt-5.6-luna`. Begründung,
  Kostenmessung und Rollback: `docs/ops/WIRKUNGSTICKER-GPT-6-ASTRA-MIGRATION.md`.

## Schlüssel und Variablen

- Secret `WIRKUNGSTICKER` = OpenAI-API-Schlüssel (von Natalie am 15.09.2026 angelegt). Er wird
  im Workflow als `OPENAI_API_KEY` gesetzt und liegt nirgends im Repository.
- Variable `WIRKUNGSTICKER_PROCESSING_MODE=api`. Der Wert `dropbox_chatgpt_bridge` schaltet den
  Direktbetrieb ab; die Bridge-Workflows bleiben nur als Historie lesbar.
- `WOEK_NEWS_BRIDGE_DISCOVERY_ENABLED=false`, `WOEK_NEWS_BATCH_ENABLED=false`.

## Neustart und Reparatur (15.09.2026)

- `scripts/news/retire-backlog.mjs`: Alle unveröffentlichten Kandidaten der alten Warteschlange
  wurden mit `BACKLOG_RETIRED_DIRECT_OPERATION_2026_09_15` geschlossen, offene Aktualisierungen
  veröffentlichter Meldungen verworfen. Veröffentlichte Texte blieben unverändert.
- `scripts/news/queue-reassessment.mjs --limit=30`: Die jüngsten Online-Meldungen ohne
  vollständiges freigegebenes Profil erhalten `pending_update.impact_reassessment` und werden
  im regulären Lauf mit genau einem Aufruf neu gefasst (Modus `impact_potential_reassessment`,
  Version +1, Veröffentlichungsdatum bleibt). Seit 16.09. fester Schritt jedes Laufs (Limit
  `WOEK_NEWS_REASSESS_LIMIT`, Standard 30; Workflow-Input `reassess_limit` übersteuert), denn am
  15.09. hatte ein einziger Vertagungsvermerk (`AI_BUDGET_OR_BATCH_LIMIT`) den Aktualisierungs-
  vermerk der Meldungen neu geschrieben und die Markierung gelöscht: null Meldungen in der
  Reparaturschlange, alte Meldungen blieben ohne Balken. Die Markierung überlebt jetzt jeden
  Vertagungsvermerk, und `partitionAiQueue` reserviert je Lauf einen Platz für eine wartende
  Neufassung, damit der frische Nachrichtenstrom sie nicht verdrängt.

## Private Redaktion (Meinung & Analyse, Nachgehört/Nachgesehen, Buch & Wirkung)

Eingabe und Freigabe bleiben in der Redaktionsapp (`admin/redaktion`, Oracle). Neu seit dem
15.09.2026 abends: **Der Redaktionsworker in GitHub** (`.github/workflows/redaktionsworker.yml`,
`scripts/news/redaktionsworker.mjs`, alle 15 Minuten versetzt zum Nachrichtenlauf) übernimmt die
Rolle der früheren ChatGPT-Worker ohne Serverzugang:

1. Er hält die Import-Sperre über die vorhandene authentifizierte Oracle-Schnittstelle, liest
   offene Aufträge (`editorial_request`, Status `queued`), übernimmt das Eingabepaket atomar
   (`00_INBOX` → `10_CLAIMED`) und macht **genau einen** OpenAI-Aufruf mit dem unveränderten
   Redaktionsvertrag (`EDITORIAL_REQUEST_CONTRACT_V4`, Wissensprofil `editorialKnowledge`).
2. Die Antwort wird mit den bestehenden Regeln geprüft (`validateApiOutput`, Vorschau- und
   Quellenprüfung) und als `20_OUTPUT_READY/<job>.output.json` abgelegt. Die Redaktionsapp holt den
   Entwurf innerhalb einer Minute ab und legt ihn zur Freigabe oder Rückgabe mit Kommentar vor.
3. Eine unbrauchbare oder ungültige Antwort wird einmal privat vermerkt
   (`github-attempt:<job>`) und nie erneut bezahlt; der Auftrag bleibt sichtbar in Bearbeitung.
4. Tagesdeckel `WOEK_EDITORIAL_MAX_JOBS_PER_DAY` (10), je Lauf `WOEK_EDITORIAL_MAX_JOBS_PER_RUN` (2),
   Kosten je Auftrag im privaten Beleg `95_LOGS/processor-github-<job>.json`. Aufträge, die keinen
   Aufruf kosten (bereits geliefert, Versuch verbraucht, frisch anderweitig übernommen), belegen
   keinen bezahlten Platz des Laufs.
5. **Begrenzte Web-Suche** (`WOEK_EDITORIAL_WEB_SEARCH`, Standard an; `WOEK_EDITORIAL_MAX_SEARCHES`,
   Standard 5): Das Wissensprofil wurde für Worker ohne Werkzeuge geschrieben und verlangt bei nicht
   lesbaren Quellen vertragsgemäß einen HOLD (`SOURCE_VERIFICATION_REQUIRED`); die ersten beiden
   Aufträge kamen genau so zurück. Der Worker gibt dem Modell deshalb in demselben einen Aufruf das
   gehostete Web-Suchwerkzeug mit Obergrenze, damit es die im Auftrag verlinkten Quellen tatsächlich
   liest; der Profilsatz „keine Browser-, Such-…tools“ wird dafür durch die Werkzeugregel ersetzt.
   Suchzugriffe werden mit 1 Cent je Zugriff zusätzlich zu den Token verbucht (`web_searches` im Beleg).
6. **Liegengebliebene Übernahmen der Bridge-Ära:** Ein Eingabepaket, das ein abgeschalteter
   ChatGPT-Worker nach `10_CLAIMED` verschoben hatte, blockierte den Auftrag dauerhaft
   (`claimed_elsewhere`). Ist die Übernahme älter als sechs Stunden (`STALE_CLAIM_HOURS`), übernimmt
   der GitHub-Worker sie (`adopted_stale_claim_from` im Vermerk); eine frische Übernahme wird
   weiterhin respektiert.
7. Eine 4xx-Ablehnung der Anfrage (etwa ein unzulässiger Parameter) erzeugt nichts und gilt nicht als
   bezahlter Versuch; nur eine abgeschlossene Generierung verbraucht den einen Versuch je Auftrag.
5. **Kandidaten für Meinung & Analyse** (`scripts/news/redaktions-kandidaten.mjs`, aktiv mit
   `WOEK_EDITORIAL_AUTO_CANDIDATES=true`): Aus stark relevanten, unabhängig belegten Meldungen der
   letzten 48 Stunden entsteht höchstens ein regulärer Auftrag je Lauf, zwei je Tag, je Meldung nur
   einmal. `author_notes` bleiben leer; der Entwurf ist ein Vorschlag, keine Position der Autorin.

Der Nachrichtenworkflow holt freigegebene Fassungen in jedem Lauf ab
(`scripts/news/import-approved-editorials.mjs --claim`) und quittiert erst nach dem erfolgreichen
Push (`--finalize`). Eine gestörte Redaktion hält den Nachrichtenlauf nie an.

8. **Automatische Aufträge (seit 16.09.):** Meinung-&-Analyse-Kandidaten aus stark relevanten
   Meldungen (`scripts/news/redaktions-kandidaten.mjs`, standardmäßig an, `WOEK_EDITORIAL_AUTO_CANDIDATES=false`
   schaltet ab) und **Nachgesehen/Nachgehört aus den Sendungsfeeds** (`scripts/news/sendungs-kandidaten.mjs`,
   Quellen in `data/news/show-feeds.json`: maybrit illner und Lanz + Precht über offizielle ZDF-Podcast-Feeds,
   Markus Lanz, MAITHINK X und Terra X Lesch & Co über den MediathekViewWeb-Feed mit Link auf die
   ZDF-Sendungsseite, NEU DENKEN über den Podigee-Feed). Neue Folgen der letzten sieben Tage werden je
   Lauf höchstens eine, je Tag höchstens drei (`WOEK_EPISODE_CANDIDATES_PER_RUN/_PER_DAY`) als regulärer
   Auftrag eingereiht: `kind` watched/listened, Beschreibung des Anbieters, Sendungsseite und Mediendatei
   als Links. Folgen, die Natalie bereits beauftragt oder veröffentlicht hat, werden über die URL erkannt
   und nicht erneut vorgeschlagen.
   **Wortlaut in drei Stufen (seit 16.09., Hinweis von Natalie auf die Barrierefreiheit):**
   (1) offizielles Podcast-Transkript (`podcast:transcript`, bei Lanz + Precht und NEU DENKEN als VTT),
   (2) **amtliche Untertitel der Sendung** für Hörgeschädigte: Mediathek-Sendungen laufen deshalb über die
   MediathekViewWeb-Abfrage (`mediathek: {title, channel}` in `show-feeds.json`), weil nur sie
   `url_subtitle` mitliefert; EBU-TT/TTML, WebVTT und SRT werden zu Zeilen „HH:MM:SS Text“ gelesen
   (Lanz vom 10.09.: 904 Abschnitte, 48 000 Zeichen, mit Sprecherkürzeln, kostenlos). Fassungen in
   Gebärdensprache und Hörfassungen sind dieselbe Folge; je Folge gewinnt die Fassung mit Untertiteln.
   (3) **eigene Spracherkennung** als letzte Stufe (`WOEK_EPISODE_TRANSCRIBE`, Deckel
   `WOEK_EPISODE_TRANSCRIPTS_PER_DAY`, rund 0,45 USD je Sendung): ffmpeg zieht die Tonspur (mono, 16 kHz,
   32 kbit/s, unter 25 MB), `whisper-1` liefert Segmente mit Zeitmarken.
   Untertitel erscheinen einige Stunden nach der Sendung. Solange `WOEK_EPISODE_SUBTITLE_WAIT_HOURS`
   (18) nicht abgelaufen ist, bleibt eine Folge ohne Wortlaut liegen, statt in eine Rückfrage zu laufen.
   Wurde eine Folge trotzdem ohne Wortlaut eingereiht (vor dieser Regel), darf sie **genau einmal** erneut
   eingereiht werden, sobald ein Wortlaut vorliegt: der erste Auftrag ist nach der Rückfrage verbraucht.
   Der neue Auftrag hat eine eigene Kennung, überschreibt nichts und sagt im Auftragstext, dass er der
   zweite Versuch mit Wortlaut ist;
   der Auftrag nennt die Herkunft des Wortlauts ausdrücklich (amtliche Untertitel sind verbindlich,
   eine eigene Abschrift kann Hörfehler enthalten). Nichts davon wird veröffentlicht.
   `author_notes` bleiben leer; der Entwurf ist ein Vorschlag zur Bestätigung.
9. Tagesdeckel des Workers seit 16.09. auf 16 Aufträge (Rückstand plus Kandidaten).

## Prüfen

### Betriebsbefund und Korrektur vom 08.10.2026

Eine leere Lage beschreibt den Veröffentlichungsstand, nicht das Fehlen
relevanter Ereignisse. Die bisherige Aussage „Keine belastbare neue Entwicklung“
war bei ausgefallener Verarbeitung irreführend. Neue leere Ausgaben sagen jetzt
„Noch keine neue Nachricht ... veröffentlicht“. Ein frischer Laufbericht
(höchstens zwei Stunden alt, nicht aus der Zukunft) ergänzt bei Anbieter-,
Quellen- oder Verarbeitungssperren einen sachlichen Verzögerungshinweis.
Historische Lageüberschriften, Nachrichten und Freigaben werden nicht pauschal
umgeschrieben. Die Startseite und die Detailseite verwenden dieselbe Information.

Der direkte OpenAI-Transport unterscheidet die expliziten 429-Abweisungen
`credit_balance_exhausted`, Organisations-/Projekt-Ausgabengrenzen und
`insufficient_quota` von vorübergehenden Ratenbegrenzungen. Bei einer solchen
Abweisung erfolgt kein zweiter Transportversuch und kein weiterer
Nachrichtenaufruf im selben Lauf. Der Bericht weist eine Anbietersperre aus,
nicht eine erschöpfte lokale Stundengrenze. Eine ausdrückliche erste Ablehnung
ohne Ausgabe oder Nutzungsbeleg verbraucht keine Kostenreserve; vorausgegangene
unklare Anfragen bleiben konservativ behandelt. Historische Kostenjournale
werden nicht nachträglich aufgrund einer pauschalen 429-Kennung geändert.

Diese Korrektur füllt kein Guthaben auf und verändert keine Monats-, Stunden-,
Modell-, Quellen- oder Freigaberegel. Ein Anbieter-Guthabenproblem braucht eine
Bestätigung und gegebenenfalls eine Handlung im tatsächlich verwendeten
Abrechnungskonto. Ein erfolgreicher Test oder Deploy ist kein Nachweis, dass
der Anbieter wieder Entwürfe liefert. Regression: `news-provider-refusal.test.mjs`,
`lage.test.mjs` und `lage-startseite.test.mjs`.

### Betriebsreparatur vom 01.10.2026

- Der Betriebsmonitor benoetigt auch `assets/js/ticker-order.js` im Sparse-Checkout.
  Der Abhaengigkeitstest erfasst jetzt `.js`, `.mjs` und `.cjs`.
- Der lesende Auftragsbefund zeigt den Importspur-Besitzer und den Erwerbszeitpunkt,
  soweit vom Server vorhanden. Bei unlesbarer Queue ist die Zahl verbrauchter
  Auftraege unbekannt (`null`), nicht null Auftraege.
- Bereits eingereihte Entwuerfe laufen vor neuer Vorschlagssuche. Kandidaten warten
  hoechstens 15 Sekunden, Entwuerfe 60 Sekunden auf einen belegten Importplatz;
  zuvor konnten drei Zehn-Minuten-Wartefenster das 25-Minuten-Joblimit aufbrauchen.
  Das ist keine Entsperrung: aktive Besitzer und Natalies Freigabe bleiben geschuetzt.
- Kein reservierter Sicherheitsplatz mehr. Kleine Nachrichtenlaeufe folgen der
  ausbalancierten Rangfolge; Potenzialreparaturen erhalten erst ab vier Plaetzen
  einen reservierten Platz. Die Reparaturauftraege bleiben gespeichert.
- `EDITORIAL_RELEVANCE_BELOW_THRESHOLD` unterscheidet die lokale Vorauswahl vom
  tatsaechlichen Budgetstopp `AI_BUDGET_BLOCKED`.
- MDR-Artikelversionen mit gleicher Dokumentkennung hinter dem Komma werden als
  dasselbe Dokument erkannt. Ortspruefung, Datum und Konfliktschutz bleiben bindend.
  Auch grossgeschriebenes „In“ wird als Ortsangabe erkannt. Zusammenfuehrungen
  behalten historische Texte, Quellen und URLs; neue Belege werden erneut geprueft.
- Die Zahl bei „Freigeben“ zaehlt nur `AWAITING_FINAL_APPROVAL`. Technische
  Klaerungen und unveraenderte Rueckgaben bleiben sichtbar, werden aber nicht
  mehr als neue freigabefaehige Entwuerfe angezeigt. Eine leere Freigabeliste
  wird auch bei vorhandener Historie ausdruecklich erklaert.

Die serverseitige Importsperre ist separat zu pruefen. Ein erfolgreicher Build,
ein erreichbarer Health-Endpunkt oder ein neuer Worker-Start beweist noch keinen
fertigen Entwurf und keine Veroeffentlichung. `process_holds_lock=false` bei
`BRIDGE_RUN_LOCKED` bedeutet: ein anderer lokaler Prozess besitzt die SQLite-Spur.
Kein TTL-Entsperren und kein Loeschen der Datenbank. Vor einem Servereingriff
Besitzer und Aktivitaet feststellen, SQLite-Backup erstellen und den bestehenden
Dienst-/Rollbackweg verwenden. Das private Freigaberegister bleibt massgeblich.

```bash
npm run news:test
WIRKUNGSTICKER_PROCESSING_MODE=api node scripts/news/run-api.mjs --dry-run
npm run news:validate
npm run news:health
```

# Historical Backfill → externe WÖk-Review-Pipeline

## Zweck

Die Übergabestrecke verbindet den amtlichen parlamentarischen Bestand mit einer
begrenzten externen fachlichen Vorarbeit. Sie erzeugt weder automatische
Fachvoten noch eine unmittelbare Veröffentlichung.

```text
DIP-Backfill
  → Historical Decision Registry
  → geprüftes Detailpaket je Case
  → Review-Batch / ZIP
  → externes review-result.json
  → Schema-, Quellen- und Snapshot-Prüfung
  → CHATGPT_REVIEW_PROPOSAL
  → Calculation-/Regel-Engine und gebündelte Editorial Tasks
  → menschliche Freigabe
  → Veröffentlichung
```

Der historische Zeitraum beginnt separat von der Wahlperiode:

```text
legislative_term_start         = 2025-03-25
government_term_start          = 2025-05-06
historical_woek_backfill_start = 2025-05-06
```

## Batch-Auswahl

`createHistoricalReviewBatch()` wählt ausschließlich Fälle mit
`POTENTIAL_MATERIAL` oder `MATERIAL` aus und erstellt für jeden ein Paket. Eine
Quellenlücke bleibt `SOURCE_INCOMPLETE`; insbesondere reicht ein Link auf
DIP-Metadaten nicht: Die relevante finale Entscheidungs-/Gesetzespassage muss
aus der amtlichen Fassung extrahiert und verknüpft sein. Ein solcher Fall wird
nicht für eine substanzielle externe Prüfung exportiert. Partei, Einbringung,
Regierungs-/Oppositionsstatus und Mehrheitsverhältnisse sind keine
Auswahlparameter.

Die Größe ist auf 1–15 Fälle begrenzt (Standard 10). Große Fälle werden durch
die Redaktion einzeln oder in kleineren Chargen angelegt. Die erste fachliche
Kalibrierung wird als `GOLD_STANDARD_CANDIDATE` außerhalb dieser Pipeline
freigegeben und später zu Regression-Fixtures verdichtet.

## Inhalt eines ZIP-Exports

Ein Export erzeugt zur Laufzeit ein ZIP mit:

```text
ALL_DECISIONS.md
decision-registry.jsonl
BATCH.md
cases.json
batch-manifest.json
cases/<case-id>/
  README.md
  case-manifest.json
  fact-package.json
  decision.md
  parliamentary-history.md
  source-manifest.json
  materiality.json
  evidence/ex-ante/README.md
  evidence/ex-post/README.md
  documents/final-decision/README.md
  documents/relevant-previous-versions/README.md
  woek/reference-snapshot.json
  woek/candidate-woek-ids.json
  woek/candidate-normative-mapping.json
  review-request.json
```

`ALL_DECISIONS.md` ist das gesamte, lesbare Entscheidungsregister;
`decision-registry.jsonl` ist dessen maschinenlesbare Form. Ein Batch enthält
nur die ausgewählten Detailpakete. Für nicht ausgewählte Fälle bleibt der
Detailpfad im Register sichtbar, wird aber nicht in dieses ZIP kopiert.

Das Archiv enthält ausdrücklich **nicht**:

- `.env`-Dateien, Schlüssel, Cookies oder Datenbank-Dumps;
- interne Redaktionsnotizen oder personenbezogene Profildaten;
- individuelle Stimmzeilen namentlicher Abstimmungen;
- unbeschränkt kopierte Original-PDFs oder sonstige unnötige Binärdateien.

Amtliche Dokumente werden per Primärquellen-URL, Hash und Fundstellenhinweis
referenziert. Falls eine konkrete Fundstelle noch nicht extrahiert ist, steht
das sichtbar als `DATA_GAP` im Paket.

## Zeitgrenze und Quellenprüfung

`source-manifest.json` klassifiziert jede exportierte Quelle:

- `AVAILABLE_AT_DECISION_TIME`: zulässig für die Ex-ante-Perspektive;
- `PUBLISHED_AFTER_DECISION`: nur Ex-post;
- `CURRENT_REFERENCE`: methodische WÖk-Referenz, keine politische Tatsache.

Der Export enthält den versionierten Snapshot
`woek-leading-references-2026-08-14`. Er verweist auf die führenden Werke im
`reference-manifest.yaml`; er kopiert nicht die gesamte Wissensbasis in einen
externen Kontext.

## Reimport

Der geschützte Redaktionsbereich akzeptiert ausschließlich eine einzelne
`review-result.json` aus einem zuvor exportierten Batch. Der Validator prüft:

1. Schema und `case_id`;
2. die Ex-ante-Wissensgrenze gegen das Entscheidungsdatum;
3. jede benutzte Quellen-ID gegen das exportierte Quellenmanifest;
4. den WÖk-Referenzsnapshot;
5. den Paket-Hash, den `review-request.json` vorgibt und die Antwort in
   `provenance.exported_package_hash` zurückgibt.

Bei einem Fehler wird die Übernahme verhindert bzw. als fehlerhafte
Prüfung protokolliert. Bei Erfolg entsteht zunächst ein
`CHATGPT_REVIEW_PROPOSAL` (auch nach dem späteren Validierungsstatus als
unveränderliche Herkunft). Das System erzeugt maximal vier gebündelte Aufgaben
für Evidenz, Berechnungseingaben, Gegenfaktum und normative Grenzen. Es legt
keine Berechnungsoperanden, Claims, historische Endbewertung oder öffentliche
Seiten direkt an.

Numerische Modellwerte mit `AI_GENERATED_NUMERIC_VALUE` werden lediglich als
Warnung dokumentiert; sie werden niemals produktive Calculation Operands. Der
zulässige Folgezustand ist `DATA_GAP`, eine belegte Quelle oder eine
redaktionell dokumentierte Entscheidung.

## Benachrichtigungen

Die Pipeline legt ausschließlich ein minimales Ereignis in
`editorial_notification_outbox` ab. Ein vorhandener
`WoekNotificationService`/Discord-Adapter darf daraus nur Fall-ID,
Task-Anzahl und Deep Link im geschützten Backend senden. Ohne konfigurierten
Adapter wird keine externe Nachricht versendet.

## Nicht Bestandteil des MVP

- direkte externe KI-API-Verbindung;
- automatische Übernahme oder Veröffentlichung eines Review-Ergebnisses;
- Bewertung oder Profilbildung einzelner Menschen, Parteien oder Fraktionen;
- Rekonstruktion individueller Stimmen aus nicht namentlichen Abstimmungen;
- Speicherung öffentlicher Quellendokumente auf GitHub.

Damit bleibt der einfache MVP-Ablauf: Batch im Backend erstellen → ZIP sicher
hochladen → strukturierte JSON-Datei zurückerhalten → im Backend prüfen und
als Aufgaben vorbereiten.

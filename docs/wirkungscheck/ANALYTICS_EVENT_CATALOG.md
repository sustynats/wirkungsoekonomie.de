# Analytics Event Catalog

Status: implementiert im Collector (v1.0)
Schema-Version: `1.0`

## Gemeinsames, striktes Ereignisformat

Jedes Product-Analytics-Ereignis enthält ausschließlich diese Felder:

```ts
type AnalyticsEvent = {
  eventName: EventName;
  schemaVersion: "1.0";
  timestamp: string; // ISO-8601, höchstens fünf Minuten in der Zukunft
  pageKey?: PageKey;
  stepIndex?: number; // registrierter positiver Ganzzahlwert
  questionType?: QuestionType;
  componentType?: ComponentType;
  viewportClass?: "mobile" | "tablet" | "desktop";
  locale?: "de-DE";
  durationBucket?: "lt_10s" | "10_30s" | "30_60s" | "1_2m" | "gt_2m";
  clientEventId: string; // UUID v4
};
```

Das Schema ist `strict`: zusätzliche Felder führen zur Ablehnung. `pageKey`, `questionType` und
`componentType` sind registrierte Enums, keine freien Texte. Insbesondere nicht zulässig sind
E-Mail, Name, Partei, Fraktion, Einladungscode, Zugangspass, Survey-Response-ID, exakter
Wahlkreis, Antwortwert, Freitext, Recommendation-ID, personenbezogene IDs, IP-Adresse und roher
User-Agent.

## Ereignisse

| Event | Zweck | Zulässige optionale Properties | Datenschutzklasse | Raw TTL |
| --- | --- | --- | --- | --- |
| `SURVEY_STARTED` | Befragung hat begonnen | `pageKey`, `viewportClass`, `locale` | Product, pseudonymfrei | 72 h |
| `STEP_VIEWED` | Befragungsschritt angezeigt | `pageKey`, `stepIndex`, `viewportClass` | Product, pseudonymfrei | 72 h |
| `STEP_BACK_NAVIGATED` | Zurücknavigation im Befragungsschritt | `stepIndex` | Product, pseudonymfrei | 72 h |
| `QUESTION_VIEWED` | Frage angezeigt, ohne Antwortinhalt | `stepIndex`, `questionType` | Product, pseudonymfrei | 72 h |
| `QUESTION_COMPLETED` | Frage ohne Antwortwert abgeschlossen | `stepIndex`, `questionType`, `durationBucket` | Product, pseudonymfrei | 72 h |
| `QUESTION_SKIPPED` | Frage ohne Angabe übersprungen | `stepIndex`, `questionType` | Product, pseudonymfrei | 72 h |
| `ANSWER_CHANGED` | Antwort geändert, ohne alten oder neuen Wert | `stepIndex`, `questionType` | Product, pseudonymfrei | 72 h |
| `SURVEY_REVIEWED` | Review-Schritt gezeigt | `pageKey`, `viewportClass` | Product, pseudonymfrei | 72 h |
| `SURVEY_COMPLETED` | Befragung fachlich abgeschlossen | `pageKey`, `durationBucket` | Product, pseudonymfrei | 72 h |
| `REPORT_GENERATED` | neutraler Report wurde generiert | `pageKey` | Product, pseudonymfrei | 72 h |
| `EXPLAINABILITY_OPENED` | Erklärbarkeit geöffnet | `pageKey`, `componentType` | Product, pseudonymfrei | 72 h |
| `IMPACT_PATH_OPENED` | Wirkpfad geöffnet | `pageKey`, `componentType` | Product, pseudonymfrei | 72 h |
| `ALTERNATIVES_OPENED` | Alternativen geöffnet | `pageKey`, `componentType` | Product, pseudonymfrei | 72 h |
| `SENSITIVITY_OPENED` | Sensitivität geöffnet | `pageKey`, `componentType` | Product, pseudonymfrei | 72 h |
| `SOURCE_OPENED` | Quellenbereich geöffnet | `pageKey`, `componentType` | Product, pseudonymfrei | 72 h |
| `PDF_GENERATED` | PDF-Export ausgelöst | `pageKey` | Product, pseudonymfrei | 72 h |
| `RESEARCH_OPT_IN_SHOWN` | Research-Freigabe angezeigt | `pageKey` | Product, pseudonymfrei | 72 h |
| `RESEARCH_OPT_IN_ACCEPTED` | Research-Freigabe akzeptiert | `pageKey` | Product, pseudonymfrei | 72 h |
| `PUBLIC_SHARE_OPT_IN_SHOWN` | Freigabe für öffentliche Nutzung angezeigt | `pageKey` | Product, pseudonymfrei | 72 h |
| `PUBLIC_SHARE_OPT_IN_ACCEPTED` | Öffentliche Freigabe akzeptiert | `pageKey` | Product, pseudonymfrei | 72 h |
| `REPORT_FEEDBACK_SUBMITTED` | Bewertungswert zum Report abgegeben | `pageKey`, `componentType` | Product, pseudonymfrei | 72 h |

`REPORT_FEEDBACK_SUBMITTED` erlaubt zusätzlich nur einen ganzzahligen `rating` von 1 bis 5 in
einem gesonderten, strikt typisierten Feld. Freitext ist nicht Teil dieses Endpunkts und erhält,
falls später freigegeben, einen eigenständigen Datenschutz- und Speichervorgang.

## Verbotene Ableitungen

- `QUESTION_COMPLETED` enthält nie `answerId`, `answerValue`, Antworttext, Auswahlthema oder
  eine indirekte Repräsentation davon.
- Interaktionen mit Recommendation- und Report-Komponenten enthalten nie Option, Thema, Rang,
  Report-ID oder eine auf Antwortdaten zurückführbare Kennung.
- Das Event-Registry ist versioniert. Eine neue Property oder ein neues Event braucht eine
  dokumentierte Datenschutzklasse, eine Retention und einen Test; eine Änderung ohne diesen
  Eintrag wird im CI abgelehnt.

Der maschinenlesbare Katalog liegt in
`ops/wahlkreis-wirkungscheck/analytics/src/event-registry.ts`. Die Tabelle ist seine
menschenlesbare Beschreibung; bei einer Abweichung gilt der getestete Code als Sperre.

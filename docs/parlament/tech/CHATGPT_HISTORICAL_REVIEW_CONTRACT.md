# ChatGPT-Vertrag für historische WÖk-Reviews

## Zweck und Grenze

ChatGPT prüft nach dem amtlichen DIP-Backfill in begrenzten Chargen ausschließlich die fachliche Vorarbeit. Es liefert keine veröffentlichungsfähige Empfehlung, keine errechneten Wirkungswerte ohne Quelle und kein Urteil über Menschen, Parteien oder Fraktionen.

Der maschinenlesbare Vertrag wird in `woek-parlament-app/lib/editorial/external-review-contract.ts` als Zod-Schema validiert. Jede Ausgabe muss dieses Schema erfüllen.

## Ein- und Ausgabe

```text
.local/chatgpt-review/incoming/historical-backfill/
  ALL_DECISIONS.md
  decision-registry.jsonl
  cases/<case-id>/...

.local/chatgpt-review/outgoing/historical-backfill/
  batch-summary.md
  case-results/<case-id>/review-result.json
```

`ALL_DECISIONS.md` ist Register und Einstieg, nicht der einzige Kontext. Die Detailpakete enthalten genau die Quellen und Evidenzen des jeweiligen Falls.

## Pflichtstruktur

`review-result.json` enthält unter anderem:

- Entscheidungsgegenstand, tatsächliche finale Fassung, Ergebnis und Quellen;
- strikt getrennte Ex-ante- und Ex-post-Perspektive;
- Wirkpfade erster, zweiter und dritter Ordnung;
- Gegenfaktum, Berechnungsanforderungen, Risiken und Datenlücken;
- WÖk-ID-, SDG-/SDG+- und Mensch–Planet–Demokratie-Kandidaten;
- Querverweise auf ähnliche Fälle;
- ausschließlich `AI_SUGGESTION`-Kandidaten für eine ex-ante- bzw. ex-post-vorzugswürdige Option;
- Referenzsnapshot, Zeitstempel und verwendete Quellen.

Der Back-End-Validator verweigert andere Werte als `AI_SUGGESTION` bei fachlichen Kandidaten. `status_candidate` ist ebenfalls kein veröffentlichter Rückblickstatus.

## Namentliche Abstimmungen

Die `DecisionUnit` darf auf die amtliche namentliche Abstimmung und deren Originalquelle verweisen. Individuelle Stimmzeilen werden jedoch nicht in ChatGPT-Pakete exportiert, nicht zur Profilbildung verwendet und nicht zu Scores oder Ranglisten aggregiert. Bei nicht namentlichen Abstimmungen wird kein individuelles Verhalten rekonstruiert.

## Chargen und Qualität

- Normal: 10–20 Fälle pro Charge; große Haushalts- oder Systementscheidungen kleiner.
- Eingangstest zuerst: Entscheidung, finale Fassung, Beschlussstatus, Quellen, Ex-ante-/Ex-post-Evidenz und Referenzsnapshot prüfen.
- Bei Lücken: `SOURCE_INCOMPLETE` oder `DATA_GAP`; kein Ersatz durch Modellprosa.
- `batch-summary.md` enthält nur Fortschritt, Datenlücken, Quellenkonflikte, Muster und Methodenfragen.
- Die spätere Wirkungsbilanz entsteht deterministisch aus freigegebenen Einzelfällen, nicht als separat generierter Fließtext.

# Publication Workflow

```text
DRAFT → FACT_CHECK → METHOD_REVIEW → RED_TEAM → APPROVED → PUBLISHED
```

The case-level workflow is public-facing only at `PUBLISHED`.  `case_analysis_states` separately reports operational readiness (`NOT_READY` through `READY_FOR_APPROVAL`), so a ready analysis is never mistaken for a publication approval.  Imports, deterministic rules, AI microtasks, editorial task completion and a pattern match have no write path to `PUBLISHED`.

## Öffentliche Leseschicht

Die öffentliche App liest zusätzlich zur ausdrücklich als Demonstrator
gekennzeichneten Musterseite ausschließlich `parliamentary_cases` mit
`workflow_status = PUBLISHED`. Der Read-Model-Adapter liefert nur die für die
Veröffentlichung nötigen Fall-, Faktpaket-, Analyse-, Empfehlungs- und
amtlichen Quellenreferenzfelder. Importrohdaten, Dokumentvolltexte,
Redaktionsaufgaben, KI-Ausgaben und Entwürfe bleiben serverseitig geschlossen.
Fehlt während eines Rollouts eine abhängige Tabelle oder Konfiguration, zeigt
die Leseschicht einen leeren, ehrlichen Status statt einen Entwurf oder einen
Fehlerdatenabfluss.

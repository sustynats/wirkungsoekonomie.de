# Publication Workflow

```text
DRAFT → FACT_CHECK → METHOD_REVIEW → RED_TEAM → APPROVED → PUBLISHED
```

The case-level workflow is public-facing only at `PUBLISHED`.  `case_analysis_states` separately reports operational readiness (`NOT_READY` through `READY_FOR_APPROVAL`), so a ready analysis is never mistaken for a publication approval.  Imports, deterministic rules, AI microtasks, editorial task completion and a pattern match have no write path to `PUBLISHED`.


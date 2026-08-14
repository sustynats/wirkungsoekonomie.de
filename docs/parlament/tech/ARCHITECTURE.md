# Editorial Decision Architecture

Status: IMPLEMENTATION IN PROGRESS.  This document supersedes no leading WÖk source; it specifies the Parliament application boundary.

```text
official source → document/version/chunk → decision fact package
  → deterministic WÖk pre-analysis → approved resolution memory
  → decision router ─┬→ rule result
                     ├→ bounded WÖk-KI microtask
                     └→ editorial task
  → impact + normative assessment → non-compensation gate
  → recommendation candidate → human red team → publication
  → monitor / correction
```

The production loop is editorial data work, not a Codex loop.  Codex changes rules, schemas, integrations, UI or security only through a `method_change_request` or a normal software change.

Reuse decisions are recorded in [`PARLIAMENT_REUSE_MAP.md`](../../woek-knowledge/PARLIAMENT_REUSE_MAP.md): SDG/SDG+, Master Items, WÖMS, glossary, source and V3-rule patterns are reused; parliamentary ingestion, document diffing, materiality and the recommendation workflow are new modules.

## Non-negotiable boundaries

- `FACT`, `IMPACT_ANALYSIS` and `NORMATIVE_ASSESSMENT` are separate claim layers.
- Imports, AI results and party metadata cannot publish or alter an approved vote.
- Party, faction, government/opposition, popularity and personal data are excluded from the analysis input contract.
- A factual source passage is required before a case creates substantive impact tasks.
- Public reads are restricted by RLS to `PUBLISHED` cases; editorial tables have no public policy.


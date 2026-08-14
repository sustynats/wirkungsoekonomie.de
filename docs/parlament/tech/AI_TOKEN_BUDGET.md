# AI Token Budget

Initial configurable defaults:

```text
AI_MAX_INPUT_TOKENS_PER_MICROTASK=1200
AI_MAX_OUTPUT_TOKENS_PER_MICROTASK=300
AI_MAX_AUTOMATIC_MICROTASKS_PER_CASE=3
AI_MAX_TOTAL_TOKENS_PER_CASE=4000
```

`lib/editorial/ai-budget.ts` enforces the preflight independently of any model
provider. It requires a `why_required` value for every context block, estimates
tokens only for the bounded task package, produces the dependency-aware cache
key, and defaults `EDITORIAL_AI_ENABLED` to `false`.

A budget excess creates `AI_BUDGET_EXCEEDED`/human work; it must not enlarge the
prompt. `ai_usage_ledger` records estimates, actual values where available,
model, prompt version, cache hit and usage source. The dashboard reports avoided
AI usage as a success metric.

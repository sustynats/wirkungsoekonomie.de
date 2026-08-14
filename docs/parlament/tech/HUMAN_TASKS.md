# Human Tasks

Supported task types include fact conflicts, materiality/domain relevance,
impact-path links, affected groups, normative mappings, evidence grades,
boundaries, counterfactuals, correction triggers, recommendations, red-team
review, publication approval and method-pattern promotion. The Calculation
Layer adds `CALCULATION_INPUT_REVIEW`, `ATTRIBUTION_REVIEW`,
`BENCHMARK_REVIEW`, `NORMALIZATION_REVIEW`, `AGGREGATION_REVIEW`,
`UNCERTAINTY_REVIEW` and `DOUBLE_COUNTING_REVIEW`.

Every task has a router status, priority, blocking flag, bounded context, options, dependency references, due date and a versioned final decision.  A decision is stored in `editorial_decisions`; it never overwrites history.  `record_editorial_decision()` marks the task resolved and recomputes case readiness in the same data flow.

Repeated case decisions may be proposed as a pattern, but only an explicit editorial approval changes a `ResolutionPattern` to `APPROVED`.

A missing number never creates an empty free-text field. The task offers
source-backed options such as source added, supported interval, no attribution,
or not robustly quantifiable. `lib/editorial/calculation-tasks.ts` builds this
minimal package and deliberately keeps the task `HUMAN_REQUIRED`.

# Analysis Pipeline

1. DIP and other official adapters import metadata as untrusted input into `DRAFT`.
2. A confirmed event in the next 14 days creates one focused evidence task.
   Historical bulk imports remain in the Radar rather than flooding the task
   queue. The intake never fabricates a parliamentary phase, source passage or
   impact claim.
3. The editor confirms a versioned `DecisionFactPackage`: decision object, official objective, baseline, actors, dates, financial elements, sources and uncertainties.
4. The deterministic pre-analysis creates a compact domain-matrix task for the ten mandatory policy fields.  The initial status is `EVIDENCE_OPEN`, not a hidden negative judgement.
5. Approved `ResolutionPattern`s may resolve an equivalent bounded question.  They are proposed and auditable; they are never silently promoted from repeated answers.
6. Only a bounded semantic gap may create an `AI_MICROTASK_ELIGIBLE` task.  Normative, boundary, recommendation, publication and high-sensitivity questions remain `HUMAN_REQUIRED`.
7. A saved editorial decision versions the decision, resolves the task and invokes a dependency-aware recompute.  It does not require a deployment.
8. Quantifiable aspects enter the Calculation Layer: source observation,
   baseline, counterfactual, scenario/observation, reach, attribution, formula,
   reference snapshot and uncertainty are all separate auditable fields.
9. Recommendation candidates are blocked by boundary, evidence, mechanism,
   implementation, distribution and feedback gates. Human red team and
   publication approval are separate steps.

# Resolution Memory

`ResolutionPattern` is the controlled learning layer between rules and a human task.  It includes task type, scope (`CASE_ONLY`, `CASE_FAMILY`, `DOMAIN_PATTERN`, `METHOD_RULE`), conditions, resolution, rationale, sources, method version, approver and lifecycle.

Only an `APPROVED` pattern may resolve a new task automatically.  A repeated answer only creates a suggestion to promote a pattern.  The backend must show its source cases and regression fixture before approval.


# Receipts and source-repair diagnostics

The import run 34666912072 had already committed canonical data before a
truncated legacy queue response interrupted its final monitoring pass. The
private editorial receipt call came after that pass and was never attempted.

Post-commit finalization now attempts the independent news and private editorial
receipts before monitoring. A failure in one stage does not starve the others.
Every failure remains a failed workflow result; there is no healthy fallback.
The private service retains its actual approval, version and live-page checks.
The helper refuses to run without the explicit committed-content assertion.

Separately, the original Bundeshaushalt output was blocked by its supplementary
`research-reuters-budget-2027` source, which maps to disabled `reuters-access`.
The original event source `bundestag-hib` is enabled and allowed. The previous
bare `SOURCE_DISABLED` error made that distinction invisible to repair workers.
Access failures now include the exact supplementary research ID. Source access,
robots, payment restrictions and evidence verification are unchanged.

These client-side changes do not install the pending Oracle queue-pagination or
private-editorial backend repair. Those releases still require authenticated
host access and backup-first deployment.

Validation covers independent stage failures, error propagation, absence of
pre-commit receipts, normal finalization, and a disabled supplementary source
without any attempted fetch.

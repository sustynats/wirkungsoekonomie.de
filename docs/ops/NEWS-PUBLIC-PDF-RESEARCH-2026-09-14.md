# Public PDF research: separate bounded download allowance

Date: 2026-09-14

A completed independent news review could not pass source verification because
a 3,711,302-byte European Commission PDF exceeded the registry's 2 MB article
limit. The fetcher already had a 4 MB PDF ceiling, but inherited the smaller
HTML limit before applying it. This was a retrieval failure, not evidence that
the requested quotation was missing.

Public context research now explicitly requests at most 4,000,000 PDF bytes.
A configured smaller PDF limit still applies. The hard 4 MB ceiling, PDF
signature check, text extraction timeout and output bound remain enforced.
HTML, RSS, source-access, DNS, redirects, robots, RSL and exact-quote checks
remain unchanged. Documents are transient; only the bounded verified excerpt
and hashes are retained.

Validation: six boundary regression cases, impact-research and API-processor
tests, complete news tests, news build/validation, typecheck and language audit.
The actual official document passed the production access and exact-quotation
path locally; only a 752-character excerpt was retained. No paid calls were
made for this verification. Existing language-audit findings are unrelated.

Recovery must use the preserved completed response with the same input and
claim binding. It must pass the ordinary publication gate and Dropbox readback;
no paid regeneration, new claim owner, changed cost ledger, blanket retry or
forced publication is permitted. Receipt delivery is not public publication.

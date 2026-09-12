# Native editorial file transport

The 2026-09-12 current-news output `wt_20260912T010650Z_49765ef72242591c976374ca`
was 89,217 bytes. A direct encrypted GitHub issue transfer omitted a complete
6,000-character section and failed authenticated decryption before Dropbox was
changed. The same unchanged output was subsequently delivered through the
existing native Dropbox file connector and independently fetched and verified:
SHA256 `a0c30308d35b1e412d93e0a78327102e0a16008d288b817f463c476f77b0ca2f`.

Version 7 prefers native private file upload, including an actual native probe
and complete readback in the scheduled context. Small processor attestations
retain their encrypted GitHub transport and server verification. The encrypted
article fallback remains available when native upload is unavailable, never as
a workaround for an automatic safety rejection of a specific output.

The configuration writer accepts only the verified immutable v6 predecessor.
It preserves approval rules, worker ownership, existing files and the scheduler
attestation schema. It writes no health PASS and activates no automation. The
existing manual configuration workflow deploys and rereads the new private file.

No new service, secret, permissions, paid infrastructure or public article copy
is introduced. Import, source-access checks and Natalie approvals are unchanged.
Successful file delivery alone is not article publication.

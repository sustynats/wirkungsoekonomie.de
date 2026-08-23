# Academy v4: fresh-main reconciliation of PR #269

## Outcome

PR #269 is not a merge source. Its stale generated #253 audit matrix and retry-era projection are excluded. The remaining valid intent is recreated from fresh `main@423cfe786c09cd63caef3b39312cd5a996a7aff2`.

The sanitized Public-Master remains the content source of truth:

- 120 reviewed study lectures, including 12 GOV lectures;
- 58 reviewed lectures across six active continuing-education families;
- exact source `sustynats/woek-akademie-app@ecee82cce60612332b4dc909b2fecfcb380b1a24`;
- public hashes and provenance for every lecture;
- no assessment answers, solutions or instructor material.

The new projection contract contains metadata only: ten parts, 40 modules, six offering records and public assessment descriptors. Lecture titles and stable IDs are read from the committed sanitized Public-Master. Current release terminology is v1.7; the v1.6 label remains visible only as the authored source provenance.

## Classification

`ALREADY_ON_MAIN`

- sanitized 120 + 58 Public-Master and exact source lock;
- v3.2 archive branch/commit;
- v1.7 terminology/state-architecture baseline;
- search, sitemap, navigation and GitHub Pages architecture.

`SUPERSEDED`

- both large #253 audit-matrix changes in old PR #269;
- hard-coded curriculum, offering and assessment arrays in the old generator;
- the postprocess/retry-anchor stage;
- v1.6 as release baseline;
- a second full `/akademie/` page in place of the current canonical redirect architecture.

`STILL_GENUINELY_MISSING`, recreated here

- deterministic v4 projection contract and offline Public-Master verification;
- active Academy/Lernen pages derived from that contract and the Public-Master;
- source-vs-view, privacy and stable-ID gates;
- active v4 public JSON plus the real historical v2.0 machine export;
- visible v3.2 historical page linked to exact archive commit;
- read-only GitHub Actions parity gate.

No Fach, DNS finding or Recommendation was generated from code, labels or templates. No Vercel action is part of this lane.

`NO_NEW_VERCEL_BUILD=true`

# Issue #284: old dirty worktree residual rescue

This audit release closes the genuinely unique, still review-worthy residual discovered in the old root worktree without transferring the 32+ MiB working diff or reviving the dirty branch.

Status: `SUPERSEDED_NON_PRODUCTION_REVIEW_ARTIFACT`

## Residual documentation archive

- 87 individually inventoried documentation files
- 362,599 logical bytes; 142,755-byte deterministic archive
- strong secret scan: PASS
- no application build/cache/dependency content
- no Fach, DNS or Recommendation projection approval
- archive SHA-256: `b08787ea431bd40d29d09432b07a868c721fdf012e7a1b07d6c8b01efb3a3b40`

The archive contains historical Institut, Parliament, Wirkungscheck, accessibility and cross-project architecture/review material. Future use must be selective against current main. Presence in the archive is not evidence that a proposal is current, approved or suitable for publication.

## Five-commit live-branch bundle

- exact old branch head: `7e38fcb248c756fa6021cfdc87b3ef1eeb58b093`
- prerequisite/base: `aeecaf0e0478f362987c87ce19290278fe66761a`
- five branch-local commits
- `git bundle verify`: PASS
- introduced changed blobs secret scan: PASS
- bundle SHA-256: `2d0dd6e6c438e4374427499e43bcaf1dd8d548d176b5984415ccb7c823cdaf8e`

The broader 69-commit local-ref list was classified separately: it consists of stale/superseded local histories and already represented completed lanes. It was not wholesale-transferred. The five commits on the actual dirty branch are the exact history requiring independent preservation.

No reset, clean, checkout, stash application, worktree deletion, deployment, preview, Vercel build or production action is performed by this release.

# Issue #284 — complete old dirty worktree safety audit

## Outcome

`UNIQUE_UNSAVED_RELEVANT_CHANGES=0`

`OLD_DIRTY_WORKTREE_SAFE_TO_DELETE=TRUE`

The old worktree was not reset, cleaned, checked out, overwritten, stash-applied or deleted. The final `git status --short`, `git diff --stat`, `git diff --name-status` and complete untracked-path output are byte-for-byte identical to the retained raw evidence. Only explicitly inventoried macOS/iCloud placeholders required for hashing verified rescue candidates were downloaded; their logical file content was not edited.

## Identity and inventory

- Old worktree: `/Users/hagen/Documents/New project`
- Branch: `codex/live-clean-20260628`
- HEAD: `7e38fcb248c756fa6021cfdc87b3ef1eeb58b093`
- Compared main: `b3477bb387978c11cee3bf866f7dc3a15516cb50`
- Tracked changes: **4,713**
- Untracked files: **31,354**
- Total changed/untracked items: **36,067**
- Logical working-item bytes: **4,510,510,786**
- Tracked binary diff bytes: **255,775,354**

Final item classifications:

| Classification | Items | Logical bytes |
|---|---:|---:|
| `ALREADY_IN_GITHUB_PR_OR_BRANCH` | 8,568 | 1,564,497,217 |
| `ALREADY_ON_MAIN` | 4 | 294,964 |
| `BUILD_CACHE_OR_TEMPORARY` | 20,897 | 2,157,802,785 |
| `GENERATED_REPRODUCIBLE` | 4,991 | 371,951,809 |
| `SUPERSEDED` | 1,607 | 415,964,011 |
| `UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED` | 0 | 0 |

Every item, including every member represented by a reviewed prefix rule, has its own final classification, reason, Git state and hash/technical limitation in `issue-284-old-worktree-inventory.json`.

## Final raw-evidence identity

| Evidence | SHA-256 of live command output and retained file |
|---|---|
| `git status --short` | `8532f52226d4fb341c900c7cc0120738a8967387a689a456eee9ce7ced5b7425` |
| `git diff --stat` | `ef245278baf6cedf6167d11fbfb1922e111c57a09e0d66406bb4afd69115a6fd` |
| `git diff --name-status` | `19f3d20f174252b93eb248dc3221dab0470ddde54220f3790213a122fb46913e` |
| all untracked files | `1136d958ca3df14badee5876c5b406952da5482106ba550ea15bbebe9a4d766c` |

The raw outputs, both HEAD/branch reflogs and local-only commit logs are retained below `raw/`.

## Preserved unique value

### Government Data Ingest 1.1

The expanded historical source package was not on current main and is a declared upstream input of the current Data 1.2 builder. It was therefore preserved as one exact immutable GitHub Release archive rather than transferred into current source:

- Release: <https://github.com/sustynats/wirkungsoekonomie.de/releases/tag/issue-284-government-data-1.1-source-rescue>
- Asset: `WOEK-GOVERNMENT-DATA-2025-2026-INGEST-1.1.zip`
- Bytes: `314392385`
- SHA-256 / GitHub digest: `17936c8b61179d9d7f7f64b76099f064ae06881ee58bf551a78534450fa565`
- ZIP test: PASS
- Manifest verification: PASS for all **8,407** declared files
- Post-manifest validation file: accepted and recorded
- Strong secret scan: PASS
- Status: `SUPERSEDED_NON_PRODUCTION_SOURCE_ARCHIVE`

No Data 1.1 content was imported, projected or treated as current Fach/DNS/Recommendation material.

### Residual documentation

The final 87 individually reviewed documentation paths were preserved as a small deterministic review archive:

- Release: <https://github.com/sustynats/wirkungsoekonomie.de/releases/tag/issue-284-old-dirty-worktree-rescue>
- Asset: `issue-284-root-residual-documentation-rescue-7e38fcb.tar.gz`
- Files: `87`
- Logical bytes: `362599`
- Archive bytes: `142755`
- SHA-256 / GitHub digest: `b08787ea431bd40d29d09432b07a868c721fdf012e7a1b07d6c8b01efb3a3b40`
- Strong secret scan: PASS
- Status: `SUPERSEDED_NON_PRODUCTION_REVIEW_ARTIFACT`

The archive is not current architecture, publication authority or permission to synthesize/project Fach, DNS or Recommendations.

### Five commits on the actual dirty branch

The five commits between prerequisite `aeecaf0e0478f362987c87ce19290278fe66761a` and old branch head `7e38fcb248c756fa6021cfdc87b3ef1eeb58b093` were preserved exactly:

- Asset: `issue-284-live-clean-local-five.bundle`
- Bytes: `39893`
- SHA-256 / GitHub digest: `2d0dd6e6c438e4374427499e43bcaf1dd8d548d176b5984415ccb7c823cdaf8e`
- `git bundle verify`: PASS
- Commit count: `5`
- Changed/introduced blob secret scan: PASS

The 48-MiB all-local-refs trial bundle was not uploaded or transferred. The full 69-row local-only-ref history is classified in `local-only-commit-matrix.json`: five exact dirty-branch commits preserved, three stash/index/untracked snapshots temporary, and 61 stale histories superseded by current main/completed GitHub lanes.

## Nested `woek-institut-app`

The root untracked directory is an independent private Git repository and was audited separately rather than treated as an opaque folder:

- Local branch/head: `feature/quellen-public-api` / `a76080e164f4753ca08f4eca68d099c45a015fcb`
- Local commit exists on GitHub and is the parent of remote feature head `f89e66e02aed57db0deb3591ca56d1dfcb6e59f2`
- Non-ignored changed/untracked paths: **130**
- Final classifications: 119 GitHub-preserved, one on root main, four superseded, six temporary conflict copies
- Git-ignored paths inventoried by path only: **25,209**
- `.env.local`, `.vercel`, `.next`, `node_modules` and local tool configuration content read: **no**
- Unique source files privately rescued: **65**
- Private release: <https://github.com/sustynats/woek-institut-app/releases/tag/audit-issue-284-old-dirty-worktree-a76080e>
- Asset bytes: `243184`
- SHA-256 / GitHub digest: `c141809e310ed17a1cc3cfc72291a130e1df57cb401b2b1a8fa2ae4b92edd370`
- Strong secret scan: PASS

The private archive is non-production review material. It creates no application branch or PR and triggers no preview/deployment lane.

## Classification rationale highlights

- Merged newsletter/English work from #228–#230 and later current-main shell changes supersede the broad static HTML/CSS/JS delta.
- The sanitized Academy v4 Public-Master plus v3.2 archive supersede old study-script drafts, Claude corrections and handoffs; no assessment keys or review secrets were projected.
- The Parliament Golden State through #298 supersedes early release-1 data, drifted #257 CDU manifests and old technical/UI projections. The deterministic 0259→0251 work is already represented by the later completed CDU lane.
- Static search/API/feed/registry/radar/Quellenarchiv/portal/journal-PDF outputs are reproducible from current versioned generators and canonical inputs.
- Dependency/build caches, local automation memory, audio comparison renders, macOS duplicates, `.next`, `node_modules`, `.vercel` metadata and temporary worktrees are noncanonical.
- Existing immutable public media releases supersede local lower-quality audio/video variants.

## DoD

- Complete root status/stat/name-status/untracked evidence: PASS
- Root HEAD/branch and reflogs: PASS
- Local-only branch and all-ref history: PASS
- Per-item exact classification: PASS
- Nested repository expanded audit: PASS
- Valuable unique Government Data 1.1 rescue: PASS
- Valuable unique residual documentation rescue: PASS
- Valuable unique dirty-branch commit rescue: PASS
- Secrets excluded/scanned: PASS
- No wholesale dirty diff transfer: PASS
- No reset/clean/delete/overwrite: PASS
- No Vercel preview/build/deployment/promotion: PASS

`NO_NEW_VERCEL_BUILD=true`

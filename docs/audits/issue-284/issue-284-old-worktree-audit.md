# Issue #284 old dirty worktree audit

> Deterministic read-only inventory. The inspected source worktree was not changed.

- Old worktree: `[lokales Arbeitsverzeichnis]/Documents/New project`
- HEAD: `7e38fcb248c756fa6021cfdc87b3ef1eeb58b093`
- Branch: `codex/live-clean-20260628`
- Compared main: `b3477bb387978c11cee3bf866f7dc3a15516cb50`
- Changed + untracked: **36,067**
- Tracked changed: **4,713**
- Untracked: **31,354**
- Working item bytes: **4,510,510,786**
- Tracked binary diff bytes: **255,775,354**
- Local-only commits on old branch: **5**
- Local-only commits across local refs: **69**

## Classification counts

| Classification | Files | Bytes |
|---|---:|---:|
| `ALREADY_IN_GITHUB_PR_OR_BRANCH` | 8,568 | 1,564,497,217 |
| `ALREADY_ON_MAIN` | 4 | 294,964 |
| `BUILD_CACHE_OR_TEMPORARY` | 20,897 | 2,157,802,785 |
| `GENERATED_REPRODUCIBLE` | 4,991 | 371,951,809 |
| `SUPERSEDED` | 1,607 | 415,964,011 |
| `UNIQUE_LOCAL_CHANGE_REVIEW_REQUIRED` | 0 | 0 |

## Unique review queue

- None.

`UNIQUE_UNSAVED_RELEVANT_CHANGES=0`
`OLD_DIRTY_WORKTREE_SAFE_TO_DELETE=TRUE`

The complete per-item classification is in `issue-284-old-worktree-inventory.json`;
raw Git evidence is retained in the adjacent `raw/` directory.

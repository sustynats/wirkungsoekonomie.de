# MV SPD P55 — lossless corrected materialisation

Fresh branch base: `840ea0ce58a573f491b17ee3dd5c9bc160811cc0`.
Before merge, the candidate incorporated fresh current main `a587d7611b1e6770e4d15e40bc85813db102dbd6` and revalidated the exact source sets and shared readiness. The original handoff's creation-base provenance remains unchanged.
Authority: [#240/5477877520](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5477877520) together with the superseding finite binding/role repair [#240/5525358185](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5525358185).
Controller: [#241/5540520103](https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5540520103).

The source is `MV-LTW-2026-SPD-REGIERUNGSPROGRAMM`, SHA-256 `b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc`, physical PDF page 55 of 95. The entire historical source/atom ledger is byte-preserved; its generic delegated classifications are **not** accepted as Fach authority.

## Exact materialisation

- All 13 source units `SU00510–SU00522` and all 8 original atoms have bound terminal roles.
- Eight deterministic children use the existing `parent-Cnn-sha256prefix12` convention, with exact contiguous source spans and parent lineage.
- Nine active leaves are `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`, exactly as handed off. None is converted into a neutral, positive or negative assessment.
- Twenty source-container, fragment, structural, rationale, context and version records count zero. The Housing-First source unit keeps its former role in the immutable ledger and has an explicitly authorised active RNAA child.
- All original text, hashes, locators and both complete authoritative handoff bodies remain versioned. Every non-whitespace character of every P55 source unit is accounted for, including the explicitly excluded header/footer contamination.
- No Fach, direction, evidence grade, DNS mapping, recommendation or score is generated.

Machine-readable results:

- `woek-parlament-app/data/state-programmes/fach-reviews/mecklenburg-vorpommern-2026-spd-p55-explicit-v1.json`
- `woek-parlament-app/data/state-programmes/fach-content-residuals/mecklenburg-vorpommern-2026-spd-current-v1.json`

## Set-wise residual — authoring is not technical materialisation

P55 has zero unbound source objects. Its terminal marker is `MV_SPD_P55_FACH_COMPLETE = PASS_SOURCE_BOUND_AFTER_BINDING_REPAIR`.

However, the current main only contained the rejected generic MV ledger, not the accepted P1–P54 object-level materialisation. [The P54 authority](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5476819703) explicitly states that its terminal declaration is **Fach-authoring terminality**, not technical materialisation. That protected Fach must not be reopened or requested again.

The current SPD matrix therefore distinguishes:

| Exact page set | Current technical classification |
|---|---|
| P55 | Exact source-bound materialisation complete |
| P1–P54 | Protected authored Fach; technical materialisation/reconciliation still required |
| P56–P95 | No current object-bound terminal proof in the materialised matrix |

The set-wise technical residual is 94 page envelopes. It is **not** 94 missing Fach decisions, nor a count of missing effect objects. The exact remaining effect-object count stays null. P56 is not authorised from stale page subtraction. MV SPD and MV overall remain programme-open.

The #241 residual now also explicitly identifies the already supplied Berlin SPD P23 batch as `APPROVED_FACH_NOT_PROJECTED`. It is next after this merge under the current controller; no new user Fach input is needed for that batch.

## Reproduction and release boundary

Run from the app root:

```sh
node scripts/quality/materialize-mv-spd-p55.mjs --check
npm run check:mv-fach-residual
```

Root checks: `python3 tools/validate_parliament_issue_241_residual.py` and `python3 tools/validate_parliament_current_golden_readiness.py`.

The current readiness descriptor includes the new exact handoff and residual pins while retaining the immutable historical Golden State and the fail-closed programme gates. `NO_NEW_VERCEL_BUILD=true`; no preview, Vercel build, deployment or promotion.

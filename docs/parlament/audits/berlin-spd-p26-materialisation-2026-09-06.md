# Berlin SPD P26: exact source-bound materialisation

Technical base: `7e9f676711af9cbfd6df7f8ddc3468e952c2ce00`, clean fresh worktree.
Authority: #240/5560493492; execution controller: #241/5560496111.
Both comments are archived verbatim with one terminal LF. The earlier P26
draft #240/5560438040 is not used.

## Deterministic result

- Frozen final PDF: `379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9`.
- Exact SU0303-SU0318, physical P26 only: 16 source units, 18 original atoms,
  25 expressly authorised exact-span children; 59 unique records.
- Set-wise partition: 17 EXPLICIT_FACH_APPROVED, 17 exact RNAA, 25 zero-count.
- Three compound atoms versioned without deletion: SU0316-A01, SU0318-A02,
  SU0318-A03. Their original IDs/text/hashes remain; parents count zero.
- Exact UTF-16 source coverage: no uncovered non-delimiter spans. The sole
  grammatical conjunction between supplied clauses is separately recorded,
  not treated as a new Fach object.
- No SU0302 reuse, P25 change, P27 authorisation or inferred Fach.
- Complete verbatim object decisions, baseline/competence, evidence,
  uncertainty and shared Reality Check guards remain in the projection.
- No DNS/Recommendation/score/party-wide judgement is manufactured.

Source parity against the frozen PDF: all 2,042 existing identities
(766 source units and 1,276 atoms) UNCHANGED_HASH_IDENTICAL; zero additions,
removals, text/boundary changes or required Fach returns.

The Berlin set contains 1,739 terminal records, up by exactly the 59 P26 IDs.
The 1,680 protected predecessor records have no removals or changes against
the approved P25 merge `b360193dd1f701beb7f475162df6c0e2dac0ddc1`.
All non-SPD programme projections retain their protected JSON hash.

Remaining Berlin scope: 1,189 page envelopes; four programmes terminal,
eight open. SPD remains programme-open with 40 page envelopes P27-P66.
The source-order difference identifies SU0319/P27 as the next untouched
candidate frontier. Only the post-merge proof may hand that frontier back
to WÖk; this change does not authorise it.

## Necessary protected-byte repair

The intervening main commit `55c079c9a8` normalized dashes inside frozen
authority and audit records, invalidating existing hash gates. This lane
does not accept new hashes for rewritten evidence. It restores the exact
approved predecessor bytes of:

- berlin-2026-bsw-p57-authoritative-handoff.md
- mv-spd-p53-handoff-5474946653.md
- mv-spd-p53-binding-delta-5543580667.md
- mv-spd-p1-p54-reference-inventory-2026-09-04.json
- 77 authority Markdown files in mv-spd-p1-p54-authorities/, each checked
  against the unchanged authority index: old bytes match the approved hash,
  damaged bytes equal only the typography-normalized original. The complete
  archive is protected from normalization and checked by the P26 regression.

Reproduction also restores 95 already-approved Berlin projected records
whose source/Fach text had been normalized. Restored fields are
source_excerpt, policy, source_text, correction_binding_text,
authoritative_fach_text and exact_reason. There is zero Fach delta versus
the approved predecessor. The typography helper now exempts the frozen MV
authority archive and three hash-bound MV audit files; existing Parliament
data exemptions remain.
Regression tests retain the original hashes, rather than weakening gates.
MV P1-P55 decisions and frozen source ledger remain unchanged.

## Verification and release boundary

The build also exposed a stale public-PDF safety manifest after the earlier
publication-hygiene change. The PDF itself is not changed by this lane.
Renewed deep verification covers all 38 pages: full text is identical after
the approved typography normalization; private paths, blocked production
markers and non-ASCII dashes are all zero. Its current SHA-256 is
`a5ba04847fea368d5755bf9cbf880330828aefce66f72916f28fd17b5036a048`.
The manifest retains the previous verified hash and records the new check.
Publisher remains Institut für Wirkungsökonomie; Author/Creator/Producer
are Natalie Weber as explicitly required by current root AGENTS.
Tests reject stale hashes, wrong authorship, publisher drift and missing files.

Subsequent controller clarification #241/5560928102 and PR #408/5560926532
separates technically green, truthfully scoped publication from full-Fach
completion. Open Fach does not block this technical repair/merge. This P26
data transaction still does not mark the portal fully reviewed or invoke
Vercel; release readiness and budget validation are separate operations.

Local checks: 307 application tests, 32 Berlin regression tests, typecheck,
lint, exact PDF parity, Berlin residual, current #241 residual and current
Golden-readiness checks passed. PR/merged-main workflow evidence is recorded
in #240/#241 after execution, not claimed here in advance.

Production build, full route/Source-vs-View/navigation and responsive/WCAG
verification run in GitHub Actions. The current readiness is intentionally
FACH_RESIDUAL_OPEN, not a new combined release approval.

`NO_NEW_VERCEL_BUILD=true`
`PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`
No preview, Vercel build, reservation, deployment, promotion or RC request.

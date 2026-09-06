# #253 State sustainability architecture - completion contract

Stand: 2026-08-21
Status: binding audit/release contract

This file makes the fach and release invariants of issue #253 machine/discovery-visible without turning them into a public WÖk judgement.

## Existing federal architecture that must be acknowledged

- Deutsche Nachhaltigkeitsstrategie (DNS) as Germany's national Agenda-2030 target, governance and monitoring framework.
- DNS indicators / Destatis monitoring as target, baseline, context and monitoring data - not automatic causal evidence.
- GGO § 43: target/necessity, factual basis/knowledge sources, alternative solutions and reasons for rejection in the bill justification.
- GGO § 44: intended effects, unintended side effects, sustainability/long-term effects and provisions for later review.
- Sustainability assessment as part of federal regulatory impact assessment.
- eNAP/eGFA/E-Gesetzgebung as the digital assessment/process layer.
- Parliamentary sustainability control, including the current PBnEZ role where applicable.
- Aktionsplan Nachhaltigkeit 2026 only with its exact publication/version status; the participation draft is not silently presented as a final plan.

## WÖk additive architecture

WÖk must not claim to invent impact assessment, alternatives analysis or ex-post review. Its specific addition is the connected object-level chain:

`Fact/Source -> Problem Review -> Goal Review -> A→M→ΔZ→R -> 1st-3rd order/cascades -> distribution/resilience -> counterfactual/attribution -> material omissions/delivery/policy coherence -> comparable options under the same targets/protection spaces -> non-compensation -> Reality Check -> versioned learning`

## Hard semantic gates

- `GGO_43_44_FULL_SCOPE_ACKNOWLEDGED`
- `NO_FALSE_GFA_ABSENCE_CLAIM`
- `NO_FALSE_ENAP_ABSENCE_CLAIM`
- `NO_FALSE_ABSENCE_OF_ALTERNATIVES_CLAIM`
- `NO_FALSE_ABSENCE_OF_EXPOST_REVIEW_CLAIM`
- `PUBLIC_GFA_NOT_MISLABELED_AS_PUBLIC_ENAP_EXPORT`
- `STATE_TARGET_ALIGNMENT_NOT_CAUSALITY`
- `PUBLIC_DOCUMENTATION_ABSENCE_NOT_EQUATED_WITH_NO_ASSESSMENT`
- `WOEK_USP_IS_ADDITIVE_AND_SPECIFIC`
- `HISTORICAL_PUBLICATIONS_NOT_SILENTLY_REWRITTEN`

## Canonical calibration corpus

The five-case federal benchmark already published at `/blog/enap-woek-benchmark-fuenf-bundesvorhaben.html` is the canonical calibration corpus. Do not create a competing three-case corpus. Public GFA/sustainability documentation and publicly proven eNAP-export provenance remain separate fields.

## Release path

The main website is the static GitHub Pages deployment from `.github/workflows/deploy.yml`. Parliament/Vercel is a cross-system consistency dependency, not the Production release gate for `wirkungsoekonomie.de`.

Terminal state is only:

`WOEK_STATE_SUSTAINABILITY_ARCHITECTURE_SITEWIDE_COMPLETED_LIVE`

and requires the full URL/file matrix, all approved corrections, glossary/source/search/sitemap/structured-data consistency, build/privacy/URL/link/search/source-vs-view/accessibility/responsive gates, merge to `main`, successful GitHub Pages deployment, and canonical-domain smoke.

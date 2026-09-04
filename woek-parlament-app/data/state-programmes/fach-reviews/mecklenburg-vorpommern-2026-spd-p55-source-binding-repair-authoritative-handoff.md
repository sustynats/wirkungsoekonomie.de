## AUTHORITATIVE MV SPD P55 source-binding repair delta

Finite repair for `5524573553`. Supersedes **only** faulty bindings/roles in `5477877520`; its correctly bound clause decisions remain authoritative. Frozen artefact: `MV-LTW-2026-SPD-REGIERUNGSPROGRAMM`, SHA-256 `b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc`. Fresh main observed: `5a51cba42a610e0c7ce11a48d715b3e3cd619723`; implementation must rebase to fresh exact-current main.

### Correct canonical bindings / decisions

- `SU00510` whole SHA `e095d8d18903c0088f39501b6f89bd729eeeb38845b11cee808d8bf3dfab2059`. Reaffirm A01 contaminated fragment `07870f3980521f6a162b4271c0df2e17042773d61da70b7e0333aac119bff558` -> version zero-count; clean rationale child `Modulares und serielles Bauen bietet große Chancen, schneller und kostengünstiger Wohnraum zu schaffen.` / `2523f3522e7593ed5bb14fcaaf36f612e88ce258996e4e38d1f0bc0c2dec09ef` -> rationale zero-count; A02 `Wir wollen diese Bauweisen stärker fördern.` / `d7416b198ff0004c983ff2da2f7d4e15e78e6192d1e0d0141af0127dac93b44a` -> existing RNAA from `5477877520`.

- `SU00511` whole SHA `ff1e6588ba96ac6af42d109bb90ed5da504ef7f8acdab05af6ea75011ab3f87a`. Omitted first sentence `Beim Umgang mit Grund und Boden gilt für uns der Grundsatz: Gemeinwohl vor Spekulation.` / `abb37d2c88d13c2d4869c12f21c3cfcb8686109fbde9bd98c7b64cc7f21152f8` -> `NON_EFFECT_GOAL_OR_POLICY_PRINCIPLE_REVIEWED`, zero-count. Existing A01 compound `890794f62c3d603c85a5ab90f3ea75da35169700bec6e138f2f0ee3e19c378d0` stays version parent zero-count; reaffirm its two RNAA children from `5477877520`: `101402e0ba4305ac3d3a27efceac9e894ffa61bbbbdba7eb9d94ded69b217fe1` and `fe3198dc01a5ec920a903ce2ffa5223914a87692f890b4dd03a66b969cc32275`.

- `SU00512` = `Wohnen im ländlichen Raum stärken` / `1f388ab0f193a343fe9af98c7b621d3d0eb50f03873ac42c07616d51a5d542b5` -> structural heading zero-count.
- `SU00513` exact whole SHA `93e96cb71845a7be2cdba0f1c26ae47e9a9cc4db887d2f2cd9c6ad5b8fa2298b` -> `NON_EFFECT_CURRENT_PROGRAMME_SCOPE_AND_NEED_CONTEXT_REVIEWED`, zero-count. It describes current programme geography/eligibility architecture, not a new/change future intervention.
- `SU00514` whole SHA `7ceb3c918ce4725a852d145ef6048f5f05c853b3af2f560d6731cd777fc468be`; reaffirm A01 `310ce3beef66c44f4a348c21a7f266498e10efb4c5d228edefafa59a0e3fcb61` zero-count need/rationale and A02 `8c7288ae2d945e644b27b9ecc9f44813858f2dd76a3b20df0e0e0a7aed281676` existing RNAA.
- `SU00515` whole SHA `753b303697a6fa8d6e472e6d238384ccaf7085da5d27d30deb5f267892e7df8a`; reaffirm first sentence/A01 `27584f0ca82f42669c7b46de49fbabb9c5ae29d53162b9c5d0162b6c7ffd4720` existing RNAA. Omitted second sentence `Das Land wird hier seiner Anregungsfunktion gerecht bleiben.` / `cf131a9755dfad38fb0d9e67dc83726ba8283cc4a1042e52ff6a720752325d9c` -> `NON_EFFECT_ROLE_OR_IMPLEMENTATION_FRAME_REVIEWED`, zero-count.
- `SU00516` = `Nachhaltig, barrierefrei und zukunftsfest bauen` / `68df4097c7a3007a40025cf7ecacdbd8be4e104d695877a4445dd69cb9331bc4` -> structural heading zero-count.

### `SU00517` omitted effect-bearing clauses

Canonical whole SHA `2f784b38941bba4047ebf2649c252d9dc54e3deaf472093e6d30512d8c6f4bc6`. Reaffirm A01 `f37f635a0dff71e00f279b9ab782ed4b06e11edf6b7649b130bb2b3ddc55470d` as goal/rationale zero-count. Generate two deterministic exact-span children:

1. `Energetische Sanierungen begleiten wir mit Augenmaß, damit sie bezahlbar bleiben.` / `dbede871c6221c95d60997e1221798c28f81347803876e0af5ea72b24297ad93` -> `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`; code `ENERGETIC_RENOVATION_AFFORDABILITY_SAFEGUARD_INSTRUMENT_COST_ALLOCATION_SCOPE_UNSPECIFIED`. Reason: no funding/regulatory/cost-allocation instrument, eligibility, technical standard, scope, enforcement, finance, timeline or counterfactual is specified; these determine incidence, renovation depth, resource effects and cost.

2. `Barrierefreiheit, altersgerechtes Wohnen und gute Erreichbarkeit von Infrastruktur bleiben verbindliche Leitlinien unserer Wohnungs- und Stadtentwicklungspolitik.` / `2dcc7c55fc11122c3ebc030ca9ebf6b4ea26f4bd551b72ca9b629ae8635c680e` -> `REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`; code `ACCESSIBILITY_AGEING_INFRASTRUCTURE_GUIDELINES_LEGAL_FORCE_SCOPE_STANDARDS_DELIVERY_UNSPECIFIED`. Reason: legal/administrative instrument, measurable standards, covered projects, actor, exceptions/enforcement, finance, timetable and baseline are unspecified.

- `SU00518` / `14c44ee0457cdb0c6e0df9175c4dece143730e38e0c619dc8b54ab6a80ebf4af`: reaffirm existing RNAA from `5477877520` unchanged.

### `SU00519` mandatory role repair

Exact `Wir möchten die aktuelle Entwicklung der Obdach- und Wohnungslosenhilfe aufgreifen und neue fachliche Ansätze (z.B. Housing-First) in unserem Bundesland fördern.` / SHA `c0ebf23b4206b05f90c2d7ebacd4a3c32ca5940db80397547a6402179acca422` is effect-bearing. Version old non-effect role zero-count; materialise active semantic record/child if schema requires.

`terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
`exact_reason_code = HOMELESSNESS_HOUSING_FIRST_SUPPORT_INSTRUMENT_ELIGIBILITY_SCALE_FINANCE_DELIVERY_UNSPECIFIED`
Reason: the source names support for new homelessness-assistance approaches and Housing First only as an example, but does not specify programme/instrument, eligibility/providers, housing access, service intensity, scale, finance, geography, delivery, safeguards, timeline, additionality or counterfactual. Do not infer a guaranteed Housing-First rollout or direction/evidence from the label.

- `SU00520` = `Digitalisierung, die den Alltag leichter macht` / `22d2b34b744e637cd4da0b7dd4e3cf98b85de8ba4c90c941ba166f12b61895c3` -> structural heading zero-count.
- `SU00521` exact retrospective digital-building-application paragraph / `98646fd841fe8d457ab323885e5a78db6b85984a7e4a4ba7b0bfb46ef3b879fa` -> `NON_EFFECT_HISTORY_CURRENT_POLICY_AND_REPORTED_OUTCOME_REVIEWED`, zero-count.
- `SU00522` existing page-footer zero-count remains protected.

After lossless materialisation of `5477877520` + this delta, P55 may be declared `PASS_SOURCE_BOUND_AFTER_BINDING_REPAIR` only if the fresh SET-WISE residual confirms zero P55 residual. P56 remains blocked until that residual proves it. Preserve P49-P54, generate only authorised children, post generated IDs/text/SHA/parent roles and residual proof. No DNS/Recommendation/score/programme-wide synthesis. `NO_NEW_VERCEL_BUILD=true`; `PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`; no Vercel action.

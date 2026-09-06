## WÖk FACH SOURCE-BINDING REPAIR DELTA - Berlin SPD P22 eight canonical objects - AUTHORITATIVE

This is the finite WÖk correction required by #241 `5479465832` / `5479485415`. It supersedes **only** the stale/wrong source-unit binding and SHA fields for the eight P22 objects listed below in earlier P22 handoffs (including the corresponding fields in `5477689556`, `5477750046`, `5477758987`, `5477766107`). All other source-exact P22 Fach decisions that already bind to the repaired canonical ledger remain unchanged.

Fresh technical base at authoring: `main = bfd22e85e7ac75f66971ccac66b80e8fa288683d`.
Canonical artefact remains `BE-AGH-2026-SPD-WAHLPROGRAMM`, SHA-256 `379f8cfe51309c2782c88a74ef06777d9ef0c07d7c256ddf1d9f361111e6ffc9`.

The hashes below were regenerated from the **exact UTF-8 canonical ledger text on current main**. Do not copy the older incorrect hashes from `5477689556`.

### 1. `BE-SPD-2026-SU-0248`
- locator: `p022:b004@42.52,157.55,222.96,169.52`
- exact text: `Berlin bleibt eine Mieter*innen-Stadt.`
- SHA-256: `8c1db47c430eeb7d75b6036d2e5b627a5fb76f2d98ff1fd87581e15d2d7fa24f`
- terminal role: `NON_EFFECT_CONTEXT_REVIEWED / HOUSING_MARKET_STATUS_OR_IDENTITY_FRAME`
- zero-count. This is a status/narrative frame, not an independently specified intervention.

### 2. `BE-SPD-2026-SU-0249`
- locator: `p022:b005@304.73,69.84,539.26,147.82`
- exact text: `Selbstgenutztes Wohneigentum unterstützen wir trotzdem gezielt - besonders für Familien mit geringem und niedrigem Einkommen im Rahmen von privaten Neubaugebieten sowie für Mieter*innen, die bei Umwandlung bereits in der Wohnung leben.`
- SHA-256: `10a6fd8fc5d67cdb2b35ca28152c496b4eb9c511940cd93a8bea2489de417090`
- repair current non-effect misrole to one active source-bound semantic record/leaf; retain the source unit as exact provenance/version parent if the schema requires a child.
- `terminal_fach_state = REVIEWED_NOT_ASSESSABLE_WITH_EXACT_REASON`
- `exact_reason_code = TARGETED_HOMEOWNERSHIP_SUPPORT_INSTRUMENT_FINANCE_AND_ELIGIBILITY_UNSPECIFIED`
- Exact reason: `unterstützen` does not specify the subsidy, financing, guarantee, land/ownership, tax or other legal instrument; amount/duration; exact eligibility thresholds; private-development delivery path; take-up/counterfactual; interaction with housing supply; or treatment of incumbent tenants on conversion. Without the lever and financing/distribution design, net direction, additionality, fiscal opportunity cost and distribution cannot be bounded without inventing policy content.

### 3. `BE-SPD-2026-SU-0250`
- locator: `p022:b006@42.52,185.86,403.63,203.86`
- exact text: `Unser Berlin wird sauber, grün und lebenswert`
- SHA-256: `95092915b5762d8d5fd222c87ca6dc2d262a0ffea434e8624481ba6344971ef3`
- `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`, zero-count.

### 4. `BE-SPD-2026-SU-0251`
- locator: `p022:b007@42.52,212.74,270.83,244.86`
- exact text: `Feministische Stadtplanung: Berlin als faire, inklusive und sorgende Stadt`
- SHA-256: `41e0efb8d505ac48c7d2afa72c2827b8ed8bae5ffa9639a54998215650d6ed1e`
- `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`, zero-count.

### 5. `BE-SPD-2026-SU-0253`
- locator: `p022:b009@42.52,408.55,233.48,440.67`
- exact text: `Parks und Grünflächen schaffen Lebensqualität`
- SHA-256: `cda97d29abb17417afc4ec796b4366649eccaae8ebff45a2b4a3e93d28af2616`
- `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`, zero-count.

### 6. `BE-SPD-2026-SU-0258`
- locator: `p022:b014@42.52,709.07,208.74,724.39`
- exact text: `Mehr Stadtbäume für Berlin`
- SHA-256: `709124eb06bd224022e1d4013d352efdea3410395ac14bfad62a31796b40849a`
- `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`, zero-count.

### 7. `BE-SPD-2026-SU-0262`
- locator: `p022:b019@304.72,502.26,534.00,534.37`
- exact text: `Abkühlung und grüne Erholung in den Kiezen`
- SHA-256: `1dc490cb6887167e90e239338b4d566cf0415be09c023dd11ac6c95bc497e10e`
- `NON_EFFECT_CONTEXT_REVIEWED / STRUCTURAL_HEADING`, zero-count.

### 8. `BE-SPD-2026-SU-0265`
- locator: `p022:b022@304.72,692.38,555.17,770.36`
- exact full text: `Wir handeln zuerst dort, wo Hitze, Lärm, Luftbelastung, Grünmangel und soziale Belastungen zusammenkommen. Hotspots wie den Washingtonplatz und den Vorplatz am Bahnhof Gesundbrunnen entsiegeln oder begrünen wir, etwa mit einem Tiny Forest.`
- canonical source SHA-256: `d34e452e5f6a5dbb4dc2f9878aac0bafc242063dcb5670abb31c1fdc50a252a8`
- current whole-unit non-effect role is wrong. Version the compound source parent non-counting and generate the two semantic children mechanically from the exact texts below using the existing child-ID convention.

**Child 1 - spatial-equity / compound-risk targeting guard**
- exact text: `Wir handeln zuerst dort, wo Hitze, Lärm, Luftbelastung, Grünmangel und soziale Belastungen zusammenkommen.`
- verified SHA-256: `36c9f3353105bf0ff9200f4ea5b1a507e915369dc1ed6f97af1a5552238126ff`
- `NON_EFFECT_SPATIAL_EQUITY_AND_COMPOUND_RISK_TARGETING_GUARD_REVIEWED`, zero-count.

**Child 2 - hotspot desealing/greening action**
- exact text: `Hotspots wie den Washingtonplatz und den Vorplatz am Bahnhof Gesundbrunnen entsiegeln oder begrünen wir, etwa mit einem Tiny Forest.`
- verified SHA-256: `f6f05f020690734508f7671e446ea8732297a5e5d08e09cbd4e698287a70f7f5`
- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = POSITIVE_HEAT_STORMWATER_PUBLIC_REALM_AND_URBAN_NATURE_POTENTIAL / SITE_AND_DESIGN_DEPENDENT`
- `evidence_level = MEDIUM_FOR_DESEALING_GREENING_PHYSICAL_MECHANISM / LOCAL_OUTCOME_PENDING`
- `Tiny Forest` is an example/design option in the source, not a guaranteed implementation type.
- Risks/trade-offs: station/public-space functionality, accessibility/safety, underground utilities, maintenance/water, spatial displacement and construction disruption.
- Noncompensation: greening/desealing does not compensate for unresolved accessibility, safety, mobility-function or maintenance failures.
- Reality check: actually desealed/greened area **plus** surface/air temperature, runoff/infiltration, canopy/habitat, access/use and maintenance condition.

Important: the older `5477689556` hashes for the `SU0265` parent and both child sentences are **VOID as hashes**; the semantic decisions above are retained but the exact verified hashes in this comment control.

## Binding result

`BE_SPD_P22_EIGHT_OBJECT_SOURCE_BINDING_REPAIR = PASS_CANONICAL_EXACT`

This finite delta clears the WÖk Fach/source-authority conflict identified by #241 `5479465832` / `5479485415`. It does **not** itself claim technical P22 closure. CodeX must now materialise P22 losslessly from fresh exact current main, with this comment controlling these eight objects and the earlier handoffs controlling only their still-source-exact non-conflicting objects/decisions.

After merge, recompute SPD/Berlin residual **SET-WISE**. Do **not** authorise P23 before that fresh residual proves P23 / `BE-SPD-2026-SU-0266+` is the next untouched canonical frontier.

No DNS mapping, Recommendation, score or SPD-wide judgement. `NO_NEW_VERCEL_BUILD=true`; `PARLIAMENT_RELEASE_APPROVAL=NOT_GRANTED`; no Vercel action.

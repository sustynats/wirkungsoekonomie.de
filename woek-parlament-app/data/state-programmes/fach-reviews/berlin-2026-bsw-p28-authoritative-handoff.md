## WÖk FACH BATCH - Berlin BSW P28: Corona-Aufarbeitung / Untersuchungsausschuss - source-bound review + tokenizer/cross-page repair

Authoritative continuation after the already posted P22→P27 Fach queue. Frozen source artifact remains `BE-AGH-2026-BSW-WAHLPROGRAMM`, SHA-256 `fd6fe2b9fbb69fc5a34451989c2a75feb14e893c172a20d7840bbe94f2161675`. This batch reviews **physical PDF page 28** only, except for the one mechanically necessary continuation fragment into P29 stated below. Generic delegated #313 RNAA is not Fach proof and is superseded for this exact scope. No DNS mapping, Recommendation, score or programme-wide judgment.

### 1. Fresh source/competence baseline

The programme's central instrument on P28 - a Berlin parliamentary Corona investigation committee - is **not inherently non-assessable**. Berlin's Abgeordnetenhaus currently uses investigation committees under Art. 48 of the Berlin Constitution. The 2nd committee of the 19th term (`Fördergeld`) was established on 18.12.2025 pursuant to Art. 48 to investigate a defined subject and report its findings to the plenary:
`https://www.parlament-berlin.de/Ausschuesse/19-2-untersuchungsausschuss-fordergeld`

This establishes a real Berlin parliamentary oversight/fact-finding mechanism. It does **not** establish that the BSW's factual or causal Corona allegations are true.

For the Messe/Jafféstraße treatment centre, the contemporaneous Berlin Senate primary source of 11.05.2020 describes the CBZJ as a **reserve hospital** intended to relieve Berlin hospitals if needed, with an initially completed area of approx. 500 beds and up to 1,000 reserve beds planned:
`https://www.berlin.de/sen/archiv/gpg-2016-2021/2020/pressemitteilung.930062.php`

Therefore the programme's characterisations and aggregate cost claim (e.g. `rund 90 Mio. Euro`) remain **programme source claims requiring evidentiary reconciliation**. They must not be silently promoted to WÖk facts.

### 2. U01 - contextual/rationale unit

`BE-BSW-P28-U01-156093ba66d9`

- `terminal_fach_state = NON_EFFECT_CONTEXT_AND_INQUIRY_RATIONALE_REVIEWED`
- `counts_as_effect_object = false`
- Exact reason: the unit supplies historical/partisan framing, diagnoses, references to prior written questions and rationale for an investigation. It does not specify an additional independent policy lever beyond the investigation-committee instrument in U02. Assertions about earlier parties, lessons and findings remain source claims, not WÖk-established facts.

### 3. U02 must be version-repaired - one real instrument, many claims/questions

Current source unit:
`BE-BSW-P28-U02-813956b62325`

The current atomisation into 35 apparent `EFFECT_BEARING` atoms is semantically false. The unit contains **one identifiable governance instrument** (Corona-Untersuchungsausschuss), plus investigation topics, factual/causal allegations, rhetorical questions, normative framing and claimed outcomes. It also contains three deterministic source-boundary/tokenizer defects.

Set the original U02 to:
- `terminal_fach_state = SOURCE_UNIT_RECLASSIFIED_VERSIONED`
- `counts_as_effect_object = false`
- `supersession_reason = ONE_GOVERNANCE_INSTRUMENT_PLUS_SCOPE_CLAIMS_QUESTIONS_AND_THREE_SOURCE_BOUNDARY_DEFECTS`

CodeX may generate only deterministic child/merge IDs from the exact clauses below. Fach semantics come only from this handoff.

### 4. Canonical active effect child - Corona-Untersuchungsausschuss

From the exact source clause in current A01:
`Das wollen wir in einem Corona-Untersuchungsausschuss aufarbeiten:`

Create one canonical source-bound effect child (stable deterministic child ID generated mechanically):

- `terminal_fach_state = EXPLICIT_FACH_APPROVED`
- `impact_direction = CONDITIONAL_POSITIVE_ACCOUNTABILITY_EVIDENCE_AND_INSTITUTIONAL_LEARNING_POTENTIAL / SCOPE_METHOD_RIGHTS_AND_FOLLOW_THROUGH_DEPENDENT`
- `evidence_level = MEDIUM_FOR_PARLIAMENTARY_OVERSIGHT_AND_FACT_FINDING_MECHANISM / LOW_FOR_SUBSTANTIVE_POLICY_OUTCOME_EX_ANTE`
- `competence = LAND_BERLIN_PARLIAMENTARY_OVERSIGHT_UNDER_ARTICLE_48 / SUBJECT_MATTER_AND_POWERS_REMAIN_LEGALLY_BOUNDED`
- `A→M→ΔZ`: constitutionally grounded investigation committee → structured collection/testing of documents, testimony and competing evidence → potentially better accountability, institutional learning and evidence-grounded revision/preparedness.
- Hard boundary: committee establishment/hearings/report **do not validate the programme's factual or causal allegations** and do not themselves produce a health, economic or rights outcome.
- Material omissions/guards: exact mandate/scope; evidence and causality standard; right to be heard/adversarial testing; privacy and medical-data protection; proportionality; minority/dissent rights; transparent treatment of contradictory evidence; avoidance of misinformation amplification; resource burden; rule for translating substantiated findings into concrete revision.
- Distribution/rights: people affected by past restrictions, patients, health workers, businesses, public administration and named/implicated actors; procedural fairness and reputational rights are material.
- `FALSIFICATION / REALITY_CHECK`: precise lawful mandate; complete/documented source coverage; separation of substantiated, uncertain and rejected claims; transparent evidence conflicts and minority/dissent reporting; concrete accepted revisions/recommendations; later implementation/reality check. Hearing count, report pages or political salience are outputs, not impact.
- `DNS_REFERENCE = NOT_MAPPED_HERE`
- `RECOMMENDATION = NOT_FACH_AVAILABLE / CODEX_MUST_NOT_SYNTHESIZE`

Any later phrases that merely demand that another listed topic be `geklärt` in the same committee are restatements/scope additions, not additional independent committees/effects.

### 5. Exact source repair A01+A02 - abbreviation split

Current tokenizer incorrectly split `90 Mio. Euro.`:
- `BE-BSW-P28-U02-A01-4ae32a01eb0f`
- `BE-BSW-P28-U02-A02-870359c2fc9f`

Version both parents to zero-count and deterministically materialise two semantic children from the combined text:

**Child GOV** - exact clause already defined above:
`Das wollen wir in einem Corona-Untersuchungsausschuss aufarbeiten:`
→ canonical `EXPLICIT_FACH_APPROVED` effect child from section 4.

**Child SCOPE-CBZJ** - exact source span:
`Auf- und Abbau der Phantomklinik in der Berliner Messe, Kostenpunkt: rund 90 Mio. Euro.`
- `terminal_fach_state = NON_EFFECT_INVESTIGATION_SCOPE_AND_PROGRAMME_SOURCE_CLAIM_REVIEWED`
- `counts_as_effect_object = false`
- Source-claim guard: the centre's reserve purpose is independently documented by the 11.05.2020 Senate source; the programme's wording and aggregate `~90 Mio.` figure are not adopted as WÖk facts by this review.

### 6. Remaining P28 U02 objects - all reviewed, zero-counting scope/claim/rationale objects

Unless explicitly repaired below, preserve current source text/hash and classify as zero-count terminal review objects. They do **not** receive impact direction or evidence level as independent measures.

#### A. CBZJ / investigation demand
- `BE-BSW-P28-U02-A03-43272bc9af65` → `NON_EFFECT_CONTESTED_PROGRAMME_SOURCE_CLAIM_REVIEWED`
- `BE-BSW-P28-U02-A04-28cd39fd1b06` → `NON_EFFECT_INVESTIGATION_RESTATEMENT_REVIEWED`

A03's claims about use/staffing/counterfactual staffing are not accepted as facts merely from the programme. A04 is a restatement of the canonical investigation instrument.

#### B. Preparedness/investment diagnosis and committee-scope restatement
- `A05-5f8738533429` → `NON_EFFECT_RHETORICAL_SCOPE_HEADING_REVIEWED`
- `A06-365732d6601e` → `NON_EFFECT_PARTISAN_OUTCOME_CLAIM_REVIEWED`
- `A07-afe3699475dd` → `NON_EFFECT_PREPAREDNESS_AND_INVESTMENT_SOURCE_CLAIM_REVIEWED`
- `A08-ba02739f4cbc` → `NON_EFFECT_INQUIRY_LEARNING_QUESTION_REVIEWED`
- `A09-5d3b3349eb3d` → `NON_EFFECT_INVESTIGATION_RESTATEMENT_REVIEWED`

P28 does not specify a separate hospital-capital programme here; A07 is a diagnosis/source claim within the inquiry scope.

#### C. Evidence/data/causality questions
- `A10-4edf1a2e8beb`
- `A11-1d652665e9be`
- `A12-5987f665b01e`
- `A13-3c4b67f2e65f`
- `A14-3e4bad71913b`
- `A15-b9f16f4857d7`
- `A16-023038edfd57`
- `A17-c4ad8a0b448d`
- `A18-f12629693d44`
- `A19-436e51046be2`
- `A20-d6b890697462`
- `A21-d814e9359e8e`

→ `NON_EFFECT_INVESTIGATION_EVIDENCE_QUESTION_DIAGNOSIS_OR_SOURCE_CLAIM_REVIEWED`

Exact guard: no epidemiological/causal WÖk conclusion is inferred from these questions/assertions. A21 is only a generic desired change without a separate instrument.

#### D. contested narrative / occupancy / rights / Charité claims
- `A22-807369a98699`
- `A23-3af9657a41d5`
- `A24-3cd02144190c`
- `A25-f9ab303921f5`
- `A26-196d7ed9a68e`

→ `NON_EFFECT_CONTESTED_CAUSAL_RIGHTS_OR_OPERATIONAL_SOURCE_CLAIM_REVIEWED`

The statements are legitimate investigation topics/claims, not independently accepted factual findings. Rights impacts are a material review dimension; the programme's causal framing is not pre-judged.

#### E. business aid / repayment / future-learning claims
- `A27-0c241f031647`
- `A28-085b6f3b9cae`
- `A29-8b1c8df49f82`
- `A30-9b5fb8f08491`

→ `NON_EFFECT_ECONOMIC_AID_SOURCE_CLAIM_OR_LEARNING_QUESTION_REVIEWED`

A30 asks what should be learned for future targeted support but specifies no independent support instrument here.

### 7. Exact source repair A31+A32 - `4 Mio. Euro` split

Current malformed fragments:
- `BE-BSW-P28-U02-A31-3a41ef0dc93a` = `In Berlin wurden in 75.000 Verfahren über 4 Mio.`
- `BE-BSW-P28-U02-A32-383dc60403c2` = `Euro an Bußgeldern wegen Verstößen gegen die übergriffigen und unsinnigen Corona-Verordnungen erhoben.`

Version both as zero-count superseded fragments and generate one deterministic merged semantic record with exact combined text:
`In Berlin wurden in 75.000 Verfahren über 4 Mio. Euro an Bußgeldern wegen Verstößen gegen die übergriffigen und unsinnigen Corona-Verordnungen erhoben.`

- `terminal_fach_state = NON_EFFECT_FINE_ENFORCEMENT_PROGRAMME_SOURCE_CLAIM_REVIEWED`
- `counts_as_effect_object = false`
- Guard: number/amount and evaluative adjectives remain programme claims until separately evidenced.

Then:
- `A33-4c3f37b3dacf` → `NON_EFFECT_AMNESTY_STATUS_SOURCE_CLAIM_REVIEWED`
- `A34-bc44b29e0fac` → `NON_EFFECT_PROCEEDING_STATUS_SOURCE_CLAIM_REVIEWED`

Neither sentence, standing alone, states a separate concrete amnesty instrument.

### 8. Cross-page repair P28 A35 + P29 U01 A01

P28 ends with an incomplete fragment:
- `BE-BSW-P28-U02-A35-e0d0862ffe5c` = `In anderen Ländern werden Bußgelder`

P29 begins with:
- `BE-BSW-P29-U01-A01-f48b75505659` = `zurückgezahlt.`

These are one physical-page continuation sentence. Version both fragments to zero-count superseded states and generate one deterministic cross-page semantic record with exact text:
`In anderen Ländern werden Bußgelder zurückgezahlt.`

- `terminal_fach_state = NON_EFFECT_COMPARATIVE_PROGRAMME_SOURCE_CLAIM_REVIEWED`
- `counts_as_effect_object = false`
- `source_span = physical PDF P28→P29`
- This structural use of P29 A01 **does not make P29 Fach-terminal** and must not cause any other P29 atom to be consumed or credited.

### 9. P28 terminality / residual contract

After lossless materialisation of sections 2-8 and only after the P28→P29 continuation repair is represented:

`BE_BSW_P28_FACH_COMPLETE = PASS_SOURCE_BOUND`

P28 has exactly **one canonical independent policy instrument**: the Berlin Corona investigation committee. Everything else on this physical page is context, investigation scope, a source claim/question, a duplicate/restatement, or a deterministic source-boundary repair. This is a semantic correction to the generic atom ledger, not a blanket endorsement or rejection of the programme's historical claims.

Protected BSW physical Fach scope then extends through P28 **provided P22→P27 have first been correctly materialised from their already-authoritative #240 handoffs**. P29 remains the next Fach page, with its first token fragment already structurally consumed only as the P28 cross-page comparison sentence.

Recompute Berlin/BSW residual **SET-WISE only** from exact current main + all authoritative handoffs. Do not use subtractive stale counts. BSW remains programme-open; Berlin remains `3/12 programme-terminal / 9/12 open`; MV and combined Golden State remain fail-closed.

### 10. CodeX handoff

On the existing pending GitHub-only source-order lane, extend the authoritative queue from P22→P27 to **P22→P28**. Preserve P1-P21 terminal. Materialise Fach losslessly, generate only the deterministic child/merge/cross-page IDs/hashes described above, and post the generated IDs/exact text spans + SET-WISE residual back to #240/#241. Do not synthesize any Fach, DNS, Recommendation or score. Do not credit generic #313 RNAA where explicit handoffs supersede it.

No Vercel Preview/build/deployment/promotion. No owner RC request.

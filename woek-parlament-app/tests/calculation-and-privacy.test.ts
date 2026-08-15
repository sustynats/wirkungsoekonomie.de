import assert from "node:assert/strict";
import test from "node:test";
import { evaluateFormula, FormulaEvaluationError, type CalculationOperand, type FormulaDefinition } from "@/lib/calculation/formula-engine";
import { UnitValidationError } from "@/lib/calculation/units";
import { assertExternalReviewSafe } from "@/lib/review/privacy";
import { createReviewZip } from "@/lib/review/zip";
import type { ReviewBatchPackage, ReviewResult } from "@/lib/review/contracts";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { fetchAllDipPages, fetchDipResource } from "@/lib/dip";
import { normalizeDipDecisionPosition, normalizeDipDrucksache } from "@/lib/dip-backfill";
import { canPublishComparison, impactLabel } from "@/lib/commitments/assessment";
import { agreementForNamedVote, summarizeVoteLedger } from "@/lib/members/vote-ledger";
import { politicalSourceCatalog } from "@/lib/commitments/source-catalog";
import { publicCommitmentDisplay } from "@/lib/commitments/public-register";
import { subscriptionDeliveryReady, subscriptionRequestSchema } from "@/lib/wirkungsradar/subscriptions";
import { newsletterDeliveryReady, newsletterRequestSchema } from "@/lib/woek-newsletter/subscriptions";
import { isOfficialNamedVoteXlsxUrl, mapOfficialNamedVoteCells } from "@/lib/bundestag/named-votes";
import { documentNumbersFromOfficialVoteResult, officialDrucksachePdfUrl } from "@/lib/bundestag/named-vote-reconciliation";
import { chunkText } from "@/lib/editorial/document-structure";
import { extractEvidenceCandidates } from "@/lib/editorial/evidence-candidates";

const sourceOperand = (operandId: string, value: number, unit: CalculationOperand["unit"]): CalculationOperand => ({
  operandId,
  value,
  unit,
  sourceId: "SRC-1",
  sourceLocation: "Tabelle 1",
  observationDate: "2026-08-14",
  territorialLevel: "DE",
  qualityStatus: "HIGH",
  origin: "SOURCE"
});

test("deterministic formula produces the same state change", () => {
  const definition: FormulaDefinition = {
    formulaId: "STATE_CHANGE",
    version: "1.0.0",
    outputUnit: "MINUTES",
    status: "ACTIVE",
    methodologicalBasis: "scenario minus counterfactual",
    expression: { op: "SUBTRACT", left: { op: "OPERAND", operandId: "scenario" }, right: { op: "OPERAND", operandId: "counterfactual" } }
  };
  const first = evaluateFormula(definition, [sourceOperand("scenario", 28.1, "MINUTES"), sourceOperand("counterfactual", 32.3, "MINUTES")]);
  const second = evaluateFormula(definition, [sourceOperand("scenario", 28.1, "MINUTES"), sourceOperand("counterfactual", 32.3, "MINUTES")]);
  assert.ok(Math.abs(first.result.value - (-4.2)) < Number.EPSILON * 32);
  assert.equal(first.result.unit, "MINUTES");
  assert.equal(first.calculationHash, second.calculationHash);
});

test("incompatible units cannot be added", () => {
  const definition: FormulaDefinition = {
    formulaId: "INVALID_ADD",
    version: "1.0.0",
    outputUnit: "EUR",
    status: "ACTIVE",
    methodologicalBasis: "test",
    expression: { op: "ADD", left: { op: "OPERAND", operandId: "money" }, right: { op: "OPERAND", operandId: "emissions" } }
  };
  assert.throws(() => evaluateFormula(definition, [sourceOperand("money", 1, "EUR"), sourceOperand("emissions", 1, "TONNES_CO2E")]), UnitValidationError);
});

test("unverified generated numbers cannot enter a productive calculation", () => {
  const definition: FormulaDefinition = {
    formulaId: "SOURCE_ONLY",
    version: "1.0.0",
    outputUnit: "PERSONS",
    status: "ACTIVE",
    methodologicalBasis: "test",
    expression: { op: "OPERAND", operandId: "proposed" }
  };
  const generated = { ...sourceOperand("proposed", 12, "PERSONS"), origin: "UNVERIFIED_GENERATED_NUMERIC_VALUE" as const };
  assert.throws(() => evaluateFormula(definition, [generated]), FormulaEvaluationError);
});

test("external review exports reject local paths and file URIs", () => {
  const localPath = `/${["Users", "example", "private.txt"].join("/")}`;
  const fileUri = ["file:", "//", "/private/document.pdf"].join("");
  assert.throws(() => assertExternalReviewSafe({ source: localPath }));
  assert.throws(() => assertExternalReviewSafe({ source: fileUri }));
  assert.doesNotThrow(() => assertExternalReviewSafe({ source: "https://dip.bundestag.de/vorgang/123" }));
});

test("review evidence candidates remain a protected candidate queue", () => {
  const review = {
    retrospective: {
      source_candidates: [{
        source_id: "CAND-OFFICIAL-1",
        title: "Amtliche Statistik",
        institution: "Amtliche Stelle",
        canonical_url: "https://example.test/statistik",
        publication_date: "2026-08-15",
        retrieval_date: "2026-08-15",
        source_type: "OFFICIAL_STATISTICS",
        exact_location: "Tabelle 1",
        temporal_class: "PUBLISHED_AFTER_DECISION",
        needed_for: "Beobachtungswert",
        what_it_actually_supports: "Eine beschriebene Beobachtung.",
        what_it_does_not_support: "Keine kausale Zurechnung.",
        verification_status: "CANDIDATE_ONLY"
      }]
    }
  } as unknown as ReviewResult;
  const [candidate] = extractEvidenceCandidates(review);
  assert.equal(candidate.candidateKey, "CAND-OFFICIAL-1");
  assert.equal(candidate.temporalClass, "PUBLISHED_AFTER_DECISION");
  assert.throws(() => extractEvidenceCandidates({
    retrospective: { source_candidates: [{ ...candidate.payload, verification_status: "VERIFIED" }] }
  } as unknown as ReviewResult));
});

test("review ZIP contains only the defined review contract", async () => {
  const batch: ReviewBatchPackage = {
    schema_version: "1.0.0",
    batch_code: "WOEK-REVIEW-2026-0001",
    review_type: "FULL_REVIEW",
    created_at: "2026-08-14T12:00:00.000Z",
    package_hash: "b".repeat(64),
    cases: [{
      case_id: "11111111-1111-4111-8111-111111111111",
      case_title: "Beispielvorgang",
      review_type: "FULL_REVIEW",
      previous_review_id: null,
      decision: { decision_unit_id: null, decision_object: "Abgegrenzter Gegenstand", decision_date: "2026-08-14", parliamentary_status: "amtlich belegt", final_version: "Fassung 1", actual_outcome: null, vote_type: null, vote_result: {} },
      fact_package: {},
      source_manifest: [{ source_id: "SRC-1", title: "Amtliche Quelle", institution: "Deutscher Bundestag – DIP", url: "https://dip.bundestag.de/vorgang/1", document_date: "2026-08-14", retrieved_at: "2026-08-14T12:00:00.000Z", document_type: "DIP_VORGANG", version: null, temporal_class: "AVAILABLE_AT_DECISION_TIME", relevant_locations: [] }],
      excerpts: [],
      evidence: { ex_ante_source_ids: ["SRC-1"], ex_post_source_ids: [] },
      woek_reference_snapshot: { version: "1" },
      normative_reference_catalog: [],
      review_request: { questions_to_answer: ["Prüfen"], required_outputs: ["Struktur"], known_data_gaps: [], known_source_conflicts: [], calculation_inputs_available: [], calculation_inputs_missing: [] },
      package_hash: "a".repeat(64)
    }]
  };
  const zip = await createReviewZip(batch);
  assert.equal(zip.filename, "woek-review-2026-0001.zip");
  assert.ok(zip.bytes.byteLength > 0);
});

test("protected-schema writes carry the PostgREST content profile", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://database.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  let requestHeaders: Headers | undefined;
  globalThis.fetch = async (_input, init) => {
    requestHeaders = new Headers(init?.headers);
    return new Response("[]", { status: 201, headers: { "content-type": "application/json" } });
  };

  try {
    await supabaseRest("parliament.parliaments", { method: "POST", body: "{}" });
    assert.equal(requestHeaders?.get("Accept-Profile"), "parliament");
    assert.equal(requestHeaders?.get("Content-Profile"), "parliament");
    assert.equal(requestHeaders?.get("apikey"), "test-key");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});

test("successful minimal database writes do not require a JSON body", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://database.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  globalThis.fetch = async () => new Response(null, { status: 201 });

  try {
    const result = await supabaseRest<void>("parliament.parliaments", { method: "POST", body: "{}" });
    assert.equal(result, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});

test("DIP's repeated final cursor closes a complete paginated import", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.DIP_API_KEY;
  process.env.DIP_API_KEY = "a".repeat(42);
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return Response.json(requestCount === 1
      ? { documents: [{ id: "first" }], cursor: "final-page", numFound: 2 }
      : { documents: [{ id: "second" }], cursor: "final-page", numFound: 2 });
  };

  try {
    const result = await fetchAllDipPages("vorgang");
    assert.equal(result.pageCount, 2);
    assert.deepEqual(result.documents, [{ id: "first" }, { id: "second" }]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.DIP_API_KEY;
    else process.env.DIP_API_KEY = originalKey;
  }
});

test("DIP full-text resources are explicitly permitted for review packages", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.DIP_API_KEY;
  process.env.DIP_API_KEY = "a".repeat(42);
  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return Response.json({ documents: [], numFound: 0 });
  };
  try {
    await fetchDipResource("drucksache-text", { "f.wahlperiode": "21" });
    assert.match(requestedUrl, /\/drucksache-text\?/);
    await assert.rejects(() => fetchDipResource("unbekannt"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.DIP_API_KEY;
    else process.env.DIP_API_KEY = originalKey;
  }
});

test("DIP full-text documents retain their official nested PDF URL", () => {
  const document = normalizeDipDrucksache({
    id: "12345",
    titel: "Amtliche Drucksache",
    datum: "2026-08-15",
    dokumentart: "Drucksache",
    vorgangsbezug: [{ id: "54321" }],
    fundstelle: { pdf_url: "https://dserver.bundestag.de/btd/21/001/2100123.pdf" },
    text: "Amtlicher Volltext"
  });
  assert.equal(document?.sourceUrl, "https://dserver.bundestag.de/btd/21/001/2100123.pdf");
  assert.equal(document?.extractedText, "Amtlicher Volltext");
});

test("official full text is fully retained when DIP supplies one long paragraph", () => {
  const text = "Amtlicher Satz ".repeat(3_000);
  const chunks = chunkText(text, 3_500);
  assert.ok(chunks.length > 1);
  assert.equal(chunks.join("").replace(/\s+/g, ""), text.trim().replace(/\s+/g, ""));
});

test("only a formal DIP decision position creates a decision unit candidate", () => {
  const position = normalizeDipDecisionPosition({
    id: "98765",
    vorgang_id: "54321",
    vorgangsposition: "Abschließende Beratung",
    datum: "2026-08-15",
    fundstelle: { id: "12345", dokumentart: "Drucksache", pdf_url: "https://dserver.bundestag.de/btd/21/001/2100123.pdf" },
    beschlussfassung: [{ beschlusstenor: "Annahme der Vorlage", abstimmungsart: "Namentliche Abstimmung", abstimm_ergebnis_bemerkung: "Mehrheit" }]
  });
  assert.equal(position?.linkedExternalCaseId, "54321");
  assert.equal(position?.actualOutcome, "Annahme der Vorlage");
  assert.equal(position?.namedVoteAvailable, true);
  assert.equal(position?.linkedDocumentId, "12345");
  assert.equal(normalizeDipDecisionPosition({ id: "98766", vorgang_id: "54321", beschlussfassung: [] }), null);
});

test("an incorrectly configured DIP key is rejected before an external request", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.DIP_API_KEY;
  process.env.DIP_API_KEY = "too-short";
  let requestMade = false;
  globalThis.fetch = async () => {
    requestMade = true;
    return Response.json({ documents: [] });
  };
  try {
    await assert.rejects(() => fetchDipResource("vorgang"), /invalid format/);
    assert.equal(requestMade, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.DIP_API_KEY;
    else process.env.DIP_API_KEY = originalKey;
  }
});

test("commitment implementation cannot masquerade as an impact assessment", () => {
  assert.equal(canPublishComparison({
    relationshipStatus: "ADVANCES",
    verificationStatus: "PROPOSED",
    sourceRefs: ["SOURCE-1"],
    factualRationale: "Ungeprüfte Zuordnung"
  }), false);
  assert.equal(canPublishComparison({
    relationshipStatus: "ADVANCES",
    verificationStatus: "EDITORIALLY_VERIFIED",
    sourceRefs: ["SOURCE-1"],
    factualRationale: "Amtliche finale Fassung und konkrete Vertragsstelle sind belegt."
  }), true);
  assert.equal(impactLabel("NOT_STARTED"), "Wirkungscheck noch nicht begonnen");
});

test("member vote ledger does not turn abstentions or absences into wrong votes", () => {
  assert.equal(agreementForNamedVote("YES", "YES"), "ALIGNED");
  assert.equal(agreementForNamedVote("NO", "YES"), "NOT_ALIGNED");
  assert.equal(agreementForNamedVote("ABSTENTION", "YES"), "ABSTAINED");
  assert.equal(agreementForNamedVote("DID_NOT_VOTE", "YES"), "DID_NOT_VOTE");
  assert.equal(agreementForNamedVote("YES", "NO_SCORE"), "NOT_SCORABLE");
  assert.deepEqual(summarizeVoteLedger(["ALIGNED", "NOT_ALIGNED", "ABSTAINED", "DID_NOT_VOTE", "NOT_SCORABLE"]), {
    scorable: 2,
    aligned: 1,
    notAligned: 1,
    abstained: 1,
    didNotVote: 1,
    notScorable: 1,
    agreementRate: 0.5
  });
});

test("official named-vote rows retain only explicit ballot values", () => {
  const headers = ["Wahlperiode", "Sitzungnr", "Abstimmnr", "Fraktion/Gruppe", "Name", "Vorname", "ja", "nein", "Enthaltung", "ungültig", "nichtabgegeben"];
  const source = "https://www.bundestag.de/resource/blob/1234567/20251219_1_xls.xlsx";
  assert.equal(isOfficialNamedVoteXlsxUrl(source), true);
  assert.equal(isOfficialNamedVoteXlsxUrl("https://example.test/vote.xlsx"), false);
  assert.deepEqual(
    mapOfficialNamedVoteCells(headers, ["21", "42", "3", "Beispiel", "Muster", "Max", "0", "0", "1", "0", "0"], source),
    { legislativeTerm: "21", sittingNumber: "42", voteNumber: "3", parliamentaryGroup: "Beispiel", familyName: "Muster", givenName: "Max", actualVote: "ABSTENTION", sourceUrl: source }
  );
  assert.equal(mapOfficialNamedVoteCells(headers, ["21", "42", "3", "Beispiel", "Muster", "Max", "0", "0", "0", "1", "0"], source), null);
  assert.equal(mapOfficialNamedVoteCells(headers, ["21", "42", "3", "Beispiel", "Muster", "Max", "1", "1", "0", "0", "0"], source), null);
});

test("only official document numbers form a named-vote case bridge", () => {
  assert.deepEqual(documentNumbersFromOfficialVoteResult("Drucksachen 21/228 und 21/443\nSitzung 13"), ["21/228", "21/443"]);
  assert.equal(officialDrucksachePdfUrl("21/443"), "https://dserver.bundestag.de/btd/21/004/2100443.pdf");
  assert.equal(officialDrucksachePdfUrl("not-a-drucksache"), null);
});

test("mandate source catalog contains only HTTPS original assets", () => {
  assert.equal(politicalSourceCatalog.length, 7);
  assert.equal(politicalSourceCatalog.reduce((total, source) => total + source.commitmentCount, 0), 1593);
  assert.deepEqual(
    Object.fromEntries(politicalSourceCatalog.map((source) => [source.sourceKey, source.commitmentCount])),
    {
      "btw-2025-cdu-csu": 168,
      "btw-2025-spd": 200,
      "btw-2025-gruene": 292,
      "btw-2025-afd": 103,
      "btw-2025-linke": 200,
      "btw-2025-ssw": 283,
      "coalition-2025-cdu-csu-spd": 347
    }
  );
  for (const source of politicalSourceCatalog) {
    assert.match(source.canonicalUrl, /^https:\/\//);
    assert.match(source.downloadAssetUrl, /^https:\/\//);
  }
});

test("commitment registers never expose raw import labels as public headings", () => {
  assert.deepEqual(
    publicCommitmentDisplay({ title: "34 -", text: "Wir sorgen für eine verlässliche Finanzierung tierwohlgerechter Haltung.", policyDomain: "HEALTH_CARE" }),
    { title: "Wir sorgen für eine verlässliche Finanzierung tierwohlgerechter Haltung", policyDomain: "Gesundheit und Pflege" }
  );
});

test("Wirkungsradar updates require explicit consent and at least one requested topic", () => {
  const valid = subscriptionRequestSchema.parse({
    email: "office@example.test",
    recipient_type: "PARLIAMENTARY_OFFICE",
    topics: ["UPCOMING_DECISIONS"],
    consent: true
  });
  assert.equal(valid.email, "office@example.test");
  assert.throws(() => subscriptionRequestSchema.parse({
    email: "office@example.test",
    recipient_type: "PARLIAMENTARY_OFFICE",
    topics: ["UPCOMING_DECISIONS"],
    consent: false
  }));
  assert.throws(() => subscriptionRequestSchema.parse({
    email: "office@example.test",
    recipient_type: "PUBLIC",
    topics: [],
    consent: true
  }));
});

test("the general newsletter is a separate opt-in tenant with explicit consent", () => {
  const valid = newsletterRequestSchema.parse({ email: "reader@example.test", consent: true, consent_source: "wirkungsoekonomie.de/" });
  assert.equal(valid.email, "reader@example.test");
  assert.throws(() => newsletterRequestSchema.parse({ email: "reader@example.test", consent: false }));
  assert.throws(() => newsletterRequestSchema.parse({ email: "not-an-email", consent: true }));
});

test("the general newsletter stays unavailable without its own delivery configuration", () => {
  const keys = ["WOEK_NEWSLETTER_EMAIL_SEND_MODE", "WOEK_NEWSLETTER_DELIVERY_PROVIDER", "WOEK_NEWSLETTER_OPTIN_GATEWAY_URL", "WOEK_NEWSLETTER_OPTIN_GATEWAY_TOKEN", "WOEK_NEWSLETTER_PUBLIC_SIGNUP_ENABLED"] as const;
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  try {
    assert.equal(newsletterDeliveryReady(), false);
  } finally {
    for (const key of keys) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("Wirkungsradar delivery stays unavailable without an explicitly configured production gateway", () => {
  const originalMode = process.env.WIRKUNGSRADAR_EMAIL_SEND_MODE;
  const originalProvider = process.env.WIRKUNGSRADAR_DELIVERY_PROVIDER;
  const originalUrl = process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_URL;
  const originalToken = process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_TOKEN;
  delete process.env.WIRKUNGSRADAR_EMAIL_SEND_MODE;
  delete process.env.WIRKUNGSRADAR_DELIVERY_PROVIDER;
  delete process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_URL;
  delete process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_TOKEN;
  try {
    assert.equal(subscriptionDeliveryReady(), false);
  } finally {
    if (originalMode === undefined) delete process.env.WIRKUNGSRADAR_EMAIL_SEND_MODE;
    else process.env.WIRKUNGSRADAR_EMAIL_SEND_MODE = originalMode;
    if (originalProvider === undefined) delete process.env.WIRKUNGSRADAR_DELIVERY_PROVIDER;
    else process.env.WIRKUNGSRADAR_DELIVERY_PROVIDER = originalProvider;
    if (originalUrl === undefined) delete process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_URL;
    else process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_URL = originalUrl;
    if (originalToken === undefined) delete process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_TOKEN;
    else process.env.WIRKUNGSRADAR_OPTIN_GATEWAY_TOKEN = originalToken;
  }
});

test("Wirkungsradar can use explicitly configured IONOS SMTP without exposing it to the browser", () => {
  const keys = [
    "WIRKUNGSRADAR_EMAIL_SEND_MODE",
    "WIRKUNGSRADAR_DELIVERY_PROVIDER",
    "WIRKUNGSRADAR_SMTP_HOST",
    "WIRKUNGSRADAR_SMTP_PORT",
    "WIRKUNGSRADAR_SMTP_USER",
    "WIRKUNGSRADAR_SMTP_PASSWORD",
    "WIRKUNGSRADAR_SMTP_FROM",
    "WIRKUNGSRADAR_SMTP_REPLY_TO",
    "WIRKUNGSRADAR_PUBLIC_SIGNUP_ENABLED"
  ] as const;
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  Object.assign(process.env, {
    WIRKUNGSRADAR_EMAIL_SEND_MODE: "production",
    WIRKUNGSRADAR_DELIVERY_PROVIDER: "ionos_smtp",
    WIRKUNGSRADAR_SMTP_HOST: "smtp.ionos.de",
    WIRKUNGSRADAR_SMTP_PORT: "587",
    WIRKUNGSRADAR_SMTP_USER: "wirkungscheck@wirkungsoekonomie.de",
    WIRKUNGSRADAR_SMTP_PASSWORD: "test-secret-only",
    WIRKUNGSRADAR_SMTP_FROM: "Wirkungsportal Parlament <wirkungscheck@wirkungsoekonomie.de>",
    WIRKUNGSRADAR_SMTP_REPLY_TO: "wirkungscheck@wirkungsoekonomie.de",
    WIRKUNGSRADAR_PUBLIC_SIGNUP_ENABLED: "true"
  });
  try {
    assert.equal(subscriptionDeliveryReady(), true);
  } finally {
    for (const key of keys) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

import { z } from "zod";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { assertExternalReviewSafe, sha256 } from "@/lib/review/privacy";

const sourceId = "sachsen-anhalt-nachhaltigkeitsstrategie-2022";
const sourceHash = "07654ed01f23a8cc5bd81321e9a9bba1e38aeb59978c29f4fad05fd9b4ef849b";
const targetCount = 28;

const targetSchema = z.object({
  id: z.string().regex(/^st-sa-2022-\d{3}$/),
  jurisdiction_id: z.literal("sachsen-anhalt"),
  label: z.string().min(3).max(400),
  source_quote: z.string().min(3).max(2_000),
  source_location: z.object({ page: z.number().int().positive(), section: z.string().min(1).max(600) }),
  // Both `SDG_3` and the zero-padded form used by the official state-target
  // register (`SDG_03`) are source identifiers, not scores.  Retaining the
  // source form prevents an import from silently rewriting a cited register.
  sdg_codes: z.array(z.string().regex(/^SDG_(?:0?[1-9]|1[0-7])$/)).max(17),
  indicator_refs: z.array(z.string().min(1).max(400)).max(30),
  target_type: z.enum(["QUANTIFIED", "DIRECTIONAL", "RULE_BASED"]),
  // A target can be a single number, a source-bound multi-part value (for
  // example separate targets for women and men), or a rule-based condition.
  // Do not coerce those source statements into invented scalar values.
  target_value: z.object({
    value: z.union([z.number().finite(), z.string().min(1).max(240)]).nullable(),
    unit: z.string().max(160).nullable(),
    target_date: z.string().date().nullable()
  }),
  measurement_boundary: z.string().min(3).max(2_000),
  effect_space: z.object({
    sachsen_anhalt: z.string().min(3).max(2_000),
    other_states_or_federal: z.string().min(3).max(2_000),
    europe_or_global: z.string().min(3).max(2_000),
    status: z.enum(["EVIDENCE_OPEN", "SOURCE_SUPPORTED"])
  }),
  valid_from: z.literal("2022-09-20"),
  valid_to: z.string().date().nullable(),
  source_ref: z.literal(sourceId)
}).superRefine((target, context) => {
  if (target.target_type === "QUANTIFIED" && target.target_value.value === null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["target_value"], message: "Quantified targets require a source-backed value." });
  }
  if (target.target_type === "QUANTIFIED" && target.target_value.unit === null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["target_value"], message: "Quantified targets require a source-backed unit." });
  }
});

export const stateTargetRegisterSchema = z.object({
  schema_version: z.literal("1.0.0"),
  register_id: z.literal(sourceId),
  jurisdiction_id: z.literal("sachsen-anhalt"),
  source: z.object({
    title: z.string().min(1).max(600),
    published_at: z.literal("2022-09-20"),
    source_url: z.string().url(),
    source_sha256: z.literal(sourceHash),
    declared_target_count: z.literal(targetCount)
  }),
  targets: z.array(targetSchema).length(targetCount)
}).superRefine((register, context) => {
  const targetIds = new Set(register.targets.map((target) => target.id));
  if (targetIds.size !== targetCount) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["targets"], message: "Target IDs must be unique." });
  }
});

export type StateTargetRegister = z.infer<typeof stateTargetRegisterSchema>;

type StoredRegister = { id: string };

export async function importStateTargetRegister(input: unknown) {
  assertExternalReviewSafe(input, "state-target-register");
  const register = stateTargetRegisterSchema.parse(input);
  const payloadHash = sha256(register);
  const existing = await supabaseRest<StoredRegister[]>(
    `parliament.state_target_registers?register_key=eq.${encodeURIComponent(register.register_id)}&source_sha256=eq.${register.source.source_sha256}&select=id&limit=1`
  );
  const basePayload = {
    register_key: register.register_id,
    parliament_id: "landtag-st-2026",
    jurisdiction_id: register.jurisdiction_id,
    title: register.source.title,
    source_url: register.source.source_url,
    source_sha256: register.source.source_sha256,
    source_published_at: register.source.published_at,
    declared_target_count: register.source.declared_target_count,
    register_status: "STRUCTURED_AND_VALIDATED",
    imported_payload: { ...register, payload_hash: payloadHash }
  };
  const registerId = existing[0]?.id ?? (await supabaseRest<StoredRegister[]>("parliament.state_target_registers", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(basePayload)
  }))[0]?.id;
  if (!registerId) throw new Error("State target register could not be stored.");

  if (existing[0]) {
    await supabaseRest(`parliament.state_target_registers?id=eq.${encodeURIComponent(registerId)}`, {
      method: "PATCH",
      body: JSON.stringify(basePayload)
    });
    await supabaseRest(`parliament.state_targets?register_id=eq.${encodeURIComponent(registerId)}`, { method: "DELETE" });
  }

  const rows = register.targets.map((target) => ({
    register_id: registerId,
    target_key: target.id,
    label: target.label,
    source_quote: target.source_quote,
    source_page: target.source_location.page,
    source_section: target.source_location.section,
    sdg_codes: target.sdg_codes,
    indicator_refs: target.indicator_refs,
    target_type: target.target_type,
    target_value: target.target_value,
    measurement_boundary: target.measurement_boundary,
    effect_space: target.effect_space,
    valid_from: target.valid_from,
    valid_to: target.valid_to,
    source_ref: target.source_ref,
    imported_payload: target
  }));
  await supabaseRest("parliament.state_targets", { method: "POST", body: JSON.stringify(rows) });
  return { registerId, registerKey: register.register_id, targetsImported: rows.length, payloadHash };
}

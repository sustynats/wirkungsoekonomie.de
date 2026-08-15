import publishedSaxonyAnhaltRegister from "@/data/generated/release-1/sachsen-anhalt-target-register.json";

export type StateTargetStatus = "SOURCE_CAPTURED" | "STRUCTURED_AND_VALIDATED" | "PUBLISHED";

export type StateTarget = {
  id: string;
  jurisdictionId: string;
  label: string;
  sourceQuote: string;
  sdgCodes: string[];
  sourceLocation: { page: number; section: string };
  indicatorRefs: string[];
  targetType: "QUANTIFIED" | "DIRECTIONAL" | "RULE_BASED";
  targetValue: { value: number | string; unit: string; targetDate: string | null } | null;
  measurementBoundary: string;
  effectSpace: { sachsenAnhalt: string; otherStatesOrFederal: string; europeOrGlobal: string; status: string };
  validFrom: string;
  validTo?: string;
  sourceRef: string;
};

export type StateTargetRegister = {
  id: string;
  jurisdictionId: string;
  title: string;
  sourceUrl: string;
  sourceSha256: string;
  sourcePublishedAt: string;
  declaredTargetCount: number;
  sourceRange: string;
  status: StateTargetStatus;
  targets: StateTarget[];
  notes: string;
};

type RawTarget = {
  id?: string;
  jurisdiction_id?: string;
  label?: string;
  source_quote?: string;
  source_location?: { page?: number; section?: string };
  sdg_codes?: string[];
  indicator_refs?: string[];
  target_type?: StateTarget["targetType"];
  target_value?: { value?: number | string | null; unit?: string; target_date?: string | null } | null;
  measurement_boundary?: string;
  effect_space?: { sachsen_anhalt?: string; other_states_or_federal?: string; europe_or_global?: string; status?: string };
  valid_from?: string;
  valid_to?: string;
  source_ref?: string;
};

type RawRegister = {
  register_id?: string;
  jurisdiction_id?: string;
  source?: { title?: string; canonical_url?: string; source_sha256?: string; document_date?: string; source_range?: string };
  targets?: RawTarget[];
};

const raw = publishedSaxonyAnhaltRegister as unknown as RawRegister;

const targets: StateTarget[] = (raw.targets ?? []).map((target) => ({
  id: target.id ?? "",
  jurisdictionId: target.jurisdiction_id ?? "sachsen-anhalt",
  label: target.label ?? "Ohne Bezeichnung",
  sourceQuote: target.source_quote ?? "",
  sourceLocation: { page: target.source_location?.page ?? 0, section: target.source_location?.section ?? "" },
  sdgCodes: target.sdg_codes ?? [],
  indicatorRefs: target.indicator_refs ?? [],
  targetType: target.target_type ?? "DIRECTIONAL",
  targetValue: target.target_value?.value == null ? null : { value: target.target_value.value, unit: target.target_value.unit ?? "", targetDate: target.target_value.target_date ?? null },
  measurementBoundary: target.measurement_boundary ?? "",
  effectSpace: {
    sachsenAnhalt: target.effect_space?.sachsen_anhalt ?? "",
    otherStatesOrFederal: target.effect_space?.other_states_or_federal ?? "",
    europeOrGlobal: target.effect_space?.europe_or_global ?? "",
    status: target.effect_space?.status ?? ""
  },
  validFrom: target.valid_from ?? "",
  validTo: target.valid_to || undefined,
  sourceRef: target.source_ref ?? ""
}));

export const stateTargetRegisters: StateTargetRegister[] = [{
  id: raw.register_id ?? "sachsen-anhalt-nachhaltigkeitsstrategie-2022",
  jurisdictionId: raw.jurisdiction_id ?? "sachsen-anhalt",
  title: raw.source?.title ?? "Nachhaltigkeitsstrategie des Landes Sachsen-Anhalt – Neuauflage 2022",
  sourceUrl: raw.source?.canonical_url ?? "",
  sourceSha256: raw.source?.source_sha256 ?? "",
  sourcePublishedAt: raw.source?.document_date ?? "2022-09-20",
  declaredTargetCount: targets.length,
  sourceRange: raw.source?.source_range ?? "",
  status: "PUBLISHED",
  targets,
  notes: "Die Zieltexte, Fundstellen, Indikatorbezüge und Wirkungsräume werden aus der landeseigenen Nachhaltigkeitsstrategie nachgewiesen. Die Ziele ergänzen den gemeinsamen SDG-Rahmen; sie ersetzen weder eine konkrete Zuständigkeitsprüfung noch eine Wirkungsanalyse."
}];

export function stateTargetRegisterForJurisdiction(jurisdictionId: string) {
  return stateTargetRegisters.find((register) => register.jurisdictionId === jurisdictionId);
}

const DIP_BASE_URL = "https://search.dip.bundestag.de/api/v1";

export type DipResource = "vorgang" | "vorgangsposition" | "drucksache" | "aktivitaet" | "plenarprotokoll";

export type DipRequest = {
  resource: DipResource;
  params?: Record<string, string | number | boolean | undefined>;
};

export type DipListResponse<T> = {
  cursor?: string;
  numFound?: number;
  documents?: T[];
};

export type DipImportWindow = {
  mode: "BOOTSTRAP" | "LOOKAHEAD";
  from: string;
  to: string;
  reviewState: "IMPORTED_UNREVIEWED";
};

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

/**
 * Builds work windows only. Filtering fields are deliberately not hard-coded:
 * the current DIP OpenAPI contract is the source of truth and lives in the
 * adapter configuration in the production import worker.
 */
export function buildImportWindows(now = new Date(), leadDays = 10): DipImportWindow[] {
  const safeLeadDays = Math.min(14, Math.max(7, leadDays));
  const lookaheadEnd = new Date(now);
  lookaheadEnd.setUTCDate(lookaheadEnd.getUTCDate() + safeLeadDays);
  return [
    { mode: "BOOTSTRAP", from: `${now.getUTCFullYear()}-01-01`, to: toIsoDate(now), reviewState: "IMPORTED_UNREVIEWED" },
    { mode: "LOOKAHEAD", from: toIsoDate(now), to: toIsoDate(lookaheadEnd), reviewState: "IMPORTED_UNREVIEWED" }
  ];
}

export function getDipConfiguration() {
  return {
    configured: Boolean(process.env.DIP_API_KEY),
    baseUrl: DIP_BASE_URL,
    requestedLeadDays: Math.min(14, Math.max(7, Number(process.env.DIP_LOOKAHEAD_DAYS ?? 10))),
    legislativeTerm: Math.max(1, Number(process.env.DIP_WAHLPERIODE ?? 21)),
    importMaxPages: Math.min(20, Math.max(1, Number(process.env.DIP_IMPORT_MAX_PAGES ?? 10)))
  };
}

export async function requestDip<T>({ resource, params = {} }: DipRequest): Promise<T> {
  const apiKey = process.env.DIP_API_KEY;
  if (!apiKey) throw new Error("DIP_API_KEY_MISSING");
  const url = new URL(`${DIP_BASE_URL}/${resource}`);
  for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
  const response = await fetch(url, {
    headers: { Authorization: `ApiKey ${apiKey}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`DIP_REQUEST_FAILED_${response.status}`);
  return response.json() as Promise<T>;
}

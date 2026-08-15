import { z } from "zod";

const dipEnvelopeSchema = z.object({
  documents: z.array(z.unknown()).default([]),
  cursor: z.string().optional(),
  numFound: z.number().optional()
}).passthrough();

export type DipPage = z.infer<typeof dipEnvelopeSchema>;

const baseUrl = "https://search.dip.bundestag.de/api/v1";
const permittedResources = new Set([
  "vorgang",
  "vorgangsposition",
  "drucksache",
  "drucksache-text",
  "plenarprotokoll",
  "plenarprotokoll-text",
  "aktivitaet",
  "person"
]);

export class DipConfigurationError extends Error {}

function getDipApiKey() {
  const apiKey = process.env.DIP_API_KEY?.trim();
  if (!apiKey) throw new DipConfigurationError("DIP_API_KEY is not configured. Live import remains disabled.");
  // DIP documents the current API-key format as a 42-character token. Failing
  // before the request makes a misconfigured deployment diagnosable without
  // ever exposing the secret in logs or a health response.
  if (apiKey.length !== 42) {
    throw new DipConfigurationError("DIP_API_KEY has an invalid format. The DIP import remains disabled.");
  }
  return apiKey;
}

export async function fetchDipResource(resource: string, params: Record<string, string> = {}): Promise<DipPage> {
  const apiKey = getDipApiKey();
  if (!permittedResources.has(resource)) throw new Error("Invalid DIP resource.");
  const url = new URL(`${baseUrl}/${resource}`);
  url.searchParams.set("format", "json");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: { Authorization: `ApiKey ${apiKey}`, Accept: "application/json" },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`DIP request failed with ${response.status}.`);
  return dipEnvelopeSchema.parse(await response.json());
}

export async function fetchDipRecord(resource: string, id: string) {
  const apiKey = getDipApiKey();
  if (!permittedResources.has(resource) || !/^[A-Za-z0-9._-]+$/.test(id)) throw new Error("Invalid DIP record request.");
  const response = await fetch(`${baseUrl}/${resource}/${encodeURIComponent(id)}?format=json`, {
    headers: { Authorization: `ApiKey ${apiKey}`, Accept: "application/json" },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`DIP record request failed with ${response.status}.`);
  return response.json() as Promise<unknown>;
}

/** Cursor pagination is mandatory: a partial result set must never be silently
 * treated as a completed parliamentary import. DIP signals the last page by
 * returning the same cursor value as in the preceding response. */
export async function fetchAllDipPages(resource: string, params: Record<string, string> = {}, maxPages = 1_000) {
  const documents: unknown[] = [];
  let cursor: string | undefined;
  let previousCursor: string | undefined;
  let pageCount = 0;

  do {
    if (pageCount >= maxPages) throw new Error(`DIP pagination exceeded ${maxPages} pages.`);
    const page = await fetchDipResource(resource, cursor ? { ...params, cursor } : params);
    documents.push(...page.documents);
    previousCursor = cursor;
    cursor = page.cursor;
    pageCount += 1;
    if (cursor && cursor === previousCursor) break;
  } while (cursor);

  return { documents, pageCount };
}

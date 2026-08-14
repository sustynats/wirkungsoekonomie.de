import { z } from "zod";

const dipEnvelopeSchema = z.object({
  documents: z.array(z.unknown()).default([]),
  cursor: z.string().optional(),
  numFound: z.number().optional()
}).passthrough();

const baseUrl = "https://search.dip.bundestag.de/api/v1";

export class DipConfigurationError extends Error {}

export async function fetchDipResource(resource: string, params: Record<string, string> = {}) {
  const apiKey = process.env.DIP_API_KEY;
  if (!apiKey) throw new DipConfigurationError("DIP_API_KEY is not configured. Live import remains disabled.");
  if (!/^[a-z]+$/i.test(resource)) throw new Error("Invalid DIP resource.");
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
  const apiKey = process.env.DIP_API_KEY;
  if (!apiKey) throw new DipConfigurationError("DIP_API_KEY is not configured. Live import remains disabled.");
  if (!/^[a-z]+$/i.test(resource) || !/^[A-Za-z0-9._-]+$/.test(id)) throw new Error("Invalid DIP record request.");
  const response = await fetch(`${baseUrl}/${resource}/${encodeURIComponent(id)}?format=json`, {
    headers: { Authorization: `ApiKey ${apiKey}`, Accept: "application/json" },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error(`DIP record request failed with ${response.status}.`);
  return response.json() as Promise<unknown>;
}

/** Cursor pagination is mandatory: a partial result set must never be silently
 * treated as a completed parliamentary import. */
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
    if (cursor && cursor === previousCursor) throw new Error("DIP pagination cursor did not advance.");
  } while (cursor);

  return { documents, pageCount };
}

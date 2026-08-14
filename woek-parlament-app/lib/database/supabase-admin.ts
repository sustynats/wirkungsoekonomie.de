type RequestInitWithoutHeaders = Omit<RequestInit, "headers"> & { headers?: HeadersInit };

const protectedSchema = "parliament";

export class DatabaseConfigurationError extends Error {}

function configuration() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new DatabaseConfigurationError("Protected database access is not configured.");
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:") throw new DatabaseConfigurationError("Protected database URL must use HTTPS.");
  return { url: parsedUrl.toString().replace(/\/$/, ""), serviceRoleKey };
}

export async function supabaseAdminRequest<T>(path: string, init: RequestInitWithoutHeaders = {}) {
  const { url, serviceRoleKey } = configuration();
  const response = await fetch(`${url}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...init.headers
    },
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(20_000)
  });
  if (!response.ok) {
    const requestId = response.headers.get("x-request-id");
    throw new Error(`Protected database request failed (${response.status}${requestId ? `; request ${requestId}` : ""}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function supabaseRest<T>(path: string, init: RequestInitWithoutHeaders = {}) {
  const normalized = path.replace(/^\//, "");
  const useProtectedSchema = normalized.startsWith(`${protectedSchema}.`);
  const target = useProtectedSchema ? normalized.slice(protectedSchema.length + 1) : normalized;
  const headers = new Headers(init.headers);
  if (useProtectedSchema) headers.set("Accept-Profile", protectedSchema);
  return supabaseAdminRequest<T>(`/rest/v1/${target}`, { ...init, headers });
}

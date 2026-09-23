type RequestInitWithoutHeaders = Omit<RequestInit, "headers"> & { headers?: HeadersInit };

const protectedSchema = "parliament";

export class DatabaseConfigurationError extends Error {}

function supabaseUrl(value: string | undefined, serviceRoleKey: string) {
  if (value) {
    try {
      const direct = new URL(value.trim());
      if (direct.protocol === "https:") return direct;
    } catch {
      // A copied legacy value can be invalid. A Supabase JWT can recover the
      // public project endpoint without exposing or transmitting the key.
    }
  }
  try {
    const segments = serviceRoleKey.split(".");
    if (segments.length !== 3) throw new Error("not a JWT");
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")) as {
      iss?: unknown;
      ref?: unknown;
      role?: unknown;
    };
    if (payload.iss !== "supabase" || payload.role !== "service_role" || typeof payload.ref !== "string" || !/^[a-z0-9]{20}$/.test(payload.ref)) {
      throw new Error("unexpected Supabase JWT claims");
    }
    return new URL(`https://${payload.ref}.supabase.co`);
  } catch {
    throw new DatabaseConfigurationError("Protected database URL is invalid and cannot be recovered from the configured service role key.");
  }
}

function configuration() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new DatabaseConfigurationError("Protected database access is not configured.");
  const parsedUrl = supabaseUrl(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
  return { url: parsedUrl.toString().replace(/\/$/, ""), serviceRoleKey };
}

export async function supabaseAdminRequest<T>(path: string, init: RequestInitWithoutHeaders = {}) {
  const { url, serviceRoleKey } = configuration();
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${url}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(20_000)
  });
  if (!response.ok) {
    const requestId = response.headers.get("x-request-id");
    const responseDetail = (await response.text())
      .replace(/https?:\/\/\S+/g, "[redacted-url]")
      .slice(0, 600);
    throw new Error(
      `Protected database request failed (${response.status}${requestId ? `; request ${requestId}` : ""})` +
      `${responseDetail ? `: ${responseDetail}` : "."}`
    );
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
  const responseText = await response.text();
  if (!responseText.trim()) return undefined as T;
  return JSON.parse(responseText) as T;
}

export async function supabaseRest<T>(path: string, init: RequestInitWithoutHeaders = {}) {
  const normalized = path.replace(/^\//, "");
  const useProtectedSchema = normalized.startsWith(`${protectedSchema}.`);
  const target = useProtectedSchema ? normalized.slice(protectedSchema.length + 1) : normalized;
  const headers = new Headers(init.headers);
  if (useProtectedSchema) {
    headers.set("Accept-Profile", protectedSchema);
    // PostgREST uses a separate profile header for write operations. Without
    // it, a POST/PATCH could be interpreted against the default schema even
    // though reads correctly use the protected parliament schema.
    if (!["GET", "HEAD"].includes((init.method ?? "GET").toUpperCase())) {
      headers.set("Content-Profile", protectedSchema);
    }
  }
  return supabaseAdminRequest<T>(`/rest/v1/${target}`, { ...init, headers });
}

export async function supabaseRpc<T>(functionName: string, args: Record<string, unknown> = {}) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(functionName)) {
    throw new DatabaseConfigurationError("Invalid protected database function name.");
  }
  return supabaseAdminRequest<T>(`/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      "Accept-Profile": protectedSchema,
      "Content-Profile": protectedSchema
    },
    body: JSON.stringify(args)
  });
}

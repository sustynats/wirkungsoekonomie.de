import "server-only";

type SupabaseOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  prefer?: string;
};

export type SupabaseConfiguration = {
  configured: boolean;
};

function getCredentials() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("SUPABASE_SERVER_CONFIGURATION_MISSING");
  return { url, serviceRoleKey };
}

export function getSupabaseConfiguration(): SupabaseConfiguration {
  return { configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) };
}

export async function supabaseRest<T>(path: string, options: SupabaseOptions = {}): Promise<T> {
  const { url, serviceRoleKey } = getCredentials();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(options.prefer ? { Prefer: options.prefer } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000)
  });
  if (!response.ok) throw new Error(`SUPABASE_REQUEST_FAILED_${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function supabaseRpc<T>(name: string, args: Record<string, unknown>) {
  return supabaseRest<T>(`rpc/${name}`, {
    method: "POST",
    body: args,
    prefer: "return=representation"
  });
}

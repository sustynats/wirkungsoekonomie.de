import assert from "node:assert/strict";
import test from "node:test";

import { supabaseAdminRequest } from "@/lib/database/supabase-admin";

function jwt(payload: Record<string, unknown>) {
  return [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "test-signature",
  ].join(".");
}

test("an invalid copied Supabase URL recovers only the matching official project endpoint", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SUPABASE_URL;
  const originalPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "invalid-copied-value";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = jwt({ iss: "supabase", ref: "abcdefghijklmnopqrst", role: "service_role" });

  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return Response.json([]);
  };

  try {
    assert.deepEqual(await supabaseAdminRequest<unknown[]>("/rest/v1/items"), []);
    assert.equal(requestedUrl, "https://abcdefghijklmnopqrst.supabase.co/rest/v1/items");
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries({
      SUPABASE_URL: originalUrl,
      NEXT_PUBLIC_SUPABASE_URL: originalPublicUrl,
      SUPABASE_SERVICE_ROLE_KEY: originalKey,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

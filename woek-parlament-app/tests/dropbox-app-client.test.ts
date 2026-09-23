import assert from "node:assert/strict";
import test from "node:test";

import { uploadDropboxText } from "@/lib/dropbox/app-client";

test("Dropbox uploads retry a temporary write throttle using the server delay", async (context) => {
  const originalFetch = globalThis.fetch;
  const originalCredentials = {
    appKey: process.env.DROPBOX_APP_KEY,
    appSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
  };
  process.env.DROPBOX_APP_KEY = "test-key";
  process.env.DROPBOX_APP_SECRET = "test-secret";
  process.env.DROPBOX_REFRESH_TOKEN = "test-refresh-token";
  const warn = context.mock.method(console, "warn", () => undefined);

  let uploadAttempts = 0;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/oauth2/token")) {
      return Response.json({ access_token: "test-token", scope: "files.content.write" });
    }
    if (url.endsWith("/files/create_folder_v2")) {
      return Response.json({ error_summary: "path/conflict/folder" }, { status: 409 });
    }
    if (url.endsWith("/files/upload")) {
      uploadAttempts += 1;
      if (uploadAttempts === 1) {
        return Response.json(
          { error: { reason: { ".tag": "too_many_write_operations" } }, retry_after: 0 },
          { status: 429, headers: { "retry-after": "0" } },
        );
      }
      return Response.json({ id: "id:test", path_display: "/WOEK/AUTOPILOT/state.json", rev: "1" });
    }
    throw new Error(`Unexpected Dropbox request: ${url}`);
  };

  try {
    const result = await uploadDropboxText("/WOEK/AUTOPILOT/state.json", "{}\n");
    assert.equal(result.rev, "1");
    assert.equal(uploadAttempts, 2);
    assert.equal(warn.mock.callCount(), 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries({
      DROPBOX_APP_KEY: originalCredentials.appKey,
      DROPBOX_APP_SECRET: originalCredentials.appSecret,
      DROPBOX_REFRESH_TOKEN: originalCredentials.refreshToken,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

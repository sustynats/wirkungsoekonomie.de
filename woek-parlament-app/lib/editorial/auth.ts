import { timingSafeEqual } from "node:crypto";

export class EditorialAuthorizationError extends Error {}

export function requireEditorialRequest(request: Request) {
  const expected = process.env.EDITORIAL_API_TOKEN;
  const provided = request.headers.get("x-woek-editorial-token");
  if (!expected) throw new EditorialAuthorizationError("Editorial API access is not configured.");
  if (!provided || provided.length !== expected.length) throw new EditorialAuthorizationError("Editorial API access denied.");
  if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) throw new EditorialAuthorizationError("Editorial API access denied.");
}

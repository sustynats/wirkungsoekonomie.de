import { NextRequest, NextResponse } from "next/server";

/**
 * Only the private operational status needs a request-time boundary. Public
 * pages deliberately bypass the proxy so that Next.js can prerender them and
 * Vercel can serve them from the static CDN without a Function invocation.
 */
export function proxy(request: NextRequest) {
  const configuredUser = process.env.AUTOPILOT_STATUS_USER;
  const configuredPassword = process.env.AUTOPILOT_STATUS_PASSWORD;
  const authorization = request.headers.get("authorization");
  const expected = configuredUser && configuredPassword ? `Basic ${Buffer.from(`${configuredUser}:${configuredPassword}`).toString("base64")}` : null;
  if (!expected || authorization !== expected) {
    return new NextResponse("Authentifizierung erforderlich.", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="WÖk Autopilot", charset="UTF-8"', "Cache-Control": "no-store" } });
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/autopilot/status/:path*",
    "/pruefstandard/transparenz/datenbetrieb/:path*"
  ]
};

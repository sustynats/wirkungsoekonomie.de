import { NextRequest, NextResponse } from "next/server";

function createNonce() {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

function contentSecurityPolicy(nonce: string) {
  const scriptSource = process.env.NODE_ENV === "development"
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `style-src 'self' 'nonce-${nonce}'`,
    `script-src ${scriptSource}`,
    "connect-src 'self' https://search.dip.bundestag.de https://akademie.wirkungsoekonomie.de",
    "upgrade-insecure-requests"
  ].join("; ");
}

/**
 * Dynamic CSP needs a fresh nonce for every rendered document. Next.js 16 uses
 * the term "proxy" for this request boundary.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/autopilot/status")) {
    const configuredUser = process.env.AUTOPILOT_STATUS_USER;
    const configuredPassword = process.env.AUTOPILOT_STATUS_PASSWORD;
    const authorization = request.headers.get("authorization");
    const expected = configuredUser && configuredPassword ? `Basic ${Buffer.from(`${configuredUser}:${configuredPassword}`).toString("base64")}` : null;
    if (!expected || authorization !== expected) {
      return new NextResponse("Authentifizierung erforderlich.", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="WÖk Autopilot", charset="UTF-8"', "Cache-Control": "no-store" } });
    }
  }
  const nonce = createNonce();
  const policy = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" }
      ]
    }
  ]
};

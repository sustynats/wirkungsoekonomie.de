import { NextRequest, NextResponse } from "next/server";

function createNonce() {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `style-src 'self' 'nonce-${nonce}'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "connect-src 'self' https://search.dip.bundestag.de https://akademie.wirkungsoekonomie.de https://fganranxrdyewbjpvubx.supabase.co",
    "upgrade-insecure-requests"
  ].join("; ");
}

function staticDossierSecurityPolicy() {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "style-src 'self'",
    "script-src 'self'",
    "connect-src 'self'",
    "upgrade-insecure-requests"
  ].join("; ");
}

export function middleware(request: NextRequest) {
  // The long-form dossiers are static documents and contain no framework
  // bootstrap or inline code. Their single same-origin enhancement script can
  // therefore use a stricter static policy without a per-request nonce.
  if (/^\/fachakten\/dossiers\/[^/]+\.html$/.test(request.nextUrl.pathname)) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", staticDossierSecurityPolicy());
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    return response;
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

import { NextResponse } from "next/server";

const sessionCookieName = "woek_newsletter_session";

function websiteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_WOEK_WEBSITE_URL ?? "https://wirkungsoekonomie.de").origin;
}

function portalOrigin() {
  return new URL(process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://parlament.wirkungsoekonomie.de").origin;
}

export function allowedNewsletterOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    const normalized = new URL(origin).origin;
    return normalized === websiteOrigin() || normalized === portalOrigin() ? normalized : null;
  } catch {
    return null;
  }
}

export function newsletterCors(response: NextResponse, request: Request) {
  const origin = allowedNewsletterOrigin(request);
  if (!origin) return response;
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Headers", "content-type");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Vary", "Origin");
  return response;
}

export function newsletterPreflight(request: Request) {
  if (!allowedNewsletterOrigin(request)) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 403 });
  return newsletterCors(new NextResponse(null, { status: 204 }), request);
}

export function readNewsletterSession(request: Request) {
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookieName}=`))?.slice(sessionCookieName.length + 1);
  if (!raw) return null;
  const [subscriptionId, recognitionToken] = decodeURIComponent(raw).split(".");
  if (!subscriptionId || !recognitionToken || !/^[0-9a-f-]{36}$/i.test(subscriptionId) || !/^[A-Za-z0-9_-]{32,}$/.test(recognitionToken)) return null;
  return { subscriptionId, recognitionToken };
}

export function setNewsletterSession(response: NextResponse, session: { subscriptionId: string; recognitionToken: string }) {
  response.cookies.set({
    name: sessionCookieName,
    value: `${session.subscriptionId}.${session.recognitionToken}`,
    domain: "wirkungsoekonomie.de",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180
  });
}

export function clearNewsletterSession(response: NextResponse) {
  response.cookies.set({ name: sessionCookieName, value: "", domain: "wirkungsoekonomie.de", path: "/", httpOnly: true, secure: true, sameSite: "lax", maxAge: 0 });
}

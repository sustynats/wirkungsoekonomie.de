import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { editorialCookieNames, passwordSignIn } from "@/lib/editorial/auth";
import { supabaseRest } from "@/lib/supabase-rest";

const signInSchema = z.object({ email: z.string().email().max(320), password: z.string().min(8).max(1_024) });

function sessionCookie(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ANMELDUNG_NICHT_MOEGLICH" }, { status: 400 });
  try {
    const session = await passwordSignIn(parsed.data.email, parsed.data.password);
    if (!session) return NextResponse.json({ error: "ANMELDUNG_NICHT_MOEGLICH" }, { status: 401 });

    const members = await supabaseRest<Array<{ role: string }>>(
      `editorial_members?user_id=eq.${encodeURIComponent(session.user.id)}&active=is.true&select=role&limit=1`
    );
    if (!members[0]) return NextResponse.json({ error: "KEINE_REDAKTIONSROLLE" }, { status: 403 });

    const response = NextResponse.json({ data: { role: members[0].role } });
    response.cookies.set(editorialCookieNames.accessCookie, session.access_token, sessionCookie(Math.max(60, session.expires_in)));
    response.cookies.set(editorialCookieNames.refreshCookie, session.refresh_token, sessionCookie(60 * 60 * 24 * 14));
    return response;
  } catch {
    return NextResponse.json({ error: "ANMELDUNG_NICHT_MOEGLICH" }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ data: { signedOut: true } });
  response.cookies.set(editorialCookieNames.accessCookie, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(editorialCookieNames.refreshCookie, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

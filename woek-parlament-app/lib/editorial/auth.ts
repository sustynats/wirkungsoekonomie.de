import "server-only";

import { cookies } from "next/headers";
import { supabaseRest } from "@/lib/supabase-rest";

const accessCookie = "woek_editorial_access";
const refreshCookie = "woek_editorial_refresh";

type AuthUser = { id: string; email?: string | null };
type Membership = { role: "EDITOR" | "REVIEWER" | "PUBLISHER" | "ADMIN" };

export type EditorialSession = {
  user: AuthUser;
  role: Membership["role"];
};

function authCredentials() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("EDITORIAL_AUTH_CONFIGURATION_MISSING");
  return { url, serviceRoleKey };
}

export const editorialCookieNames = { accessCookie, refreshCookie };

export async function currentEditorialSession(): Promise<EditorialSession | null> {
  const token = (await cookies()).get(accessCookie)?.value;
  if (!token) return null;
  const { url, serviceRoleKey } = authCredentials();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) return null;
  const user = (await response.json()) as AuthUser;
  if (!user?.id) return null;
  const memberships = await supabaseRest<Membership[]>(
    `editorial_members?user_id=eq.${encodeURIComponent(user.id)}&active=is.true&select=role&limit=1`
  );
  const membership = memberships[0];
  return membership ? { user, role: membership.role } : null;
}

export async function requireEditorialSession(): Promise<EditorialSession> {
  const session = await currentEditorialSession();
  if (!session) throw new Error("EDITORIAL_AUTH_REQUIRED");
  return session;
}

type PasswordSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
};

/**
 * Password exchange happens server-to-server.  Browser code never receives a
 * service key; it receives only an HttpOnly editorial session cookie.
 */
export async function passwordSignIn(email: string, password: string): Promise<PasswordSession | null> {
  const { url, serviceRoleKey } = authCredentials();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: serviceRoleKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000)
  });
  if (!response.ok) return null;
  const session = (await response.json()) as PasswordSession;
  if (!session.access_token || !session.refresh_token || !session.user?.id) return null;
  return session;
}

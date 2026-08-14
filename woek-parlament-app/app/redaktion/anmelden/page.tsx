"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EditorialSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/editorial/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error === "KEINE_REDAKTIONSROLLE" ? "Dieses Konto hat keine aktive Redaktionsrolle." : "Anmeldung nicht möglich. Bitte Zugangsdaten und Rolle prüfen.");
      setBusy(false);
      return;
    }
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/redaktion") ? next : "/redaktion");
    router.refresh();
  }

  return <main className="editorial-auth container">
    <section className="editorial-auth__card" aria-labelledby="editorial-login-title">
      <p className="kicker">Intern · Institut für Wirkungsökonomie</p>
      <h1 id="editorial-login-title">Redaktion anmelden</h1>
      <p>Dieser Bereich enthält nicht veröffentlichte Quellen, offene Fachfragen und Auditdaten. Er ist nicht Teil des öffentlichen Portals.</p>
      <form onSubmit={submit} className="editorial-form">
        <label>E-Mail-Adresse<input name="email" type="email" autoComplete="email" required /></label>
        <label>Passwort<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
        {error ? <p className="editorial-error" role="alert">{error}</p> : null}
        <button className="button button--primary" type="submit" disabled={busy}>{busy ? "Anmeldung läuft …" : "Anmelden"}</button>
      </form>
    </section>
  </main>;
}

export default function EditorialSignInPage() {
  return <Suspense fallback={<main className="editorial-auth container"><p>Redaktionszugang wird geladen …</p></main>}><EditorialSignInForm /></Suspense>;
}

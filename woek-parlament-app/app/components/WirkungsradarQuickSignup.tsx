"use client";

import { useState, type FormEvent } from "react";

type Props = { deliveryReady: boolean };

export function WirkungsradarQuickSignup({ deliveryReady }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deliveryReady) return;

    const form = new FormData(event.currentTarget);
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/wirkungsradar-updates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          recipient_type: "PUBLIC",
          topics: ["ALL_UPDATES"],
          consent: true,
          consent_source: "parlament.wirkungsoekonomie.de/",
          website: form.get("website")
        })
      });
      const result = await response.json() as { outcome?: string; delivery?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Die Anmeldung konnte nicht verarbeitet werden.");
      setIsError(false);
      if (result.outcome === "already_active") setMessage("Diese Adresse ist bereits bestätigt.");
      else if (result.outcome === "already_pending") setMessage("Bitte prüfen Sie Ihr E-Mail-Postfach.");
      else if (result.outcome === "contact_required") setMessage("Bitte wenden Sie sich für eine erneute Anmeldung an uns.");
      else if (result.delivery === "sent") setMessage("Bitte bestätigen Sie jetzt die E-Mail in Ihrem Postfach.");
      else setMessage("Die Anmeldung ist noch nicht aktiv. Bitte schließen Sie zuerst die Bestätigung ab.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Die Anmeldung konnte nicht verarbeitet werden.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="footer-signup-control">
      {deliveryReady ? (
        <form onSubmit={submit} className="footer-signup-form" noValidate>
          <div className="footer-signup-fields">
            <label className="visually-hidden" htmlFor="footer-signup-email">E-Mail-Adresse für Parlamentsradar-Updates</label>
            <input id="footer-signup-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="E-Mail-Adresse" required />
            <label className="visually-hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Wird vorbereitet …" : "Anmeldung anfordern"}</button>
          </div>
          <p className="footer-signup-legal">Freiwillig, mit Bestätigungs-E-Mail und jederzeit abbestellbar. <a href="https://wirkungsoekonomie.de/datenschutz.html">Datenschutz</a>.</p>
          {message && <p className={isError ? "signup-message signup-message-error" : "signup-message"} role="status">{message}</p>}
        </form>
      ) : (
        <p className="footer-signup-unavailable" role="status">Eine Anmeldung ist derzeit nicht verfügbar. Bis zur Freischaltung werden über dieses Formular keine E-Mail-Adressen gespeichert.</p>
      )}
    </div>
  );
}

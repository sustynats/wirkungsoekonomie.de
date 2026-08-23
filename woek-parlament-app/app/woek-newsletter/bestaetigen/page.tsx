"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function ConfirmNewsletterPage() {
  return <Suspense fallback={<div className="shell content-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Newsletter bestätigen</h1></div>}><ConfirmNewsletter /></Suspense>;
}

function ConfirmNewsletter() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function confirm() {
    setPending(true);
    const response = await fetch("/api/woek-newsletter/bestaetigen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: params.get("subscription"), token: params.get("token"), unsubscribe_token: params.get("unsubscribe_token") }) });
    const result = await response.json() as { outcome?: string; error?: string };
    setMessage(response.ok ? (result.outcome === "already_active" ? "Diese Anmeldung war bereits bestätigt." : "Vielen Dank. Der Wirkungsbrief ist jetzt aktiv.") : (result.error ?? "Die Bestätigung konnte nicht abgeschlossen werden."));
    setPending(false);
  }
  return <div className="shell content-page confirmation-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Der Wirkungsbrief: Anmeldung bestätigen</h1><p className="lead">Mit der Bestätigung aktivieren Sie den Wirkungsbrief. Sie können ihn jederzeit mit einem Link in jeder E-Mail abbestellen.</p><button type="button" className="button button-primary" onClick={confirm} disabled={pending}>{pending ? "Wird bestätigt …" : "Anmeldung bestätigen"}</button>{message && <p className="notice" role="status">{message}</p>}<p className="page-return"><a href="https://wirkungsoekonomie.de/">Zur Website der Wirkungsökonomie</a></p></div>;
}

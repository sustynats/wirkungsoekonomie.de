"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function UnsubscribeNewsletterPage() {
  return <Suspense fallback={<div className="shell content-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Newsletter abmelden</h1></div>}><UnsubscribeNewsletter /></Suspense>;
}

function UnsubscribeNewsletter() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function remove() {
    setPending(true);
    const response = await fetch("/api/woek-newsletter/abmelden", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: params.get("subscription"), token: params.get("token") }) });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "Die Adresse erhält keine weiteren Ausgaben des Wirkungsbriefs." : (result.error ?? "Die Abmeldung konnte nicht abgeschlossen werden."));
    setPending(false);
  }
  return <div className="shell content-page confirmation-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Der Wirkungsbrief: abmelden</h1><p className="lead">Die Abmeldung gilt sofort. Wenn Sie sich später erneut anmelden möchten, fordern Sie eine neue Bestätigungs-E-Mail an.</p><button className="button button-secondary" onClick={remove} disabled={pending}>{pending ? "Wird abgemeldet …" : "Wirkungsbrief abmelden"}</button>{message && <p className="notice" role="status">{message}</p>}<p className="page-return"><a href="https://wirkungsoekonomie.de/">Zur Website der Wirkungsökonomie</a></p></div>;
}

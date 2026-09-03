"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function ConfirmWirkungsradarSubscriptionPage() {
  return <Suspense fallback={<div className="shell content-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Parlamentsradar-Updates bestätigen</h1></div>}><ConfirmSubscription /></Suspense>;
}

function ConfirmSubscription() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function confirm() {
    setPending(true);
    const response = await fetch("/api/wirkungsradar-updates/bestaetigen", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: params.get("subscription"), token: params.get("token"), unsubscribe_token: params.get("unsubscribe_token") }) });
    const result = await response.json() as { outcome?: string; error?: string };
    setMessage(response.ok ? (result.outcome === "already_active" ? "Diese Anmeldung war bereits bestätigt." : "Vielen Dank. Parlamentsradar-Updates sind jetzt für diese Adresse aktiviert.") : (result.error ?? "Die Bestätigung konnte nicht abgeschlossen werden."));
    setPending(false);
  }
  return <div className="shell content-page confirmation-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Parlamentsradar-Updates bestätigen</h1><p className="lead">Mit der Bestätigung aktivieren Sie die von Ihnen ausgewählten Hinweise. Sie können sich jederzeit mit einem Link in jeder E-Mail abmelden.</p><button type="button" className="button button-primary" onClick={confirm} disabled={pending}>{pending ? "Wird bestätigt …" : "Anmeldung bestätigen"}</button>{message && <p className="notice" role="status">{message}</p>}<p className="page-return"><Link href="/">Zur Portalstartseite</Link></p></div>;
}

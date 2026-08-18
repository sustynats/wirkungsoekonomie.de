"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function UnsubscribeWirkungsradarPage() {
  return <Suspense fallback={<div className="shell content-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Parlamentsradar-Updates abmelden</h1></div>}><UnsubscribeSubscription /></Suspense>;
}

function UnsubscribeSubscription() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function remove() {
    setPending(true);
    const response = await fetch("/api/wirkungsradar-updates/abmelden", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subscription: params.get("subscription"), token: params.get("token") }) });
    const result = await response.json() as { outcome?: string; error?: string };
    setMessage(response.ok ? "Die Adresse erhält keine weiteren Parlamentsradar-Updates." : (result.error ?? "Die Abmeldung konnte nicht abgeschlossen werden."));
    setPending(false);
  }
  return <div className="shell content-page confirmation-page"><p className="eyebrow">E-Mail-Anmeldung</p><h1>Parlamentsradar-Updates abmelden</h1><p className="lead">Die Abmeldung gilt sofort. Sie können sich nur über eine neue, ausdrücklich bestätigte Anmeldung wieder aktivieren lassen.</p><button className="button button-secondary" onClick={remove} disabled={pending}>{pending ? "Wird abgemeldet …" : "E-Mail-Updates abmelden"}</button>{message && <p className="notice" role="status">{message}</p>}<p className="page-return"><Link href="/">Zur Portalstartseite</Link></p></div>;
}

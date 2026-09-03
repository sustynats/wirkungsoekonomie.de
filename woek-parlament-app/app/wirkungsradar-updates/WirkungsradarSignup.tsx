"use client";

import { useState, type FormEvent } from "react";

const topicOptions = [
  ["ALL_UPDATES", "Alle veröffentlichten Updates"],
  ["UPCOMING_DECISIONS", "Bevorstehende Entscheidungen"],
  ["PUBLISHED_CHECKS", "Veröffentlichte Wirkungschecks"],
  ["CORRECTIONS", "Korrekturen und relevante Aktualisierungen"],
  ["HEALTH_CARE", "Gesundheit"],
  ["HOUSING", "Wohnen"],
  ["WORK_AND_SKILLS", "Arbeit und Kompetenzen"],
  ["CLIMATE_AND_ENERGY", "Klima und Energie"],
  ["DEMOCRACY_AND_DIGITAL", "Demokratie und Digitales"]
] as const;

type Props = { deliveryReady: boolean };

export function WirkungsradarSignup({ deliveryReady }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deliveryReady) return;
    const form = new FormData(event.currentTarget);
    const topics = form.getAll("topics").map(String);
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/wirkungsradar-updates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          recipient_type: form.get("recipient_type"),
          topics,
          consent: form.get("consent") === "yes",
          website: form.get("website")
        })
      });
      const result = await response.json() as { outcome?: string; delivery?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Die Anmeldung konnte nicht verarbeitet werden.");
      setIsError(false);
      if (result.outcome === "already_active") setMessage("Diese Adresse ist bereits für Parlamentsradar-Updates bestätigt.");
      else if (result.outcome === "already_pending") setMessage("Für diese Adresse liegt bereits eine Bestätigungsanfrage vor. Bitte prüfen Sie Ihr E-Mail-Postfach.");
      else if (result.outcome === "contact_required") setMessage("Für diese Adresse besteht eine Abmeldung oder Sperre. Bitte wenden Sie sich an wirkungscheck@wirkungsoekonomie.de, wenn Sie sich erneut anmelden möchten.");
      else if (result.delivery === "sent") setMessage("Bitte bestätigen Sie jetzt die E-Mail, die wir Ihnen gesendet haben. Erst danach sind Parlamentsradar-Updates aktiviert.");
      else setMessage("Die Anmeldung ist vorgemerkt, aber noch nicht aktiv. Es werden keine regelmäßigen E-Mails versendet, bevor die Bestätigung zugestellt und von Ihnen abgeschlossen wurde.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Die Anmeldung konnte nicht verarbeitet werden.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="radar-signup" aria-labelledby="signup-title">
      <div>
        <p className="eyebrow">Auf dem Laufenden bleiben</p>
        <h2 id="signup-title">Parlamentsradar-Updates</h2>
        <p>Hinweise zu anstehenden parlamentarischen Entscheidungen, veröffentlichten Wirkungschecks und notwendigen Korrekturen. Keine Werbung, kein Tracking und kein politisches Profiling.</p>
        <dl className="signup-principles">
          <div><dt>Nur nach Bestätigung</dt><dd>Die Anmeldung wird erst nach einem Double-Opt-in aktiv.</dd></div>
          <div><dt>Jederzeit abmelden</dt><dd>Ein Link in jeder Nachricht genügt; eine Abmeldung wird nicht automatisch zurückgesetzt.</dd></div>
          <div><dt>Sorgfältig geprüft</dt><dd>Versendet werden nur Hinweise mit klar ausgewiesenem Quellen- und Prüfstand. Eine Datenlücke wird als solche benannt.</dd></div>
        </dl>
      </div>
      {deliveryReady ? (
        <form className="radar-signup-form" onSubmit={submit} noValidate>
          <label>E-Mail-Adresse<input name="email" type="email" inputMode="email" autoComplete="email" required /></label>
          <label>Ich melde mich an als<select name="recipient_type" defaultValue="PUBLIC"><option value="PUBLIC">interessierte Person / Organisation</option><option value="PARLIAMENTARY_OFFICE">Mandats- oder Ausschussbüro</option></select></label>
          <fieldset>
            <legend>Worüber möchten Sie Hinweise erhalten?</legend>
            <div className="topic-options">
              {topicOptions.map(([value, label], index) => <label key={value}><input type="checkbox" name="topics" value={value} defaultChecked={index === 0} />{label}</label>)}
            </div>
          </fieldset>
          <label className="signup-consent"><input type="checkbox" name="consent" value="yes" required />Ich möchte die ausgewählten Parlamentsradar-Updates per E-Mail erhalten. Meine Anmeldung wird erst durch meine Bestätigung aktiv. Hinweise zum Umgang mit meinen Daten habe ich gelesen.</label>
          <label className="visually-hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Anmeldung wird vorbereitet …" : "Bestätigungs-E-Mail anfordern"}</button>
          {message && <p className={isError ? "signup-message signup-message-error" : "signup-message"} role="status">{message}</p>}
        </form>
      ) : (
        <aside className="notice notice-neutral signup-gate">
          <strong>Die Anmeldung wird nach dem Zustelltest freigeschaltet.</strong>
          <p>Damit keine Adresse ohne nachweisbare Bestätigung in einen Verteiler gelangt, ist der Bestätigungsversand noch nicht aktiviert. Bis dahin werden über diese Seite keine E-Mail-Adressen gespeichert.</p>
        </aside>
      )}
    </section>
  );
}

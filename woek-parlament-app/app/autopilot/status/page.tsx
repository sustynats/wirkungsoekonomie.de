import health from "@/data/generated/autopilot-health.json";

export const metadata = { title: "Autopilot-Status", robots: { index: false, follow: false, nocache: true } };

export default function AutopilotStatusPage() {
  const domains = Object.entries(health.domains);
  return <main className="shell content-page"><header className="page-intro"><p className="eyebrow">Interner Betriebsstatus</p><h1>Politischer Wirkungs-Autopilot</h1><p className="lead">Der Status trennt technische Datenläufe, Fachfreigaben und veröffentlichte Stände. „Eingeschränkt“ bedeutet: Es wird keine Vollständigkeit behauptet.</p></header><section className="autopilot-health-grid">{domains.map(([key, value]) => <article key={key}><p className="eyebrow">{key}</p><h2>{value.status}</h2><p>{value.detail}</p><small>Letzter Lauf: {value.last_run_at ?? "noch nicht bestätigt"}</small></article>)}</section><section className="notice"><strong>Gesamtstatus: {health.overall_status}</strong><p>Generiert: {health.generated_at ?? "noch kein bestätigter Lauf"}. Offene Datenfragen: {health.open_data_issues}. Offene Fachreviews: {health.open_fach_reviews}.</p></section></main>;
}

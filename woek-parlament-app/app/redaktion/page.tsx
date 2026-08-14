import Link from "next/link";
import { redirect } from "next/navigation";
import { currentEditorialSession } from "@/lib/editorial/auth";
import { editorialDashboardCounts, listEditorialTasks } from "@/lib/editorial/workbench";

const priorityLabel: Record<string, string> = {
  BLOCKING: "Blockierend",
  HIGH: "Hoch",
  NORMAL: "Normal",
  OPTIONAL: "Optional"
};

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date(value)) : "Kein bestätigter Termin";
}

export default async function EditorialDashboardPage() {
  const session = await currentEditorialSession();
  if (!session) redirect("/redaktion/anmelden?next=/redaktion");

  const [counts, tasks] = await Promise.all([editorialDashboardCounts(), listEditorialTasks(16)]);

  return <div className="editorial-shell container">
    <header className="editorial-header">
      <div>
        <p className="kicker">Intern · Redaktion</p>
        <h1>Meine Aufgaben</h1>
        <p>Nur offene Fragen, die Regeln, bestätigte Quellen und freigegebene Muster nicht verantwortbar entscheiden können.</p>
      </div>
      <div className="editorial-user"><span>{session.user.email}</span><strong>{session.role}</strong><Link href="/redaktion/historischer-aufbau">Historischer Aufbau →</Link></div>
    </header>

    <section className="editorial-kpis" aria-label="Redaktionsstand">
      <article><span>Offen</span><strong>{counts.openTasks}</strong><small>fachliche Aufgaben</small></article>
      <article className={counts.blockingTasks ? "editorial-kpi--warning" : ""}><span>Blockierend</span><strong>{counts.blockingTasks}</strong><small>vor einer Freigabe</small></article>
      <article><span>Freigabereif</span><strong>{counts.readyForApproval}</strong><small>Fälle</small></article>
      <article><span>Methodenlücken</span><strong>{counts.openMethodGaps}</strong><small>strukturiert erfasst</small></article>
    </section>

    <section className="editorial-worklist" aria-labelledby="worklist-title">
      <div className="section-heading"><div><p className="kicker">Arbeitsvorrat</p><h2 id="worklist-title">Heute entscheidungsrelevant</h2></div><p>{counts.highPriorityTasks} hoch priorisierte Aufgabe{counts.highPriorityTasks === 1 ? "" : "n"}.</p></div>
      {tasks.length ? <ol className="editorial-task-list">{tasks.map((task) => <li key={task.id}>
        <Link href={`/redaktion/aufgaben/${task.id}`} className="editorial-task-card">
          <div className="editorial-task-card__meta"><span className={`editorial-priority editorial-priority--${task.priority.toLowerCase()}`}>{priorityLabel[task.priority] ?? task.priority}</span>{task.blocking ? <span className="editorial-blocker">Blockiert Analyse</span> : null}</div>
          <h3>{task.parliamentary_cases?.title ?? "Unbenannter Vorgang"}</h3>
          <p>{task.question}</p>
          <dl><div><dt>Aufgabentyp</dt><dd>{task.task_type.replaceAll("_", " ")}</dd></div><div><dt>Termin</dt><dd>{formatDate(task.due_by ?? task.parliamentary_cases?.next_confirmed_event_on ?? null)}</dd></div></dl>
          <span className="editorial-task-card__open">Aufgabe öffnen <span aria-hidden="true">→</span></span>
        </Link>
      </li>)}</ol> : <div className="editorial-empty"><h3>Keine offenen Aufgaben</h3><p>Neue Aufgaben entstehen nur aus nachvollziehbaren Evidenz-, Methoden- oder Fachlücken.</p></div>}
    </section>
  </div>;
}

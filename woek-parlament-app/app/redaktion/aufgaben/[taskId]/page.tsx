import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TaskDecisionForm } from "@/app/components/editorial/TaskDecisionForm";
import { currentEditorialSession } from "@/lib/editorial/auth";
import { getEditorialTask } from "@/lib/editorial/workbench";

function jsonForPeople(value: Record<string, unknown>) {
  return JSON.stringify(value, null, 2);
}

export default async function EditorialTaskPage({ params, searchParams }: { params: Promise<{ taskId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const session = await currentEditorialSession();
  const { taskId } = await params;
  if (!session) redirect(`/redaktion/anmelden?next=/redaktion/aufgaben/${encodeURIComponent(taskId)}`);
  const task = await getEditorialTask(taskId);
  if (!task) notFound();
  const query = await searchParams;

  return <div className="editorial-shell container editorial-task-page">
    <p className="breadcrumb"><Link href="/redaktion">Meine Aufgaben</Link><span aria-hidden="true">/</span><span>Fachfrage</span></p>
    {query.saved === "1" ? <p className="editorial-success" role="status">Analyse aktualisiert. Abhängige Aufgaben wurden neu bewertet.</p> : null}
    <header className="editorial-question-header">
      <p className="kicker">{task.task_type.replaceAll("_", " ")}</p>
      <h1>{task.question}</h1>
      <p>{task.parliamentary_cases?.title ?? "Parlamentarischer Vorgang"}</p>
    </header>

    <div className="editorial-task-layout">
      <section className="editorial-question" aria-labelledby="question-title">
        <h2 id="question-title">Deine Entscheidung</h2>
        <TaskDecisionForm task={task} />
      </section>
      <aside className="editorial-context" aria-label="Entscheidungskontext">
        <section>
          <h2>Warum menschlich?</h2>
          <p>{task.reason_manual}</p>
        </section>
        <section>
          <h2>Was verändert sie?</h2>
          <p>{task.impact_preview && Object.keys(task.impact_preview).length ? "Die unten aufgeführten Abhängigkeiten werden unmittelbar neu berechnet." : "Die Entscheidung wird versionssicher gespeichert und die betroffene Analyse neu berechnet."}</p>
          {Object.keys(task.impact_preview ?? {}).length ? <pre>{jsonForPeople(task.impact_preview)}</pre> : null}
        </section>
        <section>
          <h2>Minimaler Kontext</h2>
          {Object.keys(task.context_refs ?? {}).length ? <pre>{jsonForPeople(task.context_refs)}</pre> : <p className="muted">Noch keine verknüpfte Passage. Erst die amtliche Quelle und den relevanten Abschnitt bestätigen.</p>}
        </section>
        <section className="editorial-audit-note">
          <h2>Audit</h2>
          <p>Deine Auswahl wird mit Methodenversion, Zeitpunkt und Quellenbezügen versioniert. Eine spätere Korrektur überschreibt sie nicht.</p>
        </section>
      </aside>
    </div>
  </div>;
}

import type { EditorialTaskDetail } from "@/lib/editorial/workbench";
import { createMethodGap, resolveEditorialTask } from "@/app/redaktion/actions";

type Option = { value: string; label: string; effect?: string };
type Matrix = { field: string; options: Option[] };

function isMatrix(value: unknown[]): value is Matrix[] {
  return value.every((item) => item !== null && typeof item === "object" && "field" in item && "options" in item);
}

function isOptions(value: unknown[]): value is Option[] {
  return value.every((item) => item !== null && typeof item === "object" && "value" in item && "label" in item);
}

export function TaskDecisionForm({ task }: { task: EditorialTaskDetail }) {
  const options = task.candidate_options;
  return <div className="editorial-task-actions">
    <form action={resolveEditorialTask} className="editorial-form">
      <input type="hidden" name="taskId" value={task.id} />
      {isMatrix(options) ? <fieldset><legend>Einordnung je Feld</legend><div className="editorial-matrix">{options.map((row) => <label key={row.field}>{row.field.replaceAll("_", " ")}<select name={`resolution.${row.field}`} defaultValue="EVIDENCE_OPEN">{row.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}</div></fieldset> : null}
      {isOptions(options) && options.length ? <fieldset><legend>Entscheidung</legend><div className="editorial-options">{options.map((option) => <label key={option.value}><input type="radio" name="selectedValue" value={option.value} required /> <strong>{option.label}</strong>{option.effect ? <small>{option.effect}</small> : null}</label>)}</div></fieldset> : null}
      {!options.length ? <p className="notice">Zuerst die amtliche Originalfassung und die relevante Passage hinterlegen. Danach kann das Faktpaket bestätigt werden.</p> : null}
      <label>Kurze Begründung <span className="muted">(optional)</span><textarea name="rationale" rows={3} maxLength={1000} /></label>
      <label>Quellen-IDs <span className="muted">(optional, kommagetrennt)</span><input name="sourceRefs" inputMode="text" /></label>
      {options.length ? <button type="submit" className="button button--primary">Speichern &amp; Analyse aktualisieren</button> : null}
    </form>
    <details className="editorial-method-gap">
      <summary>Das ist keine Einzelfallfrage – Methodik fehlt</summary>
      <form action={createMethodGap} className="editorial-form">
        <input type="hidden" name="taskId" value={task.id} />
        <label>Problem<textarea name="problem" rows={3} minLength={8} maxLength={1000} required /></label>
        <label>Gewünschtes Verhalten<textarea name="desiredBehavior" rows={3} minLength={8} maxLength={1000} required /></label>
        <button type="submit" className="button">Methodenlücke anlegen</button>
      </form>
    </details>
  </div>;
}

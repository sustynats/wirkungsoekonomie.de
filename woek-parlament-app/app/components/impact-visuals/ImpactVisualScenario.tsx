import Link from "next/link";
import type { ImpactVisualScenarioRecord } from "@/lib/impact-visuals/contracts";
import { ImpactVisualInteractive } from "./ImpactVisualInteractive";
import styles from "./ImpactVisualScenario.module.css";

function List({ values, empty }: { values: string[]; empty: string }) {
  return values.length > 0 ? <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>{empty}</p>;
}

export function ImpactVisualScenario({ record, headingLevel = "h2" }: { record: ImpactVisualScenarioRecord; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const completeAsset = record.editorial_review_status === "APPROVED_FOR_PUBLICATION"
    && record.source_fidelity_status === "PASS_APPROVED_ANALYSIS_ONLY"
    && record.visual_brief !== null
    && record.asset_path !== null
    && record.asset_sha256 !== null
    && record.alt_text !== null
    && record.visible_elements.length > 0;
  const scopeLabel = record.visual_scope === "PROGRAM_SCENARIO" ? "Programm-Szenario" : "Case-Deep-Dive";
  const knowledgeDate = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date(`${record.knowledge_cutoff}T12:00:00+02:00`));

  return <section
    className={styles.module}
    id={record.visual_scope === "PROGRAM_SCENARIO" ? "wirkungsbild" : "wirkungsbild-fallvertiefung"}
    aria-labelledby={`${record.id}-title`}
    data-woek-impact-visual={record.visual_scope}
    data-woek-impact-visual-status={record.editorial_review_status}
  >
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Wirkungsbild · {scopeLabel}</p>
        <Heading id={`${record.id}-title`}>{record.title}</Heading>
        <p className={styles.disclaimer}>{record.disclaimer}</p>
      </div>
      <dl className={styles.statusLine}>
        <div><dt>Phase</dt><dd>Ex ante</dd></div>
        <div><dt>Wissensstand</dt><dd>{knowledgeDate}</dd></div>
        <div><dt>Bildstatus</dt><dd>{completeAsset ? "fachlich freigegeben" : "noch nicht freigegeben"}</dd></div>
      </dl>
    </header>

    <ol className={styles.causalBar} aria-label="Vom Vorhaben zu Folgen erster bis dritter Ordnung">
      <li><span>1</span><div><strong>Vorhaben / Instrument</strong><small>muss im freigegebenen Brief exakt bestimmt sein</small></div></li>
      <li><span>2</span><div><strong>Unmittelbare Zustandsänderung</strong><small>kein Zielbild und kein bloßer Output</small></div></li>
      <li><span>3</span><div><strong>Folgen 1.–3. Ordnung</strong><small>nur quellengebundene, geprüfte Wirkungspfade</small></div></li>
    </ol>

    {completeAsset ? <ImpactVisualInteractive assetPath={record.asset_path!} altText={record.alt_text!} elements={record.visible_elements} /> : <div className={styles.failClosed} role="status">
      <span aria-hidden="true">◌</span>
      <div>
        <strong>Noch kein freigegebenes Wirkungsszenario</strong>
        <p>Für diesen Gegenstand liegt noch kein vollständig geprüfter Visual Brief vor. Deshalb zeigt das Portal weder ein Bild noch Marker und leitet keine Folge aus Programmtext, Partei, Titel, Schlagwort oder Bildmodell ab.</p>
        <details>
          <summary>Exakt fehlende Freigaben ({record.missing_approved_inputs.length})</summary>
          <ul>{record.missing_approved_inputs.map((input) => <li key={input.code}><strong>{input.description}</strong></li>)}</ul>
        </details>
      </div>
    </div>}

    <div className={styles.boundaryGrid}>
      <article>
        <h3>Was das Bild nicht zeigen kann</h3>
        <List
          values={record.non_visual_effects}
          empty={completeAsset
            ? "Für diesen freigegebenen Datensatz sind keine zusätzlichen nichtvisuellen Effekte ausgewiesen."
            : "Szenariospezifische nichtvisuelle Folgen werden erst nach fachlicher Auswahl veröffentlicht. Bis dahin bleibt die vollständige Fachakte maßgeblich."}
        />
      </article>
      <article>
        <h3>Wie sicher wissen wir das?</h3>
        <p>{record.evidence_summary}</p>
        <p><strong>Das Bild ist kein zusätzlicher Beleg.</strong> Es visualisiert ausschließlich die darunterliegende Analyse; Richtung, Evidenz und Unsicherheit bleiben getrennte Angaben.</p>
      </article>
    </div>

    <details className={styles.provenance}>
      <summary>Analyse-, Versions- und Korrekturprovenienz</summary>
      <dl>
        <div><dt>Record</dt><dd>{record.id}</dd></div>
        <div><dt>Analyseversion</dt><dd>{record.analysis_version}</dd></div>
        <div><dt>Auswahlgrund</dt><dd>{record.selection_rationale}</dd></div>
        <div><dt>Ausgewählte Wirkpfade</dt><dd>{record.selected_impact_path_ids.length > 0 ? `${record.selected_impact_path_ids.length} bereits kuratierte Schlüsselpfade; ohne Visual Brief nicht dargestellt` : "keine Auswahl freigegeben"}</dd></div>
        <div><dt>Asset</dt><dd>{record.asset_sha256 ?? "kein Asset freigegeben"}</dd></div>
      </dl>
      <p><Link href="/methodik#wirkungsbilder">Methode, Frame-Schutz und Korrekturweg lesen →</Link></p>
    </details>
  </section>;
}

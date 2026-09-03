import Link from "next/link";
import type { ImpactVisualScenarioRecord } from "@/lib/impact-visuals/contracts";
import { ImpactVisualInteractive } from "./ImpactVisualInteractive";
import styles from "./ImpactVisualScenario.module.css";

function List({ values, empty }: { values: string[]; empty: string }) {
  return values.length > 0 ? <ul>{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p>{empty}</p>;
}

const directionLabels = {
  POSITIVE: "positives Wirkungspotenzial",
  NEGATIVE: "negatives Wirkungspotenzial",
  AMBIVALENT: "ambivalentes Wirkungspotenzial",
  OPEN: "Wirkungsrichtung offen",
} as const;

const evidenceLabels = {
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  NOT_ASSESSABLE: "nicht belastbar beurteilbar",
} as const;

export function ImpactVisualScenario({ record, headingLevel = "h2" }: { record: ImpactVisualScenarioRecord; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const completeAsset = record.editorial_review_status === "APPROVED_FOR_PUBLICATION"
    && record.source_fidelity_status === "PASS_APPROVED_ANALYSIS_ONLY"
    && record.visual_brief !== null
    && record.asset_path !== null
    && record.asset_sha256 !== null
    && record.asset_metadata !== null
    && record.alt_text !== null;
  const preparedAwaitingAsset = record.editorial_review_status === "PREPARED_AWAITING_ASSET"
    && record.case_analysis_binding !== null;
  const knowledgeDate = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(new Date(`${record.knowledge_cutoff}T12:00:00+02:00`));
  const noMarkerText = record.omitted_marker_candidates.join(" ") || "Die fachliche Zuordnung bleibt vollständig in der geprüften Textanalyse; aus dem Bild wird kein zusätzlicher Wirkpfad abgeleitet.";

  return <section
    className={styles.module}
    id={record.visual_scope === "PROGRAM_SCENARIO" ? "wirkungsbild" : "wirkungsbild-fallvertiefung"}
    aria-labelledby={`${record.id}-title`}
    data-woek-impact-visual={record.visual_scope}
    data-woek-impact-visual-status={record.editorial_review_status}
  >
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>{record.public_label}</p>
        <Heading id={`${record.id}-title`}>{record.title}</Heading>
        <p className={styles.disclaimer}>{record.public_subtitle}</p>
      </div>
      <dl className={styles.statusLine}>
        <div><dt>Phase</dt><dd>Ex ante</dd></div>
        <div><dt>Wissensstand</dt><dd>{knowledgeDate}</dd></div>
        <div><dt>Bildstatus</dt><dd>{completeAsset ? "fachlich-redaktionell freigegeben" : preparedAwaitingAsset ? "Brief freigegeben · Bilddatei fehlt" : "noch nicht freigegeben"}</dd></div>
      </dl>
    </header>

    {record.case_analysis_binding ? <article className={styles.caseFinding} aria-label="Freigegebener WÖk-Fallbefund">
      <p className={styles.eyebrow}>Konkreter WÖk-Fallbefund</p>
      <h3>{record.case_analysis_binding!.key_finding}</h3>
      <p>{record.case_analysis_binding!.impact_core_summary}</p>
      <dl className={styles.statusLine}>
        <div><dt>Richtung</dt><dd>{directionLabels[record.case_analysis_binding!.impact_direction]}</dd></div>
        <div><dt>Materialität</dt><dd>{record.case_analysis_binding!.materiality}</dd></div>
        <div><dt>Evidenz</dt><dd>{evidenceLabels[record.case_analysis_binding!.evidence_level]}</dd></div>
      </dl>
    </article> : null}

    <ol className={styles.causalBar} aria-label="Vom Vorhaben zu Folgen erster bis dritter Ordnung">
      <li><span>1</span><div><strong>Vorhaben / Instrument</strong><small>muss im freigegebenen Brief exakt bestimmt sein</small></div></li>
      <li><span>2</span><div><strong>Unmittelbare Zustandsänderung</strong><small>kein Zielbild und kein bloßer Output</small></div></li>
      <li><span>3</span><div><strong>Folgen 1.–3. Ordnung</strong><small>nur quellengebundene, geprüfte Wirkungspfade</small></div></li>
    </ol>

    {completeAsset ? <ImpactVisualInteractive
      assetPath={record.asset_path!}
      altText={record.alt_text!}
      assetWidth={record.asset_metadata!.width}
      assetHeight={record.asset_metadata!.height}
      elements={record.visible_elements}
      noMarkerText={noMarkerText}
    /> : <div className={styles.failClosed} role="status">
      <span aria-hidden="true">◌</span>
      <div>
        <strong>{preparedAwaitingAsset ? "Fall und Visual Brief freigegeben · Bilddatei ausstehend" : "Noch kein freigegebenes Wirkungsszenario"}</strong>
        <p>{preparedAwaitingAsset
          ? "Die fachliche Fallauswahl, die kanonische Analysebindung, das Visual Briefing, die Aussagegrenzen und der Alt-Text sind geprüft. Es fehlt eine separate Case-Bilddatei samt abschließendem Bild-Signoff. Bis dahin zeigt das Portal weder Bild noch Marker; das vorhandene Programm-Szenario wird nicht wiederverwendet."
          : "Für diesen Gegenstand liegt noch kein vollständig geprüfter Visual Brief vor. Deshalb zeigt das Portal weder ein Bild noch Marker und leitet keine Folge aus Programmtext, Partei, Titel, Schlagwort oder Bildmodell ab."}</p>
        {preparedAwaitingAsset && record.case_analysis_binding?.marker_decision === "NULL_MARKER_APPROVED" ? <p><strong>Null-Marker fachlich freigegeben:</strong> Der Wirkpfad wird später ausschließlich textlich erklärt; ein Marker würde aus dem Bild eine nicht belegte Fachinformation ableiten.</p> : null}
        <details>
          <summary>Exakt verbleibende externe Freigaben ({record.missing_approved_inputs.length})</summary>
          <ul>{record.missing_approved_inputs.map((input) => <li key={input.code}><strong>{input.description}</strong></li>)}</ul>
        </details>
      </div>
    </div>}

    <div className={styles.boundaryGrid}>
      <article>
        <h3>Was das Bild nicht zeigen kann</h3>
        <List
          values={record.non_visual_effects}
          empty={completeAsset || preparedAwaitingAsset
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
        <div><dt>Ausgewählte Wirkpfade</dt><dd>{record.selected_impact_path_ids.length > 0 ? `${record.selected_impact_path_ids.length} bereits kuratierte Schlüsselpfade` : "keine Auswahl freigegeben"}</dd></div>
        {record.case_analysis_binding ? <>
          <div><dt>Ausgewählter Case</dt><dd>{record.case_analysis_binding.selected_case_id}</dd></div>
          <div><dt>Markerentscheidung</dt><dd>{record.case_analysis_binding.marker_decision}</dd></div>
          <div><dt>Reality Check</dt><dd>{record.case_analysis_binding.falsification_or_reality_check.correction_trigger}</dd></div>
          <div><dt>Nichtkompensation</dt><dd>{record.case_analysis_binding.noncompensation.length > 0 ? record.case_analysis_binding.noncompensation.map((boundary) => boundary.concern).join("; ") : "keine kanonische Grenze ausgewiesen"}</dd></div>
        </> : null}
        <div><dt>Asset</dt><dd>{record.asset_sha256 ?? "kein Asset freigegeben"}</dd></div>
        <div><dt>Finaler Bild-Signoff</dt><dd>{record.final_image_signoff}</dd></div>
        {record.asset_metadata ? <>
          <div><dt>Bilddatei</dt><dd>{record.asset_metadata.width} × {record.asset_metadata.height} px · {record.asset_metadata.mime_type} · vollständige Komposition erhalten</dd></div>
          <div><dt>Bildprovenienz</dt><dd>{record.asset_metadata.creation_provenance}</dd></div>
          <div><dt>Asset-Handoff</dt><dd>{record.asset_metadata.asset_handoff_id}</dd></div>
        </> : null}
        {record.omitted_marker_candidates.length > 0 ? <div><dt>Bewusst ohne Marker</dt><dd>{record.omitted_marker_candidates.join("; ")}</dd></div> : null}
      </dl>
      <p><Link href="/methodik#wirkungsbilder">Methode, Frame-Schutz und Korrekturweg lesen →</Link></p>
    </details>
  </section>;
}

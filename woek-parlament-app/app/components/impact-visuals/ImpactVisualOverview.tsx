import Link from "next/link";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import type { ImpactVisualScenarioRecord } from "@/lib/impact-visuals/contracts";
import { saxonyAnhaltImpactVisualRecord } from "@/lib/impact-visuals/records";
import styles from "./ImpactVisualScenario.module.css";

function publicStatus(record: ImpactVisualScenarioRecord) {
  if (record.editorial_review_status === "APPROVED_FOR_PUBLICATION") return "Freigegeben";
  if (record.editorial_review_status === "PREPARED_AWAITING_ASSET") return "Fall + Brief freigegeben · Bild fehlt";
  if (record.missing_approved_inputs.some((input) => input.code === "APPROVED_CASE_SELECTION")) {
    return "Auswahl + Brief ausstehend";
  }
  return "Brief ausstehend";
}

export function ImpactVisualOverview() {
  return <section className={styles.overview} id="wirkungsbilder" aria-labelledby="impact-visual-overview-title">
    <header>
      <p className={styles.eyebrow}>Neue Erklärungsebene · fail closed</p>
      <h2 id="impact-visual-overview-title">Wirkungsbilder: Folgen erklären, politische Frames nicht illustrieren.</h2>
      <p className="lead">Sechs fachlich und redaktionell freigegebene Programm-Szenarien visualisieren ausgewählte Wirkungspfade. Sie sind Ex-ante-Szenarien, keine Prognosen und keine zusätzliche Evidenz. Für alle sechs Case-Deep-Dives sind Fallauswahl, kanonische Analysebindung, Visual Brief, Aussagegrenzen und Alt-Text freigegeben; veröffentlicht werden die Case-Bilder erst nach Lieferung separater Bilddateien und finalem Bild-Signoff.</p>
    </header>
    <div className={styles.overviewGrid}>
      {saxonyAnhaltElectionProgrammes.map((programme) => {
        const programmeRecord = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "PROGRAM_SCENARIO");
        const caseRecord = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "CASE_SCENARIO");
        if (!programmeRecord || !caseRecord) throw new Error(`Missing impact visual contract for ${programme.sourceKey}`);
        return <article key={programme.sourceKey}>
          <p>{programme.party}</p>
          {programmeRecord.editorial_review_status === "APPROVED_FOR_PUBLICATION" && programmeRecord.asset_path && programmeRecord.alt_text
            ? <div className={styles.overviewImage}><img src={programmeRecord.asset_path} alt={programmeRecord.alt_text} width="1536" height="1024" loading="lazy" decoding="async" /></div>
            : null}
          <h3>2 von 2 Slots versioniert</h3>
          <ul>
            <li><span>Programm-Szenario</span><strong>{publicStatus(programmeRecord)}</strong></li>
            <li><span>Case-Deep-Dive</span><strong>{publicStatus(caseRecord)}</strong></li>
          </ul>
          <Link href={`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}#wirkungsbild-fallvertiefung`}>Fallbindung und verbleibende Asset-Gates öffnen →</Link>
        </article>;
      })}
    </div>
    <p className={styles.overviewMethod}><Link href="/methodik#wirkungsbilder">Was ein Wirkungsbild leisten kann – und was nicht →</Link></p>
  </section>;
}

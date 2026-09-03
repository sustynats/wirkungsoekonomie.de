import Link from "next/link";
import Image from "next/image";
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
      <p className="lead">Zwölf fachlich und redaktionell freigegebene Wirkungsbilder sind gebunden: sechs analytische Programm-Zusammenfassungen und sechs getrennte Fallvertiefungen. Sie sind Ex-ante-Szenarien, keine Prognosen und keine zusätzliche Evidenz. Nichtbild-Folgen, Evidenz, Unsicherheit und die vollständige Fachanalyse bleiben führend.</p>
    </header>
    <div className={styles.overviewGrid}>
      {saxonyAnhaltElectionProgrammes.map((programme) => {
        const programmeRecord = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "PROGRAM_SCENARIO");
        const caseRecord = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "CASE_SCENARIO");
        if (!programmeRecord || !caseRecord) throw new Error(`Missing impact visual contract for ${programme.sourceKey}`);
        return <article key={programme.sourceKey}>
          <p>{programme.party}</p>
          {programmeRecord.editorial_review_status === "APPROVED_FOR_PUBLICATION" && programmeRecord.asset_path && programmeRecord.alt_text
            ? <div className={styles.overviewImage} style={{ aspectRatio: `${programmeRecord.asset_metadata?.width ?? 1600} / ${programmeRecord.asset_metadata?.height ?? 1000}` }}><Image src={programmeRecord.asset_path} alt={programmeRecord.alt_text} width={programmeRecord.asset_metadata?.width ?? 1600} height={programmeRecord.asset_metadata?.height ?? 1000} loading="lazy" unoptimized /></div>
            : null}
          <h3>2 von 2 Wirkungsbildern freigegeben</h3>
          <ul>
            <li><span>Programm v2</span><strong>{publicStatus(programmeRecord)}</strong></li>
            <li><span>Fallvertiefung</span><strong>{publicStatus(caseRecord)}</strong></li>
          </ul>
          <Link href={`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}#wirkungsbild`}>Programm- und Fall-Wirkungsbild öffnen →</Link>
        </article>;
      })}
    </div>
    <p className={styles.overviewMethod}><Link href="/methodik#wirkungsbilder">Was ein Wirkungsbild leisten kann – und was nicht →</Link></p>
  </section>;
}

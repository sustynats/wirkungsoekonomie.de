import Link from "next/link";
import { saxonyAnhaltElectionProgrammes } from "@/data/sachsen-anhalt-election-programmes";
import type { ImpactVisualScenarioRecord } from "@/lib/impact-visuals/contracts";
import { saxonyAnhaltImpactVisualRecord } from "@/lib/impact-visuals/records";
import styles from "./ImpactVisualScenario.module.css";

function publicStatus(record: ImpactVisualScenarioRecord) {
  if (record.editorial_review_status === "APPROVED_FOR_PUBLICATION") return "Freigegeben";
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
      <p className="lead">Für jedes der sechs Programme sind ein Programm-Szenario und ein Case-Deep-Dive als versionierte Slots angelegt. Bilder erscheinen erst nach einem fachlich freigegebenen Visual Brief. Bis dahin zeigt das Portal den exakten Freigabestatus statt eine Zukunft aus Programmtext zu erzeugen.</p>
    </header>
    <div className={styles.overviewGrid}>
      {saxonyAnhaltElectionProgrammes.map((programme) => {
        const programmeRecord = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "PROGRAM_SCENARIO");
        const caseRecord = saxonyAnhaltImpactVisualRecord(programme.sourceKey, "CASE_SCENARIO");
        if (!programmeRecord || !caseRecord) throw new Error(`Missing impact visual contract for ${programme.sourceKey}`);
        return <article key={programme.sourceKey}>
          <p>{programme.party}</p>
          <h3>2 von 2 Slots versioniert</h3>
          <ul>
            <li><span>Programm-Szenario</span><strong>{publicStatus(programmeRecord)}</strong></li>
            <li><span>Case-Deep-Dive</span><strong>{publicStatus(caseRecord)}</strong></li>
          </ul>
          <Link href={`/laender/sachsen-anhalt/wahlprogramme/${programme.sourceKey}#wirkungsbild`}>Status und fehlende Freigaben öffnen →</Link>
        </article>;
      })}
    </div>
    <p className={styles.overviewMethod}><Link href="/methodik#wirkungsbilder">Was ein Wirkungsbild leisten kann – und was nicht →</Link></p>
  </section>;
}

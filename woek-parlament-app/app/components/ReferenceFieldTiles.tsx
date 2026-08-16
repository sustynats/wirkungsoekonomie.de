import Link from "next/link";

type TargetAssessment = { direction: "POSITIVE_POTENTIAL" | "NEGATIVE_RISK" | "AMBIVALENT" | "NEUTRAL" | "OPEN"; rationale?: string; evidenceStatus?: string };
type Props = { mpd: string[]; sdgAndPlus: string[]; assessments?: Record<string, TargetAssessment>; overallAssessment?: string };

const directionLabels: Record<TargetAssessment["direction"], string> = {
  POSITIVE_POTENTIAL: "möglicherweise stärkend",
  NEGATIVE_RISK: "möglicherweise schwächend",
  AMBIVALENT: "gegenläufige Potenziale und Risiken",
  NEUTRAL: "neutral eingeordnet",
  OPEN: "Richtung noch offen"
};

const sdgNames: Record<number, string> = {
  1: "Keine Armut", 2: "Kein Hunger", 3: "Gesundheit und Wohlergehen", 4: "Hochwertige Bildung", 5: "Geschlechtergleichheit", 6: "Sauberes Wasser und Sanitärversorgung", 7: "Bezahlbare und saubere Energie", 8: "Menschenwürdige Arbeit und Wirtschaftsentwicklung", 9: "Industrie, Innovation und Infrastruktur", 10: "Weniger Ungleichheiten", 11: "Nachhaltige Städte und Gemeinden", 12: "Nachhaltige Konsum- und Produktionsmuster", 13: "Maßnahmen zum Klimaschutz", 14: "Leben unter Wasser", 15: "Leben an Land", 16: "Frieden, Gerechtigkeit und starke Institutionen", 17: "Partnerschaften zur Erreichung der Ziele",
};

const openEvidenceBySdg: Partial<Record<number, string>> = {
  7: "Hierfür müssten unter anderem die Veränderung des erneuerbaren Wärmeanteils, des fossilen Energieverbrauchs, der Kostenbelastung und der tatsächlichen Umsetzungsquote einem belastbaren Vergleich gegenübergestellt werden.",
  10: "Hierfür müssten Belastungen und Entlastungen nach Einkommen, Eigentums- und Mietverhältnis, Gebäudetyp und Region getrennt beobachtet werden; Durchschnittswerte reichen für eine Verteilungsaussage nicht aus.",
  11: "Hierfür müssten Gebäudebestand, kommunale Wärmeplanung, lokale Infrastruktur, Versorgungssicherheit und Bezahlbarkeit gemeinsam betrachtet werden.",
  12: "Hierfür müssten Lebenszyklus, Material- und Ressourcenverbrauch, Austauschzeitpunkte sowie mögliche vorzeitige Ersatzinvestitionen erfasst werden.",
  13: "Hierfür müssten vermiedene Treibhausgasemissionen gegen ein belastbares Ohne-Maßnahme-Szenario gerechnet und Rebound-, Verlagerungs- sowie Vorketteneffekte einbezogen werden.",
};

function isSdg(value: string) {
  return /^SDG\s+\d+$/i.test(value);
}

function sdgNumber(value: string) {
  return Number(value.match(/\d+/)?.[0] ?? 16);
}

function displayFieldName(field: string) {
  if (!isSdg(field)) return field;
  const number = sdgNumber(field);
  return "SDG " + number + " – " + (sdgNames[number] ?? "Nachhaltigkeitsziel");
}

function openRationale(field: string) {
  const targetSpecific = isSdg(field)
    ? openEvidenceBySdg[sdgNumber(field)]
    : "Für dieses erweiterte Schutz- oder Systemziel müssten die betroffene Zustandsgröße, der konkrete Wirkpfad und geeignete Beobachtungsindikatoren ausdrücklich zugeordnet werden.";
  return "Der Bezug zu " + displayFieldName(field) + " ist dokumentiert. Die freigegebene Fachquelle weist aber noch nicht aus, welcher einzelne Wirkpfad dieses Ziel stärkt, schwächt oder im Ergebnis neutral lässt. " + (targetSpecific ?? "Erforderlich sind eine zielgenaue Zustandsgröße, ein Gegenfaktum und eine nachvollziehbare Zurechnung.") + " Ohne diese Trennung wäre eine positive oder negative Richtung nicht reproduzierbar; deshalb bleibt sie sichtbar offen.";
}

/**
 * A compact, non-scoring visual reference map. It is deliberately separate
 * from the case-level mapping tiles, because a field being touched does not
 * by itself establish a positive or negative contribution.
 */
export function ReferenceFieldTiles({ mpd, sdgAndPlus, assessments = {}, overallAssessment }: Props) {
  if (mpd.length === 0 && sdgAndPlus.length === 0) return null;
  return <section className="reference-field-tiles" aria-labelledby="reference-fields-title">
    <header><p className="eyebrow">Normativer Prüfbezug</p><h2 id="reference-fields-title">Welche Ziele sind berührt – und in welche Richtung?</h2><p>Ein Zielbezug allein ist noch keine positive Wirkung. Deshalb zeigt jede Zeile zusätzlich die fachlich belegte Richtung – oder offen, wenn sie noch nicht zielgenau bestimmt werden kann.</p>{overallAssessment && <p className="reference-overall-assessment"><strong>Einordnung des Falls:</strong> {overallAssessment}</p>}</header>
    {mpd.length > 0 ? <div className="mpd-reference-row" aria-label="Mensch Planet Demokratie">{mpd.map((dimension) => <span key={dimension}>{dimension}</span>)}</div> : null}
    {sdgAndPlus.length > 0 ? <div className="reference-field-list">
      {sdgAndPlus.map((field) => {
        const sdg = isSdg(field);
        const number = sdg ? sdgNumber(field) : null;
        const assessment = assessments[field] ?? { direction: "OPEN" as const, rationale: openRationale(field) };
        return <article className="reference-field-row" key={field}>
          <span className={sdg ? `target-mark target-mark--sdg-${number}${number === 5 ? " target-mark--contrast-field" : ""}` : "target-mark target-mark--sdgplus-democracy"}>{sdg ? number : "+"}</span>
          <div><strong>{displayFieldName(field)}</strong><span className={`reference-direction reference-direction--${assessment.direction.toLocaleLowerCase("en-US").replaceAll("_", "-")}`}>{directionLabels[assessment.direction]}</span>{assessment.rationale && <small>{assessment.rationale}</small>}</div>
          <Link href={sdg ? "/quellen/agenda-2030-sdgs" : "/quellen/sdg-plus-referenzrahmen"}>{sdg ? "Agenda 2030" : "SDG+ Referenz"}</Link>
        </article>;
      })}
    </div> : null}
  </section>;
}

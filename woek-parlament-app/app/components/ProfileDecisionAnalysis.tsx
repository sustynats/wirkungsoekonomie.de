import Link from "next/link";
import { TermInfoLink } from "@/app/components/TermInfoLink";
import { decisionHref, getDecisionCalculations, getDecisionImpactProfile, impactDirectionLabel, type DecisionImpactProfile, type ImpactDimension } from "@/lib/members/impact-profiles";
import { humanizeSystemValue } from "@/lib/presentation/labels";

const directionHeadings = {
  POSITIVE_POTENTIAL: "Mögliches positives Wirkungspotenzial",
  NEGATIVE_RISK: "Mögliches negatives Wirkungsrisiko",
  NEUTRAL: "Neutraler Wirkpfad",
  AMBIVALENT: "Gegenläufiger Wirkpfad",
  OPEN: "Noch offene Wirkungsrichtung",
  NOT_APPLICABLE: "Kein materieller Bezug"
} as const;

export function ProfileDecisionAnalysis({ caseId, focusDimension }: { caseId: string; focusDimension?: ImpactDimension }) {
  const profile = getDecisionImpactProfile(caseId);
  if (!profile) return <div className="profile-analysis-missing"><strong>Fachliche Einordnung</strong><p>Für diesen Vorgang ist in der veröffentlichten Datengrundlage noch kein vollständiges Wirkungsprofil verknüpft.</p></div>;

  const dimensions = focusDimension ? [focusDimension] : (["Mensch", "Planet", "Demokratie"] as const);
  const relevantPaths = profile.corrected_impact_paths.filter((path) => path.affected_mpd_dimensions.some((dimension) => dimensions.includes(dimension)));
  const positivePaths = relevantPaths.filter((path) => path.direction === "POSITIVE_POTENTIAL");
  const riskPaths = relevantPaths.filter((path) => path.direction === "NEGATIVE_RISK");
  const ambivalentPaths = relevantPaths.filter((path) => path.direction === "AMBIVALENT");
  const neutralPaths = relevantPaths.filter((path) => path.direction === "NEUTRAL");
  const openPaths = relevantPaths.filter((path) => path.direction === "OPEN");
  const calculations = getDecisionCalculations(caseId);
  const scopeLabel = focusDimension ? `im Wirkungsraum ${focusDimension}` : "in den Wirkungsräumen Mensch, Planet und Demokratie";

  return <section className="profile-decision-analysis" aria-label={`Wirkungsökonomische Kurzbewertung ${scopeLabel}`}>
    <div className="profile-analysis-heading"><div><p className="eyebrow">Wirkungsökonomische Kurzbewertung</p><h4>{focusDimension ? `${focusDimension}: ${impactDirectionLabel(profile.decision_domain_profile[focusDimension].direction)}` : "Was steht bei dieser Entscheidung auf dem Spiel?"}</h4></div>{profile.decision.actual_outcome && <span className="decision-result-chip">Ergebnis: {humanizeSystemValue(profile.decision.actual_outcome)}</span>}</div>
    <p>Die Einordnung beschreibt die geprüfte Entscheidungsoption {scopeLabel}. Sie trennt mögliche <strong>Wirkungspotenziale</strong> <TermInfoLink termKey="wirkungspotenzial" />, <strong>Wirkungsrisiken</strong> <TermInfoLink termKey="wirkungsrisiko" /> und offene Evidenz; sie behauptet keine bereits eingetretene Wirkung.</p>
    <ImpactPathBalance positive={positivePaths.length} risks={riskPaths.length} ambivalent={ambivalentPaths.length} neutral={neutralPaths.length} open={openPaths.length} />
    <div className="profile-analysis-columns">
      <ImpactPathGroup title="Bei Zustimmung: mögliche Verbesserungen" paths={positivePaths} allPaths={profile.corrected_impact_paths} empty="Für diesen Ausschnitt ist kein positiver Potenzialpfad dokumentiert." />
      <ImpactPathGroup title="Bei Zustimmung: Risiken und Schutzfragen" paths={riskPaths} allPaths={profile.corrected_impact_paths} empty="Für diesen Ausschnitt ist kein eigener negativer Risikopfad dokumentiert." />
      {ambivalentPaths.length > 0 && <ImpactPathGroup title="Gegenläufige Potenziale und Risiken" paths={ambivalentPaths} allPaths={profile.corrected_impact_paths} empty="" />}
      {neutralPaths.length > 0 && <ImpactPathGroup title="Neutral eingeordnete Wirkpfade" paths={neutralPaths} allPaths={profile.corrected_impact_paths} empty="" />}
      {openPaths.length > 0 && <ImpactPathGroup title="Noch nicht richtungsfest" paths={openPaths} allPaths={profile.corrected_impact_paths} empty="" />}
    </div>
    <div className="vote-option-explainer">
      <div><strong>Was eine Zustimmung bedeutet</strong><p>Sie unterstützt die konkrete Vorlage und damit die Möglichkeit der beschriebenen Potenziale – zugleich aber auch ihre dokumentierten Risiken und Umsetzungsbedingungen. Ob die Veränderungen eintreten, muss später beobachtet werden.</p></div>
      <div><strong>Was eine Ablehnung bedeutet</strong><p>Sie unterstützt diese konkrete Vorlage nicht. Dadurch entfallen weder automatisch alle Risiken noch entsteht automatisch das Gegenteil der beschriebenen Potenziale: Maßgeblich bleibt, welcher Status quo oder welche Alternative an ihre Stelle tritt.</p></div>
    </div>
    {calculations.length > 0 && <div className="profile-calculation-summary"><div><strong>Berechnungen und Formeln</strong><p>Die Fachakte benennt, was berechnet werden kann und welche Werte dafür noch fehlen. Fehlende Daten werden nicht durch Schätzwerte ersetzt.</p></div>{calculations.slice(0, 2).map((calculation) => <article key={calculation.id}><h5>{calculation.name}</h5><p><strong>Berechnungsansatz:</strong> {calculation.specification}</p><p><strong>Stand:</strong> {humanizeSystemValue(calculation.status)}</p>{calculation.availableInputs.length > 0 && <p><strong>Vorhandene Werte:</strong> {calculation.availableInputs.join(" · ")}</p>}{calculation.missingInputs.length > 0 && <p><strong>Noch erforderlich:</strong> {calculation.missingInputs.slice(0, 5).join(" · ")}{calculation.missingInputs.length > 5 ? " …" : ""}</p>}</article>)}<Link className="text-link" href={`${decisionHref(caseId)}#calculation-title`}>Vollständigen Rechenweg und Datengrundlage ansehen <span aria-hidden="true">→</span></Link></div>}
    {profile.non_compensable_boundaries.length > 0 && <div className="profile-boundary-summary"><strong>Schutzgrenzen: Was nicht schöngerechnet werden darf <TermInfoLink termKey="nichtkompensation" /></strong><p>Schwere Nachteile für Grundrechte, Lebensgrundlagen oder demokratische Schutzgüter dürfen nicht durch Vorteile in anderen Bereichen verrechnet werden. Deshalb müssen diese Fragen vor einer positiven Gesamteinordnung eigenständig geklärt werden.</p><ul>{profile.non_compensable_boundaries.slice(0, 3).map((boundary) => <li key={boundary}>{boundary}</li>)}</ul></div>}
  </section>;
}

function ImpactPathBalance({ positive, risks, ambivalent, neutral, open }: { positive: number; risks: number; ambivalent: number; neutral: number; open: number }) {
  const total = positive + risks + ambivalent + neutral + open;
  if (total === 0) return <p className="profile-analysis-empty">Für diesen Wirkungsraum ist kein materieller Wirkpfad dokumentiert.</p>;
  const label = `${positive} positive Potenzialpfade, ${risks} Risikopfade, ${ambivalent} gegenläufige, ${neutral} neutrale und ${open} Pfade mit offener Richtung. Diese Anzahl beschreibt keine Wirkungsstärke.`;
  const segments = [
    ...Array.from({ length: positive }, (_, index) => <span className="is-positive" key={"positive-" + index} />),
    ...Array.from({ length: risks }, (_, index) => <span className="is-risk" key={"risk-" + index} />),
    ...Array.from({ length: ambivalent }, (_, index) => <span className="is-ambivalent" key={"ambivalent-" + index} />),
    ...Array.from({ length: neutral }, (_, index) => <span className="is-neutral" key={"neutral-" + index} />),
    ...Array.from({ length: open }, (_, index) => <span className="is-open" key={"open-" + index} />),
  ];
  return <figure className="impact-path-balance"><figcaption><strong>Wirkpfade im Überblick <TermInfoLink termKey="materieller_wirkpfad" /></strong><span>Die Balken zeigen Anzahlen, keine Wirkungspunkte.</span></figcaption><div className="impact-path-balance-bar" role="img" aria-label={label}>{segments}</div><ul><li><span className="is-positive" />{positive} mögliche Verbesserungen</li><li><span className="is-risk" />{risks} Risiken</li>{ambivalent > 0 && <li><span className="is-ambivalent" />{ambivalent} gegenläufig</li>}{neutral > 0 && <li><span className="is-neutral" />{neutral} neutral</li>}<li><span className="is-open" />{open} noch offen</li></ul></figure>;
}

function ImpactPathGroup({ title, paths, allPaths, empty }: { title: string; paths: DecisionImpactProfile["corrected_impact_paths"]; allPaths: DecisionImpactProfile["corrected_impact_paths"]; empty: string }) {
  return <div><h5>{title}</h5>{paths.length > 0 ? <ul>{paths.slice(0, 4).map((path) => <li key={path.path_id}>
    <span className={`path-direction-dot path-direction-dot--${path.direction.toLocaleLowerCase("en-US").replaceAll("_", "-")}`} aria-hidden="true" />
    <div>
      <strong>{directionHeadings[path.direction]}{path.lever ? `: ${path.lever}` : ""}</strong>
      <p><b>Warum?</b> {expandedRationale(path, allPaths)}</p>
      {inheritedValues(path, allPaths, "affected_groups").length > 0 && <p><b>Wer oder was ist betroffen?</b> {inheritedValues(path, allPaths, "affected_groups").join(" · ")}</p>}
      {inheritedValues(path, allPaths, "normative_target_areas").length > 0 && <p><b>Woran wird die Richtung gemessen?</b> {inheritedValues(path, allPaths, "normative_target_areas").join(" · ")}</p>}
      {inheritedValues(path, allPaths, "prerequisites").length > 0 && <p><b>Unter welchen Voraussetzungen?</b> {inheritedValues(path, allPaths, "prerequisites").join(" · ")}</p>}
      {path.risks_and_side_effects && path.risks_and_side_effects.length > 0 && <p><b>Welche Gegenwirkungen sind möglich?</b> {path.risks_and_side_effects.join(" · ")}</p>}
      {path.change_lever_for_positive_net_impact && <p><b>Was würde die positive Netto-Wirkung verbessern?</b> {path.change_lever_for_positive_net_impact}</p>}
      <p className="path-evidence-boundary"><b>Was ist belegt – und was noch nicht?</b> {path.evidence_boundary ?? `Die Einordnung ist eine fachlich hergeleitete Ex-ante-Hypothese. Der Quellenstand (${humanizeSystemValue(path.evidence_status)}) belegt noch keine bereits eingetretene oder der Vorlage eindeutig zurechenbare Wirkung; dafür sind Beobachtungsdaten und ein belastbarer Vergleich erforderlich.`}</p>
    </div>
  </li>)}</ul> : <p className="profile-analysis-empty">{empty}</p>}</div>;
}

type ProfilePath = DecisionImpactProfile["corrected_impact_paths"][number];
type InheritableList = "affected_groups" | "normative_target_areas" | "prerequisites";

function parentPath(path: ProfilePath, allPaths: DecisionImpactProfile["corrected_impact_paths"]) {
  return path.split_from ? allPaths.find((candidate) => candidate.path_id === path.split_from || candidate.path_id === `${path.split_from}-P`) : undefined;
}

function inheritedValues(path: ProfilePath, allPaths: DecisionImpactProfile["corrected_impact_paths"], key: InheritableList) {
  const own = path[key];
  if (own && own.length > 0) return own;
  return parentPath(path, allPaths)?.[key] ?? [];
}

function expandedRationale(path: ProfilePath, allPaths: DecisionImpactProfile["corrected_impact_paths"]) {
  if (path.hypothesis.trim().length >= 60) return path.hypothesis;
  const parent = parentPath(path, allPaths);
  if (parent) {
    return `${path.hypothesis} ist als eigenständiges negatives Wirkungsrisiko der Vorlage ausgewiesen. Es entsteht innerhalb des übergeordneten Mechanismus: ${parent.hypothesis} Damit ist nicht behauptet, dass der Nachteil sicher eintritt; die Richtung ist negativ, weil sein Eintritt die betroffenen Zustände oder Schutzgüter verschlechtern würde.`;
  }
  return `${path.hypothesis} ist als fachlich relevantes ${impactDirectionLabel(path.direction).toLocaleLowerCase("de-DE")} eingeordnet. Die Kurzbezeichnung benennt den möglichen Zustandsnachteil; ob und in welcher Größe er eintritt, bleibt bis zur Prüfung des Vollzugs, eines belastbaren Vergleichs und der kausalen Zurechnung offen.`;
}

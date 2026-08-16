import Link from "next/link";
import { TermInfoLink } from "@/app/components/TermInfoLink";
import { impactDimensions, impactDirectionLabel, type DecisionDomainProfile, type ImpactCountBucket, type ImpactDimension, type ImpactDirection } from "@/lib/members/impact-profiles";

const displayedDirections: ImpactDirection[] = ["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "AMBIVALENT", "NEUTRAL", "OPEN", "NOT_APPLICABLE"];

function DirectionMark({ direction, value, href, active }: { direction: ImpactDirection; value: number; href?: string; active?: boolean }) {
  const contents = <>
    <span aria-hidden="true" className="impact-count-mark" />
    <strong>{value}</strong>
  </>;
  const className = `impact-count impact-count--${direction.toLocaleLowerCase("en-US").replaceAll("_", "-")}${href ? " impact-count--link" : ""}${active ? " is-active" : ""}`;
  const label = `${value} Entscheidungen: ${impactDirectionLabel(direction)}${href ? ". Fälle anzeigen" : ""}`;
  return href ? <Link className={className} href={href} aria-label={label} aria-current={active ? "location" : undefined}>{contents}</Link> : <span className={className} aria-label={label}>{contents}</span>;
}
export function ImpactProfileMatrix({ title, profile, description, baseHref, relation, activeFilter }: { title: string; profile: ImpactCountBucket; description?: string; baseHref?: string; relation?: string; activeFilter?: { relation: string; dimension: ImpactDimension; direction: ImpactDirection } | null }) {
  return <section className="impact-profile-matrix" aria-labelledby={`impact-matrix-${title.replace(/[^a-z0-9]+/gi, "-").toLocaleLowerCase("de-DE")}`}>
    <div className="impact-profile-matrix-heading">
      <h3 id={`impact-matrix-${title.replace(/[^a-z0-9]+/gi, "-").toLocaleLowerCase("de-DE")}`}>{title}</h3>
      {description && <p>{description}</p>}
    </div>
    <div className="impact-profile-matrix-scroll" role="region" aria-label={`${title}: Wirkungsprofil nach Mensch, Planet und Demokratie`} tabIndex={0}>
      <table>
        <thead><tr><th scope="col">Wirkungsraum</th>{displayedDirections.map((direction) => <th scope="col" key={direction}>{impactDirectionLabel(direction)}</th>)}</tr></thead>
        <tbody>{impactDimensions.map((dimension) => <tr key={dimension}>
          <th scope="row"><span className={`mpd-symbol mpd-symbol--${dimension.toLocaleLowerCase("de-DE")}`} aria-hidden="true">{dimension[0]}</span>{dimension}</th>
          {displayedDirections.map((direction) => {
            const value = profile[dimension].decision_classification_counts[direction] ?? 0;
            const href = value > 0 && baseHref && relation ? `${baseHref}?position=${encodeURIComponent(relation)}&dimension=${encodeURIComponent(dimension)}&richtung=${encodeURIComponent(direction)}#fallauswahl` : undefined;
            const active = Boolean(activeFilter && activeFilter.relation === relation && activeFilter.dimension === dimension && activeFilter.direction === direction);
            return <td key={direction}><DirectionMark direction={direction} value={value} href={href} active={active} /></td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}

export function DecisionDomainMatrix({ profile }: { profile: DecisionDomainProfile }) {
  return <dl className="decision-domain-matrix" aria-label="Wirkungsprofil nach Mensch, Planet und Demokratie">
    {impactDimensions.map((dimension) => <div key={dimension}>
      <dt><span className={`mpd-symbol mpd-symbol--${dimension.toLocaleLowerCase("de-DE")}`} aria-hidden="true">{dimension[0]}</span>{dimension}</dt>
      <dd><span className={`direction-label direction-label--${profile[dimension].direction.toLocaleLowerCase("en-US").replaceAll("_", "-")}`}>{impactDirectionLabel(profile[dimension].direction)}</span><small>{profile[dimension].material_path_count} {profile[dimension].material_path_count === 1 ? "materieller Wirkpfad" : "materielle Wirkpfade"} <TermInfoLink termKey="materieller_wirkpfad" /></small></dd>
    </div>)}
  </dl>;
}

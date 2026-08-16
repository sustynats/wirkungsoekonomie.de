import { impactDimensions, impactDirectionLabel, type DecisionDomainProfile, type ImpactCountBucket, type ImpactDirection } from "@/lib/members/impact-profiles";

const displayedDirections: ImpactDirection[] = ["POSITIVE_POTENTIAL", "NEGATIVE_RISK", "AMBIVALENT", "OPEN", "NOT_APPLICABLE"];

function DirectionMark({ direction, value }: { direction: ImpactDirection; value: number }) {
  return <span className={`impact-count impact-count--${direction.toLocaleLowerCase("en-US").replaceAll("_", "-")}`} aria-label={`${value} ${impactDirectionLabel(direction)}`}>
    <span aria-hidden="true" className="impact-count-mark" />
    <strong>{value}</strong>
  </span>;
}
export function ImpactProfileMatrix({ title, profile, description }: { title: string; profile: ImpactCountBucket; description?: string }) {
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
          {displayedDirections.map((direction) => <td key={direction}><DirectionMark direction={direction} value={profile[dimension].decision_classification_counts[direction] ?? 0} /></td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}

export function DecisionDomainMatrix({ profile }: { profile: DecisionDomainProfile }) {
  return <dl className="decision-domain-matrix" aria-label="Wirkungsprofil nach Mensch, Planet und Demokratie">
    {impactDimensions.map((dimension) => <div key={dimension}>
      <dt><span className={`mpd-symbol mpd-symbol--${dimension.toLocaleLowerCase("de-DE")}`} aria-hidden="true">{dimension[0]}</span>{dimension}</dt>
      <dd><span className={`direction-label direction-label--${profile[dimension].direction.toLocaleLowerCase("en-US").replaceAll("_", "-")}`}>{impactDirectionLabel(profile[dimension].direction)}</span><small>{profile[dimension].material_path_count} materielle Wirkpfade</small></dd>
    </div>)}
  </dl>;
}

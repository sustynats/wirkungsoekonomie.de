import Link from "next/link";
import { stateReviewStand, stateReviewCategories } from "@/lib/portal-stand";

export function StateCartogram() {
  const states = stateReviewStand();
  return <div className="state-cartogram" data-state-cartogram>
    <ul className="state-cartogram-grid" aria-label="Fachstand der Bundesländer">
      {states.map((state) => <li className={`state-tile state-position-${state.abbreviation} state-review-${state.category}`} key={state.id} data-state-id={state.id} data-state-review={state.category}>
        <Link href={`/ebenen/laender/${state.slug}`} aria-label={`${state.name}: ${state.label}. ${state.detail}`}>
          <strong>{state.abbreviation}</strong><span>{state.symbol} <span className="state-tile-label">{state.compactLabel}</span></span>
        </Link>
      </li>)}
    </ul>
    <ul className="state-cartogram-legend" aria-label="Anzahl Länder je Fachstand">
      {stateReviewCategories.map((category) => <li key={category.id} data-state-category={category.id}><span>{category.symbol} {category.label}</span> <strong>{states.filter((state) => state.category === category.id).length}</strong></li>)}
    </ul>
    <p className="state-cartogram-scope">✓ bezieht sich nur auf das freigegebene Wahlprogramm-Prüfpaket Sachsen-Anhalts. Andere Stufen sind Teilprüfungen, keine Vollanalyse eines Landes.</p>
  </div>;
}

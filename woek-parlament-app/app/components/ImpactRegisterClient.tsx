"use client";

import { useSearchParams } from "next/navigation";
import { SamePageQueryForm, SamePageStateLink } from "@/app/components/SamePageNavigation";
import { ImpactRegisterRow } from "@/app/components/ImpactRegisterRow";
import { RegisterDistribution } from "@/app/components/RegisterDistribution";
import {
  filterRegister,
  readRegisterFilters,
  registerFacets,
  registerFacetOptions,
  type RegisterFilters,
  type RegisterObject,
} from "@/lib/register-model";
import { registerViews } from "@/lib/navigation";

type ImpactRegisterClientProps = {
  objects: RegisterObject[];
  governmentPublicationOpen: boolean;
};

export function ImpactRegisterView({ objects, governmentPublicationOpen, filters }: ImpactRegisterClientProps & { filters: RegisterFilters }) {
  const selected = filterRegister(objects, filters);
  const collection = registerViews.find((view) => view.key === filters.bestand);

  return <>
    <SamePageQueryForm className="register-filters" aria-label="Wirkungsakten filtern">
      {filters.bestand && <input type="hidden" name="bestand" value={filters.bestand} />}
      <label className="register-query">Titel oder Befund<input name="q" type="search" key={`q:${filters.q ?? ""}`} defaultValue={filters.q ?? ""} /></label>
      <fieldset><legend>Filter kombinieren</legend><div className="register-facet-grid">{registerFacets.map(({ key, label }) => <label key={key}>{label}<select name={key} key={`${key}:${filters[key] ?? ""}`} defaultValue={filters[key] ?? ""}><option value="">Alle</option>{registerFacetOptions(objects, filters, key).map((option) => <option key={option.value} value={option.value}>{option.label} ({option.count})</option>)}</select></label>)}</div></fieldset>
      <div className="register-filter-actions"><button className="button button-primary" type="submit">Filter anwenden</button><SamePageStateLink href="/wirkungsakten">Alle Filter zurücksetzen</SamePageStateLink></div>
    </SamePageQueryForm>
    {filters.bestand && <p className="notice">Bisheriger Bestand: {collection?.label ?? filters.bestand}. <SamePageStateLink href={{ pathname: "/wirkungsakten", query: Object.fromEntries(Object.entries(filters).filter(([key]) => key !== "bestand")) }}>Bestandsbegrenzung aufheben</SamePageStateLink></p>}
    {!governmentPublicationOpen && <p className="notice">Der Regierungsbestand bleibt wegen eines offenen Publikationsgates geschlossen. Fehlende Einträge sind keine Null-Aktivität und keine neutrale Bewertung.</p>}
    <p className="register-result-count" role="status" aria-live="polite"><strong>{selected.length}</strong> von {objects.length} veröffentlichten Akten in diesem Register</p>
    <RegisterDistribution objects={selected} />
    <section aria-labelledby="register-results-title"><h2 id="register-results-title">Akten im Überblick</h2><p>Alphabetisch nach Titel, nicht nach Bewertung sortiert.</p>
      {selected.length ? <div className="register-rows">{selected.map((item) => <ImpactRegisterRow key={item.id} item={item} />)}</div> : <p className="notice">Keine Akte entspricht dieser Filterkombination. Dies ist kein Urteil über politische Tätigkeit oder Wirkung.</p>}
    </section>
    <details className="register-method-note"><summary>Was die Filter aussagen – und was nicht</summary><p>Ebene und Organ bezeichnen den veröffentlichten Bestandskontext, nicht eine kausale Zurechnung. Regierungs- und Parlamentshandlungen bleiben getrennte Akten. EU-Bestände werden nicht pauschal der Kommission zugerechnet.</p><p>Wirkungsfelder übernehmen ausschließlich explizite Zuordnungen zu Mensch, Planet und Demokratie. Fehlende Zuordnungen bleiben offen; Textähnlichkeit erzeugt keine Zuordnung. Eine Akte kann mehrere Wirkungsfelder berühren.</p><p>Es gibt keine freigegebene allgemeine Übertragung narrativer Evidenz oder der Skala hoch/mittel/gering auf vier Evidenzstufen. Nicht eingestuft bedeutet nicht Stufe null. Ein fachlich abgeschlossenes Dokument belegt weder Umsetzung noch beobachtete oder zugerechnete Wirkung.</p><p>Portfolios ohne Einheitsrichtung zählen als „offen / nicht aggregierbar“; ihre einzelnen Pfade bleiben in den Akten sichtbar. Gegenläufige Pfade werden nie zu einem Mittelwert.</p></details>
  </>;
}

export function ImpactRegisterClient(props: ImpactRegisterClientProps) {
  const searchParams = useSearchParams();
  const filters = readRegisterFilters(Object.fromEntries(searchParams.entries()));
  return <ImpactRegisterView {...props} filters={filters} />;
}

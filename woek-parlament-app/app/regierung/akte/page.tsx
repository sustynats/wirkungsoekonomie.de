import type { Metadata } from "next";
import { GovernmentActionCard } from "@/app/components/government/GovernmentActionCard";
import { actionTypeLabels, getGovernmentPublicData } from "@/lib/government/public-data";
import { searchableOfficialIdentifierText } from "@/lib/government/official-identifiers";

export const metadata: Metadata = { title: "Regierungsakte" };

const themeTerms: Record<string, string[]> = {
  Wirtschaft: ["wirtschaft", "unternehmen", "industrie", "handel"], Energie: ["energie", "strom", "gas", "netz"], Klima: ["klima", "emission", "co2"], Gebäude: ["gebäude", "heizung", "wohnen"], Gesundheit: ["gesundheit", "krankenhaus", "medizin", "pflege"], Arbeit: ["arbeit", "beschäftigung", "tarif"], Soziales: ["sozial", "grundsicherung", "familie", "kindergeld"], Rente: ["rente", "altersvorsorge"], Verkehr: ["verkehr", "bahn", "straße", "mobilität"], Digitalstaat: ["digital", "daten", "online"], Forschung: ["forschung", "wissenschaft"], Bildung: ["bildung", "schule", "ausbildung"], Migration: ["migration", "asyl", "aufenthalt"], Sicherheit: ["sicherheit", "bundeswehr", "polizei", "schutz"], Landwirtschaft: ["landwirtschaft", "tier", "ernährung"], Verbraucherschutz: ["verbraucher"], "Internationale Politik": ["international", "europ", "abkommen"], Entwicklungspolitik: ["entwicklungspolitik", "entwicklungszusammenarbeit"],
};

export default async function GovernmentActionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().toLocaleLowerCase("de");
  const type = String(params.typ ?? "");
  const theme = String(params.thema ?? "");
  const { actions } = getGovernmentPublicData();
  const filtered = actions.filter((action) => {
    const haystack = [action.title, ...action.responsible_institutions, searchableOfficialIdentifierText(action.official_identifiers)].join(" ").toLocaleLowerCase("de");
    const themeMatch = !theme || (themeTerms[theme] ?? []).some((term) => haystack.includes(term));
    return (!query || haystack.includes(query)) && (!type || action.action_type === type) && themeMatch;
  });
  const types = [...new Set(actions.map((action) => action.action_type))].sort();
  return (
    <section className="section shell government-list-page">
      <p className="eyebrow">Government Data 1.2</p>
      <h1>Regierungsakte</h1>
      <p className="lead">Hier stehen ausschließlich faktisch bestätigte Regierungsakte mit amtlicher Primärquelle. Der kanonische Arbeitsbestand ist größer; ungeklärte Kandidaten erscheinen nicht in dieser Liste.</p>
      <form className="government-filter" role="search">
        <label>Regierungsakte durchsuchen<input name="q" type="search" defaultValue={String(params.q ?? "")} placeholder="Titel, Ressort oder amtliche Kennung" /></label>
        <label>Art des Regierungsakts<select name="typ" defaultValue={type}><option value="">Alle Arten</option>{types.map((value) => <option key={value} value={value}>{actionTypeLabels[value] ?? value}</option>)}</select></label>
        <label>Themenfeld<select name="thema" defaultValue={theme}><option value="">Alle Themen</option>{Object.keys(themeTerms).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <button className="button button-primary" type="submit">Filtern</button>
      </form>
      <p className="government-result-count" aria-live="polite">{filtered.length.toLocaleString("de-DE")} Treffer. Angezeigt werden höchstens 120 je Ansicht.</p>
      <div className="government-action-grid">{filtered.slice(0, 120).map((action) => <GovernmentActionCard key={action.government_action_id} action={action} />)}</div>
      {filtered.length > 120 && <div className="notice notice-neutral"><strong>Ergebnis begrenzt</strong><p>Bitte Suche oder Filter verfeinern. So wird der umfangreiche Faktenbestand nicht vollständig in eine einzelne Browseransicht geladen.</p></div>}
    </section>
  );
}

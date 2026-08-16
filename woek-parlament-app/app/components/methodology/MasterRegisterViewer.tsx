"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isOpenRegisterStatus, polarityLabel, type MasterRegisterItem } from "@/lib/master-register-shared";

type Props = {
  items: MasterRegisterItem[];
  initialQuery?: string;
};

const PAGE_SIZE = 40;

export function MasterRegisterViewer({ items, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [sdg, setSdg] = useState("");
  const [family, setFamily] = useState("");
  const [polarity, setPolarity] = useState("");
  const [status, setStatus] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const sdgs = useMemo(() => [...new Set(items.map((item) => item.SDG_or_SDGplus))].sort((a, b) => a.localeCompare(b, "de")), [items]);
  const families = useMemo(() => [...new Set(items.map((item) => item.Indikatorfamilie))].sort((a, b) => a.localeCompare(b, "de")), [items]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de-DE");
    return items.filter((item) => {
      const haystack = `${item.WOK_ID} ${item.Item} ${item.Definition} ${item.Indikatorfamilie} ${item.SDG_or_SDGplus} ${item.Rule_ID}`.toLocaleLowerCase("de-DE");
      if (needle && !haystack.includes(needle)) return false;
      if (sdg && item.SDG_or_SDGplus !== sdg) return false;
      if (family && item.Indikatorfamilie !== family) return false;
      if (polarity && item.Polarity !== polarity) return false;
      if (status === "open" && !isOpenRegisterStatus(item)) return false;
      if (status === "usable" && isOpenRegisterStatus(item)) return false;
      return true;
    });
  }, [family, items, polarity, query, sdg, status]);
  const shown = filtered.slice(0, visible);

  function resetFilters() {
    setQuery("");
    setSdg("");
    setFamily("");
    setPolarity("");
    setStatus("");
    setVisible(PAGE_SIZE);
  }

  return (
    <section className="register-viewer" aria-labelledby="register-viewer-title">
      <div className="register-viewer-heading">
        <div><p className="eyebrow">Durchsuchen und filtern</p><h2 id="register-viewer-title">621 WÖk-IDs nachvollziehen</h2></div>
        <p><strong>{filtered.length}</strong> Einträge entsprechen der Auswahl. Eine offene Kalibrierung bleibt sichtbar offen und erzeugt keine neutrale Bewertung.</p>
      </div>

      <form className="register-filters" onSubmit={(event) => event.preventDefault()}>
        <label className="register-search">Suche<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(PAGE_SIZE); }} placeholder="WÖk-ID, Bezeichnung, Regel oder Messgröße" /></label>
        <label>SDG oder SDG+<select value={sdg} onChange={(event) => { setSdg(event.target.value); setVisible(PAGE_SIZE); }}><option value="">Alle Referenzziele</option>{sdgs.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label>Indikatorfamilie<select value={family} onChange={(event) => { setFamily(event.target.value); setVisible(PAGE_SIZE); }}><option value="">Alle Familien</option>{families.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label>Technische Messrichtung<select value={polarity} onChange={(event) => { setPolarity(event.target.value); setVisible(PAGE_SIZE); }}><option value="">Beide Richtungen</option><option value="higher_is_better">Höherer Wert günstiger</option><option value="lower_is_better">Niedrigerer Wert günstiger</option></select></label>
        <label>Fachstatus<select value={status} onChange={(event) => { setStatus(event.target.value); setVisible(PAGE_SIZE); }}><option value="">Alle Status</option><option value="open">Validierung oder Quelle offen</option><option value="usable">Ohne erkannten offenen Hinweis</option></select></label>
        <button className="button button-secondary" type="button" onClick={resetFilters}>Filter zurücksetzen</button>
      </form>

      <p className="register-mpd-boundary"><strong>Warum gibt es hier keinen pauschalen Mensch-Planet-Demokratie-Filter?</strong> Das v1.4-Register ordnet technische Indikatoren SDGs und SDG+ zu. Die konkrete MPD-Zuordnung entsteht kontextbezogen im Wirkpfad eines Falls. Eine automatische Ableitung allein aus einer WÖk-ID würde Mehrdimensionalität vortäuschen.</p>

      {shown.length ? <div className="register-result-list">
        {shown.map((item) => <article key={item.WOK_ID}>
          <div className="register-result-id"><span>{item.WOK_ID}</span><small>{item.Version}</small></div>
          <div className="register-result-main"><p className="register-result-reference">{item.SDG_or_SDGplus} · {item.Indikatorfamilie}</p><h3>{item.Item}</h3><p>{item.Definition}</p><div className="register-result-meta"><span>{item.Einheit}</span><span>{polarityLabel(item.Polarity)}</span><span className={isOpenRegisterStatus(item) ? "is-open" : "is-usable"}>{isOpenRegisterStatus(item) ? "Validierung oder Quelle offen" : "strukturell nutzbar"}</span></div></div>
          <Link className="text-link" href={`/methodik/register/${encodeURIComponent(item.WOK_ID)}`}>Eintrag prüfen</Link>
        </article>)}
      </div> : <p className="register-empty">Für diese Filterkombination gibt es keinen Eintrag. Es wird kein Ersatzwert erzeugt.</p>}

      {visible < filtered.length && <button className="button button-secondary register-load-more" type="button" onClick={() => setVisible((value) => value + PAGE_SIZE)}>Weitere {Math.min(PAGE_SIZE, filtered.length - visible)} Einträge anzeigen</button>}
    </section>
  );
}

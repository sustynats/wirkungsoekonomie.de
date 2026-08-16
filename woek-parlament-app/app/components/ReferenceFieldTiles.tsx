import Link from "next/link";

type Props = { mpd: string[]; sdgAndPlus: string[] };

function isSdg(value: string) {
  return /^SDG\s+\d+$/i.test(value);
}

function sdgNumber(value: string) {
  return Number(value.match(/\d+/)?.[0] ?? 16);
}

/**
 * A compact, non-scoring visual reference map. It is deliberately separate
 * from the case-level mapping tiles, because a field being touched does not
 * by itself establish a positive or negative contribution.
 */
export function ReferenceFieldTiles({ mpd, sdgAndPlus }: Props) {
  if (mpd.length === 0 && sdgAndPlus.length === 0) return null;
  return <section className="reference-field-tiles" aria-labelledby="reference-fields-title">
    <header><p className="eyebrow">Normativer Prüfbezug</p><h2 id="reference-fields-title">Welche Ziele und Schutzgüter berührt der Fall?</h2><p>Die Liste zeigt den Prüfbezug aus den dokumentierten Wirkpfaden. Sie ist keine Gesamtpunktzahl und keine fertige Wirkungsbewertung.</p></header>
    {mpd.length > 0 ? <div className="mpd-reference-row" aria-label="Mensch Planet Demokratie">{mpd.map((dimension) => <span key={dimension}>{dimension}</span>)}</div> : null}
    {sdgAndPlus.length > 0 ? <div className="reference-field-list">
      {sdgAndPlus.map((field) => {
        const sdg = isSdg(field);
        const number = sdg ? sdgNumber(field) : null;
        return <article className="reference-field-row" key={field}>
          <span className={sdg ? `target-mark target-mark--sdg-${number}${number === 5 ? " target-mark--contrast-field" : ""}` : "target-mark target-mark--sdgplus-democracy"}>{sdg ? number : "+"}</span>
          <strong>{field}</strong>
          <Link href={sdg ? "/quellen/agenda-2030-sdgs" : "/quellen/sdg-plus-referenzrahmen"}>{sdg ? "Agenda 2030" : "SDG+ Referenz"}</Link>
        </article>;
      })}
    </div> : null}
  </section>;
}

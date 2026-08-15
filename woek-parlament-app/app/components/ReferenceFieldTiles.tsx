import Link from "next/link";
import { DemocracyIcon, ReferenceIcon } from "@/app/components/icons";

type Props = { mpd: string[]; sdgAndPlus: string[] };

function isSdg(value: string) {
  return /^SDG\s+\d+$/i.test(value);
}

/**
 * A compact, non-scoring visual reference map. It is deliberately separate
 * from the case-level mapping tiles, because a field being touched does not
 * by itself establish a positive or negative contribution.
 */
export function ReferenceFieldTiles({ mpd, sdgAndPlus }: Props) {
  if (mpd.length === 0 && sdgAndPlus.length === 0) return null;
  return <section className="reference-field-tiles" aria-labelledby="reference-fields-title">
    <header><p className="eyebrow">Normativer Prüfbezug</p><h2 id="reference-fields-title">Welche Ziele und Schutzgüter berührt der Fall?</h2><p>Die Kacheln zeigen den Prüfbezug aus den dokumentierten Wirkpfaden. Sie sind keine Gesamtpunktzahl und keine fertige Wirkungsbewertung.</p></header>
    {mpd.length > 0 ? <div className="mpd-reference-row" aria-label="Mensch Planet Demokratie">{mpd.map((dimension) => <span key={dimension}>{dimension}</span>)}</div> : null}
    {sdgAndPlus.length > 0 ? <div className="reference-field-grid">
      {sdgAndPlus.map((field) => {
        const sdg = isSdg(field);
        return <article className={sdg ? "reference-field reference-field--sdg" : "reference-field reference-field--plus"} key={field}>
          {sdg ? <ReferenceIcon aria-hidden="true" /> : <DemocracyIcon aria-hidden="true" />}
          <strong>{field}</strong>
          <Link href={sdg ? "/quellen/agenda-2030-sdgs" : "/quellen/sdg-plus-referenzrahmen"}>{sdg ? "Agenda 2030" : "SDG+ Referenz"}</Link>
        </article>;
      })}
    </div> : null}
  </section>;
}

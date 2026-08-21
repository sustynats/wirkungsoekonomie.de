"use client";

import { useMemo, useState } from "react";
import type { CoalitionCommitmentRecord } from "@/lib/states/baden-wuerttemberg-coalition";

type ChapterOption = { chapter: number; title: string; atomicCommitments: number };
type PublicCommitmentRecord = Pick<CoalitionCommitmentRecord, "commitment_id" | "chapter" | "commitment_text" | "source_locator" | "atomic_count" | "container_children" | "parent_container_id">;

export function StateCoalitionCommitmentInventory({ records, chapters }: { records: PublicCommitmentRecord[]; chapters: ChapterOption[] }) {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("ALL");
  const normalizedQuery = query.trim().toLocaleLowerCase("de-DE");
  const filtered = useMemo(() => records.filter((record) => {
    if (chapter !== "ALL" && record.chapter !== Number(chapter)) return false;
    if (!normalizedQuery) return true;
    return `${record.commitment_id} ${record.commitment_text} ${record.source_locator}`.toLocaleLowerCase("de-DE").includes(normalizedQuery);
  }), [chapter, normalizedQuery, records]);
  const grouped = chapters.map((item) => ({ ...item, records: filtered.filter((record) => record.chapter === item.chapter) })).filter((item) => item.records.length > 0);

  return <section className="coalition-commitment-inventory" id="commitment-register" aria-labelledby="commitment-register-title">
    <p className="eyebrow">Vollakte · fundstellengebundenes Zusagenregister</p>
    <h2 id="commitment-register-title">1.577 atomare Zusagen aus allen 15 Kapiteln</h2>
    <p>Jeder Eintrag dokumentiert genau einen geprüften Quellenanker. Eine Koalitionszusage ist noch keine Regierungshandlung, keine Umsetzung und kein Wirkungsnachweis. Sechs übergeordnete Quellen-Container bleiben nachvollziehbar erhalten, werden aber nicht als atomare Zusage mitgezählt.</p>
    <div className="coalition-inventory-controls" role="search" aria-label="Zusagenregister filtern">
      <label>
        <span>Zusage oder Fundstelle suchen</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="z. B. Gesundheitsversorgung oder S. 145" />
      </label>
      <label>
        <span>Kapitel</span>
        <select value={chapter} onChange={(event) => setChapter(event.target.value)}>
          <option value="ALL">Alle 15 Kapitel</option>
          {chapters.map((item) => <option key={item.chapter} value={item.chapter}>Kapitel {item.chapter}: {item.title}</option>)}
        </select>
      </label>
    </div>
    <p className="coalition-inventory-result" aria-live="polite"><strong>{filtered.filter((record) => record.atomic_count).length.toLocaleString("de-DE")}</strong> atomare Zusagen im aktuellen Filter</p>
    <div className="coalition-inventory-chapters">
      {grouped.map((item) => <details key={item.chapter} open={chapter !== "ALL"}>
        <summary>Kapitel {item.chapter}: {item.title}<small>{item.records.filter((record) => record.atomic_count).length} atomare Zusagen</small></summary>
        <ol>
          {item.records.map((record) => <li key={record.commitment_id} className={record.atomic_count ? "" : "coalition-inventory-container"}>
            <p>{record.commitment_text}</p>
            <p className="coalition-inventory-source"><strong>Fundstelle:</strong> {record.source_locator}</p>
            <details className="coalition-inventory-technical" data-woek-technical-proof>
              <summary>Technische Quellenkennung</summary>
              <p><code>{record.commitment_id}</code></p>
              {!record.atomic_count ? <p>Quellen-Container; nicht als atomare Zusage gezählt. {record.container_children?.length ?? 0} atomare Unterobjekte sind verknüpft.</p> : null}
              {record.parent_container_id ? <p>Atomarer Untergegenstand eines Quellen-Containers.</p> : null}
            </details>
          </li>)}
        </ol>
      </details>)}
      {grouped.length === 0 ? <p className="notice">Keine Zusage entspricht diesem Filter.</p> : null}
    </div>
  </section>;
}

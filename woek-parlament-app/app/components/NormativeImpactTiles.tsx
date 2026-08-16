"use client";

import { useMemo, useState } from "react";
import type { PublicNormativeMapping, PublicNormativeMappingItem } from "@/data/cases";
import { BoundaryIcon, DemocracyIcon, ReferenceIcon } from "@/app/components/icons";
import { humanizeSystemValue } from "@/lib/presentation/labels";

const directionLabel: Record<PublicNormativeMappingItem["direction"], string> = {
  POSITIVE_POTENTIAL: "überwiegend stärkend",
  NEGATIVE_RISK: "Risiko überwiegt",
  NEUTRAL: "richtungsneutral",
  AMBIVALENT: "gemischt",
  OPEN: "Richtung offen",
  OBSERVED_POSITIVE: "beobachtet stärkend",
  OBSERVED_NEGATIVE: "beobachtet belastend"
};

const constitutionalAnchorTypeLabel: Record<NonNullable<PublicNormativeMappingItem["constitutionalAnchorType"]>, string> = {
  FUNDAMENTAL_RIGHT: "Grundrecht",
  STATE_STRUCTURE_PRINCIPLE: "Staatsstrukturprinzip",
  STATE_OBJECTIVE: "Staatsziel",
  PROTECTION_DUTY: "Schutzauftrag",
  EU_PRIMARY_LAW: "EU-Primärrecht",
  HUMAN_RIGHTS: "Menschenrechte",
  STATE_CONSTITUTION: "Landesverfassung"
};

type SortMode = "scope" | "direction" | "alphabetical";

function sdgNumber(item: PublicNormativeMappingItem) {
  const value = item.code.match(/SDG\s*(\d+)/i)?.[1] ?? item.id.match(/SDG[_-]0?(\d+)/i)?.[1];
  return value ? Number(value) : null;
}

function sdgPlusClass(item: PublicNormativeMappingItem) {
  const value = `${item.id} ${item.label}`.toLowerCase();
  if (value.includes("rechtsstaat") || value.includes("rule_of_law")) return "target-mark--sdgplus-rule";
  if (value.includes("digital")) return "target-mark--sdgplus-digital";
  if (value.includes("zusammenhalt") || value.includes("cohesion")) return "target-mark--sdgplus-cohesion";
  if (value.includes("medien") || value.includes("media")) return "target-mark--sdgplus-media";
  if (value.includes("diskurs") || value.includes("discourse")) return "target-mark--sdgplus-discourse";
  if (value.includes("vertrauen") || value.includes("trust")) return "target-mark--sdgplus-trust";
  return "target-mark--sdgplus-democracy";
}

function anchorClass(item: PublicNormativeMappingItem) {
  switch (item.constitutionalAnchorType) {
    case "FUNDAMENTAL_RIGHT":
    case "HUMAN_RIGHTS": return "target-mark--legal-right";
    case "STATE_STRUCTURE_PRINCIPLE": return "target-mark--legal-structure";
    case "STATE_OBJECTIVE":
    case "STATE_CONSTITUTION": return "target-mark--legal-objective";
    case "PROTECTION_DUTY": return "target-mark--legal-duty";
    case "EU_PRIMARY_LAW": return "target-mark--legal-eu";
    default: return "target-mark--legal-structure";
  }
}

function targetMark(item: PublicNormativeMappingItem) {
  if (item.framework === "SDG") {
    const number = sdgNumber(item);
    return { className: `target-mark target-mark--sdg-${number ?? 16}${number === 5 ? " target-mark--contrast-field" : ""}`, label: number?.toString() ?? "SDG" };
  }
  if (item.framework === "SDG_PLUS") return { className: `target-mark ${sdgPlusClass(item)}`, label: "+" };
  return { className: `target-mark ${anchorClass(item)}`, label: "§" };
}

function directionWeight(value: PublicNormativeMappingItem["direction"]) {
  if (value === "NEGATIVE_RISK" || value === "OBSERVED_NEGATIVE") return 3;
  if (value === "AMBIVALENT") return 2;
  if (value === "POSITIVE_POTENTIAL" || value === "OBSERVED_POSITIVE") return 1;
  return 0;
}

function DirectionBars({ item }: { item: PublicNormativeMappingItem }) {
  if (item.framework === "CONSTITUTIONAL_ANCHOR") {
    return <span className="target-review-status"><BoundaryIcon aria-hidden="true" />berührt · Prüfgrenze</span>;
  }
  const positive = item.direction === "POSITIVE_POTENTIAL" || item.direction === "OBSERVED_POSITIVE";
  const negative = item.direction === "NEGATIVE_RISK" || item.direction === "OBSERVED_NEGATIVE";
  const mixed = item.direction === "AMBIVALENT";
  const open = item.direction === "OPEN" || item.direction === "NEUTRAL";
  return <span className="target-direction">
    <span className="direction-bars" aria-hidden="true">
      <i className={positive || mixed ? "is-positive" : ""} />
      <i className={mixed || open ? "is-neutral" : ""} />
      <i className={negative || mixed ? "is-negative" : ""} />
    </span>
    <span>{directionLabel[item.direction]}</span>
  </span>;
}

function conciseRationale(value: string, label: string) {
  const match = value.match(/^Der Wirkpfad „([\s\S]+?)“ berührt .+?\.\s*(?:Die Zuordnung [\s\S]*)?$/);
  return (match?.[1] ?? value)
    .replace(new RegExp(`\\s*berührt\\s+${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.?`, "i"), "")
    .replace(/\s*Die Zuordnung beschreibt[\s\S]*$/i, "")
    .trim();
}

function MappingGroup({ title, description, items, icon: Icon }: { title: string; description: string; items: PublicNormativeMappingItem[]; icon: typeof ReferenceIcon }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("scope");
  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    if (sortMode === "alphabetical") return a.label.localeCompare(b.label, "de");
    if (sortMode === "direction") return directionWeight(b.direction) - directionWeight(a.direction) || b.impactPathRefs.length - a.impactPathRefs.length;
    return b.impactPathRefs.length - a.impactPathRefs.length || a.label.localeCompare(b.label, "de");
  }), [items, sortMode]);

  return <section className="target-group" aria-labelledby={`target-group-${items[0]?.framework}`}>
    <header className="target-group-heading">
      <div><Icon aria-hidden="true" /><div><h3 id={`target-group-${items[0]?.framework}`}>{title}</h3><p>{description}</p></div></div>
      <label>Sortierung
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
          <option value="scope">stärkste Berührung</option>
          <option value="direction">Richtung und Risiko</option>
          <option value="alphabetical">alphabetisch</option>
        </select>
      </label>
    </header>
    <div className="target-list-head" aria-hidden="true"><span>Ziel</span><span>Bezeichnung</span><span>{items[0]?.framework === "CONSTITUTIONAL_ANCHOR" ? "Prüfstatus" : "Richtung"}</span><span>Umfang</span><span /></div>
    <div className="target-list">
      {sortedItems.map((item) => {
        const isOpen = openId === item.id;
        const mark = targetMark(item);
        return <div className={`target-list-item target-list-item--${item.framework.toLowerCase()}`} key={item.id}>
          <button className="target-row" type="button" aria-expanded={isOpen} aria-controls={`target-panel-${item.id}`} onClick={() => setOpenId(isOpen ? null : item.id)}>
            <span className={mark.className}>{mark.label}</span>
            <span className="target-row-title"><strong>{item.label}</strong>{item.constitutionalAnchorType && <small>{constitutionalAnchorTypeLabel[item.constitutionalAnchorType]}{item.legalReference ? ` · ${item.legalReference}` : ""}</small>}</span>
            <DirectionBars item={item} />
            <span className="target-row-scope">{item.impactPathRefs.length} {item.impactPathRefs.length === 1 ? "Wirkpfad" : "Wirkpfade"}</span>
            <span className="target-row-chevron" aria-hidden="true">{isOpen ? "−" : "+"}</span>
          </button>
          {isOpen && <article className="target-panel" id={`target-panel-${item.id}`}>
            <div><p className="eyebrow">Warum dieser Bezug?</p><h4>{item.label}</h4><p className="target-panel-evidence"><strong>Evidenzstatus:</strong> {humanizeSystemValue(item.evidenceStatus)}</p></div>
            <div className="target-panel-body">
              <p><strong>{item.impactPathRefs.length === 1 ? `Wirkpfad ${item.impactPathRefs[0]}` : `Wirkpfade ${item.impactPathRefs.join(", ")}`}:</strong> {conciseRationale(item.rationale, item.label)}</p>
              <p className="target-panel-boundary">Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz. Sie ist weder ein Nachweis bereits eingetretener Wirkung noch eine Rechtsfeststellung.</p>
              <a className="target-reference-link" href={item.referenceHref}>Referenz und Quelle ansehen</a>
            </div>
          </article>}
        </div>;
      })}
    </div>
  </section>;
}

export function NormativeImpactTiles({ mapping }: { mapping: PublicNormativeMapping }) {
  const sdgItems = mapping.sdgItems ?? [];
  const sdgPlusItems = mapping.sdgPlusItems ?? [];
  const constitutionalAnchorItems = mapping.constitutionalAnchorItems ?? [];
  if (![...sdgItems, ...sdgPlusItems, ...constitutionalAnchorItems].length) return null;
  const status = mapping.status === "PUBLISHED" ? "Fachlich freigegeben" : mapping.status === "PROVISIONAL" ? "Vorläufige Zuordnung" : "Evidenzstand offen";
  return <section className="normative-impact-tiles" aria-labelledby="normative-impact-tiles-title">
    <header><div><p className="eyebrow">Referenzrahmen</p><h2 id="normative-impact-tiles-title">Welche Ziele und Schutzgüter sind berührt?</h2><p>Die Liste ergibt keine Gesamtpunktzahl. Sie zeigt getrennt, wo Wirkungspotenzial, Wirkungsrisiko oder offene Evidenz im SDG-/SDG+-Referenzrahmen sowie an Staatszielen, Grundrechten und Schutzaufträgen berührt sind. Sortiere die Einträge, um Schwerpunkte schneller zu erkennen.</p></div><span className={`mapping-status mapping-status-${mapping.status.toLowerCase()}`}>{status}</span></header>
    <p className="normative-basis"><strong>Prüfbasis:</strong> {mapping.basis}</p>
    {sdgItems.length > 0 && <MappingGroup title="Nachhaltigkeitsziele" description="Global vereinbarte Ziele der Agenda 2030" items={sdgItems} icon={ReferenceIcon} />}
    {sdgPlusItems.length > 0 && <MappingGroup title="SDG+" description="Demokratische, rechtsstaatliche, mediale und digitale Voraussetzungen" items={sdgPlusItems} icon={DemocracyIcon} />}
    {constitutionalAnchorItems.length > 0 && <><MappingGroup title="Grundrechte, Staatsziele und Schutzaufträge" description="Rechts- und Schutzrahmen für den deutschen beziehungsweise europäischen Kontext" items={constitutionalAnchorItems} icon={BoundaryIcon} /><p className="normative-anchor-note">Ein berührter Anker ist keine Rechtsfeststellung und kein zusätzlicher Wirkungspunkt. Er macht Prüfgrenzen und den rechtlichen Kontext sichtbar.</p></>}
  </section>;
}

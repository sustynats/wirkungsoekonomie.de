"use client";

import { useState } from "react";
import type { PublicNormativeMapping, PublicNormativeMappingItem } from "@/data/cases";
import { BoundaryIcon, DemocracyIcon, ReferenceIcon } from "@/app/components/icons";
import { humanizeSystemValue } from "@/lib/presentation/labels";

const directionLabel: Record<PublicNormativeMappingItem["direction"], string> = {
  POSITIVE_POTENTIAL: "positives Potenzial", NEGATIVE_RISK: "negatives Risiko", AMBIVALENT: "gemischte Richtung", EVIDENCE_OPEN: "Evidenz offen", OBSERVED_POSITIVE: "beobachtet positiv", OBSERVED_NEGATIVE: "beobachtet negativ"
};

const constitutionalAnchorTypeLabel: Record<NonNullable<PublicNormativeMappingItem["constitutionalAnchorType"]>, string> = {
  FUNDAMENTAL_RIGHT: "Grundrecht", STATE_STRUCTURE_PRINCIPLE: "Staatsstrukturprinzip", STATE_OBJECTIVE: "Staatsziel", PROTECTION_DUTY: "Schutzauftrag", EU_PRIMARY_LAW: "EU-Primärrecht", HUMAN_RIGHTS: "Menschenrechte", STATE_CONSTITUTION: "Landesverfassung"
};

function FrameworkIcon({ framework }: { framework: PublicNormativeMappingItem["framework"] }) {
  if (framework === "SDG_PLUS") return <DemocracyIcon aria-hidden="true" />;
  if (framework === "CONSTITUTIONAL_ANCHOR") return <BoundaryIcon aria-hidden="true" />;
  return <ReferenceIcon aria-hidden="true" />;
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
  const selected = items.find((item) => item.id === openId) ?? null;
  return <div className="normative-tile-group">
    <div className="normative-group-heading"><Icon aria-hidden="true" /><h3>{title}</h3><p>{description}</p></div>
    <div className="normative-tile-grid">
      {items.map((item) => {
        const frameworkClass = item.framework === "SDG_PLUS" ? "plus" : item.framework === "CONSTITUTIONAL_ANCHOR" ? "anchor" : "sdg";
        const isOpen = selected?.id === item.id;
        return <article className={`normative-tile normative-tile-${frameworkClass}`} key={item.id}>
          <div className="normative-tile-header"><span className="normative-tile-code"><FrameworkIcon framework={item.framework} />{item.code}</span><span className={`normative-direction normative-direction-${item.direction.toLowerCase()}`}>{directionLabel[item.direction]}</span></div>
          <h4>{item.label}</h4>
          {item.constitutionalAnchorType && <p className="normative-anchor-type">{constitutionalAnchorTypeLabel[item.constitutionalAnchorType]}{item.legalReference ? ` · ${item.legalReference}` : ""}</p>}
          <p className="normative-evidence"><strong>Evidenz:</strong> {humanizeSystemValue(item.evidenceStatus)}</p>
          <p className="normative-preview">{item.impactPathRefs.length} {item.impactPathRefs.length === 1 ? "Wirkpfad" : "Wirkpfade"} zugeordnet</p>
          <button className="normative-reason-toggle" type="button" aria-expanded={isOpen} aria-controls={`normative-panel-${item.id}`} onClick={() => setOpenId(isOpen ? null : item.id)}>{isOpen ? "Begründung schließen" : "Warum berührt?"}</button>
        </article>;
      })}
    </div>
    {selected && <article className="normative-tile-panel" id={`normative-panel-${selected.id}`}>
      <div><p className="eyebrow">Warum dieser Bezug?</p><h4>{selected.label}</h4></div>
      <div className="normative-tile-panel-body">
        <p><strong>{selected.impactPathRefs.length === 1 ? `Wirkpfad ${selected.impactPathRefs[0]}` : `Wirkpfade ${selected.impactPathRefs.join(", ")}`}:</strong> {conciseRationale(selected.rationale, selected.label)}</p>
        <p className="normative-panel-boundary">Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz. Sie ist weder ein Nachweis bereits eingetretener Wirkung noch eine Rechtsfeststellung.</p>
        <a className="normative-reference-link" href={selected.referenceHref}>Referenz und Quelle ansehen</a>
      </div>
    </article>}
  </div>;
}

export function NormativeImpactTiles({ mapping }: { mapping: PublicNormativeMapping }) {
  const sdgItems = mapping.sdgItems ?? [];
  const sdgPlusItems = mapping.sdgPlusItems ?? [];
  const constitutionalAnchorItems = mapping.constitutionalAnchorItems ?? [];
  if (![...sdgItems, ...sdgPlusItems, ...constitutionalAnchorItems].length) return null;
  const status = mapping.status === "PUBLISHED" ? "Fachlich freigegeben" : mapping.status === "PROVISIONAL" ? "Vorläufige Zuordnung" : "Evidenzstand offen";
  return <section className="normative-impact-tiles" aria-labelledby="normative-impact-tiles-title">
    <header><div><p className="eyebrow">Referenzrahmen</p><h2 id="normative-impact-tiles-title">Welche Ziele und Schutzgüter sind berührt?</h2><p>Die Kacheln ergeben keine Gesamtpunktzahl. Sie zeigen getrennt, wo Wirkungspotenzial, Wirkungsrisiko oder offene Evidenz im SDG-/SDG+-Referenzrahmen sowie an Staatszielen, Grundrechten und Schutzaufträgen berührt sind.</p></div><span className={`mapping-status mapping-status-${mapping.status.toLowerCase()}`}>{status}</span></header>
    <p className="normative-basis"><strong>Prüfbasis:</strong> {mapping.basis}</p>
    {sdgItems.length > 0 && <MappingGroup title="SDGs" description="Global vereinbarte Ziele der Agenda 2030" items={sdgItems} icon={ReferenceIcon} />}
    {sdgPlusItems.length > 0 && <MappingGroup title="SDG+" description="Demokratische, rechtsstaatliche, mediale und digitale Voraussetzungen" items={sdgPlusItems} icon={DemocracyIcon} />}
    {constitutionalAnchorItems.length > 0 && <><MappingGroup title="Staatsziele, Grundrechte & Schutzaufträge" description="Rechts- und Schutzrahmen für den deutschen beziehungsweise europäischen Kontext" items={constitutionalAnchorItems} icon={BoundaryIcon} /><p className="normative-anchor-note">Ein berührter Anker ist keine Rechtsfeststellung und kein zusätzlicher Wirkungspunkt. Er macht Prüfgrenzen und den rechtlichen Kontext sichtbar.</p></>}
  </section>;
}

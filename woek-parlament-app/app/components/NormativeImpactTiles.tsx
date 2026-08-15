"use client";

import { useState, type ReactNode } from "react";
import type { PublicNormativeMapping, PublicNormativeMappingItem } from "@/data/cases";
import { BoundaryIcon, DemocracyIcon, ReferenceIcon } from "@/app/components/icons";
import { humanizeSystemValue } from "@/lib/presentation/labels";

const directionLabel: Record<PublicNormativeMappingItem["direction"], string> = {
  POSITIVE_POTENTIAL: "positives Potenzial",
  NEGATIVE_RISK: "negatives Risiko",
  AMBIVALENT: "gemischte Richtung",
  EVIDENCE_OPEN: "Evidenz offen",
  OBSERVED_POSITIVE: "beobachtet positiv",
  OBSERVED_NEGATIVE: "beobachtet negativ"
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

const mappingBoundary = "Die Zuordnung beschreibt Ziel- und Schutzgüterrelevanz. Sie belegt keine bereits eingetretene Wirkung und ist keine Rechtsfeststellung.";

function FrameworkIcon({ framework }: { framework: PublicNormativeMappingItem["framework"] }) {
  if (framework === "SDG_PLUS") return <DemocracyIcon aria-hidden="true" />;
  if (framework === "CONSTITUTIONAL_ANCHOR") return <BoundaryIcon aria-hidden="true" />;
  return <ReferenceIcon aria-hidden="true" />;
}

function roundedText(value: string) {
  return value.replace(/(\d{1,3}(?:\.\d{3})*),(\d)\d+(?=\s*(?:Mrd\.|Mio\.|Euro|Prozent|%))/g, "$1,$2");
}

function rationaleFor(item: PublicNormativeMappingItem) {
  const snippets = [...item.rationale.matchAll(/Der Wirkpfad „([^“]+)“ berührt [^.]+\.(?:\s*)/g)].map((match) => roundedText(match[1].trim()));
  const uniqueSnippets = [...new Set(snippets)];
  const hasStandardBoundary = /Die Zuordnung beschreibt Ziel- oder Schutzgüterrelevanz/.test(item.rationale);
  return {
    paths: uniqueSnippets,
    note: hasStandardBoundary ? mappingBoundary : roundedText(item.rationale.trim())
  };
}

function MappingTile({ item, open, onToggle }: { item: PublicNormativeMappingItem; open: boolean; onToggle: () => void }) {
  const frameworkClass = item.framework === "SDG_PLUS" ? "plus" : item.framework === "CONSTITUTIONAL_ANCHOR" ? "anchor" : "sdg";
  const pathCount = item.impactPathRefs.length;
  return (
    <article className={`normative-tile normative-tile-${frameworkClass}`}>
      <div className="normative-tile-header">
        <span className="normative-tile-code"><FrameworkIcon framework={item.framework} />{item.code}</span>
        <span className={`normative-direction normative-direction-${item.direction.toLowerCase()}`}>{directionLabel[item.direction]}</span>
      </div>
      <h3>{item.label}</h3>
      {item.constitutionalAnchorType && <p className="normative-anchor-type">{constitutionalAnchorTypeLabel[item.constitutionalAnchorType]}{item.legalReference ? ` · ${item.legalReference}` : ""}</p>}
      <p className="normative-preview">{pathCount === 0 ? "Zuordnung mit offener Wirkpfadreferenz" : `${pathCount} ${pathCount === 1 ? "Wirkpfad berührt" : "Wirkpfade berühren"}`}</p>
      <p className="normative-evidence"><strong>Evidenz:</strong> {humanizeSystemValue(item.evidenceStatus)}</p>
      <button type="button" className="normative-detail-toggle" aria-expanded={open} aria-controls={`normative-panel-${item.id}`} onClick={onToggle}>{open ? "Einordnung schließen" : "Warum berührt?"}</button>
    </article>
  );
}

function MappingDetailPanel({ item }: { item: PublicNormativeMappingItem }) {
  const rationale = rationaleFor(item);
  return (
    <section id={`normative-panel-${item.id}`} className="normative-tile-panel" aria-labelledby={`normative-panel-title-${item.id}`}>
      <div>
        <p className="eyebrow">{item.code} · Einordnung</p>
        <h4 id={`normative-panel-title-${item.id}`}>Warum {item.label} berührt ist</h4>
        {rationale.paths.length > 0 ? <ol className="normative-path-list">{rationale.paths.map((path, index) => <li key={`${item.id}-${path}`}><strong>{item.impactPathRefs[index] ?? `P${index + 1}`}</strong><span>{path}</span></li>)}</ol> : <p className="normative-panel-text">{rationale.note}</p>}
        {rationale.paths.length > 0 && <p className="normative-panel-text">{rationale.note}</p>}
        <a className="normative-reference-link" href={item.referenceHref}>Referenz und Quelle ansehen</a>
      </div>
    </section>
  );
}

function MappingGroup({ title, description, icon, items, activeItemId, onSelect }: { title: string; description: string; icon: ReactNode; items: PublicNormativeMappingItem[]; activeItemId: string | null; onSelect: (id: string) => void }) {
  if (items.length === 0) return null;
  const activeItem = items.find((item) => item.id === activeItemId) ?? null;
  return <div className="normative-tile-group">
    <div className="normative-group-heading">{icon}<h3>{title}</h3><p>{description}</p></div>
    <div className="normative-tile-grid">{items.map((item) => <MappingTile item={item} key={item.id} open={activeItemId === item.id} onToggle={() => onSelect(item.id)} />)}</div>
    {activeItem ? <MappingDetailPanel item={activeItem} /> : null}
  </div>;
}

export function NormativeImpactTiles({ mapping }: { mapping: PublicNormativeMapping }) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const sdgItems = mapping.sdgItems ?? [];
  const sdgPlusItems = mapping.sdgPlusItems ?? [];
  const constitutionalAnchorItems = mapping.constitutionalAnchorItems ?? [];
  const hasSdgs = sdgItems.length > 0;
  const hasSdgPlus = sdgPlusItems.length > 0;
  const hasConstitutionalAnchors = constitutionalAnchorItems.length > 0;
  if (!hasSdgs && !hasSdgPlus && !hasConstitutionalAnchors) return null;
  const status = mapping.status === "PUBLISHED" ? "Fachlich freigegeben" : mapping.status === "PROVISIONAL" ? "Vorläufige Zuordnung" : "Evidenzstand offen";
  const select = (id: string) => setActiveItemId((current) => current === id ? null : id);
  return (
    <section className="normative-impact-tiles" aria-labelledby="normative-impact-tiles-title">
      <header>
        <div>
          <p className="eyebrow">Referenzrahmen</p>
          <h2 id="normative-impact-tiles-title">Woran wird die Wirkung gemessen?</h2>
          <p>Die Kacheln zeigen keine Gesamtpunktzahl. Sie machen sichtbar, wo diese Entscheidung im SDG-/SDG+-Referenzrahmen sowie an Staatszielen, Grundrechten und Schutzaufträgen Wirkungspotenzial, Risiko oder offene Evidenz berührt.</p>
        </div>
        <span className={`mapping-status mapping-status-${mapping.status.toLowerCase()}`}>{status}</span>
      </header>
      <p className="normative-basis"><strong>Prüfbasis:</strong> {mapping.basis}</p>
      <MappingGroup title="SDGs" description="Global vereinbarte Ziele der Agenda 2030" icon={<ReferenceIcon aria-hidden="true" />} items={sdgItems} activeItemId={activeItemId} onSelect={select} />
      <MappingGroup title="SDG+" description="Demokratische, rechtsstaatliche, mediale und digitale Voraussetzungen" icon={<DemocracyIcon aria-hidden="true" />} items={sdgPlusItems} activeItemId={activeItemId} onSelect={select} />
      <MappingGroup title="Staatsziele, Grundrechte &amp; Schutzaufträge" description="Rechts- und Schutzrahmen für den deutschen beziehungsweise europäischen Kontext" icon={<BoundaryIcon aria-hidden="true" />} items={constitutionalAnchorItems} activeItemId={activeItemId} onSelect={select} />
      {hasConstitutionalAnchors && <p className="normative-anchor-note">Ein berührter Anker ist keine Rechtsfeststellung und kein zusätzlicher Wirkungspunkt. Er macht Prüfgrenzen und den rechtlichen Kontext sichtbar.</p>}
    </section>
  );
}

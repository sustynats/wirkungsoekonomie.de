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

function FrameworkIcon({ framework }: { framework: PublicNormativeMappingItem["framework"] }) {
  if (framework === "SDG_PLUS") return <DemocracyIcon aria-hidden="true" />;
  if (framework === "CONSTITUTIONAL_ANCHOR") return <BoundaryIcon aria-hidden="true" />;
  return <ReferenceIcon aria-hidden="true" />;
}

function MappingTile({ item }: { item: PublicNormativeMappingItem }) {
  const frameworkClass = item.framework === "SDG_PLUS" ? "plus" : item.framework === "CONSTITUTIONAL_ANCHOR" ? "anchor" : "sdg";
  return (
    <article className={`normative-tile normative-tile-${frameworkClass}`}>
      <div className="normative-tile-header">
        <span className="normative-tile-code"><FrameworkIcon framework={item.framework} />{item.code}</span>
        <span className={`normative-direction normative-direction-${item.direction.toLowerCase()}`}>{directionLabel[item.direction]}</span>
      </div>
      <h3>{item.label}</h3>
      {item.constitutionalAnchorType && <p className="normative-anchor-type">{constitutionalAnchorTypeLabel[item.constitutionalAnchorType]}{item.legalReference ? ` · ${item.legalReference}` : ""}</p>}
      <p className="normative-evidence"><strong>Evidenz:</strong> {humanizeSystemValue(item.evidenceStatus)}</p>
      <details>
        <summary>Warum berührt?</summary>
        <p>{item.rationale}</p>
        {item.impactPathRefs.length > 0 && <p className="normative-path-ref"><strong>Wirkpfad:</strong> {item.impactPathRefs.join(" · ")}</p>}
        <a className="normative-reference-link" href={item.referenceHref}>Referenz und Quelle ansehen</a>
      </details>
    </article>
  );
}

export function NormativeImpactTiles({ mapping }: { mapping: PublicNormativeMapping }) {
  const sdgItems = mapping.sdgItems ?? [];
  const sdgPlusItems = mapping.sdgPlusItems ?? [];
  const constitutionalAnchorItems = mapping.constitutionalAnchorItems ?? [];
  const hasSdgs = sdgItems.length > 0;
  const hasSdgPlus = sdgPlusItems.length > 0;
  const hasConstitutionalAnchors = constitutionalAnchorItems.length > 0;
  if (!hasSdgs && !hasSdgPlus && !hasConstitutionalAnchors) return null;
  const status = mapping.status === "PUBLISHED" ? "Fachlich freigegeben" : mapping.status === "PROVISIONAL" ? "Vorläufige Zuordnung" : "Evidenzstand offen";
  return (
    <section className="normative-impact-tiles" aria-labelledby="normative-impact-tiles-title">
      <header>
        <div>
          <p className="eyebrow">Referenzrahmen</p>
          <h2 id="normative-impact-tiles-title">Welche Ziele und Schutzgüter sind berührt?</h2>
          <p>Die Kacheln zeigen keine Gesamtpunktzahl. Sie machen sichtbar, wo diese Entscheidung im SDG-/SDG+-Referenzrahmen sowie an Staatszielen, Grundrechten und Schutzaufträgen Wirkungspotenzial, Risiko oder offene Evidenz berührt.</p>
        </div>
        <span className={`mapping-status mapping-status-${mapping.status.toLowerCase()}`}>{status}</span>
      </header>
      <p className="normative-basis"><strong>Prüfbasis:</strong> {mapping.basis}</p>
      {hasSdgs && <div className="normative-tile-group">
        <div className="normative-group-heading"><ReferenceIcon aria-hidden="true" /><h3>SDGs</h3><p>Global vereinbarte Ziele der Agenda 2030</p></div>
        <div className="normative-tile-grid">{sdgItems.map((item) => <MappingTile item={item} key={item.id} />)}</div>
      </div>}
      {hasSdgPlus && <div className="normative-tile-group">
        <div className="normative-group-heading"><DemocracyIcon aria-hidden="true" /><h3>SDG+</h3><p>Demokratische, rechtsstaatliche, mediale und digitale Voraussetzungen</p></div>
        <div className="normative-tile-grid">{sdgPlusItems.map((item) => <MappingTile item={item} key={item.id} />)}</div>
      </div>}
      {hasConstitutionalAnchors && <div className="normative-tile-group">
        <div className="normative-group-heading"><BoundaryIcon aria-hidden="true" /><h3>Staatsziele, Grundrechte &amp; Schutzaufträge</h3><p>Rechts- und Schutzrahmen für den deutschen beziehungsweise europäischen Kontext</p></div>
        <div className="normative-tile-grid">{constitutionalAnchorItems.map((item) => <MappingTile item={item} key={item.id} />)}</div>
        <p className="normative-anchor-note">Ein berührter Anker ist keine Rechtsfeststellung und kein zusätzlicher Wirkungspunkt. Er macht Prüfgrenzen und den rechtlichen Kontext sichtbar.</p>
      </div>}
    </section>
  );
}

"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { DecisionFragmentAccess } from "@/app/components/DecisionReader";
import { SamePageStateLink } from "@/app/components/SamePageNavigation";
import { decisionViews, resolveDecisionView, type DecisionView } from "@/lib/presentation/decision-depth";

function useDecisionView() {
  return resolveDecisionView(useSearchParams().get("ansicht") ?? undefined);
}

export function DecisionViewTabs({ slug }: { slug: string }) {
  const activeView = useDecisionView();

  return <>
    <DecisionFragmentAccess viewKey={activeView} />
    <nav className="decision-view-nav" aria-label="Ansichten dieser Wirkungsakte">
      <p><strong>Wirkungsakte</strong><span>60 Sekunden zuerst, Details gezielt öffnen.</span></p>
      <div>{decisionViews.map((view) => <SamePageStateLink key={view.id} href={view.id === "sachverhalt" ? `/entscheidungen/${slug}` : `/entscheidungen/${slug}?ansicht=${view.id}`} aria-current={activeView === view.id ? "page" : undefined}>{view.label}</SamePageStateLink>)}</div>
    </nav>
  </>;
}

export function DecisionViewPanel({ id, label, children }: { id: DecisionView; label: string; children: ReactNode }) {
  const activeView = useDecisionView();
  return <section data-decision-panel={id} hidden={activeView !== id} aria-label={label}>{children}</section>;
}

export function DecisionTransparency({ children }: { children: ReactNode }) {
  const activeView = useDecisionView();
  return <details id="decision-transparency" className="decision-transparency" open={activeView === "evidenz"}>
    <summary>Rechenweg, Annahmen und Versionsstand öffnen</summary>
    {children}
  </details>;
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { SamePageStateLink } from "@/app/components/SamePageNavigation";
import { registerViews } from "@/lib/navigation";

export type RegisterContextView = {
  key: string;
  content: ReactNode;
};

export function RegisterContextFrame({ selected, views, query = {} }: {
  selected: string;
  views: RegisterContextView[];
  query?: Record<string, string>;
}) {
  return <>
    <div className="shell"><p className="eyebrow">Wirkungsakten</p><p>Die vollständigen Erläuterungen und Kurzfassungen der bisherigen Listen bleiben hier zugänglich. Das gemeinsame Register bietet den kompakten Einstieg.</p><p><Link href="/wirkungsakten">Zum gemeinsamen Wirkungsakten-Register</Link></p><nav className="portal-register-views" aria-label="Bestandsansichten">{registerViews.map((view) => <SamePageStateLink key={view.key} href={{ pathname: "/wirkungsakten/bestand", query: { ...query, bestand: view.key } }} aria-current={selected === view.key ? "page" : undefined}>{view.label}</SamePageStateLink>)}</nav></div>
    {views.find((view) => view.key === selected)?.content ?? views[0]?.content}
  </>;
}

export function RegisterContextClient({ views }: { views: RegisterContextView[] }) {
  const searchParams = useSearchParams();
  const selected = registerViews.find((view) => view.key === searchParams.get("bestand"))?.key ?? "wirkungsfaelle";
  const query = Object.fromEntries(searchParams.entries());
  return <RegisterContextFrame selected={selected} views={views} query={query} />;
}

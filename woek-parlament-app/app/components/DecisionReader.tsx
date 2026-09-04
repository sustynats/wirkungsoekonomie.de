"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const storageKey = "woek.decision-reader.v1";
type Mode = "verstaendlich" | "fachlich";

/** Only the presentation preference is stored, never case/Fach or user data. */
export function DecisionReader({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("verstaendlich");
  useEffect(() => {
    const sync = () => {
      try { setMode(localStorage.getItem(storageKey) === "fachlich" ? "fachlich" : "verstaendlich"); } catch { /* Storage is optional. */ }
    };
    sync();
    const onStorage = (event: StorageEvent) => { if (event.key === storageKey) sync(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function choose(next: Mode) {
    setMode(next);
    try { localStorage.setItem(storageKey, next); } catch { /* The switch still works without storage. */ }
  }
  return <div className="decision-reader" data-reader-mode={mode}>
    <div className="decision-reader-controls" role="group" aria-label="Lesemodus">
      <span>Lesemodus</span>
      <button type="button" aria-pressed={mode === "verstaendlich"} onClick={() => choose("verstaendlich")}>Verständlich</button>
      <button type="button" aria-pressed={mode === "fachlich"} onClick={() => choose("fachlich")}>Fachlich</button>
    </div>
    {children}
  </div>;
}

/** Keep historical fragments reachable even inside the new disclosure depth.
 * Ordinary tab changes do not scroll or move keyboard focus. */
export function DecisionFragmentAccess({ viewKey }: { viewKey: string }) {
  const router = useRouter();
  useEffect(() => {
    const reveal = () => {
      if (!window.location.hash) return;
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target?.closest(".decision-page")) return;
      const panel = target.closest<HTMLElement>("[data-decision-panel]");
      if (panel?.hidden && panel.dataset.decisionPanel) {
        const url = new URL(window.location.href);
        url.searchParams.set("ansicht", panel.dataset.decisionPanel);
        router.replace(url.pathname + url.search + url.hash, { scroll: false });
        return;
      }
      for (let parent: HTMLElement | null = target; parent; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement) parent.open = true;
      }
      target.scrollIntoView({ block: "start", behavior: "instant" });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [viewKey, router]);
  return null;
}

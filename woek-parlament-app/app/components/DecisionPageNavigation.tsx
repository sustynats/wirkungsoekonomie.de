"use client";

import { useEffect, useState } from "react";

export type DecisionNavigationItem = { id: string; label: string; count?: number };

export function DecisionPageNavigation({ items }: { items: DecisionNavigationItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 100);
      const visible = items.map((item) => document.getElementById(item.id)).filter((value): value is HTMLElement => Boolean(value));
      const current = [...visible].reverse().find((element) => element.getBoundingClientRect().top <= 150) ?? visible[0];
      if (current) setActive(current.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [items]);

  return <aside className="decision-page-navigation" aria-label="Inhalt dieser Wirkungsakte">
    <progress className="reading-progress" aria-label="Lesefortschritt" value={progress} max="100">{Math.round(progress)} Prozent</progress>
    <p className="eyebrow">In dieser Akte</p>
    <nav><ol>{items.map((item) => <li key={item.id}><a className={active === item.id ? "is-active" : undefined} href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined}><span>{item.label}</span>{typeof item.count === "number" && <small>{item.count}</small>}</a></li>)}</ol></nav>
    <a className="decision-back-to-top" href="#case-top">↑ Nach oben</a>
  </aside>;
}

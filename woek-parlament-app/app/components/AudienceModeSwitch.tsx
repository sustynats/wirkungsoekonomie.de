"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function AudienceModeSwitch() {
  const searchParams = useSearchParams();
  const parliamentMode = searchParams.get("modus") === "parlament";
  return (
    <nav className="mode-switch" aria-label="Darstellungsmodus">
      <Link className={!parliamentMode ? "is-active" : undefined} aria-current={!parliamentMode ? "page" : undefined} href="/">Für alle</Link>
      <Link className={parliamentMode ? "is-active" : undefined} aria-current={parliamentMode ? "page" : undefined} href="/?modus=parlament">Für Parlament</Link>
    </nav>
  );
}

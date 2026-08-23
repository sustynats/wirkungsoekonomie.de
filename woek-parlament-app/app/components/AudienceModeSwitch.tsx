"use client";

import { useSearchParams } from "next/navigation";
import { SamePageStateLink } from "@/app/components/SamePageNavigation";

export function AudienceModeSwitch() {
  const searchParams = useSearchParams();
  const parliamentMode = searchParams.get("modus") === "parlament";
  return (
    <nav className="mode-switch" aria-label="Darstellungsmodus">
      <SamePageStateLink className={!parliamentMode ? "is-active" : undefined} aria-current={!parliamentMode ? "page" : undefined} href="/">Für alle</SamePageStateLink>
      <SamePageStateLink className={parliamentMode ? "is-active" : undefined} aria-current={parliamentMode ? "page" : undefined} href="/?modus=parlament">Für Parlament</SamePageStateLink>
    </nav>
  );
}

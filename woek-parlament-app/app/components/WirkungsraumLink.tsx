"use client";

import { type ReactNode } from "react";
import { wirkungsraumHandoffUrl } from "@/lib/wirkungsraum-client";

export function WirkungsraumLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <a
      className={className}
      href="https://wirkungsoekonomie.de/mein-wirkungsraum/#returnTo=https%3A%2F%2Fparlament.wirkungsoekonomie.de%2F"
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(wirkungsraumHandoffUrl(window.location.href));
      }}
    >
      {children}
    </a>
  );
}

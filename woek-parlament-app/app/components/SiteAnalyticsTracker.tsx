"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const endpoint = "https://akademie.wirkungsoekonomie.de/api/site-event";

function sessionIdentifier() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function deviceType() {
  const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  return coarsePointer && width < 720 ? "mobile" : coarsePointer ? "tablet" : "desktop";
}

function referrerDomain() {
  if (!document.referrer) return null;
  try {
    return new URL(document.referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function send(eventType: "page_view" | "heartbeat", pathname: string, sessionId: string) {
  if (navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1") return;
  const payload = JSON.stringify({
    eventType,
    // Search parameters, full referrer URLs, persistent visitor IDs and browser
    // fingerprints are deliberately excluded from public-site reach measurement.
    path: pathname,
    referrerDomain: referrerDomain(),
    sessionId,
    device: { deviceType: deviceType() }
  });
  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
    referrerPolicy: "no-referrer"
  }).catch(() => undefined);
}

export function SiteAnalyticsTracker() {
  const pathname = usePathname();
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    sessionId.current ??= sessionIdentifier();
    send("page_view", pathname, sessionId.current);
    const heartbeat = window.setInterval(() => send("heartbeat", pathname, sessionId.current as string), 60_000);
    return () => window.clearInterval(heartbeat);
  }, [pathname]);

  return null;
}

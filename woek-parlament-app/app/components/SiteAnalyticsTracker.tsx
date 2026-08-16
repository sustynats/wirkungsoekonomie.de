"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const endpoint = "/api/site-analytics";
const sessionKey = "woek-parliament-site-session";
const visitorKey = "woek-parliament-site-visitor";

function identifier(key: string, storage: Storage) {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const value = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    storage.setItem(key, value);
    return value;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function device() {
  const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  return {
    deviceType: coarsePointer && width < 720 ? "mobile" : coarsePointer ? "tablet" : "desktop",
    viewportWidth: width || null,
    viewportHeight: Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0) || null,
    screenWidth: window.screen?.width || null,
    screenHeight: window.screen?.height || null,
    language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
  };
}

function send(eventType: "page_view" | "heartbeat", pathname: string) {
  if (navigator.doNotTrack === "1" || (window as Window & { doNotTrack?: string }).doNotTrack === "1") return;
  const payload = JSON.stringify({
    eventType,
    path: `${pathname}${window.location.search}`,
    title: document.title,
    referrer: document.referrer,
    sessionId: identifier(sessionKey, sessionStorage),
    visitorId: identifier(visitorKey, localStorage),
    site: "parlament",
    hostname: window.location.hostname,
    device: device()
  });
  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => undefined);
}

export function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    send("page_view", pathname);
    const heartbeat = window.setInterval(() => send("heartbeat", pathname), 60_000);
    return () => window.clearInterval(heartbeat);
  }, [pathname]);

  return null;
}

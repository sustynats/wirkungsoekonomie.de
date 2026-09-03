import { supabaseRest } from "@/lib/database/supabase-admin";

const approvedCandidateHosts = new Set([
  "www.auswaertiges-amt.de",
  "www.bfdi.bund.de",
  "www.bmel.de",
  "www.bundesfinanzministerium.de",
  "www.bundesgesundheitsministerium.de",
  "www.bundesnetzagentur.de",
  "www.bundesregierung.de",
  "www.bundestag.de",
  "www.dbinfrago.com",
  "www.destatis.de",
  "www.ifo.de",
  "dserver.bundestag.de"
]);

type CandidateRow = {
  id: string;
  canonical_url: string;
};

function approvedCandidateUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || !approvedCandidateHosts.has(url.hostname.toLowerCase())) {
    throw new Error("Candidate availability check is limited to an approved primary-source host.");
  }
  return url;
}

/**
 * Availability is a narrow technical check, never a source verification. It
 * performs a HEAD request with redirects disabled, downloads no document body
 * and only operates on an explicitly reviewed host allow-list.
 */
export async function checkCandidateAvailability(maximumCandidates = 30) {
  if (!Number.isInteger(maximumCandidates) || maximumCandidates < 1 || maximumCandidates > 100) {
    throw new Error("maximumCandidates must be an integer between 1 and 100.");
  }
  const candidates = await supabaseRest<CandidateRow[]>(`parliament.evidence_candidates?verification_status=eq.CANDIDATE_ONLY&select=id,canonical_url&order=created_at.asc&limit=${maximumCandidates}`);
  const results = [];
  for (const candidate of candidates) {
    let httpStatus: number | null = null;
    let nextStatus = "CANDIDATE_ONLY";
    let note: string | null = null;
    try {
      const url = approvedCandidateUrl(candidate.canonical_url);
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
        headers: { "User-Agent": "Wirkungsportal-Source-Availability/1.0" }
      });
      httpStatus = response.status;
      if (response.status >= 200 && response.status < 400) nextStatus = "ACCESSIBLE_UNVERIFIED";
      else note = `Erreichbarkeitsprüfung: HTTP ${response.status}.`;
    } catch {
      note = "Erreichbarkeitsprüfung konnte nicht abgeschlossen werden.";
    }
    await supabaseRest(`parliament.evidence_candidates?id=eq.${encodeURIComponent(candidate.id)}&verification_status=eq.CANDIDATE_ONLY`, {
      method: "PATCH",
      body: JSON.stringify({
        verification_status: nextStatus,
        availability_checked_at: new Date().toISOString(),
        availability_http_status: httpStatus,
        verification_note: note
      })
    });
    results.push({ id: candidate.id, status: nextStatus, httpStatus });
  }
  return {
    checked: results.length,
    accessibleUnverified: results.filter((result) => result.status === "ACCESSIBLE_UNVERIFIED").length,
    stillCandidateOnly: results.filter((result) => result.status === "CANDIDATE_ONLY").length
  };
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/app/components/ProgrammeAnalysisBlueprint.module.css";

type Entry = {
  key: string;
  index: number;
  title: string;
  policyDomain: string;
  sourceExcerpt: string;
  sourceTruncated: boolean;
  sourceLocation: string;
  direction: "POSITIVE" | "NEGATIVE" | "AMBIVALENT" | "OPEN";
  evidence: "HIGH" | "MEDIUM" | "LOW" | "NOT_ASSESSABLE";
  keyFinding: string;
  impactCoreSummary: string;
  readinessLabel: string;
  reviewed: boolean;
};

type Payload = {
  sourceKey: string;
  archiveHref: string;
  total: number;
  entries: Entry[];
};

const pageSize = 30;

const directionLabels: Record<Entry["direction"], string> = {
  POSITIVE: "Positives Wirkungspotenzial",
  NEGATIVE: "Negatives Wirkungspotenzial",
  AMBIVALENT: "Ambivalentes Wirkungspotenzial",
  OPEN: "Wirkungsrichtung offen",
};

const evidenceLabels: Record<Entry["evidence"], string> = {
  HIGH: "hohe Evidenz",
  MEDIUM: "mittlere Evidenz",
  LOW: "geringe Evidenz",
  NOT_ASSESSABLE: "für die Richtungsbewertung nicht belastbar",
};

export function ProgrammeCommitmentDirectory({ sourceKey, expectedTotal, archiveHref }: {
  sourceKey: string;
  expectedTotal: number;
  archiveHref: string;
}) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [direction, setDirection] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(`/ebenen/laender/sachsen-anhalt/wahlprogramme/${encodeURIComponent(sourceKey)}/index.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Index nicht verfügbar");
        return response.json() as Promise<Payload>;
      })
      .then(setPayload)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(true);
      });
    return () => controller.abort();
  }, [sourceKey]);

  const domains = useMemo(() => [...new Set(payload?.entries.map((entry) => entry.policyDomain) ?? [])].sort((a, b) => a.localeCompare(b, "de")), [payload]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de");
    return (payload?.entries ?? []).filter((entry) => {
      if (domain && entry.policyDomain !== domain) return false;
      if (direction && entry.direction !== direction) return false;
      if (!needle) return true;
      return [entry.title, entry.sourceExcerpt, entry.keyFinding, entry.impactCoreSummary, entry.policyDomain]
        .some((value) => value.toLocaleLowerCase("de").includes(needle));
    });
  }, [direction, domain, payload, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function resetPage() { setPage(1); }

  if (error) return <div className={styles.auditNotice} role="status"><strong>Der kompakte Suchindex ist vorübergehend nicht verfügbar.</strong><p>Der vollständige, unveränderte Fachbestand bleibt im <Link href={archiveHref}>Publikationsarchiv</Link> zugänglich.</p></div>;
  if (!payload) return <p role="status">Der statische Zusagenindex wird geladen …</p>;

  return <div className={styles.directory} data-woek-programme-directory={sourceKey}>
    <div className={styles.directoryFilters}>
      <label>Suche<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="Begriff, Zusage oder Wirkungskern" /></label>
      <label>Themenfeld<select value={domain} onChange={(event) => { setDomain(event.target.value); resetPage(); }}><option value="">Alle Themenfelder</option>{domains.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
      <label>Wirkungsrichtung<select value={direction} onChange={(event) => { setDirection(event.target.value); resetPage(); }}><option value="">Alle Richtungen</option>{Object.entries(directionLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
    </div>
    <p><strong>{filtered.length.toLocaleString("de-DE")}</strong> von {payload.total.toLocaleString("de-DE")} Einträgen · der Browser lädt nur diesen kompakten Index, nicht die vollständigen Fachakten.</p>
    <div className={styles.commitmentList}>{visible.map((entry) => <details className={styles.commitment} key={entry.key}>
      <summary><span className={styles.commitmentSummary}><span className={styles.index}>{entry.index}</span><span><span className={styles.commitmentTitle}>{entry.title}</span><span className={styles.badgeRow}><span className={styles.badge} data-direction={entry.direction}>{directionLabels[entry.direction]}</span><span className={styles.metaChip}>{evidenceLabels[entry.evidence]}</span>{entry.reviewed ? <span className={styles.metaChip}>objektspezifisch geprüft</span> : <span className={styles.qualityChip}>Nachprüfung offen</span>}</span><span className={styles.summaryTeaser}>{entry.impactCoreSummary}</span></span></span></summary>
      <div className={styles.commitmentBody}>
        <p><strong>Key Finding:</strong> {entry.keyFinding}</p>
        <p><strong>Entscheidungsreife:</strong> {entry.readinessLabel}</p>
        <blockquote className={styles.quote}><strong>Originalaussage{entry.sourceTruncated ? " (Auszug)" : ""}:</strong> {entry.sourceExcerpt}</blockquote>
        {entry.sourceLocation && <p><strong>Fundstelle:</strong> {entry.sourceLocation}</p>}
        <p><Link href={payload.archiveHref}>Vollständigen unveränderten Fachbestand öffnen →</Link></p>
      </div>
    </details>)}</div>
    <nav className={styles.directoryPagination} aria-label="Seiten des Zusagenindex">
      <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Zurück</button>
      <span>Seite {currentPage} von {pages}</span>
      <button type="button" disabled={currentPage === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>Weiter →</button>
    </nav>
    {expectedTotal !== payload.total && <p className={styles.auditNotice} role="status">Der angezeigte Index stimmt nicht mit dem veröffentlichten Zählstand überein. Bitte nutze bis zur Klärung das Publikationsarchiv.</p>}
  </div>;
}

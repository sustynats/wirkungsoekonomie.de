import { regionalCoverage } from "./regional-coverage.mjs";

const round = (value, digits = 3) => Number(Number(value || 0).toFixed(digits));

export const SOURCE_PORTFOLIO_AUDIT_DATE = "2026-09-05";

// Coverage is a maintained editorial map, not a model-generated score. Source
// IDs remain machine-checkable and missing/disabled entries cannot count.
export const COVERAGE_REQUIREMENTS = Object.freeze([
  ["Bundespolitik", "good", ["bundesregierung-kompakt", "bundesregierung-presse", "bundestag-hib", "zdfheute-nachrichten", "dlf-nachrichten"]],
  ["Länder", "partial", ["ndr-info", "wdr-nachrichten", "mdr-nachrichten", "swr-aktuell", "rbb24-nachrichten", "hr-hessenschau"]],
  ["Kommunen", "partial", ["ndr-info", "wdr-nachrichten", "mdr-nachrichten", "swr-aktuell", "rbb24-nachrichten", "hr-hessenschau"]],
  ["EU", "good", ["eu-kommission-presse", "ezb-presse", "euronews-en", "dw-news"]],
  ["internationale Politik", "good", ["dw-news", "france24-en", "euronews-en", "dlf-nachrichten"]],
  ["Konjunktur", "good", ["destatis-aktuell", "bundesbank-allgemein", "ezb-presse", "dlf-wirtschaft", "wiwo-schlagzeilen"]],
  ["Unternehmen", "good", ["wiwo-schlagzeilen", "manager-magazin-news", "dlf-wirtschaft"]],
  ["Arbeit", "partial", ["destatis-aktuell", "dlf-wirtschaft", "dlf-gesellschaft"]],
  ["Finanzen", "good", ["bundesbank-allgemein", "ezb-presse", "dlf-wirtschaft", "wiwo-schlagzeilen"]],
  ["Märkte", "good", ["bundesbank-allgemein", "ezb-presse", "wiwo-schlagzeilen", "manager-magazin-news"]],
  ["Energie", "good", ["bundesnetzagentur-presse", "bundestag-wirtschaft", "klimareporter-news", "dlf-wirtschaft"]],
  ["Infrastruktur", "good", ["bundesnetzagentur-presse", "zdfheute-nachrichten", "dlf-nachrichten", "mdr-nachrichten"]],
  ["kritische Infrastruktur", "good", ["bundesnetzagentur-presse", "heise-security", "zdfheute-nachrichten", "dlf-nachrichten"]],
  ["Klima", "good", ["umweltbundesamt-presse", "ipcc-news", "klimareporter-news", "europepmc-impact-research"]],
  ["Biodiversität", "critical_gap", ["umweltbundesamt-presse", "europepmc-impact-research"]],
  ["Ressourcen", "partial", ["umweltbundesamt-presse", "eu-kommission-presse", "europepmc-impact-research"]],
  ["Umwelt", "good", ["umweltbundesamt-presse", "klimareporter-news", "europepmc-impact-research", "greenpeace-presse"]],
  ["Wohnen", "partial", ["rbb24-nachrichten", "wdr-nachrichten", "dlf-gesellschaft", "tagesspiegel-home"]],
  ["Gesundheit", "good", ["who-news", "smc-research", "europepmc-impact-research", "dlf-wissen"]],
  ["Pflege", "partial", ["dlf-gesellschaft", "zdfheute-nachrichten", "wdr-nachrichten"]],
  ["Bildung", "partial", ["dlf-gesellschaft", "zdfheute-nachrichten", "mdr-nachrichten"]],
  ["soziale Sicherung", "partial", ["dlf-gesellschaft", "destatis-aktuell", "zdfheute-nachrichten"]],
  ["Armut", "partial", ["destatis-aktuell", "dlf-gesellschaft", "taz-aktuell"]],
  ["Verteilung", "partial", ["destatis-aktuell", "dlf-wirtschaft", "dlf-gesellschaft", "taz-aktuell"]],
  ["Teilhabe", "partial", ["dlf-gesellschaft", "taz-aktuell", "zdfheute-nachrichten"]],
  ["gesellschaftlicher Zusammenhalt", "good", ["dlf-gesellschaft", "zdfheute-nachrichten", "spiegel-schlagzeilen", "stern-schlagzeilen"]],
  ["Justiz", "good", ["lto-news", "bundesverwaltungsgericht-presse", "jurafuchs-presse"]],
  ["Rechtsstaat", "good", ["lto-news", "bundesverwaltungsgericht-presse", "bundestag-hib", "dlf-nachrichten"]],
  ["Demokratie", "good", ["bundestag-hib", "dlf-nachrichten", "zdfheute-nachrichten", "spiegel-schlagzeilen"]],
  ["Medien", "partial", ["dlf-gesellschaft", "spiegel-schlagzeilen", "taz-aktuell"]],
  ["Digitalisierung", "good", ["heise-netzpolitik", "heise-wirtschaft", "dlf-wissen", "eu-kommission-presse"]],
  ["KI", "good", ["heise-netzpolitik", "heise-wirtschaft", "dlf-wissen", "smc-research"]],
  ["Cybersecurity", "good", ["heise-security", "heise-netzpolitik", "dlf-nachrichten"]],
  ["Datenschutz", "good", ["heise-netzpolitik", "heise-security", "dlf-gesellschaft"]],
  ["Plattformen", "good", ["heise-netzpolitik", "eu-kommission-presse", "dlf-wissen"]],
  ["Wissenschaft", "good", ["europepmc-impact-research", "smc-research", "dlf-wissen"]],
  ["Forschung", "good", ["europepmc-impact-research", "smc-research", "dlf-wissen"]],
  ["neue Studien", "good", ["europepmc-impact-research", "smc-research"]],
  ["Technologie", "good", ["heise-wirtschaft", "heise-netzpolitik", "heise-security", "dlf-wissen"]],
  ["geopolitische Entwicklungen mit Wirkung auf Deutschland/EU", "good", ["dw-news", "france24-en", "euronews-en", "dlf-nachrichten"]],
]);

export const PORTFOLIO_DECISIONS = Object.freeze([
  { source: "Bayerische Staatsregierung", source_id: "bayern-landesregierung-presse", old_role: "E", new_role: "A", topics: ["Bayern", "Landespolitik"], reason: "Amtliche Grundabdeckung im stündlichen Probebetrieb; Auswertung von Pressemitteilungen ausdrücklich gestattet. Kein Ersatz für unabhängigen Journalismus.", official_endpoint: "https://www.bayern.de/rss/pm_alle.php", terms_url: "https://www.bayern.de/impressum/", robots_url: "https://www.bayern.de/robots.txt", rsl_url: null, access: "verified_press_metadata_only", unique_value: "high_regional", duplication_risk: "medium", noise_risk: "high", prefilter: "regional_materiality", confidence: "high" },
  { source: "Bremen – Pressestelle des Senats", source_id: "bremen-senat-presse", old_role: "E", new_role: "A", topics: ["Bremen", "Landespolitik"], reason: "Amtliche Grundabdeckung über erlaubte aktuelle Presseübersicht, stündlicher Probebetrieb. Keine erfundene RSS-Adresse; kein Archivcrawl.", official_endpoint: "https://www.senatspressestelle.bremen.de/pressemitteilungen-1464", terms_url: "https://www.senatspressestelle.bremen.de/impressum-1478", robots_url: "https://www.senatspressestelle.bremen.de/robots.txt", rsl_url: null, access: "verified_press_metadata_only", unique_value: "high_regional", duplication_risk: "low", noise_risk: "high", prefilter: "regional_materiality", confidence: "high" },
  { source: "heise online – Wirtschaft", source_id: "heise-wirtschaft", old_role: "E", new_role: "A", topics: ["Wirtschaft", "Digitalisierung", "Technologie"], reason: "Schließt Digitalwirtschafts- und Halbleiterlücken; enger lokaler Filter; Probebetrieb.", official_endpoint: "https://www.heise.de/rss/heise-Rubrik-Wirtschaft-atom.xml", terms_url: "https://www.heise.de/news-extern/news.html", robots_url: "https://www.heise.de/robots.txt", rsl_url: "https://www.heise.de/rsl.xml", access: "verified_metadata_only", unique_value: "high", duplication_risk: "medium", noise_risk: "high", prefilter: "systemic_technology", confidence: "high" },
  { source: "heise online – Netzpolitik", source_id: "heise-netzpolitik", old_role: "E", new_role: "A", topics: ["Netzpolitik", "Datenschutz", "Plattformen", "KI"], reason: "Schließt eine materielle Governance- und Grundrechtslücke; Probebetrieb.", official_endpoint: "https://www.heise.de/rss/heise-Rubrik-Netzpolitik-atom.xml", terms_url: "https://www.heise.de/news-extern/news.html", robots_url: "https://www.heise.de/robots.txt", rsl_url: "https://www.heise.de/rsl.xml", access: "verified_metadata_only", unique_value: "very_high", duplication_risk: "low", noise_risk: "low", prefilter: "systemic_technology", confidence: "high" },
  { source: "heise Security", source_id: "heise-security", old_role: "E", new_role: "A", topics: ["Cybersecurity", "kritische Infrastruktur", "Datenschutz"], reason: "Schließt die akute Cyber-Blindstelle; Patch-, Produkt- und Routinewarnungen werden lokal verworfen; Probebetrieb.", official_endpoint: "https://www.heise.de/security/feed.xml", terms_url: "https://www.heise.de/news-extern/news.html", robots_url: "https://www.heise.de/robots.txt", rsl_url: "https://www.heise.de/rsl.xml", access: "verified_metadata_only", unique_value: "very_high", duplication_risk: "low", noise_risk: "high", prefilter: "systemic_technology", confidence: "high" },
  { source: "Telepolis", source_id: "telepolis-aktuell", old_role: "A", new_role: "C", topics: ["Gesellschaft", "Geopolitik", "Technologie"], reason: "Hoher Analyse-/Meinungsanteil und bislang kein belegter einzigartiger Nachrichtengewinn; nur fallbezogene Kontext- oder Gegenquelle.", official_endpoint: "https://www.telepolis.de/feed.xml", terms_url: "https://www.heise.de/news-extern/news.html", robots_url: "https://www.telepolis.de/robots.txt", rsl_url: "https://www.telepolis.de/rsl.xml", access: "verified_case_only", unique_value: "open", duplication_risk: "medium", noise_risk: "high", prefilter: "analysis_discovery", confidence: "medium" },
  { source: "tagesschau.de", source_id: "tagesschau-access", old_role: "E", new_role: "E", topics: ["Politik", "Wirtschaft", "Wissen"], reason: "Offizieller Feed vorhanden, aber Nutzung laut Anbieter nur privat und nichtkommerziell; das öffentliche Projekt ist nicht privat.", official_endpoint: "https://www.tagesschau.de/index~rss2.xml", terms_url: "https://www.tagesschau.de/infoservices/rssfeeds", robots_url: "https://www.tagesschau.de/robots.txt", rsl_url: "https://www.tagesschau.de/rsl.xml", access: "legal_restriction", unique_value: "high", duplication_risk: "high", noise_risk: "medium", prefilter: "not_active", confidence: "high" },
  { source: "BR24", source_id: "br24-access", old_role: "E", new_role: "E", topics: ["Bayern", "Landespolitik"], reason: "Feed verifiziert; RSS-Bedingungen beschränken Archivierung und Weitergabe an Dritte. Robots-RAG-Ausnahme ersetzt keine Freigabe der getrennten RSS-Bedingungen. Pipeline-Einsatz vor Aktivierung klären.", official_endpoint: "https://nachrichtenfeeds.br.de/rss/nachrichten/seiten/QXAPkQJ", terms_url: "https://www.br.de/service/nutzungsbedingungen-rss-feeds-100.html", robots_url: "https://www.br.de/robots.txt", rsl_url: null, access: "technical_verified_legal_open", unique_value: "high_regional", duplication_risk: "medium", noise_risk: "high", prefilter: "regional_materiality", confidence: "high" },
  { source: "EEA", source_id: "eea-access", old_role: "E", new_role: "D", topics: ["Biodiversität", "Umwelt", "Ressourcen"], reason: "Geeignete CC-BY-Primärquelle zur kritischen Biodiversitätslücke; der offizielle RSS-Pfad ist laut aktueller robots.txt gesperrt und bleibt deshalb aus dem Collector.", official_endpoint: "https://www.eea.europa.eu/en/newsroom/rss-feeds/publications-rss/rss.xml", terms_url: "https://www.eea.europa.eu/en/legal-notice", robots_url: "https://www.eea.europa.eu/robots.txt", rsl_url: "https://www.eea.europa.eu/rsl.xml", access: "robots_disallowed_case_primary", unique_value: "very_high", duplication_risk: "low", noise_risk: "low", prefilter: "official_environment", confidence: "high" },
  { source: "BSI", source_id: "bsi-access", old_role: "E", new_role: "D", topics: ["Cybersecurity", "kritische IT"], reason: "Amtliche Primärquelle für eigene Warnungen und Lagebilder; fallbezogen, bis ein offizieller automatisierbarer Nachrichtenendpunkt verifiziert ist.", official_endpoint: null, terms_url: "https://www.bsi.bund.de/DE/Service-Navi/Presse/presse.html", robots_url: null, rsl_url: null, access: "case_primary_pending_endpoint", unique_value: "very_high", duplication_risk: "low", noise_risk: "medium", prefilter: "official_cyber", confidence: "medium" },
]);

export const DO_NOT_ACTIVATE = Object.freeze([
  ["BR24", "E", "Archivierung und Weitergabe nach RSS-Bedingungen nicht freigegeben; konkrete Nutzung mit Anbieter klären.", "Bayerische Staatsregierung als amtliche Grundabdeckung, überregionale Medien ergänzend."],
  ["Saarland – Landesregierung", "D", "RSS-Übersicht und direkter Zugang bei Prüfung gesperrt; kein verifizierter automatisierter Feed.", "Überregionale Quellen ergänzend; eigene regionale Abdeckung bleibt offen."],
  ["Apollo News", "F", "Ausdrücklicher redaktioneller Ausschluss.", "Andere Primär- und journalistische Quellen."],
  ["NIUS", "F", "Ausdrücklicher redaktioneller Ausschluss.", "Andere Primär- und journalistische Quellen."],
  ["BILD", "C", "RSL untersagt AI-Input; höchstens externer Hinweis mit unabhängiger Bestätigung.", "Primärquelle und unabhängige freie Berichte."],
  ["WELT", "C", "Paywall-/Nutzungsrahmen nicht ausreichend für dauerhaftes Polling.", "ÖR, DLF, SPIEGEL, Primärquellen."],
  ["tagesschau.de", "E", "Feed laut Anbieter nur für privaten, nichtkommerziellen Gebrauch.", "ZDFheute, DLF und regionale ÖR-Feeds."],
  ["DIE ZEIT / ZEIT ONLINE", "C", "Paywall und Automationsbedingungen offen.", "SPIEGEL, DLF, Tagesspiegel und Primärquellen."],
  ["Süddeutsche Zeitung", "C", "Geschäftliche RSS-Nutzung verlangt gesonderte Klärung.", "ÖR, SPIEGEL, regionale Quellen."],
  ["Reuters", "C", "Kein kostenloser Direktfeed; nur erkannte Agenturprovenienz.", "Freie Medien und Primärquellen."],
  ["dpa", "C", "Kein kostenloser Direktfeed; nur erkannte Agenturprovenienz.", "Freie Medien und Primärquellen."],
  ["AFP", "C", "Kein kostenloser Direktfeed; nur erkannte Agenturprovenienz.", "Freie Medien und Primärquellen."],
  ["AP", "C", "Kein kostenloser Direktfeed; nur erkannte Agenturprovenienz.", "Freie Medien und Primärquellen."],
  ["Telepolis", "C", "Noch kein belastbarer einzigartiger Nachrichtengewinn gegenüber Rauschen.", "Heise-Fachfeeds, DLF und fallbezogene Nutzung."],
  ["Handelsblatt", "C", "Wirtschaftsraum bereits breit abgedeckt; Paywall und Bedingungen offen.", "WiWo, manager magazin, DLF Wirtschaft, Destatis, Bundesbank, EZB."],
  ["FAZ", "C", "Hoher Überschneidungsgrad; Automationsbedingungen offen.", "SPIEGEL, DLF, ÖR und Primärquellen."],
  ["Focus", "E", "Erwartetes Lifestyle-, Ratgeber- und Agenturrauschen überwiegt den Zusatznutzen.", "Bestehendes überregionales Portfolio."],
  ["Capital", "E", "Unternehmens- und Anlageraum bereits abgedeckt; Zusatznutzen nicht belegt.", "WiWo, manager magazin, DLF Wirtschaft."],
  ["Börsen-Zeitung", "C", "Spezialnutzen fallbezogen; kein Bedarf für Dauerpolling.", "Bundesbank, EZB, Destatis und Wirtschaftspresse."],
  ["Science", "C", "Kein allgemeiner Paper-Feed; nur konkrete Studie/Metadaten nach Fachfilter.", "Europe PMC, SMC und Originalstudie."],
  ["Nature", "C", "Nur fallbezogene Originalstudien oder News; kein Volltextimport.", "Europe PMC, SMC und Originalstudie."],
  ["National Geographic", "E", "Keine belegte materielle Lücke gegenüber Fach- und Umweltquellen.", "IPCC, UBA, Europe PMC; EEA/IPBES als nächste Primärquellen."],
]);

function recentRuns(usage, auditDate) {
  const end = Date.parse(`${auditDate}T23:59:59Z`);
  const start = end - 30 * 86400000;
  return (usage?.runs || []).filter((run) => {
    const at = Date.parse(run.completed_at || run.started_at || "");
    return Number.isFinite(at) && at >= start && at <= end;
  });
}

export function sourcePerformance(registry, usage, state, auditDate = SOURCE_PORTFOLIO_AUDIT_DATE) {
  const runs = recentRuns(usage, auditDate);
  const rowsById = new Map();
  for (const run of runs) for (const row of run.source_funnel || []) {
    const result = rowsById.get(row.source_id) || {};
    for (const [key, value] of Object.entries(row)) if (typeof value === "number") result[key] = Number(result[key] || 0) + value;
    rowsById.set(row.source_id, result);
  }
  return registry.sources.map((source) => {
    const row = rowsById.get(source.source_id) || {};
    const status = state?.source_status?.[source.source_id] || {};
    const itemsSeen = Number(row.items_seen ?? row.feed_items ?? 0);
    const rejected = Number(row.items_local_rejected ?? row.local_rejections ?? 0);
    const duplicates = Number(row.items_duplicate ?? row.unchanged_items ?? 0);
    const output = Number(row.items_published ?? row.published_stories ?? 0) + Number(row.items_story_updates ?? row.updated_stories ?? 0);
    const cost = Number(row.estimated_ai_cost || 0);
    const sufficient = itemsSeen >= 20 && runs.length >= 8;
    const rejectionRate = itemsSeen ? rejected / itemsSeen : 0;
    const duplicateRate = itemsSeen ? duplicates / itemsSeen : 0;
    const failureRate = Number(status.attempts || 0) ? Number(status.failures || 0) / Number(status.attempts) : 0;
    const utility = Math.max(0, Math.min(100, 50 + output * 10 + Number(row.eligible_stories || 0) * 1.5 - rejectionRate * 20 - duplicateRate * 10 - failureRate * 30 - cost * 100));
    const reasons = [];
    if (sufficient && rejectionRate > 0.95) reasons.push("local_rejection_over_95_percent");
    if (sufficient && duplicateRate > 0.9) reasons.push("duplicates_over_90_percent");
    if (sufficient && Number(status.attempts || 0) >= 10 && failureRate > 0.2) reasons.push("high_fetch_failure_rate");
    if (sufficient && output === 0 && cost > 0.25) reasons.push("ai_cost_without_output");
    if (sufficient && output === 0) reasons.push("no_unique_publication_in_30_days");
    return {
      source_id: source.source_id,
      role: source.role,
      trial_mode: source.trial_mode,
      observation_status: sufficient ? "measurable" : "insufficient_window",
      review_required: reasons.length > 0,
      review_reasons: reasons,
      source_utility_score: round(utility, 1),
      metrics: {
        items_seen: itemsSeen,
        items_local_rejected: rejected,
        items_duplicate: duplicates,
        items_existing_story: Number(row.items_existing_story || 0),
        items_short_ai_checked: Number(row.items_short_ai_checked || 0),
        items_full_analyzed: Number(row.items_full_analyzed ?? row.ai_selected ?? 0),
        items_published: Number(row.items_published ?? row.published_stories ?? 0),
        items_story_updates: Number(row.items_story_updates ?? row.updated_stories ?? 0),
        items_primary_source_found: Number(row.items_primary_source_found || 0),
        items_source_integrity_failed: Number(row.items_source_integrity_failed ?? row.source_integrity_holds ?? 0),
        items_corrected_later: Number(row.items_corrected_later || 0),
        ai_input_tokens: round(row.ai_input_tokens || 0, 0),
        ai_output_tokens: round(row.ai_output_tokens || 0, 0),
        estimated_ai_cost: round(cost, 6),
        fetch_failures: Number(row.fetch_failures || 0),
        parse_failures: Number(row.parse_failures || 0),
      },
    };
  });
}

function networkGroups(registry) {
  const active = registry.sources.filter((source) => source.enabled && source.role === "A");
  const core = active.filter((source) => source.research_lane !== "blindspot" && source.frequency_class !== "slow_monitoring");
  const blindspot = active.filter((source) => source.research_lane === "blindspot" || source.frequency_class === "slow_monitoring");
  const caseSources = registry.sources.filter((source) => ["B", "C", "D"].includes(source.role));
  const entry = (source) => ({ source_id: source.source_id, name: source.name, role: source.role, cadence: source.cadence, trial_mode: source.trial_mode });
  return { core_network: core.map(entry), blindspot_network: blindspot.map(entry), case_research_sources: caseSources.map(entry) };
}

export function buildSourcePortfolioAudit(registry, usage = { runs: [] }, state = {}, auditDate = SOURCE_PORTFOLIO_AUDIT_DATE) {
  const activeIds = new Set(registry.sources.filter((source) => source.enabled && source.role === "A").map((source) => source.source_id));
  const coverage = COVERAGE_REQUIREMENTS.map(([topic, intended, sources]) => {
    const activeSources = sources.filter((sourceId) => activeIds.has(sourceId));
    const coverage = !activeSources.length ? "critical_gap" : intended === "good" && activeSources.length >= Math.min(2, sources.length) ? "good" : intended;
    return { topic, coverage, active_sources: activeSources, gap_note: coverage === "critical_gap" ? "Kein ausreichend eigenständiger aktiver Fachzugang." : coverage === "partial" ? "Bestehende Breitenquellen erkennen relevante Fälle, ein enger Primär-/Fachzugang fehlt oder die geografische Abdeckung ist unvollständig." : null };
  });
  const networks = networkGroups(registry);
  const performance = sourcePerformance(registry, usage, state, auditDate);
  const regional = regionalCoverage(registry, state, state.last_attempted_run || `${auditDate}T12:00:00Z`);
  return {
    audit_date: auditDate,
    schema_version: 1,
    objective: "Mit möglichst wenig Rauschen, Dubletten und KI-Kosten alle materiell relevanten Entwicklungen mit hoher Wahrscheinlichkeit erkennen.",
    methodology: {
      source_roles: { A: "aktiv automatisiert überwachen", B: "nur Entdeckung/Hinweis", C: "nur fallbezogene Sekundär-/Gegenquelle", D: "nur Primärquelle für eigene Aussagen/Daten", E: "vorerst nicht nutzen", F: "ausdrücklich ausgeschlossen" },
      legal_note: "Technische Erreichbarkeit ist keine rechtliche Freigabe. Offene Kandidaten bleiben in Rolle C, D oder E und werden nicht automatisch abgerufen.",
      utility_note: "Der Source Utility Score ist eine interne Betriebskennzahl, keine Medienqualitäts- oder politische Bewertung.",
      observation_window: "30 Tage; bei weniger als 20 gesehenen Einträgen und acht erfassten Läufen keine automatische Review-Markierung.",
    },
    summary: {
      registered_sources: registry.sources.length,
      active_automated_sources: registry.sources.filter((source) => source.enabled && source.role === "A").length,
      trial_sources: registry.sources.filter((source) => source.enabled && source.trial_mode).length,
      coverage_good: coverage.filter((item) => item.coverage === "good").length,
      coverage_partial: coverage.filter((item) => item.coverage === "partial").length,
      coverage_critical_gap: coverage.filter((item) => item.coverage === "critical_gap").length,
      performance_items_seen: performance.reduce((total, source) => total + Number(source.metrics.items_seen || 0), 0),
      regional_states_configured: regional.configured_states,
      regional_states_healthy: regional.healthy_states,
      regional_journalistic_states: regional.journalistic_states,
      regional_missing_states: regional.missing_states,
    },
    coverage,
    regional_coverage: regional,
    changes: PORTFOLIO_DECISIONS.slice(0, 20),
    do_not_activate: DO_NOT_ACTIVATE.map(([source, role, reason, covered_by]) => ({ source, role, reason, covered_by })),
    ...networks,
    source_performance: performance,
    open_followups: [
      { source: "EEA/IPBES", reason: "Biodiversität ist die einzige kritische Fachlücke; exakten offiziellen Endpoint, Robots/RSL und Nutzungsrahmen vor einer Trial-Aktivierung verifizieren." },
      { source: "BR24, Radio Bremen, Saarländischer Rundfunk", reason: "Unabhängige Regionalzugänge für Bayern, Bremen und Saarland weiter klären. Amtliche Trial-Zugänge in Bayern/Bremen sind nur Grundabdeckung. Saarland bleibt ohne verifizierten automatischen Regionalzugang." },
      { source: "BSI, BfDI, ENISA", reason: "Als fallbezogene Primärquellen verwenden; automatisierte Endpunkte erst nach vollständiger technischer und rechtlicher Prüfung aktivieren." },
    ],
  };
}

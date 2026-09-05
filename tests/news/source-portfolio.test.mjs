import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { loadNewsRegistry, registryErrors, SOURCE_GOVERNANCE_ROLES } from "../../scripts/news/registry.mjs";
import { buildSourcePortfolioAudit, sourcePerformance } from "../../scripts/news/source-portfolio.mjs";
import { annotateSourceItem, evidenceGroups } from "../../scripts/news/newsroom.mjs";
import { rslDecision, sourceAccess } from "../../scripts/news/access-policy.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const registry = loadNewsRegistry(root);

test("every registered source has exactly one A-F governance role and active sources pass the activation gate", () => {
  assert.deepEqual(registryErrors(registry), []);
  for (const source of registry.sources) {
    assert.ok(SOURCE_GOVERNANCE_ROLES.includes(source.role), source.source_id);
    assert.equal(source.enabled, source.role === "A", source.source_id);
    if (source.enabled) {
      assert.equal(source.official_endpoint_verified, true, source.source_id);
      assert.equal(source.technical_access, "verified", source.source_id);
      assert.ok(["metadata_only", "metadata_syndication_allowed", "own_publication"].includes(source.legal_use_status), source.source_id);
    }
  }
});

test("Heise starts as a bounded trial while Telepolis and tagesschau do not enter automatic polling", () => {
  for (const id of ["heise-wirtschaft", "heise-netzpolitik", "heise-security"]) {
    const source = registry.sources.find((entry) => entry.source_id === id);
    assert.equal(source.role, "A");
    assert.equal(source.trial_mode, true);
    assert.equal(source.frequency_class, "regular");
    assert.equal(sourceAccess(source).allowed, true);
  }
  for (const id of ["telepolis-aktuell", "tagesschau-access"]) {
    const source = registry.sources.find((entry) => entry.source_id === id);
    assert.notEqual(source.role, "A");
    assert.equal(source.enabled, false);
    assert.equal(sourceAccess(source).allowed, false);
  }
});

test("agency provenance collapses dpa, Reuters, AFP and AP copies without inventing independence", () => {
  const now = "2026-09-05T12:00:00Z";
  const baseSource = { source_type: "media_rss", primary_source: false, source_role: "journalistic_report" };
  const sources = [
    ["a", "dpa meldet die Entscheidung."],
    ["b", "Nach Angaben der Deutschen Presse-Agentur gilt die Entscheidung."],
    ["c", "Reuters berichtet über die Entscheidung."],
    ["d", "Nach Angaben von Reuters gilt die Entscheidung."],
    ["e", "Agence France-Presse meldet die Entscheidung."],
    ["f", "Associated Press meldet die Entscheidung."],
  ].map(([id, summary]) => annotateSourceItem({ item_id: id, url: `https://${id}.example.org/news`, title: "Neue Entscheidung", summary, published_at: now }, { ...baseSource, source_id: id, publisher_id: id }, now));
  assert.deepEqual(sources.map((source) => source.agency_origin), ["dpa", "dpa", "reuters", "reuters", "afp", "ap"]);
  assert.equal(evidenceGroups(sources.slice(0, 2)).possible_independent_origins, 1);
  assert.equal(evidenceGroups(sources.slice(2, 4)).possible_independent_origins, 1);
  assert.equal(evidenceGroups(sources).possible_independent_origins, 4);
});

test("portfolio audit covers all required fields and never recommends a big-bang activation", () => {
  const audit = buildSourcePortfolioAudit(registry, { runs: [] }, {});
  assert.equal(audit.coverage.length, 40);
  assert.ok(audit.coverage.some((entry) => entry.topic === "Biodiversität" && entry.coverage === "critical_gap"));
  assert.ok(audit.changes.length <= 20);
  assert.equal(audit.changes.filter((entry) => entry.new_role === "A").length, 3);
  assert.ok(audit.do_not_activate.some((entry) => entry.source === "National Geographic" && entry.role === "E"));
  assert.ok(audit.core_network.length > 0);
  assert.ok(audit.blindspot_network.some((entry) => entry.source_id === "heise-security"));
});

test("utility review thresholds require a meaningful observation window", () => {
  const source = registry.sources.find((entry) => entry.source_id === "heise-security");
  const short = sourcePerformance({ sources: [source] }, { runs: [{ completed_at: "2026-09-05T12:00:00Z", source_funnel: [{ source_id: source.source_id, items_seen: 100, items_local_rejected: 99 }] }] }, {});
  assert.equal(short[0].review_required, false);
  assert.equal(short[0].observation_status, "insufficient_window");
  const runs = Array.from({ length: 8 }, (_, index) => ({ completed_at: `2026-09-05T${String(index + 1).padStart(2, "0")}:00:00Z`, source_funnel: [{ source_id: source.source_id, items_seen: 20, items_local_rejected: 20 }] }));
  const measured = sourcePerformance({ sources: [source] }, { runs }, {});
  assert.equal(measured[0].review_required, true);
  assert.ok(measured[0].review_reasons.includes("local_rejection_over_95_percent"));
});

test("RSL evaluation is fail-closed for AI input and ambiguous licensing", () => {
  assert.equal(rslDecision('<rsl xmlns="https://rslstandard.org/rsl"><content url="/"><license><prohibits type="usage">ai-train ai-input</prohibits></license></content></rsl>').reason, "RSL_AI_INPUT_DISALLOWED");
  assert.equal(rslDecision('<rsl xmlns="https://rslstandard.org/rsl"><content url="/"><license><permits type="usage">ai-input</permits><payment type="free"/></license></content></rsl>').allowed, true);
  assert.equal(rslDecision('<rsl xmlns="https://rslstandard.org/rsl"><content url="/"><license><permits type="usage">ai-input</permits><reporting type="telemetry"/></license></content></rsl>').reason, "RSL_STATUS_OPEN");
  assert.equal(rslDecision("<html>not RSL</html>").reason, "RSL_STATUS_OPEN");
});

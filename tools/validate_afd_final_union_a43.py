#!/usr/bin/env python3
"""Deterministic validator for frozen ST-AfD final-union manifest A43.

Convergence-only: no source scan and no Fach/DNS/Recommendation synthesis.
The validator checks the exact frozen #234 A43 descriptor, its canonical hash,
register provenance, set accounting and terminal gates.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "content/audits/sachsen-anhalt/afd-final-union-manifest-a43.json"
REGISTER = ROOT / "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-afd-zusagen.md"
EXPECTED_MANIFEST_SHA256 = "4223fde6b37165d56242df35d0278e77e16f55ea100d25e13607413c77fa6607"


def git_blob_sha(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def main() -> int:
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    canonical = json.dumps(m, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    manifest_hash = hashlib.sha256(canonical).hexdigest()
    assert manifest_hash == EXPECTED_MANIFEST_SHA256, (manifest_hash, EXPECTED_MANIFEST_SHA256)

    h = m["historical_register"]
    assert h["working_rows"] == 466
    assert h["status"] == "TERMINAL_HISTORICAL_ONLY"
    assert hashlib.sha256(REGISTER.read_bytes()).hexdigest() == h["register_sha256"]
    assert git_blob_sha(REGISTER) == h["git_blob"]

    r = m["role_materialization"]
    parts = r["slice_partitions"]
    assert len(parts) == 17
    assert sum(p["historical_rows"] for p in parts) == 466
    assert sum(p["versioned_rows"] for p in parts) == 386
    assert sum(p["active_effect_leaves"] for p in parts) == 619
    assert sum(p["zero_count_nonleaf_context"] for p in parts) == 102
    assert sum(p["relation_provenance_zero"] for p in parts) == 131
    assert r["active_effect_leaves"] == 619
    assert r["zero_count_nonleaf_context"] == 102
    assert r["zero_count_relation_provenance"] == 131
    assert r["zero_count_total"] == 233
    assert r["represented_role_record_universe"] == 852
    assert r["conservation"] == "619+102+131=852"

    a = m["authoritative_counts"]
    assert a["counts_frozen"] is True
    assert a["authoritative_source_unit_count"] == 619
    assert a["authoritative_effect_mechanism_count"] == 619
    assert a["preserved_zero_count_records"] == 233
    assert a["represented_role_record_universe"] == 852

    assert all(v == 0 for v in m["gap_counts"].values())
    d = m["dedupe_reconciliation"]
    assert d["exact_stable_id_collisions"] == 0
    assert d["unresolved_duplicate_restatement_supersedes_relations"] == 0
    assert d["unresolved_semantic_collisions"] == 0
    assert d["graph_acyclic"] == "PASS"
    assert m["page_passage_role_chain"]["status"] == "PASS_P0_P257_CONTINUOUS"
    assert m["active_leaf_terminal_fach_set_check"] == {"new_fach_judgements": 0, "status": "PASS_REUSED_EXACTLY"}
    assert m["active_leaf_241_layer_set_check"] == {"new_layer_synthesis": 0, "status": "PASS_INHERITED_APPLICABLE_TERMINAL_RECORDS"}

    c = m["completion"]
    assert c["PEND"] == 0
    assert c["unresolved_source_relations"] == 0
    assert c["ST_AFD_FINAL_FACH_COMPLETE"] == "PASS"
    assert c["ST_AFD_PRIMARY_SOURCE_PARITY"] == "PASS_FULL_PROGRAMME"

    print(json.dumps({
        "status": "PASS",
        "manifest_id": m["manifest_id"],
        "manifest_sha256": manifest_hash,
        "authoritative_source_unit_count": 619,
        "authoritative_effect_mechanism_count": 619,
        "preserved_zero_count_records": 233,
        "represented_role_record_universe": 852,
        "PEND": 0,
        "unresolved_source_relations": 0,
        "graph_acyclic": True,
        "source_gap_counts": m["gap_counts"],
        "terminal_fach_set_check": "PASS_REUSED_EXACTLY",
        "layer_241_set_check": "PASS_INHERITED_APPLICABLE_TERMINAL_RECORDS",
        "ST_AFD_PRIMARY_SOURCE_PARITY": "PASS_FULL_PROGRAMME"
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

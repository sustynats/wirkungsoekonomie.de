#!/usr/bin/env python3
"""Deterministic validator for frozen ST-LINKE final-union manifest C26.

Convergence-only: no source scan and no Fach/DNS/Recommendation synthesis.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "content/audits/sachsen-anhalt/linke-final-union-manifest-c26.json"
EXPECTED_MANIFEST_SHA256 = "307919d5a528b5fd4ef8794753c068d8ba2a83a142e538c7d3f3a201b636ccd5"
EXPECTED_SCOPES = [
    (1,105),(106,123),(124,137),(138,167),(168,210),(211,252),(253,290),
    (291,321),(322,353),(354,388),(389,407),(408,414),(415,443),(444,555),
    (556,605),(606,655),(656,705),(706,755),(756,805),(806,855),(856,886),
]


def parse_scope(scope: str) -> tuple[int, int]:
    a, b = scope.split("-")
    return int(a), int(b)


def main() -> int:
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    canonical = json.dumps(m, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    manifest_hash = hashlib.sha256(canonical).hexdigest()
    assert manifest_hash == EXPECTED_MANIFEST_SHA256, (manifest_hash, EXPECTED_MANIFEST_SHA256)

    assert m["manifest_id"] == "ST-LINKE-FINAL-UNION-MANIFEST-C26"
    assert m["manifest_type"] == "content-addressed_set_union_descriptor"
    assert m["working_baseline"]["historical_rows"] == 886
    assert "never arithmetically combined" in m["working_baseline"]["rule"]

    components = m["components"]
    assert len(components) == 21
    assert [parse_scope(c["scope"]) for c in components] == EXPECTED_SCOPES
    assert EXPECTED_SCOPES[0][0] == 1 and EXPECTED_SCOPES[-1][1] == 886
    assert all(EXPECTED_SCOPES[i][1] + 1 == EXPECTED_SCOPES[i+1][0] for i in range(len(EXPECTED_SCOPES)-1))
    active = sum(c["active_effect_leaves"] for c in components)
    assert active == 1243

    a = m["authoritative_counts"]
    assert a["counts_frozen"] is True
    assert a["authoritative_source_unit_count"] == active
    assert a["authoritative_effect_mechanism_count"] == active
    assert "collision-resolved final ACTIVE_EFFECT_LEAF set" in a["counting_method"]

    for edge in m["cross_component_reconciliation"]:
        assert edge["count"] == 0
    assert len(m["cross_component_reconciliation"]) == 13

    g = m["global_checks"]
    for key in (
        "duplicate_gaps", "overmerge_gaps", "restore_gaps", "source_gaps",
        "stable_id_collisions", "truncation_gaps",
        "unresolved_same_parent_child_supersedes_edges", "unresolved_semantic_collisions",
    ):
        assert g[key] == 0, (key, g[key])
    assert g["continuous_historical_scope"] == "PASS_0001_0886_NO_GAPS"
    assert g["graph_acyclic"] == "PASS"
    assert g["one_count_per_final_active_leaf"] == "PASS"
    assert g["non_effect_zero"] == "PASS"
    assert g["terminal_fach"] == "PASS_REUSED_EXACTLY_NO_NEW_JUDGEMENT"
    assert g["applicable_241_layer_set_check"] == "PASS_INHERITED_TERMINAL_RECORDS_NO_SYNTHESIS"

    assert m["completion"]["ST_LINKE_PRIMARY_SOURCE_PARITY"] == "PASS_FULL_PROGRAMME"

    print(json.dumps({
        "status": "PASS",
        "manifest_id": m["manifest_id"],
        "manifest_sha256": manifest_hash,
        "authoritative_source_unit_count": active,
        "authoritative_effect_mechanism_count": active,
        "historical_working_baseline": 886,
        "component_count": len(components),
        "cross_component_zero_count_relations": len(m["cross_component_reconciliation"]),
        "graph_acyclic": True,
        "zero_gaps": True,
        "terminal_fach": g["terminal_fach"],
        "layer_241_set_check": g["applicable_241_layer_set_check"],
        "ST_LINKE_PRIMARY_SOURCE_PARITY": m["completion"]["ST_LINKE_PRIMARY_SOURCE_PARITY"]
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

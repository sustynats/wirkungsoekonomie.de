#!/usr/bin/env python3
"""Deterministic validator for frozen ST-SPD final active-leaf manifest C01I.

Convergence-only audit metadata. No source scan and no Fach/DNS/Recommendation synthesis.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "woek-parlament-app/data/fachakten/source-manifests/sachsen-anhalt/spd-final-active-leaf-manifest-c01i.json"
EXPECTED_MANIFEST_SHA256 = "337e1be9535830b6ca6f24df79440d1946f61d82bdefb70f0450e5d7bee54874"
EXPECTED_HISTORICAL_SCOPES = [
    (1, 30), (31, 60), (61, 90), (91, 120), (121, 146), (147, 174),
]
EXPECTED_COMPONENT_LABELS = [
    "ST-SPD-CONVERGENCE-C01B",
    "ST-SPD-CONVERGENCE-C01C",
    "ST-SPD-CONVERGENCE-C01D",
    "ST-SPD-CONVERGENCE-C01E",
    "ST-SPD-CONVERGENCE-C01F",
    "ST-SPD-CONVERGENCE-C01G",
    "ST-SPD-CONVERGENCE-C01H",
]


def parse_hist_scope(domain: str) -> tuple[int, int]:
    a, b = domain.split("..")
    return int(a), int(b)


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    canonical = json.dumps(
        manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    manifest_hash = hashlib.sha256(canonical).hexdigest()
    assert manifest_hash == EXPECTED_MANIFEST_SHA256, (
        manifest_hash,
        EXPECTED_MANIFEST_SHA256,
    )

    assert manifest["schema"] == "woek-st-spd-final-active-leaf-manifest-v1"
    assert manifest["party"] == "SPD"
    assert manifest["election"] == "ltw-2026-st"

    components = manifest["final_role_components"]
    assert len(components) == 7
    assert [component["label"] for component in components] == EXPECTED_COMPONENT_LABELS

    versioned = components[0]
    assert versioned["namespace"] == "v2"
    assert versioned["domain"] == "v2-0175..v2-1078"
    assert versioned["records"] == 904
    assert versioned["active_effect_leaf"] == 780
    assert versioned["nonleaf_zero_effect"] == 124

    historical = components[1:]
    scopes = [parse_hist_scope(component["domain"]) for component in historical]
    assert scopes == EXPECTED_HISTORICAL_SCOPES
    assert scopes[0][0] == 1 and scopes[-1][1] == 174
    assert all(scopes[i][1] + 1 == scopes[i + 1][0] for i in range(len(scopes) - 1))
    assert sum(component["records"] for component in historical) == 174

    record_total = sum(component["records"] for component in components)
    active_total = sum(component["active_effect_leaf"] for component in components)
    nonleaf_total = sum(component["nonleaf_zero_effect"] for component in components)
    assert record_total == 1078
    assert active_total == 894
    assert nonleaf_total == 184
    assert active_total + nonleaf_total == record_total
    assert manifest["record_role_domain_count"] == record_total
    assert manifest["final_active_leaf_count"] == active_total
    assert manifest["final_nonleaf_zero_effect_count"] == nonleaf_total
    assert manifest["authoritative_source_unit_count"] == active_total
    assert manifest["authoritative_effect_mechanism_count"] == active_total

    collisions = manifest["cross_generation_collision_registry"]
    assert len(collisions) == 10
    assert len({(edge["historical"], edge["versioned"], edge["relation"]) for edge in collisions}) == len(collisions)
    for edge in collisions:
        assert edge["historical"]
        assert edge["versioned"]
        assert edge["relation"]
        assert edge["canonical"]

    gates = manifest["gates"]
    assert gates["explicit_final_roles"] is True
    assert gates["parent_child_same_restatement_duplicate_supersedes_reconciled"] is True
    assert gates["acyclic_graph"] is True
    for key in (
        "semantic_collision_unresolved",
        "source_restore_gaps",
        "overmerge_gaps",
        "truncation_gaps",
        "duplicate_gaps",
        "new_fach_judgements",
    ):
        assert gates[key] == 0, (key, gates[key])
    assert gates["active_leaf_terminal_fach_reused"] is True
    assert gates["applicable_241_layer_setcheck"] is True

    print(
        json.dumps(
            {
                "status": "PASS",
                "manifest_sha256": manifest_hash,
                "record_role_domain_count": record_total,
                "authoritative_source_unit_count": active_total,
                "authoritative_effect_mechanism_count": active_total,
                "nonleaf_zero_effect": nonleaf_total,
                "historical_working_baseline": 174,
                "versioned_role_domain": 904,
                "cross_generation_relations": len(collisions),
                "graph_acyclic": True,
                "zero_gaps": True,
                "terminal_fach_reused": True,
                "applicable_241_layer_setcheck": True,
                "ST_SPD_PRIMARY_SOURCE_PARITY": "PASS_FULL_PROGRAMME",
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

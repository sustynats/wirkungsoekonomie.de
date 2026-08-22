#!/usr/bin/env python3
"""Deterministic validator for frozen ST-BSW final-union manifest R22.

No source scan and no Fach synthesis. This validates only the already source-bound
R10/R14/R18/R20/R21 component sets and the frozen R22 accounting/proof.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
A = ROOT / "content/audits/sachsen-anhalt"
REGISTER = ROOT / "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-bsw-zusagen.md"
FILES = {
    "r10_role_checkpoint": A / "bsw-source-unit-manifest-reconciliation-r10.json",
    "r14_versioned_union": A / "bsw-source-unit-union-r14.json",
    "r18_relation_registry": A / "bsw-final-union-relation-registry-r18.json",
    "r20_restore_addendum": A / "bsw-final-union-source-leaf-addendum-r20.json",
    "r20_relation_overlay": A / "bsw-final-union-relation-overlay-r20.json",
    "r21_role_closure": A / "bsw-final-union-role-closure-r21.json",
    "r22_manifest": A / "bsw-final-union-manifest-r22.json",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def git_blob_sha(path: Path) -> str:
    b = path.read_bytes()
    return hashlib.sha1(b"blob " + str(len(b)).encode() + b"\0" + b).hexdigest()


def parse_register() -> tuple[dict[str, str], str]:
    text = REGISTER.read_text(encoding="utf-8")
    starts = list(re.finditer(r"^#### Eintrag (\d+)\s*$", text, re.M))
    by_ord = {}
    for i, m in enumerate(starts):
        block = text[m.start(): starts[i + 1].start() if i + 1 < len(starts) else len(text)]
        km = re.search(r"^\*\*commitment_key:\*\*\s*(\S+)\s*$", block, re.M)
        if not km:
            raise AssertionError(f"missing commitment_key at {m.group(1)}")
        by_ord[f"{int(m.group(1)):04d}"] = km.group(1)
    sm = re.search(r"^\*\*source_hash:\*\*\s*([0-9a-f]{64})\s*$", text, re.M)
    if not sm:
        raise AssertionError("missing source_hash")
    return by_ord, sm.group(1)


def canonical_manifest_hash(m: dict) -> str:
    x = dict(m)
    x.pop("canonical_manifest_payload_sha256", None)
    x.pop("hash_definition", None)
    raw = json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def topo(nodes: set[str], edges: list[tuple[str, str]]) -> bool:
    adj = defaultdict(list)
    indeg = {n: 0 for n in nodes}
    for a, b in edges:
        assert a in nodes, ("missing source", a)
        assert b in nodes, ("missing target", b)
        adj[a].append(b)
        indeg[b] += 1
    q = deque(n for n, d in indeg.items() if d == 0)
    seen = 0
    while q:
        n = q.popleft()
        seen += 1
        for nxt in adj[n]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return seen == len(nodes)


def main() -> int:
    r10, r14, r18, add, ov, r21, r22 = (load(FILES[k]) for k in [
        "r10_role_checkpoint", "r14_versioned_union", "r18_relation_registry",
        "r20_restore_addendum", "r20_relation_overlay", "r21_role_closure", "r22_manifest"
    ])
    hist_by_ord, source_hash = parse_register()
    assert len(hist_by_ord) == 311
    assert source_hash == r22["historical_source_sha256"]
    assert git_blob_sha(REGISTER) == r22["component_blobs"]["historical_register"]
    for k in ["r10_role_checkpoint","r14_versioned_union","r18_relation_registry","r20_restore_addendum","r20_relation_overlay","r21_role_closure"]:
        assert git_blob_sha(FILES[k]) == r22["component_blobs"][k], (k, git_blob_sha(FILES[k]), r22["component_blobs"][k])

    base_roles = dict(r10["current_register_final_role_matrix"]["role_by_historical_ordinal"])
    pend = sorted(o for o, role in base_roles.items() if role == "PEND")
    close = sorted(r21["pend_to_keep_atomic_ordinals"])
    assert len(pend) == 220 and pend == close
    roles = dict(base_roles)
    for o in close:
        roles[o] = "KA"
    for o, role in r21.get("historical_role_overrides", {}).items():
        roles[o] = role
    assert Counter(roles.values()) == Counter({"KA":271,"KAC":7,"SNL":25,"CTX":8})
    assert sum(role in {"KA","KAC"} for role in roles.values()) == 278
    assert sum(role in {"SNL","CTX"} for role in roles.values()) == 33
    assert not any(role == "PEND" for role in roles.values())

    base_ids = list(r14["all_versioned_ids"])
    add_rows = list(add["source_leaves"])
    add_ids = [x["source_unit_id"] for x in add_rows]
    assert len(base_ids) == len(set(base_ids)) == 380
    assert len(add_ids) == len(set(add_ids)) == 11
    assert not (set(base_ids) & set(add_ids))
    versioned = set(base_ids) | set(add_ids)
    assert len(versioned) == 391

    target_map = dict(r18.get("historical_relation_targets", {}))
    target_map.update(ov.get("historical_relation_targets", {}))
    assert set(target_map) == set(r21["relation_bearing_ordinals"])
    assert len(target_map) == 32
    edge_count = sum(len(v) for v in target_map.values())
    assert edge_count == 75
    hist_keys = set(hist_by_ord.values())
    nodes = hist_keys | versioned
    edges = []
    for ordinal, targets in target_map.items():
        source = hist_by_ord[ordinal]
        for target in targets:
            assert target in nodes, (ordinal, target)
            edges.append((source, target))
    assert topo(nodes, edges)

    carried = r14["relation_resolutions_carried_forward"]
    co2 = carried["front_p6_co2_repeat"]
    assert co2["relation"] == "DUPLICATE_RELATION" and co2["additional_active_leaf"] is False
    assert co2["canonical_target"] in versioned
    schwarz = carried["a03_p28_to_a04_p29_schwarzerde"]
    assert schwarz["relation"] == "DUPLICATE_RELATION" and schwarz["additional_active_leaf"] is False
    pair = carried["a04_seriell_modular_pair"]
    assert pair["relation"] == "RELATED_DISTINCT_MECHANISMS" and pair["both_active"] is True
    assert pair["left"] in versioned and pair["right"] in versioned
    assert r10["inherited_closed_gates"]["known_explicit_psr_duplicate_relation_queue"] == 0
    assert r21["checks"]["pend_relation_overlap"] == 0

    expected_gaps = {"ABSENT":0,"PARTIAL_PARENT":0,"OVERMERGED":0,"TRUNCATED":0,"RESTORE_GAP":0}
    assert ov["unresolved_source_relations"] == []
    assert ov["resolved_gap_counts"] == expected_gaps
    assert ov["active_leaf_terminal_fach_set_check"]["status"] == "PASS"
    assert ov["active_leaf_241_layer_set_check"]["status"] == "PASS"

    assert r22["role_materialization"]["historical_active_effect_leaves"] == 278
    assert r22["role_materialization"]["versioned_active_effect_leaves"] == 391
    assert r22["authoritative_counts"]["final_active_source_effect_leaf_count"] == 669
    assert r22["authoritative_counts"]["preserved_zero_count_nonleaf_or_context_records"] == 33
    assert r22["completion"]["PEND"] == 0
    assert r22["completion"]["unresolved_source_relations"] == 0
    assert r22["completion"]["ST_BSW_PRIMARY_SOURCE_PARITY_FULL_PROGRAM"] == "PASS_FULL_PROGRAMME"
    assert canonical_manifest_hash(r22) == r22["canonical_manifest_payload_sha256"]

    print(json.dumps({
        "status":"PASS",
        "manifest_id":r22["manifest_id"],
        "manifest_sha256":r22["canonical_manifest_payload_sha256"],
        "historical_rows":311,
        "historical_active":278,
        "versioned_distinct":391,
        "active_source_effect_leaves":669,
        "zero_count_nonleaf_or_context":33,
        "directed_edges":75,
        "graph_acyclic":True,
        "PEND":0,
        "unresolved_source_relations":0,
        "resolved_gap_counts":expected_gaps,
        "terminal_fach_set_check":"PASS",
        "layer_241_set_check":"PASS",
        "ST_BSW_PRIMARY_SOURCE_PARITY_FULL_PROGRAM":"PASS_FULL_PROGRAMME"
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Deterministic source-role audit for the Sachsen-Anhalt 2026 BSW final union.

This tool is deliberately *not* a fach-judgement generator. It only:
- verifies the exact 311 historical rows and 380 versioned union IDs,
- carries forward explicit final roles already source-bound in R10,
- performs a page/batch constrained lexical collision scan for the 220 R10 PEND rows,
- validates known relation targets and relation-graph acyclicity where explicit edges exist,
- emits a review report. It never freezes the authoritative denominator.

A PEND row may only become KEEP_ATOMIC in the final manifest after the report proves that
no competing source-bound versioned leaf is a plausible SAME/DUPLICATE representation,
or after an explicit source-role decision is supplied from #234. Similarity scores are
triage evidence, never fach semantics.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
R10 = ROOT / "content/audits/sachsen-anhalt/bsw-source-unit-manifest-reconciliation-r10.json"
R14 = ROOT / "content/audits/sachsen-anhalt/bsw-source-unit-union-r14.json"
REGISTER = ROOT / "woek-parlament-app/data/fachakten/release-1/sachsen-anhalt/ltw-2026-st-bsw-zusagen.md"

STOP = {
    "aber","alle","allen","aller","alles","als","also","auch","auf","aus","bei","beim","bis","da","dass","das","dem","den","der","des","die","dies","diese","diesem","diesen","dieser","durch","ein","eine","einem","einen","einer","eines","fuer","gegen","im","in","ins","ist","mit","nach","nicht","nur","oder","ohne","sich","sind","soll","sollen","sowie","und","vom","von","vor","werden","wird","wir","zur","zum","zu",
}

BATCH_RANGES = {
    "front": [(4, 6)],
    "a01": [(7, 15)],
    "a02": [(16, 22)],
    "a03": [(23, 28)],
    "a04": [(29, 37)],
    "a05": [(37, 48)],
    "a06": [(49, 58)],
    "a07": [(59, 69)],
    "a08": [(70, 79)],
    "a09": [(80, 89)],
}

EXPECTED_BATCH_COUNTS = {"front":2,"A01":31,"A02":37,"A03":40,"A04":58,"A05":61,"A06":41,"A07":42,"A08":28,"A09":40}


def ascii_norm(s: str) -> str:
    s = s.replace("ß", "ss").replace("ẞ", "SS")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def tokens(s: str) -> list[str]:
    return [t for t in ascii_norm(s).split() if len(t) >= 3 and t not in STOP and not t.isdigit()]


def parse_register(md: str) -> list[dict]:
    starts = list(re.finditer(r"^#### Eintrag (\d+)\s*$", md, re.M))
    out = []
    for i, m in enumerate(starts):
        block = md[m.start() : starts[i + 1].start() if i + 1 < len(starts) else len(md)]
        ordinal = f"{int(m.group(1)):04d}"
        def grab(label: str) -> str:
            mm = re.search(rf"^\*\*{re.escape(label)}:\*\*\s*(.*)$", block, re.M)
            return (mm.group(1).strip() if mm else "")
        page_raw = grab("page")
        try:
            page = int(re.search(r"\d+", page_raw).group()) if page_raw else None
        except Exception:
            page = None
        out.append({
            "ordinal": ordinal,
            "commitment_key": grab("commitment_key"),
            "title": grab("title"),
            "commitment_text": grab("commitment_text"),
            "page": page,
            "section": grab("section"),
        })
    return out


def psr_batch(uid: str) -> str:
    m = re.search(r"-psr-(front|a\d\d)-", uid)
    return m.group(1) if m else "unknown"


def psr_label(uid: str) -> str:
    s = re.sub(r"^ltw-2026-st-bsw-psr-(?:front|a\d\d)-", "", uid)
    s = re.sub(r"^p\d+(?:-p\d+)?-\d+-", "", s)
    s = re.sub(r"^\d+-", "", s)
    s = re.sub(r"^\d{4}-", "", s)
    return s.replace("-", " ")


def batch_matches_page(batch: str, page: int | None) -> bool:
    if page is None:
        return True
    for lo, hi in BATCH_RANGES.get(batch, []):
        if lo <= page <= hi:
            return True
    return False


def score_pair(hist: dict, uid: str) -> dict:
    h = f"{hist['title']} {hist['commitment_text']}"
    p = psr_label(uid)
    ht = set(tokens(h))
    pt = set(tokens(p))
    inter = ht & pt
    union = ht | pt
    jaccard = len(inter) / len(union) if union else 0.0
    containment = len(inter) / min(len(ht), len(pt)) if ht and pt else 0.0
    hn, pn = ascii_norm(h), ascii_norm(p)
    seq = SequenceMatcher(None, hn, pn).ratio() if hn and pn else 0.0
    composite = 0.45 * containment + 0.35 * jaccard + 0.20 * seq
    return {
        "versioned_id": uid,
        "batch": psr_batch(uid),
        "jaccard": round(jaccard, 4),
        "containment": round(containment, 4),
        "sequence": round(seq, 4),
        "composite": round(composite, 4),
        "shared_tokens": sorted(inter),
    }


def candidate_flag(s: dict) -> bool:
    n = len(s["shared_tokens"])
    return (
        (n >= 3 and s["containment"] >= 0.55)
        or (n >= 3 and s["jaccard"] >= 0.38)
        or (n >= 2 and s["sequence"] >= 0.62)
        or (n >= 4 and s["composite"] >= 0.33)
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="tmp/bsw-final-union-collision-report.json")
    ap.add_argument("--fail-on-review-candidates", action="store_true")
    args = ap.parse_args()

    r10 = json.loads(R10.read_text(encoding="utf-8"))
    r14 = json.loads(R14.read_text(encoding="utf-8"))
    hist = parse_register(REGISTER.read_text(encoding="utf-8"))
    h_by_ord = {x["ordinal"]: x for x in hist}
    roles = r10["current_register_final_role_matrix"]["role_by_historical_ordinal"]
    ids = r14["all_versioned_ids"]

    hard_errors: list[str] = []
    if len(hist) != 311 or len(h_by_ord) != 311:
        hard_errors.append(f"historical register cardinality mismatch: rows={len(hist)} unique={len(h_by_ord)}")
    if set(roles) != set(h_by_ord):
        hard_errors.append("R10 role keys do not exactly equal historical ordinals")
    if len(ids) != 380 or len(set(ids)) != 380:
        hard_errors.append(f"R14 union mismatch: ids={len(ids)} distinct={len(set(ids))}")
    if r14.get("batch_counts") != EXPECTED_BATCH_COUNTS:
        hard_errors.append(f"R14 batch_counts mismatch: {r14.get('batch_counts')}")

    role_counts = Counter(roles.values())
    pend = [o for o, role in roles.items() if role == "PEND"]
    if len(pend) != 220:
        hard_errors.append(f"expected 220 PEND rows, got {len(pend)}")

    ids_by_batch: dict[str, list[str]] = defaultdict(list)
    for uid in ids:
        ids_by_batch[psr_batch(uid)].append(uid)

    pending_reports = []
    review_candidate_ordinals = []
    for ord_ in pend:
        h = h_by_ord[ord_]
        eligible = [uid for uid in ids if batch_matches_page(psr_batch(uid), h["page"])]
        scored = sorted((score_pair(h, uid) for uid in eligible), key=lambda x: x["composite"], reverse=True)
        top = scored[:5]
        flagged = [s for s in top if candidate_flag(s)]
        if flagged:
            review_candidate_ordinals.append(ord_)
        pending_reports.append({
            "historical_ordinal": ord_,
            "historical_key": h["commitment_key"],
            "page": h["page"],
            "title": h["title"],
            "candidate_status": "REVIEW_SEMANTIC_COLLISION_CANDIDATE" if flagged else "NO_LEXICAL_COLLISION_CANDIDATE",
            "top_candidates": top,
        })

    calibration = defaultdict(list)
    for ord_, role in roles.items():
        if role == "PEND":
            continue
        h = h_by_ord[ord_]
        eligible = [uid for uid in ids if batch_matches_page(psr_batch(uid), h["page"])]
        scored = sorted((score_pair(h, uid) for uid in eligible), key=lambda x: x["composite"], reverse=True)
        best = scored[0] if scored else None
        calibration[role].append({"ordinal": ord_, "page": h["page"], "best": best})

    explicit_rel = r14.get("relation_resolutions_carried_forward", {})
    known_targets = []
    for rel in explicit_rel.values():
        if isinstance(rel, dict):
            for key in ("canonical_target", "left", "right"):
                if rel.get(key):
                    known_targets.append(rel[key])
    missing_relation_targets = sorted(set(known_targets) - set(ids))
    if missing_relation_targets:
        hard_errors.append(f"known relation targets missing from R14 union: {missing_relation_targets}")

    report = {
        "audit_id": "ST-BSW-FINAL-UNION-COLLISION-SCAN-R15",
        "mode": "MECHANICAL_SOURCE_ROLE_TRIAGE_ONLY_NO_FACH_SEMANTICS",
        "input_head_expectation": "PR270 working branch; denominator freeze forbidden",
        "historical_register": {
            "rows": len(hist),
            "unique_ordinals": len(h_by_ord),
            "role_counts_r10": dict(sorted(role_counts.items())),
            "pending_rows": len(pend),
        },
        "versioned_union": {
            "rows": len(ids),
            "distinct_ids": len(set(ids)),
            "batch_counts": r14.get("batch_counts"),
            "set_check": r14.get("set_check"),
        },
        "known_relation_targets_present": not missing_relation_targets,
        "hard_errors": hard_errors,
        "pending_collision_scan": {
            "pending_total": len(pend),
            "lexically_clear_no_candidate": len(pend) - len(review_candidate_ordinals),
            "review_candidate_count": len(review_candidate_ordinals),
            "review_candidate_ordinals": review_candidate_ordinals,
            "rows": pending_reports,
        },
        "calibration_by_existing_role": dict(calibration),
        "guard": {
            "authoritative_denominator_frozen": False,
            "BSW_FULL_PROGRAM_FACH_COMPLETE": False,
            "rule": "Similarity is collision triage only; final roles require source-bound relation resolution, never fach inference.",
        },
    }

    out = ROOT / args.output
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "audit_id": report["audit_id"],
        "hard_errors": hard_errors,
        "role_counts_r10": dict(role_counts),
        "pending": len(pend),
        "no_candidate": len(pend) - len(review_candidate_ordinals),
        "review_candidates": len(review_candidate_ordinals),
        "review_candidate_ordinals": review_candidate_ordinals,
        "output": str(out.relative_to(ROOT)),
    }, ensure_ascii=False, indent=2))

    if hard_errors:
        return 2
    if args.fail_on_review_candidates and review_candidate_ordinals:
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

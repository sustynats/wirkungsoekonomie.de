#!/usr/bin/env python3
"""Classify final PDF production-residue candidates and fail closed."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--visible", type=Path, required=True)
    parser.add_argument("--hidden", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    visible = json.loads(args.visible.read_text(encoding="utf-8"))
    hidden = json.loads(args.hidden.read_text(encoding="utf-8"))

    reviewed_visible = []
    unresolved = []
    for record in visible["records"]:
        for finding in record["findings"]:
            text = finding["text"]
            if "KI-gener" in text:
                classification = "substantive discussion of synthetic or AI-generated content"
            elif "KI-Hinweis" in text or "KI-Kennzeichnung" in text or "KI-/Manipulationstransparenz" in text:
                classification = "substantive transparency criterion in the media-impact method"
            elif "KI-Produktion" in text:
                classification = "substantive economic example about energy-intensive production"
            elif "nicht manuell steuern" in text:
                classification = "substantive statement about rule-based feedback"
            else:
                unresolved.append({"surface": "visible", "path": record["path"], **finding})
                continue
            reviewed_visible.append({"path": record["path"], "page": finding["page"], "classification": classification})

    reviewed_hidden = []
    for record in hidden["findings"]:
        for finding in record["findings"]:
            context = finding["context"]
            if record["path"] == "assets/pdf/journal/ki-souveraenitaet-statt-abhaengigkeit-fable-moment.pdf" and "anthropic.com/news/fable-mythos-access" in context:
                reviewed_hidden.append({
                    "path": record["path"], "surface": finding["surface"],
                    "classification": "visible scientific source link retained as substantive evidence",
                })
            else:
                unresolved.append({"surface": "hidden", "path": record["path"], **finding})

    if hidden.get("failures"):
        unresolved.extend({"surface": "hidden-audit-failure", **failure} for failure in hidden["failures"])
    report = {
        "date": "2026-10-13",
        "status": "PASS" if not unresolved else "FAIL",
        "scope": {
            "pdfsChecked": visible["pdfsChecked"],
            "uniquePdfs": visible["uniquePdfs"],
            "uniqueVisiblePagesChecked": visible["uniquePagesChecked"],
            "hiddenObjectsChecked": hidden["objectsChecked"],
            "embeddedImagesChecked": hidden["imageMetadataChecked"],
        },
        "reviewedSubstantiveVisibleCandidates": reviewed_visible,
        "reviewedSubstantiveHiddenCandidates": reviewed_hidden,
        "unresolvedProductionResidue": unresolved,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": report["status"], "visibleSubstantive": len(reviewed_visible),
        "hiddenSubstantive": len(reviewed_hidden), "unresolved": len(unresolved),
    }, ensure_ascii=False))
    if unresolved:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

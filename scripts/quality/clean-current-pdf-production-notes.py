#!/usr/bin/env python3
"""Remove remaining public-format and editorial production blocks from PDFs."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "reports/consistency-20261009/pdf-visible-production-note-cleanup-pass8-20261013.json"
PATTERN = re.compile(
    r"Redaktionshinweis|Redaktion\s+Redaktion|"
    r"interne(?:n|r|s)?\s+(?:technische[nr]?\s+)?(?:Arbeitsanweisungen|Arbeitsnotizen|Hinweise|Informationen)|"
    r"Website-Umsetzung|Website-\s*und\s*Downloadanforderungen|Website-\s*und\s*Portalintegration|"
    r"Tool-\s*und\s*Website-Integration|Website-Integration|Website-Baustein|"
    r"Für die Website muss|Die Website-Fassung|Die Seite braucht Inhaltsverzeichnis|"
    r"Als Download muss|Die Downloadfassung muss|Downloadbereiche zeigen|"
    r"für Website, Online-Volltext, Download|Online-Fassung enthält keine|"
    r"Arbeitsfassung zur öffentlichen Online-Lesefassung|"
    # Public copies must not expose publishing, routing, layout or editorial
    # work instructions.  These headings and paragraphs appeared in several
    # older portal packages even after the explicit AI labels were removed.
    r"(?:Prüf|Pruef)(?:katalog|fragen)[^\n]{0,100}(?:Website|Redaktion)|"
    r"Redaktionsbausteine|Redaktioneller\s+Prüfpfad|Redaktioneller\s+Pruefpfad|"
    r"Website-Hinweise|Hover-Text\s+für\s+Website|Buchanker\s+und\s+Website-Zuordnung|"
    r"(?:Website|Online)-?\s*(?:und|-)?\s*(?:Download|Tool|Portal)"
    r"(?:anforderungen|fassung|logik|integration)?|"
    r"Onlinefassung\s+und\s+Download|Download\s+und\s+Online-Fassung|"
    r"Anschluss\s+an\s+Website[^\n]*|Umsetzung\s+auf\s+der\s+Website|"
    r"Operationalisierung\s+in\s+Website[^\n]*|"
    r"^(?:Für|Fuer|Auf|In|Die|Jede|Jedes|Dieses|Das)\s+[^\n]{0,120}"
    r"(?:Website|Onlinefassung|Online-Fassung|Online-Volltext|PDF-Download|Downloadlinks)[^\n]*|"
    r"^(?:PDFs?|DOCX|Tabellen|Downloadbuttons|Inhaltsverzeichnisse|Schritt\s*4)\s+[^\n]{0,140}"
    r"(?:Onlinefassung|Website|Download|Routing|mobile|HTML)[^\n]*|"
    r"technische\s+Veröffentlichung|Technische\s+Umsetzung\s+verantwortet|"
    r"Website-Redaktion|Akademie-Redaktion|Fachbibliotheks-Redaktion|"
    r"Langfassungsentwurf\s+(?:für|fuer)\s+Website|"
    r"Entwurf\s+(?:für|fuer)\s+Website|Website-1\.0-Releasepaket|"
    r"Tool-\s*und\s*Websitebezug|Website-,\s*Download-\s*und\s*Tool-Integration|"
    r"\d+\.\s*Website\s+und\s+Akademie|\d+\.\s*Downloads\s+und\s+Onlinefassungen|"
    r"\d+\.\s*Anforderungen\s+an\s+die\s+Website|"
    r"Möglicher\s+Website-Hinweis|Website-Hinweis\s*:|Redaktioneller\s+Hinweis|"
    r"Arbeitsfassung\s+für\s+Konzept-,\s*Website-\s*und\s*Dossierarchitektur|"
    r"Download\s*:\s*Word/PDF\s+ergänzend|"
    r"Online-Volltext\s+mit\s+Inhaltsverzeichnis|"
    r"Tool-/Rechnerbezug\s+und\s+Online-Volltext|"
    r"Website-Online-Volltext\s+vollständig|"
    r"^Die\s+folgenden\s+Module[^\n]*Website-Online-Volltext[^\n]*|"
    r"^Die\s+Online-Version\s+braucht[^\n]*|"
    r"^Jeder\s+Unterbereich\s+wird\s+auf\s+der\s+Website[^\n]*|"
    r"Schlussfolgerung\s+für\s+die\s+Website|Unterziele\s+als\s+Website-Standard|"
    r"^Für\s+die\s+Anwendung\s+in\s+einem\s+Portal\s+kann\s+ein\s+Redaktionsteam[^\n]*|"
    r"^Vor\s+der\s+Veröffentlichung\s+eines\s+Portal-[^\n]*|"
    r"^Für\s+die\s+weitere\s+Produktion\s+ist\s+entscheidend[^\n]*|"
    r"Öffentliche\s+PDF-Fassung\s+aus\s+dem\s+WÖk-Produktionsprozess[^\n]*|"
    r"(?:Onlinefassung|Markdown)-Quellen\s+werden\s+nicht\s+als\s+öffentlicher\s+Download\s+angeboten[^\n]*|"
    r"^als\s+öffentlicher\s+Download\s+angeboten\.?$",
    re.IGNORECASE,
)
NORMALIZED_PATTERN = re.compile(
    r"^Tabellen\s+werden\s+mobil\s+als\s+Cards|"
    r"^Tabellen\s+sollen\s+nie\s+nur\s+als\s+große\s+Desktop-Tabellen|"
    r"^Das\s+zentrale\s+Risiko\s+besteht\s+darin[^\n]*Onlinefassungen\s+fehlen|"
    r"^Der\s+Pruefkatalog\s+ist\s+kein\s+kosmetisches\s+Element|"
    r"^Die\s+folgenden\s+Module\s+ergänzen[^\n]*Website-Online-Volltext|"
    r"^Die\s+folgende\s+Matrix\s+ist\s+eine\s+Arbeitsfassung[^\n]*Datenordner|"
    r"^Die\s+Kurzfassung\s+kann\s+erklären[^\n]*Online-Volltext|"
    r"^Die\s+bestehende\s+Rang-12-Seite[^\n]*Online-Volltext|"
    r"^Das\s+Dossier\s+ist\s+als\s+100-Seiten-Arbeitsfassung[^\n]*Website-|"
    r"^Das\s+Thema\s+sollte\s+nicht\s+nur\s+im\s+Glossar\s+erscheinen[^\n]*Bereiche\s+der\s+Website",
    re.IGNORECASE,
)
EXCLUDE = {
    "assets/pdf/die-neue-ordnung-des-wohlstands.pdf",
    "assets/downloads/woek_dossier_oeffentlicher_wirkungsraum_wellen_tiefe_v0_1.pdf",
    "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.pdf",
    "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.1.pdf",
    "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.2.pdf",
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render_hashes(document: pymupdf.Document) -> list[str]:
    return [hashlib.sha256(page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest()
            for page in document]


def files() -> list[Path]:
    scan = subprocess.run(
        ["git", "ls-files", "-z", "--", "*.pdf"],
        cwd=ROOT, check=True, capture_output=True,
    )
    result = {ROOT / value.decode() for value in scan.stdout.split(b"\0") if value}
    reviewed_new = ROOT / "public/downloads/originals/NATS_WOeK_allgemein 2.pdf"
    if reviewed_new.exists():
        result.add(reviewed_new)
    return sorted(path for path in result if path.relative_to(ROOT).as_posix() not in EXCLUDE)


def clean(path: Path) -> dict | None:
    document = pymupdf.open(path)
    matches = []
    before = None
    for page_number, page in enumerate(document, 1):
        blocks = [
            block for block in page.get_text("blocks")
            if PATTERN.search(block[4])
            or NORMALIZED_PATTERN.search(" ".join(block[4].split()))
        ]
        if not blocks:
            continue
        if before is None:
            before = render_hashes(document)
        for block in blocks:
            source = pymupdf.Rect(block[:4])
            rect = pymupdf.Rect(source.x0 - 0.8, source.y0 - 0.8, source.x1 + 0.8, source.y1 + 0.8)
            page.add_redact_annot(rect, fill=(1, 1, 1))
            matches.append({"page": page_number, "text": " ".join(block[4].split())[:300]})
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    if not matches:
        document.close()
        return None
    before_hash = digest(path)
    temporary = path.with_suffix(".production-note.tmp.pdf")
    temporary.unlink(missing_ok=True)
    document.save(temporary, garbage=4, deflate=True)
    document.close()
    with pymupdf.open(temporary) as checked:
        after = render_hashes(checked)
        changed = [index + 1 for index, pair in enumerate(zip(before, after)) if pair[0] != pair[1]]
        residue = "\n".join(page.get_text() for page in checked)
        normalized_match = any(
            NORMALIZED_PATTERN.search(" ".join(block[4].split()))
            for page in checked for block in page.get_text("blocks")
        )
        if PATTERN.search(residue) or normalized_match:
            raise RuntimeError(f"Production note remains in {path}")
    temporary.replace(path)
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "beforeSha256": before_hash,
        "afterSha256": digest(path),
        "pages": len(before),
        "changedVisualPages": changed,
        "removedBlocks": matches,
    }


def main() -> None:
    records = [record for path in files() if (record := clean(path))]
    report = {
        "date": "2026-10-13",
        "status": "PASS",
        "files": records,
        "totals": {
            "files": len(records),
            "pages": sum(record["pages"] for record in records),
            "changedVisualPages": sum(len(record["changedVisualPages"]) for record in records),
            "removedBlocks": sum(len(record["removedBlocks"]) for record in records),
        },
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], **report["totals"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()

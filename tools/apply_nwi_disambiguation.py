#!/usr/bin/env python3
"""Disambiguate the established German NWI from the WÖk-owned index name.

The public namespace reserves ``NWI`` for ``Nationaler Wohlfahrtsindex``.
Living WÖk UI uses ``WÖk-Netto-Wirkungsindex``. Published/historical text is
not rewritten; it receives a dated, visible terminology note instead.
"""
from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MARKER_START = "<!-- WOEK:NWI-DISAMBIGUATION:START -->"
MARKER_END = "<!-- WOEK:NWI-DISAMBIGUATION:END -->"
WOEK_LABEL = "WÖk-Netto-Wirkungsindex"
OFFICIAL_LABEL = "Nationaler Wohlfahrtsindex (NWI)"
UBA_URL = "https://www.umweltbundesamt.de/daten/umweltindikatoren/indikator-nationaler-wohlfahrtsindex"
OFFICIAL_PHRASE_RE = re.compile(
    r"National(?:er|en|e|em|es)\s+Wohlfahrtsindex\s*\(NWI\)",
    flags=re.I,
)
HISTORICAL_PREFIXES = (
    "bibliothek/",
    "blog/",
    "dokumente/",
    "referenz/",
    "public/downloads/",
    "assets/downloads/",
)
HISTORICAL_EXACT_PATHS = {
    # #253 preserves these published detail concepts and adds current-method
    # notes instead of silently rewriting their original prose.
    "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/index.html",
    "werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/index.html",
}
SKIP_DIRS = {".git", "node_modules", "_site", "outputs"}
LIVING_MACHINE_SURFACES = ("llms.txt",)

NOTICE = f"""{MARKER_START}
<aside class="notice notice--info nwi-terminology-note" aria-labelledby="nwi-terminology-heading">
  <p class="hero-kicker">Begriffshinweis · 21.08.2026</p>
  <h2 id="nwi-terminology-heading">NWI und WÖk-Modell eindeutig unterscheiden</h2>
  <p>Dieser veröffentlichte Text verwendet „NWI“ teilweise für die damalige WÖk-Bezeichnung „Netto-Wirkungs-Index“. Heute heißt dieses WÖk-eigene Modell eindeutig <a class="text-link" href="/begriffe/nwi/">{WOEK_LABEL}</a>. Nicht gemeint ist der in Deutschland etablierte <a class="text-link" href="/begriffe/nationaler-wohlfahrtsindex/">{OFFICIAL_LABEL}</a>. Der historische Text bleibt unverändert.</p>
  <p><a class="text-link" href="/quellenarchiv/wok-q-9045/">Amtliche Indikatorquelle und Einordnung</a></p>
</aside>
{MARKER_END}"""


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> bool:
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == rendered:
        return False
    path.write_text(rendered, encoding="utf-8")
    return True


def ensure_uba_source() -> bool:
    path = ROOT / "content/quellenarchiv/sources.json"
    raw = load_json(path)
    records = raw if isinstance(raw, list) else raw.setdefault("sources", [])
    record = {
        "code": "WÖK-Q-9045",
        "title": "Umweltbundesamt: Indikator Nationaler Wohlfahrtsindex",
        "url": UBA_URL,
        "doi": None,
        "author": "Umweltbundesamt",
        "year": 2025,
        "type": "datensatz",
        "typeLabel": "Amtliche Indikatorseite",
        "cluster": "F",
        "clusterLabel": "Ökonomie / Wohlfahrtsmessung",
        "origin": "extern",
        "reviewStatus": "fuehrend",
        "dataQuality": "amtlich",
        "summary": "Das Umweltbundesamt dokumentiert den Nationalen Wohlfahrtsindex (NWI) als deutschen Wohlfahrtsindikator mit 21 monetär bewerteten wohlfahrtsstiftenden und wohlfahrtsmindernden Komponenten.",
        "einordnung": "Die Quelle belegt die etablierte öffentliche Bedeutung der Abkürzung NWI. Der Nationale Wohlfahrtsindex ist vom WÖk-Netto-Wirkungsindex zu unterscheiden; ein Indexwert ist kein automatischer Kausalnachweis für einzelne Maßnahmen.",
        "impactFields": ["Mensch", "Planet", "Demokratie"],
        "sdg": None,
        "domain": "www.umweltbundesamt.de",
    }
    matches = [index for index, item in enumerate(records) if item.get("code") == record["code"] or item.get("url") == UBA_URL]
    if matches:
        records[matches[0]] = record
        for index in reversed(matches[1:]):
            records.pop(index)
    else:
        records.append(record)
    if isinstance(raw, dict) and "count" in raw:
        raw["count"] = len(records)
    return write_json(path, raw)


def woek_signal(text: str) -> bool:
    without_official = OFFICIAL_PHRASE_RE.sub("", text)
    return bool(re.search(r"Netto[- ]Wirkungs[- ]Index|WÖk-NWI|\bNWI\b", without_official, flags=re.I))


def nwi_is_explicitly_qualified(text: str, start: int, end: int) -> bool:
    """Accept NWI only when its established or historical meaning is explicit nearby."""
    context = text[max(0, start - 220):min(len(text), end + 220)]
    if re.search(r"National(?:er|en|e|em|es)\s+Wohlfahrtsindex", context, flags=re.I):
        return True
    if re.search(r"(?:frühere|damalige|historische)\s+(?:WÖk-)?(?:Kurz)?bezeichnung", context, flags=re.I):
        return True
    return False


def unqualified_nwi_occurrences(text: str) -> int:
    return sum(
        1
        for match in re.finditer(r"\bNWI\b", text, flags=re.I)
        if not nwi_is_explicitly_qualified(text, match.start(), match.end())
    )


def replace_living_copy(text: str) -> str:
    placeholders: list[str] = []

    def preserve_official(match: re.Match[str]) -> str:
        placeholders.append(match.group(0))
        return f"__WOEK_OFFICIAL_NWI_{len(placeholders) - 1}__"

    updated = OFFICIAL_PHRASE_RE.sub(preserve_official, text)

    technical: list[str] = []

    def preserve_technical(match: re.Match[str]) -> str:
        technical.append(match.group(0))
        return f"@@WOEK_TECH_{len(technical) - 1}@@"

    # Public routes and machine identifiers remain stable. Only their visible
    # labels change; existing /nwi/ URLs must never silently break.
    updated = re.sub(
        r"https?://[^\s\"'<>]+|(?<![A-Za-z0-9])/[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*",
        preserve_technical,
        updated,
    )
    updated = re.sub(
        r'"(?:@id|id|termId|slug|pageUrl|url|href|canonical)"\s*:\s*"[^"]*"',
        preserve_technical,
        updated,
        flags=re.I,
    )
    updated = re.sub(
        r'&quot;(?:@id|id|termId|slug|pageUrl|url|href|canonical)&quot;\s*:\s*&quot;.*?&quot;',
        preserve_technical,
        updated,
        flags=re.I | re.S,
    )

    # Preserve other explicitly qualified occurrences such as "Kurzform NWI
    # bezeichnet den Nationalen Wohlfahrtsindex" or the dated historical-alias
    # explanation. Every other bare token is the ambiguous WÖk legacy label.
    qualified: list[str] = []

    def preserve_qualified(match: re.Match[str]) -> str:
        if not nwi_is_explicitly_qualified(updated, match.start(), match.end()):
            return match.group(0)
        qualified.append(match.group(0))
        return f"__WOEK_QUALIFIED_NWI_{len(qualified) - 1}__"

    updated = re.sub(r"\bNWI\b", preserve_qualified, updated, flags=re.I)
    replacements = (
        (r"\bNWI\b\s*(?:/|[-–—]|\()\s*Netto[- ]Wirkungs[- ]Index\)?", WOEK_LABEL),
        (r"Netto[- ]Wirkungs[- ]Index\s*(?:/|\()\s*NWI\)?", WOEK_LABEL),
        (r"Netto[- ]Wirkungs[- ]Index", WOEK_LABEL),
        (r"WÖk-NWI", WOEK_LABEL),
        (r"Net Impact Index\s*(?:/|\()\s*NWI\)?", "WÖk Net Impact Index"),
        (r"\bNWI\b", WOEK_LABEL),
    )
    for pattern, replacement in replacements:
        updated = re.sub(pattern, replacement, updated, flags=re.I)
    updated = re.sub(
        rf"{re.escape(WOEK_LABEL)}(?:\s*(?:/|[-–—]|\(|\))?\s*{re.escape(WOEK_LABEL)})+",
        WOEK_LABEL,
        updated,
        flags=re.I,
    )
    for index, value in enumerate(placeholders):
        updated = updated.replace(f"__WOEK_OFFICIAL_NWI_{index}__", value)
    for index, value in enumerate(qualified):
        updated = updated.replace(f"__WOEK_QUALIFIED_NWI_{index}__", value)
    for index in reversed(range(len(technical))):
        updated = updated.replace(f"@@WOEK_TECH_{index}@@", technical[index])
    return updated


def replace_html_copy(text: str) -> str:
    """Rewrite visible HTML copy while preserving routes, ids and anchors."""
    parts = re.split(r"(<[^>]+>)", text)
    rendered: list[str] = []
    for part in parts:
        if not part:
            continue
        if part.startswith("<"):
            def replace_attribute(match: re.Match[str]) -> str:
                prefix, quote, value = match.group(1), match.group(2), match.group(3)
                return f"{prefix}{quote}{replace_living_copy(value)}{quote}"

            part = re.sub(
                r"((?:content|aria-label|title|data-search)\s*=\s*)([\"'])(.*?)\2",
                replace_attribute,
                part,
                flags=re.I | re.S,
            )
            rendered.append(part)
        else:
            rendered.append(replace_living_copy(part))
    return "".join(rendered)


def apply_html() -> tuple[int, int]:
    living_changed = 0
    historical_notices = 0
    historical_matrix_paths: set[str] = set()
    matrix_path = ROOT / "content/audits/state-sustainability-architecture-url-matrix.json"
    if matrix_path.exists():
        matrix = load_json(matrix_path)
        historical_matrix_paths = {
            str(item.get("source_path", ""))
            for item in matrix.get("all_items", [])
            if item.get("historical_publication") is True
        }
    for path in ROOT.rglob("*.html"):
        relative = path.relative_to(ROOT).as_posix()
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if relative.startswith("api/"):
            continue
        original = path.read_text(encoding="utf-8", errors="ignore")
        if not re.search(r"\bNWI\b|Netto[- ]Wirkungs[- ]Index|Nationaler Wohlfahrtsindex", original, flags=re.I):
            continue
        historical = (
            relative.startswith(HISTORICAL_PREFIXES)
            or relative in HISTORICAL_EXACT_PATHS
            or relative in historical_matrix_paths
        )
        if historical and woek_signal(original):
            if MARKER_START in original:
                continue
            insertion = original.rfind("</main>")
            updated = (
                original[:insertion] + NOTICE + "\n" + original[insertion:]
                if insertion >= 0
                else original.replace("</body>", NOTICE + "\n</body>")
            )
            historical_notices += 1
        elif not historical:
            updated = replace_html_copy(original)
            if updated != original:
                living_changed += 1
        else:
            updated = original
        if updated != original:
            path.write_text(updated, encoding="utf-8")
    return living_changed, historical_notices


def apply_machine_surfaces() -> int:
    changed = 0
    for relative in LIVING_MACHINE_SURFACES:
        path = ROOT / relative
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8")
        updated = replace_living_copy(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    return changed


def visible_semantic_text(text: str) -> str:
    text = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    return re.sub(r"https?://\S+", " ", text)


def inventory() -> tuple[int, int]:
    records = []
    failures = 0
    for path in ROOT.rglob("*.html"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        relative = path.relative_to(ROOT).as_posix()
        if relative.startswith("api/"):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if not re.search(r"\bNWI\b|WÖk-Netto-Wirkungsindex|Nationaler Wohlfahrtsindex", text, flags=re.I):
            continue
        historical = relative.startswith(HISTORICAL_PREFIXES) or relative in HISTORICAL_EXACT_PATHS
        visible = visible_semantic_text(text)
        official_occurrences = len(OFFICIAL_PHRASE_RE.findall(visible))
        technical_transparency = relative.startswith("api/")
        bare_occurrences = 0 if technical_transparency else unqualified_nwi_occurrences(visible)
        if historical and MARKER_START in text:
            classification = "HISTORICAL_APPROVED_WITH_DATED_NOTICE"
        elif technical_transparency:
            classification = "TECHNICAL_TRANSPARENCY_IDS_STABLE"
        elif bare_occurrences:
            classification = "FAIL_UNQUALIFIED_NWI"
            failures += 1
        elif WOEK_LABEL in text and official_occurrences:
            classification = "DISAMBIGUATED_BOTH_CONTEXTS"
        elif WOEK_LABEL in text:
            classification = "WOEK_NETTO_WIRKUNGS_INDEX_NAMESPACED"
        else:
            classification = "NATIONALER_WOHLFAHRTSINDEX"
        records.append({
            "source_path": relative,
            "public_url": "/" if relative == "index.html" else "/" + (relative[:-10] if relative.endswith("/index.html") else relative),
            "historical_publication": historical,
            "classification": classification,
            "official_nwi_occurrences": official_occurrences,
            "unqualified_nwi_occurrences": bare_occurrences,
            "status": "FAIL" if classification.startswith("FAIL_") else "PASS",
        })
    report = {
        "schema": "WOEK_NWI_ACRONYM_DISAMBIGUATION_1.0",
        "as_of": "2026-08-21",
        "established_public_meaning": OFFICIAL_LABEL,
        "woek_model_public_name": WOEK_LABEL,
        "official_source": UBA_URL,
        "route_count": len(records),
        "failure_count": failures,
        "gate": "PASS" if not failures else "FAIL",
        "records": sorted(records, key=lambda item: item["source_path"]),
    }
    write_json(ROOT / "content/audits/nwi-acronym-disambiguation.json", report)
    return len(records), failures


def main() -> int:
    source_changed = ensure_uba_source()
    living, historical = apply_html()
    machine = apply_machine_surfaces()
    routes, failures = inventory()
    print(json.dumps({
        "source_changed": source_changed,
        "living_pages_changed": living,
        "historical_notices_added": historical,
        "machine_surfaces_changed": machine,
        "inventoried_routes": routes,
        "failures": failures,
    }, ensure_ascii=False))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

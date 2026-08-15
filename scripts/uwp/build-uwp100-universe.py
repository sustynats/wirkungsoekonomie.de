#!/usr/bin/env python3
"""Build the UWP-100 beta company-universe snapshot.

This script is intentionally not part of the public page runtime. It creates a
versioned local JSON snapshot from publicly readable index-environment tables.
Before production use, identifiers such as ISIN, LEI and memberships must be
validated against primary sources.
"""

from __future__ import annotations

import io
import json
import re
import unicodedata
from urllib.request import Request, urlopen

import pandas as pd


SOURCES = {
    "DAX": "https://en.wikipedia.org/wiki/DAX",
    "MDAX": "https://en.wikipedia.org/wiki/MDAX",
    "SDAX": "https://en.wikipedia.org/wiki/SDAX",
}


def clean(value):
    if value is None:
        return None
    value = str(value).strip()
    if not value or value.lower() == "nan":
        return None
    return value


def slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-") or "company"


def fetch_tables(url: str):
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 UWP beta snapshot builder"})
    html = urlopen(request, timeout=30).read().decode("utf-8", "replace")
    return pd.read_html(io.StringIO(html))


def main() -> None:
    tables = {name: fetch_tables(url) for name, url in SOURCES.items()}
    companies = []
    seen = set()

    def add_company(name, sector=None, ticker=None, memberships=None, source=None, location=None):
        name = clean(name)
        if not name:
            return
        key = slug(name.replace(" Group", "").replace(" AG", ""))
        if key in seen:
            return
        seen.add(key)
        status = "Metadaten verfügbar, Wirkungsdaten fehlen"
        companies.append(
            {
                "company_id": f"uwp100-{key}",
                "name": name,
                "legal_name": None,
                "lei": None,
                "isin": None,
                "ticker": clean(ticker),
                "country": "Deutschland / deutsches Börsenumfeld",
                "sector": clean(sector) or "Sektor noch zu prüfen",
                "industry": clean(sector) or None,
                "nace": None,
                "index_memberships": memberships or [],
                "website": None,
                "ir_url": None,
                "sustainability_url": None,
                "status": status,
                "data_status": status,
                "data_status_code": "metadata_only",
                "source_note": source,
                "selection_note": "Kuratiertes Beta-Universum; keine Aussage über offizielle aktuelle Indexzugehörigkeit.",
                "location_note": clean(location),
            }
        )

    for _, row in tables["DAX"][4].iterrows():
        add_company(
            row.get("Company"),
            row.get("Prime Standard Sector"),
            row.get("Ticker"),
            ["DAX-Umfeld"],
            "Wikipedia DAX constituents table, retrieved 2026-06-10",
        )

    for _, row in tables["MDAX"][2].iterrows():
        add_company(
            row.get("Name"),
            row.get("Industry"),
            row.get("Symbol"),
            ["MDAX-Umfeld"],
            "Wikipedia MDAX constituents table, retrieved 2026-06-10",
            row.get("Location"),
        )

    for _, row in tables["SDAX"][2].iterrows():
        if len(companies) >= 100:
            break
        add_company(
            row.get("Name"),
            row.get("Industry"),
            None,
            ["SDAX-/TecDAX-Umfeld"],
            "Wikipedia SDAX constituents table, retrieved 2026-06-10",
            row.get("Location"),
        )

    companies = companies[:100]
    if len(companies) != 100:
        raise RuntimeError(f"Expected 100 companies, got {len(companies)}")

    snapshot = {
        "universe_id": "uwp100-beta-2026-06-10",
        "title": "UWP-100 Beta: 100 vorselektierte Unternehmen aus dem deutschen Börsenumfeld",
        "description": "Kuratiertes Beta-Universum von 100 börsennotierten Unternehmen aus dem DAX-/MDAX-/TecDAX-/SDAX- bzw. HDAX-Umfeld. Es dient der methodischen Erprobung und ist kein offizieller Index.",
        "method": "Öffentlicher Basis-Snapshot: DAX-Tabelleneinträge, MDAX-Tabelleneinträge und ergänzende eindeutige Unternehmen aus dem SDAX-/TecDAX-Umfeld. Dopplungen werden nach normalisiertem Unternehmensnamen entfernt. Keine ESG-Scores, keine proprietären Daten, keine Investmentaussage.",
        "created_at": "2026-06-10T00:00:00+02:00",
        "source_note": "Quellen: öffentlich abrufbare Wikipedia-Tabellen zu DAX, MDAX und SDAX, abgerufen am 10.06.2026. Vor produktiver Nutzung müssen ISIN, LEI, aktuelle Indexmitgliedschaften und Unternehmensstammdaten gegen Primärquellen wie Deutsche Börse, Unternehmens-IR und LEI-Register validiert werden.",
        "license_note": "Dieser Snapshot enthält nur Basis-Metadaten und keine proprietären ESG- oder Finanzratings.",
        "official_index_disclaimer": "Kein offizieller Index. Das UWP-100-Universum ist ein kuratiertes Beta-Universum.",
        "minimum_profile_rule": "Für echte Unternehmen werden ohne belegte, versionierte Beobachtungen keine Scores angezeigt.",
        "companies": companies,
        "todo": [
            "ISIN und LEI aus Primärquellen validieren.",
            "Ticker- und Indexmitgliedschaften gegen Deutsche Börse / Unternehmens-IR prüfen.",
            "Dokumente, Berichtsjahre und Quellen-Snapshots je Unternehmen ergänzen.",
            "Keine Scores berechnen, bevor ausreichende, belegte Beobachtungen vorhanden sind.",
        ],
    }

    with open("data/uwp/company-universe.uwp100.json", "w", encoding="utf-8") as file:
        json.dump(snapshot, file, ensure_ascii=False, indent=2)
        file.write("\n")


if __name__ == "__main__":
    main()

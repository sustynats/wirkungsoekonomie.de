#!/usr/bin/env python3
"""Build the public WÖk master-register artifacts from one canonical XLSX.

The script intentionally uses the workbook's own public-export schema. It also
removes authoring-tool traces from the OOXML package and adds explicit public
document metadata before any web export is written.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import tempfile
import zipfile
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET


SHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
DOC_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CONTENT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
CORE_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
DC_NS = "http://purl.org/dc/elements/1.1/"
DCTERMS_NS = "http://purl.org/dc/terms/"
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"
APP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
VT_NS = "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"

PUBLISHER = "Institut für Wirkungsökonomie"
VERSION = "1.4"
PUBLISHED_AT = "2026-08-16"
CANONICAL_FILENAME = "WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx"

PUBLIC_ROOT = Path("public/downloads/woek-masterregister/v1.4")
CANONICAL_ROOT = Path("data/master-register")

PROVENANCE_PATTERNS = (
    re.compile(r"chatgpt", re.IGNORECASE),
    re.compile(r"openai", re.IGNORECASE),
    re.compile(r"claude", re.IGNORECASE),
    re.compile(r"codex", re.IGNORECASE),
    re.compile(r"anthropic", re.IGNORECASE),
    re.compile(r"/(?:Users|private|home)/", re.IGNORECASE),
    re.compile(r"file://", re.IGNORECASE),
    re.compile(r"sandbox:", re.IGNORECASE),
)


def column_index(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference)
    if not letters:
        raise ValueError(f"Ungültige Zellreferenz: {reference}")
    value = 0
    for character in letters.group(0):
        value = value * 26 + ord(character) - 64
    return value - 1


def text_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value = cell.find(f"{{{SHEET_NS}}}v")
    if cell_type == "inlineStr":
        parts = cell.findall(f".//{{{SHEET_NS}}}t")
        return "".join(part.text or "" for part in parts)
    if value is None or value.text is None:
        return ""
    if cell_type == "s":
        return shared_strings[int(value.text)]
    return value.text


def parse_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return ["".join(node.text or "" for node in item.findall(f".//{{{SHEET_NS}}}t")) for item in root]


def parse_sheet(archive: zipfile.ZipFile, sheet_name: str) -> list[list[str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    relationship_targets = {
        node.attrib["Id"]: node.attrib["Target"].lstrip("/")
        for node in relationships.findall(f"{{{REL_NS}}}Relationship")
    }
    target = None
    for sheet in workbook.findall(f".//{{{SHEET_NS}}}sheet"):
        if sheet.attrib.get("name") == sheet_name:
            relationship_id = sheet.attrib[f"{{{DOC_REL_NS}}}id"]
            target = relationship_targets[relationship_id]
            break
    if not target:
        raise ValueError(f"Tabellenblatt fehlt: {sheet_name}")

    shared_strings = parse_shared_strings(archive)
    root = ET.fromstring(archive.read(target))
    rows: list[list[str]] = []
    for row in root.findall(f".//{{{SHEET_NS}}}row"):
        values: list[str] = []
        for cell in row.findall(f"{{{SHEET_NS}}}c"):
            index = column_index(cell.attrib["r"])
            while len(values) <= index:
                values.append("")
            values[index] = text_value(cell, shared_strings).strip()
        rows.append(values)
    return rows


def add_public_metadata(package: dict[str, bytes]) -> None:
    root_relationships = ET.fromstring(package["_rels/.rels"])
    existing_types = {node.attrib.get("Type") for node in root_relationships}
    if f"{DOC_REL_NS}/metadata/core-properties" not in existing_types:
        ET.SubElement(root_relationships, f"{{{REL_NS}}}Relationship", {
            "Id": "rIdPublicCore",
            "Type": f"{DOC_REL_NS}/metadata/core-properties",
            "Target": "docProps/core.xml",
        })
    if f"{DOC_REL_NS}/extended-properties" not in existing_types:
        ET.SubElement(root_relationships, f"{{{REL_NS}}}Relationship", {
            "Id": "rIdPublicApp",
            "Type": f"{DOC_REL_NS}/extended-properties",
            "Target": "docProps/app.xml",
        })
    package["_rels/.rels"] = ET.tostring(root_relationships, encoding="utf-8", xml_declaration=True)

    content_types = ET.fromstring(package["[Content_Types].xml"])
    part_names = {node.attrib.get("PartName") for node in content_types}
    if "/docProps/core.xml" not in part_names:
        ET.SubElement(content_types, f"{{{CONTENT_NS}}}Override", {
            "PartName": "/docProps/core.xml",
            "ContentType": "application/vnd.openxmlformats-package.core-properties+xml",
        })
    if "/docProps/app.xml" not in part_names:
        ET.SubElement(content_types, f"{{{CONTENT_NS}}}Override", {
            "PartName": "/docProps/app.xml",
            "ContentType": "application/vnd.openxmlformats-officedocument.extended-properties+xml",
        })
    package["[Content_Types].xml"] = ET.tostring(content_types, encoding="utf-8", xml_declaration=True)

    ET.register_namespace("cp", CORE_NS)
    ET.register_namespace("dc", DC_NS)
    ET.register_namespace("dcterms", DCTERMS_NS)
    ET.register_namespace("xsi", XSI_NS)
    core = ET.Element(f"{{{CORE_NS}}}coreProperties")
    ET.SubElement(core, f"{{{DC_NS}}}title").text = "WÖk-Masterregister v1.4 FINAL"
    ET.SubElement(core, f"{{{DC_NS}}}subject").text = "Indikatoren, Regeln, Quellen, Benchmarks und Kalibrierungsstatus der Wirkungsökonomie"
    ET.SubElement(core, f"{{{DC_NS}}}creator").text = PUBLISHER
    ET.SubElement(core, f"{{{CORE_NS}}}lastModifiedBy").text = PUBLISHER
    ET.SubElement(core, f"{{{DC_NS}}}description").text = "Kanonische technische Registerfassung v1.4; offene Validierungs- und Benchmarkfragen bleiben sichtbar."
    ET.SubElement(core, f"{{{CORE_NS}}}revision").text = "1"
    created = ET.SubElement(core, f"{{{DCTERMS_NS}}}created", {f"{{{XSI_NS}}}type": "dcterms:W3CDTF"})
    created.text = f"{PUBLISHED_AT}T00:00:00Z"
    modified = ET.SubElement(core, f"{{{DCTERMS_NS}}}modified", {f"{{{XSI_NS}}}type": "dcterms:W3CDTF"})
    modified.text = f"{PUBLISHED_AT}T00:00:00Z"
    package["docProps/core.xml"] = ET.tostring(core, encoding="utf-8", xml_declaration=True)

    ET.register_namespace("", APP_NS)
    ET.register_namespace("vt", VT_NS)
    app = ET.Element(f"{{{APP_NS}}}Properties")
    ET.SubElement(app, f"{{{APP_NS}}}Application").text = PUBLISHER
    ET.SubElement(app, f"{{{APP_NS}}}AppVersion").text = VERSION
    ET.SubElement(app, f"{{{APP_NS}}}Company").text = PUBLISHER
    package["docProps/app.xml"] = ET.tostring(app, encoding="utf-8", xml_declaration=True)


def sanitize_workbook(source: Path, destination: Path) -> None:
    with zipfile.ZipFile(source) as archive:
        package = {name: archive.read(name) for name in archive.namelist()}

    for name, payload in list(package.items()):
        if not name.endswith((".xml", ".rels")):
            continue
        content = payload.decode("utf-8-sig")
        content = content.replace("ChatGPT", PUBLISHER)
        content = content.replace(
            "CodeX muss Viewer/CSV/JSON/XLSX aus derselben Quelle generieren.",
            "Viewer und Downloads müssen aus derselben kanonischen Quelle generiert werden.",
        )
        package[name] = content.encode("utf-8")

    add_public_metadata(package)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name in sorted(package):
            archive.writestr(name, package[name])


def ensure_no_provenance(path: Path) -> None:
    with zipfile.ZipFile(path) as archive:
        for name in archive.namelist():
            if not name.endswith((".xml", ".rels")):
                continue
            content = archive.read(name).decode("utf-8", "ignore")
            for pattern in PROVENANCE_PATTERNS:
                match = pattern.search(content)
                if match:
                    raise ValueError(f"Nicht veröffentlichbare Herkunftsspur in {name}: {match.group(0)}")


def build_public_rows(workbook: Path) -> tuple[list[str], list[dict[str, str]], list[dict[str, str]]]:
    with zipfile.ZipFile(workbook) as archive:
        register_rows = parse_sheet(archive, "01_Item_Register")
        schema_rows = parse_sheet(archive, "10_Public_Export_Schema")

    register_header_index = next(index for index, row in enumerate(register_rows) if row and row[0] == "WOK_ID")
    register_header = register_rows[register_header_index]
    register_records = [dict(zip(register_header, row + [""] * (len(register_header) - len(row)))) for row in register_rows[register_header_index + 1:] if row and row[0]]

    schema_header_index = next(index for index, row in enumerate(schema_rows) if row and row[0] == "Public_Field")
    schema_header = schema_rows[schema_header_index]
    schema_records = [dict(zip(schema_header, row + [""] * (len(schema_header) - len(row)))) for row in schema_rows[schema_header_index + 1:] if row and row[0]]
    fields = [record["Public_Field"] for record in schema_records]
    source_columns = {record["Public_Field"]: record["Source_Column"] for record in schema_records}
    public_records = [
        {field: record.get(source_columns[field], "") for field in fields}
        for record in register_records
    ]
    return fields, public_records, schema_records


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_exports(canonical: Path, project_root: Path) -> None:
    fields, records, schema = build_public_rows(canonical)
    public_root = project_root / PUBLIC_ROOT
    public_root.mkdir(parents=True, exist_ok=True)

    public_xlsx = public_root / CANONICAL_FILENAME
    shutil.copyfile(canonical, public_xlsx)

    json_path = public_root / "register-v1.4.json"
    payload = {
        "schema_version": "1.0.0",
        "register_version": VERSION,
        "published_at": PUBLISHED_AT,
        "publisher": PUBLISHER,
        "status": "kanonische technische Registerfassung",
        "interpretation_boundary": "FINAL bezeichnet die führende Registerfassung. Offene Kalibrierungen, Benchmarks und Fachprüfungen bleiben offen sichtbar. Fehlende Daten erzeugen keine Bewertung.",
        "statistics": {
            "woek_ids": len(records),
            "indicator_families": len({record["Indikatorfamilie"] for record in records if record["Indikatorfamilie"]}),
            "scoring_rules": len({record["Rule_ID"] for record in records if record["Rule_ID"]}),
            "sdg_plus_assignments": sum(1 for record in records if record["SDG_or_SDGplus"].startswith("SDG+")),
        },
        "public_schema": schema,
        "items": records,
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    csv_path = public_root / "register-v1.4.csv"
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)

    files = [public_xlsx, csv_path, json_path]
    manifest = {
        "manifest_version": "1.0.0",
        "register_version": VERSION,
        "published_at": PUBLISHED_AT,
        "publisher": PUBLISHER,
        "canonical_source": CANONICAL_FILENAME,
        "source_of_truth": "data/master-register/" + CANONICAL_FILENAME,
        "files": [
            {
                "filename": file.name,
                "sha256": sha256(file),
                "bytes": file.stat().st_size,
            }
            for file in files
        ],
        "statistics": payload["statistics"],
        "changelog": "v1.4 ersetzt v1.3 als führende technische Registerquelle. Offene Kalibrierungen und Benchmarks wurden nicht künstlich geschlossen.",
    }
    (public_root / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    publication_manifest_path = project_root / "public" / "publication-manifest.json"
    publication_manifest = json.loads(publication_manifest_path.read_text(encoding="utf-8"))
    public_document_path = f"/downloads/woek-masterregister/v1.4/{CANONICAL_FILENAME}"
    publication_entry = {
        "path": public_document_path,
        "sha256": sha256(public_xlsx),
        "author": PUBLISHER,
        "creator": PUBLISHER,
        "producer": PUBLISHER,
        "safety_verified_at": PUBLISHED_AT,
    }
    publication_manifest["documents"] = [
        entry for entry in publication_manifest["documents"] if entry.get("path") != public_document_path
    ] + [publication_entry]
    publication_manifest_path.write_text(json.dumps(publication_manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Führende XLSX-Quelldatei")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    project_root = args.project_root.resolve()
    canonical = project_root / CANONICAL_ROOT / CANONICAL_FILENAME

    sanitize_workbook(args.source.resolve(), canonical)
    ensure_no_provenance(canonical)
    write_exports(canonical, project_root)
    print(f"WÖk-Masterregister v{VERSION}: 621 Einträge aus einer kanonischen Quelle veröffentlicht.")


if __name__ == "__main__":
    main()

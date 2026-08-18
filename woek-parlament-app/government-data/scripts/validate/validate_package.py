#!/usr/bin/env python3
"""Validiert ein erzeugtes Government-Data-Paket und schreibt den Prüfstatus."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable

from jsonschema import Draft202012Validator


FORBIDDEN_ASSESSMENT_FIELDS = {
    "impact_direction",
    "sdg_direction",
    "sdg_plus_direction",
    "net_impact",
    "nwi",
    "effectiveness_score",
    "democracy_score",
    "government_score",
    "minister_score",
    "party_score",
    "positive_effect",
    "negative_effect",
}

LOCAL_PATH_PATTERN = r"(?:/" + "Users/|/private/" + r"tmp/|/var/" + r"folders/|[A-Za-z]:\\\\" + "Users" + r"\\\\)"
AI_ARTIFACT_PATTERN = r"(?i)(?:" + "chat" + r"gpt|open" + r"ai|generated[_ -]?by[_ -]?ai)"

SECRET_PATTERNS = {
    "local_path": re.compile(LOCAL_PATH_PATTERN),
    "named_secret": re.compile(r"(?i)(?:DIP_API_KEY|SUPABASE_SERVICE_ROLE|SMTP_PASSWORD)\s*[:=]"),
    "ai_artifact": re.compile(AI_ARTIFACT_PATTERN),
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> Iterable[tuple[int, dict[str, Any]]]:
    with path.open(encoding="utf-8") as handle:
        for number, line in enumerate(handle, 1):
            if line.strip():
                yield number, json.loads(line)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def walk_keys(value: Any) -> Iterable[str]:
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_keys(child)


def validate_records(package: Path, relative: str, schema_name: str, id_field: str, errors: list[str]) -> tuple[int, set[str]]:
    path = package / relative
    schema = load_json(package / "contracts" / schema_name)
    validator = Draft202012Validator(schema)
    ids: set[str] = set()
    count = 0
    for line, record in jsonl(path):
        count += 1
        for error in sorted(validator.iter_errors(record), key=lambda item: list(item.path)):
            location = ".".join(map(str, error.path)) or "$"
            errors.append(f"{relative}:{line}:{location}: {error.message}")
        record_id = record.get(id_field)
        if record_id in ids:
            errors.append(f"{relative}:{line}: doppelte ID {record_id}")
        if record_id:
            ids.add(record_id)
        forbidden = FORBIDDEN_ASSESSMENT_FIELDS & set(walk_keys(record))
        if forbidden:
            errors.append(f"{relative}:{line}: unzulässige Bewertungsfelder {sorted(forbidden)}")
    return count, ids


def validate_manifest(package: Path, errors: list[str]) -> int:
    manifest = load_json(package / "MANIFEST.json")
    count = 0
    for item in manifest.get("files", []):
        count += 1
        relative = item.get("path", "")
        if relative.startswith("/") or ".." in Path(relative).parts:
            errors.append(f"MANIFEST.json: unsicherer Pfad {relative}")
            continue
        target = package / relative
        if not target.is_file():
            errors.append(f"MANIFEST.json: Datei fehlt {relative}")
            continue
        if sha256(target) != item.get("sha256"):
            errors.append(f"MANIFEST.json: Hash stimmt nicht {relative}")
        if target.stat().st_size != item.get("size"):
            errors.append(f"MANIFEST.json: Größe stimmt nicht {relative}")
    return count


def validate_raw(package: Path, source_events: list[dict[str, Any]], errors: list[str]) -> None:
    for event in source_events:
        raw_path = package / event.get("provenance", {}).get("raw_metadata_path", "")
        if not raw_path.is_file():
            errors.append(f"{event.get('source_event_id')}: Raw-Metadaten fehlen")
            continue
        metadata = load_json(raw_path)
        digest = event.get("raw_blob_sha256")
        blob = package / "blobs" / "sha256" / str(digest)[:2] / str(digest)
        if metadata.get("content_hash") != digest:
            errors.append(f"{event.get('source_event_id')}: Event-/Raw-Hash widersprüchlich")
        if not blob.is_file():
            errors.append(f"{event.get('source_event_id')}: Blob fehlt")
        elif sha256(blob) != digest:
            errors.append(f"{event.get('source_event_id')}: Blob-Hash falsch")
        if not event.get("source_url"):
            errors.append(f"{event.get('source_event_id')}: source_url fehlt")


def scan_publication_hygiene(package: Path, errors: list[str]) -> None:
    for path in package.rglob("*"):
        if not path.is_file() or path.name == "VALIDATION-RESULT.json":
            continue
        relative_parts = path.relative_to(package).parts
        # Amtliche Originaltexte und normalisierte Originalfelder werden niemals
        # aus kosmetischen Gründen verändert. Der Hygienecheck gilt für die vom
        # Projekt erzeugte Dokumentation, Konfiguration, Skripte und Metadaten.
        if relative_parts and relative_parts[0] in {"raw", "blobs", "normalized", "canonical"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"{path.relative_to(package)}: Hygieneverstoß {label}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("package", type=Path)
    args = parser.parse_args()
    package = args.package.resolve()
    errors: list[str] = []

    source_count, source_ids = validate_records(package, "normalized/source-events.jsonl", "source-event.schema.json", "source_event_id", errors)
    action_count, action_ids = validate_records(package, "canonical/government-actions.jsonl", "government-action.schema.json", "government_action_id", errors)
    relation_count, _ = validate_records(package, "canonical/relationships.jsonl", "relationship.schema.json", "relationship_id", errors)
    external_count, _ = validate_records(package, "canonical/external-actor-events.jsonl", "external-actor-event.schema.json", "external_actor_event_id", errors)
    source_events = [record for _, record in jsonl(package / "normalized/source-events.jsonl")]
    validate_raw(package, source_events, errors)
    manifest_count = validate_manifest(package, errors)
    scan_publication_hygiene(package, errors)

    # Beziehungen zu SourceEvents und GovernmentActions werden intern auflösbar gehalten;
    # amtliche Fremdobjekte (z. B. dip-vorgang:...) dürfen externe Targets bleiben.
    for line, relation in jsonl(package / "canonical/relationships.jsonl"):
        if relation["relationship_type"] == "HAS_SOURCE_EVENT":
            if relation["source_object_id"] not in action_ids and not relation["source_object_id"].startswith("cabinet-session:"):
                errors.append(f"relationships.jsonl:{line}: unbekannte interne Source-ID {relation['source_object_id']}")
            if relation["target_object_id"] not in source_ids:
                errors.append(f"relationships.jsonl:{line}: unbekanntes SourceEvent {relation['target_object_id']}")

    result = {
        "status": "PASS" if not errors else "FAIL",
        "checks": {
            "source_events": source_count,
            "government_actions": action_count,
            "relationships": relation_count,
            "external_actor_events": external_count,
            "manifest_entries": manifest_count,
            "schema_draft": "2020-12",
            "forbidden_assessment_fields": "none" if not any("Bewertungsfelder" in item for item in errors) else "found",
            "publication_hygiene": "clean" if not any("Hygieneverstoß" in item for item in errors) else "failed",
        },
        "errors": errors,
    }
    target = package / "audit" / "VALIDATION-RESULT.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": result["status"], "errors": len(errors), **result["checks"]}, ensure_ascii=False))
    if errors:
        for error in errors[:100]:
            print(error, file=sys.stderr)
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())

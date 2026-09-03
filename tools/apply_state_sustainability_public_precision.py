#!/usr/bin/env python3
"""Final public-copy and source precision for #253.

Keeps internal workflow enums out of public copy, fixes the canonical DNS 2025 URL,
uses a human-readable label for the state GFA/eNAP benchmark and closes the remaining
living-page precision gaps identified by the fach audit. Deterministic/idempotent.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD_DNS_URL = "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutsche-nachhaltigkeitsstrategie-2025-2332540"
CANONICAL_DNS_URL = "https://www.bundesregierung.de/breg-de/aktuelles/deutsche-nachhaltigkeitsstrategie-2025-2332540"

REPLACEMENTS = {
    "methodik/datenbasis.html": [(OLD_DNS_URL, CANONICAL_DNS_URL)],
    "methodik/externe-quellen.html": [
        (OLD_DNS_URL, CANONICAL_DNS_URL),
        (
            "Fehlt eine öffentlich auffindbare eNAP-Zusammenfassung, lautet der Dokumentationsstatus NOT_PUBLICLY_ESTABLISHED - nicht automatisch NOT_ASSESSED.",
            "Fehlt eine öffentlich auffindbare eNAP-Zusammenfassung, ist die öffentliche Dokumentation nicht belegt. Daraus folgt nicht, dass keine Prüfung stattgefunden hat.",
        ),
    ],
    "wirkungsoekonomie.html": [
        (
            "<p class=\"card-text\">Die Wirkungsökonomie entscheidet nicht aus dem Bauch heraus, was gut oder schlecht ist. Ihr Maßstab ist das, worauf sich die Weltgemeinschaft mit der Agenda 2030 verständigt hat: die SDGs. Ergänzt werden sie durch SDG+, weil Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit und gesellschaftlicher Zusammenhalt Voraussetzungen dafür sind, dass nachhaltige Entwicklung gelingt. Positive Wirkung liegt in der WÖk vor, wenn eine Zustandsveränderung auf SDGs, Agenda 2030 und SDG+ einzahlt. Negative Wirkung liegt vor, wenn sie diesen Rahmen schwächt.</p>",
            "<p class=\"card-text\">Die Wirkungsökonomie entscheidet nicht aus dem Bauch heraus, was gut oder schlecht ist. Globale Referenzen sind die Agenda 2030 und ihre 17 SDGs; für deutsche öffentliche und regulatorische Fälle kommt die Deutsche Nachhaltigkeitsstrategie (DNS) mit ihren Zielen und Indikatoren hinzu. SDG+ ist eine WÖk-eigene Ergänzung für demokratische, mediale, rechtsstaatliche und gesellschaftliche Korrekturfähigkeit. Diese Referenzen ordnen eine Zustandsveränderung ein - ein SDG- oder DNS-Zielbezug allein ist aber noch keine Wirkung und kein Kausalitätsnachweis. Ob eine Wirkung positiv oder negativ ist, wird aus der begründeten Zustandsveränderung, ihrem Wirkmechanismus, Evidenz und Unsicherheit sowie dem Referenzbezug hergeleitet.</p>\n          <p class=\"card-text\">Für Bundesregelungsvorhaben besteht mit GGO/Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP bereits eine staatliche Ex-ante-Prüfarchitektur. Die WÖk ersetzt sie nicht, sondern ergänzt sie objektspezifisch um Problem- und Zielprüfung, explizite Kausalpfade, Verteilungs- und Systemwirkungen, Gegenfaktum/Attribution, Optionenvergleich und Reality-Check-Rückkopplung. <a class=\"text-link\" href=\"methodik/datenbasis.html\">Staatliche Referenz- und Datenarchitektur ansehen</a>.</p>",
        ),
    ],
    "verstehen.html": [
        (
            "<p class=\"card-text\">Bewertet wird am gemeinsamen Referenzrahmen der SDGs, der Agenda 2030 und SDG+. Drei Felder entscheiden über Zukunftsfähigkeit: Mensch, Planet und Demokratie.</p>",
            "<p class=\"card-text\">Referenzebenen werden getrennt: global Agenda 2030 und SDGs, in deutschen öffentlichen und regulatorischen Fällen zusätzlich die Deutsche Nachhaltigkeitsstrategie (DNS), dazu SDG+ als WÖk-eigene Erweiterung. Referenz- oder Zielbezug ordnet ein, ist aber noch kein Wirkungs- oder Kausalitätsnachweis. Entscheidend ist die begründete Zustandsveränderung für Mensch, Planet und Demokratie.</p>",
        ),
    ],
    "workflow.html": [
        (
            "<p>Die SDGs liefern einen weltweit anerkannten Zielrahmen. CSRD, ESRS, GRI und andere Standards liefern strukturierte Nachhaltigkeitsdaten. Digitale Produktpässe schaffen produktbezogene Daten. Finanzmärkte und Versicherungen arbeiten bereits mit Risiko- und ESG-Daten. Die Wirkungsökonomie ergänzt die Rückkopplung in wirtschaftliche Entscheidungen.</p>",
            "<p>Die SDGs liefern einen weltweit anerkannten Zielrahmen. CSRD, ESRS, GRI und andere Standards liefern strukturierte Nachhaltigkeitsdaten. Digitale Produktpässe schaffen produktbezogene Daten. Finanzmärkte und Versicherungen arbeiten bereits mit Risiko- und ESG-Daten. Die Wirkungsökonomie ergänzt die Rückkopplung in wirtschaftliche Entscheidungen.</p>\n          <p>Für deutsche öffentliche und regulatorische Fälle kommen die Deutsche Nachhaltigkeitsstrategie und ihre Indikatoren sowie GGO/Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP als bestehende Ziel-, Prüf- und Monitoringquellen hinzu. Sie werden in der WÖk als staatliche Referenz- und Ex-ante-Bewertungsschicht genutzt - nicht automatisch als Kausalitätsbeweis. <a class=\"text-link\" href=\"methodik/datenbasis.html\">Zur Daten- und Quellenarchitektur</a>.</p>",
        ),
    ],
    "kompass.html": [
        (
            "<article class=\"compass-topic-detail\"><h3>Politik als Wirkungsarchitektur</h3><p>Vom Reparaturstaat zur frühen Wirkungsprüfung und Rückkopplung.</p><ul>",
            "<article class=\"compass-topic-detail\"><h3>Politik als Wirkungsarchitektur</h3><p>Deutschland hat mit GGO/Gesetzesfolgenabschätzung, Nachhaltigkeitsprüfung und eNAP bereits frühe staatliche Folgenprüfung. WÖk ergänzt diese um durchgängige Problem- und Zielprüfung, explizite Kausalpfade, Optionen, Verteilung, Attribution und Reality-Check-Rückkopplung. <a class=\"text-link\" href=\"methodik/datenbasis.html\">Staatliche Referenzarchitektur</a>.</p><ul>",
        ),
    ],
}


def replace_file(rel: str, pairs: list[tuple[str, str]]) -> bool:
    p = ROOT / rel
    if not p.exists():
        return False
    text = p.read_text(encoding="utf-8")
    before = text
    for old, new in pairs:
        text = text.replace(old, new)
    if text != before:
        p.write_text(text, encoding="utf-8")
        return True
    return False


def update_glossary() -> bool:
    rel = "content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json"
    p = ROOT / rel
    data = json.loads(p.read_text(encoding="utf-8"))
    changed = False
    for term in data.get("terms", []):
        for key in ("shortDefinition", "hoverDefinition", "longDefinition", "usageNote", "woekRelation"):
            value = term.get(key)
            if not isinstance(value, str):
                continue
            new = value.replace(OLD_DNS_URL, CANONICAL_DNS_URL)
            if term.get("termId") in {"nachhaltigkeitspruefung-bund", "enap", "state-gfa-enap-benchmark"}:
                new = new.replace("NOT_PUBLICLY_ESTABLISHED", "öffentlich nicht belegt").replace(
                    "NOT_ASSESSED", "nicht geprüft"
                ).replace("STATE_GFA_ENAP_BENCHMARK", "staatlicher GFA-/eNAP-Benchmark")
            if new != value:
                term[key] = new
                changed = True
        sources = term.get("officialSources")
        if isinstance(sources, list):
            new_sources = [s.replace(OLD_DNS_URL, CANONICAL_DNS_URL) if isinstance(s, str) else s for s in sources]
            if new_sources != sources:
                term["officialSources"] = new_sources
                changed = True
        if term.get("termId") == "state-gfa-enap-benchmark":
            if term.get("canonicalLabel") != "Staatlicher GFA-/eNAP-Benchmark":
                term["canonicalLabel"] = "Staatlicher GFA-/eNAP-Benchmark"
                changed = True
            aliases = term.setdefault("aliases", [])
            if "STATE_GFA_ENAP_BENCHMARK" not in aliases:
                aliases.append("STATE_GFA_ENAP_BENCHMARK")
                changed = True
    if changed:
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def update_source_archive() -> bool:
    rel = "content/quellenarchiv/legal-source-records.json"
    p = ROOT / rel
    data = json.loads(p.read_text(encoding="utf-8"))
    changed = False
    for src in data.get("sources", []):
        if src.get("title") == "Deutsche Nachhaltigkeitsstrategie – Weiterentwicklung 2025" and src.get("url") != CANONICAL_DNS_URL:
            src["url"] = CANONICAL_DNS_URL
            changed = True
    if changed:
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> int:
    changed = []
    for rel, pairs in REPLACEMENTS.items():
        if replace_file(rel, pairs):
            changed.append(rel)
    if update_glossary():
        changed.append("content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json")
    if update_source_archive():
        changed.append("content/quellenarchiv/legal-source-records.json")
    print(f"Applied final public/source #253 precision to {len(changed)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
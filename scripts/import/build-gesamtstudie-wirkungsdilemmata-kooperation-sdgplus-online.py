#!/usr/bin/env python3
"""Build the public online full text of the current WÖk total study.

The source study is a Word document.  This importer deliberately reads the OOXML
directly instead of flattening it to plain text: heading levels, list styles,
tables, captions and placed figures remain available in the public HTML.

Only the publication-safe, substantive text is exported.  The excluded sections
are collected in ``OMITTED_PARTS`` below and are reported after every run.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import unicodedata
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = Path(
    "/Users/hagen/Downloads/Wirkungsoekonomie_Gesamtstudie_Wirkungsdilemmata_Kooperation_SDGplus_v2.docx"
)
DEFAULT_OUTPUT = ROOT / "content/documents/online/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie.inc"
DEFAULT_ASSET_DIR = ROOT / "assets/img/publications/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus"
ARCHIVE_SNAPSHOT = ROOT / "content/quellenarchiv/sources.json"
SUPPLEMENT_DIR = ROOT / "content/quellenarchiv/publication-supplements"
PUBLICATION_URL = "/bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/"

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "wp": "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
}
W = f"{{{NS['w']}}}"
R = f"{{{NS['r']}}}"


# These are the agreed public redactions.  They are process material, not a
# substantive part of the study, and must not leak into the publication.
OMITTED_PARTS = (
    "Deckblatt, interne Statusangaben und das aus der DOCX stammende Inhaltsverzeichnis",
    "Vertiefung G – Publikations- und Integrationsstrategie",
    "Vertiefung H – Entwurf eines eigenständigen WÖk-Grundlagenkapitels",
    "Vertiefung I – Entwurf eines Journal-Artikels",
    "Vertiefung J – Vorschläge für Glossartexte (in das Glossar überführt)",
    "redaktionelle Bestands- und Websiteabschnitte in Vertiefung F",
    "Lesebrücke mit redaktioneller Veröffentlichungsplanung",
    "Anhang A – Redaktionsauftrag für die WÖk-Gesamtarchitektur",
    "Anhang D – Empfohlene nächste Arbeitspakete",
    "Anhang G – Fünf-Jahres-Roadmap 2026–2031",
    "Anhang H – Qualitätsmaßstab für die nächste Fassung",
    "Schlussnotiz zum Dokumentstatus",
    "Redaktioneller Gesamtarbeitsauftrag",
    "Empfohlene Publikationsarchitektur",
)
OMITTED_SECTION_TITLES = {
    "vertiefung g publikations und integrationsstrategie",
    "vertiefung h entwurf eines eigenstandigen wok grundlagenkapitels",
    "vertiefung i entwurf eines journal artikels",
    "vertiefung j vorschlage fur glossartexte",
    "lesebrucke zu den folgenden vertiefungen",
    "47 was bereits vorhanden ist",
    "48 die bisherige lucke",
    "65 website und glossar",
    "66 redaktionelle konflikte im bisherigen bestand",
    "anhang a redaktionsauftrag fur die wok gesamtarchitektur",
    "anhang d empfohlene nachste arbeitspakete",
    "anhang g funf jahres roadmap 2026 2031",
    "anhang h qualitatsmassstab fur die nachste fassung",
    "schlussnotiz zum dokumentstatus",
    "redaktioneller gesamtarbeitsauftrag",
    "empfohlene publikationsarchitektur",
}

# Keep the web edition aligned with the public PDF edition.  The source DOCX is
# a redaction master and labels its own public, linked WÖk references as
# "internal".  On the public site those references are open source-detail
# pages, so the wording below is both clearer and does not trigger the
# publication audit's internal-source warning.
PUBLIC_TEXT_REPLACEMENTS = (
    (
        "Gesamtstudie und redaktioneller Master – Neufassung 2.0",
        "Gesamtstudie 2.0 · Arbeits- und Diskussionsfassung",
    ),
    (
        "Arbeitsfassung – vor wissenschaftlicher oder rechtlicher Veröffentlichung fachlich prüfen.",
        "Arbeits- und Diskussionsfassung. Fachliche und redaktionelle Weiterentwicklung vorgesehen.",
    ),
    (
        "Interne WÖk-Quellen mit Vorrang",
        "WÖk-Ausgangstexte und Anschlussdokumente",
    ),
    ("Interne WÖk-Quellen", "WÖk-Ausgangstexte und Anschlussdokumente"),
    ("Interne WÖk-Grundlagen", "WÖk-Ausgangstexte und Anschlussdokumente"),
    (
        "Dieses Dokument ist zugleich Grundlagenstudie, systematische Einordnung und redaktioneller Master für die Weiterentwicklung der Wirkungsökonomie.",
        "Dieses Dokument ist eine Gesamtstudie und systematische Einordnung zur Wirkungsökonomie als kooperative, lernende und wehrhafte Wirkungsordnung.",
    ),
    (
        "Das Dokument ist daher zugleich Theorie, Diagnose, Designstudie, Risikoprüfung und redaktioneller Master. Es soll nicht nur begründen, warum die Wirkungsökonomie gebraucht wird. Es soll offenlegen, woran sie scheitern kann und welche Sicherungen deshalb von Anfang an in ihre Architektur gehören.",
        "Das Dokument ist daher zugleich Theorie, Diagnose, Designstudie und Risikoprüfung. Es soll nicht nur begründen, warum die Wirkungsökonomie gebraucht wird. Es soll offenlegen, woran sie scheitern kann und welche Sicherungen deshalb von Anfang an in ihre Architektur gehören.",
    ),
    (
        "Redaktioneller Status: Dieses Dokument enthält fertige Textbausteine, aber auch Vorschläge, Prüfaufträge, provisorische Begriffe, Modellklauseln und Forschungsfragen. Es ersetzt keine juristische, steuerwissenschaftliche oder empirische Validierung.",
        "Dokumentstatus: Diese Arbeits- und Diskussionsfassung enthält ausgearbeitete Textbausteine, Vorschläge, vorläufige Begriffe, Modellklauseln und Forschungsfragen. Sie ersetzt keine juristische, steuerwissenschaftliche oder empirische Validierung.",
    ),
    (
        "Wo ältere Dokumente abweichende Skalen, Steuerklassen, Aggregationslogiken oder Begriffe enthalten, werden diese Unterschiede nicht stillschweigend geglättet, sondern als redaktioneller Prüfbedarf markiert.",
        "Wo ältere Dokumente abweichende Skalen, Steuerklassen, Aggregationslogiken oder Begriffe enthalten, werden diese Unterschiede nicht stillschweigend geglättet, sondern als fachlicher Klärungsbedarf markiert.",
    ),
    (
        "Externe Literatur wird als Bezugslinie und Prüfinstrument genutzt, nicht als nachträgliche Autorisierung der WÖk. Wo die Studie neue Begriffe oder institutionelle Vorschläge entwickelt, werden sie als WÖk-Erweiterungsvorschlag kenntlich gemacht. Aktuelle Lagezahlen beschreiben den Stand 2024 bis August 2026 und müssen bei späterer Veröffentlichung aktualisiert werden.",
        "Externe Literatur wird als Bezugslinie und Prüfinstrument genutzt, nicht als nachträgliche Autorisierung der WÖk. Wo die Studie neue Begriffe oder institutionelle Vorschläge entwickelt, werden sie als WÖk-Erweiterungsvorschlag kenntlich gemacht. Aktuelle Lagezahlen sind mit ihrem Berichtsstand bis August 2026 ausgewiesen.",
    ),
)


@dataclass
class ImageRef:
    relationship_id: str
    title: str = ""
    description: str = ""


@dataclass
class ParagraphBlock:
    index: int
    style: str
    text: str
    images: list[ImageRef] = field(default_factory=list)
    anchor: str = ""


@dataclass
class TableBlock:
    index: int
    rows: list[list[str]]


Block = ParagraphBlock | TableBlock


@dataclass(frozen=True)
class TermLink:
    label: str
    slug: str


# Existing glossary pages and the new, explicitly agreed key terms.  Links are
# intentionally root-relative because this include is consumed on a nested
# document route.
TERM_LINKS = (
    TermLink("soziale Wirkungsdilemmata", "wirkungsdilemma"),
    TermLink("soziales Wirkungsdilemma", "wirkungsdilemma"),
    TermLink("Wirkungsdilemma", "wirkungsdilemma"),
    TermLink("Koordinations- und Standarddilemmata", "koordinationsdilemma"),
    TermLink("Koordinationsdilemma", "koordinationsdilemma"),
    TermLink("Standarddilemma", "koordinationsdilemma"),
    TermLink("Freiwilligendilemma", "freiwilligendilemma"),
    TermLink("Chicken und Eskalationsdilemmata", "chicken-game"),
    TermLink("Eskalationsdilemma", "chicken-game"),
    TermLink("Chicken", "chicken-game"),
    TermLink("Intergenerationelles Dilemma", "intergenerationelles-dilemma"),
    TermLink("bedingte Kooperation", "bedingte-kooperation"),
    TermLink("Bedingte Kooperation", "bedingte-kooperation"),
    TermLink("Reziprozität", "reziprozitaet"),
    TermLink("Verfahrensgerechtigkeit", "verfahrensgerechtigkeit"),
    TermLink("institutionelle Vertrauenswürdigkeit", "institutionelle-vertrauenswuerdigkeit"),
    TermLink("institutionelle Vertrauenswuerdigkeit", "institutionelle-vertrauenswuerdigkeit"),
    TermLink("systemische Kooperation", "systemische-kooperation"),
    TermLink("Systemische Kooperation", "systemische-kooperation"),
    TermLink("soziale Dilemmata", "soziales-dilemma"),
    TermLink("soziales Dilemma", "soziales-dilemma"),
    TermLink("Soziales Dilemma", "soziales-dilemma"),
    TermLink("Gefangenendilemma", "gefangenendilemma"),
    TermLink("Gefangenendilemmas", "gefangenendilemma"),
    TermLink("öffentliche Güter", "oeffentliche-gueter"),
    TermLink("Öffentliches Gut", "oeffentliche-gueter"),
    TermLink("Trittbrettfahren", "trittbrettfahren"),
    TermLink("Assurance Game", "assurance-game"),
    TermLink("Assurance-Spiel", "assurance-game"),
    TermLink("Hirschjagd", "assurance-game"),
    TermLink("Reparaturfähigkeit", "reparaturfaehigkeit"),
    TermLink("Reparaturfaehigkeit", "reparaturfaehigkeit"),
    TermLink("Kooperationsfähigkeit", "kooperationsfaehigkeit"),
    TermLink("Kooperationsfaehigkeit", "kooperationsfaehigkeit"),
    TermLink("Principal-Agent-Problem", "principal-agent-problem"),
    TermLink("Principal-Agent", "principal-agent-problem"),
    TermLink("Moral Hazard", "moral-hazard"),
    TermLink("Capture", "capture"),
    TermLink("positive Netto-Wirkung", "positive-netto-wirkung"),
    TermLink("positive Nettowirkung", "positive-netto-wirkung"),
    TermLink("systemisch positives Summenspiel", "systemisch-positives-summenspiel"),
    TermLink("Nichtkompensationsprinzip", "nichtkompensationsprinzip"),
    TermLink("Nichtkompensation", "nichtkompensationsprinzip"),
    TermLink("kooperative Wehrhaftigkeit", "kooperative-wehrhaftigkeit"),
    TermLink("Wirkungsintegrität", "wirkungsintegritaet"),
    TermLink("Wirkungsarchitektur", "wirkungsarchitektur"),
    TermLink("Wirkungslenkung", "wirkungslenkung"),
    TermLink("Wirkungspotenzial", "wirkungspotenzial"),
    TermLink("Wirkungsrisiko", "wirkungsrisiko"),
    TermLink("Wirkungshaushalt", "wirkungshaushalt"),
    TermLink("Wirkungstragung", "wirkungstragung"),
    TermLink("Wirkungsrat", "wirkungsrat"),
    TermLink("Wirkung", "wirkung"),
    TermLink("Preisvollständigkeit", "preisvollstaendigkeit"),
    TermLink("unvollständiger Preis", "unvollstaendiger-preis"),
    TermLink("Unvollständige Preise", "unvollstaendiger-preis"),
    TermLink("Externalisierungslücke", "externalisierungsluecke"),
    TermLink("Externalisierung", "externalisierung"),
    TermLink("Vertrauensallmende", "vertrauensallmende"),
    TermLink("Senkenallmende", "senkenallmende"),
    TermLink("Allmendedilemma", "allmendedilemma"),
    TermLink("Allmende", "allmende"),
    TermLink("Anticommons", "anticommons"),
    TermLink("Reverse Merit Order", "reverse-merit-order"),
    TermLink("T-SROI", "t-sroi"),
    TermLink("SDG+", "sdg-plus"),
)
TERM_LINKS_BY_LENGTH = tuple(sorted(TERM_LINKS, key=lambda item: len(item.label), reverse=True))


@dataclass(frozen=True)
class SourceHint:
    key: str
    match_tokens: tuple[str, ...]
    title_tokens: tuple[str, ...]
    author_tokens: tuple[str, ...] = ()
    year: str = ""
    canonical_title: str = ""


# The keys are stable publication identifiers, not WÖK-Q numbers.  The current
# sources archive (including its publication supplements) resolves them to the
# present WÖK-Q code at build time, so IDs never have to be guessed or hard coded
# here.
SOURCE_HINTS = (
    SourceHint("weber-grundlagenpapier-wirkungsoekonomie", ("grundlagenpapier", "wirkungsoekonomie"), ("grundlagenpapier", "wirkungsoekonomie"), ("weber",)),
    SourceHint("weber-manifest-wirkungsoekonomie", ("manifest", "wirkungsoekonomie"), ("manifest",), ("weber",)),
    SourceHint("weber-minifest-wirkungsoekonomie", ("minifest", "wirkungsoekonomie"), ("minifest", "wirkungsoekonomie"), ("weber",)),
    SourceHint("weber-technische-leitlinien-wustg", ("technische", "leitlinien", "wirkungssteuergesetz"), ("technische", "leitlinien"), ("weber",)),
    SourceHint("weber-wirkungsrat", ("wirkungsrat", "institutionelle", "verankerung"), ("wirkungsrat",), ("weber",)),
    SourceHint("weber-t-sroi", ("t sroi", "impact controlling"), ("t sroi",), ("weber",)),
    SourceHint("weber-lieferkette", ("wirkungsoekonomie", "lieferkette"), ("wirkungsoekonomie", "lieferkette"), ("weber",)),
    SourceHint("weber-produktbesteuerung", ("produktbesteuerung", "wirkung"), ("produktbesteuerung", "wirkung"), ("weber",)),
    SourceHint(
        "weber-working-paper-wirkungssteuergesetz",
        ("working paper", "wirkungssteuergesetz"),
        ("wirkungssteuergesetz", "wstg"),
        ("weber",),
        canonical_title="Wirkungssteuergesetz WStG",
    ),
    SourceHint("weber-nachhaltigkeit-systemarchitektur", ("nachhaltigkeit", "systemarchitektur"), ("nachhaltigkeit", "systemarchitektur"), ("weber",)),
    SourceHint("weber-systemmodell", ("systemmodell", "wirkungsoekonomie"), ("systemmodell", "wirkungsoekonomie"), ("weber",)),
    SourceHint("weber-neue-ordnung-des-wohlstands", ("neue ordnung", "wohlstands"), ("neue ordnung", "wohlstands"), ("weber",)),
    SourceHint("weber-begriffsleitfaden", ("fuehrender", "begriffsleitfaden"), ("begriffsleitfaden",), ("weber",)),
    SourceHint("arrow-1972", ("arrow", "gifts", "exchanges"), ("gifts", "exchanges"), ("arrow",), "1972"),
    SourceHint("axelrod-hamilton-1981", ("axelrod", "hamilton", "evolution", "cooperation"), ("evolution", "cooperation"), ("axelrod", "hamilton"), "1981"),
    SourceHint("bshary-grutter-2005", ("bshary", "grutter", "2005"), ("punishment", "partner"), ("bshary", "grutter"), "2005"),
    SourceHint("bshary-grutter-2006", ("bshary", "grutter", "2006"), ("image", "scoring"), ("bshary", "grutter"), "2006"),
    SourceHint("coase-1960", ("coase", "social cost"), ("social", "cost"), ("coase",), "1960"),
    SourceHint("dietz-ostrom-stern-2003", ("dietz", "ostrom", "struggle", "commons"), ("struggle", "commons"), ("dietz", "ostrom"), "2003"),
    SourceHint("falk-kosfeld-2006", ("falk", "kosfeld", "hidden costs"), ("hidden", "costs"), ("falk", "kosfeld"), "2006"),
    SourceHint("fehr-gaechter-2002", ("fehr", "gaechter", "altruistic punishment"), ("altruistic", "punishment"), ("fehr", "gaechter"), "2002"),
    SourceHint("gneezy-rustichini-2000", ("gneezy", "rustichini", "fine", "price"), ("fine", "price"), ("gneezy", "rustichini"), "2000"),
    SourceHint("grutter-bshary-2003", ("grutter", "bshary", "2003", "cleaner wrasse"), ("cleaner", "wrasse"), ("grutter", "bshary"), "2003"),
    SourceHint("haken-2004", ("haken", "synergetics"), ("synergetics",), ("haken",), "2004"),
    SourceHint("hardin-1968", ("hardin", "tragedy", "commons"), ("tragedy", "commons"), ("hardin",), "1968"),
    SourceHint("heller-eisenberg-1998", ("heller", "eisenberg", "anticommons"), ("anticommons",), ("heller", "eisenberg"), "1998"),
    SourceHint("ipcc-ar6-wg3-2022", ("ipcc", "2022", "mitigation"), ("mitigation", "climate"), ("ipcc",), "2022"),
    SourceHint("milinski-semmann-krambeck-2002", ("milinski", "semmann", "reputation", "tragedy"), ("reputation", "tragedy"), ("milinski", "semmann"), "2002"),
    SourceHint("nowak-2006", ("nowak", "five rules", "cooperation"), ("five", "rules", "cooperation"), ("nowak",), "2006"),
    SourceHint("olson-1965", ("olson", "logic", "collective action"), ("logic", "collective", "action"), ("olson",), "1965"),
    SourceHint("ostrom-1990", ("ostrom", "1990", "governing", "commons"), ("governing", "commons"), ("ostrom",), "1990"),
    SourceHint("ostrom-1998", ("ostrom", "1998", "behavioral", "rational choice"), ("behavioral", "rational"), ("ostrom",), "1998"),
    SourceHint("ostrom-2009", ("ostrom", "2009", "beyond markets"), ("beyond", "markets"), ("ostrom",)),
    SourceHint("pigou-1920", ("pigou", "economics", "welfare"), ("economics", "welfare"), ("pigou",), "1920"),
    SourceHint("stern-2007", ("stern", "economics", "climate change"), ("economics", "climate"), ("stern",), "2007"),
    SourceHint("imf-2023-fossil-fuel-subsidies", ("international monetary fund", "2023", "fossil fuel subsidies data"), ("imf", "fossil", "fuel", "subsidies", "data"), year="2023"),
    SourceHint("imf-fossil-fuel-subsidies-method", ("international monetary fund", "2026", "climate change fossil fuel subsidies"), ("fossil", "subsidies"), ("international", "monetary", "fund")),
    SourceHint("oecd-effective-carbon-rates-2025", ("oecd", "effective carbon rates"), ("effective", "carbon", "rates"), ("oecd",), "2025"),
    SourceHint("oecd-inventory-support-fossil-fuels-2025", ("oecd", "inventory", "support measures", "fossil fuels"), ("inventory", "support", "fossil"), ("oecd",), "2025"),
    SourceHint("world-bank-carbon-pricing-2026", ("world bank", "state", "trends", "carbon pricing"), ("state", "trends", "carbon"), ("world", "bank"), "2026"),
    SourceHint("goodhart-1975", ("goodhart", "problems", "monetary management"), ("problems", "monetary", "management"), ("goodhart",), "1975"),
    SourceHint("campbell-1976", ("campbell", "assessing", "planned social change"), ("assessing", "planned", "social"), ("campbell",), "1976"),
    SourceHint("v-dem-democracy-report-2026", ("v dem institute", "democracy report", "2026"), ("v", "dem", "democracy", "report", "2026"), ("v", "dem", "institute")),
    SourceHint("ostrom-2010", ("ostrom", "2010", "beyond markets"), ("beyond", "markets", "states"), ("ostrom",)),
    SourceHint("unsd-sdg-report-2026", ("sustainable development goals report", "2026"), ("sustainable", "development", "goals", "report"), year="2026"),
    SourceHint("wmo-state-global-climate-2025", ("state", "global", "climate", "2025"), ("state", "global", "climate"), ("world", "meteorological", "organization"), "2026"),
    SourceHint("unep-emissions-gap-2025", ("emissions gap report",), ("emissions", "gap", "report"), ("united", "nations", "environment"), "2025"),
    SourceHint("oecd-trust-institutions-2026", ("oecd", "drivers", "trust", "institutions", "germany"), ("oecd", "drivers", "trust", "institutions", "germany"), ("oecd",), "2026"),
    SourceHint("destatis-armutsgefaehrdung-2026", ("armutsgefaehrdet", "16 1"), ("armutsgefaehrdet",), ("statistisches", "bundesamt"), "2026"),
    SourceHint("uba-emissions-projections-2026", ("emissionsdaten", "treibhausgas", "projektionen", "2026"), ("emissionsdaten", "projektionsdaten"), ("umweltbundesamt",), "2026"),
    SourceHint("expertenrat-emissions-projections-2026", ("prufbericht", "emissionen", "projektionsdaten", "2026"), ("prufbericht", "emissionen", "projektionsdaten"), ("expertenrat", "klimafragen"), "2026"),
    SourceHint("ipbes-transformative-change-2024", ("ipbes", "transformative change"), ("transformative", "change"), ("intergovernmental", "science", "policy", "biodiversity"), "2024"),
    SourceHint("brehm-1966", ("brehm", "psychological reactance"), ("theory", "psychological", "reactance"), ("brehm",), "1966"),
    SourceHint("bowles-2008", ("bowles", "self interested citizens", "moral sentiments"), ("self", "interested", "citizens", "moral", "sentiments"), ("bowles",), "2008"),
    SourceHint("deci-koestner-ryan-1999", ("deci", "koestner", "ryan", "intrinsic motivation"), ("meta", "analytic", "intrinsic", "motivation"), ("deci", "koestner", "ryan"), "1999"),
    SourceHint("jost-banaji-1994", ("jost", "banaji", "system justification"), ("stereotyping", "system", "justification"), ("jost", "banaji"), "1994"),
    SourceHint("kahneman-tversky-1979", ("kahneman", "tversky", "prospect theory"), ("prospect", "theory", "risk"), ("kahneman", "tversky"), "1979"),
    SourceHint("samuelson-zeckhauser-1988", ("samuelson", "zeckhauser", "status quo bias"), ("status", "quo", "bias"), ("samuelson", "zeckhauser"), "1988"),
    SourceHint("weber-woemm-2-0", ("woemm", "2 0", "wirkungsoekonomisches managementmodell"), ("woemm", "wirkungsoekonomisches", "managementmodell"), ("weber",), "2026"),
    SourceHint("weber-master-items-v1-2", ("master", "items"), ("master", "items"), ("weber",)),
    SourceHint("dawes-1980", ("dawes", "social dilemmas"), ("social", "dilemmas"), ("dawes",), "1980"),
    SourceHint("ostrom-2000", ("ostrom", "2000", "collective action", "social norms"), ("collective", "action", "social", "norms"), ("ostrom",), "2000"),
    SourceHint("van-lange-2013", ("van lange", "psychology", "social dilemmas"), ("psychology", "social", "dilemmas"), ("van", "lange"), "2013"),
    SourceHint("hirschman-1970", ("hirschman", "exit", "voice", "loyalty"), ("exit", "voice", "loyalty"), ("hirschman",), "1970"),
    SourceHint("north-1990", ("north", "institutions", "institutional change"), ("institutions", "institutional", "change"), ("north",), "1990"),
    SourceHint("williamson-1985", ("williamson", "economic institutions", "capitalism"), ("economic", "institutions", "capitalism"), ("williamson",), "1985"),
    SourceHint("fischbacher-gaechter-fehr-2001", ("fischbacher", "gaechter", "conditionally cooperative"), ("conditionally", "cooperative"), ("fischbacher", "gaechter", "fehr"), "2001"),
    SourceHint("berg-dickhaut-mccabe-1995", ("berg", "dickhaut", "trust", "reciprocity"), ("trust", "reciprocity", "social", "history"), ("berg", "dickhaut", "mccabe"), "1995"),
    SourceHint("tyler-2006", ("tyler", "why people obey"), ("why", "people", "obey"), ("tyler",), "2006"),
    SourceHint("tversky-kahneman-1991", ("tversky", "kahneman", "loss aversion"), ("loss", "aversion", "riskless"), ("tversky", "kahneman"), "1991"),
    SourceHint("laibson-1997", ("laibson", "golden eggs", "hyperbolic"), ("golden", "eggs", "hyperbolic"), ("laibson",), "1997"),
    SourceHint("kunda-1990", ("kunda", "motivated reasoning"), ("motivated", "reasoning"), ("kunda",), "1990"),
    SourceHint("merritt-effron-monin-2010", ("merritt", "effron", "moral self licensing"), ("moral", "self", "licensing"), ("merritt", "effron", "monin"), "2010"),
    SourceHint("meadows-1999", ("meadows", "leverage points"), ("leverage", "points"), ("meadows",), "1999"),
    SourceHint("unep-global-resources-outlook-2024", ("unep", "global resources outlook", "2024"), ("global", "resources", "outlook"), ("unep",), "2024"),
    SourceHint("unep-state-finance-nature-2026", ("united nations environment programme", "state", "finance", "nature", "2026"), ("state", "finance", "nature"), ("united", "nations", "environment"), "2026"),
    SourceHint("world-inequality-report-2026", ("world inequality", "2026"), ("world", "inequality", "report"), ("world", "inequality"), "2026"),
    SourceHint("ilo-employment-social-trends-2026", ("international labour organization", "employment", "social trends", "2026"), ("employment", "social", "trends"), ("international", "labour"), "2026"),
    SourceHint("freedom-house-2026", ("freedom house", "freedom", "world", "2026"), ("freedom", "world"), ("freedom", "house")),
    SourceHint("oecd-survey-trust-2026", ("oecd", "survey", "drivers", "trust", "2026"), ("survey", "drivers", "trust"), ("oecd",), "2026"),
)
SOURCE_HINT_BY_KEY = {hint.key: hint for hint in SOURCE_HINTS}

MISSING_BIBLIOGRAPHY: tuple[tuple[str, str], ...] = ()

OECD_SPLIT_REFERENCES = (
    (
        "oecd-effective-carbon-rates-2025",
        "OECD (2025): Effective Carbon Rates 2025.",
    ),
    (
        "oecd-inventory-support-fossil-fuels-2025",
        "OECD (2025): Inventory of Support Measures for Fossil Fuels 2025.",
    ),
)

BIBLIOGRAPHY_STARTS = {
    "literatur und quellen",
    "aktualisierte literatur und quellen der neufassung",
}
BIBLIOGRAPHY_GROUP_LABELS = {
    "wok ausgangstexte und anschlussdokumente",
    "externe grundlagenliteratur",
    "institutionelle und aktuelle quellen",
    "wok ausgangstexte und anschlussdokumente",
    "fuhrende wok interne quellen",
    "spieltheorie kooperation und institutionen",
    "verhaltensokonomie und psychologie",
    "okonomische bezugslinien und messrisiken",
    "aktuelle lageberichte",
}


def compact(value: str) -> str:
    """Return a lowercase, ASCII-friendly string for stable comparisons."""
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = value.replace("ß", "ss")
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value).lower()
    return re.sub(r"\s+", " ", value).strip()


def source_compact(value: str) -> str:
    """Normalise source metadata while keeping German transliterations stable.

    The DOCX uses umlauts (``Wirkungsökonomie``), whereas the existing source
    archive often uses the URL-safe spelling (``wirkungsoekonomie``).  This
    narrower helper makes those two forms comparable without changing public
    fragment IDs or archive URLs generated by :func:`slugify`.
    """
    return compact(
        (value or "")
        .replace("Ä", "Ae")
        .replace("Ö", "Oe")
        .replace("Ü", "Ue")
        .replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
    )


def slugify(value: str) -> str:
    return re.sub(r"\s+", "-", compact(value)).strip("-") or "abschnitt"


def esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def clean_text(value: str) -> str:
    value = (value or "").replace("\u00a0", " ").replace("\u00ad", "")
    value = re.sub(r"\s+", " ", value).strip()
    for old, new in PUBLIC_TEXT_REPLACEMENTS:
        value = value.replace(old, new)
    return value


def paragraph_text(element: ET.Element) -> str:
    values: list[str] = []
    for node in element.iter():
        if node.tag == W + "t" and node.text:
            values.append(node.text)
        elif node.tag == W + "tab":
            values.append(" ")
        elif node.tag in {W + "br", W + "cr"}:
            values.append(" ")
    return clean_text("".join(values))


def paragraph_style(element: ET.Element) -> str:
    style = element.find("w:pPr/w:pStyle", NS)
    return style.get(W + "val", "Normal") if style is not None else "Normal"


def paragraph_images(element: ET.Element) -> list[ImageRef]:
    images: list[ImageRef] = []
    document_properties = element.findall(".//wp:docPr", NS)
    descriptions = [
        (item.get("title", ""), item.get("descr", "")) for item in document_properties
    ]
    for position, blip in enumerate(element.findall(".//a:blip", NS)):
        relationship_id = blip.get(R + "embed", "")
        if not relationship_id:
            continue
        title, description = descriptions[position] if position < len(descriptions) else ("", "")
        images.append(ImageRef(relationship_id, title, description))
    return images


def table_rows(element: ET.Element) -> list[list[str]]:
    rows: list[list[str]] = []
    for row in element.findall("w:tr", NS):
        cells: list[str] = []
        for cell in row.findall("w:tc", NS):
            paragraphs = [paragraph_text(paragraph) for paragraph in cell.findall("w:p", NS)]
            cells.append("\n".join(part for part in paragraphs if part))
        if any(cell for cell in cells):
            rows.append(cells)
    return rows


def read_blocks(source: Path) -> tuple[list[Block], dict[str, str], dict[str, str]]:
    """Read body blocks plus image relationships and their OOXML targets."""
    with zipfile.ZipFile(source) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
        rels = ET.fromstring(archive.read("word/_rels/document.xml.rels"))

    relation_targets: dict[str, str] = {}
    for relationship in rels.findall("pr:Relationship", NS):
        relation_id = relationship.get("Id", "")
        target = relationship.get("Target", "")
        if relation_id and target.startswith("media/"):
            relation_targets[relation_id] = target

    body = document.find("w:body", NS)
    if body is None:
        raise ValueError("DOCX enthält keinen lesbaren Dokumentkörper.")

    blocks: list[Block] = []
    for index, child in enumerate(body):
        if child.tag == W + "p":
            block = ParagraphBlock(
                index=index,
                style=paragraph_style(child),
                text=paragraph_text(child),
                images=paragraph_images(child),
            )
            if block.text or block.images:
                blocks.append(block)
        elif child.tag == W + "tbl":
            rows = table_rows(child)
            if rows:
                blocks.append(TableBlock(index=index, rows=rows))

    return blocks, relation_targets, {}


def heading_level(block: ParagraphBlock) -> int | None:
    match = re.fullmatch(r"Heading([1-3])", block.style)
    return int(match.group(1)) if match else None


def section_is_omitted(text: str) -> bool:
    return compact(text) in OMITTED_SECTION_TITLES


def select_public_blocks(blocks: Iterable[Block]) -> list[Block]:
    """Start at the substantive preface and omit publication-workflow sections.

    The study has internal material at multiple heading depths: ``K.7`` is a
    level-two workflow section, while the appendices are level-one/level-two
    sections. A level-aware skip boundary prevents process notes from leaking
    while allowing the public bibliography after the omitted quality appendix.
    """
    output: list[Block] = []
    started = False
    skip_at_level: int | None = None
    for block in blocks:
        if isinstance(block, ParagraphBlock):
            level = heading_level(block)
            if level:
                normalized = compact(block.text)
                if not started:
                    if level == 1 and normalized == "vorbemerkung":
                        started = True
                    else:
                        continue
                if skip_at_level is not None and level <= skip_at_level:
                    skip_at_level = None
                if section_is_omitted(block.text):
                    skip_at_level = level
                    continue
        if started and skip_at_level is None:
            output.append(block)
    if not output:
        raise ValueError("Der öffentliche Startabschnitt 'Vorbemerkung' wurde nicht gefunden.")
    return output


def assign_heading_anchors(blocks: Iterable[Block]) -> None:
    used: dict[str, int] = {}
    for block in blocks:
        if not isinstance(block, ParagraphBlock) or not heading_level(block):
            continue
        base = f"wgs-{slugify(block.text)}"
        used[base] = used.get(base, 0) + 1
        block.anchor = base if used[base] == 1 else f"{base}-{used[base]}"


def load_archive_sources() -> list[dict[str, object]]:
    """Load the archive snapshot and publication-specific source supplements."""
    if not ARCHIVE_SNAPSHOT.exists():
        return []
    data = json.loads(ARCHIVE_SNAPSHOT.read_text(encoding="utf-8"))
    by_code = {
        str(item.get("code", "")): dict(item)
        for item in data.get("sources", [])
        if item.get("code")
    }
    if SUPPLEMENT_DIR.exists():
        for file_path in sorted(SUPPLEMENT_DIR.glob("*.json")):
            supplement = json.loads(file_path.read_text(encoding="utf-8"))
            for code, changes in supplement.get("overrides", {}).items():
                if code in by_code:
                    by_code[code] = {**by_code[code], **changes, "code": code}
            for code, publications in supplement.get("relatedPublications", {}).items():
                if code in by_code and isinstance(publications, list):
                    by_code[code] = {**by_code[code], "relatedPublications": publications, "code": code}
            for item in supplement.get("sources", []):
                code = str(item.get("code", ""))
                if code:
                    by_code[code] = {**by_code.get(code, {}), **item}
    return list(by_code.values())


def reference_key(text: str) -> str:
    normalized = source_compact(text)
    for hint in SOURCE_HINTS:
        if all(token in normalized for token in hint.match_tokens):
            return hint.key
    return f"source-{slugify(text)[:72]}"


def source_for_key(key: str, sources: list[dict[str, object]]) -> dict[str, object] | None:
    hint = SOURCE_HINT_BY_KEY.get(key)
    if not hint:
        return None
    candidates: list[tuple[int, dict[str, object]]] = []
    for source in sources:
        title = source_compact(str(source.get("title", "")))
        author = source_compact(str(source.get("author", "")))
        year = source_compact(str(source.get("year", "")))
        title_matches = sum(token in title for token in hint.title_tokens)
        author_matches = sum(token in author for token in hint.author_tokens)
        if title_matches != len(hint.title_tokens):
            continue
        if hint.author_tokens and author_matches != len(hint.author_tokens):
            continue
        if hint.year and hint.year != year:
            continue
        if hint.canonical_title and title != source_compact(hint.canonical_title):
            continue
        score = title_matches * 12 + author_matches * 5
        if hint.year and hint.year == year:
            score += 4
        candidates.append((score, source))
    if not candidates:
        return None
    candidates.sort(key=lambda item: (-item[0], str(item[1].get("code", ""))))
    return candidates[0][1]


def source_href(source: dict[str, object]) -> str:
    code = str(source.get("code", ""))
    return f"/quellenarchiv/{slugify(code)}/"


def render_source_entry(
    key: str,
    text: str,
    sources: list[dict[str, object]],
    item_id: str,
) -> tuple[str, bool, str]:
    source = source_for_key(key, sources)
    if source:
        code = esc(str(source.get("code", "")))
        return (
            f'              <li id="{esc(item_id)}" data-source-ref="{esc(key)}">'
            f'<a class="text-link" href="{esc(source_href(source))}">{esc(text)} '
            f'<span class="source-code">({code})</span></a></li>',
            True,
            str(source.get("code", "")),
        )
    return (
        f'              <li id="{esc(item_id)}" data-source-ref="{esc(key)}">{esc(text)}</li>',
        False,
        "",
    )


def publication_sources(sources: list[dict[str, object]]) -> list[dict[str, object]]:
    """Return every archive record explicitly related to this publication.

    The DOCX contains two partially overlapping source blocks and some sources
    appear only in prose or in a collective reference.  The supplement is the
    authoritative union of those references.  Rendering any record absent from
    the copied bibliography in a short addendum keeps the online edition and
    every archive-detail backlink genuinely bidirectional.
    """
    result: list[dict[str, object]] = []
    for source in sources:
        publications = source.get("relatedPublications", [])
        if not isinstance(publications, list):
            continue
        for publication in publications:
            if not isinstance(publication, dict):
                continue
            url = str(publication.get("url", "")).rstrip("/")
            if url == PUBLICATION_URL.rstrip("/"):
                result.append(source)
                break
    return sorted(result, key=lambda item: str(item.get("code", "")))


def render_related_source_entry(source: dict[str, object], item_id: str) -> str:
    code = str(source.get("code", ""))
    text = str(source.get("citation") or source.get("title") or code).strip()
    return (
        f'              <li id="{esc(item_id)}" data-source-ref="archive-{esc(code)}">'
        f'<a class="text-link" href="{esc(source_href(source))}">{esc(text)} '
        f'<span class="source-code">({esc(code)})</span></a></li>'
    )


def link_glossary_terms(text: str, seen: set[str]) -> str:
    rendered = esc(text)
    for term in TERM_LINKS_BY_LENGTH:
        if term.slug in seen:
            continue
        pattern = re.compile(rf"(?<![\w-])({re.escape(term.label)})(?![\w-])", re.IGNORECASE)
        if not pattern.search(rendered):
            continue
        rendered = pattern.sub(
            lambda match: f'<a class="text-link" href="/begriffe/{term.slug}/">{match.group(1)}</a>',
            rendered,
            count=1,
        )
        seen.add(term.slug)
    return rendered


def is_bullet(block: ParagraphBlock) -> bool:
    return block.style == "BulletWOEK" or block.text.startswith(("• ", "- ", "– "))


def is_numbered(block: ParagraphBlock) -> bool:
    return block.style == "NumberedWOEK" or bool(re.match(r"^\d+[.)]\s+", block.text))


def strip_list_marker(text: str, ordered: bool) -> str:
    if ordered:
        return re.sub(r"^\d+[.)]\s+", "", text).strip()
    return re.sub(r"^[•\-–]\s*", "", text).strip()


def render_table(block: TableBlock, seen_terms: set[str]) -> str:
    max_columns = max((len(row) for row in block.rows), default=0)
    if not max_columns:
        return ""
    normalized = [row + [""] * (max_columns - len(row)) for row in block.rows]
    table_id = f"wgs-table-{block.index:04d}"

    def render_cell(value: str, tag: str, attributes: str = "") -> str:
        parts = [link_glossary_terms(part, seen_terms) for part in value.split("\n") if part]
        return f"<{tag}{attributes}>" + "<br>".join(parts) + f"</{tag}>"

    if len(normalized) > 1:
        header = "".join(render_cell(value, "th", ' scope="col"') for value in normalized[0])
        body = "".join(
            "<tr>" + "".join(render_cell(value, "td") for value in row) + "</tr>"
            for row in normalized[1:]
        )
        table_html = f"<thead><tr>{header}</tr></thead><tbody>{body}</tbody>"
    else:
        row = "".join(render_cell(value, "td") for value in normalized[0])
        table_html = f"<tbody><tr>{row}</tr></tbody>"
    return (
        f'          <div class="table-scroll" id="{table_id}" data-table-index="{block.index}">'
        f'<table class="data-table">{table_html}</table></div>'
    )


PUBLIC_FIGURE_FILENAMES = (
    "wirkungsdilemmata-familie.png",
    "woek-mehrschichtige-architektur.png",
    "kooperative-wehrhaftigkeit-kreislauf.png",
    "gelingens-und-scheiternsbedingungen.png",
    "sdg-plus-dreischichtige-architektur.png",
    "synergetisches-vertrauensmodell.png",
    "wirkungsintegritaet-schutzarchitektur.png",
)


def figure_asset_name(image: ImageRef, fallback_number: int) -> str | None:
    """Map retained figures in document order to stable public assets.

    The selected body begins after the cover and omits the publication-process
    chapter. Its retained drawing order is therefore the accessible asset map.
    """
    position = fallback_number - 1
    return PUBLIC_FIGURE_FILENAMES[position] if position < len(PUBLIC_FIGURE_FILENAMES) else None


def public_image_paths(blocks: Iterable[Block]) -> dict[str, str]:
    """Return the stable public URLs for figures in retained study sections."""
    result: dict[str, str] = {}
    counter = 0
    for block in blocks:
        if not isinstance(block, ParagraphBlock):
            continue
        for image in block.images:
            counter += 1
            asset_name = figure_asset_name(image, counter)
            if asset_name:
                result[image.relationship_id] = (
                    f"/assets/img/publications/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus/{asset_name}"
                )
    return result


def extract_public_images(
    source: Path,
    relation_targets: dict[str, str],
    blocks: Iterable[Block],
    asset_dir: Path,
) -> dict[str, str]:
    """Extract only figures that occur in retained public sections."""
    paths = public_image_paths(blocks)
    if not paths:
        return {}

    asset_dir.mkdir(parents=True, exist_ok=True)
    result: dict[str, str] = {}
    with zipfile.ZipFile(source) as archive:
        for relationship_id, public_path in paths.items():
            target = relation_targets.get(relationship_id)
            if not target:
                continue
            archive_path = f"word/{target}"
            if archive_path not in archive.namelist():
                continue
            output = asset_dir / Path(public_path).name
            with archive.open(archive_path) as input_file, output.open("wb") as output_file:
                shutil.copyfileobj(input_file, output_file)
            result[relationship_id] = public_path
    return result


def render_toc(blocks: Iterable[Block]) -> str:
    items: list[str] = []
    for block in blocks:
        if not isinstance(block, ParagraphBlock):
            continue
        level = heading_level(block)
        if not level or not block.anchor:
            continue
        if compact(block.text) in BIBLIOGRAPHY_STARTS:
            continue
        items.append(
            f'              <li class="toc-level-{level + 1}"><a href="#{esc(block.anchor)}">{esc(block.text)}</a></li>'
        )
    return "\n".join(
        [
            '        <details class="toc-card no-print" id="wgs-inhaltsuebersicht">',
            '          <summary class="card-title">Inhaltsübersicht</summary>',
            "          <ol>",
            *items,
            "          </ol>",
            "        </details>",
        ]
    )


def render_heading(block: ParagraphBlock) -> str:
    word_level = heading_level(block)
    if word_level is None:
        raise ValueError("render_heading received a non-heading block")
    tag = word_level + 1  # the document page already owns the public H1
    title = esc(block.text)
    return (
        f'          <h{tag} id="{esc(block.anchor)}" data-section-id="{esc(block.anchor)}">{title} '
        f'<a class="cite-anchor no-print" href="#{esc(block.anchor)}" '
        f'aria-label="Zitierlink zu diesem Abschnitt">#</a></h{tag}>'
    )


def render_include(
    blocks: list[Block],
    image_paths: dict[str, str],
    sources: list[dict[str, object]],
) -> tuple[str, dict[str, int]]:
    assign_heading_anchors(blocks)
    seen_terms: set[str] = set()
    output: list[str] = [
        '<div class="callout" id="wgs-oeffentliche-onlinefassung">',
        "  <p><strong>Öffentliche Onlinefassung:</strong> Diese Gesamtstudie 2.0 enthält den fachlichen Text zur Wirkungsökonomie als kooperative, lernende und wehrhafte Wirkungsordnung. Ausgenommen sind ausschließlich redaktionelle Publikations-, Arbeits- und Qualitätsplanung.</p>",
        "  <p><strong>Modellstatus:</strong> Als Vorschlag, Entwurf, Pilot oder Denkmodell gekennzeichnete Teile bleiben fachliche Modelle. Sie sind keine amtliche Bewertung, keine Personenbewertung, kein Social-Credit-System und keine automatische Entscheidung.</p>",
        "</div>",
        '<section class="callout" aria-labelledby="wgs-glossarverknuepfung">',
        '  <h2 id="wgs-glossarverknuepfung">Zentrale Begriffe im Glossar</h2>',
        "  <p>"
        + " · ".join(
            f'<a class="text-link" href="/begriffe/{term.slug}/">{esc(term.label)}</a>'
            for term in TERM_LINKS
            if term.label
            in {
                "Allmende",
                "Allmendedilemma",
                "Senkenallmende",
                "Externalisierung",
                "Externalisierungslücke",
                "unvollständiger Preis",
                "Preisvollständigkeit",
                "Wirkungstragung",
                "Vertrauensallmende",
                "kooperative Wehrhaftigkeit",
                "Wirkungsintegrität",
                "systemisch positives Summenspiel",
                "Anticommons",
                "positive Netto-Wirkung",
                "Wirkungspotenzial",
                "Wirkungsrisiko",
                "Nichtkompensationsprinzip",
                "Reverse Merit Order",
                "Wirkungslenkung",
                "Wirkungsarchitektur",
                "Wirkungshaushalt",
                "Wirkungsrat",
                "T-SROI",
                "SDG+",
                "soziales Dilemma",
                "Gefangenendilemma",
                "Öffentliches Gut",
                "Trittbrettfahren",
                "Assurance Game",
                "institutionelle Vertrauenswürdigkeit",
                "Reparaturfähigkeit",
                "systemische Kooperation",
                "Kooperationsfähigkeit",
                "Principal-Agent-Problem",
                "Moral Hazard",
                "Capture",
                "Wirkungsdilemma",
                "Koordinationsdilemma",
                "Freiwilligendilemma",
                "Chicken",
                "Intergenerationelles Dilemma",
                "bedingte Kooperation",
                "Reziprozität",
                "Verfahrensgerechtigkeit",
            }
        )
        + "</p>",
        "</section>",
        render_toc(blocks),
        '        <article id="wgs-volltext" data-document-fulltext="gesamtstudie-wirkungsdilemmata-kooperation-sdgplus">',
    ]

    list_kind: str | None = None
    list_items: list[str] = []
    list_start_index = 0
    in_bibliography = False
    bibliography_level: int | None = None
    bibliography_entries: list[tuple[str, str, str]] = []
    pending_figures: list[tuple[ParagraphBlock, ImageRef]] = []
    figures = 0
    source_links = 0
    source_unresolved = 0
    linked_source_codes: set[str] = set()

    def flush_list() -> None:
        nonlocal list_kind, list_items
        if not list_items or not list_kind:
            list_kind = None
            list_items = []
            return
        list_id = f"wgs-{list_kind}-{list_start_index:04d}"
        output.append(f'          <{list_kind} id="{list_id}">')
        output.extend(f"            <li>{item}</li>" for item in list_items)
        output.append(f"          </{list_kind}>")
        list_kind = None
        list_items = []

    def add_source(key: str, text: str, item_id: str) -> None:
        bibliography_entries.append((key, text, item_id))

    def flush_figures(caption: str = "") -> None:
        nonlocal pending_figures, figures
        for figure_block, image in pending_figures:
            path = image_paths.get(image.relationship_id)
            if not path:
                continue
            figures += 1
            figure_id = f"wgs-figure-{figure_block.index:04d}"
            alt = image.description or image.title or f"Abbildung {figures} aus der Gesamtstudie"
            figcaption = caption or image.title or f"Abbildung {figures} aus der Gesamtstudie."
            figcaption = re.sub(r"^Abbildung\s+(?:[A-Z]-)?\d+\s*:\s*", "", figcaption, flags=re.IGNORECASE)
            figcaption = f"Abbildung {figures}: {figcaption}"
            output.append(
                f'          <figure id="{figure_id}" class="publication-figure">'
                f'<img src="{esc(path)}" alt="{esc(alt)}" loading="lazy">'
                f"<figcaption>{esc(figcaption)}</figcaption></figure>"
            )
        pending_figures = []

    for block in blocks:
        if isinstance(block, TableBlock):
            flush_list()
            flush_figures()
            output.append(render_table(block, seen_terms))
            continue

        level = heading_level(block)
        if level:
            flush_list()
            flush_figures()
            normalized = compact(block.text)
            if normalized in BIBLIOGRAPHY_STARTS:
                in_bibliography = True
                bibliography_level = level
                continue
            if in_bibliography and bibliography_level is not None and level <= bibliography_level:
                in_bibliography = False
                bibliography_level = None
            elif in_bibliography:
                # Group labels belong to the consolidated bibliography below;
                # no duplicate bibliography headings are emitted in the body.
                continue
            output.append(render_heading(block))
            continue

        if block.images:
            flush_list()
            pending_figures.extend((block, image) for image in block.images)
            continue

        if pending_figures and block.style in {"CaptionWOEK", "Caption"}:
            flush_figures(block.text)
            continue
        if pending_figures:
            flush_figures()

        if in_bibliography and block.text:
            flush_list()
            normalized = compact(block.text)
            if block.style == "FrontMatter":
                # The source bibliography has editorial lead-in and closing
                # notes. The public edition retains the cited works only.
                continue
            if normalized in BIBLIOGRAPHY_GROUP_LABELS:
                continue
            if normalized.startswith("oecd") and "effective carbon rates" in normalized:
                for number, (key, text) in enumerate(OECD_SPLIT_REFERENCES, start=1):
                    add_source(key, text, f"wgs-source-{block.index:04d}-{number}")
            else:
                add_source(reference_key(block.text), block.text, f"wgs-source-{block.index:04d}")
            continue

        if is_bullet(block) or is_numbered(block):
            kind = "ul" if is_bullet(block) else "ol"
            if list_kind and list_kind != kind:
                flush_list()
            if not list_kind:
                list_kind = kind
                list_start_index = block.index
            list_items.append(link_glossary_terms(strip_list_marker(block.text, kind == "ol"), seen_terms))
            continue

        flush_list()
        block_id = f"wgs-p-{block.index:04d}"
        content = link_glossary_terms(block.text, seen_terms)
        if block.style == "QuoteWOEK":
            output.append(f'          <blockquote id="{block_id}">{content}</blockquote>')
        elif block.style == "ExecutiveLead":
            output.append(f'          <p id="{block_id}" class="card-text"><strong>{content}</strong></p>')
        elif block.style in {"CaptionWOEK", "Caption"}:
            output.append(f'          <p id="{block_id}" class="muted">{content}</p>')
        else:
            output.append(f'          <p id="{block_id}">{content}</p>')

    flush_list()
    flush_figures()
    related_sources = publication_sources(sources)
    output.extend(
        [
            '          <section class="publication-bibliography" aria-labelledby="wgs-literatur-und-quellen">',
            '            <h2 id="wgs-literatur-und-quellen">Literatur und Quellen</h2>',
            "            <p>Alle Einträge führen zur jeweiligen Detailseite im Quellenarchiv.</p>",
            '            <ol class="source-list">',
        ]
    )
    seen_bibliography_entries: set[str] = set()
    for key, text, item_id in bibliography_entries:
        rendered, linked, code = render_source_entry(key, text, sources, item_id)
        identity = f"code:{code}" if linked else f"unresolved:{key}:{compact(text)}"
        if identity in seen_bibliography_entries:
            continue
        seen_bibliography_entries.add(identity)
        output.append(rendered)
        if linked:
            source_links += 1
            linked_source_codes.add(code)
        else:
            source_unresolved += 1

    for number, source in enumerate(related_sources, start=1):
        code = str(source.get("code", ""))
        if not code or code in linked_source_codes:
            continue
        output.append(render_related_source_entry(source, f"wgs-source-archive-{number:02d}"))
        source_links += 1
        linked_source_codes.add(code)
    output.extend(["            </ol>", "          </section>"])
    output.append("        </article>")
    output.append("")
    return "\n".join(output), {
        "figures": figures,
        "glossary_links": len(seen_terms),
        "source_links": source_links,
        "source_unresolved": source_unresolved,
        "publication_sources": len(related_sources),
        "publication_source_links": len(
            {str(source.get("code", "")) for source in related_sources} & linked_source_codes
        ),
        "headings": sum(1 for block in blocks if isinstance(block, ParagraphBlock) and heading_level(block)),
        "tables": sum(1 for block in blocks if isinstance(block, TableBlock)),
    }


def validate_output(rendered: str, stats: dict[str, int]) -> None:
    if any(
        forbidden in rendered
        for forbidden in (
            "Vertiefung G – Publikations- und Integrationsstrategie",
            "Vertiefung H – Entwurf eines eigenständigen WÖk-Grundlagenkapitels",
            "Vertiefung I – Entwurf eines Journal-Artikels",
            "Vertiefung J – Vorschläge für Glossartexte",
            "Lesebrücke zu den folgenden Vertiefungen",
            "47. Was bereits vorhanden ist",
            "48. Die bisherige Lücke",
            "65. Website und Glossar",
            "66. Redaktionelle Konflikte im bisherigen Bestand",
            "Anhang A – Redaktionsauftrag für die WÖk-Gesamtarchitektur",
            "Anhang D – Empfohlene nächste Arbeitspakete",
            "Anhang G – Fünf-Jahres-Roadmap 2026–2031",
            "Anhang H – Qualitätsmaßstab für die nächste Fassung",
            "Redaktioneller Gesamtarbeitsauftrag",
            "Empfohlene Publikationsarchitektur",
            "redaktioneller Master",
        )
    ):
        raise ValueError("Eine vereinbarte interne Sektion ist in die öffentliche Fassung gelangt.")
    if 'id="wgs-inhaltsuebersicht"' not in rendered:
        raise ValueError("Die öffentliche Inhaltsübersicht fehlt.")
    if stats["headings"] < 350 or stats["tables"] < 45:
        raise ValueError("Der Import wirkt unvollständig; bitte die DOCX-Struktur prüfen.")
    if 'href="/begriffe/' not in rendered:
        raise ValueError("Es wurden keine Glossarverknüpfungen ausgegeben.")
    if 'data-source-ref=' not in rendered:
        raise ValueError("Das Quellenverzeichnis enthält keine stabilen Quellenreferenzen.")
    if stats["publication_source_links"] != stats["publication_sources"]:
        raise ValueError("Nicht alle mit der Veröffentlichung verknüpften Quellen sind im Online-Text verlinkt.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Pfad zur freigegebenen DOCX-Studie")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Zieldatei für das HTML-Include")
    parser.add_argument("--asset-dir", type=Path, default=DEFAULT_ASSET_DIR, help="Zielordner für die eingebetteten Originalgrafiken")
    parser.add_argument("--no-assets", action="store_true", help="keine Bilder extrahieren (nur HTML neu bauen)")
    parser.add_argument("--strict-sources", action="store_true", help="bei nicht auflösbaren Quellenreferenzen mit Fehler abbrechen")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()
    asset_dir = args.asset_dir.expanduser().resolve()
    if not source.exists():
        raise FileNotFoundError(f"Quelldokument nicht gefunden: {source}")

    all_blocks, relation_targets, _ = read_blocks(source)
    public_blocks = select_public_blocks(all_blocks)
    image_paths = (
        public_image_paths(public_blocks)
        if args.no_assets
        else extract_public_images(source, relation_targets, public_blocks, asset_dir)
    )
    sources = load_archive_sources()
    rendered, stats = render_include(public_blocks, image_paths, sources)
    validate_output(rendered, stats)
    if args.strict_sources and stats["source_unresolved"]:
        raise ValueError(f"{stats['source_unresolved']} Quellen konnten nicht mit dem Quellenarchiv aufgelöst werden.")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(rendered, encoding="utf-8")

    print(f"Wrote {output.relative_to(ROOT)}")
    if not args.no_assets:
        print(f"Extracted {len(image_paths)} public figures to {asset_dir.relative_to(ROOT)}")
    print(
        "Stats: "
        + ", ".join(f"{name}={value}" for name, value in stats.items())
        + f", archive_sources={len(sources)}"
    )
    print("Omitted public sections:")
    for item in OMITTED_PARTS:
        print(f"- {item}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

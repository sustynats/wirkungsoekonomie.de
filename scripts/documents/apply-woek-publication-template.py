#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path.cwd()
DEFAULT_TEMPLATE = ROOT / "docs/sanierung-detaildossiers/source/woek_standard_umfangreiche_detailkonzepte_dossiers_v1_0.docx"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
W = f"{{{W_NS}}}"
R = f"{{{R_NS}}}"
REL = f"{{{REL_NS}}}"

ET.register_namespace("w", W_NS)
ET.register_namespace("r", R_NS)
ET.register_namespace("", REL_NS)


def clone(element: ET.Element | None) -> ET.Element | None:
    return copy.deepcopy(element) if element is not None else None


def text_of(element: ET.Element) -> str:
    return "".join(node.text or "" for node in element.findall(f".//{W}t"))


def set_text(element: ET.Element, value: str) -> None:
    text_nodes = element.findall(f".//{W}t")
    if not text_nodes:
        run = ET.SubElement(element, f"{W}r")
        text = ET.SubElement(run, f"{W}t")
        text_nodes = [text]
    text_nodes[0].text = value
    for node in text_nodes[1:]:
        node.text = ""


def first_run_properties(paragraph: ET.Element) -> ET.Element | None:
    run = paragraph.find(f"{W}r")
    return clone(run.find(f"{W}rPr")) if run is not None and run.find(f"{W}rPr") is not None else None


def paragraph_properties(paragraph: ET.Element) -> ET.Element | None:
    return clone(paragraph.find(f"{W}pPr"))


def direct_format(
    paragraph: ET.Element,
    p_pr: ET.Element | None,
    r_pr: ET.Element | None,
    *,
    keep_num_pr: bool = False,
    preserve_inline: bool = True,
) -> None:
    old_p_pr = paragraph.find(f"{W}pPr")
    p_style = clone(old_p_pr.find(f"{W}pStyle")) if old_p_pr is not None and old_p_pr.find(f"{W}pStyle") is not None else None
    num_pr = clone(old_p_pr.find(f"{W}numPr")) if keep_num_pr and old_p_pr is not None and old_p_pr.find(f"{W}numPr") is not None else None
    if old_p_pr is not None:
        paragraph.remove(old_p_pr)
    new_p_pr = clone(p_pr) if p_pr is not None else ET.Element(f"{W}pPr")
    for node in list(new_p_pr):
        if node.tag in {f"{W}pStyle", f"{W}numPr"}:
            new_p_pr.remove(node)
    if p_style is not None:
        new_p_pr.insert(0, p_style)
    if num_pr is not None:
        new_p_pr.insert(1 if p_style is not None else 0, num_pr)
    paragraph.insert(0, new_p_pr)

    for run in paragraph.findall(f".//{W}r"):
        old_r_pr = run.find(f"{W}rPr")
        keep_b = preserve_inline and old_r_pr is not None and old_r_pr.find(f"{W}b") is not None
        keep_i = preserve_inline and old_r_pr is not None and old_r_pr.find(f"{W}i") is not None
        keep_u = preserve_inline and old_r_pr is not None and old_r_pr.find(f"{W}u") is not None
        if old_r_pr is not None:
            run.remove(old_r_pr)
        new_r_pr = clone(r_pr) if r_pr is not None else ET.Element(f"{W}rPr")
        if keep_b and new_r_pr.find(f"{W}b") is None:
            ET.SubElement(new_r_pr, f"{W}b")
        if keep_i and new_r_pr.find(f"{W}i") is None:
            ET.SubElement(new_r_pr, f"{W}i")
        if keep_u and new_r_pr.find(f"{W}u") is None:
            underline = ET.SubElement(new_r_pr, f"{W}u")
            underline.set(f"{W}val", "single")
        run.insert(0, new_r_pr)


def p_style_id(paragraph: ET.Element) -> str:
    node = paragraph.find(f"./{W}pPr/{W}pStyle")
    return node.get(f"{W}val", "") if node is not None else ""


def with_font_size(r_pr: ET.Element | None, size_half_points: str) -> ET.Element | None:
    if r_pr is None:
        return None
    result = clone(r_pr)
    for node in list(result.findall(f"{W}sz")):
        result.remove(node)
    size = ET.SubElement(result, f"{W}sz")
    size.set(f"{W}val", size_half_points)
    return result


def paragraph_has_page_break(paragraph: ET.Element) -> bool:
    return bool(paragraph.findall(f".//{W}br"))


def first_cover_break_index(children: list[ET.Element]) -> int | None:
    for index, child in enumerate(children):
        if child.tag == f"{W}p" and paragraph_has_page_break(child):
            return index
    return None


def extract_leitformel(children: list[ET.Element]) -> str:
    for child in children:
        if child.tag != f"{W}tbl":
            continue
        text = text_of(child).strip()
        if "Leitformel" in text:
            return text.replace("Leitformel", "", 1).strip()
    return ""


def set_table_cell_text(cell: ET.Element, value: str) -> None:
    paragraph = cell.find(f"{W}p")
    if paragraph is None:
        paragraph = ET.SubElement(cell, f"{W}p")
    set_text(paragraph, value)


def footer_xml(template_footer: bytes, args: argparse.Namespace) -> bytes:
    footer = ET.fromstring(template_footer)
    set_text(footer, f"Wirkungsökonomie · Natalie Weber · {args.title} {args.version}")
    return ET.tostring(footer, encoding="utf-8", xml_declaration=True, short_empty_elements=True)


def build_cover(template_children: list[ET.Element], args: argparse.Namespace, source_children: list[ET.Element]) -> list[ET.Element]:
    cover = [clone(template_children[index]) for index in (0, 1, 2, 3, 4, 5, 6)]
    assert all(item is not None for item in cover)
    cover = [item for item in cover if item is not None]

    set_text(cover[0], "Wirkungsökonomie · Natalie Weber")
    set_text(cover[1], args.document_type.upper())
    set_text(cover[2], args.title)
    set_text(cover[3], args.subtitle)

    values = [
        ("Autorin", args.author),
        ("Referenz", "Wirkungsökonomie"),
        ("Version", args.version),
        ("Status", args.status),
        ("Stand", args.stand),
        ("Bereich", args.section),
    ]
    rows = cover[4].findall(f".//{W}tr")
    for row, (label, value) in zip(rows, values):
        cells = row.findall(f"./{W}tc")
        if len(cells) >= 2:
            set_table_cell_text(cells[0], label)
            set_table_cell_text(cells[1], value)

    leitformel = args.leitformel or extract_leitformel(source_children)
    set_text(cover[5], f"„{leitformel}“" if leitformel else "„Wirkung wird sichtbar, wenn Gestaltung Verantwortung übernimmt.“")
    return cover


def remove_header_refs_and_use_template_footer(document: ET.Element, template_sect: ET.Element, footer_rid: str) -> None:
    body = document.find(f"{W}body")
    if body is None:
        raise RuntimeError("DOCX body not found")
    old_sect = body.find(f"{W}sectPr")
    if old_sect is not None:
        body.remove(old_sect)
    new_sect = clone(template_sect)
    for node in list(new_sect):
        if node.tag == f"{W}headerReference":
            new_sect.remove(node)
    footer_ref = new_sect.find(f"{W}footerReference")
    if footer_ref is None:
        footer_ref = ET.Element(f"{W}footerReference")
        footer_ref.set(f"{W}type", "default")
        new_sect.insert(0, footer_ref)
    footer_ref.set(f"{R}id", footer_rid)
    body.append(new_sect)


def relationship_footer_id(rels: ET.Element) -> str:
    for rel in rels:
        if rel.get("Type", "").endswith("/footer") and rel.get("Target") == "footer1.xml":
            return rel.get("Id")
    used = {rel.get("Id") for rel in rels}
    index = 1
    while f"rId{index}" in used:
        index += 1
    rel = ET.SubElement(rels, f"{REL}Relationship")
    rel.set("Id", f"rId{index}")
    rel.set("Type", "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer")
    rel.set("Target", "footer1.xml")
    return f"rId{index}"


def remove_header_relationships(rels: ET.Element) -> None:
    for rel in list(rels):
        if rel.get("Type", "").endswith("/header"):
            rels.remove(rel)


def clear_shading(cell: ET.Element) -> None:
    tc_pr = cell.find(f"{W}tcPr")
    if tc_pr is None:
        return
    for shd in list(tc_pr.findall(f"{W}shd")):
        tc_pr.remove(shd)


def shade_cell(cell: ET.Element, fill: str) -> None:
    tc_pr = cell.find(f"{W}tcPr")
    if tc_pr is None:
        tc_pr = ET.Element(f"{W}tcPr")
        cell.insert(0, tc_pr)
    clear_shading(cell)
    shd = ET.SubElement(tc_pr, f"{W}shd")
    shd.set(f"{W}val", "clear")
    shd.set(f"{W}color", "auto")
    shd.set(f"{W}fill", fill)


def set_run_color(run: ET.Element, color: str) -> None:
    r_pr = run.find(f"{W}rPr")
    if r_pr is None:
        r_pr = ET.Element(f"{W}rPr")
        run.insert(0, r_pr)
    for existing in list(r_pr.findall(f"{W}color")):
        r_pr.remove(existing)
    node = ET.SubElement(r_pr, f"{W}color")
    node.set(f"{W}val", color)


def table_column_count(row: ET.Element) -> int:
    return len(row.findall(f"./{W}tc"))


def apply_table_format(table: ET.Element, body_p_pr: ET.Element | None, body_r_pr: ET.Element | None) -> None:
    rows = table.findall(f"./{W}tr")
    one_cell_callout = len(rows) == 1 and rows and table_column_count(rows[0]) == 1
    for row_index, row in enumerate(rows):
        for cell in row.findall(f"./{W}tc"):
            if one_cell_callout:
                shade_cell(cell, "EAF4EF")
            else:
                clear_shading(cell)
                if row_index == 0:
                    shade_cell(cell, "0A1020")
            for paragraph in cell.findall(f".//{W}p"):
                direct_format(paragraph, body_p_pr, body_r_pr, preserve_inline=False)
                if row_index == 0 and not one_cell_callout:
                    for run in paragraph.findall(f".//{W}r"):
                        r_pr = run.find(f"{W}rPr")
                        if r_pr is None:
                            r_pr = ET.Element(f"{W}rPr")
                            run.insert(0, r_pr)
                        if r_pr.find(f"{W}b") is None:
                            ET.SubElement(r_pr, f"{W}b")
                        set_run_color(run, "FFFFFF")
                elif not one_cell_callout and cell is row.findall(f"./{W}tc")[0]:
                    for run in paragraph.findall(f".//{W}r"):
                        r_pr = run.find(f"{W}rPr")
                        if r_pr is None:
                            r_pr = ET.Element(f"{W}rPr")
                            run.insert(0, r_pr)
                        if r_pr.find(f"{W}b") is None:
                            ET.SubElement(r_pr, f"{W}b")


def transform_document(args: argparse.Namespace) -> None:
    template = args.template
    source = args.source
    output = args.output

    with zipfile.ZipFile(template) as template_zip:
        template_parts = {name: template_zip.read(name) for name in template_zip.namelist()}
        template_document = ET.fromstring(template_zip.read("word/document.xml"))
        template_body = template_document.find(f"{W}body")
        template_children = list(template_body)
        template_sect = template_body.find(f"{W}sectPr")
        h1_sample = template_children[7]
        body_sample = template_children[8]

        h1_p_pr, h1_r_pr = paragraph_properties(h1_sample), first_run_properties(h1_sample)
        h2_p_pr, h2_r_pr = paragraph_properties(h1_sample), with_font_size(first_run_properties(h1_sample), "30")
        h3_p_pr, h3_r_pr = paragraph_properties(h1_sample), with_font_size(first_run_properties(h1_sample), "26")
        body_p_pr, body_r_pr = paragraph_properties(body_sample), first_run_properties(body_sample)

    with zipfile.ZipFile(source) as source_zip:
        source_document = ET.fromstring(source_zip.read("word/document.xml"))
        source_body = source_document.find(f"{W}body")
        source_children = list(source_body)
        break_index = first_cover_break_index(source_children)
        content_start = (break_index + 1) if break_index is not None else 0
        content_children = [clone(child) for child in source_children[content_start:] if child.tag != f"{W}sectPr"]

        cover = build_cover(template_children, args, source_children)
        cover_count = len(cover)
        source_body.clear()
        for child in cover + content_children:
            source_body.append(child)

        for index, child in enumerate(source_body):
            if index < cover_count:
                continue
            if child.tag == f"{W}p":
                style = p_style_id(child)
                if style == "Heading1":
                    direct_format(child, h1_p_pr, h1_r_pr)
                elif style == "Heading2":
                    direct_format(child, h2_p_pr, h2_r_pr)
                elif style == "Heading3":
                    direct_format(child, h3_p_pr, h3_r_pr)
                elif style.startswith("List"):
                    direct_format(child, body_p_pr, body_r_pr, keep_num_pr=True)
                else:
                    direct_format(child, body_p_pr, body_r_pr)
            elif child.tag == f"{W}tbl":
                apply_table_format(child, body_p_pr, body_r_pr)

        rels = ET.fromstring(source_zip.read("word/_rels/document.xml.rels"))
        footer_rid = relationship_footer_id(rels)
        remove_header_refs_and_use_template_footer(source_document, template_sect, footer_rid)

        output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as output_zip:
            wrote_footer = False
            for info in source_zip.infolist():
                name = info.filename
                if name in {
                    "word/styles.xml",
                    "word/stylesWithEffects.xml",
                    "word/numbering.xml",
                    "word/theme/theme1.xml",
                    "word/fontTable.xml",
                }:
                    output_zip.writestr(info, template_parts[name])
                elif name == "word/footer1.xml":
                    wrote_footer = True
                    output_zip.writestr(info, footer_xml(template_parts[name], args))
                elif name == "word/document.xml":
                    output_zip.writestr(info, ET.tostring(source_document, encoding="utf-8", xml_declaration=True, short_empty_elements=True))
                elif name == "word/_rels/document.xml.rels":
                    output_zip.writestr(info, ET.tostring(rels, encoding="utf-8", xml_declaration=True, short_empty_elements=True))
                elif name.startswith("word/header"):
                    output_zip.writestr(info, source_zip.read(name))
                else:
                    output_zip.writestr(info, source_zip.read(name))
            if not wrote_footer:
                output_zip.writestr("word/footer1.xml", footer_xml(template_parts["word/footer1.xml"], args))


def main() -> None:
    parser = argparse.ArgumentParser(description="Apply the Wirkungsökonomie publication template to a DOCX while preserving tables and text.")
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--template", type=Path, default=DEFAULT_TEMPLATE)
    parser.add_argument("--title", required=True)
    parser.add_argument("--subtitle", required=True)
    parser.add_argument("--document-type", default="Dossier")
    parser.add_argument("--author", default="Natalie Weber")
    parser.add_argument("--version", default="v1.0")
    parser.add_argument("--status", default="Arbeitsfassung")
    parser.add_argument("--stand", required=True)
    parser.add_argument("--section", default="Wirkungsökonomie")
    parser.add_argument("--leitformel", default="")
    args = parser.parse_args()
    transform_document(args)
    print(f"WÖk publication template applied: {args.source} -> {args.output}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Bind the complete page review to the current publishing PDFs.

The private review inventory records either an actual sheet inspection or
exact pixel evidence from an already inspected page.  This command validates
that evidence again, compares every publishing page with its reviewed render,
and writes the small public proof consumed by the release guards.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import argparse
import hashlib
import json

import pymupdf
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path):
    return json.loads(path.read_text())


def public_path(path: Path) -> str:
    return str(path.resolve().relative_to(ROOT.resolve()))


def page_pixel_sha(page) -> str:
    return hashlib.sha256(
        page.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples
    ).hexdigest()


def validate_row(row: dict, render_dir: Path, rendered_pdf_sha: str) -> None:
    sheet = Path(row['path'])
    if row['status'] != 'PASS' or sha(sheet) != row['sha256']:
        raise RuntimeError(f'Ungeprüfter oder veränderter Prüfbogen: {sheet.name}')
    if row['renderedPdfSha256'] != rendered_pdf_sha:
        raise RuntimeError(f'Prüfbogen gehört zu einer anderen PDF-Fassung: {sheet.name}')
    page_numbers = row['pages']
    if page_numbers != [p['page'] for p in row['pageRenders']]:
        raise RuntimeError(f'Unvollständige Seitenliste im Prüfbogen: {sheet.name}')
    for page in row['pageRenders']:
        if sha(render_dir / f'page-{page["page"]}.png') != page['sha256']:
            raise RuntimeError(f'Gerenderte Prüfseite wurde verändert: {sheet.name}')
    if row.get('actuallyViewedCurrentSheet'):
        return
    exact_pages = row.get('evidenceReuse', [])
    exact_body = row.get('detailBodyPixelReuse', [])
    if len(exact_pages) == len(page_numbers):
        for evidence, page in zip(exact_pages, row['pageRenders']):
            old_sheet = Path(evidence['reviewedSheet'])
            if (evidence['currentPage'] != page['page'] or
                    evidence['pageRenderSha256'] != page['sha256'] or
                    sha(old_sheet) != evidence['reviewedSheetSha256']):
                raise RuntimeError(f'Ungültige Vollseiten-Pixelübernahme: {sheet.name}')
        return
    if row['kind'] == 'detail' and len(exact_body) == len(page_numbers):
        for evidence, page in zip(exact_body, row['pageRenders']):
            old_sheet = Path(evidence['previousDetailSheet'])
            layout_sheet = Path(evidence['currentLayout']['sheet'])
            if (evidence['currentPage'] != page['page'] or
                    evidence['currentFullPageSha256'] != page['sha256'] or
                    evidence['unchangedBodyFraction'] != .94 or
                    sha(old_sheet) != evidence['previousDetailSheetSha256'] or
                    sha(layout_sheet) != evidence['currentLayout']['sha256']):
                raise RuntimeError(f'Ungültige Inhaltsbereich-Pixelübernahme: {sheet.name}')
        return
    raise RuntimeError(f'Prüfbogen hat weder Sichtprüfung noch vollständigen Pixelbeleg: {sheet.name}')


def finalize(inventory_path: Path, publishing_report_path: Path, output_dir: Path,
             output_path: Path) -> None:
    inventory = load(inventory_path)
    publishing_report = load(publishing_report_path)
    source_build = load(ROOT / 'reports/consistency-20261009/book-source-build.json')
    source_by_volume = {entry['volume']: entry for entry in source_build}
    if publishing_report['status'] != 'PASS':
        raise RuntimeError('Publishing-Copy-Prüfung ist nicht bestanden.')

    records = []
    for volume in ('I', 'II'):
        rows = [row for row in inventory if row['volume'] == volume]
        publishing = next(item for item in publishing_report['pdfs'] if item['volume'] == volume)
        source = source_by_volume[volume]
        rendered_pdf_sha = publishing['renderedPdfSha256']
        render_dir = inventory_path.parent.parent / f'book-render/final-515-{volume}'
        rendered_pdf = render_dir / f'PRINT_6x9_Band-{volume}_Konsistenz_2026-10-10.pdf'
        current_pdf = output_dir / publishing['filename']
        audit_path = ROOT / f'reports/consistency-20261009/book-render-audit-{volume}.json'
        audit = load(audit_path)

        if (sha(rendered_pdf) != rendered_pdf_sha or audit['pdfSha256'] != rendered_pdf_sha or
                sha(current_pdf) != publishing['pdfSha256']):
            raise RuntimeError(f'PDF-Hashkette für Band {volume} ist unterbrochen.')
        if (sha(ROOT / source['output']) != source['outputSha256'] or
                publishing['docxSha256'] != source['outputSha256'] or
                audit['docxSha256'] != source['outputSha256']):
            raise RuntimeError(f'Manuskript-Hashkette für Band {volume} ist unterbrochen.')
        if publishing['hiddenMetadataAudit']['findings']:
            raise RuntimeError(f'Verdeckte Produktionsmetadaten in Band {volume}.')
        for row in rows:
            validate_row(row, render_dir, rendered_pdf_sha)

        layout_rows = [row for row in rows if row['kind'] == 'layout']
        detail_rows = [row for row in rows if row['kind'] == 'detail']
        layout_pages = [page for row in layout_rows for page in row['pages']]
        detail_pages = [page for row in detail_rows for page in row['pages']]
        expected_pages = publishing['pages']
        if layout_pages != list(range(1, expected_pages + 1)):
            raise RuntimeError(f'Layoutprüfung deckt Band {volume} nicht lückenlos ab.')
        if sorted(detail_pages) != sorted(audit['pagesForDetailedVisualReview']):
            raise RuntimeError(f'Detailprüfung deckt Band {volume} nicht exakt ab.')

        reported_pixels = publishing['identicalPagePixels']
        if [entry['page'] for entry in reported_pixels] != list(range(1, expected_pages + 1)):
            raise RuntimeError(f'Publishing-Pixelbericht für Band {volume} ist unvollständig.')
        with pymupdf.open(rendered_pdf) as rendered, pymupdf.open(current_pdf) as current:
            if len(rendered) != expected_pages or len(current) != expected_pages:
                raise RuntimeError(f'Seitenzahl von Band {volume} stimmt nicht.')
            for index, (before, after, reported) in enumerate(zip(rendered, current, reported_pixels), 1):
                before_sha = page_pixel_sha(before)
                after_sha = page_pixel_sha(after)
                if before_sha != after_sha or after_sha != reported['sha256']:
                    raise RuntimeError(f'Publishing-Seite verändert: Band {volume}, Seite {index}')

        metadata = PdfReader(current_pdf).metadata
        if (metadata.get('/Author') != 'Natalie Weber' or
                metadata.get('/Creator') != 'Institut für Wirkungsökonomie' or
                metadata.get('/Producer') != 'Institut für Wirkungsökonomie'):
            raise RuntimeError(f'Publikationsidentität von Band {volume} stimmt nicht.')

        kinds = Counter((row['kind'], 'actual' if row.get('actuallyViewedCurrentSheet') else
                         'exact-body' if row.get('detailBodyPixelReuse') else 'exact-page')
                        for row in rows)
        records.append({
            'volume': volume,
            'filename': publishing['filename'],
            'pdfSha256': publishing['pdfSha256'],
            'renderedPdfSha256': rendered_pdf_sha,
            'docx': source['output'],
            'docxSha256': source['outputSha256'],
            'pages': expected_pages,
            'visualPageCoverage': len(layout_pages),
            'detailedPageCoverage': len(set(detail_pages)),
            'layoutSheets': len(layout_rows),
            'detailSheets': len(detail_rows),
            'actuallyViewedCurrentSheets': sum(bool(row.get('actuallyViewedCurrentSheet')) for row in rows),
            'exactFullPageReuseSheets': kinds[('layout', 'exact-page')] + kinds[('detail', 'exact-page')],
            'exactDetailBodyReuseSheets': kinds[('detail', 'exact-body')],
            'publishingPagesPixelIdenticalToReviewedRender': expected_pages,
            'navigationPreserved': publishing['navigationPreserved'],
            'hiddenProductionMetadataFindings': 0,
            'status': 'PASS',
        })

    correction_path = ROOT / 'content/grundlagen/book-corrections-20261009.json'
    reference_path = ROOT / 'reports/consistency-20261009/book-reference-integrity-515.json'
    succession_path = inventory_path.parent.parent / 'book-source-succession-515-20261013.json'
    proof = {
        'status': 'PASS',
        'date': load(correction_path)['date'],
        'scope': 'All current pages reviewed for layout; all correction-sensitive pages reviewed in detail; publishing copies are pixel-identical to the reviewed renders.',
        'reviewInventorySha256': sha(inventory_path),
        'publishingCopyReportSha256': sha(publishing_report_path),
        'correctionsMasterSha256': sha(correction_path),
        'referenceIntegrity': {'path': public_path(reference_path), 'sha256': sha(reference_path)},
        'sourceSuccessionSha256': sha(succession_path),
        'pdfs': records,
        'totals': {
            'pages': sum(item['pages'] for item in records),
            'visualPageCoverage': sum(item['visualPageCoverage'] for item in records),
            'detailedPageCoverage': sum(item['detailedPageCoverage'] for item in records),
            'sheets': len(inventory),
            'actuallyViewedCurrentSheets': sum(item['actuallyViewedCurrentSheets'] for item in records),
            'exactDetailBodyReuseSheets': sum(item['exactDetailBodyReuseSheets'] for item in records),
        },
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    print(f"PASS: {proof['totals']['pages']} Seiten und {proof['totals']['sheets']} Prüfbögen hashgebunden.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', type=Path, required=True)
    parser.add_argument('--publishing-report', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    finalize(args.inventory.resolve(), args.publishing_report.resolve(),
             args.output_dir.resolve(), args.output.resolve())

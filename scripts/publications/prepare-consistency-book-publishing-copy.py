"""Prepare source-bound book PDFs with publishing metadata and unchanged pages.

The rendered inputs remain private and unchanged. This is a metadata operation;
it never substitutes for the source corrections or the complete visual review.
"""
from pathlib import Path
import argparse
import hashlib
import json
import importlib.util
import xml.etree.ElementTree as ET
from datetime import date
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
AUTHOR = 'Natalie Weber'
PUBLISHER = 'Institut für Wirkungsökonomie'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def prepare(volume, rendered, toc_proof, output_dir):
    source = next(x for x in json.loads((ROOT / 'reports/consistency-20261009/book-source-build.json').read_text()) if x['volume'] == volume)
    toc = json.loads(toc_proof.read_text())
    if (sha(ROOT / source['output']) != source['outputSha256'] or
            toc['status'] != 'PASS' or toc['sourcePdfSha256'] != sha(rendered) or
            toc['docxAfterSha256'] != source['outputSha256'] or
            toc['changedEntries'] != 0):
        raise RuntimeError('Rendered input is not bound to the final manuscript and verified TOC')
    edition_date = date.fromisoformat(json.loads((ROOT / 'content/grundlagen/book-corrections-20261009.json').read_text())['date']).isoformat()
    target = output_dir / f'die-neue-ordnung-des-wohlstands-band-{volume.lower()}-{edition_date}.pdf'
    temporary = target.with_suffix('.metadata-candidate.pdf')
    with pymupdf.open(rendered) as before:
        links = [p.get_links() for p in before]
        outline = before.get_toc(simple=False)
        pixels = [hashlib.sha256(p.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest() for p in before]
        metadata = {k: v for k, v in before.metadata.items() if k in {
            'title', 'author', 'subject', 'keywords', 'creator', 'producer',
            'creationDate', 'modDate', 'trapped'}}
        metadata.update(title=f'Die neue Ordnung des Wohlstands - Band {volume}',
                        author=AUTHOR, creator=PUBLISHER, producer=PUBLISHER)
        before.set_metadata(metadata)
        xmp = before.get_xml_metadata()
        if xmp:
            tree = ET.fromstring(xmp)
            authors = [li.text for node in tree.iter('{http://purl.org/dc/elements/1.1/}creator')
                       for li in node.iter('{http://www.w3.org/1999/02/22-rdf-syntax-ns#}li')]
            if authors != [AUTHOR]:
                raise RuntimeError('Unexpected XMP author; review the source identity')
            fields = [('{http://ns.adobe.com/pdf/1.3/}Producer', 'LibreOfficeDev 26.8.0.0.alpha0 (AARCH64)'),
                      ('{http://ns.adobe.com/xap/1.0/}CreatorTool', 'Writer')]
            for name, expected in fields:
                nodes = list(tree.iter(name))
                if len(nodes) != 1 or nodes[0].text != expected:
                    raise RuntimeError('Unexpected XMP renderer identity; review it before replacement')
                nodes[0].text = PUBLISHER
            before.set_xml_metadata(ET.tostring(tree, encoding='unicode'))
        before.save(temporary, garbage=4, deflate=True, no_new_id=True)
    with pymupdf.open(temporary) as after:
        checked = [hashlib.sha256(p.get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False).samples).hexdigest() for p in after]
        # Xref numbers can legitimately change during garbage collection.
        def public_links(rows):
            return [[{k: str(v) for k, v in link.items() if k != 'xref'} for link in page] for page in rows]
        def public_outline(rows):
            return [row[:3]+[{k: str(v) for k, v in row[3].items() if k != 'xref'}] for row in rows]
        if pixels != checked or public_links(links) != public_links([p.get_links() for p in after]) or public_outline(outline) != public_outline(after.get_toc(simple=False)):
            raise RuntimeError('Publishing metadata changed pages, links or outlines')
        if any(after.metadata.get(k) != value for k, value in
               [('author', AUTHOR), ('creator', PUBLISHER), ('producer', PUBLISHER)]):
            raise RuntimeError('Publishing identity differs')
        if xmp:
            checked_xmp = ET.fromstring(after.get_xml_metadata())
            if ET.tostring(tree) != ET.tostring(checked_xmp):
                raise RuntimeError('Other XMP fields changed during publication preparation')
        pages = len(after)
    if target.exists() and sha(target) != sha(temporary):
        raise RuntimeError('Publishing target has a different checksum; review the conflict before replacement')
    temporary.replace(target)
    spec = importlib.util.spec_from_file_location('hidden_metadata_audit', ROOT / 'scripts/quality/audit-pdf-hidden-production-metadata.py')
    audit = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(audit)
    hidden = audit.inspect_pdf(target)
    if hidden['findings']:
        raise RuntimeError('Unresolved hidden production metadata in publishing copy')
    return dict(volume=volume, renderedPdfSha256=sha(rendered), docx=source['output'],
                docxSha256=source['outputSha256'], filename=target.name,
                pdfSha256=sha(target), pages=pages, metadataOnly=True,
                identicalPagePixels=[dict(page=n+1, sha256=digest) for n, digest in enumerate(checked)],
                navigationPreserved=True, hiddenMetadataAudit=hidden,
                visualReview='PENDING')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--band-i', type=Path, required=True)
    parser.add_argument('--band-ii', type=Path, required=True)
    parser.add_argument('--toc-i', type=Path, required=True)
    parser.add_argument('--toc-ii', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    records = [prepare(v, rendered, toc, args.output_dir) for v, rendered, toc in
               [('I', args.band_i, args.toc_i), ('II', args.band_ii, args.toc_ii)]]
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(dict(status='PASS', scope='Publishing metadata only; visual review pending', pdfs=records), ensure_ascii=False, indent=2)+'\n')
    print(f"PASS: {sum(x['pages'] for x in records)} unchanged page renders, publishing identity and hidden metadata checked.")

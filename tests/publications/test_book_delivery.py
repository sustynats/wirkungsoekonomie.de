import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('book_delivery', ROOT / 'scripts/publications/assemble-consistency-mainwork.py')
delivery = importlib.util.module_from_spec(spec)
spec.loader.exec_module(delivery)


class BookDeliveryGuards(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.original_globals = delivery.ROOT, delivery.MANIFEST, delivery.HISTORICAL, delivery.HISTORICAL_SHA
        delivery.ROOT = self.root
        delivery.MANIFEST = self.root / 'edition.json'
        delivery.HISTORICAL = self.root / 'historical.pdf'
        delivery.HISTORICAL.write_bytes(b'preserved historical original')
        delivery.HISTORICAL_SHA = delivery.sha(delivery.HISTORICAL)
        self.pdf = self.root / 'current.pdf'
        writer = PdfWriter()
        writer.add_blank_page(width=200, height=300)
        writer.add_metadata({'/Author': 'Natalie Weber', '/WOEKSourceRevision': delivery.REVISION})
        with self.pdf.open('wb') as stream:
            writer.write(stream)
        (self.root / 'source.docx').write_bytes(b'source manuscript fixture')
        (self.root / 'visual.json').write_text(json.dumps({'status': 'PASS', 'pdfs': [
            {'volume': 'I', 'pdfSha256': 'reviewed-volume-hash', 'visualPageCoverage': 1}]}))
        self.manifest = {'revision': delivery.REVISION,
                         'combined': {'sha256': delivery.sha(self.pdf), 'pages': 1},
                         'visualReview': {'path': 'visual.json', 'sha256': delivery.sha(self.root / 'visual.json')},
                         'volumes': [{'volume': 'I', 'docx': 'source.docx', 'docxSha256': delivery.sha(self.root / 'source.docx'),
                                      'sha256': 'reviewed-volume-hash', 'pages': 1}]}
        self.save()

    def save(self):
        delivery.MANIFEST.write_text(json.dumps(self.manifest))

    def tearDown(self):
        delivery.ROOT, delivery.MANIFEST, delivery.HISTORICAL, delivery.HISTORICAL_SHA = self.original_globals
        self.temp.cleanup()

    def test_metadata_marker_cannot_hide_changed_pdf_content(self):
        delivery.validate_current(self.pdf)
        writer = PdfWriter(clone_from=str(self.pdf))
        writer.add_blank_page(width=200, height=300)
        with self.pdf.open('wb') as stream:
            writer.write(stream)
        self.assertEqual(PdfReader(self.pdf).metadata['/WOEKSourceRevision'], delivery.REVISION)
        with self.assertRaises(RuntimeError):
            delivery.validate_current(self.pdf)

    def test_changed_manuscript_requires_new_review(self):
        (self.root / 'source.docx').write_bytes(b'unknown altered formula')
        with self.assertRaises(RuntimeError):
            delivery.validate_current(self.pdf)

    def test_incomplete_visual_page_coverage_is_rejected(self):
        review = {'status': 'PASS', 'pdfs': [{'volume': 'I', 'pdfSha256': 'reviewed-volume-hash', 'visualPageCoverage': 0}]}
        (self.root / 'visual.json').write_text(json.dumps(review))
        self.manifest['visualReview']['sha256'] = delivery.sha(self.root / 'visual.json')
        self.save()
        with self.assertRaises(RuntimeError):
            delivery.validate_current(self.pdf)

    def test_historical_original_cannot_be_silently_replaced(self):
        delivery.HISTORICAL.write_bytes(b'rewritten original')
        with self.assertRaises(RuntimeError):
            delivery.validate_current(self.pdf)


if __name__ == '__main__':
    unittest.main()

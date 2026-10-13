"""Publication blockers for stale figure pixels, editable sources and reviews."""
from pathlib import Path
from copy import deepcopy
import hashlib
import importlib.util
import json
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('figure_integrity', ROOT / 'scripts/publications/book_figure_integrity.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class FigureIntegrity(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.source = {'key': 'funding', 'title': 'Available funds',
                       'placements': [{'volume': 'II', 'media': 'image60.png'}],
                       'originalSha256': '1' * 64}
        (self.root / 'figure.svg').write_text('<svg><title>Available funds</title></svg>')
        (self.root / 'figure.png').write_bytes(b'reviewed figure pixels')
        self.build = {'key': 'funding', 'placements': deepcopy(self.source['placements']),
                      'originalSha256': self.source['originalSha256'],
                      'sourceEntrySha256': hashlib.sha256(json.dumps(self.source, ensure_ascii=False,
                          sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
                      'image': 'figure.png', 'svg': 'figure.svg',
                      'sha256': hashlib.sha256((self.root / 'figure.png').read_bytes()).hexdigest(),
                      'svgSha256': hashlib.sha256((self.root / 'figure.svg').read_bytes()).hexdigest(),
                      'visualReview': 'PASS', 'reviewEvidence': {'actuallyViewed': True,
                          'sheetSha256': '2' * 64, 'observation': 'All funding figures read.'}}
        self.build['reviewedImageSha256'] = self.build['sha256']

    def validate(self):
        return module.validate_figure(self.root, self.source, self.build)

    def test_exact_reviewed_source_and_artifacts_are_accepted(self):
        self.assertEqual(self.validate()['key'], 'funding')

    def test_changed_rendered_pixels_are_rejected(self):
        (self.root / 'figure.png').write_bytes(b'new unreviewed pixels')
        with self.assertRaisesRegex(RuntimeError, 'artifact changed'):
            self.validate()

    def test_changed_editable_source_with_same_raster_is_rejected(self):
        (self.root / 'figure.svg').write_text('<svg><desc>Unreviewed altered source</desc></svg>')
        with self.assertRaisesRegex(RuntimeError, 'artifact changed'):
            self.validate()

    def test_changed_scientific_source_is_rejected(self):
        self.source['title'] = 'Expected savings are cash'
        with self.assertRaisesRegex(RuntimeError, 'source changed'):
            self.validate()

    def test_pending_review_is_rejected(self):
        self.build['visualReview'] = 'PENDING'
        with self.assertRaisesRegex(RuntimeError, 'no complete visual review'):
            self.validate()

    def test_review_of_different_pixels_is_rejected(self):
        self.build['reviewedImageSha256'] = '3' * 64
        with self.assertRaisesRegex(RuntimeError, 'no complete visual review'):
            self.validate()

    def test_unseen_or_unbound_review_is_rejected(self):
        for field, value in [('actuallyViewed', False), ('sheetSha256', ''), ('observation', '')]:
            with self.subTest(field=field):
                previous = deepcopy(self.build['reviewEvidence'])
                self.build['reviewEvidence'][field] = value
                with self.assertRaisesRegex(RuntimeError, 'no complete visual review'):
                    self.validate()
                self.build['reviewEvidence'] = previous

    def test_private_or_external_artifact_path_is_rejected(self):
        self.build['svg'] = '../private-manuscript.svg'
        with self.assertRaisesRegex(RuntimeError, 'outside source tree'):
            self.validate()


if __name__ == '__main__':
    unittest.main()

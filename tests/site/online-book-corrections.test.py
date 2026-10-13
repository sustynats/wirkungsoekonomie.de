import importlib.util
from pathlib import Path
import unittest

path = Path(__file__).resolve().parents[2] / 'scripts/publications/apply-consistency-online-book.py'
spec = importlib.util.spec_from_file_location('online_book_corrections', path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class OnlineBookCorrectionTests(unittest.TestCase):
    def test_preserves_route_anchor_citation_and_unrelated_content(self):
        original = '<h1>Titel bleibt</h1><p id="woek-main-2026-k034-s002-p001">Alt <a class="source-chip" href="/quellenarchiv/wok-q-1024/" data-source-id="I-K34-1">[I-K34-1]</a></p><p>Nachsatz bleibt</p>'
        entry = dict(path='referenz/kapitel-034/index.html', id='woek-main-2026-k034-s002-p001', beforeText='Alt [I-K34-1]', afterText='Geprüfte Rechnung [I-K34-1]')
        changed, applied = module.correct_block(original, entry)
        self.assertTrue(applied)
        self.assertIn('<h1>Titel bleibt</h1>', changed)
        self.assertIn('<p>Nachsatz bleibt</p>', changed)
        self.assertIn('href="/quellenarchiv/wok-q-1024/"', changed)
        self.assertIn('data-source-id="I-K34-1">[I-K34-1]</a>', changed)
        self.assertEqual(module.correct_block(changed, entry, check=True), (changed, False))

    def test_unknown_variant_and_duplicate_anchor_fail_closed(self):
        entry = dict(path='referenz/kapitel-031/index.html', id='woek-main-2026-k031-s001-p001', beforeText='Original', afterText='Geprüft')
        unknown = '<p id="woek-main-2026-k031-s001-p001">Zwischenzeitliche Änderung</p>'
        with self.assertRaisesRegex(RuntimeError, 'Online source conflict'):
            module.correct_block(unknown, entry)
        duplicate = '<p id="woek-main-2026-k031-s001-p001">Original</p>' * 2
        with self.assertRaisesRegex(RuntimeError, 'Expected one block'):
            module.correct_block(duplicate, entry)

    def test_changes_one_table_cell_and_preserves_dimensions(self):
        original = '<div class="reference-table" id="woek-main-2026-k031-table-011"><table><tr><td>Kennung</td><td>Messwert</td></tr><tr><td>WÖk-ID</td><td>Alter Inhalt</td></tr></table></div>'
        entry = dict(path='referenz/kapitel-031/index.html', id='woek-main-2026-k031-table-011', rowIndex=1, cellIndex=1, beforeText='Alter Inhalt', afterText='Getrennte Beobachtung')
        changed, applied = module.correct_block(original, entry)
        self.assertTrue(applied)
        self.assertEqual(changed.count('<tr>'), 2)
        self.assertEqual(changed.count('<td>'), 4)
        self.assertIn('<tr><td>Kennung</td><td>Messwert</td></tr>', changed)
        self.assertIn('<td>WÖk-ID</td><td>Getrennte Beobachtung</td>', changed)
        self.assertEqual(module.correct_block(changed, entry, check=True), (changed, False))

if __name__ == '__main__':
    unittest.main()

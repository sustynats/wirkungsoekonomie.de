import importlib.util
from pathlib import Path
from collections import Counter
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('state_gate', ROOT / 'tools/check_state_sustainability_architecture.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

class HistoricalHeaderTests(unittest.TestCase):
    old = '<header class="site-header"><nav class="site-nav"><a>Alte Navigation</a></nav></header>'
    new = '<header class="site-header" data-search-exclude><nav class="site-nav"><a>Heutige Navigation</a></nav></header>'
    body = '\n<main>\n<p>Investition 50 EUR; Schaden 60 EUR.</p>\n</main>'

    def test_exact_shared_header_does_not_hide_any_body_change(self):
        self.assertEqual(gate.historical_content_diff(self.old+self.body, self.new+self.body, self.new, 'historisch/'), '')
        difference = gate.historical_content_diff(self.old+self.body, self.new+self.body.replace('60 EUR', '6 EUR'), self.new, 'historisch/')
        self.assertIn('-<p>Investition 50 EUR; Schaden 60 EUR.</p>', difference)
        removed = Counter(line[1:] for line in difference.splitlines() if line.startswith('-') and not line.startswith('---'))
        added = Counter(line[1:] for line in difference.splitlines() if line.startswith('+') and not line.startswith('+++'))
        self.assertTrue(removed-added)

    def test_unknown_missing_and_duplicate_header_fail_closed(self):
        for current in [self.new.replace('Heutige Navigation', 'Beliebiger Text')+self.body,
                        self.body, self.new+self.new+self.body]:
            with self.subTest(current=current), self.assertRaises(AssertionError):
                gate.historical_content_diff(self.old+self.body, current, self.new, 'historisch/')

if __name__ == '__main__':
    unittest.main()

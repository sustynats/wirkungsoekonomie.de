import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('rang_release', ROOT/'scripts/portal/build-rang24-release.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class RangReaderTests(unittest.TestCase):
    def test_production_inputs_never_enter_the_reader_catalogue(self):
        records=[{'rang': 0, 'portal': 'SDG-Referenz', 'notes': 'Codex-Anweisung: erst nach Mobile-QA freigeben'}]
        issues=[{'issue': 'Veröffentlichung sperren', 'action': 'Integrationsgrundlage ausführen'}]
        checks=[{'area': 'CI/CD', 'item': 'Build-Slot reservieren', 'status': 'offen'}]
        html=module.release_report(records,issues,checks)
        self.assertIn('SDG-Referenz',html)
        self.assertIn('href="../verstehen/sdgs-sdgplus/"',html)
        for forbidden in ('Codex','Mobile-QA','Integrationsgrundlage','CI/CD','Build-Slot','Release-Gates'):
            self.assertNotIn(forbidden,html)

    def test_all_historical_rank_rows_remain_including_the_library(self):
        records=[{'rang': n, 'portal': f'Bereich {n}'} for n in range(25)]
        html=module.release_report(records,[],[])
        self.assertEqual(html.count('<td>Rang '),25)
        self.assertIn('href="../fachbibliothek/"',html)
        self.assertIn('25. Mai 2026',html)

if __name__=='__main__': unittest.main()

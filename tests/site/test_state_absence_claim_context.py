import importlib.util
from pathlib import Path
import tempfile,unittest
spec=importlib.util.spec_from_file_location('matrix',Path(__file__).resolve().parents[2]/'tools/finalize_state_sustainability_matrix.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class StateAbsenceContext(unittest.TestCase):
 def claim(self,text):
  with tempfile.TemporaryDirectory()as directory:
   m.ROOT=Path(directory);m.source_plain_text.cache_clear();(m.ROOT/'sample.html').write_text('<main><p>'+text+'</p></main>');return m.material_state_absence_claim('sample.html')
 def test_rejected_inference_is_teaching(self):
  self.assertFalse(self.claim('Ein öffentlicher eNAP-Export wurde nicht gefunden. Unzulässig wäre der Schluss, es habe deshalb keine Nachhaltigkeitsprüfung gegeben.'))
 def test_asserted_absence_remains_open(self):
  self.assertTrue(self.claim('Es gab keine Nachhaltigkeitsprüfung.'))
  self.assertTrue(self.claim('Deutschland prüft nicht die Folgen seiner Gesetze.'))
 def test_rejected_example_does_not_excuse_next_assertion(self):
  self.assertTrue(self.claim('Unzulässig wäre der Schluss, es habe keine Nachhaltigkeitsprüfung gegeben. Die Bundesregierung hat keine Nachhaltigkeitsprüfung durchgeführt.'))
class PublicNwiContext(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  spec=importlib.util.spec_from_file_location('architecture',Path(__file__).resolve().parents[2]/'tools/check_state_sustainability_architecture.py')
  cls.checker=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.checker)
 def test_toc_duplicate_uses_its_authored_body_definition(self):
  self.assertEqual(self.checker.unqualified_public_nwi_offsets('<nav>NWI</nav><main>Nationaler Wohlfahrtsindex (NWI)</main>'),[])
 def test_nav_definition_cannot_excuse_unqualified_body_claim(self):
  self.assertTrue(self.checker.unqualified_public_nwi_offsets('<nav>Nationaler Wohlfahrtsindex</nav><main>NWI ist unser Modell.</main>'))
 def test_current_model_spelling_is_unambiguous(self):
  self.assertEqual(self.checker.unqualified_public_nwi_offsets('<main>WÖk-Netto-Wirkungsindex</main>'),[])
class QualifiedPublicationNotice(unittest.TestCase):
 def test_already_qualified_publication_keeps_its_body_without_false_historical_note(self):
  spec=importlib.util.spec_from_file_location('names',Path(__file__).resolve().parents[2]/'tools/apply_nwi_disambiguation.py')
  names=importlib.util.module_from_spec(spec);spec.loader.exec_module(names)
  with tempfile.TemporaryDirectory()as directory:
   names.ROOT=Path(directory);p=names.ROOT/'bibliothek/example/index.html';p.parent.mkdir(parents=True)
   text='<main>WÖk-Netto-Wirkungsindex und Nationaler Wohlfahrtsindex (NWI)</main>';p.write_text(text)
   self.assertEqual(names.apply_html(),(0,0));self.assertEqual(p.read_text(),text)
   p.write_text('<main>NWI ist unser WÖk-Modell.</main>')
   self.assertEqual(names.apply_html(),(0,1));self.assertIn(names.MARKER_START,p.read_text())
if __name__=='__main__':unittest.main()

"""Publication cleanup must preserve numbers, working links and form fields."""
import sys
import tempfile
import unittest
from pathlib import Path

import fitz
from pypdf import PdfReader
from reportlab.pdfgen.canvas import Canvas

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts' / 'quality'))
from publication_hygiene import scrub_pdf


class PublicationHygieneTest(unittest.TestCase):
    def test_visible_typography_metadata_privacy_and_interactivity(self):
        with tempfile.TemporaryDirectory() as directory:
            source=Path(directory)/'source.pdf';target=Path(directory)/'clean.pdf'
            canvas=Canvas(str(source),invariant=1)
            canvas.setAuthor('Textverarbeitung')
            canvas.drawString(40,780,'Beispiel \u2013 Ergebnis: 50 - 10 = 40')
            canvas.drawString(40,40,'file:///var/folders/example/document.html')
            canvas.linkURL('https://committee.iso.org/sites/tc258/home/projects.html',(40,720,300,740),relative=0)
            canvas.linkURL('file:///var/folders/example/document.html',(40,35,330,50),relative=0)
            canvas.acroForm.textfield(name='amount',value='25',x=40,y=650,width=150,height=25)
            canvas.save()
            result=scrub_pdf(source,target)
            self.assertTrue(result['textPreserved'])
            self.assertEqual(PdfReader(target).get_fields()['amount']['/V'],'25')
            with fitz.open(target) as doc:
                self.assertIn('Beispiel - Ergebnis: 50 - 10 = 40',doc[0].get_text())
                self.assertNotIn('file:',doc[0].get_text())
                self.assertEqual([link['uri'] for link in doc[0].get_links()],['https://committee.iso.org/sites/tc258/home/projects.html'])
                self.assertEqual(doc.metadata['author'],'Natalie Weber')
                self.assertEqual(doc.metadata['creator'],'Natalie Weber')


if __name__=='__main__':unittest.main()

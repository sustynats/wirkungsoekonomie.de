import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'scripts/library'))
from pdf_reader_sections import ReaderSections

class Page:
    def __init__(self,text): self.text=text
    def get_text(self,kind=None): return {'blocks':[]} if kind=='dict' else self.text
class PDF(list):
    def get_toc(self,*args): return []
class SectionsTest(unittest.TestCase):
    def test_shared_page_wrapped_heading_and_repeated_labels(self):
        pdf=PDF([Page('Kapitel A\nEinleitung A.\nVorgehen\nNur A.\nKapitel B\nEinleitung B.\nVorgehen\nNur B.\nEine lange\nÜberschrift\nEnde B.')])
        chapters=[{'title':'Kapitel A','page':0,'subs':[{'title':'Vorgehen','page':0}]},{'title':'Kapitel B','page':0,'subs':[{'title':'Vorgehen','page':0},{'title':'Eine lange Überschrift','page':0}]}]
        ReaderSections(pdf).partition(chapters)
        self.assertEqual([b[1].strip() for b in chapters[0]['blocks']],['Einleitung A.','Nur A.'])
        self.assertEqual([b[1].strip() for b in chapters[1]['blocks']],['Einleitung B.','Nur B.','Ende B.'])
    def test_missing_heading_is_not_silently_published(self):
        with self.assertRaises(ValueError):ReaderSections(PDF([Page('Text')])).partition([{'title':'Fehlt','page':0,'subs':[]}])
if __name__=='__main__': unittest.main()

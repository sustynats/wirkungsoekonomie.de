import importlib.util,tempfile,unittest
from pathlib import Path
import pymupdf
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('publishing',ROOT/'scripts/quality/check-pdf-publishing-metadata.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class PublishingMetadata(unittest.TestCase):
    def test_tool_metadata_is_removed_and_real_article_text_preserved(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'publication.pdf';pdf=pymupdf.open();pdf.new_page().insert_text((40,40),'Research on OpenAI systems. Historic formula 2 * 3.');pdf.set_metadata({'author':'ChatGPT','creator':'OpenAI Codex','title':'Publication'});pdf.save(path);pdf.close()
            result=module.correct(path,True)
            self.assertTrue(result['renderedPagesUnchanged']);pdf=pymupdf.open(path)
            self.assertEqual(pdf.metadata['author'],'Natalie Weber');self.assertIn('Research on OpenAI systems',pdf[0].get_text());self.assertIn('2 * 3',pdf[0].get_text());self.assertNotIn('OpenAI',str(pdf.metadata))
            self.assertFalse(module.correct(path,False)['issues'])
    def test_institute_author_remains(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'publication.pdf';pdf=pymupdf.open();pdf.new_page();pdf.set_metadata({'author':module.PUBLISHER});pdf.save(path);pdf.close();before=path.read_bytes()
            self.assertFalse(module.correct(path,True)['issues']);self.assertEqual(before,path.read_bytes())
    def test_custom_info_production_mark_is_removed_without_losing_revision_marker(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'publication.pdf';pdf=pymupdf.open();pdf.new_page();pdf.set_metadata({'author':module.AUTHOR})
            xref,_=module.info_fields(pdf);pdf.xref_set_key(xref,'EditorialTool','(OpenAI Codex)');pdf.xref_set_key(xref,'WOEKMethodRevision','(approved-source-v1.1)');pdf.save(path);pdf.close()
            self.assertIn('production-tool-custom-info',module.correct(path,True)['issues'])
            checked=pymupdf.open(path);_,info=module.info_fields(checked)
            self.assertEqual(info['EditorialTool'],('null','null'));self.assertEqual(info['WOEKMethodRevision'][1],'approved-source-v1.1');self.assertFalse(module.correct(path,False)['issues']);self.assertNotIn(b'OpenAI Codex',path.read_bytes())
    def test_xmp_author_is_corrected_without_erasing_unrelated_source_metadata(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'publication.pdf';pdf=pymupdf.open();pdf.new_page().insert_text((40,40),'Reference text retained.');pdf.set_metadata({'author':module.AUTHOR})
            pdf.set_xml_metadata('''<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator><rdf:Seq><rdf:li>Unspecified author</rdf:li></rdf:Seq></dc:creator><dc:title><rdf:Alt><rdf:li xml:lang="x-default">Reference title</rdf:li></rdf:Alt></dc:title></rdf:Description></rdf:RDF></x:xmpmeta>''');pdf.save(path);pdf.close()
            result=module.correct(path,True);self.assertIn('publication-author-xmp',result['issues']);self.assertTrue(result['renderedPagesUnchanged'])
            checked=pymupdf.open(path);self.assertEqual(module.xmp_authors(checked.get_xml_metadata()),[module.AUTHOR]);self.assertIn('Reference title',checked.get_xml_metadata());self.assertIn('Reference text retained.',checked[0].get_text());self.assertFalse(module.correct(path,False)['issues'])
if __name__=='__main__':unittest.main()

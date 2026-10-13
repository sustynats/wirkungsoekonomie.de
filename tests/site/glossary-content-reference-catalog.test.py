import importlib.util,tempfile,unittest,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('catalog',ROOT/'scripts/glossary/build-content-reference-catalog.py');catalog=importlib.util.module_from_spec(spec);spec.loader.exec_module(catalog)
class ContentReferenceCatalog(unittest.TestCase):
    def test_public_reference_survives_a_missing_or_conflicting_search_cache(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary);page=root/'wirkungsfelder/produkte-konsum/index.html';page.parent.mkdir(parents=True);page.write_text('<html><head><meta name="search_type" content="Bereich"><meta name="description" content="Geprüfte Produktfolgen."></head><body><main><h1>Produkte &amp; Konsum</h1><p>Materielle Folgen für Arbeit, Klima und Gesundheit.</p></main></body></html>')
            before=catalog.entries(root);cache=root/'assets/search/search-index.json';cache.parent.mkdir(parents=True)
            cache.write_text(json.dumps([{'url':'/wirkungsfelder/produkte-konsum/','title':'Stale conflicting title','body':'Wrong cached meaning'}]))
            self.assertEqual(before,catalog.entries(root));self.assertEqual(before[0]['url'],'/wirkungsfelder/produkte-konsum/');self.assertEqual(before[0]['title'],'Produkte & Konsum');self.assertEqual(before[0]['description'],'Geprüfte Produktfolgen.')
    def test_redirect_and_private_files_are_excluded_but_historic_sources_remain_linkable(self):
        with tempfile.TemporaryDirectory() as temporary:
            root=Path(temporary)
            for route,head in [('alias','<meta http-equiv="refresh" content="0; url=/current/">'),('docs',''),('original','<meta name="robots" content="noindex">')]:
                p=root/route/'index.html';p.parent.mkdir();p.write_text('<html><head>'+head+'</head><main><h1>Original source</h1></main></html>')
            self.assertEqual([e['url'] for e in catalog.entries(root)],['/original/'])
if __name__=='__main__':unittest.main()

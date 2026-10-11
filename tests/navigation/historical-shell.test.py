import unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools'))
from historical_navigation_shell import protected_publication,Components
ROOT=Path(__file__).resolve().parents[2]
class HistoricalShell(unittest.TestCase):
    def test_publication_footer_and_header_are_never_removed(self):
        html='<header class="site-header">global</header><main><article><header>Title</header><footer class="footer">Original source and formula 2 * 3</footer></article></main><footer class="footer">global</footer>'
        ranges=Components(html).ranges
        self.assertEqual([kind for _,_,kind in ranges],['header','footer'])
        remaining=html
        for start,end,_ in sorted(ranges,reverse=True):remaining=remaining[:start]+remaining[end:]
        self.assertIn('Original source and formula 2 * 3',remaining)
    def test_modified_component_is_rejected(self):
        import json,subprocess
        parts=json.loads(subprocess.check_output(['node','scripts/site/render-site-shell.mjs','--json'],cwd=ROOT,text=True))
        original=parts['header']+'<main><p>Historic formula 2 * 3.</p></main>'+parts['footer']
        _,protected=protected_publication(original,original,'index.html',ROOT)
        self.assertIn('Historic formula 2 * 3',protected)
        with self.assertRaises(AssertionError):protected_publication(original,original.replace('Wirkungsökonomie Startseite','Arbitrary change'),'index.html',ROOT)
        _,changed=protected_publication(original,original.replace('2 * 3','2 * 4'),'index.html',ROOT)
        self.assertIn('2 * 4',changed)
        self.assertNotEqual(protected,changed)
if __name__=='__main__':unittest.main()

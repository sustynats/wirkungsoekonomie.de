import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('navigation_report', Path(__file__).resolve().parents[2] / 'scripts/quality/navigation-report.py')
report = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report)


class NavigationReportTests(unittest.TestCase):
    def test_authored_graph_and_delivered_indexes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            def put(name, text):
                file = root / name
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_text(text)
            put('index.html', "<html lang='de'><a href='bereich/'>Bereich</a><a href='alt.html'>Alt</a><footer class='footer'>F</footer></html>")
            put('bereich/index.html', "<main id='inhalt'><a href='detail/'>Detail</a><a href='nicht%20sichtbar/'>Nicht sichtbar</a></main><script src='../assets/js/main.js'></script><footer class='article-footer'>Kein globaler Footer</footer>")
            put('bereich/detail/index.html', '<main id="main"><a class="skip-link" href="#main">Inhalt</a></main><footer class="footer">F</footer>')
            put('bereich/nicht sichtbar/index.html', '<meta name="robots" content="noindex"><footer class="footer">F</footer>')
            put('nur-js/index.html', '<main>Kein statischer Link auf diese Seite</main>')
            put('alt.html', '<meta http-equiv="refresh" content="0;url=/bereich/">')
            put('admin/privat/index.html', '<main>Privat</main>')
            put('assets/js/main.js', 'skipLink.href = "#main-content";')
            put('sitemap.xml', '<sitemapindex><sitemap><loc>https://wirkungsoekonomie.de/maps/bereich.xml</loc></sitemap></sitemapindex>')
            put('maps/bereich.xml', '<urlset><url><loc>https://wirkungsoekonomie.de/bereich/detail/</loc></url></urlset>')
            put('assets/search/browser-index-manifest.json', '{"json":"part.json"}')
            put('assets/search/part.json', json.dumps([{'url': '/bereich/detail/'}, {'url': '/alt.html'}]))
            result = report.measure(root)
            self.assertEqual(result['counts']['indexable'], 4)
            self.assertEqual(result['unreachable'], ['/nur-js/'])
            self.assertEqual(result['counts']['sitemapCoverage'], 1)
            self.assertEqual(result['counts']['searchCoverage'], 1)
            self.assertEqual(result['counts']['redirectsInSearch'], 1)
            self.assertEqual(result['brokenSkipLinks'], ['/bereich/'])
            self.assertEqual(result['counts']['withoutFooter'], 2)
            self.assertEqual(result['hubs']['/bereich/']['linkedModules'], 1)
            self.assertEqual(result['counts']['linksToRedirects'], 1)
            self.assertNotIn(directory, json.dumps(result))

    def test_shell_hash_ignores_base_and_current_page_but_not_menu(self):
        a = '<header class="site-header"><a href="../verstehen/" aria-current="page">Verstehen</a></header>'
        b = '<header class="site-header"><a href="../../verstehen/">Verstehen</a></header>'
        self.assertEqual(report.shell_hash(a, 'header', '/fuer/'), report.shell_hash(b, 'header', '/fuer/unternehmen/'))
        self.assertNotEqual(report.shell_hash(a, 'header', '/fuer/'), report.shell_hash(b.replace('Verstehen', 'Andere'), 'header', '/fuer/unternehmen/'))
        self.assertIsNone(report.shell_hash('<footer class="article-footer">Artikel</footer>', 'footer', '/'))

    def test_regression_gate_uses_coverage_not_index_growth(self):
        counts = dict(indexable=10, unreachable=0, withoutFooter=0, redirectsInSearch=0, brokenSkipLinks=0, multipleCurrentPages=0, linksToRedirects=0, withinThreeClicks=10, sitemapCoverage=10, searchCoverage=10)
        before = {'counts': counts, 'variants': {'header': {'de': {'a': 10}}, 'footer': {'de': {'a': 10}}}}
        after = {'counts': dict(counts, indexable=20, withinThreeClicks=20, sitemapCoverage=20, searchCoverage=20), 'variants': before['variants']}
        self.assertEqual(report.regressions(before, after), [])
        after['counts']['searchCoverage'] = 19
        self.assertIn('searchCoverage: coverage decreased', report.regressions(before, after))


if __name__ == '__main__':
    unittest.main()

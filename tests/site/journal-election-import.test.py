"""Publication contract: preserve the supplied article, sources and own share image."""
import importlib.util
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
import unittest
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("journal_import", ROOT / "scripts/import/import-tv-duell-wirkungsoekonomische-systemanalyse.py")
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)
ARTICLE = next(a for a in module.ARTICLES if a.kind == "election_result_saxony_anhalt")


class Text(HTMLParser):
    def __init__(self, value):
        super().__init__()
        self.parts = []
        self.feed(value)

    def handle_data(self, value):
        self.parts.append(value)

    def handle_endtag(self, tag):
        if tag in {"p", "li", "h2", "h3", "blockquote"}:
            self.parts.append(" ")


def normal(value):
    return re.sub(r"\s+", " ", value).strip()


class JournalImportTest(unittest.TestCase):
    def test_complete_author_text_and_quotes(self):
        rendered = normal("".join(Text(module.article_content(ARTICLE)).parts))
        with ZipFile(ARTICLE.source) as source:
            body = ET.fromstring(source.read("word/document.xml")).find("w:body", module.NS)
        active = False
        count = 0
        for child in body:
            if module.paragraph_style(child) == "Heading1":
                active = True
            if not active and child.tag != module.W + "tbl":
                continue
            paragraphs = child.findall(".//w:tc/w:p", module.NS) if child.tag == module.W + "tbl" else [child]
            for paragraph in paragraphs:
                value = module.paragraph_text(paragraph)
                value = re.sub(r"^\d+\.\s*", "", value)
                if value:
                    self.assertIn(normal(value), rendered)
                    count += 1
        self.assertGreater(count, 90)

    def test_sources_and_quote_semantics(self):
        content = module.article_content(ARTICLE)
        self.assertEqual(content.count("<li>"), 17)
        self.assertEqual(content.count("<blockquote>"), 2)
        self.assertNotIn("<table", content)
        self.assertNotRegex(content.lower(), r"utm_|chatgpt|redaktionelle anweisung|/users/")

    def test_live_page_contract(self):
        page = (ROOT / "blog" / f"{ARTICLE.slug}.html").read_text()
        self.assertIn(f'/assets/img/blog/{ARTICLE.image_name}', page)
        self.assertIn(f'../assets/pdf/journal/{ARTICLE.slug}.pdf', page)
        self.assertIn('journal-breadcrumb', page)
        self.assertIn('Von Natalie Weber', page)
        self.assertIn('https://wirkungsoekonomie.de/wirkungsticker/analyse/wenn-aus-programm-staatsmacht-wird-sachsen-anhalt/', page)


if __name__ == "__main__":
    unittest.main()

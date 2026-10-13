"""Bibliography representations and failures found during the book review."""
from pathlib import Path
import importlib.util
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('references', ROOT / 'scripts/publications/audit-consistency-book-references.py')
references = importlib.util.module_from_spec(spec)
spec.loader.exec_module(references)


def paragraph(text):
    return '<w:p><w:r><w:t>' + text + '</w:t></w:r></w:p>'


def inventory(body):
    xml = ('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
           '<w:body>' + body + '</w:body></w:document>')
    return references.inventory(xml.encode())


class ReferenceIntegrity(unittest.TestCase):
    def test_definition_in_structured_tag_and_following_paragraph(self):
        body = ('<w:sdt><w:sdtContent>' + paragraph('[E-K30-1]') +
                paragraph('The original source in a structured field.') + '</w:sdtContent></w:sdt>' +
                paragraph('Use [E-K30-1].'))
        row = inventory(body)
        self.assertEqual(row['definitions']['E-K30-1'][0]['text'], 'The original source in a structured field.')
        references.validate({'I': row})

    def test_unresolved_identifier_is_rejected(self):
        with self.assertRaisesRegex(RuntimeError, 'missing='):
            references.validate({'I': inventory(paragraph('Use [E-K30-9].'))})

    def test_repeated_definition_is_rejected(self):
        with self.assertRaisesRegex(RuntimeError, 'duplicate='):
            references.validate({'I': inventory(paragraph('[E-K30-1] Source A') + paragraph('[E-K30-1] Source B'))})

    def test_empty_definition_is_rejected(self):
        with self.assertRaisesRegex(RuntimeError, 'empty='):
            references.validate({'I': inventory(paragraph('[E-K30-1]'))})

    def test_shared_reference_requires_explicit_reader_note(self):
        with self.assertRaisesRegex(RuntimeError, 'undocumented cross-volume'):
            references.validate({'I': inventory(paragraph('[I-V-1] Common source')),
                                 'II': inventory(paragraph('Use [I-V-1].'))})

    def test_documented_common_reference_resolves_to_band_i(self):
        rows = references.validate({'I': inventory(paragraph('[I-V-1] Common source')),
                                    'II': inventory(paragraph(references.CROSS_VOLUME_NOTE) + paragraph('Use [I-V-1].'))})
        self.assertEqual(rows[1]['sharedReferencesResolvedToBandI'], ['I-V-1'])


if __name__ == '__main__':
    unittest.main()

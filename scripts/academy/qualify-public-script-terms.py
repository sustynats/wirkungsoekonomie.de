"""Qualify current model names, preserving explicit discussion of acronyms."""
from pathlib import Path
import importlib.util,json,sys,re
spec=importlib.util.spec_from_file_location('public_nwi',Path(__file__).resolve().parents[2]/'tools/apply_nwi_disambiguation.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def qualify(text):
 blocks=[]
 for block in text.split('\n\n'):
  # A discussion of the abbreviation must still name that abbreviation.
  if re.search(r'Wohlfahrtsindex|Wohlfahrtsdiskurs|Abkürzung|Kurzbezeichnung|Kurzform|NWI-Verwendung',block,re.I):
   block=block.replace('die NWI-Abkürzungskollision disambiguieren.', 'die Abkürzung NWI für den Nationalen Wohlfahrtsindex vom WÖk-Netto-Wirkungsindex unterscheiden.')
   block=block.replace('Die Abkürzung NWI ist im deutschen Wohlfahrtsdiskurs etabliert.', 'Die Abkürzung NWI für den Nationalen Wohlfahrtsindex ist im deutschen Wohlfahrtsdiskurs etabliert.')
   blocks.append(block)
  else:blocks.append(module.replace_living_copy(block))
 return '\n\n'.join(blocks)
print(json.dumps([qualify(text)for text in json.load(sys.stdin)],ensure_ascii=False))

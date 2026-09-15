"""Idempotently register the reviewed supplement in the existing glossary builder."""
from pathlib import Path
p=Path('scripts/glossary/build-glossary-registry.mjs')
s=p.read_text()
new_import="import { applyLearningSupplement } from './apply-learning-supplement.mjs';\n"
if new_import not in s:
 s=new_import+s
entry='  path.join(root, "content/glossary/imports/finanzierung-evidenz-2026-09-15.json"),\n'
if entry not in s:
 marker='const supplementSources = [\n'
 if s.count(marker)!=1: raise SystemExit('Unexpected supplement list; refusing source rewrite')
 s=s.replace(marker,marker+entry,1)
old='const terms = dedupeCanonicalLabels(rawTerms.map(normalizeTerm))\n  .map(applyCanonicalTermOverride)\n'
new='const terms = applyLearningSupplement(dedupeCanonicalLabels(rawTerms.map(normalizeTerm))\n  .map(applyCanonicalTermOverride), root)\n'
if new not in s:
 if s.count(old)!=1:raise SystemExit('Unexpected canonical boundary; refusing source rewrite')
 s=s.replace(old,new,1)
p.write_text(s)
print('Glossary import registered after canonical overrides.')

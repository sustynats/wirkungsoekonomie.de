#!/usr/bin/env python3
"""Fail-closed input fixes. Preserve the published T-SROI v1.1 formula.

Apply from the repository root. Idempotent, narrow changes only. Existing test
fixtures acquire explicit model assumptions; no expected result is changed.
"""
from pathlib import Path
import re

p = Path('assets/js/impact-calculations.js')
s = p.read_text()
marker = '// consistency-20261009: missing inputs are not neutral observations.'
if marker not in s:
    s=s.replace('  const MIN_DATA_QUALITY = 0.6;', '  '+marker+'\n  const MIN_DATA_QUALITY = 0.6;', 1)
    start=s.index('  function calculateFinalScore(')
    end=s.index('  function isExplicitFiniteNumber(', start)
    s=s[:start]+'''  function calculateFinalScore(scores, redLineActive = false) {
    const entries = Object.entries(scores || {});
    if (redLineActive === true) {
      return { finalScore: -3, weakestField: "rote Linie", status: "blocked",
        explanation: "Eine rote Linie blockiert die positive Gesamtbehauptung. Gute Werte in anderen Feldern heben sie nicht auf." };
    }
    const invalid = entries.filter(([, value]) => !isScoreValue(value));
    if (!entries.length || invalid.length) {
      return { finalScore: null, weakestField: invalid.map(([key]) => key).join(", ") || "nicht gesetzt", status: "unassessed",
        explanation: "Das Profil ist unvollständig oder enthält ungültige Werte. Fehlende Daten sind nicht der neutrale Wert 0." };
    }
    const values = entries.map(([, value]) => Number(value));
    const finalScore = Math.min(...values);
    return { finalScore, weakestField: entries[values.indexOf(finalScore)][0],
      status: finalScore > 0 ? "positive" : finalScore === 0 ? "neutral" : "critical",
      explanation: "Der FinalScore folgt in diesem Modell der Reverse Merit Order: Das schwächste dokumentierte Kernfeld begrenzt die Gesamtbewertung." };
  }

  function calculateNWI({ positive, negative, redLineActive = false, gatePassed = false } = {}) {
    const complete = isExplicitFiniteNumber(positive) && Number(positive) >= 0 && isExplicitFiniteNumber(negative);
    const raw = complete ? Number(positive) - Math.abs(Number(negative)) : null;
    if (!complete || !Number.isFinite(raw) || redLineActive || gatePassed !== true) {
      return { raw, nwi: null, status: "blocked",
        explanation: !complete
          ? "Die Profilwerte sind nicht vollständig dokumentiert. Fehlende Daten werden nicht mit 0 ersetzt."
          : "Der Rohwert bleibt für die Prüfung sichtbar; bei geschlossenem Schutz-Gate wird keine positive Netto-Wirkung ausgewiesen." };
    }
    return { raw, nwi: raw, status: raw > 0 ? "tragfaehig" : raw === 0 ? "neutral" : "kritisch",
      explanation: "Der WÖk-Netto-Wirkungsindex ist eine dimensionsgleiche Netto-Differenz. Datenqualität wird ausgewiesen, aber weder Schäden noch Punkte werden damit multipliziert." };
  }

'''+s[end:]
    # Undefined properties must fail the existing explicit validation just as null/blank do.
    a=s.index('  function calculateTSROI({')
    b=s.index('  } = {}) {',a)
    signature=s[a:b]
    signature=re.sub(r'\b(investment|annualDirectBenefit|annualTransformativeBenefit|annualHarm|annualOperatingCost|years|benefitDiscountRate|attribution|deadweight|displacement|uncertainty) = (?:0\.05|[01]),',r'\1,',signature)
    s=s[:a]+signature+s[b:]
    p.write_text(s)

p=Path('scripts/quality/check-tool-examples.mjs')
s=p.read_text()
if 'const explicitModelAssumptions20261009' not in s:
    # Make former documented/default model assumptions explicit in the old fixtures.
    # Missing-value regression tests call the public API directly without this helper.
    s=s.replace('const calc = sandbox.module.exports;', '''const calc = sandbox.module.exports;
// Explicit assumptions of these historical learning fixtures, not defaults for user data.
const explicitModelAssumptions20261009 = {
  annualTransformativeBenefit: 0, annualHarm: 0, annualOperatingCost: 0,
  benefitDiscountRate: 0.05, attribution: 1, deadweight: 0, displacement: 0,
  uncertainty: 0,
};
const modelTSROI = (input) => calc.calculateTSROI({ ...explicitModelAssumptions20261009, ...input });''')
    s=s.replace('calc.calculateTSROI({','modelTSROI({')
    s=s.replace('const modelTSROI = (input) => modelTSROI({','const modelTSROI = (input) => calc.calculateTSROI({')
    p.write_text(s)
print('Installed explicit-input and neutral/open separation fixes; formula unchanged.')
